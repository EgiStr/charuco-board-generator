# ChArUco Board Generator

Generate **printable, OpenCV-compatible ChArUco calibration boards** — right from the browser.
Pick board size, dictionary, and paper; export print-accurate **PDF**, **PNG**, or true-vector **SVG**.

![OpenCV compatible](https://img.shields.io/badge/OpenCV-compatible-6X6_250-brightgreen)
![CI](https://github.com/EgiStr/charuco-board-generator/actions/workflows/ci.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

> **Why this exists:** an earlier version of this generator produced marker bit patterns that
> *looked* right but **failed `cv2.aruco` detection** — the `bytesList` rows were read as
> strided columns and the bit polarity was inverted. This repo now embeds the real OpenCV
> dictionary bytes and verifies every marker against the actual OpenCV detector in CI.
> Full story: [blog post](https://www.eggisatria.dev/blog) *(link coming soon)*.

## Features

- 📷 **OpenCV-compatible output** — markers generated from real OpenCV 5.x `bytesList` data
  (all 16 predefined dictionaries: 4×4 → 7×7), verified with `cv2.aruco.ArucoDetector` in tests
- 🖨️ **Print-accurate export** — PDF/PNG at 300 DPI, true-vector SVG in millimetre units
- 📐 **Paper-aware** — A4/A3/A2/A1 + custom sizes, portrait/landscape, 1:1 fit checking,
  "fill paper" auto-sizing
- 🧪 **Tested** — 220+ vitest tests, incl. end-to-end detection against real OpenCV
- 🌗 Dark mode, 🇬🇧/🇮🇩 bilingual UI, shareable board URLs

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm test         # unit tests (fast)
npm run build    # production build
```

### End-to-end OpenCV check (optional, needs Python + OpenCV)

```bash
pip install opencv-python numpy
npm test -- lib/__tests__/opencvCompat.test.ts
```

This renders the website's own markers/board and runs them through the real
`cv2.aruco.ArucoDetector` / `CharucoDetector` — 9/9 must pass.

### Regenerate dictionary data from your OpenCV install

```bash
pip install opencv-python
python scripts/extract_aruco_dicts.py   # rewrites lib/arucoDictData.ts
```

## How it works

```
OpenCV bytesList (CV_8UC4 rows)          Website renderer (1 = black)
        │                                           │
        ▼                                           ▼
scripts/extract_aruco_dicts.py ──► lib/arucoDictData.ts ──► lib/arucoDictionaries.ts
  (flatten row in C order,              (first floor(n/8) bytes        (getMarkerBits /
   rot0|rot1|rot2|rot3 blocks)           + LOW tail bits, invert         getMarkerImage /
                                         1=white → 1=black)             renderMarkerOnCanvas)
                                                                              │
                                              ┌───────────────────────────────┤
                                              ▼                               ▼
                                   lib/charucoRenderer.ts              lib/svgGenerator.ts
                                   (canvas → PNG/PDF)                  (true-vector SVG, mm units)
```

Key OpenCV facts the code relies on (verified against OpenCV 5.0.0 source +
`Dictionary_getBitsFromByteList`):
- `bytesList` is a `CV_8UC4` Mat: each marker row flattened in C order is
  `[rot0 | rot1 | rot2 | rot3]`, each rotation `ceil(nBits/8)` bytes.
- Bit `1` = **white**, `0` = **black**.
- For non-multiple-of-8 bit counts, the marker uses the **low** bits of the last byte.

## Calibration

After printing a board, calibrate with the bundled script
(`public/charuco_calibration.py`, also shown with a guide at `/calibration`):

```bash
python public/charuco_calibration.py --images ./calib_images/ --square_length 25.0
```

## Project structure

| Path | What |
|---|---|
| `app/` | Next.js pages (`/` generator, `/calibration` guide) |
| `components/` | UI: preview, parameter controls, presets, downloads |
| `lib/charucoRenderer.ts` | Canvas renderer (screen + exact-size print modes) |
| `lib/svgGenerator.ts` | True-vector SVG generator (mm units) |
| `lib/arucoDictionaries.ts` | Dictionary API + marker rendering |
| `lib/arucoDictData.ts` | **Auto-generated** OpenCV dictionary bytes (do not edit) |
| `lib/__tests__/` | Unit + OpenCV-compat end-to-end tests |
| `scripts/extract_aruco_dicts.py` | Extracts bytes from installed OpenCV → TS |
| `scripts/e2e_detect.py` | Test helper: runs website output through real OpenCV |
| `public/charuco_calibration.py` | Camera calibration script |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Bug reports with a failing OpenCV
reproduction are especially welcome — see [SECURITY.md](SECURITY.md) for
reporting sensitive issues.

## License

[MIT](LICENSE) © 2026 Egi Satria
