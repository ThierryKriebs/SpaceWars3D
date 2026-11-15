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
    intent: { thrust: 0, brake: 0, stopAllTranslation: 0, yawLeft: 0, yawRight: 0, pitchUp: 0, pitchDown: 0, rollLeft: 0, rollRight: 0, stopAllRotation: 0, strafeLeft: 0, strafeRight: 0, liftUp: 0, liftDown: 0 },
    thrustPower: 20,
    brakePower: 20,
    turnPower: 3, // rad/s² acceleration for each axis of angular velocity (roll, pitch, yaw)
    maxTurnRate: 1.5, // rad/s cap (≈ 86°/s) for each axis of angular velocity (roll, pitch, yaw)
    spinBrakePower: 3, // rad/s² — stops a max spin (1.5 rad/s) in ~0.5 s
    maxSpeed: 30, // maximum linear speed (units/s) — the ship cannot go faster than this, whatever the thrust.
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
  player.intent.stopAllTranslation = state.input.stopAllTranslation;
  player.intent.yawLeft = state.input.yawLeft;
  player.intent.yawRight = state.input.yawRight;
  player.intent.pitchUp = state.input.pitchUp;
  player.intent.pitchDown = state.input.pitchDown;
  player.intent.rollLeft = state.input.rollLeft;
  player.intent.rollRight = state.input.rollRight;
  player.intent.stopAllRotation = state.input.stopAllRotation;
  player.intent.strafeLeft = state.input.strafeLeft;
  player.intent.strafeRight = state.input.strafeRight;
  player.intent.liftUp = state.input.liftUp;
  player.intent.liftDown = state.input.liftDown;
}
