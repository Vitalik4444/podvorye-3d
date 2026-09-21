/* ============================================================
   Service worker (P3 из аудита, §5.4 структуры): оффлайн и кэш.
   Стратегии разные по типу ресурса — иначе либо всё устаревает,
   либо ничего не работает без сети.
   ============================================================ */
const V = 'hp-v1';
const STATIC = `${V}-static`;
const PAGES = `${V}-pages`;
const DATA = `${V}-data`;

/* Модели (12 МБ) сознательно не кэшируем: забьют квоту без пользы —
   их и так держит обычный HTTP-кэш. */
const isModel = u => /\.glb($|\?)/.test(u);
const isStatic = u => /\/assets\/|\/img\/|\.(woff2?|css|js|svg|jpg|jpeg|png|webp|avif|opus|m4a)$/.test(u);
const isData = u => /\/api\/.*\.json$/.test(u);
const isPage = (req) => req.mode === 'navigate' ||
  (req.headers.get('accept') || '').includes('text/html');

self.addEventListener('install', e => {
  e.waitUntil(caches.open(STATIC).then(c => c.addAll(['/', '/index.html', '/now.html'])
    .catch(() => {/* при первом заходе часть может быть недоступна — не критично */})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => !k.startsWith(V)).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;          // погоду и карты не трогаем
  if (isModel(url.pathname)) return;

  /* Данные дня: сеть в приоритете, но при её отсутствии отдаём сохранённое
     и помечаем ответ — страница честно скажет «показываем сохранённое». */
  if (isData(url.pathname)) {
    e.respondWith((async () => {
      const cache = await caches.open(DATA);
      try {
        const fresh = await fetch(req, { cache: 'no-store' });
        cache.put(req, fresh.clone());
        return fresh;
      } catch {
        const hit = await cache.match(req);
        if (!hit) throw new Error('нет сети и нет кэша');
        const body = await hit.blob();
        return new Response(body, {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'X-From-Cache': '1' },
        });
      }
    })());
    return;
  }

  /* Статика: из кэша сразу, обновляем в фоне */
  if (isStatic(url.pathname)) {
    e.respondWith((async () => {
      const cache = await caches.open(STATIC);
      const hit = await cache.match(req);
      if (hit) {
        fetch(req).then(r => r.ok && cache.put(req, r.clone())).catch(() => {});
        return hit;
      }
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    })());
    return;
  }

  /* Страницы: сеть в приоритете, кэш как страховка */
  if (isPage(req)) {
    e.respondWith((async () => {
      const cache = await caches.open(PAGES);
      try {
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      } catch {
        const hit = await cache.match(req) || await cache.match('/index.html');
        if (hit) return hit;
        return new Response(
          '<!doctype html><meta charset="utf-8"><title>Нет сети</title>' +
          '<body style="font:16px/1.6 system-ui;padding:40px;max-width:36em;margin:auto">' +
          '<h1 style="font-size:28px">Нет сети</h1><p>Страница не сохранена. ' +
          'Как только связь появится, всё откроется как обычно.</p>',
          { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
    })());
  }
});
