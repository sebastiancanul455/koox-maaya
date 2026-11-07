/* ================= «Ya sé algo de maya»: prueba de ubicación ================= */
// Para quien ya entiende maya (por ejemplo, porque lo escuchó en casa): una prueba corta y amable que recorre las
// unidades en orden y propone dónde empezar, para no repetir desde cero lo que ya sabe. No es un examen.
//  · Preguntas de reconocimiento con opción múltiple (maya → español y español → maya), solo con vocabulario de
//    confianza «alta» de cada unidad. Si una palabra tiene grabación nativa, la pregunta puede ser de escucha
//    (hoy no hay ninguna: todo funciona sin audio).
//  · 4 preguntas por unidad; con 3 de 4 se hace una 5.ª de desempate. Una unidad se aprueba con 80 % o más
//    (4/4 o 4/5). La prueba se detiene en la primera unidad bajo 80 %, al terminar todas, al llegar a MAX_Q
//    preguntas o con «Terminar aquí» (la unidad a medias no cuenta como aprobada).
//  · Al aplicar (con confirmación dentro de la página): las lecciones de las unidades aprobadas quedan como
//    completadas (sin pisar las que ya lo estaban) y su vocabulario entra al repaso con srsEnroll(id, …) repartido en 7 días,
//    para que FSRS confirme con el tiempo lo que ya sabe. No da XP ni toca la racha.
//  · Deshacer la última ubicación: se revierten las lecciones que se marcaron (si no se han vuelto a hacer) y se
//    quitan del repaso las palabras que se sembraron (si aún no se han repasado), con su alta en el historial FSRS.
// Estado propio: state.x.ubicacion = { hide: bool, last: { day, start, units: [id], lessons: { id: previo|null },
//   srs: [id] } | null }. Pantalla completa sobre la pestaña con una entrada de historial (Atrás de Android).
// Usa del núcleo: state, save, today, esc, $, $$, toast, COURSE, lessonDone, srsEnroll, shuffle, normalize,
// nativeFor, auBtn, stopAudio, plural, isObj, isDay, histPush, histState, trapFocus, showTab, tab, screen.
(function () {
  var Q_UNIT = 4;     // preguntas por unidad (más una de desempate con 3 de 4)
  var PASS = 80;      // % mínimo para dar la unidad por sabida
  var MAX_Q = 45;     // tope de preguntas de toda la prueba
  var FEW = 4;        // la tarjeta de Inicio se ofrece con menos de FEW lecciones completadas
  var ID_RE = /^[A-Za-z0-9_-]{1,100}$/;
  var BACK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';

  /* ---------- Estado propio ---------- */
  function own() { var x = state.x && state.x.ubicacion; return isObj(x) ? x : null; }
  function cleanLast(l) {
    if (!isObj(l) || !isDay(l.day)) return null;
    var out = { day: l.day, start: Math.max(1, Math.floor(Number(l.start)) || 1), units: [], lessons: {}, srs: [] };
    if (Array.isArray(l.units)) out.units = l.units.filter(function (id) { return typeof id === "string" && ID_RE.test(id); });
    if (isObj(l.lessons)) Object.keys(l.lessons).forEach(function (id) {
      var p = l.lessons[id];
      if (!ID_RE.test(id)) return;
      out.lessons[id] = isObj(p) ? { best: Math.min(100, nonNeg(p.best)), done: !!p.done, times: nonNeg(p.times) } : null;
    });
    if (Array.isArray(l.srs)) out.srs = l.srs.filter(function (id) { return typeof id === "string" && ID_RE.test(id); });
    return out;
  }
  function lastOf() { var x = own(); return x ? cleanLast(x.last) : null; }
  function mine() {
    var x = xstate("ubicacion"), last = cleanLast(x.last);
    Object.keys(x).forEach(function (k) { if (k !== "hide" && k !== "last") delete x[k]; });
    x.hide = x.hide === true;
    x.last = last;
    return x;
  }
  function doneCount() { return COURSE.lessons.filter(lessonDone).length; }
  function eligible() { var x = own(); return COURSE.units.length > 0 && !(x && x.hide === true) && !lastOf() && doneCount() < FEW; }

  /* ---------- Preguntas ---------- */
  function usableVocab(v) { return v.conf === "alta" && v.nw >= 1 && v.nw <= 5 && !/…|\.\.\./.test(v.m); }
  function allAlta() { return COURSE.vocab.filter(usableVocab); }
  // Tres distractores, también de confianza alta: primero de la misma unidad, luego del resto del curso.
  function distractors(v, field) {
    var seen = {}, out = [];
    seen[normalize(v[field])] = 1;
    var pool = shuffle(v.unit.vocab.filter(usableVocab)).concat(shuffle(allAlta().filter(function (x) { return x.unit !== v.unit; })));
    for (var i = 0; i < pool.length && out.length < 3; i++) {
      var x = pool[i], k = normalize(x[field]);
      if (x === v || seen[k] || normalize(x.es) === normalize(v.es) || normalize(x.m) === normalize(v.m)) continue;
      seen[k] = 1; out.push(x);
    }
    return out;
  }
  function makeQ(v, dir) {
    var a = dir === "m2es" ? nativeFor(v) : null, field = dir === "m2es" ? "es" : "m";
    var opts = shuffle([v].concat(distractors(v, field)));
    return { v: v, dir: dir, audio: a, opts: opts, answer: opts.indexOf(v) };
  }
  function unitQs(u) {
    var seen = {}, pool = shuffle(u.vocab.filter(usableVocab)).filter(function (v) {
      var k = normalize(v.es);
      if (seen[k]) return false;
      seen[k] = 1; return true;
    }).slice(0, Q_UNIT + 1);
    var flip = Math.random() < 0.5;
    return pool.map(function (v, i) { return makeQ(v, (i % 2 === 0) !== flip ? "m2es" : "es2m"); });
  }

  /* ---------- Prueba ---------- */
  var T = null; // { units: [{ u, qs, asked, right }], ui, total, passed: [{ u, pct }], start, cut, phase, applied }
  function newTest() {
    T = { units: COURSE.units.map(function (u) { return { u: u, qs: null, asked: 0, right: 0 }; }), ui: 0, total: 0, passed: [], start: null, cut: false, phase: "q", applied: null };
    prepUnit();
    if (!curUnit() || !curUnit().qs.length) finish(false);
  }
  function prepUnit() { var cu = T.units[T.ui]; if (cu && !cu.qs) cu.qs = unitQs(cu.u); }
  function curUnit() { return T && T.units[T.ui]; }
  function curQ() { var cu = curUnit(); return T && T.phase === "q" && cu && cu.qs ? cu.qs[cu.asked] || null : null; }
  function pctOf(cu) { return cu.asked ? Math.round(cu.right / cu.asked * 100) : 0; }
  function finish(cut) {
    T.cut = !!cut;
    var cu = curUnit();
    T.start = cu ? cu.u : null;
    T.phase = "result";
    stopAudio();
  }
  function answer(i) {
    var q = curQ(), cu = curUnit();
    if (!q) return;
    cu.asked++; T.total++;
    if (i === q.answer) cu.right++;
    var need = Math.min(Q_UNIT, cu.qs.length), wrong = cu.asked - cu.right, pass = null;
    if (cu.asked >= need) {
      if (pctOf(cu) >= PASS) pass = true;
      else if (cu.asked < cu.qs.length && wrong === 1) pass = null;      // 3 de 4: una de desempate
      else pass = false;
    }
    if (pass === true) {
      T.passed.push({ u: cu.u, pct: pctOf(cu) });
      T.ui++;
      if (T.ui >= T.units.length) { finish(false); return; }
      prepUnit();
      if (!curUnit().qs.length) { finish(false); return; }
    } else if (pass === false) { finish(false); return; }
    if (T.total >= MAX_Q) finish(true);
  }

  /* ---------- Aplicar y deshacer ---------- */
  function apply() {
    if (!T || !T.passed.length || T.applied) return;
    var x = mine(), t = today(), last = { day: t, start: T.start ? T.start.n : COURSE.units.length + 1, units: [], lessons: {}, srs: [] };
    T.passed.forEach(function (p) {
      last.units.push(p.u.id);
      p.u.lessons.forEach(function (l) {
        var prev = state.lessons[l.id];
        if (!(prev && prev.done)) {
          last.lessons[l.id] = prev ? { best: prev.best, done: !!prev.done, times: prev.times } : null;
          state.lessons[l.id] = prev ? { best: Math.max(prev.best || 0, p.pct), done: true, times: prev.times || 0 } : { best: p.pct, done: true, times: 0 };
        }
        // Se reparten en 7 días (unas 15 por día) para no dejar cientos de repasos pendientes el mismo día.
        l.vocab.forEach(function (v) { if (srsEnroll(v.id, addDays(t, Math.floor(last.srs.length / 15) % 7))) last.srs.push(v.id); });
      });
    });
    x.last = last;
    save();
    T.applied = { lessons: Object.keys(last.lessons).length, words: last.srs.length };
    T.phase = "applied";
    U.dirty = true;
  }
  // Quita del historial FSRS el alta de la palabra (su última calificación «Bien»).
  function unlog(ids) {
    var f = state.x && state.x.fsrs, log = f && Array.isArray(f.log) ? f.log : null, want = {};
    if (!log) return;
    ids.forEach(function (id) { want[id] = 1; });
    for (var i = log.length - 1; i >= 0; i--) {
      var e = log[i];
      if (Array.isArray(e) && want[e[1]] && e[2] === 3) { delete want[e[1]]; log.splice(i, 1); }
    }
  }
  function undo() {
    var x = mine(), last = x.last;
    if (!last) return null;
    var res = { lessons: 0, words: 0, kept: 0 };
    Object.keys(last.lessons).forEach(function (id) {
      var now = state.lessons[id], prev = last.lessons[id];
      if (!now || nonNeg(now.times) > (prev ? prev.times : 0)) { res.kept++; return; } // se volvió a hacer: se respeta
      if (prev) state.lessons[id] = prev; else delete state.lessons[id];
      res.lessons++;
    });
    var gone = last.srs.filter(function (id) {
      var r = state.srs[id];
      return r && (Number(r.reps) || 1) <= 1 && !r.right && !r.wrong;           // aún sin repasar
    });
    gone.forEach(function (id) { delete state.srs[id]; });
    unlog(gone);
    res.words = gone.length;
    x.last = null;
    save();
    U.dirty = true;
    return res;
  }

  /* ---------- Pantalla completa ---------- */
  var U = { open: false, root: null, prev: "home", opener: null, dirty: false, goUnit: null, undone: null, afterPop: null };

  function ensureRoot() {
    if (U.root) return;
    var host = $("#app") || document.body, r = document.createElement("div");
    r.className = "ub"; r.id = "ub-root"; r.hidden = true;
    r.setAttribute("role", "dialog"); r.setAttribute("aria-modal", "true"); r.setAttribute("aria-labelledby", "ub-h");
    r.addEventListener("click", onClick);
    host.appendChild(r);
    U.root = r;
  }
  function unitName(u) { return "unidad " + u.n; }
  function mSpan(s) { return '<span class="m" lang="yua">' + esc(s) + "</span>"; }
  function introHTML() {
    return '<header class="ub-head"><p class="eyebrow">Prueba de ubicación</p><h1 id="ub-h">¿Ya sabes algo de maya?</h1></header>' +
      '<div class="card ub-box"><p>Si ya entiendes algo de maya, por ejemplo porque lo escuchaste en casa, esta prueba corta te ayuda a ' +
      "<strong>no empezar desde cero</strong>. No es un examen: solo sirve para ahorrarte tiempo.</p>" +
      '<ul class="ub-list"><li>Vamos unidad por unidad con unas ' + Q_UNIT + " palabras de cada una.</li>" +
      "<li>Si no conoces una palabra, toca «No la conozco»; no pasa nada.</li>" +
      "<li>Puedes terminar cuando quieras. Al final te decimos dónde te conviene empezar, y tú decides.</li></ul></div>" +
      '<div class="ub-act"><button class="btn primary wide" type="button" data-act="start" id="ub-start">Empezar la prueba</button>' +
      '<button class="btn text wide" type="button" data-act="back">Ahora no</button></div>';
  }
  function questionHTML() {
    var q = curQ(), cu = curUnit(), n = COURSE.units.length;
    if (!q) return "";
    var v = q.v, m2es = q.dir === "m2es", prompt;
    if (q.audio) prompt = '<p class="ub-ask">Escucha. ¿Qué significa?</p><div class="ub-word ub-listen">' + auBtn(q.audio, v.m, "lg", "ub-au") + "</div>";
    else if (m2es) prompt = '<p class="ub-ask">¿Qué significa?</p><p class="ub-word" id="ub-word">' + mSpan(v.m) + "</p>";
    else prompt = '<p class="ub-ask">¿Cómo se dice en maya?</p><p class="ub-word ub-es" id="ub-word">' + esc(v.es) + "</p>";
    var opts = '<div class="opts ub-opts" role="group" aria-label="Opciones">' + q.opts.map(function (o, i) {
      var txt = m2es ? '<span class="opt-txt">' + esc(o.es) + "</span>" : '<span class="opt-txt m" lang="yua">' + esc(o.m) + "</span>";
      return '<button class="opt" type="button" id="ub-opt-' + i + '" data-act="opt" data-i="' + i + '"><span class="key" aria-hidden="true">' + (i + 1) + "</span>" + txt + "</button>";
    }).join("") + "</div>";
    var doneU = T.ui, pct = Math.round(doneU / n * 100);
    return '<header class="ub-head"><p class="eyebrow" id="ub-where">Unidad ' + cu.u.n + " de " + n + " · " + esc(cu.u.title) + "</p>" +
      '<h1 id="ub-h" class="sr-only">Prueba de ubicación</h1>' +
      '<div class="bar yaax" role="progressbar" aria-label="Unidades que ya conoces" aria-valuemin="0" aria-valuemax="' + n + '" aria-valuenow="' + doneU + '"><span style="width:' + pct + '%"></span></div></header>' +
      '<section class="ub-q card" aria-labelledby="ub-word">' + prompt + opts + "</section>" +
      '<div class="ub-act"><button class="btn text wide" type="button" data-act="opt" data-i="-1" id="ub-skip">No la conozco</button>' +
      '<button class="btn ghost wide" type="button" data-act="stop" id="ub-stop">Terminar aquí</button></div>';
  }
  function passedList() {
    return '<ul class="ub-units">' + T.passed.map(function (p) {
      return '<li><span>Unidad ' + p.u.n + " · " + esc(p.u.title) + '</span><span class="num ub-pct">' + p.pct + " %</span></li>";
    }).join("") + "</ul>";
  }
  function resultHTML() {
    var k = T.passed.length, h = '<header class="ub-head"><p class="eyebrow">Resultado</p>';
    if (!k) {
      return h + '<h1 id="ub-h">Te conviene empezar en la unidad 1</h1></header>' +
        '<div class="card ub-box"><p>Así repasas la base con calma. Con lo que ya sabes vas a avanzar rápido.</p></div>' +
        '<div class="ub-act"><button class="btn primary wide" type="button" data-act="back" id="ub-close">Ir al inicio</button>' +
        '<button class="btn text wide" type="button" data-act="start">Hacer la prueba otra vez</button></div>';
    }
    var title = T.start ? "Puedes empezar en la unidad " + T.start.n : "Ya conoces lo básico de todo el curso";
    h += '<h1 id="ub-h">' + esc(title) + "</h1></header>";
    h += '<div class="card ub-box"><p>Reconociste muy bien ' + (k === 1 ? "la unidad 1" : "las unidades 1 a " + k) + ":</p>" + passedList() +
      (T.cut ? '<p class="muted ub-note">La prueba terminó antes de cerrar la ' + esc(unitName(T.start)) + ", así que empiezas ahí.</p>" : "") + "</div>";
    if (T.phase === "confirm") {
      var nl = 0, nw = 0;
      T.passed.forEach(function (p) {
        p.u.lessons.forEach(function (l) { if (!lessonDone(l)) nl++; l.vocab.forEach(function (v) { if (!state.srs[v.id]) nw++; }); });
      });
      return h + '<div class="card ub-confirm" id="ub-confirm" role="group" aria-labelledby="ub-cq"><p id="ub-cq"><strong>¿Marcamos ' + nl + " " + plural(nl, "lección", "lecciones") + " como vistas?</strong></p>" +
        '<p class="muted">Sus ' + nw + " " + plural(nw, "palabra entra", "palabras entran") + " a tu repaso para confirmar con el tiempo lo que ya sabes. " +
        "No suma XP ni cambia tu racha, y puedes deshacerlo desde Perfil.</p>" +
        '<div class="ub-act"><button class="btn primary wide" type="button" data-act="apply" id="ub-apply">Sí, marcarlas</button>' +
        '<button class="btn text wide" type="button" data-act="cancel" id="ub-cancel">Mejor no</button></div></div>';
    }
    return h + '<div class="ub-act"><button class="btn primary wide" type="button" data-act="ask" id="ub-ask">' +
      (k === 1 ? "Marcar la unidad 1 como vista" : "Marcar las unidades 1 a " + k + " como vistas") + "</button>" +
      '<button class="btn text wide" type="button" data-act="back" id="ub-close">Prefiero empezar desde el principio</button></div>';
  }
  function appliedHTML() {
    var a = T.applied, s = T.start;
    return '<header class="ub-head"><p class="eyebrow">Listo</p><h1 id="ub-h">' + (s ? "Empiezas en la unidad " + s.n : "Ya puedes repasar todo el curso") + "</h1></header>" +
      '<div class="card ub-box" id="ub-done"><p>Marcamos ' + a.lessons + " " + plural(a.lessons, "lección", "lecciones") + " como vistas y " + a.words + " " +
      plural(a.words, "palabra entró", "palabras entraron") + " a tu repaso. Con cada repaso, la app irá confirmando lo que ya sabes.</p></div>" +
      '<div class="ub-act">' + (s ? '<button class="btn primary wide" type="button" data-act="go" id="ub-go">Ir a la unidad ' + s.n + "</button>"
        : '<button class="btn primary wide" type="button" data-act="back" id="ub-close">Ir al inicio</button>') +
      '<button class="btn ghost wide" type="button" data-act="undo-ask" id="ub-undo">Deshacer la ubicación</button></div>';
  }
  function undoHTML() {
    var last = lastOf();
    if (U.undone) {
      var r = U.undone;
      return '<header class="ub-head"><p class="eyebrow">Ubicación deshecha</p><h1 id="ub-h">Todo como antes</h1></header>' +
        '<div class="card ub-box" id="ub-undone"><p>Se desmarcaron ' + r.lessons + " " + plural(r.lessons, "lección", "lecciones") + " y salieron del repaso " + r.words + " " + plural(r.words, "palabra", "palabras") + ".</p>" +
        (r.kept ? '<p class="muted ub-note">Las lecciones que ya volviste a hacer y las palabras que ya repasaste se quedan como están.</p>' : "") + "</div>" +
        '<div class="ub-act"><button class="btn primary wide" type="button" data-act="back" id="ub-close">Ir al inicio</button></div>';
    }
    if (!last) return '<header class="ub-head"><h1 id="ub-h">No hay ubicación que deshacer</h1></header><div class="ub-act"><button class="btn primary wide" type="button" data-act="back" id="ub-close">Volver</button></div>';
    var nl = Object.keys(last.lessons).length;
    return '<header class="ub-head"><p class="eyebrow">Prueba de ubicación</p><h1 id="ub-h">¿Deshacer la última ubicación?</h1></header>' +
      '<div class="card ub-confirm" id="ub-confirm" role="group" aria-labelledby="ub-h"><p>Se desmarcarán las ' + nl + " " + plural(nl, "lección", "lecciones") +
      " que marcó la prueba y saldrán del repaso las palabras que aún no has repasado. Lo que ya volviste a hacer se queda.</p>" +
      '<div class="ub-act"><button class="btn primary wide" type="button" data-act="undo" id="ub-undo-yes">Sí, deshacer</button>' +
      '<button class="btn text wide" type="button" data-act="back" id="ub-cancel">No, dejarla</button></div></div>';
  }
  function viewHTML() {
    var body = U.mode === "undo" ? undoHTML() : !T ? introHTML() : T.phase === "q" ? questionHTML() : T.phase === "applied" ? appliedHTML() : resultHTML();
    return '<div class="ub-wrap"><div class="ub-top"><button class="icon-btn" type="button" data-act="back" aria-label="Volver" id="ub-back">' + BACK + "</button>" +
      '<span class="ub-crumb">Ya sé algo de maya</span></div><div class="ub-main">' + body + "</div></div>";
  }
  function render(focusSel) {
    U.root.innerHTML = viewHTML();
    U.root.scrollTop = 0;
    var f = (focusSel && $(focusSel, U.root)) || $("#ub-h", U.root);
    if (f) {
      if (!/^(BUTTON|A|INPUT)$/.test(f.tagName) && !f.hasAttribute("tabindex")) f.setAttribute("tabindex", "-1");
      try { f.focus({ preventScroll: true }); } catch (e) { /* sin efecto */ }
    }
  }
  function openView(opener, mode) {
    if (U.open) return;
    ensureRoot();
    U.open = true; U.prev = screen; U.opener = opener || null; U.mode = mode || "test"; U.dirty = false; U.goUnit = null; U.undone = null;
    T = null;
    U.root.hidden = false;
    document.body.classList.add("locked", "ub-open");
    screen = "ubicacion";
    histPush("ubicacion");
    render(mode === "undo" ? "#ub-undo-yes" : "#ub-start");
  }
  function closeView(fromPop) {
    if (!U.open) return;
    stopAudio();
    U.open = false; T = null;
    U.root.hidden = true; U.root.innerHTML = "";
    document.body.classList.remove("locked", "ub-open");
    screen = U.prev || "home";
    var popping = !fromPop && histState() === "ubicacion";
    if (popping) { try { history.back(); } catch (e) { popping = false; } }
    var op = U.opener, go = U.goUnit;
    U.opener = null; U.goUnit = null;
    if (U.dirty) {
      U.dirty = false;
      showTab(go ? "aprender" : tab, { keepScroll: !go });
      if (go) {
        // Al volver en el historial el navegador restaura el desplazamiento: se va a la unidad después del popstate.
        var goTo = function () {
          U.afterPop = null;
          var target = $("#unit-" + go);
          if (target) { target.scrollIntoView({ block: "start" }); var b = $("button", target); if (b) b.focus({ preventScroll: true }); }
        };
        if (popping) { U.afterPop = goTo; setTimeout(function () { if (U.afterPop === goTo) goTo(); }, 400); } else goTo();
      }
      return;
    }
    if (op && document.contains(op)) op.focus({ preventScroll: true });
  }
  function onClick(e) {
    var t = e.target.closest("[data-act]");
    if (!t) return;
    var a = t.getAttribute("data-act");
    if (a === "back") closeView(false);
    else if (a === "start") { U.mode = "test"; newTest(); render(T.phase === "q" ? "#ub-au, #ub-word" : null); }
    else if (a === "opt") { answer(Number(t.getAttribute("data-i"))); render(T.phase === "q" ? "#ub-au, #ub-word" : null); }
    else if (a === "stop") { finish(false); render(); }
    else if (a === "ask") { T.phase = "confirm"; render("#ub-apply"); }
    else if (a === "cancel") { T.phase = "result"; render("#ub-ask"); }
    else if (a === "apply") { apply(); render("#ub-go"); }
    else if (a === "go") { U.goUnit = T.start ? T.start.id : null; closeView(false); }
    else if (a === "undo-ask") { U.mode = "undo"; render("#ub-undo-yes"); }
    else if (a === "undo") { U.undone = undo(); render("#ub-close"); }
  }
  window.addEventListener("popstate", function () {
    if (U.open) closeView(true);
    else if (U.afterPop) { var f = U.afterPop; setTimeout(function () { if (U.afterPop === f) f(); }, 0); }
  });
  document.addEventListener("visibilitychange", function () {
    if (U.open && document.visibilityState === "visible") screen = "ubicacion";
  });
  document.addEventListener("keydown", function (e) {
    if (!U.open || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "Escape") { e.preventDefault(); closeView(false); }
    else if (e.key === "Tab") trapFocus(e, U.root);
    else if (/^[1-4]$/.test(e.key) && curQ()) { var b = $("#ub-opt-" + (Number(e.key) - 1), U.root); if (b) { e.preventDefault(); b.click(); } }
  });

  /* ---------- Ganchos del núcleo ---------- */
  registerModule({
    homeTop: function () {
      if (!eligible()) return "";
      return '<section class="card ub-card" id="ub-card" aria-labelledby="ub-card-t"><div class="ub-card-txt"><h2 class="ub-card-t" id="ub-card-t">¿Ya sabes algo de maya?</h2>' +
        '<p class="muted">Haz la prueba de ubicación y empieza donde te toca, sin repetir lo que ya sabes.</p></div>' +
        '<div class="btn-row"><button class="btn tonal" type="button" id="btn-home-ubicacion">Hacer la prueba</button>' +
        '<button class="btn text" type="button" id="btn-home-ubicacion-no">Ahora no</button></div></section>';
    },
    profile: function () {
      var last = lastOf();
      var h = '<section class="section ub-prof" id="ubicacion" aria-labelledby="ubicacion-title"><h2 id="ubicacion-title">Prueba de ubicación</h2>';
      if (last) h += '<p>Tu última ubicación te propuso empezar en la unidad ' + last.start + ". Marcó " + Object.keys(last.lessons).length + " " +
        plural(Object.keys(last.lessons).length, "lección", "lecciones") + " como vistas.</p>";
      else h += '<p class="muted">¿Ya entiendes algo de maya? Una prueba corta te dice en qué unidad te conviene empezar.</p>';
      return h + '<div class="btn-row"><button class="btn tonal" type="button" id="btn-profile-ubicacion">' + (last ? "Hacer la prueba otra vez" : "Hacer la prueba") + "</button>" +
        (last ? '<button class="btn ghost" type="button" id="btn-profile-ubicacion-undo">Deshacer la ubicación</button>' : "") + "</div></section>";
    },
    bind: function (root, where) {
      var b = $(where === "home" ? "#btn-home-ubicacion" : "#btn-profile-ubicacion", root);
      if (b) b.addEventListener("click", function () { openView(b, "test"); });
      var u = where === "profile" && $("#btn-profile-ubicacion-undo", root);
      if (u) u.addEventListener("click", function () { openView(u, "undo"); });
      var no = where === "home" && $("#btn-home-ubicacion-no", root);
      if (no) no.addEventListener("click", function () {
        mine().hide = true;
        save();
        var card = $("#ub-card", root), nx = card && card.nextElementSibling;
        if (card) card.remove();
        var f = nx && (nx.matches("button") ? nx : $("button", nx));
        if (f) f.focus({ preventScroll: true });
        toast("Listo. Si cambias de idea, la prueba está en Perfil.");
      });
    }
  });

  // Para las pruebas (test/ubicacion.cjs): qué se pregunta y en qué fase va, sin tocar el estado.
  if (window.__koox) window.__koox.ubicacion = {
    view: function () { return { open: U.open, mode: U.mode || null, phase: T ? T.phase : null }; },
    current: function () {
      var q = curQ();
      return q ? { unit: q.v.unit.n, id: q.v.id, dir: q.dir, listen: !!q.audio, answer: q.answer, opts: q.opts.map(function (o) { return o.id; }) } : null;
    },
    test: function () {
      return T ? { total: T.total, passed: T.passed.map(function (p) { return { unit: p.u.n, pct: p.pct }; }), start: T.start ? T.start.n : null, cut: T.cut,
        units: T.units.filter(function (c) { return c.asked; }).map(function (c) { return { unit: c.u.n, asked: c.asked, right: c.right }; }) } : null;
    },
    eligible: eligible,
    limits: { perUnit: Q_UNIT, pass: PASS, max: MAX_Q, few: FEW }
  };
})();
