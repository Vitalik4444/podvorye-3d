# -*- coding: utf-8 -*-
"""Разворачивает зеркальные надписи на световых табло павильонов.

В выдаче R31 у боковых табло мясного и рыбного павильонов (display_title,
display_content) грань смотрит внутрь павильона правильно, но координата
текстуры U идёт справа налево — надпись «МЯСНОЙ РЯД» читается зеркально.

Для каждой грани считаем, куда смотрит зритель (против нормали), и куда
растёт U вдоль направления «вправо» от него. Если U убывает — у вершин этой
грани U заменяется на 1 - U. Правильные табло скрипт не трогает, поэтому
его можно гонять и на следующих выдачах.

  python fix_mirrored_signs.py <вход.glb> <выход.glb>
"""
import json, re, struct, sys
import numpy as np

src, dst = sys.argv[1], sys.argv[2]
NAME = re.compile(r'display_(title|content)', re.I)

d = bytearray(open(src, 'rb').read())
jlen = struct.unpack('<I', d[12:16])[0]
js = json.loads(bytes(d[20:20 + jlen]))
bin_off = 20 + jlen + 8          # начало BIN-чанка
COMP = {5126: ('<f', 4), 5123: ('<H', 2), 5125: ('<I', 4), 5121: ('<B', 1)}
NCOMP = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}


def view(ai):
    """Возвращает (массив, функцию записи) для аксессора."""
    a = js['accessors'][ai]
    bv = js['bufferViews'][a['bufferView']]
    fmt, sz = COMP[a['componentType']]
    n = NCOMP[a['type']]
    stride = bv.get('byteStride') or sz * n
    base = bin_off + bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    dt = np.dtype(fmt)
    arr = np.array([[np.frombuffer(d, dt, 1, base + i * stride + k * sz)[0] for k in range(n)]
                    for i in range(a['count'])])

    def write(i, k, v):
        struct.pack_into(fmt, d, base + i * stride + k * sz, v)
    return arr, write


UP = np.array([0.0, 1.0, 0.0])
fixed = 0
for node in js['nodes']:
    if 'mesh' not in node or not NAME.search(node.get('name', '')):
        continue
    if any(k in node for k in ('rotation', 'scale', 'matrix')):
        print('пропущен (есть поворот/масштаб у узла):', node['name']); continue
    for pr in js['meshes'][node['mesh']]['primitives']:
        if 'TEXCOORD_0' not in pr['attributes']:
            continue
        P, _ = view(pr['attributes']['POSITION'])
        UV, put = view(pr['attributes']['TEXCOORD_0'])
        I = view(pr['indices'])[0][:, 0].astype(int) if 'indices' in pr else np.arange(len(P))
        flip = set()
        for t in range(len(I) // 3):
            ia, ib, ic = I[3 * t:3 * t + 3]
            a, b, c = P[ia], P[ib], P[ic]
            nrm = np.cross(b - a, c - a)
            if np.linalg.norm(nrm) < 1e-9:
                continue
            nrm /= np.linalg.norm(nrm)
            if abs(nrm[1]) > 0.7:          # горизонтальные грани не трогаем
                continue
            right = np.cross(-nrm, UP)       # «вправо» для зрителя перед гранью
            # градиент U по грани: решаем du = g·dp в плоскости треугольника
            e1, e2 = b - a, c - a
            du1, du2 = UV[ib][0] - UV[ia][0], UV[ic][0] - UV[ia][0]
            M = np.array([[e1 @ e1, e1 @ e2], [e1 @ e2, e2 @ e2]])
            if abs(np.linalg.det(M)) < 1e-12:
                continue
            s = np.linalg.solve(M, [du1, du2])
            g = s[0] * e1 + s[1] * e2
            if g @ right < -1e-6:
                flip.update((ia, ib, ic))
        for i in flip:
            put(i, 0, 1.0 - UV[i][0])
        if flip:
            fixed += 1
            print('развёрнуто: %-40s вершин %d' % (node['name'], len(flip)))

open(dst, 'wb').write(d)
print('табло исправлено:', fixed, '->', dst)
