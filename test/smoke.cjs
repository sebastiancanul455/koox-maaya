#!/usr/bin/env node
// Pruebas de humo end-to-end de Ko'ox Maaya con Playwright (Chromium headless).
//   node test/smoke.cjs <ruta.html>
// Acepta el html del Artifact (lo envuelve como la plataforma) o un documento completo que empiece
// con <!doctype (la versión web, site/index.html), que se abre tal cual.
// Capturas en test/shots, o en la carpeta de la variable de entorno KOOX_SHOTS.
// Si la página trae audio (window.COURSE_AUDIO) o recursos (window.COURSE_RESOURCES), prueba sus
// botones, «Escucha y elige», «Para escuchar más» y los créditos; si no, que no aparezca nada de eso.
// Sale con código 1 si algo falla.
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright");

const target = process.argv[2];
if (!target) { console.error("Uso: node test/smoke.cjs <ruta.html>"); process.exit(2); }
const SRC = path.resolve(target);
const SHOTS = process.env.KOOX_SHOTS ? path.resolve(process.env.KOOX_SHOTS) : path.join(__dirname, "shots");
const FONT_DIR = path.join(__dirname, ".fontcache");
fs.mkdirSync(SHOTS, { recursive: true });

const T0 = Date.now();
const results = [];
function check(name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail == null ? "" : String(detail) });
  if (!pass || process.env.VERBOSE) console.log("  " + (pass ? "✓" : "✗") + " " + name + (detail ? " — " + detail : ""));
  return !!pass;
}
const log = (s) => console.log(s);

// ---------- Vista previa con el esqueleto que agrega la plataforma ----------
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

// ---------- Caché local de Google Fonts (para capturas fieles; si falla, se usan las de respaldo) ----------
const UA = "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36";
const fontMap = new Map();
function hash(s) { return crypto.createHash("sha1").update(s).digest("hex").slice(0, 16); }
function curl(url, out) {
  execFileSync("curl", ["-sS", "-f", "-L", "-m", "15", "-A", UA, "-o", out, url], { stdio: "ignore" });
}
function prepareFonts() {
  const m = /https:\/\/fonts\.googleapis\.com\/css2\?[^"'<>\s]+/.exec(html);
  if (!m) return "sin hoja de fuentes";
  const cssUrl = m[0].replace(/&amp;/g, "&");
  try {
    fs.mkdirSync(FONT_DIR, { recursive: true });
    const cssFile = path.join(FONT_DIR, hash(cssUrl) + ".css");
    if (!fs.existsSync(cssFile)) curl(cssUrl, cssFile);
    const css = fs.readFileSync(cssFile, "utf8");
    fontMap.set(cssUrl, { file: cssFile, type: "text/css; charset=utf-8" });
    const urls = css.match(/https:\/\/fonts\.gstatic\.com\/[^)'"\s]+/g) || [];
    for (const u of new Set(urls)) {
      const f = path.join(FONT_DIR, hash(u) + ".woff2");
      if (!fs.existsSync(f)) { try { curl(u, f); } catch (e) { continue; } }
      fontMap.set(u, { file: f, type: "font/woff2" });
    }
    return fontMap.size - 1 + " archivos de fuente en caché";
  } catch (e) {
    return "no se pudieron descargar las fuentes (" + e.message.split("\n")[0] + "); se usan las de respaldo";
  }
}

// ---------- Utilidades de página ----------
async function newPage(browser, cfg) {
  const ctx = await browser.newContext({
    viewport: cfg.viewport, isMobile: !!cfg.mobile, hasTouch: !!cfg.mobile, colorScheme: cfg.scheme, deviceScaleFactor: 1
  });
  await ctx.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) => {
    const hit = fontMap.get(route.request().url());
    if (hit) return route.fulfill({ status: 200, contentType: hit.type, headers: { "access-control-allow-origin": "*" }, body: fs.readFileSync(hit.file) });
    return route.abort();
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(6000);
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
  await page.waitForFunction(() => window.__koox && typeof window.__koox.screen === "function", null, { timeout: 5000 });
  await page.evaluate(() => document.fonts && document.fonts.ready);
}
const scr = (page) => page.evaluate(() => window.__koox.screen());
// Además del scrollWidth, busca elementos que se salgan del ancho visible (aunque algo los recorte).
async function overflow(page) {
  return page.evaluate(() => {
    const d = document.documentElement, b = document.body, vw = d.clientWidth;
    const bad = [];
    for (const el of document.querySelectorAll("body *")) {
      if (el.closest(".table-wrap, .chips, svg, .sr-only")) continue; // contenedores con scroll propio
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      if (r.right > vw + 1 || r.left < -1) {
        bad.push((el.id ? "#" + el.id : el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : "")) +
          " [" + Math.round(r.left) + "→" + Math.round(r.right) + "]");
        if (bad.length >= 4) break;
      }
    }
    return { sw: Math.max(d.scrollWidth, b.scrollWidth), cw: vw, bad };
  });
}
async function checkOverflow(page, cfg, where) {
  const o = await overflow(page);
  return check("[" + cfg.name + "] sin scroll horizontal en " + where, o.sw <= o.cw + 1 && !o.bad.length,
    "scrollWidth " + o.sw + " / ancho " + o.cw + (o.bad.length ? " · se salen: " + o.bad.join(", ") : ""));
}
async function tap(page, cfg, sel) {
  if (cfg.mobile) await page.tap(sel); else await page.click(sel);
}
async function shot(page, cfg, name, full) {
  if (!cfg.shots) return;
  await page.waitForTimeout(260); // deja terminar las microanimaciones de entrada
  // Espera también a las animaciones finitas más largas (anillo y greca de resultados,
  // diálogo escalonado) para que la captura muestre el estado final; máximo 2.5 s.
  await page.evaluate(() => {
    const finite = (document.getAnimations ? document.getAnimations() : []).filter((a) => {
      try { return isFinite(a.effect.getComputedTiming().endTime); } catch (e) { return false; }
    });
    return Promise.race([
      Promise.all(finite.map((a) => a.finished.catch(() => null))),
      new Promise((r) => setTimeout(r, 2500)),
    ]);
  });
  await page.screenshot({ path: path.join(SHOTS, name + "-" + cfg.scheme + ".png"), fullPage: !!full });
}
async function gotoTab(page, cfg, t) {
  await tap(page, cfg, "#tab-" + t);
  await page.waitForFunction((v) => window.__koox.screen() === v, { aprender: "home", repasar: "review", diccionario: "dict", perfil: "profile" }[t]);
}
async function openLesson(page, cfg, id) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await tap(page, cfg, '[data-lesson="' + id + '"]');
  await page.waitForSelector("#lesson-sheet:not([hidden]) #btn-start-lesson");
  await tap(page, cfg, "#btn-start-lesson");
  await page.waitForFunction(() => ["teach", "vocab", "dialogue", "exercise"].includes(window.__koox.screen()));
}

// Recorre la sesión actual en la página, sin pausas, hasta la pantalla de resultados.
// Los ejercicios type se contestan con apóstrofo tipográfico (’) para probar la normalización.
function fastRunInPage() {
  const K = window.__koox, q = (s) => document.querySelector(s);
  const out = { ok: false, steps: 0, ex: 0, typeCurly: 0, types: {} };
  for (let guard = 0; guard < 600; guard++) {
    const s = K.screen();
    out.steps++;
    if (s === "results") { out.ok = true; return out; }
    if (s === "teach" || s === "vocab" || s === "dialogue") { q("#btn-next").click(); continue; }
    if (s === "exercise") {
      const p = K.peek();
      out.ex++; out.types[p.type] = (out.types[p.type] || 0) + 1;
      if (p.type === "type" && p.answer && p.answer.indexOf("'") >= 0) {
        const inp = q("#type-answer");
        inp.value = p.answer.replace(/'/g, "’");
        inp.dispatchEvent(new Event("input", { bubbles: true }));
        out.typeCurly++;
      } else if (!K.solve()) { out.error = "solve() no pudo contestar " + p.type; return out; }
      if (K.screen() === "exercise") {
        const b = q("#btn-check");
        if (!b || b.disabled || b.hidden) { out.error = "Comprobar no disponible en " + p.type; return out; }
        b.click();
      }
      if (K.screen() !== "feedback") { out.error = "sin retroalimentación tras comprobar " + p.type; return out; }
      if (q("#feedback").classList.contains("bad")) { out.error = "respuesta marcada incorrecta en " + p.type + " (" + p.answer + ")"; return out; }
      continue;
    }
    if (s === "feedback") { q("#btn-continue").click(); continue; }
    out.error = "pantalla inesperada: " + s; return out;
  }
  out.error = "demasiados pasos"; return out;
}

// Recorre la sesión con clics reales y toma capturas de cada tipo de pantalla.
async function stepRun(page, cfg, cap, opts) {
  opts = opts || {};
  let wrongDone = !opts.wrongOnce, overflowDone = {};
  for (let guard = 0; guard < 400; guard++) {
    const s = await scr(page);
    if (!overflowDone[s] && s !== "results") { overflowDone[s] = 1; await checkOverflow(page, cfg, "lección (" + s + ")"); }
    if (opts.stopWhen && opts.stopWhen(cap)) return "stopped";
    if (s === "results") {
      if (!cap.results) { cap.results = 1; await page.waitForTimeout(900); await shot(page, cfg, "results"); }
      await checkOverflow(page, cfg, "resultados");
      return "results";
    }
    if (s === "teach" || s === "vocab" || s === "dialogue") {
      let key = s;
      if (s === "teach") key = "teach-" + (await page.evaluate(() => (document.querySelector(".teach").className.split(" ")[1] || "x")));
      if (!cap[key]) { cap[key] = 1; await shot(page, cfg, key); }
      if (s === "dialogue" && !cap["dialogue-open"]) {
        await tap(page, cfg, "#line-0");
        cap["dialogue-open"] = 1; await shot(page, cfg, "dialogue-open");
      }
      await tap(page, cfg, "#btn-next");
      continue;
    }
    if (s === "exercise") {
      const p = await page.evaluate(() => window.__koox.peek());
      const key = "ex-" + p.type;
      const first = !cap[key];
      if (first) { cap[key] = 1; await shot(page, cfg, key); }
      if (!wrongDone && p.type === "choice") {
        await page.evaluate(() => window.__koox.solve(true));
        await tap(page, cfg, "#btn-check");
        wrongDone = true;
        check("[" + cfg.name + "] respuesta incorrecta muestra hoja roja", await page.evaluate(() => document.querySelector("#feedback").classList.contains("bad") && window.__koox.screen() === "feedback"));
        const fbTxt = await page.evaluate(() => ({ t: document.querySelector("#fb-body .fb-title").textContent, l: document.querySelector("#fb-body").textContent }));
        check("[" + cfg.name + "] la hoja roja dice «No es correcto» y etiqueta la respuesta", /No es correcto/.test(fbTxt.t) && /Respuesta correcta:/.test(fbTxt.l), JSON.stringify(fbTxt));
        if (!cap["feedback-bad"]) { cap["feedback-bad"] = 1; await shot(page, cfg, "feedback-bad"); }
        await tap(page, cfg, "#btn-continue");
        continue;
      }
      if (p.type === "type") {
        const typed = p.answer.replace(/'/g, "’");
        await page.fill("#type-answer", typed);
      } else {
        await page.evaluate(() => window.__koox.solve());
      }
      if (first && (p.type === "build" || p.type === "fill" || p.type === "type")) await shot(page, cfg, key + "-answered");
      if ((await scr(page)) === "exercise") await tap(page, cfg, "#btn-check");
      const fb = await page.evaluate(() => ({ s: window.__koox.screen(), bad: document.querySelector("#feedback").classList.contains("bad") }));
      check("[" + cfg.name + "] " + p.type + " correcto se acepta" + (p.type === "type" ? " (con ’)" : ""), fb.s === "feedback" && !fb.bad, JSON.stringify(p));
      if (!cap["feedback-ok"]) { cap["feedback-ok"] = 1; await shot(page, cfg, "feedback-ok"); }
      await tap(page, cfg, "#btn-continue");
      continue;
    }
    if (s === "feedback") { await tap(page, cfg, "#btn-continue"); continue; }
    check("[" + cfg.name + "] pantalla esperada en lección", false, s);
    return "error";
  }
  return "error";
}

// Pantallas que el motor siempre genera, y pantallas que dependen de lo que traiga el contenido.
const CORE_CAPS = ["ex-choice", "ex-type", "ex-pairs", "vocab", "feedback-ok", "feedback-bad"];
const CONTENT_CAPS = ["ex-fill", "ex-build", "ex-listen", "dialogue", "teach-text", "teach-tip", "teach-culture", "teach-warn", "teach-table"];
async function lessonFeatures(page) {
  return page.evaluate(() => {
    const out = {};
    const units = (window.__koox.course && window.__koox.course.units) || [];
    units.forEach((u) => ((u && u.lessons) || []).forEach((l) => {
      if (!l || !l.id) return;
      const f = [];
      (l.exercises || []).forEach((e) => { if (e && (e.type === "fill" || e.type === "build")) f.push("ex-" + e.type); });
      if (l.dialogue) f.push("dialogue");
      (l.teach || []).forEach((c) => { if (c && c.kind) f.push("teach-" + c.kind); });
      if ((window.__koox.plan(l.id) || []).some((st) => /^ex:listen/.test(st))) f.push("ex-listen");
      out[l.id] = f;
    }));
    return out;
  });
}
// Una lección se recorre con clics reales (y capturas) si aporta una pantalla que aún no se vio.
function needStep(i, id, cap, feats) {
  if (i === 0) return true;
  if (i < 4 && CORE_CAPS.some((k) => !cap[k])) return true;
  return (feats[id] || []).some((k) => CONTENT_CAPS.includes(k) && !cap[k]);
}
function allSeen(cap, feats) {
  const present = new Set([].concat(...Object.values(feats)));
  return CORE_CAPS.every((k) => cap[k]) && CONTENT_CAPS.every((k) => !present.has(k) || cap[k]);
}
function checkCaps(cfg, cap, feats) {
  const present = new Set([].concat(...Object.values(feats)));
  CORE_CAPS.forEach((k) => check("[" + cfg.name + "] se vio la pantalla " + k, cap[k]));
  CONTENT_CAPS.forEach((k) => {
    if (present.has(k)) check("[" + cfg.name + "] se vio la pantalla " + k, cap[k]);
    else console.log("  · AVISO [" + cfg.name + "] el contenido no tiene " + k);
  });
}

async function tabsCheck(page, cfg, withShots, suffix) {
  for (const t of ["repasar", "diccionario", "perfil", "aprender"]) {
    await gotoTab(page, cfg, t);
    await checkOverflow(page, cfg, "pestaña " + t + (suffix || ""));
    if (withShots) {
      if (t === "diccionario") {
        await page.fill("#dict-q", "ja");
        await shot(page, cfg, "dict");
        await page.fill("#dict-q", "");
      } else if (t === "perfil") { await shot(page, cfg, "profile"); await shot(page, cfg, "profile-full", true); }
      else if (t === "repasar") await shot(page, cfg, "review");
      else { await shot(page, cfg, "home"); await shot(page, cfg, "home-full", true); }
    }
  }
}

async function mobileFull(browser, cfg) {
  const { ctx, page } = await newPage(browser, cfg);
  await load(page);
  check("[" + cfg.name + "] pantalla inicial es home", (await scr(page)) === "home", await scr(page));
  const lessons = await page.evaluate(() => window.__koox.lessons());
  const nVocab = await page.evaluate(() => window.__koox.vocabCount());
  check("[" + cfg.name + "] el curso tiene lecciones", lessons.length > 0, lessons.length);
  await shot(page, cfg, "home-new");
  check("[" + cfg.name + "] usuario nuevo: no se ofrece repaso de unidades sin estudiar", (await page.$$eval("[data-unit-review]", (n) => n.length)) === 0);
  check("[" + cfg.name + "] la interfaz declara lang=es", await page.evaluate(() => document.querySelector("#app").getAttribute("lang") === "es" && !!document.documentElement.lang));
  const plans = await page.evaluate(() => window.__koox.lessons().map((id) => ({ id, p: window.__koox.plan(id) })));
  const prodMedia = plans.filter((x) => x.p.some((st) => /^ex:(type|build|fill|choice-es2m):/.test(st) && /:(media|\?)$/.test(st)));
  check("[" + cfg.name + "] ninguna lección pide producir formas por confirmar", !prodMedia.length, prodMedia.map((x) => x.id).join(", "));
  const pairsMedia = plans.filter((x) => x.p.some((st) => /^ex:pairs:/.test(st) && /m/.test(st.split(":")[3])));
  check("[" + cfg.name + "] las parejas solo usan formas confirmadas", !pairsMedia.length, pairsMedia.map((x) => x.id).join(", "));
  const lateEx = plans.filter((x) => x.p.findIndex((st) => st.startsWith("ex")) > 8);
  check("[" + cfg.name + "] el primer ejercicio llega en 8 pantallas o menos", !lateEx.length, lateEx.map((x) => x.id).join(", "));
  await tabsCheck(page, cfg, false, " (sin avance)");

  // (c) Completar todas las lecciones.
  const feats = await lessonFeatures(page);
  const cap = {};
  let lessonOk = 0;
  const tLessons = Date.now();
  for (let i = 0; i < lessons.length; i++) {
    const id = lessons[i];
    if (i === 0) await openLesson(page, cfg, id);
    let r;
    if (needStep(i, id, cap, feats)) {
      r = await stepRun(page, cfg, cap, { wrongOnce: i === 0 });
      if (i === 0) {
        const pct = await page.evaluate(() => (document.querySelector(".score-ring .pct") || {}).textContent || "");
        check("[" + cfg.name + "] un error baja el % de la lección", parseInt(pct, 10) < 100, pct);
      }
    } else {
      const fr = await page.evaluate(fastRunInPage);
      r = fr.ok ? "results" : "error";
      if (!fr.ok) check("[" + cfg.name + "] lección " + id + " completa", false, fr.error);
    }
    if (r === "results") lessonOk++;
    else { // vuelve al inicio para intentar la siguiente
      await page.evaluate(() => { const b = document.querySelector("#btn-close"); if (b) b.click(); const x = document.querySelector("#btn-confirm-exit"); if (x && !document.querySelector("#confirm").hidden) x.click(); });
    }
    const st = await page.evaluate((lid) => window.__koox.state().lessons[lid], id);
    check("[" + cfg.name + "] lección " + id + " guardada como completada", st && st.done, JSON.stringify(st));
    // Continuar desde resultados abre la siguiente lección.
    if (r === "results") {
      if (i < lessons.length - 1) {
        await page.evaluate(() => document.querySelector("#btn-results-next").click());
        const ok = await page.waitForFunction(() => ["teach", "vocab", "dialogue", "exercise"].includes(window.__koox.screen()), null, { timeout: 3000 }).then(() => true, () => false);
        if (i === 0) check("[" + cfg.name + "] «Continuar» abre la siguiente lección", ok);
        if (!ok) await openLesson(page, cfg, lessons[i + 1]);
      } else {
        check("[" + cfg.name + "] la última lección ofrece volver al inicio", await page.evaluate(() => !document.querySelector("#btn-results-next") && !!document.querySelector("#btn-results-home")));
        await page.evaluate(() => document.querySelector("#btn-results-home").click());
      }
    } else if (i < lessons.length - 1) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await openLesson(page, cfg, lessons[i + 1]);
    }
  }
  check("[" + cfg.name + "] completa TODAS las lecciones (" + lessons.length + ")", lessonOk === lessons.length, lessonOk + "/" + lessons.length + " en " + ((Date.now() - tLessons) / 1000).toFixed(1) + " s");
  checkCaps(cfg, cap, feats);
  await page.waitForFunction(() => window.__koox.screen() === "home");
  const st1 = await page.evaluate(() => window.__koox.state());
  check("[" + cfg.name + "] XP acumulado", st1.xp >= lessons.length * 10, st1.xp);
  check("[" + cfg.name + "] racha de 1 día", st1.streak.count === 1 && st1.streak.best >= 1, JSON.stringify(st1.streak));
  check("[" + cfg.name + "] todo el vocab entró al repaso en caja 1", Object.keys(st1.srs).length === nVocab && Object.values(st1.srs).every((r) => r.box === 1), Object.keys(st1.srs).length + "/" + nVocab);
  await shot(page, cfg, "home-progress");

  // Repaso de la unidad desde la ruta.
  await page.evaluate(() => window.scrollTo(0, 0));
  await tap(page, cfg, "[data-unit-review]");
  const ur = await page.evaluate(fastRunInPage);
  check("[" + cfg.name + "] repaso de la unidad completo", ur.ok && ur.ex > 0, (ur.error || "") + " · " + JSON.stringify(ur.types));
  await page.evaluate(() => document.querySelector("#btn-results-home").click());
  await page.waitForFunction(() => window.__koox.screen() === "home");

  // (d) Persistencia tras recargar.
  const stBefore = await page.evaluate(() => window.__koox.state());
  check("[" + cfg.name + "] el repaso de la unidad suma XP", stBefore.xp > st1.xp, st1.xp + " → " + stBefore.xp);
  st1.xp = stBefore.xp;
  await load(page);
  const st2 = await page.evaluate(() => window.__koox.state());
  const doneNodes = await page.$$eval(".node-row.done", (n) => n.length);
  check("[" + cfg.name + "] el avance persiste tras recargar", st2.xp === st1.xp && Object.keys(st2.lessons).length === lessons.length && doneNodes === lessons.length, "xp " + st2.xp + ", nodos " + doneNodes);

  // (e) Repaso: práctica libre (nada vence hoy) y luego repaso con vencidos.
  await gotoTab(page, cfg, "repasar");
  const label = await page.textContent("#btn-start-review");
  check("[" + cfg.name + "] sin vencidos ofrece práctica libre", /Práctica libre/.test(label), label);
  await tap(page, cfg, "#btn-start-review");
  let fr = await page.evaluate(fastRunInPage);
  check("[" + cfg.name + "] práctica libre completa", fr.ok, fr.error);
  await tap(page, cfg, "#btn-results-home");
  // Vence todo ayer.
  await page.evaluate(() => {
    const k = "koox-maaya-v2", s = JSON.parse(localStorage.getItem(k));
    const d = new Date(); d.setDate(d.getDate() - 1);
    const y = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    Object.values(s.srs).forEach((r) => { r.due = y; });
    localStorage.setItem(k, JSON.stringify(s));
  });
  await load(page);
  const badge = await page.evaluate(() => { const b = document.querySelector("#nav-badge"); return b.hidden ? 0 : parseInt(b.textContent, 10); });
  check("[" + cfg.name + "] la insignia muestra repasos pendientes", badge === Math.min(99, nVocab) || badge > 0, badge);
  await gotoTab(page, cfg, "repasar");
  await shot(page, cfg, "review-due");
  await tap(page, cfg, "#btn-start-review");
  const firstEx = await page.evaluate(() => window.__koox.screen());
  check("[" + cfg.name + "] el repaso empieza con un ejercicio", firstEx === "exercise", firstEx);
  fr = await page.evaluate(fastRunInPage);
  check("[" + cfg.name + "] sesión de repaso completa", fr.ok, fr.error);
  check("[" + cfg.name + "] el repaso tiene como máximo 15 preguntas", fr.ex <= 15 && fr.ex > 0, fr.ex);
  await shot(page, cfg, "review-results");
  const st3 = await page.evaluate(() => window.__koox.state());
  const promoted = Object.values(st3.srs).filter((r) => r.box === 2).length;
  check("[" + cfg.name + "] Leitner: los aciertos suben a caja 2", promoted > 0 && promoted <= 15, promoted);
  const tday = await page.evaluate(() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); });
  check("[" + cfg.name + "] Leitner: caja 2 vence en 3 días", Object.values(st3.srs).filter((r) => r.box === 2).every((r) => r.due === tday), tday);
  await tap(page, cfg, "#btn-results-home");
  await page.waitForFunction(() => window.__koox.screen() === "review");
  await checkOverflow(page, cfg, "repasar (con avance)");

  // (f) Diccionario.
  await gotoTab(page, cfg, "diccionario");
  await page.fill("#dict-q", "ja");
  const nJa = await page.$$eval("#dict-list .entry", (n) => n.length);
  await page.fill("#dict-q", "ja’");
  const nJaCurly = await page.$$eval("#dict-list .entry", (n) => n.length);
  await page.fill("#dict-q", "JA'");
  const nJaUpper = await page.$$eval("#dict-list .entry", (n) => n.length);
  check("[" + cfg.name + "] diccionario: «ja» da resultados", nJa > 0, nJa);
  check("[" + cfg.name + "] diccionario: «ja’» da resultados", nJaCurly > 0 && nJaCurly === nJa, nJaCurly + " vs " + nJa);
  check("[" + cfg.name + "] diccionario: ignora mayúsculas", nJaUpper === nJa, nJaUpper);
  const firstUnit = await page.$$eval("#dict-units .chip", (c) => c.length > 1 ? c[1].id : null);
  if (firstUnit) {
    await page.fill("#dict-q", "");
    const all = await page.$$eval("#dict-list .entry", (n) => n.length);
    await tap(page, cfg, "#" + firstUnit);
    const one = await page.$$eval("#dict-list .entry", (n) => n.length);
    check("[" + cfg.name + "] diccionario: filtro por unidad", one > 0 && one <= all, one + "/" + all);
    await tap(page, cfg, "#dict-u-all");
  }
  await page.fill("#dict-q", "ja");
  await shot(page, cfg, "dict");
  await checkOverflow(page, cfg, "diccionario con resultados");

  // (g) Normalización expuesta.
  const g = await page.evaluate(() => ({
    a: window.__koox.grade("ja’", ["ja'"]).ok,
    b: window.__koox.grade("  JA´ ", ["ja'"]).ok,
    c: window.__koox.grade("ja", ["ja'"]).ok,
    d: window.__koox.grade("k'aak'", ["k'áak'"]),
    e: window.__koox.grade("kaak'", ["k'áak'"]).ok,
    f: window.__koox.grade("¿Bix a beel?", ["Bix a beel?"]).ok,
    mp1: window.__koox.gradeTyped("miis", "u1-miis-escoba"),
    mp2: window.__koox.gradeTyped("míis", "u1-miis-escoba"),
    mp3: window.__koox.gradeTyped("miis", "u1-miis-gato"),
    h: window.__koox.sanitize('<b>x</b><img src=x onerror=alert(1)><span class="m">ja\'</span><script>bad()</script><a href="#">y</a>')
  }));
  check("[" + cfg.name + "] type acepta «ja’» para «ja'»", g.a && g.b, JSON.stringify(g));
  check("[" + cfg.name + "] el saltillo cuenta (ja ≠ ja')", !g.c);
  check("[" + cfg.name + "] acento de tono: correcta con aviso", g.d.ok && g.d.accent);
  check("[" + cfg.name + "] la glotalizada cuenta (kaak' ≠ k'áak')", !g.e);
  check("[" + cfg.name + "] ignora signos ¿?", g.f);
  if (g.mp1 || g.mp2 || g.mp3) check("[" + cfg.name + "] par mínimo: «miis» (gato) no vale por «míis» (escoba)", g.mp1 && g.mp1.ok === false && g.mp2 && g.mp2.ok && g.mp3 && g.mp3.ok, JSON.stringify([g.mp1, g.mp2, g.mp3]));
  else console.log("  · AVISO [" + cfg.name + "] el contenido no tiene u1-miis-escoba / u1-miis-gato (sin prueba de par mínimo)");
  check("[" + cfg.name + "] saneado con lista blanca", !/img|script|onerror|<a/i.test(g.h) && /<b>x<\/b>/.test(g.h) && /class="m"/.test(g.h), g.h);

  // Perfil: meta diaria, guía y borrar avance.
  await gotoTab(page, cfg, "perfil");
  await page.selectOption("#goal", "30");
  check("[" + cfg.name + "] meta diaria se guarda", (await page.evaluate(() => window.__koox.state().goal)) === 30);
  await tap(page, cfg, "#btn-profile-guide");
  await page.waitForFunction(() => window.__koox.screen() === "dict");
  const guide = await page.evaluate(() => ({ open: !!(document.querySelector("#guide") || {}).open, n: document.querySelectorAll("#guide .alphabet .letter").length }));
  check("[" + cfg.name + "] «Abrir la guía» lleva a la guía de pronunciación", guide.open && guide.n > 0, JSON.stringify(guide));
  await checkOverflow(page, cfg, "guía de pronunciación");
  await gotoTab(page, cfg, "perfil");
  const links = await page.$$eval(".sources-list a", (a) => a.map((x) => [x.getAttribute("target"), x.getAttribute("rel"), x.href]));
  check("[" + cfg.name + "] fuentes como enlaces externos", links.length > 0 && links.every((l) => l[0] === "_blank" && /noopener/.test(l[1]) && /^https:/.test(l[2])), links.length);
  await shot(page, cfg, "profile");
  await shot(page, cfg, "profile-full", true);
  await checkOverflow(page, cfg, "perfil con avance");
  await tap(page, cfg, "#btn-reset");
  const armed = await page.textContent("#btn-reset");
  check("[" + cfg.name + "] borrar pide un segundo toque", /otra vez/i.test(armed) && (await page.evaluate(() => window.__koox.state().xp)) > 0, armed);
  await tap(page, cfg, "#btn-reset");
  const st4 = await page.evaluate(() => window.__koox.state());
  check("[" + cfg.name + "] borrar avance deja el estado en cero", st4.xp === 0 && !Object.keys(st4.lessons).length && !Object.keys(st4.srs).length);
  check("[" + cfg.name + "] borrar avance conserva la meta diaria", st4.goal === 30, st4.goal);
  check("[" + cfg.name + "] sin errores de JavaScript", page.errors.length === 0, page.errors.slice(0, 5).join(" | "));
  await ctx.close();
}

// De resultados al inicio, esperando a que termine la vuelta del historial.
async function toHome(page) {
  await page.evaluate(() => { const b = document.querySelector("#btn-results-home"); if (b) b.click(); });
  await page.waitForFunction(() => window.__koox.screen() === "home", null, { timeout: 3000 }).catch(() => {});
}

async function mobileDark(browser, cfg) {
  const { ctx, page } = await newPage(browser, cfg);
  await load(page);
  await shot(page, cfg, "home-new");
  const lessons = await page.evaluate(() => window.__koox.lessons());
  const feats = await lessonFeatures(page);
  const cap = {};
  for (let i = 0; i < lessons.length && !allSeen(cap, feats); i++) {
    if (!needStep(i, lessons[i], cap, feats)) continue;
    if ((await scr(page)) === "home") await openLesson(page, cfg, lessons[i]);
    const r = await stepRun(page, cfg, cap, { wrongOnce: i === 0, stopWhen: (c) => i > 0 && allSeen(c, feats) });
    if (r === "results") await toHome(page);
    if (r === "stopped") break;
  }
  checkCaps(cfg, cap, feats);
  if ((await scr(page)) === "results") await toHome(page);
  if ((await scr(page)) === "home") await openLesson(page, cfg, lessons[Math.min(1, lessons.length - 1)]);
  // Botón Atrás del sistema: pide confirmar, luego cierra la confirmación y sigue en la lección.
  await page.evaluate(() => history.back());
  await page.waitForFunction(() => window.__koox.screen() === "confirm", null, { timeout: 2000 }).catch(() => {});
  check("[" + cfg.name + "] Atrás en una lección pide confirmar la salida", (await scr(page)) === "confirm", await scr(page));
  await page.evaluate(() => history.back());
  await page.waitForFunction(() => window.__koox.screen() !== "confirm", null, { timeout: 2000 }).catch(() => {});
  check("[" + cfg.name + "] Atrás en la confirmación vuelve a la lección", !["confirm", "home"].includes(await scr(page)), await scr(page));
  // Confirmación de salida dentro de la página.
  await tap(page, cfg, "#btn-close");
  check("[" + cfg.name + "] cerrar pide confirmación", (await scr(page)) === "confirm");
  await shot(page, cfg, "confirm");
  await tap(page, cfg, "#btn-confirm-stay");
  check("[" + cfg.name + "] «Seguir aprendiendo» vuelve a la lección", (await scr(page)) !== "confirm" && (await scr(page)) !== "home");
  await tap(page, cfg, "#btn-close");
  await tap(page, cfg, "#btn-confirm-exit");
  check("[" + cfg.name + "] «Salir» vuelve al inicio", (await scr(page)) === "home");
  await tabsCheck(page, cfg, true);
  // Hoja de vista previa de lección.
  await tap(page, cfg, '[data-lesson="' + lessons[0] + '"]');
  await page.waitForSelector("#lesson-sheet:not([hidden])");
  await shot(page, cfg, "lesson-sheet");
  await page.keyboard.press("Escape");
  check("[" + cfg.name + "] Escape cierra la hoja de lección", await page.evaluate(() => document.querySelector("#lesson-sheet").hidden));
  await page.waitForTimeout(450);
  await tap(page, cfg, '[data-lesson="' + lessons[0] + '"]');
  await page.waitForSelector("#lesson-sheet:not([hidden])");
  await page.evaluate(() => history.back());
  await page.waitForFunction(() => document.querySelector("#lesson-sheet").hidden, null, { timeout: 2000 }).catch(() => {});
  check("[" + cfg.name + "] Atrás cierra la hoja de lección", await page.evaluate(() => document.querySelector("#lesson-sheet").hidden && window.__koox.screen() === "home"));
  check("[" + cfg.name + "] sin errores de JavaScript", page.errors.length === 0, page.errors.slice(0, 5).join(" | "));
  await ctx.close();
}

// Robustez: curso ausente, y contenido incompleto o con html malicioso.
async function robustness(browser, cfg) {
  // 1) Sin window.COURSE (el script de la app lo ve indefinido).
  let { ctx, page } = await newPage(browser, cfg);
  await page.addInitScript(() => {
    Object.defineProperty(window, "COURSE", {
      configurable: true,
      get() { const s = document.currentScript; return s && s.textContent.indexOf("window.__koox") >= 0 ? undefined : { units: [] }; },
      set() {}
    });
  });
  await load(page);
  check("[" + cfg.name + "] sin curso: estado vacío", (await scr(page)) === "empty", await scr(page));
  check("[" + cfg.name + "] sin curso: mensaje visible", /aún no tiene lecciones/i.test(await page.textContent("#v-home")));
  for (const t of ["repasar", "diccionario", "perfil", "aprender"]) {
    await tap(page, cfg, "#tab-" + t);
    await checkOverflow(page, cfg, "pestaña " + t + " sin curso");
  }
  check("[" + cfg.name + "] sin curso: sin errores", page.errors.length === 0, page.errors.slice(0, 3).join(" | "));
  await ctx.close();

  // 2) Contenido degradado: sin diálogos, sin ejercicios, 2 palabras, tarjetas inválidas, html malicioso, unidad rota.
  ({ ctx, page } = await newPage(browser, cfg));
  await page.addInitScript(() => {
    const push = Array.prototype.push;
    const units = [];
    units.push = function (u) {
      (u.lessons || []).forEach((l, i) => {
        delete l.dialogue;
        if (i === 0) { l.exercises = []; l.vocab = (l.vocab || []).slice(0, 2); }
        if (i === 1) {
          l.teach = [
            { kind: "text", title: "Prueba <b>de</b> saneado", html: '<img src=x onerror="window.__pwned=1">Hola <script>window.__pwned=2<\/script><span class="m" onclick="window.__pwned=3">ja\'</span> <a href="https://x.test">enlace</a> <b>negrita</b>' },
            { kind: "nope", html: "x" }, null
          ];
          l.exercises = (l.exercises || []).concat([{ type: "choice", q: "x", prompt: "y", answer: "z", options: [] }, { type: "raro" }, null, { type: "build", es: "x", m: "" }]);
        }
      });
      push.call(this, u);
      if (this.length === 1) {
        const dup = u.lessons && u.lessons[0] && u.lessons[0].vocab && u.lessons[0].vocab[0];
        push.call(this, { id: "u99", n: 99, title: "Unidad rota", lessons: [{ id: "u99l1", title: "Vacía", teach: "no", vocab: [{ id: "x" }, null, dup ? { id: dup.id, m: "duplicada", es: "dup" } : null] }, null, 7] });
        push.call(this, null, { id: "u98" }, "texto");
      }
      return this.length;
    };
    window.COURSE = { units: units };
  });
  await load(page);
  check("[" + cfg.name + "] contenido degradado: carga el inicio", (await scr(page)) === "home", await scr(page));
  const ids = await page.evaluate(() => window.__koox.lessons());
  if (ids.length >= 2) {
    await openLesson(page, cfg, ids[0]);
    let fr = await page.evaluate(fastRunInPage);
    check("[" + cfg.name + "] lección con 2 palabras y sin ejercicios escritos se completa", fr.ok && fr.ex > 0, (fr.error || "") + " · " + fr.ex + " ejercicios");
    await page.evaluate(() => document.querySelector("#btn-results-home").click());
    await openLesson(page, cfg, ids[1]);
    const t = await page.evaluate(() => ({ s: window.__koox.screen(), html: (document.querySelector(".teach-body") || {}).innerHTML || "", h2: (document.querySelector(".teach h2") || {}).textContent || "" }));
    check("[" + cfg.name + "] html de tarjeta saneado con lista blanca", t.s === "teach" && !/<img|<script|onclick|onerror|<a /i.test(t.html) && /<b>negrita<\/b>/.test(t.html) && /class="m"/.test(t.html), t.html);
    check("[" + cfg.name + "] el título de tarjeta se escapa", /<b>de<\/b>/.test(t.h2), t.h2);
    fr = await page.evaluate(fastRunInPage);
    check("[" + cfg.name + "] lección con ejercicios inválidos se completa", fr.ok, fr.error);
    await page.evaluate(() => document.querySelector("#btn-results-home").click());
  }
  if (ids.includes("u99l1")) {
    await page.evaluate(() => { window.scrollTo(0, 0); document.querySelector('[data-lesson="u99l1"]').click(); document.querySelector("#btn-start-lesson").click(); });
    check("[" + cfg.name + "] lección vacía termina sin bloquearse", (await scr(page)) === "results", await scr(page));
    await page.evaluate(() => document.querySelector("#btn-results-home").click());
  }
  await gotoTab(page, cfg, "diccionario");
  await page.fill("#dict-q", "duplicada");
  check("[" + cfg.name + "] ids de vocab duplicados se ignoran", (await page.$$eval("#dict-list .entry", (n) => n.length)) === 0);
  check("[" + cfg.name + "] ningún script inyectado se ejecutó", (await page.evaluate(() => window.__pwned)) === undefined);
  check("[" + cfg.name + "] contenido degradado: sin errores", page.errors.length === 0, page.errors.slice(0, 3).join(" | "));
  await ctx.close();

  // 3) localStorage bloqueado: la app funciona igual.
  ({ ctx, page } = await newPage(browser, cfg));
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { configurable: true, get() { throw new Error("bloqueado"); } });
  });
  await load(page);
  check("[" + cfg.name + "] sin almacenamiento: carga el inicio", (await scr(page)) === "home", await scr(page));
  const ids2 = await page.evaluate(() => window.__koox.lessons());
  await openLesson(page, cfg, ids2[0]);
  const fr2 = await page.evaluate(fastRunInPage);
  check("[" + cfg.name + "] sin almacenamiento: completa una lección", fr2.ok, fr2.error);
  check("[" + cfg.name + "] sin almacenamiento: lo informa", (await page.evaluate(() => window.__koox.storageOK())) === false);
  check("[" + cfg.name + "] sin almacenamiento: sin errores", page.errors.length === 0, page.errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// ---------- Audio de pronunciación y recursos para escuchar ----------
const AU_LABELS = ["Voz nativa", "Voz sintética", "Sonido de referencia (AFI)"];
const auState = (page) => page.evaluate(() => window.__koox.audioState());
async function waitStarted(page, n) {
  return page.waitForFunction((k) => window.__koox.audioState().started > k, n, { timeout: 5000 }).then(() => true, () => false);
}
async function leaveSession(page) {
  await page.evaluate(() => {
    const b = document.querySelector("#btn-close"); if (b) b.click();
    const x = document.querySelector("#btn-confirm-exit"); if (x && !document.querySelector("#confirm").hidden) x.click();
  });
  await page.waitForFunction(() => window.__koox.screen() === "home", null, { timeout: 3000 }).catch(() => {});
}
async function audioRun(browser, cfg) {
  let { ctx, page } = await newPage(browser, cfg);
  const audioReqs = [];
  page.on("request", (r) => { const u = r.url(); if (!u.startsWith("data:") && /\.mp3(\?|$)|\/audio\//.test(u)) audioReqs.push(u); });
  await load(page);
  const info = await page.evaluate(() => window.__koox.audio());
  log("  · audio: " + info.count + " " + JSON.stringify(info.kinds) + " · palabras con voz nativa: " + info.native.length + " · recursos: " + info.resources);
  const lessons = await page.evaluate(() => window.__koox.lessons());
  const plans = await page.evaluate(() => window.__koox.lessons().map((id) => ({ id, p: window.__koox.plan(id) })));
  const withListen = plans.filter((x) => x.p.some((st) => /^ex:listen/.test(st)));
  const listenOk = plans.every((x) => x.p.filter((st) => /^ex:listen/.test(st)).length <= 2);

  if (!info.count) {
    // Sin audio: ni botones, ni ajustes, ni créditos, ni «Escucha y elige».
    check("[" + cfg.name + "] sin audio: ninguna lección tiene «Escucha y elige»", !withListen.length, withListen.map((x) => x.id).join(", "));
    await gotoTab(page, cfg, "diccionario");
    await page.evaluate(() => { const d = document.querySelector("#guide"); if (d) d.open = true; });
    await gotoTab(page, cfg, "perfil");
    const none = await page.evaluate(() => ({ btn: document.querySelectorAll("[data-au]").length, set: !!document.querySelector("#au-auto, #au-rate"), cred: !!document.querySelector("#credits-title") }));
    check("[" + cfg.name + "] sin audio: sin botones, ajustes ni créditos de audio", !none.btn && !none.set && !none.cred, JSON.stringify(none));
    await gotoTab(page, cfg, "aprender");
    await openLesson(page, cfg, lessons[0]);
    for (let g = 0; g < 12 && ["teach", "vocab"].includes(await scr(page)); g++) {
      if ((await scr(page)) === "vocab") break;
      await tap(page, cfg, "#btn-next");
    }
    if ((await scr(page)) === "vocab") check("[" + cfg.name + "] sin audio: la tarjeta de palabra no tiene botón de escuchar", !(await page.$("#wc-play")) && !(await page.$("#wc-slow")));
    await leaveSession(page);
  } else {
    // «Escucha y elige» solo usa voces nativas: sin ninguna (p. ej. solo fonemas y voz sintética) no aparece.
    if (info.native.length) check("[" + cfg.name + "] «Escucha y elige» aparece en las lecciones con voz nativa (1 o 2 por lección)", withListen.length > 0 && listenOk, withListen.map((x) => x.id).join(", "));
    else check("[" + cfg.name + "] sin voces nativas, «Escucha y elige» no aparece (nunca usa voz sintética ni fonemas)", !withListen.length, withListen.map((x) => x.id).join(", "));
    // Ninguna lección pide producir con «Escucha y elige» una forma por confirmar.
    check("[" + cfg.name + "] «Escucha y elige» con opciones en maya solo usa formas confirmadas", !plans.some((x) => x.p.some((st) => /^ex:listen-m:.*:(media|\?)$/.test(st))));
    // La lección de prueba: una con «Escucha y elige» o, si no hay, la primera cuya primera palabra tiene audio
    // (la búsqueda de la tarjeta se detiene en el primer ejercicio).
    const withWordAudio = await page.evaluate(() => {
      for (const u of (window.COURSE && window.COURSE.units) || []) for (const l of u.lessons || []) {
        if (l.vocab && l.vocab.length && window.__koox.audioFor("vocab", l.vocab[0].id)) return l.id;
      }
      return null;
    });
    const target = withListen.length ? withListen[0].id : withWordAudio || lessons[0];
    await openLesson(page, cfg, target);
    // Hasta la primera tarjeta de palabra con audio (la reproducción automática ocurre con el toque).
    let autoplayed = null;
    for (let g = 0; g < 20; g++) {
      const s = await scr(page);
      if (s === "vocab" && (await page.$("#wc-play"))) break;
      if (!["teach", "vocab", "dialogue"].includes(s)) break;
      const before = await auState(page);
      await tap(page, cfg, "#btn-next");
      if ((await scr(page)) === "vocab" && (await page.$("#wc-play"))) {
        await waitStarted(page, before.started);
        const after = await auState(page);
        const key = await page.getAttribute("#wc-play", "data-au");
        autoplayed = after.plays > before.plays && after.lastKey === key;
      }
    }
    const card = await page.evaluate(() => {
      const b = document.querySelector("#wc-play"), sl = document.querySelector("#wc-slow"), tag = document.querySelector(".wc-audio .au-kind");
      if (!b) return null;
      const r = b.getBoundingClientRect(), rs = sl.getBoundingClientRect();
      return { w: r.width, h: r.height, sh: rs.height, label: b.getAttribute("aria-label"), slow: sl.getAttribute("aria-label"), tag: tag ? tag.textContent : "", word: document.querySelector("#wc-m").textContent };
    });
    check("[" + cfg.name + "] la tarjeta de palabra nueva tiene botón de escuchar y «Lento»", !!card, card ? card.word : "sin tarjeta con audio");
    if (card) {
      check("[" + cfg.name + "] botones de escuchar de 44 px o más", card.w >= 44 && card.h >= 44 && card.sh >= 44, card.w + "×" + card.h + ", lento " + card.sh);
      check("[" + cfg.name + "] aria-label «Escuchar «…»» con el tipo de audio", /^Escuchar «.+», (voz nativa|voz sintética aproximada|sonido de referencia)/.test(card.label) && /lento/.test(card.slow), card.label);
      check("[" + cfg.name + "] etiqueta del tipo de audio junto al botón", AU_LABELS.some((l) => card.tag.startsWith(l)), card.tag);
      check("[" + cfg.name + "] la palabra suena al aparecer (ajuste por omisión)", autoplayed === true, String(autoplayed));
      if (cfg.shots) await shot(page, cfg, "audio-vocab");
      let st0 = await auState(page);
      await tap(page, cfg, "#wc-play");
      const started = await waitStarted(page, st0.started);
      const st1 = await auState(page);
      check("[" + cfg.name + "] al tocar el botón, el audio se reproduce", started && (st1.playing || st1.ended > st0.ended) && st1.errors === 0 && st1.rate === 1, JSON.stringify(st1));
      if (!FULL_DOC) check("[" + cfg.name + "] el Artifact reproduce el audio incrustado (data:)", st1.src === "data:", st1.src);
      st0 = st1;
      await tap(page, cfg, "#wc-slow");
      const slowStarted = await waitStarted(page, st0.started);
      const st2 = await auState(page);
      check("[" + cfg.name + "] «Lento» reproduce a 0.75 sin cambiar el tono", slowStarted && st2.rate === 0.75 && st2.preservesPitch === true, JSON.stringify({ rate: st2.rate, pitch: st2.preservesPitch }));
    }
    // Sigue la lección hasta «Escucha y elige».
    let listened = null;
    for (let g = 0; g < 80 && withListen.length; g++) {
      const s = await scr(page);
      if (s === "results") break;
      if (["teach", "vocab", "dialogue"].includes(s)) { await page.evaluate(() => document.querySelector("#btn-next").click()); continue; }
      if (s === "feedback") { await page.evaluate(() => document.querySelector("#btn-continue").click()); continue; }
      if (s !== "exercise") break;
      const p = await page.evaluate(() => window.__koox.peek());
      if (p.type === "listen") {
        const ex = await page.evaluate(() => {
          const b = document.querySelector("#listen-play"), r = b ? b.getBoundingClientRect() : { width: 0, height: 0 };
          return { w: r.width, h: r.height, label: b ? b.getAttribute("aria-label") : "", opts: document.querySelectorAll(".opt").length, fallback: !document.querySelector("#listen-fallback").hidden };
        });
        if (cfg.shots) await shot(page, cfg, "audio-listen");
        const st0 = await auState(page);
        await tap(page, cfg, "#listen-play");
        const ok = await waitStarted(page, st0.started);
        await page.evaluate(() => window.__koox.solve());
        await tap(page, cfg, "#btn-check");
        const fb = await page.evaluate(() => ({ s: window.__koox.screen(), bad: document.querySelector("#feedback").classList.contains("bad"), au: document.querySelectorAll("#fb-body [data-au]").length }));
        listened = { ex, ok, fb, answer: p.answer };
        if (cfg.shots) await shot(page, cfg, "audio-listen-feedback");
        break;
      }
      await page.evaluate(() => window.__koox.solve());
      if ((await scr(page)) === "exercise") await page.evaluate(() => document.querySelector("#btn-check").click());
    }
    if (withListen.length) {
      check("[" + cfg.name + "] aparece «Escucha y elige» con botón grande y opciones", listened && listened.ex.w >= 44 && listened.ex.opts >= 2 && !listened.ex.fallback, JSON.stringify(listened && listened.ex));
      check("[" + cfg.name + "] su aria-label no revela la respuesta", listened && /^Escuchar el audio/.test(listened.ex.label) && listened.ex.label.indexOf(listened.answer) < 0, listened && listened.ex.label);
      check("[" + cfg.name + "] «Escucha y elige»: el audio suena y solve() lo resuelve", listened && listened.ok && listened.fb.s === "feedback" && !listened.fb.bad, JSON.stringify(listened && listened.fb));
      check("[" + cfg.name + "] la hoja de retroalimentación ofrece escuchar la palabra", listened && listened.fb.au > 0);
    }
    await leaveSession(page);
    check("[" + cfg.name + "] el audio se detiene al cambiar de pantalla", !(await auState(page)).playing);

    // Diccionario y guía de sonidos.
    await gotoTab(page, cfg, "diccionario");
    const dict = await page.evaluate(() => ({ btns: document.querySelectorAll("#dict-list .entry [data-au]").length, tags: [...document.querySelectorAll("#dict-list .au-kind")].map((t) => t.textContent) }));
    check("[" + cfg.name + "] diccionario: botones de escuchar con su tipo", dict.btns > 0 && dict.tags.length === dict.btns, JSON.stringify({ btns: dict.btns, tags: dict.tags.length }));
    const guide = await page.evaluate(() => {
      const d = document.querySelector("#guide"); if (d) d.open = true;
      const fon = [...document.querySelectorAll("#guide .letter .au-kind.fonema")];
      return { btns: document.querySelectorAll("#guide [data-au]").length, fon: fon.length, fonText: fon.map((x) => x.closest(".letter").textContent).join(" | "), note: (document.querySelector("#guide .au-note") || {}).textContent || "" };
    });
    check("[" + cfg.name + "] guía de sonidos con audio", guide.btns > 0, guide.btns);
    if (info.kinds.fonema) check("[" + cfg.name + "] guía: el «fonema» aclara que es el sonido aislado del AFI, no una palabra maya", guide.fon > 0 && /Sonido de referencia \(AFI\)/.test(guide.fonText) && /no una palabra maya/.test(guide.fonText) && /Alfabeto Fonético Internacional/.test(guide.note), guide.fonText.slice(0, 120));
    if (cfg.shots) { await page.evaluate(() => document.querySelector("#guide").scrollIntoView()); await shot(page, cfg, "audio-guide"); }
    await checkOverflow(page, cfg, "guía con audio");

    // Guía: el botón de una letra suena con su sonido de referencia (si existe); una tarjeta con varias
    // letras da un botón por letra con audio; las grabaciones nativas de la letra suenan junto al ejemplo.
    const gl = await page.evaluate(() => {
      const K = window.__koox, E = K.audioEntries(), out = { bad: [], multi: [], letters: 0, nat: 0 };
      const low = (s) => String(s).toLowerCase();
      for (const c of document.querySelectorAll("#guide .letter")) {
        const l = c.querySelector(".l").textContent, parts = l.split(/\s+/).filter(Boolean);
        const fon = E.filter((e) => e.kind === "fonema" && e.letters.includes(l));
        if (parts.length > 1) {
          const want = parts.filter((p) => E.some((e) => e.letters.includes(l) && low(e.text) === low(p)));
          const btns = [...c.querySelectorAll(".l-multi [data-au]")];
          const got = btns.map((b) => b.textContent.trim());
          if (want.length) out.multi.push(l + ": " + got.join(" "));
          if (want.join(" ") !== got.join(" ") || (want.length && c.querySelector(".l-top [data-au]"))) out.bad.push("«" + l + "»: botones " + JSON.stringify(got) + ", se esperaban " + JSON.stringify(want));
          if (btns.some((b) => !/^Escuchar «.+», /.test(b.getAttribute("aria-label")) || b.getBoundingClientRect().height < 44)) out.bad.push("«" + l + "»: aria-label o tamaño de los botones por letra");
        } else {
          const b = c.querySelector(".l-top [data-au]"), k = b && b.getAttribute("data-au");
          if (fon.length) { out.letters++; if (!fon.some((e) => e.key === k)) out.bad.push("«" + l + "»: la letra suena con " + k + " y no con su fonema"); }
        }
        // Cada grabación nativa de la letra que no suena en la letra está en la tarjeta (junto al ejemplo).
        const nat = E.filter((e) => e.kind === "nativo" && e.letters.includes(l));
        const inCard = nat.filter((e) => c.querySelector('[data-au="' + e.key + '"]'));
        out.nat += inCard.length;
        if (fon.length && nat.some((e) => c.querySelector('.l-top [data-au="' + e.key + '"]'))) out.bad.push("«" + l + "»: la voz nativa reemplaza al fonema");
        if (nat.length && !inCard.length) out.bad.push("«" + l + "»: sin la voz nativa de la letra");
      }
      // Por texto (spans .m, diálogos, ejemplos) nunca suena un fonema.
      out.textFon = E.filter((e) => e.kind === "fonema").map((e) => e.text).filter((t) => (K.audioFor("text", t) || {}).kind === "fonema");
      return out;
    });
    log("  · guía: " + gl.letters + " letras con sonido de referencia" + (gl.multi.length ? " · " + gl.multi.join(" · ") : "") + " · voces nativas de letras en tarjetas: " + gl.nat);
    check("[" + cfg.name + "] guía: la letra suena con su sonido de referencia; varias letras, un botón por letra; la voz nativa no lo reemplaza", !gl.bad.length, gl.bad.slice(0, 3).join(" | "));
    if (info.kinds.fonema) check("[" + cfg.name + "] por texto nunca suena un fonema (p. ej. posesivos «a», «u», «k»)", !gl.textFon.length, gl.textFon.join(", "));
    // Casos de los fixtures (test/fixtures/catalogo.json): x tiene fonema y además una voz nativa de otra
    // palabra (xaak); aa no tiene fonema (suena la nativa); «a e i o u» agrupa los fonemas de a y u.
    if (await page.evaluate(() => window.__koox.audioEntries().some((e) => e.key === "nat-xaak"))) {
      const fx = await page.evaluate(() => {
        const K = window.__koox, card = (l) => [...document.querySelectorAll("#guide .letter")].find((c) => c.querySelector(".l").textContent === l);
        const top = (c) => { const b = c && c.querySelector(".l-top [data-au]"); return b ? b.getAttribute("data-au") : null; };
        const cx = card("x"), caa = card("aa"), cv = card("a e i o u");
        return {
          x: K.guideAudio("x"), aa: K.guideAudio("aa"), v: K.guideAudio("a e i o u"), letterX: K.audioFor("letter", "x"),
          xTop: top(cx), aaTop: top(caa),
          xNat: !!(cx && cx.querySelector('.x-nat [data-au="nat-xaak"]')), xNatText: cx ? (cx.querySelector(".x-nat") || {}).textContent : "",
          aaHeard: caa ? (caa.querySelector(".l-au-n") || {}).textContent : "",
          vBtns: cv ? [...cv.querySelectorAll(".l-multi [data-au]")].map((b) => b.getAttribute("data-au") + ":" + b.textContent.trim()) : [],
          a: K.audioFor("text", "a"), u: K.audioFor("text", "u")
        };
      });
      check("[" + cfg.name + "] guía (fixture): la x suena con su fonema y la voz nativa de «xaak» va junto al ejemplo",
        fx.x.letters.length === 1 && fx.x.letters[0].key === "fonema-x" && fx.letterX.key === "fonema-x" && fx.xTop === "fonema-x" && fx.x.ex === "u1-xiib" &&
        fx.x.more.join() === "nat-xaak" && fx.xNat && /Voz nativa/.test(fx.xNatText) && /xaak/.test(fx.xNatText), JSON.stringify({ x: fx.x, top: fx.xTop, nat: fx.xNatText }));
      check("[" + cfg.name + "] guía (fixture): sin fonema, la letra aa suena con la voz nativa y dice qué se oye",
        fx.aa.letters.length === 1 && fx.aa.letters[0].key === "nat-xaak" && fx.aaTop === "nat-xaak" && /Se oye «xaak»/.test(fx.aaHeard), JSON.stringify({ aa: fx.aa, heard: fx.aaHeard }));
      check("[" + cfg.name + "] guía (fixture): «a e i o u» con un botón por letra con audio (a y u)",
        fx.v.multi && fx.v.letters.map((x) => x.l + ":" + x.key).join() === "a:fonema-a,u:fonema-u" && fx.vBtns.join() === "fonema-a:a,fonema-u:u", JSON.stringify({ v: fx.v, btns: fx.vBtns }));
      check("[" + cfg.name + "] por texto, «a» y «u» no suenan con el fonema", fx.a === null && fx.u === null, JSON.stringify({ a: fx.a, u: fx.u }));
    }
    // En las tarjetas de explicación, un span maya cuyo texto es el de un fonema (posesivos «a», «u», «k»)
    // no lleva botón de escuchar.
    const posTarget = await page.evaluate(() => {
      const fon = new Set(window.__koox.audioEntries().filter((e) => e.kind === "fonema").map((e) => e.text.toLowerCase()));
      for (const u of (window.COURSE && window.COURSE.units) || []) for (const l of u.lessons || []) for (const t of l.teach || []) {
        const re = /<span class="m">([^<]*)<\/span>/g; let mm;
        while ((mm = re.exec(t.html || ""))) if (fon.has(mm[1].trim().toLowerCase())) return { id: l.id, text: mm[1].trim() };
      }
      return null;
    });
    if (posTarget) {
      await gotoTab(page, cfg, "aprender");
      await openLesson(page, cfg, posTarget.id);
      let seen = null;
      for (let g = 0; g < 6 && (await scr(page)) === "teach"; g++) {
        seen = await page.evaluate((t) => {
          const sp = [...document.querySelectorAll(".teach-body .m")].filter((x) => x.textContent.trim().toLowerCase() === t.toLowerCase());
          return sp.length ? { n: sp.length, withBtn: sp.filter((x) => x.nextElementSibling && x.nextElementSibling.matches("[data-au]")).length } : null;
        }, posTarget.text);
        if (seen) break;
        await tap(page, cfg, "#btn-next");
      }
      check("[" + cfg.name + "] explicación: «" + posTarget.text + "» (" + posTarget.id + ") sin botón del sonido aislado", seen && seen.withBtn === 0, JSON.stringify(seen));
      await leaveSession(page);
      await gotoTab(page, cfg, "diccionario");
    }

    // Perfil: ajustes y créditos.
    await gotoTab(page, cfg, "perfil");
    const prof = await page.evaluate(() => ({
      auto: (document.querySelector("#au-auto") || {}).checked, rate: (document.querySelector("#au-rate") || {}).value,
      credits: [...document.querySelectorAll("#credits-box a")].map((a) => [a.getAttribute("target"), a.getAttribute("rel"), a.href]),
      creditText: (document.querySelector("#credits-box") || {}).textContent || ""
    }));
    check("[" + cfg.name + "] Perfil: «Reproducir al presentar palabras» (sí) y «Velocidad» (normal)", prof.auto === true && prof.rate === "normal", JSON.stringify({ auto: prof.auto, rate: prof.rate }));
    check("[" + cfg.name + "] Perfil: créditos de audio con licencia enlazada", prof.creditText.length > 0 && /Licencia:/.test(prof.creditText) && prof.credits.every((l) => l[0] === "_blank" && /noopener/.test(l[1]) && /^https:/.test(l[2])), prof.credits.length + " enlaces");
    // Voz sintética: prioridad, etiqueta, nota, ajuste «Usar voz sintética» y créditos agrupados.
    const syn = await page.evaluate(() => {
      const K = window.__koox, E = K.audioEntries(), S = E.filter((e) => e.kind === "sintetico");
      const nat = new Set();
      E.filter((e) => e.kind === "nativo").forEach((e) => e.vocab.forEach((v) => nat.add(v)));
      const both = [].concat(...S.map((e) => e.vocab)).filter((v) => nat.has(v));
      const only = [].concat(...S.map((e) => e.vocab)).filter((v) => !nat.has(v) && (K.audioFor("vocab", v) || {}).kind === "sintetico");
      const credit = [...document.querySelectorAll("#credits-box .credit.synth")];
      return {
        n: S.length, both, bothNative: both.every((v) => (K.audioFor("vocab", v) || {}).kind === "nativo"), only, hasNative: E.some((e) => e.kind === "nativo"),
        note: (document.querySelector("#v-profile .synth-note") || {}).textContent || "",
        toggle: (document.querySelector("#au-synth") || {}).checked,
        credit: credit.map((c) => ({ text: c.textContent, list: c.querySelectorAll(".cr-w, .cr-items, .m").length }))
      };
    });
    if (syn.n) {
      if (syn.both.length) check("[" + cfg.name + "] con voz nativa, nunca se ofrece la sintética de la misma palabra", syn.bothNative, syn.both.join(", "));
      check("[" + cfg.name + "] Perfil explica la voz sintética (IA; tono, saltillo y glotalizadas; se reemplaza por voz nativa)", /inteligencia artificial/.test(syn.note) && /tono/.test(syn.note) && /saltillo/.test(syn.note) && /glotalizadas/.test(syn.note) && /voz nativa/.test(syn.note), syn.note.slice(0, 80));
      check("[" + cfg.name + "] «Usar voz sintética» activo por omisión", syn.toggle === true);
      check("[" + cfg.name + "] créditos: los sintéticos en una sola entrada (modelo, licencia y enlace)", syn.credit.length === 1 && /audios?/.test(syn.credit[0].text) && /Licencia:/.test(syn.credit[0].text) && syn.credit[0].list === 0, JSON.stringify(syn.credit).slice(0, 160));
      if (syn.only.length) {
        const vid = syn.only[0];
        check("[" + cfg.name + "] «Escucha y elige» nunca usa la voz sintética", (await page.evaluate((id) => window.__koox.tryListen(id), vid)) === false);
        await gotoTab(page, cfg, "diccionario");
        const lab = await page.evaluate((id) => {
          const k = window.__koox.audioFor("vocab", id).key, b = document.querySelector('#dict-list [data-au="' + k + '"]');
          const e = b && b.closest(".entry");
          return { cls: b ? b.className : "", tag: e ? (e.querySelector(".au-kind") || {}).textContent : "", guide: (document.querySelector("#guide .synth-note") || {}).textContent || "" };
        }, vid);
        check("[" + cfg.name + "] etiqueta «Voz sintética (aproximada)» junto al botón sintético", lab.tag === "Voz sintética (aproximada)" && /k-sintetico/.test(lab.cls), JSON.stringify(lab).slice(0, 120));
        check("[" + cfg.name + "] la guía de sonidos explica la voz sintética", /inteligencia artificial/.test(lab.guide) && /saltillo/.test(lab.guide), lab.guide.slice(0, 60));
        await gotoTab(page, cfg, "perfil");
        await tap(page, cfg, "#au-synth");
        await gotoTab(page, cfg, "diccionario");
        const off = await page.evaluate((id) => ({
          synth: window.__koox.state().settings.synth, ofrece: window.__koox.audioFor("vocab", id),
          botones: document.querySelectorAll("[data-au].k-sintetico").length, nativos: document.querySelectorAll("#dict-list [data-au].k-nativo").length,
          nota: !!document.querySelector("#guide .synth-note")
        }), vid);
        const before = await auState(page);
        const tried = await page.evaluate((id) => {
          const e = window.__koox.audioEntries().find((x) => x.kind === "sintetico" && x.vocab.includes(id));
          return { porTexto: window.__koox.audioFor("text", e.text), suena: window.__koox.playKey(e.key) };
        }, vid);
        check("[" + cfg.name + "] sin «Usar voz sintética»: no se muestra ni se ofrece (la nativa sigue)", off.synth === false && off.ofrece === null && tried.porTexto === null && off.botones === 0 && (off.nativos > 0 || !syn.hasNative) && !off.nota, JSON.stringify(off));
        check("[" + cfg.name + "] sin «Usar voz sintética»: nada sintético suena", tried.suena === false && (await auState(page)).plays === before.plays, JSON.stringify(tried));
        await gotoTab(page, cfg, "perfil");
        await tap(page, cfg, "#au-synth");
        check("[" + cfg.name + "] «Usar voz sintética» se vuelve a activar", (await page.evaluate(() => window.__koox.state().settings.synth)) === true);
      }
    }
    await tap(page, cfg, "#au-auto");
    await page.selectOption("#au-rate", "lenta");
    const set = await page.evaluate(() => window.__koox.state().settings);
    check("[" + cfg.name + "] los ajustes de audio se guardan", set.autoplay === false && set.rate === "lenta", JSON.stringify(set));
    await gotoTab(page, cfg, "aprender");
    await openLesson(page, cfg, target);
    const before = await auState(page);
    for (let g = 0; g < 20 && !(await page.$("#wc-play")) && ["teach", "vocab", "dialogue"].includes(await scr(page)); g++) await tap(page, cfg, "#btn-next");
    await page.waitForTimeout(300);
    const afterNo = await auState(page);
    check("[" + cfg.name + "] sin «Reproducir al presentar», la palabra no suena sola", afterNo.plays === before.plays, before.plays + " → " + afterNo.plays);
    if (await page.$("#wc-play")) {
      await tap(page, cfg, "#wc-play");
      await waitStarted(page, afterNo.started);
      check("[" + cfg.name + "] velocidad «Lenta» global: 0.75", (await auState(page)).rate === 0.75);
    }
    await leaveSession(page);

    // Repaso: también trae «Escucha y elige».
    if (info.native.length) {
      await page.evaluate((ids) => {
        const d = new Date(); d.setDate(d.getDate() - 1);
        const y = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
        const s = window.__koox.state();
        ids.forEach((id) => { s.srs[id] = { box: 1, due: y, right: 0, wrong: 0 }; });
        localStorage.setItem("koox-maaya-v2", JSON.stringify(s));
      }, info.native);
      await load(page);
      await gotoTab(page, cfg, "repasar");
      await tap(page, cfg, "#btn-start-review");
      const fr = await page.evaluate(fastRunInPage);
      check("[" + cfg.name + "] el repaso incluye «Escucha y elige» y se completa", fr.ok && (fr.types.listen || 0) >= 1, (fr.error || "") + " " + JSON.stringify(fr.types));
      await page.evaluate(() => { const b = document.querySelector("#btn-results-home"); if (b) b.click(); });
    }
  }

  // «Para escuchar más» (hoja de la lección) y «Escucha maya» (Perfil).
  if (info.resources) {
    await gotoTab(page, cfg, "aprender");
    let sheet = null;
    for (const id of lessons) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await tap(page, cfg, '[data-lesson="' + id + '"]');
      await page.waitForSelector("#lesson-sheet:not([hidden])");
      const links = await page.$$eval("#ls-modal .ls-listen a.res", (a) => a.map((x) => [x.getAttribute("target"), x.getAttribute("rel"), x.href, x.textContent]));
      if (links.length) { sheet = { id, links }; if (cfg.shots) await shot(page, cfg, "audio-sheet"); }
      await page.keyboard.press("Escape");
      await page.waitForTimeout(250);
      if (sheet) break;
    }
    check("[" + cfg.name + "] «Para escuchar más» en la hoja de la lección: enlaces externos", sheet && sheet.links.every((l) => l[0] === "_blank" && /noopener/.test(l[1]) && /^https:/.test(l[2])), sheet ? sheet.id + ": " + sheet.links.length : "ninguna lección");
    check("[" + cfg.name + "] cada recurso dice su fuente y su credibilidad", sheet && sheet.links.every((l) => /(Institucional|Hablante nativo|Docente|Otra fuente)/.test(l[3])), sheet && sheet.links[0] && sheet.links[0][3]);
    await gotoTab(page, cfg, "perfil");
    const all = await page.$$eval("#listen-box a.res", (a) => a.map((x) => [x.getAttribute("target"), x.getAttribute("rel"), x.href]));
    check("[" + cfg.name + "] Perfil → «Escucha maya» con todos los recursos", all.length === info.resources && all.every((l) => l[0] === "_blank" && /noopener/.test(l[1])), all.length + "/" + info.resources);
    await page.evaluate(() => { document.querySelector("#listen-box").open = true; const c = document.querySelector("#credits-box"); if (c) c.open = true; });
    await checkOverflow(page, cfg, "perfil con recursos y créditos");
    if (cfg.shots) { await page.evaluate(() => document.querySelector("#listen-title").scrollIntoView()); await shot(page, cfg, "audio-profile"); }
  } else {
    await gotoTab(page, cfg, "aprender");
    await page.evaluate(() => window.scrollTo(0, 0));
    await tap(page, cfg, '[data-lesson="' + lessons[0] + '"]');
    await page.waitForSelector("#lesson-sheet:not([hidden])");
    const has = await page.evaluate(() => !!document.querySelector("#ls-modal .ls-listen"));
    await page.keyboard.press("Escape");
    await gotoTab(page, cfg, "perfil");
    check("[" + cfg.name + "] sin recursos: sin «Para escuchar más» ni «Escucha maya»", !has && !(await page.$("#listen-title")));
  }
  const grabar = await page.evaluate(() => !!document.querySelector("#btn-grabar"));
  const grabarEsperado = await page.evaluate(() => window.KOOX_STANDALONE === true && window.KOOX_GRABAR === true);
  check("[" + cfg.name + "] «¿Hablas maya?» solo en el sitio con grabar.html", grabar === grabarEsperado, String(grabar));
  if (!FULL_DOC) {
    const files = await page.evaluate(() => ((window.COURSE_AUDIO && window.COURSE_AUDIO.entries) || []).map((e) => String(e.file).slice(0, 23)));
    check("[" + cfg.name + "] el Artifact no pide audio a ningún sitio (todo es data:)", !audioReqs.length && files.every((f) => f === "data:audio/mpeg;base64,"), audioReqs.slice(0, 2).join(", "));
  }
  check("[" + cfg.name + "] audio: sin errores de JavaScript", page.errors.length === 0, page.errors.slice(0, 5).join(" | "));
  await ctx.close();

  // Un audio que no carga: se oculta su botón y «Escucha y elige» sigue con el texto.
  if (info.native.length) {
    ({ ctx, page } = await newPage(browser, cfg));
    const vid = info.native[0];
    await page.addInitScript((id) => {
      let v;
      Object.defineProperty(window, "COURSE_AUDIO", {
        configurable: true, get() { return v; },
        set(x) {
          try { x.entries.forEach((e) => { if ((e.vocab || []).includes(id) && e.kind === "nativo") e.file = "data:audio/mpeg;base64,AAAAAAAAAAAAAAAA"; }); } catch (e) { /* sin efecto */ }
          v = x;
        }
      });
    }, vid);
    await load(page);
    await page.evaluate((id) => window.__koox.tryListen(id), vid);
    const fell = await page.waitForFunction(() => { const f = document.querySelector("#listen-fallback"); return f && !f.hidden; }, null, { timeout: 5000 }).then(() => true, () => false);
    const fb = await page.evaluate(() => ({ box: document.querySelector("#listen-box").hidden, errors: window.__koox.audioState().errors }));
    check("[" + cfg.name + "] audio dañado: «Escucha y elige» muestra el texto y oculta el botón", fell && fb.box && fb.errors >= 1, JSON.stringify(fb));
    await page.evaluate(() => window.__koox.solve());
    await tap(page, cfg, "#btn-check");
    check("[" + cfg.name + "] audio dañado: el ejercicio se puede contestar", (await scr(page)) === "feedback");
    await leaveSession(page);
    await gotoTab(page, cfg, "diccionario");
    const hidden = await page.evaluate((id) => {
      const failed = window.__koox.audio().failed, now = window.__koox.audioFor("vocab", id);
      const shown = [...document.querySelectorAll("#dict-list [data-au]")].filter((x) => !x.hidden && x.offsetParent !== null).map((x) => x.getAttribute("data-au"));
      return { failed, now: now ? now.key : null, shown: shown.length, shownBroken: shown.filter((k) => failed.includes(k)).length };
    }, vid);
    check("[" + cfg.name + "] audio dañado: ya no se ofrece y lo demás sigue", hidden.failed.length >= 1 && !hidden.failed.includes(hidden.now) && !hidden.shownBroken && (info.count < 2 || hidden.shown > 0), JSON.stringify(hidden));
    check("[" + cfg.name + "] audio dañado: sin errores de JavaScript", page.errors.length === 0, page.errors.slice(0, 3).join(" | "));
    await ctx.close();
  }
}

async function desktop(browser, cfg) {
  const { ctx, page } = await newPage(browser, cfg);
  await load(page);
  await tabsCheck(page, cfg, false);
  await gotoTab(page, cfg, "aprender");
  if (cfg.shots) await shot(page, cfg, "desktop-home");
  await page.click("#btn-resume");
  // Teclado: Enter avanza tarjetas; 1–4 eligen; Enter comprueba y continúa.
  let guard = 0;
  while (["teach", "vocab", "dialogue"].includes(await scr(page)) && guard++ < 60) await page.keyboard.press("Enter");
  check("[" + cfg.name + "] Enter avanza las tarjetas", (await scr(page)) === "exercise", await scr(page));
  await checkOverflow(page, cfg, "lección (ejercicio)");
  // Busca un ejercicio de opciones.
  for (let k = 0; k < 20; k++) {
    const p = await page.evaluate(() => window.__koox.peek());
    if (p && (p.type === "choice" || p.type === "fill")) break;
    await page.evaluate(() => window.__koox.solve());
    if ((await scr(page)) === "exercise") await page.click("#btn-check");
    await page.click("#btn-continue");
  }
  const p = await page.evaluate(() => window.__koox.peek());
  if (p && (p.type === "choice" || p.type === "fill")) {
    await page.keyboard.press("2");
    const pressed = await page.evaluate(() => document.querySelector("#opt-1").getAttribute("aria-pressed"));
    check("[" + cfg.name + "] la tecla 2 elige la opción 2", pressed === "true");
    await page.keyboard.press("Enter");
    check("[" + cfg.name + "] Enter comprueba", (await scr(page)) === "feedback", await scr(page));
    if (cfg.shots) await shot(page, cfg, "desktop-feedback");
    await page.keyboard.press("Enter");
    check("[" + cfg.name + "] Enter continúa", ["exercise", "results", "vocab", "teach", "dialogue"].includes(await scr(page)), await scr(page));
  } else check("[" + cfg.name + "] hay un ejercicio de opciones para probar el teclado", false);
  await page.keyboard.press("Escape");
  check("[" + cfg.name + "] Escape pide confirmar la salida", (await scr(page)) === "confirm");
  await page.keyboard.press("Escape");
  check("[" + cfg.name + "] Escape en la confirmación vuelve a la lección", (await scr(page)) !== "confirm");
  check("[" + cfg.name + "] sin errores de JavaScript", page.errors.length === 0, page.errors.slice(0, 5).join(" | "));
  await ctx.close();
}

(async () => {
  log("Ko'ox Maaya · pruebas de humo");
  log("Archivo: " + SRC + (FULL_DOC ? " (documento completo: se abre sin envolver)" : ""));
  log("Fuentes: " + prepareFonts());
  const browser = await chromium.launch();
  const MOBILE = { width: 390, height: 844 }, DESK = { width: 1280, height: 900 };
  const runs = [
    ["móvil claro (curso completo)", mobileFull, { name: "390-claro", viewport: MOBILE, mobile: true, scheme: "light", shots: true }],
    ["móvil oscuro", mobileDark, { name: "390-oscuro", viewport: MOBILE, mobile: true, scheme: "dark", shots: true }],
    ["escritorio claro", desktop, { name: "1280-claro", viewport: DESK, scheme: "light", shots: true }],
    ["escritorio oscuro", desktop, { name: "1280-oscuro", viewport: DESK, scheme: "dark" }],
    ["audio y recursos (claro)", audioRun, { name: "audio-claro", viewport: MOBILE, mobile: true, scheme: "light", shots: true }],
    ["audio y recursos (oscuro)", audioRun, { name: "audio-oscuro", viewport: MOBILE, mobile: true, scheme: "dark", shots: true }],
    ["robustez (sin curso, contenido degradado, sin almacenamiento)", robustness, { name: "robustez", viewport: { width: 360, height: 740 }, mobile: true, scheme: "light" }]
  ];
  for (const [label, fn, cfg] of runs) {
    const t = Date.now();
    log("\n▸ " + label);
    try { await fn(browser, cfg); }
    catch (e) { check("[" + cfg.name + "] ejecución sin excepciones", false, (e && e.message || String(e)).split("\n")[0]); }
    log("  (" + ((Date.now() - t) / 1000).toFixed(1) + " s)");
  }
  await browser.close();
  const failed = results.filter((r) => !r.pass);
  log("\nResumen: " + (results.length - failed.length) + "/" + results.length + " comprobaciones correctas en " + ((Date.now() - T0) / 1000).toFixed(1) + " s");
  log("Capturas: " + SHOTS);
  if (failed.length) {
    log("FALLAS:");
    failed.forEach((f) => log("  ✗ " + f.name + (f.detail ? " — " + f.detail : "")));
    process.exit(1);
  }
  log("OK");
})().catch((e) => { console.error(e); process.exit(1); });
