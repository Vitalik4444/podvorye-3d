/* Собирает просмотрщик модели для публикации в интернете.

   Отличие от самодостаточного файла (build_single.py): модели, библиотеки и
   декодер лежат отдельными файлами, а не вшиты строкой base64. Так страница
   открывается сразу, а модель докачивается с полосой прогресса; base64 к тому
   же раздувает данные на треть.

   Использование:
     node scripts/viewer/build-hosted.mjs <фасады.glb> <интерьер.glb> <куда> <zones.json>
*/
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, copyFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const [extGlb, intGlb, out, zonesPath] = process.argv.slice(2);

// fs.cpSync с recursive на этой машине роняет Node без сообщения — обходим сами
function copyTree(src, dst) {
  if (statSync(src).isDirectory()) {
    mkdirSync(dst, { recursive: true });
    for (const n of readdirSync(src)) copyTree(join(src, n), join(dst, n));
  } else {
    copyFileSync(src, dst);
  }
}

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'models'), { recursive: true });

const shell = readFileSync(join(HERE, 'shell.html'), 'utf8');
const zones = readFileSync(zonesPath, 'utf8');

const head =
  '<script>\n' +
  'window.__ZONES=' + zones + ';\n' +
  "window.__EXT_URL='models/facades.glb';\n" +
  "window.__INT_URL='models/interior.glb';\n" +
  '</' + 'script>';

const html = shell
  .replace('<!--DATA-->', head)
  .replace('<!--LIBS-->', '<script src="libs.js"></' + 'script>')
  .replace('<!--APP-->', '<script src="viewer.js"></' + 'script>');

writeFileSync(join(out, 'index.html'), html);
copyFileSync(join(HERE, 'libs.js'), join(out, 'libs.js'));
copyFileSync(join(HERE, 'viewer.js'), join(out, 'viewer.js'));
copyFileSync(extGlb, join(out, 'models', 'facades.glb'));
copyFileSync(intGlb, join(out, 'models', 'interior.glb'));
copyTree('public/draco', join(out, 'draco'));

const mb = p => (statSync(p).size / 1048576).toFixed(2);
console.log('index.html   %s МБ', mb(join(out, 'index.html')));
console.log('libs.js      %s МБ', mb(join(out, 'libs.js')));
console.log('фасады       %s МБ', mb(join(out, 'models', 'facades.glb')));
console.log('интерьер     %s МБ', mb(join(out, 'models', 'interior.glb')));
console.log('готово ->', out);
