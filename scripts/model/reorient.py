# -*- coding: utf-8 -*-
"""Приводит модель из системы SketchUp (дюймы, Z вверх) к системе glTF
(метры, Y вверх): оборачивает корни сцены в узел с поворотом и масштабом.

skp2gltf отдаёт координаты как есть, поэтому без этого модель лежит на боку
и больше реальной в 39 раз.
"""
import json, struct, sys, math

src, dst = sys.argv[1], sys.argv[2]
scale = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0254

d = open(src, 'rb').read()
off = 12
js = None
binc = b''
while off < len(d):
    ln, ty = struct.unpack('<II', d[off:off + 8])
    body = d[off + 8:off + 8 + ln]
    if ty == 0x4E4F534A:
        js = json.loads(body)
    else:
        binc = body
    off += 8 + ln

scene = js['scenes'][js.get('scene', 0)]
roots = scene['nodes']

# -90° вокруг X переводит Z-up в Y-up
a = -math.pi / 2
q = [math.sin(a / 2), 0.0, 0.0, math.cos(a / 2)]

js['nodes'].append({
    'name': 'root_orient',
    'children': list(roots),
    'rotation': q,
    'scale': [scale, scale, scale],
})
scene['nodes'] = [len(js['nodes']) - 1]

jb = json.dumps(js, separators=(',', ':')).encode('utf-8')
jb += b' ' * ((4 - len(jb) % 4) % 4)
binc += b'\x00' * ((4 - len(binc) % 4) % 4)
out = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(jb) + 8 + len(binc))
out += struct.pack('<II', len(jb), 0x4E4F534A) + jb
out += struct.pack('<II', len(binc), 0x004E4942) + binc
open(dst, 'wb').write(out)
print('корней сцены было:', len(roots), '| масштаб:', scale)
print('записано:', dst, round(len(out) / 1048576, 2), 'МБ')
