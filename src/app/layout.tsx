import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

const playfair = Playfair_Display({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JAIPUR — Indian Heritage | Freiburgs ältestes indisches Restaurant",
  description: "Freiburgs ältestes indisches Restaurant seit 1995. Erleben Sie authentische indische Küche in der Gerberau 5, Freiburg im Breisgau.",
  openGraph: {
    title: "JAIPUR — Indian Heritage",
    description: "Freiburgs ältestes indisches Restaurant seit 1995. Authentische indische Küche im Herzen der Altstadt.",
    type: "website",
    locale: "de_DE",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "JAIPUR — Indian Heritage",
  description: "Freiburgs ältestes indisches Restaurant seit 1995",
  url: "https://jaipur-freiburg.de",
  telephone: "+49-761-272082",
  email: "info@jaipur-freiburg.de",
  servesCuisine: "Indian",
  priceRange: "€€",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Gerberau 5",
    addressLocality: "Freiburg im Breisgau",
    postalCode: "79098",
    addressCountry: "DE",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 47.9927,
    longitude: 7.8488,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "11:30",
      closes: "14:30",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "17:30",
      closes: "23:30",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.5",
    reviewCount: "585",
    bestRating: "5",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <LanguageProvider>
          <Navbar />
          {children}
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
