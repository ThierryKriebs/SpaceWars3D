import { state } from "../core/state";

// newton.ts — THE integrator: intentions become movement.
// It is the ONLY module in the whole game allowed to write `position`.
export function updateShips(dt: number): void {
  for (const ship of state.ships) {
    // The ship's own forward axis (nose = local -Z) after the ship's rotation —
    // same composition as three.js Euler XYZ (roll z = 0 for now):
    // forward = (-sin ry, sin rx·cos ry, -cos rx·cos ry).
    const rx = ship.rotation.x;
    const ry = ship.rotation.y;
    const forwardX = -Math.sin(ry);
    const forwardY = Math.sin(rx) * Math.cos(ry);
    const forwardZ = -Math.cos(rx) * Math.cos(ry);

    // Each ship reads ITS OWN intent from its sheet.
    // Both are 0-1 intentions — no if needed, multiplying by 0 does nothing.
    ship.velocity.x += forwardX * ship.intent.thrust * ship.thrustPower * dt;
    ship.velocity.y += forwardY * ship.intent.thrust * ship.thrustPower * dt;
    ship.velocity.z += forwardZ * ship.intent.thrust * ship.thrustPower * dt;
    ship.velocity.x -= forwardX * ship.intent.brake * ship.brakePower * dt;
    ship.velocity.y -= forwardY * ship.intent.brake * ship.brakePower * dt;
    ship.velocity.z -= forwardZ * ship.intent.brake * ship.brakePower * dt;

    // Auto-brake (Space): decelerate the WHOLE velocity toward 0, stop there —
    // never reverses, whatever the direction of travel.
    if (ship.intent.stop > 0) {
      const decel = ship.brakePower * dt;
      const v = Math.hypot(ship.velocity.x, ship.velocity.y, ship.velocity.z);
      if (v <= decel) {
        ship.velocity.x = 0;
        ship.velocity.y = 0;
        ship.velocity.z = 0;
      } else {
        const k = (v - decel) / v;
        ship.velocity.x *= k;
        ship.velocity.y *= k;
        ship.velocity.z *= k;
      }
    }

    // Speed cap: clamp the velocity length, keeping its direction.
    const speed = Math.hypot(ship.velocity.x, ship.velocity.y, ship.velocity.z);
    if (speed > ship.maxSpeed) {
      const k = ship.maxSpeed / speed;
      ship.velocity.x *= k;
      ship.velocity.y *= k;
      ship.velocity.z *= k;
    }

    // THE move of the world: position += velocity × dt (inertia).
    ship.position.x += ship.velocity.x * dt;
    ship.position.y += ship.velocity.y * dt;
    ship.position.z += ship.velocity.z * dt;

    // Rotation: same newtonian law on the angular axes — the intent accelerates
    // angularVelocity, capped at maxTurnRate; released, the ship keeps spinning.
    // Pitch: positive rotation.x = nose UP on screen.
    ship.angularVelocity.x += (ship.intent.pitchUp - ship.intent.pitchDown) * ship.turnPower * dt;
    if (ship.angularVelocity.x > ship.maxTurnRate) ship.angularVelocity.x = ship.maxTurnRate;
    if (ship.angularVelocity.x < -ship.maxTurnRate) ship.angularVelocity.x = -ship.maxTurnRate;
    // Yaw: positive rotation.y = nose LEFT on screen
    // (the nose -Z goes toward -X, which is screen-left for our camera).
    ship.angularVelocity.y += (ship.intent.yawLeft - ship.intent.yawRight) * ship.turnPower * dt;
    if (ship.angularVelocity.y > ship.maxTurnRate) ship.angularVelocity.y = ship.maxTurnRate;
    if (ship.angularVelocity.y < -ship.maxTurnRate) ship.angularVelocity.y = -ship.maxTurnRate;
    ship.rotation.x += ship.angularVelocity.x * dt;
    ship.rotation.y += ship.angularVelocity.y * dt;
    ship.rotation.z += ship.angularVelocity.z * dt;
  }
}
