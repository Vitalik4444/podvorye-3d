/* ============================================================
   Шапка v4: служебная строка + пять разделов с подменю + SVG-иконки.
   Знак вырезается из официального лок-апа по bbox группы .cls-1,
   поэтому в шапке он стоит отдельно и не сминается с начертанием.
   ============================================================ */
import './hdr.css';
import logoSvg from './logo.svg?raw';

const ICONS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5 21 21"/>',
  cart: '<path d="M3 5h2l2.2 10.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L20 8H6"/><circle cx="10" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/>',
  user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5"/>',
  burger: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
};
const icon = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${ICONS[n]}</svg>`;

/* Пять разделов вместо девяти равновесных пунктов (IA §4.2 аналитики) */
const NAV = [
  { label: 'Сейчас', href: '/now.html', items: [
    ['/now.html', 'Сегодня на подворье', 'кто стоит, что привезли, цены дня'],
    ['/events.html', 'События и афиша', 'ярмарки, мастер-классы, праздники'],
    ['/foodcourt.html', 'Фудкорт', 'меню дня и свободные места'],
  ]},
  { label: 'Купить', href: '/catalog.html', items: [
    ['/catalog.html', 'Каталог', 'всё, что есть на прилавках'],
    ['/boxes.html', 'Фермерские боксы', 'готовые наборы и подписка'],
    ['/builder.html', 'Собрать свой ящик', 'конструктор с расчётом цены'],
    ['/recipes.html', 'Рецепты', 'ингредиенты — сразу в корзину'],
    ['/delivery.html', 'Доставка и самовывоз', 'зоны, слоты, условия'],
  ]},
  { label: 'Рынок', href: '/walk.html', items: [
    ['/walk.html', 'Прогулка в 3D', 'шесть глав по рядам'],
    ['/map.html', 'План зала', 'кто где стоит'],
    ['/zone.html?id=dairy', 'Ряды рынка', 'молочный, мясной, овощной, рыбный, хлебный'],
    ['/about.html', 'О рынке', 'как всё устроено и кого берём'],
    ['/guests.html', 'Гостям', 'как добраться, с детьми, парковка'],
  ]},
  { label: 'Люди', href: '/farmers.html', items: [
    ['/farmers.html', 'Хозяйства', 'кто производит и как'],
    ['/journal-farm.html', 'Дневники хозяйств', 'записи фермеров'],
    ['/stories.html', 'Истории гостей', 'доска с записками'],
    ['/passport.html', 'Паспорт партии', 'что стоит за кодом на упаковке'],
  ]},
  { label: 'Журнал', href: '/journal.html', items: [
    ['/journal.html', 'Подворье. Журнал', 'люди, продукт, край'],
    ['/morning.html', 'Утро на рынке', 'репортаж 5:40 — 12:00'],
    ['/seasons.html', 'Календарь сезонов', 'что созревает по месяцам'],
  ]},
];

const SCHEDULE = { open: 10, close: 20 };
const pad = n => String(n).padStart(2, '0');

/* Знак из официального лок-апа: обрезаем viewBox по группе .cls-1 */
function markSvg() {
  const holder = document.createElement('div');
  holder.style.cssText = 'position:absolute;left:-9999px;top:0;width:400px';
  holder.innerHTML = logoSvg;
  document.body.appendChild(holder);
  const svg = holder.querySelector('svg');
  let box = null;
  svg.querySelectorAll('.cls-1').forEach(p => {
    const b = p.getBBox();
    if (!b.width || !b.height) return;
    box = box ? {
      x: Math.min(box.x, b.x), y: Math.min(box.y, b.y),
      x2: Math.max(box.x2, b.x + b.width), y2: Math.max(box.y2, b.y + b.height),
    } : { x: b.x, y: b.y, x2: b.x + b.width, y2: b.y + b.height };
  });
  svg.querySelectorAll('.cls-2').forEach(p => p.remove());
  if (box) {
    const pad2 = 6;
    svg.setAttribute('viewBox', `${box.x - pad2} ${box.y - pad2} ${box.x2 - box.x + pad2 * 2} ${box.y2 - box.y + pad2 * 2}`);
  }
  svg.removeAttribute('width'); svg.removeAttribute('height'); svg.removeAttribute('id');
  svg.setAttribute('class', 'hd-mark');
  svg.setAttribute('aria-hidden', 'true');
  const out = svg.outerHTML;
  holder.remove();
  return out;
}

function status() {
  const h = new Date().getHours() + new Date().getMinutes() / 60;
  const open = h >= SCHEDULE.open && h < SCHEDULE.close;
  return open
    ? { open, text: `Открыто до ${SCHEDULE.close}:00` }
    : { open, text: `Закрыто · откроется в ${SCHEDULE.open}:00` };
}

export function buildHeaderV4() {
  const page = document.body.dataset.page || '';
  const st = status();

  const bar = document.createElement('div');
  bar.className = 'hb';
  bar.innerHTML = `<div class="hb-in">
    <span class="hb-left"><span class="dot${st.open ? '' : ' off'}"></span>${st.text} · Холмогоровка, 20 км от Калининграда</span>
    <span class="hb-right">
      <a href="/join.html">Арендаторам</a><span class="hb-sep">·</span>
      <a href="/partners.html">Оптом и HoReCa</a><span class="hb-sep">·</span>
      <a href="/press.html">Пресса</a><span class="hb-sep">·</span>
      <a href="tel:+74012000000">+7 (4012) 00-00-00</a>
    </span>
  </div>`;

  const navHtml = NAV.map(g => {
    const active = g.items.some(([h]) => page && h.includes(page)) || (page && g.href.includes(page));
    return `<div class="hd-item${active ? ' active' : ''}">
      <button class="hd-link" aria-expanded="false">${g.label}<span class="chev"></span></button>
      <div class="hd-drop">
        ${g.items.map(([h, t, s]) => `<a href="${h}"><b>${t}</b><span>${s}</span></a>`).join('')}
      </div>
    </div>`;
  }).join('');

  const hd = document.createElement('header');
  hd.className = 'hd';
  hd.innerHTML = `<div class="hd-in">
    <a class="hd-brand" href="/index.html" aria-label="Холмогорское подворье — на главную">
      <span class="hd-plate">${markSvg()}</span>
      <span class="hd-word"><b>Холмогорское<br>подворье</b><span>фермерский рынок</span></span>
    </a>
    <nav class="hd-nav" aria-label="Основное меню">${navHtml}</nav>
    <div class="hd-tools">
      <button class="hd-ico" id="hdSearch" aria-label="Поиск">${icon('search')}</button>
      <a class="hd-ico" href="/cart.html" aria-label="Корзина">${icon('cart')}<span class="badge" id="cartBadge"></span></a>
      <button class="hd-ico" id="hdUser" aria-label="Войти">${icon('user')}</button>
      <button class="hd-ico hd-burger" id="hdBurger" aria-label="Меню">${icon('burger')}</button>
    </div>
  </div>`;

  document.body.prepend(hd);
  document.body.prepend(bar);

  /* Мобильная панель */
  const scrim = document.createElement('div');
  scrim.className = 'hd-scrim';
  const panel = document.createElement('aside');
  panel.className = 'hd-panel';
  panel.innerHTML = `<button class="close" aria-label="Закрыть">${icon('close')}</button>
    ${NAV.map(g => `<p class="grp">${g.label}</p>${g.items.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}`).join('')}
    <p class="grp">Своим</p>
    <a href="/join.html">Стать арендатором</a><a href="/partners.html">Оптом и HoReCa</a>
    <a href="/faq.html">Вопросы</a><a href="/contacts.html">Контакты</a>`;
  document.body.append(scrim, panel);

  const openPanel = v => { panel.classList.toggle('open', v); scrim.classList.toggle('open', v); };
  hd.querySelector('#hdBurger').onclick = () => openPanel(true);
  panel.querySelector('.close').onclick = () => openPanel(false);
  scrim.onclick = () => openPanel(false);

  /* Клавиатура: подменю открывается по Enter/Space, закрывается по Esc */
  hd.querySelectorAll('.hd-item').forEach(it => {
    const btn = it.querySelector('.hd-link');
    btn.onclick = e => {
      e.preventDefault();
      const open = it.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      hd.querySelectorAll('.hd-item').forEach(o => { if (o !== it) { o.classList.remove('open'); o.querySelector('.hd-link').setAttribute('aria-expanded', 'false'); } });
    };
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    hd.querySelectorAll('.hd-item.open').forEach(o => o.classList.remove('open'));
    openPanel(false);
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.hd-item')) hd.querySelectorAll('.hd-item.open').forEach(o => o.classList.remove('open'));
  });

  addEventListener('scroll', () => hd.classList.toggle('stuck', scrollY > 8), { passive: true });

  return { hd, bar };
}
