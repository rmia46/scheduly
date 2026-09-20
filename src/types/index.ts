export interface TimeSlot {
  id: string;
  label: string; // e.g. "8:00-9:30"
}

export interface Course {
  id: string;
  courseGroupId?: string; // Links recurring multi-day instances of the same course
  name: string;
  section: string;
  room: string;
  day: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  slotId: string | null;
  color: string;
}

export interface Routine {
  id: string;
  name: string;
  slots: TimeSlot[];
  courses: Course[];
}

export type ThemeName = 'ocean' | 'grass' | 'lemon' | 'cherry' | 'grape';

export interface ThemeColors {
  name: ThemeName;
  label: string;
  primary: string;
  accent: string;
  badgeBg: string;
  swatches: string[];
}
