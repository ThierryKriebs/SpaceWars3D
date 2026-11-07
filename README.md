# Space Wars 3D

Shooter spatial 3D à missions dans le navigateur — *« l'espace comme il est vraiment, avec le rythme que Star Wars nous a appris à aimer. »*

Next.js 16 (App Router, React 19, TypeScript) + three.js via @react-three/fiber et @react-three/drei. Physique newtonienne 6DOF, missions au rythme arcade, design sonore "Gravity" (le silence de l'espace).

## Démarrage

**⚠️ pnpm uniquement — jamais `npm` ni `yarn` :**

```bash
pnpm install
pnpm dev
```

- `localhost:3000/terre2065` — la démo visuelle de référence (Terre 2065)
- `localhost:3000/play` — le jeu en construction (mission 0 en cours)

## Documentation (racine du repo)

Tout agent de codage lit ces fichiers **avant** d'écrire la moindre ligne :

| Fichier | Rôle |
|---|---|
| `AGENTS.md` | La charte de collaboration (9 règles, stack, interdits) |
| `ARCHITECTURE.md` | La carte contraignante du code — où va chaque fichier et pourquoi |
| `VISION.md` | La bible — vision, design, scénario, feuille de route |
| `JOURNAL.md` | La mémoire des sessions — plan de la mission 0 |
| `IDEES.md` | Parking d'idées — rien à implémenter sans décision explicite |

## Notes techniques

- Tailwind CSS v4 **épinglé à `4.3.3` exact** (la 4.3.4+ casse le build — bug `magic-string`, nov. 2026).
- Tout composant three.js est chargé via `dynamic(() => import(...), { ssr: false })` : WebGL ne se rend jamais côté serveur.
- Les pages (`app/`) restent minuscules : elles branchent, elles ne calculent pas.
