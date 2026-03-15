"use client";

import { useRef, useState, useEffect } from "react";
import styles from "./home.module.css";
import Image from "next/image";
import { Star, ChevronDown, ArrowRight, MapPin, Phone, Users, Calendar, Award } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import MenuPopup from "@/components/MenuPopup";
import { useLanguage } from "@/context/LanguageContext";
import { useGSAP } from "@gsap/react";

const heroImages = [
  "/images/food/hero-1.jpg",
  "/images/food/hero-2.jpg",
  "/images/food/hero-3.jpg",
  "/images/food/hero-4.jpg",
  "/images/food/hero-5.jpg",
  "/images/food/hero-6.jpg",
  "/images/food/hero-7.jpg",
];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { t } = useLanguage();

  // Hero slideshow — cycle every 5 seconds
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

    // Section reveals — fade up on scroll
    const sections = gsap.utils.toArray(`.${styles.revealSection}`) as HTMLElement[];
    sections.forEach((sec) => {
      gsap.fromTo(
        sec,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: { trigger: sec, start: "top 82%", toggleActions: "play none none reverse" },
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

    // Highlight cards stagger
    gsap.fromTo(
      `.${styles.highlightCard}`,
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: "power2.out",
        scrollTrigger: { trigger: `.${styles.highlightsGrid}`, start: "top 85%" },
      }
    );

    // Testimonial cards stagger
    gsap.fromTo(
      `.${styles.testimonialCard}`,
      { y: 40, opacity: 0, scale: 0.96 },
      {
        y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.15, ease: "power2.out",
        scrollTrigger: { trigger: `.${styles.testimonialGrid}`, start: "top 85%" },
      }
    );

    // Gallery items stagger
    gsap.fromTo(
      `.${styles.galleryItem}`,
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1, scale: 1, duration: 0.6, stagger: 0.08, ease: "power2.out",
        scrollTrigger: { trigger: `.${styles.galleryGrid}`, start: "top 85%" },
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
          <span className={styles.eyebrow}>{t("Seit 1995 · Freiburg", "Since 1995 · Freiburg")}</span>
          <h1 className={styles.headline}>
            {t("Freiburgs ältestes indisches Restaurant", "Freiburg's oldest Indian restaurant")}
          </h1>
          <p className={styles.heroSub}>
            {t(
              "Authentische indische Küche im Herzen der Altstadt — warm, elegant und seit drei Jahrzehnten familiengeführt.",
              "Authentic Indian cuisine in the heart of the old town — warm, elegant, and family-run for three decades."
            )}
          </p>
          <div className={styles.heroCtas}>
            <a href="#reservations" className={`${styles.heroBtn} btn-primary`}>
              {t("Tisch reservieren", "Book a table")}
            </a>
            <button
              className={`${styles.heroBtn} btn-outline`}
              onClick={() => setIsMenuOpen(true)}
            >
              {t("Speisekarte", "View menu")}
            </button>
          </div>
          <div className={styles.heroMeta}>
            <div className={styles.heroStars}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="var(--color-accent)" color="var(--color-accent)" />
              ))}
              <span>4.5 · 585+ Google</span>
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
          <span>{t("Entdecken", "Explore")}</span>
          <ChevronDown size={18} />
        </div>
      </section>

      {/* ═══════════════════════════════════════
          2) SIGNATURE DISHES
         ═══════════════════════════════════════ */}
      <section id="speisekarte" className={`${styles.signatureSection} ${styles.revealSection} section-padding`}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>{t("Unsere Küche", "Our Kitchen")}</span>
          <h2>{t("Empfehlungen des Hauses", "Chef's Recommendations")}</h2>
          <p>{t("Entdecken Sie die Vielfalt unserer authentischen indischen Küche.", "Discover the diversity of our authentic Indian cuisine.")}</p>
        </div>
        <div className={styles.dishGrid}>
          {[
            { name: "Jaipur Thali", desc: t("Eine feine Auswahl traditioneller nordindischer Spezialitäten", "A fine selection of traditional North Indian specialties"), img: "/images/food/dish-1.jpg" },
            { name: "Tandoori Mixed Grill", desc: t("Spezialitäten aus dem original Lehmofen", "Specialties from the original clay oven"), img: "/images/food/dish-4.jpg" },
            { name: "Chicken Tikka Masala", desc: t("Zartes Huhn in cremiger Tomaten-Curry-Soße", "Tender chicken in creamy tomato curry sauce"), img: "/images/food/dish-2.jpg" },
            { name: "Lamb Biryani", desc: t("Basmatireis mit Lammfleisch, Mandeln und Rosinen", "Basmati rice with lamb, almonds and raisins"), img: "/images/food/dish-3.jpg" },
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
          <button onClick={() => setIsMenuOpen(true)} className="btn-outline">
            {t("Gesamte Speisekarte ansehen", "View full menu")} <ArrowRight size={18} style={{ marginLeft: 8, verticalAlign: "middle" }} />
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          3) ABOUT — Story
         ═══════════════════════════════════════ */}
      <section id="about" className={`${styles.storySection} ${styles.revealSection} section-padding`}>
        <div className={styles.storyContainer}>
          <div className={styles.storyImageWrapper}>
            <Image src="/images/food/dish-5.jpg" alt={t("Jaipur Restaurant Impressionen", "Jaipur restaurant impressions")} fill className={styles.storyImg} />
          </div>
          <div className={styles.storyContent}>
            <span className={styles.sectionEyebrow}>{t("Unsere Geschichte", "Our Story")}</span>
            <h2 className={styles.storyTitle}>
              {t("Seit über 30 Jahren ein Teil von Freiburg", "Part of Freiburg for over 30 years")}
            </h2>
            <p>
              {t(
                "Im Jahr 1995 öffneten wir unsere Türen in der malerischen Gerberau. Seitdem haben wir es uns zur Aufgabe gemacht, die uralten Traditionen und die vielfältigen Aromen Indiens in unsere geliebte Stadt zu bringen. Mit Originalrezepten, die von Generation zu Generation in unserer Familie weitergegeben wurden, laden wir Sie ein, ein Stück echter indischer Kultur und Gastlichkeit zu erleben.",
                "In 1995, we opened our doors in the picturesque Gerberau. Since then, we have made it our mission to bring the ancient traditions and diverse flavours of India to our beloved city. With original recipes passed down through generations in our family, we invite you to experience a piece of genuine Indian culture and hospitality."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          3b) HIGHLIGHTS — Key selling points
         ═══════════════════════════════════════ */}
      <section className={`${styles.highlightsSection} ${styles.revealSection}`}>
        <div className={styles.highlightsGrid}>
          {[
            { number: "30+", label: t("Jahre", "Years"), desc: t("Freiburgs ältestes indisches Restaurant — seit 1995 ein fester Teil der Altstadt.", "Freiburg's oldest Indian restaurant — a fixture of the old town since 1995."), icon: <Calendar size={24} /> },
            { number: "3", label: t("Generationen", "Generations"), desc: t("Originalrezepte, weitergegeben von Generation zu Generation in unserer Familie.", "Original recipes passed down from generation to generation in our family."), icon: <Award size={24} /> },
            { number: "585+", label: t("Bewertungen", "Reviews"), desc: t("4.5 Sterne auf Google — unsere Gäste lieben die Authentizität und den Service.", "4.5 stars on Google — our guests love the authenticity and service."), icon: <Star size={24} /> },
            { number: "7", label: t("Tage", "Days"), desc: t("Kein Ruhetag — jeden Tag der Woche für Sie geöffnet, mittags und abends.", "No closing day — open every day of the week for you, lunch and dinner."), icon: <Users size={24} /> },
          ].map((item, i) => (
            <div key={i} className={styles.highlightCard}>
              <div className={styles.highlightIcon}>{item.icon}</div>
              <div className={styles.highlightNumber}>{item.number}</div>
              <div className={styles.highlightLabel}>{item.label}</div>
              <p className={styles.highlightDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Menu Popup */}
      <MenuPopup isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* ═══════════════════════════════════════
          5) TESTIMONIALS
         ═══════════════════════════════════════ */}
      <section className={`${styles.testimonialsSection} ${styles.revealSection} section-padding`}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>{t("Stimmen unserer Gäste", "Guest Voices")}</span>
          <h2>{t("Was unsere Gäste sagen", "What our guests say")}</h2>
        </div>
        <div className={styles.testimonialGrid}>
          {[
            { name: "Anna S.", text: t("Das beste indische Restaurant in Freiburg! Das Chicken Tikka ist ein Traum.", "The best Indian restaurant in Freiburg! The Chicken Tikka is a dream."), stars: 5 },
            { name: "Michael R.", text: t("Authentische Atmosphäre und fantastisches Essen. Wir kommen immer wieder gerne hierher.", "Authentic atmosphere and fantastic food. We always love coming back here."), stars: 5 },
            { name: "Julia M.", text: t("Sehr freundlicher Service und extrem leckeres Naan Brot. Absolut empfehlenswert!", "Very friendly service and extremely delicious naan bread. Absolutely recommended!"), stars: 5 },
          ].map((review, i) => (
            <div key={i} className={styles.testimonialCard}>
              <div className={styles.stars}>
                {[...Array(review.stars)].map((_, j) => <Star key={j} size={16} fill="var(--color-accent)" color="var(--color-accent)" />)}
              </div>
              <p className={styles.reviewText}>&ldquo;{review.text}&rdquo;</p>
              <span className={styles.reviewerName}>{review.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          6) RESERVATION FORM
         ═══════════════════════════════════════ */}
      <section className={`${styles.reservationSection} ${styles.revealSection} section-padding`} id="reservations">
        <div className={styles.resContainer}>
          <div className={styles.resInfo}>
            <span className={styles.sectionEyebrow}>{t("Reservierung", "Reservation")}</span>
            <h2>{t("Reservieren Sie Ihren Tisch", "Reserve your table")}</h2>
            <p>{t("Freuen Sie sich auf einen unvergesslichen Abend bei Jaipur.", "Look forward to an unforgettable evening at Jaipur.")}</p>
            <div className={styles.resDetails}>
              <div className={styles.resDetailItem}>
                <MapPin size={18} className={styles.resDetailIcon} />
                <div>
                  <span>Gerberau 5</span>
                  <span>79098 Freiburg im Breisgau</span>
                </div>
              </div>
              <div className={styles.resDetailItem}>
                <Phone size={18} className={styles.resDetailIcon} />
                <div>
                  <span>{t("Telefonisch reservieren", "Reserve by phone")}</span>
                  <a href="tel:0761272082" className={styles.phoneNumber}>0761 / 27 20 82</a>
                </div>
              </div>
            </div>
          </div>
          <form className={styles.resForm} onSubmit={(e) => e.preventDefault()}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t("Name", "Name")}</label>
                <input type="text" placeholder={t("Ihr Name", "Your name")} required className={styles.inputField} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t("E-Mail", "Email")}</label>
                <input type="email" placeholder={t("Ihre E-Mail", "Your email")} required className={styles.inputField} />
              </div>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t("Telefon", "Phone")}</label>
                <input type="tel" placeholder={t("Ihre Telefonnummer", "Your phone")} className={styles.inputField} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t("Anzahl Personen", "Guests")}</label>
                <select className={styles.inputField} required defaultValue="">
                  <option value="" disabled>{t("Bitte wählen", "Please select")}</option>
                  {[1,2,3,4,5,6,7,8].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? t("Person", "Guest") : t("Personen", "Guests")}</option>
                  ))}
                  <option value="9+">{t("9+ Personen", "9+ Guests")}</option>
                </select>
              </div>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t("Datum", "Date")}</label>
                <input
                  type="date"
                  required
                  className={styles.inputField}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t("Uhrzeit", "Time")}</label>
                <select className={styles.inputField} required defaultValue="">
                  <option value="" disabled>{t("Uhrzeit wählen", "Select time")}</option>
                  <option value="11:30">11:30</option>
                  <option value="12:00">12:00</option>
                  <option value="12:30">12:30</option>
                  <option value="13:00">13:00</option>
                  <option value="13:30">13:30</option>
                  <option value="14:00">14:00</option>
                  <option value="17:30">17:30</option>
                  <option value="18:00">18:00</option>
                  <option value="18:30">18:30</option>
                  <option value="19:00">19:00</option>
                  <option value="19:30">19:30</option>
                  <option value="20:00">20:00</option>
                  <option value="20:30">20:30</option>
                  <option value="21:00">21:00</option>
                  <option value="21:30">21:30</option>
                  <option value="22:00">22:00</option>
                  <option value="22:30">22:30</option>
                  <option value="23:00">23:00</option>
                </select>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t("Anmerkungen", "Notes")}</label>
              <textarea
                placeholder={t("Allergien, besondere Wünsche...", "Allergies, special requests...")}
                className={styles.textareaField}
                rows={2}
              />
            </div>
            <button type="submit" className={`${styles.formBtn} btn-primary`}>
              {t("Tisch anfragen", "Request table")}
            </button>
          </form>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          7) MAP & FIND US
         ═══════════════════════════════════════ */}
      <section id="contact" className={`${styles.mapSection} ${styles.revealSection} section-padding`}>
        <div className={styles.mapContainer}>
          <div className={styles.mapInfo}>
            <span className={styles.sectionEyebrow}>{t("Standort", "Location")}</span>
            <h2>{t("Besuchen Sie uns", "Visit us")}</h2>
            <p style={{ marginTop: "20px", marginBottom: "20px" }}>
              Gerberau 5<br />
              79098 Freiburg im Breisgau
            </p>
            <p>
              {t(
                "Gelegen im Herzen der malerischen Altstadt, direkt an den historischen Bächle.",
                "Located in the heart of the picturesque old town, right by the historic Bächle."
              )}
            </p>
            <div className={styles.contactPhone}>
              <Phone size={18} className={styles.contactPhoneIcon} />
              <a href="tel:0761272082" className={styles.contactPhoneLink}>0761 / 27 20 82</a>
            </div>
            <div className={styles.openingHours}>
              <h4>{t("Öffnungszeiten", "Opening Hours")}</h4>
              <p>{t("Montag – Sonntag", "Monday – Sunday")}</p>
              <p>11:30 – 14:30 &nbsp;|&nbsp; 17:30 – 23:30</p>
              <p className={styles.noClosingDay}>{t("Kein Ruhetag", "No closing day")}</p>
            </div>
          </div>
          <div className={styles.mapWrapper}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2669.5!2d7.8488!3d47.9927!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47911b26e7d5a38f%3A0x4a3510c31f1d1a0!2sGerberau+5%2C+79098+Freiburg+im+Breisgau%2C+Germany!5e0!3m2!1sen!2sde!4v1700000000000!5m2!1sen!2sde"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={t("Jaipur Standort Karte", "Jaipur location map")}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          8) GALLERY
         ═══════════════════════════════════════ */}
      <section id="gallery" className={`${styles.gallerySection} ${styles.revealSection}`}>
        <div className={styles.sectionHeader} style={{ padding: "0 5% 50px" }}>
          <span className={styles.sectionEyebrow}>{t("Impressionen", "Impressions")}</span>
          <h2>{t("Ein Abend im Jaipur", "An evening at Jaipur")}</h2>
        </div>
        <div className={styles.galleryGrid}>
          {[
            "/images/food/dish-5.jpg",
            "/images/food/dish-6.jpg",
            "/images/food/dish-7.jpg",
            "/images/food/dish-1.jpg",
            "/images/food/dish-2.jpg",
            "/images/food/dish-3.jpg",
            "/images/food/dish-4.jpg",
          ].map((img, i) => (
            <div key={i} className={styles.galleryItem}>
              <Image src={img} alt={`${t("Galerie", "Gallery")} ${i + 1}`} fill className={styles.galleryImg} sizes="(max-width: 768px) 50vw, 25vw" />
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          9) FAQ
         ═══════════════════════════════════════ */}
      <section className={`${styles.faqSection} ${styles.revealSection} section-padding`}>
        <div className={styles.sectionHeader}>
          <h2>{t("Häufig gestellte Fragen", "Frequently asked questions")}</h2>
        </div>
        <div className={styles.faqList}>
          <FAQItem
            question={t("Bieten Sie auch vegane und glutenfreie Gerichte an?", "Do you offer vegan and gluten-free dishes?")}
            answer={t("Ja, wir haben eine große Auswahl an veganen und glutenfreien Variationen. Bitte sprechen Sie unser Service-Personal darauf an.", "Yes, we have a large selection of vegan and gluten-free options. Please ask our service staff.")}
          />
          <FAQItem
            question={t("Sind Hunde im Restaurant erlaubt?", "Are dogs allowed in the restaurant?")}
            answer={t("Ja, gut erzogene kleine Hunde sind bei uns willkommen. Wir bitten jedoch darum, dies bei der Reservierung anzugeben.", "Yes, well-behaved small dogs are welcome. However, we ask that you mention this when making a reservation.")}
          />
          <FAQItem
            question={t("Bieten Sie Catering für Veranstaltungen an?", "Do you offer catering for events?")}
            answer={t("Selbstverständlich. Wir bieten maßgeschneiderte Catering-Lösungen für private Feiern und Firmen-Events in Freiburg und Umgebung.", "Of course. We offer tailored catering solutions for private celebrations and corporate events in Freiburg and the surrounding area.")}
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
            {t("Einfach vorbestellen & abholen!", "Simply pre-order & pick up!")}
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
    <div className={styles.faqItem} onClick={() => setIsOpen(!isOpen)}>
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
