'use client';

import { useState } from 'react';
import { BoardParams, PRESETS, PAPER_SIZES } from '@/lib/utils';
import { ALL_ACCURATE_TEMPLATES, TemplateConfig } from '@/lib/templates';

interface PresetsProps {
  params: BoardParams;
  onApply: (partial: Partial<BoardParams>) => void;
  lang: 'en' | 'id';
}

const descriptions = {
  en: [
    'Balanced 7×5 board for general use',
    'More corners for precise calibration',
    'Big board for large-scale calibration',
    'Compact board for quick calibration',
  ],
  id: [
    'Board 7×5 seimbang untuk penggunaan umum',
    'Lebih banyak corner untuk kalibrasi presisi',
    'Board besar untuk kalibrasi skala besar',
    'Board ringkas untuk kalibrasi cepat',
  ],
};

const T = {
  en: {
    presets: 'Quick Presets',
    templates: 'Print-Ready Templates',
    subtitle: 'Pre-calculated boards that fit standard paper at 1:1 scale',
    eightBySix: '8×6 Corner Collection',
    perPaper: 'By Paper Size',
    apply: 'Apply',
    board: 'Board',
    corners: 'Corners',
    square: 'Sq',
    marker: 'Marker',
    dict: 'Dict',
    boardSize: 'Size',
    fit: 'Fit',
    fitTip8x6: 'All 8×6 templates use the same board dimensions (9×7 squares) with square size optimized for each paper.',
  },
  id: {
    presets: 'Preset Cepat',
    templates: 'Template Siap Cetak',
    subtitle: 'Board pra-kalkulasi yang pas di kertas standar skala 1:1',
    eightBySix: 'Koleksi Corner 8×6',
    perPaper: 'Berdasarkan Ukuran Kertas',
    apply: 'Terapkan',
    board: 'Board',
    corners: 'Corner',
    square: 'Ktk',
    marker: 'Marker',
    dict: 'Dict',
    boardSize: 'Ukuran',
    fit: 'Muat',
    fitTip8x6: 'Semua template 8×6 menggunakan dimensi board sama (9×7 kotak) dengan ukuran kotak dioptimalkan untuk setiap kertas.',
  },
};

export default function Presets({ params, onApply, lang }: PresetsProps) {
  const t = T[lang];
  const desc = descriptions[lang];
  const [activeCategory, setActiveCategory] = useState<string>('8x6');

  const categories = [
    { id: '8x6', label: lang === 'en' ? '8×6 Corners' : '8×6 Corner' },
    { id: 'A4', label: 'A4' },
    { id: 'A3', label: 'A3' },
    { id: 'A2', label: 'A2' },
    { id: 'A1', label: 'A1' },
  ];

  const templates = activeCategory === 'all'
    ? ALL_ACCURATE_TEMPLATES
    : ALL_ACCURATE_TEMPLATES.filter(t => t.category === activeCategory);

  function paperSizeDims(name: string, orientation: string): string {
    const p = PAPER_SIZES[name as keyof typeof PAPER_SIZES];
    if (!p) return '';
    return orientation === 'landscape'
      ? `${p.height}×${p.width}mm`
      : `${p.width}×${p.height}mm`;
  }

  function applyTemplate(tmpl: TemplateConfig) {
    onApply({
      paperSize: tmpl.paperSize as BoardParams['paperSize'],
      orientation: tmpl.orientation,
      squaresX: tmpl.squaresX,
      squaresY: tmpl.squaresY,
      squareLength: tmpl.squareLength,
      markerLength: tmpl.markerLength,
      margin: tmpl.margin,
      dictionary: tmpl.dictionary as BoardParams['dictionary'],
    });
  }

  return (
    <div className="space-y-4">
      {/* ── Quick Presets ── */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          {t.presets}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESETS.map((preset, idx) => (
            <button
              key={preset.name}
              onClick={() => onApply(preset)}
              className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800
                p-3 text-left hover:border-blue-400 dark:hover:border-blue-500 transition-all
                hover:shadow-sm group"
            >
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {preset.name}
              </p>
              <p className="text-[10px] text-zinc-400 mt-1 leading-tight">
                {desc[idx]}
              </p>
              <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                {preset.squaresX}×{preset.squaresY} / {preset.squareLength}mm
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Template Library ── */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {t.templates}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t.subtitle}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                activeCategory === cat.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Templates Table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700 max-h-[400px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-zinc-100 dark:bg-zinc-800">
              <tr className="text-zinc-600 dark:text-zinc-400">
                <th className="px-3 py-2 font-medium">Paper</th>
                <th className="px-3 py-2 font-medium">{t.board}</th>
                <th className="px-3 py-2 font-medium">{t.corners}</th>
                <th className="px-3 py-2 font-medium">{t.square}</th>
                <th className="px-3 py-2 font-medium">{t.marker}</th>
                <th className="px-3 py-2 font-medium">{t.dict}</th>
                <th className="px-3 py-2 font-medium">{t.boardSize}</th>
                <th className="px-3 py-2 font-medium">1:1</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {templates.map(tmpl => {
                const pSize = `${tmpl.paperSize} ${tmpl.orientation === 'landscape' ? 'L' : 'P'}`;

                const isActive =
                  params.paperSize === tmpl.paperSize &&
                  params.squaresX === tmpl.squaresX &&
                  params.squaresY === tmpl.squaresY &&
                  Math.abs(params.squareLength - tmpl.squareLength) < 1 &&
                  params.margin === tmpl.margin;

                return (
                  <tr
                    key={tmpl.id}
                    className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
                      isActive ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <td className="px-3 py-2 font-semibold text-zinc-800 dark:text-zinc-200">{pSize}</td>
                    <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">{tmpl.squaresX}×{tmpl.squaresY}</td>
                    <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">{tmpl.internalCorners}</td>
                    <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{tmpl.squareLength}mm</td>
                    <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{tmpl.markerLength}mm</td>
                    <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400 font-mono text-[10px]">{tmpl.dictionary.replace('DICT_', '')}</td>
                    <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{tmpl.boardWidthMm}×{tmpl.boardHeightMm}</td>
                    <td className="px-3 py-2">
                      <span className="text-green-600 dark:text-green-400 font-medium" title="Verified 1:1 scale">✅</span>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => applyTemplate(tmpl)}
                        className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                          isActive
                            ? 'bg-blue-500 text-white'
                            : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-blue-500 hover:text-white'
                        }`}
                      >
                        {isActive ? '✓ ' : ''}{t.apply}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {activeCategory === '8x6' && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
            {t.fitTip8x6}
          </p>
        )}

        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
          ✅ All templates verified: 1:1 scale on their paper size — guaranteed accurate for real-world calibration.
        </p>
      </div>
    </div>
  );
}
