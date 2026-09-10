#!/usr/bin/env python3
"""Generate OG/social-preview + blog-cover images for charuco-board-generator.

Renders REAL marker patterns using the fixed extraction rule
(contiguous row flatten + low tail bits + invert to black=1) from the
regenerated lib/arucoDictData.ts, so the artwork shows genuine
OpenCV-compatible markers — not decoration.

Outputs (into public/):
  og-image.png    1200x630  GitHub social preview + blog cover
  cover-blog.png  1600x900  wide cover variant
"""
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "lib" / "arucoDictData.ts"
OUT = ROOT / "public"

DICT = "DICT_6X6_250"
MARKER_SIZE = 6
BYTES_PER_MARKER = 5
MARKER_IDS = [0, 1, 2, 3]


def load_block() -> bytes:
    src = DATA.read_text(encoding="utf-8")
    m = re.search(
        r"const BYTES_DICT_6X6_250: Uint8Array = new Uint8Array\(\[(.*?)\]\);",
        src,
        re.S,
    )
    assert m, "BYTES_DICT_6X6_250 not found"
    vals = [int(x, 16) for x in re.findall(r"0x[0-9a-fA-F]{2}", m.group(1))]
    return bytes(vals)


def marker_bits(block: bytes, mid: int):
    base = mid * 4 * BYTES_PER_MARKER
    rot0 = block[base:base + BYTES_PER_MARKER]
    allbits = "".join(f"{b:08b}" for b in rot0)
    n = MARKER_SIZE * MARKER_SIZE
    fb, rb = divmod(n, 8)
    s = "".join(f"{b:08b}" for b in rot0[:fb])
    if rb:
        s += f"{rot0[fb]:08b}"[8 - rb:]
    assert len(s) == n
    inv = "".join("1" if c == "0" else "0" for c in s)  # 1 = black
    return [inv[r * MARKER_SIZE:(r + 1) * MARKER_SIZE] for r in range(MARKER_SIZE)]


def draw_marker(draw: ImageDraw.ImageDraw, x0: int, y0: int, cell: int, rows):
    total = MARKER_SIZE + 2
    draw.rectangle([x0, y0, x0 + total * cell, y0 + total * cell], fill="black")
    for r, row in enumerate(rows):
        for c, ch in enumerate(row):
            if ch == "0":  # white inner cell
                x, y = x0 + (c + 1) * cell, y0 + (r + 1) * cell
                draw.rectangle([x, y, x + cell, y + cell], fill="white")


def text(draw, xy, s, size, fill, anchor="la"):
    try:
        f = ImageFont.truetype("arial.ttf", size)
    except OSError:
        f = ImageFont.load_default()
    draw.text(xy, s, font=f, fill=fill, anchor=anchor)


def make(width: int, height: int, path: Path):
    bg = (10, 10, 12)
    img = Image.new("RGB", (width, height), bg)
    d = ImageDraw.Draw(img)
    block = load_block()

    # faint checker strip along the bottom
    sq = 46
    y_base = height - sq * 2
    for i in range(width // sq + 1):
        for r in range(2):
            if (i + r) % 2 == 0:
                d.rectangle([i * sq, y_base + r * sq,
                             (i + 1) * sq, y_base + (r + 1) * sq], fill=(28, 28, 32))

    # marker cards
    n = len(MARKER_IDS)
    cell = 26 if width <= 1200 else 34
    card = (MARKER_SIZE + 2) * cell + 36
    gap = 28
    total_w = n * card + (n - 1) * gap
    x = (width - total_w) // 2
    y = 120 if width <= 1200 else 150
    for mid in MARKER_IDS:
        d.rounded_rectangle([x, y, x + card, y + card + 44], radius=18, fill="white")
        draw_marker(d, x + 18, y + 18, cell, marker_bits(block, mid))
        text(d, (x + card // 2, y + card + 30), f"ID {mid}", 22, (120, 120, 130), anchor="ma")
        x += card + gap

    cy = y + card + 100
    text(d, (width // 2, cy), "ChArUco Board Generator", 64 if width <= 1200 else 84,
         (245, 245, 247), anchor="ma")
    text(d, (width // 2, cy + (78 if width <= 1200 else 104)),
         "Printable boards that OpenCV actually detects  \u2022  220 tests green", 26 if width <= 1200 else 32,
         (150, 200, 150), anchor="ma")

    img.save(path)
    print(f"wrote {path} ({width}x{height})")


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    make(1200, 630, OUT / "og-image.png")
    make(1600, 900, OUT / "cover-blog.png")
