/* ============================================================
   Сцена 2: скролл = ход часов. Одна rAF-петля, только opacity и цвет слоя.
   GSAP не нужен — 40 КБ ради шести кросс-фейдов не оправданы.
   Спецификация: хп/ДИЗАЙН-СИСТЕМА-v3-И-MOTION.md §8.3
   ============================================================ */
import './morning.css';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Главы: время в минутах от полуночи + температура света для этого времени */
const CH = [
  { t: 5 * 60 + 40, tint: '#1b2436' },   // синие сумерки
  { t: 6 * 60 + 20, tint: '#33384a' },
  { t: 7 * 60,      tint: '#6b5236' },   // первое тепло
  { t: 8 * 60,      tint: '#a8703c' },   // золото
  { t: 9 * 60,      tint: '#c89b5c' },
  { t: 12 * 60,     tint: '#f0e4d2' },   // ровный день
];

const frames = [...document.querySelectorAll('.mg-frame')];
const tint = document.querySelector('.mg-tint');
const clockH = document.querySelector('.mg-clock b');
const clockL = document.querySelector('.mg-clock span');
const bar = document.querySelector('.mg-progress');
const chapters = [...document.querySelectorAll('.mg-ch')];

const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, p) => {
  const A = hex(a), B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * p)).join(',')})`;
};
const pad = n => String(n).padStart(2, '0');

/* Статичный режим: кадры в потоке, никакой сцены */
if (reduced) {
  document.body.classList.add('mg-static');
  clockH.textContent = '5:40';
  clockL.textContent = 'утро на рынке';
} else {
  let raf = 0;
  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - doc.clientHeight);
      const p = Math.min(1, Math.max(0, doc.scrollTop / max));

      bar.style.transform = `scaleX(${p})`;

      /* Позиция внутри последовательности глав */
      const pos = p * (CH.length - 1);
      const i = Math.min(CH.length - 2, Math.floor(pos));
      const local = pos - i;

      /* Кросс-фейд кадров: активен ближайший, чтобы не держать 6 слоёв видимыми */
      const active = local < 0.5 ? i : i + 1;
      frames.forEach((f, k) => f.classList.toggle('on', k === active));

      /* Температура света — непрерывная интерполяция */
      tint.style.background = mix(CH[i].tint, CH[i + 1].tint, local);

      /* Часы: время между главами тикает по-настоящему */
      const mins = Math.round(CH[i].t + (CH[i + 1].t - CH[i].t) * local);
      clockH.textContent = `${Math.floor(mins / 60)}:${pad(mins % 60)}`;
      clockL.textContent = mins < 7 * 60 ? 'ещё темно'
        : mins < 8 * 60 ? 'рассвет'
        : mins < 10 * 60 ? 'открываемся'
        : 'полдень';
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
}

/* Появление текста глав — однократно, порог 25% (текст не должен «выпрыгивать»).
   Наблюдаем секцию, а класс ставим на внутренний блок. */
if (!reduced) {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.querySelector('.mg-in')?.classList.add('in');
    io.unobserve(e.target);
  }), { threshold: 0.25 });
  chapters.forEach(c => { c.querySelector('.mg-in')?.classList.add('rv'); io.observe(c); });
}
