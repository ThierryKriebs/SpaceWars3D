import { state } from "../core/state";

// keyboard.ts — captures the keyboard and translates it into ACTIONS
// (0-1 intentions), never into movements. The game never sees the keys.
export function attachKeyboard(): void {
  window.addEventListener("keydown", (e) => {
    if (e.code === "ArrowUp" || e.code === "KeyW") state.input.thrust = 1;
    if (e.code === "ArrowDown" || e.code === "KeyS") state.input.brake = 1;
    if (e.code === "Space") state.input.stop = 1; // auto-brake to a full stop
  });
  window.addEventListener("keyup", (e) => {
    if (e.code === "ArrowUp" || e.code === "KeyW") state.input.thrust = 0;
    if (e.code === "ArrowDown" || e.code === "KeyS") state.input.brake = 0;
    if (e.code === "Space") state.input.stop = 0; // release the auto-brake
  });
}
