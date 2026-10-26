// Нужны пакеты @gltf-transform/core, /functions, /extensions v4 (npm i во временной папке,
// скрипт запускать оттуда: модули ищутся рядом со скриптом).
// Заменяет группы в полной модели на одноимённые группы из модуля.
// node swap.mjs <полная.glb> <модуль.glb> <выход.glb> Group1,Group2
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { mergeDocuments, prune, unpartition } from '@gltf-transform/functions';
const [full, mod, outp, groups] = process.argv.slice(2);
const names = groups.split(',');
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(full);
const src = await io.read(mod);
const scene = doc.getRoot().getDefaultScene() || doc.getRoot().listScenes()[0];
// старые группы: ищем по всему дереву
const kill = doc.getRoot().listNodes().filter(n => names.includes(n.getName()));
const parents = new Map();
for (const n of kill) {
  const par = n.getParentNode();
  parents.set(n.getName(), par);
  const sub = []; n.traverse(x => sub.push(x));
  for (const x of sub.reverse()) x.dispose();
}
console.log('удалено групп:', kill.length, kill.map(n => n.getName()).join(', ') || '-');
const assetExtras = doc.getRoot().getAsset().extras;
const map = mergeDocuments(doc, src);
doc.getRoot().getAsset().extras = assetExtras;   // метаданные полной модели не трогаем
const added = [];
for (const sc of src.getRoot().listScenes()) {
  const nsc = map.get(sc);
  for (const r of nsc.listChildren()) {
    if (!names.includes(r.getName())) { console.log('лишний корень модуля пропущен:', r.getName()); continue; }
    nsc.removeChild(r);
    const par = parents.get(r.getName());
    if (par) par.addChild(r); else scene.addChild(r);
    added.push(r.getName());
  }
  nsc.dispose();
}
doc.getRoot().setDefaultScene(scene);
console.log('вставлено:', added.join(', '));
await doc.transform(prune(), unpartition());
await io.write(outp, doc);
console.log('->', outp);
