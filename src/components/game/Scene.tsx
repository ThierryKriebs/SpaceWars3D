"use client";

// Entry point for the game scene
// It mounts the Canvas (r3f's projection screen) and plugs our code into it.

// The browser knows the screen's refresh rate and calls r3f in time with it.
// r3f (React Three Fiber) is a React renderer for Three.js — it lets us build 3D scenes using React components.
// The `useFrame` hook is provided by r3f:  It runs ONCE at mount and registers our callback;
// r3f's render loop then calls this callback on every frame (100 Hz on my monitor, 60 Hz on another).

// The chain, once per frame, for as long as the page lives:
//   the screen refreshes (100 Hz on my monitor, 60 Hz on another)
//     → the browser calls r3f's internal render loop (lives in node_modules)
//       → r3f calls every function registered through useFrame (ours, here)
//         → r3f has three.js paint the world onto the HTML canvas.

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

const STEP = 1 / 60; // one tick = 1/60 s of real time, on every machine

// Our game loop, plugged into the Canvas render loop
function GameLoop() {
  // useRef is a React "box": it holds a value that survives re-renders,
  // and writing to `.current` does NOT trigger a re-render.
  // Perfect for counters that live inside the render loop.
  const tickCount = useRef(0);
  const accumulator = useRef(0);

  // useFrame runs ONCE, at mount: it hands our function to r3f.
  // r3f's loop then calls THAT FUNCTION on every frame (100 Hz here, 60 Hz there).
  useFrame((_, delta: number) => {
    // _ = r3f's state (camera, scene...), we don't need it here.
    // delta = real seconds elapsed since the previous frame, from r3f's clock: The Monitor decides HOW OFTEN we run;
    accumulator.current += delta; // useRef return a object with a `.current` property that survives re-renders, perfect for counters that live inside the render loop.

    // 60 ticks per real second, on every machine.
    while (accumulator.current >= STEP) {
      accumulator.current -= STEP;
      tickCount.current += 1;
      if (tickCount.current % 60 === 0) {
        console.log(`[GameLoop] tick #${tickCount.current} (60 Hz fixed)`);
      }
    }
  });

  return null; // renders nothing — its only job is to be plugged in
}

export default function Scene() {
  return (
    // Canvas: projection screen for 3D graphics, provided by r3f. 
    // Each frame must have a Canvas.
    <Canvas>
      <GameLoop />
    </Canvas>
  );
}
