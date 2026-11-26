"use client";

// Earth.tsx — the REAL Earth, not a blue ball.
// Textures: NASA Blue Marble (public domain), served from /public/textures/.
// Layers:
//   1. surface    — albedo map + normal map (relief: mountains, ocean trenches), ROTATING slowly
//   2. clouds     — transparent PNG layer, slightly above the surface, DRIFTING
//   3. atmosphere — fresnel shader on a thin BackSide shell → PROGRESSIVE blue rim
//                   (bright at the outer limb, fading to 0 toward the planet)
// The planet's own rotation lives in the useFrame below (planetRef). Sphere collision lives in
// game/physics/newton.ts (updatePlanetCollision). Geometry constants live in
// game/core/world.ts (shared between the physics collision and this rendering).

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { EARTH } from "@/game/core/world";

const RADIUS = EARTH.radius;
const POSITION: [number, number, number] = [EARTH.position.x, EARTH.position.y, EARTH.position.z];

// Cloud drift speed (texture offset per second, wraps at 1 = full lap).
// 0.004 → 0.0016 = 60% slower. Tweak this value live (HMR) to taste.
const CLOUD_DRIFT_SPEED = 0.0006;

// Planet's own spin (radians per second, around its polar Y axis).
// 0.02 ≈ one full revolution in ~5 min — visible when watched, not dizzying.
// Tweak this value live (HMR) to taste.
const PLANET_ROTATION_SPEED = 0.002;

// GEOMETRIC relief on the continents: the albedo map doubles as a heightmap
// (its green channel: dark oceans = low, bright land = high). The sphere's
// vertices are displaced along their normals by displacementScale.
// On a radius-30 planet, 0.5 ≈ 1.7% of relief — visible from low orbit.
// NOTE: the collision sphere uses EARTH_SURFACE_MAX = RADIUS + RELIEF_SCALE (world.ts).
const RELIEF_SCALE = 0.5;
const RELIEF_BIAS = -0.12; // pushes oceans slightly below 0, keeps land positive

export function Earth() {
  // Ref to the rotating surface group: the JSX below attaches the real THREE.Group
  // to planetRef.current at mount, so useFrame can mutate it without any re-render.
  const planetRef = useRef<THREE.Group>(null);

  const { map, normalMap, clouds } = useTexture({
    map: "/textures/earth_atmos.jpg",
    normalMap: "/textures/earth_normal.jpg",
    clouds: "/textures/earth_clouds.png",
  });

  // Color textures must be sRGB; the normal map stays linear (default).
  // Clouds need RepeatWrapping on S so the drift offset wraps seamlessly.
  useEffect(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    clouds.colorSpace = THREE.SRGBColorSpace;
    clouds.wrapS = THREE.RepeatWrapping;
  }, [map, clouds]);

  // Clouds drift slowly around the planet — the texture offset scrolls eastward.
  // (This is the clouds' own wind, on top of the planet's rotation below.)
  useFrame((_, dt) => {
    clouds.offset.x = (clouds.offset.x + dt * CLOUD_DRIFT_SPEED) % 1;
  });

  // The planet itself spins slowly around its own Y axis (the surface group only —
  // clouds keep their own wind drift, and the view-based atmosphere shader must NOT rotate).
  useFrame((_, dt) => {
    if (planetRef.current) planetRef.current.rotation.y += dt * PLANET_ROTATION_SPEED;
  });

  // Atmosphere: a BackSide shell whose glow is driven by the VIEW-RAY ANGLE θ
  // from the planet's center (not by the shell normal — a normal-based fresnel
  // saturates when the camera is close to / inside the shell and turns into a
  // hard-edged band). Here: θ_planet = asin(R_planet / D) is the planet's limb,
  // θ_shell = asin(R_shell / D) the shell's silhouette. t = (θ_shell − θ)/(θ_shell − θ_planet)
  // is 1 at the planet's limb and 0 at the shell's edge → the glow PEAKS exactly
  // on the planet's contour and fades PROGRESSIVELY outward, symmetric from any
  // angle and at any distance (camera inside or outside the shell).
  const SHELL_SCALE = 1.10;
  const atmosphereMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color("#3769ce") },
          uPower: { value: 1.8 },
          uPeak: { value: 0.8 }, // slightly dimmer rim: the planet texture is now lit, keep the rim below it
          uViewMatrix: { value: new THREE.Matrix4() },
          uPlanetPos: { value: new THREE.Vector3(...POSITION) },
          uThetaPlanet: { value: 0.5 },
          uThetaShell: { value: 0.6 },
        },
        vertexShader: /* glsl */ `
          varying vec3 vMvPos;
          varying vec3 vCenterView;
          uniform mat4 uViewMatrix;
          uniform vec3 uPlanetPos;
          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vMvPos = mvPosition.xyz;                       // view space: camera at origin
            vCenterView = (uViewMatrix * vec4(uPlanetPos, 1.0)).xyz; // planet center, view space
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          uniform float uPower;
          uniform float uPeak;
          uniform float uThetaPlanet;
          uniform float uThetaShell;
          varying vec3 vMvPos;
          varying vec3 vCenterView;
          void main() {
            vec3 rayDir = normalize(vMvPos);              // view ray from the camera
            vec3 toCenter = normalize(vCenterView);
            float theta = acos(clamp(dot(rayDir, toCenter), -1.0, 1.0)); // angle from planet axis
            float t = clamp((uThetaShell - theta) / max(uThetaShell - uThetaPlanet, 1e-4), 0.0, 1.0);
            float intensity = pow(t, uPower) * uPeak;
            gl_FragColor = vec4(uColor * intensity, 1.0);
          }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    []
  );

  // Per frame: feed the shader the camera view matrix and the limb angles
  // (they depend on the camera↔planet distance D, which changes as the ship flies).
  useFrame(({ camera }) => {
    const D = camera.position.distanceTo(new THREE.Vector3(...POSITION));
    const R_shell = RADIUS * SHELL_SCALE;
    const u = atmosphereMat.uniforms;
    u.uViewMatrix.value.copy(camera.matrixWorld).invert();
    u.uThetaPlanet.value = Math.asin(Math.min(RADIUS / D, 1));
    u.uThetaShell.value = D > R_shell ? Math.asin(Math.min(R_shell / D, 1)) : Math.PI;
  });

  return (
    <group position={POSITION}>
      {/* 1 — the surface: textured sphere with REAL geometric relief (displacement),
            inside its rotating group (the planet's own spin) */}
      <group ref={planetRef}>
        <mesh>
          <sphereGeometry args={[RADIUS, 128, 128]} />
          <meshStandardMaterial
            map={map}
            normalMap={normalMap}
            normalScale={[0.85, 0.85]}
            displacementMap={map}
            displacementScale={RELIEF_SCALE}
            displacementBias={RELIEF_BIAS}
            roughness={0.85}
            metalness={0.0}
          />
        </mesh>
      </group>

      {/* 2 — cloud layer: 2% above the surface (clears the relief), transparent, drifting */}
      <mesh scale={1.02}>
        <sphereGeometry args={[RADIUS, 64, 64]} />
        <meshStandardMaterial map={clouds} transparent depthWrite={false} opacity={0.9} roughness={1} />
      </mesh>

      {/* 3 — atmosphere: shell 10% larger, view-ray-angle shader → rim peaks at the planet's limb, fades progressively outward, symmetric at any distance */}
      <mesh scale={SHELL_SCALE}>
        <sphereGeometry args={[RADIUS, 64, 64]} />
        <primitive object={atmosphereMat} attach="material" />
      </mesh>
    </group>
  );
}
