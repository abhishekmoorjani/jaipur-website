"use client";

// PROTOTYPE, not for production: the assembled banner intro on the homepage.
// Layers and plate come from design/intro/cut.py; timing notes in design/intro/NOTES.md.

import { useRef, type CSSProperties } from "react";
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

export default function HomeIntro({ onDone }: { onDone: () => void }) {
  const stage = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useGSAP(() => {
    const el = stage.current!;
    played = true;
    el.style.animation = "none"; // JS is running, so the no-JS failsafe is not needed
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onDone();
      return;
    }
    const nav = document.querySelector("nav");
    if (nav) el.style.setProperty("--nav-h", `${nav.getBoundingClientRect().height}px`);

    const q = gsap.utils.selector(el);
    const tl = gsap.timeline({ onComplete: onDone });
    // 0.8 to 1.4: the logo glides from the centre (set in CSS) to its place, the tagline fades in under it.
    tl.to(q(`.${styles.brand}`), { y: 0, duration: 0.6, ease: "power3.inOut" }, 0.8)
      .to(q(`.${styles.tagline}`), { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 1.0)
      // 1.2 to 2.8: lamps, then dishes, back to front, each settling onto the table. The first
      // lamp lands as the logo finishes its glide, so the empty plate is not left on its own.
      .to(q(`.${styles.piece}`), {
        opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.12,
      }, 1.2)
      // 3.3: everything fades to the dark site background, then the stage lifts off the hero.
      .to(q(`.${styles.picture}, .${styles.brand}`), { opacity: 0, duration: 0.45, ease: "power1.in" }, 3.3)
      .to(el, { backgroundColor: "#0D1117", duration: 0.45, ease: "power1.in" }, 3.3)
      .to(el, { opacity: 0, duration: 0.5, ease: "power1.out" }, 3.65);

    let skipped = false;
    const skip = () => {
      if (skipped) return;
      skipped = true;
      tl.kill();
      el.style.pointerEvents = "none";
      gsap.to(el, { opacity: 0, duration: 0.2, onComplete: onDone });
    };
    const events = ["pointerdown", "wheel", "touchstart", "keydown"] as const;
    events.forEach((e) => window.addEventListener(e, skip, { passive: true }));
    // Only design/intro/frames.py asks for this (it loads ?intro-debug) to seek exact frames.
    if (new URLSearchParams(window.location.search).has("intro-debug")) {
      (window as unknown as { __jaipurIntro?: gsap.core.Timeline }).__jaipurIntro = tl;
    }
    return () => events.forEach((e) => window.removeEventListener(e, skip));
  }, { scope: stage });

  return (
    <div ref={stage} className={styles.stage} aria-hidden="true">
      <div className={styles.band} />
      <div className={styles.picture}>
        <Layer box={{ id: "plate", x: 0, y: 0, w: W, h: H, phone }} className={styles.plate} priority />
        {layers.map((l) => (
          <Layer key={l.id} box={l} className={styles.piece} />
        ))}
      </div>
      <div className={styles.brand}>
        <img className={styles.logo} src={`${BASE}/images/logo-navbar.png`} alt="" width={766} height={500} />
        <p className={styles.tagline}>
          {t(
            "Authentische indische Küche seit über 30 Jahren",
            "Authentic Indian cuisine for over 30 years",
            "Cuisine indienne authentique depuis plus de 30 ans"
          )}
        </p>
      </div>
    </div>
  );
}
