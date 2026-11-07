/* Ko'ox Maaya · Historias de «elige qué decir»: conversaciones cortas para practicar por gusto.
   Regla de oro: NO se inventa maya. Cada línea maya (lo que dicen los personajes y cada opción) es una cadena que
   YA existe en el curso (vocabulario «m», ejemplo «ex.m» o línea de un diálogo de src/content/u*.js), copiada
   tal cual, con sus mayúsculas y signos. test/historias.cjs falla si alguna no aparece exactamente en el curso.
   El español (narración, traducciones, pistas y retroalimentación) sí se escribe aquí.

   Formato (lo lee src/modules/historias.js; una historia sin id, título, start o nodos válidos se descarta):
     {
       id: "nombre-corto",            // a-z, 0-9 y guiones, único
       title: "Título en español",
       unit: 6,                       // unidad mínima recomendada (la más alta de la que salen sus líneas)
       intro: "Una o dos frases para la lista.",
       start: "inicio",               // id del primer paso
       outro: "Cierre en español que se muestra en el resumen.",
       nodes: {
         inicio: {
           text: "Narración en español (opcional).",
           lines: [ { who: "Abuela", m: "línea maya del curso", es: "traducción" } ],   // lo que te dicen
           hint: "Pista en español (opcional).",
           choices: [                 // 2 o 3 opciones; al menos una apropiada
             { m: "opción maya del curso", es: "traducción", ok: true,  fb: "Por qué está bien.", next: "otro-paso" },
             { m: "opción maya del curso", es: "traducción", ok: false, fb: "Por qué no, con amabilidad." }
           ]
         }
       }
     }
   «next» es el id de otro paso o "fin". Una opción no apropiada no lleva «next»: se explica y se reintenta.
   Los caminos se separan y se vuelven a unir para no multiplicar el texto.
   Sin backticks ni la etiqueta de cierre de script. */
window.COURSE_STORIES = [
  {
    id: "visita-abuela",
    title: "Visita a la abuela",
    unit: 6,
    intro: "Saludas a tu abuela, platican de la familia y te invita a comer.",
    start: "puerta",
    outro: "Tu abuela te despide en la puerta con una sonrisa. Fue una buena visita.",
    nodes: {
      puerta: {
        text: "Llegas a casa de tu abuela. Ella abre la puerta y te saluda.",
        lines: [{ who: "Abuela", m: "Bix a beel?", es: "¿Cómo estás?" }],
        hint: "Te pregunta cómo estás: responde y pregúntale a ella.",
        choices: [
          { m: "Ma'alob, kux teech?", es: "Bien, ¿y tú?", ok: true, fb: "Respondes que estás bien y le devuelves la pregunta.", next: "foto" },
          { m: "Tak sáamal.", es: "Hasta mañana.", ok: false, fb: "Eso es una despedida, y apenas vas llegando. Prueba con un saludo." },
          { m: "Mixba'al.", es: "De nada.", ok: false, fb: "«Mixba'al» es «de nada»: se dice cuando alguien te da las gracias." }
        ]
      },
      foto: {
        text: "Te sientas junto a ella. Saca una foto de una señora y te la enseña.",
        lines: [
          { who: "Abuela", m: "Ki'imak in wóol.", es: "Me da gusto." },
          { who: "Abuela", m: "Bix u k'aaba'?", es: "¿Cómo se llama?" }
        ],
        hint: "Es tu mamá, Rosa.",
        choices: [
          { m: "Rosa u k'aaba'. In na'.", es: "Se llama Rosa. Es mi mamá.", ok: true, fb: "Dices su nombre y quién es.", next: "foto2" },
          { m: "Bix a k'aaba'?", es: "¿Cómo te llamas?", ok: false, fb: "Eso pregunta el nombre de la persona con quien hablas. Ella quiere saber el de la señora de la foto." }
        ]
      },
      foto2: {
        text: "Luego señala a un muchacho en la misma foto.",
        lines: [{ who: "Abuela", m: "Kux leti'?", es: "¿Y él?" }],
        hint: "Es tu hermano mayor, Pedro.",
        choices: [
          { m: "Pedro u k'aaba'. In suku'un.", es: "Se llama Pedro. Es mi hermano mayor.", ok: true, fb: "«Suku'un» es el hermano mayor.", next: "comida" },
          { m: "María u k'aaba'. In kiik.", es: "Se llama María. Es mi hermana mayor.", ok: false, fb: "Casi: «kiik» es la hermana mayor, y en la foto hay un muchacho." }
        ]
      },
      comida: {
        text: "Huele a tortillas recién hechas. Tu abuela se levanta.",
        lines: [{ who: "Abuela", m: "Ko'ox janal!", es: "¡Vamos a comer!" }],
        choices: [
          { m: "Ma'alob.", es: "Está bien.", ok: true, fb: "Aceptas con gusto.", next: "plato" },
          { m: "Ma' wi'ijeni', ts'o'ok in janal.", es: "No tengo hambre, ya comí.", ok: true, fb: "También está bien: le avisas con cortesía que ya comiste.", next: "platano" },
          { m: "Tak sáamal.", es: "Hasta mañana.", ok: false, fb: "Eso es una despedida; todavía no te vas. Dile si quieres comer o no." }
        ]
      },
      plato: {
        text: "Te sirve tortilla con frijol. Lo pruebas.",
        hint: "Dile que está rico.",
        choices: [
          { m: "Jach ki'!", es: "¡Qué rico!", ok: true, fb: "A cualquier abuela le gusta oír eso.", next: "adios" },
          { m: "Jach ko'oj!", es: "¡Qué caro!", ok: false, fb: "«Ko'oj» es «caro»; en casa de la abuela no se paga. Para decir que está sabroso se usa «ki'»." }
        ]
      },
      platano: {
        text: "Tu abuela te guarda un plátano para el camino.",
        lines: [{ who: "Abuela", m: "Ma'alob.", es: "Está bien." }],
        hint: "Agradécele.",
        choices: [
          { m: "Dios bo'otik.", es: "Gracias.", ok: true, fb: "Le das las gracias.", next: "adios" },
          { m: "Mixba'al.", es: "De nada.", ok: false, fb: "«De nada» lo dice quien recibe las gracias. Aquí tú recibes el regalo: toca agradecer." }
        ]
      },
      adios: {
        text: "Ya es tarde y te despides.",
        lines: [{ who: "Abuela", m: "Ka xi'ik teech utsil.", es: "Que te vaya bien." }],
        choices: [
          { m: "Beyxan teech.", es: "Igualmente (a ti también).", ok: true, fb: "Le devuelves el buen deseo.", next: "fin" },
          { m: "Tak sáamal.", es: "Hasta mañana.", ok: true, fb: "Una despedida que promete volver pronto.", next: "fin" },
          { m: "Bix a beel?", es: "¿Cómo estás?", ok: false, fb: "Eso es un saludo, y ella se está despidiendo. Responde con una despedida." }
        ]
      }
    }
  },
  {
    id: "mercado",
    title: "En el mercado",
    unit: 11,
    intro: "Compras en un puesto de la plaza: pides, cuentas y preguntas el precio.",
    start: "llegada",
    outro: "Te vas con tu canasta llena y la vendedora te dice adiós con la mano.",
    nodes: {
      llegada: {
        text: "Llegas a un puesto de la plaza. La vendedora te saluda.",
        lines: [{ who: "Vendedora", m: "Ba'ax ka wa'alik?", es: "¿Qué tal?" }],
        choices: [
          { m: "Chéen mixba'al. Kux teech?", es: "Nada, aquí nomás. ¿Y usted?", ok: true, fb: "Respondes al saludo y le preguntas a ella.", next: "pedido" },
          { m: "Ka xi'ik teech utsil.", es: "Que te vaya bien.", ok: false, fb: "Eso se dice al despedirse. Primero responde a su saludo." }
        ]
      },
      pedido: {
        lines: [{ who: "Vendedora", m: "Ba'ax a k'áat?", es: "¿Qué quieres?" }],
        hint: "Pide algo o pregunta si hay plátano.",
        choices: [
          { m: "In k'áat waaj.", es: "Quiero tortilla.", ok: true, fb: "Pides lo que quieres con «in k'áat».", next: "cuantos" },
          { m: "Yaan wáaj ja'as?", es: "¿Hay plátano?", ok: true, fb: "Preguntas si tiene lo que buscas.", next: "sinplatano" },
          { m: "Ma' in k'áati'.", es: "No quiero.", ok: false, fb: "«Ma' in k'áati'» es «no quiero», y viniste a comprar. Prueba a pedir algo." }
        ]
      },
      cuantos: {
        text: "La vendedora toma un manojo de tortillas.",
        lines: [{ who: "Vendedora", m: "Jayp'éel?", es: "¿Cuántas?" }],
        hint: "Las tortillas son cosas.",
        choices: [
          { m: "ka'ap'éel", es: "dos (cosas)", ok: true, fb: "Para contar cosas se usa «-p'éel».", next: "precio" },
          { m: "ka'atúul", es: "dos (personas o animales)", ok: false, fb: "«-túul» sirve para contar personas o animales. Para cosas se dice con «-p'éel»." }
        ]
      },
      sinplatano: {
        lines: [{ who: "Vendedora", m: "Mina'an ja'as. Yaan ya' yéetel oon.", es: "No hay plátano. Hay zapote y aguacate." }],
        choices: [
          { m: "In k'áat ka'ap'éel oon.", es: "Quiero dos aguacates.", ok: true, fb: "Si no hay plátano, aguacate está muy bien.", next: "precio" },
          { m: "Yaan wáaj ja'as?", es: "¿Hay plátano?", ok: false, fb: "Ya te dijo que no hay plátano. Pide algo de lo que sí tiene." }
        ]
      },
      precio: {
        text: "Antes de pagar, quieres saber cuánto es.",
        choices: [
          { m: "Bajux u tojol?", es: "¿Cuánto cuesta?", ok: true, fb: "Así se pregunta el precio.", next: "pago" },
          { m: "Jayp'éel ja'ab yaan teech?", es: "¿Cuántos años tienes?", ok: false, fb: "Eso pregunta la edad. Para el precio se usa «bajux»." }
        ]
      },
      pago: {
        text: "Te dice el precio. Es justo, y le pagas.",
        hint: "Agradécele.",
        choices: [
          { m: "Dios bo'otik.", es: "Gracias.", ok: true, fb: "Le das las gracias.", next: "despedida" },
          { m: "Jach ko'oj!", es: "¡Qué caro!", ok: false, fb: "«¡Qué caro!» no le haría gracia: el precio es justo. Mejor agradece." }
        ]
      },
      despedida: {
        lines: [{ who: "Vendedora", m: "Mixba'al. Ka xi'ik teech utsil.", es: "De nada. Que te vaya bien." }],
        choices: [
          { m: "Tak sáamal!", es: "¡Hasta mañana!", ok: true, fb: "Te despides y prometes volver.", next: "fin" },
          { m: "Ma'alob k'iin", es: "Buenos días", ok: false, fb: "«Ma'alob k'iin» es «buenos días», un saludo. Aquí toca despedirse." }
        ]
      }
    }
  },
  {
    id: "paseo-cenote",
    title: "Paseo al cenote",
    unit: 12,
    intro: "Un amigo te invita a caminar; preguntas por el cenote y el camino.",
    start: "invitacion",
    outro: "El agua del cenote está fresca y la ceiba les da sombra. Buen paseo.",
    nodes: {
      invitacion: {
        text: "Es domingo por la mañana. Tu amigo pasa por ti.",
        lines: [{ who: "Amigo", m: "Ko'ox xíimbal.", es: "Vamos a pasear." }],
        choices: [
          { m: "Ko'ox!", es: "¡Vamos!", ok: true, fb: "Aceptas la invitación.", next: "pregunta" },
          { m: "Ma' a bin.", es: "No vayas.", ok: false, fb: "«Ma' a bin» le pide a él que no vaya. Si quieres acompañarlo, acepta." }
        ]
      },
      pregunta: {
        text: "Salen del pueblo hacia el monte. Te da curiosidad qué hay por ahí.",
        hint: "Pregunta qué hay por aquí.",
        choices: [
          { m: "Yaan wáaj ts'ono'ot waye'?", es: "¿Hay un cenote por aquí?", ok: true, fb: "Preguntas por el cenote.", next: "cenote" },
          { m: "Yaan wáaj báalam waye'?", es: "¿Hay jaguares por aquí?", ok: true, fb: "Buena pregunta para el monte.", next: "animales" },
          { m: "Bix a k'aaba'?", es: "¿Cómo te llamas?", ok: false, fb: "Es tu amigo: ya sabes cómo se llama. Pregunta qué hay por aquí." }
        ]
      },
      cenote: {
        lines: [{ who: "Amigo", m: "Jaaj, yaan ts'ono'ot yéetel ya'axche'.", es: "Sí, hay. Hay un cenote y una ceiba." }],
        choices: [
          { m: "Jach ma'alob! Dios bo'otik.", es: "¡Qué bien! Gracias.", ok: true, fb: "Te alegras y le agradeces.", next: "camino" },
          { m: "Mina'an waye'.", es: "Aquí no hay.", ok: false, fb: "«Mina'an waye'» es «aquí no hay», y él acaba de decir que sí hay." }
        ]
      },
      animales: {
        lines: [{ who: "Amigo", m: "Ma'. Mina'an báalam waye'. Yaan kéej, kitam yéetel baats'.", es: "No. Aquí no hay jaguares. Hay venados, jabalíes y saraguatos." }],
        choices: [
          { m: "Jach ma'alob! Dios bo'otik.", es: "¡Qué bien! Gracias.", ok: true, fb: "Te alegras y le agradeces.", next: "camino" },
          { m: "Tak sáamal.", es: "Hasta mañana.", ok: false, fb: "Eso es una despedida, y el paseo apenas empieza." }
        ]
      },
      camino: {
        text: "Caminan un buen rato entre los árboles. Quieres saber si falta mucho.",
        choices: [
          { m: "Náach wáaj?", es: "¿Está lejos?", ok: true, fb: "Preguntas si está lejos.", next: "cerca" },
          { m: "Tu'ux ka bin?", es: "¿A dónde vas?", ok: false, fb: "Eso pregunta a dónde va, y ya lo sabes: van juntos al cenote." }
        ]
      },
      cerca: {
        lines: [{ who: "Amigo", m: "Ma', naats'. Toj táanil.", es: "No, está cerca. Todo derecho." }],
        choices: [
          { m: "Ko'ox!", es: "¡Vamos!", ok: true, fb: "Siguen adelante.", next: "llegan" },
          { m: "Ma' tin na'atik. Tu ka'atéen, chaambéel.", es: "No entiendo. Otra vez, despacio.", ok: true, fb: "Pedir que repitan despacio siempre está bien. Te lo repite y señala el camino.", next: "llegan" },
          { m: "Kulen.", es: "Siéntate.", ok: false, fb: "«Kulen» es «¡siéntate!», y todavía falta un poco. Sigan caminando." }
        ]
      },
      llegan: {
        text: "Llegan al cenote, junto a una ceiba enorme.",
        lines: [{ who: "Amigo", m: "Uts wáaj ta wich?", es: "¿Te gusta?" }],
        choices: [
          { m: "Jats'uts! Uts tin wich tuláakal.", es: "¡Qué bonito! Me gusta todo.", ok: true, fb: "«Uts tin wich» es «me gusta» de lo que ves.", next: "fin" },
          { m: "Uts tin chi'.", es: "Me gusta (lo que como).", ok: false, fb: "«Uts tin chi'» es para lo que comes. Para lo que ves se dice «uts tin wich»." }
        ]
      }
    }
  }
];
