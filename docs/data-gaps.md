# Lacunes de données — recommandations pour le classeur Google Sheets

Ce document liste les fonctionnalités que le site voudrait afficher mais qui ne sont pas réalisables avec la structure actuelle du classeur Google Sheets. Pour chaque lacune : ce que le site veut montrer, pourquoi ce n'est pas possible aujourd'hui, et un changement minimal proposé pour débloquer la fonctionnalité.

## 1. Vue de match en direct — RÉSOLU, en développement (ticket 08)

Correction (2026-08-21) : l'hypothèse ci-dessus était fausse. L'onglet `Feuilles de match` **est** mis à jour pendant la partie, pas seulement après — le pointage se remplit en temps réel, et une partie est considérée terminée quand la cellule « Tirs au but » de la 3e période est remplie. Aucun nouvel onglet n'est nécessaire : la page `/live` peut interroger `Feuilles de match` directement (interrogation aux 30 secondes). Voir `.scratch/hockey-rankings-redesign/issues/08-live-match-view.md`.

## 2. Pointage par période (détail de match) — RÉSOLU, en développement (ticket 09)

Correction (2026-08-21) : pas besoin d'ajouter des colonnes au `Calendrier`. Chaque but inscrit dans la section « Pointage » d'un bloc `Feuilles de match` porte déjà sa propre valeur de période (1/2/3) — le pointage par période s'obtient en comptant les buts par période et par équipe directement dans cette source. Voir `.scratch/hockey-rankings-redesign/issues/09-score-by-period.md`.

## 3. Position des joueurs (C/LW/RW/D/G) — décliné

Décision (2026-08-21) : on ne poursuit pas cette amélioration. L'étiquette générale G/D/A restante est suffisante pour l'instant.

Le site voudrait afficher la position de chaque joueur (centre, ailier gauche/droit, défenseur, gardien) dans le tableau des meneurs et les listes d'équipe. Aucun champ maître par joueur n'existe pour cette information — seule une étiquette générale G/D/A (gardien/défenseur/attaquant) apparaît, éparpillée dans les blocs d'alignement des `Feuilles de match` individuelles, ce qui n'en fait pas une source exploitable.

**Recommandation** : ajouter une colonne `Position` à la zone de liste de joueurs de base de l'onglet `Classement Joueurs 2025-26`. Même une étiquette générale G/D/A suffirait à débloquer la colonne « Pos » actuellement absente du tableau des meneurs et des listes d'équipe.

## 4. Journal des matchs par joueur (historique partie par partie) — PARTIELLEMENT RÉSOLU (ticket 12)

Correction (2026-08-21) : le déclencheur de réévaluation prévu par le ticket 12 s'est produit — les tickets 08/09 ont construit un analyseur réutilisable de `Feuilles de match` (alignement + journal des buts par bloc de partie). Buts/aides/points par match sont maintenant affichés sur la page de détail d'un joueur (`Journal des matchs`), dérivés de ce même analyseur, sans nouvel onglet.

Le +/- reste hors de portée : `Feuilles de match` ne consigne que le buteur et les assistants de chaque but, pas les joueurs sur la glace — aucune source n'existe pour ce calcul sans un nouvel onglet dédié.

**Recommandation (mise à jour)** : le +/- nécessite toujours un onglet dédié (par exemple `Journal des matchs`, une ligne par joueur par match) alimenté manuellement, ou un suivi des joueurs sur la glace qui n'existe pas aujourd'hui. Voir `.scratch/hockey-rankings-redesign/issues/12-player-game-log-request.md`.

## 5. Colonne « PBC » (points bonis) — en développement (ticket 10)

L'onglet `Classement Saison Régulière 2025-26` contient une colonne « PBC » qui s'additionne aux points (PTS) pour former le « Total ». Sa signification est maintenant connue : ce sont des points bonis attribués aux équipes selon les pénalités. La formule exacte de calcul (à partir des données brutes de pénalités) reste non confirmée, mais ça n'a pas d'importance — le classeur calcule déjà la valeur, le site n'a qu'à l'afficher.

Le site continue d'utiliser l'ordre PTS/rang déjà présent dans le classeur pour le classement (PBC/Total seront affichés à titre informatif, pas comme base de tri) — voir `.scratch/hockey-rankings-redesign/issues/10-standings-pbc-columns.md`.
