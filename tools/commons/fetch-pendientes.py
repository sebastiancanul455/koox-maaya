#!/usr/bin/env python3
"""Baja de Wikimedia Commons los audios pendientes de Ko'ox Maaya, comprueba su SHA-1 y, si se pide, los importa.

Son los 6 audios de commons-spec-pendientes.json que upload.wikimedia.org no dejó bajar (respondía 429):
dos sonidos de referencia del AFI ([tsʼ] y [tʃʼ], CC BY-SA 3.0) y cuatro grabaciones de hablantes nativos
(maayat'aan, tsíimin k'áak', Te' k'óom: CC BY-SA 4.0; p'uurux: CC0 1.0).

Uso (desde la raíz del repositorio; solo necesita Python 3.8+ y, para importar, node y ffmpeg):
  python3 -I tools/commons/fetch-pendientes.py              solo baja y verifica
  python3 -I tools/commons/fetch-pendientes.py --importar   además los importa con tools/audio-import.mjs
  python3 -I tools/commons/fetch-pendientes.py --solo n-puurux,n-te-koom --importar

Qué hace:
  1. Lee commons-spec-pendientes.json y sha1-map.json (SHA-1, tamaño y URL que publica Commons) de esta carpeta.
  2. Baja cada archivo a tools/commons/descargas/ (carpeta ignorada por git). Un solo intento por archivo y
     5 s entre peticiones; ante el primer 429 se detiene y dice cuándo reintentar (no reintenta en bucle).
  3. Guarda solo lo que coincide byte a byte con el SHA-1 de Commons; lo demás se descarta.
  4. Escribe descargas/lote.json con los audios verificados (rutas relativas a esa carpeta). Con --importar
     ejecuta node tools/audio-import.mjs --spec descargas/lote.json, que recorta, normaliza, convierte a MP3
     y agrega las entradas a audio/catalogo.json. Después: node test/validate.cjs, node build.mjs y
     node build-web.mjs --out . (y la atribución en audio/CREDITOS.md).
Es reanudable: lo que ya está en descargas/ con el SHA-1 correcto no se vuelve a pedir.
"""
import argparse
import hashlib
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
DL = os.path.join(HERE, "descargas")
# Wikimedia pide un User-Agent que identifique la herramienta y cómo contactar a su autor.
UA = "KooxMaaya/0.5 (https://github.com/sebastiancanul455/koox-maaya; descarga puntual de audios de Commons)"


def sha1_of(path):
    h = hashlib.sha1()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 16), b""):
            h.update(chunk)
    return h.hexdigest()


def main():
    ap = argparse.ArgumentParser(description="Baja, verifica e importa los audios pendientes de Wikimedia Commons.")
    ap.add_argument("--importar", action="store_true", help="importa los verificados con tools/audio-import.mjs")
    ap.add_argument("--solo", default="", help="keys separadas por comas (por omisión, todas)")
    ap.add_argument("--pausa", type=float, default=5.0, help="segundos entre peticiones (por omisión 5)")
    o = ap.parse_args()

    with open(os.path.join(HERE, "commons-spec-pendientes.json"), encoding="utf-8") as f:
        pend = json.load(f)
    with open(os.path.join(HERE, "sha1-map.json"), encoding="utf-8") as f:
        sm = json.load(f)
    solo = {k.strip() for k in o.solo.split(",") if k.strip()}
    if solo:
        unknown = solo - {s["key"] for s in pend}
        if unknown:
            sys.exit("Keys desconocidas: " + ", ".join(sorted(unknown)))
        pend = [s for s in pend if s["key"] in solo]
    os.makedirs(DL, exist_ok=True)

    ok, stopped = [], False
    for i, s in enumerate(pend):
        dest = os.path.join(HERE, s["input"])
        meta = sm["File:" + s["title"]]
        if os.path.exists(dest) and sha1_of(dest) == meta["sha1"]:
            print("  = " + s["key"] + ": ya estaba (SHA-1 verificado)")
            ok.append(s)
            continue
        if stopped:
            continue
        if i:
            time.sleep(o.pausa)
        req = urllib.request.Request(meta["url"], headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
        except urllib.error.HTTPError as e:
            print("  ✗ " + s["key"] + ": HTTP " + str(e.code) + (" (Retry-After: " + e.headers.get("Retry-After") + " s)" if e.headers.get("Retry-After") else ""))
            if e.code == 429:
                print("    Wikimedia limita las descargas: se detiene aquí. Vuelve a intentarlo más tarde (o desde otra red).")
                stopped = True
            continue
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            print("  ✗ " + s["key"] + ": " + str(e))
            continue
        h = hashlib.sha1(data).hexdigest()
        if h != meta["sha1"]:
            print("  ✗ " + s["key"] + ": el SHA-1 no coincide con el de Commons; se descarta")
            continue
        tmp = dest + ".part"
        with open(tmp, "wb") as f:
            f.write(data)
        os.replace(tmp, dest)
        print("  ✓ " + s["key"] + ": " + str(len(data)) + " bytes, SHA-1 verificado")
        ok.append(s)

    print("\nVerificados: " + str(len(ok)) + " de " + str(len(pend)) + ".")
    if not ok:
        return 1
    # Lote con rutas relativas a descargas/ (lo que espera audio-import.mjs).
    lote = []
    for s in ok:
        e = dict(s)
        e["input"] = os.path.relpath(os.path.join(HERE, s["input"]), DL)
        lote.append(e)
    lote_path = os.path.join(DL, "lote.json")
    with open(lote_path, "w", encoding="utf-8") as f:
        json.dump(lote, f, ensure_ascii=False, indent=2)
        f.write("\n")
    cmd = ["node", os.path.join(ROOT, "tools", "audio-import.mjs"), "--spec", lote_path]
    if not o.importar:
        print("Para importarlos: node tools/audio-import.mjs --spec " + os.path.relpath(lote_path, ROOT))
        return 0 if len(ok) == len(pend) else 2
    print("Importando: node tools/audio-import.mjs --spec " + os.path.relpath(lote_path, ROOT), flush=True)
    r = subprocess.run(cmd, cwd=ROOT)
    if r.returncode:
        return r.returncode
    print("Siguiente paso: node test/validate.cjs && node build.mjs && node build-web.mjs --out . "
          "(y agrega su atribución a audio/CREDITOS.md con node tools/creditos.mjs)")
    return 0 if len(ok) == len(pend) else 2


if __name__ == "__main__":
    sys.exit(main())
