/* Ф18 «Афиша дня» — кнопка на now.html. Собирает картинку из живых данных дня
   и отдаёт через Web Share API (на десктопе — скачиванием). */
import { posterToday, shareCanvas } from './share.js';
import { products, farmerById, events, byId } from './data.js';

const btn = document.getElementById('posterBtn');
if (btn) btn.onclick = async () => {
  btn.disabled = true;
  const prev = btn.textContent;
  btn.textContent = 'Собираем…';

  let data = null;
  try {
    const r = await fetch('./api/today.json', { cache: 'no-store' });
    if (r.ok) data = await r.json();
  } catch { /* без живых данных соберём афишу по расписанию */ }

  const fresh = data?.updated_at && (Date.now() - new Date(data.updated_at)) / 36e5 < 20;
  const d = new Date();
  const dateStr = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

  const arrivals = (fresh ? data.arrivals || [] : []).map(a => {
    const p = byId(products, a.product);
    return p ? { name: p.name, time: a.time } : null;
  }).filter(Boolean);

  const traders = (fresh ? data.traders_today || [] : []).map(id => {
    const f = farmerById(id); return f ? f.name : null;
  }).filter(Boolean);

  const next = events[0];

  const canvas = posterToday({
    date: dateStr,
    arrivals,
    traders,
    note: fresh ? (data.note || '') : 'Открыто ежедневно с 10:00 до 20:00',
    event: next ? `${next.date} · ${next.title}` : null,
  });

  const res = await shareCanvas(canvas, `podvorye-${d.toISOString().slice(0, 10)}.png`, 'Сегодня на подворье');
  btn.textContent = res === 'shared' ? 'Отправлено' : 'Скачано';
  setTimeout(() => { btn.textContent = prev; btn.disabled = false; }, 2200);
};
