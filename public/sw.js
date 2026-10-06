/* App shell for 알고 먹는 내몸 지키기.
   Bump SHELL_VERSION together with index.html [data-shell-version].
   A new name drops the previous precache on activate. Diary data lives in
   localStorage and is never touched here. */
var SHELL_VERSION = "20261006.3";
var CACHE = "healthapp-shell-" + SHELL_VERSION;
/* Vercel cleanUrls: no trailing slash / no /index.html — match final 200 paths. */
var SHELL = ["/", "/privacy", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

function copyWithoutNoStore(response) {
  var headers = new Headers(response.headers);
  headers.delete("cache-control");
  headers.delete("pragma");
  headers.delete("expires");
  return response.blob().then(function (body) {
    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers
    });
  });
}

function putFresh(cache, request, response) {
  if (!response || !response.ok) return Promise.resolve();
  return copyWithoutNoStore(response.clone()).then(function (copy) {
    return cache.put(request, copy);
  });
}

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return Promise.all(SHELL.map(function (url) {
        return fetch(new Request(url, { cache: "no-store" })).then(function (response) {
          if (!response.ok) throw new Error("shell " + url);
          return putFresh(cache, url, response);
        });
      }));
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        if (key === CACHE) return Promise.resolve();
        return caches.delete(key);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") return;
  var url;
  try {
    url = new URL(request.url);
  } catch (e) {
    return;
  }
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE).then(function (cache) {
      return fetch(request, { cache: "no-store" }).then(function (response) {
        return putFresh(cache, request, response).then(function () {
          return response;
        });
      }).catch(function () {
        return cache.match(request).then(function (hit) {
          if (hit) return hit;
          if (request.mode === "navigate") {
            return cache.match("/").then(function (page) {
              return page || cache.match("/index.html");
            });
          }
          return cache.match(url.pathname);
        });
      });
    })
  );
});
