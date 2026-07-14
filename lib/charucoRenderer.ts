/**
 * ChArUco Board Renderer
 * 
 * Renders a ChArUco board pattern on an HTML Canvas.
 * A ChArUco board consists of:
 * - A chessboard pattern (alternating black/white squares)
 * - ArUco markers placed in the white squares
 * - Optional info text
 */

import { BoardParams, getCornerCount, formatDimension } from './utils';
import { getDictionary, renderMarkerOnCanvas } from './arucoDictionaries';

export interface RenderOptions {
  /** Total width of the canvas in pixels */
  canvasWidth: number;
  /** Total height of the canvas in pixels */
  canvasHeight: number;
  /** Background color */
  backgroundColor?: string;
  /** Show info overlay */
  showInfo?: boolean;
  /** Show grid dimensions */
  showGrid?: boolean;
  /** DPI for scaling (default: 72 for screen, 300 for print) */
  dpi?: number;
}

export interface RenderResult {
  /** The canvas element */
  canvas: HTMLCanvasElement;
  /** Board width in mm */
  boardWidthMm: number;
  /** Board height in mm */
  boardHeightMm: number;
  /** Scale factor (pixels per mm) */
  scale: number;
}

/**
 * Render a ChArUco board to a canvas.
 */
export function renderCharucoBoard(
  params: BoardParams,
  options: RenderOptions
): RenderResult {
  const {
    canvasWidth,
    canvasHeight,
    backgroundColor = '#ffffff',
    showInfo = true,
    dpi = 72,
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d')!;

  const { squaresX, squaresY, squareLength, markerLength, margin, dictionary: dictName } = params;

  // Physical board dimensions in mm
  const boardWidthMm = squaresX * squareLength + 2 * margin;
  const boardHeightMm = squaresY * squareLength + 2 * margin;

  // Scale: fit board into canvas with padding
  const padding = 20; // pixels
  const availableW = canvasWidth - 2 * padding;
  const availableH = canvasHeight - 2 * padding;
  const scaleX = availableW / boardWidthMm;
  const scaleY = availableH / boardHeightMm;
  const scale = Math.min(scaleX, scaleY);

  // Board pixel dimensions
  const boardPxW = boardWidthMm * scale;
  const boardPxH = boardHeightMm * scale;
  const offsetX = (canvasWidth - boardPxW) / 2;
  const offsetY = (canvasHeight - boardPxH) / 2;

  const squarePx = squareLength * scale;
  const markerPx = markerLength * scale;
  const marginPx = margin * scale;

  const dict = getDictionary(dictName);
  const cellSize = Math.max(1, Math.floor(markerPx / (dict.markerSize + 2)));

  // Clear
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw margin area (light gray)
  ctx.fillStyle = '#e0e0e0';
  ctx.fillRect(offsetX, offsetY, boardPxW, boardPxH);
  // White board area
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(
    offsetX + marginPx,
    offsetY + marginPx,
    squaresX * squarePx,
    squaresY * squarePx
  );

  // Draw checkerboard
  for (let row = 0; row < squaresY; row++) {
    for (let col = 0; col < squaresX; col++) {
      const isBlack = (row + col) % 2 === 0;
      if (isBlack) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(
          offsetX + marginPx + col * squarePx,
          offsetY + marginPx + row * squarePx,
          squarePx,
          squarePx
        );
      }
    }
  }

  // Draw markers in white squares
  const markerSizePx = markerPx;
  let markerId = 0;

  for (let row = 0; row < squaresY; row++) {
    for (let col = 0; col < squaresX; col++) {
      const isBlack = (row + col) % 2 === 0;
      if (!isBlack) {
        // Place marker in the center of this white square
        const cx = offsetX + marginPx + col * squarePx + squarePx / 2;
        const cy = offsetY + marginPx + row * squarePx + squarePx / 2;
        const mx = cx - markerSizePx / 2;
        const my = cy - markerSizePx / 2;

        if (markerId < dict.nMarkers && cellSize > 0) {
          renderMarkerOnCanvas(ctx, dict, markerId, mx, my, cellSize);

          // Draw marker border
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1;
          ctx.strokeRect(mx, my, markerSizePx, markerSizePx);
        }

        markerId++;
      }
    }
  }

  // Draw thin grid lines
  ctx.strokeStyle = '#00000033'; // Transparent black
  ctx.lineWidth = 0.5;
  for (let row = 0; row <= squaresY; row++) {
    ctx.beginPath();
    ctx.moveTo(offsetX + marginPx, offsetY + marginPx + row * squarePx);
    ctx.lineTo(offsetX + marginPx + squaresX * squarePx, offsetY + marginPx + row * squarePx);
    ctx.stroke();
  }
  for (let col = 0; col <= squaresX; col++) {
    ctx.beginPath();
    ctx.moveTo(offsetX + marginPx + col * squarePx, offsetY + marginPx);
    ctx.lineTo(offsetX + marginPx + col * squarePx, offsetY + marginPx + squaresY * squarePx);
    ctx.stroke();
  }

  // Draw outer border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeRect(offsetX + marginPx, offsetY + marginPx, squaresX * squarePx, squaresY * squarePx);

  // Info text
  if (showInfo) {
    const fontSize = Math.max(10, Math.min(14, Math.floor(canvasWidth / 60)));
    ctx.font = `${fontSize}px monospace`;
    ctx.fillStyle = '#333333';

    const infoLines = [
      `ChArUco Board: ${squaresX} × ${squaresY}`,
      `Squares: ${formatDimension(squareLength, params.unit)} | Markers: ${formatDimension(markerLength, params.unit)}`,
      `Dictionary: ${dictName}`,
      `Corners: ${getCornerCount(params)} (${squaresX - 1} × ${squaresY - 1})`,
      `Board: ${formatDimension(boardWidthMm, params.unit)} × ${formatDimension(boardHeightMm, params.unit)}`,
      `Generated: ${new Date().toLocaleDateString()}`,
    ];

    const lineHeight = fontSize + 4;
    const infoY = Math.max(10, offsetY - 8);
    for (let i = 0; i < infoLines.length; i++) {
      ctx.fillText(infoLines[i], offsetX, infoY + (i - infoLines.length) * lineHeight);
    }
  }

  return {
    canvas,
    boardWidthMm,
    boardHeightMm,
    scale,
  };
}

/**
 * Render to an offscreen canvas at a specific DPI for print.
 */
export function renderCharucoBoardForPrint(
  params: BoardParams,
  dpi: number = 300
): HTMLCanvasElement {
  const { boardWidthMm, boardHeightMm } = getBoardPixelSize(params, dpi);
  return renderCharucoBoard(params, {
    canvasWidth: Math.ceil(boardWidthMm),
    canvasHeight: Math.ceil(boardHeightMm),
    dpi,
    backgroundColor: '#ffffff',
    showInfo: true,
  }).canvas;
}

function getBoardPixelSize(params: BoardParams, dpi: number): { boardWidthMm: number; boardHeightMm: number } {
  const { squaresX, squaresY, squareLength, margin } = params;
  const boardWidthMm = squaresX * squareLength + 2 * margin;
  const boardHeightMm = squaresY * squareLength + 2 * margin;
  const pxPerMm = dpi / 25.4;
  return {
    boardWidthMm: boardWidthMm * pxPerMm,
    boardHeightMm: boardHeightMm * pxPerMm,
  };
}
