// ─── Image ───────────────────────────────────────────
// Exports a DOM element as a PNG file.
// · Uses html2canvas (loaded on demand)
export async function exportAsImage(element, filename = 'export') {
    const { default: html2canvas } = await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.esm.js');
    const canvas = await html2canvas(element);
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// ─── PDF ─────────────────────────────────────────────
// Exports a DOM element as a PDF file.
// · Uses html2canvas + jsPDF (both loaded on demand)
export async function exportAsPDF(element, filename = 'export') {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.esm.js'),
        import('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.esm.min.js'),
    ]);

    const canvas  = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf     = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${filename}.pdf`);
}

// ─── Excel ───────────────────────────────────────────
// TODO: Export an HTML table element as an .xlsx file.
// · Use SheetJS (https://sheetjs.com) — XLSX.utils.table_to_book(element)
