# Permiso «Solo para Ko'ox Maaya»

Este es el permiso que da una persona que graba su voz para Ko'ox Maaya cuando elige la opción
**«Solo para Ko'ox Maaya (no es licencia abierta)»** en [`grabar.html`](https://sebastiancanul455.github.io/koox-maaya/grabar.html).
**No es una licencia Creative Commons**: es un permiso limitado, más cerrado que las licencias abiertas
(CC BY-SA 4.0, CC BY 4.0 y CC0 1.0), que son las otras opciones de esa página.

## Qué permite

- Publicar las grabaciones **dentro de la app** Ko'ox Maaya y **en su repositorio**
  (<https://github.com/sebastiancanul455/koox-maaya>), para que quien aprende maya escuche cómo se dice
  cada palabra, frase o letra.
- Hacerlo con el **crédito que la persona eligió**: su nombre, un seudónimo o ninguno (aparece
  «Hablante anónimo»), y su comunidad o pueblo si lo dio.
- Hacer cambios técnicos al audio: recortar el silencio, igualar el volumen y convertirlo a MP3. No se
  altera su voz.

## Qué no permite

- **Ningún otro uso sin otro permiso de la persona.** No se venden, no se usan en otras apps, sitios o
  proyectos, no se usan en publicidad y no se redistribuyen por separado.
- **Inteligencia artificial: solo si la persona lo autorizó.** Usar las grabaciones para entrenar o evaluar
  modelos de IA del proyecto requiere que haya marcado la casilla «Autorizo usar mis grabaciones para
  entrenar o evaluar modelos de IA del proyecto» (`aiUse` en `grabaciones.json`). Si no la marcó, no se
  usan para eso. Si la marcó, vale solo para modelos del proyecto.

## Retiro

La persona puede pedir **en cualquier momento** que se retire su voz, sin dar razones. Basta con avisar a
quien la invitó a grabar o a quien mantiene Ko'ox Maaya. Desde ese momento sus audios se borran del
catálogo y del repositorio y se dejan de publicar en las versiones nuevas de la app. Lo que alguien ya
haya descargado o copiado antes no se puede recoger.

## Los originales

La copia completa de las grabaciones originales queda **con la persona o su familia**. El proyecto solo
publica la versión recortada de cada audio.

## Dónde queda registrado

En `audio/catalogo.json`, cada audio dice en `notes` el crédito elegido y si se autorizó el uso para IA
(por ejemplo: «Uso para IA del proyecto: no autorizado.»). La atribución de cada audio está en
[`audio/CREDITOS.md`](../audio/CREDITOS.md).

Este permiso es un acuerdo de buena fe entre la persona y el proyecto; no sustituye asesoría legal.
Versión 1 (noviembre de 2026).
