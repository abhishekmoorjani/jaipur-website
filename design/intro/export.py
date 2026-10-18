"""Export the image sizes the site ships from the full resolution masters cut.py wrote.

Run after cut.py:  python3 design/intro/export.py
Reads design/intro/master/. Writes public/images/intro/ and src/data/intro-layers.json:
  {name}-{w}.webp        plate and every layer at 1/4, 1/2 and 3/4 of the master size; w is the plate
                         width of that set, so the browser picks one set for all images (srcset + sizes)
  {name}-phone-{w}.webp  the same, cut to the band a phone shows (the picture covers the screen and is
                         centred on the thali, so a phone sees a narrow upright slice); layers outside
                         the band get no phone file and are never downloaded on a phone
Resampling is premultiplied and in float, so shadows and soft edges keep their colour, and every box
is on cut.py's GRID, so each set stays pixel aligned with its own plate.
"""
from pathlib import Path
import json
import numpy as np
from PIL import Image
from cut import DESIGN_W, GRID, MASTER

ROOT = Path(__file__).resolve().parents[2]
OUT_IMG = ROOT / "public/images/intro"
OUT_JSON = ROOT / "src/data/intro-layers.json"
QUARTERS = (1, 2, 3)  # shipped sizes in quarters of the master; the full master is never shipped
PLATE_Q, LAYER_Q = 86, 80  # WebP quality: smooth paper bands below about 85, dishes hold up at 80 (NOTES.md)
THALI_X = 576 / DESIGN_W  # the picture is centred on the thali (intro.module.css)
PHONE_ASPECT = 3 / 5  # widest screen that gets the phone files: (max-aspect-ratio: 3/5) in HomeIntro.tsx


def resize(rgba, w, h):
    """Lanczos in float on premultiplied colour, so a soft edge never picks up a dark or light fringe."""
    a = rgba[..., 3:] / 255
    pre = np.dstack([rgba[..., :3] * a, a]).astype(np.float32)
    out = np.dstack([np.asarray(Image.fromarray(np.ascontiguousarray(pre[..., c]), "F").resize((w, h), Image.LANCZOS))
                     for c in range(4)])
    a = np.clip(out[..., 3:], 0, 1)
    return np.dstack([np.clip(out[..., :3] / np.maximum(a, 1e-6), 0, 255), a * 255]).round().astype(np.uint8)


def save(rgba, path, plate):
    if plate:
        Image.fromarray(rgba[..., :3], "RGB").save(path, quality=PLATE_Q, method=6)
    else:
        Image.fromarray(rgba, "RGBA").save(path, quality=LAYER_Q, alpha_quality=100, method=6)
    return path.stat().st_size


def main():
    meta = json.loads((MASTER / "layers.json").read_text())
    W, H = meta["width"], meta["height"]
    assert W % 4 == 0 and H % 4 == 0, f"master is {W} x {H}: export needs both a multiple of 4 (use the 4x source)"
    widths = [W * q // 4 for q in QUARTERS]
    # The band any screen up to PHONE_ASPECT wide sees, centred on the thali, plus one GRID step of slack.
    half = PHONE_ASPECT * H / 2
    b0 = max(0, int((THALI_X * W - half) // GRID * GRID) - GRID)
    b1 = min(W, int(-(-(THALI_X * W + half) // GRID) * GRID) + GRID)

    OUT_IMG.mkdir(parents=True, exist_ok=True)
    for f in OUT_IMG.glob("*.webp"):
        f.unlink()  # generated files only; stale sizes would otherwise linger
    plate = np.asarray(Image.open(MASTER / "plate.png").convert("RGBA"))
    items = [dict(id="plate", x=0, y=0, w=W, h=H)] + meta["layers"]
    totals = {}
    out_layers = []
    for it in items:
        rgba = plate if it["id"] == "plate" else np.asarray(Image.open(MASTER / f"{it['id']}.png").convert("RGBA"))
        assert rgba.shape[:2] == (it["h"], it["w"]) and it["x"] % GRID == 0 and it["y"] % GRID == 0, it["id"]
        x0, x1 = max(it["x"], b0), min(it["x"] + it["w"], b1)
        phone = [x0, x1 - x0] if x1 > x0 else None
        for q, v in zip(QUARTERS, widths):
            size = save(resize(rgba, it["w"] * q // 4, it["h"] * q // 4), OUT_IMG / f"{it['id']}-{v}.webp", it["id"] == "plate")
            totals[("full", v)] = totals.get(("full", v), 0) + size
            if phone:
                crop = rgba[:, x0 - it["x"]:x1 - it["x"]]
                size = save(resize(crop, phone[1] * q // 4, it["h"] * q // 4), OUT_IMG / f"{it['id']}-phone-{v}.webp",
                            it["id"] == "plate")
                totals[("phone", v)] = totals.get(("phone", v), 0) + size
        if it["id"] != "plate":
            out_layers.append(dict(it, phone=phone))
    OUT_JSON.write_text(json.dumps(dict(width=W, height=H, widths=widths, logoBox=meta["logoBox"], phone=[b0, b1 - b0],
                                        layers=out_layers), indent=2) + "\n")
    for (kind, v), n in sorted(totals.items()):
        print(f"{kind:5} set {v:>4}: {n:>9,} bytes")


if __name__ == "__main__":
    main()
