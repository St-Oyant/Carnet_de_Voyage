// v3 (31 juillet) : data.json est désormais un fichier à part (plus embarqué
// dans index.html) — précaché ici comme le reste de l'app shell, et servi
// par la même stratégie réseau-d'abord/cache-en-secours ci-dessous. C'est ce
// qui permet à Antoine de mettre à jour data.json sur GitHub sans qu'Amélie
// ait quoi que ce soit à faire : dès qu'elle a du réseau, le fetch réussit et
// remplace la version en cache ; hors ligne, la dernière version connue sert.
const CACHE_NAME = "carnet-irlande-v4";
const ASSETS = ["./index.html", "./data.json", "./manifest.json", "./icon-192.png", "./icon-512.png", "./icon-maskable.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Network-first, cache fallback (pour rester utilisable même sans réseau en Irlande)
self.addEventListener("fetch", (e) => {
  if(e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
