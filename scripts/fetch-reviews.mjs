#!/usr/bin/env node
/**
 * Fetches Google reviews for Jaipur restaurant and saves to src/data/reviews.json
 *
 * Required environment variables:
 *   GOOGLE_PLACES_API_KEY  — Google Cloud API key with Places API enabled
 *   GOOGLE_PLACE_ID        — Google Place ID for the restaurant
 *
 * Usage:
 *   node scripts/fetch-reviews.mjs
 *
 * This script accumulates 5-star reviews over time by merging new fetches
 * with existing data, deduplicating by author + text.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "..", "src", "data", "reviews.json");
const GALLERY_DIR = path.join(__dirname, "..", "public", "images", "gallery");

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACE_ID = process.env.GOOGLE_PLACE_ID;

async function main() {
  if (!API_KEY || !PLACE_ID) {
    console.log("⚠ Missing GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID. Skipping review sync.");
    console.log("  Set these as GitHub repository secrets to enable automatic syncing.");
    process.exit(0);
  }

  console.log("Fetching reviews from Google Places API...");

  // Fetch place details with reviews
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=rating,user_ratings_total,reviews,photos&reviews_sort=newest&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== "OK") {
    console.error("Google API error:", data.status, data.error_message || "");
    process.exit(1);
  }

  const { rating, user_ratings_total, reviews: apiReviews, photos: apiPhotos } = data.result;

  // Load existing data
  let existing = { rating: 0, totalReviews: 0, lastUpdated: "", reviews: [] };
  try {
    existing = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    console.log("No existing reviews.json found, creating new one.");
  }

  // Filter for 5-star reviews and normalize
  const newFiveStarReviews = (apiReviews || [])
    .filter((r) => r.rating === 5)
    .map((r) => ({
      author: r.author_name,
      text: r.text,
      rating: r.rating,
      time: r.relative_time_description,
      profilePhoto: r.profile_photo_url || null,
    }));

  // Merge with existing, deduplicate by author + first 60 chars of text
  const seen = new Set(
    existing.reviews.map((r) => `${r.author}::${r.text.slice(0, 60)}`)
  );
  const merged = [...existing.reviews];

  for (const review of newFiveStarReviews) {
    const key = `${review.author}::${review.text.slice(0, 60)}`;
    if (!seen.has(key)) {
      merged.push(review);
      seen.add(key);
      console.log(`  + New review from ${review.author}`);
    }
  }

  // Also fetch with "most_relevant" sort to get different reviews
  const url2 = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews&reviews_sort=most_relevant&key=${API_KEY}`;
  const res2 = await fetch(url2);
  const data2 = await res2.json();

  if (data2.status === "OK" && data2.result.reviews) {
    const moreFiveStars = data2.result.reviews
      .filter((r) => r.rating === 5)
      .map((r) => ({
        author: r.author_name,
        text: r.text,
        rating: r.rating,
        time: r.relative_time_description,
        profilePhoto: r.profile_photo_url || null,
      }));

    for (const review of moreFiveStars) {
      const key = `${review.author}::${review.text.slice(0, 60)}`;
      if (!seen.has(key)) {
        merged.push(review);
        seen.add(key);
        console.log(`  + New review from ${review.author} (relevant)`);
      }
    }
  }

  // Download place photos for gallery
  if (apiPhotos && apiPhotos.length > 0) {
    fs.mkdirSync(GALLERY_DIR, { recursive: true });
    console.log(`\nDownloading ${Math.min(apiPhotos.length, 10)} place photos...`);

    for (let i = 0; i < Math.min(apiPhotos.length, 10); i++) {
      const photo = apiPhotos[i];
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${photo.photo_reference}&key=${API_KEY}`;
      try {
        const photoRes = await fetch(photoUrl);
        const buffer = Buffer.from(await photoRes.arrayBuffer());
        const filePath = path.join(GALLERY_DIR, `google-${i + 1}.jpg`);
        fs.writeFileSync(filePath, buffer);
        console.log(`  Downloaded google-${i + 1}.jpg`);
      } catch (err) {
        console.warn(`  Failed to download photo ${i + 1}:`, err.message);
      }
    }
  }

  // Write updated data
  const output = {
    rating: rating || existing.rating,
    totalReviews: user_ratings_total || existing.totalReviews,
    lastUpdated: new Date().toISOString().split("T")[0],
    reviews: merged,
  };

  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(output, null, 2));

  console.log(
    `\nDone! ${output.rating}★ rating, ${output.totalReviews} total reviews, ${merged.length} five-star reviews saved.`
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
