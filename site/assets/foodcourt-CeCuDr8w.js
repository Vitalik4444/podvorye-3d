import"./data-CrZn-biY.js";import"./motion-CbHFGzZ6.js";/* empty css              */import{k as d,f as c}from"./data2-BFUUepxa.js";const s=(t,n=document)=>n.querySelector(t);s("#fcKitchens").innerHTML=d.map(t=>`
  <article class="kitchen cat-${t.cat}">
    <div class="k-top"><h3>${t.name}</h3></div>
    <div class="k-b">
      <p style="color:var(--muted)">${t.desc}</p>
      <p class="k-hit">Берут чаще всего: ${t.hit}</p>
      <div class="k-meta"><span>${t.hours}</span><span>${t.price}</span></div>
    </div>
  </article>`).join("");(async function(){var i;let n=null;try{const o=await fetch("./api/today.json",{cache:"no-store"});if(o.ok){const e=await o.json();e.updated_at&&(Date.now()-new Date(e.updated_at))/36e5<20&&e.foodcourt_menu&&(n=e.foodcourt_menu)}}catch{}const p=n||c.menu;s("#fcMenu").innerHTML=p.map(o=>{const[e,r]=String(o).split("—").map(l=>l.trim());return`<div class="chalk-row"><span class="nm">${e}</span><span class="ln"></span>
      <span class="pr">${r||""}</span></div>`}).join(""),s("#fcMenuNote").textContent=n?"Меню на сегодня, обновлено кухней.":"Постоянное меню. Блюда дня появятся, когда кухня их отметит.",(i=c.stop)!=null&&i.length?s("#fcStop").textContent="Сегодня нет: "+c.stop.join(", "):s("#fcStop").hidden=!0})();const a=c.seats;if(a){const t=Math.round((1-a.free/a.total)*100);s("#fcSeats").innerHTML=`
    <b>${a.free}</b><span style="color:var(--muted)">свободных мест из ${a.total}</span>
    <span class="bar"><i style="width:${100-t}%"></i></span>
    <span style="color:var(--muted);font-size:13px">${t>80?"почти всё занято":t>50?"людно":"свободно"}</span>`}else s("#fcSeatsWrap").hidden=!0;
