#!/usr/bin/env node
// Importa al catálogo de audio el ZIP que exporta la página de grabación (grabar.html).
//   node tools/import-recordings.mjs <archivo.zip> [--dry-run] [--replace] [--alternate] [--force] [--root <carpeta>]
// El ZIP trae grabaciones.json y wav/<…>.wav. Cada elemento se importa con importAudio (tools/audio-lib.mjs)
// como kind "nativo", con la key derivada de su id: "v-<id>" (palabra), "ex-<id>" (ejemplo de la palabra <id>)
// o "l-<letra>" (ejemplo de una letra de la guía; «ch'» → l-ch-saltillo).
// Solo usa módulos de Node (fs, path, zlib) y ffmpeg/ffprobe (a través de audio-lib.mjs).
import fs from "fs";
import path from "path";
import vm from "vm";
import zlib from "zlib";
import { fileURLToPath } from "url";
import {
  importAudio, AudioError, readCatalog, findEntry, normalizeLicense, slugLetter, tempDir,
  RECORDING_LICENSES, ROOT
} from "./audio-lib.mjs";

export const ANON = "Hablante anónimo";
const MAX_ZIP_BYTES = 1024 * 1024 * 1024;     // 1 GB
const MAX_ENTRY_BYTES = 64 * 1024 * 1024;     // 64 MB por archivo descomprimido
const MAX_TOTAL_BYTES = 1536 * 1024 * 1024;   // 1.5 GB entre todos
const ITEM_TYPES = ["vocab", "letter", "example"];

const HELP = `Importa las grabaciones de un hablante (el ZIP de grabar.html) al catálogo de audio.

Uso:
  node tools/import-recordings.mjs <archivo.zip> [opciones]

Opciones:
  --dry-run     revisa el ZIP y muestra qué haría, sin escribir nada
  --replace     reemplaza las entradas que ya existen de otro autor (por omisión se omiten)
  --alternate   si ya existe una entrada de otro autor, guarda esta como versión adicional
                (<key>-2, <key>-3, …) en lugar de omitirla
  --force       importa también los elementos que ya no coinciden con el curso actual
  --root <dir>  raíz del repositorio donde escribir (por omisión, la de este script)
  -h, --help    muestra esta ayuda

Después: node test/validate.cjs && node build.mjs && node build-web.mjs --out .
`;

// ---------------------------------------------------------------- ZIP
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
export function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Rechaza rutas peligrosas dentro del ZIP: absolutas, con «..», con «\», con letra de unidad o caracteres de control. */
export function safeZipName(name) {
  if (typeof name !== "string" || !name || name.length > 255) return false;
  if (/[\u0000-\u001f\u007f\\:]/.test(name)) return false;
  if (name.startsWith("/")) return false;
  const parts = name.split("/");
  if (parts.some((p, i) => p === ".." || p === "." || (p === "" && i !== parts.length - 1))) return false;
  return true;
}

/**
 * Lee el directorio central de un ZIP (sin ZIP64). Devuelve [{ name, method, crc, csize, usize, offset, flags }].
 * Lanza AudioError si el archivo no es un ZIP válido o trae rutas peligrosas.
 */
export function readZip(buf) {
  if (buf.length < 22) throw new AudioError("el archivo no es un ZIP (demasiado corto).", "ZIP");
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 22 - 65535); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new AudioError("el archivo no es un ZIP (no se encontró el directorio central).", "ZIP");
  const count = buf.readUInt16LE(eocd + 10);
  const cdSize = buf.readUInt32LE(eocd + 12);
  const cdOff = buf.readUInt32LE(eocd + 16);
  if (count === 0xffff || cdOff === 0xffffffff) throw new AudioError("ZIP64 no está soportado.", "ZIP");
  if (cdOff + cdSize > eocd) throw new AudioError("ZIP dañado: el directorio central se sale del archivo.", "ZIP");
  const entries = [];
  const names = new Set();
  let p = cdOff;
  for (let i = 0; i < count; i++) {
    if (p + 46 > buf.length || buf.readUInt32LE(p) !== 0x02014b50) throw new AudioError("ZIP dañado: entrada " + (i + 1) + " del directorio central.", "ZIP");
    const flags = buf.readUInt16LE(p + 8);
    const method = buf.readUInt16LE(p + 10);
    const crc = buf.readUInt32LE(p + 16);
    const csize = buf.readUInt32LE(p + 20);
    const usize = buf.readUInt32LE(p + 24);
    const nlen = buf.readUInt16LE(p + 28), xlen = buf.readUInt16LE(p + 30), clen = buf.readUInt16LE(p + 32);
    const offset = buf.readUInt32LE(p + 42);
    const name = buf.subarray(p + 46, p + 46 + nlen).toString(flags & 0x800 ? "utf8" : "latin1");
    p += 46 + nlen + xlen + clen;
    if (!safeZipName(name)) throw new AudioError("el ZIP trae una ruta peligrosa o no válida: " + JSON.stringify(name), "RUTA");
    if (names.has(name)) throw new AudioError("el ZIP trae dos veces el archivo " + name + ".", "ZIP");
    names.add(name);
    if (name.endsWith("/")) continue; // carpeta
    entries.push({ name, method, crc, csize, usize, offset, flags });
  }
  return entries;
}

/** Extrae una entrada (método store o deflate) y comprueba tamaño y CRC32. */
export function extractEntry(buf, e) {
  if (e.flags & 1) throw new AudioError(e.name + " está cifrado.", "ZIP");
  if (e.usize > MAX_ENTRY_BYTES) throw new AudioError(e.name + " pesa demasiado (" + e.usize + " bytes).", "ZIP");
  const p = e.offset;
  if (p + 30 > buf.length || buf.readUInt32LE(p) !== 0x04034b50) throw new AudioError("ZIP dañado: cabecera local de " + e.name + ".", "ZIP");
  const start = p + 30 + buf.readUInt16LE(p + 26) + buf.readUInt16LE(p + 28);
  if (start + e.csize > buf.length) throw new AudioError("ZIP dañado: " + e.name + " se sale del archivo.", "ZIP");
  const raw = buf.subarray(start, start + e.csize);
  let data;
  if (e.method === 0) data = Buffer.from(raw);
  else if (e.method === 8) {
    try { data = zlib.inflateRawSync(raw, { maxOutputLength: MAX_ENTRY_BYTES }); }
    catch (err) { throw new AudioError("no se pudo descomprimir " + e.name + ": " + err.message, "ZIP"); }
  } else throw new AudioError(e.name + " usa un método de compresión no soportado (" + e.method + ").", "ZIP");
  if (data.length !== e.usize) throw new AudioError(e.name + ": el tamaño no coincide con el del directorio.", "ZIP");
  if (crc32(data) !== e.crc) throw new AudioError(e.name + ": el CRC32 no coincide (archivo dañado).", "ZIP");
  return data;
}

// ---------------------------------------------------------------- Curso (para comprobar ids y textos)
const normText = (s) => String(s || "").normalize("NFC").toLowerCase().replace(/[’‘ʼ´`]/g, "'")
  .replace(/[¿¡!.,;:"“”«»()…]/g, " ").replace(/\s+/g, " ").trim();

/** Carga src/content/u*.js de la raíz. Devuelve { vocab: Map(id → {m, ex}), letters: Map(slug → {l, ex}) } o null. */
export function loadCourse(root = ROOT) {
  const dir = path.join(root, "src", "content");
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter((f) => /^u\d+\.js$/.test(f))
    .sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10));
  const sandbox = { window: {}, console: { log() {}, warn() {}, error() {} } };
  vm.createContext(sandbox);
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(dir, f), "utf8"), sandbox, { filename: f, timeout: 2000 });
  const C = sandbox.window.COURSE;
  if (!C || !Array.isArray(C.units)) return null;
  const vocab = new Map(), letters = new Map();
  for (const u of C.units) for (const l of u.lessons || []) for (const v of l.vocab || []) vocab.set(v.id, { m: v.m, ex: v.ex ? v.ex.m : null });
  for (const a of (C.guide && C.guide.alphabet) || []) if (a.ex) letters.set(slugLetter(a.l), { l: a.l, ex: a.ex.m });
  return { vocab, letters };
}

// ---------------------------------------------------------------- grabaciones.json
const cleanStr = (x, max = 120) => (typeof x === "string" && x.trim() ? x.trim().replace(/\s+/g, " ").slice(0, max) : null);

/** Key del catálogo para un elemento de grabaciones.json. */
export function deriveKey(item) {
  if (item.type === "vocab") return "v-" + item.id;
  if (item.type === "example") return "ex-" + item.id;
  return "l-" + (item.letter ? slugLetter(item.letter) : item.id);
}

/**
 * Valida grabaciones.json. Devuelve { meta, items } con los campos limpios.
 * Lanza AudioError si falta el consentimiento, la licencia no está permitida o la estructura no es válida.
 */
export function validateManifest(j, zipNames) {
  if (!j || typeof j !== "object") throw new AudioError("grabaciones.json no es un objeto.", "MANIFIESTO");
  if (j.app !== "koox-maaya") throw new AudioError("grabaciones.json no es de Ko'ox Maaya (app = " + JSON.stringify(j.app) + ").", "MANIFIESTO");
  if (j.version !== 1) throw new AudioError("versión de grabaciones.json no soportada: " + JSON.stringify(j.version) + ".", "MANIFIESTO");
  if (j.consent !== true) throw new AudioError("grabaciones.json no trae el consentimiento (consent: true). No se importa nada.", "CONSENTIMIENTO");
  const license = normalizeLicense(j.license);
  if (!license || !RECORDING_LICENSES.includes(license)) {
    throw new AudioError("licencia no permitida: " + JSON.stringify(j.license) + " (se aceptan " + RECORDING_LICENSES.join(", ") + ").", "LICENCIA");
  }
  const created = new Date(j.createdAt);
  if (!j.createdAt || isNaN(created.getTime())) throw new AudioError("createdAt no es una fecha válida.", "MANIFIESTO");
  if (!Array.isArray(j.items) || !j.items.length) throw new AudioError("grabaciones.json no trae elementos (items).", "MANIFIESTO");
  const items = j.items.map((it, i) => {
    const where = "items[" + i + "]";
    if (!it || typeof it !== "object") throw new AudioError(where + " no es un objeto.", "MANIFIESTO");
    if (!ITEM_TYPES.includes(it.type)) throw new AudioError(where + ": type debe ser vocab, letter o example.", "MANIFIESTO");
    if (typeof it.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(it.id) || it.id.length > 90) throw new AudioError(where + ": id no válido " + JSON.stringify(it.id) + ".", "MANIFIESTO");
    if (typeof it.text !== "string" || !it.text.trim() || it.text.length > 300) throw new AudioError(where + ": falta text.", "MANIFIESTO");
    if (typeof it.file !== "string" || !/^wav\/[a-z0-9-]+\.wav$/.test(it.file) || !safeZipName(it.file)) throw new AudioError(where + ": file no válido " + JSON.stringify(it.file) + ".", "RUTA");
    if (!zipNames.has(it.file)) throw new AudioError(where + ": el ZIP no trae " + it.file + ".", "MANIFIESTO");
    if (it.letter !== undefined && (typeof it.letter !== "string" || !it.letter.trim() || it.letter.length > 20)) throw new AudioError(where + ": letter no válida.", "MANIFIESTO");
    return {
      type: it.type, id: it.id, text: it.text.trim().replace(/[’‘ʼ]/g, "'"), file: it.file,
      letter: it.type === "letter" ? (it.letter ? it.letter.trim().replace(/[’‘ʼ]/g, "'") : null) : null
    };
  });
  return {
    meta: {
      speaker: cleanStr(j.speaker), region: cleanStr(j.region), license,
      speakerId: typeof j.speakerId === "string" && /^[a-z0-9]{6,32}$/.test(j.speakerId) ? j.speakerId : null,
      createdAt: created, date: created.toISOString().slice(0, 10)
    },
    items
  };
}

/** Mismo autor: mismo nombre; si es anónimo, además el mismo identificador de hablante (en notes). */
export function sameAuthor(prev, entry) {
  if (!prev || prev.author !== entry.author) return false;
  if (entry.author !== ANON) return true;
  const tok = (e) => (/hablante ([a-z0-9]{6,32})/.exec(e && e.notes ? e.notes : "") || [])[1] || null;
  return !!tok(entry) && tok(prev) === tok(entry);
}

function checkWav(data) {
  if (data.length < 44 || data.toString("latin1", 0, 4) !== "RIFF" || data.toString("latin1", 8, 12) !== "WAVE") return "no es un WAV";
  return null;
}

// ---------------------------------------------------------------- Programa
function parseArgs(argv) {
  const o = { zip: null, dryRun: false, replace: false, alternate: false, force: false, root: null, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") o.dryRun = true;
    else if (a === "--replace") o.replace = true;
    else if (a === "--alternate") o.alternate = true;
    else if (a === "--force") o.force = true;
    else if (a === "-h" || a === "--help") o.help = true;
    else if (a === "--root") { o.root = argv[++i]; if (!o.root) throw new AudioError("falta la carpeta después de --root."); }
    else if (a.startsWith("--root=")) o.root = a.slice(7);
    else if (a.startsWith("-")) throw new AudioError("opción desconocida " + a + " (usa --help).");
    else if (!o.zip) o.zip = a;
    else throw new AudioError("sobra el argumento " + a + ".");
  }
  return o;
}

async function main() {
  let o;
  try { o = parseArgs(process.argv.slice(2)); } catch (e) { console.error("ERROR: " + e.message); process.exit(2); }
  if (o.help || !o.zip) { console.log(HELP); if (!o.help) process.exitCode = 2; return; }
  if (o.replace && o.alternate) { console.error("ERROR: usa --replace o --alternate, no los dos."); process.exit(2); }
  const root = path.resolve(o.root || ROOT);

  let buf;
  try {
    const st = fs.statSync(o.zip);
    if (st.size > MAX_ZIP_BYTES) throw new AudioError("el ZIP pesa más de 1 GB.");
    buf = fs.readFileSync(o.zip);
  } catch (e) { console.error("ERROR: no se pudo leer " + o.zip + ": " + e.message); process.exit(1); }

  let entries, manifest;
  try {
    entries = readZip(buf);
    const total = entries.reduce((s, e) => s + e.usize, 0);
    if (total > MAX_TOTAL_BYTES) throw new AudioError("el ZIP descomprimido pesaría demasiado.", "ZIP");
    const byName = new Map(entries.map((e) => [e.name, e]));
    const mf = byName.get("grabaciones.json");
    if (!mf) throw new AudioError("el ZIP no trae grabaciones.json.", "MANIFIESTO");
    let j;
    try { j = JSON.parse(extractEntry(buf, mf).toString("utf8")); }
    catch (e) { if (e instanceof AudioError) throw e; throw new AudioError("grabaciones.json no es JSON válido: " + e.message, "MANIFIESTO"); }
    manifest = validateManifest(j, new Set(byName.keys()));
    manifest.byName = byName;
  } catch (e) {
    if (!(e instanceof AudioError)) throw e;
    console.error("ERROR: " + e.message);
    process.exit(1);
  }

  const { meta, items, byName } = manifest;
  const author = meta.speaker || ANON;
  const source = "Grabación para Ko'ox Maaya, " + meta.date;
  const notes = "Grabado en el navegador con grabar.html" + (meta.speakerId ? " (hablante " + meta.speakerId + ")" : "") + ".";
  console.log("Grabaciones de: " + author + (meta.region ? " · " + meta.region : "") + " · " + meta.license + " · " + meta.date);
  console.log((o.dryRun ? "Simulación (no se escribe nada) en " : "Importando en ") + root + "\n");

  const course = loadCourse(root);
  if (!course) console.log("AVISO: no se encontró el curso en src/content/; no se comprueban ids ni textos.\n");
  const cat = readCatalog(root);
  const results = { nueva: 0, actualizada: 0, omitida: 0, error: 0 };
  const tmp = o.dryRun ? null : tempDir("koox-grab-");
  const extracted = new Map();
  const usedKeys = new Set();
  try {
    for (const it of items) {
      const baseKey = deriveKey(it);
      const show = (sym, msg) => console.log("  " + sym + " " + baseKey.padEnd(22) + " «" + it.text + "»: " + msg);
      // Comprobación contra el curso actual.
      let vocab = [], letters = [];
      let mismatch = null;
      if (it.type === "letter") {
        const slug = it.letter ? slugLetter(it.letter) : it.id;
        const g = course && course.letters.get(slug);
        if (course && !g) mismatch = "la letra no está en la guía del curso";
        else if (g && normText(g.ex) !== normText(it.text)) mismatch = "el ejemplo de la letra ahora es «" + g.ex + "»";
        letters = [g ? g.l : it.letter || it.id];
      } else {
        const v = course && course.vocab.get(it.id);
        const want = v ? (it.type === "vocab" ? v.m : v.ex) : null;
        if (course && !v) mismatch = "el id " + it.id + " no está en el curso";
        else if (course && !want) mismatch = "la palabra " + it.id + " ya no tiene ejemplo";
        else if (want && normText(want) !== normText(it.text)) mismatch = "el curso ahora dice «" + want + "»";
        vocab = [it.id];
      }
      if (mismatch && !o.force) { show("↷", "se omite: " + mismatch + " (con --force se importa igual)"); results.omitida++; continue; }

      // Conflictos con el catálogo.
      const spec = {
        key: baseKey, kind: "nativo", text: it.text, lang: "yua", vocab, letters,
        speaker: meta.speaker || undefined, region: meta.region || undefined, author,
        license: meta.license, source, notes, root, replace: o.replace, sameAuthor, dryRun: o.dryRun
      };
      const prev = findEntry(cat, baseKey);
      if (prev && !sameAuthor(prev, spec) && !o.replace) {
        if (!o.alternate) { show("↷", "se omite: ya hay audio de «" + prev.author + "» (usa --replace o --alternate)"); results.omitida++; continue; }
        let n = 2, k;
        for (;; n++) {
          k = baseKey + "-" + n;
          const e = findEntry(cat, k);
          if (!usedKeys.has(k) && (!e || sameAuthor(e, spec))) break;
        }
        spec.key = k;
      }
      if (usedKeys.has(spec.key)) { show("✗", "key repetida en el ZIP"); results.error++; continue; }
      usedKeys.add(spec.key);

      try {
        const ze = byName.get(it.file);
        let input = extracted.get(it.file);
        if (!input) {
          const data = extractEntry(buf, ze);
          const bad = checkWav(data);
          if (bad) throw new AudioError(it.file + ": " + bad + ".", "ENTRADA");
          input = tmp ? path.join(tmp.dir, path.basename(it.file)) : it.file;
          if (tmp) fs.writeFileSync(input, data);
          extracted.set(it.file, input);
        }
        if (o.dryRun) spec.input = o.zip; // solo para que importAudio valide; con dryRun no se lee
        else spec.input = input;
        const r = await importAudio(spec);
        const key = r.key === baseKey ? "" : " como " + r.key;
        if (o.dryRun) show("·", (prev ? "se actualizaría" : "se agregaría") + key);
        else show("✓", r.action + key + " · " + (r.durationMs / 1000).toFixed(2).replace(".", ",") + " s");
        if (!o.dryRun) {
          const fresh = readCatalog(root);
          cat.entries = fresh.entries;
        }
        results[r.action.replace("simulada-", "")]++;
      } catch (e) {
        if (!(e instanceof AudioError)) throw e;
        show("✗", e.message);
        results.error++;
      }
    }
  } finally {
    if (tmp) tmp.cleanup();
  }

  console.log("\nResumen: " + results.nueva + " nueva(s), " + results.actualizada + " actualizada(s), " +
    results.omitida + " omitida(s), " + results.error + " con error" + (o.dryRun ? " (simulación: no se escribió nada)." : "."));
  if (!o.dryRun && results.nueva + results.actualizada > 0) {
    console.log("Siguiente paso: node test/validate.cjs && node build.mjs && node build-web.mjs --out .");
  }
  if (results.error) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error("ERROR: " + (e && e.message ? e.message : e)); process.exit(1); });
}
