/* Ko'ox Maaya · Lecturas de otras fuentes (cuentos y textos), para leer en maya con apoyo.
   Regla de oro: NO se inventa maya. Una lectura se agrega aquí solo después de que un hablante la revise,
   y siempre con su fuente, su licencia y su crédito. Los diálogos del curso ya salen solos en
   Inicio → Lecturas (no hay que copiarlos aquí).

   Formato (lo lee src/modules/lecturas.js; un texto sin id, título, fuente con nombre o líneas con
   m y es se descarta):
     window.COURSE_READINGS.push({
       id: "nombre-corto",                  // a-z, 0-9 y guiones, único (no empieza con «dlg-»)
       title: "Título de la lectura",
       source: { name: "Obra o colección", url: "https://…", license: "CC BY 4.0", credit: "Autor/a · revisó: hablante" },
       pages: [ { lines: [ { m: "texto en maya", es: "traducción al español", who: "A", name: "Nombre" } ] } ]
     });
   «who» ("A" o "B") y «name» son opcionales: con «who» la línea es un diálogo (burbuja a la izquierda o a
   la derecha); sin «who» es un párrafo. Si el catálogo de audio tiene un audio con el mismo texto de una
   línea, la línea se puede escuchar; si no, se lee en silencio. Cada palabra se empareja con el
   vocabulario del curso para mostrar su significado; las que no están en el curso se dicen sin glosa.
   Sin backticks ni la etiqueta de cierre de script. */
window.COURSE_READINGS = window.COURSE_READINGS || [];
