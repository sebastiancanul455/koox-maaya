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
// diálogos del navegador, sin errores de consola y sin scroll horizontal a 390 px en claro y oscuro.
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
        author: "Prueba", license: "CC0 1.0", source: "Prueba", notes: "Voz sintética aproximada." }
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
  if (opts.speaker !== undefined) await page.fill("#f-speaker", opts.speaker);
  if (opts.region !== undefined) await page.fill("#f-region", opts.region);
  if (opts.license) await page.tap('#f-license input[value="' + opts.license + '"]');
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
  let zipPath = null, picks = null;
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
      check("las tres licencias explicadas, CC BY-SA 4.0 por omisión",
        (await page.$$eval("#f-license input", (xs) => xs.map((x) => x.value + (x.checked ? "*" : "")).join("|"))) === "CC BY-SA 4.0*|CC BY 4.0|CC0 1.0");
      check("texto de consentimiento exacto", (await page.textContent("#consent-text")).trim() ===
        "Acepto que mis grabaciones se publiquen en la app Ko'ox Maaya con esta licencia y con el crédito indicado.");
      check("sin consentimiento no se puede empezar", await page.isDisabled("#btn-start"));
      await page.tap('.step[data-view="rec"]', { force: true });
      check("sin consentimiento el paso «Grabar» no abre la grabación", (await G(page, () => window.__grabar.view())) === "intro" && await page.isHidden("#panel"));
      await checkOverflow(page, cfg, "Tus datos");
      await shot(page, cfg, "intro", true);

      await giveConsent(page, { speaker: "Hablante de Prueba", region: "Peto", license: "CC BY 4.0" });
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
      check("un audio «sintetico» no cuenta como cubierto", (await G(page, () => window.__grabar.groupInfo(window.__grabar.groupIndex("vocab", "u1-chich")).covered)) === false);
      await page.tap('#status-seg [data-status="pend"]');
      check("«Por grabar» oculta lo ya cubierto", !(await page.$('#list .row[data-i="' + picks.covered + '"]')));

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
  check("crea las entradas del catálogo con las keys derivadas", JSON.stringify(mineKeys) === JSON.stringify(expectedKeys.filter((k) => k !== conflictKey)),
    mineKeys.join(", ") + " · esperadas " + expectedKeys.join(", "));
  const letterEntry = cat1.entries.find((e) => e.key === "l-ch-saltillo");
  check("la letra queda como l-ch-saltillo con letters [\"ch'\"]", letterEntry && JSON.stringify(letterEntry.letters) === "[\"ch'\"]" && letterEntry.vocab.length === 0);
  check("entradas «nativo» con crédito, licencia, región y fuente", mine.length > 0 && mine.every((e) =>
    e.kind === "nativo" && e.lang === "yua" && e.license === "CC BY 4.0" && e.speaker === "Hablante de Prueba" && e.region === "Peto" &&
    /^Grabación para Ko'ox Maaya, \d{4}-\d{2}-\d{2}$/.test(e.source) && e.durationMs > 0 && e.file === "audio/" + e.key + ".mp3"));
  check("vocab según el tipo (palabra y ejemplo → [id])", mine.filter((e) => /^(v|ex)-/.test(e.key)).every((e) => e.vocab.length === 1 && e.key.endsWith(e.vocab[0])));
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

  const val = runNode([path.join(REPO, "test/validate.cjs")], REPO);
  const audioErrors = val.out.split("\n").filter((l) => /✗/.test(l) && /audio\//.test(l));
  check("test/validate.cjs acepta el catálogo resultante (sin errores de audio)", !audioErrors.length, audioErrors.slice(0, 3).join(" | ") || val.out.split("\n").filter((l) => /^Audio/.test(l)).join(""));

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
