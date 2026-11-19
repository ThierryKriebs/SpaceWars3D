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
    
    //cX => cosinus(X), sX => sinus(X), etc. for the three rotation axes.
    const cX = Math.cos(worldShipRotationX); 
    const sX = Math.sin(worldShipRotationX);
    const cY = Math.cos(worldShipRotationY);
    const sY = Math.sin(worldShipRotationY);
    const cZ = Math.cos(worldShipRotationZ); //cZ  =  cos(roulis)  =  la part que le roulis laisse sur l'axe de départ
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
    // 1 roll (roulis Z), then 2 yaws (lacet Y), then 3 pitches (tangage X) => always in that order
    const worldRightX   = cZ * cY * 1;                   // cZ * cY * 1 proportion of the wing's direction along the x-axis of the world (the monitor reference), after all rotations
                                                    //`cZ * cY * 1;`  (roulis * lacet * tangage)
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
    
    // Step 4 — new velocity on the world axes (ship-frame thrust converted to the world frame)
    ship.velocity.x += (worldRightX * shipLocalThrustX + worldUpX * shipLocalThrustY + worldForwardX * shipLocalThrustZ) * dt;
    ship.velocity.y += (worldRightY * shipLocalThrustX + worldUpY * shipLocalThrustY + worldForwardY * shipLocalThrustZ) * dt;
    ship.velocity.z += (worldRightZ * shipLocalThrustX + worldUpZ * shipLocalThrustY + worldForwardZ * shipLocalThrustZ) * dt;

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
    // Pitch: positive rotation.x = nose UP on screen.
    ship.angularVelocity.x += (ship.intent.pitchUp - ship.intent.pitchDown) * ship.turnPower * dt;
    if (ship.angularVelocity.x > ship.maxTurnRate) ship.angularVelocity.x = ship.maxTurnRate;
    if (ship.angularVelocity.x < -ship.maxTurnRate) ship.angularVelocity.x = -ship.maxTurnRate;
    // Yaw: positive rotation.y = nose LEFT on screen
    // (the nose -Z goes toward -X, which is screen-left for our camera).
    ship.angularVelocity.y += (ship.intent.yawLeft - ship.intent.yawRight) * ship.turnPower * dt;
    if (ship.angularVelocity.y > ship.maxTurnRate) ship.angularVelocity.y = ship.maxTurnRate;
    if (ship.angularVelocity.y < -ship.maxTurnRate) ship.angularVelocity.y = -ship.maxTurnRate;
    // Roll: positive rotation.z lifts the right wing (+X) toward +Y = roll LEFT
    // from the pilot's view (sign to be confirmed in play, like the yaw was).
    ship.angularVelocity.z += (ship.intent.rollLeft - ship.intent.rollRight) * ship.turnPower * dt;
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
