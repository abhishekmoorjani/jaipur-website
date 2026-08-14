"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import styles from "./home.module.css";
import Image from "next/image";
import { Star, ChevronDown, ArrowRight, MapPin, Phone, X, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
// Loaded on demand, not on first paint. The popup carries the full 233 item
// menu, which measured at 198KB in a first-paint chunk even though the popup
// starts closed. That chunk was hydrating while the visitor was already
// scrolling, which is what produced the first-load stutter: 4 frames over
// 100ms and an 89ms long task, measured at 4x CPU throttle.
//
// ssr:false is correct here: it is a modal that begins closed, so there is no
// server-rendered markup to lose and nothing above the fold depends on it.
const MenuPopup = dynamic(() => import("@/components/MenuPopup"), { ssr: false });
import { useLanguage } from "@/context/LanguageContext";
import { useGSAP } from "@gsap/react";
import reviewsData from "@/data/reviews.json";
import carouselData from "@/data/carousel-reviews.json";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

const heroImages = [
  `${BASE}/images/food/hero-1.jpg`,
  `${BASE}/images/food/hero-2.jpg`,
  `${BASE}/images/food/hero-3.jpg`,
  `${BASE}/images/food/hero-4.jpg`,
  `${BASE}/images/food/hero-5.jpg`,
  `${BASE}/images/food/hero-6.jpg`,
  `${BASE}/images/food/hero-7.jpg`,
];

/**
 * A star row that can show a fraction of a star.
 *
 * Every star row on this page used to render five filled stars regardless of
 * the actual score, so a 4.5 Google average was drawn as a perfect five. The
 * filled row is layered over an unfilled one and clipped.
 *
 * The clip width is computed here in pixels instead of as a percentage: a
 * percentage of the row would scale the gaps too, so 4.5 of 5 would clip at
 * 4.5 stars plus 3.6 gaps rather than the 4.5 stars plus 4 gaps a reader
 * expects. At size 14 and gap 3 that is the difference between 73.8px and the
 * correct 75px.
 */
function StarRating({
  value,
  size,
  gap = 3,
  className,
}: {
  value: number;
  size: number;
  gap?: number;
  className?: string;
}) {
  const rowWidth = 5 * size + 4 * gap;
  const clamped = Math.max(0, Math.min(5, value));
  const full = Math.floor(clamped);
  const width = Math.min(full * size + full * gap + (clamped - full) * size, rowWidth);

  return (
    <span
      className={`${styles.starRating} ${className ?? ""}`}
      style={{ ["--star-gap" as string]: `${gap}px` }}
      role="img"
      aria-label={`${clamped} / 5`}
    >
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={size} fill="none" color="var(--color-accent)" aria-hidden="true" />
      ))}
      <span className={styles.starRatingFill} style={{ width: `${width}px` }} aria-hidden="true">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={size} fill="var(--color-accent)" color="var(--color-accent)" />
        ))}
      </span>
    </span>
  );
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { lang, t } = useLanguage();

  // Force scroll to top on initial load — prevents mobile browsers
  // from restoring scroll to random positions on refresh
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  // Hero slideshow cycle every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Listen for "openMenu" event from Navbar's Speisekarte link
  useEffect(() => {
    const handler = () => setIsMenuOpen(true);
    window.addEventListener("openMenu", handler);
    return () => window.removeEventListener("openMenu", handler);
  }, []);

  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Hero text entrance — staggered fade-up
    gsap.fromTo(
      `.${styles.heroInner} > *`,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, stagger: 0.12, ease: "power3.out", delay: 0.4 }
    );

    // Scroll indicator bounce
    gsap.to(`.${styles.scrollIndicator}`, {
      y: 8,
      repeat: -1,
      yoyo: true,
      duration: 1.5,
      ease: "power1.inOut",
    });

    // Section reveals — subtle fade up on scroll (gentle, not overwhelming)
    const sections = gsap.utils.toArray(`.${styles.revealSection}`) as HTMLElement[];
    sections.forEach((sec) => {
      gsap.fromTo(
        sec,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: { trigger: sec, start: "top 70%", toggleActions: "play none none none" },
        }
      );
    });

    // Dish cards stagger
    gsap.fromTo(
      `.${styles.dishCard}`,
      { y: 60, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power2.out",
        scrollTrigger: { trigger: `.${styles.dishGrid}`, start: "top 85%" },
      }
    );

    // Editorial hero number — count up animation
    const heroNumEl = document.querySelector(`.${styles.editorialHeroNumber}`) as HTMLElement;
    if (heroNumEl) {
      const target = parseInt(heroNumEl.dataset.target || "0", 10);
      const suffix = heroNumEl.dataset.suffix || "";
      const counter = { val: 0 };
      gsap.to(counter, {
        val: target,
        duration: 2.2,
        ease: "power2.out",
        snap: { val: 1 },
        scrollTrigger: { trigger: `.${styles.highlightsSection}`, start: "top 80%" },
        onUpdate: () => { heroNumEl.textContent = Math.round(counter.val) + suffix; },
      });
    }

    // Editorial hero — label + line entrance
    gsap.fromTo(
      `.${styles.editorialHeroLabel}`,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", delay: 1.0,
        scrollTrigger: { trigger: `.${styles.highlightsSection}`, start: "top 80%" },
      }
    );
    gsap.fromTo(
      `.${styles.editorialHeroLine}`,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.6, ease: "power2.out", delay: 0.8,
        scrollTrigger: { trigger: `.${styles.highlightsSection}`, start: "top 80%" },
      }
    );
    gsap.fromTo(
      `.${styles.editorialHeroTagline}`,
      { opacity: 0 },
      { opacity: 0.6, duration: 0.8, ease: "power2.out", delay: 1.3,
        scrollTrigger: { trigger: `.${styles.highlightsSection}`, start: "top 80%" },
      }
    );

    // Editorial sub-stats — count up + staggered entrance (supports decimals like 4.6)
    const subStatEls = gsap.utils.toArray(`.${styles.editorialNumber}`) as HTMLElement[];
    subStatEls.forEach((el, i) => {
      const raw = el.dataset.target || "0";
      const target = parseFloat(raw);
      const suffix = el.dataset.suffix || "";
      // Read the format off the string, not the value. The rating is written
      // as "4.5"/"5.0", so a month where Google lands on a round 5 still
      // renders "5.0" rather than snapping to a bare "5".
      const isDecimal = raw.includes(".");
      const counter = { val: 0 };
      gsap.to(counter, {
        val: target,
        duration: 1.8,
        ease: "power2.out",
        snap: isDecimal ? { val: 0.1 } : { val: 1 },
        delay: 0.8 + i * 0.2,
        scrollTrigger: { trigger: `.${styles.editorialRow}`, start: "top 88%" },
        onUpdate: () => {
          el.textContent = (isDecimal ? counter.val.toFixed(1) : Math.round(counter.val).toString()) + suffix;
        },
      });
    });

    // Sub-stat cards entrance
    gsap.fromTo(
      `.${styles.editorialStat}`,
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power2.out",
        scrollTrigger: { trigger: `.${styles.editorialRow}`, start: "top 88%" },
        delay: 0.6,
      }
    );

    // Sub-stat decoration lines scale in
    gsap.fromTo(
      `.${styles.editorialDeco}`,
      { scaleX: 0 },
      {
        scaleX: 1, duration: 0.5, stagger: 0.1, ease: "power2.out",
        scrollTrigger: { trigger: `.${styles.editorialRow}`, start: "top 88%" },
        delay: 1.2,
      }
    );

    // Testimonial section header reveal — gentle, delayed entrance
    gsap.fromTo(
      `.${styles.testimonialsSection} .${styles.sectionHeader}`,
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, duration: 1.2, ease: "power2.out",
        scrollTrigger: { trigger: `.${styles.testimonialsSection}`, start: "top 55%" },
      }
    );

    // Gallery preview items stagger reveal
    gsap.fromTo(
      `.${styles.galleryPreviewHero}, .${styles.galleryPreviewTop}, .${styles.galleryPreviewBottom}`,
      { opacity: 0, scale: 0.95, y: 20 },
      {
        opacity: 1, scale: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power2.out",
        scrollTrigger: { trigger: `.${styles.galleryPreview}`, start: "top 85%" },
      }
    );

    // Story section — image parallax
    gsap.to(`.${styles.storyImg}`, {
      yPercent: -10,
      ease: "none",
      scrollTrigger: {
        trigger: `.${styles.storySection}`,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    });

    // Reservation form entrance
    gsap.fromTo(
      `.${styles.resForm}`,
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 1, ease: "power2.out",
        scrollTrigger: { trigger: `.${styles.reservationSection}`, start: "top 75%" },
      }
    );

  }, { scope: containerRef });

  return (
    <main ref={containerRef} className={styles.main}>

      {/* ═══════════════════════════════════════
          1) HERO — Full-screen slideshow
         ═══════════════════════════════════════ */}
      <section className={styles.hero} id="home">
        <div className={styles.heroSlideshow}>
          {heroImages.map((img, i) => (
            <div
              key={i}
              className={`${styles.heroSlide} ${i === currentSlide ? styles.heroSlideActive : ""}`}
            >
              <Image
                src={img}
                alt={`Jaipur Indian cuisine ${i + 1}`}
                fill
                className={styles.heroSlideImg}
                priority={i === 0}
                sizes="100vw"
                quality={85}
              />
            </div>
          ))}
        </div>
        <div className={styles.heroOverlay} />

        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>{t("Seit 1995 · Freiburg", "Since 1995 · Freiburg", "Depuis 1995 · Fribourg")}</span>
          <h1 className={styles.headline} style={lang === "FR" ? { fontSize: "clamp(2.4rem, 4.2vw, 4.2rem)" } : undefined}>
            {t("Freiburgs ältestes indisches Restaurant", "Freiburg's oldest Indian restaurant", "Le plus ancien restaurant indien de Fribourg")}
          </h1>
          <p className={styles.heroSub}>
            {t(
              "Authentische indische Küche im Herzen der Altstadt. Warm, elegant und seit drei Jahrzehnten familiengeführt.",
              "Authentic Indian cuisine in the heart of the old town. Warm, elegant, and family-run for three decades.",
              "Cuisine indienne authentique au cœur de la vieille ville. Chaleureuse, élégante et familiale depuis trois décennies."
            )}
          </p>
          <div className={styles.heroCtas}>
            <a
              href="#reservations"
              className={`${styles.heroBtn} btn-primary`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById("reservations");
                if (el) {
                  const y = el.getBoundingClientRect().top + window.scrollY - 90;
                  window.scrollTo({ top: y, behavior: "smooth" });
                }
              }}
            >
              {t("Tisch reservieren", "Book a table", "Réserver une table")}
            </a>
            <button
              className={`${styles.heroBtn} btn-outline`}
              onClick={() => setIsMenuOpen(true)}
            >
              {t("Speisekarte", "View menu", "Voir la carte")}
            </button>
          </div>
          <div className={styles.heroMeta}>
            <div className={styles.heroStars}>
              <StarRating value={reviewsData.rating} size={14} gap={3} />
              <span className={styles.heroStarsLabel}>
                {reviewsData.rating} {t("Sterne auf Google", "Stars on Google", "étoiles sur Google")}
              </span>
            </div>
            <span className={styles.heroAddress}>
              <MapPin size={13} /> Gerberau 5
            </span>
          </div>

          {/* Slide indicators */}
          <div className={styles.slideIndicators}>
            {heroImages.map((_, i) => (
              <button
                key={i}
                className={`${styles.slideIndicator} ${i === currentSlide ? styles.slideIndicatorActive : ""}`}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div className={styles.scrollIndicator}>
          <span>{t("Entdecken", "Explore", "Découvrir")}</span>
          <ChevronDown size={18} />
        </div>
      </section>

      {/* ═══════════════════════════════════════
          2) SIGNATURE DISHES
         ═══════════════════════════════════════ */}
      <section id="speisekarte" className={`${styles.signatureSection} ${styles.revealSection} section-padding`}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>{t("Unsere Küche", "Our Kitchen", "Notre cuisine")}</span>
          <h2>{t("Empfehlungen des Hauses", "Chef's Recommendations", "Recommandations du chef")}</h2>
          <p>{t("Entdecken Sie die Vielfalt unserer authentischen indischen Küche.", "Discover the diversity of our authentic Indian cuisine.", "Découvrez la diversité de notre cuisine indienne authentique.")}</p>
        </div>
        <div className={styles.dishGrid}>
          {[
            { name: "Jaipur Thali", desc: t("Eine feine Auswahl traditioneller nordindischer Spezialitäten", "A fine selection of traditional North Indian specialties", "Une fine sélection de spécialités traditionnelles du nord de l'Inde"), img: `${BASE}/images/food/jaipur-thali.jpg` },
            { name: "Tandoori Mixed Grill", desc: t("Spezialitäten aus dem original Lehmofen", "Specialties from the original clay oven", "Spécialités du four tandoor traditionnel"), img: `${BASE}/images/food/tandoori-mixed-grill.jpg` },
            { name: "Chicken Tikka Masala", desc: t("Zartes Huhn in cremiger Tomaten-Curry-Soße", "Tender chicken in creamy tomato curry sauce", "Poulet tendre dans une sauce crémeuse au curry et tomates"), img: `${BASE}/images/food/chicken-tikka-masala.jpg` },
            { name: "Lamb Biryani", desc: t("Basmatireis mit Lammfleisch, Mandeln und Rosinen", "Basmati rice with lamb, almonds and raisins", "Riz basmati avec agneau, amandes et raisins secs"), img: `${BASE}/images/food/lamb-biryani.jpg` },
          ].map((dish, i) => (
            <div key={i} className={styles.dishCard}>
              <div className={styles.dishImgWrapper}>
                <Image src={dish.img} alt={dish.name} fill className={styles.dishImg} sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className={styles.dishInfo}>
                <h3 className={styles.dishName}>{dish.name}</h3>
                <p className={styles.dishDesc}>{dish.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.menuCta}>
          <button onClick={() => setIsMenuOpen(true)} className={`${styles.menuCtaBtn} btn-outline`}>
            {t("Gesamte Speisekarte ansehen", "View full menu", "Voir la carte complète")} <ArrowRight size={18} style={{ marginLeft: 8, verticalAlign: "middle" }} />
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          3) ABOUT — Story
         ═══════════════════════════════════════ */}
      <section id="about" className={`${styles.storySection} ${styles.revealSection} section-padding`}>
        <div className={styles.storyContainer}>
          <div className={styles.storyImageWrapper}>
            <Image src={`${BASE}/images/terrace-evening.webp`} alt={t("Jaipur Restaurant Terrasse", "Jaipur restaurant terrace", "Terrasse du restaurant Jaipur")} fill className={styles.storyImg} />
          </div>
          <div className={styles.storyContent}>
            <span className={styles.sectionEyebrow}>{t("Unsere Geschichte", "Our Story", "Notre histoire")}</span>
            <h2 className={styles.storyTitle}>
              {t("Seit über 30 Jahren ein Teil von Freiburg", "Part of Freiburg for over 30 years", "Partie intégrante de Fribourg depuis plus de 30 ans")}
            </h2>
            <p>
              {t(
                "Im Jahr 1995 öffneten wir unsere Türen in der malerischen Gerberau. Seitdem haben wir es uns zur Aufgabe gemacht, die uralten Traditionen und die vielfältigen Aromen Indiens in unsere geliebte Stadt zu bringen. Mit Originalrezepten, die von Generation zu Generation in unserer Familie weitergegeben wurden, laden wir Sie ein, ein Stück echter indischer Kultur und Gastlichkeit zu erleben.",
                "In 1995, we opened our doors in the picturesque Gerberau. Since then, we have made it our mission to bring the ancient traditions and diverse flavours of India to our beloved city. With original recipes passed down through generations in our family, we invite you to experience a piece of genuine Indian culture and hospitality.",
                "En 1995, nous avons ouvert nos portes dans la pittoresque Gerberau. Depuis, notre mission est d'apporter les traditions ancestrales et les saveurs variées de l'Inde dans notre ville bien-aimée. Avec des recettes originales transmises de génération en génération dans notre famille, nous vous invitons à découvrir un morceau de culture et d'hospitalité indiennes authentiques."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          3b) HIGHLIGHTS — Staggered Editorial Spread
         ═══════════════════════════════════════ */}
      <section className={`${styles.highlightsSection} ${styles.revealSection} section-padding`}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>{t("Warum Jaipur", "Why Jaipur", "Pourquoi Jaipur")}</span>
          <h2>{t("Tradition trifft Leidenschaft", "Tradition meets passion", "La tradition rencontre la passion")}</h2>
        </div>

        {/* Hero stat — massive centered */}
        <div className={styles.editorialHero}>
          <div className={styles.editorialHeroNumber} data-target="30" data-suffix="+">0</div>
          <div className={styles.editorialHeroLabel}>{t("Jahre Tradition", "Years of tradition", "Ans de tradition")}</div>
          <div className={styles.editorialHeroLine} />
          <div className={styles.editorialHeroTagline}>
            {t("Freiburgs ältestes indisches Restaurant seit 1995", "Freiburg's oldest Indian restaurant since 1995", "Le plus ancien restaurant indien de Fribourg depuis 1995")}
          </div>
        </div>

        {/* Sub-stats row — staggered */}
        <div className={styles.editorialRow}>
          <div className={styles.editorialStat}>
            <div className={styles.editorialStatBg}>
              <div className={styles.editorialNumber} data-target="3" data-suffix="">0</div>
              <div className={styles.editorialDeco} />
              <div className={styles.editorialLabel}>{t("Familien-Generationen", "Family generations", "Générations familiales")}</div>
            </div>
          </div>
          <div className={styles.editorialStat}>
            <div className={styles.editorialStatBg}>
              {/* Derived, never hardcoded. This card read 4.6 while the
                  testimonials header read 4.5 from the same page, because this
                  number was a literal the reviews sync could not reach. */}
              <div className={styles.editorialNumber} data-target={reviewsData.rating.toFixed(1)} data-suffix="">0</div>
              <div className={styles.editorialDeco} />
              <div className={styles.editorialLabel}>{t("Google Bewertung", "Google Rating", "Note Google")}</div>
              <div className={styles.editorialStars}>
                <StarRating value={reviewsData.rating} size={12} gap={2} />
              </div>
            </div>
          </div>
          <div className={styles.editorialStat}>
            <div className={styles.editorialStatBg}>
              <div className={styles.editorialNumber} data-target="7" data-suffix="/7">0</div>
              <div className={styles.editorialDeco} />
              <div className={styles.editorialLabel}>{t("Tage geöffnet", "Days open", "Jours d'ouverture")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Popup */}
      <MenuPopup isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* ═══════════════════════════════════════
          5) TESTIMONIALS — Horizontal auto-scroll carousel
         ═══════════════════════════════════════ */}
      <TestimonialCarousel carouselReviews={carouselData.reviews} lang={lang} t={t} />

      {/* ═══════════════════════════════════════
          6) RESERVATION FORM
         ═══════════════════════════════════════ */}
      <section className={`${styles.reservationSection} ${styles.revealSection} section-padding`} id="reservations">
        <div className={styles.resContainer}>
          <div className={styles.resInfo}>
            <span className={styles.sectionEyebrow}>{t("Reservierung", "Reservation", "Réservation")}</span>
            <h2>{t("Reservieren Sie Ihren Tisch", "Reserve your table", "Réservez votre table")}</h2>
            <p>{t("Freuen Sie sich auf einen unvergesslichen Abend bei Jaipur.", "Look forward to an unforgettable evening at Jaipur.", "Attendez-vous à une soirée inoubliable au Jaipur.")}</p>
            <div className={styles.resDetails}>
              <div className={styles.resDetailItem}>
                <MapPin size={18} className={styles.resDetailIcon} />
                <div>
                  <span>Gerberau 5</span>
                  <span>79098 Freiburg im Breisgau</span>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.resPhoneCard}>
            <div className={styles.resPhoneCardInner}>
              <Phone size={32} className={styles.resPhoneCardIcon} />
              <h3 className={styles.resPhoneCardTitle}>
                {t("Rufen Sie uns an", "Give us a call", "Appelez-nous")}
              </h3>
              <a href="tel:0761272082" className={styles.resPhoneCardNumber}>
                0761 / 27 20 82
              </a>
              <p className={styles.resPhoneCardSub}>
                {t(
                  "Wir freuen uns auf Ihre Reservierung! Täglich von 12:00 bis 14:30 Uhr und 18:00 bis 22:00 Uhr erreichbar.",
                  "We look forward to your reservation! Available daily from 12:00 to 14:30 and 18:00 to 22:00.",
                  "Nous nous réjouissons de votre réservation ! Joignable tous les jours de 12h00 à 14h30 et de 18h00 à 22h00."
                )}
              </p>
              <div className={styles.resPhoneCardHours}>
                <Clock size={16} />
                <span>{t("Montag – Sonntag", "Monday – Sunday", "Lundi – Dimanche")}</span>
                <span>12:00 – 14:30 &nbsp;|&nbsp; 18:00 – 22:00</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          7) MAP & FIND US
         ═══════════════════════════════════════ */}
      <section id="contact" className={`${styles.mapSection} ${styles.revealSection} section-padding`}>
        <div className={styles.mapContainer}>
          <div className={styles.mapInfo}>
            <span className={styles.sectionEyebrow}>{t("Standort", "Location", "Emplacement")}</span>
            <h2>{t("Besuchen Sie uns", "Visit us", "Venez nous voir")}</h2>
            <p style={{ marginTop: "20px", marginBottom: "20px" }}>
              Gerberau 5<br />
              79098 Freiburg im Breisgau
            </p>
            <p>
              {t(
                "Gelegen im Herzen der malerischen Altstadt, direkt an den historischen Bächle.",
                "Located in the heart of the picturesque old town, right by the historic Bächle.",
                "Situé au cœur de la pittoresque vieille ville, juste à côté des historiques Bächle."
              )}
            </p>
            <div className={styles.contactPhone}>
              <Phone size={18} className={styles.contactPhoneIcon} />
              <a href="tel:0761272082" className={styles.contactPhoneLink}>0761 / 27 20 82</a>
            </div>
            <div className={styles.openingHours}>
              <h3>{t("Öffnungszeiten", "Opening Hours", "Horaires d'ouverture")}</h3>
              <p>{t("Montag – Sonntag", "Monday – Sunday", "Lundi – Dimanche")}</p>
              <p>12:00 – 14:30 &nbsp;|&nbsp; 18:00 – 22:00</p>
              <p className={styles.noClosingDay}>{t("Kein Ruhetag", "No closing day", "Ouvert tous les jours")}</p>
            </div>
          </div>
          {/* A self-hosted OpenStreetMap image, not a Google Maps iframe. The
              embed contacted Google and set cookies on every page view before
              the visitor had agreed to anything, and it shipped a large
              interactive map for something people look at once and then tap
              for directions. This keeps the function and removes the third
              party. The OSM attribution is baked into the image and required. */}
          <a
            className={styles.mapWrapper}
            href="https://www.google.com/maps/dir/?api=1&destination=Jaipur+Indian+Heritage%2C+Gerberau+5%2C+79098+Freiburg+im+Breisgau"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t(
              "Route zum Jaipur in Google Maps öffnen",
              "Open directions to Jaipur in Google Maps",
              "Ouvrir l'itinéraire vers Jaipur dans Google Maps"
            )}
          >
            <Image
              src={`${BASE}/images/map-jaipur.jpg`}
              alt={t(
                "Karte mit der Lage des Restaurants Jaipur in der Gerberau, Freiburger Altstadt",
                "Map showing Jaipur restaurant on Gerberau in Freiburg's old town",
                "Carte indiquant le restaurant Jaipur dans la Gerberau, vieille ville de Fribourg"
              )}
              width={900}
              height={600}
              className={styles.mapImage}
              loading="lazy"
            />
            <span className={styles.mapCta}>
              <MapPin size={15} />
              {t("Route planen", "Get directions", "Itinéraire")}
            </span>
          </a>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          8) GALLERY — Staggered Trio + Lightbox
         ═══════════════════════════════════════ */}
      <GallerySection t={t} />

      {/* ═══════════════════════════════════════
          9) FAQ
         ═══════════════════════════════════════ */}
      <section className={`${styles.faqSection} ${styles.revealSection} section-padding`}>
        <div className={styles.sectionHeader}>
          <h2>{t("Häufig gestellte Fragen", "Frequently asked questions", "Questions fréquemment posées")}</h2>
        </div>
        <div className={styles.faqList}>
          <FAQItem
            question={t("Bieten Sie auch vegane und glutenfreie Gerichte an?", "Do you offer vegan and gluten-free dishes?", "Proposez-vous des plats végétaliens et sans gluten ?")}
            answer={t("Ja, wir haben eine große Auswahl an veganen und glutenfreien Variationen. Bitte sprechen Sie unser Service-Personal darauf an.", "Yes, we have a large selection of vegan and gluten-free options. Please ask our service staff.", "Oui, nous avons un large choix de plats végétaliens et sans gluten. N'hésitez pas à en parler à notre personnel de service.")}
          />
          <FAQItem
            question={t("Sind Hunde im Restaurant erlaubt?", "Are dogs allowed in the restaurant?", "Les chiens sont-ils autorisés au restaurant ?")}
            answer={t("Ja, gut erzogene kleine Hunde sind bei uns willkommen. Wir bitten jedoch darum, dies bei der Reservierung anzugeben.", "Yes, well-behaved small dogs are welcome. However, we ask that you mention this when making a reservation.", "Oui, les petits chiens bien élevés sont les bienvenus. Nous vous demandons toutefois de le mentionner lors de la réservation.")}
          />
          <FAQItem
            question={t("Bieten Sie Catering für Veranstaltungen an?", "Do you offer catering for events?", "Proposez-vous un service traiteur pour les événements ?")}
            answer={t("Selbstverständlich. Wir bieten maßgeschneiderte Catering-Lösungen für private Feiern und Firmen-Events in Freiburg und Umgebung.", "Of course. We offer tailored catering solutions for private celebrations and corporate events in Freiburg and the surrounding area.", "Bien sûr. Nous proposons des solutions de traiteur sur mesure pour les célébrations privées et les événements d'entreprise à Fribourg et dans les environs.")}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════
          10) JAIPUR TO GO (small CTA strip)
         ═══════════════════════════════════════ */}
      <section className={`${styles.togoStrip} ${styles.revealSection}`}>
        <div className={styles.togoInner}>
          <span className={styles.togoTitle}>JAIPUR TO GO</span>
          <p>
            {t("Einfach vorbestellen & abholen!", "Simply pre-order & pick up!", "Commandez et passez chercher !")}
            {" "}
            <a href="tel:0761272082" className={styles.togoPhone}>0761 / 27 20 82</a>
          </p>
        </div>
      </section>

    </main>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.faqItem} onClick={() => setIsOpen(!isOpen)} role="button" aria-expanded={isOpen} tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setIsOpen(!isOpen); } }}>
      <div className={styles.faqHeader}>
        <h3 className={styles.faqQuestion}>{question}</h3>
        <ChevronDown
          className={styles.faqIcon}
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}
        />
      </div>
      {isOpen && (
        <div className={styles.faqBody}>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   TESTIMONIAL CAROUSEL
   ═══════════════════════════════════════ */
interface CarouselReview {
  author: string;
  rating: number;
  profilePhoto: string | null;
  text_de: string;
  text_en: string;
  text_fr: string;
  time_de: string;
  time_en: string;
  time_fr: string;
}

// Helper to get text/time in the current language
function getReviewText(r: CarouselReview, lang: string) {
  if (lang === "FR") return r.text_fr;
  if (lang === "EN") return r.text_en;
  return r.text_de;
}
function getReviewTime(r: CarouselReview, lang: string) {
  if (lang === "FR") return r.time_fr;
  if (lang === "EN") return r.time_en;
  return r.time_de;
}

function TestimonialCarousel({ carouselReviews, lang, t }: { carouselReviews: CarouselReview[]; lang: string; t: (de: string, en: string, fr?: string) => string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [expandedReview, setExpandedReview] = useState<CarouselReview | null>(null);

  // Pre-translated reviews — already filtered & curated, just triple for infinite loop
  // 50 × 3 = 150 DOM nodes — buttery smooth on mobile
  const limitedReviews = carouselReviews;
  const loopedReviews = [...limitedReviews, ...limitedReviews, ...limitedReviews];

  // Auto-scroll using transform:translateX — works on ALL devices including mobile
  const offsetRef = useRef(0);
  const oneSetWidthRef = useRef(0);
  const touchLastXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const velocityRef = useRef(0);       // px/frame momentum
  const lastMoveTimeRef = useRef(0);   // timestamp of last move event

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let cancelled = false;

    // Measure one set width after first paint
    requestAnimationFrame(() => {
      if (cancelled || !track) return;

      // Calculate width of one set of reviews (1/3 of total items)
      const items = Array.from(track.children) as HTMLElement[];
      const oneSetCount = Math.floor(items.length / 3);
      const gap = parseFloat(getComputedStyle(track).gap) || 24;
      let oneSetWidth = 0;
      for (let i = 0; i < oneSetCount && i < items.length; i++) {
        oneSetWidth += items[i].offsetWidth + gap;
      }

      if (oneSetWidth <= 0) return;
      oneSetWidthRef.current = oneSetWidth;

      // Start scrolled to the middle set
      offsetRef.current = oneSetWidth;
      track.style.transform = `translateX(-${offsetRef.current}px)`;

      // Continuous scroll loop — SINGLE point of DOM mutation for smooth 60fps
      const animate = () => {
        if (cancelled) return;

        // Apply momentum decay when not dragging and momentum exists
        if (!isDraggingRef.current && Math.abs(velocityRef.current) > 0.3) {
          offsetRef.current += velocityRef.current;
          velocityRef.current *= 0.95; // exponential decay — feels like native scroll
        } else if (!isDraggingRef.current && Math.abs(velocityRef.current) <= 0.3) {
          velocityRef.current = 0;
          // Auto-scroll only when momentum is done and not paused
          if (!isPausedRef.current) {
            offsetRef.current += 0.8;
          }
        }

        // Seamless infinite loop: wrap around
        const setW = oneSetWidthRef.current;
        if (setW > 0) {
          if (offsetRef.current >= setW * 2) offsetRef.current -= setW;
          if (offsetRef.current < 0) offsetRef.current += setW;
        }

        // Always apply transform — single DOM write per frame
        track.style.transform = `translateX(-${offsetRef.current}px)`;

        rafRef.current = requestAnimationFrame(animate);
      };

      rafRef.current = requestAnimationFrame(animate);
    });

    // Pause/resume helpers
    const pause = () => {
      isPausedRef.current = true;
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
    const resume = (delay = 800) => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = setTimeout(() => {
        isPausedRef.current = false;
      }, delay);
    };

    // Desktop: pause on hover, resume on leave
    const handleMouseEnter = () => { velocityRef.current = 0; pause(); };
    const handleMouseLeave = () => { if (!isDraggingRef.current) resume(500); };

    // Touch swipe with velocity tracking for momentum
    const handleTouchStart = (e: TouchEvent) => {
      isDraggingRef.current = true;
      isPausedRef.current = true;
      velocityRef.current = 0; // kill any existing momentum
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      touchLastXRef.current = e.touches[0].clientX;
      lastMoveTimeRef.current = performance.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      const now = performance.now();
      const currentX = e.touches[0].clientX;
      const delta = touchLastXRef.current - currentX; // positive = swiping left
      const dt = now - lastMoveTimeRef.current;

      // Track velocity (px per 16ms frame)
      if (dt > 0) {
        velocityRef.current = (delta / dt) * 16;
      }

      touchLastXRef.current = currentX;
      lastMoveTimeRef.current = now;
      offsetRef.current += delta;
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
      // Clamp velocity to prevent insane speeds
      velocityRef.current = Math.max(-30, Math.min(30, velocityRef.current));
      // Resume auto-scroll after momentum decays (momentum handles the glide)
      resume(2000);
    };

    // Mouse drag with velocity tracking
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      isPausedRef.current = true;
      velocityRef.current = 0;
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      touchLastXRef.current = e.clientX;
      lastMoveTimeRef.current = performance.now();
      track.style.cursor = "grabbing";
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const now = performance.now();
      const delta = touchLastXRef.current - e.clientX;
      const dt = now - lastMoveTimeRef.current;

      if (dt > 0) {
        velocityRef.current = (delta / dt) * 16;
      }

      touchLastXRef.current = e.clientX;
      lastMoveTimeRef.current = now;
      offsetRef.current += delta;
    };

    const handleMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      track.style.cursor = "";
      velocityRef.current = Math.max(-30, Math.min(30, velocityRef.current));
      resume(1500);
    };

    track.addEventListener("mouseenter", handleMouseEnter);
    track.addEventListener("mouseleave", handleMouseLeave);
    track.addEventListener("touchstart", handleTouchStart, { passive: true });
    track.addEventListener("touchmove", handleTouchMove, { passive: true });
    track.addEventListener("touchend", handleTouchEnd, { passive: true });
    track.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      track.removeEventListener("mouseenter", handleMouseEnter);
      track.removeEventListener("mouseleave", handleMouseLeave);
      track.removeEventListener("touchstart", handleTouchStart);
      track.removeEventListener("touchmove", handleTouchMove);
      track.removeEventListener("touchend", handleTouchEnd);
      track.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Pause auto-scroll when modal is open
  useEffect(() => {
    if (expandedReview) {
      isPausedRef.current = true;
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    } else {
      // Resume quickly after modal closes
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = setTimeout(() => {
        isPausedRef.current = false;
      }, 500);
    }
  }, [expandedReview]);

  // Close modal on Escape key
  useEffect(() => {
    if (!expandedReview) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpandedReview(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [expandedReview]);

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <section className={`${styles.testimonialsSection} ${styles.revealSection}`}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionEyebrow}>{t("Stimmen unserer Gäste", "Guest Voices", "Avis de nos clients")}</span>
        <h2>{t("Was unsere Gäste sagen", "What our guests say", "Ce que disent nos clients")}</h2>
        <p>
          {t(
            `${reviewsData.rating} Sterne auf Google`,
            `Rated ${reviewsData.rating} stars on Google`,
            `${reviewsData.rating} étoiles sur Google`
          )}
        </p>
      </div>

      <div className={styles.carouselWrapper} role="region" aria-label={t("Bewertungen Karussell", "Reviews carousel", "Carrousel d'avis")}>
        <div className={styles.carouselFadeLeft} />
        <div className={styles.carouselFadeRight} />

        <div ref={trackRef} className={styles.carouselTrack}>
          {loopedReviews.map((review, i) => (
            <div
              key={i}
              className={styles.reviewCard}
              onClick={() => setExpandedReview(review)}
              role="button"
              tabIndex={0}
            >
              <div className={styles.reviewStars}>
                <StarRating value={review.rating} size={14} gap={3} />
              </div>
              <p className={styles.reviewCardText}>&ldquo;{getReviewText(review, lang)}&rdquo;</p>
              {getReviewText(review, lang).length > 80 && (
                <span className={styles.readMoreHint}>{t("Weiterlesen", "Read more", "Lire la suite")}</span>
              )}
              <div className={styles.reviewerInfo}>
                <div className={styles.reviewerAvatar}>
                  {/* Avatars are stored root-relative by
                      scripts/localize-review-avatars.mjs, so they need the
                      basePath. The startsWith check keeps an absolute URL
                      working if one ever slips through. */}
                  {review.profilePhoto ? (
                    <Image
                      src={review.profilePhoto.startsWith("http") ? review.profilePhoto : `${BASE}${review.profilePhoto}`}
                      alt={review.author}
                      width={40}
                      height={40}
                      className={styles.reviewerAvatarImg}
                      loading="lazy"
                    />
                  ) : (
                    <span>{getInitials(review.author)}</span>
                  )}
                </div>
                <div className={styles.reviewerMeta}>
                  <span className={styles.reviewerCardName}>{review.author}</span>
                  <span className={styles.reviewerTime}>{getReviewTime(review, lang)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expand modal */}
      {expandedReview && (
        <div className={styles.reviewModalOverlay} onClick={() => setExpandedReview(null)}>
          <div className={styles.reviewModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.reviewModalClose} onClick={() => setExpandedReview(null)}>
              <X size={18} />
            </button>
            <div className={styles.reviewModalStars}>
              <StarRating value={expandedReview.rating} size={16} gap={3} />
            </div>
            <p className={styles.reviewModalText}>&ldquo;{getReviewText(expandedReview, lang)}&rdquo;</p>
            {getReviewText(expandedReview, lang).length >= 178 && (
              <a
                href="https://www.google.com/maps/place/Jaipur/@47.9935628,7.8497035,17z/data=!4m8!3m7!1s0x47911c98d5014727:0x24e7e1a3b6d1dba3!8m2!3d47.9935628!4d7.8497035!9m1!1b1"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.viewOnGoogle}
                onClick={(e) => e.stopPropagation()}
              >
                {t("Vollständige Bewertung auf Google lesen →", "Read full review on Google →", "Lire l'avis complet sur Google →")}
              </a>
            )}
            <div className={styles.reviewModalAuthor}>
              <div className={styles.reviewerAvatar}>
                {expandedReview.profilePhoto ? (
                  <Image src={expandedReview.profilePhoto} alt={expandedReview.author} width={40} height={40} className={styles.reviewerAvatarImg} />
                ) : (
                  <span>{getInitials(expandedReview.author)}</span>
                )}
              </div>
              <div className={styles.reviewerMeta}>
                <span className={styles.reviewerCardName}>{expandedReview.author}</span>
                <span className={styles.reviewerTime}>{getReviewTime(expandedReview, lang)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════
   GALLERY — Staggered Trio + Lightbox
   ═══════════════════════════════════════ */
const galleryImages = [
  // — AMBIANCE & PEOPLE —
  `${BASE}/images/terrace-evening.webp`,           // Terrace full of guests, evening glow, elephant murals
  `${BASE}/images/interior-chandeliers.webp`,       // Gorgeous interior, chandeliers, Indian ceiling art
  `${BASE}/images/friends-cheers.webp`,             // Young friends cheers-ing — fun & lively
  `${BASE}/images/group-dinner-terrace.webp`,       // Large group dinner on terrace
  `${BASE}/images/terrace-umbrella-evening.webp`,   // Evening terrace with umbrella, atmospheric
  `${BASE}/images/jaipur-sign-night.webp`,          // "JAIPUR" signage at night, warm glow
  `${BASE}/images/entrance-elephants-day.webp`,     // Entrance with elephant murals, daytime
  `${BASE}/images/interior-red-wall.webp`,          // Interior with red accent wall, set tables
  `${BASE}/images/sculpture-corner.webp`,           // Intimate corner with Indian sculpture + candle
  `${BASE}/images/spice-bowls-ganesha.webp`,        // Spice bowls with Ganesha statue
  `${BASE}/images/indian-shrine-decor.webp`,        // Beautiful shrine/decor piece
  // — FOOD —
  `${BASE}/images/platter-professional.jpg`,        // Stunning professional platter (prawns, tikka, kebab)
  `${BASE}/images/tandoori-sizzler.webp`,           // Steaming tandoori chicken sizzler with red flower
  `${BASE}/images/curry-spread-overhead.webp`,      // Multiple curry bowls with rice, overhead
  `${BASE}/images/chicken-cocktails-psd.webp`,      // Prawn/chicken cocktails in shot glasses
  `${BASE}/images/thali-naan-spread.webp`,          // Thali with naan, chutneys, full spread
  `${BASE}/images/paneer-curry-copper.webp`,        // Paneer curry in hammered copper pot
  `${BASE}/images/shrimp-curry-rice.webp`,          // Shrimp curry with vegetables and rice
  `${BASE}/images/tandoori-shrimp-salad.webp`,      // Tandoori shrimp with fresh salad
  `${BASE}/images/thali-naan-coke.webp`,            // Thali spread with garlic naan
  `${BASE}/images/dessert-chocolate-orange.webp`,   // Dessert with chocolate drizzle & orange
];

function GallerySection({ t }: { t: (de: string, en: string, fr?: string) => string }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const goNext = () => setLightboxIndex((prev) => (prev + 1) % galleryImages.length);
  const goPrev = () => setLightboxIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (!lightboxOpen) return;
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, [lightboxOpen]);

  // Keyboard: Escape, Left, Right
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen]);

  // Touch swipe handlers for mobile lightbox
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const handleTouchEnd = () => {
    if (touchDeltaX.current > 60) goPrev();
    else if (touchDeltaX.current < -60) goNext();
    touchDeltaX.current = 0;
  };

  // Preview: first 2 images shown, 3rd has overlay
  const previewImages = galleryImages.slice(0, 3);
  const remainingCount = galleryImages.length - 2;

  return (
    <>
      <section id="gallery" className={`${styles.gallerySection} ${styles.revealSection}`}>
        <div className={styles.sectionHeader} style={{ padding: "0 5% 16px" }}>
          <span className={styles.sectionEyebrow}>{t("Impressionen", "Impressions", "Impressions")}</span>
          <h2>{t("Ein Abend im Jaipur", "An evening at Jaipur", "Une soirée au Jaipur")}</h2>
        </div>

        <div className={styles.galleryPreview}>
          {/* Left — tall hero image */}
          <div className={styles.galleryPreviewHero} onClick={() => openLightbox(0)}>
            <Image src={previewImages[0]} alt={`${t("Galerie", "Gallery", "Galerie")} 1`} fill className={styles.galleryImg} sizes="(max-width: 768px) 100vw, 55vw" />
          </div>

          {/* Right column — two staggered images */}
          <div className={styles.galleryPreviewStack}>
            <div className={styles.galleryPreviewTop} onClick={() => openLightbox(1)}>
              <Image src={previewImages[1]} alt={`${t("Galerie", "Gallery", "Galerie")} 2`} fill className={styles.galleryImg} sizes="(max-width: 768px) 50vw, 28vw" />
            </div>
            <div className={styles.galleryPreviewBottom} onClick={() => openLightbox(2)}>
              <Image src={previewImages[2]} alt={`${t("Galerie", "Gallery", "Galerie")} 3`} fill className={styles.galleryImg} sizes="(max-width: 768px) 50vw, 28vw" />
              {/* "See more" overlay */}
              <div className={styles.galleryOverlay}>
                <div className={styles.galleryOverlayPlus}>+</div>
                <span className={styles.galleryOverlayLabel}>
                  +{remainingCount} {t("Fotos", "Photos", "Photos")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full-screen lightbox */}
      {lightboxOpen && (
        <div
          className={styles.lightboxOverlay}
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.lightboxClose} onClick={closeLightbox}>
              <X size={22} />
            </button>

            <button className={styles.lightboxPrev} onClick={goPrev}>
              <ChevronLeft size={28} />
            </button>

            <div className={styles.lightboxImageWrapper}>
              <Image
                src={galleryImages[lightboxIndex]}
                alt={`${t("Galerie", "Gallery", "Galerie")} ${lightboxIndex + 1}`}
                fill
                className={styles.lightboxImage}
                sizes="90vw"
                quality={90}
              />
            </div>

            <button className={styles.lightboxNext} onClick={goNext}>
              <ChevronRight size={28} />
            </button>

            <div className={styles.lightboxCounter}>
              {lightboxIndex + 1} / {galleryImages.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
