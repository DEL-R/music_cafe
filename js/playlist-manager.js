const playlistSelector = document.getElementById('playlist-selector');

/**
 * Populates the playlist selector dropdown.
 */
function populatePlaylistSelector() {
  playlistSelector.innerHTML = ''; // Clear existing options
  for (const playlistName in window.playlists) {
    const option = document.createElement('option');
    option.value = playlistName;
    option.textContent = playlistName;
    playlistSelector.appendChild(option);
  }
}

/**
 * Handles the change of a playlist.
 * @param {string} playlistName The name of the new playlist to switch to.
 */
function onPlaylistChange(playlistName) {
  console.log(`%c[PLAYLIST] Switching to: ${playlistName}`, 'color: magenta;');
  setCurrentPlaylist(playlistName);
  playHistory.goToNext(); // Start playing the first song of the new playlist
}

playlistSelector.addEventListener('change', (event) => {
  onPlaylistChange(event.target.value);
});