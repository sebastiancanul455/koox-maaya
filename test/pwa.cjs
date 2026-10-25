#!/usr/bin/env node
// Pruebas de la versión web instalable (PWA) de Ko'ox Maaya, sobre site/ (node build-web.mjs).
//   node test/pwa.cjs [carpeta-del-sitio] [--sin-humo] [--artifact <html>]
//   (en el repositorio, donde el sitio está en la raíz: node test/pwa.cjs .)
// El html del Artifact (para comprobar que no cambia) se busca en --artifact, en la ruta de
// build.local.json (artifactOut) o en dist/koox-maaya-artifact.html, como hace build.mjs.
// Levanta un servidor estático local que imita GitHub Pages (sitio de proyecto en /koox-maaya/,
// Cache-Control: max-age=600) y comprueba con Chromium: archivos y manifest, service worker,
// sección de instalación, aviso de versión nueva, modo sin conexión y el modo Artifact intacto.
// Al final corre la prueba de humo (test/smoke.cjs) contra site/index.html.
// Capturas en test/shots-web. Sale con código 1 si algo falla.
"use strict";
const fs = require("fs");
const path = require("path");
const http = require("http");
const crypto = require("crypto");
const { spawnSync } = require("child_process");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");
const args = process.argv.slice(2);
const iArt = args.indexOf("--artifact");
const artArg = iArt >= 0 ? args[iArt + 1] : null;
const posicionales = args.filter((a, i) => !a.startsWith("--") && !(iArt >= 0 && i === iArt + 1));
const SITE = path.resolve(posicionales[0] || path.join(ROOT, "site"));
const RUN_SMOKE = !args.includes("--sin-humo");
function artifactPath() {
  if (artArg) return path.resolve(artArg);
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "build.local.json"), "utf8"));
    if (cfg && typeof cfg.artifactOut === "string" && cfg.artifactOut.trim()) return path.resolve(ROOT, cfg.artifactOut.trim());
  } catch (e) { /* sin build.local.json */ }
  return path.join(ROOT, "dist", "koox-maaya-artifact.html");
}
const ARTIFACT = artifactPath(); // node build.mjs
const ARTIFACT_V3 = path.join(ROOT, "backup-v3", "koox-maaya.html"); // referencia: la v3 publicada
const SHOTS = path.join(__dirname, "shots-web");
const FONT_DIR = path.join(__dirname, ".fontcache");
const BASE = "/koox-maaya/";
fs.mkdirSync(SHOTS, { recursive: true });

const T0 = Date.now();
const results = [];
function check(name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail == null ? "" : String(detail) });
  console.log("  " + (pass ? "✓" : "✗") + " " + name + (detail != null && detail !== "" ? " — " + detail : ""));
  return !!pass;
}
const log = (s) => console.log(s);
const hash = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 16);

// ---------- Archivos del sitio ----------
function pngSize(file) {
  const b = fs.readFileSync(file);
  const sig = b.slice(0, 8).toString("hex") === "89504e470d0a1a0a" && b.slice(12, 16).toString() === "IHDR";
  return sig ? { w: b.readUInt32BE(16), h: b.readUInt32BE(20) } : null;
}
function staticChecks() {
  log("\n▸ archivos del sitio");
  const read = (f) => fs.readFileSync(path.join(SITE, f), "utf8");
  for (const f of ["index.html", "manifest.webmanifest", "sw.js", ".nojekyll"]) check("existe " + f, fs.existsSync(path.join(SITE, f)));
  const index = read("index.html");
  const head = (index.split(/<\/head>/i)[0] || "");
  check("index.html es un documento completo", /^<!doctype html>\s*<html lang="es">\s*<head>/i.test(index) && /<\/head>\s*<body>/i.test(index) && /<\/body>\s*<\/html>\s*$/i.test(index));
  check("cabecera: charset y viewport", /<meta charset="utf-8">/i.test(head) && head.includes('<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'));
  check("cabecera: título y descripción", head.includes("<title>Ko'ox Maaya</title>") && /<meta name="description" content="[^"]{20,}">/.test(head));
  check("cabecera: theme-color claro y oscuro", /<meta name="theme-color" content="#[0-9a-f]{6}" media="\(prefers-color-scheme: light\)">/.test(head) && /<meta name="theme-color" content="#[0-9a-f]{6}" media="\(prefers-color-scheme: dark\)">/.test(head));
  check("cabecera: manifest e íconos", head.includes('<link rel="manifest" href="manifest.webmanifest">') && /<link rel="icon" href="icons\/favicon\.svg"/.test(head) && /<link rel="apple-touch-icon" href="icons\/apple-touch-icon\.png">/.test(head));
  check("cabecera: estilos del shell y reset del envoltorio", (head.match(/<style>/g) || []).length === 2 && head.includes("[hidden] { display: none !important }") && head.includes("--yaax"));
  check("cabecera: sin metadatos propios de claude.ai", !/claude:/.test(head));
  const iStd = index.indexOf("window.KOOX_STANDALONE = true"), iApp = index.indexOf("window.__koox = {");
  check("KOOX_STANDALONE antes del script de la app", iStd > 0 && iApp > iStd);
  check("el cuerpo no contiene <title>/<meta>/<link> del shell", !/<title>|<meta |<link /.test(index.split(/<body>/i)[1].split("<script>")[0]));
  const build = (/window\.KOOX_BUILD = "([0-9a-f]{12})"/.exec(index) || [])[1];
  const sw = read("sw.js");
  const swVer = (/const VERSION = "([^"]+)"/.exec(sw) || [])[1];
  check("sw.js lleva la misma versión que index.html", build && swVer === build, build + " / " + swVer);
  const pre = JSON.parse((/const PRECACHE = (\[[^\]]*\])/.exec(sw) || [])[1] || "[]");
  check("precarga: index, manifest e íconos que existen", pre.includes("index.html") && pre.includes("manifest.webmanifest") && pre.filter((p) => p.startsWith("icons/")).length >= 4 && pre.every((p) => fs.existsSync(path.join(SITE, p))), pre.join(", "));
  let man = null;
  try { man = JSON.parse(read("manifest.webmanifest")); } catch (e) { /* abajo */ }
  check("manifest: JSON válido", !!man);
  man = man || {};
  check("manifest: nombre, idioma, inicio y alcance", man.name === "Ko'ox Maaya" && man.short_name === "Ko'ox Maaya" && man.lang === "es" && man.start_url === "./" && man.scope === "./" && man.display === "standalone");
  check("manifest: colores, descripción y categoría", /^#[0-9a-f]{6}$/.test(man.background_color) && /^#[0-9a-f]{6}$/.test(man.theme_color) && (man.description || "").length > 20 && (man.categories || []).includes("education"));
  const icons = man.icons || [];
  const want = [["192x192", "any"], ["512x512", "any"], ["512x512", "maskable"]];
  check("manifest: íconos 192, 512 y maskable 512", want.every(([s, p]) => icons.some((i) => i.sizes === s && (i.purpose || "any").split(/\s+/).includes(p))), JSON.stringify(icons.map((i) => i.sizes + " " + i.purpose)));
  for (const i of icons) {
    const f = path.join(SITE, i.src);
    const dim = fs.existsSync(f) ? pngSize(f) : null;
    check("ícono " + i.src + " existe y mide " + i.sizes, dim && dim.w + "x" + dim.h === i.sizes && i.type === "image/png", dim ? dim.w + "x" + dim.h : "no existe o no es PNG");
  }
  const at = path.join(SITE, "icons/apple-touch-icon.png");
  const atd = fs.existsSync(at) ? pngSize(at) : null;
  check("apple-touch-icon 180×180", atd && atd.w === 180 && atd.h === 180);
  check("favicon.svg es SVG", /^<svg[\s\S]*<\/svg>\s*$/.test(read("icons/favicon.svg")));
  return { build, man };
}

// ---------- Servidor estático (imita GitHub Pages) ----------
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml",
  ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8", ".woff2": "font/woff2"
};
function startServer(version) {
  const st = { bump: "", hits: {}, version };
  const wrap = (html) => "<!doctype html><html lang=es><head><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1,viewport-fit=cover'></head><body>" + html + "</body></html>";
  const sockets = new Set();
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://x");
    const p = decodeURIComponent(url.pathname);
    const send = (code, type, body) => {
      res.writeHead(code, { "content-type": type, "cache-control": "max-age=600", "x-content-type-options": "nosniff" });
      res.end(body);
    };
    // Página del Artifact (fuera del alcance del service worker), envuelta como en claude.ai.
    if (p === "/artifact/" || p === "/artifact-v3/") {
      const f = p === "/artifact/" ? ARTIFACT : ARTIFACT_V3;
      return fs.existsSync(f) ? send(200, MIME[".html"], wrap(fs.readFileSync(f, "utf8"))) : send(404, MIME[".txt"], "no existe");
    }
    if (p === "/" || p === "/koox-maaya") { res.writeHead(301, { location: BASE }); return res.end(); }
    if (!p.startsWith(BASE)) return send(404, MIME[".txt"], "404");
    let rel = p.slice(BASE.length) || "index.html";
    if (rel.endsWith("/")) rel += "index.html";
    const file = path.resolve(SITE, rel);
    if (!file.startsWith(SITE + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(404, MIME[".txt"], "404");
    st.hits[rel] = (st.hits[rel] || 0) + 1;
    const type = MIME[path.extname(file).toLowerCase()] || "application/octet-stream";
    let body = fs.readFileSync(file);
    // «Publica» una versión nueva: cambia la versión en index.html y sw.js.
    if (st.bump && (rel === "index.html" || rel === "sw.js")) body = body.toString("utf8").split(version).join(version + "-" + st.bump);
    send(200, type, body);
  });
  server.on("connection", (s) => { sockets.add(s); s.on("close", () => sockets.delete(s)); });
  st.listen = () => new Promise((r) => server.listen(st.port || 0, "127.0.0.1", () => { st.port = server.address().port; r(); }));
  st.stop = () => new Promise((r) => { server.close(() => r()); for (const s of sockets) s.destroy(); });
  st.server = server;
  return st;
}

// ---------- Fuentes: de la caché local de la prueba de humo (si existe); si no, se cortan ----------
const fontMap = new Map();
function loadFontCache(index) {
  const m = /https:\/\/fonts\.googleapis\.com\/css2\?[^"'<>\s]+/.exec(index);
  if (!m) return "sin hoja de fuentes";
  const cssUrl = m[0].replace(/&amp;/g, "&");
  const cssFile = path.join(FONT_DIR, hash(cssUrl) + ".css");
  if (!fs.existsSync(cssFile)) return "sin caché local (las fuentes se cortan; se usan las de respaldo)";
  fontMap.set(cssUrl, { file: cssFile, type: "text/css; charset=utf-8" });
  for (const u of new Set(fs.readFileSync(cssFile, "utf8").match(/https:\/\/fonts\.gstatic\.com\/[^)'"\s]+/g) || [])) {
    const f = path.join(FONT_DIR, hash(u) + ".woff2");
    if (fs.existsSync(f)) fontMap.set(u, { file: f, type: "font/woff2" });
  }
  return fontMap.size + " archivos de la caché local";
}
const FONT_RE = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//;
const fontRoute = (route) => {
  const hit = fontMap.get(route.request().url());
  if (hit) return route.fulfill({ status: 200, contentType: hit.type, headers: { "access-control-allow-origin": "*" }, body: fs.readFileSync(hit.file) });
  return route.abort();
};

// ---------- Página ----------
async function newPage(browser, scheme) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, colorScheme: scheme, deviceScaleFactor: 1
  });
  await ctx.route(FONT_RE, fontRoute);
  // Ningún diálogo del navegador (alert/confirm/prompt) debe usarse.
  await ctx.addInitScript(() => {
    window.__dialogs = [];
    ["alert", "confirm", "prompt"].forEach((k) => { window[k] = function () { window.__dialogs.push(k); return k === "confirm" ? false : null; }; });
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  page.errors = [];
  const isFont = (s) => /fonts\.(googleapis|gstatic)\.com/.test(s);
  page.on("pageerror", (e) => page.errors.push("pageerror: " + e.message));
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const loc = (msg.location() && msg.location().url) || "";
    if (isFont(loc + " " + msg.text())) return;
    if (page.allowNetErrors && /ERR_INTERNET_DISCONNECTED|ERR_CONNECTION_REFUSED|Failed to fetch|net::ERR/.test(msg.text())) return;
    page.errors.push("console.error: " + msg.text() + (loc ? " @ " + loc : ""));
  });
  page.on("dialog", (d) => { page.errors.push("diálogo del navegador: " + d.type()); d.dismiss().catch(() => {}); });
  return { ctx, page };
}
async function waitApp(page) {
  await page.waitForFunction(() => window.__koox && typeof window.__koox.screen === "function", null, { timeout: 8000 });
}
async function shot(page, name, scheme) {
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(SHOTS, name + "-" + scheme + ".png") });
}
const tap = (page, sel) => page.tap(sel);
async function gotoTab(page, t) {
  await tap(page, "#tab-" + t);
  await page.waitForFunction((v) => window.__koox.screen() === v, { aprender: "home", repasar: "review", diccionario: "dict", perfil: "profile" }[t]);
}
async function openLesson(page, id) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await tap(page, '[data-lesson="' + id + '"]');
  await page.waitForSelector("#lesson-sheet:not([hidden]) #btn-start-lesson");
  await tap(page, "#btn-start-lesson");
  await page.waitForFunction(() => ["teach", "vocab", "dialogue", "exercise"].includes(window.__koox.screen()));
}
// Recorre la sesión actual hasta resultados (como la prueba de humo, sin pausas).
function runSession() {
  const K = window.__koox, q = (s) => document.querySelector(s);
  const out = { ok: false, steps: 0, ex: 0 };
  for (let guard = 0; guard < 600; guard++) {
    const s = K.screen();
    out.steps++;
    if (s === "results") { out.ok = true; return out; }
    if (s === "teach" || s === "vocab" || s === "dialogue") { q("#btn-next").click(); continue; }
    if (s === "exercise") {
      out.ex++;
      if (!K.solve()) { out.error = "solve() no pudo contestar"; return out; }
      if (K.screen() === "exercise") { const b = q("#btn-check"); if (!b || b.disabled || b.hidden) { out.error = "sin Comprobar"; return out; } b.click(); }
      if (K.screen() !== "feedback" || q("#feedback").classList.contains("bad")) { out.error = "respuesta no aceptada"; return out; }
      continue;
    }
    if (s === "feedback") { q("#btn-continue").click(); continue; }
    out.error = "pantalla inesperada: " + s; return out;
  }
  out.error = "demasiados pasos"; return out;
}
const swState = (page) => page.evaluate(async () => {
  const reg = await navigator.serviceWorker.getRegistration();
  return {
    scope: reg ? reg.scope : null,
    active: reg && reg.active ? reg.active.state : null,
    controlled: !!navigator.serviceWorker.controller,
    caches: await caches.keys()
  };
});

// ---------- Recorrido principal (móvil claro) ----------
async function mainFlow(browser, srv, info) {
  const origin = "http://localhost:" + srv.port;
  const URL_APP = origin + BASE;
  const { ctx, page } = await newPage(browser, "light");
  const v0 = info.build;

  log("\n▸ primera visita");
  await page.goto(URL_APP, { waitUntil: "load" });
  await waitApp(page);
  check("carga la app en " + BASE, (await page.evaluate(() => window.__koox.screen())) === "home");
  check("window.KOOX_STANDALONE es true", (await page.evaluate(() => window.KOOX_STANDALONE)) === true);
  check("window.KOOX_BUILD es la versión del sitio", (await page.evaluate(() => window.KOOX_BUILD)) === v0, v0);
  const theme = await page.evaluate(() => ({
    bg: getComputedStyle(document.documentElement).getPropertyValue("--bg").trim(),
    light: (document.querySelector('meta[name="theme-color"][media*="light"]') || {}).content,
    live: (document.querySelector("#meta-theme") || {}).content
  }));
  check("theme-color coincide con el fondo", theme.bg === theme.light && theme.live === theme.bg, JSON.stringify(theme));

  // Manifest tal como lo sirve el servidor y tal como lo entiende Chromium.
  const mf = await page.evaluate(async () => {
    const href = document.querySelector('link[rel="manifest"]').href;
    const r = await fetch(href);
    const type = r.headers.get("content-type");
    const json = await r.json();
    const icons = await Promise.all((json.icons || []).map((i) => new Promise((res) => {
      const img = new Image();
      img.onload = () => res({ src: i.src, sizes: i.sizes, real: img.naturalWidth + "x" + img.naturalHeight });
      img.onerror = () => res({ src: i.src, sizes: i.sizes, real: "error" });
      img.src = new URL(i.src, href).href;
    })));
    return { status: r.status, type, icons };
  });
  check("el manifest se descarga como application/manifest+json", mf.status === 200 && /^application\/manifest\+json/.test(mf.type), mf.type);
  check("los íconos del manifest cargan con el tamaño declarado", mf.icons.length >= 3 && mf.icons.every((i) => i.real === i.sizes), JSON.stringify(mf.icons));
  const cdp = await ctx.newCDPSession(page);
  const am = await cdp.send("Page.getAppManifest");
  check("Chromium lee el manifest sin errores", am.errors.length === 0 && /manifest\.webmanifest$/.test(am.url), am.errors.map((e) => e.message).join(" | "));

  log("\n▸ service worker");
  await page.waitForFunction(async () => {
    const r = await navigator.serviceWorker.getRegistration();
    return !!(r && r.active && r.active.state === "activated");
  }, null, { timeout: 15000, polling: 200 });
  let sw = await swState(page);
  check("el service worker se activa con alcance " + BASE, sw.active === "activated" && sw.scope === URL_APP, JSON.stringify(sw));
  check("caché con la versión del contenido", sw.caches.includes("koox-maaya-" + v0), sw.caches.join(", "));
  const cached = await page.evaluate(async (name) => (await (await caches.open(name)).keys()).map((r) => new URL(r.url).pathname), "koox-maaya-" + v0);
  check("precargó index, manifest e íconos", cached.some((p) => p.endsWith("/index.html")) && cached.some((p) => p.endsWith("/manifest.webmanifest")) && cached.filter((p) => p.includes("/icons/")).length >= 4, cached.join(", "));
  await page.reload({ waitUntil: "load" });
  await waitApp(page);
  sw = await swState(page);
  check("tras recargar, el service worker controla la página", sw.controlled);
  const inst = await cdp.send("Page.getInstallabilityErrors").catch((e) => ({ installabilityErrors: [{ errorId: "cdp: " + e.message }] }));
  // Los contextos de Playwright son de incógnito: ese aviso no depende del sitio.
  const instErr = (inst.installabilityErrors || []).map((e) => e.errorId).filter((id) => id !== "in-incognito");
  check("Chromium la considera instalable", instErr.length === 0, instErr.join(", ") || "sin errores" + ((inst.installabilityErrors || []).length ? " (aparte de in-incognito)" : ""));
  await shot(page, "pwa-home", "light");

  log("\n▸ instalar (Perfil)");
  await gotoTab(page, "perfil");
  let ins = await page.evaluate(() => {
    const sec = document.querySelector("#install-title").parentNode;
    const b = document.querySelector("#btn-install");
    return { text: sec.textContent, btn: !!b, hidden: b ? b.hidden : null };
  });
  check("explica la instalación como app desde el menú ⋮ de Chrome", /menú ⋮/.test(ins.text) && /«Instalar app»/.test(ins.text) && /«Agregar a la pantalla principal»/.test(ins.text), ins.text.slice(0, 120));
  check("dice que funciona sin conexión después de la primera visita", /primera visita funciona sin conexión/.test(ins.text));
  check("no repite que necesita internet", !/Necesita conexión a internet/.test(ins.text));
  check("el botón «Instalar app» espera a beforeinstallprompt", ins.btn && ins.hidden === true);
  await page.evaluate(() => {
    const e = new Event("beforeinstallprompt", { cancelable: true });
    e.prompt = () => { window.__installPrompted = (window.__installPrompted || 0) + 1; return Promise.resolve(); };
    e.userChoice = Promise.resolve({ outcome: "accepted", platform: "web" });
    window.__bipPrevented = !window.dispatchEvent(e);
  });
  ins = await page.evaluate(() => ({ hidden: document.querySelector("#btn-install").hidden, label: document.querySelector("#btn-install").textContent, prevented: window.__bipPrevented }));
  check("con beforeinstallprompt aparece el botón «Instalar app»", ins.hidden === false && /Instalar app/.test(ins.label) && ins.prevented, JSON.stringify(ins));
  await page.evaluate(() => document.querySelector("#install-title").scrollIntoView({ block: "start" }));
  await shot(page, "pwa-install", "light");
  await tap(page, "#btn-install");
  await page.waitForFunction(() => !document.querySelector("#btn-install"), null, { timeout: 3000 }).catch(() => {});
  ins = await page.evaluate(() => ({ prompted: window.__installPrompted, btn: !!document.querySelector("#btn-install"), text: document.querySelector("#install-title").parentNode.textContent }));
  check("el botón llama a prompt() y, aceptado, dice que quedó instalada", ins.prompted === 1 && !ins.btn && /quedó instalada/.test(ins.text), JSON.stringify(ins).slice(0, 160));
  await gotoTab(page, "aprender");

  log("\n▸ versión nueva");
  srv.bump = "b";
  await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r.update()));
  await page.waitForSelector("#update-note #btn-update", { timeout: 15000 }).catch(() => {});
  const un = await page.evaluate(() => {
    const n = document.querySelector("#update-note");
    if (!n) return null;
    const r = n.getBoundingClientRect(), nav = document.querySelector("#navbar").getBoundingClientRect();
    return { text: n.textContent, role: n.getAttribute("role"), visible: !n.hidden && r.height > 0, aboveNav: r.bottom <= nav.top + 1, inView: r.left >= 0 && r.right <= innerWidth };
  });
  check("aparece el aviso «Hay una versión nueva» con «Actualizar»", un && /Hay una versión nueva/.test(un.text) && /Actualizar/.test(un.text) && un.visible && un.role === "status", JSON.stringify(un));
  check("el aviso no tapa la barra de navegación ni se sale", un && un.aboveNav && un.inView);
  await shot(page, "pwa-update", "light");
  sw = await swState(page);
  check("activate borró la caché vieja y dejó la nueva", sw.caches.includes("koox-maaya-" + v0 + "-b") && !sw.caches.includes("koox-maaya-" + v0), sw.caches.join(", "));
  await Promise.all([page.waitForNavigation({ waitUntil: "load" }), tap(page, "#btn-update")]);
  await waitApp(page);
  const after = await page.evaluate(() => ({ build: window.KOOX_BUILD, note: !!document.querySelector("#update-note") }));
  check("«Actualizar» recarga con la versión nueva y sin aviso", after.build === v0 + "-b" && !after.note, JSON.stringify(after));

  // Una actualización durante una lección espera a que termine.
  const lessons = await page.evaluate(() => window.__koox.lessons());
  await openLesson(page, lessons[0]);
  srv.bump = "c";
  await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r.update()));
  await page.waitForFunction((n) => caches.keys().then((k) => k.includes(n)), "koox-maaya-" + v0 + "-c", { timeout: 15000, polling: 200 }).catch(() => {});
  await page.waitForTimeout(400);
  const during = await page.evaluate(() => { const n = document.querySelector("#update-note"); return { screen: window.__koox.screen(), note: !!(n && !n.hidden && n.textContent) }; });
  check("durante una lección no interrumpe con el aviso", during.screen !== "home" && !during.note, JSON.stringify(during));
  await tap(page, "#btn-close");
  await tap(page, "#btn-confirm-exit");
  await page.waitForSelector("#update-note #btn-update", { timeout: 3000 }).catch(() => {});
  check("al salir de la lección aparece el aviso", await page.evaluate(() => { const n = document.querySelector("#update-note"); return !!(n && !n.hidden && /Hay una versión nueva/.test(n.textContent)); }));
  await tap(page, "#btn-update-close");
  check("el aviso se puede cerrar", await page.evaluate(() => document.querySelector("#update-note").hidden));
  await page.reload({ waitUntil: "load" });
  await waitApp(page);
  check("al recargar queda en la versión nueva", (await page.evaluate(() => window.KOOX_BUILD)) === v0 + "-c");

  log("\n▸ sin conexión");
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 8000 });
  await srv.stop();               // el servidor deja de responder…
  await ctx.unroute(FONT_RE);     // …las fuentes solo pueden salir de la caché del service worker…
  await ctx.setOffline(true);     // …y el navegador queda sin red.
  page.allowNetErrors = true;
  check("el navegador se declara sin conexión", (await page.evaluate(() => navigator.onLine)) === false);
  const off = await page.evaluate(() => fetch(location.href).then(() => "respondió", (e) => "falló: " + e.message)).catch((e) => "error: " + e.message);
  check("sin red: la página se sirve desde el service worker", /respondió/.test(off), off);
  await page.reload({ waitUntil: "load" });
  await waitApp(page);
  // (Tras recargar una página del service worker, Chromium no reaplica la emulación a navigator.onLine;
  // por eso se comprueba que la red de verdad no responde: una ruta fuera del alcance del service worker.)
  const offState = await page.evaluate(async () => ({
    screen: window.__koox.screen(), std: window.KOOX_STANDALONE, build: window.KOOX_BUILD,
    nodes: document.querySelectorAll("[data-lesson]").length,
    net: await fetch("/artifact/", { cache: "no-store" }).then(() => "respondió", () => "sin red")
  }));
  check("sin conexión, la recarga muestra la app", offState.screen === "home" && offState.std === true && offState.nodes > 0 && offState.net === "sin red", JSON.stringify(offState));
  await openLesson(page, lessons[1] || lessons[0]);
  const first = await page.evaluate(() => window.__koox.screen());
  await page.evaluate(() => { const b = document.querySelector("#btn-next"); if (b && !b.hidden) b.click(); });
  await shot(page, "pwa-offline-lesson", "light");
  const fr = await page.evaluate(runSession);
  check("sin conexión se abre y se completa una lección", fr.ok && fr.ex > 0, first + " → " + (fr.error || "resultados") + " · " + fr.ex + " ejercicios");
  const offMf = await page.evaluate(() => fetch("manifest.webmanifest").then((r) => r.ok, () => false));
  check("sin conexión, el manifest sale de la caché", offMf);
  const fontsCached = await page.evaluate(async () => (await caches.has("koox-maaya-fonts")) ? (await (await caches.open("koox-maaya-fonts")).keys()).length : 0);
  log("  · fuentes guardadas por el service worker: " + fontsCached);
  check("sin diálogos del navegador (alert/confirm/prompt)", (await page.evaluate(() => window.__dialogs.length)) === 0);
  check("sin errores de JavaScript ni de consola", page.errors.length === 0, page.errors.slice(0, 4).join(" | "));
  await ctx.close();
}

// ---------- Modo oscuro: capturas ----------
async function darkFlow(browser, srv) {
  log("\n▸ modo oscuro (capturas)");
  const { ctx, page } = await newPage(browser, "dark");
  await page.goto("http://localhost:" + srv.port + BASE, { waitUntil: "load" });
  await waitApp(page);
  await shot(page, "pwa-home", "dark");
  await gotoTab(page, "perfil");
  await page.evaluate(() => {
    const e = new Event("beforeinstallprompt", { cancelable: true });
    e.prompt = () => Promise.resolve(); e.userChoice = Promise.resolve({ outcome: "dismissed" });
    window.dispatchEvent(e);
    document.querySelector("#install-title").scrollIntoView({ block: "start" });
  });
  await shot(page, "pwa-install", "dark");
  await gotoTab(page, "aprender");
  // Mensaje como el que manda el service worker al activar otra versión.
  await page.evaluate(() => navigator.serviceWorker.dispatchEvent(new MessageEvent("message", { data: { type: "koox-sw-updated", version: "otra" } })));
  await page.waitForSelector("#update-note #btn-update", { timeout: 3000 }).catch(() => {});
  check("[oscuro] el aviso de versión nueva se muestra", await page.evaluate(() => !!document.querySelector("#update-note #btn-update")));
  await shot(page, "pwa-update", "dark");
  await page.evaluate(() => navigator.serviceWorker.dispatchEvent(new MessageEvent("message", { data: { type: "koox-sw-updated", version: window.KOOX_BUILD } })));
  check("[oscuro] sin errores", page.errors.length === 0, page.errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// ---------- El Artifact queda como antes ----------
async function artifactFlow(browser, srv) {
  log("\n▸ modo Artifact (sin KOOX_STANDALONE)");
  if (!fs.existsSync(ARTIFACT)) { check("existe el html del Artifact (node build.mjs)", false, ARTIFACT); return; }
  const sectionOf = async (url) => {
    const { ctx, page } = await newPage(browser, "light");
    await page.goto(url, { waitUntil: "load" });
    await waitApp(page);
    await page.evaluate(() => {
      const e = new Event("beforeinstallprompt", { cancelable: true });
      e.prompt = () => Promise.resolve(); e.userChoice = Promise.resolve({ outcome: "dismissed" });
      window.dispatchEvent(e);
      navigator.serviceWorker && navigator.serviceWorker.dispatchEvent(new MessageEvent("message", { data: { type: "koox-sw-updated", version: "otra" } }));
    });
    await gotoTab(page, "perfil");
    await page.waitForTimeout(150);
    const r = await page.evaluate(() => ({
      std: window.KOOX_STANDALONE, html: document.querySelector("#install-title").parentNode.outerHTML,
      btn: !!document.querySelector("#btn-install"), note: !!document.querySelector("#update-note"),
      sw: navigator.serviceWorker ? navigator.serviceWorker.controller : null
    }));
    r.errors = page.errors.slice();
    await ctx.close();
    return r;
  };
  const now = await sectionOf("http://localhost:" + srv.port + "/artifact/");
  check("KOOX_STANDALONE no está definido", now.std === undefined);
  check("sin botón de instalar ni aviso de versión", !now.btn && !now.note && !now.sw);
  check("conserva el texto de siempre", /Necesita conexión a internet para abrirse/.test(now.html));
  if (fs.existsSync(ARTIFACT_V3)) {
    const v3 = await sectionOf("http://localhost:" + srv.port + "/artifact-v3/");
    check("la sección «Instalar en Android» es idéntica a la de la v3", now.html === v3.html);
  } else log("  · AVISO: no está " + ARTIFACT_V3 + "; no se compara con la v3");
  check("[Artifact] sin errores", now.errors.length === 0, now.errors.slice(0, 3).join(" | "));
}

(async () => {
  log("Ko'ox Maaya · pruebas de la versión web (PWA)");
  log("Sitio: " + SITE);
  if (!fs.existsSync(path.join(SITE, "index.html"))) { console.error("No existe " + SITE + "/index.html: ejecuta  node build-web.mjs"); process.exit(1); }
  const info = staticChecks();
  log("Fuentes: " + loadFontCache(fs.readFileSync(path.join(SITE, "index.html"), "utf8")));
  const srv = startServer(info.build);
  await srv.listen();
  log("Servidor: http://localhost:" + srv.port + BASE);
  const browser = await chromium.launch();
  try {
    await artifactFlow(browser, srv);
    await darkFlow(browser, srv);
    await mainFlow(browser, srv, info); // deja el servidor detenido (prueba sin conexión)
  } catch (e) {
    check("ejecución sin excepciones", false, (e && e.message || String(e)).split("\n")[0]);
  } finally {
    await browser.close();
    await srv.stop().catch(() => {});
  }
  log("\nResumen PWA: " + results.filter((r) => r.pass).length + "/" + results.length + " comprobaciones correctas en " + ((Date.now() - T0) / 1000).toFixed(1) + " s");
  log("Capturas: " + SHOTS);

  let smokeOk = true;
  if (RUN_SMOKE) {
    log("\n▸ prueba de humo contra " + path.join(SITE, "index.html"));
    const r = spawnSync(process.execPath, [path.join(__dirname, "smoke.cjs"), path.join(SITE, "index.html")], {
      stdio: "inherit", env: Object.assign({}, process.env, { KOOX_SHOTS: SHOTS })
    });
    smokeOk = r.status === 0;
    check("prueba de humo (test/smoke.cjs) sobre site/index.html", smokeOk, "código " + r.status);
  }
  const failed = results.filter((r) => !r.pass);
  if (failed.length) {
    log("\nFALLAS:");
    failed.forEach((f) => log("  ✗ " + f.name + (f.detail ? " — " + f.detail : "")));
    process.exit(1);
  }
  log("\nOK");
})().catch((e) => { console.error(e); process.exit(1); });
