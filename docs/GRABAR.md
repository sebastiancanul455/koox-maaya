# Cómo grabar a un hablante mayor con ayuda de un familiar

Guía práctica para una sesión con [`grabar.html`](https://sebastiancanul455.github.io/koox-maaya/grabar.html)
en **modo acompañado**: la persona mayor habla y un familiar maneja el celular. Lo que ella decide manda
sobre todo lo demás: puede cambiar de opinión, parar o pedir que se retire su voz cuando quiera
(términos: [`PERMISO-VOCES.md`](PERMISO-VOCES.md)).

## Antes de empezar

1. **Pregúntale con calma** si quiere grabar y cuándo. Que sepa para qué es: para que quien aprende maya
   escuche una voz de verdad. No hay prisa ni obligación.
2. **Platiquen los permisos con palabras sencillas**, uno por uno, antes de tocar nada. La página los
   trae en este orden:
   - ¿Está de acuerdo en que sus grabaciones se publiquen en la app Ko'ox Maaya? (lo único obligatorio)
   - ¿Con qué permiso? La opción de arriba, «Solo para Ko'ox Maaya», las deja solo en la app y en su
     repositorio. Las otras son licencias abiertas: cualquiera podría usarlas.
   - ¿Autoriza que sirvan para entrenar o evaluar modelos de IA del proyecto? Puede decir que no (así
     empieza la casilla).
   - ¿Quiere salir con su nombre, con un seudónimo o sin nombre?
   - ¿De qué pueblo o comunidad es su maya? **Anótenlo**: sirve para saber de qué región es cada variante.
   - Puede pedir que se retire su voz cuando quiera.
3. **Marquen solo lo que ella decida**, aunque tarden. Nada «por si acaso».
4. Aparte, para la familia: fecha, nombre completo y pueblo.

## Equipo y lugar

- **Micrófono de solapa** prendido al pecho, a 15–20 cm de la boca. Sin micrófono, el celular a un palmo
  (20 cm), sin taparlo con la mano. La barra de la página se mueve cuando oye; si dice «se oye bajita»,
  acerquen un poco.
- Abran la página **con internet** y la primera vez toquen **Permitir** al pedir el micrófono. Luego
  pongan el celular en **modo avión** (sin llamadas ni avisos) y quítenlo al final para enviar.
- Un **cuarto con telas**: cortinas, cobijas, sillón, ropa colgada. Evitar azulejo y cuartos vacíos.
- **Sin ventilador, TV ni radio**, sin refri ni calle cerca. Cierren ventanas y puertas, y que nadie
  platique cerca.
- **20 s de silencio al inicio**: con la grabadora del celular, todos callados, para guardar el sonido del
  cuarto (sirve para limpiar el audio después). Guárdenlo con los originales.

## La sesión (20 a 40 minutos, con pausas)

1. En el paso 1 activen **«Alguien me ayuda (modo acompañado)»**, marquen los permisos y toquen
   **Empezar a grabar**.
2. Cada 10 minutos la página sugiere **«¿Descansamos un momento?»**. Háganlo: agua, platicar, descansar
   la voz. Si se cansa, paren; otro día se sigue (queda guardado en ese celular).
3. **Orden**: empiecen por los **sonidos de la unidad 1** y los **pares mínimos** (kaan / ka'an, iik / iik',
   vocal corta y larga, con tono alto y bajo); después las unidades 2 y 3. La página ya sigue el orden del
   curso y deja primero lo pendiente. (kan está en la unidad 4: para decir el trío kan / kaan / ka'an
   seguido, apaguen un momento el modo acompañado y búsquenlo en la lista).
4. **No lo hagan leer.** La pantalla le muestra a quien ayuda el significado en español y esconde la
   palabra maya. Pídanla con **objetos, imágenes o situaciones**: señalar el fuego, enseñar la foto de un
   gato, «¿qué le dice a alguien que llega a su casa?». Toquen **Grabar**, déjenlo hablar y toquen
   **Detener**.
5. **2 o 3 tomas** si hace falta (ruido, tos, interrupción): **Escuchar** y **Repetir toma**. La nueva
   reemplaza a la anterior.
6. **Dejen que lo diga a su manera.** Si dice otra forma que la del curso, **no la corrijan**: escríbanla
   como la oyeron en **«El hablante dijo otra forma»**. Con **«Ver cómo está en el curso»** comparan
   después de grabar. Las variantes son un tesoro: se revisan con él o ella más adelante.
7. Si no la recuerda o no la usa: **Saltar**. Nada es obligatorio.
8. Al terminar, **Terminar y exportar** y revisen juntos lo que se envía (licencia, IA, crédito).

## Después

1. **Crear y descargar el archivo** (ZIP). Hagan una **copia completa de los originales para la familia**
   (el ZIP entero y el audio de silencio) en un USB o en el Drive familiar.
2. Manden el ZIP **en privado** a quien mantiene la app (WhatsApp o Drive): trae el nombre y el pueblo.
3. Quien mantiene la app, desde la raíz del repositorio y con `ffmpeg` instalado:
   ```bash
   node tools/import-recordings.mjs archivo.zip --dry-run   # revisa: omitidas, errores y variantes
   node tools/import-recordings.mjs archivo.zip             # importa
   ```
   Escuchen algunos `audio/*.mp3`. Las variantes quedan como `<key>-var`, «pendiente de revisión».
4. Validar y construir (y hacer *commit*):
   ```bash
   node tools/creditos.mjs && node test/validate.cjs && node build.mjs && node build-web.mjs --out .
   ```
5. **Enséñenle cómo quedó**: oír su voz en la app es el mejor agradecimiento. Si pide retirarla, ver el
   último paso de [`revision/README.md`](../revision/README.md#grabar-la-pronunciación).
