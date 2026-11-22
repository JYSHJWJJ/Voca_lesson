// 오프라인 저장: 화면·레슨 데이터는 인터넷 우선(실패하면 저장본), 발음 파일은 저장본 우선
const CACHE = 'voca-v1';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', 'index.html', 'lesson.html', 'lessons/index.json'])).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.endsWith('.mp3')) {
    e.respondWith(
      caches.open(CACHE).then(c => c.match(req.url).then(hit => hit || fetch(req.url).then(res => {
        if (res.ok) c.put(req.url, res.clone());
        return res;
      })))
    );
    return;
  }

  e.respondWith(
    fetch(req.url, { cache: 'no-cache' }).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req.url, copy)); }
      return res;
    }).catch(() => caches.match(req.url).then(hit => hit || caches.match('index.html')))
  );
});
