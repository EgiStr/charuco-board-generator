'use client';

interface PaperReferenceProps {
  lang: 'en' | 'id';
}

export default function PaperReference({ lang }: PaperReferenceProps) {
  const T = {
    en: {
      title: '📐 Real-World Paper Size Reference',
      subtitle: 'Match your board configuration to the right paper for 1:1 printing',
      isoTable: 'ISO Standard Paper Sizes',
      size: 'Size',
      dimensions: 'Dimensions (mm)',
      dimensionsIn: 'Dimensions (in)',
      useCase: 'Best For',
      a4: 'A4',
      a4Dims: '210 × 297',
      a4In: '8.3 × 11.7',
      a4Use: 'Standard printing, small boards (<200mm)',
      a3: 'A3',
      a3Dims: '297 × 420',
      a3In: '11.7 × 16.5',
      a3Use: 'Medium boards, most ChArUco configs',
      a2: 'A2',
      a2Dims: '420 × 594',
      a2In: '16.5 × 23.4',
      a2Use: 'Large boards, conveyor-width coverage',
      a1: 'A1',
      a1Dims: '594 × 841',
      a1In: '23.4 × 33.1',
      a1Use: 'Extra large, multi-lane conveyor',
      boardTable: 'Recommended ChArUco Board Sizes',
      board: 'Board',
      square: 'Square',
      margin: 'Margin',
      boardSize: 'Board Size',
      bestPaper: 'Best Paper',
      atScale: 'At Scale',
      note: '💡 Tip: Print at 100% scale (no fit-to-page). Measure printed square with ruler to verify.',
    },
    id: {
      title: '📐 Referensi Ukuran Kertas Dunia Nyata',
      subtitle: 'Cocokkan konfigurasi board dengan kertas yang tepat untuk cetak 1:1',
      isoTable: 'Ukuran Kertas Standar ISO',
      size: 'Ukuran',
      dimensions: 'Dimensi (mm)',
      dimensionsIn: 'Dimensi (in)',
      useCase: 'Terbaik Untuk',
      a4: 'A4',
      a4Dims: '210 × 297',
      a4In: '8.3 × 11.7',
      a4Use: 'Cetak standar, board kecil (<200mm)',
      a3: 'A3',
      a3Dims: '297 × 420',
      a3In: '11.7 × 16.5',
      a3Use: 'Board sedang, kebanyakan konfig ChArUco',
      a2: 'A2',
      a2Dims: '420 × 594',
      a2In: '16.5 × 23.4',
      a2Use: 'Board besar, coverage lebar conveyor',
      a1: 'A1',
      a1Dims: '594 × 841',
      a1In: '23.4 × 33.1',
      a1Use: 'Sangat besar, multi-lane conveyor',
      boardTable: 'Ukuran Board ChArUco yang Direkomendasikan',
      board: 'Board',
      square: 'Kotak',
      margin: 'Margin',
      boardSize: 'Ukuran Board',
      bestPaper: 'Kertas Terbaik',
      atScale: 'Skala',
      note: '💡 Tip: Cetak di skala 100% (jangan fit-to-page). Ukur kotak cetakan dengan penggaris untuk verifikasi.',
    },
  };

  const t = T[lang];
  const PRINT_DPI = 300;
  const pxPerMm = PRINT_DPI / 25.4;

  const boardConfigs = [
    { board: '7×5', sq: 25, margin: 10, wMm: 7 * 25 + 20, hMm: 5 * 25 + 20 },
    { board: '9×6', sq: 25, margin: 10, wMm: 9 * 25 + 20, hMm: 6 * 25 + 20 },
    { board: '10×7', sq: 25, margin: 10, wMm: 10 * 25 + 20, hMm: 7 * 25 + 20 },
    { board: '11×8', sq: 20, margin: 10, wMm: 11 * 20 + 20, hMm: 8 * 20 + 20 },
    { board: '5×7', sq: 40, margin: 15, wMm: 5 * 40 + 30, hMm: 7 * 40 + 30 },
    { board: '8×6', sq: 30, margin: 10, wMm: 8 * 30 + 20, hMm: 6 * 30 + 20 },
    { board: '10×7', sq: 30, margin: 10, wMm: 10 * 30 + 20, hMm: 7 * 30 + 20 },
    { board: '13×9', sq: 25, margin: 15, wMm: 13 * 25 + 30, hMm: 9 * 25 + 30 },
  ];

  function bestPaper(w: number, h: number): string {
    const papers = [
      { name: 'A4', w: 210, h: 297 },
      { name: 'A3', w: 297, h: 420 },
      { name: 'A2', w: 420, h: 594 },
      { name: 'A1', w: 594, h: 841 },
    ];
    // Check portrait
    for (const p of papers) {
      if (w <= p.w && h <= p.h) return p.name + ' (portrait)';
    }
    // Check landscape
    for (const p of papers) {
      if (w <= p.h && h <= p.w) return p.name + ' (landscape)';
    }
    return 'A1+ (custom)';
  }

  function pxAt300dpi(mm: number): string {
    return (mm * pxPerMm).toFixed(0);
  }

  return (
    <div className="space-y-4 text-xs">
      <div>
        <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">{t.title}</h3>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">{t.subtitle}</p>
      </div>

      {/* ISO Paper Table */}
      <div>
        <h4 className="font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t.isoTable}</h4>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                <th className="px-3 py-2 font-medium">{t.size}</th>
                <th className="px-3 py-2 font-medium">{t.dimensions}</th>
                <th className="px-3 py-2 font-medium">{t.dimensionsIn}</th>
                <th className="px-3 py-2 font-medium">{t.useCase}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {[
                { name: t.a4, dims: t.a4Dims, dimsIn: t.a4In, use: t.a4Use, px: '2480×3508' },
                { name: t.a3, dims: t.a3Dims, dimsIn: t.a3In, use: t.a3Use, px: '3508×4961' },
                { name: t.a2, dims: t.a2Dims, dimsIn: t.a2In, use: t.a2Use, px: '4961×7016' },
                { name: t.a1, dims: t.a1Dims, dimsIn: t.a1In, use: t.a1Use, px: '7016×9921' },
              ].map((row) => (
                <tr key={row.name} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-3 py-2 font-semibold text-zinc-800 dark:text-zinc-200">{row.name}</td>
                  <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{row.dims}mm</td>
                  <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{row.dimsIn}&quot;</td>
                  <td className="px-3 py-2 text-zinc-500 dark:text-zinc-500">{row.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Board Config Reference */}
      <div>
        <h4 className="font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t.boardTable}</h4>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                <th className="px-3 py-2 font-medium">{t.board}</th>
                <th className="px-3 py-2 font-medium">{t.square}</th>
                <th className="px-3 py-2 font-medium">{t.margin}</th>
                <th className="px-3 py-2 font-medium">{t.boardSize}</th>
                <th className="px-3 py-2 font-medium">PX@300DPI</th>
                <th className="px-3 py-2 font-medium">{t.bestPaper}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {boardConfigs.map((cfg) => (
                <tr key={`${cfg.board}-${cfg.sq}`} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-3 py-2 font-semibold text-zinc-800 dark:text-zinc-200">{cfg.board}</td>
                  <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{cfg.sq}mm</td>
                  <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{cfg.margin}mm</td>
                  <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                    {cfg.wMm}&times;{cfg.hMm}mm
                  </td>
                  <td className="px-3 py-2 font-mono text-zinc-500 dark:text-zinc-500">
                    {pxAt300dpi(cfg.wMm)}&times;{pxAt300dpi(cfg.hMm)}
                  </td>
                  <td className="px-3 py-2 font-semibold text-green-600 dark:text-green-400">
                    {bestPaper(cfg.wMm, cfg.hMm)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 italic">{t.note}</p>
      </div>
    </div>
  );
}
