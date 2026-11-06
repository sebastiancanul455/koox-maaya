/* Unidad 12 · Haz esto (el imperativo). Solo formas con estado «verificado» (conf alta) o «probable» (conf media) en kb/recheck4-u12.json. */
(window.COURSE = window.COURSE || { units: [] }).units.push({
  id: "u12",
  n: 12,
  title: "Haz esto",
  subtitle: "Órdenes sencillas, invitaciones y cómo decir «no lo hagas»",
  sources: [
    { title: "Bolles y Bolles, A Grammar of the Yucatecan Mayan Language (FAMSI), sección «Imperative and exclamatory sentences»", url: "https://www.famsi.org/research/bolles/grammar/section22.htm" },
    { title: "Manuel Andrade, A grammar of modern Yucatec Maya (edición de Lehmann): imperativo y negación", url: "https://www.christianlehmann.eu/ling/sprachen/maya/andrade/andrade_edit.php" },
    { title: "Blair y Vermont-Salas, Spoken Yucatec Maya (transcripción glosada en el sitio de Lehmann): kul-en, ko'ten-e'x", url: "https://www.christianlehmann.eu/ling/sprachen/maya/textos/bvs_1-18.html" },
    { title: "Christian Lehmann, Junp'iit Maaya – A little bit of Maya (ko'oten)", url: "https://www.christianlehmann.eu/ling/sprachen/maya/textos/hunp'iit_maaya.html" },
    { title: "Barbara Pfeiler, estudio de caso sobre la adquisición temprana del verbo en maya yucateco (paradigmas del imperativo: ween-en, wa'al-en, ts'aak-nen)", url: "https://core.ac.uk/download/19210193.pdf" },
    { title: "UNAM, Facultad de Filosofía y Letras – temario de Maya IV (imperativo en oraciones intransitivas -en, -nen, -len; imperativo transitivo)", url: "https://servicios-galileo.filos.unam.mx/uploads/temarios/20252131146100021/Maya4EliCasanova20252.pdf" },
    { title: "parryc – Yucatec Maya (notas sobre el imperativo irregular: xeen, ko'oten)", url: "https://parryc.com/language/yucatec-maya" },
    { title: "Wiktionary – xook (maya yucateco)", url: "https://en.wiktionary.org/wiki/xook" },
    { title: "Wiktionary – meyaj (maya yucateco)", url: "https://en.wiktionary.org/wiki/meyaj" },
    { title: "Wiktionary – xíimbal (maya yucateco)", url: "https://en.wiktionary.org/wiki/xiimbal" },
    { title: "Wiktionary – kutal (maya yucateco)", url: "https://en.wiktionary.org/wiki/kutal" },
    { title: "Wiktionary – jaant (maya yucateco)", url: "https://en.wiktionary.org/wiki/jaant" },
    { title: "Wiktionary – il (maya yucateco)", url: "https://en.wiktionary.org/wiki/il" },
    { title: "Wikcionario – wenel (maya yucateco)", url: "https://es.wiktionary.org/wiki/wenel" },
    { title: "Wikcionario – máan (maya yucateco)", url: "https://es.wiktionary.org/wiki/m%C3%A1an" },
    { title: "UADY – Diccionario maya-español, letra B (báaxal)", url: "https://www.mayas.uady.mx/diccionario/b_maya.html" },
    { title: "UADY – Diccionario español-maya, letra D (dar: ts'aa)", url: "https://www.mayas.uady.mx/diccionario/d_esp.html" },
    { title: "UADY – Diccionario español-maya, letra M (mirar: il)", url: "https://www.mayas.uady.mx/diccionario/m_esp.html" },
    { title: "Nueva Escuela Mexicana Digital (SEP) – «Ko'one'ex baaxal ¡Vamos a jugar!»", url: "https://nuevaescuelamexicana.sep.gob.mx/contenido/coleccion/kooneex-baaxal-vamos-a-jugar/" },
    { title: "INALI – Prontuario de frases de cortesía en maya (Máanen waye')", url: "https://site.inali.gob.mx/Micrositios/Prontuarios/maya.html" },
    { title: "La Lengua Maya de Yucatán – Frases básicas (Ma' tu'ubsik)", url: "https://sites.google.com/site/lalenguamayadeyucatan/frases-basicas" },
    { title: "Heraldo de México – Ko'ox kanik maaya t'aan", url: "https://yucatan.heraldodemexico.com.mx/tendencias/2025/8/27/koox-kanik-maaya-taan-asi-seran-los-cursos-para-preservar-la-lengua-maya-en-yucatan-1949.html" }
  ],
  lessons: [
    {
      id: "u12l1",
      title: "Ve, ven, levántate",
      goal: "Al terminar podrás dar órdenes sencillas como ve, ven a comer, ponte de pie o duerme, y decirlas a varias personas.",
      teach: [
        {
          kind: "text",
          title: "La orden se pega al verbo",
          html: "En español la orden cambia el verbo: «siéntate», «ven». En maya el verbo toma <b>-en</b>: <span class=\"m\">kul-en</span> (siéntate), <span class=\"m\">máan-en</span> (pasa), <span class=\"m\">wa'al-en</span> (ponte de pie), <span class=\"m\">ween-en</span> (duerme). Ya conoces <span class=\"m\">Kulen</span>, <span class=\"m\">Ko'oten</span> y <span class=\"m\">Máanen waye'</span> de la unidad 7.<br>Para hablarle a varias personas, la orden termina en <b>-e'ex</b>, la misma terminación de «ustedes» (<span class=\"m\">ka bine'ex</span>): <span class=\"m\">ko'otene'ex</span>, «vengan»."
        },
        {
          kind: "table",
          title: "Una persona y varias personas",
          head: ["Verbo", "Maya: a una persona", "Maya: a varias", "Español"],
          rows: [
            ["taal (venir)", "ko'oten", "ko'otene'ex", "ven / vengan"],
            ["kutal (sentarse)", "kulen", "kulene'ex", "siéntate / siéntense"],
            ["máan (pasar)", "máanen", "máanene'ex", "pasa / pasen"],
            ["wenel (dormir)", "weenen", "weenene'ex", "duerme / duerman"]
          ]
        },
        {
          kind: "tip",
          title: "Ve y ven tienen orden propia",
          html: "Los dos verbos de movimiento más usados no forman la orden con su propia raíz. Para «ve» se usa <span class=\"m\">xeen</span> (de <span class=\"m\">bin</span>, ir) y para «ven», <span class=\"m\">ko'oten</span> (de <span class=\"m\">taal</span>, venir). Según Andrade, <span class=\"m\">bin</span> y <span class=\"m\">taal</span> no tienen orden propia. Bolles ya trae <i>xen</i> y <i>coten</i>, con la ortografía antigua."
        },
        {
          kind: "tip",
          title: "Dos órdenes seguidas",
          html: "Para «ven a comer» se junta la orden con el verbo en su forma de siempre, que no lleva -en: <span class=\"m\">Ko'oten janal</span>. Bolles trae justo ese ejemplo, <i>Coten hanal</i>. Es una orden doble: ven + come."
        }
      ],
      vocab: [
        { id: "u12-xeen", m: "xeen", es: "¡ve!", pr: "sheen", note: "Orden de bin (ir). No sale de la raíz bin. Bolles lo escribe xen; la vocal doble viene de xe + -en.", conf: "alta" },
        { id: "u12-waalen", m: "wa'alen", es: "¡ponte de pie!, ¡levántate!", pr: "wa-alen", note: "Vocal rearticulada a'a. Pfeiler la da como wa'al-en y Bolles como Ualen.", conf: "alta" },
        { id: "u12-weenen", m: "weenen", es: "¡duerme!", pr: "weenen", note: "Orden de wenel (dormir). En la orden la e se escribe doble: ween-en.", conf: "alta" },
        { id: "u12-kooten-janal", m: "Ko'oten janal.", es: "¡Ven a comer!", pr: "ko-oten janal", note: "Orden doble: ko'oten + janal (sin -en). Bolles: Coten hanal.", conf: "alta" },
        { id: "u12-kootenee-ex", m: "ko'otene'ex", es: "¡vengan!", pr: "ko-otene-esh", note: "Plural de ko'oten. Blair y Vermont-Salas lo escriben ko'tene'x.", conf: "alta" },
        { id: "u12-kulenee-ex", m: "kulene'ex", es: "¡siéntense!", pr: "kulene-esh", note: "Plural de kulen, con -e'ex. Lo trae Wiktionary; no lo vimos en un texto.", conf: "media" },
        { id: "u12-maanenee-ex", m: "máanene'ex", es: "¡pasen!", pr: "máanene-esh", note: "Plural de máanen, con -e'ex. Lo trae Wikcionario; no lo vimos en un texto.", conf: "media" }
      ],
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "Xeen.", promptLang: "m", answer: "Ve.", options: ["Ve.", "Ven.", "Siéntate."] },
        { type: "fill", es: "Ven a comer.", before: "", after: "janal.", answer: "Ko'oten", options: ["Ko'oten", "Xeen", "Kulen"] },
        { type: "type", q: "Escribe en maya", prompt: "ve (orden del verbo ir)", answer: "xeen" },
        { type: "build", es: "Ven a comer.", m: "Ko'oten janal", distractors: ["xeen", "kulen"] },
        { type: "type", q: "Escribe en maya", prompt: "ponte de pie (orden)", answer: "wa'alen" },
        { type: "fill", es: "Vengan.", before: "Ko'ot", after: "e'ex.", answer: "en", options: ["en", "nen", "ej"] },
        { type: "choice", q: "¿Qué significa?", prompt: "Weenen.", promptLang: "m", answer: "Duerme.", options: ["Duerme.", "Come.", "Pasa."] },
        { type: "choice", q: "Hablas con dos niños y quieres que se sienten. ¿Qué dices?", prompt: "Siéntense.", promptLang: "es", answer: "Kulene'ex.", options: ["Kulene'ex.", "Kulen.", "Ko'otene'ex."] }
      ]
    },
    {
      id: "u12l2",
      title: "Vamos a jugar",
      goal: "Al terminar podrás invitar a jugar y a hacer algo juntos, y distinguir una invitación de una orden.",
      teach: [
        {
          kind: "text",
          title: "Invitar: ko'ox + verbo",
          html: "Una orden manda; una invitación propone hacer algo juntos. Para invitar, <span class=\"m\">ko'ox</span> («vamos») va delante del verbo en su forma de siempre: <span class=\"m\">Ko'ox kanik maaya t'aan</span> (el nombre del programa del Gobierno de Yucatán, «vamos a aprender lengua maya») o <span class=\"m\">Ko'ox janal</span> (unidad 6).<br>El verbo no lleva -en ni persona: <span class=\"m\">ko'ox</span> ya trae el «nosotros»."
        },
        {
          kind: "tip",
          title: "Para un grupo: ko'one'ex",
          html: "El portal Nueva Escuela Mexicana Digital, de la SEP, tiene una ficha de clase titulada <span class=\"m\">Ko'one'ex baaxal</span>, «¡Vamos a jugar!». Ahí «vamos» termina en <span class=\"m\">-e'ex</span>, la terminación de «ustedes» que ya conoces. Parece ser el «vamos» que se le dice a un grupo, pero no encontramos una fuente que explique la diferencia exacta con <span class=\"m\">ko'ox</span>. Las dos formas existen."
        },
        {
          kind: "culture",
          title: "Las reglas de un juego son órdenes",
          html: "Según la descripción de esa ficha de la SEP, la clase trata de escribir en equipo las instrucciones de un juego tradicional. Es un buen ejemplo de para qué sirve el imperativo: las reglas de casi cualquier juego son órdenes (<span class=\"m\">Wa'alen</span>, <span class=\"m\">Kulen</span>, <span class=\"m\">Xeen</span>, <span class=\"m\">Ko'oten</span>).<br><span class=\"m\">Báaxal</span> es a la vez «jugar», «juego» y «juguete» en el diccionario de la UADY: la misma palabra sirve para la acción y para la cosa."
        },
        {
          kind: "tip",
          title: "Un juego para practicar",
          html: "Juega al «rey manda» con quien estudies contigo: una persona da una orden de las que ya sabes y las demás la cumplen. Si son varias, usa las formas con <span class=\"m\">-e'ex</span> que viste, como <span class=\"m\">ko'otene'ex</span> y <span class=\"m\">kulene'ex</span>."
        }
      ],
      vocab: [
        { id: "u12-kooneex", m: "ko'one'ex", es: "¡vamos! (a un grupo)", pr: "ko-one-esh", note: "Se vio en el título de una ficha de la SEP: Ko'one'ex baaxal. Termina en -e'ex, la terminación de «ustedes». La diferencia exacta con ko'ox no está explicada en las fuentes que vimos.", conf: "media" },
        { id: "u12-baaxal", m: "báaxal", es: "jugar; juego; juguete", pr: "báashal", alt: ["baaxal"], note: "La UADY la escribe con tono alto (báaxal); la SEP, sin acento (baaxal). La x suena «sh».", ex: { m: "Ko'one'ex báaxal.", es: "Vamos a jugar." }, conf: "alta" },
        { id: "u12-kooneex-baaxal", m: "Ko'one'ex báaxal.", es: "¡Vamos a jugar!", pr: "ko-one-esh báashal", alt: ["Ko'one'ex baaxal."], note: "Título de una ficha de clase de la SEP (Nueva Escuela Mexicana Digital).", conf: "alta" },
        { id: "u12-koox-ximbal", m: "Ko'ox xíimbal.", es: "Vamos a pasear. / Vamos a caminar.", pr: "ko-osh shíimbal", note: "Armada con la regla ko'ox + verbo. xíimbal = caminar, pasear (unidad 9). No la vimos escrita tal cual.", conf: "media" },
        { id: "u12-koox-kaay", m: "Ko'ox k'aay.", es: "Vamos a cantar.", pr: "ko-osh k'aay", note: "Armada con la regla ko'ox + verbo. k'aay = cantar (unidad 5). No la vimos escrita tal cual.", conf: "media" }
      ],
      dialogue: {
        title: "A jugar (diálogo de práctica)",
        lines: [
          { who: "A", name: "Doña Rosa", m: "Ko'one'ex báaxal!", es: "¡Vamos a jugar!" },
          { who: "B", name: "Pedro", m: "Ma' tin na'atik. Tu ka'atéen, chaambéel.", es: "No entiendo. Otra vez, despacio." },
          { who: "A", name: "Doña Rosa", m: "Ko'one'ex… báaxal!", es: "¡Va… mos… a jugar!" },
          { who: "B", name: "Pedro", m: "Ko'ox!", es: "¡Vamos!" },
          { who: "A", name: "Doña Rosa", m: "Wa'alen! Kulen!", es: "¡De pie! ¡Siéntate!" },
          { who: "B", name: "Pedro", m: "Tu ka'atéen!", es: "¡Otra vez!" }
        ]
      },
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "Ko'one'ex báaxal.", promptLang: "m", answer: "Vamos a jugar.", options: ["Vamos a jugar.", "Vamos a comer.", "Vamos a cantar."] },
        { type: "fill", es: "Vamos a jugar.", before: "Ko'one'ex", after: "", answer: "báaxal", options: ["báaxal", "janal", "kulen"] },
        { type: "type", q: "Escribe en maya", prompt: "jugar", answer: "báaxal", alt: ["baaxal"] },
        { type: "build", es: "¡Vamos a jugar!", m: "Ko'one'ex báaxal", distractors: ["ko'ox", "janal"] },
        { type: "fill", es: "Vamos a aprender lengua maya.", before: "Ko'ox", after: "maaya t'aan.", answer: "kanik", options: ["kanik", "báaxal", "wa'alen"] },
        { type: "choice", q: "¿Qué significa?", prompt: "Ko'ox k'aay.", promptLang: "m", answer: "Vamos a cantar.", options: ["Vamos a cantar.", "Vamos a jugar.", "Vamos a pasear."] },
        { type: "type", q: "Escribe en maya", prompt: "Vamos a aprender lengua maya.", answer: "Ko'ox kanik maaya t'aan." }
      ]
    },
    {
      id: "u12l3",
      title: "En la clase y en la cocina",
      goal: "Al terminar podrás reconocer órdenes con verbos de actividad (lee, trabaja, camina), dar órdenes con objeto (cómelo, dame) y suavizarlas con por favor.",
      teach: [
        {
          kind: "text",
          title: "Verbos de actividad: -nen",
          html: "Los verbos que nombran una actividad (estudiar, trabajar, caminar) suelen hacer la orden con <b>-nen</b>: <span class=\"m\">xook</span> → <span class=\"m\">xooknen</span> (lee, estudia), <span class=\"m\">meyaj</span> → <span class=\"m\">meyajnen</span> (trabaja), <span class=\"m\">xíimbal</span> → <span class=\"m\">xíimbalnen</span> (camina, pasea). Esa -n- también aparece en el pasado <span class=\"m\">meyajnajen</span> («trabajé», unidad 9).<br>Pfeiler muestra el mismo contraste: <span class=\"m\">ts'aak-nen</span> para una actividad, pero solo <b>-en</b> para «dormir» (<span class=\"m\">ween-en</span>). Plural: <span class=\"m\">xooknene'ex</span>."
        },
        {
          kind: "text",
          title: "Con objeto: -ej",
          html: "Si el verbo lleva objeto (<span class=\"m\">jaantik</span>, «comerlo»), la orden termina en <b>-ej</b>: <span class=\"m\">jaantej</span>, «¡cómelo!». Es la misma terminación de <span class=\"m\">Bíin in jaantej</span> (unidad 9), y es la forma que Andrade da para «¡cómelo!».<br>Si además dices el objeto o a quién se lo das, la orden suele ir con la raíz sola, sin terminación: Andrade trae <i>ts'a ti'</i>, «dáselo», y Bolles, <i>Taz ten in hanal</i>, «tráeme mi comida»."
        },
        {
          kind: "tip",
          title: "Dar y pedir: ts'aa",
          html: "<span class=\"m\">Ts'aa</span> es «dar» en el diccionario de la UADY y, como orden, «¡da!» o «¡dale!». Con <span class=\"m\">teen</span> («a mí») pides algo: <span class=\"m\">Ts'aa teen waaj</span>, «dame tortilla». Esa frase la armamos con el molde de Bolles (<i>Taz ten in hanal</i>); no la vimos escrita tal cual."
        },
        {
          kind: "tip",
          title: "Para que suene amable",
          html: "Cierra la orden con <span class=\"m\">meent uts</span>, «por favor» (unidad 2), como en la unidad 7: <span class=\"m\">Ts'aa teen waaj, meent uts</span>. Otra manera de ser amable es no mandar y desear: en el prontuario del INALI la despedida usa ka + verbo, <span class=\"m\">Ka suunakech a xíimbal to'on</span> («vuelva pronto», unidad 9)."
        }
      ],
      vocab: [
        { id: "u12-xooknen", m: "xooknen", es: "¡lee!, ¡estudia!", pr: "shooknen", note: "Orden de xook. Así la dan las tablas de Wiktionary; Pfeiler muestra el mismo patrón -nen con otro verbo.", conf: "media" },
        { id: "u12-meyajnen", m: "meyajnen", es: "¡trabaja!", pr: "meyajnen", note: "Orden de meyaj (trabajar). Compárala con meyajnajen, «trabajé».", conf: "media" },
        { id: "u12-ximbalnen", m: "xíimbalnen", es: "¡camina!, ¡pasea!", pr: "shíimbalnen", note: "Orden de xíimbal. Así la dan las tablas de Wiktionary.", conf: "media" },
        { id: "u12-jaantej", m: "jaantej", es: "¡cómelo!", pr: "jaantej", note: "Orden de jaantik (comer algo). La j final se pronuncia suave. Misma terminación que Bíin in jaantej.", conf: "alta" },
        { id: "u12-tsaa", m: "ts'aa", es: "¡da!, ¡dale!", pr: "ts'aa", note: "DAR en el diccionario de la UADY. Como orden va sola, al inicio de la frase (Andrade: ts'a ti').", conf: "alta" },
        { id: "u12-tsaa-teen-waaj", m: "Ts'aa teen waaj.", es: "Dame tortilla. / Dame pan.", pr: "ts'aa teen waaj", note: "Armada con ts'aa + teen (a mí) + waaj (unidad 6), siguiendo el molde de Bolles. No la vimos escrita tal cual.", conf: "media" },
        { id: "u12-ilej", m: "ilej", es: "¡míralo!, ¡velo!", pr: "ilej", note: "Orden de ilik (ver algo). Solo la vimos en las tablas de Wiktionary.", conf: "media" }
      ],
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "Xooknen.", promptLang: "m", answer: "Lee.", options: ["Lee.", "Trabaja.", "Cómelo."] },
        { type: "type", q: "Escribe en maya", prompt: "cómelo (orden del verbo jaantik)", answer: "jaantej" },
        { type: "fill", es: "¡Cómelo!", before: "Jaant", after: "", answer: "ej", options: ["ej", "nen", "en"] },
        { type: "type", q: "Escribe en maya", prompt: "da, dale (orden del verbo dar)", answer: "ts'aa" },
        { type: "fill", es: "Dame tortilla.", before: "", after: "teen waaj.", answer: "Ts'aa", options: ["Ts'aa", "Jaantej", "Xeen"] },
        { type: "choice", q: "¿Cómo dices «¡Trabaja!»?", prompt: "¡Trabaja!", promptLang: "es", answer: "Meyajnen.", options: ["Meyajnen.", "Weenen.", "Jaantej."] },
        { type: "choice", q: "¿Qué significa?", prompt: "Ilej.", promptLang: "m", answer: "Míralo.", options: ["Míralo.", "Cómelo.", "Dámelo."] },
        { type: "type", q: "Escribe en maya", prompt: "ven a comer", answer: "Ko'oten janal." }
      ]
    },
    {
      id: "u12l4",
      title: "No lo hagas",
      goal: "Al terminar podrás decir «no lo comas», «no vayas» y otras prohibiciones sencillas, y entenderlas cuando las oigas.",
      teach: [
        {
          kind: "text",
          title: "Ma' + el verbo de siempre",
          html: "Para prohibir no se usa -en. Se pone <span class=\"m\">ma'</span> y el verbo en su forma de siempre (la que va después de <span class=\"m\">kin</span>, <span class=\"m\">ka</span> o <span class=\"m\">ku</span>), con <span class=\"m\">a</span> («tú») delante: <span class=\"m\">Ma' a jaantik</span>, «no lo comas». Andrade da este ejemplo con el verbo «comer» (<i>ma (a) hantik</i>, «¡no lo comas!»); la <span class=\"m\">a</span> puede faltar.<br>Por eso la orden y la prohibición se ven distintas: <span class=\"m\">Kulen</span> («siéntate») frente a <span class=\"m\">Ma' a kutal</span> («no te sientes»)."
        },
        {
          kind: "table",
          title: "Orden y prohibición",
          head: ["Verbo", "Maya: orden", "Maya: no lo hagas", "Español"],
          rows: [
            ["comer algo", "jaantej", "ma' a jaantik", "cómelo / no lo comas"],
            ["sentarse", "kulen", "ma' a kutal", "siéntate / no te sientes"],
            ["dormir", "weenen", "ma' a wenel", "duerme / no duermas"],
            ["ir", "xeen", "ma' a bin", "ve / no vayas"]
          ]
        },
        {
          kind: "tip",
          title: "Variantes que verás",
          html: "Sin <span class=\"m\">a</span>: <span class=\"m\">Ma' tu'ubsik</span>, «no lo olvides», de las frases básicas de La Lengua Maya de Yucatán.<br>Con <i>ta</i>: Bolles trae una prohibición con <i>ma ta</i> + verbo, parecida a la negación del presente actual (<span class=\"m\">ma' tin meyaj</span>, unidad 9). Si la ves, es otra manera de decir «no lo hagas».<br>Y ojo: <span class=\"m\">ma'</span> + el verbo de siempre también puede ser una simple negación («no lo come»). El contexto lo aclara (Andrade)."
        }
      ],
      vocab: [
        { id: "u12-ma-a-jaantik", m: "Ma' a jaantik.", es: "No lo comas.", pr: "ma- a jaantik", alt: ["Ma' jaantik."], note: "Ejemplo de Andrade (ma (a) hantik, «¡no lo comas!») con la ortografía actual. La a (tú) puede faltar.", conf: "alta" },
        { id: "u12-ma-tuubsik", m: "Ma' tu'ubsik.", es: "No lo olvides.", pr: "ma- tu-ubsik", note: "Frase de La Lengua Maya de Yucatán, sin a. Una sola fuente, no académica.", conf: "media" },
        { id: "u12-ma-a-wenel", m: "Ma' a wenel.", es: "No duermas.", pr: "ma- a wenel", note: "Armada con la regla ma' a + el verbo de siempre (wenel, dormir). No la vimos escrita tal cual.", conf: "media" },
        { id: "u12-ma-a-bin", m: "Ma' a bin.", es: "No vayas.", pr: "ma- a bin", note: "Armada con la regla. Fíjate en que se usa bin, no xeen. No la vimos escrita tal cual.", conf: "media" },
        { id: "u12-ma-a-kutal", m: "Ma' a kutal.", es: "No te sientes.", pr: "ma- a kutal", note: "Armada con la regla; kutal es el verbo de siempre de «sentarse» (kin kutal, ku kutal). No la vimos escrita tal cual.", conf: "media" }
      ],
      dialogue: {
        title: "En la cocina (diálogo de práctica)",
        lines: [
          { who: "A", name: "Doña Rosa", m: "Pedro! Ko'oten janal.", es: "¡Pedro! Ven a comer." },
          { who: "B", name: "Pedro", m: "Ts'aa teen waaj, meent uts.", es: "Dame tortilla, por favor." },
          { who: "A", name: "Doña Rosa", m: "Waaj. Chokoj. Ma' a jaantik!", es: "Tortilla. Está caliente. ¡No la comas!" },
          { who: "B", name: "Pedro", m: "Ma'alob. Chaambéel.", es: "Bien. Con calma." },
          { who: "A", name: "Doña Rosa", m: "Kulen.", es: "Siéntate." },
          { who: "B", name: "Pedro", m: "Dios bo'otik.", es: "Gracias." }
        ]
      },
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "Ma' a jaantik.", promptLang: "m", answer: "No lo comas.", options: ["No lo comas.", "Cómelo.", "Ven a comer."] },
        { type: "fill", es: "No lo comas.", before: "Ma'", after: "jaantik.", answer: "a", options: ["a", "in", "ka"] },
        { type: "build", es: "No lo comas.", m: "Ma' a jaantik", distractors: ["jaantej", "kin"] },
        { type: "type", q: "Escribe en maya", prompt: "No lo comas.", answer: "Ma' a jaantik.", alt: ["Ma' jaantik."] },
        { type: "choice", q: "Quieres decir «No vayas». ¿Qué dices?", prompt: "No vayas.", promptLang: "es", answer: "Ma' a bin.", options: ["Ma' a bin.", "Xeen.", "Kulen."] },
        { type: "choice", q: "¿Qué significa?", prompt: "Ma' tu'ubsik.", promptLang: "m", answer: "No lo olvides.", options: ["No lo olvides.", "No lo comas.", "Ven a comer."] },
        { type: "type", q: "Escribe en maya", prompt: "ve (orden)", answer: "xeen" },
        { type: "fill", es: "¡No lo comas!", before: "", after: "a jaantik!", answer: "Ma'", options: ["Ma'", "Ko'ox", "Xeen"] }
      ]
    }
  ]
});
