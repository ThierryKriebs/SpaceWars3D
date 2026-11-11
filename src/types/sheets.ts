import type { InputIntent } from "./intents";

// The sheets: one contract per species living in the photo (state.ts).
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

// The ship's sheet in the photo: data only, no methods.
export interface ShipSheet {
  model: string; // reference to a 3D model in components/game/models/
  position: Vec3;
  velocity: Vec3;
  rotation: Vec3;
  intent: InputIntent; // this ship's OWN intentions — never the global input
  thrustPower: number;
  brakePower: number; // retro-thrust power (backward)
  maxSpeed: number;
}
