#!/usr/bin/env node
// Pruebas del módulo «Lecturas» (src/modules/lecturas.js y .css) con Playwright (Chromium headless).
//   node test/lecturas.cjs <ruta.html>        (el html del Artifact, p. ej. el de  node build.mjs --out <ruta>)
// Prueba, con clics reales: la tarjeta de Inicio y la lista (una lectura por diálogo del curso, cobertura de
// palabras contrastada con un cálculo independiente), el lector, la hoja de la palabra («Guardar para repasar»,
// sin duplicar; sin glosa no se inventa nada), la traducción persistente, tocar una línea, «Escucha y sigue»,
// «Terminé de leer» (XP solo la primera vez) y el contador del Perfil; además el botón Atrás, COURSE_READINGS
// (se arma una variante de la página con lecturas de prueba hechas con líneas del curso), la página sin audio,
// el estado dañado, 360 px sin scroll horizontal, claro y oscuro (contraste), movimiento reducido, escritorio y teclado
// y estática (sin colores literales ni emojis; formato de src/content/lecturas.js). Necesita el curso real (sus diálogos y
// su audio), no la muestra. Sale con código 1 si algo falla. VERBOSE=1 muestra también lo que pasa.
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { chromium } = require("playwright");

const target = process.argv[2];
if (!target) { console.error("Uso: node test/lecturas.cjs <ruta.html>"); process.exit(2); }
const SRC = path.resolve(target);
const ROOT = path.resolve(__dirname, "..");
const FONT_DIR = path.join(__dirname, ".fontcache");
const T0 = Date.now();
const results = [];
function check(name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail == null ? "" : String(detail) });
  if (!pass || process.env.VERBOSE) console.log("  " + (pass ? "✓" : "✗") + " " + name + (detail !== "" && detail != null ? " — " + detail : ""));
  return !!pass;
}
const log = (s) => console.log(s);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- Página (con el esqueleto que agrega la plataforma) y variantes ----------
const HTML = fs.readFileSync(SRC, "utf8");
const FULL_DOC = /^﻿?\s*(<!--[\s\S]*?-->\s*)*<!doctype/i.test(HTML);
const wrap = (h) => "<!doctype html><html lang=es><head><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1,viewport-fit=cover'></head><body>" + h + "</body></html>";
function urlFor(name, html) {
  const file = path.join(path.dirname(SRC), path.basename(SRC).replace(/\.html?$/i, "") + (name ? "." + name : "") + ".preview.html");
  fs.writeFileSync(file, FULL_DOC ? html : wrap(html));
  return "file://" + file;
}
const URL_MAIN = FULL_DOC ? "file://" + SRC : urlFor("", HTML);
const EMPTY_READINGS = "window.COURSE_READINGS = window.COURSE_READINGS || [];";
function withReadings(list) {
  if (!HTML.includes(EMPTY_READINGS)) return null;
  return HTML.replace(EMPTY_READINGS, () => "window.COURSE_READINGS = " + JSON.stringify(list).replace(/</g, "\\u003c") + ";");
}
function withoutAudio() {
  if (!HTML.includes("window.COURSE_AUDIO = ")) return null;
  return HTML.replace("window.COURSE_AUDIO = ", () => "window.COURSE_AUDIO = { version: 1, entries: [] }; window.__sinAudio = ");
}

// ---------- Fuentes de la caché local de las pruebas de humo (si existe) ----------
const fontMap = new Map();
(function prepareFonts() {
  const m = /https:\/\/fonts\.googleapis\.com\/css2\?[^"'<>\s]+/.exec(HTML);
  if (!m) return;
  const cssUrl = m[0].replace(/&amp;/g, "&"), h = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 16);
  const cssFile = path.join(FONT_DIR, h(cssUrl) + ".css");
  if (!fs.existsSync(cssFile)) return;
  fontMap.set(cssUrl, { file: cssFile, type: "text/css; charset=utf-8" });
  for (const u of new Set(fs.readFileSync(cssFile, "utf8").match(/https:\/\/fonts\.gstatic\.com\/[^)'"\s]+/g) || [])) {
    const f = path.join(FONT_DIR, h(u) + ".woff2");
    if (fs.existsSync(f)) fontMap.set(u, { file: f, type: "font/woff2" });
  }
})();

async function newPage(browser, cfg) {
  const ctx = await browser.newContext({ viewport: cfg.viewport || { width: 390, height: 844 }, isMobile: !cfg.desktop, hasTouch: !cfg.desktop,
    colorScheme: cfg.scheme || "light", reducedMotion: cfg.reduced ? "reduce" : "no-preference", deviceScaleFactor: 1 });
  await ctx.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) => {
    const hit = fontMap.get(route.request().url());
    return hit ? route.fulfill({ status: 200, contentType: hit.type, headers: { "access-control-allow-origin": "*" }, body: fs.readFileSync(hit.file) }) : route.abort();
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push("pageerror: " + e.message));
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    if (/fonts\.(googleapis|gstatic)\.com/.test((msg.location() && msg.location().url || "") + " " + msg.text())) return;
    page.errors.push("console.error: " + msg.text());
  });
  page.on("dialog", (d) => { page.errors.push("diálogo del navegador (" + d.type() + "): " + d.message()); d.dismiss().catch(() => {}); });
  page.url0 = cfg.url || URL_MAIN;
  return { ctx, page };
}
async function load(page) {
  await page.goto(page.url0, { waitUntil: "load" });
  await page.waitForFunction(() => window.__koox && window.__koox.lecturas && typeof window.__koox.screen === "function", null, { timeout: 8000 });
  await page.evaluate(() => document.fonts && document.fonts.ready);
}
const K = (page, fn, arg) => page.evaluate(fn, arg);
const state = (page) => page.evaluate(() => window.__koox.state());
const view = (page) => page.evaluate(() => window.__koox.lecturas.view());
const au = (page) => page.evaluate(() => window.__koox.audioState());
const screenOf = (page) => page.evaluate(() => window.__koox.screen());
async function seed(page, spec) {
  await page.evaluate(([k, s]) => localStorage.setItem(k, JSON.stringify(s)), ["koox-maaya-v2", spec]);
  await load(page);
}
async function openList(page) {
  await page.tap("#btn-home-readings");
  await page.waitForSelector("#lec-root:not([hidden]) .lec-card");
}
async function openReading(page, id) {
  await page.tap('.lec-card[data-id="' + id + '"]');
  await page.waitForSelector("#lec-root .lec-row");
}
async function backToList(page) {
  await page.tap('#lec-root [data-act="back"]');
  await page.waitForSelector("#lec-root .lec-card");
}
async function closeAllUI(page) {
  await page.tap('#lec-root [data-act="back"]');
  await page.waitForFunction(() => document.querySelector("#lec-root").hidden);
}

// ---------- Cálculo independiente de la cobertura (a partir de los datos crudos del curso) ----------
const PUNCT = /[¿?¡!.,;:"“”«»()…—–]+/;
const norm = (s) => String(s).normalize("NFC").toLowerCase().replace(/[’‘ʼ´`′ʻ‛ʹ＇՚ˈ]/g, "'").replace(/[‐-―]/g, "-");
const clausesOf = (text) => norm(text).split(PUNCT).map((c) => c.trim()).filter(Boolean).map((c) => c.split(/\s+/).map((t) => t.replace(/^-+|-+$/g, "")).filter(Boolean)).filter((t) => t.length);
function courseModel(raw) {
  const forms = new Map(), dialogues = [];
  raw.units.forEach((u) => u.lessons.forEach((l) => {
    (l.vocab || []).forEach((v) => [v.m].concat(v.alt || []).forEach((f) => {
      const key = clausesOf(f).map((c) => c.join(" ")).join(" ");
      if (!key) return;
      if (!forms.has(key)) forms.set(key, []);
      if (!forms.get(key).some((x) => x.id === v.id)) forms.get(key).push({ id: v.id, es: v.es, lesson: l.id, m: v.m });
    }));
    const lines = l.dialogue && (l.dialogue.lines || []).filter((x) => x && x.m && x.es);
    if (lines && lines.length) dialogues.push({ id: "dlg-" + l.id.toLowerCase(), lesson: l.id, title: l.dialogue.title, lines });
  }));
  return { forms, dialogues };
}
function expected(model, lines, st) {
  const known = (v) => !!(st.srs[v.id] || (st.lessons[v.lesson] && st.lessons[v.lesson].done));
  let total = 0, kn = 0;
  for (const ln of lines) for (const toks of clausesOf(ln.m)) {
    for (let i = 0; i < toks.length;) {
      let n = 1, items = null;
      for (let len = Math.min(8, toks.length - i); len >= 1; len--) { const k = toks.slice(i, i + len).join(" "); if (model.forms.has(k)) { n = len; items = model.forms.get(k); break; } }
      total++; if (items && items.some(known)) kn++;
      i += n;
    }
  }
  return { total, known: kn, pct: total ? Math.floor(kn * 100 / total) : 0 };
}

// Recorre la sesión actual en la página (como test/smoke.cjs) hasta la pantalla de resultados.
function fastRunInPage() {
  const Kx = window.__koox, q = (s) => document.querySelector(s);
  const out = { ok: false, error: "" };
  for (let guard = 0; guard < 600; guard++) {
    const s = Kx.screen();
    if (s === "results") { out.ok = true; return out; }
    if (s === "teach" || s === "vocab" || s === "dialogue") { q("#btn-next").click(); continue; }
    if (s === "exercise") {
      if (!Kx.solve()) { out.error = "solve() no pudo contestar"; return out; }
      if (Kx.screen() === "exercise") { const b = q("#btn-check"); if (!b || b.disabled || b.hidden) { out.error = "Comprobar no disponible"; return out; } b.click(); }
      continue;
    }
    if (s === "feedback") { q("#btn-continue").click(); continue; }
    out.error = "pantalla inesperada: " + s; return out;
  }
  out.error = "demasiados pasos"; return out;
}
async function completeLesson(page, id) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.tap('[data-lesson="' + id + '"]');
  await page.waitForSelector("#lesson-sheet:not([hidden]) #btn-start-lesson");
  await page.tap("#btn-start-lesson");
  await page.waitForFunction(() => ["teach", "vocab", "dialogue", "exercise"].includes(window.__koox.screen()));
  const r = await page.evaluate(fastRunInPage);
  if (r.ok) { await page.evaluate(() => document.querySelector("#btn-results-home").click()); await page.waitForFunction(() => window.__koox.screen() === "home"); }
  return r;
}

// ---------- Utilidades de medida ----------
async function overflow(page) {
  return page.evaluate(() => {
    const root = document.querySelector("#lec-root"), vw = document.documentElement.clientWidth, bad = [];
    for (const el of document.querySelectorAll("#lec-root *, #lec-sheet *")) {
      if (el.closest(".sr-only")) continue;
      const r = el.getBoundingClientRect();
      if ((r.width || r.height) && (r.right > vw + 1 || r.left < -1)) { bad.push((el.className && typeof el.className === "string" ? el.tagName.toLowerCase() + "." + el.className.trim().split(/\s+/)[0] : el.tagName.toLowerCase()) + " [" + Math.round(r.left) + "→" + Math.round(r.right) + "]"); if (bad.length >= 4) break; }
    }
    return { sw: Math.max(document.documentElement.scrollWidth, root ? root.scrollWidth : 0), cw: vw, rootSw: root ? root.scrollWidth : 0, rootCw: root ? root.clientWidth : 0, bad };
  });
}
async function checkNoHScroll(page, where, tag) {
  const o = await overflow(page);
  return check(tag + "sin scroll horizontal en " + where, o.sw <= o.cw + 1 && o.rootSw <= o.rootCw + 1 && !o.bad.length, "scrollWidth " + o.sw + " / ancho " + o.cw + (o.bad.length ? " · se salen: " + o.bad.join(", ") : ""));
}
const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
// Colores efectivos (texto y fondo) de los elementos que importan, en el esquema de color de la página.
async function colorPairs(page) {
  return page.evaluate(() => {
    const rgb = (c) => { const m = /rgba?\(([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:[, /]+([\d.]+))?\)/.exec(c); return m ? [+m[1], +m[2], +m[3], m[4] == null ? 1 : +m[4]] : null; };
    const tok = (name) => { const d = document.createElement("span"); d.style.color = "var(" + name + ")"; document.body.appendChild(d); const c = rgb(getComputedStyle(d).color); d.remove(); return c; };
    const bgOf = (el) => { for (let e = el; e; e = e.parentElement) { const c = rgb(getComputedStyle(e).backgroundColor); if (c && c[3] > 0.99) return c; } return tok("--bg"); };
    const pair = (name, el, bg) => el ? { name, fg: rgb(getComputedStyle(el).color), bg: bg || bgOf(el) } : null;
    const q = (s) => document.querySelector(s);
    return [pair("texto de la línea", q(".lec-text")), pair("palabra nueva sobre su fondo", q(".lec-w.unk"), tok("--kan-soft")), pair("traducción", q(".lec-tr:not([hidden])")),
      pair("fuente", q(".lec-source")), pair("porcentaje", q(".lec-cov")), pair("indicación", q(".lec-hint")), pair("título", q("#lec-h")), pair("migas", q(".lec-crumb"))].filter(Boolean);
  });
}

// =====================================================================================================
async function mainRun(browser) {
  const tag = "[390 · claro] ";
  const { ctx, page } = await newPage(browser, {});
  await load(page);
  const raw = await page.evaluate(() => window.__koox.course);
  const model = courseModel(raw);
  const nDlg = model.dialogues.length;

  // --- Inicio: tarjeta y lista ---
  const card = await page.evaluate(() => { const b = document.querySelector("#btn-home-readings"); if (!b) return null; const r = b.getBoundingClientRect(); return { t: (b.querySelector(".gl-t") || {}).textContent, s: b.querySelectorAll(".gl-s").length, h: r.height, w: r.width }; });
  check(tag + "Inicio tiene la tarjeta «Lecturas» con una descripción", card && card.t === "Lecturas" && card.s === 1 && card.h >= 44, JSON.stringify(card));
  check(tag + "el curso tiene diálogos que leer", nDlg > 0, nDlg);
  let st = await state(page);
  await openList(page);
  check(tag + "la lista es una pantalla (screen = lecturas)", (await screenOf(page)) === "lecturas");
  const cards = await page.evaluate(() => Array.from(document.querySelectorAll(".lec-card")).map((c) => ({ id: c.dataset.id, t: c.querySelector(".lec-card-t").textContent, where: c.querySelector(".eyebrow").textContent, meta: c.querySelector(".lec-card-meta").textContent, cov: c.querySelector(".lec-cov").textContent, h: c.getBoundingClientRect().height })));
  check(tag + "una lectura por diálogo del curso (" + nDlg + ")", cards.length === nDlg && model.dialogues.every((d) => cards.some((c) => c.id === d.id)), cards.length + " tarjetas / " + nDlg + " diálogos");
  check(tag + "cada tarjeta trae título, unidad y lección, líneas y cobertura", cards.every((c, i) => c.t && /^Unidad \d+ · Lección \d+$/.test(c.where) && /^\d+ líneas?$/.test(c.meta) && /^Conoces el \d+ % de las palabras$/.test(c.cov) && c.h >= 44), JSON.stringify(cards[0]));
  check(tag + "las líneas de cada tarjeta coinciden con el diálogo", model.dialogues.every((d) => { const c = cards.find((x) => x.id === d.id); return c && c.meta === d.lines.length + (d.lines.length === 1 ? " línea" : " líneas"); }));
  const list0 = await page.evaluate(() => window.__koox.lecturas.list());
  check(tag + "con el progreso vacío todas las coberturas son 0 %", list0.every((r) => r.pct === 0 && r.known === 0) && cards.every((c) => c.cov === "Conoces el 0 % de las palabras"), list0.map((r) => r.pct).join(","));
  check(tag + "el total de palabras coincide con el cálculo independiente", model.dialogues.every((d) => { const r = list0.find((x) => x.id === d.id); const e = expected(model, d.lines, st); return r && r.total === e.total; }),
    model.dialogues.map((d) => (list0.find((x) => x.id === d.id) || {}).total + "/" + expected(model, d.lines, st).total).join(" "));
  st = await state(page);
  check(tag + "abrir la lista no crea estado propio (state.x.lecturas)", !(st.x && st.x.lecturas), JSON.stringify(st.x));

  // --- Frases y palabras: coincidencia más larga, signos, apóstrofos y mayúsculas ---
  const seg = (t) => page.evaluate((x) => window.__koox.lecturas.segments(x), t);
  const ids = (key) => (model.forms.get(key) || []).map((v) => v.id);
  const s1 = await seg("Bix a beel? Kux teech");
  check(tag + "«Bix a beel» es una sola frase y no se une a lo que sigue al «?»", s1.filter((s) => s.w).length === 2 && s1[0].w === "Bix a beel" && JSON.stringify(s1[0].ids) === JSON.stringify(ids("bix a beel")) && s1[2].w === "Kux teech", JSON.stringify(s1));
  const s2 = await seg("BIX A K’AABA’!");
  check(tag + "mayúsculas y apóstrofo tipográfico dan la misma frase", s2.filter((s) => s.w).length === 1 && JSON.stringify(s2[0].ids) === JSON.stringify(ids("bix a k'aaba'")), JSON.stringify(s2));
  const s3 = await seg("Pedro, bix");
  check(tag + "una palabra que no está en el vocabulario queda sin glosa", s3[0].w === "Pedro" && s3[0].ids === null && s3.filter((s) => s.w).length === 2, JSON.stringify(s3));

  // --- Lector ---
  const dlg = model.dialogues.find((d) => d.lines.some((l) => true && d.lines.length >= 7)) || model.dialogues[0];
  await openReading(page, dlg.id);
  check(tag + "el lector es una pantalla (screen = lector)", (await screenOf(page)) === "lector");
  const rd = await page.evaluate(() => ({ h1: document.querySelector("#lec-h").textContent, src: (document.querySelector(".lec-source") || {}).textContent, cov: (document.querySelector("#lec-cov") || {}).textContent,
    rows: document.querySelectorAll(".lec-row").length, role: document.querySelector("#lec-root").getAttribute("role"), modal: document.querySelector("#lec-root").getAttribute("aria-modal"),
    active: document.activeElement && document.activeElement.id }));
  check(tag + "el lector muestra título, crédito de la fuente y cobertura", rd.h1 === dlg.title && /^Fuente: /.test(rd.src) && /^Conoces el \d+ % de las palabras$/.test(rd.cov) && rd.rows === dlg.lines.length && rd.role === "dialog" && rd.modal === "true", JSON.stringify(rd));
  check(tag + "el foco pasa al título del lector", rd.active === "lec-h", rd.active);
  const rows = await page.evaluate(() => Array.from(document.querySelectorAll(".lec-row")).map((r) => {
    const b = r.querySelector("[data-au]"), t = r.querySelector(".lec-text");
    return { i: +r.dataset.i, au: b ? b.getAttribute("data-au") : null, label: b ? b.getAttribute("aria-label") : null, h: b ? b.getBoundingClientRect().height : 0, w: b ? b.getBoundingClientRect().width : 0,
      lang: t.getAttribute("lang"), cls: t.classList.contains("m"), words: r.querySelectorAll(".lec-w").length, tr: r.querySelector(".lec-tr").textContent, trHidden: r.querySelector(".lec-tr").hidden, side: r.className.replace(/.*lec-row /, ""), avatar: !!r.querySelector(".avatar") };
  }));
  const expAu = await page.evaluate((lines) => lines.map((l) => { const a = window.__koox.audioFor("text", l.m); return a ? a.key : null; }), dlg.lines);
  check(tag + "solo las líneas con audio llevan botón de audio (" + expAu.filter(Boolean).length + " de " + rows.length + ")", rows.every((r, i) => r.au === expAu[i]) && rows.some((r) => !r.au) === expAu.some((k) => !k), JSON.stringify(rows.map((r) => !!r.au)) + " vs " + JSON.stringify(expAu.map(Boolean)));
  check(tag + "botones de audio de 44 px o más y con aria-label", rows.filter((r) => r.au).every((r) => r.h >= 44 && r.w >= 44 && /^Escuchar «.+», /.test(r.label)), JSON.stringify(rows.filter((r) => r.au).map((r) => r.h + "×" + r.w)));
  check(tag + "el texto maya lleva lang=yua y la clase m", rows.every((r) => r.lang === "yua" && r.cls && r.words > 0));
  check(tag + "las líneas con quien habla son burbujas con avatar", rows.every((r) => /^(a|b)$/.test(r.side) && r.avatar), JSON.stringify(rows.map((r) => r.side)));
  check(tag + "la traducción está oculta al principio", rows.every((r) => r.trHidden));
  const wordInfo = await page.evaluate(() => Array.from(document.querySelectorAll(".lec-w")).map((b) => ({ h: b.getBoundingClientRect().height, label: b.getAttribute("aria-label"), lang: b.querySelector(".m") && b.querySelector(".m").getAttribute("lang"), pop: b.getAttribute("aria-haspopup") })));
  check(tag + "cada palabra es un botón de 44 px o más con aria-label y lang=yua (" + wordInfo.length + ")", wordInfo.length > 0 && wordInfo.every((w) => w.h >= 44 && w.label && w.lang === "yua" && w.pop === "dialog"), JSON.stringify(wordInfo.filter((w) => !(w.h >= 44 && w.label)).slice(0, 2)));
  // El foco visible llega a las palabras con el teclado.
  await page.focus(".lec-w");
  await page.keyboard.press("Tab"); await page.keyboard.press("Shift+Tab");
  const focus = await page.evaluate(() => { const e = document.activeElement, cs = getComputedStyle(e); return { cls: e.className, style: cs.outlineStyle, width: parseFloat(cs.outlineWidth) }; });
  check(tag + "el foco se ve en las palabras (contorno de 2 px o más)", /lec-w/.test(focus.cls) && focus.style !== "none" && focus.width >= 2, JSON.stringify(focus));

  // --- Hoja de la palabra con glosa ---
  const ok0 = await state(page);
  const pa = await page.evaluate((model0) => {
    const b = document.querySelector(".lec-w:not(.ng)");
    return { text: b.textContent, i: +b.dataset.i, j: +b.dataset.j, unk: b.classList.contains("unk") };
  });
  const plays0 = (await au(page)).plays;
  await page.tap('.lec-w[data-i="' + pa.i + '"][data-j="' + pa.j + '"]');
  await page.waitForSelector("#lec-sheet:not([hidden]) #lec-w-title");
  const sh = await page.evaluate(() => ({ title: document.querySelector("#lec-w-title").textContent, lang: document.querySelector("#lec-w-title").getAttribute("lang"), cls: document.querySelector("#lec-w-title").className,
    gloss: (document.querySelector("#lec-modal .lec-gloss") || {}).textContent, save: !!document.querySelector("#lec-save"), saveTxt: (document.querySelector("#lec-save") || {}).textContent,
    au: !!document.querySelector("#lec-modal [data-au]"), role: document.querySelector("#lec-modal").getAttribute("role"), focus: document.activeElement && document.activeElement.id,
    btnH: Array.from(document.querySelectorAll("#lec-modal button")).map((b) => b.getBoundingClientRect().height) }));
  const key = norm(pa.text).split(PUNCT).map((c) => c.trim()).filter(Boolean).join(" ");
  const item = (model.forms.get(key) || [])[0];
  check(tag + "tocar una palabra abre la hoja con su forma y el significado del vocabulario", item && sh.title === pa.text && sh.gloss === item.es && sh.lang === "yua" && /\bm\b/.test(sh.cls) && sh.role === "dialog", JSON.stringify(sh) + " · esperado " + (item && item.es));
  check(tag + "la hoja ofrece «Guardar para repasar», con botones de 44 px o más y el foco dentro", sh.save && sh.saveTxt === "Guardar para repasar" && sh.btnH.every((h) => h >= 44) && /^lec-(save|close)$/.test(sh.focus), JSON.stringify([sh.saveTxt, sh.btnH, sh.focus]));
  const expSheetAu = await page.evaluate(([t, vid]) => !!(window.__koox.audioFor("text", t) || window.__koox.audioFor("vocab", vid)), [pa.text, item && item.id]);
  check(tag + "la hoja muestra el audio de la palabra solo si existe", sh.au === expSheetAu, "hoja " + sh.au + " / catálogo " + expSheetAu);
  check(tag + "tocar una palabra no reproduce la línea", (await au(page)).plays === plays0);
  check(tag + "la palabra nueva (sin lección completada) se marca", pa.unk === true);

  // Guardar para repasar: da de alta una vez y no duplica.
  const srsBefore = Object.keys(ok0.srs).length;
  await page.tap("#lec-save");
  let st1 = await state(page);
  const e1 = st1.srs[item.id];
  const today = await page.evaluate(() => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); });
  check(tag + "«Guardar para repasar» crea la entrada en el repaso (caja 1, vence hoy)", Object.keys(st1.srs).length === srsBefore + 1 && e1 && e1.box === 1 && e1.due === today, JSON.stringify(e1));
  const toastTxt = await page.evaluate(() => document.querySelector("#toast").textContent);
  check(tag + "confirma con un aviso", /Guardada para repasar/.test(toastTxt), toastTxt);
  const after = await page.evaluate(() => ({ dis: document.querySelector("#lec-save").disabled, txt: document.querySelector("#lec-save").textContent }));
  check(tag + "el botón pasa a «Ya está en tu repaso» y se desactiva", after.dis && after.txt === "Ya está en tu repaso", JSON.stringify(after));
  await page.tap('#lec-modal [data-act="sheet-close"]');
  check(tag + "cerrar la hoja la oculta", await page.evaluate(() => document.querySelector("#lec-sheet").hidden));
  const unkNow = await page.evaluate(([i, j]) => document.querySelector('.lec-w[data-i="' + i + '"][data-j="' + j + '"]').classList.contains("unk"), [pa.i, pa.j]);
  const covNow = await page.evaluate(() => document.querySelector("#lec-cov").textContent);
  check(tag + "la palabra guardada deja de marcarse como nueva y sube el porcentaje", !unkNow && /^Conoces el [1-9]\d* % de las palabras$/.test(covNow), covNow);
  await page.tap('.lec-w[data-i="' + pa.i + '"][data-j="' + pa.j + '"]');
  await page.waitForSelector("#lec-sheet:not([hidden]) #lec-w-title");
  const again = await page.evaluate(() => ({ dis: document.querySelector("#lec-save").disabled, txt: document.querySelector("#lec-save").textContent }));
  await page.evaluate(() => document.querySelector("#lec-save").click());
  st1 = await state(page);
  check(tag + "no se duplica: otra vez muestra que ya está y nada cambia", again.dis && /Ya está/.test(again.txt) && Object.keys(st1.srs).length === srsBefore + 1 && JSON.stringify(st1.srs[item.id]) === JSON.stringify(e1), JSON.stringify(again));
  await page.tap('#lec-modal [data-act="sheet-close"]');

  // Palabra sin vocabulario: no se inventa glosa.
  const all = await page.evaluate(() => window.__koox.lecturas.list().map((r) => r.id));
  let ngFound = null;
  for (const id of all) {
    await backToList(page); await openReading(page, id);
    const w = await page.$(".lec-w.ng");
    if (w) { ngFound = { id, text: await w.textContent(), i: await w.getAttribute("data-i"), j: await w.getAttribute("data-j") }; break; }
  }
  check(tag + "hay una palabra sin vocabulario en los diálogos para probar la sin glosa", !!ngFound);
  if (ngFound) {
    const srsN = Object.keys((await state(page)).srs).length;
    await page.tap('.lec-w[data-i="' + ngFound.i + '"][data-j="' + ngFound.j + '"]');
    await page.waitForSelector("#lec-sheet:not([hidden]) #lec-w-title");
    const ng = await page.evaluate(() => ({ gloss: document.querySelector("#lec-modal .lec-gloss").textContent, save: !!document.querySelector("#lec-save"), title: document.querySelector("#lec-w-title").textContent, buttons: Array.from(document.querySelectorAll("#lec-modal button")).map((b) => b.textContent.trim()) }));
    const aria = await page.evaluate(([i, j]) => document.querySelector('.lec-w[data-i="' + i + '"][data-j="' + j + '"]').getAttribute("aria-label"), [ngFound.i, ngFound.j]);
    check(tag + "una palabra sin vocabulario dice «Esta palabra aún no tiene glosa en el curso.» y no ofrece guardar", ng.gloss === "Esta palabra aún no tiene glosa en el curso." && !ng.save && ng.title === ngFound.text && ng.buttons.join() === "Cerrar", JSON.stringify(ng));
    check(tag + "…y su aria-label lo dice", /sin glosa en el curso/.test(aria), aria);
    check(tag + "…y el repaso no cambia", Object.keys((await state(page)).srs).length === srsN);
    await page.tap('#lec-modal [data-act="sheet-close"]');
  }

  // --- Traducción: alterna y persiste ---
  await backToList(page); await openReading(page, dlg.id);
  await page.tap('label[for="lec-trans"]');
  const tr1 = await page.evaluate(() => Array.from(document.querySelectorAll(".lec-tr")).map((p) => ({ hidden: p.hidden, h: p.getBoundingClientRect().height, t: p.textContent })));
  check(tag + "«Mostrar traducción» muestra el español de cada línea", tr1.every((p, i) => !p.hidden && p.h > 0 && p.t === dlg.lines[i].es), JSON.stringify(tr1.slice(0, 1)));
  const swOn = await page.evaluate(() => ({ checked: document.querySelector("#lec-trans").checked, role: document.querySelector("#lec-trans").getAttribute("role") }));
  check(tag + "el interruptor es un switch accesible y queda activado", swOn.checked && swOn.role === "switch");
  check(tag + "la preferencia se guarda en state.x.lecturas.trans", (await state(page)).x.lecturas.trans === true);
  await load(page); await openList(page); await openReading(page, dlg.id);
  const tr2 = await page.evaluate(() => ({ on: document.querySelector("#lec-trans").checked, vis: Array.from(document.querySelectorAll(".lec-tr")).every((p) => !p.hidden) }));
  check(tag + "tras recargar la traducción sigue visible", tr2.on && tr2.vis, JSON.stringify(tr2));
  await page.tap('label[for="lec-trans"]');
  check(tag + "apagarla oculta las traducciones y se guarda", (await page.evaluate(() => Array.from(document.querySelectorAll(".lec-tr")).every((p) => p.hidden))) && (await state(page)).x.lecturas.trans === false);

  // --- Tocar una línea: audio, resaltado y regla de un solo audio ---
  const withAu = rows.map((r, i) => (expAu[i] ? i : -1)).filter((i) => i >= 0);
  const noAu = rows.map((r, i) => (!expAu[i] ? i : -1)).filter((i) => i >= 0);
  const i0 = withAu[0];
  let a0 = await au(page);
  await page.tap('.lec-row[data-i="' + i0 + '"] .lec-bubble', { position: { x: 5, y: 5 } });
  await page.waitForFunction((n) => window.__koox.audioState().started > n, a0.started, { timeout: 6000 });
  let a1 = await au(page), v1 = await view(page);
  const hl = await page.evaluate((i) => { const r = document.querySelector('.lec-row[data-i="' + i + '"]'); return { on: r.classList.contains("is-active"), cur: r.getAttribute("aria-current"), btn: r.querySelector(".au-btn").classList.contains("is-playing"), n: document.querySelectorAll(".lec-row.is-active").length }; }, i0);
  check(tag + "tocar una línea reproduce su audio y la resalta", a1.lastKey === expAu[i0] && a1.plays === a0.plays + 1 && hl.on && hl.cur === "true" && hl.n === 1 && v1.active === i0, JSON.stringify([a1.lastKey, hl, v1.active]));
  await page.waitForFunction((n) => window.__koox.audioState().ended > n, a0.ended, { timeout: 15000 });
  await sleep(150);
  check(tag + "al terminar el audio se quita el resaltado", (await view(page)).active === -1 && (await page.$$(".lec-row.is-active")).length === 0);
  if (noAu.length) {
    const n0 = (await au(page)).plays;
    await page.tap('.lec-row[data-i="' + noAu[0] + '"] .lec-bubble', { position: { x: 5, y: 5 } });
    await sleep(300);
    check(tag + "una línea sin audio no suena, no se resalta y no tiene botón", (await au(page)).plays === n0 && (await view(page)).active === -1 && !(await page.$('.lec-row[data-i="' + noAu[0] + '"] [data-au]')));
  }
  // El botón de audio también resalta la línea; otro audio interrumpe al anterior (un audio a la vez).
  a0 = await au(page);
  await page.tap('.lec-row[data-i="' + withAu[1] + '"] [data-au]');
  await page.waitForFunction((n) => window.__koox.audioState().started > n, a0.started, { timeout: 6000 });
  check(tag + "el botón de audio de una línea también la resalta", (await view(page)).active === withAu[1] && (await au(page)).lastKey === expAu[withAu[1]]);
  a0 = await au(page);
  await page.tap('.lec-row[data-i="' + i0 + '"] .lec-bubble', { position: { x: 5, y: 5 } });
  await page.waitForFunction((n) => window.__koox.audioState().started > n, a0.started, { timeout: 6000 });
  const one = await page.evaluate(() => ({ s: window.__koox.audioState(), n: document.querySelectorAll(".lec-row.is-active").length }));
  check(tag + "solo suena un audio a la vez y solo hay una línea resaltada", one.s.key === expAu[i0] && one.n === 1 && (await view(page)).active === i0, JSON.stringify(one.s.key));
  await page.evaluate(() => window.__koox.stopAudio());
  await sleep(200);

  // --- Escucha y sigue ---
  check(tag + "hay botón «Escucha y sigue» porque hay líneas con audio", await page.evaluate(() => !!document.querySelector("#lec-follow") && document.querySelector("#lec-follow").textContent.trim() === "Escucha y sigue"));
  a0 = await au(page);
  await page.tap("#lec-follow");
  await page.waitForFunction((n) => window.__koox.lecturas.view().log.length >= n, 3, { timeout: 30000 });
  const mid = await page.evaluate(() => ({ v: window.__koox.lecturas.view(), txt: document.querySelector("#lec-follow").textContent.trim(), on: document.querySelectorAll(".lec-row.is-active").length, s: window.__koox.audioState() }));
  const logOk = mid.v.log.every((x, k) => k === 0 ? x === withAu[0] : x === withAu[k]);
  check(tag + "«Escucha y sigue» resalta las líneas con audio en orden (" + mid.v.log.join("→") + ")", logOk && mid.v.log.length >= 2 && mid.v.follow && mid.on === 1, JSON.stringify(mid.v));
  check(tag + "mientras sigue, el botón dice «Detener» y suena un solo audio", mid.txt === "Detener" && mid.s.plays >= a0.plays + 2 && mid.s.errors === 0, JSON.stringify([mid.txt, mid.s.plays - a0.plays, mid.s.errors]));
  await page.tap("#lec-follow");
  await sleep(250);
  const stopped = await page.evaluate(() => ({ v: window.__koox.lecturas.view(), s: window.__koox.audioState(), n: document.querySelectorAll(".lec-row.is-active").length, txt: document.querySelector("#lec-follow").textContent.trim() }));
  check(tag + "«Detener» corta el audio, quita el resaltado y devuelve el botón", !stopped.v.follow && !stopped.s.playing && stopped.n === 0 && stopped.txt === "Escucha y sigue", JSON.stringify(stopped.v));
  // Se detiene al salir y al tocar otro audio.
  await page.tap("#lec-follow");
  await page.waitForFunction(() => window.__koox.audioState().playing);
  await backToList(page);
  await sleep(250);
  const left = await page.evaluate(() => ({ v: window.__koox.lecturas.view(), s: window.__koox.audioState() }));
  check(tag + "salir del lector detiene «Escucha y sigue» y el audio", left.v.view === "list" && !left.v.follow && !left.s.playing, JSON.stringify(left.v));
  await openReading(page, dlg.id);
  await page.tap("#lec-follow");
  await page.waitForFunction(() => window.__koox.audioState().playing);
  a0 = await au(page);
  await page.tap('.lec-row[data-i="' + withAu[withAu.length - 1] + '"] [data-au]');
  await page.waitForFunction((n) => window.__koox.audioState().started > n, a0.started, { timeout: 6000 });
  await sleep(200);
  const hijack = await page.evaluate(() => ({ v: window.__koox.lecturas.view(), s: window.__koox.audioState(), txt: document.querySelector("#lec-follow").textContent.trim() }));
  check(tag + "tocar otro audio durante «Escucha y sigue» lo deja a un lado", !hijack.v.follow && hijack.v.active === withAu[withAu.length - 1] && hijack.s.key === expAu[withAu[withAu.length - 1]] && hijack.txt === "Escucha y sigue", JSON.stringify(hijack.v));
  await page.evaluate(() => window.__koox.stopAudio());
  // El audio de la hoja de una palabra (otro texto) también interrumpe «Escucha y sigue»: un solo audio a la vez.
  const wa = await page.evaluate((lineKeys) => {
    for (const w of document.querySelectorAll(".lec-w:not(.ng)")) { const a = window.__koox.audioFor("text", w.textContent); if (a && lineKeys.indexOf(a.key) < 0) return { i: w.dataset.i, j: w.dataset.j, key: a.key }; }
    return null;
  }, expAu.filter(Boolean));
  check(tag + "hay una palabra con audio propio (distinto al de las líneas) para probar la hoja durante «Escucha y sigue»", !!wa);
  if (wa) {
    await page.tap("#lec-follow");
    await page.waitForFunction(() => window.__koox.audioState().playing);
    await page.tap('.lec-w[data-i="' + wa.i + '"][data-j="' + wa.j + '"]');
    await page.waitForSelector("#lec-sheet:not([hidden]) #lec-modal [data-au]");
    const during = (await view(page)).follow;
    a0 = await au(page);
    await page.tap("#lec-modal [data-au]");
    await page.waitForFunction((n) => window.__koox.audioState().started > n, a0.started, { timeout: 6000 });
    await sleep(250);
    const v = await view(page), s2 = await au(page);
    check(tag + "el audio de la hoja interrumpe «Escucha y sigue»: suena solo ese y se quita el resaltado", during && !v.follow && v.active === -1 && s2.key === wa.key && (await page.$$(".lec-row.is-active")).length === 0, JSON.stringify([during, v.follow, v.active, s2.key, wa.key]));
    await page.evaluate(() => window.__koox.stopAudio());
    await page.tap('#lec-modal [data-act="sheet-close"]');
  }

  // --- Terminé de leer: XP solo la primera vez, contador en Perfil ---
  await backToList(page); await openReading(page, dlg.id);
  const xp0 = (await state(page)).xp;
  await page.tap("#lec-finish");
  await page.waitForSelector("#lec-root .lec-card");
  let st2 = await state(page);
  const d1 = st2.x.lecturas.done[dlg.id];
  check(tag + "«Terminé de leer» da +5 XP la primera vez y guarda { n, last }", st2.xp === xp0 + 5 && d1 && d1.n === 1 && d1.last === today, JSON.stringify([xp0, st2.xp, d1]));
  const chip = await page.evaluate((id) => { const c = document.querySelector('.lec-card[data-id="' + id + '"] .ls-chip'); return c && c.textContent; }, dlg.id);
  check(tag + "vuelve a la lista con la lectura marcada como leída y un aviso", chip === "Leída" && /Lectura terminada/.test(await page.evaluate(() => document.querySelector("#toast").textContent)) && (await screenOf(page)) === "lecturas", chip);
  await openReading(page, dlg.id);
  check(tag + "una lectura ya leída lo dice", await page.evaluate(() => /Ya la leíste 1 vez/.test(document.querySelector(".lec-done").textContent)));
  await page.tap("#lec-finish");
  await page.waitForSelector("#lec-root .lec-card");
  st2 = await state(page);
  check(tag + "la segunda vez no da XP y cuenta n = 2", st2.xp === xp0 + 5 && st2.x.lecturas.done[dlg.id].n === 2, JSON.stringify([st2.xp, st2.x.lecturas.done[dlg.id]]));
  await closeAllUI(page);
  check(tag + "cerrar la lista vuelve al inicio (screen = home) y el foco a la tarjeta", (await screenOf(page)) === "home" && (await page.evaluate(() => document.activeElement && document.activeElement.id)) === "btn-home-readings");
  await page.tap("#tab-perfil");
  await page.waitForFunction(() => window.__koox.screen() === "profile");
  const prof = await page.evaluate(() => { const s = document.querySelector("#lec-prof"); return s && { t: s.textContent.replace(/\s+/g, " ").trim(), n: s.querySelector(".num").textContent }; });
  check(tag + "Perfil cuenta las «Lecturas leídas»", prof && /^Lecturas leídas: 1 de \d+$/.test(prof.t), JSON.stringify(prof));

  // --- Estado propio saneado ---
  await seed(page, Object.assign(await state(page), { x: { lecturas: { trans: "sí", done: { "dlg-u2l1": { n: "x", last: "ayer" }, "no valido!": { n: 3 }, "dlg-u2l2": 5 }, otro: 1 } } }));
  await page.tap("#tab-perfil");
  const prof2 = await page.evaluate(() => document.querySelector("#lec-prof").textContent.replace(/\s+/g, " ").trim());
  check(tag + "un estado dañado no rompe: cuenta solo lo válido", /^Lecturas leídas: 1 de/.test(prof2), prof2);
  await page.tap("#tab-aprender"); await openList(page); await openReading(page, "dlg-u2l3");
  check(tag + "con estado dañado, la traducción solo se activa con true", await page.evaluate(() => !document.querySelector("#lec-trans").checked));
  await page.tap("#lec-finish");
  await page.waitForSelector("#lec-root .lec-card");
  const st3 = (await state(page)).x.lecturas;
  check(tag + "al escribir se limpia el estado propio", JSON.stringify(Object.keys(st3).sort()) === '["done","trans"]' && Object.keys(st3.done).sort().join() === "dlg-u2l1,dlg-u2l3" && st3.done["dlg-u2l1"].n === 1 && /^\d{4}-\d{2}-\d{2}$/.test(st3.done["dlg-u2l1"].last), JSON.stringify(st3));
  check(tag + "sin errores de JavaScript ni diálogos del navegador", page.errors.length === 0, page.errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// Progreso real: completar una lección sube la cobertura, que coincide con el cálculo independiente.
async function progressRun(browser) {
  const tag = "[progreso] ";
  const { ctx, page } = await newPage(browser, {});
  await load(page);
  const model = courseModel(await page.evaluate(() => window.__koox.course));
  const first = model.dialogues[0];
  const r = await completeLesson(page, first.lesson);
  check(tag + "completa la lección " + first.lesson + " desde la interfaz", r.ok, r.error);
  if (!r.ok) { await ctx.close(); return; }
  const st = await state(page);
  await openList(page);
  const list = await page.evaluate(() => window.__koox.lecturas.list());
  const cov = await page.evaluate(() => Object.fromEntries(Array.from(document.querySelectorAll(".lec-card")).map((c) => [c.dataset.id, c.querySelector(".lec-cov").textContent])));
  const mine = list.find((x) => x.id === first.id);
  check(tag + "la cobertura de su diálogo sube de 0 % (" + mine.pct + " %, " + mine.known + " de " + mine.total + ")", mine.pct > 0 && mine.known > 0);
  check(tag + "todas las coberturas coinciden con el cálculo independiente", model.dialogues.every((d) => { const e = expected(model, d.lines, st), x = list.find((y) => y.id === d.id); return x.total === e.total && x.known === e.known && x.pct === e.pct && cov[d.id] === "Conoces el " + e.pct + " % de las palabras"; }),
    model.dialogues.map((d) => (list.find((y) => y.id === d.id) || {}).pct + "/" + expected(model, d.lines, st).pct).join(" "));
  check(tag + "las lecturas de lecciones que aún no se hacen quedan por debajo", list.filter((x) => x.id !== first.id).every((x) => x.pct < 100));
  // Una palabra guardada para repasar cuenta como conocida aunque su lección no esté completa.
  const other = model.dialogues.find((d) => d.id !== first.id && list.find((y) => y.id === d.id).pct === 0 && d.lines.length);
  if (other) {
    const w = other.lines.map((l) => clausesOf(l.m)).flat().map((t) => t.join(" ")).find((k) => model.forms.has(k) && !model.forms.get(k).some((v) => st.srs[v.id]));
    const v = w && model.forms.get(w)[0];
    if (v) {
      await seed(page, Object.assign(st, { srs: Object.assign({}, st.srs, { [v.id]: { box: 1, due: "2099-01-01", right: 0, wrong: 0 } }) }));
      await openList(page);
      const after = await page.evaluate(() => window.__koox.lecturas.list());
      check(tag + "una palabra en el repaso (state.srs) cuenta como conocida", after.find((y) => y.id === other.id).known > 0, other.id);
    }
  }
  check(tag + "sin errores de JavaScript", page.errors.length === 0, page.errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// Botón Atrás de Android (history.back) y Escape: una capa a la vez, como la hoja de lección.
async function backRun(browser) {
  const tag = "[Atrás] ";
  const { ctx, page } = await newPage(browser, {});
  await load(page);
  const base = await page.evaluate(() => history.length);
  const hs = () => page.evaluate(() => (history.state && history.state.koox) || null);
  await page.evaluate(() => window.scrollTo(0, 0));
  await openList(page);
  check(tag + "abrir Lecturas empuja una sola entrada de historial", (await hs()) === "lec" && (await page.evaluate(() => history.length)) === base + 1);
  const dlgId = await page.evaluate(() => document.querySelector(".lec-card").dataset.id);
  await openReading(page, dlgId);
  await page.tap(".lec-w");
  await page.waitForSelector("#lec-sheet:not([hidden])");
  check(tag + "con la hoja abierta no se apilan más entradas", (await page.evaluate(() => history.length)) === base + 1);
  const back = async () => { await page.evaluate(() => history.back()); await sleep(450); };
  await back();
  let v = await view(page);
  check(tag + "Atrás cierra la hoja de la palabra y se queda en el lector", v.open && v.view === "reader" && !v.sheet && (await hs()) === "lec", JSON.stringify(v));
  await back();
  v = await view(page);
  check(tag + "Atrás cierra el lector y vuelve a la lista", v.open && v.view === "list" && (await screenOf(page)) === "lecturas" && (await hs()) === "lec", JSON.stringify(v));
  await back();
  v = await view(page);
  check(tag + "Atrás cierra la lista y vuelve al inicio", !v.open && (await screenOf(page)) === "home" && (await page.evaluate(() => document.querySelector("#lec-root").hidden)) && (await page.evaluate(() => !document.body.classList.contains("locked"))), JSON.stringify(v));
  check(tag + "sin entradas de historial sobrantes", (await hs()) === null && (await page.evaluate(() => history.length)) === base + 1);
  // Los botones de la pantalla y Escape también cierran capa por capa, sin dejar entradas.
  await openList(page); await openReading(page, dlgId);
  await page.tap(".lec-w"); await page.waitForSelector("#lec-sheet:not([hidden])");
  await page.keyboard.press("Escape");
  check(tag + "Escape cierra la hoja", (await view(page)).view === "reader" && !(await view(page)).sheet);
  await page.keyboard.press("Escape");
  check(tag + "Escape cierra el lector", (await view(page)).view === "list");
  await page.tap('#lec-root [data-act="back"]');
  await page.waitForFunction(() => document.querySelector("#lec-root").hidden);
  await page.waitForFunction(() => !(history.state && history.state.koox), null, { timeout: 3000 });
  check(tag + "el botón «Volver al inicio» cierra y quita su entrada de historial", (await screenOf(page)) === "home" && (await hs()) === null && (await page.evaluate(() => document.activeElement.id)) === "btn-home-readings");
  // Las lecciones siguen funcionando igual con Atrás.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.tap('[data-lesson="u1l1"]'); await page.waitForSelector("#lesson-sheet:not([hidden])");
  await back();
  check(tag + "la hoja de lección sigue cerrándose con Atrás", await page.evaluate(() => document.querySelector("#lesson-sheet").hidden));
  check(tag + "sin errores de JavaScript", page.errors.length === 0, page.errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// COURSE_READINGS: lecturas de otras fuentes. La prueba arma una variante de la página con textos hechos con líneas del curso.
async function externalRun(browser) {
  const tag = "[COURSE_READINGS] ";
  const { ctx: c0, page: p0 } = await newPage(browser, {});
  await load(p0);
  const raw = await p0.evaluate(() => window.__koox.course);
  await c0.close();
  const model = courseModel(raw);
  const L = model.dialogues[0].lines, L2 = model.dialogues[1].lines;
  const vocabLines = [];
  raw.units.forEach((u) => u.lessons.forEach((l) => (l.vocab || []).forEach((v) => { if (v.ex && v.ex.m && v.ex.es && vocabLines.length < 3) vocabLines.push({ m: v.ex.m, es: v.ex.es }); })));
  const good = { id: "cuento-prueba", title: "Cuento de prueba", source: { name: "Colección de prueba", url: "https://example.org/cuento", license: "CC BY 4.0", credit: "Texto de prueba hecho con líneas del curso" },
    pages: [{ lines: L.map((x, i) => ({ m: x.m, es: x.es, who: i % 2 ? "B" : "A", name: i % 2 ? "Beto" : "Ana" })) }, { lines: vocabLines }] };
  const bad = [
    { id: "sin-fuente", title: "Sin fuente", pages: [{ lines: [L[0]] }] },
    { id: "Mal Id", title: "Id malo", source: { name: "x" }, pages: [{ lines: [L[0]] }] },
    { id: "dlg-uno", title: "Id reservado", source: { name: "x" }, pages: [{ lines: [L[0]] }] },
    { id: "sin-lineas", title: "Sin líneas", source: { name: "x" }, pages: [{ lines: [{ m: "solo maya" }, { es: "solo español" }] }] },
    { id: "cuento-prueba", title: "Repetido", source: { name: "x" }, pages: [{ lines: [L[0]] }] },
    null, 7, "texto"
  ];
  const odd = { id: "enlace-raro", title: "Enlace raro", source: { name: "Fuente rara", url: "javascript:alert(1)" }, pages: [{ lines: [L2[0], { m: L2[1].m, es: "" }] }] };
  const html = withReadings([good].concat(bad, [odd]));
  check(tag + "la página trae el marcador de COURSE_READINGS para la prueba", !!html);
  if (!html) return;
  const { ctx, page } = await newPage(browser, { url: urlFor("lecturas", html) });
  await load(page);
  const list = await page.evaluate(() => window.__koox.lecturas.list());
  check(tag + "solo entran las lecturas válidas (" + (model.dialogues.length + 2) + ")", list.length === model.dialogues.length + 2 && list.some((r) => r.id === "cuento-prueba") && list.some((r) => r.id === "enlace-raro") && !list.some((r) => /sin-|mal|dlg-uno|Repetido/i.test(r.id + r.title)), list.map((r) => r.id).join(","));
  const ext = list.find((r) => r.id === "cuento-prueba");
  check(tag + "cuenta líneas y páginas del cuento", ext.lines === L.length + vocabLines.length && ext.pages === 2, JSON.stringify(ext));
  await openList(page);
  const heads = await page.evaluate(() => Array.from(document.querySelectorAll(".lec-main h2")).map((h) => h.textContent));
  check(tag + "con dos tipos de lectura la lista las agrupa", heads.join("|") === "Diálogos del curso|Cuentos y textos de otras fuentes", heads.join("|"));
  const c = await page.evaluate(() => { const x = document.querySelector('.lec-card[data-id="cuento-prueba"]'); return { where: x.querySelector(".eyebrow").textContent, t: x.querySelector(".lec-card-t").textContent, meta: x.querySelector(".lec-card-meta").textContent }; });
  check(tag + "la tarjeta del cuento muestra título, fuente y páginas", c.t === "Cuento de prueba" && c.where === "Colección de prueba" && /2 páginas/.test(c.meta), JSON.stringify(c));
  await checkNoHScroll(page, "la lista con cuentos", tag);
  await openReading(page, "cuento-prueba");
  const r1 = await page.evaluate(() => ({ src: document.querySelector(".lec-source").textContent, href: (document.querySelector(".lec-source a") || {}).href, rel: (document.querySelector(".lec-source a") || {}).rel, target: (document.querySelector(".lec-source a") || {}).target,
    rows: document.querySelectorAll(".lec-row").length, pg: (document.querySelector(".lec-pg") || {}).textContent, fin: !!document.querySelector("#lec-finish"), prev: document.querySelector('[data-act="prev"]').disabled, next: document.querySelector('[data-act="next"]').disabled,
    sides: Array.from(document.querySelectorAll(".lec-row")).map((r) => r.classList.contains("a") ? "a" : r.classList.contains("b") ? "b" : "p").join(""), names: Array.from(document.querySelectorAll(".lec-row .who")).map((w) => w.textContent).slice(0, 2).join() }));
  check(tag + "el lector muestra el crédito: fuente, crédito, licencia y enlace seguro", /^Fuente: Colección de prueba · Texto de prueba hecho con líneas del curso · CC BY 4\.0 · Ver fuente/.test(r1.src) && r1.href === "https://example.org/cuento" && /noopener/.test(r1.rel) && r1.target === "_blank", JSON.stringify(r1));
  check(tag + "página 1 de 2: burbujas con quien habla, sin «Terminé de leer» todavía", r1.pg === "Página 1 de 2" && !r1.fin && r1.prev && !r1.next && r1.rows === L.length && /^[ab]+$/.test(r1.sides) && r1.names === "Ana,Beto", JSON.stringify(r1));
  await page.tap('[data-act="next"]');
  await page.waitForSelector("#lec-finish");
  const r2 = await page.evaluate(() => ({ pg: document.querySelector(".lec-pg").textContent, rows: document.querySelectorAll(".lec-row").length, sides: Array.from(document.querySelectorAll(".lec-row")).map((r) => r.classList.contains("a") ? "a" : r.classList.contains("b") ? "b" : "p").join(""), avatars: document.querySelectorAll(".avatar").length, next: document.querySelector('[data-act="next"]').disabled, lang: document.querySelector(".lec-text").getAttribute("lang"), top: document.querySelector("#lec-root").scrollTop }));
  check(tag + "página 2 de 2: párrafos sin avatar y «Terminé de leer»", r2.pg === "Página 2 de 2" && r2.rows === vocabLines.length && /^p+$/.test(r2.sides) && r2.avatars === 0 && r2.next && r2.lang === "yua" && r2.top === 0, JSON.stringify(r2));
  await page.tap('[data-act="prev"]');
  check(tag + "Anterior vuelve a la página 1", await page.evaluate(() => document.querySelector(".lec-pg").textContent === "Página 1 de 2"));
  await page.tap('[data-act="next"]'); await page.waitForSelector("#lec-finish");
  const xp0 = (await state(page)).xp;
  await page.tap("#lec-finish"); await page.waitForSelector("#lec-root .lec-card");
  const st = await state(page);
  check(tag + "terminar el cuento da +5 XP una vez y lo guarda", st.xp === xp0 + 5 && st.x.lecturas.done["cuento-prueba"].n === 1);
  await openReading(page, "enlace-raro");
  const r3 = await page.evaluate(() => ({ link: !!document.querySelector(".lec-source a"), src: document.querySelector(".lec-source").textContent, rows: document.querySelectorAll(".lec-row").length }));
  check(tag + "un enlace que no es https no se ofrece, y la línea sin traducción se descarta", !r3.link && r3.src === "Fuente: Fuente rara" && r3.rows === 1, JSON.stringify(r3));
  // Escucha y sigue solo cuenta la página en pantalla (aquí no hay audio de las líneas del cuento: salen del curso, sí lo hay).
  check(tag + "sin errores de JavaScript", page.errors.length === 0, page.errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// Sin audio: todo se puede leer, sin botones de audio ni «Escucha y sigue»; con la voz sintética apagada pasa lo mismo.
async function silentRun(browser) {
  const tag = "[sin audio] ";
  const html = withoutAudio();
  check(tag + "la página trae el marcador de audio para la prueba", !!html);
  if (!html) return;
  const { ctx, page } = await newPage(browser, { url: urlFor("sinaudio", html) });
  await load(page);
  await openList(page);
  const id = await page.evaluate(() => document.querySelector(".lec-card").dataset.id);
  await openReading(page, id);
  const r = await page.evaluate(() => ({ au: document.querySelectorAll("#lec-root [data-au]").length, follow: !!document.querySelector("#lec-follow"), note: !!document.querySelector("#lec-root .au-note"), hint: document.querySelector(".lec-hint").textContent, rows: document.querySelectorAll(".lec-row").length }));
  check(tag + "no hay botones de audio, ni «Escucha y sigue», ni nota de audio", r.au === 0 && !r.follow && !r.note && !/escucharla/.test(r.hint) && r.rows > 0, JSON.stringify(r));
  const p0 = (await au(page)).plays;
  await page.tap(".lec-bubble", { position: { x: 5, y: 5 } });
  await page.tap(".lec-w"); await page.waitForSelector("#lec-sheet:not([hidden])");
  const sh = await page.evaluate(() => ({ au: !!document.querySelector("#lec-modal [data-au]"), save: !!document.querySelector("#lec-save") || !!document.querySelector("#lec-close") }));
  check(tag + "tocar la línea no hace nada y la hoja no ofrece audio", (await au(page)).plays === p0 && !sh.au && sh.save);
  check(tag + "sin errores de JavaScript", page.errors.length === 0, page.errors.slice(0, 3).join(" | "));
  await ctx.close();
  // Voz sintética apagada (en el catálogo real todas las voces de las líneas son sintéticas).
  const { ctx: c2, page: p2 } = await newPage(browser, {});
  await load(p2);
  const hasSynth = await p2.evaluate(() => (window.__koox.audio().kinds.sintetico || 0) > 0 && (window.__koox.audio().kinds.nativo || 0) === 0);
  if (hasSynth) {
    const s = await state(p2); s.settings.synth = false;
    await seed(p2, s);
    await openList(p2);
    await openReading(p2, await p2.evaluate(() => document.querySelector(".lec-card").dataset.id));
    check(tag + "con la voz sintética apagada no hay botones de audio ni «Escucha y sigue»", await p2.evaluate(() => !document.querySelector("#lec-root [data-au]") && !document.querySelector("#lec-follow")));
  }
  await c2.close();
}

// Velocidad lenta, 360 px, claro y oscuro (contraste), movimiento reducido.
async function layoutRun(browser, scheme, reduced) {
  const tag = "[360 · " + scheme + (reduced ? " · movimiento reducido" : "") + "] ";
  const { ctx, page } = await newPage(browser, { viewport: { width: 360, height: 740 }, scheme, reduced });
  await load(page);
  const model = courseModel(await page.evaluate(() => window.__koox.course));
  const longest = model.dialogues.slice().sort((a, b) => b.lines.length - a.lines.length)[0];
  await page.evaluate(() => window.scrollTo(0, 0));
  await checkNoHScroll(page, "Inicio con la tarjeta", tag);
  await openList(page);
  await checkNoHScroll(page, "la lista", tag);
  const home = await page.evaluate(() => document.querySelector("#btn-home-readings") && document.querySelector("#btn-home-readings").getBoundingClientRect().width);
  check(tag + "la tarjeta de Inicio cabe en el ancho", home && home <= 360);
  await openReading(page, longest.id);
  await page.tap('label[for="lec-trans"]');
  await checkNoHScroll(page, "el lector con traducciones", tag);
  const pairs = await colorPairs(page);
  const bad = pairs.filter((p) => p.fg && p.bg && ratio(p.fg, p.bg) < 4.5).map((p) => p.name + " " + ratio(p.fg, p.bg).toFixed(2));
  check(tag + "contraste de 4.5:1 o más en " + pairs.length + " textos del lector", pairs.length >= 6 && !bad.length, bad.join(", "));
  const noLit = await page.evaluate(() => { const bgs = new Set(); for (const e of document.querySelectorAll("#lec-root *")) { const s = e.getAttribute("style"); if (s && /#[0-9a-f]{3,8}\b|rgb|hsl/i.test(s)) bgs.add(s); } return Array.from(bgs); });
  check(tag + "ningún estilo en línea usa colores literales", !noLit.length, noLit.join(" | "));
  await page.tap(".lec-w"); await page.waitForSelector("#lec-sheet:not([hidden])");
  await checkNoHScroll(page, "la hoja de la palabra", tag);
  await page.evaluate(() => Promise.race([Promise.all(document.getAnimations().map((a) => a.finished.catch(() => null))), new Promise((r) => setTimeout(r, 1500))]));
  const sheetBad = await page.evaluate(() => { const m = document.querySelector("#lec-modal").getBoundingClientRect(); return { l: m.left, r: m.right, w: window.innerWidth, b: m.bottom, h: window.innerHeight }; });
  check(tag + "la hoja cabe en la pantalla", sheetBad.l >= 0 && sheetBad.r <= sheetBad.w + 1 && sheetBad.b <= sheetBad.h + 1, JSON.stringify(sheetBad));
  await page.tap('#lec-modal [data-act="sheet-close"]');
  const emoji = await page.evaluate(() => /\p{Extended_Pictographic}/u.test(document.querySelector("#lec-root").textContent + document.querySelector("#btn-home-readings").textContent));
  check(tag + "sin emojis", !emoji);
  if (reduced) {
    // Con movimiento reducido todo funciona (el desplazamiento al seguir una línea no es animado).
    const a0 = await au(page);
    await page.tap("#lec-follow");
    await page.waitForFunction(() => window.__koox.lecturas.view().log.length >= 2, null, { timeout: 30000 });
    await page.tap("#lec-follow");
    const v = await view(page), anim = await page.evaluate(() => getComputedStyle(document.querySelector(".lec-row")).animationName);
    check(tag + "«Escucha y sigue» funciona y las animaciones están apagadas", !v.follow && (await au(page)).plays >= a0.plays + 2 && anim === "none", anim);
  } else if (scheme === "light") {
    // Velocidad lenta: se respeta en las líneas.
    const s = await state(page); s.settings.rate = "lenta";
    await seed(page, s);
    await openList(page); await openReading(page, longest.id);
    const a0 = await au(page);
    const i0 = await page.evaluate(() => { const r = document.querySelector(".lec-row [data-au]"); return +r.closest(".lec-row").dataset.i; });
    await page.tap('.lec-row[data-i="' + i0 + '"] .lec-bubble', { position: { x: 5, y: 5 } });
    await page.waitForFunction((n) => window.__koox.audioState().started > n, a0.started, { timeout: 6000 });
    const a1 = await au(page);
    check(tag + "con la velocidad lenta del app las líneas suenan a 0.75", a1.lastRate === 0.75 && a1.rate === 0.75, JSON.stringify([a1.lastRate, a1.rate]));
    await page.evaluate(() => window.__koox.stopAudio());
  }
  check(tag + "sin errores de JavaScript", page.errors.length === 0, page.errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// Un audio que no carga: «Escucha y sigue» lo salta, sigue con las demás líneas y el botón de esa línea desaparece.
async function brokenRun(browser) {
  const tag = "[audio roto] ";
  const { ctx: c0, page: p0 } = await newPage(browser, {});
  await load(p0);
  const model = courseModel(await p0.evaluate(() => window.__koox.course));
  const cand = model.dialogues.slice().sort((a, b) => a.lines.length - b.lines.length)[0];
  const keys = await p0.evaluate((lines) => lines.map((l) => { const a = window.__koox.audioFor("text", l.m); return a ? a.key : null; }), cand.lines);
  await c0.close();
  const order = keys.map((k, i) => (k ? i : -1)).filter((i) => i >= 0);
  const mark = "window.COURSE_AUDIO = ", a = HTML.indexOf(mark) + mark.length, b = HTML.indexOf(";\n</script>", a);
  if (a < mark.length || b < 0 || order.length < 3) { check(tag + "la página trae el catálogo de audio y la lectura tiene 3 líneas con audio", false, order.length); return; }
  const cat = JSON.parse(HTML.slice(a, b)), bad = keys[order[1]], entry = cat.entries.find((e) => e.key === bad);
  entry.file = "data:audio/mpeg;base64,AAAA";
  entry.hash = undefined;
  const html = HTML.slice(0, a) + JSON.stringify(cat).replace(/</g, "\\u003c") + HTML.slice(b);
  const { ctx, page } = await newPage(browser, { url: urlFor("roto", html) });
  await load(page);
  await openList(page); await openReading(page, cand.id);
  const before = await au(page);
  await page.tap("#lec-follow");
  await page.waitForFunction(() => !window.__koox.lecturas.view().follow, null, { timeout: 40000 });
  const v = await view(page), after = await au(page);
  const hidden = await page.evaluate((i) => { const r = document.querySelector('.lec-row[data-i="' + i + '"] [data-au]'); return r ? r.hidden || getComputedStyle(r).display === "none" : "sin botón"; }, order[1]);
  check(tag + "el audio roto se salta y las demás líneas suenan en orden (" + v.log.join("→") + ")", JSON.stringify(v.log) === JSON.stringify(order) && after.errors === 1 && v.active === -1, JSON.stringify([v.log, after.errors, after.plays - before.plays]));
  check(tag + "el botón de la línea rota se oculta", hidden === true || hidden === "sin botón", String(hidden));
  const n0 = (await au(page)).plays;
  await page.tap('.lec-row[data-i="' + order[1] + '"] .lec-bubble', { position: { x: 5, y: 5 } });
  await sleep(300);
  check(tag + "tocar la línea rota ya no hace nada ni se resalta", (await au(page)).plays === n0 && (await view(page)).active === -1);
  check(tag + "sin errores de JavaScript", page.errors.length === 0, page.errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// Escritorio (1280 px) y teclado: columna centrada, el foco se queda dentro de la pantalla modal y Enter abre la palabra.
async function desktopRun(browser) {
  const tag = "[1280 · teclado] ";
  const { ctx, page } = await newPage(browser, { viewport: { width: 1280, height: 900 }, desktop: true });
  await load(page);
  await page.click("#btn-home-readings");
  await page.waitForSelector("#lec-root:not([hidden]) .lec-card");
  const col = await page.evaluate(() => { const w = document.querySelector(".lec-wrap").getBoundingClientRect(); return { w: w.width, left: w.left, right: 1280 - w.right }; });
  check(tag + "la lista es una columna de 600 px o menos, centrada", col.w <= 600 && Math.abs(col.left - col.right) <= 20, JSON.stringify(col));
  await checkNoHScroll(page, "la lista", tag);
  const inside = async () => page.evaluate(() => { const a = document.activeElement; return !!a && !!a.closest("#lec-root, #lec-sheet"); });
  let out = 0;
  for (let i = 0; i < 25; i++) { await page.keyboard.press("Tab"); if (!(await inside())) out++; }
  check(tag + "con Tab el foco no sale de la pantalla de Lecturas (25 pulsaciones)", out === 0, out + " fuera");
  await page.click(".lec-card");
  await page.waitForSelector("#lec-root .lec-row");
  out = 0;
  for (let i = 0; i < 40; i++) { await page.keyboard.press("Tab"); if (!(await inside())) out++; }
  check(tag + "…ni en el lector (40 pulsaciones)", out === 0, out + " fuera");
  await page.focus(".lec-w");
  await page.keyboard.press("Enter");
  await page.waitForSelector("#lec-sheet:not([hidden]) #lec-w-title");
  out = 0;
  for (let i = 0; i < 12; i++) { await page.keyboard.press("Tab"); if (!(await page.evaluate(() => !!document.activeElement.closest("#lec-sheet")))) out++; }
  check(tag + "Enter abre la hoja de la palabra y Tab no sale de ella (12 pulsaciones)", out === 0, out + " fuera");
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => document.querySelector("#lec-root").hidden);
  check(tag + "tres Escape cierran la hoja, el lector y la lista", (await screenOf(page)) === "home");
  check(tag + "sin errores de JavaScript", page.errors.length === 0, page.errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// Una lectura completa de «Escucha y sigue»: recorre todas las líneas con audio y se detiene sola.
async function followRun(browser) {
  const tag = "[escucha y sigue] ";
  const { ctx, page } = await newPage(browser, {});
  await load(page);
  const model = courseModel(await page.evaluate(() => window.__koox.course));
  const short = model.dialogues.slice().sort((a, b) => a.lines.length - b.lines.length)[0];
  await openList(page); await openReading(page, short.id);
  const expAu = await page.evaluate((lines) => lines.map((l) => !!window.__koox.audioFor("text", l.m)), short.lines);
  const order = expAu.map((x, i) => (x ? i : -1)).filter((i) => i >= 0);
  const a0 = await au(page);
  await page.tap("#lec-follow");
  await page.waitForFunction(() => !window.__koox.lecturas.view().follow, null, { timeout: 40000 });
  const v = await view(page), a1 = await au(page);
  const btn = await page.evaluate(() => document.querySelector("#lec-follow").textContent.trim());
  check(tag + "recorre todas las líneas con audio en orden (" + v.log.join("→") + ") y termina sola", JSON.stringify(v.log) === JSON.stringify(order) && a1.plays === a0.plays + order.length && a1.ended >= a0.ended + order.length - 1 && !a1.playing && v.active === -1 && btn === "Escucha y sigue", JSON.stringify([v.log, a1.plays - a0.plays, btn]));
  check(tag + "sin errores de audio ni de JavaScript", a1.errors === 0 && page.errors.length === 0, page.errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// Formato de las lecturas de otras fuentes (src/content/lecturas.js): más estricto que el de la página, que descarta
// lo que no sirve. Aquí una lectura sin licencia o sin crédito es un error: hay que dar el crédito.
function readingProblems(list) {
  const out = [], ids = new Set(), nonEmpty = (x) => typeof x === "string" && x.trim() !== "";
  if (!Array.isArray(list)) return ["COURSE_READINGS no es una lista"];
  list.forEach((r, i) => {
    const w = "lectura " + (r && r.id ? r.id : "#" + (i + 1)) + ": ";
    if (!r || typeof r !== "object") { out.push(w + "no es un objeto"); return; }
    if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(r.id || "") || /^dlg-/.test(r.id)) out.push(w + "id inválido (a-z, 0-9 y guiones; no «dlg-»)");
    else if (ids.has(r.id)) out.push(w + "id repetido"); else ids.add(r.id);
    if (!nonEmpty(r.title)) out.push(w + "falta el título");
    const s = r.source;
    if (!s || !nonEmpty(s.name) || !nonEmpty(s.license) || !nonEmpty(s.credit)) out.push(w + "source necesita name, license y credit");
    if (s && s.url !== undefined && !/^https:\/\/[^\s"'<>]+$/.test(s.url)) out.push(w + "source.url debe ser https");
    if (!Array.isArray(r.pages) || !r.pages.length) out.push(w + "faltan las páginas");
    (Array.isArray(r.pages) ? r.pages : []).forEach((p, pi) => {
      if (!p || !Array.isArray(p.lines) || !p.lines.length) { out.push(w + "la página " + (pi + 1) + " no tiene líneas"); return; }
      p.lines.forEach((l, li) => {
        if (!l || !nonEmpty(l.m) || !nonEmpty(l.es)) out.push(w + "página " + (pi + 1) + ", línea " + (li + 1) + ": faltan m o es");
        else if ((l.who !== undefined && l.who !== "A" && l.who !== "B") || (l.name !== undefined && !nonEmpty(l.name))) out.push(w + "página " + (pi + 1) + ", línea " + (li + 1) + ": who debe ser A o B y name un texto");
      });
    });
  });
  return out;
}

// Estática: ni colores literales ni emojis en el código del módulo.
function staticRun() {
  const tag = "[código] ";
  const rf = path.join(ROOT, "src/content/lecturas.js");
  if (fs.existsSync(rf)) {
    const code = fs.readFileSync(rf, "utf8"), w = {};
    let ok = true; try { new Function("window", code)(w); } catch (e) { ok = false; }
    const probs = ok ? readingProblems(w.COURSE_READINGS) : ["no se pudo ejecutar"];
    check(tag + "src/content/lecturas.js cumple el formato (" + (ok && Array.isArray(w.COURSE_READINGS) ? w.COURSE_READINGS.length : "?") + " lecturas)", ok && !probs.length && !/`|<\/script/i.test(code), probs.slice(0, 3).join(" | "));
  }
  const good = { id: "ok", title: "T", source: { name: "n", license: "l", credit: "c", url: "https://x.org" }, pages: [{ lines: [{ m: "a", es: "b", who: "A", name: "N" }] }] };
  const bads = [{}, Object.assign({}, good, { id: "Mal" }), Object.assign({}, good, { id: "dlg-x" }), Object.assign({}, good, { source: { name: "n" } }), Object.assign({}, good, { source: Object.assign({}, good.source, { url: "http://x" }) }),
    Object.assign({}, good, { pages: [{ lines: [{ m: "a" }] }] }), Object.assign({}, good, { pages: [{ lines: [{ m: "a", es: "b", who: "C" }] }] }), Object.assign({}, good, { pages: [] })];
  check(tag + "el validador de formato acepta una lectura buena y rechaza " + bads.length + " malas, y las repetidas", readingProblems([good]).length === 0 && bads.every((b) => readingProblems([b]).length > 0) && readingProblems([good, good]).length > 0);
  const files = ["src/modules/lecturas.js", "src/modules/lecturas.css", "src/content/lecturas.js"].map((f) => [f, path.join(ROOT, f)]);
  for (const [f, p] of files) check(tag + f + " existe", fs.existsSync(p));
  const css = fs.existsSync(files[1][1]) ? fs.readFileSync(files[1][1], "utf8").replace(/\/\*[\s\S]*?\*\//g, "") : "";
  check(tag + "el CSS del módulo no tiene colores literales (solo tokens)", !/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\bhwb\(|\blab\(|\boklch\(/.test(css), (css.match(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g) || []).join(" "));
  const js = fs.existsSync(files[0][1]) ? fs.readFileSync(files[0][1], "utf8") : "";
  check(tag + "el JS del módulo no usa alert, confirm ni prompt", !/\b(alert|confirm|prompt)\s*\(/.test(js.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")));
  check(tag + "los archivos del módulo no tienen emojis", files.every(([, p]) => !fs.existsSync(p) || !/\p{Extended_Pictographic}/u.test(fs.readFileSync(p, "utf8"))));
  check(tag + "el CSS respeta prefers-reduced-motion (lo apaga la regla global del núcleo y el módulo no anima)", !/@keyframes|animation\s*:\s*[^n]/.test(css.replace(/animation:\s*none/g, "")));
}

(async () => {
  log("Ko'ox Maaya · pruebas del módulo Lecturas");
  log("Archivo: " + SRC);
  staticRun();
  const browser = await chromium.launch();
  const runs = [
    ["lista, lector, palabras, traducción, audio, Escucha y sigue, XP y Perfil (390 px, claro)", mainRun],
    ["progreso: completar una lección sube la cobertura", progressRun],
    ["botón Atrás y Escape", backRun],
    ["COURSE_READINGS (lecturas de otras fuentes, páginas y créditos)", externalRun],
    ["sin audio y con la voz sintética apagada", silentRun],
    ["«Escucha y sigue» completo", followRun],
    ["audio que no carga", brokenRun],
    ["escritorio (1280 px) y teclado", desktopRun],
    ["360 px claro y velocidad lenta", (b) => layoutRun(b, "light", false)],
    ["360 px oscuro", (b) => layoutRun(b, "dark", false)],
    ["360 px con movimiento reducido", (b) => layoutRun(b, "light", true)]
  ];
  for (const [label, fn] of runs) {
    const t = Date.now();
    log("\n▸ " + label);
    try { await fn(browser); }
    catch (e) { check("[" + label + "] ejecución sin excepciones", false, (e && e.message || String(e)).split("\n")[0]); }
    log("  (" + ((Date.now() - t) / 1000).toFixed(1) + " s)");
  }
  await browser.close();
  const failed = results.filter((r) => !r.pass);
  log("\nResumen: " + (results.length - failed.length) + "/" + results.length + " comprobaciones correctas en " + ((Date.now() - T0) / 1000).toFixed(1) + " s");
  if (failed.length) {
    log("FALLAS:");
    failed.forEach((f) => log("  ✗ " + f.name + (f.detail ? " — " + f.detail : "")));
    process.exit(1);
  }
  log("OK");
})().catch((e) => { console.error(e); process.exit(1); });
