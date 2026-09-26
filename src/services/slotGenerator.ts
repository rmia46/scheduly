/**
 * Utility to calculate and auto-generate class time slots.
 */

export interface SlotGeneratorOptions {
  startTime: string; // "HH:MM" e.g. "08:00"
  durationMinutes: number; // e.g. 90
  gapMinutes: number; // e.g. 10 or 0
  count: number; // e.g. 7
}

/**
 * Format total minutes from midnight into 24h "HH:MM" string.
 */
export function minutesToTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Convert "HH:MM" string to minutes from midnight. Returns NaN if invalid.
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return NaN;
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return NaN;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return NaN;
  return h * 60 + m;
}

/**
 * Generate a list of time slot labels in "HH:MM-HH:MM" format.
 */
export function generateTimeSlots(options: SlotGeneratorOptions): string[] {
  const { startTime, durationMinutes, gapMinutes, count } = options;
  const startMin = timeToMinutes(startTime);
  if (isNaN(startMin) || durationMinutes <= 0 || count <= 0) {
    return [];
  }

  const slots: string[] = [];
  let currentStart = startMin;

  for (let i = 0; i < count; i++) {
    const currentEnd = currentStart + durationMinutes;
    const startStr = minutesToTime(currentStart);
    const endStr = minutesToTime(currentEnd);
    slots.push(`${startStr}-${endStr}`);
    currentStart = currentEnd + Math.max(0, gapMinutes);
  }

  return slots;
}
