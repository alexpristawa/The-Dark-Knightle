usernameTextbox.addEventListener('keydown', () => {
    setTimeout(() => {
        shortStorage.info.username = usernameTextbox.value;
        localStorage.info = JSON.stringify(shortStorage.info);
    });
});

nameTextbox.addEventListener('keydown', () => {
    setTimeout(() => {
        shortStorage.info.name = nameTextbox.value;
        localStorage.info = JSON.stringify(shortStorage.info);
    });
});

descriptionTextarea.addEventListener('keydown', () => {
    setTimeout(() => {
        shortStorage.info.description = descriptionTextarea.value;
        localStorage.info = JSON.stringify(shortStorage.info);
    });
});

profilePicture.addEventListener('click', (event) => {
    changePFP(event.x, event.y);
});

movieStatsDropdown.addEventListener('change', () => {
    updateStats();
});

gamemodeDropdown.addEventListener('change', () => {
    updateStats();
});