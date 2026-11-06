// Biblioteca de audio de Ko'ox Maaya: importa una grabación al catálogo del curso.
//   import { importAudio, readCatalog, writeCatalog } from "./tools/audio-lib.mjs";
// Contrato (compartido con el motor de la app):
//   audio/<key>.mp3      MP3 mono, 44.1 kHz, 64 kbps; key = [a-z0-9-]+
//   audio/catalogo.json  { "version": 1, "entries": [ { key, file, kind, text, lang, ipa?, vocab, letters,
//                          speaker?, region?, author, license, licenseUrl?, source, title?, durationMs?, notes? } ] }
// Proceso de importAudio: recorta el silencio del inicio y del final (silencedetect + atrim), normaliza el volumen
// (medición con loudnorm, objetivo ~-18 LUFS y pico real de -1.5 dB, aplicado como ganancia lineal para no
// deformar palabras cortas), agrega 60 ms de silencio a cada lado, codifica el MP3, mide la duración con
// ffprobe y hace upsert de la entrada en el catálogo (orden estable por key, JSON con 2 espacios).
// Solo usa módulos de Node y los programas ffmpeg y ffprobe (con libmp3lame).
import fs from "fs";
import os from "os";
import path from "path";
import { execFile, execFileSync } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";

const run = promisify(execFile);

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const KEY_RE = /^[a-z0-9-]+$/;
export const KINDS = ["nativo", "fonema", "sintetico"];
export const LANGS = ["yua", "und"];
/**
 * Licencias aceptadas en el catálogo, con el nombre tal como se escribe en "license" (el mismo que
 * reconoce test/validate.cjs) y la página de la licencia (licenseUrl por omisión).
 */
const CC = "https://creativecommons.org/";
/**
 * Permiso propio de Ko'ox Maaya para las voces de hablantes: publicar dentro de la app y del repositorio con el
 * crédito elegido, y nada más sin otro permiso. NO es una licencia abierta (términos en docs/PERMISO-VOCES.md).
 */
export const OWN_LICENSE = "Solo para Ko'ox Maaya";
export const OWN_LICENSE_URL = "https://github.com/sebastiancanul455/koox-maaya/blob/main/docs/PERMISO-VOCES.md";
export const LICENSES = {
  "CC BY-SA 4.0": { url: CC + "licenses/by-sa/4.0/deed.es" },
  "CC BY 4.0": { url: CC + "licenses/by/4.0/deed.es" },
  "CC0 1.0": { url: CC + "publicdomain/zero/1.0/deed.es" },
  [OWN_LICENSE]: { url: OWN_LICENSE_URL },
  "Dominio público": { url: CC + "publicdomain/mark/1.0/deed.es" },
  "CC BY-SA 3.0": { url: CC + "licenses/by-sa/3.0/deed.es" },
  "CC BY 3.0": { url: CC + "licenses/by/3.0/deed.es" },
  "CC BY-SA 2.5": { url: CC + "licenses/by-sa/2.5/deed.es" },
  "CC BY 2.5": { url: CC + "licenses/by/2.5/deed.es" },
  "CC BY-SA 2.0": { url: CC + "licenses/by-sa/2.0/deed.es" },
  "CC BY 2.0": { url: CC + "licenses/by/2.0/deed.es" },
  // Solo para la voz sintética MMS-TTS (modelo de Meta con licencia no comercial).
  "CC BY-NC 4.0": { url: CC + "licenses/by-nc/4.0/deed.es" }
};
/** Las licencias que ofrece la página de grabación (grabar.html); la primera es la que trae elegida. */
export const RECORDING_LICENSES = [OWN_LICENSE, "CC BY-SA 4.0", "CC BY 4.0", "CC0 1.0"];

export const TARGET_LUFS = -18;
export const TARGET_TP_DB = -1.5;
export const PAD_MS = 60;
const SILENCE_DB = -50;          // umbral (dBFS) del recorte de silencios
const MAX_GAIN_DB = 36;          // más ganancia que esto solo amplificaría ruido
const MAX_INPUT_BYTES = 200 * 1024 * 1024;
const ENTRY_ORDER = ["key", "file", "kind", "text", "lang", "ipa", "vocab", "letters", "speaker", "region", "author",
  "license", "licenseUrl", "source", "title", "durationMs", "notes"];

/** Error con mensaje para mostrar tal cual y un código corto (p. ej. "OTRO_AUTOR"). */
export class AudioError extends Error {
  constructor(message, code = "INVALIDO") { super(message); this.code = code; }
}
const fail = (msg, code) => { throw new AudioError(msg, code); };

const licToken = (x) => String(x).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[\s_.\-'’‘ʼ´`()]+/g, "");
const LIC_ALIASES = new Map(Object.keys(LICENSES).map((k) => [licToken(k), k]));
[["CC0", "CC0 1.0"], ["PD", "Dominio público"], ["PDM", "Dominio público"], ["PDM10", "Dominio público"],
  ["PUBLICDOMAIN", "Dominio público"],
  // La etiqueta completa que ve quien graba en grabar.html.
  [licToken(OWN_LICENSE + " (no es licencia abierta)"), OWN_LICENSE]].forEach(([a, b]) => LIC_ALIASES.set(a, b));

/**
 * Normaliza una licencia a su nombre del catálogo: "CC-BY-SA-4.0" (SPDX), "cc by-sa 4.0" → "CC BY-SA 4.0";
 * "CC0" → "CC0 1.0"; "PD" → "Dominio público". Devuelve null si no es una licencia aceptada.
 */
export function normalizeLicense(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  return LIC_ALIASES.get(licToken(value)) || null;
}

/**
 * Convierte una letra de la guía en un fragmento seguro para una key: «ch'» → "ch-saltillo",
 * «áa» → "a-alto-a", «a e i o u» → "a-e-i-o-u". Determinista e inyectivo para las letras del curso.
 * (La página de grabación usa la misma regla.)
 */
export function slugLetter(letter) {
  const s = String(letter).normalize("NFD").toLowerCase()
    .replace(/[’‘ʼ´`]/g, "'")
    .replace(/́/g, "-alto-")
    .replace(/[̀-ͯ]/g, "")
    .replace(/'/g, "-saltillo-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s;
}

export const catalogPath = (root = ROOT) => path.join(root, "audio", "catalogo.json");
export const emptyCatalog = () => ({ version: 1, entries: [] });

/** Lee audio/catalogo.json; si no existe, devuelve un catálogo vacío (sin escribirlo). */
export function readCatalog(root = ROOT) {
  const file = catalogPath(root);
  if (!fs.existsSync(file)) return emptyCatalog();
  let cat;
  try { cat = JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (e) { fail("audio/catalogo.json no es JSON válido: " + e.message, "CATALOGO"); }
  if (!cat || typeof cat !== "object" || cat.version !== 1 || !Array.isArray(cat.entries)) {
    fail("audio/catalogo.json debe ser { \"version\": 1, \"entries\": [ … ] }.", "CATALOGO");
  }
  return cat;
}

/** Ordena las entradas por key y las campos de cada entrada según el contrato. */
export function sortCatalog(cat) {
  const entries = cat.entries.map(orderEntry);
  entries.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  const out = { version: 1, entries };
  for (const k of Object.keys(cat)) if (k !== "version" && k !== "entries") out[k] = cat[k];
  return out;
}

/** Escribe el catálogo (ordenado por key, JSON con 2 espacios y salto final) de forma atómica. */
export function writeCatalog(cat, root = ROOT) {
  const file = catalogPath(root);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + ".tmp-" + process.pid;
  fs.writeFileSync(tmp, JSON.stringify(sortCatalog(cat), null, 2) + "\n");
  fs.renameSync(tmp, file);
  return file;
}

/** Crea audio/catalogo.json con entries vacío si todavía no existe. Devuelve true si lo creó. */
export function ensureCatalog(root = ROOT) {
  if (fs.existsSync(catalogPath(root))) return false;
  writeCatalog(emptyCatalog(), root);
  return true;
}

export const findEntry = (cat, key) => cat.entries.find((e) => e && e.key === key) || null;

/** Inserta o reemplaza la entrada con la misma key. Devuelve "nueva" o "actualizada". */
export function upsertEntry(cat, entry) {
  const i = cat.entries.findIndex((e) => e && e.key === entry.key);
  if (i >= 0) { cat.entries[i] = orderEntry(entry); return "actualizada"; }
  cat.entries.push(orderEntry(entry));
  return "nueva";
}

function orderEntry(e) {
  const out = {};
  for (const k of ENTRY_ORDER) if (e[k] !== undefined) out[k] = e[k];
  for (const k of Object.keys(e)) if (!(k in out) && e[k] !== undefined) out[k] = e[k];
  return out;
}

const isStr = (x) => typeof x === "string" && x.trim().length > 0;
const optStr = (x) => (x == null || x === "" ? undefined : String(x).trim() || undefined);
function strList(x, name) {
  if (x == null || x === "") return [];
  const list = Array.isArray(x) ? x : String(x).split(",");
  const out = list.map((s) => String(s).trim()).filter(Boolean);
  if (out.some((s) => s.length > 200)) fail(name + ": hay un valor demasiado largo.");
  return [...new Set(out)];
}

/**
 * Valida una especificación y arma la entrada del catálogo (sin durationMs).
 * Lanza AudioError con un mensaje en español si algo no cumple el contrato.
 */
export function buildEntry(spec) {
  if (!spec || typeof spec !== "object") fail("la especificación debe ser un objeto.");
  const key = String(spec.key || "");
  if (!KEY_RE.test(key)) fail("key «" + key + "» no válida: usa solo minúsculas ascii, números y guiones.", "KEY");
  if (key.length > 100) fail("key demasiado larga (máximo 100 caracteres).", "KEY");
  if (!KINDS.includes(spec.kind)) fail("kind debe ser " + KINDS.map((k) => "«" + k + "»").join(", ") + " (es «" + spec.kind + "»).", "KIND");
  if (!isStr(spec.text)) fail("falta text (el texto que se oye).");
  const lang = spec.lang == null || spec.lang === "" ? (spec.kind === "fonema" ? "und" : "yua") : spec.lang;
  if (!LANGS.includes(lang)) fail("lang debe ser «yua» o «und» (es «" + lang + "»).");
  const license = normalizeLicense(spec.license);
  if (!license) fail("license «" + spec.license + "» no aceptada; usa una de: " + Object.keys(LICENSES).join(", ") + ".", "LICENCIA");
  if (!isStr(spec.author)) fail("falta author (a quién se da el crédito).");
  if (!isStr(spec.source)) fail("falta source (de dónde viene la grabación).");
  const licenseUrl = optStr(spec.licenseUrl) || LICENSES[license].url;
  if (!/^https:\/\/\S+$/.test(licenseUrl)) fail("licenseUrl debe empezar con https://.");
  if (/[’‘ʼ]/.test(spec.text)) fail("text usa un apóstrofo tipográfico; en maya va el recto '.");
  const durationMs = spec.durationMs == null ? undefined : Math.round(Number(spec.durationMs));
  if (durationMs !== undefined && !(durationMs > 0)) fail("durationMs debe ser un número positivo.");
  return orderEntry({
    key,
    file: "audio/" + key + ".mp3",
    kind: spec.kind,
    text: String(spec.text).trim(),
    lang,
    ipa: optStr(spec.ipa),
    vocab: strList(spec.vocab, "vocab"),
    letters: strList(spec.letters, "letters"),
    speaker: optStr(spec.speaker),
    region: optStr(spec.region),
    author: String(spec.author).trim(),
    license,
    licenseUrl,
    source: String(spec.source).trim(),
    title: optStr(spec.title),
    durationMs,
    notes: optStr(spec.notes)
  });
}

let toolsChecked = false;
/** Comprueba que ffmpeg (con libmp3lame) y ffprobe estén instalados. */
export function checkTools() {
  if (toolsChecked) return;
  let enc;
  try { enc = execFileSync("ffmpeg", ["-hide_banner", "-encoders"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }); }
  catch (e) { fail("no se encontró ffmpeg. Instálalo (por ejemplo: sudo apt install ffmpeg) y vuelve a intentar.", "HERRAMIENTAS"); }
  if (!/libmp3lame/.test(enc)) fail("ffmpeg no tiene el codificador libmp3lame (MP3).", "HERRAMIENTAS");
  try { execFileSync("ffprobe", ["-version"], { stdio: "ignore" }); }
  catch (e) { fail("no se encontró ffprobe (viene con ffmpeg).", "HERRAMIENTAS"); }
  toolsChecked = true;
}

async function ffmpeg(args) {
  try {
    const r = await run("ffmpeg", ["-hide_banner", "-nostdin", ...args], { maxBuffer: 64 * 1024 * 1024 });
    return r.stderr;
  } catch (e) {
    const tail = String(e.stderr || e.message).trim().split("\n").slice(-4).join(" | ");
    fail("ffmpeg falló: " + tail, "FFMPEG");
  }
}

/** Datos técnicos de un archivo de audio: { durationMs, channels, sampleRate, codec, bitRate }. */
export async function probe(file) {
  let out;
  try {
    out = (await run("ffprobe", ["-v", "error", "-select_streams", "a:0", "-show_entries",
      "stream=codec_name,channels,sample_rate,bit_rate:format=duration,bit_rate", "-of", "json", file])).stdout;
  } catch (e) { fail("ffprobe no pudo leer " + file + ": " + String(e.stderr || e.message).trim(), "FFPROBE"); }
  const j = JSON.parse(out);
  const st = (j.streams || [])[0];
  if (!st) fail(file + " no tiene pista de audio.", "FFPROBE");
  const dur = Number(j.format && j.format.duration);
  return {
    durationMs: Number.isFinite(dur) ? Math.round(dur * 1000) : null,
    channels: Number(st.channels),
    sampleRate: Number(st.sample_rate),
    codec: st.codec_name,
    bitRate: Number(st.bit_rate || (j.format && j.format.bit_rate)) || null
  };
}

// Filtro común: mono, 44.1 kHz, flotante.
const BASE = "aformat=sample_fmts=flt:sample_rates=44100:channel_layouts=mono";
const CLICK_MAX_S = 0.06;        // un «clic» (tocar la pantalla) dura menos que esto…
const CLICK_GAP_S = 0.2;         // …y está separado de la voz por al menos este silencio
const KEEP_BEFORE_S = 0.04;      // margen antes de la voz (inicios suaves: j, w, y)
const KEEP_AFTER_S = 0.08;       // margen después (finales que se apagan, soltura de k', t', ch')

/**
 * Busca dónde empieza y termina la voz con silencedetect: { startS, endS, durS }.
 * Solo recorta los extremos; las pausas internas (el corte de voz de a'a, la oclusión de k') se conservan.
 * Un ruido muy corto y aislado al principio o al final (un toque en la pantalla) no cuenta como voz.
 * (silenceremove no sirve aquí: si se le pide ignorar clics, también se come el borde de la voz.)
 */
async function speechBounds(input) {
  const err = await ffmpeg(["-i", input, "-af", BASE + ",silencedetect=n=" + SILENCE_DB + "dB:d=0.03", "-f", "null", "-"]);
  const times = [...err.matchAll(/time=(\d+):(\d+):(\d+(?:\.\d+)?)/g)];
  const last = times[times.length - 1];
  const durS = last ? Number(last[1]) * 3600 + Number(last[2]) * 60 + Number(last[3]) : NaN;
  if (!(durS > 0)) fail("no se pudo leer la duración del audio.", "FFMPEG");
  const sil = [];
  for (const m of err.matchAll(/silence_(start|end): (-?[\d.]+)/g)) {
    const t = Math.max(0, Number(m[2]));
    if (m[1] === "start") sil.push([t, durS]);
    else if (sil.length) sil[sil.length - 1][1] = t;
  }
  // Tramos con sonido = complemento de los silencios.
  let voice = [], t = 0;
  for (const [a, b] of sil) { if (a > t + 1e-4) voice.push([t, a]); t = Math.max(t, b); }
  if (t < durS - 1e-4) voice.push([t, durS]);
  const short = (v) => v[1] - v[0] < CLICK_MAX_S;
  while (voice.length > 1 && short(voice[0]) && voice[1][0] - voice[0][1] >= CLICK_GAP_S) voice.shift();
  while (voice.length > 1 && short(voice[voice.length - 1]) && voice[voice.length - 1][0] - voice[voice.length - 2][1] >= CLICK_GAP_S) voice.pop();
  if (!voice.length || (voice.length === 1 && short(voice[0]) && voice[0][1] - voice[0][0] < 0.02)) {
    fail("no se detectó voz: el archivo está en silencio o es demasiado corto.", "SILENCIO");
  }
  return {
    startS: Math.max(0, voice[0][0] - KEEP_BEFORE_S),
    endS: Math.min(durS, voice[voice.length - 1][1] + KEEP_AFTER_S),
    durS
  };
}
const trimFilter = (b) => "atrim=start=" + b.startS.toFixed(4) + ":end=" + b.endS.toFixed(4) + ",asetpts=N/SR/TB";

/**
 * Mide la sonoridad del audio ya recortado y calcula la ganancia: { lufs, truePeakDb, gainDb }.
 * La ganancia es la menor entre la que lleva a TARGET_LUFS y la que deja el pico real en TARGET_TP_DB.
 * Si el audio es tan corto que loudnorm no puede medirlo, se usa el pico (volumedetect).
 */
async function measure(input, trim) {
  const err = await ffmpeg(["-i", input, "-af", BASE + "," + trim + ",loudnorm=I=" + TARGET_LUFS + ":TP=" + TARGET_TP_DB +
    ":LRA=11:print_format=json", "-f", "null", "-"]);
  const m = err.match(/\{[^{}]*"input_i"[^{}]*\}/);
  let lufs = NaN, tp = NaN;
  if (m) { const j = JSON.parse(m[0]); lufs = Number(j.input_i); tp = Number(j.input_tp); }
  if (Number.isFinite(lufs) && Number.isFinite(tp) && lufs > -70) {
    return { lufs, truePeakDb: tp, gainDb: Math.min(TARGET_LUFS - lufs, TARGET_TP_DB - tp) };
  }
  const err2 = await ffmpeg(["-i", input, "-af", BASE + "," + trim + ",volumedetect", "-f", "null", "-"]);
  const mv = /max_volume:\s*(-?[\d.]+|-inf) dB/.exec(err2);
  const peak = mv ? Number(mv[1]) : NaN;
  if (!Number.isFinite(peak) || peak < -80) fail("no se detectó sonido: el archivo está en silencio o es demasiado corto.", "SILENCIO");
  return { lufs: null, truePeakDb: peak, gainDb: TARGET_TP_DB - peak };
}

/**
 * Importa una grabación al catálogo.
 * @param {object} spec { input, key, kind, text, lang?, ipa?, vocab?, letters?, speaker?, region?, author,
 *   license, licenseUrl?, source, title?, notes?, root?, replace?, dryRun? }
 *   root: raíz del repositorio (por omisión, la carpeta de arriba de tools/).
 *   replace: permite reemplazar una entrada existente con la misma key de otro autor.
 *   sameAuthor(prev, entry): opcional; decide si la entrada existente es del mismo autor (por omisión,
 *     compara author).
 *   dryRun: solo valida y dice qué haría; no ejecuta ffmpeg ni escribe nada.
 * @returns {Promise<{ key, file, action, entry, gainDb?, lufs?, durationMs? }>}
 *   action: "nueva", "actualizada" o (con dryRun) "simulada-nueva" / "simulada-actualizada".
 * @throws {AudioError} códigos: KEY, KIND, LICENCIA, INVALIDO, ENTRADA, OTRO_AUTOR, SILENCIO, FFMPEG, FFPROBE, HERRAMIENTAS.
 */
export async function importAudio(spec) {
  const root = path.resolve(spec && spec.root ? spec.root : ROOT);
  const entry = buildEntry(spec);
  const input = spec.input ? path.resolve(String(spec.input)) : "";
  if (!input) fail("falta input (el archivo de audio que se importa).", "ENTRADA");
  let st;
  try { st = fs.statSync(input); } catch (e) { fail("no existe el archivo de entrada " + input + ".", "ENTRADA"); }
  if (!st.isFile() || st.size === 0) fail("el archivo de entrada " + input + " está vacío o no es un archivo.", "ENTRADA");
  if (st.size > MAX_INPUT_BYTES) fail("el archivo de entrada pesa más de 200 MB.", "ENTRADA");

  const prev = findEntry(readCatalog(root), entry.key);
  const same = typeof spec.sameAuthor === "function" ? spec.sameAuthor(prev, entry) : prev && prev.author === entry.author;
  if (prev && !same && !spec.replace) {
    fail("ya existe audio/" + entry.key + ".mp3 de otro autor («" + prev.author + "»); para reemplazarlo usa --replace (replace: true).", "OTRO_AUTOR");
  }
  const action = prev ? "actualizada" : "nueva";
  if (spec.dryRun) return { key: entry.key, file: entry.file, action: "simulada-" + action, entry };

  checkTools();
  const bounds = await speechBounds(input);
  const trim = trimFilter(bounds);
  const m = await measure(input, trim);
  if (m.gainDb > MAX_GAIN_DB) fail("la grabación es demasiado bajita (haría falta +" + m.gainDb.toFixed(0) + " dB).", "SILENCIO");
  const outDir = path.join(root, "audio");
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, entry.key + ".mp3");
  const tmp = path.join(outDir, "." + entry.key + ".tmp-" + process.pid + ".mp3");
  const af = [BASE, trim, "volume=" + m.gainDb.toFixed(2) + "dB", "adelay=" + PAD_MS + ":all=1",
    "apad=pad_dur=" + (PAD_MS / 1000).toFixed(3)].join(",");
  try {
    await ffmpeg(["-y", "-i", input, "-af", af, "-map", "0:a:0", "-map_metadata", "-1", "-ac", "1", "-ar", "44100",
      "-c:a", "libmp3lame", "-b:a", "64k", "-fflags", "+bitexact", "-flags:a", "+bitexact", "-id3v2_version", "0",
      "-f", "mp3", tmp]);
    const p = await probe(tmp);
    if (p.codec !== "mp3" || p.channels !== 1 || p.sampleRate !== 44100) {
      fail("el MP3 generado no cumple el contrato (" + p.codec + ", " + p.channels + " canal(es), " + p.sampleRate + " Hz).", "FFMPEG");
    }
    if (!(p.durationMs > 2 * PAD_MS)) fail("no quedó sonido después de recortar los silencios.", "SILENCIO");
    entry.durationMs = p.durationMs;
    fs.renameSync(tmp, out);
  } finally {
    try { fs.unlinkSync(tmp); } catch (e) { /* ya se movió o no se creó */ }
  }
  // Se vuelve a leer el catálogo justo antes de escribir, por si cambió mientras corría ffmpeg.
  const cat = readCatalog(root);
  const done = upsertEntry(cat, orderEntry(entry));
  writeCatalog(cat, root);
  return { key: entry.key, file: entry.file, action: done, entry: orderEntry(entry), gainDb: m.gainDb, lufs: m.lufs,
    durationMs: entry.durationMs, trimmedMs: Math.round((bounds.durS - (bounds.endS - bounds.startS)) * 1000) };
}

/** Carpeta temporal propia (se borra con la función que devuelve). */
export function tempDir(prefix = "koox-audio-") {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  return { dir, cleanup: () => fs.rmSync(dir, { recursive: true, force: true }) };
}
