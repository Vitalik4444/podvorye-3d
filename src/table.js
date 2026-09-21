/* Ф17 «Корзина-стол»: товары как предметы на деревянной столешнице.
   Правило доступности из спецификации: стол декоративен — все действия
   доступны в обычном списке, поэтому drag с клавиатуры не требуется.
   Переключатель помнит выбор; на мобильном стол не показываем. */
import './wave3.css';
import { products, byId } from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const KEY = 'hp_cartview';
const isSmall = matchMedia('(max-width: 760px)').matches;

const getCart = () => { try { return JSON.parse(localStorage.getItem('hp_cart') || '{}'); } catch { return {}; } };
const setCart = c => { localStorage.setItem('hp_cart', JSON.stringify(c)); };

let view = isSmall ? 'list' : (localStorage.getItem(KEY) || 'list');

function mountToggle() {
  const list = $('#cartList');
  if (!list || isSmall) return null;

  /* #cartList — прямой ребёнок grid-контейнера .cart (1fr 340px).
     Вставлять переключатель и стол рядом нельзя: они стали бы отдельными
     ячейками сетки и вытеснили чек. Поэтому заводим общую колонку. */
  const col = document.createElement('div');
  col.className = 'cart-left';
  list.parentElement.insertBefore(col, list);

  const bar = document.createElement('div');
  bar.className = 'cart-view';
  bar.innerHTML = `
    <button data-view="list">Списком</button>
    <button data-view="table">На столе</button>`;
  col.appendChild(bar);

  const table = document.createElement('div');
  table.className = 'table';
  table.id = 'cartTable';
  table.innerHTML = '<p class="table-hint">Разложите как удобно — это только для вида, цены считаются в списке.</p>';
  col.appendChild(table);
  col.appendChild(list);                     // список переезжает в ту же колонку

  bar.querySelectorAll('[data-view]').forEach(b => b.onclick = () => {
    view = b.dataset.view; localStorage.setItem(KEY, view); apply();
  });
  return { bar, table };
}

function apply() {
  const list = $('#cartList'), table = $('#cartTable'), bar = document.querySelector('.cart-view');
  if (!list || !table) return;
  bar?.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('on', b.dataset.view === view));
  const cart = getCart();
  const empty = !Object.keys(cart).length;
  table.hidden = view !== 'table' || empty;
  list.hidden = view === 'table' && !empty;
  if (view === 'table' && !empty) renderTable(cart);
}

function renderTable(cart) {
  const table = $('#cartTable');
  table.querySelectorAll('.titem').forEach(n => n.remove());
  const ids = Object.keys(cart);
  const cols = Math.max(1, Math.floor((table.clientWidth - 40) / 150));

  ids.forEach((id, i) => {
    const p = byId(products, id);
    if (!p) return;
    const el = document.createElement('div');
    el.className = 'titem cat-' + p.cat;
    // раскладываем сеткой, но с лёгким «беспорядком» — стол, а не таблица
    const x = 26 + (i % cols) * 150 + ((i * 37) % 13);
    const y = 26 + Math.floor(i / cols) * 150 + ((i * 53) % 11);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.transform = `rotate(${((i * 29) % 7) - 3}deg)`;
    el.innerHTML = `
      <span class="ic">${p.icon}</span>
      <b>${p.name.split(',')[0]}</b>
      <span class="pr">${p.price.toLocaleString('ru-RU')} ₽</span>
      ${cart[id] > 1 ? `<span class="q">${cart[id]}</span>` : ''}
      <button class="x" aria-label="Убрать ${p.name}">×</button>`;
    el.querySelector('.x').onclick = ev => {
      ev.stopPropagation();
      const c = getCart(); delete c[id]; setCart(c);
      document.dispatchEvent(new CustomEvent('cart:refresh'));
      apply();
    };
    drag(el, table);
    table.appendChild(el);
  });
  const rows = Math.ceil(ids.length / cols);
  table.style.minHeight = Math.max(280, rows * 150 + 70) + 'px';
}

/* Перетаскивание: pointer events, только transform/left/top, без библиотек */
function drag(el, bounds) {
  let sx = 0, sy = 0, ox = 0, oy = 0, id = null;
  el.addEventListener('pointerdown', e => {
    if (e.target.closest('.x')) return;
    id = e.pointerId; el.setPointerCapture(id);
    el.classList.add('drag');
    sx = e.clientX; sy = e.clientY;
    ox = parseFloat(el.style.left) || 0; oy = parseFloat(el.style.top) || 0;
  });
  el.addEventListener('pointermove', e => {
    if (id === null) return;
    const r = bounds.getBoundingClientRect();
    const nx = Math.max(8, Math.min(r.width - 140, ox + e.clientX - sx));
    const ny = Math.max(8, Math.min(r.height - 120, oy + e.clientY - sy));
    el.style.left = nx + 'px'; el.style.top = ny + 'px';
  });
  const up = () => { if (id !== null) { el.releasePointerCapture(id); id = null; el.classList.remove('drag'); } };
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
}

/* Старт: ждём, пока site.js отрисует корзину */
function init() {
  if (!$('#cartList')) return;
  mountToggle();
  apply();
  document.addEventListener('cart:refresh', () => setTimeout(apply, 60));
  addEventListener('resize', () => { if (view === 'table') apply(); });
}
if (document.readyState === 'loading') addEventListener('DOMContentLoaded', () => setTimeout(init, 80));
else setTimeout(init, 80);
