/* Unidad 4 · Números. Solo formas con estado «verificado» (conf alta) o «probable» (conf media) en la base y en la reverificación. */
(window.COURSE = window.COURSE || { units: [] }).units.push({
  id: "u4",
  n: 4,
  title: "Números",
  subtitle: "Del 1 al 20, contar cosas, personas y plantas, y preguntar cuántos",
  sources: [
    { title: "UADY – Curso de maya yucateco, lección 5.6 (números con -p'éel; uklahun)", url: "https://www.mayas.uady.mx/curso_maya/lec5_6.html" },
    { title: "Omniglot – Numbers in Yucatec Maya", url: "https://www.omniglot.com/language/numbers/yucatecmaya.htm" },
    { title: "Mújica (1995), Junp'iit Maaya – A little bit of Maya (sitio de Christian Lehmann)", url: "https://www.christianlehmann.eu/ling/sprachen/maya/textos/hunp'iit_maaya.html" },
    { title: "Manuel Andrade, A grammar of modern Yucatec Maya (edición de Lehmann)", url: "https://www.christianlehmann.eu/ling/sprachen/maya/andrade/andrade_edit.php" },
    { title: "Blaha Pfeiler y Skopeteas (2024), Numeral classifiers in Yucatec Maya, Journal of Historical Syntax", url: "https://historicalsyntax.org/hs/index.php/hs/article/view/219" },
    { title: "Christian Lehmann, Numeral classifiers (-kúul, -wáal, -ts'íit)", url: "https://www.christianlehmann.eu/publ/num_class.pdf" },
    { title: "Estudios de Lingüística Aplicada (UNAM), la cuantificación en maya yucateco (ka'atúul peek')", url: "https://ela.enallt.unam.mx/index.php/ela/article/download/201/187" },
    { title: "Bolles y Bolles, A Grammar of the Yucatecan Mayan Language, sección 11 (FAMSI): ¿cuántos?", url: "https://www.famsi.org/research/bolles/grammar/section11.htm" },
    { title: "Blair y Vermont-Salas, Spoken Yucatec Maya (edición de Lehmann): -téen", url: "https://www.christianlehmann.eu/ling/sprachen/maya/textos/bvs_1-18.html" },
    { title: "UADY – Diccionario español-maya, letra A (junp'éel, juntúul en ejemplos)", url: "https://www.mayas.uady.mx/diccionario/a_esp.html" },
    { title: "UADY – Diccionario maya, letra K (ka', kan)", url: "https://www.mayas.uady.mx/diccionario/k_maya.html" },
    { title: "UADY – Diccionario maya, letra K' (k'aal, «cerrar», homógrafo del 20)", url: "https://www.mayas.uady.mx/diccionario/k_glotal_maya.html" },
    { title: "UADY – Diccionario maya, letra O (óox)", url: "https://www.mayas.uady.mx/diccionario/o_maya.html" },
    { title: "UADY – Diccionario maya, letra Y (yáax)", url: "https://www.mayas.uady.mx/diccionario/y_maya.html" },
    { title: "UADY – Diccionario maya, letra B (ba'al)", url: "https://www.mayas.uady.mx/diccionario/b_maya.html" },
    { title: "UADY – Diccionario maya, letra N (naj)", url: "https://www.mayas.uady.mx/diccionario/n_maya.html" },
    { title: "UADY – Diccionario maya, letra M (máak)", url: "https://www.mayas.uady.mx/diccionario/m_maya.html" },
    { title: "INALI – Normas de escritura para la lengua maya (2014), PDF", url: "https://site.inali.gob.mx/pdf/norma_maya.pdf" },
    { title: "Normas de escritura para la lengua maya: ka'ap'éel" },
    { title: "Uth y Gutiérrez Bravo (2018), el plural en maya yucateco (Redalyc)", url: "https://www.redalyc.org/journal/5259/525957259005/525957259005.pdf" },
    { title: "Numerales y clasificadores (material docente)" },
    { title: "La cuantificación actual en el maya yucateco (blog Los Ocelotes)", url: "https://losocelotesproyectotemasdelinguistica.wordpress.com/2021/06/09/la-cuantificacion-actual-en-el-maya-yucateco/" },
    { title: "Wiktionary – lahun, buluk (maya yucateco)", url: "https://en.wiktionary.org/wiki/buluk" },
    { title: "PorEsto – ¿Cómo saludar y despedir en maya? (jump'éel ma'alob k'iin)", url: "https://www.poresto.com/yucatan/2024/1/8/como-saludar-despedir-en-maya.html" },
    { title: "Diccionario Maya Popular (ka'atéen, tu ka'atéen)" },
    { title: "Diccionario de uso del maya yucateco (juntúul)", url: "https://www.academia.edu/142986420/Diccionario_de_uso_del_maya_yucateco" },
    { title: "Yoshida, Guía gramatical de la lengua maya yucateca para hispanohablantes" },
    { title: "parryc – Yucatec Maya (ya'ab máak, yanchaj)", url: "https://parryc.com/language/yucatec-maya" },
    { title: "La Lengua Maya de Yucatán – Frases básicas (ya'ab, junp'íit)", url: "https://sites.google.com/site/lalenguamayadeyucatan/frases-basicas" },
    { title: "UADY – Diccionario maya, letra J (ja'ab, año)", url: "https://www.mayas.uady.mx/diccionario/j_maya.html" },
    { title: "UADY – Diccionario español-maya, letra P (porción: p'íit)", url: "https://www.mayas.uady.mx/diccionario/p_esp.html" }
  ],
  lessons: [
    {
      id: "u4l1",
      title: "Del 1 al 10",
      goal: "Al terminar podrás contar del 1 al 10 en maya y no confundir los números con palabras parecidas.",
      teach: [
        {
          kind: "table",
          title: "Del 1 al 10",
          head: ["Número", "Maya", "Se dice aprox."],
          rows: [
            ["1", "jun", "jun"],
            ["2", "ka'", "ka- (con corte de voz al final)"],
            ["3", "óox", "óosh (o larga, tono alto)"],
            ["4", "kan", "kan"],
            ["5", "jo'", "jo- (j suave, corte de voz al final)"],
            ["6", "wak", "wak"],
            ["7", "uk", "uk"],
            ["8", "waxak", "washak"],
            ["9", "bolon", "bolon"],
            ["10", "lajun", "lajun (j suave)"]
          ]
        },
        {
          kind: "warn",
          title: "Casi iguales, pero no",
          html: "Un solo rasgo cambia la palabra: <span class=\"m\">kan</span> es «cuatro», <span class=\"m\">kaan</span> (vocal larga) es «serpiente» y <span class=\"m\">ka'an</span> (con corte en medio) es «cielo».<br>El siete, <span class=\"m\">uk</span>, lleva k simple: <span class=\"m\">uk'</span>, con k glotalizada, es «beber».<br>Y «primero» es <span class=\"m\">yáax</span>, con vocal larga y tono alto; no es <span class=\"m\">ya'ax</span>, «verde»."
        },
        {
          kind: "culture",
          title: "Contar en maya hoy",
          html: "Varias fuentes (la gramática de Andrade, el manual Junp'iit Maaya y Omniglot) coinciden en que hoy muchos hablantes cuentan en maya los primeros números y, a partir del 4 o del 5, siguen en español. Los números mayores existen y están bien documentados, pero no son de uso diario: apréndelos, y no te extrañe oír «cinco» o «diez» en una conversación en maya.<br>Un dato más: <span class=\"m\">óox</span> es «tres» y también el nombre del <b>ramón</b>, un árbol nativo de la península."
        },
        {
          kind: "tip",
          title: "Grafías que vas a encontrar",
          html: "En la columna «se dice aprox.», el guion (-) marca el corte de voz.<br>En textos antiguos la j se escribía h: <span class=\"m\">lahun</span> por <span class=\"m\">lajun</span>. Y algunas fuentes escriben <span class=\"m\">jo'o</span> por <span class=\"m\">jo'</span>. Aquí seguimos las Normas de escritura de 2014 y el curso de la UADY."
        }
      ],
      vocab: [
        { id: "u4-jun", m: "jun", es: "uno (1)", pr: "jun", note: "Vocal corta, sin tono. Con clasificador: junp'éel (una cosa), juntúul (una persona); lo verás en la lección siguiente.", conf: "alta" },
        { id: "u4-ka", m: "ka'", es: "dos (2)", pr: "ka-", alt: ["ka'a"], note: "Termina en vocal con corte de voz. Muchos cursos escriben ka'a para el número suelto. Si se le pega algo, se vuelve ka'a-: ka'ap'éel.", ex: { m: "ka'ap'éel", es: "dos (cosas)" }, conf: "alta" },
        { id: "u4-oox", m: "óox", es: "tres (3)", pr: "óosh", note: "Vocal larga con tono alto; la x suena «sh». También es el nombre del ramón, un árbol.", conf: "alta" },
        { id: "u4-kan", m: "kan", es: "cuatro (4)", pr: "kan", note: "Vocal corta. No lo confundas con kaan (serpiente) ni con ka'an (cielo).", conf: "alta" },
        { id: "u4-jo", m: "jo'", es: "cinco (5)", pr: "jo-", note: "Termina con corte de voz, como ka'. Si se le pega algo, la vocal se repite: jo'olajun (15). Se escribe igual que Jo', el nombre maya de Mérida.", conf: "alta" },
        { id: "u4-wak", m: "wak", es: "seis (6)", pr: "wak", note: "Vocal corta. Con clasificador: wakp'éel, seis (cosas).", conf: "alta" },
        { id: "u4-uk", m: "uk", es: "siete (7)", pr: "uk", note: "Con k simple. No lo confundas con uk', «beber», que lleva k glotalizada.", conf: "alta" },
        { id: "u4-waxak", m: "waxak", es: "ocho (8)", pr: "washak", note: "La x suena «sh».", conf: "alta" },
        { id: "u4-bolon", m: "bolon", es: "nueve (9)", pr: "bolon", conf: "alta" },
        { id: "u4-lajun", m: "lajun", es: "diez (10)", pr: "lajun", note: "La j suena suave, como una h aspirada. En textos antiguos: lahun. Es la base del 13 al 19.", conf: "alta" }
      ],
      exercises: [
        { type: "choice", q: "¿Qué número es?", prompt: "waxak", promptLang: "m", answer: "ocho", options: ["ocho", "seis", "nueve"] },
        { type: "choice", q: "¿Cuál significa «cuatro»?", prompt: "cuatro", promptLang: "es", answer: "kan", options: ["kan", "kaan", "ka'an"] },
        { type: "build", es: "uno, dos, tres, cuatro, cinco", m: "jun, ka', óox, kan, jo'", distractors: ["kaan", "uk"] },
        { type: "fill", es: "seis, siete, ocho", before: "wak, uk,", after: "", answer: "waxak", options: ["waxak", "bolon", "lajun"] },
        { type: "choice", q: "¿Cómo se dice «siete»?", prompt: "siete", promptLang: "es", answer: "uk", options: ["uk", "uk'", "wak"] },
        { type: "type", q: "Escribe en maya", prompt: "diez", answer: "lajun" },
        { type: "choice", q: "¿Qué número es?", prompt: "bolon", promptLang: "m", answer: "nueve", options: ["nueve", "diez", "siete"] },
        { type: "fill", es: "cuatro, cinco, seis", before: "kan, jo',", after: "", answer: "wak", options: ["wak", "uk", "waxak"] }
      ]
    },
    {
      id: "u4l2",
      title: "Contar: -p'éel, -túul y -kúul",
      goal: "Al terminar podrás contar cosas con -p'éel, personas y animales con -túul y plantas con -kúul, y usar junp'éel como «un, una».",
      teach: [
        {
          kind: "text",
          title: "Número + clasificador",
          html: "Para contar en maya, al número se le pega un <b>clasificador</b> que dice qué tipo de cosa cuentas. Se parece a decir en español «dos <i>piezas</i> de pan» o «tres <i>cabezas</i> de ganado», solo que en maya es la manera normal de contar. Primero va el número con su clasificador y después lo que cuentas:<br><span class=\"m\">-p'éel</span> para cosas: <span class=\"m\">ka'ap'éel naj</span>, dos casas.<br><span class=\"m\">-túul</span> para personas y animales: <span class=\"m\">ka'atúul peek'</span>, dos perros.<br><span class=\"m\">-kúul</span> para plantas sembradas y árboles."
        },
        {
          kind: "table",
          title: "Tres clasificadores",
          head: ["Maya", "Se usa para", "Español"],
          rows: [
            ["junp'éel", "cosas", "una cosa"],
            ["ka'ap'éel", "cosas", "dos cosas"],
            ["óoxp'éel", "cosas", "tres cosas"],
            ["kanp'éel", "cosas", "cuatro cosas"],
            ["juntúul", "personas y animales", "una persona, un animal"],
            ["ka'atúul", "personas y animales", "dos personas o animales"],
            ["óoxtúul", "personas y animales", "tres personas o animales"],
            ["junkúul", "plantas y árboles", "una planta, un árbol"]
          ]
        },
        {
          kind: "tip",
          title: "Dos detalles al escribir",
          html: "<b>1.</b> La vocal con corte solo va al final de la palabra; si se le pega algo, se repite la vocal: <span class=\"m\">ka'</span> → <span class=\"m\">ka'ap'éel</span> (lo dicen las Normas de escritura). Por la misma regla, cinco cosas sería <span class=\"m\">jo'op'éel</span> (por confirmar).<br><b>2.</b> El diccionario y el curso de la UADY escriben la n tal cual: <span class=\"m\">junp'éel</span>, <span class=\"m\">kanp'éel</span>. Al hablar suena como m, y algunas fuentes lo escriben así: <span class=\"m\">jump'éel</span>, <span class=\"m\">kamp'éel</span>. Al escribir, la app acepta las dos."
        },
        {
          kind: "text",
          title: "Junp'éel también es «un, una»",
          html: "Además de contar, <span class=\"m\">junp'éel</span> funciona como artículo: <span class=\"m\">junp'éel ma'alob k'iin</span>, «un buen día».<br>Hay más clasificadores: <span class=\"m\">-wáal</span> para hojas y cosas planas, y <span class=\"m\">-ts'íit</span> para cosas largas y delgadas, como velas o palos. En el habla de hoy <span class=\"m\">-p'éel</span> les gana terreno a los demás: un estudio reciente registra <span class=\"m\">junp'éel k'éek'en</span>, «un cerdo», donde antes se decía <span class=\"m\">juntúul k'éek'en</span>. En los ejercicios usamos <span class=\"m\">-túul</span> para personas y animales, como lo dan las gramáticas."
        }
      ],
      vocab: [
        { id: "u4-jumpeel", m: "junp'éel", es: "uno, una (cosa); un, una", pr: "junp'éel (suena «jump'éel»)", alt: ["jump'éel"], note: "jun + -p'éel. También sirve como artículo «un, una». Algunas fuentes escriben jump'éel, como suena.", ex: { m: "junp'éel ma'alob k'iin", es: "un buen día" }, conf: "alta" },
        { id: "u4-kaapeel", m: "ka'ap'éel", es: "dos (cosas)", pr: "ka-ap'éel", note: "La vocal con corte de ka' se vuelve rearticulada: ka'a-.", conf: "alta" },
        { id: "u4-ooxpeel", m: "óoxp'éel", es: "tres (cosas)", pr: "óoshp'éel", note: "óox + -p'éel, tal como lo escribe el curso de la UADY.", conf: "alta" },
        { id: "u4-kampeel", m: "kanp'éel", es: "cuatro (cosas)", pr: "kanp'éel (suena «kamp'éel»)", alt: ["kamp'éel"], note: "kan + -p'éel. Así lo escribe la UADY; otras fuentes escriben kamp'éel.", conf: "alta" },
        { id: "u4-jopeel", m: "jo'op'éel", es: "cinco (cosas)", pr: "jo-op'éel", note: "jo' + -p'éel, con la vocal repetida que piden las Normas. Por confirmar: el curso de la UADY, anterior a 2014, escribe ho'p'éel.", conf: "media" },
        { id: "u4-baal", m: "ba'al", es: "cosa", pr: "ba-al", note: "De aquí viene mixba'al, «nada».", conf: "alta" },
        { id: "u4-maak", m: "máak", es: "persona, gente", pr: "máak", note: "Vocal larga con tono alto. De aquí viene mixmáak, «nadie».", conf: "alta" },
        { id: "u4-juntuul", m: "juntúul", es: "uno, una (persona o animal)", pr: "juntúul", note: "jun + -túul. Ante t, la n se queda igual.", ex: { m: "juntúul peek'", es: "un perro" }, conf: "alta" },
        { id: "u4-kaatuul", m: "ka'atúul", es: "dos (personas o animales)", pr: "ka-atúul", note: "ka'a- + -túul.", ex: { m: "ka'atúul peek'", es: "dos perros" }, conf: "alta" },
        { id: "u4-ooxtuul", m: "óoxtúul", es: "tres (personas o animales)", pr: "óoshtúul", note: "óox + -túul.", conf: "alta" },
        { id: "u4-junkuul", m: "junkúul", es: "uno, una (planta o árbol)", pr: "junkúul", note: "jun + -kúul, el clasificador de plantas sembradas y árboles. El clasificador está confirmado; esta forma se arma por regla, como juntúul, y queda por confirmar.", ex: { m: "junkúul che'", es: "un árbol" }, conf: "media" }
      ],
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "ka'ap'éel", promptLang: "m", answer: "dos (cosas)", options: ["dos (cosas)", "dos (personas)", "dos veces"] },
        { type: "fill", es: "tres casas", before: "", after: "naj", answer: "óoxp'éel", options: ["óoxp'éel", "óoxtúul", "óox"] },
        { type: "build", es: "cuatro cosas", m: "kanp'éel ba'al", distractors: ["kan", "juntúul"] },
        { type: "type", q: "Escribe en maya", prompt: "una casa", answer: "junp'éel naj", alt: ["jump'éel naj"] },
        { type: "choice", q: "¿Cómo se dice «dos personas»?", prompt: "dos personas", promptLang: "es", answer: "ka'atúul máak", options: ["ka'atúul máak", "ka'atéen máak", "óoxtúul máak"] },
        { type: "fill", es: "un perro", before: "", after: "peek'", answer: "juntúul", options: ["juntúul", "junkúul", "óoxtúul"] },
        { type: "fill", es: "tres personas", before: "", after: "máak", answer: "óoxtúul", options: ["óoxtúul", "óox", "ka'atúul"] },
        { type: "choice", q: "¿Qué significa?", prompt: "junkúul che'", promptLang: "m", answer: "un árbol", options: ["un árbol", "un perro", "una casa"] }
      ]
    },
    {
      id: "u4l3",
      title: "Del 11 al 20: contar por veintenas",
      goal: "Al terminar podrás contar del 11 al 20 y entender cómo el maya cuenta de veinte en veinte.",
      teach: [
        {
          kind: "text",
          title: "Del 13 al 19: número + lajun",
          html: "Del 13 al 19 la regla es sencilla: unidad + <span class=\"m\">lajun</span> (diez). <span class=\"m\">óox</span> + <span class=\"m\">lajun</span> = <span class=\"m\">óoxlajun</span>, trece; <span class=\"m\">kan</span> + <span class=\"m\">lajun</span> = <span class=\"m\">kanlajun</span>, catorce.<br>Dos detalles: el 11 tiene nombre propio, <span class=\"m\">buluk</span>, y en el 12 y el 15 la vocal con corte se repite, como siempre que se le pega algo: <span class=\"m\">ka'alajun</span>, <span class=\"m\">jo'olajun</span>."
        },
        {
          kind: "table",
          title: "Del 11 al 20",
          head: ["Número", "Maya", "Se forma con"],
          rows: [
            ["11", "buluk", "palabra propia"],
            ["12", "ka'alajun", "ka' + lajun"],
            ["13", "óoxlajun", "óox + lajun"],
            ["14", "kanlajun", "kan + lajun"],
            ["15", "jo'olajun", "jo' + lajun"],
            ["16", "waklajun", "wak + lajun"],
            ["17", "uklajun", "uk + lajun"],
            ["18", "waxaklajun", "waxak + lajun"],
            ["19", "bolonlajun", "bolon + lajun"],
            ["20", "k'aal", "una veintena"]
          ]
        },
        {
          kind: "culture",
          title: "De veinte en veinte",
          html: "El maya cuenta por veintenas: es un sistema <b>vigesimal</b>. <span class=\"m\">k'aal</span> es «veinte, una veintena», y las veintenas se cuentan con números: <span class=\"m\">junk'aal</span>, una veintena (20); <span class=\"m\">ka'ak'aal</span>, dos veintenas (40). Así, el 40 no es «cuatro dieces» sino «dos veintes». Una fuente registra incluso el 21 como «uno hacia la segunda veintena».<br><span class=\"m\">junk'aal</span> y <span class=\"m\">ka'ak'aal</span> los da una sola fuente: quedan por confirmar."
        },
        {
          kind: "warn",
          title: "Es k'aal, con tono bajo",
          html: "Algunos materiales escriben <span class=\"m\">k'áal</span>, con tono alto, pero las fuentes que marcan el tono (el curso de la UADY y Omniglot) dan tono bajo: <span class=\"m\">k'aal</span>, con la a larga y pareja.<br>La misma forma es también otra palabra: <span class=\"m\">k'aal</span>, «cerrar, encerrar». El contexto decide."
        }
      ],
      vocab: [
        { id: "u4-buluk", m: "buluk", es: "once (11)", pr: "buluk", note: "Palabra propia: no sigue la regla de lajun.", conf: "alta" },
        { id: "u4-kaalajun", m: "ka'alajun", es: "doce (12)", pr: "ka-alajun", note: "ka' + lajun: la vocal con corte se repite, como en ka'ap'éel.", conf: "alta" },
        { id: "u4-ooxlajun", m: "óoxlajun", es: "trece (13)", pr: "óoshlajun", note: "óox + lajun.", conf: "alta" },
        { id: "u4-kanlajun", m: "kanlajun", es: "catorce (14)", pr: "kanlajun", note: "kan + lajun.", conf: "alta" },
        { id: "u4-joolajun", m: "jo'olajun", es: "quince (15)", pr: "jo-olajun", note: "jo' + lajun, con la vocal repetida: jo'o-.", conf: "alta" },
        { id: "u4-waklajun", m: "waklajun", es: "dieciséis (16)", pr: "waklajun", note: "wak + lajun.", conf: "alta" },
        { id: "u4-uklajun", m: "uklajun", es: "diecisiete (17)", pr: "uklajun", note: "uk + lajun. El curso de la UADY lo escribe uklahun, con la h de la grafía anterior a 2014; Omniglot da u'uklajun o wuklajun.", conf: "alta" },
        { id: "u4-waxaklajun", m: "waxaklajun", es: "dieciocho (18)", pr: "washaklajun", note: "waxak + lajun.", conf: "alta" },
        { id: "u4-bolonlajun", m: "bolonlajun", es: "diecinueve (19)", pr: "bolonlajun", note: "bolon + lajun.", conf: "alta" },
        { id: "u4-kaal", m: "k'aal", es: "veinte; una veintena (20)", pr: "k'aal (a larga, tono bajo)", note: "Con tono bajo: k'aal, no k'áal. Es la base para contar de veinte en veinte.", conf: "alta" },
        { id: "u4-junkaal", m: "junk'aal", es: "veinte (lit. una veintena)", pr: "junk'aal", note: "jun + k'aal. Una sola fuente lo da, en una palabra; por confirmar si se escribe junto o separado.", conf: "media" },
        { id: "u4-kaakaal", m: "ka'ak'aal", es: "cuarenta (lit. dos veintenas)", pr: "ka-ak'aal", note: "ka' + k'aal, con la vocal repetida. Una sola fuente; por confirmar.", conf: "media" }
      ],
      exercises: [
        { type: "choice", q: "¿Qué número es?", prompt: "óoxlajun", promptLang: "m", answer: "trece", options: ["trece", "tres", "treinta"] },
        { type: "build", es: "once, doce, trece", m: "buluk, ka'alajun, óoxlajun", distractors: ["lajun", "kanlajun"] },
        { type: "fill", es: "catorce, quince", before: "kanlajun,", after: "", answer: "jo'olajun", options: ["jo'olajun", "jo'lajun", "waklajun"] },
        { type: "choice", q: "¿Cómo se dice «doce»?", prompt: "doce", promptLang: "es", answer: "ka'alajun", options: ["ka'alajun", "ka'lajun", "buluk"] },
        { type: "type", q: "Escribe en maya", prompt: "veinte (una veintena)", answer: "k'aal", alt: ["junk'aal"] },
        { type: "fill", es: "dieciocho, diecinueve", before: "waxaklajun,", after: "", answer: "bolonlajun", options: ["bolonlajun", "bolon", "buluk"] },
        { type: "choice", q: "¿Qué significa?", prompt: "ka'ak'aal", promptLang: "m", answer: "cuarenta (dos veintenas)", options: ["cuarenta (dos veintenas)", "veintidós", "doce"] },
        { type: "type", q: "Escribe en maya", prompt: "dieciséis", answer: "waklajun" }
      ]
    },
    {
      id: "u4l4",
      title: "¿Cuántos? Edad, veces y cantidad",
      goal: "Al terminar podrás preguntar cuántos hay, preguntar la edad, decir «dos veces» y «otra vez», y hablar de mucho y poco.",
      teach: [
        {
          kind: "text",
          title: "¿Cuántos?: jay + clasificador",
          html: "Para preguntar «¿cuántos?» se usa <span class=\"m\">jay-</span>, que nunca va solo: lleva el clasificador de lo que cuentas. <span class=\"m\">Jayp'éel?</span> para cosas y <span class=\"m\">Jaytúul?</span> para personas y animales.<br>La respuesta usa el mismo clasificador: si te preguntan <span class=\"m\">Jaytúul?</span>, contestas con <span class=\"m\">-túul</span>: <span class=\"m\">ka'atúul</span>, dos."
        },
        {
          kind: "text",
          title: "¿Cuántos años tienes?",
          html: "<span class=\"m\">Jayp'éel ja'ab yaan teech?</span> Literalmente: «¿cuántos años hay contigo?». Lleva <span class=\"m\">ja'ab</span>, «año», y <span class=\"m\">yaan teech</span>, «tienes», como en <span class=\"m\">yaan teen</span>, «tengo».<br>Como muchos hablantes cuentan en español a partir del 4 o del 5, no te extrañe que la respuesta llegue con números del español."
        },
        {
          kind: "text",
          title: "Las veces: -téen",
          html: "Para contar veces se usa <span class=\"m\">-téen</span>: <span class=\"m\">ka'atéen</span> es «dos veces» o «por segunda vez». Con <span class=\"m\">tu</span> delante, <span class=\"m\">tu ka'atéen</span> significa «otra vez, de nuevo»: muy útil para pedir que te repitan algo."
        },
        {
          kind: "tip",
          title: "Mucho, poco y el plural",
          html: "<span class=\"m\">ya'ab</span> es «mucho»: <span class=\"m\">ya'ab máak</span>, mucha gente. <span class=\"m\">junp'íit</span> es «un poco»; también se escribe <span class=\"m\">jump'íit</span>.<br>Después de un número no hace falta el plural <span class=\"m\">-o'ob</span>, que en maya es opcional: <span class=\"m\">ka'atúul peek'</span> ya es «dos perros»."
        }
      ],
      vocab: [
        { id: "u4-jaypeel", m: "Jayp'éel?", es: "¿Cuántos? (cosas)", pr: "jayp'éel", note: "jay- (¿cuánto?) + -p'éel. jay- nunca va solo.", conf: "alta" },
        { id: "u4-jaytuul", m: "Jaytúul?", es: "¿Cuántos? (personas o animales)", pr: "jaytúul", note: "jay- + -túul.", conf: "alta" },
        { id: "u4-jaypeel-jaab", m: "Jayp'éel ja'ab yaan teech?", es: "¿Cuántos años tienes?", pr: "jayp'éel ja-ab yaan teech", note: "Lit. «¿cuántos años hay contigo?». ja'ab, «año», está confirmado en el diccionario de la UADY, pero la frase completa la da una sola fuente (el manual Junp'iit Maaya): por confirmar.", conf: "media" },
        { id: "u4-kaateen", m: "ka'atéen", es: "dos veces; por segunda vez", pr: "ka-atéen", note: "ka'a- + -téen (vez).", conf: "alta" },
        { id: "u4-tu-kaateen", m: "tu ka'atéen", es: "otra vez, de nuevo", pr: "tu ka-atéen", note: "Lit. «por segunda vez». Sirve para pedir que te repitan algo.", conf: "alta" },
        { id: "u4-yaab", m: "ya'ab", es: "mucho, muchos", pr: "ya-ab", note: "Va antes del sustantivo. Con jach se refuerza: jach ya'ab, muchísimo.", ex: { m: "ya'ab máak", es: "mucha gente" }, conf: "alta" },
        { id: "u4-yaan-yaab-maak", m: "Yaan ya'ab máak.", es: "Hay mucha gente.", pr: "yaan ya-ab máak", note: "yaan (hay) + ya'ab (mucho) + máak (gente). Las fuentes registran el pasado: Yanchaj ya'ab máak, «hubo mucha gente».", conf: "media" },
        { id: "u4-jumpiit", m: "junp'íit", es: "un poco, un poquito", pr: "junp'íit (suena «jump'íit»)", alt: ["jump'íit"], note: "jun + p'íit, con el tono alto que da la UADY para p'íit. Con n, como en el título del manual Junp'iit Maaya, «un poquito de maya» (Mújica 1995); otras fuentes escriben jump'íit.", ex: { m: "Chéen junp'íit.", es: "Solo un poco." }, conf: "alta" }
      ],
      exercises: [
        { type: "choice", q: "¿Cómo preguntas cuántas personas hay?", prompt: "¿Cuántos? (personas)", promptLang: "es", answer: "Jaytúul?", options: ["Jaytúul?", "Bix?", "Ka'atúul?"] },
        { type: "fill", es: "¿Cuántos perros?", before: "", after: "peek'?", answer: "Jaytúul", options: ["Jaytúul", "Juntúul", "Ka'atúul"] },
        { type: "fill", es: "¿Cuántas casas?", before: "", after: "naj?", answer: "Jayp'éel", options: ["Jayp'éel", "Jaytúul", "Junp'éel"] },
        { type: "choice", q: "¿Qué significa?", prompt: "Jayp'éel ja'ab yaan teech?", promptLang: "m", answer: "¿Cuántos años tienes?", options: ["¿Cuántos años tienes?", "¿Cuántas casas tienes?", "¿Cómo te llamas?"] },
        { type: "type", q: "Escribe en maya", prompt: "dos veces", answer: "ka'atéen" },
        { type: "choice", q: "Cuidado con la forma: ¿qué significa?", prompt: "ja'ab", promptLang: "m", answer: "año", options: ["año", "agua", "mucho, muchos"] },
        { type: "build", es: "mucha gente", m: "ya'ab máak", distractors: ["junp'íit", "juntúul"] },
        { type: "choice", q: "¿Qué significa?", prompt: "Chéen junp'íit.", promptLang: "m", answer: "Solo un poco.", options: ["Solo un poco.", "Hay mucha gente.", "Otra vez."] }
      ]
    }
  ]
});
