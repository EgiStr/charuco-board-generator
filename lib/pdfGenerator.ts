/**
 * PDF Generator for ChArUco Board
 *
 * Uses jsPDF to generate a print-ready PDF at 300 DPI.
 * SVG export now uses a true vector generator instead of an embedded PNG.
 */

import { jsPDF } from 'jspdf';
import { BoardParams, PaperSize, getPaperSize, PaperDimensions } from './utils';
import { renderCharucoBoard } from './charucoRenderer';
import { generateSvg } from './svgGenerator';

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
  const { squaresX, squaresY, squareLength, margin } = params;

  const boardWidthMm = squaresX * squareLength + 2 * margin;
  const boardHeightMm = squaresY * squareLength + 2 * margin;

  // Centre the board on the page
  const maxBoardWidth = pageDims.width - margin * 2;
  const maxBoardHeight = pageDims.height - margin * 2;
  const scale = Math.min(
    maxBoardWidth / boardWidthMm,
    maxBoardHeight / boardHeightMm,
    1,
  );
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
    showScale: true,
  });

  // Create PDF
  const pdf = new jsPDF({
    orientation: params.orientation === 'landscape' ? 'landscape' : 'portrait',
    unit: 'mm',
    format: getPdfFormat(params.paperSize, params.orientation, params.customWidth, params.customHeight),
  });

  // Add the image
  const imgData = result.canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', offsetX, offsetY, displayBoardWidth, displayBoardHeight, undefined, 'FAST');

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
  customHeight?: number,
): string | [number, number] {
  if (paperSize === 'Custom' && customWidth && customHeight) {
    return [customWidth, customHeight];
  }
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
 * Download a PNG image at 300 DPI.
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
    showScale: true,
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
 * Download an SVG file using the true vector generator.
 *
 * Unlike the old approach (embedding a PNG in an SVG wrapper), this
 * produces actual SVG elements (<rect> for every black square and
 * marker bit) that are fully scalable.
 */
export function downloadSvg(params: BoardParams): void {
  const svgContent = generateSvg(params);

  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dictShort = params.dictionary.replace('DICT_', '');
  a.download = `charuco-${params.squaresX}x${params.squaresY}-${dictShort}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Print via browser print dialog.
 *
 * Opens a new window with the rendered board and triggers the native
 * print dialog. The print page uses pure black/white for best results.
 */
export function printBoard(params: BoardParams): void {
  const result = renderCharucoBoard(params, {
    canvasWidth: 1200,
    canvasHeight: Math.ceil(
      (1200 * (params.squaresY * params.squareLength + 2 * params.margin)) /
        (params.squaresX * params.squareLength + 2 * params.margin),
    ),
    dpi: 72,
    backgroundColor: '#ffffff',
    showInfo: true,
    showScale: true,
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
        body { margin: 0; display: flex; justify-content: center; align-items: center; background: #fff; }
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
