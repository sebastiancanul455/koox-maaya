/* ================= Voces ================= */
// Perfil → «Voces»: cuántas palabras del curso tienen voz de un hablante (audio «nativo» en window.COURSE_AUDIO),
// cuántas solo voz sintética (aproximada) y quiénes grabaron, con su región. Es información y una invitación a
// grabar, no un marcador: sin metas, sin avisos. Sin catálogo de audio muestra 0 y el mismo mensaje amable.
(function () {
  var ANON = "Hablante anónimo";

  function stats() {
    var nat = 0, syn = 0, groups = [], index = {};
    // Igual que audioForVocab: el audio enlazado por id o el que dice exactamente la palabra del curso.
    COURSE.vocab.forEach(function (v) {
      var n = false, s = false;
      arr(AU.byVocab[v.id]).concat(textAudios(v.m)).forEach(function (a) { if (a.kind === "nativo") n = true; else if (a.kind === "sintetico") s = true; });
      if (n) nat++; else if (s) syn++; // con voz nativa, la sintética nunca se muestra: no se cuenta aparte
    });
    AU.list.forEach(function (a) {
      if (a.kind !== "nativo") return;
      var who = a.speaker || a.author || ANON, key = normalize(who) + "|" + normalize(a.region), g = index[key];
      if (!g) { g = index[key] = { who: who, region: a.region, n: 0 }; groups.push(g); }
      g.n++;
    });
    return { total: COURSE.vocab.length, native: nat, synthetic: syn, speakers: groups };
  }

  registerModule({
    profile: function () {
      var s = stats();
      if (!s.total) return "";
      var pct = Math.round(s.native / s.total * 100);
      var link = window.KOOX_STANDALONE === true && window.KOOX_GRABAR === true; // el enlace solo existe en el sitio web con grabar.html
      var h = '<section class="section vz-sec" id="voces" aria-labelledby="voces-title"><h2 id="voces-title">Voces</h2>' +
        '<p class="muted">Las grabaciones de hablantes de maya son la mejor guía para pronunciar. Así van las del curso.</p>' +
        '<p class="vz-count"><span class="vz-n num">' + s.native + "</span> de <span class=\"num\">" + s.total + "</span> " +
        plural(s.total, "palabra", "palabras") + " con voz nativa</p>" +
        '<div class="bar yaax" role="progressbar" aria-label="Palabras con voz nativa" aria-valuemin="0" aria-valuemax="' + s.total + '" aria-valuenow="' + s.native +
        '"><span style="width:' + (s.native ? Math.max(2, pct) : 0) + '%"></span></div>';
      if (s.synthetic) h += '<p class="vz-synth">' + s.synthetic + " " + plural(s.synthetic, "palabra más tiene", "palabras más tienen") +
        " voz sintética. Es una voz aproximada: la genera una IA y puede equivocarse en el tono y el saltillo.</p>";
      h += '<h3 class="vz-sub">Voces nativas</h3>';
      if (s.speakers.length) {
        h += '<ul class="vz-list">' + s.speakers.map(function (g) {
          return '<li><span class="vz-who">' + esc(g.who) + '</span><span class="vz-meta muted">' + (g.region ? esc(g.region) + " · " : "") +
            g.n + " " + plural(g.n, "grabación", "grabaciones") + "</span></li>";
        }).join("") + "</ul>";
      } else h += '<p class="vz-empty">Todavía no hay voz nativa en el curso. Cada grabación cuenta.</p>';
      h += '<div class="vz-help"><p>' + (link ? "Si el maya es tu lengua, puedes grabar las palabras del curso." :
        "<strong>¿Hablas maya? Ayuda a grabar.</strong> Si el maya es tu lengua, puedes grabar las palabras del curso en la versión web de Ko'ox Maaya.") + "</p>" +
        (link ? '<a class="btn tonal" href="grabar.html" id="vz-grabar">¿Hablas maya? Ayuda a grabar</a>' : "") + "</div></section>";
      return h;
    }
  });

  try { window.__koox.voces = stats; } catch (e) { /* un módulo no tumba la app */ }
})();
