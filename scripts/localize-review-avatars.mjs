#!/usr/bin/env node
/**
 * Download the Google review avatars and serve them from our own domain.
 *
 * Two reasons, both real:
 *
 * 1. Privacy. Hotlinking lh3.googleusercontent.com sends every visitor's IP
 *    address to Google before they have agreed to anything. Serving the images
 *    ourselves removes the third party request rather than asking permission
 *    for it.
 *
 * 2. Reliability. Google rotates these URLs. A hotlinked avatar silently turns
 *    into a broken image months later, and nobody notices because the page
 *    still renders.
 *
 * Only the carousel reviews are processed, because those are the only ones
 * whose avatars are rendered (see the TestimonialCarousel in src/app/page.tsx).
 *
 * Run after fetch-reviews.mjs. Safe to re-run: already-downloaded avatars are
 * skipped, and reviews whose profilePhoto is already local are left alone.
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DATA_FILE = path.join(ROOT, "src/data/carousel-reviews.json");
const OUT_DIR = path.join(ROOT, "public/images/reviews");
const PUBLIC_PREFIX = "/images/reviews";

// Rendered at 40 CSS px, so 80px covers a 2x display exactly. Google's size
// suffix is replaced rather than appended, since the stored URLs already carry
// a partial one (=w, =w72-, ...).
const SIZE_SUFFIX = "=s80-c";

function normaliseUrl(url) {
  return url.replace(/=[a-z0-9-]*$/i, "") + SIZE_SUFFIX;
}

function fileNameFor(url) {
  // Hash the URL without the size suffix so the same person keeps the same
  // file across runs even if the requested size changes.
  const stable = url.replace(/=[a-z0-9-]*$/i, "");
  return createHash("sha1").update(stable).digest("hex").slice(0, 16) + ".jpg";
}

const exists = (p) => access(p).then(() => true, () => false);

async function main() {
  const raw = JSON.parse(await readFile(DATA_FILE, "utf8"));
  const reviews = raw.reviews ?? raw;
  await mkdir(OUT_DIR, { recursive: true });

  let downloaded = 0, reused = 0, cleared = 0, alreadyLocal = 0;

  for (const review of reviews) {
    const src = review.profilePhoto;
    if (!src) continue;

    if (!src.startsWith("http")) { alreadyLocal++; continue; }

    const file = fileNameFor(src);
    const dest = path.join(OUT_DIR, file);

    if (await exists(dest)) {
      reused++;
    } else {
      try {
        const res = await fetch(normaliseUrl(src), {
          headers: { "user-agent": "jaipur-freiburg.de avatar localiser" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.byteLength < 100) throw new Error(`suspiciously small (${buf.byteLength} bytes)`);
        await writeFile(dest, buf);
        downloaded++;
      } catch (err) {
        // A dead avatar is not a build failure. Drop the reference and the UI
        // falls back to the author's initials, which it already does for
        // reviewers who never set a photo.
        console.warn(`  ! ${review.author}: ${err.message}, falling back to initials`);
        review.profilePhoto = null;
        cleared++;
        continue;
      }
    }
    review.profilePhoto = `${PUBLIC_PREFIX}/${file}`;
  }

  await writeFile(DATA_FILE, JSON.stringify(raw, null, 2) + "\n");

  console.log(
    `avatars: ${downloaded} downloaded, ${reused} already on disk, ` +
    `${alreadyLocal} already local, ${cleared} unavailable`
  );

  const remaining = reviews.filter((r) => r.profilePhoto?.startsWith("http")).length;
  if (remaining > 0) {
    console.error(`FAILED: ${remaining} avatars still point at a third party`);
    process.exit(1);
  }
  console.log("no remaining third party image references");
}

main().catch((err) => { console.error(err); process.exit(1); });
