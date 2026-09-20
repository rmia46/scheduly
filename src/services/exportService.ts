import { jsPDF } from 'jspdf';
import autoTable, { type RowInput } from 'jspdf-autotable';
import type { Routine } from '../types';
import { DAYS_FULL, DAYS_SHORT, THEMES } from '../types/constants';
import { hexToRgb, getContrastColor, showToast } from './utils';
import { store } from '../store/routineStore';
import { toPng } from 'html-to-image';

export function exportVectorPDF(routine: Routine): void {
  try {
    const routineName = routine.name.trim() || 'Class Routine';
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Clean Minimal Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text(routineName, pageWidth / 2, 42, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('Scheduly • Clean Vector Schedule', pageWidth / 2, 57, { align: 'center' });

    // Table Headers
    const head: RowInput[] = [
      [
        {
          content: 'Time',
          styles: { halign: 'center', fillColor: [248, 250, 252] as [number, number, number], textColor: [71, 85, 105] as [number, number, number], fontStyle: 'bold' },
        },
        ...DAYS_SHORT.map((d, i) => ({
          content: `${d}\n(${DAYS_FULL[i]})`,
          styles: { halign: 'center' as const, fillColor: [248, 250, 252] as [number, number, number], textColor: [71, 85, 105] as [number, number, number], fontStyle: 'bold' as const },
        })),
      ],
    ];

    // Rows
    const rows: RowInput[] = routine.slots.map((slot) => {
      const timeCell = {
        content: slot.label,
        styles: {
          halign: 'center' as const,
          valign: 'middle' as const,
          fontStyle: 'bold' as const,
          fillColor: [248, 250, 252] as [number, number, number],
          textColor: [51, 65, 85] as [number, number, number],
          fontSize: 8.5,
        },
      };

      const dayCells = [];
      for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
        const matches = routine.courses.filter((c) => c.day === dayIdx && c.slotId === slot.id);

        if (matches.length === 0) {
          dayCells.push({
            content: '',
            styles: { fillColor: [255, 255, 255] as [number, number, number] },
          });
        } else {
          const text = matches
            .map((c) => {
              const meta = [c.section, c.room, c.faculty].filter(Boolean).join(' • ');
              return meta ? `${c.name}\n${meta}` : c.name;
            })
            .join('\n---\n');

          const rgb: [number, number, number] = hexToRgb(matches[0].color);
          const textColor: [number, number, number] = getContrastColor(rgb);

          dayCells.push({
            content: text,
            styles: {
              halign: 'center' as const,
              valign: 'middle' as const,
              fillColor: rgb,
              textColor: textColor,
              fontStyle: 'bold' as const,
              fontSize: matches.length > 1 ? 8 : 9,
              cellPadding: 4,
            },
          });
        }
      }

      return [timeCell, ...dayCells];
    });

    if (rows.length === 0) {
      showToast('Add at least one time slot before exporting.');
      return;
    }

    autoTable(doc, {
      head,
      body: rows,
      startY: 72,
      theme: 'grid',
      margin: { left: 24, right: 24, bottom: 28 },
      styles: {
        lineWidth: 0.5,
        lineColor: [226, 232, 240],
        font: 'helvetica',
        minCellHeight: 38,
      },
      headStyles: {
        lineWidth: 0.5,
        lineColor: [203, 213, 225],
        minCellHeight: 28,
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 70 },
      },
      didDrawPage: () => {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text('Exported with Scheduly', pageWidth - 28, pageHeight - 12, { align: 'right' });
      },
    });

    doc.save(`${routineName}.pdf`);
    showToast('Exported crisp vector PDF!');
  } catch (error) {
    console.error('Vector PDF export failed', error);
    showToast('Failed to generate vector PDF');
  }
}

export async function exportPNGImage(elementId: string, filename: string): Promise<void> {
  const el = document.getElementById(elementId);
  if (!el) {
    showToast('Timetable area not found.');
    return;
  }

  showToast('Rendering PNG image...');

  const state = store.getState();
  const theme = THEMES[state.theme];

  // Temporary title overlay: replace input visually during capture
  const inputEl = el.querySelector('#input-routine-name') as HTMLInputElement | null;
  let tempTitleEl: HTMLElement | null = null;
  if (inputEl) {
    tempTitleEl = document.createElement('h2');
    tempTitleEl.textContent = inputEl.value.trim() || inputEl.placeholder || filename || 'Class Routine';
    tempTitleEl.className = 'text-xl sm:text-2xl font-extrabold text-slate-900 text-center py-0.5 tracking-tight';
    inputEl.style.display = 'none';
    inputEl.parentNode?.insertBefore(tempTitleEl, inputEl);
  }

  try {
    const dataUrl = await toPng(el, {
      pixelRatio: 2,
      backgroundColor: theme.cardBg || '#ffffff',
      cacheBust: true,
      filter: (node) => {
        // Filter out delete buttons and the hidden input
        if (node instanceof HTMLElement) {
          if (node.hasAttribute('data-quick-delete') || node.id === 'input-routine-name') {
            return false;
          }
        }
        return true;
      },
    });

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${(filename || 'routine').trim()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('PNG image downloaded!');
  } catch (err) {
    console.error('PNG export failed', err);
    showToast('Failed to export PNG');
  } finally {
    // Restore input
    if (inputEl) {
      inputEl.style.display = '';
      tempTitleEl?.remove();
    }
  }
}

export interface ICSExportOptions {
  startDate: string; // YYYY-MM-DD
  monthsDuration: number; // 1 to 12
}

/**
 * Parses time strings such as "08:00", "8:00", "8:00 AM", "1:30 PM", "13:30"
 * Returns [hours, minutes] in 24-hour format.
 */
function parseTimeComponents(timeStr: string): [number, number] | null {
  const clean = timeStr.trim().toUpperCase();
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');
  const numeric = clean.replace(/[^\d:]/g, '');
  const parts = numeric.split(':').map((p) => parseInt(p, 10));

  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;

  let [hours, minutes] = parts;
  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return [hours, minutes];
}

/**
 * Formats a Date object as an iCalendar UTC timestamp: YYYYMMDDTHHMMSSZ
 */
function formatICSDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}


/**
 * Exports routine schedule to an iCalendar (.ics) file with recurring weekly events (RRULE).
 */
export function exportICSCalendar(routine: Routine, options: ICSExportOptions): void {
  const courses = routine.courses;
  if (courses.length === 0) {
    showToast('No courses in this routine to export.');
    return;
  }

  const slotMap = new Map<string, string>();
  routine.slots.forEach((s) => slotMap.set(s.id, s.label));

  const [startYear, startMonth, startDay] = options.startDate.split('-').map(Number);
  const userStartDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0);

  // Calculate until date based on selected duration in months
  const untilDate = new Date(userStartDate);
  untilDate.setMonth(untilDate.getMonth() + options.monthsDuration);
  // Set untilDate to end of that day in UTC
  const untilTimestamp = formatICSDateTime(new Date(Date.UTC(untilDate.getFullYear(), untilDate.getMonth(), untilDate.getDate(), 23, 59, 59)));

  const nowTimestamp = formatICSDateTime(new Date());
  const icsDays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Scheduly//Class Routine Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${routine.name.trim() || 'Class Routine'}`,
    'X-WR-TIMEZONE:UTC',
  ];

  let eventCount = 0;

  for (const course of courses) {
    const slotLabel = course.slotId ? slotMap.get(course.slotId) : null;
    if (!slotLabel) continue;

    // slotLabel is typically "08:00-09:30" or "8:00 - 9:30"
    const slotParts = slotLabel.split('-').map((s) => s.trim());
    if (slotParts.length !== 2) continue;

    const startParsed = parseTimeComponents(slotParts[0]);
    const endParsed = parseTimeComponents(slotParts[1]);
    if (!startParsed || !endParsed) continue;

    // Find the first date matching course.day (0=Sun, 1=Mon, ..., 6=Sat) on or after userStartDate
    const courseDayOfWeek = course.day; // 0..6
    const firstEventDate = new Date(userStartDate);
    const dayDifference = (courseDayOfWeek - firstEventDate.getDay() + 7) % 7;
    firstEventDate.setDate(firstEventDate.getDate() + dayDifference);

    const eventStartDate = new Date(
      firstEventDate.getFullYear(),
      firstEventDate.getMonth(),
      firstEventDate.getDate(),
      startParsed[0],
      startParsed[1],
      0
    );

    const eventEndDate = new Date(
      firstEventDate.getFullYear(),
      firstEventDate.getMonth(),
      firstEventDate.getDate(),
      endParsed[0],
      endParsed[1],
      0
    );

    const dtStartStr = formatICSDateTime(eventStartDate);
    const dtEndStr = formatICSDateTime(eventEndDate);

    const dayCode = icsDays[course.day];
    const uid = `scheduly-${course.id}-${firstEventDate.getTime()}@scheduly.app`;

    const summary = course.section ? `${course.name} (${course.section})` : course.name;
    const descriptionParts = [
      course.section ? `Section: ${course.section}` : '',
      course.room ? `Room: ${course.room}` : '',
      course.faculty ? `Faculty: ${course.faculty}` : '',
      `Routine: ${routine.name}`,
    ].filter(Boolean);

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${nowTimestamp}`);
    lines.push(`DTSTART:${dtStartStr}`);
    lines.push(`DTEND:${dtEndStr}`);
    lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${dayCode};UNTIL=${untilTimestamp}`);
    lines.push(`SUMMARY:${summary.replace(/,/g, '\\,')}`);
    if (course.room) {
      lines.push(`LOCATION:${course.room.replace(/,/g, '\\,')}`);
    }
    if (descriptionParts.length > 0) {
      lines.push(`DESCRIPTION:${descriptionParts.join(' | ').replace(/,/g, '\\,')}`);
    }
    lines.push('STATUS:CONFIRMED');
    lines.push('TRANSP:OPAQUE');
    lines.push('END:VEVENT');

    eventCount++;
  }

  if (eventCount === 0) {
    showToast('Could not parse time slots for calendar export.');
    return;
  }

  lines.push('END:VCALENDAR');

  const icsBlob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(icsBlob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `${(routine.name || 'routine').trim().replace(/\s+/g, '_')}_calendar.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);

  showToast(`Exported ${eventCount} recurring classes to .ics calendar!`);
}

