// The heartbeat of the game: a fixed-step loop, same dt on every machine.
import { state } from "./state";
import { spawnPlayer, updatePlayer } from "../entities/PlayerShip";
import { updateShips } from "../physics/newton";
import { attachKeyboard } from "../controls/keyboard";

// One tick = 1/60 s of real time, on every machine.
export const STEP = 1 / 60;

// One-time setup at module load, before the first tick ever runs:
// capture the controls once, spawn the player into the photo.
attachKeyboard();
spawnPlayer();

export const Loop = {
  accumulator: 0,

  // Called on every render frame by the single useFrame hook in Scene.tsx.
  // delta = real seconds elapsed since the previous frame.
  tick(delta: number): void {
    Loop.accumulator += delta;
    while (Loop.accumulator >= STEP) {
      Loop.accumulator -= STEP;
      state.tickCount += 1;
      updatePlayer(); // the actors decide: intentions into the photo
      updateShips(STEP); // newton executes: the only writer of position
    }
  },
};
