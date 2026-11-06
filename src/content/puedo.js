/* Ko'ox Maaya · Logros «Puedo…»: lo que ya puedes hacer al terminar cada unidad.
   La insignia de una unidad se abre cuando todas sus lecciones están completas y su «Repaso de la unidad»
   se aprueba con 80 % o más (la regla vive en src/modules/logros.js).
   Las unidades nuevas pueden agregar el suyo al final de su propio archivo:
   (window.COURSE_CANDO = window.COURSE_CANDO || {}).u10 = { can: [ {t:"Puedo …", ex:"<vocabId>"}, … ] };
   Cada enunciado tiene que ser verdadero respecto a lo que la unidad enseña de verdad (sus metas y su
   vocabulario): no prometas lo que no está. Si la unidad solo enseña a reconocer, di «reconocer».
     · t: el enunciado, en español claro. Aquí no se escribe maya nuevo.
     · ex (opcional): id de una palabra de ESA unidad, con confianza «alta». La app muestra su forma maya y su
       traducción tal como están en el curso, así que el maya nunca se copia a este archivo.
   test/logros.cjs comprueba que hay 3 enunciados por unidad, que cada ex existe y que nada contradice al curso. */
window.COURSE_CANDO = Object.assign(window.COURSE_CANDO || {}, {
  u1: {
    can: [
      { t: "Puedo reconocer las cinco formas de cada vocal y distinguir palabras que solo cambian en la vocal.", ex: "u1-chich" },
      { t: "Puedo pronunciar la x, la j y la ts, y distinguir las consonantes glotalizadas, las que se dicen con un golpe de garganta.", ex: "u1-paak" },
      { t: "Puedo nombrar en maya el agua, el sol, el cielo, la tierra y el fuego.", ex: "u1-ja" }
    ]
  },
  u2: {
    can: [
      { t: "Puedo saludar a cualquier hora, contestar un saludo y devolver la pregunta.", ex: "u2-bix-a-beel" },
      { t: "Puedo decir mi nombre, preguntar el de otra persona y decir de dónde soy.", ex: "u2-in-kaabae" },
      { t: "Puedo dar las gracias, pedir permiso y despedirme deseando buen camino.", ex: "u2-dios-bootik" }
    ]
  },
  u3: {
    can: [
      { t: "Puedo usar los pronombres para decir yo, tú, él, nosotros, ustedes y ellos.", ex: "u3-teech" },
      { t: "Puedo decir «mi», «tu» y «su» delante de una palabra, como en «mi casa» o «tu nombre».", ex: "u3-in-wotoch" },
      { t: "Puedo nombrar a mi familia y a mis hermanos, y decir que algo hay o no hay.", ex: "u3-na" }
    ]
  },
  u4: {
    can: [
      { t: "Puedo contar del 1 al 10 en maya.", ex: "u4-lajun" },
      { t: "Puedo contar del 11 al 20 y entender cómo cuenta el maya de veinte en veinte.", ex: "u4-kaal" },
      { t: "Puedo contar cosas, personas y plantas con la palabra que le toca a cada una, y preguntar cuántos hay.", ex: "u4-jaypeel" }
    ]
  },
  u5: {
    can: [
      { t: "Puedo decir lo que hago normalmente, como ir, comer, trabajar o estudiar, para mí y para otras personas.", ex: "u5-meyaj" },
      { t: "Puedo preguntar qué, quién, dónde, cómo y por qué, y hacer preguntas de sí o no.", ex: "u5-tuux-ka-bin" },
      { t: "Puedo decir que no entiendo, pedir calma y que me repitan, y contar que estoy aprendiendo maya.", ex: "u5-ma-tin-naatik" }
    ]
  },
  u6: {
    can: [
      { t: "Puedo nombrar los alimentos básicos de la cocina yucateca y los animales de la granja.", ex: "u6-ixiim" },
      { t: "Puedo decir que tengo hambre o sed, que ya comí, invitar a comer y describir sabores.", ex: "u6-wiijen" },
      { t: "Puedo preguntar si hay algo en el mercado, pedir fruta, preguntar el precio y agradecer al despedirme.", ex: "u6-bajux-u-tojol" }
    ]
  },
  u7: {
    can: [
      { t: "Puedo nombrar partes del cuerpo y decir «mi mano» o «mi cabeza».", ex: "u7-kab" },
      { t: "Puedo decir que estoy enfermo o enferma, preguntar si alguien lo está y decir qué me duele.", ex: "u7-kojaanen" },
      { t: "Puedo nombrar la fiebre, la tos y otros síntomas, y recibir a alguien con respeto: que pase y se siente.", ex: "u7-chokwil" }
    ]
  },
  u8: {
    can: [
      { t: "Puedo nombrar animales de la casa, del campo, del agua y del monte.", ex: "u8-baalam" },
      { t: "Puedo decir los colores básicos y si algo está aquí, lejos, encima o adelante.", ex: "u8-chak" },
      { t: "Puedo nombrar el monte, el cenote y la milpa, los cuatro rumbos, la luna y las cuevas.", ex: "u8-tsonoot" }
    ]
  },
  u9: {
    can: [
      { t: "Puedo decir hoy, mañana, ayer y ahora para ubicar una acción en el tiempo.", ex: "u9-bejlae" },
      { t: "Puedo reconocer cómo se dice que algo ya pasó, que acabo de hacerlo, que tengo que hacerlo o que lo haré.", ex: "u9-binen" },
      { t: "Puedo reconocer palabras de los días de muertos, los relatos y la música, y despedir a una visita con las fórmulas tradicionales.", ex: "u9-janal-pixan" }
    ]
  }
});
