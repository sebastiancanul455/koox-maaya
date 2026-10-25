/* Unidad 5 · Día a día. Solo formas con estado «verificado» (conf alta) o «probable» (conf media) en la base. */
(window.COURSE = window.COURSE || { units: [] }).units.push({
  id: "u5",
  n: 5,
  title: "Día a día",
  subtitle: "Verbos en presente, preguntas y frases para el aprendiz",
  sources: [
    { title: "UADY – Curso de maya, lección 3 (pronombres y presente)", url: "https://www.mayas.uady.mx/curso_maya/lec3intro.html" },
    { title: "UADY – Curso de maya, respuestas de la lección 1 (kin xook bul k'iin)", url: "https://www.mayas.uady.mx/curso_maya/respuestas1.html" },
    { title: "Yoshida, Guía gramatical de la lengua maya yucateca para hispanohablantes" },
    { title: "Lehmann, Gramática maya: oración negativa", url: "https://www.christianlehmann.eu/ling/sprachen/maya/gramatica/onomas/negacion.html" },
    { title: "Bolles y Bolles, A Grammar and Anthology of the Yucatecan Mayan Language (FAMSI)", url: "https://www.famsi.org/reports/96072/grammar/index.html" },
    { title: "Ayuntamiento de Mérida – Frases básicas español-maya (PDF)", url: "https://www.merida.gob.mx/municipio/sitiosphp/merida/descargas/frases_espano_maya.pdf" },
    { title: "Wiktionary – janal (maya yucateco)", url: "https://en.wiktionary.org/wiki/janal" },
    { title: "Wiktionary – taal (maya yucateco)", url: "https://en.wiktionary.org/wiki/taal" },
    { title: "Wiktionary – meyaj (maya yucateco)", url: "https://en.wiktionary.org/wiki/meyaj" },
    { title: "Wiktionary – xook (maya yucateco)", url: "https://en.wiktionary.org/wiki/xook" },
    { title: "Montgomery, Maya (Yucatec) Dictionary & Phrasebook" },
    { title: "Aprendiendo Maya – Consonantes (k'aay)", url: "https://www.aprendiendomaya.com/escritura/alfabeto-maya" },
    { title: "UADY – Diccionario maya, letra TS (tsikbal)", url: "https://www.mayas.uady.mx/diccionario/ts_maya.html" },
    { title: "UADY – Diccionario maya, letra B (ba'ax, ba'axten)", url: "https://www.mayas.uady.mx/diccionario/b_maya.html" },
    { title: "UADY – Diccionario maya, letra M (máax, mix, mixmáak)", url: "https://www.mayas.uady.mx/diccionario/m_maya.html" },
    { title: "UADY – Diccionario maya, letra CH (chaambéel)", url: "https://www.mayas.uady.mx/diccionario/ch_maya.html" },
    { title: "UADY – Diccionario español-maya, letra C (na'at, entender)", url: "https://www.mayas.uady.mx/diccionario/c_esp.html" },
    { title: "AnderBois (2018), puntuación y partículas de pregunta en maya (kux, wáaj)", url: "https://www.scielo.org.mx/scielo.php?script=sci_arttext&pid=S2007-736X2018000100388" },
    { title: "Manuel Andrade, A grammar of modern Yucatec Maya (edición de Lehmann): máax, bix", url: "https://www.christianlehmann.eu/ling/sprachen/maya/andrade/andrade_edit.php" },
    { title: "La Lengua Maya de Yucatán – Frases básicas", url: "https://sites.google.com/site/lalenguamayadeyucatan/frases-basicas" },
    { title: "Omniglot – Useful phrases in Yucatec Maya", url: "https://www.omniglot.com/language/phrases/yucatec-maya.php" },
    { title: "Vocabulario.com.mx – Diccionario maya-español: verbo saber", url: "https://www.vocabulario.com.mx/blog/diccionario-maya-espanol-verbo-saber/" },
    { title: "UADY – Diccionario español-maya, letra S (saber: ojel)", url: "https://www.mayas.uady.mx/diccionario/s_esp.html" },
    { title: "UADY – Diccionario español-maya, letra T (trabajar: meyaj)", url: "https://www.mayas.uady.mx/diccionario/t_esp.html" },
    { title: "UADY – Diccionario español-maya, letra L (leer, lectura: xook)", url: "https://www.mayas.uady.mx/diccionario/l_esp.html" },
    { title: "Na'atik Language & Culture Institute – Yucatec Maya Phrases (Tene tin na'atik)", url: "https://naatikmexico.org/blog/yucatec-maya-phrases" },
    { title: "Idioma Maya Yucateco, material de curso (mixtu'ux)" },
    { title: "Epinvestiga – La lengua que perdimos (Táan in kanik maaya)", url: "https://epinvestiga.com/dominical/la-lengua-que-perdimos/" },
    { title: "Heraldo de México – Ko'ox kanik maaya t'aan", url: "https://yucatan.heraldodemexico.com.mx/tendencias/2025/8/27/koox-kanik-maaya-taan-asi-seran-los-cursos-para-preservar-la-lengua-maya-en-yucatan-1949.html" },
    { title: "Wikipedia – Yucatán (la leyenda del nombre)", url: "https://en.wikipedia.org/wiki/Yucat%C3%A1n" },
    { title: "Christian Lehmann, Genesis of auxiliaries in Yucatec Maya (k- habitual, táan)", url: "https://www.christianlehmann.eu/publ/Genesis_of_auxiliaries_in_Yucatec_Maya.pdf" },
    { title: "Scott AnderBois, Mayan discourse particles (Glottothèque, Universidad de Gotinga): wáaj", url: "https://spw.uni-goettingen.de/projects/maya/units/anderbois.pdf" },
    { title: "Hilario Chi Canul (2012), «U jóok'ol t'aan» (La salida del habla), Redalyc", url: "https://www.redalyc.org/pdf/2813/281323561007.pdf" },
    { title: "Bolles y Bolles, A Grammar of the Yucatecan Mayan Language (FAMSI), sección de preguntas: máax", url: "https://www.famsi.org/reports/96072/grammar/section06.htm" }
  ],
  lessons: [
    {
      id: "u5l1",
      title: "Lo que hago: el presente habitual",
      goal: "Al terminar podrás decir lo que haces normalmente (voy, salgo, como, trabajo, estudio) en las seis personas.",
      teach: [
        {
          kind: "text",
          title: "La persona va delante",
          html: "En español la persona está al final del verbo: voy, vas, va. En maya la persona va <b>delante</b> del verbo, en una palabrita (en plural se agrega además una terminación: -e'ex, -o'ob): <span class=\"m\">kin bin</span> (voy), <span class=\"m\">ka bin</span> (vas), <span class=\"m\">ku bin</span> (va).<br>Esa palabrita junta la marca de presente habitual <span class=\"m\">k-</span> con la persona: k + in = <span class=\"m\">kin</span>, k + a = <span class=\"m\">ka</span>, k + u = <span class=\"m\">ku</span>."
        },
        {
          kind: "table",
          title: "Bin (ir) en presente habitual",
          head: ["Persona", "Maya", "Español"],
          rows: [
            ["yo", "kin bin", "voy"],
            ["tú", "ka bin", "vas"],
            ["él, ella", "ku bin", "va"],
            ["nosotros", "k bin", "vamos"],
            ["ustedes", "ka bine'ex", "ustedes van"],
            ["ellos, ellas", "ku bino'ob", "ellos van"]
          ]
        },
        {
          kind: "tip",
          title: "Habitual no es «ahora mismo»",
          html: "<span class=\"m\">Kin janal</span> quiere decir «como» en general, como costumbre. Para «estoy comiendo» el maya usa otra construcción, <span class=\"m\">táan in janal</span>; la verás en la lección 3 con <span class=\"m\">Táan in kanik maaya</span>.<br>La tabla sigue la regla general; <span class=\"m\">ka bin</span> y <span class=\"m\">ku bino'ob</span> aparecen tal cual en las fuentes. La forma de «nosotros», <span class=\"m\">k bin</span>, sale de la misma regla, pero no la vimos escrita tal cual."
        },
        {
          kind: "tip",
          title: "Grafías viejas y nuevas",
          html: "Muchos materiales son anteriores a las normas de 2014. El curso en línea de la UADY, por ejemplo, escribe <span class=\"m\">hanal</span>, <span class=\"m\">meyah</span> o <span class=\"m\">xòok</span>; hoy se escriben <span class=\"m\">janal</span>, <span class=\"m\">meyaj</span> y <span class=\"m\">xook</span>. Si ves una h o un acento grave, prueba con j y sin el acento grave (aunque no siempre basta)."
        }
      ],
      vocab: [
        { id: "u5-bin", m: "bin", es: "ir", pr: "bin", note: "Presente habitual: kin bin, ka bin, ku bin…", ex: { m: "Tu'ux ka bin?", es: "¿A dónde vas?" }, conf: "alta" },
        { id: "u5-janal", m: "janal", es: "comer; comida", pr: "janal", note: "Verbo sin objeto: kin janal (como). En la grafía antigua se escribía hanal.", ex: { m: "Kin janal.", es: "Como (habitualmente)." }, conf: "alta" },
        { id: "u5-meyaj", m: "meyaj", es: "trabajar", pr: "meyaj", ex: { m: "Kin meyaj.", es: "Trabajo." }, conf: "alta" },
        { id: "u5-xook", m: "xook", es: "leer; estudiar", pr: "shook", note: "La x suena «sh». La UADY la da también para «lectura» y «lección».", ex: { m: "Kin xook bul k'iin.", es: "Estudio todos los días." }, conf: "alta" },
        { id: "u5-taal", m: "taal", es: "venir", pr: "taal", note: "El prontuario del INALI la usa en taalech, «viniste».", ex: { m: "Ku taal.", es: "Viene (suele venir)." }, conf: "alta" },
        { id: "u5-wenel", m: "wenel", es: "dormir", pr: "wenel", conf: "alta" },
        { id: "u5-kaay", m: "k'aay", es: "cantar; canto", pr: "k'aay", conf: "alta" },
        { id: "u5-bul-kiin", m: "bul k'iin", es: "todos los días, diario", pr: "bul k'iin", note: "Acompaña al presente habitual.", conf: "media" },
        { id: "u5-jookol", m: "jóok'ol", es: "salir; salida", pr: "jóok'ol (j suave, óo larga con tono alto)", note: "Verbo sin objeto, como bin. También es «salida»: el título U jóok'ol t'aan se traduce «la salida del habla». No lo confundas con yóok'ol, «encima».", ex: { m: "Kin jóok'ol.", es: "Salgo (habitualmente)." }, conf: "alta" }
      ],
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "Kin janal.", promptLang: "m", answer: "Como.", options: ["Como.", "Comes.", "Come."] },
        { type: "fill", es: "¿A dónde vas?", before: "Tu'ux", after: "bin?", answer: "ka", options: ["ka", "kin", "ku"] },
        { type: "choice", q: "¿Qué significa?", prompt: "Ku bino'ob.", promptLang: "m", answer: "Ellos van.", options: ["Ellos van.", "Ustedes van.", "Vamos."] },
        { type: "choice", q: "¿Qué significa?", prompt: "Kin xook bul k'iin.", promptLang: "m", answer: "Estudio todos los días.", options: ["Estudio todos los días.", "Trabajo todos los días.", "Como todos los días."] },
        { type: "choice", q: "¿Qué significa?", prompt: "Ka bine'ex.", promptLang: "m", answer: "Ustedes van.", options: ["Ustedes van.", "Ellos van.", "Tú vas."] },
        { type: "type", q: "Escribe en maya", prompt: "Como (habitualmente).", answer: "Kin janal." },
        { type: "fill", es: "Salgo (habitualmente).", before: "Kin", after: "", answer: "jóok'ol", options: ["jóok'ol", "yóok'ol", "wenel"] },
        { type: "type", q: "Escribe en maya", prompt: "salir", answer: "jóok'ol" }
      ]
    },
    {
      id: "u5l2",
      title: "Preguntar",
      goal: "Al terminar podrás preguntar qué, quién, dónde, cómo y por qué, y hacer preguntas de sí o no.",
      teach: [
        {
          kind: "table",
          title: "Palabras para preguntar",
          head: ["Maya", "Español"],
          rows: [
            ["ba'ax", "¿qué?"],
            ["máax", "¿quién?"],
            ["tu'ux", "¿dónde?, ¿a dónde?"],
            ["bix", "¿cómo?"],
            ["ba'axten", "¿por qué?"],
            ["kux", "¿y …? (¿y tú?, ¿y él?)"],
            ["jayp'éel, jaytúul", "¿cuántos? (unidad 4)"],
            ["bajux", "¿cuánto? (precio; unidad 6)"]
          ]
        },
        {
          kind: "text",
          title: "La pregunta va al principio",
          html: "Como en español, la palabra de pregunta va al inicio y después viene la frase normal: <span class=\"m\">Tu'ux ka bin?</span> (¿a dónde vas?), <span class=\"m\">Bix a k'aaba'?</span> (¿cómo te llamas?), <span class=\"m\">Ba'ax ka wa'alik?</span> (literalmente «¿qué dices?», es decir, «¿qué tal?»).<br>Fíjate en que <span class=\"m\">ba'axten</span> se forma a partir de <span class=\"m\">ba'ax</span>."
        },
        {
          kind: "tip",
          title: "Preguntas de sí o no: wáaj",
          html: "Para preguntar «¿sí o no?» basta la entonación, o se agrega <span class=\"m\">wáaj</span>. Su lugar preferido es el segundo de la frase, justo después del primer bloque (aquí, el verbo con su persona): <span class=\"m\">Ka t'aan wáaj ich maaya?</span>, «¿hablas maya?».<br>Para responder «sí» no hay una palabra única: se dice <span class=\"m\">beey</span> (así es) o <span class=\"m\">jaaj</span> (es verdad). «No» es <span class=\"m\">ma'</span>."
        }
      ],
      vocab: [
        { id: "u5-baax", m: "ba'ax", es: "¿qué?", pr: "ba-ash", note: "Vocal rearticulada (a'a) y x = sh.", ex: { m: "Ba'ax ka wa'alik?", es: "¿Qué tal? (lit. ¿qué dices?)" }, conf: "alta" },
        { id: "u5-maax", m: "máax", es: "¿quién?", pr: "máash", note: "Vocal larga con tono alto, como la escribe la UADY. Sin tono, maax es otra palabra.", conf: "alta" },
        { id: "u5-tuux", m: "tu'ux", es: "¿dónde?, ¿a dónde?", pr: "tu-ush", conf: "alta" },
        { id: "u5-bix", m: "bix", es: "¿cómo?", pr: "bish", ex: { m: "Bix a k'aaba'?", es: "¿Cómo te llamas?" }, conf: "alta" },
        { id: "u5-baaxten", m: "ba'axten", es: "¿por qué?", pr: "ba-ashten", conf: "alta" },
        { id: "u5-waaj", m: "wáaj", es: "partícula de pregunta de sí o no", pr: "wáaj (áa larga con tono alto)", note: "Prefiere el segundo lugar de la frase, después del primer bloque: Ka t'aan wáaj…?", conf: "alta" },
        { id: "u5-tuux-ka-bin", m: "Tu'ux ka bin?", es: "¿A dónde vas?", pr: "tu-ush ka bin", note: "Pregunta frecuente al encontrarse en el camino.", conf: "alta" },
        { id: "u5-ka-taan-waaj", m: "Ka t'aan wáaj ich maaya?", es: "¿Hablas maya?", pr: "ka t'aan wáaj ich maaya", note: "ich = en: ich maaya, «en maya».", conf: "media" }
      ],
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "ba'axten", promptLang: "m", answer: "¿por qué?", options: ["¿por qué?", "¿qué?", "¿quién?", "¿dónde?"] },
        { type: "fill", es: "¿Cómo te llamas?", before: "", after: "a k'aaba'?", answer: "Bix", options: ["Bix", "Tu'ux", "Ba'axten"] },
        { type: "fill", es: "¿A dónde vas?", before: "", after: "ka bin?", answer: "Tu'ux", options: ["Tu'ux", "Bix", "Ba'ax"] },
        { type: "choice", q: "¿Qué significa?", prompt: "Ka t'aan wáaj ich maaya?", promptLang: "m", answer: "¿Hablas maya?", options: ["¿Hablas maya?", "¿Entiendes maya?", "¿A dónde vas?"] },
        { type: "choice", q: "¿Qué significa?", prompt: "máax", promptLang: "m", answer: "¿quién?", options: ["¿quién?", "¿qué?", "¿cómo?"] },
        { type: "type", q: "Escribe en maya", prompt: "¿A dónde vas?", answer: "Tu'ux ka bin?" },
        { type: "choice", q: "Repaso: ¿cómo dices «sí, así es»?", prompt: "sí, así es", promptLang: "es", answer: "beey", options: ["beey", "ma'", "bix"] },
        { type: "choice", q: "¿Qué palabra convierte una frase en pregunta de sí o no?", prompt: "partícula de pregunta de sí o no", promptLang: "es", answer: "wáaj", options: ["wáaj", "kux", "bix"] }
      ]
    },
    {
      id: "u5l3",
      title: "No entiendo: frases del aprendiz",
      goal: "Al terminar podrás decir que no entiendes, pedir que te repitan despacio y contar que estás aprendiendo maya.",
      teach: [
        {
          kind: "text",
          title: "Negar en presente: ma' + tin",
          html: "Para negar se pone <span class=\"m\">ma'</span> al principio. Con verbos en presente, en la negación no se usa <span class=\"m\">kin</span> sino <span class=\"m\">tin</span> (que viene de <span class=\"m\">táan in</span>): <span class=\"m\">Ma' tin na'atik</span>, «no entiendo». Para «entiendo», Omniglot y el instituto Na'atik usan también <span class=\"m\">tin</span>: <span class=\"m\">Tin na'atik</span> (por confirmar).<br>Igual con otros verbos: <span class=\"m\">Ma' tin meyaj te' súutukila'</span>, «no estoy trabajando en este momento»."
        },
        {
          kind: "tip",
          title: "La cola -i' y el verbo «saber»",
          html: "Muchas negaciones se cierran con <span class=\"m\">-i'</span> al final: <span class=\"m\">Ma' in wojeli'</span>, «no sé». «Saber» no lleva k-: <span class=\"m\">in wojel</span> es «sé». El diccionario de la UADY escribe <span class=\"m\">ojel</span>, con o corta; algunas guías escriben <i>woojel</i>.<br>Con <span class=\"m\">Ma' tin na'atik</span> la -i' varía por región: en el noroeste de Yucatán se dice sin ella y en otras zonas se agrega."
        },
        {
          kind: "culture",
          title: "La leyenda del nombre Yucatán",
          html: "Según una historia muy repetida, cuando los españoles preguntaron cómo se llamaba esta tierra, los mayas respondieron algo como «no entiendo tu habla», y de ahí saldría «Yucatán». Es una <b>leyenda</b>: el origen real del nombre no está resuelto. Pero te ayuda a recordar la frase más útil del aprendiz: <span class=\"m\">Ma' tin na'atik</span>, «no entiendo»."
        },
        {
          kind: "tip",
          title: "Pide calma y repetición",
          html: "<span class=\"m\">chaambéel</span> es «despacio, con calma» y <span class=\"m\">tu ka'atéen</span> (de la unidad de números) es «otra vez». Úsalas para pedir que te repitan.<br>¿Y «¿cómo se dice … en maya?»? Solo una guía da una fórmula, y su forma escrita no se pudo confirmar en ninguna otra fuente; por eso todavía no la enseñamos. Mientras tanto, señala y pregunta <span class=\"m\">Ba'ax?</span>, «¿qué?»."
        }
      ],
      vocab: [
        { id: "u5-ma-tin-naatik", m: "Ma' tin na'atik.", es: "No entiendo.", pr: "ma- tin na-atik", note: "ma' (no) + tin + na'atik (entender algo).", conf: "alta" },
        { id: "u5-kin-naatik", m: "Tin na'atik.", es: "Entiendo.", pr: "tin na-atik", note: "tin (de táan in) + na'atik, como en Ma' tin na'atik. Así lo dan Omniglot y el instituto Na'atik; otra guía da Kin na'atik.", conf: "media" },
        { id: "u5-ma-in-woojeli", m: "Ma' in wojeli'.", es: "No sé.", pr: "ma- in wojeli-", alt: ["Ma' in wojel.", "Ma' in woojeli'."], note: "De ojel, saber, con o corta, como lo escribe la UADY. También se oye sin la -i' final: Ma' in wojel. Algunas guías escriben woojel.", conf: "media" },
        { id: "u5-chaambeel", m: "chaambéel", es: "despacio, con calma", pr: "chaambéel", alt: ["chaanbéel", "chambéel"], note: "Útil para pedir que te hablen más despacio.", conf: "alta" },
        { id: "u5-taan-in-kanik-maaya", m: "Táan in kanik maaya.", es: "Estoy aprendiendo maya.", pr: "táan in kanik maaya", note: "táan + in + verbo = estoy …-ando (acción en curso).", conf: "media" },
        { id: "u5-cheen-jumpiit-maaya", m: "Chéen junp'íit maaya kin t'aanik.", es: "Solo hablo un poquito de maya.", pr: "chéen junp'íit maaya kin t'aanik", alt: ["Chéen jump'íit maaya kin t'aanik."], note: "chéen = solo; junp'íit (o jump'íit) = un poco; t'aanik = hablar (una lengua).", conf: "media" },
        { id: "u5-kanik", m: "kanik", es: "aprender (algo)", pr: "kanik", note: "Lleva -ik porque tiene objeto: se aprende algo.", ex: { m: "Ko'ox kanik maaya t'aan.", es: "Vamos a aprender lengua maya." }, conf: "alta" },
        { id: "u5-mixmaak", m: "mixmáak", es: "nadie", pr: "mishmáak", note: "mix (ni) + máak (persona), igual que mixba'al, «nada».", conf: "media" },
        { id: "u5-ma-tin-bin-mixtuux", m: "Ma' tin bin mixtu'ux.", es: "No voy a ningún lado.", pr: "ma- tin bin mishtu-ush", note: "mixtu'ux = a ningún lado.", conf: "media" }
      ],
      dialogue: {
        title: "Con calma, por favor (diálogo de práctica)",
        lines: [
          { who: "A", name: "Don Felipe", m: "Ba'ax ka wa'alik?", es: "¿Qué tal?" },
          { who: "B", name: "Sofía", m: "Chéen mixba'al. Kux teech?", es: "Nada, aquí nomás. ¿Y usted?" },
          { who: "A", name: "Don Felipe", m: "Ma'alob. Ka t'aan wáaj ich maaya?", es: "Bien. ¿Hablas maya?" },
          { who: "B", name: "Sofía", m: "Chéen junp'íit maaya kin t'aanik. Táan in kanik maaya.", es: "Solo hablo un poquito de maya. Estoy aprendiendo maya." },
          { who: "A", name: "Don Felipe", m: "Jach ma'alob! Tu'ux ka bin?", es: "¡Muy bien! ¿A dónde vas?" },
          { who: "B", name: "Sofía", m: "Ma' tin na'atik. Tu ka'atéen, chaambéel.", es: "No entiendo. Otra vez, despacio." },
          { who: "A", name: "Don Felipe", m: "Tu'ux… ka… bin?", es: "¿A dónde… vas?" },
          { who: "B", name: "Sofía", m: "Ma' tin bin mixtu'ux.", es: "No voy a ningún lado." }
        ]
      },
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "Ma' tin na'atik.", promptLang: "m", answer: "No entiendo.", options: ["No entiendo.", "Entiendo.", "No sé."] },
        { type: "fill", es: "No entiendo.", before: "Ma'", after: "na'atik.", answer: "tin", options: ["tin", "kin", "ku"] },
        { type: "build", es: "No entiendo. Otra vez, despacio.", m: "Ma' tin na'atik. Tu ka'atéen, chaambéel.", distractors: ["kin", "ya'ab"] },
        { type: "choice", q: "¿Qué significa?", prompt: "Táan in kanik maaya.", promptLang: "m", answer: "Estoy aprendiendo maya.", options: ["Estoy aprendiendo maya.", "Hablo maya todos los días.", "No entiendo maya."] },
        { type: "type", q: "Escribe en maya", prompt: "despacio, con calma", answer: "chaambéel", alt: ["chaanbéel", "chambéel"] },
        { type: "choice", q: "Repaso: ¿cómo pides que te lo repitan?", prompt: "otra vez", promptLang: "es", answer: "tu ka'atéen", options: ["tu ka'atéen", "ka'ap'éel", "mixmáak"] },
        { type: "choice", q: "¿Qué significa?", prompt: "Ma' in wojeli'.", promptLang: "m", answer: "No sé.", options: ["No sé.", "No entiendo.", "No voy a ningún lado."] },
        { type: "choice", q: "¿Qué significa?", prompt: "Chéen junp'íit maaya kin t'aanik.", promptLang: "m", answer: "Solo hablo un poquito de maya.", options: ["Solo hablo un poquito de maya.", "Estoy aprendiendo maya.", "Hablo mucho maya."] }
      ]
    }
  ]
});
