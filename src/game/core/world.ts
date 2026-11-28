// world.ts — the geometry of the world, as PLAIN NUMBERS (no three.js:
// the game/ core stays pure and headless-testable).
// Shared by the physics (collision — newton.ts, updatePlanetCollision) and the
// rendering (Earth.tsx places its mesh from these constants).

export const EARTH = {
  position: { x: 0, y: 0, z: -110 }, // moved back so the bigger planet keeps the spawn (0,0,-10) 10 units above its surface (surface at z = -20)
  radius: 90, // real Earth is ~850 000x a fighter jet — impossible in game units, so the planet is made visually huge instead (8K textures + anisotropy keep it sharp)
} as const;

// Approximate radius of a ship for collision (the shift dart is ~3-4 units long).
export const SHIP_COLLISION_RADIUS = 1.5;

// The surface is a perfectly smooth sphere (relief is normal-map only, no geometric
// displacement), so the collision sphere is exactly EARTH.radius.
export const EARTH_SURFACE_MAX = EARTH.radius;

// Atmospheric plasma (reentry glow) starts at this distance from the planet center
// (10 units above the surface) and reaches full intensity at surface contact
// (EARTH_SURFACE_MAX + SHIP_COLLISION_RADIUS = 91.5).
export const PLASMA_OUTER_DISTANCE = EARTH.radius + 10; // 100 — plasma starts 10 units above the surface (at spawn the proximity is 0)
