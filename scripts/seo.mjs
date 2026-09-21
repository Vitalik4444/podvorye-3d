/* ============================================================
   Пост-обработка сборки: Open Graph, Twitter-карточка, canonical,
   JSON-LD и sitemap.xml + robots.txt.
   Запускается после vite build (см. package.json).
   До этого шага ни одна из 41 страницы не имела OG — ссылка на сайт
   в мессенджере показывала пустую карточку (аудит §4).
   ============================================================ */
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

/* fileURLToPath, а не .pathname: путь проекта содержит кириллицу и percent-кодируется */
const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const SITE = process.env.SITE_URL || 'https://holmogorskoe-podvorye.ru';
const NAME = 'Холмогорское подворье';
const OG_IMAGE = SITE + '/og.jpg';

/* Приоритет страниц для sitemap: живые и коммерческие — выше */
const PRIORITY = {
  'index.html': 1.0, 'now.html': 0.9, 'catalog.html': 0.9, 'boxes.html': 0.8,
  'builder.html': 0.8, 'farmers.html': 0.8, 'walk.html': 0.8, 'morning.html': 0.7,
  'journal.html': 0.7, 'events.html': 0.7, 'recipes.html': 0.7, 'join.html': 0.7,
  'seasons.html': 0.6, 'foodcourt.html': 0.6, 'about.html': 0.6, 'guests.html': 0.6,
  'map.html': 0.6, 'contacts.html': 0.6, 'delivery.html': 0.5, 'loyalty.html': 0.5,
};
const NOINDEX = new Set(['404.html', 'checkout.html', 'order-success.html', 'cart.html', 'search.html']);

/* Есть ли звук в сборке — чтобы клиент не делал запрос впустую */
const HAS_AUDIO = existsSync(fileURLToPath(new URL('../dist/audio/ambient.opus', import.meta.url)));
/* Страницы, которые обращаются к погоде */
const WEATHER = new Set(['index.html', 'now.html']);

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ---------- JSON-LD по типу страницы ---------- */
function jsonLd(file, title, desc) {
  const url = `${SITE}/${file}`;
  const org = {
    '@type': 'LocalBusiness',
    '@id': SITE + '/#business',
    name: NAME,
    description: 'Фермерский рынок в Калининградской области: хозяйства, продающие то, что производят сами.',
    url: SITE,
    image: OG_IMAGE,
    priceRange: '₽₽',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'RU',
      addressRegion: 'Калининградская область',
      addressLocality: 'Холмогоровка',
    },
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '10:00', closes: '20:00',
    }],
    telephone: '+7 (4012) 00-00-00',
  };

  const graph = [];
  if (file === 'index.html') {
    graph.push(org, {
      '@type': 'WebSite', '@id': SITE + '/#site', url: SITE, name: NAME,
      inLanguage: 'ru-RU',
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: SITE + '/search.html?q={q}' },
        'query-input': 'required name=q',
      },
    });
  } else if (file === 'contacts.html') {
    graph.push(org);
  } else if (file === 'faq.html') {
    graph.push({ '@type': 'FAQPage', '@id': url + '#faq', url, name: title });
  } else if (file === 'article.html' || file === 'morning.html') {
    graph.push({
      '@type': 'Article', '@id': url + '#article', url, headline: title,
      description: desc, publisher: { '@id': SITE + '/#business' }, inLanguage: 'ru-RU',
    });
  } else if (file === 'events.html' || file === 'event.html') {
    graph.push({ '@type': 'CollectionPage', '@id': url, url, name: title, description: desc });
  } else {
    graph.push({ '@type': 'WebPage', '@id': url, url, name: title, description: desc,
                 isPartOf: { '@id': SITE + '/#site' }, inLanguage: 'ru-RU' });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

const files = (await readdir(DIST)).filter(f => f.endsWith('.html'));
let touched = 0;

for (const file of files) {
  const path = join(DIST, file);
  let html = await readFile(path, 'utf8');
  if (html.includes('property="og:title"')) continue;         // идемпотентность

  const title = (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [, NAME])[1].trim();
  const desc = (html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i) || [, ''])[1].trim();
  const url = `${SITE}/${file}`;
  const noindex = NOINDEX.has(file);

  const tags = [
    `<link rel="canonical" href="${url}">`,
    noindex ? '<meta name="robots" content="noindex,follow">' : '',
    `<meta property="og:type" content="${file === 'article.html' || file === 'morning.html' ? 'article' : 'website'}">`,
    `<meta property="og:site_name" content="${NAME}">`,
    `<meta property="og:locale" content="ru_RU">`,
    `<meta property="og:title" content="${esc(title)}">`,
    desc ? `<meta property="og:description" content="${esc(desc)}">` : '',
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${OG_IMAGE}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="Фермерский рынок «Холмогорское подворье»">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    desc ? `<meta name="twitter:image" content="${OG_IMAGE}">` : '',
    `<meta name="theme-color" content="#c87b3b">`,
    `<meta name="hp-audio" content="${HAS_AUDIO ? '1' : '0'}">`,
    WEATHER.has(file) ? '<link rel="preconnect" href="https://api.open-meteo.com" crossorigin>' : '',
    WEATHER.has(file) ? '<link rel="dns-prefetch" href="https://api.open-meteo.com">' : '',
    `<script type="application/ld+json">${jsonLd(file, title, desc)}</script>`,
  ].filter(Boolean).join('\n');

  html = html.replace('</head>', tags + '\n</head>');
  await writeFile(path, html, 'utf8');
  touched++;
}

/* ---------- sitemap.xml ---------- */
const urls = [];
for (const file of files) {
  if (NOINDEX.has(file)) continue;
  const s = await stat(join(DIST, file));
  const loc = file === 'index.html' ? SITE + '/' : `${SITE}/${file}`;
  urls.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>${s.mtime.toISOString().slice(0, 10)}</lastmod>
    <priority>${(PRIORITY[file] ?? 0.5).toFixed(1)}</priority>
  </url>`);
}
await writeFile(join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`, 'utf8');

/* ---------- robots.txt ---------- */
await writeFile(join(DIST, 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: /checkout.html\nDisallow: /order-success.html\nDisallow: /cart.html\n\nSitemap: ${SITE}/sitemap.xml\n`, 'utf8');

console.log(`[seo] OG и JSON-LD добавлены на ${touched} страниц · sitemap.xml (${urls.length} адресов) · robots.txt`);
