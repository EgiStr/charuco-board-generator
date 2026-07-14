/**
 * Print-Ready Template Library.
 * Pre-calculated configurations that fit on standard paper sizes at 1:1.
 * Margins are included automatically; the "fit" column indicates whether
 * the board fits exactly (✅ 1:1) or needs scaling (⚠️ scaled).
 */

export interface TemplateConfig {
  id: string;
  paperSize: string;       // "A4", "A3", "A2", "A1"
  orientation: 'portrait' | 'landscape';
  squaresX: number;        // columns
  squaresY: number;        // rows
  squareLength: number;    // mm
  margin: number;          // mm
  boardWidthMm: number;    // calculated
  boardHeightMm: number;   // calculated
  internalCorners: string; // e.g. "8×6"
  category: string;        // "8x6", "A4", "A3", "A2", "A1"
}

// ── 8×6 Internal Corners (9×7 squares) — Standard collection ──
const EIGHT_BY_SIX: TemplateConfig[] = [
  { id: 'a4-25-9x7', paperSize: 'A4', orientation: 'landscape', squaresX: 9, squaresY: 7, squareLength: 25, margin: 10, category: '8x6' },
  { id: 'a3-35-9x7', paperSize: 'A3', orientation: 'landscape', squaresX: 9, squaresY: 7, squareLength: 35, margin: 10, category: '8x6' },
  { id: 'a3-40-9x7', paperSize: 'A3', orientation: 'landscape', squaresX: 9, squaresY: 7, squareLength: 40, margin: 10, category: '8x6' },
  { id: 'a2-55-9x7', paperSize: 'A2', orientation: 'landscape', squaresX: 9, squaresY: 7, squareLength: 55, margin: 10, category: '8x6' },
  { id: 'a2-60-9x7', paperSize: 'A2', orientation: 'landscape', squaresX: 9, squaresY: 7, squareLength: 60, margin: 10, category: '8x6' },
  { id: 'a1-75-9x7', paperSize: 'A1', orientation: 'landscape', squaresX: 9, squaresY: 7, squareLength: 75, margin: 10, category: '8x6' },
  { id: 'a1-80-9x7', paperSize: 'A1', orientation: 'landscape', squaresX: 9, squaresY: 7, squareLength: 80, margin: 10, category: '8x6' },
].map(c => ({
  ...c,
  boardWidthMm: c.squaresX * c.squareLength + 2 * c.margin,
  boardHeightMm: c.squaresY * c.squareLength + 2 * c.margin,
  internalCorners: '8×6',
} as TemplateConfig));

// ── A4 Templates (210×297mm) ──
const A4_TEMPLATES: TemplateConfig[] = [
  { id: 'a4-20-13x9', paperSize: 'A4', orientation: 'landscape', squaresX: 14, squaresY: 10, squareLength: 20, margin: 5, category: 'A4' },
  { id: 'a4-25-10x7', paperSize: 'A4', orientation: 'landscape', squaresX: 11, squaresY: 8, squareLength: 25, margin: 5, category: 'A4' },
  { id: 'a4-25-9x7', paperSize: 'A4', orientation: 'landscape', squaresX: 9, squaresY: 7, squareLength: 25, margin: 10, category: 'A4' },
  { id: 'a4-30-8x6', paperSize: 'A4', orientation: 'landscape', squaresX: 9, squaresY: 7, squareLength: 30, margin: 3, category: 'A4' },
  { id: 'a4-35-7x4', paperSize: 'A4', orientation: 'portrait', squaresX: 8, squaresY: 5, squareLength: 35, margin: 5, category: 'A4' },
  { id: 'a4-40-6x4', paperSize: 'A4', orientation: 'portrait', squaresX: 7, squaresY: 5, squareLength: 40, margin: 5, category: 'A4' },
  { id: 'a4-50-5x3', paperSize: 'A4', orientation: 'portrait', squaresX: 6, squaresY: 4, squareLength: 50, margin: 5, category: 'A4' },
  { id: 'a4-60-4x3', paperSize: 'A4', orientation: 'portrait', squaresX: 5, squaresY: 4, squareLength: 60, margin: 5, category: 'A4' },
].map(c => ({
  ...c,
  boardWidthMm: c.squaresX * c.squareLength + 2 * c.margin,
  boardHeightMm: c.squaresY * c.squareLength + 2 * c.margin,
  internalCorners: `${c.squaresX - 1}×${c.squaresY - 1}`,
} as TemplateConfig));

// ── A3 Templates (297×420mm) ──
const A3_TEMPLATES: TemplateConfig[] = [
  { id: 'a3-25-15x10', paperSize: 'A3', orientation: 'landscape', squaresX: 16, squaresY: 11, squareLength: 25, margin: 5, category: 'A3' },
  { id: 'a3-30-12x8', paperSize: 'A3', orientation: 'landscape', squaresX: 13, squaresY: 9, squareLength: 30, margin: 5, category: 'A3' },
  { id: 'a3-35-9x7', paperSize: 'A3', orientation: 'landscape', squaresX: 9, squaresY: 7, squareLength: 35, margin: 10, category: 'A3' },
  { id: 'a3-40-8x6', paperSize: 'A3', orientation: 'landscape', squaresX: 9, squaresY: 7, squareLength: 40, margin: 10, category: 'A3' },
  { id: 'a3-45-7x5', paperSize: 'A3', orientation: 'landscape', squaresX: 8, squaresY: 6, squareLength: 45, margin: 5, category: 'A3' },
  { id: 'a3-50-6x4', paperSize: 'A3', orientation: 'landscape', squaresX: 8, squaresY: 5, squareLength: 50, margin: 10, category: 'A3' },
  { id: 'a3-60-5x3', paperSize: 'A3', orientation: 'landscape', squaresX: 6, squaresY: 4, squareLength: 60, margin: 5, category: 'A3' },
].map(c => ({
  ...c,
  boardWidthMm: c.squaresX * c.squareLength + 2 * c.margin,
  boardHeightMm: c.squaresY * c.squareLength + 2 * c.margin,
  internalCorners: `${c.squaresX - 1}×${c.squaresY - 1}`,
} as TemplateConfig));

// ── A2 Templates (420×594mm) ──
const A2_TEMPLATES: TemplateConfig[] = [
  { id: 'a2-30-18x13', paperSize: 'A2', orientation: 'landscape', squaresX: 19, squaresY: 14, squareLength: 30, margin: 5, category: 'A2' },
  { id: 'a2-40-12x9', paperSize: 'A2', orientation: 'landscape', squaresX: 13, squaresY: 10, squareLength: 40, margin: 5, category: 'A2' },
  { id: 'a2-50-9x7', paperSize: 'A2', orientation: 'landscape', squaresX: 10, squaresY: 8, squareLength: 50, margin: 5, category: 'A2' },
  { id: 'a2-55-9x7', paperSize: 'A2', orientation: 'landscape', squaresX: 9, squaresY: 7, squareLength: 55, margin: 10, category: 'A2' },
  { id: 'a2-60-8x6', paperSize: 'A2', orientation: 'landscape', squaresX: 9, squaresY: 7, squareLength: 60, margin: 10, category: 'A2' },
  { id: 'a2-70-7x4', paperSize: 'A2', orientation: 'landscape', squaresX: 7, squaresY: 5, squareLength: 70, margin: 10, category: 'A2' },
  { id: 'a2-80-6x4', paperSize: 'A2', orientation: 'landscape', squaresX: 7, squaresY: 5, squareLength: 80, margin: 5, category: 'A2' },
  { id: 'a2-100-5x3', paperSize: 'A2', orientation: 'landscape', squaresX: 6, squaresY: 4, squareLength: 100, margin: 5, category: 'A2' },
].map(c => ({
  ...c,
  boardWidthMm: c.squaresX * c.squareLength + 2 * c.margin,
  boardHeightMm: c.squaresY * c.squareLength + 2 * c.margin,
  internalCorners: `${c.squaresX - 1}×${c.squaresY - 1}`,
} as TemplateConfig));

// ── A1 Templates (594×841mm) ──
const A1_TEMPLATES: TemplateConfig[] = [
  { id: 'a1-30-27x18', paperSize: 'A1', orientation: 'landscape', squaresX: 28, squaresY: 19, squareLength: 30, margin: 5, category: 'A1' },
  { id: 'a1-45-17x12', paperSize: 'A1', orientation: 'landscape', squaresX: 18, squaresY: 13, squareLength: 45, margin: 5, category: 'A1' },
  { id: 'a1-60-13x8', paperSize: 'A1', orientation: 'landscape', squaresX: 14, squaresY: 9, squareLength: 60, margin: 5, category: 'A1' },
  { id: 'a1-75-9x7', paperSize: 'A1', orientation: 'landscape', squaresX: 10, squaresY: 7, squareLength: 75, margin: 10, category: 'A1' },
  { id: 'a1-80-8x6', paperSize: 'A1', orientation: 'landscape', squaresX: 9, squaresY: 7, squareLength: 80, margin: 10, category: 'A1' },
  { id: 'a1-100-6x4', paperSize: 'A1', orientation: 'landscape', squaresX: 7, squaresY: 5, squareLength: 100, margin: 10, category: 'A1' },
].map(c => ({
  ...c,
  boardWidthMm: c.squaresX * c.squareLength + 2 * c.margin,
  boardHeightMm: c.squaresY * c.squareLength + 2 * c.margin,
  internalCorners: `${c.squaresX - 1}×${c.squaresY - 1}`,
} as TemplateConfig));

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
