'use client';

import { useState } from 'react';
import { FileDown, FileImage, FileType, Printer } from 'lucide-react';
import { BoardParams } from '@/lib/utils';
import { downloadPdf, downloadPng, downloadSvg, printBoard } from '@/lib/pdfGenerator';

interface DownloadOptionsProps {
  params: BoardParams;
  lang: 'en' | 'id';
}

const T = {
  en: {
    title: 'Download & Export',
    pdf: 'PDF (300 DPI)',
    png: 'PNG (300 DPI)',
    svg: 'SVG',
    print: 'Print',
    generating: 'Generating...',
  },
  id: {
    title: 'Unduh & Ekspor',
    pdf: 'PDF (300 DPI)',
    png: 'PNG (300 DPI)',
    svg: 'SVG',
    print: 'Cetak',
    generating: 'Memproses...',
  },
};

export default function DownloadOptions({ params, lang }: DownloadOptionsProps) {
  const t = T[lang];
  const [busy, setBusy] = useState<string | null>(null);

  const handlePdf = () => {
    setBusy('pdf');
    setTimeout(() => {
      try {
        downloadPdf(params);
      } catch (err) {
        console.error('PDF error:', err);
        alert('Failed to generate PDF. Check console for details.');
      }
      setBusy(null);
    }, 100);
  };

  const handlePng = () => {
    setBusy('png');
    setTimeout(() => {
      try {
        downloadPng(params);
      } catch (err) {
        console.error('PNG error:', err);
        alert('Failed to generate PNG.');
      }
      setBusy(null);
    }, 100);
  };

  const handleSvg = () => {
    setBusy('svg');
    setTimeout(() => {
      try {
        downloadSvg(params);
      } catch (err) {
        console.error('SVG error:', err);
        alert('Failed to generate SVG.');
      }
      setBusy(null);
    }, 100);
  };

  const handlePrint = () => {
    try {
      printBoard(params);
    } catch (err) {
      console.error('Print error:', err);
    }
  };

  const btnClass = (type: string) =>
    `flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all border ${
      busy === type
        ? 'opacity-50 cursor-wait bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
        : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm text-zinc-700 dark:text-zinc-300'
    }`;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">
        {t.title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button onClick={handlePdf} disabled={busy !== null} className={btnClass('pdf')}>
          <FileDown className="w-4 h-4 text-red-500" />
          {busy === 'pdf' ? t.generating : t.pdf}
        </button>
        <button onClick={handlePng} disabled={busy !== null} className={btnClass('png')}>
          <FileImage className="w-4 h-4 text-blue-500" />
          {busy === 'png' ? t.generating : t.png}
        </button>
        <button onClick={handleSvg} disabled={busy !== null} className={btnClass('svg')}>
          <FileType className="w-4 h-4 text-green-500" />
          {busy === 'svg' ? t.generating : t.svg}
        </button>
        <button onClick={handlePrint} className={btnClass('print')}>
          <Printer className="w-4 h-4 text-purple-500" />
          {t.print}
        </button>
      </div>
    </div>
  );
}
