import { store } from '../store/routineStore';
import { DAYS_FULL, THEMES } from '../types/constants';
import { escapeHtml } from '../services/utils';

export function renderSidebar(container: HTMLElement): void {
  const state = store.getState();
  const routine = store.getActiveRoutine();
  if (!routine) return;

  const theme = THEMES[state.theme];
  // Calculate unique courses count (grouping by courseGroupId or name+section+color)
  const courseGroups = new Map<string, typeof routine.courses>();
  for (const c of routine.courses) {
    const key = c.courseGroupId || `standalone_${c.name}_${c.section}_${c.color}`;
    if (!courseGroups.has(key)) {
      courseGroups.set(key, []);
    }
    courseGroups.get(key)!.push(c);
  }
  const coursesCount = courseGroups.size;
  const slotsCount = routine.slots.length;
  const prefill = state.selectedCell;

  const editingCourse = state.editingCourseId
    ? routine.courses.find((c) => c.id === state.editingCourseId) || null
    : null;

  // If editing a course, collect all linked sibling instances
  const editingSiblings = editingCourse
    ? routine.courses.filter((c) =>
        c.id === editingCourse.id ||
        (editingCourse.courseGroupId
          ? c.courseGroupId === editingCourse.courseGroupId
          : c.name === editingCourse.name && c.section === editingCourse.section && c.color === editingCourse.color)
      )
    : [];

  const editingDays = new Set(editingSiblings.map((c) => c.day));
  const editingSlotIds = new Set(editingSiblings.map((c) => c.slotId).filter(Boolean));

  container.innerHTML = `
    <aside class="${state.sidebarOpen ? 'w-full md:w-80 lg:w-88' : 'hidden'} shrink-0 transition-all duration-300">
      <div class="bg-white rounded-2xl shadow-xs overflow-hidden flex flex-col h-full max-h-[calc(100vh-80px)] border transition-all duration-300" style="border-color: ${theme.border};">
        
        <!-- Minimal Underline Tab Navigation -->
        <div class="px-4 pt-1 border-b transition-colors duration-300" style="border-color: ${theme.border}; background-color: ${theme.bg};">
          <div class="flex items-center gap-6 text-xs font-semibold">
            <!-- Add / Edit Tab -->
            <button id="tab-btn-add" class="relative pb-2.5 pt-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
              state.activeTab === 'add' ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-600'
            }">
              <svg class="w-3.5 h-3.5 ${state.activeTab === 'add' ? '' : 'text-slate-400'}" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" ${state.activeTab === 'add' ? `style="color: ${theme.primary};"` : ''}>
                ${
                  editingCourse
                    ? `<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>`
                    : `<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>`
                }
              </svg>
              <span>${editingCourse ? 'Edit' : 'Add'}</span>
              ${
                state.activeTab === 'add'
                  ? `<div class="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all" style="background-color: ${theme.primary};"></div>`
                  : ''
              }
            </button>

            <!-- Courses Tab -->
            <button id="tab-btn-courses" class="relative pb-2.5 pt-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
              state.activeTab === 'courses' ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-600'
            }">
              <span>Courses</span>
              <span class="text-[10px] font-bold px-1.5 py-0.2 rounded-full transition-colors ${
                state.activeTab === 'courses' ? 'text-white' : 'bg-slate-100 text-slate-500'
              }" ${state.activeTab === 'courses' ? `style="background-color: ${theme.primary};"` : ''}>${coursesCount}</span>
              ${
                state.activeTab === 'courses'
                  ? `<div class="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all" style="background-color: ${theme.primary};"></div>`
                  : ''
              }
            </button>

            <!-- Slots Tab -->
            <button id="tab-btn-slots" class="relative pb-2.5 pt-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
              state.activeTab === 'slots' ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-600'
            }">
              <span>Slots</span>
              <span class="text-[10px] font-bold px-1.5 py-0.2 rounded-full transition-colors ${
                state.activeTab === 'slots' ? 'text-white' : 'bg-slate-100 text-slate-500'
              }" ${state.activeTab === 'slots' ? `style="background-color: ${theme.primary};"` : ''}>${slotsCount}</span>
              ${
                state.activeTab === 'slots'
                  ? `<div class="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all" style="background-color: ${theme.primary};"></div>`
                  : ''
              }
            </button>
          </div>
        </div>

        <!-- Tab 1: Add/Edit Course -->
        <div id="pane-add" class="${state.activeTab === 'add' ? 'block' : 'hidden'} p-4 overflow-y-auto space-y-3 flex-1">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              ${editingCourse ? '<span>Edit Course</span>' : '<span>Add Course</span>'}
              ${editingSiblings.length > 1 ? `<span class="text-[10px] font-normal text-slate-500">(${editingSiblings.length} linked slots)</span>` : ''}
            </h2>
            ${
              editingCourse
                ? `<button id="btn-cancel-edit-mode" class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer border border-amber-200">Cancel Edit</button>`
                : prefill
                ? `<span class="text-[11px] font-bold px-2 py-0.5 rounded-md border" style="background-color: ${theme.badgeBg}; color: ${theme.accent}; border-color: ${theme.border};">Cell selected</span>`
                : ''
            }
          </div>

          ${
            editingCourse && editingSiblings.length > 1
              ? `<div class="p-2 rounded-xl bg-sky-50 border border-sky-100 text-[11px] text-sky-800 flex items-start gap-2">
                   <svg class="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                   <span>Editing will automatically update all <b>${editingSiblings.length} scheduled instances</b> of this course.</span>
                 </div>`
              : ''
          }

          <div>
            <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Course Title</label>
            <input id="input-course-name" type="text" value="${escapeHtml(editingCourse?.name || '')}" placeholder="e.g. Distributed Systems" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400" />
          </div>

          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Section</label>
              <input id="input-course-section" type="text" value="${escapeHtml(editingCourse?.section || '')}" placeholder="e.g. A1" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400" />
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Room</label>
              <input id="input-course-room" type="text" value="${escapeHtml(editingCourse?.room || '')}" placeholder="e.g. 402" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400" />
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Faculty</label>
              <input id="input-course-faculty" type="text" value="${escapeHtml(editingCourse?.faculty || '')}" placeholder="e.g. MRA" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400" />
            </div>
          </div>

          <!-- Days Selection (Checkboxes / Chips) -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Days of Week</label>
              <span class="text-[10px] text-slate-400">Select one or more</span>
            </div>
            <div class="grid grid-cols-4 sm:grid-cols-7 gap-1" id="course-days-checkboxes">
              ${DAYS_FULL.map((name, idx) => {
                const isChecked = editingCourse ? editingDays.has(idx) : prefill ? prefill.day === idx : idx === 0;
                return `
                  <label class="flex flex-col items-center justify-center p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100/80 cursor-pointer text-center select-none transition-colors has-[:checked]:bg-slate-900 has-[:checked]:text-white has-[:checked]:border-slate-900">
                    <input type="checkbox" name="course-day" value="${idx}" ${isChecked ? 'checked' : ''} class="sr-only" />
                    <span class="text-[11px] font-bold">${name.slice(0, 3)}</span>
                  </label>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Time Slots Selection (Checkboxes / Chips) -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Time Slots</label>
              <span class="text-[10px] text-slate-400">Select one or more</span>
            </div>
            <div class="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50/50 rounded-xl border border-slate-200" id="course-slots-checkboxes">
              ${
                routine.slots.length === 0
                  ? `<div class="col-span-2 text-center py-2 text-[11px] text-slate-400">No time slots yet. Add slots in the "Slots" tab.</div>`
                  : routine.slots
                      .map((s, idx) => {
                        const isChecked = editingCourse ? editingSlotIds.has(s.id) : prefill ? prefill.slotId === s.id : idx === 0;
                        return `
                        <label class="flex items-center gap-1.5 p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer select-none transition-colors has-[:checked]:bg-slate-900 has-[:checked]:text-white has-[:checked]:border-slate-900">
                          <input type="checkbox" name="course-slot" value="${s.id}" ${isChecked ? 'checked' : ''} class="sr-only" />
                          <span class="text-[11px] font-semibold truncate">${escapeHtml(s.label)}</span>
                        </label>
                      `;
                      })
                      .join('')
              }
            </div>
          </div>

          <!-- Color Palette Picker -->
          <div>
            <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Badge Color</label>
            <div id="course-color-swatches" class="flex flex-wrap gap-2">
              ${theme.swatches
                .map((c) => {
                  const activeColor = editingCourse?.color || theme.swatches[0];
                  const isSelected = c.toLowerCase() === activeColor.toLowerCase();
                  return `
                <button type="button" data-color="${c}" class="w-6 h-6 rounded-full transition-transform hover:scale-110 cursor-pointer border-2 ${
                    isSelected ? 'border-slate-800 scale-105' : 'border-transparent'
                  }" style="background-color: ${c};"></button>
              `;
                })
                .join('')}
            </div>
            <input id="input-course-color" type="hidden" value="${editingCourse?.color || theme.swatches[0]}" />
          </div>

          <div class="pt-2 flex gap-2">
            <button id="btn-submit-course" class="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 transition-opacity cursor-pointer" style="background-color: ${theme.primary};">
              ${editingCourse ? 'Save Changes' : 'Add to Schedule'}
            </button>
            <button id="btn-reset-course-form" class="py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
              ${editingCourse ? 'Cancel' : 'Clear'}
            </button>
          </div>
        </div>

        <!-- Tab 2: Courses List -->
        <div id="pane-courses" class="${state.activeTab === 'courses' ? 'block' : 'hidden'} p-3 overflow-y-auto flex-1 space-y-2">
          ${
            courseGroups.size === 0
              ? `<div class="text-center py-10 text-xs text-slate-400">No courses scheduled yet.<br>Click any empty slot in the grid or use "+ Add".</div>`
              : Array.from(courseGroups.entries())
                  .map(([groupKey, instances]) => {
                    const primary = instances[0];
                    const uniqueDays = Array.from(new Set(instances.map((i) => i.day))).sort();
                    const daysSummary = uniqueDays.map((d) => DAYS_FULL[d]?.slice(0, 3) || '').join(', ');

                    const uniqueSlotIds = Array.from(new Set(instances.map((i) => i.slotId).filter(Boolean)));
                    const slotsSummary = uniqueSlotIds
                      .map((sid) => routine.slots.find((s) => s.id === sid)?.label || 'Slot')
                      .join(', ') || 'Unassigned';

                    const details = [primary.section, primary.room, primary.faculty ? `Faculty: ${primary.faculty}` : '']
                      .filter(Boolean)
                      .map(escapeHtml)
                      .join(' • ');

                    const hasConflict = instances.some((inst) => {
                      return routine.courses.some((other) => other.id !== inst.id && other.day === inst.day && other.slotId === inst.slotId);
                    });

                    return `
                <div class="p-2.5 rounded-xl border ${hasConflict ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200/80 bg-slate-50/50'} hover:bg-white hover:border-slate-300 transition-all flex items-center justify-between group">
                  <div class="flex items-center gap-2.5 min-w-0 flex-1">
                    <span class="w-3 h-3 rounded-full shrink-0" style="background-color: ${primary.color}"></span>
                    <div class="min-w-0">
                      <div class="flex items-center gap-1.5">
                        <p class="text-xs font-bold text-slate-900 truncate">${escapeHtml(primary.name)}</p>
                        ${
                          hasConflict
                            ? `<span class="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 flex items-center gap-1" title="Time slot clash detected">
                                <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                Conflict
                              </span>`
                            : ''
                        }
                        ${
                          instances.length > 1
                            ? `<span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700">${instances.length} slots</span>`
                            : ''
                        }
                      </div>
                      <p class="text-[10px] ${hasConflict ? 'text-rose-600 font-medium' : 'text-slate-500'} truncate">
                        ${details ? `${details} • ` : ''}${daysSummary} (${slotsSummary})
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <button data-edit-course-item="${primary.id}" class="p-1 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer" title="Edit Course">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button data-delete-course-group="${groupKey}" class="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer" title="Delete Course">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              `;
                  })
                  .join('')
          }
        </div>

        <!-- Tab 3: Slots Manager -->
        <div id="pane-slots" class="${state.activeTab === 'slots' ? 'block' : 'hidden'} p-3 overflow-y-auto flex-1 space-y-3">
          <!-- Add Slot Inline -->
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <label class="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Add Time Slot</label>
            <div class="flex items-center gap-1.5">
              <input id="input-new-slot-start" type="time" class="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs" />
              <span class="text-xs text-slate-400">-</span>
              <input id="input-new-slot-end" type="time" class="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs" />
              <button id="btn-add-slot-submit" class="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs hover:opacity-90 cursor-pointer" style="background-color: ${theme.primary}">Add</button>
            </div>
          </div>

          <div class="flex items-center justify-between pt-1">
            <span class="text-xs font-bold text-slate-700">Active Slots (${routine.slots.length})</span>
            <button id="btn-load-defaults" class="text-[11px] text-slate-500 hover:text-slate-800 font-medium underline cursor-pointer">Load NSU slots</button>
          </div>

          <div class="space-y-1.5">
            ${routine.slots
              .map(
                (s) => `
              <div class="p-2 rounded-xl border border-slate-200/80 bg-white flex items-center justify-between text-xs">
                <span class="font-bold text-slate-800">${s.label}</span>
                <button data-remove-slot="${s.id}" class="text-[11px] text-slate-400 hover:text-rose-600 font-medium cursor-pointer">Remove</button>
              </div>
            `
              )
              .join('')}
          </div>
        </div>

      </div>
    </aside>
  `;

  // Tabs events
  container.querySelector('#tab-btn-add')?.addEventListener('click', () => store.setActiveTab('add'));
  container.querySelector('#tab-btn-courses')?.addEventListener('click', () => store.setActiveTab('courses'));
  container.querySelector('#tab-btn-slots')?.addEventListener('click', () => store.setActiveTab('slots'));

  // Color Swatch Selection
  const colorInput = container.querySelector('#input-course-color') as HTMLInputElement;
  container.querySelectorAll('#course-color-swatches button').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      const color = target.dataset.color || '#0284c7';
      colorInput.value = color;
      container.querySelectorAll('#course-color-swatches button').forEach((b) => {
        b.classList.remove('border-slate-800', 'scale-105');
        b.classList.add('border-transparent');
      });
      target.classList.remove('border-transparent');
      target.classList.add('border-slate-800', 'scale-105');
    });
  });

  // Cancel Edit Mode
  container.querySelector('#btn-cancel-edit-mode')?.addEventListener('click', () => {
    store.clearEditingCourse();
  });

  // Submit Course (Add or Edit with Multi-Day / Multi-Slot Support)
  container.querySelector('#btn-submit-course')?.addEventListener('click', () => {
    const nameInput = container.querySelector('#input-course-name') as HTMLInputElement;
    const secInput = container.querySelector('#input-course-section') as HTMLInputElement;
    const roomInput = container.querySelector('#input-course-room') as HTMLInputElement;
    const facultyInput = container.querySelector('#input-course-faculty') as HTMLInputElement;

    const checkedDayBoxes = container.querySelectorAll<HTMLInputElement>('input[name="course-day"]:checked');
    const selectedDays = Array.from(checkedDayBoxes).map((cb) => parseInt(cb.value, 10));

    const checkedSlotBoxes = container.querySelectorAll<HTMLInputElement>('input[name="course-slot"]:checked');
    const selectedSlotIds = Array.from(checkedSlotBoxes).map((cb) => cb.value);

    const name = nameInput.value.trim();
    if (!name) {
      nameInput.focus();
      return;
    }

    if (selectedDays.length === 0) {
      alert('Please select at least one day.');
      return;
    }

    if (selectedSlotIds.length === 0) {
      alert('Please select at least one time slot.');
      return;
    }

    if (editingCourse) {
      // Update all instances of this course group
      store.updateCourseGroup(
        editingCourse.id,
        {
          name,
          section: secInput.value.trim(),
          room: roomInput.value.trim(),
          faculty: facultyInput.value.trim(),
          color: colorInput.value || theme.swatches[0],
        },
        selectedDays,
        selectedSlotIds
      );
    } else {
      store.addCourseMultiSchedule(
        {
          name,
          section: secInput.value.trim(),
          room: roomInput.value.trim(),
          faculty: facultyInput.value.trim(),
          color: colorInput.value || theme.swatches[0],
        },
        selectedDays,
        selectedSlotIds
      );
    }

    nameInput.value = '';
    secInput.value = '';
    roomInput.value = '';
    facultyInput.value = '';
    store.setSelectedCell(null);
  });

  // Clear / Cancel Form
  container.querySelector('#btn-reset-course-form')?.addEventListener('click', () => {
    if (editingCourse) {
      store.clearEditingCourse();
      return;
    }
    (container.querySelector('#input-course-name') as HTMLInputElement).value = '';
    (container.querySelector('#input-course-section') as HTMLInputElement).value = '';
    (container.querySelector('#input-course-room') as HTMLInputElement).value = '';
    (container.querySelector('#input-course-faculty') as HTMLInputElement).value = '';
    container.querySelectorAll<HTMLInputElement>('input[name="course-day"]').forEach((cb, idx) => {
      cb.checked = idx === 0;
    });
    container.querySelectorAll<HTMLInputElement>('input[name="course-slot"]').forEach((cb, idx) => {
      cb.checked = idx === 0;
    });
    store.setSelectedCell(null);
  });

  // Edit Course from Courses tab
  container.querySelectorAll('[data-edit-course-item]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const courseId = (e.currentTarget as HTMLElement).dataset.editCourseItem;
      if (courseId) {
        store.setEditingCourse(courseId);
      }
    });
  });

  // Delete Course Group
  container.querySelectorAll('[data-delete-course-group]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const groupKey = (e.currentTarget as HTMLElement).dataset.deleteCourseGroup;
      if (groupKey) {
        if (groupKey.startsWith('standalone_')) {
          // Find matching courses in this fallback standalone group
          const matching = courseGroups.get(groupKey);
          if (matching) {
            matching.forEach((c) => store.deleteCourse(c.id));
          }
        } else {
          store.deleteCourseGroup(groupKey);
        }
      }
    });
  });

  // Add Slot
  container.querySelector('#btn-add-slot-submit')?.addEventListener('click', () => {
    const start = (container.querySelector('#input-new-slot-start') as HTMLInputElement).value;
    const end = (container.querySelector('#input-new-slot-end') as HTMLInputElement).value;
    if (start && end) {
      if (start >= end) {
        alert('End time must be after start time.');
        return;
      }
      store.addSlot(`${start}-${end}`);
    }
  });

  // Remove Slot
  container.querySelectorAll('[data-remove-slot]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.removeSlot;
      if (id) store.removeSlot(id);
    });
  });

  // Load defaults
  container.querySelector('#btn-load-defaults')?.addEventListener('click', () => {
    if (confirm('Reset slots to defaults? This will unassign existing course slots.')) {
      store.loadDefaultSlots();
    }
  });
}
