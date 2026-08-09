import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

// Required by output: "export" — the route is emitted once at build time.
export const dynamic = "force-static";

// Only real pages belong here. /about, /contact, /events, /menu and
// /reservations are redirect stubs that bounce to homepage anchors, so listing
// them would ask search engines to index five copies of the homepage.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const homeAlternates = {
    languages: {
      "de-DE": `${SITE}/`,
      en: `${SITE}/en`,
      fr: `${SITE}/fr`,
    },
  };

  return [
    { url: `${SITE}/`, lastModified, changeFrequency: "monthly", priority: 1, alternates: homeAlternates },
    { url: `${SITE}/en`, lastModified, changeFrequency: "monthly", priority: 0.9, alternates: homeAlternates },
    { url: `${SITE}/fr`, lastModified, changeFrequency: "monthly", priority: 0.9, alternates: homeAlternates },
    { url: `${SITE}/impressum`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE}/datenschutz`, lastModified, changeFrequency: "yearly", priority: 0.2 },
  ];
}
