/*
 * ASCEND service worker  ->  put this at:  public/sw.js
 * ---------------------------------------------------------------------------
 * Goals:
 *  - Make the app open instantly and work offline for already-visited screens.
 *  - NEVER cache API / AI / auth / Supabase traffic (always live).
 *  - Always pick up new deploys quickly (the app calls reg.update() and posts
 *    SKIP_WAITING, which this worker honours, then reloads the page).
 *
 * Strategy:
 *  - Navigations (HTML): network-first, fall back to the cached shell offline.
 *  - Static assets (JS/CSS/img/font): stale-while-revalidate.
 *  - Everything dynamic (api, supabase, groq, gemini, openrouter, cohere): bypass.
 */

const CACHE_VERSION = "ascend-v3";
const SHELL_CACHE = CACHE_VERSION + "-shell";
const ASSET_CACHE = CACHE_VERSION + "-assets";

// Requests we must never serve from cache.
function isDynamic(url) {
  return (
    url.pathname.startsWith("/api/") ||
    /supabase\.co/i.test(url.host) ||
    /groq\.com/i.test(url.host) ||
    /googleapis\.com/i.test(url.host) ||
    /openrouter\.ai/i.test(url.host) ||
    /cohere\.com/i.test(url.host)
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(["/", "/index.html"]).catch(() => {}))
  );
  // Don't auto-activate; wait until the page asks (SKIP_WAITING) so we control
  // exactly when the reload happens.
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  let url;
  try { url = new URL(req.url); } catch (e) { return; }

  // Only handle http(s); skip chrome-extension:, etc.
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // Never touch dynamic/live traffic.
  if (isDynamic(url)) return;

  // App navigations -> network-first, fall back to cached shell when offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put("/", copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match("/").then((r) => r || caches.match("/index.html")))
    );
    return;
  }

  // Same-origin static assets -> stale-while-revalidate.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && res.status === 200 && res.type === "basic") {
              const copy = res.clone();
              caches.open(ASSET_CACHE).then((c) => c.put(req, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
