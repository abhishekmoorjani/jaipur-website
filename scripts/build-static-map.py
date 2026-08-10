#!/usr/bin/env python3
"""
Build a self-hosted static map image of the restaurant's location.

Why not the Google Maps iframe it replaces:
  - It contacted Google on every page view, before the visitor agreed to
    anything, and it set cookies. Serving our own image removes the third
    party entirely rather than gating it behind a consent banner.
  - The embed pulls a large JavaScript map the visitor almost never
    interacts with. They want to see where the restaurant is, then tap
    through for directions. A picture plus a link does that.

Tiles come from OpenStreetMap, which is openly licensed (ODbL). The
attribution rendered into the corner of the image is required and must stay.
Google Maps tiles could not be used this way: their terms forbid caching or
re-serving map imagery.

This is a build-time script, run once and committed. It makes a handful of
tile requests, which is within OSM's tile usage policy; it must not be wired
into a per-request or per-build path.
"""

import math
import time
import urllib.request
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw

# From the Restaurant JSON-LD in src/app/layout.tsx, kept in step with it.
LAT, LON = 47.9936, 7.8491
ZOOM = 17
TILE = 256
COLS, ROWS = 4, 3           # 1024 x 768 before cropping
OUT = Path(__file__).resolve().parent.parent / "public/images/map-jaipur.png"
USER_AGENT = "jaipur-freiburg.de static map builder (one-off, contact abi_ind@hotmail.com)"


def deg2tile(lat, lon, zoom):
    """Slippy-map tile numbers, fractional so we can centre precisely."""
    n = 2.0 ** zoom
    x = (lon + 180.0) / 360.0 * n
    lat_rad = math.radians(lat)
    y = (1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n
    return x, y


def fetch_tile(z, x, y):
    url = f"https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as r:
        return Image.open(BytesIO(r.read())).convert("RGB")


def main():
    fx, fy = deg2tile(LAT, LON, ZOOM)
    # Top-left tile of the grid, chosen so the restaurant lands near centre.
    x0 = int(fx) - COLS // 2
    y0 = int(fy) - ROWS // 2

    canvas = Image.new("RGB", (COLS * TILE, ROWS * TILE))
    for dx in range(COLS):
        for dy in range(ROWS):
            tile = fetch_tile(ZOOM, x0 + dx, y0 + dy)
            canvas.paste(tile, (dx * TILE, dy * TILE))
            time.sleep(0.4)   # be a polite client

    # Where the restaurant sits inside the stitched canvas.
    px = (fx - x0) * TILE
    py = (fy - y0) * TILE

    # Crop to a 3:2 frame centred on the restaurant.
    out_w, out_h = 900, 600
    left = int(px - out_w / 2)
    top = int(py - out_h / 2)
    left = max(0, min(left, COLS * TILE - out_w))
    top = max(0, min(top, ROWS * TILE - out_h))
    img = canvas.crop((left, top, left + out_w, top + out_h))

    mx, my = px - left, py - top
    d = ImageDraw.Draw(img, "RGBA")

    # Marker in the site's accent gold, drawn as a pin rather than a flat dot
    # so it reads as a location at a glance.
    gold = (197, 151, 44, 255)
    d.ellipse([mx - 26, my - 26, mx + 26, my + 26], fill=(197, 151, 44, 55))
    d.polygon([(mx, my + 22), (mx - 11, my + 2), (mx + 11, my + 2)], fill=gold)
    d.ellipse([mx - 14, my - 26, mx + 14, my + 2], fill=gold,
              outline=(255, 255, 255, 235), width=3)
    d.ellipse([mx - 5, my - 17, mx + 5, my - 7], fill=(255, 255, 255, 255))

    # ODbL attribution. Required, and must remain legible.
    label = "© OpenStreetMap contributors"
    tw = d.textlength(label)
    d.rectangle([out_w - tw - 14, out_h - 22, out_w, out_h], fill=(255, 255, 255, 205))
    d.text((out_w - tw - 7, out_h - 17), label, fill=(60, 60, 60, 255))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, "PNG", optimize=True)
    print(f"wrote {OUT}  {img.size[0]}x{img.size[1]}  {OUT.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
