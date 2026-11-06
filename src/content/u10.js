/* Unidad 10 · ¿Dónde está? Solo formas con estado «verificado» (conf alta) o «probable» (conf media) en kb/recheck4-u10.json.
   Se dejaron fuera, por no verificarse: «izquierda» (ninguna forma hallada), «derecha» (una sola forma sin confirmar),
   kúuchil («lugar») suelto, los ostensivos je'ela'/je'elo', tu yáanal y tu chúumuk. */
(window.COURSE = window.COURSE || { units: [] }).units.push({
  id: "u10",
  n: 10,
  title: "¿Dónde está?",
  subtitle: "Aquí y allí, cerca y lejos, dentro y detrás, lugares del pueblo y cómo llegar",
  sources: [
    { title: "UADY – Diccionario español-maya, letra A (aquí: te'ela', waye'; ahí y allí: te'elo', tolo'; abajo: yáanal; avanzar: máan táanil)", url: "https://www.mayas.uady.mx/diccionario/a_esp.html" },
    { title: "UADY – Diccionario español-maya, letra C (cerca: naats'; centro: chúumuk; caminar: xíimbal)", url: "https://www.mayas.uady.mx/diccionario/c_esp.html" },
    { title: "UADY – Diccionario español-maya, letra D (delante: táan, táanil; derecho: toj)", url: "https://www.mayas.uady.mx/diccionario/d_esp.html" },
    { title: "UADY – Diccionario español-maya, letra E (escuela: najil xook; enfrente: táan)", url: "https://www.mayas.uady.mx/diccionario/e_esp.html" },
    { title: "UADY – Diccionario español-maya, letra I (iglesia)", url: "https://www.mayas.uady.mx/diccionario/i_esp.html" },
    { title: "UADY – Diccionario español-maya, letra L (lado: tséel)", url: "https://www.mayas.uady.mx/diccionario/l_esp.html" },
    { title: "UADY – Diccionario español-maya, letra P (pozo: ch'e'en; plaza: chúumuk kaaj; puerta: jool naj)", url: "https://www.mayas.uady.mx/diccionario/p_esp.html" },
    { title: "UADY – Diccionario maya-español, letra I (ich, ichil, iknal)", url: "https://www.mayas.uady.mx/diccionario/i_maya.html" },
    { title: "UADY – Diccionario maya-español, letra K' (k'uchul)", url: "https://www.mayas.uady.mx/diccionario/k_glotal_maya.html" },
    { title: "UADY, multimedia – «U meeyjil ich kool / El trabajo de la milpa»", url: "https://www.mayas.uady.mx/multimedia/trabajo.html" },
    { title: "Bolles y Bolles, A Grammar of the Yucatecan Mayan Language (FAMSI): pronombres locativos (tela, telo, tolo)", url: "https://www.famsi.org/reports/96072/grammar/section06.htm" },
    { title: "Bolles y Bolles, A Grammar of the Yucatecan Mayan Language (FAMSI): preposiciones comunes (yanal, tu tan, tu pach)", url: "https://www.famsi.org/reports/96072/grammar/section04.htm" },
    { title: "Christian Lehmann – Yucatec Maya spatial prepositions (ti', iknal, ich, táan, paach)", url: "https://www.christianlehmann.eu/presentations/understand/yuc_local_rel_1.html" },
    { title: "Manuel Andrade, A grammar of modern Yucatec Maya (edición de Lehmann): ichil, yanal, yok'ol", url: "https://www.christianlehmann.eu/ling/sprachen/maya/andrade/andrade_edit.php" },
    { title: "Junp'iit Maaya (Mújica 1995), sitio de Lehmann: Tu'ux yaan junp'el restaurant?", url: "https://www.christianlehmann.eu/ling/sprachen/maya/textos/hunp'iit_maaya.html" },
    { title: "Wikivoyage – Yucatec Maya phrasebook (tu'ux yaan, toj táanil)", url: "https://en.wikivoyage.org/wiki/Yucatec_Maya_phrasebook" },
    { title: "Bohnemeyer y Brown (2007), Standing divided: Dispositional verbs and locative predications in two Mayan languages, Linguistics 45 (yaan como predicado de lugar)", url: "https://forms.mpi.nl/node/48858" },
    { title: "Yoshida, Guía gramatical de la lengua maya yucateca para hispanohablantes (yaan: hay y está)" },
    { title: "Espinosa Ochoa (2021), la adquisición del sistema deíctico del maya yucateco, Journal of Child Language (te'lo')", url: "https://cambridge.org/core/journals/journal-of-child-language/article/germination-early-development-and-creativity-in-the-acquisition-of-the-yucatec-maya-deictic-system/9A25220796689BF3363DC1C25D80ECA5" },
    { title: "David Stuart, Derecha e izquierda (Mesoweb): el sur y la mano derecha", url: "https://www.mesoweb.com/es/articulos/Stuart/Derecha-e-izquierda.pdf" },
    { title: "INALI – Prontuario de frases de cortesía Maayat'aan (Máanen waye')", url: "https://site.inali.gob.mx/Micrositios/Prontuarios/maya.html" }
  ],
  lessons: [
    {
      id: "u10l1",
      title: "Aquí, allí, cerca y lejos",
      goal: "Al terminar podrás decir «aquí» y «allí», señalar si algo está cerca o lejos y preguntar dónde hay algo.",
      teach: [
        {
          kind: "table",
          title: "Aquí, allí, cerca y lejos",
          head: ["Maya", "Español"],
          rows: [
            ["waye'", "aquí, acá (unidad 8)"],
            ["te'ela'", "aquí"],
            ["te'elo'", "allí, ahí"],
            ["tolo'", "allí, allá"],
            ["naats'", "cerca"],
            ["náach", "lejos (unidad 8)"]
          ]
        },
        {
          kind: "text",
          title: "¿Dónde está? Tu'ux yaan",
          html: "Ya conoces <span class=\"m\">tu'ux</span> (¿dónde?) y <span class=\"m\">yaan</span> (hay). El maya no distingue entre «hay» y «está»: <span class=\"m\">yaan</span> sirve para los dos. Por eso «¿dónde está…?» y «¿dónde hay…?» se preguntan igual, con el molde <span class=\"m\">Tu'ux yaan …?</span>, que aparece en el curso introductorio <i>Junp'iit Maaya</i> para preguntar dónde hay un restaurante.<br>Para contestar basta poner el lugar: <span class=\"m\">Yaan te'elo'.</span> (allí hay, allí está) o <span class=\"m\">Mina'an waye'.</span> (aquí no hay, aquí no está)."
        },
        {
          kind: "tip",
          title: "Dos «aquí» y dos «allí»",
          html: "Los diccionarios dan más de una palabra para cada uno. El de la UADY pone <span class=\"m\">te'ela'</span> y <span class=\"m\">waye'</span> para «aquí», y <span class=\"m\">te'elo'</span> y <span class=\"m\">tolo'</span> para «allí», sin marcar diferencias claras: aprende las dos de cada par.<br>Fíjate en el final de <span class=\"m\">te'ela'</span> y <span class=\"m\">te'elo'</span>: <b>-a'</b> señala lo cercano y <b>-o'</b> lo lejano. Algunos textos escriben <span class=\"m\">te'lo'</span>."
        },
        {
          kind: "tip",
          title: "Náach y naats': no las mezcles",
          html: "<span class=\"m\">náach</span> (lejos, unidad 8) y <span class=\"m\">naats'</span> (cerca) se parecen al principio. Fíjate en el final: la que acaba en <b>ch</b> es «lejos» y la que acaba en <b>ts'</b> es «cerca». La <i>ts'</i> se dice con un golpe de garganta."
        }
      ],
      vocab: [
        { id: "u10-teela", m: "te'ela'", es: "aquí", pr: "te-ela-", note: "La UADY la da junto a waye' para «aquí». Bolles y Bolles la escriben tela.", conf: "alta" },
        { id: "u10-teelo", m: "te'elo'", es: "allí, ahí", pr: "te-elo-", note: "La UADY lo da bajo «ahí», «allí» y «allá». Es el opuesto de te'ela'.", conf: "alta" },
        { id: "u10-tolo", m: "tolo'", es: "allí, allá", pr: "tolo-", note: "La UADY lo da junto a te'elo', y Bolles y Bolles como otra forma de «allí». No hallamos una regla que los distinga.", conf: "alta" },
        { id: "u10-naats", m: "naats'", es: "cerca", pr: "naats' (ts con golpe de garganta)", note: "Es lo contrario de náach, «lejos» (unidad 8).", conf: "alta" },
        { id: "u10-tuux-yaan", m: "Tu'ux yaan …?", es: "¿Dónde hay …? / ¿Dónde está …?", pr: "tu-ush yaan", note: "El molde sale de Tu'ux yaan junp'el restaurant?, «¿dónde hay un restaurante?», del curso Junp'iit Maaya, y de una guía de frases. Con otros nombres es una frase nueva, por eso va por confirmar.", ex: { m: "Tu'ux yaan junp'éel k'íiwik?", es: "¿Dónde hay una plaza?" }, conf: "media" },
        { id: "u10-yaan-teelo", m: "Yaan te'elo'.", es: "Allí hay. / Allí está.", pr: "yaan te-elo-", note: "yaan (hay, está) + el lugar. Armada con piezas confirmadas; no la vimos escrita tal cual.", conf: "media" },
        { id: "u10-minaan-waye", m: "Mina'an waye'.", es: "Aquí no hay. / Aquí no está.", pr: "mina-an waye-", note: "mina'an es el negativo de yaan. Armada con piezas confirmadas; no la vimos escrita tal cual.", conf: "media" }
      ],
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "naats'", promptLang: "m", answer: "cerca", options: ["cerca", "lejos", "aquí"] },
        { type: "choice", q: "Cuidado con la última vocal: ¿cuál de estas es «aquí»?", prompt: "aquí", promptLang: "es", answer: "te'ela'", options: ["te'ela'", "te'elo'", "naats'"] },
        { type: "type", q: "Escribe en maya", prompt: "cerca", answer: "naats'" },
        { type: "type", q: "Escribe en maya", prompt: "allí, ahí", answer: "te'elo'", alt: ["tolo'"] },
        { type: "fill", es: "¿Dónde hay una plaza?", before: "", after: "yaan junp'éel k'íiwik?", answer: "Tu'ux", options: ["Tu'ux", "Bix", "Máax"] },
        { type: "fill", es: "Aquí no hay.", before: "", after: "waye'.", answer: "Mina'an", options: ["Mina'an", "Yaan", "Tu'ux"] },
        { type: "type", q: "Repaso: escribe en maya", prompt: "lejos", answer: "náach" },
        { type: "choice", q: "¿Qué significa?", prompt: "Yaan te'elo'.", promptLang: "m", answer: "Allí hay. / Allí está.", options: ["Allí hay. / Allí está.", "Aquí no hay.", "Está lejos."] }
      ]
    },
    {
      id: "u10l2",
      title: "Dentro, delante, detrás, encima y debajo",
      goal: "Al terminar podrás decir si algo está dentro, delante, detrás, encima, debajo o al lado de otra cosa.",
      teach: [
        {
          kind: "text",
          title: "La palabrita «tu»",
          html: "Para decir «detrás de…» o «delante de…» el maya usa partes del cuerpo. <span class=\"m\">tu paach</span> es «detrás de», de <span class=\"m\">paach</span> (la espalda, unidad 7), y <span class=\"m\">tu táan</span> es «delante de, frente a», de <span class=\"m\">táan</span> (la frente, unidad 1). La palabrita <span class=\"m\">tu</span> junta <span class=\"m\">ti'</span> («en») con <span class=\"m\">u</span> («su»): algo así como «en su espalda», «en su frente».<br>Después va lo que sirve de referencia: <span class=\"m\">tu paach le najo'</span>, «detrás de esa casa» (<span class=\"m\">le najo'</span> es «esa casa»; la lección 3 explica el <span class=\"m\">le … o'</span>)."
        },
        {
          kind: "table",
          title: "Dónde está algo",
          head: ["Maya", "Español"],
          rows: [
            ["ichil", "dentro de, entre"],
            ["tu paach", "detrás de"],
            ["tu táan", "delante de, frente a"],
            ["tu yóok'ol", "encima de, sobre"],
            ["yáanal", "debajo de, abajo"],
            ["tséel", "lado"],
            ["tu tséel", "al lado de"],
            ["iknal", "junto a, en compañía de"]
          ]
        },
        {
          kind: "tip",
          title: "Ich, la misma de «ojo»",
          html: "<span class=\"m\">ich</span> (ojo, cara, unidad 7) también es «en, dentro de». La UADY la da como «en, entre, dentro». Por eso <span class=\"m\">ich maaya</span> es «en maya» (unidad 5) y <span class=\"m\">ich kool</span> es «en la milpa»; así termina el título <span class=\"m\">U meeyjil ich kool</span>, «El trabajo de la milpa», de un material multimedia de la UADY.<br><span class=\"m\">ichil</span> se usa parecido: «dentro de, entre»."
        },
        {
          kind: "tip",
          title: "Grafías viejas",
          html: "Las gramáticas antiguas escriben <i>tu tan</i> y <i>tu pach</i>, sin vocal larga ni tono; hoy se escriben <span class=\"m\">tu táan</span> y <span class=\"m\">tu paach</span>. Lo mismo pasa con <i>yanal</i>, que hoy es <span class=\"m\">yáanal</span>. Y no confundas <span class=\"m\">yáanal</span> («debajo de») con <span class=\"m\">yaan</span> («hay»)."
        }
      ],
      vocab: [
        { id: "u10-ichil", m: "ichil", es: "dentro de, entre", pr: "ichil", note: "La UADY la da como «dentro, entre»; la gramática de Andrade la lista como preposición («in, within»).", conf: "alta" },
        { id: "u10-ich-kool", m: "ich kool", es: "en la milpa", pr: "ich kool", note: "ich (ojo, cara) también es «en, dentro de». Armada con piezas confirmadas; la vimos como parte de un título de la UADY, no como oración.", conf: "media" },
        { id: "u10-tu-paach", m: "tu paach", es: "detrás de", pr: "tu paach (aa larga)", note: "Las gramáticas antiguas la escriben tu pach. Después va lo que sirve de referencia.", conf: "alta" },
        { id: "u10-tu-taan", m: "tu táan", es: "delante de, frente a", pr: "tu táan (aa larga, tono alto)", note: "Las gramáticas antiguas la escriben tu tan. La UADY da táan para «delante» y «enfrente».", conf: "alta" },
        { id: "u10-tu-yookol", m: "tu yóok'ol", es: "encima de, sobre", pr: "tu yóok'ol", note: "yóok'ol (unidad 8) con tu, como tu paach. No la vimos escrita tal cual en las fuentes que revisamos.", conf: "media" },
        { id: "u10-yaanal", m: "yáanal", es: "debajo de; abajo", pr: "yáanal (aa larga, tono alto)", note: "La UADY la da para «abajo»; Bolles y Andrade la escriben yanal y la glosan «under». No la confundas con yaan, «hay».", conf: "alta" },
        { id: "u10-tseel", m: "tséel", es: "lado", pr: "tséel (ee larga, tono alto)", note: "La UADY la da para «lado».", conf: "alta" },
        { id: "u10-tu-tseel", m: "tu tséel", es: "al lado de", pr: "tu tséel", note: "tu + tséel, igual que tu paach. No la vimos escrita tal cual; conviene que un hablante la confirme.", conf: "media" },
        { id: "u10-iknal", m: "iknal", es: "junto a; en compañía de", pr: "iknal", note: "La UADY la define «en compañía de, junto de o a, con». Lehmann la da como la preposición de cercanía y contacto. Por ahora solo la reconocemos.", conf: "alta" },
        { id: "u10-yaan-tu-paach", m: "Yaan tu paach le najo'.", es: "Está detrás de la casa.", pr: "yaan tu paach le najo-", note: "yaan (está) + tu paach (detrás de) + le najo' (esa casa). Armada con piezas confirmadas; no la vimos escrita tal cual.", conf: "media" }
      ],
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "ichil", promptLang: "m", answer: "dentro de, entre", options: ["dentro de, entre", "debajo de", "detrás de"] },
        { type: "type", q: "Escribe en maya", prompt: "detrás de", answer: "tu paach" },
        { type: "type", q: "Escribe en maya", prompt: "delante de, frente a", answer: "tu táan" },
        { type: "choice", q: "¿Cómo se dice «debajo de»?", prompt: "debajo de", promptLang: "es", answer: "yáanal", options: ["yáanal", "yaan", "yóok'ol"] },
        { type: "fill", es: "Está detrás de la casa.", before: "Yaan tu", after: "le najo'.", answer: "paach", options: ["paach", "táan", "tséel"] },
        { type: "type", q: "Escribe en maya", prompt: "dentro de, entre", answer: "ichil" },
        { type: "choice", q: "¿Qué significa?", prompt: "iknal", promptLang: "m", answer: "junto a; en compañía de", options: ["junto a; en compañía de", "debajo de", "lejos"] },
        { type: "type", q: "Escribe en maya", prompt: "lado", answer: "tséel" }
      ]
    },
    {
      id: "u10l3",
      title: "Lugares del pueblo",
      goal: "Al terminar podrás nombrar lugares del pueblo (escuela, pozo, plaza, puerta) y preguntar dónde están.",
      teach: [
        {
          kind: "table",
          title: "En el pueblo",
          head: ["Maya", "Español"],
          rows: [
            ["kaaj", "pueblo (unidad 2)"],
            ["k'íiwik", "plaza (unidad 6)"],
            ["chúumuk kaaj", "centro del pueblo, plaza"],
            ["najil xook", "escuela"],
            ["ch'e'en", "pozo"],
            ["jool naj", "puerta (de la casa)"],
            ["naj k'uj", "iglesia (por confirmar)"],
            ["bej", "camino (unidad 1)"],
            ["kool", "milpa (unidad 8)"]
          ]
        },
        {
          kind: "text",
          title: "Preguntar por un lugar",
          html: "Para «¿dónde está la escuela?» se usa el mismo molde de la lección 1: <span class=\"m\">Tu'ux yaan le najil xooko'?</span> Con <span class=\"m\">le … o'</span> se señala algo que ya se conoce o que está lejos («la escuela, esa escuela»); con <span class=\"m\">le … a'</span>, algo cercano («esta»). La terminación <span class=\"m\">-o'</span> se pega a la última palabra: <span class=\"m\">najil xook</span> pasa a <span class=\"m\">najil xooko'</span>.<br>Si preguntas por uno cualquiera, usa <span class=\"m\">junp'éel</span>: <span class=\"m\">Tu'ux yaan junp'éel ch'e'en?</span>, «¿dónde hay un pozo?»."
        },
        {
          kind: "tip",
          title: "Iglesia y escuela: otras formas",
          html: "Para «iglesia» el diccionario de la UADY da <span class=\"m\">naj k'uj</span> (<span class=\"m\">naj</span> es «casa»). Solo lo encontramos en esa fuente, así que va marcado «por confirmar» y no lo practicamos escribiéndolo.<br>Para «escuela», la UADY da también <span class=\"m\">kúuchil kaansaj</span>."
        }
      ],
      vocab: [
        { id: "u10-najil-xook", m: "najil xook", es: "escuela", pr: "najil shook", note: "naj (casa) + xook (leer, estudiar): algo así como «casa de estudio». La UADY da también kúuchil kaansaj.", conf: "alta" },
        { id: "u10-cheen", m: "ch'e'en", es: "pozo", pr: "ch'e-en (ch con golpe de garganta; e rearticulada)", note: "La UADY la da para «pozo».", conf: "alta" },
        { id: "u10-jool-naj", m: "jool naj", es: "puerta (de la casa)", pr: "jool naj (j suave, oo larga)", alt: ["joonaj"], note: "La UADY da dos formas: jool naj y la contraída joonaj. jool es «agujero, hueco» y naj, «casa».", conf: "alta" },
        { id: "u10-chuumuk", m: "chúumuk", es: "centro, medio", pr: "chúumuk (uu larga, tono alto)", note: "La UADY la da para «centro».", conf: "alta" },
        { id: "u10-chuumuk-kaaj", m: "chúumuk kaaj", es: "centro del pueblo; plaza", pr: "chúumuk kaaj", note: "La UADY lo da bajo «plaza», junto a k'íiwik (unidad 6).", conf: "alta" },
        { id: "u10-naj-kuj", m: "naj k'uj", es: "iglesia", pr: "naj k'uj", note: "Así lo da el diccionario de la UADY; no lo encontramos en una segunda fuente.", conf: "media" },
        { id: "u10-tuux-yaan-xook", m: "Tu'ux yaan le najil xooko'?", es: "¿Dónde está la escuela?", pr: "tu-ush yaan le najil shooko-", note: "Molde Tu'ux yaan … con le … o' («la escuela, esa escuela»). Armada con piezas confirmadas; no la vimos escrita tal cual.", conf: "media" }
      ],
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "ch'e'en", promptLang: "m", answer: "pozo", options: ["pozo", "puerta", "escuela"] },
        { type: "type", q: "Escribe en maya", prompt: "escuela", answer: "najil xook" },
        { type: "type", q: "Escribe en maya", prompt: "pozo", answer: "ch'e'en" },
        { type: "type", q: "Escribe en maya", prompt: "puerta (de la casa)", answer: "jool naj", alt: ["joonaj"] },
        { type: "choice", q: "¿Cómo se dice «centro»?", prompt: "centro", promptLang: "es", answer: "chúumuk", options: ["chúumuk", "tséel", "ichil"] },
        { type: "fill", es: "¿Dónde hay un pozo?", before: "Tu'ux yaan junp'éel", after: "?", answer: "ch'e'en", options: ["ch'e'en", "jool naj", "najil xook"] },
        { type: "type", q: "Repaso: escribe en maya", prompt: "plaza", answer: "k'íiwik", alt: ["chúumuk kaaj"] }
      ]
    },
    {
      id: "u10l4",
      title: "Ir y llegar",
      goal: "Al terminar podrás entender indicaciones sencillas (pasar por aquí, seguir derecho, avanzar) y conocer los verbos caminar y llegar.",
      teach: [
        {
          kind: "text",
          title: "Seguir el camino",
          html: "<span class=\"m\">xíimbal</span> es «caminar» (también se usa para «visitar», como en <span class=\"m\">a xíimbal to'on</span>, unidad 9) y <span class=\"m\">k'uchul</span> es «llegar». Para avanzar, la UADY da <span class=\"m\">máan táanil</span>, «pasar adelante».<br>Para «todo derecho» se usa <span class=\"m\">toj táanil</span>: <span class=\"m\">toj</span> es «derecho, recto» y <span class=\"m\">táanil</span> es «adelante» (unidad 8). Y ya sabes pedir que pasen: <span class=\"m\">Máanen waye'.</span>"
        },
        {
          kind: "tip",
          title: "Derecha e izquierda: todavía no",
          html: "Buscamos «derecha» e «izquierda» en el diccionario de la UADY, en gramáticas y en guías de frases. Para «izquierda» no apareció ninguna forma en maya yucateco, y para «derecha» solo una que no pudimos confirmar. Como enseñar una forma equivocada es peor que no enseñarla, por ahora no las incluimos. Mientras tanto puedes orientar con lo que sí sabes: <span class=\"m\">te'elo'</span> (allí), <span class=\"m\">toj táanil</span> (todo derecho) y <span class=\"m\">Máanen waye'.</span> (pase por aquí)."
        },
        {
          kind: "culture",
          title: "El sur queda a la derecha",
          html: "Si te paras mirando hacia donde sale el sol, <span class=\"m\">lak'in</span> (el oriente), el sur te queda a la mano derecha. David Stuart, que estudia la escritura maya, señala que en varias lenguas mayas la palabra para «sur» se relaciona con la de «mano derecha». En maya yucateco el sur es <span class=\"m\">nojol</span> (unidad 8): una buena forma de recordar los rumbos con el cuerpo.<br>Eso sí, aquí todavía no enseñamos «derecha» e «izquierda» en maya, porque no pudimos confirmar sus formas."
        }
      ],
      vocab: [
        { id: "u10-xiimbal", m: "xíimbal", es: "caminar", pr: "shíimbal (ii larga, tono alto)", note: "La UADY la da para «caminar». También se usa para «visitar»: a xíimbal to'on, «visitarnos» (unidad 9).", conf: "alta" },
        { id: "u10-kuchul", m: "k'uchul", es: "llegar", pr: "k'uchul (k' con golpe de garganta)", note: "La UADY la da como «llegar, arribar».", conf: "alta" },
        { id: "u10-maan-taanil", m: "máan táanil", es: "avanzar, pasar adelante", pr: "máan táanil", note: "La UADY la da para «avanzar». Ojo con el tono: máan, «pasar» (como en Máanen waye'), no es maan, «comprar» (unidad 6).", conf: "alta" },
        { id: "u10-toj", m: "toj", es: "derecho, recto", pr: "toj (j suave)", note: "La UADY lo da bajo «derecho», junto a otras formas que no pudimos confirmar. Aquí solo enseñamos el sentido «recto».", conf: "media" },
        { id: "u10-toj-taanil", m: "toj táanil", es: "todo derecho, hacia adelante", pr: "toj táanil", note: "Una guía de frases lo da para «seguir derecho»; toj y táanil sí están en la UADY, pero falta una segunda fuente para la frase completa.", conf: "media" }
      ],
      dialogue: {
        title: "¿Dónde está la escuela? (diálogo de práctica)",
        lines: [
          { who: "A", name: "Sofía", m: "Tu'ux yaan le najil xooko'?", es: "¿Dónde está la escuela?" },
          { who: "B", name: "Don Felipe", m: "Yaan te'elo', tu táan le k'íiwiko'.", es: "Allí está, frente a la plaza." },
          { who: "A", name: "Sofía", m: "Náach wáaj?", es: "¿Está lejos?" },
          { who: "B", name: "Don Felipe", m: "Ma', naats'. Toj táanil.", es: "No, está cerca. Todo derecho." },
          { who: "A", name: "Sofía", m: "Dios bo'otik!", es: "¡Gracias!" },
          { who: "B", name: "Don Felipe", m: "Ka xi'ik teech jats'uts!", es: "¡Que te vaya bien!" }
        ]
      },
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "k'uchul", promptLang: "m", answer: "llegar", options: ["llegar", "caminar", "avanzar"] },
        { type: "type", q: "Escribe en maya", prompt: "caminar", answer: "xíimbal" },
        { type: "type", q: "Escribe en maya", prompt: "llegar", answer: "k'uchul" },
        { type: "choice", q: "¿Cómo se dice «avanzar»?", prompt: "avanzar", promptLang: "es", answer: "máan táanil", options: ["máan táanil", "k'uchul", "xíimbal"] },
        { type: "fill", es: "Pase usted. (lit. pase por aquí)", before: "", after: "waye'.", answer: "Máanen", options: ["Máanen", "Ko'oten", "Kulen"] },
        { type: "build", es: "¿A dónde vas?", m: "Tu'ux ka bin?", distractors: ["kin", "ku"] },
        { type: "choice", q: "¿Qué significa?", prompt: "toj táanil", promptLang: "m", answer: "todo derecho, hacia adelante", options: ["todo derecho, hacia adelante", "muy lejos", "detrás de la plaza"] },
        { type: "type", q: "Repaso: escribe en maya", prompt: "aquí", answer: "waye'", alt: ["te'ela'"] }
      ]
    }
  ]
});
