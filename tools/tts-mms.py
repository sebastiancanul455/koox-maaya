#!/usr/bin/env python3
"""Voz sintética aproximada para Ko'ox Maaya con Meta MMS-TTS (facebook/mms-tts-yua) y control de calidad
automático con el reconocedor Meta MMS-1B-all (adaptador «yua»).

Qué hace (reproducible: semillas fijas; sin red una vez que los modelos están en disco):
  1. textos     Carga src/content/u*.js con node (en un vm, como test/validate.cjs) y arma la lista de textos
                mayas únicos: cada palabra (vocab.m), cada ejemplo (ex.m), cada línea de diálogo y los ejemplos
                de la guía (COURSE.guide.alphabet[].ex.m). Se agrupan con la misma normalización con la que la
                app busca un audio por texto (normalize de src/app.js), así un audio sirve en todos los lugares
                donde aparece el mismo texto. Quita lo que no se pronuncia (…, ___, rayas entre turnos).
  2. ortografía El tokenizador de mms-tts-yua solo conoce a-z, ', á é í ó ú ñ y el espacio (descarta la
                puntuación). Sus datos de entrenamiento (lecturas bíblicas) escriben /k/ «c»/«qu», /k'/ «k»,
                /ts/ «tz» y /ts'/ «dz»; con la «k» del INALI el modelo tiende a decir /k'/. a_biblica() convierte
                la entrada (--ortografia inali la desactiva).
  3. síntesis   N tomas por texto (semillas 0..N-1, velocidad 1.0); en textos de 1–2 palabras, además N tomas a
                velocidad 0.85. (Una variante «con punto final» no sirve: da exactamente los mismos tokens.)
  4. control    Transcribe cada toma con mms-1b-all/yua a 16 kHz y calcula el CER contra el texto del curso:
                la salida del reconocedor se pasa a ortografía INALI (a_inali) y ambas se comparan en
                minúsculas, sin puntuación, sin espacios y sin acentos de tono (el saltillo ' sí cuenta).
                Se queda con la toma de menor CER; la acepta si CER <= 0.30 (3+ palabras) o <= 0.40 (1–2).
  5. salida     <trabajo>/wav/<key>.wav (aceptados), <trabajo>/rechazados/<key>.wav (mejor toma de los
                rechazados, solo para revisarla de oído), <trabajo>/textos.json, <trabajo>/tomas*.jsonl (todas
                las tomas con su transcripción y CER) y el lote --spec para tools/audio-import.mjs: kind
                "sintetico", key s-<vocabId> (palabra), s-ex-<vocabId> (ejemplo), s-dlg-<lección>-<n> (diálogo)
                o s-guia-<slug>; vocab = [id] solo en las palabras; text = el texto exacto del curso.

Uso (desde la raíz del repositorio):
  python3 tools/tts-mms.py --trabajo /ruta/trabajo --spec /ruta/tts-spec.json \
      [--tts facebook/mms-tts-yua] [--asr facebook/mms-1b-all] [--tomas 4] [--hilos 2] [--parte 0/2]
  node tools/audio-import.mjs --spec /ruta/tts-spec.json && node test/validate.cjs

--tts y --asr aceptan un id del Hub de Hugging Face o una carpeta local en formato transformers (por ejemplo,
convertida de los checkpoints originales de dl.fbaipublicfiles.com/mms si el CDN del Hub no está disponible).
--parte i/n reparte el trabajo entre n procesos (cada uno escribe tomas-i.jsonl); una última llamada sin
--parte junta todo y escribe el lote. Es reanudable: no repite los textos que ya están en tomas*.jsonl.
Requisitos: python >= 3.10, torch, transformers, numpy, scipy, soundfile; node para leer el curso.
No contiene datos ni modelos. Los modelos son de Meta AI con licencia CC BY-NC 4.0 (uso no comercial).
El resultado es una voz aproximada: el control automático no evalúa el tono ni el saltillo con fiabilidad
y no sustituye la revisión de un hablante.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import time
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# ---------------------------------------------------------------- textos ----------------------------------------
DUMP_JS = r"""
const fs = require("fs"), path = require("path"), vm = require("vm");
const dir = path.join(process.argv[1], "src/content");
const files = fs.readdirSync(dir).filter((f) => /^u\d+\.js$/.test(f))
  .sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10));
const sb = { window: {}, console: { log() {}, warn() {}, error() {} } };
vm.createContext(sb);
for (const f of files) vm.runInContext(fs.readFileSync(path.join(dir, f), "utf8"), sb, { filename: f, timeout: 2000 });
process.stdout.write(JSON.stringify(sb.window.COURSE));
"""

APOS = re.compile(r"[’‘ʼ´`′ʻ‛ʹ＇՚ˈ]")


def norm_app(s: str) -> str:
    """La misma normalización que src/app.js normalize(): la app busca el audio de un texto con ella."""
    s = unicodedata.normalize("NFC", APOS.sub("'", s)).lower()
    s = re.sub(r"[\u2010-\u2015]", "-", s)
    s = re.sub(r"[¿?¡!.,;:\"“”«»()…]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def texto_tts(s: str) -> str:
    """Texto para el sintetizador: quita lo que no se pronuncia (…, ___, rayas entre turnos).

    El tokenizador de mms-tts-yua solo conoce minúsculas, ', á é í ó ú ñ y el espacio: descarta toda la
    puntuación (comprobado: «sak», «sak.» y «Sak!» dan los mismos tokens). La puntuación se deja por legibilidad.
    """
    s = unicodedata.normalize("NFC", APOS.sub("'", s))
    s = re.sub(r"_{2,}", " ", s)
    s = re.sub(r"\s*…\s*$", "", s)             # «In k'aaba'e' …» -> «In k'aaba'e'» (hueco para un nombre)
    s = re.sub(r"\s*…\s*", ", ", s)             # pausas internas -> coma
    s = re.sub(r"\s+[\u2013\u2014]\s+", " ", s)    # «Bix a beel? — Ma'alob.»: dos turnos
    s = re.sub(r",\s*,", ",", s)
    return re.sub(r"\s+", " ", s).strip(" ,")


def a_biblica(s: str) -> str:
    """INALI 2014 -> ortografía de los datos de entrenamiento de MMS (lecturas bíblicas en yua).

    Los textos de entrenamiento de mms-tts-yua (y de mms-1b-all/yua) escriben /k/ como «c» (y «qu» ante e, i),
    /k'/ como «k», /ts/ como «tz» y /ts'/ como «dz». Si se le da «k» en INALI, el sintetizador la lee como su
    «k» (= /k'/ glotalizada). Por eso se convierte antes de sintetizar. ch, ch', p', t', j, x, ', los acentos y
    las vocales dobles se dejan igual.
    """
    s = s.lower()
    s = s.replace("ts'", "\x01").replace("ts", "tz").replace("\x01", "dz")
    s = s.replace("k'", "\x02")
    s = re.sub(r"k(?=[eéií])", "qu", s)
    s = s.replace("k", "c")
    return s.replace("\x02", "k")


def slug(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower()).replace("'", "")
    s = re.sub(r"[\u0300-\u036f]", "", s)
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def cargar_curso(repo: Path) -> dict:
    out = subprocess.run(["node", "-e", DUMP_JS, str(repo)], check=True, capture_output=True, text=True).stdout
    return json.loads(out)


def armar_textos(curso: dict) -> list[dict]:
    """Lista de textos únicos con todos sus orígenes y la key del catálogo que les toca."""
    origenes = []
    for u in curso["units"]:
        for l in u["lessons"]:
            for v in l["vocab"]:
                origenes.append({"tipo": "vocab", "unitId": u["id"], "lessonId": l["id"], "vocabId": v["id"], "m": v["m"]})
                if v.get("ex"):
                    origenes.append({"tipo": "ejemplo", "unitId": u["id"], "lessonId": l["id"], "vocabId": v["id"],
                                     "m": v["ex"]["m"]})
            d = l.get("dialogue")
            if d:
                for i, ln in enumerate(d["lines"], 1):
                    origenes.append({"tipo": "dialogo", "unitId": u["id"], "lessonId": l["id"], "linea": i, "m": ln["m"]})
    for a in (curso.get("guide") or {}).get("alphabet", []):
        if a.get("ex"):
            origenes.append({"tipo": "guia", "unitId": "u1", "lessonId": None, "letra": a["l"], "m": a["ex"]["m"]})
    prio = {"vocab": 0, "ejemplo": 1, "dialogo": 2, "guia": 3}
    grupos: dict[str, list[dict]] = {}
    for o in origenes:
        grupos.setdefault(norm_app(o["m"]), []).append(o)
    textos = []
    for k, os_ in grupos.items():
        os_.sort(key=lambda o: prio[o["tipo"]])
        p = os_[0]
        key = {"vocab": lambda: "s-" + p["vocabId"], "ejemplo": lambda: "s-ex-" + p["vocabId"],
               "dialogo": lambda: "s-dlg-" + p["lessonId"] + "-" + str(p["linea"]),
               "guia": lambda: "s-guia-" + slug(p["m"])}[p["tipo"]]()
        t = texto_tts(p["m"])
        textos.append({"key": key, "text": p["m"], "textoTts": t, "normApp": k,
                       "palabras": len([w for w in norm_app(t).split(" ") if w]), "unidad": p["unitId"],
                       # vocab solo para las palabras: un ejemplo o una línea se encuentran por su texto
                       "vocab": [o["vocabId"] for o in os_ if o["tipo"] == "vocab"], "origenes": os_})
    keys = [t["key"] for t in textos]
    assert len(keys) == len(set(keys)), "keys repetidas"
    return textos


# ---------------------------------------------------------------- comparación (CER) -----------------------------
def a_inali(h: str) -> str:
    """Pasa la salida del reconocedor (ortografía de su corpus bíblico) a la ortografía INALI del curso.

    Observado en la salida de mms-1b-all/yua: usa «c» y «qu» para /k/ y «k» para /k'/ (convención colonial),
    «tz» para /ts/ y «dz» para /ts'/. Se convierte antes de comparar. (Ver el informe.)
    """
    h = h.replace("dz", "\x01").replace("tz", "ts").replace("z", "s")
    h = re.sub(r"k(?!')", "k'", h)                  # k colonial = k' (glotalizada)
    h = re.sub(r"qu(?=[eiéí])", "k", h)
    h = re.sub(r"c(?!h)", "k", h)
    return h.replace("\x01", "ts'")


def normalizar_cmp(s: str, tonos: bool = False, saltillo: bool = True) -> str:
    """Forma de comparación: minúsculas, sin puntuación ni espacios; sin acentos de tono salvo tonos=True;
    sin apóstrofos si saltillo=False."""
    s = unicodedata.normalize("NFC", APOS.sub("'", s)).lower()
    if not tonos:
        s = unicodedata.normalize("NFD", s.replace("ñ", "\x02"))
        s = unicodedata.normalize("NFC", re.sub(r"[\u0300-\u036f]", "", s)).replace("\x02", "ñ")
    s = re.sub(r"[^a-zñáéíóú']", "", s)
    if not saltillo:
        s = s.replace("'", "")
    return s


def lev(a: str, b: str) -> int:
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def cer(ref: str, hyp: str, **kw) -> float:
    r, h = normalizar_cmp(ref, **kw), normalizar_cmp(a_inali(normalizar_cmp(hyp, tonos=True)), **kw)
    return lev(r, h) / max(1, len(r))


def umbral(palabras: int) -> float:
    return 0.40 if palabras <= 2 else 0.30


# ---------------------------------------------------------------- modelos ---------------------------------------
class Modelos:
    def __init__(self, tts_id: str, asr_id: str, hilos: int):
        import torch
        from transformers import AutoProcessor, AutoTokenizer, VitsModel, Wav2Vec2ForCTC
        from transformers.utils import logging as hf_logging
        hf_logging.set_verbosity_error()
        torch.set_num_threads(hilos)
        self.torch = torch
        self.tok = AutoTokenizer.from_pretrained(tts_id)
        self.tts = VitsModel.from_pretrained(tts_id).eval()
        self.sr = self.tts.config.sampling_rate
        self.proc = AutoProcessor.from_pretrained(asr_id)
        self.proc.tokenizer.set_target_lang("yua")
        self.asr = Wav2Vec2ForCTC.from_pretrained(asr_id)
        self.asr.load_adapter("yua")
        self.asr.eval()

    def tokens(self, texto: str) -> str:
        ids = self.tok(texto).input_ids
        return self.tok.decode(ids)

    def sintetizar(self, texto: str, semilla: int, velocidad: float = 1.0):
        torch = self.torch
        self.tts.speaking_rate = velocidad
        torch.manual_seed(semilla)
        with torch.no_grad():
            w = self.tts(**self.tok(texto, return_tensors="pt")).waveform[0].numpy()
        self.tts.speaking_rate = 1.0
        return w

    def transcribir(self, w) -> str:
        import numpy as np
        from scipy.signal import resample_poly
        if self.sr != 16000:
            g = np.gcd(self.sr, 16000)
            w = resample_poly(w, 16000 // g, self.sr // g)
        inp = self.proc(w, sampling_rate=16000, return_tensors="pt")
        with self.torch.no_grad():
            lg = self.asr(**inp).logits
        return self.proc.decode(lg.argmax(-1)[0])


def variantes(t: dict, tomas: int) -> list[tuple[int, float]]:
    v = [(s, 1.0) for s in range(tomas)]
    if t["palabras"] <= 2:
        v += [(s, 0.85) for s in range(tomas)]
    return v


def evaluar(m: Modelos, t: dict, tomas: int, wav_dir: Path, ortografia: str = "biblica") -> dict:
    import numpy as np
    import soundfile as sf
    entrada = a_biblica(t["textoTts"]) if ortografia == "biblica" else t["textoTts"]
    res = []
    mejor, mejor_w = None, None
    for semilla, vel in variantes(t, tomas):
        w = m.sintetizar(entrada, semilla, vel)
        hyp = m.transcribir(w)
        r = {"semilla": semilla, "velocidad": vel, "hyp": hyp, "dur_s": round(len(w) / m.sr, 3),
             "cer": round(cer(t["text"], hyp), 4), "cer_tonos": round(cer(t["text"], hyp, tonos=True), 4),
             "cer_sin_saltillo": round(cer(t["text"], hyp, saltillo=False), 4)}
        res.append(r)
        # desempate: menor CER, luego menor CER estricto, luego velocidad normal, luego semilla menor
        clave = (r["cer"], r["cer_tonos"], vel != 1.0, semilla)
        if mejor is None or clave < mejor[0]:
            mejor, mejor_w = (clave, r), w
    b = mejor[1]
    ok = b["cer"] <= umbral(t["palabras"])
    # la toma aceptada va a wav/; la mejor toma de un texto rechazado se guarda aparte, solo para revisarla de oído
    destino = wav_dir if ok else wav_dir.parent / "rechazados"
    destino.mkdir(parents=True, exist_ok=True)
    sf.write(destino / (t["key"] + ".wav"), np.asarray(mejor_w, dtype=np.float32), m.sr, subtype="PCM_16")
    return {"key": t["key"], "entrada": entrada, "tokens": m.tokens(entrada), "tomas": res, "elegida": b,
            "umbral": umbral(t["palabras"]), "aceptado": ok}


# ---------------------------------------------------------------- lote para audio-import ------------------------
def spec_items(textos: list[dict], evals: dict, spec_path: Path, wav_dir: Path) -> list[dict]:
    items = []
    for t in textos:
        e = evals.get(t["key"])
        if not e or not e["aceptado"]:
            continue
        items.append({
            "input": os.path.relpath(wav_dir / (t["key"] + ".wav"), spec_path.parent),
            "key": t["key"], "kind": "sintetico", "lang": "yua", "text": t["text"], "vocab": t["vocab"], "letters": [],
            "author": "Meta AI (MMS-TTS)", "license": "CC BY-NC 4.0",
            "licenseUrl": "https://creativecommons.org/licenses/by-nc/4.0/",
            "source": "https://huggingface.co/facebook/mms-tts-yua",
            "notes": "Voz sintética generada con MMS-TTS (yua); aproximada: puede equivocarse en tono, saltillo y "
                     "glotalizadas. CER de control: " + format(e["elegida"]["cer"], ".2f"),
        })
    return items


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--repo", default=str(ROOT), help="raíz del repositorio (por omisión, la de este script)")
    ap.add_argument("--trabajo", required=True, help="carpeta de trabajo (textos, tomas, wav, rechazados)")
    ap.add_argument("--spec", required=True, help="ruta del lote JSON para tools/audio-import.mjs")
    ap.add_argument("--tts", default="facebook/mms-tts-yua", help="id del Hub o carpeta local del sintetizador")
    ap.add_argument("--asr", default="facebook/mms-1b-all", help="id del Hub o carpeta local del reconocedor")
    ap.add_argument("--tomas", type=int, default=4, help="tomas por texto y velocidad (semillas 0..N-1)")
    ap.add_argument("--hilos", type=int, default=2, help="hilos de CPU para torch")
    ap.add_argument("--solo", default="", help="keys separadas por comas (para pruebas)")
    ap.add_argument("--ortografia", choices=["biblica", "inali"], default="biblica",
                    help="cómo se escribe la entrada del sintetizador (ver a_biblica); por omisión, biblica")
    ap.add_argument("--parte", default="", help="i/n: procesa solo los textos i, i+n, … (para correr n procesos)")
    a = ap.parse_args(argv)
    trabajo = Path(a.trabajo); trabajo.mkdir(parents=True, exist_ok=True)
    wav_dir = trabajo / "wav"
    t0 = time.time()
    textos = armar_textos(cargar_curso(Path(a.repo)))
    json.dump({"total": len(textos), "textos": textos}, open(trabajo / "textos.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"{len(textos)} textos únicos", flush=True)
    evals: dict[str, dict] = {}
    for lf in sorted(trabajo.glob("tomas*.jsonl")):
        for line in lf.read_text(encoding="utf-8").splitlines():
            if line.strip():
                e = json.loads(line); evals[e["key"]] = e
    solo = set(filter(None, a.solo.split(",")))
    parte, partes = (int(x) for x in a.parte.split("/")) if a.parte else (0, 1)
    log = trabajo / ("tomas-%d.jsonl" % parte if a.parte else "tomas.jsonl")
    pend = [t for i, t in enumerate(textos) if i % partes == parte and t["key"] not in evals and (not solo or t["key"] in solo)]
    if pend:
        m = Modelos(a.tts, a.asr, a.hilos)
        with open(log, "a", encoding="utf-8") as f:
            for i, t in enumerate(pend, 1):
                e = evaluar(m, t, a.tomas, wav_dir, a.ortografia)
                e["texto"] = t["text"]
                evals[t["key"]] = e
                f.write(json.dumps(e, ensure_ascii=False) + "\n"); f.flush()
                b = e["elegida"]
                print(f"[{i}/{len(pend)}] {'OK ' if e['aceptado'] else 'NO '} {b['cer']:.2f} {t['text']!r} -> {b['hyp']!r}",
                      flush=True)
    spec = Path(a.spec)
    items = spec_items(textos, evals, spec, wav_dir)
    spec.write_text(json.dumps(items, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    acc = sum(1 for t in textos if evals.get(t["key"], {}).get("aceptado"))
    print(f"aceptados {acc} de {len(textos)}; lote: {spec} ({len(items)} audios); {time.time() - t0:.0f} s")
    return 0


if __name__ == "__main__":
    sys.exit(main())
