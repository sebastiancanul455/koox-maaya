#!/usr/bin/env node
// Pruebas del módulo «Ya sé algo de maya» (prueba de ubicación) (Chromium headless con Playwright).
//   node test/ubicacion.cjs <ruta.html>        el html del Artifact (se envuelve como lo hace la plataforma)
// Antes revisa, sin navegador, que ubicacion.js y ubicacion.css no lleven colores sueltos, emojis ni imágenes externas.
// Capturas (como máximo dos, a 360 px) solo si KOOX_SHOTS apunta a una carpeta. Sale con código 1 si algo falla.
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const target = process.argv[2];
if (!target) { console.error("Uso: node test/ubicacion.cjs <ruta.html>"); process.exit(2); }
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

/* ============ 1) Fuentes del módulo (sin navegador) ============ */
const CONTENT = path.join(ROOT, "src/content");
function loadWindow(files) {
  const win = {};
  const ctx = vm.createContext({ window: win });
  for (const f of files) vm.runInContext(fs.readFileSync(f, "utf8"), ctx, { filename: f });
  return win;
}
const unitFiles = fs.readdirSync(CONTENT).filter((f) => /^u\d+\.js$/.test(f)).sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10)).map((f) => path.join(CONTENT, f));
const UNITS = loadWindow(unitFiles).COURSE.units;
const EMOJI = /\p{Extended_Pictographic}/u;
function fuentes() {
  log("\n▸ fuentes del módulo");
  const read = (f) => fs.readFileSync(path.join(ROOT, "src/modules", f), "utf8");
  const css = read("ubicacion.css").replace(/\/\*[\s\S]*?\*\//g, ""), js = read("ubicacion.js");
  const lit = css.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(|\bcolor\(|\b(white|black)\b/g);
  check("[fuentes] ubicacion.css usa solo tokens del tema (var(--…)), sin colores sueltos", !lit, lit ? lit.join(" ") : (css.match(/var\(--/g) || []).length + " usos de tokens");
  const litJs = js.match(/(fill|stroke|color|background)\s*[=:]\s*["']?\s*(#|rgb|hsl)|\brgba?\(|\bhsla?\(/g);
  check("[fuentes] ubicacion.js no escribe colores (los pone el CSS por clase)", !litJs, litJs && litJs.join(" "));
  check("[fuentes] sin imágenes externas ni librerías (ni <img>, ni url(), ni src=)", !/<img|url\(|\bsrc=|https?:\/\//.test(js + css));
  check("[fuentes] sin emojis ni </script", !EMOJI.test(js + css) && !/<\/script|<!--/i.test(js + css));
  check("[fuentes] sin alert/confirm/prompt del navegador", !/\b(alert|confirm|prompt)\s*\(/.test(js), (js.match(/\b(alert|confirm|prompt)\s*\(/g) || []).join(" "));
  check("[fuentes] el texto maya del módulo va con lang=\"yua\" y clase .m", (js.match(/lang="yua"/g) || []).length >= 2 && /class="[^"]*\bm\b[^"]*" lang="yua"/.test(js));
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
// Página de vista previa con el esqueleto que agrega la plataforma.
function preview() {
  const file = path.join(path.dirname(SRC), path.basename(SRC).replace(/\.html?$/i, "") + ".ubicacion.preview.html");
  fs.writeFileSync(file, "<!doctype html><html lang=es><head><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1,viewport-fit=cover'></head><body>" + html + "</body></html>");
  return "file://" + file;
}

async function newPage(browser, cfg) {
  const ctx = await browser.newContext({ viewport: cfg.viewport, isMobile: !!cfg.mobile, hasTouch: !!cfg.mobile, colorScheme: cfg.scheme || "light", reducedMotion: cfg.motion || "no-preference", deviceScaleFactor: 1 });
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
async function load(page, url, seed) {
  await page.goto(url, { waitUntil: "load" });
  await page.waitForFunction(() => window.__koox && typeof window.__koox.screen === "function" && window.__koox.ubicacion, null, { timeout: 8000 });
  await page.evaluate(([k, s]) => { if (s === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(s)); }, [STORE, seed]);
  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(() => window.__koox && window.__koox.ubicacion, null, { timeout: 8000 });
  await page.evaluate(() => document.fonts && document.fonts.ready);
}
const tap = (page, cfg, sel) => (cfg.mobile ? page.tap(sel) : page.click(sel));
async function tab(page, cfg, t) {
  await tap(page, cfg, "#tab-" + t);
  await page.waitForFunction((v) => window.__koox.screen() === v, { aprender: "home", perfil: "profile" }[t]);
}
const visible = (page, sel) => page.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return cs.display !== "none" && cs.visibility !== "hidden" && r.width > 0 && r.height > 0; }, sel);
const dayKey = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const addDays = (n) => { const d = new Date(); d.setHours(12); d.setDate(d.getDate() + n); return dayKey(d); };
async function noOverflow(page, where, cfg) {
  const o = await page.evaluate(() => {
    const d = document.documentElement, b = document.body, vw = d.clientWidth, bad = [];
    for (const el of document.querySelectorAll("body *")) {
      if (el.closest(".table-wrap, .chips, svg, .sr-only, [hidden]")) continue;
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      if (r.right > vw + 1 || r.left < -1) { bad.push(el.tagName.toLowerCase() + (typeof el.className === "string" && el.className ? "." + el.className.trim().split(/\s+/).join(".") : "") + " [" + Math.round(r.left) + "→" + Math.round(r.right) + "]"); if (bad.length >= 4) break; }
    }
    const ml = document.querySelector("#ub-root:not([hidden])");
    return { sw: Math.max(d.scrollWidth, b.scrollWidth, ml ? ml.scrollWidth : 0), cw: vw, bad };
  });
  return check("[" + cfg.name + "] sin scroll horizontal en " + where, o.sw <= o.cw + 1 && !o.bad.length, "scrollWidth " + o.sw + " / ancho " + o.cw + (o.bad.length ? " · se salen: " + o.bad.join(", ") : ""));
}
const sizes = (page, sel) => page.evaluate((s) => [...document.querySelectorAll(s)].filter((e) => e.offsetParent !== null).map((e) => { const r = e.getBoundingClientRect(); return Math.round(Math.min(r.width, r.height)); }), sel);

// Estado sembrado: N palabras reales del curso con niveles 0–5 y repasos vencidos, de hoy y futuros.
const VOCAB = UNITS.flatMap((u) => u.lessons.flatMap((l) => (l.vocab || []).filter((v) => v.id)));
function seedState(n, extra) {
  const srs = {}, dues = [-6, -1, 0, 1, 4, 12, 0];
  VOCAB.slice(0, n).forEach((v, i) => { srs[v.id] = { box: i % 6, due: addDays(dues[i % dues.length]), right: 1, wrong: 0 }; });
  return Object.assign({ v: 2, xp: 0, xpByDay: {}, streak: { count: 0, best: 0, last: null, graceWeek: null }, daysTotal: 0, goal: 20, lessons: {}, srs, x: {},
    settings: { sound: false, autoplay: false, rate: "normal", synth: true, calm: false } }, extra || {});
}
const EMPTY = seedState(0);

// Conf de cada palabra (del contenido crudo) y lecciones por unidad.
const CONF = Object.fromEntries(VOCAB.map((v) => [v.id, v.conf === "alta" ? "alta" : "media"]));
const UNIT_OF = Object.fromEntries(UNITS.flatMap((u) => u.lessons.flatMap((l) => (l.vocab || []).filter((v) => v.id).map((v) => [v.id, u.n]))));
const LESSONS_OF = (n) => UNITS.find((u) => u.n === n).lessons.map((l) => l.id);
const VOCAB_OF = (n) => UNITS.find((u) => u.n === n).lessons.flatMap((l) => (l.vocab || []).filter((v) => v.id).map((v) => v.id));

// Responde la pregunta actual: bien, mal o «No la conozco». Comprueba de paso que solo use vocabulario alta.
const seenQs = [];
async function reply(page, cfg, how) {
  const q = await page.evaluate(() => window.__koox.ubicacion.current());
  if (!q) throw new Error("no hay pregunta abierta");
  seenQs.push(q);
  const sel = how === "skip" ? "#ub-skip" : "#ub-opt-" + (how === "ok" ? q.answer : (q.answer + 1) % q.opts.length);
  await tap(page, cfg, sel);
  return q;
}
async function answerUnit(page, cfg, pattern) { for (const h of pattern) await reply(page, cfg, h); }

async function main() {
  prepareFonts();
  const browser = await chromium.launch();
  const url = preview();

  /* ---- A) Tarjeta de Inicio: aparece para usuarios nuevos y se puede descartar ---- */
  {
    const cfg = { name: "360-claro", viewport: { width: 360, height: 780 }, mobile: true, scheme: "light" };
    log("\n▸ tarjeta de Inicio (" + cfg.name + ")");
    const { ctx, page } = await newPage(browser, cfg);
    await load(page, url, EMPTY);
    const card = await page.evaluate(() => { const c = document.querySelector("#ub-card"); return c ? { text: c.textContent, gami: c.classList.contains("gami") } : null; });
    check("[A] usuario nuevo: tarjeta «¿Ya sabes algo de maya?» en Inicio (no es gamificación: sin .gami)", card && /¿Ya sabes algo de maya\?/.test(card.text) && /prueba de ubicación/.test(card.text) && !card.gami, card && card.text);
    const sz = await sizes(page, "#ub-card button");
    check("[A] botones de la tarjeta ≥ 44 px", sz.length === 2 && sz.every((x) => x >= 44), sz.join(","));
    await noOverflow(page, "Inicio con la tarjeta", cfg);
    await tap(page, cfg, "#btn-home-ubicacion-no");
    await page.waitForFunction(() => !document.querySelector("#ub-card"));
    const st = await page.evaluate(() => window.__koox.state());
    check("[A] «Ahora no» descarta la tarjeta y lo guarda en state.x.ubicacion.hide", st.x.ubicacion && st.x.ubicacion.hide === true);
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => window.__koox && window.__koox.ubicacion);
    check("[A] tras recargar la tarjeta sigue descartada", !(await page.$("#ub-card")) && !(await page.evaluate(() => window.__koox.ubicacion.eligible())));
    await tab(page, cfg, "perfil");
    check("[A] Perfil conserva la entrada «Prueba de ubicación» (sin deshacer: no hay ubicación)", (await visible(page, "#btn-profile-ubicacion")) && !(await page.$("#btn-profile-ubicacion-undo")));
    // Con avance (FEW lecciones o más) la tarjeta no aparece.
    const lessons = {}; LESSONS_OF(1).concat(LESSONS_OF(2)).slice(0, 4).forEach((id) => { lessons[id] = { best: 90, done: true, times: 1 }; });
    await load(page, url, seedState(0, { lessons }));
    check("[A] con 4 lecciones completadas la tarjeta ya no aparece", !(await page.$("#ub-card")));
    check("[A] sin errores de consola", !page.errors.length, page.errors.join(" | "));
    await ctx.close();
  }

  /* ---- B) Prueba que se detiene en la unidad 3; aplicar y deshacer sin pisar avance previo ---- */
  {
    const cfg = { name: "360-claro", viewport: { width: 360, height: 780 }, mobile: true, scheme: "light" };
    log("\n▸ prueba, aplicar y deshacer (" + cfg.name + ")");
    const { ctx, page } = await newPage(browser, cfg);
    const l1 = LESSONS_OF(1)[0], w0 = VOCAB_OF(1)[0], day = addDays(-3);
    const seed = seedState(0, {
      xp: 37, xpByDay: { [day]: 37 }, daysTotal: 1, streak: { count: 1, best: 1, last: day, graceWeek: null },
      lessons: { [l1]: { best: 90, done: true, times: 2 }, [LESSONS_OF(2)[1]]: { best: 40, done: false, times: 1 } },
      srs: { [w0]: { box: 3, due: addDays(5), right: 4, wrong: 1, reps: 5, lapses: 0, s: 9, d: 5, last: day } },
      x: { fsrs: { log: [[20000, w0, 3]] } }
    });
    await load(page, url, seed);
    const before = await page.evaluate(() => window.__koox.state());
    check("[B] con 1 lección completada la tarjeta aparece", !!(await page.$("#ub-card")));
    await tap(page, cfg, "#btn-home-ubicacion");
    await page.waitForFunction(() => window.__koox.ubicacion.view().open);
    const intro = await page.evaluate(() => document.querySelector("#ub-root").textContent);
    check("[B] la introducción es amable: no es un examen, sirve para ahorrar tiempo", /No es un examen/.test(intro) && /ahorrarte tiempo/.test(intro) && !/examen final|reprob|calificaci/i.test(intro.replace("No es un examen", "")));
    check("[B] la vista abierta es la pantalla «ubicacion»", (await page.evaluate(() => window.__koox.screen())) === "ubicacion");
    await tap(page, cfg, "#ub-start");
    await page.waitForFunction(() => window.__koox.ubicacion.current());
    const q0 = await page.evaluate(() => { const w = document.querySelector("#ub-word"), m = document.querySelector("#ub-root .ub-q [lang=yua]"); return { m: !!m && m.classList.contains("m"), word: w && w.textContent }; });
    check("[B] la pregunta marca el maya con lang=yua y clase .m", q0.m, q0.word);
    const tg = await sizes(page, "#ub-root button");
    check("[B] objetivos táctiles de la pregunta ≥ 44 px", tg.length >= 7 && tg.every((x) => x >= 44), Math.min(...tg) + " px mínimo");
    await noOverflow(page, "una pregunta", cfg);
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, "ubicacion-pregunta-360-claro.png") });
    // Unidad 1: 4/4; unidad 2: 3/4 y desempate bien (4/5); unidad 3: 3/4 y desempate mal (3/5) → se detiene.
    await answerUnit(page, cfg, ["ok", "ok", "ok", "ok"]);
    await answerUnit(page, cfg, ["ok", "bad", "ok", "ok", "ok"]);
    await answerUnit(page, cfg, ["ok", "skip", "ok", "ok"]);
    const tie = await page.evaluate(() => window.__koox.ubicacion.current());
    check("[B] con 3 de 4 hay una 5.ª pregunta de desempate de la misma unidad", tie && tie.unit === 3, tie && tie.unit);
    await reply(page, cfg, "bad");
    await page.waitForFunction(() => window.__koox.ubicacion.view().phase === "result");
    const t = await page.evaluate(() => window.__koox.ubicacion.test());
    check("[B] se detiene en la primera unidad bajo 80 % (unidad 3, 3/5 = 60 %)", t.start === 3 && t.passed.map((p) => p.unit).join() === "1,2" && t.total === 14 && !t.cut, JSON.stringify(t));
    check("[B] porcentajes: unidad 1 100 %, unidad 2 80 % (4/5)", t.passed[0].pct === 100 && t.passed[1].pct === 80, JSON.stringify(t.passed));
    const badConf = seenQs.filter((q) => CONF[q.id] !== "alta" || q.opts.some((o) => CONF[o] !== "alta"));
    check("[B] solo vocabulario conf «alta» (" + seenQs.length + " preguntas, " + seenQs.length * 4 + " opciones)", seenQs.length === 14 && !badConf.length && seenQs.every((q) => q.opts.length === 4), badConf.map((q) => q.id).join(" "));
    check("[B] cada pregunta es de la unidad que se evalúa y en orden", seenQs.every((q) => UNIT_OF[q.id] === q.unit) && seenQs.map((q) => q.unit).join("") === "11112222233333", seenQs.map((q) => q.unit).join(""));
    check("[B] hay preguntas maya→español y español→maya; sin audio nativo, ninguna de escucha", seenQs.some((q) => q.dir === "m2es") && seenQs.some((q) => q.dir === "es2m") && seenQs.every((q) => !q.listen));
    const res = await page.evaluate(() => ({ h: document.querySelector("#ub-h").textContent, text: document.querySelector("#ub-root").textContent }));
    check("[B] resultado: «Puedes empezar en la unidad 3»", res.h === "Puedes empezar en la unidad 3", res.h);
    await noOverflow(page, "el resultado", cfg);
    await tap(page, cfg, "#ub-ask");
    await page.waitForSelector("#ub-confirm");
    const mid = await page.evaluate(() => window.__koox.state());
    check("[B] la confirmación va dentro de la página y aún no cambia nada", same(mid.lessons, before.lessons) && same(mid.srs, before.srs) && /No suma XP ni cambia tu racha/.test(await page.evaluate(() => document.querySelector("#ub-confirm").textContent)));
    await tap(page, cfg, "#ub-apply");
    await page.waitForSelector("#ub-done");
    const after = await page.evaluate(() => window.__koox.state()), tday = addDays(0);
    const placed = LESSONS_OF(1).concat(LESSONS_OF(2));
    check("[B] marca como completadas las lecciones de las unidades 1 y 2 (" + placed.length + ")", placed.every((id) => after.lessons[id] && after.lessons[id].done) && !LESSONS_OF(3).some((id) => after.lessons[id]), placed.filter((id) => !(after.lessons[id] && after.lessons[id].done)).join(" "));
    check("[B] no pisa la lección ya completada (best 90, times 2)", same(after.lessons[l1], { best: 90, done: true, times: 2 }), JSON.stringify(after.lessons[l1]));
    check("[B] lecciones nuevas: {best: % de la unidad, done: true, times: 0}", same(after.lessons[LESSONS_OF(1)[1]], { best: 100, done: true, times: 0 }) && same(after.lessons[LESSONS_OF(2)[0]], { best: 80, done: true, times: 0 }));
    check("[B] una lección empezada sin terminar queda completada y conserva sus veces", same(after.lessons[LESSONS_OF(2)[1]], { best: 80, done: true, times: 1 }), JSON.stringify(after.lessons[LESSONS_OF(2)[1]]));
    const ws = VOCAB_OF(1).concat(VOCAB_OF(2)), fresh = ws.filter((id) => id !== w0);
    check("[B] siembra el repaso con el vocabulario de las unidades aprobadas (" + fresh.length + " palabras nuevas, repartidas en 7 días desde hoy, unas 15 por día)", ws.every((id) => after.srs[id]) && fresh.every((id) => after.srs[id].due >= tday && after.srs[id].reps === 1) && fresh.some((id) => after.srs[id].due === tday) && Object.values(fresh.reduce((m, id) => { m[after.srs[id].due] = (m[after.srs[id].due] || 0) + 1; return m; }, {})).every((n) => n <= 15) && !VOCAB_OF(3).some((id) => after.srs[id]));
    check("[B] no pisa la palabra que ya estaba en repaso", same(after.srs[w0], before.srs[w0]));
    check("[B] el historial FSRS registra un alta por palabra nueva", after.x.fsrs.log.length === before.x.fsrs.log.length + fresh.length, after.x.fsrs.log.length);
    check("[B] no suma XP ni toca la racha ni los días con maya", after.xp === before.xp && same(after.xpByDay, before.xpByDay) && same(after.streak, before.streak) && after.daysTotal === before.daysTotal);
    check("[B] guarda lo necesario para deshacer en state.x.ubicacion.last", after.x.ubicacion.last && after.x.ubicacion.last.start === 3 && after.x.ubicacion.last.srs.length === fresh.length);
    await tap(page, cfg, "#ub-go");
    await page.waitForFunction(() => !window.__koox.ubicacion.view().open && window.__koox.screen() === "home");
    await page.waitForTimeout(150);
    const home = await page.evaluate(() => { const u = document.querySelector("#unit-u3"), r = u && u.getBoundingClientRect(); return { top: r ? Math.round(r.top) : null, card: !!document.querySelector("#ub-card"), hist: history.state && history.state.koox }; });
    check("[B] «Ir a la unidad 3» cierra la vista y lleva a esa unidad; la tarjeta ya no aparece", home.top !== null && home.top < 400 && !home.card && !home.hist, JSON.stringify(home));
    await tab(page, cfg, "perfil");
    const pf = await page.evaluate(() => document.querySelector("#ubicacion").textContent);
    check("[B] Perfil muestra la última ubicación y «Deshacer la ubicación»", /unidad 3/.test(pf) && !!(await page.$("#btn-profile-ubicacion-undo")), pf);
    await tap(page, cfg, "#btn-profile-ubicacion-undo");
    await page.waitForSelector("#ub-undo-yes");
    await noOverflow(page, "la confirmación de deshacer", cfg);
    await tap(page, cfg, "#ub-undo-yes");
    await page.waitForSelector("#ub-undone");
    const und = await page.evaluate(() => window.__koox.state());
    check("[B] deshacer revierte las lecciones (incluida la empezada)", same(und.lessons, before.lessons), JSON.stringify(und.lessons));
    check("[B] deshacer saca del repaso las palabras sembradas y deja la previa", same(und.srs, before.srs), Object.keys(und.srs).length);
    check("[B] deshacer quita sus altas del historial FSRS", same(und.x.fsrs.log, before.x.fsrs.log), und.x.fsrs.log.length);
    check("[B] tras deshacer: sin ubicación guardada, XP y racha iguales", und.x.ubicacion.last === null && und.xp === before.xp && same(und.streak, before.streak));
    await page.goBack();
    await page.waitForFunction(() => !window.__koox.ubicacion.view().open && window.__koox.screen() === "profile");
    check("[B] Atrás cierra la vista y vuelve a Perfil, ya sin «Deshacer»", !(await page.$("#btn-profile-ubicacion-undo")));
    check("[B] sin errores de consola", !page.errors.length, page.errors.join(" | "));
    await ctx.close();
  }

  /* ---- C) Oscuro: «Terminar aquí», tope de preguntas, deshacer respeta lo repasado ---- */
  {
    const cfg = { name: "360-oscuro", viewport: { width: 360, height: 780 }, mobile: true, scheme: "dark" };
    log("\n▸ terminar aquí, tope y avance posterior (" + cfg.name + ")");
    const { ctx, page } = await newPage(browser, cfg);
    await load(page, url, EMPTY);
    await tap(page, cfg, "#btn-home-ubicacion");
    await page.waitForFunction(() => window.__koox.ubicacion.view().open);
    await tap(page, cfg, "#ub-start");
    await reply(page, cfg, "ok");
    await tap(page, cfg, "#ub-stop");
    await page.waitForFunction(() => window.__koox.ubicacion.view().phase === "result");
    const h1 = await page.evaluate(() => ({ h: document.querySelector("#ub-h").textContent, ask: !!document.querySelector("#ub-ask") }));
    check("[C] «Terminar aquí» en la unidad 1: propone la unidad 1 sin nada que marcar", h1.h === "Te conviene empezar en la unidad 1" && !h1.ask, h1.h);
    // Todo bien: el tope corta la prueba.
    seenQs.length = 0;
    await tap(page, cfg, "#ub-root [data-act=start]");
    for (let i = 0; i < 80 && (await page.evaluate(() => window.__koox.ubicacion.current())); i++) await reply(page, cfg, "ok");
    const t = await page.evaluate(() => window.__koox.ubicacion.test());
    check("[C] máximo 45 preguntas: con todo bien, 11 unidades aprobadas y empieza en la 12", t.total === 45 && t.passed.length === 11 && t.start === 12 && t.cut, JSON.stringify({ total: t.total, start: t.start, cut: t.cut }));
    check("[C] también aquí solo vocabulario alta", seenQs.every((q) => CONF[q.id] === "alta" && q.opts.every((o) => CONF[o] === "alta")));
    await noOverflow(page, "el resultado (oscuro)", cfg);
    const col = await page.evaluate(() => {
      const probe = (v) => { const d = document.createElement("i"); d.style.color = "var(" + v + ")"; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; };
      return { bg: getComputedStyle(document.querySelector("#ub-root")).backgroundColor, tok: probe("--bg") };
    });
    check("[C] el fondo de la vista sale del token --bg del tema oscuro", col.bg === col.tok, JSON.stringify(col));
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, "ubicacion-resultado-360-oscuro.png") });
    await tap(page, cfg, "#ub-ask");
    await tap(page, cfg, "#ub-apply");
    await page.waitForSelector("#ub-done");
    // Avance posterior: una lección repetida y una palabra repasada se respetan al deshacer.
    const lid = LESSONS_OF(1)[0], wid = VOCAB_OF(1)[0];
    const st = await page.evaluate(() => window.__koox.state());
    st.lessons[lid].times = 1; st.srs[wid].reps = 2; st.srs[wid].right = 1;
    await page.evaluate(([k, s]) => localStorage.setItem(k, JSON.stringify(s)), [STORE, st]);
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => window.__koox && window.__koox.ubicacion);
    await tab(page, cfg, "perfil");
    await tap(page, cfg, "#btn-profile-ubicacion-undo");
    await tap(page, cfg, "#ub-undo-yes");
    await page.waitForSelector("#ub-undone");
    const u = await page.evaluate(() => window.__koox.state());
    check("[C] deshacer respeta la lección repetida y la palabra ya repasada", u.lessons[lid] && u.lessons[lid].times === 1 && !!u.srs[wid] && Object.keys(u.srs).length === 1 && Object.keys(u.lessons).length === 1, Object.keys(u.lessons).length + " lecciones, " + Object.keys(u.srs).length + " palabras");
    check("[C] XP y racha siguen en cero", u.xp === 0 && u.streak.count === 0 && u.daysTotal === 0);
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !window.__koox.ubicacion.view().open);
    check("[C] Escape cierra la vista", true);
    check("[C] sin errores de consola", !page.errors.length, page.errors.join(" | "));
    await ctx.close();
  }

  await browser.close();
}

fuentes();
main().then(() => {
  const fails = results.filter((r) => !r.pass);
  log("\n" + (results.length - fails.length) + " de " + results.length + " comprobaciones correctas en " + ((Date.now() - T0) / 1000).toFixed(1) + " s");
  if (fails.length) { log("FALLAN " + fails.length + ":"); fails.forEach((f) => log("  ✗ " + f.name + (f.detail ? " — " + f.detail : ""))); process.exit(1); }
}).catch((e) => { console.error("ERROR en la prueba:", e && e.stack || e); process.exit(1); });
