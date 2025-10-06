
const Preferences = (function() {
  // Stored Preferences
  /** @var {number} */
  let volume = 1;
  /** @var {string} */
  let theme = "cafe";
  /** @var {object | null} */
  let playback = null;

  // Methods
  function loadPreferences() {
    const preferences = JSON.parse(localStorage.getItem("preferences")) ?? {
      volume,
      theme,
      playback,
    };
    volume = preferences.volume;
    theme = preferences.theme;
    playback = preferences.playback;
  }

  function savePreferences(newPreferences) {
    if (newPreferences.playback !== undefined) playback = newPreferences.playback;
    if (newPreferences.volume !== undefined) volume = newPreferences.volume;
    if (newPreferences.theme !== undefined) theme = newPreferences.theme;
    localStorage.setItem("preferences", JSON.stringify({
      volume: volume,
      theme: theme,
      playback: playback,
      // playlist: currentPlaylistName // This is now saved inside the playback object
    }));
  }

  loadPreferences();

  return {
    savePreferences,
    get volume() { return volume },
    get theme() { return theme; },
    get playback() { return playback; }
  };
})();
