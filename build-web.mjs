// Construye la versión web independiente e instalable (PWA) de Ko'ox Maaya, para GitHub Pages.
//   node build-web.mjs             -> site/ (index.html, manifest.webmanifest, sw.js, icons/, .nojekyll)
//   node build-web.mjs --out .     -> lo mismo en la raíz del repositorio (GitHub Pages desde main, raíz)
//   node build-web.mjs --out <dir> -> en otra carpeta (relativa a esta)
// Parte del mismo ensamblado que el Artifact (build-core.mjs) y solo lo reacomoda en un documento
// completo. Los PNG de los íconos se generan aparte con Playwright (node tools/icons.cjs) y aquí
// solo se copian. site/ se borra y se vuelve a escribir entero: no edites nada a mano ahí. Con --out
// solo se reemplazan los archivos que genera este script (y los íconos de icons/); lo demás no se toca.
// Solo usa módulos de Node (fs, path, crypto).
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { assemble, BuildError, ROOT } from "./build-core.mjs";

const DEFAULT_SITE = path.join(ROOT, "site");
const argv = process.argv.slice(2);
const iOut = argv.indexOf("--out");
if (iOut >= 0 && (!argv[iOut + 1] || argv[iOut + 1].startsWith("--"))) {
  console.error("ERROR: falta la carpeta después de --out."); process.exit(1);
}
const SITE = iOut >= 0 ? path.resolve(ROOT, argv[iOut + 1]) : DEFAULT_SITE;
const WEB = path.join(ROOT, "src", "web");
const ICONS = path.join(WEB, "icons");
const NAME = "Ko'ox Maaya";
const VERSION_MARK = "@@VERSION@@";

const fail = (msg) => { throw new BuildError(msg); };
const sha256 = (data) => crypto.createHash("sha256").update(data).digest("hex");
const attr = (tag, name) => {
  const m = new RegExp("\\s" + name + "\\s*=\\s*(\"([^\"]*)\"|'([^']*)'|([^\\s>]+))", "i").exec(tag);
  return m ? (m[2] ?? m[3] ?? m[4]) : null;
};
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const escAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/**
 * Separa el html del Artifact en: etiquetas de cabecera (antes de <style>), el bloque <style> y el cuerpo.
 * El shell empieza con <title>, <meta>, <link> y <noscript>; cualquier otra cosa ahí es un error.
 */
function splitArtifact(html) {
  const iStyle = html.indexOf("<style>");
  if (iStyle < 0) fail("no se encontró <style> en el resultado del ensamblado.");
  const iEnd = html.indexOf("</style>", iStyle);
  if (iEnd < 0) fail("no se encontró </style>.");
  const prelude = html.slice(0, iStyle);
  const style = html.slice(iStyle, iEnd + "</style>".length);
  const body = html.slice(iEnd + "</style>".length).trim();
  const tags = [];
  const re = /\s+|<!--[\s\S]*?-->|<title>[\s\S]*?<\/title>|<meta\b[^>]*>|<link\b[^>]*>|<noscript>[\s\S]*?<\/noscript>/y;
  let m;
  while (re.lastIndex < prelude.length && (m = re.exec(prelude))) {
    if (m[0].trim() && !m[0].startsWith("<!--")) tags.push(m[0]);
  }
  if (re.lastIndex < prelude.length) {
    fail("contenido inesperado antes de <style> en shell.html: " + JSON.stringify(prelude.slice(re.lastIndex, re.lastIndex + 60)));
  }
  return { tags, style, body };
}

// Colores de la paleta, leídos de src/app.css (bloque :root y bloque oscuro).
function palette(css) {
  const rootBlock = /:root\s*\{([\s\S]*?)\n\}/.exec(css);
  const darkBlock = /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root[^{]*\{([\s\S]*?)\}/.exec(css);
  if (!rootBlock || !darkBlock) fail("no se encontraron los bloques de color de src/app.css.");
  const get = (block, name) => {
    const v = new RegExp("--" + name + ":\\s*(#[0-9a-fA-F]{3,8})\\b").exec(block);
    if (!v) fail("no se encontró --" + name + " en src/app.css.");
    return v[1].toLowerCase();
  };
  return { bg: get(rootBlock[1], "bg"), bgDark: get(darkBlock[1], "bg"), yaax: get(rootBlock[1], "yaax") };
}

// Lee src/web/icons/icons.json y comprueba que los PNG estén al día con tools/icons.cjs.
function loadIcons() {
  const metaFile = path.join(ICONS, "icons.json");
  if (!fs.existsSync(metaFile)) fail("faltan los íconos: ejecuta  node tools/icons.cjs");
  const meta = JSON.parse(fs.readFileSync(metaFile, "utf8"));
  const gen = path.join(ROOT, "tools", "icons.cjs");
  if (fs.existsSync(gen) && sha256(fs.readFileSync(gen)) !== meta.generatorSha256) {
    fail("los íconos no están al día con tools/icons.cjs: ejecuta  node tools/icons.cjs");
  }
  const files = [meta.favicon, meta.appleTouchIcon, ...meta.icons.map((i) => i.file)];
  for (const f of files) if (!fs.existsSync(path.join(ICONS, f))) fail("falta src/web/icons/" + f + ": ejecuta  node tools/icons.cjs");
  return { meta, files: [...new Set(files)] };
}

function build() {
  const { html, parts } = assemble({ warn: (m) => console.warn(m) });
  const css = fs.readFileSync(path.join(ROOT, "src", "app.css"), "utf8");
  const col = palette(css);
  const icons = loadIcons();
  const { tags, style, body } = splitArtifact(html);

  // Cabecera: se conservan las etiquetas del shell salvo las propias de claude.ai.
  const keep = tags.filter((t) => !/^<meta\b/i.test(t) || !/^claude:/i.test(attr(t, "name") || ""));
  const titleTag = keep.find((t) => /^<title>/i.test(t));
  if (!titleTag || decode(titleTag.replace(/<\/?title>/gi, "")) !== NAME) fail("el shell debe tener <title>" + NAME + "</title>.");
  const descTag = keep.find((t) => /^<meta\b/i.test(t) && (attr(t, "name") || "").toLowerCase() === "description");
  const description = descTag ? decode(attr(descTag, "content") || "") : "Curso de maya yucateco desde el español.";
  const metas = keep.filter((t) => /^<meta\b/i.test(t));
  const links = keep.filter((t) => !/^<meta\b|^<title>/i.test(t));
  const hasName = (n) => metas.some((t) => (attr(t, "name") || "").toLowerCase() === n);

  const head = [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    titleTag,
    ...(descTag ? [] : ['<meta name="description" content="' + escAttr(description) + '">']),
    ...metas,
    ...(hasName("apple-mobile-web-app-title") ? [] : ['<meta name="apple-mobile-web-app-title" content="' + escAttr(NAME) + '">']),
    // La app ajusta #meta-theme al fondo actual; estas dos cubren el arranque, antes del JavaScript.
    '<meta name="theme-color" content="' + col.bg + '" media="(prefers-color-scheme: light)">',
    '<meta name="theme-color" content="' + col.bgDark + '" media="(prefers-color-scheme: dark)">',
    '<link rel="manifest" href="manifest.webmanifest">',
    '<link rel="icon" href="icons/' + icons.meta.favicon + '" type="image/svg+xml">',
    '<link rel="apple-touch-icon" href="icons/' + icons.meta.appleTouchIcon + '">',
    ...links,
    // Equivalente al envoltorio que agrega claude.ai alrededor del Artifact.
    "<style>\n:root { color-scheme: light; padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px) }\n" +
      "body { margin: 0; font: 14px system-ui, sans-serif }\nimg { max-width: 100% }\n[hidden] { display: none !important }\n</style>",
    style,
    '<script>window.KOOX_STANDALONE = true; window.KOOX_BUILD = "' + VERSION_MARK + '";</script>'
  ];

  // Registro del service worker: solo con https o en localhost (contextos seguros).
  // Al volver a la app (como mucho cada 30 min) pregunta si hay una versión nueva.
  const swRegister = "<script>\n(function () {\n" +
    "  var local = /^(localhost|127\\.0\\.0\\.1|\\[::1\\])$/.test(location.hostname);\n" +
    "  if (!(\"serviceWorker\" in navigator) || !(location.protocol === \"https:\" || local)) return;\n" +
    "  window.addEventListener(\"load\", function () {\n" +
    "    navigator.serviceWorker.register(\"sw.js\").then(function (reg) {\n" +
    "      var last = Date.now();\n" +
    "      document.addEventListener(\"visibilitychange\", function () {\n" +
    "        if (document.visibilityState !== \"visible\" || Date.now() - last < 30 * 60 * 1000) return;\n" +
    "        last = Date.now();\n" +
    "        reg.update().catch(function () {});\n" +
    "      });\n" +
    "    }).catch(function () {});\n" +
    "  });\n" +
    "})();\n</script>";

  let index = "<!doctype html>\n<html lang=\"es\">\n<head>\n" + head.join("\n") + "\n</head>\n<body>\n" + body + "\n" + swRegister + "\n</body>\n</html>\n";
  if (index.split(VERSION_MARK).length !== 2) fail("el marcador de versión aparece más de una vez en index.html.");

  const manifest = JSON.stringify({
    id: "./",
    name: NAME,
    short_name: NAME,
    description,
    lang: "es",
    dir: "ltr",
    start_url: "./",
    scope: "./",
    display: "standalone",
    background_color: col.yaax,
    theme_color: col.yaax,
    categories: ["education"],
    icons: icons.meta.icons.filter((i) => i.manifest).map((i) => ({
      src: "icons/" + i.file, sizes: i.size + "x" + i.size, type: "image/png", purpose: i.purpose
    }))
  }, null, 2) + "\n";

  const swTemplate = fs.readFileSync(path.join(WEB, "sw.js"), "utf8");
  if (swTemplate.split(VERSION_MARK).length !== 2 || swTemplate.split("/*@@PRECACHE@@*/[]").length !== 2) {
    fail("src/web/sw.js debe tener " + VERSION_MARK + " y /*@@PRECACHE@@*/[] exactamente una vez.");
  }
  const precache = ["index.html", "manifest.webmanifest", ...icons.files.map((f) => "icons/" + f)];

  // Versión = hash de todo lo que se publica (con el marcador en lugar de la versión).
  const h = crypto.createHash("sha256");
  for (const chunk of [index, manifest, swTemplate, JSON.stringify(precache)]) h.update(chunk).update("\0");
  for (const f of icons.files) h.update(fs.readFileSync(path.join(ICONS, f))).update("\0");
  const version = h.digest("hex").slice(0, 12);

  index = index.replace(VERSION_MARK, () => version);
  const sw = swTemplate
    .replace(VERSION_MARK, () => version)
    .replace("/*@@PRECACHE@@*/[]", () => JSON.stringify(precache));

  // Comprobaciones del documento final.
  if (!/^<!doctype html>/i.test(index)) fail("index.html debe empezar con <!doctype html>.");
  for (const t of ["<html", "<head>", "</head>", "<body>", "</body>"]) {
    if (index.split(t).length !== 2) fail("index.html debe tener " + t + " exactamente una vez.");
  }
  if (index.indexOf("window.KOOX_STANDALONE") > index.indexOf("window.__koox")) fail("KOOX_STANDALONE debe ir antes del script de la app.");

  // Carpeta propia (site/): se borra entera. Otra carpeta (p. ej. la raíz del repositorio): solo se
  // reemplazan los archivos generados; icons/ se vacía solo si no tiene nada más que íconos.
  const dentro = (p) => p === ROOT || p.startsWith(ROOT + path.sep);
  for (const prot of ["src", "kb", "test", "data", "revision", "tools", "dist"]) {
    const pp = path.join(ROOT, prot);
    if (SITE === pp) fail("--out no puede ser la carpeta " + prot + "/.");
    if (pp.startsWith(SITE + path.sep) && SITE !== ROOT) fail("--out no puede ser " + path.relative(ROOT, SITE) + ": contiene la carpeta " + prot + "/ del repositorio.");
    if (SITE.startsWith(pp + path.sep)) fail("--out no puede estar dentro de " + prot + "/.");
  }
  if (SITE === DEFAULT_SITE) fs.rmSync(SITE, { recursive: true, force: true });
  else {
    if (!dentro(SITE) && fs.existsSync(SITE) && fs.readdirSync(SITE).some((f) => !/^(index\.html|manifest\.webmanifest|sw\.js|\.nojekyll|icons)$/.test(f))) {
      fail("--out " + SITE + " tiene otros archivos y está fuera del repositorio; usa una carpeta vacía.");
    }
    const dirIcons = path.join(SITE, "icons");
    if (fs.existsSync(dirIcons)) {
      const ajenos = fs.readdirSync(dirIcons).filter((f) => !/^(icon-[\w-]+\.png|apple-touch-icon\.png|favicon\.svg)$/.test(f));
      if (ajenos.length) fail("icons/ tiene archivos que no son íconos generados: " + ajenos.join(", "));
      fs.rmSync(dirIcons, { recursive: true, force: true });
    }
  }
  fs.mkdirSync(path.join(SITE, "icons"), { recursive: true });
  fs.writeFileSync(path.join(SITE, "index.html"), index);
  fs.writeFileSync(path.join(SITE, "manifest.webmanifest"), manifest);
  fs.writeFileSync(path.join(SITE, "sw.js"), sw);
  fs.writeFileSync(path.join(SITE, ".nojekyll"), "");
  for (const f of icons.files) fs.copyFileSync(path.join(ICONS, f), path.join(SITE, "icons", f));

  const kb = (s) => (Buffer.byteLength(s, "utf8") / 1024).toFixed(1) + " KB";
  console.log("Escrito " + (path.relative(process.cwd(), SITE) || ".") + "/");
  console.log("  index.html " + kb(index) + " · " + parts.length + " archivo(s) de contenido");
  console.log("  manifest.webmanifest, sw.js, .nojekyll, icons/ (" + icons.files.length + " archivos)");
  console.log("  versión de caché: koox-maaya-" + version);
}

try { build(); }
catch (e) {
  if (e instanceof BuildError) { console.error("ERROR: " + e.message); process.exit(1); }
  throw e;
}
