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
export async function generatePdf(params: BoardParams, pureBoard?: boolean): Promise<Blob> {
  const pageDims = getPageDimensions(params);
  const PRINT_DPI = 300;
  const pxPerMm = PRINT_DPI / 25.4;

  // Calculate board placement on page
  const { squaresX, squaresY, squareLength, margin } = params;

  const boardWidthMm = squaresX * squareLength + 2 * margin;
  const boardHeightMm = squaresY * squareLength + 2 * margin;

  // Check if board fits on the page at 1:1; scale down only if necessary
  const scale =
    boardWidthMm <= pageDims.width && boardHeightMm <= pageDims.height
      ? 1.0
      : Math.min(pageDims.width / boardWidthMm, pageDims.height / boardHeightMm);
  const displayBoardWidth = boardWidthMm * scale;
  const displayBoardHeight = boardHeightMm * scale;

  // Centre the board on the page
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
    showInfo: !pureBoard,
    showScale: !pureBoard,
    pureBoard,
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
export function downloadPdf(params: BoardParams, pureBoard?: boolean): void {
  generatePdf(params, pureBoard).then((blob) => {
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
export function downloadPng(params: BoardParams, pureBoard?: boolean): void {
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
    showInfo: !pureBoard,
    showScale: !pureBoard,
    pureBoard,
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
export function downloadSvg(params: BoardParams, pureBoard?: boolean): void {
  const svgContent = generateSvg(params, pureBoard);

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
 * Uses the same PDF as downloadPdf() to guarantee correct physical size.
 * Opens the PDF in a new tab where the user presses Ctrl+P (or Cmd+P).
 * Falls back to downloading the PDF if the pop-up is blocked.
 */
export function printBoard(params: BoardParams, pureBoard?: boolean): void {
  generatePdf(params, pureBoard).then((blob) => {
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (!w) {
      // Pop-up blocked — fallback: trigger download and instruct user
      const a = document.createElement('a');
      a.href = url;
      a.download = 'charuco-board-print.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      alert(
        'Print popup was blocked. The PDF has been downloaded — ' +
          'please open it and print from your PDF viewer.',
      );
    }
    // Keep the blob URL alive long enough for the print tab to load
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  });
}
