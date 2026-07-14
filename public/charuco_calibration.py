#!/usr/bin/env python3
"""
charuco_calibration.py — ChArUco Camera Calibration
OpenCV >= 4.7, Python >= 3.8

Usage:
    python charuco_calibration.py --images ./calib_images/ --square_length 25.0
    python charuco_calibration.py --images ./calib_images/ --square_length 25.0 --sample test.jpg
    python charuco_calibration.py --images ./stereo_pairs/ --square_length 25.0 --stereo
"""
import numpy as np
import cv2
import argparse
import json
import sys
from pathlib import Path


# ─────────────────────────────────────────────
#  Argument parsing
# ─────────────────────────────────────────────


def parse_args():
    parser = argparse.ArgumentParser(description="ChArUco Camera Calibration")
    parser.add_argument("-i", "--images", type=str, required=True,
                        help="Path to calibration images (directory or glob pattern)")
    parser.add_argument("--squares_x", type=int, default=7,
                        help="Number of chessboard squares in X direction (default: 7)")
    parser.add_argument("--squares_y", type=int, default=5,
                        help="Number of chessboard squares in Y direction (default: 5)")
    parser.add_argument("--square_length", type=float, required=True,
                        help="Measured square side length in millimetres")
    parser.add_argument("--marker_length", type=float, default=None,
                        help="ArUco marker side length in mm (default: 0.6 * square_length)")
    parser.add_argument("--dictionary", type=str, default="DICT_6X6_250",
                        help="ArUco dictionary name (default: DICT_6X6_250)")
    parser.add_argument("-o", "--out", type=str, default="calibration_results",
                        help="Output basename (default: calibration_results)")
    parser.add_argument("--fix_principal_point", action="store_true",
                        help="Fix principal point at image centre during calibration")
    parser.add_argument("--sample", type=str, default=None,
                        help="Path to a sample image to undistort after calibration")
    parser.add_argument("--stereo", action="store_true",
                        help="Enable stereo calibration (expects left/ and right/ subdirectories)")
    return parser.parse_args()


# ─────────────────────────────────────────────
#  ArUco dictionary helpers
# ─────────────────────────────────────────────


def get_aruco_dict(name: str):
    """Resolve an ArUco dictionary name to an OpenCV dictionary object."""
    dict_map = {
        "DICT_4X4_50": cv2.aruco.DICT_4X4_50,
        "DICT_4X4_100": cv2.aruco.DICT_4X4_100,
        "DICT_4X4_250": cv2.aruco.DICT_4X4_250,
        "DICT_4X4_1000": cv2.aruco.DICT_4X4_1000,
        "DICT_5X5_50": cv2.aruco.DICT_5X5_50,
        "DICT_5X5_100": cv2.aruco.DICT_5X5_100,
        "DICT_5X5_250": cv2.aruco.DICT_5X5_250,
        "DICT_5X5_1000": cv2.aruco.DICT_5X5_1000,
        "DICT_6X6_50": cv2.aruco.DICT_6X6_50,
        "DICT_6X6_100": cv2.aruco.DICT_6X6_100,
        "DICT_6X6_250": cv2.aruco.DICT_6X6_250,
        "DICT_6X6_1000": cv2.aruco.DICT_6X6_1000,
        "DICT_7X7_50": cv2.aruco.DICT_7X7_50,
        "DICT_7X7_100": cv2.aruco.DICT_7X7_100,
        "DICT_7X7_250": cv2.aruco.DICT_7X7_250,
        "DICT_7X7_1000": cv2.aruco.DICT_7X7_1000,
        "DICT_ARUCO_ORIGINAL": cv2.aruco.DICT_ARUCO_ORIGINAL,
    }
    if name not in dict_map:
        print(f"[WARN] Unknown dictionary '{name}'. Falling back to DICT_6X6_250.")
        name = "DICT_6X6_250"
    return cv2.aruco.getPredefinedDictionary(dict_map[name])


# ─────────────────────────────────────────────
#  Image loading
# ─────────────────────────────────────────────


def load_images(path_pattern: str):
    """Load a sorted list of image Paths from a directory or glob pattern."""
    path = Path(path_pattern)
    if path.is_dir():
        patterns = ["*.jpg", "*.jpeg", "*.png", "*.bmp", "*.tiff"]
        files = []
        for p in patterns:
            files.extend(sorted(path.glob(p)))
            files.extend(sorted(path.glob(p.upper())))
    else:
        files = sorted(Path(".").parent.glob(path_pattern))

    if not files:
        print(f"[ERROR] No images found matching: {path_pattern}")
        sys.exit(1)

    print(f"[INFO] Found {len(files)} image(s)")
    return files


# ─────────────────────────────────────────────
#  ChArUco detection
# ─────────────────────────────────────────────


def detect_charuco_board(images, dictionary, board):
    """Detect ChArUco corners in every image.

    Returns:
        all_corners: list of detected chessboard corner arrays
        all_ids: list of corresponding corner ID arrays
        valid_indices: indices into *images* that passed detection
    """
    all_corners = []
    all_ids = []
    valid_indices = []
    detector_params = cv2.aruco.DetectorParameters()

    for idx, img_path in enumerate(images):
        img = cv2.imread(str(img_path))
        if img is None:
            print(f"  [SKIP] Cannot read: {img_path.name}")
            continue

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        marker_corners, marker_ids, _ = cv2.aruco.detectMarkers(
            gray, dictionary, parameters=detector_params
        )

        if marker_ids is None or len(marker_ids) < 4:
            print(f"  [SKIP] {img_path.name}: only {0 if marker_ids is None else len(marker_ids)} markers detected")
            continue

        # Attempt to refine markers using the full board layout
        cv2.aruco.refineDetectedMarkers(gray, board, marker_corners, marker_ids)

        # Interpolate chessboard corners from the detected markers
        charuco_corners, charuco_ids = cv2.aruco.interpolateCornersCharuco(
            marker_corners, marker_ids, gray, board
        )

        if charuco_ids is None or len(charuco_ids) < 4:
            print(f"  [SKIP] {img_path.name}: too few ChArUco corners ({0 if charuco_ids is None else len(charuco_ids)})")
            continue

        all_corners.append(charuco_corners)
        all_ids.append(charuco_ids)
        valid_indices.append(idx)
        print(f"  [OK]   {img_path.name}: {len(charuco_ids)} corners, {len(marker_ids)} markers")

    if len(all_corners) < 5:
        print(f"\n[ERROR] Only {len(all_corners)} valid view(s) — need at least 5. Add more images.")
        sys.exit(1)

    return all_corners, all_ids, valid_indices


# ─────────────────────────────────────────────
#  Mono calibration
# ─────────────────────────────────────────────


def run_calibration(all_corners, all_ids, board, image_size, fix_principal_point=False):
    """Run ChArUco-based camera calibration.

    Returns:
        (rms_error, camera_matrix, distortion_coefficients, rvecs, tvecs)
    """
    flags = 0
    if fix_principal_point:
        flags |= cv2.CALIB_FIX_PRINCIPAL_POINT

    print(f"\n[INFO] Running calibration with {len(all_corners)} view(s) ...")
    ret, mtx, dist, rvecs, tvecs = cv2.aruco.calibrateCameraCharuco(
        all_corners, all_ids, board, image_size, None, None, flags=flags
    )
    print(f"[INFO] RMS reprojection error: {ret:.4f} pixels\n")
    return ret, mtx, dist, rvecs, tvecs


# ─────────────────────────────────────────────
#  Per-view reprojection error
# ─────────────────────────────────────────────


def compute_per_view_errors(all_corners, all_ids, rvecs, tvecs, mtx, dist, board):
    """Compute the mean reprojection error for each individual view."""
    errors = []
    for i in range(len(all_corners)):
        img_points = all_corners[i].reshape(-1, 2)
        # get object points for the detected ChArUco corners
        _, obj_points, _ = board.matchImagePoints(all_corners[i], all_ids[i])

        projected, _ = cv2.projectPoints(obj_points, rvecs[i], tvecs[i], mtx, dist)
        projected = projected.reshape(-1, 2)

        error = float(np.sqrt(np.mean(np.sum((img_points - projected) ** 2, axis=1))))
        errors.append(error)
    return errors


# ─────────────────────────────────────────────
#  Saving results
# ─────────────────────────────────────────────


def save_results_json(ret, mtx, dist, rvecs, tvecs, image_size, out_path):
    """Save calibration results as a human-readable JSON file."""
    data = {
        "rms_error": float(ret),
        "image_size": list(image_size),
        "camera_matrix": mtx.tolist(),
        "distortion_coefficients": dist.tolist(),
        "per_view_errors": [],
    }
    with open(out_path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"[SAVE] {out_path}")


def save_results_xml(ret, mtx, dist, image_size, out_path):
    """Save calibration results as an OpenCV-compatible XML / YAML file."""
    fs = cv2.FileStorage(out_path, cv2.FILE_STORAGE_WRITE)
    fs.write("rms_error", ret)
    fs.write("image_width", image_size[0])
    fs.write("image_height", image_size[1])
    fs.write("camera_matrix", mtx)
    fs.write("distortion_coefficients", dist)
    fs.release()
    print(f"[SAVE] {out_path}")


# ─────────────────────────────────────────────
#  Visualisation
# ─────────────────────────────────────────────


def visualize_results(images, all_corners, all_ids, valid_indices,
                      mtx, dist, calib_indices, rvecs, tvecs, board, out_dir):
    """Draw detected corners and board axes onto each valid image."""
    viz_dir = out_dir / "visualisations"
    viz_dir.mkdir(parents=True, exist_ok=True)

    for i, img_idx in enumerate(valid_indices):
        if i >= len(calib_indices):
            break
        img = cv2.imread(str(images[img_idx]))
        if img is None:
            continue

        # Draw ChArUco detected corners
        cv2.aruco.drawDetectedCornersCharuco(img, all_corners[i], all_ids[i])
        # Draw a coordinate frame on the board
        cv2.drawFrameAxes(img, mtx, dist, rvecs[i], tvecs[i], 0.03)

        out_file = viz_dir / f"frame_{img_idx:03d}.jpg"
        cv2.imwrite(str(out_file), img)

    print(f"[SAVE] Visualisations → {viz_dir}/")


# ─────────────────────────────────────────────
#  Undistort a sample image
# ─────────────────────────────────────────────


def undistort_sample(sample_path: str, mtx, dist, out_dir: Path):
    """Undistort a sample image and save the result."""
    img = cv2.imread(sample_path)
    if img is None:
        print(f"[ERROR] Cannot read sample image: {sample_path}")
        return

    h, w = img.shape[:2]
    new_mtx, roi = cv2.getOptimalNewCameraMatrix(mtx, dist, (w, h), 1, (w, h))

    # Method A — one-shot undistort
    undistorted = cv2.undistort(img, mtx, dist, None, new_mtx)
    x, y, w_roi, h_roi = roi
    if w_roi > 0 and h_roi > 0:
        undistorted = undistorted[y: y + h_roi, x: x + w_roi]
    cv2.imwrite(str(out_dir / "undistorted_sample.jpg"), undistorted)

    # Method B — remap (useful for video pipelines)
    map_x, map_y = cv2.initUndistortRectifyMap(
        mtx, dist, None, new_mtx, (w, h), cv2.CV_32FC1
    )
    remapped = cv2.remap(img, map_x, map_y, cv2.INTER_LINEAR)
    cv2.imwrite(str(out_dir / "undistorted_remap_sample.jpg"), remapped)

    print(f"[SAVE] Undistorted samples → {out_dir}/")
    print(f"[INFO] New camera matrix (alpha=1):\n{new_mtx}")


# ─────────────────────────────────────────────
#  Stereo calibration
# ─────────────────────────────────────────────


def stereo_calibrate(images_dir: Path, board, dictionary, out_dir: Path):
    """Run stereo calibration using matching image pairs from left/ and right/ dirs."""
    left_dir = images_dir / "left"
    right_dir = images_dir / "right"

    if not left_dir.is_dir() or not right_dir.is_dir():
        print("[ERROR] Stereo mode requires 'left/' and 'right/' subdirectories inside --images.")
        sys.exit(1)

    left_images = load_images(str(left_dir))
    right_images = load_images(str(right_dir))

    print(f"\n[STEREO] {len(left_images)} left / {len(right_images)} right image(s)")

    # Detect independently
    left_corners, left_ids, left_idx = detect_charuco_board(left_images, dictionary, board)
    right_corners, right_ids, right_idx = detect_charuco_board(right_images, dictionary, board)

    # Pair images that succeeded in both sides
    paired = sorted(set(left_idx) & set(right_idx))
    print(f"[STEREO] {len(paired)} stereo pair(s) with valid detections")

    if len(paired) < 3:
        print(f"[ERROR] Only {len(paired)} stereo pair(s) — need at least 3.")
        sys.exit(1)

    # Gather matched corners / IDs
    left_matched = [left_corners[left_idx.index(p)] for p in paired]
    left_ids_matched = [left_ids[left_idx.index(p)] for p in paired]
    right_matched = [right_corners[right_idx.index(p)] for p in paired]
    right_ids_matched = [right_ids[right_idx.index(p)] for p in paired]

    # Build object-point list
    object_points = []
    for i in range(len(paired)):
        _, obj_pts, _ = board.matchImagePoints(left_matched[i], left_ids_matched[i])
        object_points.append(obj_pts)

    # Stereo calibrate (fix intrinsic = already known per-monocular calibration)
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 1e-5)
    flags = cv2.CALIB_FIX_INTRINSIC
    ret, _, _, _, _, R, T, E, F = cv2.stereoCalibrate(
        object_points, left_matched, right_matched,
        None, None, None, None, (0, 0),
        criteria=criteria, flags=flags,
    )

    print(f"\n[STEREO] RMS reprojection error: {ret:.4f} pixels")
    print(f"[STEREO] Rotation matrix:\n{R}")
    print(f"[STEREO] Translation vector:\n{T}")

    # Stereo rectify
    cv2.stereoRectify(None, None, None, None, (0, 0), R, T, alpha=0)

    # Save
    stereo_out = out_dir / "stereo_calibration.json"
    data = {
        "rms_error": float(ret),
        "rotation_matrix": R.tolist(),
        "translation_vector": T.tolist(),
        "essential_matrix": E.tolist(),
        "fundamental_matrix": F.tolist(),
    }
    with open(stereo_out, "w") as f:
        json.dump(data, f, indent=2)
    print(f"[SAVE] {stereo_out}")

    return ret, R, T, E, F


# ─────────────────────────────────────────────
#  Main entry point
# ─────────────────────────────────────────────


def main():
    args = parse_args()

    images_dir = Path(args.images)
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    # Board geometry (convert mm to metres for OpenCV)
    squares_x = args.squares_x
    squares_y = args.squares_y
    square_length = args.square_length / 1000.0

    marker_length = args.marker_length
    if marker_length is None:
        marker_length = square_length * 0.6
    else:
        marker_length = marker_length / 1000.0

    dictionary = get_aruco_dict(args.dictionary)
    board = cv2.aruco.CharucoBoard(
        (squares_x, squares_y),
        square_length,
        marker_length,
        dictionary,
    )

    # Display board info
    print(f"\n{'='*60}")
    print(f"ChArUco Board: {squares_x}×{squares_y}")
    print(f"Square size : {args.square_length:.1f} mm")
    mrk = args.marker_length if args.marker_length else args.square_length * 0.6
    print(f"Marker size : {mrk:.1f} mm")
    print(f"Dictionary  : {args.dictionary}")
    print(f"{'='*60}\n")

    # ── Stereo mode ──
    if args.stereo:
        stereo_calibrate(images_dir, board, dictionary, out_dir)
        return

    # ── Mono calibration ──
    images = load_images(str(images_dir))
    all_corners, all_ids, valid_indices = detect_charuco_board(
        images, dictionary, board
    )

    # Determine image size from the first valid image
    first_img = cv2.imread(str(images[valid_indices[0]]))
    image_size = (first_img.shape[1], first_img.shape[0])

    # Run calibration
    ret, mtx, dist, rvecs, tvecs = run_calibration(
        all_corners, all_ids, board, image_size, args.fix_principal_point
    )

    # ── Per-view error ──
    errors = compute_per_view_errors(
        all_corners, all_ids, rvecs, tvecs, mtx, dist, board
    )
    print("Per-view reprojection errors:")
    print(f"  {'idx':>4s}  {'file':30s}  {'error':>8s}")
    print(f"  {'─'*4}  {'─'*30}  {'─'*8}")
    for i, (orig_idx, err) in enumerate(zip(valid_indices, errors)):
        warn = " ← HIGH" if err > 0.8 else ""
        print(f"  [{i:2d}]  {images[orig_idx].name:30s}  {err:.4f}{warn}")
    print()

    # ── Summary ──
    fx, fy = mtx[0, 0], mtx[1, 1]
    cx, cy = mtx[0, 2], mtx[1, 2]

    print(f"{'─'*40}")
    print(f"Camera matrix:\n{mtx}")
    print(f"\nDistortion coefficients (k1 k2 p1 p2 k3):")
    print(f"  {dist.ravel()}")
    print(f"\nFocal length   : fx = {fx:.2f}, fy = {fy:.2f}")
    print(f"Principal point: cx = {cx:.2f}, cy = {cy:.2f}")
    print(f"Image size     : {image_size[0]} × {image_size[1]}")
    print(f"{'─'*40}\n")

    # ── Sanity checks ──
    print("--- Sanity Checks ---")
    sane_fx = image_size[0] * 0.5 < fx < image_size[0] * 5
    print(f"  {'[✓]' if sane_fx else '[⚠]'} Focal length X {'looks reasonable' if sane_fx else 'seems unusual'} "
          f"({fx:.0f}, range [{image_size[0]*0.5:.0f} – {image_size[0]*5:.0f}])")
    sane_cx = abs(cx - image_size[0] / 2) < image_size[0] * 0.2
    print(f"  {'[✓]' if sane_cx else '[⚠]'} Principal point X {'near centre' if sane_cx else 'far from centre'} "
          f"(cx={cx:.0f}, centre={image_size[0]/2:.0f})")
    sane_cy = abs(cy - image_size[1] / 2) < image_size[1] * 0.2
    print(f"  {'[✓]' if sane_cy else '[⚠]'} Principal point Y {'near centre' if sane_cy else 'far from centre'} "
          f"(cy={cy:.0f}, centre={image_size[1]/2:.0f})")

    if ret < 0.3:
        print(f"  [✓] RMS error is excellent ({ret:.4f} < 0.3 px)")
    elif ret < 0.5:
        print(f"  [✓] RMS error is good ({ret:.4f} < 0.5 px)")
    elif ret < 0.8:
        print(f"  [~] RMS error is acceptable ({ret:.4f} < 0.8 px)")
    else:
        print(f"  [⚠] RMS error is high ({ret:.4f} >= 0.8 px) — consider adding/improving images")
    print()

    # ── Save ──
    json_path = out_dir / f"{args.out}.json"
    xml_path = out_dir / f"{args.out}.xml"
    save_results_json(ret, mtx, dist, rvecs, tvecs, image_size, json_path)
    save_results_xml(ret, mtx, dist, image_size, xml_path)

    # ── Visualise ──
    visualize_results(
        images, all_corners, all_ids, valid_indices,
        mtx, dist, list(range(len(all_corners))),
        rvecs, tvecs, board, out_dir,
    )

    # ── Undistort sample ──
    if args.sample:
        undistort_sample(args.sample, mtx, dist, out_dir)

    print(f"\n[INFO] All results saved to: {out_dir.resolve()}")
    print("[INFO] Done.")


if __name__ == "__main__":
    main()
