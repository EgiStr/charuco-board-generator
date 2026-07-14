'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Copy, Check, Download, Camera, Ruler, Image as ImageIcon, Code, Table, BookOpen, Monitor, Printer } from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';

// ─── Bilingual content ───
const Content = {
  en: {
    navHome: 'Home',
    navCalibration: 'Calibration Guide',
    title: 'Camera Calibration Guide',
    subtitle: 'Step-by-step guide to calibrate your camera using ChArUco boards',
    // Section 1
    s1Title: 'What You Need',
    s1Items: [
      'ChArUco board (generate from the homepage)',
      'Camera to calibrate',
      'OpenCV (Python) installed — <code>pip install opencv-contrib-python</code>',
      'Good, even lighting',
    ],
    // Section 2
    s2Title: 'Step-by-Step Calibration',
    s2Steps: [
      {
        title: 'Step 1: Generate & Print the Board',
        icon: 'printer',
        details: [
          'Go to the homepage and generate your ChArUco board with your desired parameters.',
          'Choose a paper size (A4 or A3 recommended) and download the PDF.',
          'Print on matte paper (not glossy — glossy causes glare).',
          'Mount the print on a flat, rigid surface (acrylic sheet, aluminium composite, or thick cardboard).',
          'Measure the printed square side length with a ruler — <strong>do not trust the nominal value</strong>. Input the measured value during calibration.',
        ],
      },
      {
        title: 'Step 2: Capture Calibration Images',
        icon: 'camera',
        details: [
          'Take 10–15 photos of the board from different angles and positions.',
          'Cover the entire frame area, including edges and corners.',
          'Vary the tilt angle from 0° (frontal) up to about 45°.',
          'Rotate the board in all axes (pitch, yaw, roll).',
          'Ensure lighting is even — avoid strong shadows or highlights on the board.',
          'Save all images in a single folder (JPG or PNG).',
        ],
      },
      {
        title: 'Step 3: Run Calibration Script',
        icon: 'code',
        details: [
          'Download the Python script below (<code>charuco_calibration.py</code>).',
          'Open a terminal in the folder containing your images.',
          'Run:',
          '<pre class="bg-zinc-800 text-zinc-100 p-3 rounded-lg text-sm my-2 overflow-x-auto"><code>python charuco_calibration.py --images ./calib_images/ --square_length 25.0</code></pre>',
          'The script automatically detects the ChArUco board, runs calibration, and saves results.',
          'Output files: <code>calibration_results.json</code>, <code>calibration_results.xml</code>, and visualisations.',
        ],
      },
      {
        title: 'Step 4: Verify Results',
        icon: 'check',
        details: [
          'Check the RMS reprojection error in the output:',
          '• < 0.3 pixels — excellent',
          '• 0.3 – 0.5 pixels — good',
          '• 0.5 – 0.8 pixels — acceptable',
          '• > 0.8 pixels — retake images',
          'Verify focal length values are reasonable (e.g., ~fx = image_width × 1.2 for a typical webcam).',
          'Check the principal point (cx, cy) is near the image centre.',
          'Review the per-view reprojection errors plot to spot bad frames.',
          'If results are poor, add more images with better coverage and re-run.',
        ],
      },
      {
        title: 'Step 5: Use the Calibration',
        icon: 'monitor',
        details: [
          'Use the saved camera matrix and distortion coefficients in your application:',
          '<pre class="bg-zinc-800 text-zinc-100 p-3 rounded-lg text-sm my-2 overflow-x-auto"><code>import cv2 as cv\nimport numpy as np\n\n# Load calibration\nfs = cv.FileStorage("calibration_results.xml", cv.FILE_STORAGE_READ)\nmtx = fs.getNode("camera_matrix").mat()\ndist = fs.getNode("distortion_coefficients").mat()\nfs.release()\n\n# Undistort image\nimg = cv.imread("image.jpg")\nundistorted = cv.undistort(img, mtx, dist)</code></pre>',
          'Use the calibration for measurement (pixel-to-mm conversion), AR, or 3D reconstruction.',
          'Re-calibrate if the lens focus or zoom changes.',
        ],
      },
    ],
    // Section 3
    s3Title: 'Calibration Script',
    s3Desc: 'Below is the complete Python script. Download it or copy directly.',
    copyBtn: 'Copy Code',
    copied: 'Copied!',
    downloadScript: 'Download .py',
    downloadNotebook: 'Download .ipynb',
    // Section 4
    s4Title: 'Accuracy Reference',
    s4Desc: 'Recommended board configurations for different accuracy needs:',
    // Section 4 table headers
    s4Square: 'Square (mm)',
    s4A4: 'A4 fit?',
    s4A3: 'A3 fit?',
    s4BoardSize: 'Board size (mm)',
    s4Use: 'Recommended use',
    s4Rows: [
      { sq: '25', a4: true, a3: true, size: '175×125', use: 'High accuracy, close range' },
      { sq: '30', a4: true, a3: true, size: '180×120', use: 'Standard calibration' },
      { sq: '40', a4: true, a3: true, size: '200×120', use: 'Large board, balanced' },
      { sq: '50', a4: true, a3: true, size: '200×150', use: 'Webcam / far distance' },
    ],
    // Section 5
    s5Title: 'Downloads',
    s5Desc: 'Get the calibration script and Jupyter notebook for offline use.',
    // Tips
    tipsTitle: 'Tips for Best Results',
    tips: [
      'Use a board with at least 10×7 squares for best accuracy.',
      'Ensure the board is perfectly flat — mounting on glass or acrylic works best.',
      'Avoid motion blur — use a tripod or fast shutter speed.',
      'Capture images at the same resolution you will use in your application.',
      'Remove any images where the board is not fully visible.',
      'The square-to-marker ratio should be ~2:1 (default marker length = 0.6 × square length).',
    ],
    footer: 'ChArUco Board Generator — Camera Calibration Guide',
  },
  id: {
    navHome: 'Beranda',
    navCalibration: 'Panduan Kalibrasi',
    title: 'Panduan Kalibrasi Kamera',
    subtitle: 'Panduan langkah demi langkah untuk kalibrasi kamera menggunakan board ChArUco',
    s1Title: 'Yang Dibutuhkan',
    s1Items: [
      'Board ChArUco (generate dari halaman utama)',
      'Kamera yang akan dikalibrasi',
      'OpenCV (Python) terinstal — <code>pip install opencv-contrib-python</code>',
      'Pencahayaan yang baik dan merata',
    ],
    s2Title: 'Langkah-Langkah Kalibrasi',
    s2Steps: [
      {
        title: 'Langkah 1: Generate & Cetak Board',
        icon: 'printer',
        details: [
          'Buka halaman utama dan generate board ChArUco dengan parameter yang diinginkan.',
          'Pilih ukuran kertas (A4 atau A3 direkomendasikan) dan unduh PDF.',
          'Cetak di kertas matte (bukan glossy — glossy menyebabkan silau).',
          'Tempel cetakan di permukaan rata dan kaku (akrilik, aluminium komposit, atau karton tebal).',
          'Ukur panjang sisi square sebenarnya dengan penggaris — <strong>jangan gunakan nilai nominal</strong>. Masukkan nilai terukur saat kalibrasi.',
        ],
      },
      {
        title: 'Langkah 2: Ambil Foto Kalibrasi',
        icon: 'camera',
        details: [
          'Ambil 10–15 foto board dari berbagai sudut dan posisi.',
          'Cover seluruh area frame, termasuk tepi dan sudut.',
          'Variasikan kemiringan dari 0° (frontal) hingga sekitar 45°.',
          'Rotasi board di semua sumbu (pitch, yaw, roll).',
          'Pastikan pencahayaan merata — hindari bayangan atau sorotan kuat di board.',
          'Simpan semua gambar dalam satu folder (JPG atau PNG).',
        ],
      },
      {
        title: 'Langkah 3: Jalankan Script Kalibrasi',
        icon: 'code',
        details: [
          'Unduh script Python di bawah (<code>charuco_calibration.py</code>).',
          'Buka terminal di folder yang berisi gambar kalibrasi.',
          'Jalankan:',
          '<pre class="bg-zinc-800 text-zinc-100 p-3 rounded-lg text-sm my-2 overflow-x-auto"><code>python charuco_calibration.py --images ./calib_images/ --square_length 25.0</code></pre>',
          'Script akan mendeteksi board ChArUco secara otomatis, menjalankan kalibrasi, dan menyimpan hasil.',
          'File output: <code>calibration_results.json</code>, <code>calibration_results.xml</code>, dan visualisasi.',
        ],
      },
      {
        title: 'Langkah 4: Verifikasi Hasil',
        icon: 'check',
        details: [
          'Cek RMS reprojection error di output:',
          '• < 0.3 piksel — sangat baik',
          '• 0.3 – 0.5 piksel — baik',
          '• 0.5 – 0.8 piksel — cukup',
          '• > 0.8 piksel — ulangi pengambilan gambar',
          'Pastikan nilai focal length wajar (misal: ~fx = lebar_gambar × 1.2 untuk webcam umum).',
          'Periksa principal point (cx, cy) mendekati pusat gambar.',
          'Tinjau plot reprojection error per-view untuk mengidentifikasi frame yang buruk.',
          'Jika hasil kurang baik, tambah gambar dengan coverage lebih baik dan jalankan ulang.',
        ],
      },
      {
        title: 'Langkah 5: Gunakan Hasil Kalibrasi',
        icon: 'monitor',
        details: [
          'Gunakan camera matrix dan distortion coefficients yang tersimpan di aplikasi Anda:',
          '<pre class="bg-zinc-800 text-zinc-100 p-3 rounded-lg text-sm my-2 overflow-x-auto"><code>import cv2 as cv\nimport numpy as np\n\n# Load calibration\nfs = cv.FileStorage("calibration_results.xml", cv.FILE_STORAGE_READ)\nmtx = fs.getNode("camera_matrix").mat()\ndist = fs.getNode("distortion_coefficients").mat()\nfs.release()\n\n# Undistort image\nimg = cv.imread("image.jpg")\nundistorted = cv.undistort(img, mtx, dist)</code></pre>',
          'Gunakan kalibrasi untuk pengukuran (konversi piksel-ke-mm), AR, atau rekonstruksi 3D.',
          'Kalibrasi ulang jika fokus atau zoom lensa berubah.',
        ],
      },
    ],
    s3Title: 'Script Kalibrasi',
    s3Desc: 'Script Python lengkap di bawah. Unduh atau salin langsung.',
    copyBtn: 'Salin Kode',
    copied: 'Tersalin!',
    downloadScript: 'Unduh .py',
    downloadNotebook: 'Unduh .ipynb',
    s4Title: 'Referensi Akurasi',
    s4Desc: 'Konfigurasi board yang direkomendasikan untuk kebutuhan akurasi berbeda:',
    s4Square: 'Square (mm)',
    s4A4: 'Muat A4?',
    s4A3: 'Muat A3?',
    s4BoardSize: 'Ukuran board (mm)',
    s4Use: 'Penggunaan',
    s4Rows: [
      { sq: '25', a4: true, a3: true, size: '175×125', use: 'Akurasi tinggi, jarak dekat' },
      { sq: '30', a4: true, a3: true, size: '180×120', use: 'Kalibrasi standar' },
      { sq: '40', a4: true, a3: true, size: '200×120', use: 'Board besar, seimbang' },
      { sq: '50', a4: true, a3: true, size: '200×150', use: 'Webcam / jarak jauh' },
    ],
    s5Title: 'Unduhan',
    s5Desc: 'Dapatkan script kalibrasi dan Jupyter notebook untuk penggunaan offline.',
    tipsTitle: 'Tips Hasil Terbaik',
    tips: [
      'Gunakan board dengan minimal 10×7 square untuk akurasi terbaik.',
      'Pastikan board benar-benar datar — tempel di kaca atau akrilik untuk hasil optimal.',
      'Hindari motion blur — gunakan tripod atau shutter speed cepat.',
      'Ambil gambar pada resolusi yang sama dengan yang akan digunakan di aplikasi.',
      'Hapus gambar yang tidak menampilkan board secara penuh.',
      'Rasio square-to-marker sekitar 2:1 (panjang marker default = 0.6 × panjang square).',
    ],
    footer: 'Generator Board ChArUco — Panduan Kalibrasi Kamera',
  },
};

type StepIcon = 'printer' | 'camera' | 'code' | 'check' | 'monitor';

const stepIcons: Record<StepIcon, React.ReactNode> = {
  printer: <Printer className="w-5 h-5" />,
  camera: <Camera className="w-5 h-5" />,
  code: <Code className="w-5 h-5" />,
  check: <Check className="w-5 h-5" />,
  monitor: <Monitor className="w-5 h-5" />,
};

// ─── Python script source ───
const PYTHON_SCRIPT = `#!/usr/bin/env python3
"""
charuco_calibration.py — ChArUco Camera Calibration
OpenCV >= 4.7, Python >= 3.8
"""
import numpy as np
import cv2
import glob
import argparse
import json
import os
import sys
from pathlib import Path


def parse_args():
    parser = argparse.ArgumentParser(description="ChArUco Camera Calibration")
    parser.add_argument("-i", "--images", type=str, required=True,
                        help="Path to calibration images (dir or glob)")
    parser.add_argument("--squares_x", type=int, default=7,
                        help="Number of chessboard squares in X (default: 7)")
    parser.add_argument("--squares_y", type=int, default=5,
                        help="Number of chessboard squares in Y (default: 5)")
    parser.add_argument("--square_length", type=float, required=True,
                        help="Square side length in mm")
    parser.add_argument("--marker_length", type=float, default=None,
                        help="ArUco marker side length in mm (default: 0.6 * square_length)")
    parser.add_argument("--dictionary", type=str, default="DICT_6X6_250",
                        help="ArUco dictionary (default: DICT_6X6_250)")
    parser.add_argument("-o", "--out", type=str, default="calibration_results",
                        help="Output basename (default: calibration_results)")
    parser.add_argument("--fix_principal_point", action="store_true",
                        help="Fix principal point at image centre")
    parser.add_argument("--sample", type=str, default=None,
                        help="Sample image to undistort (optional)")
    parser.add_argument("--stereo", action="store_true",
                        help="Stereo calibration (requires left/right subdirs in --images)")
    return parser.parse_args()


def get_aruco_dict(name: str):
    """Resolve ArUco dictionary name to OpenCV object."""
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
        print(f"Unknown dictionary {name}. Using DICT_6X6_250.")
        name = "DICT_6X6_250"
    return cv2.aruco.getPredefinedDictionary(dict_map[name])


def load_images(path_pattern: str):
    """Load images from directory or glob pattern."""
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
        print(f"No images found at: {path_pattern}")
        sys.exit(1)
    print(f"Found {len(files)} images")
    return files


def detect_charuco_board(
    images, dictionary, board, squares_x, squares_y
):
    """Detect ChArUco corners in all images."""
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
            print(f"  [SKIP] {img_path.name}: only {0 if marker_ids is None else len(marker_ids)} markers")
            continue

        # Refine marker detection
        cv2.aruco.refineDetectedMarkers(
            gray, board, marker_corners, marker_ids
        )

        # Interpolate chessboard corners from markers
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
        print(f"\\nERROR: Only {len(all_corners)} valid views (need >= 5). Add more images.")
        sys.exit(1)

    return all_corners, all_ids, valid_indices


def run_calibration(
    all_corners, all_ids, board, image_size, fix_principal_point
):
    """Run ChArUco calibration."""
    flags = 0
    if fix_principal_point:
        flags |= cv2.CALIB_FIX_PRINCIPAL_POINT

    print(f"\\nRunning calibration with {len(all_corners)} views...")
    ret, mtx, dist, rvecs, tvecs = cv2.aruco.calibrateCameraCharuco(
        all_corners, all_ids, board, image_size, None, None, flags=flags
    )
    print(f"RMS reprojection error: {ret:.4f} pixels\\n")
    return ret, mtx, dist, rvecs, tvecs


def save_results_json(ret, mtx, dist, rvecs, tvecs, image_size, out_path):
    """Save calibration results as JSON."""
    data = {
        "rms_error": float(ret),
        "image_size": list(image_size),
        "camera_matrix": mtx.tolist(),
        "distortion_coefficients": dist.tolist(),
        "per_view_errors": [],
    }
    with open(out_path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Saved: {out_path}")


def save_results_xml(ret, mtx, dist, image_size, out_path):
    """Save calibration results as OpenCV XML."""
    fs = cv2.FileStorage(out_path, cv2.FILE_STORAGE_WRITE)
    fs.write("rms_error", ret)
    fs.write("image_width", image_size[0])
    fs.write("image_height", image_size[1])
    fs.write("camera_matrix", mtx)
    fs.write("distortion_coefficients", dist)
    fs.release()
    print(f"Saved: {out_path}")


def compute_per_view_errors(all_corners, all_ids, rvecs, tvecs, mtx, dist, board):
    """Compute reprojection error for each view."""
    errors = []
    for i in range(len(all_corners)):
        img_points = all_corners[i].reshape(-1, 2)
        obj_points = board.matchImagePoints(all_corners[i], all_ids[i])

        proj_points, _ = cv2.projectPoints(
            obj_points, rvecs[i], tvecs[i], mtx, dist
        )
        proj_points = proj_points.reshape(-1, 2)
        error = np.sqrt(np.mean(np.sum((img_points - proj_points) ** 2, axis=1)))
        errors.append(float(error))
    return errors


def visualize_results(
    images, all_corners, all_ids, valid_indices, mtx, dist,
    valid_calib_indices, rvecs, tvecs, board, out_dir
):
    """Draw detected corners and save visualisation images."""
    viz_dir = out_dir / "visualisations"
    viz_dir.mkdir(parents=True, exist_ok=True)

    for i, img_idx in enumerate(valid_indices):
        if i >= len(valid_calib_indices):
            break
        img = cv2.imread(str(images[img_idx]))
        if img is None:
            continue

        # Draw detected ChArUco corners
        cv2.aruco.drawDetectedCornersCharuco(
            img, all_corners[i], all_ids[i]
        )

        # Draw axes
        cv2.drawFrameAxes(
            img, mtx, dist, rvecs[i], tvecs[i], 0.03
        )

        out_file = viz_dir / f"frame_{img_idx:03d}.jpg"
        cv2.imwrite(str(out_file), img)

    print(f"Visualisations saved to: {viz_dir}/")


def undistort_sample(sample_path, mtx, dist, out_dir):
    """Undistort a sample image."""
    img = cv2.imread(sample_path)
    if img is None:
        print(f"Cannot read sample image: {sample_path}")
        return

    h, w = img.shape[:2]
    new_mtx, roi = cv2.getOptimalNewCameraMatrix(mtx, dist, (w, h), 1, (w, h))

    # Method 1: cv.undistort
    undistorted = cv2.undistort(img, mtx, dist, None, new_mtx)
    x, y, w_roi, h_roi = roi
    if w_roi > 0 and h_roi > 0:
        undistorted = undistorted[y : y + h_roi, x : x + w_roi]

    out_path = out_dir / "undistorted_sample.jpg"
    cv2.imwrite(str(out_path), undistorted)

    # Method 2: remap (for video)
    mapx, mapy = cv2.initUndistortRectifyMap(
        mtx, dist, None, new_mtx, (w, h), cv2.CV_32FC1
    )
    remapped = cv2.remap(img, mapx, mapy, cv2.INTER_LINEAR)
    remap_path = out_dir / "undistorted_remap_sample.jpg"
    cv2.imwrite(str(remap_path), remapped)

    print(f"Undistorted samples saved to: {out_dir}/")
    print(f"New camera matrix (with alpha=1):\\n{new_mtx}")


def stereo_calibrate(images_dir: Path, board, square_length, dictionary, out_dir):
    """Run stereo ChArUco calibration."""
    left_dir = images_dir / "left"
    right_dir = images_dir / "right"

    if not left_dir.is_dir() or not right_dir.is_dir():
        print("ERROR: Stereo mode requires 'left/' and 'right/' subdirectories.")
        sys.exit(1)

    left_images = load_images(str(left_dir))
    right_images = load_images(str(right_dir))

    print(f"\\nStereo calibration with {len(left_images)} left / {len(right_images)} right images")

    # Detect separately
    left_corners, left_ids, left_idx = detect_charuco_board(
        left_images, dictionary, board, board.getChessboardSize()[0], board.getChessboardSize()[1]
    )
    right_corners, right_ids, right_idx = detect_charuco_board(
        right_images, dictionary, board, board.getChessboardSize()[0], board.getChessboardSize()[1]
    )

    # Match pairs by index
    paired_indices = set(left_idx) & set(right_idx)
    if len(paired_indices) < 3:
        print(f"ERROR: Only {len(paired_indices)} matching stereo pairs (need >= 3).")
        sys.exit(1)

    paired_indices = sorted(paired_indices)
    left_matched = [left_corners[left_idx.index(i)] for i in paired_indices]
    left_ids_matched = [left_ids[left_idx.index(i)] for i in paired_indices]
    right_matched = [right_corners[right_idx.index(i)] for i in paired_indices]
    right_ids_matched = [right_ids[right_idx.index(i)] for i in paired_indices]

    # Get object points
    obj_points = []
    for i in range(len(paired_indices)):
        _, obj_pts, _ = board.matchImagePoints(left_corners_flat(left_matched[i], left_ids_matched[i]))
        obj_points.append(obj_pts)

    # Stereo calibration
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 1e-5)
    flags = cv2.CALIB_FIX_INTRINSIC
    ret, _, _, _, _, R, T, E, F = cv2.stereoCalibrate(
        obj_points,
        left_matched,
        right_matched,
        None, None, None, None,
        (0, 0),
        criteria=criteria,
        flags=flags,
    )

    print(f"\\nStereo RMS: {ret:.4f} pixels")
    print(f"Rotation matrix:\\n{R}")
    print(f"Translation vector:\\n{T}")

    # Stereo rectify
    R1, R2, P1, P2, Q, _, _ = cv2.stereoRectify(
        None, None, None, None, (0, 0), R, T, alpha=0
    )

    # Save stereo results
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
    print(f"\\nStereo results saved to: {stereo_out}")

    return ret, R, T, E, F


def left_corners_flat(corners, ids):
    """Helper to flatten charuco corners and return (corners_flat, ids_flat, obj_points)."""
    return corners, ids


def main():
    args = parse_args()

    # Resolve paths
    images_dir = Path(args.images)
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    # Board parameters
    squares_x = args.squares_x
    squares_y = args.squares_y
    square_length = args.square_length / 1000.0  # convert mm to metres
    marker_length = args.marker_length
    if marker_length is None:
        marker_length = square_length * 0.6
    else:
        marker_length = marker_length / 1000.0

    # Create dictionary and board
    dictionary = get_aruco_dict(args.dictionary)
    board = cv2.aruco.CharucoBoard(
        (squares_x, squares_y),
        square_length,
        marker_length,
        dictionary,
    )

    print(f"ChArUco board: {squares_x}x{squares_y}, "
          f"square={args.square_length}mm, marker={args.square_length * (0.6 if args.marker_length is None else args.marker_length / args.square_length):.1f}mm")
    print(f"Dictionary: {args.dictionary}")
    print()

    if args.stereo:
        stereo_calibrate(images_dir, board, args.square_length, dictionary, out_dir)
        return

    # Load and detect
    images = load_images(str(images_dir))
    all_corners, all_ids, valid_indices = detect_charuco_board(
        images, dictionary, board, squares_x, squares_y
    )

    # Get image size from first valid image
    img = cv2.imread(str(images[valid_indices[0]]))
    image_size = (img.shape[1], img.shape[0])

    # Run calibration
    ret, mtx, dist, rvecs, tvecs = run_calibration(
        all_corners, all_ids, board, image_size, args.fix_principal_point
    )

    # Per-view errors
    errors = compute_per_view_errors(
        all_corners, all_ids, rvecs, tvecs, mtx, dist, board
    )
    print("Per-view reprojection errors:")
    for i, (idx, err) in enumerate(zip(valid_indices, errors)):
        marker = "!" if err > 0.8 else ""
        print(f"  [{i:2d}] {images[idx].name}: {err:.3f} px {marker}")
    print()

    # Camera matrix summary
    print(f"Camera matrix:\\n{mtx}")
    print(f"\\nDistortion coefficients: {dist.ravel()}")
    fx = mtx[0, 0]
    fy = mtx[1, 1]
    cx = mtx[0, 2]
    cy = mtx[1, 2]
    print(f"\\nFocal length: fx={fx:.1f}, fy={fy:.1f}")
    print(f"Principal point: cx={cx:.1f}, cy={cy:.1f}")
    print(f"Image size: {image_size[0]}x{image_size[1]}")

    # Sanity checks
    print(f"\\n--- Sanity Checks ---")
    if fx > image_size[0] * 0.5 and fx < image_size[0] * 5:
        print("[OK] Focal length X looks reasonable")
    else:
        print("[WARN] Focal length X seems unusual")
    if abs(cx - image_size[0] / 2) < image_size[0] * 0.2:
        print("[OK] Principal point X is near centre")
    else:
        print("[WARN] Principal point X is far from centre")
    if abs(cy - image_size[1] / 2) < image_size[1] * 0.2:
        print("[OK] Principal point Y is near centre")
    else:
        print("[WARN] Principal point Y is far from centre")
    if ret < 0.5:
        print("[OK] RMS error is excellent (< 0.5 px)")
    elif ret < 0.8:
        print("[OK] RMS error is acceptable (< 0.8 px)")
    else:
        print("[WARN] RMS error is high (>= 0.8 px) — consider adding/improving images")
    print()

    # Save
    json_path = out_dir / f"{args.out}.json"
    xml_path = out_dir / f"{args.out}.xml"
    save_results_json(ret, mtx, dist, rvecs, tvecs, image_size, json_path)
    save_results_xml(ret, mtx, dist, image_size, xml_path)

    # Visualise
    visualize_results(
        images, all_corners, all_ids, valid_indices,
        mtx, dist, list(range(len(all_corners))),
        rvecs, tvecs, board, out_dir
    )

    # Undistort sample
    if args.sample:
        undistort_sample(args.sample, mtx, dist, out_dir)

    print(f"\\nAll results saved to: {out_dir.resolve()}")


if __name__ == "__main__":
    main()
`;

// ─── Python script for download (raw, no HTML escaping) ───
const PYTHON_SCRIPT_DOWNLOAD = `#!/usr/bin/env python3
"""
charuco_calibration.py \u2014 ChArUco Camera Calibration
OpenCV >= 4.7, Python >= 3.8
"""
import numpy as np
import cv2
import glob
import argparse
import json
import os
import sys
from pathlib import Path


def parse_args():
    parser = argparse.ArgumentParser(description="ChArUco Camera Calibration")
    parser.add_argument("-i", "--images", type=str, required=True,
                        help="Path to calibration images (dir or glob)")
    parser.add_argument("--squares_x", type=int, default=7,
                        help="Number of chessboard squares in X (default: 7)")
    parser.add_argument("--squares_y", type=int, default=5,
                        help="Number of chessboard squares in Y (default: 5)")
    parser.add_argument("--square_length", type=float, required=True,
                        help="Square side length in mm")
    parser.add_argument("--marker_length", type=float, default=None,
                        help="ArUco marker side length in mm (default: 0.6 * square_length)")
    parser.add_argument("--dictionary", type=str, default="DICT_6X6_250",
                        help="ArUco dictionary (default: DICT_6X6_250)")
    parser.add_argument("-o", "--out", type=str, default="calibration_results",
                        help="Output basename (default: calibration_results)")
    parser.add_argument("--fix_principal_point", action="store_true",
                        help="Fix principal point at image centre")
    parser.add_argument("--sample", type=str, default=None,
                        help="Sample image to undistort (optional)")
    parser.add_argument("--stereo", action="store_true",
                        help="Stereo calibration (requires left/right subdirs in --images)")
    return parser.parse_args()


def get_aruco_dict(name):
    """Resolve ArUco dictionary name to OpenCV object."""
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
        print(f"Unknown dictionary {name}. Using DICT_6X6_250.")
        name = "DICT_6X6_250"
    return cv2.aruco.getPredefinedDictionary(dict_map[name])


def load_images(path_pattern):
    """Load images from directory or glob pattern."""
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
        print(f"No images found at: {path_pattern}")
        sys.exit(1)
    print(f"Found {len(files)} images")
    return files


def detect_charuco_board(images, dictionary, board):
    """Detect ChArUco corners in all images."""
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
            print(f"  [SKIP] {img_path.name}: only {0 if marker_ids is None else len(marker_ids)} markers")
            continue

        # Refine marker detection
        cv2.aruco.refineDetectedMarkers(
            gray, board, marker_corners, marker_ids
        )

        # Interpolate chessboard corners from markers
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
        print(f"\\nERROR: Only {len(all_corners)} valid views (need >= 5). Add more images.")
        sys.exit(1)

    return all_corners, all_ids, valid_indices


def run_calibration(all_corners, all_ids, board, image_size, fix_principal_point):
    """Run ChArUco calibration."""
    flags = 0
    if fix_principal_point:
        flags |= cv2.CALIB_FIX_PRINCIPAL_POINT

    print(f"\\nRunning calibration with {len(all_corners)} views...")
    ret, mtx, dist, rvecs, tvecs = cv2.aruco.calibrateCameraCharuco(
        all_corners, all_ids, board, image_size, None, None, flags=flags
    )
    print(f"RMS reprojection error: {ret:.4f} pixels\\n")
    return ret, mtx, dist, rvecs, tvecs


def save_results_json(ret, mtx, dist, rvecs, tvecs, image_size, out_path):
    """Save calibration results as JSON."""
    data = {
        "rms_error": float(ret),
        "image_size": list(image_size),
        "camera_matrix": mtx.tolist(),
        "distortion_coefficients": dist.tolist(),
    }
    with open(out_path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Saved: {out_path}")


def save_results_xml(ret, mtx, dist, image_size, out_path):
    """Save calibration results as OpenCV XML."""
    fs = cv2.FileStorage(out_path, cv2.FILE_STORAGE_WRITE)
    fs.write("rms_error", ret)
    fs.write("image_width", image_size[0])
    fs.write("image_height", image_size[1])
    fs.write("camera_matrix", mtx)
    fs.write("distortion_coefficients", dist)
    fs.release()
    print(f"Saved: {out_path}")


def compute_per_view_errors(all_corners, all_ids, rvecs, tvecs, mtx, dist, board):
    """Compute reprojection error for each view."""
    errors = []
    for i in range(len(all_corners)):
        img_points = all_corners[i].reshape(-1, 2)
        obj_points = board.matchImagePoints(all_corners[i], all_ids[i])

        proj_points, _ = cv2.projectPoints(
            obj_points, rvecs[i], tvecs[i], mtx, dist
        )
        proj_points = proj_points.reshape(-1, 2)
        error = np.sqrt(np.mean(np.sum((img_points - proj_points) ** 2, axis=1)))
        errors.append(float(error))
    return errors


def visualize_results(images, all_corners, all_ids, valid_indices, mtx, dist,
                      valid_calib_indices, rvecs, tvecs, board, out_dir):
    """Draw detected corners and save visualisation images."""
    viz_dir = out_dir / "visualisations"
    viz_dir.mkdir(parents=True, exist_ok=True)

    for i, img_idx in enumerate(valid_indices):
        if i >= len(valid_calib_indices):
            break
        img = cv2.imread(str(images[img_idx]))
        if img is None:
            continue

        cv2.aruco.drawDetectedCornersCharuco(img, all_corners[i], all_ids[i])
        cv2.drawFrameAxes(img, mtx, dist, rvecs[i], tvecs[i], 0.03)

        out_file = viz_dir / f"frame_{img_idx:03d}.jpg"
        cv2.imwrite(str(out_file), img)

    print(f"Visualisations saved to: {viz_dir}/")


def undistort_sample(sample_path, mtx, dist, out_dir):
    """Undistort a sample image."""
    img = cv2.imread(sample_path)
    if img is None:
        print(f"Cannot read sample image: {sample_path}")
        return

    h, w = img.shape[:2]
    new_mtx, roi = cv2.getOptimalNewCameraMatrix(mtx, dist, (w, h), 1, (w, h))

    # Method 1: cv.undistort
    undistorted = cv2.undistort(img, mtx, dist, None, new_mtx)
    x, y, w_roi, h_roi = roi
    if w_roi > 0 and h_roi > 0:
        undistorted = undistorted[y:y + h_roi, x:x + w_roi]

    out_path = out_dir / "undistorted_sample.jpg"
    cv2.imwrite(str(out_path), undistorted)

    # Method 2: remap (for video)
    mapx, mapy = cv2.initUndistortRectifyMap(
        mtx, dist, None, new_mtx, (w, h), cv2.CV_32FC1
    )
    remapped = cv2.remap(img, mapx, mapy, cv2.INTER_LINEAR)
    remap_path = out_dir / "undistorted_remap_sample.jpg"
    cv2.imwrite(str(remap_path), remapped)

    print(f"Undistorted samples saved to: {out_dir}/")
    print(f"New camera matrix (with alpha=1):\\n{new_mtx}")


def stereo_calibrate(images_dir, board, square_length, dictionary, out_dir):
    """Run stereo ChArUco calibration."""
    left_dir = images_dir / "left"
    right_dir = images_dir / "right"

    if not left_dir.is_dir() or not right_dir.is_dir():
        print("ERROR: Stereo mode requires 'left/' and 'right/' subdirectories.")
        sys.exit(1)

    left_images = load_images(str(left_dir))
    right_images = load_images(str(right_dir))

    print(f"\\nStereo calibration with {len(left_images)} left / {len(right_images)} right images")

    left_corners, left_ids, left_idx = detect_charuco_board(
        left_images, dictionary, board
    )
    right_corners, right_ids, right_idx = detect_charuco_board(
        right_images, dictionary, board
    )

    paired_indices = sorted(set(left_idx) & set(right_idx))
    if len(paired_indices) < 3:
        print(f"ERROR: Only {len(paired_indices)} matching stereo pairs (need >= 3).")
        sys.exit(1)

    left_matched = [left_corners[left_idx.index(i)] for i in paired_indices]
    left_ids_matched = [left_ids[left_idx.index(i)] for i in paired_indices]
    right_matched = [right_corners[right_idx.index(i)] for i in paired_indices]
    right_ids_matched = [right_ids[right_idx.index(i)] for i in paired_indices]

    obj_points = []
    for i in range(len(paired_indices)):
        _, obj_pts, _ = board.matchImagePoints(
            left_matched[i], left_ids_matched[i]
        )
        obj_points.append(obj_pts)

    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 1e-5)
    flags = cv2.CALIB_FIX_INTRINSIC
    ret, _, _, _, _, R, T, E, F = cv2.stereoCalibrate(
        obj_points, left_matched, right_matched,
        None, None, None, None, (0, 0),
        criteria=criteria, flags=flags
    )

    print(f"\\nStereo RMS: {ret:.4f} pixels")
    print(f"Rotation matrix:\\n{R}")
    print(f"Translation vector:\\n{T}")

    R1, R2, P1, P2, Q, _, _ = cv2.stereoRectify(
        None, None, None, None, (0, 0), R, T, alpha=0
    )

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
    print(f"\\nStereo results saved to: {stereo_out}")

    return ret, R, T, E, F


def main():
    args = parse_args()

    images_dir = Path(args.images)
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

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
        (squares_x, squares_y), square_length, marker_length, dictionary
    )

    print(f"ChArUco board: {squares_x}x{squares_y}, "
          f"square={args.square_length}mm, "
          f"marker={args.square_length * (0.6 if args.marker_length is None else args.marker_length / args.square_length):.1f}mm")
    print(f"Dictionary: {args.dictionary}\\n")

    if args.stereo:
        stereo_calibrate(images_dir, board, args.square_length, dictionary, out_dir)
        return

    images = load_images(str(images_dir))
    all_corners, all_ids, valid_indices = detect_charuco_board(
        images, dictionary, board
    )

    img = cv2.imread(str(images[valid_indices[0]]))
    image_size = (img.shape[1], img.shape[0])

    ret, mtx, dist, rvecs, tvecs = run_calibration(
        all_corners, all_ids, board, image_size, args.fix_principal_point
    )

    errors = compute_per_view_errors(
        all_corners, all_ids, rvecs, tvecs, mtx, dist, board
    )
    print("Per-view reprojection errors:")
    for i, (idx, err) in enumerate(zip(valid_indices, errors)):
        marker = "!" if err > 0.8 else ""
        print(f"  [{i:2d}] {images[idx].name}: {err:.3f} px {marker}")
    print()

    print(f"Camera matrix:\\n{mtx}")
    print(f"\\nDistortion coefficients: {dist.ravel()}")
    fx, fy = mtx[0, 0], mtx[1, 1]
    cx, cy = mtx[0, 2], mtx[1, 2]
    print(f"\\nFocal length: fx={fx:.1f}, fy={fy:.1f}")
    print(f"Principal point: cx={cx:.1f}, cy={cy:.1f}")
    print(f"Image size: {image_size[0]}x{image_size[1]}")

    print(f"\\n--- Sanity Checks ---")
    if image_size[0] * 0.5 < fx < image_size[0] * 5:
        print("[OK] Focal length X looks reasonable")
    else:
        print("[WARN] Focal length X seems unusual")
    if abs(cx - image_size[0] / 2) < image_size[0] * 0.2:
        print("[OK] Principal point X is near centre")
    else:
        print("[WARN] Principal point X is far from centre")
    if abs(cy - image_size[1] / 2) < image_size[1] * 0.2:
        print("[OK] Principal point Y is near centre")
    else:
        print("[WARN] Principal point Y is far from centre")
    if ret < 0.5:
        print("[OK] RMS error is excellent (< 0.5 px)")
    elif ret < 0.8:
        print("[OK] RMS error is acceptable (< 0.8 px)")
    else:
        print("[WARN] RMS error is high (>= 0.8 px)")
    print()

    json_path = out_dir / f"{args.out}.json"
    xml_path = out_dir / f"{args.out}.xml"
    save_results_json(ret, mtx, dist, rvecs, tvecs, image_size, json_path)
    save_results_xml(ret, mtx, dist, image_size, xml_path)

    visualize_results(
        images, all_corners, all_ids, valid_indices,
        mtx, dist, list(range(len(all_corners))),
        rvecs, tvecs, board, out_dir
    )

    if args.sample:
        undistort_sample(args.sample, mtx, dist, out_dir)

    print(f"\\nAll results saved to: {out_dir.resolve()}")


if __name__ == "__main__":
    main()
`;

export default function CalibrationPage() {
  const [lang, setLang] = useState<'en' | 'id'>('en');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('charuco-lang') as 'en' | 'id' | null;
    if (saved) setLang(saved);
  }, []);

  const handleLangToggle = useCallback(() => {
    const next = lang === 'en' ? 'id' : 'en';
    setLang(next);
    localStorage.setItem('charuco-lang', next);
  }, [lang]);

  const t = Content[lang];

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(PYTHON_SCRIPT_DOWNLOAD);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = PYTHON_SCRIPT_DOWNLOAD;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadPy = () => {
    const blob = new Blob([PYTHON_SCRIPT_DOWNLOAD], { type: 'text/python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'charuco_calibration.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadIpynb = () => {
    // Trigger download via fetch to /charuco_calibration.ipynb
    const a = document.createElement('a');
    a.href = '/charuco_calibration.ipynb';
    a.download = 'charuco_calibration.ipynb';
    a.click();
  };

  const stepIcon = (icon: string) => stepIcons[icon as StepIcon] || <BookOpen className="w-5 h-5" />;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium
                hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors
                text-zinc-600 dark:text-zinc-400"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t.navHome}
            </Link>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {t.title}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors hidden sm:block"
            >
              {t.navHome}
            </Link>
            <LanguageToggle lang={lang} onToggle={handleLangToggle} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Mobile title */}
      <div className="sm:hidden px-4 pt-4 pb-2">
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          {t.title}
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {t.subtitle}
        </p>
      </div>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-4 py-6 space-y-10">
        {/* ── Section 1: What You Need ── */}
        <Section icon={<Ruler className="w-5 h-5 text-zinc-500" />} title={t.s1Title}>
          <ul className="space-y-2">
            {t.s1Items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <span className="mt-0.5 text-zinc-500 shrink-0">&#8226;</span>
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </li>
            ))}
          </ul>
        </Section>

        {/* ── Section 2: Step-by-Step ── */}
        <Section icon={<BookOpen className="w-5 h-5 text-green-500" />} title={t.s2Title}>
          <div className="space-y-6">
            {t.s2Steps.map((step, i) => (
              <div key={i} className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 bg-white dark:bg-zinc-900/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                    {stepIcon(step.icon)}
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {step.title}
                  </h3>
                </div>
                <ul className="space-y-1.5 ml-11">
                  {step.details.map((detail, j) => (
                    <li key={j} className="text-sm text-zinc-600 dark:text-zinc-400">
                      <span dangerouslySetInnerHTML={{ __html: detail }} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Section 3: Code ── */}
        <Section icon={<Code className="w-5 h-5 text-purple-500" />} title={t.s3Title}>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            {t.s3Desc}
          </p>

          <div className="relative rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-900 text-zinc-100 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border-b border-zinc-700">
              <span className="text-xs text-zinc-400 font-mono">charuco_calibration.py</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium
                    bg-zinc-700 hover:bg-zinc-600 transition-colors text-zinc-200"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? t.copied : t.copyBtn}
                </button>
              </div>
            </div>
            {/* Code */}
            <pre className="p-4 text-xs leading-relaxed overflow-x-auto max-h-[500px] overflow-y-auto
              [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-zinc-600 [&::-webkit-scrollbar-track]:bg-zinc-800">
              <code>{PYTHON_SCRIPT}</code>
            </pre>
          </div>
        </Section>

        {/* ── Section 4: Accuracy Reference ── */}
        <Section icon={<Table className="w-5 h-5 text-amber-500" />} title={t.s4Title}>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">{t.s4Desc}</p>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  <th className="px-4 py-3 text-left font-semibold">{t.s4Square}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t.s4A4}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t.s4A3}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t.s4BoardSize}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t.s4Use}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {t.s4Rows.map((row, i) => (
                  <tr key={i} className="bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
                    <td className="px-4 py-3 font-semibold text-zinc-800 dark:text-zinc-200">{row.sq}</td>
                    <td className="px-4 py-3">{row.a4 ? <Check className="w-4 h-4 text-green-500 inline-block" /> : '—'}</td>
                    <td className="px-4 py-3">{row.a3 ? <Check className="w-4 h-4 text-green-500 inline-block" /> : '—'}</td>
                    <td className="px-4 py-3">{row.size}</td>
                    <td className="px-4 py-3">{row.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── Section 5: Downloads ── */}
        <Section icon={<Download className="w-5 h-5 text-zinc-500" />} title={t.s5Title}>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">{t.s5Desc}</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownloadPy}
              className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium
                bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700
                hover:border-zinc-400 dark:hover:border-zinc-500 hover:shadow-sm
                text-zinc-700 dark:text-zinc-300 transition-all"
            >
              <Download className="w-4 h-4 text-zinc-500" />
              {t.downloadScript}
            </button>
            <button
              onClick={handleDownloadIpynb}
              className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium
                bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700
                hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-sm
                text-zinc-700 dark:text-zinc-300 transition-all"
            >
              <Download className="w-4 h-4 text-orange-500" />
              {t.downloadNotebook}
            </button>
          </div>
        </Section>

        {/* ── Tips ── */}
        <Section icon={<Camera className="w-5 h-5 text-rose-500" />} title={t.tipsTitle}>
          <ul className="space-y-2">
            {t.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <span className="mt-0.5 text-rose-500 shrink-0">&#8226;</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </Section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 mt-12">
        <p className="text-center text-xs text-zinc-400">
          {t.footer}
        </p>
      </footer>
    </div>
  );
}

// ─── Section wrapper ───
function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
