import { state } from "../core/state";

// newton.ts — THE integrator: intentions become movement.
// It is the ONLY module in the whole game allowed to write `position`.
export function updateShips(dt: number): void {
  for (const ship of state.ships) {
    // Each ship reads ITS OWN intent from its sheet. Forward = -z, backward = +z.
    // Both are 0-1 intentions — no if needed, multiplying by 0 does nothing.
    ship.velocity.z -= ship.intent.thrust * ship.thrustPower * dt;
    ship.velocity.z += ship.intent.brake * ship.brakePower * dt;

    // Auto-brake (Space): decelerate toward 0 and stop there — never reverses.
    if (ship.intent.stop > 0) {
      const decel = ship.brakePower * dt;
      if (Math.abs(ship.velocity.z) <= decel) ship.velocity.z = 0;
      else ship.velocity.z -= Math.sign(ship.velocity.z) * decel;
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

    // Rotation: same newtonian law on the angular axis — the intent accelerates
    // angularVelocity, capped at maxTurnRate; released, the ship keeps turning.
    ship.angularVelocity.y += (ship.intent.yawRight - ship.intent.yawLeft) * ship.turnPower * dt;
    if (ship.angularVelocity.y > ship.maxTurnRate) ship.angularVelocity.y = ship.maxTurnRate;
    if (ship.angularVelocity.y < -ship.maxTurnRate) ship.angularVelocity.y = -ship.maxTurnRate;
    ship.rotation.x += ship.angularVelocity.x * dt;
    ship.rotation.y += ship.angularVelocity.y * dt;
    ship.rotation.z += ship.angularVelocity.z * dt;
  }
}
