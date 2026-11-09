"use client";

import { Canvas, useFrame } from "@react-three/fiber";

import { Loop } from "@/game/core/loop";

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
    <Canvas>
      <GameLoop />
    </Canvas>
  );
}
