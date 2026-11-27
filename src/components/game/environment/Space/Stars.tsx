import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars as DreiStars } from "@react-three/drei";
import * as THREE from "three";

// Layer 2 of the space backdrop: the star point cloud — drei's <Stars>.
// fade: radial opacity falloff per point (round soft stars, not squares).
// speed={0}: freeze the shader time — static stars, no synchronized pulsing.
// INFINITE SKY: the star sphere is re-centered on the camera every frame, so the
// backdrop never runs out — flying far away never leaves you in the black.
// radius 800 + depth 100: the shell (800..900) is far enough that the camera's small
// orbit around the ship causes no visible parallax during rotations; it stays beyond
// the planet (radius 90) from anywhere, and depthTest lets the planet occlude stars.
// factor 40: at that distance drei's point size would drop under 1px and stars would
// flicker in/out — 40 keeps every star above ~1.5px. frustumCulled=false: the shell
// always contains the camera, and we never want the points culled. Camera far plane
// is raised to 5000 in Scene.tsx so the shell is never depth-culled either.
export function Stars() {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // useFrame(callback) runs `callback` on every rendered frame (calling it only registers it).
  // Each frame, r3f calls the callback with ONE argument: `state`, an object with many fields
  // (camera, scene, gl = renderer, clock, size, viewport...). We destructure `camera` out of it:
  // the three.js camera created by the <Canvas> (CameraRig moves that same object).
  // Here: each frame, put the star group where the camera is.
  useFrame(({ camera }) => {
    if (groupRef.current) groupRef.current.position.copy(camera.position);
  });

  useEffect(() => {
    const points = pointsRef.current;
    if (!points) return;
    points.frustumCulled = false;
    // Dim the stars a little: drei sets every vertex color to lightness 0.9 — scale it down
    // so the sky stays subtle (additive blending on black = color is the brightness).
    const colorAttr = points.geometry.getAttribute("color");
    for (let i = 0; i < colorAttr.count; i++) {
      colorAttr.setXYZ(i, colorAttr.getX(i) * 0.7, colorAttr.getY(i) * 0.7, colorAttr.getZ(i) * 0.7);
    }
    colorAttr.needsUpdate = true;
  }, []);

  return (
    <group ref={groupRef}>
      <DreiStars ref={pointsRef} radius={800} depth={100} count={3400} factor={40} saturation={0} fade speed={0} />
    </group>
  );
}
