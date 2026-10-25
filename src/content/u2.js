/* Ko'ox Maaya · Unidad 2: Saludos.
   Formas tomadas de la base verificada (kb, archivos .verified.json) y de la reverificación (kb/recheck-*.json):
   conf "alta" = verificado, conf "media" = probable. */
(window.COURSE = window.COURSE || { units: [] }).units.push({
  id: "u2",
  n: 2,
  title: "Saludos",
  subtitle: "Saludar, presentarse y despedirse",
  sources: [
    {
      title: "INALI – Prontuario de frases de cortesía Maayat'aan",
      url: "https://site.inali.gob.mx/Micrositios/Prontuarios/maya.html"
    },
    {
      title: "Ayuntamiento de Mérida – Frases básicas español-maya (PDF)",
      url: "https://www.merida.gob.mx/municipio/sitiosphp/merida/descargas/frases_espano_maya.pdf"
    },
    { title: "Montgomery, Maya (Yucatec) Dictionary & Phrasebook" },
    { title: "Bevington, Maya for Travelers and Students" },
    {
      title: "Mújica (1995), Junp'iit Maaya – A little bit of Maya (sitio de Christian Lehmann)",
      url: "https://www.christianlehmann.eu/ling/sprachen/maya/textos/hunp'iit_maaya.html"
    },
    {
      title: "Blair y Vermont-Salas, Spoken Yucatec Maya, lecciones 1-18 (sitio de Christian Lehmann)",
      url: "https://www.christianlehmann.eu/ling/sprachen/maya/textos/bvs_1-18.html"
    },
    { title: "Yucatán Today – Say it in Maya", url: "https://yucatantoday.com/en/blog/say-it-in-maya" },
    {
      title: "Yucatán Today – Revista 434, Yucatán Historia Viva",
      url: "https://yucatantoday.com/hubfs/Revista/No434/No434-YucatanHistoriaViva.pdf?area-of-interest=undefined"
    },
    { title: "Wikipedia – Mérida (México)", url: "https://es.wikipedia.org/wiki/M%C3%A9rida_(M%C3%A9xico)" },
    { title: "Babbel – La lengua maya", url: "https://es.babbel.com/es/magazine/la-lengua-maya" },
    {
      title: "La Lengua Maya de Yucatán – Frases básicas",
      url: "https://sites.google.com/site/lalenguamayadeyucatan/frases-basicas"
    },
    {
      title: "PorEsto – ¿Cómo saludar y despedir en maya? (2024)",
      url: "https://www.poresto.com/yucatan/2024/1/8/como-saludar-despedir-en-maya.html"
    },
    {
      title: "Heraldo de México – Ko'ox kanik maaya t'aan (2025)",
      url: "https://yucatan.heraldodemexico.com.mx/tendencias/2025/8/27/koox-kanik-maaya-taan-asi-seran-los-cursos-para-preservar-la-lengua-maya-en-yucatan-1949.html"
    },
    {
      title: "INALI – Prontuario maya-español (2009), PDF alojado por Arqueología Mexicana",
      url: "https://arqueologiamexicana.mx/sites/default/files/banco_imagenes/prontuario_maya.pdf"
    },
    {
      title: "Omniglot – Useful phrases in Yucatec Maya",
      url: "https://www.omniglot.com/language/phrases/yucatec-maya.php"
    },
    {
      title: "PorEsto – Cómo se dice buenos días, tardes y noches en maya (2024)",
      url: "https://www.poresto.com/yucatan/2024/1/6/como-se-dice-buenos-dias-tardes-noches-en-maya.html"
    },
    {
      title: "PorEsto – ¿Kox o Ko'ox? La forma correcta en maya (2025)",
      url: "https://www.poresto.com/campeche/2025/12/5/kox-o-koox-conoce-la-forma-correcta-en-maya-de-decir-el-nombre-del-nuevo-transporte-de-campeche.html"
    },
    {
      title: "Mora-Marín (UNC Chapel Hill) – Maya T'aan Summer 2017, blog del curso de maya yucateco",
      url: "https://davidmm.web.unc.edu/2017/06/22/maya-taan-summer-2017/"
    },
    {
      title: "UADY – Diccionario español-maya, letra C (comienzo: káajal)",
      url: "https://www.mayas.uady.mx/diccionario/c_esp.html"
    },
    {
      title: "UADY – Diccionario español-maya, letra T (también: bey xan)",
      url: "https://www.mayas.uady.mx/diccionario/t_esp.html"
    }
  ],
  lessons: [
    {
      id: "u2l1",
      title: "¿Cómo estás?",
      goal: "Al terminar podrás saludar a cualquier hora, responder a un saludo y devolver la pregunta.",
      teach: [
        {
          kind: "culture",
          title: "¿Cómo va tu camino?",
          html: "El saludo más común, <span class=\"m\">Bix a beel?</span>, pregunta literalmente por el camino de la otra persona: <span class=\"m\">beel</span> es una forma de <span class=\"m\">bej</span>, «camino». Según el diccionario de Montgomery, el maya no tiene un equivalente exacto de «hola»; en la conversación se usa el préstamo del español <span class=\"m\">Ola</span>, seguido de <span class=\"m\">Bix a beel?</span>."
        },
        {
          kind: "table",
          title: "Saludar y responder",
          head: ["Maya", "Español"],
          rows: [
            ["Bix a beel?", "¿Cómo estás? (a cualquier hora)"],
            ["Ba'ax ka wa'alik?", "¿Qué tal? (informal; lit. ¿qué dices?)"],
            ["Ma'alob.", "Bien."],
            ["Jach ma'alob.", "Muy bien."],
            ["Mixba'al.", "Nada. (respuesta a ¿qué tal?)"],
            ["Kux teech?", "¿Y tú? (para devolver la pregunta)"]
          ]
        },
        {
          kind: "text",
          title: "Tú, usted y ustedes",
          html: "<span class=\"m\">teech</span> sirve para «tú» y para «usted»: en maya no existe esa distinción. Para saludar a varias personas se agrega <span class=\"m\">-e'ex</span>: <span class=\"m\">Bix a beele'ex?</span>, «¿cómo están?»."
        },
        {
          kind: "tip",
          title: "¿Y «buenos días»?",
          html: "<span class=\"m\">Ma'alob k'iin</span> («buen día») es un calco del español: los saludos por hora del día no son tradicionales en maya. El prontuario del INALI pone <span class=\"m\">Bix a beel?</span> como equivalente de «buenos días» y <span class=\"m\">Ba'ax ka wa'alik?</span> para «buenas noches».<br>Con la misma idea se oyen <span class=\"m\">Ma'alob chíinil k'iin</span>, «buenas tardes», y <span class=\"m\">Ma'alob áak'ab</span>, «buenas noches» (<span class=\"m\">áak'ab</span> es «noche»). Ninguna fuente académica recoge estas dos fórmulas, pero <span class=\"m\">Ma'alob áak'ab</span> aparece en varias fuentes independientes. <span class=\"m\">Ma'alob chíinil k'iin</span> sigue «por confirmar», porque las guías no coinciden en la vocal de <span class=\"m\">chíinil</span>."
        }
      ],
      vocab: [
        {
          id: "u2-bix-a-beel",
          m: "Bix a beel?",
          es: "¿Cómo estás?",
          pr: "bish a beel",
          note: "Lit. «¿cómo va tu camino?». Es el saludo más común, a cualquier hora.",
          conf: "alta"
        },
        {
          id: "u2-maalob",
          m: "Ma'alob",
          es: "bien; bueno",
          pr: "ma-alob",
          note: "La respuesta habitual a Bix a beel? También significa «de acuerdo».",
          ex: { m: "Bix a beel? — Ma'alob.", es: "¿Cómo estás? — Bien." },
          conf: "alta"
        },
        {
          id: "u2-jach-maalob",
          m: "Jach ma'alob",
          es: "muy bien",
          pr: "jach ma-alob",
          note: "Jach es «muy».",
          conf: "alta"
        },
        {
          id: "u2-kux-teech",
          m: "Kux teech?",
          es: "¿Y tú?",
          pr: "kush teech",
          note: "Kux pregunta «¿y …?» por otra persona; sirve para devolver la pregunta.",
          conf: "alta"
        },
        {
          id: "u2-baax-ka-waalik",
          m: "Ba'ax ka wa'alik?",
          es: "¿Qué tal?; ¿cómo estás? (lit. ¿qué dices?)",
          pr: "ba-ash ka wa-alik",
          note: "Saludo informal muy usado.",
          conf: "alta"
        },
        {
          id: "u2-mixbaal",
          m: "Mixba'al",
          es: "nada; de nada",
          pr: "mish-ba-al",
          note: "Responde a Ba'ax ka wa'alik? y también a las gracias.",
          alt: ["Mix ba'al"],
          conf: "alta"
        },
        {
          id: "u2-cheen-mixbaal",
          m: "Chéen mixba'al",
          es: "nada, aquí nomás",
          pr: "chéen mish-ba-al",
          note: "Respuesta a Ba'ax ka wa'alik? en el curso clásico de Blair y Vermont-Salas.",
          conf: "media"
        },
        {
          id: "u2-bix-a-beeleex",
          m: "Bix a beele'ex?",
          es: "¿Cómo están (ustedes)?",
          pr: "bish a beele-esh",
          note: "Para varias personas se agrega -e'ex.",
          conf: "alta"
        },
        {
          id: "u2-maalob-kiin",
          m: "Ma'alob k'iin",
          es: "buenos días",
          pr: "ma-alob k'iin",
          note: "Calco del español; el saludo tradicional es Bix a beel?",
          conf: "alta"
        },
        {
          id: "u2-maalob-chiinil-kiin",
          m: "Ma'alob chíinil k'iin",
          es: "buenas tardes",
          pr: "ma-alob chíinil k'iin",
          note: "Calco moderno del español, como Ma'alob k'iin. Varias guías la escriben así, pero ninguna fuente académica; Omniglot pone chi'inil, con vocal rearticulada.",
          conf: "media"
        },
        {
          id: "u2-maalob-aakab",
          m: "Ma'alob áak'ab",
          es: "buenas noches",
          pr: "ma-alob áak'ab",
          note: "Calco del español, como Ma'alob k'iin; lo dan varias fuentes independientes. Áak'ab es «noche».",
          conf: "alta"
        }
      ],
      dialogue: {
        title: "Ana llega con sus amigos",
        lines: [
          { who: "A", name: "Ana", m: "Bix a beele'ex?", es: "¿Cómo están?" },
          { who: "B", name: "Pedro", m: "Ma'alob, kux teech?", es: "Bien, ¿y tú?" },
          { who: "A", name: "Ana", m: "Jach ma'alob.", es: "Muy bien." },
          { who: "B", name: "Rosa", m: "Ba'ax ka wa'alik?", es: "¿Qué tal? (lit. ¿qué dices?)" },
          { who: "A", name: "Ana", m: "Chéen mixba'al.", es: "Nada, aquí nomás." }
        ]
      },
      exercises: [
        {
          type: "fill",
          es: "¿Cómo estás?",
          before: "Bix a",
          after: "?",
          answer: "beel",
          options: ["beel", "bej", "k'iin"]
        },
        { type: "build", es: "Bien, ¿y tú?", m: "Ma'alob, kux teech?", distractors: ["beel", "jach"] },
        {
          type: "choice",
          q: "¿Qué significa?",
          prompt: "Ba'ax ka wa'alik?",
          promptLang: "m",
          answer: "¿Qué tal?",
          options: ["¿Qué tal?", "¿Y tú?", "Muy bien"]
        },
        {
          type: "choice",
          q: "Te preguntan esto. ¿Qué respondes en maya?",
          prompt: "¿Cómo estás?",
          promptLang: "es",
          answer: "Ma'alob, kux teech?",
          options: ["Ma'alob, kux teech?", "Mixba'al.", "Bix a beele'ex?"]
        },
        {
          type: "choice",
          q: "¿Cómo se dice en maya?",
          prompt: "buenas noches",
          promptLang: "es",
          answer: "Ma'alob áak'ab",
          options: ["Ma'alob áak'ab", "Ma'alob k'iin", "Mixba'al"]
        },
        {
          type: "fill",
          es: "¿Cómo están (ustedes)?",
          before: "Bix a",
          after: "?",
          answer: "beele'ex",
          options: ["beele'ex", "beel", "teech"]
        },
        { type: "type", q: "Escribe en maya", prompt: "muy bien", answer: "Jach ma'alob" },
        {
          type: "choice",
          q: "¿Qué significa?",
          prompt: "Ma'alob chíinil k'iin",
          promptLang: "m",
          answer: "buenas tardes",
          options: ["buenas tardes", "buenas noches", "buenos días"]
        }
      ]
    },
    {
      id: "u2l2",
      title: "Presentarse",
      goal: "Al terminar podrás decir tu nombre, preguntar el de otra persona y decir de dónde eres.",
      teach: [
        {
          kind: "table",
          title: "Nombre y lugar",
          head: ["Maya", "Español"],
          rows: [
            ["Bix a k'aaba'?", "¿Cómo te llamas?"],
            ["In k'aaba'e' Ana.", "Me llamo Ana."],
            ["Tene' Refugio in k'aaba'.", "Yo me llamo Refugio."],
            ["Tu'ux a kaajal?", "¿De dónde eres?"],
            ["In kaajale' Jo'.", "Soy de Mérida."]
          ]
        },
        {
          kind: "text",
          title: "Mi nombre, tu nombre",
          html: "<span class=\"m\">k'aaba'</span> es «nombre». <span class=\"m\">in k'aaba'</span> es «mi nombre» y <span class=\"m\">a k'aaba'</span>, «tu nombre»: el posesivo va antes, como en español. La terminación <span class=\"m\">-e'</span> presenta el tema: <span class=\"m\">In k'aaba'e' Ana</span> es, literalmente, «en cuanto a mi nombre: Ana». Con <span class=\"m\">teen</span> (yo) queda <span class=\"m\">tene'</span>, «en cuanto a mí»."
        },
        {
          kind: "culture",
          title: "Jo', el nombre maya de Mérida",
          html: "En maya, Mérida se llama <span class=\"m\">Jo'</span>. La ciudad se fundó sobre la antigua población maya de Ichkaansihó, también llamada T'Hó. Por eso, para decir que eres de Mérida, dices <span class=\"m\">In kaajale' Jo'</span>. La palabra <span class=\"m\">kaajal</span> viene de <span class=\"m\">kaaj</span>, «pueblo»."
        },
        {
          kind: "tip",
          title: "Mucho gusto",
          html: "<span class=\"m\">Ki'imak in wóol</span> es «me da gusto» (lit. «mi ánimo está alegre»). Para «mucho gusto en conocerte»: <span class=\"m\">Jach ki'imak in wóol in k'ajóoltikech</span>. Y para devolverlo: <span class=\"m\">Beyxan teen</span>, «yo también»."
        }
      ],
      vocab: [
        { id: "u2-kaaba", m: "k'aaba'", es: "nombre", pr: "k'aaba- (k con golpe)", conf: "alta" },
        {
          id: "u2-bix-a-kaaba",
          m: "Bix a k'aaba'?",
          es: "¿Cómo te llamas?",
          pr: "bish a k'aaba-",
          note: "Lit. «¿cómo es tu nombre?».",
          conf: "alta"
        },
        {
          id: "u2-in-kaabae",
          m: "In k'aaba'e' …",
          es: "Me llamo …",
          pr: "in k'aaba-e- …",
          note: "Lit. «mi nombre es…». Pon tu nombre al final.",
          ex: { m: "In k'aaba'e' Ana.", es: "Me llamo Ana." },
          conf: "alta"
        },
        {
          id: "u2-tene-in-kaaba",
          m: "Tene' … in k'aaba'",
          es: "Yo me llamo …",
          pr: "tene- … in k'aaba-",
          note: "Otra forma de presentarse: el nombre va antes de in k'aaba'.",
          ex: { m: "Tene' Refugio in k'aaba', kux teech?", es: "Yo me llamo Refugio, ¿y tú?" },
          conf: "alta"
        },
        {
          id: "u2-kaaj",
          m: "kaaj",
          es: "pueblo, poblado",
          pr: "kaaj (j suave)",
          note: "Con posesivo se dice kaajal: a kaajal, «tu pueblo».",
          conf: "alta"
        },
        {
          id: "u2-tuux-a-kaajal",
          m: "Tu'ux a kaajal?",
          es: "¿De dónde eres?",
          pr: "tu-ush a kaajal",
          note: "Lit. «¿dónde es tu pueblo?». No confundas kaajal (pueblo) con káajal, de tono alto, que es «comenzar; comienzo».",
          conf: "media"
        },
        {
          id: "u2-in-kaajale",
          m: "In kaajale' …",
          es: "Soy de …",
          pr: "in kaajale- …",
          note: "Lit. «mi pueblo es…». Completa con el lugar.",
          ex: { m: "In kaajale' Jo'.", es: "Soy de Mérida." },
          conf: "media"
        },
        {
          id: "u2-jo",
          m: "Jo'",
          es: "Mérida (nombre maya)",
          pr: "jo-",
          note: "Mérida se fundó sobre la antigua población maya de T'Hó. Se escribe igual que jo', «cinco», que verás en la unidad de números.",
          conf: "alta"
        },
        {
          id: "u2-kiimak-in-wool",
          m: "Ki'imak in wóol",
          es: "me da gusto; estoy contento",
          pr: "ki-imak in wóol",
          note: "Lit. «mi ánimo está alegre».",
          conf: "alta"
        },
        {
          id: "u2-mucho-gusto",
          m: "Jach ki'imak in wóol in k'ajóoltikech",
          es: "mucho gusto en conocerte",
          pr: "jach ki-imak in wóol in k'ajóoltikech",
          note: "Lit. «me alegra mucho conocerte». K'ajóol es «conocer».",
          conf: "media"
        },
        {
          id: "u2-beyxan-teen",
          m: "Beyxan teen",
          es: "yo también; igualmente",
          pr: "beyshan teen",
          note: "Bey (así) + xan (también) + teen (yo). El diccionario de la UADY escribe bey xan, separado.",
          alt: ["Bey xan teen"],
          conf: "alta"
        }
      ],
      dialogue: {
        title: "Una presentación",
        lines: [
          { who: "A", name: "Refugio", m: "Bix a beel?", es: "¿Cómo estás?" },
          { who: "B", name: "Ana", m: "Ma'alob. Bix a k'aaba'?", es: "Bien. ¿Cómo te llamas?" },
          { who: "A", name: "Refugio", m: "Tene' Refugio in k'aaba', kux teech?", es: "Yo me llamo Refugio, ¿y tú?" },
          { who: "B", name: "Ana", m: "In k'aaba'e' Ana. Tu'ux a kaajal?", es: "Me llamo Ana. ¿De dónde eres?" },
          { who: "A", name: "Refugio", m: "In kaajale' Jo'.", es: "Soy de Mérida." },
          { who: "B", name: "Ana", m: "Jach ki'imak in wóol in k'ajóoltikech.", es: "Mucho gusto en conocerte." },
          { who: "A", name: "Refugio", m: "Beyxan teen.", es: "Igualmente." }
        ]
      },
      exercises: [
        {
          type: "fill",
          es: "Me llamo Ana.",
          before: "In",
          after: "Ana.",
          answer: "k'aaba'e'",
          options: ["k'aaba'e'", "kaajale'", "beel"]
        },
        { type: "build", es: "¿Cómo te llamas?", m: "Bix a k'aaba'?", distractors: ["in", "kaajal"] },
        {
          type: "choice",
          q: "¿Qué significa?",
          prompt: "Tu'ux a kaajal?",
          promptLang: "m",
          answer: "¿De dónde eres?",
          options: ["¿De dónde eres?", "¿Cómo te llamas?", "¿Cómo estás?"]
        },
        {
          type: "choice",
          q: "¿Qué significa?",
          prompt: "In kaajale' Jo'.",
          promptLang: "m",
          answer: "Soy de Mérida.",
          options: ["Soy de Mérida.", "Me llamo Mérida.", "¿De dónde eres?"]
        },
        {
          type: "fill",
          es: "Yo me llamo Refugio, ¿y tú?",
          before: "Tene' Refugio in k'aaba',",
          after: "teech?",
          answer: "kux",
          options: ["kux", "bix", "tu'ux"]
        },
        {
          type: "choice",
          q: "Te dicen «mucho gusto». ¿Qué respondes?",
          prompt: "Igualmente.",
          promptLang: "es",
          answer: "Beyxan teen.",
          options: ["Beyxan teen.", "Mixba'al.", "Ma'alob k'iin."]
        },
        { type: "type", q: "Escribe en maya", prompt: "nombre", answer: "k'aaba'" },
        {
          type: "choice",
          q: "Repaso: ¿qué significa?",
          prompt: "Kux teech?",
          promptLang: "m",
          answer: "¿Y tú?",
          options: ["¿Y tú?", "¿Cómo estás?", "Nada"]
        }
      ]
    },
    {
      id: "u2l3",
      title: "Cortesía: gracias, sí y no",
      goal: "Al terminar podrás dar las gracias, pedir permiso y decir sí o no.",
      teach: [
        {
          kind: "culture",
          title: "Gracias: «Dios lo paga»",
          html: "<span class=\"m\">Dios bo'otik</span> significa literalmente «Dios lo paga» y es la forma más difundida de agradecer. El prontuario del INALI usa <span class=\"m\">Yuum bo'otik</span> (<span class=\"m\">yuum</span> es «señor, padre»). <span class=\"m\">Níib óolal</span> es otra forma tradicional, y <span class=\"m\">Jach níib óolal</span> es «muchas gracias». La respuesta habitual es <span class=\"m\">Mixba'al</span>, «no es nada»."
        },
        {
          kind: "text",
          title: "Con permiso",
          html: "Para pedir paso o disculparte, el prontuario del INALI da <span class=\"m\">Pa'atik in jáan máan</span>: «con permiso; disculpe usted». Apréndela entera, como fórmula, igual que dices «con permiso» en español."
        },
        {
          kind: "text",
          title: "Sí y no",
          html: "<span class=\"m\">Ma'</span> es «no». Para «sí» no hay una palabra única: se responde <span class=\"m\">Beey</span> («así es») o <span class=\"m\">Jaaj</span> («es verdad»)."
        },
        {
          kind: "tip",
          title: "¿Y «por favor»?",
          html: "Según Montgomery, no hay un «por favor» nativo exacto. Las guías modernas proponen <span class=\"m\">Meent uts</span>, «haz el bien». Por eso conviene aprender fórmulas completas, como <span class=\"m\">Pa'atik in jáan máan</span>."
        }
      ],
      vocab: [
        {
          id: "u2-dios-bootik",
          m: "Dios bo'otik",
          es: "gracias",
          pr: "dios bo-otik",
          note: "Lit. «Dios lo paga». Es la forma más difundida.",
          ex: { m: "Dios bo'otik. — Mixba'al.", es: "Gracias. — De nada." },
          conf: "alta"
        },
        {
          id: "u2-yuum-bootik",
          m: "Yuum bo'otik",
          es: "muchas gracias; gracias",
          pr: "yuum bo-otik",
          note: "Yuum es «señor, padre».",
          conf: "alta"
        },
        {
          id: "u2-niib-oolal",
          m: "Níib óolal",
          es: "gracias",
          note: "Forma tradicional de agradecer. Jach níib óolal: «muchas gracias».",
          conf: "alta"
        },
        {
          id: "u2-paatik-in-jaan-maan",
          m: "Pa'atik in jáan máan",
          es: "con permiso; disculpe",
          pr: "pa-atik in jáan máan",
          note: "Fórmula del prontuario del INALI para pedir paso o disculparse. Lleva dos tonos altos: jáan y máan.",
          conf: "alta"
        },
        {
          id: "u2-ma",
          m: "Ma'",
          es: "no",
          pr: "ma-",
          note: "También niega frases enteras; lo verás más adelante.",
          conf: "alta"
        },
        { id: "u2-beey", m: "Beey", es: "sí; así es", note: "Lit. «así». No hay un «sí» único.", conf: "alta" },
        {
          id: "u2-jaaj",
          m: "Jaaj",
          es: "es verdad; cierto; sí",
          pr: "jaaj (j suave)",
          note: "También sirve para decir que sí.",
          conf: "alta"
        },
        {
          id: "u2-meent-uts",
          m: "Meent uts",
          es: "por favor (lit. haz el bien)",
          note: "Fórmula de guías modernas: no hay un «por favor» nativo exacto.",
          conf: "media"
        }
      ],
      dialogue: {
        title: "Para pasar",
        lines: [
          { who: "A", name: "Ana", m: "Pa'atik in jáan máan.", es: "Con permiso." },
          { who: "B", name: "Pedro", m: "Ma'alob.", es: "Está bien." },
          { who: "A", name: "Ana", m: "Jach níib óolal.", es: "Muchas gracias." },
          { who: "B", name: "Pedro", m: "Mixba'al.", es: "De nada." }
        ]
      },
      exercises: [
        {
          type: "choice",
          q: "¿Cómo se dice en maya?",
          prompt: "gracias",
          promptLang: "es",
          answer: "Dios bo'otik",
          options: ["Dios bo'otik", "Mixba'al", "Tak sáamal"]
        },
        {
          type: "choice",
          q: "Quieres pasar entre la gente. ¿Qué dices?",
          prompt: "Con permiso.",
          promptLang: "es",
          answer: "Pa'atik in jáan máan.",
          options: ["Pa'atik in jáan máan.", "Dios bo'otik.", "Bix a beel?"]
        },
        { type: "build", es: "Con permiso.", m: "Pa'atik in jáan máan.", distractors: ["bo'otik", "beel"] },
        {
          type: "fill",
          es: "Gracias. — De nada.",
          before: "Dios bo'otik. —",
          after: ".",
          answer: "Mixba'al",
          options: ["Mixba'al", "Ma'alob", "Beey"]
        },
        {
          type: "choice",
          q: "¿Qué significa?",
          prompt: "Jaaj",
          promptLang: "m",
          answer: "es verdad; cierto",
          options: ["es verdad; cierto", "no", "nada"]
        },
        {
          type: "choice",
          q: "¿Qué significa?",
          prompt: "Beey",
          promptLang: "m",
          answer: "sí; así es",
          options: ["sí; así es", "no", "de nada"]
        },
        {
          type: "type",
          q: "Escribe en maya",
          prompt: "muchas gracias",
          answer: "Yuum bo'otik",
          alt: ["Jach níib óolal"]
        },
        { type: "type", q: "Escribe en maya", prompt: "no", answer: "Ma'" }
      ]
    },
    {
      id: "u2l4",
      title: "Despedidas",
      goal: "Al terminar podrás despedirte, desear buen camino a una persona o a un grupo e invitar con «¡vamos!».",
      teach: [
        {
          kind: "table",
          title: "Para despedirte",
          head: ["Maya", "Español"],
          rows: [
            ["Tak sáamal.", "Hasta mañana."],
            ["Tak ti' uláak' k'iin.", "Hasta otro día; hasta luego."],
            ["Ka xi'ik teech utsil.", "Que te vaya bien."],
            ["Ka xi'ik teech jats'uts.", "¡Que te vaya bien! (buen camino)"],
            ["Ka xi'ik te'ex utsil.", "Que les vaya bien (a ustedes)."],
            ["Ko'ox!", "¡Vámonos!"]
          ]
        },
        {
          kind: "text",
          title: "Que te vaya bien",
          html: "<span class=\"m\">Ka xi'ik</span> es «que vaya», del verbo <span class=\"m\">bin</span> (ir). Luego va a quién se lo deseas: <span class=\"m\">teech</span> a una persona y <span class=\"m\">te'ex</span> a un grupo. Al final, cómo: <span class=\"m\">utsil</span> (bien) o <span class=\"m\">jats'uts</span> (bonito).<br>El prontuario del INALI, de 2009, escribe <i>tech</i>; con las normas de 2014 se escribe <span class=\"m\">teech</span>."
        },
        {
          kind: "culture",
          title: "Ko'ox, «vamos»",
          html: "<span class=\"m\">Ko'ox</span> invita a hacer algo juntos: «vamos», «vayamos». Da nombre al programa del Gobierno de Yucatán <span class=\"m\">Ko'ox kanik maaya t'aan</span>, «Vamos a aprender lengua maya». En 2025, PorEsto dedicó una nota a su grafía correcta, con apóstrofo, a propósito del nombre de un transporte de Campeche."
        }
      ],
      vocab: [
        {
          id: "u2-tak-saamal",
          m: "Tak sáamal",
          es: "hasta mañana",
          note: "Sáamal es «mañana», el día siguiente.",
          conf: "alta"
        },
        {
          id: "u2-tak-ti-ulaak-kiin",
          m: "Tak ti' uláak' k'iin",
          es: "hasta otro día; hasta luego",
          pr: "tak ti- uláak' k'iin",
          note: "Lit. «hasta otro día». El prontuario del INALI la da como «adiós, hasta luego».",
          conf: "alta"
        },
        {
          id: "u2-ka-xiik-teech-utsil",
          m: "Ka xi'ik teech utsil",
          es: "que te vaya bien",
          pr: "ka shi-ik teech utsil",
          note: "Xi'ik es «que vaya», del verbo bin (ir); utsil es «bien, bondad». A un grupo: Ka xi'ik te'ex utsil.",
          conf: "alta"
        },
        {
          id: "u2-ka-xiik-teech-jatsuts",
          m: "Ka xi'ik teech jats'uts",
          es: "¡que te vaya bien! (buen camino)",
          pr: "ka shi-ik teech jats'uts",
          note: "Fórmula del prontuario del INALI. Jats'uts es «bonito».",
          conf: "alta"
        },
        {
          id: "u2-ka-xiik-teex-utsil",
          m: "Ka xi'ik te'ex utsil",
          es: "que les vaya bien (a ustedes)",
          pr: "ka shi-ik te-esh utsil",
          note: "La misma fórmula para un grupo: te'ex (ustedes) en lugar de teech. La vimos escrita en una sola fuente.",
          conf: "media"
        },
        {
          id: "u2-koox",
          m: "Ko'ox",
          es: "¡vamos!; vámonos",
          pr: "ko-osh",
          note: "Invitación a hacer algo juntos.",
          ex: { m: "Ko'ox kanik maaya t'aan.", es: "Vamos a aprender lengua maya." },
          conf: "alta"
        }
      ],
      dialogue: {
        title: "Al despedirse",
        lines: [
          { who: "A", name: "Ana", m: "Dios bo'otik.", es: "Gracias." },
          { who: "B", name: "Pedro", m: "Mixba'al.", es: "De nada." },
          { who: "A", name: "Ana", m: "Tak sáamal.", es: "Hasta mañana." },
          { who: "B", name: "Pedro", m: "Ka xi'ik teech utsil.", es: "Que te vaya bien." },
          { who: "A", name: "Ana", m: "Beyxan teech.", es: "Igualmente (a ti también)." }
        ]
      },
      exercises: [
        {
          type: "choice",
          q: "¿Qué significa?",
          prompt: "Tak sáamal",
          promptLang: "m",
          answer: "hasta mañana",
          options: ["hasta mañana", "que te vaya bien", "de nada"]
        },
        { type: "build", es: "Que te vaya bien.", m: "Ka xi'ik teech utsil.", distractors: ["beel", "ma'"] },
        {
          type: "fill",
          es: "Hasta otro día.",
          before: "Tak ti' uláak'",
          after: ".",
          answer: "k'iin",
          options: ["k'iin", "sáamal", "beel"]
        },
        {
          type: "fill",
          es: "¡Que te vaya bien! (buen camino)",
          before: "Ka xi'ik teech",
          after: ".",
          answer: "jats'uts",
          options: ["jats'uts", "beel", "k'iin"]
        },
        {
          type: "choice",
          q: "¿Qué significa?",
          prompt: "Ka xi'ik te'ex utsil.",
          promptLang: "m",
          answer: "Que les vaya bien (a ustedes).",
          options: ["Que les vaya bien (a ustedes).", "Que te vaya bien.", "Hasta mañana."]
        },
        {
          type: "choice",
          q: "¿Qué significa?",
          prompt: "Tak ti' uláak' k'iin",
          promptLang: "m",
          answer: "hasta otro día; hasta luego",
          options: ["hasta otro día; hasta luego", "hasta mañana", "¡vámonos!"]
        },
        { type: "type", q: "Escribe en maya", prompt: "hasta mañana", answer: "Tak sáamal" },
        { type: "type", q: "Escribe en maya", prompt: "¡vamos!", answer: "Ko'ox" }
      ]
    }
  ]
});
