import './styles/main.css';
import { store } from './store/routineStore';
import { THEMES } from './types/constants';
import type { Routine } from './types';
import { renderHeader } from './components/Header';
import { renderSidebar } from './components/Sidebar';
import { renderTimetable } from './components/Timetable';
import { decodeFromBase64Url, escapeHtml, showToast } from './services/utils';

function mount(): void {
  const headerContainer = document.getElementById('app-header');
  const sidebarContainer = document.getElementById('app-sidebar');
  const timetableContainer = document.getElementById('app-timetable');

  if (!headerContainer || !sidebarContainer || !timetableContainer) return;

  function applyThemeVariables(): void {
    const state = store.getState();
    const theme = THEMES[state.theme];
    if (!theme) return;

    const root = document.documentElement;
    root.setAttribute('data-theme', theme.name);
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-badge-bg', theme.badgeBg);
    root.style.setProperty('--theme-bg', theme.bg);
    root.style.setProperty('--theme-border', theme.border);
    root.style.setProperty('--theme-subtle', theme.subtleBg);
  }

  function renderAll(): void {
    applyThemeVariables();
    renderHeader(headerContainer!);
    renderSidebar(sidebarContainer!);
    renderTimetable(timetableContainer!);
  }

  // Initial render
  renderAll();

  // Check URL Hash for shared routine payload
  function checkUrlHashForSharedRoutine(): void {
    const hash = window.location.hash;
    if (!hash.includes('routine=')) return;

    const base64Url = hash.split('routine=')[1]?.split('&')[0];
    if (!base64Url) return;

    const imported = decodeFromBase64Url<Routine>(base64Url);
    if (!imported || !Array.isArray(imported.courses) || !Array.isArray(imported.slots)) {
      return;
    }

    // Clean URL hash without reloading page
    history.replaceState(null, '', window.location.pathname + window.location.search);

    // Show import modal
    const theme = THEMES[store.getState().theme];
    const backdrop = document.createElement('div');
    backdrop.id = 'scheduly-modal-backdrop';
    backdrop.className =
      'fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200';

    backdrop.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
            <svg class="w-4.5 h-4.5 text-sky-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            <span>Import Shared Routine</span>
          </h3>
          <button id="btn-import-dismiss" class="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer">
            <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="p-5 space-y-3 text-xs text-slate-600">
          <p class="leading-relaxed">
            You received a shared class schedule:
          </p>
          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs shrink-0" style="background-color: ${theme.primary}">
              ${escapeHtml((imported.name || 'Routine').slice(0, 2).toUpperCase())}
            </div>
            <div class="min-w-0">
              <h4 class="text-xs font-bold text-slate-900 truncate">${escapeHtml(imported.name || 'Shared Routine')}</h4>
              <p class="text-[11px] text-slate-500 mt-0.5">${imported.courses.length} courses • ${imported.slots.length} time slots</p>
            </div>
          </div>
          <p class="text-[11px] text-slate-400">
            Importing will add this as a new routine to your list without modifying or deleting your existing routines.
          </p>
        </div>

        <div class="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button id="btn-import-cancel" class="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer">
            Cancel
          </button>
          <button id="btn-import-confirm" class="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5" style="background-color: ${theme.primary}">
            <span>Import Routine</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    const closeModal = () => backdrop.remove();
    backdrop.querySelector('#btn-import-dismiss')?.addEventListener('click', closeModal);
    backdrop.querySelector('#btn-import-cancel')?.addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });

    backdrop.querySelector('#btn-import-confirm')?.addEventListener('click', () => {
      store.importRoutine(imported);
      closeModal();
      showToast(`Imported "${imported.name}"!`);
    });
  }

  // Check URL hash immediately on mount
  checkUrlHashForSharedRoutine();

  // Also listen for hashchange if user navigates within the same tab
  window.addEventListener('hashchange', () => {
    checkUrlHashForSharedRoutine();
  });

  // Subscribe to state updates
  store.subscribe(() => {
    renderAll();
  });

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    // If typing in an input, textarea or select, allow standard browser text undo
    const activeEl = document.activeElement;
    const isTyping =
      activeEl instanceof HTMLInputElement ||
      activeEl instanceof HTMLTextAreaElement ||
      activeEl instanceof HTMLSelectElement;

    const isCtrlOrCmd = e.ctrlKey || e.metaKey;

    if (isCtrlOrCmd && !isTyping) {
      if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        if (e.shiftKey) {
          store.redo();
        } else {
          store.undo();
        }
      } else if (e.key === 'y' || e.key === 'Y') {
        e.preventDefault();
        store.redo();
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', mount);
