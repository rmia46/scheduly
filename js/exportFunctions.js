async function captureTimetable(backgroundColor) {
  // Clone container (off-screen)
  const cloneContainer = document.createElement('div');
  cloneContainer.style.position = 'absolute';
  cloneContainer.style.left = '-9999px';
  cloneContainer.style.top = '0';
  document.body.appendChild(cloneContainer);

  const originalNode = document.querySelector('.timetable-card');
  const clonedNode = originalNode.cloneNode(true);

  // Replace input with text for clean capture
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

  // Reset transforms
  const timetableEl = clonedNode.querySelector('.timetable');
  if (timetableEl) {
    timetableEl.style.transform = 'none';
    timetableEl.style.overflow = 'visible';
  }
  clonedNode.style.boxShadow = 'none';

  cloneContainer.appendChild(clonedNode);

  // Key: use real pixel ratio
  const scale = window.devicePixelRatio || 2;
  const { offsetWidth, offsetHeight } = clonedNode;

  const canvas = await html2canvas(clonedNode, {
    scale: 5, // match device pixels
    useCORS: true,
    backgroundColor,
    logging: false,
    width: offsetWidth,
    height: offsetHeight,
  });

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