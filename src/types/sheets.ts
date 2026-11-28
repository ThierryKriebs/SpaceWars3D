import type { InputIntent } from "./intents";

// The sheets: one contract per species living in the photo (state.ts).
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Quat {
  x: number;
  y: number;
  z: number;
  w: number;
}

// The ship's sheet in the photo: data only, no methods.
export interface ShipSheet {
  model: string; // reference to a 3D model in components/game/models/
  
  position: Vec3;
  velocity: Vec3;
  angularVelocity: Vec3; // rad/s per SHIP axis (body frame) — rotation drifts too (inertia)
  rotation: Quat; // orientation quaternion (body → world) — Euler angles cannot be integrated per-axis
  
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

  visualThrust: Vec3; // -1..1 per ship axis — EFFECTIVE push written by newton each frame (lock brake included, 0 at rest); read only by the 3D mirror to drive the gas plumes
  visualRotation: Vec3; // -1..1 per rotation axis — same for the turn demand

  planetProximity: number; // 0..1 — 0 far from the planet, 1 at surface contact; written by newton (updatePlanetCollision), read by the plasma glow of THIS ship
}
