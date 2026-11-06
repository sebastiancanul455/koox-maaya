/* Ko'ox Maaya · módulo «Lecturas»: leer en maya con apoyo, por pasatiempo.
   De dónde salen las lecturas (nunca se inventa maya):
     · los diálogos que ya tiene el curso (lesson.dialogue), y
     · window.COURSE_READINGS (src/content/lecturas.js): cuentos de otras fuentes que se agregan después de
       que un hablante los revise (el formato está documentado en ese archivo).
   Pantallas: tarjeta en Inicio (homeTop) → lista → lector, a pantalla completa sobre el inicio. El botón Atrás
   de Android cierra una capa a la vez, como con la hoja de lección: palabra → lector → lista → inicio
   (una sola entrada de historial mientras el módulo está abierto, igual que las sesiones).
   Estado propio, que se guarda y se respalda con el resto: state.x.lecturas = { trans: bool, done: { <id>: { n, last } } }.
   Usa del núcleo: state, save, today, esc, $, $$, toast, addXP, markMaya, normalize, srsEnroll, lessonDone,
   funciones de audio (audioForText, audioForVocab, auBtn, auNote, playAudio, stopAudio, auPlayer) e historial (histPush). */
(function () {
  var ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
  var XP_FIRST = 5;                  // XP de la primera vez que se termina cada lectura
  var IC = {
    book: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.8c2.6-1.3 5.8-1 9 1.2 3.2-2.2 6.4-2.5 9-1.2v12.4c-2.6-1.3-5.8-1-9 1.2-3.2-2.2-6.4-2.5-9-1.2z"/><path d="M12 7v12.4"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    stop: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="6.5" width="11" height="11" rx="2.5"/></svg>'
  };

  /* ---------- Estado propio ---------- */
  // Para leer: no crea nada en state.x (así un perfil sin lecturas no cambia al abrir la pantalla).
  function own() { var x = state.x && state.x.lecturas; return isObj(x) ? x : null; }
  function transOn() { var x = own(); return !!x && x.trans === true; }
  function doneOf(id) {
    var x = own(), d = x && isObj(x.done) && Object.prototype.hasOwnProperty.call(x.done, id) ? x.done[id] : null;
    return isObj(d) ? { n: Math.max(1, nonNeg(d.n)), last: isDay(d.last) ? d.last : "" } : null;
  }
  // Para escribir: deja la parte del módulo con su forma (lo que no sirve se descarta) y la devuelve.
  function mine() {
    var x = xstate("lecturas"), done = {};
    if (isObj(x.done)) Object.keys(x.done).forEach(function (id) {
      var d = x.done[id];
      if (ID_RE.test(id) && isObj(d)) done[id] = { n: Math.max(1, nonNeg(d.n)), last: isDay(d.last) ? d.last : today() };
    });
    Object.keys(x).forEach(function (k) { if (k !== "trans" && k !== "done") delete x[k]; });
    x.trans = x.trans === true;
    x.done = done;
    return x;
  }

  /* ---------- Lecturas: diálogos del curso + COURSE_READINGS ---------- */
  function cleanReading(raw) {
    if (!isObj(raw)) return null;
    var id = str(raw.id), title = str(raw.title), src = isObj(raw.source) ? raw.source : {};
    if (!ID_RE.test(id) || /^dlg-/.test(id) || !title || !str(src.name)) return null;
    var url = str(src.url);
    var pages = arr(raw.pages).map(function (p) {
      var lines = arr(isObj(p) ? p.lines : null).map(function (x) {
        if (!isObj(x) || !str(x.m) || !str(x.es)) return null;
        return { who: x.who === "A" || x.who === "B" ? x.who : "", name: str(x.name), m: str(x.m), es: str(x.es) };
      }).filter(Boolean);
      return lines.length ? { lines: lines } : null;
    }).filter(Boolean);
    if (!pages.length) return null;
    return { id: id, kind: "otra", title: title, unit: null, lesson: null,
      source: { name: str(src.name), url: /^https:\/\/[^\s"'<>]+$/.test(url) ? url : "", license: str(src.license), credit: str(src.credit) }, pages: pages };
  }
  var cache = null;
  function readings() {
    var ext = window.COURSE_READINGS, n = arr(ext).length;
    if (cache && cache.course === COURSE && cache.ext === ext && cache.n === n) return cache.list;
    var list = [], seen = Object.create(null);
    COURSE.lessons.forEach(function (l) {
      var d = l.dialogue, id = "dlg-" + String(l.id).toLowerCase().replace(/[^a-z0-9-]+/g, "-");
      if (!d || !d.lines.length || !ID_RE.test(id) || seen[id]) return;
      seen[id] = 1;
      list.push({ id: id, kind: "curso", title: d.title, unit: l.unit, lesson: l, source: { name: "", url: "", license: "", credit: "" },
        pages: [{ lines: d.lines.map(function (x) { return { who: x.who, name: x.name, m: x.m, es: x.es }; }) }] });
    });
    arr(ext).forEach(function (raw) {
      var r = cleanReading(raw);
      if (r && !seen[r.id]) { seen[r.id] = 1; list.push(r); }
    });
    list.forEach(function (r) { r.nLines = r.pages.reduce(function (t, p) { return t + p.lines.length; }, 0); });
    cache = { course: COURSE, ext: ext, n: n, list: list };
    return list;
  }
  function byId(id) { return readings().filter(function (r) { return r.id === id; })[0] || null; }

  /* ---------- Palabras y frases: se emparejan con el vocabulario del curso ---------- */
  // Una «palabra» es una racha de letras (el apóstrofo y el guion cuentan); los signos y los espacios la separan.
  var WORD_RE = "[^\\s¿?¡!.,;:\"“”«»()…—–]+";
  function tokKey(t) { return normalize(t).replace(/^-+|-+$/g, ""); }
  function scan(text) {
    var out = [], re = new RegExp(WORD_RE, "g"), mt;
    while ((mt = re.exec(text))) {
      var k = tokKey(mt[0]);
      if (k) out.push({ s: mt.index, e: mt.index + mt[0].length, k: k });
    }
    return out;
  }
  var IDX = null, IDX_N = -1, MAXLEN = 1;
  function vocabIndex() {
    if (IDX && IDX_N === COURSE.vocab.length) return IDX;
    IDX = Object.create(null); IDX_N = COURSE.vocab.length; MAXLEN = 1;
    COURSE.vocab.forEach(function (v) {
      [v.m].concat(v.alt).forEach(function (f) {
        var toks = scan(f);
        if (!toks.length) return;
        var key = toks.map(function (t) { return t.k; }).join(" ");
        var list = IDX[key] || (IDX[key] = []);
        if (list.indexOf(v) < 0) list.push(v);
        MAXLEN = Math.max(MAXLEN, toks.length);
      });
    });
    return IDX;
  }
  // Trozos de una línea: { w: true, text, items } son palabras o frases (items = entradas del vocabulario o null);
  // { w: false, text } son signos y espacios. Primero la coincidencia más larga; las palabras de una frase solo
  // pueden ir separadas por espacios (nunca por un signo). Se guarda en la línea (ln.segs).
  function segs(ln) {
    if (ln.segs) return ln.segs;
    var idx = vocabIndex(), text = ln.m, toks = scan(text), out = [], at = 0, i = 0;
    while (i < toks.length) {
      var span = 1;
      while (span < MAXLEN && i + span < toks.length && /^\s+$/.test(text.slice(toks[i + span - 1].e, toks[i + span].s))) span++;
      var n = 1, items = null;
      for (var len = span; len >= 1; len--) {
        var key = toks.slice(i, i + len).map(function (t) { return t.k; }).join(" ");
        if (idx[key]) { n = len; items = idx[key]; break; }
      }
      var a = toks[i].s, b = toks[i + n - 1].e;
      if (a > at) out.push({ w: false, text: text.slice(at, a) });
      out.push({ w: true, text: text.slice(a, b).replace(/\s+/g, " "), items: items });
      at = b; i += n;
    }
    if (at < text.length) out.push({ w: false, text: text.slice(at) });
    ln.segs = out;
    return out;
  }
  // Conocida = su entrada está en una lección completada o en el repaso. Sin entrada en el curso = desconocida.
  function vocabKnown(v) { return !!state.srs[v.id] || lessonDone(v.lesson); }
  function unitKnown(s) { return !!s.items && s.items.some(vocabKnown); }
  function pickItem(items) {
    for (var i = 0; i < items.length; i++) if (state.srs[items[i].id]) return items[i];
    return items[0];
  }
  function coverage(r) {
    var total = 0, known = 0;
    r.pages.forEach(function (p) {
      p.lines.forEach(function (ln) {
        segs(ln).forEach(function (s) { if (!s.w) return; total++; if (unitKnown(s)) known++; });
      });
    });
    return { total: total, known: known, pct: total ? Math.floor(known * 100 / total) : 0 };   // hacia abajo: 100 % solo si son todas
  }
  function covText(c) { return "Conoces el " + c.pct + " % de las palabras"; }

  /* ---------- Pantalla: estado y apertura ---------- */
  var L = { open: false, view: "list", r: null, page: 0, lines: [], root: null, sheetEl: null, sheet: null,
    prevScreen: "home", dirty: false, listScroll: 0, active: -1, activeKey: "", follow: null, wd: 0, log: [] };

  function ensureRoot() {
    if (L.root) return;
    var host = $("#app") || document.body, r = document.createElement("div");
    r.className = "lec"; r.id = "lec-root"; r.hidden = true;
    r.setAttribute("role", "dialog"); r.setAttribute("aria-modal", "true"); r.setAttribute("aria-labelledby", "lec-h");
    r.addEventListener("click", onClick);
    r.addEventListener("change", onChange);
    host.appendChild(r);
    var s = document.createElement("div");
    s.className = "overlay bottom-sheet lec-sheet"; s.id = "lec-sheet"; s.hidden = true;
    s.innerHTML = '<div class="scrim" data-act="sheet-close"></div><div class="modal bottom" role="dialog" aria-modal="true" aria-labelledby="lec-w-title" id="lec-modal"></div>';
    s.addEventListener("click", onClick);
    host.appendChild(s);
    L.root = r; L.sheetEl = s;
  }
  function openList() {
    if (L.open) return;
    ensureRoot();
    L.open = true; L.prevScreen = screen; L.dirty = false; L.listScroll = 0;
    L.root.hidden = false;
    document.body.classList.add("locked", "lec-open");
    histPush("lec");
    showList();
  }
  function closeAll(fromPop) {
    if (!L.open) return;
    stopFollow(true); stopAudio();
    closeSheet(true);
    L.open = false; L.view = "list"; L.r = null;
    L.root.hidden = true; L.root.innerHTML = "";
    document.body.classList.remove("locked", "lec-open");
    screen = L.prevScreen || "home";
    if (!fromPop && histState() === "lec") { try { history.back(); } catch (e) { /* marco sin historial */ } }
    if (L.dirty) { updateBadge(); showTab(tab, { keepScroll: true }); }   // el inicio muestra los repasos y el XP al día
    var b = $("#btn-home-readings");
    if (b) b.focus({ preventScroll: true });
  }
  function goBack() {
    if (L.sheet) closeSheet();
    else if (L.view === "reader") showList(L.r && L.r.id);
    else closeAll(false);
  }
  window.addEventListener("popstate", function () {
    if (!L.open) return;
    if (L.sheet) { closeSheet(); histPush("lec"); return; }
    if (L.view === "reader") { showList(L.r && L.r.id); histPush("lec"); return; }
    closeAll(true);
  });
  document.addEventListener("visibilitychange", function () {
    if (L.open && document.visibilityState === "visible") screen = L.view === "reader" ? "lector" : "lecturas";
  });
  document.addEventListener("keydown", function (e) {
    if (!L.open || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "Escape") { e.preventDefault(); goBack(); }
    else if (e.key === "Tab") trapFocus(e, L.sheet ? L.sheetEl : L.root);
  });

  function topHTML(label, crumb) {
    return '<div class="lec-top"><button class="icon-btn" type="button" data-act="back" aria-label="' + esc(label) + '">' + IC.back + "</button>" +
      '<span class="lec-crumb">' + esc(crumb) + "</span></div>";
  }

  /* ---------- Lista ---------- */
  function cardHTML(r) {
    var c = coverage(r), d = doneOf(r.id);
    var where = r.kind === "curso" ? "Unidad " + r.unit.n + " · Lección " + (r.lesson.index + 1) : r.source.name;
    return '<li><button class="card lec-card" type="button" data-act="open" data-id="' + esc(r.id) + '">' +
      '<span class="lec-card-top"><span class="eyebrow">' + esc(where) + "</span>" + (d ? '<span class="ls-chip done">Leída</span>' : "") + "</span>" +
      '<span class="lec-card-t">' + markMaya(r.title) + "</span>" +
      '<span class="lec-card-meta">' + r.nLines + " " + plural(r.nLines, "línea", "líneas") + (r.pages.length > 1 ? " · " + r.pages.length + " páginas" : "") + "</span>" +
      '<span class="lec-cov">' + covText(c) + "</span>" +
      '<span class="bar yaax" aria-hidden="true"><span style="width:' + c.pct + '%"></span></span></button></li>';
  }
  function listHTML() {
    var rs = readings(), nDone = rs.filter(function (r) { return doneOf(r.id); }).length;
    var h = topHTML("Volver al inicio", "Inicio") + '<div class="lec-main">' +
      '<header class="page-head lec-head"><p class="eyebrow">Leer con apoyo</p><h1 id="lec-h" tabindex="-1">Lecturas</h1>' +
      '<p class="lead">Lee en maya y toca una palabra para ver qué significa. El porcentaje cuenta las palabras de tus lecciones completadas o guardadas para repasar; las que el curso aún no enseña cuentan como nuevas.</p></header>';
    if (!rs.length) return h + '<div class="card empty-state"><h2>Aún no hay lecturas</h2><p class="muted">Cuando el curso tenga diálogos, aparecerán aquí.</p></div></div>';
    var groups = [["Diálogos del curso", rs.filter(function (r) { return r.kind === "curso"; })], ["Cuentos y textos de otras fuentes", rs.filter(function (r) { return r.kind !== "curso"; })]]
      .filter(function (g) { return g[1].length; });
    h += '<p class="lec-count muted">' + rs.length + " " + plural(rs.length, "lectura", "lecturas") + " · " + nDone + " " + plural(nDone, "leída", "leídas") + "</p>";
    groups.forEach(function (g) {
      h += '<section class="section" aria-label="' + esc(g[0]) + '">' + (groups.length > 1 ? "<h2>" + esc(g[0]) + "</h2>" : "") +
        '<ul class="lec-list">' + g[1].map(cardHTML).join("") + "</ul></section>";
    });
    return h + "</div>";
  }
  function showList(focusId) {
    stopFollow(true); stopAudio(); closeSheet(true);
    L.view = "list"; L.r = null; L.page = 0; L.lines = [];
    L.root.innerHTML = '<div class="lec-wrap">' + listHTML() + "</div>";
    screen = "lecturas";
    var card = focusId ? $('[data-id="' + focusId + '"]', L.root) : null;
    L.root.scrollTop = card ? L.listScroll : 0;
    var f = card || $("#lec-h", L.root);
    if (f) f.focus({ preventScroll: true });
  }

  /* ---------- Lector ---------- */
  function openReader(id) {
    var r = byId(id);
    if (!r) return;
    stopFollow(true); stopAudio();
    L.listScroll = L.root.scrollTop;
    L.view = "reader"; L.r = r; L.page = 0;
    renderReader();
  }
  function sourceHTML(r) {
    if (r.kind === "curso") return "Fuente: diálogo de este curso (Unidad " + r.unit.n + ", lección " + (r.lesson.index + 1) + ")";
    var s = r.source, parts = [s.name].concat(s.credit ? [s.credit] : [], s.license ? [s.license] : []);
    return "Fuente: " + esc(parts.join(" · ")) + (s.url ? ' · <a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">Ver fuente<span class="sr-only"> (se abre fuera de la app)</span></a>' : "");
  }
  // Una palabra o frase es un botón. Las que el curso no tiene (o aún no conoces) se distinguen por su fondo y su subrayado.
  function wordHTML(s, i, j) {
    var known = unitKnown(s), cls = "lec-w" + (s.items ? "" : " ng") + (known ? "" : " unk");
    var aria = s.text + (s.items ? ", ver significado" + (known ? "" : ", palabra nueva") : ", sin glosa en el curso");
    // lang="es": el aria-label está en español aunque el texto de la línea sea maya (el span interior lleva lang="yua").
    return '<button class="' + cls + '" type="button" lang="es" data-act="word" data-i="' + i + '" data-j="' + j + '" aria-haspopup="dialog" aria-label="' + esc(aria) + '">' +
      '<span class="m" lang="yua">' + esc(s.text) + "</span></button>";
  }
  function rowHTML(ln, i, a) {
    var side = ln.who === "B" ? "b" : ln.who === "A" ? "a" : "p";
    var text = segs(ln).map(function (s, j) { return s.w ? wordHTML(s, i, j) : esc(s.text); }).join("");
    return '<div class="bubble-row lec-row ' + side + '" data-i="' + i + '">' +
      (ln.who ? '<span class="avatar" aria-hidden="true">' + esc(initialOf(ln.name || ln.who)) + "</span>" : "") +
      '<div class="bubble lec-bubble">' + (ln.name ? '<span class="who">' + esc(ln.name) + "</span>" : "") +
      '<p class="lec-text m" lang="yua">' + text + "</p>" +
      '<p class="lec-tr"' + (transOn() ? "" : " hidden") + ">" + esc(ln.es) + "</p></div>" +
      (a ? auBtn(a, ln.m, "md") : "") + "</div>";
  }
  function readerHTML() {
    var r = L.r, pg = r.pages[L.page], np = r.pages.length, last = L.page === np - 1, used = {}, anyAu = false;
    var rows = pg.lines.map(function (ln, i) {
      var a = audioForText(ln.m);
      if (a) { used[a.kind] = 1; anyAu = true; }
      return rowHTML(ln, i, a);
    }).join("");
    var d = doneOf(r.id);
    var h = topHTML("Volver a la lista de lecturas", "Lecturas") + '<div class="lec-main">' +
      '<header class="page-head lec-head"><p class="eyebrow">' + (r.kind === "curso" ? "Unidad " + r.unit.n + " · Lección " + (r.lesson.index + 1) : "Lectura") + "</p>" +
      '<h1 id="lec-h" tabindex="-1">' + markMaya(r.title) + "</h1>" +
      '<p class="lec-source">' + sourceHTML(r) + "</p>" +
      '<p class="lec-cov" id="lec-cov">' + covText(coverage(r)) + "</p></header>" +
      '<div class="settings"><label class="setting" for="lec-trans"><span class="setting-txt">Mostrar traducción<small>Debajo de cada línea</small></span>' +
      '<input class="switch" type="checkbox" role="switch" id="lec-trans"' + (transOn() ? " checked" : "") + "></label></div>";
    if (anyAu) h += '<button class="btn tonal wide" type="button" id="lec-follow" data-act="follow">' + ICON.speaker + "Escucha y sigue</button>";
    h += '<p class="lec-hint muted">Toca una palabra para ver su significado' + (anyAu ? " y una línea para escucharla" : "") + ".</p>";
    if (anyAu) h += auNote(used, "Audio: ");
    h += '<div class="dialogue lec-lines" id="lec-lines">' + rows + "</div>";
    if (np > 1) h += '<nav class="lec-pager" aria-label="Páginas de la lectura"><button class="btn ghost" type="button" data-act="prev"' + (L.page ? "" : " disabled") + ">Anterior</button>" +
      '<span class="num lec-pg" aria-live="polite">Página ' + (L.page + 1) + " de " + np + "</span>" +
      '<button class="btn ghost" type="button" data-act="next"' + (last ? " disabled" : "") + ">Siguiente</button></nav>";
    if (last) h += '<button class="btn primary wide" type="button" id="lec-finish" data-act="finish">Terminé de leer</button>' +
      (d ? '<p class="lec-done muted">Ya la leíste ' + d.n + " " + plural(d.n, "vez", "veces") + ".</p>" : "");
    return h + "</div>";
  }
  function renderReader() {
    stopFollow(true); closeSheet(true);
    var r = L.r;
    L.lines = r.pages[L.page].lines;
    L.root.innerHTML = '<div class="lec-wrap">' + readerHTML() + "</div>";
    screen = "lector";
    L.root.scrollTop = 0;
    var h = $("#lec-h", L.root);
    if (h) h.focus({ preventScroll: true });
  }
  function turnPage(d) {
    var np = L.r.pages.length, p = clamp(L.page + d, 0, np - 1);
    if (p === L.page) return;
    stopAudio(); L.page = p; renderReader();
  }
  function applyTrans() {
    var on = transOn();
    $$(".lec-tr", L.root).forEach(function (p) { p.hidden = !on; });
  }
  function onChange(e) {
    var t = e.target;
    if (t && t.id === "lec-trans") { mine().trans = !!t.checked; save(); applyTrans(); }
  }
  // «Terminé de leer»: lo anota; la primera vez de cada lectura da XP (el modo tranquilo ya oculta el XP).
  function finish() {
    var r = L.r;
    if (!r) return;
    var x = mine(), prev = x.done[r.id];
    x.done[r.id] = { n: (prev ? prev.n : 0) + 1, last: today() };
    if (!prev) addXP(XP_FIRST);
    save();
    L.dirty = true;
    toast("Lectura terminada");
    showList(r.id);
  }
  function rowEl(i) { return L.root ? $('.lec-row[data-i="' + i + '"]', L.root) : null; }
  // Tras guardar una palabra: su estado, el aria de cada palabra y el porcentaje al día.
  function refreshWords() {
    if (L.view !== "reader") return;
    $$(".lec-w", L.root).forEach(function (b) {
      var ln = L.lines[Number(b.getAttribute("data-i"))], s = ln && segs(ln)[Number(b.getAttribute("data-j"))];
      if (!s) return;
      var known = unitKnown(s);
      b.classList.toggle("unk", !known);
      b.setAttribute("aria-label", s.text + (s.items ? ", ver significado" + (known ? "" : ", palabra nueva") : ", sin glosa en el curso"));
    });
    var c = $("#lec-cov", L.root);
    if (c) c.textContent = covText(coverage(L.r));
  }

  /* ---------- Hoja de la palabra ---------- */
  function sheetHTML(s, v) {
    var a = audioForText(s.text) || (v && audioForVocab(v.id)) || null;
    var inSrs = !!s.items && s.items.some(function (x) { return !!state.srs[x.id]; });
    var h = '<p class="eyebrow">' + (s.text.indexOf(" ") > 0 ? "Frase" : "Palabra") + "</p>" +
      '<div class="lec-sh-head"><h2 id="lec-w-title" class="m" lang="yua">' + esc(s.text) + "</h2>" + (a ? auBtn(a, s.text, "md") : "") + "</div>";
    if (v) {
      h += '<p class="lec-gloss">' + esc(v.es) + "</p>";
      if (normalize(v.m) !== normalize(s.text)) h += '<p class="muted">Forma del curso: ' + m(v.m) + "</p>";
      h += confBadge(v) + '<p class="lec-where muted">Del curso: Unidad ' + v.unit.n + " · Lección " + (v.lesson.index + 1) + (unitKnown(s) ? " · ya la conoces" : "") + "</p>";
    } else h += '<p class="lec-gloss muted">Esta palabra aún no tiene glosa en el curso.</p>';
    h += '<div class="modal-actions">';
    if (v) h += '<button class="btn primary wide" type="button" id="lec-save" data-act="save"' + (inSrs ? " disabled" : "") + ">" + (inSrs ? "Ya está en tu repaso" : "Guardar para repasar") + "</button>";
    return h + '<button class="btn text" type="button" id="lec-close" data-act="sheet-close">Cerrar</button></div>';
  }
  function openWord(i, j, opener) {
    var ln = L.lines[i], s = ln && segs(ln)[j];
    if (!s || !s.w) return;
    var v = s.items ? pickItem(s.items) : null;
    L.sheet = { s: s, v: v, opener: opener || null };
    $("#lec-modal", L.sheetEl).innerHTML = sheetHTML(s, v);
    L.sheetEl.hidden = false;
    var f = $("#lec-save:not([disabled])", L.sheetEl) || $("#lec-close", L.sheetEl);
    if (f) f.focus({ preventScroll: true });
  }
  function closeSheet(quiet) {
    if (!L.sheet) return;
    var op = L.sheet.opener;
    L.sheet = null; L.sheetEl.hidden = true;
    if (!quiet && op && document.contains(op)) op.focus({ preventScroll: true });
  }
  // «Guardar para repasar»: alta en el repaso solo si no estaba (nunca se duplica).
  function saveWord() {
    var sh = L.sheet;
    if (!sh || !sh.v) return;
    var already = sh.s.items.some(function (x) { return !!state.srs[x.id]; });
    if (!already && srsEnroll(sh.v.id, today())) {
      save(); L.dirty = true; updateBadge();
      toast("Guardada para repasar: «" + sh.s.text + "»");
    }
    var b = $("#lec-save", L.sheetEl);
    if (b) { b.disabled = true; b.textContent = "Ya está en tu repaso"; }
    var c = $("#lec-close", L.sheetEl);
    if (c) c.focus({ preventScroll: true });
    refreshWords();
  }

  /* ---------- Audio de las líneas: tocar una línea y «Escucha y sigue» ---------- */
  // Un solo reproductor para toda la app (playAudio llama antes a stopAudio): nunca suenan dos audios a la vez.
  // Escuchamos sus eventos para avanzar al terminar un audio y para soltar el resaltado si lo interrumpen.
  function ensureHooks() {
    var p = auPlayer();
    if (!p || p.kooxLec) return;
    p.kooxLec = true;
    p.addEventListener("playing", function () {
      if (L.open && L.active >= 0 && nowKey !== L.activeKey) { stopFollow(false); }   // empezó otro audio
    });
    p.addEventListener("pause", function () {
      if (L.open && player && player.paused && !player.ended && (L.active >= 0 || L.follow)) stopFollow(false);   // lo detuvieron
    });
    p.addEventListener("ended", function () {
      if (!L.open) return;
      var f = L.follow;
      if (!f) { clearActive(); return; }
      f.k++;
      stepFollow();
    });
    p.addEventListener("error", function () {
      if (!L.open) return;
      var f = L.follow;
      if (f) { f.k++; stepFollow(); } else clearActive();
    });
  }
  function clearActiveMark() {
    if (L.root) $$(".lec-row.is-active", L.root).forEach(function (r) { r.classList.remove("is-active"); r.removeAttribute("aria-current"); });
  }
  function clearActive() { clearActiveMark(); L.active = -1; L.activeKey = ""; clearTimeout(L.wd); }
  function reveal(row) {
    if (!row || !L.root) return;
    var a = row.getBoundingClientRect(), v = L.root.getBoundingClientRect();
    if (a.top >= v.top + 72 && a.bottom <= v.bottom - 24) return;
    var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    try { row.scrollIntoView({ block: "center", behavior: calm ? "auto" : "smooth" }); } catch (e) { row.scrollIntoView(); }
  }
  function setActive(i, key) {
    clearActiveMark();
    L.active = i; L.activeKey = key || "";
    var row = rowEl(i);
    if (row) { row.classList.add("is-active"); row.setAttribute("aria-current", "true"); reveal(row); }
    L.log.push(i);
    if (L.log.length > 200) L.log.shift();
    // Si el audio nunca empieza (bloqueado o roto), no deja la línea resaltada para siempre.
    clearTimeout(L.wd);
    var s0 = auStats.started;
    L.wd = setTimeout(function () { if (L.active === i && auStats.started === s0) stopFollow(false); }, 3500);
  }
  function playLine(i) {
    var ln = L.lines[i], a = ln && audioForText(ln.m);
    if (!a) return false;
    ensureHooks();
    var row = rowEl(i);
    setActive(i, a.key);
    if (!playAudio(a, { btn: row ? $(".au-btn", row) : null })) { clearActive(); return false; }
    return true;
  }
  function playLineUser(i) {   // tocar el cuerpo de una línea; sin audio no pasa nada
    var ln = L.lines[i];
    if (!ln || !audioForText(ln.m)) return;
    stopFollow(false);
    playLine(i);
  }
  function followUI(on) {
    var b = L.root && $("#lec-follow", L.root);
    if (!b) return;
    b.classList.toggle("is-on", on);
    b.innerHTML = (on ? IC.stop + "Detener" : ICON.speaker + "Escucha y sigue");
  }
  function startFollow() {
    var seq = [];
    L.lines.forEach(function (ln, i) { if (audioForText(ln.m)) seq.push(i); });
    if (!seq.length) return;
    L.log = [];
    L.follow = { seq: seq, k: 0 };
    followUI(true);
    stepFollow();
  }
  function stepFollow() {
    var f = L.follow;
    if (!f) return;
    while (f.k < f.seq.length) {
      if (playLine(f.seq[f.k])) return;
      f.k++;
    }
    stopFollow(false);   // terminó la página
  }
  // Detiene el seguimiento y quita el resaltado; con stopAud también corta el audio que esté sonando.
  function stopFollow(stopAud) {
    var had = !!L.follow;
    L.follow = null;
    followUI(false);
    clearActive();
    if (had && stopAud) stopAudio();
  }

  /* ---------- Clics ---------- */
  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var au = t.closest("[data-au]");
    if (au) {   // botón de audio: el núcleo reproduce; aquí solo se resalta la línea
      ensureHooks();
      var row = au.closest(".lec-row");
      if (row) { stopFollow(false); setActive(Number(row.getAttribute("data-i")), au.getAttribute("data-au")); }
      return;
    }
    var b = t.closest("[data-act]");
    if (b) {
      var a = b.getAttribute("data-act");
      if (a === "back") goBack();
      else if (a === "open") openReader(b.getAttribute("data-id"));
      else if (a === "word") openWord(Number(b.getAttribute("data-i")), Number(b.getAttribute("data-j")), b);
      else if (a === "follow") { if (L.follow) stopFollow(true); else startFollow(); }
      else if (a === "finish") finish();
      else if (a === "prev") turnPage(-1);
      else if (a === "next") turnPage(1);
      else if (a === "save") saveWord();
      else if (a === "sheet-close") closeSheet();
      return;
    }
    var bub = t.closest(".lec-bubble"), r2 = bub && bub.closest(".lec-row");
    if (r2) playLineUser(Number(r2.getAttribute("data-i")));
  }

  /* ---------- Ganchos del núcleo ---------- */
  registerModule({
    homeTop: function () {
      if (!readings().length) return "";
      return '<button class="guide-link card" type="button" id="btn-home-readings">' + IC.book +
        '<span class="gl-txt"><span class="gl-t">Lecturas</span><span class="gl-s">Lee en maya y toca las palabras para entenderlas</span></span></button>';
    },
    profile: function () {
      var rs = readings();
      if (!rs.length) return "";
      var n = rs.filter(function (r) { return doneOf(r.id); }).length;
      return '<section class="section" id="lec-prof" aria-label="Lecturas leídas"><p><span class="muted">Lecturas leídas:</span> <b class="num">' + n + '</b> <span class="muted">de ' + rs.length + "</span></p></section>";
    },
    bind: function (root, where) {
      if (where !== "home") return;
      var b = $("#btn-home-readings", root);
      if (b) b.addEventListener("click", openList);
    }
  });

  // Para las pruebas (test/lecturas.cjs): lo que hay y lo que se ve, sin tocar el estado.
  if (window.__koox) window.__koox.lecturas = {
    list: function () {
      return readings().map(function (r) { var c = coverage(r); return { id: r.id, kind: r.kind, title: r.title, lines: r.nLines, pages: r.pages.length, total: c.total, known: c.known, pct: c.pct }; });
    },
    segments: function (text) {
      return segs({ m: String(text) }).map(function (s) { return s.w ? { w: s.text, ids: s.items ? s.items.map(function (v) { return v.id; }) : null } : { p: s.text }; });
    },
    view: function () {
      return { open: L.open, view: L.view, id: L.r ? L.r.id : null, page: L.page, sheet: !!L.sheet, active: L.active, follow: !!L.follow, log: L.log.slice() };
    }
  };
})();
