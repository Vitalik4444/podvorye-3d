/* Страница хозяйств — переверстана по §5.2 дизайн-системы.
   Было: четыре равные карточки в ряд (та самая монотонность).
   Стало: разворот-заголовок → флагманская карточка 5/7 → разноразмерная сетка
   → полоса-цитата на всю ширину окна. Плюс фильтр по дням торговли строкой. */
import './editorial.css';
import { farmers, farmerExtra, products, CAT, testimonials } from './data.js';

const q = (s, r = document) => r.querySelector(s);

const DAYS = [['all', 'Все дни'], ['sat', 'Суббота'], ['sun', 'Воскресенье'], ['week', 'Будни']];
/* Дни торговли пока не заданы в данных — считаем, что все стоят ежедневно.
   Поле trading_days есть в контент-модели (§3.1), фильтр готов к нему. */
const tradingDays = f => f.trading_days || ['week', 'sat', 'sun'];

let day = 'all';

const extra = id => farmerExtra[id] || {};
const productsOf = id => products.filter(p => p.farmer === id);

function featureCard(f) {
  const e = extra(f.id);
  const facts = (e.facts || []).slice(0, 3);
  return `<article class="ed-feature cat-${f.cat}">
    <a class="ed-vis" href="/farmer.html?id=${f.id}" aria-label="${f.name}">
      <span class="ed-stamp">
        <span class="ed-since">на подворье с</span>
        <b>${e.founded || '—'}</b>
        <span class="ed-region">${e.region || CAT[f.cat].label}</span>
      </span>
    </a>
    <div class="ed-txt">
      <p class="ed-kicker">${CAT[f.cat].label} · с ${e.founded || '—'} года</p>
      <h2><a href="/farmer.html?id=${f.id}">${f.name}</a></h2>
      ${e.quote ? `<p class="ed-quote">«${e.quote}»</p><p class="ed-by">${e.quoteBy || ''}</p>`
                : `<p class="ed-quote">«${f.tagline}»</p><p class="ed-by">${f.spec}</p>`}
      <a class="btn btn-primary" href="/farmer.html?id=${f.id}">Открыть хозяйство</a>
      ${facts.length ? `<div class="ed-facts">${facts.map(x => `<div><b>${x.n}</b><span>${x.l}</span></div>`).join('')}</div>` : ''}
    </div>
  </article>`;
}

/* Разноразмерная сетка: чередуем ширины 3-3 / 2-2-2 / 4-2, чтобы два соседних
   блока никогда не имели одинаковой раскладки (правило §5.2). */
const WIDTHS = ['w3', 'w3', 'w2', 'w2', 'w2', 'w4', 'w2'];

function card(f, i) {
  const e = extra(f.id);
  const n = productsOf(f.id).length;
  return `<a class="ed-card ${WIDTHS[i % WIDTHS.length]} cat-${f.cat}" href="/farmer.html?id=${f.id}">
    <span class="ed-vis"><span class="tag">${CAT[f.cat].label}</span>
      <span class="ed-stamp small"><b>${e.founded || f.initials}</b><span class="ed-region">${e.region || ''}</span></span>
    </span>
    <span class="ed-b">
      <span class="ed-spec">${f.spec}</span>
      <h3>${f.name}</h3>
      <p>${f.story.length > 150 ? f.story.slice(0, 148).replace(/[\s,.]+$/, '') + '…' : f.story}</p>
      <span class="ed-more">${n ? `${n} ${plural(n, ['позиция', 'позиции', 'позиций'])} на прилавке` : 'Открыть хозяйство'}</span>
    </span>
  </a>`;
}
const plural = (n, f) => f[(n % 10 === 1 && n % 100 !== 11) ? 0 : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? 1 : 2];

function render() {
  const list = day === 'all' ? farmers : farmers.filter(f => tradingDays(f).includes(day));

  q('#edNum').textContent = list.length;
  q('#edCount').textContent = `${list.length} ${plural(list.length, ['хозяйство', 'хозяйства', 'хозяйств'])}`;

  if (!list.length) {
    q('#edFeature').innerHTML = '';
    q('#edGrid').innerHTML = `<p style="color:var(--muted)">В этот день никто не торгует. Ближайший день — суббота.</p>`;
    return;
  }
  q('#edFeature').innerHTML = featureCard(list[0]);
  q('#edGrid').innerHTML = list.slice(1).map(card).join('');
}

/* Фильтр по дням */
q('#edFilters').innerHTML = `<span class="lbl">Когда стоят</span>` +
  DAYS.map(([k, l]) => `<button class="ed-chip${k === day ? ' on' : ''}" data-day="${k}">${l}</button>`).join('') +
  `<span class="count" id="edCount"></span>`;
q('#edFilters').querySelectorAll('[data-day]').forEach(b => b.onclick = () => {
  day = b.dataset.day;
  q('#edFilters').querySelectorAll('[data-day]').forEach(x => x.classList.toggle('on', x === b));
  render();
});

/* Полоса-цитата: берём самую сильную цитату из профилей */
const withQuote = farmers.map(f => ({ f, e: extra(f.id) })).filter(x => x.e.quote);
if (withQuote.length) {
  const { f, e } = withQuote[0];
  q('#edBand').innerHTML = `<div class="ed-band-in">
    <blockquote>«${e.quote}»</blockquote>
    <p class="by"><b>${e.quoteBy || f.name}</b>${f.name}${e.region ? ' · ' + e.region : ''}</p>
  </div>`;
} else q('#edBand').remove();

render();
