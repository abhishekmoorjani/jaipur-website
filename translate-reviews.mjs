/**
 * Pre-translate carousel reviews into DE, EN, FR.
 * Reads reviews.json → filters best 50 → translates → saves carousel-reviews.json
 */

import translate from "google-translate-api-x";
import { readFileSync, writeFileSync } from "fs";

const NEG_PHRASES = [
  "teuer", "expensive", "overpriced", "schlecht", "bad", "salzig", "salty",
  "kalt", "cold", "enttäuscht", "disappoint", "nicht der beste", "nicht so",
  "weniger", "allerdings", "zurückhaltend", "mittelmäßig", "mediocre",
  "okay", "nichts besonderes", "nothing special", "could be better",
  "könnte besser", "zu scharf", "too spicy", "too long", "zu lange",
  "leider", "unfortunately", "worst", "schlimmst",
  "horrible", "terrible", "furchtbar", "schrecklich",
  // A review that runs down a named competitor becomes our own advertising once
  // we republish it, and disparaging a competitor breaks section 4 Nr. 1 UWG.
  "goddess",
];

// Detect language of text (rough but effective)
function detectLang(text) {
  const t = text.toLowerCase();
  const en = [" the ", " was ", " and ", " we ", " our ", " food ", " very ", " good ", " with ", " this "].filter(w => t.includes(w)).length;
  const de = [" das ", " und ", " war ", " sehr ", " wir ", " ein ", " auch ", " ist ", " mit ", " dem "].filter(w => t.includes(w)).length;
  const fr = [" très ", " nous ", " avec ", " les ", " une ", " dans ", " pour ", " était ", " bien "].filter(w => t.includes(w)).length;
  if (fr > en && fr > de) return "fr";
  if (en > de) return "en";
  if (de > 0) return "de";
  return "unknown";
}

// Time label translations
const TIME_TRANSLATIONS = {
  de: {
    "year": "Jahr", "years": "Jahren", "month": "Monat", "months": "Monaten",
    "week": "Woche", "weeks": "Wochen", "day": "Tag", "days": "Tagen",
    "ago": "vor", "a": "einem/einer"
  },
  fr: {
    "year": "an", "years": "ans", "month": "mois", "months": "mois",
    "week": "semaine", "weeks": "semaines", "day": "jour", "days": "jours",
    "ago": "il y a", "a": "un/une"
  }
};

function translateTime(timeStr, targetLang) {
  if (!timeStr) return timeStr;
  const t = timeStr.toLowerCase().trim();

  // Parse German time strings: "vor X Monaten/Jahren/Wochen/Tagen"
  let match = t.match(/vor\s+(\d+|einem?|einer?)\s+(jahr|jahren|monat|monaten|woche|wochen|tag|tagen|stunde|stunden)/i);
  if (match) {
    let num = match[1];
    let unit = match[2].toLowerCase();
    // Normalize
    if (num === "einem" || num === "einer" || num === "eine") num = "1";
    if (unit === "jahren" || unit === "jahr") unit = num === "1" ? "year" : "years";
    else if (unit === "monaten" || unit === "monat") unit = num === "1" ? "month" : "months";
    else if (unit === "wochen" || unit === "woche") unit = num === "1" ? "week" : "weeks";
    else if (unit === "tagen" || unit === "tag") unit = num === "1" ? "day" : "days";
    else if (unit === "stunden" || unit === "stunde") unit = num === "1" ? "hour" : "hours";

    if (targetLang === "en") return `${num} ${unit} ago`;
    if (targetLang === "de") {
      const deUnit = { year: "Jahr", years: "Jahren", month: "Monat", months: "Monaten", week: "Woche", weeks: "Wochen", day: "Tag", days: "Tagen", hour: "Stunde", hours: "Stunden" }[unit];
      return `vor ${num} ${deUnit}`;
    }
    if (targetLang === "fr") {
      const frUnit = { year: "an", years: "ans", month: "mois", months: "mois", week: "semaine", weeks: "semaines", day: "jour", days: "jours", hour: "heure", hours: "heures" }[unit];
      return `il y a ${num} ${frUnit}`;
    }
  }

  // Parse English time strings: "X months/years/weeks/days ago"
  match = t.match(/(\d+|a|an)\s+(year|years|month|months|week|weeks|day|days|hour|hours)\s+ago/i);
  if (match) {
    let num = match[1];
    let unit = match[2].toLowerCase();
    if (num === "a" || num === "an") num = "1";

    if (targetLang === "en") return `${num} ${unit} ago`;
    if (targetLang === "de") {
      const deUnit = { year: "Jahr", years: "Jahren", month: "Monat", months: "Monaten", week: "Woche", weeks: "Wochen", day: "Tag", days: "Tagen", hour: "Stunde", hours: "Stunden" }[unit];
      return `vor ${num} ${deUnit}`;
    }
    if (targetLang === "fr") {
      const frUnit = { year: "an", years: "ans", month: "mois", months: "mois", week: "semaine", weeks: "semaines", day: "jour", days: "jours", hour: "heure", hours: "heures" }[unit];
      return `il y a ${num} ${frUnit}`;
    }
  }

  // Parse French: "il y a X mois/ans/semaines/jours"
  match = t.match(/il\s+y\s+a\s+(\d+|un|une)\s+(an|ans|mois|semaine|semaines|jour|jours)/i);
  if (match) {
    let num = match[1];
    let unit = match[2].toLowerCase();
    if (num === "un" || num === "une") num = "1";
    if (unit === "an" || unit === "ans") unit = num === "1" ? "year" : "years";
    else if (unit === "mois") unit = num === "1" ? "month" : "months";
    else if (unit === "semaine" || unit === "semaines") unit = num === "1" ? "week" : "weeks";
    else if (unit === "jour" || unit === "jours") unit = num === "1" ? "day" : "days";

    if (targetLang === "en") return `${num} ${unit} ago`;
    if (targetLang === "de") {
      const deUnit = { year: "Jahr", years: "Jahren", month: "Monat", months: "Monaten", week: "Woche", weeks: "Wochen", day: "Tag", days: "Tagen", hour: "Stunde", hours: "Stunden" }[unit];
      return `vor ${num} ${deUnit}`;
    }
    if (targetLang === "fr") {
      const frUnit = { year: "an", years: "ans", month: "mois", months: "mois", week: "semaine", weeks: "semaines", day: "jour", days: "jours", hour: "heure", hours: "heures" }[unit];
      return `il y a ${num} ${frUnit}`;
    }
  }

  // Fallback: return as-is
  return timeStr;
}

async function translateText(text, from, to) {
  if (from === to) return text;
  if (!text || text.length < 3) return text;
  try {
    const result = await translate(text, { from, to });
    return result.text;
  } catch (e) {
    console.error(`    Translation error (${from}→${to}): ${e.message}`);
    return text; // Return original on failure
  }
}

/**
 * "Gerhard Schmidt" -> "Gerhard S."
 *
 * The reviewer published their name on Google themselves, so displaying it
 * has an Art. 6(1)(f) basis, but re-publishing a full name next to a review
 * on a business's own site is more than the purpose needs. Shortening the
 * surname is the settled conservative practice and costs nothing.
 */
function abbreviateAuthor(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return parts[0] || "";
  const last = parts[parts.length - 1];
  if (last.length <= 2 && last.endsWith(".")) return parts.join(" ");
  // Initial from the first letter, so "Black Pirate (Jack)" gives "Black Pirate J." not "(.".
  const initial = last.match(/\p{L}/u);
  if (!initial) return parts.slice(0, -1).join(" ");
  return `${parts.slice(0, -1).join(" ")} ${initial[0].toUpperCase()}.`;
}

async function main() {
  const data = JSON.parse(readFileSync("src/data/reviews.json", "utf-8"));
  console.log(`Total reviews: ${data.reviews.length}`);

  // Filter: 5-star, 80+ chars, genuinely positive
  const quality = data.reviews.filter(r => {
    if (r.rating !== 5 || r.text.length < 80) return false;
    const lower = r.text.toLowerCase();
    return !NEG_PHRASES.some(p => lower.includes(p));
  });
  console.log(`Quality 5-star reviews: ${quality.length}`);

  // Stable selection, keyed on the review itself rather than its position.
  //
  // The previous version hashed the array INDEX, which is deterministic for a
  // fixed list but reshuffles the whole carousel as soon as new reviews shift
  // everything down by one. Hashing author+text means a given review always
  // sorts to the same place, so the 50 on the page stay put and only change
  // when a review actually enters or leaves the qualifying pool. That also
  // keeps the translation and avatar work proportional to what is new.
  const keyOf = (r) => {
    const s = `${r.author}\u0000${r.text}`;
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h;
  };
  const selected = quality
    .map((r) => ({ r, sort: keyOf(r) }))
    .sort((a, b) => a.sort - b.sort || (a.r.author < b.r.author ? -1 : 1))
    .slice(0, 50)
    .map((s) => s.r);
  console.log(`Selected for carousel: ${selected.length} (stable, keyed on review identity)`);

  // Translate each review into all 3 languages
  const translated = [];
  for (let i = 0; i < selected.length; i++) {
    const r = selected[i];
    const origLang = detectLang(r.text);
    console.log(`  [${i + 1}/50] ${r.author} (detected: ${origLang}): "${r.text.substring(0, 60)}..."`);

    // Determine source language for translation
    const srcLang = origLang === "unknown" ? "de" : origLang; // Default to German if unknown

    // Translate text into all 3 languages
    let text_de, text_en, text_fr;

    if (srcLang === "de") {
      text_de = r.text;
      text_en = await translateText(r.text, "de", "en");
      await sleep(200); // Rate limit
      text_fr = await translateText(r.text, "de", "fr");
      await sleep(200);
    } else if (srcLang === "en") {
      text_en = r.text;
      text_de = await translateText(r.text, "en", "de");
      await sleep(200);
      text_fr = await translateText(r.text, "en", "fr");
      await sleep(200);
    } else if (srcLang === "fr") {
      text_fr = r.text;
      text_de = await translateText(r.text, "fr", "de");
      await sleep(200);
      text_en = await translateText(r.text, "fr", "en");
      await sleep(200);
    } else {
      // Translate from detected/assumed language
      text_de = await translateText(r.text, srcLang, "de");
      await sleep(200);
      text_en = await translateText(r.text, srcLang, "en");
      await sleep(200);
      text_fr = await translateText(r.text, srcLang, "fr");
      await sleep(200);
    }

    // Translate time labels
    const time_de = translateTime(r.time, "de");
    const time_en = translateTime(r.time, "en");
    const time_fr = translateTime(r.time, "fr");

    translated.push({
      author: abbreviateAuthor(r.author),
      rating: r.rating,
      // Deliberately null. See abbreviateAuthor above: re-hosting the
      // reviewer's Google photo is a reproduction under section 16 UrhG, and
      // section 72 UrhG protects every photograph with no originality
      // threshold, so it applies whether or not a face is recognisable. The
      // card falls back to a monogram, which is already styled.
      profilePhoto: null,
      text_de,
      text_en,
      text_fr,
      time_de,
      time_en,
      time_fr,
    });

    // Show progress
    if (text_en !== r.text) {
      console.log(`    EN: "${text_en.substring(0, 60)}..."`);
    }
  }

  // Save
  const output = {
    rating: data.rating,
    totalReviews: data.totalReviews,
    lastUpdated: data.lastUpdated,
    reviews: translated,
  };

  writeFileSync("src/data/carousel-reviews.json", JSON.stringify(output, null, 2), "utf-8");
  // The homepage needs only these three numbers. Importing reviews.json itself
  // shipped every scraped review, with full names, inside the page script.
  writeFileSync("src/data/review-summary.json", JSON.stringify({
    rating: data.rating, totalReviews: data.totalReviews, lastUpdated: data.lastUpdated,
  }, null, 2) + "\n", "utf-8");
  console.log(`\nSaved ${translated.length} translated reviews to src/data/carousel-reviews.json`);

  // Verify all have all 3 languages
  const missing = translated.filter(r => !r.text_de || !r.text_en || !r.text_fr);
  if (missing.length > 0) {
    console.log(`WARNING: ${missing.length} reviews missing translations`);
    missing.forEach(r => console.log(`  ${r.author}: de=${!!r.text_de} en=${!!r.text_en} fr=${!!r.text_fr}`));
  } else {
    console.log("All reviews have DE, EN, FR translations ✓");
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(console.error);
