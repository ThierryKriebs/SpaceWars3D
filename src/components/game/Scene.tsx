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
     // style overrides the container's default width/height: 100% and pins
    // the canvas to the viewport (its parent has no definite height).
    <Canvas style={{ width: "100vw", height: "100vh" }}>
      {/* scene.background: the black backdrop painted behind everything */}color: r3f rend toutes les classes de Three.js automatquement disponibles
      {/* color: r3f automatically makes all Three.js classes available */}
      <color attach="background" args={["#000000"]} />
      <GameLoop />
    </Canvas>
   
  );
}
