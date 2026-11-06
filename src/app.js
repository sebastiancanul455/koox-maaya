/* Ko'ox Maaya v2 — motor de la app (sin contenido lingüístico).
   El contenido llega en window.COURSE desde los archivos src/content/uN.js. */
(function () {
  "use strict";

  /* ================= Utilidades ================= */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ESC[c]; }); }
  function str(x) { return typeof x === "string" ? x.trim() : (typeof x === "number" ? String(x) : ""); }
  function arr(x) { return Array.isArray(x) ? x : []; }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function nonNeg(x) { x = Number(x); return isFinite(x) && x > 0 ? Math.floor(x) : 0; }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function plural(n, one, many) { return n === 1 ? one : many; }
  function m(text, cls) { return '<span class="m' + (cls ? " " + cls : "") + '" lang="yua">' + esc(text) + "</span>"; }

  /* ================= Normalización ================= */
  // Todas las variantes tipográficas del apóstrofo se convierten en el recto '.
  var APOS = /[’‘ʼ´`′ʻ‛ʹ＇՚ˈ]/g;
  function normApos(s) { return String(s == null ? "" : s).replace(APOS, "'"); }
  // Para calificar: ignora mayúsculas, espacios y signos; conserva saltillo, vocales y acentos.
  function normalize(s) {
    return normApos(s).normalize("NFC").toLowerCase()
      .replace(/[‐-―]/g, "-")
      .replace(/[¿?¡!.,;:"“”«»()…]/g, " ")
      .replace(/\s+/g, " ").trim();
  }
  // Quita solo los acentos de tono (agudo y grave).
  function stripTone(s) { return String(s).normalize("NFD").replace(/[̀́]/g, "").normalize("NFC"); }
  // Para buscar: sin apóstrofos, acentos, mayúsculas ni signos.
  function searchKey(s) {
    return normApos(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
      .replace(/'/g, "").replace(/[¿?¡!.,;:"“”«»()…\-‐-―\/]/g, " ").replace(/\s+/g, " ").trim();
  }
  function grade(input, answers) {
    var got = normalize(input);
    if (!got) return { ok: false, empty: true };
    var list = arr(answers).filter(Boolean).map(function (a) { return { raw: a, n: normalize(a) }; });
    for (var i = 0; i < list.length; i++) if (list[i].n === got) return { ok: true, accent: false, matched: list[i].raw };
    var g2 = stripTone(got);
    for (var k = 0; k < list.length; k++) if (stripTone(list[k].n) === g2) return { ok: true, accent: true, matched: list[k].raw };
    return { ok: false };
  }
  function words(s) { return String(s).split(/\s+/).filter(Boolean); }
  // Texto de una ficha: sin signos de puntuación al inicio o al final (el apóstrofo se conserva).
  function tileText(w) { return normApos(w).replace(/^[¿¡"«“(]+/, "").replace(/[?!.,;:"»”)…]+$/, ""); }

  /* ================= Saneado de html de tarjetas ================= */
  // Lista blanca: <b>, <i>, <br>, <span class="m">. Todo lo demás se reduce a texto.
  function sanitize(html) {
    var doc;
    try { doc = new DOMParser().parseFromString("<div>" + String(html || "") + "</div>", "text/html"); }
    catch (e) { return esc(html); }
    var root = doc.body.firstChild;
    var out = document.createElement("div");
    function walk(src, dst) {
      Array.prototype.forEach.call(src.childNodes, function (n) {
        if (n.nodeType === 3) { dst.appendChild(document.createTextNode(n.nodeValue)); return; }
        if (n.nodeType !== 1) return;
        var tag = n.nodeName.toLowerCase();
        if (tag === "script" || tag === "style" || tag === "template" || tag === "iframe" || tag === "object") return;
        if (tag === "br") { dst.appendChild(document.createElement("br")); return; }
        if (tag === "b" || tag === "i" || tag === "strong" || tag === "em") {
          var el = document.createElement(tag === "strong" ? "b" : tag === "em" ? "i" : tag);
          walk(n, el); dst.appendChild(el); return;
        }
        if (tag === "span" && /(^|\s)m(\s|$)/.test(n.getAttribute("class") || "")) {
          var sp = document.createElement("span");
          sp.className = "m"; sp.setAttribute("lang", "yua");
          walk(n, sp); dst.appendChild(sp); return;
        }
        walk(n, dst);
      });
    }
    if (root) walk(root, out);
    return out.innerHTML;
  }

  /* ================= Palabras mayas dentro de texto en español ================= */
  // Marca con <span class="m" lang="yua"> las formas mayas que aparecen en notas, títulos y
  // celdas de tabla, para que se vean y se lean como maya. Una palabra cuenta como maya si es
  // una forma del curso, si lleva apóstrofo o si tiene vocal doble. Las formas que también son
  // palabras del español («a», «u», «le»…) solo se marcan entre dos palabras mayas.
  var ES_WORDS = ("a u al algo ante así aun bien como con cual cuando de del día dos el ella ellas ellos en entre era es esa ese eso esta este esto fue ha hay la las le les lo los más me mi mis muy ni no nos o otra otro para pero poco por que qué se ser si sí sin sol son su sus también te tiene ti toda todo tres tu tú un una uno unos va vez y ya yo leer lee cree creer").split(" ");
  var ES_SET = {};
  ES_WORDS.forEach(function (w) { ES_SET[w] = 1; });
  // 2 = maya; 1 = forma maya que también es palabra del español (solo entre dos mayas);
  // 4 = forma débil (una sola letra, «Dios»): se marca si va junto a una palabra maya; 0 = no.
  function isMayaWord(w) {
    var core = w.replace(/^-+|-+$/g, ""), k = core.toLowerCase();
    if (!core || /[0-9]/.test(core) || COURSE.names[k] && k !== "dios") return 0;
    var letters = /^[a-záéíóúñ'\-]+$/i.test(core);
    if (letters && /[a-záéíóú]'|'$/i.test(core)) return 2;
    if (k === "dios") return 4;
    if (ES_SET[k]) return COURSE.mayaForms[k] ? 1 : 0;
    if (core.length === 1) return COURSE.mayaForms[k] ? (/-/.test(w) ? 2 : 4) : 0;
    if (COURSE.mayaForms[k]) return 2;
    if (letters && /(aa|áa|ee|ée|ii|íi|oo|óo|uu|úu)/i.test(core)) return 2;
    return 0;
  }
  function markMaya(text) {
    var parts = normApos(text).split(/([\s«»“”"(),.;:¿?¡!…=+\/]+)/);
    var kind = parts.map(function (p, i) { return i % 2 ? -1 : isMayaWord(p); });
    function sp(i) { return i > 0 && i < parts.length && /^ $/.test(parts[i]); }
    function isM(i) { return i >= 0 && i < parts.length && kind[i] === 2; }
    var fin = kind.map(function (k, i) {
      if (i % 2) return 0;
      if (k === 2) return 1;
      var left = sp(i - 1) && isM(i - 2), right = sp(i + 1) && isM(i + 2);
      if (k === 1) return left && right ? 1 : 0;
      if (k === 4) return left || right ? 1 : 0;
      return 0;
    });
    var out = "", run = "";
    for (var i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        if (fin[i]) { run += parts[i]; continue; }
        if (run) { out += m(run); run = ""; }
        out += esc(parts[i]);
      } else {
        if (run && sp(i) && fin[i + 1]) { run += parts[i]; continue; }
        if (run) { out += m(run); run = ""; }
        out += esc(parts[i]);
      }
    }
    if (run) out += m(run);
    return out;
  }

  /* ================= Fechas (zona local) ================= */
  function dayKey(d) { d = d || new Date(); return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); }
  function today() { return dayKey(new Date()); }
  function parseDay(k) { var p = k.split("-").map(Number); return new Date(p[0], p[1] - 1, p[2], 12); }
  function addDays(k, n) { var d = parseDay(k); d.setDate(d.getDate() + n); return dayKey(d); }
  function isDay(k) { return typeof k === "string" && /^\d{4}-\d{2}-\d{2}$/.test(k); }
  function daysFrom(a, b) { return Math.round((parseDay(b) - parseDay(a)) / 86400000); }
  // Semana ISO ("2026-W45") de un día "AAAA-MM-DD": la semana (lunes a domingo) la fija su jueves.
  function isoWeek(k) {
    var thu = addDays(k, 3 - (parseDay(k).getDay() + 6) % 7), y = thu.slice(0, 4);
    return y + "-W" + pad2(Math.ceil((daysFrom(y + "-01-01", thu) + 1) / 7));
  }

  /* ================= Curso ================= */
  var RAW = window.COURSE;
  var COURSE = buildCourse(RAW);

  function slug(s) { return searchKey(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "x"; }
  function validCard(c) {
    if (!c || typeof c !== "object") return false;
    if (c.kind === "table") return Array.isArray(c.head) && Array.isArray(c.rows);
    return ["text", "tip", "culture", "warn"].indexOf(c.kind) >= 0 && typeof c.html === "string";
  }
  function uniqStrings(list) {
    var seen = {}, out = [];
    arr(list).forEach(function (o) { var s = str(o); if (s && !seen[s]) { seen[s] = 1; out.push(s); } });
    return out;
  }
  function normOptions(answer, options) {
    var opts = uniqStrings(options);
    if (opts.indexOf(answer) < 0) opts.unshift(answer);
    return opts.slice(0, 4);
  }
  function normEx(e) {
    if (!e || typeof e !== "object") return null;
    var t = e.type, answer;
    if (t === "choice") {
      answer = str(e.answer); var prompt = str(e.prompt);
      if (!answer || !prompt) return null;
      var o = normOptions(answer, e.options);
      if (o.length < 2) return null;
      return { type: "choice", q: str(e.q) || "Elige la respuesta correcta", prompt: prompt, promptLang: e.promptLang === "es" ? "es" : "m", answer: answer, options: o };
    }
    if (t === "fill") {
      answer = str(e.answer);
      if (!answer) return null;
      var fo = normOptions(answer, e.options);
      if (fo.length < 2) return null;
      return { type: "fill", es: str(e.es), before: str(e.before), after: str(e.after), answer: answer, options: fo };
    }
    if (t === "build") {
      var mm = str(e.m);
      var ws = words(mm).map(tileText).filter(Boolean);
      if (!ws.length) return null;
      var inM = {}; ws.forEach(function (w) { inM[normalize(w)] = 1; });
      var ds = uniqStrings(e.distractors).map(tileText).filter(function (d) { return d && !inM[normalize(d)]; });
      return { type: "build", es: str(e.es), m: mm, words: ws, distractors: ds };
    }
    if (t === "type") {
      answer = str(e.answer);
      if (!answer || !str(e.prompt)) return null;
      return { type: "type", q: str(e.q) || "Escribe en maya", prompt: str(e.prompt), answer: answer, alt: uniqStrings(e.alt) };
    }
    return null;
  }
  function buildCourse(raw) {
    var out = { units: [], lessons: [], lessonById: {}, vocab: [], vocabById: {}, vocabByNorm: {}, exByNorm: {}, tokConf: {}, proper: {}, names: {}, mayaForms: {}, guide: [], sources: [], dropped: [] };
    if (!raw || typeof raw !== "object" || !Array.isArray(raw.units)) return out;
    var units = raw.units.filter(function (u) { return u && typeof u === "object" && Array.isArray(u.lessons); });
    units.sort(function (a, b) { return (Number(a.n) || 0) - (Number(b.n) || 0); });
    var seenUnit = {}, seenSrc = {};
    units.forEach(function (u) {
      var uid = str(u.id) || ("u" + (Number(u.n) || out.units.length + 1));
      if (seenUnit[uid]) return;
      seenUnit[uid] = 1;
      var unit = {
        id: uid, n: Number(u.n) || out.units.length + 1, title: str(u.title) || "Unidad", subtitle: str(u.subtitle),
        sources: arr(u.sources).filter(function (s) { return s && (str(s.title) || /^https?:\/\//.test(str(s.url))); }),
        lessons: [], vocab: []
      };
      arr(u.lessons).forEach(function (l) {
        if (!l || typeof l !== "object") return;
        var lid = str(l.id) || (uid + "l" + (unit.lessons.length + 1));
        if (out.lessonById[lid]) return;
        var lesson = { id: lid, title: str(l.title) || "Lección", goal: str(l.goal), unit: unit, index: unit.lessons.length, teach: arr(l.teach).filter(validCard), vocab: [], dialogue: null, exercises: [] };
        arr(l.vocab).forEach(function (v) {
          if (!v || typeof v !== "object" || !str(v.m) || !str(v.es)) return;
          var id = str(v.id) || (uid + "-" + slug(v.m));
          if (out.vocabById[id]) return;
          var item = {
            id: id, m: str(v.m), es: str(v.es), pr: str(v.pr), note: str(v.note),
            ex: v.ex && str(v.ex.m) && str(v.ex.es) ? { m: str(v.ex.m), es: str(v.ex.es) } : null,
            alt: uniqStrings(v.alt), conf: v.conf === "alta" ? "alta" : "media",
            unit: unit, lesson: lesson, nw: words(str(v.m)).length,
            km: [searchKey(v.m)].concat(uniqStrings(v.alt).map(searchKey)), kes: searchKey(v.es)
          };
          out.vocabById[id] = item;
          lesson.vocab.push(item); unit.vocab.push(item); out.vocab.push(item);
        });
        if (l.dialogue && typeof l.dialogue === "object") {
          var lines = arr(l.dialogue.lines).filter(function (x) { return x && str(x.m) && str(x.es); }).map(function (x, i) {
            return { who: x.who === "B" ? "B" : x.who === "A" ? "A" : (i % 2 ? "B" : "A"), name: str(x.name), m: str(x.m), es: str(x.es) };
          });
          if (lines.length) lesson.dialogue = { title: str(l.dialogue.title) || "Diálogo", lines: lines };
        }
        lesson.exercises = arr(l.exercises).map(normEx).filter(Boolean);
        lesson.order = out.lessons.length;
        out.lessons.push(lesson); out.lessonById[lid] = lesson; unit.lessons.push(lesson);
      });
      if (unit.lessons.length) {
        out.units.push(unit);
        unit.sources.forEach(function (s) {
          var url = str(s.url), key = url || str(s.title);
          if (seenSrc[key]) return;
          seenSrc[key] = 1; out.sources.push({ title: str(s.title) || url, url: url });
        });
      }
    });
    if (raw.guide && Array.isArray(raw.guide.alphabet)) {
      out.guide = raw.guide.alphabet.filter(function (g) { return g && str(g.l) && str(g.desc); }).map(function (g) {
        return { l: str(g.l), desc: str(g.desc), ex: g.ex && str(g.ex.m) ? { m: str(g.ex.m), es: str(g.ex.es) } : null };
      });
    }
    indexForms(out, raw);
    // Vincula ejercicios escritos a mano con su palabra (para notas y conteo de errores) y
    // calcula la confianza de la forma maya que el ejercicio enseña.
    out.lessons.forEach(function (lesson) {
      lesson.exercises = lesson.exercises.filter(function (ex) {
        var target = exTarget(ex);
        var v = out.vocabByNorm[normalize(target)] || out.exByNorm[normalize(target)];
        if (!v) {
          var key = ex.type === "build" ? ex.m : ex.type === "choice" && ex.promptLang === "m" ? ex.prompt : ex.answer;
          v = out.vocabByNorm[normalize(key)];
        }
        if (v) ex.vocab = v;
        ex.conf = phraseConf(out, target);
        // Solo se pide producir (armar, completar, escribir o elegir la forma maya) lo que está
        // confirmado. Las formas «por confirmar» quedan para reconocer, con su insignia.
        var keep = ex.conf === "alta" || isRecognition(ex);
        if (!keep) out.dropped.push({ lesson: lesson.id, type: ex.type, target: target, conf: ex.conf });
        return keep;
      });
    });
    return out;
  }
  function isRecognition(ex) { return ex.type === "choice" && ex.promptLang === "m"; }
  // Forma maya completa que enseña un ejercicio escrito a mano.
  function exTarget(ex) {
    if (ex.type === "build") return ex.m;
    if (ex.type === "fill") return [ex.before, ex.answer].filter(Boolean).join(" ") + (ex.after ? (/^[?!.,;:]/.test(ex.after) ? "" : " ") + ex.after : "");
    if (ex.type === "type") return ex.answer;
    return ex.promptLang === "m" ? ex.prompt : ex.answer;
  }
  // Palabras sueltas de una frase maya, sin signos (el apóstrofo y el guion se conservan).
  function mayaTokens(s) {
    return normApos(s).normalize("NFC").split(/[\s¿?¡!.,;:"“”«»()…—–]+/).map(function (w) { return w.replace(/^-+|-+$/g, ""); }).filter(Boolean);
  }
  // Índices de formas: frase completa -> palabra, palabra suelta -> confianza, nombres propios.
  function indexForms(out, raw) {
    out.exByNorm = {}; out.tokConf = {}; out.proper = {}; out.names = {}; out.mayaForms = {};
    // Nombres de persona (no son maya) y nombres propios en general (conservan la mayúscula).
    ["dios", "pedro", "ana", "juan", "rosa", "refugio", "luis", "felipe", "pat", "maría", "maria"].forEach(function (n) { out.names[n] = 1; out.proper[n] = 1; });
    function addForms(s) { mayaTokens(s).forEach(function (t) { out.mayaForms[t.toLowerCase()] = 1; }); }
    function addTokens(s, conf) {
      mayaTokens(s).forEach(function (t) {
        var k = t.toLowerCase();
        if (conf === "alta" || !out.tokConf[k]) out.tokConf[k] = conf;
      });
      addForms(s);
    }
    // Mayúscula a media oración (no tras punto, signo de pregunta o raya) = nombre propio.
    function scanProper(s) {
      normApos(s).split(/[.?!¿¡…—–:]+/).forEach(function (sent) {
        mayaTokens(sent).forEach(function (t, i) { if (i > 0 && /^[A-ZÁÉÍÓÚÑ]/.test(t)) out.proper[t.toLowerCase()] = 1; });
      });
    }
    out.vocab.forEach(function (v) {
      [v.m].concat(v.alt).forEach(function (f) {
        var k = normalize(f);
        if (!out.vocabByNorm[k]) out.vocabByNorm[k] = v;
        if (f.indexOf("…") < 0) addTokens(f, v.conf);
        scanProper(f);
      });
      if (v.ex) {
        var ek = normalize(v.ex.m);
        if (!out.exByNorm[ek]) out.exByNorm[ek] = v;
        addTokens(v.ex.m, v.conf);
        scanProper(v.ex.m);
      }
    });
    out.lessons.forEach(function (l) {
      if (l.dialogue) l.dialogue.lines.forEach(function (ln) {
        scanProper(ln.m); addForms(ln.m);
        mayaTokens(ln.name).forEach(function (t) { var k = t.toLowerCase().replace(/\.$/, ""); if (!/^(don|doña|dona|dr|dra|sr|sra)$/.test(k)) { out.names[k] = 1; out.proper[k] = 1; } });
      });
      l.exercises.forEach(function (ex) { if (ex.type === "build") scanProper(ex.m); });
      // Formas ya marcadas como maya en las tarjetas y en las columnas mayas de las tablas.
      l.teach.forEach(function (c) {
        if (c.kind === "table") {
          arr(c.head).forEach(function (hd, i) { if (/^maya/i.test(str(hd))) arr(c.rows).forEach(function (r) { addForms(str(arr(r)[i])); }); });
        } else {
          String(c.html).replace(/<span class=["\\]*m["\\]*>([^<]*)<\/span>/g, function (all, t) { addForms(t); return all; });
        }
      });
    });
    out.guide.forEach(function (g) { if (g.ex) addForms(g.ex.m); });
    Object.keys(out.names).forEach(function (k) { delete out.mayaForms[k]; });
  }
  // Confianza de una frase maya: la de su entrada de vocabulario (o del ejemplo que la contiene)
  // o, si no tiene entrada, la de la palabra menos segura. Una palabra desconocida da «?».
  function phraseConf(out, s) {
    var k = normalize(s);
    var v = out.vocabByNorm[k] || out.exByNorm[k];
    if (v) return v.conf;
    var toks = mayaTokens(s), res = "alta";
    if (!toks.length) return "?";
    for (var i = 0; i < toks.length; i++) {
      var t = toks[i].toLowerCase();
      if (out.proper[t]) continue;
      var c = out.tokConf[t];
      if (!c) return "?";
      if (c === "media") res = "media";
    }
    return res;
  }

  /* ================= Estado persistente ================= */
  var KEY = "koox-maaya-v2";
  var GOALS = [10, 20, 30, 50];
  var INTERVALS = [0, 1, 3, 7, 16, 35];
  var storageOK = true;
  function freshState() {
    return { v: 2, xp: 0, xpByDay: {}, streak: { count: 0, best: 0, last: null, graceWeek: null }, daysTotal: 0, goal: 20, lessons: {}, srs: {}, x: {},
      settings: { sound: true, autoplay: true, rate: "normal", synth: true, calm: false, scheduler: "fsrs" } };
  }
  function isObj(x) { return !!x && typeof x === "object" && !Array.isArray(x); }
  function isWeek(k) { return typeof k === "string" && /^\d{4}-W\d{2}$/.test(k); }
  // Saneo del estado: de cualquier valor sale un estado válido (lo que falta o no sirve toma su valor por
  // omisión). Lo comparten loadState (lo guardado en este navegador) y la importación de copias de seguridad.
  function sanitizeState(o) {
    var s = freshState();
    if (!isObj(o)) return s;
    s.xp = nonNeg(o.xp);
    if (isObj(o.xpByDay)) Object.keys(o.xpByDay).forEach(function (k) { if (isDay(k)) s.xpByDay[k] = nonNeg(o.xpByDay[k]); });
    if (isObj(o.streak)) {
      s.streak.count = nonNeg(o.streak.count);
      s.streak.best = Math.max(nonNeg(o.streak.best), s.streak.count);
      s.streak.last = isDay(o.streak.last) ? o.streak.last : null;
      s.streak.graceWeek = isWeek(o.streak.graceWeek) ? o.streak.graceWeek : null;
    }
    // «Días con maya»: nunca baja. Si el estado es de una versión anterior (no lo trae), son los días con XP del historial.
    var withXp = Object.keys(s.xpByDay).filter(function (k) { return s.xpByDay[k] > 0; }).length;
    s.daysTotal = Math.max(nonNeg(o.daysTotal), withXp);
    if (GOALS.indexOf(o.goal) >= 0) s.goal = o.goal;
    if (isObj(o.lessons)) Object.keys(o.lessons).forEach(function (id) {
      var l = o.lessons[id];
      if (id !== "__proto__" && isObj(l)) s.lessons[id] = { best: clamp(nonNeg(l.best), 0, 100), done: !!l.done, times: nonNeg(l.times) };
    });
    if (isObj(o.srs)) Object.keys(o.srs).forEach(function (id) {
      var r = o.srs[id];
      if (id !== "__proto__" && isObj(r)) s.srs[id] = srsNormalize({ box: clamp(nonNeg(r.box), 0, 5), due: isDay(r.due) ? r.due : today(), right: nonNeg(r.right), wrong: nonNeg(r.wrong),
        s: r.s, d: r.d, last: r.last, reps: r.reps, lapses: r.lapses });
    });
    if (isObj(o.settings)) {
      s.settings.sound = o.settings.sound !== false;
      s.settings.autoplay = o.settings.autoplay !== false;
      s.settings.rate = o.settings.rate === "lenta" ? "lenta" : "normal";
      s.settings.synth = o.settings.synth !== false;
      s.settings.calm = o.settings.calm === true;
      s.settings.scheduler = o.settings.scheduler === "leitner" ? "leitner" : "fsrs";
    }
    // Estado de los módulos (src/modules): state.x.<módulo>. El núcleo solo lo conserva como JSON seguro y
    // acotado; cada módulo sanea su parte al leerla.
    if (isObj(o.x)) {
      try {
        var xj = JSON.stringify(o.x);
        if (xj.length <= 1500000) {
          var xp0 = JSON.parse(xj, function (k, v) { return k === "__proto__" || k === "constructor" || k === "prototype" ? undefined : v; });
          Object.keys(xp0).forEach(function (k) { if (/^[a-z][a-z0-9-]{0,23}$/.test(k) && isObj(xp0[k])) s.x[k] = xp0[k]; });
        }
      } catch (e) { /* se descarta */ }
    }
    return s;
  }
  function loadState() {
    var raw = null;
    try { raw = window.localStorage.getItem(KEY); } catch (e) { storageOK = false; }
    if (!raw) return freshState();
    try { return sanitizeState(JSON.parse(raw)); }
    catch (e) { return freshState(); /* estado dañado: se empieza de cero */ }
  }
  function save() {
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); storageOK = true; }
    catch (e) { storageOK = false; }
  }
  var state = loadState();
  // Modo tranquilo: la clase «calm» en el elemento body hace que el CSS oculte todo lo marcado con .gami
  // (píldora de racha, meta de hoy, XP, días con maya, aviso de meta). Los repasos pendientes se quedan.
  function applyCalm() {
    try { document.body.classList.toggle("calm", state.settings.calm === true); } catch (e) { /* sin efecto */ }
  }

  /* ---------- Racha amable ---------- */
  // La racha avanza el día en que se gana XP (al terminar una lección o un repaso); no hace falta llegar a
  // la meta diaria. Una vez por semana ISO se perdona UN día sin práctica (día de gracia, automático).
  // Con L = último día con práctica, d = hoy y gap = días entre ambos:
  //   gap 0 (o menos, si el reloj del equipo retrocedió): nada · gap 1: racha + 1 ·
  //   gap 2 con la gracia libre en la semana del día perdonado: racha + 1 y se gasta la gracia (graceWeek) ·
  //   en cualquier otro caso la racha vuelve a 1, sin mensajes de pérdida.
  // streakStep y streakView son puras (no modifican lo que reciben) y se prueban en test/smoke.cjs.
  function graceFree(streak, forgiven) { return streak.graceWeek !== isoWeek(forgiven); }
  function streakStep(streak, d) {
    var s = { count: nonNeg(streak.count), best: nonNeg(streak.best), last: isDay(streak.last) ? streak.last : null,
      graceWeek: isWeek(streak.graceWeek) ? streak.graceWeek : null, graced: false };
    var gap = s.last ? daysFrom(s.last, d) : null;
    if (gap !== null && gap <= 0) return s;
    if (gap === 1) s.count++;
    else if (gap === 2 && graceFree(s, addDays(s.last, 1))) { s.count++; s.graceWeek = isoWeek(addDays(s.last, 1)); s.graced = true; }
    else s.count = 1;
    s.last = d;
    s.best = Math.max(s.best, s.count);
    return s;
  }
  // La racha que se muestra el día d: vigente si la última práctica fue hoy o ayer, o antier con la gracia libre.
  function streakView(streak, d) {
    if (!isDay(streak.last)) return 0;
    var gap = daysFrom(streak.last, d);
    return gap <= 1 || (gap === 2 && graceFree(streak, addDays(streak.last, 1))) ? nonNeg(streak.count) : 0;
  }

  var goalJustMet = false, graceJustUsed = false;
  function addXP(n) {
    if (!(n > 0)) return;
    var d = today(), before = state.xpByDay[d] || 0;
    state.xp += n;
    state.xpByDay[d] = before + n;
    if (!before) state.daysTotal++; // el primer XP de un día suma un «día con maya»; este total nunca baja
    var r = streakStep(state.streak, d);
    state.streak = { count: r.count, best: r.best, last: r.last, graceWeek: r.graceWeek };
    if (r.graced) graceJustUsed = true;
    if (before < state.goal && before + n >= state.goal) goalJustMet = true;
    // Conserva solo los últimos 120 días del historial.
    var keys = Object.keys(state.xpByDay).sort();
    while (keys.length > 120) delete state.xpByDay[keys.shift()];
  }
  function xpToday() { return state.xpByDay[today()] || 0; }
  function currentStreak() { return streakView(state.streak, today()); }

  /* ---------- Repetición espaciada: FSRS (src/modules/fsrs.js) o Leitner ---------- */
  // Cada state.srs[id] es { box, due, right, wrong } más la memoria de FSRS: s (estabilidad en días), d (dificultad
  // 1–10), last (día del último repaso), reps y lapses. box es el NIVEL (0–5) que muestra la interfaz: con FSRS se
  // deriva de s (umbrales de INTERVALS); con el repaso clásico (settings.scheduler = "leitner") es la caja de Leitner.
  // srsNormalize completa y acota esos campos; una entrada vieja (solo box y due) se migra sin avisar:
  // s = intervalo de su caja (mínimo 1), d = 5, last = due - intervalo. Es idempotente.
  function srsNormalize(r) {
    var num = function (x) { return typeof x === "number" && isFinite(x); };
    r.s = num(r.s) && r.s > 0 ? clamp(r.s, 0.001, 36500) : Math.max(1, INTERVALS[r.box] || 0);
    r.d = num(r.d) ? clamp(r.d, 1, 10) : 5;
    if (!isDay(r.last)) r.last = addDays(isDay(r.due) ? r.due : today(), -Math.max(1, Math.round(r.s)));
    r.reps = clamp(nonNeg(r.reps) || Math.max(1, r.box || 0), 1, 1000000);
    r.lapses = clamp(nonNeg(r.lapses), 0, 1000000);
    return r;
  }
  function srsEntries() {
    return Object.keys(state.srs).filter(function (id) { return COURSE.vocabById[id]; }).map(function (id) {
      return { v: COURSE.vocabById[id], r: state.srs[id] };
    });
  }
  function dueList() {
    var t = today();
    return srsEntries().filter(function (e) { return e.r.due <= t; }).sort(function (a, b) {
      return a.r.due < b.r.due ? -1 : a.r.due > b.r.due ? 1 : a.r.box - b.r.box;
    });
  }
  function weakList() {
    return srsEntries().sort(function (a, b) {
      return (b.r.wrong - b.r.right) - (a.r.wrong - a.r.right) || a.r.box - b.r.box || (a.r.due < b.r.due ? -1 : 1);
    });
  }
  function bumpCount(vid, ok) {
    var r = state.srs[vid];
    if (!r) return false;
    if (ok) r.right++; else r.wrong++;
    return true;
  }
  // Repaso de una palabra: acierto = «Bien» (3), error = «Otra vez» (1). La memoria de FSRS y el historial se
  // actualizan siempre; el ajuste scheduler decide quién fija box y due: «fsrs» (por omisión) los deriva de la
  // estabilidad; «leitner» conserva las cajas de siempre (1, 3, 7, 16 y 35 días). Devuelve cuántos niveles subió.
  function srsReview(vid, ok) {
    var r = state.srs[vid];
    if (!r) return 0;
    var before = r.box, t = today(), g = ok ? 3 : 1;
    srsNormalize(r);
    var m = FSRS.next(r, Math.max(1, daysFrom(r.last, t)), g); // al menos un día entre repasos
    r.s = m.s; r.d = m.d; r.last = t; r.reps++;
    if (ok) r.right++; else { r.wrong++; r.lapses++; }
    FSRS.record(vid, g);
    if (state.settings.scheduler === "leitner") {
      r.box = ok ? Math.min(5, r.box + 1) : 1;
      r.due = addDays(t, INTERVALS[r.box]);
    } else {
      r.box = clamp(FSRS.level(r.s), 1, 5);
      r.due = addDays(t, FSRS.interval(r.s));
    }
    return r.box - before;
  }

  /* ================= Sonido ================= */
  var actx = null, audioFailed = false;
  function tone(kind) {
    if (!state.settings.sound || audioFailed) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { audioFailed = true; return; }
      actx = actx || new AC();
      if (actx.state === "suspended" && actx.resume) actx.resume();
      var t0 = actx.currentTime + 0.01;
      var notes = kind === "done" ? [[523.25, 0], [659.25, 0.11], [783.99, 0.22]] : kind === "tick" ? [[740, 0]] : [[659.25, 0], [880, 0.09]];
      notes.forEach(function (nt) {
        var o = actx.createOscillator(), g = actx.createGain(), t = t0 + nt[1];
        o.type = "sine"; o.frequency.value = nt[0];
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(kind === "tick" ? 0.05 : 0.11, t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t + (kind === "done" ? 0.32 : 0.17));
        o.connect(g); g.connect(actx.destination);
        o.start(t); o.stop(t + 0.36);
      });
    } catch (e) { audioFailed = true; }
  }

  /* ================= Íconos ================= */
  var ICON = {
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6.5v11l8.5-5.5z"/></svg>',
    sun: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/></svg>',
    review: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 4v5h-5"/></svg>',
    book: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/></svg>',
    tip: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/></svg>',
    culture: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 20.5h19M4.5 20.5v-4h3v-4h3v-4h3v4h3v4h3v4"/></svg>',
    warn: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5M12 17.2h.01"/></svg>',
    table: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M10 10v9"/></svg>',
    chat: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>',
    word: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7V5h16v2M12 5v14M9 19h6"/></svg>',
    mark: '<svg class="brand-mark" viewBox="0 0 28 28" aria-hidden="true"><path d="M1 26h26v-4h-3.5v-4H20v-4h-3.5V9h-5v5H8v4H4.5v4H1z"/></svg>',
    // Audio y recursos para escuchar (íconos genéricos: nunca logotipos de marcas).
    speaker: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="cone" d="M3.5 9.4h3.3L11 5.7v12.6l-4.2-3.7H3.5z"/><path d="M15 9.3a3.8 3.8 0 0 1 0 5.4M17.8 6.6a7.6 7.6 0 0 1 0 10.8"/></svg>',
    headphones: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 15.5V12a8 8 0 0 1 16 0v3.5"/><rect x="3" y="14" width="4.5" height="6.5" rx="1.6"/><rect x="16.5" y="14" width="4.5" height="6.5" rx="1.6"/></svg>',
    video: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="3.5"/><path class="cone" d="M10 9.3v5.4l4.6-2.7z"/></svg>',
    music: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 17.5V5.8l11-2.3v11.7"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="15.2" r="2.5"/></svg>',
    mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/></svg>',
    radio: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="8" width="18" height="12" rx="2.5"/><path d="M7 8l10-4.5M6.5 12.5h4M6.5 15.5h4"/><circle cx="15.5" cy="14" r="2.4"/></svg>',
    globe: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 18.3h2"/></svg>',
    external: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-8.5 8.5"/><path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/></svg>'
  };
  var KINDS = {
    text: ["Aprende", ICON.book], tip: ["Consejo", ICON.tip], culture: ["Cultura", ICON.culture],
    warn: ["Importante", ICON.warn], table: ["Tabla", ICON.table]
  };

  /* ================= Audio de pronunciación ================= */
  // window.COURSE_AUDIO lo arma build-core.mjs desde audio/catalogo.json: voces de hablantes («nativo»),
  // sonidos aislados del Alfabeto Fonético Internacional («fonema») y voces sintéticas aproximadas
  // («sintetico»). En el Artifact cada archivo llega como data: URI (nunca se pide audio a otro sitio);
  // en el sitio web, como audio/<key>.mp3?v=<hash>. Sin catálogo (o vacío) no aparece ningún botón.
  var AU_KIND = {
    nativo: { label: "Voz nativa", low: "voz nativa", aria: "voz nativa" },
    fonema: { label: "Sonido de referencia (AFI)", low: "sonido de referencia (AFI)", aria: "sonido de referencia del Alfabeto Fonético Internacional" },
    sintetico: { label: "Voz sintética (aproximada)", low: "voz sintética (aproximada)", aria: "voz sintética aproximada" }
  };
  // Prioridad para cualquier elemento: la voz de un hablante, luego el sonido de referencia (solo existe
  // para letras y sonidos) y al final la voz sintética. Si hay voz nativa, la sintética nunca se muestra.
  var RANK = { nativo: 0, fonema: 1, sintetico: 2 };
  var SYNTH_NOTE = "La voz sintética (aproximada) la genera una inteligencia artificial: puede equivocarse en el tono, " +
    "el saltillo y las consonantes glotalizadas. Cuando hay grabaciones de hablantes, se usa la voz nativa en su lugar.";
  // Atribución completa de cada audio (título, autor, licencia, página de origen y cambios), en el repositorio.
  var CREDITS_URL = "https://github.com/sebastiancanul455/koox-maaya/blob/main/audio/CREDITOS.md";
  function audioSrc(file, hash) {
    if (/^data:audio\/(mpeg|mp3);base64,/.test(file)) return file;
    if (window.KOOX_STANDALONE === true && /^audio\/[a-z0-9-]+\.mp3$/.test(file)) return file + (/^[0-9a-f]{6,64}$/.test(hash) ? "?v=" + hash : "");
    return null;
  }
  function buildAudio(raw) {
    var out = { list: [], byKey: {}, byVocab: {}, byLetter: {}, byText: {}, failed: {} };
    var entries = raw && typeof raw === "object" && Array.isArray(raw.entries) ? raw.entries : [];
    function add(map, k, a) { if (k) (map[k] || (map[k] = [])).push(a); }
    entries.forEach(function (e) {
      if (!e || typeof e !== "object") return;
      var key = str(e.key), kind = str(e.kind), src = audioSrc(str(e.file), str(e.hash));
      if (!/^[a-z0-9-]+$/.test(key) || out.byKey[key] || !AU_KIND[kind] || !src || !str(e.text)) return;
      var a = {
        key: key, kind: kind, src: src, text: str(e.text), ipa: str(e.ipa), lang: str(e.lang),
        vocab: uniqStrings(e.vocab), letters: uniqStrings(e.letters), speaker: str(e.speaker), region: str(e.region),
        author: str(e.author), license: str(e.license), licenseUrl: /^https:\/\/\S+$/.test(str(e.licenseUrl)) ? str(e.licenseUrl) : "",
        source: str(e.source), title: str(e.title), notes: str(e.notes)
      };
      out.list.push(a); out.byKey[key] = a;
      a.vocab.forEach(function (id) { add(out.byVocab, id, a); });
      a.letters.forEach(function (l) { add(out.byLetter, l, a); });
      add(out.byText, normalize(a.text), a);
    });
    return out;
  }
  var AU = buildAudio(window.COURSE_AUDIO);
  // Un audio se ofrece si no falló y, si es sintético, si el ajuste «Usar voz sintética» está activo.
  function usable(a) { return !!a && !AU.failed[a.key] && (a.kind !== "sintetico" || state.settings.synth !== false); }
  function hasAudio() { return AU.list.some(usable); }
  function hasKind(k) { return AU.list.some(function (a) { return a.kind === k; }); }
  // El mejor audio de una lista según RANK (u otro orden); con empate, el primero del catálogo.
  function pickAudio(list, rank) {
    var r = rank || RANK, best = null;
    arr(list).forEach(function (a) { if (usable(a) && (!best || r[a.kind] < r[best.kind])) best = a; });
    return best;
  }
  // Texto maya normalizado (minúsculas, apóstrofos unificados, sin signos): «Bix a beel?» = «bix a beel».
  // Por texto nunca se ofrece un «fonema»: es el sonido aislado de una letra, no una palabra. Así los
  // posesivos «a», «u» y «k» de la unidad 3 no suenan con la vocal o la consonante del AFI.
  function textAudios(t) { return arr(AU.byText[normalize(t)]).filter(function (a) { return a.kind !== "fonema"; }); }
  function audioForText(t) { return pickAudio(textAudios(t)); }
  function audioForVocab(id) {
    var v = COURSE.vocabById[id];
    return pickAudio(arr(AU.byVocab[id]).concat(v ? textAudios(v.m) : []));
  }
  // Letras de la guía: primero el sonido de referencia (AFI); si no hay, una grabación nativa que la ilustre.
  var LETTER_RANK = { fonema: 0, nativo: 1, sintetico: 2 };
  function audioForLetter(l) { return pickAudio(AU.byLetter[str(l)], LETTER_RANK); }
  // Audio de una tarjeta de la guía de pronunciación:
  //  · letters: el sonido de referencia de la letra; si no hay, una grabación nativa que la ilustre (que no
  //    sea la del ejemplo). Una tarjeta con varias letras («a e i o u») da un botón por cada letra con
  //    audio: el de la tarjeta cuyo texto es esa letra.
  //  · ex: el mejor audio del ejemplo por su texto (nativo > sintético).
  //  · more: grabaciones nativas de la letra que dicen otra palabra (p. ej. de Wikimedia Commons). Suenan
  //    junto al ejemplo, cada una con su palabra, y nunca reemplazan al sonido de referencia de la letra.
  function guideAudio(g) {
    var all = arr(AU.byLetter[str(g.l)]).filter(usable);
    var parts = str(g.l).split(/\s+/).filter(Boolean);
    var xa = g.ex ? audioForText(g.ex.m) : null, exN = g.ex ? normalize(g.ex.m) : null;
    var letters = [];
    if (parts.length > 1) {
      parts.forEach(function (p) {
        var a = pickAudio(all.filter(function (x) { return normalize(x.text) === normalize(p); }), LETTER_RANK);
        if (a) letters.push({ l: p, a: a });
      });
    }
    var multi = letters.length > 0;
    if (!multi) {
      var la = pickAudio(all.filter(function (x) { return x !== xa && normalize(x.text) !== exN; }), LETTER_RANK);
      if (la) letters.push({ l: str(g.l), a: la });
    }
    var used = letters.map(function (x) { return x.a; }).concat(xa ? [xa] : []);
    var more = all.filter(function (x) { return x.kind === "nativo" && used.indexOf(x) < 0 && normalize(x.text) !== exN; }).slice(0, 2);
    return { letters: letters, multi: multi, ex: xa, more: more };
  }
  // «Escucha y elige» solo usa voces de hablantes: nunca sintéticas ni sonidos aislados.
  function nativeFor(v) { var a = v && audioForVocab(v.id); return a && a.kind === "nativo" ? a : null; }

  // Un solo reproductor: suena un audio a la vez.
  var player = null, nowKey = null, nowBtn = null;
  var auStats = { plays: 0, started: 0, ended: 0, errors: 0, blocked: 0, lastKey: null, lastRate: 1 };
  function auPlayer() {
    if (player) return player;
    try { player = new Audio(); } catch (e) { return null; }
    player.preload = "auto";
    player.addEventListener("playing", function () { auStats.started++; auMark(true); });
    player.addEventListener("pause", function () { auMark(false); });
    player.addEventListener("ended", function () { auStats.ended++; auMark(false); });
    player.addEventListener("error", function () { if (nowKey) audioBroken(nowKey); });
    return player;
  }
  function auMark(on) {
    $$("[data-au].is-playing").forEach(function (b) { b.classList.remove("is-playing"); });
    if (on && nowBtn && document.contains(nowBtn)) nowBtn.classList.add("is-playing");
  }
  function playAudio(a, opts) {
    opts = opts || {};
    if (!usable(a)) return false;
    var p = auPlayer();
    if (!p) return false;
    stopAudio();
    nowKey = a.key; nowBtn = opts.btn || null;
    var rate = opts.slow || state.settings.rate === "lenta" ? 0.75 : 1;
    try {
      if (p.kooxSrc !== a.src) { p.kooxSrc = a.src; p.src = a.src; }
      else { try { p.currentTime = 0; } catch (e) { /* aún sin datos */ } }
      // Más lento sin cambiar el tono (preservesPitch y sus variantes con prefijo).
      p.preservesPitch = true; p.mozPreservesPitch = true; p.webkitPreservesPitch = true;
      p.defaultPlaybackRate = rate; p.playbackRate = rate;
      auStats.plays++; auStats.lastKey = a.key; auStats.lastRate = rate;
      var pr = p.play();
      if (pr && typeof pr.then === "function") pr.then(null, function (e) {
        var name = e && e.name;
        if (name === "AbortError") return;                                       // lo interrumpió otro audio
        if (name === "NotAllowedError") { auStats.blocked++; auMark(false); return; } // el navegador pide un toque
        if (nowKey === a.key) audioBroken(a.key);
      });
    } catch (e) { audioBroken(a.key); return false; }
    return true;
  }
  function stopAudio() {
    nowKey = null; nowBtn = null;
    if (player) { try { if (!player.paused) player.pause(); } catch (e) { /* sin efecto */ } }
    auMark(false);
  }
  // Un audio que no carga: se ocultan sus botones y no se vuelve a ofrecer.
  function audioBroken(key) {
    if (AU.failed[key]) return;
    AU.failed[key] = true; auStats.errors++;
    if (nowKey === key) { nowKey = null; nowBtn = null; }
    $$('[data-au-key="' + key + '"]').forEach(function (x) { x.hidden = true; });
    if (cur && cur.ex && cur.ex.type === "listen" && cur.ex.audio.key === key) listenFallback();
  }
  document.addEventListener("click", function (e) {
    var b = e.target && e.target.closest ? e.target.closest("[data-au]") : null;
    if (!b) return;
    e.preventDefault();
    e.stopPropagation();
    var a = AU.byKey[b.getAttribute("data-au")];
    if (a) playAudio(a, { slow: b.hasAttribute("data-au-slow"), btn: b });
  });
  function auAria(a, shown, slow) { return "Escuchar «" + (shown || a.text) + "»" + (slow ? " lento" : "") + ", " + AU_KIND[a.kind].aria; }
  // Botón de escuchar. size: "lg" (tarjeta de palabra), "md" (listas, diálogo, guía) o "sm" (en línea).
  function auBtn(a, shown, size, id) {
    return '<button class="au-btn ' + size + " k-" + a.kind + '" type="button"' + (id ? ' id="' + id + '"' : "") + ' data-au="' + esc(a.key) + '" data-au-key="' + esc(a.key) +
      '" aria-label="' + esc(auAria(a, shown)) + '" title="' + esc(AU_KIND[a.kind].label) + '">' + ICON.speaker +
      // En línea no cabe la etiqueta completa: la voz sintética lleva «aprox.» y la nota de la tarjeta lo explica.
      (size === "sm" && a.kind === "sintetico" ? '<span class="au-aprox" aria-hidden="true">aprox.</span>' : "") + "</button>";
  }
  // Botón con la letra escrita (tarjetas de la guía que agrupan varias letras, como «a e i o u»).
  function auLetterBtn(a, l) {
    return '<button class="au-btn md au-l k-' + a.kind + '" type="button" data-au="' + esc(a.key) + '" data-au-key="' + esc(a.key) +
      '" aria-label="' + esc(auAria(a, l)) + '" title="' + esc(AU_KIND[a.kind].label + (a.ipa ? " " + a.ipa : "")) + '"><span class="m" lang="yua">' + esc(l) + "</span>" + ICON.speaker + "</button>";
  }
  // Etiqueta discreta del tipo de audio.
  function auTag(a) {
    return '<span class="au-kind ' + a.kind + '" data-au-key="' + esc(a.key) + '">' + esc(AU_KIND[a.kind].label) +
      (a.kind === "fonema" && a.ipa ? ' <span class="ipa">' + esc(a.ipa) + "</span>" : "") + "</span>";
  }
  // Nota con los tipos de audio de una pantalla (tarjetas y diálogos con varios botones).
  function auNote(kinds, lead) {
    var ks = ["nativo", "sintetico", "fonema"].filter(function (k) { return kinds[k]; });
    if (!ks.length) return "";
    var low = ks.map(function (k) { return AU_KIND[k].low; });
    return '<p class="au-note">' + ICON.speaker.replace("<svg", '<svg class="ico"') + "<span>" + esc(lead) +
      (low.length > 1 ? low.slice(0, -1).join(", ") + " y " + low[low.length - 1] : low[0]) + "." +
      (kinds.sintetico ? " La voz sintética (botones con borde punteado o «aprox.») la genera una IA: no es un hablante." : "") +
      (kinds.fonema ? " El sonido de referencia (borde punteado) es el sonido aislado, no una palabra maya." : "") + "</span></p>";
  }

  /* ================= Para escuchar más (enlaces externos) ================= */
  // window.COURSE_RESOURCES viene de src/content/recursos.js. Íconos genéricos por tipo.
  var RES_KIND = { youtube: ["YouTube", "video"], spotify: ["Spotify", "music"], podcast: ["Pódcast", "mic"], radio: ["Radio", "radio"], web: ["Sitio web", "globe"], app: ["App", "phone"] };
  var RES_LANG = { yua: "En maya", es: "En español", "yua-es": "En maya y español", en: "En inglés" };
  var RES_CRED = { institucional: "Institucional", "hablante nativo": "Hablante nativo", docente: "Docente", otro: "Otra fuente" };
  var RES = (function (raw) {
    var seen = {};
    return arr(raw).filter(function (r) { return r && typeof r === "object"; }).map(function (r) {
      return {
        id: str(r.id), title: str(r.title), url: str(r.url), kind: RES_KIND[r.kind] ? r.kind : "web", source: str(r.source),
        lang: RES_LANG[r.lang] ? r.lang : "", units: uniqStrings(r.units), lessons: uniqStrings(r.lessons),
        cred: RES_CRED[r.credibility] ? r.credibility : "otro", note: str(r.note)
      };
    }).filter(function (r) {
      var k = r.id || r.url;
      if (!r.title || !/^https:\/\/[^\s"'<>]+$/.test(r.url) || seen[k]) return false;
      seen[k] = 1;
      return true;
    });
  })(window.COURSE_RESOURCES);
  // Los de la lección; si no hay, los de su unidad (primero los que no son de una lección concreta).
  function resourcesFor(l) {
    var mine = RES.filter(function (r) { return r.lessons.indexOf(l.id) >= 0; });
    if (mine.length) return mine;
    return RES.filter(function (r) { return r.units.indexOf(l.unit.id) >= 0; })
      .sort(function (a, b) { return (a.lessons.length ? 1 : 0) - (b.lessons.length ? 1 : 0); });
  }
  function unitNames(ids) {
    var ns = COURSE.units.filter(function (u) { return ids.indexOf(u.id) >= 0; }).map(function (u) { return String(u.n); });
    return ns.length ? (ns.length === 1 ? "Unidad " : "Unidades ") + (ns.length > 1 ? ns.slice(0, -1).join(", ") + " y " + ns[ns.length - 1] : ns[0]) : "";
  }
  function resItem(r, withUnits) {
    var k = RES_KIND[r.kind];
    var meta = [k[0], r.source, RES_LANG[r.lang], withUnits ? unitNames(r.units) : ""].filter(Boolean).join(" · ");
    return '<li><a class="res" href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">' +
      '<span class="res-ico" aria-hidden="true">' + ICON[k[1]] + "</span>" +
      '<span class="res-txt"><span class="res-t">' + markMaya(r.title) + "</span>" +
      '<span class="res-s">' + esc(meta) + "</span>" +
      '<span class="res-c ' + r.cred.replace(/\s+/g, "-") + '">' + esc(RES_CRED[r.cred]) + "</span>" +
      (r.note ? '<span class="res-n">' + markMaya(r.note) + "</span>" : "") + "</span>" +
      '<span class="res-ext" aria-hidden="true">' + ICON.external + '</span><span class="sr-only"> (se abre fuera de la app)</span></a></li>';
  }

  /* ================= Elementos fijos ================= */
  var el = {
    main: $("#tabs-main"), home: $("#v-home"), review: $("#v-review"), dict: $("#v-dict"), profile: $("#v-profile"),
    session: $("#v-session"), body: $("#s-body"), progress: $("#s-progress"), fill: $("#s-progress-fill"), count: $("#s-count"),
    next: $("#btn-next"), check: $("#btn-check"), cont: $("#btn-continue"), close: $("#btn-close"),
    feedback: $("#feedback"), fbBody: $("#fb-body"), actions: $("#s-actions"), live: $("#fb-live"),
    confirm: $("#confirm"), lessonSheet: $("#lesson-sheet"), lsModal: $("#ls-modal"),
    toast: $("#toast"), navbar: $("#navbar"), badge: $("#nav-badge"),
    dictQ: $("#dict-q"), dictUnits: $("#dict-units"), dictList: $("#dict-list"), dictCount: $("#dict-count")
  };
  if (el.lessonSheet) el.lessonSheet.classList.add("bottom-sheet");

  var screen = "home";
  var tab = "aprender";
  var TAB_VIEW = { aprender: "home", repasar: "review", diccionario: "dict", perfil: "profile" };

  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.hidden = false;
    clearTimeout(toast.t);
    toast.t = setTimeout(function () { el.toast.hidden = true; }, 2800);
  }
  function syncThemeColor() {
    try {
      var c = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
      var meta = $("#meta-theme");
      if (meta && c) meta.setAttribute("content", c);
    } catch (e) { /* sin efecto */ }
  }

  /* ================= Navegación por pestañas ================= */
  function showTab(name, opts) {
    if (!TAB_VIEW[name]) name = "aprender";
    tab = name;
    S = null; cur = null;
    stopAudio();
    document.body.classList.remove("in-session");
    el.session.hidden = true;
    el.feedback.hidden = true;
    el.main.hidden = false;
    var v = TAB_VIEW[name];
    el.home.hidden = v !== "home"; el.review.hidden = v !== "review"; el.dict.hidden = v !== "dict"; el.profile.hidden = v !== "profile";
    $$(".nav-tab").forEach(function (b) {
      if (b.getAttribute("data-tab") === name) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
    if (v === "home") renderHome();
    else if (v === "review") renderReview();
    else if (v === "dict") renderDict();
    else renderProfile();
    screen = v === "home" && !COURSE.lessons.length ? "empty" : v;
    updateBadge();
    try { if (location.hash !== "#" + name) history.replaceState(history.state, "", "#" + name); } catch (e) { /* marco sin historial */ }
    if (!(opts && opts.keepScroll)) window.scrollTo(0, 0);
    if (opts && opts.scrollTo) {
      var target = document.getElementById(opts.scrollTo);
      if (target) target.scrollIntoView({ block: "start" });
    }
    if (PWA && PWA.on) PWA.flush(); // aviso de versión nueva que esperaba a que terminara la sesión
  }
  function updateBadge() {
    var n = dueList().length;
    el.badge.hidden = n === 0;
    el.badge.textContent = n > 99 ? "99+" : String(n);
    var t = $("#tab-repasar");
    if (t) { if (n) t.setAttribute("aria-label", "Repasar, " + n + " " + plural(n, "pendiente", "pendientes")); else t.removeAttribute("aria-label"); }
  }

  /* ================= Aprender (inicio) ================= */
  function lessonDone(l) { return !!(state.lessons[l.id] && state.lessons[l.id].done); }
  // Palabras que se agregaron a una lección ya terminada (por una versión nueva del curso):
  // solo entran al repaso al repetir la lección, así que se avisa en la ruta y en la hoja.
  function lessonFresh(l) { return lessonDone(l) ? l.vocab.filter(function (x) { return !state.srs[x.id]; }).length : 0; }
  function nextLesson() {
    for (var i = 0; i < COURSE.lessons.length; i++) if (!lessonDone(COURSE.lessons[i])) return COURSE.lessons[i];
    return null;
  }
  // Píldora de la racha. Sin racha vigente pero con práctica anterior no dice «0 días de racha» sino los
  // «días con maya» acumulados (que nunca bajan). Es parte de la gamificación (.gami): el modo tranquilo la oculta.
  function streakPillHTML() {
    var st = currentStreak(), dt = state.daysTotal, n = st, label, aria, off = false;
    if (st > 0) { label = plural(st, "día de racha", "días de racha"); aria = "Racha: " + st + " " + plural(st, "día", "días"); }
    else if (dt > 0) { n = dt; label = plural(dt, "día con maya", "días con maya"); aria = dt + " " + label; }
    else { label = "días de racha"; aria = "Racha: 0 días"; off = true; }
    return '<button class="stat-pill sun gami' + (off ? " off" : "") + '" type="button" id="pill-streak" aria-label="' + aria + '">' + ICON.sun +
      '<span class="sp-txt" aria-hidden="true"><span class="num">' + n + '</span><span class="sp-l">' + label + "</span></span></button>";
  }
  function statbarHTML() {
    var due = dueList().length;
    return '<div class="statbar" id="statbar">' +
      '<div class="brand">' + ICON.mark + '<span class="brand-name">Ko\'ox Maaya</span></div>' +
      '<div class="stats-mini">' + streakPillHTML() +
      '<button class="stat-pill due" type="button" id="pill-due" aria-label="Repasos pendientes: ' + due + '">' + ICON.review +
      '<span class="sp-txt" aria-hidden="true"><span class="num">' + due + '</span><span class="sp-l">' + plural(due, "repaso", "repasos") + "</span></span></button>" +
      "</div></div>";
  }
  function renderHome() {
    var v = el.home;
    if (!COURSE.lessons.length) {
      v.innerHTML = statbarHTML() +
        '<div class="hero"><div class="greca" aria-hidden="true"></div><h1 id="home-title">Ko\'ox <span class="accent">Maaya</span></h1></div>' +
        '<div class="card empty-state"><h2>El curso aún no tiene lecciones</h2><p class="muted">No se encontró el contenido del curso. Cuando se agreguen las unidades, aparecerán aquí en orden.</p></div>';
      bindStatbar();
      return;
    }
    var nx = nextLesson(), xp = xpToday(), goal = state.goal, due = dueList().length;
    var anyDone = COURSE.lessons.some(lessonDone);
    var h = statbarHTML();
    h += '<div class="hero"><div class="greca" aria-hidden="true"></div>' +
      '<p class="eyebrow">Maya yucateco desde cero</p>' +
      '<h1 id="home-title">Ko\'ox <span class="accent">Maaya</span></h1></div>';
    h += '<div class="card resume">';
    if (nx) {
      h += '<div class="resume-top"><p class="eyebrow">Unidad ' + nx.unit.n + " · Lección " + (nx.index + 1) + "</p>" +
        "<h2>" + markMaya(nx.title) + "</h2>" + (nx.goal ? '<p class="resume-goal">' + esc(nx.goal) + "</p>" : "") + "</div>";
    } else {
      h += '<div class="resume-top"><p class="eyebrow">Curso completo</p><h2>Terminaste todas las lecciones</h2>' +
        '<p class="resume-goal">Sigue repasando para que las palabras se queden contigo.</p></div>';
    }
    h += '<div class="today-goal gami"><div class="goal-row"><span>Meta de hoy</span><span class="num">' + xp + " / " + goal + " XP</span></div>" +
      '<div class="bar" role="progressbar" aria-label="Meta de hoy" aria-valuemin="0" aria-valuemax="' + goal + '" aria-valuenow="' + Math.min(xp, goal) + '"><span style="width:' + Math.round(clamp(xp / goal, 0, 1) * 100) + '%"></span></div></div>';
    if (nx) h += '<button class="btn primary wide" type="button" id="btn-resume">' + (anyDone ? "Continuar" : "Empezar") + "</button>";
    if (due) h += '<button class="btn tonal wide" type="button" id="btn-home-review">' + ICON.review + "Repasar " + due + " " + plural(due, "palabra", "palabras") + "</button>";
    else if (!nx) h += '<button class="btn tonal wide" type="button" id="btn-home-review">' + ICON.review + "Práctica libre</button>";
    h += "</div>";
    if (COURSE.guide.length) h += '<button class="guide-link card" type="button" id="btn-home-guide">' + ICON.book +
      '<span class="gl-txt"><span class="gl-t">Guía de sonidos</span><span class="gl-s">Cómo se leen las ' + COURSE.guide.length + ' letras del alfabeto maya</span></span></button>';
    h += modHTML("homeTop");

    COURSE.units.forEach(function (u) {
      var done = u.lessons.filter(lessonDone).length, total = u.lessons.length, complete = done === total;
      h += '<section class="unit" id="unit-' + esc(u.id) + '" aria-labelledby="unit-title-' + esc(u.id) + '">' +
        '<div class="greca' + (complete ? " yaax" : "") + '" aria-hidden="true"></div>' +
        '<div class="unit-head"><p class="eyebrow">Unidad ' + u.n + "</p>" +
        '<h2 id="unit-title-' + esc(u.id) + '">' + esc(u.title) + "</h2>" +
        (u.subtitle ? '<p class="unit-sub">' + esc(u.subtitle) + "</p>" : "") +
        modHTML("unit", u) + '<div class="unit-meta"><div class="bar yaax" aria-hidden="true"><span style="width:' + Math.round(done / total * 100) + '%"></span></div>' +
        (complete ? '<span class="unit-done-chip">' + ICON.check.replace("<svg", '<svg class="ico"') + "Completa</span>" : '<span class="num">' + done + " de " + total + "</span>") +
        "</div></div>";
      h += '<ol class="path">';
      var prevO = 0;
      u.lessons.forEach(function (l, i) {
        var o = [0, 1, 2, 1][i % 4];
        var rec = state.lessons[l.id], isDone = lessonDone(l), isNext = nx && nx.id === l.id;
        var prevDone = i > 0 && lessonDone(u.lessons[i - 1]);
        var cls = isDone ? "done" : isNext ? "next" : "todo";
        var fresh = lessonFresh(l);
        var meta = l.vocab.length + " " + plural(l.vocab.length, "palabra", "palabras") + (rec && rec.done ? " · " + rec.best + " %" : "") +
          (fresh ? " · " + fresh + " " + plural(fresh, "nueva", "nuevas") : "");
        var label = "Lección " + (i + 1) + ": " + l.title + (isDone ? ", completada" : isNext ? ", siguiente recomendada" : "") +
          (fresh ? ", con " + fresh + " " + plural(fresh, "palabra nueva", "palabras nuevas") : "");
        h += '<li class="path-item' + (prevDone && (isDone || isNext) ? " link-done" : "") + (i > 0 && prevO > o ? " back" : "") + '" style="--o:' + o + ";--p:" + prevO + '">' +
          '<button class="node-row ' + cls + '" type="button" data-lesson="' + esc(l.id) + '" aria-label="' + esc(label) + '">' +
          '<span class="node" aria-hidden="true">' + (isDone ? ICON.check : isNext ? ICON.play : String(i + 1)) + "</span>" +
          '<span class="node-label">' + (isNext ? '<span class="next-tag">Siguiente</span>' : fresh ? '<span class="next-tag new-tag">Novedades</span>' : "") +
          '<span class="nl-title">' + markMaya(l.title) + '</span><span class="nl-meta">' + esc(meta) + "</span></span>" +
          "</button></li>";
        prevO = o;
      });
      h += "</ol>";
      if (unitStarted(u)) h += '<button class="btn tonal unit-review" type="button" data-unit-review="' + esc(u.id) + '">' + ICON.review + "Repaso de la unidad</button>";
      h += "</section>";
    });
    h += modHTML("homeEnd");
    h += '<p class="foot">Ko\'ox Maaya es un curso experimental. Revisa el aviso de confiabilidad en Perfil.</p>';
    v.innerHTML = h;
    bindStatbar();
    modCall("bind", v, "home");
    var r = $("#btn-resume");
    if (r) r.addEventListener("click", function () { if (nx) startLesson(nx); });
    var hr = $("#btn-home-review");
    if (hr) hr.addEventListener("click", function () { startReview(); });
    var hg = $("#btn-home-guide");
    if (hg) hg.addEventListener("click", openGuide);
    $$(".node-row", v).forEach(function (b) {
      b.addEventListener("click", function () { openLessonSheet(COURSE.lessonById[b.getAttribute("data-lesson")], b); });
    });
    $$("[data-unit-review]", v).forEach(function (b) {
      b.addEventListener("click", function () {
        var u = COURSE.units.filter(function (x) { return x.id === b.getAttribute("data-unit-review"); })[0];
        if (u) startUnitReview(u);
      });
    });
  }
  function bindStatbar() {
    var p = $("#pill-due"); if (p) p.addEventListener("click", function () { showTab("repasar"); });
    var s = $("#pill-streak"); if (s) s.addEventListener("click", function () { showTab("perfil"); });
  }

  /* ---------- Hoja de vista previa ---------- */
  var lastFocus = null;
  function openLessonSheet(l, from) {
    if (!l) return;
    lastFocus = from || document.activeElement;
    var rec = state.lessons[l.id];
    var h = '<p class="eyebrow">Unidad ' + l.unit.n + " · Lección " + (l.index + 1) + "</p>" +
      '<h2 id="ls-title">' + markMaya(l.title) + "</h2>" +
      (l.goal ? "<p>" + esc(l.goal) + "</p>" : "") +
      '<div class="ls-meta"><span class="ls-chip">' + l.vocab.length + " " + plural(l.vocab.length, "palabra nueva", "palabras nuevas") + "</span>" +
      (l.dialogue ? '<span class="ls-chip">Con diálogo</span>' : "") +
      (rec && rec.done ? '<span class="ls-chip done">Completada · mejor ' + rec.best + " %</span>" : "") + "</div>" +
      (lessonFresh(l) ? '<p class="ls-new">' + (lessonFresh(l) === 1 ? "Agregamos una palabra" : "Agregamos " + lessonFresh(l) + " palabras") +
        " a esta lección después de que la terminaste. Repítela para sumarlas a tu repaso.</p>" : "") +
      lessonListenHTML(l) +
      '<div class="modal-actions"><button class="btn primary wide" type="button" id="btn-start-lesson">' + (rec && rec.done ? "Repetir lección" : "Empezar") + "</button>" +
      '<button class="btn text" type="button" data-close-sheet>Ahora no</button></div>';
    el.lsModal.innerHTML = h;
    el.lessonSheet.hidden = false;
    document.body.classList.add("locked");
    histPush("sheet");
    $("#btn-start-lesson").addEventListener("click", function () { closeLessonSheet(true, "keep"); startLesson(l); });
    var more = $("#btn-ls-more");
    if (more) more.addEventListener("click", function () {
      closeLessonSheet(true);
      showTab("perfil", { scrollTo: "listen-title" });
      var box = $("#listen-box"); if (box) box.open = true;
    });
    $$("[data-close-sheet]", el.lessonSheet).forEach(function (b) { b.addEventListener("click", function () { closeLessonSheet(); }); });
    $("#btn-start-lesson").focus();
  }
  // «Para escuchar más»: recursos de la lección (o de su unidad), como enlaces externos.
  var LS_RES_MAX = 3;
  function lessonListenHTML(l) {
    var rs = resourcesFor(l);
    if (!rs.length) return "";
    return '<section class="ls-listen" aria-labelledby="ls-listen-title"><h3 class="ls-sub" id="ls-listen-title">' + ICON.headphones + "Para escuchar más</h3>" +
      '<ul class="res-list">' + rs.slice(0, LS_RES_MAX).map(function (r) { return resItem(r); }).join("") + "</ul>" +
      (rs.length > LS_RES_MAX || RES.length > rs.length ? '<button class="btn text ls-more" type="button" id="btn-ls-more">Ver todos en Perfil · Escucha maya</button>' : "") + "</section>";
  }
  // mode: "pop" = la cerró el botón Atrás; "keep" = la reemplaza una sesión; si no, se quita su entrada.
  function closeLessonSheet(silent, mode) {
    if (el.lessonSheet.hidden) return;
    el.lessonSheet.hidden = true;
    document.body.classList.remove("locked");
    if (mode !== "pop" && mode !== "keep" && histState() === "sheet") histPop(function () {});
    if (!silent && lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }
  el.lessonSheet.addEventListener("click", function (e) { if (e.target.classList && e.target.classList.contains("scrim")) closeLessonSheet(); });

  /* ================= Generación de ejercicios ================= */
  function candidatesFor(v, pools) {
    var seen = {}, out = [];
    pools.forEach(function (pool) {
      var tier = shuffle(pool.filter(function (x) { return x !== v && !seen[x.id]; }));
      tier.sort(function (a, b) { return (Math.abs(a.nw - v.nw) > 1 ? 1 : 0) - (Math.abs(b.nw - v.nw) > 1 ? 1 : 0); });
      tier.forEach(function (x) { seen[x.id] = 1; out.push(x); });
    });
    return out;
  }
  // Partes del significado («sol, día» -> sol | día), sin paréntesis, para detectar sinónimos.
  function meaningParts(es) {
    return String(es).replace(/\([^)]*\)/g, " ").split(/[,;\/]| o /).map(searchKey).filter(Boolean);
  }
  function overlaps(a, b) {
    var pa = a.parts || (a.parts = meaningParts(a.es)), pb = b.parts || (b.parts = meaningParts(b.es));
    for (var i = 0; i < pa.length; i++) if (pb.indexOf(pa[i]) >= 0) return true;
    return false;
  }
  // Dos palabras se confunden en un ejercicio si comparten forma maya o algún significado.
  function ambiguous(a, b) { return normalize(a.m) === normalize(b.m) || normalize(a.es) === normalize(b.es) || overlaps(a, b); }
  function makeChoice(v, dir) {
    // Elegir la forma maya a partir del español ya es producir: solo con formas confirmadas.
    if (dir !== "m2es" && v.conf !== "alta") return null;
    var field = dir === "m2es" ? "es" : "m";
    var answer = v[field];
    var used = {}; used[normalize(answer)] = 1;
    var picks = [], chosen = [v];
    var cands = candidatesFor(v, [v.lesson.vocab, v.unit.vocab, COURSE.vocab]);
    for (var i = 0; i < cands.length && picks.length < 3; i++) {
      var c = cands[i], val = c[field], k = normalize(val);
      if (used[k] || chosen.some(function (x) { return ambiguous(x, c); })) continue;
      used[k] = 1; picks.push(val); chosen.push(c);
    }
    if (picks.length < 2) return null;
    return {
      type: "choice", auto: true, vocab: v,
      q: dir === "m2es" ? "¿Qué significa?" : "¿Cómo se dice en maya?",
      prompt: dir === "m2es" ? v.m : v.es, promptLang: dir === "m2es" ? "m" : "es",
      answer: answer, options: [answer].concat(picks)
    };
  }
  function canType(v) { return v.conf === "alta" && v.nw >= 1 && v.nw <= 3 && !/[…\/]|\.\.\./.test(v.m); }
  // Otra palabra del curso que cubre todo el significado pedido («gracias» lo cubre
  // «muchas gracias; gracias») también es una respuesta válida al escribir.
  function covers(x, v) {
    var px = x.parts || (x.parts = meaningParts(x.es)), pv = v.parts || (v.parts = meaningParts(v.es));
    if (!pv.length) return false;
    if (px.indexOf(searchKey(String(v.es).replace(/\([^)]*\)/g, " "))) >= 0) return true;
    return pv.every(function (p) { return px.indexOf(p) >= 0; });
  }
  function makeType(v) {
    var same = COURSE.vocab.filter(function (x) { return x !== v && x.conf === "alta" && (normalize(x.es) === normalize(v.es) || covers(x, v)); });
    var alt = v.alt.slice();
    same.forEach(function (x) { alt.push(x.m); alt = alt.concat(x.alt); });
    return { type: "type", auto: true, vocab: v, q: "Escribe en maya", prompt: v.es, answer: v.m, alt: alt };
  }
  // «Escucha y elige»: solo palabras con voz nativa. Alterna entre elegir la forma escrita (solo si está
  // confirmada: elegir la forma maya ya es producir) y elegir el significado.
  var listenTurn = Math.random() < 0.5 ? 0 : 1;
  function makeListen(v) {
    var a = nativeFor(v);
    if (!a) return null;
    var wantM = v.conf === "alta" && listenTurn++ % 2 === 0;
    var base = (wantM ? makeChoice(v, "es2m") : null) || makeChoice(v, "m2es");
    if (!base) return null;
    var optLang = base.promptLang === "es" ? "m" : "es";
    return {
      type: "listen", auto: true, vocab: v, audio: a, optLang: optLang,
      q: optLang === "m" ? "¿Qué palabra escuchaste?" : "¿Qué significa lo que escuchaste?",
      // Por si el audio falla: se muestra el texto y queda como una elección normal.
      prompt: optLang === "m" ? v.es : v.m,
      answer: base.answer, options: base.options
    };
  }
  function makePairs(list, fallbackPools) {
    var picks = [];
    function tryAdd(x) {
      if (picks.length >= 5 || x.nw > 4 || x.conf !== "alta") return;
      if (picks.some(function (p) { return ambiguous(p, x); })) return;
      picks.push(x);
    }
    shuffle(list.slice()).sort(function (a, b) { return a.nw - b.nw; }).forEach(tryAdd);
    if (picks.length < 4) arr(fallbackPools).forEach(function (pool) { shuffle(pool.slice()).forEach(function (x) { if (picks.length < 4) tryAdd(x); }); });
    if (picks.length < 4) return null;
    return { type: "pairs", auto: true, items: picks };
  }
  // Ejercicios de la lección. «pre» son las comprobaciones rápidas ya intercaladas entre las
  // palabras nuevas: cuentan dentro del total y no se repiten aquí.
  function lessonExercises(lesson, pre) {
    pre = pre || [];
    var hand = lesson.exercises.slice(0, 15).map(function (e) { var c = Object.assign({}, e); c.hand = true; return c; });
    var V = lesson.vocab;
    var earlier = lesson.unit.lessons.slice(0, lesson.index).reduce(function (a, l) { return a.concat(l.vocab); }, []);
    var earlierCourse = COURSE.lessons.slice(0, lesson.order).reduce(function (a, l) { return a.concat(l.vocab); }, []);
    var pairs = V.length ? makePairs(V, [earlier, earlierCourse]) : null;
    var inPairs = {};
    if (pairs) pairs.items.forEach(function (x) { inPairs[x.id] = 1; });
    var recogA = shuffle(V.filter(function (v) { return !inPairs[v.id]; })).map(function (v) { return makeChoice(v, "m2es"); }).filter(Boolean);
    var typeTurn = Math.random() < 0.5;
    var recall = shuffle(V.slice()).map(function (v) {
      if (canType(v)) { typeTurn = !typeTurn; if (typeTurn) return makeType(v); }
      return makeChoice(v, "es2m") || (canType(v) ? makeType(v) : null);
    }).filter(Boolean);
    var recogB = shuffle(V.filter(function (v) { return inPairs[v.id]; })).map(function (v) { return makeChoice(v, "m2es"); }).filter(Boolean);
    // 1 o 2 de «Escucha y elige» cuando hay voces nativas de las palabras de la lección.
    var listen = shuffle(V.filter(function (v) { return nativeFor(v); })).slice(0, 2).map(makeListen).filter(Boolean);
    // No repite lo que ya pregunta un ejercicio escrito a mano o una comprobación intercalada.
    function autoKey(e) {
      if (e.type === "choice") return (e.promptLang === "m" ? "m2es:" + normalize(e.prompt) : "es2m:" + normalize(e.answer));
      if (e.type === "type") return "type:" + normalize(e.answer);
      return "";
    }
    var handKeys = {};
    hand.concat(pre).forEach(function (e) { var k = autoKey(e); if (k) handKeys[k] = 1; });
    var target = clamp(hand.length + V.length + 3, 10, 15);
    var need = Math.max(0, target - hand.length - pre.length - listen.length);
    var queue = (pairs ? [pairs] : []).concat(recogA, recall, recogB).filter(function (e) { return !handKeys[autoKey(e)]; });
    var auto = queue.slice(0, need);
    // Al menos 3 ejercicios de escribir cuando hay palabras confirmadas que se pueden escribir.
    var typed = {};
    hand.concat(auto).forEach(function (e) { if (e.type === "type") typed[normalize(e.answer)] = 1; });
    var minType = Math.min(3, V.filter(canType).length);
    var nType = Object.keys(typed).length;
    // Primero se cambian elecciones español→maya; si no alcanza, también maya→español.
    ["es", "m"].forEach(function (lang) {
      for (var i = 0; i < auto.length && nType < minType; i++) {
        var e = auto[i];
        if (e.type === "choice" && e.promptLang === lang && e.vocab && canType(e.vocab) && !typed[normalize(e.vocab.m)]) {
          auto[i] = makeType(e.vocab); typed[normalize(e.vocab.m)] = 1; nType++;
        }
      }
    });
    // Fases: reconocer -> relacionar -> producir.
    var all = hand.concat(auto, listen);
    function phase(e) {
      if (e.type === "choice" && e.promptLang === "m") return 0;
      if (e.type === "pairs" || e.type === "fill" || e.type === "choice" || e.type === "listen") return 1;
      return 2;
    }
    var buckets = [[], [], []];
    all.forEach(function (e) { buckets[phase(e)].push(e); });
    return shuffle(buckets[0]).concat(shuffle(buckets[1]), shuffle(buckets[2]));
  }
  function wordExercises(list, max, withPairs, pairPool) {
    var out = [], n = 0;
    list.slice(0, max).forEach(function (v) {
      var r = n++ % 3, e = null;
      if (r === 1 && canType(v)) e = makeType(v);
      else if (r === 2) e = makeChoice(v, "es2m");
      if (!e) e = makeChoice(v, "m2es") || makeChoice(v, "es2m") || (canType(v) ? makeType(v) : null);
      if (e) out.push(e);
    });
    // En los repasos también: hasta 2 de «Escucha y elige» con las palabras que tienen voz nativa.
    for (var i = 0, nl = 0; i < out.length && nl < 2; i++) {
      var le = out[i].vocab && nativeFor(out[i].vocab) ? makeListen(out[i].vocab) : null;
      if (le) { out[i] = le; nl++; }
    }
    if (withPairs) {
      var p = makePairs(list.slice(0, 8), [pairPool || COURSE.vocab]);
      if (p) out.splice(Math.min(2, out.length), 0, p);
    }
    return out;
  }

  /* ================= Sesión ================= */
  var S = null;     // sesión activa
  var cur = null;   // ejercicio en pantalla

  function openSession(kind, steps, extra) {
    closeLessonSheet(true, "keep");
    histPush("s");
    S = Object.assign({ kind: kind, steps: steps, idx: 0, firstTotal: 0, firstRight: 0, moved: 0, pending: {}, done: false }, extra || {});
    cur = null;
    document.body.classList.add("in-session");
    el.main.hidden = true;
    el.session.hidden = false;
    el.close.setAttribute("aria-label", kind === "lesson" ? "Salir de la lección" : "Salir del repaso");
    renderStep();
  }
  // Grupos de 3 o 4 palabras nuevas; tras cada grupo, una comprobación rápida de reconocimiento.
  function vocabChunks(V) {
    if (V.length <= 4) return V.length ? [V.slice()] : [];
    var k = Math.ceil(V.length / 4), base = Math.floor(V.length / k), rem = V.length % k, out = [], at = 0;
    for (var i = 0; i < k; i++) { var n = base + (i < rem ? 1 : 0); out.push(V.slice(at, at + n)); at += n; }
    return out;
  }
  function startLesson(l) {
    if (!l) return;
    openSession("lesson", lessonSteps(l), { lesson: l });
  }
  function lessonSteps(l) {
    var steps = [], pre = [];
    l.teach.forEach(function (c) { steps.push({ t: "teach", card: c }); });
    var handPrompts = {};
    l.exercises.forEach(function (e) { if (e.type === "choice" && e.promptLang === "m") handPrompts[normalize(e.prompt)] = 1; });
    var i = 0;
    vocabChunks(l.vocab).forEach(function (chunk) {
      chunk.forEach(function (v) { steps.push({ t: "vocab", v: v, i: i++, n: l.vocab.length }); });
      var cands = shuffle(chunk.filter(function (v) { return !handPrompts[normalize(v.m)]; }));
      for (var c = 0; c < cands.length; c++) {
        var e = makeChoice(cands[c], "m2es");
        if (e) { e.quick = true; pre.push(e); steps.push({ t: "ex", ex: e }); break; }
      }
    });
    if (l.dialogue) steps.push({ t: "dialogue", d: l.dialogue });
    lessonExercises(l, pre).forEach(function (e) { steps.push({ t: "ex", ex: e }); });
    return steps;
  }
  function startReview() {
    var due = dueList(), kind = "review", list;
    if (due.length) list = due.slice(0, 15).map(function (e) { return e.v; });
    else { kind = "practice"; list = weakList().slice(0, 12).map(function (e) { return e.v; }); }
    if (!list.length) { toast("Completa una lección para empezar a repasar."); return; }
    var exs = wordExercises(shuffle(list), 15, false);
    if (!exs.length) { toast("Aún no hay suficientes palabras para repasar."); return; }
    openSession(kind, exs.map(function (e) { return { t: "ex", ex: e }; }));
  }
  function unitStarted(u) { return u.lessons.some(lessonDone); }
  function startUnitReview(u) {
    // Solo palabras que ya se estudiaron: nunca se repasa lo que no se ha enseñado.
    var studied = u.vocab.filter(function (v) { return state.srs[v.id]; });
    if (!studied.length) { toast("Completa una lección de esta unidad para repasarla."); return; }
    var list = shuffle(studied.slice()).sort(function (a, b) { return state.srs[a.id].box - state.srs[b.id].box; }).slice(0, 12);
    var exs = wordExercises(shuffle(list), 12, true, srsEntries().map(function (e) { return e.v; }));
    if (!exs.length) { toast("Esta unidad aún no tiene palabras para repasar."); return; }
    openSession("unit", exs.map(function (e) { return { t: "ex", ex: e }; }), { unit: u });
  }

  function exStepsBefore(i) { var n = 0; for (var k = 0; k < i; k++) if (S.steps[k].t === "ex") n++; return n; }
  function updateProgress() {
    var total = S.steps.length, pct = total ? Math.round(S.idx / total * 100) : 100;
    el.fill.style.width = pct + "%";
    el.progress.setAttribute("aria-valuenow", String(pct));
    var st = S.steps[S.idx];
    if (st && st.t === "ex") {
      var exTotal = S.steps.filter(function (s) { return s.t === "ex"; }).length;
      el.count.textContent = (exStepsBefore(S.idx) + 1) + "/" + exTotal;
    } else el.count.textContent = "";
  }
  function bumpBar() {
    el.progress.classList.remove("bump");
    void el.progress.offsetWidth;
    el.progress.classList.add("bump");
  }
  function setSheetHeight() {
    var h = el.feedback.hidden ? el.actions.offsetHeight : Math.max(el.actions.offsetHeight, el.feedback.offsetHeight);
    document.body.style.setProperty("--sheet-h", (h || 96) + "px");
  }
  function renderStep() {
    stopAudio();
    el.feedback.hidden = true;
    clearTimeout(announce.t);
    if (el.live) el.live.textContent = "";
    el.actions.hidden = false;
    var st = S.steps[S.idx];
    if (!st) { finishSession(); return; }
    updateProgress();
    cur = null;
    el.next.hidden = st.t === "ex";
    el.check.hidden = st.t !== "ex";
    el.check.disabled = true;
    el.check.textContent = "Comprobar";
    el.next.textContent = "Siguiente";
    if (st.t === "teach") { renderTeach(st.card); screen = "teach"; }
    else if (st.t === "vocab") { renderVocab(st); screen = "vocab"; }
    else if (st.t === "dialogue") { renderDialogue(st.d); screen = "dialogue"; }
    else { renderExercise(st); screen = "exercise"; }
    setSheetHeight();
    window.scrollTo(0, 0);
  }

  /* ---------- Tarjetas y vocabulario ---------- */
  function renderTeach(c) {
    var k = KINDS[c.kind] || KINDS.text;
    var h = '<article class="teach ' + esc(c.kind) + '">' +
      '<p class="eyebrow kind-label">' + k[1] + esc(k[0]) + "</p>" +
      (c.title ? '<h2 id="step-title" tabindex="-1">' + esc(c.title) + "</h2>" : "");
    if (c.kind === "table") {
      var head = arr(c.head).map(str);
      var mcols = head.map(function (x) { return /^(maya|letra)/i.test(x); });
      h += '<div class="table-wrap" tabindex="0" role="region" aria-label="' + esc(c.title || "Tabla") + '"><table><thead><tr>' +
        head.map(function (x) { return '<th scope="col">' + esc(x) + "</th>"; }).join("") + "</tr></thead><tbody>" +
        arr(c.rows).map(function (r) {
          return "<tr>" + arr(r).map(function (cell, i) {
            return mcols[i] ? '<td class="m" lang="yua">' + esc(str(cell)) + "</td>" : "<td>" + markCell(str(cell)) + "</td>";
          }).join("") + "</tr>";
        }).join("") + "</tbody></table></div>";
    } else {
      h += '<div class="card-box">' + (c.kind === "culture" ? '<div class="greca" aria-hidden="true"></div>' : "") +
        '<div class="teach-body">' + sanitize(c.html) + "</div></div>";
    }
    h += "</article>";
    el.body.innerHTML = h;
    if (c.kind !== "table" && hasAudio()) {
      var used = {};
      $$(".teach-body .m", el.body).forEach(function (sp) {
        var t = sp.textContent, a = audioForText(t);
        if (!a) return;
        sp.insertAdjacentHTML("afterend", auBtn(a, t, "sm"));
        used[a.kind] = 1;
      });
      var note = auNote(used, "Toca el altavoz para escuchar: ");
      if (note) $(".teach", el.body).insertAdjacentHTML("beforeend", note);
    }
  }
  function confBadge(v) {
    return v.conf === "media" ? '<span class="badge-conf" title="Forma probable, aún sin confirmar en una fuente">Por confirmar</span>' : "";
  }
  function renderVocab(st) {
    var v = st.v, a = audioForVocab(v.id), xa = v.ex ? audioForText(v.ex.m) : null;
    if (xa && xa === a) xa = null;
    var h = '<article class="word-card" aria-labelledby="wc-m">' +
      '<p class="eyebrow kind-label">' + ICON.word + (lessonDone(v.lesson) ? "Vocabulario · " : "Palabra nueva · ") + (st.i + 1) + " de " + st.n + "</p>" +
      '<p class="wc-m m' + (v.m.length > 18 ? " long" : "") + '" id="wc-m" lang="yua">' + esc(v.m) + "</p>" +
      (a ? '<div class="wc-audio" data-au-key="' + esc(a.key) + '"><div class="wc-au-row">' + auBtn(a, v.m, "lg", "wc-play") +
        '<button class="btn tonal au-slow" type="button" id="wc-slow" data-au="' + esc(a.key) + '" data-au-slow aria-label="' + esc(auAria(a, v.m, true)) + '">' +
        ICON.speaker + "Lento</button></div>" + auTag(a) + "</div>" : "") +
      '<p class="wc-es">' + esc(v.es) + "</p>" +
      (v.pr ? '<p class="wc-pr">Se pronuncia aprox. «' + esc(v.pr) + "»</p>" : "") +
      (v.conf === "media" ? confBadge(v) + '<p class="conf-explain">Es una forma probable que todavía no se confirmó en una fuente. Compruébala con un hablante.</p>' : "") +
      (v.note ? '<p class="wc-note">' + markMaya(v.note) + "</p>" : "") +
      (v.ex ? '<div class="wc-ex"><span class="eyebrow">Ejemplo</span><span class="wc-ex-m">' + m(v.ex.m) + (xa ? auBtn(xa, v.ex.m, "sm") : "") + "</span><span>" + esc(v.ex.es) + "</span></div>" : "") +
      "</article>";
    el.body.innerHTML = h;
    // Al aparecer la palabra suena su pronunciación (si el ajuste lo permite). Ocurre dentro del toque
    // de «Siguiente», así que el navegador lo deja sonar; si no, queda el botón.
    if (a && state.settings.autoplay) playAudio(a, { btn: $("#wc-play") });
  }
  // Inicial del avatar: salta tratamientos (Don, Doña, Dra., Sr.…) para que «Dra. Pat» y
  // «Don Felipe» no compartan la misma letra.
  function initialOf(name) {
    var words = String(name).trim().split(/\s+/);
    var rest = words.filter(function (w) { return !/^(don|doña|dona|dr|dra|sr|sra|srta|lic|ing|prof|profa)\.?$/i.test(w); });
    var w = (rest.length ? rest : words)[0] || "?";
    return w.charAt(0).toUpperCase();
  }
  function renderDialogue(d) {
    var lines = "", used = {};
    d.lines.forEach(function (ln, i) {
      var name = ln.name || (ln.who === "A" ? "A" : "B"), la = audioForText(ln.m);
      if (la) used[la.kind] = 1;
      lines += '<div class="bubble-row ' + (ln.who === "B" ? "b" : "a") + '" style="animation-delay:' + (i * 60) + 'ms">' +
        '<span class="avatar" aria-hidden="true">' + esc(initialOf(name)) + "</span>" +
        '<button class="bubble" type="button" aria-expanded="false" id="line-' + i + '">' +
        '<span class="who">' + esc(name) + "</span>" + m(ln.m) +
        (la && la.kind === "sintetico" ? '<span class="tr-au" data-au-key="' + esc(la.key) + '">' + esc(AU_KIND.sintetico.label) + "</span>" : "") +
        '<span class="tr" hidden>' + esc(ln.es) + '</span><span class="tr-hint">Toca para traducir</span></button>' +
        (la ? auBtn(la, ln.m, "md", "line-au-" + i) : "") + "</div>";
    });
    var withAu = Object.keys(used).length > 0;
    var h = '<div class="section"><p class="eyebrow kind-label">' + ICON.chat + 'Diálogo</p><h2 id="step-title" tabindex="-1">' + esc(d.title) + "</h2>" +
      '<p class="muted">' + (withAu ? "Lee en voz alta o toca el altavoz para escuchar. Toca una línea para ver su traducción." : "Lee en voz alta. Toca una línea para ver su traducción.") + "</p>" +
      (withAu ? auNote(used, "Audio: ") : "") + '</div><div class="dialogue">' + lines;
    h += '</div><button class="btn text" type="button" id="btn-show-all">Mostrar todas las traducciones</button>';
    el.body.innerHTML = h;
    function toggle(b, force) {
      var open = force != null ? force : b.getAttribute("aria-expanded") !== "true";
      b.setAttribute("aria-expanded", String(open));
      $(".tr", b).hidden = !open;
      $(".tr-hint", b).hidden = open;
    }
    $$(".bubble", el.body).forEach(function (b) { b.addEventListener("click", function () { toggle(b); }); });
    $("#btn-show-all").addEventListener("click", function () {
      var all = $$(".bubble", el.body), anyClosed = all.some(function (b) { return b.getAttribute("aria-expanded") !== "true"; });
      all.forEach(function (b) { toggle(b, anyClosed); });
      this.textContent = anyClosed ? "Ocultar traducciones" : "Mostrar todas las traducciones";
    });
  }

  /* ---------- Ejercicios ---------- */
  function setReady(v) { if (cur) { cur.ready = !!v; el.check.disabled = !cur.ready; } }
  function exHeader(st, q) {
    var tag = st.retry ? '<p class="ex-tag retry">Otra vez</p>' : "";
    return tag + '<h2 class="ex-q" id="step-title" tabindex="-1">' + esc(q) + "</h2>";
  }
  function renderExercise(st) {
    var ex = st.ex;
    cur = { st: st, ex: ex, ready: false, checked: false };
    var fn = { choice: renderChoice, fill: renderFill, build: renderBuild, type: renderType, pairs: renderPairs, listen: renderListen }[ex.type];
    fn(st, ex);
  }
  function optionButtons(opts, lang) {
    return '<div class="opts" role="group" aria-label="Opciones">' + opts.map(function (o, i) {
      return '<button class="opt" type="button" id="opt-' + i + '" data-i="' + i + '" aria-pressed="false"><span class="key" aria-hidden="true">' + (i + 1) + "</span>" +
        (lang === "m" ? '<span class="opt-txt m" lang="yua">' + esc(o) + "</span>" : '<span class="opt-txt">' + esc(o) + "</span>") + "</button>";
    }).join("") + "</div>";
  }
  function bindOptions(onPick) {
    $$(".opt", el.body).forEach(function (b) {
      b.addEventListener("click", function () {
        if (!cur || cur.checked) return;
        $$(".opt", el.body).forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        cur.sel = Number(b.getAttribute("data-i"));
        if (onPick) onPick(cur.sel);
        setReady(true);
      });
    });
  }
  function markOptions() {
    var opts = $$(".opt", el.body);
    opts.forEach(function (b) {
      var i = Number(b.getAttribute("data-i"));
      b.disabled = true;
      if (cur.opts[i] === cur.ex.answer) b.classList.add("is-right");
      else if (i === cur.sel) b.classList.add("is-wrong");
    });
  }
  function renderChoice(st, ex) {
    var optLang = ex.promptLang === "m" ? "es" : "m";
    cur.opts = shuffle(ex.options.slice());
    el.body.innerHTML = '<div class="ex">' + exHeader(st, ex.q) +
      (ex.promptLang === "m" ? '<p class="prompt m' + (ex.prompt.length > 28 ? " small" : "") + '" lang="yua">' + esc(ex.prompt) + "</p>" : '<p class="prompt' + (ex.prompt.length > 28 ? " small" : "") + '">' + esc(ex.prompt) + "</p>") +
      (exMedia(ex) ? '<p class="ex-conf">' + confBadge({ conf: "media" }) + '<span>Forma probable, aún sin confirmar en una fuente.</span></p>' : "") +
      optionButtons(cur.opts, optLang) + "</div>";
    bindOptions();
    cur.evaluate = function () {
      var ok = cur.opts[cur.sel] === ex.answer;
      markOptions();
      return { ok: ok, answer: ex.answer, lang: optLang };
    };
  }
  function renderListen(st, ex) {
    var a = ex.audio, ok = !AU.failed[a.key];
    cur.opts = shuffle(ex.options.slice());
    el.body.innerHTML = '<div class="ex">' + (st.retry ? '<p class="ex-tag retry">Otra vez</p>' : "") +
      '<p class="eyebrow kind-label">' + ICON.speaker.replace("<svg", '<svg class="ico"') + "Escucha y elige</p>" +
      '<h2 class="ex-q" id="step-title" tabindex="-1">' + esc(ex.q) + "</h2>" +
      '<div class="listen" id="listen-box" data-au-key="' + esc(a.key) + '"' + (ok ? "" : " hidden") + ">" +
      '<button class="au-btn xl" type="button" id="listen-play" data-au="' + esc(a.key) + '" aria-label="Escuchar el audio, ' + esc(AU_KIND[a.kind].aria) + '">' + ICON.speaker + "</button>" +
      '<div class="listen-side"><button class="btn tonal au-slow" type="button" id="listen-slow" data-au="' + esc(a.key) + '" data-au-slow aria-label="Escuchar lento, ' + esc(AU_KIND[a.kind].aria) + '">' + ICON.speaker + "Lento</button>" +
      auTag(a) + "</div></div>" +
      '<p class="prompt' + (ex.optLang === "es" ? ' m" lang="yua"' : '"') + ' id="listen-fallback"' + (ok ? " hidden" : "") + ">" + esc(ex.prompt) + "</p>" +
      (exMedia(ex) ? '<p class="ex-conf">' + confBadge({ conf: "media" }) + "<span>Forma probable, aún sin confirmar en una fuente.</span></p>" : "") +
      optionButtons(cur.opts, ex.optLang) + "</div>";
    bindOptions();
    cur.evaluate = function () {
      var right = cur.opts[cur.sel] === ex.answer;
      markOptions();
      return { ok: right, answer: ex.answer, lang: ex.optLang };
    };
    if (ok && state.settings.autoplay) playAudio(a, { btn: $("#listen-play") });
  }
  // Si el audio de «Escucha y elige» no carga, se muestra el texto y el ejercicio sigue como una elección.
  function listenFallback() {
    var box = $("#listen-box"), fb = $("#listen-fallback");
    if (box) box.hidden = true;
    if (fb) fb.hidden = false;
  }
  function renderFill(st, ex) {
    cur.opts = shuffle(ex.options.slice());
    el.body.innerHTML = '<div class="ex">' + exHeader(st, "Completa la frase") +
      (ex.es ? '<p class="fill-es">' + esc(ex.es) + "</p>" : "") +
      '<p class="fill-sentence" lang="yua">' + (ex.before ? '<span class="m">' + esc(ex.before) + "</span> " : "") +
      '<span class="blank m" id="blank" aria-label="Espacio en blanco">&nbsp;</span>' + (ex.after ? (/^[?!.,;:]/.test(ex.after) ? "" : " ") + '<span class="m">' + esc(ex.after) + "</span>" : "") + "</p>" +
      optionButtons(cur.opts, "m") + "</div>";
    bindOptions(function (i) {
      var b = $("#blank");
      b.textContent = cur.opts[i];
      b.classList.add("filled");
    });
    cur.evaluate = function () {
      var ok = cur.opts[cur.sel] === ex.answer;
      markOptions();
      var full = [ex.before, ex.answer].filter(Boolean).join(" ") + (ex.after ? (/^[?!.,;:]/.test(ex.after) ? "" : " ") + ex.after : "");
      return { ok: ok, answer: full, lang: "m", es: ex.es };
    };
  }
  function renderBuild(st, ex) {
    var tiles = ex.words.map(function (w, i) { return { k: "w" + i, text: tileCase(w) }; })
      .concat(ex.distractors.map(function (d, i) { return { k: "d" + i, text: tileCase(d) }; }));
    shuffle(tiles);
    cur.tiles = tiles; cur.picked = [];
    el.body.innerHTML = '<div class="ex">' + exHeader(st, "Arma la frase en maya") +
      '<p class="build-es">' + esc(ex.es) + "</p>" +
      '<div class="build-answer" id="build-answer" aria-label="Tu respuesta" aria-live="polite"></div>' +
      '<div class="bank" id="bank" role="group" aria-label="Palabras disponibles">' +
      tiles.map(function (t) { return '<button class="tile m" lang="yua" type="button" data-k="' + t.k + '" id="tile-' + t.k + '">' + esc(t.text) + "</button>"; }).join("") +
      "</div></div>";
    var ans = $("#build-answer");
    function draw() {
      ans.innerHTML = cur.picked.map(function (k) {
        var t = tiles.filter(function (x) { return x.k === k; })[0];
        return '<button class="tile m" lang="yua" type="button" data-pk="' + k + '" aria-label="Quitar ' + esc(t.text) + '">' + esc(t.text) + "</button>";
      }).join("");
      $$(".tile", ans).forEach(function (b) {
        b.addEventListener("click", function () {
          if (!cur || cur.checked) return;
          var k = b.getAttribute("data-pk");
          cur.picked = cur.picked.filter(function (x) { return x !== k; });
          var src = $('#bank [data-k="' + k + '"]');
          if (src) { src.classList.remove("used"); src.disabled = false; src.removeAttribute("aria-hidden"); }
          draw();
        });
      });
      setReady(cur.picked.length > 0);
    }
    $$("#bank .tile").forEach(function (b) {
      b.addEventListener("click", function () {
        if (!cur || cur.checked || b.classList.contains("used")) return;
        cur.picked.push(b.getAttribute("data-k"));
        b.classList.add("used"); b.disabled = true; b.setAttribute("aria-hidden", "true");
        draw();
      });
    });
    draw();
    cur.text = function () { return cur.picked.map(function (k) { return tiles.filter(function (x) { return x.k === k; })[0].text; }).join(" "); };
    cur.evaluate = function () {
      var ok = normalize(cur.text()) === normalize(ex.words.join(" "));
      $$(".tile", el.body).forEach(function (b) { b.disabled = true; });
      return { ok: ok, answer: ex.m, lang: "m", es: ex.es, built: cur.text() };
    };
  }
  // Califica lo escrito. Si solo coincide sin acentos pero lo escrito es otra palabra del curso
  // con otro significado (miis «gato» por míis «escoba»), es un error: el tono distingue palabras.
  function gradeTyped(input, ex) {
    var g = grade(input, [ex.answer].concat(arr(ex.alt)));
    if (g.ok && g.accent) {
      var other = COURSE.vocabByNorm[normalize(input)];
      var target = ex.vocab || COURSE.vocabByNorm[normalize(ex.answer)];
      if (other && other !== target && !(target && (overlaps(other, target) || covers(other, target)))) return { ok: false, other: other };
    }
    return g;
  }
  function exMedia(ex) { return ex.conf === "media" || !!(ex.vocab && ex.vocab.conf === "media" && (ex.auto || ex.conf !== "alta")); }
  // Primera letra en minúscula salvo nombres propios (Pedro, Jo', Dios…).
  function tileCase(w) {
    var k = w.toLowerCase();
    if (COURSE.proper[k.replace(/[.,;:!?]+$/, "")]) return w;
    return w.charAt(0).toLowerCase() + w.slice(1);
  }
  // Celda de tabla en español: marca las formas mayas; «corta: a» marca lo que va tras los dos puntos.
  function markCell(t) {
    var mm = /^(.*:\s)([a-záéíóú']{1,4})$/i.exec(t);
    if (mm && /^[aeiouáéíóú']+$/i.test(mm[2])) return esc(mm[1]) + m(mm[2]);
    return markMaya(t);
  }
  var HELP_KEYS = ["'", "á", "é", "í", "ó", "ú"];
  function renderType(st, ex) {
    el.body.innerHTML = '<div class="ex">' + exHeader(st, ex.q || "Escribe en maya") +
      '<p class="type-prompt">' + esc(ex.prompt) + "</p>" +
      '<form class="type-form" id="type-form" autocomplete="off" novalidate>' +
      '<label class="sr-only" for="type-answer">Tu respuesta en maya</label>' +
      '<input class="type-input m" lang="yua" id="type-answer" name="type-answer" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" inputmode="text" enterkeyhint="go" placeholder="Escribe aquí">' +
      '<div class="keys" role="group" aria-label="Letras de ayuda">' +
      HELP_KEYS.map(function (k, i) { return '<button class="key-btn" type="button" id="key-' + i + '" data-key="' + esc(k) + '" aria-label="Insertar ' + (k === "'" ? "apóstrofo" : k) + '">' + esc(k) + "</button>"; }).join("") +
      '</div><p class="keys-hint">El apóstrofo marca el saltillo o una consonante glotalizada.</p></form></div>';
    var input = $("#type-answer");
    input.addEventListener("input", function () { setReady(input.value.trim().length > 0); });
    $("#type-form").addEventListener("submit", function (e) { e.preventDefault(); if (cur && !cur.checked) check(); });
    $$(".key-btn", el.body).forEach(function (b) {
      b.addEventListener("pointerdown", function (e) { e.preventDefault(); });
      b.addEventListener("mousedown", function (e) { e.preventDefault(); });
      b.addEventListener("click", function () {
        if (!cur || cur.checked) return;
        var ch = b.getAttribute("data-key");
        var s = input.selectionStart, e2 = input.selectionEnd;
        if (s == null || document.activeElement !== input) { s = e2 = input.value.length; }
        try { input.setRangeText(ch, s, e2, "end"); }
        catch (err) { input.value = input.value.slice(0, s) + ch + input.value.slice(e2); }
        input.focus();
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
    });
    if (window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches) input.focus();
    cur.input = input;
    cur.evaluate = function () {
      var g = gradeTyped(input.value, ex);
      input.disabled = true;
      $$(".key-btn", el.body).forEach(function (b) { b.disabled = true; });
      return { ok: g.ok, accent: g.accent, matched: g.matched || ex.answer, answer: ex.answer, lang: "m", typed: input.value, other: g.other };
    };
  }
  function renderPairs(st, ex) {
    var left = shuffle(ex.items.slice()), right = shuffle(ex.items.slice());
    cur.sel = { L: null, R: null }; cur.matched = {}; cur.mistakes = 0; cur.wrong = {};
    el.body.innerHTML = '<div class="ex">' + exHeader(st, "Une cada palabra con su significado") +
      '<div class="pairs"><div class="pairs-col" role="group" aria-label="Maya">' +
      left.map(function (v, i) { return '<button class="pair-btn m" lang="yua" type="button" id="pl-' + i + '" data-side="L" data-id="' + esc(v.id) + '" aria-pressed="false">' + esc(v.m) + "</button>"; }).join("") +
      '</div><div class="pairs-col" role="group" aria-label="Español">' +
      right.map(function (v, i) { return '<button class="pair-btn" type="button" id="pr-' + i + '" data-side="R" data-id="' + esc(v.id) + '" aria-pressed="false">' + esc(v.es) + "</button>"; }).join("") +
      "</div></div></div>";
    el.check.textContent = "Une todas las parejas";
    var btns = $$(".pair-btn", el.body);
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        if (!cur || cur.checked) return;
        var side = b.getAttribute("data-side"), id = b.getAttribute("data-id");
        if (cur.matched[id]) return;
        btns.forEach(function (x) { if (x.getAttribute("data-side") === side) x.setAttribute("aria-pressed", "false"); });
        if (cur.sel[side] === b) { cur.sel[side] = null; return; }
        cur.sel[side] = b; b.setAttribute("aria-pressed", "true");
        if (cur.sel.L && cur.sel.R) {
          var a = cur.sel.L, c = cur.sel.R;
          cur.sel = { L: null, R: null };
          a.setAttribute("aria-pressed", "false"); c.setAttribute("aria-pressed", "false");
          if (a.getAttribute("data-id") === c.getAttribute("data-id")) {
            cur.matched[id] = 1;
            [a, c].forEach(function (x) { x.classList.add("matched"); x.disabled = true; });
            tone("tick");
            if (Object.keys(cur.matched).length === ex.items.length) { setReady(true); check(); }
          } else {
            cur.mistakes++;
            cur.wrong[a.getAttribute("data-id")] = 1; cur.wrong[c.getAttribute("data-id")] = 1;
            [a, c].forEach(function (x) {
              x.classList.remove("flash"); void x.offsetWidth; x.classList.add("flash");
              setTimeout(function () { x.classList.remove("flash"); }, 450);
            });
          }
        }
      });
    });
    cur.evaluate = function () {
      var wrongItems = ex.items.filter(function (v) { return cur.wrong[v.id]; });
      return { ok: cur.mistakes === 0, pairs: wrongItems, mistakes: cur.mistakes };
    };
  }

  /* ---------- Comprobar y continuar ---------- */
  var OK_TITLES = ["¡Correcto!", "¡Muy bien!", "¡Eso es!", "¡Bien hecho!"];
  function exVocabIds(ex, res) {
    if (ex.type === "pairs") return res.ok ? ex.items.map(function (v) { return v.id; }) : res.pairs.map(function (v) { return v.id; });
    return ex.vocab ? [ex.vocab.id] : [];
  }
  function check() {
    if (!S || !cur || cur.checked || !cur.ready) return;
    var st = cur.st, ex = cur.ex;
    var res = cur.evaluate();
    cur.checked = true;
    cur.res = res;
    if (!st.retry) { S.firstTotal++; if (res.ok) S.firstRight++; }
    if (!res.ok && !st.retry) S.steps.push({ t: "ex", ex: ex, retry: true });
    // Registro por palabra.
    exVocabIds(ex, res).forEach(function (vid) {
      if (S.kind === "review" && !st.retry) S.moved += srsReview(vid, res.ok) > 0 ? 1 : 0;
      else if (!bumpCount(vid, res.ok) && S.kind === "lesson") {
        var p = S.pending[vid] || (S.pending[vid] = { right: 0, wrong: 0 });
        if (res.ok) p.right++; else p.wrong++;
      }
    });
    if (S.kind !== "lesson") save();
    if (res.ok) tone("ok");
    showFeedback(res, ex, st);
  }
  // Audio de una forma maya de la retroalimentación: el de ese texto o, si es la palabra del ejercicio, el de la palabra.
  function fbAudio(form, v) {
    return audioForText(form) || (v && normalize(form) === normalize(v.m) ? audioForVocab(v.id) : null);
  }
  function auPairHTML(a, shown) { return '<span class="au" data-au-key="' + esc(a.key) + '">' + auBtn(a, shown, "md") + auTag(a) + "</span>"; }
  function showFeedback(res, ex, st) {
    var v = ex.vocab, h = "", say = "", ra = null;
    if (res.ok) {
      var title = OK_TITLES[Math.floor(Math.random() * OK_TITLES.length)];
      h += '<p class="fb-title"><span class="fb-icon">' + ICON.check + "</span>" + title + "</p>";
      say = title.replace(/[¡!]/g, "") + ".";
      if (res.accent) { h += '<p class="fb-accent">Ojo con el acento: ' + m(res.matched) + "</p>"; say += " Ojo con el acento: " + res.matched + "."; }
      if (ex.type === "pairs") h += '<p class="fb-extra">Uniste todas las parejas sin errores.</p>';
      if (ex.type === "build" && ex.es) h += '<p class="fb-extra">' + m(ex.m) + " · " + esc(ex.es) + "</p>";
    } else if (ex.type === "pairs") {
      h += '<p class="fb-title"><span class="fb-icon">' + ICON.x + "</span>Casi</p>" +
        '<p class="fb-extra">Te equivocaste ' + res.mistakes + " " + plural(res.mistakes, "vez", "veces") + ". Repasa estas parejas:</p>" +
        res.pairs.map(function (x) { return '<p class="fb-answer">' + m(x.m) + " = " + esc(x.es) + "</p>"; }).join("");
      say = "Casi. Te equivocaste " + res.mistakes + " " + plural(res.mistakes, "vez", "veces") + ".";
    } else {
      h += '<p class="fb-title"><span class="fb-icon">' + ICON.x + "</span>No es correcto</p>";
      if (res.other) {
        h += '<p class="fb-extra">Escribiste ' + m(res.typed) + " («" + esc(res.other.es) + "»); se pedía " + m(res.answer) + (v ? " («" + esc(v.es) + "»)" : "") + ". El acento de tono cambia la palabra.</p>";
      }
      ra = res.lang === "m" ? fbAudio(res.answer, v) : null;
      h += '<p class="fb-label">Respuesta correcta:</p>' +
        (ra ? '<div class="fb-answer-row"><p class="fb-answer m" lang="yua">' + esc(res.answer) + "</p>" + auPairHTML(ra, res.answer) + "</div>"
          : '<p class="fb-answer' + (res.lang === "m" ? ' m" lang="yua"' : '"') + ">" + esc(res.answer) + "</p>");
      say = "No es correcto. Respuesta correcta: " + res.answer + ".";
      if (res.es && (ex.type === "build" || ex.type === "fill")) h += '<p class="fb-extra">' + esc(res.es) + "</p>";
      if (ex.type === "type" && res.typed && !res.other) h += '<p class="fb-extra">Escribiste: ' + m(res.typed) + "</p>";
      if (ex.type === "build" && res.built) h += '<p class="fb-extra">Tu respuesta: ' + m(res.built) + "</p>";
      if (v && ex.type === "choice" && ex.promptLang === "es" && v.m !== res.answer) h += '<p class="fb-extra">' + m(v.m) + " = " + esc(v.es) + "</p>";
    }
    // Para oír la forma maya del ejercicio (si no se ofreció ya junto a la respuesta correcta).
    if (ex.type !== "pairs" && !ra) {
      var form = res.lang === "m" ? res.answer : ex.type === "choice" && ex.promptLang === "m" ? ex.prompt : ex.type === "listen" && v ? v.m : null;
      var fa = form ? fbAudio(form, v) : null;
      if (fa) h += '<div class="fb-listen">' + (ex.type === "listen" ? '<span class="fb-heard">Escuchaste ' + m(form) + " · " + esc(v.es) + "</span>" : m(form)) + auPairHTML(fa, form) + "</div>";
    }
    if (v && ex.type !== "pairs") {
      if (!res.ok && v.pr && (res.lang === "m")) h += '<p class="fb-extra">Se pronuncia aprox. «' + esc(v.pr) + "»</p>";
      if (v.note) h += '<p class="fb-extra">' + markMaya(v.note) + "</p>";
    }
    if (ex.type !== "pairs" && exMedia(ex)) h += "<p>" + confBadge({ conf: "media" }) + "</p>";
    if (!res.ok && !st.retry) h += '<p class="fb-label">La volverás a ver al final.</p>';
    el.fbBody.innerHTML = h;
    el.feedback.classList.toggle("bad", !res.ok);
    el.cont.className = "btn wide " + (res.ok ? "ok" : "bad");
    el.feedback.hidden = false;
    el.actions.hidden = true;
    screen = "feedback";
    setSheetHeight();
    if (res.ok) bumpBar();
    el.cont.focus({ preventScroll: true });
    announce(say);
  }
  // Región viva fuera de la hoja: se anuncia de forma fiable aunque la hoja acabe de aparecer.
  function announce(text) {
    var live = el.live;
    if (!live) return;
    live.textContent = "";
    clearTimeout(announce.t);
    announce.t = setTimeout(function () { live.textContent = text; }, 60);
  }
  function next() {
    if (!S) return;
    S.idx++;
    renderStep();
    var t = $("#step-title");
    if (t && !(cur && cur.input && document.activeElement === cur.input)) t.focus({ preventScroll: true });
  }
  function cont() {
    if (!S || el.feedback.hidden) return;
    next();
  }

  /* ---------- Fin de sesión ---------- */
  // Alta de una palabra en el repaso (la usan las lecciones y los módulos). Devuelve true si es nueva.
  // La lección es la primera calificación de FSRS: «Otra vez» si hubo algún error con la palabra, si no «Bien».
  // Siempre entra en nivel 1 y vence en la fecha dada (la lección pasa mañana).
  function srsEnroll(id, due, p) {
    if (state.srs[id]) return false;
    p = p || {};
    var g = p.wrong > 0 ? 1 : 3, m = FSRS.init(g);
    state.srs[id] = { box: 1, due: due, right: nonNeg(p.right), wrong: nonNeg(p.wrong), s: m.s, d: m.d, last: today(), reps: 1, lapses: 0 };
    FSRS.record(id, g);
    return true;
  }
  function finishSession() {
    var s = S;
    s.done = true;
    cur = null;
    stopAudio();
    var total = s.firstTotal, right = s.firstRight;
    var pct = total ? Math.round(right / total * 100) : 100;
    var xp = 0, newWords = [], h = "";
    goalJustMet = false; graceJustUsed = false;
    if (s.kind === "lesson") {
      var l = s.lesson;
      xp = 10 + right + (total && pct === 100 ? 5 : 0);
      var rec = state.lessons[l.id] || { best: 0, done: false, times: 0 };
      rec.best = Math.max(rec.best, pct); rec.done = true; rec.times++;
      state.lessons[l.id] = rec;
      var tomorrow = addDays(today(), 1);
      l.vocab.forEach(function (v) {
        var p = s.pending[v.id] || { right: 0, wrong: 0 };
        if (!state.srs[v.id]) { srsEnroll(v.id, tomorrow, p); newWords.push(v); }
        else if (state.srs[v.id].box === 0) { state.srs[v.id].box = 1; state.srs[v.id].due = tomorrow; }
      });
    } else {
      xp = right + (total ? 5 : 0);
    }
    addXP(xp);
    save();
    tone("done");
    var info = { kind: s.kind, lesson: s.lesson || null, unit: s.unit || null, pct: pct, right: right, total: total, newWords: newWords };
    modCall("session", info);

    var title, sub;
    if (s.kind === "lesson") {
      title = pct === 100 ? "¡Lección perfecta!" : pct >= 80 ? "¡Muy bien!" : "Lección completada";
      sub = s.lesson.title;
    } else if (s.kind === "review") { title = "Repaso completado"; sub = s.moved ? s.moved + " " + plural(s.moved, "palabra subió", "palabras subieron") + " de nivel" : "Sigue así: la constancia es lo que cuenta."; }
    else if (s.kind === "unit") { title = "Repaso de la unidad"; sub = s.unit ? s.unit.title : ""; }
    else { title = "Práctica completada"; sub = "Practicaste tus palabras más débiles."; }

    var r = 52, c = 2 * Math.PI * r;
    h += '<div class="results"><div class="greca-lit" aria-hidden="true"><div class="greca dim"></div><div class="greca glow"></div></div>' +
      '<div class="results-head"><h1 id="step-title" tabindex="-1">' + esc(title) + "</h1>" + (sub ? '<p class="muted">' + esc(sub) + "</p>" : "") + "</div>" +
      '<div class="score-ring" role="img" aria-label="' + pct + ' por ciento de aciertos"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="track" cx="60" cy="60" r="' + r + '"/>' +
      '<circle class="val" id="score-val" cx="60" cy="60" r="' + r + '" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + c.toFixed(1) + '"/></svg>' +
      '<div class="center"><span class="pct num">' + pct + '<small>%</small></span><span class="pct-label">aciertos</span></div></div>' +
      '<div class="res-stats"><div class="res-stat xp gami"><span class="v num">+' + xp + '</span><span class="l">XP</span></div>' +
      '<div class="res-stat"><span class="v num">' + right + "/" + total + '</span><span class="l">Aciertos</span></div>' +
      (s.kind === "lesson" ? '<div class="res-stat"><span class="v num">' + newWords.length + '</span><span class="l">' + plural(newWords.length, "Palabra nueva", "Nuevas") + "</span></div>"
        : '<div class="res-stat gami"><span class="v num">' + currentStreak() + '</span><span class="l">Racha</span></div>') + "</div>";
    if (goalJustMet) h += '<p class="goal-banner gami">' + ICON.sun + "Cumpliste tu meta de hoy: " + state.goal + " XP</p>";
    if (graceJustUsed) h += '<p class="goal-banner grace-note gami">' + ICON.sun + "Usaste tu día de gracia de esta semana</p>";
    if (s.kind === "lesson" && s.lesson.vocab.length) {
      h += '<div class="section"><h2>' + (newWords.length ? "Palabras que aprendiste" : "Palabras que repasaste") + "</h2>" +
        '<div class="word-chips">' + s.lesson.vocab.map(function (v) { return '<span class="word-chip m" lang="yua">' + esc(v.m) + "</span>"; }).join("") + "</div>" +
        (newWords.length ? '<p class="muted">Aparecerán en Repasar a partir de mañana.</p>' : "") + "</div>";
    }
    h += modHTML("results", info);
    h += '<div class="results-actions">';
    if (s.kind === "lesson") {
      var after = COURSE.lessons[s.lesson.order + 1];
      h += after
        ? '<button class="btn primary wide" type="button" id="btn-results-next">Continuar</button>' +
          '<button class="btn ghost wide" type="button" id="btn-results-repeat">Repetir</button>' +
          '<button class="btn text" type="button" id="btn-results-home">Ir al inicio</button>'
        : '<button class="btn primary wide" type="button" id="btn-results-home">Volver al inicio</button>' +
          '<button class="btn ghost wide" type="button" id="btn-results-repeat">Repetir</button>';
    } else {
      h += '<button class="btn primary wide" type="button" id="btn-results-home">Listo</button>' +
        '<button class="btn ghost wide" type="button" id="btn-results-repeat">Otra ronda</button>';
    }
    h += "</div></div>";

    el.feedback.hidden = true;
    el.actions.hidden = true;
    el.fill.style.width = "100%";
    el.progress.setAttribute("aria-valuenow", "100");
    el.count.textContent = "";
    el.body.innerHTML = h;
    screen = "results";
    setSheetHeight();
    document.body.style.setProperty("--sheet-h", "0px");
    window.scrollTo(0, 0);
    requestAnimationFrame(function () {
      var sv = $("#score-val");
      if (sv) sv.style.strokeDashoffset = (c * (1 - pct / 100)).toFixed(1);
    });
    var kind = s.kind, lesson = s.lesson, unit = s.unit;
    var bn = $("#btn-results-next");
    if (bn) bn.addEventListener("click", function () {
      var after = COURSE.lessons[lesson.order + 1];
      if (after) startLesson(after); else histPop(function () { showTab("aprender"); });
    });
    var bh = $("#btn-results-home");
    if (bh) bh.addEventListener("click", function () {
      histPop(function () { showTab(kind === "lesson" ? "aprender" : kind === "unit" ? "aprender" : "repasar", kind === "unit" && unit ? { scrollTo: "unit-" + unit.id } : null); });
    });
    $("#btn-results-repeat").addEventListener("click", function () {
      if (kind === "lesson") startLesson(lesson);
      else if (kind === "unit" && unit) startUnitReview(unit);
      else startReview();
    });
    var t = $("#step-title"); if (t) t.focus({ preventScroll: true });
  }

  /* ---------- Salir ---------- */
  function askExit() {
    if (!S) return;
    if (S.done) { leaveSession(); return; }
    var isLesson = S.kind === "lesson";
    $("#confirm-title").textContent = isLesson ? "¿Salir de la lección?" : "¿Salir del repaso?";
    $("#confirm-text").textContent = isLesson
      ? "Perderás el avance de esta lección. Lo que ya completaste antes se queda guardado."
      : "Los aciertos que ya diste en este repaso se quedan guardados.";
    el.confirm.hidden = false;
    document.body.classList.add("locked");
    confirmPrev = screen;
    screen = "confirm";
    $("#btn-confirm-stay").focus();
  }
  var confirmPrev = null;
  function closeConfirm() {
    el.confirm.hidden = true;
    document.body.classList.remove("locked");
    screen = confirmPrev || screen;
    if (!el.feedback.hidden) el.cont.focus(); else el.close.focus();
  }
  function leaveSession(fromPop) {
    var s = S;
    el.confirm.hidden = true;
    document.body.classList.remove("locked");
    var target = s && s.kind !== "lesson" && s.kind !== "unit" ? "repasar" : "aprender";
    if (s && s.kind !== "lesson") save();
    if (fromPop) showTab(target); else histPop(function () { showTab(target); });
  }
  el.close.addEventListener("click", askExit);

  /* ---------- Historial: el botón Atrás de Android ---------- */
  // La sesión y la hoja de lección empujan una entrada (misma URL). Atrás la quita: en una
  // lección abierta pide confirmar la salida, en la hoja o el diálogo los cierra.
  var histPending = null;
  function histState() { try { return history.state && history.state.koox || null; } catch (e) { return null; } }
  function histPush(kind) {
    try {
      if (histState()) history.replaceState({ koox: kind }, "");
      else history.pushState({ koox: kind }, "");
    } catch (e) { /* marco sin historial */ }
  }
  function histPop(cb) {
    if (!histState()) { cb(); return; }
    var done = false;
    var run = function () { if (done) return; done = true; histPending = null; cb(); };
    histPending = run;
    try { history.back(); } catch (e) { run(); return; }
    setTimeout(run, 400);
  }
  window.addEventListener("popstate", function () {
    if (histPending) { histPending(); return; }
    if (!el.confirm.hidden) { closeConfirm(); histPush("s"); return; }
    if (!el.lessonSheet.hidden) { closeLessonSheet(false, "pop"); return; }
    if (S) {
      if (S.done) { leaveSession(true); return; }
      histPush("s");
      askExit();
    }
  });
  el.next.addEventListener("click", function () { if (S && !cur) next(); });
  el.check.addEventListener("click", check);
  el.cont.addEventListener("click", cont);
  $("#btn-confirm-exit").addEventListener("click", leaveSession);
  $$("[data-confirm-stay]").forEach(function (b) { b.addEventListener("click", closeConfirm); });

  /* ================= Repasar ================= */
  function renderReview() {
    var v = el.review, entries = srsEntries(), due = dueList();
    var h = '<header class="page-head"><p class="eyebrow">Repetición espaciada</p><h1 id="review-title">Repasar</h1></header>';
    if (!COURSE.vocab.length) {
      v.innerHTML = h + '<div class="card empty-state"><h2>Sin palabras todavía</h2><p class="muted">Cuando el curso tenga lecciones, sus palabras aparecerán aquí para repasar.</p></div>';
      return;
    }
    h += '<div class="card review-hero">';
    if (due.length) {
      h += '<div class="review-big"><span class="n num">' + due.length + '</span><span>' + plural(due.length, "palabra para repasar hoy", "palabras para repasar hoy") + "</span></div>" +
        '<p class="muted">Una sesión toma hasta ' + Math.min(15, due.length) + " " + plural(Math.min(15, due.length), "pregunta", "preguntas") + ". Las que aciertes volverán más adelante.</p>" +
        '<button class="btn primary wide" type="button" id="btn-start-review">Empezar repaso</button>';
    } else if (entries.length) {
      var nextDue = entries.map(function (e) { return e.r.due; }).sort()[0];
      var nCount = entries.filter(function (e) { return e.r.due === nextDue; }).length;
      var dd = daysFrom(today(), nextDue);
      h += '<div class="review-big"><span class="n num">0</span><span>pendientes por hoy</span></div>' +
        '<p class="muted">Próximo repaso ' + (dd <= 1 ? "mañana" : "en " + dd + " días") + ": " + nCount + " " + plural(nCount, "palabra", "palabras") + ". Mientras tanto, puedes practicar tus palabras más débiles.</p>" +
        '<button class="btn primary wide" type="button" id="btn-start-review">Práctica libre</button>';
    } else {
      h += '<h2>Aún no hay palabras para repasar</h2><p class="muted">Al completar una lección, sus palabras entran aquí y te las preguntaremos a partir del día siguiente.</p>' +
        '<button class="btn primary wide" type="button" id="btn-start-review" disabled>Empezar repaso</button>';
    }
    h += "</div>";
    var counts = [0, 0, 0, 0, 0];
    entries.forEach(function (e) { counts[clamp(e.r.box, 1, 5) - 1]++; });
    var max = Math.max.apply(null, counts.concat([1]));
    h += '<section class="section" aria-labelledby="levels-title"><h2 id="levels-title">Niveles</h2><div class="levels">' +
      counts.map(function (n, i) {
        return '<div class="level"><span class="level-n num">' + n + '</span><div class="level-bar" aria-hidden="true"><span style="height:' + Math.round(n / max * 100) + '%"></span></div>' +
          '<span class="level-l">Nivel ' + (i + 1) + "<br>" + INTERVALS[i + 1] + " " + plural(INTERVALS[i + 1], "día", "días") + "</span></div>";
      }).join("") + "</div>" +
      '<p class="levels-foot">' + entries.length + " " + plural(entries.length, "palabra estudiada", "palabras estudiadas") + " de " + COURSE.vocab.length + " del curso.</p>" +
      '<p class="how">' + (state.settings.scheduler === "leitner"
        ? "Cada acierto sube la palabra un nivel y la aleja en el tiempo. Un error la regresa al nivel 1 para verla de nuevo mañana."
        : "Cada acierto aleja la palabra en el tiempo y la sube de nivel. Un error la acerca: la verás de nuevo pronto.") + "</p></section>";
    var hard = entries.filter(function (e) { return e.r.wrong > 0; }).sort(function (a, b) { return b.r.wrong - a.r.wrong || (b.r.wrong - b.r.right) - (a.r.wrong - a.r.right); }).slice(0, 8);
    h += '<section class="section" aria-labelledby="hard-title"><h2 id="hard-title">Palabras difíciles</h2>';
    if (hard.length) {
      h += '<ul class="hard-list">' + hard.map(function (e) {
        return "<li>" + m(e.v.m) + '<span class="es">' + esc(e.v.es) + '</span><span class="cnt num">' + e.r.wrong + " " + plural(e.r.wrong, "error", "errores") + "</span></li>";
      }).join("") + "</ul>";
    } else h += '<p class="muted">Aún no hay palabras difíciles. Las que más falles aparecerán aquí.</p>';
    h += "</section>";
    v.innerHTML = h;
    var b = $("#btn-start-review");
    if (b) b.addEventListener("click", startReview);
  }

  /* ================= Diccionario ================= */
  var dictUnit = "all";
  function guideHTML() {
    var fonemas = false, synth = false;
    var cards = COURSE.guide.map(function (g) {
      // Junto a la letra, su sonido de referencia (o, si no hay, una grabación nativa); junto al ejemplo, la
      // palabra, y debajo las grabaciones nativas de otras palabras con esa letra (ver guideAudio).
      var ga = guideAudio(g), xa = ga.ex, la = ga.letters.length === 1 && !ga.multi ? ga.letters[0].a : null;
      ga.letters.concat(xa ? [{ a: xa }] : []).forEach(function (x) {
        if (x.a.kind === "fonema") fonemas = true;
        if (x.a.kind === "sintetico") synth = true;
      });
      var tag = "";
      if (ga.multi) {
        // Varias letras: una sola etiqueta por tipo, con la transcripción de cada sonido.
        var kinds = {}, ipas = [];
        ga.letters.forEach(function (x) { kinds[x.a.kind] = 1; if (x.a.kind === "fonema" && x.a.ipa) ipas.push(x.a.ipa); });
        tag = '<span class="l-au">' + Object.keys(kinds).map(function (k) {
          return '<span class="au-kind ' + k + '">' + esc(AU_KIND[k].label) + (k === "fonema" && ipas.length ? ' <span class="ipa">' + esc(ipas.join(" ")) + "</span>" : "") + "</span>";
        }).join("") + (kinds.fonema ? '<span class="l-au-n">Sonidos aislados, no palabras mayas</span>' : "") + "</span>";
      } else if (la) {
        tag = '<span class="l-au">' + auTag(la) +
          (la.kind === "fonema" ? '<span class="l-au-n" data-au-key="' + esc(la.key) + '">Sonido aislado, no una palabra maya</span>'
            : normalize(la.text) !== normalize(g.l) ? '<span class="l-au-n" data-au-key="' + esc(la.key) + '">Se oye «' + esc(la.text) + "»</span>" : "") + "</span>";
      }
      return '<div class="letter' + (ga.letters.length ? " has-au" : "") + (ga.multi ? " multi" : "") + '"><div class="l-top"><span class="l m" lang="yua">' + esc(g.l) + "</span>" + (la ? auBtn(la, g.l, "md") : "") + "</div>" +
        (ga.multi ? '<div class="l-multi">' + ga.letters.map(function (x) { return auLetterBtn(x.a, x.l); }).join("") + "</div>" : "") +
        '<span class="d">' + markMaya(g.desc) + "</span>" + tag +
        (g.ex ? '<span class="x">' + m(g.ex.m) + (xa ? auBtn(xa, g.ex.m, "sm") : "") + (g.ex.es ? " · " + esc(g.ex.es) : "") + "</span>" : "") +
        ga.more.map(function (a) {
          return '<span class="x x-nat" data-au-key="' + esc(a.key) + '">' + esc(AU_KIND.nativo.label) + ": " + m(a.text) + auBtn(a, a.text, "sm") + "</span>";
        }).join("") + "</div>";
    }).join("");
    return '<details class="guide-box" id="guide"><summary><span class="gs-t">' + ICON.book + "Guía de pronunciación</span>" +
      '<span class="gs-s">' + COURSE.guide.length + " letras</span></summary>" +
      '<p class="muted">El alfabeto normativo de 2014. Casi todo se lee como en español; estas son las diferencias.</p>' +
      (fonemas ? '<p class="au-note">' + ICON.speaker.replace("<svg", '<svg class="ico"') + "<span>«Sonido de referencia (AFI)» es el sonido aislado, como lo describe el Alfabeto Fonético Internacional: no es una palabra maya ni la voz de un hablante.</span></p>" : "") +
      (synth || (hasKind("sintetico") && state.settings.synth !== false) ? '<p class="au-note synth-note">' + ICON.speaker.replace("<svg", '<svg class="ico"') + "<span>" + esc(SYNTH_NOTE) + "</span></p>" : "") +
      '<div class="alphabet">' + cards + "</div></details>";
  }
  function openGuide() {
    showTab("diccionario");
    var d = $("#guide");
    if (!d) return;
    d.open = true;
    d.scrollIntoView({ block: "start" });
    var sm = $("summary", d); if (sm) sm.focus({ preventScroll: true });
  }
  var guideSig = "";
  function renderDict() {
    var gw = $("#dict-guide");
    // La guía se vuelve a armar si cambió qué audio se puede ofrecer (ajuste o audio que falló).
    var sig = String(state.settings.synth !== false) + Object.keys(AU.failed).length;
    if (gw && COURSE.guide.length && (!gw.childElementCount || sig !== guideSig)) {
      var was = $("#guide", gw), open = !!(was && was.open);
      gw.innerHTML = guideHTML();
      if (open) $("#guide", gw).open = true;
      guideSig = sig;
    }
    if (!el.dictUnits.childElementCount) {
      el.dictUnits.innerHTML = '<button class="chip" type="button" id="dict-u-all" data-u="all" aria-pressed="true">Todas</button>' +
        COURSE.units.map(function (u) {
          return '<button class="chip" type="button" id="dict-u-' + esc(u.id) + '" data-u="' + esc(u.id) + '" aria-pressed="false">' + u.n + " · " + esc(u.title) + "</button>";
        }).join("");
      $$(".chip", el.dictUnits).forEach(function (c) {
        c.addEventListener("click", function () {
          dictUnit = c.getAttribute("data-u");
          $$(".chip", el.dictUnits).forEach(function (x) { x.setAttribute("aria-pressed", String(x === c)); });
          renderDictResults();
        });
      });
    }
    renderDictResults();
  }
  function dictMatches(q, unitId) {
    var k = searchKey(q);
    var list = COURSE.vocab.filter(function (v) { return unitId === "all" || v.unit.id === unitId; });
    if (!k) return list;
    var scored = [];
    list.forEach(function (v, i) {
      var best = 9;
      var keys = v.km.concat([v.kes], v.kes.split(/\s+/));
      keys.forEach(function (key) {
        if (!key) return;
        var s = key === k ? 0 : key.indexOf(k) === 0 ? 1 : (" " + key).indexOf(" " + k) >= 0 ? 2 : key.indexOf(k) >= 0 ? 3 : 9;
        if (s < best) best = s;
      });
      if (best < 9) scored.push({ v: v, s: best, i: i });
    });
    scored.sort(function (a, b) { return a.s - b.s || a.i - b.i; });
    return scored.map(function (x) { return x.v; });
  }
  function levelDots(v) {
    var r = state.srs[v.id];
    if (!r) return "<span>Aún no estudiada</span>";
    var b = clamp(r.box, 1, 5), d = "";
    for (var i = 1; i <= 5; i++) d += "<i" + (i <= b ? ' class="on"' : "") + "></i>";
    return '<span class="dots" role="img" aria-label="Nivel ' + b + ' de 5">' + d + "</span><span>Nivel " + b + "</span>";
  }
  function renderDictResults() {
    var q = el.dictQ.value || "";
    var list = dictMatches(q, dictUnit);
    var fu = dictUnit === "all" ? null : COURSE.units.filter(function (u) { return u.id === dictUnit; })[0];
    var inUnit = fu ? " en la unidad " + fu.n : "";
    el.dictCount.textContent = list.length + " " + plural(list.length, "palabra", "palabras") + inUnit + (searchKey(q) ? " para «" + q.trim() + "»" : "");
    if (!COURSE.vocab.length) { el.dictList.innerHTML = '<li class="dict-empty">El diccionario se llenará cuando el curso tenga lecciones.</li>'; return; }
    if (!list.length) {
      el.dictList.innerHTML = '<li class="dict-empty"><p>Sin resultados' + (searchKey(q) ? " para «" + esc(q.trim()) + "»" : "") + esc(inUnit) + ". El diccionario solo incluye las " +
        COURSE.vocab.length + " palabras del curso.</p>" + (fu ? '<button class="btn tonal" type="button" id="dict-all-units">Buscar en todas las unidades</button>' : "") + "</li>";
      var au = $("#dict-all-units");
      if (au) au.addEventListener("click", function () {
        dictUnit = "all";
        $$(".chip", el.dictUnits).forEach(function (x) { x.setAttribute("aria-pressed", String(x.getAttribute("data-u") === "all")); });
        renderDictResults();
        el.dictQ.focus();
      });
      return;
    }
    el.dictList.innerHTML = list.slice(0, 300).map(function (v) {
      var a = audioForVocab(v.id);
      return '<li class="entry"><div class="entry-top">' + m(v.m) + (a ? auBtn(a, v.m, "md") : "") + '<span class="es">' + esc(v.es) + "</span>" + confBadge(v) + "</div>" +
        (v.pr ? '<p class="pr">Se pronuncia aprox. «' + esc(v.pr) + "»</p>" : "") +
        (v.alt.length ? '<p class="pr">También se escribe: ' + v.alt.map(function (a) { return m(a); }).join(", ") + "</p>" : "") +
        (v.note ? '<p class="note">' + markMaya(v.note) + "</p>" : "") +
        (v.ex ? '<p class="entry-ex">' + m(v.ex.m) + " · " + esc(v.ex.es) + "</p>" : "") +
        '<div class="entry-meta"><span>Unidad ' + v.unit.n + " · " + markMaya(v.lesson.title) + "</span>" + levelDots(v) + (a ? auTag(a) : "") + "</div></li>";
    }).join("");
  }
  var dictClear = $("#dict-clear");
  el.dictQ.addEventListener("input", function () {
    if (dictClear) dictClear.hidden = !el.dictQ.value;
    renderDictResults();
  });
  if (dictClear) dictClear.addEventListener("click", function () {
    el.dictQ.value = "";
    dictClear.hidden = true;
    renderDictResults();
    el.dictQ.focus();
  });
  $("#dict-form").addEventListener("submit", function (e) { e.preventDefault(); el.dictQ.blur(); });

  /* ================= Copia de seguridad ================= */
  // El avance vive solo en este navegador (localStorage). La copia es el estado completo, como archivo .json
  // (solo en el sitio instalable: claude.ai bloquea las descargas) o como «código» de texto para pegar:
  //   KOOX1.<base64url(gzip(JSON))>     si el navegador tiene CompressionStream
  //   KOOX0.<base64url(JSON en UTF-8)>  si no
  // Al importar, el JSON se valida y se sanea con sanitizeState (el mismo saneo que loadState), se muestra
  // un resumen y se pide confirmar dentro de la página; hasta entonces el avance actual no se toca.
  var BACKUP_MAX = 4 * 1024 * 1024; // tope del JSON que se acepta al importar (ya descomprimido)
  var CODE_BAD = "El código está incompleto o dañado. Cópialo otra vez completo: empieza con KOOX1. o KOOX0.";
  var NOT_BACKUP = "Eso no parece una copia de Ko'ox Maaya. El código empieza con KOOX1. o KOOX0., y el archivo es un .json exportado desde Perfil.";
  var TOO_BIG = "Eso es demasiado grande para ser una copia de Ko'ox Maaya.";
  var pendingImport = null;
  function bad(msg) { return Promise.reject({ backupMsg: msg }); }
  function backupJSON() {
    var o = { app: "koox-maaya", exported: today() }, s = JSON.parse(JSON.stringify(state));
    Object.keys(s).forEach(function (k) { o[k] = s[k]; });
    return JSON.stringify(o);
  }
  function toB64u(bytes) {
    var bin = "";
    for (var i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function fromB64u(s) {
    if (!/^[A-Za-z0-9_-]+$/.test(s)) throw new Error("base64");
    var bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function fromUtf8(bytes) { return new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
  // Pasa bytes por un CompressionStream o DecompressionStream y junta lo que sale (con tope de tamaño).
  function pipeBytes(bytes, transform, max) {
    var w = transform.writable.getWriter(), r = transform.readable.getReader(), parts = [], total = 0;
    w.write(bytes).catch(function () {});
    w.close().catch(function () {});
    function pump() {
      return r.read().then(function (x) {
        if (x.done) {
          var out = new Uint8Array(total), at = 0;
          parts.forEach(function (p) { out.set(p, at); at += p.length; });
          return out;
        }
        total += x.value.length;
        if (max && total > max) { r.cancel().catch(function () {}); throw new Error("grande"); }
        parts.push(x.value);
        return pump();
      });
    }
    return pump();
  }
  // El código de la copia (promesa de texto). Si gzip falla en este navegador, usa KOOX0.
  function makeCode() {
    var bytes = new TextEncoder().encode(backupJSON());
    var plain = function () { return "KOOX0." + toB64u(bytes); };
    if (typeof CompressionStream !== "function") return Promise.resolve(plain());
    try { return pipeBytes(bytes, new CompressionStream("gzip")).then(function (z) { return "KOOX1." + toB64u(z); }, plain); }
    catch (e) { return Promise.resolve(plain()); }
  }
  function backupProblem(o) {
    if (!isObj(o)) return NOT_BACKUP;
    if (o.app != null && o.app !== "koox-maaya") return "Esa copia es de otra aplicación, no de Ko'ox Maaya.";
    if (typeof o.v === "number" && o.v > 2) return "Esa copia es de una versión más nueva de Ko'ox Maaya. Actualiza la app y vuelve a intentarlo.";
    if (o.v !== 2 || !isObj(o.lessons) || !isObj(o.srs)) return NOT_BACKUP;
    return "";
  }
  // Lee un código KOOX1./KOOX0. o el JSON de un archivo. Devuelve (promesa) { state, exported } con el estado
  // ya saneado; si algo está mal la promesa se rechaza con { backupMsg } (un mensaje claro para la persona).
  function readBackup(text) {
    var raw = String(text == null ? "" : text).trim(), code = raw.replace(/\s+/g, ""), m = /^KOOX([01])\./i.exec(code), json;
    if (!raw) return bad("Elige el archivo de tu copia o pega aquí el código.");
    if (raw.length > BACKUP_MAX * 2) return bad(TOO_BIG);
    if (m) {
      var bytes;
      try { bytes = fromB64u(code.slice(6)); } catch (e) { return bad(CODE_BAD); }
      if (m[1] === "0") {
        try { json = Promise.resolve(fromUtf8(bytes)); } catch (e) { return bad(CODE_BAD); }
      } else {
        if (typeof DecompressionStream !== "function") return bad("Este navegador no puede leer códigos KOOX1 (comprimidos). Usa el archivo .json, o genera el código desde un navegador más reciente.");
        try {
          json = pipeBytes(bytes, new DecompressionStream("gzip"), BACKUP_MAX).then(fromUtf8).catch(function (e) {
            throw { backupMsg: e && e.message === "grande" ? TOO_BIG : CODE_BAD };
          });
        } catch (e) { return bad(CODE_BAD); }
      }
    } else if (raw.charAt(0) === "{") json = Promise.resolve(raw);
    else return bad(NOT_BACKUP);
    return json.then(function (t) {
      var o;
      try { o = JSON.parse(t); } catch (e) { throw { backupMsg: m ? CODE_BAD : "Ese archivo no se puede leer: no es una copia completa de Ko'ox Maaya." }; }
      var why = backupProblem(o);
      if (why) throw { backupMsg: why };
      return { state: sanitizeState(o), exported: isDay(o.exported) ? o.exported : null };
    });
  }
  function backupSummary(st) {
    return {
      lessons: COURSE.lessons.filter(function (l) { return st.lessons[l.id] && st.lessons[l.id].done; }).length, total: COURSE.lessons.length,
      words: Object.keys(st.srs).filter(function (id) { return COURSE.vocabById[id]; }).length, days: st.daysTotal
    };
  }
  function downloadText(name, text) {
    var url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    var a = document.createElement("a");
    a.href = url; a.download = name; a.rel = "noopener"; a.hidden = true;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { if (a.parentNode) a.parentNode.removeChild(a); URL.revokeObjectURL(url); }, 1500);
  }
  function backupSectionHTML() {
    var share = typeof navigator.share === "function";
    return '<section class="section" aria-labelledby="backup-title"><h2 id="backup-title">Copia de seguridad</h2>' +
      '<p class="muted">Tu avance vive solo en este navegador. Exporta una copia de vez en cuando: te sirve para no perderlo y para pasarlo entre el sitio y claude.ai.</p>' +
      '<div class="btn-row"><button class="btn tonal" type="button" id="btn-export">Exportar</button>' +
      '<button class="btn tonal" type="button" id="btn-copy">Copiar código</button>' +
      (share ? '<button class="btn tonal" type="button" id="btn-share">Compartir</button>' : "") + "</div>" +
      '<textarea class="code-box" id="backup-out" rows="4" readonly hidden spellcheck="false" aria-label="Código de tu copia de seguridad"></textarea>' +
      '<h3 class="backup-sub">Importar</h3>' +
      '<p class="muted">Elige el archivo .json de una copia o pega su código. Antes de reemplazar tu avance verás un resumen y tendrás que confirmar.</p>' +
      '<div class="file-pick"><input class="sr-only" type="file" id="backup-file" accept=".json,application/json"><label class="btn ghost" for="backup-file">Elegir archivo .json</label></div>' +
      '<label class="sr-only" for="backup-paste">Código de la copia de seguridad</label>' +
      '<textarea class="code-box" id="backup-paste" rows="3" placeholder="Pega aquí el código (empieza con KOOX1.)" spellcheck="false" autocomplete="off" autocapitalize="off" autocorrect="off"></textarea>' +
      '<div class="btn-row"><button class="btn tonal" type="button" id="btn-import">Importar</button></div>' +
      '<div class="backup-confirm" id="backup-confirm" tabindex="-1" hidden></div>' +
      '<p class="backup-msg" id="backup-msg" tabindex="-1" role="status" aria-live="polite"></p></section>';
  }
  function backupSay(msg, isErr) {
    var p = $("#backup-msg");
    if (!p) return;
    p.textContent = msg;
    p.classList.toggle("err", !!isErr);
  }
  function showCode(code) {
    var box = $("#backup-out");
    if (!box) return;
    box.value = code; box.hidden = false;
    try { box.focus(); box.select(); box.setSelectionRange(0, box.value.length); } catch (e) { /* sin efecto */ }
  }
  function bindBackup() {
    var COPIED = "Código copiado. Guárdalo donde quieras (por ejemplo, en tus notas) y pégalo en «Importar» cuando lo necesites.";
    $("#btn-export").addEventListener("click", function () {
      if (window.KOOX_STANDALONE === true) {
        var name = "koox-maaya-progreso-" + today() + ".json";
        try { downloadText(name, backupJSON()); backupSay("Se guardó «" + name + "» en tus descargas. Guárdalo en un lugar seguro."); }
        catch (e) { backupSay("No se pudo guardar el archivo. Prueba con «Copiar código».", true); }
        return;
      }
      // En claude.ai las descargas están bloqueadas: la copia es solo el código.
      makeCode().then(function (code) {
        showCode(code);
        backupSay("Este es el código de tu avance. Cópialo y guárdalo; pégalo en «Importar» donde quieras recuperarlo.");
      }, function () { backupSay("No se pudo preparar la copia.", true); });
    });
    $("#btn-copy").addEventListener("click", function () {
      makeCode().then(function (code) {
        var done = function (copied) {
          if (copied) { backupSay(COPIED); return; }
          showCode(code); // respaldo: el código queda visible y seleccionado
          var legacy = false;
          try { legacy = document.execCommand("copy"); } catch (e) { legacy = false; }
          backupSay(legacy ? COPIED : "No se pudo copiar solo. El código quedó seleccionado: cópialo con el menú de tu teclado o del navegador.");
        };
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(function () { done(true); }, function () { done(false); });
          else done(false);
        } catch (e) { done(false); }
      }, function () { backupSay("No se pudo preparar la copia.", true); });
    });
    var sh = $("#btn-share");
    if (sh) sh.addEventListener("click", function () {
      backupSay("");
      var file = null;
      try { file = new File([backupJSON()], "koox-maaya-progreso-" + today() + ".json", { type: "application/json" }); } catch (e) { file = null; }
      var fail = function (e) { if (!(e && e.name === "AbortError")) backupSay("No se pudo compartir desde aquí. Usa «Copiar código».", true); };
      var send = function (data) {
        try { navigator.share(data).then(function () { backupSay("Listo, compartido."); }, fail); } catch (e) { fail(e); }
      };
      var withFile = false;
      try { withFile = !!(file && navigator.canShare && navigator.canShare({ files: [file] })); } catch (e) { withFile = false; }
      if (withFile) send({ title: "Mi avance en Ko'ox Maaya", text: "Copia de seguridad de mi avance en Ko'ox Maaya.", files: [file] });
      else makeCode().then(function (code) { send({ title: "Mi avance en Ko'ox Maaya", text: code }); }, fail);
    });

    // Importar: archivo .json o código pegado. Nada cambia hasta que la persona confirma.
    var paste = $("#backup-paste"), box = $("#backup-confirm");
    function closeConfirm() { pendingImport = null; box.hidden = true; box.innerHTML = ""; }
    function askReplace(res) {
      pendingImport = res.state;
      var sm = backupSummary(res.state), empty = !sm.lessons && !sm.words && !sm.days && !res.state.xp;
      box.innerHTML = "<p><strong>Encontramos esta copia" + (res.exported ? " (del " + esc(res.exported) + ")" : "") + ":</strong></p>" +
        "<ul><li>Lecciones completadas: " + sm.lessons + " de " + sm.total + "</li>" +
        "<li>Palabras en repaso: " + sm.words + "</li>" +
        "<li>Días con maya: " + sm.days + "</li></ul>" +
        "<p>" + (empty ? "La copia está vacía: si continúas, tu avance quedará en blanco." : "Si continúas, esta copia reemplaza el avance que tienes ahora en este navegador.") + " No se puede deshacer.</p>" +
        '<div class="btn-row"><button class="btn primary" type="button" id="btn-import-ok">Reemplazar mi avance</button>' +
        '<button class="btn ghost" type="button" id="btn-import-cancel">Cancelar</button></div>';
      box.hidden = false;
      backupSay("");
      $("#btn-import-ok").addEventListener("click", function () {
        if (!pendingImport) return;
        state = pendingImport;
        pendingImport = null;
        save(); applyCalm(); updateBadge();
        renderProfile();
        backupSay("Listo: tu avance se reemplazó con la copia.");
        var msg = $("#backup-msg"); if (msg) msg.focus({ preventScroll: true });
        toast("Avance importado");
      });
      $("#btn-import-cancel").addEventListener("click", function () {
        closeConfirm();
        paste.value = "";
        backupSay("Importación cancelada. Tu avance no cambió.");
        var msg = $("#backup-msg"); if (msg) msg.focus({ preventScroll: true });
      });
      try { box.focus({ preventScroll: true }); box.scrollIntoView({ block: "nearest" }); } catch (e) { /* sin efecto */ }
    }
    function review(text) {
      closeConfirm();
      backupSay("");
      readBackup(text).then(askReplace, function (e) {
        backupSay((e && e.backupMsg) || "No se pudo leer la copia.", true);
      });
    }
    $("#btn-import").addEventListener("click", function () { review(paste.value); });
    paste.addEventListener("input", function () { if (!box.hidden) closeConfirm(); });
    var fileIn = $("#backup-file");
    fileIn.addEventListener("change", function () {
      var f = fileIn.files && fileIn.files[0];
      if (!f) return;
      if (f.size > BACKUP_MAX * 2) { fileIn.value = ""; closeConfirm(); backupSay(TOO_BIG, true); return; }
      var rd = new FileReader();
      rd.onload = function () { fileIn.value = ""; review(String(rd.result)); };
      rd.onerror = function () { fileIn.value = ""; backupSay("No se pudo leer el archivo.", true); };
      rd.readAsText(f);
    });
  }

  /* ================= Perfil ================= */
  var DOW = ["D", "L", "M", "M", "J", "V", "S"];
  function renderProfile() {
    var v = el.profile, entries = srsEntries();
    var doneN = COURSE.lessons.filter(lessonDone).length;
    var strong = entries.filter(function (e) { return e.r.box >= 4; }).length;
    var h = '<header class="page-head"><p class="eyebrow">Tu avance</p><h1 id="profile-title">Perfil</h1></header>';
    h += '<div class="stats-grid">' +
      '<div class="stat wide gami" id="stat-days"><span class="v num">' + state.daysTotal + '</span><span class="l">Días con maya</span><span class="s">Cada día que practicas suma, y este total nunca baja.</span></div>' +
      '<div class="stat gami" id="stat-streak"><span class="v num">' + currentStreak() + '</span><span class="l">Racha actual</span><span class="s">Mejor racha: ' + state.streak.best + " " + plural(state.streak.best, "día", "días") + "</span></div>" +
      '<div class="stat gami" id="stat-xp"><span class="v num">' + state.xp + '</span><span class="l">XP total</span></div>' +
      '<div class="stat"><span class="v num">' + entries.length + '</span><span class="l">Palabras aprendidas</span><span class="s">' + strong + " en nivel 4 o más</span></div>" +
      '<div class="stat"><span class="v num">' + doneN + '<small class="muted"> / ' + COURSE.lessons.length + '</small></span><span class="l">Lecciones completadas</span></div></div>';
    var t = today(), days = "";
    for (var i = 6; i >= 0; i--) {
      var k = addDays(t, -i), x = state.xpByDay[k] || 0, d = parseDay(k);
      days += '<div class="day' + (x >= state.goal ? " met" : x > 0 ? " some" : "") + (i === 0 ? " today" : "") + '"><i class="num">' + (x || "") + "</i>" + DOW[d.getDay()] + "</div>";
    }
    h += '<section class="section gami" aria-labelledby="week-title"><h2 id="week-title">Últimos 7 días</h2><div class="week" role="img" aria-label="XP de los últimos siete días">' + days + "</div></section>";
    h += '<section class="section" aria-labelledby="settings-title"><h2 id="settings-title">Ajustes</h2><div class="settings">' +
      '<div class="setting gami"><label class="setting-txt" for="goal">Meta diaria<small>XP que quieres ganar cada día</small></label><select id="goal">' +
      GOALS.map(function (g) { return '<option value="' + g + '"' + (g === state.goal ? " selected" : "") + ">" + g + " XP</option>"; }).join("") + "</select></div>" +
      '<label class="setting" for="calm"><span class="setting-txt">Modo tranquilo<small>Oculta XP, racha y metas</small></span><input class="switch" type="checkbox" role="switch" id="calm"' + (state.settings.calm ? " checked" : "") + "></label>" +
      '<label class="setting" for="sound"><span class="setting-txt">Sonido de aciertos<small>Tonos cortos y suaves</small></span><input class="switch" type="checkbox" role="switch" id="sound"' + (state.settings.sound ? " checked" : "") + "></label>" +
      (AU.list.length ? '<label class="setting" for="au-auto"><span class="setting-txt">Reproducir al presentar palabras<small>Suena la pronunciación al aparecer cada palabra</small></span>' +
        '<input class="switch" type="checkbox" role="switch" id="au-auto"' + (state.settings.autoplay ? " checked" : "") + "></label>" +
        '<div class="setting"><label class="setting-txt" for="au-rate">Velocidad<small>De la pronunciación grabada</small></label><select id="au-rate">' +
        '<option value="normal"' + (state.settings.rate !== "lenta" ? " selected" : "") + '>Normal</option><option value="lenta"' + (state.settings.rate === "lenta" ? " selected" : "") + ">Lenta</option></select></div>" +
        (hasKind("sintetico") ? '<label class="setting" for="au-synth"><span class="setting-txt">Usar voz sintética<small>Para las palabras que aún no tienen voz nativa</small></span>' +
          '<input class="switch" type="checkbox" role="switch" id="au-synth"' + (state.settings.synth !== false ? " checked" : "") + "></label>" : "") : "") +
      "</div>" +
      (hasKind("sintetico") ? '<p class="au-note synth-note">' + ICON.speaker.replace("<svg", '<svg class="ico"') + "<span>" + esc(SYNTH_NOTE) + "</span></p>" : "") + (audioFailed ? '<p class="storage-warn">El sonido no está disponible en este navegador.</p>' : "") +
      (storageOK ? "" : '<p class="storage-warn">Este navegador no permite guardar datos (modo privado o almacenamiento bloqueado). Tu avance se perderá al cerrar la página.</p>') + "</section>";
    h += modHTML("profile");
    h += backupSectionHTML();
    if (COURSE.guide.length) h +='<section class="section" aria-labelledby="guide-title"><h2 id="guide-title">Guía de pronunciación</h2>' +
      '<p class="muted">Cómo se leen las ' + COURSE.guide.length + ' letras del alfabeto maya. Está en el Diccionario.</p>' +
      '<div class="btn-row"><button class="btn tonal" type="button" id="btn-profile-guide">' + ICON.book + "Abrir la guía</button></div></section>";
    h += listenSectionHTML();
    // Solo en el sitio web y si se publicó la herramienta de grabación (build-web.mjs define KOOX_GRABAR).
    if (window.KOOX_STANDALONE === true && window.KOOX_GRABAR === true) {
      h += '<section class="card help-rec" aria-labelledby="rec-title"><h2 id="rec-title">' + ICON.mic.replace("<svg", '<svg class="ico"') + "¿Hablas maya? Ayuda a grabar las palabras</h2>" +
        "<p>Si el maya es tu lengua, puedes grabar las palabras del curso para que quienes aprenden las escuchen en voz de un hablante.</p>" +
        '<div class="btn-row"><a class="btn primary" href="grabar.html" id="btn-grabar">Ayudar a grabar</a></div></section>';
    }
    if (PWA && PWA.on) h += PWA.installHTML(); // versión web instalable; en el Artifact, el texto de siempre:
    else h += '<section class="section" aria-labelledby="install-title"><h2 id="install-title">Instalar en Android</h2><ol class="steps">' +
      "<li>Abre esta página en Chrome.</li><li>Toca el menú ⋮ (arriba a la derecha).</li>" +
      "<li>Elige «Agregar a la pantalla principal» o «Instalar app».</li><li>Abre Ko'ox Maaya desde el ícono, como cualquier app.</li></ol>" +
      '<p class="muted">Necesita conexión a internet para abrirse. Tu avance se guarda solo en este teléfono y en este navegador.</p></section>';
    h += '<section class="notice" aria-labelledby="trust-title"><h2 id="trust-title">Qué tan confiable es</h2><ul>' +
      "<li>Ko'ox Maaya es un pasatiempo para aprender. El contenido se preparó con ayuda de IA y se cotejó con las fuentes públicas que aparecen abajo; aun así, puede tener errores.</li>" +
      "<li>La ortografía del maya varía según la región y el autor. Las palabras marcadas «por confirmar» son formas probables que aún no se confirmaron en una fuente: la app te las muestra para reconocerlas, pero no te pide escribirlas.</li>" +
      "<li>Valida lo que aprendas con hablantes de maya.</li>" +
      "<li>Para situaciones importantes (salud, trámites) recurre a un intérprete.</li></ul></section>";
    h += '<section class="section" aria-labelledby="src-title"><h2 id="src-title">Fuentes</h2>';
    if (COURSE.sources.length) {
      h += '<details class="src-box"><summary>Ver las ' + COURSE.sources.length + " fuentes, por unidad</summary>" +
        COURSE.units.map(function (u) {
          var seen = {}, list = u.sources.filter(function (x) { var k = str(x.url) || str(x.title); if (seen[k]) return false; seen[k] = 1; return true; });
          if (!list.length) return "";
          return '<h3 class="src-unit">Unidad ' + u.n + " · " + esc(u.title) + '</h3><ul class="sources-list">' + list.map(function (x) {
            if (!/^https?:\/\//.test(str(x.url))) return "<li><span>" + esc(str(x.title)) + "</span></li>";
            return '<li><a href="' + esc(str(x.url)) + '" target="_blank" rel="noopener">' + esc(str(x.title) || str(x.url)) + "</a></li>";
          }).join("") + "</ul>";
        }).join("") + "</details>";
    } else h += '<p class="muted">Sin fuentes registradas.</p>';
    h += "</section>";
    h += creditsHTML();
    h += '<section class="section" aria-labelledby="reset-title"><h2 id="reset-title">Borrar avance</h2>' +
      '<p class="muted">Borra tu XP, racha, días con maya, lecciones y repasos de este navegador; tus ajustes se conservan. No se puede deshacer: si quieres conservar tu avance, expórtalo antes.</p>' +
      '<div class="btn-row"><button class="btn ghost-danger" type="button" id="btn-reset">Borrar avance</button></div>' +
      '<p class="reset-msg" id="reset-msg" tabindex="-1" aria-live="polite"></p></section>';
    h += '<p class="foot">Ko\'ox Maaya v5.2 · proyecto comunitario experimental.</p>';
    pendingImport = null;
    v.innerHTML = h;
    modCall("bind", v, "profile");
    if (PWA && PWA.on) PWA.bindInstall();
    bindBackup();
    $("#goal").addEventListener("change", function () {
      var g = Number(this.value);
      if (GOALS.indexOf(g) >= 0) { state.goal = g; save(); toast("Meta diaria: " + g + " XP"); }
    });
    var pg = $("#btn-profile-guide");
    if (pg) pg.addEventListener("click", openGuide);
    $("#sound").addEventListener("change", function () {
      state.settings.sound = this.checked;
      if (this.checked) { audioFailed = false; tone("ok"); }
      save();
    });
    $("#calm").addEventListener("change", function () {
      state.settings.calm = this.checked; save(); applyCalm();
      toast(this.checked ? "Modo tranquilo activado" : "Modo tranquilo desactivado");
    });
    var as = $("#au-synth");
    if (as) as.addEventListener("change", function () {
      state.settings.synth = this.checked; save(); stopAudio();
      toast(this.checked ? "Voz sintética activada" : "Voz sintética desactivada");
    });
    var aa = $("#au-auto");
    if (aa) aa.addEventListener("change", function () { state.settings.autoplay = this.checked; save(); });
    var ar = $("#au-rate");
    if (ar) ar.addEventListener("change", function () {
      state.settings.rate = this.value === "lenta" ? "lenta" : "normal"; save();
      toast(state.settings.rate === "lenta" ? "Pronunciación lenta" : "Pronunciación a velocidad normal");
    });
    var armed = false, timer = null, rb = $("#btn-reset");
    rb.addEventListener("click", function () {
      if (!armed) {
        armed = true; rb.textContent = "Toca otra vez para borrar todo";
        $("#reset-msg").textContent = "";
        timer = setTimeout(function () { armed = false; rb.textContent = "Borrar avance"; }, 5000);
        return;
      }
      clearTimeout(timer);
      var settings = state.settings, goal = state.goal;
      state = freshState(); state.settings = settings; state.goal = goal;
      save();
      renderProfile();
      updateBadge();
      var msg = $("#reset-msg");
      msg.textContent = "Avance borrado. Tus ajustes se conservaron.";
      msg.focus({ preventScroll: true });
      toast("Avance borrado");
    });
  }

  // Perfil → Escucha maya: todos los recursos, por unidad (los de varias unidades, aparte).
  function listenSectionHTML() {
    if (!RES.length) return "";
    var groups = [];
    var multi = RES.filter(function (r) { return r.units.length > 1; });
    if (multi.length) groups.push(["Para varias unidades", multi, true]);
    COURSE.units.forEach(function (u) {
      var list = RES.filter(function (r) { return r.units.length === 1 && r.units[0] === u.id; });
      if (list.length) groups.push(["Unidad " + u.n + " · " + u.title, list, false]);
    });
    var n = groups.reduce(function (t, g) { return t + g[1].length; }, 0);
    if (!n) return "";
    return '<section class="section" aria-labelledby="listen-title"><h2 id="listen-title">Escucha maya</h2>' +
      '<p class="muted">Videos, pódcast, radio y sitios para oír maya. Se abren fuera de la app: fíjate quién los publica.</p>' +
      '<details class="src-box listen-box" id="listen-box"><summary>Ver ' + (n === 1 ? "el recurso" : "los " + n + " recursos") + ", por unidad</summary>" +
      groups.map(function (g) {
        return '<h3 class="src-unit">' + esc(g[0]) + '</h3><ul class="res-list">' + g[1].map(function (r) { return resItem(r, g[2]); }).join("") + "</ul>";
      }).join("") + "</details></section>";
  }
  // Perfil → Créditos de audio: agrupados por autor y licencia; la fuente, una vez si es la misma para
  // todo el grupo o junto a cada audio si cambia (p. ej. una página por archivo).
  function creditsHTML() {
    if (!AU.list.length) return "";
    var groups = {}, order = [];
    AU.list.forEach(function (a) {
      var k = (a.kind === "sintetico" ? "sintetico\n" : "") + [a.author, a.license, a.licenseUrl.replace(/\/+$/, "")].join("\n");
      if (!groups[k]) { groups[k] = { a: a, items: [], kinds: {}, speakers: [], notes: [], sources: [] }; order.push(k); }
      var g = groups[k];
      g.items.push(a); g.kinds[a.kind] = 1;
      var who = a.speaker ? a.speaker + (a.region ? " · " + a.region : "") : "";
      if (who && g.speakers.indexOf(who) < 0) g.speakers.push(who);
      // La nota de cada audio sintético termina con su CER de control: en los créditos va la parte común.
      var note = a.kind === "sintetico" ? a.notes.replace(/\s*CER de control:\s*[\d.,]+\.?\s*$/, "").trim() : "";
      if (note && g.notes.indexOf(note) < 0) g.notes.push(note);
      if (g.sources.indexOf(a.source) < 0) g.sources.push(a.source);
    });
    function link(url, text) { return '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(text) + "</a>"; }
    function source(src, short) {
      if (!/^https:\/\/\S+$/.test(src)) return esc(src);
      var host = src.replace(/^https:\/\//, "");
      return link(src, short ? host.split("/")[0] : host);
    }
    function heard(x) { return x.kind === "fonema" ? esc(x.text) + (x.ipa ? " " + esc(x.ipa) : "") : m(x.text); }
    return '<section class="section" aria-labelledby="credits-title"><h2 id="credits-title">Créditos de audio</h2>' +
      '<p class="muted">Quién grabó o generó cada audio, con qué licencia y de dónde viene. Todos se recortaron, se normalizó su volumen y se convirtieron a MP3; ' +
      "los que tienen licencia CC BY-SA se comparten con la misma licencia. Atribución completa, audio por audio: " + link(CREDITS_URL, "CREDITOS.md") + ".</p>" +
      '<details class="src-box" id="credits-box"><summary>Ver los créditos de ' + AU.list.length + " " + plural(AU.list.length, "audio", "audios") + "</summary>" +
      order.map(function (k) {
        var g = groups[k], a = g.a, one = g.sources.length === 1;
        var kinds = ["nativo", "sintetico", "fonema"].filter(function (x) { return g.kinds[x]; }).map(function (x) { return AU_KIND[x].label; }).join(" · ");
        if (a.kind === "sintetico") {
          // Cientos de audios de un mismo modelo: una sola entrada, sin lista de palabras.
          var srcs = g.sources.filter(Boolean);
          return '<div class="credit synth"><h3 class="src-unit">' + esc(a.author || "Voz sintética") + "</h3>" +
            '<p class="cr-l">' + esc(AU_KIND.sintetico.label) + " · " + g.items.length + " " + plural(g.items.length, "audio", "audios") + "</p>" +
            '<p class="cr-l">Licencia: ' + (a.licenseUrl ? link(a.licenseUrl, a.license || a.licenseUrl) : esc(a.license)) +
            (/\bNC\b/.test(a.license) ? " · solo uso no comercial" : "") + "</p>" +
            (srcs.length ? '<p class="cr-l">' + (srcs.length === 1 ? "Modelo: " + source(srcs[0]) : "Fuentes: " + srcs.slice(0, 3).map(function (x) { return source(x, true); }).join(", ") + (srcs.length > 3 ? "…" : "")) + "</p>" : "") +
            g.notes.slice(0, 2).map(function (t) { return '<p class="cr-n">' + esc(t) + "</p>"; }).join("") + "</div>";
        }
        return '<div class="credit"><h3 class="src-unit">' + esc(a.author || "Sin autor") + "</h3>" +
          '<p class="cr-l">' + esc(kinds) + (g.speakers.length ? " · " + esc(g.speakers.join("; ")) : "") + "</p>" +
          '<p class="cr-l">Licencia: ' + (a.licenseUrl ? link(a.licenseUrl, a.license || a.licenseUrl) : esc(a.license)) + "</p>" +
          (one ? (a.source ? '<p class="cr-l">Fuente: ' + source(a.source) + "</p>" : "") + '<p class="cr-w">' + g.items.map(heard).join(", ") + "</p>"
            : '<ul class="cr-items">' + g.items.map(function (x) { return "<li>" + heard(x) + (x.source ? ' <span class="cr-src">· ' + source(x.source, true) + "</span>" : "") + "</li>"; }).join("") + "</ul>") +
          g.notes.map(function (t) { return '<p class="cr-n">' + esc(t) + "</p>"; }).join("") + "</div>";
      }).join("") + "</details></section>";
  }

  /* ================= Teclado ================= */
  function isTyping(t) { return t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable); }
  function trapFocus(e, container) {
    var f = $$("button:not([disabled]), [href], input, select", container).filter(function (x) { return x.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  document.addEventListener("keydown", function (e) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (!el.confirm.hidden) {
      if (e.key === "Escape") { e.preventDefault(); closeConfirm(); }
      else if (e.key === "Tab") trapFocus(e, el.confirm);
      return;
    }
    if (!el.lessonSheet.hidden) {
      if (e.key === "Escape") { e.preventDefault(); closeLessonSheet(); }
      else if (e.key === "Tab") trapFocus(e, el.lessonSheet);
      return;
    }
    if (!S) return;
    if (e.key === "Escape") { e.preventDefault(); askExit(); return; }
    if (e.key === "Enter") {
      if (e.repeat || e.shiftKey) return;
      var t = e.target;
      if (t === el.close || (t && t.closest && t.closest("#btn-show-all, .results-actions, .bubble, .tile, .pair-btn, .key-btn, [data-au]"))) return;
      if (t && t.classList && t.classList.contains("opt") && t.getAttribute("aria-pressed") !== "true") return;
      if (S.done) {
        if (t && t.tagName === "BUTTON") return;
        var primary = $("#btn-results-next") || $("#btn-results-home");
        if (primary) { e.preventDefault(); primary.click(); }
        return;
      }
      e.preventDefault();
      if (!el.feedback.hidden) cont();
      else if (cur) { if (cur.ready) check(); }
      else next();
      return;
    }
    if (/^[1-9]$/.test(e.key) && cur && !cur.checked && !isTyping(e.target) && (cur.ex.type === "choice" || cur.ex.type === "fill" || cur.ex.type === "listen")) {
      var b = $("#opt-" + (Number(e.key) - 1));
      if (b) { e.preventDefault(); b.click(); b.focus(); }
    }
  });

  /* ================= Gancho de pruebas ================= */
  function solve(wrong) {
    if (!S || !cur || cur.checked) return false;
    var ex = cur.ex;
    if (ex.type === "choice" || ex.type === "fill" || ex.type === "listen") {
      var idx = -1;
      for (var i = 0; i < cur.opts.length; i++) if ((cur.opts[i] === ex.answer) !== !!wrong) { idx = i; break; }
      if (idx < 0) return false;
      $("#opt-" + idx).click();
      return true;
    }
    if (ex.type === "type") {
      cur.input.value = wrong ? "zzz" : ex.answer;
      cur.input.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    }
    if (ex.type === "build") {
      $$(".build-answer .tile", el.body).forEach(function (b) { b.click(); });
      var target = ex.words.slice();
      if (wrong) { target = target.slice().reverse(); if (normalize(target.join(" ")) === normalize(ex.words.join(" "))) target = target.concat(ex.distractors.slice(0, 1)); if (normalize(target.join(" ")) === normalize(ex.words.join(" "))) target = target.slice(1); }
      target.forEach(function (w) {
        var b = $$("#bank .tile", el.body).filter(function (x) { return !x.classList.contains("used") && normalize(x.textContent) === normalize(w); })[0];
        if (b) b.click();
      });
      return true;
    }
    if (ex.type === "pairs") {
      var L = $$('.pair-btn[data-side="L"]', el.body), R = $$('.pair-btn[data-side="R"]', el.body);
      if (wrong) {
        var a = L.filter(function (x) { return !x.disabled; })[0];
        var c = a && R.filter(function (x) { return !x.disabled && x.getAttribute("data-id") !== a.getAttribute("data-id"); })[0];
        if (a && c) { a.click(); c.click(); }
      }
      L.forEach(function (lb) {
        if (lb.disabled || !cur || cur.checked) return;
        var rb = R.filter(function (x) { return x.getAttribute("data-id") === lb.getAttribute("data-id"); })[0];
        lb.click(); if (rb) rb.click();
      });
      return true;
    }
    return false;
  }
  window.__koox = {
    screen: function () { return screen; },
    solve: solve,
    peek: function () { return cur ? { type: cur.ex.type, answer: cur.ex.answer || cur.ex.m || null, retry: !!cur.st.retry, auto: !!cur.ex.auto } : null; },
    course: RAW,
    lessons: function () { return COURSE.lessons.map(function (l) { return l.id; }); },
    vocabCount: function () { return COURSE.vocab.length; },
    state: function () { return JSON.parse(JSON.stringify(state)); },
    // Racha amable (funciones puras, para pruebas): ver «Racha amable» arriba.
    streakStep: streakStep,
    streakView: streakView,
    isoWeek: isoWeek,
    normalize: normalize,
    grade: grade,
    searchKey: searchKey,
    sanitize: sanitize,
    markMaya: markMaya,
    // Califica lo escrito para la palabra con ese id, como en un ejercicio de escribir.
    gradeTyped: function (input, vid) {
      var v = COURSE.vocabById[vid];
      if (!v) return null;
      var g = gradeTyped(input, makeType(v));
      return { ok: !!g.ok, accent: !!g.accent, other: g.other ? g.other.id : null };
    },
    dropped: function () { return COURSE.dropped.slice(); },
    // Abre una práctica de un solo ejercicio de escribir (para pruebas y capturas).
    tryType: function (vid) { var v = COURSE.vocabById[vid]; if (v && canType(v)) openSession("practice", [{ t: "ex", ex: makeType(v) }]); return !!v; },
    plan: function (lid) {
      var l = COURSE.lessonById[lid];
      return l ? lessonSteps(l).map(function (st) {
        if (st.t !== "ex") return st.t;
        var e = st.ex;
        return "ex:" + e.type + (e.type === "choice" ? (e.promptLang === "m" ? "-m2es" : "-es2m") : e.type === "listen" ? "-" + e.optLang : "") + (e.hand ? ":hand" : e.quick ? ":quick" : ":auto") +
          ":" + (e.type === "pairs" ? e.items.map(function (x) { return x.conf; }).join("") : (e.vocab ? e.vocab.conf : e.conf || "?"));
      }) : null;
    },
    storageOK: function () { return storageOK; },
    // Audio: qué hay, qué suena y qué audio corresponde a una palabra, letra o texto.
    audio: function () {
      var k = {};
      AU.list.forEach(function (a) { k[a.kind] = (k[a.kind] || 0) + 1; });
      return { count: AU.list.length, kinds: k, failed: Object.keys(AU.failed), resources: RES.length,
        native: COURSE.vocab.filter(function (v) { return nativeFor(v); }).map(function (v) { return v.id; }) };
    },
    audioState: function () {
      var p = player;
      return {
        playing: !!(p && !p.paused && !p.ended), key: nowKey, lastKey: auStats.lastKey, lastRate: auStats.lastRate,
        rate: p ? p.playbackRate : null, preservesPitch: p ? p.preservesPitch !== false : null, currentTime: p ? p.currentTime : 0,
        src: p && p.kooxSrc ? (p.kooxSrc.slice(0, 5) === "data:" ? "data:" : p.kooxSrc) : null,
        plays: auStats.plays, started: auStats.started, ended: auStats.ended, errors: auStats.errors, blocked: auStats.blocked
      };
    },
    audioEntries: function () { return AU.list.map(function (a) { return { key: a.key, kind: a.kind, text: a.text, vocab: a.vocab.slice(), letters: a.letters.slice() }; }); },
    audioFor: function (what, x) {
      var a = what === "letter" ? audioForLetter(x) : what === "text" ? audioForText(x) : audioForVocab(x);
      return a ? { key: a.key, kind: a.kind } : null;
    },
    // Qué suena en la tarjeta de la guía de la letra l: botones de letra, ejemplo y nativas de otras palabras.
    guideAudio: function (l) {
      var g = COURSE.guide.filter(function (x) { return x.l === l; })[0];
      if (!g) return null;
      var ga = guideAudio(g);
      return { multi: ga.multi, letters: ga.letters.map(function (x) { return { l: x.l, key: x.a.key, kind: x.a.kind }; }),
        ex: ga.ex ? ga.ex.key : null, more: ga.more.map(function (a) { return a.key; }) };
    },
    stopAudio: stopAudio,
    playKey: function (k) { return playAudio(AU.byKey[k]); },
    // Abre una práctica de un solo «Escucha y elige» (para pruebas y capturas).
    tryListen: function (vid) { var e = makeListen(COURSE.vocabById[vid]); if (e) openSession("practice", [{ t: "ex", ex: e }]); return !!e; }
  };

  /* ================= Versión web instalable (PWA) ================= */
  // Solo actúa cuando la página es el sitio independiente: build-web.mjs define window.KOOX_STANDALONE
  // y window.KOOX_BUILD (la versión). En el Artifact de claude.ai PWA.on es false y nada de esto corre.
  var PWA = (function () {
    var api = { on: window.KOOX_STANDALONE === true };
    if (!api.on) return api;
    var deferred = null, installedNow = false, pending = false, note = null;
    var ICON_INSTALL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v10.5M7.5 10 12 14.5 16.5 10"/><path d="M5 19.5h14"/></svg>';
    function runningAsApp() {
      try { return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true; }
      catch (e) { return false; }
    }
    api.installHTML = function () {
      var h = '<section class="section" aria-labelledby="install-title"><h2 id="install-title">Instalar en Android</h2>';
      var offline = "Después de la primera visita funciona sin conexión: las lecciones, el repaso y el diccionario quedan guardados en el teléfono.";
      if (runningAsApp() || installedNow) {
        return h + "<p>" + (installedNow ? "Ko'ox Maaya quedó instalada. Ábrela desde su ícono en la pantalla principal."
          : "Ya usas Ko'ox Maaya como app instalada.") + "</p>" +
          '<p class="muted">' + offline + " Tu avance se guarda solo en este teléfono.</p></section>";
      }
      return h + '<div class="btn-row"><button class="btn primary" type="button" id="btn-install"' + (deferred ? "" : " hidden") + ">" +
        ICON_INSTALL + "Instalar app</button></div>" +
        '<ol class="steps"><li>Abre esta página en Chrome.</li><li>Toca el menú ⋮ (arriba a la derecha).</li>' +
        "<li>Elige «Instalar app» o «Agregar a la pantalla principal».</li><li>Abre Ko'ox Maaya desde el ícono, como cualquier app.</li></ol>" +
        '<p class="muted">' + offline + " Tu avance se guarda solo en este teléfono y en este navegador.</p></section>";
    };
    function refreshInstall() {
      var t = $("#install-title");
      if (!t || !t.parentNode) return;
      t.parentNode.outerHTML = api.installHTML();
      api.bindInstall();
    }
    api.bindInstall = function () {
      var b = $("#btn-install");
      if (!b) return;
      b.addEventListener("click", function () {
        var ev = deferred;
        if (!ev) return;
        deferred = null;
        b.hidden = true;
        try {
          var p = ev.prompt(); // diálogo de instalación de Chrome (no es window.prompt)
          if (p && p.catch) p.catch(function () {});
          if (ev.userChoice && ev.userChoice.then) ev.userChoice.then(function (c) {
            if (!c || c.outcome !== "accepted") return;
            installedNow = true;
            refreshInstall();
          }, function () {});
        } catch (e) { /* sin efecto */ }
      });
    };
    window.addEventListener("beforeinstallprompt", function (e) {
      e.preventDefault(); // sin la mini barra de Chrome: se instala con el botón de Perfil
      deferred = e;
      var b = $("#btn-install");
      if (b) b.hidden = false;
    });
    window.addEventListener("appinstalled", function () {
      deferred = null;
      installedNow = true;
      refreshInstall();
      toast("Ko'ox Maaya quedó instalada");
    });

    // Aviso discreto cuando el service worker activa una versión distinta de la que se está viendo.
    // Durante una lección se espera a que termine (showTab llama a flush).
    function showUpdate() {
      if (S) { pending = true; return; }
      pending = false;
      if (note) { note.hidden = false; return; }
      note = document.createElement("div");
      note.className = "update-note";
      note.id = "update-note";
      note.setAttribute("role", "status");
      (document.getElementById("app") || document.body).appendChild(note);
      // El contenido llega después de crear la región para que los lectores de pantalla lo anuncien.
      setTimeout(function () {
        note.innerHTML = '<span class="update-txt">Hay una versión nueva</span>' +
          '<button class="btn primary" type="button" id="btn-update">Actualizar</button>' +
          '<button class="icon-btn" type="button" id="btn-update-close" aria-label="Cerrar aviso">' + ICON.x + "</button>";
        $("#btn-update").addEventListener("click", function () { location.reload(); });
        $("#btn-update-close").addEventListener("click", function () { note.hidden = true; });
      }, 60);
    }
    api.flush = function () { if (pending) showUpdate(); };
    try {
      if ("serviceWorker" in navigator) navigator.serviceWorker.addEventListener("message", function (e) {
        var d = e.data;
        if (d && d.type === "koox-sw-updated" && d.version && d.version !== window.KOOX_BUILD) showUpdate();
      });
    } catch (e) { /* sin service worker */ }
    return api;
  })();

  /* ================= Arranque ================= */
  try { if (!document.documentElement.lang) document.documentElement.lang = "es"; } catch (e) { /* sin efecto */ }
  applyCalm();
  // Pide al navegador que no borre el avance cuando falte espacio. Si no existe o falla, no pasa nada.
  try {
    if (navigator.storage && typeof navigator.storage.persist === "function") {
      var persistAsk = navigator.storage.persist();
      if (persistAsk && typeof persistAsk.catch === "function") persistAsk.catch(function () { /* sin efecto */ });
    }
  } catch (e) { /* sin efecto */ }
  (function fontsOn() {
    var gf = document.getElementById("gfonts");
    if (!gf || gf.media === "all") return;
    var on = function () { gf.media = "all"; };
    if (gf.sheet) on(); else { gf.addEventListener("load", on); setTimeout(on, 3000); }
  })();
  $$(".nav-tab").forEach(function (b) {
    b.addEventListener("click", function () {
      var t = b.getAttribute("data-tab");
      if (t === tab && t === "aprender") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
      showTab(t);
    });
  });
  window.addEventListener("hashchange", function () {
    var t = (location.hash || "").replace("#", "");
    if (TAB_VIEW[t] && t !== tab && !S) showTab(t);
  });
  window.addEventListener("scroll", function () {
    var sb = $("#statbar");
    if (sb) sb.classList.toggle("scrolled", window.scrollY > 4);
  }, { passive: true });
  if (window.visualViewport) {
    var vv = window.visualViewport;
    var kb = function () {
      var off = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      if (vv.scale > 1.01 || off < 80) off = 0;
      document.documentElement.style.setProperty("--kb", off + "px");
    };
    vv.addEventListener("resize", kb);
    vv.addEventListener("scroll", kb);
  }
  try {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq.addEventListener) mq.addEventListener("change", syncThemeColor);
  } catch (e) { /* sin efecto */ }
  syncThemeColor();
  // Al volver a la app otro día, refresca racha y repasos.
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState !== "visible") stopAudio();
    else if (!S) showTab(tab, { keepScroll: true });
  });
  /* ================= Módulos: ganchos ================= */
  // Cada módulo (src/modules/*.js) llama registerModule({...}) con los métodos que necesite:
  //   homeTop(), unit(u), homeEnd(), profile(), results(info) → HTML (string);
  //   bind(root, donde) tras pintar "home" o "profile"; session(info) al terminar una lección o un repaso.
  // Su estado propio vive en state.x.<nombre> (se guarda y respalda con el resto).
  var MODULES = [];
  function registerModule(m) { MODULES.push(m); }
  function modHTML(method, arg) {
    var h = "";
    (MODULES || []).forEach(function (m) { if (m[method]) { try { h += m[method](arg) || ""; } catch (e) { /* un módulo no tumba la app */ } } });
    return h;
  }
  function modCall(method, a, b) {
    (MODULES || []).forEach(function (m) { if (m[method]) { try { m[method](a, b); } catch (e) { /* sin efecto */ } } });
  }
  function xstate(name) { if (!isObj(state.x[name])) state.x[name] = {}; return state.x[name]; }
  /*@@MODULES@@*/
  var initial = (location.hash || "").replace("#", "");
  showTab(TAB_VIEW[initial] ? initial : "aprender");
})();
