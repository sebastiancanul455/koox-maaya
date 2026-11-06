/* Repaso inteligente (FSRS) de Ko'ox Maaya.

   Versión mínima y sin dependencias del modelo FSRS-6, escrita a partir del código de ts-fsrs
   (https://github.com/open-spaced-repetition/ts-fsrs, licencia MIT). Referencia leída del paquete publicado:
   ts-fsrs 6.0.0 (npm «latest»; FSRS6Algorithm y FSRS6_DEFAULT_WEIGHTS), contrastada con ts-fsrs 5.4.2
   (FSRSAlgorithm y default_w), que trae las mismas fórmulas y los mismos pesos. Ojo: el DefaultScheduler nuevo de
   la 6.0.0 usa FSRS-7 (34 pesos y dos estabilidades); aquí se usa FSRS-6 porque cada palabra guarda una sola
   estabilidad (s) y una dificultad (d) y la app agenda por días enteros.

   Solo lo que la app necesita: estado inicial por calificación, siguiente estado para «Otra vez» (1) y «Bien» (3),
   retrievability, intervalo con retención deseada 0.90 y máximo 365 días, y nada de aleatoriedad (sin fuzz): la misma
   historia da siempre las mismas fechas. No hay pasos de aprendizaje dentro del día ni memoria de corto plazo (w[19]):
   entre dos repasos de una palabra pasa al menos un día. Tampoco el orden Difícil < Bien < Fácil, que solo tiene
   sentido con cuatro botones.

   Estado en la entrada de repaso: s (estabilidad en días), d (dificultad 1–10), last (día del último repaso),
   reps y lapses, además de box (nivel 1–5 derivado de s), due, right y wrong. Historial para optimizar los
   parámetros más adelante: state.x.fsrs.log = [[día, id de palabra, calificación], ...] (máx. 3000).

   MIT License

   Copyright (c) 2026 Open Spaced Repetition

   Permission is hereby granted, free of charge, to any person obtaining a copy
   of this software and associated documentation files (the "Software"), to deal
   in the Software without restriction, including without limitation the rights
   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   copies of the Software, and to permit persons to whom the Software is
   furnished to do so, subject to the following conditions:

   The above copyright notice and this permission notice shall be included in all
   copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   SOFTWARE. */
var FSRS = (function () {
  // Pesos por omisión de FSRS-6: w0–w3 estabilidad inicial por calificación (1 a 4), w4–w7 dificultad,
  // w8–w10 estabilidad tras acierto, w11–w14 tras olvido, w15–w16 solo para Difícil y Fácil (no se usan aquí),
  // w17–w19 memoria de corto plazo (solo w17 y w18 acotan la caída tras un olvido) y w20 la curva de olvido.
  var W = [0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796, 1.4835, 0.0614,
    0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542];
  var DESIRED = 0.9, MAX_DAYS = 365, S_MIN = 0.001, S_MAX = 36500;
  var DECAY = -W[20];
  // Constantes de la curva de olvido: con ellas la probabilidad de recordar es 0.90 cuando t = s.
  var FACTOR = rnd(Math.exp(Math.log(0.9) / DECAY) - 1, 8);
  var MOD = rnd((Math.pow(DESIRED, 1 / DECAY) - 1) / FACTOR, 8); // 1 con retención 0.90: el intervalo es s redondeada

  // Como ts-fsrs, redondea a 8 decimales los pasos intermedios: así los resultados son idénticos y estables.
  function rnd(x, n) { var f = Math.pow(10, n); return Math.round(x * f) / f; }
  function initD(g) { return rnd(W[4] - Math.exp((g - 1) * W[5]) + 1, 8); }

  // Estado inicial al calificar por primera vez (1 Otra vez, 2 Difícil, 3 Bien, 4 Fácil).
  function init(g) {
    g = clamp(Math.round(Number(g)) || 3, 1, 4);
    return { s: Math.max(W[g - 1], 0.1), d: clamp(initD(g), 1, 10) };
  }
  // Probabilidad de recordar tras t días con estabilidad s.
  function retrievability(t, s) {
    return rnd(Math.pow(1 + FACTOR * Math.max(0, t) / Math.max(S_MIN, s), DECAY), 8);
  }
  // Días hasta el próximo repaso para la retención deseada: entero entre 1 y 365.
  function interval(s) { return clamp(Math.round(s * MOD), 1, MAX_DAYS); }
  // Nivel 0–5 que se muestra: el mayor umbral de INTERVALS (0, 1, 3, 7, 16, 35 días) que la estabilidad alcanza.
  function level(s) {
    for (var i = INTERVALS.length - 1; i > 0; i--) if (s >= INTERVALS[i]) return i;
    return 0;
  }
  // Siguiente estado tras un repaso a los t días del anterior (entero, mínimo 1) con g = 1 (error) o 3 (acierto).
  function next(m, t, g) {
    var s = clamp(Number(m && m.s) || S_MIN, S_MIN, S_MAX), d = clamp(Number(m && m.d) || 5, 1, 10), ns;
    t = Math.max(1, Math.round(Number(t) || 1));
    g = g === 1 ? 1 : 3;
    var r = retrievability(t, s);
    var dd = d + rnd(-W[6] * (g - 3) * (10 - d) / 9, 8);                 // el error sube d (amortiguado); el acierto no la mueve
    var nd = clamp(rnd(W[7] * initD(4) + (1 - W[7]) * dd, 8), 1, 10);   // y d vuelve un poco hacia su valor "fácil"
    if (g === 1) {
      var fail = rnd(clamp(W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp((1 - r) * W[14]), S_MIN, S_MAX), 8);
      ns = clamp(rnd(s / Math.exp(W[17] * W[18]), 8), S_MIN, fail);       // tras olvidar, la estabilidad nunca sube
    } else {
      ns = rnd(clamp(s * (1 + Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) * (Math.exp((1 - r) * W[10]) - 1)), S_MIN, S_MAX), 8);
    }
    return { s: ns, d: nd };
  }

  /* ---------- Historial: state.x.fsrs.log ---------- */
  var LOG_MAX = 3000, logSane = null;
  function dayNum(k) { var p = k.split("-").map(Number); return Math.round(Date.UTC(p[0], p[1] - 1, p[2]) / 86400000); }
  // Cada módulo sanea su parte: solo se conservan ternas [día, id, calificación] válidas, las últimas 3000.
  function logOf() {
    var x = xstate("fsrs");
    if (x !== logSane) {
      var a = Array.isArray(x.log) ? x.log : [], out = [];
      for (var i = 0; i < a.length; i++) {
        var e = a[i];
        if (Array.isArray(e) && e.length === 3 && typeof e[0] === "number" && isFinite(e[0]) && e[0] >= 0 && e[0] < 1e6 && Math.floor(e[0]) === e[0] &&
          typeof e[1] === "string" && e[1] && e[1].length <= 100 && e[2] >= 1 && e[2] <= 4 && Math.floor(e[2]) === e[2]) out.push([e[0], e[1], e[2]]);
      }
      x.log = out.length > LOG_MAX ? out.slice(out.length - LOG_MAX) : out;
      logSane = x;
    }
    return x.log;
  }
  function record(vid, g) {
    var log = logOf();
    log.push([dayNum(today()), String(vid), g]);
    if (log.length > LOG_MAX) log.splice(0, log.length - LOG_MAX);
  }

  return { init: init, next: next, retrievability: retrievability, interval: interval, level: level, record: record,
    weights: W, desired: DESIRED, maxDays: MAX_DAYS };
})();

// Funciones puras para las pruebas (test/fsrs.cjs).
if (window.__koox) {
  window.__koox.fsrs = {
    init: FSRS.init, next: FSRS.next, retrievability: FSRS.retrievability, interval: FSRS.interval, level: FSRS.level,
    weights: FSRS.weights.slice(), desired: FSRS.desired, maxDays: FSRS.maxDays
  };
}

registerModule({
  // Perfil → «Repaso inteligente»: explica el método y deja volver al repaso clásico (cajas de Leitner).
  profile: function () {
    var classic = state.settings.scheduler === "leitner";
    return '<section class="section" aria-labelledby="fsrs-title"><h2 id="fsrs-title">Repaso inteligente</h2>' +
      '<p class="muted">Cada palabra vuelve justo antes de que la olvides: más tarde las que ya dominas, más pronto las que te cuestan. ' +
      "Usa FSRS, un método abierto.</p>" +
      '<div class="settings"><label class="setting" for="fsrs-classic"><span class="setting-txt">Usar el repaso clásico<small>Cajas fijas de 1, 3, 7, 16 y 35 días, sin cálculo</small></span>' +
      '<input class="switch" type="checkbox" role="switch" id="fsrs-classic"' + (classic ? " checked" : "") + "></label></div></section>";
  },
  bind: function (root, where) {
    var sw = where === "profile" ? $("#fsrs-classic", root) : null;
    if (!sw) return;
    sw.addEventListener("change", function () {
      state.settings.scheduler = this.checked ? "leitner" : "fsrs";
      // Al volver al repaso inteligente, los niveles se vuelven a derivar de la estabilidad; las fechas no se tocan.
      if (!this.checked) Object.keys(state.srs).forEach(function (id) { var r = srsNormalize(state.srs[id]); r.box = clamp(FSRS.level(r.s), 1, 5); });
      save();
      toast(this.checked ? "Repaso clásico activado" : "Repaso inteligente activado");
    });
  }
});
