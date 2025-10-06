// --- Functions ---

/**
 * Loads playlists from localStorage or initializes with default data.
 */
function loadLocalPlaylists() {
    const stored = localStorage.getItem('user_playlists');
    // If nothing is stored, use the default 'playlists' object from songs.js
    window.playlists = stored ? JSON.parse(stored) : playlists;
}

/**
 * Saves the current state of playlists to localStorage.
 */
function saveLocalPlaylists() {
    localStorage.setItem('user_playlists', JSON.stringify(window.playlists));
    // Refresh the main UI selector to reflect changes
    populatePlaylistSelector();
}

/**
 * Populates the playlist selector inside the modal.
 */
function populateModalPlaylistSelector() {
    const modalPlaylistSelector = document.getElementById('modal-playlist-selector');
    modalPlaylistSelector.innerHTML = '';
    for (const name in window.playlists) {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        modalPlaylistSelector.appendChild(option);
    }
}

/**
 * Displays the tracks for the currently selected playlist in the modal.
 */
function displayTracksForSelectedPlaylist() {
    const modalPlaylistSelector = document.getElementById('modal-playlist-selector');
    const modalTracksUl = document.getElementById('modal-tracks-ul');
    const modalCurrentPlaylistName = document.getElementById('modal-current-playlist-name');

    const selectedPlaylistName = modalPlaylistSelector.value;
    if (!selectedPlaylistName) {
        modalTracksUl.innerHTML = '';
        modalCurrentPlaylistName.textContent = '';
        return;
    }

    modalCurrentPlaylistName.textContent = selectedPlaylistName;
    const tracks = playlists[selectedPlaylistName];
    modalTracksUl.innerHTML = '';

    tracks.forEach((track, index) => {
        const li = document.createElement('li');
        li.textContent = track.title;
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '×';
        removeBtn.className = 'track-remove-btn';
        removeBtn.onclick = () => {
            if (confirm(`Supprimer la piste "${track.title}" ?`)) {
                playlists[selectedPlaylistName].splice(index, 1);
                saveLocalPlaylists();
                displayTracksForSelectedPlaylist();
            }
        };
        li.appendChild(removeBtn);
        modalTracksUl.appendChild(li);
    });
}

/**
 * Attaches all event listeners for the playlist management modal.
 */
function initializeCrud() {
    // Define elements inside the function to ensure DOM is ready
    const manageBtn = document.getElementById('manage-playlists-btn');
    const modal = document.getElementById('playlist-modal');
    const closeModalBtn = document.getElementById('modal-close-btn');
    const modalPlaylistSelector = document.getElementById('modal-playlist-selector');
    const createPlaylistBtn = document.getElementById('create-playlist-btn');
    const deletePlaylistBtn = document.getElementById('delete-playlist-btn');
    const addTrackBtn = document.getElementById('add-track-btn');

    // --- Event Listeners ---
    if (!manageBtn) return; // Stop if the button isn't found

    manageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        populateModalPlaylistSelector();
        if (modalPlaylistSelector.options.length > 0) {
            modalPlaylistSelector.selectedIndex = 0;
        }
        displayTracksForSelectedPlaylist();
        modal.style.display = 'block';
    });

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    modalPlaylistSelector.addEventListener('change', displayTracksForSelectedPlaylist);

    createPlaylistBtn.addEventListener('click', () => {
        const name = prompt("Nom de la nouvelle playlist :");
        if (name && !window.playlists[name]) {
            window.playlists[name] = [];
            saveLocalPlaylists();
            populateModalPlaylistSelector();
            modalPlaylistSelector.value = name;
            displayTracksForSelectedPlaylist();
        } else if (name) {
            alert("Une playlist avec ce nom existe déjà.");
        }
    });

    deletePlaylistBtn.addEventListener('click', () => {
        const selected = modalPlaylistSelector.value;
        if (Object.keys(window.playlists).length <= 1) {
            alert("Vous ne pouvez pas supprimer la dernière playlist.");
            return;
        }
        if (selected && confirm(`Êtes-vous sûr de vouloir supprimer la playlist "${selected}" ?`)) {
            delete window.playlists[selected];
            saveLocalPlaylists();
            populateModalPlaylistSelector();
            displayTracksForSelectedPlaylist();
        }
    });

    addTrackBtn.addEventListener('click', () => {
        const selectedPlaylist = modalPlaylistSelector.value;
        if (!selectedPlaylist) {
            alert("Veuillez d'abord sélectionner une playlist.");
            return;
        }

        const url = prompt("Entrez l'URL de la vidéo YouTube :");
        if (!url) return;

        const videoIdMatch = url.match(/(?:v=)([\w-]+)/);
        if (!videoIdMatch) {
            alert("URL YouTube invalide.");
            return;
        }
        const id = videoIdMatch[1];
        const title = prompt("Entrez le titre de la piste :", "Nouveau titre");
        const author = prompt("Entrez le nom de la chaîne YouTube :");
        const channelUrl = prompt("Entrez l'URL de la chaîne YouTube :");

        if (id && title && author && channelUrl) {
            window.playlists[selectedPlaylist].push({ id, title, author, channelUrl });
            saveLocalPlaylists();
            displayTracksForSelectedPlaylist();
        } else {
            alert("Toutes les informations sont requises.");
        }
    });
}