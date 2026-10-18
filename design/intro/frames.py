"""Capture intro frames and check the guardrails against the built site in out/.

Run after:  SITE_BASE_PATH="" SITE_ORIGIN="https://jaipur-freiburg.de" npx next build
Then:       python3 design/intro/frames.py SOURCE   (the banner cut.py was given; without it the
            rest state placement check is skipped)
Starts a short lived static server on a free port and the system Chrome (no browser
download), and stops both before it exits, also on failure.

Besides the frames: at rest (3.0 s) the picture is compared with the source mapped through the
picture's own box, logo, tagline and navbar hidden or left out, so a piece that is off its place
shows as an outline in {size}-rest-diff-x8.jpg; a 2x Retina crop of the thali at 1440; and the
intro image bytes a Retina desktop, a 1920 desktop and a 3x phone really download.

Frames are taken by pausing the GSAP timeline and seeking it, so frame N shows exactly
second N of the intro regardless of screenshot latency. The guardrail checks run in
real time.
"""
from pathlib import Path
import io
import json
import socket
import subprocess
import sys
import time
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "out"
FRAMES = ROOT / "design/intro/frames"
TIMES = [0.0, 1.2, 2.0, 3.4]
SIZES = {"desktop": (1440, 900), "wide": (1920, 1080), "phone": (390, 844)}
PAYLOAD = {"Retina desktop 1440 x 900 at 2x": (1440, 900, 2), "desktop 1920 x 1080 at 1x": (1920, 1080, 1),
           "phone 390 x 844 at 3x": (390, 844, 3)}
STAGE = 'img[src*="/images/intro/plate-"]'
ACTIVE_SLIDE = """() => {
    const show = document.querySelector('[class*="__heroSlideshow"]');
    return show ? [...show.children].findIndex(e => e.className.includes('heroSlideActive')) : -1;
}"""


def free_port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def wait_for_timeline(page):
    page.wait_for_function("() => !!window.__jaipurIntro", timeout=15000)


def rest_check(page, name, w, h, source):
    """Screenshot the picture at rest without logo, tagline and band, and compare it with the source
    resampled through the picture's own box. Returns the mean difference outside navbar and logo box."""
    page.evaluate("""() => { window.__jaipurIntro.seek(3.0);
        document.querySelectorAll('[class*="__brand"], [class*="__band"]').forEach(e => e.style.visibility = 'hidden'); }""")
    page.wait_for_timeout(150)
    r = page.evaluate("() => { const b = document.querySelector('[class*=\"__picture\"]').getBoundingClientRect();"
                      " return [b.x, b.y, b.width, b.height, document.querySelector('nav').getBoundingClientRect().bottom]; }")
    x, y, pw, ph, nav = r
    shot = np.asarray(Image.open(io.BytesIO(page.screenshot())).convert("RGB")).astype(float)
    W, H = source.size
    ref = np.asarray(source.resize((w, h), Image.LANCZOS, box=(-x * W / pw, -y * H / ph, (w - x) * W / pw, (h - y) * H / ph))).astype(float)
    meta = json.loads((ROOT / "src/data/intro-layers.json").read_text())
    l0, t0, l1, t1 = meta["logoBox"]
    keep = np.ones((h, w), bool)
    keep[:int(nav) + 2] = False
    keep[max(0, int(y + t0 * ph / H)):int(y + t1 * ph / H) + 1, max(0, int(x + l0 * pw / W)):int(x + l1 * pw / W) + 1] = False
    d = np.abs(shot - ref)
    Image.fromarray(np.clip(d * 8, 0, 255).astype(np.uint8)).save(FRAMES / f"{name}-rest-diff-x8.jpg", quality=88)
    return d[keep].mean()


def main():
    FRAMES.mkdir(parents=True, exist_ok=True)
    source = Image.open(sys.argv[1]).convert("RGB") if len(sys.argv) > 1 else None
    port = free_port()
    server = subprocess.Popen([sys.executable, "-m", "http.server", str(port), "--bind", "127.0.0.1"],
                              cwd=OUT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    url = f"http://127.0.0.1:{port}/?intro-debug"
    results = []
    try:
        time.sleep(0.6)
        with sync_playwright() as p:
            browser = p.chromium.launch(channel="chrome", headless=True)
            try:
                for name, (w, h) in SIZES.items():
                    ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
                    page = ctx.new_page()
                    page.goto(url, wait_until="load")
                    wait_for_timeline(page)
                    page.evaluate("() => { window.__jaipurIntro.pause(); }")
                    for t in TIMES:
                        page.evaluate(f"() => {{ window.__jaipurIntro.seek({t}); }}")
                        page.wait_for_timeout(120 if t < 4.4 else 400)
                        page.screenshot(path=str(FRAMES / f"{name}-t{t:.1f}s.jpg"), quality=88)
                    hscroll = page.evaluate("() => document.documentElement.scrollWidth - window.innerWidth")
                    results.append(f"{name}: horizontal overflow {hscroll}px")
                    if source:
                        results.append(f"{name}: at rest vs source, mean abs diff {rest_check(page, name, w, h, source):.2f} / 255")
                    ctx.close()

                    # Skip: a click at 0.6 s ends the intro.
                    ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
                    page = ctx.new_page()
                    page.goto(url, wait_until="load")
                    wait_for_timeline(page)
                    page.wait_for_function("() => window.__jaipurIntro.time() >= 0.6", polling=10)
                    # Navbar stays on top: what is under the reserve button (desktop) or menu button (phone)?
                    sel = 'nav button[aria-label="Toggle menu"]' if name == "phone" else 'nav a[href="#reservations"]'
                    on_top = page.evaluate(f"""() => {{
                        const b = document.querySelector('{sel}').getBoundingClientRect();
                        const hit = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2);
                        return !!hit.closest('nav');
                    }}""")
                    results.append(f"{name}: navbar control on top during intro: {on_top}")
                    page.mouse.click(w // 2, int(h * 0.6))
                    page.wait_for_timeout(450)
                    page.screenshot(path=str(FRAMES / f"{name}-skip-click-at-0.6s.jpg"), quality=88)
                    gone = page.locator(STAGE).count() == 0
                    results.append(f"{name}: stage removed 0.45 s after a click at 0.6 s: {gone}")
                    ctx.close()

                # Retina sharpness: a 2x crop of the thali at rest, 1440 x 900.
                ctx = browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=2)
                page = ctx.new_page()
                page.goto(url, wait_until="load")
                wait_for_timeline(page)
                page.wait_for_load_state("networkidle")
                page.evaluate("() => { window.__jaipurIntro.pause(); window.__jaipurIntro.seek(3.0); }")
                page.wait_for_timeout(200)
                b = page.locator('img[src*="/images/intro/thali-"]').bounding_box()
                page.screenshot(path=str(FRAMES / "desktop-retina-thali-2x-t3.0s.jpg"), quality=92,
                                clip={"x": b["x"] + b["width"] * 0.18, "y": b["y"] + b["height"] * 0.2,
                                      "width": b["width"] * 0.64, "height": min(b["height"] * 0.5, 900 - b["y"] - b["height"] * 0.2)})
                ctx.close()

                # What each device really downloads for the intro.
                for label, (w, h, dpr) in PAYLOAD.items():
                    ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=dpr,
                                              is_mobile=dpr > 2, has_touch=dpr > 2)
                    page = ctx.new_page()
                    page.goto(url, wait_until="load")
                    page.wait_for_load_state("networkidle")
                    files = page.evaluate("""() => performance.getEntriesByType('resource')
                        .filter(e => e.name.includes('/images/intro/')).map(e => [e.name.split('/').pop(), e.encodedBodySize])""")
                    results.append(f"payload {label}: {sum(n for _, n in files):,} bytes in {len(files)} files: "
                                   + ", ".join(f for f, _ in sorted(files)))
                    ctx.close()

                # Carousel timer starts when the intro ends, not on mount.
                ctx = browser.new_context(viewport={"width": 1440, "height": 900})
                page = ctx.new_page()
                t0 = time.monotonic()
                page.goto(url, wait_until="commit")
                ended = changed = None
                seen = False
                while time.monotonic() - t0 < 14 and changed is None:
                    now = time.monotonic() - t0
                    present = page.locator(STAGE).count() > 0
                    seen = seen or present
                    if ended is None and seen and not present:
                        ended = now
                    if page.evaluate(ACTIVE_SLIDE) not in (0, -1):
                        changed = now
                    time.sleep(0.05)
                results.append(f"carousel: intro ended {ended:.2f} s, first slide change {changed:.2f} s "
                               f"(gap {changed - ended:.2f} s, expected about 5)")

                # Played once: client side navigation away and back does not replay it.
                page.evaluate("() => document.querySelector('a[href=\"/impressum\"]').click()")
                page.wait_for_url("**/impressum", timeout=10000)
                page.wait_for_timeout(500)
                page.evaluate("() => document.querySelector('nav a[class*=\"navLink\"][href=\"/\"]').click()")
                page.wait_for_function("() => location.pathname === '/'", timeout=10000)
                page.wait_for_timeout(800)
                results.append(f"client side return to /: intro replayed: {page.locator(STAGE).count() > 0}")
                ctx.close()

                # Reduced motion: no intro at all, carousel runs from load.
                ctx = browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
                page = ctx.new_page()
                page.goto(url, wait_until="load")
                page.wait_for_timeout(300)
                page.screenshot(path=str(FRAMES / "desktop-reduced-motion-t0.3s.jpg"), quality=88)
                results.append(f"reduced motion: stage visible: {page.locator(STAGE).count() > 0 and page.locator(STAGE).is_visible()}")
                ctx.close()

                # Language: the tagline follows the site language. A programmatic click on the
                # navbar language button does not send pointerdown, so it does not skip the intro.
                ctx = browser.new_context(viewport={"width": 1440, "height": 900})
                page = ctx.new_page()
                page.goto(url, wait_until="load")
                wait_for_timeline(page)
                page.evaluate("() => { window.__jaipurIntro.pause(); window.__jaipurIntro.seek(3.0); }")
                for lang in ("EN", "FR"):
                    page.evaluate(f"() => [...document.querySelectorAll('nav button')].find(b => b.textContent.trim() === '{lang}').click()")
                    page.wait_for_timeout(200)
                    page.screenshot(path=str(FRAMES / f"desktop-{lang.lower()}-t3.0s.jpg"), quality=88)
                ctx.close()
            finally:
                browser.close()
    finally:
        server.terminate()
        server.wait(timeout=5)
    print("\n".join(results))


if __name__ == "__main__":
    main()
