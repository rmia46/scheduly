/**
 * Generates an inline SVG logo that conceptually merges a schedule/timetable grid with an "S" flow.
 * No background, using currentColor or explicit CSS variables / theme colors so it adapts dynamically
 * with the active theme.
 *
 * Concept:
 * - 3 rows of schedule slot pill blocks arranged in an "S" zig-zag sequence.
 * - Connected by a continuous fluid 'S' schedule curve line weaving through them.
 * - Primary accent & theme tint slots.
 */
export function renderLogoSvg(className: string = 'w-5.5 h-5.5', primaryColor?: string, accentColor?: string): string {
  const primary = primaryColor || 'var(--theme-primary, currentColor)';
  const accent = accentColor || 'var(--theme-accent, #0284c7)';
  const subtle = 'var(--theme-border, #cbd5e1)';

  return `
  <svg class="${className}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Scheduly Logo">
    <!-- Row 1: Top timetable slot (right aligned / active) -->
    <rect x="13" y="4" width="13" height="4.5" rx="2.25" fill="${primary}" />
    <rect x="5" y="4" width="6" height="4.5" rx="2" fill="${subtle}" opacity="0.6" />

    <!-- Upper S curve weaving from top right down to center left -->
    <path d="M19.5 8.5 C 19.5 13.5, 6 12.5, 6 16" stroke="${primary}" stroke-width="2.5" stroke-linecap="round" />

    <!-- Row 2: Middle timetable slot (left aligned / active) -->
    <rect x="6" y="13.75" width="13" height="4.5" rx="2.25" fill="${accent}" />
    <rect x="21" y="13.75" width="5" height="4.5" rx="2" fill="${subtle}" opacity="0.6" />

    <!-- Lower S curve weaving from center to bottom right -->
    <path d="M12.5 18.25 C 12.5 22.5, 26 21.5, 26 25.5" stroke="${primary}" stroke-width="2.5" stroke-linecap="round" />

    <!-- Row 3: Bottom timetable slot (right aligned / active) -->
    <rect x="13" y="23.5" width="13" height="4.5" rx="2.25" fill="${primary}" />
    <rect x="5" y="23.5" width="6" height="4.5" rx="2" fill="${subtle}" opacity="0.6" />

    <!-- Subtle timeline connector guides (grid columns) -->
    <line x1="5" y1="4" x2="5" y2="28" stroke="${primary}" stroke-width="1.2" stroke-dasharray="2 2" opacity="0.25" />
    <circle cx="24" cy="6.25" r="1.2" fill="#ffffff" />
    <circle cx="8" cy="16" r="1.2" fill="#ffffff" />
    <circle cx="24" cy="25.75" r="1.2" fill="#ffffff" />
  </svg>
  `.trim();
}
