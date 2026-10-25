// Ensamblado compartido de Ko'ox Maaya: une src/shell.html, src/app.css, src/app.js y el contenido.
// Lo usan build.mjs (Artifact de claude.ai) y build-web.mjs (sitio web independiente, PWA).
// Solo usa módulos de Node (fs, path).
import fs from "fs";
import path from "path";

export const ROOT = path.resolve(decodeURIComponent(new URL(".", import.meta.url).pathname));
export const MARKERS = ["/*@@CSS@@*/", "/*@@CONTENT@@*/", "/*@@APP@@*/"];

// Error de construcción: el mensaje se muestra tal cual, precedido de "ERROR: ".
export class BuildError extends Error {}
const fail = (msg) => { throw new BuildError(msg); };

/**
 * Ensambla la página única en formato Artifact (sin doctype/html/head/body; la plataforma la envuelve).
 * @param {{ sample?: boolean, root?: string, warn?: (msg: string) => void }} [opts]
 *   sample: usa test/sample-content.js en lugar de src/content/u1.js..uN.js.
 * @returns {{ html: string, parts: { name: string, code: string }[] }}
 * @throws {BuildError} si alguna comprobación falla.
 */
export function assemble(opts = {}) {
  const root = opts.root || ROOT;
  const sample = !!opts.sample;
  const warn = opts.warn || ((m) => console.warn(m));
  const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

  const shell = read("src/shell.html");
  const css = read("src/app.css");
  const js = read("src/app.js");

  // Contenido: cada archivo va en su propio <script> para que un error en una unidad no tumbe a las demás.
  let parts = [];
  if (sample) {
    parts.push({ name: "test/sample-content.js", code: read("test/sample-content.js") });
  } else {
    const dir = path.join(root, "src/content");
    const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /^u\d+\.js$/.test(f)) : [];
    files.sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10));
    parts = files.map((f) => ({ name: "src/content/" + f, code: fs.readFileSync(path.join(dir, f), "utf8") }));
  }
  if (!parts.length) warn("AVISO: no hay archivos de contenido; la app mostrará un estado vacío.");

  for (const p of parts) {
    if (/<\/script/i.test(p.code)) fail(p.name + " contiene </script, que rompería la página.");
    if (/<!--/.test(p.code) && /<script/i.test(p.code)) fail(p.name + " contiene <!-- y <script, que pueden romper la página.");
  }
  if (/<\/script/i.test(js)) fail("src/app.js contiene </script.");
  if (/<\/style/i.test(css)) fail("src/app.css contiene </style.");

  const content = parts.length
    ? parts.map((p) => "/* " + p.name + " */\n" + p.code.trim()).join("\n</script>\n<script>\n")
    : "/* sin contenido */";

  for (const mk of MARKERS) {
    const n = shell.split(mk).length - 1;
    if (n !== 1) fail("shell.html debe tener el marcador " + mk + " exactamente una vez (tiene " + n + ").");
  }

  // Funciones de reemplazo: así los "$" del código no se interpretan como patrones.
  const html = shell
    .replace("/*@@CSS@@*/", () => css)
    .replace("/*@@CONTENT@@*/", () => content)
    .replace("/*@@APP@@*/", () => js);

  if (/<!doctype/i.test(html)) fail("el resultado contiene <!doctype.");
  if (/<html[\s>]/i.test(html)) fail("el resultado contiene <html>.");
  if (/<body[\s>]/i.test(html)) fail("el resultado contiene <body>.");
  if (/<head[\s>]/i.test(html)) fail("el resultado contiene <head>.");
  if (!/<title>Ko'ox Maaya<\/title>/.test(html.slice(0, 8192))) fail("falta <title>Ko'ox Maaya</title> en los primeros 8 KB.");

  return { html, parts };
}
