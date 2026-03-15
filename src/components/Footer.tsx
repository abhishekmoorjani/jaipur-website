"use client";

import Link from "next/link";
import styles from "./footer.module.css";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {/* Brand Column */}
        <div className={styles.brandCol}>
          <h3 className={styles.logoTitle}>JAIPUR</h3>
          <p className={styles.brandDesc}>
            {t(
              "Freiburgs ältestes indisches Restaurant. Seit 1995 bringen wir die authentischen Aromen Indiens in die historische Altstadt.",
              "Freiburg's oldest Indian restaurant. Since 1995, we bring the authentic flavours of India to the historic old town."
            )}
          </p>
        </div>

        {/* Contact Column */}
        <div>
          <h4 className={styles.footerHeading}>{t("Kontakt", "Contact")}</h4>
          <div className={styles.contactInfo}>
            <p>Gerberau 5</p>
            <p>79098 Freiburg im Breisgau</p>
            <p>Tel: 0761 / 272082</p>
            <p>Email: info@jaipur-freiburg.de</p>
          </div>
        </div>

        {/* Hours Column */}
        <div>
          <h4 className={styles.footerHeading}>{t("Öffnungszeiten", "Opening Hours")}</h4>
          <div className={styles.footerList}>
            <span>{t("Montag – Sonntag", "Monday – Sunday")}</span>
            <span>11:30 – 14:30</span>
            <span>17:30 – 23:30</span>
            <span>{t("Kein Ruhetag", "No closing day")}</span>
          </div>
        </div>

        {/* Newsletter / Waitlist Column */}
        <div className={styles.newsletterCol}>
          <h4 className={styles.footerHeading}>Jaipur Circle</h4>
          <p>{t(
            "Treten Sie unserem exklusiven Waitlist bei und erhalten Sie Einladungen zu besonderen Events.",
            "Join our exclusive waitlist and receive invitations to special events."
          )}</p>
          <form className={styles.inputGroup} onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder={t("E-Mail Adresse", "Email address")}
              className={styles.emailInput}
              required
            />
            <button type="submit" className={`${styles.submitBtn} btn-primary`}>{t("Beitreten", "Join")}</button>
          </form>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>&copy; {new Date().getFullYear()} Jaipur — Indian Heritage. {t("Alle Rechte vorbehalten.", "All rights reserved.")}</p>
        <div className={styles.legalLinks}>
          <Link href="/impressum" className={styles.legalLink}>{t("Impressum", "Legal Notice")}</Link>
          <Link href="/datenschutz" className={styles.legalLink}>{t("Datenschutz", "Privacy Policy")}</Link>
        </div>
      </div>
    </footer>
  );
}
