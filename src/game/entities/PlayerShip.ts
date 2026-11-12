import { state } from "../core/state";
import type { ShipSheet } from "@/types";

// The actor: behavior only — it writes into the photo, never renders.
export function spawnPlayer(): void {
  const player: ShipSheet = {
    model: "falcon-mk2",
    position: { x: 0, y: 0, z: -10 }, // 10 units in front of the default camera
    velocity: { x: 0, y: 0, z: 0 }, // starts at rest — press W to accelerate
    rotation: { x: 0, y: 0, z: 0 },
    angularVelocity: { x: 0, y: 0, z: 0 }, // starts without spin
    intent: { thrust: 0, brake: 0, stop: 0, yawLeft: 0, yawRight: 0, pitchUp: 0, pitchDown: 0 },
    thrustPower: 20,
    brakePower: 20,
    turnPower: 3, // rad/s² of angular acceleration at full yaw intent
    maxTurnRate: 1.5, // rad/s cap (≈ 86°/s)
    maxSpeed: 30,
  };
  state.ships.push(player);
}

// The player actor decides: copies the global input into ITS OWN intent.
export function updatePlayer(): void {
  const player = state.ships[0];
  if (!player) return;

  // Copy the global input into the player's OWN intent.
  player.intent.thrust = state.input.thrust;
  player.intent.brake = state.input.brake;
  player.intent.stop = state.input.stop;
  player.intent.yawLeft = state.input.yawLeft;
  player.intent.yawRight = state.input.yawRight;
  player.intent.pitchUp = state.input.pitchUp;
  player.intent.pitchDown = state.input.pitchDown;
}
