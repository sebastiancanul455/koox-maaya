/* Service worker de Ko'ox Maaya (versión web independiente, para GitHub Pages).
   Plantilla: build-web.mjs reemplaza la versión (hash del contenido) y la lista de precarga
   al escribir site/sw.js.
   - Precarga index.html, el manifest y los íconos en una caché con la versión en el nombre.
   - Navegación: primero la red (para recibir actualizaciones) y, sin red o si tarda, la copia guardada.
   - Fuentes de Google: stale-while-revalidate en una caché aparte que sobrevive a las versiones.
   - Audio (audio/<key>.mp3?v=<hash>): primero la caché, en otra caché que sobrevive a las versiones
     (la URL cambia cuando cambia el archivo). Si todo el audio suma 8 MB o menos, build-web.mjs
     pone la lista en AUDIO_PRECACHE y se descarga al instalar; si no, se guarda al escucharlo.
     Responde los pedidos con Range (los usa <audio>) con 206 a partir de la copia completa.
   - activate: borra las cachés viejas de esta app (solo las suyas: en usuario.github.io el origen
     es compartido con otros proyectos) y los audios que ya no están en el catálogo, toma el
     control y avisa a la página. */
"use strict";

const VERSION = "7deab43ad348";
const PRECACHE = ["index.html","grabar.html","manifest.webmanifest","icons/favicon.svg","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png"];
const AUDIO_PRECACHE = [];
const AUDIO_FILES = [];
const PREFIX = "koox-maaya-";
const CACHE = PREFIX + VERSION;
const FONTS = PREFIX + "fonts";
const AUDIO = PREFIX + "audio";
const AUDIO_RE = /\/audio\/[a-z0-9-]+\.mp3$/;
const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];
const FONT_MAX = 40;            // entradas máximas en la caché de fuentes
const NAV_TIMEOUT_MS = 4000;    // con red lenta, pasado este tiempo se muestra la copia guardada
const SCOPE = self.registration.scope;
const INDEX = new URL("index.html", SCOPE).href;
// Otras páginas del sitio que se guardan (p. ej. grabar.html); sin red se sirve su copia.
const PAGES = PRECACHE.filter((p) => /\.html$/.test(p)).map((p) => new URL(p, SCOPE).href);

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(PRECACHE.map(async (p) => {
      const url = new URL(p, SCOPE).href;
      // cache: "reload" evita guardar una copia vieja de la caché HTTP con el nombre de esta versión.
      const res = await fetch(new Request(url, { cache: "reload" }));
      if (!res.ok) throw new Error("precarga de " + p + ": HTTP " + res.status);
      if (url === INDEX && (await res.clone().text()).indexOf(VERSION) < 0) {
        // El CDN aún sirve otro index.html: falla la instalación y el navegador reintenta después.
        throw new Error("index.html no corresponde a la versión " + VERSION);
      }
      await cache.put(url, res);
    }));
    // Audio (pueden ser cientos de archivos cortos): de 6 en 6; lo que ya está guardado no se vuelve
    // a bajar y un fallo no impide instalar la app.
    const audio = await caches.open(AUDIO);
    let next = 0;
    await Promise.all(Array.from({ length: Math.min(6, AUDIO_PRECACHE.length) }, async () => {
      while (next < AUDIO_PRECACHE.length) {
        const url = new URL(AUDIO_PRECACHE[next++], SCOPE).href;
        try {
          if (await audio.match(url)) continue;
          const res = await fetch(url);
          if (res.ok && res.status === 200) await audio.put(url, res);
        } catch (e) { /* se guardará al escucharlo */ }
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((k) => k.startsWith(PREFIX) && k !== CACHE && k !== FONTS && k !== AUDIO)
      .map((k) => caches.delete(k)));
    if (keys.includes(AUDIO)) {
      const audio = await caches.open(AUDIO);
      const keep = new Set(AUDIO_FILES.map((p) => new URL(p, SCOPE).href));
      for (const r of await audio.keys()) if (!keep.has(r.url)) await audio.delete(r);
    }
    await self.clients.claim();
    // La página compara esta versión con la suya (window.KOOX_BUILD) y, si difieren,
    // ofrece «Actualizar».
    const list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of list) c.postMessage({ type: "koox-sw-updated", version: VERSION });
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (req.mode === "navigate") {
    if (req.url.startsWith(SCOPE)) event.respondWith(navigate(event));
    return;
  }
  if (FONT_HOSTS.includes(url.hostname)) { event.respondWith(font(event)); return; }
  if (req.url.startsWith(SCOPE) && AUDIO_RE.test(url.pathname)) { event.respondWith(audio(req)); return; }
  if (req.url.startsWith(SCOPE)) event.respondWith(asset(req));
});

function isIndex(href) {
  const u = new URL(href);
  u.search = ""; u.hash = "";
  return u.href === SCOPE || u.href === INDEX;
}
// Clave de caché de una navegación: index.html o una de PAGES (sin ?búsqueda ni #); null si no se guarda.
function pageKey(href) {
  if (isIndex(href)) return INDEX;
  const u = new URL(href);
  u.search = ""; u.hash = "";
  return PAGES.includes(u.href) ? u.href : null;
}

function offlinePage() {
  return new Response(
    "<!doctype html><html lang=\"es\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" +
    "<title>Ko'ox Maaya</title><body style=\"font:17px system-ui,sans-serif;padding:24px\">" +
    "<p>Sin conexión. Abre Ko'ox Maaya otra vez cuando tengas internet.</p></body></html>",
    { status: 503, headers: { "content-type": "text/html; charset=utf-8" } });
}

// Primero la red; si falla, responde mal o tarda más de NAV_TIMEOUT_MS, la copia guardada.
async function navigate(event) {
  const cache = await caches.open(CACHE);
  let req = event.request;
  try { req = new Request(event.request, { cache: "no-cache" }); } catch (e) { /* se usa la original */ }
  const key = pageKey(event.request.url);
  const fromNet = fetch(req).then(async (res) => {
    if (res.ok && res.type === "basic" && key) await cache.put(key, res.clone());
    return res;
  });
  event.waitUntil(fromNet.then(() => {}, () => {}));
  const saved = async () => (key && key !== INDEX && await cache.match(key, { ignoreVary: true })) || cache.match(INDEX, { ignoreVary: true });
  let timer;
  const late = new Promise((resolve) => { timer = setTimeout(() => resolve(null), NAV_TIMEOUT_MS); });
  try {
    const res = await Promise.race([fromNet, late]);
    if (res && (res.ok || res.type === "opaqueredirect")) return res;
    const copy = await saved();
    if (copy) return copy;
    return res || await fromNet;
  } catch (e) {
    return (await saved()) || offlinePage();
  } finally {
    clearTimeout(timer);
  }
}

// Archivos del sitio: de la caché de esta versión; si no están, de la red.
async function asset(req) {
  const hit = await caches.match(req, { cacheName: CACHE, ignoreVary: true });
  return hit || fetch(req);
}

// Audio: primero la copia guardada; si no está, se baja completo (sin Range), se guarda y se responde.
async function audio(req) {
  const cache = await caches.open(AUDIO);
  let res = await cache.match(req.url);
  if (!res) {
    let net;
    try { net = await fetch(req.url, { credentials: "same-origin" }); }
    catch (e) { return Response.error(); }
    if (!net.ok || net.status !== 200) return net;
    try { await cache.put(req.url, net.clone()); } catch (e) { /* sin espacio: se responde igual */ }
    res = net;
  }
  const range = req.headers.get("range");
  return range ? partial(res, range) : res;
}

// Respuesta 206 con el tramo pedido («bytes=inicio-fin»); con un Range que no se entiende, el archivo entero.
async function partial(res, range) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (!m || (!m[1] && !m[2])) return res;
  const buf = await res.arrayBuffer();
  const size = buf.byteLength;
  let start, end;
  if (m[1]) { start = Number(m[1]); end = m[2] ? Math.min(Number(m[2]), size - 1) : size - 1; }
  else { start = Math.max(0, size - Number(m[2])); end = size - 1; }
  if (start >= size || start > end) {
    return new Response(null, { status: 416, headers: { "content-range": "bytes */" + size } });
  }
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      "content-type": res.headers.get("content-type") || "audio/mpeg",
      "content-range": "bytes " + start + "-" + end + "/" + size,
      "content-length": String(end - start + 1),
      "accept-ranges": "bytes"
    }
  });
}

// Fuentes: responde con la copia guardada (si hay) y la renueva en segundo plano.
// La hoja de estilos se pide en modo CORS para guardarla como respuesta normal (no opaca).
async function font(event) {
  const cache = await caches.open(FONTS);
  const key = event.request.url;
  const hit = await cache.match(key, { ignoreVary: true });
  const fromNet = fetch(key, { mode: "cors", credentials: "omit" }).then(async (res) => {
    if (res.ok) { await cache.put(key, res.clone()); await trim(cache); }
    return res;
  });
  if (hit) { event.waitUntil(fromNet.then(() => {}, () => {})); return hit; }
  try { return await fromNet; } catch (e) { return Response.error(); }
}

async function trim(cache) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - FONT_MAX; i++) await cache.delete(keys[i]);
}
