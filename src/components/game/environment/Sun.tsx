import { useMemo } from "react";
import * as THREE from "three";

// Step 4 v0: the sun = one directional light + a basic halo sprite.
// The light itself becomes visible with the Earth (step 5: day/night).
export function Sun() {
  // This canvas is NOT the on-screen WebGL <Canvas> of Scene.tsx: it is an
  // off-screen 2D canvas used only as a texture factory — we draw a radial
  // gradient on it, then wrap it in a THREE texture. No image asset needed.
  const haloTexture = useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, "rgba(255, 245, 210, 1)");
      g.addColorStop(0.35, "rgba(255, 210, 120, 0.7)");
      g.addColorStop(1, "rgba(255, 190, 90, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <>
      {/* With r3f, three.js components need no import */}
      {/* The honest light: directional, shining from the sun's position. */}
      <directionalLight position={[100, 50, -100]} intensity={2.5} color="#fff3d6" />
      {/* The visible halo: a sprite always faces the camera. */}
      <sprite position={[100, 50, -100]} scale={[30, 30, 1]}>
        <spriteMaterial map={haloTexture} transparent depthWrite={false} />
      </sprite>
    </>
  );
}
