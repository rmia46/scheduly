import { store } from '../store/routineStore';
import { DAYS_SHORT, DAYS_FULL, THEMES, PHILOSOPHICAL_QUOTES } from '../types/constants';
import { escapeHtml, getContrastColor, hexToRgb } from '../services/utils';

let quoteIntervalTimer: number | null = null;
let currentQuoteIndex = 0;

function advanceQuote(): void {
  const quoteContainer = document.getElementById('timetable-quote-content');
  if (!quoteContainer) return;

  // Cycle to next quote
  currentQuoteIndex = (currentQuoteIndex + 1) % PHILOSOPHICAL_QUOTES.length;
  const nextQuote = PHILOSOPHICAL_QUOTES[currentQuoteIndex];

  // Smooth fade transition
  quoteContainer.style.opacity = '0';
  setTimeout(() => {
    quoteContainer.innerHTML = `
      <span>“${escapeHtml(nextQuote.text)}”</span>
      <span class="font-medium text-slate-500">— ${escapeHtml(nextQuote.author)}</span>
    `;
    quoteContainer.style.opacity = '1';
  }, 200);
}

function setupQuoteRotation(): void {
  if (quoteIntervalTimer !== null) {
    clearInterval(quoteIntervalTimer);
    quoteIntervalTimer = null;
  }

  // 45 seconds = 45,000ms
  quoteIntervalTimer = window.setInterval(() => {
    advanceQuote();
  }, 45000);
}

export function renderTimetable(container: HTMLElement): void {
  const routine = store.getActiveRoutine();
  if (!routine) return;

  const state = store.getState();
  const theme = THEMES[state.theme];

  const initialQuote = PHILOSOPHICAL_QUOTES[currentQuoteIndex] || PHILOSOPHICAL_QUOTES[0];

  container.innerHTML = `
    <div class="flex-1 min-w-0 flex flex-col print-card">
      <div id="timetable-capture-area" class="bg-white rounded-2xl shadow-xs p-4 sm:p-6 overflow-hidden flex flex-col border transition-all duration-300" style="border-color: ${theme.border};">
        
        <!-- Editable Routine Title -->
        <div class="mb-4 text-center">
          <input id="input-routine-name" type="text" value="${escapeHtml(routine.name)}" placeholder="Routine Name..." class="text-xl sm:text-2xl font-extrabold text-slate-900 text-center bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none px-2 py-0.5 transition-colors" />
        </div>

        <!-- Timetable Scroll Wrapper for Mobile -->
        <div class="overflow-x-auto overflow-y-visible pb-2 select-none">
          <div class="min-w-[760px]">
            
            <!-- Grid Header Row (Days) -->
            <div class="grid grid-cols-8 gap-1.5 mb-1.5 text-xs font-bold text-slate-600">
              <div class="py-1.5 px-2 text-center rounded-xl font-semibold text-[10px] flex items-center justify-center border transition-colors duration-300" style="background-color: ${theme.subtleBg}; border-color: ${theme.border}; color: ${theme.accent};">
                Time / Day
              </div>
              ${DAYS_SHORT.map(
                (d, idx) => `
                <div class="py-1.5 px-1 text-center rounded-xl border transition-colors duration-300" style="background-color: ${theme.subtleBg}; border-color: ${theme.border};">
                  <span class="block text-slate-900 font-extrabold">${d}</span>
                  <span class="block text-[9.5px] font-medium opacity-60 leading-tight hidden sm:block">${DAYS_FULL[idx]}</span>
                </div>
              `
              ).join('')}
            </div>

            <!-- Grid Rows (Slots) -->
            <div class="space-y-1.5">
              ${
                routine.slots.length === 0
                  ? `
                <div class="py-16 px-4 text-center rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 my-2" style="border-color: ${theme.border}; background-color: ${theme.subtleBg}40;">
                  <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs" style="background-color: ${theme.subtleBg}; color: ${theme.accent};">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <div class="max-w-sm">
                    <h3 class="font-bold text-sm text-slate-800 mb-1">No Time Slots Yet</h3>
                    <p class="text-xs text-slate-500 leading-relaxed">
                      Add custom time slots for your schedule, or quickly load official North South University (NSU) slots.
                    </p>
                  </div>
                  <div class="flex items-center gap-2 pt-1">
                    <button id="btn-empty-load-nsu" class="px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5" style="background-color: ${theme.primary}">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      <span>Load NSU Slots</span>
                    </button>
                    <button id="btn-empty-add-slots" class="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      <span>Add Slots</span>
                    </button>
                  </div>
                </div>
              `
                  : routine.slots
                      .map((slot) => {
                        return `
                  <div class="grid grid-cols-8 gap-1.5 text-xs">
                    <!-- Time Column -->
                    <div class="p-1.5 text-center rounded-xl border font-bold text-[10.5px] flex items-center justify-center leading-tight transition-colors duration-300" style="background-color: ${theme.subtleBg}; border-color: ${theme.border}; color: ${theme.accent};">
                      ${slot.label}
                    </div>

                    <!-- 7 Day Cells -->
                    ${[0, 1, 2, 3, 4, 5, 6]
                      .map((dayIdx) => {
                        const matches = routine.courses.filter((c) => c.day === dayIdx && c.slotId === slot.id);
                        const isSelected = state.selectedCell?.day === dayIdx && state.selectedCell?.slotId === slot.id;

                        const isConflict = matches.length > 1;

                        return `
                        <div data-cell-day="${dayIdx}" data-cell-slot="${slot.id}" class="rounded-xl h-[64px] min-h-[64px] relative transition-all p-1 hover:overflow-visible cursor-pointer border ${
                          isSelected
                            ? 'border-transparent shadow-xs'
                            : isConflict
                            ? 'bg-rose-50/50 hover:border-rose-400 shadow-2xs'
                            : 'bg-white hover:border-slate-300 shadow-2xs'
                        }" style="${
                          isSelected
                            ? `outline: 2px solid ${theme.primary}; background-color: ${theme.badgeBg}; border-color: transparent;`
                            : isConflict
                            ? `border-color: #fca5a5; outline: 1.5px solid #f87171;`
                            : `border-color: ${theme.border}80;`
                        }">
                          ${
                            isConflict
                              ? `<div class="no-print absolute -top-1.5 -right-1.5 z-40 bg-rose-500 text-white rounded-full p-0.5 shadow-xs flex items-center justify-center pointer-events-none" title="Schedule conflict: ${matches.length} classes scheduled at the same time">
                                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                </div>`
                              : ''
                          }
                          ${matches
                            .map((course, idx) => {
                              const rgb = hexToRgb(course.color);
                              const [r, g, b] = getContrastColor(rgb);
                              const textColor = `rgb(${r}, ${g}, ${b})`;

                              const sectionText = course.section ? escapeHtml(course.section.trim()) : '';
                              const roomText = course.room ? escapeHtml(course.room.trim()) : '';
                              const facultyText = course.faculty ? escapeHtml(course.faculty.trim()) : '';
                              const hasLeft = sectionText || roomText;
                              const hasRight = Boolean(facultyText);
                              const hasMeta = hasLeft || hasRight;

                              // When multiple courses occupy the same cell, stack them with an offset cascade like a deck of cards
                              const isStacked = matches.length > 1;
                              const offsetPx = isStacked ? idx * 5 : 0;
                              const zIndex = isStacked ? matches.length - idx : 1;
                              const stackStyle = isStacked
                                ? `top: ${offsetPx}px; left: ${offsetPx}px; width: calc(100% - ${matches.length * 4}px); height: calc(100% - ${matches.length * 4}px); z-index: ${zIndex};`
                                : `top: 0; left: 0; width: 100%; height: 100%;`;

                              return `
                              <div draggable="true" data-drag-course-id="${course.id}" data-course-id="${course.id}" class="course-card-item absolute px-2 py-1 flex flex-col justify-between items-center text-center group select-none rounded-xl border border-white/25 shadow-xs overflow-hidden cursor-pointer ${isStacked ? 'stacked-course cursor-grab' : 'w-full h-full'}" style="background-color: ${course.color}; color: ${textColor}; ${stackStyle}" title="Click to edit course">
                                <!-- Course Name: Prominent & clear heading with dedicated space -->
                                <div class="w-full flex-1 flex items-center justify-center min-h-0 px-0.5 pointer-events-none">
                                  <p class="font-black text-[12px] leading-tight line-clamp-2 break-words tracking-tight">${escapeHtml(course.name)}</p>
                                </div>
                                ${
                                  hasMeta
                                    ? `
                                  <!-- Meta Info: Clean pinned footer -->
                                  <div class="w-full shrink-0 flex items-center justify-between border-t border-current/20 mt-0.5 pt-0.5 font-bold leading-tight pointer-events-none">
                                    <!-- Left: Section and Room vertical stack -->
                                    <div class="flex flex-col text-left truncate min-w-0 ${!hasRight ? 'w-full text-center' : ''}">
                                      ${sectionText ? `<span class="truncate text-[9px] font-black leading-none">${sectionText}</span>` : ''}
                                      ${roomText ? `<span class="truncate text-[8.5px] font-semibold opacity-90 leading-none mt-0.5">${roomText}</span>` : ''}
                                    </div>

                                    ${
                                      hasLeft && hasRight
                                        ? `<span class="h-3 w-px bg-current/25 mx-1.5 shrink-0 self-center"></span>`
                                        : ''
                                    }

                                    <!-- Right: Faculty -->
                                    <div class="text-right text-[9.5px] font-black tracking-tight shrink-0 truncate ${!hasLeft ? 'w-full text-center' : ''}">
                                      ${facultyText}
                                    </div>
                                  </div>
                                `
                                    : ''
                                }
                                <button data-quick-delete="${course.id}" class="no-print absolute top-1 right-1 w-3.5 h-3.5 bg-slate-900/80 text-white rounded-full text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer shadow-xs" title="Remove course">×</button>
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
                      .join('')
              }
            </div>
        </div>

        <footer class="mt-4 pt-3 border-t border-slate-150 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          ${
            state.showQuotes
              ? `<div id="timetable-quote-content" class="transition-opacity duration-200 text-center sm:text-left flex flex-wrap items-center gap-1.5 justify-center sm:justify-start cursor-pointer select-none hover:text-slate-600 transition-colors" title="Click to see next quote">
                   <span>“${escapeHtml(initialQuote.text)}”</span>
                   <span class="font-medium text-slate-500">— ${escapeHtml(initialQuote.author)}</span>
                 </div>`
              : `<div></div>`
          }
          <span class="font-medium text-slate-500 shrink-0">Scheduly</span>
        </footer>
      </div>
    </div>
  `;

  if (state.showQuotes) {
    setupQuoteRotation();

    // Click on quote to skip immediately to next quote and reset timer
    const quoteEl = container.querySelector('#timetable-quote-content');
    quoteEl?.addEventListener('click', () => {
      advanceQuote();
      setupQuoteRotation();
    });
  } else if (quoteIntervalTimer !== null) {
    clearInterval(quoteIntervalTimer);
    quoteIntervalTimer = null;
  }

  // Empty state buttons
  container.querySelector('#btn-empty-load-nsu')?.addEventListener('click', () => {
    store.loadNsuSlots();
  });

  container.querySelector('#btn-empty-add-slots')?.addEventListener('click', () => {
    store.setActiveTab('slots');
    store.setSidebarOpen(true);
  });

  // Rename routine
  const nameInput = container.querySelector('#input-routine-name') as HTMLInputElement;
  nameInput?.addEventListener('change', (e) => {
    store.setRoutineName((e.target as HTMLInputElement).value);
  });

  // Cell click to add / focus
  container.querySelectorAll('[data-cell-day]').forEach((cell) => {
    cell.addEventListener('click', (e) => {
      // If clicking course card or its buttons, do not trigger empty cell click
      if ((e.target as HTMLElement).closest('.course-card-item')) return;
      if ((e.target as HTMLElement).closest('[data-quick-delete]')) return;

      const day = parseInt((cell as HTMLElement).dataset.cellDay || '0', 10);
      const slotId = (cell as HTMLElement).dataset.cellSlot || '';
      store.setSelectedCell({ day, slotId });
      store.clearEditingCourse();
      store.setActiveTab('add');
      store.setSidebarOpen(true);

      // Focus course input
      const courseInput = document.getElementById('input-course-name');
      courseInput?.focus();
    });
  });

  // Edit course by clicking anywhere on the course card
  container.querySelectorAll('[data-course-id]').forEach((card) => {
    card.addEventListener('click', (e) => {
      // If clicking delete button, don't trigger edit
      if ((e.target as HTMLElement).closest('[data-quick-delete]')) return;
      e.stopPropagation();
      const id = (card as HTMLElement).dataset.courseId;
      if (id) {
        store.setEditingCourse(id);
      }
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
