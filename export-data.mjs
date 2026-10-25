#!/usr/bin/env node
// Exporta el vocabulario de Ko'ox Maaya a archivos de datos y a una hoja de revisión.
//   node export-data.mjs            -> data/glosario.json, data/glosario.csv,
//                                      revision/hoja-revision.csv, revision/hoja-revision.html
//   node export-data.mjs --detalle  -> además lista, palabra por palabra, los avisos de coherencia
// Lee src/content/u*.js en un vm (igual que test/validate.cjs) y las bases kb/*.verified.json
// y las reverificaciones kb/recheck-*.json, kb/recheck3-*.json, … (recheckN: pasada N; la más alta
// manda). Solo usa módulos de Node (fs, path, url, vm).
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DETALLE = process.argv.includes("--detalle");
const fail = (msg) => { console.error("ERROR: " + msg); process.exit(1); };
const rel = (p) => path.relative(ROOT, p).split(path.sep).join("/");

/* ---------------- Normalización ---------------- */
// Forma maya para emparejar: minúsculas, apóstrofos tipográficos -> ', sin signos de puntuación.
// Los acentos se conservan: en maya marcan el tono y distinguen palabras (k'iin / k'íin).
const normM = (s) => String(s == null ? "" : s).normalize("NFC").toLowerCase()
  .replace(/[’‘ʼ´`′ʻ‛ʹ＇]/g, "'")
  .replace(/[¿?¡!.,;:"“”«»()…]/g, " ").replace(/\s+/g, " ").trim();
// Glosa en español para detectar homónimos (Jo' «Mérida» y jo' «cinco»): sin acentos ni signos.
const STOP = new Set(["de", "del", "la", "el", "los", "las", "un", "una", "unos", "unas", "y", "o", "u", "e", "a", "al",
  "en", "se", "que", "con", "por", "para", "su", "sus", "lo", "le", "les", "es", "no", "mi", "tu", "algo", "cosa", "etc"]);
const glossNorm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
  .replace(/[^a-z0-9]+/g, " ").trim();
const glossWords = (s, conStop) => new Set(glossNorm(s).split(" ").filter((w) => w.length >= 2 && (conStop || !STOP.has(w))));
const overlap = (a, b) => { for (const w of a) if (b.has(w)) return true; return false; };
// ¿Comparten significado? Misma glosa, o alguna palabra de contenido en común; si una glosa solo
// tiene palabras vacías («no», «¿qué?», «y; con»), se comparan todas sus palabras.
function mismaGlosa(a, b) {
  if (glossNorm(a) === glossNorm(b)) return true;
  const wa = glossWords(a, false), wb = glossWords(b, false);
  return wa.size && wb.size ? overlap(wa, wb) : overlap(glossWords(a, true), glossWords(b, true));
}

/* ---------------- Fuentes ---------------- */
// Sitios que alojan copias no autorizadas de libros: se cita solo el título, nunca el enlace.
const BLOQUEADOS = ["dokumen.pub", "dokumen.tips", "scribd.com", "pdfcoffee.com", "studocu.com", "idoc.pub",
  "doku.pub", "epdf.pub", "kupdf.net", "vdocuments.mx", "vdocuments.net", "pdfslide.net", "1library.co"];
const RE_BLOQ = /dokumen\.pub|dokumen\.tips|scribd|pdfcoffee|studocu|idoc\.pub|doku\.pub|epdf\.pub|kupdf|vdocuments|pdfslide|1library/i;
const hostOf = (u) => { try { return new URL(u).hostname.toLowerCase(); } catch (e) { return ""; } };
const bloqueado = (u) => { const h = hostOf(u); return BLOQUEADOS.some((b) => h === b || h.endsWith("." + b)); };

// Quita del título las menciones al sitio de la copia («(copia en dokumen.pub)», «(Scribd)», «subido a Scribd»)
// y las notas internas que no aportan al lector («(sin url)», «(citado por título)»).
const H = "(?:dokumen\\.pub|dokumen\\.tips|idoc\\.pub|scribd|pdfcoffee|studocu)";
const LIMPIEZA = [
  [new RegExp(",\\s*copia en " + H, "gi"), ""],
  [new RegExp("\\s*\\((?:copia en |material docente en |documento en |en )?" + H + "\\)", "gi"), ""],
  [new RegExp("\\((?:documento |material |copia )?en " + H + ":\\s*", "gi"), "("],
  [new RegExp("\\s+(?:subid[oa] a|en|de) " + H + "\\b", "gi"), ""],
  [new RegExp("\\s*\\b" + H + "\\b", "gi"), ""]
];
const NOTAS = [
  [/\s*\(sin url\)/gi, ""], [/;\s*sin url\b/gi, ""], [/\s*\(citado por título\)/gi, ""],
  [/\s*\(resultado de la búsqueda \d+\)/gi, ""], [/\s*\([^()]*copia consultada[^()]*\)/gi, ""]
];
function limpiarTitulo(t) {
  let s = String(t || "").replace(/\s+/g, " ").trim();
  const reglas = RE_BLOQ.test(s) ? LIMPIEZA.concat(NOTAS) : NOTAS;
  for (const [re, rep] of reglas) s = s.replace(re, rep);
  return s.replace(/\(\s*\)/g, "").replace(/\s+([,:;.)])/g, "$1").replace(/\s+/g, " ").replace(/[\s,;:–-]+$/, "").trim();
}
// Copias Kiwix de Wiktionary (contenido libre): se enlaza la página original.
function urlCanonica(u) {
  const m = /\/wiktionary_en_all_[^/]+\/(?:A\/)?([^?#]+)$/.exec(u);
  return m ? "https://en.wiktionary.org/wiki/" + m[1] : u;
}
const claveUrl = (u) => {
  try {
    const x = new URL(u);
    let p = x.pathname; try { p = decodeURI(p); } catch (e) { /* se deja como está */ }
    return x.hostname.toLowerCase().replace(/^www\./, "") + p.replace(/\/+$/, "") + x.search;
  } catch (e) { return String(u); }
};
const tituloDeUrl = (u) => { try { const x = new URL(u); return x.hostname.replace(/^www\./, "") + decodeURI(x.pathname); } catch (e) { return String(u); } };

// Devuelve { titulo, url? } o null si no queda nada que citar.
function fuente(titulo, url) {
  let t = String(titulo || "").replace(/\s+/g, " ").trim();
  let u = typeof url === "string" && /^https?:\/\/\S+$/i.test(url.trim()) ? url.trim() : undefined;
  const omitida = u && bloqueado(u) ? u : null;
  if (omitida) u = undefined;
  if (u) u = urlCanonica(u);
  t = limpiarTitulo(t);
  if (!t && u) t = tituloDeUrl(u);
  if (!t) return null;
  const f = u ? { titulo: t, url: u } : { titulo: t };
  // Marca invisible (no sale en el JSON) para contar los enlaces que se omitieron.
  if (omitida) Object.defineProperty(f, "omitida", { value: omitida, enumerable: false });
  return f;
}
function dedupe(list) {
  const out = [], seen = new Set(), seenT = new Set();
  for (const f of list) {
    if (!f) continue;
    const kt = "t:" + normM(f.titulo);
    const k = f.url ? "u:" + claveUrl(f.url) : kt;
    if (seen.has(k) || (!f.url && seenT.has(kt))) continue;
    seen.add(k); seenT.add(kt);
    out.push(f);
  }
  return out;
}

/* ---------------- Contenido (src/content/u*.js) ---------------- */
const dirC = path.join(ROOT, "src/content");
const archivos = fs.existsSync(dirC)
  ? fs.readdirSync(dirC).filter((f) => /^u\d+\.js$/.test(f)).sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10))
  : [];
if (!archivos.length) fail("no hay archivos src/content/u*.js.");
const sandbox = { window: {}, console: { log() {}, warn() {}, error() {} } };
vm.createContext(sandbox);
for (const f of archivos) {
  const code = fs.readFileSync(path.join(dirC, f), "utf8");
  try { vm.runInContext(code, sandbox, { filename: f, timeout: 2000 }); }
  catch (e) { fail("src/content/" + f + " no se pudo ejecutar: " + (e && e.message) + ". Corre node test/validate.cjs."); }
}
const C = sandbox.window.COURSE;
if (!C || !Array.isArray(C.units) || !C.units.length) fail("el contenido no definió window.COURSE.units.");
// Copia plana (los objetos del vm son de otro contexto).
const units = JSON.parse(JSON.stringify(C.units)).sort((a, b) => a.n - b.n);

/* ---------------- Bases de conocimiento (kb/) ---------------- */
const dirK = path.join(ROOT, "kb");
// Reverificaciones: recheck-*.json (pasada 2) y recheckN-*.json (pasada N). Nivel 0 = base inicial.
const RE_RECHECK = /^recheck(\d*)-.*\.json$/;
const nivelDe = (f) => { const m = RE_RECHECK.exec(f); return m ? (m[1] ? parseInt(m[1], 10) : 2) : 0; };
const kbFiles = fs.existsSync(dirK)
  ? fs.readdirSync(dirK).filter((f) => /\.verified\.json$/.test(f) || RE_RECHECK.test(f)).sort()
  : [];
if (!kbFiles.length) console.warn("AVISO: no hay bases kb/*.verified.json ni kb/recheck*-*.json; las fuentes saldrán de las unidades.");
const RANGO = { verificado: 0, probable: 1, dudoso: 2 };
const indice = new Map(); // forma normalizada -> [{ es, estado, reciente (nivel de la pasada), archivo, fuentes }]
let nEntradasKb = 0;
const titulosGlobales = new Map();
const kbData = kbFiles.map((f) => {
  let d;
  try { d = JSON.parse(fs.readFileSync(path.join(dirK, f), "utf8")); }
  catch (e) { fail("kb/" + f + " no es JSON válido: " + e.message); }
  (d.sources || []).forEach((s) => { if (s && s.url && s.title && !titulosGlobales.has(s.url)) titulosGlobales.set(s.url, s.title); });
  (d.items || []).forEach((it) => (it.sources || []).forEach((s) => {
    if (s && typeof s === "object" && s.url && s.title && !titulosGlobales.has(s.url)) titulosGlobales.set(s.url, s.title);
  }));
  return { f, d };
});
units.forEach((u) => (u.sources || []).forEach((s) => { if (s && s.url && s.title && !titulosGlobales.has(s.url)) titulosGlobales.set(s.url, s.title); }));

// indice: forma de una entrada -> registros; indiceEj: forma de un ejemplo de la base -> registros
// (el ejemplo de una entrada o de un punto de gramática, con las fuentes de esa entrada o punto).
const indiceEj = new Map();
function agregar(mapa, m, reg) {
  if (typeof m !== "string" || !m.trim()) return;
  const k = normM(m);
  if (!mapa.has(k)) mapa.set(k, []);
  mapa.get(k).push(reg);
  if (mapa === indice) nEntradasKb++;
}
for (const { f, d } of kbData) {
  const reciente = nivelDe(f);
  const local = new Map((d.sources || []).filter((s) => s && s.url).map((s) => [s.url, s.title]));
  const fuenteDe = (s) => typeof s === "string"
    ? fuente(local.get(s) || titulosGlobales.get(s), s)
    : s && typeof s === "object" ? fuente(s.title || titulosGlobales.get(s.url), s.url) : null;
  const fuentesDe = (e) => [].concat(e.sources || [], e.verifierSources || []).map(fuenteDe).filter(Boolean);
  const filas = reciente ? d.items || [] : d.entries || [];
  for (const e of filas) {
    if (!e || typeof e !== "object") continue;
    const srcs = fuentesDe(e);
    agregar(indice, e.m, { es: e.es, estado: String(e.status || ""), reciente, archivo: f, fuentes: srcs });
    if (e.ex && typeof e.ex === "object") {
      agregar(indiceEj, e.ex.m, { es: e.ex.es, estado: String(e.ex.status || e.exStatus || e.status || ""), reciente, archivo: f, fuentes: srcs });
    }
  }
  for (const g of d.grammar || []) {
    if (!g || !Array.isArray(g.examples)) continue;
    const srcs = fuentesDe(g);
    g.examples.forEach((x, i) => {
      if (!x || typeof x !== "object") return;
      const est = x.status || (Array.isArray(g.exampleStatus) ? g.exampleStatus[i] : g.exampleStatus) || g.status;
      agregar(indiceEj, x.m, { es: x.es, estado: String(est || ""), reciente, archivo: f, fuentes: srcs });
    });
  }
}

/* ---------------- Glosario ---------------- */
const glosario = [];
const avisos = { incorrecta: [], ultimaIncorrecta: [], sinKb: [], altaDudosa: [], homonimo: [] };
let conKb = 0, conEj = 0, conUnidad = 0;
const rango = (e) => RANGO[e] ?? 3;
// Elige los registros que respaldan la palabra: sin los marcados «incorrecto» y, si hay homónimos
// (Jo' «Mérida» y jo' «cinco»), solo los que comparten significado; si ninguno lo comparte, ninguno.
function elegir(regs, v) {
  const validas = regs.filter((e) => e.estado !== "incorrecto");
  const conGlosa = validas.filter((e) => mismaGlosa(v.es, e.es));
  const usadas = conGlosa.slice().sort((a, b) => (b.reciente - a.reciente) || (rango(a.estado) - rango(b.estado)));
  // Estado más reciente: el de la última pasada de reverificación que trae la forma; si no, el de la base.
  const ultima = usadas.reduce((n, e) => Math.max(n, e.reciente), 0);
  const ref = usadas.filter((e) => e.reciente === ultima);
  const estado = ref.length ? ref.map((e) => e.estado).sort((a, b) => rango(a) - rango(b))[0] : null;
  // ¿La última pasada que trae la forma (con la misma glosa) solo la da como incorrecta?
  const mismas = regs.filter((e) => mismaGlosa(v.es, e.es));
  const nMax = mismas.reduce((n, e) => Math.max(n, e.reciente), 0);
  const enMax = mismas.filter((e) => e.reciente === nMax);
  const ultimaIncorrecta = enMax.length > 0 && enMax.every((e) => e.estado === "incorrecto") && validas.length > 0;
  return { usadas, estado, soloIncorrecta: regs.length > 0 && !validas.length, otraGlosa: validas.length > 0 && !conGlosa.length, validas, ultimaIncorrecta };
}
units.forEach((u) => {
  const fuentesUnidad = dedupe((u.sources || []).map((s) => s && fuente(s.title, s.url)));
  (u.lessons || []).forEach((l, li) => {
    (l.vocab || []).forEach((v, vi) => {
      const k = normM(v.m);
      // Primero las entradas de la base con esa forma; si no hay, los ejemplos de la base con esa forma.
      const dir = elegir(indice.get(k) || [], v);
      const ej = dir.usadas.length ? null : elegir(indiceEj.get(k) || [], v);
      const sel = dir.usadas.length ? dir : ej.usadas.length ? ej : dir;
      const usadas = sel.usadas;
      if (dir.soloIncorrecta && !usadas.length) avisos.incorrecta.push(v);
      if (dir.ultimaIncorrecta) avisos.ultimaIncorrecta.push(v);
      if (dir.otraGlosa && !usadas.length) avisos.homonimo.push({ v, es: [...new Set(dir.validas.map((e) => e.es))] });
      if (!usadas.length) avisos.sinKb.push(v);
      else if (v.conf === "alta" && sel.estado !== "verificado" && sel.estado !== "probable") avisos.altaDudosa.push({ v, estado: sel.estado });

      // Fuentes de la unidad que nombran la forma en su título (p. ej. «letra W (waaj, wakax)»).
      const nombran = k.replace(/[\s']/g, "").length >= 3
        ? fuentesUnidad.filter((s) => (" " + normM(s.titulo).replace(/[–—-]/g, " ") + " ").includes(" " + k + " "))
        : [];
      let fuentes = dedupe([].concat(...usadas.map((e) => e.fuentes), nombran));
      if (dir.usadas.length) conKb++; else if (usadas.length) conEj++; else conUnidad++;
      if (!fuentes.length) fuentes = fuentesUnidad;

      glosario.push({
        id: v.id,
        unidad: u.id,
        unidadTitulo: u.title,
        leccion: l.id,
        leccionTitulo: l.title,
        maya: v.m,
        espanol: v.es,
        variantes: Array.isArray(v.alt) ? v.alt.slice() : [],
        pronunciacion: v.pr || null,
        nota: v.note || null,
        ejemplo: v.ex && v.ex.m ? { maya: v.ex.m, espanol: v.ex.es } : null,
        confianza: v.conf === "alta" ? "alta" : "media",
        fuentes,
        _orden: [u.n, li, vi]
      });
    });
  });
});
if (!glosario.length) fail("el contenido no tiene vocabulario.");
const idsVistos = new Set();
glosario.forEach((g) => { if (idsVistos.has(g.id)) console.warn("AVISO: id repetido " + g.id); idsVistos.add(g.id); });

/* ---------------- CSV ---------------- */
// RFC 4180: comillas solo cuando hacen falta, comillas internas duplicadas, fin de línea CRLF, BOM para Excel.
// Una celda que empieza con = + - @ sería una fórmula en Excel u hojas de Google: el guion inicial
// (sufijos mayas como -p'éel) se cambia por el guion que no separa (U+2011), que se ve igual;
// los demás se protegen con un apóstrofo.
function celda(x) {
  let s = x == null ? "" : String(x);
  if (/^-/.test(s)) s = "\u2011" + s.slice(1);
  else if (/^[=+@\t\r]/.test(s)) s = "'" + s;
  return /[",\r\n]/.test(s) || /^\s|\s$/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
const csv = (cab, filas) => "\uFEFF" + [cab].concat(filas).map((r) => r.map(celda).join(",")).join("\r\n") + "\r\n";
const fuentesTexto = (fs_) => fs_.map((f) => f.url ? f.titulo + " <" + f.url + ">" : f.titulo).join(" | ");

const salida = glosario.map(({ _orden, ...g }) => g);
const csvGlosario = csv(
  ["id", "unidad", "unidad_titulo", "leccion", "leccion_titulo", "maya", "espanol", "variantes", "pronunciacion", "nota",
    "ejemplo_maya", "ejemplo_espanol", "confianza", "fuentes"],
  salida.map((g) => [g.id, g.unidad, g.unidadTitulo, g.leccion, g.leccionTitulo, g.maya, g.espanol, g.variantes.join(" | "),
    g.pronunciacion, g.nota, g.ejemplo && g.ejemplo.maya, g.ejemplo && g.ejemplo.espanol, g.confianza, fuentesTexto(g.fuentes)])
);

// Hoja de revisión: primero las de confianza media, luego las demás; dentro, por unidad, lección y orden.
const cmp = (a, b) => a._orden[0] - b._orden[0] || a._orden[1] - b._orden[1] || a._orden[2] - b._orden[2];
const revision = glosario.filter((g) => g.confianza === "media").sort(cmp)
  .concat(glosario.filter((g) => g.confianza !== "media").sort(cmp));
const mayaConVariantes = (g) => g.maya + (g.variantes.length ? " (también: " + g.variantes.join(", ") + ")" : "");
const CAB_REV = ["id", "maya", "español", "ejemplo maya", "ejemplo español", "confianza", "¿Es correcto? (sí/no)", "Corrección", "Comentario"];
const csvRevision = csv(CAB_REV, revision.map((g) => [g.id, mayaConVariantes(g), g.espanol,
  g.ejemplo ? g.ejemplo.maya : "", g.ejemplo ? g.ejemplo.espanol : "", g.confianza, "", "", ""]));

/* ---------------- HTML de la hoja ---------------- */
const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const hoy = new Date().toISOString().slice(0, 10);
const nMedia = revision.filter((g) => g.confianza === "media").length;
const nAlta = revision.length - nMedia;

function tabla(lista) {
  let h = '<table class="hoja"><colgroup><col class="c-id"><col class="c-m"><col class="c-es"><col class="c-exm"><col class="c-exes">' +
    '<col class="c-conf"><col class="c-ok"><col class="c-corr"><col class="c-com"></colgroup><thead><tr><th scope="col">Id</th><th scope="col">Maya</th><th scope="col">Español</th>' +
    '<th scope="col">Ejemplo en maya</th><th scope="col">Ejemplo en español</th><th scope="col">Confianza</th>' +
    '<th scope="col">¿Es correcto?</th><th scope="col">Corrección</th><th scope="col">Comentario</th></tr></thead><tbody>';
  let ultima = "";
  lista.forEach((g) => {
    if (g.leccion !== ultima) {
      ultima = g.leccion;
      h += '<tr class="grp"><th colspan="9" scope="rowgroup">Unidad ' + g._orden[0] + " · " + esc(g.unidadTitulo) +
        ' <span class="sep">—</span> Lección ' + (g._orden[1] + 1) + ": " + esc(g.leccionTitulo) + "</th></tr>";
    }
    const conf = g.confianza === "media" ? '<span class="conf media">media<span class="pc"> · por confirmar</span></span>' : '<span class="conf alta">alta</span>';
    const ej = g.ejemplo;
    h += '<tr class="fila" data-id="' + esc(g.id) + '">' +
      '<td data-label="Id" class="id">' + esc(g.id) + "</td>" +
      '<td data-label="Maya" class="m" lang="yua"><b>' + esc(g.maya) + "</b>" +
        (g.variantes.length ? '<span class="var">también: ' + g.variantes.map(esc).join(", ") + "</span>" : "") + "</td>" +
      '<td data-label="Español">' + esc(g.espanol) + "</td>" +
      (ej ? '<td data-label="Ejemplo en maya" class="m" lang="yua">' + esc(ej.maya) + "</td>" +
        '<td data-label="Ejemplo en español">' + esc(ej.espanol) + "</td>"
        : '<td data-label="Ejemplo en maya" class="vacio"><span class="nada">—</span></td>' +
        '<td data-label="Ejemplo en español" class="vacio"><span class="nada">—</span></td>') +
      '<td data-label="Confianza">' + conf + "</td>" +
      '<td data-label="¿Es correcto?" class="ok"><span class="sino"><label><input type="checkbox" data-k="si" aria-label="' + esc(g.maya) +
        ': sí es correcto"> sí</label><label><input type="checkbox" data-k="no" aria-label="' + esc(g.maya) + ': no es correcto"> no</label></span></td>' +
      '<td data-label="Corrección" class="esc"><textarea rows="2" data-k="corr" aria-label="Corrección para ' + esc(g.maya) + '"></textarea></td>' +
      '<td data-label="Comentario" class="esc"><textarea rows="2" data-k="com" aria-label="Comentario sobre ' + esc(g.maya) + '"></textarea></td>' +
      "</tr>";
  });
  return h + "</tbody></table>";
}

const datosJs = JSON.stringify({
  cab: CAB_REV,
  filas: revision.map((g) => [g.id, mayaConVariantes(g), g.espanol, g.ejemplo ? g.ejemplo.maya : "", g.ejemplo ? g.ejemplo.espanol : "", g.confianza])
}).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>Hoja de revisión · Ko'ox Maaya</title>
<style>
:root{--bg:#fbfaf7;--fg:#1d1b18;--muted:#5f5a52;--line:#cfc8bc;--soft:#f1ede5;--accent:#1f6f5c;--media:#8a4b00;--media-bg:#fff1dc;--alta:#1f6f5c;--alta-bg:#e3f2ec;--field:#fff}
@media (prefers-color-scheme: dark){:root{--bg:#171614;--fg:#ece8e1;--muted:#a8a197;--line:#4a463f;--soft:#24221f;--accent:#7fd1b9;--media:#ffc27a;--media-bg:#3a2a14;--alta:#8fe0c4;--alta-bg:#163028;--field:#1f1e1b}}
*{box-sizing:border-box}
[hidden]{display:none!important}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,"Noto Sans",sans-serif}
.wrap{max-width:1280px;margin:0 auto;padding:20px 16px 48px}
h1{font-size:1.5rem;line-height:1.25;margin:0 0 4px}
h2{font-size:1.15rem;margin:28px 0 6px}
.sub{color:var(--muted);margin:0 0 16px}
.instr{background:var(--soft);border:1px solid var(--line);border-radius:10px;padding:12px 16px;margin:0 0 16px}
.instr h2{margin:0 0 6px;font-size:1.05rem}
.instr ol{margin:0;padding-left:1.3em}
.instr li{margin:3px 0}
.meta{display:flex;flex-wrap:wrap;gap:10px 20px;margin:0 0 16px}
.meta label{display:flex;flex-direction:column;gap:2px;font-size:.9rem;color:var(--muted);flex:1 1 220px}
.meta input{font:inherit;color:var(--fg);background:var(--field);border:1px solid var(--line);border-radius:6px;padding:8px 10px;min-height:42px}
.toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 8px}
.toolbar button{font:inherit;font-size:.95rem;border-radius:999px;border:1px solid var(--accent);background:transparent;color:var(--accent);padding:8px 14px;min-height:42px;cursor:pointer}
.toolbar button.prim{background:var(--accent);color:var(--bg)}
.toolbar .prog{color:var(--muted);font-size:.9rem}
.nota-js{color:var(--muted);font-size:.85rem;margin:0}
table.hoja{width:100%;border-collapse:collapse;font-size:.92rem}
.hoja th,.hoja td{border:1px solid var(--line);padding:6px 8px;vertical-align:top;text-align:left}
.hoja thead th{background:var(--soft);font-size:.82rem}
.hoja tr.grp th{background:var(--soft);font-weight:600;font-size:.88rem}
.hoja .sep{color:var(--muted)}
.hoja td.id{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.78rem;color:var(--muted);white-space:nowrap}
.hoja td.m b{font-weight:650}
.instr [lang=yua]{font-weight:600}
.var{display:block;font-size:.82rem;color:var(--muted);font-style:italic}
.nada{color:var(--muted)}
.conf{display:inline-block;border-radius:6px;padding:1px 6px;font-size:.8rem;white-space:nowrap}
.conf.media{background:var(--media-bg);color:var(--media)}
.conf.alta{background:var(--alta-bg);color:var(--alta)}
td.ok{white-space:nowrap}
.sino{display:inline-flex;flex-wrap:wrap;gap:4px 12px}
td.ok label{display:inline-flex;align-items:center;gap:4px;min-height:32px;cursor:pointer}
td.ok input{width:20px;height:20px;margin:0;accent-color:var(--accent)}
td.esc{min-width:150px}
td.esc textarea{width:100%;min-height:3.2em;font:inherit;font-size:.9rem;color:var(--fg);background:var(--field);border:1px solid var(--line);border-radius:4px;padding:4px 6px;resize:vertical}
tr.hecha td.id{color:var(--accent);font-weight:600}
footer{margin-top:28px;color:var(--muted);font-size:.85rem}
@media screen and (max-width:760px){
  .hoja,.hoja tbody,.hoja tr,.hoja td,.hoja th{display:block;width:100%}
  .hoja thead{display:none}
  .hoja tr.grp th{border:0;background:transparent;padding:18px 2px 6px;font-size:1rem}
  .hoja tr.fila{border:1px solid var(--line);border-radius:10px;margin:0 0 10px;padding:6px 10px;background:var(--field)}
  .hoja tr.fila td{border:0;padding:4px 0;display:grid;grid-template-columns:7.2em 1fr;gap:8px}
  .hoja tr.fila td::before{content:attr(data-label);color:var(--muted);font-size:.8rem;font-family:system-ui,sans-serif;font-style:normal;padding-top:2px}
  .hoja td.id{white-space:normal}
  .hoja tr.fila td.vacio{display:none}
  .sino{gap:4px 24px}
  td.ok label{min-height:40px}
  td.ok input{width:24px;height:24px}
  td.esc{min-width:0}
}
@media print{
  @page{size:A4 landscape;margin:10mm}
  :root{--bg:#fff;--fg:#000;--muted:#444;--line:#888;--soft:#eee;--accent:#000;--media:#000;--media-bg:#fff;--alta:#000;--alta-bg:#fff;--field:#fff}
  body{font-size:9.5pt}
  .wrap{max-width:none;padding:0}
  .no-print{display:none!important}
  .instr{border-color:#888}
  table.hoja{font-size:8.5pt;table-layout:fixed}
  .hoja col.c-id{width:9.5%}.hoja col.c-m,.hoja col.c-es,.hoja col.c-exm{width:12.5%}.hoja col.c-exes{width:11%}
  .hoja col.c-conf{width:7%}.hoja col.c-ok{width:8%}.hoja col.c-corr,.hoja col.c-com{width:13.5%}
  .hoja th,.hoja td{padding:3px 4px;overflow-wrap:anywhere}
  .hoja thead th{overflow-wrap:normal;font-size:7.5pt}
  .hoja td.id{white-space:normal;word-break:break-all;font-size:7pt}
  .conf .pc{display:none}
  .sino{flex-wrap:nowrap;gap:2px 8px}
  td.ok label{min-height:0}
  td.esc{min-width:0}
  .hoja thead{display:table-header-group}
  .hoja tr{break-inside:avoid;page-break-inside:avoid}
  .hoja tr.grp{break-after:avoid;page-break-after:avoid}
  .conf{padding:0;border:0}
  .conf.media{font-weight:700}
  td.esc textarea{border:0;resize:none;min-height:3em;height:3em;padding:0;background:transparent;overflow:hidden}
  td.ok input{width:13px;height:13px}
  .meta input{border:0;border-bottom:1px solid #000;border-radius:0;min-height:28px}
  section.grupo + section.grupo{break-before:page;page-break-before:always}
}
</style>
</head>
<body>
<div class="wrap">
<header>
<h1>Ko'ox Maaya · Hoja de revisión del vocabulario</h1>
<p class="sub">Para una persona hablante de maya yucateco. ${revision.length} palabras: ${nMedia} por confirmar y ${nAlta} de confianza alta. Generada el ${hoy}.</p>
<section class="instr" aria-labelledby="t-instr">
<h2 id="t-instr">Instrucciones</h2>
<ol>
<li>Revise primero la sección 1 (<b>por confirmar</b>): son las formas de las que tenemos menos certeza.</li>
<li>En cada palabra fíjese en cuatro cosas: si está <b>bien escrita</b>, si <b>significa</b> lo que dice la columna «Español», si el ejemplo <b>suena natural</b> y si en su región se dice <b>de otra forma</b>.</li>
<li>Marque <b>sí</b> si todo está bien. Marque <b>no</b> si algo está mal y escriba en «Corrección» la forma como usted la diría.</li>
<li>Use «Comentario» para variantes de su región, otro significado o cualquier duda. Si no está seguro, déjela en blanco: no pasa nada.</li>
<li>La ortografía sigue las normas de escritura de 2014: apóstrofo para el corte de voz (<span class="m" lang="yua">ja'</span>), vocal doble para la vocal larga (<span class="m" lang="yua">kaan</span>) y acento para el tono alto (<span class="m" lang="yua">yáax</span>). Si usted escribe distinto, anótelo en «Comentario».</li>
<li>Para devolverla: imprímala y márquela con pluma (tome fotos claras de cada hoja), o llénela aquí en el celular y toque «Descargar respuestas».</li>
</ol>
</section>
<div class="meta">
<label>Región o comunidad donde aprendió el maya<input type="text" id="meta-region" autocomplete="off"></label>
<label>Fecha de la revisión<input type="text" id="meta-fecha" autocomplete="off" placeholder="día / mes / año"></label>
</div>
<div class="toolbar no-print" id="toolbar" hidden>
<button type="button" class="prim" id="b-descargar">Descargar respuestas (CSV)</button>
<button type="button" id="b-compartir" hidden>Compartir respuestas</button>
<button type="button" id="b-imprimir">Imprimir</button>
<button type="button" id="b-borrar">Borrar mis respuestas</button>
<span class="prog" id="prog" aria-live="polite"></span>
</div>
<p class="nota-js no-print" id="nota-js" hidden>Sus respuestas se guardan solo en este navegador mientras llena la hoja. Al terminar, descárguelas y envíe el archivo.</p>
</header>
<main>
<section class="grupo" aria-labelledby="g1">
<h2 id="g1">1. Por confirmar (confianza media) · ${nMedia} palabras</h2>
${tabla(revision.filter((g) => g.confianza === "media"))}
</section>
<section class="grupo" aria-labelledby="g2">
<h2 id="g2">2. Confianza alta · ${nAlta} palabras</h2>
${tabla(revision.filter((g) => g.confianza !== "media"))}
</section>
</main>
<footer>
<p>Ko'ox Maaya es una app para aprender maya yucateco desde el español. El contenido se preparó con ayuda de inteligencia artificial y se cotejó con fuentes públicas; esta revisión por hablantes es la que puede confirmarlo. Muchas gracias. Dios bo'otik.</p>
</footer>
</div>
<script type="application/json" id="datos">${datosJs}</script>
<script>
(function () {
  "use strict";
  var KEY = "koox-maaya-revision-v1";
  var datos;
  try { datos = JSON.parse(document.getElementById("datos").textContent); } catch (e) { return; }
  var filas = Array.prototype.slice.call(document.querySelectorAll("tr.fila"));
  var st = { meta: {}, r: {} };
  try { var g = JSON.parse(localStorage.getItem(KEY) || "null"); if (g && typeof g === "object" && g.r) st = { meta: g.meta || {}, r: g.r }; } catch (e) { /* sin almacenamiento */ }
  function guardar() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* sin almacenamiento */ } }
  var prog = document.getElementById("prog");
  function hecha(r) { return !!(r && (r.ok || r.corr || r.com)); }
  function progreso() {
    var n = 0;
    filas.forEach(function (tr) { var h = hecha(st.r[tr.getAttribute("data-id")]); tr.classList.toggle("hecha", h); if (h) n++; });
    prog.textContent = n + " de " + filas.length + " revisadas";
  }
  function pintar(tr) {
    var r = st.r[tr.getAttribute("data-id")] || {};
    tr.querySelector('[data-k="si"]').checked = r.ok === "sí";
    tr.querySelector('[data-k="no"]').checked = r.ok === "no";
    tr.querySelector('[data-k="corr"]').value = r.corr || "";
    tr.querySelector('[data-k="com"]').value = r.com || "";
  }
  filas.forEach(function (tr) {
    var id = tr.getAttribute("data-id");
    pintar(tr);
    tr.addEventListener("input", function (ev) {
      var t = ev.target, k = t.getAttribute("data-k");
      if (!k) return;
      var r = st.r[id] || (st.r[id] = {});
      if (k === "si" || k === "no") {
        var otro = tr.querySelector('[data-k="' + (k === "si" ? "no" : "si") + '"]');
        if (t.checked) { otro.checked = false; r.ok = k === "si" ? "sí" : "no"; } else r.ok = "";
      } else r[k] = t.value;
      if (!hecha(r)) delete st.r[id];
      guardar(); progreso();
    });
  });
  ["region", "fecha"].forEach(function (k) {
    var inp = document.getElementById("meta-" + k);
    inp.value = st.meta[k] || "";
    inp.addEventListener("input", function () { st.meta[k] = inp.value; guardar(); });
  });
  function celda(x) {
    var s = x == null ? "" : String(x);
    if (/^-/.test(s)) s = "\\u2011" + s.slice(1); else if (/^[=+@\\t\\r]/.test(s)) s = "'" + s;
    return /[",\\r\\n]/.test(s) || /^\\s|\\s$/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function csvRespuestas() {
    var rows = [datos.cab].concat(datos.filas.map(function (f) {
      var r = st.r[f[0]] || {};
      return f.concat([r.ok || "", r.corr || "", r.com || ""]);
    }));
    var m = st.meta || {};
    if (m.region || m.fecha) rows.push(["(datos de la revisión)", "", "", "", "", "", "", "", "Región o comunidad: " + (m.region || "") + "; fecha: " + (m.fecha || "")]);
    return "\\uFEFF" + rows.map(function (r) { return r.map(celda).join(","); }).join("\\r\\n") + "\\r\\n";
  }
  function nombre() { return "hoja-revision-respuestas-" + new Date().toISOString().slice(0, 10) + ".csv"; }
  document.getElementById("b-descargar").addEventListener("click", function () {
    var blob = new Blob([csvRespuestas()], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = nombre();
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  });
  var bc = document.getElementById("b-compartir");
  try {
    var prueba = new File(["x"], "x.csv", { type: "text/csv" });
    if (navigator.canShare && navigator.share && navigator.canShare({ files: [prueba] })) {
      bc.hidden = false;
      bc.addEventListener("click", function () {
        var f = new File([csvRespuestas()], nombre(), { type: "text/csv" });
        navigator.share({ files: [f], title: "Ko'ox Maaya · respuestas de la revisión" }).catch(function () {});
      });
    }
  } catch (e) { /* sin Web Share */ }
  document.getElementById("b-imprimir").addEventListener("click", function () { window.print(); });
  document.getElementById("b-borrar").addEventListener("click", function () {
    if (!window.confirm("¿Borrar todas sus respuestas de este navegador?")) return;
    st = { meta: {}, r: {} }; guardar();
    filas.forEach(pintar);
    ["region", "fecha"].forEach(function (k) { document.getElementById("meta-" + k).value = ""; });
    progreso();
  });
  document.getElementById("toolbar").hidden = false;
  document.getElementById("nota-js").hidden = false;
  progreso();
})();
</script>
</body>
</html>
`;

/* ---------------- Escritura ---------------- */
const escribir = (p, s) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); };
const pJson = path.join(ROOT, "data/glosario.json");
const pCsv = path.join(ROOT, "data/glosario.csv");
const pRevCsv = path.join(ROOT, "revision/hoja-revision.csv");
const pRevHtml = path.join(ROOT, "revision/hoja-revision.html");
escribir(pJson, JSON.stringify(salida, null, 2) + "\n");
escribir(pCsv, csvGlosario);
escribir(pRevCsv, csvRevision);
escribir(pRevHtml, html);

// Comprobación final: ningún archivo exportado enlaza copias no autorizadas.
for (const p of [pJson, pCsv, pRevCsv, pRevHtml]) {
  const t = fs.readFileSync(p, "utf8");
  if (RE_BLOQ.test(t)) fail(rel(p) + " menciona un sitio de copias no autorizadas.");
}

/* ---------------- Conteos ---------------- */
const porUnidad = units.map((u) => {
  const g = glosario.filter((x) => x.unidad === u.id);
  return "  " + u.id + " " + u.title + ": " + g.length + " (" + g.filter((x) => x.confianza === "media").length + " por confirmar)";
});
const fuentesUnicas = dedupe([].concat(...glosario.map((g) => g.fuentes)));
const enlacesOmitidos = new Set([].concat(...glosario.map((g) => g.fuentes)).filter((f) => f.omitida).map((f) => f.omitida)).size;
console.log("Ko'ox Maaya · exportación de datos");
console.log("Contenido: " + archivos.map((f) => "src/content/" + f).join(", "));
console.log("Bases: " + (kbFiles.map((f) => "kb/" + f).join(", ") || "ninguna") + " (" + nEntradasKb + " entradas, " + indice.size + " formas)");
console.log("Unidades: " + units.length + " · Lecciones: " + units.reduce((n, u) => n + (u.lessons || []).length, 0) +
  " · Palabras: " + glosario.length + " (" + nMedia + " confianza media, " + nAlta + " alta) · Con ejemplo: " + glosario.filter((g) => g.ejemplo).length);
porUnidad.forEach((l) => console.log(l));
console.log("Fuentes: " + conKb + " palabras con fuentes de una entrada de kb/, " + conEj + " de un ejemplo de kb/, " +
  conUnidad + " solo de la unidad · " +
  fuentesUnicas.length + " fuentes distintas · " + enlacesOmitidos + " enlaces distintos a copias no autorizadas omitidos (se cita solo el título)");
console.log("Avisos de coherencia con kb/:");
console.log("  " + avisos.sinKb.length + " palabras que no están en kb/ ni como entrada ni como ejemplo (fuentes de la unidad)");
console.log("  " + avisos.homonimo.length + " palabras cuya forma está en kb/ con otra glosa (posible homónimo; no se usaron esas fuentes)");
console.log("  " + avisos.altaDudosa.length + " palabras con confianza alta cuyo estado más reciente en kb/ no es verificado ni probable");
console.log("  " + avisos.incorrecta.length + " palabras cuya forma solo aparece en kb/ como incorrecta");
console.log("  " + avisos.ultimaIncorrecta.length + " palabras que la última reverificación de kb/ marca como incorrectas");
if (DETALLE) {
  const lin = (v) => v.id + " «" + v.m + "» = " + v.es + " (" + v.conf + ")";
  if (avisos.incorrecta.length) { console.log("\nSolo como incorrecta en kb/:"); avisos.incorrecta.forEach((v) => console.log("  · " + lin(v))); }
  if (avisos.ultimaIncorrecta.length) { console.log("\nIncorrecta en la última reverificación:"); avisos.ultimaIncorrecta.forEach((v) => console.log("  · " + lin(v))); }
  if (avisos.altaDudosa.length) { console.log("\nAlta pero dudosa en kb/:"); avisos.altaDudosa.forEach((x) => console.log("  · " + lin(x.v) + " · kb: " + x.estado)); }
  if (avisos.homonimo.length) { console.log("\nOtra glosa en kb/:"); avisos.homonimo.forEach((x) => console.log("  · " + lin(x.v) + " · kb: " + x.es.join(" / "))); }
  if (avisos.sinKb.length) { console.log("\nSin entrada en kb/:"); avisos.sinKb.forEach((v) => console.log("  · " + lin(v))); }
} else if (avisos.incorrecta.length + avisos.ultimaIncorrecta.length + avisos.altaDudosa.length + avisos.homonimo.length + avisos.sinKb.length) {
  console.log("  (node export-data.mjs --detalle para verlas una por una)");
}
console.log("Escrito: " + [pJson, pCsv, pRevCsv, pRevHtml].map(rel).join(", "));
