# IDÉES — Space Wars 3D

Idées en vrac, notées à n'importe quelle heure (souvent depuis le téléphone). **Rien ici n'est à implémenter sans décision explicite** — ce fichier est un parking, pas une feuille de route.

Format libre : date + une phrase. On trie ensemble quand une mission se prépare.

---

<!-- Exemple :
## 2026-11-05
- (téléphone, 23h) Et si la dérive du vaisseau faisait vibrer l'interface ?
-->

---

## 2026-11-28 — Liste de Thierry, avec l'ordre de priorité proposé et retenu

Ordre conseillé (petit → gros), validé par Thierry le 28 nov. 2026 :

**Rapide (prochaines sessions)**
- Écran d'accueil simple avec une photo et un bouton Jouer
- Sous-menu : Campagne (à venir), Options (pour l'instant juste voir les touches), Vol libre (= `/play`)
- En vol libre, sous-menu de choix du vaisseau (il tourne, on voit ses caractéristiques) + un second vaisseau avec des caractéristiques un peu différentes
- La Lune au loin
- Remappage des touches Espace et Alt pour que ce soit plus pratique
- Tourner avec la souris en gardant un bouton enfoncé, pour voir partout autour de soi (futur `controls/mouse.ts` prévu dans ARCHITECTURE.md)
- Instruments de vol (HUD) : rotation X/Y/Z, de combien compenser et dans quelles directions, visuel et pratique

**Moyen**
- Station spatiale ronde autour de la Terre (attention aux proportions Terre / station / vaisseau)
- Quelques vaisseaux PNJ qui volent autour de nous : rentrent dans la station, disparaissent au loin, ou « atterrissent » sur Terre
- Limites du secteur façon Star Fox : quand on essaie d'aller plus loin, petite animation (caméra fixe, le vaisseau fait demi-tour, la caméra se recale derrière) — corrige aussi le bug de la planète qui disparaît d'un coup
- Régler le clignotement des petits éléments quand on s'éloigne de la planète (comme les étoiles avant qu'on les agrandisse)
- Touche pour voir la carte de navigation et décider de partir ailleurs : animation du réacteur principal qui s'allume, le vaisseau accélère fort, fondu au noir, apparition dans le secteur demandé

**Gros (horizon feuille de route VISION)**
- Carte du système solaire avec sélection de secteurs (autour des planètes), pour l'instant uniquement le secteur Terre ; sous-secteurs Terre / Lune — c'est le système de niveaux JSON (`game/levels/`)
- Touches pour régler la puissance d'accélération (throttle)
- Un éditeur de niveau simple
- Expérimenter des armes + possibilité de détruire quelques satellites en orbite
