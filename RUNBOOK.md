# Cutover runbook: putting the new site on jaipur-freiburg.de

Follow top to bottom. Every step before step 6 is invisible to the public and
safe to stop at. Step 6 is the moment visitors start seeing the new site.

## First, what is NOT happening

**Email does not migrate.** Your mailboxes stay on the Key-Systems server at
`mail.jaipur-freiburg.de` (`95.130.17.37`). Nobody moves a mailbox, a message
or a provider.

DNS is a phone book. The `MX` record is the line saying "mail for this domain
goes to that server". We are moving the phone book from Squarespace to
Cloudflare and copying that line across unchanged. Same server, same mailboxes.

The risk is not migration, it is **omission**. If that line does not get copied,
mail stops arriving. That is why step 3 exists and why it is worth checking
twice.

**The domain is not transferred either.** Registration stays at Squarespace,
€18/year. Only the nameservers change, which is a setting on the registration,
not a move of it.

---

## Step 1 — Export from Squarespace (do this FIRST)

Squarespace cannot export from a cancelled or unpublished site, and it cannot
bulk export images at all. So this has to happen while the plan is still paid.

1. Squarespace → Settings → Import & Export → Export → download the `.xml`
2. Save it somewhere you will still have in a year

Optional but worth it, captures the real image files the `.xml` only links to:

```bash
wget --mirror --page-requisites --adjust-extension --convert-links --no-parent https://jaipur-freiburg.de/
```

---

## Step 2 — Add the domain to Cloudflare

This is the step that hung twice for me. If it hangs for you too, it is a
Cloudflare-side problem, not a configuration mistake.

1. dash.cloudflare.com → **Add domain** (NOT "Transfer a domain", that would
   move the registration, which we do not want)
2. Choose **Connect a domain**
3. Enter `jaipur-freiburg.de`
4. Turn **Block training in robots.txt** OFF. The site ships its own robots.txt
   with the sitemap reference and the noindex rules; letting Cloudflare manage
   it as well risks overwriting that.
5. Leave **Import DNS records** on Automatic
6. Continue → pick the **Free** plan

Cloudflare will scan the existing DNS and show you what it found.

---

## Step 3 — Check the DNS records, especially email

This is the step that protects your mail. Compare what Cloudflare imported
against `dns-zone-capture.txt` in this repo, which is the authoritative zone
captured before any change.

**These two records MUST be present and exactly right:**

| Type | Name | Priority | Value | Proxy |
|---|---|---|---|---|
| `MX` | `@` | `10` | `mail.jaipur-freiburg.de` | n/a |
| `A` | `mail` | | `95.130.17.37` | **DNS only (grey cloud)** |

The `A mail` record must be **grey cloud, not orange**. Orange means Cloudflare
proxies the traffic, which breaks mail protocols. Click the cloud icon to
toggle it grey if it came in orange.

These can be ignored or deleted, they are Squarespace's and are being replaced:

| Type | Name | Value |
|---|---|---|
| `A` | `@` | `198.185.159.144`, `198.185.159.145`, `198.49.23.144`, `198.49.23.145` |
| `CNAME` | `www` | `ext-sq.squarespace.com` |
| `CNAME` | `_domainconnect` | `_domainconnect.domains.squarespace.com` |

**Do not continue until the two mail records are correct.**

---

## Step 4 — Add SPF and DMARC

The domain has never had either. Without SPF, anyone can send mail that appears
to come from `jaipur-freiburg.de`, and your own mail is more likely to be
filtered as spam.

Cloudflare → DNS → Add record, twice:

| Type | Name | Content |
|---|---|---|
| `TXT` | `@` | `v=spf1 a:mail.jaipur-freiburg.de -all` |
| `TXT` | `_dmarc` | `v=DMARC1; p=none; rua=mailto:abi_ind@hotmail.com` |

`p=none` only monitors and changes nothing about delivery. After a few weeks of
reports it can be tightened to `quarantine`.

---

## Step 5 — Tell me, and I will connect the Pages project

Once the zone exists I can do this part:

- add `jaipur-freiburg.de` and `www.jaipur-freiburg.de` as custom domains on the
  Pages project
- set `SITE_ORIGIN` to `https://jaipur-freiburg.de` and redeploy, so canonicals,
  hreflang, the sitemap and the OpenGraph URLs all point at the real domain
- add the `.com` redirect rule

Still nothing public has changed at this point.

---

## Step 6 — Change the nameservers at Squarespace (THE CUTOVER)

Cloudflare gives you two nameservers, something like `xxx.ns.cloudflare.com`.

1. Squarespace → Domains → `jaipur-freiburg.de` → DNS → **Domain Nameservers**
2. Replace the four `nsone.net` nameservers with the two Cloudflare gave you
3. Save

From here, as DNS propagates (minutes to a few hours), visitors start seeing the
new site. This is the only step the public notices.

Repeat for `jaipur-freiburg.com`.

---

## Step 7 — Verify before cancelling anything

```bash
dig NS jaipur-freiburg.de +short      # expect the Cloudflare nameservers
dig MX jaipur-freiburg.de +short      # expect 10 mail.jaipur-freiburg.de
dig A mail.jaipur-freiburg.de +short  # expect 95.130.17.37
```

Then **send yourself an email at the restaurant address and confirm it arrives.**
Do not skip this. It is the one check that proves the mail path survived.

---

## Step 8 — Cancel the Squarespace website plan

Only after step 7 passes.

Cancel the **website subscription**. Do NOT cancel the domains. While you are in
Billing, confirm neither domain is bundled as a free extra of the website plan;
if one is, it may stop renewing when the plan ends.

---

## If something goes wrong

The rollback is the same lever as the cutover: put the four `nsone.net`
nameservers back at Squarespace. Everything returns to how it is today, because
nothing else has been changed or deleted.
