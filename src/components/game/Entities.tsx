"use client";

// Entities.tsx — THE MIRROR of the entities.
// Called by: Scene.tsx, inside the <Canvas> (the 3D stage).
// Why: game/ computes the world into the photo (state); this file is the only place
// that turns the photo into visible 3D objects — one mockup per sheet, recopied every
// frame. It never computes gameplay: it only reads `state` and calls .set() on three.js.

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { state } from "@/game/core/state";
import type { ShipSheet } from "@/types";
import { FalconMk2 } from "./models/ships/FalconMk2";

// modelRegistry: model name (written in the ship's sheet) -> 3D mockup component.
// The sheet only carries the string "falcon-mk2"; this registry knows what to render.
const modelRegistry = { "falcon-mk2": FalconMk2 } as const;

// Note: <group>, <mesh>... need no import — r3f turns every THREE class into a JSX tag.
export function Entities() {
  // `count` is a real React state: when it changes, React re-renders this component.
  // It tracks how many ships the photo contains, so the list updates when one spawns.
  const [count, setCount] = useState(state.ships.length);
  useEffect(() => {
    console.log("[Entities] mounted, ships in photo:", state.ships.length);
  }, []);
  // useFrame = called by r3f on EVERY rendered frame (~60 times per second).
  useFrame(() => {
    if (state.ships.length !== count) {
      console.log("[Entities] new sheet detected:", state.ships.length);
      setCount(state.ships.length);
    }
  });

  return (
    <>
      {/* slice(0, count): the map must depend on `count` (a React state), not on the
          imported `state` object — the React Compiler treats imports as immutable and
          would freeze state.ships.map() on the first render, forever empty. */}
      {state.ships.slice(0, count).map((ship, i) => (
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
  useEffect(() => {
    console.log("[Entities] ShipMirror mounted for model:", ship.model);
  }, []);
  useFrame(() => {
    const g = ref.current; // the real 3D object created by <group ref={ref}>
    if (!g) return;
    // the copy: read the photo -> set the 3D object. Nothing else.
    g.position.set(ship.position.x, ship.position.y, ship.position.z);
    g.rotation.set(ship.rotation.x, ship.rotation.y, ship.rotation.z);
  });
  // Ship3DModel = the 3D maquette chosen by name in the sheet: "falcon-mk2" -> <FalconMk2 />.
  // `keyof typeof modelRegistry` = "any valid key of the registry" — the cast just
  // tells TypeScript that ship.model is one of those keys, so the lookup is safe.
  const Ship3DModel = modelRegistry[ship.model as keyof typeof modelRegistry];
  return (
    <group ref={ref}>
      <Ship3DModel /> {/* render the chosen maquette inside the movable group */}
    </group>
  );
}
