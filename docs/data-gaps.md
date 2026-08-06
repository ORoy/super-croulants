# Lacunes de données — recommandations pour le classeur Google Sheets

Ce document liste les fonctionnalités que le site voudrait afficher mais qui ne sont pas réalisables avec la structure actuelle du classeur Google Sheets. Pour chaque lacune : ce que le site veut montrer, pourquoi ce n'est pas possible aujourd'hui, et un changement minimal proposé pour débloquer la fonctionnalité.

## 1. Vue de match en direct

Le site voudrait offrir une page « match en direct » (période, temps, pointage, tirs au but mis à jour pendant la partie). Aujourd'hui, aucune source de données en temps réel n'existe : l'onglet `Feuilles de match` n'est rempli qu'après la partie.

**Recommandation** : créer un petit onglet (par exemple `État du match`) que le marqueur officiel mettrait à jour pendant la partie — période, temps au chronomètre, pointage, tirs au but — que le site pourrait interroger à intervalles réguliers. Il s'agit d'un effort distinct (un mécanisme de mise à jour en direct côté marqueur, pas seulement un ajout de colonnes) à entreprendre une fois cet onglet en place, pas une suite immédiate du travail actuel.

## 2. Pointage par période (détail de match)

Sur la page de détail d'un match, le site voudrait afficher le pointage par période (période 1/2/3) en plus du score final. L'onglet `Calendrier/Résultats/Étoiles 2025-26` ne contient que les scores finaux par match, aucune ventilation par période.

**Recommandation** : ajouter 3 colonnes par équipe (buts en période 1, 2 et 3) à côté des colonnes de score final déjà présentes dans cet onglet.

## 3. Position des joueurs (C/LW/RW/D/G)

Le site voudrait afficher la position de chaque joueur (centre, ailier gauche/droit, défenseur, gardien) dans le tableau des meneurs et les listes d'équipe. Aucun champ maître par joueur n'existe pour cette information — seule une étiquette générale G/D/A (gardien/défenseur/attaquant) apparaît, éparpillée dans les blocs d'alignement des `Feuilles de match` individuelles, ce qui n'en fait pas une source exploitable.

**Recommandation** : ajouter une colonne `Position` à la zone de liste de joueurs de base de l'onglet `Classement Joueurs 2025-26`. Même une étiquette générale G/D/A suffirait à débloquer la colonne « Pos » actuellement absente du tableau des meneurs et des listes d'équipe.

## 4. Journal des matchs par joueur (historique partie par partie)

Sur la page de détail d'un joueur, le site voudrait afficher l'historique partie par partie (buts, aides, points, +/- par match). L'onglet `Feuilles de match` est une mise en page destinée à l'impression, pas une ligne par joueur par match — il n'est pas exploitable pour reconstituer cet historique.

**Recommandation** : créer un onglet dédié (par exemple `Journal des matchs`), une ligne par joueur par match, avec au minimum : date, adversaire, buts, aides, +/-.

## 5. Colonne « PBC » (points bonis)

L'onglet `Classement Saison Régulière 2025-26` contient une colonne « PBC » qui s'additionne aux points (PTS) pour former le « Total ». La formule de calcul n'a pas pu être confirmée par l'analyse du classeur — les hypothèses testées (basées sur les buts, les périodes, les victoires/défaites) ne correspondent pas aux valeurs observées ; un lien possible avec les valeurs « PtsFS » par match dans les données de `Matchs` n'a pas été vérifié.

Ceci ne bloque rien actuellement : le site utilise directement l'ordre PTS/rang déjà présent dans le classeur pour le classement, sans avoir besoin de recalculer le PBC. Ça vaut toutefois la peine de poser la question directement à l'organisateur de la ligue si le classement « Total » (PTS+PBC) doit un jour être reproduit à partir de zéro plutôt que simplement lu depuis le classeur.
