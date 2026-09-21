/* Переписывает корневые ссылки в собранных страницах на относительные.

   По всему сайту ссылки заданы от корня: /index.html, /catalog.html, /img/...
   На своём домене это правильно, но на GitHub Pages сайт лежит в подпапке
   вида /podvorye-3d/, и такие ссылки уводят на корень домена — в 404.

   Все страницы лежат плоско в корне сборки, поэтому достаточно снять ведущий
   слэш: /catalog.html -> catalog.html, /img/x.jpg -> img/x.jpg.

   Не трогаем:
   - полные адреса (https://, //cdn...) — они и должны остаться абсолютными;
   - canonical и og:url, которые проставляет seo.mjs: там полные адреса.
*/
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist';
const pages = readdirSync(dist).filter(f => f.endsWith('.html'));

// ="/что-то  и  ='/что-то  — но не ="//  (протокол-относительные)
const ATTR = /(\s(?:href|src|content|data-src|poster)\s*=\s*)(["'])\/(?!\/)/gi;
// url(/...) в инлайновых стилях
const CSSURL = /url\((["']?)\/(?!\/)/gi;

let total = 0;
const perFile = [];

for (const file of pages) {
  const path = join(dist, file);
  const before = readFileSync(path, 'utf8');
  let n = 0;
  let after = before.replace(ATTR, (m, pre, q) => { n++; return pre + q; });
  after = after.replace(CSSURL, (m, q) => { n++; return 'url(' + q; });
  if (n) {
    writeFileSync(path, after);
    perFile.push(`${file}: ${n}`);
    total += n;
  }
}

// контроль: не осталось ли корневых ссылок
let left = 0;
for (const file of pages) {
  const s = readFileSync(join(dist, file), 'utf8');
  const m = s.match(/(?:href|src|content)\s*=\s*["']\/(?!\/)/gi);
  if (m) {
    left += m.length;
    console.warn(`[relativize] в ${file} осталось корневых ссылок: ${m.length}`);
  }
}

console.log(`[relativize] страниц ${pages.length}, ссылок переписано ${total}` +
            (left ? `, ОСТАЛОСЬ ${left}` : ', корневых не осталось'));
