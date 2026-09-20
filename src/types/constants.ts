import type { ThemeColors, ThemeName } from '../types';

// North South University (NSU) Standard Academic Time Slots
export const NSU_SLOTS: string[] = [
  '08:00-09:30',
  '09:40-11:10',
  '11:20-12:50',
  '13:00-14:30',
  '14:40-16:10',
  '16:20-17:50',
  '18:00-19:30',
];

export const PREDEFINED_SLOTS = NSU_SLOTS;

export const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export const THEMES: Record<ThemeName, ThemeColors> = {
  ocean: {
    name: 'ocean',
    label: 'Ocean',
    primary: '#0284c7',
    accent: '#0369a1',
    badgeBg: '#e0f2fe',
    bg: '#f8fafc', // M3 subtle neutral surface with 1.5% blue tone
    cardBg: '#ffffff',
    border: '#e2e8f0',
    subtleBg: '#f1f5f9',
    // Ocean: Cool aquatic analogous range (Deep Navy, Sky Blue, Cyan, Teal, Slate Indigo, Aquamarine, Mint Blue, Cobalt)
    swatches: [
      '#0284c7', // Sky Blue
      '#0d9488', // Deep Teal
      '#06b6d4', // Cyan
      '#4f46e5', // Indigo
      '#059669', // Emerald Teal
      '#2563eb', // Royal Cobalt
      '#14b8a6', // Aquamarine
      '#64748b', // Steel Slate
    ],
  },
  grass: {
    name: 'grass',
    label: 'Grass',
    primary: '#16a34a',
    accent: '#15803d',
    badgeBg: '#dcfce7',
    bg: '#f7faf7', // M3 subtle neutral surface with 1.5% mint tone
    cardBg: '#ffffff',
    border: '#e2e8e2',
    subtleBg: '#eff5ef',
    // Grass: Botanical & nature range (Forest, Lime, Teal, Olive, Mint, Spring Green, Warm Pine, Cyan Sage)
    swatches: [
      '#16a34a', // Vivid Green
      '#0d9488', // Deep Teal
      '#65a30d', // Fresh Olive Lime
      '#059669', // Emerald
      '#0284c7', // Sky Cyan
      '#84cc16', // Bright Lime
      '#0f766e', // Forest Pine
      '#10b981', // Spring Mint
    ],
  },
  lemon: {
    name: 'lemon',
    label: 'Lemon',
    primary: '#ca8a04',
    accent: '#a16207',
    badgeBg: '#fef9c3',
    bg: '#faf9f5', // M3 subtle warm surface with 1.5% amber tone
    cardBg: '#ffffff',
    border: '#eeebe2',
    subtleBg: '#f5f3ec',
    // Lemon: Warm solar & citrus range (Citron, Amber, Ochre, Warm Tangerine, Chartreuse, Olive, Sun Gold, Coral Peach)
    swatches: [
      '#ca8a04', // Rich Citron Gold
      '#d97706', // Deep Amber
      '#65a30d', // Chartreuse Olive
      '#ea580c', // Tangerine Flame
      '#eab308', // Radiant Yellow
      '#16a34a', // Fresh Green Leaf
      '#f97316', // Warm Coral
      '#854d0e', // Ochre Bronze
    ],
  },
  cherry: {
    name: 'cherry',
    label: 'Cherry',
    primary: '#db2777',
    accent: '#be185d',
    badgeBg: '#fce7f3',
    bg: '#faf7f8', // M3 subtle neutral surface with 1.5% rose tone
    cardBg: '#ffffff',
    border: '#eee3e6',
    subtleBg: '#f6eff1',
    // Cherry: Floral & berry spectrum (Ruby, Rose, Plum, Fuchsia, Coral, Violet-Rose, Crimson, Wine)
    swatches: [
      '#db2777', // Vivid Pink Rose
      '#e11d48', // Crimson Rose
      '#c026d3', // Deep Fuchsia
      '#f43f5e', // Strawberry Coral
      '#9333ea', // Royal Purple
      '#be123c', // Deep Wine Ruby
      '#d946ef', // Orchid
      '#f97316', // Sunset Coral
    ],
  },
  grape: {
    name: 'grape',
    label: 'Grape',
    primary: '#7c3aed',
    accent: '#6d28d9',
    badgeBg: '#ede9fe',
    bg: '#f9f7fa', // M3 subtle neutral surface with 1.5% lavender tone
    cardBg: '#ffffff',
    border: '#e7e2ea',
    subtleBg: '#f2eef4',
    // Grape: Twilight analogous range (Violet, Indigo, Orchid, Cobalt, Plum, Periwinkle, Magenta, Deep Navy)
    swatches: [
      '#7c3aed', // Deep Violet
      '#4f46e5', // Vivid Indigo
      '#c026d3', // Royal Plum
      '#2563eb', // Cobalt Blue
      '#a855f7', // Radiant Purple
      '#db2777', // Berry Magenta
      '#0284c7', // Cyan Blue
      '#6366f1', // Periwinkle Iris
    ],
  },
};
