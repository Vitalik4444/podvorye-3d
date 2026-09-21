import{g as d,h as $,C as r,p as m}from"./data-CrZn-biY.js";import"./motion-CbHFGzZ6.js";const s=(e,a=document)=>a.querySelector(e),h=[["all","Все дни"],["sat","Суббота"],["sun","Воскресенье"],["week","Будни"]],b=e=>e.trading_days||["week","sat","sun"];let l="all";const c=e=>$[e]||{},g=e=>m.filter(a=>a.farmer===e);function y(e){const a=c(e.id),n=(a.facts||[]).slice(0,3);return`<article class="ed-feature cat-${e.cat}">
    <a class="ed-vis" href="/farmer.html?id=${e.id}" aria-label="${e.name}">
      <span class="ed-stamp">
        <span class="ed-since">на подворье с</span>
        <b>${a.founded||"—"}</b>
        <span class="ed-region">${a.region||r[e.cat].label}</span>
      </span>
    </a>
    <div class="ed-txt">
      <p class="ed-kicker">${r[e.cat].label} · с ${a.founded||"—"} года</p>
      <h2><a href="/farmer.html?id=${e.id}">${e.name}</a></h2>
      ${a.quote?`<p class="ed-quote">«${a.quote}»</p><p class="ed-by">${a.quoteBy||""}</p>`:`<p class="ed-quote">«${e.tagline}»</p><p class="ed-by">${e.spec}</p>`}
      <a class="btn btn-primary" href="/farmer.html?id=${e.id}">Открыть хозяйство</a>
      ${n.length?`<div class="ed-facts">${n.map(t=>`<div><b>${t.n}</b><span>${t.l}</span></div>`).join("")}</div>`:""}
    </div>
  </article>`}const i=["w3","w3","w2","w2","w2","w4","w2"];function q(e,a){const n=c(e.id),t=g(e.id).length;return`<a class="ed-card ${i[a%i.length]} cat-${e.cat}" href="/farmer.html?id=${e.id}">
    <span class="ed-vis"><span class="tag">${r[e.cat].label}</span>
      <span class="ed-stamp small"><b>${n.founded||e.initials}</b><span class="ed-region">${n.region||""}</span></span>
    </span>
    <span class="ed-b">
      <span class="ed-spec">${e.spec}</span>
      <h3>${e.name}</h3>
      <p>${e.story.length>150?e.story.slice(0,148).replace(/[\s,.]+$/,"")+"…":e.story}</p>
      <span class="ed-more">${t?`${t} ${p(t,["позиция","позиции","позиций"])} на прилавке`:"Открыть хозяйство"}</span>
    </span>
  </a>`}const p=(e,a)=>a[e%10===1&&e%100!==11?0:e%10>=2&&e%10<=4&&(e%100<10||e%100>=20)?1:2];function u(){const e=l==="all"?d:d.filter(a=>b(a).includes(l));if(s("#edNum").textContent=e.length,s("#edCount").textContent=`${e.length} ${p(e.length,["хозяйство","хозяйства","хозяйств"])}`,!e.length){s("#edFeature").innerHTML="",s("#edGrid").innerHTML='<p style="color:var(--muted)">В этот день никто не торгует. Ближайший день — суббота.</p>';return}s("#edFeature").innerHTML=y(e[0]),s("#edGrid").innerHTML=e.slice(1).map(q).join("")}s("#edFilters").innerHTML='<span class="lbl">Когда стоят</span>'+h.map(([e,a])=>`<button class="ed-chip${e===l?" on":""}" data-day="${e}">${a}</button>`).join("")+'<span class="count" id="edCount"></span>';s("#edFilters").querySelectorAll("[data-day]").forEach(e=>e.onclick=()=>{l=e.dataset.day,s("#edFilters").querySelectorAll("[data-day]").forEach(a=>a.classList.toggle("on",a===e)),u()});const o=d.map(e=>({f:e,e:c(e.id)})).filter(e=>e.e.quote);if(o.length){const{f:e,e:a}=o[0];s("#edBand").innerHTML=`<div class="ed-band-in">
    <blockquote>«${a.quote}»</blockquote>
    <p class="by"><b>${a.quoteBy||e.name}</b>${e.name}${a.region?" · "+a.region:""}</p>
  </div>`}else s("#edBand").remove();u();
