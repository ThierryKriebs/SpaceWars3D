// The ShiftSimple mockup (the "pencil" placeholder ship) — pure visuals, no logic (models/ decide nothing).
export function ShiftSimple() {
  return (
    <group>
      {/* nose cone, pointing forward (-z) */}
      <mesh position={[0, 0, -1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.4, 1.5, 8]} />
        <meshStandardMaterial color="#99aabb" />
      </mesh>
      {/* fuselage, stretched along z */}
      <mesh position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 3, 8]} />
        <meshStandardMaterial color="#667788" />
      </mesh>
    </group>
  );
}
