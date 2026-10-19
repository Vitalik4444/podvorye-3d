import{n as m,o as c,q as g}from"./data-CrZn-biY.js";import"./motion-CbHFGzZ6.js";/* empty css              */const e=(t,a=document)=>a.querySelector(t);let l="all";const i=t=>g[t.slug]||{rubric:t.cat||"Продукт",accent:"bread"},d={"kak-vybrat-klubniku":"🍓","sekrety-sozrevaniya-syra":"🧀","semja-plotnikovyh":"🐄","retsept-syrnika":"🥞"};function b(t,a=!1){const s=i(t);return`<a class="jr-card cat-${s.accent}" href="/article.html?slug=${t.slug}">
    <div class="jr-cover">${d[t.slug]||"🌾"}</div>
    <div class="jr-meta">${s.rubric}<span>${t.read}</span></div>
    <h3>${t.title}</h3>
    <p>${t.excerpt}</p>
  </a>`}function o(){var u;const t=l==="all"?c:c.filter(r=>i(r).rubric===l),a=l==="all"?t[0]:null,s=a?t.slice(1):t;if(e("#jrLead").hidden=!a,a){const r=i(a);e("#jrLead").className=`jr-lead cat-${r.accent}`,e("#jrLead").innerHTML=`
      <a class="jr-cover" href="/article.html?slug=${a.slug}">${d[a.slug]||"🌾"}</a>
      <div>
        <div class="jr-meta">${r.rubric}<span>${a.date}</span><span>${a.read}</span></div>
        <h2 class="sect-t" style="margin:10px 0 14px">${a.title}</h2>
        <p class="lead" style="color:var(--muted)">${a.excerpt}</p>
        <a class="btn btn-ghost" href="/article.html?slug=${a.slug}" style="margin-top:20px">Читать материал</a>
      </div>`}const n=e("#jrGrid");n.className=(c.length<6,"jr-grid"),n.innerHTML=s.length?s.map(r=>b(r)).join(""):`<p style="color:var(--muted)">В рубрике «${l}» пока нет материалов.
       <a href="#" data-all style="color:var(--brown);font-weight:700">Показать все</a></p>`,(u=n.querySelector("[data-all]"))==null||u.addEventListener("click",r=>{r.preventDefault(),l="all",o()}),e("#jrRubrics").querySelectorAll("button").forEach(r=>r.classList.toggle("on",r.dataset.rub===l))}e("#jrRubrics").innerHTML=[["all","Все материалы"],...m.map(t=>[t,t])].map(([t,a])=>`<button data-rub="${t}">${a}</button>`).join("");e("#jrRubrics").querySelectorAll("button").forEach(t=>t.onclick=()=>{l=t.dataset.rub,o()});e("#jrIssue").textContent=`Выпуск №1 · ${c.length} материалов`;o();
