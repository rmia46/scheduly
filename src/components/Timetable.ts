import { store } from '../store/routineStore';
import { DAYS_SHORT, DAYS_FULL } from '../types/constants';
import { escapeHtml, getContrastColor, hexToRgb } from '../services/utils';

export function renderTimetable(container: HTMLElement): void {
  const routine = store.getActiveRoutine();
  if (!routine) return;

  const state = store.getState();

  container.innerHTML = `
    <div class="flex-1 min-w-0 flex flex-col print-card">
      <div id="timetable-capture-area" class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-6 overflow-hidden flex flex-col">
        
        <!-- Editable Routine Title -->
        <div class="mb-4 text-center">
          <input id="input-routine-name" type="text" value="${escapeHtml(routine.name)}" placeholder="Routine Name..." class="text-xl sm:text-2xl font-extrabold text-slate-900 text-center bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none px-2 py-0.5 transition-colors" />
        </div>

        <!-- Timetable Scroll Wrapper for Mobile -->
        <div class="overflow-x-auto overflow-y-visible pb-2 select-none">
          <div class="min-w-[650px] border border-slate-200/80 rounded-xl overflow-hidden bg-slate-50/50">
            
            <!-- Grid Header Row (Days) -->
            <div class="grid grid-cols-8 border-b border-slate-200 text-xs font-bold text-slate-600 bg-slate-100/80">
              <div class="p-2.5 text-center border-r border-slate-200 bg-slate-200/50 font-semibold text-[11px] text-slate-500">
                Time / Day
              </div>
              ${DAYS_SHORT.map(
                (d, idx) => `
                <div class="p-2 text-center border-r last:border-r-0 border-slate-200">
                  <span class="block text-slate-900">${d}</span>
                  <span class="block text-[10px] font-normal text-slate-400 leading-tight hidden sm:block">${DAYS_FULL[idx]}</span>
                </div>
              `
              ).join('')}
            </div>

            <!-- Grid Rows (Slots) -->
            ${routine.slots
              .map((slot) => {
                return `
                <div class="grid grid-cols-8 border-b last:border-b-0 border-slate-200/80 text-xs">
                  <!-- Time Column -->
                  <div class="p-2 text-center border-r border-slate-200/80 bg-slate-50 font-bold text-[11px] text-slate-600 flex items-center justify-center">
                    ${slot.label}
                  </div>

                  <!-- 7 Day Cells -->
                  ${[0, 1, 2, 3, 4, 5, 6]
                    .map((dayIdx) => {
                      const matches = routine.courses.filter((c) => c.day === dayIdx && c.slotId === slot.id);
                      const isSelected = state.selectedCell?.day === dayIdx && state.selectedCell?.slotId === slot.id;

                      return `
                      <div data-cell-day="${dayIdx}" data-cell-slot="${slot.id}" class="border-r last:border-r-0 border-slate-200/80 min-h-[64px] p-1.5 flex flex-col gap-1 relative transition-colors cursor-pointer ${
                        isSelected ? 'bg-sky-50/80 ring-2 ring-sky-400 inset-0' : 'hover:bg-slate-100/60 bg-white'
                      }">
                        ${matches
                          .map((course) => {
                            const rgb = hexToRgb(course.color);
                            const [r, g, b] = getContrastColor(rgb);
                            const textColor = `rgb(${r}, ${g}, ${b})`;

                            const meta = [course.section, course.room, course.faculty]
                              .filter((v): v is string => Boolean(v && v.trim()))
                              .map((v) => escapeHtml(v))
                              .join(' • ');
                            return `
                            <div draggable="true" data-drag-course-id="${course.id}" class="rounded-lg p-1.5 text-center shadow-xs transition-transform hover:scale-[1.02] active:scale-95 group relative select-none" style="background-color: ${course.color}; color: ${textColor};">
                              <p class="font-extrabold text-[11px] leading-tight truncate">${escapeHtml(course.name)}</p>
                              ${
                                meta
                                  ? `<p class="text-[9px] font-medium opacity-90 leading-tight truncate">${meta}</p>`
                                  : ''
                              }
                              <button data-quick-delete="${course.id}" class="no-print absolute -top-1 -right-1 w-4 h-4 bg-slate-900/80 text-white rounded-full text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer shadow-xs" title="Remove course">×</button>
                            </div>
                          `;
                          })
                          .join('')}
                      </div>
                    `;
                    })
                    .join('')}
                </div>
              `;
              })
              .join('')}
          </div>
        </div>

        <footer class="mt-4 pt-3 border-t border-slate-150 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>“When you arise in the morning think of what a privilege it is to be alive: to think, to enjoy, to love.” — Marcus Aurelius</span>
          <span class="font-medium text-slate-500">Scheduly</span>
        </footer>
      </div>
    </div>
  `;

  // Rename routine
  const nameInput = container.querySelector('#input-routine-name') as HTMLInputElement;
  nameInput?.addEventListener('change', (e) => {
    store.setRoutineName((e.target as HTMLInputElement).value);
  });

  // Cell click to add / focus
  container.querySelectorAll('[data-cell-day]').forEach((cell) => {
    cell.addEventListener('click', (e) => {
      // If clicking delete button, don't trigger cell selection
      if ((e.target as HTMLElement).closest('[data-quick-delete]')) return;

      const day = parseInt((cell as HTMLElement).dataset.cellDay || '0', 10);
      const slotId = (cell as HTMLElement).dataset.cellSlot || '';
      store.setSelectedCell({ day, slotId });
      store.setActiveTab('add');
      store.setSidebarOpen(true);

      // Focus course input
      const courseInput = document.getElementById('input-course-name');
      courseInput?.focus();
    });
  });

  // Quick delete course
  container.querySelectorAll('[data-quick-delete]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = (btn as HTMLElement).dataset.quickDelete;
      if (id) store.deleteCourse(id);
    });
  });

  // Drag and drop course between cells
  container.querySelectorAll('[data-drag-course-id]').forEach((draggable) => {
    draggable.addEventListener('dragstart', (e) => {
      const courseId = (draggable as HTMLElement).dataset.dragCourseId;
      if (courseId && (e as DragEvent).dataTransfer) {
        (e as DragEvent).dataTransfer!.setData('text/plain', courseId);
      }
    });
  });

  container.querySelectorAll('[data-cell-day]').forEach((dropTarget) => {
    dropTarget.addEventListener('dragover', (e) => {
      e.preventDefault();
      (dropTarget as HTMLElement).classList.add('bg-sky-100/70');
    });

    dropTarget.addEventListener('dragleave', () => {
      (dropTarget as HTMLElement).classList.remove('bg-sky-100/70');
    });

    dropTarget.addEventListener('drop', (e) => {
      e.preventDefault();
      (dropTarget as HTMLElement).classList.remove('bg-sky-100/70');
      const courseId = (e as DragEvent).dataTransfer?.getData('text/plain');
      const day = parseInt((dropTarget as HTMLElement).dataset.cellDay || '0', 10);
      const slotId = (dropTarget as HTMLElement).dataset.cellSlot || '';
      if (courseId && slotId) {
        store.moveCourse(courseId, day, slotId);
      }
    });
  });
}
