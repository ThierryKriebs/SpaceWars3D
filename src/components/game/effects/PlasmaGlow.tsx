"use client";

// PlasmaGlow.tsx — reentry plasma around ONE ship (effects/).
// Two layers, both driven by ship.planetProximity (0 far, 1 at surface contact —
// written every tick by newton.ts):
//   1. SOFT OUTLINE HALO: for every hull mesh, a twin mesh scaled x1.6 is added next
//      to it, BackSide + additive, LOW fresnel power + strong animated noise → a wide,
//      diffuse, irregular plasma band that surrounds the hull with NO hard edge.
//      White-hot against the hull, deep red far out.
//   2. HOT SKIN: one twin per hull mesh at scale 1.03, glued to the hull — white-hot where
//      the hull is REALLY close to the ground (per-fragment distance to the planet center).
//      The ship's own materials are never patched (an onBeforeCompile patch made the whole
//      ship fail to render). Mounted inside the ship's mirror group (Entities.tsx). Pure visual.

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ShipSheet } from "@/types";
import { EARTH, EARTH_SURFACE_MAX, SHIP_COLLISION_RADIUS } from "@/game/core/world";

type PlasmaUniforms = {
  uPlasmaIntensity: { value: number };
  uPlasmaTime: { value: number };
  uPlanetDirWorld: { value: THREE.Vector3 }; // ship -> planet center, world space
  uPlanetCenterWorld: { value: THREE.Vector3 }; // planet center, world space
  uShipPosWorld: { value: THREE.Vector3 }; // ship center, world space
};

// Temp vector reused every frame (no per-frame allocation).
const planetDirWorld = new THREE.Vector3();

// Halo layers: one twin per hull mesh PER LAYER — the small scale hugs the hull, the larger
// scales fade out progressively -> a diffuse band with no hard edge (a single-scale twin
// shows its polygonal silhouette as a hard rim).
// 16 thin, tightly packed layers with a gentle alpha slope -> continuous falloff
// (8/12 discrete layers showed visible rings near the bow).
const HALO_LAYERS = Array.from({ length: 16 }, (_, i) => ({
  scale: 1.5 + i * 0.11, // 1.50 .. 3.16
  alpha: 0.28 - i * 0.016, // 0.28 .. 0.045
}));

// Hot skin: one extra twin per hull mesh at scale 1.03, glued to the hull — white-hot at REAL
// contact (per-fragment distance to the planet center). Replaces the old onBeforeCompile
// material patch, which made the whole ship fail to render ("invisible ship" bug).
const SKIN = { scale: 1.03 } as const;

// Hull contact zone: hull fragments closer than CONTACT_DISTANCE to the planet center
// glow white-hot; the white fades to pink over CONTACT_FADE_BAND units above that.
const CONTACT_DISTANCE = EARTH_SURFACE_MAX + SHIP_COLLISION_RADIUS; // 91.5 — same sphere as the collision
const CONTACT_FADE_BAND = 0.5; // world units above contact where the white fades to pink

export function PlasmaGlow({ ship }: { ship: ShipSheet }) {
  const anchorRef = useRef<THREE.Group>(null); // empty group: its PARENT is the ship group
  const uniformsListRef = useRef<PlasmaUniforms[]>([]); // halo layers + the hot skin
  const smoothedIntensity = useRef(0); // lags behind ship.planetProximity, no snapping

  // Once: add the halo + skin twins next to every hull mesh of the parent ship group.
  // The ship's own materials are never modified.
  useEffect(() => {
    const shipGroup = anchorRef.current?.parent;
    if (!shipGroup) return;
    const list: PlasmaUniforms[] = [];
    const haloMeshes: THREE.Mesh[] = [];

    // One shared halo material for this ship (all halo twins use it).
    const haloUniforms: PlasmaUniforms = {
      uPlasmaIntensity: { value: 0 },
      uPlasmaTime: { value: 0 },
      uPlanetDirWorld: { value: new THREE.Vector3(0, 0, -1) },
      uPlanetCenterWorld: { value: new THREE.Vector3(EARTH.position.x, EARTH.position.y, EARTH.position.z) },
      uShipPosWorld: { value: new THREE.Vector3() },
    };
    // One halo material PER LAYER (shared by every twin of that layer). The dynamic uniforms
    // (intensity/time/planet dir) are the SAME objects in every layer material, so the useFrame
    // below drives all layers at once; uLayerAlpha is constant per layer.
    // Shared vertex shader for halo + skin twins.
    const HALO_VERTEX = /* glsl */ `
        varying vec3 vNormalView;
        varying vec3 vViewPos;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPos;
        void main() {
          vNormalView = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPos = mvPosition.xyz; // view space: the camera is at the origin
          // NOTE: in a raw ShaderMaterial, three's chunk variables (objectNormal...) do
          // NOT exist — use the built-in normal attribute directly.
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `;
    const makeHaloMaterial = (layerAlpha: number) =>
      new THREE.ShaderMaterial({
        uniforms: {
          uPlasmaIntensity: haloUniforms.uPlasmaIntensity,
          uPlasmaTime: haloUniforms.uPlasmaTime,
          uPlanetDirWorld: haloUniforms.uPlanetDirWorld,
          uPlanetCenterWorld: haloUniforms.uPlanetCenterWorld,
          uShipPosWorld: haloUniforms.uShipPosWorld,
          uLayerAlpha: { value: layerAlpha },
        },
        vertexShader: HALO_VERTEX,
        fragmentShader: /* glsl */ `
        uniform float uPlasmaIntensity;
        uniform float uPlasmaTime;
        uniform vec3 uPlanetDirWorld;
        uniform vec3 uPlanetCenterWorld;
        uniform vec3 uShipPosWorld;
        uniform float uLayerAlpha;
        varying vec3 vNormalView;
        varying vec3 vViewPos;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPos;
        void main() {
          // Asymmetric ring: f = 1 at the twin's silhouette, 0 facing the camera. rim is
          // strong near the hull (small f) and exactly 0 AT the silhouette (f=1) -> soft
          // outer edge, no contour. (a plain fresnel peaks AT the silhouette = sharp outline)
          // clamp f: |dot| can exceed 1 by float rounding -> f slightly negative ->
          // pow(negative, 0.5) = NaN = black pixels ("ship disappeared" bug).
          float f = clamp(1.0 - abs(dot(normalize(vNormalView), normalize(-vViewPos))), 0.0, 1.0);
          float rim = 4.0 * pow(f, 0.5) * (1.0 - f) * (1.0 - f);
          // Planet side from pure DISTANCES to the planet center (robust: no direction to
          // flip, whatever the ship orientation): a fragment closer to the center than the
          // ship sits on the planet side.
          float distFragmentToCenter = length(vWorldPos - uPlanetCenterWorld);
          float distShipToCenter = length(uShipPosWorld - uPlanetCenterWorld);
          float toPlanetSide = clamp(0.5 + (distShipToCenter - distFragmentToCenter) * 0.5, 0.0, 1.0);
          // spread over the whole planet-facing hemisphere (pow 0.8, not 2.0 = tiny cone)
          float planetSide = pow(toPlanetSide, 0.8);
          // Low-frequency variation, stronger: straight facet edges wobble and break up.
          float noise = 0.70 + 0.30 * sin(vWorldPos.x * 2.0 + uPlasmaTime * 1.3) * sin(vWorldPos.z * 1.7 - uPlasmaTime);
          float flicker = 0.92 + 0.08 * sin(uPlasmaTime * 17.0) * sin(uPlasmaTime * 9.0 + 1.7);
          // White only near the hull AND on the planet side AND at real contact
          // (uPlasmaIntensity ~ 1 only at surface contact) — capped at 80%, pink dominates.
          float whiteHeat = pow(rim, 0.5) * planetSide * pow(uPlasmaIntensity, 3.0);
          vec3 color = mix(vec3(0.8, 0.06, 0.02), vec3(1.0, 0.98, 0.9), whiteHeat * 0.8);
          // Layered alpha: faint veil all around (0.08) + strong on the planet side (0.92) —
          // planet-side only was invisible from the far side; 0.18 veiled the top pinkish.
          // 16 thin layers x soft ring, gain 1.0 (-17% overall).
          float alpha = rim * uLayerAlpha * noise * (0.08 + 0.92 * planetSide) * uPlasmaIntensity * flicker * 1.0;
          gl_FragColor = vec4(color, alpha); // AdditiveBlending: rgb × alpha added to the scene
        }
      `,
        // transparent: TRUE — the halo must be in the TRANSPARENT list for AdditiveBlending
        // to apply (in the opaque list it rendered as a dark disk). The ship's opaque depth
        // already hides the halo behind it (depthTest), and on the camera side planetSide ~ 0
        // keeps the front halo negligible.
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false, // never blocks anything behind it
        depthTest: true,
        side: THREE.DoubleSide, // both sides: the planet side is lit from either camera side
      });
    const haloMaterials = HALO_LAYERS.map((layer) => makeHaloMaterial(layer.alpha));

    // Hot skin material: white-hot where the hull is REALLY close to the ground. Shares the
    // halo's dynamic uniforms (driven once per frame below).
    const skinUniforms: PlasmaUniforms = {
      uPlasmaIntensity: haloUniforms.uPlasmaIntensity,
      uPlasmaTime: haloUniforms.uPlasmaTime,
      uPlanetDirWorld: haloUniforms.uPlanetDirWorld,
      uPlanetCenterWorld: haloUniforms.uPlanetCenterWorld,
      uShipPosWorld: haloUniforms.uShipPosWorld,
    };
    const skinMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uPlasmaIntensity: skinUniforms.uPlasmaIntensity,
        uPlasmaTime: skinUniforms.uPlasmaTime,
        uPlanetDirWorld: skinUniforms.uPlanetDirWorld,
        uPlanetCenterWorld: skinUniforms.uPlanetCenterWorld,
        uShipPosWorld: skinUniforms.uShipPosWorld,
      },
      vertexShader: HALO_VERTEX,
      fragmentShader: /* glsl */ `
        uniform float uPlasmaIntensity;
        uniform float uPlasmaTime;
        uniform vec3 uPlanetDirWorld;
        uniform vec3 uPlanetCenterWorld;
        uniform vec3 uShipPosWorld;
        varying vec3 vWorldPos;
        void main() {
          // REAL contact zone: per-fragment distance from this skin point to the planet center.
          float distToPlanetCenter = length(vWorldPos - uPlanetCenterWorld);
          float contactZone = clamp(1.0 - smoothstep(${CONTACT_DISTANCE}, ${CONTACT_DISTANCE + CONTACT_FADE_BAND}, distToPlanetCenter), 0.0, 1.0);
          // PLANET SIDE ONLY, from pure DISTANCES to the planet center (no direction to flip):
          // the top of the ship must NOT glow.
          float distFragmentToCenter = length(vWorldPos - uPlanetCenterWorld);
          float distShipToCenter = length(uShipPosWorld - uPlanetCenterWorld);
          float toPlanetSide = clamp(0.5 + (distShipToCenter - distFragmentToCenter) * 0.5, 0.0, 1.0);
          float noise = 0.85 + 0.15 * sin(vWorldPos.x * 3.0 + uPlasmaTime * 2.3) * sin(vWorldPos.z * 2.5 - uPlasmaTime * 1.9);
          float flicker = 0.92 + 0.08 * sin(uPlasmaTime * 17.0) * sin(uPlasmaTime * 9.0 + 1.7);
          // White-hot at contact, pink-red as it fades. pow 2.5 + alpha 0.55: less saturating
          // than pow 2 / alpha 1.0 (which made the whole ship all-white at contact).
          vec3 color = mix(vec3(0.9, 0.10, 0.03), vec3(1.0, 0.97, 0.9), pow(contactZone, 2.5) * 0.8);
          float alpha = pow(contactZone, 2.5) * 0.45 * pow(toPlanetSide, 0.8) * noise * flicker * uPlasmaIntensity;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
      side: THREE.FrontSide, // the skin is only seen from outside
    });
    list.push(haloUniforms, skinUniforms);

    shipGroup.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const stdMat = mesh.material as THREE.MeshStandardMaterial;
      if (!stdMat?.isMeshStandardMaterial) return; // plumes (MeshBasicMaterial) are skipped
      // One halo twin per layer + one skin twin — same geometry, scaled around the mesh's
      // own center. The hull materials are NEVER modified (the old onBeforeCompile patch
      // made the whole ship fail to render).
      for (const [layerIndex, layer] of HALO_LAYERS.entries()) {
        const halo = new THREE.Mesh(mesh.geometry, haloMaterials[layerIndex]);
        halo.position.copy(mesh.position);
        halo.quaternion.copy(mesh.quaternion);
        halo.scale.copy(mesh.scale).multiplyScalar(layer.scale);
        mesh.parent?.add(halo);
        haloMeshes.push(halo);
      }
      const skin = new THREE.Mesh(mesh.geometry, skinMaterial);
      skin.position.copy(mesh.position);
      skin.quaternion.copy(mesh.quaternion);
      skin.scale.copy(mesh.scale).multiplyScalar(SKIN.scale);
      mesh.parent?.add(skin);
      haloMeshes.push(skin);
    });
    uniformsListRef.current = list;
    console.log("[PlasmaGlow] patched materials:", list.length, "halo twins:", haloMeshes.length); // TEMP debug — remove after check
    return () => {
      // Remove the twins and dispose the materials on unmount.
      for (const halo of haloMeshes) halo.parent?.remove(halo);
      for (const m of haloMaterials) m.dispose();
      skinMaterial.dispose();
      uniformsListRef.current = [];
    };
  }, []);

  useFrame((frameState, dt) => {
    // Exponential approach toward the sheet value: the glow swells/fades smoothly.
    const k = 1 - Math.exp(-dt * 6);
    smoothedIntensity.current += (ship.planetProximity - smoothedIntensity.current) * k;
    // Direction ship -> planet center, in WORLD space: the planet-facing side burns.
    planetDirWorld.set(
      EARTH.position.x - ship.position.x,
      EARTH.position.y - ship.position.y,
      EARTH.position.z - ship.position.z
    ).normalize();
    for (const u of uniformsListRef.current) {
      // Soft cap at real contact: full intensity blows out to a white blob at the surface
      // (-20% at the peak, no change far from the planet).
      u.uPlasmaIntensity.value = Math.min(smoothedIntensity.current, 0.8);
      u.uPlasmaTime.value = frameState.clock.elapsedTime;
      u.uPlanetDirWorld.value.copy(planetDirWorld);
      u.uPlanetCenterWorld.value.set(EARTH.position.x, EARTH.position.y, EARTH.position.z);
      u.uShipPosWorld.value.set(ship.position.x, ship.position.y, ship.position.z);
    }
  });

  // Anchor only — the plasma lives in the halo + skin twins, no extra mesh here.
  return <group ref={anchorRef} />;
}
