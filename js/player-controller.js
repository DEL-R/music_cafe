// Define Elements and States

/** @type {HTMLAnchorElement} */
const songTitleElement = document.getElementById('song-title');
/** @type {HTMLAnchorElement} */
const volumeLevel = document.getElementById('volumelevel');
/** @type {HTMLDivElement} */
const clockDisplay = document.getElementById('clockdisplay');

/** @type {HTMLButtonElement} */
const controlsIcon = document.getElementById('controls-icon');
controlsIcon.addEventListener('click', controller);
/** @type {SVGElement} */
const playIcon = document.getElementById('play-icon');
/** @type {SVGElement} */
const pauseIcon = document.getElementById('pause-icon');
/** @type {SVGElement} */
const togglePlayIcon = document.querySelector('#toggle-play-icon');
/** @type {SVGElement} */
const loadingIcon = document.querySelector('#loading-icon');
/** @type {SVGElement} */
const togglePauseIcon = document.querySelector('#toggle-pause-icon');
/** @type {HTMLInputElement} */
const volumeSlider = document.querySelector('#volume-slider');

/** @type {YT.Player} */
let ytPlayer;

// Tracks whether the player has been started before
var controller_state = false;

// Check whether music is currently playing, used for the controls icon
var playing = false;
var loading = false;
let playerReady = false;

// Initial Setup
let currentPlaylistName;
let song_list; // This will now be a reference to window.song_list

/**
 * This function is called by the YouTube IFrame Player API script
 */
function onYouTubeIframeAPIReady() {
  loading = true;
  ytPlayer = new YT.Player('youtube-player', {
    height: '0',
    width: '0',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
      'onError': onPlayerError
    }
  });
}

function onPlayerReady(event) {
  playerReady = true;
  loading = false;
  const volume = Preferences.volume ?? 1;
  event.target.setVolume(volume * 100);
  volumeLevel.innerHTML = formatVolume(volume);
  // Dispatch a custom event to notify other scripts (like ui-controls.js)
  document.dispatchEvent(new CustomEvent('player-ready'));
  console.log('%c[DEBUG] Event "player-ready" dispatched.', 'color: green; font-weight: bold;');

  // Now that the player is ready, we can cue the initial video
  // The playlist and track index are already set by main()
  const initialVideo = song_list[playHistory.currentIndex];
  const savedPlayback = Preferences.playback;
  const startTime = (savedPlayback && savedPlayback.playlist === currentPlaylistName && savedPlayback.trackIndex === playHistory.currentIndex) ? (savedPlayback.time || 0) : 0;

  if (initialVideo) {
    ytPlayer.cueVideoById({ videoId: initialVideo.id, startSeconds: startTime });
  }
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    playHistory.goToNext();
  }
  // Update UI based on player state
  playing = (event.data === YT.PlayerState.PLAYING);
  loading = (event.data === YT.PlayerState.BUFFERING);
  updatePlayerUI();
}

function onPlayerError(event) {
  console.error("YouTube Player Error:", event.data);
  const videoTitle = song_list[playHistory.currentIndex]?.title || 'Cette vidéo';

  switch (event.data) {
    case 2: // Invalid parameter
      showtoast('Erreur : Paramètre de lecteur invalide. Passage à la suivante...');
      break;
    case 5: // HTML5 Player Error
      showtoast('Erreur du lecteur HTML5. Passage à la suivante...');
      break;
    case 100: // Video not found
    case 105: // Video not found
      showtoast(`"${videoTitle}" est introuvable. Passage à la suivante...`);
      break;
    case 101: // Embedding disabled
    case 150: // Embedding disabled
      showtoast(`"${videoTitle}" ne peut pas être lue ici. Passage à la suivante...`);
      break;
    case 153: // Missing HTTP Referer
        showtoast('Erreur de lecteur due à une configuration de sécurité. Passage à la suivante...');
        break;
    default: // Other errors
      showtoast(`Une erreur inconnue est survenue avec "${videoTitle}". Passage à la suivante...`);
      break;
  }

  // Try to play the next song on error
  playHistory.goToNext();
}

/**
 * An object to help keep track of the play history
 */
const playHistory = {
  /** The current track index */
  currentIndex: 0, // Start at the first track by default

  /** Changes to the previous track (if any) */
  goToPrev() {
    this.currentIndex = (this.currentIndex - 1 + window.song_list.length) % window.song_list.length;
    this.playTrack();
  },

  /** Changes to the next track (if not add new track and play) */
  goToNext() {
    this.currentIndex = (this.currentIndex + 1) % window.song_list.length;
    this.playTrack()
  },

  /** Plays the current index track */
  playTrack() {
    if (!playerReady) return;
    songTitleElement.textContent = 'Chargement...';
    loading = true;
    // We now play directly from the main song list
    const videoId = window.song_list[this.currentIndex].id;
    ytPlayer.loadVideoById(videoId);
  }
};

/**
 * Updates the song title element with the current video's title.
 */
function updateSongTitle() {
  if (window.song_list[playHistory.currentIndex]) {
    songTitleElement.textContent = window.song_list[playHistory.currentIndex].title;
    const videoId = window.song_list[playHistory.currentIndex].id;
    songTitleElement.href = `https://www.youtube.com/watch?v=${videoId}`;
  }
}

/**
 * Sets the current playlist to be used by the player.
 * @param {string} playlistName 
 */
function setCurrentPlaylist(playlistName) {
  currentPlaylistName = playlistName;
  window.song_list = window.playlists[playlistName];
  playHistory.currentIndex = -1; // Reset index to start from the beginning
}

/**
 * Saves the current playback state to preferences.
 */
function savePlaybackState() {
  // We only save the index and time, not the history anymore
  if (!playerReady || !controller_state || typeof ytPlayer.getCurrentTime !== 'function') return;

  const playbackState = {
    trackIndex: playHistory.currentIndex,
    time: ytPlayer.getCurrentTime(),
    playlist: currentPlaylistName // Save the current playlist name
  };
  Preferences.savePreferences({ playback: playbackState });
}

// Save state when the user is about to leave the page
window.addEventListener('beforeunload', savePlaybackState);

// Functions
/**
 * Update which icon should be shown or hidden based on playing
 * This is the single source of truth for the player's UI state.
 */
function updatePlayerUI() {
  // Update the main play/pause icon in the center of the screen
  playIcon.classList.toggle("show", !playing);
  pauseIcon.classList.toggle("show", playing);

  // Update the UI controls at the bottom
  if (loading) {
    loadingIcon.style.display = "block";
    togglePlayIcon.style.display = "none";
    togglePauseIcon.style.display = "none";
  } else {
    loadingIcon.style.display = "none";
    togglePlayIcon.style.display = playing ? "none" : "block";
    togglePauseIcon.style.display = playing ? "block" : "none";
  }

  // Update song title if we are in a playable state
  if (playing || ytPlayer.getPlayerState() === YT.PlayerState.CUED) updateSongTitle();
}

/**
 * Starts an interval to update the clock display every 1 second
 * Calls itself
 */
function showTime() {
  var date = new Date();
  var time = formatDate(date);

  clockDisplay.innerText = time;
  clockDisplay.textContent = time;

  setTimeout(showTime, 1000);
}

/**
 * Toggles the music between playing and paused
 */
 function playpause() {
  if (!playerReady) return;
  const playerState = ytPlayer.getPlayerState();
  if (playerState === YT.PlayerState.PLAYING) {
    ytPlayer.pauseVideo();
  } else {
    ytPlayer.playVideo();
  }
}


/**
 * Main controller function, triggered by clicks
 */
 function controller() {
  if (loading || !playerReady) return;

  if (!controller_state) {
    // If it's the very first interaction, play the current track (which is 0)
    // instead of skipping to the next one.
    ytPlayer.playVideo();
    controller_state = true;
  } else {
    playpause();
  }
}


document.onkeydown = function (e) {
  if (!playerReady) return;

  let currentVolume = ytPlayer.getVolume() / 100;

  if (e.key == "ArrowUp") {
    currentVolume = Math.min(currentVolume + 0.1, 1);
    ytPlayer.setVolume(currentVolume * 100);
    // Update volume display and save preferences only on volume change
    const newVolume = ytPlayer.getVolume() / 100;
    volumeLevel.innerText = `${Math.round(newVolume * 100)}%`;
    volumeSlider.value = newVolume * 100;
    Preferences.savePreferences({ volume: newVolume });
    savePlaybackState();
  } else if (e.key === "ArrowDown") {
    currentVolume = Math.max(currentVolume - 0.1, 0);
    ytPlayer.setVolume(currentVolume * 100);
    // Update volume display and save preferences only on volume change
    const newVolume = ytPlayer.getVolume() / 100;
    volumeLevel.innerText = `${Math.round(newVolume * 100)}%`;
    volumeSlider.value = newVolume * 100;
    Preferences.savePreferences({ volume: newVolume });
    savePlaybackState();
  } else if (e.key === "ArrowLeft") {
    playHistory.goToPrev();
  } else if (e.key === "ArrowRight") {
    playHistory.goToNext();
  }
}

document.querySelectorAll("#bottom-left .linktext").forEach(function (element) {
  element.addEventListener("click", function (event) {
    event.stopPropagation();
  });
});

/**
 * Main entry point of the application.
 * Orchestrates the loading and initialization of all modules.
 */
function main() {
  // 1. Load user playlists from storage (or use defaults)
  loadLocalPlaylists();

  // 1.5. Populate the main UI selector now that playlists are loaded
  populatePlaylistSelector();

  // 2. Determine the starting playlist and track
  const savedPlayback = Preferences.playback;
  const savedPlaylistName = savedPlayback ? savedPlayback.playlist : null;
  
  currentPlaylistName = (savedPlaylistName && window.playlists[savedPlaylistName]) ? savedPlaylistName : Object.keys(window.playlists)[0];
  window.song_list = window.playlists[currentPlaylistName];
  song_list = window.song_list; // Ensure the local reference is also updated
  playHistory.currentIndex = (savedPlayback && savedPlayback.playlist === currentPlaylistName && savedPlayback.trackIndex < window.song_list.length) ? savedPlayback.trackIndex : 0;

  // Update the main UI selector to show the correct starting playlist
  playlistSelector.value = currentPlaylistName;

  // 3. Start the clock
  showTime();

  // 4. Initialize UI controls now that the state is ready
  initializeUiControls();

  // 4. Initialize the playlist management UI
  initializeCrud();
}

document.addEventListener('DOMContentLoaded', main);
