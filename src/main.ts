import './styles/main.css';
import { store } from './store/routineStore';
import { renderHeader } from './components/Header';
import { renderSidebar } from './components/Sidebar';
import { renderTimetable } from './components/Timetable';

function mount(): void {
  const headerContainer = document.getElementById('app-header');
  const sidebarContainer = document.getElementById('app-sidebar');
  const timetableContainer = document.getElementById('app-timetable');

  if (!headerContainer || !sidebarContainer || !timetableContainer) return;

  function renderAll(): void {
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
