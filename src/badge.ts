import { Box3, ExtrudeGeometry, Mesh, Shape, Vector3, type Group, type Material, type Matrix4, type Object3D } from 'three';

/** Seat the original emblem on a shallow backing following its rounded outline. */
export function fitFrontBadge(root: Object3D, grille: Group, grilleFront: number, inverseRoot: Matrix4, black: Material, slot: { centerY: number; height: number }) {
  const badges = ['LOGO_FRONT_H_RS_chrome_0', 'Plane002_blue_0']
    .map(name => root.getObjectByName(name)).filter((object): object is Mesh => object instanceof Mesh);
  if (!badges.length) return null;
  const bounds = new Box3();
  for (const badge of badges) bounds.union(new Box3().setFromObject(badge, true));
  const center = bounds.getCenter(new Vector3());
  // Fit between the two uninterrupted bordering slats, with a small clearance.
  const scale = Math.min(1, slot.height / (bounds.max.y - bounds.min.y + .0012));
  const width = (bounds.max.x - bounds.min.x) * scale + .0012;
  const height = (bounds.max.y - bounds.min.y) * scale + .0012;
  const radius = Math.min(.017, height / 4);
  // A thin emblem sits almost flush; its housing extends into the grille recess.
  const front = grilleFront + .0006;
  const emblemDepth = .003;
  const depthScale = emblemDepth / (bounds.max.z - bounds.min.z);
  for (const badge of badges) {
    const geometry = badge.geometry.clone();
    geometry.applyMatrix4(badge.matrixWorld);
    geometry.translate(-center.x, -center.y, -bounds.max.z);
    geometry.scale(scale, scale, depthScale);
    geometry.translate(center.x, slot.centerY, front);
    geometry.applyMatrix4(badge.matrixWorld.clone().invert());
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    badge.geometry = geometry;
  }
  // Preserve the front silhouette; flatten only the silver layer's depth so it
  // sits just ahead of the blue insert rather than projecting away from it.
  const silver = badges.find(badge => badge.name === 'LOGO_FRONT_H_RS_chrome_0');
  const blue = badges.find(badge => badge.name === 'Plane002_blue_0');
  if (silver && blue) {
    const silverBounds = new Box3().setFromObject(silver, true);
    const blueBounds = new Box3().setFromObject(blue, true);
    const depth = silverBounds.max.z - silverBounds.min.z;
    if (depth > 0) {
      const geometry = silver.geometry;
      const originalNormals = geometry.getAttribute('normal')?.clone();
      geometry.applyMatrix4(silver.matrixWorld);
      geometry.translate(0, 0, -silverBounds.min.z);
      geometry.scale(1, 1, .00028 / depth);
      geometry.translate(0, 0, blueBounds.max.z + .00012);
      geometry.applyMatrix4(silver.matrixWorld.clone().invert());
      // Keep the existing front-facing silver highlights while changing depth only.
      if (originalNormals) geometry.setAttribute('normal', originalNormals);
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
    }
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
  const depth = .02;
  const faceZ = front - emblemDepth - .0005;
  const geometry = new ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: .0003, bevelThickness: .0003, bevelSegments: 2, curveSegments: 10, steps: 1 });
  geometry.translate(center.x, slot.centerY, faceZ - depth);
  geometry.applyMatrix4(inverseRoot);
  const mount = new Mesh(geometry, black);
  mount.name = 'Fitted_rounded_Honda_badge_backing';
  grille.add(mount);

  // Slat ends follow the backing silhouette instead of leaving a square hole.
  return (y: number, thickness: number) => {
    const distance = Math.max(0, Math.abs(y - slot.centerY) - thickness / 2);
    if (distance >= halfH + .0003) return null;
    const cornerY = Math.max(0, distance - (halfH - radius));
    const extent = halfW - radius + Math.sqrt(Math.max(0, radius ** 2 - cornerY ** 2)) + .0005;
    return { left: center.x - extent, right: center.x + extent };
  };
}
