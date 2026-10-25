/* Unidad 7 · Cuerpo y salud. Solo formas con estado «verificado» (conf alta) o «probable» (conf media)
   en la base o en las reverificaciones (kb/recheck-cuerpo-familia.json, kb/recheck3-salud-cuerpo.json).
   Frases armadas con reglas confirmadas (juego B, ma' … -i', wáaj, yaj + posesivo) siguen con conf media,
   igual que in wook y u yook, que no se piden escribir. xeej va con conf media: el diccionario de la UADY
   no marca tono, pero un artículo de la UADY escribe xéej. No se enseñan yaaj, k'iinam ni ts'aak yaaj
   (incorrectas) ni j-ts'aak (dudosa). */
(window.COURSE = window.COURSE || { units: [] }).units.push({
  id: "u7",
  n: 7,
  title: "Cuerpo y salud",
  subtitle: "Partes del cuerpo, decir que estás enfermo o qué te duele, síntomas comunes y frases de cortesía para la clínica",
  sources: [
    { title: "UADY – Diccionario maya, letra N (ni')", url: "https://www.mayas.uady.mx/diccionario/n_maya.html" },
    { title: "UADY – Diccionario maya, letra CH (chi', chi'ibal, chokwil)", url: "https://www.mayas.uady.mx/diccionario/ch_maya.html" },
    { title: "UADY – Diccionario maya, letra X (xikin, xeej)", url: "https://www.mayas.uady.mx/diccionario/x_maya.html" },
    { title: "UADY – Diccionario maya, letra O (ook)", url: "https://www.mayas.uady.mx/diccionario/o_maya.html" },
    { title: "UADY – Diccionario maya, letra U (u'uy, u'ub)", url: "https://www.mayas.uady.mx/diccionario/u_maya.html" },
    { title: "UADY – Diccionario maya, letra CH' (ch'a' iik')", url: "https://www.mayas.uady.mx/diccionario/ch_glotal_maya.html" },
    { title: "UADY – Diccionario maya, letra K' (k'an ch'uuy, k'i'inam)", url: "https://www.mayas.uady.mx/diccionario/k_glotal_maya.html" },
    { title: "UADY – Diccionario español-maya, letra E (enfermo, enfermedad, enfermarse)", url: "https://www.mayas.uady.mx/diccionario/e_esp.html" },
    { title: "UADY – Diccionario maya, letra M (mina'an)", url: "https://www.mayas.uady.mx/diccionario/m_maya.html" },
    { title: "UADY – Diccionario maya, letra Y (yaan, yaj)", url: "https://www.mayas.uady.mx/diccionario/y_maya.html" },
    { title: "UADY – Diccionario maya, letra P (paach, píix)", url: "https://www.mayas.uady.mx/diccionario/p_maya.html" },
    { title: "UADY – Diccionario maya, letra B (baak, bak')", url: "https://www.mayas.uady.mx/diccionario/b_maya.html" },
    { title: "UADY – Diccionario maya, letra TS' (ts'aak, ts'ak yaj)", url: "https://www.mayas.uady.mx/diccionario/ts_glotal_maya.html" },
    { title: "UADY – Diccionario español-maya, letra C (cabello: tso'otsel pool)", url: "https://www.mayas.uady.mx/diccionario/c_esp.html" },
    { title: "UADY – Diccionario español-maya, letra M (médico: ts'ak máak, ts'ak yaj)", url: "https://www.mayas.uady.mx/diccionario/m_esp.html" },
    { title: "UADY – Diccionario español-maya, letra P (pecho: tseem)", url: "https://www.mayas.uady.mx/diccionario/p_esp.html" },
    { title: "UADY – Diccionario español-maya, letra S (salud: toj oolal; sano: toj óol)", url: "https://www.mayas.uady.mx/diccionario/s_esp.html" },
    { title: "UADY – Diccionario español-maya, letra T (tos, toser: se'en)", url: "https://www.mayas.uady.mx/diccionario/t_esp.html" },
    { title: "UADY, Identidad y Cultura Maya – Partería y medicina alopática en Yucatán (yaj, k'i'inam, chi'ibal pool, xéej)", url: "https://www.mayas.uady.mx/articulos/pdf/parteria.pdf" },
    { title: "UADY, Identidad y Cultura Maya – artículo sobre la concepción maya del dolor y la enfermedad (chi'ibal pool, chi'ibal koj)", url: "https://www.mayas.uady.mx/articulos/concepcion.html" },
    { title: "UADY, Facultad de Medicina – Programa «Lengua Maya para Profesionales de la Salud. Nivel Inicial»", url: "https://www.medicina.uady.mx/principal/docs/nut/2021/Lengua_Maya_Profesionales_Salud_Nivel_Inicial.pdf" },
    { title: "Diccionario maya de la UADY: entradas CABEZA (pool, jo'ol) y CORAZÓN (puksi'ik'al), consultadas en una reproducción no oficial" },
    { title: "Lehmann, Gramática del maya yucateco: partes del cuerpo (ho'l, ich, koh, kaal, tsem, in tso'tsel)", url: "https://christianlehmann.eu/ling/sprachen/maya/gramatica/onomas/posesion/partes_cuerpo.html" },
    { title: "Lehmann, Possession in Yucatec Maya (in wich)", url: "https://www.christianlehmann.eu/publ/ASSidUE10.pdf" },
    { title: "Manuel Andrade, A grammar of modern Yucatec Maya (edición de Lehmann): u y-ich, koten", url: "https://www.christianlehmann.eu/ling/sprachen/maya/andrade/andrade_edit.php" },
    { title: "Blair y Vermont-Salas, Spoken Yucatec Maya (sitio de Christian Lehmann): kul-en, ko'ten", url: "https://www.christianlehmann.eu/ling/sprachen/maya/textos/bvs_1-18.html" },
    { title: "Mújica (1995), Junp'iit Maaya – A little bit of Maya (sitio de Christian Lehmann): u tseem, ko'oten", url: "https://www.christianlehmann.eu/ling/sprachen/maya/textos/hunp'iit_maaya.html" },
    { title: "SEP, Nueva Escuela Mexicana – La diversidad del corazón en diferentes lenguas indígenas (puksi'ik'al)", url: "https://nuevaescuelamexicana.sep.gob.mx/contenido/recurso/la-diversidad-del-corazon-en-diferentes-lenguas-indigenas/" },
    { title: "México Desconocido – El cenote Puksi'ik'al de Kanxoc", url: "https://www.mexicodesconocido.com.mx/cenote-puksiikal.html" },
    { title: "Redalyc – Rescate arqueológico en la cueva Pool Balam, «cabeza de jaguar»", url: "https://www.redalyc.org/pdf/745/74516316005.pdf" },
    { title: "PorEsto – Danza de la cabeza de cochino (pool, cabeza de animal)", url: "https://www.poresto.com/yucatan/2021/8/11/danza-de-la-cabeza-de-cochino-reconocido-sello-del-folclor-peninsular.amp.html" },
    { title: "Wiktionary – koh (maya yucateco): diente; pico", url: "https://en.wiktionary.org/wiki/koh" },
    { title: "Wiktionary – blood, traducciones (maya yucateco: k'i'ik')", url: "https://en.wiktionary.org/wiki/blood/translations" },
    { title: "Wikcionario – yaj (maya yucateco): daño, dolor", url: "https://es.wiktionary.org/wiki/yaj" },
    { title: "Wikcionario – ts'ak yaj (maya yucateco): médico, curandero", url: "https://es.wiktionary.org/wiki/ts%CA%BCak_yaj" },
    { title: "Material didáctico de maya yucateco titulado «Material»: yaj in pool, yaj in nak'" },
    { title: "Yucatán Today – The J-meenes or Maya medicine men", url: "https://yucatantoday.com/en/blog/the-j-meenes-or-maya-medicine-men" },
    { title: "Bolles, gramática del maya yucateco en FAMSI: los chamanes (H-Men)", url: "https://www.famsi.org/research/bolles/shamans/index.html" },
    { title: "Castillo Tzec, U áanalte'il u tsikbalil ts'aak – Manual de frases médicas (Indemaya y Conalep Yucatán)" },
    { title: "Posta – Presentan manual de frases médicas en lengua maya (Indemaya y Conalep Yucatán)", url: "https://www.posta.com.mx/yucatan/presentan-manual-de-frases-medicas-en-lengua-maya/vl2163920" },
    { title: "Gobierno del Estado de Yucatán, Sala de prensa – Presentan manual de frases médicas en lengua maya (Indemaya y Conalep Yucatán)", url: "https://www.yucatan.gob.mx/saladeprensa/ver_nota.php?id=10514" },
    { title: "INEA / MEVyT – Lengua maya (Yucatán): vocales y consonantes (k'ab, aak', ook, ts'aak)", url: "https://www.cursosinea.conevyt.org.mx/cursos/lenguas_indigenas/yucatan/maya.htm" },
    { title: "Aprendiendo Maya – Consonantes (nak', píix, baak)", url: "https://www.aprendiendomaya.com/escritura/alfabeto-maya" },
    { title: "Aprendiendo Maya – Las vocales y sus reglas de uso (paach, aak')", url: "https://aprendiendomaya.com/escritura/vocales/las-vocales-y-sus-reglas-de-uso" },
    { title: "Normas de escritura para la lengua maya: iim" },
    { title: "Yoshida, Guía gramatical de la lengua maya yucateca para hispanohablantes (juego B, w/y de unión)" },
    { title: "Lehmann, Gramática maya: oración negativa (ma' … -i')", url: "https://www.christianlehmann.eu/ling/sprachen/maya/gramatica/onomas/negacion.html" },
    { title: "Heraldo de México (Yucatán) – ¿Cómo saludar en lengua maya? (K'oja'anen)", url: "https://yucatan.heraldodemexico.com.mx/tendencias/2025/12/17/como-saludar-en-lengua-maya-expresiones-para-iniciar-una-conversacion-en-yucatan-3439.html" },
    { title: "Yucatán Today – Say it in Maya (K'oja'anen)", url: "https://yucatantoday.com/en/blog/say-it-in-maya" },
    { title: "INALI – Prontuario de frases de cortesía Maayat'aan (Máanen waye')", url: "https://site.inali.gob.mx/Micrositios/Prontuarios/maya.html" },
    { title: "Wiktionary – kutal (consultado en una copia de 2024; cita a Gómez Navarrete 2009): kulen", url: "https://en.wiktionary.org/wiki/kutal" },
    { title: "Wiktionary – taal (maya yucateco): ko'oten", url: "https://en.wiktionary.org/wiki/taal" },
    { title: "parryc – Yucatec Maya (ts'o'ok in janal)", url: "https://parryc.com/language/yucatec-maya" },
    { title: "AnderBois (2018), la partícula de pregunta wáaj (Cuadernos de Lingüística, SciELO)", url: "https://www.scielo.org.mx/scielo.php?script=sci_arttext&pid=S2007-736X2018000100388" }
  ],
  lessons: [
    {
      id: "u7l1",
      title: "El cuerpo",
      goal: "Al terminar podrás nombrar partes del cuerpo como la mano, el pie, la nariz o la espalda, y decir «mi mano» o «su pie».",
      teach: [
        {
          kind: "text",
          title: "Del rostro a los pies",
          html: "En la cara: la nariz es <span class=\"m\">ni'</span>, la boca <span class=\"m\">chi'</span>, la oreja <span class=\"m\">xikin</span> y la lengua <span class=\"m\">aak'</span>.<br>En el resto del cuerpo: la mano <span class=\"m\">k'ab</span>, el pecho <span class=\"m\">tseem</span>, la barriga <span class=\"m\">nak'</span>, la espalda <span class=\"m\">paach</span>, la rodilla <span class=\"m\">píix</span> y el pie <span class=\"m\">ook</span>. Por dentro, el hueso es <span class=\"m\">baak</span>."
        },
        {
          kind: "tip",
          title: "Mi mano, su pie",
          html: "Con los posesivos que ya conoces: <span class=\"m\">in k'ab</span> (mi mano), <span class=\"m\">a k'ab</span> (tu mano), <span class=\"m\">u k'ab</span> (su mano).<br>Si la palabra empieza con vocal, se agrega una letra de unión: <span class=\"m\">in wook</span> (mi pie), <span class=\"m\">a wook</span> (tu pie), <span class=\"m\">u yook</span> (su pie). Es la misma regla de <span class=\"m\">in wotoch</span>, «mi casa».<br>La regla está confirmada, pero estas tres formas con <span class=\"m\">ook</span> todavía no las vimos en una fuente académica: por ahora la app no te pide escribirlas."
        },
        {
          kind: "text",
          title: "Una lengua para hablar y otra para comer",
          html: "En español, «lengua» es el órgano y también el idioma. En maya son palabras distintas: <span class=\"m\">aak'</span> es la lengua de la boca (y también el bejuco), y <span class=\"m\">t'aan</span> es la lengua que se habla, como en <span class=\"m\">maaya t'aan</span>.<br>Ojo: <span class=\"m\">aak'</span> no es <span class=\"m\">áak</span> (tortuga), y <span class=\"m\">baak</span> (hueso) no es <span class=\"m\">bak'</span> (carne)."
        },
        {
          kind: "tip",
          title: "Más partes del cuerpo",
          html: "La cabeza (<span class=\"m\">pool</span>), el ojo (<span class=\"m\">ich</span>), el diente (<span class=\"m\">koj</span>) y el corazón (<span class=\"m\">puksi'ik'al</span>) los verás en la lección «Cabeza, ojos y corazón» de esta unidad.<br>El pecho, el tórax, es <span class=\"m\">tseem</span>, con vocal larga de tono bajo: así lo escriben el diccionario de la UADY y el manual Junp'iit Maaya. No lo confundas con <span class=\"m\">iim</span>, que es el seno o la mama."
        }
      ],
      vocab: [
        { id: "u7-kab", m: "k'ab", es: "mano", pr: "k'ab", note: "Muchas guías la dan también como «brazo»; la fuente que la confirma dice «mano».", ex: { m: "in k'ab", es: "mi mano" }, conf: "alta" },
        { id: "u7-ook", m: "ook", es: "pie", pr: "ook", note: "Empieza con vocal: in wook (mi pie), u yook (su pie). Esas dos formas siguen la regla de unión, pero aún no las vimos en una fuente académica.", conf: "alta" },
        { id: "u7-ni", m: "ni'", es: "nariz", pr: "ni-", note: "Termina con corte de voz.", conf: "alta" },
        { id: "u7-chi", m: "chi'", es: "boca; orilla", pr: "chi-", note: "La misma palabra nombra la boca y la orilla.", conf: "alta" },
        { id: "u7-xikin", m: "xikin", es: "oreja; oído", pr: "shikin", note: "La x suena «sh».", conf: "alta" },
        { id: "u7-aak", m: "aak'", es: "lengua (órgano); bejuco", pr: "aak'", note: "Vocal larga de tono bajo y k' al final. No confundir con áak (tortuga) ni con t'aan (lengua que se habla).", conf: "alta" },
        { id: "u7-nak", m: "nak'", es: "barriga, vientre, estómago", pr: "nak'", note: "k' glotalizada al final. Aparece en Yaj in nak', «me duele el estómago».", conf: "alta" },
        { id: "u7-paach", m: "paach", es: "espalda", pr: "paach", note: "Vocal larga de tono bajo. Sirve para la espalda de una persona o de un animal.", conf: "alta" },
        { id: "u7-piix", m: "píix", es: "rodilla", pr: "píish", note: "Tono alto; la x suena «sh». Sin tono, piix es «vaina, funda».", conf: "alta" },
        { id: "u7-baak", m: "baak", es: "hueso", pr: "baak", note: "Vocal larga. Con vocal corta y k', bak' es «carne».", conf: "alta" },
        { id: "u7-tseem", m: "tseem", es: "pecho (tórax)", pr: "tseem", note: "Vocal larga de tono bajo. Para el seno o la mama se usa iim.", conf: "alta" },
        { id: "u7-iim", m: "iim", es: "seno, mama", pr: "iim", note: "Vocal larga.", conf: "alta" }
      ],
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "k'ab", promptLang: "m", answer: "mano", options: ["mano", "pie", "boca"] },
        { type: "choice", q: "¿Cómo se dice «nariz»?", prompt: "nariz", promptLang: "es", answer: "ni'", options: ["ni'", "chi'", "iik'"] },
        { type: "fill", es: "mi espalda", before: "in", after: "", answer: "paach", options: ["paach", "píix", "baak"] },
        { type: "build", es: "mi mano y mi pecho", m: "in k'ab yéetel in tseem", distractors: ["u", "iim"] },
        { type: "choice", q: "¿Qué significa?", prompt: "aak'", promptLang: "m", answer: "lengua (órgano); bejuco", options: ["lengua (órgano); bejuco", "tortuga", "palabra, idioma"] },
        { type: "type", q: "Escribe en maya", prompt: "oreja", answer: "xikin" },
        { type: "choice", q: "¿Cómo se dice «pecho» (el tórax)?", prompt: "pecho (tórax)", promptLang: "es", answer: "tseem", options: ["tseem", "paach", "nak'"] },
        { type: "choice", q: "Repaso: ¿qué significa?", prompt: "baak", promptLang: "m", answer: "hueso", options: ["hueso", "carne", "rodilla"] }
      ]
    },
    {
      id: "u7l2",
      title: "¿Estás enfermo?",
      goal: "Al terminar podrás decir que estás enfermo o que no lo estás, preguntar si alguien lo está y nombrar la enfermedad.",
      teach: [
        {
          kind: "text",
          title: "Enfermo-yo",
          html: "<span class=\"m\">k'oja'an</span> es «enfermo» o «enferma». Igual que con el hambre (<span class=\"m\">wi'ijen</span>), se le pega la persona al final: <span class=\"m\">K'oja'anen</span>, «estoy enfermo» o «estoy enferma»; aquí el maya no marca si eres hombre o mujer.<br>Para «tú»: <span class=\"m\">k'oja'anech</span>. Para él o ella no se agrega nada: <span class=\"m\">K'oja'an in na'</span>, «mi mamá está enferma»."
        },
        {
          kind: "tip",
          title: "Preguntar y negar",
          html: "Para preguntar, agrega <span class=\"m\">wáaj</span>: <span class=\"m\">K'oja'anech wáaj?</span>, «¿estás enfermo?».<br>Para negar, rodea la frase con <span class=\"m\">ma'</span> … <span class=\"m\">-i'</span>, como en <span class=\"m\">Ma' wi'ijeni'</span>: <span class=\"m\">Ma' k'oja'aneni'</span>, «no estoy enfermo».<br>Estas frases siguen reglas descritas en las gramáticas, pero no las vimos escritas tal cual: por eso van «por confirmar»."
        },
        {
          kind: "text",
          title: "Una raíz, varias palabras",
          html: "De <span class=\"m\">k'oja'an</span> salen <span class=\"m\">k'oja'anil</span>, «enfermedad» (la terminación <span class=\"m\">-il</span> forma un sustantivo), y <span class=\"m\">k'oja'antal</span>, «enfermarse». En diccionarios antiguos verás <span class=\"m\">k'oha'an</span>, con h.<br>Otras palabras útiles: <span class=\"m\">k'an ch'uuy</span> (pálido), <span class=\"m\">u'uy</span> (sentir) y <span class=\"m\">ch'a' iik'</span> (respirar), donde aparece <span class=\"m\">iik'</span>, el aire."
        },
        {
          kind: "tip",
          title: "¿Y «me duele»?",
          html: "«Me duele…» lo verás en la lección «¿Qué te duele?», cuando ya conozcas la cabeza y los dientes.<br>«Fiebre», «tos», «vómito» y «salud» llegan en la última lección de esta unidad, «Fiebre, tos y otros síntomas»."
        }
      ],
      vocab: [
        { id: "u7-kojaan", m: "k'oja'an", es: "enfermo, enferma", pr: "k'oja-an", note: "Vocal rearticulada a'a. En diccionarios antiguos: k'oha'an.", conf: "alta" },
        { id: "u7-kojaanen", m: "K'oja'anen.", es: "Estoy enfermo / enferma.", pr: "k'oja-anen", note: "k'oja'an + -en (yo).", conf: "alta" },
        { id: "u7-kojaanech-waaj", m: "K'oja'anech wáaj?", es: "¿Estás enfermo / enferma?", pr: "k'oja-anech wáaj", note: "k'oja'an + -ech (tú) + wáaj (pregunta de sí o no). Armada con reglas confirmadas.", conf: "media" },
        { id: "u7-ma-kojaaneni", m: "Ma' k'oja'aneni'.", es: "No estoy enfermo / enferma.", pr: "ma- k'oja-aneni-", note: "Negación de un estado: ma' … -i'.", conf: "media" },
        { id: "u7-kojaan-in-na", m: "K'oja'an in na'.", es: "Mi mamá está enferma.", pr: "k'oja-an in na-", note: "Para él o ella el estado no lleva terminación; primero va el estado y después la persona.", conf: "media" },
        { id: "u7-kojaanil", m: "k'oja'anil", es: "enfermedad", pr: "k'oja-anil", note: "k'oja'an + -il.", conf: "alta" },
        { id: "u7-kojaantal", m: "k'oja'antal", es: "enfermarse", pr: "k'oja-antal", conf: "alta" },
        { id: "u7-kan-chuuy", m: "k'an ch'uuy", es: "pálido, pálida", pr: "k'an ch'uuy", conf: "alta" },
        { id: "u7-uuy", m: "u'uy", es: "sentir", pr: "u-uy", note: "Vocal rearticulada u'u.", conf: "alta" },
        { id: "u7-cha-iik", m: "ch'a' iik'", es: "respirar", pr: "ch'a- iik'", note: "Aparece iik', aire o aliento.", conf: "alta" }
      ],
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "K'oja'anen.", promptLang: "m", answer: "Estoy enfermo / enferma.", options: ["Estoy enfermo / enferma.", "Tengo hambre.", "Estoy contento."] },
        { type: "choice", q: "¿Cómo se dice «enfermedad»?", prompt: "enfermedad", promptLang: "es", answer: "k'oja'anil", options: ["k'oja'anil", "k'oja'an", "k'oja'antal"] },
        { type: "choice", q: "¿Qué significa?", prompt: "Ma' k'oja'aneni'.", promptLang: "m", answer: "No estoy enfermo / enferma.", options: ["No estoy enfermo / enferma.", "Estoy enfermo / enferma.", "No tengo hambre."] },
        { type: "type", q: "Escribe en maya", prompt: "Estoy enfermo / enferma.", answer: "K'oja'anen." },
        { type: "choice", q: "¿Qué significa?", prompt: "K'oja'an in na'.", promptLang: "m", answer: "Mi mamá está enferma.", options: ["Mi mamá está enferma.", "Estoy enferma.", "¿Estás enferma?"] },
        { type: "type", q: "Escribe en maya", prompt: "enfermo, enferma", answer: "k'oja'an" },
        { type: "choice", q: "¿Qué significa?", prompt: "ch'a' iik'", promptLang: "m", answer: "respirar", options: ["respirar", "sentir", "oler"] },
        { type: "choice", q: "Repaso: ¿qué significa?", prompt: "Uk'ajen.", promptLang: "m", answer: "Tengo sed.", options: ["Tengo sed.", "Estoy enfermo / enferma.", "Ya comí."] }
      ]
    },
    {
      id: "u7l3",
      title: "En la clínica: cortesía básica",
      goal: "Al terminar podrás recibir a alguien con respeto en maya, pedirle que pase y se siente, y hacer preguntas sencillas, sabiendo hasta dónde llegan estas frases.",
      teach: [
        {
          kind: "warn",
          title: "No sustituyen a un intérprete",
          html: "Estas frases sirven para saludar, recibir con respeto y acompañar. <b>No sustituyen a un intérprete ni a los materiales hechos para el personal de salud</b>, como el <i>Manual de frases médicas</i> (<span class=\"m\">U áanalte'il u tsikbalil ts'aak</span>), de Felipe de Jesús Castillo Tzec, que impulsaron el Indemaya y el Conalep Yucatán.<br>Para explicar un diagnóstico o un tratamiento, dar indicaciones o pedir un consentimiento, trabaja siempre con un intérprete. Este curso es experimental y no está validado para uso clínico."
        },
        {
          kind: "text",
          title: "Recibir y acomodar",
          html: "<span class=\"m\">Máanen waye'</span> es «pase usted» (literalmente «pasa por aquí»); viene del prontuario de cortesía del INALI. <span class=\"m\">Kulen</span> es «siéntate» y <span class=\"m\">Ko'oten</span>, «ven».<br>En maya no hay «usted»: <span class=\"m\">teech</span> sirve para tú y para usted. La cortesía se marca con el trato y con frases completas, como un buen saludo."
        },
        {
          kind: "tip",
          title: "Preguntas cortas",
          html: "<span class=\"m\">Ts'o'ok a janal?</span>, «¿ya comiste?», se arma como <span class=\"m\">Ts'o'ok in janal</span> (ya comí), con <span class=\"m\">a</span> (tú). <span class=\"m\">Yaan wáaj ts'aak?</span> es «¿hay medicina?», y la respuesta negativa, <span class=\"m\">Mina'an ts'aak</span>.<br>Si no entiendes: <span class=\"m\">Ma' tin na'atik</span> y <span class=\"m\">Chaambéel</span>, «despacio»."
        },
        {
          kind: "culture",
          title: "Escuchar es entender",
          html: "El diccionario de la UADY traduce <span class=\"m\">u'ub</span> como «oír, escuchar, entender»: en una sola palabra, oír y comprender van juntos. Vale para cualquier consulta: escuchar con calma es la mejor manera de empezar."
        }
      ],
      vocab: [
        { id: "u7-maanen-waye", m: "Máanen waye'.", es: "Pase usted. (lit. pasa por aquí)", pr: "máanen waye-", note: "Fórmula del prontuario de cortesía del INALI. Máanen es la orden de máan, pasar.", conf: "alta" },
        { id: "u7-kulen", m: "Kulen.", es: "Siéntate. / Siéntese.", pr: "kulen", note: "Orden del verbo kutal, sentarse. A varias personas: kulene'ex.", conf: "alta" },
        { id: "u7-kooten", m: "Ko'oten.", es: "Ven. / Venga.", pr: "ko-oten", note: "Orden irregular de taal, venir. A varias personas: ko'otene'ex.", conf: "alta" },
        { id: "u7-tsook-a-janal", m: "Ts'o'ok a janal?", es: "¿Ya comiste? / ¿Ya comió?", pr: "ts'o-ok a janal", note: "Como Ts'o'ok in janal (ya comí), con a (tú). No está confirmado si basta la entonación o si se agrega wáaj.", conf: "media" },
        { id: "u7-tsaak", m: "ts'aak", es: "medicina, remedio", pr: "ts'aak", note: "ts' glotalizada y vocal larga. La UADY la da también como verbo: curar, medicar. Aparece en el título del Manual de frases médicas: U áanalte'il u tsikbalil ts'aak.", conf: "alta" },
        { id: "u7-yaan-waaj-tsaak", m: "Yaan wáaj ts'aak?", es: "¿Hay medicina?", pr: "yaan wáaj ts'aak", note: "yaan (hay) + wáaj (pregunta de sí o no) + ts'aak.", conf: "media" },
        { id: "u7-minaan-tsaak", m: "Mina'an ts'aak.", es: "No hay medicina.", pr: "mina-an ts'aak", note: "Como Mina'an taak'in, «no hay dinero».", conf: "media" },
        { id: "u7-uub", m: "u'ub", es: "oír, escuchar; entender", pr: "u-ub", note: "Vocal rearticulada u'u.", conf: "alta" }
      ],
      dialogue: {
        title: "En el consultorio (diálogo de práctica)",
        lines: [
          { who: "A", name: "Dra. Pat", m: "Bix a beel?", es: "¿Cómo está?" },
          { who: "B", name: "Don Felipe", m: "K'oja'anen.", es: "Estoy enfermo." },
          { who: "A", name: "Dra. Pat", m: "Máanen waye'. Kulen.", es: "Pase usted. Siéntese." },
          { who: "B", name: "Don Felipe", m: "Dios bo'otik.", es: "Gracias." },
          { who: "A", name: "Dra. Pat", m: "Ts'o'ok a janal?", es: "¿Ya comió?" },
          { who: "B", name: "Don Felipe", m: "Ma' tin na'atik. Chaambéel, meent uts.", es: "No entiendo. Despacio, por favor." },
          { who: "A", name: "Dra. Pat", m: "Ts'o'ok… a… janal?", es: "¿Ya… comió?" },
          { who: "B", name: "Don Felipe", m: "Ma'. Wi'ijen.", es: "No. Tengo hambre." }
        ]
      },
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "Máanen waye'.", promptLang: "m", answer: "Pase usted.", options: ["Pase usted.", "Siéntese.", "Hasta mañana."] },
        { type: "choice", q: "Invitas a alguien a sentarse. ¿Qué dices?", prompt: "Siéntese.", promptLang: "es", answer: "Kulen.", options: ["Kulen.", "Ko'oten.", "Máanen waye'."] },
        { type: "choice", q: "¿Qué significa?", prompt: "Yaan wáaj ts'aak?", promptLang: "m", answer: "¿Hay medicina?", options: ["¿Hay medicina?", "No hay medicina.", "¿Ya comió?"] },
        { type: "build", es: "agua y medicina", m: "ja' yéetel ts'aak", distractors: ["mina'an", "wáaj"] },
        { type: "type", q: "Escribe en maya", prompt: "medicina, remedio", answer: "ts'aak" },
        { type: "choice", q: "¿Qué significa?", prompt: "Ts'o'ok a janal?", promptLang: "m", answer: "¿Ya comiste?", options: ["¿Ya comiste?", "¿Tienes hambre?", "¿Estás enfermo?"] },
        { type: "choice", q: "Repaso: ¿cómo dices «no entiendo»?", prompt: "No entiendo.", promptLang: "es", answer: "Ma' tin na'atik.", options: ["Ma' tin na'atik.", "Tin na'atik.", "Ma' in wojeli'."] },
        { type: "choice", q: "¿Qué significa?", prompt: "u'ub", promptLang: "m", answer: "oír, escuchar; entender", options: ["oír, escuchar; entender", "sentir", "respirar"] }
      ]
    },
    {
      id: "u7l4",
      title: "Cabeza, ojos y corazón",
      goal: "Al terminar podrás nombrar la cabeza, el ojo, el diente, el cabello, el cuello, el corazón y la sangre, y decir «mi cabeza» o «mi diente».",
      teach: [
        {
          kind: "text",
          title: "La cabeza",
          html: "Para «cabeza» hay dos palabras, <span class=\"m\">pool</span> y <span class=\"m\">jo'ol</span>, y el diccionario de la UADY da las dos. <span class=\"m\">pool</span> sirve también para la cabeza de un animal: el nombre de la cueva Pool Balam, en Yucatán, quiere decir «cabeza de jaguar».<br>Según Lehmann, <span class=\"m\">jo'ol</span> es también el pelo de la cabeza. En textos antiguos verás <i>ho'l</i>."
        },
        {
          kind: "text",
          title: "La cara y el cuello",
          html: "<span class=\"m\">ich</span> es el ojo y también la cara. Suena igual que <span class=\"m\">ich</span>, «en, dentro de», como en <span class=\"m\">Ka t'aan wáaj ich maaya?</span>, «¿hablas maya?». El diente es <span class=\"m\">koj</span> (también el pico de un ave) y el cuello, <span class=\"m\">kaal</span>; no lo confundas con <span class=\"m\">k'aal</span>, «veinte».<br>El cabello se dice con posesivo: <span class=\"m\">in tso'otsel</span>, «mi cabello». Lehmann lo escribe <i>in tso'tsel</i>, con una grafía más antigua; el diccionario de la UADY escribe <span class=\"m\">tso'otsel</span> y llama al cabello de la cabeza <span class=\"m\">tso'otsel pool</span>."
        },
        {
          kind: "text",
          title: "Por dentro",
          html: "El corazón es <span class=\"m\">puksi'ik'al</span>: tiene una vocal rearticulada (i'i) y una k' glotalizada. En Kanxoc, Yucatán, hay un cenote que lleva ese nombre.<br>La sangre es <span class=\"m\">k'i'ik'</span>, con k' al principio y al final. Y ya conoces <span class=\"m\">baak</span>, el hueso."
        },
        {
          kind: "tip",
          title: "Mi cabeza, tu ojo",
          html: "Lo más común es nombrar las partes del cuerpo con su posesivo: <span class=\"m\">in pool</span> (mi cabeza), <span class=\"m\">a koj</span> (tu diente), <span class=\"m\">u puksi'ik'al</span> (su corazón).<br>Con vocal inicial se agrega la letra de unión, como en <span class=\"m\">in wook</span>: <span class=\"m\">in wich</span> (mi ojo), <span class=\"m\">u yich</span> (su ojo). Estas dos sí aparecen tal cual en las gramáticas de Lehmann y de Andrade."
        }
      ],
      vocab: [
        { id: "u7-pool", m: "pool", es: "cabeza", pr: "pool", note: "Vocal larga de tono bajo. Sirve también para la cabeza de un animal.", ex: { m: "in pool", es: "mi cabeza" }, conf: "alta" },
        { id: "u7-jool", m: "jo'ol", es: "cabeza; pelo de la cabeza", pr: "jo-ol", note: "Vocal rearticulada o'o. En textos antiguos: ho'l.", conf: "alta" },
        { id: "u7-ich", m: "ich", es: "ojo; cara", pr: "ich", note: "Suena igual que ich, «en, dentro de». Empieza con vocal: in wich (mi ojo), u yich (su ojo).", ex: { m: "in wich", es: "mi ojo; mi cara" }, conf: "alta" },
        { id: "u7-koj", m: "koj", es: "diente; pico (de ave)", pr: "koj", note: "La j suena suave. En textos antiguos: koh.", ex: { m: "in koj", es: "mi diente" }, conf: "alta" },
        { id: "u7-in-tsootsel", m: "in tso'otsel", es: "mi cabello, mi pelo", pr: "in tso-otsel", note: "Se dice con posesivo. Lehmann escribe in tso'tsel, con una grafía más antigua; la UADY, tso'otsel.", conf: "alta" },
        { id: "u7-kaal", m: "kaal", es: "cuello", pr: "kaal", note: "Vocal larga de tono bajo. No confundir con k'aal, «veinte».", conf: "alta" },
        { id: "u7-puksiikal", m: "puksi'ik'al", es: "corazón", pr: "puksi-ik'al", note: "Vocal rearticulada i'i y k' glotalizada.", conf: "alta" },
        { id: "u7-kiik-sangre", m: "k'i'ik'", es: "sangre", pr: "k'i-ik'", note: "k' glotalizada al principio y al final, y vocal rearticulada i'i.", conf: "alta" }
      ],
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "pool", promptLang: "m", answer: "cabeza", options: ["cabeza", "corazón", "cuello"] },
        { type: "choice", q: "¿Cómo se dice «corazón»?", prompt: "corazón", promptLang: "es", answer: "puksi'ik'al", options: ["puksi'ik'al", "k'i'ik'", "kaal"] },
        { type: "fill", es: "mi diente", before: "in", after: "", answer: "koj", options: ["koj", "kaal", "ich"] },
        { type: "type", q: "Escribe en maya", prompt: "sangre", answer: "k'i'ik'" },
        { type: "fill", es: "mi ojo", before: "in", after: "", answer: "wich", options: ["wich", "yich", "ich"] },
        { type: "build", es: "mi cabeza y mi corazón", m: "in pool yéetel in puksi'ik'al", distractors: ["u", "koj"] },
        { type: "type", q: "Escribe en maya", prompt: "cuello", answer: "kaal" },
        { type: "choice", q: "¿Qué significa?", prompt: "jo'ol", promptLang: "m", answer: "cabeza; pelo de la cabeza", options: ["cabeza; pelo de la cabeza", "ojo; cara", "sangre"] }
      ]
    },
    {
      id: "u7l5",
      title: "¿Qué te duele?",
      goal: "Al terminar podrás decir qué te duele, preguntar si a alguien le duele la cabeza y nombrar al médico y al curandero tradicional.",
      teach: [
        {
          kind: "text",
          title: "Yaj: me duele",
          html: "<span class=\"m\">yaj</span> es «dolor» o «daño»: es la palabra general para el dolor. Para decir qué te duele, pon <span class=\"m\">yaj</span> y después la parte del cuerpo con su posesivo: <span class=\"m\">Yaj in pool</span>, «me duele la cabeza»; <span class=\"m\">Yaj in nak'</span>, «me duele el estómago».<br>Con la misma regla: <span class=\"m\">Yaj in koj</span> (me duele el diente), <span class=\"m\">Yaj in paach</span> (me duele la espalda) y, como <span class=\"m\">ook</span> empieza con vocal, <span class=\"m\">Yaj in wook</span> (me duele el pie)."
        },
        {
          kind: "tip",
          title: "Preguntar, y por qué «por confirmar»",
          html: "Para preguntar, <span class=\"m\">wáaj</span> va después de la primera palabra, como en <span class=\"m\">K'oja'anech wáaj?</span>: <span class=\"m\">Yaj wáaj a pool?</span>, «¿te duele la cabeza?».<br><span class=\"m\">yaj</span> ya está confirmado en el diccionario de la UADY, y la construcción tiene apoyo en un artículo académico de la UADY. Pero las frases completas no las vimos escritas en una fuente académica: las de la cabeza y el estómago vienen de un material didáctico, y las demás las armamos con la regla. Por eso van «por confirmar»."
        },
        {
          kind: "warn",
          title: "Para acompañar, no para diagnosticar",
          html: "Para el dolor de cabeza y el de muelas, los artículos de la UADY usan además <span class=\"m\">chi'ibal</span>: lo verás en la lección siguiente, junto con la fiebre, la tos y el vómito.<br>Estas frases sirven para mostrar interés y cercanía, <b>no para hacer un diagnóstico</b>: para preguntar síntomas con precisión, trabaja con un intérprete."
        },
        {
          kind: "culture",
          title: "El jmeen y el ts'ak yaj",
          html: "<span class=\"m\">jmeen</span> es el curandero tradicional, que también es sacerdote maya. La <span class=\"m\">j-</span> inicial es el prefijo de los nombres masculinos, y en textos antiguos verás <i>h-men</i>.<br><span class=\"m\">ts'ak yaj</span>, literalmente «cura-dolor», nombra al médico o al curandero. Así la escriben el diccionario de la UADY y Wikcionario: en el compuesto, <span class=\"m\">ts'ak</span> va con vocal corta, aunque <span class=\"m\">ts'aak</span>, «medicina; curar», la lleva larga. Para «médico», la UADY da también <span class=\"m\">ts'ak máak</span>."
        }
      ],
      vocab: [
        { id: "u7-yaj", m: "yaj", es: "dolor; daño", pr: "yaj", note: "Vocal corta, como la escribe el diccionario de la UADY. Es la palabra general para el dolor.", conf: "alta" },
        { id: "u7-yaj-in-pool", m: "Yaj in pool.", es: "Me duele la cabeza.", pr: "yaj in pool", note: "yaj + in (mi) + pool (cabeza). Vista en un material didáctico.", conf: "media" },
        { id: "u7-yaj-in-nak", m: "Yaj in nak'.", es: "Me duele el estómago.", pr: "yaj in nak'", note: "Vista en el mismo material didáctico.", conf: "media" },
        { id: "u7-yaj-in-koj", m: "Yaj in koj.", es: "Me duele el diente.", pr: "yaj in koj", note: "Armada con la misma regla: yaj + posesivo + parte del cuerpo.", conf: "media" },
        { id: "u7-yaj-in-paach", m: "Yaj in paach.", es: "Me duele la espalda.", pr: "yaj in paach", note: "Armada con la misma regla.", conf: "media" },
        { id: "u7-yaj-in-wook", m: "Yaj in wook.", es: "Me duele el pie.", pr: "yaj in wook", note: "ook empieza con vocal: in wook. Armada con la misma regla.", conf: "media" },
        { id: "u7-yaj-waaj-a-pool", m: "Yaj wáaj a pool?", es: "¿Te duele la cabeza? / ¿Le duele la cabeza?", pr: "yaj wáaj a pool", note: "wáaj va después de la primera palabra. Armada por regla.", conf: "media" },
        { id: "u7-tsak-yaj", m: "ts'ak yaj", es: "médico; curandero (lit. cura-dolor)", pr: "ts'ak yaj", note: "ts'ak (cura) + yaj (dolor), con dos vocales cortas; ts'aak, «medicina; curar», lleva vocal larga. La UADY da también ts'ak máak para «médico».", conf: "alta" },
        { id: "u7-jmeen", m: "jmeen", es: "curandero tradicional; sacerdote maya", pr: "jmeen", note: "j- es el prefijo masculino. Grafía antigua: h-men.", conf: "alta" }
      ],
      dialogue: {
        title: "¿Qué le duele? (diálogo de práctica)",
        lines: [
          { who: "A", name: "Dra. Pat", m: "Bix a beel?", es: "¿Cómo está?" },
          { who: "B", name: "Doña Rosa", m: "K'oja'anen. Yaj in pool.", es: "Estoy enferma. Me duele la cabeza." },
          { who: "A", name: "Dra. Pat", m: "Yaj wáaj a nak'?", es: "¿Le duele el estómago?" },
          { who: "B", name: "Doña Rosa", m: "Ma'. Yaj in paach.", es: "No. Me duele la espalda." },
          { who: "A", name: "Dra. Pat", m: "Kulen. Ts'o'ok a janal?", es: "Siéntese. ¿Ya comió?" },
          { who: "B", name: "Doña Rosa", m: "Ts'o'ok in janal.", es: "Ya comí." },
          { who: "A", name: "Dra. Pat", m: "Pa'atik in jáan máan.", es: "Con permiso." }
        ]
      },
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "Yaj in pool.", promptLang: "m", answer: "Me duele la cabeza.", options: ["Me duele la cabeza.", "Me duele el estómago.", "Estoy enfermo / enferma."] },
        { type: "choice", q: "¿Qué significa?", prompt: "Yaj wáaj a pool?", promptLang: "m", answer: "¿Te duele la cabeza?", options: ["¿Te duele la cabeza?", "Me duele la cabeza.", "¿Estás enfermo / enferma?"] },
        { type: "choice", q: "¿Qué significa?", prompt: "Yaj in nak'.", promptLang: "m", answer: "Me duele el estómago.", options: ["Me duele el estómago.", "Me duele la espalda.", "Tengo hambre."] },
        { type: "type", q: "Escribe en maya", prompt: "curandero tradicional; sacerdote maya", answer: "jmeen" },
        { type: "choice", q: "¿Qué significa?", prompt: "ts'ak yaj", promptLang: "m", answer: "médico; curandero", options: ["médico; curandero", "medicina, remedio", "enfermedad"] },
        { type: "choice", q: "¿Qué significa?", prompt: "Yaj in wook.", promptLang: "m", answer: "Me duele el pie.", options: ["Me duele el pie.", "Me duele la mano.", "Me duele el diente."] },
        { type: "build", es: "mi diente y mi espalda", m: "in koj yéetel in paach", distractors: ["yaj", "u"] },
        { type: "choice", q: "Repaso: ¿qué significa?", prompt: "ts'aak", promptLang: "m", answer: "medicina, remedio", options: ["medicina, remedio", "dolor; daño", "curandero tradicional"] }
      ]
    },
    {
      id: "u7l6",
      title: "Fiebre, tos y otros síntomas",
      goal: "Al terminar podrás nombrar la fiebre, la tos y el vómito, reconocer otras palabras para el dolor, como el dolor de cabeza o el de muelas, y la palabra para «salud».",
      teach: [
        {
          kind: "text",
          title: "Fiebre, tos y vómito",
          html: "La fiebre o calentura es <span class=\"m\">chokwil</span>; comparte raíz con <span class=\"m\">chokoj</span>, «caliente», que viste en la unidad de comida. La tos es <span class=\"m\">se'en</span>, y la misma palabra sirve para «toser». El vómito es <span class=\"m\">xeej</span>, que también es «vomitar»; la x suena «sh».<br>Las tres vienen del diccionario de la UADY. En <span class=\"m\">xeej</span> queda una duda: el diccionario no marca tono, pero un artículo de la UADY sobre partería escribe <i>xéej</i>, con tono alto. Por eso va «por confirmar»."
        },
        {
          kind: "text",
          title: "Tres palabras para el dolor",
          html: "Según un artículo de la UADY sobre cómo se entiende el dolor en la cultura maya, hay tres raíces básicas: <span class=\"m\">yaj</span>, la más general; <span class=\"m\">chi'ibal</span>, el dolor que muerde o arde, y <span class=\"m\">k'i'inam</span>, el dolor que late o no se quita.<br>Con <span class=\"m\">chi'ibal</span> se dice <span class=\"m\">chi'ibal pool</span>, «dolor de cabeza», y <span class=\"m\">chi'ibal koj</span>, «dolor de muelas». El mismo artículo cuenta que parte de este vocabulario casi no se usa hoy, salvo entre las personas mayores, y que al hablar muchos dicen <i>yaan dóolor</i>, con la palabra del español."
        },
        {
          kind: "tip",
          title: "Cuida la escritura",
          html: "<span class=\"m\">chi'ibal</span> y <span class=\"m\">k'i'inam</span> llevan vocal rearticulada (i'i). Wikcionario y Glosbe escriben <i>k'iinam</i>, sin el corte, pero el diccionario de la UADY escribe <span class=\"m\">k'i'inam</span>.<br>Para «salud», el mismo diccionario da <span class=\"m\">toj óolal</span>, emparentada con <span class=\"m\">toj óol</span>, «sano», y con <span class=\"m\">óol</span>, el ánimo. Va «por confirmar» porque otras fuentes escriben <i>tooj</i>, con vocal larga, en frases parecidas."
        },
        {
          kind: "warn",
          title: "Vocabulario, no diagnóstico",
          html: "Estas palabras te sirven para entender y acompañar. <b>No sustituyen a un intérprete</b>: para preguntar síntomas, explicar un tratamiento o pedir un consentimiento, trabaja con un intérprete o con material validado por hablantes. Este curso es experimental y no está validado para uso clínico."
        }
      ],
      vocab: [
        { id: "u7-chokwil", m: "chokwil", es: "fiebre, calentura", pr: "chokwil", note: "Comparte raíz con chokoj, «caliente». Así la da el diccionario de la UADY.", conf: "alta" },
        { id: "u7-seen", m: "se'en", es: "tos; toser", pr: "se-en", note: "Vocal rearticulada e'e. Sirve como sustantivo y como verbo. Para «toser», la UADY da también sasa' kaal.", conf: "alta" },
        { id: "u7-xeej", m: "xeej", es: "vómito; vomitar", pr: "sheej", note: "La x suena «sh» y la vocal es larga. El diccionario de la UADY escribe xeej, sin tono; un artículo de la UADY escribe xéej, con tono alto: por confirmar.", conf: "media" },
        { id: "u7-chiibal", m: "chi'ibal", es: "dolor (que muerde o arde); morder; ladrar", pr: "chi-ibal", note: "Vocal rearticulada i'i. El diccionario de la UADY la da con los tres sentidos.", conf: "alta" },
        { id: "u7-chiibal-pool", m: "chi'ibal pool", es: "dolor de cabeza, jaqueca", pr: "chi-ibal pool", note: "chi'ibal (dolor) + pool (cabeza). Lo registran dos artículos de la UADY.", conf: "alta" },
        { id: "u7-chiibal-koj", m: "chi'ibal koj", es: "dolor de muelas", pr: "chi-ibal koj", note: "chi'ibal (dolor) + koj (diente, muela). Lo registra un artículo de la UADY.", conf: "alta" },
        { id: "u7-kiinam", m: "k'i'inam", es: "dolor (continuo, que late; físico o moral)", pr: "k'i-inam", note: "Vocal rearticulada i'i: no se escribe k'iinam. Para el dolor en general se usa yaj.", conf: "alta" },
        { id: "u7-toj-oolal", m: "toj óolal", es: "salud", pr: "toj óolal", note: "La UADY escribe toj oolal; el tono alto de óolal sigue a toj óol, «sano», del mismo diccionario. Otras fuentes escriben tooj, con vocal larga: por confirmar.", conf: "media" }
      ],
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "chokwil", promptLang: "m", answer: "fiebre, calentura", options: ["fiebre, calentura", "tos; toser", "caliente"] },
        { type: "choice", q: "¿Cómo se dice «tos»?", prompt: "tos; toser", promptLang: "es", answer: "se'en", options: ["se'en", "chokwil", "chi'ibal"] },
        { type: "choice", q: "¿Qué significa?", prompt: "xeej", promptLang: "m", answer: "vómito; vomitar", options: ["vómito; vomitar", "fiebre, calentura", "dolor de cabeza, jaqueca"] },
        { type: "choice", q: "¿Qué significa?", prompt: "chi'ibal pool", promptLang: "m", answer: "dolor de cabeza, jaqueca", options: ["dolor de cabeza, jaqueca", "dolor de muelas", "fiebre, calentura"] },
        { type: "fill", es: "dolor de muelas", before: "chi'ibal", after: "", answer: "koj", options: ["koj", "pool", "kaal"] },
        { type: "build", es: "fiebre y tos", m: "chokwil yéetel se'en", distractors: ["chi'ibal", "yaj"] },
        { type: "choice", q: "Cuidado con la forma: ¿qué significa?", prompt: "k'i'inam", promptLang: "m", answer: "dolor (continuo, que late)", options: ["dolor (continuo, que late)", "sangre", "fiebre, calentura"] },
        { type: "choice", q: "¿Qué significa?", prompt: "toj óolal", promptLang: "m", answer: "salud", options: ["salud", "enfermedad", "medicina, remedio"] }
      ]
    }
  ]
});
