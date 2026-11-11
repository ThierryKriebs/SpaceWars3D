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
  thrustPower: number;
  maxSpeed: number;
}
