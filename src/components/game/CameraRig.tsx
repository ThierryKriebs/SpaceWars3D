"use client";

// CameraRig.tsx — THE CAMERA MIRROR.
// Called by: Scene.tsx, inside the <Canvas>. Replaces OrbitControls (kept commented there).
// Why: reads the player's position in the photo (state) and places the camera
// behind the ship, looking forward — every frame. Renders nothing itself.

import { useFrame, useThree } from "@react-three/fiber";
import { state } from "@/game/core/state";

export function CameraRig() {
  const { camera } = useThree(); // the default camera of the <Canvas>
  useFrame(() => { // every rendered frame (~60/s):
    const ship = state.ships[0]; // the player's sheet in the photo
    if (!ship) return;
    // place the camera 8 units behind the ship (+z), 3 above
    camera.position.set(ship.position.x, ship.position.y + 3, ship.position.z + 8);
    // aim ahead of the ship (forward = -z)
    camera.lookAt(ship.position.x, ship.position.y, ship.position.z - 10);
  });
  return null; // only moves the camera, renders nothing
}
