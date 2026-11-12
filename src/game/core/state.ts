import type { ShipSheet, InputIntent } from "@/types";

// The photo of the world at instant T — the single source of truth.
// Pure data, no methods.
export const state = {
  tickCount: 0,
  ships: [] as ShipSheet[],
  // Player intentions (0-1 values): written only by game/controls/.
  input: { thrust: 0, brake: 0, stop: 0, yawLeft: 0, yawRight: 0, pitchUp: 0, pitchDown: 0 } as InputIntent,
};
