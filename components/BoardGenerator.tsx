'use client';

import { useState, useCallback, useEffect } from 'react';
import { Share2, BookOpen, Sparkles, FilePen, Ruler, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import Link from 'next/link';
import { BoardParams, getDefaultParams, serializeParams, deserializeParams } from '@/lib/utils';
import { fillPaper } from '@/lib/templates';
import ParameterControls from './ParameterControls';
import BoardPreview from './BoardPreview';
import DownloadOptions from './DownloadOptions';
import Presets from './Presets';
import PaperReference from './PaperReference';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';

export default function BoardGenerator() {
  const [params, setParams] = useState<BoardParams>(getDefaultParams());
  const [lang, setLang] = useState<'en' | 'id'>('en');
  const [copied, setCopied] = useState(false);
  const [showRef, setShowRef] = useState(false);
  const [pureBoard, setPureBoard] = useState(true); // default true = pure board

  // Load params from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search.slice(1);
      if (search) {
        const loaded = deserializeParams(search);
        if (loaded) {
          setParams((prev) => ({ ...prev, ...loaded }));
        }
      }
      // Load language preference
      const savedLang = localStorage.getItem('charuco-lang') as 'en' | 'id' | null;
      if (savedLang) setLang(savedLang);
    }
  }, []);

  const handleParamChange = useCallback((newParams: BoardParams) => {
    setParams(newParams);
  }, []);

  const handlePreset = useCallback((preset: Partial<BoardParams>) => {
    setParams((prev) => ({ ...prev, ...preset }));
  }, []);

  const handleLangToggle = useCallback(() => {
    const next = lang === 'en' ? 'id' : 'en';
    setLang(next);
    localStorage.setItem('charuco-lang', next);
  }, [lang]);

  const handleFillPaper = useCallback(() => {
    const result = fillPaper(params.paperSize, params.orientation, params.squaresX, params.squaresY);
    if (result) {
      setPureBoard(true);
      setParams(prev => ({
        ...prev,
        squareLength: result.squareLength,
        margin: 0,
      }));
    }
  }, [params.paperSize, params.orientation, params.squaresX, params.squaresY]);

  const handleCopyUrl = useCallback(() => {
    const url = new URL(window.location.href);
    url.search = serializeParams(params);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [params]);

  const T = {
    en: {
      title: 'ChArUco Board Generator',
      subtitle: 'Generate printable ChArUco boards for camera calibration',
      copyUrl: 'Copy URL',
      copied: 'Copied!',
      calibration: 'Calibration Guide',
      footer: 'ChArUco Board Generator — OpenCV-compatible',
      pureBoard: 'Pure Board',
      withInfo: 'With Info',
    },
    id: {
      title: 'Generator Board ChArUco',
      subtitle: 'Hasilkan board ChArUco yang siap cetak untuk kalibrasi kamera',
      copyUrl: 'Salin URL',
      copied: 'Tersalin!',
      calibration: 'Panduan Kalibrasi',
      footer: 'Generator Board ChArUco — Kompatibel dengan OpenCV',
      pureBoard: 'Pure Board',
      withInfo: 'Dengan Info',
    },
  };

  const t = T[lang];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              {t.title}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
              {t.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPureBoard(!pureBoard)}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border ${
                pureBoard
                  ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-600'
                  : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
              }`}
            >
              {pureBoard
                ? <><Sparkles className="w-3.5 h-3.5" /> {t.pureBoard}</>
                : <><FilePen className="w-3.5 h-3.5" /> {t.withInfo}</>
              }
            </button>
            <button
              onClick={handleFillPaper}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border
                bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-600
                hover:bg-zinc-300 dark:hover:bg-zinc-600"
              title={lang === 'en' ? 'Fill entire paper (zero margin)' : 'Penuhi seluruh kertas (tanpa margin)'}
            >
              <Ruler className="w-3.5 h-3.5" /> {lang === 'en' ? 'Fill Paper' : 'Penuhi Kertas'}
            </button>
            <LanguageToggle lang={lang} onToggle={handleLangToggle} />
            <Link
              href="/calibration"
              className="hidden sm:flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium
                hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors
                text-zinc-600 dark:text-zinc-400"
            >
              <BookOpen className="w-3.5 h-3.5" />
              {t.calibration}
            </Link>
            <button
              onClick={handleCopyUrl}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium
                hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors
                text-zinc-600 dark:text-zinc-400"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copied ? t.copied : t.copyUrl}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Presets */}
        <section className="mb-6">
          <Presets params={params} onApply={handlePreset} lang={lang} />
        </section>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20 space-y-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
              <ParameterControls params={params} onChange={handleParamChange} lang={lang} />
            </div>
          </aside>

          {/* Preview + Download */}
          <div className="lg:col-span-2 space-y-4">
            <BoardPreview params={params} lang={lang} className="h-[400px] sm:h-[500px] lg:h-[600px]" pureBoard={pureBoard} />

            <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
              <DownloadOptions params={params} lang={lang} pureBoard={pureBoard} />
            </div>

            {/* Real-World Paper Reference (collapsible) */}
            <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
              <button
                onClick={() => setShowRef(!showRef)}
                className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors w-full"
              >
                {showRef ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <FileText className="w-3.5 h-3.5" />
                {lang === 'en' ? 'Real-World Paper Reference' : 'Referensi Kertas Dunia Nyata'}
              </button>
              {showRef && (
                <div className="mt-3">
                  <PaperReference lang={lang} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 mt-12">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-zinc-400">
            {t.footer}
          </p>
          <Link
            href="/calibration"
            className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400
              hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors sm:hidden"
          >
            <BookOpen className="w-3 h-3" />
            {t.calibration}
          </Link>
          <Link
            href="/calibration"
            className="hidden sm:flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400
              hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <BookOpen className="w-3 h-3" />
            {t.calibration}
          </Link>
        </div>
      </footer>
    </div>
  );
}
