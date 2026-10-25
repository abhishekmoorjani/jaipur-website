"use client";

// PROTOTYPE, not for production: the assembled banner intro on the homepage.
// Layers and plate come from design/intro/cut.py; timing notes in design/intro/NOTES.md.

import { useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import intro from "@/data/intro-layers.json";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./intro.module.css";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
const { width: W, height: H, widths, phone, layers } = intro;
// Screens this narrow get the files cut to the band they show; same query as in intro.module.css.
const PHONE = "(max-aspect-ratio: 3/5)";
const pct = (v: number, of: number) => `${(v / of) * 100}%`;
// One set per size (export.py); every file of a set scales by the same factor, so the browser
// picks the same set for all of them.
const srcSet = (name: string, w: number) =>
  widths.map((v) => `${BASE}/images/intro/${name}-${v}.webp ${Math.round((w * v) / W)}w`).join(", ");
// Rendered width: the picture covers the stage, so it is 100vh * W / H wide, or 100vw on screens
// wider than the banner.
const sizes = (w: number) => `(min-aspect-ratio: ${W}/${H}) ${((100 * w) / W).toFixed(2)}vw, ${((100 * w) / H).toFixed(2)}vh`;

type Box = { id: string; x: number; y: number; w: number; h: number; phone: number[] | null };

// A plate or a piece: placed in percent of the picture, with its own phone crop where it has one.
function Layer({ box, className, priority }: { box: Box; className: string; priority?: boolean }) {
  const { id, x, y, w, h, phone: crop } = box;
  const style = {
    "--x": pct(x, W), "--y": pct(y, H), "--w": pct(w, W), "--h": pct(h, H),
    "--phone-x": crop ? pct(crop[0], W) : undefined, "--phone-w": crop ? pct(crop[1], W) : undefined,
  } as CSSProperties;
  return (
    <picture>
      {crop && <source media={PHONE} srcSet={srcSet(`${id}-phone`, crop[1])} sizes={`${((100 * crop[1]) / H).toFixed(2)}vh`} />}
      <img
        className={crop ? className : `${className} ${styles.offPhone}`}
        srcSet={srcSet(id, w)}
        sizes={sizes(w)}
        src={`${BASE}/images/intro/${id}-${widths[1]}.webp`}
        alt=""
        width={w}
        height={h}
        style={style}
        fetchPriority={priority ? "high" : undefined}
        loading={crop ? undefined : "lazy"}
      />
    </picture>
  );
}

// Once per page load. Module scope survives client side navigation back to the
// homepage but not a reload, and stores nothing on the device, so there is no
// consent question (no localStorage, sessionStorage or cookie).
let played = false;
export const introPlayed = () => played;

// The banner is hero slide 0 (owner, 2026-10-25): it builds itself once, then stays as the first slide.
export default function HomeIntro({ onDone }: { onDone: () => void }) {
  const stage = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  // Read at mount, so React's development double run of the effect still plays the build.
  const [builtAlready] = useState(introPlayed);

  useGSAP(() => {
    const el = stage.current!;
    el.classList.add(styles.live); // JS runs: switch off the CSS failsafe, its animation would beat GSAP's inline styles
    // The banner stays for the whole visit, so --nav-h follows the navbar through resizes and rotations.
    // Only its unscrolled height (Navbar: scrollY <= 50) counts; the scroll check settles a return from a scrolled page.
    const nav = document.querySelector("nav");
    const measure = () => {
      if (nav && window.scrollY <= 50) el.style.setProperty("--nav-h", `${nav.getBoundingClientRect().height}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (nav) ro.observe(nav, { box: "border-box" }); // the scrolled state changes padding, not content
    window.addEventListener("scroll", measure, { passive: true });
    const stopMeasuring = () => {
      ro.disconnect();
      window.removeEventListener("scroll", measure);
    };
    played = true;
    if (builtAlready || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add(styles.built);
      onDone();
      return stopMeasuring;
    }

    const q = gsap.utils.selector(el);
    const events = ["pointerdown", "wheel", "touchstart", "keydown"] as const;
    const finish = () => tl.progress(1); // any interaction completes the build at once
    const tl = gsap.timeline({
      onComplete: () => {
        events.forEach((e) => window.removeEventListener(e, finish));
        onDone();
      },
    });
    // 0.8 to 1.4: the logo glides from the centre (set in CSS) to its place, the tagline fades in under it.
    tl.to(q(`.${styles.brand}`), { y: 0, duration: 0.6, ease: "power3.inOut" }, 0.8)
      .to(q(`.${styles.tagline}`), { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 1.0)
      // 1.2 to 2.8: lamps, then dishes, back to front, each settling onto the table. The first
      // lamp lands as the logo finishes its glide, so the empty plate is not left on its own.
      .to(q(`.${styles.piece}`), {
        opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.12,
      }, 1.2);

    events.forEach((e) => window.addEventListener(e, finish, { passive: true }));
    // Only design/intro/frames.py asks for this (it loads ?intro-debug) to seek exact frames.
    if (new URLSearchParams(window.location.search).has("intro-debug")) {
      (window as unknown as { __jaipurIntro?: gsap.core.Timeline }).__jaipurIntro = tl;
    }
    return () => {
      stopMeasuring();
      events.forEach((e) => window.removeEventListener(e, finish));
    };
  }, { scope: stage });

  const tagline = t(
    "Authentische indische Küche seit über 30 Jahren",
    "Authentic Indian cuisine for over 30 years",
    "Cuisine indienne authentique depuis plus de 30 ans"
  );
  return (
    <div ref={stage} className={styles.stage} role="img" aria-label={`Jaipur. ${tagline}`}>
      {/* Without JS nothing builds: show the finished banner. */}
      <noscript>
        <style>{`.${styles.piece},.${styles.tagline}{opacity:1;transform:none}.${styles.brand}{transform:none}`}</style>
      </noscript>
      <div className={styles.band} />
      <div className={styles.picture}>
        <Layer box={{ id: "plate", x: 0, y: 0, w: W, h: H, phone }} className={styles.plate} priority />
        {layers.map((l) => (
          <Layer key={l.id} box={l} className={styles.piece} />
        ))}
      </div>
      <div className={styles.brand}>
        <img className={styles.logo} src={`${BASE}/images/logo-navbar.png`} alt="" width={766} height={500} />
        <p className={styles.tagline}>{tagline}</p>
      </div>
    </div>
  );
}
