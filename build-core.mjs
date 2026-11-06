// Ensamblado compartido de Ko'ox Maaya: une src/shell.html, src/app.css, src/app.js y el contenido.
// Lo usan build.mjs (Artifact de claude.ai) y build-web.mjs (sitio web independiente, PWA).
// Al contenido de las unidades le agrega los recursos para escuchar (src/content/recursos.js →
// window.COURSE_RESOURCES) y el catálogo de audio (audio/catalogo.json → window.COURSE_AUDIO).
// Solo usa módulos de Node (fs, path, crypto).
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const ROOT = path.resolve(decodeURIComponent(new URL(".", import.meta.url).pathname));
export const MARKERS = ["/*@@CSS@@*/", "/*@@CONTENT@@*/", "/*@@APP@@*/"];

// Error de construcción: el mensaje se muestra tal cual, precedido de "ERROR: ".
export class BuildError extends Error {}
const fail = (msg) => { throw new BuildError(msg); };

/* ---------------- Audio ---------------- */
export const AUDIO_KINDS = ["nativo", "fonema", "sintetico"];
// Campos del catálogo que llegan a la página (los demás se ignoran).
const AUDIO_FIELDS = ["key", "file", "kind", "text", "lang", "ipa", "vocab", "letters", "speaker", "region",
  "author", "license", "licenseUrl", "source", "title", "durationMs", "notes"];

/**
 * Dónde están el catálogo y la carpeta base de sus archivos ("file": "audio/<key>.mp3" es relativo a la base).
 * Real: audio/catalogo.json con base en la raíz. Muestra (--sample): test/fixtures/catalogo.json con base
 * en test/fixtures, así los audios de prueba nunca se mezclan con el catálogo real.
 */
export function audioPaths(opts = {}) {
  const root = opts.root || ROOT;
  return opts.sample
    ? { catalog: path.join(root, "test", "fixtures", "catalogo.json"), base: path.join(root, "test", "fixtures") }
    : { catalog: path.join(root, "audio", "catalogo.json"), base: root };
}

/**
 * Lee el catálogo de audio. Comprobaciones mínimas para construir (la validación completa, con el
 * curso, está en test/validate.cjs). Sin catálogo: lista vacía.
 * @returns {{ catalog: string, base: string, items: { entry: object, abs: string, buf: Buffer, bytes: number, hash: string }[], totalBytes: number }}
 */
export function loadAudio(opts = {}) {
  const root = opts.root || ROOT;
  const { catalog, base } = audioPaths(opts);
  const rel = path.relative(root, catalog);
  const out = { catalog, base, items: [], totalBytes: 0 };
  if (!fs.existsSync(catalog)) return out;
  let data;
  try { data = JSON.parse(fs.readFileSync(catalog, "utf8")); }
  catch (e) { fail(rel + " no es JSON válido: " + e.message); }
  if (!data || typeof data !== "object" || !Array.isArray(data.entries)) fail(rel + " debe tener la forma { \"version\": 1, \"entries\": [ … ] }.");
  const seen = new Set();
  data.entries.forEach((e, i) => {
    const where = rel + " · entries[" + i + "]";
    if (!e || typeof e !== "object") fail(where + " no es un objeto.");
    if (typeof e.key !== "string" || !/^[a-z0-9-]+$/.test(e.key)) fail(where + ": key debe ser [a-z0-9-]+.");
    if (seen.has(e.key)) fail(where + ": key «" + e.key + "» repetida.");
    seen.add(e.key);
    if (e.file !== "audio/" + e.key + ".mp3") fail(where + ": file debe ser «audio/" + e.key + ".mp3».");
    if (!AUDIO_KINDS.includes(e.kind)) fail(where + ": kind debe ser nativo, fonema o sintetico.");
    const abs = path.join(base, e.file);
    if (!fs.existsSync(abs)) fail(where + ": falta el archivo " + path.relative(root, abs) + ". Revisa con  node test/validate.cjs");
    const buf = fs.readFileSync(abs);
    const entry = {};
    for (const k of AUDIO_FIELDS) if (e[k] !== undefined) entry[k] = e[k];
    out.items.push({ entry, abs, buf, bytes: buf.length, hash: crypto.createHash("sha256").update(buf).digest("hex").slice(0, 10) });
    out.totalBytes += buf.length;
  });
  return out;
}

// Texto maya normalizado como en la app (minúsculas, apóstrofo recto, sin signos).
export function normText(s) {
  return String(s == null ? "" : s).normalize("NFC").toLowerCase()
    .replace(/[’‘ʼ´`′ʻ‛ʹ＇՚ˈ]/g, "'").replace(/[‐-―]/g, "-")
    .replace(/[¿?¡!.,;:"“”«»()…]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Keys de los audios sintéticos que nunca sonarían porque su palabra o su texto ya tienen voz nativa
 * (la app siempre prefiere la nativa). build.mjs los deja al final y build-web.mjs no los precarga.
 */
export function redundantSynth(items) {
  const natVocab = new Set(), natText = new Set();
  for (const it of items) if (it.entry.kind === "nativo") {
    (Array.isArray(it.entry.vocab) ? it.entry.vocab : []).forEach((id) => natVocab.add(id));
    natText.add(normText(it.entry.text));
  }
  const out = new Set();
  for (const it of items) {
    const e = it.entry;
    if (e.kind !== "sintetico") continue;
    const vocab = Array.isArray(e.vocab) ? e.vocab : [];
    if (natText.has(normText(e.text)) && vocab.every((id) => natVocab.has(id))) out.add(e.key);
  }
  return out;
}

// Recursos para escuchar: un archivo JavaScript como las unidades (null si no existe).
export function resourcesPart(opts = {}) {
  const root = opts.root || ROOT;
  const name = opts.sample ? "test/fixtures/recursos.js" : "src/content/recursos.js";
  const file = path.join(root, name);
  return fs.existsSync(file) ? { name, code: fs.readFileSync(file, "utf8") } : null;
}

// JSON que puede ir dentro de <script> sin cerrarlo ni romper el código.
export function scriptJSON(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

/**
 * Ensambla la página única en formato Artifact (sin doctype/html/head/body; la plataforma la envuelve).
 * @param {{ sample?: boolean, root?: string, warn?: (msg: string) => void, audio?: object,
 *   audioFile?: (item: object) => string | null }} [opts]
 *   sample: usa test/sample-content.js (y los recursos y audios de test/fixtures) en lugar de src/content.
 *   audio: el resultado de loadAudio() si ya se leyó.
 *   audioFile: qué "file" recibe la página para cada audio; null lo deja fuera. Por omisión, la ruta
 *   relativa audio/<key>.mp3 más "hash" (sitio web); build.mjs da data: URIs (Artifact).
 * @returns {{ html: string, parts: { name: string, code: string }[], content: string,
 *   audio: { items: object[], included: object[], totalBytes: number }, resources: boolean }}
 *   parts son solo las unidades; content es lo que va en el marcador /*@@CONTENT@@*\/.
 * @throws {BuildError} si alguna comprobación falla.
 */
export function assemble(opts = {}) {
  const root = opts.root || ROOT;
  const sample = !!opts.sample;
  const warn = opts.warn || ((m) => console.warn(m));
  const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

  const shell = read("src/shell.html");
  let css = read("src/app.css");
  // Módulos de la app: cada src/modules/*.js (orden alfabético) se inyecta en el marcador de app.js y comparte
  // su ámbito (state, esc, audio…). Así cada función nueva vive en su propio archivo.
  let js = read("src/app.js");
  const modDir = path.join(ROOT, "src", "modules");
  const mods = fs.existsSync(modDir) ? fs.readdirSync(modDir).filter((f) => /^[a-z0-9-]+\.js$/.test(f)).sort() : [];
  if (!js.includes("/*@@MODULES@@*/")) fail("src/app.js no tiene el marcador /*@@MODULES@@*/.");
  js = js.replace("/*@@MODULES@@*/", () => mods.map((f) => "  /* ---- módulo " + f + " ---- */\n" + read("src/modules/" + f)).join("\n"));
  // src/modules/*.css se agregan al final del CSS de la app (cada módulo trae sus estilos).
  const modCss = fs.existsSync(modDir) ? fs.readdirSync(modDir).filter((f) => /^[a-z0-9-]+\.css$/.test(f)).sort() : [];
  if (modCss.length) css += "\n" + modCss.map((f) => "/* ---- módulo " + f + " ---- */\n" + read("src/modules/" + f)).join("\n");

  // Contenido: cada archivo va en su propio <script> para que un error en una unidad no tumbe a las demás.
  let parts = [];
  if (sample) {
    parts.push({ name: "test/sample-content.js", code: read("test/sample-content.js") });
  } else {
    const dir = path.join(root, "src/content");
    const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /^u\d+\.js$/.test(f)) : [];
    files.sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10));
    parts = files.map((f) => ({ name: "src/content/" + f, code: fs.readFileSync(path.join(dir, f), "utf8") }));
  }
  if (!parts.length) warn("AVISO: no hay archivos de contenido; la app mostrará un estado vacío.");

  // Después de las unidades: recursos para escuchar y catálogo de audio.
  const extra = [];
  const res = resourcesPart({ root, sample });
  if (res) extra.push(res);
  // Contenido adicional de los módulos (si existe): lecturas y logros «Puedo…».
  if (!sample) for (const f of ["puedo.js", "lecturas.js"]) {
    const fp = path.join(root, "src/content", f);
    if (fs.existsSync(fp)) extra.push({ name: "src/content/" + f, code: fs.readFileSync(fp, "utf8") });
  }
  const audio = opts.audio || loadAudio({ root, sample });
  const mapFile = opts.audioFile || ((it) => it.entry.file);
  const included = [];
  const pageEntries = [];
  for (const it of audio.items) {
    const file = mapFile(it);
    if (!file) continue;
    const e = Object.assign({}, it.entry, { file });
    if (!opts.audioFile) e.hash = it.hash; // la ruta relativa se pide con ?v=<hash> (caché siempre al día)
    pageEntries.push(e);
    included.push(it);
  }
  extra.push({
    name: path.relative(root, audioPaths({ root, sample }).catalog).split(path.sep).join("/") + " (generado)",
    code: "window.COURSE_AUDIO = " + scriptJSON({ version: 1, entries: pageEntries }) + ";"
  });

  for (const p of parts.concat(extra)) {
    if (/<\/script/i.test(p.code)) fail(p.name + " contiene </script, que rompería la página.");
    if (/<!--/.test(p.code) && /<script/i.test(p.code)) fail(p.name + " contiene <!-- y <script, que pueden romper la página.");
  }
  if (/<\/script/i.test(js)) fail("src/app.js contiene </script.");
  if (/<\/style/i.test(css)) fail("src/app.css contiene </style.");

  const content = (parts.length ? parts : [{ name: "sin contenido", code: "" }]).concat(extra)
    .map((p) => "/* " + p.name + " */\n" + p.code.trim()).join("\n</script>\n<script>\n");

  for (const mk of MARKERS) {
    const n = shell.split(mk).length - 1;
    if (n !== 1) fail("shell.html debe tener el marcador " + mk + " exactamente una vez (tiene " + n + ").");
  }

  // Funciones de reemplazo: así los "$" del código no se interpretan como patrones.
  const html = shell
    .replace("/*@@CSS@@*/", () => css)
    .replace("/*@@CONTENT@@*/", () => content)
    .replace("/*@@APP@@*/", () => js);

  if (/<!doctype/i.test(html)) fail("el resultado contiene <!doctype.");
  if (/<html[\s>]/i.test(html)) fail("el resultado contiene <html>.");
  if (/<body[\s>]/i.test(html)) fail("el resultado contiene <body>.");
  if (/<head[\s>]/i.test(html)) fail("el resultado contiene <head>.");
  if (!/<title>Ko'ox Maaya<\/title>/.test(html.slice(0, 8192))) fail("falta <title>Ko'ox Maaya</title> en los primeros 8 KB.");

  return { html, parts, content, audio: { items: audio.items, included, totalBytes: audio.totalBytes }, resources: !!res };
}
