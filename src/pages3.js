/* ============================================================
   Волна 3: поиск, FAQ, карта сайта, истории гостей, дневники хозяйств, пресса.
   Один модуль с разводкой по body.dataset.page — страницы небольшие,
   отдельные бандлы на каждую не оправданы.
   ============================================================ */
import './wave3.css';
import {
  products, farmers, recipes, blogPosts, events, rows, batches, kitchens,
  farmJournal, storySeeds, faqs, pressFacts, pressAssets,
  CAT, byId, farmerById, articleMeta,
} from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const page = document.body.dataset.page;
const money = n => n.toLocaleString('ru-RU') + ' ₽';

/* ============ Поиск ============ */
function buildIndex() {
  const idx = [];
  products.forEach(p => idx.push({ kind: 'Товар', cat: p.cat, t: p.name, s: `${money(p.price)} / ${p.unit}`, url: `/product.html?id=${p.id}`, k: [p.name, CAT[p.cat].label, (farmerById(p.farmer) || {}).name].join(' ') }));
  farmers.forEach(f => idx.push({ kind: 'Хозяйство', cat: f.cat, t: f.name, s: f.spec, url: `/farmer.html?id=${f.id}`, k: [f.name, f.spec, f.tagline, f.story].join(' ') }));
  recipes.forEach(r => idx.push({ kind: 'Рецепт', cat: 'bread', t: r.title, s: `${r.cat} · ${r.time}`, url: `/recipe.html?slug=${r.slug}`, k: [r.title, r.desc, r.cat].join(' ') }));
  blogPosts.forEach(a => idx.push({ kind: 'Журнал', cat: 'veg', t: a.title, s: (articleMeta[a.slug] || {}).rubric || a.cat, url: `/article.html?slug=${a.slug}`, k: [a.title, a.excerpt, a.body.join(' ')].join(' ') }));
  events.forEach(e => idx.push({ kind: 'Событие', cat: 'meat', t: e.title, s: `${e.date} · ${e.time}`, url: `/event.html?id=${e.id}`, k: [e.title, e.desc, e.tag].join(' ') }));
  rows.forEach(r => idx.push({ kind: 'Ряд', cat: r.cat, t: r.title, s: r.lead, url: `/zone.html?id=${r.id}`, k: [r.title, r.lead, r.manifesto.join(' ')].join(' ') }));
  batches.forEach(b => { const p = byId(products, b.product); idx.push({ kind: 'Партия', cat: p ? p.cat : 'bread', t: `Партия ${b.code}`, s: p ? p.name : '', url: `/passport.html?code=${b.code}`, k: [b.code, p ? p.name : '', b.note].join(' ') }); });
  kitchens.forEach(k => idx.push({ kind: 'Кухня', cat: k.cat, t: k.name, s: k.hit, url: '/foodcourt.html', k: [k.name, k.desc, k.hit].join(' ') }));
  [['Сейчас на подворье', '/now.html', 'статус, кто стоит, что привезли'],
   ['Фермерские боксы', '/boxes.html', 'наборы и подписка'],
   ['Собрать свой ящик', '/builder.html', 'конструктор бокса'],
   ['Календарь сезонов', '/seasons.html', 'что созревает по месяцам'],
   ['Утро на рынке', '/morning.html', 'репортаж 5:40 — 12:00'],
   ['Прогулка в 3D', '/walk.html', 'шесть глав по рядам'],
   ['Подворье-клуб', '/loyalty.html', 'карточка со штампами'],
   ['Стать арендатором', '/join.html', 'аренда места, калькулятор'],
   ['Фудкорт', '/foodcourt.html', 'где поесть'],
   ['Доставка и оплата', '/delivery.html', 'условия'],
   ['Вопросы и ответы', '/faq.html', 'FAQ'],
  ].forEach(([t, url, s]) => idx.push({ kind: 'Страница', cat: 'bread', t, s, url, k: t + ' ' + s }));
  return idx;
}

const norm = s => (s || '').toLowerCase().replace(/ё/g, 'е');
function score(item, q) {
  const t = norm(item.t), k = norm(item.k);
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(q)) return 60;
  if (k.includes(q)) return 30;
  // очень простое нечёткое совпадение: пропуск одной буквы
  if (q.length > 4) {
    for (let i = 0; i < q.length; i++) {
      const v = q.slice(0, i) + q.slice(i + 1);
      if (k.includes(v)) return 12;
    }
  }
  return 0;
}

function initSearch() {
  const idx = buildIndex();
  const input = $('#srchInput');
  const q0 = new URLSearchParams(location.search).get('q') || '';
  input.value = q0;

  function run() {
    const q = norm(input.value.trim());
    const out = $('#srchOut');
    if (q.length < 2) {
      out.innerHTML = `<div class="srch-empty">
        <p class="lead" style="color:var(--muted);margin:0 0 16px">Что обычно ищут</p>
        <div class="chips" style="justify-content:center">
          ${['клубника', 'копчёный судак', 'хлеб на закваске', 'сыр', 'мёд', 'аренда места']
            .map(s => `<a class="chip" href="/search.html?q=${encodeURIComponent(s)}">${s}</a>`).join('')}
        </div></div>`;
      $('#srchCount').textContent = '';
      return;
    }
    const found = idx.map(i => ({ i, sc: score(i, q) })).filter(x => x.sc > 0)
      .sort((a, b) => b.sc - a.sc).map(x => x.i);

    // один результат — сразу ведём на него (правило §4.7 структуры)
    if (found.length === 1 && norm(found[0].t).startsWith(q)) {
      location.href = found[0].url; return;
    }

    $('#srchCount').textContent = found.length
      ? `${found.length} ${plural(found.length, ['результат', 'результата', 'результатов'])}`
      : '';

    if (!found.length) {
      out.innerHTML = `<div class="srch-empty">
        <h3 style="text-transform:none;font-size:20px">Ничего не нашлось по «${input.value.trim()}»</h3>
        <p style="color:var(--muted);margin:10px 0 18px">Попробуйте короче или другое слово — например, «рыба» вместо «судак горячего копчения».</p>
        <div class="chips" style="justify-content:center">
          ${['молоко', 'рыба', 'овощи', 'рецепты'].map(s => `<a class="chip" href="/search.html?q=${s}">${s}</a>`).join('')}
        </div></div>`;
      return;
    }
    const groups = {};
    found.forEach(f => (groups[f.kind] ||= []).push(f));
    out.innerHTML = Object.entries(groups).map(([kind, items]) => `
      <section class="srch-group">
        <h3>${kind} · ${items.length}</h3>
        <div class="srch-list">
          ${items.map(i => `<a class="srch-item cat-${i.cat}" href="${i.url}">
            <span class="t">${i.t}</span><span class="s">${i.s || ''}</span>
            <span class="kind">${i.kind}</span></a>`).join('')}
        </div>
      </section>`).join('');
  }

  input.addEventListener('input', run);
  $('#srchForm').addEventListener('submit', e => { e.preventDefault(); run(); });
  run();
  input.focus();
}
const plural = (n, f) => f[(n % 10 === 1 && n % 100 !== 11) ? 0 : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? 1 : 2];

/* ============ FAQ ============ */
function initFaq() {
  const render = (filter = '') => {
    const q = norm(filter);
    const html = faqs.map(g => {
      const items = g.items.filter(i => !q || norm(i.q).includes(q) || norm(i.a).includes(q));
      if (!items.length) return '';
      return `<div class="faq-group"><h3>${g.group}</h3>
        ${items.map(i => `<div class="faq-item">
          <button class="faq-q" aria-expanded="false">${i.q}</button>
          <div class="faq-a"><p>${i.a}</p></div></div>`).join('')}</div>`;
    }).join('');
    $('#faqOut').innerHTML = html || `<div class="srch-empty">
      <p>По запросу ничего не нашлось. <a href="/contacts.html" style="color:var(--brown);font-weight:700">Спросите нас напрямую</a> — ответим и добавим вопрос сюда.</p></div>`;
    $('#faqOut').querySelectorAll('.faq-q').forEach(b => b.onclick = () => {
      const open = b.parentElement.classList.toggle('open');
      b.setAttribute('aria-expanded', String(open));
    });
  };
  render();
  $('#faqSearch').addEventListener('input', e => render(e.target.value));
}

/* ============ Карта сайта как схема рынка ============ */
function initSitemap() {
  const MAP = [
    { row: 'Сейчас', cat: 'bread', items: [['Сегодня на подворье', '/now.html'], ['События', '/events.html'], ['Фудкорт', '/foodcourt.html'], ['Календарь сезонов', '/seasons.html']] },
    { row: 'Купить', cat: 'veg', items: [['Каталог', '/catalog.html'], ['Боксы', '/boxes.html'], ['Собрать ящик', '/builder.html'], ['Рецепты', '/recipes.html'], ['Корзина', '/cart.html'], ['Доставка', '/delivery.html']] },
    { row: 'Рынок', cat: 'dairy', items: [['Прогулка в 3D', '/walk.html'], ['План зала', '/map.html'], ['Молочный ряд', '/zone.html?id=dairy'], ['Мясная лавка', '/zone.html?id=meat'], ['Овощи и ягода', '/zone.html?id=veg'], ['Балтийский улов', '/zone.html?id=sea'], ['Хлеб и мёд', '/zone.html?id=bread'], ['О рынке', '/about.html'], ['Гостям', '/guests.html']] },
    { row: 'Люди', cat: 'meat', items: [['Хозяйства', '/farmers.html'], ['Дневники хозяйств', '/journal-farm.html'], ['Паспорт партии', '/passport.html'], ['Истории гостей', '/stories.html']] },
    { row: 'Журнал', cat: 'sea', items: [['Подворье. Журнал', '/journal.html'], ['Утро на рынке', '/morning.html'], ['Блог (архив)', '/blog.html']] },
    { row: 'Своим', cat: 'bread', items: [['Стать арендатором', '/join.html'], ['Партнёрам', '/partners.html'], ['Подворье-клуб', '/loyalty.html'], ['Пресса', '/press.html'], ['Контакты', '/contacts.html'], ['Вопросы', '/faq.html'], ['Поиск', '/search.html']] },
  ];
  $('#smapOut').innerHTML = MAP.map(g => `
    <div class="smap-row cat-${g.cat}">
      <h3>${g.row}</h3>
      <ul>${g.items.map(([t, u]) => `<li><a href="${u}">${t}</a></li>`).join('')}</ul>
    </div>`).join('');
  $('#smapCount').textContent = MAP.reduce((a, g) => a + g.items.length, 0);
}

/* ============ Истории гостей ============ */
function initStories() {
  const KEY = 'hp_stories';
  const mine = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };

  const render = () => {
    const all = [...mine().map(m => ({ ...m, pending: true })), ...storySeeds];
    $('#notes').innerHTML = all.map(n => `
      <div class="note-card ${n.pending ? 'mine' : ''}" style="transform:rotate(${n.tilt || 0}deg)">
        <p>«${n.text}»</p>
        <b>${n.who}</b>
        ${n.pending ? '<p class="note-pending">На модерации — появится в течение дня</p>' : ''}
      </div>`).join('');
    $('#storiesCount').textContent = all.length;
  };

  $('#storyForm').addEventListener('submit', e => {
    e.preventDefault();
    const who = $('#storyWho').value.trim() || 'Гость';
    const text = $('#storyText').value.trim();
    if (text.length < 12) { $('#storyNote').textContent = 'Напишите чуть подробнее — хотя бы пару фраз.'; return; }
    const list = mine();
    list.unshift({ who, text, tilt: (Math.round((list.length * 7) % 5) - 2) });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 5)));
    $('#storyText').value = ''; $('#storyNote').textContent = 'Записка приколота — спасибо. После модерации её увидят все.';
    render();
  });
  render();
}

/* ============ Дневники хозяйств ============ */
function initDiary() {
  const sel = $('#diaryFilter');
  const render = (id = '') => {
    const list = id ? farmJournal.filter(d => d.farmer === id) : farmJournal;
    if (!list.length) { $('#diary').innerHTML = '<p style="color:var(--muted)">У этого хозяйства пока нет записей.</p>'; return; }
    $('#diary').innerHTML = list.map(d => {
      const f = farmerById(d.farmer);
      return `<article class="diary-item cat-${f ? f.cat : 'bread'}">
        <div class="who"><span class="av">${d.emoji}</span>
          <span><b>${f ? f.name : 'Хозяйство'}</b><br><span>${d.date}</span></span></div>
        <p>${d.text}</p>
      </article>`;
    }).join('');
  };
  sel.innerHTML = '<option value="">Все хозяйства</option>' +
    farmers.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
  sel.onchange = () => render(sel.value);
  render();
}

/* ============ Пресса ============ */
function initPress() {
  $('#prFacts').innerHTML = pressFacts.map(f => `<div><b>${f.n}</b><span>${f.l}</span></div>`).join('');
  $('#prAssets').innerHTML = pressAssets.map(a => `
    <div class="asset"><b>${a.name}</b><span class="fmt">${a.format} · ${a.note}</span></div>`).join('');
}

/* ============ Разводка ============ */
const R = { search: initSearch, faq: initFaq, sitemap: initSitemap, stories: initStories, 'journal-farm': initDiary, press: initPress };
if (R[page]) R[page]();
