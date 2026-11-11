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

**Règle du projet** : une session = une victoire.\n

## 2026-11-07 — Session 2 : l'architecture s'écrit AVANT le code 🗺️

**Fait** : réparation git (identité + signatures des commits), repo passé public et renommé `SpaceWars3D`, charte en 9 règles (`AGENTS.md`, dont la règle de cohérence : relire l'existant impacté après tout ajout), bible `VISION.md`, et surtout **`ARCHITECTURE.md`** — la carte contraignante définie par étapes : les 5 principes, modèles ≠ entités, niveaux = JSON, règle des curseurs, règle des métiers, le chef `index.tsx`, les soleils à presets, le fond spatial à couches. Décision finale : **mission 0 = renaissance de zéro** (pas de migration de la démo) — la démo (2 fichiers) reste telle quelle comme référence, sans renommage ni option de menu, jusqu'au rattrapage de `/play`.

**Appris / incidents** :
- La boucle de jeu universelle (init / update(dt) / draw) : en web, le navigateur la fournit (`requestAnimationFrame`, et r3f via `useFrame`) — jamais de `while(true)` en JavaScript.
- Un composant = une recette à curseurs, pas un objet figé : les 3 soleils = 1 modèle × 3 presets, dans les données.
- `index.tsx` : convention du chef de répertoire, uniforme pour tout le projet ; les couches ne s'importent que via lui.
- On n'investit pas dans ce qui est voué à disparaître (pas de renommage de la démo) ; le statut d'un fichier vit dans les documents, pas dans son nom.
- Correction des anciens fichiers (Sign in with ... / signatures des 4 commits du repo).

**Prochaine étape — MISSION 0 : la naissance (repartir de zéro, élément par élément)** — plan détaillé, acté le 7 nov. 2026 :

- **Décision** : on ne migre PAS la démo (générée automatiquement, ~450 lignes non comprises — le contraire de la charte "Thierry apprend en codant"). La démo reste telle quelle (2 fichiers) comme étalon visuel, sans renommage ni maintenance, jusqu'au rattrapage de `/play` — suppression ensuite, par décision explicite.
- **Pas 1 — La scène noire** : `src/app/play/page.tsx` + `src/components/game/Scene.tsx` — un `<Canvas>` noir avec `OrbitControls`, branché en `ssr: false`. Vérifier : un écran noir qu'on peut orbiter. Apprentissage : le piège WebGL/SSR, vécu.
- **Pas 2 — La boucle** : `src/game/core/loop.ts` (pas fixe, `dt`) + `state.ts` minimal ; `Scene` l'appelle depuis `useFrame`. Vérifier : un compteur de frames qui tourne.
- **Pas 3 — L'espace** : `environment/Space/index.tsx` + `Space/Stars.tsx` (enrober le `<Stars>` de drei, tel quel). Vérifier : les étoiles, immobiles autour de la caméra.
- **Pas 4 — Le soleil v0** : `environment/Sun.tsx` — `directionalLight` + sprite de halo basique. Vérifier : la lumière existe (visible au pas 5).
- **Pas 5 — La Terre v0** : `environment/Earth.tsx` — une sphère bleue simple. Vérifier : jour/nuit visibles.
- **Pas 6 — MISSION 1** : le vaisseau pilotable (voir VISION.md). La Terre s'enrichira plus tard, à la demande — jamais en copiant la démo en bloc : on en portera les fonctions complexes (fbm, shader d'atmosphère) une par une, en les comprenant.
- **Règles** : chaque pas compris avant d'être codé (découper si obscur, consulter la démo comme référence) ; pas de fonctionnalité non demandée ; ~30 lignes max et une vérification entre chaque pas. Une seule loi régit le chantier.

**Règle du projet** : une session = une victoire.

---

## 2026-11-07 — Session 3 : reprise sur base propre, docs resynchronisés

**Fait** : Thierry est reparti de l'ancien commit (arbre clean, HEAD = `50ec719` « FEAT: Update agents.md ») ; relecture croisée des 5 documents racine et correction par Thierry des 3 incohérences signalées (VISION.md:132 → code 100 % anglais, VISION.md:184 → synchro 7 nov., README.md → réécrit, pnpm uniquement) : AGENTS.md / ARCHITECTURE.md / VISION.md / JOURNAL.md / README.md sont de nouveau cohérents entre eux. Aucun fichier de code créé ni modifié cette session.

**Appris / incidents** : rien de cassé. Noté au passage : `src/app/terre2065/page.tsx` contient un bloc commenté mort en fin de fichier (test « Test page ») — laissé tel quel, la démo reste intouchable jusqu'au rattrapage de `/play`.

**Prochaine étape** : MISSION 0, pas 1 « la scène noire » — créer `src/app/play/page.tsx` (coquille `"use client"` + `dynamic(..., { ssr: false })`) et `src/components/game/Scene.tsx` (`<Canvas>` noir + `OrbitControls`) ; vérification : `pnpm dev` puis `localhost:3000/play` = écran noir que l'on peut orbiter.
---

## 2026-11-08 — Session 7 : boucle de jeu calée à 60 Hz (inline), leçons de collaboration

**Fait** : `src/components/game/Scene.tsx` — boucle de jeu à pas fixe en inline : `STEP = 1/60`, `accumulator` (useRef) alimenté par le `delta` de `useFrame`, un tick par 1/60 s accumulé, log `[GameLoop] tick #N (60 Hz fixed)` tous les 60 ticks. Commentaires pédagogiques (useRef/`.current`, `delta`, `_`) rédigés puis édités par Thierry. Vérifié : `tsc --noEmit` sans erreur hors démo, `GET /play` → 200, chunk servi par le serveur dev contient le nouveau code. Q/R enregistrées : useRef vs `let` vs useState ; `delta` = secondes réelles depuis la frame précédente ; `_` = state r3f ignoré ; `.current` = contenu de la boîte. ARCHITECTURE.md relu : l'accumulateur inline est le prototype de `game/core/loop.ts` + `state.ts` (pas 2).

**Appris / incidents** : incident de collaboration — l'agent a écrit du code deux fois sans demande explicite (« on reprend », « comment faire ? ») → revert demandé et fait (`git restore .`, arbre clean). Règle renforcée : l'agent n'écrit un fichier que sur « applique » explicite ; sinon il donne le code dans le chat. Côté technique rien de cassé ; serveur dev existant (port 3000) suffit, hot reload. Cosmétique : deux lignes de commentaires de Scene.tsx fusionnées lors de l'édition manuelle.

**Prochaine étape** : demain — MISSION 0, pas 2 « la boucle » proprement dite : déplacer l'accumulateur de `Scene.tsx` vers `src/game/core/loop.ts` (`Loop`, `STEP`, `tick(delta)`) + `src/game/core/state.ts` (compteur), `Scene.tsx` réduit au branchement `useFrame(() => loop.tick())` selon ARCHITECTURE.md ; puis pas 1 restant (fond noir + OrbitControls) ou pas 3 (`environment/Space/` + `Stars.tsx`), à la demande.

**Règle du projet** : une session = une victoire.

---

## 2026-11-09 — Session 8 : la boucle sort du composant (MISSION 0, pas 2)

**Fait** : `src/game/core/loop.ts` (`STEP`, `Loop.tick(delta)`, accumulateur à pas fixe 1/60) et `src/game/core/state.ts` (`state.tickCount`) créés ; `src/components/game/Scene.tsx` réduit au branchement `useFrame((_, delta) => Loop.tick(delta))`. Vérifié : `tsc --noEmit` sans erreur dans le nouveau code (seules restent les erreurs préexistantes de `layout.tsx` et de la démo Terre2065) ; `GET /play` → 200 ; le chunk dev servi contient bien le nouveau code (`GameLoop`, `60 Hz fixed`, `tickCount`). `game/` reste du TypeScript pur — zéro React, zéro three.js.

**Appris / incidents** : le serveur dev lancé en arrière-plan a servi `/play` puis crashé (EPERM rmdir sur `.next/dev/build/chunks` — quirk de l'environnement Windows, pas une erreur de code) ; un processus enfant orphelin occupe le port 3000 et sert la page correctement. Sur la machine de Thierry, le `pnpm dev` habituel suffit.

**Prochaine étape** : MISSION 0, pas 1 restant — fond noir + `OrbitControls` dans `Scene.tsx` (vérification : écran noir que l'on peut orbiter sur `localhost:3000/play`) ; puis pas 3 (`environment/Space/` + `Stars.tsx`), à la demande.

**Règle du projet** : une session = une victoire.

---

## 2026-11-09 — Session 8 (suite) : fond noir plein écran + pas 3, les étoiles (Space/)

**Fait** : `Scene.tsx` — `<Canvas style={{ width: "100vw", height: "100vh" }}>` (le conteneur r3f est en 100%×100% d'un parent sans hauteur définie : `min-h-full` ne suffit pas, le `height: 100%` retombait à `auto` → canvas réduit à une petite bande) + `<color attach="background" args={["#000000"]} />` en placeholder. `environment/Space/index.tsx` (le chef) + `environment/Space/Stars.tsx` (`<Stars>` de drei tel quel, importé sous l'alias `DreiStars`) créés et branchés dans `Scene`. Vérifié : `tsc --noEmit` sans erreur hors démo/layout ; `GET /play` → 200 ; les chunks servis contiennent le code Space/Stars (`StarfieldMaterial`). `globals.css` : lignes de debug retirées par Thierry, retour à l'état d'origine. Q/R : r3f enregistre tout `THREE` comme balises JSX (`extend(THREE)`), `args` = arguments du constructeur, `attach` = branche l'objet sur une propriété du parent ; le `style` de `<Canvas>` écrase le `100%×100%` par défaut du conteneur.

**Appris / incidents** : rien de cassé. Le `body` fait bien toute la hauteur *visuellement* (`min-h-full`) mais sa hauteur calculée reste `auto` — d'où le canvas effondré. Le serveur dev orphelin occupe toujours le port 3000 dans cet environnement (il sert correctement la page).

**Prochaine étape** : finir le pas 1 — `<OrbitControls />` (drei, 2 lignes) dans `Scene.tsx` ; vérification visuelle : orbiter le champ d'étoiles sur `localhost:3000/play`. Puis pas 4 (`environment/Sun.tsx`).

**Règle du projet** : une session = une victoire.

---

## 2026-11-09 — Session 8 (suite 2) : le fond noir déménage dans Space/Void.tsx

**Fait** : `environment/Space/Void.tsx` créé (couche 1 : `<color attach="background">` noir) ; `Space/index.tsx` assemble `<Void />` + `<Stars />` ; `Scene.tsx` ne contient plus aucun décor en dur, seulement `<Space />` + `<GameLoop />`. Vérifié : `tsc --noEmit` sans erreur hors démo/layout ; `GET /play` → 200 ; le chunk servi contient `Space/Void` + `Space/Stars`.

**Appris / incidents** : rien de cassé. Le placeholder `<color>` de `Scene` a tenu son rôle : poser le minimum vérifiable, puis le déplacer à sa place (Void) dès que la couche existait.

**Prochaine étape** : `<OrbitControls />` (drei, 2 lignes) dans `Scene.tsx` — vérification visuelle : orbiter le champ d'étoiles. Puis pas 4 (`environment/Sun.tsx`).

**Règle du projet** : une session = une victoire.

---

## 2026-11-09 — Session 8 (suite 3) : étoiles rondes et statiques (fade, speed=0)

**Fait** : correction des deux artefacts visuels de `<Stars>` de drei, appliquée par Thierry dans `Space/Stars.tsx` : `<DreiStars fade speed={0} />`. Vérifié : `tsc --noEmit` sans erreur hors démo/layout ; `GET /play` → 200.

**Appris / incidents** : le shader de drei rend des points **carrés** par défaut (le dégradé radial ne s'applique que si `fade == 1.0`) et fait **pulser la taille de toutes les étoiles en synchronisation** (`gl_PointSize = size * (3 + sin(time + 100))`, période ≈ 6,3 s à `speed = 1` ; en `AdditiveBlending`, quand les points rétrécissent l'image s'assombrit). `fade` + `speed={0}` = étoiles rondes et immobiles — conforme au but « simuler la physique, pas l'inventer » et à la vérification du pas 3. Leçon : les réglages par défaut de drei sont orientés démo — lire les props du composant qu'on enrobe avant de s'en servir.

**Prochaine étape** : `<OrbitControls />` (drei, 2 lignes) dans `Scene.tsx` — vérification visuelle : orbiter le champ d'étoiles sur `localhost:3000/play`. Puis pas 4 (`environment/Sun.tsx` : `directionalLight` + halo).

**Règle du projet** : une session = une victoire.

---

## 2026-11-11 — Session 9 : MISSION 0 terminée, MISSION 1 lancée (fiche + newton), incident node_modules

**Fait** : MISSION 0 terminée (pas 1-5 : scène noire + OrbitControls, étoiles rondes immobiles, soleil v0, Terre sphère bleue, jour/nuit visibles). ARCHITECTURE.md relu — changements du 9 nov. non commités pris en compte : `types/` en barrel + fichiers par genre, `ShipSheet`, `InputIntent` en valeurs 0-1, `capabilities/` (ex-ai), `levels/roles/`, `missions/`, pas de Zod en v1. MISSION 1 sous-pas 1 commité par Thierry : `types/{index,sheets,intents}.ts`, `state.ships` + `state.input`, `PlayerShip.spawnPlayer()`, spawn au premier tick (`Loop.started`). Sous-pas 2 appliqué (non commité) : `physics/newton.ts` (`updateShips`, seul écrivain de `position`), règle des intentions corrigée — chaque vaisseau lit `ship.intent` dans SA fiche, `updatePlayer()` recopie `state.input` → intent du joueur (sinon tous les vaisseaux accéléreraient ensemble, bug signalé par Thierry), `loop.ts` appelle `updatePlayer()` puis `updateShips(STEP)`, log de position toutes les 60 ticks. `tsc --noEmit` propre hors démo/layout.

**Appris / incidents** : incident node_modules — lien `node_modules/@next/swc-win32-x64-msvc` manquant (SWC non chargé → `next.config.ts` illisible, `SyntaxError: Unexpected token 'export'`), puis package `next` extrait incomplet (`dist/bin/next` vide) après un `pnpm install --force` interrompu par timeout. Cause suspectée : un fichier supprimé sans faire exprès dans node_modules (git status ne montre aucune suppression de fichier suivi). Fix en cours : lien SWC recréé à la main, `pnpm install --force` relancé en arrière-plan. Leçons : ne jamais interrompre une installation pnpm ; si node_modules est corrompu, la réparation sûre = supprimer tout le dossier et réinstaller proprement.

**Prochaine étape** : finir la réparation de node_modules, vérifier `pnpm run dev` + `GET /play` → 200 + console navigateur (`[PlayerShip] spawned at origin`, `ship at (0.00, 0.00, -5.x)` qui avance = inertie), commiter le sous-pas 2, puis sous-pas 3 : `game/controls/keyboard.ts` (clavier → `state.input.thrust`).

**Règle du projet** : une session = une victoire.

---

## 2026-11-11 — Session 9 (suite) : MISSION 1 jouable (vaisseau pilotable), modifs retenues pour demain

**Fait** : MISSION 1 fonctionnelle de bout en bout — vaisseau FalconMk2 visible et piloté : Z/W accélère, S/flèche bas recule (rétrofusée), Espace = frein auto qui s'arrête pile à vz=0. CameraRig suit le vaisseau en 3e personne (OrbitControls gardé en commentaire pour le debug). Chaîne complète : clavier → `state.input` → `updatePlayer` → `ship.intent` → newton → `position` → miroir `Entities` → 3D. `tsc --noEmit` propre hors démo/layout. Bugs corrigés en route : React Compiler figeait `state.ships.map` (contourné par `slice(0, count)`) ; `keyup` Space manquant (le frein restait bloqué, vaisseau impossible à faire repartir).

**Appris / incidents** : le miroir `Entities` empile useState + useEffect + useFrame + slice juste pour détecter le spawn — trop compliqué à comprendre. **Modification retenue pour demain (PAS appliquée)** : déplacer `spawnPlayer()` au chargement du module (top-level de loop.ts) et réduire `Entities` à un simple `state.ships.map(...)`. À simplifier aussi plus tard : le cast `as keyof typeof modelRegistry`, les logs de debug `[Entities] ...` encore présents dans le code, et le frein auto (Espace) qui emprunte `brakePower` — il faudra un `stopPower` plus doux, propre à la fiche.

**Prochaine étape** : demain — appliquer la simplification de Entities, retirer les logs de debug, commit + push. Ensuite au choix : rotations du vaisseau (tangage/lacet/roulis) ou autre.

**Règle du projet** : une session = une victoire.
