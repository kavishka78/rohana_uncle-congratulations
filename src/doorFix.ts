import { Mesh, Vector3, type Object3D } from 'three';

/** Recess only the seam blocker poking through the two front door skins. */
export function repairDoorBlockers(root: Object3D) {
  root.updateMatrixWorld(true);
  const blocker = root.getObjectByName('Blocker_Bodycolor3_dark_0');
  if (!(blocker instanceof Mesh)) return;
  const geometry = blocker.geometry.clone();
  const position = geometry.getAttribute('position');
  const inverse = blocker.matrixWorld.clone().invert();
  const point = new Vector3();
  for (let i = 0; i < position.count; i++) {
    point.fromBufferAttribute(position, i).applyMatrix4(blocker.matrixWorld);
    // These two narrow strips run behind the front doors' trailing seams.
    // Keep the blocker, but move it inside the body so it still masks gaps.
    if (Math.abs(point.x) > .8 && point.z > -.33 && point.z < -.19
      && point.y > .15 && point.y < .86) {
      point.x -= Math.sign(point.x) * .025;
      point.applyMatrix4(inverse);
      position.setXYZ(i, point.x, point.y, point.z);
    }
  }
  position.needsUpdate = true;
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  blocker.geometry = geometry;
}
