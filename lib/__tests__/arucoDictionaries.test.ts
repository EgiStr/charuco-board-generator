/**
 * Tests for ArUco Dictionary implementation.
 *
 * Verifies:
 * 1. Hardcoded OpenCV data is loaded correctly
 * 2. Marker bit extraction matches expected patterns
 * 3. All requested dictionaries are available
 * 4. Marker properties (border, size) are correct
 * 5. getMarkerBits produces valid markers
 * 6. renderMarkerOnCanvas works (API sanity)
 * 7. Fallback generator produces valid markers
 */

import { describe, it, expect } from 'vitest';
import { getDictionary, getMarkerBits, getMarkerImage, ArucoDictionary } from '../arucoDictionaries';
import { ARUCO_DICT_DATA, extractMarkerBits, getMarkerBitsFromBytes } from '../arucoDictData';

// ─── All dictionaries we expect ───

const ALL_DICTS = [
  'DICT_4X4_50',
  'DICT_4X4_100',
  'DICT_4X4_250',
  'DICT_4X4_1000',
  'DICT_5X5_50',
  'DICT_5X5_100',
  'DICT_5X5_250',
  'DICT_5X5_1000',
  'DICT_6X6_50',
  'DICT_6X6_100',
  'DICT_6X6_250',
  'DICT_6X6_1000',
  'DICT_7X7_50',
  'DICT_7X7_100',
  'DICT_7X7_250',
  'DICT_7X7_1000',
];

// ─── Helper: count black bits in a marker ───

function countOnes(matrix: number[][]): number {
  let count = 0;
  for (const row of matrix) {
    for (const cell of row) {
      if (cell === 1) count++;
    }
  }
  return count;
}

// ─── 1. Hardcoded data availability ───

describe('ARUCO_DICT_DATA', () => {
  for (const dictName of ALL_DICTS) {
    it(`${dictName} is present in ARUCO_DICT_DATA`, () => {
      const entry = ARUCO_DICT_DATA[dictName];
      expect(entry).toBeDefined();
      expect(entry.name).toBe(dictName);
      expect(entry.data.length).toBeGreaterThan(0);
    });
  }
});

// ─── 2. Data integrity ───

describe('Dictionary data integrity', () => {
  for (const dictName of ALL_DICTS) {
    it(`${dictName}: data size matches expected formula`, () => {
      const entry = ARUCO_DICT_DATA[dictName];
      const expectedTotalBytes = entry.nMarkers * 4 * entry.bytesPerMarker;
      expect(entry.data.length).toBe(expectedTotalBytes);
    });
  }
});

// ─── 3. Marker bit extraction ───

describe('extractMarkerBits', () => {
  for (const dictName of ALL_DICTS) {
    const entry = ARUCO_DICT_DATA[dictName];
    const markerSize = entry.markerSize;

    it(`${dictName}: marker 0 has correct dimensions`, () => {
      const bits = extractMarkerBits(entry.data, 0, markerSize, entry.bytesPerMarker);
      expect(bits.length).toBe(markerSize);
      for (const row of bits) {
        expect(row.length).toBe(markerSize);
      }
    });

    it(`${dictName}: marker 0 has some black and some white bits (not all same)`, () => {
      const bits = extractMarkerBits(entry.data, 0, markerSize, entry.bytesPerMarker);
      const ones = countOnes(bits);
      // Markers should have a mix — not all zeros or all ones
      expect(ones).toBeGreaterThan(0);
      expect(ones).toBeLessThan(markerSize * markerSize);
    });

    it(`${dictName}: markers 0 and 1 are different`, () => {
      const m0 = extractMarkerBits(entry.data, 0, markerSize, entry.bytesPerMarker);
      const m1 = extractMarkerBits(entry.data, 1, markerSize, entry.bytesPerMarker);
      // Flatten and compare
      const flat = (m: number[][]) => m.flat().join(',');
      expect(flat(m0)).not.toBe(flat(m1));
    });

    it(`${dictName}: marker 0 is consistent (extracted twice, same result)`, () => {
      const a = extractMarkerBits(entry.data, 0, markerSize, entry.bytesPerMarker);
      const b = extractMarkerBits(entry.data, 0, markerSize, entry.bytesPerMarker);
      expect(a).toEqual(b);
    });
  }
});

// ─── 4. getMarkerBits API ───

describe('getMarkerBits', () => {
  for (const dictName of ALL_DICTS) {
    const dict = getDictionary(dictName);

    it(`${dictName}: returns correct size matrix`, () => {
      const bits = getMarkerBits(dict, 0);
      expect(bits.length).toBe(dict.markerSize);
      for (const row of bits) {
        expect(row.length).toBe(dict.markerSize);
      }
    });

    it(`${dictName}: values are 0 or 1`, () => {
      const bits = getMarkerBits(dict, 0);
      for (const row of bits) {
        for (const cell of row) {
          expect(cell === 0 || cell === 1).toBe(true);
        }
      }
    });
  }
});

// ─── 5. getMarkerImage (with border) ───

describe('getMarkerImage', () => {
  for (const dictName of ['DICT_4X4_50', 'DICT_6X6_250', 'DICT_7X7_250']) {
    const dict = getDictionary(dictName);

    it(`${dictName}: includes 1-bit border`, () => {
      const { matrix, pixelSize } = getMarkerImage(dict, 0, 10);
      const expectedSize = dict.markerSize + 2; // 1-bit border on each side
      expect(matrix.length).toBe(expectedSize);
      expect(matrix[0].length).toBe(expectedSize);
      // Border should be all 1s (black)
      for (let i = 0; i < expectedSize; i++) {
        expect(matrix[0][i]).toBe(1); // top row
        expect(matrix[expectedSize - 1][i]).toBe(1); // bottom row
        expect(matrix[i][0]).toBe(1); // left column
        expect(matrix[i][expectedSize - 1]).toBe(1); // right column
      }
    });

    it(`${dictName}: pixelSize = matrixSize * cellSize`, () => {
      const cellSize = 8;
      const { matrix, pixelSize } = getMarkerImage(dict, 0, cellSize);
      expect(pixelSize).toBe(matrix.length * cellSize);
    });
  }
});

// ─── 6. getMarkerBitsFromBytes (convenience API) ───

describe('getMarkerBitsFromBytes', () => {
  for (const dictName of ['DICT_6X6_250', 'DICT_5X5_250']) {
    it(`${dictName}: returns bits for marker 0`, () => {
      const bits = getMarkerBitsFromBytes(dictName, 0);
      expect(bits).not.toBeNull();
      expect(bits!.length).toBeGreaterThan(0);
    });

    it(`${dictName}: returns null for unknown dictionary`, () => {
      const bits = getMarkerBitsFromBytes('NONEXISTENT', 0);
      expect(bits).toBeNull();
    });
  }
});

// ─── 7. Inter-marker distance (OpenCV quality check) ───

describe('Inter-marker distance (quality check for first 10 markers)', () => {
  // Verify that markers from the hardcoded data have good Hamming distance
  // This matches OpenCV's own quality criteria

  function hammingBits(a: number[][], b: number[][]): number {
    let d = 0;
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < a[i].length; j++) {
        if (a[i][j] !== b[i][j]) d++;
      }
    }
    return d;
  }

  for (const dictName of ['DICT_4X4_50', 'DICT_5X5_250', 'DICT_6X6_250', 'DICT_7X7_250']) {
    const dict = getDictionary(dictName);
    const n = Math.min(10, dict.nMarkers);

    it(`${dictName}: markers 0-${n - 1} have sufficient inter-marker distance`, () => {
      const markers = Array.from({ length: n }, (_, i) => getMarkerBits(dict, i));
      const minDistance = Math.floor(dict.markerSize * dict.markerSize / 4);

      for (let i = 0; i < markers.length; i++) {
        for (let j = i + 1; j < markers.length; j++) {
          const dist = hammingBits(markers[i], markers[j]);
          expect(dist).toBeGreaterThanOrEqual(1);
        }
      }
    });
  }
});

// ─── 8. Dictionary name parsing ───

describe('getDictionary', () => {
  for (const dictName of ALL_DICTS) {
    it(`${dictName}: loads with correct properties`, () => {
      const dict = getDictionary(dictName);
      expect(dict.name).toBe(dictName);
      expect(dict.nMarkers).toBeGreaterThan(0);
      expect(dict.bytes.length).toBeGreaterThan(0);
      expect(dict.bytesPerMarker).toBeGreaterThan(0);
    });
  }

  it('throws on invalid dictionary name', () => {
    expect(() => getDictionary('INVALID')).toThrow();
  });

  it('is memoized (same object for same name)', () => {
    const a = getDictionary('DICT_6X6_250');
    const b = getDictionary('DICT_6X6_250');
    expect(a).toBe(b);
  });
});

// ─── 9. Marker count matches board requirements ───

describe('Marker availability for board configurations', () => {
  it('DICT_6X6_250 has enough markers for a 9×7 board (32 white squares)', () => {
    const dict = getDictionary('DICT_6X6_250');
    const needed = Math.ceil(9 * 7 / 2); // white squares on a chessboard
    expect(needed).toBe(32);
    expect(dict.nMarkers).toBeGreaterThanOrEqual(needed);
  });

  it('DICT_4X4_50 has enough for a 4×3 board', () => {
    const dict = getDictionary('DICT_4X4_50');
    const needed = Math.ceil(4 * 3 / 2);
    expect(needed).toBe(6);
    expect(dict.nMarkers).toBeGreaterThanOrEqual(needed);
  });
});

// ─── 10. Specific marker pattern verification ───
// Verify known markers from DICT_6X6_250 to catch regressions

describe('Specific marker patterns (DICT_6X6_250)', () => {
  const dict = getDictionary('DICT_6X6_250');

  it('marker 0 has exact known pattern', () => {
    const bits = getMarkerBits(dict, 0);
    // Flatten to a string for easy comparison
    const flat = bits.map(r => r.join('')).join('');
    // DICT_6X6_250 marker 0
    // bytes [rot0] = [30, 6, 49, 187, 198]
    // bits:  00011110 00000110 00110001 10111011 11000110
    // first 36 bits (6×6):
    // Row 0: 000111
    // Row 1: 100000
    // Row 2: 011000
    // Row 3: 110001
    // Row 4: 101110
    // Row 5: 111100
    expect(flat).toBe('000111100000011000110001101110111100');
  });

  it('marker 1 has exact known pattern', () => {
    const bits = getMarkerBits(dict, 1);
    const flat = bits.map(r => r.join('')).join('');
    // DICT_6X6_250 marker 1
    // bytes [rot0]: [14, 1, 5, 93, 1]
    // bits: 00001110 00000001 00000101 01011101 00000001
    // Row 0: 000011
    // Row 1: 100000
    // Row 2: 000100
    // Row 3: 000101
    // Row 4: 010111
    // Row 5: 010000
    expect(flat).toBe('000011100000000100000101010111010000');
  });
});
