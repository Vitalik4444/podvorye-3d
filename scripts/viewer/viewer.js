/* Просмотрщик 3D-модели рынка «Холмогорское подворье», редакция 26.
   Самодостаточный: модель, библиотеки и декодер Draco вшиты в этот же файл,
   поэтому страница открывается двойным кликом и работает без интернета. */
(function () {
  var T = window.THREE;
  var stage = document.getElementById('stage');
  var note = document.getElementById('note');
  var bar = document.getElementById('bar');
  var hint = document.getElementById('hint');
  var pad = document.getElementById('pad');

  var renderer = new T.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;
  stage.appendChild(renderer.domElement);

  var scene = new T.Scene();
  scene.background = new T.Color(0xece1d5);
  var camera = new T.PerspectiveCamera(55, innerWidth / innerHeight, 0.05, 400);

  var pmrem = new T.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new window.RoomEnvironment(), 0.03).texture;
  scene.add(new T.HemisphereLight(0xffffff, 0x8a8378, 1.5));
  var sun = new T.DirectionalLight(0xfff2e0, 1.9);
  sun.position.set(40, 70, 30);
  scene.add(sun);

  var controls = new window.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.maxPolarAngle = Math.PI * 0.495;

  var ext = null, extBox = null, extSize = null, extMid = null;   // фасады
  var model = null, box = null, size = null, mid = null;          // интерьер
  var interiorPending = false;
  var mode = 'orbit';

  /* ---- первое лицо ---- */
  var fp = {
    pos: new T.Vector3(), vel: new T.Vector3(), yaw: Math.PI, pitch: 0,
    eyeY: 1.67, speed: 3.4, accel: 7, buffer: 0.4, counterH: 0.5
  };
  var keys = {};
  window.__fp = fp;               // для диагностики: положение и направление взгляда
  var rc = new T.Raycaster();

  /* ---- зоны рынка ---- */
  var DATA = window.__ZONES || { zones: [], color: {}, aisle: 25.2 };
  var ZONES = DATA.zones;
  var spots = [];                 // {el, pos, stand, yaw, zone}
  var spotsLayer = document.getElementById('spots');
  var card = document.getElementById('card');
  var _o = new T.Vector3(), _d = new T.Vector3(), _n = new T.Vector3();

  function decodeBase64(b64) {
    var bin = atob(b64), len = bin.length, out = new Uint8Array(len);
    for (var i = 0; i < len; i++) out[i] = bin.charCodeAt(i);
    return out.buffer;
  }

  /* Декодер Draco лежит в этом же файле: подменяем загрузку по сети на готовые данные,
     иначе из file:// ничего не скачается. */
  var draco = new window.DRACOLoader();
  draco.setDecoderConfig({ type: 'wasm' });
  if (window.__DRACO_WASM) {
    // страница открыта с диска: из file:// декодер не скачать, отдаём вшитый
    draco._loadLibrary = function (url, responseType) {
      if (responseType === 'arraybuffer') return Promise.resolve(decodeBase64(window.__DRACO_WASM));
      return Promise.resolve(atob(window.__DRACO_JS));
    };
  } else {
    draco.setDecoderPath('draco/');
  }

  var loader = new window.GLTFLoader();
  loader.setDRACOLoader(draco);

  function prep(obj) {
    obj.traverse(function (o) {
      if (o.isMesh) {
        if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals();
        if (o.material) { o.material.side = T.DoubleSide; o.material.envMapIntensity = 1.0; }
      }
    });
  }

  function extReady(gltf) {
    ext = gltf.scene;
    prep(ext);
    scene.add(ext);
    extBox = new T.Box3().setFromObject(ext);
    extSize = extBox.getSize(new T.Vector3());
    extMid = extBox.getCenter(new T.Vector3());
    camera.far = extSize.length() * 2.6;

    setOrbit();
    note.style.display = 'none';
    hint.style.display = 'block';
    document.getElementById('modes').style.display = 'flex';
  }

  /* Интерьер распаковываем не сразу, а при первом переходе внутрь:
     иначе открытие файла ждёт обе модели. */
  function loadInterior(after) {
    if (model) { after(); return; }
    if (interiorPending) return;
    interiorPending = true;
    note.style.display = '';
    note.querySelector('p').textContent = 'Загружается интерьер торгового зала.';
    bar.style.width = '45%';
    setTimeout(function () {
      var ready = function (gltf) {
        model = gltf.scene;
        prep(model);
        model.traverse(function (o) {
          if (o.isMesh && !o.geometry.boundsTree) o.geometry.computeBoundsTree();
        });
        scene.add(model);
        box = new T.Box3().setFromObject(model);
        size = box.getSize(new T.Vector3());
        mid = box.getCenter(new T.Vector3());
        fp.eyeY = box.min.y + size.y * 0.16;
        fp.buffer = Math.min(size.x, size.z) * 0.006;
        fp.counterH = box.min.y + size.y * 0.045;
        bar.style.width = '100%';
        note.style.display = 'none';
        interiorPending = false;
        after();
      };
      var oops = function (err) {
        note.innerHTML = '<b>Не удалось открыть интерьер</b><br>' + err;
      };
      if (window.__MODEL_INT) {
        var buf = decodeBase64(window.__MODEL_INT);
        window.__MODEL_INT = null;
        bar.style.width = '80%';
        loader.parse(buf, '', ready, oops);
      } else {
        loader.load(window.__INT_URL, ready,
          function (p) { if (p.total) bar.style.width = (45 + 50 * p.loaded / p.total) + '%'; },
          oops);
      }
    }, 60);
  }

  function setOrbit() {
    mode = 'orbit';
    controls.enabled = true;
    camera.near = 0.1;
    camera.fov = 52;
    camera.updateProjectionMatrix();
    // дистанцию считаем от описывающей сферы, чтобы здание гарантированно влезло
    var target = new T.Vector3(extMid.x, extBox.min.y + extSize.y * 0.3, extMid.z);
    var radius = extSize.length() / 2;
    var dist = radius / Math.sin(T.MathUtils.degToRad(camera.fov) / 2) * 0.82;
    // угол: спереди-справа, невысоко — так читаются фасады, а не кровля
    var dir = new T.Vector3(0.42, 0.33, 0.85).normalize();
    camera.position.copy(target).addScaledVector(dir, dist);
    controls.target.copy(target);
    controls.minDistance = radius * 0.12;
    controls.maxDistance = dist * 2.2;
    controls.update();
    hint.textContent = 'Зажмите и вращайте · колесо — приблизить';
    pad.style.display = 'none';
    if (ext) ext.visible = true;
    if (model) model.visible = false;
    hideSpots();
    card.classList.remove('open');
    fp.goto = null;
    mark('orbit');
  }

  function setWalk() {
    loadInterior(function () {
      mode = 'walk';
      controls.enabled = false;
      camera.near = 0.03;
      camera.fov = 72;
      camera.updateProjectionMatrix();
      // фасады прячем: внутри они только мешают и дают z-конфликт со стенами зала
      if (ext) ext.visible = false;
      model.visible = true;
      // вход: сразу за входной группой, лицом вглубь зала
      fp.pos.set(29.985, fp.eyeY, -8.5);
      fp.yaw = Math.PI; fp.pitch = 0; fp.vel.set(0, 0, 0);
      applyCam();
      hint.textContent = 'WASD или стрелки — идти · тяните мышью — осмотреться · метки зон кликабельны';
      pad.style.display = '';
      buildSpots();
      mark('walk');
    });
  }

  function mark(m) {
    document.querySelectorAll('#modes button').forEach(function (b) {
      b.classList.toggle('on', b.dataset.mode === m);
    });
  }

  function applyCam() {
    camera.position.copy(fp.pos);
    var cp = Math.cos(fp.pitch);
    camera.lookAt(
      fp.pos.x + Math.sin(fp.yaw) * cp * 100,
      fp.pos.y + Math.sin(fp.pitch) * 100,
      fp.pos.z + Math.cos(fp.yaw) * cp * 100
    );
  }

  /* Скольжение вдоль стен и прилавков: проверяем на двух высотах, как в основном сайте */
  function slide(disp) {
    var move = disp.clone();
    for (var i = 0; i < 3; i++) {
      var len = move.length();
      if (len < 1e-6) break;
      _d.copy(move).multiplyScalar(1 / len);
      var best = null;
      var hs = [fp.eyeY, fp.counterH];
      for (var k = 0; k < hs.length; k++) {
        _o.set(fp.pos.x, hs[k], fp.pos.z);
        rc.set(_o, _d); rc.far = len + fp.buffer;
        var hit = rc.intersectObject(model, true);
        if (hit.length && (!best || hit[0].distance < best.distance)) best = hit[0];
      }
      if (best && best.distance < len + fp.buffer) {
        _n.set(0, 0, 0);
        if (best.face) _n.copy(best.face.normal).transformDirection(best.object.matrixWorld);
        _n.y = 0;
        if (_n.lengthSq() < 1e-6) { move.set(0, 0, 0); break; }
        _n.normalize();
        move.addScaledVector(_n, -move.dot(_n));
      } else break;
    }
    return move;
  }

  function step(dt) {
    var f = (keys.KeyW || keys.ArrowUp || pd.f ? 1 : 0) - (keys.KeyS || keys.ArrowDown || pd.b ? 1 : 0);
    var s = (keys.KeyD || keys.ArrowRight || pd.r ? 1 : 0) - (keys.KeyA || keys.ArrowLeft || pd.l ? 1 : 0);
    if (fp.goto && (f || s)) fp.goto = null;   // тронулись сами — авто-проход отменяем
    var fwd = new T.Vector3(Math.sin(fp.yaw), 0, Math.cos(fp.yaw));
    var right = new T.Vector3(-Math.cos(fp.yaw), 0, Math.sin(fp.yaw));
    var want = new T.Vector3().addScaledVector(fwd, f).addScaledVector(right, s);
    if (want.lengthSq() > 0) want.normalize().multiplyScalar(fp.speed);
    fp.vel.lerp(want, 1 - Math.exp(-fp.accel * dt));
    if (fp.vel.lengthSq() > 1e-8) {
      fp.pos.add(slide(fp.vel.clone().multiplyScalar(dt)));
      fp.pos.x = T.MathUtils.clamp(fp.pos.x, box.min.x + 1, box.max.x - 1);
      fp.pos.z = T.MathUtils.clamp(fp.pos.z, box.min.z + 1, box.max.z - 1);
    }
    fp.pos.y = fp.eyeY;
    applyCam();
  }

  /* ---- метки зон ---- */

  // Точка стояния: обходим зону с четырёх сторон и берём ту, что не попадает
  // внутрь соседней зоны. Контуры известны из данных, лучи не нужны.
  function standFor(z, gap) {
    var cand = [
      { x: z.maxp[0] + gap, z: z.c[2] }, { x: z.minp[0] - gap, z: z.c[2] },
      { x: z.c[0], z: z.maxp[1] + gap }, { x: z.c[0], z: z.minp[1] - gap }
    ];
    function blocked(x, zz) {
      for (var i = 0; i < ZONES.length; i++) {
        var o = ZONES[i], m = fp.buffer;
        if (x > o.minp[0] - m && x < o.maxp[0] + m && zz > o.minp[1] - m && zz < o.maxp[1] + m) return true;
      }
      return false;
    }
    for (var i = 0; i < cand.length; i++) {
      if (!blocked(cand[i].x, cand[i].z)) return new T.Vector3(cand[i].x, fp.eyeY, cand[i].z);
    }
    return new T.Vector3(cand[0].x, fp.eyeY, cand[0].z);
  }

  function buildSpots() {
    if (spots.length || !ZONES.length) return;
    var gap = fp.buffer * 3;
    ZONES.forEach(function (z) {
      var pos = new T.Vector3(z.c[0], z.top + 0.15, z.c[2]);
      var stand = standFor(z, gap);
      var yaw = Math.atan2(z.c[0] - stand.x, z.c[2] - stand.z);
      var el = document.createElement('button');
      el.className = 'hs';
      el.innerHTML = '<span class="dot" style="background:' + (DATA.color[z.kind] || '#c87b3b') + '"></span>' +
                     '<span class="lab">' + (z.num ? z.num + ' · ' : '') + z.label + '</span>';
      el.hidden = true;
      el.addEventListener('click', function (e) { e.preventDefault(); goTo(spot); });
      spotsLayer.appendChild(el);
      var spot = { el: el, pos: pos, stand: stand, yaw: yaw, zone: z };
      spots.push(spot);
    });
  }

  var _v = new T.Vector3(), _cd = new T.Vector3();
  function updateSpots() {
    if (mode !== 'walk') return;
    var w = innerWidth, h = innerHeight;
    camera.getWorldDirection(_cd);
    for (var i = 0; i < spots.length; i++) {
      var s = spots[i];
      _v.copy(s.pos).project(camera);
      var to = s.pos.clone().sub(camera.position);
      if (_v.z > 1 || to.dot(_cd) <= 0) { s.el.hidden = true; continue; }
      s.el.hidden = false;
      s.el.style.left = (_v.x * 0.5 + 0.5) * w + 'px';
      s.el.style.top = (-_v.y * 0.5 + 0.5) * h + 'px';
      var dist = to.length();
      s.el.style.opacity = T.MathUtils.clamp((46 - dist) / 26, 0.18, 1);
      s.el.classList.toggle('near', dist < 13);
    }
  }

  function hideSpots() {
    for (var i = 0; i < spots.length; i++) spots[i].el.hidden = true;
  }

  /* Проход к зоне: сперва в сквозной проход, вдоль него, потом к зоне. */
  function goTo(s) {
    var wps = [
      new T.Vector3(DATA.aisle, fp.eyeY, fp.pos.z),
      new T.Vector3(DATA.aisle, fp.eyeY, s.stand.z),
      s.stand.clone()
    ];
    var len = fp.pos.distanceTo(wps[0]);
    for (var i = 1; i < wps.length; i++) len += wps[i - 1].distanceTo(wps[i]);
    fp.goto = { wps: wps, i: 0, yaw: s.yaw, t: 0, reached: false,
                limit: Math.max(14, len / (fp.speed * 1.6) * 1.8 + 4),
                done: function () { openCard(s.zone); } };
  }

  function angDiff(a, b) {
    var d = a - b;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return d;
  }

  function driveGoto(dt) {
    var g = fp.goto;
    g.t += dt;
    if (!g.reached) {
      var to = g.wps[g.i].clone().sub(fp.pos); to.y = 0;
      var dist = to.length();
      if (dist <= 1.6) {
        g.i++;
        if (g.i >= g.wps.length) g.reached = true;
      } else {
        var dir = to.multiplyScalar(1 / dist);
        var step = Math.min(fp.speed * 1.6 * dt, dist);
        var disp = slide(dir.clone().multiplyScalar(step));
        fp.pos.add(disp);
        if (disp.length() < step * 0.2) {
          g.stuck = (g.stuck || 0) + dt;
          if (g.stuck > 0.6) { g.stuck = 0; g.i++; if (g.i >= g.wps.length) g.reached = true; }
        } else g.stuck = 0;
        var last = (g.i === g.wps.length - 1);
        var tYaw = (last && dist < 6) ? g.yaw : Math.atan2(dir.x, dir.z);
        fp.yaw -= angDiff(fp.yaw, tYaw) * (1 - Math.exp(-7 * dt));
        fp.pitch *= Math.exp(-7 * dt);
      }
      if (g.t > g.limit) g.reached = true;
    } else {
      fp.yaw -= angDiff(fp.yaw, g.yaw) * (1 - Math.exp(-9 * dt));
      fp.pitch *= Math.exp(-9 * dt);
      if (Math.abs(angDiff(fp.yaw, g.yaw)) < 0.04 || g.t > g.limit + 2) {
        var cb = g.done; fp.goto = null; if (cb) cb();
      }
    }
    fp.pos.y = fp.eyeY;
    applyCam();
  }

  function openCard(z) {
    var col = DATA.color[z.kind] || '#c87b3b';
    document.getElementById('chero').style.background =
      'linear-gradient(150deg,' + col + ',' + shade(col, -24) + ')';
    document.getElementById('cnum').textContent = z.num || 'ВГ';
    document.getElementById('cname').textContent = z.label;
    var mm = function (v) { return (v / 1000).toFixed(v % 1000 ? 2 : 1).replace('.', ','); };
    document.getElementById('cdim').textContent = z.dims
      ? mm(z.dims[0]) + ' × ' + mm(z.dims[1]) + ' м · ' + String(z.area).replace('.', ',') + ' м²'
      : 'Вход в здание';
    document.getElementById('cnote').textContent = z.note;
    document.getElementById('cchips').innerHTML =
      '<span>Лист ' + z.sheet + '</span><span>Альбом компоновки 21.09.2026</span>';
    card.classList.add('open');
  }

  function shade(hex, p) {
    var n = parseInt(hex.slice(1), 16);
    var f = function (x) { return Math.max(0, Math.min(255, Math.round(x + p * 2.55))); };
    return 'rgb(' + f(n >> 16) + ',' + f((n >> 8) & 255) + ',' + f(n & 255) + ')';
  }

  document.getElementById('cclose').onclick = function () { card.classList.remove('open'); };
  addEventListener('keydown', function (e) { if (e.key === 'Escape') card.classList.remove('open'); });

  /* ---- ввод ---- */
  var pd = { f: false, b: false, l: false, r: false };
  // Слушаем e.code — физическую клавишу, а не символ: при русской раскладке
  // W выдаёт «ц», и проверка по символу ломается.
  var ARROWS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  addEventListener('keydown', function (e) {
    keys[e.code] = true;
    if (mode === 'walk' && ARROWS.indexOf(e.code) >= 0) e.preventDefault();
  });
  addEventListener('keyup', function (e) { keys[e.code] = false; });
  addEventListener('blur', function () { keys = {}; });   // не залипаем при переключении окна

  var drag = null;
  renderer.domElement.addEventListener('pointerdown', function (e) {
    if (mode !== 'walk') return;
    drag = { x: e.clientX, y: e.clientY };
    renderer.domElement.setPointerCapture(e.pointerId);
  });
  renderer.domElement.addEventListener('pointermove', function (e) {
    if (mode !== 'walk' || !drag) return;
    fp.yaw -= (e.clientX - drag.x) * 0.0032;
    fp.pitch = T.MathUtils.clamp(fp.pitch - (e.clientY - drag.y) * 0.0028, -1.1, 1.1);
    drag.x = e.clientX; drag.y = e.clientY;
  });
  renderer.domElement.addEventListener('pointerup', function () { drag = null; });

  document.querySelectorAll('#pad button').forEach(function (b) {
    var d = b.dataset.dir;
    var on = function (e) { e.preventDefault(); pd[d] = true; };
    var off = function (e) { e.preventDefault(); pd[d] = false; };
    b.addEventListener('pointerdown', on);
    b.addEventListener('pointerup', off);
    b.addEventListener('pointerleave', off);
    b.addEventListener('pointercancel', off);
  });

  document.querySelectorAll('#modes button').forEach(function (b) {
    b.onclick = function () { b.dataset.mode === 'walk' ? setWalk() : setOrbit(); };
  });

  addEventListener('resize', function () {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  /* ---- цикл ---- */
  var last = performance.now();
  function loop(now) {
    requestAnimationFrame(loop);
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (mode === 'walk' && model) {
      if (fp.goto) driveGoto(dt); else step(dt);
      updateSpots();
    } else controls.update();
    renderer.render(scene, camera);
  }
  requestAnimationFrame(loop);

  /* ---- старт ---- */
  bar.style.width = '35%';
  setTimeout(function () {
    var fail = function (err) {
      note.innerHTML = '<b>Не удалось открыть модель</b><br>' + err;
    };
    var done = function (gltf) { bar.style.width = '100%'; extReady(gltf); };
    if (window.__MODEL_EXT) {            // модель вшита в страницу
      var buf = decodeBase64(window.__MODEL_EXT);
      window.__MODEL_EXT = null;         // освобождаем память под base64-строку
      bar.style.width = '70%';
      loader.parse(buf, '', done, fail);
    } else {                             // модель лежит отдельным файлом
      loader.load(window.__EXT_URL, done,
        function (p) { if (p.total) bar.style.width = (25 + 70 * p.loaded / p.total) + '%'; },
        fail);
    }
  }, 60);
})();
