/**
 * Accuracy Verification for ChArUco Board Printing.
 *
 * Provides utilities to calculate pixel/mm scale ratios and determine
 * whether a given board configuration fits on standard paper sizes.
 */

export interface ScaleResult {
  /** Millimetres per pixel */
  mmPerPx: number;
  /** Pixels per millimetre */
  pxPerMm: number;
}

export interface BoardMetrics {
  /** Human-readable paper name (e.g. "A4", "A3") */
  paperSize: string;
  /** Board width including margins in mm */
  boardWidthMm: number;
  /** Board height including margins in mm */
  boardHeightMm: number;
  /** Whether the board fits on A4 (210×297 mm) */
  fitsA4: boolean;
  /** Whether the board fits on A3 (297×420 mm) */
  fitsA3: boolean;
  /** Scale ratio to fit the board on A4 (1 = exact fit, <1 = board larger) */
  scaleRatio: number;
}

/**
 * Calculate the pixel/mm scale relationship from a known square size.
 *
 * @param squareLengthMm - Length of one checkerboard square in millimetres.
 * @param pixelsPerSquare - Number of pixels used to render that square.
 */
export function calcScale(
  squareLengthMm: number,
  pixelsPerSquare: number,
): ScaleResult {
  const mmPerPx = squareLengthMm / pixelsPerSquare;
  const pxPerMm = pixelsPerSquare / squareLengthMm;
  return { mmPerPx, pxPerMm };
}

/**
 * Obtain board metrics for a given configuration, checking fit on standard
 * paper sizes.  Margins are included in the outer board dimensions.
 *
 * @param squaresX   - Number of checkerboard squares horizontally.
 * @param squaresY   - Number of checkerboard squares vertically.
 * @param squareLengthMm - Side length of one square in mm.
 * @param marginMm   - Margin width around the checkerboard in mm.
 */
export function getA4BoardMetrics(
  squaresX: number,
  squaresY: number,
  squareLengthMm: number,
  marginMm: number,
): BoardMetrics {
  const boardWidth = squaresX * squareLengthMm + 2 * marginMm;
  const boardHeight = squaresY * squareLengthMm + 2 * marginMm;

  // ISO standard sizes in mm (portrait orientation)
  const A4 = { w: 210, h: 297 };
  const A3 = { w: 297, h: 420 };

  return {
    paperSize: 'A4',
    boardWidthMm: boardWidth,
    boardHeightMm: boardHeight,
    fitsA4: boardWidth <= A4.w && boardHeight <= A4.h,
    fitsA3: boardWidth <= A3.w && boardHeight <= A3.h,
    scaleRatio: Math.min(A4.w / boardWidth, A4.h / boardHeight),
  };
}
