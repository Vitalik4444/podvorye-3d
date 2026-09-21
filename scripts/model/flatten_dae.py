# -*- coding: utf-8 -*-
"""Разворачивает <instance_node> ссылки на <library_nodes> прямо в визуальную сцену.
COLLADA2GLTF v2.1.5 их не резолвит и молча теряет геометрию."""
import sys, copy
from lxml import etree

NS = 'http://www.collada.org/2005/11/COLLADASchema'
Q = lambda t: '{%s}%s' % (NS, t)

src, dst = sys.argv[1], sys.argv[2]
tree = etree.parse(src)
root = tree.getroot()

lib_nodes = root.find(Q('library_nodes'))
scenes    = root.find(Q('library_visual_scenes'))

# каталог нод из library_nodes по id
catalog = {}
for n in lib_nodes.iter(Q('node')):
    if n.get('id'):
        catalog[n.get('id')] = n
print('в каталоге нод:', len(catalog))

uid = [0]
def fresh_ids(el):
    """copy получил чужие id/sid — раздаём новые, чтобы не было дублей"""
    for e in el.iter():
        if e.get('id'):
            uid[0] += 1
            e.set('id', 'FL%d' % uid[0])
    return el

expanded, missing, rounds = 0, set(), 0
while True:
    refs = [e for e in scenes.iter(Q('instance_node'))]
    if not refs:
        break
    rounds += 1
    if rounds > 12:
        print('!! превышена глубина вложенности, осталось ссылок:', len(refs))
        break
    for inst in refs:
        url = (inst.get('url') or '').lstrip('#')
        target = catalog.get(url)
        parent = inst.getparent()
        idx = list(parent).index(inst)
        if target is None:
            missing.add(url)
            parent.remove(inst)
            continue
        clone = fresh_ids(copy.deepcopy(target))
        # имя переносим на клон, если у ссылки оно было осмысленнее
        if inst.get('name') and not clone.get('name'):
            clone.set('name', inst.get('name'))
        parent.remove(inst)
        parent.insert(idx, clone)
        expanded += 1
    print('проход %d: развёрнуто %d' % (rounds, expanded))

print('всего развёрнуто:', expanded)
if missing:
    print('НЕ НАЙДЕНО целей:', len(missing), list(missing)[:10])

# library_nodes больше не нужна и только путает конвертер
root.remove(lib_nodes)

tree.write(dst, encoding='UTF-8', xml_declaration=True)
print('записано:', dst)
