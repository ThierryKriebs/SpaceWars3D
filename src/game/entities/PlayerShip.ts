import { state } from "../core/state";
import type { ShipSheet } from "@/types";

// The actor: behavior only — it writes into the photo, never renders.
export function spawnPlayer(): void {
  const player: ShipSheet = {
    model: "falcon-mk2",
    position: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: -5 }, // small initial drift: inertia visible in the logs
    rotation: { x: 0, y: 0, z: 0 },
    intent: { thrust: 0 },
    thrustPower: 20,
    maxSpeed: 30,
  };
  state.ships.push(player);
  console.log("[PlayerShip] spawned at origin");
}

// The player actor decides: copies the global input into ITS OWN intent.
export function updatePlayer(): void {
  const player = state.ships[0];
  if (!player) return;

  // Retrieves the state of the ‘accelerate’ key
  player.intent.thrust = state.input.thrust;
}
