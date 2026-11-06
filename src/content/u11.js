/* Unidad 11 · Quiero y me gusta. Solo formas con estado «verificado» (conf alta) o «probable» (conf media) en kb/recheck4-u11.json. */
(window.COURSE = window.COURSE || { units: [] }).units.push({
  id: "u11",
  n: 11,
  title: "Quiero y me gusta",
  subtitle: "Querer, gustar, necesitar, pedir y dar",
  sources: [
    { title: "UADY – Diccionario maya-español, letra K' (k'áat, k'abéet, k'a'anan)", url: "https://www.mayas.uady.mx/diccionario/k_glotal_maya.html" },
    { title: "UADY – Diccionario maya-español, letra TS' (ts'aa, dar)", url: "https://www.mayas.uady.mx/diccionario/ts_glotal_maya.html" },
    { title: "UADY – Diccionario maya-español, letra T (tuláakal)", url: "https://www.mayas.uady.mx/diccionario/t_maya.html" },
    { title: "UADY – Diccionario español-maya, letra P (pedir: k'áat; poner: ts'aa)", url: "https://www.mayas.uady.mx/diccionario/p_esp.html" },
    { title: "UADY – Diccionario español-maya, letra A (agarrar: ch'a')", url: "https://www.mayas.uady.mx/diccionario/a_esp.html" },
    { title: "Manuel Andrade, A grammar of modern Yucatec Maya (edición de Lehmann): in k'at, ma' in k'ati, uts t-in w-ich, uts t-in chi', k'abet", url: "https://www.christianlehmann.eu/ling/sprachen/maya/andrade/andrade_edit.php" },
    { title: "Blair y Vermont-Salas, Spoken Yucatec Maya, lecciones 1-18 (texto glosado en el sitio de Lehmann)", url: "https://www.christianlehmann.eu/ling/sprachen/maya/textos/bvs_1-18.html" },
    { title: "Junp'iit Maaya (Mújica 1995), en el sitio de Lehmann: In k'at bin Uxmal, Seen uts tin wich", url: "https://www.christianlehmann.eu/ling/sprachen/maya/textos/hunp'iit_maaya.html" },
    { title: "Wiktionary – k'áat (maya yucateco)", url: "https://en.wiktionary.org/wiki/k%E2%80%99aat" },
    { title: "parryc – Yucatec Maya (in k'áat janal, K'a'abet in janal)", url: "https://parryc.com/language/yucatec-maya" },
    { title: "Diccionario de uso del maya yucateco (u k'áat)", url: "https://www.academia.edu/142986420/Diccionario_de_uso_del_maya_yucateco" },
    { title: "La Lengua Maya de Yucatán – Frases básicas (K'a'abéet in bin)", url: "https://sites.google.com/site/lalenguamayadeyucatan/frases-basicas" }
  ],
  lessons: [
    {
      id: "u11l1",
      title: "Quiero…",
      goal: "Al terminar podrás decir qué quieres (ir, comer, comprar), decir que no lo quieres y preguntar «¿qué quieres?».",
      teach: [
        {
          kind: "text",
          title: "k'áat: querer",
          html: "Para «quiero» el maya usa el verbo <span class=\"m\">k'áat</span> con las palabritas de persona de siempre: <span class=\"m\">in k'áat</span> (quiero), <span class=\"m\">a k'áat</span> (quieres), <span class=\"m\">u k'áat</span> (quiere).<br>A diferencia de <span class=\"m\">kin bin</span> o <span class=\"m\">kin janal</span> (unidad 5), no lleva <b>k-</b> delante: la gramática de Andrade lo describe como un verbo «defectivo», que se usa sin las terminaciones de siempre. Lo que quieres va después: <span class=\"m\">In k'áat bin Uxmal</span>, «quiero ir a Uxmal» (Uxmal es el nombre de una antigua ciudad maya de Yucatán)."
        },
        {
          kind: "table",
          title: "Querer, en singular",
          head: ["Persona", "Maya", "Español"],
          rows: [
            ["yo", "in k'áat", "quiero"],
            ["tú", "a k'áat", "quieres"],
            ["él, ella", "u k'áat", "quiere"]
          ]
        },
        {
          kind: "text",
          title: "Querer ir, comer o comprar",
          html: "Detrás de <span class=\"m\">in k'áat</span> puede ir otro verbo. Si no lleva objeto, como <span class=\"m\">bin</span> (ir) o <span class=\"m\">janal</span> (comer), va solo: <span class=\"m\">In k'áat janal</span>, «quiero comer».<br>Si el verbo lleva objeto, trae su propia persona: <span class=\"m\">In k'áat in man ba'alo'ob</span>, «quiero comprar cosas» (<span class=\"m\">man</span> es la raíz de <span class=\"m\">manik</span>, unidad 6; <span class=\"m\">ba'alo'ob</span> es <span class=\"m\">ba'al</span>, «cosa», en plural)."
        },
        {
          kind: "tip",
          title: "No quiero, y el plural",
          html: "La negación sigue la regla de la unidad 5: <span class=\"m\">ma'</span> al principio y la colita <span class=\"m\">-i'</span> al final. Andrade la da con <span class=\"m\">in</span>, no con <span class=\"m\">tin</span>: <span class=\"m\">Ma' in k'áati'</span>, «no quiero».<br>Las formas de «nosotros», «ustedes» y «ellos» saldrían de las reglas de la unidad 5, pero no las vimos escritas con <span class=\"m\">k'áat</span>; por eso no las enseñamos. Y «pedir» como verbo aparte (la UADY lo anota en la misma entrada) se conjuga distinto: aquí solo usamos «querer»."
        }
      ],
      vocab: [
        { id: "u11-kaat", m: "k'áat", es: "querer, desear; también pedir, preguntar", pr: "k'áat (áa larga con tono alto)", note: "La UADY da los dos usos: «querer, desear, pretender» y «pedir, preguntar». Para «quiero» no lleva k-: in k'áat.", ex: { m: "In k'áat bin Uxmal.", es: "Quiero ir a Uxmal." }, conf: "alta" },
        { id: "u11-in-kaat", m: "In k'áat", es: "quiero", pr: "in k'áat", note: "a k'áat, «quieres»; u k'áat, «quiere». Sin k- y sin la terminación -ik.", conf: "alta" },
        { id: "u11-baax-a-kaat", m: "Ba'ax a k'áat?", es: "¿Qué quieres?", pr: "ba-ash a k'áat", note: "Armada a partir de una frase de Blair y Vermont-Salas: ba'x a k'at ka in maneh?, «¿qué quieres que compre?».", conf: "media" },
        { id: "u11-kaat-bin-uxmal", m: "In k'áat bin Uxmal.", es: "Quiero ir a Uxmal.", pr: "in k'áat bin ush-mal", note: "Frase de Junp'iit Maaya (In k'at bin Uxmal), con la vocal larga y el tono que da la UADY para k'áat.", conf: "alta" },
        { id: "u11-kaat-janal", m: "In k'áat janal.", es: "Quiero comer.", pr: "in k'áat janal", note: "Con un verbo sin objeto, k'áat va seguido del verbo solo. El ejemplo viene de una guía de estudio que cita a Briceño Chel.", conf: "media" },
        { id: "u11-kaat-man-baalob", m: "In k'áat in man ba'alo'ob.", es: "Quiero comprar cosas.", pr: "in k'áat in man ba-alo-ob", note: "Junp'iit Maaya trae In k'at in man ts'e'ets'ek ba'alo'ob; quitamos una palabra de cantidad que no pudimos confirmar.", conf: "media" },
        { id: "u11-ma-in-kaati", m: "Ma' in k'áati'.", es: "No quiero.", pr: "ma- in k'áati-", alt: ["Ma' in k'áat."], note: "Andrade da ma' in k'ati, «no lo quiero; no quiero (hacerlo)». La colita -i' va al final de la frase, como en Ma' in wojeli' (unidad 5).", conf: "media" }
      ],
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "In k'áat bin Uxmal.", promptLang: "m", answer: "Quiero ir a Uxmal.", options: ["Quiero ir a Uxmal.", "Voy a Uxmal todos los días.", "No quiero ir a Uxmal."] },
        { type: "type", q: "Escribe en maya", prompt: "querer, desear", answer: "k'áat" },
        { type: "fill", es: "Quiero ir a Uxmal.", before: "In", after: "bin Uxmal.", answer: "k'áat", options: ["k'áat", "k'aay", "k'iin"] },
        { type: "build", es: "Quiero ir a Uxmal.", m: "In k'áat bin Uxmal.", distractors: ["kin", "ku"] },
        { type: "choice", q: "¿Qué significa?", prompt: "Ba'ax a k'áat?", promptLang: "m", answer: "¿Qué quieres?", options: ["¿Qué quieres?", "¿Cómo te llamas?", "¿A dónde vas?"] },
        { type: "fill", es: "No quiero.", before: "Ma' in", after: "", answer: "k'áati'", options: ["k'áati'", "wojeli'", "meyaj"] },
        { type: "choice", q: "¿Qué significa?", prompt: "In k'áat janal.", promptLang: "m", answer: "Quiero comer.", options: ["Quiero comer.", "Ya comí.", "Tengo hambre."] },
        { type: "type", q: "Escribe en maya", prompt: "quiero", answer: "In k'áat" }
      ]
    },
    {
      id: "u11l2",
      title: "Me gusta",
      goal: "Al terminar podrás decir que algo te gusta, según lo veas o lo comas, y preguntar si a otra persona le gusta.",
      teach: [
        {
          kind: "text",
          title: "«Me gusta» con el cuerpo",
          html: "En las fuentes que revisamos, «me gusta» no es un verbo. Se dice que algo es <span class=\"m\">uts</span> («bueno», unidad 9) <i>a</i> una parte de tu cuerpo, según el sentido con que lo disfrutas. Lo que <b>ves</b> es bueno a tu ojo: <span class=\"m\">Uts tin wich</span>, literalmente «es bueno a mi ojo» (<span class=\"m\">in wich</span>, «mi ojo, mi cara», unidad 7). Lo que <b>comes</b>, a tu boca: <span class=\"m\">Uts tin chi'</span>. Lo que <b>oyes</b>, a tu oído: <span class=\"m\">Uts tin xikin</span>.<br>Detrás puedes nombrar lo que te gusta: <span class=\"m\">Jats'uts, uts tin wich tuláakal</span>, «es hermoso, me gusta todo»."
        },
        {
          kind: "table",
          title: "Tres sentidos, tres frases",
          head: ["Lo disfrutas con…", "Maya", "Español"],
          rows: [
            ["los ojos", "Uts tin wich", "me gusta (lo que veo)"],
            ["la boca", "Uts tin chi'", "me gusta (lo que como)"],
            ["el oído", "Uts tin xikin", "me gusta (lo que oigo); por confirmar"],
            ["los ojos, tú", "Uts ta wich", "te gusta (lo que ves)"]
          ]
        },
        {
          kind: "tip",
          title: "No confundas este tin",
          html: "En <span class=\"m\">Uts tin wich</span>, <span class=\"m\">tin</span> es <i>t-</i> («a») + <i>in</i> («mi»), y <span class=\"m\">ta</span> es «a tu»: <span class=\"m\">Uts ta wich</span>, «te gusta (lo que ves)». No es el <span class=\"m\">tin</span> de <span class=\"m\">tin janal</span>, «estoy comiendo» (unidad 5), que viene de <span class=\"m\">táan in</span>.<br>Para decir «mucho» usa <span class=\"m\">jach</span> (unidad 2); para preguntar, <span class=\"m\">wáaj</span> en segundo lugar, como en la unidad 5. «No me gusta» todavía no lo enseñamos: no encontramos una frase escrita que lo confirme."
        },
        {
          kind: "culture",
          title: "Dónde vive el gusto",
          html: "Fíjate en lo que nombra el maya cuando algo te agrada: los <b>ojos</b> (<span class=\"m\">wich</span>), la <b>boca</b> (<span class=\"m\">chi'</span>), el <b>oído</b> (<span class=\"m\">xikin</span>). Y para la alegría aparece el <b>ánimo</b>: <span class=\"m\">Ki'imak in wóol</span>, «estoy contento», donde <span class=\"m\">óol</span> es el ánimo (unidad 3). En español decimos «me gusta» y no sabemos dónde; en estas frases el maya dice por dónde te llegó.<br>Son las mismas palabras del cuerpo que aprendiste en la unidad 7."
        }
      ],
      vocab: [
        { id: "u11-uts-tin-wich", m: "Uts tin wich.", es: "Me gusta (lo que veo).", pr: "uts tin wich", note: "Literalmente «es bueno a mi ojo». Aparece en Blair y Vermont-Salas, en Junp'iit Maaya y en la gramática de Andrade.", conf: "alta" },
        { id: "u11-uts-tin-chi", m: "Uts tin chi'.", es: "Me gusta (lo que como).", pr: "uts tin chi-", note: "Literalmente «es bueno a mi boca». Andrade: «me gusta (lo que como)».", conf: "alta" },
        { id: "u11-uts-ta-wich", m: "Uts ta wich.", es: "Te gusta (lo que ves).", pr: "uts ta wich", note: "ta = a tu. Andrade da uts t-a w-ich, «te gusta (lo que ves)».", conf: "alta" },
        { id: "u11-uts-tin-xikin", m: "Uts tin xikin.", es: "Me gusta (lo que oigo).", pr: "uts tin shikin", note: "Literalmente «es bueno a mi oído». Se ve en Blair y Vermont-Salas dentro de una frase más larga; la lectura «lo que oigo» sale del patrón de Andrade.", conf: "media" },
        { id: "u11-jach-uts-tin-wich", m: "Jach uts tin wich.", es: "Me gusta mucho.", pr: "jach uts tin wich", note: "jach = muy (unidad 2). Junp'iit Maaya trae seen uts tin wich para lo mismo; aquí usamos jach, que ya conoces.", conf: "media" },
        { id: "u11-uts-waaj-ta-wich", m: "Uts wáaj ta wich?", es: "¿Te gusta?", pr: "uts wáaj ta wich", note: "wáaj va en segundo lugar, como en la unidad 5.", conf: "media" },
        { id: "u11-jatsuts-uts-tin-wich", m: "Jats'uts, uts tin wich tuláakal.", es: "Es hermoso, me gusta todo.", pr: "jats'uts, uts tin wich tuláakal", note: "Frase de Blair y Vermont-Salas (hats'uts, uts tin wich tulakal), con la j de las normas de 2014.", conf: "alta" },
        { id: "u11-tulaakal", m: "tuláakal", es: "todo, todos", pr: "tuláakal (áa larga con tono alto)", note: "Así la escribe la UADY.", conf: "alta" }
      ],
      dialogue: {
        title: "En la milpa de don Felipe (diálogo de práctica)",
        lines: [
          { who: "A", name: "Don Felipe", m: "Uts wáaj ta wich?", es: "¿Te gusta?" },
          { who: "B", name: "Sofía", m: "Jats'uts! Uts tin wich tuláakal.", es: "¡Qué bonito! Me gusta todo." },
          { who: "A", name: "Don Felipe", m: "Ki'imak in wóol.", es: "Me da gusto." },
          { who: "B", name: "Sofía", m: "Dios bo'otik.", es: "Gracias." }
        ]
      },
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "Uts tin wich.", promptLang: "m", answer: "Me gusta (lo que veo).", options: ["Me gusta (lo que veo).", "No me gusta.", "Quiero ver."] },
        { type: "fill", es: "Me gusta (lo que como).", before: "Uts tin", after: "", answer: "chi'", options: ["chi'", "wich", "xikin"] },
        { type: "fill", es: "Te gusta (lo que ves).", before: "Uts", after: "wich.", answer: "ta", options: ["ta", "tin", "tu"] },
        { type: "build", es: "¡Qué bonito! Me gusta todo.", m: "Jats'uts, uts tin wich tuláakal.", distractors: ["chi'", "ta"] },
        { type: "type", q: "Escribe en maya", prompt: "Me gusta (lo que como).", answer: "Uts tin chi'." },
        { type: "type", q: "Escribe en maya", prompt: "todo, todos", answer: "tuláakal" },
        { type: "choice", q: "¿Para qué se usa esta frase?", prompt: "Uts tin wich.", promptLang: "m", answer: "Para lo que ves.", options: ["Para lo que ves.", "Para lo que comes.", "Para lo que oyes."] },
        { type: "choice", q: "¿Qué significa?", prompt: "Uts ta wich.", promptLang: "m", answer: "Te gusta (lo que ves).", options: ["Te gusta (lo que ves).", "Me gusta (lo que veo).", "Le gusta (lo que ve)."] }
      ]
    },
    {
      id: "u11l3",
      title: "Necesito",
      goal: "Al terminar podrás decir que necesitas algo o que tienes que irte, y preguntar si otra persona lo necesita.",
      teach: [
        {
          kind: "text",
          title: "k'abéet: «hace falta»",
          html: "<span class=\"m\">k'abéet</span> quiere decir «es necesario, hace falta». No cambia con la persona: quien necesita va <b>después</b>, con las palabras de la unidad 3 que aquí significan «a mí» y «a ti»: <span class=\"m\">K'abéet teen ja'</span>, «necesito agua» (literalmente «me hace falta agua»); <span class=\"m\">K'abéet teech ja'?</span>, «¿necesitas agua?».<br>Con un verbo, la persona va antes del verbo: <span class=\"m\">K'abéet in bin</span>, «tengo que irme»."
        },
        {
          kind: "table",
          title: "Necesitar",
          head: ["Maya", "Español"],
          rows: [
            ["K'abéet teen …", "necesito …"],
            ["K'abéet teech …?", "¿necesitas …?"],
            ["K'abéet in + verbo", "tengo que …, necesito …"],
            ["Ma' k'abéeti'", "no hace falta; no es necesario"]
          ]
        },
        {
          kind: "tip",
          title: "Una palabra, varias escrituras",
          html: "La UADY escribe <span class=\"m\">k'abéet</span>; muchas guías modernas escriben <span class=\"m\">k'a'abéet</span> y los textos de estudio, <i>k'abet</i>. Es la misma palabra: aquí usamos la de la UADY y al escribir aceptamos las otras.<br>No la confundas con <span class=\"m\">k'a'anan</span>, «necesario, valioso, importante» (un adjetivo), ni con <span class=\"m\">yaan in</span> (unidad 9), otra manera de decir «tengo que»."
        }
      ],
      vocab: [
        { id: "u11-kabeet", m: "k'abéet", es: "es necesario; hace falta", pr: "k'abéet (ée larga con tono alto)", alt: ["k'a'abéet", "k'abet", "k'a'abet"], note: "La UADY lo anota como «cosa necesaria, útil». No se conjuga: las personas van después (teen, teech) o con el verbo (in bin).", conf: "alta" },
        { id: "u11-kabeet-teen", m: "K'abéet teen ja'.", es: "Necesito agua.", pr: "k'abéet teen ja'", alt: ["K'a'abéet teen ja'."], note: "Blair y Vermont-Salas: k'abet ten suum, «necesito una soga». Cambiamos el objeto por ja' (unidad 1).", conf: "media" },
        { id: "u11-kabeet-teech", m: "K'abéet teech ja'?", es: "¿Necesitas agua?", pr: "k'abéet teech ja'", alt: ["K'a'abéet teech ja'?"], note: "Blair y Vermont-Salas: k'abet teech kaab wah chukwa'?, «¿necesitas miel o chocolate?». La pregunta se marca con la entonación.", conf: "media" },
        { id: "u11-kabeet-in-bin", m: "K'abéet in bin.", es: "Tengo que irme.", pr: "k'abéet in bin", alt: ["K'a'abéet in bin."], note: "La Lengua Maya de Yucatán da K'a'abéet in bin. El patrón k'abéet + in + verbo también está en Blair y Vermont-Salas (k'abet in tuxtik jun-p'éel kaartah, «necesito enviar una carta»).", conf: "media" },
        { id: "u11-ma-kabeeti", m: "Ma' k'abéeti'.", es: "No hace falta.", pr: "ma- k'abéeti-", alt: ["Ma' k'a'abéeti'"], note: "Andrade da ma k'abeti, «no es necesario; no hay necesidad de ello».", conf: "media" },
        { id: "u11-kaanan", m: "k'a'anan", es: "necesario, valioso, importante", pr: "k'a-anan", note: "Así lo anota la UADY. Es un adjetivo («importante»); para «necesitar» se usa k'abéet.", conf: "alta" }
      ],
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "K'abéet teen ja'.", promptLang: "m", answer: "Necesito agua.", options: ["Necesito agua.", "Quiero agua.", "Hay agua."] },
        { type: "fill", es: "Necesito agua.", before: "K'abéet", after: "ja'.", answer: "teen", options: ["teen", "teech", "to'on"] },
        { type: "fill", es: "¿Necesitas agua?", before: "K'abéet", after: "ja'?", answer: "teech", options: ["teech", "teen", "te'ex"] },
        { type: "fill", es: "Tengo que irme.", before: "K'abéet in", after: "", answer: "bin", options: ["bin", "janal", "wenel"] },
        { type: "type", q: "Escribe en maya", prompt: "es necesario; hace falta", answer: "k'abéet", alt: ["k'a'abéet", "k'abet", "k'a'abet"] },
        { type: "type", q: "Escribe en maya", prompt: "necesario, valioso, importante", answer: "k'a'anan" },
        { type: "choice", q: "¿Qué significa?", prompt: "Ma' k'abéeti'.", promptLang: "m", answer: "No hace falta.", options: ["No hace falta.", "No quiero.", "No tengo."] },
        { type: "choice", q: "Repaso: ¿cuál de estas frases dice «tengo que irme»?", prompt: "tengo que irme", promptLang: "es", answer: "K'abéet in bin.", options: ["K'abéet in bin.", "In k'áat bin.", "Ma' in k'áati'."] }
      ]
    },
    {
      id: "u11l4",
      title: "Pedir y dar",
      goal: "Al terminar podrás pedir agua, tortilla o cosas del mercado con cortesía y entender el verbo «dar».",
      teach: [
        {
          kind: "text",
          title: "Dar: ts'aa",
          html: "<span class=\"m\">ts'aa</span> es «dar, entregar» (y también «poner»); algunas guías escriben la raíz <i>ts'a'</i>. Para «tú me das» se agrega <span class=\"m\">teen</span>, «a mí»: <span class=\"m\">a ts'a'ik teen</span>. Una guía de estudio (Blair y Vermont-Salas) trae la petición cortés <span class=\"m\">Beet uts a ts'a'ik teen …</span>, «por favor, dame …», con <span class=\"m\">beet uts</span>, «haz el favor» (en la unidad 2 viste <span class=\"m\">Meent uts</span>).<br>La orden corta («¡dame!», «¡toma!») tiene su propia forma; todavía no la enseñamos."
        },
        {
          kind: "text",
          title: "Pedir cosas: in k'áat + lo que quieres",
          html: "Para pedir basta lo de la lección 1: <span class=\"m\">In k'áat ja'</span> (quiero agua), <span class=\"m\">In k'áat waaj</span> (quiero tortilla), <span class=\"m\">In k'áat ka'ap'éel oon</span> (quiero dos aguacates; <span class=\"m\">oon</span> y <span class=\"m\">ka'ap'éel</span> ya los conoces). Y quien te atiende pregunta <span class=\"m\">Ba'ax a k'áat?</span>.<br>Estas tres frases las armamos con el patrón de la lección 1 y las palabras de las unidades 1, 4 y 6; no las vimos escritas tal cual."
        },
        {
          kind: "tip",
          title: "Dar y agarrar",
          html: "El par de «dar» es <span class=\"m\">ch'a'</span>, «agarrar»: la UADY da <span class=\"m\">ch'a'</span>, <span class=\"m\">maach</span> y <span class=\"m\">cháach</span> para «agarrar». Verás escrita la misma sílaba en <span class=\"m\">ch'a' iik'</span> (respirar, unidad 7) y en <span class=\"m\">Ch'a' Cháak</span> (unidad 1); no afirmamos que sea la misma palabra en todos los casos."
        }
      ],
      vocab: [
        { id: "u11-tsaa", m: "ts'aa", es: "dar, entregar; poner", pr: "ts'aa (ts' glotalizada, aa larga)", alt: ["ts'a'", "ts'a"], note: "La UADY: «dar, entregar, poner en algún lugar». Con una persona: a ts'a'ik teen, «tú me das».", conf: "alta" },
        { id: "u11-cha", m: "ch'a'", es: "agarrar", pr: "ch'a-", note: "La UADY lo da para «agarrar», junto con maach y cháach.", conf: "alta" },
        { id: "u11-beet-uts-tsaik-teen", m: "Beet uts a ts'a'ik teen ja'.", es: "Por favor, dame agua.", pr: "beet uts a ts'a-ik teen ja'", note: "Calcada de Blair y Vermont-Salas: Beet uts a ts'a'ik teen jump'éel tiimbre, «por favor, dame una estampilla». Cambiamos el objeto por ja'.", conf: "media" },
        { id: "u11-kaat-jaa", m: "In k'áat ja'.", es: "Quiero agua.", pr: "in k'áat ja'", note: "in k'áat + lo que quieres, como en In k'áat bin Uxmal.", conf: "media" },
        { id: "u11-kaat-waaj", m: "In k'áat waaj.", es: "Quiero tortilla.", pr: "in k'áat waaj", note: "Sirve tanto para una tortilla como para varias.", conf: "media" },
        { id: "u11-kaat-kaapeel-oon", m: "In k'áat ka'ap'éel oon.", es: "Quiero dos aguacates.", pr: "in k'áat ka-ap'éel oon", note: "ka'ap'éel oon, «dos aguacates», viene del diálogo del mercado de la unidad 6.", conf: "media" }
      ],
      dialogue: {
        title: "En casa de doña Rosa (diálogo de práctica)",
        lines: [
          { who: "A", name: "Doña Rosa", m: "Ba'ax a k'áat?", es: "¿Qué quieres?" },
          { who: "B", name: "Sofía", m: "In k'áat janal.", es: "Quiero comer." },
          { who: "A", name: "Doña Rosa", m: "Yaan waaj yéetel bu'ul.", es: "Hay tortilla con frijol." },
          { who: "B", name: "Sofía", m: "Beet uts a ts'a'ik teen waaj.", es: "Por favor, dame tortilla." },
          { who: "A", name: "Doña Rosa", m: "Ma'alob. K'abéet teech ja'?", es: "Bien. ¿Necesitas agua?" },
          { who: "B", name: "Sofía", m: "Beey. In k'áat ja'. Dios bo'otik.", es: "Sí. Quiero agua. Gracias." },
          { who: "A", name: "Doña Rosa", m: "Mixba'al.", es: "De nada." }
        ]
      },
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "ts'aa", promptLang: "m", answer: "dar, entregar; poner", options: ["dar, entregar; poner", "agarrar", "querer"] },
        { type: "type", q: "Escribe en maya", prompt: "dar, entregar; poner", answer: "ts'aa", alt: ["ts'a'", "ts'a"] },
        { type: "type", q: "Escribe en maya", prompt: "agarrar", answer: "ch'a'" },
        { type: "fill", es: "Quiero agua.", before: "In k'áat", after: "", answer: "ja'", options: ["ja'", "waaj", "oon"] },
        { type: "fill", es: "Por favor, dame agua.", before: "Beet uts a", after: "teen ja'.", answer: "ts'a'ik", options: ["ts'a'ik", "k'áat", "k'abéet"] },
        { type: "choice", q: "¿Qué significa?", prompt: "In k'áat ka'ap'éel oon.", promptLang: "m", answer: "Quiero dos aguacates.", options: ["Quiero dos aguacates.", "Quiero dos tortillas.", "Hay dos aguacates."] },
        { type: "build", es: "Me gusta (lo que como).", m: "Uts tin chi'.", distractors: ["wich", "ta"] },
        { type: "choice", q: "¿Qué significa?", prompt: "Beet uts a ts'a'ik teen waaj.", promptLang: "m", answer: "Por favor, dame tortilla.", options: ["Por favor, dame tortilla.", "Por favor, hay tortilla.", "Quiero tortilla."] }
      ]
    }
  ]
});
