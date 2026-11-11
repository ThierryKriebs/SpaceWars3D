import { state } from "../core/state";
import type { ShipSheet } from "@/types";

// The actor: behavior only — it writes into the photo, never renders.
export function spawnPlayer(): void {
  const player: ShipSheet = {
    model: "falcon-mk2",
    position: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    thrustPower: 20,
    maxSpeed: 30,
  };
  state.ships.push(player);
  console.log("[PlayerShip] spawned at origin");
}
