/* ============================================================
   Ф27 «Звук рынка». Правила из спецификации (§6 структуры):
   по умолчанию ВЫКЛЮЧЕН, состояние помнится, глобальный mute,
   автопауза при уходе со вкладки, один AudioContext на сайт.

   Файлы кладутся в public/audio/ (ambient.opus, grill.opus, …).
   Если файлов нет — кнопка не показывается вовсе: молчащий переключатель
   хуже отсутствующего. Лицензии на звук — в фотобрифе §2.6.
   ============================================================ */

const KEY = 'hp_sound';
const SOURCES = {
  ambient: './audio/ambient.opus',      // гул зала, голоса
  grill:   './audio/grill.opus',        // фудкорт
  smoke:   './audio/smokehouse.opus',   // коптильня
};

let ctx = null, gain = null, buffers = {}, playing = new Map(), ready = false;

export const enabled = () => localStorage.getItem(KEY) === '1';

async function ensureCtx() {
  if (ctx) return ctx;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  gain = ctx.createGain();
  gain.gain.value = 0.0;
  gain.connect(ctx.destination);
  return ctx;
}

async function load(name) {
  if (buffers[name]) return buffers[name];
  const url = SOURCES[name];
  if (!url) return null;
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const ab = await r.arrayBuffer();
    buffers[name] = await ctx.decodeAudioData(ab);
    return buffers[name];
  } catch { return null; }
}

/* Есть ли звуковые файлы — говорит сборка через <meta name="hp-audio">.
   Раньше здесь был HEAD-запрос, который при отсутствии файлов давал 404
   в консоли на каждой загрузке (аудит: единственная ошибка на сайте). */
export async function available() {
  const meta = document.querySelector('meta[name="hp-audio"]');
  if (meta) return meta.content === '1';
  try {                                  // если метки нет — старое поведение
    const r = await fetch(SOURCES.ambient, { method: 'HEAD' });
    return r.ok;
  } catch { return false; }
}

export async function play(name = 'ambient', { loop = true, volume = 1 } = {}) {
  if (!enabled()) return;
  await ensureCtx();
  if (ctx.state === 'suspended') await ctx.resume();
  const buf = await load(name);
  if (!buf) return;
  stop(name);
  const src = ctx.createBufferSource();
  const g = ctx.createGain();
  g.gain.value = volume;
  src.buffer = buf; src.loop = loop;
  src.connect(g); g.connect(gain);
  src.start();
  playing.set(name, { src, g });
  ready = true;
  fade(0.5, 900);
}

export function stop(name) {
  const p = playing.get(name);
  if (!p) return;
  try { p.src.stop(); } catch {}
  playing.delete(name);
}
export function stopAll() { [...playing.keys()].forEach(stop); }

function fade(to, ms) {
  if (!gain) return;
  const now = ctx.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(to, now + ms / 1000);
}

export async function toggle() {
  const on = !enabled();
  localStorage.setItem(KEY, on ? '1' : '0');
  if (on) await play('ambient');
  else { fade(0, 400); setTimeout(stopAll, 450); }
  render();
  return on;
}

/* Автопауза, когда вкладка не активна */
document.addEventListener('visibilitychange', () => {
  if (!ready) return;
  if (document.hidden) fade(0, 250);
  else if (enabled()) fade(0.5, 600);
});

/* ---------- Кнопка ---------- */
const WAVE = `<svg viewBox="0 0 24 16" width="20" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
  <path d="M2 8h2M7 4v8M12 2v12M17 5v6M22 8h0"/></svg>`;

function render() {
  const btn = document.getElementById('soundBtn');
  if (!btn) return;
  const on = enabled();
  btn.classList.toggle('on', on);
  btn.setAttribute('aria-pressed', String(on));
  btn.title = on ? 'Выключить звук рынка' : 'Включить звук рынка';
  btn.querySelector('span').textContent = on ? 'Звук рынка включён' : 'Звук рынка';
}

export async function mountButton() {
  if (!await available()) return false;      // нет файлов — нет кнопки
  const btn = document.createElement('button');
  btn.id = 'soundBtn';
  btn.className = 'sound-btn';
  btn.innerHTML = `${WAVE}<span>Звук рынка</span>`;
  btn.onclick = toggle;
  document.body.appendChild(btn);
  render();
  if (enabled()) play('ambient');
  return true;
}
