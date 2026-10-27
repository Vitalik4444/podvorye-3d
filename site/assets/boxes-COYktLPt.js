const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./motion-CbHFGzZ6.js","./data-CrZn-biY.js","./data-DC2IB6Qn.css","./motion-BgzMMeez.css"])))=>i.map(i=>d[i]);
import{b as l,a as d,c as b,p as x}from"./data-CrZn-biY.js";import"./motion-CbHFGzZ6.js";import{_ as v}from"./preload-helper-C1FmrZbK.js";/* empty css              */const e=(a,s=document)=>s.querySelector(a),r=a=>a.toLocaleString("ru-RU")+" ₽";let o=l[1];function f(a){return Math.round(a*(100-o.discount)/100)}function h(a){const s=a.items.map(t=>b(x,t)).filter(Boolean),c=f(a.price);return`<article class="box cat-${a.cat}">
    <div class="box-top">
      <span class="box-size">${a.size}</span>
      ${a.seasonal?'<span class="tag-season">сезонный</span>':""}
      <h3>${a.name}</h3>
      <p class="serves">${a.serves}</p>
    </div>
    <div class="box-b">
      <p>${a.desc}</p>
      <div class="box-items">${s.map(t=>`<span>${t.icon} ${t.name.split(",")[0]}</span>`).join("")}</div>
      <div class="box-price">
        <b>${r(c)}</b>
        ${o.discount?`<s>${r(a.price)}</s>`:a.oldPrice?`<s>${r(a.oldPrice)}</s>`:""}
      </div>
      <button class="btn btn-primary" data-box="${a.id}">Оформить бокс</button>
    </div>
  </article>`}function p(){e("#plans").innerHTML=l.map(a=>`
    <label class="plan ${a.id===o.id?"on":""}" data-plan="${a.id}">
      <b>${a.label}</b>
      ${a.discount?`<span class="disc">−${a.discount}% к цене</span>`:'<span class="note">полная цена</span>'}
      ${a.note?`<span class="note">${a.note}</span>`:""}
    </label>`).join(""),e("#plans").querySelectorAll("[data-plan]").forEach(a=>a.onclick=()=>{o=l.find(s=>s.id===a.dataset.plan),p(),m()})}function m(){e("#boxGrid").innerHTML=d.map(h).join(""),e("#boxGrid").querySelectorAll("[data-box]").forEach(a=>a.onclick=s=>{const c=d.find(n=>n.id===a.dataset.box),t=JSON.parse(localStorage.getItem("hp_cart")||"{}");c.items.forEach(n=>t[n]=(t[n]||0)+1),localStorage.setItem("hp_cart",JSON.stringify(t)),document.dispatchEvent(new CustomEvent("cart:changed"));const i=e("#cartBadge");if(i){const n=Object.values(t).reduce((u,$)=>u+$,0);i.textContent=n,i.style.display="grid"}v(()=>import("./motion-CbHFGzZ6.js"),__vite__mapDeps([0,1,2,3]),import.meta.url).then(n=>n.stampAt(s.clientX,s.clientY))})}p();m();
