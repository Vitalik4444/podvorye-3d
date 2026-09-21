/* «Стать арендатором» — калькулятор + выбор свободного места на плане.
   По аналитике (§1.3 аудиторий) именно эта страница окупает проект,
   и калькулятора окупаемости нет ни у одного из 10 конкурентов. */
import './wave2.css';
import { rentTypes, rentSeasons, trafficStats, marketPlan, farmerById, CAT } from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const money = n => Math.round(n).toLocaleString('ru-RU') + ' ₽';

/* Свободные места. В проде — поле status у stalls в CMS. */
const FREE = ['A4', 'B1', 'C3', 'D3'];

let type = rentTypes[0], season = rentSeasons[0], area = 8, stall = null;

/* ---------- Показатели потока ---------- */
$('#jnStats').innerHTML = `
  <div><b data-count="${trafficStats.guestsWeekday}">0</b><span>гостей в будний день</span></div>
  <div><b data-count="${trafficStats.guestsWeekend}">0</b><span>гостей в выходной</span></div>
  <div><b data-count="${trafficStats.avgCheck}">0</b><span>средний чек, ₽</span></div>
  <div><b data-count="${Math.round(trafficStats.conversion * 100)}">0</b><span>% гостей покупают</span></div>`;

/* ---------- Калькулятор ---------- */
function renderOpts() {
  $('#jnTypes').innerHTML = rentTypes.map(t => `
    <label class="calc-opt ${t.id === type.id ? 'on' : ''}" data-type="${t.id}">
      <b>${t.label}</b><span>${t.base.toLocaleString('ru-RU')} ₽/м²<br>${t.note}</span></label>`).join('');
  $('#jnSeasons').innerHTML = rentSeasons.map(s => `
    <label class="calc-opt ${s.id === season.id ? 'on' : ''}" data-season="${s.id}">
      <b>${s.label}</b><span>${s.note}</span></label>`).join('');
  $('#jnTypes').querySelectorAll('[data-type]').forEach(n => n.onclick = () => {
    type = rentTypes.find(t => t.id === n.dataset.type); renderOpts(); calc();
  });
  $('#jnSeasons').querySelectorAll('[data-season]').forEach(n => n.onclick = () => {
    season = rentSeasons.find(s => s.id === n.dataset.season); renderOpts(); calc();
  });
}

function calc() {
  const rent = type.base * area * season.mul;

  // Поток на место: делим гостей рынка на число мест, берём долю покупателей.
  // Это оценка, а не обещание — так и подписано в интерфейсе.
  const stalls = marketPlan.stalls.length;
  const weekGuests = trafficStats.guestsWeekday * 5 + trafficStats.guestsWeekend * 2;
  const seasonK = season.id === 'weekend' ? (trafficStats.guestsWeekend * 2) / weekGuests
                : season.id === 'summer' ? 1.2 : 1;
  const buyersMonth = weekGuests * 4.3 * trafficStats.conversion * seasonK / stalls;
  const revenue = buyersMonth * trafficStats.avgCheck;
  const margin = revenue * 0.28;                 // типичная наценка фермерской розницы
  const profit = margin - rent;
  const payback = profit > 0 ? rent / profit : null;

  $('#jnRent').textContent = money(rent);
  $('#jnBuyers').textContent = Math.round(buyersMonth).toLocaleString('ru-RU');
  $('#jnRevenue').textContent = money(revenue);
  $('#jnProfit').textContent = money(profit);
  $('#jnProfit').style.color = profit > 0 ? '#fff' : '#f0b8b4';
  $('#jnPayback').textContent = payback
    ? (payback < 1 ? 'меньше месяца' : `${payback.toFixed(1)} мес`)
    : 'не выходит';
  $('#jnAreaVal').textContent = area + ' м²';
  $('#jnStall').textContent = stall ? `место ${stall}` : 'место не выбрано';
}

$('#jnArea').oninput = e => { area = +e.target.value; calc(); };

/* ---------- План со свободными местами ---------- */
/* Обрезаем по границе слова, а не по символу: «Пекарня «Тёплый хл» читалось как ошибка */
function clip(s, max) {
  if (!s || s.length <= max) return s || '';
  const cut = s.slice(0, max);
  const sp = cut.lastIndexOf(' ');
  return (sp > max * 0.5 ? cut.slice(0, sp) : cut).replace(/[«(,\s]+$/, '') + '…';
}

function renderPlan() {
  const [w, h] = marketPlan.view;
  const stalls = marketPlan.stalls.map(s => {
    const free = FREE.includes(s.id);
    const f = s.farmer ? farmerById(s.farmer) : null;
    const name = f ? f.name : (s.name || '');
    const cat = f ? f.cat : s.cat;
    return `<g class="st ${free ? 'free' : 'busy'}" data-stall="${s.id}" data-free="${free}">
      <rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="10"
        ${!free && cat ? `fill="${CAT[cat].tint}"` : ''}></rect>
      <text x="${s.x + 12}" y="${s.y + 26}">${s.id}</text>
      <text x="${s.x + 12}" y="${s.y + 48}" style="font-weight:600;font-size:11px">${free ? 'свободно' : clip(name, 17)}</text>
    </g>`;
  }).join('');
  const zones = marketPlan.zones.map(z =>
    `<g><rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="8" fill="#e6ddcd"></rect>
     <text x="${z.x + 10}" y="${z.y + 22}" style="font-size:11px">${z.label}</text></g>`).join('');

  $('#jnPlan').innerHTML = `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="План рынка со свободными местами">
    ${zones}${stalls}</svg>`;

  $('#jnPlan').querySelectorAll('[data-stall]').forEach(g => g.onclick = () => {
    if (g.dataset.free !== 'true') return;
    $('#jnPlan').querySelectorAll('.st').forEach(x => x.classList.remove('on'));
    g.classList.add('on');
    stall = g.dataset.stall;
    calc();
    $('#jnStallField').value = stall;
  });
}

renderOpts(); renderPlan(); calc();
import('./motion.js').then(m => m.initCounters());
