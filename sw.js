self.addEventListener('install', function(event) {
  console.log('تم تثبيت Service Worker');
});
self.addEventListener('fetch', function(event) {
  event.respondWith(fetch(event.request));
});
