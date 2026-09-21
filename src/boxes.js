/* «Фермерские боксы» — T3+T7. Состояния: сезонный бокс вне сезона помечается,
   выбор частоты подписки пересчитывает цену. Спецификация: хп/СТРУКТУРА §4.4 */
import './wave1.css';
import { boxes, boxPlans, products, byId, CAT } from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const money = n => n.toLocaleString('ru-RU') + ' ₽';
let plan = boxPlans[1];                   // «каждую неделю» — самый частый выбор

function priceWithPlan(base) {
  return Math.round(base * (100 - plan.discount) / 100);
}

function boxCard(b) {
  const items = b.items.map(id => byId(products, id)).filter(Boolean);
  const p = priceWithPlan(b.price);
  return `<article class="box cat-${b.cat}">
    <div class="box-top">
      <span class="box-size">${b.size}</span>
      ${b.seasonal ? '<span class="tag-season">сезонный</span>' : ''}
      <h3>${b.name}</h3>
      <p class="serves">${b.serves}</p>
    </div>
    <div class="box-b">
      <p>${b.desc}</p>
      <div class="box-items">${items.map(i => `<span>${i.icon} ${i.name.split(',')[0]}</span>`).join('')}</div>
      <div class="box-price">
        <b>${money(p)}</b>
        ${plan.discount ? `<s>${money(b.price)}</s>` : (b.oldPrice ? `<s>${money(b.oldPrice)}</s>` : '')}
      </div>
      <button class="btn btn-primary" data-box="${b.id}">Оформить бокс</button>
    </div>
  </article>`;
}

function renderPlans() {
  $('#plans').innerHTML = boxPlans.map(p => `
    <label class="plan ${p.id === plan.id ? 'on' : ''}" data-plan="${p.id}">
      <b>${p.label}</b>
      ${p.discount ? `<span class="disc">−${p.discount}% к цене</span>` : '<span class="note">полная цена</span>'}
      ${p.note ? `<span class="note">${p.note}</span>` : ''}
    </label>`).join('');
  $('#plans').querySelectorAll('[data-plan]').forEach(n => n.onclick = () => {
    plan = boxPlans.find(p => p.id === n.dataset.plan);
    renderPlans(); renderBoxes();
  });
}

function renderBoxes() {
  $('#boxGrid').innerHTML = boxes.map(boxCard).join('');
  $('#boxGrid').querySelectorAll('[data-box]').forEach(b => b.onclick = e => {
    const box = boxes.find(x => x.id === b.dataset.box);
    // Бокс кладём в корзину как набор позиций — отдельной сущности заказа пока нет
    const cart = JSON.parse(localStorage.getItem('hp_cart') || '{}');
    box.items.forEach(id => cart[id] = (cart[id] || 0) + 1);
    localStorage.setItem('hp_cart', JSON.stringify(cart));
    document.dispatchEvent(new CustomEvent('cart:changed'));
    const badge = $('#cartBadge');
    if (badge) {
      const n = Object.values(cart).reduce((a, b2) => a + b2, 0);
      badge.textContent = n; badge.style.display = 'grid';
    }
    import('./motion.js').then(m => m.stampAt(e.clientX, e.clientY));
  });
}

renderPlans();
renderBoxes();
