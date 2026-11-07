#!/usr/bin/env node
// Pruebas del módulo «Historias» (elige qué decir), con Chromium headless y Playwright.
//   node test/historias.cjs <ruta.html>     el html del Artifact (se envuelve como lo hace la plataforma)
// Antes, sin navegador: ninguna línea maya de src/content/historias.js está inventada (cada una aparece tal cual
// en el curso: vocabulario m, ejemplo ex.m o línea de diálogo), el formato es válido, todos los caminos terminan,
// la unidad recomendada cubre sus líneas, y el módulo no lleva colores sueltos ni emojis.
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
if (!target) { console.error("Uso: node test/historias.cjs <ruta.html>"); process.exit(2); }
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

/* ============ 1) Contenido y fuentes (sin navegador) ============ */
const CONTENT = path.join(ROOT, "src/content");
function loadWindow(files) {
  const win = {};
  const ctx = vm.createContext({ window: win });
  for (const f of files) vm.runInContext(fs.readFileSync(f, "utf8"), ctx, { filename: f });
  return win;
}
const unitFiles = fs.readdirSync(CONTENT).filter((f) => /^u\d+\.js$/.test(f)).sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10)).map((f) => path.join(CONTENT, f));
const UNITS = loadWindow(unitFiles).COURSE.units;
const STORIES = loadWindow([path.join(CONTENT, "historias.js")]).COURSE_STORIES;
const EMOJI = /\p{Extended_Pictographic}/u;
// Corpus maya del curso: cadena exacta → unidad más baja en la que aparece.
const CORPUS = new Map();
function addC(m, n) { if (typeof m === "string" && (!CORPUS.has(m) || CORPUS.get(m) > n)) CORPUS.set(m, n); }
for (const u of UNITS) for (const l of u.lessons || []) {
  for (const v of l.vocab || []) { addC(v.m, u.n); if (v.ex) addC(v.ex.m, u.n); }
  for (const x of (l.dialogue && l.dialogue.lines) || []) addC(x.m, u.n);
}
// Todos los recorridos posibles (siguiendo solo opciones apropiadas) desde el inicio hasta "fin".
function paths(s) {
  const out = [], loops = [];
  (function walk(id, seen) {
    if (id === "fin") { out.push(seen); return; }
    if (seen.includes(id)) { loops.push(seen.concat(id).join("→")); return; }
    const n = s.nodes[id];
    if (!n) { loops.push(seen.concat(id + "?").join("→")); return; }
    for (const c of n.choices.filter((c) => c.ok)) walk(c.next, seen.concat(id));
  })(s.start, []);
  return { out, loops };
}
function contenido() {
  log("\n▸ contenido de las historias (sin navegador)");
  check("[contenido] COURSE_STORIES tiene 3 historias", Array.isArray(STORIES) && STORIES.length === 3, STORIES && STORIES.length);
  const ids = STORIES.map((s) => s.id);
  check("[contenido] ids únicos y con formato", new Set(ids).size === ids.length && ids.every((id) => /^[a-z0-9][a-z0-9-]{0,63}$/.test(id)), ids.join(" "));
  let nMaya = 0;
  const inventadas = [];
  for (const s of STORIES) {
    let maxU = 0;
    const nodes = Object.entries(s.nodes || {});
    for (const [k, n] of nodes) for (const x of [...(n.lines || []), ...(n.choices || [])]) {
      nMaya++;
      if (!CORPUS.has(x.m)) inventadas.push(s.id + "/" + k + ": «" + x.m + "»");
      else maxU = Math.max(maxU, CORPUS.get(x.m));
      if (!x.es || !String(x.es).trim()) inventadas.push(s.id + "/" + k + ": «" + x.m + "» sin traducción");
    }
    check("[" + s.id + "] unidad recomendada (" + s.unit + ") cubre todas sus líneas (la más alta: " + maxU + ")", s.unit === maxU, s.unit + " vs " + maxU);
    check("[" + s.id + "] título, intro, outro y start", !!(s.title && s.intro && s.outro && s.nodes && s.nodes[s.start]));
    const badN = nodes.filter(([, n]) => !Array.isArray(n.choices) || n.choices.length < 2 || n.choices.length > 3 || !n.choices.some((c) => c.ok) || !n.choices.some((c) => !c.ok));
    check("[" + s.id + "] cada paso tiene 2–3 opciones, al menos una apropiada y una no apropiada", !badN.length, badN.map((x) => x[0]).join(" "));
    const badC = [];
    for (const [k, n] of nodes) for (const c of n.choices) {
      if (typeof c.ok !== "boolean" || !c.fb || !String(c.fb).trim()) badC.push(k + ": " + c.m + " (sin ok o fb)");
      if (c.ok && !(c.next === "fin" || s.nodes[c.next])) badC.push(k + ": " + c.m + " → " + c.next);
      if (!c.ok && c.next) badC.push(k + ": " + c.m + " (no apropiada con next)");
    }
    check("[" + s.id + "] opciones con retroalimentación; las apropiadas llevan a un paso o a «fin», las otras no avanzan", !badC.length, badC.join(" | "));
    const p = paths(s), lens = p.out.map((x) => x.length);
    const reach = new Set(p.out.flat());
    check("[" + s.id + "] todos los caminos terminan (" + p.out.length + " caminos, " + Math.min(...lens) + "–" + Math.max(...lens) + " pasos), sin ciclos", p.out.length >= 2 && !p.loops.length && lens.every((x) => x >= 4 && x <= 6), p.loops.join(" | ") + " " + lens.join(","));
    check("[" + s.id + "] todos los pasos se alcanzan y los caminos se vuelven a unir", nodes.every(([k]) => reach.has(k)) && nodes.length < lens.reduce((a, b) => a + b, 0), [...reach].length + " de " + nodes.length);
  }
  check("[contenido] REGLA DE ORO: ninguna línea maya inventada (" + nMaya + " líneas, todas tal cual en el curso de " + CORPUS.size + " cadenas)", !inventadas.length, inventadas.join(" | "));
  const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
  const css = read("src/modules/historias.css").replace(/\/\*[\s\S]*?\*\//g, ""), js = read("src/modules/historias.js"), ct = read("src/content/historias.js");
  const lit = css.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(|\bcolor\(|\b(white|black)\b/g);
  check("[fuentes] historias.css usa solo tokens del tema (var(--…))", !lit, lit ? lit.join(" ") : "");
  check("[fuentes] historias.js no escribe colores", !/(fill|stroke|color|background)\s*[=:]\s*["']?\s*(#|rgb|hsl)|\brgba?\(|\bhsla?\(/.test(js));
  check("[fuentes] sin emojis, backticks ni </script en el módulo y el contenido", !EMOJI.test(js + css + ct) && !/<\/script|<!--/i.test(js + css + ct) && !/`/.test(ct));
  check("[fuentes] sin imágenes externas ni librerías", !/<img|url\(|\bsrc=|https?:\/\//.test(js + css));
  check("[fuentes] build-core.mjs incluye src/content/historias.js", /"historias\.js"/.test(read("build-core.mjs")));
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
  const file = path.join(path.dirname(SRC), path.basename(SRC).replace(/\.html?$/i, "") + ".historias.preview.html");
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
  await page.waitForFunction(() => window.__koox && typeof window.__koox.screen === "function" && window.__koox.historias, null, { timeout: 8000 });
  await page.evaluate(([k, s]) => { if (s === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(s)); }, [STORE, seed]);
  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(() => window.__koox && window.__koox.historias, null, { timeout: 8000 });
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
    const ml = document.querySelector("#his-root:not([hidden])");
    return { sw: Math.max(d.scrollWidth, b.scrollWidth, ml ? ml.scrollWidth : 0), cw: vw, bad };
  });
  return check("[" + cfg.name + "] sin scroll horizontal en " + where, o.sw <= o.cw + 1 && !o.bad.length, "scrollWidth " + o.sw + " / ancho " + o.cw + (o.bad.length ? " · se salen: " + o.bad.join(", ") : ""));
}
const sizes = (page, sel) => page.evaluate((s) => [...document.querySelectorAll(s)].filter((e) => e.offsetParent !== null).map((e) => { const r = e.getBoundingClientRect(); return Math.round(Math.min(r.width, r.height)); }), sel);
function seedState(extra) {
  return Object.assign({ v: 2, xp: 0, xpByDay: {}, streak: { count: 0, best: 0, last: null, graceWeek: null }, daysTotal: 0, goal: 20, lessons: {}, srs: {}, x: {},
    settings: { sound: false, autoplay: false, rate: "normal", synth: true, calm: false } }, extra || {});
}
const view = (page) => page.evaluate(() => window.__koox.historias.view());
const st = (page) => page.evaluate(() => window.__koox.state());
// Juega un recorrido (lista de pasos) eligiendo la opción apropiada que lleva al siguiente; con wrongAt elige antes una no apropiada en ese paso.
async function playPath(page, cfg, s, steps, wrongAt) {
  let firstOk = 0;
  for (let i = 0; i < steps.length; i++) {
    const n = s.nodes[steps[i]], next = steps[i + 1] || "fin";
    const okIdx = n.choices.findIndex((c) => c.ok && c.next === next);
    const v0 = await view(page);
    if (v0.node !== steps[i]) return { err: "esperaba el paso " + steps[i] + " y está en " + v0.node };
    if (i === wrongAt) {
      const badIdx = n.choices.findIndex((c) => !c.ok);
      await tap(page, cfg, '#his-root .his-opt[data-c="' + badIdx + '"]');
      await page.waitForFunction((c) => window.__koox.historias.view().fb === c, badIdx);
      const w = await page.evaluate((bi) => {
        const fb = document.querySelector("#his-fb"), opts = [...document.querySelectorAll("#his-root .his-opt")];
        return { fb: fb && fb.className, text: fb && fb.textContent, next: !!document.querySelector("#his-next"), focus: document.activeElement && document.activeElement.id,
          badDis: opts[bi].disabled, others: opts.filter((o, j) => j !== bi).every((o) => !o.disabled) };
      }, badIdx);
      const v1 = await view(page);
      check("[" + cfg.name + "] " + s.id + "/" + steps[i] + ": la opción no apropiada no avanza y explica por qué con amabilidad", v1.node === steps[i] && v1.steps === v0.steps && /\bno\b/.test(w.fb) && !w.next && w.text.includes(n.choices[badIdx].fb) && /Elige otra opción/.test(w.text) && w.focus === "his-fb", JSON.stringify(w).slice(0, 160));
      check("[" + cfg.name + "] " + s.id + "/" + steps[i] + ": permite reintentar (la probada queda marcada, las demás siguen activas)", w.badDis && w.others);
    }
    await tap(page, cfg, '#his-root .his-opt[data-c="' + okIdx + '"]');
    await page.waitForSelector("#his-next");
    if (i !== wrongAt) firstOk++;
    await tap(page, cfg, "#his-next");
    if (next === "fin") await page.waitForFunction(() => window.__koox.historias.view().view === "summary");
    else await page.waitForFunction((x) => window.__koox.historias.view().node === x, next);
  }
  return { firstOk };
}

async function main() {
  prepareFonts();
  const browser = await chromium.launch();
  const url = preview();
  let fbLight = null;

  /* ---- A) 360 px claro: tarjeta, lista, todos los caminos, reintento, XP, hoja, Atrás y persistencia ---- */
  {
    const cfg = { name: "360-claro", viewport: { width: 360, height: 780 }, mobile: true, scheme: "light" };
    log("\n▸ historias completas (" + cfg.name + ")");
    const { ctx, page } = await newPage(browser, cfg);
    await load(page, url, seedState());
    const card = await page.evaluate(() => { const b = document.querySelector("#btn-home-stories"); return b ? { t: b.textContent, gami: !!b.closest(".gami") } : null; });
    check("[A] tarjeta «Historias» en Inicio (no es .gami)", card && /Historias/.test(card.t) && !card.gami, card && card.t);
    check("[A] la tarjeta mide 44 px o más", (await sizes(page, "#btn-home-stories"))[0] >= 44);
    const list = await page.evaluate(() => window.__koox.historias.list());
    check("[A] la página carga las 3 historias, con su unidad", same(list.map((x) => [x.id, x.unit]), STORIES.map((s) => [s.id, s.unit])), JSON.stringify(list.map((x) => x.id)));
    check("[A] el módulo no crea estado propio hasta terminar una historia", (await st(page)).x.historias === undefined);
    await tap(page, cfg, "#btn-home-stories");
    await page.waitForFunction(() => window.__koox.historias.view().open && window.__koox.screen() === "historias");
    const cards = await page.evaluate(() => [...document.querySelectorAll("#his-root .his-card")].map((b) => b.textContent));
    check("[A] la lista muestra cada historia con «Desde la Unidad N»", cards.length === 3 && STORIES.every((s, i) => cards[i].includes("Desde la Unidad " + s.unit) && cards[i].includes(s.title)), cards.join(" | ").slice(0, 200));
    await noOverflow(page, "la lista", cfg);

    let xp0 = (await st(page)).xp, nPaths = 0;
    for (const s of STORIES) {
      const ps = paths(s).out;
      for (let k = 0; k < ps.length; k++) {
        const p = ps[k], wrongAt = k === 0 ? 0 : -1;
        if (k === 0) {
          await tap(page, cfg, '#his-root .his-card[data-id="' + s.id + '"]');
          await page.waitForFunction((id) => window.__koox.historias.view().view === "play" && window.__koox.historias.view().id === id, s.id);
        } else {
          await tap(page, cfg, "#his-again");
          await page.waitForFunction(() => window.__koox.historias.view().view === "play" && window.__koox.historias.view().steps === 1);
        }
        if (s === STORIES[0] && k === 0) {
          // Líneas mayas: lang="yua", clase .m, tocables, con hoja de glosa y audio si existe.
          const ln = await page.evaluate(() => {
            const ms = [...document.querySelectorAll("#his-root .his-line .m, #his-root .his-opt .m")];
            return { n: ms.length, ok: ms.every((e) => e.getAttribute("lang") === "yua"), rows: document.querySelectorAll("#his-root .his-row").length, au: document.querySelectorAll("#his-root .his-row .au-btn").length };
          });
          check("[A] cada línea y opción maya va con lang=yua y clase .m (" + ln.n + ")", ln.n >= 3 && ln.ok);
          const hl = await page.evaluate(() => { const b = document.querySelector("#his-root .his-line"), m = b.querySelector(".m"); return { h: m.getBoundingClientRect().height, lh: parseFloat(getComputedStyle(m).lineHeight) || 26, n: m.getClientRects().length }; });
          check("[A] una línea corta cabe en un renglón de la burbuja (no se parte palabra por palabra)", hl.n === 1, JSON.stringify(hl));
          const tg = await sizes(page, "#his-root button");
          check("[A] objetivos táctiles de la historia ≥ 44 px (" + tg.length + ")", tg.length >= 4 && tg.every((x) => x >= 44), Math.min(...tg) + " px mínimo");
          await tap(page, cfg, "#his-root .his-line");
          await page.waitForFunction(() => window.__koox.historias.view().sheet);
          const sh = await page.evaluate(() => { const s = document.querySelector("#his-sheet"); return { h: s.querySelector("#his-l-title").textContent, lang: s.querySelector("#his-l-title").getAttribute("lang"), text: s.textContent, words: s.querySelectorAll(".his-words li").length, au: !!s.querySelector(".his-sh-head .au-btn"), focus: document.activeElement.id }; });
          const l0 = s.nodes[s.start].lines[0];
          check("[A] tocar una línea abre su hoja: la línea (yua), su traducción y sus palabras con glosa", sh.h === l0.m && sh.lang === "yua" && sh.text.includes(l0.es) && sh.words >= 1 && sh.focus === "his-close", sh.text.slice(0, 100));
          check("[A] la hoja trae el audio de la línea cuando existe (igual que la burbuja)", sh.au === (ln.au > 0), "audio en hoja: " + sh.au + " · botones en burbujas: " + ln.au);
          const gl = await page.evaluate((m) => window.__koox.historias.glosses(m), "Ma'alob, kux teech?");
          check("[A] glosas por palabra emparejadas con el vocabulario", gl.length >= 2 && gl.every((g) => g.id), JSON.stringify(gl));
          await noOverflow(page, "la hoja de la línea", cfg);
          await page.goBack();
          await page.waitForFunction(() => !window.__koox.historias.view().sheet);
          check("[A] Atrás cierra primero la hoja y deja la historia abierta", (await view(page)).view === "play");
          await page.click('#his-root [data-act="hint"]').catch(() => {});
        }
        const r = await playPath(page, cfg, s, p, wrongAt);
        if (r.err) { check("[A] " + s.id + " camino " + (k + 1), false, r.err); continue; }
        nPaths++;
        const v = await view(page), state = await st(page), d = state.x.historias && state.x.historias.done[s.id];
        const sum = await page.evaluate(() => { const e = document.querySelector("#his-sum"); const x = document.querySelector("#his-xp"); return { t: e && e.textContent, xp: x && x.textContent, gami: !!(x && x.classList.contains("gami")) }; });
        check("[A] " + s.id + " camino " + (k + 1) + " (" + p.join("→") + ") termina con el resumen «elegiste bien a la primera " + r.firstOk + " de " + p.length + "»",
          v.result && v.result.good === r.firstOk && v.result.of === p.length && sum.t.includes("Elegiste bien a la primera " + r.firstOk + " de " + p.length), sum.t);
        if (k === 0) {
          check("[A] " + s.id + ": +5 XP la primera vez (addXP), mostrado con .gami", state.xp === xp0 + 5 && sum.xp === "+5 XP" && sum.gami, xp0 + " → " + state.xp);
          check("[A] " + s.id + ": guardado en state.x.historias", d && d.n === 1 && d.best === r.firstOk && d.of === p.length && d.last === dayKey(new Date()), JSON.stringify(d));
          if (s === STORIES[0]) await noOverflow(page, "el resumen", cfg);
          if (SHOTS && s === STORIES[0]) { await page.goBack(); await page.waitForFunction(() => window.__koox.historias.view().view === "list"); }
          if (SHOTS && s === STORIES[0]) {
            // Captura de una retroalimentación (no apropiada) a 360 px claro.
            await tap(page, cfg, '#his-root .his-card[data-id="' + s.id + '"]');
            await page.waitForFunction(() => window.__koox.historias.view().view === "play");
            await tap(page, cfg, '#his-root .his-opt[data-c="1"]');
            await page.waitForSelector("#his-fb");
            await page.screenshot({ path: path.join(SHOTS, "historias-360-claro.png") });
            await playPath(page, cfg, s, p, -1);
          }
        } else {
          check("[A] " + s.id + " camino " + (k + 1) + ": sin XP la segunda vez y cuenta otra vuelta", state.xp === xp0 && !sum.xp && d && d.n === k + 1 + (SHOTS && s === STORIES[0] ? 1 : 0), xp0 + " → " + state.xp + " · n=" + (d && d.n));
          check("[A] " + s.id + ": el mejor resultado se queda con el máximo", d.best === p.length, JSON.stringify(d));
        }
        xp0 = state.xp;
      }
      await page.goBack();
      await page.waitForFunction(() => window.__koox.historias.view().view === "list");
    }
    check("[A] se jugaron todos los caminos de las 3 historias (" + nPaths + ")", nPaths === STORIES.reduce((t, s) => t + paths(s).out.length, 0));
    const chips = await page.evaluate(() => document.querySelectorAll("#his-root .his-card .ls-chip.done").length);
    check("[A] la lista marca las 3 como «Terminada»", chips === 3);
    await page.goBack();
    await page.waitForFunction(() => !window.__koox.historias.view().open && window.__koox.screen() === "home");
    check("[A] Atrás desde la lista vuelve a Inicio con el foco en la tarjeta", (await page.evaluate(() => document.activeElement.id)) === "btn-home-stories");
    // Persistencia: recarga sin volver a sembrar.
    const before = (await st(page)).x.historias;
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => window.__koox && window.__koox.historias);
    const after = (await st(page)).x.historias;
    check("[A] persistencia: state.x.historias sobrevive a la recarga", same(before, after) && Object.keys(after.done).length === 3, JSON.stringify(after).slice(0, 160));
    await tab(page, cfg, "perfil");
    const pf = await page.evaluate(() => { const e = document.querySelector("#his-prof"); return e && e.textContent; });
    check("[A] Perfil: «Historias terminadas: 3 de 3»", pf && /Historias terminadas:\s*3\s*de 3/.test(pf), pf);
    check("[A] sin errores de consola", !page.errors.length, page.errors.join(" | "));
    const fbc = await page.evaluate(() => { const d = document.createElement("i"); d.style.color = "var(--ok-soft)"; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; });
    fbLight = fbc;
    await ctx.close();
  }

  /* ---- B) 360 px oscuro y modo tranquilo: colores del tema, sin scroll horizontal, XP oculto ---- */
  {
    const cfg = { name: "360-oscuro", viewport: { width: 360, height: 780 }, mobile: true, scheme: "dark" };
    log("\n▸ oscuro y modo tranquilo (" + cfg.name + ")");
    const { ctx, page } = await newPage(browser, cfg);
    const s0 = seedState(); s0.settings.calm = true;
    await load(page, url, s0);
    await tap(page, cfg, "#btn-home-stories");
    await page.waitForFunction(() => window.__koox.historias.view().open);
    const s = STORIES[2], p = paths(s).out[0];
    await tap(page, cfg, '#his-root .his-card[data-id="' + s.id + '"]');
    await page.waitForFunction(() => window.__koox.historias.view().view === "play");
    const ok = s.nodes[s.start].choices.findIndex((c) => c.ok);
    await tap(page, cfg, '#his-root .his-opt[data-c="' + ok + '"]');
    await page.waitForSelector("#his-fb.ok");
    const col = await page.evaluate(() => { const probe = (v) => { const d = document.createElement("i"); d.style.color = "var(" + v + ")"; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; };
      return { fb: getComputedStyle(document.querySelector("#his-fb")).backgroundColor, ok: probe("--ok-soft"), bg: getComputedStyle(document.querySelector("#his-root")).backgroundColor, tbg: probe("--bg") }; });
    check("[B] la retroalimentación y el fondo usan los tokens del tema oscuro", col.fb === col.ok && col.bg === col.tbg && col.ok !== fbLight, JSON.stringify(col));
    await noOverflow(page, "la historia en oscuro", cfg);
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, "historias-360-oscuro.png") });
    await tap(page, cfg, "#his-next");
    await page.waitForFunction((x) => window.__koox.historias.view().node === x, p[1]);
    const r = await playPath(page, cfg, s, p.slice(1), -1);
    const xpVis = await visible(page, "#his-xp");
    const stt = await st(page);
    check("[B] modo tranquilo: termina, guarda y suma XP, pero el «+5 XP» (.gami) no se ve", !r.err && (await page.$("#his-xp")) && !xpVis && stt.x.historias.done[s.id].n === 1, r.err || "");
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => window.__koox.historias.view().view === "list");
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !window.__koox.historias.view().open && window.__koox.screen() === "home");
    check("[B] Escape cierra una capa a la vez (resumen → lista → inicio)", true);
    check("[B] sin errores de consola", !page.errors.length, page.errors.join(" | "));
    await ctx.close();
  }
  await browser.close();
}

contenido();
main().then(() => {
  const fails = results.filter((r) => !r.pass);
  log("\n" + (results.length - fails.length) + " de " + results.length + " comprobaciones correctas en " + ((Date.now() - T0) / 1000).toFixed(1) + " s");
  if (fails.length) { log("FALLAN " + fails.length + ":"); fails.forEach((f) => log("  ✗ " + f.name + (f.detail ? " — " + f.detail : ""))); process.exit(1); }
}).catch((e) => { console.error("ERROR en la prueba:", e && e.stack || e); process.exit(1); });
