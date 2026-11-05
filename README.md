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
>
> **Uso no comercial.** La app incluye audios de voz sintética generados con un modelo de licencia
> CC BY-NC 4.0, así que Ko'ox Maaya y esos audios son de uso no comercial (ver [Audio](#audio)).

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
- **Audio** (v5): 225 audios. 24 sonidos de referencia del Alfabeto Fonético Internacional
  (AFI) en la guía de pronunciación y 201 de **voz sintética aproximada** para palabras, ejemplos
  y diálogos; todavía **0 voces nativas**. Cada botón dice qué tipo de audio es (ver [Audio](#audio)).
- **Para escuchar más**: 36 enlaces verificados a videos, pódcast, radio y sitios en maya, por
  lección y en Perfil → «Escucha maya».
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
grabar.html           estudio de grabación para hablantes (generado por build-web.mjs desde src/web/grabar.html)
icons/                íconos de la app (copiados de src/web/icons)
.nojekyll             para que GitHub Pages sirva los archivos tal cual
src/
  shell.html          plantilla de la página (marcadores /*@@CSS@@*/, /*@@CONTENT@@*/, /*@@APP@@*/)
  app.css             estilos
  app.js              motor: lecciones, ejercicios, repaso, diccionario, progreso
  content/u1.js …     contenido, un archivo por unidad
  content/recursos.js enlaces para escuchar maya (window.COURSE_RESOURCES)
  web/                piezas de la versión web: plantilla del service worker, íconos y grabar.html
audio/                catalogo.json, los MP3 de pronunciación y CREDITOS.md (ver «Audio»)
build-core.mjs        ensamblado común de la página
build.mjs             página única en formato Artifact de claude.ai (dist/)
build-web.mjs         sitio web instalable (PWA)
export-data.mjs       glosario (data/) y hoja de revisión (revision/)
dist/                 koox-maaya-artifact.html: la página para claude.ai, generada
data/                 glosario.json y glosario.csv, generados
revision/             hoja de revisión para hablantes e instrucciones
kb/                   bases de conocimiento con estados y fuentes
test/                 validate.cjs, smoke.cjs, pwa.cjs, grabar.cjs, contenido de muestra y fixtures/ (audios y
                      recursos de prueba)
tools/                utilidades: audio-import.mjs e import-recordings.mjs (importar audio), creditos.mjs
                      (audio/CREDITOS.md), tts-mms.py (voz sintética), commons/ (audios pendientes de
                      Wikimedia Commons) e icons.cjs (los PNG de los íconos)
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
| `node test/grabar.cjs` | Pruebas de la página de grabación (`src/web/grabar.html`) con un micrófono simulado: consentimiento, grabación, ZIP exportado e importación a una copia temporal del repositorio. |
| `node tools/creditos.mjs` | Regenera `audio/CREDITOS.md` (atribución de cada audio) a partir del catálogo. `validate.cjs` avisa si quedó viejo. |
| `node test/pwa.cjs .` | Pruebas de la versión web instalable (manifest, service worker, sin conexión, aviso de versión nueva) sobre el sitio de la raíz; al final corre `smoke.cjs` sobre `index.html`. |
| `node build.mjs --sample` y `node build-web.mjs --sample` | Arman la página y el sitio **de prueba** (`test/sample-build.html` y `site-sample/`) con `test/sample-content.js` y los audios y recursos de `test/fixtures/`. Nunca tocan la raíz ni el catálogo real. Se prueban con `npm run test:sample` (valida, arma y corre `smoke.cjs`) y `npm run test:pwa:sample` (sitio de prueba y `pwa.cjs site-sample`, con audio sin conexión). |

Atajos: `npm run validate`, `npm run build`, `npm run build:web`, `npm run export`, `npm test`
(valida, arma y corre `smoke.cjs` sobre el Artifact) y `npm run test:pwa`.

Después de cambiar el contenido, el orden es: `validate` → `build` y `build:web` → `export` →
pruebas. Haz commit de los archivos regenerados (`index.html`, `sw.js`, `dist/`, `data/`,
`revision/`) junto con el cambio. Si cambias el diseño del ícono en `tools/icons.cjs`, corre
`node tools/icons.cjs` antes de `build-web.mjs` (si se te olvida, `build-web.mjs` se detiene y
lo avisa).

## Audio

La app reproduce la pronunciación de palabras, ejemplos, líneas de diálogo y letras de la guía, y
propone el ejercicio **«Escucha y elige»** cuando hay voz nativa. Sin audio todo funciona igual: no
aparece ningún botón.

**Qué hay (v5).** 225 audios, 2.0 MB en total:

| Tipo (`kind`) | Etiqueta en la app | Audios | De dónde viene | Licencia |
| --- | --- | ---: | --- | --- |
| `fonema` | «Sonido de referencia (AFI)» | 24 | Wikimedia Commons: sonidos del AFI de Peter Isotalo (19), Denelson83 (3) y TFighterPilot (2) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| `sintetico` | «Voz sintética (aproximada)» | 201 | Meta AI, modelo [MMS-TTS para maya yucateco](https://huggingface.co/facebook/mms-tts-yua) (`facebook/mms-tts-yua`), con `tools/tts-mms.py` | [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) (no comercial) |
| `nativo` | «Voz nativa» | 0 | hablantes que graban con `grabar.html`, o grabaciones de Commons | la que elija quien graba: CC BY-SA 4.0, CC BY 4.0 o CC0 |

La voz sintética cubre 154 de las 356 palabras (82 de las 265 palabras sueltas y 72 de las 91
frases), 57 de las 59 líneas de diálogo y 34 de los 44 ejemplos. La guía tiene sonido de referencia
en 20 de sus 27 tarjetas (la de las vocales, con un botón por vocal); no lo tienen las vocales largas,
con tono, glotalizadas y rearticuladas (aa, áa, a', a'a: el AFI no las graba aisladas), ch' y ts'
(pendientes de Commons, ver abajo) ni «c q v z». La atribución completa de cada audio (título, autor,
licencia, página de origen y cambios) está en [`audio/CREDITOS.md`](audio/CREDITOS.md).

**Qué significa cada etiqueta.**

- **Voz nativa**: una persona que habla maya. Es la referencia; cuando existe, la voz sintética de la
  misma palabra nunca aparece.
- **Sonido de referencia (AFI)**: el sonido aislado de una letra, tal como lo describe el Alfabeto
  Fonético Internacional, grabado por colaboradores de Wikimedia Commons (no por hablantes de maya). Solo suena en la guía de
  pronunciación, junto a la letra: nunca en lugar de una palabra. La etiqueta muestra su transcripción
  (p. ej. [kʼ]) y la guía aclara que no es una palabra maya.
- **Voz sintética (aproximada)**: la genera un modelo de inteligencia artificial. Puede equivocarse en el
  tono, el saltillo y las consonantes glotalizadas; su botón tiene borde punteado y, dentro del texto,
  dice «aprox.». La guía y Perfil lo explican, y en Perfil se puede apagar «Usar voz sintética»
  (entonces no se muestra ni suena).

**Licencias y uso no comercial.** Los sonidos del AFI son CC BY-SA 3.0: los MP3 derivados (recortados,
normalizados y convertidos) se publican con la misma licencia y con la atribución de `audio/CREDITOS.md`.
El modelo MMS-TTS tiene licencia CC BY-NC 4.0 y sus audios se etiquetan igual, así que **la app, con sus
audios sintéticos, es de uso no comercial**: no se puede vender ni usar en un producto o servicio
comercial. Para un uso comercial habría que quitar las entradas `sintetico` del catálogo o reemplazarlas
por voces nativas con una licencia que lo permita. Publica solo audio con una licencia que lo permita y
respeta la atribución que pida.

**Cómo se generó y se filtró la voz sintética.** Con [`tools/tts-mms.py`](tools/tts-mms.py)
(reproducible: semillas fijas; su cabecera explica el uso y los requisitos: Python 3.10+, torch,
transformers):

1. Toma cada texto maya del curso (palabras, ejemplos, líneas de diálogo y ejemplos de la guía: 411
   textos únicos, agrupados con la misma normalización con la que la app busca el audio).
2. Convierte la entrada a la ortografía con la que se entrenó el modelo (lecturas bíblicas: «c»/«qu»
   para /k/, «k» para /k'/, «tz», «dz»), porque con la «k» del INALI tiende a decir /k'/. El catálogo
   guarda la ortografía del curso.
3. Sintetiza 4 tomas por texto (semillas 0 a 3; en textos de 1 o 2 palabras, otras 4 a velocidad 0.85).
4. Transcribe cada toma con el reconocedor de voz MMS-1B-all (adaptador yua) y mide el **CER** (tasa de
   error por carácter) contra el texto del curso, sin puntuación, espacios ni acentos de tono, pero
   contando el saltillo.
5. Se queda con la mejor toma y la acepta solo si **CER ≤ 0.25** y, en palabras de hasta 4 letras,
   **CER = 0** (ahí una letra mal suele dar otra palabra). Pasaron 201 de los 411 textos; los demás
   (sobre todo palabras sueltas cortas y con glotalizadas) no tienen audio. Cada entrada guarda su CER
   en `notes`.

Límites: el control no evalúa el tono y evalúa el saltillo y las glotalizadas solo a medias; además,
reconocedor y sintetizador son de Meta y se entrenaron con el mismo tipo de lecturas, así que comparten
sesgos. Un CER bajo no garantiza que un hablante lo entienda: es una aproximación hasta que haya voces
nativas, y conviene que un hablante escuche una muestra.

**Grabar voces nativas.** Un hablante puede grabar desde su celular todo el curso (palabras, ejemplos y
el ejemplo de cada letra) en [`grabar.html`](https://sebastiancanul455.github.io/koox-maaya/grabar.html)
y enviar un ZIP. Quien mantiene la app lo importa con `node tools/import-recordings.mjs <archivo.zip>`
(`--dry-run` para revisar primero; `--help` explica las opciones), que guarda cada grabación como
`nativo` sin tocar los audios sintéticos ni los fonemas. Las instrucciones para quien graba y para quien
importa están en [`revision/README.md` → «Grabar la pronunciación»](revision/README.md#grabar-la-pronunciación)
(se prueba con `node test/grabar.cjs`). Para un audio suelto (de otra fuente con licencia libre):
`node tools/audio-import.mjs --in <archivo> --key <key> --kind nativo --text <texto> --license <licencia>
--author <autor> --source <origen> [--vocab <id>] [--letters <letra>]` (`--help` da todas las opciones).
Después de importar: `node tools/creditos.mjs`, `node test/validate.cjs`, `node build.mjs` y
`node build-web.mjs --out .`.

**Audios pendientes de Wikimedia Commons.** Seis audios ya elegidos y con licencia comprobada no se
pudieron bajar porque `upload.wikimedia.org` respondía 429 (demasiadas peticiones): los sonidos de
referencia de ch' [tʃʼ] y ts' [tsʼ] (CC BY-SA 3.0) y cuatro grabaciones de hablantes nativos:
*maayat'aan* y *tsíimin k'áak'* (Aaron Tamay), *Te' k'óom* (Aluxano), ambas CC BY-SA 4.0, y *p'uurux*
(Lorenzo Itzá, CC0). No se incluyó ninguno sin verificar. Para terminarlos cuando Wikimedia lo permita
(desde la raíz del repositorio; mejor desde otra red si el límite sigue):

```bash
python3 -I tools/commons/fetch-pendientes.py --importar
node tools/creditos.mjs && node test/validate.cjs && node build.mjs && node build-web.mjs --out .
```

El script lee `tools/commons/commons-spec-pendientes.json` (metadatos de cada audio) y
`tools/commons/sha1-map.json` (SHA-1, tamaño y URL que publica Commons), baja cada archivo a
`tools/commons/descargas/` (ignorada por git) con un solo intento y 5 s entre peticiones, se detiene en el
primer 429, **guarda solo lo que coincide con el SHA-1 de Commons** y, con `--importar`, lo importa con
`tools/audio-import.mjs`. Es reanudable y `--solo <key,key>` baja solo algunos. Sin `--importar` solo
baja y verifica.

**Dónde suena.** El motor busca el audio de una palabra por su id (`vocab`) o por su forma maya, el de una
letra por `letters`, y el de cualquier texto maya (ejemplos, líneas de diálogo, tarjetas) por su forma
normalizada (minúsculas, apóstrofo recto, sin signos), sin importar el orden del catálogo ni la key:

- **Palabras, ejemplos, diálogos y tarjetas:** nativo > sintético. Por texto nunca se ofrece un fonema
  (así los posesivos «a», «u» y «k» de la unidad 3 no suenan con el sonido aislado de la vocal o la
  consonante); por id (`vocab`) el orden es nativo > fonema > sintético, pero los fonemas no ilustran
  palabras.
- **Letras de la guía:** el botón de la letra suena con su **sonido de referencia**; solo si no hay, con
  una grabación nativa de la letra (y la tarjeta dice qué palabra se oye). Junto al ejemplo suena la
  palabra (nativa si la hay, si no sintética), y las grabaciones nativas de la letra que dicen otra
  palabra aparecen debajo, «Voz nativa: …», cada una con su palabra: nunca reemplazan al sonido de
  referencia. Una tarjeta que agrupa varias letras (como «a e i o u») tiene un botón por cada letra con
  audio.

«Escucha y elige» usa **solo voces nativas** (1 o 2 por lección y hasta 2 por repaso), así que mientras
no haya grabaciones de hablantes no aparece. En Perfil se puede apagar la reproducción automática y
elegir la velocidad lenta (0.75, sin cambiar el tono).

**Contrato.** `audio/catalogo.json` es la fuente de verdad: `{ "version": 1, "entries": [ … ] }`, y cada
entrada apunta a `audio/<key>.mp3` (MP3 mono, 44.1 kHz, 64 kbps; `key` en `[a-z0-9-]+`). Campos: `key`,
`file`, `kind` (`nativo`, `fonema` o `sintetico`), `text` (lo que se oye), `lang` (`yua` o `und`), `ipa`,
`vocab` (ids de palabras), `letters` (letras de la guía, tal como aparecen en la tarjeta: «a e i o u»,
«k'»), `speaker`, `region`, `author`, `license`, `licenseUrl`, `source`, `title`, `durationMs` y
`notes`. No se editan los MP3 ni el catálogo a mano: `tools/audio-import.mjs` recorta silencios,
normaliza el volumen, convierte al formato del contrato y actualiza el catálogo. `node test/validate.cjs`
revisa que las keys no se repitan, que cada archivo exista y sea un MP3 mono de 44.1 kHz, que `vocab` y
`letters` existan en el curso, que haya autor, licencia y fuente y que todo audio `sintetico` diga en
`notes` que es aproximado; también avisa si `audio/CREDITOS.md` no está al día con el catálogo.

**Límites del Artifact.** La página de claude.ai no puede pedir archivos a otro sitio, así que
`node build.mjs` incrusta cada audio como `data:audio/mpeg;base64` hasta **6 MB** (lo que el audio agrega
a la página; se cambia con `--audio-limit <MB>`, máximo 15). Hoy cabe todo: los 225 audios ocupan
2.64 MB incrustados. Si no cupiera, entran primero los sonidos de referencia, luego las voces nativas y
al final las sintéticas (las de palabras que ya tienen voz nativa, al último), y la consola dice cuáles
quedaron fuera (siguen en el sitio web). En el sitio, el service worker guarda cada audio al escucharlo
y, si todo el audio suma 8 MB o menos (hoy, 2.0 MB), lo descarga al instalar (de 6 en 6) para que
funcione sin conexión.

**Créditos en la app.** Perfil → «Créditos de audio» muestra autor, hablante, licencia (con enlace) y
fuente de cada audio, agrupados por autor y licencia, con un enlace a `audio/CREDITOS.md`; las voces
sintéticas van en una sola entrada (modelo, licencia y número de audios). `audio/CREDITOS.md` lo genera
`node tools/creditos.mjs` a partir del catálogo.

**Para escuchar más.** `src/content/recursos.js` agrega a `window.COURSE_RESOURCES` 36 enlaces externos
verificados (videos, pódcast, radio, sitios) con `id`, `title`, `url` (https), `kind`, `source`, `lang`,
`units`, `lessons` (opcional), `credibility` y `note`. La hoja de cada lección muestra los de esa
lección (o los de su unidad) y Perfil → «Escucha maya», todos. En el sitio web, si existe
`src/web/grabar.html`, `build-web.mjs` lo publica como `grabar.html` y Perfil invita a los hablantes a
grabar.

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
   node tools/creditos.mjs && node test/validate.cjs && node build.mjs && node build-web.mjs --out . && node export-data.mjs
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
