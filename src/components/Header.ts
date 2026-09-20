import { store } from '../store/routineStore';
import { THEMES } from '../types/constants';
import type { ThemeName } from '../types';
import { exportVectorPDF, exportPNGImage } from '../services/exportService';

export function renderHeader(container: HTMLElement): void {
  const state = store.getState();
  const theme = THEMES[state.theme];

  container.innerHTML = `
    <header class="bg-white/90 border-b sticky top-0 z-40 px-4 py-2.5 flex items-center justify-between shadow-xs transition-all duration-300" style="border-color: ${theme.border};">
      <!-- Left: Sidebar toggle + App Branding -->
      <div class="flex items-center gap-3">
        <button id="hdr-toggle-sidebar" class="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer" style="background-color: ${theme.subtleBg};" title="Toggle Sidebar">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <div>
          <h1 class="text-base font-bold tracking-tight text-slate-900 flex items-center gap-1.5 leading-none">
            Scheduly
            <span class="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full" style="background-color: ${theme.badgeBg}; color: ${theme.accent};">v2</span>
          </h1>
          <p class="text-[11px] text-slate-500 font-normal leading-tight hidden sm:block">Clean Timetable Studio</p>
        </div>
      </div>

      <!-- Center / Right: Routine Selector & Quick Actions -->
      <div class="flex items-center gap-2">
        <!-- Routine Dropdown Selector -->
        <select id="hdr-routine-select" class="text-xs font-medium bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer max-w-[140px] sm:max-w-[200px] truncate">
          ${state.routines.map((r) => `<option value="${r.id}" ${r.id === state.activeRoutineId ? 'selected' : ''}>${r.name}</option>`).join('')}
        </select>

        <!-- Theme Selector -->
        <select id="hdr-theme-select" class="text-xs font-medium bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-slate-800 rounded-lg px-2 py-1.5 outline-none cursor-pointer hidden md:block">
          ${Object.values(THEMES).map((t) => `<option value="${t.name}" ${t.name === state.theme ? 'selected' : ''}>${t.label}</option>`).join('')}
        </select>

        <!-- New Routine Button -->
        <button id="hdr-btn-new-routine" class="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer" title="New Routine">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
        </button>

        <!-- Export Dropdown Menu (Strictly Export actions) -->
        <div class="relative" id="export-dropdown-wrapper">
          <button id="hdr-btn-export-toggle" class="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg shadow-xs transition-opacity hover:opacity-95 cursor-pointer" style="background-color: ${theme.primary};">
            <span>Export</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          <div id="export-dropdown-menu" class="hidden absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-150 py-1.5 z-50 text-xs font-medium">
            <button id="action-export-pdf" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
              <span class="text-sm">📄</span> Export PDF (Vector)
            </button>
            <button id="action-export-png" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
              <span class="text-sm">🖼️</span> Export PNG (Image)
            </button>
            <button id="action-print" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
              <span class="text-sm">🖨️</span> Print Routine
            </button>
          </div>
        </div>

        <!-- Options Dropdown Menu (Routine & Palette options) -->
        <div class="relative" id="options-dropdown-wrapper">
          <button id="hdr-btn-options-toggle" class="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer" title="More Options">
            <span>Options</span>
            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          <div id="options-dropdown-menu" class="hidden absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-150 py-1.5 z-50 text-xs font-medium">
            <button id="action-random-colors" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
              <span class="text-sm">🎨</span> Shuffle Colors
            </button>
            <div class="my-1 border-t border-slate-100"></div>
            <button id="action-delete-routine" class="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer">
              <span class="text-sm">🗑️</span> Delete Routine
            </button>
          </div>
        </div>
      </div>
    </header>
  `;

  // Attach Safe Listeners
  const toggleBtn = container.querySelector('#hdr-toggle-sidebar');
  toggleBtn?.addEventListener('click', () => store.toggleSidebar());

  const routineSelect = container.querySelector('#hdr-routine-select') as HTMLSelectElement;
  routineSelect?.addEventListener('change', (e) => store.switchRoutine((e.target as HTMLSelectElement).value));

  const themeSelect = container.querySelector('#hdr-theme-select') as HTMLSelectElement;
  themeSelect?.addEventListener('change', (e) => store.setTheme((e.target as HTMLSelectElement).value as ThemeName));

  const newRoutineBtn = container.querySelector('#hdr-btn-new-routine');
  newRoutineBtn?.addEventListener('click', () => {
    const name = window.prompt('Enter Routine Name:', `Routine ${store.getState().routines.length + 1}`);
    if (name && name.trim()) {
      store.createRoutine(name);
    }
  });

  // Export Dropdown
  const exportToggle = container.querySelector('#hdr-btn-export-toggle');
  const exportMenu = container.querySelector('#export-dropdown-menu');

  // Options Dropdown
  const optionsToggle = container.querySelector('#hdr-btn-options-toggle');
  const optionsMenu = container.querySelector('#options-dropdown-menu');

  exportToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    optionsMenu?.classList.add('hidden');
    exportMenu?.classList.toggle('hidden');
  });

  optionsToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    exportMenu?.classList.add('hidden');
    optionsMenu?.classList.toggle('hidden');
  });

  document.addEventListener('click', () => {
    exportMenu?.classList.add('hidden');
    optionsMenu?.classList.add('hidden');
  });

  container.querySelector('#action-export-pdf')?.addEventListener('click', () => {
    exportMenu?.classList.add('hidden');
    const r = store.getActiveRoutine();
    if (r) exportVectorPDF(r);
  });

  container.querySelector('#action-export-png')?.addEventListener('click', () => {
    exportMenu?.classList.add('hidden');
    const r = store.getActiveRoutine();
    if (r) exportPNGImage('timetable-capture-area', r.name);
  });

  container.querySelector('#action-print')?.addEventListener('click', () => {
    exportMenu?.classList.add('hidden');
    window.print();
  });

  container.querySelector('#action-random-colors')?.addEventListener('click', () => {
    optionsMenu?.classList.add('hidden');
    store.randomizeColors();
  });

  container.querySelector('#action-delete-routine')?.addEventListener('click', () => {
    optionsMenu?.classList.add('hidden');
    if (confirm('Are you sure you want to delete this routine?')) {
      if (!store.deleteActiveRoutine()) {
        alert('Cannot delete the last remaining routine.');
      }
    }
  });
}
