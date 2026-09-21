/* Витринная полоса в каталоге — «шов» другого регистра, который разрывает
   монотонность сетки (правило §5.2: два соседних блока не могут иметь
   одинаковую раскладку). Продукт дня берём из живых данных, иначе — хит. */
import './editorial.css';
import { products, farmerById, CAT, byId } from './data.js';

const q = (s, r = document) => r.querySelector(s);
const money = n => n.toLocaleString('ru-RU') + ' ₽';

(async function spot() {
  const el = q('#edSpot');
  if (!el) return;

  let pick = null, reason = 'Хит подворья';
  try {
    const r = await fetch('./api/today.json', { cache: 'no-store' });
    if (r.ok) {
      const j = await r.json();
      const fresh = j.updated_at && (Date.now() - new Date(j.updated_at)) / 36e5 < 20;
      if (fresh && j.arrivals?.length) {
        pick = byId(products, j.arrivals[0].product);
        reason = `Привезли сегодня в ${j.arrivals[0].time}`;
      }
    }
  } catch { /* без живых данных берём хит */ }

  if (!pick) pick = products.find(p => p.hit) || products[0];
  const f = farmerById(pick.farmer);

  el.className = 'ed-spot cat-' + pick.cat;
  el.innerHTML = `<div class="ed-spot-in">
    <div class="vis">${pick.icon}</div>
    <div>
      <p class="kicker">${reason}</p>
      <h2>${pick.name}</h2>
      <p>${f ? f.story : ''}</p>
      <div class="row">
        <span class="price">${money(pick.price)} <small>/ ${pick.unit}</small></span>
        <button class="btn btn-primary" data-add="${pick.id}">В корзину</button>
        <a class="btn btn-ghost" style="color:#f4efe6;border-color:rgba(244,239,230,.5)" href="/product.html?id=${pick.id}">Подробнее</a>
      </div>
    </div>
  </div>`;

  el.querySelector('[data-add]').onclick = e => {
    const cart = JSON.parse(localStorage.getItem('hp_cart') || '{}');
    cart[pick.id] = (cart[pick.id] || 0) + 1;
    localStorage.setItem('hp_cart', JSON.stringify(cart));
    const badge = q('#cartBadge');
    if (badge) { badge.textContent = Object.values(cart).reduce((a, b) => a + b, 0); badge.classList.add('on'); }
    import('./motion.js').then(m => m.stampAt(e.clientX, e.clientY));
  };
})();
