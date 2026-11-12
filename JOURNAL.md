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

---

## 2026-11-12 — Session 10 : la simplification est appliquée (spawn au chargement du module, miroir en map simple)

**Fait** : modifications retenues de la session 9 appliquées — `src/game/core/loop.ts` spawne le joueur et branche le clavier au chargement du module (`attachKeyboard(); spawnPlayer();` en top-level, `Loop.started` supprimé, log `[GameLoop]` retiré) ; `src/components/game/Entities.tsx` réduit à un simple `state.ships.map(...)` (useState/useEffect/useFrame de détection de spawn supprimés, logs `[Entities]` retirés) ; log `[PlayerShip]` retiré. Vérifié : `tsc --noEmit` sans erreur hors démo Terre2065 ; `GET /play` → 200 ; le chunk app servi par le serveur dev contient `ships.map` et ne contient plus `ships.slice`, `started`, ni aucun log de debug. Non commité : Thierry committera.

**Appris / incidents** : rien de cassé. ARCHITECTURE.md relu (règle 8) : la version simplifiée est PLUS conforme au doc (« Entities qui mappe l'état », « pur miroir ») que l'ancien détecteur de spawn — aucune incohérence à corriger. Limite connue et acceptée du map simple : un vaisseau spawné APRÈS le premier rendu (NPC futur) n'apparaîtra pas à l'écran — à traiter le jour venu via le carrefour d'événements. Le commentaire du cast `as keyof typeof modelRegistry` a été conservé tel quel.

**Prochaine étape** : commit + push par Thierry. Ensuite au choix : rotations du vaisseau (tangage/lacet/roulis — schéma 6DOF de VISION.md, ex. Descent) ou un `stopPower` dédié pour le frein auto (Espace) au lieu d'emprunter `brakePower`.

**Règle du projet** : une session = une victoire.

---

## 2026-11-12 — Session 11 : premier axe de rotation — le lacet avec ←/→ (MISSION 1, 6DOF axe par axe)

**Fait** : lacet (rotation Y) branché de bout en bout — `InputIntent` gagne `yawLeft`/`yawRight` (0-1), `ShipSheet` gagne `angularVelocity` + `turnPower` (3 rad/s²) + `maxTurnRate` (1,5 rad/s ≈ 86°/s), `state.input` initialisé, `keyboard.ts` capte ArrowLeft/ArrowRight (keydown + keyup), `updatePlayer()` recopie vers l'intent du joueur, `newton.ts` intègre la rotation (accélération angulaire plafonnée, puis `rotation += angularVelocity × dt` — la dérive rotationnelle est conservée quand on relâche, conforme à VISION.md). Aucun changement côté rendu : `ShipMirror` recopiait déjà `rotation` vers le 3D. Vérifié : `tsc --noEmit` sans erreur hors démo ; `GET /play` → 200 ; le chunk app servi contient `yawLeft`, `angularVelocity`, `ArrowLeft` (hot reload OK). ARCHITECTURE.md relu (règle 8) : le doc prévoyait déjà `yaw` dans `InputIntent` (lignes 160, 254, 469) — aucune incohérence. Non commité : Thierry committera.

**Appris / incidents** : deux lignes perdues en route, toutes deux attrapées par Thierry à la relecture — (1) les 2 lignes `keydown` ArrowLeft/ArrowRight (seul le `keyup` était posé), (2) les 2 recopies `player.intent.yawLeft/yawRight` dans `updatePlayer()` (sans elles, l'intent du joueur ne recevait jamais le lacet et `tsc` ne disait rien car il ne s'agit que d'assignations). Corrigé, re-vérifié à chaque fois : `tsc --noEmit` propre hors démo, chunk servi contient keydown + keyup + les recopies + le terme newton `yawRight - yawLeft`. Leçon : après une application, relire le fichier entier, pas seulement le diff. Comportement connu pour l'instant : `CameraRig` reste alignée sur le monde et ne suit pas le cap du vaisseau — le lacet se voit parce que le vaisseau pivote sous la caméra. À enrichir plus tard (caméra suiveuse de cap) si demandé.

**Prochaine étape** : commit + push par Thierry. Ensuite au choix : tangage/roulis (à discuter pour les touches : ↑/↓, Z/S sont déjà pris par poussée/rétro) ou un `stopPower` dédié pour le frein auto (Espace).

**Règle du projet** : une session = une victoire.

---

## 2026-11-12 — Session 12 : le vaisseau vole dans la direction où il regarde (poussée en référentiel local + caméra de cap)

**Fait** : point 1 appliqué — `newton.ts` calcule l'axe avant du vaisseau (`forward = -Z` tourné de `rotation.y`, lacet seul pour l'instant) et applique poussée/rétro dessus ; le frein auto (Espace) freine désormais le vecteur vitesse ENTIER vers 0 (plus seulement `z`). `CameraRig.tsx` place la caméra 8 unités derrière selon l'axe arrière propre du vaisseau et vise 10 unités devant selon son axe avant. À `rotation.y = 0` le comportement est identique à avant. Vérifié : `tsc --noEmit` sans erreur hors démo ; `GET /play` → 200 ; le chunk servi contient `forwardX`/`backX`/`sin(ry)`. Note de cohérence (règle 8) : le croquis d'ARCHITECTURE.md (~l. 511) montre une poussée sur `velocity.z` (cadre monde) — c'est exactement le cas `rotation.y = 0` ; le code va plus loin (cadre vaisseau), le principe « intentions, pas clavier » est inchangé. Non commité : Thierry committera.

**Appris / incidents** : (1) l'en-tête de commentaire de `CameraRig.tsx` a encore sauté à l'application (relire le fichier ENTIER après chaque application — fait, corrigé, re-vérifié). (2) **bug de signe du lacet, attrappé en jouant par Thierry** (« quand je tourne à gauche ça va à droite ») : `angularVelocity.y` utilisait `(yawRight - yawLeft)` alors qu'en right-handed three.js une rotation Y POSITIVE tourne le nez (-Z) vers -X = la gauche de l'écran pour notre caméra. Corrigé en `(yawLeft - yawRight)` dans `newton.ts` (le bug venait de la session 11, il est devenu visible avec la caméra de cap). Re-vérifié : `tsc` propre hors démo, `GET /play` → 200, chunk servi contient `yawLeft - yawRight` et plus l'ancien signe. Conséquence gameplay : la rotation dérivant sans frein, un vaisseau qui pousse en tournant décrit des courbes — c'est le 6DOF voulu (VISION.md). Leçon : un signe d'axe ne se vérifie qu'en jouant, pas à la relecture.

**Prochaine étape** : commit + push par Thierry. Ensuite : tangage (axe X) ou roulis (axe Z) — touches à choisir (↑/↓ et Z/S sont pris) — puis généraliser `forward` aux 3 axes quand les 3 rotations existeront. Alternative : `stopPower` dédié pour le frein auto.

**Règle du projet** : une session = une victoire.

---

## 2026-11-12 — Session 12 (suite) : CameraRig réécrit en `applyEuler` (repère local, zéro sin/cos)

**Fait** : `CameraRig.tsx` réécrit — la caméra est exprimée dans le repère propre du vaisseau (`new Vector3(0, 3, 8)` = 3 au-dessus, 8 derrière) et `applyEuler(new Euler(ship.rotation...))` applique la rotation du vaisseau à ce vecteur, comme three.js le fait pour le modèle ; `lookAt` idem avec `(0, 0, -10)` (10 devant le nez). À lacet seul, produit exactement les mêmes nombres que l'ancien `backX/backZ` (vérifié : `R_y(θ)·(0,3,8) = (8 sinθ, 3, 8 cosθ)`). Avantage : généralise seule au tangage/roulis. Vérifié : `tsc --noEmit` propre hors démo, `GET /play` → 200, chunk servi contient `applyEuler` et plus `backX`. Non commité : Thierry committera.

**Appris / incidents** : l'import `import { Euler, Vector3 } from "three"` a encore sauté quand deux éditions du même fichier ont été lancées en parallèle — **leçon : une seule édition à la fois par fichier, puis relecture entière**. Discussion géométrie avec Thierry (cercle trigo, placement de Z, cos sur Z car angle mesuré depuis +Z) : la version `applyEuler` contourne la question — on raisonne en repère local, three.js fait la conversion.

**Prochaine étape** : commit + push par Thierry (point 1 + fix signe lacet + CameraRig applyEuler). Ensuite : tangage ou roulis.

**Règle du projet** : une session = une victoire.

---

## 2026-11-12 — Session 13 : tangage (axe X) sur Q/E — 6DOF : 2 rotations actives

**Fait** : tangage branché de bout en bout — `InputIntent` gagne `pitchUp`/`pitchDown` (0-1), `state.input` initialisé, `keyboard.ts` : KeyQ = nez en haut, KeyE = nez en bas (keydown + keyup ; codes physiques, donc « A »/« E » sur AZERTY), `updatePlayer()` recopie, `newton.ts` : `angularVelocity.x += (pitchUp - pitchDown) * turnPower * dt` plafonnée à `±maxTurnRate`, et le vecteur avant devient 3D, même composition que l'Euler XYZ de three.js (roulis z = 0 pour l'instant) : `forward = (-sin ry, sin rx·cos ry, -cos rx·cos ry)` — poussée/rétro s'appliquent sur les 3 composantes. Signe du tangage vérifié à la main : rotation.x positive = nez vers +Y = haut de l'écran. `CameraRig` inchangé (applyEuler suit tout seul). `turnPower`/`maxTurnRate` généralisés « par axe de rotation » (commentaire de `sheets.ts`). Vérifié : fichiers relus en entier, `tsc --noEmit` propre hors démo, `GET /play` → 200, chunk servi contient `pitchUp`, `forwardY`, `KeyQ`/`KeyE` ×2. Non commité : Thierry committera.

**Appris / incidents** : rien de cassé. Note : deux éditions lancées en parallèle sur le MÊME fichier se écrasent l'une l'autre (import perdu deux fois) — règle appliquée : une seule édition par fichier à la fois, puis relecture entière. Le tangage se teste en jouant (signe de l'axe X) comme le lacet.

**Prochaine étape** : commit + push par Thierry (tout le chantier non commité : point 1 + fix signe + applyEuler + tangage). Ensuite : roulis (axe Z, touches libres restantes ex. A/D = KeyA/KeyD... à confirmer) pour finir le 6DOF, ou `stopPower` dédié.

**Règle du projet** : une session = une victoire.

---

## 2026-11-12 — Session 13 (suite) : la formule de rotation rangée dans `game/physics/frames.ts`

**Fait** : nouveau fichier `src/game/physics/frames.ts` — `forwardFromEuler(rx, ry): Vec3`, la direction monde du nez (local -Z), avec les 3 checkpoints en commentaire ((0,0)→(0,0,-1), (90°,0)→(0,1,0), (0,90°)→(-1,0,0)). `newton.ts` utilise désormais `const forward = forwardFromEuler(ship.rotation.x, ship.rotation.y)` — plus de sin/cos dans la boucle. Pourquoi pas `applyEuler` dans game/ : règle ARCHITECTURE « le cœur reste pur, zéro three.js » — d'où un helper pur TS. Vérifié : checkpoints rejoués en script (3/3 OK, vecteur de norme 1 à angles quelconques), `tsc --noEmit` propre hors démo, `GET /play` → 200, chunk servi contient `forwardFromEuler` et plus `forwardX`. Non commité : Thierry committera.

**Appris / incidents** : rien de cassé. Leçon : la rotation 3D s'exprime proprement dans le repère local + délégation (applyEuler côté rendu, helper nommé côté jeu) — on n'écrit les formules qu'une seule fois, dans un fichier documenté.

**Prochaine étape** : commit + push par Thierry. Ensuite : roulis (axe Z) pour finir le 6DOF, ou `stopPower` dédié.

**Règle du projet** : une session = une victoire.

---

## 2026-11-12 — Session 13 (suite 2) : frames.ts annulé (décision Thierry), bug caméra de poursuite en looping réparé

**Fait** : (1) `frames.ts` créé puis **supprimé à la demande de Thierry** — la formule forward reste en ligne dans `newton.ts` (décision actée : pas de helper, pas de « triche »). (2) **Bug trouvé en jouant** : « au bout d'un moment la caméra passe brutalement en-dessous » — cause : l'offset caméra `(0,3,8)` subissait TOUTE la rotation du vaisseau (`applyEuler` sur l'Euler complet) ; `offset.y = 3·cos rx − 8·sin rx` devient négatif dès rx ≈ 20°, et comme la rotation dérive (jusqu'à 90° en ~1 s à fond sur Q), la caméra passait sous le vaisseau puis tournait autour. Fix dans `CameraRig.tsx` : la caméra n'hérite que du **cap** — `new Euler(0, ship.rotation.y, 0)`, offset `(0,0,8)` derrière + hauteur fixe `+3` en Y monde, `lookAt` 10 devant au niveau du vaisseau. Le vaisseau peut looper, la caméra reste derrière à hauteur fixe. Vérifié : `physics/` ne contient plus que `newton.ts`, `tsc --noEmit` propre hors démo, `GET /play` → 200, chunk servi : `forwardX` de retour, `forwardFromEuler` absent, `applyEuler` ×2 (offset + visée). Non commité : Thierry committera.

**Appris / incidents** : un bug de caméra ne se voit qu'en jouant longtemps (dérive de la rotation) — la relecture de code ne suffit pas. Règle de conception retenue : la caméra de poursuite suit le cap, jamais le tangage/roulis (anti mal de mer, cf. VISION.md).

**Prochaine étape** : commit + push par Thierry. Test visuel à refaire : maintenir Q plusieurs secondes — la caméra doit rester derrière, le vaisseau looper dans le champ. Ensuite : roulis (axe Z) ou `stopPower`.

**Règle du projet** : une session = une victoire.

---

## 2026-11-12 — Session 13 (suite 3) : la visée caméra suit le nez (tangage clampé ±45°), la position reste sûre

**Fait** : Thierry signale qu'après le fix anti « caméra en-dessous », la caméra « ne bouge jamais sur le plan horizontal » quand on tangue — normal, la position n'hérite que du yaw. Séparation des rôles actée dans `CameraRig.tsx` : **position** = 8 derrière selon le yaw + hauteur fixe +3 (sûre, jamais sous le vaisseau) ; **visée** = suit le nez avec le tangage clampé à ±45° (`aimPitch`), donc la vue s'incline quand on tangue (le monde tourne visiblement) tout en gardant le vaisseau dans le champ et la caméra jamais basculée. Vérifié : fichier relu, `tsc --noEmit` propre hors démo, `GET /play` → 200, chunk servi contient `aimPitch`. Non commité : Thierry committera.

**Appris / incidents** : la caméra de poursuite a deux rôles distincts — position (sûreté : yaw + hauteur fixe) et visée (sensation : suit le nez, tangage clampé). Aucun des deux ne doit hériter du roulis (horizon toujours nivelé, anti mal de mer).

**Prochaine étape** : commit + push par Thierry. Test visuel : Q/E → la vue s'incline dans la limite de 45°, le vaisseau reste cadré, jamais de bascule. Ensuite : roulis (axe Z) ou `stopPower`.

**Règle du projet** : une session = une victoire.

---

## 2026-11-12 — Session 13 (suite 4) : caméra collée au repère du vaisseau (quaternion) — le tangage est suivi à l'infini, sans blocage

**Fait** : Thierry signale que la visée clampée à ±45° « suivait un autre angle puis se bloquait » — normal : `rotation.x` dérive sans limite (rotation jamais freinée), donc 45° est atteint en ~0,5 s de Q et la visée restait bloquée pendant que le vaisseau continuait. Fix dans `CameraRig.tsx` : la caméra est désormais **collée au repère du vaisseau** (style Descent, conforme à VISION.md « cadrer sur le vaisseau, jamais sur le vide ») — `Quaternion.setFromEuler(rotation)` identique au modèle 3D, offset `(0,3,8)` en local via `applyQuaternion`, et `camera.quaternion.copy(q)` au lieu de `lookAt`. Le vaisseau est toujours centré, la vue suit l'angle réel (yaw + tangage) indéfiniment, aucun clamp. L'ancien bug « caméra en-dessous » venait du mélange position tournée + orientation restée horizontale (lookAt) ; avec les deux collées au même repère, ce mélange n'existe plus. Vérifié : fichier relu, `tsc` propre hors démo, `GET /play` → 200, chunk : `applyQuaternion` + `quaternion.copy` présents, `aimPitch` absent. Non commité : Thierry committera.

**Appris / incidents** : historique des 3 approches caméra — (1) offset euler complet + lookAt monde → bascule sous le vaisseau ; (2) yaw-only + hauteur fixe → statique au tangage ; (3) visée clampée ±45° → bloque car rotation.x dérive sans borne ; (4) **retenue : caméra collée au repère vaisseau (quaternion)**. À noter pour plus tard : quand le roulis existera, l'horizon s'inclinera avec — à discuter (anti mal de mer VISION.md) : clamp éventuel du roulis caméra uniquement.

**Prochaine étape** : commit + push par Thierry. Test visuel : maintenir Q 3-4 s — le vaisseau fait un looping complet, toujours centré, la vue tourne avec, aucun blocage. Ensuite : roulis (axe Z) ou `stopPower`.

**Règle du projet** : une session = une victoire.

---

## 2026-11-12 — Session 13 (suite 5) : FIN DE SESSION — état des lieux + 2 questions ouvertes pour la reprise

**Fait** : état sauvegardé. MISSION 1 jouable en 6DOF partiel : Z/W poussée, S/↓ rétro, Espace frein auto (vecteur vitesse entier), ←/→ lacet, Q/E tangage ; poussée/rétro selon le nez (repère vaisseau, `forward` 3D dans `newton.ts`) ; caméra collée au repère du vaisseau (quaternion, vaisseau toujours centré, aucun blocage). Commité par Thierry : `5e4f44c FEAT: Rotation on Y` + `2934740 DOCS: update Architecture.md`. **Non commité** (8 fichiers, ~96 insertions) : tangage Q/E + poussée 3D + caméra quaternion. Vérifié ce soir : `tsc --noEmit` propre hors démo, `GET /play` → 200, chunks conformes.

**Appris / incidents** : deux questions ouvertes laissées par Thierry pour la prochaine session : **(1)** la formule `forward = (-sin ry, sin rx·cos ry, -cos rx·cos ry)` dans `newton.ts` reste floue pour lui — à réexpliquer autrement (checkpoints : (0,0)→(0,0,-1), (90°,0)→(0,1,0), (0,90°)→(-1,0,0)) ; **(2)** la règle « zéro three.js dans `game/` » (ARCHITECTURE.md, « le cœur reste pur ») lui paraît « sans sens » — **décision actée qui lui appartient** : à discuter avec lui (autoriser `three` dans `game/physics/` ? compromis = testabilité/headless et cœur indépendant du rendu, vs. moins de maths écrites à la main). Ne pas trancher sans lui (charte règle 7).

**Prochaine étape** : à la reprise — (a) Thierry committe + pushe le chantier en attente après test visuel (Q 3-4 s = looping complet cadré) ; (b) réexpliquer la formule `forward` et discuter la règle du cœur pur ; (c) ensuite roulis (axe Z, touches libres ex. A/D) pour finir le 6DOF, ou `stopPower` dédié pour le frein auto.

**Règle du projet** : une session = une victoire.
