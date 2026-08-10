import type { NextConfig } from "next";

/**
 * The site is served from a subpath on GitHub Pages (/jaipur-website) but from
 * the root on its own domain (jaipur-freiburg.de). Hardcoding the subpath is
 * what produced the broken Home link, and it is also why robots.txt lands at a
 * path no crawler reads.
 *
 * SITE_BASE_PATH controls it:
 *   unset            → "/jaipur-website", the current GitHub Pages deploy
 *   SITE_BASE_PATH=""→ root, for the custom domain
 *
 * Set it to an empty string in the host's build settings when the site moves.
 */
const basePath = process.env.SITE_BASE_PATH ?? "/jaipur-website";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
