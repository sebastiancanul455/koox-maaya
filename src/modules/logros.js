/* ================= Logros «Puedo…» ================= */
// Cuando una unidad tiene todas sus lecciones completas y su «Repaso de la unidad» se aprueba con 80 % o más, se abre
// su insignia «Puedo» y, en Perfil, la lista de lo que ya se puede hacer en maya. Los enunciados salen de
// window.COURSE_CANDO (src/content/puedo.js); la forma maya de cada ejemplo, del propio curso, nunca de ese archivo.
// Solo unidades: no hay logros por volumen, por racha ni secretos, y nada se pierde ni caduca.
// Estado propio (state.x.logros), saneado en cada lectura y creado solo cuando hay algo que guardar:
//   units: { <id de unidad>: { best, at } }  mejor % del repaso de la unidad (cuenta solo si la unidad ya estaba completa)
//   cando: { <id de unidad>: "AAAA-MM-DD" }  día en que se abrió la insignia
// Se evalúa al arrancar, al abrir Inicio o Perfil y al terminar cada sesión (por si una copia importada ya cumplía).
(function () {
  var PASS = 80; // % mínimo del repaso de la unidad
  var MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  var ID = /^[a-z0-9-]{1,24}$/;
  var own = Object.prototype.hasOwnProperty;
  var last = null; // { info, fresh }: lo que abrió la última sesión (results lo lee justo después de session)

  /* --- Contenido validado contra el curso --- */
  var DEFS = null;
  function defs() {
    if (DEFS) return DEFS;
    var out = {}, raw = window.COURSE_CANDO;
    if (isObj(raw)) COURSE.units.forEach(function (u) {
      var r = own.call(raw, u.id) ? raw[u.id] : null;
      if (!isObj(r)) return;
      var can = arr(r.can).map(function (c) {
        if (!isObj(c)) return null;
        var t = typeof c.t === "string" ? c.t.trim() : "", ex = str(c.ex);
        if (!t || t.length > 300) return null;
        return { t: t, ex: ex && own.call(COURSE.vocabById, ex) ? COURSE.vocabById[ex] : null };
      }).filter(Boolean).slice(0, 6);
      if (can.length) out[u.id] = can;
    });
    DEFS = out;
    return out;
  }
  function unitOf(uid) { return COURSE.units.filter(function (u) { return u.id === uid; })[0] || null; }
  function unitDone(u) { return !!u && u.lessons.length > 0 && u.lessons.every(lessonDone); }

  /* --- Estado --- */
  function view() {
    var raw = isObj(state.x) && isObj(state.x.logros) ? state.x.logros : {}, out = { units: {}, cando: {} };
    if (isObj(raw.units)) Object.keys(raw.units).forEach(function (k) {
      var r = raw.units[k];
      if (ID.test(k) && isObj(r)) out.units[k] = { best: clamp(nonNeg(r.best), 0, 100), at: isDay(r.at) ? r.at : "" };
    });
    if (isObj(raw.cando)) Object.keys(raw.cando).forEach(function (k) {
      if (ID.test(k) && isDay(raw.cando[k])) out.cando[k] = raw.cando[k];
    });
    return out;
  }
  // La parte de este módulo, ya saneada y lista para escribir (se crea aquí, nunca al leer).
  function store() {
    var L = xstate("logros"), v = view();
    L.units = v.units; L.cando = v.cando;
    return L;
  }

  /* --- Reglas --- */
  // Abre las insignias que ya cumplen (lecciones completas + repaso aprobado). Devuelve los ids recién abiertos.
  function evaluate() {
    var D = defs(), v = view(), fresh = [];
    COURSE.units.forEach(function (u) {
      var rec = v.units[u.id];
      if (D[u.id] && !v.cando[u.id] && rec && rec.best >= PASS && unitDone(u)) fresh.push(u.id);
    });
    if (fresh.length) {
      var L = store();
      fresh.forEach(function (id) { L.cando[id] = today(); });
      save();
    }
    return fresh;
  }
  function onSession(info) {
    var u = isObj(info) && info.kind === "unit" && isObj(info.unit) ? info.unit : null;
    // El repaso cuenta cuando la unidad ya estaba completa: así «Puedo» respalda lo que se aprendió de toda la unidad.
    if (u && defs()[u.id] && unitDone(u)) {
      var pct = clamp(Math.round(Number(info.pct) || 0), 0, 100), rec = view().units[u.id];
      if (!rec || pct > rec.best) { store().units[u.id] = { best: pct, at: today() }; save(); }
    }
    last = { info: info, fresh: evaluate() };
  }

  /* --- Presentación --- */
  function pc(n) { return '<span class="cd-nw">' + n + " %</span>"; } // «80 %» nunca se parte entre dos líneas
  function dateEs(k) { var p = isDay(k) ? k.split("-") : null; return p ? Number(p[2]) + " " + MESES[Number(p[1]) - 1] + " " + p[0] : ""; }
  function listHTML(uid) {
    var can = defs()[uid];
    if (!can) return "";
    return '<ul class="cd-list">' + can.map(function (c) {
      return "<li>" + ICON.check.replace("<svg", '<svg class="ico"') + '<span class="cd-txt"><span class="cd-t">' + esc(c.t) + "</span>" +
        (c.ex ? '<span class="cd-ex">Por ejemplo: ' + m(c.ex.m) + " · " + esc(c.ex.es) + "</span>" : "") + "</span></li>";
    }).join("") + "</ul>";
  }
  // Tarjeta de celebración sobria en los resultados (.gami: el modo tranquilo la oculta).
  function winHTML(u) {
    return '<section class="card cd-win gami" aria-labelledby="cd-win-' + esc(u.id) + '"><div class="greca" aria-hidden="true"></div>' +
      '<p class="eyebrow">Unidad ' + u.n + " · " + esc(u.title) + "</p>" +
      '<h2 id="cd-win-' + esc(u.id) + '">Lo que ya puedes hacer</h2>' + listHTML(u.id) +
      '<p class="muted">Queda guardado en Perfil, en «Lo que ya puedes decir».</p></section>';
  }
  // Tras un repaso de unidad que no abrió «Puedo»: qué falta, sin prisa (también .gami).
  function noteHTML(u) {
    var rec = view().units[u.id], txt;
    if (!unitDone(u)) txt = "Cuando termines todas las lecciones de esta unidad, haz su repaso otra vez: con " + pc(PASS) + " o más se abre «Puedo».";
    else txt = "Con " + pc(PASS) + " o más en el repaso de la unidad se abre «Puedo»" + (rec ? ". Tu mejor resultado: " + pc(rec.best) : "") +
      ". Puedes repetirlo cuando quieras.";
    return '<p class="cd-note muted gami">' + txt + "</p>";
  }
  function unitRow(u, v) {
    var open = !!v.cando[u.id], rec = v.units[u.id], done = u.lessons.filter(lessonDone).length;
    var h = '<li class="cd-unit ' + (open ? "on" : "off") + '" id="cando-' + esc(u.id) + '"><div class="cd-hd"><p class="eyebrow">Unidad ' + u.n + "</p><h3>" + esc(u.title) + "</h3>" +
      (open ? '<p class="cd-state">Desbloqueado el ' + dateEs(v.cando[u.id]) + "</p>" : "") + "</div>";
    if (open) return h + listHTML(u.id) + "</li>";
    return h + '<p>Termina la unidad y aprueba su repaso <span class="cd-nw">(' + PASS + " %)</span>.</p>" +
      '<p class="cd-meta muted">' + done + " de " + u.lessons.length + " " + plural(u.lessons.length, "lección", "lecciones") + " · " +
      (rec ? "Mejor repaso: " + pc(rec.best) : "Todavía sin repaso de la unidad") + "</p></li>";
  }

  registerModule({
    homeTop: function () { evaluate(); return ""; },
    // Insignia discreta en la cabecera de la unidad abierta; al tocarla muestra sus enunciados (sin JavaScript).
    unit: function (u) {
      if (!defs()[u.id] || !view().cando[u.id]) return "";
      return '<details class="cd-badge"><summary><span class="cd-chip">' + ICON.check.replace("<svg", '<svg class="ico"') + "Puedo</span>" +
        '<span class="sr-only">: ver lo que ya puedes hacer con esta unidad</span></summary><div class="cd-body">' + listHTML(u.id) + "</div></details>";
    },
    results: function (info) {
      var h = "", fresh = last && last.info === info ? last.fresh : [];
      fresh.forEach(function (id) { var u = unitOf(id); if (u) h += winHTML(u); });
      var u = isObj(info) && info.kind === "unit" && isObj(info.unit) ? info.unit : null;
      if (u && !fresh.length && defs()[u.id] && !view().cando[u.id]) h += noteHTML(u);
      return h;
    },
    profile: function () {
      evaluate();
      var D = defs(), units = COURSE.units.filter(function (u) { return D[u.id]; });
      if (!units.length) return "";
      var v = view(), on = units.filter(function (u) { return v.cando[u.id]; }).length;
      return '<section class="section cd-sec" id="cando" aria-labelledby="cando-title"><h2 id="cando-title">Lo que ya puedes decir</h2>' +
        '<p class="muted">Cuando terminas una unidad y apruebas su repaso con ' + pc(PASS) + " o más, aquí se abre lo que ya puedes hacer en maya. " +
        "No caduca ni se pierde: es un recuerdo de lo que has aprendido.</p>" +
        '<p class="cd-count"><b class="num">' + on + "</b> de " + units.length + " " + plural(units.length, "unidad", "unidades") + "</p>" +
        '<ol class="cd-units">' + units.map(function (u) { return unitRow(u, v); }).join("") + "</ol></section>";
    },
    session: onSession
  });

  try {
    evaluate(); // al arrancar: por si el avance (o una copia importada) ya cumplía
    // Gancho de pruebas (como el resto de window.__koox).
    window.__koox.logros = {
      pass: PASS,
      defs: function () {
        var D = defs(), o = {};
        Object.keys(D).forEach(function (k) { o[k] = D[k].map(function (c) { return { t: c.t, ex: c.ex ? c.ex.id : null }; }); });
        return o;
      },
      view: view,
      evaluate: evaluate,
      // Simula el final de una sesión (tipo, id de unidad y % de aciertos); devuelve los ids que abrió.
      session: function (kind, uid, pct) {
        onSession({ kind: kind, lesson: null, unit: unitOf(uid), pct: pct, right: pct, total: 100, newWords: [] });
        return last.fresh.slice();
      }
    };
  } catch (e) { /* un módulo no tumba la app */ }
})();
