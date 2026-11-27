"use client";

// Earth.tsx — the REAL Earth, not a blue ball.
// Textures: 8K SolarSystemScope Earth maps (Blue Marble based, via Wikimedia Commons),
// served from /public/textures/ — high resolution so the planet can later be made bigger.
// Layers:
//   1. surface    — 8K albedo (incl. eternal snows at the poles) + 2K normal map (light/shadow
//                   relief ONLY — the sphere itself stays perfectly smooth), ROTATING slowly
//   2. clouds     — 8K cloud map used as alphaMap, ~1 texture pixel above the surface, DRIFTING
//   3. atmosphere — view-angle shader on a thin BackSide shell → PROGRESSIVE blue rim
//                   peaking at the planet's limb, fading to 0 at the shell's edge.
//                   The cloud layer fades out toward the limb (see cloudMat): the rim
//                   stays pure blue — no white clouds inside it, no black gap.
// The planet's own rotation lives in the useFrame below (planetRef). Sphere collision lives in
// game/physics/newton.ts (updatePlanetCollision). Geometry constants live in
// game/core/world.ts (shared between the physics collision and this rendering).

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
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

// NO geometric displacement anymore: seen from space the landscape looks flat anyway,
// so the sphere stays perfectly smooth — relief comes only from the normal map
// (light/shadow) and the albedo (eternal snows). The collision sphere is exactly
// EARTH.radius (world.ts: EARTH_SURFACE_MAX).

export function Earth() {
  // Ref to the rotating surface group: the JSX below attaches the real THREE.Group
  // to planetRef.current at mount, so useFrame can mutate it without any re-render.
  const planetRef = useRef<THREE.Group>(null);

  // The WebGL renderer, to read the GPU's max anisotropy for the textures below.
  const gl = useThree((s) => s.gl);

  const { map, normalMap, clouds } = useTexture({
    map: "/textures/earth_daymap_8k.jpg", // 8192x4096 — detailed enough for a bigger planet later
    normalMap: "/textures/earth_normal.jpg", // 2K normal map: light/shadow relief only
    clouds: "/textures/earth_clouds_8k.jpg", // 8192x4096, white clouds on black → used as alphaMap
  });

  // The albedo is a color texture → sRGB. The normal map and the cloud map are DATA
  // (the cloud JPG feeds alphaMap, sampled as a linear green channel) → stay linear (default).
  // Equirectangular maps tile around the planet: ALL of them need wrapS = Repeat —
  // with the default ClampToEdge, the u=0/u=1 seam becomes a vertical smear band
  // (worst at low mip levels, i.e. seen from far). needsUpdate re-uploads the texture
  // with the new sampler params if it was already uploaded once.
  // anisotropy = GPU max: keeps the textures sharp at grazing angles (low orbit over a big planet).
  useEffect(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
    for (const tex of [map, normalMap, clouds]) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.anisotropy = maxAnisotropy;
      tex.needsUpdate = true;
    }
  }, [gl, map, normalMap, clouds]);

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
  // is 1 at the planet's limb and 0 at the shell's edge → the glow PEAKS exactly on the
  // planet's contour and fades PROGRESSIVELY outward (no black gap). The CLOUD layer gets
  // the same θ: its alpha fades 1 → 0 between θ_planet and θ_cloud (cloud deck silhouette)
  // → no white cloud inside the blue rim.
  const SHELL_SCALE = 1.10;
  const CLOUD_HEIGHT = 0.15; // units above the smooth surface (~a few 8K texture pixels), independent of the planet radius
  const CLOUD_SCALE = 1 + CLOUD_HEIGHT / RADIUS; // clouds hug the ground and never reach the blue rim
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

  // Per frame: feed the shaders the camera view matrix and the silhouette angles
  // (they depend on the camera↔planet distance D, which changes as the ship flies).
  useFrame(({ camera }) => {
    const D = camera.position.distanceTo(new THREE.Vector3(...POSITION));
    const R_shell = RADIUS * SHELL_SCALE;
    const R_cloud = RADIUS * CLOUD_SCALE;
    const thetaPlanet = Math.asin(Math.min(RADIUS / D, 1));
    const thetaShell = D > R_shell ? Math.asin(Math.min(R_shell / D, 1)) : Math.PI;
    const thetaCloud = D > R_cloud ? Math.asin(Math.min(R_cloud / D, 1)) : Math.PI;
    const u = atmosphereMat.uniforms;
    u.uViewMatrix.value.copy(camera.matrixWorld).invert();
    u.uThetaPlanet.value = thetaPlanet;
    u.uThetaShell.value = thetaShell;
    // same angles for the cloud limb fade (its uniforms exist after the first compile)
    const cu = cloudShaderUniforms.current;
    if (cu) {
      cu.uViewMatrix.value.copy(camera.matrixWorld).invert();
      cu.uThetaPlanet.value = thetaPlanet;
      cu.uThetaCloud.value = thetaCloud;
    }
  });

  // Cloud material: the standard material plus a LIMB FADE injected into its shader.
  // It uses the same view-ray angle θ as the atmosphere: cloud alpha goes from 1 on the
  // planet disk to 0 at the cloud deck's silhouette (θ_cloud) — the clouds melt into the
  // blue rim instead of showing white inside it.
  const cloudShaderUniforms = useRef<Record<string, THREE.IUniform> | null>(null);
  const cloudMat = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // white clouds; the 8K cloud JPG (white on black) feeds the ALPHA channel
      alphaMap: clouds,
      transparent: true,
      depthWrite: false,
      opacity: 0.9,
      roughness: 1,
    });
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uViewMatrix = { value: new THREE.Matrix4() };
      shader.uniforms.uPlanetPos = { value: new THREE.Vector3(...POSITION) };
      shader.uniforms.uThetaPlanet = { value: 0.5 };
      shader.uniforms.uThetaCloud = { value: 0.55 };
      cloudShaderUniforms.current = shader.uniforms;
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
          uniform mat4 uViewMatrix;
          uniform vec3 uPlanetPos;
          uniform float uThetaPlanet;
          uniform float uThetaCloud;
          varying vec3 vRayDir;
          varying vec3 vCenterView;`
        )
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
          vec4 cloudViewPos = modelViewMatrix * vec4(position, 1.0); // view space (camera at origin) — computed here, no chunk dependency
          vRayDir = cloudViewPos.xyz; // ray camera → vertex
          vCenterView = (uViewMatrix * vec4(uPlanetPos, 1.0)).xyz;`
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
          uniform float uThetaPlanet;
          uniform float uThetaCloud;
          varying vec3 vRayDir;
          varying vec3 vCenterView;`
        )
        .replace(
          "#include <map_fragment>",
          `#include <map_fragment>
          float thetaCloud = acos(clamp(dot(normalize(vRayDir), normalize(vCenterView)), -1.0, 1.0));
          // clouds fade out from the planet's limb to the cloud deck's silhouette: no white in the blue rim
          diffuseColor.a *= 1.0 - smoothstep(uThetaPlanet, uThetaCloud, thetaCloud);`
        );
    };
    return mat;
  }, [clouds]);

  return (
    <group position={POSITION}>
      {/* 1 — the surface: smooth textured sphere (normal map = light/shadow relief only),
            inside its rotating group (the planet's own spin) */}
      <group ref={planetRef}>
        <mesh>
          <sphereGeometry args={[RADIUS, 128, 128]} />
          <meshStandardMaterial
            map={map}
            normalMap={normalMap}
            normalScale={[0.85, 0.85]}
            roughness={0.85}
            metalness={0.0}
          />
        </mesh>
      </group>

      {/* 2 — cloud layer: CLOUD_SCALE above the surface (~1 texture pixel), drifting, fading out at the limb via cloudMat */}
      <mesh scale={CLOUD_SCALE}>
        <sphereGeometry args={[RADIUS, 64, 64]} />
        <primitive object={cloudMat} attach="material" />
      </mesh>

      {/* 3 — atmosphere: shell 10% larger, view-ray-angle shader → rim peaks at the planet's limb, fades progressively outward, symmetric at any distance */}
      <mesh scale={SHELL_SCALE}>
        <sphereGeometry args={[RADIUS, 64, 64]} />
        <primitive object={atmosphereMat} attach="material" />
      </mesh>
    </group>
  );
}
