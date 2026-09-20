import type { ThemeColors, ThemeName } from '../types';

export const PREDEFINED_SLOTS: string[] = [
  '08:00-09:30',
  '09:40-11:10',
  '11:20-12:50',
  '13:00-14:30',
  '14:40-16:10',
  '16:20-17:50',
  '18:00-19:30',
];

export const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export const THEMES: Record<ThemeName, ThemeColors> = {
  ocean: {
    name: 'ocean',
    label: '🌊 Ocean',
    primary: '#0284c7',
    accent: '#0369a1',
    badgeBg: '#e0f2fe',
    swatches: ['#0284c7', '#0ea5e9', '#38bdf8', '#06b6d4', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'],
  },
  grass: {
    name: 'grass',
    label: '🌿 Grass',
    primary: '#16a34a',
    accent: '#15803d',
    badgeBg: '#dcfce7',
    swatches: ['#16a34a', '#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444', '#8b5cf6', '#0284c7'],
  },
  lemon: {
    name: 'lemon',
    label: '🍋 Lemon',
    primary: '#ca8a04',
    accent: '#a16207',
    badgeBg: '#fef9c3',
    swatches: ['#ca8a04', '#eab308', '#f59e0b', '#f97316', '#ef4444', '#16a34a', '#0ea5e9', '#8b5cf6'],
  },
  cherry: {
    name: 'cherry',
    label: '🌸 Cherry',
    primary: '#db2777',
    accent: '#be185d',
    badgeBg: '#fce7f3',
    swatches: ['#db2777', '#ec4899', '#f43f5e', '#ef4444', '#a855f7', '#6366f1', '#3b82f6', '#10b981'],
  },
  grape: {
    name: 'grape',
    label: '🍇 Grape',
    primary: '#7c3aed',
    accent: '#6d28d9',
    badgeBg: '#ede9fe',
    swatches: ['#7c3aed', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#3b82f6', '#06b6d4', '#10b981'],
  },
};
