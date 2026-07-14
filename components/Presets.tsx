'use client';

import { BoardParams, PRESETS } from '@/lib/utils';

interface PresetsProps {
  onApply: (params: Partial<BoardParams>) => void;
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

export default function Presets({ onApply, lang }: PresetsProps) {
  const desc = descriptions[lang];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">
        {lang === 'en' ? 'Presets' : 'Preset'}
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
  );
}
