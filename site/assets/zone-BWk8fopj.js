const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./motion-CbHFGzZ6.js","./data-CrZn-biY.js","./data-DC2IB6Qn.css","./motion-BgzMMeez.css"])))=>i.map(i=>d[i]);
import{g as b,p as v,u as p,C as z,r as L,M as $}from"./data-CrZn-biY.js";import"./motion-CbHFGzZ6.js";import{_ as M}from"./preload-helper-C1FmrZbK.js";/* empty css              */import{c as l}from"./data2-BFUUepxa.js";const a=(t,e=document)=>e.querySelector(t),T=t=>t.toLocaleString("ru-RU")+" ₽",w=new URLSearchParams(location.search).get("id")||"dairy",s=l.find(t=>t.id===w)||l[0],n=new Date().getMonth()+1,m=t=>t&&(t.from<=t.to?n>=t.from&&n<=t.to:n>=t.from||n<=t.to);document.title=`${s.title} — Холмогорское подворье`;document.body.classList.add("cat-"+s.cat);a("#zLetter").textContent=s.letter;a("#zTitle").textContent=s.title;a("#zLead").textContent=s.lead;a("#zCrumb").textContent=s.title;const o=b.filter(t=>t.cat===s.cat),i=v.filter(t=>t.cat===s.cat),h=i.filter(t=>m(p[t.id]));a("#zMeta").innerHTML=[`<span>Ряд <b>${s.letter}</b></span>`,`<span>Хозяйств: <b>${o.length}</b></span>`,`<span>Позиций: <b>${i.length}</b></span>`,h.length?`<span>В сезоне сейчас: <b>${h.length}</b></span>`:""].filter(Boolean).join("");a("#zManifesto").innerHTML=s.manifesto.map(t=>`<p>${t}</p>`).join("");a("#zGuide").innerHTML=s.guide.map(t=>`<li><span>${t}</span></li>`).join("");o.length?a("#zFarmers").innerHTML=o.map(t=>`
    <a class="tr" href="/farmer.html?id=${t.id}">
      <span class="mono2">${t.initials}</span>
      <span><b>${t.name}</b><span>${t.spec}</span></span>
    </a>`).join(""):a("#secFarmers").hidden=!0;a("#zProducts").innerHTML=i.map(t=>{const e=p[t.id];return`<article class="pcard cat-${t.cat}">
    <a href="/product.html?id=${t.id}" class="pc-img">${t.icon}
      ${m(e)&&e.peak===n?'<span class="pc-tag">пик сезона</span>':""}</a>
    <div class="pc-b">
      <div class="pc-cat">${z[t.cat].label}</div>
      <h3><a href="/product.html?id=${t.id}">${t.name}</a></h3>
      <div class="pc-row"><div class="pc-price">${T(t.price)} <small>/ ${t.unit}</small></div>
        <button class="pc-add" data-add="${t.id}">В корзину</button></div>
    </div></article>`}).join("");a("#zProducts").querySelectorAll("[data-add]").forEach(t=>t.onclick=e=>{const c=JSON.parse(localStorage.getItem("hp_cart")||"{}");c[t.dataset.add]=(c[t.dataset.add]||0)+1,localStorage.setItem("hp_cart",JSON.stringify(c)),M(()=>import("./motion-CbHFGzZ6.js"),__vite__mapDeps([0,1,2,3]),import.meta.url).then(d=>d.stampAt(e.clientX,e.clientY));const r=a("#cartBadge");r&&(r.textContent=Object.values(c).reduce((d,g)=>d+g,0),r.style.display="grid")});const S=i.map(t=>t.id),u=L.filter(t=>t.products.some(e=>S.includes(e)));u.length?a("#zRecipes").innerHTML=u.slice(0,3).map(t=>`
    <a class="rcard" href="/recipe.html?slug=${t.slug}">
      <span class="rc-img">${t.emoji}</span>
      <div class="rc-b"><div class="rc-meta"><span>${t.cat}</span><span>${t.time}</span></div>
        <h3>${t.title}</h3><p>${t.desc}</p></div></a>`).join(""):a("#secRecipes").hidden=!0;const j=i.map(t=>({p:t,s:p[t.id]})).filter(t=>t.s);a("#zSeason").innerHTML=j.map(({p:t,s:e})=>`
  <div class="season-row cat-${t.cat}">
    <span class="ic">${t.icon}</span>
    <span><b>${t.name}</b><span>${e.from===1&&e.to===12?"круглый год":`${$[e.from-1]} — ${$[e.to-1]}`} · ${e.note}</span></span>
    ${m(e)?'<span class="peak">сейчас</span>':""}
  </div>`).join("");var f;a("#z3d").href=`/index.html?goto=${((f=o[0])==null?void 0:f.id)||"entrance"}&inside=1`;a("#zOther").innerHTML=l.filter(t=>t.id!==s.id).map(t=>`<a class="chip" href="/zone.html?id=${t.id}">${t.title}</a>`).join("");
