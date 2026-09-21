/* ============================================================
   «Сейчас на рынке». Главная логика — ДЕГРАДАЦИЯ ДАННЫХ:
   устаревшее «сегодня» хуже отсутствия «сегодня».
   Спецификация: хп/КОНТЕНТ-МОДЕЛЬ-И-CMS.md §7, хп/СТРУКТУРА-ВСЕХ-СТРАНИЦ §4.1
   ============================================================ */
import './now.css';
import { farmers, products, events, byId, farmerById, CAT } from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const pad = n => String(n).padStart(2, '0');

/* Расписание-фолбэк: используется, когда живых данных нет или они устарели */
const SCHEDULE = { open: 10, close: 20, days: 'ежедневно' };

/* Холмогоровка, Зеленоградский р-н (координаты приблизительные — уточнить у заказчика) */
const GEO = { lat: 54.87, lon: 20.42 };
const ROUTE_URL = 'https://yandex.ru/maps/?text=' +
  encodeURIComponent('Холмогоровка, Зеленоградский район, фермерский рынок');

/* ---------- 1. Загрузка живых данных ---------- */
let fromCache = false;
async function loadToday() {
  try {
    const r = await fetch('./api/today.json', { cache: 'no-store' });
    if (!r.ok) throw new Error(r.status);
    fromCache = r.headers.get('X-From-Cache') === '1';   // отдал service worker без сети
    return await r.json();
  } catch {
    return null;                     // ошибку пользователю не показываем (§5.3 структуры)
  }
}

/* ---------- 2. Свежесть → режим отображения ---------- */
function freshness(data) {
  if (!data?.updated_at) return 'none';
  const hours = (Date.now() - new Date(data.updated_at).getTime()) / 36e5;
  if (hours < 6) return 'live';        // полный режим
  if (hours < 20) return 'partial';    // без «привезли» и загруженности
  if (hours < 48) return 'stale';      // живые блоки скрыты
  return 'none';                       // обычная страница «часы и как добраться»
}

/* ---------- 3. Статус открытия (из расписания, не из данных) ---------- */
function openState() {
  const now = new Date(), h = now.getHours() + now.getMinutes() / 60;
  const isOpen = h >= SCHEDULE.open && h < SCHEDULE.close;
  let note;
  if (isOpen) {
    const left = SCHEDULE.close - h;
    note = left < 0.5 ? 'закрываемся, успевайте'
         : `до закрытия ${Math.floor(left)} ч ${pad(Math.round((left % 1) * 60))} мин`;
  } else {
    const till = h < SCHEDULE.open ? SCHEDULE.open - h : 24 - h + SCHEDULE.open;
    note = `откроемся через ${Math.floor(till)} ч ${pad(Math.round((till % 1) * 60))} мин`;
  }
  return { isOpen, note };
}

/* ---------- 4. Погода (Open-Meteo, без ключа) + погодный CTA (Ф4) ---------- */
const WEATHER_TEXT = {
  0:'ясно', 1:'почти ясно', 2:'переменная облачность', 3:'облачно', 45:'туман', 48:'туман',
  51:'морось', 53:'морось', 55:'морось', 61:'дождь', 63:'дождь', 65:'сильный дождь',
  71:'снег', 73:'снег', 75:'сильный снег', 80:'ливень', 81:'ливень', 82:'ливень',
  95:'гроза', 96:'гроза',
};
async function weather() {
  try {
    const u = `https://api.open-meteo.com/v1/forecast?latitude=${GEO.lat}&longitude=${GEO.lon}`
            + `&current=temperature_2m,weather_code&timezone=Europe%2FKaliningrad`;
    const r = await fetch(u);
    if (!r.ok) return null;
    const j = await r.json();
    return { t: Math.round(j.current.temperature_2m), code: j.current.weather_code };
  } catch { return null; }
}
function weatherCTA(w) {
  if (!w) return null;
  const c = w.code;
  if ([61,63,65,80,81,82,51,53,55].includes(c)) return 'На улице дождь — привезём сами, оформите доставку.';
  if ([71,73,75].includes(c)) return 'Снег и мороз — в чайной горячий чай и свежий хлеб.';
  if (w.t >= 22) return 'Жарко — в фудкорте холодный квас и мороженое из фермерского молока.';
  if (w.t <= 3) return 'Холодно — заходите в фудкорт, там глинтвейн и печи.';
  return null;
}

/* ---------- 5. Рендер ---------- */
function renderStatus(data, mode, w) {
  const st = openState();
  $('#nowPulse').classList.toggle('off', !st.isOpen);
  $('#nowState').textContent = st.isOpen ? 'Открыто' : 'Закрыто';
  $('#nowHours').textContent = `${pad(SCHEDULE.open)}:00 — ${pad(SCHEDULE.close)}:00, ${SCHEDULE.days}`;
  $('#nowCountdown').textContent = st.note;

  $('#nowWeather').innerHTML = w
    ? `<b>${w.t > 0 ? '+' : ''}${w.t}°</b> ${WEATHER_TEXT[w.code] || ''}`
    : '';

  // Загруженность — только в полном режиме
  const crowd = (mode === 'live' && data?.crowd) ? data.crowd : null;
  $('#nowCrowd').textContent = crowd ? `сейчас ${crowd}` : '';

  // Погодный CTA важнее редакторской заметки
  const cta = weatherCTA(w);
  const note = cta || (mode !== 'stale' && mode !== 'none' && data?.note) || '';
  $('#nowNote').textContent = note ||
    'Фермерский рынок в 20 км от Калининграда по дороге к морю. Заезжайте — здесь то, что привезли утром.';

  const upd = $('#nowUpdated');
  if (mode === 'live' || mode === 'partial') {
    const d = new Date(data.updated_at);
    upd.textContent = fromCache
      ? `Нет сети — показываем сохранённое от ${pad(d.getHours())}:${pad(d.getMinutes())}`
      : `Данные дня обновлены в ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } else {
    upd.textContent = 'Показываем режим работы по расписанию.';
  }
}

function renderArrivals(data, mode) {
  const sec = $('#secArrivals');
  if (mode !== 'live' || !data.arrivals?.length) { sec.remove(); return; }
  $('#arrivals').innerHTML = data.arrivals.map(a => {
    const p = byId(products, a.product);
    if (!p) return '';
    const f = farmerById(p.farmer);
    return `<div class="arr cat-${p.cat}"><span class="dot"></span>
      <b>${p.name}</b><time>${a.time}</time>
      <span style="flex-basis:100%;font-size:12.5px;color:var(--muted)">${f ? f.name : ''}</span></div>`;
  }).join('');
  sec.classList.remove('pending');
}

function renderTraders(data, mode) {
  const sec = $('#secTraders');
  const ids = (mode === 'live' || mode === 'partial') ? (data.traders_today || []) : [];
  if (!ids.length) { sec.remove(); return; }
  $('#traders').innerHTML = ids.map(id => {
    const f = farmerById(id);
    if (!f) return '';
    return `<a class="tr cat-${f.cat}" href="/farmer.html?id=${f.id}">
      <span class="mono2">${f.initials}</span>
      <span><b>${f.name}</b><span>${f.spec}</span></span></a>`;
  }).join('');
  $('#tradersCount').textContent = `${ids.length} из ${farmers.length}`;
  sec.classList.remove('pending');
}

function renderPrices(data, mode) {
  const sec = $('#secPrices');
  const rows = (mode === 'live' || mode === 'partial') ? (data.prices_today || []) : [];
  if (!rows.length) { sec.remove(); return; }
  $('#chalkList').innerHTML = rows.map(r => {
    const p = byId(products, r.product);
    if (!p) return '';
    const changed = p.price !== r.price;
    return `<div class="chalk-row ${changed ? 'was' : ''}">
      <span class="nm">${p.name}</span><span class="ln"></span>
      <span class="pr">${r.price.toLocaleString('ru-RU')} ₽ / ${p.unit}</span></div>`;
  }).join('');
  sec.classList.remove('pending');
}

function renderEvent() {
  const next = [...events][0];
  if (!next) { $('#secEvent').remove(); return; }
  $('#evDate').textContent = `${next.date}, ${next.day}`;
  $('#evTitle').textContent = next.title;
  $('#evDesc').textContent = next.desc;
  $('#evTime').textContent = next.time;
  $('#evLink').href = `/event.html?id=${next.id}`;
}

function renderTelemetry(data, mode) {
  const sec = $('#secTelemetry');
  const t = (mode === 'live' && data.telemetry) ? data.telemetry : null;
  if (!t) { sec.remove(); return; }
  const map = { milk: '#tMilk', bread: '#tBread', farms: '#tFarms', waste: '#tWaste' };
  Object.entries(map).forEach(([k, sel]) => {
    const n = $(sel);
    if (n) n.dataset.count = t[k] ?? 0;
  });
  sec.classList.remove('pending');
}

/* ---------- 6. Старт ---------- */
(async function init() {
  $('#routeBtn').href = ROUTE_URL;
  $('#routeBtn2').href = ROUTE_URL;

  const [data, w] = await Promise.all([loadToday(), weather()]);
  const mode = freshness(data);
  document.body.dataset.freshness = mode;      // для отладки и автотестов

  renderStatus(data, mode, w);
  if (data) {
    renderArrivals(data, mode);
    renderTraders(data, mode);
    renderPrices(data, mode);
    renderTelemetry(data, mode);
  } else {
    ['#secArrivals', '#secTraders', '#secPrices', '#secTelemetry']
      .forEach(s => { const n = $(s); if (n) n.remove(); });
  }
  renderEvent();

  // счётчики телеметрии инициализируем после подстановки чисел
  const { initCounters, initReveal } = await import('./motion.js');
  initCounters(); initReveal();

  // статус пересчитываем каждую минуту — страница живёт без перезагрузки
  setInterval(() => renderStatus(data, mode, w), 60000);
})();
