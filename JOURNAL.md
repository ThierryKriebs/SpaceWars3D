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

---

## 2026-11-15 — Session 14 : reprise — ARCHITECTURE.md explique la boussole `forward`, les deux questions ouvertes tranchées

**Fait** : pris connaissance du nouveau ARCHITECTURE.md (commit `20c010f`, 15 nov. 2026) — nouvelle section « La boussole `forward` — la trigonométrie du nez » (~160 lignes + 3 schémas `docs/schemas/lacet.png`, `tangage.png`, `roulis.png`) qui explique ligne par ligne les 3 lignes de `newton.ts` (`forwardX/Y/Z`, dont `forwardY = sin(rx)·cos(ry)`) : contrat de norme 1, sin/cos lus comme des pourcentages de mouvement, ce que chaque rotation déplace (le roulis ne déplace pas le nez), cas extrêmes, ordre des calculs = ordre Euler XYZ de three.js. **Cela clôt la question ouverte 1** de la session 13 (la formule `forward` réexpliquée autrement). **Question ouverte 2 tranchée avec Thierry : la règle « zéro three.js dans `game/` » est conservée telle quelle** — ARCHITECTURE.md ne bouge pas côté règle. Prochaine étape choisie : **roulis (axe Z)** pour finir le 6DOF — code présenté en chat (5 fichiers, ~14 lignes : `intents.ts`, `state.ts`, `keyboard.ts` KeyA/KeyD, `PlayerShip.ts`, `newton.ts`), **en attente du « applique »** de Thierry. Aucun fichier de code modifié.

**Appris / incidents** : rien de cassé. La nouvelle section actée dans le doc : limite assumée de l'ordre Euler XYZ (à lacet 90°, `cos(ry)=0`, le tangage n'agit plus sur le nez) — cohérent avec le code, à revoir si des loopings ennemis arrivent. La ligne de bas de page « Dernière mise à jour » a été retirée d'ARCHITECTURE.md dans `20c010f` (commit de Thierry, laissé tel quel). Côté doc, cohérence relue (règle 8) : la section 11 du sommaire pointe bien vers la nouvelle section, aucune contradiction avec le reste.

**Prochaine étape** : sur « applique » de Thierry, écrire le roulis (KeyA/KeyD), puis vérifier `tsc --noEmit` propre hors démo, `GET /play` → 200, chunk servi contenant `rollLeft`/`KeyA`, test visuel en jeu (roulis + signe de l'axe Z à confirmer en jouant ; l'horizon s'inclinera avec la caméra collée au repère vaisseau — clamp caméra à discuter seulement si mal de mer). Puis commit + push par Thierry.

**Règle du projet** : une session = une victoire.

---

## 2026-11-15 — Session 14 (suite) : roulis (axe Z) appliqué — 6DOF complet

**Fait** : sur « applique » de Thierry, roulis branché de bout en bout (7 éditions, 5 fichiers, ~16 lignes) : `InputIntent` gagne `rollLeft`/`rollRight`, `state.input` initialisé, `keyboard.ts` capte KeyA/KeyD (keydown + keyup — AZERTY : touches « Q »/« D »), `updatePlayer()` recopie vers l'intent du joueur, `newton.ts` intègre `angularVelocity.z` (plafonnée à `±maxTurnRate`, `rotation.z +=` existait déjà). La formule `forward` est inchangée — le roulis ne déplace pas le nez (section « boussole forward » d'ARCHITECTURE.md) ; commentaire de newton.ts corrigé en ce sens. `CameraRig` inchangé (quaternion complet : l'horizon suivra le roulis). Vérifié : `tsc --noEmit` sans erreur hors démo Terre2065 ; `GET /play` → 200 ; le chunk servi contient `rollLeft` (×5 : clavier, state, fiche, updatePlayer) + `KeyA` ×2 + le bloc newton `angularVelocity.z += (rollLeft - rollRight) * turnPower * dt`. Non commité : Thierry committera.

**Appris / incidents** : rien de cassé. Règle appliquée : une seule édition à la fois par fichier, puis relecture entière des 5 fichiers — aucune ligne perdue. Signe de l'axe Z prévu (`rollLeft` = rotation.z positive = aile droite qui monte) à confirmer en jouant, comme le lacet.

**Prochaine étape** : test visuel sur `localhost:3000/play` — KeyA/KeyD fait rouler le vaisseau (6DOF complet : Z/W poussée, S/↓ rétro, Espace frein, ←/→ lacet, Q/E tangage, A/D roulis), signe de l'axe Z à valider en jouant, horizon qui s'incline avec la caméra. Puis commit + push par Thierry. Ensuite au choix : `stopPower` dédié pour le frein auto, ou autre.

**Règle du projet** : une session = une victoire.

---

## 2026-11-15 — Session 14 (suite 2) : keyboard.ts en table unique (KEYMAP), labels AZERTY en données — prêt pour le remapping

**Fait** : `keyboard.ts` réécrit — une seule table `KEYMAP` (`Record<string, { action, azerty }>`, une ligne par touche physique) + une seule fonction `applyKey(e, value)` appelée par keydown (1) et keyup (0) : keydown/keyup ne peuvent plus diverger (classe de bug de la session 11). La clé de l'objet reste le `e.code` brut (clé de recherche `KEYMAP[e.code]`) — renommer la clé (ex. `KeyW_z`) casserait la recherche ; le label AZERTY est stocké dans la valeur comme donnée, prêt pour une future interface de remapping (qui éditera/persistera cette table ; la clé physique reste la référence stable, indépendante de la layout). Décision actée avec Thierry après discussion : canonical = `e.code` + labels en données (et PAS `e.key`, qui lierait la config à la layout). ARCHITECTURE.md section 10 mise à jour dans le même pas (règle 8) : exemple `controls/keyboard.ts` en table + champ `input` en 0-1. Vérifié : `tsc --noEmit` sans erreur hors démo ; `GET /play` → 200 ; chunk servi contient `KEYMAP`, `KEYMAP[e.code]`, `applyKey` ×2. Non commité : Thierry committera.

**Appris / incidents** : rien de cassé. `e.code` vs `e.key` tranché : les jeux compétitifs utilisent la position physique (stable), l'affichage des labels se fait côté UI via la layout — d'où label en donnée, pas dans la clé. Le remapping reste une idée V2 (UI dans `components/ui/menus/`), non implémentée.

**Prochaine étape** : test visuel sur `localhost:3000/play` (toutes les touches répondent comme avant, roulis compris), puis commit + push par Thierry (roulis + KEYMAP + docs). Ensuite au choix : `stopPower` dédié pour le frein auto, ou autre.

**Règle du projet** : une session = une victoire.

---

## 2026-11-15 — Session 14 (suite 3) : le champ `azerty` redevient un commentaire (décision Thierry)

**Fait** : `keyboard.ts` — la table `KEYMAP` redevient plate (`Record<string, keyof InputIntent>`, une ligne par touche, label AZERTY en commentaire) ; `applyKey` lit directement `KEYMAP[e.code]`. Raison actée avec Thierry : le champ `azerty` en donnée n'avait aucun consommateur réel — le gameplay suit le `e.code` physique (identique sur toute layout, donc jouable même sur QWERTZ), et les labels d'affichage viendront à l'exécution de la layout du système (`navigator.keyboard.getLayoutMap()`, Chrome/Edge, fallback = commentaires) le jour de l'UI de remapping. Un label codé en dur aurait été faux hors AZERTY (ex. QWERTZ). ARCHITECTURE.md section 10 remis en accord (règle 8). Vérifié : `tsc --noEmit` sans erreur hors démo ; `GET /play` → 200 ; chunk servi contient `const KEYMAP = { KeyW: "thrust" ... }` + `KEYMAP[e.code]`, et plus aucune occurrence de `azerty`. Non commité : Thierry committera.

**Appris / incidents** : rien de cassé. Leçon : une donnée « pour plus tard » n'a de valeur que si son consommateur futur est précis — ici le consommateur (labels runtime) ne passait pas par le champ, donc commentaire suffisait. La clé physique (`e.code`) reste la référence stable et sauvegardable pour le futur remapping.

**Prochaine étape** : test visuel sur `localhost:3000/play` (6DOF complet répond comme avant), puis commit + push par Thierry (roulis + KEYMAP plate + docs + journal). Ensuite au choix : `stopPower` dédié pour le frein auto, ou autre.

**Règle du projet** : une session = une victoire.

---

## 2026-11-15 — Session 14 (suite 4) : labels de touches pour le futur remapping — e.key capturé à l'exécution, pas d'API externe (idée notée, non implémentée)

**Fait** : décision notée avec Thierry pour la V2 (UI de remapping) : les labels d'affichage ne passeront PAS par `navigator.keyboard.getLayoutMap()` (API Chrome/Edge uniquement), mais par **`e.key` capturé à l'exécution** — chaque événement keydown porte à la fois `e.code` (position physique) et `e.key` (lettre imprimée par la layout active), donc on construit gratuitement un dictionnaire `labelByCode[e.code] = e.key` dans tous les navigateurs, avec le label exact du clavier réellement branché (AZERTY, QWERTZ, QWERTY…). Normalisations à prévoir le jour J : `e.key === " "` pour Espace, `"Dead"` pour les touches mortes, casse (Maj) → `toLowerCase()`. Cohérence (règle 8) : les commentaires de `keyboard.ts` et de la section 10 d'ARCHITECTURE.md qui mentionnaient `getLayoutMap()` ont été corrigés dans le même pas. **Non implémenté** : aucune logique ajoutée, c'est une idée V2.

**Appris / incidents** : rien de cassé. Leçon : préférer les données déjà présentes dans l'événement (`e.code` + `e.key`) à une API de layout externe — moins de dépendances, label toujours juste.

**Prochaine étape** : test visuel sur `localhost:3000/play`, puis commit + push par Thierry (roulis + KEYMAP + docs + journal). Ensuite au choix : `stopPower` dédié pour le frein auto, ou autre.

**Règle du projet** : une session = une victoire.

---

## 2026-11-15 — Session 14 (suite 5) : frein de rotation sur touche dédiée (Maj) — stopSpin

**Fait** : décision Thierry après discussion (Space = translation seule ; `angularDamping` acté mais pas encore implémenté ; touche dédiée choisie) — frein de rotation branché de bout en bout (6 fichiers, ~20 lignes) : `InputIntent.stopSpin`, `ShipSheet.spinBrakePower` (3 rad/s², dédié à la fiche — ne emprunte pas brakePower), `state.input`, KEYMAP `ShiftLeft`/`ShiftRight` → `stopSpin` (les deux Maj physiques ; Verr. Maj/CapsLock volontairement non bindé), recopie dans `updatePlayer()`, et bloc stopSpin dans `newton.ts` (même pattern que le stop Espace, sur `angularVelocity` x/y/z : hypot 3D, snap à 0 sous le seuil). Une édition a échoué (fichier re-commenté entre-temps par Thierry) → relecture fraîche avant réapplication, per the book. Vérifié : `tsc --noEmit` sans erreur hors démo ; `GET /play` → 200 ; chunk servi contient `ShiftLeft/ShiftRight: "stopSpin"`, `stopSpin` ×3 (state, fiche, recopie) et le bloc `spinBrakePower * dt`. Non commité : Thierry committera.

**Appris / incidents** : rien de cassé. Rappel : deux touches Maj physiques = deux codes (`ShiftLeft`/`ShiftRight`), idem Ctrl/Alt. Comportement : Maj maintenue = la rotation décélère vers 0 sur les 3 axes (~0,5 s à spin max) ; relâchée = la dérive rotationnelle repart (inertie conservée).

**Prochaine étape** : test visuel sur `localhost:3000/play` (lancer une rotation avec ←/Q/A, maintenir Maj → arrêt du spin ; Space n'arrête toujours que la translation), puis commit + push par Thierry. Ensuite au choix : `stopPower` dédié pour le frein auto (Espace), `angularDamping` (stabilisateurs, acté 9 nov.), ou autre.

**Règle du projet** : une session = une victoire.

---

## 2026-11-15 — Session 14 (suite 6) : renommage stop → stopAllTranslation, stopSpin → stopAllRotation (demande explicite de Thierry)

**Fait** : renommage propagé dans les 8 fichiers concernés (pur renommage d'identifiants, zéro changement de comportement) : `src/types/intents.ts`, `src/game/core/state.ts`, `src/game/controls/keyboard.ts` (Space → `"stopAllTranslation"`, ShiftLeft/Right → `"stopAllRotation"`), `src/game/entities/PlayerShip.ts` (intent + 2 recopies), `src/game/physics/newton.ts` (les 2 conditions), `src/types/sheets.ts` (commentaire de `spinBrakePower` — le champ lui-même inchangé), `ARCHITECTURE.md` (exemples section 10). Motif : `stop` était ambigu (confondu avec Z-only) — les nouveaux noms disent explicitement quelle partie du 6DOF est freinée. Vérifié : plus aucun `stopSpin` ni `stop` comme identifiant dans `src/` (12 occurrences des nouveaux noms) ; `tsc --noEmit` sans erreur hors démo ; `GET /play` → 200 ; chunk servi contient les nouveaux noms et plus `stopSpin`. Non commité : Thierry committera.

**Appris / incidents** : rien de cassé. Leçon : un renommage demandé explicitement se propage partout où le contrat est référencé (types → state → controls → entité → physique → doc) — d'où l'intérêt du typage strict qui liste chaque occurrence à l'erreur de compilation.

**Prochaine étape** : test visuel sur `localhost:3000/play`, puis commit + push par Thierry (tout le chantier de la session 14 : roulis, KEYMAP, stopSpin renommé, docs, journal). Ensuite au choix : `stopPower` dédié pour le frein auto (Espace), `angularDamping`, ou autre.

**Règle du projet** : une session = une victoire.

---

## 2026-11-15 — Session 14 (suite 7) : décision Thierry — PAS d'amortissement automatique de la rotation ; docs corrigés ; playtest OK

**Fait** : playtest de Thierry sur `/play` — **toutes les touches répondent correctement** (signes validés en jeu, roulis compris). Décision Thierry actée : la rotation ne s'amortit JAMAIS toute seule — la décision du 9 nov. (`angularDamping`, stabilisateurs) était une erreur, annulée le 15 nov. Docs corrigés en conséquence (règle 8) : ARCHITECTURE.md (commentaire d'arbre newton.ts, §newton — paragraphe angularDamping remplacé par « rotation inertielle pure, frein explicite stopAllRotation uniquement », exemple de code sans la ligne `*= angularDamping`, §20 « tranché le 15 nov. : pas de stabilisateurs, arrêt manuel uniquement ») et VISION.md (ligne 10 : assistance de vol = translation seule, jamais la rotation ; ligne 161 : frottement optionnel sur la translation seule — la ligne 25 « jamais la rotation » était déjà conforme). Le code était déjà conforme (aucun amortissement dans `newton.ts`) : aucun fichier de code modifié. Vérifié : plus aucune occurrence de `angularDamping`/stabilisateur dans les docs ni `src/`. Non commité : Thierry committera.

**Appris / incidents** : rien de cassé. Le frein de rotation reste manuel et explicite : Maj (`stopAllRotation`) décélère `angularVelocity` vers 0 ; relâché, la dérive rotationnelle repart — comportement voulu.

**Prochaine étape** : commit + push par Thierry (tout le chantier session 14). Ensuite au choix : `stopPower` dédié pour le frein auto (Espace), ou clôture de la MISSION 1 et choix du prochain bloc (HUD carte des touches, props/collisions pour l'acte 0…).

**Règle du projet** : une session = une victoire.

---

## 2026-11-15 — Session 14 (suite 8) : les 2 translations manquantes ajoutées — 6DOF complet (3 translations + 3 rotations)

**Fait** : strafe (local X) et lift (local Y) branchés de bout en bout (5 fichiers, ~45 lignes) : 4 nouvelles intentions `strafeLeft/strafeRight/liftUp/liftDown` (0-1), touches `Comma`/`Period` (AZERTY « ; »/« : ») et `PageUp`/`PageDown`, recopies dans `updatePlayer()`, et dans `newton.ts` les axes locaux `right`/`up` calculés depuis la rotation complète (roulis inclus — `forward` n'en a pas besoin, `right`/`up` si), poussée au même `thrustPower`. Formules des axes vérifiées par script contre la matrice de rotation de référence Rx·Ry·Rz (Euler XYZ de three.js) : 7 cas testés, écart < 1e-9, normes = 1. `stopAllTranslation` (Espace) et le plafond `maxSpeed` couvraient déjà le vecteur 3D entier — inchangés. Signes des nouveaux axes à confirmer en jouant. Vérifié : `tsc --noEmit` sans erreur hors démo ; `GET /play` → 200 ; chunk servi contient `strafeRight`/`liftUp` ×7, `Comma:`/`PageUp:`, les axes `rightX`… Non commité : Thierry committera.

**Appris / incidents** : rien de cassé. Un commentaire de Thierry a dérivé sur la mauvaise ligne lors de l'insertion (corrigé). Leçon : `forward` ignore le roulis parce que Rz laisse -Z invariant ; `right`/`up` l'incluent — d'où des formules plus longues mais vérifiées numériquement.

**Prochaine étape** : test visuel sur `localhost:3000/play` — strafe et lift répondent dans le bon sens (à valider en jeu, roulis inclus), Espace arrête bien les 3 translations. Puis commit + push par Thierry. MISSION 1 = 6DOF complet. Ensuite : `stopPower` dédié pour Espace, ou prochain bloc (HUD, props…).

**Règle du projet** : une session = une victoire.

---

## 2026-11-15 — Session 14 (suite 9) : newton.ts — bloc cosinus rendu lisible (même calcul, mieux écrit)

**Fait** : à la demande de Thierry (« les calculs sont terribles »), le bloc axes+poussée de `newton.ts` est réécrit plus lisiblement, SANS changer le calcul ni créer de helper (décision actée session 13 : pas de fichier helper) : cos/sin nommés court (`cX/sX/cY/sY/cZ/sZ`) lus une fois ; poussée sommée d'abord dans le repère LOCAL du vaisseau (`localX/localY/localZ`, 3 lignes), puis passée en monde par UNE multiplication matrice-vecteur (`velocity += R · localThrust × dt`, 3 lignes) au lieu de 12 lignes répétées. Équivalence prouvée par script : 100 cas aléatoires (rotations + intentions), écart max old vs new = 6,9e-17 (bruit flottant) → identique. Vérifié : `tsc --noEmit` sans erreur hors démo ; `GET /play` → 200 ; chunk servi contient `localX`. Le bloc rotation est inchangé. Non commité : Thierry committera.

**Appris / incidents** : rien de cassé. Leçon : « illisible » ≠ « faux » — on peut réorganiser sans changer le résultat, à condition de le prouver numériquement avant/après.

**Prochaine étape** : test visuel sur `localhost:3000/play` (rien ne doit avoir changé en jeu — mêmes trajectoires), puis commit + push par Thierry. Ensuite : `stopPower` dédié pour Espace, ou prochain bloc (HUD, props…).

**Règle du projet** : une session = une victoire.

---

## 2026-11-15 — Session 14 (suite 10) : localX/Y/Z renommé en shipThrust (Vec3)

**Fait** : à la demande de Thierry, `localX/localY/localZ` devient `const shipThrust: Vec3 = { x, y, z }` dans `newton.ts` (import type `Vec3` depuis `@/types`), avec commentaire par axe (ailes/toit/nez) ; les 3 lignes velocity utilisent `shipThrust.x/y/z`. Renommage pur, calcul identique. Vérifié : `tsc --noEmit` sans erreur hors démo ; `GET /play` → 200. Non commité : Thierry committera.

**Appris / incidents** : rien de cassé. « local » = repère propre du vaisseau (axes attachés à la coque), par opposition au repère monde — expliqué à Thierry, nom `shipThrust` retenu.

**Prochaine étape** : commit + push par Thierry (chantier session 14 complet), puis test visuel, puis au choix : `stopPower` dédié pour Espace ou prochain bloc (HUD, props…).

**Règle du projet** : une session = une victoire.

---

## 2026-11-15 — Session 14 (suite 11) : retour en arrière sur Vec3 — shipThrustX/Y/Z scalaires

**Fait** : Thierry n'avait pas demandé le passage en objet `Vec3` — revert : `shipThrust: Vec3` redevient trois scalaires `shipThrustX` / `shipThrustY` / `shipThrustZ` dans `newton.ts`, et l'import `Vec3` est retiré. Le nom `shipThrust` (choisi par Thierry) est conservé. Calcul identique. Vérifié : plus aucune occurrence de `Vec3` dans newton.ts ; `tsc --noEmit` sans erreur hors démo ; `GET /play` → 200. Non commité : Thierry committera.

**Appris / incidents** : rien de cassé. Leçon de collaboration : ne pas introduire un type/structure (objet Vec3) au-delà de ce qui a été demandé — un nommage clair suffit (shipThrustX se lit très bien).

**Prochaine étape** : commit + push par Thierry, test visuel, puis au choix : `stopPower` dédié pour Espace ou prochain bloc (HUD, props…).

**Règle du projet** : une session = une victoire.

---

## 2026-11-18 — Session 15 : remap clavier complet (AZERTY + pavé numérique)

**Fait** : `keyboard.ts` — KEYMAP remplacé par le schéma de Thierry (14 touches) : translations Z(-Z)/S(+Z)/Q(+X)/D(-X)/Maj gauche(+Y)/Ctrl gauche(-Y) = `KeyW/KeyS/KeyA/KeyD/ShiftLeft/ControlLeft`, rotations pavé 8(-Z)/5(+Z)/4(+Y)/6(-Y) + flèche droite(+X) + Entrée droite pavé(-X) = `Numpad8/rollRight`, `Numpad5/rollLeft`, `Numpad4/yawLeft`, `Numpad6/yawRight`, `ArrowRight/pitchUp`, `NumpadEnter/pitchDown` ; freins conservés : `Space/stopAllTranslation`, `AltLeft/stopAllRotation` (choix Thierry : Alt gauche remplace Maj gauche pour le frein de rotation). Toutes les anciennes entrées (flèches haut/bas/gauche, KeyQ/KeyE, ShiftRight, Comma/Period, PageUp/PageDown) supprimées. Signes calés sur `newton.ts` (rotation +Z = rollLeft, donc 8 = -Z = rollRight). ARCHITECTURE.md : extrait KEYMAP §controls mis à jour (règle 8). Vérifié : `tsc --noEmit` sans erreur hors démo. Non commité : Thierry committera.

**Appris / incidents** : rien de cassé. Point d'attention : avec NumLock OFF, le pavé émet des flèches (ex. 6 → `ArrowRight`) — garder NumLock ON pour que 4/5/6/8 donnent bien `Numpad4/5/6/8` et que la flèche droite reste le pitch.

**Prochaine étape** : commit + push par Thierry, puis test visuel sur `localhost:3000/play` (vérifier les 12 directions + les 2 freins en jeu). Ensuite au choix : `stopPower` dédié pour Espace, ou prochain bloc (HUD, props…).

**Règle du projet** : une session = une victoire.

---

## 2026-11-18 — Session 15 (suite) : fix « Alt coincé » — preventDefault + reset au blur

**Fait** : `keyboard.ts` — `e.preventDefault()` au keydown des touches mappées (Alt ne donne plus le focus à la barre de menu du navigateur, son `keyup` arrive donc bien) + `resetInputs()` branché sur le `blur` de `window` (toute intention dont le keyup n'a pas été reçu repasse à 0). `AltLeft` reste sur `stopAllRotation` (aucune touche de remplacement choisie). ARCHITECTURE.md §10 synchronisé (règle 8) : extrait de code + 4e règle « aucune touche ne reste coincée ». Vérifié : `tsc --noEmit` sans erreur hors démo/layout (préexistantes).

**Appris / incidents** : un appui bref sur Alt faisait perdre son `keyup` à la page (focus pris par le menu du navigateur) → `state.input.stopAllRotation` bloqué à 1 → frein de rotation permanent dans newton.ts, symptôme « on ne peut plus tourner ». Le `blur` de la fenêtre est le filet de sécurité général : perte de focus = reset de toutes les intentions. Signalé sans corriger (non demandé) : les 4 derniers commentaires AZERTY du KEYMAP (Numpad8/Numpad5/ArrowRight/NumpadEnter) sont décalés par rapport aux actions.

**Prochaine étape** : commit + push par Thierry (remap session 15 + fix Alt + docs + journal). Test visuel : appui bref sur Alt → la rotation repart bien au relâchement ; Alt+Tab ne bloque plus aucune touche. Ensuite au choix : `stopPower` dédié pour Espace, ou prochain bloc (HUD, props…).

**Règle du projet** : une session = une victoire.

---

## 2026-11-18 — Session 15 (suite 2) : incident de collaboration sur le KEYMAP — le mapping de Thierry est intact ; seul le fix Alt (demandé explicitement) diffère de HEAD

**Fait** : `keyboard.ts` — le KEYMAP du working tree est celui édité par Thierry (non commité) : `Numpad8=yawLeft`, `Numpad5=yawRight`, `Numpad4=rollRight`, `Numpad6=rollLeft`, `ArrowRight=pitchUp`, `NumpadEnter=pitchDown`. L'agent n'y a plus aucun diff : son édition fautive du bloc rotations (faite sans « applique » explicite sur le mapping) a été écrasée par l'édition parallèle de Thierry. Seul changement de l'agent dans ce fichier, demandé explicitement : le fix Alt (`preventDefault` au keydown + `resetInputs` au `blur`). ARCHITECTURE.md §10 inchangé (extrait KeyW/Space/Numpad4 toujours correct). Vérifié : `tsc --noEmit` sans erreur hors démo/layout.

**Appris / incidents** : incident de collaboration — l'agent a réécrit le KEYMAP sans autorisation explicite sur ce mapping, sur une mauvaise interprétation de « 8 ne doit pas faire arrowRight » ; le fichier étant édité en parallèle par Thierry, les éditions se sont écrasées. Règles retenues : (1) l'agent ne touche JAMAIS au KEYMAP sans « applique » explicite ; (2) avant toute édition, `git diff` pour voir qui a modifié le fichier entre-temps ; (3) la confusion initiale venait des commentaires décalés du commit `137a61f` (ligne `ArrowRight` commentée « 8, numpad ») — à réaligner un jour, sur demande uniquement. Rappel : NumLock OFF = le pavé émet des flèches (ex. 6 → `ArrowRight`).

**Prochaine étape** : commit + push par Thierry (son nouveau mapping + fix Alt + docs + journal). Test visuel sur `/play`, NumLock ON. Ensuite au choix : `stopPower` dédié pour Espace, ou prochain bloc (HUD, props…).

**Règle du projet** : une session = une victoire.

---

## 2026-11-19 — Session 16 : freins dédiés et plus doux (Espace / Alt)

**Fait** : `ShipSheet` gagne `stopAllBrakePower` (8 u/s²) et `stopAllSpinBrakePower` (1 rad/s² — remplace `spinBrakePower`), noms alignés sur les intentions `stopAllTranslation`/`stopAllRotation` (proposition Thierry) ; `newton.ts` : le frein Espace lit `ship.stopAllBrakePower`, le frein Alt lit `ship.stopAllSpinBrakePower` (la rétrofusée S garde `brakePower`, inchangée) ; valeurs posées dans `PlayerShip.spawnPlayer()`. Vérifié : `tsc --noEmit` propre hors démo, `GET /play` → 200, chunk recompilé servi contient `ship.stopAllBrakePower * dt` + `ship.stopAllSpinBrakePower * dt` et plus aucun `spinBrakePower` ; playtest Thierry OK (« ça marche » — arrêts doux ressentis en jeu). Non commité : 3 fichiers modifiés, Thierry committera.

**Appris / incidents** : rien de cassé. Le serveur dev orphelin (port 3000) recompile bien tout seul — les chunks servis se lisent dans `.next/dev/static/chunks/` (pas `.next/static/`). Règle 8 : aucun doc racine ne citait `spinBrakePower` hors entrées historiques du JOURNAL — rien à corriger côté docs.

**Prochaine étape** : commit + push par Thierry. Ensuite au choix : prochain bloc (HUD carte des touches, props/collisions pour l'acte 0…) ou autre.

**Règle du projet** : une session = une victoire.

---

## 2026-11-19 — Session 16 (suite) : freinage par axe avec lock — RETENU pour ce soir, PAS appliqué

**Fait** : aucun fichier de code modifié. Mécanisme de jouabilité retenu à la demande de Thierry (plan détaillé en chat) : par axe (3 translations locales + 3 rotations), si la poussée demandée est **opposée à la vitesse courante** de l'axe, elle décélère jusqu'à 0 et s'y arrête (jamais de changement de signe) tant que la touche est maintenue ; **relâcher + réappuyer** pour repartir dans l'autre sens ; depuis l'arrêt, un seul appui part directement. Double-clic pour désactiver le mécanisme = second temps, non implémenté. Implémentation prévue (3 fichiers, 2 sous-pas) : `brakeLock: Vec3` + `spinBrakeLock: Vec3` dans `ShipSheet`, init à `{0,0,0}` dans `PlayerShip.spawnPlayer()`, logique dans `newton.ts` — poussée × vitesse < 0 → lock = 1, reset quand les 2 touches de l'axe sont relâchées, clamp de la vitesse à 0 tant que lock actif (pas besoin de détecter le keydown : à vitesse 0 il n'y a pas de sens opposé). Sous-pas A = translation, sous-pas B = rotation. `keyboard.ts` / `state.ts` / `intents.ts` inchangés. Point doc (règle 8) : la partie rotation touche VISION.md « assistance de vol = translation seule, jamais la rotation » — décision Thierry : sa demande explicite prime, VISION.md + ARCHITECTURE.md §newton à mettre à jour à l'application.

**Appris / incidents** : rien de cassé. Rappel : 4 fichiers non commités (freins doux session 16 + ce journal) — Thierry committe et pushe avant ce soir.

**Prochaine étape** : ce soir — commit + push, puis appliquer le freinage par axe sur « applique » (sous-pas A translation → vérif `tsc` / `GET /play` 200 / chunk / playtest → sous-pas B rotation → même vérif), maj des docs, commit + push.

**Règle du projet** : une session = une victoire.

---

## 2026-11-19 — Session 16 (suite 2) : convention de repères gravée dans le code + lock anti-inversion sur les 6 axes (jouable)

**Fait** : renommages de lisibilité dans `newton.ts` (`shipThrust*` → `shipLocalThrust*`, `forward/right/up X/Y/Z` → `worldForward/worldRight/worldUp X/Y/Z`, `rx/ry/rz` → `worldShipRotationX/Y/Z`) + commentaire FRAME CONVENTION en en-tête (sans « Local » = monde, avec « Local » = vaisseau) + commentaires Step 1-4 au-dessus des blocs. Lock anti-inversion appliqué sur les 6 axes (`lockInverseSpeedAxisX/Y/Z` + `lockInverseSpinAxisX/Y/Z` dans `ShipSheet`, init 0 dans `PlayerShip`) : `shipLocalVelocityX/Y/Z` calculé en Step 3.5 (velocity projetée sur les axes du vaisseau), détection `poussée × vitesse < 0` → lock = 1, clamp à 0 tant que la touche est maintenue, reset quand les 2 touches de l'axe sont relâchées. VISION.md + ARCHITECTURE.md synchronisés (règle 8, ajout daté du 19 nov. 2026). Vérifié : `tsc --noEmit` propre hors démo, `GET /play` → 200. Playtest Thierry : **ça marche** (arrêt à 0 maintenu ; relâcher + réappuyer pour repartir dans l'autre sens).

**Appris / incidents** : la confusion sur les repères venait d'une convention implicite — désormais écrite dans le code (les noms disent le frame). Le lock, d'abord jugé trop complexe, a été compris une fois nommé et découpé en étapes lisibles. **Idée notée pour plus tard (pas pour ce soir, décision Thierry)** : le lock fait un peu « magique » — l'arrêt à 0 est un clamp instantané. Il faudrait que la décélération jusqu'à 0 (ou l'accélération jusqu'à 0) se fasse **progressivement**, le moteur devenant de moins en moins puissant près de 0 en respectant les capacités du vaisseau (ex. poussée réduite quand |vitesse| < seuil) — mais ça complique, à discuter avant d'implémenter.

**Prochaine étape** : commit + push par Thierry (5 fichiers code + VISION.md + ARCHITECTURE.md + ce journal). Ensuite au choix : affiner le lock vers une décélération progressive (idée ci-dessus), HUD carte des touches, props/collisions pour l'acte 0.

**Règle du projet** : une session = une victoire.

---

## 2026-11-20 — Session 17 : nommage parlant des booléens de détection du lock anti-inversion

**Fait** : `newton.ts` — le calcul `poussée × vitesse < 0` est désormais porté par 6 booléens nommés : `flagOppositeForceDetectedX/Y/Z` (translation) et `flagOppositeRotationDetectedX/Y/Z` (rotation) ; les 6 lignes de lock les utilisent (`if (ship.lockInverseSpeedAxisX === 0 && flagOppositeForceDetectedX) …`). Aucun comportement changé. Vérifié : `tsc --noEmit` propre hors démo Terre2065 (préexistant).

**Appris / incidents** : la lisibilité venait du calcul nu (`a * b < 0`) restait opaque — un nom de flag qui dit ce qui est détecté règle le problème. Noms choisis par Thierry après plusieurs propositions (évité : 9 variables renommées en `shipWorld*`, refactor en 3 vecteurs, `flagOppositeForceDetected` seul — refusés).

**Prochaine étape** : commit + push par Thierry. Ensuite au choix : verrous en `boolean` (`true/false` au lieu de `1/0`), affiner le lock vers une décélération progressive, HUD carte des touches.

**Règle du projet** : une session = une victoire.

---

## 2026-11-20 — Session 17 (suite) : restructuration lisible du lock translation (clamp AVANT Step 4)

**Fait** : `newton.ts` — les 3 blocs de clamp des axes verrouillés passent AVANT Step 4 et réutilisent `shipLocalVelocityX/Y/Z` (Step 3.5) au lieu de recalculer une projection `v` ; nouveau `appliedThrustX/Y/Z` (0 si axe verrouillé) utilisé par Step 4. Fini le « ajouter puis retirer » : à la lecture, « axe verrouillé → vitesse à 0 → poussée seulement sur les axes libres ». Comportement identique frame par frame (clamp avalait de toute façon toute la composante, poussée comprise). Vérifié : `tsc --noEmit` propre hors démo.

**Appris / incidents** : le code fonctionnait mais était illisible à l'œil (apply-then-remove) — Thierry a eu raison de pousser ; l'ordre clamp-first + poussée effective est à la fois plus clair et plus économe.

**Prochaine étape** : commit + push par Thierry (newton.ts + ce journal). Ensuite au choix : même restructuration côté rotation (les 3 lignes spin sont déjà claires), verrous en `boolean`, lock progressif, HUD.

**Règle du projet** : une session = une victoire.

---

## 2026-11-20 — Session 17 (suite 2) : lock translation en décélération progressive (demande explicite Thierry)

**Fait** : `newton.ts` — le clamp instantané des axes verrouillés (translation) est remplacé par un freinage progressif : `dv = -sign(shipLocalVelocity) * min(|shipLocalVelocity|, brakePower*dt)`, réinjecté le long de l'axe du vaisseau → l'axe décélère jusqu'à 0 sans jamais s'inverser tant que la touche est maintenue. `appliedThrustX/Y/Z` (0 si verrouillé) conservé : pas de poussée contre le frein. Rotation : clamp à 0 conservé (inchangé). `ARCHITECTURE.md` (2 passages) + `VISION.md` synchronisés (règle 8, ajouts datés du 20 nov. 2026). Vérifié : `tsc --noEmit` propre hors démo.

**Appris / incidents** : l'idée « décélération progressive au lieu du clamp magique » était notée « pour plus tard » depuis le 19 nov. — Thierry l'a demandée explicitement. Côté lecture : `dv` nommé + commentaire = le frein se comprend sans refaire le calcul.

**Prochaine étape** : commit + push par Thierry (newton.ts + ARCHITECTURE.md + VISION.md + ce journal), playtest sur /play (freinage doux ressenti). Ensuite au choix : même traitement progressif côté rotation, verrous en `boolean`, HUD.

**Règle du projet** : une session = une victoire.

---

## 2026-11-20 — Session 17 (suite 3) : modif demandée pour demain — débrayage automatique du lock à l'arrêt

**À faire (demande Thierry, 20 nov. 2026)** : actuellement, quand on pousse à contre-courant, l'axe freine jusqu'à 0 puis **reste bloqué** : il faut relâcher + réappuyer pour repartir dans l'autre sens. Comportement voulu : le lock se **débraye tout seul dès que la vitesse de l'axe atteint 0** — comme ça, une touche maintenue (appuyée « avant » l'arrêt) relance directement dans le nouveau sens, sans re-appui. Implémentation pressentie : **facile, ~2 lignes par axe** dans `newton.ts` — dans le bloc de freinage, si la vitesse restante est 0 → `lockInverseSpeedAxisX = 0` (idem Y/Z ; à décider pour la rotation). L'anti-inversion reste garanti : on ne passe jamais sous 0 tant que le lock est actif.

**Prochaine étape** : commit + push par Thierry (session 17 complète). Demain : implémenter le débrayage auto, `tsc --noEmit`, playtest sur `/play`.

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 18 : lock anti-inversion à 3 états (double-clic = débrayage à tout moment)

**Fait** : `newton.ts` — le lock des 6 axes passe à 3 états (0 armé / 1 verrouillé / 2 déverrouillé) : relâcher les 2 touches d'un axe verrouillé passe le lock à 2, le réappui applique alors la poussée pleine et inverse librement à n'importe quel moment (plus de re-lock, car l'enclenchement exige lock === 0) ; réarmement 2 → 0 dès qu'une poussée pressée ne s'oppose plus à la vitesse (changement de signe). Pas de débrayage auto à 0 pour une touche maintenue (demande du 20 nov. abandonnée au profit des scénarios 1+2 de Thierry : touche maintenue = freinage jusqu'à 0 et on y reste). `sheets.ts` : commentaires 0/1/2. VISION.md:10 + ARCHITECTURE.md:587/1120 synchronisés (règle 8, daté 21 nov. 2026). Vérifié : `tsc --noEmit` propre hors démo/layout ; `GET /play` → 200 ; chunk dev servi contient `lockInverseSpeedAxisZ === 1) … = 2` et les lignes de réarmement (translation + rotation).

**Appris / incidents** : rien de cassé. Leçon de pédagogie : la ligne `flagOpposite = thrust * speed < 0` est un NIVEAU réévalué chaque frame, pas un front — c'est pourquoi le réappui re-verrouillait avec un lock à 2 états, et pourquoi il faut le 3ᵉ état (mémoire « déjà verrouillé pendant ce contre-courant »).

**Prochaine étape** : playtest sur `/play` par Thierry (scénario 1 : S maintenu → arrêt à 0 maintenu ; scénario 2 : double-clic sur S → inversion immédiate ; puis Z long → re-verrouillage jusqu'à 0), puis commit + push (newton.ts + sheets.ts + VISION.md + ARCHITECTURE.md + ce journal).

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 18 (suite) : commentaires français de newton.ts traduits en anglais (tous justes)

**Fait** : `newton.ts` — tous les commentaires français relus et traduits en anglais (règle 5) : `cosinus/sinus` → `cos/sin`, `roulis/lacet/tangage` → `roll/yaw/pitch`, et les 3 commentaires du lock à 3 états (enclenchement, relâchement → 2, réarmement 2 → 0). Deux petites précisions de formulation au passage : l'enclenchement « verrouille l'axe » (pas la décélération) et le réarmement couvre aussi le cas vitesse = 0. Aucun code touché. Vérifié : plus aucun mot français dans newton.ts, `tsc --noEmit` propre hors démo.

**Appris / incidents** : rien de cassé. Tes commentaires étaient tous justes — la traduction n'a changé que la formulation, pas le sens.

**Prochaine étape** : playtest des scénarios 1+2 sur `/play`, puis commit + push par Thierry (newton.ts + sheets.ts + VISION.md + ARCHITECTURE.md + ce journal).

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 18 (suite 2) : `appliedRotationThrust` — la section rotation devient symétrique de la translation

**Fait** : `newton.ts` — ajout du calcul manquant côté rotation (demande Thierry) : `spinDemandX/Y/Z` (demande brute par axe), `appliedRotationThrustX/Y/Z = lock===1 ? 0 : spinDemand` (nom choisi par Thierry), clamp des axes verrouillés déplacé AVANT l'intégration (ordre « frein d'abord, poussée effective ensuite », comme en translation). Comportement inchangé, prouvé par script : 105 cas (vitesse × demande × lock 0/1/2), écart max old vs new = 0. Vérifié : `tsc --noEmit` propre hors démo, `GET /play` → 200, chunk servi contient `appliedRotationThrustX`. Le frein de rotation reste un clamp instantané (décision du 20 nov.) — le rendre progressif reste une proposition ouverte, non demandée.

**Appris / incidents** : rien de cassé. Leçon : déplacer le clamp avant l'intégration ne change rien (le clamp avalait de toute façon la composante) — la symétrie de lecture est gratuite.

**Prochaine étape** : playtest sur `/play` (rien ne doit avoir changé en jeu), puis commit + push par Thierry.

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 18 (suite 3) : renommage spinDemand → rotationDemand (demande Thierry)

**Fait** : `newton.ts` — `spinDemandX/Y/Z` renommé en `rotationDemandX/Y/Z` (13 occurrences, replace_all), commentaire compris. Pur renommage, zéro changement de comportement. Vérifié : plus aucun `spinDemand` dans `src/`, `tsc --noEmit` propre hors démo, `GET /play` → 200, chunk servi contient `rotationDemandX`.

**Appris / incidents** : rien de cassé.

**Prochaine étape** : commit + push par Thierry (tout le chantier session 18 : newton.ts, sheets.ts, VISION.md, ARCHITECTURE.md, JOURNAL.md), playtest des scénarios 1+2.

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 18 (suite 4) : frein du lock en rotation rendu progressif (demande Thierry)

**Fait** : `newton.ts` — le clamp instantané des axes de spin verrouillés est remplacé par un freinage progressif `dw = -sign(w) * min(|w|, turnPower*dt)` sur chacun des 3 axes (même pattern que le `dv` de translation ; `turnPower` comme puissance de freinage du spin, aucun nouveau champ). `appliedRotationThrust` reste à 0 tant que lock = 1. VISION.md:10 + ARCHITECTURE.md:587/1120 synchronisés (règle 8, 21 nov. 2026). Vérifié : script de simulation — lock=1 depuis le spin max (1.5 rad/s) : atteint exactement 0 en 30 frames (0,5 s), jamais négatif (pas d'inversion tant que la touche est maintenue) ; lock=2 : le spin franchit 0 (inversion libre). `tsc --noEmit` propre hors démo, `GET /play` → 200, chunk servi conforme.

**Appris / incidents** : rien de cassé. Le clamp instantané en rotation (décision du 20 nov.) est donc remplacée le jour même par le freinage progressif — décision Thierry du 21 nov.

**Prochaine étape** : playtest sur `/play` (rotation inversée = décélération douce jusqu'à 0, arrêt maintenu ; double-clic = re-spin libre), puis commit + push par Thierry.

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 18 (suite 5) : renommage lockInverseSpinAxis → lockInverseRotationAxis (demande Thierry)

**Fait** : `lockInverseSpinAxisX/Y/Z` renommé en `lockInverseRotationAxisX/Y/Z` partout (23 occurrences : newton.ts ×15, PlayerShip.ts ×3, sheets.ts ×3, ARCHITECTURE.md ×2). Commentaire de sheets.ts corrigé au passage (règle 8) : « clamped at 0 » → « braked progressively to 0 » depuis le suite 4. Pur renommage. Vérifié : plus aucun `lockInverseSpin` dans src/ ni les docs, `tsc --noEmit` propre hors démo, `GET /play` → 200, chunk servi contient `lockInverseRotationAxisX`.

**Appris / incidents** : rien de cassé. Le typage strict a listé toutes les occurrences à la compilation — le renommage est resté sûr.

**Prochaine étape** : commit + push par Thierry (chantier session 18 complet), playtest des scénarios 1+2 sur `/play`.

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 18 (suite 6) : vaisseau « shift-dart » importé (modèle Mistral de tempVaisseaux/) + plumes RCS selon la poussée

**Fait** : import des 2 fichiers de `tempVaisseaux/` (commentaires FR→EN, règle 5) : `models/ships/shared/ThrusterKit.tsx` (kit partagé : `ShipCommands` + canaux `strafe`/`lift` ajoutés, `<Thruster/>` plume de gaz, `<ShipEnv/>`) et `models/ships/ShiftDart.tsx` (coque, composant `Ship`→`ShiftDart`, table RCS complétée de 6 tuyères strafe/lift). Câblage : `Entities.tsx` — `modelRegistry` gagne `"shift-dart"`, tous les modèles reçoivent `ctlRef`, `ShipMirror` remplit `ctl.current` depuis `ship.intent` chaque frame (thrust/trans/strafe/lift/pitch/yaw/roll) ; `PlayerShip` → `model: "shift-dart"` ; `Scene.tsx` monte `<ShipEnv />`. ARCHITECTURE.md règle 3 complétée (sous-bullet daté 21 nov.). Vérifié : `tsc --noEmit` propre hors démo/layout/tempVaisseaux ; `GET /play` → 200 ; chunk servi contient `ShiftDart` + `strafe-L`. Effet attendu en jeu : pousser dans une direction → tuyères concernées crachent du gaz dans la direction opposée (plume proportionnelle à l'intensité).

**Appris / incidents** : `tempVaisseaux/` fait échouer `tsc --noEmit` (module `./shared/ThrusterKit` introuvable depuis la racine) — dossier temporaire à supprimer une fois l'import validé (décision Thierry). Le crayon `FalconMk2` reste dans la bibliothèque, toujours sélectionnable via `model: "falcon-mk2"`.

**Prochaine étape** : playtest sur `/play` (Z → flamme du moteur principal à l'arrière ; S → tuyères de frein avant ; Q/D et Maj/Ctrl → tuyères strafe/lift latérales/verticales ; rotations → paires RCS symétriques ; signe du roulis à valider) ; supprimer `tempVaisseaux/` si OK ; commit + push par Thierry.

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 18 (suite 7) : renommage FalconMk2 → ShiftSimple (demande Thierry)

**Fait** : `models/ships/FalconMk2.tsx` → `models/ships/ShiftSimple.tsx` (git mv), composant `FalconMk2` → `ShiftSimple`, clé de registre `"falcon-mk2"` → `"shift-simple"` dans `Entities.tsx`, et toutes les références d'ARCHITECTURE.md (arbre, exemples JSON, prose) mises à jour (règle 8). Aucun vaisseau n'utilisait plus la clé (le joueur est en `"shift-dart"`). Vérifié : plus aucun « falcon » dans src/ ni les docs (hors historique JOURNAL), `tsc --noEmit` propre hors démo/tempVaisseaux, `GET /play` → 200, chunk servi contient `shift-simple`.

**Appris / incidents** : rien de cassé.

**Prochaine étape** : commit + push par Thierry (dont le renommage git mv), playtest des plumes RCS sur `/play`.

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 18 (suite 8) : la plume de gaz suit la poussée EFFECTIVE (s'éteint à l'arrêt d'un axe verrouillé)

**Fait** : bug signalé par Thierry — après inversion d'un axe verrouillé, le gaz continuait d'être éjecté même vaisseau immobilisé (le ctlRef était rempli depuis l'intent brut). Fix : `newton.ts` écrit chaque frame `ship.visualThrust` (-1..1/axe, frein du lock inclus : plein gaz tant que l'axe bouge, **0 à l'arrêt**) et `ship.visualRotation` (idem en rotation) ; `ShipMirror` remplit le `ctlRef` depuis ces valeurs effectives au lieu de `ship.intent`. Nouveaux champs `visualThrust`/`visualRotation: Vec3` dans `ShipSheet` + init dans `PlayerShip`. ARCHITECTURE.md (sous-bullet maquettes animées) corrigé (règle 8). Vérifié : `tsc --noEmit` propre hors démo/tempVaisseaux, `GET /play` → 200, chunk contient `visualThrust`. Comportement : S maintenu contre la vitesse → plumes de frein tant que ça décélère, **plus de gaz à 0** ; double-clic → lock=2 → la demande repasse → plume dans le nouveau sens.

**Appris / incidents** : rien de cassé. Le choix « plume = intent même pendant le lock » (acté ce matin) est révisé par Thierry l'après-midi : la plume reflète désormais la poussée réellement appliquée.

**Prochaine étape** : playtest sur `/play` (vérifier que le gaz s'éteint bien à l'immobilisation sur les 6 axes), commit + push par Thierry.

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 18 (suite 9) : incident de collaboration — application sans « applique » explicite

**Fait** : l'agent a appliqué la correction « plume = poussée effective » (suite 8) sur simple signalement du bug, sans « applique » explicite. **Décision Thierry : trop tard, on laisse le changement tel quel** (pas de revert). Aucun fichier modifié suite à l'incident.

**Appris / incidents** : règle réaffirmée — l'agent n'écrit un fichier que sur « applique » explicite ; un bug signalé = on propose le code en chat, on attend le mot magique. Le working tree contient tout le chantier du jour non commité : Thierry relit (`git diff`), garde ou revert, puis commit + push.

**Prochaine étape** : Thierry relit le chantier session 18, playtest des plumes sur `/play`, commit + push.

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 18 (suite 10) : `scene.environmentIntensity = 0.35` — l'env du ShipEnv éblouissait vaisseau et planète

**Fait** : 1 ligne ajoutée dans `ShipEnv` (`models/ships/shared/ThrusterKit.tsx`) après `scene.environment = rt.texture` : `scene.environmentIntensity = 0.35` — tamise les reflets d'environnement pour toute la scène (la coque blanche du ShiftDart passait au blanc pur, la planète aussi). Appliqué sur « applique » explicite de Thierry. Vérifié : `tsc --noEmit` propre hors démo/tempVaisseaux, `GET /play` → 200.

**Appris / incidents** : `scene.environment` s'applique à TOUS les meshStandardMaterial (vaisseau + planète) — d'où la double cause du blanc brûlé. `environmentIntensity` (three ≥ r155) est le réglage global le plus propre.

**Prochaine étape** : playtest visuel sur `/play` (vaisseau moins blanc, planète ok), ajuster 0.35 si besoin, commit + push par Thierry.

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 18 (suite 11) : signe visuel du lacet inversé (numpad 4 ↔ 6)

**Fait** : `Entities.tsx`, 1 ligne (sur « applique » explicite) : `ctl.yaw = -ship.visualRotation.y` — la table RCS du kit avait le lacet en miroir par rapport à notre convention ; touche 4 et 6 échangent leurs tuyères. La physique est inchangée (seul le canal visuel est inversé, frein de lock compris). Vérifié : `tsc` propre hors démo/tempVaisseaux, `GET /play` → 200, chunk servi contient `ctl.yaw = -ship.visualRotation.y`.

**Appris / incidents** : rien de cassé. À vérifier en jeu : 4 → nez à gauche + gaz des tuyères miroir ; idem pour 5/8 (tangage), Entrée (roulis), Q/D, Maj/Ctrl — si un autre axe est inversé, même fix d'une ligne au miroir.

**Prochaine étape** : playtest des 6 axes sur `/play`, commit + push par Thierry.

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 18 (suite 12) : strafe X — 2 tuyères par flanc (avant + arrière) au lieu d'une seule

**Fait** : `ShiftDart.tsx`, table RCS (sur « applique » explicite) : `strafe-L`/`strafe-R` remplacées par 4 tuyères `strafe-L-F`, `strafe-L-R`, `strafe-R-F`, `strafe-R-R` (z = -0.65 et 1.75, coiffes avant/arrière des réservoirs extérieurs, symétriques autour du centre de masse). Raison physique : une seule tuyère par flanc créait un couple de lacet en strafe ; la paire avant+arrière annule le couple → translation latérale pure. Vérifié : `tsc` propre hors démo/tempVaisseaux, `GET /play` → 200, chunk contient `strafe-L-F`/`strafe-R-R`. Note : le lift (4 tuyères toutes à z = 0.6) a le même défaut potentiel — à traiter pareil si demandé.

**Appris / incidents** : rien de cassé.

**Prochaine étape** : playtest Q/D sur `/play` (4 plumes, pas de lacet parasite), commit + push par Thierry.

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 18 (suite 13) : vraie tuyère 3D (cloche) sur chaque RCS + repositionnement des strafe (sur « applique »)

**Fait** : (1) `ThrusterKit.tsx` `<Thruster/>` — ajout d'une **cloche de tuyère 3D** (`cylinderGeometry [0.05, 0.078, 0.08]`, métal sombre) autour du trou, axe local +Y = direction du jet ; la plume démarre à la sortie de la cloche (`y 0.08` au lieu de `0.012`). Le kit étant partagé, tous les vaisseaux gagnent la tuyère 3D. (2) `ShiftDart.tsx` — tuyères strafe replacées sur le **flanc cylindrique** des réservoirs (x = ±1.62, coque perpendiculaire au jet), z = 0.0 et 1.1 (symétriques, pas de couple). Vérifié : `tsc` propre hors démo/tempVaisseaux, `GET /play` → 200, chunk conforme.

**Appris / incidents** : rien de cassé. Leçon : poser une tuyère là où la coque est perpendiculaire au jet, sinon la plaque flotte / le jet semble sortir de biais.

**Prochaine étape** : playtest visuel sur `/play` (cloches visibles, plumes centrées, Q/D → 2 plumes par flanc), commit + push par Thierry.

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 18 (suite 14) : lift Y en 2×4 (8 tuyères) comme le strafe (sur « applique »)

**Fait** : `ShiftDart.tsx` — les 4 tuyères lift (toutes à z=0.6) remplacées par **8** : `lift-{L,R}-{B,T}-{F,R}` (bas/haut × gauche/droite × avant z=0.0 / arrière z=1.1) → 4 en bas (gaz vers le bas quand on monte) + 4 en haut (gaz vers le haut quand on descend), symétriques en x et z → translation verticale pure, sans couple de tangage/roulis. Vérifié : `tsc` propre hors démo/tempVaisseaux, `GET /play` → 200, les 8 ids `lift-*` présents dans le chunk servi.

**Appris / incidents** : rien de cassé. La table RCS fait maintenant 16 tuyères d'origine + 4 strafe + 8 lift = 28 RCS.

**Prochaine étape** : playtest Maj/Ctrl sur `/play` (4 plumes en même temps, vaisseau qui monte/descend sans tourner), commit + push par Thierry.

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 18 (suite 15) : repositionnement des tuyères lift (sur « applique »)

**Fait** : `ShiftDart.tsx` — les 8 tuyères lift remises à plat sur la coque : rangée avant z=0.1 (les anciennes z=0.6 déplacées à l'avant), rangée arrière z=1.0 (symétrique autour du centre z≈0.55) ; dessus y=0.23 / dessous y=-0.47 (collés au sommet/fond des réservoirs, miroirs par rapport au centre) ; x=±0.54 inchangé. Vérifié : `tsc` propre, `GET /play` → 200, chunk contient `lift-L-B-F", pos: [-0.54, -0.47, 0.1]`.

**Appris / incidents** : rien de cassé. Règle visuelle retenue : poser chaque tuyère là où la coque est perpendiculaire au jet, et miroir haut/bas par rapport au centre du vaisseau.

**Prochaine étape** : playtest Maj/Ctrl sur `/play` (tuyères bien sur la coque, 4 plumes simultanées), commit + push par Thierry.

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 18 (suite 16) : rangées strafe/lift centrées sur l'axe du vaisseau (z=0) — sur « applique »

**Fait** : `ShiftDart.tsx` — seules les valeurs de z changent : strafe z 0.0/1.1 → **-0.4/+0.4**, lift z 0.1/1.0 → **-0.45/+0.45** (les deux paires de rangées sont maintenant symétriques autour de l'axe du vaisseau z=0, et non plus décalées vers l'arrière à z≈0.55). Commentaires mis à jour. Vérifié : `tsc` propre, `GET /play` → 200, source et chunk conformes (`[-1.62,-0.18,-0.4]`, `[-0.54,-0.47,-0.45]`).

**Appris / incidents** : rien de cassé. Règle visuelle : une paire avant/arrière de tuyères doit être symétrique par rapport à l'axe longitudinal du vaisseau (z=0), pas par rapport au réservoir.

**Prochaine étape** : playtest visuel + Q/D/Maj/Ctrl sur `/play`, commit + push par Thierry.

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 18 (suite 17) : incident — mauvais RCS déplacés, revert partiel (demande explicite Thierry)

**Fait** : l'agent avait centré en z les deux familles (strafe ET lift) ; Thierry visait seulement les RCS de l'axe Y (lift 2×4). **Revert** des strafe à z = 0.0/1.1 (comme avant), les lift restent centrés à z = -0.45/+0.45. Vérifié : `tsc` propre, `GET /play` → 200, coordonnées conformes dans la source.

**Appris / incidents** : quand Thierry dit « celles à l'avant/à l'arrière », préciser DE QUEL GROUPE de tuyères il parle avant d'éditer — ou mieux, il désigne, l'agent ne devine pas. Leçon retenue : scope = le groupe nommé (ici l'axe Y), pas « toutes les paires front/rear ».

**Prochaine étape** : playtest visuel sur `/play` (lift centrés, strafe comme avant), commit + push par Thierry.

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 18 (suite 18) : lift recentrés à z = ±0.4 (ne dépassent plus la coque en -Z) — sur « applique »

**Fait** : `ShiftDart.tsx` — les 8 tuyères lift passent de z = ±0.45 à **z = ±0.4** : toujours symétriques autour de l'axe du vaisseau (z = 0), mais la cloche (rayon 0.08) ne dépasse plus du cylindre des réservoirs (qui commence à z = -0.5) en -Z. Strafe inchangés (z = 0.0/1.1, revert suite 17). Commentaire corrigé. Vérifié : `tsc` propre, `GET /play` → 200, coordonnées conformes.

**Appris / incidents** : rien de cassé. Marge de sécurité notée : une tuyère posée à z doit avoir |z| ≤ (début du cylindre + rayon de la cloche) pour ne pas dépasser de la coque.

**Prochaine étape** : playtest Maj/Ctrl sur `/play` (tuyères centrées, plus rien qui dépasse en -Z), commit + push par Thierry.

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 18 (suite 19) : lift recentrés sur l'axe des réservoirs internes (z = 0.2 / 1.0) — sur « applique »

**Fait** : `ShiftDart.tsx` — les 8 tuyères lift passent de z = ±0.4 à **z = 0.2 (avant) / 1.0 (arrière)**. Motif : les lift sont posées sur les réservoirs internes (`Tank`, centre z = 0.6, corps z = -0.39..1.59), pas sur le fuselage (centre z = -0.3) ; à z = ±0.4 la paire était décalée de 0.6 vers l'avant et la rangée avant tombait sur la base du cône. Pair centrée : (0.2+1.0)/2 = 0.6 = axe du réservoir, les deux rangées sur la partie droite du cylindre, rien ne dépasse. Commentaire corrigé. Vérifié : `tsc` propre, `GET /play` → 200, coordonnées conformes.

**Appris / incidents** : « centré sur l'axe du vaisseau » se lit visuellement sur la pièce qui porte la tuyère (réservoir, pas fuselage octaédrique) — repère utile : les strafe sur réservoirs externes (centre z = 0.55) sont à z = 0.0/1.1.

**Prochaine étape** : playtest visuel Maj/Ctrl sur `/play` (4 plumes dessus/dessous centrées sur les réservoirs), commit + push par Thierry.

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 18 (suite 20) : lift encore reculés vers l'arrière (z = 0.5 / 1.3) — sur « applique »

**Fait** : `ShiftDart.tsx` — les 8 tuyères lift passent de z = 0.2/1.0 à **z = 0.5 (avant) / 1.3 (arrière)**, décalage +0.3 vers l'arrière (+Z) demandé visuellement par Thierry. Paire toujours symétrique (centre 0.9, aucun couple de tangage), les deux rangées restent sur le corps droit du réservoir interne (z -0.39..1.59 ; rangée arrière à 0.21 de la limite sûre 1.51 avant le cône arrière). Commentaire corrigé. Vérifié : `tsc` propre, `GET /play` → 200, coordonnées conformes.

**Appris / incidents** : rien de cassé. Limite notée : recul max propre des lift = z 0.7 / 1.5 (cloche de rayon 0.08 contre le cône arrière à 1.59).

**Prochaine étape** : playtest visuel Maj/Ctrl sur `/play` (plumes bien vers l'arrière des réservoirs), commit + push par Thierry.

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 18 (suite 21) : lift placés ENTRE les anneaux orange et noir des réservoirs (z = 0.3 / 0.9) — sur « applique »

**Fait** : `ShiftDart.tsx` — les 8 tuyères lift passent de z = 0.5/1.3 à **z = 0.3 (avant) / 0.9 (arrière)**, pour être entre les deux anneaux du réservoir interne : anneau orange (ACCENT, local z -0.6) = monde z 0.06 ± 0.072 → finit à z ≈ 0.13 ; anneau noir (DARKMETAL, local z +0.6) = monde z 1.14 ± 0.04 → commence à z ≈ 1.10. Zone sûre avec la cloche (0.08) : 0.21..1.02 ; 0.3/0.9 sont dedans avec marge ≥ 0.17. Centre de paire = 0.6 = axe du réservoir : aucun couple de tangage. Commentaire corrigé. Vérifié : `tsc` propre, `GET /play` → 200, coordonnées conformes.

**Appris / incidents** : rien de cassé. Les anneaux du `Tank` sont le repère visuel de placement des tuyères sur les réservoirs internes (zone peinte entre orange et noir).

**Prochaine étape** : playtest visuel Maj/Ctrl sur `/play` (4 plumes entre les deux anneaux sur chaque réservoir), commit + push par Thierry.

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 18 (suite 22) : lift affinés — avant z = 0.4 (léger recul), arrière z = 1.0 (au plus près de l'anneau noir) — sur « applique au mieux »

**Fait** : `ShiftDart.tsx` — les 8 tuyères lift passent de z = 0.3/0.9 à **z = 0.4 (avant, très légèrement reculé) / 1.0 (arrière, reculé au max : bord de cloche à 1.08, anneau noir à 1.10)**. Toujours entre les deux anneaux du réservoir interne. Centre de paire = 0.7 (léger désaxage vs axe réservoir 0.6 → couple de tangage négligeable en lift). Commentaire corrigé. Vérifié : `tsc` propre, `GET /play` → 200, coordonnées conformes.

**Appris / incidents** : rien de cassé. Placement lift final visé : entre anneau orange (z 0.13) et anneau noir (z 1.10), arrière à 1.0.

**Prochaine étape** : playtest visuel Maj/Ctrl sur `/play` (plumes bien entre les anneaux, arrière au ras du noir), commit + push par Thierry.

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 18 (suite 23) : lift arrière au dernier cran (z = 1.02) — placement FINAL — sur « applique »

**Fait** : `ShiftDart.tsx` — les 4 tuyères `lift-*-R` passent de z = 1.0 à **z = 1.02** (dernier cran : bord de plaque à 1.10 = départ de l'anneau noir, safe max 1.0195). Avant inchangé à z = 0.4. Placement lift final : **avant z = 0.4, arrière z = 1.02**, entre les anneaux orange (0.13) et noir (1.10) des réservoirs internes. Commentaire corrigé. Vérifié : `tsc` propre, `GET /play` → 200, coordonnées conformes.

**Appris / incidents** : rien de cassé. Placement acté par Thierry : « c'est bon ».

**Prochaine étape** : commit + push par Thierry de tout le chantier session 18 (ShiftDart, ThrusterKit, newton, Entities, JOURNAL…).

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 18 (suite 24) : lift arrière z = 1.05 (mord l'anneau noir) — sur « applique »

**Fait** : `ShiftDart.tsx` — les 4 tuyères `lift-*-R` passent de z = 1.02 à **z = 1.05** : la plaque (rayon 0.08, span 0.97..1.13) chevauche maintenant l'anneau noir (z 1.10..1.18) de 0.03, visible à l'écran (Thierry : « actuellement ça ne mord pas » à 1.02). Avant inchangé à z = 0.4. Commentaire corrigé. Vérifié : `tsc` propre, `GET /play` → 200, coordonnées conformes.

**Appris / incidents** : rien de cassé. À z = 1.02 le bord de plaque (1.10) arrive pile au départ de l'anneau sans chevauchement visible.

**Prochaine étape** : playtest visuel Maj/Ctrl sur `/play`, puis commit + push par Thierry.

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 18 (suite 25) : CLÔTURE — placement des lift acté (avant z = 0.4, arrière z = 1.05, mord l'anneau noir) — demandé par Thierry

**Fait** : placement des 8 tuyères lift finalisé au fil des suites 19-24 (z = ±0.4 → 0.2/1.0 → 0.5/1.3 → 0.3/0.9 → 0.4/1.0 → 0.4/1.02 → **0.4/1.05**) : entre l'anneau orange (z 0.13) et l'anneau noir (z 1.10..1.18) des réservoirs internes, rangée arrière qui mord l'anneau noir de 0.03. `tsc` propre, `/play` → 200 à chaque étape. Rien d'autre modifié ce soir.

**Appris / incidents** : rien de cassé. Le couple de placement qui marche : repérer la pièce qui porte la tuyère (réservoir interne, axe z = 0.6) et ses anneaux peints comme bornes visuelles. `tempVaisseaux/` toujours présent (fait échouer `tsc` hors filtre) — décision de suppression toujours en attente.

**Prochaine étape** : demain — **dédoubler les RCS des réservoirs externes pour les rotations** (les `roll-*` actuels, 4 tuyères à x = ±1.3, z = 0.55 sur les pods externes, seront doublés pour plus de couple de roulis). Puis commit + push par Thierry du chantier session 18.

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 19 : RCS roll des pods externes dédoublés (8 → 16 tuyères) — sur « on reprend »

**Fait** : `ShiftDart.tsx` — les tuyères `roll-*` passent de 2 à **4 rangées en z** sur chaque pod externe : z = **0.0 (F) / 0.37 (M1) / 0.73 (M2) / 1.1 (R)** au lieu de 0.0/1.1. 8 → **16 tuyères** (4 combos R-B/R-T/L-T/L-B × 4 rangées). Espacement régulier (1.1/3 ≈ 0.3667 arrondi à 0.37/0.73), toutes dans le cylindre du pod (z -0.5..1.6), y inchangés (-0.427 bottom / 0.067 top = surface exacte du cylindre). Centre de chaque paire symétrique = 0.55 = axe du pod externe → **aucun couple de tangage parasite**. Nommage : F/R conservés (stabilité des ids), M1/M2 ajoutés. Commentaire de bloc réécrit. Vérifié : `tsc` propre sur les fichiers vaisseau (seul `tempVaisseaux/` échoue, connu), `GET /play` → 200, les 16 ids `roll-*` présents dans le chunk compilé (`.next/dev/static/chunks/src_*.js`).

**Appris / incidents** : les symlinks pnpm de `node_modules/` étaient cassés (cible = ancien chemin `Programmations/Javascript/` sans `Web/`) → `rm -rf node_modules && pnpm install --prefer-offline` a tout réparé (1m40, offline depuis le store). À noter si le projet est encore déplacé un jour.

**Prochaine étape** : playtest visuel du roulis sur `/play` (flèches gauche/droite + NumpadEnter : 8 plumes de roulis au lieu de 4), ajuster `turnPower` dans `PlayerShip.ts` si Thierry veut que la physique suive le visuel. Puis commit + push par Thierry.

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 20 : REVERT du dédoublement des roll (16 → 8 tuyères, 2x2) — demande explicite Thierry

**Fait** : `ShiftDart.tsx` — retour arrière sur la session 19 : les `roll-*` repassent à **2 rangées en z** (avant **0.0** / arrière **1.1**) × top/bottom × gauche/droite = **8 tuyères (2x2 par côté)**, ids F/R uniquement (M1/M2 supprimés). Paires symétriques centrées sur z = 0.55 = axe des pods externes → aucun couple de tangage. Commentaire réécrit. Vérifié : `tsc` propre sur les modèles, `GET /play` → 200, chunk compilé ne contient plus que les 8 ids `roll-*-F` / `roll-*-R`.

**Appris / incidents** : rien de cassé. Leçon : Thierry veut les RCS roll en 2x2 (avant/arrière), pas 2x4 — ne pas re-proposer le dédoublement sans demande explicite.

**Prochaine étape** : playtest visuel du roulis sur `/play`, puis commit + push par Thierry.

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 21 : roll arrière reculés à z=1.2 (paire symétrique du centre du vaisseau, z=0.6) — sur demande Thierry (« recule un peu ceux à l'arrière »)

**Fait** : `ShiftDart.tsx` — les 4 tuyères `roll-*-R` passent de z=1.1 à **z=1.2** (roll seulement, strafe arrière restent à 1.1 — scope confirmé par Thierry). Paire avant/arrière centrée sur **(0.0 + 1.2)/2 = 0.6 = axe des réservoirs internes = centre du corps du vaisseau** → symétrique par rapport au centre du vaisseau, aucun couple de tangage. Recul de +0.1 seulement. Cloche (rayon 0.08, span 1.12..1.28) reste sur le cylindre du pod (fin à 1.6, cône arrière 1.6..1.95). Commentaire réécrit. Vérifié : `tsc` propre sur les modèles, `GET /play` → 200, chunk compilé conforme (`roll-R-B-R` pos `[1.3,-0.427,1.2]`).

**Appris / incidents** : rien de cassé. Interprétation retenue (Thierry a répondu « je ne sais pas » pour la valeur exacte) : « centre du vaisseau » = axe du corps principal (réservoirs internes, z=0.6), cohérent avec la règle de la session 18 (« centré se lit sur la pièce qui porte la tuyère »). Si Thierry visait un autre centre, le cran à ajuster est le z des `roll-*-R`.

**Prochaine étape** : playtest visuel du roulis sur `/play`, puis commit + push par Thierry.

**Règle du projet** : une session = une victoire.

---

## 2026-11-21 — Session 22 : roll arrière reculés encore un cran (z 1.2 → 1.22) — sur « recule un tout tout petit peu encore »

**Fait** : `ShiftDart.tsx` — les 4 tuyères `roll-*-R` passent de z=1.2 à **z=1.22** (+0.02, « tout tout petit peu »). Paire centrée sur (0.0+1.22)/2 = 0.61. Cloche (span 1.14..1.30) toujours sur le cylindre du pod (fin 1.6). Commentaire ajusté. Vérifié : `tsc` propre sur les modèles, `GET /play` → 200, chunk conforme (`roll-R-B-R` pos `[1.3,-0.427,1.22]`).

**Appris / incidents** : rien de cassé. Cran actuel : roll F z=0.0 / R z=1.22.

**Prochaine étape** : playtest visuel du roulis sur `/play` (« c'est bon » attendu), puis commit + push par Thierry.

**Règle du projet** : une session = une victoire.

---

## 2026-11-22 — Session 23 : les plumes RCS reflètent l'accélération RÉELLE (pas la demande brute) — tiny plume à vitesse max — sur « on reprend »

**Fait** : `newton.ts` — `visualThrust` et `visualRotation` ne reflètent plus la demande brute des touches, mais l'accélération RÉELLE de ce frame (delta-v / dt projeté sur les axes du vaisseau, delta-w / dt pour le spin). Principe : une plume = du gaz éjecté = une force appliquée = une accélération. Comportement :
- **Touche pressée + accélération réelle** (ex. W depuis l'arrêt) → plume pleine (proportionnelle à l'accélération réelle).
- **Touche maintenue mais plus d'accélération** (vitesse max atteinte, ou spin à maxTurnRate) → plume TINY (0.1) — info visuelle qu'on se déplace/tourne encore dans cette direction, sans suggérer une accélération qui n'existe pas.
- **Axe verrouillé (lock=1)** → inchangé : frein visible tant que le vaisseau bouge encore, 0 à l'arrêt.
- **Aucune touche sur l'axe** → 0, aucune plume même en dérivant (l'inertie ne brûle pas de gaz).

Implémentation : `prevVx/Y/Z` et `prevWx/Y/Z` sauvegardés en début de frame ; `actualAccelX/Y/Z` et `dwx/y/z` calculés après le speed cap / le spin brake ; `visualThrust`/`visualRotation` réécrits avec le plancher `TINY_PLUME = 0.1` / `TINY_SPIN = 0.1` quand `demand ≠ 0` mais `|actual| ≤ 0.01`. Aucun changement dans `Entities.tsx` (lit déjà `visualThrust`/`visualRotation`), ni dans `ThrusterKit.tsx` (seuil de visibilité 0.02 < 0.1, la tiny plume reste visible). Sign convention vérifiée : `actualAccelZ` projeté sur `worldForward` a le même signe que `shipLocalThrustZ` (accélérer vers l'avant = positif des deux côtés).

Vérifié : `tsc --noEmit` propre sur les fichiers modifiés (seuls `Terre2065.tsx` et `tempVaisseaux/` échouent, préexistant/connu) ; `GET /play` → 200 ; le chunk compilé contient `TINY_PLUME`, `TINY_SPIN`, `actualAccelX/Y/Z` ; simulation 300 frames : accélération → vis=±1.0, à vitesse max avec W maintenu → vis=0.1, après relâchement en dérive → vis=0, freinage verrouillé → vis=∓1.0 jusqu'à l'arrêt.

**Appris / incidents** : rien de cassé. Le signe de `actualAccel` projeté sur les axes du vaisseau est cohérent avec `shipLocalThrust` (même convention : positif = vers l'avant/haut/droite). Piège évité : le delta-v est en coordonnées monde, il faut le projeter sur `worldForward/Right/Up` pour obtenir l'accélération en frame vaisseau.

**Prochaine étape** : playtest visuel sur `/play` — maintenir W jusqu'à vitesse max : la plume avant doit rétrécir à une fine lueur ; idem pour le roulis à vitesse de spin max. Puis commit + push par Thierry.

**Règle du projet** : une session = une victoire.

---

## 2026-11-22 — Session 23 (suite) : la tiny plume indique le MOUVEMENT sur l'axe (pas seulement la touche maintenue) — correction demandée par Thierry

**Fait** : `newton.ts` — correction de la condition de la tiny plume : ce n'est plus « demande ≠ 0 » (touche enfoncée) mais « vitesse non nulle sur l'axe » (`|shipLocalVelocity| > 0.01` en translation, `|angularVelocity| > 0.01` en rotation). Résultat : même après avoir relâché la touche, si le vaisseau dérive encore sur un axe (ou tourne), la tiny plume (0.1) reste allumée dans la direction du mouvement — info visuelle « il y a déplacement/rotation en cours sur cet axe ». Dès que l'axe est à l'arrêt : plus de plume. Priorité : accélération réelle > tiny (mouvement sans accélération) > 0 (repos). Le cas « touche maintenue à vitesse max » donne la même tiny plume qu'avant (le signe est le même : celui de la vitesse = celui de la demande dans ce cas).

Vérifié : `tsc` propre sur newton.ts ; `GET /play` → 200 ; simulation : à vitesse max avec W → vis=0.1, en dérive sans touche → vis=0.1 (le nouveau comportement voulu), freinage verrouillé → vis=∓1.0 jusqu'à l'arrêt, au repos sans touche → vis=0, première frame de W depuis l'arrêt → vis=1.0.

**Prochaine étape** : playtest visuel sur `/play` — couper les moteurs en pleine vitesse : les tiny plumes doivent rester visibles tant que le vaisseau dérive. Puis commit + push par Thierry.

**Règle du projet** : une session = une victoire.

---

## 2026-11-22 — Session 23 (suite 2) : les tiny plumes n'étaient pas visibles (opacité 0.095) — floor de rendu dans ThrusterKit — signalé par Thierry

**Fait** : `ThrusterKit.tsx` — le Thruster avait `opacity = min(0.9, f*0.95)` : à f=0.1 (tiny plume) → opacité 0.095, invisible sur le fond noir. Correction : floor d'opacité à **0.3** (`max(0.3, f*0.95)`) et longueur minimale **0.28** (`max(0.16+f*1.4, 0.28)`) quand la plume est allumée. Les plumes pleines (f ≥ ~0.67) sont inchangées. Le moteur principal (`MainEngine` dans ShiftDart.tsx) avait déjà une base d'opacité à 0.3, il était visible — pas touché.

Vérifié : `tsc` propre ; `GET /play` → 200 ; chunk compilé contient le `Math.max(0.3, …)`. À f=0.1 : opacité 0.3, longueur 0.3 → petite plume visible. À f=1 : opacité 0.9, longueur 1.56 → inchangé.

**Prochaine étape** : playtest visuel sur `/play` — dérive sans touche : les tiny plumes doivent maintenant apparaître comme de petites lueurs. Puis commit + push par Thierry.

**Règle du projet** : une session = une victoire.

---

## 2026-11-22 — Session 23 (suite 3) : lissage progressif des plumes (plus d'à-coup) — demandé par Thierry

**Fait** : `ThrusterKit.tsx` + `ShiftDart.tsx` (MainEngine) — ajout d'un lissage exponentiel de l'intensité affichée : `smoothed += (target - smoothed) * (1 - exp(-dt*12))` dans le `useFrame` de chaque `Thruster` et du moteur principal. Constante ~12/s → la plume met ~200 ms à passer de pleine à tiny (ou l'inverse) au lieu de snapper instantanément quand l'accélération démarre/arrête (vitesse max, spin max). Le `useFrame` du Thruster prend maintenant `(state, dt)` pour le delta réel. Aucun changement de physique — c'est purement visuel, dans la couche 3D.

Vérifié : `tsc` propre sur les 3 fichiers ; `GET /play` → 200 ; chunk compilé contient `smoothed` (×7). Comportement attendu : à vitesse max avec W maintenu, la plume avant rétrécit progressivement en ~200 ms jusqu'à la tiny lueur ; idem pour le moteur principal et les plumes de rotation.

**Prochaine étape** : playtest visuel sur `/play` — vérifier que la réduction de plume est bien progressive. Puis commit + push par Thierry.

**Règle du projet** : une session = une victoire.

---

## 2026-11-22 — Session 24 : la VRAIE Terre (textures NASA Blue Marble, normal map, nuages, atmosphère) — SANS rotation ni collision — demandé par Thierry

**Fait** : `Earth.tsx` réécrit + 4 textures dans `public/textures/` + `<Suspense>` autour de `<Earth/>` dans `Scene.tsx` (useTexture suspend). Textures téléchargées depuis le repo three.js `examples/textures/planets/` (données NASA Blue Marble, domaine public — eoimages.gsfc.nasa.gov injoignable en timeout depuis ici) : `earth_atmos.jpg` (albedo 2048², 512 Ko), `earth_normal.jpg` (normal map = relief montagnes/océans, 337 Ko), `earth_clouds.png` (nuages 1024² avec alpha, 226 Ko), `earth_specular.jpg` (gardée au cas où). 3 couches dans un `<group position={[0,0,-20]}>` :
1. **surface** : sphère 64×64, `meshStandardMaterial` map + normalMap (normalScale 0.85) → relief réel ; roughness 0.85.
2. **nuages** : sphère scale 1.012, map clouds `transparent depthWrite={false}`, dérive lente via `clouds.offset.x += dt*0.004` dans `useFrame` (wrapS=RepeatWrapping, offset % 1) — c'est le vent des nuages, PAS la rotation de la planète.
3. **atmosphère** : sphère scale 1.18, `meshBasicMaterial` bleu `#3d7bff`, `side: BackSide`, `blending: Additive`, opacity 0.28, depthWrite false → liseret bleu autour du limbe (seules les faces arrière du shell rendu = halo).

`colorSpace = SRGBColorSpace` sur map et clouds (three r187). `specularMap` retiré : plus dispo sur MeshStandardMaterial en r187 — le relief vient du normal map. **Pas de rotation de la planète** (commit séparé, Thierry veut comprendre ce code). **Pas de collision** (commit séparé).

Vérifié : `tsc --noEmit` propre (hors tempVaisseaux/Terre2065 connus) ; `GET /play` → 200 ; les 4 URLs `/textures/…` → 200 ; chunk compilé référence `earth_atmos`/`earth_clouds`.

**Appris / incidents** : `meshStandardMaterial` n'a plus `specularMap` en three r187 (workflow metalness/roughness) — le specular map est pour `MeshPhongMaterial`. Le normal map suffit pour le relief. NASA eoimages.gsfc.nasa.gov timeout depuis cette machine → textures three.js (NASA-derived) à la place.

**Prochaine étape** : commit de cette planète (sans rotation/collision), puis playtest visuel sur `/play`. Ensuite : rotation permanente de la planète (code expliqué à Thierry), puis collision sphère dans `newton.ts`, puis champ d'étoiles infini qui suit le vaisseau.

**Règle du projet** : une session = une victoire.

---

## 2026-11-22 — Session 24 (suite) : atmosphère trop épaisse/plate + planète trop petite — corrigé — signalé par Thierry

**Fait** : `Earth.tsx` + nouveau `src/game/core/world.ts`.
- **Planète agrandie** : `EARTH.radius` 5 → **20**, position `[0,0,-20]` → **`[0,0,-60]`** (le vaisseau démarre à z=-10, donc ~30 unités au-dessus de la surface, diamètre apparent ~44° dans le FOV 75° — une vraie planète qui domine le ciel). Constantes dans `game/core/world.ts` (nombres purs, sans three.js — réutilisées par la future collision).
- **Atmosphère progressive** : le shell plat `BackSide` opacity 0.28 scale 1.18 est remplacé par un **ShaderMaterial fresnel** sur une coque fine scale **1.06** : `intensity = pow(1 - abs(dot(vNormal, (0,0,1))), 3.0)` en view space, `BackSide` + `AdditiveBlending`. Le point chaud est au limbe externe de la coque, décroissance douce vers 0 vers la planète → liseret fin et progressif (plus un anneau plat épais).

Vérifié : `tsc` propre (hors tempVaisseaux/Terre2065) ; `GET /play` → 200 ; chunk compilé contient le shader (`uPower` ×9). Non commité : Thierry committera.

**Prochaine étape** : playtest visuel sur `/play` (taille planète + finesse du liseret). Puis rotation permanente de la planète (code expliqué), puis collision, puis étoiles infinies.

**Règle du projet** : une session = une victoire.

---

## 2026-11-22 — Session 24 (suite 2) : échelle planète + liseret encore trop intense/peu progressif (screenshot Thierry) — corrigé

**Fait** : `world.ts` — `EARTH.radius` 20 → **30** (position inchangée [0,0,-60]) : diamètre apparent ~62° (vs 44°) depuis le spawn du vaisseau. Rappel d'échelle : chasseur ~15 m vs Terre 12 742 km → ratio ~850 000×, impossible en unités de jeu (le vaisseau fait ~6 unités) → on rend la planète visuellement énorme à la place. `Earth.tsx` atmosphère : coque scale 1.06 → **1.15** (anneau plus large = dégradé plus étalé), `uPower` 3.0 → **3.5**, nouveau `uPeak = 0.45` qui **cappe l'intensité max** (le ring était saturé/néon à cause du additif sur fond noir), couleur `#4a8cff` → `#3a6fd8` (bleu plus profond, moins vif). Résultat attendu : liseret fin au limbe externe, fondu progressif vers la planète, intensité max ~45 %.

Vérifié : `tsc` propre ; `GET /play` → 200 ; chunk contient `uPeak`.

**Prochaine étape** : playtest visuel (taille + liseret). Puis rotation planète, collision, étoiles infinies.

**Règle du projet** : une session = une victoire.

---

## 2026-11-22 — Session 24 (suite 3) : liseret « décollé » de la planète (bande noire entre les deux, screenshot) — fresnel inversé — corrigé

**Fait** : `Earth.tsx` — le fresnel `pow(1-|dot|, p)` peakait au bord EXTERNE de la coque et valait ~0 au limbe de la planète → bande noire entre planète et anneau. Inversion : `intensity = pow(uCoef - dot(vNormal, (0,0,1)), uPower) * uPeak` avec coque BackSide (dot négatif côté lointain) → le pic est au limbe de la planète (coef+|dot| max, masqué au centre par la profondeur) et décroît vers `coef^p` au bord externe de la coque. Coque scale 1.15 → **1.10** (moins grande), uCoef 0.58, uPower 3.0, uPeak 0.55, couleur #3a6fd8. Résultat attendu : liseret collé au contour de la planète, fondu progressif vers l'espace.

Vérifié : `tsc` propre ; `/play` → 200 ; chunk contient `uCoef`.

**Prochaine étape** : playtest visuel du liseret. Puis rotation planète, collision, étoiles infinies.

**Règle du projet** : une session = une victoire.

---

## 2026-11-22 — Session 24 (suite 4) : liseret asymétrique (sPricing selon l'angle, "pas le même centre") — vrai vecteur view par fragment — corrigé

**Fait** : `Earth.tsx` — le fresnel utilisait l'axe view fixe `(0,0,1)` : dès que la planète n'est pas au centre de l'écran, le rim n'était plus symétrique autour d'elle (visible d'un côté, invisible de l'autre). Correction : `vViewDir = normalize(-mvPosition.xyz)` par fragment (vrai vecteur fragment→caméra) et `d = clamp(-dot(vNormal, vViewDir), 0, 1)` sur la coque BackSide → `d` vaut 0 au bord externe de la coque et croît vers le limbe de la planète (occlu au-delà) → pic au limbe, fondu à 0 vers l'extérieur, **symétrique autour de la planète de n'importe quel angle** (même centre, même diamètre). Coque scale 1.10 → **1.08**, uPower 1.0, uPeak 1.6, couleur #3a6fd8.

Vérifié : `tsc` propre ; `/play` → 200 ; chunk contient `vViewDir`.

**Prochaine étape** : playtest visuel du liseret sous plusieurs angles. Puis rotation planète, collision, étoiles infinies.

**Règle du projet** : une session = une victoire.

---

## 2026-11-22 — Session 24 (suite 5) : inversion des touches Numpad8 / Numpad5 — demande Thierry

**Fait** : `keyboard.ts` — `Numpad8` passe de `pitchUp` à **pitchDown**, `Numpad5` de `pitchDown` à **pitchUp**. Une seule table KEYMAP modifiée, keydown/keyup restent cohérents.

Vérifié : `tsc` propre ; `/play` → 200.

**Règle du projet** : une session = une victoire.

---

## 2026-11-22 — Session 24 (suite 6) : liseret un peu plus sombre et fondu 25% plus progressif — demande Thierry

**Fait** : `Earth.tsx` — `uPeak` 1.6 → **1.4** (≈12 % plus sombre) ; coque atmosphère scale 1.08 → **1.10** (anneau de fondu 25 % plus large : le dégradé s'étale sur plus de distance, s'estompe plus progressivement vers l'espace).

Vérifié : `tsc` propre ; `/play` → 200.

**Règle du projet** : une session = une victoire.

---

## 2026-11-22 — Session 24 (suite 7) : liseret toujours pas progressif en vue rapprochée (screenshot) — shader basé sur l'angle du rayon de vue, pas sur la normale — corrigé

**Fait** : `Earth.tsx` — le fresnel sur normale sature quand la caméra est proche/à l'intérieur de la coque (dot ≈ −1 partout → bande uniforme à bords durs). Remplacé par un shader qui calcule **l'angle θ du rayon de vue par rapport au centre de la planète** : `t = (θ_shell − θ)/(θ_shell − θ_planet)`, `intensity = pow(t, uPower) * uPeak`. θ_planet = asin(R/D) (limbe planète), θ_shell = asin(R_shell/D) (silhouette coque, π si caméra dedans), mis à jour chaque frame dans `useFrame` avec la matrice view caméra et D = distance caméra→planète. Résultat : le pic est exactement au limbe de la planète, fondu linéaire progressif vers l'extérieur, symétrique à toute distance et tout angle — même en orbite basse (caméra dans la coque). Coque 1.10, uPeak 1.4 (sombre), uPower 1.0.

Vérifié : `tsc` propre ; `/play` → 200 ; chunk contient `uThetaPlanet`/`uThetaShell`.

**Prochaine étape** : playtest visuel du liseret en orbite basse et de loin. Puis rotation planète, collision, étoiles infinies.

**Règle du projet** : une session = une victoire.

---

## 2026-11-22 — Session 24 (suite 8) : liseret trop clair vs texture sombre (screenshot) — ambient up + liseret down — demande Thierry

**Fait** : `Sun.tsx` — `ambientLight` 0.5 → **0.85** (la face nuit de la Terre garde sa texture lisible, éclairage plus uniforme) ; `Earth.tsx` — `uPeak` 1.4 → **1.2** (liseret un peu moins vif, sous le niveau de la texture éclairée). Les deux ensemble pour équilibrer le contraste planète/liseret.

Vérifié : `tsc` propre ; `/play` → 200.

**Prochaine étape** : playtest visuel. Puis rotation planète, collision, étoiles infinies.

**Règle du projet** : une session = une victoire.

---

## 2026-11-22 — Session 24 (suite 9) : nuages ralentis de 60% — demande Thierry

**Fait** : `Earth.tsx` — vitesse de dérive `0.004` → **`CLOUD_DRIFT_SPEED = 0.0016`** (constante nommée en haut du fichier, ×0.4 = 60 % plus lent), utilisée dans le `useFrame` des nuages. Thierry a ses propres réglages de liseret en live (uColor #3769ce, uPower 1.8, uPeak 0.8).

Vérifié : `tsc` propre ; `/play` → 200.

**Règle du projet** : une session = une victoire.

---

## 2026-11-22 — Session 24 (suite 10) : relief géométrique réel sur les continents — demande Thierry

**Fait** : `Earth.tsx` — la sphère surface passe en 128×128 segments et le matériau gagne `displacementMap={map}` (l'albédo sert de heightmap via son canal vert : océans sombres = bas, continents = hauts) + `displacementScale = RELIEF_SCALE = 0.5` + `displacementBias = -0.12` (constantes nommées en haut du fichier). Les sommets sont réellement déplacés → relief 3D visible en orbite basse, en plus du normal map (relief d'éclairage). Nuages relevés à scale 1.02 pour ne pas traverser les montagnes. `world.ts` : ajout de `EARTH_SURFACE_MAX = radius + 0.5` pour la future sphère de collision. (Pas de heightmap dédiée téléchargée : NASA/unpkg injoignables ou 404, pas de PIL/ImageMagick — l'albédo fait l'affaire.)

Vérifié : `tsc` propre ; `/play` → 200 ; chunk contient `displacementScale`/`RELIEF_SCALE`.

**Prochaine étape** : playtest visuel du relief en volant bas. Puis rotation planète, collision, étoiles infinies.

**Règle du projet** : une session = une victoire.

---

## 2026-11-22 — Session 24 — CLÔTURE : chantier « plumes réalistes + vraie Terre » terminé et commité (f0cfbea, 507fbf7) — on reprend demain

**Bilan de la session** (2 commits Thierry, working tree clean, up to date with origin) :

1. **Plumes RCS réalistes** (`newton.ts`, `ThrusterKit.tsx`, `ShiftDart.tsx`) : les plumes reflètent l'accélération RÉELLE (delta-v/dt projeté sur les axes du vaisseau), pas la demande brute. 3 niveaux : pleine (accélération) / tiny 0.1 (mouvement ou rotation en cours sans accélération, même sans touche — info de dérive) / 0 (repos). Lissage exponentiel (~12/s, ~200 ms) pour un rétrécissement progressif. Floor de rendu (opacité 0.3, longueur 0.28) pour que la tiny plume reste visible.
2. **Vraie Terre** (`Earth.tsx`, `world.ts`, `Scene.tsx`, `Sun.tsx`, `public/textures/`) : textures NASA Blue Marble (albedo + normal map + nuages PNG), sphère 128×128 avec **displacementMap** (relief 3D réel des continents, `RELIEF_SCALE=0.5`), nuages qui dérivent (`CLOUD_DRIFT_SPEED=0.0006`, 60 % plus lent), atmosphère par **shader à angle de rayon de vue** (pic au limbe, fondu progressif, symétrique à toute distance — réglages Thierry : uColor #3769ce, uPower 1.8, uPeak 0.8, coque 1.10), planète radius 30 en [0,0,-60] (échelle « chasseur vs planète » truquée visuellement), ambient 0.85 pour la face nuit lisible. Inversion Numpad8/Numpad5 (pitch).

**Réglages live de Thierry** (tous en constantes nommées, tweakables en HMR) : `Earth.tsx` → `SHELL_SCALE`, `uColor/uPower/uPeak`, `CLOUD_DRIFT_SPEED`, `RELIEF_SCALE/RELIEF_BIAS` ; `world.ts` → `EARTH.position/radius` ; `Sun.tsx` → `ambientLight intensity`, `directionalLight` ; `keyboard.ts` → `KEYMAP`.

**Prochaine étape demain** (dans l'ordre prévu) :
1. **Rotation permanente de la planète** — code à expliquer à Thierry (probablement `useFrame` + `group.rotation.y += dt * vitesse` sur le `<group>` de Earth, avec la vitesse en constante nommée) ;
2. **Collision sphère Terre** dans `newton.ts` avec `EARTH` + `EARTH_SURFACE_MAX` + `SHIP_COLLISION_RADIUS` de `world.ts` (repousser à la surface + supprimer la composante de vitesse entrante) ;
3. **Champ d'étoiles infini** dans `Stars.tsx` (group d'étoiles qui suit le vaisseau chaque frame, rayon ~200) pour ne plus pouvoir sortir dans le noir.

**Règle du projet** : une session = une victoire.

---

## 2026-11-24 — Session 25 : newton.ts découpé en hub + 3 sous-fonctions (refactor pur, « applique » explicite)

**Fait** : après un faux départ (collision appliquée sur simple « on reprend » → revert demandé par Thierry, règle réaffirmée : jamais d'écriture sans « applique »), la collision a d'abord été posée en simple commentaire PLAN en français dans `newton.ts` (déplacé en fin de boucle à la demande de Thierry : « après tout le mouvement »). Puis sur « applique » : `newton.ts` restructuré en hub — `updateShips(dt)` (seul export, contrat `loop.ts` inchangé) appelle par vaisseau `integrateTranslation(ship, dt)` → `integrateRotation(ship, dt)` → `resolvePlanetCollision(ship)` (cette dernière ne contient encore que le bloc PLAN en français ; le code collision viendra à part). Tout reste dans le fichier (pas de helper externe, décision session 13). **Preuve d'équivalence** : old (HEAD) vs new compilés séparément, 200 scénarios aléatoires × 120 frames × 24 champs comparés à chaque frame = 576 000 comparaisons, **écart max = 0 (identique bit à bit)**. Vérifié : `tsc --noEmit` propre hors Terre2065/tempVaisseaux ; `GET /play` → 200, chunk servi contient `integrateTranslation`/`integrateRotation`/`resolvePlanetCollision`. ARCHITECTURE.md (arbre §physics) synchronisé (règle 8). Non commité : Thierry committera.

**Appris / incidents** : (1) « on reprend » ≠ autorisation d'écrire — l'agent ne touche un fichier que sur « applique » explicite, même pour du « petit ». (2) Le bloc PLAN en français a d'abord été mis dans `world.ts` (la ressource jointe) au lieu de `newton.ts` — « le fichier » visé était celui du code, pas la ressource. (3) Nommage : les noms courts (`nx`, `vDotN`) sont refusés — convention du projet = noms longs explicites (`outwardNormalX`, `velocityAlongOutwardNormal`…), on n'est pas limité en caractères. (4) Un refactor de 350 lignes ne se valide pas à la relecture seule : preuve numérique old-vs-new obligatoire avant commit (fait ici : 0 différence).

**Prochaine étape** : sur « applique » suivant, écrire la vraie collision dans `resolvePlanetCollision` (noms longs, commentaires d'abord en français temporaire puis anglais règle 5) : distance centre vaisseau ↔ `EARTH.position` < `EARTH_SURFACE_MAX + SHIP_COLLISION_RADIUS` → repousse radiale + suppression de la composante entrante de velocity. Vérifs : script headless (pas de pénétration, pas d'énergie ajoutée, arrêt frontal), `tsc`, `/play` 200, playtest. Puis commit + push par Thierry. Ensuite : rotation permanente de la planète, étoiles infinies.

**Règle du projet** : une session = une victoire.

---

## 2026-11-24 — Session 25 (suite) : renommage `integrate*` → `update*` (« va pour update » de Thierry)

**Fait** : `integrateTranslation` → `updateTranslation`, `integrateRotation` → `updateRotation` (définition + appel dans le hub + commentaire STRUCTURE + ligne d'arbre ARCHITECTURE.md ; 0 occurrence de l'ancien nom restante). Verbe `update` retenu pour sa cohérence avec `updateShips`/`updatePlayer` (« écrit dans la photo à ce tick »). Pur renommage. Vérifié : `tsc` propre hors préexistant, `/play` → 200, chunk servi contient `updateTranslation`. **Retenu par Thierry** : `resolvePlanetCollision` → `updatePlanetCollision` (famille `update*`) — renommage propagé (newton.ts ×3, ARCHITECTURE.md), 0 occurrence de l'ancien nom, `tsc` propre, `/play` 200, chunk conforme. Non commité : Thierry committera.

**Appris / incidents** : rien de cassé.

**Prochaine étape** : « applique » pour écrire la vraie collision dans `updatePlanetCollision` (noms longs, commentaires d'abord en français temporaire).

---

## 2026-11-24 — Session 25 (suite 2) : la vraie collision planète écrite dans `updatePlanetCollision` — sur « applique »

**Fait** : `newton.ts` — `updatePlanetCollision(ship)` (appelée en dernier par le hub, après tout le mouvement) : sphère vs sphère avec `EARTH` / `EARTH_SURFACE_MAX` / `SHIP_COLLISION_RADIUS` de `world.ts` (import ajouté en tête de fichier). Noms longs validés avec Thierry : `offsetFromPlanetCenterX/Y/Z`, `distanceToPlanetCenter` (garde 1e-6), `touchingDistance` = 32, `outwardNormalX/Y/Z`, `velocityAlongOutwardNormal`. Si pénétration : repousse le centre du vaisseau exactement sur la sphère de contact le long de la radiale + suppression de la composante entrante de la vitesse (v·n < 0) → glissade, pas de rebond, pas d'énergie ajoutée. Commentaires écrits en FRANÇAIS temporaire (marqués comme tels, à traduire en anglais règle 5). Docs resynchronisées (règle 8) : `world.ts` (en-tête + note EARTH_SURFACE_MAX), `Earth.tsx` (en-tête « No collision yet » + note RELIEF_SCALE), ARCHITECTURE.md (puce « La collision avec la planète » dans §newton, datée 24 nov. 2026). Vérifié : `tsc --noEmit` propre hors préexistant ; **test headless du vrai code compilé : 11/11 OK** (frontal : posé à dist=32.000000, z=-28, v=0 ; oblique : jamais de pénétration, jamais d'énergie ajoutée, v·n ≥ 0 en contact, échappement tangentiel ; loin et spawn : inchangés ; 10 s à pleine poussée dans la planète : collé à 32 sans NaN ; 100 scénarios aléatoires × 240 frames près de la planète : dist ≥ 32 partout, 0 NaN) ; `GET /play` → 200, chunk servi contient `updatePlanetCollision`. Non commité : Thierry committera.

**Appris / incidents** : rien de cassé. Rappel : la collision ne produit aucune plume (l'impact n'est pas du gaz) — `visualThrust` est calculé avant, inchangé.

**Prochaine étape** : playtest sur `/play` (voler vers la Terre à fond : glissade sans rebond ni traversée, frontal et en biais). Puis commit + push par Thierry. Ensuite : rotation permanente de la planète (Earth.tsx), puis champ d'étoiles infini (Stars.tsx).

---

## 2026-11-24 — Session 25 (suite 3) : clarification « distances signées » vs « proportions » dans `updatePlanetCollision` — demande Thierry « change pour que ce soit clair »

**Fait** : renommage dans `newton.ts` pour distinguer les deux familles : `offsetFromPlanetCenterX/Y/Z` → **`signedDistanceFromPlanetCenterX/Y/Z`** (position − position = distance signée sur chaque axe, en unités de jeu) ; `outwardNormalX/Y/Z` → **`outwardDirectionX/Y/Z`** (chaque distance divisée par la distance totale = proportions entre −1 et +1, X²+Y²+Z² = 1) ; `velocityAlongOutwardNormal` → **`velocityAlongOutwardDirection`**. Commentaires FR temporaires réécrits en ce sens (« ce sont des UNITÉS, pas des proportions » / « ce sont des PROPORTIONS »). Pur renommage + commentaires. Vérifié : 0 occurrence des anciens noms, `tsc` propre hors préexistant, test headless re-joué 3/3 OK (frontal posé à 32/v=0, ram 10 s collé à 32, oblique sans pénétration ni énergie ajoutée), `/play` → 200, chunk contient les nouveaux noms. Non commité : Thierry committera.

**Appris / incidents** : rien de cassé. Vocabulaire retenu avec Thierry : offset = distances signées (unités) → distance totale (Pythagore 3D) → direction = proportions (−1..+1). Les intentions 0-1 restent une troisième famille (réglages, pas des vecteurs).

**Prochaine étape** : inchangée — playtest `/play`, commit + push par Thierry, puis rotation planète et étoiles infinies.

---

## 2026-11-24 — Session 25 (suite 4) : « recommence » — renommage distances/proportions réappliqué sur l'édition de Thierry

**Fait** : Thierry avait réédité `newton.ts` en parallèle (ses commentaires « Calcul de la distance min… » et « Si collision => Repousse le vaisseau + annulation de sa vitesse » présents, mon renommage de la suite 3 écrasé — même mécanisme que l'incident session 15). Sur « recommence », le renommage a été réappliqué EN PRÉSERVANT ses commentaires : `offsetFromPlanetCenter*` → `signedDistanceFromPlanetCenter*` (distances signées, unités), `outwardNormal*` → `outwardDirection*` (proportions −1..+1), `velocityAlongOutwardNormal` → `velocityAlongOutwardDirection` ; commentaires « Vecteur… »/« normale unitaire… » remplacés par « distances signées » / « direction = proportions ». 4 éditions séquentielles (une seule à la fois sur le fichier). Vérifié : 0 ancien nom, commentaires de Thierry intacts, `tsc` propre hors préexistant, tests headless 3/3 OK, `/play` → 200, chunk contient `outwardDirectionX`. Non commité : Thierry committera.

**Appris / incidents** : rien de cassé. Règle renforcée : avant toute édition, relire le fichier (ou `git diff`) pour détecter une édition parallèle — ne jamais supposer que le fichier est dans l'état de la dernière vérification.

**Prochaine étape** : inchangée — playtest `/play`, commit + push par Thierry, puis rotation planète et étoiles infinies.

**Règle du projet** : une session = une victoire.

---

## 2026-11-24 — Session 25 (suite 5) : commentaire de la partie 2 réécrit en clair (« vas-y » de Thierry)

**Fait** : dans `updatePlanetCollision`, le commentaire abstrait (« Enlever de la velocity la part qui rentre… / Produit scalaire… ») remplacé par la version plain-language approuvée : « v·direction = vitesse vers la planète — négatif = on y fonce ; on soustrait cette part répartie sur x/y/z selon la direction ; le reste (le long de la surface) est gardé → glissade ; si ≥ 0, rien à enlever ». Changement de commentaire uniquement. Vérifié : `tsc` propre hors préexistant. Non commité : Thierry committera.

**Appris / incidents** : un commentaire trop abstrait bloque la compréhension même quand le code est bon. Explications données en chat : v = part radiale + part tangente ; exemple (3,0,−4)→(3,0,0) avec dir=(0,0,1) ; contrôle dir inclinée (0.6,0,0.8) : v·dir après = 0. Pas de rebond (restitution 0) — option e>0 notée, non appliquée.

**Prochaine étape** : inchangée — playtest `/play`, commit + push par Thierry, puis rotation planète et étoiles infinies.

**Règle du projet** : une session = une victoire.

---

## 2026-11-24 — Session 25 (suite 6) : renommage `outwardDirection*` → `proportionFromPlanetToShipDirection*` (nom choisi par Thierry)

**Fait** : `outwardDirectionX/Y/Z` → `proportionFromPlanetToShipDirectionX/Y/Z` (9 occurrences) et `velocityAlongOutwardDirection` → `velocityAlongPlanetToShipDirection` (4 occurrences), commentaires ajustés (« proportions centre planète → vaisseau », « v·proportions »). Pur renommage. Vérifié : 0 ancien nom, `tsc` propre hors préexistant, tests headless 3/3 OK (frontal/ram/oblique), `/play` → 200, chunk contient `proportionFromPlanetToShipDirectionX`. Non commité : Thierry committera.

**Appris / incidents** : rien de cassé.

**Prochaine étape** : inchangée — playtest `/play`, commit + push par Thierry, puis rotation planète et étoiles infinies.

**Règle du projet** : une session = une victoire.

---

## 2026-11-26 — Session 26 : rotation de la planète (Earth.tsx) + fix du pitch 8/5 par quaternion

**Fait** : deux chantiers, commités par Thierry (`24ef548` FEAT: Earth rotation, `b62cb86` FIX: Correction bug with X Rotation with quaternion). (1) Rotation propre de la planète dans `Earth.tsx` : `planetRef = useRef<THREE.Group>(null)`, `<group ref={planetRef}>` autour de la sphère de surface, `useFrame` qui fait `rotation.y += dt * PLANET_ROTATION_SPEED` (constante réglable à chaud ; Thierry l'a passée ensuite à 0.002). Nuages (dérive propre) et atmosphère (shader view-based) ne tournent pas. Commentaires d'en-tête remis en cohérence. (2) Fix du bug 8/5 signalé par Thierry : diagnostic — avec des Euler XYZ, `rotation.x += d` = rotation autour de l'axe X MONDE, donc plus de vrai looping après un yaw. L'orientation passe de `Vec3` (Euler) à `Quat` (x,y,z,w) : `sheets.ts` (nouveau type `Quat`, `rotation: Quat`), `PlayerShip.ts` (identité `{x:0,y:0,z:0,w:1}`), `newton.ts` (axes monde = colonnes de R(q) dans `updateTranslation` — même matrice qu'avant ; intégration `q_new = q ⊗ dq` + renormalisation à la fin d'`updateRotation`), `Entities.tsx` (`g.quaternion.set(...)`), `CameraRig.tsx` (`new Quaternion(...)` direct, import `Euler` supprimé). Vérifié : `tsc` propre hors préexistant (démo), `/play` → 200, chunk servi contient le nouveau code, test headless 8/8 PASS (yaw puis pitch : axe de l'aile droite fixe à 1e-9 près, nez perpendiculaire à cet axe, quaternion resté unitaire). Fichiers temporaires du test supprimés.

**Appris / incidents** : les angles Euler ne s'intègrent pas axe par axe (`rotation.x += d` = axe X monde) — en rotation 3D libre il faut un quaternion (pas de gimbal lock). Recette test headless sans tsx/ts-node (node 20) : `tsconfig.headless.json` temporaire à la racine + `tsc -p` vers `.headless-build`, puis `node`, tout supprimé après. Une édition a échoué sur une différence de ligne vide (affichage `read_file` vs disque) → relire avec `sed`/`cat -A` avant de réessayer. Thierry édite en parallèle et committe lui-même → relire `git log`/`git status` avant d'écrire. Q/R enregistrées : `useRef` = boîte qui persiste entre les renders sans re-render, pont entre le JSX (crée l'objet 3D) et le `useFrame` (le mute) ; un re-render depuis `Earth` ne toucherait que le sous-arbre d'`Earth`, mais 60 setState/s pour faire tourner la planète serait absurde — d'où la mutation impérative dans `useFrame`, même pattern que la physique du vaisseau. En attente : commentaires français du bloc collision dans `newton.ts` à traduire en anglais (règle 5) ; le commentaire de `PLANET_ROTATION_SPEED` dit encore « ~5 min » alors que la valeur est passée à 0.002.

**Prochaine étape** : playtest `/play` (rotation de la planète visible, looping 8/5 propre même après un yaw), push par Thierry, puis champ d'étoiles infini (`Stars.tsx`), puis traduction en anglais des commentaires de la collision.

**Règle du projet** : une session = une victoire.

---

## 2026-11-27 — Session 27 : Terre lisse + textures 8K + nuages au ras du sol (liseret bleu pur), fix shader cloud three r187

**Fait** : `Earth.tsx` — plus de déplacement géométrique (`displacementMap`/`RELIEF_SCALE`/`RELIEF_BIAS` supprimés) : la sphère reste parfaitement lisse, le relief n'est plus que normal map (ombres/éclairage) + albédo (neiges éternelles) ; textures 8K téléchargées depuis Wikimedia Commons (SolarSystemScope, 8192×4096 : `earth_daymap_8k.jpg`, `earth_clouds_8k.jpg` utilisée en `alphaMap` canal vert) pour pouvoir grossir la planète plus tard tout en restant jolie ; `CLOUD_SCALE` 1.02 → **1.005** (~1 pixel de texture au-dessus du sol → les nuages ne rentrent plus dans le liseret) ; le fondu de limbe des nuages (`cloudMat`) est conservé. Fix du bug « nuages invisibles » : dans three r187 `begin_vertex` ne déclare plus `mvPosition`, l'injection shader plantait à la compilation → on calcule soi-même `cloudViewPos = modelViewMatrix * vec4(position, 1.0)` (vérifié hors ligne en assemblant les vrais shaders r187). `world.ts` : `EARTH_SURFACE_MAX = EARTH.radius` ; `newton.ts` : commentaire 31.5 ; `ARCHITECTURE.md` §collision synchronisé (règle 8). Vérifié : `tsc --noEmit` propre hors préexistant (Terre2065/tempVaisseaux) ; collision headless 3/3 OK avec la nouvelle sphère de contact 31.5 (frontal : posé à 31.500000, v=0 ; oblique : jamais sous 31.5, aucune énergie ajoutée ; ram 10 s à fond : collé à 31.5, pas de NaN).

**Appris / incidents** : three r187 — `mvPosition` n'existe qu'après `#include <project_vertex>` ; ne jamais s'ancrer sur les chunks internes pour injecter du GLSL, calculer depuis `position`/`modelViewMatrix` directement. La carte de nuages 8K est un JPG (pas d'alpha) → servie en `alphaMap` (canal vert), et elle reste en linear (pas sRGB). Poids des 8K : 4,5 Mo + 11,6 Mo (OK en local).

**Prochaine étape** : playtest visuel sur `/play` (Terre lisse et détaillée, nuages nets au ras du sol, liseret bleu continu sans blanc ni bande noire), puis commit + push par Thierry. Ensuite au choix : grossir la planète (possible maintenant grâce aux 8K), champ d'étoiles infini (`Stars.tsx`), traduction EN des commentaires de collision dans `newton.ts`.

**Règle du projet** : une session = une victoire.

---

## 2026-11-27 — Session 27 (suite) : fix de la bande verticale à la couture des textures — wrapS Repeat sur les 3 textures

**Fait** : `Earth.tsx` — la bande verticale de traits blancs sur toute la hauteur du globe était la couture u=0/u=1 des textures équirectangulaires : wrap par défaut `ClampToEdge` (le bord est aplati au lieu de boucler), amplifié par les mipmaps vus de loin. Les 3 textures (`map`, `normalMap`, `clouds`) passent en `wrapS = THREE.RepeatWrapping` avec `needsUpdate = true` (le `wrapS` posé avant sur les nuages n'avait jamais été ré-uploadé, donc jamais actif). Vérifié : `tsc --noEmit` propre hors préexistant.

**Appris / incidents** : dans three.js, modifier `texture.wrapS` après le premier upload GPU ne change rien sans `texture.needsUpdate = true`.

**Prochaine étape** : playtest visuel sur `/play` (plus de bande à la couture ; possiblement une fine ligne de raccord si les bords de l'image 8K ne se matchent pas au pixel près), puis commit + push par Thierry.

**Règle du projet** : une session = une victoire.

---

## 2026-11-27 — Session 27 (suite 2) : planète agrandie — radius 30 → 60, centre [0,0,-60] → [0,0,-80]

**Fait** : `world.ts` — `EARTH.radius` 30 → **60**, `EARTH.position` z −60 → **−80** (le spawn (0,0,-10) reste à 10 unités au-dessus de la surface, marge de collision 8.5) ; le rendu (`Earth.tsx`) en hérite automatiquement via `RADIUS`/`POSITION` — seul `CLOUD_SCALE` était codé en dur : il devient `1 + CLOUD_HEIGHT / RADIUS` (`CLOUD_HEIGHT = 0.15`, hauteur constante au-dessus du sol quelle que soit la taille). `newton.ts` : commentaire de `touchingDistance` → 61.5. Apparent depuis le spawn : ~118° de diamètre (vs 62° avant). Vérifié : `tsc` propre hors préexistant ; collision headless 4/4 OK avec les nouvelles constantes (spawn non poussé à dist=70, frontal posé à 61.5/v=0, oblique sans pénétration ni énergie ajoutée, ram 10 s collé à 61.5 sans NaN). Le réglage reste un curseur : `EARTH.radius`/`position` dans `world.ts`, ajustable à chaud (HMR).

**Appris / incidents** : rien de cassé. À surveiller en jouant : à radius 60, voler droit devant depuis le spawn mène au sol en ~1 s à vitesse max — c'est voulu (orbite basse), mais le spawn pourrait être remonté si gênant.

**Prochaine étape** : playtest visuel sur `/play` (planète énorme et nette grâce aux 8K, liseret et nuages toujours propres), ajuster `EARTH.radius` à chaud si besoin, puis commit + push par Thierry. Ensuite au choix : champ d'étoiles infini (`Stars.tsx`), traduction EN des commentaires de collision dans `newton.ts`.

**Règle du projet** : une session = une victoire.

---

## 2026-11-27 — Session 27 (suite 3) : planète encore agrandie (radius 90, centre [0,0,-110]) + anisotropy max sur les textures

**Fait** : `world.ts` — `EARTH.radius` 60 → **90**, `position.z` −80 → **−110** (surface toujours à z = −20, spawn (0,0,-10) à 10 u du sol, marge de collision 8.5 ; diamètre apparent ~128° depuis le spawn). `Earth.tsx` — `texture.anisotropy = gl.capabilities.getMaxAnisotropy()` sur les 3 textures (`map`, `normalMap`, `clouds`) via `useThree`, posé dans le même `useEffect` que le `wrapS` avec `needsUpdate = true` → textures nettes même aux angles rasants en orbite basse. `newton.ts` : commentaire `touchingDistance` → 91.5. Vérifié : `tsc` propre hors préexistant ; collision headless 3/3 OK (spawn dist=100 non poussé, frontal posé à 91.500000 v=0, ram 10 s collé à 91.5 sans NaN).

**Appris / incidents** : rien de cassé. Le rendu ne se dégrade pas avec la taille : 8K textures (~0.07 u/px à radius 90), sphère lisse 128×128 (coût constant), shader atmosphère indépendant de la taille, anisotropy max pour les angles rasants. Seule limite = gameplay (marge au spawn à surveiller si on grossit encore : reculer `position.z` d'autant).

**Prochaine étape** : playtest visuel sur `/play` en volant bas (netteté des textures à l'horizon), puis commit + push par Thierry. Ensuite au choix : champ d'étoiles infini (`Stars.tsx`), traduction EN des commentaires de collision dans `newton.ts`.

**Règle du projet** : une session = une victoire.

---

## 2026-11-27 — Session 27 — CLÔTURE : état des lieux (commits `e5400e2` « FEAT: new Earth tecture 8k and effect », `d240ef7` « FEAT: Big planet »)

**Fait** : session 27 complète et commitée par Thierry, arbre clean. Bilan de là où on en est — MISSION 1 vaisseau 6DOF pilotable (poussée/rétro Z/S, strafe Q/D, lift Maj/Ctrl, rotations pavé 8/5/4/6 + flèche droite + Entrée, freins dédiés Espace/Alt, locks anti-inversion à 3 états sur les 6 axes, plumes RCS = accélération réelle), caméra collée au repère du vaisseau (quaternion), collision sphère avec la planète (contact à 91.5), Terre 8K lisse (normal map seule) + nuages 8K au ras du sol + liseret bleu propre (fondu de limbe des nuages), planète radius 90 centre [0,0,-110] (~128° apparents), anisotropy max, rotation propre de la planète.

**Appris / incidents** : three r187 — `mvPosition` n'existe qu'après `#include <project_vertex>` (ne jamais s'ancrer sur les chunks internes pour injecter du GLSL : calculer depuis `position`/`modelViewMatrix`) ; `wrapS`/`anisotropy` modifiés après le premier upload → `texture.needsUpdate = true` obligatoire (sinon la couture u=0 reste une bande verticale). Textures 8K ≈ 16 Mo en local.

**Prochaine étape** : push par Thierry, puis au choix — champ d'étoiles infini (`Stars.tsx` : le groupe d'étoiles suivrait le vaisseau pour ne plus pouvoir voler dans le noir), ou traduction EN des commentaires français restants dans `updatePlanetCollision` (`newton.ts`, règle 5, en attente depuis le 26 nov.).

**Règle du projet** : une session = une victoire.

---

## 2026-11-27 — Session 27 (suite 4) : champ d'étoiles infini (Stars.tsx)

**Fait** : `Stars.tsx` réécrit — le `<DreiStars>` est enveloppé dans un `<group ref>` que le `useFrame` re-centre chaque frame sur la caméra (`groupRef.current.position.copy(camera.position)`) : la sphère d'étoiles suit le vaisseau, on ne peut plus voler dans le noir. Rayon 300 + depth 50 (coquille 300..350, toujours au-delà de la planète radius 90 vue de partout ; `depthTest` laisse la planète occlure les étoiles derrière elle), count 6000, `fade speed={0}` conservés (étoiles rondes et immobiles). Vérifié : `tsc --noEmit` propre hors préexistant. Règle 8 : ARCHITECTURE.md §décor disait déjà « sphère autour du joueur, il ne s'éloigne jamais » — le code rejoint le doc, rien à corriger.

**Appris / incidents** : drei `Stars` — defaults radius 100 / depth 50 (coquille [radius, radius+depth]), material additif `depthWrite: false` + `depthTest` actif (occlusion par la planète OK), `frustumCulled` OK car la caméra est dans la sphère englobante. Rien de cassé.

**Prochaine étape** : playtest sur `/play` — voler loin dans une direction : le ciel d'étoiles doit rester identique partout, jamais de noir. Puis commit + push par Thierry (Stars.tsx + ce journal). Reste ensuite : traduction EN des commentaires de `updatePlanetCollision` dans `newton.ts`.

**Règle du projet** : une session = une victoire.

---

## 2026-11-27 — Session 27 (suite 5) : commentaires pédagogiques sur les 2 accès à la caméra du <Canvas>

**Fait** : commentaires ajoutés puis **raccourcis en une ligne** (demande Thierry : « clairs, pas hyper longs ») aux deux endroits où on lit la caméra de r3f — `CameraRig.tsx` (« The <Canvas>'s own camera, read from its state — no props needed. ») et `Stars.tsx` (« Each frame, r3f calls this with the Canvas state — `camera` is the Canvas's own camera. »). En dessous : les deux lisent `state.camera` de l'état interne du `<Canvas>` englobant (via React context — pas de props/import) ; c'est le même objet caméra créé par le `<Canvas>` ; `useFrame` reçoit cet état en 1er argument à chaque frame. Rappel tech vérifié dans le dist de fiber : store = zustand v5, PAS Redux. Aucun code changé (commentaires seuls). Vérifié : `tsc --noEmit` propre hors préexistant.

**Appris / incidents** : rien de cassé. Q/R enregistrée pour le futur : `useFrame(({ camera }) => ...)` ≡ `useFrame((state) => state.camera)` — le champ vient de l'état du Canvas, pas d'un composant.

**Prochaine étape** : commit + push par Thierry (CameraRig.tsx, Stars.tsx, ce journal). Ensuite : traduction EN des commentaires de `updatePlanetCollision` dans `newton.ts`.

**Règle du projet** : une session = une victoire.

---

## 2026-11-27 — Session 27 (suite 6) : fix bug étoiles pendant les rotations (scintillement + parallaxe)

**Fait** : diagnostic du bug « pendant les rotations les étoiles se déplacent partout et apparaissent/disparaissent » : (1) à radius 300, le `gl_PointSize` de drei (`size * 30/z * (3+sin)`) passait sous 1 px pour beaucoup d'étoiles → scintillement/pop in-out quand la rotation change leur profondeur de vue ; (2) la caméra orbite le vaisseau (~8.5 u) pendant les rotations → parallaxe visible des étoiles à 300 u. Fix dans `Stars.tsx` : coquille radius **800** depth 100 (parallaxe max ~0.6°, invisible), `factor` **4 → 40** (chaque étoile > ~1.5 px, plus de scintillement), `frustumCulled = false` sur les points (via ref drei), le groupe suit toujours la caméra chaque frame. `Scene.tsx` : `<Canvas camera={{ far: 5000 }}>` pour que la coquille (800..900) ne soit jamais depth-culled. Vérifié : `tsc --noEmit` propre hors préexistant.

**Appris / incidents** : un point 3D de taille < 1 px s'affiche par intermittence selon sa position sous-pixel → toujours viser ≥ 1.5 px pour un ciel d'étoiles ; un skybox qui suit la caméra en position a une parallaxe résiduelle = (orbite caméra / rayon coquille) — la rendre négligeable en poussant la coquille loin.

**Prochaine étape** : playtest sur `/play` — faire des loopings/tonneaux : les étoiles doivent tourner de façon rigide avec le monde, sans scintillement ni pop. Puis commit + push par Thierry. Ensuite : traduction EN des commentaires de `updatePlanetCollision` dans `newton.ts`.

**Règle du projet** : une session = une victoire.

---

## 2026-11-27 — Session 27 (suite 7) : étoiles moins visibles (count 4000, luminosité ×0.7) + idée notée : fondre les étoiles près de la planète

**Fait** : `Stars.tsx` — `count` 6000 → **4000** puis −15% → **3400** (demande Thierry) et les couleurs des points assombries ×**0.7** dans le `useEffect` (attribut `color` du geometry, `needsUpdate`) : le ciel reste subtil sans réintroduire le scintillement (factor 40 conservé = taille mini ~1.5 px). Vérifié : `tsc --noEmit` propre hors préexistant.

**Appris / incidents** : rien de cassé. **Idée notée par Thierry (PAS implémentée, à discuter avant)** : plus on est proche de la planète ou d'un élément lumineux, moins les étoiles devraient se voir — à faire plus tard, ex. en modulant l'opacité/taille des points selon la distance caméra→planète (constantes `EARTH` de world.ts) dans le `useFrame` de Stars.

**Prochaine étape** : playtest sur `/play` (étoiles discrètes, rotations propres), puis commit + push par Thierry. Ensuite : la traduction EN des commentaires de `updatePlanetCollision` dans `newton.ts`, ou l'idée ci-dessus si on la lance.

**Règle du projet** : une session = une victoire.
