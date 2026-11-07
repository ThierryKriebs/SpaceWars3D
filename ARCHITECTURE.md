# ARCHITECTURE — Space Wars 3D

La carte du chantier : qui va où, et pourquoi. Les dossiers naissent quand leur contenu existe — jamais de dossier vide.

> **⚠️ DOCUMENT CONTRAIGNANT POUR TOUT AGENT DE CODAGE.**
> Ce fichier décrit l'architecture *actée* du projet. Chaque décision qui y figure (les principes, l'arbre, les règles de circulation, les contradictions tranchées) a été débattue et validée par Thierry — elle n'est **pas négociable, pas "améliorable", pas optionnelle**. Avant de créer un fichier ou un dossier, tu dois pouvoir répondre à : *"dans ce document, où est-ce que ça va ?"* Si la réponse n'y figure pas : **demande, ne devine pas** (charte, règle 4). Si un besoin te semble exiger de violer une règle ci-dessous : **arrête-toi et expose le conflit** (charte, règle 7). Ce document évolue par décision écrite ici d'abord, code ensuite.

---

## Les cinq grands principes

1. **`app/` reste minuscule** : une page Next.js ne fait que *brancher* (import d'une scène 3D en `ssr: false`). Zéro calcul dedans.
2. **UNE SEULE boucle de jeu** : les niveaux sont des *données* (JSON) que la boucle charge — jamais du code copié. La boucle est le théâtre, le niveau est la pièce. C'est ce qui rendra possible l'éditeur de niveaux (éditer un niveau = éditer un JSON).
3. **Modèle ≠ Entité** : la maquette 3D (visuel, réutilisable) vit dans une bibliothèque `models/` ; l'acteur logique (joueur, allié, ennemi) vit dans `game/entities/` et *référence* un modèle. La faction est une propriété de l'entité, pas un dossier. Changer de vaisseau, voler un chasseur ennemi : mêmes modèles, données différentes.
4. **Comportements (code) × Réglages (données)** : un missile, un ennemi, un mode de jeu = un petit nombre de comportements en TypeScript × une infinité de variantes en JSON. Le jour du multi, la logique pure de `game/` part sur le serveur, le client ne garde que le miroir — l'architecture est déjà taillée pour.
5. **Le rendu est un miroir** (`components/game/`) : les composants three.js ne *calculent* pas le jeu, ils *affichent* ce que `game/` décide. Interactive = possède un cerveau (module de comportement) ; inerte = simple décor. Un même objet peut changer de statut (épave inerte → amarrable) : on ajoute le cerveau, pas un dossier.

---

## L'arborescence cible

```
src/
├── app/                          # POINT D'ENTRÉE — Next.js, une URL = un dossier
│   ├── layout.tsx                # coquille globale
│   ├── globals.css
│   ├── page.tsx                  # accueil : VITRINE qui branche MainMenu (le menu vit dans components/ui/menus/)
│   └── play/page.tsx             # LE jeu : VITRINE qui branche Scene (ssr: false) — une seule URL,
│                                 #   les niveaux sont des données, pas des pages
│
├── components/                   # LE MIROIR — tout ce qui s'affiche
│   ├── ui/                       # INTERFACE — React 2D pur, deux rôles
│   │   ├── menus/               # ÉCRANS (hors jeu, ils remplacent la scène)
│   │   │   ├── MainMenu.tsx     # accueil, sélection de mission
│   │   │   └── PauseMenu.tsx    # pause, options
│   │   └── hud/                 # SURIMPRESSIONS (dans le jeu, par-dessus la scène)
│   │       ├── Radar.tsx
│   │       ├── Reticle.tsx
│   │       ├── SpeedIndicator.tsx
│   │       └── OffscreenArrows.tsx  # flèches d'ennemis hors-champ
│   │
│   └── game/                     # RENDU 3D — composants three.js
│       ├── Scene.tsx             # LE CADRE ET LA TROUPE : le <Canvas> (le cadre WebGL), et
│                                 #   l'assemblage CameraRig + Environment + Entities + Effects
│                                 #   (la troupe). Aucun niveau, aucun mode dedans —
│                                 #   voir section « Scene.tsx » ci-dessous
│       ├── models/              # BIBLIOTHÈQUE DE MAQUETTES (réutilisables, toute faction)
│       │   ├── ships/           # chasseurs, croiseurs, vaisseaux capitaux
│       │   │   ├── FalconMk2.tsx    # ex. : le chasseur du joueur au début
│       │   │   └── Interceptor.tsx  # ex. : le vaisseau emprunté à la mi-campagne
│       │   ├── weapons/         # missiles, roquettes, torpilles (maquettes)
│       │   │   ├── Rocket.tsx       # ex. : roquette ~40 cartouchées
│       │   │   └── Torpedo.tsx      # ex. : torpille anti-module
│       │   └── props/           # stations, astéroïdes, conteneurs, épaves
│       │       └── Container.tsx    # ex. : conteneur de fret (décor inerte)
│       ├── effects/             # explosions, traînées, débris (le visuel de la destruction)
│       └── environment/          # LE FOND DU MONDE — décor et éclairage (3 exemples)
│           ├── Earth.tsx         # la planète : sphère + textures + nuages animés (un fichier, une technique)
│           ├── Space/            # LE FOND SPATIAL — un répertoire, une porte, quatre couches
│           │   ├── index.tsx     # LE CHEF (toujours "index") : assemble les couches, lit le preset ("space": "deep")
│           │   ├── Void.tsx      # couche 1 : noir de base, dégradé, lueur zodiacale
│           │   ├── Stars.tsx     # couche 2 : le nuage de Points (les étoiles)
│           │   ├── MilkyWay.tsx # couche 3 : bande panoramique discrète
│           │   └── Exposure.tsx  # couche 4 : adaptation à la luminance — commande l'estompage des autres
│           └── Sun.tsx           # AUJOURD'HUI : UN fichier — le soleil paramétrable (presets distant / l1 / near)
│                                 #   UN JOUR : le répertoire Sun/ — index.tsx le chef, couches SunCore,
│                                 #   SunCorona, SunEruptions — si un preset exige un rendu propre.
│                                 #   Même les missions PROCHES du soleil (preset "near") ne changent RIEN
│                                 #   à l'organisation : même chef, même porte — seules les valeurs des
│                                 #   curseurs diffèrent (règle des curseurs).
│
├── game/                         # LOGIQUE PURE — TypeScript, zéro React, zéro three.js
│   ├── core/                     # LE CŒUR — les organes vitaux qui battent à chaque frame,
│   │                             #   quel que soit le niveau (de l'horloge : QUAND, pas QUOI)
│   │   ├── loop.ts               # le battement de cœur : cadence les update à PAS FIXE (dt identique
│   │                             #   sur toute machine) — une seule, pour toujours. L'ancien
│   │                             #   update(dt) du canvas = UN battement, appelé par elle
│   │   ├── state.ts              # la PHOTO du monde à l'instant T : qui vit, où, score, phase.
│   │                             #   Pas les acteurs (entities/) — leur état collectif
│   │   └── events.ts             # petit carrefour d'événements (mort, impact, trigger)
│   ├── entities/                 # LES ACTEURS (classes : comportement + attributs ; référencent
│   │                             #   un modèle 3D ; leurs VALEURS viennent du JSON du niveau)
│   │   ├── PlayerShip.ts         # le vaisseau piloté (peut changer de modèle en cours de partie)
│   │   ├── NpcShip.ts            # alliés ET ennemis — faction = propriété
│   │   ├── Projectile.ts         # missile/roquette/torpille : comportement + variantes
│   │   └── Prop.ts               # objets inertes du niveau (décor avec ou sans cerveau)
│   ├── controls/                 # entrées : clavier, souris, plus tard gamepad/WebXR
│   ├── physics/
│   │   ├── newton.ts             # poussée, inertie, plafond de vitesse (mission 1 !)
│   │   ├── collisions.ts         # détection et réponses (impact, dégâts, Whipple)
│   │   └── gravity.ts            # puits gravitationnels (plus tard)
│   ├── weapons/                  # COMPORTEMENTS d'armes : droite, guidé, verrouillé… (code)
│   ├── ai/                       # CERVEAUX : détection (cônes, raycast), esquives, as
│   ├── levels/
│   │   ├── index.ts              # chargeur : lit un JSON → instancie entités et décors
│   │   ├── data/                 # NIVEAUX = DONNÉES (JSON) : objets, positions, cerveaux
│   │   │   ├── earth-orbit-tutorial.json   # ex. : le tutoriel minier (acte 0)
│   │   │   └── station-defense.json       # ex. : défense de station de l'acte 3
│   │   └── brains/               # cerveaux nommés (rôles) référencés par les JSON
│   │       ├── patrol-route.ts          # ex. : ronde de patrouille (waypoints)
│   │       └── turret-guard.ts          # ex. : tourelle de station (cible + portée)
│   └── missions/                 # machine à événements : déclencheurs, dialogues, spawns
│       ├── act0/                        # les missions de l'acte 0 (scripts d'événements)
│       └── act3/                        # les missions de l'acte 3
│
└── types/                        # types TypeScript partagés (Entity, LevelData, ShipConfig...)
```

---

## Exemple concret — que contiendrait `levels/data/station-defense.json` ?

```json
{
  "id": "station-defense",
  "name": "Défense de la station Vega",

  "environment": {
    "earth": true,
    "space": "orbit",
    "sun": { "preset": "distant", "direction": [0.4, 0.2, -0.9] }
  },

  "player": { "model": "falcon-mk2", "position": [0, 0, 120] },

  "npcs": [
    { "model": "falcon-mk2", "faction": "ally",
      "position": [30, 0, 100], "brain": "wingman-follow", "callsign": "Vega-2" },

    { "model": "interceptor", "faction": "enemy",
      "position": [-200, 40, -300], "brain": "patrol-route",
      "waypoints": [[-200, 40, -300], [0, 60, -500], [150, 0, -300]] },

    { "model": "interceptor", "faction": "enemy",
      "position": [220, -30, -400], "brain": "patrol-route",
      "waypoints": [[220, -30, -400], [50, -60, -550], [-180, -20, -350]] }
  ],

  "props": [
    { "model": "station-vega", "position": [0, 0, -100] },
    { "model": "container", "position": [15, -8, -80], "brain": "turret-guard" }
  ],

  "mission": { "script": "act3/station-defense.ts" }
}
```

À lire attentivement, tout s'y retrouve :
- **Le joueur ET l'allié portent le même modèle** (`falcon-mk2`) — la faction est une propriété, pas un dossier.
- **Les deux ennemis partagent le même modèle** (`interceptor`) et le même cerveau (`patrol-route`) avec des *rondes différentes* — code partagé, données différentes.
- **Le conteneur est inerte… sauf celui qui porte un cerveau** (`turret-guard`) — même JSON, même chargeur.
- **Le décor** (`station-vega`, la Terre) est une maquette de plus — le monde entier n'est qu'une liste d'objets.
- **L'environnement lui aussi est des données** : preset du soleil, état du fond spatial (`"space": "orbit"`). Le jour de la mission du Soleil, ce même champ deviendra `"sun": { "preset": "near", "heatRadius": 25 }` — même chargeur, autre monde.
- **Le scénario** est un champ qui référence le script d'événements dans `missions/act3/`.
- Et pour jouer le tutoriel minier à la place : on charge `earth-orbit-tutorial.json`. **Même boucle, autres données.**

---

## `Scene.tsx` — le cadre et la troupe

Le `<Canvas>` (fourni par react-three/fiber) est **LE CADRE** : une zone WebGL dans la page — un rectangle avec un moteur de rendu, une caméra, le branchement de la boucle d'affichage. Seul, il affiche un écran noir vide. `Scene.tsx` fait la seconde moitié du travail : **placer dans le cadre le décor, les acteurs et les effets** — sans connaître aucun niveau ni mode :

```tsx
function Scene() {
  return (
    <Canvas>              // LE CADRE (r3f)
      <CameraRig />       // ┐
      <Environment />     // │ la troupe :
      <Entities />        // │ tout ce qui se joue
      <Effects />         // ┘ dans le cadre
    </Canvas>
  );
}
```

- `Environment` lit le preset du niveau (Terre ? soleil `near` ? `"space": "deep"` ?) — jamais codé en dur.
- `Entities` est le pur miroir : il lit l'état du monde (`game/`) et monte une maquette par entité — le jour du mode course ou du brevet, ce sont l'état et les scripts qui changent, pas cette ligne.
- Le HUD vit HORS du cadre, dessiné par-dessus en HTML (`components/ui/hud/`) : le radar n'est jamais dans la scène 3D.

---

## `game/core` — le cœur, et le tour d'une frame

- **`loop.ts` = l'horloge** (QUAND) : elle bat à pas fixe — le même `dt` sur toute machine, même quand le navigateur cale. Ce qu'elle appelle à chaque battement, c'est l'ancien `update(dt)` du canvas, découpé en organes (newton, collisions, IA).
- **`entities/` = les personnes** (classes, savoir-faire : voler, patrouiller) ; **`state.ts` = la photo de la scène à l'instant T** (qui vit, où, score, phase). Le cœur fait agir les acteurs, les acteurs modifient la photo, le miroir reflète la photo — jamais les acteurs directement.

```
loop (le cœur bat, pas fixe)
  → lit controls, appelle entities.update(dt)   — les acteurs agissent (physique, IA, armes)
  → en agissant, ils ÉCRIVENT dans la photo    — state : positions, munitions, score
  → le Canvas redessine tout, à chaque frame    — le miroir montre ce qui existe MAINTENANT
```

⚠️ La photo n'est jamais "prise" ni "appelée" : `state` est un tableau d'affichage vivant que les acteurs modifient en agissant. Et le dessin n'est lancé par personne de notre code — voir la section suivante.

- **`PlayerShip`** : classe TypeScript — attributs (coque, bouclier, vitesse max, maniabilité) et méthodes (`fire()`, `applyThrust()`, `turn()`). Trois nuances : ses *valeurs* viennent du JSON du niveau (la classe ne porte que le comportement) ; ses armes montées sont des *références* vers `weapons/` ; c'est `controls/` qui lit le clavier et l'appelle — elle ne sait pas qu'un clavier existe (gamepad et VR passeront par là sans la toucher).

---

## Qui rafraîchit l'écran ? — le bouton et la machine

Personne dans notre code n'écrit jamais "affiche maintenant". Le rafraîchissement est une chaîne à trois étages :

1. **Le navigateur** — l'écran se repeint ~60 fois/seconde ; il fournit `requestAnimationFrame` : *"donne-moi une fonction, je l'appellerai à chaque rafraîchissement"*. La prise électrique de tout jeu web.
2. **La boucle de RENDU du `<Canvas>` (r3f) — invisible, dans `node_modules`.** Le `<Canvas>` écrit dans `Scene.tsx` est **le bouton** : trois lignes qui installent un objet, à l'endroit de notre choix — comme poser un interrupteur. La **machine** qu'il installe (moteur three.js, caméra, boucle branchée sur `requestAnimationFrame`) vit dans la bibliothèque : à chaque frame, elle appelle tous les `useFrame` puis **redessine TOUT, mécaniquement, pour toujours**. On ne possèdera jamais cette boucle — on possède l'endroit où le cadre s'installe et la troupe qu'on y monte.
3. **Notre boucle de JEU (`loop.ts`)** — le cœur à pas fixe, branché dans la première par le seul point de contact :

```tsx
// Le crochet unique entre notre monde et la machine r3f
function GameLoop() {
  useFrame(() => { loop.tick(); });  // appelé à CHAQUE frame par la boucle du Canvas
  return null;                       // ce composant n'affiche rien — il est branché
}
```

**Deux boucles, pas une** : le rendu (rythme de l'écran, automatique, à la bibliothèque) et le jeu (pas fixe, à nous) — la seconde s'exécute à l'intérieur de la première. Parfois la boucle de jeu jouera deux battements entre deux images, parfois aucun : peu importe, la physique ne dépend jamais du hasard des machines.

Conséquence : *"le miroir relit la photo"* n'est pas un événement que quelqu'un lance — comme tout est redessiné à chaque frame, l'affichage est **toujours** l'image de la photo à l'instant présent. La relecture n'est pas une action, c'est une conséquence.

| Qui | Quoi | Où ça vit |
|---|---|---|
| Navigateur | propose le rythme (`requestAnimationFrame`) | le moteur du navigateur |
| `<Canvas>` (r3f) | la boucle de *rendu* : `useFrame` + redessiner | `node_modules` — invisible |
| `loop.tick()` | la boucle de *jeu* à pas fixe : faire agir les acteurs | **notre code**, branché via `useFrame` |

---

## Le fond du monde — `environment/` en trois exemples

**`Earth.tsx` — la planète.** Une sphère, ses textures, ses nuages qui défilent, sa douce lumière réfléchie. Un jour, d'autres planètes ? Même recette, autres réglages (curseurs) : c'est le modèle paramétrable appliqué au décor.

**`Space/` (chef : `index.tsx`) — le fond spatial, un environnement à couches.** L'espace n'est pas un noir plat : c'est un empilement, comme une forêt n'est pas "des arbres".

1. **Le void** — noir de base, mais pas plat : léger dégradé + lueur zodiacale très faible. Même Hubble n'a jamais photographié du noir parfait.
2. **Les étoiles** — un nuage de `Points` plaqué sur une immense sphère autour du joueur : il ne s'éloigne jamais, c'est le fond peint du théâtre.
3. **La Voie lactée / nébuleuses** — bande panoramique de texture très discrète. Ne sert à rien au gameplay ; c'est ce qui fait *croire* à l'espace.
4. **L'adaptation à la luminance** — le comportement : comme l'œil humain, quand une planète lumineuse ou le Soleil entre dans le champ de la caméra, les étoiles s'estompent et l'exposition baisse au lieu de rester figée. C'est un pur effet de rendu (le composant lit la luminance dominante de la scène et module ses couches) : la logique de jeu ne sait même pas que ça existe.

Le niveau choisit l'état du fond en données (`"space": "deep"` — ténébreux, Voie lactée dense — ou `"orbit"` — écrasé par la lumière rasante de la Terre).

**`Sun.tsx` — un seul acteur, trois costumes.** Une seule maquette paramétrable : `core` (le disque), `corona` (le halo), `eruptions` (les arcs de particules esquivables), `light` (l'éclairage honnête). Le niveau choisit l'état en données :

| Preset | Aspect | Rôle dans le niveau |
|---|---|---|
| `distant` | point brillant, halo discret | la lampe du monde (la plupart des niveaux) |
| `l1` | disque net, taille moyenne, pas d'éruptions | le soleil du bouclier L1 — présent, surveillé |
| `near` | immense, éruptions ON | le soleil de la mission du Soleil — il *menace* |

Les missions autour du Soleil (preset `near`) **ne changent rien à l'organisation du code** : que `Sun` soit un fichier ou un répertoire, `index` reste le chef et la porte, seules les valeurs des curseurs diffèrent. La menace (chaleur, radiations, bouclier qui fond) ne vit PAS ici : `environment/` affiche, `game/` punit (zone de danger pilotée par `heatRadius` — même mécanisme que l'atmosphère terrestre).

**Fichier ou répertoire ? La règle des métiers.** Un composant commence en *fichier* ; il devient un *répertoire avec un chef* le jour où ses parties ont des techniques différentes qui évoluent séparément. `Space/` est un répertoire (quatre métiers : dégradés, Points, texture, calcul de luminance) dont seul le chef `index.tsx` est importé par le reste du code. `Earth.tsx` reste un fichier (une seule technique). `Sun.tsx` naît fichier simple et deviendra `Sun/` si un preset exige un rendu propre. La frontière n'est pas la taille — c'est la diversité des métiers.

**Le chef s'appelle toujours `index.tsx`.** Un répertoire-composant a une seule porte d'entrée : un fichier `index.tsx`, qui porte le nom du dossier, assemblé et importé par le reste du code sous l'adresse du dossier (`import { Space } from ".../environment/Space"`). Uniforme pour tous les répertoires du projet (`Sun/`, `Space/`, futurs `Cruiser/`…), l'œil sait toujours où est le chef. Les couches s'importent *uniquement* via le chef — jamais directement depuis l'extérieur du dossier. Et pas de sous-répertoire dans un répertoire tant qu'une couche n'est pas elle-même devenue multiple — l'imbrication est une frontière de responsabilité, pas du rangement.

**La règle des curseurs, générale pour tout le jeu** : deux objets qui se ressemblent à des curseurs près = **même objet, valeurs différentes** (le soleil trois fois, une planète × N). Deux objets qui ne partagent vraiment rien = deux objets (le soleil et une station). Si un preset exige un rendu radicalement différent : on découpe en sous-composants (`SunCore`, `SunCorona`, `SunEruptions`) assemblés par le chef `index.tsx` — toujours une seule porte d'entrée.

---

## Où va quoi — le tableau de correspondance

| Besoin | Destination |
|---|---|
| Une nouvelle page/route | `app/<nom>/page.tsx` (minuscule) |
| Un menu, un écran (accueil, pause, options) | `components/ui/menus/` |
| Un élément en jeu (radar, réticule, vitesse, flèches) | `components/ui/hud/` |
| Une maquette 3D (vaisseau, missile, station, épave) | `components/game/models/` — réutilisable par toute faction |
| Un acteur logique (joueur, PNJ, projectile, accessoire) | `game/entities/` — référence un modèle |
| Un comportement d'arme (guidage, balistique) | `game/weapons/` (code) ; la variante précise = réglages JSON |
| Un cerveau d'objet (tourelle, patrouilleur) | `game/levels/brains/`, référencé par le JSON du niveau |
| La physique, les collisions | `game/physics/` |
| Le pilotage (entrées) | `game/controls/` |
| L'IA de vol | `game/ai/` |
| Un niveau entier | `game/levels/data/xxx.json` |
| Le scénario d'une mission | `game/missions/` |
| Un type partagé | `types/` |

## Règles de circulation

1. **`app/` importe depuis `components/` et `game/` ; personne n'importe depuis `app/`.**
2. **`components/game/` lit `game/`, jamais l'inverse** : `game/` ne connaît ni React, ni three.js — c'est son serment. Si tu croises un `import ... from "three"` dans `game/`, c'est un bug d'architecture.
3. **Aucune logique dans une maquette, aucun visuel dans une entité** : `models/` ne décide rien, `entities/` n'affichent rien. Le lien entre les deux est une référence (`model: "falcon-mk2"`).
4. **Pas de dossier par niveau, pas de boucle par niveau** : un niveau = un JSON + éventuellement un cerveau de mission. Toute ressemblance entre deux niveaux = données partagées, jamais code copié.
5. Un niveau qui a besoin de code custom = un champ `"script"` dans son JSON qui référence `game/missions/`.

## Les contradictions futures, déjà tranchées

- **Niveaux** : une seule boucle ; chaque niveau est un JSON d'objets (inertes ou cerveautés) — le chargeur instancie tout.
- **Changement de vaisseau du joueur** : `PlayerShip` garde son rôle de pilotage, échange sa référence de modèle. Rien d'autre ne bouge.
- **Modèle partagé joueur/ennemis/alliés** : normal et voulu — `models/ships/` ne connaît pas les factions.
- **Arsenal de missiles** : 4-5 comportements dans `weapons/`, chaque missile réel = une ligne de réglages dans les données.
- **Objets inertes vs interactifs** : même JSON, même chargeur ; la différence est un cerveau référencé. Un décor peut devenir interactif en lui ajoutant un cerveau.
- **Les soleils multiples (distant / L1 / proche)** : UNE maquette `environment/Sun.tsx` paramétrable + un `preset` par niveau dans le JSON (échelle, éruptions, `heatRadius`). La *menace* (chaleur, radiations, bouclier qui fond) vit dans `game/` comme zone de danger pilotée par `heatRadius` — même mécanisme réutilisable pour l'atmosphère terrestre (friction si trop bas). Le décor affiche, `game/` punit.
- **Modes de jeu (brevet de pilotage, entraînement, course…) et dizaines de niveaux** : `Scene.tsx` ne contient AUCUN niveau ni mode — c'est le plateau, pas les pièces. Il assemble toujours la même chose (caméra, environnement selon preset, `Entities` qui mappe l'état, effets). Un mode = un JSON de niveau + un script de mission + éventuellement un élément HUD dédié ; ajouter la course ne change pas une ligne de `Scene.tsx`. Si un jour ses parties deviennent des métiers séparés, il devient `Scene/index.tsx` (règle des métiers) — même porte, même rôle.
- **Multijoueur futur** : `game/` est déjà pur → il partira sur le serveur tel quel ; le client ne gardera que `components/` (le miroir) et `app/` (l'entrée).
- **Éditeur de niveaux futur** : une page `app/editor/` qui lit et écrit des JSON de `game/levels/data/` — l'architecture le rend presque gratuit.
- **VR future** : `controls/` gagne une entrée WebXR ; le reste ne sait même pas que ça existe.

## La démo Terre 2065 — statut

Démo historique générée automatiquement (2 fichiers : `app/terre2065/page.tsx` + `components/Terre2065.tsx`), conservée **telle quelle** comme référence visuelle, amenée à disparaître quand `/play` l'aura rattrapée. Elle n'est **pas** une référence d'architecture : tout nouveau code suit la cible ci-dessus, sans renommage ni maintenance de la démo. Plan d'exécution et calendrier : voir `JOURNAL.md`.

## Ce qui n'existe PAS encore (et c'est voulu)

Multi (serveur), éditeur de niveaux, sauvegardes, VR : aucun dossier. Ils viendront, à leur heure, se ranger dans la logique ci-dessus. L'architecture est prévue pour les accueillir ; on ne les construit pas avant l'heure.

---

*Dernière mise à jour : 7 nov. 2026. Toute évolution de la structure se note ici AVANT d'être codée.*
