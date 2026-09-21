/* ============================================================
   Ф1 — синхронизация 3D-сцены с реальным солнцем и погодой Холмогоровки.
   Спецификация: хп/КОНЦЕПЦИЯ-v3-СТРАНИЦЫ-И-ФИШКИ.md Ф1, хп/СТРУКТУРА §6.
   Астрономия считается локально (без библиотек), погода — Open-Meteo без ключа.
   Отладка/демо: ?hour=6&weather=rain&month=1
   ============================================================ */

export const GEO = { lat: 54.87, lon: 20.42, tz: 2 };   // координаты приблизительные

/* ---------- Положение солнца (упрощённый NOAA) ---------- */
export function sunPosition(date, lat = GEO.lat, lon = GEO.lon) {
  const rad = Math.PI / 180;
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const day = (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start) / 864e5;
  const utc = date.getUTCHours() + date.getUTCMinutes() / 60;

  // уравнение времени и склонение
  const g = (357.529 + 0.98560028 * (day + utc / 24)) * rad;
  const q = 280.459 + 0.98564736 * (day + utc / 24);
  const L = (q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * rad;
  const e = 23.439 * rad;
  const decl = Math.asin(Math.sin(e) * Math.sin(L));
  const eqTime = 4 * (q - 0.0057183 - (L / rad) % 360) % 60;

  const trueSolar = utc * 60 + eqTime + 4 * lon;
  const ha = (trueSolar / 4 - 180) * rad;

  const latR = lat * rad;
  const alt = Math.asin(Math.sin(latR) * Math.sin(decl) + Math.cos(latR) * Math.cos(decl) * Math.cos(ha));
  let az = Math.atan2(-Math.sin(ha), Math.tan(decl) * Math.cos(latR) - Math.sin(latR) * Math.cos(ha));
  return { altitude: alt / rad, azimuth: ((az / rad) + 360) % 360 };
}

/* ---------- Погода ---------- */
const WET = [51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99];
const SNOW = [71,73,75,77,85,86];
const FOGGY = [45,48];
const CLOUDY = [2,3];

export async function fetchWeather() {
  try {
    const u = `https://api.open-meteo.com/v1/forecast?latitude=${GEO.lat}&longitude=${GEO.lon}`
            + `&current=temperature_2m,weather_code,cloud_cover&timezone=auto`;
    const r = await fetch(u);
    if (!r.ok) return null;
    const j = await r.json();
    return { t: j.current.temperature_2m, code: j.current.weather_code, clouds: j.current.cloud_cover ?? 40 };
  } catch { return null; }
}

/* ---------- Состояние неба: что применить к сцене ---------- */
export function skyState({ date = new Date(), weather = null, override = {} } = {}) {
  const q = new URLSearchParams(location.search);
  const hourQ = override.hour ?? (q.has('hour') ? +q.get('hour') : null);
  const monthQ = override.month ?? (q.has('month') ? +q.get('month') : null);
  const wQ = override.weather ?? q.get('weather');

  const d = new Date(date);
  if (hourQ !== null) d.setHours(hourQ, 0, 0, 0);
  if (monthQ !== null) d.setMonth(monthQ - 1, 15);

  const { altitude, azimuth } = sunPosition(d);
  const code = wQ === 'rain' ? 63 : wQ === 'snow' ? 73 : wQ === 'fog' ? 45
             : wQ === 'clear' ? 0 : (weather?.code ?? 1);
  const clouds = wQ ? (wQ === 'clear' ? 5 : 90) : (weather?.clouds ?? 35);

  const wet = WET.includes(code), snow = SNOW.includes(code),
        foggy = FOGGY.includes(code), cloudy = CLOUDY.includes(code) || clouds > 60;

  // фазы суток
  const night = altitude < -4;
  const twilight = altitude >= -4 && altitude < 3;
  const golden = altitude >= 3 && altitude < 14;

  /* Палитры неба — от брендового сливочного к ночному.
     Держим в рамках айдентики: тёплые кремовые днём, синие ночью. */
  let sky, fog, sunColor, sunI, hemiSky, hemiGround, hemiI, exposure;
  if (night) {
    sky = ['#101725', '#182236', '#243149']; fog = '#1a2334';
    sunColor = 0x9fb4d8; sunI = 0.35; hemiSky = 0x2a3b5c; hemiGround = 0x14100c; hemiI = 0.45; exposure = 0.85;
  } else if (twilight) {
    sky = ['#2b3550', '#7a6a68', '#d9a06a']; fog = '#8a7a6c';
    sunColor = 0xffb073; sunI = 1.1; hemiSky = 0x6b7ea6; hemiGround = 0x352a1e; hemiI = 0.6; exposure = 0.98;
  } else if (golden) {
    sky = ['#cfd8e6', '#f0d9b6', '#f7ead6']; fog = '#e7d3b6';
    sunColor = 0xffd9a0; sunI = 2.3; hemiSky = 0xbfd2ee; hemiGround = 0x4a3d2b; hemiI = 0.5; exposure = 1.05;
  } else {
    sky = ['#e9dfce', '#f2ebdd', '#faf5ec']; fog = '#ece1d5';
    sunColor = 0xfff2e0; sunI = 2.6; hemiSky = 0xcfe0ff; hemiGround = 0x4a3d2b; hemiI = 0.55; exposure = 1.06;
  }

  // погода поверх фазы
  let fogMul = 1, shadows = true;
  if (cloudy) { sunI *= 0.55; hemiI *= 1.25; fogMul = 1.5; exposure *= 0.96; sky = grey(sky, .35); fog = mixHex(fog, '#c9c3bb', .4); }
  if (wet)    { sunI *= 0.35; fogMul = 2.1; exposure *= 0.9; shadows = false; sky = grey(sky, .55); fog = mixHex(fog, '#9aa0a6', .55); }
  if (snow)   { sunI *= 0.6; fogMul = 1.9; hemiGround = 0xd8d8d8; sky = grey(sky, .3); fog = mixHex(fog, '#e8ecf0', .6); }
  if (foggy)  { fogMul = 3.4; sunI *= 0.45; shadows = false; fog = mixHex(fog, '#d6d2cb', .7); }

  return {
    date: d, altitude, azimuth, code, clouds,
    phase: night ? 'night' : twilight ? 'twilight' : golden ? 'golden' : 'day',
    sky, fog, sunColor, sunI, hemiSky, hemiGround, hemiI, exposure, fogMul, shadows,
    label: describe({ night, twilight, golden, wet, snow, foggy, cloudy }),
  };
}

function describe(s) {
  if (s.foggy) return 'туман над рынком';
  if (s.snow) return 'снег';
  if (s.wet) return 'дождь';
  if (s.night) return 'ночь на подворье';
  if (s.twilight) return 'сумерки';
  if (s.golden) return 'низкое солнце';
  if (s.cloudy) return 'облачно';
  return 'солнечно';
}

/* ---------- утилиты цвета ---------- */
const hx = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const toHex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export function mixHex(a, b, p) {
  const A = hx(a), B = hx(b);
  return toHex(A.map((v, i) => v + (B[i] - v) * p));
}
const grey = (arr, p) => arr.map(c => {
  const [r, g, b] = hx(c), l = (r * .3 + g * .59 + b * .11);
  return toHex([r + (l - r) * p, g + (l - g) * p, b + (l - b) * p]);
});
