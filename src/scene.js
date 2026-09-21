/* ============================================================
   3D-сцена рынка: модель, тур, скролл-камера, хотспоты, интерьер, солнце.
   Загружается динамическим импортом из home.js, поэтому three.js
   не попадает в начальный бандл главной.
   ============================================================ */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
// ускоренный raycast (для коллизий в интерьере)
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;
import { skyState, fetchWeather } from './sky.js';
import * as quest from './quest.js';
import { mountButton as mountSound } from './sound.js';
import { farmers, zones, events, CAT, products, recipes, farmerById, byId } from './data.js';
import { ISLANDS, ZONE_COLOR, ENTRANCE, AISLE_X, SPAWN } from './islands.js';

const g = id => document.getElementById(id);
const money = n => n.toLocaleString('ru-RU') + ' ₽';
const catName = c => CAT[c]?.label || '';
const catColor = c => CAT[c]?.color || 'var(--brown)';
const catTint = c => CAT[c]?.tint || 'var(--cream)';
function shade(hex, p){ const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + p * 2.55, gg = ((n >> 8) & 255) + p * 2.55, b = (n & 255) + p * 2.55;
  const c = x => Math.max(0, Math.min(255, Math.round(x)));
  return `rgb(${c(r)},${c(gg)},${c(b)})`; }

/* ============ 2. Three.js scene ============ */
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
// sky gradient background — brand cream (сливочный) to white
const sky = document.createElement('canvas'); sky.width=4; sky.height=256;
const sg = sky.getContext('2d').createLinearGradient(0,0,0,256);
sg.addColorStop(0,'#e9dfce'); sg.addColorStop(.5,'#f2ebdd'); sg.addColorStop(1,'#faf5ec');
const sctx = sky.getContext('2d'); sctx.fillStyle=sg; sctx.fillRect(0,0,4,256);
const skyTex = new THREE.CanvasTexture(sky); skyTex.colorSpace = THREE.SRGBColorSpace;
scene.background = skyTex;
scene.fog = new THREE.Fog(0xece1d5, 1, 100);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;

const camera = new THREE.PerspectiveCamera(48, innerWidth/innerHeight, 0.1, 200000);
window.__cam = camera;
window.__set = (px,py,pz,tx,ty,tz)=>{ controls.enabled=false; stopTour(); tween=null;
  camera.position.set(px,py,pz); controls.target.set(tx,ty,tz); camera.lookAt(tx,ty,tz); };
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxPolarAngle = Math.PI*0.495; // don't go under ground

const sun = new THREE.DirectionalLight(0xfff2e0, 2.6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.bias = -0.0004;
scene.add(sun, sun.target);
const hemi = new THREE.HemisphereLight(0xcfe0ff, 0x4a3d2b, 0.55);
scene.add(hemi);

/* ============ Ф1: реальное солнце и погода Холмогоровки ============
   Считаем положение солнца локально, погоду тянем с Open-Meteo (без ключа).
   Сцена меняется по времени суток и погоде: свет, туман, небо, экспозиция. */
let skyReady = false, weatherNow = null, skyNow = null;
const isSmall = matchMedia('(max-width: 900px)').matches;   // на мобильных тени отключаем

function applySky(){
  if(!skyReady || !model) return;
  const st = skyState({ weather: weatherNow });
  skyNow = st;

  // небо: перерисовываем градиент в тот же canvas
  const grad = sctx.createLinearGradient(0,0,0,256);
  grad.addColorStop(0, st.sky[0]); grad.addColorStop(.5, st.sky[1]); grad.addColorStop(1, st.sky[2]);
  sctx.fillStyle = grad; sctx.fillRect(0,0,4,256);
  skyTex.needsUpdate = true;

  // туман: цвет и плотность (дальность) — дождь и туман «сжимают» сцену
  if(scene.fog){
    scene.fog.color.set(st.fog);
    scene.fog.near = maxDim*1.6 / st.fogMul;
    scene.fog.far  = maxDim*6   / st.fogMul;
  }

  // солнце: азимут/высота → положение на небесной сфере вокруг сцены
  const R = maxDim*1.8;
  const alt = Math.max(-8, st.altitude) * Math.PI/180;
  const az  = (st.azimuth) * Math.PI/180;
  sun.position.set(
    center.x + R*Math.cos(alt)*Math.sin(az),
    bbox.min.y + Math.max(maxDim*0.08, R*Math.sin(alt)),
    center.z + R*Math.cos(alt)*Math.cos(az)
  );
  sun.color.set(st.sunColor);
  sun.intensity = st.sunI;
  sun.castShadow = st.shadows && !isSmall;
  hemi.color.set(st.hemiSky); hemi.groundColor.set(st.hemiGround); hemi.intensity = st.hemiI;
  renderer.toneMappingExposure = st.exposure;

  // подпись в геро: «низкое солнце · +15°»
  const badge = document.getElementById('skyNote');
  if(badge){
    const t = weatherNow ? `${weatherNow.t > 0 ? '+' : ''}${Math.round(weatherNow.t)}°` : '';
    badge.textContent = [st.label, t].filter(Boolean).join(' · ');
    badge.hidden = false;
  }
}

(async function initSky(){
  weatherNow = await fetchWeather();
  applySky();
  setInterval(async ()=>{ weatherNow = await fetchWeather() || weatherNow; applySky(); }, 10*60*1000);
})();
window.__sky = () => skyNow;      // отладка

/* ============ 3. Load model ============ */
const ASSETS = import.meta.env.BASE_URL;   // './' — работает и в подпапке GitHub Pages
const draco = new DRACOLoader().setDecoderPath(ASSETS + 'draco/');
const loader = new GLTFLoader().setDRACOLoader(draco);

let model, bbox, center, size, maxDim, radius, groundMesh;
const KF = [];            // tour keyframes
const hotspots = [];      // {el, pos, data, type}
let tour = { playing:false, seg:0, t:0 };
let tween = null;         // camera fly-to tween
let ready = false;

const lbar = document.getElementById('lbar');
const lpct = document.getElementById('lpct');

/* ============ Модель вне критического пути (аудит §2.3) ============
   Раньше загрузка 4,2 МБ стартовала через 78 мс после первого рендера и
   конкурировала за канал. Теперь ждём, пока браузер освободится и геро окажется
   в кадре; на экономии трафика вообще не грузим до явного действия. */
function startModelLoad(){
  if(startModelLoad.done) return; startModelLoad.done = true;
  loader.load(ASSETS + 'models/market.glb', (gltf)=>{
  model = gltf.scene;
  model.rotation.x = -Math.PI/2;      // SketchUp Z-up -> Y-up
  model.updateMatrixWorld(true);
  model.traverse(o=>{
    if(o.isMesh){
      if(!o.geometry.attributes.normal) o.geometry.computeVertexNormals();
      o.castShadow = true; o.receiveShadow = true;
      if(o.material){ o.material.side = THREE.DoubleSide; o.material.envMapIntensity = 0.85; }
      o.geometry.computeBoundsTree();   // BVH для привязки хотспотов к поверхности
    }
  });
  scene.add(model);

  bbox = new THREE.Box3().setFromObject(model);
  size = bbox.getSize(new THREE.Vector3());
  center = bbox.getCenter(new THREE.Vector3());
  maxDim = Math.max(size.x, size.y, size.z);
  radius = size.length()/2;
  window.__bbox = { min:bbox.min.toArray(), max:bbox.max.toArray(), center:center.toArray(), size:size.toArray() };

  // fog + clipping to scene scale
  scene.fog.near = maxDim*1.6; scene.fog.far = maxDim*6;
  camera.near = maxDim/200; camera.far = maxDim*40; camera.updateProjectionMatrix();
  controls.maxDistance = maxDim*3.2;

  // ground
  const gTex = radialGround();
  groundMesh = new THREE.Mesh(
    new THREE.CircleGeometry(maxDim*3, 64),
    new THREE.MeshStandardMaterial({ color:0xe3d7c4, roughness:1, metalness:0, map:gTex, transparent:true })
  );
  groundMesh.rotation.x = -Math.PI/2;
  groundMesh.position.set(center.x, bbox.min.y+0.02, center.z);
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  // sun & shadow frustum
  sun.position.set(center.x - size.x*0.5, bbox.min.y + maxDim*1.5, center.z + size.z*0.4);
  sun.target.position.copy(center);
  skyReady = true; applySky();          // Ф1: как только известен масштаб — ставим реальное солнце
  const s = maxDim*0.7;
  Object.assign(sun.shadow.camera, {left:-s,right:s,top:s,bottom:-s,near:maxDim*0.05,far:maxDim*5});
  sun.shadow.camera.updateProjectionMatrix();

  buildTour();
  buildHotspots();

  // initial camera = first keyframe
  camera.position.copy(KF[0].p); controls.target.copy(KF[0].t); controls.update();

  ready = true;
  document.getElementById('loader').classList.add('hide');
  startTour();
  initScrub();          // Ф6
  quest.mount();        // Ф7
  mountSound();         // Ф27 (кнопка появится только если есть звуковые файлы)
}, (e)=>{
  if(e.total){ const p=Math.round(e.loaded/e.total*100); lbar.style.width=p+'%'; lpct.textContent='Загрузка рынка… '+p+'%'; }
}, (err)=>{ lpct.textContent='Не удалось загрузить модель'; console.error(err); });
}

/* Планировщик: сначала «холостой ход» браузера, затем видимость геро.
   На saveData/2G ждём явного клика по кнопке тура. */
(function scheduleModel(){
  const conn = navigator.connection || {};
  const thrifty = conn.saveData || /2g/.test(conn.effectiveType || '');
  const hero = document.getElementById('top');

  const kick = () => startModelLoad();
  if(thrifty){
    const btn = document.getElementById('btnTour') || document.getElementById('ctaTour');
    if(lpct) lpct.textContent = 'Экономия трафика — модель загрузится по нажатию';
    btn && btn.addEventListener('click', kick, { once:true });
    return;
  }
  const whenIdle = cb => ('requestIdleCallback' in window)
    ? requestIdleCallback(cb, { timeout: 1500 }) : setTimeout(cb, 350);

  if(hero && 'IntersectionObserver' in window){
    const io = new IntersectionObserver(es => {
      if(es.some(e => e.isIntersecting)){ io.disconnect(); whenIdle(kick); }
    }, { rootMargin: '200px' });
    io.observe(hero);
    setTimeout(() => { io.disconnect(); whenIdle(kick); }, 2500);   // страховка
  } else {
    whenIdle(kick);
  }
})();

function radialGround(){
  const c=document.createElement('canvas'); c.width=c.height=512; const x=c.getContext('2d');
  const g=x.createRadialGradient(256,256,40,256,256,256);
  g.addColorStop(0,'rgba(227,215,196,1)'); g.addColorStop(.7,'rgba(220,207,186,1)'); g.addColorStop(1,'rgba(227,215,196,0)');
  x.fillStyle=g; x.fillRect(0,0,512,512);
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t;
}

/* ============ 4. Camera tour ============ */
function P(fx,fy,fz){ // point relative to bbox: fractions can exceed [0,1]
  return new THREE.Vector3(
    center.x + (fx-0.5)*size.x,
    bbox.min.y + fy*size.y,
    center.z + (fz-0.5)*size.z
  );
}
function buildTour(){
  KF.length=0;
  const t = ()=>center.clone();
  KF.push({ p:P(1.15, 2.0, 1.35), t:center.clone().setY(center.y-size.y*0.1) }); // aerial 3/4
  KF.push({ p:P(0.5, 0.7, 1.7),  t:P(0.5,0.45,0.9) });                           // low front, facade
  KF.push({ p:P(1.7, 1.0, 0.2),  t:P(0.6,0.4,0.3) });                            // side dolly
  KF.push({ p:P(-0.5,1.1, -0.4), t:P(0.4,0.4,0.4) });                            // far corner
  // (кадр вида сверху на крышу убран из тура)

  /* Ф6: путь для скролл-камеры — общий план → двор → фасад → двери.
     Скролл первого экрана ведёт камеру по этим точкам (см. updateScrub). */
  SCRUB.length=0;
  // монотонное приближение: высота и дистанция только уменьшаются
  SCRUB.push({ p:P(1.34, 2.10, 1.80), t:center.clone().setY(center.y - size.y*0.08) });
  SCRUB.push({ p:P(1.02, 1.24, 1.58), t:P(0.62, 0.50, 1.02) });
  SCRUB.push({ p:P(0.72, 0.64, 1.34), t:P(0.52, 0.40, 0.94) });
  SCRUB.push({ p:P(0.46, 0.28, 1.14), t:P(0.40, 0.20, 0.92) });
}
const smooth = t => t*t*t*(t*(t*6-15)+10);
const _p=new THREE.Vector3(), _t=new THREE.Vector3();

/* ============ Ф6: скролл ведёт камеру (сцена 1 дизайн-системы) ============
   Скролл первого экрана = проход камеры к дверям. Высоту геро не меняем,
   поэтому вёрстка остальной страницы не затронута.
   Отключается: reduced-motion, узкий экран, первое же касание орбиты, низкий fps. */
const SCRUB = [];
const scrub = { on:false, p:0, off:false, fps:60, frames:0, t0:0 };
window.__scrubState = scrub;   // отладка/автотесты

function scrubEnabled(){
  return scrub.on && !scrub.off && SCRUB.length && mode==='exterior' && ready && !tween;
}
function initScrub(){
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced || matchMedia('(max-width: 900px)').matches) return;
  scrub.on = true;
  scrub.force = new URLSearchParams(location.search).get('scrub') === 'force';
  addEventListener('scroll', onScrubScroll, { passive:true });
  controls.addEventListener('start', ()=>{ scrub.off = true; });   // взял мышь — камера его
  onScrubScroll();
}
function onScrubScroll(){
  if(!scrub.on) return;
  scrub.p = Math.min(1, Math.max(0, scrollY / Math.max(1, innerHeight)));
}
function updateScrub(){
  if(!scrubEnabled()) return false;
  if(scrub.p <= 0.001 && tour.playing) return false;      // в самом верху отдаём кадр туру
  if(tour.playing) stopTour();
  const n = SCRUB.length - 1;
  const x = scrub.p * n;
  const i = Math.min(n - 1, Math.floor(x));
  const e = smooth(x - i);
  const a = SCRUB[i], b = SCRUB[i+1];
  camera.position.lerpVectors(a.p, b.p, e);
  controls.target.lerpVectors(a.t, b.t, e);
  camera.lookAt(controls.target);
  return true;
}
/* Деградация: если первые 2 секунды идут ниже 30 fps — выключаем сцену
   и оставляем обычный тур (правило из §8.3 дизайн-системы). */
function watchFps(dt){
  if(!scrub.on || scrub.off || scrub.force) return;   // ?scrub=force — обход для отладки
  scrub.frames++;
  if(!scrub.t0) scrub.t0 = performance.now();
  const el = performance.now() - scrub.t0;
  if(el > 2000){
    const fps = scrub.frames / (el/1000);
    scrub.fps = fps;
    // единственный флаг отключения — off (иначе состояние читается неоднозначно)
    if(fps < 30){ scrub.off = true; console.info('[scrub] отключён: fps', fps.toFixed(1)); }
    scrub.frames = 0; scrub.t0 = performance.now();
  }
}

function startTour(){ tour.playing=true; tour.seg=0; tour.t=0; setTourUI(true); }
function stopTour(){ tour.playing=false; setTourUI(false); }
function setTourUI(on){
  const b=document.getElementById('btnTour'); const c=document.getElementById('ctaTour');
  b.textContent = on?'⏸ Тур':'▶ Тур'; b.classList.toggle('playing',on);
  if(c) c.textContent = on?'⏸ Пауза тура':'▶ Смотреть 3D-тур';
}
function updateTour(dt){
  if(!tour.playing || tween) return;
  const dur = 5.2;
  tour.t += dt/dur;
  if(tour.t>=1){ tour.t-=1; tour.seg=(tour.seg+1)%KF.length; }
  const a=KF[tour.seg], b=KF[(tour.seg+1)%KF.length], e=smooth(tour.t);
  camera.position.lerpVectors(a.p,b.p,e);
  controls.target.lerpVectors(a.t,b.t,e);
  camera.lookAt(controls.target);
}

/* fly-to a point (for hotspot / card focus) */
function flyTo(targetVec){
  stopTour();
  const outward = targetVec.clone().sub(center); outward.y=0;
  if(outward.lengthSq()<1e-3) outward.set(0,0,1);
  outward.normalize();
  const pos = targetVec.clone()
    .add(outward.multiplyScalar(maxDim*0.5))
    .add(new THREE.Vector3(0, size.y*0.5, 0));
  tween = { fromP:camera.position.clone(), toP:pos, fromT:controls.target.clone(), toT:targetVec.clone(), t:0, dur:1.2 };
  controls.enabled=false;
}
function updateTween(dt){
  if(!tween) return;
  tween.t=Math.min(1,tween.t+dt/tween.dur); const e=smooth(tween.t);
  camera.position.lerpVectors(tween.fromP,tween.toP,e);
  controls.target.lerpVectors(tween.fromT,tween.toT,e);
  camera.lookAt(controls.target);
  if(tween.t>=1){ controls.enabled=true; controls.update(); tween=null; }
}

/* ============ 5. Hotspots ============ */
const hsLayer = document.getElementById('hotspots');
// привязка точки к реальной поверхности фасада (чтобы не висела в воздухе)
function snapToFacade(pos, fx, fz){
  const m=maxDim, o=new THREE.Vector3(), d=new THREE.Vector3();
  if(fx>=0.98){ o.set(bbox.max.x+m, pos.y, pos.z); d.set(-1,0,0); }
  else if(fx<=0.02){ o.set(bbox.min.x-m, pos.y, pos.z); d.set(1,0,0); }
  else if(fz>=0.98){ o.set(pos.x, pos.y, bbox.max.z+m); d.set(0,0,-1); }
  else if(fz<=0.02){ o.set(pos.x, pos.y, bbox.min.z-m); d.set(0,0,1); }
  else return pos;
  rc.set(o,d); rc.far=m*2.2;
  const hits=rc.intersectObject(model,true);
  if(hits.length) return hits[0].point.clone().addScaledVector(d, -m*0.006); // чуть перед поверхностью
  return pos;
}
function buildHotspots(){
  const make = (data,type)=>{
    const pos = snapToFacade(P(data.fx, data.fy, data.fz), data.fx, data.fz);
    const el = document.createElement(type==='farmer'?'button':'a');
    el.className = 'hs'+(type==='zone'?' hs-zone':'');
    const dotColor = type==='farmer' ? CAT[data.cat].color : '';
    el.innerHTML = `<div class="hs-dot"${dotColor?` style="background:${dotColor}"`:''}></div><div class="hs-label">${type==='farmer'?data.name:data.label}</div>`;
    el.addEventListener('click',(ev)=>{ ev.preventDefault();
      if(type==='farmer'){ heroEl.classList.add('exploring'); flyTo(pos.clone()); openPanel(data); }
      else { goInside(pos.clone()); }   // чёрный хотспот-«дверь» → внутрь рынка
    });
    hsLayer.appendChild(el);
    hotspots.push({el,pos,data,type});
  };
  farmers.forEach(f=>make(f,'farmer'));
  zones.forEach(z=>make(z,'zone'));
}
const _v = new THREE.Vector3();
function updateHotspots(){
  if(!ready || mode!=='exterior') return;
  const w=innerWidth, h=innerHeight;
  const camDir = new THREE.Vector3(); camera.getWorldDirection(camDir);
  for(const hs of hotspots){
    _v.copy(hs.pos); _v.project(camera);
    const behind = _v.z>1;
    const toPt = hs.pos.clone().sub(camera.position);
    const facing = toPt.dot(camDir)>0;
    if(behind || !facing){ hs.el.style.display='none'; continue; }
    hs.el.style.display='block';
    hs.el.style.left = (_v.x*0.5+0.5)*w+'px';
    hs.el.style.top  = (-_v.y*0.5+0.5)*h+'px';
    const dist = toPt.length();
    const scale = THREE.MathUtils.clamp(maxDim*1.4/dist, 0.55, 1.15);
    hs.el.style.opacity = THREE.MathUtils.clamp((maxDim*4-dist)/(maxDim*2),0.25,1);
    hs.el.querySelector('.hs-dot').style.transform = `scale(${scale})`;
  }
}

/* ============ 6. Farmer panel ============ */
const panel=document.getElementById('panel'), overlay=document.getElementById('overlay');
function openPanel(f){
  quest.visit(f.id);        // Ф7: дошёл до прилавка — цель закрыта
  const c = CAT[f.cat];
  document.getElementById('pHero').style.background=`linear-gradient(150deg,${c.color},${shade(c.color,-22)})`;
  document.getElementById('pMono').textContent=f.initials;
  document.getElementById('pSpec').textContent=f.spec;
  document.getElementById('pName').textContent=f.name;
  document.getElementById('pTag').textContent=f.tagline;
  document.getElementById('pStory').textContent=f.story;
  document.getElementById('pMeta').innerHTML=`<span class="chip">${c.label}</span><span class="chip">Хозяйство области</span><span class="chip">Проверено временем</span>`;
  document.getElementById('pProducts').innerHTML = (f.products&&f.products.length)
    ? `<div class="pp-head">Товары хозяйства</div><div class="pp-grid">`
      + f.products.map(pr=>`<div class="pp-card"><span class="pp-ico">${pr.icon}</span><span class="pp-info"><b>${pr.name}</b><span class="pp-price">${pr.price}</span></span></div>`).join('')
      + `</div>` : '';
  const cat=document.getElementById('pCatalog'); if(cat) cat.hidden=false;
  panel.classList.add('open'); overlay.classList.add('show'); panel.setAttribute('aria-hidden','false');
}
function closePanel(){ panel.classList.remove('open'); overlay.classList.remove('show'); panel.setAttribute('aria-hidden','true'); }
document.getElementById('pClose').onclick=closePanel;
overlay.onclick=closePanel;
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closePanel(); });

// farmer cards -> open + fly
document.getElementById('farmersGrid').addEventListener('click',e=>{
  const card=e.target.closest('[data-farmer]'); if(!card) return;
  const f=farmers.find(x=>x.id===card.dataset.farmer); if(!f) return;
  const pos=P(f.fx,f.fy,f.fz);
  document.getElementById('top').scrollIntoView({behavior:'smooth'});
  setTimeout(()=>{ flyTo(pos); openPanel(f); }, 620);
});

/* ============ 7. UI wiring ============ */
// tour buttons
document.getElementById('btnTour').onclick=()=>{ if(tour.playing){ stopTour(); }
  else { startTour(); document.querySelector('.hero').classList.remove('exploring'); } };
document.getElementById('ctaTour').onclick=()=>{ document.getElementById('top').scrollIntoView({behavior:'smooth'});
  if(tour.playing){ stopTour(); } else { startTour(); document.querySelector('.hero').classList.remove('exploring'); } };
document.getElementById('btnReset').onclick=()=>{ if(!ready)return; stopTour();
  document.querySelector('.hero').classList.remove('exploring');   // текст возвращается
  tween={fromP:camera.position.clone(),toP:KF[0].p.clone(),fromT:controls.target.clone(),toT:KF[0].t.clone(),t:0,dur:1}; controls.enabled=false; };
document.getElementById('btnHot').onclick=(e)=>{ hsLayer.classList.toggle('hidden');
  const on=!hsLayer.classList.contains('hidden'); hsLayer.style.display=on?'block':'none'; e.currentTarget.style.opacity=on?1:.6; };
// stop tour on manual interaction + уводим текст героя вправо (чтобы не мешал)
const heroEl=document.querySelector('.hero');
controls.addEventListener('start',()=>{ if(tour.playing) stopTour(); if(mode==='exterior') heroEl.classList.add('exploring'); });
// «листать вниз» — плавно уходим с 3D к контенту сайта
document.getElementById('scrollDown').onclick=()=> scrollTo({top:innerHeight, behavior:'smooth'});

// Навигация по арендаторам (выпадающий список)
const tenantsEl=document.getElementById('tenants');
document.getElementById('tenantsList').innerHTML=farmers.map(f=>`
  <li data-farmer="${f.id}"><span class="tdot" style="background:${CAT[f.cat].color}"></span>
    <span class="t-txt"><b>${f.name}</b><span>${f.spec}</span></span><span class="t-go">→</span></li>`).join('');
document.getElementById('tenantsToggle').onclick=(e)=>{ e.stopPropagation();
  const open=tenantsEl.classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', open); };
document.getElementById('tenantsList').addEventListener('click',e=>{
  const li=e.target.closest('[data-farmer]'); if(!li) return;
  const f=farmers.find(x=>x.id===li.dataset.farmer); if(!f) return;
  tenantsEl.classList.remove('open'); navigateToFarmer(f);
});
document.addEventListener('click',e=>{ if(!tenantsEl.contains(e.target)) tenantsEl.classList.remove('open'); });
function navigateToFarmer(f){
  if(mode==='interior'){ const hs=interiorHotspots.find(h=>h.data.id===f.id); if(hs){ walkToHotspot(hs); return; } }
  if(!ready) return;
  heroEl.classList.add('exploring');       // текст уезжает, чтобы не мешал
  flyTo(P(f.fx,f.fy,f.fz)); openPanel(f);
}

// header solid on scroll
const hdr=document.getElementById('hdr');
addEventListener('scroll',()=>{ hdr.classList.toggle('solid', scrollY>innerHeight*0.6); },{passive:true});

// burger / mobile nav
const nav=document.getElementById('nav'), burger=document.getElementById('burger');
burger.onclick=()=> nav.classList.toggle('mobile');
nav.addEventListener('click',e=>{ if(e.target.tagName==='A') nav.classList.remove('mobile'); });

// forms
const toast=document.getElementById('toast'), toastMsg=document.getElementById('toastMsg');
document.querySelectorAll('form[data-form]').forEach(f=>f.addEventListener('submit',e=>{
  e.preventDefault(); f.reset();
  toastMsg.textContent = f.dataset.form==='Заявка арендатора' ? 'Заявка принята — свяжемся с вами' : 'Сообщение отправлено. Спасибо!';
  toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),3200);
}));
// «Перейти в каталог» (в прототипе — заглушка; в проде — раздел «Маркетплейс»)
document.getElementById('pCatalog').onclick=()=>{
  toastMsg.textContent='Каталог товаров — в версии «Маркетплейс»';
  toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),3200);
};

// scroll reveal
const io=new IntersectionObserver((es)=>es.forEach(x=>{ if(x.isIntersecting){ x.target.classList.add('in'); io.unobserve(x.target);} }),{threshold:0.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* ============ 8. Interior walkthrough (первый лицом) ============ */
let mode='exterior';
let interior=null, interiorBox=null, interiorLoaded=false, interiorLoading=false;
const fp={ pos:new THREE.Vector3(), yaw:0, pitch:0, span:1, eyeY:0, margin:0, vel:new THREE.Vector3(), goto:null };
const keys={};
const rc=new THREE.Raycaster(); rc.firstHitOnly=true;
window.__fp=fp;
const interiorHotspots=[];
let extNear, extFar, extFov;

// interior fill light
const interiorLight=new THREE.Group();
interiorLight.add(new THREE.HemisphereLight(0xffffff,0x8a8378,0.95));
const iPoint=new THREE.PointLight(0xfff2df,0.5); interiorLight.add(iPoint);
interiorLight.visible=false; scene.add(interiorLight);

addEventListener('keydown',e=>{ if(mode==='interior'){ keys[e.code]=true;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault(); }});
addEventListener('keyup',e=>{ keys[e.code]=false; });

// look via pointer drag (interior only)
let dragging=false, lastX=0, lastY=0;
canvas.addEventListener('pointerdown',e=>{ if(mode!=='interior')return; dragging=true; lastX=e.clientX; lastY=e.clientY; });
canvas.addEventListener('pointermove',e=>{ if(mode!=='interior'||!dragging)return;
  fp.yaw -= (e.clientX-lastX)*0.0032;
  fp.pitch = THREE.MathUtils.clamp(fp.pitch-(e.clientY-lastY)*0.0032,-1.1,1.1);
  lastX=e.clientX; lastY=e.clientY; });
addEventListener('pointerup',()=>{ dragging=false; });

// mobile d-pad
const AUTO_WALK=1.6;   // множитель скорости на авто-маршруте к хотспоту
const moveBtn={f:false,b:false,l:false,r:false};
function bindMove(){ document.querySelectorAll('[data-move]').forEach(btn=>{
  const d=btn.dataset.move;
  const on=e=>{e.preventDefault();moveBtn[d]=true;}, off=e=>{e.preventDefault();moveBtn[d]=false;};
  btn.addEventListener('pointerdown',on); btn.addEventListener('pointerup',off);
  btn.addEventListener('pointerleave',off); btn.addEventListener('pointercancel',off);
}); }

function loadInterior(){
  if(interiorLoading) return Promise.resolve();
  interiorLoading=true;
  const il=document.getElementById('intLoader'); if(il) il.classList.add('on');
  return new Promise(res=>{
    loader.load(ASSETS + 'models/interior.glb',(gltf)=>{
      interior=gltf.scene;
      interior.traverse(o=>{ if(o.isMesh){ if(!o.geometry.attributes.normal)o.geometry.computeVertexNormals();
        o.material.side=THREE.DoubleSide; o.material.envMapIntensity=1.05;
        o.geometry.computeBoundsTree(); } });   // BVH для коллизий
      interior.visible=false; scene.add(interior);
      interiorBox=new THREE.Box3().setFromObject(interior);
      const isz=interiorBox.getSize(new THREE.Vector3()), ic=interiorBox.getCenter(new THREE.Vector3());
      fp.eyeY=interiorBox.min.y+isz.y*0.16;
      fp.span=Math.max(isz.x,isz.z);
      fp.margin=Math.min(isz.x,isz.z)*0.05;
      fp.diag=isz.length();
      fp.spawn=new THREE.Vector3(SPAWN.x, fp.eyeY, SPAWN.z);   // сразу за входной группой
      fp.spawnYaw=SPAWN.yaw;                                    // лицом вглубь зала
      fp.moveSpeed=fp.span*0.03;                  // шаг (×1.5 быстрее)
      fp.accel=6;                                 // сглаживание разгона/торможения
      fp.buffer=Math.min(isz.x,isz.z)*0.006;      // радиус коллизии (~0.4 м)
      fp.counterH=interiorBox.min.y+isz.y*0.045;  // высота проверки прилавков
      fp.arrive=Math.min(isz.x,isz.z)*0.025;      // радиус прибытия к точке стояния
      iPoint.position.set(ic.x, interiorBox.max.y*0.8, ic.z);
      iPoint.distance=fp.diag; iPoint.decay=0;
      buildInteriorHotspots();
      interiorLoaded=true; interiorLoading=false;
      if(il) il.classList.remove('on');
      res();
    }, undefined, (err)=>{ interiorLoading=false;
      if(il){ il.querySelector('span').textContent='Не удалось загрузить интерьер'; }
      console.error(err); res(); });
  });
}

// Плавный переход снаружи → внутрь (по чёрному хотспоту-двери)
const fadeEl=document.getElementById('fade');
function fadeOut(){ return new Promise(r=>{ fadeEl.classList.add('show'); setTimeout(r,520); }); }
function fadeIn(){ fadeEl.classList.remove('show'); }
async function goInside(zonePos){
  if(mode==='interior' || !ready) return;
  if(zonePos) flyTo(zonePos.clone());   // подлёт камеры к «двери»
  await fadeOut();                        // затемнение
  await enterInterior();                  // (лениво) грузит интерьер и переключает режим
  fadeIn();                               // проявляемся уже внутри
}

async function enterInterior(){
  if(mode==='interior' || !ready) return;
  document.getElementById('top').scrollIntoView({behavior:'smooth'});
  if(!interiorLoaded){ await loadInterior(); if(!interiorLoaded) return; }
  mode='interior'; stopTour(); tween=null; closePanel();
  controls.enabled=false;
  model.visible=false; if(groundMesh) groundMesh.visible=false;
  sun.visible=false; interior.visible=true; interiorLight.visible=true;
  scene.background=new THREE.Color(0x14110d); scene.fog=null;
  // camera params for interior
  extNear=camera.near; extFar=camera.far; extFov=camera.fov;
  // near считаем от размера сцены: модель ред.25 в метрах, прежняя была в миллиметрах,
  // поэтому прежний нижний предел «5» обрезал бы всё ближе пяти метров от камеры
  camera.near=fp.span/4000; camera.far=fp.diag*2.2; camera.fov=72; camera.updateProjectionMatrix();
  fp.pos.copy(fp.spawn); fp.yaw=fp.spawnYaw||0; fp.pitch=0; fp.vel.set(0,0,0); fp.goto=null;
  hotspots.forEach(h=>h.el.style.display='none');   // прячем внешние хотспоты
  document.querySelector('.hero').classList.add('interior-mode');
  hdr.classList.remove('solid'); hdr.classList.add('int-hidden');   // прячем шапку в прогулке
  document.getElementById('interiorUI').classList.add('on');
  document.getElementById('btnInside').classList.add('active');
}
function exitInterior(){
  if(mode!=='interior') return;
  mode='exterior';
  interior.visible=false; interiorLight.visible=false;
  interiorHotspots.forEach(h=>h.el.style.display='none');   // прячем внутренние хотспоты
  model.visible=true; if(groundMesh) groundMesh.visible=true; sun.visible=true;
  scene.background=skyTex; scene.fog=new THREE.Fog(0xece1d5, maxDim*1.6, maxDim*6);
  camera.near=extNear; camera.far=extFar; camera.fov=extFov; camera.updateProjectionMatrix();
  camera.position.copy(KF[0].p); controls.target.copy(KF[0].t); controls.enabled=true; controls.update();
  const h=document.querySelector('.hero'); h.classList.remove('interior-mode'); h.classList.remove('exploring');
  hdr.classList.remove('int-hidden'); hdr.classList.toggle('solid', scrollY>innerHeight*0.6);
  document.getElementById('interiorUI').classList.remove('on');
  document.getElementById('btnInside').classList.remove('active');
}
function applyCam(){
  fp.pos.y=fp.eyeY;
  camera.position.copy(fp.pos);
  const cp=Math.cos(fp.pitch);
  camera.lookAt(fp.pos.x+Math.sin(fp.yaw)*cp*1000, fp.pos.y+Math.sin(fp.pitch)*1000, fp.pos.z+Math.cos(fp.yaw)*cp*1000);
}
// Скольжение вдоль стен/прилавков (BVH-raycast, с проверкой на двух высотах)
const _o=new THREE.Vector3(), _d=new THREE.Vector3(), _n=new THREE.Vector3();
function collideSlide(disp){
  let move=disp.clone();
  for(let iter=0; iter<3; iter++){
    const len=move.length();
    if(len<1e-6) break;
    _d.copy(move).multiplyScalar(1/len);
    let best=null;
    for(const hy of [fp.eyeY, fp.counterH]){
      _o.set(fp.pos.x, hy, fp.pos.z);
      rc.set(_o, _d); rc.far=len+fp.buffer;
      const hits=rc.intersectObject(interior,true);
      if(hits.length && (!best || hits[0].distance<best.distance)) best=hits[0];
    }
    if(best && best.distance < len+fp.buffer){
      _n.set(0,0,0);
      if(best.face){ _n.copy(best.face.normal).transformDirection(best.object.matrixWorld); }
      _n.y=0;
      if(_n.lengthSq()<1e-6){ move.set(0,0,0); break; }
      _n.normalize();
      const into=move.dot(_n);
      if(into<0) move.addScaledVector(_n, -into); // убрать компоненту «в стену» → скольжение
      else break;
    } else break;
  }
  return move;
}
function angleDiff(a,b){ let d=a-b; while(d>Math.PI)d-=2*Math.PI; while(d<-Math.PI)d+=2*Math.PI; return d; }
function lerpAngle(a,b,t){ return a - angleDiff(a,b)*t; }
function clampPos(){
  fp.pos.x=THREE.MathUtils.clamp(fp.pos.x, interiorBox.min.x+fp.margin, interiorBox.max.x-fp.margin);
  fp.pos.z=THREE.MathUtils.clamp(fp.pos.z, interiorBox.min.z+fp.margin, interiorBox.max.z-fp.margin);
}
function updateFP(dt){
  // Авто-маршрут к прилавку: центр прохода → вдоль прохода → к прилавку. Без коллизий (путь спланирован).
  if(fp.goto){
    const g=fp.goto; g.t+=dt;
    if(!g.reached){
      const target=g.wps[g.i];
      const to=target.clone().sub(fp.pos); to.y=0;
      const dist=to.length();
      if(dist<=fp.arrive){
        g.i++;
        if(g.i>=g.wps.length){ g.reached=true; }
      } else {
        const dir=to.multiplyScalar(1/dist);
        const step=Math.min(fp.moveSpeed*AUTO_WALK*dt, dist);
        const disp=collideSlide(dir.clone().multiplyScalar(step));   // огибаем столбы/прилавки (не сквозь)
        fp.pos.add(disp); clampPos();
        if(disp.length() < step*0.2){ g.stuckT=(g.stuckT||0)+dt;     // заблокированы — пропускаем точку маршрута
          if(g.stuckT>0.6){ g.i++; g.stuckT=0; if(g.i>=g.wps.length){ g.reached=true; } } }
        else g.stuckT=0;
        const isLast=(g.i===g.wps.length-1);
        const tYaw=(isLast && dist<fp.arrive*4) ? g.faceYaw : Math.atan2(dir.x,dir.z);
        fp.yaw=lerpAngle(fp.yaw, tYaw, 1-Math.exp(-7*dt));
        fp.pitch*=Math.exp(-7*dt);
      }
      if(g.t>g.limit){ g.reached=true; }
      applyCam(); return;
    } else {
      // доворачиваемся лицом к прилавку, затем открываем карточку
      fp.yaw=lerpAngle(fp.yaw, g.faceYaw, 1-Math.exp(-9*dt));
      fp.pitch*=Math.exp(-9*dt);
      applyCam();
      if(Math.abs(angleDiff(fp.yaw,g.faceYaw))<0.04 || g.t>g.limit+2){ const cb=g.onArrive; fp.goto=null; if(cb) cb(); }
      return;
    }
  }
  // Ручной ввод
  let fwd=0, strafe=0;
  if(keys['KeyW']||keys['ArrowUp']||moveBtn.f) fwd+=1;
  if(keys['KeyS']||keys['ArrowDown']||moveBtn.b) fwd-=1;
  if(keys['KeyA']||keys['ArrowLeft']||moveBtn.l) strafe-=1;
  if(keys['KeyD']||keys['ArrowRight']||moveBtn.r) strafe+=1;
  const fx=Math.sin(fp.yaw), fz=Math.cos(fp.yaw);
  const rx=-Math.cos(fp.yaw), rz=Math.sin(fp.yaw);   // право/лево исправлено
  const desired=new THREE.Vector3(fx*fwd+rx*strafe, 0, fz*fwd+rz*strafe);
  if(desired.lengthSq()>1) desired.normalize();
  desired.multiplyScalar(fp.moveSpeed);
  fp.vel.lerp(desired, 1-Math.exp(-fp.accel*dt));
  if(fp.vel.lengthSq() > 1e-6){
    const disp=collideSlide(fp.vel.clone().multiplyScalar(dt));
    fp.pos.add(disp); clampPos();
  }
  applyCam();
}
// Маршрут к прилавку: центр прохода → вдоль прохода до глубины прилавка → шаг к прилавку
function walkToHotspot(hs){
  const aisleX=AISLE_X;          // единственная сквозная полоса без островов
  const wps=[
    new THREE.Vector3(aisleX, fp.eyeY, fp.pos.z),      // выйти на центр прохода
    new THREE.Vector3(aisleX, fp.eyeY, hs.stand.z),    // идти посередине прохода
    hs.stand.clone(),                                  // подойти к прилавку
  ];
  const show = hs.data ? ()=>openPanel(hs.data) : ()=>openZonePanel(hs.island);
  // Предохранитель времени — от длины маршрута, а не фиксированные 18 с:
  // до дальних островов (специи, z ≈ -70) от входа больше 60 м.
  let len=fp.pos.distanceTo(wps[0]);
  for(let i=1;i<wps.length;i++) len+=wps[i-1].distanceTo(wps[i]);
  const limit=Math.max(18, len/(fp.moveSpeed*AUTO_WALK)*1.8+4);
  fp.goto={ wps, i:0, faceYaw:hs.faceYaw, t:0, reached:false, limit, onArrive:show };
}

// Точка стояния: обходим остров с четырёх сторон и берём ту, что не попадает
// внутрь соседнего острова. Габариты островов известны из модели, лучи не нужны.
function standPointFor(isl, gap){
  const [cx,,cz]=isl.c;
  const cand=[
    {x:isl.max[0]+gap, z:cz}, {x:isl.min[0]-gap, z:cz},
    {x:cx, z:isl.max[1]+gap}, {x:cx, z:isl.min[1]-gap},
  ];
  const blocked=(x,z)=>ISLANDS.some(o=>{
    const m=fp.buffer;
    return x>o.min[0]-m && x<o.max[0]+m && z>o.min[1]-m && z<o.max[1]+m;
  });
  const p=cand.find(c=>!blocked(c.x,c.z)) || cand[0];
  return new THREE.Vector3(p.x, fp.eyeY, p.z);
}

// Хотспоты внутри рынка — 21 зона финального альбома компоновки плюс входная
// группа. Назначения, габариты и описания взяты с листов альбома, не выдуманы.
function buildInteriorHotspots(){
  if(interiorHotspots.length) return;
  const standGap=fp.buffer*3;              // отступ от зоны в проход (~1,2 м)
  [...ISLANDS, ENTRANCE].forEach(isl=>{
    const pos=new THREE.Vector3(isl.c[0], isl.top+0.15, isl.c[2]);   // метка над зоной
    const stand=standPointFor(isl, standGap);
    const faceYaw=Math.atan2(isl.c[0]-stand.x, isl.c[2]-stand.z);    // лицом к зоне
    const color=ZONE_COLOR[isl.kind]||'#c87b3b';
    const label=isl.num ? `${isl.num} · ${isl.label}` : isl.label;
    const el=document.createElement('button');
    el.className='hs hs-int';
    el.innerHTML=`<div class="hs-dot" style="background:${color}"></div><div class="hs-label">${label}</div>`;
    el.style.display='none';
    const hsObj={el,pos,stand,faceYaw,data:null,island:isl};
    el.addEventListener('click',e=>{ e.preventDefault(); e.stopPropagation(); walkToHotspot(hsObj); });
    hsLayer.appendChild(el);
    interiorHotspots.push(hsObj);
  });
}

// Карточка зоны рынка (у острова нет арендатора — показываем назначение из проекта)
function openZonePanel(isl){
  const color=ZONE_COLOR[isl.kind]||'#c87b3b';
  const mm=v=>(v/1000).toFixed(v%1000?2:1).replace('.',',');
  document.getElementById('pHero').style.background=`linear-gradient(150deg,${color},${shade(color,-22)})`;
  document.getElementById('pMono').textContent=isl.num||'ВГ';
  document.getElementById('pSpec').textContent='Зона рынка';
  document.getElementById('pName').textContent=isl.label;
  document.getElementById('pTag').textContent = isl.dims
    ? `${mm(isl.dims[0])} × ${mm(isl.dims[1])} м · ${String(isl.area).replace('.',',')} м²`
    : 'Вход в здание';
  document.getElementById('pStory').textContent=isl.note;
  document.getElementById('pMeta').innerHTML=
    `<span class="chip">Лист ${isl.sheet}</span><span class="chip">Альбом компоновки 21.09.2026</span>`;
  document.getElementById('pProducts').innerHTML='';
  const cat=document.getElementById('pCatalog'); if(cat) cat.hidden=true;   // у зоны нет каталога
  panel.classList.add('open'); overlay.classList.add('show'); panel.setAttribute('aria-hidden','false');
}
function updateInteriorHotspots(){
  const w=innerWidth,h=innerHeight;
  const camDir=new THREE.Vector3(); camera.getWorldDirection(camDir);
  for(const hs of interiorHotspots){
    _v.copy(hs.pos); _v.project(camera);
    const toPt=hs.pos.clone().sub(camera.position);
    if(_v.z>1 || toPt.dot(camDir)<=0){ hs.el.style.display='none'; continue; }
    hs.el.style.display='block';
    hs.el.style.left=(_v.x*0.5+0.5)*w+'px';
    hs.el.style.top=(-_v.y*0.5+0.5)*h+'px';
    const dist=toPt.length();
    const scale=THREE.MathUtils.clamp(fp.span*0.10/dist,0.5,1.35);
    hs.el.querySelector('.hs-dot').style.transform=`scale(${scale})`;
    hs.el.style.opacity=THREE.MathUtils.clamp((fp.span*0.7-dist)/(fp.span*0.45),0.25,1);
  }
}

bindMove();
document.getElementById('btnInside').onclick=()=> mode==='interior'?exitInterior():enterInterior();
document.getElementById('btnExit').onclick=exitInterior;
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&mode==='interior') exitInterior(); });

/* ============ 9. Loop & resize ============ */
let heroVisible = true;
new IntersectionObserver(([e])=>{
  heroVisible = e.isIntersecting;
  // после скролла вниз главный блок возвращается в исходное состояние (с текстом + тур)
  if(!heroVisible && mode==='exterior' && ready){
    heroEl.classList.remove('exploring');
    startTour();
  }
},{threshold:0.02}).observe(document.querySelector('.hero'));

let last=performance.now();
function loop(now){
  requestAnimationFrame(loop);
  const dt=Math.min(0.05,(now-last)/1000); last=now;
  if(mode==='interior'){ updateFP(dt); renderer.render(scene,camera); updateInteriorHotspots(); return; }
  if(!heroVisible && !tween){ return; } // пауза рендера вне экрана (тур продолжится при возврате)
  watchFps(dt);
  const scrubbed = updateScrub();        // Ф6: скролл ведёт камеру, приоритет над туром
  if(!scrubbed){ updateTour(dt); controls.update(); }
  updateTween(dt);
  renderer.render(scene,camera);
  updateHotspots();
}
requestAnimationFrame(loop);

function resize(){ camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); }
addEventListener('resize',resize); resize();

/* ===== Вход по ссылке из walk.html: ?goto=<id хозяйства|зоны>&inside=1 =====
   Добавлено в волне 1 v3. Сцену не меняет — только выбирает точку входа. */
(function deepLink(){
  const q = new URLSearchParams(location.search);
  const target = q.get('goto');
  const inside = q.get('inside') === '1';
  if(q.get('quest') === '1') quest.start();      // Ф7: запуск квеста по ссылке
  if(!target && !inside) return;

  const start = () => {
    if(!ready) return false;
    stopTour();
    if(inside){                                   // сразу внутрь рынка
      const z = zones.find(z=>z.id==='entrance');
      goInside(z ? P(z.fx,z.fy,z.fz) : null).then(()=>{
        const f = farmers.find(x=>x.id===target);
        if(f) setTimeout(()=>navigateToFarmer(f), 700);
      });
      return true;
    }
    const f = farmers.find(x=>x.id===target);
    if(f){ navigateToFarmer(f); return true; }
    const z = zones.find(z=>z.id===target);
    if(z){ if(z.id==='foodcourt'||z.id==='entrance') goInside(P(z.fx,z.fy,z.fz)); else flyTo(P(z.fx,z.fy,z.fz)); return true; }
    return true;                                  // неизвестная цель — просто ничего не делаем
  };
  // модель грузится асинхронно: ждём готовности, но не дольше 20 с
  let tries = 0;
  const t = setInterval(()=>{ if(start() || ++tries>200) clearInterval(t); }, 100);
})();
