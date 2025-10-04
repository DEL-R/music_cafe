# Note interne – Architecture et modules

Cette note décrit rapidement comment les modules interagissent et où modifier quoi (toasts, thèmes, lecteur, etc.).

## Vue d’ensemble
- Page statique: `index.html` contient le marquage et les IDs utilisés par les scripts.
- Scripts principaux (vanilla JS):
  - `js/player-controller.js` — coeur du lecteur (états `playing`, `loading`, `controller_state`, historique `playHistory`, horloge `showTime()`, fonctions `controller()` et `playpause()`). Écoute clavier ←/→/↑/↓.
  - `js/ui-controls.js` — relie l’UI aux actions: boutons lecture/pause, précédent/suivant, slider volume, icône de chargement.
  - `js/preferences.js` — persistance locale (LocalStorage) de `volume` et `theme` via l’objet global `Preferences`.
  - `js/themer.js` — application du thème (variables CSS, image de fond) et surlignage de l’icône sélectionnée.
  - `js/utils.js` — utilitaires (heure HH:MM:SS, pourcentage volume, `htmlToElement`).
  - `js/toast.js` — notifications éphémères (toasts) affichées au chargement.
  - Données: `js/data/songs.js` (URLs MP3), `js/data/themes.js` (thèmes avec `createTheme`).

## Flux au chargement
1) `preferences.js` charge volume/thème depuis LocalStorage. 2) `themer.js` peuple les icônes et applique le thème. 3) `player-controller.js` règle `player.volume`, lance `showTime()`, prépare `playHistory`. 4) `ui-controls.js` met l’UI en état initial et connecte les écouteurs. 5) `toast.js` affiche les messages d’accueil.

- Démarrer/pauser: clic sur la zone principale appelle `controller()` (cf. `index.html`), qui charge le premier morceau si nécessaire puis appelle `playpause()`.
- Changer de piste: boutons ou flèches ←/→ via `playHistory.goToPrev/goToNext()`.
- Volume: slider ou flèches ↑/↓; `player.volume` déclenche la sauvegarde et la mise à jour de l’affichage (`#volumelevel`).
- Thème: clic sur une icône appelle `applyTheme()` puis `Preferences.savePreferences({ theme })`.

## Toasts (où modifier/désactiver)
- Messages: `js/toast.js`, tableau `defaultmessage_list`. Remplacez par des textes FR ou videz la liste pour ne rien afficher.
- Durée/target: `myOptions.displayTime` et `myOptions.target` dans `js/toast.js`.
- Apparence: règle CSS `.toast` dans `css/index.css` (et adaptation responsive).
- Désactivation simple: commentez le bloc `$(document).ready(...)` en bas de `js/toast.js`.

## Points d’extension rapides
- Ajouter un morceau: insérer l’URL MP3 dans `js/data/songs.js` (CORS/licence requis).
- Ajouter un thème: appeler `createTheme(...)` dans `js/data/themes.js` et placer l’image dans `assets/img/backgrounds/`.
- Modifier les raccourcis/clavier: voir `document.onkeydown` dans `js/player-controller.js`.
- Modifier les IDs/DOM: gardez stables `#player`, `#toggle-play-button`, `#prev-button`, `#next-button`, `#volume-slider`, `#clockdisplay`, `#theme-selector`, `#controls-icon`.
