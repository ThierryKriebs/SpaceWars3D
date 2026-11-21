/* ============================================================================
   ThrusterKit — THE SHARED PROPULSION KIT (models/ships/shared/)
   ============================================================================
   CONTRACT (for the coding agent):

   1. PLACEMENT: `models/ships/shared/ThrusterKit.tsx`, as-is. This file
      is NOT a ship: it is the propulsion hardware shared by the whole
      fleet. No ship modifies it, everyone imports it. One single copy
      for all ships.

   2. WHAT IT EXPORTS:
      - `ShipCommands`, `makeShipCommands`: the command contract
        (one single envelope shared piloting <-> physics <-> gas).
      - `RcsNozzle`: the SHAPE of a table entry (pos, exhaust, fires).
      - `nozzleIntensity`, `computeIntensities`: the translator
        commands -> { id: intensity }.
      - `ThrusterHandle`, `ThrusterRegistry`: access by name to each
        nozzle (tutorial, HUD, damage).
      - `<Thruster/>`: a complete nozzle — flush drilled plate,
        proportional gas plume, registry entry.
      - `<ShipEnv/>`: the procedural studio (paint reflections).

   3. THE GOLDEN RULE: the day we replace the gas cone with REAL
      particles, or add a gas leak on a damaged nozzle, WE ONLY TOUCH
      THIS FILE. Every ship in the fleet is upgraded at the same instant.
      That is the only reason this file exists.
   ============================================================================ */

import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ============================================================================
   THE COMMANDS — the only thing shared between piloting, physics and gas
   ============================================================================ */

export interface AimCommands {
  p: number; // turret aim: pitch, clamped in the component
  y: number; // turret aim: yaw
}

export interface ShipCommands {
  pitch: number; // -1..1 — pitch, +1 = nose up
  yaw: number; // -1..1 — yaw, +1 = left
  roll: number; // -1..1 — roll, +1 = right edge lifts
  trans: number; // -1..1 — translation: -1 = brakes, +1 = soft forward
  strafe: number; // -1..1 — lateral translation: +1 = right
  lift: number; // -1..1 — vertical translation: +1 = up
  thrust: number; // 0..1 — main engine
  fire: boolean; // gun fire
  bayOpen: boolean; // missile bays
  aim: AimCommands; // fine turret aim
}

export function makeShipCommands(): ShipCommands {
  return { pitch: 0, yaw: 0, roll: 0, trans: 0, strafe: 0, lift: 0, thrust: 0, fire: false, bayOpen: false, aim: { p: 0, y: 0 } };
}

/* ============================================================================
   THE SHAPE OF A NOZZLE (each ship fills ITS table with this)
   ============================================================================ */

export type Vec3 = [number, number, number];

export interface RcsNozzle {
  id: string; // game name (convention: system-side-height, e.g. nose-L-T)
  pos: Vec3; // position on the hull (the lever arm)
  exhaust: Vec3; // gas EJECTION direction (the force on the ship = -exhaust)
  fires: { pitch?: 1 | -1; yaw?: 1 | -1; roll?: 1 | -1; trans?: 1 | -1; strafe?: 1 | -1; lift?: 1 | -1 }; // which command fires it
}

/* ============================================================================
   THE TRANSLATOR — commands -> intensities (one single function for all)
   ============================================================================ */

export function nozzleIntensity(n: RcsNozzle, c: ShipCommands) {
  let f = 0;
  for (const [m, sign] of Object.entries(n.fires) as [keyof RcsNozzle["fires"], 1 | -1][]) {
    const u = c[m];
    if (u !== 0 && Math.sign(u) === sign) f = Math.max(f, Math.abs(u));
  }
  return f;
}

// Translates commands into { id: intensity } for ONE nozzle table.
// (The table is a parameter: each ship has its own.)
export function computeIntensities(nozzles: RcsNozzle[], c: ShipCommands): Record<string, number> {
  const out: Record<string, number> = {};
  for (const n of nozzles) {
    const f = nozzleIntensity(n, c);
    if (f > 0) out[n.id] = f;
  }
  return out;
}

/* ============================================================================
   THE REGISTRY — access BY NAME to each nozzle, from the game.
   Diegetic tutorial (light a nozzle in front of the player),
   status HUD, damage (destroy a nozzle -> leak + degraded command).
   ============================================================================ */

export interface ThrusterHandle {
  /** Force the intensity (0..1), or null to hand control back to the pilot. */
  set: (f: number | null) => void;
  pos: Vec3; // the lever arm
  exhaust: Vec3; // the ejection direction
}
export type ThrusterRegistry = Map<string, ThrusterHandle>;

/* ============================================================================
   THE NOZZLE — flush drilled plate + proportional plume.
   Nothing ship-specific: one position, one direction,
   one intensity. THE GAS IS BORN AT THE HOLE: the cone base stays glued
   to the plate as it grows — never inside the hull.
   (This is where particles will plug in, one day.)
   ============================================================================ */

export function Thruster({
  nozzle,
  ctlRef,
  registry,
}: {
  nozzle: RcsNozzle;
  ctlRef: React.MutableRefObject<ShipCommands>;
  registry: ThrusterRegistry;
}) {
  const plumeRef = useRef<THREE.Mesh>(null);
  const forced = useRef<number | null>(null);
  const quat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...nozzle.exhaust).normalize());
    return q;
  }, [nozzle]);

  useEffect(() => {
    registry.set(nozzle.id, { set: (f) => (forced.current = f), pos: nozzle.pos, exhaust: nozzle.exhaust });
    return () => {
      registry.delete(nozzle.id);
    };
  }, [nozzle, registry]);

  useFrame(() => {
    const f = forced.current !== null ? forced.current : nozzleIntensity(nozzle, ctlRef.current);
    const m = plumeRef.current;
    if (!m) return;
    m.visible = f > 0.02;
    m.scale.set(0.5 + f * 0.6, 0.16 + f * 1.4, 0.5 + f * 0.6);
    // THE GAS IS BORN AT THE HOLE: base glued to the plate (local y 0.012),
    // the tip is what grows — never inside the hull.
    m.position.y = 0.012 + (0.16 + f * 1.4) / 2;
    (m.material as THREE.MeshBasicMaterial).opacity = Math.min(0.9, f * 0.95);
  });

  return (
    <group position={nozzle.pos} quaternion={quat}>
      {/* flush dark octagonal plate: a panel, nothing sticks out */}
      <mesh position={[0, 0.006, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.015, 8]} />
        <meshStandardMaterial color="#12181f" roughness={0.85} flatShading />
      </mesh>
      {/* the HOLE: the black orifice the gas escapes from */}
      <mesh position={[0, 0.014, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.004, 12]} />
        <meshBasicMaterial color="#05070a" />
      </mesh>
      {/* plume: length and opacity proportional to the thrust */}
      <mesh ref={plumeRef} position={[0, 0.05, 0]} visible={false}>
        <coneGeometry args={[0.055, 1, 8]} />
        <meshBasicMaterial color="#8fd6ff" transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ============================================================================
   THE STUDIO — it provides the white paint reflections.
   Shared by the fleet (one honest lighting, MSFS 2020 style).
   ============================================================================ */

export function ShipEnv() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = new THREE.Scene();
    const panel = (rgb: [number, number, number], size: number, pos: Vec3, lookAt: Vec3) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size),
        new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(...rgb), side: THREE.DoubleSide })
      );
      m.position.set(...pos);
      m.lookAt(new THREE.Vector3(...lookAt));
      env.add(m);
    };
    panel([6, 6, 5.5], 22, [0, 10, 0], [0, 0, 0]); // warm white ceiling
    panel([2.2, 2.8, 3.6], 16, [-12, 2, 3], [0, 0, 0]); // cold blue side
    panel([3.2, 1.9, 1.1], 14, [12, 1, -3], [0, 0, 0]); // warm orange side
    panel([0.15, 0.2, 0.32], 20, [0, -9, 0], [0, 0, 0]); // very dark floor
    const rt = pmrem.fromScene(env, 0.06);
    scene.environment = rt.texture;
    return () => {
      scene.environment = null;
      rt.texture.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}
