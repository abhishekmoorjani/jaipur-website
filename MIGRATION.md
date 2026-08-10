# Migration: Squarespace → Cloudflare Pages

The domains stay registered at Squarespace. Only DNS and hosting move. There is
no domain transfer, no auth code, no DENIC procedure.

| | Before | After |
|---|---|---|
| Domain registration | Squarespace | **Squarespace, unchanged** (€18/yr) |
| DNS | Squarespace / NS1 | Cloudflare (free) |
| Website hosting | Squarespace | Cloudflare Pages (free) |
| Email | Key-Systems, `mail.jaipur-freiburg.de` | **unchanged** |
| Squarespace website plan | paid | cancelled |

## Order matters

Each step is safe to stop at. Nothing is irreversible until step 6.

### 1. Export from Squarespace while it is still paid and published

Squarespace cannot export from a cancelled or unpublished site, and images
cannot be bulk exported at all. Do this first.

- Settings → Import & Export → Export → download the `.xml`
- Also run a full crawl so the real image files and PDFs are captured:
  ```bash
  wget --mirror --page-requisites --adjust-extension --convert-links \
       --no-parent https://jaipur-freiburg.de/
  ```
- Keep both. The `.xml` references images by Squarespace CDN URL, and those
  links die when the site goes down, so the `.xml` alone is not an archive.

### 2. Create the Cloudflare account and Pages project

- Sign up at cloudflare.com, then Workers & Pages → Create → Pages →
  Connect to Git → authorise GitHub → pick `abhishekmoorjani/jaipur-website`
- Build settings:

  | Setting | Value |
  |---|---|
  | Framework preset | None |
  | Build command | `npm run build` |
  | Build output directory | `out` |
  | Production branch | `main` |

- Environment variables (Production **and** Preview):

  | Name | Value | Why |
  |---|---|---|
  | `SITE_BASE_PATH` | *(empty string)* | The site serves from the root here, not `/jaipur-website` |
  | `SITE_ORIGIN` | `https://<project>.pages.dev` at first, then `https://jaipur-freiburg.de` | Drives canonicals, hreflang, sitemap, OpenGraph |
  | `NODE_VERSION` | `22` | |

  Both default to the old GitHub Pages values if unset, so setting them is what
  makes the build correct for the new home.

### 3. Review the temporary URL

The project gets a `*.pages.dev` address. Check it on a phone and a laptop.
Nothing public has changed yet; Squarespace is still live.

### 4. Add the domains to Cloudflare and move nameservers

- Cloudflare → Add a site → `jaipur-freiburg.de`. Let it import the existing
  records, then **verify against `dns-zone-capture.txt`**. These two must be
  present or email breaks:

  ```
  MX   @      10   mail.jaipur-freiburg.de.
  A    mail        95.130.17.37
  ```

- Add SPF and DMARC, which the domain has never had:

  ```
  TXT  @        v=spf1 a:mail.jaipur-freiburg.de -all
  TXT  _dmarc   v=DMARC1; p=none; rua=mailto:abi_ind@hotmail.com
  ```

  `p=none` only monitors. Tighten to `quarantine` after a few weeks of reports.

- In Squarespace → Domains → jaipur-freiburg.de → DNS → Domain Nameservers,
  replace the NS1 nameservers with the two Cloudflare gives you.
- Repeat for `jaipur-freiburg.com`.
- Wait until `dig NS jaipur-freiburg.de` returns the Cloudflare nameservers.

### 5. Point the domain at the Pages project

- Pages project → Custom domains → add `jaipur-freiburg.de` and
  `www.jaipur-freiburg.de`
- Change `SITE_ORIGIN` to `https://jaipur-freiburg.de` and redeploy
- For the `.com`, which is a redirect-only alias, add a Redirect Rule rather
  than a custom domain:
  ```
  match   hostname eq "jaipur-freiburg.com" or "www.jaipur-freiburg.com"
  action  301 → https://jaipur-freiburg.de/${path}
  ```
  Do not point it at the Pages project directly, or the `.com` starts serving
  duplicate content and competes with the `.de`.

### 6. Only now, cancel the Squarespace website plan

Cancel the **website subscription**, not the domains. Confirm in Billing that
neither domain is bundled as a free extra of the plan; if one is, it may stop
renewing when the plan ends.

### 7. After the switch

- Google Search Console: add `jaipur-freiburg.de`, submit
  `https://jaipur-freiburg.de/sitemap.xml`
- Check the old Squarespace URLs 301 correctly (`public/_redirects` handles
  them, Cloudflare honours that file)
- Update the Google Business Profile website link
- Turn off the GitHub Pages deploy step in `.github/workflows/sync-reviews.yml`,
  since Cloudflare now builds on push

## Reference

- `dns-zone-capture.txt` — the authoritative zone as it was before any change,
  plus the `.com` disposition
- `public/_redirects` — the eight indexed Squarespace URLs mapped to this site
