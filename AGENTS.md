# AGENTS.md — Space Wars 3D

Carte d'identité du projet, à lire par tout agent de codage **avant** d'écrire la moindre ligne.

## Le projet

Jeu vidéo de vaisseau spatial en 3D sur le web, développé par Thierry (débutant motivé, formation Next.js terminée le 4 nov. 2026). Actuellement en phase : démo visuelle "Terre 2065" opérationnelle ; prochaine étape = rendre le vaisseau pilotable (physique newtonienne). Pas d'ennemis, pas de tir, pas de score avant que le pilotage soit solide.

## ⚠️ CHARTE DE COLLABORATION — À RESPECTER À LA LETTRE

Thierry apprend en codant. Le 5 nov. 2026, une session sans cadre a produit un débordement complet (objets 3D partout, chantier incompréhensible) — cela ne se reproduira plus. Règles non négociables :

1. **N'écris QUE ce qui est demandé.** Zéro fonctionnalité bonus, zéro fichier non demandé, zéro "j'en ai profité pour…". Si une idée surgit, la *proposer en une phrase* — ne jamais l'implémenter seul.
2. **Une intervention = UN petit pas.** Pas plus de ~30 lignes modifiées par étape. La session avance étape par étape, jamais par blocs.
3. **Expliquer AVANT d'écrire** : en 2-3 phrases simples (pas de jargon), dire ce qu'on va faire et pourquoi. Puis coder. Puis résumer ce qui a changé, fichier par fichier.
4. **Si la demande est ambiguë, NE PAS deviner** : poser une question. Une question de trop vaut mieux qu'une heure de travail à côté.
5. **Tout le code en anglais** : noms de variables, fonctions, fichiers ET commentaires. Le français reste dans le chat et les fichiers .md uniquement.
6. **Pas de refactoring, pas de renommage, pas de réorganisation** de fichiers existants sans demande explicite.
7. **En cas de conflit avec un choix déjà acté (voir VISION.md) : s'arrêter et demander.**
8. **En fin de session** : ajouter 3 lignes à `JOURNAL.md` (ce qui a été fait / ce qui a cassé ou été appris / la prochaine étape), puis rappeler à Thierry de committer et pousser.

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

## Contexte supplémentaire

- **`VISION.md`** : LA bible du projet — vision, design diégétique, scénario, missions, feuille de route. **À consulter avant toute décision de conception.**
- `JOURNAL.md` : historique des sessions et incidents.
- `IDEES.md` : idées en vrac, à ne PAS implémenter sans demande.
- Machine de Thierry : Windows, dossier local
  `D:\USERS\Thierry\Donnees\Programmations\Javascript\Projets\2026-11_spaceWars3d\space-wars3d`
