"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import { Loop } from "@/game/core/loop";

import { Space } from "./environment/Space";
import { Sun } from "./environment/Sun";
import { Earth } from "./environment/Earth";

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
    <Canvas style={{ width: "100vw", height: "100vh" }}>
      {/* Ready-made component from drei: it binds the mouse to the camera
          (left-drag orbits, wheel zooms, right-drag pans). Temporary —
          it will be replaced later by our own CameraRig. */}
      <OrbitControls />
      <Space />
      <Sun />
      <Earth />
      <GameLoop />
    </Canvas>
  );
}
