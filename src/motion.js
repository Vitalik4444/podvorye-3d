/* ============================================================
   Motion-слой v3. Спецификация: хп/ДИЗАЙН-СИСТЕМА-v3-И-MOTION.md §8
   Правила: анимируем только transform/opacity; reveal однократный;
   при обратном скролле ничего не проигрывается заново; reduced-motion всё гасит.
   ============================================================ */

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Reveal: однократное появление (правило 3 и 4) ---------- */
export function initReveal(root = document) {
  const items = root.querySelectorAll('.rv, .rv-stagger');
  if (!items.length) return;
  if (reduced()) { items.forEach(n => n.classList.add('in')); return; }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const n = e.target;
      // stagger задаём переменной, а не таймерами — так дешевле и не ломается при быстром скролле
      if (n.classList.contains('rv-stagger')) {
        [...n.children].forEach((ch, i) => ch.style.transitionDelay = `${i * 60}ms`);
      }
      n.classList.add('in');
      io.unobserve(n);                     // однократно
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  items.forEach(n => io.observe(n));
}

/* ---------- Счётчики: числа набегают один раз (сцена 4) ---------- */
export function initCounters(root = document) {
  const nodes = root.querySelectorAll('[data-count]');
  if (!nodes.length) return;
  if (reduced()) { nodes.forEach(n => n.textContent = fmt(+n.dataset.count)); return; }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const n = e.target, to = +n.dataset.count || 0, dur = 900, t0 = performance.now();
      const step = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);          // ease-out-cubic
        n.textContent = fmt(Math.round(to * eased));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      io.unobserve(n);
    });
  }, { threshold: 0.4 });
  nodes.forEach(n => io.observe(n));
}
const fmt = v => v.toLocaleString('ru-RU');

/* ---------- Штамп вместо тоста (Ф12) ---------- */
const STAMP_SVG = `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3">
  <circle cx="50" cy="50" r="44" stroke-dasharray="4 5" opacity=".8"/>
  <circle cx="50" cy="50" r="35"/>
  <path d="M50 30l7.5 7.5L50 45l-7.5-7.5z" fill="currentColor" stroke="none"/>
  <path d="M32 58h36M38 66h24" stroke-linecap="round"/>
</svg>`;

export function stampAt(x, y) {
  if (reduced()) return;
  const s = document.createElement('div');
  s.className = 'stamp';
  s.innerHTML = STAMP_SVG;
  s.style.left = x + 'px';
  s.style.top = y + 'px';
  document.body.appendChild(s);
  requestAnimationFrame(() => s.classList.add('go'));
  s.addEventListener('animationend', () => s.remove(), { once: true });
  if (navigator.vibrate) navigator.vibrate(12);
}

/* Перехватываем все кнопки добавления в корзину — штамп ставится в точке клика */
export function initStamp() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add], #pAdd, [data-add-all]');
    if (!btn) return;
    stampAt(e.clientX || innerWidth / 2, e.clientY || innerHeight / 2);
  }, true);   // capture: срабатывает до обработчиков site.js
}

/* ---------- Прогресс чтения (для лонгридов и статей) ---------- */
export function initReadProgress(bar) {
  if (!bar) return;
  const onScroll = () => {
    const h = document.documentElement;
    const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    bar.style.transform = `scaleX(${p})`;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------- Единая инициализация ---------- */
export function initMotion() {
  initReveal();
  initCounters();
  initStamp();
  initReadProgress(document.querySelector('[data-read-progress]'));
}
