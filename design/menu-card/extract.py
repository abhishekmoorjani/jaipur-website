#!/usr/bin/env python3
"""Rebuild the menu card artwork from printed page 2 (and the badge green from page 13).

Usage (from the repo root):
  python3 -I design/menu-card/extract.py \
    "<path>/Seite 2 Authentic Indian Cusine_beige.pdf" "<path>/Seite 13 indische Tapas.pdf"

Rule followed here: nothing is drawn or invented. Page 2 holds full page rasters with the
text baked in, so every asset is a crop of a 300 dpi render, taken only from regions free
of text, with the paper made transparent by colour to alpha against a fitted paper model.
The parchment tile is synthesised from text free paper samples (mean colour plus grain).

Writes: public/images/menu-card/*.webp, design/menu-card/palette.json,
        design/menu-card/layout.json, previews in design/menu-card/build/ (git ignored).
Needs: pdftoppm, numpy, scipy, Pillow with WebP.
"""
import json
import pathlib
import subprocess
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parent.parent
BUILD = HERE / "build"
OUT = REPO / "public" / "images" / "menu-card"
PAGE = 2504  # page 2 is 600.945 pt square: 2504 px at 300 dpi

# Measured on the 300 dpi render. Page pixel coordinates.
INNER = dict(left=52, top=45, right=2454, bottom=2458)  # centre of the thin inner frame line
CORNERS = {"tl": (52, 45, 1, 1), "tr": (2454, 45, -1, 1), "bl": (52, 2458, 1, -1), "br": (2454, 2458, -1, -1)}
ARCS = {}  # corner -> outer edge of the concave inner arc, distance from the corner point per 0.5 degree
OUTER = dict(left=30, top=24, right=2476, bottom=2480)  # just outside the thick outer frame line
TEXT_BOXES = [  # x0, y0, x1, y1 of every printed text line, logo and divider
    (880, 120, 1520, 440),   # logo
    (823, 460, 1571, 509),   # Authentic Indian Cusine
    (992, 571, 1403, 617),   # For Over 30 years
    (455, 665, 2155, 785),   # heading
    (846, 783, 1650, 864),   # divider 1
    (707, 891, 1758, 945), (503, 967, 1969, 1020), (640, 1041, 1831, 1084),
    (550, 1118, 1924, 1173), (586, 1197, 1903, 1252),  # paragraph 1
    (852, 1271, 1645, 1354),  # divider 2
    (685, 1382, 1812, 1439), (643, 1460, 1846, 1516), (832, 1537, 1658, 1580),  # paragraph 2
    (866, 1613, 1629, 1692),  # divider 3
    (776, 1720, 1722, 1776), (905, 1798, 1605, 1854),  # paragraph 3
    (934, 1874, 1559, 1951),  # divider 4
    (829, 1994, 1652, 2044),  # Vielen Dank fuer Ihren Besuch.
    (1030, 2076, 1460, 2164),  # divider 5
]
# Art crops, page coordinates. Each must be free of text after masking (asserted in main).
CROPS = {
    "cover-tl": (0, 0, 660, 900),        # top left lace and leaves
    "cover-tr": (1800, 0, 2504, 720),    # top right lace
    "cover-bottom": (0, 1440, 2504, 2504),  # palace, trees, water, bottom right lace and leaves
}
LEAVES = {"leaf-tl": (0, 250, 445, 880), "leaf-br": (1930, 1740, 2504, 2504)}  # sprigs only, for the menu corners
DIVIDERS = {"divider": (846, 1265, 1651, 1360), "divider-short": (928, 1868, 1565, 1957),
            "divider-end": (1024, 2070, 1466, 2172)}
PAPER_SAMPLE = (78, 1000, 438, 1360)  # text and art free paper on the left margin
FRAME_OFF, FRAME_C, FRAME_E = 20, 110, 10  # 9 slice: offset from page edge, corner size, edge strip


def render(pdf, dpi, stem):
    BUILD.mkdir(parents=True, exist_ok=True)
    png = BUILD / f"{stem}_{dpi}-1.png"
    if not png.exists():
        subprocess.run(["pdftoppm", "-r", str(dpi), "-png", pdf, str(BUILD / f"{stem}_{dpi}")], check=True)
    return np.asarray(Image.open(png).convert("RGB")).astype(np.float32)


def darkest_median(px, frac):
    lum = px.mean(1)
    k = max(1, int(len(px) * frac))
    return np.median(px[np.argsort(lum)[:k]], axis=0)


def box(img, b):
    x0, y0, x1, y1 = b
    return img[y0:y1, x0:x1].reshape(-1, 3)


def srgb_lum(c):
    c = np.asarray(c, dtype=float) / 255
    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def contrast(a, b):
    la, lb = sorted((srgb_lum(a), srgb_lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def hexc(c):
    return "#%02X%02X%02X" % tuple(int(round(v)) for v in c)


def darken_to(c, bg, target):
    """Same hue, scaled toward black until it reaches the target contrast on bg."""
    c = np.asarray(c, dtype=float)
    for s in np.linspace(1, 0, 201):
        if contrast(c * s, bg) >= target:
            return c * s
    return c * 0


def paper_model(img):
    """Smooth paper colour B(x, y): degree 4 polynomial fitted to paper pixels only."""
    h, w, _ = img.shape
    step = 8
    ys, xs = np.mgrid[0:h:step, 0:w:step]
    px = img[ys, xs]
    lum = px.mean(2)
    rb = px[..., 0] - px[..., 2]
    ok = (lum > 205) & (rb > 35) & (rb < 75) & (px[..., 1] < px[..., 0])
    u, v = xs / w * 2 - 1, ys / h * 2 - 1
    terms = [u ** i * v ** j for i in range(5) for j in range(5 - i)]
    A = np.stack([t[ok] for t in terms], 1)
    coef = []
    for ch in range(3):
        y = px[..., ch][ok]
        keep = np.ones_like(y, bool)
        for _ in range(3):
            cf, *_ = np.linalg.lstsq(A[keep], y[keep], rcond=None)
            res = y - A @ cf
            keep = np.abs(res) < 3 * res[keep].std()
        coef.append(cf)

    def at(x0, y0, x1, y1):
        yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
        uu, vv = xx / w * 2 - 1, yy / h * 2 - 1
        tt = [uu ** i * vv ** j for i in range(5) for j in range(5 - i)]
        return np.stack([sum(c * t for c, t in zip(cf, tt)) for cf in coef], 2)

    return at


def color_to_alpha(P, B, t0=0.09):
    """Colour to alpha against the local paper colour, darkening only (ink is darker than paper).
    t0 sits above the paper grain: on clean paper 99.9 % of pixels stay below 0.09."""
    up = np.clip((B - P) / np.maximum(B, 1), 0, 1).max(2)
    return np.clip((up - t0) / (1 - t0), 0, 1)


def unmix(P, B, a):
    return np.clip(B + (P - B) / np.maximum(a, 1 / 255)[..., None], 0, 255)


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def measure_arcs(img):
    """Walk out from each inner corner point and record where the thin inner line ends.
    The first dark run after 40 px is the line; its start plus the line width is its outer edge,
    so lace or leaves touching the line on the inside are never counted as frame."""
    lum = img.mean(2)
    ang = np.arange(0, 90.5, 0.5)
    ds = np.arange(40, 66, 0.5)
    for k, (cx, cy, sx, sy) in CORNERS.items():
        edge = np.full(ang.shape, np.nan)
        for i, t in enumerate(np.radians(ang)):
            xs = np.round(cx + sx * ds * np.cos(t)).astype(int)
            ys = np.round(cy + sy * ds * np.sin(t)).astype(int)
            dark = lum[ys, xs] < 185
            if dark.any():
                edge[i] = ds[np.argmax(dark)] + 5.5
        edge = np.where(np.isnan(edge), np.nanmedian(edge), edge)
        ARCS[k] = ndi.median_filter(edge, size=11, mode="nearest")


def interior_mask(x0, y0, x1, y1):
    yy, xx = np.mgrid[y0:y1, x0:x1]
    m = (xx >= INNER["left"] + 3) & (xx <= INNER["right"] - 3) & (yy >= INNER["top"] + 3) & (yy <= INNER["bottom"] - 3)
    for k, (cx, cy, sx, sy) in CORNERS.items():
        dx, dy = (xx - cx) * sx, (yy - cy) * sy
        near = (dx >= 0) & (dy >= 0) & (np.hypot(dx, dy) < 80)
        if near.any():
            theta = np.degrees(np.arctan2(dy[near], dx[near]))
            limit = np.interp(theta, np.arange(0, 90.5, 0.5), ARCS[k])
            m[near] &= np.hypot(dx[near], dy[near]) >= limit
    return ndi.gaussian_filter(m.astype(np.float32), 1.2)


def text_mask(x0, y0, x1, y1, pad=16):
    m = np.zeros((y1 - y0, x1 - x0), np.float32)
    for bx0, by0, bx1, by1 in TEXT_BOXES:
        a, b = max(bx0 - pad, x0), min(bx1 + pad, x1)
        c, d = max(by0 - pad, y0), min(by1 + pad, y1)
        if a < b and c < d:
            m[c - y0:d - y0, a - x0:b - x0] = 1
    return np.clip(ndi.gaussian_filter(m, 5) * 1.6, 0, 1)


def save_rgba(rgb, alpha, path, scale=1.0, quality=82):
    arr = np.dstack([rgb, alpha[..., None] * 255]).round().astype(np.uint8)
    im = Image.fromarray(arr, "RGBA")
    if scale != 1.0:
        im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    im.save(path, "WEBP", quality=quality, method=6, alpha_quality=90)
    return im


def preview(im, path, bg=(244, 226, 192)):
    base = Image.new("RGBA", im.size, bg + (255,))
    base.alpha_composite(im)
    base.convert("RGB").save(path)


def main(p2_pdf, p13_pdf):
    OUT.mkdir(parents=True, exist_ok=True)
    img = render(p2_pdf, 300, "p2")
    assert img.shape[:2] == (PAGE, PAGE), img.shape
    p13 = render(p13_pdf, 300, "p13")
    paper_at = paper_model(img)
    measure_arcs(img)

    # ---------- palette, sampled from ink cores ----------
    green = lambda p: p[p[:, 1] > p[:, 0]]
    pal = {
        "heading_green": darkest_median(green(box(img, (470, 672, 2040, 782))), 0.08),
        "thanks_green": darkest_median(green(box(img, (829, 1994, 1652, 2044))), 0.10),
        "body_ink": darkest_median(box(img, (503, 891, 1969, 1252)), 0.04),
        "teal": darkest_median(box(img, (992, 571, 1403, 617))[box(img, (992, 571, 1403, 617))[:, 2] > box(img, (992, 571, 1403, 617))[:, 0]], 0.12),
        "gold_text": darkest_median(box(img, (919, 460, 1575, 509)), 0.12),
        "divider_gold": darkest_median(box(img, (867, 785, 1631, 861)), 0.08),
        "frame_gold": darkest_median(box(img, (300, 26, 2200, 36)), 0.30),
    }
    gp = p13.reshape(-1, 3)
    gp = gp[(gp[:, 1] > gp[:, 0] + 60) & (gp[:, 1] > gp[:, 2] + 40)]
    pal["veggie_green_p13"] = darkest_median(gp, 0.25)

    # paper: margin (edge tone), centre of the text column (lighter), and grain spread
    ps = box(img, PAPER_SAMPLE)
    centre = box(img, (600, 1254, 1900, 1270))
    pal["paper_edge"] = ps.mean(0)
    pal["paper_centre"] = centre.mean(0)
    lum = ps.mean(1)
    pal["paper_dark_p1"] = ps[np.argsort(lum)[int(len(lum) * 0.01)]]

    # ---------- parchment tile (synthesised, no text) ----------
    x0, y0, x1, y1 = PAPER_SAMPLE
    patch = img[y0:y1, x0:x1]
    assert text_mask(*PAPER_SAMPLE).max() == 0 and patch.mean(2).min() > 195, "paper sample is not clean"
    grain = patch - ndi.gaussian_filter(patch, (12, 12, 0))  # fine grain only: no large blotches to repeat
    n = grain.shape[0]
    rolled = np.roll(np.roll(grain, n // 2, 0), n // 2, 1)
    r = np.abs(np.linspace(-1, 1, n))
    wgt = np.clip(1 - np.maximum.outer(r, r), 0, 1)[..., None]  # 1 in the middle, 0 at the borders
    grain = (grain * wgt + rolled * (1 - wgt)) / np.sqrt(wgt ** 2 + (1 - wgt) ** 2)  # same strength in the blend zone
    tile = np.clip(pal["paper_edge"] + grain, 0, 255).round().astype(np.uint8)
    Image.fromarray(tile).resize((224, 224), Image.LANCZOS).save(OUT / "parchment.webp", "WEBP", quality=80, method=6)
    Image.fromarray(np.tile(tile, (3, 3, 1))).save(BUILD / "preview-parchment-3x3.png")

    layout = {"page_px": PAGE, "crops": {}}

    # ---------- cover art crops ----------
    for name, (cx0, cy0, cx1, cy1) in CROPS.items():
        P = img[cy0:cy1, cx0:cx1]
        Bm = paper_at(cx0, cy0, cx1, cy1)
        a = color_to_alpha(P, Bm)
        leaf = smoothstep(2, 18, P[..., 1] - np.maximum(P[..., 0], P[..., 2]))  # green leaves only
        leaf = ndi.grey_dilation(leaf, size=(3, 3))
        a_pre = np.maximum(a, leaf)
        rgb = unmix(P, Bm, a_pre)
        region = np.maximum(interior_mask(cx0, cy0, cx1, cy1), leaf)
        alpha = a_pre * region * (1 - text_mask(cx0, cy0, cx1, cy1))
        assert alpha[text_mask(cx0, cy0, cx1, cy1, pad=0) > 0.99].max(initial=0) == 0, f"{name} still holds text"
        # nothing of the art may be cut by the crop: inner crop edges must be empty
        edges = {"top": alpha[0], "bottom": alpha[-1], "left": alpha[:, 0], "right": alpha[:, -1]}
        layout["crops"][name] = {"box": [cx0, cy0, cx1, cy1], "edge_alpha_max": {k: round(float(v.max()), 3) for k, v in edges.items()}}
        im = save_rgba(rgb, alpha, OUT / f"{name}.webp", scale=0.5, quality=74)
        preview(im, BUILD / f"preview-{name}.png")

    # ---------- leaves only (no lace): green leaf mask plus their own drop shadow ----------
    for name, (lx0, ly0, lx1, ly1) in LEAVES.items():
        P = img[ly0:ly1, lx0:lx1]
        Bm = paper_at(lx0, ly0, lx1, ly1)
        leaf = ndi.grey_dilation(smoothstep(2, 18, P[..., 1] - np.maximum(P[..., 0], P[..., 2])), size=(3, 3))
        near = ndi.gaussian_filter(ndi.binary_dilation(leaf > 0.5, iterations=14).astype(np.float32), 3)
        not_gold = smoothstep(95, 75, P[..., 0] - P[..., 2])  # lace and frame lines are far more orange than a shadow
        a = np.maximum(leaf, color_to_alpha(P, Bm) * near * not_gold) * (1 - text_mask(lx0, ly0, lx1, ly1))
        # shown about 34 px wide, so 2x that is plenty
        im = save_rgba(unmix(P, Bm, np.maximum(color_to_alpha(P, Bm), leaf)), a, OUT / f"{name}.webp", scale=0.16, quality=82)
        layout["crops"][name] = {"box": [lx0, ly0, lx1, ly1], "size": list(im.size)}
        preview(im, BUILD / f"preview-{name}.png")

    # ---------- dividers ----------
    for name, (dx0, dy0, dx1, dy1) in DIVIDERS.items():
        P = img[dy0:dy1, dx0:dx1]
        Bm = paper_at(dx0, dy0, dx1, dy1)
        a = color_to_alpha(P, Bm)
        im = save_rgba(unmix(P, Bm, a), a, OUT / f"{name}.webp", quality=90)
        layout["crops"][name] = {"box": [dx0, dy0, dx1, dy1], "size": list(im.size),
                                 "edge_alpha_max": round(float(max(a[0].max(), a[-1].max(), a[:, 0].max(), a[:, -1].max())), 3)}
        preview(im, BUILD / f"preview-{name}.png")

    # ---------- frame, 9 slice: real corners and straight runs of the printed frame ----------
    o, C, E = FRAME_OFF, FRAME_C, FRAME_E
    S = 2 * C + E

    def piece(px0, py0, w, h):
        P = img[py0:py0 + h, px0:px0 + w]
        Bm = paper_at(px0, py0, px0 + w, py0 + h)
        a = color_to_alpha(P, Bm)
        yy, xx = np.mgrid[py0:py0 + h, px0:px0 + w]
        outside = (xx < OUTER["left"]) | (xx > OUTER["right"]) | (yy < OUTER["top"]) | (yy > OUTER["bottom"])
        band = (1 - interior_mask(px0, py0, px0 + w, py0 + h)) * ndi.gaussian_filter((~outside).astype(np.float32), 1.0)
        return unmix(P, Bm, a), a * band

    mid = PAGE // 2 - E // 2
    far = PAGE - o - C
    canvas_rgb = np.zeros((S, S, 3), np.float32)
    canvas_a = np.zeros((S, S), np.float32)

    def put(rgb_a, x, y):
        rgb, a = rgb_a
        canvas_rgb[y:y + rgb.shape[0], x:x + rgb.shape[1]] = rgb
        canvas_a[y:y + a.shape[0], x:x + a.shape[1]] = a

    put(piece(o, o, C, C), 0, 0)                  # top left corner
    put(piece(far, o, C, C), C + E, 0)            # top right corner
    put(piece(o, far, C, C), 0, C + E)            # bottom left corner
    tr_rgb, tr_a = piece(far, o, C, C)            # bottom right: the print's leaf covers it,
    put((tr_rgb[::-1], tr_a[::-1]), C + E, C + E)  # so it is the top right corner mirrored
    put(piece(mid, o, E, C), C, 0)                # top run
    put(piece(mid, far, E, C), C, C + E)          # bottom run
    put(piece(o, mid, C, E), 0, C)                # left run
    put(piece(far, mid, C, E), C + E, C)          # right run
    im = save_rgba(canvas_rgb, canvas_a, OUT / "frame.webp", quality=90)
    preview(im.resize((S * 3, S * 3), Image.NEAREST), BUILD / "preview-frame.png")
    layout["frame"] = {"source_px": S, "slice_px": C, "offset_from_page_edge_px": o}

    # ---------- palette with contrast on the parchment ----------
    bg_dark = pal["paper_dark_p1"]
    out = {k: hexc(v) for k, v in pal.items()}
    derived = {
        "gold_text_4_5": darken_to(pal["gold_text"], bg_dark, 4.6),
        "teal_4_5": darken_to(pal["teal"], bg_dark, 4.6),
        "veggie_green_3_0": darken_to(pal["veggie_green_p13"], bg_dark, 3.1),
    }
    out.update({k: hexc(v) for k, v in derived.items()})
    # paper vignette for the CSS: fitted paper colour at the centre, a quarter of the way out,
    # the side midpoints and the corners, written as overlays on the tile's base colour
    def model(fx, fy):
        x, y = int(fx * PAGE), int(fy * PAGE)
        return paper_at(x, y, x + 1, y + 1)[0, 0]
    base = pal["paper_edge"]
    centre = model(0.5, 0.5)
    quarter = np.mean([model(0.3, 0.5), model(0.7, 0.5), model(0.5, 0.25), model(0.5, 0.75)], 0)
    sides = np.mean([model(0.08, 0.5), model(0.92, 0.5), model(0.5, 0.06), model(0.5, 0.94)], 0)
    corners = np.mean([model(0.06, 0.06), model(0.94, 0.06), model(0.06, 0.94), model(0.94, 0.94)], 0)
    light = base + (centre - base) / 0.45
    dark = base + (corners - base) / 0.25
    a_of = lambda target, c: float(np.clip(np.mean((target - base) / (c - base)), 0, 1))
    out["paper_vignette"] = {
        "targets": {k: hexc(v) for k, v in dict(centre=centre, quarter=quarter, sides=sides, corners=corners).items()},
        "css_stops": [
            f"rgba({', '.join(str(int(round(v))) for v in light)}, 0.45) 0%",
            f"rgba({', '.join(str(int(round(v))) for v in light)}, {a_of(quarter, light):.2f}) 35%",
            f"rgba({', '.join(str(int(round(v))) for v in light)}, 0) 59%",
            f"rgba({', '.join(str(int(round(v))) for v in dark)}, {a_of(sides, dark):.2f}) 71%",
            f"rgba({', '.join(str(int(round(v))) for v in dark)}, 0.25) 100%",
        ],
    }
    out["contrast_on_darkest_paper"] = {k: round(contrast(v, bg_dark), 2) for k, v in {**pal, **derived}.items() if not k.startswith("paper")}
    (HERE / "palette.json").write_text(json.dumps(out, indent=2) + "\n")
    (HERE / "layout.json").write_text(json.dumps(layout, indent=2) + "\n")
    sizes = {p.name: p.stat().st_size for p in sorted(OUT.glob("*.webp"))}
    print(json.dumps(out, indent=2))
    print(json.dumps(layout, indent=2))
    print(sizes, "total KB", round(sum(sizes.values()) / 1024, 1))


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
