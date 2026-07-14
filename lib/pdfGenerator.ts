/**
 * PDF Generator for ChArUco Board
 * 
 * Uses jsPDF to generate a print-ready PDF at 300 DPI.
 */

import { jsPDF } from 'jspdf';
import { BoardParams, PaperSize, getPaperSize, PaperDimensions } from './utils';
import { renderCharucoBoard } from './charucoRenderer';

/**
 * Paper dimensions in mm for each supported size.
 */
function getPageDimensions(params: BoardParams): PaperDimensions {
  return getPaperSize(params.paperSize, params.orientation, params.customWidth, params.customHeight);
}

/**
 * Generate a PDF blob of the ChArUco board.
 */
export async function generatePdf(params: BoardParams): Promise<Blob> {
  const pageDims = getPageDimensions(params);
  const PRINT_DPI = 300;
  const pxPerMm = PRINT_DPI / 25.4;

  // Calculate board placement on page
  const { squaresX, squaresY, squareLength, margin, dictionary: dictName } = params;

  const boardWidthMm = squaresX * squareLength + 2 * margin;
  const boardHeightMm = squaresY * squareLength + 2 * margin;

  // Center the board on the page
  const maxBoardWidth = pageDims.width - margin * 2;
  const maxBoardHeight = pageDims.height - margin * 2;
  const scale = Math.min(maxBoardWidth / boardWidthMm, maxBoardHeight / boardWidthMm, maxBoardHeight / boardHeightMm, 1);
  const displayBoardWidth = boardWidthMm * scale;
  const displayBoardHeight = boardHeightMm * scale;

  const offsetX = (pageDims.width - displayBoardWidth) / 2;
  const offsetY = (pageDims.height - displayBoardHeight) / 2;

  // Render the board to a canvas at print resolution
  const canvasWidth = Math.ceil(boardWidthMm * pxPerMm);
  const canvasHeight = Math.ceil(boardHeightMm * pxPerMm);

  const result = renderCharucoBoard(params, {
    canvasWidth,
    canvasHeight,
    dpi: PRINT_DPI,
    backgroundColor: '#ffffff',
    showInfo: true,
  });

  // Create PDF
  const pdf = new jsPDF({
    orientation: params.orientation === 'landscape' ? 'landscape' : 'portrait',
    unit: 'mm',
    format: getPdfFormat(params.paperSize, params.orientation, params.customWidth, params.customHeight),
  });

  // Add the image
  const imgData = result.canvas.toDataURL('image/png');
  pdf.addImage(
    imgData,
    'PNG',
    offsetX,
    offsetY,
    displayBoardWidth,
    displayBoardHeight,
    undefined,
    'FAST'
  );

  // Return as blob
  return pdf.output('blob');
}

/**
 * Get the jsPDF page format from paper size.
 */
function getPdfFormat(
  paperSize: PaperSize,
  orientation: 'portrait' | 'landscape',
  customWidth?: number,
  customHeight?: number
): string | [number, number] {
  if (paperSize === 'Custom' && customWidth && customHeight) {
    return [customWidth, customHeight];
  }
  // jsPDF uses standard names for sizes
  return paperSize; // 'a4', 'a3', 'a2', 'a1' are all valid jsPDF formats
}

/**
 * Download a PDF file.
 */
export function downloadPdf(params: BoardParams): void {
  generatePdf(params).then((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dictShort = params.dictionary.replace('DICT_', '');
    a.download = `charuco-${params.squaresX}x${params.squaresY}-${dictShort}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

/**
 * Download a PNG image.
 */
export function downloadPng(params: BoardParams): void {
  const PRINT_DPI = 300;
  const pxPerMm = PRINT_DPI / 25.4;
  const { squaresX, squaresY, squareLength, margin } = params;
  const boardWidthMm = squaresX * squareLength + 2 * margin;
  const boardHeightMm = squaresY * squareLength + 2 * margin;

  const result = renderCharucoBoard(params, {
    canvasWidth: Math.ceil(boardWidthMm * pxPerMm),
    canvasHeight: Math.ceil(boardHeightMm * pxPerMm),
    dpi: PRINT_DPI,
    backgroundColor: '#ffffff',
    showInfo: true,
  });

  const url = result.canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  const dictShort = params.dictionary.replace('DICT_', '');
  a.download = `charuco-${params.squaresX}x${params.squaresY}-${dictShort}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Download an SVG file (simplified - uses canvas to SVG conversion).
 */
export function downloadSvg(params: BoardParams): void {
  // For SVG, render at screen resolution and create an inline SVG
  const result = renderCharucoBoard(params, {
    canvasWidth: 1200,
    canvasHeight: Math.ceil(1200 * (params.squaresY * params.squareLength + 2 * params.margin) /
      (params.squaresX * params.squareLength + 2 * params.margin)),
    dpi: 72,
    backgroundColor: '#ffffff',
    showInfo: true,
  });

  const url = result.canvas.toDataURL('image/png');
  // Create a simple SVG wrapper with embedded PNG for practical purposes
  // (true SVG conversion of the ArUco markers would be extremely complex)
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  width="${result.canvas.width}" height="${result.canvas.height}" viewBox="0 0 ${result.canvas.width} ${result.canvas.height}">
  <image width="${result.canvas.width}" height="${result.canvas.height}" xlink:href="${url}"/>
</svg>`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url2 = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url2;
  const dictShort = params.dictionary.replace('DICT_', '');
  a.download = `charuco-${params.squaresX}x${params.squaresY}-${dictShort}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url2);
}

/**
 * Print via browser print dialog.
 */
export function printBoard(params: BoardParams): void {
  const result = renderCharucoBoard(params, {
    canvasWidth: 1200,
    canvasHeight: Math.ceil(1200 * (params.squaresY * params.squareLength + 2 * params.margin) /
      (params.squaresX * params.squareLength + 2 * params.margin)),
    dpi: 72,
    backgroundColor: '#ffffff',
    showInfo: true,
  });

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>ChArUco Board - Print</title>
      <style>
        @page { margin: 0; }
        body { margin: 0; display: flex; justify-content: center; align-items: center; }
        img { max-width: 100%; max-height: 100vh; }
      </style>
    </head>
    <body>
      <img src="${result.canvas.toDataURL('image/png')}" onload="window.print(); window.close();" />
    </body>
    </html>
  `);
  printWindow.document.close();
}
