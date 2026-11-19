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
