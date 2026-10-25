/* Unidad 6 · Comida y mercado. Solo formas con estado «verificado» (conf alta) o «probable» (conf media) en la base y en la reverificación. */
(window.COURSE = window.COURSE || { units: [] }).units.push({
  id: "u6",
  n: 6,
  title: "Comida y mercado",
  subtitle: "El maíz en la mesa, hambre y sabores, comprar en el mercado y animales de granja",
  sources: [
    { title: "UADY – Diccionario maya, letra W (waaj, wakax)", url: "https://www.mayas.uady.mx/diccionario/w_maya.html" },
    { title: "UADY – Diccionario maya, letra B (bu'ul, bajux)", url: "https://www.mayas.uady.mx/diccionario/b_maya.html" },
    { title: "UADY – Diccionario maya, letra K (kakaw, ki', kay, ko'oj, koonol)", url: "https://www.mayas.uady.mx/diccionario/k_maya.html" },
    { title: "UADY – Diccionario maya, letra K' (k'éek'en, k'áax, k'eyem)", url: "https://www.mayas.uady.mx/diccionario/k_glotal_maya.html" },
    { title: "UADY – Diccionario maya, letra T (taak'in)", url: "https://www.mayas.uady.mx/diccionario/t_maya.html" },
    { title: "UADY – Diccionario maya, letra X (xamach)", url: "https://www.mayas.uady.mx/diccionario/x_maya.html" },
    { title: "UADY – Diccionario español-maya, letra G (gallina: kaax; gallo: t'eel)", url: "https://www.mayas.uady.mx/diccionario/g_esp.html" },
    { title: "UADY – Diccionario español-maya, letra P (tojol, k'íiwik; pavo: úulum, tso')", url: "https://www.mayas.uady.mx/diccionario/p_esp.html" },
    { title: "UADY – Diccionario español-maya, letra C (canasta: xaak; carne: bak'; caliente: chokoj)", url: "https://www.mayas.uady.mx/diccionario/c_esp.html" },
    { title: "UADY – Diccionario español-maya, letra H (huevo: je'; hambre: wi'ij)", url: "https://www.mayas.uady.mx/diccionario/h_esp.html" },
    { title: "UADY – Diccionario maya, letra S (sa')", url: "https://www.mayas.uady.mx/diccionario/s_maya.html" },
    { title: "UADY – Diccionario maya, letra O (o'och)", url: "https://www.mayas.uady.mx/diccionario/o_maya.html" },
    { title: "UADY – Diccionario maya, letra U (uk', uk'ul)", url: "https://www.mayas.uady.mx/diccionario/u_maya.html" },
    { title: "UADY – Diccionario maya, letra CH' (ch'óoch')", url: "https://www.mayas.uady.mx/diccionario/ch_glotal_maya.html" },
    { title: "UADY – Diccionario maya, letra Y (yaan)", url: "https://www.mayas.uady.mx/diccionario/y_maya.html" },
    { title: "UADY – Diccionario maya, letra M (mina'an)", url: "https://www.mayas.uady.mx/diccionario/m_maya.html" },
    { title: "UADY – Adivinanzas (chak iik)", url: "https://www.mayas.uady.mx/literatura/adiv1.html" },
    { title: "UADY – La milpa maya como agricultura migratoria", url: "https://www.mayas.uady.mx/articulos/milpa.html" },
    { title: "UADY – Comidas campesinas en Xocen, Yucatán (k'óoben)", url: "https://www.mayas.uady.mx/articulos/comidas.html" },
    { title: "UADY – Curso de maya, lección 4 (koonol y otros intransitivos)", url: "https://www.mayas.uady.mx/curso_maya/lec4_9.html" },
    { title: "UADY – Curso de maya, lección 6.5 (maan, manik)", url: "https://www.mayas.uady.mx/curso_maya/lec6_5.html" },
    { title: "PorEsto (2023) – Nueva generación de milperos en José María Morelos (ixi'im)", url: "https://www.poresto.com/quintana-roo/2023/7/10/nueva-generacion-de-milperos-en-jose-maria-morelos-ignora-costumbres-mayas.amp.html" },
    { title: "Riviera Maya News – el restaurante Ixi'im de Chocholá (ixi'im, maíz)", url: "https://www.rivieramayanews.mx/yucatan-town-chochola-gets-michelin-green-star-restaurant-ixiim/" },
    { title: "Secretaría de Cultura – Recetario maya de Quintana Roo (2024, bu'ul)", url: "https://culturaspopulareseindigenas.gob.mx/pdf/2024/libros/recetarios/03%20Recetario%20maya%20de%20Quintana%20Roo%20-%20peque%C3%B1o.pdf" },
    { title: "Wiktionary – wakash (préstamo del español «vacas» en lenguas mayas)", url: "https://en.wiktionary.org/wiki/wakash" },
    { title: "Blair y Vermont-Salas, Spoken Yucatec Maya (edición de Lehmann): bajux, tohol", url: "https://www.christianlehmann.eu/ling/sprachen/maya/textos/bvs_1-18.html" },
    { title: "Manuel Andrade, A grammar of modern Yucatec Maya (edición de Lehmann): toh-ol, precio", url: "https://www.christianlehmann.eu/ling/sprachen/maya/andrade/andrade_edit.php" },
    { title: "Blaha Pfeiler y Skopeteas (2024), Numeral classifiers in Yucatec Maya (junp'éel k'éek'en)", url: "https://historicalsyntax.org/hs/index.php/hs/article/view/219" },
    { title: "Normas de escritura para la lengua maya: p'aak, ja'as, abal, ch'ujuk, iis, t'eel" },
    { title: "Yoshida, Guía gramatical de la lengua maya yucateca para hispanohablantes" },
    { title: "Aprendiendo Maya – Consonantes (je', bak', k'eyem, chokoj, xaak, ya', t'eel, tso')", url: "https://www.aprendiendomaya.com/escritura/alfabeto-maya" },
    { title: "Diapositivas «Yucatec fragment» (HPSG, Universidad de Kentucky): koolnáalen", url: "https://hpsg.uky.edu/sites/default/files/abstracts/yucatec-fragment-slides.pdf" },
    { title: "Wiktionary – janal (maya yucateco)", url: "https://en.wiktionary.org/wiki/janal" },
    { title: "Omniglot – Useful phrases in Yucatec Maya (wi'ijen)", url: "https://www.omniglot.com/language/phrases/yucatec-maya.php" },
    { title: "Top Yucatán – Frases básicas en maya y español (uk'ajen, mina'an taak'in)", url: "https://topyucatan.com/notas/the-yucatan-culture/frases-basicas-en-maya-y-espanol" },
    { title: "Mújica (1995), Junp'iit Maaya – A little bit of Maya (sitio de Christian Lehmann): ko'oj", url: "https://www.christianlehmann.eu/ling/sprachen/maya/textos/hunp'iit_maaya.html" },
    { title: "INALI – Narraciones mayas de Campeche (Tene' wi'ijen, uk'ajen)", url: "https://site.inali.gob.mx/publicaciones/narraciones_mayas_campeche.pdf" },
    { title: "Lehmann, Gramática maya: oración negativa (ma' … -i')", url: "https://www.christianlehmann.eu/ling/sprachen/maya/gramatica/onomas/negacion.html" },
    { title: "parryc – Yucatec Maya (ts'o'ok in janal, ma' wi'ijeni')", url: "https://parryc.com/language/yucatec-maya" },
    { title: "Heraldo de México – Ko'ox kanik maaya t'aan (ko'ox + verbo)", url: "https://yucatan.heraldodemexico.com.mx/tendencias/2025/8/27/koox-kanik-maaya-taan-asi-seran-los-cursos-para-preservar-la-lengua-maya-en-yucatan-1949.html" },
    { title: "Grambank GB253 – yaan teen waaj (Bolles y Bolles)", url: "https://grambank.clld.org/parameters/GB253" },
    { title: "Diccionario de uso del maya yucateco (manik)", url: "https://www.academia.edu/142986420/Diccionario_de_uso_del_maya_yucateco" },
    { title: "Bevington, Maya for Travelers and Students (Dios bo'otik)" },
    { title: "Montgomery, Maya (Yucatec) Dictionary & Phrasebook (Dios bo'otik)" },
    { title: "INALI – Prontuario de frases de cortesía Maayat'aan", url: "https://site.inali.gob.mx/Micrositios/Prontuarios/maya.html" },
    { title: "Ayuntamiento de Mérida – Frases básicas español-maya (PDF)", url: "https://www.merida.gob.mx/municipio/sitiosphp/merida/descargas/frases_espano_maya.pdf" }
  ],
  lessons: [
    {
      id: "u6l1",
      title: "El maíz, la milpa y la cocina",
      goal: "Al terminar podrás nombrar alimentos básicos de la cocina yucateca: maíz, frijol, elote, masa, tortilla, pozole, cacao y más.",
      teach: [
        {
          kind: "culture",
          title: "El maíz en la mesa",
          html: "La cocina maya gira alrededor del maíz, <span class=\"m\">ixi'im</span>: el grano y la planta. El <span class=\"m\">nal</span> es el elote; la <span class=\"m\">juuch'</span> es la masa, y de la masa salen la tortilla (<span class=\"m\">waaj</span>), el atole (<span class=\"m\">sa'</span>) y el pozole, una bebida de masa (<span class=\"m\">k'eyem</span>).<br>En comunidades como Xocen se cocina con leña en el <span class=\"m\">k'óoben</span>, un fogón de tres piedras; ahí va el comal, <span class=\"m\">xamach</span>."
        },
        {
          kind: "culture",
          title: "La milpa no es solo maíz",
          html: "La milpa, <span class=\"m\">kool</span>, es un policultivo: el maíz crece junto con la calabaza, el camote (<span class=\"m\">iis</span>) y varias leguminosas, como el frijol (<span class=\"m\">bu'ul</span>). Para sembrarla se roza el monte.<br>Quien la trabaja es el <span class=\"m\">koolnáal</span>, el campesino: <span class=\"m\">Koolnáalen</span>, «soy campesino»."
        },
        {
          kind: "text",
          title: "Una palabra, dos alimentos",
          html: "<span class=\"m\">waaj</span> nombra la tortilla y también el pan. Y <span class=\"m\">janal</span>, que ya conoces como «comer», también significa «comida»; otra palabra para comida es <span class=\"m\">o'och</span>.<br>Cuidado con el maíz: <span class=\"m\">ixi'im</span> es el grano y la planta, y <span class=\"m\">nal</span>, el elote tierno."
        },
        {
          kind: "tip",
          title: "Chile y viento",
          html: "<span class=\"m\">chak iik</span>, literalmente «chile rojo», es el chile habanero: el color va antes de lo que describe. Cuidado con el final: <span class=\"m\">iik</span> es chile, pero <span class=\"m\">iik'</span>, con k glotalizada, es viento. Por eso <span class=\"m\">chak iik'</span> puede ser viento fuerte o tempestad."
        }
      ],
      vocab: [
        { id: "u6-ixiim", m: "ixi'im", es: "maíz (el grano; la planta)", pr: "ishi-im", note: "Vocal rearticulada i'i y x = sh. El elote es nal.", conf: "alta" },
        { id: "u6-nal", m: "nal", es: "elote", pr: "nal", conf: "alta" },
        { id: "u6-juuch", m: "juuch'", es: "masa (de maíz)", pr: "juuch'", note: "Vocal larga y ch glotalizada al final.", conf: "alta" },
        { id: "u6-waaj", m: "waaj", es: "tortilla; pan", pr: "waaj", conf: "alta" },
        { id: "u6-keyem", m: "k'eyem", es: "pozole (bebida de masa de maíz)", pr: "k'eyem", conf: "alta" },
        { id: "u6-buul", m: "bu'ul", es: "frijol", pr: "bu-ul", note: "Vocal rearticulada u'u, como en ja'as.", conf: "alta" },
        { id: "u6-kakaw", m: "kakaw", es: "cacao", pr: "kakau", note: "Con k simple las dos veces. En la época prehispánica el cacao también servía como moneda.", conf: "alta" },
        { id: "u6-iis", m: "iis", es: "camote", pr: "iis", note: "Vocal larga. Crece en la milpa junto al maíz.", conf: "alta" },
        { id: "u6-chak-iik", m: "chak iik", es: "chile habanero", pr: "chak iik", note: "Literalmente «chile rojo». iik = chile; iik' = viento.", conf: "media" },
        { id: "u6-ooch", m: "o'och", es: "comida, alimento", pr: "o-och", note: "Vocal rearticulada o'o.", conf: "alta" },
        { id: "u6-koolnaal", m: "koolnáal", es: "campesino, milpero", pr: "koolnáal", note: "Se relaciona con kool, milpa. Con -en: koolnáalen, «soy campesino».", ex: { m: "Koolnáalen.", es: "Soy campesino." }, conf: "alta" }
      ],
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "waaj", promptLang: "m", answer: "tortilla; pan", options: ["tortilla; pan", "masa (de maíz)", "elote"] },
        { type: "choice", q: "¿Cómo se dice «maíz»?", prompt: "maíz (el grano, la planta)", promptLang: "es", answer: "ixi'im", options: ["ixi'im", "nal", "juuch'"] },
        { type: "choice", q: "¿Qué significa?", prompt: "chak iik", promptLang: "m", answer: "chile habanero", options: ["chile habanero", "viento fuerte", "elote"] },
        { type: "fill", es: "masa y tortilla", before: "juuch' yéetel", after: "", answer: "waaj", options: ["waaj", "nal", "sa'"] },
        { type: "build", es: "maíz y frijol", m: "ixi'im yéetel bu'ul", distractors: ["nal", "kakaw"] },
        { type: "type", q: "Escribe en maya", prompt: "frijol", answer: "bu'ul" },
        { type: "choice", q: "¿Qué significa?", prompt: "Koolnáalen.", promptLang: "m", answer: "Soy campesino.", options: ["Soy campesino.", "Tengo tortillas.", "Como todos los días."] },
        { type: "type", q: "Escribe en maya", prompt: "cacao", answer: "kakaw" }
      ]
    },
    {
      id: "u6l2",
      title: "Hambre, sed y sabores",
      goal: "Al terminar podrás decir que tienes hambre o sed, que ya comiste, invitar a comer y decir si algo es dulce, salado, caliente o sabroso.",
      teach: [
        {
          kind: "text",
          title: "Sin «tener» ni «estar»",
          html: "En maya, «tengo hambre» no lleva un verbo «tener»: se pega la persona al final del adjetivo. <span class=\"m\">wi'ij</span> (hambriento) + <span class=\"m\">-en</span> (yo) = <span class=\"m\">wi'ijen</span>, «tengo hambre». Igual: <span class=\"m\">uk'ajen</span>, «tengo sed».<br>Son las mismas terminaciones que sirven para «ser»: <span class=\"m\">koolnáalen</span>, «soy campesino»."
        },
        {
          kind: "table",
          title: "Tener hambre, persona por persona",
          head: ["Persona", "Maya", "Español"],
          rows: [
            ["yo", "wi'ijen", "tengo hambre"],
            ["tú", "wi'ijech", "tienes hambre"],
            ["él, ella", "wi'ij", "tiene hambre"],
            ["nosotros", "wi'ijo'on", "tenemos hambre"],
            ["ustedes", "wi'ije'ex", "ustedes tienen hambre"],
            ["ellos, ellas", "wi'ijo'ob", "ellos tienen hambre"]
          ]
        },
        {
          kind: "tip",
          title: "Negar y decir «ya comí»",
          html: "Para negar, se rodea la frase con <span class=\"m\">ma'</span> … <span class=\"m\">-i'</span>: <span class=\"m\">Ma' wi'ijeni'</span>, «no tengo hambre». Y para «ya comí»: <span class=\"m\">Ts'o'ok in janal</span>.<br>En la tabla, solo <span class=\"m\">wi'ijen</span> aparece tal cual en las fuentes; las demás formas siguen la regla de las terminaciones de persona, que las gramáticas confirman."
        },
        {
          kind: "text",
          title: "Sabores",
          html: "<span class=\"m\">ch'ujuk</span> es «dulce» y <span class=\"m\">ch'óoch'</span>, «salado»; la sal es <span class=\"m\">ta'ab</span>. Para elogiar la comida: <span class=\"m\">ki'</span>, «sabroso, rico». Con <span class=\"m\">jach</span> (muy) delante: <span class=\"m\">jach ch'ujuk</span>, muy dulce; <span class=\"m\">Jach ki'!</span>, ¡qué rico!<br>No confundas <span class=\"m\">ki'</span> con <span class=\"m\">ki'imak</span>, «alegre», de <span class=\"m\">Ki'imak in wóol</span>."
        }
      ],
      vocab: [
        { id: "u6-wiijen", m: "wi'ijen", es: "Tengo hambre.", pr: "wi-ijen", note: "wi'ij (hambriento) + -en (yo).", conf: "alta" },
        { id: "u6-wiijech", m: "wi'ijech", es: "Tienes hambre.", pr: "wi-ijech", note: "wi'ij + -ech (tú). Forma por regla; no la vimos escrita tal cual.", conf: "media" },
        { id: "u6-ukajen", m: "uk'ajen", es: "Tengo sed.", pr: "uk'ajen", note: "uk'aj (sediento) + -en (yo).", conf: "alta" },
        { id: "u6-ma-wiijeni", m: "Ma' wi'ijeni'.", es: "No tengo hambre.", pr: "ma- wi-ijeni-", note: "La negación de un estado rodea la frase: ma' … -i'.", ex: { m: "Ma' wi'ijeni', ts'o'ok in janal.", es: "No tengo hambre, ya comí." }, conf: "media" },
        { id: "u6-tsook-in-janal", m: "Ts'o'ok in janal.", es: "Ya comí.", pr: "ts'o-ok in janal", note: "ts'o'ok + in + verbo = «ya» hice algo. En el habla rápida: ts'in janal (contracción por confirmar).", conf: "alta" },
        { id: "u6-koox-janal", m: "Ko'ox janal!", es: "¡Vamos a comer!", pr: "ko-osh janal", note: "Ko'ox (vamos) + verbo invita a hacer algo juntos.", conf: "media" },
        { id: "u6-ukul", m: "uk'ul", es: "desayuno; beber", pr: "uk'ul", note: "Relacionada con uk', beber.", conf: "alta" },
        { id: "u6-chujuk", m: "ch'ujuk", es: "dulce", pr: "ch'ujuk", conf: "alta" },
        { id: "u6-chooch", m: "ch'óoch'", es: "salado", pr: "ch'óoch'", note: "Vocal larga con tono alto, entre dos ch glotalizadas.", conf: "alta" },
        { id: "u6-taab", m: "ta'ab", es: "sal", pr: "ta-ab", conf: "alta" },
        { id: "u6-chokoj", m: "chokoj", es: "caliente", pr: "chokoj", note: "De la misma raíz viene chokwil, «fiebre», que verás en la unidad del cuerpo.", conf: "alta" },
        { id: "u6-ki", m: "ki'", es: "sabroso, rico; agradable", pr: "ki- (i corta con corte de voz al final)", note: "Sirve para la comida y para lo agradable en general.", ex: { m: "Jach ki'!", es: "¡Qué rico! (lit. muy sabroso)" }, conf: "alta" }
      ],
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "uk'ajen", promptLang: "m", answer: "Tengo sed.", options: ["Tengo sed.", "Tengo hambre.", "Ya comí."] },
        { type: "choice", q: "¿Qué significa?", prompt: "wi'ijech", promptLang: "m", answer: "Tienes hambre.", options: ["Tienes hambre.", "Tengo hambre.", "Tienes sed."] },
        { type: "fill", es: "¡Qué rico! (lit. muy sabroso)", before: "Jach", after: "!", answer: "ki'", options: ["ki'", "ki'imak", "chokoj"] },
        { type: "fill", es: "Muy dulce.", before: "Jach", after: "", answer: "ch'ujuk", options: ["ch'ujuk", "ch'óoch'", "chokoj"] },
        { type: "type", q: "Escribe en maya", prompt: "Tengo hambre.", answer: "wi'ijen" },
        { type: "choice", q: "¿Qué significa?", prompt: "Ko'ox janal!", promptLang: "m", answer: "¡Vamos a comer!", options: ["¡Vamos a comer!", "Ya comí.", "Tengo hambre."] },
        { type: "choice", q: "¿Qué significa?", prompt: "Ts'o'ok in janal.", promptLang: "m", answer: "Ya comí.", options: ["Ya comí.", "Vamos a comer.", "Como todos los días."] },
        { type: "choice", q: "¿Qué significa?", prompt: "Ma' wi'ijeni', ts'o'ok in janal.", promptLang: "m", answer: "No tengo hambre, ya comí.", options: ["No tengo hambre, ya comí.", "Tengo hambre, vamos a comer.", "No tengo sed."] }
      ]
    },
    {
      id: "u6l3",
      title: "En el mercado",
      goal: "Al terminar podrás preguntar si hay algo en el mercado, pedir fruta contándola y agradecer al despedirte.",
      teach: [
        {
          kind: "text",
          title: "¿Hay? ¿No hay?",
          html: "En el mercado lo más útil es <span class=\"m\">yaan</span> (hay) y <span class=\"m\">mina'an</span> (no hay): <span class=\"m\">Mina'an taak'in</span>, «no hay dinero». Para preguntar si hay algo, agrega <span class=\"m\">wáaj</span>: <span class=\"m\">Yaan wáaj ja'as?</span>, «¿hay plátano?».<br>Para pedir, cuenta con <span class=\"m\">-p'éel</span>, como aprendiste en la unidad de números: <span class=\"m\">ka'ap'éel oon</span>, dos aguacates."
        },
        {
          kind: "culture",
          title: "Gracias que se paga",
          html: "<span class=\"m\">bo'otik</span> es «pagar». Por eso la forma más difundida de dar las gracias, <span class=\"m\">Dios bo'otik</span>, quiere decir literalmente «Dios lo paga», es decir, «que Dios te lo pague». En el mercado, la palabra del pago y la del agradecimiento son la misma."
        },
        {
          kind: "tip",
          title: "Para llevarte la compra",
          html: "La canasta es <span class=\"m\">xaak</span> (la x suena «sh»). Y si no alcanza: <span class=\"m\">Mina'an taak'in</span>.<br>En la lección siguiente aprenderás a preguntar el precio y a distinguir «comprar» de «vender»."
        }
      ],
      vocab: [
        { id: "u6-jaas", m: "ja'as", es: "plátano", pr: "ja-as", note: "Vocal rearticulada a'a.", conf: "alta" },
        { id: "u6-ya", m: "ya'", es: "zapote", pr: "ya-", note: "Termina con corte de voz.", conf: "alta" },
        { id: "u6-oon", m: "oon", es: "aguacate", pr: "oon", conf: "alta" },
        { id: "u6-abal", m: "abal", es: "ciruela", pr: "abal", conf: "alta" },
        { id: "u6-taakin", m: "taak'in", es: "dinero", pr: "taak'in", ex: { m: "Mina'an taak'in.", es: "No hay dinero." }, conf: "alta" },
        { id: "u6-yaan-waaj-jaas", m: "Yaan wáaj ja'as?", es: "¿Hay plátano?", pr: "yaan wáaj ja-as", note: "yaan (hay) + wáaj (pregunta de sí o no) + ja'as (plátano).", conf: "media" },
        { id: "u6-bootik", m: "bo'otik", es: "pagar (algo)", pr: "bo-otik", note: "De aquí viene Dios bo'otik, «gracias».", ex: { m: "Dios bo'otik.", es: "Gracias (lit. Dios lo paga)." }, conf: "media" },
        { id: "u6-xaak", m: "xaak", es: "canasta", pr: "shaak", note: "La x suena «sh». Así la escribe la UADY en su entrada para «canasta»; en la de «cesto» pone xáak, con tono alto. Otra palabra: xúuxak.", conf: "alta" }
      ],
      dialogue: {
        title: "En el mercado (diálogo de práctica)",
        lines: [
          { who: "A", name: "Sofía", m: "Bix a beel?", es: "¿Cómo está?" },
          { who: "B", name: "Doña Rosa", m: "Ma'alob, kux teech?", es: "Bien, ¿y tú?" },
          { who: "A", name: "Sofía", m: "Ma'alob. Yaan wáaj ja'as?", es: "Bien. ¿Hay plátano?" },
          { who: "B", name: "Doña Rosa", m: "Mina'an ja'as. Yaan ya' yéetel oon.", es: "No hay plátano. Hay zapote y aguacate." },
          { who: "A", name: "Sofía", m: "Ma'alob, ka'ap'éel oon. Dios bo'otik.", es: "Bueno, dos aguacates. Gracias." },
          { who: "B", name: "Doña Rosa", m: "Mixba'al. Ka xi'ik teech utsil.", es: "De nada. Que te vaya bien." },
          { who: "A", name: "Sofía", m: "Tak sáamal!", es: "¡Hasta mañana!" }
        ]
      },
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "Mina'an taak'in.", promptLang: "m", answer: "No hay dinero.", options: ["No hay dinero.", "Hay dinero.", "Tengo tortillas."] },
        { type: "fill", es: "Hay zapote y aguacate.", before: "Yaan ya'", after: "oon.", answer: "yéetel", options: ["yéetel", "wáaj", "mina'an"] },
        { type: "choice", q: "¿Qué significa?", prompt: "Yaan wáaj ja'as?", promptLang: "m", answer: "¿Hay plátano?", options: ["¿Hay plátano?", "No hay plátano.", "¿Cuánto cuesta el plátano?"] },
        { type: "fill", es: "Repaso: Dos aguacates.", before: "", after: "oon.", answer: "Ka'ap'éel", options: ["Ka'ap'éel", "Ka'atúul", "Ka'atéen"] },
        { type: "type", q: "Escribe en maya", prompt: "aguacate", answer: "oon" },
        { type: "choice", q: "¿Qué significa?", prompt: "bo'otik", promptLang: "m", answer: "pagar (algo)", options: ["pagar (algo)", "vender", "comprar (algo)"] },
        { type: "choice", q: "La vendedora te da la fruta. ¿Qué le dices?", prompt: "Gracias.", promptLang: "es", answer: "Dios bo'otik.", options: ["Dios bo'otik.", "Mixba'al.", "Mina'an taak'in."] },
        { type: "type", q: "Escribe en maya", prompt: "dinero", answer: "taak'in" }
      ]
    },
    {
      id: "u6l4",
      title: "¿Cuánto cuesta?",
      goal: "Al terminar podrás preguntar el precio, decir que algo está caro, distinguir «comprar» de «vender» y nombrar la plaza del pueblo.",
      teach: [
        {
          kind: "text",
          title: "Preguntar el precio",
          html: "<span class=\"m\">bajux</span> es «¿cuánto?», sobre todo para precios. La pregunta completa es <span class=\"m\">Bajux u tojol?</span>, literalmente «¿cuánto es su precio?»: <span class=\"m\">u</span> (su) + <span class=\"m\">tojol</span> (precio).<br>Como muchos hablantes cuentan en español a partir del 4 o del 5, no te extrañe oír el precio en español."
        },
        {
          kind: "warn",
          title: "Caro, con corte de voz",
          html: "<span class=\"m\">ko'oj</span>, con corte de voz entre las dos o, es «caro». Sin el corte, <span class=\"m\">kooj</span> es otra palabra: «golpear, pisonar». Con <span class=\"m\">jach</span> delante: <span class=\"m\">Jach ko'oj!</span>, ¡qué caro!"
        },
        {
          kind: "text",
          title: "Comprar: maan y manik",
          html: "Hay dos formas de «comprar». <span class=\"m\">maan</span> va sin objeto: ir de compras, hacer el mandado; <span class=\"m\">Táan in bin maan</span>, «voy a hacer compras». <span class=\"m\">manik</span> lleva objeto: comprar algo. Como viste con <span class=\"m\">kanik</span>, el verbo que lleva objeto termina en -ik. Por eso las guías parecían no coincidir en la vocal: son dos formas del mismo verbo.<br>Para «vender» se usa <span class=\"m\">koonol</span>."
        },
        {
          kind: "culture",
          title: "La plaza: k'íiwik",
          html: "<span class=\"m\">k'íiwik</span> es la plaza, el centro del pueblo; el diccionario de la UADY da también <span class=\"m\">chúumuk kaaj</span>. En muchos pueblos el mercado está junto a la plaza, pero la palabra quiere decir «plaza», no «mercado»."
        }
      ],
      vocab: [
        { id: "u6-bajux", m: "Bajux?", es: "¿Cuánto? (sobre todo, el precio)", pr: "bajush", note: "La x suena «sh». El diccionario de la UADY registra también bajun, con el mismo sentido.", conf: "alta" },
        { id: "u6-bajux-u-tojol", m: "Bajux u tojol?", es: "¿Cuánto cuesta? (lit. ¿cuánto es su precio?)", pr: "bajush u tojol", note: "bajux (¿cuánto?) + u (su) + tojol (precio).", conf: "alta" },
        { id: "u6-tojol", m: "tojol", es: "precio", pr: "tojol (j suave)", note: "En textos antiguos: tohol.", conf: "alta" },
        { id: "u6-kooj", m: "ko'oj", es: "caro", pr: "ko-oj", note: "Con corte de voz. Sin él, kooj es «golpear».", ex: { m: "Jach ko'oj!", es: "¡Qué caro! (lit. muy caro)" }, conf: "alta" },
        { id: "u6-maan", m: "maan", es: "comprar (sin objeto: ir de compras)", pr: "maan (a larga, tono bajo)", note: "Sin objeto, como xook (leer, estudiar). Con objeto se dice manik.", ex: { m: "Táan in bin maan.", es: "Voy a hacer compras." }, conf: "alta" },
        { id: "u6-manik", m: "manik", es: "comprar (algo)", pr: "manik", note: "Lleva -ik porque tiene objeto. En pasado: tin manaj, «lo compré».", conf: "alta" },
        { id: "u6-koonol", m: "koonol", es: "vender", pr: "koonol", note: "La UADY la da también para «venta» y «vendedor».", conf: "alta" },
        { id: "u6-kiiwik", m: "k'íiwik", es: "plaza (centro del pueblo)", pr: "k'íiwik (íi larga con tono alto)", note: "Es la plaza; el mercado suele estar cerca, pero la palabra no significa «mercado».", conf: "alta" }
      ],
      exercises: [
        { type: "choice", q: "¿Cómo preguntas el precio?", prompt: "¿Cuánto cuesta?", promptLang: "es", answer: "Bajux u tojol?", options: ["Bajux u tojol?", "Jayp'éel?", "Tu'ux ka bin?"] },
        { type: "build", es: "¿Cuánto cuesta? (lit. ¿cuánto es su precio?)", m: "Bajux u tojol?", distractors: ["tu'ux", "ko'oj"] },
        { type: "choice", q: "¿Qué significa?", prompt: "tojol", promptLang: "m", answer: "precio", options: ["precio", "dinero", "plaza"] },
        { type: "fill", es: "¡Qué caro!", before: "Jach", after: "!", answer: "ko'oj", options: ["ko'oj", "kooj", "ki'"] },
        { type: "choice", q: "¿Qué verbo usas para «comprar algo»?", prompt: "comprar (algo)", promptLang: "es", answer: "manik", options: ["manik", "koonol", "bo'otik"] },
        { type: "choice", q: "¿Qué significa?", prompt: "Táan in bin maan.", promptLang: "m", answer: "Voy a hacer compras.", options: ["Voy a hacer compras.", "Voy a vender.", "No tengo dinero."] },
        { type: "type", q: "Escribe en maya", prompt: "plaza (centro del pueblo)", answer: "k'íiwik" },
        { type: "choice", q: "¿Qué significa?", prompt: "koonol", promptLang: "m", answer: "vender", options: ["vender", "comprar", "pagar"] }
      ]
    },
    {
      id: "u6l5",
      title: "De la granja a la mesa",
      goal: "Al terminar podrás nombrar animales de granja y lo que dan a la cocina, y contarlos con -túul.",
      teach: [
        {
          kind: "text",
          title: "Animales de granja",
          html: "Los animales que se crían en casa y en el rancho: <span class=\"m\">kaax</span>, gallina; <span class=\"m\">t'eel</span>, gallo; <span class=\"m\">tso'</span>, pavo macho; <span class=\"m\">k'éek'en</span>, cerdo, y <span class=\"m\">wakax</span>, res. De ellos salen el huevo (<span class=\"m\">je'</span>) y la carne (<span class=\"m\">bak'</span>). Y el pescado es <span class=\"m\">kay</span>."
        },
        {
          kind: "culture",
          title: "Wakax: una palabra que llegó con las vacas",
          html: "Las vacas llegaron con los españoles, y su nombre también: <span class=\"m\">wakax</span> viene del español «vacas». Otras lenguas mayas, como el tseltal, el ch'ol y el ch'orti', tomaron la misma palabra."
        },
        {
          kind: "warn",
          title: "Kaax, k'áax, k'aax",
          html: "<span class=\"m\">kaax</span> es «gallina»; <span class=\"m\">k'áax</span>, con k glotalizada y tono alto, es «monte», y <span class=\"m\">k'aax</span>, con tono bajo, es «amarrar».<br>Y <span class=\"m\">kay</span>, «pescado», no es <span class=\"m\">k'aay</span>, «canto»."
        },
        {
          kind: "tip",
          title: "Contar animales",
          html: "Recuerda la unidad de números: los animales se cuentan con <span class=\"m\">-túul</span>: <span class=\"m\">juntúul k'éek'en</span>, un cerdo; <span class=\"m\">ka'atúul wakax</span>, dos reses.<br>En el habla de hoy también se oye <span class=\"m\">junp'éel k'éek'en</span>, con el clasificador general."
        }
      ],
      vocab: [
        { id: "u6-kaax", m: "kaax", es: "gallina", pr: "kaash (a larga, tono bajo)", note: "La UADY la registra también con el prefijo femenino: (x)kaax. No la confundas con k'áax, «monte».", conf: "alta" },
        { id: "u6-teel", m: "t'eel", es: "gallo", pr: "t'eel", note: "La UADY la da también con el prefijo masculino: jt'eel.", conf: "alta" },
        { id: "u6-tso", m: "tso'", es: "pavo macho, guajolote macho", pr: "tso-", note: "Termina con corte de voz. Según la UADY, tso' es el macho; el pavo en general es úulum y la hembra, xtuux.", conf: "alta" },
        { id: "u6-keeken", m: "k'éek'en", es: "cerdo, puerco", pr: "k'éek'en (dos k glotalizadas, ée con tono alto)", ex: { m: "juntúul k'éek'en", es: "un cerdo" }, conf: "alta" },
        { id: "u6-wakax", m: "wakax", es: "res, vaca, toro (ganado)", pr: "wakash", note: "Préstamo antiguo del español «vacas».", conf: "alta" },
        { id: "u6-je", m: "je'", es: "huevo", pr: "je-", note: "La UADY da también e'el.", conf: "alta" },
        { id: "u6-bak", m: "bak'", es: "carne", pr: "bak'", note: "Con vocal larga y k simple, baak es «hueso».", conf: "alta" },
        { id: "u6-kay", m: "kay", es: "pez, pescado", pr: "kai", note: "Vocal corta. No la confundas con k'aay, «canto».", conf: "alta" }
      ],
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "wakax", promptLang: "m", answer: "res, vaca", options: ["res, vaca", "cerdo", "gallina"] },
        { type: "choice", q: "¿Cómo se dice «gallina»?", prompt: "gallina", promptLang: "es", answer: "kaax", options: ["kaax", "k'áax", "kay"] },
        { type: "type", q: "Escribe en maya", prompt: "cerdo", answer: "k'éek'en" },
        { type: "fill", es: "dos reses", before: "", after: "wakax", answer: "ka'atúul", options: ["ka'atúul", "ka'atéen", "ka'alajun"] },
        { type: "build", es: "un cerdo", m: "juntúul k'éek'en", distractors: ["kaax", "junkúul"] },
        { type: "choice", q: "¿Qué significa?", prompt: "kay", promptLang: "m", answer: "pez, pescado", options: ["pez, pescado", "canto", "gallina"] },
        { type: "choice", q: "¿Qué significa?", prompt: "je'", promptLang: "m", answer: "huevo", options: ["huevo", "carne", "pavo"] },
        { type: "choice", q: "¿Qué significa?", prompt: "t'eel", promptLang: "m", answer: "gallo", options: ["gallo", "pavo", "gallina"] }
      ]
    }
  ]
});
