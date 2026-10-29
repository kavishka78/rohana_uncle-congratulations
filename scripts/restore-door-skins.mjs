import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { copyToDocument, createDefaultPropertyResolver, transformPrimitive, prune, getBounds } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { Matrix4 } from 'three';

// Restore only front-door exterior meshes; keep all other optimized geometry.
await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder,
});
const original = await io.read('.model-source/scene.gltf');
const model = await io.read('public/models/vezel.glb');
const resolver = createDefaultPropertyResolver(model, original);
for (const name of ['shell_115_BFRed_Mrg_carpaint_0', 'shell_115_BFRed_Mrg_Mirroring_carpaint_0']) {
  const source = original.getRoot().listNodes().find(node => node.getName() === name);
  const target = model.getRoot().listNodes().find(node => node.getName() === name);
  if (!source?.getMesh() || !target?.getMesh()) throw new Error(`Missing door skin: ${name}`);
  const material = target.getMesh().listPrimitives()[0].getMaterial();
  const mesh = copyToDocument(model, original, [source.getMesh()], resolver).get(source.getMesh());
  const transform = new Matrix4().fromArray(target.getWorldMatrix()).invert()
    .multiply(new Matrix4().fromArray(source.getWorldMatrix()));
  for (const primitive of mesh.listPrimitives()) {
    primitive.setMaterial(material);
    transformPrimitive(primitive, transform.elements);
  }
  target.setMesh(mesh);
  const before = getBounds(source), after = getBounds(target);
  const error = Math.max(...before.min.map((v, i) => Math.abs(v - after.min[i])), ...before.max.map((v, i) => Math.abs(v - after.max[i])));
  if (error > .0001) throw new Error(`Door bounds changed: ${name}`);
  console.log(`${name}: original geometry restored with bounds error ${error.toExponential(2)}`);
}
const buffer = model.getRoot().listBuffers()[0];
for (const accessor of model.getRoot().listAccessors()) accessor.setBuffer(buffer);
await model.transform(prune());
await io.write('public/models/vezel.glb', model);
