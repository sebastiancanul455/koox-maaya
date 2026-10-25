/* Unidad 9 · Tiempo y cultura. Solo formas con estado «verificado» (conf alta) o «probable» (conf media)
   en la base o en la reverificación (kb/recheck-conversacion-gramatica.json, kb/recheck-naturaleza-cultura.json).
   bejla'e', jo'oljeak, ka'abej y kuxtal quedaron verificadas (kb/recheck3-resto.json). Las reglas de ts'o'ok, bíin y del pasado intransitivo (binen, taalen)
   quedaron verificadas; el resto del pasado y del futuro sigue con conf media. Jarana e hipil son palabras del español:
   no se enseña ninguna forma maya para el hipil (íipil quedó «dudoso»). */
(window.COURSE = window.COURSE || { units: [] }).units.push({
  id: "u9",
  n: 9,
  title: "Tiempo y cultura",
  subtitle: "Hoy, mañana y ayer; el pasado y el futuro; una lengua viva y sus fiestas",
  sources: [
    { title: "UADY – Diccionario maya, letra B (bejla'e')", url: "https://www.mayas.uady.mx/diccionario/b_maya.html" },
    { title: "UADY – Diccionario maya, letra S (sáamal)", url: "https://www.mayas.uady.mx/diccionario/s_maya.html" },
    { title: "UADY – Diccionario maya, letra J (jo'oljeak)", url: "https://www.mayas.uady.mx/diccionario/j_maya.html" },
    { title: "UADY – Diccionario español-maya, letra A (ahora: bejla'e'; ayer: jo'oljeak; noche: áak'ab)", url: "https://www.mayas.uady.mx/diccionario/a_esp.html" },
    { title: "Gran Museo del Mundo Maya de Mérida – Palabras mayas (ka'abej, bejla'e', sáamal)", url: "https://www.granmuseodelmundomaya.com.mx/aprende/palabras-mayas" },
    { title: "UADY, literatura maya – cuento bilingüe maya-español (ka'abeje', pasado mañana)", url: "https://www.mayas.uady.mx/literatura/cuent5.html" },
    { title: "UADY – Diccionario maya, letra K (kuxtal: vida, existencia)", url: "https://www.mayas.uady.mx/diccionario/k_maya.html" },
    { title: "UADY – Curso de maya, lección 4.7 (kuxtal, vivir)", url: "https://www.mayas.uady.mx/curso_maya/lec4_7.html" },
    { title: "Top Yucatán – Frases básicas en maya y español (bejla'e', jo'oljeak)", url: "https://topyucatan.com/notas/the-yucatan-culture/frases-basicas-en-maya-y-espanol" },
    { title: "Spoken Yucatec Maya (Universidad de Chicago) – Intransitive Forms (sáamal in bin)", url: "https://lucy.lib.uchicago.edu/?section=4&uuid=770214c7-0111-4081-a7bf-c2fa91a835ab" },
    { title: "Yoshida, Guía gramatical de la lengua maya yucateca para hispanohablantes (te' súutukila', ts'o'ok)" },
    { title: "PorEsto – ¿Cómo se dice buenos días, tardes y noches en maya? (Ma'alob áak'ab)", url: "https://www.poresto.com/yucatan/2024/1/6/como-se-dice-buenos-dias-tardes-noches-en-maya.html" },
    { title: "INALI – Prontuario de frases de cortesía Maayat'aan (uláak' k'iin, fórmulas de visita)", url: "https://site.inali.gob.mx/Micrositios/Prontuarios/maya.html" },
    { title: "INALI – Prontuario maya (PDF)", url: "https://site.inali.gob.mx/Micrositios/Prontuarios/pdf/p_maya.pdf" },
    { title: "INALI – Prontuario maya-español (2009), PDF alojado por Arqueología Mexicana (Tak ti' uláak' k'iin, Yuum bo'otik taalech…, Ka suunakech…)", url: "https://arqueologiamexicana.mx/sites/default/files/banco_imagenes/prontuario_maya.pdf" },
    { title: "parryc – Yucatec Maya (ts'o'ok in janal, pasado con j-)", url: "https://parryc.com/language/yucatec-maya" },
    { title: "Lehmann, Genesis of auxiliaries in Yucatec Maya (PDF)", url: "https://www.christianlehmann.eu/publ/Genesis_of_auxiliaries_in_Yucatec_Maya.pdf" },
    { title: "Lehmann, Grammaticalization of TAM marking in Yucatec Maya (Language Science Press)", url: "https://langsci-press.org/catalog/view/152/1016/886-1" },
    { title: "Lehmann, Valency in Yucatec Maya (PDF)", url: "https://www.christianlehmann.eu/publ/valency_in_ym.pdf" },
    { title: "Diapositivas «A Yucatec fragment» (HPSG, Universidad de Kentucky): juego B -en, -ech", url: "https://hpsg.uky.edu/sites/default/files/abstracts/yucatec-fragment-slides.pdf" },
    { title: "UADY – Curso de maya, lección 4-I (futuro con bíin)", url: "https://www.mayas.uady.mx/curso_maya/lec4_1.html" },
    { title: "UADY – Curso de maya, lección 7 (pretérito inmediato táant)", url: "https://www.mayas.uady.mx/curso_maya/lec7_3.html" },
    { title: "Las voces de las profecías: expresiones y visiones del futuro en maya yucateco (Trace)", url: "https://trace.org.mx/index.php/trace/article/download/1186/1124/4114" },
    { title: "Vapnarsky (2016), No escape from the future (John Benjamins)", url: "https://benjamins.com/catalog/slcs.172.21vap" },
    { title: "Idioma Maya Yucateco, material de curso (yaan in bin)" },
    { title: "Wiktionary – taal (maya yucateco): taalen", url: "https://en.wiktionary.org/wiki/taal" },
    { title: "Wiktionary – janal (maya yucateco): janen", url: "https://en.wiktionary.org/wiki/janal" },
    { title: "Wiktionary – meyaj (maya yucateco): meyajnajen", url: "https://en.wiktionary.org/wiki/meyaj" },
    { title: "Wiktionary – xok (maya yucateco; cita a Yoshida 2009): tin xokaj", url: "https://en.wiktionary.org/wiki/xok" },
    { title: "INALI – Lengua del mes Maayat'aan (774,755 hablantes)", url: "https://www.inali.gob.mx/detalle/lengua-del-mes-maayataan-maya" },
    { title: "Yucatán Today – Janal Pixan in Yucatán", url: "https://yucatantoday.com/en/blog/janal-pixan-in-yucatan" },
    { title: "UADY – El hanal pixan", url: "https://www.mayas.uady.mx/articulos/pixan2.html" },
    { title: "PorEsto – Guía del Hanal Pixán: cuándo se celebra, cómo se arma el altar y qué comidas se preparan en Yucatán (2025)", url: "https://www.poresto.com/yucatan/2025/10/8/guia-del-hanal-pixan-cuando-se-celebra-como-se-arma-el-altar-y-que-comidas-tradicionales-se-preparan-en-yucatan.html" },
    { title: "UnoTV – Mucbipollo, el platillo del Día de Muertos en Yucatán", url: "https://www.unotv.com/estilo-de-vida/gastronomia/mucbipollo-como-preparar-el-platillo-ancestral-que-da-sabor-al-dia-de-muertos-en-yucatan/" },
    { title: "Americanía (Universidad Pablo de Olavide) – texto en maya sobre la vida y la muerte (kuxtal, kíimil)", url: "https://upo.es/revistas/index.php/americania/article/download/2624/2088/8058" },
    { title: "Wiktionary – kíim (maya yucateco): morir" },
    { title: "Chuchiak, «Yaab Uih Yetel Maya Cimil»: conceptos yucatecos de la muerte (grafía colonial cimil)" },
    { title: "Go Overseas – programa «Ichil le Kuxtal Maya» (kuxtal, vida)", url: "https://www.gooverseas.com/study-abroad/mexico/program/439524" },
    { title: "Wikipedia – Jarana yucateca", url: "https://en.wikipedia.org/wiki/Jarana_yucateca" },
    { title: "Yucatán Today – Yucatecan traditions: vaquería and jarana", url: "https://yucatantoday.com/en/blog/yucatecan-traditions-vaqueria-and-jarana/" },
    { title: "Fashion History Timeline (FIT) – Huipilli / huipil", url: "https://fashionhistory.fitnyc.edu/huipilli-huipil" },
    { title: "EcuRed – Huipil", url: "https://www.ecured.cu/Huipil" },
    { title: "Posta – Día Nacional del Huipil: el origen de la vestimenta yucateca", url: "https://www.posta.com.mx/mexico/dia-nacional-del-huipil-conoce-el-origen-de-la-tradicional-vestimenta-yucateca/vl1551278" },
    { title: "UADY – Curso de maya, lección 3 (hanal, grafía antigua)", url: "https://www.mayas.uady.mx/curso_maya/lec3intro.html" },
    { title: "UADY – Diccionario maya, letra W (wáay)", url: "https://www.mayas.uady.mx/diccionario/w_maya.html" },
    { title: "Aprendiendo Maya – Consonantes (wáay)", url: "https://www.aprendiendomaya.com/escritura/alfabeto-maya" },
    { title: "Aprendiendo Maya – Las vocales y sus reglas de uso (paax)", url: "https://aprendiendomaya.com/escritura/vocales/las-vocales-y-sus-reglas-de-uso" },
    { title: "Pfeiler y Hofling (2006), Apuntes sobre la variación dialectal en el maya yucateco", url: "https://www.scielo.org.mx/scielo.php?script=sci_arttext&pid=S1870-57662006000100002" },
    { title: "UADY – Diccionario español-maya, letra B (bueno, bonito)", url: "https://www.mayas.uady.mx/diccionario/b_esp.html" },
    { title: "UADY – Briceida Cuevas Cob, «In k'aaba'»", url: "https://www.mayas.uady.mx/literatura/poem25.html" },
    { title: "UADY – Diccionario español-maya, letra F (felicidad: ki'imak óolal; feliz: ki'imak óol)", url: "https://www.mayas.uady.mx/diccionario/f_esp.html" },
    { title: "Na'atik Language & Culture Institute – Yucatec Maya Phrases (Ki'imak óolal)", url: "https://naatikmexico.org/blog/yucatec-maya-phrases" },
    { title: "Omniglot – Useful phrases in Yucatec Maya (Ki'imak óolal)", url: "https://www.omniglot.com/language/phrases/yucatec-maya.php" }
  ],
  lessons: [
    {
      id: "u9l1",
      title: "Hoy, mañana, ayer",
      goal: "Al terminar podrás decir hoy, mañana, ayer, pasado mañana y «en este momento», y ubicar una acción en el tiempo.",
      teach: [
        {
          kind: "table",
          title: "Del ayer al pasado mañana",
          head: ["Español", "Maya"],
          rows: [
            ["ayer", "jo'oljeak"],
            ["hoy, ahora", "bejla'e'"],
            ["mañana", "sáamal"],
            ["pasado mañana", "ka'abej"],
            ["en este momento", "te' súutukila'"]
          ]
        },
        {
          kind: "text",
          title: "Dónde van",
          html: "Las palabras de tiempo suelen ir al inicio o al final de la frase: <span class=\"m\">Sáamal in bin</span>, «mañana voy». Ya conocías <span class=\"m\">sáamal</span> por <span class=\"m\">Tak sáamal</span>, «hasta mañana».<br>Fíjate en los finales: <span class=\"m\">bejla'e'</span> termina en -e', igual que <span class=\"m\">waye'</span> («aquí»), y <span class=\"m\">te' súutukila'</span> en -a'."
        },
        {
          kind: "tip",
          title: "El verbo mira la acción, no el reloj",
          html: "El verbo maya no marca el tiempo como el español: marca si la acción es costumbre, si está en curso o si ya terminó (lo verás en la siguiente lección). Por eso las palabras de tiempo ayudan tanto a ubicarla.<br><span class=\"m\">sáamal</span>, <span class=\"m\">bejla'e'</span>, <span class=\"m\">jo'oljeak</span> y <span class=\"m\">ka'abej</span> están confirmadas: las tres primeras, en el diccionario de la UADY, y <span class=\"m\">ka'abej</span>, en el Gran Museo del Mundo Maya y en un cuento bilingüe publicado por la UADY. <span class=\"m\">te' súutukila'</span> sigue «por confirmar»."
        },
        {
          kind: "text",
          title: "Día y noche",
          html: "<span class=\"m\">k'iin</span> es el sol y el día, y <span class=\"m\">áak'ab</span> es la noche. <span class=\"m\">Ma'alob áak'ab</span>, «buenas noches», es un calco del español, como <span class=\"m\">Ma'alob k'iin</span>.<br>Con <span class=\"m\">uláak'</span> (otro) se dice <span class=\"m\">uláak' k'iin</span>, «otro día», como en la despedida <span class=\"m\">Tak ti' uláak' k'iin</span>."
        }
      ],
      vocab: [
        { id: "u9-bejlae", m: "bejla'e'", es: "hoy; ahora", pr: "bejla-e-", note: "Suele ir al inicio o al final de la frase. La UADY la da para «hoy» y para «ahora».", conf: "alta" },
        { id: "u9-saamal", m: "sáamal", es: "mañana (el día siguiente)", pr: "sáamal", note: "Tono alto. Ya la usaste en Tak sáamal, «hasta mañana».", conf: "alta" },
        { id: "u9-jooljeak", m: "jo'oljeak", es: "ayer", pr: "jo-oljeak", note: "Así la da el diccionario de la UADY.", conf: "alta" },
        { id: "u9-kaabej", m: "ka'abej", es: "pasado mañana", pr: "ka-abej", note: "Con la terminación de tema -e' queda ka'abeje', como en un cuento bilingüe de la UADY.", conf: "alta" },
        { id: "u9-te-suutukila", m: "te' súutukila'", es: "en este momento; ahorita; ahora", pr: "te- súutukila-", note: "Expresión fija; termina en -a', «este».", conf: "media" },
        { id: "u9-aakab", m: "áak'ab", es: "noche", pr: "áak'ab", note: "Tono alto.", conf: "alta" },
        { id: "u9-ulaak", m: "uláak'", es: "otro, otra", pr: "uláak'", note: "Va antes del sustantivo: uláak' k'iin, otro día. Así la escribe el INALI; el tono todavía no está confirmado en el diccionario.", ex: { m: "Tak ti' uláak' k'iin.", es: "Hasta otro día." }, conf: "media" },
        { id: "u9-saamal-in-bin", m: "Sáamal in bin.", es: "Mañana voy.", pr: "sáamal in bin", note: "En este ejemplo (curso de la Universidad de Chicago), con sáamal al inicio el verbo aparece sin k-.", conf: "media" },
        { id: "u9-ma-tin-meyaj-te-suutukila", m: "Ma' tin meyaj te' súutukila'.", es: "No estoy trabajando en este momento.", pr: "ma- tin meyaj te- súutukila-", conf: "media" }
      ],
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "jo'oljeak", promptLang: "m", answer: "ayer", options: ["ayer", "mañana", "hoy"] },
        { type: "choice", q: "¿Qué significa?", prompt: "bejla'e'", promptLang: "m", answer: "hoy; ahora", options: ["hoy; ahora", "mañana", "pasado mañana"] },
        { type: "choice", q: "¿Qué significa?", prompt: "Sáamal in bin.", promptLang: "m", answer: "Mañana voy.", options: ["Mañana voy.", "Ayer fui.", "Tengo que ir."] },
        { type: "choice", q: "¿Qué significa?", prompt: "Ma' tin meyaj te' súutukila'.", promptLang: "m", answer: "No estoy trabajando en este momento.", options: ["No estoy trabajando en este momento.", "Trabajo todos los días.", "Ya trabajé hoy."] },
        { type: "type", q: "Escribe en maya", prompt: "noche", answer: "áak'ab" },
        { type: "choice", q: "¿Cómo se dice «pasado mañana»?", prompt: "pasado mañana", promptLang: "es", answer: "ka'abej", options: ["ka'abej", "jo'oljeak", "bejla'e'"] },
        { type: "type", q: "Escribe en maya", prompt: "ayer", answer: "jo'oljeak" },
        { type: "build", es: "el día y la noche", m: "k'iin yéetel áak'ab", distractors: ["sáamal", "uj"] }
      ]
    },
    {
      id: "u9l2",
      title: "Pasado y futuro básicos",
      goal: "Al terminar podrás reconocer cómo se dice que algo ya pasó (ya comí, fui, vine, trabajé), que acabas de hacerlo o que tienes que hacerlo, y el futuro con bíin.",
      teach: [
        {
          kind: "table",
          title: "Comer: costumbre, ahora, ya y pasado",
          head: ["Maya", "Español"],
          rows: [
            ["kin janal", "como (de costumbre)"],
            ["táan in janal", "estoy comiendo"],
            ["Tene' táant in janale'", "yo acabo de comer"],
            ["ts'o'ok in janal", "ya comí"],
            ["janen", "comí"]
          ]
        },
        {
          kind: "text",
          title: "El pasado",
          html: "Los verbos sin objeto forman el pasado con la terminación de persona, la misma de <span class=\"m\">wi'ijen</span>: <span class=\"m\">binen</span> (fui), <span class=\"m\">taalen</span> (vine), <span class=\"m\">janen</span> (comí). Los verbos de actividad agregan -naj: <span class=\"m\">meyajnajen</span> (trabajé). Algunas fuentes escriben una j- delante (<span class=\"m\">jbinen</span>, <span class=\"m\">jtaalen</span>): Lehmann la explica como la marca de pasado propia de estos verbos, y la app acepta las dos grafías.<br>Con objeto, el pasado lleva t- y -aj: <span class=\"m\">tin xokaj</span>, «lo leí». Ojo: <span class=\"m\">tin</span> también es la forma corta de <span class=\"m\">táan in</span>; la terminación -aj es la que dice «pasado»."
        },
        {
          kind: "culture",
          title: "El futuro de las profecías",
          html: "El futuro con <span class=\"m\">bíin</span> se asocia con lo que está predeterminado y fuera del control humano; por eso aparece en las profecías y en textos antiguos: <span class=\"m\">Bíin in jaantej</span>, «me lo he de comer».<br>En la conversación diaria se prefiere <span class=\"m\">yaan in</span> + verbo: <span class=\"m\">Yaan in bin</span>, «tengo que ir»."
        },
        {
          kind: "tip",
          title: "¿Qué está confirmado y qué no?",
          html: "Los estudios de Lehmann confirman cómo funcionan <span class=\"m\">ts'o'ok</span> (ya), como en <span class=\"m\">Ts'o'ok in janal</span>, <span class=\"m\">bíin</span> (futuro de predicción, que también estudia Vapnarsky) y el pasado de los verbos sin objeto, como <span class=\"m\">binen</span> y <span class=\"m\">taalen</span>.<br>Otras formas, como <span class=\"m\">janen</span>, <span class=\"m\">meyajnajen</span>, <span class=\"m\">tin xokaj</span> o las frases con <span class=\"m\">táant</span> y <span class=\"m\">yaan in</span>, las vimos en una sola fuente o armadas por regla: llevan la marca «por confirmar». Úsalas, y compruébalas con un hablante cuando puedas."
        }
      ],
      vocab: [
        { id: "u9-tsook", m: "ts'o'ok", es: "ya (acción terminada)", pr: "ts'o-ok", note: "ts'o'ok + in + verbo: ts'o'ok in janal, ya comí. Sola puede responder «ya» a una pregunta. En el habla rápida se contrae: ts'in janal.", conf: "alta" },
        { id: "u9-binen", m: "binen", es: "fui", pr: "binen", note: "bin (ir) + -en (yo). Algunas fuentes escriben jbinen.", alt: ["jbinen"], conf: "alta" },
        { id: "u9-taalen", m: "taalen", es: "vine", pr: "taalen", note: "taal (venir) + -en. También se escribe jtaalen.", alt: ["jtaalen"], conf: "alta" },
        { id: "u9-janen", m: "janen", es: "comí", pr: "janen", note: "Pasado de janal. Para él o ella: janij, «comió».", alt: ["jjanen"], conf: "media" },
        { id: "u9-meyajnajen", m: "meyajnajen", es: "trabajé", pr: "meyajnajen", note: "meyaj + -naj + -en: los verbos de actividad agregan -naj.", conf: "media" },
        { id: "u9-tin-xokaj", m: "Tin xokaj.", es: "Lo leí.", pr: "tin shokaj", note: "t- + in + raíz + -aj: pasado de un verbo con objeto.", conf: "media" },
        { id: "u9-taant-in-janale", m: "Tene' táant in janale'.", es: "Yo acabo de comer.", pr: "tene- táant in janale-", note: "táant + in + verbo: algo que acaba de pasar.", conf: "media" },
        { id: "u9-yaan-in-bin", m: "Yaan in bin.", es: "Tengo que ir.", pr: "yaan in bin", note: "yaan + in + verbo: obligación o futuro. No confundir con yaan, «hay».", conf: "media" },
        { id: "u9-biin", m: "bíin", es: "futuro de predicción («ha de», «va a»)", pr: "bíin", note: "Tono alto. Pide el verbo en subjuntivo. Se usa poco en la conversación diaria; es frecuente en profecías y textos.", conf: "alta" },
        { id: "u9-biin-in-jaantej", m: "Bíin in jaantej.", es: "Me lo he de comer. / Me lo comeré.", pr: "bíin in jaantej", note: "Con bíin, el verbo con objeto termina en -ej.", conf: "media" }
      ],
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "binen", promptLang: "m", answer: "fui", options: ["fui", "voy", "tengo que ir"] },
        { type: "choice", q: "¿Qué significa?", prompt: "Ts'o'ok in janal.", promptLang: "m", answer: "Ya comí.", options: ["Ya comí.", "Como (de costumbre).", "Estoy comiendo."] },
        { type: "type", q: "Escribe en maya", prompt: "fui", answer: "binen", alt: ["jbinen"] },
        { type: "choice", q: "¿Qué significa?", prompt: "Tene' táant in janale'.", promptLang: "m", answer: "Yo acabo de comer.", options: ["Yo acabo de comer.", "Ya comí ayer.", "Tengo que comer."] },
        { type: "choice", q: "¿Qué significa?", prompt: "Tin xokaj.", promptLang: "m", answer: "Lo leí.", options: ["Lo leí.", "Lo estoy leyendo.", "Leo todos los días."] },
        { type: "type", q: "Escribe en maya", prompt: "vine", answer: "taalen", alt: ["jtaalen"] },
        { type: "choice", q: "¿Qué significa?", prompt: "Bíin in jaantej.", promptLang: "m", answer: "Me lo he de comer.", options: ["Me lo he de comer.", "Ya comí.", "Estoy comiendo."] },
        { type: "choice", q: "¿Qué significa?", prompt: "Yaan in bin.", promptLang: "m", answer: "Tengo que ir.", options: ["Tengo que ir.", "Fui.", "Hay comida."] }
      ]
    },
    {
      id: "u9l3",
      title: "Cultura viva",
      goal: "Al terminar podrás hablar de la lengua maya hoy, reconocer palabras de los días de muertos, los relatos y la música, conocer la jarana y el hipil, y despedir a una visita con las fórmulas tradicionales.",
      teach: [
        {
          kind: "culture",
          title: "Una lengua viva, con variantes",
          html: "Sus hablantes llaman a su lengua <span class=\"m\">maaya t'aan</span>; el INALI la escribe <span class=\"m\">Maayat'aan</span>. Según el censo 2020 del INEGI, citado por el INALI, tiene 774,755 hablantes y es la segunda lengua indígena más hablada de México. Se habla en Yucatán, Campeche y Quintana Roo, y también en Belice.<br>No se habla igual en todas partes: Pfeiler y Hofling (2006) encontraron que <span class=\"m\">uts</span>, «bueno», se usa sobre todo en el oriente de la península, y que en otras regiones se prefiere <span class=\"m\">ma'alob</span>; también cambia la manera de pronunciar el tono. Si en un pueblo oyes algo distinto a lo de esta app, no es necesariamente un error: pregunta y anótalo."
        },
        {
          kind: "culture",
          title: "Janal Pixan",
          html: "En Yucatán, los días de muertos se llaman <span class=\"m\">Janal Pixan</span>, «comida de las ánimas»; ya conoces <span class=\"m\">janal</span>, comer o comida. En la prensa es más común la grafía antigua, <i>Hanal Pixán</i>.<br>Se celebra del 31 de octubre al 2 de noviembre: el 31 se dedica a los niños, el 1 de noviembre a los adultos y el 2 a todos los fieles difuntos. En los altares se pone comida, y el platillo de la fiesta es el mucbipollo o pib, un tamal grande de masa de maíz y manteca que se hornea bajo tierra; su nombre viene de <i>mukbil</i>, «lo que se entierra».<br>Dos palabras para estos días: <span class=\"m\">kíimil</span>, morir o muerte, y <span class=\"m\">kuxtal</span>, vida."
        },
        {
          kind: "culture",
          title: "La jarana y el hipil",
          html: "La jarana es el baile tradicional de Yucatán; se baila en compás de 6/8 y de 3/4. Nació en las vaquerías, las fiestas de las haciendas en que se herraba y se contaba el ganado; hoy la vaquería tiene misa, corrida y baile. Cuando la música se detiene al grito de «¡bomba!», un bailarín recita una bomba, un verso cómico.<br>El vestido tradicional de la mujer yucateca es el hipil, una túnica blanca de algodón con bordados; el terno, el traje de gala, tiene tres piezas: jubón, hipil y fustán.<br>«Jarana» e «hipil» son palabras del español de Yucatán; hipil viene del náhuatl <i>huipilli</i>. No encontramos una palabra maya confirmada para el hipil, así que no te enseñamos ninguna."
        },
        {
          kind: "culture",
          title: "Relatos, música y poesía",
          html: "<span class=\"m\">wáay</span> significa «brujo» o «fantasma», y aparece en relatos tradicionales de espantos y brujos. La música también tiene sus palabras: <span class=\"m\">k'aay</span> es cantar y <span class=\"m\">paax</span>, tocar un instrumento.<br>Y hay literatura escrita en maya: en el sitio de la UADY se publica un poema de Briceida Cuevas Cob titulado <span class=\"m\">In k'aaba'</span>, «Mi nombre»."
        }
      ],
      vocab: [
        { id: "u9-janal-pixan", m: "Janal Pixan", es: "comida de las ánimas (días de muertos en Yucatán)", pr: "janal pishan", note: "Del 31 de octubre al 2 de noviembre. En grafía antigua, Hanal Pixán.", conf: "alta" },
        { id: "u9-kiimil", m: "kíimil", es: "morir; muerte", pr: "kíimil", note: "Tono alto. En grafía colonial: cimil.", conf: "alta" },
        { id: "u9-kuxtal", m: "kuxtal", es: "vida; vivir", pr: "kushtal", note: "La x suena «sh». El diccionario de la UADY la da como «vida, existencia», y el curso de la UADY, como «vivir».", conf: "alta" },
        { id: "u9-waay", m: "wáay", es: "brujo; fantasma", pr: "wáay", note: "Tono alto. Aparece en relatos tradicionales de espantos.", conf: "alta" },
        { id: "u9-paax", m: "paax", es: "tocar (un instrumento)", pr: "paash", note: "La x suena «sh».", conf: "media" },
        { id: "u9-uts", m: "uts", es: "bueno", pr: "uts", note: "Se usa sobre todo en el oriente de la península; en otras regiones se prefiere ma'alob.", conf: "alta" },
        { id: "u9-jatsuts", m: "jats'uts", es: "bonito, bello", pr: "jats'uts", note: "ts' glotalizada en medio y ts simple al final.", conf: "alta" },
        { id: "u9-kiimak-oolal", m: "Ki'imak óolal.", es: "¡Bienvenido! / ¡Bienvenida! (lit. alegría)", pr: "ki-imak óolal", note: "Ki'imak óolal es «alegría, felicidad» (UADY), de ki'imak óol, «feliz». Como fórmula de bienvenida solo la dan guías divulgativas.", conf: "media" },
        { id: "u9-yuum-bootik-taalech", m: "Yuum bo'otik taalech a xíimbal to'on.", es: "Gracias por su visita. (lit. gracias por venir a visitarnos)", pr: "yuum bo-otik taalech a shíimbal to-on", note: "Fórmula del prontuario del INALI. Taalech = viniste.", conf: "media" },
        { id: "u9-ka-suunakech", m: "Ka suunakech a xíimbal to'on.", es: "Vuelva pronto. (lit. que vuelvas a visitarnos)", pr: "ka suunakech a shíimbal to-on", note: "Fórmula del prontuario del INALI.", conf: "media" }
      ],
      dialogue: {
        title: "Una visita (diálogo de práctica)",
        lines: [
          { who: "A", name: "Doña Rosa", m: "Ki'imak óolal. Máanen waye'.", es: "Bienvenido. Pase usted." },
          { who: "B", name: "Luis", m: "Dios bo'otik. Bix a beel?", es: "Gracias. ¿Cómo está?" },
          { who: "A", name: "Doña Rosa", m: "Ma'alob, kux teech?", es: "Bien, ¿y usted?" },
          { who: "B", name: "Luis", m: "Ma'alob. Táan in kanik maaya.", es: "Bien. Estoy aprendiendo maya." },
          { who: "A", name: "Doña Rosa", m: "Ki'imak in wóol.", es: "Me da gusto." },
          { who: "A", name: "Doña Rosa", m: "Yuum bo'otik taalech a xíimbal to'on.", es: "Gracias por su visita." },
          { who: "B", name: "Luis", m: "Tak ti' uláak' k'iin.", es: "Hasta otro día." },
          { who: "A", name: "Doña Rosa", m: "Ka suunakech a xíimbal to'on.", es: "Vuelva pronto." }
        ]
      },
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "wáay", promptLang: "m", answer: "brujo; fantasma", options: ["brujo; fantasma", "bonito, bello", "bueno"] },
        { type: "choice", q: "¿Qué significa?", prompt: "Janal Pixan", promptLang: "m", answer: "comida de las ánimas", options: ["comida de las ánimas", "vamos a comer", "hasta otro día"] },
        { type: "choice", q: "¿Qué significa?", prompt: "Yuum bo'otik taalech a xíimbal to'on.", promptLang: "m", answer: "Gracias por su visita.", options: ["Gracias por su visita.", "Vuelva pronto.", "Bienvenido."] },
        { type: "build", es: "comida de las ánimas (días de muertos)", m: "Janal Pixan", distractors: ["kuxtal", "wáay"] },
        { type: "type", q: "Escribe en maya", prompt: "bonito, bello", answer: "jats'uts" },
        { type: "choice", q: "¿Qué palabra para «bueno» se usa sobre todo en el oriente de la península?", prompt: "bueno (en el oriente)", promptLang: "es", answer: "uts", options: ["uts", "ma'alob", "jach"] },
        { type: "choice", q: "¿Qué significa?", prompt: "Ki'imak óolal.", promptLang: "m", answer: "¡Bienvenido! (lit. alegría)", options: ["¡Bienvenido! (lit. alegría)", "Con permiso.", "Que te vaya bien."] },
        { type: "choice", q: "¿Qué significa?", prompt: "kíimil", promptLang: "m", answer: "morir; muerte", options: ["morir; muerte", "vida; vivir", "brujo; fantasma"] }
      ]
    }
  ]
});
