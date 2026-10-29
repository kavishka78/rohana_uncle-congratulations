import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { Center, ContactShadows, OrbitControls, useGLTF } from '@react-three/drei';
import { Box3, Vector3, Mesh, MeshPhysicalMaterial, MeshStandardMaterial } from 'three';
import { RotateCw, Hand, Expand } from 'lucide-react';
import Car from './Car';
import { greeting, modelUrl } from './config';
import { replaceGrille } from './grille';
import { repairDoorBlockers, repairRightRearTrim } from './doorFix';
import { addPersonalPlates } from './plates';

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
function LoadedCar({ onLoaded }: { onLoaded: () => void }) {
  const { scene: originalScene } = useGLTF(modelUrl!, false, true);
  const scene = useMemo(() => {
    const copy = originalScene.clone(true);
    copy.updateMatrixWorld(true);
    const pearlPaint = new MeshPhysicalMaterial({
      name: 'Sunlight white pearl preview',
      color: greeting.carPaint,
      metalness: .12,
      roughness: .28,
      clearcoat: .85,
      clearcoatRoughness: .18,
      iridescence: .08,
      iridescenceIOR: 1.3,
    });
    copy.traverse(object => {
      if (!(object instanceof Mesh)) return;
      // Only the small front RS emblem and its backing, not the Honda emblem.
      if (['GN_PARTS_v02_VEZEL_RS_Parts_shell_28_Lightset_01_chrome_0',
        'GN_PARTS_v02_VEZEL_RS_Parts_shell_36_Lightset_01_red_0',
        'GN_PARTS_v02_VEZEL_RS_Parts_shell_78_Lightset_01_black_gloss_0',
        'GN_PARTS_v02_VEZEL_RS_Parts_shell_4_Lightset_01_chrome_0',
        'pasted__GN_v01_RS_Parts_shell_2_Lightset_01_red_0'].includes(object.name)) {
        object.visible = false;
        return;
      }
      const recolor = (material: MeshStandardMaterial) => {
        return material.name === 'carpaint' || material.name === 'carpaint_second'
          ? pearlPaint : material;
      };
      object.material = Array.isArray(object.material) ? object.material.map(recolor) : recolor(object.material);
    });
    replaceGrille(copy, pearlPaint);
    repairDoorBlockers(copy);
    repairRightRearTrim(copy);
    addPersonalPlates(copy);
    return copy;
  }, [originalScene]);
  useEffect(onLoaded, []);
  const scale = useMemo(() => {
    scene.updateMatrixWorld(true);
    const size = new Box3().setFromObject(scene, true).getSize(new Vector3());
    return 4.4 / Math.max(size.x, size.y, size.z);
  }, [scene]);
  return <Center top precise><group scale={scale} rotation={[0, greeting.modelRotation, 0]}><primitive object={scene}/></group></Center>;
}
function supportsWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}
export default function Showroom({ reduced }: { reduced: boolean }) {
  const [rotate, setRotate] = useState(false);
  const [visible, setVisible] = useState(true);
  const [available] = useState(supportsWebGL);
  const [modelFailed, setModelFailed] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (container.current) observer.observe(container.current);
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);
  const fallback = <div className="scene-fallback"><div className="car-silhouette"><span/><i/><b/><em/></div><p>A beautiful road ahead.</p><small>Interactive 3D is unavailable on this device.</small></div>;
  return <div className="showroom" ref={container} id="showroom">
    <div className="scene-index"><span className="live-dot"/> THE SHOWROOM</div>
    <div className="vehicle-watermark" aria-hidden="true">VEZEL</div>
    <div className="canvas-wrap" aria-label="Interactive vehicle showroom">
      {available && modelUrl && !modelLoaded && !modelFailed && <div className="model-loading loading" role="status">Preparing your showroom…</div>}
      {available ? <SceneBoundary fallback={fallback}><Canvas tabIndex={0} aria-label="3D vehicle. Drag to orbit and scroll to zoom. The rotation button below offers a keyboard-accessible tour." dpr={[1, 1.5]} camera={{ position: [6.8, 3, 6.8], fov: 36 }} frameloop={!visible ? 'never' : rotate && !reduced ? 'always' : 'demand'} gl={{ antialias: true, powerPreference: 'low-power' }}>
        <color attach="background" args={['#121410']}/><fog attach="fog" args={['#121410', 14, 30]}/>
        <ambientLight intensity={1.15}/><hemisphereLight args={['#e9e9d9', '#292d20', 2]}/>
        <directionalLight position={[3, 7, 5]} intensity={3}/><pointLight position={[-4, 4, -3]} intensity={50} color="#c3a371"/>
        <Suspense fallback={null}>
          <group position={[0, -.9, 0]}>
            {modelUrl ? <SceneBoundary fallback={<FailedModel report={() => setModelFailed(true)}/>}><LoadedCar onLoaded={() => setModelLoaded(true)}/></SceneBoundary> : <Car/>}
            <ContactShadows position={[0, -.01, 0]} opacity={.65} scale={12} blur={2.5} far={4} resolution={256} frames={1}/>
            <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -.03, 0]}><circleGeometry args={[30, 64]}/><meshStandardMaterial color="#20231a" metalness={.45} roughness={.32}/></mesh>
            <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -.02, 0]}><ringGeometry args={[3.65, 3.66, 96]}/><meshBasicMaterial color="#786544" transparent opacity={.65}/></mesh>
          </group>
        </Suspense>
        <OrbitControls makeDefault enablePan={false} enableZoom={true} minDistance={5} maxDistance={12} minPolarAngle={.65} maxPolarAngle={Math.PI/2.05} autoRotate={rotate && !reduced && visible} autoRotateSpeed={.55} target={[0, -.1, 0]}/>
      </Canvas></SceneBoundary> : fallback}
    </div>
</div>;
}
function FailedModel({ report }: { report: () => void }) {
  useEffect(report, []);
  return <Car/>;
}
