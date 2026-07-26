/* ASCEND service worker - caches the app so students can study offline,
   saving mobile data. Cache-first for the app shell; network falls back to cache. */
const CACHE = "ascend-v1";
const CORE = ["/", "/index.html", "/manifest.json", "/ascend-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // never cache API calls or Supabase - those need the network and fail gracefully in-app
  if (url.pathname.startsWith("/api/") || url.hostname.includes("supabase") || url.hostname.includes("googleapis")) return;
  // for the app's own files, serve cache first (instant + offline), update in background
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req).then((cached) => {
        const fetchAndCache = fetch(req).then((res) => {
          if (res && res.status === 200) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
          return res;
        }).catch(() => cached);
        return cached || fetchAndCache;
      })
    );
  }
});
