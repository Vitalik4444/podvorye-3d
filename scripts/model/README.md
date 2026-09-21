# Конвертация модели рынка: DAE → GLB

Источник: `Desktop\Market_SketchUp` (редакция 25 от 21.09.2026) —
`Market_Final.dae` + папки текстур `FARM_Market_INTERIOR_1/` и `Signs/`.

Порядок (всё в ASCII-пути: кириллица в путях ломает передачу аргументов):

```
python flatten_dae.py  Market_Final.dae  Market_Flat.dae
COLLADA2GLTF-bin.exe -i Market_Flat.dae -o raw.gltf -s -v 2.0
gltf-transform dedup    raw.gltf s1.glb
gltf-transform prune    s1.glb   s2.glb
gltf-transform instance s2.glb   s3.glb
python strip_lines.py   s3.glb   a1.glb
gltf-transform prune    a1.glb   a2.glb
gltf-transform weld     a2.glb   a3.glb
gltf-transform resize   a3.glb   a4.glb --width 2048 --height 2048
gltf-transform webp     a4.glb   a5.glb --quality 82
gltf-transform draco    a5.glb   interior.glb
python extract_islands.py a2.glb islands_raw.json   # до draco: нужны accessor min/max
```

Почему именно так:

* **`flatten_dae.py` обязателен.** COLLADA2GLTF v2.1.5 не разворачивает
  `<instance_node>` на `<library_nodes>` и молча теряет геометрию —
  без него 533 533 треугольника превращаются в 335 728, а 49 текстур в 12.
* **`join` не применять.** Он запекает трансформации и убивает
  переиспользование геометрии: 18,9 МБ против 11,5 МБ у варианта с `instance`.
* **`extract_islands.py` запускать до `draco`** — он считает габариты по
  `min`/`max` аксессоров, а Draco их убирает.
* Масштаб (дюймы → метры) и Z_UP → Y_UP конвертер применяет сам.
  Проверка: `Остров_1` должен получиться 3,50 × 4,50 м, как на чертеже.

`extract_islands.py` даёт исходные данные для `src/islands.js`.

---

# Конвертация .skp напрямую (экстерьер, фасады)

Для файлов SketchUp без промежуточного DAE используется
[skp2gltf](https://github.com/zhuzhaoyun/skp2gltf) v1.1.0 — самодостаточный
prebuilt с `SketchUpAPI.dll`, компилятор не нужен.

```
skp2gltf.exe facades.skp out facades      # аргументы: вход, папка, имя
```

Подводные камни:

* **Пишет рядом с исходником, а не в указанную папку**, и с префиксом `out`:
  получается `outfacades.gltf` и `outTextureNN.png`.
* **Ссылки на текстуры не совпадают с именами файлов**: в .gltf написано
  `TextureNN.png`, на диске лежит `outTextureNN.png`. Перед оптимизацией
  снять префикс: `for f in outTexture*.png; do mv "$f" "${f#out}"; done`
* **Путь должен быть без кириллицы** — иначе конвертер не находит файл.
* Буфер кладётся в .gltf как base64, поэтому файл распухает: из 61 МБ .skp
  получается 218 МБ .gltf. Для `gltf-transform` нужен увеличенный heap:
  `NODE_OPTIONS=--max-old-space-size=8192`.
* Координаты остаются как в SketchUp — дюймы и Z вверх. Приводит к метрам
  и Y вверх скрипт `reorient.py` (оборачивает корни сцены в узел с
  поворотом −90° по X и масштабом 0,0254).

Дальше — та же цепочка: `dedup → prune → instance → weld → resize → webp → draco`.
Фасадам инстансинг ничего не дал (нет повторяющихся мешей), зато текстуры
решают: 2048 → 12,0 МБ, 1024 → 9,2 МБ при неразличимой на глаз разнице.
