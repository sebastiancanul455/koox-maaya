#!/usr/bin/env node
// Genera los íconos de la versión web instalable de Ko'ox Maaya.
//   node tools/icons.cjs   -> src/web/icons/ (favicon.svg, PNG 192/512, maskable 512, apple-touch-icon 180, icons.json)
// Dibujo: la greca escalonada del logotipo (el mismo trazo que ICON.mark en src/app.js) en k'an sobre ya'ax.
// Los PNG se rasterizan con Playwright (Chromium). build-web.mjs solo copia estos archivos y
// comprueba en icons.json que estén al día con este script.
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { chromium } = require("playwright");

const OUT = path.join(__dirname, "..", "src", "web", "icons");
const YAAX = "#0d6b62";   // --yaax (claro) de src/app.css
const KAN = "#f0b52c";    // --kan-hi (claro): más luminoso, contrasta mejor sobre ya'ax

// Greca escalonada del logotipo, en su caja 28×28 (ICON.mark): cuerpo de 26×17 entre x 1–27 y y 9–26.
const MARK = "M1 26h26v-4h-3.5v-4H20v-4h-3.5V9h-5v5H8v4H4.5v4H1z";
const MARK_BOX = { x: 1, y: 9, w: 26, h: 17 };

/**
 * SVG cuadrado de 512×512.
 * @param {{ radius: number, markW: number }} o radius: radio de las esquinas del fondo (0 = a sangre);
 *   markW: ancho de la greca en unidades de 512.
 */
function iconSVG(o) {
  const s = o.markW / MARK_BOX.w;
  const lift = 0.03 * 512; // centrado óptico: la greca pesa abajo, se sube un poco
  const tx = 256 - (MARK_BOX.x + MARK_BOX.w / 2) * s;
  const ty = 256 - lift - (MARK_BOX.y + MARK_BOX.h / 2) * s;
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">' +
    '<rect width="512" height="512"' + (o.radius ? ' rx="' + o.radius + '"' : "") + ' fill="' + YAAX + '"/>' +
    '<path transform="translate(' + tx.toFixed(3) + " " + ty.toFixed(3) + ") scale(" + s.toFixed(5) + ')" d="' + MARK + '" fill="' + KAN + '"/>' +
    "</svg>\n";
}

// Variantes. «maskable»: la greca cabe holgada en la zona segura (círculo de radio 40 %, el 80 % central).
const ANY = iconSVG({ radius: 96, markW: 340 });
const FULL = iconSVG({ radius: 0, markW: 340 });       // iOS redondea las esquinas por su cuenta
const MASKABLE_W = 300;
const MASKABLE = iconSVG({ radius: 0, markW: MASKABLE_W });

const PNGS = [
  { file: "icon-192.png", svg: ANY, size: 192, purpose: "any", manifest: true },
  { file: "icon-512.png", svg: ANY, size: 512, purpose: "any", manifest: true },
  { file: "icon-maskable-512.png", svg: MASKABLE, size: 512, purpose: "maskable", manifest: true },
  { file: "apple-touch-icon.png", svg: FULL, size: 180, purpose: "any", manifest: false }
];

// Comprueba que la greca de la variante maskable quede dentro de la zona segura.
function checkSafeZone() {
  const s = MASKABLE_W / MARK_BOX.w, halfW = MASKABLE_W / 2, halfH = (MARK_BOX.h * s) / 2, lift = 0.03 * 512;
  const r = Math.hypot(halfW, halfH + lift);
  if (r > 0.4 * 512) throw new Error("la greca se sale de la zona segura maskable (" + r.toFixed(1) + " > 204.8)");
  return r;
}

(async () => {
  const r = checkSafeZone();
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, "favicon.svg"), ANY);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const p of PNGS) {
    await page.setViewportSize({ width: p.size, height: p.size });
    await page.setContent('<!doctype html><html><head><style>html,body{margin:0;background:transparent}svg{display:block;width:' +
      p.size + "px;height:" + p.size + "px}</style></head><body>" + p.svg + "</body></html>");
    await page.screenshot({ path: path.join(OUT, p.file), omitBackground: true, clip: { x: 0, y: 0, width: p.size, height: p.size } });
    console.log("  " + p.file + " (" + p.size + "×" + p.size + ", " + p.purpose + ")");
  }
  await browser.close();
  const meta = {
    generator: "tools/icons.cjs",
    generatorSha256: crypto.createHash("sha256").update(fs.readFileSync(__filename)).digest("hex"),
    favicon: "favicon.svg",
    appleTouchIcon: "apple-touch-icon.png",
    icons: PNGS.map((p) => ({ file: p.file, size: p.size, purpose: p.purpose, manifest: p.manifest }))
  };
  fs.writeFileSync(path.join(OUT, "icons.json"), JSON.stringify(meta, null, 2) + "\n");
  console.log("Íconos en " + OUT + " · greca maskable a " + r.toFixed(1) + " px del centro (zona segura: 204.8)");
})().catch((e) => { console.error("ERROR: " + (e && e.message || e)); process.exit(1); });
