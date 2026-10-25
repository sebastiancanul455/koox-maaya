/* Ko'ox Maaya · Unidad 1: Sonidos del maya.
   Formas tomadas de la base verificada (kb, archivos .verified.json) y de la reverificación (kb/recheck-*.json):
   conf "alta" = verificado, conf "media" = probable. */
(window.COURSE = window.COURSE || { units: [] }).units.push({
  id: "u1",
  n: 1,
  title: "Sonidos del maya",
  subtitle: "Vocales, consonantes y primeras palabras",
  sources: [
    {
      title: "INALI – Normas de escritura para la lengua maya (2014)",
      url: "https://site.inali.gob.mx/pdf/norma_maya.pdf"
    },
    { title: "Normas de escritura para la lengua maya" },
    {
      title: "UADY – Curso de maya, lección 1: alfabeto y tonos",
      url: "https://www.mayas.uady.mx/curso_maya/lecc01_1.html"
    },
    { title: "UADY – Diccionario maya-español", url: "https://www.mayas.uady.mx/diccionario/index.html" },
    {
      title: "Sobrino Gómez (2013), Descripción fonética de los tonos del maya yucateco",
      url: "https://www.scielo.org.mx/scielo.php?script=sci_arttext&pid=S0185-25742013000100006"
    },
    { title: "Wikipedia – Yucatec Maya language", url: "https://en.wikipedia.org/wiki/Yucatec_Maya_language" },
    {
      title: "Aprendiendo Maya – Las vocales y sus reglas de uso",
      url: "https://aprendiendomaya.com/escritura/vocales/las-vocales-y-sus-reglas-de-uso"
    },
    {
      title: "Aprendiendo Maya – Consonantes del alfabeto maya",
      url: "https://www.aprendiendomaya.com/escritura/alfabeto-maya"
    },
    {
      title: "UADY – Ch'a' Cháak, ceremonia de la lluvia (exposición)",
      url: "https://www.mayas.uady.mx/exposiciones/exp_05foto1.html"
    },
    {
      title: "Brody (2003), sobre el alfabeto maya de 1984 (AILLA)",
      url: "https://ailla-legacy.lib.utexas.edu/sites/default/files/documents/MBrody_MayaYucateco.pdf"
    },
    {
      title: "Lehmann (2018), Variación y normalización de la lengua maya",
      url: "https://www.redalyc.org/journal/5259/525957259008/html/"
    },
    { title: "UADY – Diccionario español-maya, letra N (negro: éek')", url: "https://www.mayas.uady.mx/diccionario/n_esp.html" },
    { title: "UADY – Diccionario español-maya, letra G (gallina: kaax)", url: "https://www.mayas.uady.mx/diccionario/g_esp.html" },
    {
      title: "UADY – Diccionario maya-español, letra K' (k'áax: monte)",
      url: "https://www.mayas.uady.mx/diccionario/k_glotal_maya.html"
    }
  ],
  lessons: [
    {
      id: "u1l1",
      title: "Las vocales",
      goal: "Al terminar podrás reconocer las cinco formas de cada vocal y distinguir palabras que solo cambian en la vocal.",
      teach: [
        {
          kind: "text",
          title: "Cinco vocales, cinco formas",
          html: "El maya usa las cinco vocales del español: a, e, i, o, u. Pero cada una tiene <b>cinco formas</b>, y cambiar de forma cambia la palabra: <b>corta</b> (a), <b>larga de tono bajo</b> (aa), <b>larga de tono alto</b> (áa), <b>glotalizada</b> (a') y <b>rearticulada</b> (a'a).<br>En español da igual si alargas una vocal; en maya no: <span class=\"m\">chich</span> es «duro» y <span class=\"m\">chiich</span> es «abuela». Sobrino (2013) midió 255 milisegundos en <span class=\"m\">chiich</span> y 105 en <span class=\"m\">chich</span>: la vocal larga dura más del doble."
        },
        {
          kind: "table",
          title: "Las cinco formas de la a",
          head: ["Forma", "Maya", "Significado"],
          rows: [
            ["corta: a", "sak", "blanco"],
            ["larga, tono bajo: aa", "kaan", "serpiente"],
            ["larga, tono alto: áa", "báat", "hacha"],
            ["glotalizada: a'", "sa'", "atole"],
            ["rearticulada: a'a", "ka'an", "cielo"]
          ]
        },
        {
          kind: "table",
          title: "Pares que solo cambian en la vocal",
          head: ["Maya", "Significado", "Vocal"],
          rows: [
            ["chich", "duro", "corta"],
            ["chiich", "abuela", "larga"],
            ["bat", "granizo", "corta"],
            ["báat", "hacha", "larga, tono alto"],
            ["miis", "gato", "larga, tono bajo"],
            ["míis", "escoba; barrer", "larga, tono alto"],
            ["kan", "cuatro", "corta"],
            ["kaan", "serpiente", "larga"],
            ["ka'an", "cielo", "rearticulada"],
            ["ya'ax", "verde", "rearticulada"],
            ["yáax", "primero", "larga, tono alto"],
            ["eek'", "estrella", "larga, tono bajo"],
            ["éek'", "negro, oscuro", "larga, tono alto"]
          ]
        },
        {
          kind: "tip",
          title: "Tono y corte de voz",
          html: "Solo las vocales largas llevan tono. El tono alto se marca con acento agudo en la <b>primera</b> de las dos vocales (áa): la voz empieza aguda y suele bajar. El tono bajo no se marca. Ojo: en maya el acento no indica la sílaba fuerte, como en español, sino el tono alto.<br>La glotalizada corta la voz al final: <span class=\"m\">sa'</span>. La rearticulada dice la vocal, corta y la repite: <span class=\"m\">ka'an</span> se lee «ka-an». En la pronunciación aproximada de cada palabra, un guion marca ese corte."
        }
      ],
      vocab: [
        {
          id: "u1-chich",
          m: "chich",
          es: "duro",
          note: "Vocal corta. Con vocal larga, chiich es «abuela».",
          conf: "alta"
        },
        {
          id: "u1-miis-gato",
          m: "miis",
          es: "gato",
          pr: "miis (i larga, tono bajo y parejo)",
          note: "Tono bajo: no lleva acento. Con tono alto, míis es «escoba».",
          conf: "alta"
        },
        {
          id: "u1-miis-escoba",
          m: "míis",
          es: "escoba; barrer",
          pr: "míis (i larga; la voz empieza aguda)",
          note: "El acento en la primera i marca el tono alto. Sin él, miis es «gato».",
          conf: "alta"
        },
        {
          id: "u1-bat",
          m: "bat",
          es: "granizo",
          note: "Vocal corta. Con vocal larga y tono alto, báat es «hacha».",
          conf: "alta"
        },
        {
          id: "u1-baat",
          m: "báat",
          es: "hacha",
          pr: "báat (a larga, tono alto)",
          note: "Larga con tono alto. Con vocal corta, bat es «granizo».",
          conf: "alta"
        },
        {
          id: "u1-yaax-primero",
          m: "yáax",
          es: "primero",
          pr: "yáash",
          note: "Tono alto. Con vocal rearticulada, ya'ax es «verde».",
          conf: "alta"
        },
        {
          id: "u1-sa",
          m: "sa'",
          es: "atole",
          pr: "sa-",
          note: "Vocal glotalizada: la voz se corta de golpe al final.",
          conf: "alta"
        },
        {
          id: "u1-aal",
          m: "a'al",
          es: "decir",
          pr: "a-al",
          note: "Vocal rearticulada: a, corte y otra vez a. La volverás a ver en Ba'ax ka wa'alik?, «¿qué dices?».",
          conf: "alta"
        },
        {
          id: "u1-kaan-serpiente",
          m: "kaan",
          es: "serpiente, víbora",
          pr: "kaan (a larga)",
          note: "Larga de tono bajo. Con vocal corta, kan es «cuatro»; con rearticulada, ka'an es «cielo».",
          conf: "alta"
        },
        {
          id: "u1-yeetel",
          m: "yéetel",
          es: "y; con",
          pr: "yéetel (e larga, tono alto)",
          note: "Une dos palabras («y») o acompaña («con»).",
          conf: "alta"
        }
      ],
      exercises: [
        {
          type: "choice",
          q: "¿Qué significa?",
          prompt: "míis",
          promptLang: "m",
          answer: "escoba; barrer",
          options: ["escoba; barrer", "gato", "granizo"]
        },
        {
          type: "choice",
          q: "¿Cómo se dice en maya?",
          prompt: "hacha",
          promptLang: "es",
          answer: "báat",
          options: ["báat", "bat", "míis"]
        },
        {
          type: "fill",
          es: "gato y escoba",
          before: "miis yéetel",
          after: "",
          answer: "míis",
          options: ["míis", "miis", "báat"]
        },
        {
          type: "choice",
          q: "¿Qué significa?",
          prompt: "kaan",
          promptLang: "m",
          answer: "serpiente, víbora",
          options: ["serpiente, víbora", "cuatro", "cielo"]
        },
        {
          type: "choice",
          q: "¿Cuál tiene una vocal rearticulada?",
          prompt: "vocal, corte y la misma vocal",
          promptLang: "es",
          answer: "a'al",
          options: ["a'al", "sa'", "bat", "yáax"]
        },
        { type: "build", es: "granizo y hacha", m: "bat yéetel báat", distractors: ["míis", "sa'"] },
        { type: "type", q: "Escribe en maya", prompt: "primero", answer: "yáax" },
        { type: "type", q: "Escribe en maya", prompt: "atole", answer: "sa'" }
      ]
    },
    {
      id: "u1l2",
      title: "Las consonantes",
      goal: "Al terminar podrás pronunciar la x, la j y la ts, y distinguir las consonantes glotalizadas k', t', p', ch' y ts'.",
      teach: [
        {
          kind: "text",
          title: "Letras que suenan distinto",
          html: "Casi todo se lee como en español. Estas son las diferencias:<br><b>x</b> siempre suena sh, como en inglés «she»: <span class=\"m\">xiib</span> (hombre) se dice «shiib».<br><b>j</b> es suave, un soplo como la h del inglés «hello»: <span class=\"m\">ja'</span> (agua).<br><b>k</b> es la c de «casa»; nunca se escribe c ni q: <span class=\"m\">kaan</span> (serpiente).<br><b>ts</b> es la tz de «quetzal», un solo sonido: <span class=\"m\">tsikbal</span> (platicar).<br><b>w</b> es la u de «huevo»: <span class=\"m\">waaj</span> (tortilla; pan).<br><b>'</b> (apóstrofo) es un corte breve de la voz: <span class=\"m\">che'</span> (árbol)."
        },
        {
          kind: "text",
          title: "Consonantes con golpe",
          html: "Las consonantes <b>glotalizadas</b> k', t', p', ch' y ts' no existen en español: se cierra la garganta y la consonante sale con un golpe seco. Consejo: dila aguantando la respiración.<br>Distinguen palabras: <span class=\"m\">iik</span> es «chile» e <span class=\"m\">iik'</span> es «viento»; <span class=\"m\">t'aan</span> es «palabra» y <span class=\"m\">táan</span>, con t simple y tono alto, es «frente».<br>A veces cambian la consonante y el tono a la vez: <span class=\"m\">kaax</span> es «gallina» y <span class=\"m\">k'áax</span>, «monte, selva». Fíjate en las dos diferencias."
        },
        {
          kind: "table",
          title: "Las cinco glotalizadas",
          head: ["Letra", "Maya", "Significado"],
          rows: [
            ["k'", "k'áak'", "fuego"],
            ["t'", "t'aan", "palabra; hablar"],
            ["p'", "p'aak", "tomate"],
            ["ch'", "ch'íich'", "pájaro"],
            ["ts'", "ts'íib", "escritura; escribir"]
          ]
        },
        {
          kind: "culture",
          title: "De 1984 a 2014: una escritura acordada",
          html: "En agosto de 1984 se acordó en Mérida el alfabeto que sigue siendo la base de la escritura maya. En 2014 el INALI publicó las <i>Normas de escritura para la lengua maya</i>, <span class=\"m\">U nu'ukbesajil u ts'íibta'al maayat'aan</span>, con las academias de lengua maya de Campeche, Yucatán y Quintana Roo. Ahí está <span class=\"m\">ts'íib</span>, «escribir».<br>Por eso los textos viejos usan otras grafías. Los nombres de personas y lugares conservan su grafía tradicional: se siguen escribiendo con «dz» o «c» nombres como Dzul o Hocabá."
        }
      ],
      vocab: [
        {
          id: "u1-xiib",
          m: "xiib",
          es: "hombre, varón",
          pr: "shiib",
          note: "La x maya siempre suena sh.",
          conf: "alta"
        },
        {
          id: "u1-tsikbal",
          m: "tsikbal",
          es: "platicar; plática",
          pr: "tsikbal (ts como en «quetzal»)",
          conf: "alta"
        },
        {
          id: "u1-iik-chile",
          m: "iik",
          es: "chile",
          pr: "iik (i larga)",
          note: "Termina en k simple. Con k', iik' es «viento».",
          conf: "alta"
        },
        {
          id: "u1-iik-viento",
          m: "iik'",
          es: "viento, aire",
          pr: "iik' (k con golpe al final)",
          note: "La k' final la distingue de iik, «chile».",
          conf: "alta"
        },
        {
          id: "u1-taan-palabra",
          m: "t'aan",
          es: "palabra, lengua; hablar",
          pr: "t'aan (t con golpe, a larga)",
          note: "Con t simple y tono alto, táan es «frente».",
          conf: "alta"
        },
        {
          id: "u1-taan-frente",
          m: "táan",
          es: "frente; delante",
          pr: "táan (t simple, a larga con tono alto)",
          note: "Se opone a t'aan, «palabra»: cambian la t y el tono.",
          conf: "media"
        },
        { id: "u1-paak", m: "p'aak", es: "tomate, jitomate", pr: "p'aak (p con golpe)", conf: "alta" },
        {
          id: "u1-chiich-pajaro",
          m: "ch'íich'",
          es: "pájaro, ave",
          pr: "ch'íich' (dos ch con golpe, i larga y alta)",
          conf: "alta"
        },
        {
          id: "u1-tsiib",
          m: "ts'íib",
          es: "escritura; escribir",
          pr: "ts'íib (ts con golpe, i larga y alta)",
          conf: "alta"
        },
        {
          id: "u1-maaya-taan",
          m: "maaya t'aan",
          es: "lengua maya",
          note: "Así llaman sus hablantes a su lengua. El INALI lo escribe junto: Maayat'aan.",
          alt: ["maayat'aan"],
          conf: "alta"
        }
      ],
      exercises: [
        {
          type: "choice",
          q: "¿Cómo se pronuncia?",
          prompt: "xiib",
          promptLang: "m",
          answer: "shiib",
          options: ["shiib", "ksiib", "jiib"]
        },
        {
          type: "choice",
          q: "¿Qué significa?",
          prompt: "iik'",
          promptLang: "m",
          answer: "viento, aire",
          options: ["viento, aire", "chile", "pájaro, ave"]
        },
        {
          type: "choice",
          q: "¿Cómo se dice en maya?",
          prompt: "chile",
          promptLang: "es",
          answer: "iik",
          options: ["iik", "iik'", "ch'íich'"]
        },
        {
          type: "fill",
          es: "lengua maya",
          before: "maaya",
          after: "",
          answer: "t'aan",
          options: ["t'aan", "táan", "ts'íib"]
        },
        { type: "build", es: "chile y tomate", m: "iik yéetel p'aak", distractors: ["iik'", "táan"] },
        {
          type: "choice",
          q: "¿Cuál empieza con una consonante glotalizada?",
          prompt: "consonante con golpe",
          promptLang: "es",
          answer: "ts'íib",
          options: ["ts'íib", "tsikbal", "xiib", "yéetel"]
        },
        { type: "type", q: "Escribe en maya", prompt: "hombre, varón", answer: "xiib" },
        {
          type: "choice",
          q: "Repaso: ¿qué significa?",
          prompt: "báat",
          promptLang: "m",
          answer: "hacha",
          options: ["hacha", "granizo", "primero"]
        }
      ]
    },
    {
      id: "u1l3",
      title: "Primeras palabras: la naturaleza",
      goal: "Al terminar podrás nombrar en maya el agua, el sol, el cielo, la tierra, el fuego y otros elementos de la naturaleza.",
      teach: [
        {
          kind: "text",
          title: "Ya puedes leerlas",
          html: "Estas palabras juntan todo lo que viste: el corte final de <span class=\"m\">ja'</span>, la vocal larga de <span class=\"m\">k'iin</span>, la rearticulada de <span class=\"m\">lu'um</span> y el tono alto entre dos glotalizadas de <span class=\"m\">k'áak'</span>. Léelas en voz alta antes de seguir."
        },
        {
          kind: "tip",
          title: "No las confundas",
          html: "<span class=\"m\">ja'</span> es «agua» y <span class=\"m\">ja'ab</span>, «año».<br><span class=\"m\">kaan</span> es «serpiente» y <span class=\"m\">ka'an</span>, «cielo».<br><span class=\"m\">cháak</span> es «lluvia» y <span class=\"m\">chak</span>, «rojo»."
        },
        {
          kind: "culture",
          title: "Sol, día y tiempo",
          html: "Una sola palabra, <span class=\"m\">k'iin</span>, nombra al sol, al día y al tiempo (diccionario de la UADY). Y la lluvia, <span class=\"m\">cháak</span>, da nombre al <span class=\"m\">Ch'a' Cháak</span>, la ceremonia para pedir lluvia que documenta una exposición fotográfica de la UADY."
        }
      ],
      vocab: [
        {
          id: "u1-ja",
          m: "ja'",
          es: "agua",
          pr: "ja- (j suave)",
          note: "j aspirada y corte de voz al final.",
          conf: "alta"
        },
        {
          id: "u1-jaab",
          m: "ja'ab",
          es: "año",
          pr: "ja-ab",
          note: "Rearticulada: no la confundas con ja', «agua».",
          conf: "alta"
        },
        {
          id: "u1-kiin",
          m: "k'iin",
          es: "sol; día; tiempo",
          pr: "k'iin (k con golpe, i larga)",
          note: "Una sola palabra para el sol, el día y el tiempo.",
          conf: "alta"
        },
        {
          id: "u1-kaan-cielo",
          m: "ka'an",
          es: "cielo",
          pr: "ka-an",
          note: "Rearticulada. No la confundas con kaan (serpiente) ni con kan (cuatro).",
          conf: "alta"
        },
        { id: "u1-luum", m: "lu'um", es: "tierra, suelo", pr: "lu-um", conf: "alta" },
        {
          id: "u1-che",
          m: "che'",
          es: "árbol; madera, palo",
          pr: "che-",
          note: "Termina con corte de voz.",
          conf: "alta"
        },
        {
          id: "u1-kaak",
          m: "k'áak'",
          es: "fuego, lumbre",
          pr: "k'áak' (dos k con golpe, a larga y alta)",
          conf: "alta"
        },
        {
          id: "u1-kaaknaab",
          m: "k'áak'náab",
          es: "mar, océano",
          note: "Una palabra larga con dos k' y dos tonos altos.",
          conf: "alta"
        },
        { id: "u1-tuunich", m: "tuunich", es: "piedra", pr: "tuunich (u larga)", conf: "alta" },
        {
          id: "u1-eek",
          m: "eek'",
          es: "estrella",
          pr: "eek' (e larga, k con golpe)",
          note: "Tono bajo. Con tono alto, éek' es «negro, oscuro» y también «sucio».",
          conf: "alta"
        },
        {
          id: "u1-chaak-lluvia",
          m: "cháak",
          es: "lluvia",
          pr: "cháak (a larga, tono alto)",
          note: "Con vocal corta, chak es «rojo».",
          ex: { m: "Ch'a' Cháak", es: "ceremonia para pedir lluvia" },
          conf: "alta"
        },
        {
          id: "u1-bej",
          m: "bej",
          es: "camino, sendero",
          pr: "bej (j suave)",
          note: "En el saludo Bix a beel? aparece su forma beel.",
          conf: "alta"
        }
      ],
      exercises: [
        {
          type: "choice",
          q: "¿Qué significa?",
          prompt: "ka'an",
          promptLang: "m",
          answer: "cielo",
          options: ["cielo", "serpiente, víbora", "tierra, suelo"]
        },
        {
          type: "choice",
          q: "¿Cómo se dice en maya?",
          prompt: "fuego",
          promptLang: "es",
          answer: "k'áak'",
          options: ["k'áak'", "k'iin", "che'"]
        },
        {
          type: "fill",
          es: "cielo y tierra",
          before: "ka'an yéetel",
          after: "",
          answer: "lu'um",
          options: ["lu'um", "ja'ab", "tuunich"]
        },
        { type: "build", es: "agua y fuego", m: "ja' yéetel k'áak'", distractors: ["ja'ab", "k'iin"] },
        {
          type: "choice",
          q: "¿Qué significa?",
          prompt: "ja'ab",
          promptLang: "m",
          answer: "año",
          options: ["año", "agua", "camino, sendero"]
        },
        { type: "type", q: "Escribe en maya", prompt: "agua", answer: "ja'" },
        { type: "type", q: "Escribe en maya", prompt: "piedra", answer: "tuunich" },
        {
          type: "choice",
          q: "Repaso: ¿cuál es «viento»?",
          prompt: "viento, aire",
          promptLang: "es",
          answer: "iik'",
          options: ["iik'", "iik", "eek'"]
        }
      ]
    }
  ]
});

window.COURSE.guide = {
  alphabet: [
    { l: "a e i o u", desc: "vocales cortas, como en español", ex: { m: "chich", es: "duro" } },
    { l: "aa", desc: "vocal larga de tono bajo: dura el doble y se mantiene pareja", ex: { m: "miis", es: "gato" } },
    {
      l: "áa",
      desc: "vocal larga de tono alto: empieza aguda y suele bajar; el acento va en la primera vocal",
      ex: { m: "míis", es: "escoba; barrer" }
    },
    { l: "a'", desc: "vocal glotalizada: la voz se corta de golpe al final", ex: { m: "sa'", es: "atole" } },
    { l: "a'a", desc: "vocal rearticulada: vocal, corte y la misma vocal otra vez", ex: { m: "ka'an", es: "cielo" } },
    {
      l: "'",
      desc: "saltillo: corte breve de la voz; pegado a k, t, p, ch o ts forma una consonante glotalizada",
      ex: { m: "che'", es: "árbol; madera, palo" }
    },
    {
      l: "b",
      desc: "parecida a la b del español; los lingüistas la describen como implosiva («hacia adentro»)",
      ex: { m: "bej", es: "camino, sendero" }
    },
    { l: "ch", desc: "como en español", ex: { m: "chak", es: "rojo" } },
    { l: "ch'", desc: "ch glotalizada: sale con un golpe de garganta", ex: { m: "ch'íich'", es: "pájaro, ave" } },
    { l: "j", desc: "j suave: un soplo, como la h del inglés «hello»", ex: { m: "ja'", es: "agua" } },
    { l: "k", desc: "como la c de «casa»; nunca se escribe c ni q", ex: { m: "kaan", es: "serpiente, víbora" } },
    { l: "k'", desc: "k glotalizada: una k seca, con golpe de garganta", ex: { m: "k'áak'", es: "fuego, lumbre" } },
    { l: "l", desc: "como en español", ex: { m: "lu'um", es: "tierra, suelo" } },
    { l: "m", desc: "como en español", ex: { m: "máak", es: "persona" } },
    { l: "n", desc: "como en español", ex: { m: "naj", es: "casa" } },
    { l: "p", desc: "como en español", ex: { m: "peek'", es: "perro" } },
    { l: "p'", desc: "p glotalizada: con golpe de garganta", ex: { m: "p'aak", es: "tomate, jitomate" } },
    {
      l: "r",
      desc: "suave, como en «pera»; poco frecuente: va en medio de palabra o en préstamos",
      ex: { m: "turix", es: "libélula" }
    },
    { l: "s", desc: "como en español", ex: { m: "sak", es: "blanco" } },
    { l: "t", desc: "como en español", ex: { m: "tuunich", es: "piedra" } },
    { l: "t'", desc: "t glotalizada: con golpe de garganta", ex: { m: "t'aan", es: "palabra, lengua; hablar" } },
    { l: "ts", desc: "como la tz de «quetzal»: un solo sonido", ex: { m: "tsíimin", es: "caballo" } },
    { l: "ts'", desc: "ts glotalizada: con golpe de garganta", ex: { m: "ts'ono'ot", es: "cenote" } },
    { l: "w", desc: "como la u de «huevo»", ex: { m: "waaj", es: "tortilla; pan" } },
    {
      l: "x",
      desc: "siempre suena sh, como en inglés «she»; nunca como en «taxi»",
      ex: { m: "xiib", es: "hombre, varón" }
    },
    { l: "y", desc: "como la y de «yo»", ex: { m: "ya'", es: "zapote" } },
    { l: "c q v z", desc: "no se usan en palabras mayas; d, f, g y rr solo aparecen en préstamos" }
  ]
};
