import { Mesh, MeshStandardMaterial, Vector3, type Material } from 'three';

// The source combines the upper black brow and grille surround in one mesh.
// Separate its triangles by height without changing the original GLB.
export function paintGrille(mesh: Mesh, paint: Material) {
  const geometry = mesh.geometry.clone();
  const positions = geometry.getAttribute('position');
  const index = geometry.getIndex();
  const count = index ? index.count : positions.count;
  const painted: number[] = [];
  const brow: number[] = [];
  const vertex = new Vector3();
  for (let offset = 0; offset < count; offset += 3) {
    const triangle = [0, 1, 2].map(i => index ? index.getX(offset + i) : offset + i);
    const height = triangle.reduce((sum, i) => sum + vertex.fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld).y, 0) / 3;
    (height >= .59 ? brow : painted).push(...triangle);
  }
  geometry.setIndex([...painted, ...brow]);
  geometry.clearGroups();
  geometry.addGroup(0, painted.length, 0);
  geometry.addGroup(painted.length, brow.length, 1);
  mesh.geometry = geometry;
  mesh.material = [paint, new MeshStandardMaterial({ color: '#101112', roughness: .24, metalness: .15 })];
}
