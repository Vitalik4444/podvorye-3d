import './tokens.css';
import './style.css';
import './pages.css';
import './v3.css';            /* слой v3 — идёт последним, переопределяет базу */
import './editorial.css';     /* редакторские раскладки нужны всем страницам, не только новым */
import { initMotion } from './motion.js';
import { buildHeaderV4 } from './hdr.js';
import logoSvg from './logo.svg?raw';
import { farmers, products, events, blogPosts, values, guestExperiences, CAT, byId, bySlug, farmerById,
  recipes, farmerExtra, marketPlan, testimonials } from './data.js';

/* ============ helpers ============ */
const $ = (s, r=document) => r.querySelector(s);
const money = n => n.toLocaleString('ru-RU') + ' ₽';
const param = k => new URLSearchParams(location.search).get(k);
const catName = c => (CAT[c]?.label || '');
const catColor = c => (CAT[c]?.color || 'var(--brown)');
const catTint = c => (CAT[c]?.tint || 'var(--cream)');
const el = html => { const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstElementChild; };
function shade(hex,p){ if(!hex||hex[0]!=='#') return hex; const n=parseInt(hex.slice(1),16); const c=x=>Math.max(0,Math.min(255,Math.round(x)));
  return `rgb(${c((n>>16)+p*2.55)},${c(((n>>8)&255)+p*2.55)},${c((n&255)+p*2.55)})`; }
const ornSvg = ()=>`<svg width="88" height="18" viewBox="0 0 118 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"><path d="M59 3l9 9-9 9-9-9z"/><path d="M54.5 7.5l9 9M63.5 7.5l-9 9"/><path d="M50 12H39V5M39 12H29v7"/><path d="M68 12h11V5M79 12h10v7"/></svg>`;

/* ============ NAV ============ */
/* Порядок по §4.2 аналитики: «Сейчас» первым — для трёх из шести аудиторий
   первый вопрос «что там происходит», а не «что купить». */
const NAV = [
  ['Сейчас','/now.html'], ['Каталог','/catalog.html'], ['Боксы','/boxes.html'],
  ['Рецепты','/recipes.html'], ['Фермеры','/farmers.html'], ['События','/events.html'],
  ['Журнал','/journal.html'], ['Прогулка','/walk.html'], ['Контакты','/contacts.html'],
];
const page = document.body.dataset.page || '';

/* ============ Header ============ */
function buildHeader(){
  const navHtml = NAV.map(([t,h])=>{
    const active = (page && h.includes(page)) ? ' class="active"' : '';
    return `<a href="${h}"${active}>${t}</a>`;
  }).join('');
  const hdr = el(`<header class="sh">
    <a class="brand" href="/index.html" aria-label="Холмогорское подворье">${logoSvg}</a>
    <nav class="sh-nav" id="shNav">${navHtml}</nav>
    <div class="sh-tools">
      <button class="sh-ico" id="btnSearch" aria-label="Поиск">🔍</button>
      <a class="sh-ico" href="/cart.html" aria-label="Корзина">🛒<span class="badge" id="cartBadge"></span></a>
      <button class="sh-ico" id="btnAuth" aria-label="Войти">👤</button>
      <a class="btn btn-primary" href="/join.html">Стать арендатором</a>
      <button class="sh-burger" id="shBurger" aria-label="Меню"><span></span><span></span><span></span></button>
    </div>
  </header>`);
  hdr.querySelector('.brand svg')?.classList.add('logo');
  document.body.prepend(hdr);
  $('#shBurger').onclick = ()=> $('#shNav').classList.toggle('open');
  $('#shNav').addEventListener('click', e=>{ if(e.target.tagName==='A') $('#shNav').classList.remove('open'); });
  $('#btnSearch') && ($('#btnSearch').onclick = openSearch);
  $('#btnAuth') && ($('#btnAuth').onclick = ()=> openModal('mAuth'));
}

/* ============ Footer ============ */
function buildFooter(){
  const f = el(`<footer class="foot">
    <div class="wrap">
      <div class="top">
        <div>
          <a href="/index.html" class="brand" style="color:#fff">${logoSvg}</a>
          <p style="margin-top:18px;max-width:34ch;color:#a99f92">Настоящие фермерские продукты из Калининградской области. Сделано с любовью — проверено временем.</p>
        </div>
        <div><p class="foot-ttl">Подворье</p>
          <a href="/about.html">О рынке</a><a href="/farmers.html">Фермеры</a><a href="/walk.html">Прогулка в 3D</a><a href="/seasons.html">Сезоны</a><a href="/foodcourt.html">Фудкорт</a><a href="/zone.html?id=dairy">Ряды рынка</a><a href="/guests.html">Гостям</a><a href="/map.html">Карта рынка</a></div>
        <div><p class="foot-ttl">Покупателям</p>
          <a href="/catalog.html">Каталог</a><a href="/boxes.html">Боксы</a><a href="/builder.html">Свой ящик</a><a href="/recipes.html">Рецепты</a><a href="/delivery.html">Доставка и оплата</a><a href="/cart.html">Корзина</a><a href="/events.html">События</a><a href="/journal.html">Журнал</a><a href="/journal-farm.html">Дневники хозяйств</a><a href="/stories.html">Истории гостей</a></div>
        <div><p class="foot-ttl">Контакты</p>
          <a href="/join.html">Стать арендатором</a><a href="/loyalty.html">Подворье-клуб</a><a href="/contacts.html">Как нас найти</a>
          <a href="tel:+74012000000">+7 (4012) 00-00-00</a><a href="mailto:info@holmogorskoe-podvorye.ru">info@holmogorskoe-podvorye.ru</a></div>
      </div>
      <div class="bottom">
        <span>© 2026 «Холмогорское подворье». Прототип сайта.</span>
        <span style="display:flex;gap:16px;flex-wrap:wrap">
          <a href="/faq.html">Вопросы</a><a href="/press.html">Пресса</a><a href="/sitemap.html">Карта сайта</a><a href="/privacy.html">Конфиденциальность</a><a href="/terms.html">Оферта</a></span>
      </div>
    </div>
  </footer>`);
  f.querySelectorAll('.brand svg').forEach(s=>{ s.classList.add('logo'); });
  document.body.append(f);
}

/* ============ Modals / cookie / toast ============ */
function buildOverlays(){
  document.body.append(el(`<div class="modal-back" id="modalBack"></div>`));
  // search
  document.body.append(el(`<div class="modal" id="mSearch">
    <button class="m-close" data-close>✕</button>
    <input id="searchInput" placeholder="Поиск по товарам, фермерам, статьям…" autocomplete="off"/>
    <div class="s-res" id="searchRes"></div>
  </div>`));
  // auth
  document.body.append(el(`<div class="modal" id="mAuth">
    <button class="m-close" data-close>✕</button>
    <div class="tab-row"><button class="on" data-tab="login">Вход</button><button data-tab="reg">Регистрация</button></div>
    <h2 id="authTitle">С возвращением</h2><p class="sub" id="authSub">Войдите, чтобы отслеживать заказы и избранное.</p>
    <form data-form="Авторизация">
      <div class="field authReg" style="display:none"><label>Имя</label><input placeholder="Как вас зовут"/></div>
      <div class="field"><label>Телефон или e-mail</label><input required placeholder="Логин"/></div>
      <div class="field"><label>Пароль</label><input required type="password" placeholder="••••••"/></div>
      <button class="btn btn-primary" type="submit" style="width:100%;justify-content:center" id="authBtn">Войти</button>
      <p class="note">Это прототип — авторизация демонстрационная.</p>
    </form>
  </div>`));
  // cookie
  if(!localStorage.getItem('hp_cookie')){
    const c = el(`<div id="cookie"><p>Мы используем cookie, чтобы сайт работал удобнее. Оставаясь, вы соглашаетесь с <a href="/privacy.html">политикой</a>.</p><button class="btn btn-primary" id="cookieOk">Хорошо</button></div>`);
    document.body.append(c);
    setTimeout(()=>c.classList.add('show'),900);
    $('#cookieOk').onclick=()=>{ localStorage.setItem('hp_cookie','1'); c.classList.remove('show'); };
  }
  // toast
  document.body.append(el(`<div id="toast">✓ <span id="toastMsg">Готово</span></div>`));

  // wiring
  const hs=$('#hdSearch'); if(hs) hs.onclick=openSearch;
  const hu=$('#hdUser'); if(hu) hu.onclick=()=>openModal('mAuth');
  document.querySelectorAll('[data-close]').forEach(b=> b.onclick=closeModals);
  $('#modalBack').onclick=closeModals;
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeModals(); });
  // auth tabs
  $('#mAuth').querySelectorAll('[data-tab]').forEach(t=> t.onclick=()=>{
    $('#mAuth').querySelectorAll('[data-tab]').forEach(x=>x.classList.remove('on')); t.classList.add('on');
    const reg = t.dataset.tab==='reg';
    $('#authTitle').textContent = reg?'Создать аккаунт':'С возвращением';
    $('#authSub').textContent = reg?'Быстрая регистрация по телефону.':'Войдите, чтобы отслеживать заказы и избранное.';
    $('#authBtn').textContent = reg?'Зарегистрироваться':'Войти';
    $('#mAuth').querySelector('.authReg').style.display = reg?'block':'none';
  });
  // search
  $('#searchInput').addEventListener('input', runSearch);
}
function openModal(id){ $('#modalBack').classList.add('show'); $('#'+id).classList.add('show'); }
function closeModals(){ document.querySelectorAll('.modal,.modal-back').forEach(m=>m.classList.remove('show')); }
function openSearch(){ openModal('mSearch'); setTimeout(()=>$('#searchInput').focus(),50); }
function runSearch(e){
  const q=e.target.value.trim().toLowerCase(); const box=$('#searchRes');
  if(!q){ box.innerHTML=''; return; }
  const res=[];
  products.filter(p=>p.name.toLowerCase().includes(q)).slice(0,5).forEach(p=>res.push([`/product.html?id=${p.id}`,p.icon,p.name,'Товар · '+money(p.price)]));
  farmers.filter(f=>f.name.toLowerCase().includes(q)).forEach(f=>res.push([`/farmer.html?id=${f.id}`,f.initials,f.name,'Фермер · '+f.spec]));
  blogPosts.filter(b=>b.title.toLowerCase().includes(q)).forEach(b=>res.push([`/article.html?slug=${b.slug}`,'📝',b.title,'Статья · '+b.cat]));
  box.innerHTML = res.length ? res.map(([h,ic,t,s])=>`<a href="${h}"><span class="sr-ic">${ic}</span><span><span class="sr-t">${t}</span><br><span class="sr-s">${s}</span></span></a>`).join('')
    : `<div style="padding:14px;color:var(--muted)">Ничего не найдено по «${e.target.value}»</div>`;
}

function toast(msg){ const t=$('#toast'); $('#toastMsg').textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),3000); }

/* ============ Cart (localStorage) ============ */
const CART_KEY='hp_cart';
const getCart = ()=> JSON.parse(localStorage.getItem(CART_KEY)||'{}');
const setCart = c=>{ localStorage.setItem(CART_KEY, JSON.stringify(c)); updateBadge(); };
function addToCart(id, q=1){ const c=getCart(); c[id]=(c[id]||0)+q; setCart(c); const p=byId(products,id); toast(`«${p.name}» в корзине`); }
function updateBadge(){ const n=Object.values(getCart()).reduce((a,b)=>a+b,0); const b=$('#cartBadge'); if(b){ b.textContent=n; b.classList.toggle('on', n>0); } }
function cartItems(){ return Object.entries(getCart()).map(([id,q])=>({p:byId(products,id),q})).filter(x=>x.p); }
function cartTotal(){ return cartItems().reduce((s,{p,q})=>s+p.price*q,0); }
window.hpAddToCart = addToCart;   // for inline onclick if needed

/* ============ Reveal ============ */
function reveal(){ const io=new IntersectionObserver(es=>es.forEach(x=>{ if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);} }),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(n=>io.observe(n)); }

/* ============ Forms → toast ============ */
function wireForms(){
  document.querySelectorAll('form[data-form]').forEach(f=> f.addEventListener('submit', e=>{
    e.preventDefault();
    const kind=f.dataset.form;
    if(kind==='Авторизация'){ closeModals(); toast('Готово! Вы вошли (демо).'); return; }
    if(kind==='Оформление заказа'){ setCart({}); location.href='/order-success.html'; return; }
    f.reset();
    toast(kind==='Заявка арендатора' ? 'Заявка принята — свяжемся с вами' :
          kind==='Запись на событие' ? 'Вы записаны! Ждём вас' : 'Сообщение отправлено. Спасибо!');
  }));
}

/* ============ Product card ============ */
function productCard(p){
  const f=farmerById(p.farmer);
  const tag = p.hit?'Хит': p.fresh?'Свежее':'';
  return `<article class="pcard">
    <a href="/product.html?id=${p.id}" class="pc-img" style="background:${catTint(p.cat)}">${tag?`<span class="pc-tag">${tag}</span>`:''}${p.icon}</a>
    <div class="pc-b">
      <div class="pc-cat" style="color:${catColor(p.cat)}">${catName(p.cat)}</div>
      <h3><a href="/product.html?id=${p.id}">${p.name}</a></h3>
      <div class="pc-farm">${f?f.name:''}</div>
      <div class="pc-row">
        <div class="pc-price">${p.price} ₽ <small>/ ${p.unit}</small></div>
        <button class="pc-add" data-add="${p.id}">В корзину</button>
      </div>
    </div>
  </article>`;
}
function wireAdd(root=document){ root.querySelectorAll('[data-add]').forEach(b=> b.onclick=()=>addToCart(b.dataset.add)); }

function recipeCard(r){
  return `<article class="rcard"><a href="/recipe.html?slug=${r.slug}" class="rc-img">${r.emoji}</a>
    <div class="rc-b"><div class="rc-meta"><span>${r.cat}</span><span>⏱ ${r.time}</span></div>
    <h3><a href="/recipe.html?slug=${r.slug}">${r.title}</a></h3><p>${r.desc}</p>
    <a href="/recipe.html?slug=${r.slug}" class="more">Смотреть рецепт →</a></div></article>`;
}
function addAllToCart(ids){ const c=getCart(); ids.forEach(id=>{ if(byId(products,id)) c[id]=(c[id]||0)+1; }); setCart(c); toast('Продукты для рецепта — в корзине'); }

/* ============ Page renderers ============ */
const R = {
  catalog(){
    const grid=$('#pgrid'), count=$('#pcount');
    const state={cat:new Set(), farmer:new Set()};
    // build filters
    const fc=$('#fCats'), ff=$('#fFarms');
    fc.innerHTML=Object.entries(CAT).map(([k,v])=>`<label><input type="checkbox" data-cat="${k}"><span class="swatch" style="background:${v.color}"></span>${v.label}</label>`).join('');
    ff.innerHTML=farmers.map(f=>`<label><input type="checkbox" data-farm="${f.id}">${f.name}</label>`).join('');
    function render(){
      let list=products.slice();
      if(state.cat.size) list=list.filter(p=>state.cat.has(p.cat));
      if(state.farmer.size) list=list.filter(p=>state.farmer.has(p.farmer));
      const sort=$('#sortSel').value;
      if(sort==='cheap') list.sort((a,b)=>a.price-b.price);
      if(sort==='exp') list.sort((a,b)=>b.price-a.price);
      count.textContent=`Найдено товаров: ${list.length}`;
      grid.innerHTML=list.map(productCard).join('')||'<div class="empty">Ничего не найдено. Сбросьте фильтры.</div>';
      wireAdd(grid);
    }
    fc.querySelectorAll('[data-cat]').forEach(c=>c.onchange=()=>{ c.checked?state.cat.add(c.dataset.cat):state.cat.delete(c.dataset.cat); render(); });
    ff.querySelectorAll('[data-farm]').forEach(c=>c.onchange=()=>{ c.checked?state.farmer.add(c.dataset.farm):state.farmer.delete(c.dataset.farm); render(); });
    $('#sortSel').onchange=render;
    // preselect from ?cat
    const pc=param('cat'); if(pc && CAT[pc]){ const cb=fc.querySelector(`[data-cat="${pc}"]`); if(cb){cb.checked=true; state.cat.add(pc);} }
    render();
  },
  product(){
    const p=byId(products, param('id'))||products[0]; const f=farmerById(p.farmer);
    document.title=p.name+' — Холмогорское подворье';
    const tag = p.hit?'Хит продаж':p.fresh?'Свежее сегодня':'';
    $('#prodWrap').innerHTML=`
      <article class="ed-object cat-${p.cat}">
        <div class="obj-vis">${tag?`<span class="tag">${tag}</span>`:''}${p.icon}</div>
        <div class="obj-panel">
          <p class="obj-kicker">${catName(p.cat)}</p>
          <h1>${p.name}</h1>
          <p class="obj-farm">${f?`${f.name} · ${f.spec}`:''}</p>
          <div class="obj-price">${p.price} ₽ <small>/ ${p.unit}</small></div>
          <div class="chips">${p.tags.map(t=>`<span class="chip">${t}</span>`).join('')}<span class="chip">Проверено временем</span></div>
          <div class="obj-actions">
            <span class="qty"><button id="qm" aria-label="Меньше">−</button><span id="qv">1</span><button id="qp" aria-label="Больше">+</button></span>
            <button class="btn btn-primary" id="pAdd">В корзину</button>
            <a class="btn btn-ghost" href="/farmer.html?id=${p.farmer}">О хозяйстве</a>
          </div>
          <p class="obj-note">${f?f.story:''}</p>
        </div>
      </article>
      <h2 class="vh">Что известно об этом продукте</h2>
      <div class="ed-proof" style="margin-top:34px">
        <div><h3>Кто сделал</h3><b>${f?f.name.replace('Хозяйство ','').replace('Коптильня ','') : '—'}</b>
          <p><a href="/farmer.html?id=${p.farmer}" style="color:var(--brown);font-weight:700">Профиль хозяйства →</a></p></div>
        <div><h3>Когда привезли</h3><b>${p.fresh?'сегодня':'эта неделя'}</b>
          <p><a href="/passport.html" style="color:var(--brown);font-weight:700">Паспорт партии →</a></p></div>
        <div><h3>Как продаётся</h3><b>при вас</b><p>Взвешиваем и упаковываем на месте — цена указана за ${p.unit}, без предварительной фасовки.</p></div>
      </div>`;
    $('#pcrumb').textContent=p.name;
    let q=1; const qv=$('#qv');
    $('#qm').onclick=()=>{q=Math.max(1,q-1);qv.textContent=q;};
    $('#qp').onclick=()=>{q++;qv.textContent=q;};
    $('#pAdd').onclick=()=>addToCart(p.id,q);
    // related
    const rel=products.filter(x=>x.cat===p.cat && x.id!==p.id).slice(0,4);
    if($('#related')){ $('#related').innerHTML=rel.map(productCard).join(''); wireAdd($('#related')); }
  },
  /* farmers: страница переверстана редакторски и рисуется модулем src/farmers.js */
  farmer(){
    const f=farmerById(param('id'))||farmers[0]; const x=farmerExtra[f.id]||{};
    document.title=f.name+' — Холмогорское подворье';
    $('#fcrumb').textContent=f.name;
    const prods=products.filter(p=>p.farmer===f.id);
    const recs=recipes.filter(r=>r.products.some(id=>prods.some(p=>p.id===id))).slice(0,3);

    $('#farmerPage').innerHTML=`
      <div class="cat-${f.cat}">

        <!-- Разворот: имя крупной формой, факт-штамп с годом -->
        <div class="ed-feature" style="margin-bottom:0">
          <div class="ed-vis">
            <span class="ed-stamp">
              <span class="ed-since">на подворье с</span>
              <b>${x.founded||'—'}</b>
              <span class="ed-region">${x.region||catName(f.cat)}</span>
            </span>
          </div>
          <div class="ed-txt">
            <p class="ed-kicker">${catName(f.cat)}</p>
            <h1 style="font-size:clamp(30px,4vw,54px);text-transform:uppercase;letter-spacing:-.025em;line-height:.98;margin:14px 0 16px">${f.name}</h1>
            <p class="ed-quote">«${x.quote||f.tagline}»</p>
            <p class="ed-by">${x.quoteBy||f.spec}</p>
            <div style="display:flex;gap:12px;flex-wrap:wrap">
              <a class="btn btn-primary" href="#products">Товары хозяйства</a>
              <a class="btn btn-ghost" href="/map.html">Найти на плане</a>
            </div>
          </div>
        </div>

        ${x.facts?`<div class="ed-numbers">${x.facts.map(s2=>`<div><b>${s2.n}</b><span>${s2.l}</span></div>`).join('')}</div>`:''}

        <!-- История: журнальная колонка с заметкой на полях -->
        <div class="ed-journal" style="margin:12px 0 44px">
          <p class="full eyebrow">История хозяйства</p>
          <h2 class="full sect-t" style="margin:8px 0 22px">Как здесь работают</h2>
          ${(x.long||[f.story]).map((t,i)=>i===1?`<p class="aside-note">${t}</p>`:`<p>${t}</p>`).join('')}
          ${x.gallery?`<div class="full" style="display:grid;grid-template-columns:repeat(6,1fr);gap:14px;margin-top:26px">
            ${x.gallery.map(g=>`<div style="aspect-ratio:1;border-radius:var(--r-m);background:var(--cat-tint);display:grid;place-items:center;font-size:40px">${g}</div>`).join('')}</div>`:''}
        </div>

        ${x.process?`<div class="ed-band">
          <div class="ed-band-in" style="grid-template-columns:1fr;align-items:start">
            <div>
              <p style="font:800 11.5px/1 var(--font);letter-spacing:.16em;text-transform:uppercase;color:var(--brown);margin:0 0 22px">От поля до прилавка</p>
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:30px">
                ${x.process.map((st,i)=>`<div>
                  <b style="display:block;font:900 34px/1 var(--font);color:var(--brown);margin-bottom:10px">0${i+1}</b>
                  <b style="display:block;font-size:17px;margin-bottom:6px">${st.t}</b>
                  <span style="color:rgba(244,239,230,.66);font-size:14.5px;line-height:1.5">${st.d}</span>
                </div>`).join('')}
              </div>
            </div>
          </div>
        </div>`:''}

        ${recs.length?`<div style="margin:44px 0 0" id="fRecs">
          <p class="eyebrow">Что приготовить</p>
          <h2 class="sect-t" style="margin:8px 0 22px">Рецепты из этих продуктов</h2>
          <div class="ed-grid">${recs.map((r,i)=>`
            <a class="ed-card ${['w2','w2','w2'][i%3]}" href="/recipe.html?slug=${r.slug}">
              <span class="ed-vis"><b style="font-size:clamp(44px,4.6vw,66px)">${r.emoji}</b></span>
              <span class="ed-b"><span class="ed-spec">${r.time}</span><h3>${r.title}</h3>
                <span class="ed-more">Открыть рецепт</span></span></a>`).join('')}</div>
        </div>`:''}

      </div>`;

    const grid=$('#farmerProds');
    if(grid){ grid.innerHTML=prods.map(productCard).join(''); wireAdd(grid); }
    const anchor=document.getElementById('products');
    if(!anchor && grid) grid.closest('section')?.setAttribute('id','products');
  },
  recipes(){ $('#recGrid').innerHTML=recipes.map((r,i)=>`
    <a class="ed-card ${['w3','w3','w2','w2','w2','w4'][i%6]} cat-${['bread','veg','sea','meat','dairy','bread'][i%6]}" href="/recipe.html?slug=${r.slug}">
      <span class="ed-vis"><span class="tag">${r.cat}</span><b style="font-size:clamp(52px,5.6vw,84px)">${r.emoji}</b></span>
      <span class="ed-b">
        <span class="ed-spec">${r.time} · ${r.serves}</span>
        <h3>${r.title}</h3>
        <p>${r.desc}</p>
        <span class="ed-more">${r.products.length} ${r.products.length===1?'ингредиент':'ингредиента'} — сразу в корзину</span>
      </span>
    </a>`).join(''); },
  recipe(){
    const r=bySlug(recipes, param('slug'))||recipes[0]; document.title=r.title+' — Рецепты';
    $('#rcrumb').textContent=r.title;
    const prods=r.products.map(id=>byId(products,id)).filter(Boolean);
    const sum=prods.reduce((s,p)=>s+p.price,0);
    $('#recipeWrap').innerHTML=`
      <div class="ed-head-in" style="align-items:end;padding-bottom:10px">
        <div>
          <p class="eyebrow">${r.cat} · ${r.time} · ${r.serves}</p>
          <h1 style="font-size:clamp(32px,4.6vw,64px);font-weight:900;text-transform:uppercase;letter-spacing:-.03em;line-height:.94;margin:12px 0 0">${r.title}</h1>
          <p class="lead" style="margin-top:16px;max-width:46ch">${r.desc}</p>
        </div>
        <div class="ed-head-num"><b style="font-size:clamp(72px,8vw,120px)">${r.emoji}</b></div>
      </div>
      <div class="split" style="margin-top:48px;align-items:start">
        <div><h2 class="sect-t" style="font-size:24px;margin-bottom:20px">Приготовление</h2>
          <ol class="rsteps">${r.steps.map(s=>`<li>${s}</li>`).join('')}</ol></div>
        <div><h2 class="sect-t" style="font-size:24px;margin-bottom:18px">Что понадобится</h2>
          <div class="addall" style="margin-bottom:16px"><b>Продукты для рецепта · <span class="aa-sum">${sum} ₽</span></b>
            <button class="btn btn-primary" id="addAll">Всё в корзину</button></div>
          <div class="pgrid" style="grid-template-columns:1fr;gap:12px" id="recipeProds"></div></div>
      </div>`;
    $('#recipeProds').innerHTML=prods.map(productCard).join(''); wireAdd($('#recipeProds'));
    $('#addAll').onclick=()=>addAllToCart(r.products);
  },
  map(){
    const [W,H]=marketPlan.view;
    const stallHtml = marketPlan.stalls.map(s=>{
      const f=s.farmer?farmerById(s.farmer):null; const cat=f?f.cat:s.cat; const col=catColor(cat);
      const label=f?f.name:s.name;
      return `<g class="stall" data-farmer="${s.farmer||''}" data-cat="${cat}" data-label="${label}">
        <rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="10" fill="${col}"/>
        <text class="sid" x="${s.x+12}" y="${s.y+24}">${s.id}</text>
        <text x="${s.x+12}" y="${s.y+s.h-14}">${(label||'').slice(0,17)}</text>
        ${f?`<circle cx="${s.x+s.w-15}" cy="${s.y+15}" r="6" fill="#fff"/>`:''}</g>`;
    }).join('');
    const zoneHtml = marketPlan.zones.map(z=>`<g class="zone"><rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="8"/><text x="${z.x+z.w/2}" y="${z.y+z.h/2+5}" text-anchor="middle">${z.label}</text></g>`).join('');
    $('#planBox').innerHTML=`<svg viewBox="0 0 ${W} ${H}">
      <rect x="10" y="10" width="${W-20}" height="${H-20}" rx="16" fill="#faf5ec" stroke="#e6ddcd" stroke-width="2"/>
      ${zoneHtml}${stallHtml}</svg>`;
    $('#planLegend').innerHTML=Object.entries(CAT).map(([k,v])=>`<div class="lg"><span class="sw" style="background:${v.color}"></span>${v.label}</div>`).join('')+`<div class="lg"><span class="sw" style="background:#fff;border:1px solid var(--line);position:relative"></span>◦ — наш фермер</div>`;
    const info=$('#tenantCard');
    const show=g=>{
      $('#planBox').querySelectorAll('.stall').forEach(s=>s.classList.remove('sel')); g.classList.add('sel');
      const fid=g.dataset.farmer, cat=g.dataset.cat, label=g.dataset.label, f=fid?farmerById(fid):null, col=catColor(cat);
      info.innerHTML=`<span class="tc-cat" style="background:${col}">${catName(cat)}</span><h3>${label}</h3>
        ${f?`<p class="muted">${f.tagline}</p><a class="btn btn-primary" style="margin-top:14px" href="/farmer.html?id=${f.id}">Открыть хозяйство →</a>`
           :`<p class="muted">Торговое место категории «${catName(cat)}».</p><a class="btn btn-line" style="margin-top:14px" href="/catalog.html?cat=${cat}">Товары категории →</a>`}`;
    };
    $('#planBox').querySelectorAll('.stall').forEach(g=> g.onclick=()=>show(g));
    const first=$('#planBox').querySelector('.stall[data-farmer="molochnoe"]')||$('#planBox').querySelector('.stall');
    if(first) show(first);
  },
  events(){ $('#evGrid').innerHTML=events.map((e,i)=>`
    <a class="ed-card ${['w3','w3','w2','w2','w2'][i%5]} cat-${['meat','veg','bread','sea','dairy'][i%5]}" href="/event.html?id=${e.id}">
      <span class="ed-vis">
        <span class="tag">${e.tag}</span>
        <span class="ed-stamp small"><b>${e.date.split(' ')[0]}</b><span class="ed-region">${e.date.split(' ')[1]||''} · ${e.day}</span></span>
      </span>
      <span class="ed-b">
        <span class="ed-spec">${e.time}${e.price>0?` · ${e.price} ₽`:' · вход свободный'}</span>
        <h3>${e.title}</h3>
        <p>${e.desc}</p>
        <span class="ed-more">${e.price>0?'Купить билет':'Записаться'}</span>
      </span>
    </a>`).join(''); },
  event(){
    const e=byId(events, param('id'))||events[0]; document.title=e.title+' — События';
    $('#ecrumb').textContent=e.title;
    const cat=['meat','veg','bread','sea'][events.indexOf(e)%4];
    $('#eventWrap').innerHTML=`
      <article class="ed-object cat-${cat}">
        <div class="obj-vis"><span class="tag">${e.tag}</span>
          <span class="ed-stamp"><span class="ed-since">${e.day}</span><b>${e.date.split(' ')[0]}</b>
            <span class="ed-region">${e.date.split(' ').slice(1).join(' ')} · ${e.time}</span></span></div>
        <div class="obj-panel">
          <p class="obj-kicker">${e.price>0?'по билету':'вход свободный'}</p>
          <h1>${e.title}</h1>
          <p class="obj-farm">${e.host}</p>
          <div class="obj-price">${e.price>0?money(e.price):'бесплатно'}</div>
          <div class="obj-actions">
            <a class="btn btn-primary" href="/contacts.html">${e.price>0?'Купить билет':'Записаться'}</a>
            <a class="btn btn-ghost" href="/events.html">Вся афиша</a>
          </div>
          <p class="obj-note">${e.desc}</p>
        </div>
      </article>
      <div style="margin-top:38px">
        <p class="eyebrow">Программа</p>
        <h2 class="sect-t" style="margin:10px 0 20px">Как пройдёт</h2>
        <ul class="guide" style="margin:0;padding:0">
          ${e.program.map(sx=>`<li><span>${sx}</span></li>`).join('')}
        </ul>
      </div>`;
  },
  blog(){ $('#blogGrid').innerHTML=blogPosts.map((b,i)=>`
    <a class="ed-card ${['w3','w3','w2','w4'][i%4]} cat-${['veg','dairy','sea','bread'][i%4]}" href="/article.html?slug=${b.slug}">
      <span class="ed-vis"><span class="tag">${b.cat}</span>
        <span class="ed-stamp small"><b>${b.date.split(' ')[0]}</b><span class="ed-region">${b.date.split(' ').slice(1).join(' ')}</span></span></span>
      <span class="ed-b">
        <span class="ed-spec">${b.read} · ${b.author}</span>
        <h3>${b.title}</h3><p>${b.excerpt}</p>
        <span class="ed-more">Читать материал</span>
      </span>
    </a>`).join(''); },
  article(){
    const b=bySlug(blogPosts, param('slug'))||blogPosts[0]; document.title=b.title+' — Блог';
    $('#acrumb').textContent=b.title;
    $('#artWrap').innerHTML=`
      <div class="ed-journal">
        <p class="full" style="font:800 11.5px/1 var(--font);letter-spacing:.16em;text-transform:uppercase;color:var(--brown);margin:0 0 14px">
          ${b.cat} · ${b.date} · ${b.read}</p>
        <h1 class="full" style="font-size:clamp(34px,5vw,72px);font-weight:900;text-transform:uppercase;letter-spacing:-.03em;line-height:.92;margin:0 0 20px;max-width:22ch">${b.title}</h1>
        <p class="full lead" style="max-width:52ch;margin-bottom:34px">${b.excerpt}</p>
        ${b.body.map((t,i)=>i===1?`<p class="aside-note">${t}</p>`:`<p>${t}</p>`).join('')}
        <p class="aside-note">Материал: ${b.author}</p>
      </div>`;
  },
  cart(){ renderCart(); },
  checkout(){
    const items=cartItems();
    if(!items.length){ $('#coWrap').innerHTML='<div class="empty"><div class="em-ic">🛒</div><p>Корзина пуста</p><a class="btn btn-primary" href="/catalog.html">В каталог</a></div>'; return; }
    $('#coSummary').innerHTML=summaryHtml(items,true);
  },
};

function summaryHtml(items,checkout){
  const sum=cartTotal(); const delivery = sum>=2000||!checkout?0:250;
  return `<h3>Ваш заказ</h3>
    ${items.map(({p,q})=>`<div class="srow"><span>${p.name} × ${q}</span><span>${money(p.price*q)}</span></div>`).join('')}
    <div class="srow"><span>Доставка</span><span>${delivery?money(delivery):'бесплатно'}</span></div>
    <div class="stotal"><span>Итого</span><span>${money(sum+delivery)}</span></div>
    ${checkout?'':'<a class="btn btn-primary" href="/checkout.html" style="width:100%;justify-content:center;margin-top:16px">Оформить заказ</a><a class="btn btn-line" href="/catalog.html" style="width:100%;justify-content:center;margin-top:10px">Продолжить покупки</a>'}`;
}
function renderCart(){
  const items=cartItems();
  const list=$('#cartList'), sum=$('#cartSummary');
  if(!items.length){
    const hits=products.filter(p=>p.hit).slice(0,4);
    $('#cartWrap').innerHTML=`
      <div style="max-width:var(--w-narrow)">
        <h2 class="sect-t" style="margin-bottom:12px">В корзине ещё ничего</h2>
        <p class="lead" style="color:var(--muted);max-width:44ch">Вот что берут чаще всего — или соберите ящик под себя, там цена считается сразу.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin:22px 0 34px">
          <a class="btn btn-primary" href="/catalog.html">В каталог</a>
          <a class="btn btn-ghost" href="/builder.html">Собрать ящик</a>
        </div>
        <div class="pgrid">${hits.map(productCard).join('')}</div>
      </div>`;
    wireAdd($('#cartWrap'));
    return; }
  list.innerHTML=items.map(({p,q})=>`<div class="crow" data-id="${p.id}">
    <div class="ci-img">${p.icon}</div>
    <div><h4>${p.name}</h4><div class="ci-farm">${farmerById(p.farmer)?.name||''}</div></div>
    <span class="qty"><button data-q="-">−</button><span>${q}</span><button data-q="+">+</button></span>
    <span class="ci-price">${money(p.price*q)}</span>
    <button class="ci-del" data-del title="Удалить">✕</button></div>`).join('');
  sum.innerHTML=summaryHtml(items,false);
  list.querySelectorAll('.crow').forEach(row=>{
    const id=row.dataset.id;
    row.querySelector('[data-q="-"]').onclick=()=>{ const c=getCart(); c[id]=Math.max(1,(c[id]||1)-1); setCart(c); renderCart(); };
    row.querySelector('[data-q="+"]').onclick=()=>{ const c=getCart(); c[id]=(c[id]||1)+1; setCart(c); renderCart(); };
    row.querySelector('[data-del]').onclick=()=>{ const c=getCart(); delete c[id]; setCart(c); renderCart(); };
  });
}

/* ============ Home-page fillers (some pages render shared blocks) ============ */
function fillCommon(){
  if($('#valuesGrid')) $('#valuesGrid').innerHTML=values.map((v,i)=>`
    <article class="ed-card ${['w2','w2','w2','w3','w3','w2'][i%6]} cat-${['dairy','sea','veg','meat','bread','dairy'][i%6]}">
      <span class="ed-b" style="padding:26px 26px 28px">
        <span class="ed-spec">0${i+1}</span>
        <h3>${v.h}</h3><p>${v.t}</p>
      </span>
    </article>`).join('');
  if($('#guestsGrid')){
    const ic={basket:'🧺',people:'🤝',cup:'🍵',calendar:'📅'};
    $('#guestsGrid').innerHTML=guestExperiences.map((g,i)=>`
      <article class="ed-card ${['w3','w3','w2','w4'][i%4]} cat-${['veg','sea','bread','meat'][i%4]}">
        <span class="ed-vis" style="min-height:150px"><b style="font-size:clamp(46px,5vw,72px)">${ic[g.icon]||'•'}</b></span>
        <span class="ed-b"><h3>${g.title}</h3><p>${g.text}</p></span>
      </article>`).join('');
  }
  if($('#hitsGrid')){ $('#hitsGrid').innerHTML=products.filter(p=>p.hit).map(productCard).join(''); wireAdd($('#hitsGrid')); }
  if($('#testiGrid')) $('#testiGrid').innerHTML=testimonials.map(t=>`<div class="tcard reveal"><p>«${t.text}»</p><div class="twho"><div class="tav">${t.av}</div><div class="tn"><b>${t.who}</b><span>${t.role}</span></div></div></div>`).join('');
  if($('#recHome')) $('#recHome').innerHTML=recipes.slice(0,3).map(recipeCard).join('');
  if($('#catNav')) $('#catNav').innerHTML=Object.entries(CAT).map(([k,v])=>`<a href="/catalog.html?cat=${k}"><span class="sw" style="background:${v.color}"></span>${v.label}</a>`).join('');
}

/* ============ init ============ */
buildHeaderV4(); buildFooter(); buildOverlays(); updateBadge(); wireForms(); fillCommon();
if(R[page]) R[page]();
wireAdd(); reveal(); initMotion();

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
