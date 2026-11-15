import { state } from "../core/state";
import type { InputIntent } from "@/types";

// keyboard.ts — captures the keyboard and translates it into ACTIONS
// (0-1 intentions), never into movements. The game never sees the keys.

// THE keymap: one line per physical key (e.code — the lookup key below), AZERTY
// label in comment. keydown and keyup share this table, so they can never diverge.
// Display labels for a future remap UI will come from e.key captured at runtime
// (each keydown carries both e.code and e.key), not from these comments.
const KEYMAP: Record<string, keyof InputIntent> = {
  ArrowUp: "thrust",
  KeyW: "thrust", // AZERTY: Z
  ArrowDown: "brake",
  KeyS: "brake", // AZERTY: S
  Space: "stop",
  ArrowLeft: "yawLeft",
  ArrowRight: "yawRight",
  KeyQ: "pitchUp", // AZERTY: A
  KeyE: "pitchDown", // AZERTY: E
  KeyA: "rollLeft", // AZERTY: Q
  KeyD: "rollRight", // AZERTY: D
};

function applyKey(e: KeyboardEvent, value: number): void {
  const action = KEYMAP[e.code];
  if (action) state.input[action] = value;
}

export function attachKeyboard(): void {
  window.addEventListener("keydown", (e) => applyKey(e, 1));
  window.addEventListener("keyup", (e) => applyKey(e, 0));
}
