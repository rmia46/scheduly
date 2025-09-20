function renderUI() {
    renderSlotOptions();
    renderEditSlotOptions();
    renderSlotsList();
    renderCoursesList();
    renderTimetable();
    renderColorPalette(courseColorPalette, document.getElementById('course-color'));
    renderColorPalette(editCourseColorPalette, document.getElementById('edit-course-color'));
    renderRoutineSelector(); // New call
}

function renderRoutineSelector() {
    const routineSelectorEl = document.getElementById('routine-selector');
    if (!routineSelectorEl) return; // Ensure the element exists

    routineSelectorEl.innerHTML = '';
    state.routines.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = r.name;
        if (r.id === state.activeRoutineId) {
            opt.selected = true;
        }
        routineSelectorEl.appendChild(opt);
    });

    // Add event listener if not already added
    if (!routineSelectorEl.dataset.listenerAdded) {
        routineSelectorEl.addEventListener('change', (e) => {
            switchRoutine(e.target.value);
        });
        routineSelectorEl.dataset.listenerAdded = 'true';
    }
}

function renderSlotOptions() {
    const activeRoutine = getActiveRoutine();
    if (!activeRoutine) return;

    // populate <select> for adding courses
    courseSlotSelect.innerHTML = '';
    activeRoutine.slots.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = s.label;
        courseSlotSelect.appendChild(opt);
    });
}

function renderEditSlotOptions() {
    const activeRoutine = getActiveRoutine();
    if (!activeRoutine) return;

    editCourseSlotSelect.innerHTML = '';
    activeRoutine.slots.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = s.label;
        editCourseSlotSelect.appendChild(opt);
    });
}

function renderSlotsList() {
    const activeRoutine = getActiveRoutine();
    if (!activeRoutine) return;

    slotsListEl.innerHTML = '';
    if (activeRoutine.slots.length === 0) {
        slotsListEl.innerHTML = '<div class="muted">No slots yet.</div>';
    }

    const fragment = document.createDocumentFragment();
    activeRoutine.slots.forEach(s => {
        const div = document.createElement('div');
        div.className = 'list-item slot-item entering'; // Add 'entering' class
        div.innerHTML = `
            <div>${escapeHtml(s.label)}</div>
            <div class="row-actions">
                <button class="small" data-id="${s.id}" data-action="remove">Remove</button>
            </div>
        `;
        fragment.appendChild(div);
    });
    slotsListEl.appendChild(fragment);

    // Trigger animation
    setTimeout(() => {
        slotsListEl.querySelectorAll('.list-item.entering').forEach(item => {
            item.classList.remove('entering');
        });
    }, 50);

    // attach remove handlers
    slotsListEl.querySelectorAll('button[data-action="remove"]').forEach(b => b.addEventListener('click', (ev) => {
        const id = ev.currentTarget.dataset.id;
        activeRoutine.slots = activeRoutine.slots.filter(x => x.id !== id);
        // also drop courses in that slot
        activeRoutine.courses = activeRoutine.courses.map(c => c.slotId === id ? {
            ...c,
            slotId: null
        } : c);
        renderUI();
        saveStateToLocalStorage();
        toast('Slot removed.');
    }));
}

function renderCoursesList() {
    const activeRoutine = getActiveRoutine();
    if (!activeRoutine) return;

    coursesListEl.innerHTML = '';
    if (activeRoutine.courses.length === 0) {
        coursesListEl.innerHTML = '<div class="muted">No courses yet</div>';
        return;
    }

    const fragment = document.createDocumentFragment();
    // Now, this list only shows a summary and a copy button
    const displayedCourses = {}; // Track courses by name and section to prevent duplicates
    activeRoutine.courses.forEach(c => {
        const uniqueKey = `${c.name}-${c.section}`;
        if (displayedCourses[uniqueKey]) {
            return; // Don't add if already displayed
        }
        displayedCourses[uniqueKey] = true;

        const el = document.createElement('div');
        el.className = 'list-item course-item entering'; // Add 'entering' class
        const slotLabel = activeRoutine.slots.find(s => s.id === c.slotId)?.label || '<em>no slot</em>';
        const dayName = getFullDayName(c.day);
        el.innerHTML = `
            <div class="course-meta">
                <div class="course-dot" style="background:${c.color}"></div>
                <div>
                    <div class="course-name">${escapeHtml(c.name)} <span>${escapeHtml(c.section)}</span></div>
                    <div class="course-details">Original: ${dayName} · ${slotLabel}</div>
                </div>
            </div>
            <div class="row-actions">
                <button class="small" data-id="${c.id}" data-action="copy">Copy</button>
            </div>`;
        fragment.appendChild(el);
    });
    coursesListEl.appendChild(fragment);

    // Trigger animation
    setTimeout(() => {
        coursesListEl.querySelectorAll('.list-item.entering').forEach(item => {
            item.classList.remove('entering');
        });
    }, 50);

    

}

function renderTimetable() {
    const activeRoutine = getActiveRoutine();
    if (!activeRoutine) return;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    timetableEl.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'grid';
    const headerRow = document.createElement('div');
    headerRow.className = 'grid-row header-row';

    headerRow.appendChild(cell('', 'corner'));
    days.forEach((d, i) => headerRow.appendChild(cell(d + `<div class="day-number">${getFullDayName(i)}</div>`, 'day-head')));
    grid.appendChild(headerRow);

    const slotOrder = activeRoutine.slots;
    slotOrder.forEach(slot => {
        const row = document.createElement('div');
        row.className = 'grid-row';
        row.appendChild(cell(slot.label, 'time-cell'));

        for (let day = 0; day < 7; day++) {
            const dcell = document.createElement('div');
            dcell.className = 'grid-cell';
            dcell.dataset.slotId = slot.id;
            dcell.dataset.day = day;

            const coursesInCell = activeRoutine.courses.filter(c => c.day === day && c.slotId === slot.id);

            if (coursesInCell.length > 0) {
                coursesInCell.forEach((course, index) => {
                    const block = document.createElement('div');
                    block.className = 'course-block';
                    block.draggable = true;
                    block.dataset.id = course.id;
                    block.innerHTML = `
                        <div class="course-title">${escapeHtml(course.name)}</div>
                        <div class="course-info small">${escapeHtml(course.section)} · ${escapeHtml(course.room || '')}</div>
                        <button class="delete-btn">&times;</button>
                    `;
                    block.style.background = course.color || '#7c4dff';

                    // Add a class for stacked courses and apply cascade effect
                    if (coursesInCell.length > 1) {
                        const offset = index * 5; // Adjust this value for a more or less pronounced cascade
                        block.style.position = 'absolute';
                        block.style.top = `${offset}px`;
                        block.style.left = `${offset}px`;
                        block.style.zIndex = coursesInCell.length - index;
                        block.classList.add('stacked-course');
                    }

                    dcell.appendChild(block);

                    // Add event listeners for the new block
                    block.addEventListener('dragstart', (e) => {
                        e.dataTransfer.setData('text/plain', course.id);
                        setTimeout(() => block.classList.add('dragging'), 0);
                    });
                    block.addEventListener('dragend', () => {
                        block.classList.remove('dragging');
                    });
                    
                    // Add click listener for selection
                    block.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent event from bubbling to parent cell
                        // Remove 'selected' from any other course block
                        document.querySelectorAll('.course-block.selected').forEach(b => b.classList.remove('selected'));
                        // Add 'selected' to the clicked course block
                        block.classList.add('selected');
                    });

                    // Add click listener for delete button
                    block.querySelector('.delete-btn').addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevents drag start event
                        showConfirmModal('Are you sure you want to delete this course?', () => {
                            activeRoutine.courses = activeRoutine.courses.filter(c => c.id !== course.id);
                            renderUI();
                            saveStateToLocalStorage();
                            toast('Course deleted!');
                        });
                    });

                    // Original dblclick handler for editing
                    block.addEventListener('dblclick', () => {
                        openEditModal(course.id);
                    });
                });
            }

            dcell.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (!dcell.classList.contains('drag-over')) {
                    dcell.classList.add('drag-over');
                }
            });
            dcell.addEventListener('dragleave', () => {
                dcell.classList.remove('drag-over');
            });
            dcell.addEventListener('drop', (e) => {
                e.preventDefault();
                dcell.classList.remove('drag-over');
                const courseId = e.dataTransfer.getData('text/plain');
                const course = activeRoutine.courses.find(c => c.id === courseId);
                if (course) {
                    course.day = parseInt(dcell.dataset.day, 10);
                    course.slotId = dcell.dataset.slotId;
                    renderUI();
                    saveStateToLocalStorage();
                }
            });

            row.appendChild(dcell);
        }
        grid.appendChild(row);
    });

    timetableEl.appendChild(grid);
    timetableEl.style.transform = `scale(${state.zoom})`;
}

function renderColorPalette(paletteElement, inputElement) {
    const theme = localStorage.getItem('theme') || 'grass';
    const colors = themes[theme] || themes.grass;
    paletteElement.innerHTML = '';
    colors.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = color;
        swatch.dataset.color = color;
        swatch.addEventListener('click', () => {
            const allSwatches = paletteElement.querySelectorAll('.color-swatch');
            allSwatches.forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            inputElement.value = color;
        });
        paletteElement.appendChild(swatch);
    });
}