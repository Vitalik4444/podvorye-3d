# -*- coding: utf-8 -*-
"""Считает мировые габариты именованных нод (острова, киоски, входная группа)
по accessor min/max — работает только до draco-сжатия."""
import json, struct, sys, math

path, out = sys.argv[1], sys.argv[2]
d = open(path,'rb').read()
off=12; js=None
while off < len(d):
    ln,ty = struct.unpack('<II', d[off:off+8])
    if ty == 0x4E4F534A: js = json.loads(d[off+8:off+8+ln])
    off += 8+ln

nodes = js['nodes']; meshes = js['meshes']; acc = js['accessors']

def mat_of(n):
    if 'matrix' in n:
        m = n['matrix']                      # glTF column-major
        return [[m[0],m[4],m[8],m[12]],
                [m[1],m[5],m[9],m[13]],
                [m[2],m[6],m[10],m[14]],
                [m[3],m[7],m[11],m[15]]]
    T = n.get('translation',[0,0,0]); R = n.get('rotation',[0,0,0,1]); S = n.get('scale',[1,1,1])
    x,y,z,w = R
    rot = [[1-2*(y*y+z*z), 2*(x*y-z*w),   2*(x*z+y*w)],
           [2*(x*y+z*w),   1-2*(x*x+z*z), 2*(y*z-x*w)],
           [2*(x*z-y*w),   2*(y*z+x*w),   1-2*(x*x+y*y)]]
    return [[rot[r][c]*S[c] for c in range(3)] + [T[r]] for r in range(3)] + [[0,0,0,1]]

def mul(a,b):
    return [[sum(a[i][k]*b[k][j] for k in range(4)) for j in range(4)] for i in range(4)]

def apply(m,p):
    return [sum(m[i][k]*p[k] for k in range(3)) + m[i][3] for i in range(3)]

IDENT=[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]

def prim_corners(mesh_idx):
    pts=[]
    for p in meshes[mesh_idx]['primitives']:
        a = acc[p['attributes']['POSITION']]
        if 'min' not in a: continue
        lo,hi = a['min'], a['max']
        for i in range(8):
            pts.append([hi[0] if i&1 else lo[0], hi[1] if i&2 else lo[1], hi[2] if i&4 else lo[2]])
    return pts

results={}
def walk(idx, parent_m, labels):
    n = nodes[idx]
    m = mul(parent_m, mat_of(n))
    name = n.get('name','')
    # копим ВСЕ осмысленные имена по пути: остров и вложенный киоск нужны оба
    if name and not name.startswith(('SketchUp_Instance','Component','skp_camera')):
        labels = labels + [name]
    if 'mesh' in n and labels:
        pts = [apply(m, c) for c in prim_corners(n['mesh'])]
        for lab in labels:
            box = results.setdefault(lab, [[1e30]*3, [-1e30]*3, 0])
            for w in pts:
                for k in range(3):
                    box[0][k] = min(box[0][k], w[k]); box[1][k] = max(box[1][k], w[k])
            box[2] += 1
    for c in n.get('children', []):
        walk(c, m, labels)

sys.setrecursionlimit(100000)
for root in js['scenes'][js.get('scene',0)]['nodes']:
    walk(root, IDENT, [])

items=[]
for name,(lo,hi,cnt) in sorted(results.items()):
    size=[round(hi[k]-lo[k],3) for k in range(3)]
    items.append({'name':name,
                  'center':[round((lo[k]+hi[k])/2,3) for k in range(3)],
                  'min':[round(v,3) for v in lo], 'max':[round(v,3) for v in hi],
                  'size':size, 'meshes':cnt})
json.dump(items, open(out,'w',encoding='utf-8'), ensure_ascii=False, indent=1)
print('именованных объектов:', len(items))
isl=[i for i in items if i['name'].startswith('Остров')]
print('\nОСТРОВА — габариты (X × Y × Z) и центр:')
for i in sorted(isl, key=lambda x:x['name']):
    print(f"  {i['name']:24s} {i['size'][0]:8.2f} × {i['size'][1]:7.2f} × {i['size'][2]:6.2f}   центр {i['center']}")
