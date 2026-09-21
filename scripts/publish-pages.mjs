/* Публикация собранного сайта в ветку gh-pages.

   Собирает проект, копирует результат в отдельную папку и оттуда выкладывает.
   Отдельная папка нужна, чтобы не держать служебный git-репозиторий внутри
   dist: vite очищает dist при каждой сборке и снёс бы его.

   Использование:  node scripts/publish-pages.mjs
*/
import { execSync } from 'node:child_process';
import { copyFileSync, rmSync, mkdirSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/* Копируем своим обходом: fs.cpSync с recursive на этой машине роняет
   процесс Node без сообщения (код 127) на первой же вложенной папке. */
function copyTree(src, dst) {
  const st = statSync(src);
  if (st.isDirectory()) {
    mkdirSync(dst, { recursive: true });
    for (const name of readdirSync(src)) copyTree(join(src, name), join(dst, name));
  } else {
    copyFileSync(src, dst);
  }
}

const REPO = 'https://github.com/Vitalik4444/podvorye-3d.git';
const SITE_URL = process.env.SITE_URL || 'https://vitalik4444.github.io/podvorye-3d';
const OUT = join('build', 'pages');

// файлы, которые незачем публиковать: они для локального показа
const SKIP = new Set(['Open Site (Mac).command', 'commands.txt', 'README - open me.txt']);

function run(cmd, cwd) {
  try {
    execSync(cmd, { cwd, stdio: 'inherit' });
  } catch (e) {
    console.error(`\n[publish] команда не выполнилась (код ${e.status}):\n  ${cmd}` +
                  (cwd ? `\n  в папке: ${cwd}` : ''));
    process.exit(e.status || 1);
  }
}

console.log('1/4  сборка');
process.env.SITE_URL = SITE_URL;      // его читает scripts/seo.mjs
run('npm run build');

console.log('2/4  подготовка папки');
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
for (const name of readdirSync('dist')) {
  if (SKIP.has(name)) { console.log('    пропущено:', name); continue; }
  copyTree(join('dist', name), join(OUT, name));
}
writeFileSync(join(OUT, '.nojekyll'), '');   // иначе Pages прогонит файлы через Jekyll

console.log('3/4  коммит');
run('git init -q -b gh-pages', OUT);
run('git add -A', OUT);
run('git -c user.name=Vitalik4444 -c user.email=gbtchatofice@gmail.com ' +
    'commit -q -m "Сборка сайта для GitHub Pages"', OUT);

console.log('4/4  публикация');
run(`git remote add origin ${REPO}`, OUT);
run('git push -q --force origin gh-pages', OUT);

console.log('\nГотово:', SITE_URL + '/');
console.log('Обновление на Pages занимает до минуты.');
