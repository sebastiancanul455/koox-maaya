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
