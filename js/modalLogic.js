let currentConfirmCallback = null;

function showConfirmModal(message, onConfirmCallback) {
    confirmMessage.textContent = message;
    currentConfirmCallback = onConfirmCallback;
    confirmModal.classList.add('visible');
}

function closeConfirmModal() {
    confirmModal.classList.remove('visible');
    currentConfirmCallback = null;
}

function setupConfirmModalListeners() {
    confirmYesBtn.addEventListener('click', () => {
        if (currentConfirmCallback) {
            currentConfirmCallback();
        }
        closeConfirmModal();
    });

    confirmNoBtn.addEventListener('click', () => {
        closeConfirmModal();
    });

    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            closeConfirmModal();
        }
    });
}

function openEditModal(courseId) {
    const activeRoutine = getActiveRoutine();
    if (!activeRoutine) return;

    const course = activeRoutine.courses.find(x => x.id === courseId);
    if (!course) return;

    state.editingCourseId = courseId;
    document.getElementById('edit-course-name').value = course.name;
    document.getElementById('edit-course-section').value = course.section;
    document.getElementById('edit-course-room').value = course.room;
    document.getElementById('edit-course-day').value = course.day;
    if (course.slotId) document.getElementById('edit-course-slot').value = course.slotId;
    document.getElementById('edit-course-color').value = course.color;

    // highlight the correct swatch in the edit modal
    const currentTheme = localStorage.getItem('theme') || 'grass';
    const colors = themes[currentTheme] || themes.grass;
    const swatch = editCourseColorPalette.querySelector(`[data-color="${course.color}"]`);
    if (swatch) {
        const allSwatches = editCourseColorPalette.querySelectorAll('.color-swatch');
        allSwatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
    }

    editModal.classList.add('visible');
}

function closeEditModal() {
    editModal.classList.remove('visible');
    state.editingCourseId = null;
}