// app state
const state = {
    slots: [], // array of {id,label}
    courses: [], // array of {id,name,section,room,day,slotId,color}
    zoom: 1,
    editingCourseId: null,
    isMenuOpen: true,
};

// DOM refs
const body = document.body;
const courseSlotSelect = document.getElementById('course-slot');
const slotsListEl = document.getElementById('slots-list');
const coursesListEl = document.getElementById('courses-list');
const timetableEl = document.getElementById('timetable');
const editModal = document.getElementById('edit-modal');
const editCourseSlotSelect = document.getElementById('edit-course-slot');
const themeSelector = document.getElementById('theme-selector');
const courseColorPalette = document.getElementById('course-color-palette');
const editCourseColorPalette = document.getElementById('edit-course-color-palette');

// Predefined university slots (user-provided):
const predefinedSlots = [
    '8:00-9:30',
    '9:40-11:10',
    '11:20-12:50',
    '13:00-14:30',
    '14:40-16:10',
    '16:20-17:50',
    '18:00-19:30'
];

const themes = {
    lemon: ['#d6b911', '#ffc107', '#ffeb3b', '#ff9800', '#f44336', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3'],
    grass: ['#4a9e4d', '#8bc34a', '#cddc39', '#ffc107', '#ffeb3b', '#ff9800', '#f44336', '#9c27b0', '#673ab7'],
    ocean: ['#2196f3', '#03a9f4', '#00bcd4', '#00e5ff', '#ffeb3b', '#ff9800', '#f44336', '#9c27b0', '#673ab7']
};

function uid(prefix = 'id') {
    return prefix + Math.random().toString(36).slice(2, 9);
}

// initialize
function init() {
    loadStateFromLocalStorage();
    if (state.slots.length === 0) {
        loadPredefinedSlots(false);
    }
    renderUI();
    setTheme(localStorage.getItem('theme') || 'grass');
    themeSelector.value = localStorage.getItem('theme') || 'grass';

    // Check for menu state
    const savedMenuState = localStorage.getItem('isMenuOpen');
    if (savedMenuState !== null) {
        state.isMenuOpen = savedMenuState === 'true';
    }
    toggleMenu(state.isMenuOpen);

    // attach handlers
    document.getElementById('add-course').addEventListener('click', onAddCourse);
    document.getElementById('clear-form').addEventListener('click', clearForm);
    document.getElementById('add-slot').addEventListener('click', onAddSlot);
    document.getElementById('load-predefined').addEventListener('click', () => {
        loadPredefinedSlots(true);
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

    // keyboard shortcuts
    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            exportPDF();
        }
    });
}

function saveStateToLocalStorage() {
    localStorage.setItem('routineAppState', JSON.stringify(state));
}

function loadStateFromLocalStorage() {
    try {
        const savedState = JSON.parse(localStorage.getItem('routineAppState'));
        if (savedState) {
            state.slots = savedState.slots;
            state.courses = savedState.courses;
            state.zoom = savedState.zoom || 1;
        }
    } catch (e) {
        console.error('Failed to load state from localStorage', e);
    }
}

function renderUI() {
    renderSlotOptions();
    renderEditSlotOptions();
    renderSlotsList();
    renderCoursesList();
    renderTimetable();
    renderColorPalette(courseColorPalette, document.getElementById('course-color'));
    renderColorPalette(editCourseColorPalette, document.getElementById('edit-course-color'));
}

function loadPredefinedSlots(refreshUI = true) {
    state.slots = predefinedSlots.map(s => ({
        id: uid('slot_'),
        label: s
    }));
    if (refreshUI) {
        state.courses = state.courses.map(c => ({
            ...c,
            slotId: null
        }));
        renderUI();
        toast('Predefined slots loaded. Courses were unassigned.');
    }
    saveStateToLocalStorage();
}

function renderSlotOptions() {
    // populate <select> for adding courses
    courseSlotSelect.innerHTML = '';
    state.slots.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = s.label;
        courseSlotSelect.appendChild(opt);
    });
}

function renderEditSlotOptions() {
    editCourseSlotSelect.innerHTML = '';
    state.slots.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = s.label;
        editCourseSlotSelect.appendChild(opt);
    });
}

function renderSlotsList() {
    slotsListEl.innerHTML = '';
    if (state.slots.length === 0) {
        slotsListEl.innerHTML = '<div class="muted">No slots yet.</div>';
    }
    state.slots.forEach(s => {
        const div = document.createElement('div');
        div.className = 'list-item slot-item';
        div.innerHTML = `
            <div>${escapeHtml(s.label)}</div>
            <div class="row-actions">
                <button class="small" data-id="${s.id}" data-action="remove">Remove</button>
            </div>
        `;
        slotsListEl.appendChild(div);
    });

    // attach remove handlers
    slotsListEl.querySelectorAll('button[data-action="remove"]').forEach(b => b.addEventListener('click', (ev) => {
        const id = ev.currentTarget.dataset.id;
        state.slots = state.slots.filter(x => x.id !== id);
        // also drop courses in that slot
        state.courses = state.courses.map(c => c.slotId === id ? {
            ...c,
            slotId: null
        } : c);
        renderUI();
        saveStateToLocalStorage();
        toast('Slot removed.');
    }));
}

function onAddSlot() {
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
    state.slots.push({
        id: uid('slot_'),
        label
    });

    // Sort slots by time
    state.slots.sort((a, b) => {
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
    const name = document.getElementById('course-name').value.trim().toUpperCase();
    const section = document.getElementById('course-section').value.trim();
    const room = document.getElementById('course-room').value.trim();
    const day = parseInt(document.getElementById('course-day').value, 10);
    const slotId = document.getElementById('course-slot').value || null;
    const color = document.getElementById('course-color').value;
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
    state.courses.push(c);
    clearForm();
    renderUI();
    saveStateToLocalStorage();
    toast('Course added!');
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

function renderCoursesList() {
    coursesListEl.innerHTML = '';
    if (state.courses.length === 0) {
        coursesListEl.innerHTML = '<div class="muted">No courses yet</div>';
        return;
    }
    state.courses.forEach(c => {
        const el = document.createElement('div');
        el.className = 'list-item course-item';
        const slotLabel = state.slots.find(s => s.id === c.slotId)?.label || '<em>no slot</em>';
        const dayName = getFullDayName(c.day);
        el.innerHTML = `
            <div class="course-meta">
                <div class="course-dot" style="background:${c.color}"></div>
                <div>
                    <div class="course-name">${escapeHtml(c.name)} <span>${escapeHtml(c.section)}</span></div>
                    <div class="course-details">${dayName} · ${slotLabel} · ${escapeHtml(c.room || '')}</div>
                </div>
            </div>
            <div class="row-actions">
                <button class="small" data-id="${c.id}" data-action="edit">Edit</button>
                <button class="small" data-id="${c.id}" data-action="remove">Remove</button>
            </div>`;
        coursesListEl.appendChild(el);
    });

    // attach handlers
    coursesListEl.querySelectorAll('button').forEach(b => b.addEventListener('click', (ev) => {
        const id = ev.currentTarget.dataset.id;
        const act = ev.currentTarget.dataset.action;
        if (act === 'remove') {
            state.courses = state.courses.filter(x => x.id !== id);
            renderUI();
            saveStateToLocalStorage();
            toast('Course removed.');
        } else if (act === 'edit') {
            openEditModal(id);
        }
    }));
}

function openEditModal(courseId) {
    const course = state.courses.find(x => x.id === courseId);
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

function onSaveEditedCourse() {
    const courseId = state.editingCourseId;
    const course = state.courses.find(c => c.id === courseId);
    if (!course) return;

    course.name = document.getElementById('edit-course-name').value.trim().toUpperCase();
    course.section = document.getElementById('edit-course-section').value.trim();
    course.room = document.getElementById('edit-course-room').value.trim();
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

function renderTimetable() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    timetableEl.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'grid';
    const headerRow = document.createElement('div');
    headerRow.className = 'grid-row header-row';

    headerRow.appendChild(cell('', 'corner'));
    days.forEach((d, i) => headerRow.appendChild(cell(d + `<div class="day-number">${getFullDayName(i)}</div>`, 'day-head')));
    grid.appendChild(headerRow);

    const slotOrder = state.slots;
    slotOrder.forEach(slot => {
        const row = document.createElement('div');
        row.className = 'grid-row';
        row.appendChild(cell(slot.label, 'time-cell'));

        for (let day = 0; day < 7; day++) {
            const dcell = document.createElement('div');
            dcell.className = 'grid-cell';
            dcell.dataset.slotId = slot.id;
            dcell.dataset.day = day;

            const course = state.courses.find(c => c.day === day && c.slotId === slot.id);
            if (course) {
                const block = document.createElement('div');
                block.className = 'course-block';
                block.draggable = true;
                block.dataset.id = course.id;
                block.innerHTML = `
                    <div class="course-title">${escapeHtml(course.name)}</div>
                    <div class="course-info small">${escapeHtml(course.section)} · ${escapeHtml(course.room || '')}</div>
                `;
                block.style.background = course.color || '#7c4dff';
                dcell.appendChild(block);

                block.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', course.id);
                    setTimeout(() => block.classList.add('dragging'), 0);
                });
                block.addEventListener('dragend', () => {
                    block.classList.remove('dragging');
                });
                block.addEventListener('dblclick', () => {
                    openEditModal(course.id);
                });
            }

            dcell.addEventListener('dragover', (e) => e.preventDefault());
            dcell.addEventListener('drop', (e) => {
                e.preventDefault();
                const courseId = e.dataTransfer.getData('text/plain');
                const course = state.courses.find(c => c.id === courseId);
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

// utility helpers
function cell(html, cls = '') {
    const d = document.createElement('div');
    d.className = 'grid-cell ' + cls;
    d.innerHTML = html;
    return d;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (c) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[c] || c));
}

function getFullDayName(i) {
    const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return names[i];
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
// Random color generation
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Update the `onRandomizeColors` function in script.js.
function onRandomizeColors() {
    const theme = localStorage.getItem('theme') || 'grass';
    const colors = themes[theme] || themes.grass;
    
    // Create a shuffled copy of the color palette
    const shuffledColors = shuffleArray([...colors]);
    
    // Assign a unique color to each course, repeating if necessary
    state.courses.forEach((course, index) => {
        // Use the modulo operator (%) to loop through the colors
        const colorIndex = index % shuffledColors.length;
        course.color = shuffledColors[colorIndex];
    });

    renderUI();
    saveStateToLocalStorage();
    toast('Course colors randomized!');
}

// export functions
async function exportPNG() {
    const node = timetableEl;
    const origTransform = node.style.transform;
    node.style.transform = 'scale(1)';
    const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        backgroundColor: null
    });
    node.style.transform = origTransform;
    const dataUrl = canvas.toDataURL('image/png');

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'routine.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast('Exported as PNG!');
}

async function exportPDF() {
    const node = timetableEl;
    const origTransform = node.style.transform;
    node.style.transform = 'scale(1)';
    const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
    });
    node.style.transform = origTransform;
    const imgData = canvas.toDataURL('image/png');
    const {
        jsPDF
    } = window.jspdf;
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('routine.pdf');
    toast('Exported as PDF!');
}

// zoom helpers
function changeZoom(delta) {
    setZoom(state.zoom + delta);
}

function setZoom(v) {
    state.zoom = Math.max(0.6, Math.min(1.6, Number(v.toFixed(2))));
    renderTimetable();
    saveStateToLocalStorage();
}

// theme changer
function setTheme(themeName) {
    body.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
    renderColorPalette(courseColorPalette, document.getElementById('course-color'));
    renderColorPalette(editCourseColorPalette, document.getElementById('edit-course-color'));
}

// menu toggle
function toggleMenu(forceState) {
    state.isMenuOpen = forceState !== undefined ? forceState : !state.isMenuOpen;
    body.classList.toggle('menu-closed', !state.isMenuOpen);
    localStorage.setItem('isMenuOpen', state.isMenuOpen);

    // Animate timetable scaling for a smooth transition
    setTimeout(() => {
        timetableEl.style.transform = `scale(${state.zoom})`;
    }, 300); // matches CSS transition duration
}


// tiny toast
function toast(msg) {
    const container = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    container.appendChild(t);
    setTimeout(() => t.classList.add('visible'), 20);
    setTimeout(() => {
        t.classList.remove('visible');
        setTimeout(() => t.remove(), 300);
    }, 2200);
}

document.addEventListener('DOMContentLoaded', init);