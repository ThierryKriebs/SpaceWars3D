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
  angularVelocity: Vec3; // rad/s per axis — rotation drifts too (inertia)
  rotation: Vec3;
  
  intent: InputIntent; // this ship's OWN intentions — never the global input
  
  thrustPower: number;
  turnPower: number; // angular acceleration per rotation axis (rad/s²)
  
  brakePower: number; // retro-thrust power (backward)
  stopAllBrakePower: number; // translation auto-brake (units/s²) while stopAllTranslation is held — gentler than brakePower
  stopAllSpinBrakePower: number; // spin auto-brake (rad/s²) while stopAllRotation is held
  
  maxSpeed: number;
  maxTurnRate: number; // cap on angular velocity per axis (rad/s)

  lockInverseSpeedAxisX: number; // 3 states: 0 = free/armed, 1 = locked (brakes to 0, held there while the key stays down, never reverses), 2 = disengaged by release+re-press (double-click) until the speed changes sign
  lockInverseSpeedAxisY: number;
  lockInverseSpeedAxisZ: number;
  lockInverseRotationAxisX: number; // same 3 states for the rotation axes (angular velocity braked progressively to 0 while locked)
  lockInverseRotationAxisY: number;
  lockInverseRotationAxisZ: number;
}
