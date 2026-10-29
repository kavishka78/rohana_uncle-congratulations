import { Box3, BoxGeometry, CanvasTexture, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, Shape, ShapeGeometry, SRGBColorSpace, Vector3, type Object3D } from 'three';

function roundedPlate(width: number, height: number, radius: number) {
  const shape = new Shape();
  const x = width / 2, y = height / 2;
  shape.moveTo(-x + radius, -y);
  shape.lineTo(x - radius, -y);
  shape.quadraticCurveTo(x, -y, x, -y + radius);
  shape.lineTo(x, y - radius);
  shape.quadraticCurveTo(x, y, x - radius, y);
  shape.lineTo(-x + radius, y);
  shape.quadraticCurveTo(-x, y, -x, y - radius);
  shape.lineTo(-x, -y + radius);
  shape.quadraticCurveTo(-x, -y, -x + radius, -y);
  return shape;
}

/** Local canvas lettering avoids external fonts, images or texture requests. */
function plateLettering(height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = Math.round(1024 * height / .414);
  const context = canvas.getContext('2d');
  if (!context) return new MeshBasicMaterial({ color: '#f5f4ed' });
  context.fillStyle = '#f5f4ed';
  context.fillRect(0, 0, 1024, canvas.height);
  context.strokeStyle = '#242624';
  context.lineWidth = 7;
  context.strokeRect(16, 16, 992, canvas.height - 32);
  context.fillStyle = '#121413';
  context.font = '700 158px Arial, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('ROHANA', 512, canvas.height / 2 + 7, 825);
  // Small mounting screws; keep them well clear of the lettering.
  for (const x of [51, 973]) {
    context.fillStyle = '#8a8b83';
    context.beginPath(); context.arc(x, canvas.height / 2, 9, 0, Math.PI * 2); context.fill();
    context.strokeStyle = '#40433d'; context.lineWidth = 3;
    context.beginPath(); context.moveTo(x - 5, canvas.height / 2); context.lineTo(x + 5, canvas.height / 2); context.stroke();
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return new MeshBasicMaterial({ map: texture, toneMapped: false });
}

export function addPersonalPlates(root: Object3D) {
  const frameMaterial = new MeshStandardMaterial({ color: '#1a1c19', roughness: .38, metalness: .3 });
  const oldRear = root.getObjectByName('GN_v01_pCube_Fr_Hev_Material_#28_0')
    ?? root.getObjectByName('GN_v01_pCube_Fr_Hev_Material #28_0');
  const rearBounds = oldRear ? new Box3().setFromObject(oldRear, true) : null;
  if (oldRear) oldRear.visible = false;

  function plate(name: string, position: Vector3, rear: boolean, tilt = 0) {
    const group = new Group();
    group.name = name;
    // The rear aperture is taller than the front bracket; cover its full opening.
    const frameHeight = rear ? .174 : .124;
    const faceHeight = frameHeight - .01;
    const frame = new Mesh(new BoxGeometry(.424, frameHeight, .008), frameMaterial);
    frame.name = `${name}_frame`;
    const face = new Mesh(new ShapeGeometry(roundedPlate(.414, faceHeight, .005), 8), plateLettering(faceHeight));
    face.position.z = .0045;
    face.name = `${name}_ROHANA`;
    // ShapeGeometry UVs are planar coordinates; remap to the complete label.
    const uv = face.geometry.getAttribute('uv');
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) + .207) / .414, (uv.getY(i) + faceHeight / 2) / faceHeight);
    group.add(frame, face);
    group.position.copy(position);
    group.rotation.set(tilt, rear ? Math.PI : 0, 0);
    group.updateMatrix();
    group.applyMatrix4(root.matrixWorld.clone().invert());
    root.add(group);
  }
  // Below the upper grille, covering the original front plate mounting bracket.
  plate('Front_personal_number_plate', new Vector3(0, .288, 2.194), false);
  const rearCenter = rearBounds?.getCenter(new Vector3()) ?? new Vector3(0, .474, -2.112);
  rearCenter.z -= .002;
  // Match the shallow rake of the original rear mounting recess.
  plate('Rear_personal_number_plate', rearCenter, true, .34);
}
