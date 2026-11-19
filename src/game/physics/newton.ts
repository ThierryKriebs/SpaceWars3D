import { state } from "../core/state";

// newton.ts — THE integrator: intentions become movement.
// It is the ONLY module in the whole game allowed to write `position`.
export function updateShips(dt: number): void {
  for (const ship of state.ships) {
    // The ship's local axes in world frame = the columns of its rotation matrix
    // (same Euler XYZ composition as three.js; verified against the reference
    // matrix — identical results, shorter names). The nose (local -Z) is
    // unchanged by roll, but the wing (local +X) and roof (local +Y) are tilted
    // by it, so right/up include rz.
    const rx = ship.rotation.x;
    const ry = ship.rotation.y;
    const rz = ship.rotation.z;
    
    //cX => cosinus(X), sX => sinus(X), etc. for the three rotation axes.
    const cX = Math.cos(rx); 
    const sX = Math.sin(rx);
    const cY = Math.cos(ry);
    const sY = Math.sin(ry);
    const cZ = Math.cos(rz); //cZ  =  cos(roulis)  =  la part que le roulis laisse sur l'axe de départ
    const sZ = Math.sin(rz);

    //The ship pushes in three directions (nose, right wing, roof)

    // ‘forward’ is a single vector (the direction of the nose), which can be decomposed along the three axes of the global reference system:
    // forward = (0, 0, −1) => The entire nose is on the world Z-component
    const forwardX = -sY;       // proportion of the movement along the x-axis
    const forwardY = sX * cY;   // proportion of the movement along the y-axis
    const forwardZ = -cY * cX;  // proportion of the movement along the z-axis

    // 'right' is a single vector (the direction of the wing axis, +X => right side), which can be decomposed along the three axes of the global reference system:
    // right = (1, 0, 0) => The entire right wing is on the world X-component
    // 1 roll (roulis Z), then 2 yaws (lacet Y), then 3 pitches (tangage X) => always in that order
    const rightX   = cZ * cY * 1;                   // cZ * cY * 1 proportion of the wing's direction along the x-axis of the world (the monitor reference), after all rotations
                                                    //`cZ * cY * 1;`  (roulis * lacet * tangage)
    const rightY   = sZ * 1 * cX + cZ * sY * sX;    // proportion of the wing's direction along the y-axis of the world, after all rotations
                                                    // sZ * 1 * cX  +  cZ * sY * sX;  
    const rightZ   = sZ * 1 * sX - cZ * sY * cX;    // proportion of the wing's direction along the z-axis of the world, after all rotations
                                                    // sZ * 1 * sX - cZ * sY * cX    

    // 'up' is a single vector (the direction of the roof axis, +Y => top side / canopy), which can be decomposed along the three axes of the global reference system:
    // up = (0, 1, 0) => The entire roof is on the world Y-component
    const upX      = -cY * sZ;
    const upY      = cX * cZ - sX * sY * sZ;
    const upZ      = sX * cZ + cX * sY * sZ;

    // Each ship reads ITS OWN intent from its sheet. All are 0-1 intentions.
    // Commanded thrust in the ship's OWN frame (units/s²), then rotated to world
    // with ONE matrix-vector product: velocity += R · shipThrust × dt.
    const shipThrustX = (ship.intent.strafeRight - ship.intent.strafeLeft) * ship.thrustPower;       // along the wings
    const shipThrustY = (ship.intent.liftUp - ship.intent.liftDown) * ship.thrustPower;              // along the roof
    const shipThrustZ = ship.intent.thrust * ship.thrustPower - ship.intent.brake * ship.brakePower; // along the nose
    
    ship.velocity.x += (rightX * shipThrustX + upX * shipThrustY + forwardX * shipThrustZ) * dt;
    ship.velocity.y += (rightY * shipThrustX + upY * shipThrustY + forwardY * shipThrustZ) * dt;
    ship.velocity.z += (rightZ * shipThrustX + upZ * shipThrustY + forwardZ * shipThrustZ) * dt;

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
