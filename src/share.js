/* ============================================================
   Ф18 «Афиша дня» и Ф19 «Генератор постов для арендаторов».
   Canvas 1080×1350 в бренде рынка. Работает офлайн, без сервера.
   Смысл Ф19: рынок делает контент за арендатора — это аргумент при аренде места.
   ============================================================ */

const W = 1080, H = 1350;
const INK = '#1d1d1b', PAPER = '#ece1d5', BROWN = '#c87b3b', CREAM = '#f5efe4';

const F = (size, weight = 800) => `${weight} ${size}px "Golos Text", system-ui, sans-serif`;

/* Перенос по словам с автоуменьшением кегля, пока не влезет в maxLines */
function drawWrapped(ctx, text, x, y, maxW, size, lineH, maxLines = 3, weight = 900) {
  let s = size;
  for (; s > 26; s -= 4) {
    ctx.font = F(s, weight);
    const lines = wrap(ctx, text, maxW);
    if (lines.length <= maxLines) {
      lines.forEach((l, i) => ctx.fillText(l, x, y + i * (s * lineH)));
      return y + lines.length * (s * lineH);
    }
  }
  ctx.font = F(s, weight);
  wrap(ctx, text, maxW).slice(0, maxLines).forEach((l, i) => ctx.fillText(l, x, y + i * (s * lineH)));
  return y + maxLines * (s * lineH);
}
function wrap(ctx, text, maxW) {
  const words = String(text).split(' '), lines = [];
  let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; }
    else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

/* Общая рамка: бумага, зерно, орнамент, подпись подворья */
function base(ctx, accent = BROWN) {
  ctx.fillStyle = CREAM; ctx.fillRect(0, 0, W, H);

  // зерно
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = `rgba(29,29,27,${Math.random() * 0.03})`;
    ctx.fillRect(Math.random() * W, Math.random() * H, 1.5, 1.5);
  }
  // верхняя и нижняя полосы
  ctx.fillStyle = accent; ctx.fillRect(0, 0, W, 14);
  ctx.fillRect(0, H - 96, W, 96);

  // угловой орнамент (мотив из брендбука — ромб с колосьями)
  ctx.strokeStyle = accent; ctx.lineWidth = 5; ctx.lineJoin = 'round';
  const cx = W - 118, cy = 118, r = 30;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r); ctx.lineTo(cx + r, cy); ctx.lineTo(cx, cy + r); ctx.lineTo(cx - r, cy); ctx.closePath();
  ctx.moveTo(cx - r * 1.9, cy); ctx.lineTo(cx - r * 1.1, cy);
  ctx.moveTo(cx + r * 1.1, cy); ctx.lineTo(cx + r * 1.9, cy);
  ctx.stroke();

  // подпись в нижней полосе
  ctx.fillStyle = CREAM; ctx.font = F(30, 900); ctx.textBaseline = 'middle';
  ctx.fillText('ХОЛМОГОРСКОЕ ПОДВОРЬЕ', 64, H - 48);
  ctx.font = F(22, 600);
  ctx.fillText('фермерский рынок · Калининградская область', 64, H - 48 + 0);
  // (вторую строку рисуем правее, чтобы не наезжала)
  ctx.textAlign = 'right';
  ctx.font = F(22, 600);
  ctx.fillText('holmogorskoe-podvorye.ru', W - 64, H - 48);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
}

/* ---------- Ф18: афиша дня ---------- */
export function posterToday({ date, traders = [], arrivals = [], note = '', event = null }) {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  base(ctx, BROWN);

  ctx.fillStyle = BROWN; ctx.font = F(26, 800);
  ctx.fillText('СЕГОДНЯ НА ПОДВОРЬЕ', 64, 120);

  ctx.fillStyle = INK;
  let y = drawWrapped(ctx, date || 'Открыто с 10:00 до 20:00', 64, 210, W - 200, 92, 1.02, 2, 900);

  y += 40;
  if (arrivals.length) {
    ctx.fillStyle = BROWN; ctx.font = F(24, 800);
    ctx.fillText('ПРИВЕЗЛИ УТРОМ', 64, y);
    y += 20;
    ctx.fillStyle = INK;
    arrivals.slice(0, 6).forEach(a => {
      y += 56;
      ctx.font = F(38, 700);
      ctx.fillText('· ' + a.name, 64, y);
      if (a.time) {
        ctx.font = F(28, 600); ctx.fillStyle = '#6f6a63';
        ctx.textAlign = 'right'; ctx.fillText(a.time, W - 64, y); ctx.textAlign = 'left';
        ctx.fillStyle = INK;
      }
    });
    y += 60;
  }

  if (traders.length) {
    ctx.fillStyle = BROWN; ctx.font = F(24, 800);
    ctx.fillText('КТО СТОИТ', 64, y);
    ctx.fillStyle = INK;
    y = drawWrapped(ctx, traders.join(' · '), 64, y + 54, W - 128, 34, 1.3, 3, 600);
    y += 30;
  }

  if (event) {
    ctx.fillStyle = INK; ctx.fillRect(64, y, W - 128, 4); y += 50;
    ctx.fillStyle = BROWN; ctx.font = F(24, 800);
    ctx.fillText('БЛИЖАЙШЕЕ СОБЫТИЕ', 64, y);
    ctx.fillStyle = INK;
    y = drawWrapped(ctx, event, 64, y + 52, W - 128, 40, 1.25, 2, 700);
  }

  if (note) {
    ctx.fillStyle = '#6f6a63';
    drawWrapped(ctx, note, 64, Math.min(y + 60, H - 190), W - 128, 30, 1.3, 2, 600);
  }
  return c;
}

/* ---------- Ф19: пост арендатора ---------- */
export function posterProduct({ product, price, unit, farm, icon = '', accent = BROWN, claim = '' }) {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  base(ctx, accent);

  // «фото»: пока эмодзи-плашка на категорийном тинте — заменится съёмкой
  ctx.fillStyle = accent + '22';
  ctx.fillRect(64, 170, W - 128, 520);
  ctx.textAlign = 'center'; ctx.font = '260px serif';
  ctx.fillText(icon || '🌾', W / 2, 520);
  ctx.textAlign = 'left';

  ctx.fillStyle = accent; ctx.font = F(26, 800);
  ctx.fillText((farm || '').toUpperCase(), 64, 150);

  ctx.fillStyle = INK;
  let y = drawWrapped(ctx, product, 64, 800, W - 128, 84, 1.04, 3, 900);

  if (claim) {
    ctx.fillStyle = '#6f6a63';
    y = drawWrapped(ctx, claim, 64, y + 30, W - 128, 32, 1.3, 2, 600);
  }

  if (price) {
    ctx.fillStyle = INK; ctx.font = F(88, 900);
    const p = `${Number(price).toLocaleString('ru-RU')} ₽`;
    ctx.fillText(p, 64, H - 190);
    ctx.font = F(34, 600); ctx.fillStyle = '#6f6a63';
    ctx.fillText(unit ? '/ ' + unit : '', 64 + ctx.measureText(p).width + 220, H - 190);
  }
  return c;
}

/* ---------- Сохранение и «Поделиться» ---------- */
export async function shareCanvas(canvas, filename = 'podvorye.png', title = 'Холмогорское подворье') {
  const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
  const file = new File([blob], filename, { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title }); return 'shared'; } catch { /* отменили */ }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return 'downloaded';
}
