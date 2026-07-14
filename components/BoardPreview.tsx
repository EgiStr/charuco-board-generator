'use client';

import { useEffect, useRef } from 'react';
import { Printer, Check, X, Ruler, FileText } from 'lucide-react';
import { BoardParams, getCornerCount, getBoardPhysicalSize, formatDimension, getPaperSize } from '@/lib/utils';
import { renderCharucoBoard } from '@/lib/charucoRenderer';
import { checkPaperFit } from '@/lib/accuracy';

interface BoardPreviewProps {
  params: BoardParams;
  lang?: 'en' | 'id';
  className?: string;
  pureBoard?: boolean;
}

const PRINT_DPI = 300;
const PX_PER_MM = PRINT_DPI / 25.4; // 11.811
const MM_PER_PX = 25.4 / PRINT_DPI; // 0.0847

/** Find the smallest ISO paper that fits the board (checks both orientations). */
function bestPaper(wMm: number, hMm: number): { name: string; orientation: 'portrait' | 'landscape' } | null {
  const papers = [
    { name: 'A4' as const, w: 210, h: 297 },
    { name: 'A3' as const, w: 297, h: 420 },
    { name: 'A2' as const, w: 420, h: 594 },
    { name: 'A1' as const, w: 594, h: 841 },
  ];
  for (const p of papers) {
    if (wMm <= p.w && hMm <= p.h) return { name: p.name, orientation: 'portrait' };
    if (wMm <= p.h && hMm <= p.w) return { name: p.name, orientation: 'landscape' };
  }
  return null;
}

/** Scale percentage needed to fit board on a given paper size (0 if it already fits). */
function scaleNeededFor(boardW: number, boardH: number, pageW: number, pageH: number): number | null {
  const s = Math.min(pageW / boardW, pageH / boardH);
  return s < 1 ? s * 100 : null;
}

export default function BoardPreview({ params, lang = 'en', className = '', pureBoard = false }: BoardPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    if (width <= 0 || height <= 0) return;

    canvas.width = width * (window.devicePixelRatio || 1);
    canvas.height = height * (window.devicePixelRatio || 1);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

    try {
      const result = renderCharucoBoard(params, {
        canvasWidth: width,
        canvasHeight: height,
        dpi: 72,
        backgroundColor: '#ffffff',
        showInfo: !pureBoard,
        showScale: !pureBoard,
        pureBoard,
        renderMode: 'screen',
      });

      // Draw the result canvas onto our visible canvas
      ctx.drawImage(result.canvas, 0, 0);
    } catch (err) {
      console.error('Render error:', err);
    }
  }, [params, pureBoard]);

  const phys = getBoardPhysicalSize(params);
  const corners = getCornerCount(params);
  const paperDims = getPaperSize(params.paperSize, params.orientation, params.customWidth, params.customHeight);
  const fit = checkPaperFit(params, paperDims);
  const best = bestPaper(phys.width, phys.height);

  // Scale needed on currently selected paper
  const selScale = scaleNeededFor(phys.width, phys.height, paperDims.width, paperDims.height);

  const T = {
    en: {
      accuracy: 'Print Accuracy (300 DPI) — FIXED',
      pxPerMm: 'px/mm',
      square: 'Square',
      board: 'Board',
      printSize: 'Print Size on Selected Paper',
      pxAt300: 'px at 300 DPI',
      tooLarge: 'Board TOO LARGE',
      needsScale: 'needs',
      scalePct: 'scale',
      fitsAt: 'fits at 100% scale',
      bestPaper: 'Best paper',
      atScale: 'at',
    },
    id: {
      accuracy: 'Akurasi Cetak (300 DPI) — TETAP',
      pxPerMm: 'px/mm',
      square: 'Kotak',
      board: 'Board',
      printSize: 'Ukuran Cetak di Kertas Terpilih',
      pxAt300: 'px di 300 DPI',
      tooLarge: 'Board TERLALU BESAR',
      needsScale: 'butuh',
      scalePct: 'skala',
      fitsAt: 'cocok di skala 100%',
      bestPaper: 'Kertas terbaik',
      atScale: 'pd',
    },
  };
  const t = T[lang];

  return (
    <div className={`flex flex-col ${className}`}>
      <div
        ref={containerRef}
        className="flex-1 min-h-[300px] rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden"
      >
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* Board Info */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3 py-2">
          <span className="text-zinc-500 dark:text-zinc-400">Board</span>
          <p className="font-semibold text-zinc-800 dark:text-zinc-200">
            {params.squaresX} &times; {params.squaresY}
          </p>
        </div>
        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3 py-2">
          <span className="text-zinc-500 dark:text-zinc-400">Corners</span>
          <p className="font-semibold text-zinc-800 dark:text-zinc-200">{corners}</p>
        </div>
        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3 py-2">
          <span className="text-zinc-500 dark:text-zinc-400">Size</span>
          <p className="font-semibold text-zinc-800 dark:text-zinc-200">
            {formatDimension(phys.width, params.unit)} &times;{' '}
            {formatDimension(phys.height, params.unit)}
          </p>
        </div>
        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3 py-2">
          <span className="text-zinc-500 dark:text-zinc-400">Dict</span>
          <p className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono text-[10px] truncate">
            {params.dictionary}
          </p>
        </div>
      </div>

      {/* Print Accuracy — FIXED at 300 DPI, not screen preview */}
      <div className="mt-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs">
        <span className="text-zinc-500 dark:text-zinc-400">
          <Printer className="w-3 h-3 inline-block mr-1" />
          {t.accuracy}
        </span>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
          <span className="text-zinc-700 dark:text-zinc-300">
            1px = <strong>{MM_PER_PX.toFixed(4)}mm</strong>
          </span>
          <span className="text-zinc-700 dark:text-zinc-300">
            <strong>{PX_PER_MM.toFixed(2)}</strong> {t.pxPerMm}
          </span>
          <span className="text-zinc-700 dark:text-zinc-300">
            {t.square}: <strong>{params.squareLength}mm</strong> &rarr; {(params.squareLength * PX_PER_MM).toFixed(0)}px
          </span>
          <span className="text-zinc-700 dark:text-zinc-300">
            {t.board}: <strong>{phys.width.toFixed(0)}&times;{phys.height.toFixed(0)}mm</strong> &rarr; {(phys.width * PX_PER_MM).toFixed(0)}&times;{(phys.height * PX_PER_MM).toFixed(0)}px
          </span>
        </div>
      </div>

      {/* Print Size on Selected Paper */}
      <div className="mt-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs">
        <span className="text-zinc-500 dark:text-zinc-400">
          <FileText className="w-3 h-3 inline-block mr-1" />
          {t.printSize}
        </span>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
          <span className="text-zinc-700 dark:text-zinc-300">
            Board: <strong>{phys.width.toFixed(0)}&times;{phys.height.toFixed(0)}mm</strong> &rarr; {(phys.width * PX_PER_MM).toFixed(0)}&times;{(phys.height * PX_PER_MM).toFixed(0)} {t.pxAt300}
          </span>
          <span className="text-zinc-700 dark:text-zinc-300">
            {params.paperSize} ({paperDims.width}&times;{paperDims.height}mm):
            {selScale !== null ? (
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {' '}&mdash; {t.tooLarge} ({t.needsScale} {selScale.toFixed(0)}% {t.scalePct})
              </span>
            ) : (
              <span className="font-semibold text-green-600 dark:text-green-400">
                {' '}&mdash; {t.fitsAt}
              </span>
            )}
          </span>
        </div>
        {best && (
          <p className="mt-1 text-green-600 dark:text-green-400">
            {t.bestPaper}: <strong>{best.name} ({best.orientation})</strong> {t.atScale} 100%
          </p>
        )}
        {!best && (
          <p className="mt-1 text-amber-600 dark:text-amber-400">
            {t.bestPaper}: A1+ ({lang === 'en' ? 'custom / tiled print needed' : 'cetak custom / tile diperlukan'})
          </p>
        )}
      </div>

      {/* Paper Coverage */}
      <div className="mt-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs">
        <span className="text-zinc-500 dark:text-zinc-400">
          <Ruler className="w-3 h-3 inline-block mr-1" />
          Paper Coverage
        </span>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
          {params.margin === 0 ? (
            <span className="font-semibold text-green-600 dark:text-green-400">
              100% (full-bleed)
            </span>
          ) : (
            <span className="text-zinc-700 dark:text-zinc-300">
              {((phys.width * phys.height) / (paperDims.width * paperDims.height) * 100).toFixed(1)}%
            </span>
          )}
          <span className="text-zinc-500 dark:text-zinc-400">
            {phys.width.toFixed(0)}&times;{phys.height.toFixed(0)}mm / {paperDims.width}&times;{paperDims.height}mm
          </span>
        </div>
      </div>

      {/* Paper Fit Warning */}
      <div className={`mt-2 px-3 py-2 rounded-lg text-xs font-medium ${
        fit.fits
          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
          : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
      }`}>
        {fit.fits
          ? <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-green-500" /> Board fits {params.paperSize} at 1:1 scale ({fit.boardWidthMm}\u00d7{fit.boardHeightMm}mm within {fit.pageWidthMm}\u00d7{fit.pageHeightMm}mm)</span>
          : <span className="flex items-center gap-1"><X className="w-3.5 h-3.5 text-red-500" /> Board {fit.boardWidthMm}\u00d7{fit.boardHeightMm}mm is too large for {params.paperSize} ({fit.pageWidthMm}\u00d7{fit.pageHeightMm}mm). {fit.scaleNeeded < 1 ? `Will be scaled by ${(fit.scaleNeeded * 100).toFixed(0)}%.` : 'Try a larger paper size.'}</span>
        }
      </div>
    </div>
  );
}
