"use client";
/* ============================================================================
 * TERRE 2065 — démo visuelle du 31 octobre, adaptée pour ton projet Next.js.
 * ----------------------------------------------------------------------------
 * INTÉGRATION (5 minutes) :
 *   1. Place ce fichier dans : components/Terre2065.tsx
 *   2. Crée app/terre2065/page.tsx avec ce contenu :
 *
 *        "use client";
 *        import dynamic from "next/dynamic";
 *        const Terre2065 = dynamic(() => import("@/components/Terre2065"), {
 *          ssr: false, // ← LE piège connu : WebGL ne se rend pas côté serveur
 *        });
 *        export default function Page() {
 *          return <Terre2065 />;
 *        }
 *
 *   3. Dépendances à installer :
 *        npm install three @react-three/fiber @react-three/drei
 *        npm install -D @types/three
 *   4. Lance : npm run dev  →  http://localhost:3000/terre2065
 *
 * PROCHAINE MISSION (mission 1) : remplacer OrbitControls par un vaisseau
 * pilotable — physique newtonienne, pas d'ennemis, pas de score.
 * ========================================================================== */

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";

/* ============================================================
   Bruit de valeur 3D sans dépendance — échantillonné directement
   sur la sphère pour éviter toute couture aux pôles et au méridien 0.
   ============================================================ */
function hash3(x: number, y: number, z: number) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}
function smooth(t: number) {
  return t * t * (3 - 2 * t);
}
function valueNoise(x: number, y: number, z: number) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = smooth(xf), v = smooth(yf), w = smooth(zf);
  const n = (i: number, j: number, k: number) => hash3(xi + i, yi + j, zi + k);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const x00 = lerp(n(0, 0, 0), n(1, 0, 0), u);
  const x10 = lerp(n(0, 1, 0), n(1, 1, 0), u);
  const x01 = lerp(n(0, 0, 1), n(1, 0, 1), u);
  const x11 = lerp(n(0, 1, 1), n(1, 1, 1), u);
  return lerp(lerp(x00, x10, v), lerp(x01, x11, v), w);
}
function fbm(x: number, y: number, z: number, octaves: number) {
  let sum = 0, amp = 0.55, freq = 1;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise(x * freq, y * freq, z * freq);
    amp *= 0.5;
    freq *= 2.15;
  }
  return sum;
}

/* ============================================================
   Génération des textures procédurales (canvas 2D → THREE.Texture).
   Une seule passe produit : carte du jour, carte des rugosités
   (océan luisant, terre mate) et carte des lumières de nuit.
   ============================================================ */
function buildEarthTextures() {
  const W = 1024, H = 512;
  const day = document.createElement("canvas");
  day.width = W; day.height = H;
  const rough = document.createElement("canvas");
  rough.width = W; rough.height = H;
  const night = document.createElement("canvas");
  night.width = W; night.height = H;
  const ctxD = day.getContext("2d");
  const ctxR = rough.getContext("2d");
  const ctxN = night.getContext("2d");
  const imgD = ctxD.createImageData(W, H);
  const imgR = ctxR.createImageData(W, H);
  const imgN = ctxN.createImageData(W, H);

  for (let y = 0; y < H; y++) {
    const lat = (0.5 - y / H) * Math.PI; // +90° en haut
    const cl = Math.cos(lat), sl = Math.sin(lat);
    for (let x = 0; x < W; x++) {
      const lon = (x / W) * Math.PI * 2;
      // Point 3D sur la sphère unité — le bruit est sans couture
      const px = cl * Math.cos(lon), py = sl, pz = cl * Math.sin(lon);

      const cont = fbm(px * 1.6 + 5, py * 1.6 + 3, pz * 1.6 + 7, 5);      // continents
      const detail = fbm(px * 6 + 20, py * 6 + 11, pz * 6 + 4, 4);       // relief/détail
      const clim = fbm(px * 3 + 40, py * 3 + 9, pz * 3 + 31, 4);         // climats
      const temp = Math.abs(sl) * 0.92 + detail * 0.18;                    // latitude + relief
      const ice = temp > 0.78;
      const isLand = cont > 0.5 && !ice;

      let r, g, b;
      let roughness;
      let light = 0;

      if (ice) {
        const shade = 225 + detail * 30;
        r = shade; g = shade + 6; b = shade + 14;
        roughness = 160;
      } else if (isLand) {
        // Terre : vert humide → ocre sec selon le climat, gris en altitude
        const dry = Math.min(1, Math.max(0, (clim - 0.35) * 2.2));
        let lr = 46 + dry * 118;
        let lg = 92 + dry * 40;
        let lb = 42 + dry * 22;
        if (detail > 0.62) { // montagnes
          const t = (detail - 0.62) * 2.4;
          lr = lr * (1 - t) + 128 * t;
          lg = lg * (1 - t) + 122 * t;
          lb = lb * (1 - t) + 112 * t;
        }
        r = lr; g = lg; b = lb;
        roughness = 235;
        // Lumières des villes : amas populationnels, jamais sur la glace
        if (cont < 0.545 && clim > 0.5 && hash3(x * 3, y * 7, 1) < 0.22) {
          light = 1;
        }
      } else {
        // Océan : profondeur → teinte, plus clair près des côtes
        const depth = Math.min(1, (0.5 - cont) * 4.5);
        r = 14 + (1 - depth) * 30;
        g = 52 + (1 - depth) * 55;
        b = 96 + (1 - depth) * 55;
        roughness = 55; // l'océan accroche la lumière du soleil
      }

      const iD = (y * W + x) * 4;
      imgD.data[iD] = r; imgD.data[iD + 1] = g; imgD.data[iD + 2] = b; imgD.data[iD + 3] = 255;
      imgR.data[iD] = roughness; imgR.data[iD + 1] = roughness; imgR.data[iD + 2] = roughness; imgR.data[iD + 3] = 255;
      imgN.data[iD] = light ? 255 : 0;
      imgN.data[iD + 1] = light ? 205 : 0;
      imgN.data[iD + 2] = light ? 140 : 0;
      imgN.data[iD + 3] = 255;
    }
  }
  ctxD.putImageData(imgD, 0, 0);
  ctxR.putImageData(imgR, 0, 0);
  ctxN.putImageData(imgN, 0, 0);

  const toTex = (c: HTMLCanvasElement) => {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  return { day: toTex(day), rough: toTex(rough), night: toTex(night) };
}

function buildCloudTexture() {
  const W = 1024, H = 512;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(W, H);
  for (let y = 0; y < H; y++) {
    const lat = (0.5 - y / H) * Math.PI;
    const cl = Math.cos(lat), sl = Math.sin(lat);
    for (let x = 0; x < W; x++) {
      const lon = (x / W) * Math.PI * 2;
      const px = cl * Math.cos(lon), py = sl, pz = cl * Math.sin(lon);
      const n = fbm(px * 2.4 + 70, py * 2.4 + 13, pz * 2.4 + 55, 5);
      // Bandes nuageuses légèrement plus denses aux latitudes moyennes
      const band = 1 - Math.abs(sl) * 0.35;
      let a = (n * band - 0.52) / 0.14;
      a = Math.max(0, Math.min(1, a));
      const i = (y * W + x) * 4;
      img.data[i] = 255; img.data[i + 1] = 255; img.data[i + 2] = 255;
      img.data[i + 3] = a * 235;
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function buildGlowTexture() {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 128;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,244,214,0.85)");
  g.addColorStop(0.6, "rgba(255,214,140,0.22)");
  g.addColorStop(1, "rgba(255,200,120,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/* ============================================================
   La Terre : sphère + nuages en couche + halo atmosphérique.
   ============================================================ */
const SUN_DIR = new THREE.Vector3(1, 0.25, 0.6).normalize();

function Atmosphere() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          uSunDir: { value: SUN_DIR.clone() },
        },
        vertexShader: `
          varying vec3 vNormalV;
          varying vec3 vNormalW;
          void main() {
            vNormalV = normalize(normalMatrix * normal);
            vNormalW = normalize(mat3(modelMatrix) * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uSunDir;
          varying vec3 vNormalV;
          varying vec3 vNormalW;
          void main() {
            // Halo : intense sur le limbe, nul au centre (rendu en BackSide)
            float rim = pow(max(0.0, 0.72 - dot(vNormalV, vec3(0.0, 0.0, 1.0))), 3.0);
            // Côté soleil : bleu lumineux — côté nuit : halo éteint
            float sun = dot(normalize(vNormalW), uSunDir);
            float lit = smoothstep(-0.55, 0.35, sun);
            // Teinte couchant (orange) près du terminateur
            float sunset = pow(1.0 - abs(sun), 10.0) * lit;
            vec3 col = mix(vec3(0.20, 0.45, 1.0), vec3(1.0, 0.45, 0.16), clamp(sunset, 0.0, 1.0));
            gl_FragColor = vec4(col, 1.0) * rim * (0.12 + lit * 1.15);
          }
        `,
      }),
    []
  );
  return (
    <mesh scale={1.23}>
      <sphereGeometry args={[1, 64, 64]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

function Earth() {
  const tex = useMemo(() => buildEarthTextures(), []);
  const clouds = useMemo(() => buildCloudTexture(), []);
  const group = useRef();
  const cloudRef = useRef();

  useFrame((state, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.02;
    if (cloudRef.current) cloudRef.current.rotation.y += delta * 0.026; // parallaxe des couches
  });

  return (
    <group ref={group} rotation={[0, -1.2, 0.41]}>
      <mesh>
        <sphereGeometry args={[1, 96, 96]} />
        <meshStandardMaterial
          map={tex.day}
          roughnessMap={tex.rough}
          roughness={1}
          metalness={0.05}
          emissiveMap={tex.night}
          emissive={"#ffd9a0"}
          emissiveIntensity={0.85}
        />
      </mesh>
      {/* Couche de nuages — tourne un peu plus vite que le sol */}
      <mesh ref={cloudRef} scale={1.015}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={clouds}
          transparent
          opacity={0.92}
          alphaMap={clouds}
          depthWrite={false}
          roughness={1}
        />
      </mesh>
      <Atmosphere />
    </group>
  );
}

function Sun() {
  const glow = useMemo(() => buildGlowTexture(), []);
  const pos = SUN_DIR.clone().multiplyScalar(48);
  return (
    <group position={pos}>
      <sprite scale={[16, 16, 1]}>
        <spriteMaterial map={glow} blending={THREE.AdditiveBlending} depthWrite={false} transparent />
      </sprite>
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.06} />
      <directionalLight position={SUN_DIR.clone().multiplyScalar(10)} intensity={3.2} color={"#fff6e8"} />
      <Earth />
      <Sun />
      <Stars radius={140} depth={60} count={9000} factor={4} saturation={0} fade speed={0.6} />
      <OrbitControls
        enablePan={false}
        minDistance={1.6}
        maxDistance={14}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.55}
      />
    </>
  );
}

export default function Terre2065() {
  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <Canvas camera={{ position: [0, 1.1, 3.6], fov: 42 }} dpr={[1, 2]} gl={{ antialias: true }}>
        <color attach="background" args={["#000004"]} />
        <Scene />
      </Canvas>

      {/* Habillage */}
      <div className="pointer-events-none absolute top-5 left-6 text-white">
        <div className="text-lg font-semibold tracking-widest uppercase text-white/90">Terre — 2065</div>
        <div className="text-xs mt-1 text-white/50">démo visuelle · continents, nuages et atmosphère procéduraux</div>
      </div>
      <div className="pointer-events-none absolute bottom-5 left-6 text-white/60 text-xs leading-5">
        glisser pour tourner autour · molette pour s'approcher
      </div>
      <div className="pointer-events-none absolute bottom-5 right-6 text-white/40 text-xs text-right leading-5">
        halo atmosphérique simplifié<br />le shader Rayleigh complet est le chantier du weekend
      </div>
    </div>
  );
}
