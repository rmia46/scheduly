import type { Course, Routine, ThemeName } from '../types';
import { PREDEFINED_SLOTS, THEMES } from '../types/constants';
import { uid } from '../services/utils';

const STORAGE_KEY = 'scheduly_app_state_v2';
const THEME_KEY = 'scheduly_theme_v2';

export interface AppState {
  routines: Routine[];
  activeRoutineId: string;
  theme: ThemeName;
  sidebarOpen: boolean;
  activeTab: 'add' | 'courses' | 'slots';
  selectedCell: { day: number; slotId: string } | null;
}

class Store {
  private state: AppState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadInitialState();
  }

  private loadInitialState(): AppState {
    const savedTheme = (localStorage.getItem(THEME_KEY) as ThemeName) || 'ocean';
    const theme = THEMES[savedTheme] ? savedTheme : 'ocean';

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.routines) && parsed.routines.length > 0) {
          const activeId = parsed.activeRoutineId && parsed.routines.some((r: Routine) => r.id === parsed.activeRoutineId)
            ? parsed.activeRoutineId
            : parsed.routines[0].id;

          return {
            routines: parsed.routines,
            activeRoutineId: activeId,
            theme,
            sidebarOpen: parsed.sidebarOpen !== undefined ? parsed.sidebarOpen : true,
            activeTab: 'add',
            selectedCell: null,
          };
        }
      }
    } catch (e) {
      console.error('Failed to load storage, initializing fresh state', e);
    }

    // Default first routine
    const defaultRoutine: Routine = {
      id: uid('routine'),
      name: 'Spring 2025 Routine',
      slots: PREDEFINED_SLOTS.map((label) => ({ id: uid('slot'), label })),
      courses: [],
    };

    return {
      routines: [defaultRoutine],
      activeRoutineId: defaultRoutine.id,
      theme,
      sidebarOpen: true,
      activeTab: 'add',
      selectedCell: null,
    };
  }

  public getState(): Readonly<AppState> {
    return this.state;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.persist();
    for (const listener of this.listeners) {
      listener();
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          routines: this.state.routines,
          activeRoutineId: this.state.activeRoutineId,
          sidebarOpen: this.state.sidebarOpen,
        })
      );
      localStorage.setItem(THEME_KEY, this.state.theme);
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  public getActiveRoutine(): Routine | undefined {
    return this.state.routines.find((r) => r.id === this.state.activeRoutineId);
  }

  public setTheme(theme: ThemeName): void {
    if (THEMES[theme]) {
      this.state.theme = theme;
      this.notify();
    }
  }

  public setSidebarOpen(open: boolean): void {
    this.state.sidebarOpen = open;
    this.notify();
  }

  public toggleSidebar(): void {
    this.state.sidebarOpen = !this.state.sidebarOpen;
    this.notify();
  }

  public setActiveTab(tab: 'add' | 'courses' | 'slots'): void {
    this.state.activeTab = tab;
    this.notify();
  }

  public setSelectedCell(cell: { day: number; slotId: string } | null): void {
    this.state.selectedCell = cell;
    this.notify();
  }

  public switchRoutine(id: string): void {
    if (this.state.routines.some((r) => r.id === id)) {
      this.state.activeRoutineId = id;
      this.state.selectedCell = null;
      this.notify();
    }
  }

  public setRoutineName(name: string): void {
    const routine = this.getActiveRoutine();
    if (routine) {
      routine.name = name;
      this.notify();
    }
  }

  public createRoutine(name: string): string {
    const active = this.getActiveRoutine();
    const newRoutine: Routine = {
      id: uid('routine'),
      name: name.trim() || `Routine ${this.state.routines.length + 1}`,
      slots: active ? active.slots.map((s) => ({ ...s, id: uid('slot') })) : PREDEFINED_SLOTS.map((l) => ({ id: uid('slot'), label: l })),
      courses: [],
    };
    this.state.routines.push(newRoutine);
    this.state.activeRoutineId = newRoutine.id;
    this.notify();
    return newRoutine.id;
  }

  public deleteActiveRoutine(): boolean {
    if (this.state.routines.length <= 1) {
      return false;
    }
    this.state.routines = this.state.routines.filter((r) => r.id !== this.state.activeRoutineId);
    this.state.activeRoutineId = this.state.routines[0].id;
    this.notify();
    return true;
  }

  public addCourse(course: Omit<Course, 'id'>): void {
    const routine = this.getActiveRoutine();
    if (!routine) return;

    const newCourse: Course = {
      ...course,
      id: uid('course'),
    };
    routine.courses.push(newCourse);
    this.notify();
  }

  public updateCourse(updated: Course): void {
    const routine = this.getActiveRoutine();
    if (!routine) return;

    const index = routine.courses.findIndex((c) => c.id === updated.id);
    if (index !== -1) {
      routine.courses[index] = updated;
      this.notify();
    }
  }

  public deleteCourse(id: string): void {
    const routine = this.getActiveRoutine();
    if (!routine) return;
    routine.courses = routine.courses.filter((c) => c.id !== id);
    this.notify();
  }

  public moveCourse(courseId: string, day: number, slotId: string): void {
    const routine = this.getActiveRoutine();
    if (!routine) return;
    const course = routine.courses.find((c) => c.id === courseId);
    if (course) {
      course.day = day;
      course.slotId = slotId;
      this.notify();
    }
  }

  public addSlot(label: string): void {
    const routine = this.getActiveRoutine();
    if (!routine) return;
    routine.slots.push({ id: uid('slot'), label });
    // Sort slots chronologically by start time
    routine.slots.sort((a, b) => {
      const [aStart] = a.label.split('-');
      const [bStart] = b.label.split('-');
      return aStart.localeCompare(bStart);
    });
    this.notify();
  }

  public removeSlot(id: string): void {
    const routine = this.getActiveRoutine();
    if (!routine) return;
    routine.slots = routine.slots.filter((s) => s.id !== id);
    // Unassign courses assigned to this slot
    for (const c of routine.courses) {
      if (c.slotId === id) {
        c.slotId = null;
      }
    }
    this.notify();
  }

  public loadDefaultSlots(): void {
    const routine = this.getActiveRoutine();
    if (!routine) return;
    routine.slots = PREDEFINED_SLOTS.map((label) => ({ id: uid('slot'), label }));
    for (const c of routine.courses) {
      c.slotId = null;
    }
    this.notify();
  }

  public randomizeColors(): void {
    const routine = this.getActiveRoutine();
    if (!routine || routine.courses.length === 0) return;
    const swatches = THEMES[this.state.theme].swatches;
    routine.courses.forEach((c, idx) => {
      c.color = swatches[idx % swatches.length];
    });
    this.notify();
  }

  public clearStorage(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(THEME_KEY);
    window.location.reload();
  }
}

export const store = new Store();
