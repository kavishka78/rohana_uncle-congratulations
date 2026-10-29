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

/** Keep the right rear door's painted lip behind its black upper-window trim. */
export function repairRightRearTrim(root: Object3D) {
  root.updateMatrixWorld(true);
  const door = root.getObjectByName('shell_126_BFRed_Mrg_Mirroring_carpaint_0');
  if (!(door instanceof Mesh)) return;
  const geometry = door.geometry.clone();
  const position = geometry.getAttribute('position');
  const inverse = door.matrixWorld.clone().invert();
  const point = new Vector3();
  for (let i = 0; i < position.count; i++) {
    point.fromBufferAttribute(position, i).applyMatrix4(door.matrixWorld);
    if (point.x < -.62 && point.x > -.70 && point.y > 1.16 && point.y < 1.22
      && point.z > -.8 && point.z < -.45) {
      point.x += .002;
      point.applyMatrix4(inverse);
      position.setXYZ(i, point.x, point.y, point.z);
    }
  }
  position.needsUpdate = true;
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  door.geometry = geometry;
}
