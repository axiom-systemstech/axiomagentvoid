const CACHE_NAME = "axiom-agent-void-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/styles.css",
  "./js/detection-engine.js",
  "./js/main.js",
  "./assets/favicon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
