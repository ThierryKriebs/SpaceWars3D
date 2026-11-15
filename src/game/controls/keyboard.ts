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
  KeyW: "thrust",                     // (AZERTY: Z)              Translation to Axis -Z 
  ArrowDown: "brake",                 // (AZERTY: ArrowDown or S) Translation to Axis +Z 
  KeyS: "brake",                      // (AZERTY: ArrowDown or S) Translation to Axis +Z 
  Space: "stopAllTranslation",        // (AZERTY: space)          Auto-brake, stop only all Translation, 
  ArrowLeft: "yawLeft",               // (AZERTY: ArrowLeft)      yaw => (Lacet) turn Left around Y 
  ArrowRight: "yawRight",             // (AZERTY: ArrowRight)     yaw => (Lacet) turn Right around Y
  KeyQ: "pitchUp",                    // (AZERTY: A)              pitch => (Tangage) turn Up around X
  KeyE: "pitchDown",                  // (AZERTY: E)              pitch => (Tangage) turn Down around X
  KeyA: "rollLeft",                   // (AZERTY: Q)              roll => (Lacet) turn Left around Z
  KeyD: "rollRight",                  // (AZERTY: D)              roll => (Lacet) turn Right around Z
  ShiftLeft: "stopAllRotation",       // (AZERTY: Maj gauche)     shift => Auto-brake, stop only all Rotation
  ShiftRight: "stopAllRotation",      // (AZERTY: Maj droite)     shift => Auto-brake, stop only all Rotation
};

function applyKey(e: KeyboardEvent, value: number): void {
  const action = KEYMAP[e.code];
  if (action) state.input[action] = value;
}

export function attachKeyboard(): void {
  window.addEventListener("keydown", (e) => applyKey(e, 1));
  window.addEventListener("keyup", (e) => applyKey(e, 0));
}
