"use client";

// CameraRig.tsx — THE CAMERA MIRROR.
// Called by: Scene.tsx, inside the <Canvas>. Replaces OrbitControls (kept commented there).
// Why: reads the player's position + rotation in the photo (state) and places the
// camera behind the ship along its own axis, looking forward — every frame.
// Renders nothing itself.

import { useFrame, useThree } from "@react-three/fiber";
import { Euler, Vector3 } from "three";
import { state } from "@/game/core/state";

export function CameraRig() {
  const { camera } = useThree(); // the default camera of the <Canvas>
  useFrame(() => { // every rendered frame (~60/s):
    const ship = state.ships[0]; // the player's sheet in the photo
    if (!ship) return;
    // The ship's rotation as a three.js Euler (same values as the photo).
    const rot = new Euler(ship.rotation.x, ship.rotation.y, ship.rotation.z);
    // Camera offset in the SHIP's own frame: 3 up, 8 behind (local +Z = tail).
    // applyEuler applies the ship's rotation to it — no sin/cos written by hand.
    const offset = new Vector3(0, 3, 8).applyEuler(rot);
    camera.position.set(
      ship.position.x + offset.x,
      ship.position.y + offset.y,
      ship.position.z + offset.z
    );
    // Aim 10 units ahead in the ship's own frame (local -Z = nose).
    const ahead = new Vector3(0, 0, -10).applyEuler(rot);
    camera.lookAt(
      ship.position.x + ahead.x,
      ship.position.y + ahead.y,
      ship.position.z + ahead.z
    );
  });
  return null; // only moves the camera, renders nothing
}
