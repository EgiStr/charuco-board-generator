'use client';

import { useEffect, useRef, useState } from 'react';
import { BoardParams, getCornerCount, getBoardPhysicalSize, formatDimension, getPaperSize } from '@/lib/utils';
import { renderCharucoBoard } from '@/lib/charucoRenderer';
import { getA4BoardMetrics, checkPaperFit } from '@/lib/accuracy';

interface BoardPreviewProps {
  params: BoardParams;
  className?: string;
}

export default function BoardPreview({ params, className = '' }: BoardPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [accuracy, setAccuracy] = useState<{
    mmPerPx: number;
    pxPerMm: number;
    fitsA4: boolean;
    fitsA3: boolean;
  } | null>(null);

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
        showInfo: true,
        showScale: true,
      });

      // Draw the result canvas onto our visible canvas
      ctx.drawImage(result.canvas, 0, 0);

      // Update accuracy info
      const metrics = getA4BoardMetrics(
        params.squaresX,
        params.squaresY,
        params.squareLength,
        params.margin,
      );
      setAccuracy({
        mmPerPx: result.mmPerPx,
        pxPerMm: result.pxPerMm,
        fitsA4: metrics.fitsA4,
        fitsA3: metrics.fitsA3,
      });
    } catch (err) {
      console.error('Render error:', err);
    }
  }, [params]);

  const phys = getBoardPhysicalSize(params);
  const corners = getCornerCount(params);
  const paperDims = getPaperSize(params.paperSize, params.orientation, params.customWidth, params.customHeight);
  const fit = checkPaperFit(params, paperDims);

  return (
    <div className={`flex flex-col ${className}`}>
      <div
        ref={containerRef}
        className="flex-1 min-h-[300px] rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden"
      >
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* Board Info + Accuracy */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3 py-2">
          <span className="text-zinc-500 dark:text-zinc-400">Board</span>
          <p className="font-semibold text-zinc-800 dark:text-zinc-200">
            {params.squaresX} × {params.squaresY}
          </p>
        </div>
        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3 py-2">
          <span className="text-zinc-500 dark:text-zinc-400">Corners</span>
          <p className="font-semibold text-zinc-800 dark:text-zinc-200">{corners}</p>
        </div>
        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3 py-2">
          <span className="text-zinc-500 dark:text-zinc-400">Size</span>
          <p className="font-semibold text-zinc-800 dark:text-zinc-200">
            {formatDimension(phys.width, params.unit)} ×{' '}
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

      {/* Accuracy details — shown only after first render */}
      {accuracy && (
        <div className="mt-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">Accuracy Check</span>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
            <span className="text-zinc-700 dark:text-zinc-300">
              1px = <strong>{accuracy.mmPerPx.toFixed(4)}mm</strong>
            </span>
            <span className="text-zinc-700 dark:text-zinc-300">
              <strong>{accuracy.pxPerMm.toFixed(1)}</strong> px/mm
            </span>
            <span
              className={`font-semibold ${
                accuracy.fitsA4
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {accuracy.fitsA4 ? '✓ Fits A4' : '✗ Exceeds A4'}
            </span>
            {accuracy.fitsA3 && !accuracy.fitsA4 && (
              <span className="font-semibold text-green-600 dark:text-green-400">
                ✓ Fits A3
              </span>
            )}
          </div>
        </div>
      )}

      {/* Paper Fit Warning */}
      <div className={`mt-2 px-3 py-2 rounded-lg text-xs font-medium ${
        fit.fits
          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
          : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
      }`}>
        {fit.fits
          ? `✅ Board fits ${params.paperSize} at 1:1 scale (${fit.boardWidthMm}×${fit.boardHeightMm}mm within ${fit.pageWidthMm}×${fit.pageHeightMm}mm)`
          : `❌ Board ${fit.boardWidthMm}×${fit.boardHeightMm}mm is too large for ${params.paperSize} (${fit.pageWidthMm}×${fit.pageHeightMm}mm). ${fit.scaleNeeded < 1 ? `Will be scaled by ${(fit.scaleNeeded * 100).toFixed(0)}%.` : 'Try a larger paper size.'}`
        }
      </div>
    </div>
  );
}
