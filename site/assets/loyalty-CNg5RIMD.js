const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./motion-CbHFGzZ6.js","./data-CrZn-biY.js","./data-DC2IB6Qn.css","./motion-BgzMMeez.css"])))=>i.map(i=>d[i]);
import"./data-CrZn-biY.js";import"./motion-CbHFGzZ6.js";import{_ as p}from"./preload-helper-C1FmrZbK.js";/* empty css              */import{l as a}from"./data2-BFUUepxa.js";const o=(t,e=document)=>e.querySelector(t),l="hp_stamps",r=12,d=`<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4">
  <circle cx="50" cy="50" r="40" stroke-dasharray="5 6" opacity=".7"/>
  <path d="M50 28l9 9-9 9-9-9z" fill="currentColor" stroke="none"/>
  <path d="M31 60h38M38 70h24" stroke-linecap="round"/></svg>`,i=()=>Math.min(r,+(localStorage.getItem(l)||0)),c=t=>{localStorage.setItem(l,String(Math.max(0,Math.min(r,t)))),m()};function m(){const t=i();o("#stGrid").innerHTML=Array.from({length:r},(s,n)=>`<div class="stamp-cell ${n<t?"filled":""}">${n<t?d:""}</div>`).join(""),o("#stCount").textContent=`${t} из ${r}`,o("#stRules").innerHTML=a.map(s=>`
    <li class="${t>=s.stamps?"done":""}">
      <b>${s.stamps}</b>
      <span>${s.reward}${t>=s.stamps?" — доступно":""}</span>
    </li>`).join("");const e=a.find(s=>s.stamps>t);o("#stNext").textContent=e?`До «${e.reward.toLowerCase()}» осталось ${e.stamps-t} ${h(e.stamps-t,["штамп","штампа","штампов"])}.`:"Карточка заполнена — приходите за боксом.",o("#stReset").hidden=t===0}const h=(t,e)=>e[t%10===1&&t%100!==11?0:t%10>=2&&t%10<=4&&(t%100<10||t%100>=20)?1:2];o("#stAdd").onclick=t=>{c(i()+1),p(()=>import("./motion-CbHFGzZ6.js"),__vite__mapDeps([0,1,2,3]),import.meta.url).then(e=>e.stampAt(t.clientX,t.clientY))};o("#stReset").onclick=()=>c(0);m();
