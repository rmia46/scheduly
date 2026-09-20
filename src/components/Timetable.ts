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
          <div class="min-w-[680px]">
            
            <!-- Grid Header Row (Days) -->
            <div class="grid grid-cols-8 gap-1.5 mb-1.5 text-xs font-bold text-slate-600">
              <div class="p-2 text-center rounded-xl bg-slate-100/90 border border-slate-200/80 font-semibold text-[11px] text-slate-500 flex items-center justify-center">
                Time / Day
              </div>
              ${DAYS_SHORT.map(
                (d, idx) => `
                <div class="p-2 text-center rounded-xl bg-slate-100/90 border border-slate-200/80">
                  <span class="block text-slate-900">${d}</span>
                  <span class="block text-[10px] font-normal text-slate-400 leading-tight hidden sm:block">${DAYS_FULL[idx]}</span>
                </div>
              `
              ).join('')}
            </div>

            <!-- Grid Rows (Slots) -->
            <div class="space-y-1.5">
              ${routine.slots
                .map((slot) => {
                  return `
                  <div class="grid grid-cols-8 gap-1.5 text-xs">
                    <!-- Time Column -->
                    <div class="p-2 text-center rounded-xl border border-slate-200/80 bg-slate-50 font-bold text-[11px] text-slate-600 flex items-center justify-center">
                      ${slot.label}
                    </div>

                    <!-- 7 Day Cells -->
                    ${[0, 1, 2, 3, 4, 5, 6]
                      .map((dayIdx) => {
                        const matches = routine.courses.filter((c) => c.day === dayIdx && c.slotId === slot.id);
                        const isSelected = state.selectedCell?.day === dayIdx && state.selectedCell?.slotId === slot.id;

                        return `
                        <div data-cell-day="${dayIdx}" data-cell-slot="${slot.id}" class="rounded-xl border border-slate-200/80 h-[84px] min-h-[84px] relative transition-all p-1 hover:overflow-visible cursor-pointer ${
                          isSelected ? 'bg-sky-50/80 ring-2 ring-sky-400 border-transparent shadow-xs' : 'hover:border-slate-300 hover:bg-slate-50/50 bg-white shadow-2xs'
                        }">
                          ${matches
                            .map((course, idx) => {
                              const rgb = hexToRgb(course.color);
                              const [r, g, b] = getContrastColor(rgb);
                              const textColor = `rgb(${r}, ${g}, ${b})`;

                              const meta = [course.section, course.room, course.faculty]
                                .filter((v): v is string => Boolean(v && v.trim()))
                                .map((v) => escapeHtml(v))
                                .join(' • ');

                              // When multiple courses occupy the same cell, stack them with an offset cascade like a deck of cards
                              const isStacked = matches.length > 1;
                              const offsetPx = isStacked ? idx * 6 : 0;
                              const zIndex = isStacked ? matches.length - idx : 1;
                              const stackStyle = isStacked
                                ? `top: ${offsetPx}px; left: ${offsetPx}px; width: calc(100% - ${matches.length * 4}px); height: calc(100% - ${matches.length * 4}px); z-index: ${zIndex};`
                                : `top: 0; left: 0; width: 100%; height: 100%;`;

                              return `
                              <div draggable="true" data-drag-course-id="${course.id}" class="absolute p-2 flex flex-col justify-center items-center text-center group select-none rounded-[10px] ${isStacked ? 'stacked-course cursor-grab' : 'w-full h-full'}" style="background-color: ${course.color}; color: ${textColor}; ${stackStyle}">
                                <p class="font-extrabold text-xs leading-snug line-clamp-2">${escapeHtml(course.name)}</p>
                                ${
                                  meta
                                    ? `<p class="text-[10px] font-medium opacity-90 mt-0.5 leading-tight truncate">${meta}</p>`
                                    : ''
                                }
                                <button data-quick-delete="${course.id}" class="no-print absolute top-1 right-1 w-4 h-4 bg-slate-900/80 text-white rounded-full text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer shadow-xs" title="Remove course">×</button>
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

  // Drag and drop course between cells with projection preview
  let activeDraggedCourseId: string | null = null;
  let activeGhostEl: HTMLElement | null = null;

  container.querySelectorAll('[data-drag-course-id]').forEach((draggable) => {
    draggable.addEventListener('dragstart', (e) => {
      const courseId = (draggable as HTMLElement).dataset.dragCourseId;
      if (courseId && (e as DragEvent).dataTransfer) {
        activeDraggedCourseId = courseId;
        (e as DragEvent).dataTransfer!.setData('text/plain', courseId);
        (e as DragEvent).dataTransfer!.effectAllowed = 'move';
        setTimeout(() => {
          (draggable as HTMLElement).classList.add('is-dragging');
        }, 0);
      }
    });

    draggable.addEventListener('dragend', () => {
      (draggable as HTMLElement).classList.remove('is-dragging');
      activeDraggedCourseId = null;
      if (activeGhostEl) {
        activeGhostEl.remove();
        activeGhostEl = null;
      }
      container.querySelectorAll('.drag-projection').forEach((el) => {
        el.classList.remove('drag-projection');
      });
    });
  });

  container.querySelectorAll('[data-cell-day]').forEach((dropTarget) => {
    dropTarget.addEventListener('dragover', (e) => {
      e.preventDefault();
      if ((e as DragEvent).dataTransfer) {
        (e as DragEvent).dataTransfer!.dropEffect = 'move';
      }

      const targetEl = dropTarget as HTMLElement;
      const targetDay = parseInt(targetEl.dataset.cellDay || '0', 10);
      const targetSlotId = targetEl.dataset.cellSlot || '';

      // If hovering over the course's own current cell, do not project or expand
      if (activeDraggedCourseId) {
        const draggedCourse = routine.courses.find((c) => c.id === activeDraggedCourseId);
        if (draggedCourse && draggedCourse.day === targetDay && draggedCourse.slotId === targetSlotId) {
          return;
        }
      }

      if (!targetEl.classList.contains('drag-projection')) {
        targetEl.classList.add('drag-projection');

        // If target cell doesn't already contain a ghost, add projected preview without altering layout height
        if (activeDraggedCourseId && !targetEl.querySelector('.drag-ghost-placeholder')) {
          const draggedCourse = routine.courses.find((c) => c.id === activeDraggedCourseId);
          if (draggedCourse) {
            if (activeGhostEl) activeGhostEl.remove();
            activeGhostEl = document.createElement('div');
            activeGhostEl.className =
              'drag-ghost-placeholder absolute inset-1 z-30 rounded-[10px] border-2 border-dashed border-sky-400 bg-sky-100/75 p-2 flex flex-col justify-center items-center text-center pointer-events-none transition-all shadow-xs';
            activeGhostEl.innerHTML = `
              <p class="font-bold text-xs text-sky-900 truncate opacity-90">${escapeHtml(draggedCourse.name)}</p>
              <span class="text-[9px] font-semibold text-sky-700 tracking-wider uppercase mt-0.5">Drop here</span>
            `;
            targetEl.appendChild(activeGhostEl);
          }
        }
      }
    });

    dropTarget.addEventListener('dragleave', (e) => {
      const targetEl = dropTarget as HTMLElement;
      // Only remove if leaving the actual cell container (not hovering over child element)
      if (!targetEl.contains((e as DragEvent).relatedTarget as Node)) {
        targetEl.classList.remove('drag-projection');
        const ghost = targetEl.querySelector('.drag-ghost-placeholder');
        if (ghost) {
          ghost.remove();
          if (activeGhostEl === ghost) activeGhostEl = null;
        }
      }
    });

    dropTarget.addEventListener('drop', (e) => {
      e.preventDefault();
      const targetEl = dropTarget as HTMLElement;
      targetEl.classList.remove('drag-projection');

      if (activeGhostEl) {
        activeGhostEl.remove();
        activeGhostEl = null;
      }
      targetEl.querySelector('.drag-ghost-placeholder')?.remove();

      const courseId = (e as DragEvent).dataTransfer?.getData('text/plain') || activeDraggedCourseId;
      const day = parseInt(targetEl.dataset.cellDay || '0', 10);
      const slotId = targetEl.dataset.cellSlot || '';
      if (courseId && slotId) {
        const draggedCourse = routine.courses.find((c) => c.id === courseId);
        // Only move if destination is different from current position
        if (draggedCourse && (draggedCourse.day !== day || draggedCourse.slotId !== slotId)) {
          store.moveCourse(courseId, day, slotId);
        }
      }
      activeDraggedCourseId = null;
    });
  });
}
