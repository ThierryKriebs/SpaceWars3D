import { state } from "../core/state";

// newton.ts — THE integrator: intentions become movement.
// It is the ONLY module in the whole game allowed to write `position`.
//
// FRAME CONVENTION — what "Local" means in a variable name:
// - WITHOUT "Local" = WORLD frame: the photo (state: position, velocity, rotation,
//   angularVelocity) is always world-frame and the 3D mirror reads it as-is.
//   worldForward/worldRight/worldUp below are the ship's own axes expressed in WORLD coordinates
//   (the columns of the rotation matrix R). In the SHIP frame they are always:
//   right = (1, 0, 0), up = (0, 1, 0), forward = (0, 0, -1).
// - WITH "Local" (shipLocalThrustX/Y/Z) = SHIP frame: along the ship's own axes
//   (nose, right wing, roof), before rotation to world: velocity += R · shipLocalThrust × dt.
export function updateShips(dt: number): void {
  for (const ship of state.ships) {
    // The ship's local axes in world frame = the columns of its rotation matrix
    // (same Euler XYZ composition as three.js; verified against the reference
    // matrix — identical results, shorter names). The nose (local -Z) is
    // unchanged by roll, but the wing (local +X) and roof (local +Y) are tilted
    // by it, so right/up include worldShipRotationZ.
    // Step 1 — the ship's rotation angles in the world frame (Euler XYZ, same order as three.js).
    const worldShipRotationX = ship.rotation.x;
    const worldShipRotationY = ship.rotation.y;
    const worldShipRotationZ = ship.rotation.z;
    
    // cX => cos(X), sX => sin(X), etc. for the three rotation axes.
    const cX = Math.cos(worldShipRotationX); 
    const sX = Math.sin(worldShipRotationX);
    const cY = Math.cos(worldShipRotationY);
    const sY = Math.sin(worldShipRotationY);
    const cZ = Math.cos(worldShipRotationZ); // cZ = cos(roll) = the share of the original axis that the roll leaves unchanged
    const sZ = Math.sin(worldShipRotationZ);

    //The ship pushes in three directions (nose, right wing, roof)

    // ‘forward’ is a single vector (the direction of the nose), which can be decomposed along the three axes of the global reference system:
    // forward = (0, 0, −1) => The entire nose is on the world Z-component
    // Step 2 — the ship's axes as world direction vectors (length 1: directions only, not speeds, not forces):
    // forward = nose, right = right wing, up = roof. worldForwardX = how much the nose points along the world x-axis.
    const worldForwardX = -sY;       // proportion of the movement along the x-axis
    const worldForwardY = sX * cY;   // proportion of the movement along the y-axis
    const worldForwardZ = -cY * cX;  // proportion of the movement along the z-axis

    // 'right' is a single vector (the direction of the wing axis, +X => right side), which can be decomposed along the three axes of the global reference system:
    // right = (1, 0, 0) => The entire right wing is on the world X-component
    // 1 roll (Z), then 2 yaw (Y), then 3 pitch (X) => always in that order
    const worldRightX   = cZ * cY * 1;                   // cZ * cY * 1 proportion of the wing's direction along the x-axis of the world (the monitor reference), after all rotations
                                                    //`cZ * cY * 1;`  (roll * yaw * pitch)
    const worldRightY   = sZ * 1 * cX + cZ * sY * sX;    // proportion of the wing's direction along the y-axis of the world, after all rotations
                                                    // sZ * 1 * cX  +  cZ * sY * sX;  
    const worldRightZ   = sZ * 1 * sX - cZ * sY * cX;    // proportion of the wing's direction along the z-axis of the world, after all rotations
                                                    // sZ * 1 * sX - cZ * sY * cX    

    // 'up' is a single vector (the direction of the roof axis, +Y => top side / canopy), which can be decomposed along the three axes of the global reference system:
    // up = (0, 1, 0) => The entire roof is on the world Y-component
    const worldUpX      = -cY * sZ;
    const worldUpY      = cX * cZ - sX * sY * sZ;
    const worldUpZ      = sX * cZ + cX * sY * sZ;

    // Each ship reads ITS OWN intent from its sheet. All are 0-1 intentions.
    // Step 3 — demanded thrust in the ship frame (units/s²): how hard we push along each ship axis.
    const shipLocalThrustX = (ship.intent.strafeRight - ship.intent.strafeLeft) * ship.thrustPower;       // along the wings
    const shipLocalThrustY = (ship.intent.liftUp - ship.intent.liftDown) * ship.thrustPower;              // along the roof
    const shipLocalThrustZ = ship.intent.thrust * ship.thrustPower - ship.intent.brake * ship.brakePower; // along the nose

    // Step 3.5 — velocity in the ship frame: the world velocity projected on the ship's axes.
    const shipLocalVelocityX = ship.velocity.x * worldRightX + ship.velocity.y * worldRightY + ship.velocity.z * worldRightZ;
    const shipLocalVelocityY = ship.velocity.x * worldUpX + ship.velocity.y * worldUpY + ship.velocity.z * worldUpZ;
    const shipLocalVelocityZ = ship.velocity.x * worldForwardX + ship.velocity.y * worldForwardY + ship.velocity.z * worldForwardZ;

    // true = the demanded thrust on this axis pushes AGAINST the current speed (opposite signs)
    const flagOppositeForceDetectedX = shipLocalThrustX * shipLocalVelocityX < 0;
    const flagOppositeForceDetectedY = shipLocalThrustY * shipLocalVelocityY < 0;
    const flagOppositeForceDetectedZ = shipLocalThrustZ * shipLocalVelocityZ < 0;

    
    // Per-axis inverse-speed lock — 3 states: 0 = free (armed), 1 = locked (progressive brake to 0,
    // held at 0 while the key stays down, never reverses), 2 = unlocked by a release (the lock was
    // already used once during this opposition): a re-press then overrides the lock and inverts freely.
    
    // No lock on the axis AND opposite force detected => lock the axis: brake toward 0, never reverse the speed on it
    if (ship.lockInverseSpeedAxisX === 0 && flagOppositeForceDetectedX) ship.lockInverseSpeedAxisX = 1;
    if (ship.lockInverseSpeedAxisY === 0 && flagOppositeForceDetectedY) ship.lockInverseSpeedAxisY = 1;
    if (ship.lockInverseSpeedAxisZ === 0 && flagOppositeForceDetectedZ) ship.lockInverseSpeedAxisZ = 1;
    
    // Both keys of the axis released while locked → 2 (double-click disengages the lock: a re-press will not re-lock)
    if (ship.intent.strafeLeft === 0 && ship.intent.strafeRight === 0 && ship.lockInverseSpeedAxisX === 1) ship.lockInverseSpeedAxisX = 2;
    if (ship.intent.liftUp === 0 && ship.intent.liftDown === 0 && ship.lockInverseSpeedAxisY === 1) ship.lockInverseSpeedAxisY = 2;
    if (ship.intent.thrust === 0 && ship.intent.brake === 0 && ship.lockInverseSpeedAxisZ === 1) ship.lockInverseSpeedAxisZ = 2;
    
    // Lock at 2 AND no opposite force detected (the speed is now in the same direction as the thrust, or 0)
    // AND a thrust is applied on this axis (re-press after the double-click) => the lock re-arms to 0
    if (ship.lockInverseSpeedAxisX === 2 && !flagOppositeForceDetectedX && shipLocalThrustX !== 0) ship.lockInverseSpeedAxisX = 0;
    if (ship.lockInverseSpeedAxisY === 2 && !flagOppositeForceDetectedY && shipLocalThrustY !== 0) ship.lockInverseSpeedAxisY = 0;
    if (ship.lockInverseSpeedAxisZ === 2 && !flagOppositeForceDetectedZ && shipLocalThrustZ !== 0) ship.lockInverseSpeedAxisZ = 0;
    
    // Locked axes FIRST: progressive brake toward 0 on that axis (stop at 0, never reverse).
    // shipLocalVelocityX/Y/Z (Step 3.5) is the current speed component along that ship axis.
    // dv = speed removed on that axis this frame (at most brakePower*dt, floored at 0).
    if (ship.lockInverseSpeedAxisX === 1) {
      const dv = -Math.sign(shipLocalVelocityX) * Math.min(Math.abs(shipLocalVelocityX), ship.brakePower * dt);
      ship.velocity.x += worldRightX * dv;
      ship.velocity.y += worldRightY * dv;
      ship.velocity.z += worldRightZ * dv;
    }
    if (ship.lockInverseSpeedAxisY === 1) {
      const dv = -Math.sign(shipLocalVelocityY) * Math.min(Math.abs(shipLocalVelocityY), ship.brakePower * dt);
      ship.velocity.x += worldUpX * dv;
      ship.velocity.y += worldUpY * dv;
      ship.velocity.z += worldUpZ * dv;
    }
    if (ship.lockInverseSpeedAxisZ === 1) {
      const dv = -Math.sign(shipLocalVelocityZ) * Math.min(Math.abs(shipLocalVelocityZ), ship.brakePower * dt);
      ship.velocity.x += worldForwardX * dv;
      ship.velocity.y += worldForwardY * dv;
      ship.velocity.z += worldForwardZ * dv;
    }

    // Effective thrust: 0 while locked (1) — no thrust against the brake; full thrust when disengaged (2)
    const appliedThrustX = ship.lockInverseSpeedAxisX === 1 ? 0 : shipLocalThrustX;
    const appliedThrustY = ship.lockInverseSpeedAxisY === 1 ? 0 : shipLocalThrustY;
    const appliedThrustZ = ship.lockInverseSpeedAxisZ === 1 ? 0 : shipLocalThrustZ;

    // Effective push for the VISUAL mirror (gas plumes): while locked, the brake is the real push —
    // full power while the axis still moves, 0 at rest (the gas stops when the ship is immobilized);
    // otherwise the raw demand. Normalized to -1..1. Physics above is unchanged.
    ship.visualThrust.x = ship.lockInverseSpeedAxisX === 1 ? -Math.sign(shipLocalVelocityX) : shipLocalThrustX / ship.thrustPower;
    ship.visualThrust.y = ship.lockInverseSpeedAxisY === 1 ? -Math.sign(shipLocalVelocityY) : shipLocalThrustY / ship.thrustPower;
    ship.visualThrust.z = ship.lockInverseSpeedAxisZ === 1 ? -Math.sign(shipLocalVelocityZ) : shipLocalThrustZ / ship.thrustPower;

    // Step 4 — new velocity on the world axes (ship-frame thrust converted to the world frame)
    ship.velocity.x += (worldRightX * appliedThrustX + worldUpX * appliedThrustY + worldForwardX * appliedThrustZ) * dt;
    ship.velocity.y += (worldRightY * appliedThrustX + worldUpY * appliedThrustY + worldForwardY * appliedThrustZ) * dt;
    ship.velocity.z += (worldRightZ * appliedThrustX + worldUpZ * appliedThrustY + worldForwardZ * appliedThrustZ) * dt;

    // Auto-brake (Space): decelerate the WHOLE velocity toward 0, stop there —
    // never reverses, whatever the direction of travel.
    if (ship.intent.stopAllTranslation > 0) {
      const decel = ship.stopAllBrakePower * dt;
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
    // Per-axis inverse-spin lock: same 3 states as the translation lock, but the rotation angles
    // are already world-frame, so angularVelocity needs no projection.
    // rotationDemand = the demanded turn on this axis this frame (difference of the two intent keys)
    const rotationDemandX = ship.intent.pitchUp - ship.intent.pitchDown;
    const rotationDemandY = ship.intent.yawLeft - ship.intent.yawRight;
    const rotationDemandZ = ship.intent.rollLeft - ship.intent.rollRight;

    // true = the demanded turn on this axis fights the current spin (opposite signs)
    const flagOppositeRotationDetectedX = rotationDemandX * ship.angularVelocity.x < 0;
    const flagOppositeRotationDetectedY = rotationDemandY * ship.angularVelocity.y < 0;
    const flagOppositeRotationDetectedZ = rotationDemandZ * ship.angularVelocity.z < 0;

    if (ship.lockInverseRotationAxisX === 0 && flagOppositeRotationDetectedX) ship.lockInverseRotationAxisX = 1;
    if (ship.lockInverseRotationAxisY === 0 && flagOppositeRotationDetectedY) ship.lockInverseRotationAxisY = 1;
    if (ship.lockInverseRotationAxisZ === 0 && flagOppositeRotationDetectedZ) ship.lockInverseRotationAxisZ = 1;

    // Both keys of the axis released while locked → 2 (double-click disengages the lock)
    if (ship.intent.pitchUp === 0 && ship.intent.pitchDown === 0 && ship.lockInverseRotationAxisX === 1) ship.lockInverseRotationAxisX = 2;
    if (ship.intent.yawLeft === 0 && ship.intent.yawRight === 0 && ship.lockInverseRotationAxisY === 1) ship.lockInverseRotationAxisY = 2;
    if (ship.intent.rollLeft === 0 && ship.intent.rollRight === 0 && ship.lockInverseRotationAxisZ === 1) ship.lockInverseRotationAxisZ = 2;

    // Re-arm (2 → 0) once a pressed turn no longer fights the current spin (the spin changed sign)
    if (ship.lockInverseRotationAxisX === 2 && !flagOppositeRotationDetectedX && rotationDemandX !== 0) ship.lockInverseRotationAxisX = 0;
    if (ship.lockInverseRotationAxisY === 2 && !flagOppositeRotationDetectedY && rotationDemandY !== 0) ship.lockInverseRotationAxisY = 0;
    if (ship.lockInverseRotationAxisZ === 2 && !flagOppositeRotationDetectedZ && rotationDemandZ !== 0) ship.lockInverseRotationAxisZ = 0;

    // Locked spin axes FIRST: progressive brake toward 0 on that axis (stop at 0, never reverse).
    // dw = spin removed on that axis this frame (at most turnPower*dt, floored at 0) — same pattern as the
    // translation dv, with turnPower as the spin brake power (the opposite key pushes at turnPower).
    if (ship.lockInverseRotationAxisX === 1) {
      const dw = -Math.sign(ship.angularVelocity.x) * Math.min(Math.abs(ship.angularVelocity.x), ship.turnPower * dt);
      ship.angularVelocity.x += dw;
    }
    if (ship.lockInverseRotationAxisY === 1) {
      const dw = -Math.sign(ship.angularVelocity.y) * Math.min(Math.abs(ship.angularVelocity.y), ship.turnPower * dt);
      ship.angularVelocity.y += dw;
    }
    if (ship.lockInverseRotationAxisZ === 1) {
      const dw = -Math.sign(ship.angularVelocity.z) * Math.min(Math.abs(ship.angularVelocity.z), ship.turnPower * dt);
      ship.angularVelocity.z += dw;
    }

    // Effective rotation thrust: 0 while locked (1) — no turn against the brake; full demand when disengaged (2). Same pattern as appliedThrust.
    const appliedRotationThrustX = ship.lockInverseRotationAxisX === 1 ? 0 : rotationDemandX;
    const appliedRotationThrustY = ship.lockInverseRotationAxisY === 1 ? 0 : rotationDemandY;
    const appliedRotationThrustZ = ship.lockInverseRotationAxisZ === 1 ? 0 : rotationDemandZ;

    // Same for the rotation demand (visual mirror): while locked, the spin brake is the real push (0 at rest)
    ship.visualRotation.x = ship.lockInverseRotationAxisX === 1 ? -Math.sign(ship.angularVelocity.x) : rotationDemandX;
    ship.visualRotation.y = ship.lockInverseRotationAxisY === 1 ? -Math.sign(ship.angularVelocity.y) : rotationDemandY;
    ship.visualRotation.z = ship.lockInverseRotationAxisZ === 1 ? -Math.sign(ship.angularVelocity.z) : rotationDemandZ;

    // Pitch: positive rotation.x = nose UP on screen.
    ship.angularVelocity.x += appliedRotationThrustX * ship.turnPower * dt;
    if (ship.angularVelocity.x > ship.maxTurnRate) ship.angularVelocity.x = ship.maxTurnRate;
    if (ship.angularVelocity.x < -ship.maxTurnRate) ship.angularVelocity.x = -ship.maxTurnRate;
    
    // Yaw: positive rotation.y = nose LEFT on screen
    // (the nose -Z goes toward -X, which is screen-left for our camera).
    ship.angularVelocity.y += appliedRotationThrustY * ship.turnPower * dt;
    if (ship.angularVelocity.y > ship.maxTurnRate) ship.angularVelocity.y = ship.maxTurnRate;
    if (ship.angularVelocity.y < -ship.maxTurnRate) ship.angularVelocity.y = -ship.maxTurnRate;
    
    // Roll: positive rotation.z lifts the right wing (+X) toward +Y = roll LEFT
    // from the pilot's view (sign to be confirmed in play, like the yaw was).
    ship.angularVelocity.z += appliedRotationThrustZ * ship.turnPower * dt;
    if (ship.angularVelocity.z > ship.maxTurnRate) ship.angularVelocity.z = ship.maxTurnRate;
    if (ship.angularVelocity.z < -ship.maxTurnRate) ship.angularVelocity.z = -ship.maxTurnRate;

    // Spin brake (Shift): decelerate the WHOLE angular velocity toward 0 —
    // same pattern as the Space stop, on the rotation axes.
    if (ship.intent.stopAllRotation > 0) {
      const decel = ship.stopAllSpinBrakePower * dt;
      const w = Math.hypot(ship.angularVelocity.x, ship.angularVelocity.y, ship.angularVelocity.z);
      if (w <= decel) {
        ship.angularVelocity.x = 0;
        ship.angularVelocity.y = 0;
        ship.angularVelocity.z = 0;
      } else {
        const k = (w - decel) / w;
        ship.angularVelocity.x *= k;
        ship.angularVelocity.y *= k;
        ship.angularVelocity.z *= k;
      }
    }
    ship.rotation.x += ship.angularVelocity.x * dt;
    ship.rotation.y += ship.angularVelocity.y * dt;
    ship.rotation.z += ship.angularVelocity.z * dt;
  }
}
