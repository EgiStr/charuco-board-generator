'use client';

import { Info } from 'lucide-react';
import { BoardParams, DICTIONARIES, DictionaryName, PaperSize, Orientation, Unit } from '@/lib/utils';

interface ParameterControlsProps {
  params: BoardParams;
  onChange: (params: BoardParams) => void;
  lang: 'en' | 'id';
}

const T = {
  en: {
    boardTitle: 'Board Dimensions',
    squaresX: 'Squares X (columns)',
    squaresY: 'Squares Y (rows)',
    squareLength: 'Square Length',
    markerLength: 'Marker Length',
    dictionary: 'Dictionary',
    paperTitle: 'Paper Settings',
    paperSize: 'Paper Size',
    orientation: 'Orientation',
    portrait: 'Portrait',
    landscape: 'Landscape',
    margin: 'Margin',
    units: 'Units',
    customSize: 'Custom Size',
    width: 'Width',
    height: 'Height',
    presets: 'Presets',
    applyPreset: 'Apply',
  },
  id: {
    boardTitle: 'Dimensi Board',
    squaresX: 'Kotak X (kolom)',
    squaresY: 'Kotak Y (baris)',
    squareLength: 'Panjang Kotak',
    markerLength: 'Panjang Marker',
    dictionary: 'Dictionary',
    paperTitle: 'Pengaturan Kertas',
    paperSize: 'Ukuran Kertas',
    orientation: 'Orientasi',
    portrait: 'Potret',
    landscape: 'Lanskap',
    margin: 'Margin',
    units: 'Satuan',
    customSize: 'Ukuran Kustom',
    width: 'Lebar',
    height: 'Tinggi',
    presets: 'Preset',
    applyPreset: 'Terapkan',
  },
};

export default function ParameterControls({ params, onChange, lang }: ParameterControlsProps) {
  const t = T[lang];

  const update = (partial: Partial<BoardParams>) => {
    const newParams = { ...params, ...partial };
    // Auto-sync markerLength if squareLength changed and ratio would be invalid
    if (partial.squareLength && partial.squareLength !== params.squareLength) {
      if (newParams.markerLength >= newParams.squareLength) {
        newParams.markerLength = Math.round(newParams.squareLength * 0.55);
      }
    }
    onChange(newParams);
  };

  const PaperSizeSelector = (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {t.paperSize}
      </label>
      <select
        value={params.paperSize}
        onChange={(e) => update({ paperSize: e.target.value as PaperSize })}
        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800
          px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
      >
        <option value="A4">A4 (210 × 297 mm)</option>
        <option value="A3">A3 (297 × 420 mm)</option>
        <option value="A2">A2 (420 × 594 mm)</option>
        <option value="A1">A1 (594 × 841 mm)</option>
        <option value="Custom">{t.customSize}</option>
      </select>
      {params.paperSize === 'Custom' && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">{t.width} (mm)</label>
            <input
              type="number" min={50} max={2000}
              value={params.customWidth || 500}
              onChange={(e) => update({ customWidth: parseFloat(e.target.value) || 500 })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800
                px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">{t.height} (mm)</label>
            <input
              type="number" min={50} max={2000}
              value={params.customHeight || 500}
              onChange={(e) => update({ customHeight: parseFloat(e.target.value) || 500 })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800
                px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>
      )}
    </div>
  );

  const OrientationToggle = (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {t.orientation}
      </label>
      <div className="flex gap-2">
        <button
          onClick={() => update({ orientation: 'portrait' })}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            params.orientation === 'portrait'
              ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
              : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
          }`}
        >
          {t.portrait}
        </button>
        <button
          onClick={() => update({ orientation: 'landscape' })}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            params.orientation === 'landscape'
              ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
              : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
          }`}
        >
          {t.landscape}
        </button>
      </div>
    </div>
  );

  const UnitsToggle = (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {t.units}
      </label>
      <div className="flex gap-2">
        {(['mm', 'cm', 'inches'] as Unit[]).map((u) => (
          <button
            key={u}
            onClick={() => update({ unit: u })}
            className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
              params.unit === u
                ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
            }`}
          >
            {u === 'inches' ? 'in' : u}
          </button>
        ))}
      </div>
    </div>
  );

  const InputField = ({
    label,
    value,
    onChange: onValChange,
    min,
    max,
    step = 1,
    note,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    min: number;
    max: number;
    step?: number;
    note?: string;
  }) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === '') {
            onValChange(min);
            return;
          }
          const v = parseFloat(raw);
          if (!isNaN(v)) onValChange(Math.max(min, Math.min(max, v)));
        }}
        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800
          px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
      />
      {note && <p className="text-xs text-zinc-400">{note}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Board Dimensions */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">
          {t.boardTitle}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label={t.squaresX}
            value={params.squaresX}
            onChange={(v) => update({ squaresX: v })}
            min={3} max={20}
          />
          <InputField
            label={t.squaresY}
            value={params.squaresY}
            onChange={(v) => update({ squaresY: v })}
            min={3} max={20}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label={`${t.squareLength} (mm)`}
            value={params.squareLength}
            onChange={(v) => update({ squareLength: v })}
            min={10} max={200}
          />
          <InputField
            label={`${t.markerLength} (mm)`}
            value={params.markerLength}
            onChange={(v) => update({ markerLength: v })}
            min={5}
            max={params.squareLength - 1}
            note={`Must be < Square Length (${params.squareLength}mm). Recommended: ${Math.round(params.squareLength * 0.55)}mm`}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t.dictionary}
            </label>
            <div className="relative group">
              <button
                type="button"
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-help"
                aria-label="What is an ArUco dictionary?"
                tabIndex={-1}
              >
                <Info className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-lg bg-zinc-800 dark:bg-zinc-200 text-xs text-zinc-200 dark:text-zinc-800 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 pointer-events-none">
                <div className="font-medium mb-1">What is an ArUco Dictionary?</div>
                <p className="mb-1">The dictionary defines the binary marker patterns used in the ChArUco board.</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li><strong>Marker size</strong> (4×4 to 7×7): Larger markers are more robust to noise but need more space</li>
                  <li><strong>Count</strong> (50 to 1000): Number of unique markers available</li>
                  <li><strong>DICT_6X6_250</strong> — Recommended default. Balance of size, count, and error correction</li>
                  <li><strong>DICT_5X5_250</strong> — Slightly smaller markers, good for high contrast setups</li>
                </ul>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800 dark:border-t-zinc-200"></div>
              </div>
            </div>
          </div>
          <select
            value={params.dictionary}
            onChange={(e) => update({ dictionary: e.target.value as DictionaryName })}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800
              px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 font-mono"
          >
            {DICTIONARIES.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Paper Settings */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">
          {t.paperTitle}
        </h3>
        {PaperSizeSelector}
        {OrientationToggle}

        <InputField
          label={`${t.margin} (mm)`}
          value={params.margin}
          onChange={(v) => update({ margin: v })}
          min={0} max={50}
        />

        {UnitsToggle}
      </div>
    </div>
  );
}
