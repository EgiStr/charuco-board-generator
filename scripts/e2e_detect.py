#!/usr/bin/env python3
"""e2e_detect.py — helper for the vitest OpenCV compatibility test.

Usage:
    python scripts/e2e_detect.py marker <pgm_path> <DICT_NAME>
        -> prints JSON list of detected marker ids
    python scripts/e2e_detect.py board <svg_path> <DICT_NAME> <SX> <SY> <SL> <ML>
        -> prints JSON {"ids": [...], "charucoCorners": N}

Requires: opencv-python, cairosvg (for SVG rasterisation).
"""
import json
import sys


def _get_dict(name: str):
    import cv2

    return cv2.aruco.getPredefinedDictionary(getattr(cv2.aruco, name))


def detect_marker(pgm_path: str, dict_name: str):
    import cv2

    d = _get_dict(dict_name)
    img = cv2.imread(pgm_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise SystemExit(f"cannot read {pgm_path}")
    det = cv2.aruco.ArucoDetector(d, cv2.aruco.DetectorParameters())
    _, ids, _ = det.detectMarkers(img)
    print(json.dumps([] if ids is None else sorted(int(i) for i in ids.flatten())))


def detect_board(svg_path: str, dict_name: str, sx: int, sy: int, sl: float, ml: float):
    import cv2
    import numpy as np

    d = _get_dict(dict_name)
    img = _rasterise_svg_rects(svg_path, px_per_mm=10.0)
    board = cv2.aruco.CharucoBoard((sx, sy), sl, ml, d)
    detector = cv2.aruco.CharucoDetector(board)
    charuco_corners, charuco_ids, marker_corners, marker_ids = detector.detectBoard(img)
    print(json.dumps({
        "ids": [] if marker_ids is None else sorted(int(i) for i in marker_ids.flatten()),
        "charucoCorners": 0 if charuco_ids is None else len(charuco_ids),
    }))


def _rasterise_svg_rects(svg_path: str, px_per_mm: float = 10.0):
    """Rasterise the website's pureBoard SVG with numpy only (no cairo needed).

    The SVG uses mm user-units with axis-aligned <rect> fills (plus thin
    fill='none' stroke rects for marker/outer borders). Faithful enough for
    detector verification: every painted pixel comes from the actual SVG.
    """
    import re
    import numpy as np

    src = open(svg_path, encoding="utf-8").read()
    m = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', src)
    if not m:
        raise SystemExit("no viewBox in SVG")
    w_mm, h_mm = float(m.group(1)), float(m.group(2))
    W, H = int(round(w_mm * px_per_mm)), int(round(h_mm * px_per_mm))
    img = np.full((H, W), 255, dtype=np.uint8)

    for tag in re.finditer(r"<rect ([^>]*)/?>", src):
        attrs = dict(re.findall(r'(\w[\w-]*)="([^"]*)"', tag.group(1)))
        fill = attrs.get("fill", "none")
        x = int(round(float(attrs.get("x", 0)) * px_per_mm))
        y = int(round(float(attrs.get("y", 0)) * px_per_mm))
        w = int(round(float(attrs.get("width", 0)) * px_per_mm))
        h = int(round(float(attrs.get("height", 0)) * px_per_mm))
        x1, y1 = min(x + w, W), min(y + h, H)
        if x1 <= x or y1 <= y:
            continue
        if fill.lower() == "#000000":
            img[y:y1, x:x1] = 0
        elif attrs.get("stroke", "none").lower() == "#000000":
            sw = max(1, int(round(float(attrs.get("stroke-width", 0.5)) * px_per_mm)))
            img[y:y + sw, x:x1] = 0
            img[y1 - sw:y1, x:x1] = 0
            img[y:y1, x:x + sw] = 0
            img[y:y1, x1 - sw:x1] = 0
    return img


if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "marker":
        detect_marker(sys.argv[2], sys.argv[3])
    elif mode == "board":
        detect_board(sys.argv[2], sys.argv[3], int(sys.argv[4]),
                     int(sys.argv[5]), float(sys.argv[6]), float(sys.argv[7]))
    else:
        raise SystemExit(f"unknown mode {mode}")
