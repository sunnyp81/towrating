# towrating.org — repo brain

Astro 5 static pSEO site: US vehicle towing capacities. Quality-gated build (`src/lib/quality-gate.ts`, `isIndexable` needs >=4/5 spec fields) — 1,216 indexable pages out of ~13k trims, sitemap auto-derived from built pages. This is the portfolio's model pSEO gate (see `pseo-demotion-prevention-jun13.md`, scored 24/30 Safe).

Deploy: push to GitHub (`sunnyp81/towrating`, branch `master`), then `npx wrangler pages deploy dist --project-name towrating` (Cloudflare Pages). DNS on `towrating.org`.

## 2026-07-07 — recovery pass (early ramp, zero clicks, 27->270 impressions)
- Diagnosis: not a demotion. GSC shows a single hub page `/ford/f-250/` (238 impr) and its `2020` year page pulling nearly all impressions, all long-tail "f250 towing capacity" query variants sitting at avg position 45-90 (page 5-9+). Zero clicks is expected at that position; this is a brand-new site still climbing, not a ranking loss. No indexing/technical demotion signal in GSC.
- Fixed hard-rule violation: site-wide em/en dash sweep, 153 em dashes + 106 en dashes removed across 21 src files (layouts, guides MDX, prose.ts template, capacity-utils.ts, data/capacity-bracket-index.json) plus llms.txt. Titles: em dash -> colon (e.g. "Ford F-250 Towing Capacity by Year: All Generations"). Prose: em dash -> comma. Numeric ranges: en dash -> hyphen ("7,501-10,000 lbs"). Verified 0 dashes left in `dist/` after rebuild, 1216 pages still built (quality gate unaffected).
- Fixed technical bug: `scripts/indexnow-ping.mjs` and `scripts/build-default-og.mjs` referenced the wrong domain `towrating.net` (site is `towrating.org`) — IndexNow pings were fetching/submitting the wrong host and silently doing nothing useful. Corrected to `towrating.org`.
- Did not touch: quality gate, page count, titles/metas beyond the em-dash-to-colon swap (no CTR rewrite pass), no new pages, no postcode-level pages.
- Next: keep building authority/backlinks to `/ford/f-250/` and other early-impression pages; no content fix will move position 45-90 to page 1 by itself at this traffic volume, this is a time/links problem not a content-quality problem.
