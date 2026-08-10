import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/context/LanguageContext";
import { languageAlternates, SITE } from "@/lib/seo";
import reviewsData from "@/data/reviews.json";
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
  title: {
    default: "JAIPUR · Indian Heritage | Freiburgs ältestes indisches Restaurant seit 1995",
    template: "%s | JAIPUR Indian Heritage Freiburg",
  },
  description: "Freiburgs ältestes indisches Restaurant seit 1995. Authentische nordindische Küche, Tandoori-Spezialitäten, vegane & glutenfreie Optionen. Gerberau 5, Freiburg im Breisgau. Täglich 12:00–14:30 & 18:00–22:00. Jetzt reservieren: 0761/272082.",
  keywords: [
    /* German keywords */
    "indisches Restaurant Freiburg",
    "Jaipur Freiburg",
    "Jaipur Restaurant",
    "indisches Essen Freiburg",
    "Tandoori Freiburg",
    "Curry Freiburg",
    "authentisch indisch Freiburg",
    "bestes indisches Restaurant Freiburg",
    "Restaurant Gerberau Freiburg",
    "indische Küche Breisgau",
    "Nordindische Küche Freiburg",
    "Freiburg Altstadt Restaurant",
    "Restaurant Freiburg Innenstadt",
    "indisch essen gehen Freiburg",
    "Chicken Tikka Masala Freiburg",
    "Biryani Freiburg",
    "Naan Brot Freiburg",
    "veganes indisches Essen Freiburg",
    "glutenfrei indisch Freiburg",
    "indisches Catering Freiburg",
    "Familienrestaurant Freiburg",
    "Mittagstisch indisch Freiburg",
    "Abendessen indisch Freiburg",
    "Tandoori Chicken Freiburg",
    "Butter Chicken Freiburg",
    "Lamm Curry Freiburg",
    "ältestes indisches Restaurant Freiburg",
    "Restaurant Empfehlung Freiburg",
    "Essen bestellen Freiburg",
    "Restaurant in der Nähe Freiburg",
    /* English keywords */
    "Indian restaurant Freiburg",
    "Indian food Freiburg",
    "best Indian restaurant Freiburg",
    "authentic Indian cuisine Freiburg Germany",
    "Indian restaurant near me Freiburg",
    "tandoori restaurant Freiburg",
    "curry house Freiburg",
    "Indian takeaway Freiburg",
    "halal restaurant Freiburg",
    "vegetarian Indian Freiburg",
    /* French keywords */
    "restaurant indien Fribourg",
    "cuisine indienne Fribourg",
    "meilleur restaurant indien Fribourg Allemagne",
    "restaurant indien authentique Fribourg",
    "tandoori Fribourg",
    "curry Fribourg",
    "restaurant Fribourg-en-Brisgau",
  ],
  authors: [{ name: "JAIPUR Indian Heritage Restaurant" }],
  creator: "JAIPUR Indian Heritage",
  publisher: "JAIPUR Indian Heritage",
  metadataBase: new URL(SITE),
  // The German homepage. Every other route overrides this with its own
  // canonical; previously they all inherited it and declared themselves
  // duplicates of the homepage. The three language URLs are now distinct, so
  // hreflang finally points somewhere different for each language.
  alternates: languageAlternates("de"),
  openGraph: {
    title: "JAIPUR · Indian Heritage | Freiburgs ältestes indisches Restaurant",
    description: "Seit 1995 servieren wir authentische nordindische Küche im Herzen der Freiburger Altstadt. Familiengeführt seit drei Generationen. Reservieren Sie jetzt!",
    type: "website",
    locale: "de_DE",
    alternateLocale: ["en_US", "fr_FR"],
    siteName: "JAIPUR Indian Heritage",
    url: SITE,
    images: [
      {
        url: `${SITE}/images/food/hero-1.jpg`,
        width: 1200,
        height: 630,
        alt: "JAIPUR Indian Heritage Restaurant — Authentische indische Küche in Freiburg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JAIPUR · Indian Heritage | Indisches Restaurant Freiburg",
    description: "Freiburgs ältestes indisches Restaurant seit 1995. Authentische Küche, warme Atmosphäre, im Herzen der Altstadt.",
    images: [`${SITE}/images/food/hero-1.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "restaurant",
  verification: {},
  other: {
    "geo.region": "DE-BW",
    "geo.placename": "Freiburg im Breisgau",
    "geo.position": "47.9927;7.8488",
    "ICBM": "47.9927, 7.8488",
  },
};

// Single source of truth for the origin, so moving to jaipur-freiburg.de is
// one environment variable rather than a hunt through hardcoded strings.
const BASE_URL = SITE;

const jsonLdRestaurant = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "@id": `${BASE_URL}/#restaurant`,
  name: "JAIPUR Indian Heritage",
  alternateName: ["Jaipur Freiburg", "Jaipur Restaurant Freiburg", "Jaipur Indisches Restaurant"],
  description: "Freiburgs ältestes indisches Restaurant seit 1995. Authentische nordindische Küche — Tandoori, Curry, Biryani, Thali — in familiengeführter Tradition seit drei Generationen. Gerberau 5, im Herzen der Freiburger Altstadt.",
  url: BASE_URL,
  telephone: "+49-761-272082",
  /* email removed — phone-only contact */
  servesCuisine: ["Indian", "North Indian", "Tandoori", "Curry", "Biryani", "Vegetarian Indian"],
  priceRange: "€€",
  currenciesAccepted: "EUR",
  paymentAccepted: "Cash, Credit Card, EC Card",
  image: [
    `${BASE_URL}/images/food/hero-1.jpg`,
    `${BASE_URL}/images/food/hero-2.jpg`,
    `${BASE_URL}/images/food/dish-1.jpg`,
    `${BASE_URL}/images/food/dish-2.jpg`,
    `${BASE_URL}/images/food/dish-3.jpg`,
  ],
  logo: `${BASE_URL}/images/logo-navbar.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Gerberau 5",
    addressLocality: "Freiburg im Breisgau",
    addressRegion: "Baden-Württemberg",
    postalCode: "79098",
    addressCountry: "DE",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 47.9936,
    longitude: 7.8491,
  },
  hasMap: "https://maps.google.com/?cid=2666513855862504355",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "12:00",
      closes: "14:30",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "18:00",
      closes: "22:00",
    },
  ],
  // Read from the synced data rather than hardcoded strings. These previously
  // said 4.6 and 800 while the data file said 701 and Google itself said 4.5
  // with 875. An aggregateRating that does not match the real reviews breaches
  // Google's structured data guidelines and costs the star rich result, so
  // there is exactly one source of truth for it now.
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: String(reviewsData.rating),
    reviewCount: String(reviewsData.totalReviews),
    bestRating: "5",
    worstRating: "1",
  },
  hasMenu: {
    "@type": "Menu",
    name: "Speisekarte / Menu / Carte",
    hasMenuSection: [
      {
        "@type": "MenuSection",
        name: "Empfehlungen des Hauses / Chef's Recommendations",
        hasMenuItem: [
          { "@type": "MenuItem", name: "Jaipur Thali", description: "Fine selection of traditional North Indian specialties", offers: { "@type": "Offer", priceCurrency: "EUR" } },
          { "@type": "MenuItem", name: "Tandoori Mixed Grill", description: "Specialties from the original clay oven", offers: { "@type": "Offer", priceCurrency: "EUR" } },
          { "@type": "MenuItem", name: "Chicken Tikka Masala", description: "Tender chicken in creamy tomato curry sauce", offers: { "@type": "Offer", priceCurrency: "EUR" } },
          { "@type": "MenuItem", name: "Lamb Biryani", description: "Basmati rice with lamb, almonds and raisins", offers: { "@type": "Offer", priceCurrency: "EUR" } },
          { "@type": "MenuItem", name: "Paneer Tikka Masala", description: "Tandoor-grilled paneer in creamy masala sauce", suitableForDiet: "https://schema.org/VegetarianDiet", offers: { "@type": "Offer", priceCurrency: "EUR" } },
          { "@type": "MenuItem", name: "Butter Chicken", description: "Tender chicken in rich, creamy butter sauce" },
          { "@type": "MenuItem", name: "Dal Makhni", description: "Black lentils slow-cooked in butter sauce with Indian spices", suitableForDiet: "https://schema.org/VegetarianDiet" },
        ],
      },
      {
        "@type": "MenuSection",
        name: "Naan & Bread / Fladenbrot",
        hasMenuItem: [
          { "@type": "MenuItem", name: "Garlic Naan", description: "Flatbread with garlic and coriander from the clay oven" },
          { "@type": "MenuItem", name: "Peshwari Naan", description: "House specialty — filled with nuts, raisins, coconut & paneer" },
        ],
      },
      {
        "@type": "MenuSection",
        name: "Biryani / Rice Dishes",
        hasMenuItem: [
          { "@type": "MenuItem", name: "Jaipur Mix Biryani", description: "Saffron rice with chicken, prawns & lamb, garnished with almond flakes" },
          { "@type": "MenuItem", name: "Chicken Tikka Biryani", description: "Grilled chicken with fried saffron rice" },
        ],
      },
    ],
  },
  acceptsReservations: "True",
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "Takeaway", value: true },
    { "@type": "LocationFeatureSpecification", name: "Dine-in", value: true },
    { "@type": "LocationFeatureSpecification", name: "Catering", value: true },
    { "@type": "LocationFeatureSpecification", name: "Vegetarian Options", value: true },
    { "@type": "LocationFeatureSpecification", name: "Vegan Options", value: true },
    { "@type": "LocationFeatureSpecification", name: "Gluten-Free Options", value: true },
  ],
  founder: {
    "@type": "Person",
    name: "Jaipur Family",
  },
  foundingDate: "1995",
  areaServed: {
    "@type": "City",
    name: "Freiburg im Breisgau",
  },
  sameAs: [
    "https://maps.google.com/?cid=2666513855862504355",
  ],
  knowsLanguage: ["de", "en", "fr"],
};

// Local Business / WebSite schema for broader search visibility
const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  url: BASE_URL,
  name: "JAIPUR Indian Heritage — Indisches Restaurant Freiburg",
  alternateName: "Jaipur Indian Restaurant Freiburg",
  description: "Freiburgs ältestes indisches Restaurant seit 1995",
  publisher: { "@id": `${BASE_URL}/#restaurant` },
  inLanguage: ["de-DE", "en", "fr"],
};

// BreadcrumbList for rich results
const jsonLdBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
    { "@type": "ListItem", position: 2, name: "Speisekarte", item: `${BASE_URL}/#speisekarte` },
    { "@type": "ListItem", position: 3, name: "Über uns", item: `${BASE_URL}/#about` },
    { "@type": "ListItem", position: 4, name: "Reservierung", item: `${BASE_URL}/#reservations` },
    { "@type": "ListItem", position: 5, name: "Kontakt", item: `${BASE_URL}/#contact` },
    { "@type": "ListItem", position: 6, name: "Galerie", item: `${BASE_URL}/#gallery` },
  ],
};

// FAQPage schema for FAQ rich snippets in Google
const jsonLdFAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Bieten Sie auch vegane und glutenfreie Gerichte an?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ja, wir haben eine große Auswahl an veganen und glutenfreien Variationen. Bitte sprechen Sie unser Service-Personal darauf an.",
      },
    },
    {
      "@type": "Question",
      name: "Sind Hunde im Restaurant erlaubt?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ja, gut erzogene kleine Hunde sind bei uns willkommen. Wir bitten jedoch darum, dies bei der Reservierung anzugeben.",
      },
    },
    {
      "@type": "Question",
      name: "Bieten Sie Catering für Veranstaltungen an?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Selbstverständlich. Wir bieten maßgeschneiderte Catering-Lösungen für private Feiern und Firmen-Events in Freiburg und Umgebung.",
      },
    },
    {
      "@type": "Question",
      name: "What are the opening hours of Jaipur Restaurant Freiburg?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Jaipur is open every day (Monday to Sunday) for lunch from 12:00 to 14:30 and for dinner from 18:00 to 22:00. There is no closing day.",
      },
    },
    {
      "@type": "Question",
      name: "Wie kann ich einen Tisch im Jaipur reservieren?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sie können Ihren Tisch telefonisch unter 0761 / 27 20 82 reservieren. Wir sind täglich von 12:00 bis 14:30 und 18:00 bis 22:00 Uhr erreichbar.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        {/* No hardcoded canonical here. This tag rendered on every page and
            pinned all of them to the homepage, which is why /impressum and
            /datenschutz declared themselves duplicates. Canonicals now come
            from each route's own metadata.alternates. */}
        <meta name="theme-color" content="#0D1117" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=yes" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdRestaurant) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }}
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
