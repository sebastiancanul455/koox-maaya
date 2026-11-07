/* Ko'ox Maaya · módulo «Historias»: conversaciones cortas de «elige qué decir», para practicar por gusto.
   Contenido: window.COURSE_STORIES (src/content/historias.js). Regla de oro: cada línea maya de una historia es
   una cadena que ya existe en el curso (test/historias.cjs lo comprueba); aquí solo se muestra.
   Pantallas (a pantalla completa sobre el inicio, como Lecturas): tarjeta en Inicio (homeTop) → lista → historia →
   resumen. El botón Atrás de Android cierra una capa a la vez: hoja de la línea → historia → lista → inicio
   (una sola entrada de historial mientras el módulo está abierto).
   Una opción no apropiada no avanza: se explica con amabilidad y se puede elegir otra. Sin vidas ni castigos.
   Estado propio: state.x.historias = { done: { <id>: { n, best, of, last } } }  (n = veces terminada,
   best = mejor número de pasos elegidos bien a la primera, of = pasos de ese recorrido, last = día).
   Usa del núcleo: state, save, today, esc, $, $$, toast, addXP, normalize, markMaya, plural, histPush, histState,
   trapFocus, showTab, updateBadge, funciones de audio (audioForText, audioForVocab, auBtn, stopAudio). */
(function () {
  var ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
  var XP_FIRST = 5;
  var IC = {
    chat: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h11a2 2 0 0 1 2 2V13a2 2 0 0 1-2 2H9l-4 3.5V15H4a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2z"/><path d="M19 9h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1v2.5L16 18h-3"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>'
  };

  /* ---------- Estado propio ---------- */
  function own() { var x = state.x && state.x.historias; return isObj(x) ? x : null; }
  function cleanDone(d) {
    if (!isObj(d)) return null;
    var of = nonNeg(d.of);
    return { n: Math.max(1, nonNeg(d.n)), best: Math.min(nonNeg(d.best), of), of: of, last: isDay(d.last) ? d.last : "" };
  }
  function doneOf(id) {
    var x = own(), d = x && isObj(x.done) && Object.prototype.hasOwnProperty.call(x.done, id) ? x.done[id] : null;
    return cleanDone(d);
  }
  function mine() {
    var x = xstate("historias"), done = {};
    if (isObj(x.done)) Object.keys(x.done).forEach(function (id) { var d = cleanDone(x.done[id]); if (ID_RE.test(id) && d) done[id] = d; });
    Object.keys(x).forEach(function (k) { if (k !== "done") delete x[k]; });
    x.done = done;
    return x;
  }

  /* ---------- Historias: se limpian y se descartan las que no se pueden jugar ---------- */
  function cleanLine(x) {
    if (!isObj(x) || !str(x.m) || !str(x.es)) return null;
    return { who: str(x.who), m: str(x.m), es: str(x.es) };
  }
  function cleanStory(raw) {
    if (!isObj(raw) || !isObj(raw.nodes)) return null;
    var id = str(raw.id), title = str(raw.title), start = str(raw.start), nodes = {};
    if (!ID_RE.test(id) || !title) return null;
    Object.keys(raw.nodes).forEach(function (k) {
      var n = raw.nodes[k];
      if (!ID_RE.test(k) || k === "fin" || !isObj(n)) return;
      var choices = arr(n.choices).map(function (c) {
        var ln = cleanLine(c);
        if (!ln || !str(c.fb)) return null;
        ln.ok = c.ok === true; ln.fb = str(c.fb); ln.next = ln.ok ? str(c.next) : "";
        return ln.ok && !ln.next ? null : ln;
      }).filter(Boolean);
      nodes[k] = { id: k, text: str(n.text), hint: str(n.hint), lines: arr(n.lines).map(cleanLine).filter(Boolean), choices: choices };
    });
    // Un paso vale si tiene opciones y al menos una apropiada que lleve a otro paso válido o a "fin".
    Object.keys(nodes).forEach(function (k) {
      var n = nodes[k];
      n.choices = n.choices.filter(function (c) { return !c.ok || c.next === "fin" || nodes[c.next]; });
      if (!n.choices.some(function (c) { return c.ok; })) delete nodes[k];
    });
    if (!nodes[start]) return null;
    var u = Math.round(Number(raw.unit));
    return { id: id, title: title, unit: u >= 1 && u <= 99 ? u : null, intro: str(raw.intro), outro: str(raw.outro), start: start, nodes: nodes };
  }
  var cache = null;
  function stories() {
    var raw = window.COURSE_STORIES, n = arr(raw).length;
    if (cache && cache.raw === raw && cache.n === n) return cache.list;
    var list = [], seen = Object.create(null);
    arr(raw).forEach(function (r) { var s = cleanStory(r); if (s && !seen[s.id]) { seen[s.id] = 1; list.push(s); } });
    cache = { raw: raw, n: n, list: list };
    return list;
  }
  function byId(id) { return stories().filter(function (s) { return s.id === id; })[0] || null; }
  function unitTitle(n) { var u = COURSE.units.filter(function (x) { return x.n === n; })[0]; return u ? u.title : ""; }

  /* ---------- Glosas: las palabras de una línea, emparejadas con el vocabulario del curso ---------- */
  var WORD_RE = /[^\s¿?¡!.,;:"“”«»()…—–]+/g;
  function toks(text) { return (String(text).match(WORD_RE) || []).map(function (t) { return { t: t, k: normalize(t).replace(/^-+|-+$/g, "") }; }).filter(function (x) { return x.k; }); }
  var IDX = null, IDX_N = -1, MAXLEN = 1;
  function vocabIndex() {
    if (IDX && IDX_N === COURSE.vocab.length) return IDX;
    IDX = Object.create(null); IDX_N = COURSE.vocab.length; MAXLEN = 1;
    COURSE.vocab.forEach(function (v) {
      [v.m].concat(v.alt).forEach(function (f) {
        if (/…/.test(f)) return;
        var ts = toks(f);
        if (!ts.length) return;
        var key = ts.map(function (x) { return x.k; }).join(" ");
        if (!IDX[key]) IDX[key] = v;
        MAXLEN = Math.max(MAXLEN, ts.length);
      });
    });
    return IDX;
  }
  // Primero la coincidencia más larga; las palabras que el curso no tiene salen sin glosa.
  function glosses(text) {
    var idx = vocabIndex(), ts = toks(text), out = [], i = 0;
    while (i < ts.length) {
      var n = 1, v = null;
      for (var len = Math.min(MAXLEN, ts.length - i); len >= 1; len--) {
        var key = ts.slice(i, i + len).map(function (x) { return x.k; }).join(" ");
        if (idx[key]) { n = len; v = idx[key]; break; }
      }
      out.push({ text: ts.slice(i, i + n).map(function (x) { return x.t; }).join(" "), v: v });
      i += n;
    }
    return out;
  }

  /* ---------- Pantalla: estado y apertura ---------- */
  // steps: [{ node, tried: [índices], pick: índice apropiado o -1, first: true/false/null }]
  var H = { open: false, view: "list", s: null, steps: [], fb: null, hint: false, root: null, sheetEl: null, sheet: null,
    prevScreen: "home", dirty: false, listScroll: 0, result: null };

  function ensureRoot() {
    if (H.root) return;
    var host = $("#app") || document.body, r = document.createElement("div");
    r.className = "his"; r.id = "his-root"; r.hidden = true;
    r.setAttribute("role", "dialog"); r.setAttribute("aria-modal", "true"); r.setAttribute("aria-labelledby", "his-h");
    r.addEventListener("click", onClick);
    host.appendChild(r);
    var s = document.createElement("div");
    s.className = "overlay bottom-sheet his-sheet"; s.id = "his-sheet"; s.hidden = true;
    s.innerHTML = '<div class="scrim" data-act="sheet-close"></div><div class="modal bottom" role="dialog" aria-modal="true" aria-labelledby="his-l-title" id="his-modal"></div>';
    s.addEventListener("click", onClick);
    host.appendChild(s);
    H.root = r; H.sheetEl = s;
  }
  function openList() {
    if (H.open) return;
    ensureRoot();
    H.open = true; H.prevScreen = screen; H.dirty = false; H.listScroll = 0;
    H.root.hidden = false;
    document.body.classList.add("locked", "his-open");
    histPush("his");
    showList();
  }
  function closeAll(fromPop) {
    if (!H.open) return;
    stopAudio(); closeSheet(true);
    H.open = false; H.view = "list"; H.s = null; H.steps = []; H.fb = null;
    H.root.hidden = true; H.root.innerHTML = "";
    document.body.classList.remove("locked", "his-open");
    screen = H.prevScreen || "home";
    if (!fromPop && histState() === "his") { try { history.back(); } catch (e) { /* marco sin historial */ } }
    if (H.dirty) { updateBadge(); showTab(tab, { keepScroll: true }); }   // el inicio muestra el XP al día
    var b = $("#btn-home-stories");
    if (b) b.focus({ preventScroll: true });
  }
  function goBack() {
    if (H.sheet) closeSheet();
    else if (H.view !== "list") showList(H.s && H.s.id);
    else closeAll(false);
  }
  window.addEventListener("popstate", function () {
    if (!H.open) return;
    if (H.sheet) { closeSheet(); histPush("his"); return; }
    if (H.view !== "list") { showList(H.s && H.s.id); histPush("his"); return; }
    closeAll(true);
  });
  document.addEventListener("visibilitychange", function () {
    if (H.open && document.visibilityState === "visible") screen = H.view === "list" ? "historias" : "historia";
  });
  document.addEventListener("keydown", function (e) {
    if (!H.open || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "Escape") { e.preventDefault(); goBack(); }
    else if (e.key === "Tab") trapFocus(e, H.sheet ? H.sheetEl : H.root);
  });
  function topHTML(label, crumb) {
    return '<div class="his-top"><button class="icon-btn" type="button" data-act="back" aria-label="' + esc(label) + '">' + IC.back + "</button>" +
      '<span class="his-crumb">' + esc(crumb) + "</span></div>";
  }
  function paint(h, focusSel) {
    H.root.innerHTML = '<div class="his-wrap">' + h + "</div>";
    var f = focusSel ? $(focusSel, H.root) : null;
    f = f || $("#his-h", H.root);
    if (f) f.focus({ preventScroll: true });
  }

  /* ---------- Lista ---------- */
  function cardHTML(s) {
    var d = doneOf(s.id), ut = s.unit ? unitTitle(s.unit) : "";
    return '<li><button class="card his-card" type="button" data-act="open" data-id="' + esc(s.id) + '">' +
      '<span class="his-card-top"><span class="eyebrow">' + (s.unit ? "Desde la Unidad " + s.unit + (ut ? " · " + esc(ut) : "") : "Historia") + "</span>" +
      (d ? '<span class="ls-chip done">Terminada</span>' : "") + "</span>" +
      '<span class="his-card-t">' + esc(s.title) + "</span>" +
      (s.intro ? '<span class="his-card-meta">' + esc(s.intro) + "</span>" : "") +
      (d ? '<span class="his-card-best">Tu mejor vez: ' + d.best + " de " + d.of + " a la primera</span>" : "") + "</button></li>";
  }
  function showList(focusId) {
    stopAudio(); closeSheet(true);
    H.view = "list"; H.s = null; H.steps = []; H.fb = null; H.result = null;
    var ss = stories();
    var h = topHTML("Volver al inicio", "Inicio") + '<div class="his-main">' +
      '<header class="page-head his-head"><p class="eyebrow">Elige qué decir</p><h1 id="his-h" tabindex="-1">Historias</h1>' +
      '<p class="lead">Conversaciones cortas con frases del curso. En cada paso elige qué responder; si algo no encaja, te decimos por qué y vuelves a intentar. Toca una línea en maya para ver qué significa.</p></header>' +
      '<ul class="his-list">' + ss.map(cardHTML).join("") + "</ul></div>";
    paint(h, focusId ? '[data-id="' + focusId + '"]' : null);
    screen = "historias";
    H.root.scrollTop = focusId ? H.listScroll : 0;
  }

  /* ---------- Historia ---------- */
  function openStory(id) {
    var s = byId(id);
    if (!s) return;
    H.listScroll = H.root.scrollTop;
    H.s = s; H.view = "play"; H.steps = [{ node: s.start, tried: [], pick: -1, first: null }]; H.fb = null; H.hint = false; H.result = null;
    renderPlay("#his-h");
  }
  var nLine = 0;   // índice de cada línea maya tocable dentro de la pantalla (para la hoja)
  var shown = [];
  function lineBtn(ln) {
    var i = nLine++;
    shown[i] = ln;
    return '<button class="his-line" type="button" lang="es" data-act="line" data-i="' + i + '" aria-haspopup="dialog" aria-label="' + esc(ln.m + ", ver significado") + '">' +
      '<span class="m" lang="yua">' + esc(ln.m) + "</span></button>";
  }
  function bubbleHTML(ln, side) {
    var a = audioForText(ln.m);
    return '<div class="bubble-row his-row ' + side + '">' +
      '<span class="avatar" aria-hidden="true">' + esc(initialOf(ln.who || (side === "b" ? "Tú" : "?"))) + "</span>" +
      '<div class="bubble his-bubble"><span class="who">' + esc(ln.who || "Tú") + "</span>" + lineBtn(ln) + "</div>" +
      (a ? auBtn(a, ln.m, "md") : "") + "</div>";
  }
  function stepHTML(st, isCur) {
    var n = H.s.nodes[st.node], h = '<section class="his-step' + (isCur ? " cur" : "") + '">';
    if (n.text) h += '<p class="his-narr">' + esc(n.text) + "</p>";
    if (n.lines.length) h += '<div class="dialogue his-lines">' + n.lines.map(function (ln) { return bubbleHTML(ln, "a"); }).join("") + "</div>";
    if (st.pick >= 0) {
      var c = n.choices[st.pick];
      h += '<div class="dialogue his-lines">' + bubbleHTML({ who: "Tú", m: c.m, es: c.es }, "b") + "</div>";
    }
    return h + "</section>";
  }
  function choicesHTML(st) {
    var n = H.s.nodes[st.node], resolved = st.pick >= 0;
    var h = "";
    if (n.hint && !resolved) h += H.hint ? '<p class="his-hint" id="his-hint">Pista: ' + esc(n.hint) + "</p>" :
      '<button class="btn text his-hint-btn" type="button" data-act="hint">Ver pista</button>';
    h += '<fieldset class="his-choices"><legend>¿Qué dices?</legend>' + n.choices.map(function (c, i) {
      var tried = st.tried.indexOf(i) >= 0 && !c.ok, picked = st.pick === i;
      return '<button class="his-opt' + (tried ? " tried" : "") + (picked ? " picked" : "") + '" type="button" data-act="pick" data-c="' + i + '"' +
        (tried || resolved ? " disabled" : "") + ' aria-label="' + esc(c.m + (tried ? ", ya la probaste" : "")) + '" lang="es"><span class="m" lang="yua">' + esc(c.m) + "</span></button>";
    }).join("") + "</fieldset>";
    if (H.fb) {
      var fc = n.choices[H.fb.c];
      h += '<div class="his-fb ' + (fc.ok ? "ok" : "no") + '" id="his-fb" role="status" tabindex="-1">' +
        '<p class="his-fb-t">' + (fc.ok ? "Bien dicho" : "Mejor otra opción") + "</p>" +
        '<p><span class="m" lang="yua">' + esc(fc.m) + "</span> significa «" + esc(fc.es) + "».</p><p>" + esc(fc.fb) + "</p>" +
        (fc.ok ? "" : '<p class="his-fb-try">Elige otra opción.</p>') + "</div>";
      if (fc.ok) h += '<button class="btn primary wide" type="button" id="his-next" data-act="next">' + (fc.next === "fin" ? "Terminar" : "Seguir") + "</button>";
    }
    return h;
  }
  function renderPlay(focusSel) {
    closeSheet(true);
    nLine = 0; shown = [];
    var s = H.s, cur = H.steps[H.steps.length - 1];
    var h = topHTML("Volver a la lista de historias", "Historias") + '<div class="his-main">' +
      '<header class="page-head his-head"><p class="eyebrow">Historia' + (s.unit ? " · desde la Unidad " + s.unit : "") + "</p>" +
      '<h1 id="his-h" tabindex="-1">' + esc(s.title) + "</h1>" +
      '<p class="his-prog muted num">Paso ' + H.steps.length + "</p></header>" +
      '<div class="his-story">' + H.steps.map(function (st, i) { return stepHTML(st, i === H.steps.length - 1); }).join("") + "</div>" +
      choicesHTML(cur) + "</div>";
    var keep = H.root.scrollTop;
    paint(h, focusSel);
    screen = "historia";
    if (focusSel === "#his-h") H.root.scrollTop = 0;
    else {
      H.root.scrollTop = keep;
      var t = (focusSel && $(focusSel, H.root)) || $(".his-step.cur", H.root);
      if (t) { try { t.scrollIntoView({ block: "nearest" }); } catch (e) { /* sin efecto */ } }
    }
  }
  function pick(i) {
    var st = H.steps[H.steps.length - 1], n = H.s.nodes[st.node], c = n.choices[i];
    if (!c || st.pick >= 0 || st.tried.indexOf(i) >= 0) return;
    stopAudio();
    st.tried.push(i);
    if (st.first === null) st.first = c.ok;
    if (c.ok) st.pick = i;
    H.fb = { c: i };
    renderPlay("#his-fb");
  }
  function advance() {
    var st = H.steps[H.steps.length - 1], c = st.pick >= 0 ? H.s.nodes[st.node].choices[st.pick] : null;
    if (!c) return;
    stopAudio();
    H.fb = null; H.hint = false;
    if (c.next === "fin") { finish(); return; }
    H.steps.push({ node: c.next, tried: [], pick: -1, first: null });
    renderPlay(".his-step.cur");
  }

  /* ---------- Resumen ---------- */
  function finish() {
    var s = H.s, of = H.steps.length, good = H.steps.filter(function (x) { return x.first === true; }).length;
    var x = mine(), prev = x.done[s.id];
    x.done[s.id] = { n: (prev ? prev.n : 0) + 1, best: Math.max(prev ? prev.best : 0, good), of: prev && prev.best > good ? prev.of : of, last: today() };
    if (!prev) addXP(XP_FIRST);
    save();
    H.dirty = true;
    H.result = { good: good, of: of, xp: prev ? 0 : XP_FIRST };
    H.view = "summary";
    toast("Historia terminada");
    var h = topHTML("Volver a la lista de historias", "Historias") + '<div class="his-main">' +
      '<header class="page-head his-head"><p class="eyebrow">Historia terminada</p><h1 id="his-h" tabindex="-1">' + esc(s.title) + "</h1></header>" +
      '<div class="card his-sum" id="his-sum"><p class="his-sum-big">Elegiste bien a la primera <b class="num">' + good + "</b> de <b class=\"num\">" + of + "</b></p>" +
      (s.outro ? '<p class="muted">' + esc(s.outro) + "</p>" : "") +
      (H.result.xp ? '<p class="his-xp gami" id="his-xp">+' + XP_FIRST + " XP</p>" : "") + "</div>" +
      '<div class="his-again"><button class="btn primary wide" type="button" data-act="again" id="his-again">Jugar otra vez</button>' +
      '<button class="btn ghost wide" type="button" data-act="back" id="his-tolist">Ver otras historias</button></div></div>';
    paint(h);
    screen = "historia";
    H.root.scrollTop = 0;
  }

  /* ---------- Hoja de la línea: traducción, audio y palabras ---------- */
  function openLine(i, opener) {
    var ln = shown[i];
    if (!ln) return;
    var a = audioForText(ln.m);
    var h = '<p class="eyebrow">Línea</p><div class="his-sh-head"><h2 id="his-l-title" class="m" lang="yua">' + esc(ln.m) + "</h2>" + (a ? auBtn(a, ln.m, "md") : "") + "</div>" +
      '<p class="his-gloss">' + esc(ln.es) + "</p>" +
      '<ul class="his-words">' + glosses(ln.m).map(function (g) {
        var wa = g.v ? (audioForText(g.text) || audioForVocab(g.v.id)) : null;
        return "<li>" + '<span class="m" lang="yua">' + esc(g.text) + "</span>" +
          '<span class="his-wg' + (g.v ? "" : " muted") + '">' + (g.v ? esc(g.v.es) : "sin glosa en el curso") + "</span>" + (wa ? auBtn(wa, g.text, "sm") : "") + "</li>";
      }).join("") + "</ul>" +
      '<div class="modal-actions"><button class="btn text" type="button" id="his-close" data-act="sheet-close">Cerrar</button></div>';
    H.sheet = { opener: opener || null };
    $("#his-modal", H.sheetEl).innerHTML = h;
    H.sheetEl.hidden = false;
    var f = $("#his-close", H.sheetEl);
    if (f) f.focus({ preventScroll: true });
  }
  function closeSheet(quiet) {
    if (!H.sheet) return;
    var op = H.sheet.opener;
    H.sheet = null; H.sheetEl.hidden = true;
    if (!quiet && op && document.contains(op)) op.focus({ preventScroll: true });
  }

  /* ---------- Clics ---------- */
  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest || t.closest("[data-au]")) return;   // el núcleo reproduce el audio
    var b = t.closest("[data-act]");
    if (!b || b.disabled) return;
    var a = b.getAttribute("data-act");
    if (a === "back") goBack();
    else if (a === "open") openStory(b.getAttribute("data-id"));
    else if (a === "line") openLine(Number(b.getAttribute("data-i")), b);
    else if (a === "pick") pick(Number(b.getAttribute("data-c")));
    else if (a === "next") advance();
    else if (a === "hint") { H.hint = true; renderPlay("#his-hint"); }
    else if (a === "again") { var id = H.s && H.s.id; if (id) openStory(id); }
    else if (a === "sheet-close") closeSheet();
  }

  /* ---------- Ganchos del núcleo ---------- */
  registerModule({
    homeTop: function () {
      if (!stories().length) return "";
      return '<button class="guide-link card" type="button" id="btn-home-stories">' + IC.chat +
        '<span class="gl-txt"><span class="gl-t">Historias</span><span class="gl-s">Elige qué decir en conversaciones cortas</span></span></button>';
    },
    profile: function () {
      var ss = stories();
      if (!ss.length) return "";
      var n = ss.filter(function (s) { return doneOf(s.id); }).length;
      return '<section class="section" id="his-prof" aria-label="Historias terminadas"><p><span class="muted">Historias terminadas:</span> <b class="num">' + n + '</b> <span class="muted">de ' + ss.length + "</span></p></section>";
    },
    bind: function (root, where) {
      if (where !== "home") return;
      var b = $("#btn-home-stories", root);
      if (b) b.addEventListener("click", openList);
    }
  });

  // Para las pruebas (test/historias.cjs): lo que hay y lo que se ve, sin tocar el estado.
  if (window.__koox) window.__koox.historias = {
    list: function () { return stories().map(function (s) { return { id: s.id, title: s.title, unit: s.unit, start: s.start, nodes: Object.keys(s.nodes) }; }); },
    story: function (id) { var s = byId(id); return s ? JSON.parse(JSON.stringify(s)) : null; },
    glosses: function (text) { return glosses(text).map(function (g) { return { text: g.text, id: g.v ? g.v.id : null }; }); },
    view: function () {
      var st = H.steps[H.steps.length - 1];
      return { open: H.open, view: H.view, id: H.s ? H.s.id : null, node: st ? st.node : null, steps: H.steps.length, fb: H.fb ? H.fb.c : null,
        sheet: !!H.sheet, result: H.result ? { good: H.result.good, of: H.result.of, xp: H.result.xp } : null };
    }
  };
})();
