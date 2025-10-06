function initializeUiControls() {
    // Define Elements and States
    const togglePlayButton = document.querySelector('#toggle-play-button');
    const playerBar = document.querySelector('#player-bar');
    const thumbnailImg = document.querySelector('#thumbnail-img');
    const thumbnailTitle = document.querySelector('#thumbnail-title');
    const thumbnailAuthor = document.querySelector('#thumbnail-author');
    const authorLinkIcon = document.querySelector('#author-link-icon');
    const thumbnailLink = document.querySelector('#thumbnail-link');
    const thumbnailPreview = document.querySelector('#thumbnail-preview');
    const skipToPrevButton = document.querySelector('#prev-button');
    const skipToNextButton = document.querySelector('#next-button');

    let thumbnailHideTimer;

    // Register Listeners
    togglePlayButton.addEventListener('click', function(e) {
        e.stopPropagation();
        controller();
    });

    document.addEventListener('player-ready', function() {
        console.log('%c[DEBUG] Event "player-ready" received.', 'color: green; font-weight: bold;');
        volumeSlider.value = ytPlayer.getVolume();
        updateSkipButtons();
    });

    skipToNextButton.onclick = function(e) {
        console.log('%c[DEBUG] Next button clicked.', 'color: cyan;');
        e.stopPropagation();
        playHistory.goToNext();
    };

    skipToPrevButton.onclick = function(e) {
        console.log('%c[DEBUG] Previous button clicked.', 'color: cyan;');
        e.stopPropagation();
        playHistory.goToPrev();
    };

    volumeSlider.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    volumeSlider.addEventListener('change', function(e) {
        if (ytPlayer && typeof ytPlayer.setVolume === 'function') {
            ytPlayer.setVolume(e.target.value);
        }
    });

    volumeSlider.addEventListener('input', function(e) {
        const newVolumeValue = e.target.value;
        if (ytPlayer && typeof ytPlayer.setVolume === 'function') {
            ytPlayer.setVolume(newVolumeValue);
            Preferences.savePreferences({ volume: newVolumeValue / 100 });
        }
        volumeLevel.innerText = `${newVolumeValue}%`;
    });

    volumeSlider.addEventListener('keydown', function(e) {
        e.preventDefault();
    });

    function showThumbnail() {
        clearTimeout(thumbnailHideTimer);

        if (playHistory.currentIndex >= 0 && window.song_list[playHistory.currentIndex]) {
            const currentSong = window.song_list[playHistory.currentIndex];
            const videoId = currentSong.id;

            thumbnailImg.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            thumbnailTitle.textContent = currentSong.title;
            thumbnailLink.href = `https://www.youtube.com/watch?v=${videoId}`;
            thumbnailAuthor.textContent = currentSong.author;
            authorLinkIcon.href = currentSong.channelUrl;
            thumbnailAuthor.style.display = 'block';
            authorLinkIcon.style.display = 'block';

            thumbnailPreview.style.opacity = '1';
            thumbnailPreview.style.visibility = 'visible';
        }
    }

    function hideThumbnail() {
        thumbnailHideTimer = setTimeout(() => {
            thumbnailPreview.style.opacity = '0';
            thumbnailPreview.style.visibility = 'hidden';
        }, 5000);
    }

    playerBar.addEventListener('mouseenter', showThumbnail);
    playerBar.addEventListener('mouseleave', hideThumbnail);

    thumbnailPreview.addEventListener('mouseenter', () => {
        clearTimeout(thumbnailHideTimer);
    });
    thumbnailPreview.addEventListener('mouseleave', hideThumbnail);

    function updateSkipButtons() {
        console.log('%c[DEBUG] updateSkipButtons called. Enabling buttons.', 'color: yellow;');
        skipToNextButton.classList.remove("disabled");
        skipToPrevButton.classList.remove("disabled");
    }
}