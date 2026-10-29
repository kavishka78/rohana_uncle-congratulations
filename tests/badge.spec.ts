import { expect, test } from '@playwright/test';
import { Box3, BoxGeometry, BufferAttribute, Group, Mesh, MeshStandardMaterial } from 'three';
import { fitFrontBadge } from '../src/badge';

test('compressed badge coordinates produce a silver layer snugly ahead of blue', () => {
  function compressedBadge(name: string, scale: [number, number, number], z: number) {
    const geometry = new BoxGeometry(2, 2, 2);
    const positions = geometry.getAttribute('position');
    const encoded = new Int16Array(positions.count * 3);
    for (let i = 0; i < positions.count; i++) {
      encoded[i * 3] = positions.getX(i) * 32767;
      encoded[i * 3 + 1] = positions.getY(i) * 32767;
      encoded[i * 3 + 2] = positions.getZ(i) * 32767;
    }
    geometry.setAttribute('position', new BufferAttribute(encoded, 3, true));
    const mesh = new Mesh(geometry, new MeshStandardMaterial());
    mesh.name = name;
    mesh.scale.set(...scale);
    mesh.position.set(0, .52, z);
    return mesh;
  }
  const root = new Group();
  const silver = compressedBadge('LOGO_FRONT_H_RS_chrome_0', [.067, .055, .005], 2.186);
  const blue = compressedBadge('Plane002_blue_0', [.059, .049, .002], 2.183);
  const sourceGeometry = silver.geometry;
  const originalCoordinates = Array.from(sourceGeometry.getAttribute('position').array);
  root.add(silver, blue);
  root.updateMatrixWorld(true);
  fitFrontBadge(root, new Group(), 2.16, root.matrixWorld.clone().invert(), new MeshStandardMaterial(), { centerY: .524, height: .104 });
  const silverBounds = new Box3().setFromObject(silver, true);
  const blueBounds = new Box3().setFromObject(blue, true);
  const gap = silverBounds.min.z - blueBounds.max.z;
  expect(gap).toBeGreaterThan(0);
  expect(gap).toBeLessThan(.0001);
  expect(silverBounds.max.z - blueBounds.max.z).toBeLessThan(.0002);
  expect(Math.abs(blueBounds.max.z - 2.16)).toBeLessThan(.003);
  expect(silver.geometry.getAttribute('position').array).toBeInstanceOf(Float32Array);
  expect(Array.from(sourceGeometry.getAttribute('position').array)).toEqual(originalCoordinates);
});
