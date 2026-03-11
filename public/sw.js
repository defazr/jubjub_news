const CACHE_NAME = "jubjub-v1";
const STATIC_ASSETS = ["/", "/bookmarks"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
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

  // Only handle http(s) requests — skip chrome-extension://, etc.
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

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetched;
    })
  );
});
