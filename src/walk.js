/* «Прогулка» — точка входа в 3D с главами. Сама сцена живёт на главной,
   поэтому здесь только выбор режима и цели: ?goto=<id>&inside=1 (обработчик в main.js).
   Так мы не дублируем three.js на второй странице — вес остаётся на одной. */
import './wave1.css';
import { walkChapters } from './data.js';

const $ = (s, r = document) => r.querySelector(s);

$('#walkChs').innerHTML = walkChapters.map((c, i) => `
  <a class="walk-ch cat-${c.cat}" href="/index.html?goto=${c.target}&inside=1">
    <span class="n">${String(i + 1).padStart(2, '0')}</span>
    <span><b>${c.title}</b><p>${c.text}</p></span>
    <span class="go">Войти сюда →</span>
  </a>`).join('');

/* Предупреждение о трафике: интерьер — 8 МБ. Показываем на мобильном
   и при экономии данных (§4.2 структуры). */
const slow = navigator.connection && (navigator.connection.saveData ||
  /2g/.test(navigator.connection.effectiveType || ''));
if (slow || innerWidth < 760) {
  $('#walkWarn').hidden = false;
  if (slow) $('#walkWarn').textContent =
    'У вас включена экономия трафика. Прогулка загрузит около 8 МБ — лучше на Wi-Fi. Ниже есть текстовая версия.';
}
