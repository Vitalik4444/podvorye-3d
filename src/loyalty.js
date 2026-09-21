/* «Подворье-клуб» — карточка со штампами вместо бонусных баллов (Ф24).
   Язык рынка, а не банка. Штампы живут в localStorage (в проде — в аккаунте). */
import './wave2.css';
import { loyaltyRules } from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const KEY = 'hp_stamps';
const MAX = 12;

const STAMP = `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4">
  <circle cx="50" cy="50" r="40" stroke-dasharray="5 6" opacity=".7"/>
  <path d="M50 28l9 9-9 9-9-9z" fill="currentColor" stroke="none"/>
  <path d="M31 60h38M38 70h24" stroke-linecap="round"/></svg>`;

const get = () => Math.min(MAX, +(localStorage.getItem(KEY) || 0));
const set = n => { localStorage.setItem(KEY, String(Math.max(0, Math.min(MAX, n)))); render(); };

function render() {
  const n = get();
  $('#stGrid').innerHTML = Array.from({ length: MAX }, (_, i) =>
    `<div class="stamp-cell ${i < n ? 'filled' : ''}">${i < n ? STAMP : ''}</div>`).join('');
  $('#stCount').textContent = `${n} из ${MAX}`;

  $('#stRules').innerHTML = loyaltyRules.map(r => `
    <li class="${n >= r.stamps ? 'done' : ''}">
      <b>${r.stamps}</b>
      <span>${r.reward}${n >= r.stamps ? ' — доступно' : ''}</span>
    </li>`).join('');

  const next = loyaltyRules.find(r => r.stamps > n);
  $('#stNext').textContent = next
    ? `До «${next.reward.toLowerCase()}» осталось ${next.stamps - n} ${plural(next.stamps - n, ['штамп', 'штампа', 'штампов'])}.`
    : 'Карточка заполнена — приходите за боксом.';

  $('#stReset').hidden = n === 0;
}
const plural = (n, f) => f[(n % 10 === 1 && n % 100 !== 11) ? 0 : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? 1 : 2];

/* Демонстрация: в проде штамп ставит касса, здесь — кнопка */
$('#stAdd').onclick = e => {
  set(get() + 1);
  import('./motion.js').then(m => m.stampAt(e.clientX, e.clientY));
};
$('#stReset').onclick = () => set(0);

render();
