/* Ф19 «Генератор постов для арендаторов» — на join.html как аргумент при аренде:
   рынок делает контент за арендатора. Превью рисуется в тот же canvas на странице. */
import { posterProduct, shareCanvas } from './share.js';
import { products, farmerById, CAT } from './data.js';

const sel = document.getElementById('pgProduct');
const btn = document.getElementById('pgMake');
const cv = document.getElementById('pgCanvas');
const note = document.getElementById('pgNote');
if (sel && btn && cv) {
  sel.innerHTML = products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

  const draw = () => {
    const p = products.find(x => x.id === sel.value) || products[0];
    const f = farmerById(p.farmer);
    const c = posterProduct({
      product: p.name,
      price: p.price,
      unit: p.unit,
      farm: f ? f.name : 'Холмогорское подворье',
      icon: p.icon,
      accent: CAT[p.cat].color,
      claim: (p.tags && p.tags[0]) ? p.tags[0] : (f ? f.tagline : ''),
    });
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(c, 0, 0);
    cv.__src = c;
  };

  sel.onchange = draw;
  btn.onclick = async () => {
    draw();
    const res = await shareCanvas(cv.__src || cv, `podvorye-${sel.value}.png`, 'Холмогорское подворье');
    note.textContent = res === 'shared'
      ? 'Отправлено — можно публиковать.'
      : 'Картинка скачана: 1080×1350, готова для сторис и постов.';
  };
  draw();
  note.textContent = 'Превью справа. Формат 1080×1350 — подходит и для сторис, и для ленты.';
}
