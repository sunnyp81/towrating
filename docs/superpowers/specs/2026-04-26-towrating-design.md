# towrating.net — Design Spec

**Date:** 2026-04-26
**Domain:** towrating.net (already registered by owner)
**Repo:** github.com/sunnyp81/towrating
**Deploy:** Cloudflare Pages, project name `towrating`

---

## Mission

Programmatic guide to US vehicle towing capacity — searchable by year/make/model/trim, by capacity bracket, and by use-case ("what truck tows a 30ft travel trailer"). Targets pre-purchase researchers and existing owners verifying capacity before a tow. Must rank in Google AND get cited by ChatGPT / Google AI Overviews / Perplexity for spec lookups.

---

## Stack (locked)

- Astro 5 + Tailwind 4
- TypeScript strict
- MDX for guide content
- Astro content collections + sitemap integration
- `@vercel/og` for per-vehicle OG images
- Cloudflare Pages, GitHub auto-deploy via Wrangler
- Node 20 LTS (build only)

---

## Information Architecture

| Path | Purpose | Approx page count |
|---|---|---|
| `/` | Home — capacity search, popular vehicles | 1 |
| `/tow-by-capacity/` | Capacity hub | 1 |
| `/tow-by-capacity/[lbs]/` | Bracket hub (3500, 5000, 7500, 10000, 12000, 15000, 20000, 30000) | 8 |
| `/tow-by-vehicle-type/` | Type hub | 1 |
| `/tow-by-vehicle-type/[type]/` | truck / suv / minivan / sedan / crossover | 5 |
| `/[make]/` | 50 make hubs | 50 |
| `/[make]/[model]/` | ~2,000 model hubs | ~2,000 |
| `/[make]/[model]/[year]/` | Year detail pages, last 25 years | ~50,000 (theoretical) |
| `/[make]/[model]/[year]/[trim]/` | Only when capacity differs by trim | ~30,000 (theoretical) |
| `/tow/[trailer]-with-[class]/` | Use-case crossroads | 60 |
| `/guide/[topic]/` | Evergreen guides | 30 (5 in Phase 1, 25 stubbed) |

**Crawl depth invariant:** every page reachable from home in ≤4 clicks. Verified pre-deploy by `scripts/crawl-graph-check.mjs`.

**Phase 1 published page count target:** 1,200–2,500 indexable + 2,500–4,000 `noindex,follow` staged. Final number depends on Wikipedia hit rate during scrape.

---

## Data Pipeline

Four scripts in `scripts/`, run sequentially, output to `data/`:

1. **`fetch-vpic.mjs`** — pulls every year/make/model/trim 2000–2026 from NHTSA VPIC API. Output: `data/vpic-raw.json`.
2. **`fetch-fueleconomy.mjs`** — pulls fueleconomy.gov bulk CSV for curb weight + drivetrain cross-ref. Output: `data/fueleconomy.json`.
3. **`scrape-wikipedia-tow.mjs`** — for each model in VPIC, fetches the Wikipedia article, extracts `Towing capacity` / `Payload` / `GVWR` / `GCWR` from the infobox, records the source URL for citation. Output: `data/wiki-tow.json`. Polite scrape: 1 req/sec, User-Agent identifies as towrating.net research bot, respects robots.txt.
4. **`merge-towing-dataset.mjs`** — merges all sources into the four indexes specified by the brief, plus a quality-flags index that drives the indexable/noindex decision per page:
   - `data/vehicles.json`
   - `data/trim-capacity.json`
   - `data/capacity-bracket-index.json`
   - `data/make-model-year-tree.json`
   - `data/quality-flags.json`

The 20 hero models (see Hero Models below) are hand-curated in `data/hero-models.json` with full 5-spec data sourced from manufacturer brochures. Merge step prioritises hero data over Wikipedia data on conflict.

### Hero Models (Phase 1)

Full 5-spec hand-curation, all trims 2015–2026:

1. Ford F-150
2. Chevrolet Silverado 1500
3. Ram 1500
4. Toyota Tacoma
5. Toyota Tundra
6. Ford F-250 Super Duty
7. Ford F-350 Super Duty
8. Chevrolet Silverado 2500HD
9. GMC Sierra 1500
10. Ram 2500
11. Ram 3500
12. Toyota 4Runner
13. Jeep Wrangler
14. Jeep Grand Cherokee
15. Ford Expedition
16. Chevrolet Tahoe
17. Chevrolet Suburban
18. GMC Yukon
19. Nissan Frontier
20. Honda Ridgeline

---

## Quality Gate

Drives the `indexable` boolean for every generated page.

**Required specs (max 5):** max tow, payload, GCWR, tongue weight, hitch class.

| Coverage | Indexable | Page treatment |
|---|---|---|
| 5/5 + hand-curated (hero) | yes | Full template: comparison table, what-can-it-tow examples, 10-Q FAQ |
| ≥4/5 from Wikipedia | yes | Standard template: comparison table, 6-Q FAQ, source citation |
| <4/5 | no (`noindex,follow`) | Stub page with VPIC catalog data only, prompt to refresh on next data run |

Every spoke that fails the gate still renders (so internal linking and graph signal remain), but is `noindex,follow` until enriched. Wave-publishing is the same pattern that worked on SalaryData.co.uk.

---

## Page Templates

Eight Astro layouts in `src/layouts/`, each consumes a typed prop interface:

| Layout | Used by | Word floor |
|---|---|---|
| `TrimPage.astro` | trim spokes | 600 |
| `YearPage.astro` | year spokes | 600 |
| `ModelHub.astro` | model hubs | 1,000 |
| `MakeHub.astro` | make hubs | 800 |
| `CapacityBracket.astro` | bracket hubs | 800 |
| `VehicleTypeHub.astro` | type hubs | 800 |
| `UseCaseCrossroad.astro` | use-case pages | 1,200 |
| `GuideArticle.astro` | guides | 1,500 |

### Trim/Year page anatomy (per brief)

- Title: `{Year} {Make} {Model} {Trim} Towing Capacity: {Lbs} lbs (Verified Specs)`
- H1 = title
- Quick Answer box: max tow / payload / GCWR / tongue weight / hitch class
- Answer-first 80-word opener (LLM-extract-friendly prose)
- Comparison table (this trim vs other trims same year, highlight tow differences) — `ItemList` schema
- "What can it tow?" — concrete examples (travel trailers up to X ft, boats up to Y lbs, ATVs/UTVs)
- "Required equipment" — hitch class + brake controller spec, contextual Amazon affiliate
- "Common towing mistakes" — 5 bullets specific to vehicle class
- 10-Q FAQ (hero) / 6-Q FAQ (Wikipedia-derived) including "can a {year model} tow a {specific trailer}?"
- "Compare with" — 3 alt vehicles same capacity bracket
- Specs rendered as **prose paragraph + table** (LLMs extract from prose, not tables)

---

## Internal Linking

Enforced by template, not manually authored.

Every spoke renders ≥8 internal links:
- 2 sibling trims (same year + model)
- prev/next year (same model)
- 3 same-class siblings (same make)
- 1 capacity-bracket hub
- 1 contextual `/guide/`
- 1 hitch-affiliate-guide
- 1 brake-controller-affiliate-guide

**Hubs:**
- Model hub → all 25 years + 5 alt makes same class
- Make hub → all models grouped by class + popular years
- Capacity bracket → all vehicles in bracket grouped by class
- Use-case page → top 20 vehicles satisfying use-case, each links back

**Footer (constant, all pages):** capacity nav + top 10 towing vehicles + guide nav.

`scripts/crawl-graph-check.mjs` runs pre-deploy and fails the build if any indexable page is >4 clicks from home.

---

## Schema.org Markup

| Page type | Schema |
|---|---|
| Trim / Year | `Vehicle` + `Product` (with `offers` linked to dealer affiliate) |
| Comparison tables | `ItemList` |
| Guides | `Article` + `HowTo` + `FAQPage` |
| Capacity / Type / Make hubs | `CollectionPage` + `ItemList` |
| All pages | `BreadcrumbList` |

Validated against Google's Rich Results Test on top 5 templates before deploy.

---

## LLM Citation Optimization

- `robots.txt` allows: GPTBot, PerplexityBot, ClaudeBot, CCBot, Google-Extended, Applebot-Extended
- `/llms.txt` with full content map (per llmstxt.org spec)
- `/ai.txt` with content licence + crawl preferences
- Every spec rendered as prose paragraph + table (LLMs prefer prose extraction)
- Every page self-contained — no "see other page" cross-refs in primary content

---

## Monetization (Phase 1: wired with env-var placeholders)

| Slot | Network | Env var | Page placement |
|---|---|---|---|
| Vehicle nearby | CarGurus / TrueCar / Cars.com | `PUBLIC_CARGURUS_AFF_ID` | Top inline, every vehicle page |
| Insurance quote | MoneyGeek / The Zebra / Jerry | `PUBLIC_INSURANCE_AFF_ID` | Right rail, vehicle pages |
| Hitch + brake controller | Amazon Associates | `PUBLIC_AMAZON_TAG` | Contextual box, weight-class matched |
| Extended warranty | CarShield | `PUBLIC_CARSHIELD_AFF_ID` | Right rail, secondary |
| Trailer + accessories | eTrailer | `PUBLIC_ETRAILER_AFF_ID` | Guide pages |
| Email capture | (own list) | n/a | "Free Tow Calculator + Pre-Tow Checklist PDF" CTA, vehicle pages |

All affiliate links: `rel="sponsored"`. FTC disclosure footer-pinned. `/affiliate-disclosure/` page.

If env vars are unset on deploy, slots render without affiliate codes (links go to bare partner domain).

---

## OG Images

- Route: `/og/[...slug].png`
- Generated by `@vercel/og` at the edge, cached.
- Composition: vehicle silhouette (SVG sprite by class — truck/suv/minivan/sedan/crossover) + capacity number on dark gradient + `towrating.net` wordmark.

---

## Sitemap & Indexing

- `sitemap-index.xml` at root
- Per-make sitemaps, max 5K URLs each
- Only indexable pages included
- IndexNow key in `public/{key}.txt`
- `scripts/indexnow-ping.mjs` posts changed URLs after each deploy

---

## Pre-Completion Gate

Per the user's `pre-completion-validation` rule, before claiming Phase 1 done:

1. **`/semantic-audit` loop** — score ≥85 on:
   - 3 sampled trim pages (one hero, one Wikipedia-derived, one stub)
   - 1 capacity-bracket hub
   - 1 cornerstone guide
2. **Lighthouse** ≥95 on Performance / Accessibility / Best Practices / SEO across 5 templates
3. **Rich Results Test** — Vehicle, Product, Article, ItemList, BreadcrumbList all valid
4. **Playwright MCP** — open deployed CF Pages URL, check console errors, screenshot home + 1 trim page + 1 hub
5. **Crawl-graph check** — all indexable pages ≤4 clicks from home
6. **GSC + Bing Webmaster** — properties added on `gsc-sunnypat81`, sitemap submitted

---

## Phase 1 Deliverables (this engagement)

- Repo `sunnyp81/towrating` with first commit
- Astro scaffold + Tailwind 4 + TS strict + MDX + sitemap integration
- 4 data scripts + merged dataset + quality flags
- 20 hero models hand-curated (2015–2026, all trims)
- 8 page layouts implemented
- All routes generating
- Schema across all template types, validated
- OG image route
- robots.txt + llms.txt + ai.txt + IndexNow key
- 5 cornerstone guides authored: GCWR explained, tongue weight 10% rule, J2807 standard, brake controllers, weight-distribution hitches
- Monetization wired (env-var placeholders)
- FTC disclosure + `/affiliate-disclosure/` page
- Deployed to CF Pages (`towrating` project), preview URL live
- GSC + Bing properties added on `gsc-sunnypat81`
- Sitemap submitted, IndexNow ping run

## Phase 1 Non-Goals (deferred)

- DNS cutover from registrar to CF Pages (preview URL only this phase — owner does cutover after spot-check)
- 25 of 30 guides
- Real affiliate ID env values (placeholders only)
- Hand-curation for models 21+
- Trim pages where capacity does not differ from year-level (keep collapsed)

---

## Acceptance Criteria

- ≥1,200 indexable pages live, ≥2,500 staged-noindex
- No empty pages — every page has either real spec data or VPIC catalog stub with clear "data pending" UX on noindex stubs
- `Vehicle` + `Product` schema validates on Rich Results Test
- ≥8 internal links per spoke (template-enforced)
- Lighthouse ≥95 on 5 templates
- All pre-completion gate items pass
- `/semantic-audit` ≥85 on the 5 sampled pages

**Post-launch verification (14 days, owner-triggered):**
- ChatGPT search "2022 Ford F-150 EcoBoost 3.5 max tow capacity" returns a towrating.net URL
- GSC shows non-zero impressions on hero-model trim pages
