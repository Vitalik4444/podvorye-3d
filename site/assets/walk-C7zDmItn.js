import{w as i}from"./data-CrZn-biY.js";import"./motion-CbHFGzZ6.js";/* empty css              */const n=(a,t=document)=>t.querySelector(a);n("#walkChs").innerHTML=i.map((a,t)=>`
  <a class="walk-ch cat-${a.cat}" href="/index.html?goto=${a.target}&inside=1">
    <span class="n">${String(t+1).padStart(2,"0")}</span>
    <span><b>${a.title}</b><p>${a.text}</p></span>
    <span class="go">Войти сюда →</span>
  </a>`).join("");const e=navigator.connection&&(navigator.connection.saveData||/2g/.test(navigator.connection.effectiveType||""));(e||innerWidth<760)&&(n("#walkWarn").hidden=!1,e&&(n("#walkWarn").textContent="У вас включена экономия трафика. Прогулка загрузит около 8 МБ — лучше на Wi-Fi. Ниже есть текстовая версия."));
