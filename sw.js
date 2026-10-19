const CACHE = 'dalil-musafer-v3';
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];
const EXTRA = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll(CORE).then(() =>
        Promise.allSettled(EXTRA.map(u => cache.add(u)))
      )
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function store(req, res) {
  if (res && res.ok) {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(req, copy));
  }
  return res;
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  if (sameOrigin) {
    // الصفحة والملفات بتاعتنا: النت أولاً، والنسخة المحفوظة لو مفيش نت
    event.respondWith(
      fetch(req)
        .then(res => store(req, res))
        .catch(() =>
          caches.match(req).then(hit =>
            hit || (req.mode === 'navigate' ? caches.match('./index.html') : null) || Response.error()
          )
        )
    );
    return;
  }

  if (url.hostname === 'unpkg.com') {
    // مكتبة الخريطة: المحفوظ أولاً
    event.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => store(req, res)))
    );
  }
  // باقي الطلبات (البحث وبلاطات الخريطة) بتروح للنت عادي
});
