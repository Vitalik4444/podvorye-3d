# -*- coding: utf-8 -*-
"""Насыпает горки в ящики овощных витрин.

В модели все плоды одного цвета слиты в один меш, отдельных объектов нет.
Скрипт разбирает меш на шары, группирует их по ящикам и досыпает слои
сверху отдельными нодами со ссылкой на один общий меш-шар — дальше
gltf-transform instance свернёт их в GPU-инстансы почти без прибавки в весе.

Редакция 26: имена нод устроены как пути `New/<номер зоны>/...`, а вершины
не сварены (у шаров гранёные нормали), поэтому тела выделяются не по
индексам, а по совпадающим позициям вершин.

  python heap_produce.py <вход.gltf> <выход.gltf> <выход.bin> 20,21
"""
import json, sys, collections, random
import numpy as np

rnd = random.Random(2509)   # фиксированное зерно: пересборка даёт тот же результат

SRC, DST, BIN_OUT = sys.argv[1], sys.argv[2], sys.argv[3]
TARGET_ZONES = set(sys.argv[4].split(','))
PRODUCE = {'red', 'green', 'orange', 'yellow', 'purple'}

js = json.load(open(SRC, encoding='utf-8'))
buf = bytearray(open(js['buffers'][0]['uri'], 'rb').read())
acc, bv = js['accessors'], js['bufferViews']
nodes, meshes, mats = js['nodes'], js['meshes'], js['materials']
mname = {i: (m.get('name') or '') for i, m in enumerate(mats)}
CT = {5120: 'i1', 5121: 'u1', 5122: 'i2', 5123: 'u2', 5125: 'u4', 5126: 'f4'}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}


# Снимок буфера для чтения. add_accessor только дописывает в конец, поэтому
# смещения уже существующих аксессоров остаются верными.
RAW = bytes(buf)


def read(i):
    a = acc[i]
    v = bv[a['bufferView']]
    off = v.get('byteOffset', 0) + a.get('byteOffset', 0)
    n = NC[a['type']]
    dt = np.dtype(CT[a['componentType']]).newbyteorder('<')
    item = dt.itemsize * n
    st = v.get('byteStride') or item
    cnt = a['count']
    if st == item:
        return np.frombuffer(RAW, dtype=dt, count=cnt * n, offset=off).reshape(cnt, n)
    # чередующиеся атрибуты: выбираем нужные байты разом, а не по одной вершине
    span = st * (cnt - 1) + item
    block = np.frombuffer(RAW, dtype=np.uint8, count=span, offset=off)
    take = np.arange(cnt)[:, None] * st + np.arange(item)[None, :]
    return block[take].copy().view(dt).reshape(cnt, n)


def add_accessor(arr, comp_type, typ, minmax=False):
    data = arr.astype(np.dtype(CT[comp_type]).newbyteorder('<')).tobytes()
    while len(buf) % 4:
        buf.append(0)
    off = len(buf)
    buf.extend(data)
    bv.append({'buffer': 0, 'byteOffset': off, 'byteLength': len(data)})
    a = {'bufferView': len(bv) - 1, 'componentType': comp_type, 'count': len(arr), 'type': typ}
    if minmax:
        a['min'] = [float(v) for v in arr.min(0)]
        a['max'] = [float(v) for v in arr.max(0)]
    acc.append(a)
    return len(acc) - 1


def zone_of(name):
    """New/20/20_Stepped_display_2000mm/red -> '20'"""
    parts = name.split('/')
    return parts[1] if len(parts) > 2 and parts[0] == 'New' else None


targets = []
for i, n in enumerate(nodes):
    nm = n.get('name', '')
    if 'mesh' not in n or zone_of(nm) not in TARGET_ZONES:
        continue
    for p in meshes[n['mesh']]['primitives']:
        if mname.get(p.get('material')) in PRODUCE:
            targets.append((i, p, mname[p['material']], zone_of(nm)))
print('найдено мешей с продуктами:', len(targets))


def split_spheres(p):
    """Тела выделяем по совпадающим позициям вершин: у шаров гранёные
    нормали, поэтому штатная сварка их не склеивает."""
    P = read(p['attributes']['POSITION']).astype(np.float64)
    I = read(p['indices']).astype(np.int64).ravel()
    key = np.round(P * 1e4).astype(np.int64)
    _, inv = np.unique(key, axis=0, return_inverse=True)
    inv = inv.ravel()
    par = np.arange(inv.max() + 1)

    def f(a):
        while par[a] != a:
            par[a] = par[par[a]]
            a = par[a]
        return a

    tri = inv[I].reshape(-1, 3)
    for a, b, c in tri:
        for x, y in ((a, b), (b, c)):
            ra, rb = f(x), f(y)
            if ra != rb:
                par[ra] = rb
    groups = collections.defaultdict(list)
    for vi in range(len(P)):
        groups[f(inv[vi])].append(vi)
    groups = list(groups.values())
    cen = np.array([P[v].mean(0) for v in groups])
    return P, I, groups, cen


sphere_mesh = {}
added_total = 0
new_by_parent = collections.defaultdict(list)

for node_i, prim, mat, zone in targets:
    P, I, groups, cen = split_spheres(prim)
    if len(groups) < 6:
        continue

    if mat not in sphere_mesh:
        idx = np.array(sorted(groups[0]))
        remap = {v: k for k, v in enumerate(idx)}
        tri = I.reshape(-1, 3)
        keep = np.array([all(v in remap for v in t) for t in tri])
        sub = np.array([[remap[v] for v in t] for t in tri[keep]], dtype=np.uint16)
        verts = (P[idx] - P[idx].mean(0)).astype(np.float32)
        norm = verts / np.maximum(np.linalg.norm(verts, axis=1, keepdims=True), 1e-9)
        pa = add_accessor(verts, 5126, 'VEC3', minmax=True)
        na = add_accessor(norm.astype(np.float32), 5126, 'VEC3')
        ia = add_accessor(sub.ravel().astype(np.uint16), 5123, 'SCALAR')
        meshes.append({'name': 'heap_' + mat,
                       'primitives': [{'attributes': {'POSITION': pa, 'NORMAL': na},
                                       'indices': ia, 'material': prim['material']}]})
        sphere_mesh[mat] = len(meshes) - 1

    # ящики: сперва по ярусам (вертикаль), внутри яруса — связные группы в плане
    zs = np.round(cen[:, 2], 3)
    for z in sorted(set(zs)):
        sel = cen[zs == z]
        used = np.zeros(len(sel), bool)
        crates = []
        for i in range(len(sel)):
            if used[i]:
                continue
            stack = [i]
            used[i] = True
            comp = []
            while stack:
                k = stack.pop()
                comp.append(k)
                dd = np.linalg.norm(sel[:, :2] - sel[k, :2], axis=1)
                for j in np.where((dd < 0.32) & ~used)[0]:
                    used[j] = True
                    stack.append(j)
            crates.append(sel[comp])

        for c in crates:
            xs = np.unique(np.round(c[:, 0], 3))
            ys = np.unique(np.round(c[:, 1], 3))
            if len(ys) < 2:
                continue
            xm = float(xs.mean())
            sy = float(np.diff(ys).mean())
            mids = ys[:-1] + np.diff(ys) / 2
            pts = []
            for x in xs:
                for y in mids:
                    pts.append((float(x), float(y), float(z)))
            for y in list(ys) + list(mids):
                pts.append((xm, float(y), float(z) + 0.105))
            mid = float(ys.mean())
            for y in (mid - sy * 0.5, mid + sy * 0.5):
                if rnd.random() < 0.78:
                    pts.append((xm, y, float(z) + 0.205))
            for x, y, zz in pts:
                jx = x + rnd.uniform(-0.18, 0.18) * sy
                jy = y + rnd.uniform(-0.18, 0.18) * sy
                jz = zz + rnd.uniform(-0.012, 0.012)
                scale = rnd.uniform(0.86, 1.16)
                ang = rnd.uniform(0, 6.2832)
                new_by_parent[node_i].append((jx, jy, jz, mat, scale, ang))
                added_total += 1

print('добавлено плодов:', added_total)

for parent_i, items in new_by_parent.items():
    kids = nodes[parent_i].setdefault('children', [])
    for x, y, z, mat, scale, ang in items:
        q = [0.0, 0.0, float(np.sin(ang / 2)), float(np.cos(ang / 2))]
        nodes.append({'mesh': sphere_mesh[mat], 'translation': [x, y, z],
                      'rotation': q, 'scale': [scale, scale, scale]})
        kids.append(len(nodes) - 1)

js['buffers'][0]['uri'] = BIN_OUT.replace('\\', '/').split('/')[-1]
js['buffers'][0]['byteLength'] = len(buf)
open(BIN_OUT, 'wb').write(bytes(buf))
json.dump(js, open(DST, 'w', encoding='utf-8'), ensure_ascii=False)
print('записано:', DST, '| нод стало:', len(nodes))
