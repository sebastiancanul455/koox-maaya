#!/usr/bin/env node
// Importa grabaciones al catálogo de audio de Ko'ox Maaya (audio/<key>.mp3 + audio/catalogo.json).
//   node tools/audio-import.mjs --in voz.wav --key v-u1-chich --kind nativo --text chich --vocab u1-chich \
//        --license CC-BY-SA-4.0 --author "Nombre" --source "Grabación de …"
//   node tools/audio-import.mjs --spec lote.json [--dry-run] [--replace]
// node tools/audio-import.mjs --help explica todas las opciones.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { importAudio, AudioError, LICENSES, KINDS, ROOT } from "./audio-lib.mjs";

const HELP = `Importa audio al catálogo de Ko'ox Maaya.

Un archivo:
  node tools/audio-import.mjs --in <archivo> --key <key> --kind <tipo> --text <texto> \\
       --license <licencia> --author <autor> --source <origen> [opciones]

Por lote:
  node tools/audio-import.mjs --spec <lote.json> [opciones]
  lote.json es una lista de objetos con los mismos campos que las opciones (input o in, key, kind,
  text, vocab, letters, …). Las rutas de input son relativas a la carpeta de lote.json. Las opciones
  que pongas en la línea de comandos (por ejemplo --license o --author) se usan como valor por
  omisión para los elementos del lote que no las traigan.

Qué hace con cada audio: recorta el silencio del inicio y del final, normaliza el volumen
(~-18 LUFS, pico -1.5 dB), agrega 60 ms de silencio a cada lado, lo guarda como MP3 mono de
44.1 kHz y 64 kbps en audio/<key>.mp3 y agrega o actualiza su entrada en audio/catalogo.json.
Necesita ffmpeg y ffprobe.

Opciones:
  --in, --input <archivo>  audio de entrada (wav, mp3, ogg, webm, m4a, … lo que lea ffmpeg)
  --key <key>              nombre del archivo y de la entrada: minúsculas ascii, números y guiones
                           (por ejemplo v-u1-chich, ex-u2-bix-a-kaaba, l-ch-saltillo)
  --kind <tipo>            ${KINDS.join(" | ")}
  --text <texto>           lo que se oye, con la ortografía del curso (apóstrofo recto ')
  --lang <código>          yua (maya yucateco, por omisión) o und (indeterminado; por omisión en fonema)
  --ipa <transcripción>    transcripción fonética (opcional)
  --vocab <a,b>            ids de vocabulario que ilustra, separados por comas (u1-chich,u8-sak)
  --letters <a,b>          letras de la guía que ilustra, separadas por comas (ch',k')
  --speaker <nombre>       quién habla (opcional)
  --region <lugar>         comunidad o municipio de quien habla (opcional)
  --author <nombre>        a quién se da el crédito (obligatorio)
  --license <licencia>     ${Object.keys(LICENSES).join(", ")}
  --license-url <url>      enlace a la licencia (por omisión, el de Creative Commons)
  --source <texto>         de dónde viene la grabación (obligatorio)
  --title <texto>          título (opcional)
  --notes <texto>          notas (opcional)
  --root <carpeta>         raíz del repositorio donde escribir (por omisión, la de este script)
  --replace                permite reemplazar una entrada existente de otro autor
  --dry-run                solo valida y muestra qué haría; no escribe nada
  -h, --help               muestra esta ayuda
`;

const FIELDS = {
  in: "input", input: "input", key: "key", kind: "kind", text: "text", lang: "lang", ipa: "ipa", vocab: "vocab",
  letters: "letters", speaker: "speaker", region: "region", author: "author", license: "license",
  "license-url": "licenseUrl", source: "source", title: "title", notes: "notes", root: "root", spec: "spec"
};
const FLAGS = { replace: "replace", "dry-run": "dryRun", help: "help", h: "help" };

/** Lee los argumentos (--opción valor o --opción=valor). Lanza AudioError si hay algo desconocido. */
export function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const m = /^--?([a-z-]+)(?:=([\s\S]*))?$/.exec(a);
    if (!m) throw new AudioError("argumento inesperado «" + a + "» (usa --help).");
    const name = m[1];
    if (FLAGS[name]) {
      if (m[2] !== undefined) throw new AudioError("--" + name + " no lleva valor.");
      out[FLAGS[name]] = true;
    } else if (FIELDS[name]) {
      let v = m[2];
      if (v === undefined) {
        v = argv[i + 1];
        if (v === undefined || /^--[a-z]/.test(v)) throw new AudioError("falta el valor de --" + name + ".");
        i++;
      }
      out[FIELDS[name]] = v;
    } else throw new AudioError("opción desconocida --" + name + " (usa --help).");
  }
  return out;
}

const fmtS = (ms) => (ms / 1000).toFixed(2).replace(".", ",") + " s";
const fmtDb = (db) => (db >= 0 ? "+" : "") + db.toFixed(1).replace(".", ",") + " dB";

async function main() {
  let opts;
  try { opts = parseArgs(process.argv.slice(2)); }
  catch (e) { console.error("ERROR: " + e.message); process.exit(2); }
  if (opts.help || process.argv.length <= 2) { console.log(HELP); return; }

  const common = { ...opts };
  delete common.spec; delete common.help;
  let specs;
  if (opts.spec) {
    const specFile = path.resolve(opts.spec);
    let list;
    try { list = JSON.parse(fs.readFileSync(specFile, "utf8")); }
    catch (e) { console.error("ERROR: no se pudo leer " + opts.spec + ": " + e.message); process.exit(2); }
    if (list && !Array.isArray(list)) list = list.items || list.entries;
    if (!Array.isArray(list) || !list.length) { console.error("ERROR: " + opts.spec + " debe ser una lista de especificaciones."); process.exit(2); }
    const base = path.dirname(specFile);
    specs = list.map((s) => {
      const spec = { ...common, ...s };
      if (s && s.in && !s.input) spec.input = s.in;
      delete spec.in;
      if (spec.input) spec.input = path.resolve(base, String(spec.input));
      return spec;
    });
    // Las opciones de la línea de comandos que solo tienen sentido para un archivo no aplican al lote.
    if (common.key || common.input) { console.error("ERROR: con --spec no se usan --key ni --in."); process.exit(2); }
  } else {
    specs = [common];
  }

  const root = path.resolve(opts.root || ROOT);
  const seen = new Set();
  let ok = 0, bad = 0;
  console.log((opts.dryRun ? "Simulación (no se escribe nada) en " : "Importando en ") + root);
  for (const spec of specs) {
    const label = spec.key || "(sin key)";
    if (seen.has(spec.key)) { console.log("  ✗ " + label + ": key repetida en el lote"); bad++; continue; }
    seen.add(spec.key);
    try {
      const r = await importAudio({ ...spec, root });
      const extra = r.durationMs ? " · " + fmtS(r.durationMs) + " · ganancia " + fmtDb(r.gainDb) : "";
      const what = { nueva: "nueva", actualizada: "actualizada", "simulada-nueva": "se agregaría", "simulada-actualizada": "se actualizaría" };
      console.log("  ✓ " + r.key + ": " + (what[r.action] || r.action) + extra);
      ok++;
    } catch (e) {
      if (!(e instanceof AudioError)) throw e;
      console.log("  ✗ " + label + ": " + e.message);
      bad++;
    }
  }
  console.log("\n" + ok + " correcto(s), " + bad + " con error.");
  if (!opts.dryRun && ok) console.log("Siguiente paso: node test/validate.cjs && node build.mjs && node build-web.mjs --out .");
  if (bad) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error("ERROR: " + (e && e.message ? e.message : e)); process.exit(1); });
}
