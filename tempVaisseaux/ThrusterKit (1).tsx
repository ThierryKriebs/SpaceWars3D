/* ============================================================================
   ThrusterKit — LE KIT DE PROPULSION PARTAGÉ (ship/shared/)
   ============================================================================
   CONTRAT (pour l'agent VS Code) :

   1. PLACEMENT : `ship/shared/ThrusterKit.tsx`, tel quel. Ce fichier
      N'EST PAS un vaisseau : c'est le matériel de propulsion commun à
      toute la flotte. Aucun vaisseau ne le modifie, tout le monde
      l'importe. Un seul exemplaire pour tous les vaisseaux.

   2. CE QU'IL EXPORTE :
      - `ShipCommands`, `makeShipCommands` : le contrat de commandes
        (une seule enveloppe partagée pilotage ⇄ physique ⇄ gaz).
      - `RcsNozzle` : la FORME d'une entrée de table (pos, exhaust, fires).
      - `nozzleIntensity`, `computeIntensities` : le traducteur
        commandes → { id: intensité }.
      - `ThrusterHandle`, `ThrusterRegistry` : accès par nom à chaque
        tuyère (tutoriel, HUD, dégâts).
      - `<Thruster/>` : une tuyère complète — plaque affleurante percée,
        plume de gaz proportionnelle, inscription au registre.
      - `<ShipEnv/>` : le studio procédural (reflets de la peinture).

   3. LA RÈGLE D'OR : le jour où on remplace le cône de gaz par de
      VRAIES particules, ou qu'on ajoute une fuite de gaz sur tuyère
      endommagée, ON NE TOUCHE QU'À CE FICHIER. Tous les vaisseaux de
      la flotte sont upgradés le même instant. C'est la seule raison
      d'être de ce fichier.
   ============================================================================ */

import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ============================================================================
   LES COMMANDES — la seule chose partagée entre pilotage, physique et gaz
   ============================================================================ */

export interface AimCommands {
  p: number; // visée des tourelles : tangage, borné dans le composant
  y: number; // visée des tourelles : lacet
}

export interface ShipCommands {
  pitch: number; // −1..1 — tangage, +1 = nez qui monte
  yaw: number; // −1..1 — lacet, +1 = gauche
  roll: number; // −1..1 — roulis, +1 = bord droit qui se lève
  trans: number; // −1..1 — translation : −1 = freins, +1 = avance douce
  thrust: number; // 0..1 — moteur principal
  fire: boolean; // tir des canons
  bayOpen: boolean; // soutes à missiles
  aim: AimCommands; // micro-visée des tourelles
}

export function makeShipCommands(): ShipCommands {
  return { pitch: 0, yaw: 0, roll: 0, trans: 0, thrust: 0, fire: false, bayOpen: false, aim: { p: 0, y: 0 } };
}

/* ============================================================================
   LA FORME D'UNE TUYÈRE (chaque vaisseau remplit SA table avec ça)
   ============================================================================ */

export type Vec3 = [number, number, number];

export interface RcsNozzle {
  id: string; // nom du jeu (convention : système-côté-hauteur, ex. nose-L-T)
  pos: Vec3; // position sur la coque (le bras de levier)
  exhaust: Vec3; // direction d'ÉJECTION du gaz (la force sur le vaisseau = −exhaust)
  fires: { pitch?: 1 | -1; yaw?: 1 | -1; roll?: 1 | -1; trans?: 1 | -1 }; // quelle commande l'allume
}

/* ============================================================================
   LE TRADUCTEUR — commandes → intensités (une seule fonction pour tous)
   ============================================================================ */

export function nozzleIntensity(n: RcsNozzle, c: { pitch: number; yaw: number; roll: number; trans: number }) {
  let f = 0;
  for (const [m, sign] of Object.entries(n.fires) as [keyof RcsNozzle["fires"], 1 | -1][]) {
    const u = c[m];
    if (u !== 0 && Math.sign(u) === sign) f = Math.max(f, Math.abs(u));
  }
  return f;
}

// Traduit les commandes en { id: intensité } pour UNE table de tuyères.
// (La table est un paramètre : chaque vaisseau a la sienne.)
export function computeIntensities(nozzles: RcsNozzle[], c: ShipCommands): Record<string, number> {
  const out: Record<string, number> = {};
  for (const n of nozzles) {
    const f = nozzleIntensity(n, c);
    if (f > 0) out[n.id] = f;
  }
  return out;
}

/* ============================================================================
   LE REGISTRE — accès PAR NOM à chaque tuyère, depuis le jeu.
   Tutoriel diégétique (allumer une tuyère sous les yeux du joueur),
   HUD d'état, dégâts (détruire une tuyère → fuite + commande dégradée).
   ============================================================================ */

export interface ThrusterHandle {
  /** Force l'intensité (0..1), ou null pour rendre la main au pilotage. */
  set: (f: number | null) => void;
  pos: Vec3; // le bras de levier
  exhaust: Vec3; // la direction d'éjection
}
export type ThrusterRegistry = Map<string, ThrusterHandle>;

/* ============================================================================
   LA TUYÈRE — plaque affleurante percée + plume proportionnelle.
   Rien de spécifique à un vaisseau : une position, une direction,
   une intensité. Le gaz NAÎT AU PERÇAGE : la base du cône reste collée
   à la plaque quand il grandit — jamais dans la coque.
   (C'est ICI qu'on branchera les particules, un jour.)
   ============================================================================ */

export function Thruster({
  nozzle,
  ctlRef,
  registry,
}: {
  nozzle: RcsNozzle;
  ctlRef: React.MutableRefObject<ShipCommands>;
  registry: ThrusterRegistry;
}) {
  const plumeRef = useRef<THREE.Mesh>(null);
  const forced = useRef<number | null>(null);
  const quat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...nozzle.exhaust).normalize());
    return q;
  }, [nozzle]);

  useEffect(() => {
    registry.set(nozzle.id, { set: (f) => (forced.current = f), pos: nozzle.pos, exhaust: nozzle.exhaust });
    return () => {
      registry.delete(nozzle.id);
    };
  }, [nozzle, registry]);

  useFrame(() => {
    const f = forced.current !== null ? forced.current : nozzleIntensity(nozzle, ctlRef.current);
    const m = plumeRef.current;
    if (!m) return;
    m.visible = f > 0.02;
    m.scale.set(0.5 + f * 0.6, 0.16 + f * 1.4, 0.5 + f * 0.6);
    // LE GAZ NAÎT AU PERÇAGE : base collée à la plaque (local y 0.012),
    // c'est la pointe qui s'allonge — jamais dans la coque.
    m.position.y = 0.012 + (0.16 + f * 1.4) / 2;
    (m.material as THREE.MeshBasicMaterial).opacity = Math.min(0.9, f * 0.95);
  });

  return (
    <group position={nozzle.pos} quaternion={quat}>
      {/* plaque octogonale sombre AFFLEURANTE : un panneau, rien ne dépasse */}
      <mesh position={[0, 0.006, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.015, 8]} />
        <meshStandardMaterial color="#12181f" roughness={0.85} flatShading />
      </mesh>
      {/* le PERÇAGE : le trou noir d'où le gaz s'échappe */}
      <mesh position={[0, 0.014, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.004, 12]} />
        <meshBasicMaterial color="#05070a" />
      </mesh>
      {/* plume : longueur et opacité proportionnelles à la force */}
      <mesh ref={plumeRef} position={[0, 0.05, 0]} visible={false}>
        <coneGeometry args={[0.055, 1, 8]} />
        <meshBasicMaterial color="#8fd6ff" transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ============================================================================
   LE STUDIO — c'est LUI qui fait les reflets de la peinture blanche.
   Commune à la flotte (un seul éclairage honnête, façon MSFS 2020).
   ============================================================================ */

export function ShipEnv() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = new THREE.Scene();
    const panel = (rgb: [number, number, number], size: number, pos: Vec3, lookAt: Vec3) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size),
        new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(...rgb), side: THREE.DoubleSide })
      );
      m.position.set(...pos);
      m.lookAt(new THREE.Vector3(...lookAt));
      env.add(m);
    };
    panel([6, 6, 5.5], 22, [0, 10, 0], [0, 0, 0]); // plafond blanc chaud
    panel([2.2, 2.8, 3.6], 16, [-12, 2, 3], [0, 0, 0]); // latéral bleu froid
    panel([3.2, 1.9, 1.1], 14, [12, 1, -3], [0, 0, 0]); // latéral orange chaud
    panel([0.15, 0.2, 0.32], 20, [0, -9, 0], [0, 0, 0]); // sol très sombre
    const rt = pmrem.fromScene(env, 0.06);
    scene.environment = rt.texture;
    return () => {
      scene.environment = null;
      rt.texture.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}
