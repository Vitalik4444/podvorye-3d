# -*- coding: utf-8 -*-
"""Снимает верхние отметки зон из модели: высота, на которой висит метка.

LED-короба редакции 26 лежат внутри тех же групп Island_<номер>, но их верх
на +4,765 м — если их учитывать, метки уедут под потолок. Поэтому узлы с LED
в имени пропускаются.

  python zone_heights.py <модель.glb> <выход.json>
"""
import json, struct, sys
import numpy as np

src, dst = sys.argv[1], sys.argv[2]
d = open(src, 'rb').read()
off = 12
js = None
while off < len(d):
    ln, ty = struct.unpack('<II', d[off:off + 8])
    if ty == 0x4E4F534A:
        js = json.loads(d[off + 8:off + 8 + ln])
    off += 8 + ln

nodes, meshes, acc = js['nodes'], js['meshes'], js['accessors']


def mat(n):
    if 'matrix' in n:
        return np.array(n['matrix']).reshape(4, 4).T
    T = n.get('translation', [0, 0, 0])
    R = n.get('rotation', [0, 0, 0, 1])
    S = n.get('scale', [1, 1, 1])
    x, y, z, w = R
    r = np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
                  [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                  [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])
    m = np.eye(4)
    m[:3, :3] = r * np.array(S)
    m[:3, 3] = T
    return m


sys.setrecursionlimit(100000)
res = {}


def walk(i, pm, lab):
    n = nodes[i]
    nm = n.get('name', '')
    # LED-короба висят под потолком, ёлка на сцене — 5 м от настила.
    # Метку зоны такие объекты уводят вверх, поэтому их пропускаем.
    if 'LED' in nm or nm.startswith('Tree_') or '/Tree_' in nm:
        return
    m = pm @ mat(n)
    if nm.startswith('Island_'):
        lab = nm[len('Island_'):]
    if 'mesh' in n and lab:
        for p in meshes[n['mesh']]['primitives']:
            a = acc[p['attributes']['POSITION']]
            if 'min' not in a:
                continue
            lo, hi = a['min'], a['max']
            pts = np.array([[hi[0] if k & 1 else lo[0], hi[1] if k & 2 else lo[1],
                             hi[2] if k & 4 else lo[2], 1] for k in range(8)])
            w = (m @ pts.T).T[:, :3]
            b = res.setdefault(lab, [w.min(0).copy(), w.max(0).copy()])
            b[0] = np.minimum(b[0], w.min(0))
            b[1] = np.maximum(b[1], w.max(0))
    for c in n.get('children', []):
        walk(c, m, lab)


for r in js['scenes'][js.get('scene', 0)]['nodes']:
    walk(r, np.eye(4), None)

out = {}
for k, (lo, hi) in sorted(res.items()):
    out[k] = dict(top=round(float(hi[1]), 3),
                  min=[round(float(lo[0]), 3), round(float(lo[2]), 3)],
                  max=[round(float(hi[0]), 3), round(float(hi[2]), 3)])
    print('%-16s верх %6.3f м   X %7.2f…%6.2f   Z %7.2f…%7.2f' %
          (k, hi[1], lo[0], hi[0], lo[2], hi[2]))

json.dump(out, open(dst, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('\nзон:', len(out), '->', dst)
