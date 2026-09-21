/* Колесо сезонов (Ф20). Drag/скролл с инерцией нет намеренно: snap по месяцам
   надёжнее и работает с клавиатуры. Мобильный вариант — вертикальная лента (CSS). */
import './wave1.css';
import { products, seasonality, MONTHS, CAT, byId } from './data.js';

const $ = (s, r = document) => r.querySelector(s);
let month = new Date().getMonth() + 1;          // 1–12, текущий месяц

const inSeason = (s, m) => s.from <= s.to ? (m >= s.from && m <= s.to) : (m >= s.from || m <= s.to);
const yearRound = s => s.from === 1 && s.to === 12;

function productsOf(m) {
  return Object.entries(seasonality)
    .filter(([, s]) => inSeason(s, m))
    .map(([id, s]) => ({ p: byId(products, id), s }))
    .filter(x => x.p)
    .sort((a, b) => (a.s.peak === m ? -1 : 0) - (b.s.peak === m ? -1 : 0) ||
                    (yearRound(a.s) ? 1 : 0) - (yearRound(b.s) ? 1 : 0));
}

function buildRing() {
  const ring = $('#ring');
  // Позиции считаем в left/top (проценты от контейнера), а не в translate:
  // проценты в translate относятся к размеру самого элемента.
  ring.innerHTML = MONTHS.map((name, i) => {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const r = 42;
    const left = 50 + Math.cos(a) * r;
    const top = 50 + Math.sin(a) * r;
    return `<button class="wheel-m" data-m="${i + 1}" type="button"
      style="left:${left.toFixed(2)}%; top:${top.toFixed(2)}%">${name}</button>`;
  }).join('');
  ring.querySelectorAll('.wheel-m').forEach(n => {
    n.onclick = () => { month = +n.dataset.m; render(); };
  });
}

function render() {
  const idx = month - 1;
  // кольцо поворачиваем так, чтобы выбранный месяц оказался наверху,
  // а подписи контр-вращаем на тот же угол — текст остаётся горизонтальным
  $('#ring').style.transform = `rotate(${-idx * 30}deg)`;
  $('#ring').style.setProperty('--counter', `${idx * 30}deg`);
  $('#ring').querySelectorAll('.wheel-m').forEach(n =>
    n.classList.toggle('on', +n.dataset.m === month));

  const list = productsOf(month);
  const peak = list.filter(x => x.s.peak === month);
  $('#hubMonth').textContent = MONTHS[idx];
  $('#hubCount').textContent = peak.length
    ? `${peak.length} ${plural(peak.length, ['продукт в пике','продукта в пике','продуктов в пике'])}`
    : `${list.length} в сезоне`;

  $('#seasonList').innerHTML = list.map(({ p, s }) => `
    <a class="season-row cat-${p.cat}" href="/product.html?id=${p.id}">
      <span class="ic">${p.icon}</span>
      <span><b>${p.name}</b><span>${s.note}${yearRound(s) ? '' : ` · ${MONTHS[s.from - 1]} — ${MONTHS[s.to - 1]}`}</span></span>
      ${s.peak === month ? '<span class="peak">пик сезона</span>' : ''}
    </a>`).join('');

  // «что заканчивается» и «что будет через месяц»
  const next = month === 12 ? 1 : month + 1;
  const ending = list.filter(({ s }) => !yearRound(s) && !inSeason(s, next));
  const coming = productsOf(next).filter(({ p, s }) => !yearRound(s) && !inSeason(s, month));
  $('#ending').innerHTML = ending.length
    ? ending.map(({ p }) => `<span>${p.icon} ${p.name.split(',')[0]}</span>`).join('')
    : '<span style="color:var(--muted)">в этом месяце ничего не уходит</span>';
  $('#coming').innerHTML = coming.length
    ? coming.map(({ p }) => `<span>${p.icon} ${p.name.split(',')[0]}</span>`).join('')
    : '<span style="color:var(--muted)">в следующем месяце новинок нет</span>';
  $('#nextMonth').textContent = MONTHS[next - 1];
}
const plural = (n, f) => f[(n % 10 === 1 && n % 100 !== 11) ? 0 : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? 1 : 2];

/* Управление: кнопки, клавиатура, колесо мыши по области */
$('#prevM').onclick = () => { month = month === 1 ? 12 : month - 1; render(); };
$('#nextM').onclick = () => { month = month === 12 ? 1 : month + 1; render(); };
$('#wheel').tabIndex = 0;
$('#wheel').addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') { $('#prevM').click(); e.preventDefault(); }
  if (e.key === 'ArrowRight') { $('#nextM').click(); e.preventDefault(); }
});

buildRing();
render();
