/* ============================================================
   Ф7 «Квест-прогулка». Показывает ОДНУ текущую цель, а не список.
   Прогресс в localStorage, финиш → промокод. На мобильном 3 цели вместо 5.
   Отметка цели происходит из main.js при открытии панели фермера.
   ============================================================ */
import { questSteps, questPromo, farmerById } from './data.js';

const KEY = 'hp_quest';
const isSmall = matchMedia('(max-width: 760px)').matches;
const STEPS = isSmall ? questSteps.slice(0, 3) : questSteps;

const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{"done":[],"finished":false}'); } catch { return { done: [], finished: false }; } };
const save = s => localStorage.setItem(KEY, JSON.stringify(s));

let state = load(), el = null;

const current = () => STEPS.find(s => !state.done.includes(s.id));

export function mount() {
  if (document.getElementById('questPanel')) return;
  el = document.createElement('div');
  el.id = 'questPanel';
  el.className = 'quest';
  el.hidden = true;
  document.body.appendChild(el);
  render();
}

export function start() {
  state.active = true; save(state); render();
}

/* Вызывается, когда гость дошёл до прилавка и открыл карточку */
export function visit(id) {
  if (!state.active || state.finished) return;
  if (!STEPS.some(s => s.id === id) || state.done.includes(id)) return;
  state.done.push(id);
  if (state.done.length >= STEPS.length) state.finished = true;
  save(state);
  render(true);
}

function render(justScored = false) {
  if (!el) return;
  if (!state.active) { el.hidden = true; return; }
  el.hidden = false;

  const n = state.done.length, total = STEPS.length;

  if (state.finished) {
    el.innerHTML = `
      <div class="q-head"><b>Квест пройден</b><button class="q-x" aria-label="Закрыть">✕</button></div>
      <p class="q-task">Вы обошли ${total} ${total === 3 ? 'прилавка' : 'прилавков'} и узнали, как здесь всё устроено.</p>
      <div class="q-promo"><span>Промокод на кофе</span><b>${questPromo}</b></div>
      <p class="q-note">Назовите его в чайной — или примените в корзине.</p>`;
  } else {
    const step = current();
    const f = farmerById(step.id);
    el.innerHTML = `
      <div class="q-head"><b>Квест · ${n} из ${total}</b><button class="q-x" aria-label="Закрыть">✕</button></div>
      <div class="q-bar"><i style="transform:scaleX(${n / total})"></i></div>
      <p class="q-task">${step.task}</p>
      ${f ? `<p class="q-note">Ищите прилавок «${f.name}»</p>` : ''}
      ${justScored ? '<p class="q-scored">Отмечено ✓</p>' : ''}`;
  }
  el.querySelector('.q-x').onclick = () => { state.active = false; save(state); el.hidden = true; };
  if (justScored) {
    el.classList.add('pop');
    setTimeout(() => el.classList.remove('pop'), 500);
  }
}

export const isActive = () => !!state.active && !state.finished;
export const progress = () => ({ done: state.done.length, total: STEPS.length, finished: state.finished });

/* Сброс для отладки */
window.__questReset = () => { localStorage.removeItem(KEY); state = load(); render(); };
