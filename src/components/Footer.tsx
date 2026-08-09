"use client";

import Link from "next/link";
import styles from "./footer.module.css";
import { useLanguage } from "@/context/LanguageContext";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {/* Brand Column */}
        <div className={styles.brandCol}>
          <img
            src={`${BASE}/images/logo-navbar.png`}
            alt="Jaipur Indian Heritage"
            className={styles.footerLogo}
          />
          <p className={styles.brandDesc}>
            {t(
              "Freiburgs ältestes indisches Restaurant. Seit 1995 bringen wir die authentischen Aromen Indiens in die historische Altstadt.",
              "Freiburg's oldest Indian restaurant. Since 1995, we bring the authentic flavours of India to the historic old town.",
              "Le plus ancien restaurant indien de Fribourg. Depuis 1995, nous apportons les saveurs authentiques de l'Inde dans la vieille ville historique."
            )}
          </p>
        </div>

        {/* Contact Column */}
        <div>
          <h4 className={styles.footerHeading}>{t("Kontakt", "Contact", "Contact")}</h4>
          <div className={styles.contactInfo}>
            <p>Gerberau 5</p>
            <p>79098 Freiburg im Breisgau</p>
            <p>Tel: <a href="tel:0761272082" style={{ color: "inherit", textDecoration: "none" }}>0761 / 272082</a></p>
          </div>
        </div>

        {/* Hours Column */}
        <div>
          <h4 className={styles.footerHeading}>{t("Öffnungszeiten", "Opening Hours", "Horaires d'ouverture")}</h4>
          <div className={styles.footerList}>
            <span>{t("Montag – Sonntag", "Monday – Sunday", "Lundi – Dimanche")}</span>
            <span>12:00 – 14:30</span>
            <span>18:00 – 22:00</span>
            <span>{t("Kein Ruhetag", "No closing day", "Ouvert tous les jours")}</span>
          </div>
        </div>

      </div>

      <div className={styles.footerBottom}>
        <p>&copy; {new Date().getFullYear()} Jaipur · Indian Heritage. {t("Alle Rechte vorbehalten.", "All rights reserved.", "Tous droits réservés.")}</p>
        <div className={styles.legalLinks}>
          <Link href="/impressum" className={styles.legalLink}>{t("Impressum", "Legal Notice", "Mentions légales")}</Link>
          <Link href="/datenschutz" className={styles.legalLink}>{t("Datenschutz", "Privacy Policy", "Politique de confidentialité")}</Link>
        </div>
      </div>
    </footer>
  );
}
