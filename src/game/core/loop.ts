// The heartbeat of the game: a fixed-step loop, same dt on every machine.
import { state } from "./state";
import { spawnPlayer } from "../entities/PlayerShip";

// One tick = 1/60 s of real time, on every machine.
export const STEP = 1 / 60;

export const Loop = {
  accumulator: 0,
  started: false,

  // Called on every render frame by the single useFrame hook in Scene.tsx.
  // delta = real seconds elapsed since the previous frame.
  tick(delta: number): void {
    // One-time setup on the very first call: spawn the player into the photo.
    if (!Loop.started) {
      Loop.started = true;
      spawnPlayer();
    }
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
