import { Box3, BufferGeometry, Float32BufferAttribute, Group, Mesh, MeshStandardMaterial, Vector3, type Material, type Object3D } from 'three';
import { fitFrontBadge } from './badge';

const SOURCE_INSERTS = ['Object001_chrome_0', 'GN_PARTS_v02_VEZEL_RS_Parts_shell_17_black_0', 'GN_PARTS_v02_VEZEL_RS_Parts_shell_40_Lightset_01_black_gloss_0'];
// Normalized silhouette measured from the source insert, bottom to top.
const outline = [[0, .93], [.15, .965], [.4, .995], [.63, 1], [.78, .965], [.9, .89], [1, .785]];
function widthAt(t: number) {
  for (let i = 1; i < outline.length; i++) if (t <= outline[i][0]) {
    const [y0, w0] = outline[i - 1], [y1, w1] = outline[i];
    return w0 + (w1 - w0) * (t - y0) / (y1 - y0);
  }
  return outline.at(-1)![1];
}

/** Replace only the RS insert with eight curved, solid horizontal bars. */
export function replaceGrille(root: Object3D, paint: Material) {
  root.updateMatrixWorld(true);
  const source = root.getObjectByName(SOURCE_INSERTS[2]);
  if (!(source instanceof Mesh)) return;
  const bounds = new Box3().setFromObject(source, true);
  const size = bounds.getSize(new Vector3());
  const centerX = (bounds.min.x + bounds.max.x) / 2, halfWidth = size.x / 2;
  const bottom = bounds.min.y, height = size.y;
  // Match the existing curvature while sitting behind the unchanged Honda badge.
  const surfaceZ = (x: number, y: number) => bounds.max.z - .009 - .12 * (y - bottom) - .065 * ((x - centerX) / halfWidth) ** 2;
  const black = new MeshStandardMaterial({ color: '#101112', roughness: .34, metalness: .12 });
  const grille = new Group();
  grille.name = 'Custom_horizontal_body_color_grille';
  const inverseRoot = root.matrixWorld.clone().invert();
  const badge = root.getObjectByName('LOGO_FRONT_H_RS_chrome_0');
  const badgeCenter = badge ? new Box3().setFromObject(badge, true).getCenter(new Vector3()) : new Vector3(centerX, .519, 0);
  const badgeOpening = fitFrontBadge(root, grille, surfaceZ(badgeCenter.x, badgeCenter.y), inverseRoot, black);
  function addSurface(name: string, vertices: number[], indices: number[], material: Material) {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    geometry.applyMatrix4(inverseRoot);
    const mesh = new Mesh(geometry, material);
    mesh.name = name;
    grille.add(mesh);
  }
  // Real dark recesses between the separate bars, following the curved opening.
  const backing: number[] = [], backingIndices: number[] = [];
  const slices = 32;
  for (let i = 0; i <= slices; i++) {
    const t = i / slices, y = bottom + height * t, extent = halfWidth * widthAt(t);
    for (let j = 0; j <= slices; j++) {
      const x = centerX - extent + 2 * extent * j / slices;
      backing.push(x, y, surfaceZ(x, y) - .019);
      if (i < slices && j < slices) {
        const a = i * (slices + 1) + j, b = a + slices + 1;
        backingIndices.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
  }
  addSurface('Recessed_dark_grille_backing', backing, backingIndices, black);
  // Closed, beveled sections stay three dimensional when the car is orbited.
  function bar(name: string, y: number, from: number, to: number, material: Material, thickness: number) {
    const vertices: number[] = [], indices: number[] = [];
    const h = thickness / 2, depth = .012, bevel = Math.min(.002, h * .3);
    const profile = [[-h + bevel, 0], [h - bevel, 0], [h, -bevel], [h, -depth + bevel], [h - bevel, -depth], [-h + bevel, -depth], [-h, -depth + bevel], [-h, -bevel]];
    const segments = 32;
    for (let i = 0; i <= segments; i++) {
      const x = from + (to - from) * i / segments;
      for (const [dy, dz] of profile) vertices.push(x, y + dy, surfaceZ(x, y) + dz);
      if (i < segments) for (let p = 0; p < 8; p++) {
        const a = i * 8 + p, b = i * 8 + (p + 1) % 8;
        indices.push(a, a + 8, b, b, a + 8, b + 8);
      }
    }
    for (let p = 1; p < 7; p++) {
      indices.push(0, p + 1, p);
      const end = segments * 8;
      indices.push(end, end + p, end + p + 1);
    }
    addSurface(name, vertices, indices, material);
  }
  for (let i = 0; i < 8; i++) {
    const t = .085 + i * .112, y = bottom + height * t;
    const extent = halfWidth * widthAt(t) - .008, thickness = height * .052;
    const opening = badgeOpening?.(y, thickness);
    if (opening) {
      bar(`White_horizontal_bar_${i + 1}_left`, y, centerX - extent, opening.left, paint, thickness);
      bar(`White_horizontal_bar_${i + 1}_right`, y, opening.right, centerX + extent, paint, thickness);
    } else bar(`White_horizontal_bar_${i + 1}`, y, centerX - extent, centerX + extent, paint, thickness);
  }
  const browY = bottom + height * .965, browExtent = halfWidth * widthAt(.965);
  bar('Black_upper_brow', browY, centerX - browExtent, centerX + browExtent, black, height * .065);
  // Narrow painted perimeter inside the unchanged bumper aperture.
  const edgeVertices: number[] = [], edgeIndices: number[] = [];
  for (const side of [-1, 1]) {
    const start = edgeVertices.length / 3;
    for (let i = 0; i <= 32; i++) {
      const t = i / 32 * .93, y = bottom + height * t, edge = centerX + side * halfWidth * widthAt(t);
      for (const x of [edge - .0055, edge + .0055]) edgeVertices.push(x, y, surfaceZ(x, y));
      if (i < 32) { const a = start + i * 2; edgeIndices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
  }
  addSurface('Painted_side_surround', edgeVertices, edgeIndices, paint);
  bar('Painted_lower_surround', bottom + .005, centerX - halfWidth * .925, centerX + halfWidth * .925, paint, .01);
  for (const name of SOURCE_INSERTS) {
    const mesh = root.getObjectByName(name);
    if (mesh) mesh.visible = false;
  }
  root.add(grille);
}
