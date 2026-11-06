#!/usr/bin/env node
// Pruebas de extremo a extremo de la página de grabación (src/web/grabar.html) con Playwright (Chromium).
//   node test/grabar.cjs
// Arma una copia temporal de la página (el marcador de contenido se sustituye por src/content/u1..uN.js y un
// catálogo de audio de prueba), la sirve por http://localhost y la abre con un micrófono falso que reproduce
// un WAV sintético (voz simulada entre silencios). Comprueba: consentimiento obligatorio, grabación de una
// letra, una palabra y un ejemplo, recorte de silencios, persistencia en IndexedDB tras recargar, exportación
// del ZIP (estructura, CRC, WAV mono de 16 bits a 44.1 kHz), importación con tools/import-recordings.mjs a una
// COPIA temporal del repositorio (nunca al catálogo real), rechazo de ZIP peligrosos o sin consentimiento,
// borrado con confirmación en la página, respaldo sin IndexedDB, ninguna petición a otros servidores, sin
// diálogos del navegador, sin errores de consola y sin scroll horizontal a 360, 390 y 420 px en claro y oscuro.
// También: permisos por capas (publicar, licencia «Solo para Ko'ox Maaya» por omisión, uso para IA, crédito y
// comunidad; sin consentimiento no se graba), el modo acompañado (orden del curso, palabra maya oculta hasta
// después de grabar, variante, repetir, saltar, pausa, fin de la lista y exportar), el perfil de la versión
// anterior y la importación de un ZIP acompañado a la copia temporal (la variante crea una entrada con vocab
// vacío y notes; la licencia nueva la acepta validate.cjs y creditos.mjs --check).
// Capturas en test/shots-grabar (o en la carpeta de KOOX_SHOTS). Sale con código 1 si algo falla.
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const zlib = require("zlib");
const crypto = require("crypto");
const { execFileSync, spawnSync } = require("child_process");
const { pathToFileURL } = require("url");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const SHOTS = process.env.KOOX_SHOTS ? path.resolve(process.env.KOOX_SHOTS) : path.join(__dirname, "shots-grabar");
const FONT_DIR = path.join(__dirname, ".fontcache");
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "koox-grabar-test-"));
const SITE = path.join(TMP, "site");
fs.mkdirSync(SHOTS, { recursive: true });
fs.mkdirSync(SITE, { recursive: true });

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass: !!pass });
  if (!pass || process.env.VERBOSE) console.log("  " + (pass ? "✓" : "✗") + " " + name + (detail ? " — " + detail : ""));
  return !!pass;
}
const log = (s) => console.log(s);
const sha = (f) => (fs.existsSync(f) ? crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex") : "(no existe)");

// ---------------------------------------------------------------- Página ensamblada
const VOCAB_COVERED = "u1-bat"; // el catálogo de prueba ya trae audio «nativo» de esta palabra
const OWN = "Solo para Ko'ox Maaya";
const OWN_URL = "https://github.com/sebastiancanul455/koox-maaya/blob/main/docs/PERMISO-VOCES.md";
const CONSENT = "Acepto que mis grabaciones se publiquen en la app Ko'ox Maaya, con la licencia y el crédito que elijo en este formulario.";
function assemble() {
  const tpl = fs.readFileSync(path.join(ROOT, "src/web/grabar.html"), "utf8");
  const MARK = "/*@@CONTENT@@*/";
  if (tpl.split(MARK).length !== 2) throw new Error("src/web/grabar.html debe tener el marcador de contenido exactamente una vez");
  const dir = path.join(ROOT, "src/content");
  const files = fs.readdirSync(dir).filter((f) => /^u\d+\.js$/.test(f)).sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10));
  const parts = files.map((f) => ({ name: "src/content/" + f, code: fs.readFileSync(path.join(dir, f), "utf8") }));
  parts.push({
    name: "catálogo de prueba",
    code: "window.COURSE_AUDIO = " + JSON.stringify({ version: 1, entries: [
      { key: "prueba-bat", file: "audio/prueba-bat.mp3", kind: "nativo", text: "bat", lang: "yua", vocab: [VOCAB_COVERED], letters: [],
        author: "Voz de prueba", license: "CC0 1.0", source: "Prueba" },
      { key: "prueba-sint", file: "audio/prueba-sint.mp3", kind: "sintetico", text: "chich", lang: "yua", vocab: ["u1-chich"], letters: [],
        author: "Prueba", license: "CC0 1.0", source: "Prueba", notes: "Voz sintética aproximada." },
      // Frase con voz nativa encontrada solo por su texto (sin vocab), como los ejemplos que importa import-recordings.
      { key: "prueba-frase", file: "audio/prueba-frase.mp3", kind: "nativo", text: "Bix a k'aaba'?", lang: "yua", vocab: [], letters: [],
        author: "Voz de prueba", license: "CC0 1.0", source: "Prueba" }
    ] }) + ";"
  });
  // Igual que build-core.mjs: cada parte en su propio <script>.
  const content = parts.map((p) => "/* " + p.name + " */\n" + p.code.trim()).join("\n</script>\n<script>\n");
  fs.writeFileSync(path.join(SITE, "grabar.html"), tpl.replace(MARK, () => content));
  const icons = path.join(ROOT, "src/web/icons");
  if (fs.existsSync(icons)) fs.cpSync(icons, path.join(SITE, "icons"), { recursive: true });
  return files.length;
}

// WAV sintético para el micrófono falso: 0.5 s de silencio, 1 s de «voz» (armónicos con envolvente) y 0.5 s de
// silencio; Chromium lo repite en bucle.
function fakeVoiceWav(file) {
  const sr = 48000, n = sr * 2, data = Buffer.alloc(44 + n * 2);
  data.write("RIFF", 0); data.writeUInt32LE(36 + n * 2, 4); data.write("WAVE", 8); data.write("fmt ", 12);
  data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(1, 22); data.writeUInt32LE(sr, 24);
  data.writeUInt32LE(sr * 2, 28); data.writeUInt16LE(2, 32); data.writeUInt16LE(16, 34); data.write("data", 36); data.writeUInt32LE(n * 2, 40);
  let seed = 7;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff - 0.5);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    let v = rnd() * 0.0006;
    if (t >= 0.5 && t < 1.5) {
      const u = t - 0.5, env = Math.min(1, u / 0.03, (1 - u) / 0.06);
      const f0 = 140 + 12 * Math.sin(2 * Math.PI * 3 * u);
      v += env * 0.32 * (Math.sin(2 * Math.PI * f0 * t) + 0.5 * Math.sin(4 * Math.PI * f0 * t) + 0.25 * Math.sin(6 * Math.PI * f0 * t)) / 1.75;
    }
    data.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(v * 32767))), 44 + i * 2);
  }
  fs.writeFileSync(file, data);
}

// ---------------------------------------------------------------- Fuentes en caché (como test/smoke.cjs)
const UA = "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36";
const fontMap = new Map();
const hash = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 16);
function prepareFonts(html) {
  const m = /https:\/\/fonts\.googleapis\.com\/css2\?[^"'<>\s]+/.exec(html);
  if (!m) return "sin hoja de fuentes";
  const cssUrl = m[0].replace(/&amp;/g, "&");
  try {
    fs.mkdirSync(FONT_DIR, { recursive: true });
    const cssFile = path.join(FONT_DIR, hash(cssUrl) + ".css");
    if (!fs.existsSync(cssFile)) execFileSync("curl", ["-sS", "-f", "-L", "-m", "15", "-A", UA, "-o", cssFile, cssUrl], { stdio: "ignore" });
    fontMap.set(cssUrl, { file: cssFile, type: "text/css; charset=utf-8" });
    for (const u of new Set(fs.readFileSync(cssFile, "utf8").match(/https:\/\/fonts\.gstatic\.com\/[^)'"\s]+/g) || [])) {
      const f = path.join(FONT_DIR, hash(u) + ".woff2");
      if (!fs.existsSync(f)) { try { execFileSync("curl", ["-sS", "-f", "-L", "-m", "15", "-A", UA, "-o", f, u], { stdio: "ignore" }); } catch (e) { continue; } }
      fontMap.set(u, { file: f, type: "font/woff2" });
    }
    return fontMap.size - 1 + " archivos de fuente en caché";
  } catch (e) {
    return "sin fuentes de Google (" + e.message.split("\n")[0] + "); se usan las de respaldo";
  }
}

// ---------------------------------------------------------------- Servidor local
function serve(dir) {
  const types = { ".html": "text/html; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json" };
  const server = http.createServer((req, res) => {
    const u = new URL(req.url, "http://localhost");
    const p = path.normalize(path.join(dir, decodeURIComponent(u.pathname)));
    if (!p.startsWith(dir + path.sep) || !fs.existsSync(p) || !fs.statSync(p).isFile()) { res.writeHead(404); res.end("no"); return; }
    res.writeHead(200, { "content-type": types[path.extname(p)] || "application/octet-stream", "cache-control": "no-store" });
    fs.createReadStream(p).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

// ---------------------------------------------------------------- Utilidades de página
let BASE = "";
const external = [];
async function newPage(browser, cfg) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1,
    colorScheme: cfg.scheme, acceptDownloads: true, permissions: ["microphone"], locale: "es-MX"
  });
  await ctx.route(/^https?:\/\//, (route) => {
    const url = route.request().url();
    const hit = fontMap.get(url);
    if (hit) return route.fulfill({ status: 200, contentType: hit.type, headers: { "access-control-allow-origin": "*" }, body: fs.readFileSync(hit.file) });
    if (/^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url)) return route.abort();
    if (url.startsWith(BASE)) {
      if (route.request().method() !== "GET") external.push(route.request().method() + " " + url);
      return route.continue();
    }
    external.push(route.request().method() + " " + url);
    return route.abort();
  });
  if (cfg.noIDB) await ctx.addInitScript(() => { Object.defineProperty(window, "indexedDB", { get() { return undefined; } }); });
  // Catálogo de audio propio (la página lo define al cargar; aquí se ignora esa asignación).
  if (cfg.catalog) await ctx.addInitScript((entries) => {
    const cat = { version: 1, entries };
    Object.defineProperty(window, "COURSE_AUDIO", { get() { return cat; }, set() {}, configurable: true });
  }, cfg.catalog);
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  page.errors = [];
  page.dialogs = [];
  page.on("pageerror", (e) => page.errors.push("pageerror: " + e.message));
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const loc = (msg.location() && msg.location().url) || "";
    if (/fonts\.(googleapis|gstatic)\.com/.test(loc + " " + msg.text())) return;
    page.errors.push("console.error: " + msg.text());
  });
  page.on("dialog", (d) => { page.dialogs.push(d.type() + ": " + d.message()); d.dismiss().catch(() => {}); });
  return { ctx, page };
}
async function load(page) {
  await page.goto(BASE + "grabar.html", { waitUntil: "load" });
  await page.waitForFunction(() => window.__grabar && window.__grabar.ready === true, null, { timeout: 8000 });
  await page.evaluate(() => document.fonts && document.fonts.ready);
}
async function overflow(page) {
  return page.evaluate(() => {
    const d = document.documentElement, vw = d.clientWidth, bad = [];
    for (const el of document.querySelectorAll("body *")) {
      if (el.closest(".chips, .sr-only, svg")) continue;
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      if (r.right > vw + 1 || r.left < -1) {
        bad.push((el.id ? "#" + el.id : el.tagName.toLowerCase() + (typeof el.className === "string" && el.className ? "." + el.className.trim().split(/\s+/).join(".") : "")) +
          " [" + Math.round(r.left) + "→" + Math.round(r.right) + "]");
        if (bad.length >= 4) break;
      }
    }
    return { sw: Math.max(d.scrollWidth, document.body.scrollWidth), cw: vw, bad };
  });
}
async function checkOverflow(page, cfg, where) {
  const o = await overflow(page);
  return check("[" + cfg.scheme + "] sin scroll horizontal a 390 px en " + where, o.sw <= o.cw + 1 && !o.bad.length,
    "scrollWidth " + o.sw + " / ancho " + o.cw + (o.bad.length ? " · se salen: " + o.bad.join(", ") : ""));
}
async function shot(page, cfg, name, full) {
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(SHOTS, name + "-" + cfg.scheme + ".png"), fullPage: !!full });
}
const G = (page, fn, arg) => page.evaluate(fn, arg);
async function giveConsent(page, opts = {}) {
  if (opts.assist) await page.tap("#f-assist");
  if (opts.license) await page.tap('#f-license input[value="' + opts.license + '"]');
  if (opts.ai) await page.tap("#f-ai");
  if (opts.credit) await page.tap('#f-credit input[value="' + opts.credit + '"]');
  if (opts.speaker !== undefined) await page.fill("#f-speaker", opts.speaker);
  if (opts.region !== undefined) await page.fill("#f-region", opts.region);
  await page.tap("#f-consent");
  await page.waitForFunction(() => !document.querySelector("#btn-start").disabled);
  await page.tap("#btn-start");
  await page.waitForFunction(() => window.__grabar.view() === "rec");
}
// Graba el grupo i: elige su sección, toca la fila, graba ~1.6 s y detiene.
async function recordGroup(page, cfg, i, opts = {}) {
  const info = await G(page, (i) => window.__grabar.groupInfo(i), i);
  const before = (await G(page, () => window.__grabar.recorded().length));
  await page.tap('#unit-chips [data-unit="' + info.home + '"]');
  await page.tap('#status-seg [data-status="all"]');
  await page.tap('#list .row[data-i="' + i + '"]');
  await page.waitForFunction((gk) => window.__grabar.current() === gk, info.gk);
  await page.tap("#btn-rec");
  await page.waitForFunction(() => window.__grabar.state() === "recording", null, { timeout: 8000 });
  await page.waitForTimeout(700);
  if (opts.shot) await shot(page, cfg, opts.shot);
  await page.waitForTimeout(900);
  await page.tap("#btn-rec");
  await page.waitForFunction((n) => window.__grabar.state() === "idle" && window.__grabar.recorded().length === n, before + 1, { timeout: 10000 });
  const status = await page.textContent("#p-status");
  const rec = (await G(page, () => window.__grabar.recorded())).find((r) => r.gk === info.gk);
  return { info, status, rec };
}

// Modo acompañado: graba con el botón grande de la barra (o con «Repetir toma») y detiene.
async function sessRecord(page, btn = "#s-rec") {
  await page.tap(btn);
  await page.waitForFunction(() => window.__grabar.state() === "recording", null, { timeout: 8000 });
  await page.waitForTimeout(1700);
  await page.tap("#s-rec");
  await page.waitForFunction(() => window.__grabar.state() === "idle", null, { timeout: 10000 });
}
// Sin scroll horizontal a 360, 390 y 420 px (y de vuelta a 390 × 844).
async function checkWidths(page, cfg, where) {
  for (const w of [360, 390, 420]) {
    await page.setViewportSize({ width: w, height: 760 });
    await page.waitForTimeout(120);
    const o = await overflow(page);
    check("[" + cfg.scheme + "] sin scroll horizontal a " + w + " px en " + where, o.sw <= o.cw + 1 && !o.bad.length,
      "scrollWidth " + o.sw + " / " + o.cw + (o.bad.length ? " · se salen: " + o.bad.join(", ") : ""));
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(120);
}
// Tamaño más chico (ancho o alto) entre los botones visibles de la lista.
async function minTarget(page, ids) {
  return page.evaluate((ids) => Math.min(...ids.map((s) => { const r = document.querySelector(s).getBoundingClientRect(); return r.width && r.height ? Math.min(r.width, r.height) : 1e9; })), ids);
}

// ---------------------------------------------------------------- ZIP (para fabricar archivos de prueba)
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(b) { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function makeZip(files, deflate) {
  const parts = [], central = [];
  let off = 0;
  for (const f of files) {
    const name = Buffer.from(f.name, "utf8"), crc = crc32(f.data), body = deflate ? zlib.deflateRawSync(f.data) : f.data;
    const h = Buffer.alloc(30);
    h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(20, 4); h.writeUInt16LE(0x800, 6); h.writeUInt16LE(deflate ? 8 : 0, 8);
    h.writeUInt32LE(crc, 14); h.writeUInt32LE(body.length, 18); h.writeUInt32LE(f.data.length, 22); h.writeUInt16LE(name.length, 26);
    const c = Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(20, 4); c.writeUInt16LE(20, 6); c.writeUInt16LE(0x800, 8); c.writeUInt16LE(deflate ? 8 : 0, 10);
    c.writeUInt32LE(crc, 16); c.writeUInt32LE(body.length, 20); c.writeUInt32LE(f.data.length, 24); c.writeUInt16LE(name.length, 28); c.writeUInt32LE(off, 42);
    parts.push(h, name, body); central.push(c, name);
    off += 30 + name.length + body.length;
  }
  const cd = Buffer.concat(central), e = Buffer.alloc(22);
  e.writeUInt32LE(0x06054b50, 0); e.writeUInt16LE(files.length, 8); e.writeUInt16LE(files.length, 10); e.writeUInt32LE(cd.length, 12); e.writeUInt32LE(off, 16);
  return Buffer.concat([...parts, cd, e]);
}
function runNode(args, cwd) {
  const r = spawnSync(process.execPath, args, { cwd: cwd || TMP, encoding: "utf8", timeout: 180000 });
  return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
}
function probe(file) {
  try {
    const j = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=codec_name,channels,sample_rate,bits_per_sample:format=duration", "-of", "json", file], { encoding: "utf8" }));
    const s = j.streams[0];
    return { codec: s.codec_name, channels: s.channels, sampleRate: Number(s.sample_rate), bits: s.bits_per_sample, durationMs: Math.round(Number(j.format.duration) * 1000) };
  } catch (e) { return null; }
}

// ---------------------------------------------------------------- Pruebas
async function main() {
  const T0 = Date.now();
  const nUnits = assemble();
  const wav = path.join(TMP, "voz-falsa.wav");
  fakeVoiceWav(wav);
  log("Ko'ox Maaya · prueba de la página de grabación");
  log("Copia temporal: " + TMP + " · " + nUnits + " unidades · " + prepareFonts(fs.readFileSync(path.join(SITE, "grabar.html"), "utf8")));
  const server = await serve(SITE);
  BASE = "http://localhost:" + server.address().port + "/";
  const realCat = path.join(ROOT, "audio", "catalogo.json");
  const realCatHash = sha(realCat);
  const realAudio = fs.existsSync(path.join(ROOT, "audio")) ? fs.readdirSync(path.join(ROOT, "audio")).sort().join(",") : "";

  const browser = await chromium.launch({
    args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--use-file-for-fake-audio-capture=" + wav,
      "--autoplay-policy=no-user-gesture-required"]
  });
  const allErrors = [], allDialogs = [];
  let zipPath = null, zipPath2 = null, picks = null, allGroups = [], queueA = [];
  try {
    // ======================= Claro: recorrido completo
    {
      const cfg = { scheme: "light" };
      const { ctx, page } = await newPage(browser, cfg);
      await load(page);
      check("la página arranca en «Tus datos»", (await G(page, () => window.__grabar.view())) === "intro");
      check("guarda en IndexedDB", (await G(page, () => window.__grabar.storage())) === "indexeddb");
      const total = await G(page, () => window.__grabar.total());
      check("lista de elementos armada desde el curso", total > 300, total + " grupos");
      const intro = await page.textContent("#v-intro");
      check("presentación: para qué sirve, cuánto toma, consejos y privacidad",
        /escuchar cómo se dicen/.test(intro) && /minutos por unidad/.test(intro) && /lugar silencioso/.test(intro) && /un palmo/.test(intro) &&
        /como se dice en tu comunidad/.test(intro) && /Nada se envía a ningún servidor/.test(intro));
      const lic = await page.$$eval("#f-license input", (xs) => xs.map((x) => x.value + (x.checked ? "*" : "")).join("|"));
      check("cuatro licencias, «Solo para Ko'ox Maaya» elegida por omisión", lic === OWN + "*|CC BY-SA 4.0|CC BY 4.0|CC0 1.0", lic);
      check("la opción propia dice que no es licencia abierta y cada licencia trae su explicación sencilla",
        (await page.textContent("#f-license label.opt:first-child .t")).trim() === "Solo para Ko'ox Maaya (no es licencia abierta)" &&
        (await page.$$eval("#f-license .opt .d", (xs) => xs.map((x) => x.textContent.trim().length))).every((n) => n > 30));
      check("la casilla de IA del proyecto tiene su texto y empieza sin marcar",
        (await page.textContent("label.opt:has(#f-ai) .t")).trim() === "Autorizo usar mis grabaciones para entrenar o evaluar modelos de IA del proyecto" && !(await page.isChecked("#f-ai")));
      check("cómo aparecer: con nombre, con seudónimo o sin nombre (sin nombre por omisión) y el campo de nombre oculto",
        (await page.$$eval("#f-credit input", (xs) => xs.map((x) => x.value + (x.checked ? "*" : "")).join("|"))) === "nombre|seudónimo|anónimo*" && await page.isHidden("#f-name-field"));
      check("pide la comunidad o el pueblo (opcional) y dice que puede pedir que se retire su voz cuando quiera",
        await page.isVisible("#f-region") && /Comunidad o pueblo \(opcional\)/.test(await page.textContent("#v-intro")) &&
        /Puedo pedir que se retire mi voz cuando quiera\./.test(await page.textContent("#v-intro")));
      const hrefs = await page.$$eval("#v-intro a", (as) => as.map((a) => a.href));
      check("enlaza los términos del permiso propio y la guía para grabar a una persona mayor",
        hrefs.includes(OWN_URL) && hrefs.some((h) => /\/docs\/GRABAR\.md$/.test(h)), hrefs.join(" "));
      check("texto de consentimiento exacto (permiso obligatorio de publicar)", (await page.textContent("#consent-text")).trim() === CONSENT);
      check("sin consentimiento no se puede empezar", await page.isDisabled("#btn-start"));
      await page.tap('.step[data-view="rec"]', { force: true });
      check("sin consentimiento el paso «Grabar» no abre la grabación", (await G(page, () => window.__grabar.view())) === "intro" && await page.isHidden("#panel"));
      await checkOverflow(page, cfg, "Tus datos");
      await shot(page, cfg, "intro", true);

      await giveConsent(page, { credit: "nombre", speaker: "Hablante de Prueba", region: "Peto", license: "CC BY 4.0" });
      check("con consentimiento se abre «Grabar» y el panel", await page.isVisible("#panel") && await page.isVisible("#list .row"));
      await page.waitForTimeout(200);
      await checkOverflow(page, cfg, "Grabar");
      await shot(page, cfg, "grabar");

      // Elementos de prueba: una letra (ch'), una palabra sola de la unidad 2 y una frase de ejemplo.
      picks = await G(page, () => {
        const g = window.__grabar, out = { letter: g.groupIndex("letter", "ch-saltillo"), covered: g.groupIndex("vocab", "u1-bat") };
        for (let i = 0; i < g.total(); i++) {
          const x = g.groupInfo(i), types = x.items.map((it) => it.type);
          if (out.vocab === undefined && types.length === 1 && types[0] === "vocab" && x.items[0].id.startsWith("u2-")) out.vocab = i;
          if (out.example === undefined && types.length === 1 && types[0] === "example" && x.home === "u2") out.example = i;
        }
        out.info = [out.letter, out.vocab, out.example].map((i) => g.groupInfo(i));
        return out;
      });
      check("el audio «nativo» del catálogo marca su palabra como cubierta", (await G(page, (i) => window.__grabar.groupInfo(i).covered, picks.covered)) === true);
      await page.tap('#unit-chips [data-unit="u1"]');
      await page.tap('#status-seg [data-status="all"]');
      check("la fila cubierta dice «Ya tiene audio»", /Ya tiene audio/.test(await page.textContent('#list .row[data-i="' + picks.covered + '"]')));
      const sint = await G(page, () => window.__grabar.groupIndex("vocab", "u1-chich"));
      const sintInfo = await G(page, (i) => window.__grabar.groupInfo(i), sint);
      check("un audio «sintetico» no cuenta como cubierto", sintInfo.covered === false && sintInfo.synth === true);
      const frase = await G(page, () => window.__grabar.groupIndex("example", "u3-a-kaaba"));
      check("una frase con voz nativa (encontrada por su texto) queda cubierta", (await G(page, (i) => window.__grabar.groupInfo(i).covered, frase)) === true);
      await page.tap('#status-seg [data-status="pend"]');
      check("«Por grabar» oculta lo ya cubierto", !(await page.$('#list .row[data-i="' + picks.covered + '"]')));
      check("«Por grabar» incluye lo que solo tiene voz sintética", !!(await page.$('#list .row[data-i="' + sint + '"]')));
      await page.tap('#list .row[data-i="' + sint + '"]');
      check("el panel avisa que la voz nativa reemplaza a la sintética", /solo tiene una voz sintética/.test(await page.textContent("#p-status")), await page.textContent("#p-status"));

      const r1 = await recordGroup(page, cfg, picks.letter, { shot: "grabando" });
      check("graba la letra ch' (" + r1.info.text + ")", /Guardada/.test(r1.status), r1.status);
      check("recorta el silencio (duración < duración grabada)", r1.rec && r1.rec.durationMs < r1.rec.rawMs - 150 && r1.rec.durationMs > 400,
        r1.rec && r1.rec.durationMs + " ms de " + r1.rec.rawMs + " ms");
      await shot(page, cfg, "grabada");
      const r2 = await recordGroup(page, cfg, picks.vocab);
      check("graba una palabra (" + r2.info.text + ")", /Guardada/.test(r2.status), r2.status);
      const r3 = await recordGroup(page, cfg, picks.example);
      check("graba una frase de ejemplo (" + r3.info.text + ")", /Guardada/.test(r3.status), r3.status);
      check("la fila grabada queda marcada", (await page.$('#list .row[data-i="' + picks.example + '"] .st.done')) !== null);
      check("contador de avance", /^3 de /.test((await page.textContent("#prog-big")).trim()), await page.textContent("#prog-big"));
      const curBefore = await G(page, () => window.__grabar.current());
      await page.tap("#btn-next");
      check("«Siguiente» pasa a otro elemento", (await G(page, () => window.__grabar.current())) !== curBefore);
      await checkOverflow(page, cfg, "Grabar (con grabaciones)");
      for (const w of [360, 420]) {
        await page.setViewportSize({ width: w, height: 760 });
        await page.waitForTimeout(150);
        const o = await overflow(page);
        check("[" + cfg.scheme + "] sin scroll horizontal a " + w + " px en Grabar", o.sw <= o.cw + 1 && !o.bad.length, "scrollWidth " + o.sw + " / " + o.cw + " " + o.bad.join(", "));
        if (w === 360) await page.screenshot({ path: path.join(SHOTS, "grabar-360-" + cfg.scheme + ".png") });
      }
      await page.setViewportSize({ width: 390, height: 844 });

      // Quitar el permiso de publicar cierra «Grabar» y «Enviar» hasta que se vuelva a dar.
      await page.tap('.step[data-view="intro"]');
      await page.waitForFunction(() => window.__grabar.view() === "intro");
      await page.tap("#f-consent");
      check("si se quita el permiso de publicar, «Grabar» y «Enviar» se cierran y no se puede empezar",
        await page.isDisabled("#btn-start") && (await page.getAttribute('.step[data-view="rec"]', "aria-disabled")) === "true" &&
        (await page.getAttribute('.step[data-view="send"]', "aria-disabled")) === "true");
      await page.tap('.step[data-view="rec"]', { force: true });
      check("sin el permiso no se abre la grabación aunque se toque el paso", (await G(page, () => window.__grabar.view())) === "intro" && await page.isHidden("#panel"));
      await page.tap("#f-consent");
      await page.waitForFunction(() => !document.querySelector("#btn-start").disabled);
      check("al volver a dar el permiso se puede seguir (el botón dice «Seguir grabando»)", /Seguir grabando/.test(await page.textContent("#btn-start")));
      await page.tap("#btn-start");
      await page.waitForFunction(() => window.__grabar.view() === "rec");

      // Persistencia: recargar
      await page.reload({ waitUntil: "load" });
      await page.waitForFunction(() => window.__grabar && window.__grabar.ready === true);
      const recs = await G(page, () => window.__grabar.recorded());
      check("tras recargar siguen las 3 grabaciones (IndexedDB)", recs.length === 3, recs.map((r) => r.text).join(" · "));
      check("tras recargar recuerda el consentimiento y abre «Grabar»", (await G(page, () => window.__grabar.view())) === "rec");
      await page.tap('#unit-chips [data-unit="u2"]');
      await page.tap('#status-seg [data-status="mine"]');
      await page.tap('#list .row[data-i="' + picks.vocab + '"]');
      await page.tap("#btn-play");
      check("«Escuchar» reproduce la grabación", await page.waitForFunction(() => document.querySelector("#btn-play").getAttribute("data-state") === "playing", null, { timeout: 3000 }).then(() => true, () => false));

      // Exportar
      await page.tap('.step[data-view="send"]');
      await page.waitForFunction(() => window.__grabar.view() === "send");
      check("«Enviar» resume lo que se manda", /3 grabaciones/.test(await page.textContent("#send-sum")), await page.textContent("#send-sum"));
      await checkOverflow(page, cfg, "Enviar");
      const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 15000 }), page.tap("#btn-export")]);
      zipPath = path.join(TMP, dl.suggestedFilename());
      await dl.saveAs(zipPath);
      check("descarga el ZIP con un nombre claro", /^koox-maaya-grabaciones-hablante-de-prueba-\d{8}-\d{4}\.zip$/.test(dl.suggestedFilename()), dl.suggestedFilename());
      await page.waitForFunction(() => /Listo/.test(document.querySelector("#send-status").textContent));
      check("explica cómo enviarlo (WhatsApp, correo, Drive)", /WhatsApp/.test(await page.textContent("#v-send")) && /Correo/.test(await page.textContent("#v-send")) && /Drive/.test(await page.textContent("#v-send")));
      check("después del envío ofrece «Solo las nuevas»", await page.isVisible("#only-new-line"));
      await checkOverflow(page, cfg, "Enviar (archivo listo)");
      await shot(page, cfg, "enviar", true);

      // Borrar todo con confirmación en la página
      await page.tap("#btn-wipe");
      check("«Borrar todo» pide confirmación en la página", await page.isVisible("#wipe-confirm"));
      await page.locator("#wipe-confirm").scrollIntoViewIfNeeded();
      await shot(page, cfg, "borrar");
      await page.tap("#btn-wipe-no");
      check("«Cancelar» no borra", (await G(page, () => window.__grabar.recorded().length)) === 3);
      await page.tap("#btn-wipe");
      await page.tap("#btn-wipe-yes");
      await page.waitForFunction(() => window.__grabar.view() === "intro");
      await page.reload({ waitUntil: "load" });
      await page.waitForFunction(() => window.__grabar && window.__grabar.ready === true);
      check("«Sí, borrar todo» borra grabaciones y datos (también tras recargar)",
        (await G(page, () => window.__grabar.recorded().length)) === 0 && (await G(page, () => window.__grabar.view())) === "intro" &&
        !(await page.isChecked("#f-consent")) && (await page.inputValue("#f-speaker")) === "");
      allErrors.push(...page.errors); allDialogs.push(...page.dialogs);
      await ctx.close();
    }

    // ======================= Oscuro: diseño y una grabación
    {
      const cfg = { scheme: "dark" };
      const { ctx, page } = await newPage(browser, cfg);
      await load(page);
      await checkOverflow(page, cfg, "Tus datos");
      await shot(page, cfg, "intro", true);
      await giveConsent(page, {});
      await page.waitForTimeout(200);
      await checkOverflow(page, cfg, "Grabar");
      await shot(page, cfg, "grabar");
      const r = await recordGroup(page, cfg, picks.letter, { shot: "grabando" });
      check("[dark] graba", /Guardada/.test(r.status), r.status);
      await shot(page, cfg, "grabada");
      await page.tap('.step[data-view="send"]');
      await page.waitForFunction(() => window.__grabar.view() === "send");
      await checkOverflow(page, cfg, "Enviar");
      await shot(page, cfg, "enviar", true);
      await page.tap("#btn-wipe");
      await page.locator("#wipe-confirm").scrollIntoViewIfNeeded();
      await shot(page, cfg, "borrar");
      allErrors.push(...page.errors); allDialogs.push(...page.dialogs);
      await ctx.close();
    }

    // ======================= Claro: modo acompañado, con todo el curso por delante
    {
      const cfg = { scheme: "light" };
      const { ctx, page } = await newPage(browser, cfg);
      await load(page);
      allGroups = await G(page, () => Array.from({ length: window.__grabar.total() }, (_, i) => {
        const g = window.__grabar.groupInfo(i);
        return { gk: g.gk, text: g.text, exEs: g.exEs, letters: g.items.filter((it) => it.type === "letter").map((it) => it.letter) };
      }));
      check("el interruptor «Alguien me ayuda (modo acompañado)» existe y empieza apagado",
        /Alguien me ayuda \(modo acompañado\)/.test(await page.textContent("label.switch")) && !(await page.isChecked("#f-assist")) &&
        (await G(page, () => window.__grabar.mode())) === "normal");
      await page.tap("#f-assist");
      check("al encenderlo sale la ayuda para quien acompaña y el modo cambia", await page.isVisible("#assist-help") &&
        /Lo que decida quien graba, manda/.test(await page.textContent("#assist-help")) && (await G(page, () => window.__grabar.mode())) === "acompañado");
      await checkOverflow(page, cfg, "Tus datos (modo acompañado)");
      await page.tap('.step[data-view="rec"]', { force: true });
      check("sin consentimiento no se abre la sesión acompañada ni sus botones de grabar",
        (await G(page, () => window.__grabar.view())) === "intro" && await page.isHidden("#sbar") && await page.isHidden("#v-session"));
      await page.tap("#f-consent");
      await page.tap('#f-credit input[value="seudónimo"]');
      check("con seudónimo sin escribirlo no se puede empezar y el aviso lo explica",
        await page.isDisabled("#btn-start") && /nombre o el seudónimo/.test(await page.textContent("#start-hint")), await page.textContent("#start-hint"));
      await page.fill("#f-speaker", "Don Prueba");
      await page.fill("#f-region", "Hopelchén");
      await page.tap("#f-ai");
      const sum = (await page.textContent("#perm-sum")).replace(/\s+/g, " ");
      check("el resumen de permisos refleja la licencia por omisión, el uso para IA, el crédito y la comunidad",
        /Solo para Ko'ox Maaya/.test(sum) && /IA del proyecto: sí/.test(sum) && /Don Prueba/.test(sum) && /Hopelchén/.test(sum), sum);
      await page.tap("#btn-start");
      await page.waitForFunction(() => window.__grabar.view() === "rec");
      check("en el modo acompañado se ve la sesión, no la lista ni el panel de siempre",
        await page.isVisible("#v-session") && await page.isHidden("#v-rec") && await page.isHidden("#panel") && await page.isVisible("#sbar"));

      let ses = await G(page, () => window.__grabar.session());
      queueA = ses.queue.slice();
      const info0 = await G(page, (gk) => window.__grabar.groupInfo(window.__grabar.indexOf(gk)), ses.queue[0]);
      const chich = await G(page, () => window.__grabar.groupInfo(window.__grabar.groupIndex("vocab", "u1-chich")));
      check("empieza por lo pendiente en el orden del curso: unidad 1 primero y la cola en orden",
        ses.cur === ses.queue[0] && info0.uhome === "u1" && ses.queueOrd.every((o, i) => i === 0 || o >= ses.queueOrd[i - 1]), JSON.stringify({ cur: ses.cur, uhome: info0.uhome }));
      check("lo que solo tiene voz sintética cuenta como pendiente y lo que ya tiene voz nativa no entra",
        chich.synth === true && ses.queue.includes(chich.gk) && !ses.queue.includes("bat"));
      check("el avance dice «0 de N»", (await page.textContent("#ses-big")).trim() === "0 de " + ses.total && ses.total === ses.queue.length, await page.textContent("#ses-big"));
      check("se ve el significado en español", ses.es && (await page.textContent("#ses-es")).trim() === ses.es, ses.es);
      const word = ses.text;
      const leaked = await page.evaluate((w) => {
        const bits = [document.querySelector("#v-session").innerText, document.querySelector("#sbar").innerText];
        document.querySelectorAll("#v-session [aria-label], #sbar [aria-label], #v-session [title], #sbar [title]")
          .forEach((e) => bits.push(e.getAttribute("aria-label") || "", e.getAttribute("title") || ""));
        return bits.join(" ").toLowerCase().includes(w.toLowerCase());
      }, word);
      check("la palabra maya del curso está oculta antes de grabar (ni en pantalla ni en las etiquetas)",
        !leaked && await page.isHidden("#ses-m-box") && await page.isHidden("#ses-after"), word);
      check("antes de grabar solo hay «Grabar» y «Saltar»",
        await page.isVisible("#s-rec") && await page.isVisible("#s-skip") && await page.isHidden("#s-next") && await page.isHidden("#s-play") && await page.isHidden("#s-redo"));
      check("los botones de la barra miden al menos 44 px", (await minTarget(page, ["#s-rec", "#s-skip"])) >= 44);
      await checkOverflow(page, cfg, "la sesión acompañada (sin toma)");

      await page.tap("#s-rec");
      await page.waitForFunction(() => window.__grabar.state() === "recording", null, { timeout: 8000 });
      const during = (await page.textContent("#s-status")) + " " + (await page.textContent("#s-rec"));
      check("mientras graba dice «Detener», no muestra la palabra y no deja saltar ni seguir",
        /Detener/.test(during) && !during.toLowerCase().includes(word.toLowerCase()) && await page.isHidden("#s-skip") && await page.isHidden("#s-next"), during);
      await page.waitForTimeout(1700);
      await page.tap("#s-rec");
      await page.waitForFunction(() => window.__grabar.state() === "idle" && window.__grabar.recorded().length === 1, null, { timeout: 10000 });
      check("después de grabar hay «Escuchar», «Repetir toma» y «Siguiente»; ya no «Grabar» ni «Saltar»",
        await page.isVisible("#s-play") && await page.isVisible("#s-redo") && await page.isVisible("#s-next") && await page.isHidden("#s-rec") && await page.isHidden("#s-skip"));
      check("los botones de después de grabar miden al menos 44 px", (await minTarget(page, ["#s-next", "#s-play", "#s-redo"])) >= 44);
      check("aparecen «Ver cómo está en el curso» y el campo «El hablante dijo otra forma»",
        /Ver cómo está en el curso/.test(await page.textContent("#ses-reveal")) && await page.isVisible("#f-variant") &&
        /El hablante dijo otra forma/.test(await page.textContent('label[for="f-variant"]')));
      await page.tap("#ses-reveal");
      check("al verla muestra la forma del curso", (await page.textContent("#ses-m")).trim() === word && await page.isVisible("#ses-m-box") &&
        (await page.getAttribute("#ses-reveal", "aria-expanded")) === "true");
      await page.fill("#f-variant", "chi’ich");
      await checkWidths(page, cfg, "la sesión acompañada (con toma, forma del curso y variante)");
      await page.tap("#s-play");
      check("«Escuchar» reproduce la toma", await page.waitForFunction(() => document.querySelector("#s-play").getAttribute("data-state") === "playing", null, { timeout: 3000 }).then(() => true, () => false));
      await page.tap("#s-next");
      await page.waitForFunction((was) => window.__grabar.current() !== was, ses.cur);
      check("la variante quedó guardada con apóstrofo recto (chi'ich) en la grabación",
        (await G(page, () => window.__grabar.recorded())).find((r) => r.gk === ses.cur).variant === "chi'ich");
      const ses1 = await G(page, () => window.__grabar.session());
      check("«Siguiente» pasa al siguiente pendiente, sin toma, con la forma oculta y el campo de variante vacío",
        ses1.cur === queueA[1] && !ses1.revealed && await page.isHidden("#ses-after") && (await page.inputValue("#f-variant")) === "" && await page.isVisible("#s-rec"));
      await sessRecord(page);
      let recs = await G(page, () => window.__grabar.recorded());
      check("graba el segundo elemento (sin variante)", recs.length === 2 && !recs.find((r) => r.gk === ses1.cur).variant);
      await page.tap("#s-redo");
      await page.waitForFunction(() => window.__grabar.state() === "recording", null, { timeout: 8000 });
      check("«Repetir toma» muestra otra vez el botón grande, ahora como «Detener»", /Detener/.test(await page.textContent("#s-rec")) && await page.isVisible("#s-rec"));
      await page.waitForTimeout(1700);
      await page.tap("#s-rec");
      await page.waitForFunction(() => window.__grabar.state() === "idle", null, { timeout: 10000 });
      recs = await G(page, () => window.__grabar.recorded());
      check("la toma repetida reemplaza a la anterior (sigue habiendo 2 grabaciones) y el avance dice «2 de N»",
        recs.length === 2 && (await page.textContent("#ses-big")).trim() === "2 de " + ses.total, await page.textContent("#ses-big"));
      await page.tap("#s-next");
      await page.waitForFunction((was) => window.__grabar.current() !== was, ses1.cur);
      const third = (await G(page, () => window.__grabar.session())).cur;
      await page.tap("#s-skip");
      await page.waitForFunction((was) => window.__grabar.current() !== was, third);
      ses = await G(page, () => window.__grabar.session());
      check("«Saltar» deja el elemento pendiente y lo manda al final de la sesión",
        ses.skipped.includes(third) && ses.queue[ses.queue.length - 1] === third && ses.cur !== third && (await G(page, () => window.__grabar.recorded())).length === 2);

      // Pausa amable cada ~10 minutos (aquí se adelanta con un gancho de prueba): avisa, no bloquea.
      check("la pausa se sugiere cada 10 minutos", /var BREAK_MS = 10 \* 60 \* 1000;/.test(fs.readFileSync(path.join(ROOT, "src/web/grabar.html"), "utf8")));
      await G(page, () => window.__grabar.setBreakMs(500));
      await page.waitForSelector("#ses-break:not([hidden])", { timeout: 5000 });
      check("sugiere una pausa («¿Descansamos un momento?») sin bloquear nada",
        /¿Descansamos un momento\?/.test(await page.textContent("#ses-break")) && await page.isEnabled("#s-rec") && await page.isEnabled("#s-skip") && await page.isVisible("#sbar"));
      await checkWidths(page, cfg, "la sesión acompañada (con el aviso de pausa)");
      await shot(page, cfg, "sesion");
      await page.tap("#ses-break-ok");
      check("«Seguir» cierra el aviso", await page.isHidden("#ses-break"));
      const clear = await page.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);
        const bar = document.querySelector("#sbar").getBoundingClientRect(), last = document.querySelector("#btn-assist-off").getBoundingClientRect();
        return { barTop: Math.round(bar.top), lastBottom: Math.round(last.bottom), ok: last.bottom <= bar.top + 1 };
      });
      check("al llegar al final de la página la barra de abajo no tapa el último botón", clear.ok, JSON.stringify(clear));

      await page.reload({ waitUntil: "load" });
      await page.waitForFunction(() => window.__grabar && window.__grabar.ready === true);
      ses = await G(page, () => window.__grabar.session());
      check("tras recargar sigue en modo acompañado, con las 2 grabaciones, y vuelve a empezar por lo pendiente",
        (await G(page, () => window.__grabar.mode())) === "acompañado" && (await G(page, () => window.__grabar.view())) === "rec" &&
        (await G(page, () => window.__grabar.recorded())).length === 2 && ses.cur === third && await page.isVisible("#sbar"), JSON.stringify({ cur: ses.cur, third }));
      await page.tap("#ses-finish");
      await page.waitForFunction(() => window.__grabar.view() === "send");
      const who = await page.textContent("#send-who");
      check("«Terminar y exportar» lleva al envío y resume crédito, licencia y uso para IA",
        /2 grabaciones/.test(await page.textContent("#send-sum")) && /Don Prueba/.test(who) && /Solo para Ko'ox Maaya/.test(who) && /IA del proyecto: sí/.test(who), who);
      const [dl2] = await Promise.all([page.waitForEvent("download", { timeout: 15000 }), page.tap("#btn-export")]);
      zipPath2 = path.join(TMP, dl2.suggestedFilename());
      await dl2.saveAs(zipPath2);
      check("el ZIP lleva el seudónimo en su nombre", /^koox-maaya-grabaciones-don-prueba-\d{8}-\d{4}\.zip$/.test(dl2.suggestedFilename()), dl2.suggestedFilename());
      await page.tap('.step[data-view="rec"]');
      await page.waitForFunction(() => window.__grabar.view() === "rec");
      await page.tap("#btn-assist-off");
      check("«Salir del modo acompañado» vuelve a la lista de siempre",
        await page.isVisible("#v-rec") && await page.isVisible("#panel") && await page.isHidden("#v-session") && await page.isHidden("#sbar") &&
        (await G(page, () => window.__grabar.mode())) === "normal");
      await checkOverflow(page, cfg, "Grabar (modo normal, con el botón de modo acompañado)");
      await page.tap("#btn-assist-on");
      check("«Modo acompañado», en la lista de siempre, pasa a la sesión (y se acuerda tras recargar)",
        await page.isVisible("#v-session") && await page.isHidden("#v-rec") && await page.isHidden("#panel") && await page.isVisible("#sbar") &&
        (await G(page, () => window.__grabar.mode())) === "acompañado" && (await G(page, () => window.__grabar.profile())).assisted === true);
      await page.tap("#ses-edit");
      await page.waitForFunction(() => window.__grabar.view() === "intro");
      check("«Cambiar permisos» abre «Tus datos» con el interruptor encendido y se puede volver a la sesión",
        await page.isChecked("#f-assist") && /Seguir grabando/.test(await page.textContent("#btn-start")));
      await page.tap("#btn-start");
      await page.waitForFunction(() => window.__grabar.view() === "rec");
      check("al volver sigue la sesión acompañada", await page.isVisible("#v-session") && await page.isVisible("#sbar"));
      allErrors.push(...page.errors); allDialogs.push(...page.dialogs);
      await ctx.close();
    }

    // ======================= Oscuro: modo acompañado hasta el final de la lista (solo 2 pendientes)
    {
      const q0 = queueA[0];
      const exG = allGroups.find((g) => g.exEs && g.gk !== q0);
      const first = allGroups.find((g) => g.gk === q0);
      const two = [q0, exG.gk];
      // El resto del curso ya tiene voz de «otra persona»: solo quedan estos dos pendientes.
      const catalog = allGroups.filter((g) => !two.includes(g.gk)).map((g, i) => ({
        key: "c" + i, file: "audio/c" + i + ".mp3", kind: "nativo", text: g.text, lang: "yua", vocab: [], letters: g.letters,
        author: "Otra voz", license: "CC0 1.0", source: "Prueba" }));
      const cfg = { scheme: "dark", catalog };
      const { ctx, page } = await newPage(browser, cfg);
      await load(page);
      await giveConsent(page, { assist: true });
      const s2 = await G(page, () => window.__grabar.session());
      check("[dark] con casi todo cubierto por otra voz quedan 2 pendientes y el avance dice «0 de 2»",
        s2.queue.length === 2 && s2.total === 2 && s2.cur === q0 && (await page.textContent("#ses-big")).trim() === "0 de 2", JSON.stringify({ q: s2.queue, total: s2.total }));
      check("[dark] el ejemplo en español no sale si la palabra no lo tiene", first.exEs ? true : await page.isHidden("#ses-ex"));
      await checkWidths(page, cfg, "la sesión acompañada (sin toma)");
      await sessRecord(page);
      await checkWidths(page, cfg, "la sesión acompañada (con toma)");
      await shot(page, cfg, "sesion");
      // Un doble toque sin querer en «Siguiente»: pasa una sola vez y no empieza a grabar el elemento nuevo.
      const nb = await page.locator("#s-next").boundingBox();
      await page.touchscreen.tap(nb.x + nb.width / 2, nb.y + nb.height / 2);
      await page.waitForTimeout(80);
      await page.touchscreen.tap(nb.x + nb.width / 2, nb.y + nb.height / 2);
      await page.waitForFunction((was) => window.__grabar.current() !== was, q0);
      await page.waitForTimeout(700);
      check("[dark] un doble toque en «Siguiente» pasa una sola vez y no empieza a grabar el elemento nuevo",
        (await G(page, () => window.__grabar.state())) === "idle" && (await G(page, () => window.__grabar.recorded())).length === 1 &&
        (await G(page, () => window.__grabar.session())).cur === two[1], JSON.stringify(await G(page, () => window.__grabar.session())).slice(0, 120));
      check("[dark] el ejemplo en español aparece cuando la palabra lo tiene (y no la forma maya del ejemplo)",
        await page.isVisible("#ses-ex") && (await page.textContent("#ses-ex")).trim() === "Ejemplo: «" + exG.exEs + "»", await page.textContent("#ses-ex"));
      await sessRecord(page);
      await page.tap("#s-next");
      await page.waitForSelector("#ses-end:not([hidden])", { timeout: 5000 });
      check("[dark] al terminar la lista dice «¡Terminamos por hoy!», quita los controles de grabar y ofrece exportar",
        /¡Terminamos por hoy!/.test(await page.textContent("#ses-end")) && await page.isHidden("#sbar") && await page.isHidden("#ses-card") && await page.isVisible("#ses-finish-2") &&
        (await page.textContent("#ses-big")).trim() === "2 de 2");
      await checkWidths(page, cfg, "el final de la sesión");
      await page.tap("#ses-finish-2");
      await page.waitForFunction(() => window.__grabar.view() === "send");
      check("[dark] «Terminar y exportar» abre el envío con las 2 grabaciones", /2 grabaciones/.test(await page.textContent("#send-sum")), await page.textContent("#send-sum"));
      allErrors.push(...page.errors); allDialogs.push(...page.dialogs);
      await ctx.close();
    }

    // ======================= Datos de la versión anterior (sin permisos por capas)
    {
      const cfg = { scheme: "light" };
      const { ctx, page } = await newPage(browser, cfg);
      await load(page);
      await page.evaluate(() => new Promise((resolve, reject) => {
        const r = indexedDB.open("koox-maaya-grabar", 1);
        r.onerror = () => reject(r.error);
        r.onsuccess = () => {
          const db = r.result, tx = db.transaction("meta", "readwrite");
          tx.objectStore("meta").put({ speaker: "Doña Antigua", region: "Peto", license: "CC BY-SA 4.0", consent: true, consentAt: "2026-01-01T00:00:00.000Z", speakerId: "abc123def456" }, "profile");
          tx.oncomplete = () => { db.close(); resolve(); };
        };
      }));
      await page.reload({ waitUntil: "load" });
      await page.waitForFunction(() => window.__grabar && window.__grabar.ready === true);
      const pr = await G(page, () => window.__grabar.profile());
      check("un perfil de la versión anterior conserva su nombre y su licencia, deduce el crédito y no cuenta como aceptado",
        pr.consent === false && pr.credit === "nombre" && pr.speaker === "Doña Antigua" && pr.license === "CC BY-SA 4.0" && pr.aiUse === false &&
        pr.speakerId === "abc123def456" && (await G(page, () => window.__grabar.view())) === "intro", JSON.stringify(pr));
      check("y pide aceptar los permisos otra vez (casilla sin marcar, «Empezar» cerrado, nombre ya escrito)",
        !(await page.isChecked("#f-consent")) && await page.isDisabled("#btn-start") && (await page.inputValue("#f-speaker")) === "Doña Antigua" &&
        await page.isChecked('#f-credit input[value="nombre"]'));
      allErrors.push(...page.errors); allDialogs.push(...page.dialogs);
      await ctx.close();
    }

    // ======================= Sin IndexedDB: avisa y sigue funcionando en memoria
    {
      const cfg = { scheme: "light", noIDB: true };
      const { ctx, page } = await newPage(browser, cfg);
      await load(page);
      check("sin IndexedDB avisa que no se guardará", await page.isVisible("#storage-warn") && /se perderán/.test(await page.textContent("#storage-warn")));
      check("sin IndexedDB usa la memoria", (await G(page, () => window.__grabar.storage())) === "memoria");
      await giveConsent(page, {});
      const r = await recordGroup(page, cfg, picks.vocab);
      check("sin IndexedDB también graba", /Guardada/.test(r.status), r.status);
      allErrors.push(...page.errors); allDialogs.push(...page.dialogs);
      await ctx.close();
    }
  } finally {
    await browser.close();
    server.close();
  }

  check("sin errores de consola ni de página", !allErrors.length, allErrors.slice(0, 5).join(" | "));
  check("sin alert/confirm/prompt", !allDialogs.length, allDialogs.join(" | "));
  check("ninguna petición a otros servidores (solo localhost y fuentes)", !external.length, external.slice(0, 5).join(" | "));

  // ======================= El ZIP
  if (!zipPath || !fs.existsSync(zipPath)) { check("hay ZIP para revisar", false); return finish(T0); }
  const py = spawnSync("python3", ["-I", "-c",
    "import zipfile,sys,json\nz=zipfile.ZipFile(sys.argv[1])\nprint(json.dumps({'bad':z.testzip(),'names':z.namelist(),'methods':sorted(set(i.compress_type for i in z.infolist()))}))", zipPath],
  { encoding: "utf8" });
  if (py.status === 0) {
    const z = JSON.parse(py.stdout);
    check("el ZIP es válido para otra implementación (Python zipfile, CRC32 incluidos)", z.bad === null, py.stdout.trim());
    check("el ZIP no usa compresión (método store)", z.methods.length === 1 && z.methods[0] === 0);
    check("el ZIP trae grabaciones.json, LEEME.txt y 3 WAV", z.names.includes("grabaciones.json") && z.names.includes("LEEME.txt") &&
      z.names.filter((n) => /^wav\/[a-z0-9-]+\.wav$/.test(n)).length === 3, z.names.join(", "));
  } else log("  (python3 no disponible: se omite la comprobación independiente del ZIP)");
  const lib = await import(pathToFileURL(path.join(ROOT, "tools/import-recordings.mjs")).href);
  const zbuf = fs.readFileSync(zipPath);
  const entries = lib.readZip(zbuf);
  const byName = new Map(entries.map((e) => [e.name, e]));
  const manifest = JSON.parse(lib.extractEntry(zbuf, byName.get("grabaciones.json")).toString("utf8"));
  check("grabaciones.json: app, versión, consentimiento, licencia y hablante",
    manifest.app === "koox-maaya" && manifest.version === 1 && manifest.consent === true && manifest.license === "CC BY 4.0" &&
    manifest.speaker === "Hablante de Prueba" && manifest.region === "Peto" && !isNaN(Date.parse(manifest.createdAt)),
    JSON.stringify({ app: manifest.app, license: manifest.license, speaker: manifest.speaker, region: manifest.region }));
  check("grabaciones.json (modo normal): credit «nombre», aiUse false por omisión y el enlace de la licencia elegida",
    manifest.credit === "nombre" && manifest.aiUse === false && manifest.licenseUrl === "https://creativecommons.org/licenses/by/4.0/deed.es" && manifest.consentText === CONSENT,
    JSON.stringify({ credit: manifest.credit, aiUse: manifest.aiUse, url: manifest.licenseUrl }));
  check("grabaciones.json (modo normal): ningún elemento trae variant", manifest.items.every((i) => i.variant === undefined));
  const types = manifest.items.map((i) => i.type).sort().join(",");
  check("grabaciones.json: elementos de los tres tipos", /example/.test(types) && /letter/.test(types) && /vocab/.test(types), types);
  check("grabaciones.json: cada elemento con id, type, text y file", manifest.items.every((i) => i.id && i.type && i.text && /^wav\//.test(i.file) && byName.has(i.file)));
  const wavDir = path.join(TMP, "wav-check");
  fs.mkdirSync(wavDir, { recursive: true });
  const anyWav = entries.find((e) => e.name.startsWith("wav/"));
  fs.writeFileSync(path.join(wavDir, "x.wav"), lib.extractEntry(zbuf, anyWav));
  const p = probe(path.join(wavDir, "x.wav"));
  check("los WAV son mono, 16 bits, 44.1 kHz", p && p.codec === "pcm_s16le" && p.channels === 1 && p.sampleRate === 44100, JSON.stringify(p));

  // ======================= Importar a una COPIA temporal del repositorio
  const REPO = path.join(TMP, "repo");
  fs.cpSync(ROOT, REPO, {
    recursive: true,
    filter: (src) => {
      const rel = path.relative(ROOT, src).split(path.sep).join("/");
      return !/^(\.git|node_modules|site|site-sample|dist|test\/shots[^/]*|test\/\.fontcache|backup-[^/]*|work|ref|release)(\/|$)/.test(rel);
    }
  });
  const catFile = path.join(REPO, "audio", "catalogo.json");
  const keyOf = (it) => (it.type === "vocab" ? "v-" : it.type === "example" ? "ex-" : "l-") + (it.type === "letter" ? it.id : it.id);
  const expectedKeys = [...new Set(manifest.items.map(keyOf))].sort();
  // Una entrada previa de otra persona para una de las keys: no debe sobrescribirse sin --replace.
  const vocabItem = manifest.items.find((i) => i.type === "vocab" && i.id.startsWith("u2-"));
  const conflictKey = "v-" + vocabItem.id;
  const pre = runNode([path.join(REPO, "tools/audio-import.mjs"), "--in", wav, "--key", conflictKey, "--kind", "nativo", "--text", vocabItem.text,
    "--vocab", vocabItem.id, "--license", "CC0", "--author", "Otra Persona", "--source", "Prueba previa"]);
  check("audio-import.mjs importa un archivo suelto", pre.code === 0 && fs.existsSync(path.join(REPO, "audio", conflictKey + ".mp3")), pre.out.trim().split("\n").slice(-3).join(" | "));
  // Voz sintética de la misma palabra que la letra ch' (u1-chiich-pajaro): una en la key que derivaría la
  // grabación (el peor caso) y otra con la key propia de las sintéticas. Ninguna debe tocarse.
  const synthItem = manifest.items.find((i) => i.type === "vocab" && i.id === "u1-chiich-pajaro");
  const synthKeys = ["v-" + synthItem.id, "sint-" + synthItem.id];
  for (const k of synthKeys) {
    const r = runNode([path.join(REPO, "tools/audio-import.mjs"), "--in", wav, "--key", k, "--kind", "sintetico", "--text", synthItem.text,
      "--vocab", synthItem.id, "--license", "CC0", "--author", "Ko'ox Maaya (voz sintética)", "--source", "Prueba",
      "--notes", "Voz sintética aproximada; no sustituye a un hablante."]);
    if (r.code !== 0) check("prepara la voz sintética " + k, false, r.out);
  }
  const synthSnap = () => JSON.stringify(synthKeys.map((k) => [JSON.parse(fs.readFileSync(catFile, "utf8")).entries.find((e) => e.key === k), sha(path.join(REPO, "audio", k + ".mp3"))]));
  const synthBefore = synthSnap();
  const catBefore = sha(catFile);

  const dry = runNode([path.join(REPO, "tools/import-recordings.mjs"), zipPath, "--dry-run"]);
  check("--dry-run revisa sin escribir", dry.code === 0 && sha(catFile) === catBefore && /simulación/i.test(dry.out), dry.out.trim().split("\n").slice(-1)[0]);

  const imp = runNode([path.join(REPO, "tools/import-recordings.mjs"), zipPath]);
  const cat1 = JSON.parse(fs.readFileSync(catFile, "utf8"));
  const conflict1 = cat1.entries.find((e) => e.key === conflictKey);
  check("importa el ZIP (exit 0)", imp.code === 0, imp.out.trim().split("\n").slice(-2).join(" | "));
  check("no sobrescribe la entrada de otro autor sin --replace", conflict1 && conflict1.author === "Otra Persona" && /omitida/.test(imp.out));
  const mine = cat1.entries.filter((e) => e.author === "Hablante de Prueba");
  const mineKeys = mine.map((e) => e.key).sort();
  const wantKeys = expectedKeys.filter((k) => k !== conflictKey).map((k) => (k === synthKeys[0] ? k + "-2" : k)).sort();
  check("crea las entradas del catálogo con las keys derivadas", JSON.stringify(mineKeys) === JSON.stringify(wantKeys),
    mineKeys.join(", ") + " · esperadas " + wantKeys.join(", "));
  check("la grabación nativa convive con la voz sintética de la misma palabra (key -2)", synthSnap() === synthBefore &&
    mine.some((e) => e.key === synthKeys[0] + "-2" && JSON.stringify(e.vocab) === JSON.stringify([synthItem.id])) && /convive con la voz «sintetico»/.test(imp.out));
  const letterEntry = cat1.entries.find((e) => e.key === "l-ch-saltillo");
  check("la letra queda como l-ch-saltillo con letters [\"ch'\"]", letterEntry && JSON.stringify(letterEntry.letters) === "[\"ch'\"]" && letterEntry.vocab.length === 0);
  check("entradas «nativo» con crédito, licencia, región y fuente", mine.length > 0 && mine.every((e) =>
    e.kind === "nativo" && e.lang === "yua" && e.license === "CC BY 4.0" && e.speaker === "Hablante de Prueba" && e.region === "Peto" &&
    /^Grabación para Ko'ox Maaya, \d{4}-\d{2}-\d{2}$/.test(e.source) && e.durationMs > 0 && e.file === "audio/" + e.key + ".mp3"));
  check("notes guarda el crédito elegido y el uso para IA (no autorizado por omisión)",
    mine.length > 0 && mine.every((e) => /Crédito elegido: nombre\. Uso para IA del proyecto: no autorizado\./.test(e.notes)), mine.map((e) => e.notes).slice(0, 1).join(""));
  check("vocab según el tipo (palabra → [id]; ejemplo → [], se encuentra por texto)",
    mine.filter((e) => /^v-/.test(e.key)).every((e) => e.vocab.length === 1 && e.key.replace(/-\d+$/, "").endsWith(e.vocab[0])) &&
    mine.filter((e) => /^ex-/.test(e.key)).every((e) => e.vocab.length === 0 && e.letters.length === 0));
  const mp3s = mine.map((e) => probe(path.join(REPO, e.file)));
  check("se crearon los MP3 (mono, 44.1 kHz)", mp3s.length && mp3s.every((x) => x && x.codec === "mp3" && x.channels === 1 && x.sampleRate === 44100),
    mp3s.map((x) => x && x.durationMs + " ms").join(", "));
  const sorted = cat1.entries.map((e) => e.key);
  check("catálogo ordenado por key y con 2 espacios", JSON.stringify(sorted) === JSON.stringify([...sorted].sort()) && /^\{\n  "version": 1,\n  "entries": \[\n    \{/.test(fs.readFileSync(catFile, "utf8")));

  const again = runNode([path.join(REPO, "tools/import-recordings.mjs"), zipPath]);
  const cat2 = JSON.parse(fs.readFileSync(catFile, "utf8"));
  check("reimportar el mismo ZIP actualiza (no duplica)", again.code === 0 && cat2.entries.length === cat1.entries.length && /actualizada/.test(again.out));
  const alt = runNode([path.join(REPO, "tools/import-recordings.mjs"), zipPath, "--alternate"]);
  const cat3 = JSON.parse(fs.readFileSync(catFile, "utf8"));
  check("--alternate guarda una versión adicional (<key>-2)", alt.code === 0 && cat3.entries.some((e) => e.key === conflictKey + "-2" && e.author === "Hablante de Prueba") &&
    cat3.entries.find((e) => e.key === conflictKey).author === "Otra Persona");
  const rep = runNode([path.join(REPO, "tools/import-recordings.mjs"), zipPath, "--replace"]);
  const cat4 = JSON.parse(fs.readFileSync(catFile, "utf8"));
  check("--replace reemplaza la entrada de otro autor", rep.code === 0 && cat4.entries.find((e) => e.key === conflictKey).author === "Hablante de Prueba");
  check("ni --alternate ni --replace tocan las voces sintéticas", synthSnap() === synthBefore && !cat4.entries.some((e) => e.key === synthKeys[0] + "-3"));

  const val = runNode([path.join(REPO, "test/validate.cjs")], REPO);
  const audioErrors = val.out.split("\n").filter((l) => /✗/.test(l) && /audio\//.test(l));
  check("test/validate.cjs acepta el catálogo resultante (sin errores de audio)", !audioErrors.length, audioErrors.slice(0, 3).join(" | ") || val.out.split("\n").filter((l) => /^Audio/.test(l)).join(""));
  const audioWarn = val.out.split("\n").filter((l) => /audio\/catalogo\.json/.test(l) && /·/.test(l) && !/✗/.test(l));
  check("validate.cjs no avisa que el texto no coincide con la palabra", !audioWarn.some((l) => /no coincide/.test(l)), audioWarn.join(" | "));
  if (process.env.VERBOSE && audioWarn.length) log("    avisos de validate.cjs sobre el catálogo: " + audioWarn.map((l) => l.trim()).join(" | "));

  // ZIP con deflate (otro programa lo pudo volver a comprimir): se acepta.
  const repack = entries.map((e) => ({ name: e.name, data: lib.extractEntry(zbuf, e) }));
  const zDef = path.join(TMP, "deflate.zip");
  fs.writeFileSync(zDef, makeZip(repack, true));
  const d1 = runNode([path.join(REPO, "tools/import-recordings.mjs"), zDef, "--dry-run"]);
  check("acepta ZIP comprimidos con deflate", d1.code === 0 && /Resumen/.test(d1.out), d1.out.trim().split("\n").slice(-1)[0]);
  // Rutas peligrosas.
  const zEvil = path.join(TMP, "malo.zip");
  fs.writeFileSync(zEvil, makeZip([{ name: "grabaciones.json", data: Buffer.from("{}") }, { name: "../fuera.wav", data: Buffer.from("x") }]));
  const d2 = runNode([path.join(REPO, "tools/import-recordings.mjs"), zEvil]);
  check("rechaza rutas peligrosas (../)", d2.code !== 0 && /ruta peligrosa/.test(d2.out) && !fs.existsSync(path.join(TMP, "fuera.wav")), d2.out.trim());
  // Sin consentimiento.
  const noConsent = Object.assign({}, manifest, { consent: false });
  const zNo = path.join(TMP, "sin-consentimiento.zip");
  fs.writeFileSync(zNo, makeZip(repack.map((f) => (f.name === "grabaciones.json" ? { name: f.name, data: Buffer.from(JSON.stringify(noConsent)) } : f))));
  const catBeforeNo = sha(catFile);
  const d3 = runNode([path.join(REPO, "tools/import-recordings.mjs"), zNo]);
  check("rechaza un ZIP sin consentimiento", d3.code !== 0 && /consentimiento/.test(d3.out) && sha(catFile) === catBeforeNo, d3.out.trim());
  // Licencia no permitida.
  const zLic = path.join(TMP, "licencia.zip");
  fs.writeFileSync(zLic, makeZip(repack.map((f) => (f.name === "grabaciones.json" ? { name: f.name, data: Buffer.from(JSON.stringify(Object.assign({}, manifest, { license: "CC BY-NC 4.0" }))) } : f))));
  const d4 = runNode([path.join(REPO, "tools/import-recordings.mjs"), zLic]);
  check("rechaza una licencia no permitida", d4.code !== 0 && /licencia no permitida/.test(d4.out), d4.out.trim());

  // ======================= ZIP del modo acompañado: campos nuevos e importación (copia temporal)
  if (!zipPath2 || !fs.existsSync(zipPath2)) check("hay ZIP del modo acompañado para revisar", false);
  else {
    const z2 = fs.readFileSync(zipPath2);
    const ent2 = lib.readZip(z2);
    const by2 = new Map(ent2.map((e) => [e.name, e]));
    const man2 = JSON.parse(lib.extractEntry(z2, by2.get("grabaciones.json")).toString("utf8"));
    const readme2 = lib.extractEntry(z2, by2.get("LEEME.txt")).toString("utf8");
    check("ZIP acompañado: licencia «Solo para Ko'ox Maaya» (la de omisión) con el enlace a sus términos",
      man2.license === OWN && man2.licenseUrl === OWN_URL, JSON.stringify({ license: man2.license, url: man2.licenseUrl }));
    check("ZIP acompañado: aiUse true, credit «seudónimo», speaker, region y consentimiento",
      man2.aiUse === true && man2.credit === "seudónimo" && man2.speaker === "Don Prueba" && man2.region === "Hopelchén" && man2.consent === true && man2.consentText === CONSENT,
      JSON.stringify({ aiUse: man2.aiUse, credit: man2.credit, speaker: man2.speaker, region: man2.region }));
    const withVar = man2.items.filter((i) => i.variant), noVar = man2.items.filter((i) => !i.variant);
    const varFiles = new Set(withVar.map((i) => i.file)).size;
    check("ZIP acompañado: una variante (un solo audio, apóstrofo recto) y otro elemento sin variante",
      withVar.length > 0 && varFiles === 1 && withVar.every((i) => i.variant === "chi'ich") && noVar.length > 0 && new Set(man2.items.map((i) => i.file)).size === 2,
      JSON.stringify(man2.items.map((i) => [i.id, i.variant])));
    check("ZIP acompañado: LEEME.txt anota crédito, licencia, uso para IA, variante y el retiro de la voz",
      /Crédito elegido: seudónimo/.test(readme2) && /Uso para IA del proyecto: autorizado/.test(readme2) && /Solo para Ko'ox Maaya/.test(readme2) &&
      /variant/.test(readme2) && /retire su voz/.test(readme2));

    const impZ = (zip, ...args) => runNode([path.join(REPO, "tools/import-recordings.mjs"), zip, ...args]);
    const dry2 = impZ(zipPath2, "--dry-run");
    check("--dry-run del ZIP acompañado cuenta y lista las variantes y muestra los permisos",
      dry2.code === 0 && new RegExp("Variantes reportadas por el hablante: " + varFiles + "\\b").test(dry2.out) && /dijo «chi'ich» en lugar de «chich»/.test(dry2.out) &&
      /Crédito elegido: seudónimo/.test(dry2.out) && /Uso para IA del proyecto: autorizado/.test(dry2.out), dry2.out.trim().split("\n").slice(-3).join(" | "));
    const catBefore2 = sha(catFile);
    const real2 = impZ(zipPath2);
    const cat5 = JSON.parse(fs.readFileSync(catFile, "utf8"));
    const don = cat5.entries.filter((e) => e.author === "Don Prueba");
    check("importa el ZIP acompañado (exit 0) y crea una entrada por elemento", real2.code === 0 && sha(catFile) !== catBefore2 && don.length === man2.items.length,
      real2.out.trim().split("\n").slice(-4).join(" | "));
    const vEnt = don.filter((e) => /-var$/.test(e.key)), nEnt = don.filter((e) => !/-var$/.test(e.key));
    check("la variante crea entradas «-var» con vocab y letters vacíos, el texto de la variante y notes de «pendiente de revisión»",
      vEnt.length === withVar.length && vEnt.every((e) => e.kind === "nativo" && e.vocab.length === 0 && e.letters.length === 0 && e.text === "chi'ich" &&
        /El hablante dijo «chi'ich» en lugar de «chich» \(forma del curso\)\. Pendiente de revisión\./.test(e.notes)),
      JSON.stringify(vEnt.map((e) => [e.key, e.text, e.vocab, e.letters])));
    check("lo que no trae variante se importa como siempre (vocab o letters con la forma del curso)",
      nEnt.length === noVar.length && noVar.every((i) => nEnt.some((e) => e.text === i.text)) && nEnt.some((e) => e.vocab.length === 1),
      JSON.stringify(nEnt.map((e) => [e.key, e.text, e.vocab])));
    check("cada entrada guarda la licencia propia con su enlace, el crédito elegido, el uso para IA, el hablante y la región",
      don.every((e) => e.license === OWN && e.licenseUrl === OWN_URL && e.speaker === "Don Prueba" && e.region === "Hopelchén" &&
        /Crédito elegido: seudónimo\. Uso para IA del proyecto: autorizado\./.test(e.notes)), JSON.stringify(don.map((e) => e.notes)).slice(0, 220));
    const mp3b = don.map((e) => probe(path.join(REPO, e.file)));
    check("los MP3 del ZIP acompañado se crearon (mono, 44.1 kHz)", mp3b.length && mp3b.every((x) => x && x.codec === "mp3" && x.channels === 1 && x.sampleRate === 44100));

    const valB = runNode([path.join(REPO, "test/validate.cjs")], REPO);
    const audErr = valB.out.split("\n").filter((l) => /✗/.test(l) && /audio\//.test(l));
    check("test/validate.cjs reconoce la licencia nueva: sin errores de audio ni aviso de «licencia poco común»",
      !audErr.length && !/poco común/.test(valB.out) && !/Solo para Ko'ox Maaya»,? anota/.test(valB.out), audErr.slice(0, 3).join(" | "));
    check("validate.cjs avisa que la variante no sonará (no coincide con ninguna forma del curso)",
      /-var/.test(valB.out) && /no sonarán/.test(valB.out), valB.out.split("\n").filter((l) => /audio\/catalogo\.json/.test(l)).join(" | "));
    const cr = runNode([path.join(REPO, "tools/creditos.mjs")], REPO);
    const crChk = runNode([path.join(REPO, "tools/creditos.mjs"), "--check"], REPO);
    const md = fs.readFileSync(path.join(REPO, "audio", "CREDITOS.md"), "utf8");
    check("creditos.mjs reconoce la licencia nueva (enlace a los términos y aviso de que no es abierta) y --check queda al día",
      cr.code === 0 && crChk.code === 0 && md.includes("[Solo para Ko'ox Maaya](" + OWN_URL + ")") && /no tienen una licencia abierta/.test(md), (cr.out + crChk.out).trim());
    const valC = runNode([path.join(REPO, "test/validate.cjs")], REPO);
    check("con los créditos al día, validate.cjs ya no avisa de CREDITOS.md", !/CREDITOS/.test(valC.out), valC.out.split("\n").filter((l) => /CREDITOS/.test(l)).join(" | "));

    // Variantes del manifiesto: mismos permisos, otros datos.
    const alter = (patch) => {
      const f = path.join(TMP, "alt-" + Math.random().toString(36).slice(2) + ".zip");
      fs.writeFileSync(f, makeZip(ent2.map((e) => ({ name: e.name, data: e.name === "grabaciones.json" ? Buffer.from(JSON.stringify(Object.assign({}, man2, patch))) : lib.extractEntry(z2, e) }))));
      return impZ(f, "--dry-run");
    };
    const rAi = alter({ aiUse: "sí" });
    check("rechaza un aiUse que no es true o false", rAi.code !== 0 && /aiUse/.test(rAi.out), rAi.out.trim());
    const rCr = alter({ credit: "famoso" });
    check("rechaza un credit desconocido", rCr.code !== 0 && /credit no válido/.test(rCr.out), rCr.out.trim());
    const rAnon = alter({ credit: "anónimo" });
    check("con credit «anónimo» el autor es «Hablante anónimo» aunque el ZIP traiga un nombre (y avisa)", rAnon.code === 0 && /Grabaciones de: Hablante anónimo/.test(rAnon.out) &&
      !/Grabaciones de: Don Prueba/.test(rAnon.out) && /AVISO: el ZIP pide crédito anónimo/.test(rAnon.out), rAnon.out.trim().split("\n").slice(0, 3).join(" | "));
    const rOld = alter({ aiUse: undefined, credit: undefined });
    check("un ZIP anterior sin aiUse ni credit se acepta: con nombre y sin autorizar el uso para IA",
      rOld.code === 0 && /Crédito elegido: nombre/.test(rOld.out) && /Uso para IA del proyecto: no autorizado/.test(rOld.out), rOld.out.trim().split("\n").slice(0, 3).join(" | "));
    const rLic = alter({ license: "solo para koox maaya" });
    check("la licencia propia se acepta escrita de otra forma", rLic.code === 0 && /Solo para Ko'ox Maaya/.test(rLic.out), rLic.out.trim().split("\n").slice(0, 2).join(" | "));
  }

  check("el catálogo real del repositorio no cambió", sha(realCat) === realCatHash &&
    (fs.existsSync(path.join(ROOT, "audio")) ? fs.readdirSync(path.join(ROOT, "audio")).sort().join(",") : "") === realAudio);
  return finish(T0);
}

function finish(T0) {
  const bad = results.filter((r) => !r.pass);
  log("\n" + (results.length - bad.length) + "/" + results.length + " comprobaciones correctas en " + ((Date.now() - T0) / 1000).toFixed(1) + " s. Capturas en " + path.relative(process.cwd(), SHOTS) + "/");
  if (!process.env.KEEP_TMP) fs.rmSync(TMP, { recursive: true, force: true }); else log("Carpeta temporal: " + TMP);
  if (bad.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error("ERROR: " + (e && e.stack ? e.stack : e));
  if (!process.env.KEEP_TMP) fs.rmSync(TMP, { recursive: true, force: true });
  process.exit(1);
});
