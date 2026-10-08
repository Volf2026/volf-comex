/* Importaciones VOLF: funciona sin conexión con los últimos datos descargados */
const CACHE = "comex-volf-v2";
const BASE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png",
  "./jost-400.woff2", "./jost-500.woff2", "./bodoni-moda.woff2"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BASE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const datos = url.pathname.endsWith("/datos.enc.json");
  if (datos || req.mode === "navigate") {
    const clave = datos ? "./datos.enc.json" : "./index.html";
    e.respondWith(fetch(req).then((r) => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then((k) => k.put(clave, c)); } return r; })
      .catch(() => caches.match(clave)));
    return;
  }
  e.respondWith(caches.match(req).then((m) => m || fetch(req)));
});
