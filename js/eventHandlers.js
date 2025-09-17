function onAddSlot() {
    const activeRoutine = getActiveRoutine();
    if (!activeRoutine) return;

    const startInput = document.getElementById('new-slot-start');
    const endInput = document.getElementById('new-slot-end');
    const start = startInput.value;
    const end = endInput.value;

    if (!start || !end) {
        toast('Select both start and end times.');
        return;
    }

    const startObj = new Date(`2000/01/01 ${start}`);
    const endObj = new Date(`2000/01/01 ${end}`);

    if (endObj <= startObj) {
        toast('End time must be after start time.');
        return;
    }

    const label = `${start}-${end}`;
    activeRoutine.slots.push({
        id: uid('slot_'),
        label
    });

    // Sort slots by time
    activeRoutine.slots.sort((a, b) => {
        const [aStart] = a.label.split('-');
        const [bStart] = b.label.split('-');
        return aStart.localeCompare(bStart);
    });
    startInput.value = '';
    endInput.value = '';
    renderUI();
    saveStateToLocalStorage();
    toast('New slot added!');
}

function onAddCourse() {
    const activeRoutine = getActiveRoutine();
    if (!activeRoutine) return;

    const name = document.getElementById('course-name').value.trim().toUpperCase();
    const section = document.getElementById('course-section').value.trim().toUpperCase();
    const room = document.getElementById('course-room').value.trim().toUpperCase();
    const day = parseInt(document.getElementById('course-day').value, 10);
    const slotId = document.getElementById('course-slot').value || null;
    const color = document.getElementById('course-color').value;

    const isDuplicate = activeRoutine.courses.some(c => 
        c.name === name && 
        c.section === section && 
        c.room === room && 
        c.day === day && 
        c.slotId === slotId
    );

    if (isDuplicate) {
        toast('This exact course already exists!');
        return;
    }

    if (!name) {
        toast('Course name required');
        return;
    }
    const c = {
        id: uid('course_'),
        name,
        section,
        room,
        day,
        slotId,
        color
    };
    activeRoutine.courses.push(c);
    clearForm();
    renderUI();
    saveStateToLocalStorage();
    toast('Course added to timetable!');
}

function clearForm() {
    document.getElementById('course-name').value = '';
    document.getElementById('course-section').value = '';
    document.getElementById('course-room').value = '';
    document.getElementById('course-color').value = '#7c4dff';
    const activeSwatch = courseColorPalette.querySelector('.color-swatch.active');
    if (activeSwatch) {
        activeSwatch.classList.remove('active');
    }
    courseColorPalette.querySelector(`[data-color="${themes[localStorage.getItem('theme') || 'grass'][0]}"]`).classList.add('active');
}

function onSaveEditedCourse() {
    const activeRoutine = getActiveRoutine();
    if (!activeRoutine) return;

    const courseId = state.editingCourseId;
    const course = activeRoutine.courses.find(c => c.id === courseId);
    if (!course) return;

    course.name = document.getElementById('edit-course-name').value.trim().toUpperCase();
    course.section = document.getElementById('edit-course-section').value.trim().toUpperCase();
    course.room = document.getElementById('edit-course-room').value.trim().toUpperCase();
    course.day = parseInt(document.getElementById('edit-course-day').value, 10);
    course.slotId = document.getElementById('edit-course-slot').value || null;
    course.color = document.getElementById('edit-course-color').value;

    if (!course.name) {
        toast('Course name cannot be empty');
        return;
    }

    renderUI();
    saveStateToLocalStorage();
    closeEditModal();
    toast('Course updated!');
}

function onRandomizeColors() {
    const activeRoutine = getActiveRoutine();
    if (!activeRoutine) return;

    const theme = localStorage.getItem('theme') || 'grass';
    const colors = themes[theme] || themes.grass;
    const shuffledColors = shuffleArray([...colors]);

    // Get unique course names
    const uniqueCourseNames = [...new Set(activeRoutine.courses.map(c => c.name))];

    // Create a color map for each unique course name
    const courseColorMap = {};
    uniqueCourseNames.forEach((name, index) => {
        courseColorMap[name] = shuffledColors[index % shuffledColors.length];
    });

    // Apply the colors to all courses
    activeRoutine.courses.forEach(course => {
        course.color = courseColorMap[course.name];
    });

    renderUI();
    saveStateToLocalStorage();
    toast('Course colors randomized!');
}

function loadPredefinedSlots(refreshUI = true) {
    const activeRoutine = getActiveRoutine();
    if (!activeRoutine) return;

    activeRoutine.slots = predefinedSlots.map(s => ({
        id: uid('slot_'),
        label: s
    }));
    if (refreshUI) {
        activeRoutine.courses = activeRoutine.courses.map(c => ({
            ...c,
            slotId: null
        }));
        renderUI();
        toast('Default slots loaded. Courses were unassigned.');
    }
    saveStateToLocalStorage();
}

function changeZoom(delta) {
    setZoom(state.zoom + delta);
}

function setZoom(v) {
    state.zoom = Math.max(0.6, Math.min(1.6, Number(v.toFixed(2))));
    renderUI(); // Calls renderTimetable internally
    saveStateToLocalStorage();
}

function setTheme(themeName) {
    body.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
    renderColorPalette(courseColorPalette, document.getElementById('course-color'));
    renderColorPalette(editCourseColorPalette, document.getElementById('edit-course-color'));
}

function toggleMenu(forceState) {
    state.isMenuOpen = forceState !== undefined ? forceState : !state.isMenuOpen;
    body.classList.toggle('menu-closed', !state.isMenuOpen);
    localStorage.setItem('isMenuOpen', state.isMenuOpen);

    // Animate timetable scaling for a smooth transition
    setTimeout(() => {
        timetableEl.style.transform = `scale(${state.zoom})`;
    }, 300); // matches CSS transition duration
}

function setupEventListeners() {
    document.getElementById('add-course').addEventListener('click', onAddCourse);
    document.getElementById('clear-form').addEventListener('click', clearForm);
    document.getElementById('add-slot').addEventListener('click', onAddSlot);
    document.getElementById('load-predefined').addEventListener('click', () => {
        showConfirmModal('Are you sure you want to load default slots? This will unassign all courses.', () => {
            loadPredefinedSlots(true);
        });
    });
    document.getElementById('clear-local-storage').addEventListener('click', () => {
        showConfirmModal('Are you sure you want to clear all local storage data? This will reset the site in this browser.', () => {
            localStorage.clear();
            location.reload();
        });
    });
    document.getElementById('randomize-colors').addEventListener('click', onRandomizeColors);
    document.getElementById('export-png').addEventListener('click', exportPNG);
    document.getElementById('export-pdf').addEventListener('click', exportPDF);

    document.getElementById('zoom-in').addEventListener('click', () => changeZoom(0.1));
    document.getElementById('zoom-out').addEventListener('click', () => changeZoom(-0.1));
    document.getElementById('reset-zoom').addEventListener('click', () => setZoom(1));
    document.getElementById('menu-toggle').addEventListener('click', () => toggleMenu());
    themeSelector.addEventListener('change', (e) => setTheme(e.target.value));

    document.getElementById('save-edit-course').addEventListener('click', onSaveEditedCourse);
    document.getElementById('cancel-edit-course').addEventListener('click', closeEditModal);
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });

    // New routine management event listeners
    document.getElementById('add-routine').addEventListener('click', () => {
        showNewRoutineModal();
    });

    createRoutineBtn.addEventListener('click', () => {
        const routineName = newRoutineNameInput.value.trim();
        if (routineName) {
            createRoutine(routineName);
            renderUI();
            toast('New routine created!');
            closeNewRoutineModal();
        } else {
            toast('Routine name cannot be empty.');
        }
    });

    cancelNewRoutineBtn.addEventListener('click', () => {
        closeNewRoutineModal();
    });

    newRoutineModal.addEventListener('click', (e) => {
        if (e.target === newRoutineModal) {
            closeNewRoutineModal();
        }
    });
    document.getElementById('delete-routine').addEventListener('click', () => {
        showConfirmModal('Are you sure you want to delete this routine? This action cannot be undone.', () => {
            if (deleteRoutine(state.activeRoutineId)) {
                renderUI();
                toast('Routine deleted!');
            }
        });
    });

    document.getElementById('routine-name').addEventListener('input', onRoutineNameChange);

    // Dropdown functionality
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent document click from closing immediately
            const dropdownMenu = this.nextElementSibling;
            // Close other open dropdowns
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                if (menu !== dropdownMenu) {
                    menu.style.display = 'none';
                }
            });
            // Toggle current dropdown
            dropdownMenu.style.display = dropdownMenu.style.display === 'flex' ? 'none' : 'flex';
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function() {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    });

    // Prevent dropdown menu from closing when clicking inside it
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    });

    // keyboard shortcuts
    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            exportPDF();
        }
    });

    // Event listener for routine selector (moved from render.js)
    const routineSelectorEl = document.getElementById('routine-selector');
    if (routineSelectorEl && !routineSelectorEl.dataset.listenerAdded) {
        routineSelectorEl.addEventListener('change', (e) => {
            switchRoutine(e.target.value);
            renderUI();
            toast(`Switched to routine: ${getActiveRoutine() ? getActiveRoutine().name : ''}`);
        });
        routineSelectorEl.dataset.listenerAdded = 'true';
    }

    // Event listener for course editing (moved from render.js)
    // This needs to be attached to the timetable element and delegate events
    timetableEl.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            e.stopPropagation(); // Prevents drag start event
            const courseId = deleteBtn.closest('.course-block').dataset.id;
            showConfirmModal('Are you sure you want to delete this course?', () => {
                const activeRoutine = getActiveRoutine();
                if (activeRoutine) {
                    activeRoutine.courses = activeRoutine.courses.filter(c => c.id !== courseId);
                    renderUI();
                    saveStateToLocalStorage();
                    toast('Course deleted!');
                }
            });
        }
    });

    timetableEl.addEventListener('dblclick', (e) => {
        const courseBlock = e.target.closest('.course-block');
        if (courseBlock) {
            openEditModal(courseBlock.dataset.id);
        }
    });

    // Event listener for course list copy button (moved from render.js)
    document.getElementById('courses-list').addEventListener('click', (ev) => {
        const copyBtn = ev.target.closest('button[data-action="copy"]');
        if (copyBtn) {
            const originalId = copyBtn.dataset.id;
            const activeRoutine = getActiveRoutine();
            if (activeRoutine) {
                const originalCourse = activeRoutine.courses.find(x => x.id === originalId);
                if (originalCourse) {
                    const newCourse = { ...originalCourse,
                        id: uid('course_')
                    };
                    activeRoutine.courses.push(newCourse);
                    renderUI();
                    saveStateToLocalStorage();
                    toast('Course copied to timetable!');
                }
            }
        }
    });

    // Event listener for slot list remove button (moved from render.js)
    document.getElementById('slots-list').addEventListener('click', (ev) => {
        const removeBtn = ev.target.closest('button[data-action="remove"]');
        if (removeBtn) {
            const id = removeBtn.dataset.id;
            const activeRoutine = getActiveRoutine();
            if (activeRoutine) {
                activeRoutine.slots = activeRoutine.slots.filter(x => x.id !== id);
                activeRoutine.courses = activeRoutine.courses.map(c => c.slotId === id ? {
                    ...c,
                    slotId: null
                } : c);
                renderUI();
                saveStateToLocalStorage();
                toast('Slot removed.');
            }
        }
    });

    // Event listener for edit modal close (moved from eventHandlers.js)
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
}