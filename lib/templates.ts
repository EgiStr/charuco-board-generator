/**
 * Print-Ready Template Library.
 * Pre-calculated configurations that fit on standard paper sizes at 1:1.
 * All templates are verified for 1:1 accuracy — no scaling needed.
 * Margins are included automatically.
 */

export interface TemplateConfig {
  id: string;
  paperSize: string;       // "A4", "A3", "A2", "A1"
  orientation: 'portrait' | 'landscape';
  squaresX: number;        // columns
  squaresY: number;        // rows
  squareLength: number;    // mm
  markerLength: number;    // auto-calc: Math.round(squareLength * 0.55)
  dictionary: string;      // per-template
  margin: number;          // mm
  boardWidthMm: number;    // calculated
  boardHeightMm: number;   // calculated
  internalCorners: string; // e.g. "8×6"
  category: string;        // "8x6", "A4", "A3", "A2", "A1"
}

/** Helper: choose dictionary based on squareLength for non-8x6 templates. */
function dictForSquare(sq: number, ranges: [number, number, string][]): string {
  for (const [lo, hi, dict] of ranges) {
    if (sq >= lo && sq <= hi) return dict;
  }
  return 'DICT_6X6_250'; // fallback
}

const A4_RANGES: [number, number, string][] = [
  [20, 30, 'DICT_6X6_250'],
  [35, 45, 'DICT_5X5_250'],
  [50, 60, 'DICT_4X4_250'],
];
const A3_RANGES: [number, number, string][] = [
  [25, 40, 'DICT_6X6_250'],
  [45, 60, 'DICT_5X5_250'],
];
const A2_RANGES: [number, number, string][] = [
  [30, 50, 'DICT_6X6_250'],
  [55, 80, 'DICT_5X5_250'],
  [80, 100, 'DICT_4X4_250'],
];
const A1_RANGES: [number, number, string][] = [
  [30, 60, 'DICT_6X6_250'],
  [75, 100, 'DICT_5X5_250'],
];

/** Attach markerLength + dictionary + computed fields to a raw template. */
function enrich(t: {
  id: string;
  paperSize: string;
  orientation: string;
  squaresX: number;
  squaresY: number;
  squareLength: number;
  margin: number;
  category: string;
  internalCorners: string;
}, dict: string): TemplateConfig {
  return {
    ...t,
    markerLength: Math.round(t.squareLength * 0.55),
    dictionary: dict,
    boardWidthMm: t.squaresX * t.squareLength + 2 * t.margin,
    boardHeightMm: t.squaresY * t.squareLength + 2 * t.margin,
    orientation: t.orientation as 'portrait' | 'landscape',
    paperSize: t.paperSize,
  } as TemplateConfig;
}

// ── 8×6 Internal Corners (9×7 squares) — Standard collection ──
// All use DICT_6X6_250
const EIGHT_BY_SIX: TemplateConfig[] = [
  { id: 'a4-25-9x7', paperSize: 'A4', orientation: 'landscape', squaresX: 9, squaresY: 7, squareLength: 25, margin: 10, category: '8x6', internalCorners: '8×6' },
  { id: 'a3-35-9x7', paperSize: 'A3', orientation: 'landscape', squaresX: 9, squaresY: 7, squareLength: 35, margin: 10, category: '8x6', internalCorners: '8×6' },
  { id: 'a2-55-9x7', paperSize: 'A2', orientation: 'landscape', squaresX: 9, squaresY: 7, squareLength: 55, margin: 10, category: '8x6', internalCorners: '8×6' },
  { id: 'a1-75-9x7', paperSize: 'A1', orientation: 'landscape', squaresX: 9, squaresY: 7, squareLength: 75, margin: 10, category: '8x6', internalCorners: '8×6' },
  { id: 'a1-80-9x7', paperSize: 'A1', orientation: 'landscape', squaresX: 9, squaresY: 7, squareLength: 80, margin: 10, category: '8x6', internalCorners: '8×6' },
].map(c => enrich(c, 'DICT_6X6_250'));

// ── A4 Templates (210×297mm) ──
const A4_TEMPLATES: TemplateConfig[] = [
  { id: 'a4-20-13x9', paperSize: 'A4', orientation: 'landscape', squaresX: 14, squaresY: 10, squareLength: 20, margin: 5, category: 'A4', internalCorners: '13×9' },
  { id: 'a4-25-10x7', paperSize: 'A4', orientation: 'landscape', squaresX: 11, squaresY: 8, squareLength: 25, margin: 5, category: 'A4', internalCorners: '10×7' },
].map(c => enrich(c, dictForSquare(c.squareLength, A4_RANGES)));

// ── A3 Templates (297×420mm) ──
const A3_TEMPLATES: TemplateConfig[] = [
  { id: 'a3-25-15x10', paperSize: 'A3', orientation: 'landscape', squaresX: 16, squaresY: 11, squareLength: 25, margin: 5,  category: 'A3', internalCorners: '15×10' },
  { id: 'a3-30-12x8',  paperSize: 'A3', orientation: 'landscape', squaresX: 13, squaresY: 9,  squareLength: 30, margin: 5,  category: 'A3', internalCorners: '12×8' },
  { id: 'a3-35-9x7',   paperSize: 'A3', orientation: 'landscape', squaresX: 9,  squaresY: 7,  squareLength: 35, margin: 10, category: 'A3', internalCorners: '8×6' },
  { id: 'a3-45-7x5',   paperSize: 'A3', orientation: 'landscape', squaresX: 8,  squaresY: 6,  squareLength: 45, margin: 5,  category: 'A3', internalCorners: '7×5' },
  { id: 'a3-50-6x4',   paperSize: 'A3', orientation: 'landscape', squaresX: 8,  squaresY: 5,  squareLength: 50, margin: 10, category: 'A3', internalCorners: '7×4' },
  { id: 'a3-60-5x3',   paperSize: 'A3', orientation: 'landscape', squaresX: 6,  squaresY: 4,  squareLength: 60, margin: 5,  category: 'A3', internalCorners: '5×3' },
].map(c => enrich(c, dictForSquare(c.squareLength, A3_RANGES)));

// ── A2 Templates (420×594mm) ──
const A2_TEMPLATES: TemplateConfig[] = [
  { id: 'a2-40-12x9',  paperSize: 'A2', orientation: 'landscape', squaresX: 13, squaresY: 10, squareLength: 40, margin: 5,  category: 'A2', internalCorners: '12×9' },
  { id: 'a2-50-9x7',   paperSize: 'A2', orientation: 'landscape', squaresX: 10, squaresY: 8,  squareLength: 50, margin: 5,  category: 'A2', internalCorners: '9×7' },
  { id: 'a2-55-9x7',   paperSize: 'A2', orientation: 'landscape', squaresX: 9,  squaresY: 7,  squareLength: 55, margin: 10, category: 'A2', internalCorners: '8×6' },
  { id: 'a2-70-7x4',   paperSize: 'A2', orientation: 'landscape', squaresX: 7,  squaresY: 5,  squareLength: 70, margin: 10, category: 'A2', internalCorners: '6×4' },
  { id: 'a2-80-6x4',   paperSize: 'A2', orientation: 'landscape', squaresX: 7,  squaresY: 5,  squareLength: 80, margin: 5,  category: 'A2', internalCorners: '6×4' },
].map(c => enrich(c, dictForSquare(c.squareLength, A2_RANGES)));

// ── A1 Templates (594×841mm) ──
const A1_TEMPLATES: TemplateConfig[] = [
  { id: 'a1-75-9x7',   paperSize: 'A1', orientation: 'landscape', squaresX: 10, squaresY: 7,  squareLength: 75, margin: 10, category: 'A1', internalCorners: '9×7' },
  { id: 'a1-80-8x6',   paperSize: 'A1', orientation: 'landscape', squaresX: 9,  squaresY: 7,  squareLength: 80, margin: 10, category: 'A1', internalCorners: '8×6' },
  { id: 'a1-100-6x4',  paperSize: 'A1', orientation: 'landscape', squaresX: 7,  squaresY: 5,  squareLength: 100, margin: 10, category: 'A1', internalCorners: '6×4' },
].map(c => enrich(c, dictForSquare(c.squareLength, A1_RANGES)));

// ── Combine all templates ──
export const ALL_TEMPLATES: TemplateConfig[] = [
  ...EIGHT_BY_SIX,
  ...A4_TEMPLATES,
  ...A3_TEMPLATES,
  ...A2_TEMPLATES,
  ...A1_TEMPLATES,
];

// ── Auto-Suggest: given paper size, find optimal square size ──
export function suggestSquareSize(
  paperSize: string,
  orientation: 'portrait' | 'landscape',
  targetSquaresX: number,
  targetSquaresY: number,
  margin: number = 10
): { squareLength: number; boardWidthMm: number; boardHeightMm: number } | null {
  const paperDims: Record<string, { w: number; h: number }> = {
    A4: { w: 210, h: 297 },
    A3: { w: 297, h: 420 },
    A2: { w: 420, h: 594 },
    A1: { w: 594, h: 841 },
  };

  const paper = paperDims[paperSize];
  if (!paper) return null;

  const pw = orientation === 'landscape' ? paper.h : paper.w;
  const ph = orientation === 'landscape' ? paper.w : paper.h;

  // Available space after margins
  const availW = pw - 2 * margin;
  const availH = ph - 2 * margin;

  // Max square size that fits
  const maxFromW = availW / targetSquaresX;
  const maxFromH = availH / targetSquaresY;
  const squareLength = Math.min(maxFromW, maxFromH);

  // Round down to nearest 5mm for clean numbers
  const rounded = Math.floor(squareLength / 5) * 5;

  if (rounded < 5) return null;

  return {
    squareLength: rounded,
    boardWidthMm: targetSquaresX * rounded + 2 * margin,
    boardHeightMm: targetSquaresY * rounded + 2 * margin,
  };
}

// ── Get templates filtered by category ──
export function getTemplatesByCategory(category: string): TemplateConfig[] {
  if (category === 'all') return ALL_TEMPLATES;
  return ALL_TEMPLATES.filter(t => t.category === category);
}

/**
 * Paper dimensions keyed by name (mm).
 */
const PAPER_DIMS: Record<string, { w: number; h: number }> = {
  A4: { w: 210, h: 297 },
  A3: { w: 297, h: 420 },
  A2: { w: 420, h: 594 },
  A1: { w: 594, h: 841 },
};

/**
 * Returns ONLY templates that fit at 1:1 scale on their paper size.
 * No scaling. Guaranteed accurate for real-world calibration.
 */
export function getAccurateTemplates(): TemplateConfig[] {
  return ALL_TEMPLATES.filter(t => {
    const paper = PAPER_DIMS[t.paperSize];
    if (!paper) return false;

    // Effective paper size based on orientation
    const pw = t.orientation === 'landscape' ? paper.h : paper.w;
    const ph = t.orientation === 'landscape' ? paper.w : paper.h;

    // Board dimensions
    const bw = t.squaresX * t.squareLength + 2 * t.margin;
    const bh = t.squaresY * t.squareLength + 2 * t.margin;

    return bw <= pw && bh <= ph;
  });
}

/** Pre-filtered array of templates guaranteed to fit at 1:1. */
export const ALL_ACCURATE_TEMPLATES = getAccurateTemplates();
