/* Фудкорт — кухни, меню дня меловой доской, стоп-лист, свободные места.
   Меню и места — из контура B (today.json); нет данных → постоянное меню (§4.1 структуры). */
import './wave2.css';
import { kitchens, foodcourtToday, CAT } from './data.js';

const $ = (s, r = document) => r.querySelector(s);

$('#fcKitchens').innerHTML = kitchens.map(k => `
  <article class="kitchen cat-${k.cat}">
    <div class="k-top"><h3>${k.name}</h3></div>
    <div class="k-b">
      <p style="color:var(--muted)">${k.desc}</p>
      <p class="k-hit">Берут чаще всего: ${k.hit}</p>
      <div class="k-meta"><span>${k.hours}</span><span>${k.price}</span></div>
    </div>
  </article>`).join('');

/* Меню дня: пробуем живые данные, иначе — постоянное меню */
(async function menu() {
  let live = null;
  try {
    const r = await fetch('./api/today.json', { cache: 'no-store' });
    if (r.ok) {
      const j = await r.json();
      const fresh = j.updated_at && (Date.now() - new Date(j.updated_at)) / 36e5 < 20;
      if (fresh && j.foodcourt_menu) live = j.foodcourt_menu;
    }
  } catch { /* молча: ошибку показывать незачем */ }

  const list = live || foodcourtToday.menu;
  $('#fcMenu').innerHTML = list.map(item => {
    const [name, price] = String(item).split('—').map(s => s.trim());
    return `<div class="chalk-row"><span class="nm">${name}</span><span class="ln"></span>
      <span class="pr">${price || ''}</span></div>`;
  }).join('');
  $('#fcMenuNote').textContent = live
    ? 'Меню на сегодня, обновлено кухней.'
    : 'Постоянное меню. Блюда дня появятся, когда кухня их отметит.';

  if (foodcourtToday.stop?.length) {
    $('#fcStop').textContent = 'Сегодня нет: ' + foodcourtToday.stop.join(', ');
  } else $('#fcStop').hidden = true;
})();

/* Свободные места */
const s = foodcourtToday.seats;
if (s) {
  const busy = Math.round((1 - s.free / s.total) * 100);
  $('#fcSeats').innerHTML = `
    <b>${s.free}</b><span style="color:var(--muted)">свободных мест из ${s.total}</span>
    <span class="bar"><i style="width:${100 - busy}%"></i></span>
    <span style="color:var(--muted);font-size:13px">${busy > 80 ? 'почти всё занято' : busy > 50 ? 'людно' : 'свободно'}</span>`;
} else $('#fcSeatsWrap').hidden = true;
