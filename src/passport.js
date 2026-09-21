/* Паспорт партии — passport.html?code=HP-2607-MOL. Приходят по QR с упаковки,
   поэтому первый экран обязан отвечать без скролла (§4.3 структуры).
   Состояние: код не найден → объясняем и ведём к товару. */
import './wave2.css';
import { batches, products, farmers, byId, farmerById, CAT } from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const money = n => n.toLocaleString('ru-RU') + ' ₽';
const code = (new URLSearchParams(location.search).get('code') || '').toUpperCase();
const batch = batches.find(b => b.code === code) || (code ? null : batches[0]);

if (!batch) {
  /* Удаляем, а не прячем: иначе на странице два h1 (аудит §3.3) */
  $('#ppFound').remove();
  $('#ppMiss').hidden = false;
  $('#ppMissCode').textContent = code || '—';
  $('#ppOther').innerHTML = batches.map(b => {
    const p = byId(products, b.product);
    return `<a class="chip" href="/passport.html?code=${b.code}">${p ? p.icon + ' ' + p.name : b.code}</a>`;
  }).join('');
} else {
  $('#ppMiss').remove();
  const p = byId(products, batch.product);
  const f = farmerById(batch.farmer);
  document.body.classList.add('cat-' + (p?.cat || 'bread'));
  document.title = `${p ? p.name : 'Партия'} · партия ${batch.code}`;

  $('#ppCode').textContent = 'партия ' + batch.code;
  $('#ppTitle').textContent = p ? p.name : 'Продукт';
  $('#ppWhen').textContent = `Изготовлено ${batch.produced}` + (batch.volume ? ` · ${batch.volume}` : '');

  $('#ppWho').innerHTML = f ? `
    <b class="big">${f.name}</b>
    <p style="color:var(--muted);margin-top:8px">${f.spec} · ${f.tagline || ''}</p>
    <a class="btn btn-ghost" href="/farmer.html?id=${f.id}" style="margin-top:16px">Профиль хозяйства</a>` :
    '<p style="color:var(--muted)">Хозяйство не указано</p>';

  $('#ppPath').innerHTML = `
    <b class="big">${batch.distanceKm} км</b>
    <p style="color:var(--muted);margin-top:8px">${batch.distanceKm === 0
      ? 'Сделано здесь же, на подворье.'
      : 'от места производства до прилавка'}</p>
    <div class="pp-path"><span class="dot"></span><span class="line"></span><span class="dot"></span></div>
    <p style="font-size:13px;color:var(--muted);margin-top:8px">
      <span>${f ? (f.id === 'ulov' ? 'Балтийское побережье' : 'Хозяйство') : 'Хозяйство'}</span> → <span>прилавок рынка</span></p>`;

  $('#ppNote').textContent = batch.note;
  $('#ppChecks').innerHTML = batch.checks.map(c => `<li>${c}</li>`).join('');

  if (p) {
    $('#ppBuy').innerHTML = `
      <div class="split-57">
        <div>
          <p class="eyebrow">Взять ещё</p>
          <h2 class="sect-t">${p.name}</h2>
          <p class="lead" style="color:var(--muted);margin-top:10px">${money(p.price)} / ${p.unit} · ${CAT[p.cat].label}</p>
          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:20px">
            <button class="btn btn-primary" data-add="${p.id}">В корзину</button>
            <a class="btn btn-ghost" href="/product.html?id=${p.id}">Страница товара</a>
          </div>
        </div>
        <div class="pp-card">
          <h3>Как мы проверяем</h3>
          <p style="color:var(--muted)">Каждая партия получает код при выпуске. Мы храним дату, объём,
          хозяйство и результаты проверок — и показываем их вам без запроса.</p>
          <a class="btn btn-ghost" href="/about.html" style="margin-top:14px">О контроле качества</a>
        </div>
      </div>`;
    $('#ppBuy').querySelector('[data-add]').onclick = e => {
      const cart = JSON.parse(localStorage.getItem('hp_cart') || '{}');
      cart[p.id] = (cart[p.id] || 0) + 1;
      localStorage.setItem('hp_cart', JSON.stringify(cart));
      import('./motion.js').then(m => m.stampAt(e.clientX, e.clientY));
    };
  }

  // соседние партии — для демонстрации, в проде тут ничего не будет
  $('#ppOther2').innerHTML = batches.filter(b => b.code !== batch.code).map(b => {
    const pp = byId(products, b.product);
    return `<a class="chip" href="/passport.html?code=${b.code}">${pp ? pp.icon + ' ' + pp.name : b.code}</a>`;
  }).join('');
}
