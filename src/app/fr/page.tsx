import type { Metadata } from "next";
import Home from "../page";
import { languageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "JAIPUR · Indian Heritage | Le plus ancien restaurant indien de Fribourg depuis 1995",
  description:
    "Le plus ancien restaurant indien de Fribourg, familial depuis 1995. Cuisine authentique du nord de l'Inde, spécialités tandoori, options véganes et sans gluten. Gerberau 5, Fribourg-en-Brisgau. Ouvert tous les jours de 12h00 à 14h30 et de 18h00 à 22h00. Réservations au 0761/272082.",
  alternates: languageAlternates("fr"),
  openGraph: {
    title: "JAIPUR · Indian Heritage | Le plus ancien restaurant indien de Fribourg",
    description:
      "Depuis 1995, une cuisine authentique du nord de l'Inde au cœur de la vieille ville de Fribourg. Familial depuis trois générations.",
    locale: "fr_FR",
  },
};

export default function FrenchHome() {
  return <Home />;
}
