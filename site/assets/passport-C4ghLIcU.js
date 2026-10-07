const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./motion-CbHFGzZ6.js","./data-CrZn-biY.js","./data-DC2IB6Qn.css","./motion-BgzMMeez.css"])))=>i.map(i=>d[i]);
import{c as r,p as c,f as l,C as m}from"./data-CrZn-biY.js";import"./motion-CbHFGzZ6.js";import{_ as h}from"./preload-helper-C1FmrZbK.js";/* empty css              */import{b as n}from"./data2-BFUUepxa.js";const e=(t,a=document)=>a.querySelector(t),u=t=>t.toLocaleString("ru-RU")+" ₽",i=(new URLSearchParams(location.search).get("code")||"").toUpperCase(),p=n.find(t=>t.code===i)||(i?null:n[0]);if(!p)e("#ppFound").remove(),e("#ppMiss").hidden=!1,e("#ppMissCode").textContent=i||"—",e("#ppOther").innerHTML=n.map(t=>{const a=r(c,t.product);return`<a class="chip" href="/passport.html?code=${t.code}">${a?a.icon+" "+a.name:t.code}</a>`}).join("");else{e("#ppMiss").remove();const t=r(c,p.product),a=l(p.farmer);document.body.classList.add("cat-"+((t==null?void 0:t.cat)||"bread")),document.title=`${t?t.name:"Партия"} · партия ${p.code}`,e("#ppCode").textContent="партия "+p.code,e("#ppTitle").textContent=t?t.name:"Продукт",e("#ppWhen").textContent=`Изготовлено ${p.produced}`+(p.volume?` · ${p.volume}`:""),e("#ppWho").innerHTML=a?`
    <b class="big">${a.name}</b>
    <p style="color:var(--muted);margin-top:8px">${a.spec} · ${a.tagline||""}</p>
    <a class="btn btn-ghost" href="/farmer.html?id=${a.id}" style="margin-top:16px">Профиль хозяйства</a>`:'<p style="color:var(--muted)">Хозяйство не указано</p>',e("#ppPath").innerHTML=`
    <b class="big">${p.distanceKm} км</b>
    <p style="color:var(--muted);margin-top:8px">${p.distanceKm===0?"Сделано здесь же, на подворье.":"от места производства до прилавка"}</p>
    <div class="pp-path"><span class="dot"></span><span class="line"></span><span class="dot"></span></div>
    <p style="font-size:13px;color:var(--muted);margin-top:8px">
      <span>${a&&a.id==="ulov"?"Балтийское побережье":"Хозяйство"}</span> → <span>прилавок рынка</span></p>`,e("#ppNote").textContent=p.note,e("#ppChecks").innerHTML=p.checks.map(o=>`<li>${o}</li>`).join(""),t&&(e("#ppBuy").innerHTML=`
      <div class="split-57">
        <div>
          <p class="eyebrow">Взять ещё</p>
          <h2 class="sect-t">${t.name}</h2>
          <p class="lead" style="color:var(--muted);margin-top:10px">${u(t.price)} / ${t.unit} · ${m[t.cat].label}</p>
          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:20px">
            <button class="btn btn-primary" data-add="${t.id}">В корзину</button>
            <a class="btn btn-ghost" href="/product.html?id=${t.id}">Страница товара</a>
          </div>
        </div>
        <div class="pp-card">
          <h3>Как мы проверяем</h3>
          <p style="color:var(--muted)">Каждая партия получает код при выпуске. Мы храним дату, объём,
          хозяйство и результаты проверок — и показываем их вам без запроса.</p>
          <a class="btn btn-ghost" href="/about.html" style="margin-top:14px">О контроле качества</a>
        </div>
      </div>`,e("#ppBuy").querySelector("[data-add]").onclick=o=>{const s=JSON.parse(localStorage.getItem("hp_cart")||"{}");s[t.id]=(s[t.id]||0)+1,localStorage.setItem("hp_cart",JSON.stringify(s)),h(()=>import("./motion-CbHFGzZ6.js"),__vite__mapDeps([0,1,2,3]),import.meta.url).then(d=>d.stampAt(o.clientX,o.clientY))}),e("#ppOther2").innerHTML=n.filter(o=>o.code!==p.code).map(o=>{const s=r(c,o.product);return`<a class="chip" href="/passport.html?code=${o.code}">${s?s.icon+" "+s.name:o.code}</a>`}).join("")}
