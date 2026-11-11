// Step 5 v0: the Earth = a simple blue sphere.
// meshStandardMaterial reacts to light — with the Sun's directionalLight,
// the lit side (day) and the dark side (night) become visible.
export function Earth() {
  return (
    <mesh position={[0, 0, -20]}>
      <sphereGeometry args={[5, 32, 32]} />
      <meshStandardMaterial color="#2266cc" />
    </mesh>
  );
}
