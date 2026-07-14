'use client';

import { Languages } from 'lucide-react';

interface LanguageToggleProps {
  lang: 'en' | 'id';
  onToggle: () => void;
}

export default function LanguageToggle({ lang, onToggle }: LanguageToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium
        hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors
        text-zinc-600 dark:text-zinc-400"
      aria-label="Toggle language"
    >
      <Languages className="w-4 h-4" />
      {lang === 'en' ? 'EN' : 'ID'}
    </button>
  );
}
