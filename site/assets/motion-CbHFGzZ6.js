import{i as J,c as w,v as V,j as X,p,t as Y,r as L,C as f,s as R,o as M,k as S,m as C,f as y,g as A,h as K,l as Q}from"./data-CrZn-biY.js";const I=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;function Z(t=document){const a=t.querySelectorAll(".rv, .rv-stagger");if(!a.length)return;if(I()){a.forEach(i=>i.classList.add("in"));return}const s=new IntersectionObserver(i=>{i.forEach(c=>{if(!c.isIntersecting)return;const r=c.target;r.classList.contains("rv-stagger")&&[...r.children].forEach((o,e)=>o.style.transitionDelay=`${e*60}ms`),r.classList.add("in"),s.unobserve(r)})},{threshold:.15,rootMargin:"0px 0px -8% 0px"});a.forEach(i=>s.observe(i))}function tt(t=document){const a=t.querySelectorAll("[data-count]");if(!a.length)return;if(I()){a.forEach(i=>i.textContent=W(+i.dataset.count));return}const s=new IntersectionObserver(i=>{i.forEach(c=>{if(!c.isIntersecting)return;const r=c.target,o=+r.dataset.count||0,e=900,l=performance.now(),d=m=>{const h=Math.min(1,(m-l)/e),E=1-Math.pow(1-h,3);r.textContent=W(Math.round(o*E)),h<1&&requestAnimationFrame(d)};requestAnimationFrame(d),s.unobserve(r)})},{threshold:.4});a.forEach(i=>s.observe(i))}const W=t=>t.toLocaleString("ru-RU"),at=`<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3">
  <circle cx="50" cy="50" r="44" stroke-dasharray="4 5" opacity=".8"/>
  <circle cx="50" cy="50" r="35"/>
  <path d="M50 30l7.5 7.5L50 45l-7.5-7.5z" fill="currentColor" stroke="none"/>
  <path d="M32 58h36M38 66h24" stroke-linecap="round"/>
</svg>`;function et(t,a){if(I())return;const s=document.createElement("div");s.className="stamp",s.innerHTML=at,s.style.left=t+"px",s.style.top=a+"px",document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("go")),s.addEventListener("animationend",()=>s.remove(),{once:!0}),navigator.vibrate&&navigator.vibrate(12)}function st(){document.addEventListener("click",t=>{t.target.closest("[data-add], #pAdd, [data-add-all]")&&et(t.clientX||innerWidth/2,t.clientY||innerHeight/2)},!0)}function nt(t){if(!t)return;const a=()=>{const s=document.documentElement,i=s.scrollTop/Math.max(1,s.scrollHeight-s.clientHeight);t.style.transform=`scaleX(${i})`};addEventListener("scroll",a,{passive:!0}),a()}function it(){Z(),tt(),st(),nt(document.querySelector("[data-read-progress]"))}const n=(t,a=document)=>a.querySelector(t),k=t=>t.toLocaleString("ru-RU")+" ₽",b=t=>new URLSearchParams(location.search).get(t),$=t=>{var a;return((a=f[t])==null?void 0:a.label)||""},B=t=>{var a;return((a=f[t])==null?void 0:a.color)||"var(--brown)"},ct=t=>{var a;return((a=f[t])==null?void 0:a.tint)||"var(--cream)"},g=t=>{const a=document.createElement("template");return a.innerHTML=t.trim(),a.content.firstElementChild},z=document.body.dataset.page||"";function rt(){const t=g(`<footer class="foot">
    <div class="wrap">
      <div class="top">
        <div>
          <a href="/index.html" class="brand" style="color:#fff">${Q}</a>
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
  </footer>`);t.querySelectorAll(".brand svg").forEach(a=>{a.classList.add("logo")}),document.body.append(t)}function lt(){if(document.body.append(g('<div class="modal-back" id="modalBack"></div>')),document.body.append(g(`<div class="modal" id="mSearch">
    <button class="m-close" data-close>✕</button>
    <input id="searchInput" placeholder="Поиск по товарам, фермерам, статьям…" autocomplete="off"/>
    <div class="s-res" id="searchRes"></div>
  </div>`)),document.body.append(g(`<div class="modal" id="mAuth">
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
  </div>`)),!localStorage.getItem("hp_cookie")){const s=g('<div id="cookie"><p>Мы используем cookie, чтобы сайт работал удобнее. Оставаясь, вы соглашаетесь с <a href="/privacy.html">политикой</a>.</p><button class="btn btn-primary" id="cookieOk">Хорошо</button></div>');document.body.append(s),setTimeout(()=>s.classList.add("show"),900),n("#cookieOk").onclick=()=>{localStorage.setItem("hp_cookie","1"),s.classList.remove("show")}}document.body.append(g('<div id="toast">✓ <span id="toastMsg">Готово</span></div>'));const t=n("#hdSearch");t&&(t.onclick=ot);const a=n("#hdUser");a&&(a.onclick=()=>F("mAuth")),document.querySelectorAll("[data-close]").forEach(s=>s.onclick=q),n("#modalBack").onclick=q,document.addEventListener("keydown",s=>{s.key==="Escape"&&q()}),n("#mAuth").querySelectorAll("[data-tab]").forEach(s=>s.onclick=()=>{n("#mAuth").querySelectorAll("[data-tab]").forEach(c=>c.classList.remove("on")),s.classList.add("on");const i=s.dataset.tab==="reg";n("#authTitle").textContent=i?"Создать аккаунт":"С возвращением",n("#authSub").textContent=i?"Быстрая регистрация по телефону.":"Войдите, чтобы отслеживать заказы и избранное.",n("#authBtn").textContent=i?"Зарегистрироваться":"Войти",n("#mAuth").querySelector(".authReg").style.display=i?"block":"none"}),n("#searchInput").addEventListener("input",dt)}function F(t){n("#modalBack").classList.add("show"),n("#"+t).classList.add("show")}function q(){document.querySelectorAll(".modal,.modal-back").forEach(t=>t.classList.remove("show"))}function ot(){F("mSearch"),setTimeout(()=>n("#searchInput").focus(),50)}function dt(t){const a=t.target.value.trim().toLowerCase(),s=n("#searchRes");if(!a){s.innerHTML="";return}const i=[];p.filter(c=>c.name.toLowerCase().includes(a)).slice(0,5).forEach(c=>i.push([`/product.html?id=${c.id}`,c.icon,c.name,"Товар · "+k(c.price)])),A.filter(c=>c.name.toLowerCase().includes(a)).forEach(c=>i.push([`/farmer.html?id=${c.id}`,c.initials,c.name,"Фермер · "+c.spec])),M.filter(c=>c.title.toLowerCase().includes(a)).forEach(c=>i.push([`/article.html?slug=${c.slug}`,"📝",c.title,"Статья · "+c.cat])),s.innerHTML=i.length?i.map(([c,r,o,e])=>`<a href="${c}"><span class="sr-ic">${r}</span><span><span class="sr-t">${o}</span><br><span class="sr-s">${e}</span></span></a>`).join(""):`<div style="padding:14px;color:var(--muted)">Ничего не найдено по «${t.target.value}»</div>`}function H(t){const a=n("#toast");n("#toastMsg").textContent=t,a.classList.add("show"),setTimeout(()=>a.classList.remove("show"),3e3)}const N="hp_cart",v=()=>JSON.parse(localStorage.getItem(N)||"{}"),j=t=>{localStorage.setItem(N,JSON.stringify(t)),_()};function O(t,a=1){const s=v();s[t]=(s[t]||0)+a,j(s);const i=w(p,t);H(`«${i.name}» в корзине`)}function _(){const t=Object.values(v()).reduce((s,i)=>s+i,0),a=n("#cartBadge");a&&(a.textContent=t,a.classList.toggle("on",t>0))}function G(){return Object.entries(v()).map(([t,a])=>({p:w(p,t),q:a})).filter(t=>t.p)}function pt(){return G().reduce((t,{p:a,q:s})=>t+a.price*s,0)}window.hpAddToCart=O;function mt(){const t=new IntersectionObserver(a=>a.forEach(s=>{s.isIntersecting&&(s.target.classList.add("in"),t.unobserve(s.target))}),{threshold:.12});document.querySelectorAll(".reveal").forEach(a=>t.observe(a))}function ht(){document.querySelectorAll("form[data-form]").forEach(t=>t.addEventListener("submit",a=>{a.preventDefault();const s=t.dataset.form;if(s==="Авторизация"){q(),H("Готово! Вы вошли (демо).");return}if(s==="Оформление заказа"){j({}),location.href="/order-success.html";return}t.reset(),H(s==="Заявка арендатора"?"Заявка принята — свяжемся с вами":s==="Запись на событие"?"Вы записаны! Ждём вас":"Сообщение отправлено. Спасибо!")}))}function x(t){const a=y(t.farmer),s=t.hit?"Хит":t.fresh?"Свежее":"";return`<article class="pcard">
    <a href="/product.html?id=${t.id}" class="pc-img" style="background:${ct(t.cat)}">${s?`<span class="pc-tag">${s}</span>`:""}${t.icon}</a>
    <div class="pc-b">
      <div class="pc-cat" style="color:${B(t.cat)}">${$(t.cat)}</div>
      <h3><a href="/product.html?id=${t.id}">${t.name}</a></h3>
      <div class="pc-farm">${a?a.name:""}</div>
      <div class="pc-row">
        <div class="pc-price">${t.price} ₽ <small>/ ${t.unit}</small></div>
        <button class="pc-add" data-add="${t.id}">В корзину</button>
      </div>
    </div>
  </article>`}function u(t=document){t.querySelectorAll("[data-add]").forEach(a=>a.onclick=()=>O(a.dataset.add))}function ut(t){return`<article class="rcard"><a href="/recipe.html?slug=${t.slug}" class="rc-img">${t.emoji}</a>
    <div class="rc-b"><div class="rc-meta"><span>${t.cat}</span><span>⏱ ${t.time}</span></div>
    <h3><a href="/recipe.html?slug=${t.slug}">${t.title}</a></h3><p>${t.desc}</p>
    <a href="/recipe.html?slug=${t.slug}" class="more">Смотреть рецепт →</a></div></article>`}function ft(t){const a=v();t.forEach(s=>{w(p,s)&&(a[s]=(a[s]||0)+1)}),j(a),H("Продукты для рецепта — в корзине")}const P={catalog(){const t=n("#pgrid"),a=n("#pcount"),s={cat:new Set,farmer:new Set},i=n("#fCats"),c=n("#fFarms");i.innerHTML=Object.entries(f).map(([e,l])=>`<label><input type="checkbox" data-cat="${e}"><span class="swatch" style="background:${l.color}"></span>${l.label}</label>`).join(""),c.innerHTML=A.map(e=>`<label><input type="checkbox" data-farm="${e.id}">${e.name}</label>`).join("");function r(){let e=p.slice();s.cat.size&&(e=e.filter(d=>s.cat.has(d.cat))),s.farmer.size&&(e=e.filter(d=>s.farmer.has(d.farmer)));const l=n("#sortSel").value;l==="cheap"&&e.sort((d,m)=>d.price-m.price),l==="exp"&&e.sort((d,m)=>m.price-d.price),a.textContent=`Найдено товаров: ${e.length}`,t.innerHTML=e.map(x).join("")||'<div class="empty">Ничего не найдено. Сбросьте фильтры.</div>',u(t)}i.querySelectorAll("[data-cat]").forEach(e=>e.onchange=()=>{e.checked?s.cat.add(e.dataset.cat):s.cat.delete(e.dataset.cat),r()}),c.querySelectorAll("[data-farm]").forEach(e=>e.onchange=()=>{e.checked?s.farmer.add(e.dataset.farm):s.farmer.delete(e.dataset.farm),r()}),n("#sortSel").onchange=r;const o=b("cat");if(o&&f[o]){const e=i.querySelector(`[data-cat="${o}"]`);e&&(e.checked=!0,s.cat.add(o))}r()},product(){const t=w(p,b("id"))||p[0],a=y(t.farmer);document.title=t.name+" — Холмогорское подворье";const s=t.hit?"Хит продаж":t.fresh?"Свежее сегодня":"";n("#prodWrap").innerHTML=`
      <article class="ed-object cat-${t.cat}">
        <div class="obj-vis">${s?`<span class="tag">${s}</span>`:""}${t.icon}</div>
        <div class="obj-panel">
          <p class="obj-kicker">${$(t.cat)}</p>
          <h1>${t.name}</h1>
          <p class="obj-farm">${a?`${a.name} · ${a.spec}`:""}</p>
          <div class="obj-price">${t.price} ₽ <small>/ ${t.unit}</small></div>
          <div class="chips">${t.tags.map(o=>`<span class="chip">${o}</span>`).join("")}<span class="chip">Проверено временем</span></div>
          <div class="obj-actions">
            <span class="qty"><button id="qm" aria-label="Меньше">−</button><span id="qv">1</span><button id="qp" aria-label="Больше">+</button></span>
            <button class="btn btn-primary" id="pAdd">В корзину</button>
            <a class="btn btn-ghost" href="/farmer.html?id=${t.farmer}">О хозяйстве</a>
          </div>
          <p class="obj-note">${a?a.story:""}</p>
        </div>
      </article>
      <h2 class="vh">Что известно об этом продукте</h2>
      <div class="ed-proof" style="margin-top:34px">
        <div><h3>Кто сделал</h3><b>${a?a.name.replace("Хозяйство ","").replace("Коптильня ",""):"—"}</b>
          <p><a href="/farmer.html?id=${t.farmer}" style="color:var(--brown);font-weight:700">Профиль хозяйства →</a></p></div>
        <div><h3>Когда привезли</h3><b>${t.fresh?"сегодня":"эта неделя"}</b>
          <p><a href="/passport.html" style="color:var(--brown);font-weight:700">Паспорт партии →</a></p></div>
        <div><h3>Как продаётся</h3><b>при вас</b><p>Взвешиваем и упаковываем на месте — цена указана за ${t.unit}, без предварительной фасовки.</p></div>
      </div>`,n("#pcrumb").textContent=t.name;let i=1;const c=n("#qv");n("#qm").onclick=()=>{i=Math.max(1,i-1),c.textContent=i},n("#qp").onclick=()=>{i++,c.textContent=i},n("#pAdd").onclick=()=>O(t.id,i);const r=p.filter(o=>o.cat===t.cat&&o.id!==t.id).slice(0,4);n("#related")&&(n("#related").innerHTML=r.map(x).join(""),u(n("#related")))},farmer(){var o;const t=y(b("id"))||A[0],a=K[t.id]||{};document.title=t.name+" — Холмогорское подворье",n("#fcrumb").textContent=t.name;const s=p.filter(e=>e.farmer===t.id),i=L.filter(e=>e.products.some(l=>s.some(d=>d.id===l))).slice(0,3);n("#farmerPage").innerHTML=`
      <div class="cat-${t.cat}">

        <!-- Разворот: имя крупной формой, факт-штамп с годом -->
        <div class="ed-feature" style="margin-bottom:0">
          <div class="ed-vis">
            <span class="ed-stamp">
              <span class="ed-since">на подворье с</span>
              <b>${a.founded||"—"}</b>
              <span class="ed-region">${a.region||$(t.cat)}</span>
            </span>
          </div>
          <div class="ed-txt">
            <p class="ed-kicker">${$(t.cat)}</p>
            <h1 style="font-size:clamp(30px,4vw,54px);text-transform:uppercase;letter-spacing:-.025em;line-height:.98;margin:14px 0 16px">${t.name}</h1>
            <p class="ed-quote">«${a.quote||t.tagline}»</p>
            <p class="ed-by">${a.quoteBy||t.spec}</p>
            <div style="display:flex;gap:12px;flex-wrap:wrap">
              <a class="btn btn-primary" href="#products">Товары хозяйства</a>
              <a class="btn btn-ghost" href="/map.html">Найти на плане</a>
            </div>
          </div>
        </div>

        ${a.facts?`<div class="ed-numbers">${a.facts.map(e=>`<div><b>${e.n}</b><span>${e.l}</span></div>`).join("")}</div>`:""}

        <!-- История: журнальная колонка с заметкой на полях -->
        <div class="ed-journal" style="margin:12px 0 44px">
          <p class="full eyebrow">История хозяйства</p>
          <h2 class="full sect-t" style="margin:8px 0 22px">Как здесь работают</h2>
          ${(a.long||[t.story]).map((e,l)=>l===1?`<p class="aside-note">${e}</p>`:`<p>${e}</p>`).join("")}
          ${a.gallery?`<div class="full" style="display:grid;grid-template-columns:repeat(6,1fr);gap:14px;margin-top:26px">
            ${a.gallery.map(e=>`<div style="aspect-ratio:1;border-radius:var(--r-m);background:var(--cat-tint);display:grid;place-items:center;font-size:40px">${e}</div>`).join("")}</div>`:""}
        </div>

        ${a.process?`<div class="ed-band">
          <div class="ed-band-in" style="grid-template-columns:1fr;align-items:start">
            <div>
              <p style="font:800 11.5px/1 var(--font);letter-spacing:.16em;text-transform:uppercase;color:var(--brown);margin:0 0 22px">От поля до прилавка</p>
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:30px">
                ${a.process.map((e,l)=>`<div>
                  <b style="display:block;font:900 34px/1 var(--font);color:var(--brown);margin-bottom:10px">0${l+1}</b>
                  <b style="display:block;font-size:17px;margin-bottom:6px">${e.t}</b>
                  <span style="color:rgba(244,239,230,.66);font-size:14.5px;line-height:1.5">${e.d}</span>
                </div>`).join("")}
              </div>
            </div>
          </div>
        </div>`:""}

        ${i.length?`<div style="margin:44px 0 0" id="fRecs">
          <p class="eyebrow">Что приготовить</p>
          <h2 class="sect-t" style="margin:8px 0 22px">Рецепты из этих продуктов</h2>
          <div class="ed-grid">${i.map((e,l)=>`
            <a class="ed-card ${["w2","w2","w2"][l%3]}" href="/recipe.html?slug=${e.slug}">
              <span class="ed-vis"><b style="font-size:clamp(44px,4.6vw,66px)">${e.emoji}</b></span>
              <span class="ed-b"><span class="ed-spec">${e.time}</span><h3>${e.title}</h3>
                <span class="ed-more">Открыть рецепт</span></span></a>`).join("")}</div>
        </div>`:""}

      </div>`;const c=n("#farmerProds");c&&(c.innerHTML=s.map(x).join(""),u(c)),!document.getElementById("products")&&c&&((o=c.closest("section"))==null||o.setAttribute("id","products"))},recipes(){n("#recGrid").innerHTML=L.map((t,a)=>`
    <a class="ed-card ${["w3","w3","w2","w2","w2","w4"][a%6]} cat-${["bread","veg","sea","meat","dairy","bread"][a%6]}" href="/recipe.html?slug=${t.slug}">
      <span class="ed-vis"><span class="tag">${t.cat}</span><b style="font-size:clamp(52px,5.6vw,84px)">${t.emoji}</b></span>
      <span class="ed-b">
        <span class="ed-spec">${t.time} · ${t.serves}</span>
        <h3>${t.title}</h3>
        <p>${t.desc}</p>
        <span class="ed-more">${t.products.length} ${t.products.length===1?"ингредиент":"ингредиента"} — сразу в корзину</span>
      </span>
    </a>`).join("")},recipe(){const t=R(L,b("slug"))||L[0];document.title=t.title+" — Рецепты",n("#rcrumb").textContent=t.title;const a=t.products.map(i=>w(p,i)).filter(Boolean),s=a.reduce((i,c)=>i+c.price,0);n("#recipeWrap").innerHTML=`
      <div class="ed-head-in" style="align-items:end;padding-bottom:10px">
        <div>
          <p class="eyebrow">${t.cat} · ${t.time} · ${t.serves}</p>
          <h1 style="font-size:clamp(32px,4.6vw,64px);font-weight:900;text-transform:uppercase;letter-spacing:-.03em;line-height:.94;margin:12px 0 0">${t.title}</h1>
          <p class="lead" style="margin-top:16px;max-width:46ch">${t.desc}</p>
        </div>
        <div class="ed-head-num"><b style="font-size:clamp(72px,8vw,120px)">${t.emoji}</b></div>
      </div>
      <div class="split" style="margin-top:48px;align-items:start">
        <div><h2 class="sect-t" style="font-size:24px;margin-bottom:20px">Приготовление</h2>
          <ol class="rsteps">${t.steps.map(i=>`<li>${i}</li>`).join("")}</ol></div>
        <div><h2 class="sect-t" style="font-size:24px;margin-bottom:18px">Что понадобится</h2>
          <div class="addall" style="margin-bottom:16px"><b>Продукты для рецепта · <span class="aa-sum">${s} ₽</span></b>
            <button class="btn btn-primary" id="addAll">Всё в корзину</button></div>
          <div class="pgrid" style="grid-template-columns:1fr;gap:12px" id="recipeProds"></div></div>
      </div>`,n("#recipeProds").innerHTML=a.map(x).join(""),u(n("#recipeProds")),n("#addAll").onclick=()=>ft(t.products)},map(){const[t,a]=C.view,s=C.stalls.map(e=>{const l=e.farmer?y(e.farmer):null,d=l?l.cat:e.cat,m=B(d),h=l?l.name:e.name;return`<g class="stall" data-farmer="${e.farmer||""}" data-cat="${d}" data-label="${h}">
        <rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="10" fill="${m}"/>
        <text class="sid" x="${e.x+12}" y="${e.y+24}">${e.id}</text>
        <text x="${e.x+12}" y="${e.y+e.h-14}">${(h||"").slice(0,17)}</text>
        ${l?`<circle cx="${e.x+e.w-15}" cy="${e.y+15}" r="6" fill="#fff"/>`:""}</g>`}).join(""),i=C.zones.map(e=>`<g class="zone"><rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="8"/><text x="${e.x+e.w/2}" y="${e.y+e.h/2+5}" text-anchor="middle">${e.label}</text></g>`).join("");n("#planBox").innerHTML=`<svg viewBox="0 0 ${t} ${a}">
      <rect x="10" y="10" width="${t-20}" height="${a-20}" rx="16" fill="#faf5ec" stroke="#e6ddcd" stroke-width="2"/>
      ${i}${s}</svg>`,n("#planLegend").innerHTML=Object.entries(f).map(([e,l])=>`<div class="lg"><span class="sw" style="background:${l.color}"></span>${l.label}</div>`).join("")+'<div class="lg"><span class="sw" style="background:#fff;border:1px solid var(--line);position:relative"></span>◦ — наш фермер</div>';const c=n("#tenantCard"),r=e=>{n("#planBox").querySelectorAll(".stall").forEach(D=>D.classList.remove("sel")),e.classList.add("sel");const l=e.dataset.farmer,d=e.dataset.cat,m=e.dataset.label,h=l?y(l):null,E=B(d);c.innerHTML=`<span class="tc-cat" style="background:${E}">${$(d)}</span><h3>${m}</h3>
        ${h?`<p class="muted">${h.tagline}</p><a class="btn btn-primary" style="margin-top:14px" href="/farmer.html?id=${h.id}">Открыть хозяйство →</a>`:`<p class="muted">Торговое место категории «${$(d)}».</p><a class="btn btn-line" style="margin-top:14px" href="/catalog.html?cat=${d}">Товары категории →</a>`}`};n("#planBox").querySelectorAll(".stall").forEach(e=>e.onclick=()=>r(e));const o=n("#planBox").querySelector('.stall[data-farmer="molochnoe"]')||n("#planBox").querySelector(".stall");o&&r(o)},events(){n("#evGrid").innerHTML=S.map((t,a)=>`
    <a class="ed-card ${["w3","w3","w2","w2","w2"][a%5]} cat-${["meat","veg","bread","sea","dairy"][a%5]}" href="/event.html?id=${t.id}">
      <span class="ed-vis">
        <span class="tag">${t.tag}</span>
        <span class="ed-stamp small"><b>${t.date.split(" ")[0]}</b><span class="ed-region">${t.date.split(" ")[1]||""} · ${t.day}</span></span>
      </span>
      <span class="ed-b">
        <span class="ed-spec">${t.time}${t.price>0?` · ${t.price} ₽`:" · вход свободный"}</span>
        <h3>${t.title}</h3>
        <p>${t.desc}</p>
        <span class="ed-more">${t.price>0?"Купить билет":"Записаться"}</span>
      </span>
    </a>`).join("")},event(){const t=w(S,b("id"))||S[0];document.title=t.title+" — События",n("#ecrumb").textContent=t.title;const a=["meat","veg","bread","sea"][S.indexOf(t)%4];n("#eventWrap").innerHTML=`
      <article class="ed-object cat-${a}">
        <div class="obj-vis"><span class="tag">${t.tag}</span>
          <span class="ed-stamp"><span class="ed-since">${t.day}</span><b>${t.date.split(" ")[0]}</b>
            <span class="ed-region">${t.date.split(" ").slice(1).join(" ")} · ${t.time}</span></span></div>
        <div class="obj-panel">
          <p class="obj-kicker">${t.price>0?"по билету":"вход свободный"}</p>
          <h1>${t.title}</h1>
          <p class="obj-farm">${t.host}</p>
          <div class="obj-price">${t.price>0?k(t.price):"бесплатно"}</div>
          <div class="obj-actions">
            <a class="btn btn-primary" href="/contacts.html">${t.price>0?"Купить билет":"Записаться"}</a>
            <a class="btn btn-ghost" href="/events.html">Вся афиша</a>
          </div>
          <p class="obj-note">${t.desc}</p>
        </div>
      </article>
      <div style="margin-top:38px">
        <p class="eyebrow">Программа</p>
        <h2 class="sect-t" style="margin:10px 0 20px">Как пройдёт</h2>
        <ul class="guide" style="margin:0;padding:0">
          ${t.program.map(s=>`<li><span>${s}</span></li>`).join("")}
        </ul>
      </div>`},blog(){n("#blogGrid").innerHTML=M.map((t,a)=>`
    <a class="ed-card ${["w3","w3","w2","w4"][a%4]} cat-${["veg","dairy","sea","bread"][a%4]}" href="/article.html?slug=${t.slug}">
      <span class="ed-vis"><span class="tag">${t.cat}</span>
        <span class="ed-stamp small"><b>${t.date.split(" ")[0]}</b><span class="ed-region">${t.date.split(" ").slice(1).join(" ")}</span></span></span>
      <span class="ed-b">
        <span class="ed-spec">${t.read} · ${t.author}</span>
        <h3>${t.title}</h3><p>${t.excerpt}</p>
        <span class="ed-more">Читать материал</span>
      </span>
    </a>`).join("")},article(){const t=R(M,b("slug"))||M[0];document.title=t.title+" — Блог",n("#acrumb").textContent=t.title,n("#artWrap").innerHTML=`
      <div class="ed-journal">
        <p class="full" style="font:800 11.5px/1 var(--font);letter-spacing:.16em;text-transform:uppercase;color:var(--brown);margin:0 0 14px">
          ${t.cat} · ${t.date} · ${t.read}</p>
        <h1 class="full" style="font-size:clamp(34px,5vw,72px);font-weight:900;text-transform:uppercase;letter-spacing:-.03em;line-height:.92;margin:0 0 20px;max-width:22ch">${t.title}</h1>
        <p class="full lead" style="max-width:52ch;margin-bottom:34px">${t.excerpt}</p>
        ${t.body.map((a,s)=>s===1?`<p class="aside-note">${a}</p>`:`<p>${a}</p>`).join("")}
        <p class="aside-note">Материал: ${t.author}</p>
      </div>`},cart(){T()},checkout(){const t=G();if(!t.length){n("#coWrap").innerHTML='<div class="empty"><div class="em-ic">🛒</div><p>Корзина пуста</p><a class="btn btn-primary" href="/catalog.html">В каталог</a></div>';return}n("#coSummary").innerHTML=U(t,!0)}};function U(t,a){const s=pt(),i=s>=2e3||!a?0:250;return`<h3>Ваш заказ</h3>
    ${t.map(({p:c,q:r})=>`<div class="srow"><span>${c.name} × ${r}</span><span>${k(c.price*r)}</span></div>`).join("")}
    <div class="srow"><span>Доставка</span><span>${i?k(i):"бесплатно"}</span></div>
    <div class="stotal"><span>Итого</span><span>${k(s+i)}</span></div>
    ${a?"":'<a class="btn btn-primary" href="/checkout.html" style="width:100%;justify-content:center;margin-top:16px">Оформить заказ</a><a class="btn btn-line" href="/catalog.html" style="width:100%;justify-content:center;margin-top:10px">Продолжить покупки</a>'}`}function T(){const t=G(),a=n("#cartList"),s=n("#cartSummary");if(!t.length){const i=p.filter(c=>c.hit).slice(0,4);n("#cartWrap").innerHTML=`
      <div style="max-width:var(--w-narrow)">
        <h2 class="sect-t" style="margin-bottom:12px">В корзине ещё ничего</h2>
        <p class="lead" style="color:var(--muted);max-width:44ch">Вот что берут чаще всего — или соберите ящик под себя, там цена считается сразу.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin:22px 0 34px">
          <a class="btn btn-primary" href="/catalog.html">В каталог</a>
          <a class="btn btn-ghost" href="/builder.html">Собрать ящик</a>
        </div>
        <div class="pgrid">${i.map(x).join("")}</div>
      </div>`,u(n("#cartWrap"));return}a.innerHTML=t.map(({p:i,q:c})=>{var r;return`<div class="crow" data-id="${i.id}">
    <div class="ci-img">${i.icon}</div>
    <div><h4>${i.name}</h4><div class="ci-farm">${((r=y(i.farmer))==null?void 0:r.name)||""}</div></div>
    <span class="qty"><button data-q="-">−</button><span>${c}</span><button data-q="+">+</button></span>
    <span class="ci-price">${k(i.price*c)}</span>
    <button class="ci-del" data-del title="Удалить">✕</button></div>`}).join(""),s.innerHTML=U(t,!1),a.querySelectorAll(".crow").forEach(i=>{const c=i.dataset.id;i.querySelector('[data-q="-"]').onclick=()=>{const r=v();r[c]=Math.max(1,(r[c]||1)-1),j(r),T()},i.querySelector('[data-q="+"]').onclick=()=>{const r=v();r[c]=(r[c]||1)+1,j(r),T()},i.querySelector("[data-del]").onclick=()=>{const r=v();delete r[c],j(r),T()}})}function vt(){if(n("#valuesGrid")&&(n("#valuesGrid").innerHTML=V.map((t,a)=>`
    <article class="ed-card ${["w2","w2","w2","w3","w3","w2"][a%6]} cat-${["dairy","sea","veg","meat","bread","dairy"][a%6]}">
      <span class="ed-b" style="padding:26px 26px 28px">
        <span class="ed-spec">0${a+1}</span>
        <h3>${t.h}</h3><p>${t.t}</p>
      </span>
    </article>`).join("")),n("#guestsGrid")){const t={basket:"🧺",people:"🤝",cup:"🍵",calendar:"📅"};n("#guestsGrid").innerHTML=X.map((a,s)=>`
      <article class="ed-card ${["w3","w3","w2","w4"][s%4]} cat-${["veg","sea","bread","meat"][s%4]}">
        <span class="ed-vis" style="min-height:150px"><b style="font-size:clamp(46px,5vw,72px)">${t[a.icon]||"•"}</b></span>
        <span class="ed-b"><h3>${a.title}</h3><p>${a.text}</p></span>
      </article>`).join("")}n("#hitsGrid")&&(n("#hitsGrid").innerHTML=p.filter(t=>t.hit).map(x).join(""),u(n("#hitsGrid"))),n("#testiGrid")&&(n("#testiGrid").innerHTML=Y.map(t=>`<div class="tcard reveal"><p>«${t.text}»</p><div class="twho"><div class="tav">${t.av}</div><div class="tn"><b>${t.who}</b><span>${t.role}</span></div></div></div>`).join("")),n("#recHome")&&(n("#recHome").innerHTML=L.slice(0,3).map(ut).join("")),n("#catNav")&&(n("#catNav").innerHTML=Object.entries(f).map(([t,a])=>`<a href="/catalog.html?cat=${t}"><span class="sw" style="background:${a.color}"></span>${a.label}</a>`).join(""))}J();rt();lt();_();ht();vt();P[z]&&P[z]();u();mt();it();"serviceWorker"in navigator&&location.protocol.startsWith("http")&&addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").catch(()=>{})});export{tt as initCounters,it as initMotion,nt as initReadProgress,Z as initReveal,st as initStamp,et as stampAt};
