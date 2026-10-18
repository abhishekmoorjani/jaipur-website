"""Prove the cut: composite the shipped plate + every layer at rest and compare with the source banner.

Run:  python3 design/intro/proof.py SOURCE   (the same SOURCE cut.py was given)
Reads the WebP files the site ships, every size set and its phone crop, and compares each with the
source resized to that size (so compression and resampling are both included in the number).
Writes design/intro/proof/composite.jpg, diff-x8.jpg and side-by-side.jpg (source above, composite
below) from the smallest set, prints the difference per set.
"""
from pathlib import Path
import io
import json
import sys
import numpy as np
from PIL import Image
from cut import SRC
from export import PLATE_Q

ROOT = Path(__file__).resolve().parents[2]
IMG = ROOT / "public/images/intro"
PROOF = ROOT / "design/intro/proof"
meta = json.loads((ROOT / "src/data/intro-layers.json").read_text())
W, H = meta["width"], meta["height"]
source = Image.open(sys.argv[1] if len(sys.argv) > 1 else SRC).convert("RGB")
assert source.size == (W, H), f"source is {source.size}, the cut was made from {W} x {H}"


def load(name):
    return np.asarray(Image.open(IMG / f"{name}.webp").convert("RGBA")).astype(np.float64)


for v in meta["widths"]:
    s = v // (W // 4) / 4  # an exact quarter, so every box lands on whole pixels
    src = np.asarray(source.resize((v, round(H * s)), Image.LANCZOS)).astype(np.float64)
    x0, y0, x1, y1 = (round(c * s) for c in meta["logoBox"])
    keep = np.ones(src.shape[:2], bool)
    keep[y0:y1, x0:x1] = False
    # Floor: what re-encoding the source alone at the plate's quality costs. Anything far above it
    # would be a mask or placement error, not compression.
    buf = io.BytesIO()
    Image.fromarray(src.astype(np.uint8)).save(buf, "WEBP", quality=PLATE_Q, method=6)
    floor = np.abs(np.asarray(Image.open(buf).convert("RGB")).astype(np.float64) - src)[keep].mean()
    for phone in (False, True):
        px, pw = meta["phone"] if phone else (0, W)
        comp = np.zeros_like(src)
        comp[:, round(px * s):round((px + pw) * s)] = load(f"plate-phone-{v}" if phone else f"plate-{v}")[..., :3]
        for L in meta["layers"]:
            if phone and not L["phone"]:
                continue
            lay = load(f"{L['id']}-phone-{v}" if phone else f"{L['id']}-{v}")
            lx = L["phone"][0] if phone else L["x"]
            a = lay[..., 3:] / 255
            sl = (slice(round(L["y"] * s), round(L["y"] * s) + lay.shape[0]), slice(round(lx * s), round(lx * s) + lay.shape[1]))
            comp[sl] = lay[..., :3] * a + comp[sl] * (1 - a)
        region = keep.copy()
        region[:, :round(px * s)] = region[:, round((px + pw) * s):] = False
        d = np.abs(comp - src)
        mad = d[region].mean()
        print(f"{'phone' if phone else 'full':5} set {v:>4}: mean abs diff {mad:.3f} / 255 outside the logo box "
              f"(encode floor {floor:.3f}), 99th pct {np.percentile(d[region].max(-1), 99):.0f}, max {d[region].max():.0f}")
        assert mad < floor * 1.5, f"composite drifts from the source: {mad:.2f} vs encode floor {floor:.2f}"
        if v == meta["widths"][0] and not phone:
            PROOF.mkdir(parents=True, exist_ok=True)
            Image.fromarray(comp.round().astype(np.uint8)).save(PROOF / "composite.jpg", quality=92)
            Image.fromarray(np.clip(d * 8, 0, 255).astype(np.uint8)).save(PROOF / "diff-x8.jpg", quality=92)
            both = np.concatenate([src, comp], 0).round().astype(np.uint8)
            Image.fromarray(both).save(PROOF / "side-by-side.jpg", quality=92)
