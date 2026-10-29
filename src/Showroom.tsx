import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { Center, ContactShadows, Html, OrbitControls, useGLTF } from '@react-three/drei';
import { Box3, Vector3 } from 'three';
import { RotateCw, Hand, Expand } from 'lucide-react';
import Car from './Car';
import { greeting, modelUrl } from './config';

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
function LoadedCar() {
  const { scene } = useGLTF(modelUrl!);
  const size = new Box3().setFromObject(scene).getSize(new Vector3());
  return <Center bottom><primitive object={scene} scale={4.4 / Math.max(size.x, size.y, size.z)} rotation={[0, greeting.modelRotation, 0]}/></Center>;
}
function supportsWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}
export default function Showroom({ reduced }: { reduced: boolean }) {
  const [rotate, setRotate] = useState(false);
  const [visible, setVisible] = useState(true);
  const [available] = useState(supportsWebGL);
  const [modelFailed, setModelFailed] = useState(false);
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
    <div className="scene-index"><span className="live-dot"/> THE SHOWROOM <span>01 / 01</span></div>
    <div className="vehicle-watermark" aria-hidden="true">VEZEL</div>
    <div className="canvas-wrap" aria-label="Interactive vehicle showroom">
      {available ? <SceneBoundary fallback={fallback}><Canvas tabIndex={0} aria-label="3D vehicle. Drag to orbit and scroll to zoom. The rotation button below offers a keyboard-accessible tour." dpr={[1, 1.5]} camera={{ position: [6.8, 3, 6.8], fov: 36 }} frameloop={!visible ? 'never' : rotate && !reduced ? 'always' : 'demand'} gl={{ antialias: true, powerPreference: 'low-power' }}>
        <color attach="background" args={['#121410']}/><fog attach="fog" args={['#121410', 14, 30]}/>
        <ambientLight intensity={1.15}/><hemisphereLight args={['#e9e9d9', '#292d20', 2]}/>
        <directionalLight position={[3, 7, 5]} intensity={3}/><pointLight position={[-4, 4, -3]} intensity={50} color="#c3a371"/>
        <Suspense fallback={<Html center><span className="loading" role="status">Preparing your showroom…</span></Html>}>
          <group position={[0, -.9, 0]}>
            {modelUrl ? <SceneBoundary fallback={<FailedModel report={() => setModelFailed(true)}/>}><LoadedCar/></SceneBoundary> : <Car/>}
            <ContactShadows position={[0, -.01, 0]} opacity={.65} scale={12} blur={2.5} far={4} resolution={256} frames={1}/>
            <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -.03, 0]}><circleGeometry args={[30, 64]}/><meshStandardMaterial color="#20231a" metalness={.45} roughness={.32}/></mesh>
            <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -.02, 0]}><ringGeometry args={[3.65, 3.66, 96]}/><meshBasicMaterial color="#786544" transparent opacity={.65}/></mesh>
          </group>
        </Suspense>
        <OrbitControls makeDefault enablePan={false} enableZoom={true} minDistance={5} maxDistance={12} minPolarAngle={.65} maxPolarAngle={Math.PI/2.05} autoRotate={rotate && !reduced && visible} autoRotateSpeed={.55} target={[0, -.1, 0]}/>
      </Canvas></SceneBoundary> : fallback}
    </div>
    <div className="scene-footer"><p>{modelUrl && !modelFailed ? 'Your vehicle, in a new light.' : 'Original crossover study · illustrative preview'}</p><span><Hand size={14}/> Drag to explore</span></div>
    <div className="viewer-actions"><button disabled={!available || reduced} aria-pressed={rotate} onClick={() => setRotate(!rotate)}><RotateCw size={15}/>{rotate ? 'Pause rotation' : 'Rotate the model'}</button><button onClick={() => { container.current?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'center' }); container.current?.querySelector('canvas')?.focus(); }}><Expand size={15}/>Explore the car</button></div>
  </div>;
}
function FailedModel({ report }: { report: () => void }) {
  useEffect(report, []);
  return <Car/>;
}
