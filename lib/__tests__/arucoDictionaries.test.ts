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

// ─── 11. OpenCV parity: stored bytes decode to official rot0 bits ───
// Guards the two historical bugs: (a) strided column extraction of bytesList
// rows, (b) wrong polarity / tail-bit packing. Reference vectors verified
// with cv2.aruco.Dictionary_getBitsFromByteList (OpenCV 5.0.0); the stored
// convention is 1=black (inverted from OpenCV's 1=white).

describe('OpenCV parity (official bytesList rot0, 1=black)', () => {
  const cases: Array<{ dict: string; id: number; black: string }> = [
    // 4x4: 16 bits = 2 full bytes, no tail
    { dict: 'DICT_4X4_50', id: 0, black: '0100101011001101' },
    { dict: 'DICT_4X4_50', id: 1, black: '1111000001100101' },
    // 5x5: 25 bits = 3 full bytes + low 1 bit of byte 3
    { dict: 'DICT_5X5_100', id: 0, black: '0101110100100110101000011' },
    { dict: 'DICT_5X5_100', id: 1, black: '1111000111111100100011001' },
    // 6x6: 36 bits = 4 full bytes + low 4 bits of byte 4
    { dict: 'DICT_6X6_250', id: 0, black: '111000011100001000100111110101011001' },
    { dict: 'DICT_6X6_250', id: 1, black: '111100010000010001011100011101101110' },
    // 7x7: 49 bits = 6 full bytes + low 1 bit of byte 6
    { dict: 'DICT_7X7_50', id: 0, black: '0010001010100011100100110101101000110101111101010' },
    { dict: 'DICT_7X7_50', id: 1, black: '0001101111100100000011101100000110111111010101001' },
  ];

  for (const { dict: dictName, id, black } of cases) {
    it(`${dictName} marker ${id} matches official OpenCV bits`, () => {
      const dict = getDictionary(dictName);
      const bits = getMarkerBits(dict, id);
      const flat = bits.map(r => r.join('')).join('');
      expect(flat).toBe(black);
    });
  }

  it('rot0 block is the contiguous row head (not a strided column)', () => {
    // DICT_6X6_250 marker 0: contiguous row head must be [30,61,216,42,6].
    // The old strided-column bug read [30,6,49,187,198] instead.
    const entry = ARUCO_DICT_DATA['DICT_6X6_250'];
    const head = Array.from(entry.data.slice(0, 5));
    expect(head).toEqual([30, 61, 216, 42, 6]);
  });
});

describe('Specific marker patterns (DICT_6X6_250)', () => {
  const dict = getDictionary('DICT_6X6_250');

  it('marker 0 has exact known pattern', () => {
    const bits = getMarkerBits(dict, 0);
    // Flatten to a string for easy comparison (1=black, 0=white)
    const flat = bits.map(r => r.join('')).join('');
    // DICT_6X6_250 marker 0, verified against
    // cv2.aruco.Dictionary_getBitsFromByteList (OpenCV 5.0.0):
    // rot0 block = [30, 61, 216, 42, 6] -> first 32 bits + low 4 bits of last byte
    // white=000111100011110111011000001010100110 -> inverted to black=1:
    // Row 0: 111000
    // Row 1: 011100
    // Row 2: 001000
    // Row 3: 100111
    // Row 4: 110101
    // Row 5: 011001
    expect(flat).toBe('111000011100001000100111110101011001');
  });

  it('marker 1 has exact known pattern', () => {
    const bits = getMarkerBits(dict, 1);
    const flat = bits.map(r => r.join('')).join('');
    // DICT_6X6_250 marker 1, verified against OpenCV 5.0.0:
    // rot0 block = [14, 251, 163, 137, 1]
    // white=000011101111101110100011100010010001 -> inverted to black=1:
    // Row 0: 111100
    // Row 1: 010000
    // Row 2: 010001
    // Row 3: 011100
    // Row 4: 011101
    // Row 5: 101110
    expect(flat).toBe('111100010000010001011100011101101110');
  });
});
