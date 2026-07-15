# Domains & DNS — Reference

> Canonical inventory of every domain in the Cloudflare account and how each is wired.
> Last updated: **2026-07-15**. Keep this in sync when you add/move a domain.

## Account & platform facts

- **DNS provider / registrar-of-record for nameservers:** **Cloudflare** — account *"Zero@spacepiratezero.com's Account"* (`7ba23169fed5034266cbb0060832f79d`). Every active zone uses Cloudflare nameservers `kyle.ns.cloudflare.com` / `treasure.ns.cloudflare.com`. (GoDaddy is the *old* registrar; the migration to Cloudflare nameservers is done for all active zones.)
- **Web hosting:** production sites run on **Google Cloud Run**, project **`stylelift`**, region **`us-central1`**. Each hostname has a Cloud Run **domain mapping** with a **Google-managed TLS cert**.
- **DNS records are grey-cloud (DNS-only), pointing straight at Google** — this is the proven pattern; do **not** proxy (orange-cloud) these through Cloudflare, it interferes with Cloud Run cert issuance.
  - **Apex** → `A 216.239.32.21`, `A 216.239.34.21`, `A 216.239.36.21`, `A 216.239.38.21` + `AAAA 2001:4860:4802:32::15`, `:34::15`, `:36::15`, `:38::15`
  - **www / subdomains** → `CNAME ghs.googlehosted.com`
- **⚠️ The repo's `infra/sa9-sites/` GKE manifests are STALE.** They describe a `sa9-marketing` GKE cluster + nginx-ingress that **no longer exists**. Prod is Cloud Run. If a domain shows a park page, the fix is DNS records in the Cloudflare zone (not the registrar, not GKE).
- **Email:** most domains use **Google Workspace** (`MX smtp.google.com`) or **iCloud** mail; keep MX / SPF / DKIM / DMARC / `google-site-verification` / `apple-domain` TXT records intact.
- **New-domain checklist (serve a site):** ① verify domain in Google Search Console under `zero@stylelift.fashion` (add TXT), ② `gcloud beta run domain-mappings create --service <svc> --domain <domain> --region us-central1 --project stylelift` (+ one for `www`), ③ add the apex A/AAAA + `www` CNAME grey-cloud records in Cloudflare, ④ wait for Cloud Run cert (~15–60 min).

## Cloud Run services (project `stylelift`, us-central1)

`sa9-website`, `spz`, `tradecraft`, `darkwave-web`, `ghostdeck-web`, `countryplus`, `stylelift-marketing`, `stylelift-web`, `sa9-marketing-mcp`, `danielachambers`, `spz-podcast-lhceo`, `spz-podcast-defense`, `contact-card`.

## Domain inventory (16 zones)

### Live sites (Cloud Run + Google-managed TLS)

| Domain | Serves | Cloud Run service | DNS | Email |
|---|---|---|---|---|
| **spaceshipalpha9.co** | SA9 main marketing site + product subdomains | `sa9-website` (apex/www + `*` via middleware) | apex 4×A + 4×AAAA→Google; `www`→`ghs`; product subdomains `tradecraft`/`darkwave`/`ghostdeck`/`countryplus`/`mcp` → `ghs` (each its own Cloud Run mapping to its service) | Google MX + iCloud DKIM/SPF + DMARC + google-site + apple-domain |
| **spaceship-alpha-9.com** | **Same SA9 site — the "core" domain** | `sa9-website` (apex + `www`) | apex 4×A + 4×AAAA→Google; `www`→`ghs` | Google Workspace MX (pri 10) + `google._domainkey` DKIM + 2× google-site-verification |
| **spacepiratezero.com** | Space Pirate Zero personal site | `spz` (apex + `www`) | apex 4×A→Google; `www`→`ghs` | Google Workspace |
| **stylelift.fashion** | StyleLift marketing; `app.` = the web app | `stylelift-marketing` (apex/`www`), `stylelift-web` (`app.`) | apex 4×A→Google; `www`,`app`→`ghs` | Google Workspace |
| **stylelift.co** | StyleLift app (Google Cloud VM/cluster, not Cloud Run) | — (origin IP `35.219.200.1`, googleusercontent) | apex + `www` → `35.219.200.1` | Google Workspace |
| **lasthumanceo.com** | The Last Human CEO podcast site/feed | `spz-podcast-lhceo` | apex 4×A→Google | Google Workspace |
| **danielachambers.com** | Daniela Chambers site | `danielachambers` | apex 4×A + `www`→`ghs` | Google Workspace |

### Redirects (proxied placeholder `A @ 192.0.2.1` + a Cloudflare **Redirect Rule**, 301, path+query preserved)

| Domain | Redirects to | Status |
|---|---|---|
| **stylelyft.com** | → `stylelift.fashion` | **Active/live.** Keeps Google MX + google-site-verification. |
| **danielachambers.org** | → `danielachambers.com` | Rule deployed but zone is **PENDING** (registrar NS not yet delegated to Cloudflare) → inert until activated. |
| **danielachambers.xyz** | → `danielachambers.com` | Same as `.org` — **PENDING**. |

> Redirect rules live under **Rules → Redirect Rules** in each zone, created from the "Redirect to a different domain" template. They need a **proxied** DNS record at the apex (`192.0.2.1` placeholder) so traffic reaches Cloudflare's edge where the rule fires.

### Email / alias only (Google MX, no website)

| Domain | Notes |
|---|---|
| **digital-insurgency.com** | `MX smtp.google.com`, no web records. |
| **style-lift.com** | `MX smtp.google.com`, alias/defensive for StyleLift. |

### Verification-only / parked-clean / empty

| Domain | State |
|---|---|
| **signalfindssignal.com** | Album domain — only a `google-site-verification` TXT. No site/email yet. |
| **stylelift.shop** | Only a `google-site-verification` TXT. |
| **osmixapp.com** | Empty (NS/SOA only). |
| **chamberswedding.online** | GoDaddy park records removed 2026-07-15 → apex does not resolve (no site). `_dmarc` TXT kept for anti-spoofing. |

## 2026-07-15 cleanup notes

- **Fixed the parked-domain problem:** `spaceshipalpha9.co` apex was still serving GoDaddy's parked page because Cloudflare had leftover imported GoDaddy/AWS-Global-Accelerator "park" `A` records (families `15.197.x` / `3.33.x` / `76.223.x` / `13.248.x`, all reverse-resolving to `awsglobalaccelerator.com`). Replaced with the Cloud Run records above.
- **Account-wide purge of GoDaddy park records** across `chamberswedding.online`, `stylelyft.com`, `danielachambers.org`, `danielachambers.xyz`, plus removed stale `_domainconnect.*` GoDaddy Domain Connect CNAMEs. Email, DMARC, SPF/DKIM and verification TXTs were preserved everywhere.
- **`spaceship-alpha-9.com`** made to serve the SA9 site directly (its own Cloud Run mapping + Google TLS), verified in Google Search Console under `zero@stylelift.fashion`.

## Gotchas

- Park page reappears → check for stray `A` records in the **Cloudflare zone**, not the registrar (NS are already Cloudflare).
- Cloud Run cert stuck "pending" → DNS must resolve to the `216.239.x` IPs publicly and be **DNS-only**; the mapping retries every ~15 min.
- `zero@stylelift.fashion` may appear as `zero%stylelift.fashion@gtempaccount.com` in Google UIs — same identity, used for gcloud + Search Console + Cloud Run.
- Don't proxy (orange-cloud) the Cloud Run records — keep them DNS-only.
