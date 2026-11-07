#!/usr/bin/env node
// Pruebas del módulo «Mi milpa» (Chromium headless con Playwright).
//   node test/milpa.cjs <ruta.html>        el html del Artifact (se envuelve como lo hace la plataforma)
// Antes revisa, sin navegador, que milpa.js y milpa.css no lleven colores sueltos, emojis ni imágenes externas.
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
if (!target) { console.error("Uso: node test/milpa.cjs <ruta.html>"); process.exit(2); }
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
  const css = read("milpa.css").replace(/\/\*[\s\S]*?\*\//g, ""), js = read("milpa.js");
  const lit = css.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(|\bcolor\(|\b(white|black)\b/g);
  check("[fuentes] milpa.css usa solo tokens del tema (var(--…)), sin colores sueltos", !lit, lit ? lit.join(" ") : (css.match(/var\(--/g) || []).length + " usos de tokens");
  const litJs = js.match(/(fill|stroke|color|background)\s*[=:]\s*["']?\s*(#|rgb|hsl)|\brgba?\(|\bhsla?\(/g);
  check("[fuentes] milpa.js no escribe colores (los pone el CSS por clase)", !litJs, litJs && litJs.join(" "));
  check("[fuentes] sin imágenes externas ni librerías (ni <img>, ni url(), ni src=)", !/<img|url\(|\bsrc=|https?:\/\//.test(js + css));
  check("[fuentes] sin emojis ni </script", !EMOJI.test(js + css) && !/<\/script|<!--/i.test(js + css));
  check("[fuentes] respeta prefers-reduced-motion (la animación solo va con no-preference)", /@media \(prefers-reduced-motion: no-preference\)[\s\S]*animation/.test(css) && (css.match(/animation:/g) || []).length === 1);
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
  const file = path.join(path.dirname(SRC), path.basename(SRC).replace(/\.html?$/i, "") + ".milpa.preview.html");
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
  await page.waitForFunction(() => window.__koox && typeof window.__koox.screen === "function" && window.__koox.milpa, null, { timeout: 8000 });
  await page.evaluate(([k, s]) => { if (s === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(s)); }, [STORE, seed]);
  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(() => window.__koox && window.__koox.milpa, null, { timeout: 8000 });
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
    const ml = document.querySelector("#ml-root:not([hidden])");
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

async function main() {
  prepareFonts();
  const browser = await chromium.launch();
  const url = preview();
  const N = 72;
  let kindsLight = null, leafLight = null;

  /* ---- A) Sin palabras en repaso ---- */
  {
    const cfg = { name: "360-claro", viewport: { width: 360, height: 780 }, mobile: true, scheme: "light" };
    log("\n▸ sin palabras: estado vacío (" + cfg.name + ")");
    const { ctx, page } = await newPage(browser, cfg);
    await load(page, url, EMPTY);
    const card = await page.evaluate(() => { const b = document.querySelector("#btn-home-milpa"); return b ? { text: b.textContent, label: b.getAttribute("aria-label"), gami: b.classList.contains("gami"), mini: b.querySelectorAll(".ml-p").length } : null; });
    check("[A] tarjeta «Mi milpa» en Inicio (marcada .gami) con la invitación a sembrar", card && card.gami && /Siembra tu milpa: termina una lección y aparecerá tu primera planta/.test(card.text) && card.mini === 0, card && card.text);
    check("[A] la tarjeta vacía tiene aria-label", card && /todavía sin plantas/.test(card.label || ""), card && card.label);
    check("[A] el resumen vacío es 0 plantas", same(await page.evaluate(() => window.__koox.milpa.summary()), { total: 0, ready: 0, byStage: [0, 0, 0, 0, 0] }));
    await tap(page, cfg, "#btn-home-milpa");
    await page.waitForFunction(() => window.__koox.milpa.view().open);
    const empty = await page.evaluate(() => { const e = document.querySelector("#ml-root .ml-empty"); return e ? e.textContent : null; });
    check("[A] la vista completa muestra el estado vacío amable, sin plantas ni botón de cosecha", empty && /Siembra tu milpa/.test(empty) && !(await page.$("#ml-root .ml-plant")) && !(await page.$("#ml-harvest")), empty);
    check("[A] la vista abierta es la pantalla «milpa»", (await page.evaluate(() => window.__koox.screen())) === "milpa");
    await noOverflow(page, "la vista vacía", cfg);
    await page.goBack();
    await page.waitForFunction(() => !window.__koox.milpa.view().open && window.__koox.screen() === "home");
    check("[A] Atrás cierra la vista y vuelve a Inicio", true);
    check("[A] el módulo no crea estado propio (state.x.milpa)", (await page.evaluate(() => window.__koox.state().x.milpa)) === undefined);
    await tab(page, cfg, "perfil");
    const prof = await page.evaluate(() => { const s = document.querySelector("#milpa"); return s ? s.textContent : null; });
    check("[A] Perfil → «Mi milpa» con el mensaje de sembrar", prof && /Siembra tu milpa/.test(prof), prof);
    check("[A] sin errores de consola", !page.errors.length, page.errors.join(" | "));
    await ctx.close();
  }

  /* ---- B) Con palabras: etapas, cosecha, hoja, Atrás, accesibilidad (claro y oscuro) ---- */
  for (const cfg of [
    { name: "360-claro", viewport: { width: 360, height: 780 }, mobile: true, scheme: "light" },
    { name: "360-oscuro", viewport: { width: 360, height: 780 }, mobile: true, scheme: "dark", motion: "reduce" }
  ]) {
    log("\n▸ " + N + " palabras en repaso (" + cfg.name + (cfg.motion ? ", movimiento reducido" : "") + ")");
    const { ctx, page } = await newPage(browser, cfg);
    await load(page, url, seedState(N));
    const srs = (await page.evaluate(() => window.__koox.state())).srs, t = addDays(0);
    const ids = Object.keys(srs);
    const exp = Object.fromEntries(ids.map((id) => [id, { stage: Math.min(5, Math.max(1, srs[id].box)), ready: srs[id].due <= t }]));
    const nReady = ids.filter((id) => exp[id].ready).length;
    check("[" + cfg.name + "] el estado sembrado tiene las " + N + " palabras", ids.length === N, ids.length);
    const card = await page.evaluate(() => { const b = document.querySelector("#btn-home-milpa"); return b ? { label: b.getAttribute("aria-label"), text: b.textContent, mini: b.querySelectorAll(".ml-mini .ml-p").length, marks: b.querySelectorAll(".ml-mark").length } : null; });
    check("[" + cfg.name + "] tarjeta: «" + N + " plantas · " + nReady + " listas para cosechar» en texto y aria-label", card && card.text.includes(N + " plantas · " + nReady + " listas para cosechar") && card.label.includes(N + " plantas · " + nReady + " listas"), card && card.label);
    check("[" + cfg.name + "] mini fila de 10 plantas, primero las listas (todas con marca dorada)", card && card.mini === 10 && card.marks === 10, card && card.mini + " / " + card.marks);
    const sz1 = await sizes(page, "#btn-home-milpa");
    check("[" + cfg.name + "] la tarjeta mide 44 px o más", sz1.length === 1 && sz1[0] >= 44, sz1.join(","));
    await noOverflow(page, "Inicio con la tarjeta", cfg);
    if (SHOTS && cfg.scheme === "light") {
      await page.evaluate(() => document.querySelector("#btn-home-milpa").scrollIntoView({ block: "center" }));
      await page.screenshot({ path: path.join(SHOTS, "milpa-inicio-360-claro.png") });
    }

    await tap(page, cfg, "#btn-home-milpa");
    await page.waitForFunction(() => window.__koox.milpa.view().open);
    const drawn = await page.evaluate(() => [...document.querySelectorAll("#ml-root .ml-plant")].map((b) => ({
      id: b.getAttribute("data-id"), stage: Number((b.className.match(/\bst-(\d)\b/) || [])[1]), ready: b.classList.contains("ml-ready"),
      kind: (b.className.match(/\bml-(maiz|frijol|calabaza)\b/) || [])[1], mark: !!b.querySelector(".ml-mark"),
      seed: !!b.querySelector(".ml-seed"), stem: !!b.querySelector(".ml-stem"), flower: !!b.querySelector(".ml-flower, .ml-flower-s"), fruit: !!b.querySelector(".ml-fruit, .ml-pod"),
      label: b.getAttribute("aria-label") })));
    check("[" + cfg.name + "] ninguna palabra desaparece: " + N + " plantas, una por palabra, incluidas las de nivel 0 y las vencidas", drawn.length === N && same(drawn.map((d) => d.id).sort(), ids.slice().sort()), drawn.length);
    const badStage = drawn.filter((d) => d.stage !== exp[d.id].stage);
    check("[" + cfg.name + "] cada planta está en la etapa de su nivel (box 0–1 semilla … 5 con fruto)", !badStage.length, badStage.slice(0, 3).map((d) => d.id + ":" + d.stage).join(" "));
    const badArt = drawn.filter((d) => (d.stage === 1 ? !(d.seed && !d.stem) : !d.stem || d.seed) || (d.stage >= 4) !== d.flower || (d.stage === 5) !== d.fruit);
    check("[" + cfg.name + "] el dibujo corresponde a la etapa (semilla; tallo desde brote; flor desde «en flor»; fruto solo «con fruto»)", !badArt.length, badArt.slice(0, 3).map((d) => d.id + ":" + d.stage).join(" "));
    const badReady = drawn.filter((d) => d.ready !== exp[d.id].ready || d.mark !== d.ready || d.ready !== /lista para cosechar/.test(d.label));
    check("[" + cfg.name + "] vencidas (hoy o antes) = listas para cosechar, con marca dorada y en el aria-label (" + nReady + ")", !badReady.length && drawn.filter((d) => d.ready).length === nReady, badReady.slice(0, 3).map((d) => d.id).join(" "));
    const ns = Object.fromEntries(["maiz", "frijol", "calabaza"].map((k) => [k, drawn.filter((d) => d.kind === k).length]));
    check("[" + cfg.name + "] la milpa tiene maíz, frijol y calabaza", ns.maiz > 0 && ns.frijol > 0 && ns.calabaza > 0, JSON.stringify(ns));
    const kinds = Object.fromEntries(drawn.map((d) => [d.id, d.kind]));
    if (!kindsLight) kindsLight = kinds; else check("[" + cfg.name + "] el tipo de planta es determinista por id (igual en otra sesión)", same(kinds, kindsLight));
    const txt = await page.evaluate(() => document.querySelector("#ml-root").textContent);
    check("[" + cfg.name + "] sin lenguaje de pérdida ni culpa (marchit-, muert-, perdi-, monedas)", !/marchit|muert|muere|perdi|moneda|ranking/i.test(txt.replace(/nunca se marchita/g, "")));
    const groups = await page.evaluate(() => [...document.querySelectorAll("#ml-root .ml-unit")].map((s) => s.querySelectorAll(".ml-plant").length));
    check("[" + cfg.name + "] agrupada por unidad (" + groups.length + " grupos que suman " + N + ")", groups.length >= 2 && groups.reduce((a, b) => a + b, 0) === N, groups.join("+"));
    const leg = await page.evaluate(() => [...document.querySelectorAll("#ml-root .ml-stages .ml-st-n")].map((e) => Number(e.textContent)));
    const expLeg = [1, 2, 3, 4, 5].map((s) => ids.filter((id) => exp[id].stage === s).length);
    check("[" + cfg.name + "] resumen por etapa correcto", same(leg, expLeg), leg.join(",") + " vs " + expLeg.join(","));
    const sum = await page.evaluate(() => { const s = document.querySelector("#ml-sum"); return s && s.getAttribute("aria-label"); });
    check("[" + cfg.name + "] el resumen de la vista tiene aria-label con conteos", sum === N + " plantas · " + nReady + " listas para cosechar", sum);
    const tg = await sizes(page, "#ml-root .ml-plant, #ml-root button");
    check("[" + cfg.name + "] objetivos táctiles de la vista ≥ 44 px", tg.length > N && tg.every((x) => x >= 44), Math.min(...tg) + " px mínimo");
    await noOverflow(page, "la vista completa", cfg);
    // Colores: salen de los tokens (cambian con el tema).
    const col = await page.evaluate(() => {
      const b = document.querySelector("#ml-root .ml-plant.st-3 .ml-leaf, #ml-root .ml-plant.st-3 .ml-leaf-l"), m = document.querySelector("#ml-root .ml-mark");
      const probe = (v) => { const d = document.createElement("i"); d.style.color = "var(" + v + ")"; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; };
      return { leaf: getComputedStyle(b).fill, ok: probe("--ok"), mark: getComputedStyle(m).fill, kanHi: probe("--kan-hi"), anim: getComputedStyle(m).animationName };
    });
    check("[" + cfg.name + "] hojas y marca dorada usan los tokens --ok y --kan-hi del tema", col.leaf === col.ok && col.mark === col.kanHi, JSON.stringify(col));
    if (cfg.scheme === "light") leafLight = col.leaf; else check("[oscuro] el verde de las hojas cambia con el tema", col.leaf !== leafLight, leafLight + " → " + col.leaf);
    check("[" + cfg.name + "] marca dorada: " + (cfg.motion ? "sin animación con movimiento reducido" : "brillo suave"), cfg.motion ? col.anim === "none" : col.anim === "ml-glow", col.anim);
    // Foco visible con el teclado.
    await page.keyboard.press("Tab");
    const fo = await page.evaluate(() => { const a = document.activeElement; return { id: a.id, inside: !!a.closest("#ml-root"), outline: getComputedStyle(a).outlineStyle, w: getComputedStyle(a).outlineWidth }; });
    check("[" + cfg.name + "] el foco con teclado queda dentro de la vista y se ve", fo.inside && fo.outline !== "none" && parseFloat(fo.w) >= 2, JSON.stringify(fo));
    if (SHOTS && cfg.scheme === "dark") await page.screenshot({ path: path.join(SHOTS, "milpa-vista-360-oscuro.png") });

    // Tocar una planta: la palabra, su significado y su nivel.
    const pick = drawn.find((d) => d.stage === 5 && d.ready) || drawn[0];
    const v = VOCAB.find((x) => x.id === pick.id);
    await page.evaluate((id) => document.querySelector('#ml-root .ml-plant[data-id="' + id + '"]').scrollIntoView({ block: "center" }), pick.id);
    await tap(page, cfg, '#ml-root .ml-plant[data-id="' + pick.id + '"]');
    await page.waitForFunction(() => window.__koox.milpa.view().sheet);
    const sh = await page.evaluate(() => { const h = document.querySelector("#ml-w-title"), s = document.querySelector("#ml-sheet"); return { m: h.textContent, lang: h.getAttribute("lang"), cls: h.classList.contains("m"), text: s.textContent, focus: document.activeElement.id }; });
    check("[" + cfg.name + "] la hoja muestra la forma maya (lang=yua, .m), el significado y el nivel", sh.m === v.m && sh.lang === "yua" && sh.cls && sh.text.includes(v.es) && sh.text.includes("Nivel " + pick.stage + " de 5") && /Lista para cosechar hoy/.test(sh.text), sh.text.slice(0, 120));
    check("[" + cfg.name + "] el foco pasa a la hoja (Cerrar ≥ 44 px)", sh.focus === "ml-close" && (await sizes(page, "#ml-close"))[0] >= 44);
    await noOverflow(page, "la hoja de la planta", cfg);
    await page.goBack();
    await page.waitForFunction(() => !window.__koox.milpa.view().sheet);
    check("[" + cfg.name + "] Atrás cierra primero la hoja y deja la vista abierta", (await page.evaluate(() => window.__koox.milpa.view().open)) && (await page.evaluate(() => window.__koox.screen())) === "milpa");
    await page.goBack();
    await page.waitForFunction(() => !window.__koox.milpa.view().open && window.__koox.screen() === "home");
    check("[" + cfg.name + "] Atrás otra vez cierra la vista y vuelve a Inicio, con el foco en la tarjeta", (await page.evaluate(() => document.activeElement.id)) === "btn-home-milpa");

    // Perfil: sección corta que abre la misma vista.
    await tab(page, cfg, "perfil");
    const pf = await page.evaluate(() => { const s = document.querySelector("#milpa"); return s ? { text: s.textContent, lab: s.getAttribute("aria-labelledby"), n: [...s.querySelectorAll(".ml-st-n")].map((e) => Number(e.textContent)) } : null; });
    check("[" + cfg.name + "] Perfil → «Mi milpa» con conteos por etapa", pf && pf.text.includes(N + " plantas · " + nReady + " listas") && same(pf.n, expLeg) && pf.lab === "milpa-title", pf && pf.n.join(","));
    check("[" + cfg.name + "] botón «Ver mi milpa» ≥ 44 px", (await sizes(page, "#btn-profile-milpa"))[0] >= 44);
    await noOverflow(page, "Perfil", cfg);

    // Cosechar: abre el repaso existente.
    await tap(page, cfg, "#btn-profile-milpa");
    await page.waitForFunction(() => window.__koox.milpa.view().open);
    const hv = await page.evaluate(() => document.querySelector("#ml-harvest").textContent);
    check("[" + cfg.name + "] botón «Cosechar (repasar " + nReady + ")»", hv === "Cosechar (repasar " + nReady + ")", hv);
    await tap(page, cfg, "#ml-harvest");
    await page.waitForFunction(() => document.body.classList.contains("in-session"));
    const after = await page.evaluate(() => ({ open: window.__koox.milpa.view().open, screen: window.__koox.screen(), locked: document.body.classList.contains("ml-open"), hist: history.state && history.state.koox }));
    check("[" + cfg.name + "] «Cosechar» cierra la milpa y abre el repaso (la sesión toma la entrada de historial)", !after.open && !after.locked && !["home", "profile", "milpa"].includes(after.screen) && after.hist === "s", JSON.stringify(after));
    check("[" + cfg.name + "] sin errores de consola", !page.errors.length, page.errors.join(" | "));
    await ctx.close();
  }

  /* ---- C) Modo tranquilo ---- */
  {
    const cfg = { name: "360-tranquilo", viewport: { width: 360, height: 780 }, mobile: true, scheme: "light" };
    log("\n▸ modo tranquilo (" + cfg.name + ")");
    const { ctx, page } = await newPage(browser, cfg);
    const st = seedState(20); st.settings.calm = true;
    await load(page, url, st);
    check("[C] el modo tranquilo oculta la tarjeta de Inicio (.gami)", (await page.$("#btn-home-milpa")) && !(await visible(page, "#btn-home-milpa")));
    await tab(page, cfg, "perfil");
    check("[C] decisión: la sección de Perfil sigue visible (sin .gami) y abre la vista completa", (await visible(page, "#milpa")) && !(await page.$("#milpa.gami, #milpa .gami")));
    await tap(page, cfg, "#btn-profile-milpa");
    await page.waitForFunction(() => window.__koox.milpa.view().open);
    check("[C] en modo tranquilo la vista completa muestra las 20 plantas", (await page.$$("#ml-root .ml-plant")).length === 20);
    await noOverflow(page, "la vista en modo tranquilo", cfg);
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !window.__koox.milpa.view().open && window.__koox.screen() === "profile");
    check("[C] Escape cierra y vuelve a Perfil con el foco en «Ver mi milpa»", (await page.evaluate(() => document.activeElement.id)) === "btn-profile-milpa");
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
