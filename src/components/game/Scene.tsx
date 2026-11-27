"use client";

import { Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
// Kept for debugging (mouse orbit/zoom/pan) — replaced by CameraRig:
// import { OrbitControls } from "@react-three/drei";
import { CameraRig } from "./CameraRig";

import { Loop } from "@/game/core/loop";

import { Space } from "./environment/Space";
import { Sun } from "./environment/Sun";
import { Earth } from "./environment/Earth";
import { Entities } from "./Entities";
import { ShipEnv } from "./models/ships/shared/ThrusterKit";

// The single hook between our game world and r3f's render loop:
// r3f calls this on every frame, we run the fixed-step game ticks.
function GameLoop() {
  useFrame((_, delta: number) => {
    Loop.tick(delta);
  });

  return null; // renders nothing — its only job is to be plugged in
}

export default function Scene() {
  return (
    // style overrides the container's default width/height: 100% and pins
    // the canvas to the viewport (its parent has no definite height).
    // camera far 5000: the star shell lives at 800..900 (Stars.tsx) and must never be depth-culled.
    <Canvas camera={{ far: 5000 }} style={{ width: "100vw", height: "100vh" }}>
      {/* ONE Suspense around the WHOLE scene: Earth's 8K textures suspend it, so nothing
          renders until they are ready — the whole scene then appears at once, instead of
          the planet popping in 1s after stars/sun/ship. fallback=null → black while loading. */}
      <Suspense fallback={null}>
        <GameLoop /> {/* the world advances before the mirrors read it */}
        <CameraRig /> {/* follows the player ship */}
        {/* <OrbitControls /> Debug tool kept commented out — binds the mouse to the camera (orbit/zoom/pan) */}
        <Space />
        <Sun />
        <Earth />
        <ShipEnv /> {/* the shared light studio from the thruster kit: gives the metal hulls their reflections */}
        <Entities />
      </Suspense>
    </Canvas>
  );
}
