import { RoundedBox } from '@react-three/drei';

// An original, stylized crossover sculpture. This is not a Honda model.
export default function Car() {
  return <group position={[0, -.12, 0]}>
    <RoundedBox args={[4.4, .66, 1.86]} radius={.2} position={[0, .82, 0]} smoothness={4}>
      <meshStandardMaterial color="#d8d5ca" metalness={.72} roughness={.24} />
    </RoundedBox>
    <RoundedBox args={[4.25, .24, 1.8]} radius={.1} position={[0, .49, 0]}><meshStandardMaterial color="#161918" metalness={.5} roughness={.35}/></RoundedBox>
    <RoundedBox args={[2.55, .77, 1.58]} radius={.24} position={[-.2, 1.4, 0]}><meshStandardMaterial color="#111d22" metalness={.7} roughness={.12}/></RoundedBox>
    <RoundedBox args={[2.34, .1, 1.55]} radius={.04} position={[-.27, 1.8, 0]}><meshStandardMaterial color="#d0cfc6" metalness={.75} roughness={.22}/></RoundedBox>
    {[-.85, .47].map(x => <mesh key={x} position={[x, 1.42, 0]}><boxGeometry args={[.065, .63, 1.6]}/><meshStandardMaterial color="#242927"/></mesh>)}
    {[-1.38, 1.38].flatMap(x => [-.94, .94].map(z => <group key={`${x}${z}`} position={[x, .46, z]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh><cylinderGeometry args={[.47, .47, .26, 32]}/><meshStandardMaterial color="#111211" roughness={.9}/></mesh>
      <mesh position={[0, z > 0 ? .145 : -.145, 0]}><cylinderGeometry args={[.31, .31, .02, 24]}/><meshStandardMaterial color="#a5aaa9" metalness={.9} roughness={.2}/></mesh>
      {Array.from({ length: 5 }, (_, i) => <mesh key={i} rotation={[0, i * Math.PI / 5, 0]} position={[0, z > 0 ? .16 : -.16, 0]}><boxGeometry args={[.055, .025, .58]}/><meshStandardMaterial color="#343b3b" metalness={.8}/></mesh>)}
    </group>))}
    {[-.67, .67].map(z => <group key={z}>
      <mesh position={[2.2, .94, z]} rotation={[0, Math.PI/2, 0]}><boxGeometry args={[.43, .055, .025]}/><meshStandardMaterial color="#f8f4dc" emissive="#fff4c3" emissiveIntensity={2}/></mesh>
      <mesh position={[-2.2, .94, z]}><boxGeometry args={[.025, .065, .42]}/><meshStandardMaterial color="#9c1919" emissive="#dd2929" emissiveIntensity={1}/></mesh>
      <RoundedBox args={[.28, .13, .2]} radius={.04} position={[.67, 1.28, z*1.35]}><meshStandardMaterial color="#c7c9bf" metalness={.7} roughness={.2}/></RoundedBox>
    </group>)}
    <mesh position={[2.214, .67, 0]}><boxGeometry args={[.018, .22, 1.15]}/><meshStandardMaterial color="#171b19"/></mesh>
    {[-.94, .94].map(z => <group key={z}>
      <mesh position={[-.12, .98, z]}><boxGeometry args={[.025, .42, .008]}/><meshStandardMaterial color="#72756d"/></mesh>
      {[-.83, .47].map(x => <mesh key={x} position={[x, 1.07, z]}><boxGeometry args={[.18, .025, .025]}/><meshStandardMaterial color="#4d534f" metalness={.9}/></mesh>)}
    </group>)}
  </group>;
}
