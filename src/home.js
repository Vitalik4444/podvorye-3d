/* ============================================================
   Главная страница без 3D. three.js вынесен в отдельный чанк scene.js
   и загружается динамически: до этого начальный вес главной был 1 051 КБ
   против бюджета 600 КБ (аудит §2.3).
   ============================================================ */
import './tokens.css';
import './style.css';
import './pages.css';
import './v3.css';            /* слой v3 — и на главной тоже */
import logoSvg from './logo.svg?raw';
import { buildHeaderV4 } from './hdr.js';
import { farmers, zones, events, guestExperiences, values, CAT, products, recipes, testimonials, farmerById, byId } from './data.js';

/* Шапка v4 — та же, что на остальных страницах, но прозрачная над 3D-геро */
const { hd: hdV4 } = buildHeaderV4();
hdV4.classList.add('hero-mode');

/* ============ 0. Inject official brand logo into [data-logo] ============ */
document.querySelectorAll('[data-logo]').forEach(el=>{
  el.innerHTML = logoSvg;
  const s = el.querySelector('svg');
  if(s){ s.classList.add('logo'); s.removeAttribute('width'); s.removeAttribute('height'); s.removeAttribute('id'); }
});

/* ============ 1. Render content grids ============ */
const icons = {
  basket:'M4 9h16l-1.5 10.5a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 9Zm4 0 2-5m6 5-2-5M2 9h20',
  people:'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7 0a3 3 0 1 0 0-6M3 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1m2-6a5 5 0 0 1 4 5v1',
  cup:'M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Zm13 1h2a2 2 0 0 1 0 4h-2M6 3v2m4-2v2',
  calendar:'M4 6h16v14H4V6Zm0 4h16M8 3v4m8-4v4',
};
const svgIcon = (d, s=24) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${d.split('M').filter(Boolean).map(p=>`<path d="M${p}"/>`).join('')}</svg>`;

document.getElementById('valuesGrid').innerHTML = values.map(v=>`
  <div class="value reveal"><h3>${v.h}</h3><p>${v.t}</p></div>`).join('');

document.getElementById('farmersGrid').innerHTML = farmers.map(f=>{
  const c = CAT[f.cat];
  return `
  <article class="fcard reveal" data-farmer="${f.id}" style="--cat:${c.color};--cat-tint:${c.tint}">
    <div class="ph">
      <span class="ph-tag">${c.label}</span><b>${f.initials}</b>
    </div>
    <div class="fc-b">
      <h3>${f.name}</h3>
      <div class="fc-spec">${f.spec}</div>
      <p>${f.story}</p>
      <span class="more">Открыть на карте рынка →</span>
    </div>
  </article>`; }).join('');

document.getElementById('guestsGrid').innerHTML = guestExperiences.map(g=>`
  <div class="gtile reveal"><div class="gi">${svgIcon(icons[g.icon])}</div><h3>${g.title}</h3><p>${g.text}</p></div>`).join('');

document.getElementById('eventsGrid').innerHTML = events.map(e=>`
  <article class="ecard reveal">
    <div class="e-top"><span class="e-date">${e.date}</span><span class="e-tag">${e.tag}</span></div>
    <div class="e-b"><h3><a href="/event.html?id=${e.id}">${e.title}</a></h3><p>${e.desc}</p>
      <div style="font-size:13px;color:var(--muted);margin-top:8px">${e.day} · ${e.time}</div>
      <a href="/event.html?id=${e.id}" class="e-reg">${e.price>0?'Купить билет →':'Записаться →'}</a></div>
  </article>`).join('');

/* ---- home: каталог/рецепты/отзывы + корзина ---- */
const money = n => n.toLocaleString('ru-RU')+' ₽';
const catName = c => CAT[c]?.label||''; const catColor = c => CAT[c]?.color||'var(--brown)'; const catTint = c => CAT[c]?.tint||'var(--cream)';
function productCard(p){ const f=farmerById(p.farmer); const tag=p.hit?'Хит':p.fresh?'Свежее':'';
  return `<article class="pcard"><a href="/product.html?id=${p.id}" class="pc-img" style="background:${catTint(p.cat)}">${tag?`<span class="pc-tag">${tag}</span>`:''}${p.icon}</a>
    <div class="pc-b"><div class="pc-cat" style="color:${catColor(p.cat)}">${catName(p.cat)}</div>
    <h3><a href="/product.html?id=${p.id}">${p.name}</a></h3><div class="pc-farm">${f?f.name:''}</div>
    <div class="pc-row"><div class="pc-price">${p.price} ₽ <small>/ ${p.unit}</small></div><button class="pc-add" data-add="${p.id}">В корзину</button></div></div></article>`; }
function recipeCardH(r){ return `<article class="rcard"><a href="/recipe.html?slug=${r.slug}" class="rc-img">${r.emoji}</a>
  <div class="rc-b"><div class="rc-meta"><span>${r.cat}</span><span>⏱ ${r.time}</span></div>
  <h3><a href="/recipe.html?slug=${r.slug}">${r.title}</a></h3><p>${r.desc}</p>
  <a href="/recipe.html?slug=${r.slug}" class="more">Смотреть рецепт →</a></div></article>`; }
const getCart=()=>JSON.parse(localStorage.getItem('hp_cart')||'{}');
const setCart=c=>{localStorage.setItem('hp_cart',JSON.stringify(c));updateBadge();};
function updateBadge(){const n=Object.values(getCart()).reduce((a,b)=>a+b,0);const b=document.getElementById('cartBadge');if(b){b.textContent=n;b.style.display=n>0?'grid':'none';}}
function hAdd(id){const c=getCart();c[id]=(c[id]||0)+1;setCart(c);const p=byId(products,id);const t=document.getElementById('toast');document.getElementById('toastMsg').textContent=`«${p.name}» в корзине`;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600);}
function wireAddH(root){root&&root.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>hAdd(b.dataset.add));}
const g=id=>document.getElementById(id);
if(g('hitsGrid')){ g('hitsGrid').innerHTML=products.filter(p=>p.hit).map(productCard).join(''); wireAddH(g('hitsGrid')); }
if(g('recipesGrid')) g('recipesGrid').innerHTML=recipes.slice(0,3).map(recipeCardH).join('');
if(g('testiGrid')) g('testiGrid').innerHTML=testimonials.map(t=>`<div class="tcard reveal"><p>«${t.text}»</p><div class="twho"><div class="tav">${t.av}</div><div class="tn"><b>${t.who}</b><span>${t.role}</span></div></div></div>`).join('');
if(g('catNav')) g('catNav').innerHTML=Object.entries(CAT).map(([k,v])=>`<a href="/catalog.html?cat=${k}"><span class="sw" style="background:${v.color}"></span>${v.label}</a>`).join('');
updateBadge();

function shade(hex,p){const n=parseInt(hex.slice(1),16);let r=(n>>16)+p*2.55,g=((n>>8)&255)+p*2.55,b=(n&255)+p*2.55;
  const c=x=>Math.max(0,Math.min(255,Math.round(x)));return`rgb(${c(r)},${c(g)},${c(b)})`;}


/* ============ Ленивая загрузка 3D-сцены ============
   Сцена (three.js + модель) грузится, когда браузер свободен и геро в кадре.
   При экономии трафика — только по явному нажатию кнопки тура. */
(function loadScene(){
  const conn = navigator.connection || {};
  const thrifty = conn.saveData || /2g/.test(conn.effectiveType || '');
  const hero = document.getElementById('top');
  const pct = document.getElementById('lpct');
  let started = false;

  const start = () => {
    if (started) return; started = true;
    import('./scene.js').catch(err => {
      console.error('[scene] не загрузилась', err);
      if (pct) pct.textContent = 'Не удалось загрузить 3D — доступен план зала';
    });
  };

  if (thrifty) {
    if (pct) pct.textContent = 'Экономия трафика — 3D загрузится по нажатию';
    ['btnTour', 'ctaTour', 'btnInside'].forEach(id =>
      document.getElementById(id)?.addEventListener('click', start, { once: true }));
    return;
  }

  /* Сначала дожидаемся события load (иначе requestIdleCallback срабатывает
     до первого рендера и сцена снова оказывается в критическом пути),
     и только потом ловим простой браузера. */
  const afterLoad = cb => (document.readyState === 'complete')
    ? cb() : addEventListener('load', cb, { once: true });
  const whenIdle = cb => afterLoad(() => ('requestIdleCallback' in window)
    ? requestIdleCallback(cb, { timeout: 1200 }) : setTimeout(cb, 250));

  if (hero && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => {
      if (es.some(e => e.isIntersecting)) { io.disconnect(); whenIdle(start); }
    }, { rootMargin: '300px' });
    io.observe(hero);
    setTimeout(() => { io.disconnect(); whenIdle(start); }, 2000);
  } else whenIdle(start);
})();

/* ============ Service worker: оффлайн и кэш (P3 аудита) ============
   Регистрируем после load, чтобы не мешать первой отрисовке.
   На локальном file:// и в dev-режиме без https просто ничего не делаем. */
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* молча: оффлайн — улучшение, а не обязательное условие работы */
    });
  });
}
