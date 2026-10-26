// Minimal service worker: satisfies PWA installability (controls page + start_url).
// No fetch interception — avoids breaking offline behaviour vs. no SW at all.
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
