"""Cut the intro banner into an empty background plate plus one layer per lamp and dish.

Run from anywhere:  python3 design/intro/cut.py [SOURCE]
SOURCE defaults to design/intro/source/banner.webp. A sharper original of the same banner (same
2.19:1 framing, any width) can be passed instead: every shape and pixel constant below is in
1179 px wide design units and is scaled to the source, and every master keeps the source's own
resolution. Then run export.py, and proof.py with the same SOURCE.
Writes lossless full resolution masters to design/intro/master/ (plate.png, one PNG per layer,
layers.json; gitignored, never shipped) and design/intro/proof/ (cores-overlay.jpg, plate.jpg).
Then export.py makes the WebP sizes the site ships and proof.py measures them.

How the cut works
  core    each lamp and dish is a hand fitted shape (ellipses for bowls, polygons for plates and
          lamps) plus a shifted copy for its shadow, grown a few pixels. Narrow gaps between cores,
          leaves and crumbs touching a core, shadow too deep to lift, scraps the shadow model cannot
          explain and small pockets of table shut in at the picture edge go to the nearest core.
          The cloth (CLOTH) is never cut.
  shadow  near the cores the paper is darker (or lighter) than the clean paper tone B. Each such
          pixel is split into an overlay (opacity A, colour K) over lifted paper P = B plus the
          paper's own fine detail, so that O = A K + (1 - A) P exactly. Every dish carries its share
          of the overlay (split by distance), so its shadow arrives with it. The shares multiply,
          so the arrival order does not matter.
  plate   lifted paper around the holes. Inside them: the clean tone (from unshadowed paper only,
          away from the darker picture edges, so no dark tone bleeds in) plus grain with the clean
          paper's statistics; within MIRROR px of a hole edge the paper's own structure mirrored in,
          so ornament lines run on; the mandala under the platter continued around its centre.
  layer   inside its core the original pixels, opaque except a soft RIM whose colour is solved
          against what lies under it; around the core its share of the overlay. Where a later core
          covers it, it fades to the plate over LATER_FADE px, so a dish never carries a fragment
          of one that has not arrived yet.
  order   layers are listed back to front, which is also the order they appear in.
The plate plus all layers at rest reproduces the original before WebP compression (checked at the
end of main); proof.py measures the shipped files.
"""
from pathlib import Path
import argparse
import json
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "design/intro/source/banner.webp"
# Full resolution, lossless masters (gitignored). export.py makes the sizes the site ships from them.
MASTER = ROOT / "design/intro/master"
PROOF = ROOT / "design/intro/proof"
DESIGN_W, DESIGN_H = 1179, 538  # the units of every shape and pixel constant below
# Region the logo and tagline occupy. Excluded from the composite metric.
LOGO_BOX = (415, 0, 765, 222)
GRID = 4  # layer boxes snap to this many source px, so they land on whole pixels at 1/4, 1/2 and 3/4 size

# Shapes in design pixels. ("e", cx, cy, rx, ry, deg) or ("p", [(x, y), ...]).
# grow: px added around the shape for its shadow. shadow: extra (dx, dy) copy of the shape.
LAYERS = [
    dict(id="lamp-left", grow=4, shadow=(3, 4), shapes=[
        ("p", [(95, 63), (121, 70), (151, 86), (175, 110), (182, 123), (174, 152), (164, 172),
               (152, 192), (122, 203), (104, 207), (74, 208), (46, 192), (30, 172), (18, 156),
               (14, 128), (15, 114), (30, 96), (44, 80), (70, 68)])]),
    dict(id="lamp-right", grow=4, shadow=(3, 4), shapes=[
        ("p", [(1032, 85), (1048, 91), (1076, 108), (1083, 128), (1091, 156), (1072, 178),
               (1064, 198), (1030, 191), (998, 179), (980, 162), (965, 141), (976, 120),
               (989, 100), (1012, 92)]),
        # the shadowed nook between the lamp and the cloth goes with the lamp (CLOTH trims it)
        ("p", [(1030, 80), (1100, 95), (1104, 170), (1130, 196), (1165, 222), (1150, 232),
               (1090, 214), (1050, 200)]),
        # the leaf caught in its spray, and the olive shade under the spray's lowest leaves
        ("p", [(893, 66), (920, 68), (940, 88), (948, 110), (930, 108), (900, 100), (892, 84)]),
        ("p", [(946, 134), (972, 130), (978, 166), (948, 168)])]),
    dict(id="tandoori-platter", grow=5, shadow=(3, 7), shapes=[
        ("p", [(25, 219), (312, 162), (375, 305), (64, 374)]),
        ("e", 280, 180, 21, 20, 0)]),
    dict(id="peas-curry", grow=5, shadow=(4, 5), shapes=[
        ("e", 901, 247, 99, 78, 0),
        ("p", [(792, 170), (812, 160), (850, 170), (848, 200), (806, 226), (795, 205)]),
        ("p", [(948, 318), (992, 288), (1004, 298), (999, 322), (966, 334)]),
        # the leaf tucked into its shadow beside the samosa plate travels with it
        ("p", [(776, 274), (800, 272), (812, 278), (846, 300), (846, 334), (800, 334), (776, 318)])]),
    dict(id="raita", grow=5, shadow=(4, 5), shapes=[
        ("e", 1100, 277, 94, 72, 0)]),
    dict(id="paneer-kadai", grow=5, shadow=(4, 5), shapes=[
        ("e", 92, 420, 94, 79, 0),
        ("p", [(18, 336), (40, 326), (90, 334), (96, 352), (30, 360)])]),
    dict(id="biryani", grow=5, shadow=(4, 5), shapes=[
        ("e", 283, 428, 102, 91, 0),
        ("p", [(114, 504), (212, 458), (228, 478), (128, 524)])]),
    dict(id="thali", grow=5, shadow=(3, 5), shapes=[
        ("e", 576, 372, 200, 155, -5.6),
        ("p", [(452, 262), (510, 224), (570, 216), (640, 224), (712, 258), (700, 300), (470, 300)]),
        ("p", [(526, 498), (590, 490), (656, 498), (670, 538), (518, 538)])]),
    dict(id="samosa-plate", grow=5, shadow=(4, 5), shapes=[
        ("p", [(783, 360), (953, 342), (994, 538), (705, 538)]),
        ("e", 760, 507, 37, 27, 0)]),
    dict(id="paneer-butter-masala", grow=5, shadow=(4, 5), shapes=[
        ("e", 1085, 431, 109, 89, 0),
        ("p", [(976, 334), (1000, 324), (1024, 336), (1016, 372), (982, 368)]),
        ("p", [(1104, 500), (1162, 470), (1178, 488), (1170, 524), (1120, 522)])]),
]
# The green cloth, top right. It stays on the plate whole and is never lifted or cut into; its
# lower left edge here is drawn along the cloth's own folds so the empty plate shows a clean edge.
CLOTH = [(985, 0), (1179, 0), (1179, 250), (1150, 216), (1120, 196), (1100, 179), (1092, 160),
         (1088, 140), (1087, 120), (1091, 104), (1084, 99), (1060, 93), (1040, 86), (1020, 77),
         (1000, 67), (990, 55), (986, 40)]
GAP = 10  # gaps between neighbouring cores narrower than 2*GAP px are absorbed into the nearer core
CRUMB = 80  # px area: specks this small near a dish (peppercorns, stems) go with the dish too
POCKET = 6000  # px area: pockets of table shut in by dishes and the picture edge go to a dish
SHADOW_REACH = 40  # px around the cores where dish shadows are lifted off the paper
SHADOW_DEEP = 0.6  # overlay opacity above which the shadow goes to the core instead
K0 = np.array([40, 25, 10], np.float32)  # darkest shadow colour the overlay may use
MIRROR = 28  # px into a hole over which the paper's own structure carries on, mirrored
LATER_FADE = 16  # px over which a dish fades to the plate where a later dish will cover it
RIM = 4  # px inside each core over which its opacity rises to 1
TAU = 6  # px: how sharply a shared shadow is split between the dishes that cast it
# The mandala a hole crosses near its centre, under the tandoori platter: centre fitted to its
# visible rings, radius of its outer petals. Elsewhere holes only clip mandala edges (MIRROR).
MANDALAS = [dict(c=(310, 222), r=100)]
LUMA = np.array([0.299, 0.587, 0.114], np.float32)


def to_lab(rgb):
    c = np.where(rgb <= 0.04045, rgb / 12.92, ((rgb + 0.055) / 1.055) ** 2.4)
    M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])
    xyz = c @ M.T / np.array([0.95047, 1.0, 1.08883])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def raster(shapes, w, h, k):
    m = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(m)
    yy, xx = np.mgrid[0:h, 0:w]
    out = np.zeros((h, w), bool)
    for s in shapes:
        if s[0] == "p":
            d.polygon([(x * k, y * k) for x, y in s[1]], fill=255)
        else:
            _, cx, cy, rx, ry, deg = (s[0],) + tuple(v * k for v in s[1:5]) + (s[5],)
            t = np.deg2rad(deg)
            u = (xx - cx) * np.cos(t) + (yy - cy) * np.sin(t)
            v = -(xx - cx) * np.sin(t) + (yy - cy) * np.cos(t)
            out |= (u / rx) ** 2 + (v / ry) ** 2 <= 1
    return out | (np.asarray(m) > 0)


def disk(r):
    yy, xx = np.mgrid[-r:r + 1, -r:r + 1]
    return xx ** 2 + yy ** 2 <= r ** 2


def smooth_fill(img, known):
    """Push pull fill: average the known pixels down a pyramid, then pull the coarse estimate
    back up wherever a level has too little support. Returns a smooth, seam free estimate
    everywhere (known pixels keep their value)."""
    k = known.astype(np.float32)
    I, Wt = [img * k[..., None]], [k]
    while min(Wt[-1].shape) > 4:
        I.append(np.stack([ndi.gaussian_filter(I[-1][..., c], 1.0)[::2, ::2] for c in range(img.shape[-1])], -1))
        Wt.append(ndi.gaussian_filter(Wt[-1], 1.0)[::2, ::2])
    est = I[-1] / np.maximum(Wt[-1], 1e-6)[..., None]
    for lvl in range(len(I) - 2, -1, -1):
        h, w = Wt[lvl].shape
        up = np.stack([ndi.zoom(est[..., c], (h / est.shape[0], w / est.shape[1]), order=1)
                       for c in range(img.shape[-1])], -1)
        conf = np.clip(Wt[lvl] * 4, 0, 1)[..., None]
        est = conf * I[lvl] / np.maximum(Wt[lvl], 1e-6)[..., None] + (1 - conf) * up
    return est


def blur(img, s):
    return np.stack([ndi.gaussian_filter(img[..., c], s) for c in range(img.shape[-1])], -1)


def grain(shape, sample, k, seed=7):
    """Paper grain with the statistics of the clean paper: per channel strength in a fine and a
    medium band, and the same correlation between channels. Random rather than tiled, so no motif
    repeats across a large fill."""
    s1, s2 = 1.2 * k, 4 * k
    lo1, lo2 = blur(sample, s1), blur(sample, s2)
    fine, mid = (sample - lo1).reshape(-1, 3), (lo1 - lo2).reshape(-1, 3)
    rng = np.random.default_rng(seed)
    out = np.zeros(shape + (3,), np.float32)
    for band, (a, b) in ((fine, (0, s1)), (mid, (s1, s2))):
        sd = band.std(0)
        rho = np.corrcoef(band.T)[np.triu_indices(3, 1)].mean().clip(0, 1)
        shared = rng.standard_normal(shape)
        noise = [np.sqrt(rho) * shared + np.sqrt(1 - rho) * rng.standard_normal(shape) for _ in range(3)]
        for c in range(3):
            n = noise[c]
            n = (ndi.gaussian_filter(n, a) if a else n) - ndi.gaussian_filter(n, b)
            out[..., c] += n / n.std() * sd[c]
    return out


def mandala_detail(D, visible, hole, k):
    """Continue each mandala into the hole by mirroring its visible part around its centre.
    For every radius the widest visible arc is found; a hidden angle is reflected back and forth
    inside that arc (a mirror is seamless at the arc's ends). The one place the two directions
    meet, opposite the arc, is cross faded. Returns the detail to add and where it applies."""
    H, W = hole.shape
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    add = np.zeros_like(D)
    weight = np.zeros((H, W), np.float32)
    for m in MANDALAS:
        cx, cy = m["c"][0] * k, m["c"][1] * k
        R = m["r"] * k
        r = np.hypot(xx - cx, yy - cy)
        th = np.arctan2(yy - cy, xx - cx)
        todo = hole & (r < R)
        if not todo.any():
            continue
        # visible arc per 1 px ring, from a polar resampling of the visibility mask
        rings = np.arange(0, int(np.ceil(R)) + 1)
        angles = np.deg2rad(np.arange(-180, 180, 0.5))
        T, Rr = np.meshgrid(angles, rings)
        vis = ndi.map_coordinates(visible.astype(np.float32), [cy + Rr * np.sin(T), cx + Rr * np.cos(T)],
                                  order=1, mode="constant") > 0.99
        lo = np.full(len(rings), np.nan)
        hi = np.full(len(rings), np.nan)
        for i, row in enumerate(vis):
            if row.all() or not row.any():
                continue
            # longest run of visible angles, wrapping around
            start = np.argmin(row)  # a hidden angle: rotate so no run wraps
            rr = np.roll(row, -start)
            edges = np.diff(np.r_[0, rr.astype(int), 0])
            s, e = np.nonzero(edges == 1)[0], np.nonzero(edges == -1)[0]
            j = np.argmax(e - s)
            if (e[j] - s[j]) * 0.5 < 40:  # under 40 degrees visible: too little to continue
                continue
            lo[i] = angles[(s[j] + start) % len(angles)]
            hi[i] = lo[i] + (e[j] - s[j] - 1) * np.deg2rad(0.5)
        ri = np.clip(np.round(r[todo]).astype(int), 0, len(rings) - 1)
        a0, a1 = lo[ri], hi[ri]
        ok = ~np.isnan(a0)
        a0, a1 = np.where(ok, a0, 0), np.where(ok, a1, 1)
        mid, span = (a0 + a1) / 2, a1 - a0
        rel = th[todo] - mid
        rt = r[todo]

        def ping_pong(u):  # u >= 0 radians from the arc's middle -> offset inside the arc
            f = (u + span / 2) % (2 * span)
            return np.where(f <= span, f, 2 * span - f) - span / 2

        u_plus = rel % (2 * np.pi)
        u_minus = (-rel) % (2 * np.pi)
        blend = np.deg2rad(20)
        w_plus = np.clip((np.pi + blend - u_plus) / (2 * blend), 0, 1)
        out = np.zeros((todo.sum(), D.shape[-1]), np.float32)
        for src_t, w in ((mid + ping_pong(u_plus), w_plus), (mid - ping_pong(u_minus), 1 - w_plus)):
            sy, sx = cy + rt * np.sin(src_t), cx + rt * np.cos(src_t)
            for c in range(D.shape[-1]):
                out[:, c] += w * ndi.map_coordinates(D[..., c], [sy, sx], order=1)
        # fade the ornament out toward its rim and toward radii with no visible arc
        fade = np.clip((R - r[todo]) / (6 * k), 0, 1) * ok
        add[todo] += out * fade[:, None]
        weight[todo] = np.maximum(weight[todo], fade)
    return add, weight


def build(O, k):
    """Return the plate, the cores, the logo mask, the overlay opacity and each layer's share of it."""
    H, W = O.shape[:2]
    px = lambda v: max(1, int(round(v * k)))
    lab = to_lab(O / 255)

    cover = Image.new("L", (W * 4, H * 4), 0)
    ImageDraw.Draw(cover).polygon([(x * k * 4, y * k * 4) for x, y in CLOTH], fill=255)
    cloth_a = np.asarray(cover.resize((W, H), Image.BOX)).astype(np.float32) / 255  # 4x supersampled coverage
    cloth = cloth_a > 0.999

    cores = []
    for L in LAYERS:
        shape = raster(L["shapes"], W, H, k)
        dx, dy = L.get("shadow", (0, 0))
        shape |= ndi.shift(shape.astype(np.uint8), (round(dy * k), round(dx * k)), order=0) > 0
        cores.append(ndi.binary_dilation(shape, iterations=px(L["grow"])) & ~cloth)
    dists = np.stack([ndi.distance_transform_edt(~c).astype(np.float32) for c in cores])
    nearest = dists.argmin(0)

    def give(mask):
        for i in range(len(cores)):
            cores[i] |= mask & (nearest == i)

    # Narrow slivers of table between dishes: close the union, give each new pixel to the nearest core.
    union = np.any(cores, 0)
    g = px(GAP)
    padded = np.pad(union, g + 1)
    closed = ndi.binary_fill_holes(ndi.binary_closing(padded, structure=disk(g)))[g + 1:-g - 1, g + 1:-g - 1]
    give(closed & ~union)

    # Green logo, tagline and ornament: strokes that differ from a local median of the background.
    x0, y0, x1, y1 = (int(round(v * k)) for v in LOGO_BOX)
    reg = O[y0:y1, x0:x1]
    med = np.stack([ndi.median_filter(reg[..., c], size=px(31) | 1) for c in range(3)], -1)
    strokes = np.abs(reg - med).sum(-1) > 18  # low, to catch the faint antialiased halo too
    strokes = ndi.binary_dilation(strokes, iterations=px(5))
    logo = np.zeros((H, W), bool)
    logo[y0:y1, x0:x1] = strokes
    # Only where the logo really is: keeps the leaf at its upper left and the mandala at its upper right.
    allowed = np.zeros((H, W), bool)
    allowed[px(48):px(222), px(428):px(756)] = True
    allowed[0:px(48), px(520):px(660)] = True
    logo &= allowed
    cores = [c & ~logo for c in cores]

    # Paper: light to mid warm cream, shadowed or not. Leaves, cloth, peppercorns, steel are not.
    paper = (lab[..., 0] > 30) & (lab[..., 1] > 0.5) & (lab[..., 1] < 16) & (lab[..., 2] > 8) & (lab[..., 2] < 40)
    paper &= ~cloth  # its gold embroidery is paper coloured
    union = np.any(cores, 0)
    debris = ~paper & ~union & ~logo & ~cloth
    # Leaves and peppercorns that touch a core go with it, whole, and so do crumbs near one. Eroding
    # first separates the leaves of a spray (their stems vanish); every debris pixel then joins its
    # nearest leaf, and specks too thin to survive the erosion count on their own.
    seeds, n = ndi.label(ndi.binary_erosion(debris, iterations=px(2)))
    dist, (iy, ix) = ndi.distance_transform_edt(seeds == 0, return_indices=True)
    parts = np.where(debris & (dist <= 3 * k), seeds[iy, ix], 0)
    rest, m = ndi.label(debris & (parts == 0))
    parts = np.where(rest > 0, rest + n, parts)
    area = ndi.sum(np.ones((H, W)), parts, np.arange(n + m + 1))
    green = ndi.mean(lab[..., 1], parts, np.arange(n + m + 1)) < -3  # leaves, not shadow scraps
    margin = np.zeros((H, W), bool)  # leaf shadows given away; they must not pull in more leaves

    def attach():
        union = np.any(cores, 0)
        solid = union & ~margin
        go = np.zeros(n + m + 1, bool)
        # touching means a real contact, not a corner of the leaf's own shadow
        contact = np.bincount(parts[ndi.binary_dilation(solid, iterations=px(2)) & (parts > 0)], minlength=n + m + 1)
        go[contact >= 10 * k] = True
        near = np.unique(parts[(ndi.distance_transform_edt(~solid) < SHADOW_REACH * k) & (parts > 0)])
        go[near[(area[near] < CRUMB * k * k) | ~green[near]]] = True  # crumbs and dark scraps
        go[0] = False
        # small pieces of a spray that went (a leaf tip, a stem) go with it
        nearby = np.unique(parts[ndi.binary_dilation(go[parts], iterations=px(3)) & (parts > 0)])
        go[nearby[area[nearby] < 4 * CRUMB * k * k]] = True
        # but a stem tip beside a leaf that stays, stays with it
        stays = ~go & (area >= 4 * CRUMB * k * k)
        stays[0] = False
        beside = np.unique(parts[ndi.binary_dilation(stays[parts], iterations=px(3)) & (parts > 0)])
        go[beside[area[beside] < 4 * CRUMB * k * k]] = False
        go[0] = False
        # a leaf lying over one that goes, goes with it (else it keeps a bite where they overlapped)
        while True:
            more = np.bincount(parts[ndi.binary_dilation(go[parts], iterations=px(2)) & (parts > 0)], minlength=n + m + 1)
            new = (more >= 10 * k) & ~go & green
            new[0] = False
            if not new.any():
                break
            go |= new
        taken = go[parts]
        # their own soft shadow on the paper goes with them, but never the edge of a leaf that stays
        stay = (parts > 0) & ~taken & ~union
        ring = ndi.binary_dilation(taken, iterations=px(5)) & paper & ~logo & ~cloth & ~union
        ring &= ~ndi.binary_dilation(stay, iterations=px(6))
        margin[:] |= ring
        give((taken | ring) & ~union)
        return np.any(cores, 0)

    union = attach()
    debris &= ~union

    # Local paper tone: paper pixels only, so leaves and dish edges never tint it.
    dcore = ndi.distance_transform_edt(~union).astype(np.float32)
    known = paper & ~union & ~logo & ~ndi.binary_dilation(debris, iterations=px(4))
    num = blur(O * known[..., None], 3 * k)
    den = ndi.gaussian_filter(known.astype(np.float32), 3 * k)
    Osm = np.where((den > 0.15)[..., None], num / np.maximum(den, 1e-6)[..., None], smooth_fill(O, known))
    # Clean paper tone: a shadow only ever darkens, so keep re-estimating a smooth tone from the
    # paper that is not darker than it. That converges on the unshadowed paper right up to each hole.
    # The banner darkens toward its left, right and bottom edges; there the edge strip is all that
    # borders the big holes, so it would drag a dark band down the empty plate. Leave it out.
    inner = np.zeros((H, W), bool)
    inner[:H - px(30), px(30):W - px(30)] = True
    B = blur(smooth_fill(O, known & inner & (dcore > 30 * k)), 15 * k)
    for _ in range(4):
        lit = known & inner & (Osm @ LUMA >= B @ LUMA - 3)
        B = blur(smooth_fill(Osm, lit), 10 * k)
    prox = np.clip(ndi.gaussian_filter(known.astype(np.float32), 8 * k) * 2.5, 0, 1)
    # Overlay opacity: the least opacity of an overlay no darker than K0 (or, where the paper near a
    # dish is lighter than the estimate, no lighter than white) that turns the clean tone into the
    # local tone in every channel. Then the paper right around every hole is exactly the clean
    # tone the hole is filled with, and no seam can show. prox keeps it off the cloth.
    dark = np.clip(((B - Osm) / np.maximum(B - K0, 1)).max(-1), 0, 0.95) * prox
    A_full = np.maximum(dark, np.clip(((Osm - B) / np.maximum(255 - B, 1)).max(-1), 0, 0.95) * prox)
    reach = SHADOW_REACH * k
    fade = np.clip((reach - dcore) / (15 * k), 0, 1)
    A = A_full * fade * fade * (3 - 2 * fade)

    # Too deep to lift cleanly (dish edges, reflections): that shadow travels opaque with its dish.
    deep = dark * fade * fade * (3 - 2 * fade) > SHADOW_DEEP
    give(ndi.binary_dilation(deep & paper & ~union & ~logo, iterations=px(1)) & ~logo & ~debris)
    # A leaf that only touches a dish through a shadow that just went to it goes with it too.
    union = attach()
    # Dark, not green debris joined to a dish (a shadow wedge tucked against a kept leaf) goes too.
    brown = debris & ~union & (lab[..., 1] >= -3)
    scrap = ndi.binary_propagation(ndi.binary_dilation(union, iterations=px(1)) & brown, mask=brown)
    give(ndi.binary_dilation(scrap, iterations=px(1)) & ~logo & ~cloth & (paper | brown))
    union = np.any(cores, 0)
    # Pockets of table shut in by dishes and the left, right or bottom edge: the dark corners along
    # the bottom. Small ones go to the nearest dish, so the empty plate has no dark wedges.
    walls = np.pad(union, 1, constant_values=True)
    walls[0, :] = False
    shut = ndi.binary_fill_holes(walls)[1:-1, 1:-1] & ~union
    pockets, npk = ndi.label(shut)
    small = np.r_[False, ndi.sum(np.ones((H, W)), pockets, np.arange(1, npk + 1)) < POCKET * k * k]
    give(small[pockets] & ~logo)
    # Dark scraps the shadow model cannot explain (a rim reflection, a shadow wedge beside a leaf).
    union = np.any(cores, 0)
    odd = (np.abs((O - Osm) @ LUMA) > 30) & paper & ~union & ~logo & (dcore < SHADOW_REACH * k)
    # and olive shadow between leaves, which lifts to a green tint no paper has
    odd |= (to_lab(np.clip(B + O - Osm, 0, 255) / 255)[..., 1] < 1) & paper & ~union & ~logo & (dcore < SHADOW_REACH * k)
    leaves = debris & ~union & (area[parts] >= 4 * CRUMB * k * k)
    odd &= ~ndi.binary_dilation(leaves, iterations=px(6))  # a kept leaf's own shadow is not a scrap
    give(ndi.binary_dilation(odd, iterations=px(2)) & paper & ~logo & ~cloth)
    union = np.any(cores, 0)
    debris &= ~union
    hole = union | logo
    A[hole] = 0
    A[A < 0.004] = 0
    zone = A > 0

    # Lifted paper = clean tone + the paper's own detail (grain, ornament, leaves) at its own
    # contrast. The overlay colour K absorbs the rest (main solves it again against the stored plate).
    a3 = np.maximum(A, 1e-6)[..., None]
    K = np.clip((O - (1 - a3) * (B + O - Osm)) / a3, 0, 255)
    P = O.copy()
    P[zone] = ((O - a3 * K) / (1 - a3))[zone]

    # Inside the holes: clean tone plus grain, and the mandala continued where one is crossed.
    G = grain((H, W), O[px(100):px(140), px(320):px(370)], k)  # a clean patch beside the mandala
    # Fine structure (grain, ornament) of the visible paper, lifted.
    vis_paper = (zone | (~hole & paper)) & ~ndi.binary_dilation(debris, iterations=px(2)) & ~cloth
    base = np.where(vis_paper[..., None], P, B)
    Dt = base - blur(base, 3 * k)
    visible = ndi.binary_erosion(vis_paper, iterations=px(2))
    # Near every hole edge the paper's own structure carries on as a mirror image of the paper just
    # outside, fading out over MIRROR px, so ornament lines run on instead of stopping at a leaf's
    # outline. The synthetic grain takes over deeper in (square root weights keep the strength even).
    din, (iy, ix) = ndi.distance_transform_edt(~visible, return_indices=True)
    yy, xx = np.mgrid[0:H, 0:W]
    my, mx = np.clip(2 * iy - yy, 0, H - 1), np.clip(2 * ix - xx, 0, W - 1)
    f = np.clip(1 - din / (MIRROR * k), 0, 1) * visible[my, mx] * hole
    f = (f * f * (3 - 2 * f))[..., None]
    S = B + np.sqrt(f) * Dt[my, mx] + np.sqrt(1 - f) * G
    # The mandala a hole crosses whole: continued around its centre.
    add, mw = mandala_detail(Dt, visible, hole, k)
    S = S * (1 - mw[..., None]) + (B + add) * mw[..., None]
    # Where the lamp's nook meets the cloth: the cloth's own edge, antialiased, with a soft contact
    # shadow on the paper, so the cloth reads as lying on the paper, not cut out of it.
    dcl = ndi.distance_transform_edt(~cloth).astype(np.float32)
    S *= (1 - 0.22 * np.exp(-dcl / (2.5 * k)))[..., None]
    S = S * (1 - cloth_a[..., None]) + O * cloth_a[..., None]
    P[hole] = S[hole]
    P = np.clip(P, 0, 255)

    # Each dish carries its share of every shadow overlay: split by distance (softmax), so the
    # shares fade into each other instead of meeting at a hard line.
    logits = -dists / (TAU * k)
    logits -= logits.max(0)
    share = np.exp(logits)
    share /= share.sum(0)
    return dict(P=P, cores=cores, logo=logo, A=A, share=share, box=(x0, y0, x1, y1), zone=zone)


def main(src_path):
    src = Image.open(src_path).convert("RGB")
    W, H = src.size
    assert abs(H / W - DESIGN_H / DESIGN_W) < 0.005, f"{src_path} is {W} x {H}, not the banner's 2.19:1 framing"
    k = W / DESIGN_W
    O = np.asarray(src).astype(np.float32)
    r = build(O, k)
    P, cores, logo, A, share = r["P"], r["cores"], r["logo"], r["A"], r["share"]

    MASTER.mkdir(parents=True, exist_ok=True)
    PROOF.mkdir(parents=True, exist_ok=True)
    Pq = P.round()
    # Overlay colour against the plate as it will be stored, so the rest state stays exact.
    a3 = np.maximum(A, 1e-6)[..., None]
    K = np.where((A > 0)[..., None], np.clip((O - (1 - a3) * Pq) / a3, 0, 255), 0)
    Image.fromarray(Pq.astype(np.uint8)).save(MASTER / "plate.png", compress_level=1)
    review = lambda im: im.resize((DESIGN_W, DESIGN_H), Image.LANCZOS)  # review images stay small
    review(Image.fromarray(Pq.astype(np.uint8))).save(PROOF / "plate.jpg", quality=92)

    # Self check before compression: plate plus layers at rest must equal the source.
    comp = Pq.copy()
    manifest = []
    feather = max(1, round(LATER_FADE * k))
    for i, (L, core) in enumerate(zip(LAYERS, cores)):
        later = np.any(cores[i + 1:], 0) if i + 1 < len(cores) else np.zeros_like(core)
        # Reach under every later neighbour, fading to the plate (s below), so a later dish's soft rim
        # always lies over solid content. Where two soft rims met over the plate, resizing each layer
        # on its own (export.py, the browser) let a hairline of light plate through between them.
        reach = ndi.distance_transform_edt(~core)
        core = core | (later & (reach <= feather))
        s = np.clip(np.maximum(ndi.distance_transform_edt(later), reach) / feather, 0, 1)[..., None]
        a_sh = 1 - (1 - A) ** share[i]
        alpha = np.where(core, 1.0, a_sh)
        rgb = np.where(core[..., None], O * (1 - s) + Pq * s, K)
        rgb[logo] = Pq[logo]
        # A soft rim: over the core's outer RIM px the opacity rises from the shadow overlay's to 1,
        # with the colour solved against what lies under it, so the layer has no hard edge for
        # WebP to ring on and the rest state stays exact.
        d_in, (iy, ix) = ndi.distance_transform_edt(core, return_indices=True)
        t = np.clip((d_in - 0.5) / (RIM * k), 0, 1)
        a_rim = a_sh[iy, ix] + (1 - a_sh[iy, ix]) * t * t * (3 - 2 * t)
        prev = comp
        need = np.where(O > prev, (O - prev) / np.maximum(255 - prev, 1), (prev - O) / np.maximum(prev, 1)).max(-1)
        a_rim = np.clip(np.maximum(a_rim, need), 1e-3, 1)
        rim = core & (s[..., 0] == 0) & (t < 1)
        alpha[rim] = a_rim[rim]
        rgb[rim] = np.clip((O - (1 - a_rim[..., None]) * prev) / a_rim[..., None], 0, 255)[rim]
        ys, xs = np.nonzero(alpha > 0.002)
        # boxes on the GRID: whole pixels in every exported size, and WebP chroma blocks on the source grid
        bx0, by0 = xs.min() // GRID * GRID, ys.min() // GRID * GRID
        bx1, by1 = min(W, -(-(xs.max() + 1) // GRID) * GRID), min(H, -(-(ys.max() + 1) // GRID) * GRID)
        rgba = np.dstack([rgb, alpha * 255])[by0:by1, bx0:bx1]
        q = rgba.round() / [1, 1, 1, 255]
        comp[by0:by1, bx0:bx1] = q[..., :3] * q[..., 3:] + comp[by0:by1, bx0:bx1] * (1 - q[..., 3:])
        Image.fromarray(rgba.round().astype(np.uint8), "RGBA").save(
            MASTER / f"{L['id']}.png", compress_level=1)
        manifest.append(dict(id=L["id"], x=int(bx0), y=int(by0), w=int(bx1 - bx0), h=int(by1 - by0)))

    x0, y0, x1, y1 = r["box"]
    keep = np.ones((H, W), bool)
    keep[y0:y1, x0:x1] = False
    exact = np.abs(comp - O)[keep].mean()
    assert exact < 0.5, f"at-rest composite differs from the source before compression: {exact:.3f}"
    print(f"at-rest composite before compression: mean abs diff {exact:.3f}")

    (MASTER / "layers.json").write_text(json.dumps(dict(width=W, height=H, logoBox=[x0, y0, x1, y1], layers=manifest), indent=2) + "\n")

    # Review aid: core outlines (magenta) and the reach of the lifted shadows (cyan) on the source.
    edge = np.zeros((H, W), bool)
    for c in cores + [logo]:
        edge |= c & ~ndi.binary_erosion(c, iterations=max(1, round(k)))  # still visible at review size
    z = r["zone"]
    a = O.astype(np.uint8).copy()
    a[z & ~ndi.binary_erosion(z)] = (0, 200, 255)
    a[edge] = (255, 0, 255)
    review(Image.fromarray(a)).save(PROOF / "cores-overlay.jpg", quality=92)
    print("plate + %d layers written at %d x %d" % (len(manifest), W, H))


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("source", nargs="?", default=str(SRC), help="banner image (default: %(default)s)")
    main(Path(ap.parse_args().source))
