// Construye la página única de Ko'ox Maaya (formato Artifact de claude.ai).
//   node build.mjs                 -> dist/koox-maaya-artifact.html con src/content/u1.js..u9.js
//   node build.mjs --out <ruta>    -> la misma página en otra ruta (relativa a esta carpeta)
//   node build.mjs --sample        -> test/sample-build.html con test/sample-content.js
// Si existe build.local.json (no se versiona) con { "artifactOut": "<ruta>" }, esa ruta reemplaza
// a dist/koox-maaya-artifact.html como destino por omisión.
// El ensamblado está en build-core.mjs (lo comparte con build-web.mjs, la versión web instalable).
// Solo usa módulos de Node (fs, path).
import fs from "fs";
import path from "path";
import { assemble, BuildError, ROOT } from "./build-core.mjs";

const args = process.argv.slice(2);
const sample = args.includes("--sample");
const fail = (msg) => { console.error("ERROR: " + msg); process.exit(1); };

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

let res;
try { res = assemble({ sample }); }
catch (e) { if (e instanceof BuildError) fail(e.message); throw e; }
const { html: out, parts } = res;

const dest = destino();
if (!/\.html?$/i.test(dest)) fail("el destino debe terminar en .html: " + dest);
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, out);
const bytes = Buffer.byteLength(out, "utf8");
console.log("Escrito " + path.relative(process.cwd(), dest));
console.log("Tamaño: " + (bytes / 1024).toFixed(1) + " KB (" + bytes + " bytes) · " + parts.length + " archivo(s) de contenido");
if (bytes > 16 * 1024 * 1024) fail("supera 16 MB.");
