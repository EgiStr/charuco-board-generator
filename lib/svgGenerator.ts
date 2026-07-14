/**
 * True Vector SVG Generator for ChArUco Boards.
 *
 * Produces a pure SVG string with actual <rect> elements for every black
 * square and every marker bit — no embedded PNG data.  The output is fully
 * scalable and suitable for print or further editing.
 */

import { BoardParams } from './utils';
import { getDictionary, getMarkerBits } from './arucoDictionaries';

/** Character used to escape XML entities. */
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Generate a pure SVG string for the given board parameters.
 *
 * The SVG viewBox is sized to the full board extent (checkerboard + margin).
 * All ArUco markers are rendered as individual <rect> elements.
 */
export function generateSvg(params: BoardParams): string {
  const { squaresX, squaresY, squareLength, markerLength, margin, dictionary: dictName } = params;

  // Physical dimensions in mm — the SVG uses mm as its user-unit so that
  // the scale is 1:1 when printed.
  const boardW = squaresX * squareLength + 2 * margin;
  const boardH = squaresY * squareLength + 2 * margin;

  const dict = getDictionary(dictName);
  const markerSize = dict.markerSize;
  const cellSize = markerLength / (markerSize + 2); // mm per marker bit cell

  // ── SVG elements ─────────────────────────────────────────────────────────
  const parts: string[] = [];

  // Root
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${boardW}" height="${boardH}" viewBox="0 0 ${boardW} ${boardH}">`);

  // Background (full board area — pure white)
  parts.push(`  <rect x="0" y="0" width="${boardW}" height="${boardH}" fill="#ffffff"/>`);

  // Checkerboard black squares
  for (let row = 0; row < squaresY; row++) {
    for (let col = 0; col < squaresX; col++) {
      if ((row + col) % 2 === 0) {
        // Black square
        const x = margin + col * squareLength;
        const y = margin + row * squareLength;
        parts.push(`  <rect x="${x}" y="${y}" width="${squareLength}" height="${squareLength}" fill="#000000"/>`);
      }
    }
  }

  // ArUco markers in white squares
  let markerId = 0;
  for (let row = 0; row < squaresY; row++) {
    for (let col = 0; col < squaresX; col++) {
      if ((row + col) % 2 !== 0) {
        // White square → place a marker
        if (markerId < dict.nMarkers && cellSize > 0) {
          const cx = margin + col * squareLength + squareLength / 2;
          const cy = margin + row * squareLength + squareLength / 2;
          const mx = cx - markerLength / 2;
          const my = cy - markerLength / 2;

          const bits = getMarkerBits(dict, markerId);
          const totalCells = markerSize + 2; // includes 1-bit border

          for (let bi = 0; bi < totalCells; bi++) {
            for (let bj = 0; bj < totalCells; bj++) {
              // Border (always black)
              const isBorder = bi === 0 || bi === totalCells - 1 || bj === 0 || bj === totalCells - 1;
              const isBlack = isBorder || bits[bi - 1][bj - 1] === 1;

              if (isBlack) {
                const bx = mx + bj * cellSize;
                const by = my + bi * cellSize;
                // Avoid tiny floating-point gaps by rounding
                const bSize = cellSize;
                parts.push(`  <rect x="${bx}" y="${by}" width="${bSize}" height="${bSize}" fill="#000000"/>`);
              }
            }
          }

          // Marker border (redundant with the outer-tile border but ensures
          // a crisp edge for the whole marker)
          parts.push(`  <rect x="${mx}" y="${my}" width="${markerLength}" height="${markerLength}" fill="none" stroke="#000000" stroke-width="0.2"/>`);
        }
        markerId++;
      }
    }
  }

  // Outer border around the checkerboard
  parts.push(`  <rect x="${margin}" y="${margin}" width="${squaresX * squareLength}" height="${squaresY * squareLength}" fill="none" stroke="#000000" stroke-width="0.5"/>`);

  // Scale bar (along the bottom, inside the margin)
  const scaleBarY = boardH - margin + 2;
  const scaleBarX = margin;
  const scaleBarW = squaresX * squareLength;
  const nTicks = 10;
  const tickSpacing = scaleBarW / nTicks;

  parts.push(`  <line x1="${scaleBarX}" y1="${scaleBarY}" x2="${scaleBarX + scaleBarW}" y2="${scaleBarY}" stroke="#000000" stroke-width="0.3"/>`);

  for (let i = 0; i <= nTicks; i++) {
    const tx = scaleBarX + i * tickSpacing;
    const tickH = i % 5 === 0 ? 3 : 1.5;
    parts.push(`  <line x1="${tx}" y1="${scaleBarY}" x2="${tx}" y2="${scaleBarY + tickH}" stroke="#000000" stroke-width="0.3"/>`);

    if (i % 5 === 0) {
      const label = Math.round((i / nTicks) * (squaresX * squareLength));
      parts.push(`  <text x="${tx}" y="${scaleBarY + 5}" font-family="monospace" font-size="2.5" fill="#000000" text-anchor="middle">${label}mm</text>`);
    }
  }

  // Info text (top-left of the board)
  const infoY = margin - 2;
  const infoLines = [
    `ChArUco Board: ${squaresX} x ${squaresY}`,
    `Squares: ${squareLength}mm | Markers: ${markerLength}mm | Dict: ${dictName}`,
  ];
  infoLines.forEach((line, i) => {
    parts.push(`  <text x="${margin}" y="${infoY - (infoLines.length - 1 - i) * 3.5}" font-family="monospace" font-size="2.8" fill="#000000">${esc(line)}</text>`);
  });

  parts.push('</svg>');
  return parts.join('\n');
}
