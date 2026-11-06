#!/usr/bin/env node
// Pruebas de los logros «Puedo…» y de la sección «Voces» del Perfil (Chromium headless con Playwright).
//   node test/logros.cjs <ruta.html>        el html del Artifact (se envuelve como lo hace la plataforma)
// Antes revisa, sin navegador, el contenido de src/content/puedo.js contra las unidades reales y los estilos de
// los módulos. Capturas (como máximo dos, a 390 px) solo si KOOX_SHOTS apunta a una carpeta.
// Sale con código 1 si algo falla.
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const target = process.argv[2];
if (!target) { console.error("Uso: node test/logros.cjs <ruta.html>"); process.exit(2); }
const SRC = path.resolve(target);
const SHOTS = process.env.KOOX_SHOTS ? path.resolve(process.env.KOOX_SHOTS) : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const STORE = "koox-maaya-v2";

const T0 = Date.now();
const results = [];
function check(name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail == null ? "" : String(detail) });
  if (!pass || process.env.VERBOSE) console.log("  " + (pass ? "✓" : "✗") + " " + name + (detail ? " — " + detail : ""));
  return !!pass;
}
const log = (s) => console.log(s);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* ============ 1) Contenido y estilos (sin navegador) ============ */
const norm = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const strip = (h) => String(h).replace(/<[^>]*>/g, " ");
function loadWindow(files) {
  const win = {};
  const ctx = vm.createContext({ window: win });
  for (const f of files) vm.runInContext(fs.readFileSync(f, "utf8"), ctx, { filename: f });
  return win;
}
const CONTENT = path.join(ROOT, "src/content");
const unitFiles = fs.readdirSync(CONTENT).filter((f) => /^u\d+\.js$/.test(f)).sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10)).map((f) => path.join(CONTENT, f));
const UNITS = loadWindow(unitFiles).COURSE.units;
const PUEDO = path.join(CONTENT, "puedo.js");
// Los enunciados de las unidades nuevas viven al final de su propio archivo; puedo.js trae los de las primeras.
const CANDO = loadWindow(unitFiles.concat([PUEDO])).COURSE_CANDO;
const EMOJI = /\p{Extended_Pictographic}/u;
// Todo el material que enseña una unidad (metas, títulos, traducciones, tarjetas y diálogos), sin acentos.
function corpus(u) {
  const parts = [u.title, u.subtitle];
  for (const l of u.lessons) {
    parts.push(l.title, l.goal);
    for (const c of l.teach || []) { parts.push(c.title, strip(c.html || "")); (c.rows || []).forEach((r) => parts.push(r.join(" "))); }
    for (const v of l.vocab || []) parts.push(v.es, v.note || "");
    if (l.dialogue) l.dialogue.lines.forEach((x) => parts.push(x.es));
  }
  return norm(parts.filter(Boolean).join(" "));
}
function contenido() {
  log("\n▸ contenido de src/content/puedo.js y estilos de los módulos");
  const ids = UNITS.map((u) => u.id);
  check("[contenido] puedo.js define window.COURSE_CANDO como objeto", CANDO && typeof CANDO === "object" && !Array.isArray(CANDO));
  check("[contenido] COURSE_CANDO tiene exactamente las unidades del curso (contenido ↔ unidades reales)",
    ids.length >= 9 && same(Object.keys(CANDO || {}).sort(), ids.slice().sort()), Object.keys(CANDO || {}).join(",") + " vs " + ids.join(","));
  const vocabOf = {};
  UNITS.forEach((u) => { vocabOf[u.id] = {}; u.lessons.forEach((l) => (l.vocab || []).forEach((v) => { vocabOf[u.id][v.id] = v; })); });
  const seen = new Set();
  let nEx = 0, bad = [];
  for (const u of UNITS) {
    const e = (CANDO || {})[u.id], can = e && e.can;
    if (!(Array.isArray(can) && can.length === 3)) { bad.push(u.id + ": no tiene 3 enunciados"); continue; }
    const cp = corpus(u);
    can.forEach((c, i) => {
      const w = u.id + "." + (i + 1);
      const t = typeof c.t === "string" ? c.t : "";
      if (!/^Puedo \S/.test(t) || !/[.]$/.test(t)) bad.push(w + ": debe empezar con «Puedo » y terminar en punto");
      if (t.length > 160) bad.push(w + ": demasiado largo (" + t.length + ")");
      if (/[<>&]/.test(t) || EMOJI.test(t)) bad.push(w + ": sin HTML ni emojis");
      if (/['’‘ʼ]/.test(t)) bad.push(w + ": lleva saltillo, o sea maya escrito aquí (la forma maya sale del curso con ex)");
      if (seen.has(t)) bad.push(w + ": enunciado repetido");
      seen.add(t);
      // Anclaje: las palabras de contenido del enunciado salen de lo que la unidad enseña (se tolera 1 por la conjugación).
      const miss = norm(t).split(/[^a-z0-9ñ]+/).filter((x) => x.length >= 5 && x !== "puedo").filter((x) => !cp.includes(x.slice(0, 5)));
      if (miss.length > 1) bad.push(w + ": palabras que la unidad no menciona: " + miss.join(", "));
      if (c.ex !== undefined) {
        nEx++;
        const v = vocabOf[u.id][c.ex];
        if (!v) bad.push(w + ": ex «" + c.ex + "» no es una palabra de la unidad " + u.id);
        else if (v.conf !== "alta") bad.push(w + ": ex «" + c.ex + "» tiene confianza «" + v.conf + "» (solo se muestran formas confirmadas)");
      }
    });
  }
  check("[contenido] cada unidad tiene 3 enunciados «Puedo …» claros, sin repetir, sin maya escrito y anclados en lo que la unidad enseña", !bad.length, bad.join(" · "));
  check("[contenido] todos los ex existen en el vocabulario de su unidad y son formas confirmadas", !bad.some((b) => /ex «/.test(b)) && nEx > 0, nEx + " ejemplos");
  const read = (f) => fs.readFileSync(path.join(ROOT, "src/modules", f), "utf8");
  const files = ["logros.js", "logros.css", "voces.js", "voces.css"];
  for (const f of ["logros.css", "voces.css"]) {
    const css = read(f).replace(/\/\*[\s\S]*?\*\//g, "");
    const lit = css.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(|\bcolor\(/g);
    check("[estilos] " + f + " usa solo tokens del tema (var(--…)), sin colores sueltos", !lit, lit ? lit.join(" ") : (css.match(/var\(--/g) || []).length + " usos de tokens");
  }
  const dirty = files.concat([]).filter((f) => EMOJI.test(read(f)) || /<\/script|<!--/i.test(read(f)));
  check("[contenido] módulos y estilos sin emojis ni </script", !dirty.length && !EMOJI.test(fs.readFileSync(PUEDO, "utf8")), dirty.join(", "));
}

/* ============ 2) Navegador ============ */
const html = fs.readFileSync(SRC, "utf8");
if (/^﻿?\s*(<!--[\s\S]*?-->\s*)*<!doctype/i.test(html)) { console.error("Esta prueba espera el html del Artifact (sin <!doctype)."); process.exit(2); }
const UA = "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36";
const FONT_DIR = path.join(__dirname, ".fontcache");
const fontMap = new Map();
const hash = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 16);
function curl(url, out) { execFileSync("curl", ["-sS", "-f", "-L", "-m", "15", "-A", UA, "-o", out, url], { stdio: "ignore" }); }
function prepareFonts() {
  const mm = /https:\/\/fonts\.googleapis\.com\/css2\?[^"'<>\s]+/.exec(html);
  if (!mm) return;
  const cssUrl = mm[0].replace(/&amp;/g, "&");
  try {
    fs.mkdirSync(FONT_DIR, { recursive: true });
    const cssFile = path.join(FONT_DIR, hash(cssUrl) + ".css");
    if (!fs.existsSync(cssFile)) curl(cssUrl, cssFile);
    const css = fs.readFileSync(cssFile, "utf8");
    fontMap.set(cssUrl, { file: cssFile, type: "text/css; charset=utf-8" });
    for (const u of new Set(css.match(/https:\/\/fonts\.gstatic\.com\/[^)'"\s]+/g) || [])) {
      const f = path.join(FONT_DIR, hash(u) + ".woff2");
      if (!fs.existsSync(f)) { try { curl(u, f); } catch (e) { continue; } }
      fontMap.set(u, { file: f, type: "font/woff2" });
    }
  } catch (e) { /* se usan las fuentes de respaldo */ }
}

// Página de vista previa con el esqueleto que agrega la plataforma; una variante por cambio en el html.
const previews = new Map();
function previewOf(tag, transform) {
  if (previews.has(tag)) return previews.get(tag);
  const body = transform ? transform(html) : html;
  if (body === html && transform) throw new Error("la variante «" + tag + "» no cambió nada en el html");
  const file = path.join(path.dirname(SRC), path.basename(SRC).replace(/\.html?$/i, "") + ".logros-" + tag + ".preview.html");
  fs.writeFileSync(file, "<!doctype html><html lang=es><head><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1,viewport-fit=cover'></head><body>" + body + "</body></html>");
  previews.set(tag, "file://" + file);
  return previews.get(tag);
}
const rename = (name) => (h) => h.replace("window." + name + " =", "window." + name + "_OFF =");
const audioDe = (entries) => (h) => h.replace("window.COURSE_AUDIO =", "window.COURSE_AUDIO = " + JSON.stringify({ version: 1, entries }) + ";\nwindow.COURSE_AUDIO_REAL =");
const MP3 = "data:audio/mpeg;base64,AAAA";
const entry = (o) => Object.assign({ key: "x", file: MP3, kind: "sintetico", text: "x", lang: "yua", vocab: [], letters: [], author: "Prueba", license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0/", source: "https://example.org/x", title: "x", notes: "" }, o);

async function newPage(browser, cfg) {
  const ctx = await browser.newContext({ viewport: cfg.viewport, isMobile: !!cfg.mobile, hasTouch: !!cfg.mobile, colorScheme: cfg.scheme || "light", deviceScaleFactor: 1 });
  await ctx.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) => {
    const hit = fontMap.get(route.request().url());
    if (hit) return route.fulfill({ status: 200, contentType: hit.type, headers: { "access-control-allow-origin": "*" }, body: fs.readFileSync(hit.file) });
    return route.abort();
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push("pageerror: " + e.message));
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    if (/fonts\.(googleapis|gstatic)\.com/.test(((msg.location() && msg.location().url) || "") + " " + msg.text())) return;
    page.errors.push("console.error: " + msg.text());
  });
  return { ctx, page };
}
const PHONE = { name: "390-claro", viewport: { width: 390, height: 844 }, mobile: true, scheme: "light" };
async function load(page, url, seed) {
  await page.goto(url, { waitUntil: "load" });
  await page.waitForFunction(() => window.__koox && typeof window.__koox.screen === "function" && window.__koox.logros, null, { timeout: 8000 });
  if (seed !== undefined) { // siembra el avance guardado y vuelve a arrancar
    await page.evaluate(([k, s]) => { if (s === null) localStorage.removeItem(k); else localStorage.setItem(k, typeof s === "string" ? s : JSON.stringify(s)); }, [STORE, seed]);
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => window.__koox && window.__koox.logros, null, { timeout: 8000 });
  }
  await page.evaluate(() => document.fonts && document.fonts.ready);
}
const tap = (page, cfg, sel) => (cfg.mobile ? page.tap(sel) : page.click(sel));
async function tab(page, cfg, t) {
  await tap(page, cfg, "#tab-" + t);
  await page.waitForFunction((v) => window.__koox.screen() === v, { aprender: "home", repasar: "review", diccionario: "dict", perfil: "profile" }[t]);
}
const K = (page, fn, arg) => page.evaluate(fn, arg);
const raw = (page) => page.evaluate(() => window.__koox.state());
const logros = (page) => page.evaluate(() => window.__koox.logros.view());
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const visible = (page, sel) => page.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return cs.display !== "none" && cs.visibility !== "hidden" && r.width > 0 && r.height > 0; }, sel);

// Mide el desbordamiento horizontal (como la prueba de humo) y el contraste de los textos propios.
async function overflow(page) {
  return page.evaluate(() => {
    const d = document.documentElement, b = document.body, vw = d.clientWidth, bad = [];
    for (const el of document.querySelectorAll("body *")) {
      if (el.closest(".table-wrap, .chips, svg, .sr-only")) continue;
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      if (r.right > vw + 1 || r.left < -1) { bad.push(el.tagName.toLowerCase() + (typeof el.className === "string" && el.className ? "." + el.className.trim().split(/\s+/).join(".") : "") + " [" + Math.round(r.left) + "→" + Math.round(r.right) + "]"); if (bad.length >= 4) break; }
    }
    return { sw: Math.max(d.scrollWidth, b.scrollWidth), cw: vw, bad };
  });
}
async function noOverflow(page, where, cfg) {
  const o = await overflow(page);
  return check("[" + cfg.name + "] sin scroll horizontal en " + where, o.sw <= o.cw + 1 && !o.bad.length, "scrollWidth " + o.sw + " / ancho " + o.cw + (o.bad.length ? " · se salen: " + o.bad.join(", ") : ""));
}
function contrastIn(sels) {
  return sels.map((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { sel, ratio: null };
    const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
    const fg = parse(getComputedStyle(el).color);
    let bg = null;
    for (let n = el; n && n.nodeType === 1 && !bg; n = n.parentElement) { const c = parse(getComputedStyle(n).backgroundColor); if (c && c.a > 0.99) bg = c; }
    bg = bg || parse(getComputedStyle(document.body).backgroundColor);
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    const lum = (c) => 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    const a = lum(fg), b = lum(bg);
    return { sel, ratio: Math.round((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) * 100) / 100 };
  });
}

// Recorre la sesión actual hasta los resultados; contesta mal los primeros `wrongs` ejercicios (sin contar reintentos).
function runSession(wrongs) {
  const KK = window.__koox, q = (s) => document.querySelector(s);
  const out = { ok: false, wrong: 0, ex: 0 };
  for (let guard = 0; guard < 700; guard++) {
    const s = KK.screen();
    if (s === "results") { out.ok = true; return out; }
    if (s === "teach" || s === "vocab" || s === "dialogue") { q("#btn-next").click(); continue; }
    if (s === "exercise") {
      const p = KK.peek();
      out.ex++;
      const bad = out.wrong < wrongs && !p.retry;
      if (bad) out.wrong++;
      if (!KK.solve(bad)) { out.error = "solve() no pudo contestar " + p.type; return out; }
      if (KK.screen() === "exercise") {
        const b = q("#btn-check");
        if (!b || b.disabled || b.hidden) { out.error = "Comprobar no disponible en " + p.type; return out; }
        b.click();
      }
      if (KK.screen() !== "feedback") { out.error = "sin retroalimentación tras comprobar " + p.type; return out; }
      continue;
    }
    if (s === "feedback") { q("#btn-continue").click(); continue; }
    out.error = "pantalla inesperada: " + s; return out;
  }
  out.error = "demasiados pasos"; return out;
}
async function doLesson(page, cfg, id) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await tap(page, cfg, '[data-lesson="' + id + '"]');
  await page.waitForSelector("#lesson-sheet:not([hidden]) #btn-start-lesson");
  await tap(page, cfg, "#btn-start-lesson");
  await page.waitForFunction(() => ["teach", "vocab", "dialogue", "exercise"].includes(window.__koox.screen()));
  const r = await page.evaluate(runSession, 0);
  if (!r.ok) throw new Error("la lección " + id + " no llegó a resultados: " + r.error);
  await tap(page, cfg, "#btn-results-home");
  await page.waitForFunction(() => window.__koox.screen() === "home");
}
// Abre «Repaso de la unidad», lo contesta con `wrongs` errores y deja la pantalla de resultados.
async function unitReview(page, cfg, uid, wrongs) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await tap(page, cfg, '[data-unit-review="' + uid + '"]');
  await page.waitForFunction(() => ["teach", "vocab", "dialogue", "exercise"].includes(window.__koox.screen()));
  const r = await page.evaluate(runSession, wrongs);
  if (!r.ok) throw new Error("el repaso de " + uid + " no llegó a resultados: " + r.error);
  const pct = parseInt(await page.textContent(".score-ring .pct"), 10);
  return { pct, wrong: r.wrong, ex: r.ex };
}
async function backHome(page, cfg) {
  await tap(page, cfg, "#btn-results-home");
  await page.waitForFunction(() => window.__koox.screen() === "home");
}

async function main() {
  prepareFonts();
  const browser = await chromium.launch();
  const cfg = PHONE;
  const url = previewOf("base");
  const nUnits = UNITS.length;
  const u1 = UNITS[0], u1Lessons = u1.lessons.map((l) => l.id);
  const allDone = (u) => Object.fromEntries(u.lessons.map((l) => [l.id, { best: 100, done: true, times: 1 }]));
  const stateWith = (extra) => Object.assign({ v: 2, xp: 0, xpByDay: {}, streak: { count: 0, best: 0, last: null, graceWeek: null }, daysTotal: 0, goal: 20, lessons: {}, srs: {}, x: {}, settings: { sound: false, autoplay: false, rate: "normal", synth: true, calm: false } }, extra);
  let S0 = null, afterUnlock = null, exported = null;

  /* ---- A) Arranque sin avance ---- */
  {
    log("\n▸ sin avance: Perfil, Inicio y Voces (390 px, claro)");
    const { ctx, page } = await newPage(browser, cfg);
    await load(page, url, null);
    check("[A] los ganchos __koox.logros y __koox.voces existen", await page.evaluate(() => typeof window.__koox.logros.session === "function" && typeof window.__koox.voces === "function"));
    check("[A] Inicio sin avance: ninguna insignia «Puedo»", (await page.$$(".cd-badge")).length === 0);
    check("[A] leer el estado no crea state.x.logros (solo se escribe cuando hay algo que guardar)", (await raw(page)).x.logros === undefined, JSON.stringify((await raw(page)).x));
    await tab(page, cfg, "perfil");
    const sec = await page.evaluate(() => { const s = document.querySelector("#cando"); return s ? { text: s.textContent, on: s.querySelectorAll(".cd-unit.on").length, off: s.querySelectorAll(".cd-unit.off").length, h2: (s.querySelector("h2") || {}).textContent } : null; });
    check("[A] Perfil → «Lo que ya puedes decir» con todas las unidades bloqueadas", sec && sec.h2 === "Lo que ya puedes decir" && sec.off === nUnits && sec.on === 0 && new RegExp("0 de " + nUnits + " unidades").test(sec.text), sec && sec.off + " bloqueadas / " + sec.on);
    check("[A] cada unidad bloqueada dice «Termina la unidad y aprueba su repaso (80 %)»", sec && (sec.text.match(/Termina la unidad y aprueba su repaso \(80 %\)/g) || []).length === nUnits);
    check("[A] las bloqueadas muestran el avance de lecciones y que aún no hay repaso", sec && /0 de 3 lecciones · Todavía sin repaso de la unidad/.test(sec.text));
    check("[A] las bloqueadas no revelan los enunciados", sec && !/Puedo /.test(sec.text.replace(/«Puedo»/g, "")));
    const v = await page.evaluate(() => { const s = document.querySelector("#voces"); const bar = s && s.querySelector('[role="progressbar"]'); return s ? { text: s.textContent, now: bar && bar.getAttribute("aria-valuenow"), max: bar && bar.getAttribute("aria-valuemax"), link: s.querySelectorAll('a[href="grabar.html"]').length, stats: window.__koox.voces(), coreNative: window.__koox.audio().native.length, total: window.__koox.vocabCount() } : null; });
    check("[A] Voces: «N de total palabras con voz nativa» coincide con el curso y con el audio del motor", v && v.stats.total === v.total && v.stats.native === v.coreNative && new RegExp(v.stats.native + " de " + v.total + " palabras con voz nativa").test(v.text), v && v.text.slice(0, 120));
    check("[A] Voces: barra de progreso accesible con el mismo conteo", v && v.now === String(v.stats.native) && v.max === String(v.total));
    check("[A] Voces sin voz nativa: mensaje amable «Todavía no hay voz nativa en el curso. Cada grabación cuenta.»", v && (v.stats.native > 0 || /Todavía no hay voz nativa en el curso\. Cada grabación cuenta\./.test(v.text)), "nativas: " + (v && v.stats.native));
    check("[A] Voces aclara que la voz sintética es aproximada (si la hay)", v && (v.stats.synthetic === 0 || (/voz sintética/.test(v.text) && /aproximada/.test(v.text))), "sintéticas: " + (v && v.stats.synthetic));
    check("[A] Voces en el Artifact: invitación solo como texto, sin enlace a grabar.html", v && v.link === 0 && /¿Hablas maya\? Ayuda a grabar/.test(v.text));
    await noOverflow(page, "Perfil (sin avance)", cfg);
    check("[A] sin errores de consola", !page.errors.length, page.errors.join(" | "));
    await ctx.close();
  }

  /* ---- B) Reglas con la interfaz: lecciones completas y repaso de la unidad ---- */
  {
    log("\n▸ reglas con la interfaz: unidad 1 (lecciones + repaso de la unidad)");
    const { ctx, page } = await newPage(browser, cfg);
    await load(page, url, null);
    await K(page, () => window.scrollTo(0, 0));
    for (const id of u1Lessons) await doLesson(page, cfg, id);
    const st1 = await raw(page);
    check("[B] las " + u1Lessons.length + " lecciones de la unidad 1 quedan completas", u1Lessons.every((id) => st1.lessons[id] && st1.lessons[id].done), JSON.stringify(Object.keys(st1.lessons)));
    check("[B] lecciones completas sin repaso: «Puedo» sigue cerrado y no se escribe nada", st1.x.logros === undefined, JSON.stringify(st1.x));
    S0 = JSON.stringify(st1);

    // Repaso con errores (por debajo de 80 %): no abre, guarda el mejor resultado y avisa con calma.
    const low = await unitReview(page, cfg, "u1", 4);
    check("[B] repaso de la unidad con errores termina por debajo de 80 % (" + low.pct + " %)", low.pct < 80, low.pct + " % con " + low.wrong + " errores de " + low.ex);
    const lowSt = await raw(page);
    const lowNote = await page.evaluate(() => { const n = document.querySelector(".cd-note"); return n ? { text: n.textContent, gami: n.classList.contains("gami") } : null; });
    check("[B] con " + low.pct + " %: no se abre «Puedo» (sin tarjeta de celebración)", (await page.$$(".cd-win")).length === 0 && !(lowSt.x.logros && lowSt.x.logros.cando && lowSt.x.logros.cando.u1));
    check("[B] con " + low.pct + " %: se guarda el mejor resultado {best, at} de la unidad", lowSt.x.logros && lowSt.x.logros.units.u1 && lowSt.x.logros.units.u1.best === low.pct && lowSt.x.logros.units.u1.at === today(), JSON.stringify(lowSt.x.logros));
    check("[B] con " + low.pct + " %: un aviso tranquilo (.gami) explica que se abre con 80 % y da el mejor resultado", lowNote && lowNote.gami && /80 %/.test(lowNote.text) && new RegExp("Tu mejor resultado: " + low.pct + " %").test(lowNote.text), lowNote && lowNote.text);
    await backHome(page, cfg);
    await tab(page, cfg, "perfil");
    check("[B] Perfil: la unidad 1 sigue bloqueada y muestra «Mejor repaso: " + low.pct + " %»", await page.evaluate((p) => { const e = document.querySelector("#cando-u1"); return !!e && e.classList.contains("off") && new RegExp("3 de 3 lecciones · Mejor repaso: " + p + " %").test(e.textContent); }, low.pct));
    await tab(page, cfg, "aprender");
    check("[B] Inicio: aún sin insignia en la unidad 1", (await page.$$("#unit-u1 .cd-badge")).length === 0);

    // Repaso con un solo error (80 % o más): se abre.
    const hi = await unitReview(page, cfg, "u1", 1);
    check("[B] repaso de la unidad con un error llega a 80 % o más (" + hi.pct + " %)", hi.pct >= 80, hi.pct + " %");
    const win = await page.evaluate(() => {
      const w = document.querySelector(".cd-win");
      if (!w) return null;
      return { gami: w.classList.contains("gami"), greca: !!w.querySelector(".greca"), items: w.querySelectorAll(".cd-list > li").length, texts: [...w.querySelectorAll(".cd-t")].map((x) => x.textContent), ex: [...w.querySelectorAll(".cd-ex .m")].map((x) => ({ t: x.textContent, lang: x.getAttribute("lang") })), head: w.textContent, labelled: w.getAttribute("aria-labelledby") };
    });
    check("[B] con " + hi.pct + " %: tarjeta de celebración sobria (.gami, con la greca) con los 3 enunciados", win && win.gami && win.greca && win.items === 3 && same(win.texts, CANDO.u1.can.map((c) => c.t)), win ? win.items + " enunciados" : "sin tarjeta");
    check("[B] la celebración muestra el ejemplo maya del curso con lang=\"yua\"", win && win.ex.length === 3 && win.ex.every((e) => e.lang === "yua") && same(win.ex.map((e) => e.t), CANDO.u1.can.map((c) => u1.lessons.flatMap((l) => l.vocab).find((v) => v.id === c.ex).m)), win && JSON.stringify(win.ex));
    check("[B] la celebración no menciona pérdida, monedas ni ligas", win && !/pierd|perd|moneda|liga|racha|XP/i.test(win.head.replace(/Perfil/g, "")));
    const hiSt = await raw(page);
    check("[B] se guarda la fecha de desbloqueo en state.x.logros.cando.u1 y el mejor resultado en units.u1", hiSt.x.logros && hiSt.x.logros.cando.u1 === today() && hiSt.x.logros.units.u1.best === Math.max(low.pct, hi.pct), JSON.stringify(hiSt.x.logros));
    check("[B] ya no aparece el aviso de «80 %» una vez abierta", (await page.$$(".cd-note")).length === 0);
    afterUnlock = hiSt.x.logros;
    await backHome(page, cfg);
    const badge = await page.evaluate(() => { const b = document.querySelector("#unit-u1 .unit-head .cd-badge"); return b ? { text: b.querySelector("summary").textContent, count: document.querySelectorAll(".cd-badge").length, h: b.querySelector("summary").getBoundingClientRect().height, w: b.querySelector("summary").getBoundingClientRect().width } : null; });
    check("[B] Inicio: insignia «Puedo» en la cabecera de la unidad 1 y solo en esa", badge && /Puedo/.test(badge.text) && badge.count === 1, badge && badge.count + " insignia(s)");
    check("[B] la insignia se puede tocar (objetivo de 44 px o más)", badge && badge.h >= 43.5 && badge.w >= 43.5, badge && Math.round(badge.w) + "×" + Math.round(badge.h));
    const geo = await page.evaluate(() => { const u = document.querySelector("#unit-u1"), c = u.querySelector(".cd-chip").getBoundingClientRect(), sub = u.querySelector(".unit-sub").getBoundingClientRect(), meta = u.querySelector(".unit-meta").getBoundingClientRect(), head = u.querySelector(".unit-head").getBoundingClientRect(); return { chipTop: c.top, chipBottom: c.bottom, chipLeft: c.left, chipRight: c.right, subBottom: sub.bottom, metaTop: meta.top, headLeft: head.left, headRight: head.right, order: !!(u.querySelector(".unit-sub").compareDocumentPosition(u.querySelector(".cd-badge")) & 4) && !!(u.querySelector(".cd-badge").compareDocumentPosition(u.querySelector(".unit-meta")) & 4) }; });
    check("[B] la insignia queda en la cabecera, entre el subtítulo y la barra de la unidad, sin pisarlos", geo.order && geo.chipTop >= geo.subBottom - 1 && geo.chipBottom <= geo.metaTop + 1 && geo.chipLeft >= geo.headLeft - 1 && geo.chipRight <= geo.headRight + 1, JSON.stringify(geo));
    await tap(page, cfg, "#unit-u1 .cd-badge > summary");
    const open = await page.evaluate(() => { const b = document.querySelector("#unit-u1 .cd-badge"); return b.open && b.querySelectorAll(".cd-list > li").length; });
    check("[B] al tocar la insignia se despliegan los 3 enunciados", open === 3, String(open));
    await noOverflow(page, "Inicio con la insignia abierta", cfg);

    // Un repaso más con la unidad ya abierta: sin tarjeta ni aviso, y nada se pierde aunque salga peor.
    const again = await unitReview(page, cfg, "u1", 4);
    check("[B] repetir el repaso con " + again.pct + " % no quita nada (la insignia es para siempre)", (await page.$$(".cd-win, .cd-note")).length === 0 && same((await raw(page)).x.logros.cando, afterUnlock.cando) && (await raw(page)).x.logros.units.u1.best === afterUnlock.units.u1.best);
    await backHome(page, cfg);

    // Persistencia: recargar.
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => window.__koox && window.__koox.logros);
    check("[B] tras recargar, la insignia y la fecha siguen ahí", (await logros(page)).cando.u1 === today() && (await page.$$("#unit-u1 .cd-badge")).length === 1);
    await tab(page, cfg, "perfil");
    const prof = await page.evaluate(() => {
      const e = document.querySelector("#cando-u1");
      return e && { on: e.classList.contains("on"), items: e.querySelectorAll(".cd-list > li").length, state: (e.querySelector(".cd-state") || {}).textContent, ex: [...e.querySelectorAll(".cd-ex .m")].every((x) => x.getAttribute("lang") === "yua"), exN: e.querySelectorAll(".cd-ex .m").length, off: document.querySelectorAll("#cando .cd-unit.off").length, count: (document.querySelector(".cd-count") || {}).textContent };
    });
    check("[B] Perfil: la unidad 1 aparece desbloqueada con sus 3 enunciados, su fecha y su ejemplo maya", prof && prof.on && prof.items === 3 && prof.exN === 3 && prof.ex && /Desbloqueado el \d{1,2} [a-z]{3} \d{4}/.test(prof.state), prof && JSON.stringify(prof));
    check("[B] Perfil: las otras unidades siguen bloqueadas y el contador dice «1 de N unidades»", prof && prof.off === nUnits - 1 && new RegExp("^1 de " + nUnits + " unidades").test(prof.count), prof && prof.count);
    await noOverflow(page, "Perfil con una unidad abierta", cfg);
    if (SHOTS) {
      await page.evaluate(() => document.querySelector("#cando").scrollIntoView());
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(SHOTS, "logros-perfil-390-claro.png"), fullPage: false });
    }

    // Exportar → borrar → importar conserva los logros.
    await page.evaluate(() => document.querySelector("#btn-export").scrollIntoView());
    await tap(page, cfg, "#btn-export");
    await page.waitForFunction(() => !document.querySelector("#backup-out").hidden);
    exported = await page.evaluate(() => document.querySelector("#backup-out").value);
    const before = (await raw(page)).x.logros;
    await page.evaluate(() => { localStorage.clear(); });
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => window.__koox && window.__koox.logros);
    check("[B] sin avance guardado, la unidad vuelve a estar bloqueada", Object.keys((await logros(page)).cando).length === 0);
    await tab(page, cfg, "perfil");
    await page.fill("#backup-paste", exported);
    await tap(page, cfg, "#btn-import");
    await page.waitForSelector("#backup-confirm:not([hidden]) #btn-import-ok");
    await tap(page, cfg, "#btn-import-ok");
    await page.waitForFunction(() => /se reemplazó/.test(document.querySelector("#backup-msg").textContent));
    const after = (await raw(page)).x.logros;
    check("[B] exportar → borrar → importar recupera los logros exactamente", same(before, after) && after.cando.u1 === today(), JSON.stringify(after));
    check("[B] tras importar, el Perfil muestra la unidad 1 desbloqueada", await page.evaluate(() => !!document.querySelector("#cando-u1.on .cd-list")));
    await tab(page, cfg, "aprender");
    check("[B] tras importar, Inicio muestra la insignia", (await page.$$("#unit-u1 .cd-badge")).length === 1);
    check("[B] sin errores de consola", !page.errors.length, page.errors.join(" | "));
    await ctx.close();
  }

  /* ---- C) Umbrales y reglas finas con el gancho de sesión ---- */
  {
    log("\n▸ umbrales: lecciones completas + repaso ≥ 80 % (gancho __koox.logros.session)");
    const { ctx, page } = await newPage(browser, cfg);
    const u3 = UNITS[2], u3Half = Object.fromEntries(u3.lessons.slice(0, 2).map((l) => [l.id, { best: 100, done: true, times: 1 }]));
    await load(page, url, stateWith({ lessons: u3Half }));
    let r = await page.evaluate(() => window.__koox.logros.session("unit", "u3", 95));
    check("[C] repaso al 95 % con solo " + 2 + " de " + u3.lessons.length + " lecciones: no se abre ni se guarda", !r.length && (await raw(page)).x.logros === undefined, JSON.stringify(r));
    await load(page, url, stateWith({ lessons: allDone(u3) }));
    check("[C] lecciones completas pero sin repaso: no se abre al arrancar", !Object.keys((await logros(page)).cando).length);
    r = await page.evaluate(() => window.__koox.logros.session("unit", "u3", 79));
    let v = await logros(page);
    check("[C] 79 %: no se abre, pero se guarda como mejor resultado", !r.length && !v.cando.u3 && v.units.u3 && v.units.u3.best === 79, JSON.stringify(v));
    r = await page.evaluate(() => window.__koox.logros.session("unit", "u3", 60));
    check("[C] un resultado peor (60 %) no baja el mejor resultado", (await logros(page)).units.u3.best === 79);
    r = await page.evaluate(() => window.__koox.logros.session("lesson", "u3", 100));
    check("[C] una sesión que no es repaso de unidad no abre nada", !r.length && !(await logros(page)).cando.u3);
    r = await page.evaluate(() => window.__koox.logros.session("unit", "u3", 80));
    v = await logros(page);
    check("[C] 80 % justo (con las lecciones completas): se abre y guarda la fecha de hoy", same(r, ["u3"]) && v.cando.u3 === today() && v.units.u3.best === 80, JSON.stringify(v));
    r = await page.evaluate(() => window.__koox.logros.session("unit", "u3", 100));
    v = await logros(page);
    check("[C] un repaso posterior no vuelve a «abrir» ni cambia la fecha; solo sube el mejor resultado", !r.length && v.cando.u3 === today() && v.units.u3.best === 100);
    await load(page, url, stateWith({ lessons: allDone(UNITS[3]), x: { logros: { units: { u4: { best: 85, at: "2026-11-01" } } } } }));
    v = await logros(page);
    check("[C] al arrancar, una unidad que ya cumplía (lecciones + 85 % guardado) se abre sola", v.cando.u4 === today(), JSON.stringify(v));
    check("[C] …y queda guardada en localStorage", await page.evaluate(([k]) => JSON.parse(localStorage.getItem(k)).x.logros.cando.u4, [STORE]) === today());
    await load(page, url, stateWith({ lessons: Object.fromEntries(UNITS[4].lessons.slice(0, 1).map((l) => [l.id, { best: 100, done: true, times: 1 }])), x: { logros: { units: { u5: { best: 99, at: "2026-11-01" } } } } }));
    check("[C] 99 % guardado pero con lecciones sin completar: no se abre", !(await logros(page)).cando.u5);

    // Estado dañado: se sanea sin romper nada.
    const junk = { units: 5, cando: [1, 2], __proto__: { x: 1 } };
    await load(page, url, stateWith({ x: { logros: junk } }));
    check("[C] estado dañado (units numérico, cando como lista): la app arranca y no abre nada", same(await logros(page), { units: {}, cando: {} }) && !page.errors.length, page.errors.join(" | "));
    await load(page, url, stateWith({ x: { logros: { units: { u1: { best: "abc", at: "ayer" }, "__proto__": { best: 100 }, "x y": { best: 100 }, u2: { best: 250, at: "2026-11-02" }, u3: 7 }, cando: { u1: "mañana", u2: "2026-11-03", u9: 3, constructor: "2026-11-04" } } } }));
    v = await logros(page);
    check("[C] valores inválidos se descartan o se acotan (best 0–100, fechas AAAA-MM-DD, ids seguros)",
      same(Object.keys(v.units).sort(), ["u1", "u2"]) && v.units.u1.best === 0 && v.units.u1.at === "" && v.units.u2.best === 100 && same(v.cando, { u2: "2026-11-03" }), JSON.stringify(v));
    await tab(page, cfg, "perfil");
    check("[C] con un estado a medias el Perfil sigue pintando todas las unidades", await page.evaluate(() => document.querySelectorAll("#cando .cd-unit").length) === nUnits && !page.errors.length, page.errors.join(" | "));
    await ctx.close();
  }

  /* ---- D) Modo tranquilo: la celebración se oculta, la lista del Perfil no ---- */
  {
    log("\n▸ modo tranquilo");
    const { ctx, page } = await newPage(browser, cfg);
    const base = JSON.parse(S0);
    base.settings.calm = true;
    await load(page, url, base);
    check("[D] el modo tranquilo está activo (clase calm en body)", await page.evaluate(() => document.body.classList.contains("calm")));
    const low = await unitReview(page, cfg, "u1", 4);
    check("[D] con " + low.pct + " %: el aviso del 80 % existe pero el modo tranquilo lo oculta", (await page.$$(".cd-note")).length === 1 && !(await visible(page, ".cd-note")));
    await backHome(page, cfg);
    const hi = await unitReview(page, cfg, "u1", 1);
    check("[D] con " + hi.pct + " %: la tarjeta de celebración existe en el DOM y el modo tranquilo la oculta", (await page.$$(".cd-win")).length === 1 && !(await visible(page, ".cd-win")));
    check("[D] …pero el logro sí se guarda", (await logros(page)).cando.u1 === today());
    await backHome(page, cfg);
    check("[D] Inicio: la insignia «Puedo» sigue visible (no es XP, racha ni meta)", await visible(page, "#unit-u1 .cd-badge"));
    await tab(page, cfg, "perfil");
    const lst = await page.evaluate(() => ({ sec: !!document.querySelector("#cando"), on: document.querySelectorAll("#cando .cd-unit.on").length }));
    check("[D] Perfil: «Lo que ya puedes decir» y la unidad abierta siguen visibles en modo tranquilo", lst.sec && lst.on === 1 && (await visible(page, "#cando")) && (await visible(page, "#cando-u1 .cd-list")) && (await visible(page, "#voces")));
    await noOverflow(page, "Perfil en modo tranquilo", cfg);
    await ctx.close();
  }

  /* ---- E) Voces con audio de prueba ---- */
  {
    log("\n▸ Voces con COURSE_AUDIO de prueba");
    const total = UNITS.reduce((n, u) => n + u.lessons.reduce((m, l) => m + (l.vocab || []).length, 0), 0);
    const ja = u1.lessons[2].vocab.find((v) => v.id === "u1-ja"), kiin = u1.lessons[2].vocab.find((v) => v.id === "u1-kiin"), jaab = u1.lessons[2].vocab.find((v) => v.id === "u1-jaab");
    const nat = entry({ key: "nat-ja", kind: "nativo", text: ja.m, vocab: ["u1-ja"], speaker: "Hablante de prueba", region: "Región de prueba", author: "Hablante de prueba" });
    const syn = [entry({ key: "sint-kiin", kind: "sintetico", text: kiin.m, vocab: ["u1-kiin"] }), entry({ key: "sint-jaab", kind: "sintetico", text: jaab.m, vocab: ["u1-jaab"] }), entry({ key: "sint-ja", kind: "sintetico", text: ja.m, vocab: ["u1-ja"] })];
    const { ctx, page } = await newPage(browser, cfg);
    await load(page, previewOf("audio1", audioDe([nat].concat(syn))), null);
    await tab(page, cfg, "perfil");
    let v = await page.evaluate(() => { const s = document.querySelector("#voces"), bar = s.querySelector('[role="progressbar"]'); return { text: s.textContent, now: bar.getAttribute("aria-valuenow"), max: bar.getAttribute("aria-valuemax"), items: [...s.querySelectorAll(".vz-list > li")].map((x) => x.textContent), w: parseFloat(bar.firstElementChild.style.width), stats: window.__koox.voces() }; });
    check("[E] una voz nativa de prueba: «1 de " + total + " palabras con voz nativa»", v.stats.native === 1 && v.stats.total === total && new RegExp("1 de " + total + " palabra").test(v.text) && v.now === "1" && v.max === String(total), v.text.slice(0, 140));
    check("[E] la barra avanza en proporción (mínimo visible)", v.w >= 1 && v.w <= 5, v.w + " %");
    check("[E] la palabra con voz nativa y sintética cuenta solo como nativa; las otras 2 como sintéticas (aproximada)", v.stats.synthetic === 2 && /2 palabras más tienen voz sintética/.test(v.text) && /aproximada/.test(v.text), "sintéticas: " + v.stats.synthetic);
    check("[E] lista de voces acreditadas: hablante, región y número de grabaciones", v.items.length === 1 && /Hablante de prueba/.test(v.items[0]) && /Región de prueba/.test(v.items[0]) && /1 grabación/.test(v.items[0]), v.items.join(" | "));
    check("[E] con voz nativa ya no sale el mensaje de «Todavía no hay voz nativa»", !/Todavía no hay voz nativa/.test(v.text));
    check("[E] sin KOOX_STANDALONE no hay enlace a grabar.html (solo texto)", (await page.$$('#voces a[href="grabar.html"]')).length === 0 && /¿Hablas maya\? Ayuda a grabar/.test(v.text));
    await page.evaluate(() => { window.KOOX_STANDALONE = true; window.KOOX_GRABAR = true; });
    await tab(page, cfg, "aprender");
    await tab(page, cfg, "perfil");
    const lk = await page.evaluate(() => { const a = document.querySelector('#voces a[href="grabar.html"]'); return a && { text: a.textContent, h: a.getBoundingClientRect().height, href: a.getAttribute("href") }; });
    check("[E] en el sitio web (KOOX_STANDALONE) hay un enlace «¿Hablas maya? Ayuda a grabar» a grabar.html de 44 px o más", lk && lk.text === "¿Hablas maya? Ayuda a grabar" && lk.href === "grabar.html" && lk.h >= 43.5, lk && lk.text + " " + Math.round(lk.h) + " px");
    // Contraste y fondos: el mismo Perfil, claro y oscuro.
    for (const scheme of ["light", "dark"]) {
      await page.emulateMedia({ colorScheme: scheme });
      await page.waitForTimeout(450); // los botones animan el color de fondo al cambiar de tema
      const c = await page.evaluate(contrastIn, ["#voces h2", "#voces .vz-n", "#voces .vz-synth", "#voces .vz-who", "#voces .vz-meta", "#voces .btn", "#cando .cd-hd h3", "#cando .cd-meta", "#cando > p.muted"]);
      const low2 = c.filter((x) => x.ratio === null || x.ratio < 4.5);
      check("[E] contraste del texto de Voces y de la lista de logros ≥ 4,5:1 (" + (scheme === "light" ? "claro" : "oscuro") + ")", !low2.length, c.map((x) => x.sel.replace(/^#(voces|cando) /, "") + " " + x.ratio).join(", "));
    }
    await page.emulateMedia({ colorScheme: "light" });
    await noOverflow(page, "Perfil con voces (390 px)", cfg);
    check("[E] sin errores de consola", !page.errors.length, page.errors.join(" | "));
    await ctx.close();

    // Hablante anónimo y dos hablantes.
    const { ctx: ctx2, page: page2 } = await newPage(browser, cfg);
    const anon = entry({ key: "nat-kiin", kind: "nativo", text: kiin.m, vocab: ["u1-kiin"], speaker: "", author: "Hablante anónimo", region: "" });
    const nat2 = entry({ key: "nat-jaab", kind: "nativo", text: jaab.m, vocab: ["u1-jaab"], speaker: "Hablante de prueba", region: "Región de prueba", author: "Hablante de prueba" });
    await load(page2, previewOf("audio2", audioDe([nat, anon, nat2])), null);
    await tab(page2, cfg, "perfil");
    v = await page2.evaluate(() => ({ stats: window.__koox.voces(), items: [...document.querySelectorAll("#voces .vz-list > li")].map((x) => x.textContent) }));
    check("[E] dos hablantes y uno anónimo: 3 palabras nativas, 2 filas (el mismo hablante y región se agrupan: «2 grabaciones»)", v.stats.native === 3 && v.items.length === 2 && v.items.some((t) => /Hablante de prueba.*2 grabaciones/.test(t)) && v.items.some((t) => /Hablante anónimo.*1 grabación/.test(t)), v.items.join(" | "));
    await ctx2.close();

    // Sin COURSE_AUDIO.
    const { ctx: ctx3, page: page3 } = await newPage(browser, cfg);
    await load(page3, previewOf("sinaudio", rename("COURSE_AUDIO")), null);
    await tab(page3, cfg, "perfil");
    v = await page3.evaluate(() => { const s = document.querySelector("#voces"); return { text: s && s.textContent, stats: window.__koox.voces() }; });
    check("[E] sin COURSE_AUDIO: Voces dice 0 de " + total + ", sin sintéticas, con el mensaje amable, y nada falla", v.stats.native === 0 && v.stats.synthetic === 0 && v.stats.total === total && /Todavía no hay voz nativa en el curso\. Cada grabación cuenta\./.test(v.text) && !/voz sintética/.test(v.text) && !page3.errors.length, page3.errors.join(" | ") + v.text.slice(0, 100));
    await ctx3.close();
  }

  /* ---- F) Sin COURSE_CANDO o con contenido roto ---- */
  {
    log("\n▸ sin COURSE_CANDO y con COURSE_CANDO roto");
    const { ctx, page } = await newPage(browser, cfg);
    await page.addInitScript(() => { try { localStorage.setItem("koox-maaya-v2", JSON.stringify({ v: 2, xp: 0, xpByDay: {}, streak: { count: 0, best: 0, last: null, graceWeek: null }, daysTotal: 0, goal: 20, lessons: {}, srs: {}, x: { logros: { cando: { u1: "2026-11-01" } } }, settings: { sound: false, autoplay: false, rate: "normal", synth: true, calm: false } })); } catch (e) { /* sin efecto */ } });
    await load(page, previewOf("sincando", rename("COURSE_CANDO")));
    check("[F] sin COURSE_CANDO: Inicio sin insignias aunque el avance traiga un logro guardado", (await page.$$(".cd-badge")).length === 0);
    await tab(page, cfg, "perfil");
    check("[F] sin COURSE_CANDO: Perfil sin «Lo que ya puedes decir», pero con Voces; sin errores", (await page.$$("#cando")).length === 0 && (await page.$$("#voces")).length === 1 && !page.errors.length, page.errors.join(" | "));
    await ctx.close();

    const roto = "window.COURSE_CANDO = { u1: { can: [ { t: 5 }, null, { t: 'Puedo algo sencillo.', ex: 'no-existe' }, { t: 'Puedo otra cosa.', ex: 'constructor' }, { t: '<b>Puedo</b> &amp; x', ex: 'u1-ja' } ] }, u2: 7, u3: { can: 'nada' }, u9: { can: [ { t: '' } ] }, zz: { can: [ { t: 'Puedo fantasma.' } ] } };";
    const { ctx: ctx2, page: page2 } = await newPage(browser, cfg);
    // La unidad 1 va abierta para que sus enunciados (con HTML dentro) se pinten en Inicio y en Perfil.
    await load(page2, previewOf("cando-roto", (h) => h.replace("window.COURSE_CANDO =", roto + "\nwindow.COURSE_CANDO_REAL =")), stateWith({ x: { logros: { cando: { u1: today() } } } }));
    const d = await page2.evaluate(() => window.__koox.logros.defs());
    check("[F] COURSE_CANDO roto: solo quedan los enunciados válidos; un ex inexistente se ignora (sin maya inventado)", same(Object.keys(d), ["u1"]) && d.u1.length === 3 && d.u1[0].ex === null && d.u1[1].ex === null && d.u1[2].ex === "u1-ja", JSON.stringify(d));
    await tab(page2, cfg, "perfil");
    const esc = await page2.evaluate(() => ({ units: document.querySelectorAll("#cando .cd-unit").length, html: document.querySelector("#cando").innerHTML, texts: [...document.querySelectorAll("#cando-u1 .cd-t")].map((x) => x.textContent) }));
    check("[F] el texto de los enunciados nunca se interpreta como HTML (se pinta tal cual, escapado) y solo hay una unidad en la lista",
      esc.units === 1 && esc.texts.length === 3 && esc.texts[2] === "<b>Puedo</b> &amp; x" && /&lt;b&gt;Puedo&lt;\/b&gt;/.test(esc.html) && !/<b>Puedo<\/b>/.test(esc.html), esc.units + " unidad(es) · " + esc.texts.join(" | "));
    await tab(page2, cfg, "aprender");
    const bd = await page2.evaluate(() => { const b = document.querySelector("#unit-u1 .cd-badge"); return b && { html: b.innerHTML, n: b.querySelectorAll(".cd-list > li").length }; });
    check("[F] la insignia de Inicio también escapa los enunciados", bd && bd.n === 3 && /&lt;b&gt;Puedo&lt;\/b&gt;/.test(bd.html) && !/<b>Puedo<\/b>/.test(bd.html), bd && bd.n + " enunciados");
    check("[F] sin errores de consola", !page2.errors.length, page2.errors.join(" | "));
    await ctx2.close();
  }

  /* ---- G) Diseño: 360 y 390 px, claro y oscuro ---- */
  {
    log("\n▸ diseño: celebración, insignia y Perfil a 360 y 390 px, claro y oscuro");
    const total = UNITS.reduce((n, u) => n + u.lessons.reduce((m, l) => m + (l.vocab || []).length, 0), 0);
    const ja = u1.lessons[2].vocab.find((v) => v.id === "u1-ja");
    const aud = audioDe([entry({ key: "nat-ja", kind: "nativo", text: ja.m, vocab: ["u1-ja"], speaker: "Hablante de prueba con un nombre largo largo largo", region: "Una comunidad con un nombre bastante largo", author: "Hablante de prueba" })]);
    const full = JSON.parse(S0);
    full.lessons = Object.assign({}, ...UNITS.map(allDone));
    full.x = { logros: { units: { u2: { best: 84, at: today() }, u3: { best: 70, at: today() } }, cando: { u2: today() } } };
    for (const [w, scheme] of [[360, "light"], [390, "dark"], [360, "dark"]]) {
      const c2 = { name: w + "-" + (scheme === "light" ? "claro" : "oscuro"), viewport: { width: w, height: 800 }, mobile: true, scheme };
      const { ctx, page } = await newPage(browser, c2);
      await load(page, previewOf("audio-diseno", aud), full);
      await page.evaluate(() => { window.KOOX_STANDALONE = true; window.KOOX_GRABAR = true; });
      // Un repaso real de la unidad 1 (sin errores) abre su insignia y pinta la celebración en los resultados.
      await tap(page, c2, '[data-unit-review="u1"]');
      await page.waitForFunction(() => ["exercise", "teach", "vocab", "dialogue"].includes(window.__koox.screen()));
      const run = await page.evaluate(runSession, 0);
      check("[" + c2.name + "] repaso de la unidad 1 al 100 % llega a los resultados", run.ok, run.error);
      const winEl = await page.evaluate(() => { const w = document.querySelector(".cd-win"); return w ? { n: document.querySelectorAll(".cd-win").length, id: w.getAttribute("aria-labelledby"), items: w.querySelectorAll(".cd-list > li").length } : null; });
      check("[" + c2.name + "] resultados: una sola tarjeta de celebración, con los 3 enunciados", !!winEl && winEl.n === 1 && winEl.items === 3, winEl && JSON.stringify(winEl));
      await noOverflow(page, "resultados con la celebración", c2);
      const ct3 = await page.evaluate(contrastIn, [".cd-win .eyebrow", ".cd-win h2", ".cd-win .cd-t", ".cd-win .cd-ex", ".cd-win .cd-ex .m", ".cd-win > p.muted"]);
      check("[" + c2.name + "] contraste de la celebración ≥ 4,5:1", ct3.every((x) => x.ratio !== null && x.ratio >= 4.5), ct3.map((x) => x.ratio).join(", "));
      if (SHOTS && w === 390) {
        await page.evaluate(() => document.querySelector(".cd-win").scrollIntoView({ block: "center" }));
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(SHOTS, "logros-resultados-390-oscuro.png"), fullPage: false });
      }
      await backHome(page, c2);
      check("[" + c2.name + "] Inicio: insignias solo en las 2 unidades abiertas (la 1 y la 2)", same(await page.$$eval(".cd-badge", (b) => b.map((x) => x.closest(".unit").id)), ["unit-u1", "unit-u2"]));
      await page.evaluate(() => document.querySelectorAll(".cd-badge").forEach((b) => { b.open = true; }));
      await noOverflow(page, "Inicio con insignias abiertas", c2);
      const ct = await page.evaluate(contrastIn, ["#unit-u1 .cd-chip", "#unit-u1 .cd-t", "#unit-u1 .cd-ex", "#unit-u1 .cd-ex .m"]);
      check("[" + c2.name + "] contraste de la insignia y sus enunciados ≥ 4,5:1", ct.every((x) => x.ratio !== null && x.ratio >= 4.5), ct.map((x) => x.ratio).join(", "));
      await tab(page, c2, "perfil");
      await page.waitForTimeout(450);
      await noOverflow(page, "Perfil con logros y voces", c2);
      const ct2 = await page.evaluate(contrastIn, ["#cando-u1 .cd-state", "#cando-u1 .cd-t", "#cando-u1 .cd-ex", "#cando-u1 .cd-ex .m", "#cando-u3 p:not(.eyebrow):not(.cd-meta)", "#cando-u3 .cd-meta", "#cando-u3 .eyebrow", "#voces .vz-n", "#voces .vz-meta", "#voces .btn"]);
      check("[" + c2.name + "] contraste del Perfil (logros y voces) ≥ 4,5:1", ct2.every((x) => x.ratio !== null && x.ratio >= 4.5), ct2.map((x) => x.ratio).join(", "));
      const tgt = await page.evaluate(() => [...document.querySelectorAll("#voces a, #voces button, #cando a, #cando button, #cando summary, #voces summary")].map((e) => { const r = e.getBoundingClientRect(); return Math.round(Math.min(r.width, r.height)); }));
      check("[" + c2.name + "] objetivos táctiles propios de 44 px o más", tgt.length >= 1 && tgt.every((x) => x >= 44), tgt.join(","));
      const langs = await page.evaluate(() => [...document.querySelectorAll("#cando .m, #voces .m, .cd-badge .m")].filter((e) => e.getAttribute("lang") !== "yua").length);
      check("[" + c2.name + "] todo el maya de los módulos va con lang=\"yua\"", langs === 0, langs + " sin lang");
      const sec = await page.evaluate(() => [...document.querySelectorAll("#cando, #voces")].every((s) => s.getAttribute("aria-labelledby") && document.getElementById(s.getAttribute("aria-labelledby"))));
      check("[" + c2.name + "] las secciones nuevas tienen título enlazado (aria-labelledby)", sec);
      check("[" + c2.name + "] sin errores de consola", !page.errors.length, page.errors.join(" | "));
      await ctx.close();
    }
  }

  await browser.close();
}

contenido();
main().then(() => {
  const fails = results.filter((r) => !r.pass);
  log("\n" + (results.length - fails.length) + " de " + results.length + " comprobaciones correctas en " + ((Date.now() - T0) / 1000).toFixed(1) + " s");
  if (fails.length) { log("FALLAN " + fails.length + ":"); fails.forEach((f) => log("  ✗ " + f.name + (f.detail ? " — " + f.detail : ""))); process.exit(1); }
}).catch((e) => { console.error("ERROR en la prueba:", e && e.stack || e); process.exit(1); });
