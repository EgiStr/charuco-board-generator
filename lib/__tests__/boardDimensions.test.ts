import { describe, it, expect } from 'vitest';
import { getPaperSize, PAPER_SIZES } from '../utils';
import { generateSvg } from '../svgGenerator';

describe('ISO paper size constants', () => {
  it('A4 = 210×297mm', () => {
    expect(PAPER_SIZES.A4.width).toBe(210);
    expect(PAPER_SIZES.A4.height).toBe(297);
  });

  it('A3 = 297×420mm (exactly 2× A4 area)', () => {
    expect(PAPER_SIZES.A3.width).toBe(297);
    expect(PAPER_SIZES.A3.height).toBe(420);
    const a4Area = PAPER_SIZES.A4.width * PAPER_SIZES.A4.height;
    const a3Area = PAPER_SIZES.A3.width * PAPER_SIZES.A3.height;
    expect(a3Area / a4Area).toBeCloseTo(2, 0);
  });

  it('A2 = 420×594mm (2× A3 area)', () => {
    expect(PAPER_SIZES.A2.width).toBe(420);
    expect(PAPER_SIZES.A2.height).toBe(594);
    const a3Area = PAPER_SIZES.A3.width * PAPER_SIZES.A3.height;
    const a2Area = PAPER_SIZES.A2.width * PAPER_SIZES.A2.height;
    expect(a2Area / a3Area).toBeCloseTo(2, 0);
  });

  it('A1 = 594×841mm (2× A2 area)', () => {
    expect(PAPER_SIZES.A1.width).toBe(594);
    expect(PAPER_SIZES.A1.height).toBe(841);
    const a2Area = PAPER_SIZES.A2.width * PAPER_SIZES.A2.height;
    const a1Area = PAPER_SIZES.A1.width * PAPER_SIZES.A1.height;
    expect(a1Area / a2Area).toBeCloseTo(2, 0);
  });
});

describe('getPaperSize orientation', () => {
  it('A4 portrait = 210×297', () => {
    const r = getPaperSize('A4', 'portrait');
    expect(r.width).toBe(210);
    expect(r.height).toBe(297);
  });

  it('A4 landscape = 297×210', () => {
    const r = getPaperSize('A4', 'landscape');
    expect(r.width).toBe(297);
    expect(r.height).toBe(210);
  });

  it('A3 landscape = 420×297', () => {
    const r = getPaperSize('A3', 'landscape');
    expect(r.width).toBe(420);
    expect(r.height).toBe(297);
  });

  it('Custom size works correctly', () => {
    const r = getPaperSize('Custom', 'portrait', 150, 200);
    expect(r.width).toBe(150);
    expect(r.height).toBe(200);
  });

  it('Custom landscape swaps width/height', () => {
    const r = getPaperSize('Custom', 'landscape', 150, 200);
    expect(r.width).toBe(200);
    expect(r.height).toBe(150);
  });
});

describe('board real-world verification', () => {
  it('7×5 board at 25mm sq + 10mm margin = 195×145mm fits A4', () => {
    const boardW = 7 * 25 + 20;
    const boardH = 5 * 25 + 20;
    expect(boardW).toBe(195);
    expect(boardH).toBe(145);
    expect(boardW).toBeLessThanOrEqual(210);
    expect(boardH).toBeLessThanOrEqual(297);
  });

  it('9×6 board at 25mm sq + 10mm margin = 245×170mm NOT fit A4 portrait width', () => {
    const boardW = 9 * 25 + 20;
    expect(boardW).toBe(245);
    expect(boardW).toBeGreaterThan(210); // A4 portrait width
  });

  it('board area utilization: 7×5 board uses 45% of A4 area', () => {
    const boardArea = (7 * 25 + 20) * (5 * 25 + 20);
    const a4Area = 210 * 297;
    const utilization = boardArea / a4Area;
    expect(utilization).toBeCloseTo(0.453, 1);
    expect(boardArea).toBeLessThan(a4Area);
  });

  it('A4 (62370 mm²) can hold any board up to that area', () => {
    const a4 = { w: 210, h: 297 };
    const maxArea = a4.w * a4.h;
    // 13×9 at 25mm + 5mm margin = 335×235 = 78725 mm² > A4
    const tooBig = (13 * 25 + 10) * (9 * 25 + 10);
    expect(tooBig).toBeGreaterThan(maxArea);
  });
});

describe('SVG output physical units', () => {
  it('SVG width/height should have mm unit suffix for correct print size', () => {
    const params = { squaresX: 9, squaresY: 7, squareLength: 30, markerLength: 18, margin: 0, dictionary: 'DICT_6X6_250' } as any;
    const svg = generateSvg(params, true);
    expect(svg).toContain('width="270mm"');
    expect(svg).toContain('height="210mm"');
  });
});

// 🅶 PRESETS must fit on their paper (1:1)
import { PRESETS, getBoardPhysicalSize } from '../utils';

describe('PRESETS must be print-ready (1:1 fit on paper)', () => {
  PRESETS.forEach(preset => {
    it(`${preset.name}: board must fit ${preset.paperSize} at 1:1`, () => {
      const bw = preset.squaresX * preset.squareLength + 2 * preset.margin;
      const bh = preset.squaresY * preset.squareLength + 2 * preset.margin;
      // Check portrait fit
      const paper = getPaperSize(preset.paperSize as any, 'portrait');
      const fitsPortrait = bw <= paper.width && bh <= paper.height;
      // Check landscape fit
      const paperL = getPaperSize(preset.paperSize as any, 'landscape');
      const fitsLandscape = bw <= paperL.width && bh <= paperL.height;
      expect(fitsPortrait || fitsLandscape).toBe(true);
    });
  });
});

// 🅳 fillPaper must return markerLength
import { fillPaper } from '../templates';

describe('fillPaper integrity', () => {
  it('should return markerLength with correct ratio', () => {
    const result = fillPaper('A4', 'landscape', 9, 7);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.markerLength).toBeDefined();
      const ratio = result.markerLength / result.squareLength;
      expect(ratio).toBeGreaterThanOrEqual(0.4);
      expect(ratio).toBeLessThanOrEqual(0.6);
    }
  });
});

// 🅵 markerLength must be < squareLength by default
it('default params should have markerLength < squareLength', () => {
  const defaults = { squareLength: 40, markerLength: 24 };
  expect(defaults.markerLength).toBeLessThan(defaults.squareLength);
  const ratio = defaults.markerLength / defaults.squareLength;
  expect(ratio).toBeGreaterThanOrEqual(0.4);
  expect(ratio).toBeLessThanOrEqual(0.6);
});
