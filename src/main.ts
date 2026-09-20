import './styles/main.css';
import { store } from './store/routineStore';
import { THEMES } from './types/constants';
import { renderHeader } from './components/Header';
import { renderSidebar } from './components/Sidebar';
import { renderTimetable } from './components/Timetable';

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

  // Subscribe to state updates
  store.subscribe(() => {
    renderAll();
  });
}

document.addEventListener('DOMContentLoaded', mount);
