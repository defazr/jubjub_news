const CACHE_NAME = "jubjub-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = request.url;

  // Only handle http(s) requests
  if (!url.startsWith("http")) return;

  // Skip non-GET and API requests
  if (request.method !== "GET") return;
  if (url.includes("/.netlify/functions/")) return;
  if (url.includes("/api/")) return;
  if (url.includes("googlesyndication")) return;
  if (url.includes("google-analytics")) return;
  if (url.includes("googleads")) return;
  if (url.includes("doubleclick")) return;
  if (url.includes("adsbygoogle")) return;

  // Static assets (_next/static): cache-first (immutable)
  if (url.includes("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML pages: network-first (always get latest, fallback to cache)
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
