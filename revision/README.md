# Revisión por hablantes de maya yucateco

Esta carpeta tiene la **hoja de revisión** del vocabulario de Ko'ox Maaya, una app para aprender
maya yucateco desde el español. El contenido se preparó con ayuda de inteligencia artificial y se
cotejó con diccionarios, cursos y gramáticas publicados, pero nadie que hable maya lo ha revisado
todavía. Esa revisión es lo que puede confirmarlo.

| Archivo | Para qué sirve |
| --- | --- |
| `hoja-revision.html` | La hoja para leer y llenar en el celular, o para imprimir. |
| `hoja-revision.csv` | La misma hoja para Excel, Hojas de cálculo de Google o LibreOffice. |

Las dos tienen las mismas palabras en el mismo orden: primero las **por confirmar** (confianza
media), que son las que más necesitan revisión, y después las de confianza alta, ordenadas por
unidad y lección. Las genera `node export-data.mjs`; no las edites a mano.

---

## Para la persona que revisa

Muchas gracias por ayudar. No hace falta revisar todo: unas cuantas palabras ya sirven mucho.
Empiece por la sección **«Por confirmar»**.

### Qué revisar en cada palabra

1. **La forma.** ¿Así se dice y así se escribe? La hoja usa las normas de escritura de 2014:
   apóstrofo para el corte de voz (*ja'*), vocal doble para la vocal larga (*kaan*) y acento para
   el tono alto (*yáax*). Si usted lo escribe de otra manera, no se preocupe: anote cómo lo dice.
2. **El significado.** ¿La palabra significa lo que dice la columna «Español»? ¿Le falta o le
   sobra algún significado?
3. **Si suena natural.** Si hay ejemplo, ¿así lo diría la gente? ¿O suena raro, anticuado o
   como traducido?
4. **Variantes de su región.** ¿En su pueblo se dice de otra forma? Anótela, aunque la de la hoja
   también sea correcta.

Algunas palabras traen *(también: …)*: son otras formas de escribirla que la app acepta. Si alguna
de ellas está mal, dígalo en «Comentario».

### Cómo marcar

| Columna | Qué poner |
| --- | --- |
| **¿Es correcto? (sí/no)** | **sí** si todo está bien; **no** si algo está mal. Si no está seguro, déjela en blanco. |
| **Corrección** | Si marcó **no**: la forma como usted la diría (y el significado correcto, si era eso lo que estaba mal). |
| **Comentario** | Variantes de su región, otro significado, en qué situación se usa, o cualquier duda. |

No cambie las columnas `id`, `maya` ni `español`: el `id` sirve para encontrar la palabra en la
app.

### Tres maneras de llenarla

- **En papel.** Abra `hoja-revision.html` y elija Imprimir (sale en hojas horizontales con
  casillas en blanco). Marque con pluma. Al terminar, tome una foto clara de cada hoja.
- **En el celular.** Abra `hoja-revision.html` en el navegador (Chrome, por ejemplo). Toque las
  casillas **sí** / **no** y escriba en los recuadros. Lo que escribe se guarda en ese teléfono
  aunque cierre la página. Al terminar, toque **Descargar respuestas** (o **Compartir
  respuestas**, si aparece) y envíe el archivo que se descarga.
- **En la computadora.** Abra `hoja-revision.csv` con Excel, Hojas de cálculo de Google o
  LibreOffice y llene las tres últimas columnas. Guárdelo como CSV (UTF-8) o como libro de Excel.
  Si Excel muestra todo en una sola columna, use *Datos → Desde texto/CSV* y elija la coma como
  separador.

Arriba de la hoja hay un espacio para la **región o comunidad** donde aprendió el maya y la
**fecha**. Ayuda mucho saber la región, porque el maya cambia de un lugar a otro. No hace falta
poner su nombre.

### Cómo devolverla

Envíe el archivo (o las fotos) a la persona que le pidió la revisión, por el medio que hayan
acordado: correo, WhatsApp o en persona. Si le quedó a medias, envíe lo que tenga.

---

## Para quien mantiene la app: cómo aplicar las correcciones

1. **Guarda las respuestas** en `revision/respuestas/`, que está en `.gitignore`. Pueden traer
   datos de la persona que revisó: no las publiques sin su permiso. Ojo: `node export-data.mjs`
   vuelve a escribir `hoja-revision.csv` y `hoja-revision.html`, así que no guardes respuestas
   encima de esos archivos.
2. **Filtra** las filas con **no**, con texto en «Corrección» o con un «Comentario». El
   archivo que descarga la hoja del celular trae al final una fila «(datos de la revisión)» con
   la región y la fecha.
3. **Busca la palabra** por su `id` en `src/content/uN.js` (N es el número del `id`: `u7-…` está
   en `u7.js`).
4. **Corrige** `m`, `es`, `pr`, `note`, `ex` o `alt`. Reglas:
   - **No cambies el `id`**: el avance de repaso de cada persona está guardado con ese `id`.
   - Usa la ortografía de 2014 y el apóstrofo recto `'`. Las respuestas escritas en el celular
     suelen traer el apóstrofo curvo `’`: cámbialo, o `validate.cjs` marcará error.
   - Si cambias o quitas una forma, búscala en todo `src/content/` (`grep -rn "forma" src/content`):
     también aparece en ejercicios (`choice`, `fill`, `build`, `type`), diálogos y tarjetas.
   - Si quien revisa dice que una forma está mal y no hay una corrección segura, **quítala** o
     déjala como `conf: "media"` con una nota. Enseñar una forma incorrecta es peor que omitirla.
   - Una variante regional va en `note` («En el oriente también se dice …»). Solo va en `alt`
     si es una grafía que la app debe aceptar como respuesta correcta.
   - Para subir una palabra de `conf: "media"` a `"alta"`, que la confirmación sea sólida: dos
     hablantes de acuerdo, o un hablante más una fuente publicada.
5. **Registra la evidencia** en `kb/`, por ejemplo en un archivo nuevo
   `kb/recheck4-hablantes.json` con la misma forma que los `recheck-*.json` y `recheck3-*.json`
   (`items: [{ m, es, status, kbStatusBefore, variants, correction, pr, sources, evidence }]`).
   Como fuente pon algo como `{ "title": "Revisión de hablante nativo (región, fecha)" }`, sin
   nombres ni datos de contacto salvo que la persona lo autorice. `export-data.mjs` lee
   cualquier `kb/recheckN-*.json` y, si dos pasadas no coinciden, manda la de número más alto
   (por eso el `4`: la revisión de hablantes queda por encima de las pasadas anteriores). Esa
   fuente aparecerá en el glosario.
6. **Comprueba y vuelve a generar**:
   ```bash
   node test/validate.cjs        # el contenido cumple el contrato
   node build.mjs                # página para claude.ai (dist/koox-maaya-artifact.html)
   node build-web.mjs --out .    # sitio instalable, en la raíz del repositorio
   node export-data.mjs          # glosario y hoja de revisión nuevos
   node test/smoke.cjs dist/koox-maaya-artifact.html
   node test/pwa.cjs .
   ```
   `node export-data.mjs --detalle` lista las palabras que no tienen respaldo en `kb/`.
7. Haz *commit* y publica el sitio (ver «Publicar» en el README principal).

---

## Grabar la pronunciación

Además de revisar cómo se escribe, un hablante de maya puede **grabar cómo se dice** cada palabra,
cada frase de ejemplo y el ejemplo de cada letra de la guía, desde el navegador de su celular. Así
quienes aprenden con la app escuchan una voz real en lugar de la voz sintética. La página no envía
nada a ningún servidor: las grabaciones se quedan en el teléfono hasta que la persona crea el
archivo y decide a quién mandarlo.

Para grabar a una persona mayor con ayuda de un familiar (equipo, sesión, permisos y qué hacer
después) hay una guía aparte: [`docs/GRABAR.md`](../docs/GRABAR.md). Los términos del permiso
«Solo para Ko'ox Maaya» están en [`docs/PERMISO-VOCES.md`](../docs/PERMISO-VOCES.md).

### Para la persona que graba

1. Abra <https://sebastiancanul455.github.io/koox-maaya/grabar.html> en **Chrome** de Android.
2. Lea la presentación. Si una persona va a hablar y otra maneja el celular, active **«Alguien me ayuda
   (modo acompañado)»** (más abajo).
3. Decida sus **permisos**. Son de quien graba: si alguien ayuda, léanlos juntos y marquen solo lo que
   decida quien graba.
   1. **Publicar** (obligatorio): la casilla «Acepto que mis grabaciones se publiquen en la app Ko'ox
      Maaya, con la licencia y el crédito que elijo en este formulario». Sin ella no se puede grabar.
   2. **Licencia**: «Solo para Ko'ox Maaya (no es licencia abierta)» viene elegida; las grabaciones se
      usan solo dentro de la app y de su repositorio, con el crédito elegido. Las otras son licencias
      abiertas: CC BY-SA 4.0 (cualquiera puede usarlas si da crédito y comparte igual), CC BY 4.0 (si da
      crédito) y CC0 1.0 (dominio público).
   3. **IA** (opcional, empieza sin marcar): «Autorizo usar mis grabaciones para entrenar o evaluar
      modelos de IA del proyecto».
   4. **Cómo aparecer**: con su nombre, con un seudónimo o sin nombre («Hablante anónimo»), y su
      **comunidad o pueblo** (opcional; sirve para etiquetar la variante regional). Con nombre o
      seudónimo hay que escribirlo.
   5. Puede **pedir que se retire su voz** cuando quiera.
4. Toque **Empezar a grabar**. La primera vez Chrome pregunta si la página puede usar el micrófono:
   toque **Permitir**. Si lo negó por error: toque el candado junto a la dirección → Permisos →
   Micrófono → Permitir.
5. Toque una palabra de la lista y luego **Grabar**. Espere un instante, diga la palabra **una sola
   vez**, con naturalidad, **como se dice en su comunidad**, y toque **Detener** (a los 6 segundos se
   detiene sola). Toque **Escuchar**; si no quedó bien, **Otra vez**. Luego **Siguiente**. Si no
   conoce una palabra, **Saltar**.
   - Busque un lugar silencioso (sin ventilador, tele ni radio) y sostenga el celular a un palmo de
     la boca.
   - Arriba de la lista puede elegir la unidad o las letras, y ver lo que falta («Por grabar»), lo
     ya grabado o todo. Lo que ya tiene la voz de otro hablante aparece como «Ya tiene audio»; puede
     grabar su versión de todos modos.
   - Cada palabra toma unos 10 segundos; una unidad, de 5 a 10 minutos. No hace falta grabar todo:
     puede parar y seguir otro día, lo grabado queda guardado **en ese teléfono y ese navegador**
     (no borre los datos del navegador mientras tanto; en una ventana de incógnito no se guarda).
6. Para enviar, toque **3 · Enviar** → **Crear y descargar el archivo**. Se descarga un ZIP a la
   carpeta Descargas. Si aparece **Compartir**, puede mandarlo directo; si no, envíelo desde
   WhatsApp (clip → Documento → el archivo de Descargas), por correo (si pesa menos de 20 MB) o
   súbalo a Google Drive y comparta el enlace. La próxima vez marque «Solo las nuevas desde el
   último envío».
7. Para borrar todo del teléfono: **Enviar** → **Borrar todo…** → **Sí, borrar todo**. Lo que ya
   envió no se borra.

**Modo acompañado.** Pensado para una persona que no lee la pantalla (por ejemplo, un abuelo con un
familiar que maneja el celular). Quien ayuda ve, de un elemento a la vez, el **significado en español**
(y el ejemplo en español); la palabra maya del curso queda **oculta** hasta después de grabar
(«Ver cómo está en el curso»). Va primero lo pendiente, en el orden del curso (unidad 1 en adelante; lo
que solo tiene voz sintética sigue pendiente). Hay un botón grande de **Grabar / Detener**, y después
**Escuchar**, **Repetir toma** y **Siguiente**; **Saltar** deja el elemento para el final. El campo
**«El hablante dijo otra forma»** guarda lo que dijo distinto del curso (`variant`). Cada ~10 minutos
aparece «¿Descansamos un momento?» (no bloquea). Arriba se ve el avance («12 de 80») y **Terminar y
exportar** lleva al envío. Se puede salir del modo en cualquier momento.

El ZIP trae `grabaciones.json` (los permisos: `license`, `aiUse`, `credit` —«nombre», «seudónimo» o
«anónimo»—, `speaker` y `region`; el consentimiento; y la lista de lo grabado, con la `variant` de cada
elemento si el hablante dijo otra forma), `LEEME.txt` y una carpeta `wav/` con los audios (WAV mono,
16 bits, 44.1 kHz, sin silencios largos).

### Para quien mantiene la app: importar las grabaciones

1. **Guarda el ZIP en privado** (por ejemplo en `revision/respuestas/`, que está en `.gitignore`):
   trae el nombre y la comunidad de la persona. No lo publiques; consérvalo como constancia del
   consentimiento.
2. **Revisa** sin escribir nada:
   ```bash
   node tools/import-recordings.mjs archivo.zip --dry-run
   ```
3. **Importa**:
   ```bash
   node tools/import-recordings.mjs archivo.zip
   ```
   Necesita `ffmpeg` y `ffprobe`. El importador rechaza el ZIP si falta el consentimiento, si la
   licencia no es «Solo para Ko'ox Maaya», CC BY-SA 4.0, CC BY 4.0 o CC0 1.0, si `aiUse` no es
   verdadero o falso, si `credit` no es válido o si trae rutas peligrosas. Cada elemento entra
   como `kind: "nativo"` con la key `v-<id>` (palabra, `vocab: [id]`), `ex-<id>` (frase de ejemplo; sin
   `vocab`, la app la encuentra por su texto) o `l-<letra>` (ejemplo de una letra, `letters: [letra]`;
   «ch'» → `l-ch-saltillo`). El crédito es el nombre o seudónimo que dio la persona (o «Hablante
   anónimo»; con `credit: "anónimo"` no se usa ningún nombre), la fuente es «Grabación para Ko'ox Maaya,
   <fecha>» y se guardan su comunidad y su licencia. El crédito elegido y el uso para IA quedan en
   `notes` («Crédito elegido: seudónimo. Uso para IA del proyecto: no autorizado.»); si no marcó la
   casilla de IA, las grabaciones no se usan para entrenar ni evaluar modelos. Cada audio
   se recorta, se normaliza (~-18 LUFS, pico -1.5 dB), lleva 60 ms de silencio a cada lado y se
   guarda como `audio/<key>.mp3` (MP3 mono, 44.1 kHz, 64 kbps).
   - Si ya hay una grabación nativa **de otra persona** en esa key, se omite: `--replace` la
     reemplaza y `--alternate` guarda la nueva al lado (`<key>-2`). Reimportar el ZIP de la misma
     persona actualiza sus entradas.
   - Las **voces sintéticas** y los fonemas nunca se borran ni se reemplazan: si ocupan la key, la
     grabación nativa se guarda al lado (`<key>-2`) y la app prefiere la voz nativa.
   - Si el curso cambió desde que se grabó (otra forma, otro ejemplo, id que ya no existe), el
     elemento se omite; `--force` lo importa igual.
   - Si un elemento trae **`variant`** (el hablante dijo otra forma que la del curso), el audio se
     importa como `<key>-var` (p. ej. `v-u1-kaan-var`), con `vocab` y `letters` vacíos, el texto de la
     variante y notes «El hablante dijo «X» en lugar de «Y» (forma del curso). Pendiente de revisión.»:
     así la app no reproduce un audio que no coincide con la forma del curso. El resumen cuenta y lista
     las variantes (y avisa si una coincide con otra forma del curso); `node test/validate.cjs` avisa que
     no sonarán, que es lo esperado. Revísalas con el hablante o con alguien de su comunidad antes de
     usarlas (por ejemplo, para corregir el curso o para anotar la forma regional).
4. **Escucha** algunos `audio/<key>.mp3` antes de publicar.
5. **Valida y regenera**:
   ```bash
   node tools/creditos.mjs && node test/validate.cjs && node build.mjs && node build-web.mjs --out .
   ```
   y haz *commit* de `audio/` junto con los archivos regenerados (ver «Publicar» en el README
   principal).
6. Si la persona pide retirar sus grabaciones (ver [`docs/PERMISO-VOCES.md`](../docs/PERMISO-VOCES.md)),
   borra de `audio/catalogo.json` sus entradas (las que tengan su identificador en `notes`,
   «hablante <id>»; si dio nombre, también las de su `author`) y sus MP3, vuelve a generar y publica. El
   retiro vale desde que se pide: lo que alguien ya descargó antes no se puede recoger.

Para archivos de otras fuentes (un audio suelto o una lista) está `node tools/audio-import.mjs`
(`--help` explica las opciones). La página de grabación se prueba con `node test/grabar.cjs`
(Playwright con micrófono falso; importa a una copia temporal del repositorio, nunca al catálogo real).
