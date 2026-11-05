#!/usr/bin/env node
// Escribe audio/CREDITOS.md a partir de audio/catalogo.json: la atribución completa de cada audio (título,
// autor, licencia con enlace, página de origen y cambios) y una entrada por cada conjunto de voz sintética.
//   node tools/creditos.mjs            escribe audio/CREDITOS.md
//   node tools/creditos.mjs --check    solo comprueba que esté al día (sale con 1 si no)
//   node tools/creditos.mjs --root <carpeta>
// Córrelo después de importar audio (tools/audio-import.mjs, tools/import-recordings.mjs o
// tools/commons/fetch-pendientes.py); test/validate.cjs avisa si quedó desactualizado.
import fs from "fs";
import path from "path";
import { readCatalog, ROOT as LIB_ROOT, LICENSES, TARGET_LUFS, TARGET_TP_DB, PAD_MS } from "./audio-lib.mjs";

const args = process.argv.slice(2);
const ri = args.indexOf("--root");
const ROOT = ri >= 0 && args[ri + 1] ? path.resolve(args[ri + 1]) : LIB_ROOT;
const CHECK = args.includes("--check");
const OUT = path.join(ROOT, "audio", "CREDITOS.md");

const KIND_TITLE = { fonema: "Sonidos de referencia (AFI)", nativo: "Voces nativas", sintetico: "Voz sintética (aproximada)" };
// Celdas de tabla y textos de enlace: sin saltos de línea ni barras verticales.
const cell = (s) => String(s == null ? "" : s).replace(/\s+/g, " ").replace(/\|/g, "\\|").trim();
const linkText = (s) => cell(s).replace(/([[\]])/g, "\\$1");
// Destino de enlace sin espacios ni paréntesis sueltos (p. ej. «LL-Q13354_(yua)-…»).
const href = (u) => String(u).replace(/ /g, "%20").replace(/\(/g, "%28").replace(/\)/g, "%29");
const isUrl = (s) => /^https:\/\/\S+$/.test(String(s || ""));
const link = (text, url) => (isUrl(url) ? "[" + linkText(text) + "](" + href(url) + ")" : cell(text));
const licenseLink = (e) => link(e.license, e.licenseUrl || (LICENSES[e.license] || {}).url);
const CHANGES = "Recortado (silencio inicial y final), volumen normalizado y convertido a MP3";

export function creditsMarkdown(cat) {
  const entries = cat.entries.slice();
  const by = (k) => entries.filter((e) => e.kind === k);
  const n = (k) => by(k).length;
  const L = [];
  L.push("# Créditos de audio");
  L.push("");
  L.push("Atribución de cada audio de Ko'ox Maaya. Este archivo lo genera `node tools/creditos.mjs` a partir de");
  L.push("`audio/catalogo.json`: no se edita a mano.");
  L.push("");
  L.push("En total hay **" + entries.length + "** audios: " + n("fonema") + " sonidos de referencia (AFI), " + n("nativo") + " de voces nativas y " +
    n("sintetico") + " de voz sintética (aproximada).");
  L.push("");
  L.push("**Cambios hechos a todos los audios.** `tools/audio-import.mjs` recorta el silencio del inicio y del final,");
  L.push("normaliza el volumen (unos " + TARGET_LUFS + " LUFS, pico de " + TARGET_TP_DB + " dB, como ganancia lineal), agrega " + PAD_MS + " ms de silencio a");
  L.push("cada lado y lo convierte a MP3 mono de 44.1 kHz y 64 kbps. No se cambia nada más: ni el tono, ni la velocidad, ni");
  L.push("el contenido. Cada audio derivado conserva la licencia de su original; los de licencia CC BY-SA se publican con");
  L.push("la misma licencia (CC BY-SA, «compartir igual»), con la atribución que sigue.");
  L.push("");

  // --- Sonidos de referencia (AFI) ---
  L.push("## " + KIND_TITLE.fonema);
  L.push("");
  if (!n("fonema")) L.push("Todavía no hay sonidos de referencia.");
  else {
    L.push("Sonidos aislados del Alfabeto Fonético Internacional, de Wikimedia Commons. No son grabaciones de hablantes de");
    L.push("maya: ilustran el sonido de una letra de la guía de pronunciación.");
    L.push("");
    L.push("| Archivo | Sonido | Letra de la guía | Original (título y página en Commons) | Autor | Licencia | Cambios |");
    L.push("| --- | --- | --- | --- | --- | --- | --- |");
    for (const e of by("fonema")) {
      L.push("| `" + e.file + "` | " + cell(e.ipa || e.text) + " | " + cell((e.letters || []).map((l) => "«" + l + "»").join(", ")) + " | " +
        link(e.title || e.source, e.source) + " | " + cell(e.author) + " | " + licenseLink(e) + " | " + CHANGES + " |");
    }
  }
  L.push("");

  // --- Voces nativas ---
  L.push("## " + KIND_TITLE.nativo);
  L.push("");
  if (!n("nativo")) {
    L.push("Todavía no hay grabaciones de hablantes. Se agregan con `grabar.html` y `tools/import-recordings.mjs`, o con");
    L.push("`tools/commons/fetch-pendientes.py` (cuatro grabaciones de Wikimedia Commons pendientes de descargar).");
  } else {
    L.push("| Archivo | Se oye | Hablante | Autor | Licencia | Fuente | Cambios |");
    L.push("| --- | --- | --- | --- | --- | --- | --- |");
    for (const e of by("nativo")) {
      const who = [e.speaker, e.region].filter(Boolean).join(" · ");
      L.push("| `" + e.file + "` | " + cell(e.text) + " | " + cell(who || "—") + " | " + cell(e.author) + " | " + licenseLink(e) + " | " +
        (isUrl(e.source) ? link(e.title || e.source, e.source) : cell(e.source)) + " | " + CHANGES + " |");
    }
  }
  L.push("");

  // --- Voz sintética: una entrada por modelo y licencia ---
  L.push("## " + KIND_TITLE.sintetico);
  L.push("");
  if (!n("sintetico")) L.push("No hay audios sintéticos.");
  const groups = new Map();
  for (const e of by("sintetico")) {
    const k = [e.author, e.license, e.licenseUrl, e.source].join("\n");
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(e);
  }
  for (const list of groups.values()) {
    const e = list[0];
    const model = isUrl(e.source) ? e.source.replace(/^https:\/\/(huggingface\.co\/)?/, "") : e.source;
    L.push("- **" + cell(e.author) + "**: " + list.length + " audios (`audio/s-*.mp3`), generados con el modelo " + link(model, e.source) +
      " del proyecto Massively Multilingual Speech (Pratap et al., 2023, «Scaling Speech Technology to 1,000+ Languages»).");
    L.push("  Licencia: " + licenseLink(e) + (/\bNC\b/.test(e.license) ? ": solo uso no comercial. Por eso estos audios, y la app que los incluye, son de uso" : "."));
    if (/\bNC\b/.test(e.license)) L.push("  no comercial.");
    L.push("  Se generaron con `tools/tts-mms.py` y se aceptó cada uno solo si el reconocedor MMS-1B-all (adaptador yua) lo");
    L.push("  transcribe bien (CER ≤ 0.25, y CER = 0 en palabras de hasta 4 letras). Son aproximados: pueden equivocarse en el tono,");
    L.push("  el saltillo y las consonantes glotalizadas, y no sustituyen la voz de un hablante.");
  }
  L.push("");
  return L.join("\n");
}

const isMain = path.resolve(process.argv[1] || "") === path.resolve(new URL(import.meta.url).pathname);
if (isMain) {
  const md = creditsMarkdown(readCatalog(ROOT));
  const prev = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : null;
  if (CHECK) {
    if (prev === md) { console.log("audio/CREDITOS.md está al día."); process.exit(0); }
    console.log("audio/CREDITOS.md no está al día: corre node tools/creditos.mjs");
    process.exit(1);
  }
  if (prev === md) console.log("audio/CREDITOS.md ya estaba al día.");
  else { fs.writeFileSync(OUT, md); console.log("Escrito audio/CREDITOS.md"); }
}
