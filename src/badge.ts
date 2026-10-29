import { Box3, ExtrudeGeometry, Mesh, Shape, Vector3, type Group, type Material, type Matrix4, type Object3D } from 'three';

/** Seat the original emblem on a shallow backing following its rounded outline. */
export function fitFrontBadge(root: Object3D, grille: Group, grilleFront: number, inverseRoot: Matrix4, black: Material) {
  const badges = ['LOGO_FRONT_H_RS_chrome_0', 'Plane002_blue_0']
    .map(name => root.getObjectByName(name)).filter((object): object is Mesh => object instanceof Mesh);
  if (!badges.length) return null;
  const bounds = new Box3();
  for (const badge of badges) bounds.union(new Box3().setFromObject(badge, true));
  const center = bounds.getCenter(new Vector3());
  const width = bounds.max.x - bounds.min.x + .004;
  const height = bounds.max.y - bounds.min.y + .004;
  const radius = Math.min(.017, height / 4);
  // Just 3 mm proud of the bars, rather than the original ~30 mm gap.
  const offset = grilleFront + .003 - bounds.max.z;
  for (const badge of badges) {
    const geometry = badge.geometry.clone();
    geometry.applyMatrix4(badge.matrixWorld);
    geometry.translate(0, 0, offset);
    geometry.applyMatrix4(badge.matrixWorld.clone().invert());
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    badge.geometry = geometry;
  }
  const halfW = width / 2, halfH = height / 2;
  const shape = new Shape();
  shape.moveTo(-halfW + radius, -halfH);
  shape.lineTo(halfW - radius, -halfH);
  shape.absarc(halfW - radius, -halfH + radius, radius, -Math.PI / 2, 0, false);
  shape.lineTo(halfW, halfH - radius);
  shape.absarc(halfW - radius, halfH - radius, radius, 0, Math.PI / 2, false);
  shape.lineTo(-halfW + radius, halfH);
  shape.absarc(-halfW + radius, halfH - radius, radius, Math.PI / 2, Math.PI, false);
  shape.lineTo(-halfW, -halfH + radius);
  shape.absarc(-halfW + radius, -halfH + radius, radius, Math.PI, Math.PI * 1.5, false);
  shape.closePath();
  const depth = .008;
  const faceZ = bounds.min.z + offset - .0018;
  const geometry = new ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: .001, bevelThickness: .001, bevelSegments: 2, curveSegments: 10, steps: 1 });
  geometry.translate(center.x, center.y, faceZ - depth);
  geometry.applyMatrix4(inverseRoot);
  const mount = new Mesh(geometry, black);
  mount.name = 'Fitted_rounded_Honda_badge_backing';
  grille.add(mount);

  // Slat ends follow the backing silhouette instead of leaving a square hole.
  return (y: number, thickness: number) => {
    const distance = Math.max(0, Math.abs(y - center.y) - thickness / 2);
    if (distance >= halfH + .001) return null;
    const cornerY = Math.max(0, distance - (halfH - radius));
    const extent = halfW - radius + Math.sqrt(Math.max(0, radius ** 2 - cornerY ** 2)) + .001;
    return { left: center.x - extent, right: center.x + extent };
  };
}
