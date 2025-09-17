function init() {
    loadStateFromLocalStorage();
    renderUI();
    setTheme(localStorage.getItem('theme') || 'grass');
    themeSelector.value = localStorage.getItem('theme') || 'grass';

    toggleMenu(state.isMenuOpen);

    const activeRoutine = getActiveRoutine();
    if (activeRoutine) {
        document.getElementById('routine-name').value = activeRoutine.name;
    }

    setupEventListeners();
    setupConfirmModalListeners();
}

document.addEventListener('DOMContentLoaded', init);