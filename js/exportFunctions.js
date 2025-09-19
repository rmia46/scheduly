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

async function exportPDF() {
    try {
        const canvas = await captureTimetable('#ffffff'); // White background for PDF
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;

        // Use the canvas dimensions for the PDF
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        const activeRoutine = getActiveRoutine();
        const routineName = activeRoutine ? activeRoutine.name.trim() : 'routine';
        pdf.save(`${routineName}.pdf`);
        toast('Exported as PDF!');
    } catch (error) {
        console.error('Error exporting PDF:', error);
        toast('Failed to export PDF.');
    }
}