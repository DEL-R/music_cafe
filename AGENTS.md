# Lignes directrices du dépôt

## Sommaire
- [Structure du projet et organisation](#structure-du-projet-et-organisation)
- [Commandes de développement et test](#commandes-de-developpement-et-test)
- [Style de code et conventions](#style-de-code-et-conventions)
- [Guide de tests](#guide-de-tests)
- [Commits et Pull Requests](#commits-et-pull-requests)
- [Sécurité et configuration](#securite-et-configuration)

## Structure du projet et organisation
- Entrée: `index.html`
- Styles: `css/` (ex. `index.css`, `player-controls.css`, `themer.css`, `hardpixel.css`)
- Scripts: `js/` et `js/data/` (ex. `player-controller.js`, `ui-controls.js`, `utils.js`, `data/songs.js`, `data/themes.js`)
- Ressources: `assets/img/`, `assets/img/backgrounds/`, `assets/fonts/`, `assets/socials/`
- Projet statique: pas de build; hébergement type GitHub Pages ou serveur statique.

## Commandes de développement et test
- Lancer en local:
  - `python -m http.server 5500` → ouvrir `http://localhost:5500/`
  - ou `npx serve .` (tout serveur statique convient)
- Ouvrir `index.html` pour un contrôle rapide; préférer un serveur local pour éviter les soucis CORS audio.

## Style de code et conventions
- Indentation 2 espaces; terminer les instructions par `;`.
- JavaScript: camelCase pour fonctions/variables; `const`/`let`; JSDoc encouragé (voir `js/utils.js`).
- Fichiers: kebab-case (ex. `player-controller.js`).
- CSS: privilégier les variables CSS; sélecteurs clairs et ciblés.
- Aucune dépendance framework: rester en HTML/CSS/JS natif.

## Guide de tests
- Pas de framework de tests configuré. Vérifications manuelles:
  - Lecture/pause (clic fond et bouton UI)
  - Pistes précédente/suivante (boutons et flèches ←/→)
  - Volume (curseur et flèches ↑/↓) + pourcentage affiché
  - Changement de thème et persistance (LocalStorage)
  - Horloge à jour et aucune erreur console
  - URLs audio valides et compatibles CORS

## Commits et Pull Requests
- Commits: Conventional Commits en français (feat, fix, docs, etc.). Ex: `feat: ajout du thème halloween1`.
- Branches: `feat/...`, `fix/...` (ex. `feat/sauvegarde-preferences`).
- PRs: description claire, issues liées, captures/GIFs pour l’UI, étapes de test, fichiers impactés (`js/data/songs.js`, `js/data/themes.js`, etc.).

## Sécurité et configuration
- Audio: ajouter uniquement des URLs MP3 licenciées et permissives CORS dans `js/data/songs.js`.
- Thèmes: ajouter via `createTheme(...)` dans `js/data/themes.js`; placer les fonds dans `assets/img/backgrounds/` (chemins relatifs).
- Garder des ressources légères pour éviter d’alourdir le dépôt.

