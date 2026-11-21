"use client";

// Entities.tsx — THE MIRROR of the entities.
// Called by: Scene.tsx, inside the <Canvas> (the 3D stage).
// Why: game/ computes the world into the photo (state); this file is the only place
// that turns the photo into visible 3D objects — one mockup per sheet, recopied every
// frame. It never computes gameplay: it only reads `state` and calls .set() on three.js.

import { useRef, type ComponentType, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { state } from "@/game/core/state";
import type { ShipSheet } from "@/types";
import { ShiftSimple } from "./models/ships/ShiftSimple";
import { ShiftDart } from "./models/ships/ShiftDart";
import { makeShipCommands, type ShipCommands } from "./models/ships/shared/ThrusterKit";

// Every model receives the command envelope (ctlRef) filled from the ship's intent:
// models animate their hardware from it (RCS gas plumes, engine flame) — pure visuals.
type ModelProps = { ctlRef: MutableRefObject<ShipCommands> };

// modelRegistry: model name (written in the ship's sheet) -> 3D mockup component.
// The sheet only carries the string ("shift-simple", "shift-dart"); this registry knows what to render.
const modelRegistry: Record<string, ComponentType<ModelProps>> = {
  "shift-simple": ShiftSimple,
  "shift-dart": ShiftDart,
};

// Note: <group>, <mesh>... need no import — r3f turns every THREE class into a JSX tag.
export function Entities() {
  // The ship is spawned at module load (loop.ts), so it is already in the photo
  // at the first render: a plain map is enough, no spawn detection needed.
  return (
    <>
      {state.ships.map((ship, i) => (
        <ShipMirror key={i} ship={ship} />
      ))}
    </>
  );
}

// ShipMirror — one 3D mockup per ship sheet in the photo.
// <group> = THREE.Group: an invisible 3D container we can move/rotate as a whole.
// `ref` gives direct access to that 3D object: React does NOT re-render when a ref
// changes — that is the point, we move the object by hand, 60 times per second.
function ShipMirror({ ship }: { ship: ShipSheet }) {
  const ref = useRef<Group>(null); // once mounted, ref.current IS the THREE.Group
  const ctlRef = useRef<ShipCommands>(makeShipCommands()); // command envelope for the model's visuals
  useFrame(() => {
    const g = ref.current; // the real 3D object created by <group ref={ref}>
    if (!g) return;
    // the copy: read the photo -> set the 3D object. Nothing else.
    g.position.set(ship.position.x, ship.position.y, ship.position.z);
    g.rotation.set(ship.rotation.x, ship.rotation.y, ship.rotation.z);
    // Fill the command envelope from the ship's OWN intent: the model reads it to animate
    // its thrusters (gas ejected OPPOSITE to the push). Visual only — physics stays in newton.ts.
    const ctl = ctlRef.current;
    ctl.thrust = ship.intent.thrust;
    ctl.trans = ship.intent.thrust - ship.intent.brake;
    ctl.strafe = ship.intent.strafeRight - ship.intent.strafeLeft;
    ctl.lift = ship.intent.liftUp - ship.intent.liftDown;
    ctl.pitch = ship.intent.pitchUp - ship.intent.pitchDown;
    ctl.yaw = ship.intent.yawLeft - ship.intent.yawRight;
    ctl.roll = ship.intent.rollLeft - ship.intent.rollRight;
  });
  // Ship3DModel = the 3D maquette chosen by name in the sheet: "shift-dart" -> <ShiftDart />.
  // `keyof typeof modelRegistry` = "any valid key of the registry" — the cast just
  // tells TypeScript that ship.model is one of those keys, so the lookup is safe.
  const Ship3DModel = modelRegistry[ship.model as keyof typeof modelRegistry];
  return (
    <group ref={ref}>
      <Ship3DModel ctlRef={ctlRef} /> {/* render the chosen maquette inside the movable group */}
    </group>
  );
}
