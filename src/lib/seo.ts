import type { Metadata } from "next";

/**
 * Absolute base for every canonical and hreflang on the site.
 *
 * It carries the /jaipur-website basePath because GitHub Pages serves the
 * project from a subpath. Relative canonicals cannot be used here: Next
 * resolves them against the origin, which silently drops the basePath and
 * emits canonicals pointing at URLs that do not exist.
 */
export const SITE =
  process.env.SITE_ORIGIN ?? "https://abhishekmoorjani.github.io/jaipur-website";

type Lang = "de" | "en" | "fr";

const HOME_URL: Record<Lang, string> = {
  de: `${SITE}/`,
  en: `${SITE}/en`,
  fr: `${SITE}/fr`,
};

/**
 * hreflang set for the three homepage variants, plus the canonical for the one
 * being rendered. Every variant advertises all three so search engines can pair
 * them, and x-default points at German as the primary market.
 */
export function languageAlternates(current: Lang): Metadata["alternates"] {
  return {
    canonical: HOME_URL[current],
    languages: {
      "de-DE": HOME_URL.de,
      "en": HOME_URL.en,
      "fr": HOME_URL.fr,
      "x-default": HOME_URL.de,
    },
  };
}

/** Canonical for a standalone page that has no translated variants. */
export function pageCanonical(path: string): Metadata["alternates"] {
  return { canonical: `${SITE}${path}` };
}
