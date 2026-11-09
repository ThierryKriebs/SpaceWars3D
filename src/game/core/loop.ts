// The heartbeat of the game: a fixed-step loop, same dt on every machine.
import { state } from "./state";

// One tick = 1/60 s of real time, on every machine.
export const STEP = 1 / 60;

export const Loop = {
  accumulator: 0,

  // Called on every render frame by the single useFrame hook in Scene.tsx.
  // delta = real seconds elapsed since the previous frame.
  tick(delta: number): void {
    Loop.accumulator += delta;
    while (Loop.accumulator >= STEP) {
      Loop.accumulator -= STEP;
      state.tickCount += 1;
      if (state.tickCount % 60 === 0) {
        console.log(`[GameLoop] tick #${state.tickCount} (60 Hz fixed)`);
      }
    }
  },
};
