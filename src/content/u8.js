/* Unidad 8 · Naturaleza y colores. Solo formas con estado «verificado» (conf alta) o «probable» (conf media)
   en la base o en la reverificación (kb/recheck-naturaleza-cultura.json).
   y en la tercera verificación (kb/recheck3-resto.json). k'an (amarillo) va con conf alta: vocal corta, como en Bricker,
   Savkic y la propia UADY (k'an ch'uuy). No se enseñan tunkuluchu' ni wiits como vocabulario. */
(window.COURSE = window.COURSE || { units: [] }).units.push({
  id: "u8",
  n: 8,
  title: "Naturaleza y colores",
  subtitle: "Animales, colores, los cuatro rumbos y el paisaje: monte, cenote, cielo y cuevas",
  sources: [
    { title: "UADY – Diccionario español-maya, letra P (peek')", url: "https://www.mayas.uady.mx/diccionario/p_esp.html" },
    { title: "UADY – Diccionario maya, letra K (kéej, kool)", url: "https://www.mayas.uady.mx/diccionario/k_maya.html" },
    { title: "UADY – Diccionario maya, letra B (báalam, baats', bej)", url: "https://www.mayas.uady.mx/diccionario/b_maya.html" },
    { title: "UADY – Diccionario maya, letra TS (tsíimin)", url: "https://www.mayas.uady.mx/diccionario/ts_maya.html" },
    { title: "UADY – Diccionario maya, letra CH' (ch'o', ch'ik)", url: "https://www.mayas.uady.mx/diccionario/ch_glotal_maya.html" },
    { title: "UADY – Diccionario maya, letra M (muuch)", url: "https://www.mayas.uady.mx/diccionario/m_maya.html" },
    { title: "UADY – Diccionario maya, letra CH (chak)", url: "https://www.mayas.uady.mx/diccionario/ch_maya.html" },
    { title: "UADY – Diccionario maya, letra S (sak, síinik)", url: "https://www.mayas.uady.mx/diccionario/s_maya.html" },
    { title: "UADY – Diccionario maya, letra Y (ya'ax)", url: "https://www.mayas.uady.mx/diccionario/y_maya.html" },
    { title: "UADY – Diccionario maya, letra L (lak'in)", url: "https://www.mayas.uady.mx/diccionario/l_maya.html" },
    { title: "UADY – Diccionario maya, letra N (náach)", url: "https://www.mayas.uady.mx/diccionario/n_maya.html" },
    { title: "UADY – Diccionario maya, letra W (waye')", url: "https://www.mayas.uady.mx/diccionario/w_maya.html" },
    { title: "UADY – Diccionario maya, letra O (óox, el ramón)", url: "https://www.mayas.uady.mx/diccionario/o_maya.html" },
    { title: "UADY – Diccionario maya, letra TS' (ts'ono'ot)", url: "https://www.mayas.uady.mx/diccionario/ts_glotal_maya.html" },
    { title: "UADY – Diccionario maya, letra K' (k'aan, el mecate; k'áax, el monte; k'an ch'uuy)", url: "https://www.mayas.uady.mx/diccionario/k_glotal_maya.html" },
    { title: "UADY – Diccionario maya, letra X (xaman, xooch')", url: "https://www.mayas.uady.mx/diccionario/x_maya.html" },
    { title: "UADY – Diccionario maya, letra P (pu'uk)", url: "https://www.mayas.uady.mx/diccionario/p_maya.html" },
    { title: "UADY – Diccionario español-maya, letra N (negro: éek', boox; nube: múuyal; nido: k'u')", url: "https://www.mayas.uady.mx/diccionario/n_esp.html" },
    { title: "UADY – Diccionario español-maya, letra C (cueva: áaktun; cerro: pu'uk, wiits; conejo: t'u'ul; carrizo: jalal)", url: "https://www.mayas.uady.mx/diccionario/c_esp.html" },
    { title: "UADY – Diccionario español-maya, letra A (arriba: yóok'ol; anterior, antes: táanil)", url: "https://www.mayas.uady.mx/diccionario/a_esp.html" },
    { title: "UADY – Diccionario español-maya, letra L (lodo: luuk')", url: "https://www.mayas.uady.mx/diccionario/l_esp.html" },
    { title: "UADY – Diccionario maya, letra J (juuj)", url: "https://www.mayas.uady.mx/diccionario/j_maya.html" },
    { title: "Wiktionnaire (francés) – k'an (maya yucateco): amarillo; maduro", url: "https://fr.wiktionary.org/wiki/k%E2%80%99an" },
    { title: "UADY, Yucatán: Identidad y Cultura Maya – el Hanal Pixan y la cosmología maya (rumbos, colores y ya'axche')", url: "https://www.mayas.uady.mx/articulos/pixan.html" },
    { title: "UADY – ¿Qué es la sobada? (la ceiba o ya'axche')", url: "https://www.mayas.uady.mx/articulos/pdf/sobada.pdf" },
    { title: "UADY – La milpa maya como agricultura migratoria (kool)", url: "https://www.mayas.uady.mx/articulos/milpa.html" },
    { title: "UADY – La zona arqueológica de Ek' Balam (báalam, jaguar)", url: "https://www.mayas.uady.mx/articulos/ekbalam.html" },
    { title: "UADY, literatura – poema «Uj yetel ak'ab» (La luna y la noche)", url: "https://www.mayas.uady.mx/literatura/poem13.html" },
    { title: "UADY, literatura – Briceida Cuevas Cob, «Xooch'» (El búho)", url: "https://www.mayas.uady.mx/literatura/poem20.html" },
    { title: "Bricker (1999), Color and Texture in the Maya Language of Yucatan, Anthropological Linguistics 41(3), resumen", url: "https://anthling.sitehost.iu.edu/v41-3.html" },
    { title: "Savkic, los términos de color en maya yucateco, Estudios de Cultura Maya 37 (SciELO)", url: "https://www.scielo.org.mx/pdf/ecm/v37/v37a4.pdf" },
    { title: "Estudios Mesoamericanos (UNAM, 2000) – primates en el área maya (baats')", url: "https://revistas-filologicas.unam.mx/estudios-mesoamericanos/index.php/em/article/download/111/108" },
    { title: "Redalyc – Rescate arqueológico en la cueva Pool Balam, «cabeza de jaguar»", url: "https://www.redalyc.org/pdf/745/74516316005.pdf" },
    { title: "Flora de Kaxil Kiuic (University of Richmond) – Plumeria rubra (nikte', flor de mayo)", url: "https://chalk.richmond.edu/flora-kaxil-kiuic/p/plumeria_rubra.html" },
    { title: "CICY – Castillo-Acal (2017), Las flores del huerto maya (nikte')", url: "https://cicy.repositorioinstitucional.mx/jspui/bitstream/1003/2446/1/2017-04-27-Castillo-Acal-Las-flores-del-huerto-maya.pdf" },
    { title: "Yucatán Today – Juul nikte': flores de mayo para la Virgen de Tetiz", url: "https://yucatantoday.com/en/blog/juul-nikte-may-flowers-for-our-lady-of-tetiz" },
    { title: "EcuRed – Tunkuluchú", url: "https://www.ecured.cu/Tunkuluch%C3%BA" },
    { title: "Diario de Yucatán – Leyenda: el misterioso canto del tunkuluchú (2022)", url: "https://www.yucatan.com.mx/central-9/2022/8/12/leyenda-en-yucatan-el-misterioso-canto-del-tunkuluchu-339338.html" },
    { title: "Estudios de Lingüística Aplicada (UNAM) – la cuantificación en maya yucateco (ka'a-túul peek')", url: "https://ela.enallt.unam.mx/index.php/ela/article/download/201/187" },
    { title: "INEA / MEVyT – Lengua maya (Yucatán): vocales y consonantes (áak, ch'oom, tsíimin, turix, lool, béek, kitam)", url: "https://www.cursosinea.conevyt.org.mx/cursos/lenguas_indigenas/yucatan/maya.htm" },
    { title: "Aprendiendo Maya – Consonantes (báalam, t'u'ul, k'u', luuk', jalal, yóok'ol, táanil)", url: "https://www.aprendiendomaya.com/escritura/alfabeto-maya" },
    { title: "Aprendiendo Maya – Las vocales y sus reglas de uso (juuj)", url: "https://aprendiendomaya.com/escritura/vocales/las-vocales-y-sus-reglas-de-uso" },
    { title: "Normas de escritura para la lengua maya: t'u'ul, ts'ono'ot, am, úurich" },
    { title: "Yoshida, Guía gramatical de la lengua maya yucateca para hispanohablantes (plural ch'íich'o'ob)" },
    { title: "Filosofía Maya – El huracán según las lenguas mayas (blog)", url: "https://filosofiamaya.com/2020/10/08/el-huracan-segun-las-lenguas-mayas/" },
    { title: "UADY – Adivinanzas (chak iik, chile habanero)", url: "https://www.mayas.uady.mx/literatura/adiv1.html" },
    { title: "Diapositivas «Yucatec fragment» (HPSG, Universidad de Kentucky): koolnáalen", url: "https://hpsg.uky.edu/sites/default/files/abstracts/yucatec-fragment-slides.pdf" },
    { title: "INALI – Prontuario de frases de cortesía Maayat'aan (Máanen waye')", url: "https://site.inali.gob.mx/Micrositios/Prontuarios/maya.html" }
  ],
  lessons: [
    {
      id: "u8l1",
      title: "Animales",
      goal: "Al terminar podrás nombrar animales de la casa, del campo y del agua, y entender por qué el caballo se llama como el tapir.",
      teach: [
        {
          kind: "culture",
          title: "Tsíimin: del tapir al caballo",
          html: "<span class=\"m\">tsíimin</span> significa hoy «caballo», pero, según la UADY, literalmente quiere decir «tapir». Cuando los españoles trajeron el caballo, los mayas lo nombraron como al animal grande que ya conocían."
        },
        {
          kind: "text",
          title: "De la casa al campo",
          html: "En la casa: <span class=\"m\">peek'</span> (perro) y <span class=\"m\">miis</span> (gato, que ya conoces). En el campo: <span class=\"m\">kéej</span> (venado), <span class=\"m\">báalam</span> (jaguar), <span class=\"m\">juuj</span> (iguana), <span class=\"m\">t'u'ul</span> (conejo) y <span class=\"m\">ch'o'</span> (ratón). Cerca del agua: <span class=\"m\">áak</span> (tortuga), <span class=\"m\">muuch</span> (sapo, rana) y <span class=\"m\">turix</span> (libélula). En el cielo: <span class=\"m\">ch'oom</span>, el zopilote.<br>La UADY registra <span class=\"m\">báalam</span> también como «guardián protector»; el sentido de «jaguar» se ve en nombres de lugares como Ek' Balam o la cueva Pool Balam, «cabeza de jaguar»."
        },
        {
          kind: "tip",
          title: "Uno o muchos",
          html: "El plural se forma con <span class=\"m\">-o'ob</span>: <span class=\"m\">ch'íich'</span> (pájaro) → <span class=\"m\">ch'íich'o'ob</span> (pájaros). Es opcional: si ya se entiende que son varios, muchas veces no se pone.<br>Y fíjate en <span class=\"m\">turix</span>: es de las pocas palabras con r, que en maya va en medio de la palabra."
        }
      ],
      vocab: [
        { id: "u8-peek", m: "peek'", es: "perro", pr: "peek'", conf: "alta" },
        { id: "u8-tsiimin", m: "tsíimin", es: "caballo (originalmente, tapir)", pr: "tsíimin", note: "Tono alto. Al llegar el caballo se le dio el nombre del tapir.", conf: "alta" },
        { id: "u8-keej", m: "kéej", es: "venado", pr: "kéej", note: "Tono alto.", conf: "alta" },
        { id: "u8-baalam", m: "báalam", es: "jaguar", pr: "báalam", note: "Tono alto. La UADY la registra también como «guardián protector»; en nombres antiguos se escribe balam, como en Ek' Balam.", conf: "alta" },
        { id: "u8-aak", m: "áak", es: "tortuga", pr: "áak", note: "Tono alto y k simple; no confundir con aak' (lengua).", conf: "alta" },
        { id: "u8-juuj", m: "juuj", es: "iguana", pr: "juuj", conf: "alta" },
        { id: "u8-muuch", m: "muuch", es: "sapo, rana", pr: "muuch", conf: "alta" },
        { id: "u8-choom", m: "ch'oom", es: "zopilote", pr: "ch'oom", conf: "alta" },
        { id: "u8-tuul", m: "t'u'ul", es: "conejo", pr: "t'u-ul", note: "t' glotalizada y vocal rearticulada u'u.", conf: "alta" },
        { id: "u8-cho", m: "ch'o'", es: "ratón, rata", pr: "ch'o-", note: "ch' glotalizada al inicio y corte de voz al final.", conf: "alta" },
        { id: "u8-turix", m: "turix", es: "libélula", pr: "turish", note: "La x suena «sh». Una de las pocas palabras con r.", conf: "alta" }
      ],
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "peek'", promptLang: "m", answer: "perro", options: ["perro", "gato", "venado"] },
        { type: "choice", q: "¿Cómo se dice «caballo»?", prompt: "caballo", promptLang: "es", answer: "tsíimin", options: ["tsíimin", "kéej", "peek'"] },
        { type: "fill", es: "el perro y el gato", before: "peek'", after: "miis", answer: "yéetel", options: ["yéetel", "wáaj", "ma'"] },
        { type: "choice", q: "¿Qué significa?", prompt: "áak", promptLang: "m", answer: "tortuga", options: ["tortuga", "lengua (órgano); bejuco", "pie"] },
        { type: "type", q: "Escribe en maya", prompt: "venado", answer: "kéej" },
        { type: "choice", q: "¿Qué significa?", prompt: "turix", promptLang: "m", answer: "libélula", options: ["libélula", "sapo, rana", "zopilote"] },
        { type: "build", es: "el perro de Pedro", m: "u peek' Pedro", distractors: ["in", "miis"] },
        { type: "choice", q: "¿Cómo se dice «zopilote»?", prompt: "zopilote", promptLang: "es", answer: "ch'oom", options: ["ch'oom", "ch'o'", "muuch"] }
      ]
    },
    {
      id: "u8l2",
      title: "Colores y lugares",
      goal: "Al terminar podrás decir rojo, blanco, verde, amarillo y negro, nombrar el oriente y decir si algo está aquí, lejos, encima o adelante.",
      teach: [
        {
          kind: "text",
          title: "Rojo, blanco y verde",
          html: "<span class=\"m\">chak</span> es rojo, <span class=\"m\">sak</span> es blanco y <span class=\"m\">ya'ax</span> es verde. Van antes de lo que describen: <span class=\"m\">chak iik</span> (chile habanero, literalmente «chile rojo») o <span class=\"m\">sak bej</span> (camino blanco). Según los estudios de Bricker y de Savkic, <span class=\"m\">ya'ax</span> abarca también tonos azules, y <span class=\"m\">chak</span>, el rosa y el naranja.<br>Cuida la forma: <span class=\"m\">chak</span> (rojo) no es <span class=\"m\">cháak</span> (lluvia), y <span class=\"m\">ya'ax</span> (verde) no es <span class=\"m\">yáax</span> (primero)."
        },
        {
          kind: "text",
          title: "Amarillo y negro",
          html: "Esos mismos estudios cuentan cinco colores básicos: <span class=\"m\">sak</span>, <span class=\"m\">éek'</span>, <span class=\"m\">chak</span>, <span class=\"m\">k'an</span> y <span class=\"m\">ya'ax</span>.<br>Para «negro» hay dos palabras: <span class=\"m\">éek'</span>, con tono alto, y <span class=\"m\">boox</span>. No confundas <span class=\"m\">éek'</span> con <span class=\"m\">eek'</span>, de tono bajo, que es «estrella»; además, <span class=\"m\">éek'</span> también quiere decir «sucio».<br>«Amarillo» es <span class=\"m\">k'an</span>, como en <span class=\"m\">k'an ch'uuy</span>, «pálido, amarillento». Así, con vocal corta, lo escriben Bricker, Savkic y Montgomery; en su entrada para «amarillo», el diccionario de la UADY pone <i>k'aan</i>, que es también «mecate»."
        },
        {
          kind: "culture",
          title: "Lak'in, el oriente",
          html: "<span class=\"m\">lak'in</span> es el oriente, el rumbo por donde sale el sol (<span class=\"m\">k'iin</span>). En el mundo maya cada rumbo tiene su color, y el del oriente es el rojo, <span class=\"m\">chak</span>; los otros tres rumbos los verás en la lección «Rumbos, cielo, cerros y cuevas».<br>Las antiguas calzadas mayas se conocen en español como sacbé: en maya, <span class=\"m\">sak bej</span>, «camino blanco»."
        },
        {
          kind: "text",
          title: "Aquí, lejos, encima",
          html: "<span class=\"m\">waye'</span> es «aquí», como en <span class=\"m\">Máanen waye'</span> (pase usted). <span class=\"m\">náach</span> es «lejos», <span class=\"m\">yóok'ol</span> es «encima, sobre, arriba» y <span class=\"m\">táanil</span> es «adelante» y también «antes», de <span class=\"m\">táan</span>, la frente."
        }
      ],
      vocab: [
        { id: "u8-chak", m: "chak", es: "rojo", pr: "chak", note: "Vocal corta. Abarca también el rosa y el naranja. Con vocal larga y tono alto, cháak es «lluvia».", conf: "alta" },
        { id: "u8-sak", m: "sak", es: "blanco", pr: "sak", conf: "alta" },
        { id: "u8-yaax", m: "ya'ax", es: "verde", pr: "ya-ash", note: "Vocal rearticulada. Abarca también tonos azules. No confundir con yáax, «primero».", conf: "alta" },
        { id: "u8-kan-amarillo", m: "k'an", es: "amarillo", pr: "k'an", note: "k' glotalizada y vocal corta, como la escriben Bricker, Savkic y la propia UADY en k'an ch'uuy. En su entrada para «amarillo», la UADY pone k'aan. También quiere decir «maduro», de la fruta.", conf: "alta" },
        { id: "u8-eek-negro", m: "éek'", es: "negro, oscuro; sucio", pr: "éek'", note: "Tono alto. Con tono bajo, eek' es «estrella».", conf: "alta" },
        { id: "u8-boox", m: "boox", es: "negro", pr: "boosh", note: "Vocal larga de tono bajo; la x suena «sh».", conf: "alta" },
        { id: "u8-sak-bej", m: "sak bej", es: "camino blanco; calzada maya (sacbé)", pr: "sak bej", note: "sak (blanco) + bej (camino). Las dos palabras están confirmadas; el compuesto no lo vimos escrito en una fuente.", conf: "media" },
        { id: "u8-lakin", m: "lak'in", es: "oriente, este", pr: "lak'in", conf: "alta" },
        { id: "u8-naach", m: "náach", es: "lejos", pr: "náach", note: "Tono alto.", conf: "alta" },
        { id: "u8-waye", m: "waye'", es: "aquí, acá", pr: "waye-", conf: "alta" },
        { id: "u8-yookol", m: "yóok'ol", es: "encima, sobre; arriba", pr: "yóok'ol", note: "Tono alto. No lo confundas con jóok'ol, «salir».", conf: "alta" },
        { id: "u8-taanil", m: "táanil", es: "adelante; antes, anterior", pr: "táanil", note: "De táan, la frente. La UADY da máan táanil, «avanzar».", conf: "alta" }
      ],
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "sak", promptLang: "m", answer: "blanco", options: ["blanco", "rojo", "verde"] },
        { type: "choice", q: "¿Cómo se dice «verde»?", prompt: "verde", promptLang: "es", answer: "ya'ax", options: ["ya'ax", "yáax", "ya'"] },
        { type: "choice", q: "Cuidado con la vocal: ¿cuál es «rojo»?", prompt: "rojo", promptLang: "es", answer: "chak", options: ["chak", "cháak", "sak"] },
        { type: "choice", q: "Cuidado con el tono: ¿cuál es «negro»?", prompt: "negro", promptLang: "es", answer: "éek'", options: ["éek'", "eek'", "sak"] },
        { type: "type", q: "Escribe en maya", prompt: "lejos", answer: "náach" },
        { type: "build", es: "rojo, blanco y negro", m: "chak, sak yéetel boox", distractors: ["k'an", "eek'"] },
        { type: "choice", q: "¿Qué significa?", prompt: "k'an", promptLang: "m", answer: "amarillo", options: ["amarillo", "negro", "verde"] },
        { type: "choice", q: "¿Qué significa?", prompt: "lak'in", promptLang: "m", answer: "oriente, este", options: ["oriente, este", "lejos", "encima, sobre"] }
      ]
    },
    {
      id: "u8l3",
      title: "El paisaje: monte, cenote y milpa",
      goal: "Al terminar podrás nombrar el monte, el cenote, la milpa, la ceiba y otras plantas, y hablar del viento fuerte.",
      teach: [
        {
          kind: "text",
          title: "Agua, plantas y tierra",
          html: "El cenote es <span class=\"m\">ts'ono'ot</span>, con ts' glotalizada y o'o rearticulada. En el paisaje también encontrarás <span class=\"m\">lool</span> (flor), <span class=\"m\">nikte'</span> (la flor de mayo o plumeria), <span class=\"m\">béek</span> (roble), <span class=\"m\">jalal</span> (carrizo) y <span class=\"m\">luuk'</span> (lodo); en las ramas, el <span class=\"m\">k'u'</span> (nido).<br>Una sorpresa: <span class=\"m\">óox</span>, que ya conoces como «tres», también es el nombre del ramón, un árbol de la península."
        },
        {
          kind: "text",
          title: "El monte y la ceiba",
          html: "<span class=\"m\">k'áax</span> es el monte, la selva o el bosque. Cuidado con el tono y la k: <span class=\"m\">k'aax</span>, con tono bajo, es «amarrar», y <span class=\"m\">kaax</span>, sin glotal, es «gallina».<br>La ceiba es <span class=\"m\">ya'axche'</span>, donde se oyen <span class=\"m\">ya'ax</span> (verde) y <span class=\"m\">che'</span> (árbol). La UADY la llama el sagrado «árbol verde de la vida»."
        },
        {
          kind: "culture",
          title: "La milpa y el mecate",
          html: "<span class=\"m\">kool</span> es la milpa; la UADY la define también como «tierra labrada o rozada». Es un policultivo: maíz con calabaza, camote y varias leguminosas, como el frijol. Ya la conoces por <span class=\"m\">koolnáal</span>, el campesino.<br>En Yucatán «mecate» (<span class=\"m\">k'aan</span>) es a la vez la cuerda y una medida de terreno: la UADY la define como una superficie de 20 × 20 metros. Atención al tono: <span class=\"m\">k'aan</span> (mecate) frente a <span class=\"m\">k'áan</span> (hamaca)."
        },
        {
          kind: "text",
          title: "El viento grande",
          html: "<span class=\"m\">iik'</span> es viento. Con <span class=\"m\">chak</span> (rojo) se forma <span class=\"m\">chak iik'</span>, que puede significar viento fuerte o tempestad.<br>Ojo con la k: <span class=\"m\">iik</span>, sin glotal, es «chile», y <span class=\"m\">chak iik</span> es el chile habanero."
        }
      ],
      vocab: [
        { id: "u8-tsonoot", m: "ts'ono'ot", es: "cenote", pr: "ts'ono-ot", note: "ts' glotalizada y vocal rearticulada o'o.", conf: "alta" },
        { id: "u8-kool", m: "kool", es: "milpa", pr: "kool", note: "Vocal larga de tono bajo. También «tierra labrada o rozada». Es la base de koolnáal, campesino.", conf: "alta" },
        { id: "u8-kaan-mecate", m: "k'aan", es: "mecate, cuerda; medida de terreno (20 × 20 m)", pr: "k'aan", note: "Tono bajo. En la misma entrada, la UADY da también «amarillo». Con tono alto, k'áan es «hamaca».", conf: "alta" },
        { id: "u8-kaax-monte", m: "k'áax", es: "monte, selva, bosque", pr: "k'áash", note: "Tono alto. Con tono bajo, k'aax es «amarrar»; sin glotal, kaax es «gallina».", conf: "alta" },
        { id: "u8-yaaxche", m: "ya'axche'", es: "ceiba (árbol sagrado)", pr: "ya-ashche-", note: "Vocal rearticulada a'a y corte de voz al final.", conf: "alta" },
        { id: "u8-lool", m: "lool", es: "flor", pr: "lool", conf: "alta" },
        { id: "u8-nikte", m: "nikte'", es: "flor de mayo (plumeria)", pr: "nikte-", note: "La palabra general para «flor» es lool. En textos antiguos: nicte.", conf: "alta" },
        { id: "u8-beek", m: "béek", es: "roble", pr: "béek", note: "Tono alto.", conf: "alta" },
        { id: "u8-jalal", m: "jalal", es: "carrizo", pr: "jalal", conf: "alta" },
        { id: "u8-luuk", m: "luuk'", es: "lodo", pr: "luuk'", conf: "alta" },
        { id: "u8-ku", m: "k'u'", es: "nido", pr: "k'u-", conf: "alta" },
        { id: "u8-chak-iik", m: "chak iik'", es: "viento fuerte; tempestad", pr: "chak iik'", note: "Literalmente «viento rojo». Sin la k' final, chak iik es el chile habanero. Para «huracán» algunas fuentes dan otra palabra (por confirmar).", conf: "media" }
      ],
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "ts'ono'ot", promptLang: "m", answer: "cenote", options: ["cenote", "milpa", "flor"] },
        { type: "choice", q: "¿Cómo se dice «flor»?", prompt: "flor", promptLang: "es", answer: "lool", options: ["lool", "luuk'", "k'u'"] },
        { type: "choice", q: "Cuidado con el tono y la k: ¿cuál es «monte»?", prompt: "monte", promptLang: "es", answer: "k'áax", options: ["k'áax", "kaax", "kool"] },
        { type: "type", q: "Escribe en maya", prompt: "cenote", answer: "ts'ono'ot" },
        { type: "choice", q: "¿Qué significa?", prompt: "kool", promptLang: "m", answer: "milpa", options: ["milpa", "mecate, cuerda", "roble"] },
        { type: "build", es: "lluvia y viento", m: "cháak yéetel iik'", distractors: ["iik", "chak"] },
        { type: "choice", q: "¿Qué significa?", prompt: "ya'axche'", promptLang: "m", answer: "ceiba", options: ["ceiba", "roble", "flor de mayo"] },
        { type: "type", q: "Escribe en maya", prompt: "monte, selva", answer: "k'áax" }
      ]
    },
    {
      id: "u8l4",
      title: "Rumbos, cielo, cerros y cuevas",
      goal: "Al terminar podrás nombrar los cuatro rumbos con su color, la luna, la nube, el cerro y la cueva.",
      teach: [
        {
          kind: "table",
          title: "Los cuatro rumbos y sus colores",
          head: ["Rumbo", "Maya", "Color", "Maya"],
          rows: [
            ["oriente", "lak'in", "rojo", "chak"],
            ["norte", "xaman", "blanco", "sak"],
            ["poniente", "chik'in", "negro", "éek'"],
            ["sur", "nojol", "amarillo", "k'an"],
            ["centro: la ceiba", "ya'axche'", "verde", "ya'ax"]
          ]
        },
        {
          kind: "culture",
          title: "Las esquinas del mundo",
          html: "Según la UADY, en la cosmología maya cada rumbo tenía su color, y las esquinas del mundo las guardaban los Bacabes. En el centro estaba el <span class=\"m\">ya'axche'</span>, la ceiba, «árbol verde de la vida», que atravesaba todos los espacios y los unía entre sí.<br>Para «negro» puedes decir también <span class=\"m\">boox</span>."
        },
        {
          kind: "text",
          title: "En el cielo",
          html: "En el cielo (<span class=\"m\">ka'an</span>) están <span class=\"m\">uj</span>, la luna, y <span class=\"m\">múuyal</span>, la nube (la UADY da también <span class=\"m\">múunyal</span>). La estrella es <span class=\"m\">eek'</span>, de tono bajo; no la confundas con <span class=\"m\">éek'</span>, «negro».<br>En el sitio de la UADY se publica un poema titulado <i>Uj yetel ak'ab</i>, «La luna y la noche», escrito con la grafía de entonces."
        },
        {
          kind: "text",
          title: "Cerros y cuevas",
          html: "<span class=\"m\">pu'uk</span> es el cerro o la loma; la UADY la define también como «cordillera de cerros bajos». De ella viene el nombre de la región Puuc, escrito con la grafía antigua. Como sinónimo de «cerro», la UADY da además <span class=\"m\">wiits</span>.<br>La cueva o gruta es <span class=\"m\">áaktun</span>; la UADY da también <span class=\"m\">sajkab</span>."
        }
      ],
      vocab: [
        { id: "u8-xaman", m: "xaman", es: "norte", pr: "shaman", note: "La x suena «sh». Su color es el blanco, sak.", conf: "alta" },
        { id: "u8-nojol", m: "nojol", es: "sur", pr: "nojol", note: "Su color es el amarillo, k'an.", conf: "alta" },
        { id: "u8-chikin", m: "chik'in", es: "poniente, oeste", pr: "chik'in", note: "Su color es el negro, éek'.", conf: "alta" },
        { id: "u8-uj", m: "uj", es: "luna", pr: "uj", note: "Vocal corta; la j suena suave.", conf: "alta" },
        { id: "u8-muuyal", m: "múuyal", es: "nube", pr: "múuyal", note: "Tono alto. La UADY da también múunyal.", alt: ["múunyal"], conf: "alta" },
        { id: "u8-puuk", m: "pu'uk", es: "cerro, loma", pr: "pu-uk", note: "Vocal rearticulada u'u. De aquí el nombre de la región Puuc.", conf: "alta" },
        { id: "u8-aaktun", m: "áaktun", es: "cueva, gruta", pr: "áaktun", note: "Tono alto.", conf: "alta" }
      ],
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "xaman", promptLang: "m", answer: "norte", options: ["norte", "sur", "poniente, oeste"] },
        { type: "choice", q: "¿Cómo se dice «sur»?", prompt: "sur", promptLang: "es", answer: "nojol", options: ["nojol", "xaman", "lak'in"] },
        { type: "fill", es: "el poniente y el oriente", before: "chik'in yéetel", after: "", answer: "lak'in", options: ["lak'in", "nojol", "xaman"] },
        { type: "type", q: "Escribe en maya", prompt: "luna", answer: "uj" },
        { type: "choice", q: "¿Qué significa?", prompt: "múuyal", promptLang: "m", answer: "nube", options: ["nube", "luna", "estrella"] },
        { type: "type", q: "Escribe en maya", prompt: "cueva, gruta", answer: "áaktun" },
        { type: "choice", q: "Cuidado con el tono: ¿cuál es «estrella»?", prompt: "estrella", promptLang: "es", answer: "eek'", options: ["eek'", "éek'", "uj"] },
        { type: "choice", q: "¿Qué significa?", prompt: "pu'uk", promptLang: "m", answer: "cerro, loma", options: ["cerro, loma", "cueva, gruta", "monte, selva"] }
      ]
    },
    {
      id: "u8l5",
      title: "Animales del monte",
      goal: "Al terminar podrás nombrar animales del monte, como el jabalí, el saraguato y el búho, y algunos animales pequeños, y contarlos con -túul.",
      teach: [
        {
          kind: "text",
          title: "En el monte",
          html: "En el monte (<span class=\"m\">k'áax</span>) viven <span class=\"m\">kitam</span>, el jabalí, y <span class=\"m\">baats'</span>, el saraguato o mono aullador. El cerdo de la granja, <span class=\"m\">k'éek'en</span>, ya lo conoces de la unidad de comida.<br>Fíjate en <span class=\"m\">baats'</span>: la UADY la escribe con a larga y sin corte de voz en medio."
        },
        {
          kind: "text",
          title: "Animales pequeños",
          html: "<span class=\"m\">síinik</span> es la hormiga (con tono alto), <span class=\"m\">am</span> la araña, <span class=\"m\">úurich</span> el caracol y <span class=\"m\">ch'ik</span> la pulga.<br>Como <span class=\"m\">turix</span>, <span class=\"m\">úurich</span> es de las pocas palabras con r."
        },
        {
          kind: "culture",
          title: "Xooch', el búho",
          html: "<span class=\"m\">xooch'</span> es el búho, que la UADY describe como «ave nocturna de mal agüero». La poeta Briceida Cuevas Cob tiene un poema titulado <span class=\"m\">Xooch'</span>, «El búho», publicado por la UADY.<br>En el español de Yucatán se oye también <i>tunkuluchú</i>, el tecolote cuyo canto, según la tradición, anuncia la muerte."
        },
        {
          kind: "tip",
          title: "Contar animales",
          html: "Para contar animales se usa <span class=\"m\">-túul</span>, como con las personas: <span class=\"m\">juntúul</span>, <span class=\"m\">ka'atúul</span>, <span class=\"m\">óoxtúul</span>. <span class=\"m\">Ka'atúul peek'</span> es «dos perros»."
        }
      ],
      vocab: [
        { id: "u8-kitam", m: "kitam", es: "jabalí", pr: "kitam", conf: "alta" },
        { id: "u8-baats", m: "baats'", es: "saraguato, mono aullador", pr: "baats'", note: "Vocal larga de tono bajo y ts' glotalizada al final. Algunas guías escriben ba'ats', pero no lo vimos en una fuente.", conf: "alta" },
        { id: "u8-xooch", m: "xooch'", es: "búho", pr: "shooch'", note: "La x suena «sh»; ch' glotalizada al final. La UADY la define como «ave nocturna de mal agüero».", conf: "alta" },
        { id: "u8-siinik", m: "síinik", es: "hormiga", pr: "síinik", note: "Tono alto.", conf: "alta" },
        { id: "u8-am", m: "am", es: "araña", pr: "am", conf: "alta" },
        { id: "u8-uurich", m: "úurich", es: "caracol", pr: "úurich", note: "Tono alto. Una de las pocas palabras con r.", conf: "alta" },
        { id: "u8-chik", m: "ch'ik", es: "pulga", pr: "ch'ik", note: "ch' glotalizada.", conf: "alta" }
      ],
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "kitam", promptLang: "m", answer: "jabalí", options: ["jabalí", "saraguato, mono aullador", "búho"] },
        { type: "choice", q: "¿Cómo se dice «hormiga»?", prompt: "hormiga", promptLang: "es", answer: "síinik", options: ["síinik", "ch'ik", "am"] },
        { type: "type", q: "Escribe en maya", prompt: "araña", answer: "am" },
        { type: "choice", q: "¿Qué significa?", prompt: "xooch'", promptLang: "m", answer: "búho", options: ["búho", "zopilote", "pájaro, ave"] },
        { type: "type", q: "Escribe en maya", prompt: "caracol", answer: "úurich" },
        { type: "choice", q: "¿Qué significa?", prompt: "baats'", promptLang: "m", answer: "saraguato, mono aullador", options: ["saraguato, mono aullador", "jabalí", "conejo"] },
        { type: "build", es: "dos perros y tres jabalíes", m: "ka'atúul peek' yéetel óoxtúul kitam", distractors: ["juntúul", "miis"] },
        { type: "choice", q: "¿Qué significa?", prompt: "ch'ik", promptLang: "m", answer: "pulga", options: ["pulga", "ratón, rata", "hormiga"] }
      ]
    }
  ]
});
