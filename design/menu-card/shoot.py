#!/usr/bin/env python3
"""Screenshot the menu popup from a static build and measure it.

Usage (repo root, after `next build`): python3 design/menu-card/shoot.py
Serves out/ with a short lived http.server, drives the system Chrome with Playwright,
writes PNGs to design/menu-card/screens/ and prints counts, overflow and contrast data.
"""
import json
import pathlib
import socket
import subprocess
import sys
import time

from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).resolve().parent
OUT_DIR = HERE.parent.parent / "out"
SHOTS = HERE / "screens"

FIND = """
(() => {
  const title = [...document.querySelectorAll('h2')].reverse().find(h => /Unsere Speisekarte|Our Menu|Notre carte/.test(h.textContent));
  const popup = title.closest('div').parentElement.parentElement;
  const list = [...popup.querySelectorAll('div')].find(d => getComputedStyle(d).overflowY === 'auto' && d.querySelector('h3'));
  return {popup, list};
})()
"""

MEASURE = """
() => {
  const {popup, list} = %s;
  const blocks = [...list.querySelectorAll('h3')].filter(h => h.parentElement && h.parentElement.nextElementSibling);
  const sections = [];
  for (const h of list.querySelectorAll('h3')) {
    const rows = h.parentElement.nextElementSibling;
    if (!rows || h.id === 'menu-cover-heading') continue;
    const names = [...rows.children].map(r => r.querySelector('span[class*=dishName]')?.textContent).filter(Boolean);
    if (names.length) sections.push({title: h.textContent, count: names.length, names});
  }
  const filters = [...popup.querySelectorAll('button')].map(b => b.textContent.trim()).filter(t => t && t.length < 30);
  const colours = {};
  for (const el of popup.querySelectorAll('h2,h3,p,span,button,a')) {
    if (!el.textContent.trim() || el.children.length > 2) continue;
    const cs = getComputedStyle(el);
    const cls = (el.getAttribute('class') || '').split(' ')[0];
    const key = (cls.match(/__([A-Za-z_]+)$/) || [null, el.tagName])[1];
    colours[key] = {color: cs.color, bg: cs.backgroundColor, size: cs.fontSize, weight: cs.fontWeight, sample: el.textContent.trim().slice(0, 40)};
  }
  return {
    sections, filters, colours,
    docOverflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    popupOverflowX: popup.scrollWidth - popup.clientWidth,
    listOverflowX: list.scrollWidth - list.clientWidth,
    popupRect: popup.getBoundingClientRect().toJSON(),
  };
}
""" % FIND

SCROLL_TO = """
(title) => {
  const {list} = %s;
  if (title === '__bottom__') { list.scrollTop = list.scrollHeight; return list.scrollTop; }
  if (title === '__cover_end__') { const c = list.querySelector('section'); list.scrollTop = c.offsetTop + c.offsetHeight - list.clientHeight + 70; return list.scrollTop; }
  const h = [...list.querySelectorAll('h3')].find(h => h.textContent.startsWith(title));
  list.scrollTop = h.closest('div').parentElement.offsetTop - 6;
  return list.scrollTop;
}
""" % FIND


def side_by_side(cover_png, out_png):
    from PIL import Image
    cover = Image.open(cover_png).convert("RGB")
    print_png = HERE / "build" / "p2_300-1.png"  # written by extract.py
    page = Image.open(print_png).convert("RGB").resize((cover.width, cover.width), Image.LANCZOS)
    h = max(cover.height, page.height)
    canvas = Image.new("RGB", (cover.width * 2 + 24, h), (40, 40, 40))
    canvas.paste(page, (0, 0))
    canvas.paste(cover, (cover.width + 24, 0))
    canvas.save(out_png)


def contrast_table(colours):
    """WCAG contrast of every rendered text style: against its own background when it has a solid
    one, otherwise against the darkest 1 % of printed paper (#F0D8AD, palette.json paper_dark_p1)."""
    import re

    def lum(c):
        c = [v / 255 for v in c]
        c = [v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c]
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]

    def ratio(a, b):
        hi, lo = sorted((lum(a), lum(b)), reverse=True)
        return round((hi + 0.05) / (lo + 0.05), 2)

    paper = (0xF0, 0xD8, 0xAD)
    out = {}
    for key, v in colours.items():
        fg = [float(x) for x in re.findall(r"[\d.]+", v["color"])][:3]
        bg = [float(x) for x in re.findall(r"[\d.]+", v["bg"])]
        solid = len(bg) == 3 or (len(bg) == 4 and bg[3] > 0.9)
        out[key] = {"ratio": ratio(fg, bg[:3] if solid else paper), "on": v["bg"] if solid else "#F0D8AD paper", "color": v["color"], "sample": v["sample"]}
    return dict(sorted(out.items(), key=lambda kv: kv[1]["ratio"]))


def free_port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def open_menu(page, url):
    page.goto(url, wait_until="load")
    for _ in range(20):  # the listener exists only after hydration
        page.wait_for_timeout(500)
        page.evaluate("window.dispatchEvent(new Event('openMenu'))")
        if page.query_selector("img[src*='menu-card/cover-bottom']"):
            break
    page.wait_for_selector("img[src*='menu-card/cover-bottom']", timeout=5000)
    page.wait_for_function("[...document.images].filter(i => i.src.includes('menu-card') || i.src.includes('logo-navbar')).every(i => i.complete && i.naturalWidth > 0)")
    page.wait_for_timeout(900)  # entrance animation


def main():
    SHOTS.mkdir(parents=True, exist_ok=True)
    port = free_port()
    server = subprocess.Popen([sys.executable, "-m", "http.server", str(port), "--bind", "127.0.0.1", "-d", str(OUT_DIR)],
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    base = f"http://127.0.0.1:{port}"
    report = {}
    try:
        time.sleep(0.8)
        with sync_playwright() as pw:
            browser = pw.chromium.launch(channel="chrome", headless=True)
            try:
                for label, vp, dsf in (("desktop-1280x800", {"width": 1280, "height": 800}, 1),
                                       ("phone-390x844", {"width": 390, "height": 844}, 2)):
                    ctx = browser.new_context(viewport=vp, device_scale_factor=dsf, reduced_motion="reduce",
                                              is_mobile=dsf == 2, has_touch=dsf == 2)
                    page = ctx.new_page()
                    open_menu(page, base + "/")
                    page.screenshot(path=str(SHOTS / f"{label}-de-1-cover.png"))
                    report[label] = page.evaluate(MEASURE)
                    for i, (name, title) in enumerate((("lunch", "Mittagskarte (Montag"), ("tandoor", "Aus dem Tandoor"), ("bottom", "__bottom__"), ("cover-end", "__cover_end__")), 2):
                        page.evaluate(SCROLL_TO, title)
                        page.wait_for_timeout(700)
                        page.screenshot(path=str(SHOTS / f"{label}-de-{i}-{name}.png"))
                    # http.server has no /en route rewrite, so pick the language the way a visitor does
                    for lang in ("EN", "FR") if "--fr" in sys.argv else ("EN",):
                        page.evaluate(f"localStorage.setItem('jaipur-lang', '{lang}')")
                        open_menu(page, base + "/")
                        page.screenshot(path=str(SHOTS / f"{label}-{lang.lower()}-1-cover.png"))
                    page.evaluate("localStorage.removeItem('jaipur-lang')")
                    ctx.close()
                # side by side with the print: a tall window shows the whole cover at once
                for label, vp, dsf in (("desktop", {"width": 1280, "height": 1900}, 1), ("phone", {"width": 390, "height": 2600}, 2)):
                    ctx = browser.new_context(viewport=vp, device_scale_factor=dsf, is_mobile=dsf == 2, has_touch=dsf == 2)
                    page = ctx.new_page()
                    page.add_init_script("document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = '[class*=popup]{max-height:none!important}'; document.head.appendChild(s); })")
                    open_menu(page, base + "/")
                    cover_png = SHOTS / f"_cover-{label}.png"
                    page.locator("section[aria-labelledby=menu-cover-heading]").screenshot(path=str(cover_png))
                    ctx.close()
                    side_by_side(cover_png, SHOTS / f"compare-cover-{label}.png")
                    cover_png.unlink()
            finally:
                browser.close()
    finally:
        server.terminate()
        server.wait(timeout=10)
    report["contrast"] = contrast_table(report["desktop-1280x800"]["colours"])
    print(json.dumps(report, indent=1, ensure_ascii=False))


if __name__ == "__main__":
    main()
