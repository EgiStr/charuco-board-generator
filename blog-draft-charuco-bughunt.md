# My ChArUco Board Looked Perfect — OpenCV Couldn't See a Single Marker

> Audience: computer-vision practitioners who print calibration boards | Takeaway: OpenCV's bytesList is a CV_8UC4 row-major store — index it as a strided column and every marker silently corrupts | Status: DRAFT — not for publication

## Problem

A user reported that boards from my ChArUco generator failed in OpenCV: `detectMarkers()` found nothing, even though the markers *looked* correct on screen and on paper. The generator embedded what it claimed were the exact OpenCV dictionary bytes, with 200+ passing tests.

The existing test suite was asserting the bug into permanence: exact-pattern regression vectors had been encoded from the broken extractor, so CI was green while every printed board was garbage.

## Approach

I treated it as a forensic bug-hunt, not a guess-and-patch:

1. **Firewall test first.** Rendered the website's marker 0 for DICT_6X6_250 and ran it through the real `cv2.aruco.ArucoDetector`. Result: `None` — zero markers detected. A corrected reconstruction detected `id 0`. That split the world cleanly: the bytes on screen were wrong, period.
2. **Compared against ground truth.** Used `cv2.aruco.Dictionary_getBitsFromByteList` and `generateImageMarker` as oracles for all 16 predefined dictionaries (4×4 → 7×7), checking every rotation block.
3. **Mapped the blast radius** before fixing: the extractor script, the generated data file, the TS decoder, the frozen test vectors, and sibling `Path(".").parent.glob` bugs in the calibration guide.

## What happened

Two root causes, both CONFIRMED with observed evidence:

**Root cause 1 — strided column read of a row-major store** (`scripts/extract_aruco_dicts.py`).
OpenCV's `bytesList` is a `CV_8UC4` Mat with shape `(nMarkers, bytesPerMarker, 4)`. Rotation *r*'s bytes are contiguous in linear row memory: `row.flatten() == [rot0 | rot1 | rot2 | rot3]`. The script indexed `bytes_list[m, b, r]` down the rotation column instead — producing transposed garbage for every marker in all 16 dictionaries. Evidence: regenerated DICT_6X6_250 marker 0 head is `[30, 61, 216, 42, 6]`; the old file stored `[30, 6, 49, 187, 198]`.

**Root cause 2 — inverted polarity + wrong tail-bit packing** (`extractMarkerBits`).
OpenCV convention is `1 = white` (verified in `generateImageMarker`); the website painted `1 = black`. And for bit counts that aren't multiples of 8 (25/36/49 bits), the marker occupies the **low** bits of the last byte — the code consumed from the wrong end.

Fix: flatten each marker row in C order, take `floor(n/8)` full bytes + low `n%8` bits, invert to the renderer's `1 = black` convention. Verified the rule holds for all 16 dictionaries × all markers × all 4 rotations (0 mismatches).

Numbers:
- Firewall: old marker 0 → undetected; fixed → detected as `id 0`.
- Pixel diff of a full 4×3 board vs `CharucoBoard.generateImage()`: **0 differing pixels** outside the website's cosmetic stroke lines (outer 0.5 + marker 0.2 outlines OpenCV doesn't draw).
- Full board through `CharucoDetector.detectBoard`: all 6 markers `ids [0..5]` + 6 ChArUco corners.
- Suite: **220/220 vitest green** (211 unit + 9 end-to-end against real OpenCV), `tsc` + `eslint` clean.
- Commits: `a15e049` on `master`, pushed to [EgiStr/charuco-board-generator](https://github.com/EgiStr/charuco-board-generator).

## Limits

- Verified on OpenCV **5.0.0** (`opencv-python`); the `CV_8UC4` layout also matches 4.x (`charuco_detector.cpp` / `aruco_dictionary.cpp`), but I did not re-run the matrix on 4.x.
- Pixel-identity claim covers DICT_4X4_50 4×3 explicitly; other sizes follow the same code path and per-marker e2e covers 4×4/5×5/6×6/7×7, but I didn't pixel-diff every combination.
- The guava-sorting accuracy anecdote in the earlier theory post is the user's domain story, not something I measured in this session.

## Next time

- Never freeze "known pattern" vectors without citing the oracle that produced them (now: `Dictionary_getBitsFromByteList`, OpenCV 5.0.0, noted in-test).
- Add the detector firewall test *before* any byte-level work — it took one render + one `detectMarkers` call to prove the bytes were wrong, while bit-gazing cost far longer.
- Treat "looks right on screen" as zero evidence for machine-readable output.

## Evidence

- Strided vs contiguous order — `scripts/extract_aruco_dicts.py` (fixed) + brute-force match script output: only contiguous-block + low-bit + inverted reconstruction matched drawn markers (session log, 2026-09-10).
- Polarity: `generateImageMarker` output vs official bits → `MATCH-INV rot0` (session log).
- Rule holds 16/16 dicts: `RULE HOLDS FOR ALL: True` (session log).
- Firewall: `WEBSITE marker0 -> None` vs `CORRECTED marker0 -> [0]` (session log).
- Pixel compare: `diff outside stroke lines: 0`, `detectBoard -> ids [0..5], 6 corners` (session log).
- Suite: `Test Files 4 passed, Tests 220 passed` (2026-09-10).
- Commit `a15e049`, repo https://github.com/EgiStr/charuco-board-generator.
- UNVERIFIED: print-shop dimensional accuracy (1:1 mm on physical paper) — needs caliper measurement on a real printout.
