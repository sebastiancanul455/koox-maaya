#!/usr/bin/env node
// Valida archivos de contenido de Ko'ox Maaya contra el contrato.
//   node test/validate.cjs                 -> todos los src/content/u*.js, el catálogo de audio
//                                             (audio/catalogo.json) y los recursos (src/content/recursos.js)
//   node test/validate.cjs --sample        -> el contenido de prueba (test/sample-content.js) con sus
//                                             audios y recursos (test/fixtures)
//   node test/validate.cjs a.js b.js ...   -> solo esos archivos de contenido (sin audio ni recursos,
//                                             que se refieren al curso completo)
//   --catalogo <ruta> / --recursos <ruta>  -> valida otro catálogo u otro archivo de recursos
// Sale con código 1 si hay errores.
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
// Sitios que alojan copias no autorizadas de libros: se cita solo el título, nunca el enlace.
const COPIAS = /dokumen\.(?:pub|tips)|scribd|pdfcoffee|studocu|idoc\.pub|doku\.pub|epdf\.pub|kupdf|vdocuments|pdfslide|1library/i;

const ROOT = path.resolve(__dirname, "..");
const argv = process.argv.slice(2);
const SAMPLE = argv.includes("--sample");
function optPath(name) {
  const i = argv.indexOf(name);
  if (i < 0) return null;
  if (!argv[i + 1] || argv[i + 1].startsWith("--")) { console.error("Falta la ruta después de " + name + "."); process.exit(2); }
  return path.resolve(argv[i + 1]);
}
const OPT_CAT = optPath("--catalogo"), OPT_RES = optPath("--recursos");
let files = argv.filter((a, i) => !a.startsWith("--") && !["--catalogo", "--recursos"].includes(argv[i - 1]));
const EXPLICIT = files.length > 0;
if (SAMPLE && !files.length) files = [path.join(ROOT, "test/sample-content.js")];
if (!files.length) {
  const dir = path.join(ROOT, "src/content");
  files = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => /^u\d+\.js$/.test(f))
        .sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10))
        .map((f) => path.join(dir, f))
    : [];
}
if (!files.length) { console.error("No hay archivos de contenido para validar."); process.exit(1); }

const errors = [];
const warnings = [];
const err = (file, where, msg) => errors.push(path.relative(ROOT, file) + " · " + where + ": " + msg);
const warn = (file, where, msg) => warnings.push(path.relative(ROOT, file) + " · " + where + ": " + msg);

const isStr = (x) => typeof x === "string" && x.trim().length > 0;
const isStrOrEmpty = (x) => typeof x === "string";
const TYPO_APOS = /[’‘ʼ´`′ʻ‛ʹ＇]/;
const normalize = (s) => String(s).toLowerCase().replace(/[’‘ʼ´`′ʻ]/g, "'")
  .replace(/[¿?¡!.,;:"“”«»()…]/g, " ").replace(/\s+/g, " ").trim();
const tileText = (w) => String(w).replace(/^[¿¡"«“(]+/, "").replace(/[?!.,;:"»”)…]+$/, "");
const KNOWN = {
  unit: ["id", "n", "title", "subtitle", "sources", "lessons"],
  lesson: ["id", "title", "goal", "teach", "vocab", "dialogue", "exercises"],
  vocab: ["id", "m", "es", "pr", "note", "ex", "alt", "conf"],
  choice: ["type", "q", "prompt", "promptLang", "answer", "options"],
  build: ["type", "es", "m", "distractors"],
  type: ["type", "q", "prompt", "answer", "alt"],
  fill: ["type", "es", "before", "after", "answer", "options"]
};
function extraKeys(file, where, obj, list) {
  Object.keys(obj).forEach((k) => { if (!list.includes(k)) warn(file, where, "campo desconocido «" + k + "» (se ignora)"); });
}
// Campos que contienen maya: no deben tener apóstrofos tipográficos.
function mayaStr(file, where, s) {
  if (typeof s === "string" && TYPO_APOS.test(s)) err(file, where, "usa un apóstrofo tipográfico; en maya va el recto ' (texto: " + JSON.stringify(s) + ")");
}
// html de tarjetas: solo <b>, <i>, <br>, <span class="m">.
function checkHtml(file, where, html) {
  const tagRe = /<\/?([a-zA-Z0-9]+)([^>]*)>/g;
  const stack = [];
  let m;
  const stripped = html.replace(tagRe, "");
  if (/[<>]/.test(stripped)) err(file, where, "contiene < o > sueltos; usa texto o las etiquetas permitidas");
  while ((m = tagRe.exec(html))) {
    const full = m[0], tag = m[1].toLowerCase(), attrs = m[2].trim(), closing = full.startsWith("</");
    if (tag === "br") { if (closing || (attrs && attrs !== "/")) err(file, where, "etiqueta no válida " + full); continue; }
    if (tag === "b" || tag === "i") {
      if (!closing && attrs) err(file, where, "<" + tag + "> no admite atributos: " + full);
    } else if (tag === "span") {
      if (!closing && !/^class=(["'])m\1$/.test(attrs)) err(file, where, "solo se permite <span class=\"m\">: " + full);
    } else { err(file, where, "etiqueta no permitida " + full); continue; }
    if (closing) {
      const top = stack.pop();
      if (top !== tag) err(file, where, "etiquetas mal cerradas cerca de " + full);
    } else stack.push(tag);
  }
  if (stack.length) err(file, where, "etiquetas sin cerrar: " + stack.join(", "));
  // Revisa el texto maya dentro de <span class="m">.
  const spanRe = /<span class=(["'])m\1>([\s\S]*?)<\/span>/g;
  while ((m = spanRe.exec(html))) { mayaStr(file, where + " <span class=\"m\">", m[2]); addText(m[2]); }
}
function checkOptions(file, where, ex, mayaOptions) {
  if (!Array.isArray(ex.options)) { err(file, where, "options debe ser una lista"); return; }
  if (ex.options.length < 3 || ex.options.length > 4) err(file, where, "options debe tener 3 o 4 opciones (tiene " + ex.options.length + ")");
  ex.options.forEach((o, i) => {
    if (!isStr(o)) err(file, where + ".options[" + i + "]", "opción vacía o no es texto");
    if (mayaOptions) mayaStr(file, where + ".options[" + i + "]", o);
  });
  const seen = new Set();
  ex.options.forEach((o) => { const k = String(o).trim(); if (seen.has(k)) err(file, where, "opción duplicada «" + k + "»"); seen.add(k); });
  if (!isStr(ex.answer)) err(file, where, "answer vacío");
  else if (!ex.options.includes(ex.answer)) err(file, where, "answer «" + ex.answer + "» no está en options");
}

const counts = { units: 0, lessons: 0, vocab: 0, vocabMedia: 0, cards: 0, dialogues: 0, exercises: 0, byType: {} };
const unitIds = new Set(), lessonIds = new Set(), vocabIds = new Map(), vocabForms = new Map(), lessonUnit = new Map();
// Textos mayas del curso (formas, ejemplos, diálogos, tarjetas, respuestas): un audio sin palabra ni
// letra solo suena donde su texto coincide con uno de estos.
const courseTexts = new Set();
const addText = (t) => { if (isStr(t)) courseTexts.add(normalize(t)); };
const mayaForms = new Map();
const sandbox = { window: {}, console: { log() {}, warn() {}, error() {} } };
vm.createContext(sandbox);
let guideFile = null, hasU1 = false;

for (const file of files) {
  let code;
  try { code = fs.readFileSync(file, "utf8"); } catch (e) { err(file, "archivo", "no se puede leer: " + e.message); continue; }
  const base = path.basename(file);
  if (code.includes("`")) err(file, "archivo", "contiene backticks (`); usa comillas dobles");
  if (/<\/script/i.test(code)) err(file, "archivo", "contiene </script");
  const before = sandbox.window.COURSE && Array.isArray(sandbox.window.COURSE.units) ? sandbox.window.COURSE.units.length : 0;
  const guideBefore = sandbox.window.COURSE ? sandbox.window.COURSE.guide : undefined;
  try { vm.runInContext(code, sandbox, { filename: base, timeout: 2000 }); }
  catch (e) { err(file, "archivo", "error al ejecutar: " + (e && e.message)); continue; }
  const C = sandbox.window.COURSE;
  if (!C || !Array.isArray(C.units)) { err(file, "archivo", "no definió window.COURSE.units"); continue; }
  const added = C.units.slice(before);
  const mUN = /^u(\d+)\.js$/.exec(base);
  if (mUN && added.length !== 1) err(file, "archivo", "debe agregar exactamente una unidad (agregó " + added.length + ")");
  if (!added.length) err(file, "archivo", "no agregó ninguna unidad");
  if (C.guide !== guideBefore) {
    if (guideFile) warn(file, "guide", "COURSE.guide ya lo había definido " + path.relative(ROOT, guideFile));
    guideFile = file;
  }

  added.forEach((u, ui) => {
    const uw = "unidad[" + ui + "]" + (u && u.id ? " " + u.id : "");
    if (!u || typeof u !== "object") { err(file, uw, "no es un objeto"); return; }
    extraKeys(file, uw, u, KNOWN.unit);
    counts.units++;
    if (!/^u\d+$/.test(String(u.id))) err(file, uw, "id debe tener formato uN");
    if (!Number.isInteger(u.n) || u.n < 1) err(file, uw, "n debe ser un entero positivo");
    if (u.id !== "u" + u.n) err(file, uw, "id («" + u.id + "») no coincide con n (" + u.n + ")");
    if (mUN && String(u.n) !== mUN[1]) err(file, uw, "el archivo " + base + " debe contener la unidad " + mUN[1]);
    if (u.n === 1) hasU1 = true;
    if (unitIds.has(u.id)) err(file, uw, "id de unidad repetido");
    unitIds.add(u.id);
    if (!isStr(u.title)) err(file, uw, "falta title");
    if (!isStr(u.subtitle)) err(file, uw, "falta subtitle");
    if (!Array.isArray(u.sources) || !u.sources.length) err(file, uw, "sources debe ser una lista con al menos una fuente");
    else u.sources.forEach((s, i) => {
      const sw = uw + ".sources[" + i + "]";
      if (!s || !isStr(s.title)) err(file, sw, "falta title");
      if (s && s.url != null && !/^https:\/\/[^\s]+$/.test(String(s.url))) err(file, sw, "url, si existe, debe empezar con https://");
      if (s && COPIAS.test(String(s.url || ""))) err(file, sw, "no enlazar copias no autorizadas (dokumen.pub, scribd, pdfcoffee, studocu…): cita el libro sin url");
      if (s && COPIAS.test(String(s.title || ""))) err(file, sw, "el título no debe nombrar el sitio de una copia no autorizada: cita solo la obra");
    });
    if (!Array.isArray(u.lessons) || !u.lessons.length) { err(file, uw, "lessons debe ser una lista no vacía"); return; }
    u.lessons.forEach((l, li) => {
      const lw = uw + " › lección[" + li + "]" + (l && l.id ? " " + l.id : "");
      if (!l || typeof l !== "object") { err(file, lw, "no es un objeto"); return; }
      extraKeys(file, lw, l, KNOWN.lesson);
      counts.lessons++;
      const expectId = u.id + "l" + (li + 1);
      if (l.id !== expectId) err(file, lw, "id debe ser «" + expectId + "» (consecutivo)");
      if (lessonIds.has(l.id)) err(file, lw, "id de lección repetido");
      lessonIds.add(l.id);
      lessonUnit.set(l.id, u.id);
      if (!isStr(l.title)) err(file, lw, "falta title");
      if (!isStr(l.goal)) err(file, lw, "falta goal");
      else if (!/^Al terminar podrás/.test(l.goal)) warn(file, lw, "goal debería empezar con «Al terminar podrás»");

      // Tarjetas
      if (!Array.isArray(l.teach) || l.teach.length < 1 || l.teach.length > 4) err(file, lw, "teach debe tener de 1 a 4 tarjetas");
      (Array.isArray(l.teach) ? l.teach : []).forEach((c, ci) => {
        const cw = lw + " › teach[" + ci + "]";
        counts.cards++;
        if (!c || typeof c !== "object") { err(file, cw, "no es un objeto"); return; }
        if (c.title !== undefined && !isStr(c.title)) err(file, cw, "title, si existe, debe ser texto no vacío");
        if (c.kind === "table") {
          Object.keys(c).forEach((k) => { if (!["kind", "title", "head", "rows"].includes(k)) warn(file, cw, "campo desconocido «" + k + "»"); });
          if (!Array.isArray(c.head) || !c.head.length || !c.head.every(isStr)) { err(file, cw, "head debe ser una lista de textos"); return; }
          if (!Array.isArray(c.rows) || !c.rows.length) { err(file, cw, "rows debe ser una lista no vacía"); return; }
          const mayaCols = c.head.map((h) => /^maya/i.test(h));
          c.rows.forEach((r, ri) => {
            if (!Array.isArray(r)) { err(file, cw + ".rows[" + ri + "]", "cada fila debe ser una lista"); return; }
            if (r.length !== c.head.length) err(file, cw + ".rows[" + ri + "]", "tiene " + r.length + " celdas y head tiene " + c.head.length);
            r.forEach((cell, k) => {
              if (typeof cell !== "string") err(file, cw + ".rows[" + ri + "][" + k + "]", "la celda debe ser texto");
              else if (/[<>]/.test(cell)) err(file, cw + ".rows[" + ri + "][" + k + "]", "las celdas son texto plano (sin etiquetas)");
              if (mayaCols[k]) { mayaStr(file, cw + ".rows[" + ri + "][" + k + "]", cell); addText(cell); }
            });
          });
        } else if (["text", "tip", "culture", "warn"].includes(c.kind)) {
          Object.keys(c).forEach((k) => { if (!["kind", "title", "html"].includes(k)) warn(file, cw, "campo desconocido «" + k + "»"); });
          if (!isStr(c.html)) err(file, cw, "falta html");
          else checkHtml(file, cw, c.html);
        } else err(file, cw, "kind no válido «" + c.kind + "»");
      });

      // Vocabulario
      const lessonM = new Set();
      if (!Array.isArray(l.vocab) || l.vocab.length < 5 || l.vocab.length > 12) err(file, lw, "vocab debe tener de 5 a 12 elementos (tiene " + (Array.isArray(l.vocab) ? l.vocab.length : 0) + ")");
      (Array.isArray(l.vocab) ? l.vocab : []).forEach((v, vi) => {
        const vw = lw + " › vocab[" + vi + "]" + (v && v.id ? " " + v.id : "");
        if (!v || typeof v !== "object") { err(file, vw, "no es un objeto"); return; }
        extraKeys(file, vw, v, KNOWN.vocab);
        counts.vocab++;
        if (!/^u\d+-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(v.id))) err(file, vw, "id debe tener formato uN-slug (minúsculas ascii y guiones)");
        else if (!String(v.id).startsWith(u.id + "-")) err(file, vw, "id debe empezar con «" + u.id + "-»");
        if (vocabIds.has(v.id)) err(file, vw, "id de vocab repetido (ya está en " + vocabIds.get(v.id) + ")");
        vocabIds.set(v.id, l.id);
        vocabForms.set(v.id, [v.m].concat(Array.isArray(v.alt) ? v.alt : []).filter(isStr).map(normalize));
        if (!isStr(v.m)) err(file, vw, "falta m"); else mayaStr(file, vw + ".m", v.m);
        if (!isStr(v.es)) err(file, vw, "falta es");
        if (v.conf !== "alta" && v.conf !== "media") err(file, vw, "conf debe ser \"alta\" o \"media\"");
        if (v.conf === "media") counts.vocabMedia++;
        ["pr", "note"].forEach((k) => { if (v[k] !== undefined && !isStr(v[k])) err(file, vw, k + ", si existe, debe ser texto no vacío"); });
        if (v.ex !== undefined) {
          if (!v.ex || !isStr(v.ex.m) || !isStr(v.ex.es)) err(file, vw, "ex debe ser { m, es } con textos no vacíos");
          else { mayaStr(file, vw + ".ex.m", v.ex.m); addText(v.ex.m); }
        }
        if (v.alt !== undefined) {
          if (!Array.isArray(v.alt) || !v.alt.every(isStr)) err(file, vw, "alt debe ser una lista de textos");
          else v.alt.forEach((a, ai) => mayaStr(file, vw + ".alt[" + ai + "]", a));
        }
        if (isStr(v.m)) {
          const k = normalize(v.m);
          if (lessonM.has(k)) warn(file, vw, "la misma forma maya aparece dos veces en la lección");
          lessonM.add(k);
          addText(v.m);
          if (Array.isArray(v.alt)) v.alt.forEach(addText);
          if (mayaForms.has(k) && mayaForms.get(k) !== v.id) warn(file, vw, "«" + v.m + "» ya existe como " + mayaForms.get(k));
          else mayaForms.set(k, v.id);
        }
      });

      // Diálogo
      if (l.dialogue !== undefined) {
        const d = l.dialogue, dw = lw + " › dialogue";
        counts.dialogues++;
        if (!d || typeof d !== "object") err(file, dw, "no es un objeto");
        else {
          if (!isStr(d.title)) err(file, dw, "falta title");
          if (!Array.isArray(d.lines) || d.lines.length < 2) err(file, dw, "lines debe tener al menos 2 líneas");
          else d.lines.forEach((ln, i) => {
            const w = dw + ".lines[" + i + "]";
            if (!ln || (ln.who !== "A" && ln.who !== "B")) err(file, w, "who debe ser \"A\" o \"B\"");
            if (!ln || !isStr(ln.name)) err(file, w, "falta name");
            if (!ln || !isStr(ln.m)) err(file, w, "falta m"); else { mayaStr(file, w + ".m", ln.m); addText(ln.m); }
            if (!ln || !isStr(ln.es)) err(file, w, "falta es");
          });
        }
      }

      // Ejercicios
      if (!Array.isArray(l.exercises) || l.exercises.length < 3 || l.exercises.length > 8) err(file, lw, "exercises debe tener de 3 a 8 ejercicios (tiene " + (Array.isArray(l.exercises) ? l.exercises.length : 0) + ")");
      (Array.isArray(l.exercises) ? l.exercises : []).forEach((ex, ei) => {
        const ew = lw + " › exercises[" + ei + "]" + (ex && ex.type ? " (" + ex.type + ")" : "");
        if (!ex || typeof ex !== "object") { err(file, ew, "no es un objeto"); return; }
        counts.exercises++;
        counts.byType[ex.type] = (counts.byType[ex.type] || 0) + 1;
        if (!KNOWN[ex.type] || ["unit", "lesson", "vocab"].includes(ex.type)) { err(file, ew, "type no válido «" + ex.type + "»"); return; }
        extraKeys(file, ew, ex, KNOWN[ex.type]);
        if (ex.type === "choice") {
          if (!isStr(ex.q)) err(file, ew, "falta q");
          if (!isStr(ex.prompt)) err(file, ew, "falta prompt");
          if (ex.promptLang !== "m" && ex.promptLang !== "es") err(file, ew, "promptLang debe ser \"m\" o \"es\"");
          if (ex.promptLang === "m") mayaStr(file, ew + ".prompt", ex.prompt);
          checkOptions(file, ew, ex, ex.promptLang === "es");
          if (ex.promptLang === "m") addText(ex.prompt); else if (isStr(ex.answer)) addText(ex.answer);
        } else if (ex.type === "fill") {
          if (!isStr(ex.es)) err(file, ew, "falta es");
          if (!isStrOrEmpty(ex.before) || !isStrOrEmpty(ex.after)) err(file, ew, "before y after deben ser textos (pueden estar vacíos)");
          mayaStr(file, ew + ".before", ex.before); mayaStr(file, ew + ".after", ex.after);
          if (!isStr(ex.before) && !isStr(ex.after)) warn(file, ew, "before y after están vacíos; el hueco queda sin contexto");
          checkOptions(file, ew, ex, true);
          if (isStr(ex.answer)) addText([ex.before, ex.answer].filter(isStr).join(" ") + (isStr(ex.after) ? " " + ex.after : ""));
        } else if (ex.type === "build") {
          if (!isStr(ex.es)) err(file, ew, "falta es");
          if (!isStr(ex.m)) { err(file, ew, "falta m"); return; }
          mayaStr(file, ew + ".m", ex.m);
          const ws = ex.m.split(/\s+/).filter(Boolean).map(tileText).filter(Boolean);
          if (ws.length < 2) err(file, ew, "m debe tener al menos 2 palabras para armar");
          if (!Array.isArray(ex.distractors)) err(file, ew, "distractors debe ser una lista (puede estar vacía)");
          else {
            const inM = new Set(ws.map(normalize));
            const seen = new Set();
            ex.distractors.forEach((d, i) => {
              if (!isStr(d)) { err(file, ew + ".distractors[" + i + "]", "vacío o no es texto"); return; }
              mayaStr(file, ew + ".distractors[" + i + "]", d);
              if (/\s/.test(d.trim())) warn(file, ew + ".distractors[" + i + "]", "un distractor debería ser una sola palabra");
              const k = normalize(tileText(d));
              if (inM.has(k)) err(file, ew + ".distractors[" + i + "]", "«" + d + "» aparece en m");
              if (seen.has(k)) err(file, ew + ".distractors[" + i + "]", "distractor duplicado");
              seen.add(k);
            });
          }
          addText(ex.m);
        } else if (ex.type === "type") {
          addText(ex.answer);
          if (!isStr(ex.q)) err(file, ew, "falta q");
          if (!isStr(ex.prompt)) err(file, ew, "falta prompt");
          if (!isStr(ex.answer)) err(file, ew, "answer vacío"); else mayaStr(file, ew + ".answer", ex.answer);
          if (ex.alt !== undefined) {
            if (!Array.isArray(ex.alt) || !ex.alt.every(isStr)) err(file, ew, "alt debe ser una lista de textos");
            else ex.alt.forEach((a, i) => mayaStr(file, ew + ".alt[" + i + "]", a));
          }
        }
      });
    });
  });
}

// Guía de pronunciación
const C = sandbox.window.COURSE || {};
if (hasU1) {
  const g = C.guide;
  if (!g || !Array.isArray(g.alphabet) || !g.alphabet.length) errors.push("guide: la unidad 1 debe definir window.COURSE.guide.alphabet (lista no vacía)");
  else g.alphabet.forEach((a, i) => {
    if (a && a.ex) addText(a.ex.m);
    const gw = "guide.alphabet[" + i + "]";
    if (!a || !isStr(a.l)) errors.push(gw + ": falta l");
    if (!a || !isStr(a.desc)) errors.push(gw + ": falta desc");
    if (a && a.ex !== undefined && (!a.ex || !isStr(a.ex.m) || !isStr(a.ex.es))) errors.push(gw + ": ex debe ser { m, es }");
    if (a && a.ex && TYPO_APOS.test(a.ex.m || "")) errors.push(gw + ".ex.m: usa un apóstrofo tipográfico");
  });
  if (guideFile && /^u\d+\.js$/.test(path.basename(guideFile)) && path.basename(guideFile) !== "u1.js") warnings.push("guide: lo definió " + path.basename(guideFile) + "; debería estar en u1.js");
} else if (C.guide) {
  warnings.push("guide: definido fuera de la unidad 1");
}

/* ---------------- Audio (catálogo) ---------------- */
const AUDIO_KINDS = ["nativo", "fonema", "sintetico"];
const AUDIO_FIELDS = ["key", "file", "kind", "text", "lang", "ipa", "vocab", "letters", "speaker", "region", "author", "license", "licenseUrl", "source", "title", "durationMs", "notes"];
const LICENCIAS = ["CC BY-SA 4.0", "CC BY 4.0", "CC0 1.0", "Dominio público", "CC BY-NC 4.0", "CC BY-NC-SA 4.0", "CC BY-SA 3.0", "CC BY 3.0", "CC BY-SA 2.5", "CC BY 2.5", "CC BY-SA 2.0", "CC BY 2.0"];
// Primer encabezado de cuadro MPEG de un archivo (saltando la etiqueta ID3v2): capa, frecuencia, canales, kbps.
function mp3Info(buf) {
  let i = 0;
  if (buf.length >= 10 && buf.toString("latin1", 0, 3) === "ID3") {
    const size = ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f);
    i = 10 + size + (buf[5] & 0x10 ? 10 : 0);
  }
  const BR1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
  const BR2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
  for (const lim = Math.min(buf.length - 4, i + 65536); i <= lim; i++) {
    if (buf[i] !== 0xff || (buf[i + 1] & 0xe0) !== 0xe0) continue;
    const ver = (buf[i + 1] >> 3) & 3, layer = (buf[i + 1] >> 1) & 3, br = buf[i + 2] >> 4, sr = (buf[i + 2] >> 2) & 3, ch = buf[i + 3] >> 6;
    if (ver === 1 || layer === 0 || br === 0 || br === 15 || sr === 3) continue;
    const rates = ver === 3 ? [44100, 48000, 32000] : ver === 2 ? [22050, 24000, 16000] : [11025, 12000, 8000];
    return { layer: 4 - layer, sampleRate: rates[sr], mono: ch === 3, kbps: layer === 1 ? (ver === 3 ? BR1 : BR2)[br] : null };
  }
  return null;
}
// La base de "file": la raíz si el catálogo está en audio/ (audio/catalogo.json), si no su carpeta (test/fixtures).
function audioBase(catalog) {
  const dir = path.dirname(catalog);
  return path.basename(dir) === "audio" ? path.dirname(dir) : dir;
}
const audioCounts = { total: 0, bytes: 0, byKind: {} };
function validateAudio(catalog) {
  const rel = path.relative(ROOT, catalog);
  if (!fs.existsSync(catalog)) { warnings.push(rel + ": no existe; la app no tendrá audio."); return; }
  const where = (i, key) => rel + " · entries[" + i + "]" + (key ? " " + key : "");
  let data;
  try { data = JSON.parse(fs.readFileSync(catalog, "utf8")); }
  catch (e) { errors.push(rel + ": no es JSON válido: " + e.message); return; }
  if (!data || typeof data !== "object") { errors.push(rel + ": debe ser un objeto { version, entries }"); return; }
  if (data.version !== 1) errors.push(rel + ": version debe ser 1");
  if (!Array.isArray(data.entries)) { errors.push(rel + ": entries debe ser una lista"); return; }
  const base = audioBase(catalog);
  const letters = new Set(((C.guide && Array.isArray(C.guide.alphabet)) ? C.guide.alphabet : []).map((a) => a && a.l).filter(isStr));
  const keys = new Set(), usados = new Set(), sinUso = [];
  data.entries.forEach((e, i) => {
    if (!e || typeof e !== "object") { errors.push(where(i) + ": no es un objeto"); return; }
    const w = where(i, e.key);
    const E = (m) => errors.push(w + ": " + m), W = (m) => warnings.push(w + ": " + m);
    Object.keys(e).forEach((k) => { if (!AUDIO_FIELDS.includes(k)) W("campo desconocido «" + k + "» (se ignora)"); });
    audioCounts.total++;
    if (!isStr(e.key) || !/^[a-z0-9-]+$/.test(e.key)) E("key debe tener solo minúsculas ascii, números y guiones ([a-z0-9-]+)");
    else if (keys.has(e.key)) E("key repetida");
    keys.add(e.key);
    if (e.file !== "audio/" + e.key + ".mp3") E("file debe ser «audio/" + e.key + ".mp3» (tiene " + JSON.stringify(e.file) + ")");
    else {
      const abs = path.join(base, e.file);
      usados.add(path.basename(e.file));
      if (!fs.existsSync(abs)) E("no existe el archivo " + path.relative(ROOT, abs));
      else {
        const buf = fs.readFileSync(abs);
        audioCounts.bytes += buf.length;
        const info = mp3Info(buf);
        if (!info || info.layer !== 3) E(e.file + " no es un MP3 (MPEG capa III)");
        else {
          if (!info.mono) E(e.file + " debe ser mono (el contrato es MP3 mono, 44.1 kHz, 64 kbps); conviértelo con tools/audio-import.mjs");
          if (info.sampleRate !== 44100) E(e.file + " debe ser de 44.1 kHz (tiene " + info.sampleRate + " Hz)");
          if (info.kbps !== 64) W(e.file + " no parece de 64 kbps (primer cuadro: " + info.kbps + " kbps)");
        }
        if (buf.length > 300 * 1024) W("pesa " + (buf.length / 1024).toFixed(0) + " KB; un audio de palabra o frase no debería pasar de 300 KB");
      }
    }
    if (!AUDIO_KINDS.includes(e.kind)) E("kind debe ser \"nativo\", \"fonema\" o \"sintetico\"");
    else audioCounts.byKind[e.kind] = (audioCounts.byKind[e.kind] || 0) + 1;
    if (!isStr(e.text)) E("falta text (lo que se oye: la forma maya o el símbolo)");
    if (e.lang !== "yua" && e.lang !== "und") E("lang debe ser \"yua\" o \"und\"");
    if (e.lang === "yua") mayaStr(catalog, "entries[" + i + "].text", e.text);
    if (e.ipa !== undefined && !isStr(e.ipa)) E("ipa, si existe, debe ser texto");
    if (e.kind === "fonema" && !isStr(e.ipa)) W("un «fonema» debería llevar ipa (p. ej. \"[ʃ]\")");
    ["vocab", "letters"].forEach((k) => { if (!Array.isArray(e[k]) || !e[k].every(isStr)) E(k + " debe ser una lista de textos (puede estar vacía)"); });
    if (Array.isArray(e.vocab)) e.vocab.forEach((id) => {
      if (!vocabIds.has(id)) E("vocab «" + id + "» no existe en el curso");
      else if (isStr(e.text) && e.kind !== "fonema" && !vocabForms.get(id).includes(normalize(e.text))) W("text «" + e.text + "» no coincide con la forma de la palabra " + id + " (¿es la grabación correcta?)");
    });
    if (Array.isArray(e.letters)) e.letters.forEach((l) => { if (!letters.has(l)) E("letters «" + l + "» no está en COURSE.guide.alphabet"); });
    if (Array.isArray(e.vocab) && Array.isArray(e.letters) && !e.vocab.length && !e.letters.length && isStr(e.text) && e.kind !== "fonema" && !courseTexts.has(normalize(e.text))) sinUso.push(e.key + " («" + e.text + "»)");
    ["author", "license", "source"].forEach((k) => { if (!isStr(e[k])) E("falta " + k + " (los créditos son obligatorios)"); });
    if (isStr(e.license) && !LICENCIAS.includes(e.license)) W("licencia «" + e.license + "» poco común; revisa que permita publicar el audio");
    if (e.licenseUrl !== undefined && !/^https:\/\/\S+$/.test(String(e.licenseUrl))) E("licenseUrl, si existe, debe empezar con https://");
    if (isStr(e.source) && /^[a-z]+:/i.test(e.source) && !/^https:\/\/\S+$/.test(e.source)) E("source: un enlace debe empezar con https://");
    if (isStr(e.source) && COPIAS.test(e.source)) E("source: no enlazar copias no autorizadas");
    ["speaker", "region", "title", "notes"].forEach((k) => { if (e[k] !== undefined && !isStr(e[k])) E(k + ", si existe, debe ser texto no vacío"); });
    if (e.durationMs !== undefined && !(typeof e.durationMs === "number" && e.durationMs > 0)) E("durationMs, si existe, debe ser un número positivo");
    else if (e.durationMs > 15000) W("dura " + (e.durationMs / 1000).toFixed(1) + " s; ¿es una palabra o frase corta?");
    if (e.kind === "sintetico" && !(isStr(e.notes) && /aproxima/i.test(e.notes))) {
      E("un audio «sintetico» debe llevar notes que expliquen que es aproximado (p. ej. \"Voz sintética aproximada; no sustituye a un hablante.\")");
    }
  });
  if (sinUso.length) warnings.push(rel + ": " + sinUso.length + " " + (sinUso.length === 1 ? "audio no ilustra" : "audios no ilustran") +
    " ninguna palabra ni letra y su texto no aparece en el curso, así que no " + (sinUso.length === 1 ? "sonará" : "sonarán") + ": " + sinUso.slice(0, 5).join(", ") + (sinUso.length > 5 ? "…" : ""));
  const dir = path.join(base, "audio");
  const sueltos = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /\.mp3$/i.test(f) && !usados.has(f)) : [];
  if (sueltos.length) warnings.push(path.relative(ROOT, dir) + ": " + sueltos.length + " MP3 no están en el catálogo (no se publican): " + sueltos.slice(0, 5).join(", ") + (sueltos.length > 5 ? "…" : ""));
}

/* ---------------- Recursos para escuchar ---------------- */
const RES_FIELDS = ["id", "title", "url", "kind", "source", "lang", "units", "lessons", "credibility", "note"];
const RES_KINDS = ["youtube", "spotify", "podcast", "radio", "web", "app"];
const RES_LANGS = ["yua", "es", "yua-es", "en"];
const RES_CRED = ["institucional", "hablante nativo", "docente", "otro"];
let resCount = 0;
function validateResources(file) {
  const rel = path.relative(ROOT, file);
  if (!fs.existsSync(file)) { warnings.push(rel + ": no existe; no habrá «Para escuchar más»."); return; }
  const code = fs.readFileSync(file, "utf8");
  if (code.includes("`")) errors.push(rel + ": contiene backticks (`); usa comillas dobles");
  if (/<\/script/i.test(code)) errors.push(rel + ": contiene </script");
  const box = { window: {}, console: { log() {}, warn() {}, error() {} } };
  vm.createContext(box);
  try { vm.runInContext(code, box, { filename: path.basename(file), timeout: 2000 }); }
  catch (e) { errors.push(rel + ": error al ejecutar: " + (e && e.message)); return; }
  const list = box.window.COURSE_RESOURCES;
  if (!Array.isArray(list)) { errors.push(rel + ": no definió window.COURSE_RESOURCES como lista"); return; }
  const ids = new Set();
  list.forEach((r, i) => {
    const w = rel + " · recurso[" + i + "]" + (r && r.id ? " " + r.id : "");
    const E = (m) => errors.push(w + ": " + m), W = (m) => warnings.push(w + ": " + m);
    if (!r || typeof r !== "object") { E("no es un objeto"); return; }
    resCount++;
    Object.keys(r).forEach((k) => { if (!RES_FIELDS.includes(k)) W("campo desconocido «" + k + "» (se ignora)"); });
    if (!isStr(r.id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r.id)) E("id debe tener solo minúsculas ascii, números y guiones");
    else if (ids.has(r.id)) E("id repetido");
    ids.add(r.id);
    if (!isStr(r.title)) E("falta title");
    if (!isStr(r.url) || !/^https:\/\/\S+$/.test(r.url)) E("url debe empezar con https://");
    else if (COPIAS.test(r.url)) E("url: no enlazar copias no autorizadas");
    if (!RES_KINDS.includes(r.kind)) E("kind debe ser uno de: " + RES_KINDS.join(", "));
    if (!isStr(r.source)) E("falta source (canal o autor)");
    if (!RES_LANGS.includes(r.lang)) E("lang debe ser uno de: " + RES_LANGS.join(", "));
    if (!RES_CRED.includes(r.credibility)) E("credibility debe ser uno de: " + RES_CRED.join(", "));
    if (!Array.isArray(r.units) || !r.units.length) E("units debe ser una lista con al menos una unidad");
    else r.units.forEach((u) => { if (!unitIds.has(u)) E("la unidad «" + u + "» no existe"); });
    if (r.lessons !== undefined) {
      if (!Array.isArray(r.lessons) || !r.lessons.length) E("lessons, si existe, debe ser una lista no vacía");
      else r.lessons.forEach((l) => {
        if (!lessonIds.has(l)) E("la lección «" + l + "» no existe");
        else if (Array.isArray(r.units) && !r.units.includes(lessonUnit.get(l))) E("la lección «" + l + "» es de " + lessonUnit.get(l) + ", que no está en units");
      });
    }
    if (r.note !== undefined && !isStr(r.note)) E("note, si existe, debe ser texto no vacío");
  });
}

const allCourse = SAMPLE || !EXPLICIT;
const catalogFile = OPT_CAT || (allCourse ? path.join(ROOT, SAMPLE ? "test/fixtures/catalogo.json" : "audio/catalogo.json") : null);
const resourcesFile = OPT_RES || (allCourse ? path.join(ROOT, SAMPLE ? "test/fixtures/recursos.js" : "src/content/recursos.js") : null);
if (catalogFile) validateAudio(catalogFile);
// audio/CREDITOS.md (la atribución de cada audio) se genera del catálogo con tools/creditos.mjs: avisa si quedó viejo.
if (catalogFile && path.basename(path.dirname(catalogFile)) === "audio" && fs.existsSync(path.join(ROOT, "tools", "creditos.mjs"))) {
  try {
    require("child_process").execFileSync(process.execPath, [path.join(ROOT, "tools", "creditos.mjs"), "--check", "--root", audioBase(catalogFile)], { stdio: "pipe" });
  } catch (e) {
    warnings.push(path.relative(ROOT, path.join(path.dirname(catalogFile), "CREDITOS.md")) + ": no está al día con el catálogo; corre node tools/creditos.mjs");
  }
}
if (resourcesFile) validateResources(resourcesFile);

console.log("Ko'ox Maaya · validación de contenido");
console.log("Archivos: " + files.map((f) => path.relative(ROOT, f)).join(", "));
console.log("Unidades: " + counts.units + " · Lecciones: " + counts.lessons + " · Tarjetas: " + counts.cards + " · Diálogos: " + counts.dialogues);
console.log("Vocab: " + counts.vocab + " (" + counts.vocabMedia + " por confirmar) · Ejercicios: " + counts.exercises + " " +
  JSON.stringify(counts.byType));
if (C.guide && Array.isArray(C.guide.alphabet)) console.log("Guía: " + C.guide.alphabet.length + " letras");
if (catalogFile) console.log("Audio (" + path.relative(ROOT, catalogFile) + "): " + audioCounts.total + " " + (audioCounts.total === 1 ? "entrada" : "entradas") +
  (audioCounts.total ? " " + JSON.stringify(audioCounts.byKind) + " · " + (audioCounts.bytes / 1024).toFixed(1) + " KB" : ""));
else console.log("Audio y recursos: no se validan con una lista de archivos (se refieren al curso completo; usa --catalogo / --recursos).");
if (resourcesFile) console.log("Recursos (" + path.relative(ROOT, resourcesFile) + "): " + resCount);
if (warnings.length) { console.log("\nAvisos (" + warnings.length + "):"); warnings.forEach((w) => console.log("  · " + w)); }
if (errors.length) {
  console.log("\nERRORES (" + errors.length + "):");
  errors.forEach((e) => console.log("  ✗ " + e));
  process.exit(1);
}
console.log("\nOK: sin errores.");
