import type { Metadata } from "next";
import Home from "../page";
import { languageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "JAIPUR · Indian Heritage | Freiburg's oldest Indian restaurant since 1995",
  description:
    "Freiburg's oldest Indian restaurant, family run since 1995. Authentic North Indian cooking, tandoori specialities, vegan and gluten free options. Gerberau 5, Freiburg im Breisgau. Open daily 12:00 to 14:30 and 18:00 to 22:00. Reserve on 0761/272082.",
  alternates: languageAlternates("en"),
  openGraph: {
    title: "JAIPUR · Indian Heritage | Freiburg's oldest Indian restaurant",
    description:
      "Serving authentic North Indian cooking in the heart of Freiburg's old town since 1995. Family run for three generations.",
    locale: "en_US",
  },
};

export default function EnglishHome() {
  return <Home />;
}
