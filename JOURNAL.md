# JOURNAL — Space Wars 3D

Règle : toute session de travail (surtout avec un agent de codage) se termine par 3 lignes ici : ce qui a été fait, ce qui a cassé/été appris, la prochaine étape. Ce fichier est la mémoire du projet entre les machines et les agents.

---

## 2026-11-04 — Session 1 : le projet s'installe 🏆

**Fait** : écosystème complet installé et opérationnel — pnpm, Next.js 16 (App Router, React 19, React Compiler), Tailwind v4, three.js/fiber/drei. La démo Terre2065 s'affiche sur `localhost:3000/terre2065`. Repo GitHub privé `space-wars3d`.

**Appris / incidents** :
- Bug upstream Tailwind : la 4.3.4 (publiée le 2 nov. 2026) casse le build (`magic-string` 1.x ESM requis par du CJS). **Fix : épingler `tailwindcss` et `@tailwindcss/turbopack` à exactement `4.3.3` (sans `^`).**
- Réflexes de débogage : lire le message d'erreur jusqu'au bout (versions comprises) ; chercher les bugs récents sur le web ; diagnostiquer par bissection (page de test isolée).
- Piège récurrent : coller le contenu d'un canvas (frontmatter, `export App`) au lieu du vrai fichier `.tsx` → "The default export is not a React Component".

**Prochaine étape (mission 1)** : remplacer OrbitControls par un vaisseau pilotable — physique newtonienne. Pas d'ennemis, pas de tir, pas de score.

**Règle du projet** : une session = une victoire.
