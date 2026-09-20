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
