/* ASCEND service worker - caches the app so students can study offline,
   saving mobile data. Cache-first for the app shell; network falls back to cache. */
const CACHE = "ascend-v1";
const CORE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/ascend-icon.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

// Install event - cache core assets
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(CORE))
      .then(() => self.skipWaiting())
      .catch((err) => console.log("Cache install failed:", err))
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache first, then network
self.addEventListener("fetch", (e) => {
  const req = e.request;
  
  // Only handle GET requests
  if (req.method !== "GET") return;
  
  const url = new URL(req.url);
  
  // Never cache API calls or Supabase - those need the network
  if (
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("supabase") ||
    url.hostname.includes("googleapis") ||
    url.pathname.includes("chrome-extension")
  ) {
    return;
  }
  
  // For the app's own files, serve cache first (instant + offline), update in background
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req)
        .then((cached) => {
          // If cached, return it and update in background
          if (cached) {
            // Update cache in background
            fetch(req)
              .then((res) => {
                if (res && res.status === 200) {
                  caches.open(CACHE).then((c) => c.put(req, res.clone()));
                }
              })
              .catch(() => {});
            return cached;
          }
          
          // Not cached - fetch from network
          return fetch(req)
            .then((res) => {
              if (res && res.status === 200) {
                const copy = res.clone();
                caches.open(CACHE).then((c) => c.put(req, copy));
              }
              return res;
            })
            .catch(() => {
              // Network failed - return a fallback if it's a page request
              if (url.pathname.endsWith(".html") || url.pathname === "/") {
                return caches.match("/index.html");
              }
              return new Response("Offline - please check your connection", { status: 503 });
            });
        })
    );
  }
});