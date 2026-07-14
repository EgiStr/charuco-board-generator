export type Unit = 'mm' | 'cm' | 'inches';
export type PaperSize = 'A4' | 'A3' | 'A2' | 'A1' | 'Custom';
export type Orientation = 'portrait' | 'landscape';

export interface PaperDimensions {
  width: number; // in mm
  height: number; // in mm
}

export const PAPER_SIZES: Record<Exclude<PaperSize, 'Custom'>, PaperDimensions> = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  A2: { width: 420, height: 594 },
  A1: { width: 594, height: 841 },
};

export function getPaperSize(
  paperSize: PaperSize,
  orientation: Orientation,
  customWidth?: number,
  customHeight?: number
): PaperDimensions {
  let dims: PaperDimensions;
  if (paperSize === 'Custom' && customWidth && customHeight) {
    dims = { width: customWidth, height: customHeight };
  } else {
    dims = { ...PAPER_SIZES[paperSize as Exclude<PaperSize, 'Custom'>] };
  }
  if (orientation === 'landscape') {
    return { width: dims.height, height: dims.width };
  }
  return dims;
}

export function mmToPoints(mm: number): number {
  return mm * 2.83465; // 1mm = 2.83465pt
}

export function mmToPixels(mm: number, dpi: number): number {
  return (mm / 25.4) * dpi;
}

export function convertUnit(value: number, from: Unit, to: Unit): number {
  if (from === to) return value;
  // Convert to mm first
  let mm: number;
  switch (from) {
    case 'cm': mm = value * 10; break;
    case 'inches': mm = value * 25.4; break;
    default: mm = value;
  }
  // Convert from mm to target
  switch (to) {
    case 'cm': return mm / 10;
    case 'inches': return mm / 25.4;
    default: return mm;
  }
}

export function formatDimension(mm: number, unit: Unit): string {
  const v = convertUnit(mm, 'mm', unit);
  const suffix = unit === 'mm' ? 'mm' : unit === 'cm' ? 'cm' : '"';
  return `${v.toFixed(unit === 'inches' ? 2 : 1)} ${suffix}`;
}

export const DICTIONARIES = [
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
] as const;

export type DictionaryName = typeof DICTIONARIES[number];

export function getDictionarySize(dict: DictionaryName): number {
  const match = dict.match(/DICT_(\d+)X\d+_(\d+)/);
  if (!match) return 6;
  return parseInt(match[1]);
}

export function getDictionaryMarkers(dict: DictionaryName): number {
  const match = dict.match(/DICT_\d+X\d+_(\d+)/);
  if (!match) return 250;
  return parseInt(match[1]);
}

export const PRESETS = [
  {
    name: 'Standard',
    squaresX: 7,
    squaresY: 5,
    squareLength: 25,
    markerLength: 14,
    dictionary: 'DICT_6X6_250' as DictionaryName,
    paperSize: 'A4' as PaperSize,
    margin: 10,
  },
  {
    name: 'High Accuracy',
    squaresX: 11,
    squaresY: 8,
    squareLength: 25,
    markerLength: 14,
    dictionary: 'DICT_5X5_250' as DictionaryName,
    paperSize: 'A4' as PaperSize,
    margin: 5,
  },
  {
    name: 'Large Board',
    squaresX: 9,
    squaresY: 7,
    squareLength: 35,
    markerLength: 19,
    dictionary: 'DICT_7X7_250' as DictionaryName,
    paperSize: 'A3' as PaperSize,
    margin: 10,
  },
  {
    name: 'Small Board',
    squaresX: 4,
    squaresY: 3,
    squareLength: 45,
    markerLength: 25,
    dictionary: 'DICT_4X4_50' as DictionaryName,
    paperSize: 'A4' as PaperSize,
    margin: 10,
  },
];

export interface BoardParams {
  squaresX: number;
  squaresY: number;
  squareLength: number; // mm
  markerLength: number; // mm
  dictionary: DictionaryName;
  margin: number; // mm
  paperSize: PaperSize;
  orientation: Orientation;
  unit: Unit;
  customWidth?: number;
  customHeight?: number;
}

export function getDefaultParams(): BoardParams {
  return {
    squaresX: 7,
    squaresY: 5,
    squareLength: 40,
    markerLength: 24,
    dictionary: 'DICT_6X6_250',
    margin: 10,
    paperSize: 'A4',
    orientation: 'portrait',
    unit: 'mm',
  };
}

export function getBoardPhysicalSize(params: BoardParams): { width: number; height: number } {
  return {
    width: params.squaresX * params.squareLength + 2 * params.margin,
    height: params.squaresY * params.squareLength + 2 * params.margin,
  };
}

export function getCornerCount(params: BoardParams): number {
  return (params.squaresX - 1) * (params.squaresY - 1);
}

export function serializeParams(params: BoardParams): string {
  const p = new URLSearchParams();
  p.set('sx', String(params.squaresX));
  p.set('sy', String(params.squaresY));
  p.set('sl', String(params.squareLength));
  p.set('ml', String(params.markerLength));
  p.set('d', params.dictionary);
  p.set('ps', params.paperSize);
  p.set('o', params.orientation);
  p.set('m', String(params.margin));
  p.set('u', params.unit);
  if (params.customWidth) p.set('cw', String(params.customWidth));
  if (params.customHeight) p.set('ch', String(params.customHeight));
  return p.toString();
}

export function deserializeParams(search: string): Partial<BoardParams> | null {
  try {
    const p = new URLSearchParams(search);
    const sx = parseInt(p.get('sx') || '');
    const sy = parseInt(p.get('sy') || '');
    if (!sx || !sy) return null;
    const params: Partial<BoardParams> = {
      squaresX: sx,
      squaresY: sy,
      squareLength: parseFloat(p.get('sl') || '40'),
      markerLength: parseFloat(p.get('ml') || '24'),
      dictionary: (p.get('d') as DictionaryName) || 'DICT_6X6_250',
      paperSize: (p.get('ps') as PaperSize) || 'A4',
      orientation: (p.get('o') as Orientation) || 'portrait',
      margin: parseFloat(p.get('m') || '10'),
      unit: (p.get('u') as Unit) || 'mm',
    };
    const cw = p.get('cw');
    const ch = p.get('ch');
    if (cw) params.customWidth = parseFloat(cw);
    if (ch) params.customHeight = parseFloat(ch);
    return params;
  } catch {
    return null;
  }
}
