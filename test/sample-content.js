/* Contenido de PRUEBA para el motor (nunca se publica). Palabras tomadas de la v1. */
(window.COURSE = window.COURSE || { units: [] }).units.push({
  id: "u1", n: 1, title: "Sonidos del maya", subtitle: "Vocales, consonantes y primeras palabras",
  sources: [
    { title: "Prontuario de maya (INALI)", url: "https://arqueologiamexicana.mx/sites/default/files/banco_imagenes/prontuario_maya.pdf" },
    { title: "Yucatán Today: Say it in Maya", url: "https://yucatantoday.com/en/blog/say-it-in-maya" }
  ],
  lessons: [
    {
      id: "u1l1", title: "Vocales", goal: "Al terminar podrás distinguir vocales cortas, largas y rearticuladas.",
      teach: [
        { kind: "text", title: "Cinco vocales, cuatro formas", html: "El maya usa las mismas cinco vocales del español, pero cada una puede ser <b>corta</b>, <b>larga</b>, <b>larga con tono alto</b> o <b>rearticulada</b>. Por ejemplo: <span class=\"m\">ja'</span> y <span class=\"m\">k'áak'</span>." },
        { kind: "table", title: "Las cuatro formas", head: ["Forma", "Maya", "Significado"], rows: [["corta", "ja'", "agua"], ["larga", "k'iin", "sol, día"], ["tono alto", "k'áak'", "fuego"], ["rearticulada", "ka'an", "cielo"]] },
        { kind: "tip", title: "Escucha el corte", html: "El apóstrofo <span class=\"m\">'</span> marca un corte breve de la voz, como en «oh-oh».<br>No es decorativo: cambia el significado." }
      ],
      vocab: [
        { id: "u1-ja", m: "ja'", es: "agua", pr: "ja", note: "Termina con un corte de voz.", ex: { m: "Ja'", es: "Agua" }, conf: "alta" },
        { id: "u1-kiin", m: "k'iin", es: "sol, día", pr: "kiin", note: "La k' lleva un pequeño golpe.", conf: "alta" },
        { id: "u1-kaan-cielo", m: "ka'an", es: "cielo", conf: "alta" },
        { id: "u1-luum", m: "lu'um", es: "tierra", conf: "alta" },
        { id: "u1-che", m: "che'", es: "árbol", conf: "alta" },
        { id: "u1-kaak", m: "k'áak'", es: "fuego", pr: "káak, con tono alto", conf: "alta", alt: ["k'aak'"] },
        { id: "u1-iik-viento", m: "iik'", es: "viento", conf: "alta" }
      ],
      exercises: [
        { type: "choice", q: "¿Qué significa?", prompt: "ka'an", promptLang: "m", answer: "cielo", options: ["cielo", "tierra", "fuego"] },
        { type: "choice", q: "¿Cómo se dice en maya?", prompt: "árbol", promptLang: "es", answer: "che'", options: ["che'", "ja'", "lu'um", "k'iin"] },
        { type: "type", q: "Escribe en maya", prompt: "agua", answer: "ja'" },
        { type: "fill", es: "agua y fuego", before: "ja' yéetel", after: "", answer: "k'áak'", options: ["k'áak'", "k'aak", "kaak'"] }
      ]
    },
    {
      id: "u1l2", title: "Consonantes", goal: "Al terminar podrás leer la x, la j y las consonantes glotalizadas.",
      teach: [
        { kind: "text", title: "La x suena como sh", html: "<span class=\"m\">xiib</span> se dice «shiib». La <i>j</i> es suave y aspirada." },
        { kind: "warn", title: "Cuidado con los pares", html: "<span class=\"m\">iik</span> es chile y <span class=\"m\">iik'</span> es viento. Un solo sonido cambia la palabra." }
      ],
      vocab: [
        { id: "u1-xiib", m: "xiib", es: "hombre", pr: "shiib", conf: "alta" },
        { id: "u1-chuup", m: "ch'uup", es: "mujer", conf: "alta" },
        { id: "u1-paal", m: "paal", es: "niño, niña", conf: "alta" },
        { id: "u1-kaan-serpiente", m: "kaan", es: "serpiente", conf: "alta" },
        { id: "u1-iik-chile", m: "iik", es: "chile", note: "Sin corte final; con corte es viento.", conf: "alta" },
        { id: "u1-tuunich", m: "tuunich", es: "piedra", conf: "media" }
      ],
      exercises: [
        { type: "build", es: "hombre y mujer", m: "xiib yéetel ch'uup", distractors: ["paal", "kaan"] },
        { type: "choice", q: "¿Cuál es el chile?", prompt: "chile", promptLang: "es", answer: "iik", options: ["iik", "iik'", "kaan"] },
        { type: "type", q: "Escribe en maya", prompt: "hombre", answer: "xiib" },
        { type: "fill", es: "hombre y mujer", before: "xiib yéetel", after: "", answer: "ch'uup", options: ["ch'uup", "chuup", "ch'up", "xiib"] }
      ]
    }
  ]
});

window.COURSE.guide = {
  alphabet: [
    { l: "x", desc: "suena como sh", ex: { m: "xiib", es: "hombre" } },
    { l: "j", desc: "j suave y aspirada", ex: { m: "ja'", es: "agua" } },
    { l: "k", desc: "siempre k; no se usan c ni q", ex: { m: "kaan", es: "serpiente" } },
    { l: "ts", desc: "como la tz de quetzal" },
    { l: "'", desc: "corte breve de la voz (saltillo)", ex: { m: "che'", es: "árbol" } },
    { l: "k'", desc: "k glotalizada, con un pequeño golpe", ex: { m: "k'iin", es: "sol, día" } },
    { l: "aa", desc: "vocal larga", ex: { m: "paal", es: "niño, niña" } },
    { l: "áa", desc: "vocal larga con tono alto", ex: { m: "k'áak'", es: "fuego" } },
    { l: "a'a", desc: "vocal rearticulada: se corta y se repite", ex: { m: "ka'an", es: "cielo" } }
  ]
};

(window.COURSE = window.COURSE || { units: [] }).units.push({
  id: "u2", n: 2, title: "Saludos", subtitle: "Cortesía y presentaciones",
  sources: [
    { title: "Yucatán Today: Say it in Maya", url: "https://yucatantoday.com/en/blog/say-it-in-maya" },
    { title: "Frommer's: frases en maya", url: "https://www.frommers.com/destinations/yucatan-peninsula/in-depth/language/" }
  ],
  lessons: [
    {
      id: "u2l1", title: "¿Cómo estás?", goal: "Al terminar podrás saludar y responder a un saludo.",
      teach: [
        { kind: "culture", title: "Preguntar por el camino", html: "En maya no hay una palabra exacta para «hola». Se pregunta por el camino del otro: <span class=\"m\">Bix a beel?</span>" },
        { kind: "text", html: "<span class=\"m\">beel</span> viene de <span class=\"m\">bej</span>, camino." }
      ],
      vocab: [
        { id: "u2-bix-a-beel", m: "Bix a beel?", es: "¿Cómo estás?", note: "Literalmente: ¿cómo va tu camino?", conf: "alta" },
        { id: "u2-maalob-kux-teech", m: "Ma'alob, kux teech?", es: "Bien, ¿y tú?", conf: "alta" },
        { id: "u2-baax-ka-waalik", m: "Ba'ax ka wa'alik?", es: "¿Qué tal?", note: "Informal.", conf: "alta" },
        { id: "u2-mix-baal", m: "Mix ba'al", es: "Nada / De nada", conf: "alta" },
        { id: "u2-jach-maalob", m: "Jach ma'alob", es: "Muy bien", conf: "media" }
      ],
      dialogue: {
        title: "En el camino",
        lines: [
          { who: "A", name: "Ana", m: "Bix a beel?", es: "¿Cómo estás?" },
          { who: "B", name: "Juan", m: "Ma'alob, kux teech?", es: "Bien, ¿y tú?" },
          { who: "A", name: "Ana", m: "Jach ma'alob", es: "Muy bien" }
        ]
      },
      exercises: [
        { type: "build", es: "Bien, ¿y tú?", m: "Ma'alob, kux teech?", distractors: ["beel", "ba'al"] },
        { type: "fill", es: "¿Cómo estás?", before: "Bix a", after: "?", answer: "beel", options: ["beel", "k'aaba'", "otoch"] },
        { type: "choice", q: "¿Qué significa?", prompt: "Mix ba'al", promptLang: "m", answer: "Nada / De nada", options: ["Nada / De nada", "Muy bien", "¿Qué tal?"] }
      ]
    },
    {
      id: "u2l2", title: "Cortesía y despedidas", goal: "Al terminar podrás agradecer y despedirte.",
      teach: [
        { kind: "text", title: "Agradecer", html: "<span class=\"m\">Dios bo'otik</span> significa literalmente «que Dios te lo pague»." }
      ],
      vocab: [
        { id: "u2-dios-bootik", m: "Dios bo'otik", es: "Gracias", conf: "alta" },
        { id: "u2-xiik-teech-utsil", m: "Xi'ik teech utsil", es: "Que te vaya bien", conf: "alta" },
        { id: "u2-taak-saamal", m: "Taak sáamal", es: "Hasta mañana", conf: "alta" },
        { id: "u2-koox", m: "Ko'ox!", es: "¡Vamos!", conf: "alta" },
        { id: "u2-ma", m: "Ma'", es: "No", conf: "alta" },
        { id: "u2-bix-a-kaaba", m: "Bix a k'aaba'?", es: "¿Cómo te llamas?", conf: "alta" }
      ],
      exercises: [
        { type: "choice", q: "¿Cómo se dice en maya?", prompt: "Hasta mañana", promptLang: "es", answer: "Taak sáamal", options: ["Taak sáamal", "Dios bo'otik", "Ko'ox!"] },
        { type: "build", es: "Que te vaya bien", m: "Xi'ik teech utsil", distractors: ["ma'", "beel"] },
        { type: "type", q: "Escribe en maya", prompt: "Hasta mañana", answer: "Taak sáamal" }
      ]
    }
  ]
});
