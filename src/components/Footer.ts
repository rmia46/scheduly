import { store } from '../store/routineStore';
import { THEMES } from '../types/constants';

export function renderFooter(container: HTMLElement): void {
  const state = store.getState();
  const theme = THEMES[state.theme];

  container.innerHTML = `
    <div class="border-t border-slate-200/80 bg-white/75 backdrop-blur-md py-4 px-4 sm:px-6">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div class="flex items-center gap-2">
          <div class="w-5 h-5 rounded-md flex items-center justify-center font-black text-[10px] text-white shadow-2xs" style="background-color: ${theme.primary}">
            S
          </div>
          <span class="font-bold text-slate-800">Scheduly</span>
          <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold font-mono" style="background-color: ${theme.subtleBg}; color: ${theme.accent};">v2.0.0</span>
          <span class="text-slate-300">•</span>
          <span class="text-slate-500">Your Routine, Simplified</span>
        </div>

        <div class="flex items-center gap-4 text-[11px]">
          <a href="https://github.com/rmia46/scheduly" target="_blank" rel="noopener noreferrer" class="hover:text-slate-800 transition-colors flex items-center gap-1 font-medium">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </div>
  `;
}
