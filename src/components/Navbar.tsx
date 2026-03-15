"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./navbar.module.css";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { lang, setLang, t } = useLanguage();

  // Combined: navbar background + scroll spy
  useEffect(() => {
    const sectionIds = pathname === "/" ? ["speisekarte", "about", "reservations", "contact", "gallery"] : [];

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      if (pathname !== "/") return;

      if (window.scrollY < 200) {
        setActiveSection("");
        return;
      }

      let current = "";
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.4) {
          current = id;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const scrollToSection = useCallback(
    (targetId: string) => {
      setMobileOpen(false);
      if (pathname !== "/") {
        // Navigate to home page with the hash — browser will handle scroll
        router.push(`/${targetId}`);
        return;
      }
      // Sanitize targetId to only allow # followed by alphanumeric/hyphens
      const sanitized = targetId.replace(/[^a-zA-Z0-9#-]/g, "");
      const element = document.getElementById(sanitized.replace("#", ""));
      if (element) {
        const y = element.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    },
    [pathname, router]
  );

  const handleMenuOpen = useCallback(() => {
    setMobileOpen(false);
    window.dispatchEvent(new CustomEvent("openMenu"));
  }, []);

  const navLinks = [
    { href: "/", label: "Home", isPage: true },
    { href: "#speisekarte", label: t("Speisekarte", "Menu"), opensMenu: true },
    { href: "#about", label: t("Über uns", "About") },
    { href: "#reservations", label: t("Reservierung", "Reservations") },
    { href: "#contact", label: t("Kontakt", "Contact") },
    { href: "#gallery", label: t("Galerie", "Gallery") },
  ];

  const isLinkActive = (link: typeof navLinks[0]) => {
    if (link.isPage) return pathname === "/" && activeSection === "";
    return activeSection === link.href.replace("#", "");
  };

  return (
    <>
      <nav className={`${styles.navHeader} ${scrolled ? styles.navScrolled : ""}`}>
        <Link href="/" className={styles.logoContainer}>
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>JAIPUR</span>
            <span className={styles.logoSubtitle}>Indian Heritage</span>
          </div>
        </Link>

        <ul className={styles.navLinks}>
          {navLinks.map((link) => {
            const active = isLinkActive(link);
            if (link.isPage) {
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileOpen(false);
                      if (pathname === "/") {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      } else {
                        router.push("/");
                      }
                    }}
                    className={`${styles.navLink} ${active ? styles.activeLink : ""}`}
                  >
                    {link.label}
                  </a>
                </li>
              );
            }
            if (link.opensMenu) {
              return (
                <li key={link.href}>
                  <button
                    className={`${styles.navLink} ${styles.navLinkButton} ${active ? styles.activeLink : ""}`}
                    onClick={handleMenuOpen}
                  >
                    {link.label}
                  </button>
                </li>
              );
            }
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }}
                  className={`${styles.navLink} ${active ? styles.activeLink : ""}`}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className={styles.navActions}>
          <div className={styles.langToggle}>
            <button
              className={`${styles.langBtn} ${lang === "DE" ? styles.langActive : ""}`}
              onClick={() => setLang("DE")}
            >
              DE
            </button>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
            <button
              className={`${styles.langBtn} ${lang === "EN" ? styles.langActive : ""}`}
              onClick={() => setLang("EN")}
            >
              EN
            </button>
          </div>
          <a
            href="#reservations"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("#reservations");
            }}
            className={`${styles.navBtn} btn-primary`}
          >
            {t("Tisch reservieren", "Book a table")}
          </a>
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className={styles.mobileOverlay}>
          {navLinks.map((link) => {
            if (link.isPage) {
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={styles.mobileLink}
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileOpen(false);
                    if (pathname === "/") {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    } else {
                      router.push("/");
                    }
                  }}
                >
                  {link.label}
                </a>
              );
            }
            if (link.opensMenu) {
              return (
                <button
                  key={link.href}
                  className={styles.mobileLink}
                  onClick={handleMenuOpen}
                >
                  {link.label}
                </button>
              );
            }
            return (
              <a
                key={link.href}
                href={link.href}
                className={styles.mobileLink}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
              >
                {link.label}
              </a>
            );
          })}
          <div className={styles.mobileLangToggle}>
            <button
              className={`${styles.mobileLangBtn} ${lang === "DE" ? styles.mobileLangActive : ""}`}
              onClick={() => setLang("DE")}
            >
              Deutsch
            </button>
            <button
              className={`${styles.mobileLangBtn} ${lang === "EN" ? styles.mobileLangActive : ""}`}
              onClick={() => setLang("EN")}
            >
              English
            </button>
          </div>
          <a
            href="#reservations"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("#reservations");
            }}
            className={styles.mobileCta}
          >
            {t("Tisch reservieren", "Book a table")}
          </a>
        </div>
      )}
    </>
  );
}
