# Cara Membuat ChArUco Board dan Kalibrasi Kamera dengan Website Ini (Tutorial Lengkap)

> Audience: siapa pun yang butuh kalibrasi kamera — mahasiswa, maker, vision engineer | Takeaway: dari generate board sampai dapat matriks kamera dalam 6 langkah | Status: DRAFT — not for publication

## Problem

Kamera tanpa kalibrasi = penggaris yang melar. Foto papan 9×6 biasa gampang gagal kalau sudut tertutup atau cahaya miring. **ChArUco** (papan catur + marker ArUco) menyelesaikan itu: tiap marker memberi ID unik, jadi sudut papan tetap bisa diinterpolasi walau sebagian tertutup.

Tutorial ini memakai [ChArUco Board Generator](https://github.com/EgiStr/charuco-board-generator) — gratis, jalan di browser, dan polanya sudah terverifikasi terdeteksi OpenCV asli (220/220 tes hijau, termasuk 9 tes end-to-end dengan `cv2.aruco` sungguhan).

## Langkah 1 — Generate board di website

1. Atur **squares** (mis. 7×5), **square length** (mis. 25 mm), **dictionary** (default `DICT_6X6_250` cocok untuk kebanyakan kasus).
2. Pilih **paper** (A4/A3/…) + orientasi; generator memberi peringatan kalau board tidak muat 1:1.
3. Klik **"Fill paper"** untuk memaksimalkan ukuran board di kertas, atau atur margin manual.
4. Download sebagai **PDF (300 DPI)** untuk cetak, atau **SVG vektor** (satuan mm, skala tepat).

> Tip: biarkan mode **Pure Board** aktif untuk hasil cetak — tanpa teks info, tanpa skala, murni hitam-putih.

## Langkah 2 — Cetak dengan benar (ini bagian paling penting!)

- Print **100% / Actual size** — JANGAN "Fit to page". Satu checkbox salah = seluruh kalibrasi meleset.
- Kertas matte lebih baik dari glossy (mengurangi refleksi).
- Tempel di permukaan **datar dan kaku** (karton/kayu). Kertas melengkung = error sistematis.
- **Ukur kotak dengan caliper** — mis. harus tepat 25.0 mm. Catat angka real ini untuk `--square_length`.

## Langkah 3 — Ambil 15–25 foto board

- Variasikan: sudut miring kiri/kanan/atas/bawah, jarak dekat-jauh, putar sedikit, penuhi seluruh frame di beberapa foto.
- Board harus **diam dan fokus**; hindari motion blur dan glare.
- Simpan semua dalam satu folder, mis. `./calib_images/`.

## Langkah 4 — Jalankan skrip kalibrasi bawaan

Skrip `public/charuco_calibration.py` (juga tampil di halaman `/calibration` website) memakai `CharucoDetector`:

```bash
pip install opencv-python numpy
python public/charuco_calibration.py --images ./calib_images/ --square_length 25.0
```

Argumen penting (`public/charuco_calibration.py`, fungsi `parse_args`):
- `--squares_x / --squares_y` (default 7/5) — harus sama dengan board yang dicetak.
- `--marker_length` (default 0.6 × square) — samakan dengan ukuran marker board.
- `--dictionary` (default `DICT_6X6_250`) — samakan dengan pilihan di website.
- `--out` — folder hasil (JSON + XML + visualisasi).
- `--sample test.jpg` — uji undistort pada foto contoh.
- `--stereo` — kalibrasi stereo (harapkan subfolder `left/` dan `right/`).

## Langkah 5 — Baca hasilnya

Skrip mencetak error reproyeksi per foto dan menandai foto bermasalah (`← HIGH` bila > 0.8 px): buang/ulangi foto itu, lalu run ulang. Output tersimpan sebagai JSON + XML (matriks kamera `mtx`, koefisien distorsi `dist`), plus visualisasi sudut yang terdeteksi per foto.

Patokan kasar: RMS **< 0.5 px** = bagus, **0.5–0.8 px** = cukup, **> 0.8 px** = tambah/perbaiki foto.

## Langkah 6 — Pakai hasil kalibrasi

Gunakan `mtx` + `dist` untuk `cv2.undistort()` pada foto/frame produksi — atau verifikasi cepat via `--sample`:

```bash
python public/charuco_calibration.py --images ./calib_images/ --square_length 25.0 --sample test.jpg
```

## Batasan (jujur)

- Skrip memberi hasil dalam satuan yang konsisten dengan input mm; pastikan `square_length` = hasil ukur caliper, bukan angka nominal.
- Mode stereo butuh pasangan gambar sinkron kiri/kanan — skrip tidak mengecek sinkronisasi waktu.
- Klaim akurasi dimensi cetak 1:1 bergantung pada printer + driver; selalu verifikasi dengan caliper (saya belum mengukur di semua printer — UNVERIFIED untuk printer selain yang saya pakai).

## Bukti

- Generator: `lib/charucoRenderer.ts`, `lib/svgGenerator.ts`, `lib/pdfGenerator.ts` (repo di atas).
- Skrip: `public/charuco_calibration.py` (`parse_args`, `detect_charuco_board` via `CharucoDetector`, `run_calibration`, `main`).
- Kompatibilitas pola: 9/9 tes e2e OpenCV hijau (`lib/__tests__/opencvCompat.test.ts`); papan penuh terdeteksi `ids [0..5]` + 6 corner CharUco.
- UNVERIFIED: angka error contoh (< 0.5 px) adalah patokan umum komunitas, bukan hasil ukur sesi ini.
