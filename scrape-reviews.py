"""
Scrape FULL ORIGINAL-LANGUAGE Google Maps reviews for Jaipur Restaurant Freiburg.
- Clicks "See original" on every auto-translated review
- Filters out ALL owner responses (not just "Team Jaipur" ones)
- Gets the actual customer review text, not Google's auto-translation
"""

import json
import time
import re
from datetime import date
from playwright.sync_api import sync_playwright


def is_owner_response(text, author):
    """Detect owner/restaurant responses — thorough check."""
    t = text.lower().strip()
    a = author.lower().strip()

    # Author name contains restaurant/team/owner keywords
    if any(kw in a for kw in ["jaipur", "team", "inhaber", "owner", "manager", "geschäftsführer"]):
        return True

    # Starts with greeting + name pattern (owner replying to reviewer)
    if re.match(r'^(hallo|hi|liebe[rs]?|dear|hello)\s+[A-Z]', text.strip()):
        # If it also contains typical reply markers
        if any(kw in t for kw in ["danke", "thank", "sterne", "stars", "bewertung", "review",
                                    "🙏", "besuch", "visit", "willkommen", "welcome",
                                    "hoffentlich", "hopefully", "bis bald", "see you",
                                    "freuen uns", "glad", "team"]):
            return True

    # Contains "Team Jaipur" or "🙏" with reply-like content
    if "team jaipur" in t:
        return True

    # Short messages with 🙏 that are clearly replies
    if "🙏" in t and len(text) < 150 and any(kw in t for kw in ["danke", "thank", "sterne", "stars"]):
        return True

    # "Vielen Dank für" + review/visit/stars
    if re.search(r'(vielen\s+)?dank[e]?\s+(für|for)', t):
        if any(kw in t for kw in ["bewertung", "review", "sterne", "stars", "besuch", "visit",
                                    "feedback", "rückmeldung", "empfehlung"]):
            return True

    # "Wir freuen uns" patterns (restaurant speaking as "we")
    if t.startswith("wir freuen uns") or t.startswith("we are glad") or t.startswith("we appreciate"):
        return True

    # Generic short thank-you that's clearly an owner reply
    if len(text) < 100 and t.startswith("danke") and ("🙏" in t or "sterne" in t or "stars" in t):
        return True

    return False


def scrape():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, args=["--lang=en-US"])
        page = browser.new_page(viewport={"width": 1280, "height": 900}, locale="en-US")

        print("[1] Opening Google Maps...")
        page.goto("https://www.google.com/maps/search/Jaipur+indisches+Restaurant+Freiburg+Gerberau", timeout=30000)
        time.sleep(5)

        # Accept cookies
        try:
            for txt in ["Accept all", "Alle akzeptieren", "Tout accepter"]:
                btn = page.locator(f'button:has-text("{txt}")')
                if btn.count() > 0 and btn.first.is_visible(timeout=2000):
                    btn.first.click()
                    time.sleep(2)
                    print("    Accepted cookies")
                    break
        except:
            pass

        # Click Reviews tab
        print("[2] Clicking reviews tab...")
        tabs = page.locator('button[role="tab"]')
        for i in range(tabs.count()):
            txt = tabs.nth(i).text_content().strip()
            if any(kw in txt.lower() for kw in ["review", "rezension", "bewertung"]):
                tabs.nth(i).click()
                time.sleep(3)
                print(f"    Clicked '{txt}'")
                break

        # Find scrollable panel
        print("[3] Finding scroll panel...")
        handle = page.evaluate_handle('''() => {
            const divs = document.querySelectorAll('div');
            for (const div of divs) {
                if (div.scrollHeight > div.clientHeight + 200 &&
                    div.clientHeight > 300 &&
                    div.clientHeight < window.innerHeight &&
                    (div.querySelector('[data-review-id]') || div.querySelector('.jftiEf'))) {
                    return div;
                }
            }
            return null;
        }''')
        scroll_panel = handle.as_element() if handle else None

        if not scroll_panel:
            print("    ERROR: No scroll panel found")
            page.screenshot(path="/tmp/gm_err.png")
            browser.close()
            return

        info = scroll_panel.evaluate('el => `scrollH=${el.scrollHeight} clientH=${el.clientHeight}`')
        print(f"    Found: {info}")

        # Scroll to load ALL reviews
        print("[4] Scrolling to load all reviews...")
        last_count = 0
        stale = 0

        for i in range(400):
            scroll_panel.evaluate('el => el.scrollBy(0, 3000)')
            time.sleep(0.8)

            # Every 3 scrolls: expand "More" buttons AND click "See original" buttons
            if i % 3 == 2:
                page.evaluate('''() => {
                    // Expand truncated reviews
                    document.querySelectorAll('button.w8nwRe.kyuRq, button.M77dve').forEach(b => {
                        try { if (b.offsetParent) b.click(); } catch(e) {}
                    });
                    // Click "See original" / "Original anzeigen" to get original language
                    document.querySelectorAll('span.ryupo, button.ryupo').forEach(b => {
                        try { if (b.offsetParent) b.click(); } catch(e) {}
                    });
                }''')

            count = page.locator('[data-review-id]').count()
            if count == 0:
                count = page.locator('.jftiEf').count()

            if count == last_count:
                stale += 1
            else:
                stale = 0
            last_count = count

            if i % 25 == 0:
                print(f"    Scroll {i}: {count} reviews")

            if stale >= 15 and count > 100:
                print(f"    Done: {count} reviews after {i} scrolls")
                break

        # Final pass: expand ALL "More" + click ALL "See original"
        print("[5] Final expand + original language pass...")
        result = page.evaluate('''() => {
            let expanded = 0, originals = 0;
            // Expand all "More" buttons
            document.querySelectorAll('button.w8nwRe.kyuRq, button.M77dve').forEach(b => {
                try { if (b.offsetParent) { b.click(); expanded++; } } catch(e) {}
            });
            // Click all "See original" links
            // These can be spans or links with class "ryupo" or containing "Original" text
            document.querySelectorAll('span, button, a').forEach(el => {
                try {
                    const txt = el.textContent.trim().toLowerCase();
                    if ((txt === 'see original' || txt === 'original anzeigen' ||
                         txt.includes("original") || txt === 'show original') &&
                        el.offsetParent) {
                        el.click();
                        originals++;
                    }
                } catch(e) {}
            });
            return { expanded, originals };
        }''')
        print(f"    Expanded {result['expanded']} reviews, clicked {result['originals']} 'See original' buttons")
        time.sleep(2)

        # Second pass for originals (some may have appeared after first click)
        result2 = page.evaluate('''() => {
            let originals = 0;
            document.querySelectorAll('span, button, a').forEach(el => {
                try {
                    const txt = el.textContent.trim().toLowerCase();
                    if ((txt === 'see original' || txt === 'original anzeigen' ||
                         txt.includes("original") || txt === 'show original') &&
                        el.offsetParent) {
                        el.click();
                        originals++;
                    }
                } catch(e) {}
            });
            return originals;
        }''')
        if result2 > 0:
            print(f"    Second pass: clicked {result2} more 'See original' buttons")
            time.sleep(1)

        page.screenshot(path="/tmp/gm_final.png")

        # Extract reviews
        print("[6] Extracting...")
        reviews = page.evaluate(r'''() => {
            const results = [];
            const seen = new Set();
            const els = document.querySelectorAll('[data-review-id]');
            (els.length ? els : document.querySelectorAll('.jftiEf')).forEach(el => {
                try {
                    const nameEl = el.querySelector('.d4r55');
                    const author = nameEl ? nameEl.textContent.trim() : '';
                    if (!author || seen.has(author)) return;

                    // Get the review text — prefer original text if available
                    const textEl = el.querySelector('.wiI7pd');
                    const text = textEl ? textEl.textContent.trim() : '';

                    const ratingEl = el.querySelector('[role="img"][aria-label]');
                    let rating = 5;
                    if (ratingEl) {
                        const m = (ratingEl.getAttribute('aria-label') || '').match(/(\d)/);
                        if (m) rating = parseInt(m[1]);
                    }

                    const timeEl = el.querySelector('.rsqaWe');
                    const timeText = timeEl ? timeEl.textContent.trim() : '';

                    const imgEl = el.querySelector('button.WEBjve img') || el.querySelector('img.NBa7we');
                    let photo = imgEl ? imgEl.src : '';
                    photo = photo.replace(/=w\d+-h\d+/, '=w72-h72');

                    seen.add(author);
                    results.push({ author, text, rating, time: timeText, profilePhoto: photo });
                } catch(e) {}
            });
            return results;
        }''')

        print(f"    Raw: {len(reviews)} unique entries")

        # THOROUGH FILTER: Remove owner responses
        customer_reviews = []
        removed_owners = []
        for r in reviews:
            if is_owner_response(r['text'], r['author']):
                removed_owners.append(r)
            else:
                customer_reviews.append(r)

        print(f"    Owner responses removed: {len(removed_owners)}")
        print(f"    Customer reviews kept: {len(customer_reviews)}")

        if removed_owners:
            print("\n    Sample removed owner responses:")
            for r in removed_owners[:10]:
                print(f"      [{r['rating']}*] {r['author']}: \"{r['text'][:80]}\"")

        # Overall rating and Google's TOTAL review count.
        #
        # These two numbers are published on the site and in the JSON-LD
        # aggregateRating, so they must be what Google actually shows. The
        # previous version defaulted to a hardcoded 4.6 and swallowed every
        # error, which meant a Google markup change would silently keep
        # publishing a stale figure that looked plausible. It now fails loudly:
        # a wrong number in structured data is worse than a failed run.
        overall = None
        for sel in ['div.fontDisplayLarge', 'div[class*="fontDisplayLarge"]',
                    'span[aria-hidden="true"][class*="ceNzKf"]']:
            try:
                el = page.locator(sel).first
                if el.count() and el.is_visible():
                    m = re.search(r'\d+[.,]\d+', el.text_content() or '')
                    if m:
                        overall = float(m.group().replace(',', '.'))
                        break
            except Exception:
                continue

        # Google's total review count, e.g. "875 Rezensionen" / "875 reviews".
        # This is NOT the number we managed to scrape.
        google_total = None
        for sel in ['button[jsaction*="reviewChart"]', 'div[class*="fontBodySmall"]',
                    'span[aria-label*="Rezension"]', 'span[aria-label*="review"]']:
            try:
                for i in range(min(page.locator(sel).count(), 8)):
                    txt = page.locator(sel).nth(i).text_content() or ''
                    m = re.search(r'([\d.,\s]+)\s*(Rezension|review|Bewertung)', txt, re.I)
                    if m:
                        google_total = int(re.sub(r'[^\d]', '', m.group(1)))
                        break
                if google_total:
                    break
            except Exception:
                continue

        if overall is None or google_total is None:
            raise RuntimeError(
                f"Could not read Google's aggregate figures (rating={overall}, "
                f"total={google_total}). Google's markup has probably changed. "
                f"Refusing to write reviews.json, because publishing a stale "
                f"rating or review count in structured data breaches Google's "
                f"guidelines and can cost the star rich result."
            )

        print(f"[6] Google aggregate: {overall} stars, {google_total} total reviews")

        output = {
            "rating": overall,
            "totalReviews": google_total,          # what Google Maps shows
            "scrapedReviews": len(customer_reviews),  # what we hold locally
            "lastUpdated": date.today().isoformat(),
            "reviews": customer_reviews
        }

        with open("src/data/reviews.json", "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2)

        # Stats
        with_text = [r for r in customer_reviews if r['text']]
        lengths = [len(r['text']) for r in with_text]
        print(f"\n[7] SAVED: {len(customer_reviews)} reviews")
        if lengths:
            print(f"    With text: {len(with_text)}")
            print(f"    Avg: {sum(lengths)//len(lengths)} chars, Max: {max(lengths)} chars")

        # Language breakdown
        en = de = other_lang = 0
        for r in with_text:
            t = r['text'].lower()
            en_words = sum(1 for w in [' the ', ' was ', ' and ', ' very ', ' good ', ' food ', ' we ', ' our '] if w in t)
            de_words = sum(1 for w in [' das ', ' und ', ' war ', ' sehr ', ' essen ', ' wir ', ' ein '] if w in t)
            if en_words > de_words:
                en += 1
            elif de_words > 0:
                de += 1
            else:
                other_lang += 1
        print(f"\n    Language mix: ~{en} English, ~{de} German, ~{other_lang} other")

        browser.close()


if __name__ == "__main__":
    scrape()
