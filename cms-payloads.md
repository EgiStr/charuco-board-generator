# CMS Payloads — DRAFT ONLY, do not publish without human review

Target CMS: https://manager.eggisatria.dev (custom Next.js + Auth.js)
Auth: user logs in manually in their own browser, then tells the agent.
Rule: create everything as DRAFT/unpublished. Human reviews, human publishes.

Cover images (already in repo `public/`, pushed to GitHub master):
- og-image.png (1200x630) — social preview + blog cover
- cover-blog.png (1600x900) — wide cover variant
NOTE: CMS likely needs a public URL or Supabase upload for imageUrl/coverImage.
Do NOT hotlink GitHub raw as permanent cover without user approval — ask at execution time.

---

## PROJECT 1 (Portfolio → www.eggisatria.dev/portfolio)

- title: ChArUco Board Generator
- slug: charuco-board-generator
- description: Browser-based generator for printable, OpenCV-compatible ChArUco camera-calibration boards — real OpenCV dictionary bytes, print-accurate PDF/PNG/SVG export, and a bundled calibration script.
- longDescription:
  Generate camera-calibration boards that OpenCV actually detects. This Next.js + TypeScript app
  embeds real OpenCV 5.x dictionary bytesList data for all 16 predefined ArUco dictionaries
  (4x4 to 7x7) and exports print-accurate boards as 300-DPI PDF/PNG or true-vector SVG in
  millimetre units. Paper-aware (A4/A3/A2/A1 + custom, portrait/landscape) with 1:1 fit checking
  and fill-paper auto-sizing. A bundled Python script (CharucoDetector-based) runs the full
  mono/stereo calibration and saves camera matrix + distortion coefficients as JSON/XML.
  Provenance highlight: a forensic bug-hunt fixed silently-corrupt marker patterns (strided-column
  bytesList read + inverted bit polarity) — verified pixel-identical to OpenCV's own
  CharucoBoard.generateImage outside cosmetic strokes, with 220/220 tests green including 9
  end-to-end runs through the real cv2.aruco detector.
- imageUrl: <cover-blog.png URL — TBD at execution>
- liveUrl: https://github.com/EgiStr/charuco-board-generator
  (no live deployment yet; update when deployed. Do NOT invent a demo URL.)
- githubUrl: https://github.com/EgiStr/charuco-board-generator
- featured: false (user decides)
- status: DRAFT
- techStack: nextjs, typescript, opencv, python, tailwindcss, vitest

## POST 1 (Blog → blog.eggisatria.dev/blog)

- title: My ChArUco Board Looked Perfect — OpenCV Couldn't See a Single Marker
- slug: charuco-board-looked-perfect-opencv-could-not-see-marker
- excerpt: A forensic bug-hunt: how a strided-column bytesList read and inverted bit polarity silently corrupted every ArUco marker — and how real-detector firewall tests proved the fix.
- content: <from blog-draft-charuco-bughunt.md, converted to the CMS markdown>
- coverImage: <og-image.png URL — TBD at execution>
- tags: opencv, charuco, aruco, debugging, computer-vision (create if missing)
- published: false (DRAFT)
- readingTime: ~7

## POST 2 (Blog → blog.eggisatria.dev/blog, tutorial ID/EN mix as drafted)

- title: Cara Membuat ChArUco Board dan Kalibrasi Kamera dengan Website Ini
- slug: cara-membuat-charuco-board-kalibrasi-kamera
- excerpt: Tutorial lengkap 6 langkah: generate board, cetak 100% tanpa scaling, ambil foto kalibrasi, jalankan skrip Python, baca error reproyeksi, pakai matriks kamera.
- content: <from blog-draft-charuco-tutorial.md>
- coverImage: <cover-blog.png URL — TBD at execution>
- tags: opencv, charuco, tutorial, camera-calibration (create if missing)
- published: false (DRAFT)
- readingTime: ~8

---

## Execution checklist (when user says logged in)

1. Re-snapshot /dashboard/posts + /dashboard/projects to learn required fields + image upload flow.
2. Upload og-image.png + cover-blog.png via the CMS's own uploader (or ask user where to host).
3. Create project (DRAFT) + 2 posts (unpublished) with payloads above.
4. Screenshot each saved DRAFT. Report URLs. Do NOT click publish.
