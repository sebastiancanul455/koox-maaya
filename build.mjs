// Construye la página única de Ko'ox Maaya (formato Artifact de claude.ai).
//   node build.mjs                 -> dist/koox-maaya-artifact.html con src/content/u1.js..u9.js
//   node build.mjs --out <ruta>    -> la misma página en otra ruta (relativa a esta carpeta)
//   node build.mjs --sample        -> test/sample-build.html con test/sample-content.js (y los audios
//                                     y recursos de prueba de test/fixtures)
//   node build.mjs --audio-limit 4 -> límite del audio incrustado en MB (por omisión 6)
// El audio (audio/catalogo.json) va dentro de la página como data:audio/mpeg;base64: el Artifact
// nunca pide archivos a otro sitio. Si no cabe todo en el límite, entran primero los sonidos de
// referencia («fonema»), luego las voces nativas y al final las sintéticas, hasta llenar el límite.
// Si existe build.local.json (no se versiona) con { "artifactOut": "<ruta>" }, esa ruta reemplaza
// a dist/koox-maaya-artifact.html como destino por omisión.
// El ensamblado está en build-core.mjs (lo comparte con build-web.mjs, la versión web instalable).
// Solo usa módulos de Node (fs, path).
import fs from "fs";
import path from "path";
import { assemble, loadAudio, BuildError, ROOT } from "./build-core.mjs";

const args = process.argv.slice(2);
const sample = args.includes("--sample");
const fail = (msg) => { console.error("ERROR: " + msg); process.exit(1); };
const MB = 1024 * 1024;

function audioLimit() {
  const i = args.indexOf("--audio-limit");
  if (i < 0) return 6 * MB;
  const v = Number(String(args[i + 1] || "").replace(",", "."));
  if (!args[i + 1] || !isFinite(v) || v < 0) fail("--audio-limit necesita un número de MB (por ejemplo  --audio-limit 4).");
  if (v > 15) fail("--audio-limit no puede pasar de 15 MB: la página completa debe quedar por debajo de 16 MB.");
  return Math.round(v * MB);
}

// Qué audios se incrustan: todos si caben; si no, por prioridad de tipo y en el orden del catálogo,
// cada uno que todavía quepa.
const PRIORIDAD = { fonema: 0, nativo: 1, sintetico: 2 };
function chooseAudio(items, limit) {
  const enc = items.map((it, i) => ({ it, i, uri: "data:audio/mpeg;base64," + it.buf.toString("base64") }));
  const total = enc.reduce((n, x) => n + x.uri.length, 0);
  if (total <= limit) return { chosen: enc, left: [], total, used: total };
  const order = enc.slice().sort((a, b) => PRIORIDAD[a.it.entry.kind] - PRIORIDAD[b.it.entry.kind] || a.i - b.i);
  const chosen = [], left = [];
  let used = 0;
  for (const x of order) {
    if (used + x.uri.length <= limit) { chosen.push(x); used += x.uri.length; } else left.push(x);
  }
  return { chosen, left, total, used };
}

function destino() {
  if (sample) return path.join(ROOT, "test/sample-build.html");
  const i = args.indexOf("--out");
  if (i >= 0) {
    if (!args[i + 1] || args[i + 1].startsWith("--")) fail("falta la ruta después de --out.");
    return path.resolve(ROOT, args[i + 1]);
  }
  const local = path.join(ROOT, "build.local.json");
  if (fs.existsSync(local)) {
    let cfg;
    try { cfg = JSON.parse(fs.readFileSync(local, "utf8")); } catch (e) { fail("build.local.json no es JSON válido: " + e.message); }
    if (cfg && typeof cfg.artifactOut === "string" && cfg.artifactOut.trim()) return path.resolve(ROOT, cfg.artifactOut.trim());
  }
  return path.join(ROOT, "dist", "koox-maaya-artifact.html");
}

let res, pick;
try {
  const limit = audioLimit();
  const audio = loadAudio({ sample });
  pick = chooseAudio(audio.items, limit);
  pick.limit = limit;
  const uris = new Map(pick.chosen.map((x) => [x.it.entry.key, x.uri]));
  res = assemble({ sample, audio, audioFile: (it) => uris.get(it.entry.key) || null });
}
catch (e) { if (e instanceof BuildError) fail(e.message); throw e; }
const { html: out, parts } = res;

const dest = destino();
if (!/\.html?$/i.test(dest)) fail("el destino debe terminar en .html: " + dest);
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, out);
const bytes = Buffer.byteLength(out, "utf8");
console.log("Escrito " + path.relative(process.cwd(), dest));
console.log("Tamaño: " + (bytes / 1024).toFixed(1) + " KB (" + bytes + " bytes) · " + parts.length + " archivo(s) de contenido");
const mb = (n) => (n / MB).toFixed(2) + " MB";
const porTipo = (list) => Object.entries(list.reduce((o, x) => { o[x.it.entry.kind] = (o[x.it.entry.kind] || 0) + 1; return o; }, {}))
  .map(([k, n]) => n + " " + k).join(", ");
const nAudio = pick.chosen.length + pick.left.length;
if (!nAudio) console.log("Audio: el catálogo no tiene audios.");
else if (!pick.left.length) console.log("Audio: " + nAudio + " incrustado(s) (" + porTipo(pick.chosen) + "), " + mb(pick.used) + " de un límite de " + mb(pick.limit) + ".");
else {
  console.log("Audio: NO cabe todo en el límite de " + mb(pick.limit) + " (en total serían " + mb(pick.total) + ").");
  console.log("  Incrustados " + pick.chosen.length + " de " + nAudio + (pick.chosen.length ? " (" + porTipo(pick.chosen) + ")" : "") + ", " + mb(pick.used) + ".");
  console.log("  Fuera del Artifact " + pick.left.length + " (" + porTipo(pick.left) + "): " + pick.left.map((x) => x.it.entry.key).join(", ") + ".");
  console.log("  Esos audios siguen en el sitio web. Para incluir más, sube el límite con --audio-limit <MB>.");
}
if (bytes > 16 * MB) fail("supera 16 MB.");
