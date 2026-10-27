// Оставляет из модели только треугольники, центр которых левее X < xmax (мировые координаты)
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
const [src, dst, xmaxS] = process.argv.slice(2); const XMAX = +xmaxS;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(), 'draco3d.encoder': await draco3d.createEncoderModule() });
const doc = await io.read(src); const root = doc.getRoot();
const mul=(m,v)=>[m[0]*v[0]+m[4]*v[1]+m[8]*v[2]+m[12], m[1]*v[0]+m[5]*v[1]+m[9]*v[2]+m[13], m[2]*v[0]+m[6]*v[1]+m[10]*v[2]+m[14]];
let kept=0,total=0; const band={};
for (const node of root.listNodes()) {
  const mesh = node.getMesh(); if (!mesh) continue;
  const W = node.getWorldMatrix(); const nm = doc.createMesh(mesh.getName());
  for (const prim of mesh.listPrimitives()) {
    const pos = prim.getAttribute('POSITION'); const idx = prim.getIndices();
    const n = idx ? idx.getCount() : pos.getCount(); const get = i => idx ? idx.getScalar(i) : i;
    const keep = []; const v=[0,0,0];
    for (let t=0;t<n;t+=3){ total++;
      let cx=0; for(let k=0;k<3;k++){ pos.getElement(get(t+k),v); cx+=mul(W,v)[0]/3; }
      const b=Math.floor(cx); if(b>=-3&&b<=0) band[b]=(band[b]||0)+1;
      if (cx < XMAX) keep.push(get(t),get(t+1),get(t+2)); }
    if (!keep.length) continue; kept+=keep.length/3;
    const map=new Map(); const order=[]; const ni=keep.map(i=>{ if(!map.has(i)){map.set(i,order.length);order.push(i);} return map.get(i); });
    const np = doc.createPrimitive().setMode(prim.getMode()).setMaterial(prim.getMaterial());
    for (const sem of prim.listSemantics()) { const a=prim.getAttribute(sem); const sz=a.getElementSize();
      const arr=new (a.getArray().constructor)(order.length*sz); const el=[];
      order.forEach((o,j)=>{a.getElement(o,el); for(let k=0;k<sz;k++) arr[j*sz+k]=el[k];});
      np.setAttribute(sem, doc.createAccessor().setType(a.getType()).setArray(arr).setNormalized(a.getNormalized()).setBuffer(root.listBuffers()[0])); }
    np.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(ni)).setBuffer(root.listBuffers()[0]));
    nm.addPrimitive(np);
  }
  node.setMesh(nm.listPrimitives().length ? nm : null);
}
for (const e of root.listExtensionsUsed()) if (e.extensionName==='KHR_draco_mesh_compression') e.dispose();
await doc.transform(prune());
for (const s of root.listScenes()) for (const c of s.listChildren()) c.setName('Neighbour_Buildings_old_facades');
await io.write(dst, doc);
console.log('треугольников', total, 'оставлено', kept, 'полоса X[-3..0]', JSON.stringify(band));
