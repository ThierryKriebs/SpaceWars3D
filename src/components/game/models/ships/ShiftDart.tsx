/* ============================================================================
   SHIP "SHIFT DART" (Space Combat 3D)
   ============================================================================
   INTEGRATION CONTRACT (for the coding agent):

   1. PLACEMENT: TWO files.
      - `models/ships/shared/ThrusterKit.tsx`  (separate file: the propulsion
        kit shared by the whole fleet — commands, translator,
        registry, nozzle, light studio)
      - `models/ships/ShiftDart.tsx`          (this file: the RCS table and
        the shift dart hull)
      This file imports the kit: `import { ... } from "./shared/ThrusterKit"`.

   2. WIRING in the game scene:
      const ctl = useRef(makeShipCommands());
      // every frame, the piloting layer FILLS ctl.current from ship.intent:
      //   ctl.current.pitch / yaw / roll / trans / strafe / lift / thrust ...
      // then:
      //   <group ref={shipGroup}>   // <- newton moves THIS group
      //     <ShiftDart ctlRef={ctl} />
      //   </group>
      // Optional: onRegistry={reg => ...} to receive the nozzle registry
      // (access by name: tutorial, HUD, damage).
      // Lighting: <ShipEnv/> (from the kit, mounted once in Scene) or the game env.

   3. DIVISION OF LABOR:
      - newton.ts: the laws of motion (ignores the ships).
      - ThrusterKit: the gas effect, ONCE for all ships.
        (Particle day: we only touch the kit.)
      - This file: the shift dart HARDWARE — its RCS table (where the
        holes are, which one lights for which command) and its hull.

   4. A SECOND SHIP? New file with ITS table and ITS hull, importing the
      same kit. No duplication of the effect.
   ============================================================================ */

import React, { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  makeShipCommands,
  nozzleIntensity,
  ShipCommands,
  ShipEnv,
  Thruster,
  ThrusterRegistry,
  type RcsNozzle,
  type Vec3,
} from "./shared/ThrusterKit";

export { makeShipCommands, ShipEnv, nozzleIntensity };

/* ============================================================================
   THE SHIFT DART RCS TABLE — the single source of truth for ITS hardware.
   Id convention: system-side-height (nose-R-T, tail-L-B...).
   Add/remove a nozzle = one line here, NOTHING else.
   ============================================================================ */

export const RCS_NOZZLES: RcsNozzle[] = [
  // ---- NOSE (max lever arm on z: pitch + yaw) — drilled
  //      INTO THE 4 FACETS of the hull diamond, tangent plate.
  //      Jets of the same command leave in MIRROR PAIRS →
  //      parasitic components cancel out: pure torque.
  { id: "nose-R-T", pos: [0.097, 0.076, -2.35], exhaust: [0.61, 0.78, -0.14], fires: { yaw: 1, pitch: -1 } },
  { id: "nose-R-B", pos: [0.097, -0.076, -2.35], exhaust: [0.61, -0.78, -0.14], fires: { yaw: 1, pitch: 1 } },
  { id: "nose-L-T", pos: [-0.097, 0.076, -2.35], exhaust: [-0.61, 0.78, -0.14], fires: { yaw: -1, pitch: -1 } },
  { id: "nose-L-B", pos: [-0.097, -0.076, -2.35], exhaust: [-0.61, -0.78, -0.14], fires: { yaw: -1, pitch: 1 } },
  // ---- TAIL (opposite torque to the nose, doubled) — 4 facets at z 1.85,
  //      behind the tanks: the plumes cross nothing.
  { id: "tail-R-T", pos: [0.085, 0.067, 1.85], exhaust: [0.61, 0.78, 0.14], fires: { pitch: 1, yaw: -1 } },
  { id: "tail-R-B", pos: [0.085, -0.067, 1.85], exhaust: [0.61, -0.78, 0.14], fires: { pitch: -1, yaw: -1 } },
  { id: "tail-L-T", pos: [-0.085, 0.067, 1.85], exhaust: [-0.61, 0.78, 0.14], fires: { pitch: 1, yaw: 1 } },
  { id: "tail-L-B", pos: [-0.085, -0.067, 1.85], exhaust: [-0.61, -0.78, 0.14], fires: { pitch: -1, yaw: 1 } },
  // ---- BOW BRAKES: front cap of the outer tanks,
  //      gas forward → force toward the tail: slow down / reverse.
  { id: "brake-R", pos: [1.48, -0.18, -0.65], exhaust: [0.74, 0, -0.68], fires: { trans: -1 } },
  { id: "brake-L", pos: [-1.48, -0.18, -0.65], exhaust: [-0.74, 0, -0.68], fires: { trans: -1 } },
  // ---- SOFT THRUST: top+bottom pairs in the rear cap of the
  //      main tanks → advance without aerospike (discreet approach).
  { id: "fwd-R-T", pos: [0.54, 0.022, 1.63], exhaust: [0, 0.79, 0.62], fires: { trans: 1 } },
  { id: "fwd-R-B", pos: [0.54, -0.262, 1.63], exhaust: [0, -0.79, 0.62], fires: { trans: 1 } },
  { id: "fwd-L-T", pos: [-0.54, 0.022, 1.63], exhaust: [0, 0.79, 0.62], fires: { trans: 1 } },
  { id: "fwd-L-B", pos: [-0.54, -0.262, 1.63], exhaust: [0, -0.79, 0.62], fires: { trans: 1 } },
  // ---- ROLL: top/bottom of the outer tanks (lever arm ±1.3 in x).
  { id: "roll-R-B", pos: [1.3, -0.427, 0.55], exhaust: [0, -1, 0], fires: { roll: 1 } },
  { id: "roll-R-T", pos: [1.3, 0.067, 0.55], exhaust: [0, 1, 0], fires: { roll: -1 } },
  { id: "roll-L-T", pos: [-1.3, 0.067, 0.55], exhaust: [0, 1, 0], fires: { roll: 1 } },
  { id: "roll-L-B", pos: [-1.3, -0.427, 0.55], exhaust: [0, -1, 0], fires: { roll: -1 } },
  // ---- STRAFE: flanks of the outer tanks — lateral gas, opposite force
  //      (force on ship = -exhaust: strafe +1 = right = gas ejected to the left)
  { id: "strafe-L", pos: [-1.3, -0.18, 0.55], exhaust: [-1, 0, 0], fires: { strafe: 1 } },
  { id: "strafe-R", pos: [1.3, -0.18, 0.55], exhaust: [1, 0, 0], fires: { strafe: -1 } },
  // ---- LIFT: bottom/top of the main tanks — vertical gas
  //      (lift +1 = up = gas ejected downward from the belly nozzles)
  { id: "lift-L-B", pos: [-0.54, -0.42, 0.6], exhaust: [0, -1, 0], fires: { lift: 1 } },
  { id: "lift-R-B", pos: [0.54, -0.42, 0.6], exhaust: [0, -1, 0], fires: { lift: 1 } },
  { id: "lift-L-T", pos: [-0.54, 0.45, 0.6], exhaust: [0, 1, 0], fires: { lift: -1 } },
  { id: "lift-R-T", pos: [0.54, 0.45, 0.6], exhaust: [0, 1, 0], fires: { lift: -1 } },
];

/* ============================================================================
   SHIFT DART MATERIALS
   ============================================================================ */

const WHITE = { color: "#f5f7fa", metalness: 0.18, roughness: 0.24, envMapIntensity: 1.15, flatShading: true } as const;
const DARKMETAL = { color: "#39424e", metalness: 0.9, roughness: 0.28, envMapIntensity: 1.2, flatShading: true } as const;
const ACCENT = "#f97316";

/* ============================================================================
   HULL — faceted shift dart, NO control surfaces (no air: no wings).
   Flat facets (F-117) bounce the radar away from
   the emitter: stealth.
   ============================================================================ */

function Octa({ scale, position, rotation, glass }: { scale: Vec3; position?: Vec3; rotation?: Vec3; glass?: boolean }) {
  return (
    <mesh scale={scale} position={position} rotation={rotation}>
      <octahedronGeometry args={[1, 0]} />
      {glass ? (
        <meshStandardMaterial color="#0d1622" metalness={0.95} roughness={0.07} envMapIntensity={2.6} flatShading />
      ) : (
        <meshStandardMaterial {...WHITE} />
      )}
    </mesh>
  );
}

function Fuselage() {
  return (
    <group>
      <Octa scale={[0.66, 0.52, 2.9]} position={[0, 0, -0.3]} />
      <mesh position={[0, 0.2, -1.62]} scale={[0.22, 0.15, 0.52]}>
        <sphereGeometry args={[1, 32, 20]} />
        <meshStandardMaterial color="#0d1622" metalness={0.95} roughness={0.05} envMapIntensity={2.6} />
      </mesh>
      <mesh position={[0, 0.31, -0.6]}>
        <boxGeometry args={[0.028, 0.028, 2.6]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={1.4} />
      </mesh>
    </group>
  );
}

function DorsalSpine() {
  return (
    <group>
      <mesh position={[0, 0.41, -0.75]} scale={[0.2, 0.085, 0.55]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial {...WHITE} flatShading={false} />
      </mesh>
      <mesh position={[0, 0.42, -0.75]}>
        <boxGeometry args={[0.14, 0.012, 0.02]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[0, 0.42, 0.15]} scale={[0.09, 0.09, 0.13]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#101821" metalness={0.9} roughness={0.08} envMapIntensity={2.2} />
      </mesh>
      <mesh position={[0, 0.36, 0.72]}>
        <boxGeometry args={[0.018, 0.18, 0.28]} />
        <meshStandardMaterial {...WHITE} />
      </mesh>
      <mesh position={[0, 0.47, 0.72]}>
        <boxGeometry args={[0.02, 0.045, 0.06]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={1.6} />
      </mesh>
    </group>
  );
}

function Tank({ side }: { side: 1 | -1 }) {
  return (
    <group position={[0.6 * side, -0.12, 0.6]} scale={0.9}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 2.2, 8]} />
        <meshStandardMaterial {...WHITE} />
      </mesh>
      <mesh position={[0, 0, -1.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.35, 0.55, 8]} />
        <meshStandardMaterial {...WHITE} />
      </mesh>
      <mesh position={[0, 0, 1.12]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.35, 0.45, 8]} />
        <meshStandardMaterial {...WHITE} />
      </mesh>
      <mesh position={[0, 0, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.358, 0.358, 0.16, 8, 1, true]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.362, 0.362, 0.09, 8, 1, true]} />
        <meshStandardMaterial {...DARKMETAL} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function OutTank({ side }: { side: 1 | -1 }) {
  return (
    <group>
      <group position={[1.3 * side, -0.18, 0.55]} scale={[1, 0.7725, 1]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 2.1, 8]} />
          <meshStandardMaterial {...WHITE} />
        </mesh>
        <mesh position={[0, 0, -1.225]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.32, 0.35, 8]} />
          <meshStandardMaterial {...WHITE} />
        </mesh>
        <mesh position={[0, 0, 1.225]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.32, 0.35, 8]} />
          <meshStandardMaterial {...WHITE} />
        </mesh>
      </group>
      <mesh position={[1.3 * side, -0.18, 1.91]}>
        <boxGeometry args={[0.18, 0.08, 0.03]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={1.6} />
      </mesh>
      <mesh position={[1.0 * side, -0.12, 0.55]} scale={[0.16, 0.13, 1.1]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial {...WHITE} />
      </mesh>
    </group>
  );
}

/* ============================================================================
   MAIN ENGINE — ring aerospike (bell + spike, ring-shaped gas).
   Specific to the shift dart: another ship will have another rear nozzle.
   ============================================================================ */

function MainEngine({ ctlRef }: { ctlRef: React.MutableRefObject<ShipCommands> }) {
  const plume = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = THREE.MathUtils.clamp(ctlRef.current.thrust, 0, 1);
    const flick = 0.92 + Math.sin(state.clock.elapsedTime * 42) * 0.08;
    const on = t > 0.01;
    if (plume.current) {
      plume.current.visible = on;
      plume.current.scale.set(0.55 + t * 0.6, 1 + t * 2.8, 0.55 + t * 0.6);
      // the flame IS BORN at the throat (z 2.59) and grows backward
      plume.current.position.z = 2.59 + (1 + t * 2.8) / 2;
      (plume.current.material as THREE.MeshBasicMaterial).opacity = (0.3 + t * 0.55) * flick;
    }
    if (core.current) {
      core.current.visible = on;
      core.current.scale.set(0.4 + t * 0.45, 1 + t * 1.8, 0.4 + t * 0.45);
      core.current.position.z = 2.6 + (1 + t * 1.8) / 2;
      (core.current.material as THREE.MeshBasicMaterial).opacity = (0.55 + t * 0.45) * flick;
    }
  });
  return (
    <group>
      <mesh position={[0, 0, 2.15]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.06, 0.6, 8]} />
        <meshStandardMaterial {...WHITE} />
      </mesh>
      <mesh position={[0, 0, 2.48]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.26, 0.24, 0.2, 8]} />
        <meshStandardMaterial {...DARKMETAL} />
      </mesh>
      <mesh position={[0, 0, 2.8]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.17, 0.45, 8]} />
        <meshStandardMaterial {...DARKMETAL} />
      </mesh>
      <mesh position={[0, 0, 2.585]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.175, 0.23, 8]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={1.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 2.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.24, 8]} />
        <meshBasicMaterial color="#05070a" />
      </mesh>
      <mesh ref={plume} position={[0, 0, 3.15]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.24, 1, 8]} />
        <meshBasicMaterial color="#ff9c3f" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={core} position={[0, 0, 2.85]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.13, 1, 8]} />
        <meshBasicMaterial color="#fff4e0" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ============================================================================
   LASER GUNS — compact gimbaled turrets. Aim: ctl.aim { p, y }
   (smoothed here) + default tube convergence toward z -10.
   ============================================================================ */

function Weapon({ side, ctlRef }: { side: 1 | -1; ctlRef: React.MutableRefObject<ShipCommands> }) {
  const bolt = useRef<THREE.Mesh>(null);
  const flash = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  const barrel = useRef<THREE.Group>(null);
  const aimP = useRef(0);
  const aimY = useRef(0);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const target = ctlRef.current.aim;
    aimP.current += (THREE.MathUtils.clamp(target.p, -0.13, 0.13) - aimP.current) * Math.min(1, 8 * d);
    aimY.current += (THREE.MathUtils.clamp(target.y, -0.16, 0.16) - aimY.current) * Math.min(1, 8 * d);
    const converge = -0.09 * side;
    if (barrel.current) {
      barrel.current.rotation.x = aimP.current;
      barrel.current.rotation.y = THREE.MathUtils.clamp(converge + aimY.current, -0.2, 0.2);
    }
    const on = ctlRef.current.fire;
    const flick = 0.75 + Math.sin(state.clock.elapsedTime * 70 + side) * 0.25;
    if (bolt.current) {
      bolt.current.visible = on;
      (bolt.current.material as THREE.MeshBasicMaterial).opacity = 0.85 * flick;
    }
    if (flash.current) {
      flash.current.visible = on;
      const s = 0.9 + flick * 0.35;
      flash.current.scale.set(s, s, s);
    }
    if (light.current) light.current.intensity = on ? 3 * flick : 0;
  });

  return (
    <group position={[0.86 * side, -0.12, -0.2]} scale={0.5}>
      <mesh position={[-0.02 * side, 0, 0]}>
        <octahedronGeometry args={[0.085, 0]} />
        <meshStandardMaterial {...DARKMETAL} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.05, 12, 8]} />
        <meshStandardMaterial {...DARKMETAL} />
      </mesh>
      <group ref={barrel}>
        <mesh position={[0, 0, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.032, 0.048, 0.55, 8]} />
          <meshStandardMaterial {...DARKMETAL} />
        </mesh>
        <mesh position={[0, 0, -0.69]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.026, 0.05, 8]} />
          <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={1.8} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={flash} position={[0, 0, -0.78]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
          <octahedronGeometry args={[0.075, 0]} />
          <meshBasicMaterial color="#dff4ff" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh ref={bolt} position={[0, 0, -5]} rotation={[Math.PI / 2, 0, 0]} visible={false}>
          <cylinderGeometry args={[0.04, 0.04, 7.2, 6]} />
          <meshBasicMaterial color="#bfeaff" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <pointLight ref={light} position={[0, 0, -0.85]} color="#9fdcff" intensity={0} distance={8} />
      </group>
    </group>
  );
}

/* ============================================================================
   VENTRAL MISSILE BAYS (F-22 style) — closed doors, smooth hull.
   ============================================================================ */

function MissileBay({ ctlRef }: { ctlRef: React.MutableRefObject<ShipCommands> }) {
  const doorR = useRef<THREE.Group>(null);
  const doorL = useRef<THREE.Group>(null);
  const open = useRef(0);

  useFrame((_, dt) => {
    const target = ctlRef.current.bayOpen ? 1 : 0;
    open.current += (target - open.current) * Math.min(1, 8 * dt);
    if (doorR.current) doorR.current.rotation.z = 2.14 + 1.85 * open.current;
    if (doorL.current) doorL.current.rotation.z = -2.14 - 1.85 * open.current;
  });

  const missile = (x: number, z: number) => (
    <group position={[x, -0.5, z]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.044, 0.044, 0.62, 8]} />
        <meshStandardMaterial color="#dfe5ec" metalness={0.4} roughness={0.4} flatShading />
      </mesh>
      <mesh position={[0, 0, -0.385]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.044, 0.15, 8]} />
        <meshStandardMaterial color="#dfe5ec" metalness={0.4} roughness={0.4} flatShading />
      </mesh>
      <mesh position={[0, 0, -0.27]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.046, 0.046, 0.06, 8, 1, true]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.8} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );

  return (
    <group>
      <mesh position={[0, -0.34, -0.2]} scale={[0.5, 0.2, 1.6]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial {...WHITE} />
      </mesh>
      <mesh position={[0, -0.42, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 2.6, 8, 1, true]} />
        <meshStandardMaterial {...WHITE} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.42, -1.49]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 8]} />
        <meshStandardMaterial {...WHITE} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.42, 1.09]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 8]} />
        <meshStandardMaterial {...WHITE} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.42, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.285, 0.285, 2.58, 8, 1, true]} />
        <meshStandardMaterial color="#141a22" roughness={0.9} side={THREE.BackSide} />
      </mesh>
      <mesh position={[0, -0.7, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.24, 0.3, 8]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.7} side={THREE.DoubleSide} />
      </mesh>
      {[-0.95, -0.25, 0.45].map((z) => [missile(0.11, z), missile(-0.11, z)])}
      <group ref={doorR} position={[0.295, -0.53, -0.2]}>
        <mesh position={[0, 0.175, 0]}>
          <boxGeometry args={[0.04, 0.36, 2.56]} />
          <meshStandardMaterial {...WHITE} />
        </mesh>
      </group>
      <group ref={doorL} position={[-0.295, -0.53, -0.2]}>
        <mesh position={[0, 0.175, 0]}>
          <boxGeometry args={[0.04, 0.36, 2.56]} />
          <meshStandardMaterial {...WHITE} />
        </mesh>
      </group>
    </group>
  );
}

/* ============================================================================
   THE SHIP — VISUAL ONLY: newton.ts (the game) moves the PARENT
   group. The shift dart knows only one thing: read the commands and
   animate its hardware proportionally.
   ============================================================================ */

export function ShiftDart({
  ctlRef,
  onRegistry,
}: {
  ctlRef: React.MutableRefObject<ShipCommands>;
  /** Receives the nozzle registry on mount (access by name: tutorial,
      HUD, damage). */
  onRegistry?: (registry: ThrusterRegistry) => void;
}) {
  const registry = useMemo<ThrusterRegistry>(() => new Map(), []);
  useEffect(() => {
    onRegistry?.(registry);
  }, [registry, onRegistry]);

  return (
    <group>
      {/* recentering: the shift dart (nose -3.2 -> tail +2.6) rotates around its
          center of mass, not around its tail */}
      <group position={[0, 0, 0.3]}>
        <Fuselage />
        <DorsalSpine />
        <Tank side={1} />
        <Tank side={-1} />
        <OutTank side={1} />
        <OutTank side={-1} />
        <Weapon side={1} ctlRef={ctlRef} />
        <Weapon side={-1} ctlRef={ctlRef} />
        <MissileBay ctlRef={ctlRef} />
        <MainEngine ctlRef={ctlRef} />
        {/* THE NOZZLES: rendered by the SHARED KIT, driven by the table */}
        {RCS_NOZZLES.map((n) => (
          <Thruster key={n.id} nozzle={n} ctlRef={ctlRef} registry={registry} />
        ))}
      </group>
    </group>
  );
}
