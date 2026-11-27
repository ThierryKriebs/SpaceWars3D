import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// The sun = one directional light (the honest lighting) + a VISIBLE sun glued to the
// camera's star shell (like the stars, Stars.tsx): always at the same distance and
// angular size, whatever the ship does. SUN_DIRECTION is also the direction the
// directional light shines FROM (its position), so light and visual sun always agree.
const SUN_DIRECTION: [number, number, number] = [100, 50, -100];
const SUN_DISTANCE = 800; // same shell as the stars
const SUN_DIR_NORM = new THREE.Vector3(...SUN_DIRECTION).normalize();

export function Sun() {
  const groupRef = useRef<THREE.Group>(null);
  const raysRef = useRef<THREE.Sprite>(null);

  // Off-screen 2D canvases used only as texture factories (no image assets needed):
  // - disk: pure white blown-out core, long falloff to the edge → no visible contour
  // - halo: central white glow, wide and fading progressively
  // - outerHalo: a second, much bigger and fainter diffuse glow around everything
  // - rays: star flare drawn once; in useFrame its opacity = facing-the-sun factor ×
  //   slow pulse, so the rays only show when the camera aims at the sun and breathe
  //   in/out over time (in space the real sun has no rays — they are a lens artifact)
  const { diskTexture, haloTexture, outerHaloTexture, raysTexture } = useMemo(() => {
    const size = 128;
    const disk = document.createElement("canvas");
    disk.width = size;
    disk.height = size;
    const dctx = disk.getContext("2d");
    if (dctx) {
      // Blown-out core like a real photo: solid white center, long smooth falloff to
      // transparent AT the edge — no visible circular contour anywhere.
      const g = dctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.45, "#ffffff");
      g.addColorStop(0.8, "rgba(255, 255, 255, 0.25)");
      g.addColorStop(1, "rgba(255, 255, 255, 0)");
      dctx.fillStyle = g;
      dctx.fillRect(0, 0, size, size);
    }
    const halo = document.createElement("canvas");
    halo.width = size;
    halo.height = size;
    const hctx = halo.getContext("2d");
    if (hctx) {
      // Central halo: white core, wide and fading progressively (several stops).
      const g = hctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, "rgba(255, 255, 252, 0.75)");
      g.addColorStop(0.15, "rgba(250, 250, 246, 0.45)");
      g.addColorStop(0.35, "rgba(242, 246, 252, 0.22)");
      g.addColorStop(0.6, "rgba(238, 242, 250, 0.08)");
      g.addColorStop(0.85, "rgba(235, 240, 250, 0.02)");
      g.addColorStop(0.95, "rgba(235, 240, 250, 0.008)");
      g.addColorStop(1, "rgba(235, 240, 250, 0)");
      hctx.fillStyle = g;
      hctx.fillRect(0, 0, size, size);
    }
    const outerHalo = document.createElement("canvas");
    outerHalo.width = size;
    outerHalo.height = size;
    const octx = outerHalo.getContext("2d");
    if (octx) {
      // Outer halo: very diffuse, faint, spread over the whole canvas.
      const g = octx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, "rgba(235, 240, 252, 0.26)");
      g.addColorStop(0.3, "rgba(232, 239, 250, 0.13)");
      g.addColorStop(0.6, "rgba(228, 236, 249, 0.05)");
      g.addColorStop(0.85, "rgba(225, 235, 250, 0.015)");
      g.addColorStop(0.95, "rgba(225, 235, 250, 0.006)");
      g.addColorStop(1, "rgba(225, 235, 250, 0)");
      octx.fillStyle = g;
      octx.fillRect(0, 0, size, size);
    }
    const rays = document.createElement("canvas");
    rays.width = size;
    rays.height = size;
    const rctx = rays.getContext("2d");
    if (rctx) {
      rctx.translate(size / 2, size / 2);
      // Slight blur: real lens spikes are soft, not razor-sharp geometric lines.
      rctx.filter = "blur(2px)";
      // 24 spikes, each with its own angle/length/width/opacity — irregular like a real
      // lens flare. The HORIZONTAL pair is the longest and the thinnest, as in the photo.
      const spikes = [
        { angle: 0, length: size / 2, width: 1.2, alpha: 0.95 },
        { angle: Math.PI, length: size * 0.47, width: 1.0, alpha: 0.8 },
        { angle: Math.PI / 2, length: size * 0.28, width: 1.0, alpha: 0.55 },
        { angle: -Math.PI / 2, length: size * 0.24, width: 0.9, alpha: 0.45 },
        { angle: Math.PI / 4, length: size * 0.26, width: 0.8, alpha: 0.38 },
        { angle: (3 * Math.PI) / 4, length: size * 0.21, width: 0.7, alpha: 0.3 },
        { angle: (5 * Math.PI) / 4, length: size * 0.24, width: 0.75, alpha: 0.34 },
        { angle: (7 * Math.PI) / 4, length: size * 0.19, width: 0.6, alpha: 0.26 },
      ];
      // 16 minor spikes between the main directions, short and faint.
      for (let i = 0; i < 16; i++) {
        spikes.push({
          angle: (i + 0.5) * (Math.PI / 8),
          length: size * (0.08 + 0.025 * ((i * 7) % 4)),
          width: 0.5,
          alpha: 0.1 + 0.04 * ((i * 5) % 3),
        });
      }
      for (const spike of spikes) {
        rctx.save();
        rctx.rotate(spike.angle);
        const g = rctx.createLinearGradient(0, 0, spike.length, 0);
        g.addColorStop(0, `rgba(255, 253, 246, ${spike.alpha})`);
        g.addColorStop(1, "rgba(255, 253, 246, 0)");
        rctx.fillStyle = g;
        rctx.beginPath();
        rctx.moveTo(0, -spike.width);
        rctx.lineTo(spike.length, 0);
        rctx.lineTo(0, spike.width);
        rctx.closePath();
        rctx.fill();
        rctx.restore();
      }
    }
    return {
      diskTexture: new THREE.CanvasTexture(disk),
      haloTexture: new THREE.CanvasTexture(halo),
      outerHaloTexture: new THREE.CanvasTexture(outerHalo),
      raysTexture: new THREE.CanvasTexture(rays),
    };
  }, []);

  // Sun position on the camera-centered shell, in the fixed sun direction.
  const sunPos = useMemo(() => SUN_DIR_NORM.clone().multiplyScalar(SUN_DISTANCE), []);

  // Temp vector reused every frame to avoid allocating one per frame.
  const cameraForward = useMemo(() => new THREE.Vector3(), []);

  // Like the stars: re-center the group on the camera every frame, so the sun is always
  // at SUN_DISTANCE — same distance, same angular size, whatever the ship does.
  // The rays are a LENS artifact: they only exist when the camera looks almost dead
  // center at the sun, so their opacity is multiplied by the facing factor below.
  useFrame((state) => {
    if (groupRef.current) groupRef.current.position.copy(state.camera.position);
    if (raysRef.current) {
      state.camera.getWorldDirection(cameraForward);
      const cosAngle = cameraForward.dot(SUN_DIR_NORM); // 1 = looking exactly at the sun
      // 0 at ~20 degrees off-center, 1 within ~6 degrees: wide smooth cone around the sun.
      const facingSun = THREE.MathUtils.smoothstep(cosAngle, 0.94, 0.995);
      const pulse = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 0.4); // slow, ~15 s period
      (raysRef.current.material as THREE.SpriteMaterial).opacity = facingSun * (0.1 + 0.35 * pulse);
    }
  });

  return (
    <>
      {/* With r3f, three.js components need no import */}
      {/* Ambient fill: unlit faces stay readable (space is never pure black). */}
      <ambientLight intensity={0.85} />
      {/* The honest light: directional, shining from the sun's direction. */}
      <directionalLight position={SUN_DIRECTION} intensity={2.5} color="#fff3d6" />
      <group ref={groupRef}>
        <group position={sunPos}>
          {/* big diffuse outer halo behind everything (sprites always face the camera) */}
          <sprite renderOrder={0} scale={[1100, 1100, 1]}>
            <spriteMaterial map={outerHaloTexture} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
          {/* central halo, wider and softer than before */}
          <sprite renderOrder={1} scale={[300, 300, 1]}>
            <spriteMaterial map={haloTexture} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
          {/* the rays flare, pulsing slowly (opacity animated in useFrame) */}
          <sprite ref={raysRef} renderOrder={2} scale={[475, 475, 1]}>
            <spriteMaterial map={raysTexture} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.2} />
          </sprite>
          {/* the dazzling disk — toneMapped=false so it renders at full brightness */}
          <sprite renderOrder={3} scale={[44, 44, 1]}>
            <spriteMaterial map={diskTexture} toneMapped={false} depthWrite={false} />
          </sprite>
        </group>
      </group>
    </>
  );
}
