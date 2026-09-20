async function captureTimetable(backgroundColor) {
    // 1. Create a container for the clone
    const cloneContainer = document.createElement('div');
    cloneContainer.style.position = 'absolute';
    cloneContainer.style.left = '-9999px'; // Move it off-screen
    cloneContainer.style.top = '0';
    document.body.appendChild(cloneContainer);

    // 2. Clone the timetable card
    const originalNode = document.querySelector('.timetable-card');
    const clonedNode = originalNode.cloneNode(true);

    // Replace input with a div for capture
    const input = clonedNode.querySelector('#routine-name');
    if (input) {
        const routineName = input.value || input.placeholder;
        const textDiv = document.createElement('div');
        textDiv.textContent = routineName;
        textDiv.className = input.className;
        textDiv.style.height = input.offsetHeight + 'px';
        textDiv.style.lineHeight = input.offsetHeight + 'px';
        textDiv.style.textAlign = 'center';
        textDiv.style.color = '#333';
        input.parentNode.replaceChild(textDiv, input);
    }

    // Reset styles for clean capture
    const timetableEl = clonedNode.querySelector('.timetable');
    if (timetableEl) {
        timetableEl.style.transform = 'scale(1)'; // Reset zoom
        timetableEl.style.overflow = 'visible';
    }
    clonedNode.style.boxShadow = 'none';

    // Append the clone
    cloneContainer.appendChild(clonedNode);

    // 3. Measure natural size (don’t force width/height)
    const { offsetWidth, offsetHeight } = clonedNode;

    // 4. Capture with html2canvas at higher resolution
    const canvas = await html2canvas(clonedNode, {
        scale: 4, // Higher resolution export
        useCORS: true,
        backgroundColor: backgroundColor,
        logging: false,
        width: offsetWidth,
        height: offsetHeight,
    });

    // 5. Clean up
    document.body.removeChild(cloneContainer);

    return canvas;
}


async function exportPNG() {
    try {
        const canvas = await captureTimetable(null); // Transparent background for PNG
        const dataUrl = canvas.toDataURL('image/png');

        const a = document.createElement('a');
        a.href = dataUrl;
        const activeRoutine = getActiveRoutine();
        const routineName = activeRoutine ? activeRoutine.name.trim() : 'routine';
        a.download = `${routineName}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast('Exported as PNG!');
    } catch (error) {
        console.error('Error exporting PNG:', error);
        toast('Failed to export PNG.');
    }
}

// Helper to convert hex color to RGB array
function hexToRgb(hex) {
    if (!hex) return [124, 77, 255];
    let cleaned = hex.replace('#', '').trim();
    if (cleaned.length === 3) {
        cleaned = cleaned.split('').map(c => c + c).join('');
    }
    const num = parseInt(cleaned, 16);
    if (isNaN(num)) return [124, 77, 255];
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

// Helper to determine readable text color based on luminance
function getContrastColor(rgb) {
    const yiq = ((rgb[0] * 299) + (rgb[1] * 587) + (rgb[2] * 114)) / 1000;
    return yiq >= 150 ? [40, 40, 40] : [255, 255, 255];
}

async function exportPDF() {
    try {
        const activeRoutine = getActiveRoutine();
        if (!activeRoutine) {
            toast('No active routine to export.');
            return;
        }

        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            throw new Error('jsPDF library not loaded');
        }

        const routineName = (activeRoutine.name || 'Class Routine').trim();
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        // Create Landscape A4 document
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'pt',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Header Title & Subtitle
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(33, 37, 41);
        doc.text(routineName, pageWidth / 2, 38, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(108, 117, 125);
        doc.text('Scheduly • Class Routine', pageWidth / 2, 53, { align: 'center' });

        // Prepare table headers
        const head = [
            [
                { content: 'Time / Day', styles: { halign: 'center', fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold' } },
                ...days.map((d, i) => ({
                    content: `${d}\n(${dayNamesFull[i]})`,
                    styles: { halign: 'center', fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold' }
                }))
            ]
        ];

        // Prepare table rows from slots and courses
        const rows = (activeRoutine.slots || []).map(slot => {
            const timeCol = {
                content: slot.label,
                styles: {
                    halign: 'center',
                    valign: 'middle',
                    fontStyle: 'bold',
                    fillColor: [248, 250, 252],
                    textColor: [51, 65, 85],
                    fontSize: 9
                }
            };

            const dayCols = [];
            for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                const coursesInCell = (activeRoutine.courses || []).filter(c => c.day === dayIndex && c.slotId === slot.id);

                if (coursesInCell.length === 0) {
                    dayCols.push({
                        content: '',
                        styles: { fillColor: [255, 255, 255] }
                    });
                } else {
                    const textLines = coursesInCell.map(c => {
                        const extra = [c.section, c.room].filter(Boolean).join(' · ');
                        return extra ? `${c.name}\n${extra}` : c.name;
                    }).join('\n---\n');

                    // Primary color of the cell from course
                    const rgb = hexToRgb(coursesInCell[0].color);
                    const textColor = getContrastColor(rgb);

                    dayCols.push({
                        content: textLines,
                        styles: {
                            halign: 'center',
                            valign: 'middle',
                            fillColor: rgb,
                            textColor: textColor,
                            fontStyle: 'bold',
                            fontSize: coursesInCell.length > 1 ? 8 : 9,
                            cellPadding: 4
                        }
                    });
                }
            }

            return [timeCol, ...dayCols];
        });

        if (rows.length === 0) {
            toast('No slots found in this routine. Add slots first.');
            return;
        }

        // Generate vector table via jspdf-autotable
        doc.autoTable({
            head: head,
            body: rows,
            startY: 65,
            theme: 'grid',
            margin: { left: 24, right: 24, bottom: 28 },
            styles: {
                lineWidth: 0.5,
                lineColor: [226, 232, 240],
                font: 'helvetica',
                minCellHeight: 38
            },
            headStyles: {
                lineWidth: 0.5,
                lineColor: [203, 213, 225],
                minCellHeight: 28,
                fontSize: 9
            },
            columnStyles: {
                0: { cellWidth: 70 }
            },
            didDrawPage: function () {
                // Watermark / footer text
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(160, 174, 192);
                doc.text('Created with Scheduly', pageWidth - 28, pageHeight - 12, { align: 'right' });
            }
        });

        doc.save(`${routineName || 'routine'}.pdf`);
        toast('Vector PDF exported!');
    } catch (error) {
        console.error('Error exporting vector PDF:', error);
        toast('Failed to export PDF.');
    }
}

function printRoutine() {
    window.print();
}