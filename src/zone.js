/* Ряд рынка — zone.html?id=dairy|meat|veg|sea|bread. Шаблон на 5 страниц.
   Категорийный свет применяется ко всей странице. §4.2 структуры. */
import './wave2.css';
import { rows, farmers, products, recipes, seasonality, MONTHS, CAT, byId } from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const money = n => n.toLocaleString('ru-RU') + ' ₽';
const id = new URLSearchParams(location.search).get('id') || 'dairy';
const row = rows.find(r => r.id === id) || rows[0];
const month = new Date().getMonth() + 1;
const inSeason = s => s && (s.from <= s.to ? (month >= s.from && month <= s.to) : (month >= s.from || month <= s.to));

document.title = `${row.title} — Холмогорское подворье`;
document.body.classList.add('cat-' + row.cat);

$('#zLetter').textContent = row.letter;
$('#zTitle').textContent = row.title;
$('#zLead').textContent = row.lead;
$('#zCrumb').textContent = row.title;

const rowFarmers = farmers.filter(f => f.cat === row.cat);
const rowProducts = products.filter(p => p.cat === row.cat);
const seasonNow = rowProducts.filter(p => inSeason(seasonality[p.id]));

$('#zMeta').innerHTML = [
  `<span>Ряд <b>${row.letter}</b></span>`,
  `<span>Хозяйств: <b>${rowFarmers.length}</b></span>`,
  `<span>Позиций: <b>${rowProducts.length}</b></span>`,
  seasonNow.length ? `<span>В сезоне сейчас: <b>${seasonNow.length}</b></span>` : '',
].filter(Boolean).join('');

$('#zManifesto').innerHTML = row.manifesto.map(p => `<p>${p}</p>`).join('');
$('#zGuide').innerHTML = row.guide.map(g => `<li><span>${g}</span></li>`).join('');

/* Хозяйства ряда. Если хозяйств нет — блок скрываем (§5.1 структуры). */
if (rowFarmers.length) {
  $('#zFarmers').innerHTML = rowFarmers.map(f => `
    <a class="tr" href="/farmer.html?id=${f.id}">
      <span class="mono2">${f.initials}</span>
      <span><b>${f.name}</b><span>${f.spec}</span></span>
    </a>`).join('');
} else $('#secFarmers').hidden = true;

/* Товары ряда */
$('#zProducts').innerHTML = rowProducts.map(p => {
  const s = seasonality[p.id];
  return `<article class="pcard cat-${p.cat}">
    <a href="/product.html?id=${p.id}" class="pc-img">${p.icon}
      ${inSeason(s) && s.peak === month ? '<span class="pc-tag">пик сезона</span>' : ''}</a>
    <div class="pc-b">
      <div class="pc-cat">${CAT[p.cat].label}</div>
      <h3><a href="/product.html?id=${p.id}">${p.name}</a></h3>
      <div class="pc-row"><div class="pc-price">${money(p.price)} <small>/ ${p.unit}</small></div>
        <button class="pc-add" data-add="${p.id}">В корзину</button></div>
    </div></article>`;
}).join('');
$('#zProducts').querySelectorAll('[data-add]').forEach(b => b.onclick = e => {
  const cart = JSON.parse(localStorage.getItem('hp_cart') || '{}');
  cart[b.dataset.add] = (cart[b.dataset.add] || 0) + 1;
  localStorage.setItem('hp_cart', JSON.stringify(cart));
  import('./motion.js').then(m => m.stampAt(e.clientX, e.clientY));
  const badge = $('#cartBadge');
  if (badge) { badge.textContent = Object.values(cart).reduce((a, b2) => a + b2, 0); badge.style.display = 'grid'; }
});

/* Рецепты, где есть продукты этого ряда */
const ids = rowProducts.map(p => p.id);
const rowRecipes = recipes.filter(r => r.products.some(p => ids.includes(p)));
if (rowRecipes.length) {
  $('#zRecipes').innerHTML = rowRecipes.slice(0, 3).map(r => `
    <a class="rcard" href="/recipe.html?slug=${r.slug}">
      <span class="rc-img">${r.emoji}</span>
      <div class="rc-b"><div class="rc-meta"><span>${r.cat}</span><span>${r.time}</span></div>
        <h3>${r.title}</h3><p>${r.desc}</p></div></a>`).join('');
} else $('#secRecipes').hidden = true;

/* Сезонность ряда */
const seasonRows = rowProducts.map(p => ({ p, s: seasonality[p.id] })).filter(x => x.s);
$('#zSeason').innerHTML = seasonRows.map(({ p, s }) => `
  <div class="season-row cat-${p.cat}">
    <span class="ic">${p.icon}</span>
    <span><b>${p.name}</b><span>${s.from === 1 && s.to === 12 ? 'круглый год' : `${MONTHS[s.from - 1]} — ${MONTHS[s.to - 1]}`} · ${s.note}</span></span>
    ${inSeason(s) ? '<span class="peak">сейчас</span>' : ''}
  </div>`).join('');

/* Ссылки в 3D и на другие ряды */
$('#z3d').href = `/index.html?goto=${rowFarmers[0]?.id || 'entrance'}&inside=1`;
$('#zOther').innerHTML = rows.filter(r => r.id !== row.id).map(r =>
  `<a class="chip" href="/zone.html?id=${r.id}">${r.title}</a>`).join('');
