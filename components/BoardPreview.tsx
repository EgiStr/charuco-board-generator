'use client';

import { useEffect, useRef } from 'react';
import { BoardParams, getCornerCount, getBoardPhysicalSize, formatDimension } from '@/lib/utils';
import { renderCharucoBoard } from '@/lib/charucoRenderer';

interface BoardPreviewProps {
  params: BoardParams;
  className?: string;
}

export default function BoardPreview({ params, className = '' }: BoardPreviewProps) {
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
        showInfo: true,
      });

      // Draw the result canvas onto our visible canvas
      ctx.drawImage(result.canvas, 0, 0);
    } catch (err) {
      console.error('Render error:', err);
    }
  }, [params]);

  const phys = getBoardPhysicalSize(params);
  const corners = getCornerCount(params);

  return (
    <div className={`flex flex-col ${className}`}>
      <div
        ref={containerRef}
        className="flex-1 min-h-[300px] rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
      </div>

      {/* Board Info */}
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
            {formatDimension(phys.width, params.unit)} × {formatDimension(phys.height, params.unit)}
          </p>
        </div>
        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3 py-2">
          <span className="text-zinc-500 dark:text-zinc-400">Dict</span>
          <p className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono text-[10px] truncate">
            {params.dictionary}
          </p>
        </div>
      </div>
    </div>
  );
}
