import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars as DreiStars } from "@react-three/drei";
import * as THREE from "three";

// Layer 2 of the space backdrop: the star point cloud — drei's <Stars>.
// fade: radial opacity falloff per point (round soft stars, not squares).
// speed={0}: freeze the shader time — static stars, no synchronized pulsing.
// INFINITE SKY: the star sphere is re-centered on the camera every frame, so the
// backdrop never runs out — flying far away never leaves you in the black.
// radius 300 + depth 50: the whole shell (300..350) stays beyond the planet (radius 90)
// as seen from anywhere near it, and depthTest lets the planet occlude stars behind it.
export function Stars() {
  const groupRef = useRef<THREE.Group>(null);

  // useFrame(callback) runs `callback` on every rendered frame (calling it only registers it).
  // Each frame, r3f calls the callback with ONE argument: `state`, an object with many fields
  // (camera, scene, gl = renderer, clock, size, viewport...). We destructure `camera` out of it:
  // the three.js camera created by the <Canvas> (CameraRig moves that same object).
  // Here: each frame, put the star group where the camera is.
  useFrame(({ camera }) => {
    if (groupRef.current) groupRef.current.position.copy(camera.position);
  });

  return (
    <group ref={groupRef}>
      <DreiStars radius={300} depth={50} count={6000} factor={4} saturation={0} fade speed={0} />
    </group>
  );
}
