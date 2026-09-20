import { store } from '../store/routineStore';
import { DAYS_FULL, THEMES } from '../types/constants';
import { escapeHtml } from '../services/utils';

export function renderSidebar(container: HTMLElement): void {
  const state = store.getState();
  const routine = store.getActiveRoutine();
  if (!routine) return;

  const theme = THEMES[state.theme];
  const coursesCount = routine.courses.length;
  const slotsCount = routine.slots.length;
  const prefill = state.selectedCell;

  container.innerHTML = `
    <aside class="${state.sidebarOpen ? 'w-full md:w-80 lg:w-88' : 'hidden'} shrink-0 transition-all duration-200">
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-full max-h-[calc(100vh-80px)]">
        
        <!-- Segmented Tab Navigation -->
        <div class="p-2 border-b border-slate-100 bg-slate-50/60">
          <div class="grid grid-cols-3 gap-1 bg-slate-200/60 p-1 rounded-xl text-xs font-semibold">
            <button id="tab-btn-add" class="py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              state.activeTab === 'add' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }">
              <span>+ Add</span>
            </button>
            <button id="tab-btn-courses" class="py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              state.activeTab === 'courses' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }">
              <span>Courses</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-full ${state.activeTab === 'courses' ? 'bg-slate-900 text-white' : 'bg-slate-300/80 text-slate-700'}">${coursesCount}</span>
            </button>
            <button id="tab-btn-slots" class="py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              state.activeTab === 'slots' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }">
              <span>Slots</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-full ${state.activeTab === 'slots' ? 'bg-slate-900 text-white' : 'bg-slate-300/80 text-slate-700'}">${slotsCount}</span>
            </button>
          </div>
        </div>

        <!-- Tab 1: Add Course -->
        <div id="pane-add" class="${state.activeTab === 'add' ? 'block' : 'hidden'} p-4 overflow-y-auto space-y-3.5 flex-1">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold text-slate-900 tracking-tight">Add Course Slot</h2>
            ${
              prefill
                ? `<span class="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Cell selected</span>`
                : ''
            }
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Course Title</label>
            <input id="input-course-name" type="text" placeholder="e.g. Distributed Systems" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400" />
          </div>

          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Section</label>
              <input id="input-course-section" type="text" placeholder="e.g. A1" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400" />
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Room</label>
              <input id="input-course-room" type="text" placeholder="e.g. Lab 402" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Day</label>
              <select id="input-course-day" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none cursor-pointer">
                ${DAYS_FULL.map((d, i) => `<option value="${i}" ${prefill && prefill.day === i ? 'selected' : ''}>${d}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Time Slot</label>
              <select id="input-course-slot" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none cursor-pointer">
                ${routine.slots.map((s) => `<option value="${s.id}" ${prefill && prefill.slotId === s.id ? 'selected' : ''}>${s.label}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Color Palette Picker -->
          <div>
            <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Badge Color</label>
            <div id="course-color-swatches" class="flex flex-wrap gap-2">
              ${theme.swatches
                .map(
                  (c, idx) => `
                <button type="button" data-color="${c}" class="w-6 h-6 rounded-full transition-transform hover:scale-110 cursor-pointer border-2 ${
                    idx === 0 ? 'border-slate-800 scale-105' : 'border-transparent'
                  }" style="background-color: ${c};"></button>
              `
                )
                .join('')}
            </div>
            <input id="input-course-color" type="hidden" value="${theme.swatches[0]}" />
          </div>

          <div class="pt-2 flex gap-2">
            <button id="btn-submit-course" class="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 transition-opacity cursor-pointer" style="background-color: ${theme.primary};">
              Add to Schedule
            </button>
            <button id="btn-reset-course-form" class="py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
              Clear
            </button>
          </div>
        </div>

        <!-- Tab 2: Courses List -->
        <div id="pane-courses" class="${state.activeTab === 'courses' ? 'block' : 'hidden'} p-3 overflow-y-auto flex-1 space-y-2">
          ${
            routine.courses.length === 0
              ? `<div class="text-center py-10 text-xs text-slate-400">No courses scheduled yet.<br>Click any empty slot in the grid or use "+ Add".</div>`
              : routine.courses
                  .map((c) => {
                    const slotLabel = routine.slots.find((s) => s.id === c.slotId)?.label || 'Unassigned';
                    const dayName = DAYS_FULL[c.day] || '';
                    return `
                <div class="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex items-center justify-between group">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <span class="w-3 h-3 rounded-full shrink-0" style="background-color: ${c.color}"></span>
                    <div class="min-w-0">
                      <p class="text-xs font-bold text-slate-900 truncate">${escapeHtml(c.name)}</p>
                      <p class="text-[10px] text-slate-500 truncate">${escapeHtml(c.section)} • ${escapeHtml(c.room)} • ${dayName} (${slotLabel})</p>
                    </div>
                  </div>
                  <button data-delete-course="${c.id}" class="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0" title="Delete Course">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
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
            <button id="btn-load-defaults" class="text-[11px] text-slate-500 hover:text-slate-800 font-medium underline cursor-pointer">Reset default slots</button>
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

  // Submit Add Course
  container.querySelector('#btn-submit-course')?.addEventListener('click', () => {
    const nameInput = container.querySelector('#input-course-name') as HTMLInputElement;
    const secInput = container.querySelector('#input-course-section') as HTMLInputElement;
    const roomInput = container.querySelector('#input-course-room') as HTMLInputElement;
    const dayInput = container.querySelector('#input-course-day') as HTMLSelectElement;
    const slotInput = container.querySelector('#input-course-slot') as HTMLSelectElement;

    const name = nameInput.value.trim();
    if (!name) {
      nameInput.focus();
      return;
    }

    store.addCourse({
      name,
      section: secInput.value.trim(),
      room: roomInput.value.trim(),
      day: parseInt(dayInput.value, 10),
      slotId: slotInput.value || null,
      color: colorInput.value || theme.swatches[0],
    });

    nameInput.value = '';
    secInput.value = '';
    roomInput.value = '';
    store.setSelectedCell(null);
  });

  // Clear Form
  container.querySelector('#btn-reset-course-form')?.addEventListener('click', () => {
    (container.querySelector('#input-course-name') as HTMLInputElement).value = '';
    (container.querySelector('#input-course-section') as HTMLInputElement).value = '';
    (container.querySelector('#input-course-room') as HTMLInputElement).value = '';
    store.setSelectedCell(null);
  });

  // Delete Course
  container.querySelectorAll('[data-delete-course]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.deleteCourse;
      if (id) store.deleteCourse(id);
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
