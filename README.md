# Ko'ox Maaya

App web para aprender **maya yucateco desde el español**, pensada para el celular. Es para
hispanohablantes que parten de cero y quieren aprender a saludar, presentarse, contar, hablar
de la familia, la comida, el cuerpo, la naturaleza y el tiempo, con la ortografía normativa
de 2014. *Ko'ox* significa «¡vamos!».

**Abrir la app:** <https://sebastiancanul455.github.io/koox-maaya/>

> **Aviso.** El contenido se preparó con ayuda de inteligencia artificial y se cotejó con
> fuentes públicas, pero todavía no lo han revisado hablantes nativos. Úsalo para aprender y
> valida con hablantes lo que vayas a usar. **No está validado para uso clínico**: no uses las
> frases de salud con pacientes sin una validación formal; en la consulta recurre a un
> intérprete o a material validado por hablantes.

## Instalarla en Android

1. Abre el enlace de arriba en **Chrome**.
2. Toca el botón **Instalar app** de la sección Perfil, o el menú ⋮ → **Instalar app**
   (en algunas versiones dice «Agregar a la pantalla principal»).
3. Ábrela desde su ícono, como cualquier app.

Después de la primera visita **funciona sin conexión**: las lecciones, el repaso y el
diccionario quedan guardados en el teléfono. Cuando hay una versión nueva, la app la descarga
sola y avisa. Tu avance (lecciones, repaso, racha) se guarda **solo en ese teléfono y ese
navegador**: no hay cuentas ni se envía nada a ningún servidor. Si borras los datos del
navegador, se borra tu avance.

## Qué contiene

- **9 unidades**: sonidos del maya, saludos, personas y familia, números, día a día, comida y
  mercado, cuerpo y salud, naturaleza y colores, tiempo y cultura. Al momento de escribir esto
  suman 37 lecciones, 356 palabras y frases (65 «por confirmar»), 9 diálogos y 296 ejercicios
  (`node test/validate.cjs` da los números actuales).
- **Lecciones** cortas: tarjetas de explicación (con notas de cultura y avisos), vocabulario
  con pronunciación aproximada y ejemplos, un diálogo y ejercicios.
- **Cuatro tipos de ejercicio**: elegir la opción correcta (de maya a español y al revés),
  completar el hueco de una frase, armar la frase con fichas y escribir la respuesta.
- **Repaso espaciado** (sistema Leitner de 5 cajas): cada palabra que aciertas vuelve después
  de 1, 3, 7, 16 y 35 días; si fallas, vuelve a la primera caja. También hay repaso por unidad
  y práctica de las palabras más difíciles.
- **Diccionario** maya ↔ español con búsqueda y filtro por unidad, y una **guía de
  pronunciación** con las 27 letras del alfabeto.
- Puntos de experiencia, racha de días y meta diaria. Se adapta al modo claro u oscuro del
  teléfono.

## Cómo se verificó el contenido

Cada forma maya que enseña la app sale de una base de conocimiento con sus fuentes, guardada
en `kb/`:

1. **Bases iniciales** (`kb/sonidos-conversacion.json`, `kb/vocabulario-cultura.json`,
   `kb/gramatica.json`): cada entrada tiene la forma maya, su glosa, pronunciación, notas, las
   fuentes consultadas y la evidencia citada de cada una.
2. **Verificación independiente** (`kb/*.verified.json`): otro agente revisó cada entrada con
   escepticismo (fidelidad a la cita, ortografía de 2014, coherencia entre bases) y le asignó un
   estado: **verificado**, **probable**, **dudoso** o **incorrecto**, con su nota y, si hacía
   falta, una corrección.
3. **Reverificación** (`kb/recheck-*.json` y, en una tercera pasada, `kb/recheck3-*.json`): las
   formas dudosas o probables se volvieron a buscar, sobre todo en el diccionario maya de la UADY
   (mayas.uady.mx). Cada ítem registra el estado anterior, el nuevo, la evidencia y las fuentes.
   Cuando dos pasadas no coinciden, manda la más reciente.

En la app, lo **verificado** se enseña normalmente. Lo **probable** aparece con la insignia
**«por confirmar»**: se muestra para reconocerlo, pero la app no te pide escribirlo ni
armarlo. Lo **dudoso** o **incorrecto** no se enseña.

**Límites.** Todo esto lo hizo una IA cotejando fuentes públicas: diccionarios y cursos de la
UADY, normas y prontuarios del INALI, gramáticas (Bolles, Lehmann, Andrade, Yoshida), Wiktionary
y prensa de la península, entre otras. Gran parte de la evidencia viene de extractos de
buscador y no de las páginas completas, algunas fuentes son débiles (páginas que reproducen el
diccionario de la UADY) y la ortografía y el vocabulario varían entre regiones. Por eso el
siguiente paso es la **revisión por hablantes nativos**: la carpeta [`revision/`](revision/)
tiene la hoja y las instrucciones. Si encuentras un error, abre un *issue*.

Las fuentes de cada unidad aparecen en la app (Perfil → Fuentes) y las de cada palabra en
`data/glosario.json`. Los libros que solo circulan en copias no autorizadas se citan por su
título, sin enlace (también en `kb/`, donde esas fuentes llevan la nota «copia no autorizada:
se cita solo el título»).

## Estructura del repositorio

La raíz del repositorio **es el sitio publicado** (GitHub Pages sirve la rama `gh-pages`, que es una copia de `main`; carpeta raíz):

```
index.html            la app (generada por build-web.mjs: no se edita a mano)
manifest.webmanifest  manifiesto de la app instalable (generado)
sw.js                 service worker: funciona sin conexión (generado)
icons/                íconos de la app (copiados de src/web/icons)
.nojekyll             para que GitHub Pages sirva los archivos tal cual
src/
  shell.html          plantilla de la página (marcadores /*@@CSS@@*/, /*@@CONTENT@@*/, /*@@APP@@*/)
  app.css             estilos
  app.js              motor: lecciones, ejercicios, repaso, diccionario, progreso
  content/u1.js …     contenido, un archivo por unidad
  web/                piezas de la versión web: plantilla del service worker e íconos
build-core.mjs        ensamblado común de la página
build.mjs             página única en formato Artifact de claude.ai (dist/)
build-web.mjs         sitio web instalable (PWA)
export-data.mjs       glosario (data/) y hoja de revisión (revision/)
dist/                 koox-maaya-artifact.html: la página para claude.ai, generada
data/                 glosario.json y glosario.csv, generados
revision/             hoja de revisión para hablantes e instrucciones
kb/                   bases de conocimiento con estados y fuentes
test/                 validate.cjs, smoke.cjs, pwa.cjs y contenido de muestra
tools/                utilidades (icons.cjs genera los PNG de los íconos)
```

## Desarrollo

Requisitos: **Node 18 o más reciente**. Construir no necesita dependencias. Playwright solo hace
falta para las pruebas en navegador:

```bash
npm install && npx playwright install chromium
```

(usa la versión de Playwright fijada en `package.json`).

| Comando | Qué hace |
| --- | --- |
| `node test/validate.cjs` | Valida el contenido contra el contrato de datos. Sale con error si algo falla. |
| `node build.mjs` | Arma la página única para claude.ai en `dist/koox-maaya-artifact.html` (sin doctype: claude.ai la envuelve). Con `--out <ruta>` la escribe en otro lugar. |
| `node build-web.mjs --out .` | Regenera el sitio instalable **en la raíz del repositorio**: `index.html`, `manifest.webmanifest`, `sw.js`, `icons/` y `.nojekyll`. Solo reemplaza esos archivos. Sin `--out` lo escribe en `site/` (carpeta ignorada por git, útil para probar sin tocar la raíz). |
| `node export-data.mjs` | Regenera `data/glosario.json`, `data/glosario.csv` y la hoja de `revision/`. Con `--detalle` lista las palabras sin respaldo en `kb/`. |
| `node test/smoke.cjs <html>` | Pruebas de extremo a extremo con Playwright sobre una página armada: `node test/smoke.cjs dist/koox-maaya-artifact.html` o `node test/smoke.cjs index.html`. |
| `node test/pwa.cjs .` | Pruebas de la versión web instalable (manifest, service worker, sin conexión, aviso de versión nueva) sobre el sitio de la raíz; al final corre `smoke.cjs` sobre `index.html`. |

Atajos: `npm run validate`, `npm run build`, `npm run build:web`, `npm run export`, `npm test`
(valida, arma y corre `smoke.cjs` sobre el Artifact) y `npm run test:pwa`.

Después de cambiar el contenido, el orden es: `validate` → `build` y `build:web` → `export` →
pruebas. Haz commit de los archivos regenerados (`index.html`, `sw.js`, `dist/`, `data/`,
`revision/`) junto con el cambio. Si cambias el diseño del ícono en `tools/icons.cjs`, corre
`node tools/icons.cjs` antes de `build-web.mjs` (si se te olvida, `build-web.mjs` se detiene y
lo avisa).

## Agregar una unidad o una lección

Cada unidad vive en `src/content/uN.js` y agrega **exactamente una** unidad a
`window.COURSE.units`. Las unidades se cargan en orden numérico, así que una unidad nueva es un
archivo nuevo (`u10.js`, …):

```js
(window.COURSE = window.COURSE || { units: [] }).units.push({
  id: "u10", n: 10,                    // id = "u" + n, y n coincide con el nombre del archivo
  title: "…", subtitle: "…",
  sources: [{ title: "…", url: "https://…" }],   // al menos una; url opcional y solo https
  lessons: [ /* lecciones */ ]
});
```

Resumen del contrato que revisa `test/validate.cjs`:

- **Lección**: `id` consecutivo (`u10l1`, `u10l2`, …), `title`, `goal` que empieza con «Al
  terminar podrás…», `teach`, `vocab`, `dialogue` (opcional) y `exercises`.
- **teach**: de 1 a 4 tarjetas. `kind` es `text`, `tip`, `culture` o `warn` con `html` (solo se
  permiten `<b>`, `<i>`, `<br>` y `<span class="m">` para el maya), o `table` con `head` y `rows`
  de texto plano.
- **vocab**: de 5 a 12 palabras `{ id: "u10-slug", m, es, conf, pr?, note?, ex?: { m, es }, alt?: [] }`.
  El `id` va en minúsculas ascii con guiones y no se repite en todo el curso. `conf` es `"alta"`
  (verificado en `kb/`) o `"media"` (probable: se muestra «por confirmar»). `alt` son otras
  grafías que se aceptan al escribir.
- **dialogue**: `{ title, lines }` con al menos 2 líneas `{ who: "A" | "B", name, m, es }`.
- **exercises**: de 3 a 8, de cuatro tipos:
  - `choice`: `{ q, prompt, promptLang: "m" | "es", answer, options }` (3 o 4 opciones; `answer` está en `options`);
  - `fill`: `{ es, before, after, answer, options }` (el hueco va entre `before` y `after`);
  - `build`: `{ es, m, distractors }` (`m` con al menos 2 palabras; distractores de una palabra que no estén en `m`);
  - `type`: `{ q, prompt, answer, alt? }`.
- **Maya**: solo apóstrofo recto `'` (nunca ’), ortografía de 2014. Sin backticks ni `</script`
  en el archivo.
- La guía de pronunciación (`window.COURSE.guide.alphabet`) se define en `u1.js`.

Antes de agregar una forma, búscala en `kb/`: si está **verificada** va con `conf: "alta"`; si
es **probable**, con `conf: "media"`; si es **dudosa** o **incorrecta**, no la enseñes. Enseñar
una forma incorrecta es peor que omitirla. Una forma nueva necesita su fuente en `kb/` (o en un
`kb/recheckN-*.json` nuevo) y en `sources` de la unidad. No cambies el `id` de una palabra que ya
existe: el avance de repaso de cada persona está guardado con ese `id`.

## Publicar

El sitio se publica con **GitHub Pages** desde la raíz de la rama `gh-pages`, que se mantiene
igual a `main`. Todas las rutas
son relativas, así que funciona en `https://<usuario>.github.io/koox-maaya/` o en cualquier
otra subcarpeta.

1. Regenera el sitio y súbelo:
   ```bash
   node test/validate.cjs && node build.mjs && node build-web.mjs --out . && node export-data.mjs
   git add -A && git commit -m "Actualiza el contenido" && git push
   git push origin main:gh-pages
   ```
2. GitHub Pages se activó solo al crear la rama `gh-pages`. Si prefieres publicar directo desde
   `main`, cámbialo en **Settings → Pages → Build and deployment → Deploy from a branch**,
   rama **main**, carpeta **/ (root)**, y ya no hará falta el segundo `git push`.

A los pocos minutos la app queda en <https://sebastiancanul455.github.io/koox-maaya/>. Los
teléfonos que ya la instalaron reciben la versión nueva la siguiente vez que la abren con
conexión (la app avisa con «Hay una versión nueva»).

La página para claude.ai (`dist/koox-maaya-artifact.html`) se publica aparte, como Artifact.
