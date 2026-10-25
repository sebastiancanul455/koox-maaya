/* Service worker de Ko'ox Maaya (versión web independiente, para GitHub Pages).
   Plantilla: build-web.mjs reemplaza la versión (hash del contenido) y la lista de precarga
   al escribir site/sw.js.
   - Precarga index.html, el manifest y los íconos en una caché con la versión en el nombre.
   - Navegación: primero la red (para recibir actualizaciones) y, sin red o si tarda, la copia guardada.
   - Fuentes de Google: stale-while-revalidate en una caché aparte que sobrevive a las versiones.
   - activate: borra las cachés viejas de esta app (solo las suyas: en usuario.github.io el origen
     es compartido con otros proyectos), toma el control y avisa a la página. */
"use strict";

const VERSION = "a1c4c44f271d";
const PRECACHE = ["index.html","manifest.webmanifest","icons/favicon.svg","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png"];
const PREFIX = "koox-maaya-";
const CACHE = PREFIX + VERSION;
const FONTS = PREFIX + "fonts";
const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];
const FONT_MAX = 40;            // entradas máximas en la caché de fuentes
const NAV_TIMEOUT_MS = 4000;    // con red lenta, pasado este tiempo se muestra la copia guardada
const SCOPE = self.registration.scope;
const INDEX = new URL("index.html", SCOPE).href;

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
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((k) => k.startsWith(PREFIX) && k !== CACHE && k !== FONTS)
      .map((k) => caches.delete(k)));
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
  if (req.url.startsWith(SCOPE)) event.respondWith(asset(req));
});

function isIndex(href) {
  const u = new URL(href);
  u.search = ""; u.hash = "";
  return u.href === SCOPE || u.href === INDEX;
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
  const fromNet = fetch(req).then(async (res) => {
    if (res.ok && res.type === "basic" && isIndex(event.request.url)) await cache.put(INDEX, res.clone());
    return res;
  });
  event.waitUntil(fromNet.then(() => {}, () => {}));
  const saved = () => cache.match(INDEX, { ignoreVary: true });
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
