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

function renderTimetableOnly() {
    renderTimetable();
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

    // We only need the copy event listener here
    // The delegated event listener in eventHandlers.js handles this.

}

function renderTimetable() {
    const activeRoutine = getActiveRoutine();
    if (!activeRoutine) return;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const timetableSvg = document.getElementById('timetable');
    timetableSvg.innerHTML = ''; // Clear previous content

    // SVG constants
    const cellWidth = 120;
    const cellHeight = 60;
    const cornerWidth = 110;
    const dayHeadHeight = 60;
    const padding = 6;

    const totalWidth = cornerWidth + (days.length * (cellWidth + padding));
    const totalHeight = dayHeadHeight + (activeRoutine.slots.length * (cellHeight + padding));

    timetableSvg.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`);
    timetableSvg.style.width = '100%';
    timetableSvg.style.height = 'auto';


    function createSvgElement(tag, attributes = {}, content = '') {
        const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (const key in attributes) {
            el.setAttribute(key, attributes[key]);
        }
        if (content) {
            el.textContent = content;
        }
        return el;
    }

    // Render Header
    days.forEach((day, i) => {
        const x = cornerWidth + padding + (i * (cellWidth + padding));
        const dayGroup = createSvgElement('g', { class: 'day-head' });
        dayGroup.appendChild(createSvgElement('rect', { x: x, y: 0, width: cellWidth, height: dayHeadHeight, rx: 10, ry: 10 }));
        const text = createSvgElement('text', { x: x + cellWidth / 2, y: dayHeadHeight / 2 - 5, 'text-anchor': 'middle' }, day);
        const dayNumber = createSvgElement('text', { x: x + cellWidth / 2, y: dayHeadHeight / 2 + 15, 'text-anchor': 'middle', class: 'day-number' }, getFullDayName(i));
        dayGroup.appendChild(text);
        dayGroup.appendChild(dayNumber);
        timetableSvg.appendChild(dayGroup);
    });

    // Render Time Slots and Grid Cells
    activeRoutine.slots.forEach((slot, j) => {
        const y = dayHeadHeight + padding + (j * (cellHeight + padding));

        // Time Cell
        const timeGroup = createSvgElement('g', { class: 'time-cell' });
        timeGroup.appendChild(createSvgElement('rect', { x: 0, y: y, width: cornerWidth, height: cellHeight, rx: 10, ry: 10 }));
        timeGroup.appendChild(createSvgElement('text', { x: cornerWidth / 2, y: y + cellHeight / 2, 'text-anchor': 'middle', 'dominant-baseline': 'middle' }, slot.label));
        timetableSvg.appendChild(timeGroup);

        // Grid Cells
        for (let i = 0; i < days.length; i++) {
            const x = cornerWidth + padding + (i * (cellWidth + padding));
            const cell = createSvgElement('rect', {
                x: x,
                y: y,
                width: cellWidth,
                height: cellHeight,
                class: 'grid-cell',
                'data-day': i,
                'data-slot-id': slot.id,
                rx: 10,
                ry: 10
            });
            timetableSvg.appendChild(cell);
        }
    });

    // Group courses by cell
    const coursesByCell = {};
    activeRoutine.courses.forEach(course => {
        if (course.slotId) {
            const key = `${course.day}-${course.slotId}`;
            if (!coursesByCell[key]) {
                coursesByCell[key] = [];
            }
            coursesByCell[key].push(course);
        }
    });

    // Sort courses within each cell by zIndex
    for (const key in coursesByCell) {
        coursesByCell[key].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    }

    // Render Courses
    for (const key in coursesByCell) {
        const coursesInCell = coursesByCell[key];
        coursesInCell.forEach((course, index) => {
            const slotIndex = activeRoutine.slots.findIndex(s => s.id === course.slotId);
            if (slotIndex === -1) return;

            const x = cornerWidth + padding + (course.day * (cellWidth + padding));
            const y = dayHeadHeight + padding + (slotIndex * (cellHeight + padding));
            const offset = index * 5;

            const courseGroup = createSvgElement('g', {
                transform: `translate(${x + offset}, ${y + offset})`
            });

            const courseBlock = createSvgElement('g', {
                class: 'course-block',
                'data-id': course.id,
                style: `color: ${course.color};`
            });

            if (coursesInCell.length > 1) {
                courseBlock.classList.add('stacked-course');
            }

            const courseRect = createSvgElement('rect', {
                width: cellWidth,
                height: cellHeight,
                fill: course.color,
                rx: 8,
                ry: 8
            });
            courseBlock.appendChild(courseRect);

            const courseName = createSvgElement('text', {
                x: cellWidth / 2,
                y: 25,
                'text-anchor': 'middle',
                class: 'course-title'
            }, course.name);
            courseBlock.appendChild(courseName);

            const courseInfo = createSvgElement('text', {
                x: cellWidth / 2,
                y: 45,
                'text-anchor': 'middle',
                class: 'course-info small'
            }, `${course.section} · ${course.room || ''}`);
            courseBlock.appendChild(courseInfo);
            
            const deleteBtn = createSvgElement('g', { class: 'delete-btn' });
            deleteBtn.appendChild(createSvgElement('circle', { cx: cellWidth - 12, cy: 12, r: 12, fill: '#ff5252' }));
            deleteBtn.appendChild(createSvgElement('text', { x: cellWidth - 12, y: 16, 'text-anchor': 'middle', fill: 'white', style: 'font-size: 16px; font-weight: bold;'}, '×'));
            courseBlock.appendChild(deleteBtn);

            courseGroup.appendChild(courseBlock);
            timetableSvg.appendChild(courseGroup);
            
            courseBlock.addEventListener('mousedown', (e) => {
                // If it's a double-click (e.detail > 1) or delete button click, do not initiate drag
                if (e.detail > 1 || e.target.closest('.delete-btn')) {
                    return;
                }

                e.preventDefault();
                const CTM = timetableSvg.getScreenCTM();
                const mousePos = {
                    x: (e.clientX - CTM.e) / CTM.a,
                    y: (e.clientY - CTM.f) / CTM.d
                };

                state.draggingCourse = {
                    id: course.id,
                    element: courseGroup,
                    offsetX: mousePos.x - (x + offset),
                    offsetY: mousePos.y - (y + offset)
                };
                courseBlock.classList.add('dragging');
            });

            // Prevent click on courseBlock from bubbling up and causing re-render
            courseBlock.addEventListener('click', (e) => {
                // Only stop propagation if it's not the delete button
                if (!e.target.closest('.delete-btn')) {
                    e.stopPropagation();
                }
            });

            

            
        });
    }
    
    timetableSvg.addEventListener('mousemove', (e) => {
        if (state.draggingCourse) {
            e.preventDefault();
            const CTM = timetableSvg.getScreenCTM();
            const mousePos = {
                x: (e.clientX - CTM.e) / CTM.a,
                y: (e.clientY - CTM.f) / CTM.d
            };
            const newX = mousePos.x - state.draggingCourse.offsetX;
            const newY = mousePos.y - state.draggingCourse.offsetY;
            state.draggingCourse.element.setAttribute('transform', `translate(${newX}, ${newY})`);

            timetableSvg.querySelectorAll('.grid-cell').forEach(cell => {
                const bbox = cell.getBBox();
                if (mousePos.x > bbox.x && mousePos.x < bbox.x + bbox.width &&
                    mousePos.y > bbox.y && mousePos.y < bbox.y + bbox.height) {
                    cell.classList.add('drag-over');
                } else {
                    cell.classList.remove('drag-over');
                }
            });
        }
    });

    timetableSvg.addEventListener('mouseup', (e) => {
        if (state.draggingCourse) {
            const CTM = timetableSvg.getScreenCTM();
            const mousePos = {
                x: (e.clientX - CTM.e) / CTM.a,
                y: (e.clientY - CTM.f) / CTM.d
            };

            let droppedOnCell = null;
            timetableSvg.querySelectorAll('.grid-cell').forEach(cell => {
                const bbox = cell.getBBox();
                if (mousePos.x > bbox.x && mousePos.x < bbox.x + bbox.width &&
                    mousePos.y > bbox.y && mousePos.y < bbox.y + bbox.height) {
                    droppedOnCell = cell;
                }
                cell.classList.remove('drag-over');
            });

            if (droppedOnCell) {
                const course = activeRoutine.courses.find(c => c.id === state.draggingCourse.id);
                if (course) {
                    course.day = parseInt(droppedOnCell.dataset.day, 10);
                    course.slotId = droppedOnCell.dataset.slotId;
                    course.zIndex = Date.now(); // Bring to front on drop
                    saveStateToLocalStorage();
                }
            }

            state.draggingCourse = null;
            renderTimetableOnly();
        }
    });
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