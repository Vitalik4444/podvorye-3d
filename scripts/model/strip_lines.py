# -*- coding: utf-8 -*-
"""Выкидывает примитивы-линии (рёбра SketchUp, mode=1): в текстурированном
вьювере они не видны, но draco их не жмёт и они тянут вес."""
import json, struct, sys
src, dst = sys.argv[1], sys.argv[2]
d = open(src,'rb').read()
off=12; js=None; binc=None
while off < len(d):
    ln,ty = struct.unpack('<II', d[off:off+8])
    body = d[off+8:off+8+ln]
    if ty == 0x4E4F534A: js = json.loads(body)
    else: binc = body
    off += 8+ln

removed = 0
for m in js['meshes']:
    keep = [p for p in m['primitives'] if p.get('mode',4) != 1]
    removed += len(m['primitives']) - len(keep)
    m['primitives'] = keep

# меши, оставшиеся пустыми, отвязываем от нод — prune уберёт их следом
empty = {i for i,m in enumerate(js['meshes']) if not m['primitives']}
for m in js['meshes']:
    if not m['primitives']:
        m['primitives'] = [{'attributes': {}}]   # временная заглушка, снимем ниже
detached = 0
for n in js['nodes']:
    if n.get('mesh') in empty:
        del n['mesh']; detached += 1
for i in empty:
    js['meshes'][i]['primitives'] = []

print('убрано примитивов-линий:', removed, '| опустевших мешей:', len(empty), '| отвязано нод:', detached)

# пустые меши glTF-валидатор не любит — выкидываем их и переиндексируем
remap = {}; new = []
for i,m in enumerate(js['meshes']):
    if m['primitives']:
        remap[i] = len(new); new.append(m)
js['meshes'] = new
for n in js['nodes']:
    if 'mesh' in n: n['mesh'] = remap[n['mesh']]

jb = json.dumps(js, separators=(',',':')).encode('utf-8')
jb += b' ' * ((4 - len(jb) % 4) % 4)
binc += b'\x00' * ((4 - len(binc) % 4) % 4)
out = struct.pack('<III', 0x46546C67, 2, 12 + 8+len(jb) + 8+len(binc))
out += struct.pack('<II', len(jb), 0x4E4F534A) + jb
out += struct.pack('<II', len(binc), 0x004E4942) + binc
open(dst,'wb').write(out)
print('записано:', dst, round(len(out)/1048576,2), 'MB')
