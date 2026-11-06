#!/usr/bin/env node
// Pruebas del repaso inteligente (FSRS) de Ko'ox Maaya con Playwright (Chromium headless).
//   node test/fsrs.cjs <ruta.html>
// Acepta el html del Artifact (lo envuelve como la plataforma) o un documento completo que empiece con <!doctype.
// Cubre: las funciones puras (window.__koox.fsrs) contra vectores generados con ts-fsrs 5.4.2; propiedades del
// algoritmo; migración de entradas viejas (cajas de Leitner) y saneo de los campos nuevos; el ciclo completo
// (lección -> repasos en días distintos con page.clock -> error); el interruptor al repaso clásico; el historial
// (state.x.fsrs.log, máx. 3000) y exportar/importar. Sale con código 1 si algo falla.
"use strict";
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const { chromium } = require("playwright");

const target = process.argv[2];
if (!target) { console.error("Uso: node test/fsrs.cjs <ruta.html>"); process.exit(2); }
const SRC = path.resolve(target);
const html = fs.readFileSync(SRC, "utf8");
const FULL_DOC = /^﻿?\s*(<!--[\s\S]*?-->\s*)*<!doctype/i.test(html);
let preview = SRC;
if (!FULL_DOC) {
  preview = path.join(path.dirname(SRC), path.basename(SRC).replace(/\.html?$/i, "") + ".preview.html");
  fs.writeFileSync(preview,
    "<!doctype html><html lang=es><head><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1,viewport-fit=cover'></head><body>" +
    html + "</body></html>");
}
const URL_PREVIEW = "file://" + preview;

const T0 = Date.now();
const results = [];
function check(name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail == null ? "" : String(detail) });
  if (!pass || process.env.VERBOSE) console.log("  " + (pass ? "✓" : "✗") + " " + name + (detail ? " — " + detail : ""));
  return !!pass;
}
const log = (s) => console.log(s);
// KOOX_ONLY=<regex> corre solo las ejecuciones cuyo nombre la cumpla (p. ej. KOOX_ONLY=ciclo): para iterar rápido.
const ONLY = process.env.KOOX_ONLY ? new RegExp(process.env.KOOX_ONLY, "i") : null;
const same = (a, b) => { try { assert.deepStrictEqual(a, b); return true; } catch (e) { return false; } };

// Vectores de referencia generados con el paquete real ts-fsrs 5.4.2 (FSRS-6; mismas fórmulas y pesos que el
// modelo FSRS-6 de ts-fsrs 6.0.0): generatorParameters({ request_retention: 0.9, maximum_interval: 365,
// enable_fuzz: false, enable_short_term: true }) y new FSRSAlgorithm(params): init = next_state(null, 0, g);
// retr = forgetting_curve(t, s); interval = next_interval(s, 0); step = next_state({ difficulty: d, stability: s }, t, g);
// chains: [calificación, días desde el repaso anterior, s, d, intervalo] paso a paso, como los usa la app.
const GOLD = {
  init: [
    [1, 0.212, 6.4133], [2, 1.2931, 5.11217071], [3, 2.3065, 2.11810397], [4, 8.2956, 1]
  ],
  retr: [
    [1, 0.212, 0.76619573], [2, 0.212, 0.698483], [5, 0.212, 0.6121158],
    [10, 0.212, 0.5518455], [30, 0.212, 0.46687128], [100, 0.212, 0.388066],
    [1, 1, 0.9], [2, 1, 0.84588465], [5, 1, 0.76052756],
    [10, 1, 0.69282664], [30, 1, 0.5906334], [100, 1, 0.49232243],
    [1, 2.3065, 0.9468475], [2, 2.3065, 0.90949326], [5, 2.3065, 0.83886143],
    [10, 2.3065, 0.77436692], [30, 2.3065, 0.66752633], [100, 2.3065, 0.55890675],
    [1, 7.3, 0.98075675], [2, 7.3, 0.96397986], [5, 7.3, 0.92384304],
    [10, 7.3, 0.87696612], [30, 7.3, 0.77953194], [100, 7.3, 0.66258851],
    [1, 30, 0.99505387], [2, 30, 0.99028518], [5, 30, 0.9769337],
    [10, 30, 0.9573358], [30, 30, 0.9], [100, 30, 0.79950686],
    [1, 365, 0.99958648], [2, 365, 0.99917423], [5, 365, 0.99794508],
    [10, 365, 0.99592136], [30, 365, 0.98812144], [100, 365, 0.96397986]
  ],
  interval: [
    [0.001, 1], [0.212, 1], [0.49, 1], [0.5, 1],
    [0.51, 1], [1, 1], [1.4, 1], [1.5, 2],
    [2.3065, 2], [7.32145, 7], [16, 16], [34.9, 35],
    [35, 35], [120.5, 121], [364.4, 364], [364.6, 365],
    [365, 365], [400, 365], [36500, 365]
  ],
  step: [
    [0.212, 6.4133, 1, 1, 0.10088579, 8.80630447], [0.212, 6.4133, 1, 3, 1.88678762, 6.40211507],
    [0.212, 6.4133, 3, 1, 0.12028337, 8.80630447], [0.212, 6.4133, 3, 3, 2.76096548, 6.40211507],
    [0.212, 6.4133, 14, 1, 0.15027772, 8.80630447], [0.212, 6.4133, 14, 3, 3.97964448, 6.40211507],
    [0.212, 6.4133, 90, 1, 0.18619739, 8.80630447], [0.212, 6.4133, 90, 3, 5.28332209, 6.40211507],
    [2.3065, 2.1175, 1, 1, 0.57130918, 7.39430422], [2.3065, 2.1175, 1, 3, 7.31564128, 2.11061087],
    [2.3065, 2.1175, 3, 1, 0.63686185, 7.39430422], [2.3065, 2.1175, 3, 3, 13.82768665, 2.11061087],
    [2.3065, 2.1175, 14, 1, 0.80132327, 7.39430422], [2.3065, 2.1175, 14, 3, 28.77744601, 2.11061087],
    [2.3065, 2.1175, 90, 1, 1.06704899, 7.39430422], [2.3065, 2.1175, 90, 3, 49.8952958, 2.11061087],
    [7.3, 2.1, 1, 1, 1.08902279, 7.38855208], [7.3, 2.1, 1, 3, 11.98264596, 2.09312837],
    [7.3, 2.1, 3, 1, 1.14728474, 7.38855208], [7.3, 2.1, 3, 3, 19.83422678, 2.09312837],
    [7.3, 2.1, 14, 1, 1.35208184, 7.38855208], [7.3, 2.1, 14, 3, 45.91169829, 2.09312837],
    [7.3, 2.1, 90, 1, 1.80966393, 7.38855208], [7.3, 2.1, 90, 3, 97.60510249, 2.09312837],
    [30, 5, 1, 1, 1.98696379, 8.34176237], [30, 5, 1, 3, 32.6200166, 4.99022837],
    [30, 5, 3, 1, 2.01789465, 8.34176237], [30, 5, 3, 3, 37.61255349, 4.99022837],
    [30, 5, 14, 1, 2.16295853, 8.34176237], [30, 5, 14, 3, 60.51572701, 4.99022837],
    [30, 5, 90, 1, 2.69835041, 8.34176237], [30, 5, 90, 3, 138.81704477, 4.99022837],
    [120, 3.3, 1, 1, 3.49281224, 7.78298393], [120, 3.3, 1, 3, 122.70233033, 3.29192837],
    [120, 3.3, 3, 1, 3.50707811, 7.78298393], [120, 3.3, 3, 3, 128.03987857, 3.29192837],
    [120, 3.3, 14, 1, 3.58205433, 7.78298393], [120, 3.3, 14, 3, 155.90932816, 3.29192837],
    [120, 3.3, 90, 1, 3.98660189, 7.78298393], [120, 3.3, 90, 3, 301.33201996, 3.29192837],
    [365, 1.2, 1, 1, 5.46086197, 7.0927282], [365, 1.2, 1, 3, 367.86555101, 1.19402837],
    [365, 1.2, 3, 1, 5.46827692, 7.0927282], [365, 1.2, 3, 3, 373.57299046, 1.19402837],
    [365, 1.2, 14, 1, 5.50843405, 7.0927282], [365, 1.2, 14, 3, 404.41348357, 1.19402837],
    [365, 1.2, 90, 1, 5.76062068, 7.0927282], [365, 1.2, 90, 3, 595.48933081, 1.19402837],
    [1.89, 6, 1, 1, 0.47400471, 8.67045557], [1.89, 6, 1, 3, 4.70447694, 5.98922837],
    [1.89, 6, 3, 1, 0.5340222, 8.67045557], [1.89, 6, 3, 3, 8.1465492, 5.98922837],
    [1.89, 6, 14, 1, 0.67617523, 8.67045557], [1.89, 6, 14, 3, 15.57394281, 5.98922837],
    [1.89, 6, 90, 1, 0.8963712, 8.67045557], [1.89, 6, 90, 3, 25.62953298, 5.98922837],
    [0.5, 9.9, 1, 1, 0.18688546, 9.95235905], [0.5, 9.9, 1, 3, 1.02392653, 9.88532837],
    [0.5, 9.9, 3, 1, 0.22152743, 9.95235905], [0.5, 9.9, 3, 3, 1.41233344, 9.88532837],
    [0.5, 9.9, 14, 1, 0.28179222, 9.95235905], [0.5, 9.9, 14, 3, 2.01939797, 9.88532837],
    [0.5, 9.9, 90, 1, 0.35891112, 9.95235905], [0.5, 9.9, 90, 3, 2.7051139, 9.88532837]
  ],
  chains: [
    [[3, 0, 2.3065, 2.11810397, 2], [3, 1, 7.31530068, 2.11121424, 7], [3, 7, 31.67922703, 2.1043314, 32], [3, 30, 113.77320337, 2.09745544, 114], [3, 100, 339.59777669, 2.09058635, 340], [3, 200, 753.19577139, 2.08372413, 365]],
    [[1, 0, 0.212, 6.4133, 1], [3, 1, 1.88678762, 6.40211507, 2], [3, 2, 6.26916146, 6.39094132, 6], [3, 4, 14.4525543, 6.37977875, 14], [3, 9, 30.59561918, 6.36862734, 31], [3, 20, 62.0024188, 6.35748708, 62]],
    [[3, 0, 2.3065, 2.11810397, 2], [3, 1, 7.31530068, 2.11121424, 7], [1, 7, 1.23894176, 7.39223814, 1], [3, 1, 3.22529692, 7.38007427, 3], [3, 2, 6.83704689, 7.36792257, 7], [3, 5, 14.54200266, 7.35578302, 15], [1, 11, 1.58806881, 9.11609223, 2], [1, 1, 0.41385862, 9.69469389, 1], [3, 1, 1.00640128, 9.68022757, 1]],
    [[1, 0, 0.212, 6.4133, 1], [1, 1, 0.10088579, 8.80630447, 1], [1, 1, 0.05503453, 9.59286876, 1], [3, 1, 0.32936546, 9.57850426, 1], [3, 2, 1.16612682, 9.56415413, 1], [3, 3, 2.76657181, 9.54981835, 3]],
    [[3, 0, 2.3065, 2.11810397, 2], [3, 1, 7.31530068, 2.11121424, 7], [3, 15, 47.51989713, 2.1043314, 48], [3, 90, 230.00940851, 2.09745544, 230], [3, 365, 839.10184739, 2.09058635, 365], [3, 365, 1525.37431105, 2.08372413, 365], [1, 365, 8.77544102, 7.38320232, 9]]
  ]
};

// ---------- Utilidades ----------
const KEY = "koox-maaya-v2";
const INTERVALS = [0, 1, 3, 7, 16, 35];
const ymd = (n) => new Date(Date.UTC(2026, 10, 6 + n)).toISOString().slice(0, 10); // día n a partir del 2026-11-06
const dayNum = (k) => { const p = k.split("-").map(Number); return Math.round(Date.UTC(p[0], p[1] - 1, p[2]) / 86400000); };
const at = (n) => new Date(Date.UTC(2026, 10, 6 + n, 16, 0, 0)); // las 10:00 en Mérida (UTC-6) del día n

async function newPage(browser, opts) {
  opts = opts || {};
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, timezoneId: "America/Merida", colorScheme: "light" });
  await ctx.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) => route.abort());
  if (opts.day != null) await ctx.clock.install({ time: at(opts.day) });
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push("pageerror: " + e.message));
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const loc = (msg.location() && msg.location().url) || "";
    if (/fonts\.(googleapis|gstatic)\.com/.test(loc + " " + msg.text())) return;
    page.errors.push("console.error: " + msg.text());
  });
  return { ctx, page };
}
async function load(page) {
  await page.goto(URL_PREVIEW, { waitUntil: "load" });
  await page.waitForFunction(() => window.__koox && typeof window.__koox.screen === "function", null, { timeout: 8000 });
}
const stateOf = (page) => page.evaluate(() => window.__koox.state());
const rawOf = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k)), KEY);
// Escribe un estado en localStorage y recarga (el reloj falso, si hay, se conserva).
async function seed(page, st) {
  await page.evaluate(([k, s]) => localStorage.setItem(k, typeof s === "string" ? s : JSON.stringify(s)), [KEY, st]);
  await load(page);
}
async function gotoTab(page, t) {
  await page.click("#tab-" + t);
  await page.waitForFunction((v) => window.__koox.screen() === v, { aprender: "home", repasar: "review", diccionario: "dict", perfil: "profile" }[t]);
}
async function startLesson(page, id) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.click('[data-lesson="' + id + '"]');
  await page.waitForSelector("#lesson-sheet:not([hidden]) #btn-start-lesson");
  await page.click("#btn-start-lesson");
  await page.waitForFunction(() => ["teach", "vocab", "dialogue", "exercise"].includes(window.__koox.screen()));
}
// Recorre la sesión actual hasta los resultados. wrong = cuántos primeros intentos se contestan mal a propósito
// (los reintentos se contestan bien).
function runInPage(opts) {
  const K = window.__koox, q = (s) => document.querySelector(s);
  const out = { ok: false, ex: 0, wrong: 0 };
  let wrongLeft = (opts && opts.wrong) || 0;
  for (let guard = 0; guard < 800; guard++) {
    const s = K.screen();
    if (s === "results") { out.ok = true; return out; }
    if (s === "teach" || s === "vocab" || s === "dialogue") { q("#btn-next").click(); continue; }
    if (s === "exercise") {
      const p = K.peek();
      out.ex++;
      const wrong = wrongLeft > 0 && !p.retry;
      if (wrong) { wrongLeft--; out.wrong++; }
      if (!K.solve(wrong)) { out.error = "solve() no pudo contestar " + p.type; return out; }
      if (K.screen() === "exercise") {
        const b = q("#btn-check");
        if (!b || b.disabled || b.hidden) { out.error = "Comprobar no disponible en " + p.type; return out; }
        b.click();
      }
      if (K.screen() !== "feedback") { out.error = "sin retroalimentación tras comprobar " + p.type; return out; }
      if (q("#feedback").classList.contains("bad") !== wrong) { out.error = "calificación inesperada en " + p.type; return out; }
      continue;
    }
    if (s === "feedback") { q("#btn-continue").click(); continue; }
    out.error = "pantalla inesperada: " + s; return out;
  }
  out.error = "demasiados pasos"; return out;
}
async function runSession(page, opts) {
  const r = await page.evaluate(runInPage, opts || {});
  if (r.ok) await page.waitForSelector(".results");
  return r;
}
async function startReview(page) {
  await gotoTab(page, "repasar");
  await page.click("#btn-start-review");
  await page.waitForFunction(() => window.__koox.screen() === "exercise");
}
// Cierra los resultados: tras una lección vuelve al inicio; tras un repaso, a Repasar.
async function backHome(page) {
  await page.click("#btn-results-home");
  await page.waitForFunction(() => ["home", "review"].includes(window.__koox.screen()));
}
// ids y textos en maya de las palabras de una lección
const lessonWords = (page, lid) => page.evaluate((id) => {
  const out = [];
  window.__koox.course.units.forEach((u) => u.lessons.forEach((l) => { if (l.id === id) l.vocab.forEach((v) => out.push({ id: v.id, m: v.m })); }));
  return out;
}, lid);
const fsrsOf = (page, fn, ...args) => page.evaluate(([f, a]) => window.__koox.fsrs[f].apply(null, a), [fn, args]);
const near = (a, b, e) => Math.abs(a - b) <= (e == null ? 1.5e-8 : e);

// ---------- 1. Funciones puras contra ts-fsrs ----------
async function pureRun(browser) {
  const { ctx, page } = await newPage(browser);
  await load(page);
  const has = await page.evaluate(() => window.__koox.fsrs && Object.keys(window.__koox.fsrs).sort());
  check("window.__koox.fsrs expone init, next, retrievability, interval y level", has && ["init", "interval", "level", "next", "retrievability"].every((k) => has.includes(k)), JSON.stringify(has));
  const W = await page.evaluate(() => window.__koox.fsrs.weights);
  check("pesos por omisión de FSRS-6 (21) = los de ts-fsrs", W.length === 21 && same(W, [0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542]), W.length);
  check("retención deseada 0.90 e intervalo máximo 365 días", (await page.evaluate(() => [window.__koox.fsrs.desired, window.__koox.fsrs.maxDays])).join() === "0.9,365");

  const r = await page.evaluate((G) => {
    const F = window.__koox.fsrs, bad = { init: [], retr: [], interval: [], step: [], chains: [] };
    let maxDiff = 0, n = 0;
    const diff = (a, b) => { const x = Math.abs(a - b); if (x > maxDiff) maxDiff = x; return x > 1.5e-8; };
    G.init.forEach(([g, s, d]) => { const m = F.init(g); n++; if (diff(m.s, s) | diff(m.d, d)) bad.init.push([g, m.s, m.d, s, d]); });
    G.retr.forEach(([t, s, x]) => { const y = F.retrievability(t, s); n++; if (diff(y, x)) bad.retr.push([t, s, y, x]); });
    G.interval.forEach(([s, k]) => { n++; if (F.interval(s) !== k) bad.interval.push([s, F.interval(s), k]); });
    G.step.forEach(([s, d, t, g, s2, d2]) => { const m = F.next({ s, d }, t, g); n++; if (diff(m.s, s2) | diff(m.d, d2)) bad.step.push([s, d, t, g, m.s, m.d, s2, d2]); });
    G.chains.forEach((c, i) => {
      let m = null;
      c.forEach(([g, t, s, d, k], j) => {
        m = j === 0 ? F.init(g) : F.next(m, t, g);
        n++;
        if (diff(m.s, s) | diff(m.d, d) || F.interval(m.s) !== k) bad.chains.push([i, j, m.s, m.d, F.interval(m.s), s, d, k]);
      });
    });
    return { bad, maxDiff, n };
  }, GOLD);
  const j = (a) => JSON.stringify(a.slice(0, 2));
  check("estado inicial por calificación = ts-fsrs (" + GOLD.init.length + " vectores)", !r.bad.init.length, j(r.bad.init));
  check("retrievability = ts-fsrs (" + GOLD.retr.length + " vectores)", !r.bad.retr.length, j(r.bad.retr));
  check("intervalo (retención 0.90, máx. 365) = ts-fsrs (" + GOLD.interval.length + " vectores)", !r.bad.interval.length, j(r.bad.interval));
  check("siguiente estado para Otra vez y Bien = ts-fsrs (" + GOLD.step.length + " vectores)", !r.bad.step.length, j(r.bad.step));
  check("cadenas completas (primera calificación y repasos) = ts-fsrs (" + GOLD.chains.reduce((a, c) => a + c.length, 0) + " pasos)", !r.bad.chains.length, j(r.bad.chains));
  check("diferencia máxima con ts-fsrs ≤ 1e-8 en " + r.n + " valores", r.maxDiff <= 1.5e-8, r.maxDiff);

  // Propiedades pedidas, con valores propios (no solo con la tabla).
  const P = await page.evaluate(() => {
    const F = window.__koox.fsrs, out = {};
    out.again = F.init(1); out.hard = F.init(2); out.good = F.init(3); out.easy = F.init(4);
    const states = [[0.212, 6.4133], [2.3065, 2.1181], [7.3, 2.1], [30, 5], [120, 3.3], [365, 1.2], [1.89, 6], [0.5, 9.9]];
    out.upS = []; out.upI = []; out.downS = []; out.dUp = []; out.dDown = [];
    states.forEach(([s, d]) => [1, 3, 14, 90].forEach((t) => {
      const a = F.next({ s, d }, t, 3), b = F.next({ s, d }, t, 1);
      out.upS.push(a.s > s); out.upI.push(F.interval(a.s) >= F.interval(s)); out.downS.push(b.s < s);
      out.dUp.push(b.d >= d); out.dDown.push(a.d <= d);
    }));
    const g = F.init(3), a1 = F.next(g, 1, 3), a2 = F.next(a1, 7, 3);
    out.chain = [F.interval(g.s), F.interval(a1.s), F.interval(a2.s)];
    const mono = (s) => { let prev = 2; for (let t = 0; t <= 400; t += 1) { const x = F.retrievability(t, s); if (!(x <= prev) || x < 0 || x > 1) return false; prev = x; } return true; };
    out.decay = [0.212, 1, 2.3065, 30, 365].every(mono);
    out.strict = [0.5, 3, 40].every((s) => F.retrievability(1, s) > F.retrievability(10, s) && F.retrievability(10, s) > F.retrievability(100, s));
    out.r0 = [F.retrievability(0, 5), F.retrievability(5, 5), F.retrievability(30, 30)];
    out.moreStable = F.retrievability(10, 50) > F.retrievability(10, 5);
    out.lv = [0.5, 0.999, 1, 2.99, 3, 6.99, 7, 15.99, 16, 34.99, 35, 400].map(F.level);
    out.iv = [F.interval(0.001), F.interval(1000), F.interval(36500), F.interval(364.6)];
    let mon = true, prev = 0; for (let s = 0.01; s < 600; s *= 1.07) { const k = F.interval(s); if (k < prev) mon = false; prev = k; }
    out.ivMono = mon;
    out.det = JSON.stringify(F.next({ s: 7.3, d: 4 }, 5, 3)) === JSON.stringify(F.next({ s: 7.3, d: 4 }, 5, 3)) && JSON.stringify(F.init(3)) === JSON.stringify(F.init(3));
    out.bad = [F.next({ s: NaN, d: NaN }, NaN, 3), F.next(null, -4, 1), F.next({ s: -3, d: 99 }, 0, 7), F.init(NaN), F.init(99)];
    const J = JSON.stringify, m0 = { s: 2.3065, d: 2.1181 };
    out.t1 = [J(F.next(m0, 0, 3)) === J(F.next(m0, 1, 3)), J(F.next(m0, -5, 1)) === J(F.next(m0, 1, 1)), J(F.next(m0, 0, 3)) !== J(F.next(m0, 2, 3))];
    return out;
  });
  check("entre dos repasos cuenta al menos 1 día (0 o negativo se toma como 1; no hay repasos dentro del día)", P.t1.every(Boolean), JSON.stringify(P.t1));
  check("estado inicial: Otra vez s=0.212 d=6.4133; Bien s=2.3065; Fácil d=1 (límite)", near(P.again.s, 0.212) && near(P.again.d, 6.4133) && near(P.good.s, 2.3065) && near(P.good.d, 2.11810397) && near(P.hard.s, 1.2931) && near(P.easy.s, 8.2956) && P.easy.d === 1, JSON.stringify([P.again, P.good, P.easy]));
  check("un acierto (Bien) aumenta la estabilidad y no acorta el intervalo, en 64 casos", P.upS.every(Boolean) && P.upI.every(Boolean), P.upS.filter((x) => !x).length + " fallan");
  check("un error (Otra vez) reduce la estabilidad, en 64 casos", P.downS.every(Boolean), P.downS.filter((x) => !x).length + " fallan");
  check("un error sube la dificultad y un acierto no la sube", P.dUp.every(Boolean) && P.dDown.every(Boolean));
  check("tres aciertos seguidos alargan el intervalo (2 -> 7 -> 32 días)", same(P.chain, [2, 7, 32]), JSON.stringify(P.chain));
  check("la retrievability baja con el tiempo (0 a 400 días, 5 estabilidades) y está entre 0 y 1", P.decay && P.strict);
  check("retrievability: 1 en t=0 y 0.90 cuando t = estabilidad; más estable, más recuerdo", near(P.r0[0], 1) && near(P.r0[1], 0.9) && near(P.r0[2], 0.9) && P.moreStable, JSON.stringify(P.r0));
  check("niveles por umbrales 0, 1, 3, 7, 16, 35 días", same(P.lv, [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5]), JSON.stringify(P.lv));
  check("el intervalo va de 1 a 365 días y nunca baja al subir la estabilidad", same(P.iv, [1, 365, 365, 365]) && P.ivMono, JSON.stringify(P.iv));
  check("es determinista: sin aleatoriedad", P.det);
  check("entradas absurdas (NaN, null, negativos, calificación inválida) dan estados válidos", P.bad.every((m) => Number.isFinite(m.s) && Number.isFinite(m.d) && m.s >= 0.001 && m.s <= 36500 && m.d >= 1 && m.d <= 10), JSON.stringify(P.bad));
  check("[puras] sin errores de JavaScript", page.errors.length === 0, page.errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// ---------- 2. Migración de entradas viejas y saneo ----------
async function migrationRun(browser) {
  const { ctx, page } = await newPage(browser, { day: 0 });
  await load(page);
  const old = (box, due, extra) => Object.assign({ box, due, right: 7, wrong: 2 }, extra || {});
  const st = { v: 2, xp: 40, lessons: {}, srs: {
    a0: old(0, ymd(0)), a1: old(1, ymd(1)), a2: old(2, ymd(3)), a3: old(3, ymd(-2)), a4: old(4, ymd(16)), a5: old(5, ymd(35)),
    bad: { box: 2, due: ymd(5), right: 1, wrong: 0, s: -5, d: 99, last: "ayer", reps: -1, lapses: "x" },
    big: { box: 5, due: ymd(1), right: 0, wrong: 0, s: 1e12, d: -3, last: ymd(0), reps: 1e12, lapses: 1e12 },
    txt: { box: 1, due: ymd(2), right: 0, wrong: 0, s: "7", d: "3", last: 5, reps: "2", lapses: null },
    nuevo: { box: 3, due: ymd(7), right: 3, wrong: 1, s: 7.31530068, d: 2.11121424, last: ymd(0), reps: 2, lapses: 0 }
  } };
  await seed(page, st);
  const s = (await stateOf(page)).srs;
  const mig = (id, box, due, reps) => {
    const iv = Math.max(1, INTERVALS[box]), e = s[id];
    return e && e.box === box && e.due === due && e.right === 7 && e.wrong === 2 && e.s === iv && e.d === 5 && e.last === ymd(dayNum(due) - dayNum(ymd(0)) - iv) && e.reps === reps && e.lapses === 0;
  };
  check("migración: caja 0 -> s=1 (mínimo), d=5, last=due-1, sin tocar box, due, right ni wrong", mig("a0", 0, ymd(0), 1), JSON.stringify(s.a0));
  check("migración: caja 1 -> s=1", mig("a1", 1, ymd(1), 1), JSON.stringify(s.a1));
  check("migración: caja 2 -> s=3, last=due-3", mig("a2", 2, ymd(3), 2), JSON.stringify(s.a2));
  check("migración: caja 3 vencida -> s=7, last=due-7", mig("a3", 3, ymd(-2), 3), JSON.stringify(s.a3));
  check("migración: caja 4 -> s=16 y caja 5 -> s=35", mig("a4", 4, ymd(16), 4) && mig("a5", 5, ymd(35), 5), JSON.stringify([s.a4, s.a5]));
  check("saneo: s<=0, d>10, last inválida, reps<0 y lapses texto -> se migran o se acotan", s.bad.s === 3 && s.bad.d === 10 && s.bad.last === ymd(2) && s.bad.reps === 2 && s.bad.lapses === 0 && s.bad.box === 2, JSON.stringify(s.bad));
  check("saneo: números enormes o negativos se acotan (s<=36500, d en 1–10, reps y lapses<=1e6)", s.big.s === 36500 && s.big.d === 1 && s.big.reps === 1e6 && s.big.lapses === 1e6 && s.big.last === ymd(0), JSON.stringify(s.big));
  check("saneo: s, d y last de texto se migran (reps «2» cuenta como número, igual que los demás contadores)", s.txt.s === 1 && s.txt.d === 5 && s.txt.last === ymd(1) && s.txt.reps === 2 && s.txt.lapses === 0, JSON.stringify(s.txt));
  check("una entrada ya nueva se conserva idéntica (saneo idempotente)", same(s.nuevo, st.srs.nuevo), JSON.stringify(s.nuevo));
  check("el ajuste scheduler falta -> «fsrs» por omisión", (await stateOf(page)).settings.scheduler === "fsrs");
  for (const [val, want] of [["leitner", "leitner"], ["fsrs", "fsrs"], ["otra", "fsrs"], [5, "fsrs"], [null, "fsrs"]]) {
    await seed(page, { v: 2, lessons: {}, srs: {}, settings: { scheduler: val } });
    const got = (await stateOf(page)).settings.scheduler;
    check("saneo del ajuste scheduler = " + JSON.stringify(val) + " -> " + want, got === want, got);
  }
  await seed(page, '{"v":2,"lessons":{},"srs":{"__proto__":{"box":1,"due":"2026-11-07","right":0,"wrong":0},"ok":{"box":1,"due":"2026-11-07","right":0,"wrong":0}}}');
  const own = await page.evaluate(() => Object.keys(window.__koox.state().srs));
  check("saneo: la clave __proto__ de srs se descarta", same(own, ["ok"]), JSON.stringify(own));
  // El repaso con entradas migradas funciona de punta a punta.
  const ids = (await lessonWords(page, "u1l1")).map((w) => w.id);
  const oldSrs = {}; ids.forEach((id, i) => { oldSrs[id] = old((i % 5) + 1, ymd(-1)); });
  await seed(page, { v: 2, lessons: {}, srs: oldSrs });
  await startReview(page);
  const run = await runSession(page);
  check("repaso con entradas migradas se completa", run.ok, run.error);
  const after = (await stateOf(page)).srs;
  const okAll = ids.every((id) => after[id].reps >= 2 && after[id].last === ymd(0) && after[id].s > 0 && after[id].due > ymd(0));
  check("repaso con entradas migradas: reps+1, last=hoy y vencen más adelante", okAll, JSON.stringify(after[ids[0]]));
  // Una palabra vencida el mismo día de su último repaso (fecha o reloj movidos) o con last en el futuro cuenta 1 día.
  const g3 = await fsrsOf(page, "init", 3), want = await fsrsOf(page, "next", g3, 1, 3);
  const odd = {}; ids.forEach((id, i) => { odd[id] = { box: 1, due: ymd(-1), right: 1, wrong: 0, s: g3.s, d: g3.d, last: i % 2 ? ymd(0) : ymd(3), reps: 1, lapses: 0 }; });
  await seed(page, { v: 2, lessons: {}, srs: odd });
  await startReview(page);
  const run2 = await runSession(page);
  const after2 = (await stateOf(page)).srs;
  check("repaso el mismo día del último (o con last futura): se cuenta 1 día, s=7.3153 como en ts-fsrs", run2.ok && ids.every((id) => near(after2[id].s, want.s) && near(want.s, 7.31530068) && after2[id].last === ymd(0) && after2[id].reps === 2), JSON.stringify(after2[ids[0]]));
  check("[migración] sin errores de JavaScript", page.errors.length === 0, page.errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// ---------- 3. Ciclo completo con el reloj ----------
async function cycleRun(browser) {
  const { ctx, page } = await newPage(browser, { day: 0 });
  await load(page);
  const F = (fn, ...a) => fsrsOf(page, fn, ...a);
  const words = await lessonWords(page, "u1l1");
  const ids = words.map((w) => w.id);
  check("la lección 1 tiene entre 1 y 15 palabras (un repaso las cubre todas)", ids.length >= 1 && ids.length <= 15, ids.length);

  // Día 0: lección completa, todo bien -> primera calificación «Bien».
  await startLesson(page, "u1l1");
  let run = await runSession(page);
  check("la lección se completa", run.ok, run.error);
  let st = await stateOf(page);
  const g3 = await F("init", 3);
  const lessonOk = ids.every((id) => {
    const e = st.srs[id];
    return e && e.box === 1 && e.due === ymd(1) && e.last === ymd(0) && e.reps === 1 && e.lapses === 0 && e.wrong === 0 && near(e.s, g3.s) && near(e.d, g3.d);
  });
  check("lección: cada palabra entra con box 1, vence mañana, s=2.3065, d=2.1181, last=hoy, reps 1 y lapses 0", lessonOk && Object.keys(st.srs).length === ids.length, JSON.stringify(st.srs[ids[0]]));
  let lg = (st.x.fsrs && st.x.fsrs.log) || [];
  check("historial: una terna [día, id, 3] por palabra", lg.length === ids.length && lg.every((e, i) => e[0] === dayNum(ymd(0)) && e[2] === 3 && ids.includes(e[1])), JSON.stringify(lg.slice(0, 2)));
  await backHome(page);
  await gotoTab(page, "repasar");
  check("el día de la lección no hay repasos pendientes", /Práctica libre/.test(await page.textContent("#btn-start-review")));

  // Día 1: primer repaso, todo bien. Debe dar s=7.3153 (ts-fsrs), intervalo 7 días y nivel 3.
  await ctx.clock.setSystemTime(at(1));
  await gotoTab(page, "repasar");
  const dueTxt = await page.textContent(".review-big");
  check("día 1: aparecen " + ids.length + " palabras para repasar", new RegExp("^\\s*" + ids.length + "(?!\\d)").test(dueTxt), dueTxt.replace(/\s+/g, " "));
  await startReview(page);
  run = await runSession(page);
  check("día 1: el repaso se completa", run.ok, run.error);
  const head = await page.textContent(".results-head");
  check("día 1: el resumen dice cuántas palabras subieron de nivel", /subi(ó|eron) de nivel/.test(head), head.replace(/\s+/g, " "));
  const g1 = GOLD.chains[0][1]; // [3, 1, s, d, intervalo]
  st = await stateOf(page);
  const rev1 = ids.filter((id) => st.srs[id].reps === 2);
  const ok1 = rev1.every((id) => {
    const e = st.srs[id];
    return near(e.s, g1[2]) && near(e.d, g1[3]) && e.last === ymd(1) && e.due === ymd(1 + g1[4]) && e.box === 3 && e.lapses === 0 && e.right >= 2;
  });
  check("día 1: s=7.3153, d=2.1112, vence en 7 días (día 8), nivel 3 (como ts-fsrs)", rev1.length === ids.length && ok1, rev1.length + "/" + ids.length + " " + JSON.stringify(st.srs[rev1[0]] || st.srs[ids[0]]));
  lg = st.x.fsrs.log;
  check("historial: el repaso añade una terna [día 1, id, 3] por palabra", lg.length === ids.length * 2 && lg.slice(ids.length).every((e) => e[0] === dayNum(ymd(1)) && e[2] === 3), lg.length);
  await backHome(page);
  await gotoTab(page, "repasar");
  check("día 1: tras el repaso no queda nada pendiente", /Práctica libre/.test(await page.textContent("#btn-start-review")) && /pendientes por hoy/.test(await page.textContent(".review-big")));
  const nextTxt = await page.textContent(".review-hero .muted");
  check("día 1: «Próximo repaso» dice en 7 días", /en 7 días/.test(nextTxt), nextTxt.replace(/\s+/g, " "));
  const levels = await page.$$eval(".levels .level-n", (n) => n.map((x) => parseInt(x.textContent, 10)));
  check("Repasar: las barras de nivel suman todas las palabras (nivel 3 = " + ids.length + ")", levels.length === 5 && levels[2] === ids.length && levels.reduce((a, b) => a + b, 0) === ids.length, JSON.stringify(levels));

  // Diccionario: los puntos de nivel salen del nivel derivado.
  await gotoTab(page, "diccionario");
  await page.fill("#dict-q", words[0].m);
  const dots = await page.$$eval("#dict-list .dots", (d) => d.map((x) => x.getAttribute("aria-label")));
  check("Diccionario: la palabra repasada muestra «Nivel 3 de 5»", dots.includes("Nivel 3 de 5"), JSON.stringify(dots.slice(0, 3)));
  await page.fill("#dict-q", "");

  // Día 8: segundo repaso (7 días después). Debe dar s=31.68 y 32 días.
  await ctx.clock.setSystemTime(at(8));
  await startReview(page);
  run = await runSession(page);
  check("día 8: el repaso se completa", run.ok, run.error);
  const g2 = GOLD.chains[0][2];
  st = await stateOf(page);
  const ok2 = ids.every((id) => {
    const e = st.srs[id];
    return e.reps === 3 && near(e.s, g2[2]) && near(e.d, g2[3]) && e.last === ymd(8) && e.due === ymd(8 + g2[4]) && e.box === 4;
  });
  check("día 8: s=31.68, vence en 32 días, nivel 4 (las fechas crecen: 7 y luego 32 días)", ok2, JSON.stringify(st.srs[ids[0]]));
  await backHome(page);

  // Día 40: tercer repaso con un error a propósito.
  await ctx.clock.setSystemTime(at(40));
  const pre = (await stateOf(page)).srs;
  await startReview(page);
  run = await runSession(page, { wrong: 1 });
  check("día 40: el repaso con un error se completa (el error se reintenta)", run.ok && run.wrong === 1, run.error || JSON.stringify(run));
  st = await stateOf(page);
  const failed = ids.filter((id) => st.srs[id].lapses === 1);
  check("día 40: exactamente una palabra tuvo un lapso", failed.length === 1, failed.length);
  if (failed.length === 1) {
    const id = failed[0], e = st.srs[id], p0 = pre[id];
    const expF = await F("next", { s: p0.s, d: p0.d }, 32, 1);
    check("error: la estabilidad baja (calculada con Otra vez y 32 días) y la dificultad sube", near(e.s, expF.s) && e.s < p0.s && near(e.d, expF.d) && e.d > p0.d, JSON.stringify([p0.s, e.s, expF.s]));
    const lvl = Math.max(1, await F("level", e.s)), iv = await F("interval", e.s);
    check("error: box derivado de s, vence en el intervalo nuevo, wrong+1, reps+1", e.box === lvl && e.box < 4 && e.due === ymd(40 + iv) && e.wrong === p0.wrong + 1 && e.reps === p0.reps + 1 && e.last === ymd(40), JSON.stringify(e));
    const lastLog = st.x.fsrs.log.filter((x) => x[1] === id).pop();
    check("historial: la terna del error es [día 40, id, 1]", lastLog && lastLog[0] === dayNum(ymd(40)) && lastLog[2] === 1, JSON.stringify(lastLog));
    const others = ids.filter((x) => x !== id);
    const g3s = GOLD.chains[0][3];
    check("día 40: las demás palabras siguen la cadena de ts-fsrs", others.every((x) => st.srs[x].reps === 4 && st.srs[x].lapses === 0 && st.srs[x].last === ymd(40) && st.srs[x].s > pre[x].s) && near(st.srs[others[0]].s, (await F("next", { s: pre[others[0]].s, d: pre[others[0]].d }, 32, 3)).s), JSON.stringify(g3s));
    await backHome(page);
    await gotoTab(page, "repasar");
    const hard = await page.textContent("#hard-title + .hard-list, .hard-list");
    check("Palabras difíciles: lista la palabra fallada con «1 error»", /1 error/.test(hard || ""), (hard || "").replace(/\s+/g, " ").slice(0, 80));
  } else await backHome(page);
  check("[ciclo] sin errores de JavaScript", page.errors.length === 0, page.errors.slice(0, 3).join(" | "));

  // ---------- Exportar e importar conservan las entradas ----------
  const before = await stateOf(page);
  await gotoTab(page, "perfil");
  await page.evaluate(() => { Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText(t) { window.__clip = t; return Promise.resolve(); } } }); });
  await page.click("#btn-copy");
  await page.waitForFunction(() => !!window.__clip);
  const code = await page.evaluate(() => window.__clip);
  check("exportar: el código «KOOX1.» se genera", /^KOOX1\./.test(code), code.slice(0, 20) + "… " + code.length + " caracteres");
  await page.click("#btn-reset"); await page.click("#btn-reset");
  await page.waitForFunction(() => Object.keys(window.__koox.state().srs).length === 0);
  const wiped = await stateOf(page);
  check("borrar avance vacía srs y el historial, y conserva el ajuste scheduler", !Object.keys(wiped.srs).length && !((wiped.x.fsrs || {}).log || []).length && wiped.settings.scheduler === "fsrs");
  await page.fill("#backup-paste", code);
  await page.click("#btn-import");
  await page.waitForSelector("#backup-confirm:not([hidden]) #btn-import-ok");
  await page.click("#btn-import-ok");
  await page.waitForFunction(() => /se reemplazó/.test(document.querySelector("#backup-msg").textContent));
  const imported = await stateOf(page);
  check("importar: srs vuelve idéntico (s, d, last, reps, lapses, box, due, right, wrong)", same(imported.srs, before.srs), Object.keys(imported.srs).length + " entradas");
  check("importar: el historial (state.x.fsrs.log) vuelve idéntico", same(imported.x.fsrs.log, before.x.fsrs.log), imported.x.fsrs.log.length + " ternas");
  check("importar: el estado completo vuelve idéntico", same(imported, before));
  // Un respaldo viejo (sin campos de FSRS) se migra al importarlo.
  const viejo = JSON.stringify({ app: "koox-maaya", v: 2, xp: 10, lessons: {}, srs: { [ids[0]]: { box: 4, due: ymd(45), right: 5, wrong: 1 } }, streak: { count: 1, best: 1, last: ymd(40) } });
  await page.fill("#backup-paste", viejo);
  await page.click("#btn-import");
  await page.waitForSelector("#backup-confirm:not([hidden]) #btn-import-ok");
  await page.click("#btn-import-ok");
  await page.waitForFunction(() => /se reemplazó/.test(document.querySelector("#backup-msg").textContent));
  const mig = (await stateOf(page)).srs[ids[0]];
  check("importar un respaldo viejo: s=16, d=5, last=due-16, reps=4, lapses=0", mig && mig.s === 16 && mig.d === 5 && mig.last === ymd(45 - 16) && mig.reps === 4 && mig.lapses === 0 && mig.box === 4, JSON.stringify(mig));
  check("[exportar/importar] sin errores de JavaScript", page.errors.length === 0, page.errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// ---------- 4. Primera calificación con errores ----------
async function againRun(browser) {
  const { ctx, page } = await newPage(browser, { day: 0 });
  await load(page);
  const ids = (await lessonWords(page, "u1l2")).map((w) => w.id);
  await startLesson(page, "u1l2");
  const run = await runSession(page, { wrong: 1 });
  check("lección con un error a propósito se completa", run.ok && run.wrong === 1, run.error);
  const st = await stateOf(page);
  const g1 = await fsrsOf(page, "init", 1), g3 = await fsrsOf(page, "init", 3);
  const rows = ids.map((id) => st.srs[id]);
  const again = ids.filter((id) => st.srs[id].wrong > 0), good = ids.filter((id) => st.srs[id].wrong === 0);
  check("hubo palabras con error (primera calificación «Otra vez») y sin error («Bien»)", again.length >= 1 && good.length >= 1, again.length + " / " + good.length);
  check("con error: s=0.212, d=6.4133; sin error: s=2.3065. Siempre box 1 y vencen mañana", again.every((id) => near(st.srs[id].s, g1.s) && near(st.srs[id].d, g1.d)) && good.every((id) => near(st.srs[id].s, g3.s) && near(st.srs[id].d, g3.d)) && rows.every((e) => e.box === 1 && e.due === ymd(1) && e.reps === 1 && e.lapses === 0), JSON.stringify([st.srs[again[0]], st.srs[good[0]]]));
  const lg = st.x.fsrs.log;
  check("historial: «Otra vez» (1) para las palabras con error y «Bien» (3) para el resto", lg.length === ids.length && lg.every((e) => e[2] === (again.includes(e[1]) ? 1 : 3)), JSON.stringify(lg.slice(0, 3)));
  await backHome(page);
  // Día 1: la palabra que empezó con «Otra vez» sigue la cadena 1 de ts-fsrs (s=1.8868, intervalo 2).
  await ctx.clock.setSystemTime(at(1));
  await startReview(page);
  const rv = await runSession(page);
  check("día 1: el repaso se completa", rv.ok, rv.error);
  const s1 = (await stateOf(page)).srs, c = GOLD.chains[1][1];
  check("la palabra que empezó con error: s=1.8868, d=6.4021, vence en 2 días, nivel 1 (como ts-fsrs)", again.every((id) => near(s1[id].s, c[2]) && near(s1[id].d, c[3]) && s1[id].due === ymd(1 + c[4]) && s1[id].box === 1) && good.every((id) => s1[id].box === 3), JSON.stringify(s1[again[0]]));
  check("[otra vez] sin errores de JavaScript", page.errors.length === 0, page.errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// ---------- 5. Interruptor al repaso clásico ----------
async function switchRun(browser) {
  const { ctx, page } = await newPage(browser, { day: 0 });
  await load(page);
  const ids = (await lessonWords(page, "u1l1")).map((w) => w.id);
  const old = {}; ids.forEach((id, i) => { old[id] = { box: i % 2 ? 3 : 1, due: ymd(-1), right: 2, wrong: 0 }; });
  await seed(page, { v: 2, lessons: {}, srs: old });
  await gotoTab(page, "perfil");
  const sec = await page.evaluate(() => {
    const h = document.querySelector("#fsrs-title"), sw = document.querySelector("#fsrs-classic"), s = h && h.closest("section");
    return { title: h && h.textContent, checked: sw && sw.checked, role: sw && sw.getAttribute("role"), label: sw && sw.closest("label").textContent, text: s && s.querySelector("p").textContent, emoji: s && /\p{Extended_Pictographic}/u.test(s.textContent) };
  });
  check("Perfil: sección «Repaso inteligente» con explicación e interruptor «Usar el repaso clásico» apagado", sec.title === "Repaso inteligente" && sec.checked === false && sec.role === "switch" && /Usar el repaso clásico/.test(sec.label) && sec.text.length > 60 && !sec.emoji, JSON.stringify(sec));
  await page.click("#fsrs-classic");
  check("el interruptor activa el repaso clásico (ajuste guardado)", (await stateOf(page)).settings.scheduler === "leitner" && (await rawOf(page)).settings.scheduler === "leitner");
  check("aparece el aviso del cambio", /Repaso clásico activado/.test(await page.textContent("#toast")));
  await startReview(page);
  const run = await runSession(page);
  check("repaso clásico se completa", run.ok, run.error);
  let st = await stateOf(page);
  const classicOk = ids.every((id) => {
    const e = st.srs[id], b = old[id].box + 1;
    return e.box === b && e.due === ymd(INTERVALS[b]) && e.right === 3 && e.wrong === 0 && e.reps === Math.max(1, old[id].box) + 1 && e.last === ymd(0);
  });
  check("repaso clásico: un acierto sube una caja y vence en 3 o 16 días (como antes)", classicOk, JSON.stringify(st.srs[ids[0]]) + " " + JSON.stringify(st.srs[ids[1]]));
  check("repaso clásico: aun así se actualiza la memoria de FSRS y el historial", ids.every((id) => st.srs[id].s > old[id].box) && st.x.fsrs.log.length === ids.length && st.x.fsrs.log.every((e) => e[2] === 3), JSON.stringify(st.x.fsrs.log.slice(0, 2)));
  await backHome(page);
  // Un error en el clásico lleva a la caja 1 y vence mañana.
  const redo = JSON.parse(JSON.stringify(st.srs)); Object.keys(redo).forEach((id) => { redo[id].due = ymd(-1); });
  await seed(page, Object.assign({}, st, { srs: redo }));
  await startReview(page);
  const run2 = await runSession(page, { wrong: 1 });
  check("repaso clásico con un error se completa", run2.ok && run2.wrong === 1, run2.error);
  st = await stateOf(page);
  const lost = ids.filter((id) => st.srs[id].lapses === 1);
  check("repaso clásico: el error devuelve la palabra a la caja 1 y vence mañana", lost.length === 1 && st.srs[lost[0]].box === 1 && st.srs[lost[0]].due === ymd(1) && st.srs[lost[0]].wrong === 1 && ids.filter((id) => st.srs[id].lapses === 0).every((id) => st.srs[id].box === Math.min(5, redo[id].box + 1)), JSON.stringify(st.srs[lost[0]]));
  // Volver al repaso inteligente: los niveles se derivan de s; las fechas no cambian.
  await backHome(page);
  const dues = {}; ids.forEach((id) => { dues[id] = st.srs[id].due; });
  await gotoTab(page, "perfil");
  check("el interruptor sigue encendido tras recargar la vista", await page.isChecked("#fsrs-classic"));
  await page.click("#fsrs-classic");
  st = await stateOf(page);
  const lv = await Promise.all(ids.map((id) => fsrsOf(page, "level", st.srs[id].s)));
  check("repaso inteligente de nuevo: box = nivel derivado de s (mínimo 1) y las fechas no cambian", st.settings.scheduler === "fsrs" && ids.every((id, i) => st.srs[id].box === Math.max(1, Math.min(5, lv[i])) && st.srs[id].due === dues[id]), JSON.stringify(st.srs[ids[0]]));
  // «Borrar avance» conserva el ajuste.
  await page.click("#fsrs-classic");
  await page.click("#btn-reset"); await page.click("#btn-reset");
  await page.waitForFunction(() => Object.keys(window.__koox.state().srs).length === 0);
  check("«Borrar avance» conserva el repaso clásico", (await stateOf(page)).settings.scheduler === "leitner");
  check("[interruptor] sin errores de JavaScript", page.errors.length === 0, page.errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// ---------- 6. Historial acotado y saneado ----------
async function logRun(browser) {
  const { ctx, page } = await newPage(browser, { day: 0 });
  await load(page);
  const ids = (await lessonWords(page, "u1l1")).map((w) => w.id);
  const old = {}; ids.forEach((id) => { old[id] = { box: 2, due: ymd(-1), right: 1, wrong: 0 }; });
  const V = 3005, valid = [], mixed = [];
  const junk = ["x", [1, 2], [1, "a", 9], [-5, "a", 3], [1.5, "a", 3], ["1", "a", 3], [1, "", 3], [1, "a"], null, {}, [1, "a", 3, 4], [2e6, "a", 3], [1, "z".repeat(101), 3]];
  for (let i = 0; i < V; i++) { const e = [20000 + (i % 400), "v" + i, i % 7 === 0 ? 1 : 3]; valid.push(e); mixed.push(e); if (i % 250 === 0) mixed.push(junk[(i / 250) % junk.length]); }
  await seed(page, { v: 2, lessons: {}, srs: old, x: { fsrs: { log: mixed } } });
  await startReview(page);
  const run = await runSession(page);
  check("repaso con historial lleno se completa", run.ok, run.error);
  const lg = (await stateOf(page)).x.fsrs.log, n = ids.length;
  const wellFormed = lg.every((e) => Array.isArray(e) && e.length === 3 && Number.isInteger(e[0]) && e[0] >= 0 && typeof e[1] === "string" && e[1].length > 0 && e[1].length <= 100 && [1, 2, 3, 4].includes(e[2]));
  check("historial: se descarta lo inválido y no pasa de 3000 ternas", lg.length === 3000 && wellFormed, lg.length);
  check("historial: se descarta lo más viejo y la última terna es la del repaso", lg[0][1] === "v" + (V + n - 3000) && lg.slice(-n).every((e) => e[0] === dayNum(ymd(0)) && e[2] === 3 && ids.includes(e[1])), JSON.stringify([lg[0], lg[lg.length - 1]]));
  check("historial: entre lo viejo y lo nuevo no se pierde ni se repite nada", same(lg.slice(0, 3000 - n), valid.slice(V - (3000 - n))), "");
  check("el estado guardado no pasa de 1 MB aun con 3000 ternas", JSON.stringify(await rawOf(page)).length < 1000000, JSON.stringify(await rawOf(page)).length);
  // Un historial que no es lista se reinicia sin romper nada.
  await seed(page, { v: 2, lessons: {}, srs: old, x: { fsrs: { log: "texto" } } });
  await startReview(page);
  const run3 = await runSession(page);
  const lg2 = (await stateOf(page)).x.fsrs.log;
  check("historial dañado (no es lista): se reinicia con las ternas nuevas", run3.ok && Array.isArray(lg2) && lg2.length === n, run3.error || (lg2 && lg2.length));
  check("[historial] sin errores de JavaScript", page.errors.length === 0, page.errors.slice(0, 3).join(" | "));
  await ctx.close();
}

(async () => {
  log("Ko'ox Maaya · pruebas del repaso inteligente (FSRS)");
  log("Archivo: " + SRC);
  const browser = await chromium.launch();
  const runs = [
    ["funciones puras contra ts-fsrs", pureRun],
    ["migración de entradas viejas y saneo", migrationRun],
    ["ciclo completo con reloj: lección, repasos, error, exportar e importar", cycleRun],
    ["primera calificación con errores", againRun],
    ["interruptor al repaso clásico", switchRun],
    ["historial acotado", logRun]
  ];
  for (const [label, fn] of runs.filter((r) => !ONLY || ONLY.test(r[0]))) {
    const t = Date.now();
    log("\n▸ " + label);
    try { await fn(browser); }
    catch (e) { check("ejecución sin excepciones: " + label, false, (e && e.message || String(e)).split("\n")[0]); }
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
