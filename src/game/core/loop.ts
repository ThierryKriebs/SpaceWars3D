// The heartbeat of the game: a fixed-step loop, same dt on every machine.
import { state } from "./state";
import { spawnPlayer, updatePlayer } from "../entities/PlayerShip";
import { updateShips } from "../physics/newton";
import { attachKeyboard } from "../controls/keyboard";

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
      attachKeyboard(); // controls capture once, at mount
      spawnPlayer();
    }
    Loop.accumulator += delta;
    while (Loop.accumulator >= STEP) {
      Loop.accumulator -= STEP;
      state.tickCount += 1;
      updatePlayer(); // the actors decide: intentions into the photo
      updateShips(STEP); // newton executes: the only writer of position
      if (state.tickCount % 60 === 0) {
        const s = state.ships[0];
        const p = s?.position;
        console.log(`[GameLoop] tick #${state.tickCount}, ship at (${p?.x.toFixed(2)}, ${p?.y.toFixed(2)}, ${p?.z.toFixed(2)}), vz=${s?.velocity.z.toFixed(2)}`);
      }
    }
  },
};
