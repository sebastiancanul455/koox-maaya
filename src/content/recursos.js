/* Ko'ox Maaya · Para escuchar más: enlaces externos para oír maya (videos, pódcast, radio, sitios).
   Contrato (lo revisa node test/validate.cjs):
     { id, title, url (https), kind: "youtube" | "spotify" | "podcast" | "radio" | "web" | "app",
       source: "canal o autor", lang: "yua" | "es" | "yua-es" | "en", units: ["u1"], lessons?: ["u1l1"],
       credibility: "institucional" | "hablante nativo" | "docente" | "otro", note?: "…" }
   La lección muestra los de esa lección (o los de su unidad); Perfil → Escucha maya los muestra todos.
   Sin backticks ni la etiqueta de cierre de script en este archivo.
   Verificación (5 nov 2026): title y source son los que devuelve el oEmbed de YouTube, SoundCloud y
   Spotify (o la página de Apple Podcasts); todas las URL respondieron 200. Son enlaces a contenido con
   derechos reservados: solo se enlazan, no se copian. */
(window.COURSE_RESOURCES = window.COURSE_RESOURCES || []).push(
  /* ---------- Unidad 1 · Sonidos del maya ---------- */
  {
    id: "mer-intro-vocales",
    title: "Introducción a la lengua maya: vocales",
    url: "https://www.youtube.com/watch?v=kO9tjymJjCw",
    kind: "youtube",
    source: "Ayuntamiento de Mérida Yucatán",
    lang: "yua-es",
    units: ["u1"],
    lessons: ["u1l1"],
    credibility: "institucional",
    note: "Cápsula del Ayuntamiento de Mérida dedicada a las vocales del maya."
  },
  {
    id: "lcmy-pares-minimos",
    title: "Pon a prueba tu oído en maya: distingue palabras parecidas",
    url: "https://www.youtube.com/watch?v=jpXza_m-XI0",
    kind: "youtube",
    source: "LENGUA Y CULTURA MAYA YUCATECA",
    lang: "yua-es",
    units: ["u1"],
    lessons: ["u1l1"],
    credibility: "docente",
    note: "Ejercicio de escucha con palabras que solo cambian en el tono o la duración de la vocal."
  },
  {
    id: "atm-vocales-altas-glotalizadas",
    title: "Vocales altas, glotalizadas y rearticuladas",
    url: "https://www.youtube.com/watch?v=0-sBBBV1rBI",
    kind: "youtube",
    source: "Aprender To Talk Maya",
    lang: "yua-es",
    units: ["u1"],
    lessons: ["u1l1"],
    credibility: "otro",
    note: "Tono alto, vocal glotalizada (a') y rearticulada (a'a), con palabras pronunciadas."
  },
  {
    id: "inpi-kakaltaan-trabalenguas",
    title: "K'ak'alt'aan - Trabalenguas",
    url: "https://soundcloud.com/inpimx/01-kakaltaan-trabalenguas",
    kind: "podcast",
    source: "INPImx",
    lang: "yua",
    units: ["u1"],
    lessons: ["u1l2"],
    credibility: "institucional",
    note: "Trabalenguas en maya del INPI, con voces del colectivo ADN Maya y textos de Fidencio Briceño Chel."
  },
  {
    id: "santos-tuz-alfabeto",
    title: "Alfabeto en maya (ko'one'ex kanik maaya)",
    url: "https://www.youtube.com/watch?v=wIJf-w9RYI4",
    kind: "youtube",
    source: "Santos Tuz",
    lang: "yua-es",
    units: ["u1"],
    lessons: ["u1l2"],
    credibility: "hablante nativo",
    note: "El alfabeto con ejemplos, incluidas las consonantes glotalizadas ch', k', p', t' y ts'."
  },
  {
    id: "adn-maya-trabalenguas-consejas",
    title: "Trabalenguas y consejas en maya yucateco, Vol. 3",
    url: "https://open.spotify.com/album/5qSpGHDuthBCNGfB9xHAKE",
    kind: "spotify",
    source: "Adn Maya Colectivo",
    lang: "yua",
    units: ["u1"],
    credibility: "hablante nativo",
    note: "Álbum de 2022 con trabalenguas y consejas dichos en maya por el colectivo ADN Maya."
  },
  {
    id: "wikitongues-manuel-poot",
    title: "Wikitongues: Manuel speaking Yucatecan",
    url: "https://www.youtube.com/watch?v=gymwIdhFlWM",
    kind: "youtube",
    source: "Wikitongues",
    lang: "yua",
    units: ["u1", "u9"],
    credibility: "hablante nativo",
    note: "Manuel Poot habla en maya yucateco durante unos dos minutos y medio: escucha de habla natural."
  },

  /* ---------- Unidad 2 · Saludos ---------- */
  {
    id: "mer-intro-saludos",
    title: "Introducción a la lengua maya: saludos",
    url: "https://www.youtube.com/watch?v=ArfQLN9Chd0",
    kind: "youtube",
    source: "Ayuntamiento de Mérida Yucatán",
    lang: "yua-es",
    units: ["u2"],
    lessons: ["u2l1"],
    credibility: "institucional",
    note: "Cápsula del Ayuntamiento de Mérida con los saludos básicos."
  },
  {
    id: "lcmy-saludo-diario",
    title: "Un saludo en lengua maya yucateca para todos los días",
    url: "https://www.youtube.com/watch?v=MXk4kCMX-Wc",
    kind: "youtube",
    source: "LENGUA Y CULTURA MAYA YUCATECA",
    lang: "yua-es",
    units: ["u2"],
    lessons: ["u2l1"],
    credibility: "docente",
    note: "Video corto con un saludo cotidiano y su pronunciación."
  },
  {
    id: "lcmy-presentarse",
    title: "Cómo presentarse en lengua maya yucateca",
    url: "https://www.youtube.com/watch?v=J2egflaIFzk",
    kind: "youtube",
    source: "LENGUA Y CULTURA MAYA YUCATECA",
    lang: "yua-es",
    units: ["u2"],
    lessons: ["u2l2"],
    credibility: "docente",
    note: "Frases para decir tu nombre y presentarte."
  },
  {
    id: "principe-maya-saludos-despedidas",
    title: "Saludos y despedidas en maya yucateco",
    url: "https://www.youtube.com/watch?v=Y1aSabVQwRA",
    kind: "youtube",
    source: "Principe Maya",
    lang: "yua-es",
    units: ["u2"],
    lessons: ["u2l4"],
    credibility: "otro",
    note: "Saludos y fórmulas de despedida pronunciadas."
  },
  {
    id: "sedeculta-koox-tanik-maaya",
    title: "Ko'ox t'anik maaya t'aan / Vamos a hablar lengua maya [Aprendamos Maya]",
    url: "https://www.youtube.com/watch?v=PKxSWNJhuec",
    kind: "youtube",
    source: "Sedeculta",
    lang: "yua-es",
    units: ["u2", "u5"],
    lessons: ["u5l3"],
    credibility: "institucional",
    note: "Cápsula de la Secretaría de la Cultura y las Artes de Yucatán con frases para empezar a hablar maya."
  },

  /* ---------- Unidad 3 · Personas y familia ---------- */
  {
    id: "santos-tuz-pronombres",
    title: "¡Pronombres personales en maya!",
    url: "https://www.youtube.com/watch?v=wXW-m3x6wHQ",
    kind: "youtube",
    source: "Santos Tuz",
    lang: "yua-es",
    units: ["u3"],
    lessons: ["u3l1"],
    credibility: "hablante nativo",
    note: "Los pronombres personales del maya, pronunciados."
  },
  {
    id: "lcmy-posesivo-demostrativo",
    title: "Frases en lengua maya yucateca con el posesivo y el demostrativo",
    url: "https://www.youtube.com/watch?v=qC4slX0zprw",
    kind: "youtube",
    source: "LENGUA Y CULTURA MAYA YUCATECA",
    lang: "yua-es",
    units: ["u3"],
    lessons: ["u3l2"],
    credibility: "docente",
    note: "Frases con posesivos («mi», «tu», «su») y demostrativos, pronunciadas."
  },
  {
    id: "santos-tuz-familia",
    title: "Miembros de la familia en el idioma maya",
    url: "https://www.youtube.com/watch?v=MNeCrCjLjZ8",
    kind: "youtube",
    source: "Santos Tuz",
    lang: "yua-es",
    units: ["u3"],
    lessons: ["u3l3", "u3l4"],
    credibility: "hablante nativo",
    note: "Cómo se nombra en maya a los miembros de la familia."
  },

  /* ---------- Unidad 4 · Números ---------- */
  {
    id: "santos-tuz-clasificadores",
    title: "Clasificadores numerales (p'éel, túul, kúul): aprende a contar en lengua maya",
    url: "https://www.youtube.com/watch?v=dVt87joEjLs",
    kind: "youtube",
    source: "Santos Tuz",
    lang: "yua-es",
    units: ["u4"],
    lessons: ["u4l1", "u4l2"],
    credibility: "hablante nativo",
    note: "Contar cosas con -p'éel, personas y animales con -túul y plantas con -kúul."
  },

  /* ---------- Unidad 5 · Día a día ---------- */
  {
    id: "jorge-et-al-habitual",
    title: "Jorge et al. S3 E07: Verbs in Yucatec Maya, part 3 (habitual aspect)",
    url: "https://www.youtube.com/watch?v=j2gqXeHO_0E",
    kind: "youtube",
    source: "Jorge et al.",
    lang: "en",
    units: ["u5"],
    lessons: ["u5l1"],
    credibility: "otro",
    note: "Explicación en inglés del presente habitual, con ejemplos en maya."
  },
  {
    id: "luces-del-siglo-tuux",
    title: "¿Tu'ux o tuch? Aprende maya yucateco fácil",
    url: "https://www.youtube.com/shorts/etAI7INUGNc",
    kind: "youtube",
    source: "Luces del Siglo",
    lang: "yua-es",
    units: ["u5"],
    lessons: ["u5l2"],
    credibility: "otro",
    note: "Video corto: tu'ux («¿dónde?») no suena igual que tuch («ombligo»)."
  },

  /* ---------- Unidad 6 · Comida y mercado ---------- */
  {
    id: "tele-yucatan-comidas",
    title: "Así se dicen en maya algunas comidas tradicionales de Yucatán",
    url: "https://www.youtube.com/watch?v=CoCIu-ejpFU",
    kind: "youtube",
    source: "TELE Yucatán",
    lang: "yua-es",
    units: ["u6"],
    lessons: ["u6l1"],
    credibility: "institucional",
    note: "Nombres en maya de platillos yucatecos, en la televisora pública de Yucatán."
  },
  {
    id: "joako-receta-tsa-xaak",
    title: "Jaanal (comida). Tsa' xa'ak: receta narrada en lengua maya yucateco",
    url: "https://www.youtube.com/watch?v=BPb3v0Xxxuw",
    kind: "youtube",
    source: "Joako",
    lang: "yua",
    units: ["u6"],
    lessons: ["u6l1"],
    credibility: "otro",
    note: "Una receta contada en maya de principio a fin: escucha de habla natural sobre la cocina."
  },
  {
    id: "tele-yucatan-tengo-hambre",
    title: "Así se dice «tengo hambre» en lengua maya | Clases con Santos Tuz",
    url: "https://www.youtube.com/watch?v=SWzVTEYcfFc",
    kind: "youtube",
    source: "TELE Yucatán",
    lang: "yua-es",
    units: ["u6"],
    lessons: ["u6l2"],
    credibility: "institucional",
    note: "Santos Tuz enseña a decir que tienes hambre."
  },

  /* ---------- Unidad 7 · Cuerpo y salud ---------- */
  {
    id: "sedeculta-partes-del-cuerpo",
    title: "Aprende las partes del cuerpo en maya [Museo en Casa][Aprendamos Maya]",
    url: "https://www.youtube.com/watch?v=_HBXoNCfAPo",
    kind: "youtube",
    source: "Sedeculta",
    lang: "yua-es",
    units: ["u7"],
    lessons: ["u7l1", "u7l4"],
    credibility: "institucional",
    note: "Las partes del cuerpo en maya, con una canción y lengua de señas mexicana."
  },
  {
    id: "vientostv-covid-sintomas",
    title: "¿Qué hacer si tengo síntomas de Covid-19? (maya yucateco)",
    url: "https://www.youtube.com/watch?v=VY1Bb-RW9RU",
    kind: "youtube",
    source: "VientosTV",
    lang: "yua",
    units: ["u7"],
    lessons: ["u7l2", "u7l6"],
    credibility: "otro",
    note: "Mensaje de salud dicho en maya: escucha de habla real sobre enfermedad y síntomas."
  },
  {
    id: "tele-yucatan-dolor-de-cabeza",
    title: "¿Cómo se dice en maya «dolor de cabeza»? Santos Tuz nos enseña",
    url: "https://www.youtube.com/watch?v=s3U9kV9bKfE",
    kind: "youtube",
    source: "TELE Yucatán",
    lang: "yua-es",
    units: ["u7"],
    lessons: ["u7l5", "u7l6"],
    credibility: "institucional",
    note: "Cómo decir que te duele la cabeza."
  },

  /* ---------- Unidad 8 · Naturaleza y colores ---------- */
  {
    id: "tele-yucatan-perro-gato-jaguar",
    title: "¿Cómo se dice perro, gato y jaguar en maya?",
    url: "https://www.youtube.com/watch?v=UnO5FEK2p8Q",
    kind: "youtube",
    source: "TELE Yucatán",
    lang: "yua-es",
    units: ["u8"],
    lessons: ["u8l1"],
    credibility: "institucional",
    note: "Tres animales de la casa y del monte, pronunciados."
  },
  {
    id: "santos-tuz-animales",
    title: "Animales e insectos en maya",
    url: "https://www.youtube.com/watch?v=YPjU2gRnqD8",
    kind: "youtube",
    source: "Santos Tuz",
    lang: "yua-es",
    units: ["u8"],
    lessons: ["u8l1"],
    credibility: "hablante nativo",
    note: "Nombres de animales e insectos con fotos y pronunciación."
  },
  {
    id: "mer-intro-colores",
    title: "Introducción a la lengua maya: colores",
    url: "https://www.youtube.com/watch?v=voVlhG2j_HM",
    kind: "youtube",
    source: "Ayuntamiento de Mérida Yucatán",
    lang: "yua-es",
    units: ["u8"],
    lessons: ["u8l2"],
    credibility: "institucional",
    note: "Cápsula del Ayuntamiento de Mérida con los colores."
  },
  {
    id: "tele-yucatan-colores",
    title: "Aprende a decir los colores en maya",
    url: "https://www.youtube.com/watch?v=5FF2lcDSbkY",
    kind: "youtube",
    source: "TELE Yucatán",
    lang: "yua-es",
    units: ["u8"],
    lessons: ["u8l2"],
    credibility: "institucional",
    note: "Los colores básicos en maya, pronunciados."
  },
  {
    id: "tele-yucatan-venado-libelula-pavo",
    title: "¿Cómo se dice venado, libélula y pavo en maya?",
    url: "https://www.youtube.com/watch?v=DBkkOzzSjyQ",
    kind: "youtube",
    source: "TELE Yucatán",
    lang: "yua-es",
    units: ["u8"],
    lessons: ["u8l5"],
    credibility: "institucional",
    note: "Animales del monte y del campo, pronunciados."
  },
  {
    id: "tele-yucatan-pajaros",
    title: "Nombres de pájaros en maya | Clases con Santos Tuz",
    url: "https://www.youtube.com/watch?v=KLzViWufVjA",
    kind: "youtube",
    source: "TELE Yucatán",
    lang: "yua-es",
    units: ["u8"],
    lessons: ["u8l5"],
    credibility: "institucional",
    note: "Santos Tuz dice en maya los nombres de varias aves."
  },

  /* ---------- Unidad 9 · Tiempo y cultura ---------- */
  {
    id: "felipe-tzul-hanal-pixan",
    title: "Belize Hanal Pixan explanation by Maya elder Mr. Felipe Tzul",
    url: "https://www.youtube.com/watch?v=bn_pOs1vB_c",
    kind: "youtube",
    source: "Belize Yucatec Maya",
    lang: "yua",
    units: ["u9"],
    lessons: ["u9l3"],
    credibility: "hablante nativo",
    note: "Un anciano maya de Belice explica en maya el Hanal Pixan (día de muertos)."
  },
  {
    id: "santos-tuz-bombas",
    title: "Bombas yucatecas en maya",
    url: "https://www.youtube.com/watch?v=oSzNqCpKp8M",
    kind: "youtube",
    source: "Santos Tuz",
    lang: "yua-es",
    units: ["u9"],
    lessons: ["u9l3"],
    credibility: "hablante nativo",
    note: "Bombas (los versos de la jarana) dichas en maya."
  },
  {
    id: "inpi-keex",
    title: "K'eex o (cambio) - maya",
    url: "https://soundcloud.com/inpimx/keex-o-cambio-maya",
    kind: "podcast",
    source: "INPImx",
    lang: "yua",
    units: ["u9"],
    lessons: ["u9l3"],
    credibility: "institucional",
    note: "Serie radiofónica del INPI, en maya, sobre rituales como el k'eex, con testimonios de la comunidad."
  },
  {
    id: "radio-uady-kin-maya",
    title: "Julbe'en t'aan: Campaña Kin Maya, con el Colectivo U Péekbal Waye'",
    url: "https://podcasts.apple.com/ng/podcast/julbeen-taan-t5-pg-02-campa%C3%B1a-kin-maya-con-el/id1585555010?i=1000724082715",
    kind: "podcast",
    source: "Radio UADY",
    lang: "yua-es",
    units: ["u9"],
    credibility: "institucional",
    note: "Programa de Radio Universidad (UADY) sobre la campaña Kin Maya («Hablo maya»)."
  },
  {
    id: "pat-boy-ciudad-maya",
    title: "Ciudad Maya",
    url: "https://open.spotify.com/track/6H6UC7mvhJjsJhZAbMStW3",
    kind: "spotify",
    source: "Pat Boy",
    lang: "yua-es",
    units: ["u9"],
    credibility: "hablante nativo",
    note: "Rap de Pat Boy, del disco Rap Ich Máaya (2019)."
  },
  {
    id: "adn-maya-rap-en-maya",
    title: "Rap en Maya",
    url: "https://open.spotify.com/track/6ylCq8SlyD51FsOIK0H2cS",
    kind: "spotify",
    source: "Adn Maya Colectivo, Ich Keej, DJ Rakalku",
    lang: "yua",
    units: ["u9"],
    credibility: "hablante nativo",
    note: "Rap en maya del colectivo ADN Maya (2019)."
  }
);
