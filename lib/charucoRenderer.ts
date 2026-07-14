/**
 * ChArUco Board Renderer
 *
 * Renders a ChArUco board pattern on an HTML Canvas.
 * A ChArUco board consists of:
 * - A chessboard pattern (alternating black/white squares)
 * - ArUco markers placed in the white squares
 * - Optional info text and scale bar
 *
 * All colours are pure #000000 / #ffffff — no grey, no semi-transparency.
 * Grid lines are intentionally omitted because they interfere with calibration.
 * The checkerboard squares themselves ARE the grid.
 */

import { BoardParams, getCornerCount, formatDimension } from './utils';
import { getDictionary, renderMarkerOnCanvas } from './arucoDictionaries';
import { calcScale } from './accuracy';

export interface RenderOptions {
  /** Total width of the canvas in pixels */
  canvasWidth: number;
  /** Total height of the canvas in pixels */
  canvasHeight: number;
  /** Background colour (should always be #ffffff for print) */
  backgroundColor?: string;
  /** Show info overlay (default: true) */
  showInfo?: boolean;
  /** Show scale bar below the board (default: true) */
  showScale?: boolean;
  /** DPI for scaling (default: 72 for screen, 300 for print) */
  dpi?: number;
  /**
   * Pure board mode: NO info, NO scale, pure B&W everywhere.
   * Overrides showInfo/showScale/backgroundColor when true.
   */
  pureBoard?: boolean;
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
  /** Millimetres per pixel (accuracy info) */
  mmPerPx: number;
  /** Pixels per millimetre */
  pxPerMm: number;
}

/**
 * Render a ChArUco board to a canvas.
 *
 * All shapes are drawn with pure #000000 on a #ffffff background.
 * Anti-aliasing is disabled for the checkerboard to keep edges crisp.
 * Grid lines are NOT drawn — they confuse OpenCV calibration.
 */
export function renderCharucoBoard(
  params: BoardParams,
  options: RenderOptions,
): RenderResult {
  const {
    canvasWidth,
    canvasHeight,
    backgroundColor: bgColor = '#ffffff',
    showInfo: optShowInfo = true,
    showScale: optShowScale = true,
    dpi = 72,
    pureBoard = false,
  } = options;

  // PureBoard overrides
  const showInfo = pureBoard ? false : optShowInfo;
  const showScale = pureBoard ? false : optShowScale;
  const backgroundColor = pureBoard ? '#ffffff' : bgColor;

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

  // Reserve space for scale bar if shown
  const scaleBarReserve = showScale ? 24 : 0;

  const scaleX = availableW / boardWidthMm;
  const scaleY = (availableH - scaleBarReserve) / boardHeightMm;
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

  // Accuracy scale
  const { mmPerPx, pxPerMm } = calcScale(squareLength, squarePx);

  // ── Clear ──────────────────────────────────────────────────────────────
  // Use pure white for everything
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // ── Margin area (pure white) ───────────────────────────────────────────
  // In pureBoard mode we skip the margin fill for completely pure B&W
  if (!pureBoard) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(offsetX, offsetY, boardPxW, boardPxH);
  }

  // ── Checkerboard ───────────────────────────────────────────────────────
  // Disable anti-aliasing for crisp black/white edges
  ctx.imageSmoothingEnabled = false;

  // White board area
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(
    offsetX + marginPx,
    offsetY + marginPx,
    squaresX * squarePx,
    squaresY * squarePx,
  );

  // Draw black squares
  for (let row = 0; row < squaresY; row++) {
    for (let col = 0; col < squaresX; col++) {
      const isBlack = (row + col) % 2 === 0;
      if (isBlack) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(
          offsetX + marginPx + col * squarePx,
          offsetY + marginPx + row * squarePx,
          squarePx,
          squarePx,
        );
      }
    }
  }

  // ── ArUco markers ──────────────────────────────────────────────────────
  ctx.imageSmoothingEnabled = false;
  let markerId = 0;

  for (let row = 0; row < squaresY; row++) {
    for (let col = 0; col < squaresX; col++) {
      const isBlack = (row + col) % 2 === 0;
      if (!isBlack) {
        // Place marker in the centre of this white square
        const cx = offsetX + marginPx + col * squarePx + squarePx / 2;
        const cy = offsetY + marginPx + row * squarePx + squarePx / 2;
        const mx = cx - markerPx / 2;
        const my = cy - markerPx / 2;

        if (markerId < dict.nMarkers && cellSize > 0) {
          renderMarkerOnCanvas(ctx, dict, markerId, mx, my, cellSize);

          // Marker border — pure black, slightly thicker
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.strokeRect(mx, my, markerPx, markerPx);
        }

        markerId++;
      }
    }
  }

  // ── Outer border around the checkerboard ───────────────────────────────
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeRect(
    offsetX + marginPx,
    offsetY + marginPx,
    squaresX * squarePx,
    squaresY * squarePx,
  );

  // ── Scale bar ──────────────────────────────────────────────────────────
  // Intentionally omitted: grid lines were here. They are NOT drawn because
  // they interfere with OpenCV ChArUco detection.
  // The checkerboard squares ARE the grid.

  if (showScale) {
    const scaleBarY = offsetY + boardPxH + 6;
    const scaleBarX = offsetX + marginPx;
    const scaleBarW = squaresX * squarePx;
    const nTicks = 10;
    const tickSpacing = scaleBarW / nTicks;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(scaleBarX, scaleBarY);
    ctx.lineTo(scaleBarX + scaleBarW, scaleBarY);
    ctx.stroke();

    for (let i = 0; i <= nTicks; i++) {
      const tx = scaleBarX + i * tickSpacing;
      const tickH = i % 5 === 0 ? 6 : 3;
      ctx.beginPath();
      ctx.moveTo(tx, scaleBarY);
      ctx.lineTo(tx, scaleBarY + tickH);
      ctx.stroke();

      if (i % 5 === 0) {
        const label = Math.round((i / nTicks) * (squaresX * squareLength));
        ctx.font = '10px monospace';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.fillText(`${label}mm`, tx, scaleBarY + tickH + 10);
      }
    }

    // Total length label at the far right
    ctx.font = '9px monospace';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'right';
    ctx.fillText(
      `${squaresX * squareLength}mm`,
      scaleBarX + scaleBarW,
      scaleBarY + 6 + 10,
    );
  }

  // ── Info text ──────────────────────────────────────────────────────────
  if (showInfo) {
    const fontSize = Math.max(10, Math.min(14, Math.floor(canvasWidth / 60)));
    ctx.font = `${fontSize}px monospace`;
    ctx.fillStyle = '#000000'; // Pure black, was #333333

    // Add the scale reference note
    const scaleNote = `Scale: 1px = ${mmPerPx.toFixed(4)}mm | Squares: ${squareLength}mm | ${dpi} DPI`;

    const infoLines = [
      `ChArUco Board: ${squaresX} × ${squaresY}`,
      `Squares: ${formatDimension(squareLength, params.unit)} | Markers: ${formatDimension(markerLength, params.unit)}`,
      `Dictionary: ${dictName}`,
      `Corners: ${getCornerCount(params)} (${squaresX - 1} × ${squaresY - 1})`,
      `Board: ${formatDimension(boardWidthMm, params.unit)} × ${formatDimension(boardHeightMm, params.unit)}`,
      scaleNote,
      `Generated: ${new Date().toLocaleDateString()}`,
    ];

    const lineHeight = fontSize + 4;
    const infoY = Math.max(10, offsetY - 8);
    ctx.textAlign = 'left';
    for (let i = 0; i < infoLines.length; i++) {
      ctx.fillText(infoLines[i], offsetX, infoY + (i - infoLines.length) * lineHeight);
    }
  }

  return {
    canvas,
    boardWidthMm,
    boardHeightMm,
    scale,
    mmPerPx,
    pxPerMm,
  };
}

/**
 * Render a ChArUco board using PURE black-and-white only.
 *
 * This is identical to `renderCharucoBoard` but explicitly guarantees that
 * NO colour other than #000000 (black) or #ffffff (white) is used anywhere
 * on the canvas.  No grey margin, no transparent lines, no coloured text.
 *
 * Use this when the board must be strictly binary for print or OCR.
 */
export function renderPureBW(
  params: BoardParams,
  options: RenderOptions,
): RenderResult {
  return renderCharucoBoard(params, {
    ...options,
    pureBoard: true,
    backgroundColor: '#ffffff',
  });
}

/**
 * Render to an offscreen canvas at a specific DPI for print.
 */
export function renderCharucoBoardForPrint(
  params: BoardParams,
  dpi: number = 300,
): HTMLCanvasElement {
  const { boardWidthMm, boardHeightMm } = getBoardPixelSize(params, dpi);
  return renderCharucoBoard(params, {
    canvasWidth: Math.ceil(boardWidthMm),
    canvasHeight: Math.ceil(boardHeightMm),
    dpi,
    backgroundColor: '#ffffff',
    showInfo: true,
    showScale: true,
  }).canvas;
}

function getBoardPixelSize(
  params: BoardParams,
  dpi: number,
): { boardWidthMm: number; boardHeightMm: number } {
  const { squaresX, squaresY, squareLength, margin } = params;
  const boardWidthMm = squaresX * squareLength + 2 * margin;
  const boardHeightMm = squaresY * squareLength + 2 * margin;
  const pxPerMm = dpi / 25.4;
  return {
    boardWidthMm: boardWidthMm * pxPerMm,
    boardHeightMm: boardHeightMm * pxPerMm,
  };
}
