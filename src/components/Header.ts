import { store } from '../store/routineStore';
import { THEMES, APP_VERSION } from '../types/constants';
import type { ThemeName, Routine } from '../types';
import { exportVectorPDF, exportPNGImage, exportICSCalendar } from '../services/exportService';
import { renderLogoSvg, renderBrandWordSvg } from './Logo';
import { showToast, encodeToBase64Url, decodeFromBase64Url, escapeHtml } from '../services/utils';

export function renderHeader(container: HTMLElement): void {
  const state = store.getState();
  const theme = THEMES[state.theme];

  container.innerHTML = `
    <header class="bg-white/95 border-b sticky top-0 z-40 px-3 sm:px-4 py-2 flex items-center justify-between shadow-xs transition-all duration-300" style="border-color: ${theme.border};">
      <!-- Left: App Branding + Desktop Application Menu Bar -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- App Branding -->
        <div class="flex items-center gap-2 pr-2 border-r border-slate-200">
          ${renderLogoSvg('w-6 h-6 select-none pointer-events-none transition-colors duration-300', theme.primary, theme.accent)}
          ${renderBrandWordSvg('h-6 w-auto', theme.accent, true)}
        </div>

        <!-- Authentic Application Menu Bar (Desktop: md:flex) -->
        <nav class="hidden md:flex items-center gap-0.5 text-xs font-medium text-slate-700">
          <!-- 1. Routine Menu (App File menu equivalent) -->
          <div class="relative" id="menu-routine-wrapper">
            <button id="hdr-btn-routine-menu-toggle" class="px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1 font-medium">
              <span>Routine</span>
            </button>

            <div id="menu-routine-dropdown" class="hidden menu-popup-enter absolute left-0 mt-1 w-52 bg-white rounded-xl shadow-lg border py-1.5 z-50 text-xs" style="border-color: ${theme.border}; outline: 1px solid ${theme.accent}33;">
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

          <!-- 2. Edit / Action Menu -->
          <div class="relative" id="menu-tools-wrapper">
            <button id="hdr-btn-tools-toggle" class="px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1 font-medium">
              <span>Action</span>
            </button>

            <div id="menu-tools-dropdown" class="hidden menu-popup-enter absolute left-0 mt-1 w-52 bg-white rounded-xl shadow-lg border py-1.5 z-50 text-xs" style="border-color: ${theme.border}; outline: 1px solid ${theme.accent}33;">
              <button id="action-undo" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                !store.canUndo() ? 'opacity-40 pointer-events-none' : ''
              }">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h10a5 5 0 0 1 5 5v2m0 0l-3-3m3 3l3-3M3 10l4-4m-4 4l4 4" />
                  </svg>
                  <span>Undo</span>
                </div>
                <span class="text-[10px] text-slate-400">Ctrl+Z</span>
              </button>
              <button id="action-redo" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                !store.canRedo() ? 'opacity-40 pointer-events-none' : ''
              }">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 10H11a5 5 0 0 0-5 5v2m0 0l3-3m-3 3l-3-3m15-4l-4-4m4 4l-4 4" />
                  </svg>
                  <span>Redo</span>
                </div>
                <span class="text-[10px] text-slate-400">Ctrl+Y</span>
              </button>
              <div class="my-1 border-t border-slate-100"></div>
              <button id="action-random-colors" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-fuchsia-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                  </svg>
                  <span>Shuffle Colors</span>
                </div>
              </button>
              <button id="action-load-nsu-slots" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>Load NSU Slots</span>
                </div>
              </button>
              <div class="my-1 border-t border-slate-100"></div>
              <button id="action-toggle-quotes" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <span>Quotes Footer</span>
                </div>
                <span class="text-[10px] font-semibold ${state.showQuotes ? 'text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded' : 'text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded'}">
                  ${state.showQuotes ? 'On' : 'Off'}
                </span>
              </button>
              <div class="my-1 border-t border-slate-100"></div>
              <button id="action-reset-cache" class="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center justify-between cursor-pointer">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span class="font-medium">Reset Cache</span>
                </div>
                <span class="text-[10px] text-rose-400 font-medium">Clear data</span>
              </button>
            </div>
          </div>

          <!-- 3. Share Menu -->
          <div class="relative" id="menu-export-wrapper">
            <button id="hdr-btn-export-toggle" class="px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1 font-medium">
              <span>Share</span>
            </button>

            <div id="menu-export-dropdown" class="hidden menu-popup-enter absolute left-0 mt-1 w-52 bg-white rounded-xl shadow-lg border py-1.5 z-50 text-xs" style="border-color: ${theme.border}; outline: 1px solid ${theme.accent}33;">
              <button id="action-share-routine" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                  <span>Share Link</span>
                </div>
                <span class="text-[10px] text-slate-400 font-mono">URL</span>
              </button>
              <button id="action-import-link" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                  <span>Import Link</span>
                </div>
                <span class="text-[10px] text-emerald-600 font-medium">Paste</span>
              </button>
              <div class="my-1 border-t border-slate-100"></div>
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
              <button id="action-export-ics" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>Calendar (.ics)</span>
                </div>
                <span class="text-[10px] text-slate-400 font-mono">Recurring</span>
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

            <div id="menu-theme-dropdown" class="hidden menu-popup-enter absolute left-0 mt-1 w-44 bg-white rounded-xl shadow-lg border py-1.5 z-50 text-xs" style="border-color: ${theme.border}; outline: 1px solid ${theme.accent}33;">
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

          <!-- 5. Help Menu -->
          <div class="relative" id="menu-help-wrapper">
            <button id="hdr-btn-help-toggle" class="px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1 font-medium">
              <span>Help</span>
            </button>

            <div id="menu-help-dropdown" class="hidden menu-popup-enter absolute left-0 mt-1 w-44 bg-white rounded-xl shadow-lg border py-1.5 z-50 text-xs font-medium" style="border-color: ${theme.border}; outline: 1px solid ${theme.accent}33;">
              <button id="action-open-help" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer">
                <svg class="w-4 h-4 text-sky-600 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <span>How to Use</span>
              </button>
              <button id="action-open-about" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer">
                <svg class="w-4 h-4 text-indigo-600 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>About Scheduly</span>
              </button>
            </div>
          </div>
        </nav>
      </div>

      <!-- Right: Active Routine Selector & Mobile 3-Dots Menu -->
      <div class="flex items-center gap-2">
        <select id="hdr-routine-select" class="text-xs font-medium bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer max-w-[135px] sm:max-w-[200px] truncate transition-colors" title="Switch Active Routine">
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
          <div id="menu-mobile-dropdown" class="hidden menu-popup-right-enter absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-xl border py-2 z-50 text-xs" style="border-color: ${theme.border}; outline: 1px solid ${theme.accent}33;">
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

            <!-- Action Section -->
            <div class="my-1.5 border-t border-slate-100"></div>
            <div class="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action</div>
            <button id="mobile-action-undo" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer ${
              !store.canUndo() ? 'opacity-40 pointer-events-none' : ''
            }">
              <svg class="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h10a5 5 0 0 1 5 5v2m0 0l-3-3m3 3l3-3M3 10l4-4m-4 4l4 4" />
              </svg>
              <span>Undo (Ctrl+Z)</span>
            </button>
            <button id="mobile-action-redo" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer ${
              !store.canRedo() ? 'opacity-40 pointer-events-none' : ''
            }">
              <svg class="w-4 h-4 text-indigo-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 10H11a5 5 0 0 0-5 5v2m0 0l3-3m-3 3l-3-3m15-4l-4-4m4 4l-4 4" />
              </svg>
              <span>Redo (Ctrl+Y)</span>
            </button>
            <button id="mobile-action-random-colors" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer">
              <svg class="w-4 h-4 text-fuchsia-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
              </svg>
              <span>Shuffle Colors</span>
            </button>
            <button id="mobile-action-load-nsu-slots" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer">
              <svg class="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Load NSU Slots</span>
            </button>
            <button id="mobile-action-toggle-quotes" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer">
              <div class="flex items-center gap-2.5">
                <svg class="w-4 h-4 text-teal-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span>Quotes Footer</span>
              </div>
              <span class="text-[10px] font-semibold ${state.showQuotes ? 'text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded' : 'text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded'}">
                ${state.showQuotes ? 'On' : 'Off'}
              </span>
            </button>
            <button id="mobile-action-reset-cache" class="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center justify-between cursor-pointer">
              <div class="flex items-center gap-2.5">
                <svg class="w-4 h-4 text-rose-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span class="font-medium">Reset Cache</span>
              </div>
              <span class="text-[10px] text-rose-400 font-medium">Clear data</span>
            </button>

            <!-- Share Section -->
            <div class="my-1.5 border-t border-slate-100"></div>
            <div class="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Share</div>
            <button id="mobile-action-share-routine" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer">
              <svg class="w-4 h-4 text-sky-600 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              <span>Share Routine (Link)</span>
            </button>
            <button id="mobile-action-import-link" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer">
              <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path stroke-linecap="round" stroke-linejoin="round" d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              <span>Import Shared Link</span>
            </button>
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
            <button id="mobile-action-export-ics" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer">
              <svg class="w-4 h-4 text-purple-600 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>Export Calendar (.ics)</span>
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

            <!-- Help & About Section -->
            <div class="my-1.5 border-t border-slate-100"></div>
            <div class="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Help & Info</div>
            <button id="mobile-action-open-help" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer">
              <svg class="w-4 h-4 text-sky-600 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span>How to Use</span>
            </button>
            <button id="mobile-action-open-about" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer">
              <svg class="w-4 h-4 text-indigo-600 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>About Scheduly</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  `;

  // Attach Safe Listeners
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

  const helpToggle = container.querySelector('#hdr-btn-help-toggle');
  const helpMenu = container.querySelector('#menu-help-dropdown');

  const mobileToggle = container.querySelector('#hdr-btn-mobile-menu-toggle');
  const mobileMenu = container.querySelector('#menu-mobile-dropdown');

  const allMenus = [themeMenu, routineMenu, toolsMenu, exportMenu, helpMenu, mobileMenu];
  const closeAllMenus = () => allMenus.forEach((m) => m?.classList.add('hidden'));

  // Mobile Menu Toggle
  mobileToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isClosed = mobileMenu?.classList.contains('hidden');
    closeAllMenus();
    if (isClosed) mobileMenu?.classList.remove('hidden');
  });

  // Help Menu Toggle
  helpToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isClosed = helpMenu?.classList.contains('hidden');
    closeAllMenus();
    if (isClosed) helpMenu?.classList.remove('hidden');
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

  // Modal Render Helpers
  const showModal = (title: string, contentHtml: string) => {
    const existing = document.getElementById('scheduly-modal-backdrop');
    if (existing) existing.remove();

    const backdrop = document.createElement('div');
    backdrop.id = 'scheduly-modal-backdrop';
    backdrop.className =
      'fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200';

    backdrop.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        <!-- Header -->
        <div class="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">${title}</h3>
          <button id="btn-modal-close" class="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer" title="Close">
            <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <!-- Body -->
        <div class="px-5 py-4 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
          ${contentHtml}
        </div>
        <!-- Footer -->
        <div class="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button id="btn-modal-ok" class="px-4 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs hover:opacity-90 transition-opacity cursor-pointer" style="background-color: ${theme.primary};">
            Got it
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    const closeModal = () => backdrop.remove();
    backdrop.querySelector('#btn-modal-close')?.addEventListener('click', closeModal);
    backdrop.querySelector('#btn-modal-ok')?.addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });
  };

  const showAboutModal = () => {
    closeAllMenus();
    showModal(
      `
      <svg class="w-4.5 h-4.5 text-indigo-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      <span>About Scheduly</span>
      `,
      `
      <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
        <div class="p-1 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center">
          ${renderLogoSvg('w-10 h-10', theme.primary, theme.accent)}
        </div>
        <div>
          <h4 class="text-sm font-bold text-slate-900 leading-tight">Scheduly v${APP_VERSION}</h4>
          <p class="text-[11px] text-slate-500">Your Routine, Simplified</p>
        </div>
      </div>

      <div class="space-y-2">
        <p>Scheduly is a modern, responsive academic timetable manager built for speed, clean aesthetics, and flexible multi-slot course scheduling.</p>
      </div>

      <div class="space-y-2 pt-1 border-t border-slate-100">
        <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50">
          <span class="font-semibold text-slate-700 flex items-center gap-2">
            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Author
          </span>
          <a href="https://github.com/rmia46" target="_blank" rel="noopener noreferrer" class="font-bold text-slate-900 hover:text-sky-600 transition-colors flex items-center gap-1">
            <span>Roman Mia</span>
            <span class="text-[10px] text-slate-400 font-normal">(@rmia46)</span>
          </a>
        </div>

        <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50">
          <span class="font-semibold text-slate-700 flex items-center gap-2">
            <svg class="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path>
            </svg>
            GitHub Repository
          </span>
          <a href="https://github.com/rmia46/scheduly" target="_blank" rel="noopener noreferrer" class="font-bold text-sky-600 hover:text-sky-700 underline flex items-center gap-1">
            github.com/rmia46/scheduly
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>
      </div>
      `
    );
  };

  const showHelpModal = () => {
    closeAllMenus();
    showModal(
      `
      <svg class="w-4.5 h-4.5 text-sky-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
      <span>How to Use Scheduly</span>
      `,
      `
      <div class="space-y-3">
        <!-- Step 1 -->
        <div class="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div class="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 font-bold flex items-center justify-center shrink-0 text-xs">1</div>
          <div>
            <h5 class="font-bold text-slate-900 mb-0.5">Add Courses to Days & Slots</h5>
            <p class="text-slate-500 text-[11px]">In the left sidebar, enter course name, section, room, and faculty initial. Check multiple days (e.g. Sun & Tue) and time slots to schedule them in one step.</p>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div class="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-xs">2</div>
          <div>
            <h5 class="font-bold text-slate-900 mb-0.5">Click Any Cell to Quick-Add</h5>
            <p class="text-slate-500 text-[11px]">Clicking any timetable cell opens the editor panel with that day and slot automatically selected.</p>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div class="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-xs">3</div>
          <div>
            <h5 class="font-bold text-slate-900 mb-0.5">Drag & Drop Rescheduling</h5>
            <p class="text-slate-500 text-[11px]">Drag any course card to another cell to quickly reschedule it with live ghost preview.</p>
          </div>
        </div>

        <!-- Step 4 -->
        <div class="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div class="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 font-bold flex items-center justify-center shrink-0 text-xs">4</div>
          <div>
            <h5 class="font-bold text-slate-900 mb-0.5">Themes, Colors & NSU Slots</h5>
            <p class="text-slate-500 text-[11px]">Switch themes from the Theme menu to restyle the entire app. Use <code>Action ▾</code> to shuffle colors or load official North South University (NSU) slots.</p>
          </div>
        </div>

        <!-- Step 5 -->
        <div class="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div class="w-6 h-6 rounded-lg bg-pink-100 text-pink-700 font-bold flex items-center justify-center shrink-0 text-xs">5</div>
          <div>
            <h5 class="font-bold text-slate-900 mb-0.5">Share Routine (Link, PDF, PNG, .ics)</h5>
            <p class="text-slate-500 text-[11px]">Use <code>Share ▾</code> to copy a zero-server shareable web link, download sharp vector PDFs, PNG images, or export recurring calendar schedules (<code>.ics</code>).</p>
          </div>
        </div>

        <!-- Step 6 -->
        <div class="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div class="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 font-bold flex items-center justify-center shrink-0 text-xs">6</div>
          <div>
            <h5 class="font-bold text-slate-900 mb-0.5">Undo & Redo History</h5>
            <p class="text-slate-500 text-[11px]">Made a mistake? Press <code>Ctrl+Z</code> to undo or <code>Ctrl+Y</code> to redo any schedule edit, color shuffle, or course move.</p>
          </div>
        </div>

        <!-- Step 7 -->
        <div class="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div class="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-xs">7</div>
          <div>
            <h5 class="font-bold text-slate-900 mb-0.5">Full View & Editor Focus (⌘B / Ctrl+B)</h5>
            <p class="text-slate-500 text-[11px]">Press <code>⌘B</code> or <code>Ctrl+B</code> to collapse the editor into Full View mode for wide, distraction-free timetable preview.</p>
          </div>
        </div>
      </div>
      `
    );
  };

  // Menu Actions Helper
  const handleNewRoutine = () => {
    closeAllMenus();
    const name = window.prompt('Enter Routine Name:', `Routine ${store.getState().routines.length + 1}`);
    if (name && name.trim()) {
      store.createRoutine(name.trim());
    }
  };

  const handleShareRoutine = () => {
    closeAllMenus();
    const routine = store.getActiveRoutine();
    if (!routine) return;

    // Compact payload for URL sharing
    const payload = {
      name: routine.name,
      slots: routine.slots.map((s) => ({ id: s.id, label: s.label })),
      courses: routine.courses.map((c) => ({
        name: c.name,
        section: c.section,
        room: c.room,
        faculty: c.faculty,
        day: c.day,
        slotId: c.slotId,
        color: c.color,
        courseGroupId: c.courseGroupId,
      })),
    };

    const hashString = encodeToBase64Url(payload);
    const shareUrl = `${window.location.origin}${window.location.pathname}#routine=${hashString}`;

    showModal(
      `
      <svg class="w-4.5 h-4.5 text-sky-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <circle cx="18" cy="5" r="3"></circle>
        <circle cx="6" cy="12" r="3"></circle>
        <circle cx="18" cy="19" r="3"></circle>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
      </svg>
      <span>Share Routine</span>
      `,
      `
      <p class="text-slate-600 text-xs leading-relaxed">
        Anyone with this link can view and import your complete schedule: <strong>${escapeHtml(routine.name)}</strong> (${routine.courses.length} courses).
      </p>

      <div class="space-y-2 pt-1">
        <label class="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Shareable Link</label>
        <div class="flex items-center gap-2">
          <input id="input-share-url" type="text" readonly value="${shareUrl}" class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 select-all focus:outline-none focus:ring-2 focus:ring-sky-400" />
          <button id="btn-copy-share-url" class="px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 transition-opacity cursor-pointer shrink-0 flex items-center gap-1.5" style="background-color: ${theme.primary}">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>Copy</span>
          </button>
        </div>
        <p class="text-[10px] text-slate-400">
          Client-side URL fragment. No data is stored on any server.
        </p>
      </div>
      `
    );

    const copyBtn = document.getElementById('btn-copy-share-url');
    copyBtn?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Share link copied to clipboard!');
        const btnText = copyBtn.querySelector('span');
        if (btnText) btnText.textContent = 'Copied!';
      } catch (err) {
        const input = document.getElementById('input-share-url') as HTMLInputElement | null;
        input?.select();
        document.execCommand('copy');
        showToast('Link copied!');
      }
    });
  };

  const handleImportLink = () => {
    closeAllMenus();

    showModal(
      `
      <svg class="w-4.5 h-4.5 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path stroke-linecap="round" stroke-linejoin="round" d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
      </svg>
      <span>Import Routine from Link</span>
      `,
      `
      <p class="text-slate-600 text-xs leading-relaxed">
        Paste a Scheduly shared link or URL fragment below to import the complete routine into your workspace.
      </p>

      <div class="space-y-3 pt-1">
        <div>
          <label class="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">Shared Link / URL Fragment</label>
          <textarea id="input-import-url-field" rows="3" placeholder="https://...#routine=... or #routine=..." class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 leading-relaxed"></textarea>
          <p class="text-[10px] text-slate-400 mt-1">Accepts full links or just the <code>#routine=...</code> fragment.</p>
        </div>

        <div id="import-link-error-msg" class="hidden p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-medium flex items-center gap-2">
          <svg class="w-3.5 h-3.5 shrink-0 text-rose-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>Invalid routine link. Please check the pasted URL.</span>
        </div>
      </div>

      <div class="pt-2 flex justify-end gap-2">
        <button id="btn-submit-import-link" class="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5" style="background-color: ${theme.primary}">
          <span>Load & Import Routine</span>
        </button>
      </div>
      `
    );

    const submitBtn = document.getElementById('btn-submit-import-link');
    submitBtn?.addEventListener('click', () => {
      const textarea = document.getElementById('input-import-url-field') as HTMLTextAreaElement | null;
      const errorMsg = document.getElementById('import-link-error-msg');
      const val = textarea?.value.trim() || '';

      if (!val) {
        textarea?.focus();
        return;
      }

      let payloadStr = '';
      if (val.includes('#routine=')) {
        payloadStr = val.split('#routine=')[1]?.split('&')[0] || '';
      } else if (val.includes('routine=')) {
        payloadStr = val.split('routine=')[1]?.split('&')[0] || '';
      } else {
        // Maybe raw base64 string
        payloadStr = val;
      }

      const imported = decodeFromBase64Url<Routine>(payloadStr);
      if (!imported || !Array.isArray(imported.courses) || !Array.isArray(imported.slots)) {
        if (errorMsg) errorMsg.classList.remove('hidden');
        return;
      }

      store.importRoutine(imported);
      const backdrop = document.getElementById('scheduly-modal-backdrop');
      backdrop?.remove();
      showToast(`Imported "${imported.name}"!`);
    });
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

  const handleExportIcs = () => {
    closeAllMenus();
    const routine = store.getActiveRoutine();
    if (!routine) return;

    if (routine.courses.length === 0) {
      alert('Your routine has no courses to export.');
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);

    showModal(
      `
      <svg class="w-4.5 h-4.5 text-purple-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
      <span>Export to Calendar (.ics)</span>
      `,
      `
      <p class="text-slate-600 text-xs leading-relaxed">
        Export your weekly routine as recurring events compatible with Google Calendar, Apple Calendar, and Outlook.
      </p>

      <div class="space-y-3 pt-1">
        <div>
          <label class="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">Semester / Start Date</label>
          <input id="input-ics-start-date" type="date" value="${todayStr}" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400" />
          <p class="text-[10px] text-slate-400 mt-1">First day of classes or semester begin date.</p>
        </div>

        <div>
          <label class="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">Duration (Recurring Period)</label>
          <select id="input-ics-duration" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer">
            <option value="1">1 Month (Sprint / Exam Month)</option>
            <option value="2">2 Months</option>
            <option value="3">3 Months (Quarter)</option>
            <option value="4" selected>4 Months (Standard Academic Semester)</option>
            <option value="5">5 Months</option>
            <option value="6">6 Months (Semester / Half-Year)</option>
            <option value="12">12 Months (Full Academic Year)</option>
          </select>
          <p class="text-[10px] text-slate-400 mt-1">The calendar event rule will repeat every week until this timeframe ends.</p>
        </div>

        <div class="p-3 rounded-xl bg-purple-50/60 border border-purple-100 flex items-start gap-2.5">
          <svg class="w-4 h-4 text-purple-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <p class="text-[11px] text-purple-900 leading-normal">
            Includes course names, sections, room numbers, and faculty details. Just double-click or import the downloaded <code>.ics</code> file into your calendar app.
          </p>
        </div>
      </div>

      <div class="pt-2 flex justify-end gap-2">
        <button id="btn-download-ics-action" class="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 transition-opacity cursor-pointer flex items-center justify-center gap-2" style="background-color: ${theme.primary}">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          <span>Download .ics Calendar</span>
        </button>
      </div>
      `
    );

    const downloadBtn = document.getElementById('btn-download-ics-action');
    downloadBtn?.addEventListener('click', () => {
      const dateInput = document.getElementById('input-ics-start-date') as HTMLInputElement | null;
      const durationInput = document.getElementById('input-ics-duration') as HTMLSelectElement | null;
      const startDate = dateInput?.value || todayStr;
      const monthsDuration = parseInt(durationInput?.value || '4', 10);

      exportICSCalendar(routine, { startDate, monthsDuration });

      const backdrop = document.getElementById('scheduly-modal-backdrop');
      backdrop?.remove();
    });
  };

  // Attach Desktop & Mobile Handlers
  container.querySelector('#action-new-routine')?.addEventListener('click', handleNewRoutine);
  container.querySelector('#mobile-action-new-routine')?.addEventListener('click', handleNewRoutine);

  container.querySelector('#action-share-routine')?.addEventListener('click', handleShareRoutine);
  container.querySelector('#mobile-action-share-routine')?.addEventListener('click', handleShareRoutine);

  container.querySelector('#action-import-link')?.addEventListener('click', handleImportLink);
  container.querySelector('#mobile-action-import-link')?.addEventListener('click', handleImportLink);

  container.querySelector('#action-delete-routine')?.addEventListener('click', handleDeleteRoutine);
  container.querySelector('#mobile-action-delete-routine')?.addEventListener('click', handleDeleteRoutine);

  const handleUndo = () => {
    closeAllMenus();
    if (store.undo()) {
      showToast('Undone action');
    } else {
      showToast('Nothing to undo');
    }
  };

  const handleRedo = () => {
    closeAllMenus();
    if (store.redo()) {
      showToast('Redone action');
    } else {
      showToast('Nothing to redo');
    }
  };

  container.querySelector('#action-undo')?.addEventListener('click', handleUndo);
  container.querySelector('#mobile-action-undo')?.addEventListener('click', handleUndo);

  container.querySelector('#action-redo')?.addEventListener('click', handleRedo);
  container.querySelector('#mobile-action-redo')?.addEventListener('click', handleRedo);

  container.querySelector('#action-random-colors')?.addEventListener('click', handleRandomColors);
  container.querySelector('#mobile-action-random-colors')?.addEventListener('click', handleRandomColors);

  container.querySelector('#action-load-nsu-slots')?.addEventListener('click', handleLoadNsuSlots);
  container.querySelector('#mobile-action-load-nsu-slots')?.addEventListener('click', handleLoadNsuSlots);

  const handleToggleQuotes = () => {
    closeAllMenus();
    const enabled = store.toggleQuotes();
    showToast(enabled ? 'Footer quotes enabled' : 'Footer quotes hidden');
  };

  container.querySelector('#action-toggle-quotes')?.addEventListener('click', handleToggleQuotes);
  container.querySelector('#mobile-action-toggle-quotes')?.addEventListener('click', handleToggleQuotes);

  const handleResetCache = () => {
    closeAllMenus();
    if (confirm('Are you sure you want to reset all data and cache for this app? This will clear all routines and restore the fresh default state.')) {
      store.clearStorage();
    }
  };

  container.querySelector('#action-reset-cache')?.addEventListener('click', handleResetCache);
  container.querySelector('#mobile-action-reset-cache')?.addEventListener('click', handleResetCache);

  container.querySelector('#action-export-pdf')?.addEventListener('click', handleExportPdf);
  container.querySelector('#mobile-action-export-pdf')?.addEventListener('click', handleExportPdf);

  container.querySelector('#action-export-png')?.addEventListener('click', handleExportPng);
  container.querySelector('#mobile-action-export-png')?.addEventListener('click', handleExportPng);

  container.querySelector('#action-export-ics')?.addEventListener('click', handleExportIcs);
  container.querySelector('#mobile-action-export-ics')?.addEventListener('click', handleExportIcs);

  container.querySelector('#action-open-about')?.addEventListener('click', showAboutModal);
  container.querySelector('#mobile-action-open-about')?.addEventListener('click', showAboutModal);

  container.querySelector('#action-open-help')?.addEventListener('click', showHelpModal);
  container.querySelector('#mobile-action-open-help')?.addEventListener('click', showHelpModal);

  container.querySelector('#action-print')?.addEventListener('click', () => {
    closeAllMenus();
    window.print();
  });
}
