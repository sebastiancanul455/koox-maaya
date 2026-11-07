/* ================= Mi milpa (kool) ================= */
// Una metáfora amable del repaso: cada palabra de state.srs es una planta de la milpa tradicional (maíz, frijol o
// calabaza, elegida por su id de forma determinista). Su etapa sale del nivel (box 1–5): semilla, brote, mata,
// en flor, con fruto. Las palabras que tocan hoy (o antes) están «listas para cosechar», con una marca dorada.
// Nada se marchita ni se pierde: una palabra que baja de nivel solo vuelve a una etapa anterior.
// Sin monedas, sin metas y sin comparaciones. No guarda estado propio: todo se deriva de state.srs.
// Pantallas: tarjeta en Inicio (homeTop, marcada .gami: el modo tranquilo la oculta) y sección en Perfil (sin .gami:
// en modo tranquilo la vista completa sigue a mano desde ahí). La vista completa va a pantalla completa sobre la
// pestaña, con una entrada de historial: Atrás de Android cierra primero la hoja de la planta y luego la vista.
// Usa del núcleo: state, esc, $, $$, COURSE, srsEntries, today, daysFrom, clamp, plural, histPush, histState,
// trapFocus, startReview, screen y S (sesión activa).
(function () {
  var KINDS = [
    { k: "maiz", name: "maíz" },
    { k: "frijol", name: "frijol" },
    { k: "calabaza", name: "calabaza" }
  ];
  var STAGES = ["semilla", "brote", "mata", "en flor", "con fruto"];
  var MINI = 10; // plantas en la fila de la tarjeta de Inicio
  var BACK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';

  /* ---------- Datos derivados ---------- */
  // Tipo de planta por id: un hash sencillo y estable (el mismo id da siempre la misma planta).
  function kindOf(id) {
    var h = 0, s = String(id);
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return KINDS[h % 3];
  }
  function stageOf(r) { return clamp(Math.round(Number(r && r.box) || 0), 1, 5); } // nivel 0 (recién sembrada) = semilla
  function plants() {
    var t = today(), order = {};
    COURSE.vocab.forEach(function (v, i) { order[v.id] = i; });
    return srsEntries().map(function (e) {
      return { v: e.v, r: e.r, kind: kindOf(e.v.id), stage: stageOf(e.r), ready: !e.r.due || e.r.due <= t };
    }).sort(function (a, b) { return order[a.v.id] - order[b.v.id]; });
  }
  function summary(ps) {
    var by = [0, 0, 0, 0, 0], ready = 0;
    ps.forEach(function (p) { by[p.stage - 1]++; if (p.ready) ready++; });
    return { total: ps.length, ready: ready, byStage: by };
  }
  function countText(s) {
    return s.total + " " + plural(s.total, "planta", "plantas") + " · " + s.ready + " " + plural(s.ready, "lista", "listas") + " para cosechar";
  }
  function koolWord() {
    var v = COURSE.vocab.filter(function (x) { return x.m === "kool"; })[0];
    return v ? '<span class="m" lang="yua">' + esc(v.m) + "</span>" : "";
  }

  /* ---------- Dibujo (SVG por código; los colores salen del CSS con tokens del tema) ---------- */
  var ART = {
    maiz: [
      '<ellipse class="ml-seed" cx="20" cy="41" rx="3.6" ry="2.6"/>',
      '<path class="ml-stem" d="M20 44V33"/><path class="ml-leaf-l" d="M20 39q-6-1-8-6q5 0 8 4"/><path class="ml-leaf-l" d="M20 36q6-1 8-6q-5 0-8 4"/>',
      '<path class="ml-stem" d="M20 44V18"/><path class="ml-leaf-l" d="M20 40q-9 0-13-8q7 1 13 6"/><path class="ml-leaf-l" d="M20 33q9 0 13-8q-7 1-13 6"/><path class="ml-leaf-l" d="M20 26q-7 0-10-7q6 1 10 5"/>',
      '<path class="ml-flower-s" d="M20 18V10M20 18l-4-6M20 18l4-6"/>',
      '<path class="ml-fruit" d="M22 34c1-6 4-9 6-9c1 3-1 8-6 9z"/><path class="ml-leaf-l" d="M21 35q1-6 4-8q-1 5-4 8"/>'
    ],
    frijol: [
      '<ellipse class="ml-seed" cx="20" cy="41" rx="4" ry="2.4"/>',
      '<path class="ml-stem" d="M20 44V36"/><circle class="ml-leaf" cx="16.5" cy="35" r="3.2"/><circle class="ml-leaf" cx="23.5" cy="35" r="3.2"/>',
      '<path class="ml-stem" d="M20 44C17 37 23 30 20 20"/><ellipse class="ml-leaf" cx="14" cy="34" rx="4.5" ry="3"/><ellipse class="ml-leaf" cx="26" cy="30" rx="4.5" ry="3"/><ellipse class="ml-leaf" cx="15" cy="24" rx="4" ry="2.8"/><ellipse class="ml-leaf" cx="21" cy="18" rx="3.4" ry="3"/>',
      '<circle class="ml-flower" cx="25" cy="22" r="2.2"/><circle class="ml-flower" cx="12" cy="29" r="2.2"/>',
      '<path class="ml-pod" d="M27 26q2 6-1 11"/><path class="ml-pod" d="M13 30q-2 5 0 9"/>'
    ],
    calabaza: [
      '<ellipse class="ml-seed" cx="20" cy="41" rx="3.2" ry="2.2"/>',
      '<path class="ml-stem" d="M20 44V37"/><ellipse class="ml-leaf" cx="16" cy="36" rx="4" ry="2.6"/><ellipse class="ml-leaf" cx="24" cy="36" rx="4" ry="2.6"/>',
      '<path class="ml-stem" d="M5 42Q20 34 35 42"/><circle class="ml-leaf" cx="10" cy="34" r="5"/><circle class="ml-leaf" cx="21" cy="30" r="6"/><circle class="ml-leaf" cx="31" cy="34" r="5"/>',
      '<path class="ml-flower" d="M27 22l2 3.5 4-.5-2.5 3 2 3.5-4-1-2.5 3-.5-4-4-1.5 3.5-2z"/>',
      '<ellipse class="ml-fruit" cx="21" cy="39" rx="8" ry="5"/><path class="ml-rib" d="M21 34.5v9M16.5 35.5q-1 3.5 0 7M25.5 35.5q1 3.5 0 7"/>'
    ]
  };
  function plantSVG(p) {
    var parts = ART[p.kind.k], h = '<path class="ml-soil" d="M4 44.5h32"/>';
    if (p.stage === 1) h += parts[0];
    else for (var i = 1; i < p.stage; i++) h += parts[i];
    if (p.ready) h += '<circle class="ml-mark" cx="34" cy="7" r="4.5"/>';
    return '<svg class="ml-svg" viewBox="0 0 40 48" aria-hidden="true" focusable="false">' + h + "</svg>";
  }
  function plantLabel(p) {
    return p.v.m + ", " + p.v.es + ": " + p.kind.name + ", " + STAGES[p.stage - 1] + ", nivel " + p.stage + " de 5" + (p.ready ? ", lista para cosechar" : "");
  }
  function miniRow(ps) {
    // Primero las listas para cosechar; luego las más crecidas. Solo adorno: el conteo va en el aria-label.
    var pick = ps.slice().sort(function (a, b) { return (b.ready - a.ready) || (b.stage - a.stage); }).slice(0, MINI);
    return '<span class="ml-mini" aria-hidden="true">' + pick.map(function (p) {
      return '<span class="ml-p ml-' + p.kind.k + " st-" + p.stage + (p.ready ? " ml-ready" : "") + '">' + plantSVG(p) + "</span>";
    }).join("") + "</span>";
  }
  function stageList(s) {
    return '<ul class="ml-stages">' + STAGES.map(function (n, i) {
      var demo = { kind: KINDS[1], stage: i + 1, ready: false };
      return '<li><span class="ml-p ml-frijol st-' + (i + 1) + '" aria-hidden="true">' + plantSVG(demo) + '</span><span class="ml-st-n num">' + s.byStage[i] +
        '</span><span class="ml-st-t">' + n + "</span></li>";
    }).join("") + "</ul>";
  }

  /* ---------- Pantalla completa ---------- */
  var M = { open: false, root: null, sheetEl: null, sheet: null, prev: "home", opener: null, list: [] };

  function ensureRoot() {
    if (M.root) return;
    var host = $("#app") || document.body, r = document.createElement("div");
    r.className = "ml"; r.id = "ml-root"; r.hidden = true;
    r.setAttribute("role", "dialog"); r.setAttribute("aria-modal", "true"); r.setAttribute("aria-labelledby", "ml-h");
    r.addEventListener("click", onClick);
    host.appendChild(r);
    var s = document.createElement("div");
    s.className = "overlay bottom-sheet ml-sheet"; s.id = "ml-sheet"; s.hidden = true;
    s.innerHTML = '<div class="scrim" data-act="sheet-close"></div><div class="modal bottom" role="dialog" aria-modal="true" aria-labelledby="ml-w-title" id="ml-modal"></div>';
    s.addEventListener("click", onClick);
    host.appendChild(s);
    M.root = r; M.sheetEl = s;
  }
  function viewHTML() {
    var ps = plants(), s = summary(ps), kool = koolWord();
    M.list = ps;
    var h = '<div class="ml-wrap"><div class="ml-top"><button class="icon-btn" type="button" data-act="back" aria-label="Volver">' + BACK + "</button>" +
      '<span class="ml-crumb">Mi milpa</span></div><div class="ml-main">' +
      '<header class="ml-head"><p class="eyebrow">' + (kool ? kool + " · " : "") + "la milpa</p>" +
      '<h1 id="ml-h">Mi milpa</h1>';
    if (!s.total) {
      return h + "</header>" + '<div class="ml-empty card">' + '<span class="ml-p ml-maiz st-1" aria-hidden="true">' + plantSVG({ kind: KINDS[0], stage: 1, ready: false }) + "</span>" +
        "<p><strong>Siembra tu milpa:</strong> termina una lección y aparecerá tu primera planta.</p></div></div></div>";
    }
    h += '<p class="ml-sum" id="ml-sum" aria-label="' + esc(countText(s)) + '">' + esc(countText(s)) + "</p>" +
      '<p class="muted ml-intro">Cada palabra que repasas es una planta de maíz, frijol o calabaza. Crece con cada nivel y nunca se marchita; ' +
      "las que tienen la marca dorada están listas para cosechar hoy.</p></header>" +
      '<div class="ml-act"><button class="btn primary wide" type="button" id="ml-harvest" data-act="harvest">' +
      (s.ready ? "Cosechar (repasar " + s.ready + ")" : "Practicar un rato") + "</button>" +
      (s.ready ? "" : '<p class="muted ml-note">Hoy no hay nada listo para cosechar. Tus plantas siguen creciendo.</p>') + "</div>" +
      '<section class="ml-legend" aria-label="Plantas por etapa">' + stageList(s) + "</section>";
    COURSE.units.forEach(function (u) {
      var mine = ps.filter(function (p) { return p.v.unit === u; });
      if (!mine.length) return;
      var rd = mine.filter(function (p) { return p.ready; }).length, hid = "ml-u-" + esc(u.id);
      h += '<section class="ml-unit" aria-labelledby="' + hid + '"><h2 class="ml-ut" id="' + hid + '"><span class="eyebrow">Unidad ' + u.n + "</span>" +
        '<span class="ml-uc">' + mine.length + " " + plural(mine.length, "planta", "plantas") + (rd ? " · " + rd + " " + plural(rd, "lista", "listas") : "") + "</span></h2>" +
        '<ul class="ml-grid">' + mine.map(function (p) {
          return '<li><button class="ml-p ml-plant ml-' + p.kind.k + " st-" + p.stage + (p.ready ? " ml-ready" : "") + '" type="button" data-act="plant" data-id="' + esc(p.v.id) +
            '" aria-label="' + esc(plantLabel(p)) + '">' + plantSVG(p) + "</button></li>";
        }).join("") + "</ul></section>";
    });
    return h + "</div></div>";
  }
  function render() { M.root.innerHTML = viewHTML(); }
  function openView(opener) {
    if (M.open) return;
    ensureRoot();
    M.open = true; M.prev = screen; M.opener = opener || null;
    render();
    M.root.hidden = false; M.root.scrollTop = 0;
    document.body.classList.add("locked", "ml-open");
    screen = "milpa";
    histPush("milpa");
    var b = $("[data-act=back]", M.root);
    if (b) b.focus({ preventScroll: true });
  }
  // keepHist: la entrada de historial se queda para la sesión que se abre enseguida (openSession la reemplaza).
  function closeView(fromPop, keepHist) {
    if (!M.open) return;
    closeSheet(true);
    M.open = false;
    M.root.hidden = true; M.root.innerHTML = "";
    document.body.classList.remove("locked", "ml-open");
    screen = M.prev || "home";
    if (!fromPop && !keepHist && histState() === "milpa") { try { history.back(); } catch (e) { /* marco sin historial */ } }
    var op = M.opener;
    M.opener = null;
    if (!keepHist && op && document.contains(op)) op.focus({ preventScroll: true });
  }
  function harvest() {
    closeView(false, true);
    startReview();
    if (!S && histState() === "milpa") { try { history.back(); } catch (e) { /* marco sin historial */ } }
  }
  function sheetHTML(p) {
    var t = today(), d = p.r.due ? daysFrom(t, p.r.due) : 0;
    var when = p.ready ? "Lista para cosechar hoy." : "Estará lista para cosechar " + (d === 1 ? "mañana." : "en " + d + " días.");
    return '<p class="eyebrow">' + esc(p.kind.name.charAt(0).toUpperCase() + p.kind.name.slice(1)) + " · " + STAGES[p.stage - 1] + "</p>" +
      '<div class="ml-sh-head"><span class="ml-p ml-big ml-' + p.kind.k + " st-" + p.stage + (p.ready ? " ml-ready" : "") + '" aria-hidden="true">' + plantSVG(p) + "</span>" +
      '<div class="ml-sh-txt"><h2 id="ml-w-title" class="m" lang="yua">' + esc(p.v.m) + "</h2>" + '<p class="ml-gloss">' + esc(p.v.es) + "</p></div></div>" +
      '<p class="ml-lvl">Nivel <span class="num">' + p.stage + "</span> de 5 · " + STAGES[p.stage - 1] + "</p>" +
      '<p class="muted ml-when">' + when + " Unidad " + p.v.unit.n + ".</p>" +
      '<div class="modal-actions"><button class="btn text" type="button" id="ml-close" data-act="sheet-close">Cerrar</button></div>';
  }
  function openSheet(id, opener) {
    var p = M.list.filter(function (x) { return x.v.id === id; })[0];
    if (!p) return;
    M.sheet = { id: id, opener: opener || null };
    $("#ml-modal", M.sheetEl).innerHTML = sheetHTML(p);
    M.sheetEl.hidden = false;
    var f = $("#ml-close", M.sheetEl);
    if (f) f.focus({ preventScroll: true });
  }
  function closeSheet(quiet) {
    if (!M.sheet) return;
    var op = M.sheet.opener;
    M.sheet = null; M.sheetEl.hidden = true;
    if (!quiet && op && document.contains(op)) op.focus({ preventScroll: true });
  }
  function goBack() { if (M.sheet) closeSheet(); else closeView(false); }
  function onClick(e) {
    var t = e.target.closest("[data-act]");
    if (!t) return;
    var a = t.getAttribute("data-act");
    if (a === "back") goBack();
    else if (a === "sheet-close") closeSheet();
    else if (a === "harvest") harvest();
    else if (a === "plant") openSheet(t.getAttribute("data-id"), t);
  }
  window.addEventListener("popstate", function () {
    if (!M.open) return;
    if (M.sheet) { closeSheet(); histPush("milpa"); return; }
    closeView(true);
  });
  document.addEventListener("visibilitychange", function () {
    // El núcleo repinta la pestaña al volver (otro día puede haber más listas): la vista sigue encima, al día.
    if (M.open && document.visibilityState === "visible") { screen = "milpa"; if (!M.sheet) render(); }
  });
  document.addEventListener("keydown", function (e) {
    if (!M.open || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "Escape") { e.preventDefault(); goBack(); }
    else if (e.key === "Tab") trapFocus(e, M.sheet ? M.sheetEl : M.root);
  });

  /* ---------- Ganchos del núcleo ---------- */
  registerModule({
    homeTop: function () {
      var ps = plants(), s = summary(ps);
      var sub = s.total ? esc(countText(s)) : "Siembra tu milpa: termina una lección y aparecerá tu primera planta";
      var label = s.total ? "Mi milpa: " + countText(s) + ". Abrir la vista completa" : "Mi milpa: todavía sin plantas. Abrir";
      return '<button class="guide-link card ml-card gami" type="button" id="btn-home-milpa" aria-label="' + esc(label) + '">' +
        '<span class="gl-txt"><span class="gl-t">Mi milpa</span><span class="gl-s">' + sub + "</span>" + (s.total ? miniRow(ps) : "") + "</span></button>";
    },
    profile: function () {
      var s = summary(plants());
      var h = '<section class="section ml-prof" id="milpa" aria-labelledby="milpa-title"><h2 id="milpa-title">Mi milpa</h2>';
      if (!s.total) h += '<p class="muted">Siembra tu milpa: termina una lección y aparecerá tu primera planta.</p>';
      else h += '<p class="ml-sum">' + esc(countText(s)) + "</p>" + stageList(s);
      return h + '<div class="btn-row"><button class="btn tonal" type="button" id="btn-profile-milpa">Ver mi milpa</button></div></section>';
    },
    bind: function (root, where) {
      var b = $(where === "home" ? "#btn-home-milpa" : "#btn-profile-milpa", root);
      if (b) b.addEventListener("click", function () { openView(b); });
    }
  });

  // Para las pruebas (test/milpa.cjs): lo que se dibuja, sin tocar el estado.
  if (window.__koox) window.__koox.milpa = {
    plants: function () { return plants().map(function (p) { return { id: p.v.id, kind: p.kind.k, stage: p.stage, ready: p.ready }; }); },
    summary: function () { return summary(plants()); },
    view: function () { return { open: M.open, sheet: M.sheet ? M.sheet.id : null }; }
  };
})();
