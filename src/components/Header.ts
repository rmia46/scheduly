import { store } from '../store/routineStore';
import { THEMES } from '../types/constants';
import type { ThemeName } from '../types';
import { exportVectorPDF, exportPNGImage } from '../services/exportService';

export function renderHeader(container: HTMLElement): void {
  const state = store.getState();
  const theme = THEMES[state.theme];

  container.innerHTML = `
    <header class="bg-white/95 border-b sticky top-0 z-40 px-3 sm:px-4 py-2 flex items-center justify-between shadow-xs transition-all duration-300" style="border-color: ${theme.border};">
      <!-- Left: Sidebar toggle + App Branding + Desktop Application Menu Bar -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Sidebar Panel Toggle (Option 1: Modern Panel-Left Icon) -->
        <button id="hdr-toggle-sidebar" class="w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer border ${
          state.sidebarOpen
            ? 'border-transparent shadow-xs'
            : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
        }" style="${
          state.sidebarOpen
            ? `background-color: ${theme.badgeBg}; color: ${theme.accent}; border-color: ${theme.border};`
            : ''
        }" title="${state.sidebarOpen ? 'Collapse Editor Panel' : 'Expand Editor Panel'}">
          <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
        </button>

        <!-- App Branding -->
        <div class="flex items-center gap-1.5 pr-1 border-r border-slate-200">
          <span class="text-sm font-bold tracking-tight text-slate-900 leading-none">Scheduly</span>
          <span class="text-[9px] uppercase font-bold tracking-wider px-1 py-0.2 rounded" style="background-color: ${theme.badgeBg}; color: ${theme.accent};">v2</span>
        </div>

        <!-- Authentic Application Menu Bar (Desktop: md:flex) -->
        <nav class="hidden md:flex items-center gap-0.5 text-xs font-medium text-slate-700">
          <!-- 1. Routine Menu (App File menu equivalent) -->
          <div class="relative" id="menu-routine-wrapper">
            <button id="hdr-btn-routine-menu-toggle" class="px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1 font-medium">
              <span>Routine</span>
            </button>

            <div id="menu-routine-dropdown" class="hidden absolute left-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-150 py-1.5 z-50 text-xs">
              <button id="action-new-routine" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  <span>New Routine</span>
                </div>
                <span class="text-[10px] text-slate-400">Ctrl+N</span>
              </button>
              <div class="my-1 border-t border-slate-100"></div>
              <button id="action-delete-routine" class="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center justify-between cursor-pointer">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  <span>Delete Routine</span>
                </div>
                <span class="text-[10px] text-rose-400">Del</span>
              </button>
            </div>
          </div>

          <!-- 2. Edit / Tools Menu -->
          <div class="relative" id="menu-tools-wrapper">
            <button id="hdr-btn-tools-toggle" class="px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1 font-medium">
              <span>Tools</span>
            </button>

            <div id="menu-tools-dropdown" class="hidden absolute left-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-150 py-1.5 z-50 text-xs">
              <button id="action-random-colors" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                  </svg>
                  <span>Shuffle Colors</span>
                </div>
              </button>
              <button id="action-load-nsu-slots" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>Load NSU Slots</span>
                </div>
              </button>
            </div>
          </div>

          <!-- 3. Export Menu -->
          <div class="relative" id="menu-export-wrapper">
            <button id="hdr-btn-export-toggle" class="px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1 font-medium">
              <span>Export</span>
            </button>

            <div id="menu-export-dropdown" class="hidden absolute left-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-150 py-1.5 z-50 text-xs">
              <button id="action-export-pdf" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  <span>PDF Document</span>
                </div>
                <span class="text-[10px] text-slate-400 font-mono">.pdf</span>
              </button>
              <button id="action-export-png" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <span>PNG Image</span>
                </div>
                <span class="text-[10px] text-slate-400 font-mono">.png</span>
              </button>
              <div class="my-1 border-t border-slate-100"></div>
              <button id="action-print" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <rect x="6" y="14" width="12" height="8"></rect>
                  </svg>
                  <span>Print Routine</span>
                </div>
                <span class="text-[10px] text-slate-400">Ctrl+P</span>
              </button>
            </div>
          </div>

          <!-- 4. Theme Menu -->
          <div class="relative" id="menu-theme-wrapper">
            <button id="hdr-btn-theme-toggle" class="px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5 font-medium">
              <span class="w-2 h-2 rounded-full" style="background-color: ${theme.primary};"></span>
              <span>Theme</span>
            </button>

            <div id="menu-theme-dropdown" class="hidden absolute left-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-150 py-1.5 z-50 text-xs">
              <button data-theme="ocean" class="btn-theme-item w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 cursor-pointer ${state.theme === 'ocean' ? 'bg-sky-50 font-semibold text-sky-900' : 'text-slate-700'}">
                <div class="flex items-center gap-2">
                  <svg class="w-3.5 h-3.5 text-sky-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path>
                    <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path>
                  </svg>
                  <span>Ocean</span>
                </div>
                <span class="w-2 h-2 rounded-full bg-[#0284c7]"></span>
              </button>

              <button data-theme="grass" class="btn-theme-item w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 cursor-pointer ${state.theme === 'grass' ? 'bg-emerald-50 font-semibold text-emerald-900' : 'text-slate-700'}">
                <div class="flex items-center gap-2">
                  <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
                  </svg>
                  <span>Grass</span>
                </div>
                <span class="w-2 h-2 rounded-full bg-[#16a34a]"></span>
              </button>

              <button data-theme="lemon" class="btn-theme-item w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 cursor-pointer ${state.theme === 'lemon' ? 'bg-amber-50 font-semibold text-amber-900' : 'text-slate-700'}">
                <div class="flex items-center gap-2">
                  <svg class="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="4"></circle>
                  </svg>
                  <span>Lemon</span>
                </div>
                <span class="w-2 h-2 rounded-full bg-[#ca8a04]"></span>
              </button>

              <button data-theme="cherry" class="btn-theme-item w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 cursor-pointer ${state.theme === 'cherry' ? 'bg-pink-50 font-semibold text-pink-900' : 'text-slate-700'}">
                <div class="flex items-center gap-2">
                  <svg class="w-3.5 h-3.5 text-pink-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <span>Cherry</span>
                </div>
                <span class="w-2 h-2 rounded-full bg-[#db2777]"></span>
              </button>

              <button data-theme="grape" class="btn-theme-item w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 cursor-pointer ${state.theme === 'grape' ? 'bg-purple-50 font-semibold text-purple-900' : 'text-slate-700'}">
                <div class="flex items-center gap-2">
                  <svg class="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
                  </svg>
                  <span>Grape</span>
                </div>
                <span class="w-2 h-2 rounded-full bg-[#9333ea]"></span>
              </button>
            </div>
          </div>
        </nav>
      </div>

      <!-- Right: Active Routine Selector & Mobile 3-Dots Menu -->
      <div class="flex items-center gap-2">
        <select id="hdr-routine-select" class="text-xs font-medium bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer max-w-[135px] sm:max-w-[200px] truncate" title="Switch Active Routine">
          ${state.routines.map((r) => `<option value="${r.id}" ${r.id === state.activeRoutineId ? 'selected' : ''}>${r.name}</option>`).join('')}
        </select>

        <!-- Mobile 3-Dots Overflow Menu Button (Rightmost, visible on screens < md) -->
        <div class="relative md:hidden" id="menu-mobile-wrapper">
          <button id="hdr-btn-mobile-menu-toggle" class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer shrink-0" title="App Menu">
            <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>

          <!-- Mobile Categorized Dropdown (Right-aligned) -->
          <div id="menu-mobile-dropdown" class="hidden absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
            <!-- Routine Section -->
            <div class="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Routine</div>
            <button id="mobile-action-new-routine" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer">
              <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              <span>New Routine</span>
            </button>
            <button id="mobile-action-delete-routine" class="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer">
              <svg class="w-4 h-4 text-rose-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>Delete Current Routine</span>
            </button>

            <!-- Tools Section -->
            <div class="my-1.5 border-t border-slate-100"></div>
            <div class="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tools</div>
            <button id="mobile-action-random-colors" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer">
              <svg class="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
              </svg>
              <span>Shuffle Colors</span>
            </button>
            <button id="mobile-action-load-nsu-slots" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer">
              <svg class="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Load NSU Slots</span>
            </button>

            <!-- Export Section -->
            <div class="my-1.5 border-t border-slate-100"></div>
            <div class="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Export</div>
            <button id="mobile-action-export-pdf" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer">
              <svg class="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <span>Export Vector PDF</span>
            </button>
            <button id="mobile-action-export-png" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer">
              <svg class="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span>Export PNG Image</span>
            </button>

            <!-- Themes Section -->
            <div class="my-1.5 border-t border-slate-100"></div>
            <div class="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Themes</div>
            <div class="grid grid-cols-5 gap-1 px-3 py-1.5">
              ${Object.values(THEMES).map((t) => `
                <button data-theme="${t.name}" class="btn-theme-item flex flex-col items-center gap-1 p-1 rounded-lg hover:bg-slate-100 cursor-pointer ${state.theme === t.name ? 'ring-1 ring-slate-400' : ''}" title="${t.label}">
                  <span class="w-4 h-4 rounded-full shadow-2xs" style="background-color: ${t.primary};"></span>
                  <span class="text-[9px] font-semibold text-slate-600">${t.label.slice(0, 3)}</span>
                </button>
              `).join('')}
            </div>
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

  // Menu Elements
  const themeToggle = container.querySelector('#hdr-btn-theme-toggle');
  const themeMenu = container.querySelector('#menu-theme-dropdown');

  const routineMenuToggle = container.querySelector('#hdr-btn-routine-menu-toggle');
  const routineMenu = container.querySelector('#menu-routine-dropdown');

  const toolsToggle = container.querySelector('#hdr-btn-tools-toggle');
  const toolsMenu = container.querySelector('#menu-tools-dropdown');

  const exportToggle = container.querySelector('#hdr-btn-export-toggle');
  const exportMenu = container.querySelector('#menu-export-dropdown');

  const mobileToggle = container.querySelector('#hdr-btn-mobile-menu-toggle');
  const mobileMenu = container.querySelector('#menu-mobile-dropdown');

  const allMenus = [themeMenu, routineMenu, toolsMenu, exportMenu, mobileMenu];
  const closeAllMenus = () => allMenus.forEach((m) => m?.classList.add('hidden'));

  // Mobile Menu Toggle
  mobileToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isClosed = mobileMenu?.classList.contains('hidden');
    closeAllMenus();
    if (isClosed) mobileMenu?.classList.remove('hidden');
  });

  // Theme Dropdown Toggle
  themeToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isClosed = themeMenu?.classList.contains('hidden');
    closeAllMenus();
    if (isClosed) themeMenu?.classList.remove('hidden');
  });

  container.querySelectorAll('.btn-theme-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const selected = btn.getAttribute('data-theme') as ThemeName;
      if (selected) {
        closeAllMenus();
        store.setTheme(selected);
      }
    });
  });

  // Routine Menu Toggle
  routineMenuToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isClosed = routineMenu?.classList.contains('hidden');
    closeAllMenus();
    if (isClosed) routineMenu?.classList.remove('hidden');
  });

  // Tools Menu Toggle
  toolsToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isClosed = toolsMenu?.classList.contains('hidden');
    closeAllMenus();
    if (isClosed) toolsMenu?.classList.remove('hidden');
  });

  // Export Menu Toggle
  exportToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isClosed = exportMenu?.classList.contains('hidden');
    closeAllMenus();
    if (isClosed) exportMenu?.classList.remove('hidden');
  });

  // Global Outside Click
  document.addEventListener('click', () => closeAllMenus());

  // Menu Actions Helper
  const handleNewRoutine = () => {
    closeAllMenus();
    const name = window.prompt('Enter Routine Name:', `Routine ${store.getState().routines.length + 1}`);
    if (name && name.trim()) {
      store.createRoutine(name.trim());
    }
  };

  const handleDeleteRoutine = () => {
    closeAllMenus();
    if (confirm('Are you sure you want to delete this routine?')) {
      if (!store.deleteActiveRoutine()) {
        alert('Cannot delete the last remaining routine.');
      }
    }
  };

  const handleRandomColors = () => {
    closeAllMenus();
    store.randomizeColors();
  };

  const handleLoadNsuSlots = () => {
    closeAllMenus();
    if (confirm('Load North South University (NSU) academic time slots? This will reset routine slots.')) {
      store.loadNsuSlots();
    }
  };

  const handleExportPdf = () => {
    closeAllMenus();
    const r = store.getActiveRoutine();
    if (r) exportVectorPDF(r);
  };

  const handleExportPng = () => {
    closeAllMenus();
    const r = store.getActiveRoutine();
    if (r) exportPNGImage('timetable-capture-area', r.name);
  };

  // Attach Desktop & Mobile Handlers
  container.querySelector('#action-new-routine')?.addEventListener('click', handleNewRoutine);
  container.querySelector('#mobile-action-new-routine')?.addEventListener('click', handleNewRoutine);

  container.querySelector('#action-delete-routine')?.addEventListener('click', handleDeleteRoutine);
  container.querySelector('#mobile-action-delete-routine')?.addEventListener('click', handleDeleteRoutine);

  container.querySelector('#action-random-colors')?.addEventListener('click', handleRandomColors);
  container.querySelector('#mobile-action-random-colors')?.addEventListener('click', handleRandomColors);

  container.querySelector('#action-load-nsu-slots')?.addEventListener('click', handleLoadNsuSlots);
  container.querySelector('#mobile-action-load-nsu-slots')?.addEventListener('click', handleLoadNsuSlots);

  container.querySelector('#action-export-pdf')?.addEventListener('click', handleExportPdf);
  container.querySelector('#mobile-action-export-pdf')?.addEventListener('click', handleExportPdf);

  container.querySelector('#action-export-png')?.addEventListener('click', handleExportPng);
  container.querySelector('#mobile-action-export-png')?.addEventListener('click', handleExportPng);

  container.querySelector('#action-print')?.addEventListener('click', () => {
    closeAllMenus();
    window.print();
  });
}
