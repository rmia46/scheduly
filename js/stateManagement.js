// app state
const state = {
    routines: [], // array of {id, name, slots, courses}
    activeRoutineId: null,
    zoom: 1,
    editingCourseId: null,
    isMenuOpen: true,
    draggingCourse: null
};

function saveStateToLocalStorage() {
    localStorage.setItem('routineAppState', JSON.stringify(state));
}

function loadStateFromLocalStorage() {
    try {
        const savedState = JSON.parse(localStorage.getItem('routineAppState'));
        if (savedState) {
            // Load top-level state properties
            state.zoom = savedState.zoom || 1;
            state.editingCourseId = savedState.editingCourseId || null;
            state.isMenuOpen = savedState.isMenuOpen !== undefined ? savedState.isMenuOpen : true; // Ensure isMenuOpen is loaded

            // Load routines and activeRoutineId
            if (savedState.routines && savedState.routines.length > 0) {
                state.routines = savedState.routines;
                state.activeRoutineId = savedState.activeRoutineId || state.routines[0].id;
            } else {
                // If no routines, create a default one
                createRoutine('My Routine');
            }
        } else {
            // If no saved state at all, create a default routine
            createRoutine('My Routine');
        }
    } catch (e) {
        console.error('Failed to load state from localStorage', e);
        // Fallback to creating a default routine on error
        createRoutine('My Routine');
    }
}

function getActiveRoutine() {
    return state.routines.find(r => r.id === state.activeRoutineId);
}

function createRoutine(name) {
    const newRoutine = {
        id: uid('routine_'),
        name: name,
        slots: [],
        courses: []
    };
    state.routines.push(newRoutine);
    state.activeRoutineId = newRoutine.id;
    renderUI(); // This will be called from main app logic
    saveStateToLocalStorage();
}

function switchRoutine(routineId) {
    state.activeRoutineId = routineId;
    const activeRoutine = getActiveRoutine();
    if (activeRoutine) {
        document.getElementById('routine-name').value = activeRoutine.name;
    }
    renderUI(); // This will be called from main app logic
    saveStateToLocalStorage();
    toast(`Switched to routine: ${activeRoutine ? activeRoutine.name : ''}`); // Toast will be handled by main app logic
}

function deleteRoutine(routineId) {
    if (state.routines.length === 1) {
        toast('Cannot delete the last routine!'); // Toast will be handled by main app logic
        return false;
    }
    state.routines = state.routines.filter(r => r.id !== routineId);
    if (state.activeRoutineId === routineId) {
        state.activeRoutineId = state.routines[0].id;
    }
    const activeRoutine = getActiveRoutine();
    if (activeRoutine) {
        document.getElementById('routine-name').value = activeRoutine.name;
    }
    renderUI(); // This will be called from main app logic
    saveStateToLocalStorage();
    toast('Routine deleted!'); // Toast will be handled by main app logic
    return true;
}

function onRoutineNameChange(event) {
    const activeRoutine = getActiveRoutine();
    if (activeRoutine) {
        activeRoutine.name = event.target.value;
        saveStateToLocalStorage();
    }
}

// Helper function to get full day name
function getFullDayName(dayIndex) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
}