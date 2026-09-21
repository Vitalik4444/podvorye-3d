/* «Собери свой бокс» — ключевая конверсионная механика.
   Ящик наполняется физически, шкала и цена считаются вживую.
   Состояния (§4.4 структуры): пустой ящик → подсказка; переполнен → мягкий отказ. */
import './wave1.css';
import { products, crates, productVolume, boxPlans, CAT, byId, farmerById } from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const money = n => n.toLocaleString('ru-RU') + ' ₽';

let crate = crates[1];                 // средний по умолчанию
let cat = 'all';
let plan = boxPlans[1];
const chosen = new Map();              // productId → количество

const vol = id => productVolume[id] || 2;
const used = () => [...chosen].reduce((s, [id, q]) => s + vol(id) * q, 0);
const sum = () => [...chosen].reduce((s, [id, q]) => s + byId(products, id).price * q, 0);

/* ---------- Каталог слева ---------- */
function renderCats() {
  const list = [['all', 'Всё'], ...Object.entries(CAT).map(([k, v]) => [k, v.label])];
  $('#bdCats').innerHTML = list.map(([k, label]) =>
    `<button data-cat="${k}" class="${k === cat ? 'on' : ''}">${label}</button>`).join('');
  $('#bdCats').querySelectorAll('button').forEach(b => b.onclick = () => { cat = b.dataset.cat; renderCats(); renderItems(); });
}

function renderItems() {
  const list = products.filter(p => cat === 'all' || p.cat === cat);
  const left = crate.cap - used();
  $('#bdGrid').innerHTML = list.map(p => {
    const f = farmerById(p.farmer);
    const tooBig = vol(p.id) > left;
    return `<div class="bd-item cat-${p.cat}">
      <span class="ic">${p.icon}</span>
      <b>${p.name}</b>
      <span class="pr">${money(p.price)} / ${p.unit}</span>
      <span class="pr" style="font-size:12px">${f ? f.name : ''}</span>
      <button class="add" data-add-item="${p.id}" ${tooBig ? 'disabled' : ''}>
        ${tooBig ? 'не влезет' : 'Положить'}</button>
    </div>`;
  }).join('');
  $('#bdGrid').querySelectorAll('[data-add-item]').forEach(b => b.onclick = e => add(b.dataset.addItem, e));
}

/* ---------- Ящик ---------- */
function add(id, e) {
  const left = crate.cap - used();
  if (vol(id) > left) {                                  // мягкий отказ + предложение размера
    const bigger = crates.find(c => c.cap > crate.cap);
    hint(bigger
      ? `В этот ящик больше не влезет. Взять ${bigger.label.toLowerCase()}?`
      : 'Ящик полон — это максимальный размер.');
    return;
  }
  chosen.set(id, (chosen.get(id) || 0) + 1);
  render();
  if (e) import('./motion.js').then(m => m.stampAt(e.clientX, e.clientY));
}
function remove(id) {
  const q = (chosen.get(id) || 0) - 1;
  if (q > 0) chosen.set(id, q); else chosen.delete(id);
  render();
}
function hint(text) {
  const h = $('#bdHint');
  h.textContent = text;
  h.style.color = 'var(--c-meat)';
  clearTimeout(hint._t);
  hint._t = setTimeout(() => { h.textContent = defaultHint(); h.style.color = ''; }, 4000);
}
const defaultHint = () => chosen.size
  ? 'Соберём в день заказа. Что не поместилось — можно взять отдельным боксом.'
  : 'Начните с молочного — его берут чаще всего.';

function renderCrate() {
  const box = $('#crateBox');
  if (!chosen.size) {
    box.innerHTML = `<p class="crate-empty">Ящик пока пустой.<br>Нажмите «Положить» у любого продукта.</p>`;
  } else {
    box.innerHTML = [...chosen].map(([id, q]) => {
      const p = byId(products, id);
      return `<span class="chip-item cat-${p.cat}">${p.icon}
        <span>${p.name.split(',')[0]}</span>
        ${q > 1 ? `<span class="q">×${q}</span>` : ''}
        <button class="x" data-del-item="${id}" aria-label="Убрать">×</button></span>`;
    }).join('');
    box.querySelectorAll('[data-del-item]').forEach(b => b.onclick = () => remove(b.dataset.delItem));
  }

  const p = Math.min(1, used() / crate.cap);
  const fill = $('#fill');
  fill.classList.toggle('warn', p >= 0.7 && p < 1);
  fill.classList.toggle('full', p >= 1);
  $('#fillBar').style.transform = `scaleX(${p})`;
  $('#fillMeta').textContent = `Занято ${used()} из ${crate.cap}`;
  $('#fillLeft').textContent = p >= 1 ? 'ящик полон' : `свободно ${Math.round((1 - p) * 100)}%`;

  const base = sum();
  $('#bdTotal').textContent = money(Math.round(base * (100 - plan.discount) / 100));
  $('#bdPlanNote').textContent = plan.discount
    ? `${plan.label.toLowerCase()} · −${plan.discount}%`
    : plan.label.toLowerCase();
  $('#bdCount').textContent = `${chosen.size} ${plural(chosen.size, ['позиция','позиции','позиций'])}`;
  $('#bdSubmit').disabled = !chosen.size;
}
const plural = (n, f) => f[(n % 10 === 1 && n % 100 !== 11) ? 0 : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? 1 : 2];

function renderSizes() {
  $('#crateSizes').innerHTML = crates.map(c =>
    `<button data-size="${c.id}" class="${c.id === crate.id ? 'on' : ''}">${c.label}<br><small>${c.note}</small></button>`).join('');
  $('#crateSizes').querySelectorAll('button').forEach(b => b.onclick = () => {
    const next = crates.find(c => c.id === b.dataset.size);
    if (next.cap < used()) { hint('В меньший ящик уже не поместится — уберите что-нибудь.'); return; }
    crate = next; render();
  });
}
function renderPlanSel() {
  $('#bdPlans').innerHTML = boxPlans.map(p =>
    `<label class="plan ${p.id === plan.id ? 'on' : ''}" data-plan="${p.id}">
      <b>${p.label}</b>${p.discount ? `<span class="disc">−${p.discount}%</span>` : ''}</label>`).join('');
  $('#bdPlans').querySelectorAll('[data-plan]').forEach(n => n.onclick = () => {
    plan = boxPlans.find(p => p.id === n.dataset.plan); render();
  });
}

function render() { renderSizes(); renderPlanSel(); renderItems(); renderCrate(); $('#bdHint').textContent ||= defaultHint(); }

/* Оформление: складываем содержимое ящика в корзину */
$('#bdSubmit').onclick = () => {
  const cart = JSON.parse(localStorage.getItem('hp_cart') || '{}');
  chosen.forEach((q, id) => cart[id] = (cart[id] || 0) + q);
  localStorage.setItem('hp_cart', JSON.stringify(cart));
  location.href = '/cart.html';
};

renderCats(); render();
$('#bdHint').textContent = defaultHint();
