import { describe, it, expect } from 'vitest';
import { calcScale, getA4BoardMetrics } from '../accuracy';

describe('calcScale', () => {
  it('25mm at 300 DPI = 295.276px, gives correct mm/px', () => {
    const pxPerMm = 300 / 25.4;
    const px = 25 * pxPerMm;
    const result = calcScale(25, px);
    expect(result.mmPerPx).toBeCloseTo(0.0846667, 4);
    expect(result.pxPerMm).toBeCloseTo(11.811, 1);
  });

  it('40mm at 300 DPI = 472.441px', () => {
    const pxPerMm = 300 / 25.4;
    const px = 40 * pxPerMm;
    const result = calcScale(40, px);
    expect(result.mmPerPx).toBeCloseTo(0.0846667, 4);
  });

  it('50mm at 200 DPI = 393.701px', () => {
    const pxPerMm = 200 / 25.4;
    const px = 50 * pxPerMm;
    const result = calcScale(50, px);
    expect(result.mmPerPx).toBeCloseTo(0.127, 3);
    expect(result.pxPerMm).toBeCloseTo(7.874, 2);
  });

  it('handles zero pixels gracefully (no division by zero crash)', () => {
    const result = calcScale(25, 0);
    expect(result.pxPerMm).toBe(0);
  });

  it('30mm at 72 DPI (screen) gives 85.039px', () => {
    const pxPerMm = 72 / 25.4;
    const px = 30 * pxPerMm;
    const result = calcScale(30, px);
    expect(result.mmPerPx).toBeCloseTo(0.35278, 4);
    expect(result.pxPerMm).toBeCloseTo(2.835, 2);
  });
});

describe('getA4BoardMetrics - paper fit', () => {
  it('7×5, 25mm squares, 10mm margin fits A4', () => {
    const r = getA4BoardMetrics(7, 5, 25, 10);
    expect(r.fitsA4).toBe(true);
    expect(r.boardWidthMm).toBe(195);
    expect(r.boardHeightMm).toBe(145);
    expect(r.fitsA3).toBe(true);
    expect(r.scaleRatio).toBeGreaterThan(1);
  });

  it('9×6, 25mm squares, 10mm margin exceeds A4 width (245>210)', () => {
    const r = getA4BoardMetrics(9, 6, 25, 10);
    expect(r.fitsA4).toBe(false);
    expect(r.boardWidthMm).toBe(245);
    expect(r.fitsA3).toBe(true);  // 245 < 297
    expect(r.scaleRatio).toBeLessThan(1);
  });

  it('11×8, 30mm squares, 15mm margin exceeds both A4 and A3', () => {
    const r = getA4BoardMetrics(11, 8, 30, 15);
    expect(r.fitsA4).toBe(false);
    expect(r.boardWidthMm).toBe(360);
    expect(r.boardHeightMm).toBe(270);
    // A3 portrait: 297 wide, 420 tall. Width 360 > 297 → doesn't fit
    // But let's see - A3 is 297×420, so 360×270 might need landscape
    // Our function checks portrait only: w≤297 && h≤420
    expect(r.fitsA3).toBe(false); // 360 > 297
  });

  it('3×3, 50mm squares, 10mm margin easily fits A4', () => {
    const r = getA4BoardMetrics(3, 3, 50, 10);
    expect(r.fitsA4).toBe(true);
    expect(r.boardWidthMm).toBe(170);
    expect(r.boardHeightMm).toBe(170);
  });

  it('board dimensions are computed correctly (width formula)', () => {
    const r = getA4BoardMetrics(10, 8, 20, 5);
    expect(r.boardWidthMm).toBe(210);   // 10*20 + 10 = 210
    expect(r.boardHeightMm).toBe(170);  // 8*20 + 10 = 170
  });
});

describe('300 DPI physical constants', () => {
  it('1 inch = 25.4mm = 300px at 300 DPI', () => {
    const pxPerMm = 300 / 25.4;
    expect(25.4 * pxPerMm).toBeCloseTo(300, 10);
  });

  it('A4 width at 300 DPI = 2480.3px', () => {
    expect(210 * (300 / 25.4)).toBeCloseTo(2480.315, 1);
  });

  it('A4 height at 300 DPI = 3507.9px', () => {
    expect(297 * (300 / 25.4)).toBeCloseTo(3507.874, 1);
  });

  it('A3 width at 300 DPI = 3507.9px', () => {
    expect(297 * (300 / 25.4)).toBeCloseTo(3507.874, 1);
  });

  it('A3 height at 300 DPI = 4960.63px', () => {
    expect(420 * (300 / 25.4)).toBeCloseTo(4960.63, 1);
  });

  it('72 DPI (screen) = 2.835 px/mm', () => {
    expect(72 / 25.4).toBeCloseTo(2.83465, 3);
  });
});
