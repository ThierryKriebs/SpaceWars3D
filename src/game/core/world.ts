// world.ts — the geometry of the world, as PLAIN NUMBERS (no three.js:
// the game/ core stays pure and headless-testable).
// Shared by the physics (collision — newton.ts, updatePlanetCollision) and the
// rendering (Earth.tsx places its mesh from these constants).

export const EARTH = {
  position: { x: 0, y: 0, z: -60 },
  radius: 30, // real Earth is ~850 000x a fighter jet — impossible in game units, so the planet is made visually huge instead
} as const;

// Approximate radius of a ship for collision (the shift dart is ~3-4 units long).
export const SHIP_COLLISION_RADIUS = 1.5;

// The planet's surface is displaced (continents rise up to ~RELIEF_SCALE beyond
// EARTH.radius), so the collision sphere uses EARTH.radius + 0.5.
export const EARTH_SURFACE_MAX = EARTH.radius + 0.5;
