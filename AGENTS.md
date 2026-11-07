# AGENTS.md — Space Wars 3D

Carte d'identité du projet, à lire par tout agent de codage **avant** d'écrire la moindre ligne.

## Le projet

Jeu vidéo de vaisseau spatial en 3D sur le web, développé par Thierry (débutant motivé, formation Next.js terminée le 4 nov. 2026). Actuellement en phase : démo visuelle "Terre 2065" opérationnelle ; prochaine étape = rendre le vaisseau pilotable (physique newtonienne). Pas d'ennemis, pas de tir, pas de score avant que le pilotage soit solide.

## Stack (ne pas changer sans demande explicite)

- **Next.js 16** (App Router) + **React 19** + React Compiler activé + TypeScript
- **pnpm** — jamais `npm` ni `yarn` (`pnpm add`, `pnpm dev`)
- **Tailwind CSS v4** — ⚠️ **épinglé à `4.3.3` exact** (`tailwindcss` ET `@tailwindcss/turbopack`, sans `^`). La 4.3.4+ casse le build (bug `magic-string` ESM, nov. 2026). Ne jamais "mettre à jour" ces deux paquets sans vérifier.
- **three.js** via `@react-three/fiber` + `@react-three/drei`

## Structure

```
src/
├── app/            # une URL = un dossier ; page.tsx = vitrine
│   ├── layout.tsx, globals.css, page.tsx
│   └── terre2065/page.tsx
└── components/     # les briques réutilisables (Terre2065.tsx)
```

## Règles techniques critiques

1. **WebGL ne se rend jamais côté serveur** : tout composant three.js est chargé via
   `dynamic(() => import("@/components/X"), { ssr: false })` dans une page `"use client"`.
2. Les pages (`app/`) restent minuscules : elles branchent, elles ne calculent pas.
3. TypeScript strict : typer explicitement les paramètres de fonctions (`: number`, etc.).

## Règles de collaboration

- **Une session = une victoire** : chaque session de travail se termine par UNE chose qui fonctionne. Pas de grande réécriture en cascade.
- Pas de refactoring non demandé. Le plus petit pas qui marche.
- Expliquer les choix, Thierry apprend en même temps que le code s'écrit.
- Tout incident (bug, fix) est consigné dans `JOURNAL.md`.

## Contexte supplémentaire

- **`VISION.md`** : LA bible du projet — vision, design diégétique, scénario, missions, feuille de route. **À consulter avant toute décision de conception.**
- `JOURNAL.md` : historique des sessions et incidents.
- `IDEES.md` : idées en vrac, à ne PAS implémenter sans demande.
- Machine de Thierry : Windows, dossier local
  `D:\USERS\Thierry\Donnees\Programmations\Javascript\Projets\2026-11_spaceWars3d\space-wars3d`
