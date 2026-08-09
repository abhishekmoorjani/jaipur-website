import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

// Required by output: "export" — the route is emitted once at build time.
export const dynamic = "force-static";

// Caveat worth knowing: crawlers only read robots.txt from the domain root.
// On a GitHub Pages project site this file is served at
// /jaipur-website/robots.txt, so it is advisory only until the site moves to
// its own domain. The sitemap reference still works when the sitemap URL is
// submitted directly in Search Console.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/about", "/contact", "/events", "/menu", "/reservations"],
    },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
