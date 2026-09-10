# Contributing

Thanks for helping make generated boards *actually* detectable. 🎯

## How to contribute

1. Fork the repo and create a branch: `git checkout -b fix/short-description`
2. Make focused changes (one concern per PR)
3. Add/extend tests: `npm test` must stay green
4. Open a PR against `master` using the PR template

## Rules that matter here

- **`lib/arucoDictData.ts` is auto-generated — never edit it by hand.**
  Regenerate with `python scripts/extract_aruco_dicts.py` (needs `opencv-python`).
- **Any change to marker rendering must keep the OpenCV e2e tests green:**
  `npm test -- lib/__tests__/opencvCompat.test.ts` (needs `opencv-python` + `numpy`).
- Keep physical accuracy: 1:1 print size is sacred. Changes affecting
  dimensions need a test in `lib/__tests__/boardDimensions.test.ts`.
- Follow the existing code style (TypeScript strict, ESLint clean).

## Reporting bugs

- Marker not detected by OpenCV? Include: dictionary, marker id, board params,
  your OpenCV version, and ideally the exported SVG/PNG.
- Wrong print size? Include: paper size, orientation, measured vs expected mm.

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # fast unit tests
npm run build   # production build
```
