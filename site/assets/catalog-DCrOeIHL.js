const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./motion-CbHFGzZ6.js","./data-CrZn-biY.js","./data-DC2IB6Qn.css","./motion-BgzMMeez.css"])))=>i.map(i=>d[i]);
import{c as f,p as i,f as u}from"./data-CrZn-biY.js";import"./motion-CbHFGzZ6.js";import{_ as h}from"./preload-helper-C1FmrZbK.js";const p=(s,r=document)=>r.querySelector(s),v=s=>s.toLocaleString("ru-RU")+" ₽";(async function(){var l;const r=p("#edSpot");if(!r)return;let t=null,n="Хит подворья";try{const e=await fetch("./api/today.json",{cache:"no-store"});if(e.ok){const a=await e.json();a.updated_at&&(Date.now()-new Date(a.updated_at))/36e5<20&&((l=a.arrivals)!=null&&l.length)&&(t=f(i,a.arrivals[0].product),n=`Привезли сегодня в ${a.arrivals[0].time}`)}}catch{}t||(t=i.find(e=>e.hit)||i[0]);const d=u(t.farmer);r.className="ed-spot cat-"+t.cat,r.innerHTML=`<div class="ed-spot-in">
    <div class="vis">${t.icon}</div>
    <div>
      <p class="kicker">${n}</p>
      <h2>${t.name}</h2>
      <p>${d?d.story:""}</p>
      <div class="row">
        <span class="price">${v(t.price)} <small>/ ${t.unit}</small></span>
        <button class="btn btn-primary" data-add="${t.id}">В корзину</button>
        <a class="btn btn-ghost" style="color:#f4efe6;border-color:rgba(244,239,230,.5)" href="/product.html?id=${t.id}">Подробнее</a>
      </div>
    </div>
  </div>`,r.querySelector("[data-add]").onclick=e=>{const a=JSON.parse(localStorage.getItem("hp_cart")||"{}");a[t.id]=(a[t.id]||0)+1,localStorage.setItem("hp_cart",JSON.stringify(a));const o=p("#cartBadge");o&&(o.textContent=Object.values(a).reduce((c,m)=>c+m,0),o.classList.add("on")),h(()=>import("./motion-CbHFGzZ6.js"),__vite__mapDeps([0,1,2,3]),import.meta.url).then(c=>c.stampAt(e.clientX,e.clientY))}})();
