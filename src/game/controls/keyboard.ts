import { state } from "../core/state";
import type { InputIntent } from "@/types";

// keyboard.ts — captures the keyboard and translates it into ACTIONS
// (0-1 intentions), never into movements. The game never sees the keys.

// THE keymap: one line per physical key (e.code — the lookup key below), AZERTY
// label in comment. keydown and keyup share this table, so they can never diverge.
// Display labels for a future remap UI will come from e.key captured at runtime
// (each keydown carries both e.code and e.key), not from these comments.
const KEYMAP: Record<string, keyof InputIntent> = {
  KeyW: "thrust",             // (AZERTY: Z)             Translation to Axis -Z (forward)
  KeyS: "brake",              // (AZERTY: S)             Translation to Axis +Z (backward)
  KeyA: "strafeLeft",         // (AZERTY: Q)             Translation to Axis -X
  KeyD: "strafeRight",        // (AZERTY: D)             Translation to Axis +X
  ShiftLeft: "liftUp",        // (AZERTY: Maj gauche)    Translation to Axis +Y
  ControlLeft: "liftDown",    // (AZERTY: Ctrl gauche)   Translation to Axis -Y
  Space: "stopAllTranslation",// (AZERTY: space)         Auto-brake, stop only all Translation
  AltLeft: "stopAllRotation", // (AZERTY: Alt gauche)    Auto-brake, stop only all Rotation
  Numpad8: "pitchUp",         // (AZERTY: 8, numpad)     Rotation around +X
  Numpad5: "pitchDown",       // (AZERTY: 5, numpad)     Rotation around -X
  Numpad4: "yawLeft",         // (AZERTY: 4, numpad)     Rotation around +Y
  Numpad6: "yawRight",        // (AZERTY: 6, numpad)     Rotation around -Y
  ArrowRight: "rollRight",    // (AZERTY: fleche droite) Rotation around -Z 
  NumpadEnter: "rollLeft",    // (AZERTY: Entree droite, numpad)     Rotation around +Z 
};

function applyKey(e: KeyboardEvent, value: number): void {
  const action = KEYMAP[e.code];
  if (action) {
    // preventDefault on keydown: stops Alt from handing focus to the browser
    // menu — its keyup would then never reach the page (action stuck at 1).
    if (value === 1) e.preventDefault();
    state.input[action] = value;
  }
}

// Safety net: any keyup the page never receives (Alt, Cmd, Alt+Tab, focus lost
// while a key is held) is cleared here, when the window loses focus.
function resetInputs(): void {
  for (const action of Object.keys(state.input) as (keyof InputIntent)[]) {
    state.input[action] = 0;
  }
}

export function attachKeyboard(): void {
  window.addEventListener("keydown", (e) => applyKey(e, 1));
  window.addEventListener("keyup", (e) => applyKey(e, 0));
  window.addEventListener("blur", resetInputs); // blur: window lost focus, reset all keys to 0
}
