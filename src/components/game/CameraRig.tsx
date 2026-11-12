"use client";

// CameraRig.tsx — THE CAMERA MIRROR.
// Called by: Scene.tsx, inside the <Canvas>. Replaces OrbitControls (kept commented there).
// Why: reads the player's position + rotation in the photo (state) and places the
// camera behind the ship along its own axis, looking forward — every frame.
// Renders nothing itself.

import { useFrame, useThree } from "@react-three/fiber";
import { Euler, Quaternion, Vector3 } from "three";
import { state } from "@/game/core/state";

export function CameraRig() {
  const { camera } = useThree(); // the default camera of the <Canvas>
  useFrame(() => { // every rendered frame (~60/s):
    const ship = state.ships[0]; // the player's sheet in the photo
    if (!ship) return;
    // The chase camera is GLUED to the ship's frame (Descent-style): it takes the
    // ship's exact orientation and sits at (0, 3, 8) in the ship's local frame
    // (3 up, 8 behind). The ship is always centered and the view follows the
    // ship's real angles (yaw AND pitch) — no clamp, no blocking, no flip.
    const q = new Quaternion().setFromEuler(new Euler(ship.rotation.x, ship.rotation.y, ship.rotation.z));
    const offset = new Vector3(0, 3, 8).applyQuaternion(q);
    camera.position.set(ship.position.x + offset.x, ship.position.y + offset.y, ship.position.z + offset.z);
    camera.quaternion.copy(q); // look along the ship's own -Z (its nose)
  });
  return null; // only moves the camera, renders nothing
}
