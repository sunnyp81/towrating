# towrating.net Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Phase 1 of towrating.net — programmatic SEO site for US vehicle towing capacities, deployed to Cloudflare Pages with 1,200+ indexable pages, monetization wired, schema validated, GSC/Bing connected.

**Architecture:** Astro 5 static-site generator pulling from a merged dataset (NHTSA VPIC catalog + Wikipedia-scraped tow specs + 20 hand-curated hero models). Quality gate at merge time decides indexable vs `noindex,follow`. Templates produce vehicle pages (year/trim/model/make), capacity hubs, vehicle-type hubs, use-case crossroads, and 5 cornerstone guides. Schema, OG images, monetization slots, and internal-link generator are template-enforced.

**Tech Stack:** Astro 5, Tailwind 4, TypeScript strict, MDX, `@vercel/og`, Cloudflare Pages, Wrangler, Wikipedia REST API, NHTSA VPIC API, fueleconomy.gov bulk CSV.

**Spec:** `docs/superpowers/specs/2026-04-26-towrating-design.md`

**Project root:** `C:\Users\sunny\Desktop\towrating\`

---

## File Structure

```
C:\Users\sunny\Desktop\towrating\
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── package.json
├── wrangler.toml
├── .gitignore
├── public/
│   ├── robots.txt
│   ├── llms.txt
│   ├── ai.txt
│   └── {indexnow-key}.txt
├── data/                              # generated, gitignored
│   ├── vpic-raw.json
│   ├── fueleconomy.json
│   ├── wiki-tow.json
│   ├── vehicles.json
│   ├── trim-capacity.json
│   ├── capacity-bracket-index.json
│   ├── make-model-year-tree.json
│   └── quality-flags.json
├── src/
│   ├── data/
│   │   └── hero-models.json           # checked in, hand-curated
│   ├── lib/
│   │   ├── types.ts                   # core TS interfaces
│   │   ├── data-loader.ts             # loads merged JSON at build time
│   │   ├── schema.ts                  # JSON-LD generators
│   │   ├── internal-links.ts          # 8-link generator per spoke
│   │   ├── affiliate.ts               # env-var driven affiliate URLs
│   │   ├── capacity-utils.ts          # bracket assignment, formatting
│   │   └── prose.ts                   # generates spec prose paragraphs
│   ├── layouts/
│   │   ├── Base.astro
│   │   ├── TrimPage.astro
│   │   ├── YearPage.astro
│   │   ├── ModelHub.astro
│   │   ├── MakeHub.astro
│   │   ├── CapacityBracket.astro
│   │   ├── VehicleTypeHub.astro
│   │   ├── UseCaseCrossroad.astro
│   │   └── GuideArticle.astro
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── QuickAnswerBox.astro
│   │   ├── TrimComparisonTable.astro
│   │   ├── CompareWith.astro
│   │   ├── AffiliateBox.astro
│   │   ├── BreadcrumbList.astro
│   │   └── FAQSection.astro
│   ├── content/
│   │   └── guides/
│   │       ├── gcwr-explained.mdx
│   │       ├── tongue-weight-10-percent-rule.mdx
│   │       ├── j2807-towing-standard.mdx
│   │       ├── brake-controllers-explained.mdx
│   │       └── weight-distribution-hitches.mdx
│   ├── content.config.ts              # collection schemas
│   └── pages/
│       ├── index.astro
│       ├── tow-by-capacity/
│       │   ├── index.astro
│       │   └── [lbs].astro
│       ├── tow-by-vehicle-type/
│       │   ├── index.astro
│       │   └── [type].astro
│       ├── tow/
│       │   └── [crossroad].astro
│       ├── guide/
│       │   └── [...slug].astro
│       ├── og/
│       │   └── [...slug].png.ts
│       ├── affiliate-disclosure.astro
│       └── [make]/
│           ├── index.astro
│           └── [model]/
│               ├── index.astro
│               └── [year]/
│                   ├── index.astro
│                   └── [trim].astro
├── scripts/
│   ├── fetch-vpic.mjs
│   ├── fetch-fueleconomy.mjs
│   ├── scrape-wikipedia-tow.mjs
│   ├── merge-towing-dataset.mjs
│   ├── crawl-graph-check.mjs
│   └── indexnow-ping.mjs
├── tests/
│   ├── merge.test.mjs
│   ├── wikipedia-parser.test.mjs
│   ├── internal-links.test.mjs
│   ├── capacity-utils.test.mjs
│   └── quality-gate.test.mjs
└── docs/
    └── superpowers/
        ├── specs/
        └── plans/
```

**Test runner:** Node's built-in `node:test` + `node:assert` (no extra deps, runs `.test.mjs` directly).

---

## Task 1: Astro scaffold + base config

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `tailwind.config.mjs`, `.gitignore`

- [ ] **Step 1: Init Astro project (in-place, project dir already exists with docs/)**

```bash
cd /c/Users/sunny/Desktop/towrating
npm init -y
npm install astro@latest @astrojs/mdx @astrojs/sitemap @astrojs/check typescript
npm install -D @tailwindcss/vite tailwindcss@next @vercel/og tsx
```

- [ ] **Step 2: Write astro.config.mjs**

```javascript
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://towrating.net',
  output: 'static',
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/og/'),
      entryLimit: 5000,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    format: 'directory',
  },
});
```

- [ ] **Step 3: Write tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "~/*": ["src/*"]
    }
  },
  "include": ["src/**/*", "scripts/**/*", "tests/**/*"],
  "exclude": ["dist", "node_modules", "data"]
}
```

- [ ] **Step 4: Write .gitignore**

```
node_modules/
dist/
.astro/
.env
.env.local
data/*.json
!src/data/hero-models.json
.DS_Store
```

- [ ] **Step 5: Update package.json scripts**

Edit the `"scripts"` block:

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "data:fetch": "tsx scripts/fetch-vpic.mjs && tsx scripts/fetch-fueleconomy.mjs && tsx scripts/scrape-wikipedia-tow.mjs",
  "data:merge": "tsx scripts/merge-towing-dataset.mjs",
  "data:all": "npm run data:fetch && npm run data:merge",
  "test": "node --import tsx/esm --test tests/",
  "crawl-check": "node scripts/crawl-graph-check.mjs",
  "indexnow": "node scripts/indexnow-ping.mjs"
}
```

Also add `"type": "module"` at the top level if not already set by astro init.

- [ ] **Step 6: Write src/styles/global.css**

```css
@import "tailwindcss";

@theme {
  --color-brand-900: #0a1628;
  --color-brand-800: #14233f;
  --color-brand-700: #1f3457;
  --color-accent-500: #f59e0b;
  --color-accent-600: #d97706;
  --font-display: "Inter", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
}

html { scroll-behavior: smooth; }
body { @apply bg-white text-slate-900 font-body antialiased; }
```

- [ ] **Step 7: Verify build runs (empty)**

```bash
cd /c/Users/sunny/Desktop/towrating
npm run build
```

Expected: build succeeds with 0 pages or just a default template page (Astro's init may have created `src/pages/index.astro` — leave it for now, we replace later).

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: astro 5 scaffold, tailwind 4, mdx, sitemap, ts strict"
```

---

## Task 2: Core TypeScript types

**Files:**
- Create: `src/lib/types.ts`

- [ ] **Step 1: Write src/lib/types.ts**

```typescript
export type VehicleClass = 'truck' | 'suv' | 'minivan' | 'sedan' | 'crossover';
export type HitchClass = 'I' | 'II' | 'III' | 'IV' | 'V';
export type TrailerType = 'travel-trailer' | 'fifth-wheel' | 'boat' | 'horse-trailer' | 'utility-trailer' | 'car-trailer';
export type DataSource = 'hero-curated' | 'wikipedia' | 'fueleconomy' | 'vpic-only';

export interface TowingSpecs {
  maxTowLbs: number | null;
  payloadLbs: number | null;
  gcwrLbs: number | null;
  tongueWeightLbs: number | null;
  hitchClass: HitchClass | null;
}

export interface Trim {
  trimSlug: string;
  trimLabel: string;
  drivetrain?: string;
  engine?: string;
  curbWeightLbs?: number;
  specs: TowingSpecs;
  source: DataSource;
  sourceUrl?: string;
  indexable: boolean;
  specCoverage: number; // 0..5
}

export interface Year {
  year: number;
  trims: Trim[];
  bestTowLbs: number | null;
  indexable: boolean;
}

export interface Model {
  modelSlug: string;
  modelLabel: string;
  makeSlug: string;
  makeLabel: string;
  vehicleClass: VehicleClass;
  years: Year[];
  bestTowLbsAllTime: number | null;
  indexable: boolean;
  wikipediaUrl?: string;
}

export interface Make {
  makeSlug: string;
  makeLabel: string;
  models: Model[];
}

export interface CapacityBracket {
  lbs: number;
  label: string;
  rangeMinLbs: number;
  rangeMaxLbs: number;
  vehicles: Array<{ makeSlug: string; modelSlug: string; year: number; trimSlug?: string; maxTowLbs: number; vehicleClass: VehicleClass }>;
}

export interface UseCaseCrossroad {
  slug: string;
  trailer: TrailerType;
  vehicleClass: VehicleClass;
  trailerLabel: string;
  classLabel: string;
  vehicles: Array<{ makeSlug: string; modelSlug: string; year: number; maxTowLbs: number }>;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/types.ts && git commit -m "feat: core data types (Vehicle, Trim, Bracket, UseCase)"
```

---

## Task 3: Capacity utils with TDD

**Files:**
- Create: `src/lib/capacity-utils.ts`, `tests/capacity-utils.test.mjs`

- [ ] **Step 1: Write failing tests `tests/capacity-utils.test.mjs`**

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assignBracket, formatLbs, BRACKETS } from '../src/lib/capacity-utils.ts';

test('BRACKETS contains all 8 specified brackets', () => {
  assert.deepEqual(BRACKETS.map(b => b.lbs), [3500, 5000, 7500, 10000, 12000, 15000, 20000, 30000]);
});

test('assignBracket: 3000 lbs -> 3500 bracket', () => {
  assert.equal(assignBracket(3000)?.lbs, 3500);
});

test('assignBracket: exactly 5000 -> 5000 bracket', () => {
  assert.equal(assignBracket(5000)?.lbs, 5000);
});

test('assignBracket: 6800 -> 7500 bracket', () => {
  assert.equal(assignBracket(6800)?.lbs, 7500);
});

test('assignBracket: 35000 lbs -> 30000 (highest) bracket', () => {
  assert.equal(assignBracket(35000)?.lbs, 30000);
});

test('assignBracket: 0 returns null', () => {
  assert.equal(assignBracket(0), null);
});

test('formatLbs: 12000 -> "12,000 lbs"', () => {
  assert.equal(formatLbs(12000), '12,000 lbs');
});

test('formatLbs: null -> "N/A"', () => {
  assert.equal(formatLbs(null), 'N/A');
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test
```

Expected: cannot find module `capacity-utils`.

- [ ] **Step 3: Implement `src/lib/capacity-utils.ts`**

```typescript
import type { CapacityBracket } from './types.ts';

export const BRACKETS: Array<Pick<CapacityBracket, 'lbs' | 'label' | 'rangeMinLbs' | 'rangeMaxLbs'>> = [
  { lbs: 3500, label: 'Up to 3,500 lbs', rangeMinLbs: 1, rangeMaxLbs: 3500 },
  { lbs: 5000, label: '3,501–5,000 lbs', rangeMinLbs: 3501, rangeMaxLbs: 5000 },
  { lbs: 7500, label: '5,001–7,500 lbs', rangeMinLbs: 5001, rangeMaxLbs: 7500 },
  { lbs: 10000, label: '7,501–10,000 lbs', rangeMinLbs: 7501, rangeMaxLbs: 10000 },
  { lbs: 12000, label: '10,001–12,000 lbs', rangeMinLbs: 10001, rangeMaxLbs: 12000 },
  { lbs: 15000, label: '12,001–15,000 lbs', rangeMinLbs: 12001, rangeMaxLbs: 15000 },
  { lbs: 20000, label: '15,001–20,000 lbs', rangeMinLbs: 15001, rangeMaxLbs: 20000 },
  { lbs: 30000, label: '20,001+ lbs', rangeMinLbs: 20001, rangeMaxLbs: 100000 },
];

export function assignBracket(lbs: number): typeof BRACKETS[number] | null {
  if (!lbs || lbs < 1) return null;
  for (const b of BRACKETS) {
    if (lbs <= b.rangeMaxLbs) return b;
  }
  return BRACKETS[BRACKETS.length - 1];
}

export function formatLbs(lbs: number | null | undefined): string {
  if (lbs == null || lbs === 0) return 'N/A';
  return `${lbs.toLocaleString('en-US')} lbs`;
}

export function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test
```

Expected: 8 passing.

- [ ] **Step 5: Commit**

```bash
git add src/lib/capacity-utils.ts tests/capacity-utils.test.mjs && git commit -m "feat: capacity bracket assignment + formatting (TDD)"
```

---

## Task 4: Hero models curation (data file)

**Files:**
- Create: `src/data/hero-models.json`

This is the highest-leverage data file in the project. It must contain real, verified specs.

- [ ] **Step 1: Write the curation file**

The file structure: an array of model objects, each with `years` array, each year with `trims` array, each trim with full 5-spec.

Use this as the schema (write the file containing all 20 hero models, 2015–2026, with the trims I've curated below). Source: Ford / GM / Stellantis / Toyota / Honda / Nissan official brochures and tow guides.

Because the full 20-model dataset is ~2,500 lines of JSON, write it iteratively in chunks. Start by writing the schema header + the first model (Ford F-150) as a complete, valid example, then add models 2–20 in subsequent edits.

Initial file content to write — Ford F-150 example showing the exact required shape:

```json
{
  "schemaVersion": 1,
  "lastUpdated": "2026-04-26",
  "models": [
    {
      "make": "Ford",
      "model": "F-150",
      "vehicleClass": "truck",
      "wikipediaUrl": "https://en.wikipedia.org/wiki/Ford_F-Series_(fourteenth_generation)",
      "years": [
        {
          "year": 2024,
          "trims": [
            {
              "trim": "XL 2.7L EcoBoost V6 4x2",
              "drivetrain": "RWD",
              "engine": "2.7L EcoBoost V6",
              "curbWeightLbs": 4470,
              "specs": { "maxTowLbs": 10100, "payloadLbs": 1985, "gcwrLbs": 14500, "tongueWeightLbs": 1010, "hitchClass": "IV" }
            },
            {
              "trim": "XLT 3.5L EcoBoost V6 4x4 Max Tow",
              "drivetrain": "4WD",
              "engine": "3.5L EcoBoost V6",
              "curbWeightLbs": 5050,
              "specs": { "maxTowLbs": 13500, "payloadLbs": 2455, "gcwrLbs": 18800, "tongueWeightLbs": 1350, "hitchClass": "IV" }
            },
            {
              "trim": "Lariat 5.0L V8 4x4",
              "drivetrain": "4WD",
              "engine": "5.0L Coyote V8",
              "curbWeightLbs": 5160,
              "specs": { "maxTowLbs": 11300, "payloadLbs": 1840, "gcwrLbs": 16500, "tongueWeightLbs": 1130, "hitchClass": "IV" }
            }
          ]
        }
      ]
    }
  ]
}
```

- [ ] **Step 2: Extend with the remaining 19 hero models**

For each of the 19 remaining models, append a model object to the `models` array with **all years 2015–2026** and **at least 3 trims per year** representing the meaningful capacity tiers (entry / mid / max-tow). Specs must come from official manufacturer brochures. If a year is missing data for a model (e.g. discontinued), record `"years": []` and document the gap in a comment line preceding the model object.

The 19 remaining models, in order:
1. Chevrolet Silverado 1500
2. Ram 1500
3. Toyota Tacoma
4. Toyota Tundra
5. Ford F-250 Super Duty
6. Ford F-350 Super Duty
7. Chevrolet Silverado 2500HD
8. GMC Sierra 1500
9. Ram 2500
10. Ram 3500
11. Toyota 4Runner
12. Jeep Wrangler
13. Jeep Grand Cherokee
14. Ford Expedition
15. Chevrolet Tahoe
16. Chevrolet Suburban
17. GMC Yukon
18. Nissan Frontier
19. Honda Ridgeline

Each trim entry must contain non-null `maxTowLbs`, `payloadLbs`, `gcwrLbs`, `tongueWeightLbs`, `hitchClass`. If any of these is genuinely unknowable from public sources, the trim must be omitted (don't ship a hero trim with partial data).

- [ ] **Step 3: Validate JSON parses + every trim has 5 specs**

```bash
node -e "
const d = require('./src/data/hero-models.json');
let total = 0, missing = 0;
for (const m of d.models) {
  for (const y of m.years) {
    for (const t of y.trims) {
      total++;
      const s = t.specs;
      if (s.maxTowLbs == null || s.payloadLbs == null || s.gcwrLbs == null || s.tongueWeightLbs == null || s.hitchClass == null) missing++;
    }
  }
}
console.log('total trims:', total, 'missing-spec trims:', missing);
if (missing > 0) process.exit(1);
"
```

Expected: `total trims: 700+, missing-spec trims: 0`. Exit code 0.

- [ ] **Step 4: Commit**

```bash
git add src/data/hero-models.json && git commit -m "feat: hero models dataset — 20 models × 2015–2026, full 5-spec"
```

---

## Task 5: VPIC fetch script

**Files:**
- Create: `scripts/fetch-vpic.mjs`

- [ ] **Step 1: Write the script**

```javascript
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const DATA_DIR = resolve('data');
mkdirSync(DATA_DIR, { recursive: true });

const VPIC = 'https://vpic.nhtsa.dot.gov/api/vehicles';
const YEARS = Array.from({ length: 27 }, (_, i) => 2000 + i); // 2000-2026

async function fetchJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

async function getMakes(year) {
  const url = `${VPIC}/GetMakesForVehicleType/car?format=json`;
  const truck = await fetchJson(`${VPIC}/GetMakesForVehicleType/truck?format=json`);
  const suv = await fetchJson(`${VPIC}/GetMakesForVehicleType/multipurpose passenger vehicle (mpv)?format=json`);
  const car = await fetchJson(url);
  const all = [...truck.Results, ...suv.Results, ...car.Results];
  const seen = new Set();
  return all.filter(m => { if (seen.has(m.MakeId)) return false; seen.add(m.MakeId); return true; });
}

async function getModels(makeId, year) {
  const url = `${VPIC}/GetModelsForMakeIdYear/makeId/${makeId}/modelyear/${year}?format=json`;
  try { return (await fetchJson(url)).Results; } catch { return []; }
}

async function main() {
  console.log('VPIC fetch starting...');
  const makes = await getMakes();
  console.log('Makes:', makes.length);

  const TARGET_MAKES = new Set([
    'FORD', 'CHEVROLET', 'GMC', 'RAM', 'TOYOTA', 'HONDA', 'NISSAN', 'JEEP',
    'DODGE', 'HYUNDAI', 'KIA', 'SUBARU', 'MAZDA', 'VOLKSWAGEN', 'BMW',
    'MERCEDES-BENZ', 'AUDI', 'LEXUS', 'ACURA', 'INFINITI', 'CADILLAC',
    'BUICK', 'LINCOLN', 'CHRYSLER', 'MITSUBISHI', 'VOLVO', 'LAND ROVER',
    'JAGUAR', 'PORSCHE', 'TESLA', 'RIVIAN', 'LUCID', 'GENESIS',
  ]);

  const filtered = makes.filter(m => TARGET_MAKES.has(m.MakeName.toUpperCase()));
  console.log('Filtered makes:', filtered.length);

  const out = [];
  for (const make of filtered) {
    for (const year of YEARS) {
      const models = await getModels(make.MakeId, year);
      for (const md of models) {
        out.push({ year, makeId: make.MakeId, makeName: make.MakeName, modelId: md.Model_ID, modelName: md.Model_Name });
      }
      await new Promise(r => setTimeout(r, 50)); // polite
    }
    console.log(`  ${make.MakeName} done`);
  }

  writeFileSync(resolve(DATA_DIR, 'vpic-raw.json'), JSON.stringify(out, null, 2));
  console.log('Wrote', out.length, 'rows to data/vpic-raw.json');
}

main().catch(e => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Run it**

```bash
npm run data:fetch -- --vpic-only 2>/dev/null || node scripts/fetch-vpic.mjs
```

Expected: writes `data/vpic-raw.json` with 30,000+ rows. Takes 5–15 minutes (rate-limited).

- [ ] **Step 3: Spot-check**

```bash
node -e "const d=require('./data/vpic-raw.json'); console.log('rows:',d.length); console.log('sample:',d.slice(0,3));"
```

Expected: rows >= 20000, sample shows year/makeId/modelName entries.

- [ ] **Step 4: Commit script**

```bash
git add scripts/fetch-vpic.mjs && git commit -m "feat: NHTSA VPIC catalog fetcher"
```

(`data/` is gitignored — JSON output is not committed.)

---

## Task 6: fueleconomy.gov fetch script

**Files:**
- Create: `scripts/fetch-fueleconomy.mjs`

- [ ] **Step 1: Write script**

```javascript
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const URL = 'https://www.fueleconomy.gov/feg/epadata/vehicles.csv';
const DATA_DIR = resolve('data');
mkdirSync(DATA_DIR, { recursive: true });

function parseCsv(text) {
  const lines = text.split(/\r?\n/);
  const header = lines[0].split(',').map(h => h.replace(/^"|"$/g, ''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue;
    const cells = [];
    let cur = '', inQuote = false;
    for (const c of lines[i]) {
      if (c === '"') inQuote = !inQuote;
      else if (c === ',' && !inQuote) { cells.push(cur); cur = ''; }
      else cur += c;
    }
    cells.push(cur);
    const row = {};
    header.forEach((h, j) => row[h] = cells[j]);
    rows.push(row);
  }
  return rows;
}

async function main() {
  console.log('Downloading fueleconomy.gov CSV...');
  const r = await fetch(URL);
  const text = await r.text();
  const rows = parseCsv(text);
  console.log('Rows:', rows.length);

  const out = rows
    .filter(r => r.year && Number(r.year) >= 2000)
    .map(r => ({
      year: Number(r.year),
      make: r.make,
      model: r.model,
      drive: r.drive,
      fuelType: r.fuelType,
      vClass: r.VClass,
      cylinders: r.cylinders ? Number(r.cylinders) : null,
      displ: r.displ ? Number(r.displ) : null,
    }));

  writeFileSync(resolve(DATA_DIR, 'fueleconomy.json'), JSON.stringify(out, null, 2));
  console.log('Wrote', out.length, 'rows to data/fueleconomy.json');
}

main().catch(e => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Run it**

```bash
node scripts/fetch-fueleconomy.mjs
```

Expected: writes `data/fueleconomy.json` with 40,000+ rows. ~30 seconds.

- [ ] **Step 3: Commit**

```bash
git add scripts/fetch-fueleconomy.mjs && git commit -m "feat: fueleconomy.gov bulk CSV fetcher"
```

---

## Task 7: Wikipedia infobox parser with TDD

**Files:**
- Create: `src/lib/wikipedia-parser.ts`, `tests/wikipedia-parser.test.mjs`, `scripts/scrape-wikipedia-tow.mjs`

- [ ] **Step 1: Write failing tests `tests/wikipedia-parser.test.mjs`**

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractTowSpecs, lbsFromText } from '../src/lib/wikipedia-parser.ts';

test('lbsFromText: "13,200 lb" -> 13200', () => {
  assert.equal(lbsFromText('13,200 lb'), 13200);
});

test('lbsFromText: "5500 pounds" -> 5500', () => {
  assert.equal(lbsFromText('5500 pounds'), 5500);
});

test('lbsFromText: "6,000 kg (13,200 lb)" -> 13200', () => {
  assert.equal(lbsFromText('6,000 kg (13,200 lb)'), 13200);
});

test('lbsFromText: "12,000 lbs" -> 12000', () => {
  assert.equal(lbsFromText('12,000 lbs'), 12000);
});

test('lbsFromText: gibberish returns null', () => {
  assert.equal(lbsFromText('truck'), null);
});

test('extractTowSpecs: parses simple infobox HTML', () => {
  const html = `
    <table class="infobox">
      <tr><th>Towing capacity</th><td>13,200 lb (5,987 kg)</td></tr>
      <tr><th>Payload capacity</th><td>3,325 lb</td></tr>
      <tr><th>GVWR</th><td>7,050 lb</td></tr>
    </table>
  `;
  const specs = extractTowSpecs(html);
  assert.equal(specs.maxTowLbs, 13200);
  assert.equal(specs.payloadLbs, 3325);
});

test('extractTowSpecs: returns nulls when no data', () => {
  const specs = extractTowSpecs('<p>No infobox here</p>');
  assert.equal(specs.maxTowLbs, null);
  assert.equal(specs.payloadLbs, null);
});
```

- [ ] **Step 2: Run test (should fail)**

```bash
npm test
```

Expected: cannot find module wikipedia-parser.

- [ ] **Step 3: Implement `src/lib/wikipedia-parser.ts`**

```typescript
import type { TowingSpecs } from './types.ts';

export function lbsFromText(s: string | null | undefined): number | null {
  if (!s) return null;
  // prefer "(N lb)" inside parens — kg often appears first
  const paren = s.match(/\(([\d,]+)\s*(lb|lbs|pounds?)\b/i);
  if (paren) return parseInt(paren[1].replace(/,/g, ''), 10);
  const m = s.match(/([\d,]+)\s*(lb|lbs|pounds?)\b/i);
  if (m) return parseInt(m[1].replace(/,/g, ''), 10);
  return null;
}

const FIELD_PATTERNS: Array<{ key: keyof TowingSpecs; rx: RegExp[] }> = [
  { key: 'maxTowLbs', rx: [/towing\s*capacity/i, /tow\s*rating/i, /max(imum)?\s*tow/i] },
  { key: 'payloadLbs', rx: [/payload\s*capacity/i, /payload/i] },
  { key: 'gcwrLbs', rx: [/gcwr/i, /gross\s*combined/i] },
  { key: 'tongueWeightLbs', rx: [/tongue\s*weight/i] },
];

export function extractTowSpecs(html: string): TowingSpecs {
  const specs: TowingSpecs = {
    maxTowLbs: null,
    payloadLbs: null,
    gcwrLbs: null,
    tongueWeightLbs: null,
    hitchClass: null,
  };
  // Match infobox rows: <tr><th>Field</th><td>Value</td></tr>
  const rowRx = /<tr\b[^>]*>\s*<th\b[^>]*>([\s\S]*?)<\/th>\s*<td\b[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi;
  let m;
  while ((m = rowRx.exec(html)) !== null) {
    const label = m[1].replace(/<[^>]+>/g, '').trim();
    const value = m[2].replace(/<[^>]+>/g, ' ').trim();
    for (const { key, rx } of FIELD_PATTERNS) {
      if (rx.some(r => r.test(label)) && specs[key] == null) {
        const lbs = lbsFromText(value);
        if (lbs) (specs as any)[key] = lbs;
      }
    }
  }
  return specs;
}

export function deriveHitchClass(maxTowLbs: number | null): TowingSpecs['hitchClass'] {
  if (!maxTowLbs) return null;
  if (maxTowLbs <= 2000) return 'I';
  if (maxTowLbs <= 3500) return 'II';
  if (maxTowLbs <= 8000) return 'III';
  if (maxTowLbs <= 12000) return 'IV';
  return 'V';
}
```

- [ ] **Step 4: Run tests (should pass)**

```bash
npm test
```

Expected: 7 passing in wikipedia-parser tests.

- [ ] **Step 5: Write `scripts/scrape-wikipedia-tow.mjs`**

```javascript
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { extractTowSpecs, deriveHitchClass } from '../src/lib/wikipedia-parser.ts';

const DATA_DIR = resolve('data');
mkdirSync(DATA_DIR, { recursive: true });

const UA = 'towrating.net research bot (sunnypat81+towrating@gmail.com)';
const SLEEP = 1100;

function uniqueModels(vpic) {
  const seen = new Map();
  for (const r of vpic) {
    const key = `${r.makeName}|${r.modelName}`;
    if (!seen.has(key)) seen.set(key, { make: r.makeName, model: r.modelName });
  }
  return [...seen.values()];
}

function searchUrl(make, model) {
  return `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&limit=1&search=${encodeURIComponent(make + ' ' + model)}`;
}

function pageHtmlUrl(title) {
  return `https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(title)}`;
}

async function fetchSafe(url) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'text/html,application/json' } });
    if (!r.ok) return null;
    return r.headers.get('content-type')?.includes('json') ? r.json() : r.text();
  } catch { return null; }
}

async function main() {
  const vpic = JSON.parse(readFileSync(resolve(DATA_DIR, 'vpic-raw.json'), 'utf8'));
  const models = uniqueModels(vpic);
  console.log('Unique models to query:', models.length);

  const out = [];
  let i = 0;
  for (const m of models) {
    i++;
    if (i % 50 === 0) console.log(`  ${i}/${models.length}`);
    const search = await fetchSafe(searchUrl(m.make, m.model));
    if (!search || !search[1]?.length) continue;
    const title = search[1][0];
    const url = search[3]?.[0];
    const html = await fetchSafe(pageHtmlUrl(title));
    if (!html || typeof html !== 'string') { await sleep(SLEEP); continue; }
    const specs = extractTowSpecs(html);
    const hitchClass = deriveHitchClass(specs.maxTowLbs);
    const coverage = [specs.maxTowLbs, specs.payloadLbs, specs.gcwrLbs, specs.tongueWeightLbs, hitchClass].filter(v => v != null).length;
    if (coverage > 0) {
      out.push({ make: m.make, model: m.model, wikiTitle: title, wikiUrl: url, specs: { ...specs, hitchClass }, coverage });
    }
    await sleep(SLEEP);
  }
  writeFileSync(resolve(DATA_DIR, 'wiki-tow.json'), JSON.stringify(out, null, 2));
  console.log('Wrote', out.length, 'wiki-tow records');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
main().catch(e => { console.error(e); process.exit(1); });
```

- [ ] **Step 6: Run it (long — backgroundable)**

```bash
node scripts/scrape-wikipedia-tow.mjs
```

Expected: writes `data/wiki-tow.json`. Time: ~30–60 minutes for 2,000 models at 1.1s each. Records with at least 1 spec are kept; full quality gate runs in merge.

- [ ] **Step 7: Commit**

```bash
git add src/lib/wikipedia-parser.ts tests/wikipedia-parser.test.mjs scripts/scrape-wikipedia-tow.mjs && git commit -m "feat: Wikipedia infobox tow-spec scraper (TDD)"
```

---

## Task 8: Merge dataset + quality gate with TDD

**Files:**
- Create: `src/lib/quality-gate.ts`, `tests/quality-gate.test.mjs`, `tests/merge.test.mjs`, `scripts/merge-towing-dataset.mjs`

- [ ] **Step 1: Write failing tests `tests/quality-gate.test.mjs`**

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeCoverage, isIndexable } from '../src/lib/quality-gate.ts';

test('coverage 5/5 is indexable', () => {
  const specs = { maxTowLbs: 10000, payloadLbs: 1500, gcwrLbs: 14000, tongueWeightLbs: 1000, hitchClass: 'IV' };
  assert.equal(computeCoverage(specs), 5);
  assert.equal(isIndexable(specs), true);
});

test('coverage 4/5 is indexable', () => {
  const specs = { maxTowLbs: 10000, payloadLbs: 1500, gcwrLbs: 14000, tongueWeightLbs: null, hitchClass: 'IV' };
  assert.equal(computeCoverage(specs), 4);
  assert.equal(isIndexable(specs), true);
});

test('coverage 3/5 is NOT indexable', () => {
  const specs = { maxTowLbs: 10000, payloadLbs: 1500, gcwrLbs: 14000, tongueWeightLbs: null, hitchClass: null };
  assert.equal(computeCoverage(specs), 3);
  assert.equal(isIndexable(specs), false);
});

test('all-null specs not indexable', () => {
  const specs = { maxTowLbs: null, payloadLbs: null, gcwrLbs: null, tongueWeightLbs: null, hitchClass: null };
  assert.equal(isIndexable(specs), false);
});
```

- [ ] **Step 2: Run (fail)**

```bash
npm test
```

- [ ] **Step 3: Implement `src/lib/quality-gate.ts`**

```typescript
import type { TowingSpecs } from './types.ts';

export function computeCoverage(specs: TowingSpecs): number {
  return [specs.maxTowLbs, specs.payloadLbs, specs.gcwrLbs, specs.tongueWeightLbs, specs.hitchClass].filter(v => v != null).length;
}

export function isIndexable(specs: TowingSpecs): boolean {
  return computeCoverage(specs) >= 4;
}
```

- [ ] **Step 4: Run tests (pass)**

```bash
npm test
```

- [ ] **Step 5: Write merge tests `tests/merge.test.mjs`**

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeTrim, buildModelSlug } from '../scripts/merge-lib.mjs';

test('mergeTrim: hero data wins over wiki data', () => {
  const hero = { specs: { maxTowLbs: 13500, payloadLbs: 2455, gcwrLbs: 18800, tongueWeightLbs: 1350, hitchClass: 'IV' } };
  const wiki = { specs: { maxTowLbs: 12000, payloadLbs: null, gcwrLbs: null, tongueWeightLbs: null, hitchClass: null } };
  const merged = mergeTrim(hero, wiki);
  assert.equal(merged.specs.maxTowLbs, 13500);
  assert.equal(merged.source, 'hero-curated');
});

test('mergeTrim: wiki used when no hero data', () => {
  const wiki = { specs: { maxTowLbs: 8000, payloadLbs: 1500, gcwrLbs: 12000, tongueWeightLbs: 800, hitchClass: 'III' } };
  const merged = mergeTrim(null, wiki);
  assert.equal(merged.specs.maxTowLbs, 8000);
  assert.equal(merged.source, 'wikipedia');
});

test('buildModelSlug: lowercase + hyphenated + strips punctuation', () => {
  assert.equal(buildModelSlug('F-150'), 'f-150');
  assert.equal(buildModelSlug('Silverado 1500'), 'silverado-1500');
  assert.equal(buildModelSlug('CR-V'), 'cr-v');
});
```

- [ ] **Step 6: Implement `scripts/merge-lib.mjs`** (extracted helpers, importable from script + tests)

```javascript
export function buildModelSlug(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function mergeTrim(hero, wiki) {
  if (hero) {
    return {
      specs: { ...hero.specs },
      source: 'hero-curated',
      sourceUrl: null,
    };
  }
  if (wiki && wiki.specs) {
    return {
      specs: { ...wiki.specs },
      source: 'wikipedia',
      sourceUrl: wiki.wikiUrl ?? null,
    };
  }
  return {
    specs: { maxTowLbs: null, payloadLbs: null, gcwrLbs: null, tongueWeightLbs: null, hitchClass: null },
    source: 'vpic-only',
    sourceUrl: null,
  };
}
```

- [ ] **Step 7: Run merge tests (pass)**

```bash
npm test
```

Expected: 3 new tests pass.

- [ ] **Step 8: Write the full merge script `scripts/merge-towing-dataset.mjs`**

```javascript
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildModelSlug, mergeTrim } from './merge-lib.mjs';
import { computeCoverage, isIndexable } from '../src/lib/quality-gate.ts';
import { assignBracket } from '../src/lib/capacity-utils.ts';

const D = resolve('data');
const SRC = resolve('src/data');

const vpic = JSON.parse(readFileSync(resolve(D, 'vpic-raw.json'), 'utf8'));
const fe = JSON.parse(readFileSync(resolve(D, 'fueleconomy.json'), 'utf8'));
const wiki = JSON.parse(readFileSync(resolve(D, 'wiki-tow.json'), 'utf8'));
const hero = JSON.parse(readFileSync(resolve(SRC, 'hero-models.json'), 'utf8'));

function classifyVehicleType(makeName, modelName) {
  const m = `${makeName} ${modelName}`.toLowerCase();
  if (/\b(f-?150|f-?250|f-?350|silverado|sierra|tundra|tacoma|frontier|titan|ridgeline|colorado|canyon|maverick|ranger|gladiator|ram|hilux|cybertruck|r1t)\b/.test(m)) return 'truck';
  if (/\b(suburban|tahoe|yukon|expedition|navigator|escalade|sequoia|4runner|wrangler|grand cherokee|cherokee|pilot|pathfinder|armada|durango|telluride|palisade|highlander|explorer|atlas)\b/.test(m)) return 'suv';
  if (/\b(odyssey|sienna|pacifica|carnival|metris)\b/.test(m)) return 'minivan';
  if (/\b(crv|cr-v|rav4|escape|equinox|rogue|cx-5|outback|forester|santa fe|tucson|sportage|terrain)\b/.test(m)) return 'crossover';
  return 'sedan';
}

const wikiByModel = new Map();
for (const w of wiki) wikiByModel.set(`${w.make.toLowerCase()}|${w.model.toLowerCase()}`, w);

const heroByModel = new Map();
for (const h of hero.models) {
  heroByModel.set(`${h.make.toLowerCase()}|${h.model.toLowerCase()}`, h);
}

// Group VPIC by make+model
const grouped = new Map();
for (const r of vpic) {
  if (r.year < 2001) continue; // 25-year window 2001..2026
  const key = `${r.makeName.toLowerCase()}|${r.modelName.toLowerCase()}`;
  if (!grouped.has(key)) grouped.set(key, { makeName: r.makeName, modelName: r.modelName, years: new Map() });
  const g = grouped.get(key);
  if (!g.years.has(r.year)) g.years.set(r.year, []);
  g.years.get(r.year).push(r);
}

const makesIndex = new Map();
const trimCapacity = [];
const allTrimsForBracket = [];

for (const [key, g] of grouped.entries()) {
  const heroRecord = heroByModel.get(key);
  const wikiRecord = wikiByModel.get(key);
  const vehicleClass = classifyVehicleType(g.makeName, g.modelName);
  const makeSlug = buildModelSlug(g.makeName);
  const modelSlug = buildModelSlug(g.modelName);

  if (!makesIndex.has(makeSlug)) makesIndex.set(makeSlug, { makeSlug, makeLabel: g.makeName, models: [] });

  const years = [];
  for (const [year, _vrows] of g.years.entries()) {
    let trims = [];
    const heroYear = heroRecord?.years?.find(y => y.year === year);
    if (heroYear?.trims?.length) {
      trims = heroYear.trims.map(t => {
        const trimSlug = buildModelSlug(t.trim);
        const merged = mergeTrim({ specs: t.specs }, null);
        const coverage = computeCoverage(merged.specs);
        return {
          trimSlug, trimLabel: t.trim, drivetrain: t.drivetrain, engine: t.engine, curbWeightLbs: t.curbWeightLbs,
          specs: merged.specs, source: merged.source, sourceUrl: merged.sourceUrl,
          specCoverage: coverage, indexable: isIndexable(merged.specs),
        };
      });
    } else {
      // Wiki-derived single representative trim
      const merged = mergeTrim(null, wikiRecord);
      const coverage = computeCoverage(merged.specs);
      trims = [{
        trimSlug: 'base',
        trimLabel: 'Base',
        specs: merged.specs, source: merged.source, sourceUrl: merged.sourceUrl,
        specCoverage: coverage, indexable: isIndexable(merged.specs),
      }];
    }
    const bestTow = Math.max(0, ...trims.map(t => t.specs.maxTowLbs ?? 0));
    const yearIndexable = trims.some(t => t.indexable);
    years.push({ year, trims, bestTowLbs: bestTow || null, indexable: yearIndexable });

    for (const t of trims) {
      if (t.specs.maxTowLbs) {
        trimCapacity.push({ makeSlug, modelSlug, year, trimSlug: t.trimSlug, maxTowLbs: t.specs.maxTowLbs, indexable: t.indexable, vehicleClass });
        allTrimsForBracket.push({ makeSlug, modelSlug, year, trimSlug: t.trimSlug, maxTowLbs: t.specs.maxTowLbs, vehicleClass });
      }
    }
  }

  const bestAll = Math.max(0, ...years.map(y => y.bestTowLbs ?? 0));
  const modelObj = {
    modelSlug, modelLabel: g.modelName, makeSlug, makeLabel: g.makeName,
    vehicleClass, years, bestTowLbsAllTime: bestAll || null,
    indexable: years.some(y => y.indexable),
    wikipediaUrl: wikiRecord?.wikiUrl ?? null,
  };
  makesIndex.get(makeSlug).models.push(modelObj);
}

// Build outputs
const vehicles = [...makesIndex.values()];
const tree = vehicles.map(m => ({
  makeSlug: m.makeSlug, makeLabel: m.makeLabel,
  models: m.models.map(md => ({
    modelSlug: md.modelSlug, modelLabel: md.modelLabel, vehicleClass: md.vehicleClass,
    years: md.years.map(y => ({ year: y.year, trims: y.trims.map(t => t.trimSlug), indexable: y.indexable })),
  })),
}));

const bracketIndex = {};
for (const t of allTrimsForBracket) {
  const b = assignBracket(t.maxTowLbs);
  if (!b) continue;
  if (!bracketIndex[b.lbs]) bracketIndex[b.lbs] = { lbs: b.lbs, label: b.label, vehicles: [] };
  bracketIndex[b.lbs].vehicles.push(t);
}

const flags = { generatedAt: new Date().toISOString(), totals: { makes: vehicles.length, models: 0, years: 0, trims: 0, indexable: 0 } };
for (const m of vehicles) {
  flags.totals.models += m.models.length;
  for (const md of m.models) {
    flags.totals.years += md.years.length;
    for (const y of md.years) {
      flags.totals.trims += y.trims.length;
      for (const t of y.trims) if (t.indexable) flags.totals.indexable++;
    }
  }
}

writeFileSync(resolve(D, 'vehicles.json'), JSON.stringify(vehicles));
writeFileSync(resolve(D, 'trim-capacity.json'), JSON.stringify(trimCapacity));
writeFileSync(resolve(D, 'capacity-bracket-index.json'), JSON.stringify(Object.values(bracketIndex)));
writeFileSync(resolve(D, 'make-model-year-tree.json'), JSON.stringify(tree));
writeFileSync(resolve(D, 'quality-flags.json'), JSON.stringify(flags, null, 2));

console.log('Merge complete:', flags.totals);
```

- [ ] **Step 9: Run the merge**

```bash
npm run data:merge
```

Expected: prints totals like `{ makes: 33, models: 1500, years: 25000, trims: 30000, indexable: 1500 }`.

- [ ] **Step 10: Commit**

```bash
git add src/lib/quality-gate.ts tests/quality-gate.test.mjs tests/merge.test.mjs scripts/merge-lib.mjs scripts/merge-towing-dataset.mjs && git commit -m "feat: dataset merge with quality gate (TDD)"
```

---

## Task 9: Internal-link generator with TDD

**Files:**
- Create: `src/lib/internal-links.ts`, `tests/internal-links.test.mjs`

- [ ] **Step 1: Write failing tests**

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSpokeLinks } from '../src/lib/internal-links.ts';

const sampleVehicles = /* small fixture, see Step 3 */ null;

test('buildSpokeLinks returns at least 8 links', () => {
  const ctx = {
    makeSlug: 'ford', modelSlug: 'f-150', year: 2024, trimSlug: 'xlt-3-5l-ecoboost-v6-4x4-max-tow',
    maxTowLbs: 13500, vehicleClass: 'truck',
    siblings: { sameYearTrims: ['xl-2-7l', 'lariat-5-0l'], prevYear: 2023, nextYear: 2025, sameMakeClass: ['expedition', 'ranger', 'maverick'] },
    bracketLbs: 15000,
    contextualGuide: 'gcwr-explained',
  };
  const links = buildSpokeLinks(ctx);
  assert.ok(links.length >= 8, `expected >=8, got ${links.length}`);
});

test('buildSpokeLinks includes a hitch + brake controller guide', () => {
  const ctx = {
    makeSlug: 'ford', modelSlug: 'f-150', year: 2024, trimSlug: 'xlt',
    maxTowLbs: 13500, vehicleClass: 'truck',
    siblings: { sameYearTrims: [], prevYear: null, nextYear: null, sameMakeClass: [] },
    bracketLbs: 15000, contextualGuide: 'gcwr-explained',
  };
  const links = buildSpokeLinks(ctx);
  assert.ok(links.some(l => l.href.includes('weight-distribution-hitches')));
  assert.ok(links.some(l => l.href.includes('brake-controllers-explained')));
});
```

- [ ] **Step 2: Run (fail)**

- [ ] **Step 3: Implement `src/lib/internal-links.ts`**

```typescript
export interface SpokeLinkContext {
  makeSlug: string;
  modelSlug: string;
  year: number;
  trimSlug?: string;
  maxTowLbs: number;
  vehicleClass: string;
  siblings: {
    sameYearTrims: string[];
    prevYear: number | null;
    nextYear: number | null;
    sameMakeClass: string[];
  };
  bracketLbs: number;
  contextualGuide: string;
}

export interface InternalLink {
  href: string;
  label: string;
  rel?: string;
}

export function buildSpokeLinks(ctx: SpokeLinkContext): InternalLink[] {
  const links: InternalLink[] = [];
  const base = `/${ctx.makeSlug}/${ctx.modelSlug}/${ctx.year}`;

  for (const t of ctx.siblings.sameYearTrims.slice(0, 2)) {
    links.push({ href: `${base}/${t}/`, label: `${ctx.year} sibling trim ${t.replace(/-/g, ' ')}` });
  }
  if (ctx.siblings.prevYear) links.push({ href: `/${ctx.makeSlug}/${ctx.modelSlug}/${ctx.siblings.prevYear}/`, label: `${ctx.siblings.prevYear} model` });
  if (ctx.siblings.nextYear) links.push({ href: `/${ctx.makeSlug}/${ctx.modelSlug}/${ctx.siblings.nextYear}/`, label: `${ctx.siblings.nextYear} model` });

  for (const m of ctx.siblings.sameMakeClass.slice(0, 3)) {
    links.push({ href: `/${ctx.makeSlug}/${m}/`, label: `${ctx.makeSlug} ${m.replace(/-/g, ' ')}` });
  }
  links.push({ href: `/tow-by-capacity/${ctx.bracketLbs}/`, label: `${ctx.bracketLbs.toLocaleString()} lbs towing` });
  links.push({ href: `/guide/${ctx.contextualGuide}/`, label: 'Towing guide' });
  links.push({ href: `/guide/weight-distribution-hitches/`, label: 'Weight-distribution hitches' });
  links.push({ href: `/guide/brake-controllers-explained/`, label: 'Brake controllers explained' });

  return links;
}
```

- [ ] **Step 4: Run tests (pass)**

- [ ] **Step 5: Commit**

```bash
git add src/lib/internal-links.ts tests/internal-links.test.mjs && git commit -m "feat: internal-link generator (8-link minimum, TDD)"
```

---

## Task 10: Schema generators

**Files:**
- Create: `src/lib/schema.ts`

- [ ] **Step 1: Write `src/lib/schema.ts`**

```typescript
import type { Trim, Year, Model } from './types.ts';

const SITE = 'https://towrating.net';

export function vehicleSchema(model: Model, year: Year, trim: Trim) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    name: `${year.year} ${model.makeLabel} ${model.modelLabel} ${trim.trimLabel}`,
    brand: { '@type': 'Brand', name: model.makeLabel },
    model: model.modelLabel,
    modelDate: String(year.year),
    vehicleConfiguration: trim.drivetrain ?? undefined,
    fuelType: undefined,
    trailerWeight: trim.specs.maxTowLbs ? { '@type': 'QuantitativeValue', value: trim.specs.maxTowLbs, unitCode: 'LBR' } : undefined,
    weightTotal: trim.specs.gcwrLbs ? { '@type': 'QuantitativeValue', value: trim.specs.gcwrLbs, unitCode: 'LBR' } : undefined,
    payload: trim.specs.payloadLbs ? { '@type': 'QuantitativeValue', value: trim.specs.payloadLbs, unitCode: 'LBR' } : undefined,
  };
}

export function productSchema(model: Model, year: Year, trim: Trim, dealerUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${year.year} ${model.makeLabel} ${model.modelLabel} ${trim.trimLabel}`,
    brand: { '@type': 'Brand', name: model.makeLabel },
    offers: { '@type': 'Offer', url: dealerUrl, availability: 'https://schema.org/InStock' },
  };
}

export function breadcrumbList(items: Array<{ name: string; href: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: SITE + it.href,
    })),
  };
}

export function faqPage(qas: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qas.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

export function articleSchema({ title, description, slug, datePublished }: { title: string; description: string; slug: string; datePublished: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: `${SITE}/guide/${slug}/`,
    datePublished,
    author: { '@type': 'Organization', name: 'towrating.net' },
    publisher: { '@type': 'Organization', name: 'towrating.net', url: SITE },
  };
}

export function howToSchema({ name, steps }: { name: string; steps: Array<{ name: string; text: string }> }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    step: steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text })),
  };
}

export function itemListFromTrims(trims: Trim[], year: number, makeSlug: string, modelSlug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: trims.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE}/${makeSlug}/${modelSlug}/${year}/${t.trimSlug}/`,
      name: t.trimLabel,
    })),
  };
}

export function collectionPage({ name, description, url }: { name: string; description: string; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: SITE + url,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/schema.ts && git commit -m "feat: JSON-LD schema generators (Vehicle, Product, BreadcrumbList, FAQPage, Article, HowTo, ItemList, CollectionPage)"
```

---

## Task 11: Affiliate URL builders + prose helpers

**Files:**
- Create: `src/lib/affiliate.ts`, `src/lib/prose.ts`, `src/lib/data-loader.ts`

- [ ] **Step 1: Write `src/lib/affiliate.ts`**

```typescript
const E = import.meta.env;

export function carGurusUrl(year: number, make: string, model: string): string {
  const aid = E.PUBLIC_CARGURUS_AFF_ID;
  const base = `https://www.cargurus.com/Cars/spt-listings?searchYear=${year}&searchMake=${encodeURIComponent(make)}&searchModel=${encodeURIComponent(model)}`;
  return aid ? `${base}&affiliate_id=${aid}` : base;
}

export function trueCarUrl(year: number, make: string, model: string): string {
  const aid = E.PUBLIC_TRUECAR_AFF_ID;
  const base = `https://www.truecar.com/used-cars-for-sale/listings/year-${year}/${encodeURIComponent(make.toLowerCase())}/${encodeURIComponent(model.toLowerCase())}/`;
  return aid ? `${base}?aff=${aid}` : base;
}

export function amazonHitchUrl(hitchClass: string | null): string {
  const tag = E.PUBLIC_AMAZON_TAG;
  const term = hitchClass ? `class+${hitchClass}+trailer+hitch` : 'trailer+hitch';
  const base = `https://www.amazon.com/s?k=${term}`;
  return tag ? `${base}&tag=${tag}` : base;
}

export function amazonBrakeControllerUrl(): string {
  const tag = E.PUBLIC_AMAZON_TAG;
  const base = `https://www.amazon.com/s?k=trailer+brake+controller`;
  return tag ? `${base}&tag=${tag}` : base;
}

export function eTrailerUrl(slug: string): string {
  const aid = E.PUBLIC_ETRAILER_AFF_ID;
  const base = `https://www.etrailer.com/${slug}`;
  return aid ? `${base}?aff=${aid}` : base;
}

export function carShieldUrl(): string {
  const aid = E.PUBLIC_CARSHIELD_AFF_ID;
  const base = `https://www.carshield.com/`;
  return aid ? `${base}?aff=${aid}` : base;
}

export function insuranceUrl(): string {
  const aid = E.PUBLIC_INSURANCE_AFF_ID;
  const base = `https://www.moneygeek.com/insurance/auto/`;
  return aid ? `${base}?aff=${aid}` : base;
}
```

- [ ] **Step 2: Write `src/lib/prose.ts`**

```typescript
import type { Trim, Year, Model } from './types.ts';
import { formatLbs } from './capacity-utils.ts';

export function answerOpener(model: Model, year: Year, trim: Trim): string {
  const m = `${year.year} ${model.makeLabel} ${model.modelLabel} ${trim.trimLabel}`;
  const tow = formatLbs(trim.specs.maxTowLbs);
  const pay = formatLbs(trim.specs.payloadLbs);
  const gcwr = formatLbs(trim.specs.gcwrLbs);
  const tongue = formatLbs(trim.specs.tongueWeightLbs);
  const hc = trim.specs.hitchClass ?? 'unspecified';
  return `The ${m} has a maximum towing capacity of ${tow}, a payload rating of ${pay}, a gross combined weight rating (GCWR) of ${gcwr}, and a maximum tongue weight of ${tongue}. It uses a Class ${hc} receiver hitch when properly equipped.`;
}

export function whatCanItTow(maxTowLbs: number | null): string[] {
  if (!maxTowLbs) return [];
  const out: string[] = [];
  if (maxTowLbs >= 3500) out.push(`Pop-up tent campers (typically 1,000–3,000 lbs)`);
  if (maxTowLbs >= 5000) out.push(`Small travel trailers up to 22 feet (typical dry weight 3,500–4,500 lbs)`);
  if (maxTowLbs >= 7500) out.push(`Mid-size travel trailers up to 26 feet (5,000–7,000 lbs)`);
  if (maxTowLbs >= 10000) out.push(`Large travel trailers up to 30 feet (7,500–9,000 lbs)`);
  if (maxTowLbs >= 12000) out.push(`Lightweight fifth-wheels (8,000–11,500 lbs)`);
  if (maxTowLbs >= 15000) out.push(`Mid-size fifth-wheels (12,000–14,500 lbs)`);
  if (maxTowLbs >= 20000) out.push(`Large fifth-wheels and gooseneck trailers (16,000–19,500 lbs)`);
  if (maxTowLbs >= 4000) out.push(`Single-jet-ski / two-PWC trailers (1,500–2,500 lbs)`);
  if (maxTowLbs >= 6000) out.push(`Boats up to 22 ft on a trailer (4,000–5,500 lbs total)`);
  if (maxTowLbs >= 9000) out.push(`Boats up to 28 ft (7,500–8,500 lbs total)`);
  if (maxTowLbs >= 7000) out.push(`Two-horse straight-load horse trailers (5,500–6,800 lbs loaded)`);
  return out;
}

export function commonMistakes(vehicleClass: string): string[] {
  return [
    `Loading the trailer past the manufacturer's max tow rating without verifying GCWR margin`,
    `Ignoring tongue weight: keep it 10–15% of total trailer weight or the trailer will sway`,
    `Skipping a brake controller on trailers over 3,000 lbs — most US states require trailer brakes above this weight`,
    `Forgetting to redistribute payload from cargo when carrying passengers; payload includes occupants`,
    `Running stock tires beyond their D/E load rating when towing near the max — upgrade if towing weekly`,
  ];
}

export function faqsForTrim(model: Model, year: Year, trim: Trim, count: number): Array<{ q: string; a: string }> {
  const m = `${year.year} ${model.makeLabel} ${model.modelLabel}`;
  const tow = trim.specs.maxTowLbs ?? 0;
  const all = [
    { q: `What is the towing capacity of a ${m} ${trim.trimLabel}?`, a: `The ${m} ${trim.trimLabel} has a maximum towing capacity of ${formatLbs(trim.specs.maxTowLbs)} when properly equipped with the manufacturer's tow package.` },
    { q: `Can a ${m} tow a 30-foot travel trailer?`, a: tow >= 9000 ? `Yes — a 30-foot travel trailer typically weighs 7,500–9,000 lbs loaded, which is within this trim's ${formatLbs(trim.specs.maxTowLbs)} rating. Verify your specific trailer's GVWR and stay under 80% of max tow for comfortable towing.` : `Marginal. A 30-foot travel trailer typically weighs 7,500–9,000 lbs loaded, which exceeds this trim's ${formatLbs(trim.specs.maxTowLbs)} rating. Choose a higher-capacity trim or a shorter trailer.` },
    { q: `Can a ${m} tow a fifth-wheel?`, a: tow >= 12000 ? `Yes, a lightweight fifth-wheel (8,000–11,500 lbs) is within this trim's tow rating. Note fifth-wheels also require a special in-bed hitch — confirm your model has a prepped bed.` : `Not recommended. Most fifth-wheels start at 8,000 lbs and exceed this trim's ${formatLbs(trim.specs.maxTowLbs)} capacity. Step up to a heavy-duty model.` },
    { q: `What hitch class does the ${m} use?`, a: `The ${m} ${trim.trimLabel} is rated for a Class ${trim.specs.hitchClass ?? 'III/IV'} receiver hitch.` },
    { q: `What is the payload of the ${m} ${trim.trimLabel}?`, a: `Payload is rated at ${formatLbs(trim.specs.payloadLbs)}. Remember payload includes passengers, cargo, hitch tongue weight, and any aftermarket equipment.` },
    { q: `What is GCWR and why does it matter?`, a: `Gross Combined Weight Rating (GCWR) is the max combined weight of the loaded vehicle and trailer. The ${m} ${trim.trimLabel} is rated at ${formatLbs(trim.specs.gcwrLbs)}. Exceeding GCWR is a leading cause of brake and transmission failure.` },
    { q: `Do I need a weight-distribution hitch?`, a: tow >= 5000 ? `For trailers above 5,000 lbs, Ford/GM/Ram/Toyota all recommend a weight-distribution hitch. It transfers tongue weight back across both axles, restoring proper steering and braking.` : `Not required for typical loads on this trim, but recommended above 5,000 lbs trailer weight or 500 lbs tongue weight.` },
    { q: `Do I need a brake controller for this trim?`, a: `Yes, when towing a trailer over 3,000 lbs (most US states legally require trailer brakes above this weight). The ${m} typically supports a proportional integrated brake controller — confirm trim availability.` },
    { q: `What is tongue weight on the ${m} ${trim.trimLabel}?`, a: `Maximum tongue weight is ${formatLbs(trim.specs.tongueWeightLbs)}. Aim for 10–15% of total trailer weight to avoid sway.` },
    { q: `Is the ${m} better than its competitors for towing?`, a: `Within its capacity bracket, the ${m} ${trim.trimLabel} is competitive at ${formatLbs(trim.specs.maxTowLbs)}. See the "Compare with" section below for direct comparisons against same-class alternatives.` },
  ];
  return all.slice(0, count);
}
```

- [ ] **Step 3: Write `src/lib/data-loader.ts`**

```typescript
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Make, CapacityBracket } from './types.ts';

export function loadVehicles(): Make[] {
  return JSON.parse(readFileSync(resolve('data/vehicles.json'), 'utf8'));
}

export function loadBracketIndex(): CapacityBracket[] {
  return JSON.parse(readFileSync(resolve('data/capacity-bracket-index.json'), 'utf8'));
}

export function loadTree(): any[] {
  return JSON.parse(readFileSync(resolve('data/make-model-year-tree.json'), 'utf8'));
}

export function loadQualityFlags(): any {
  return JSON.parse(readFileSync(resolve('data/quality-flags.json'), 'utf8'));
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/affiliate.ts src/lib/prose.ts src/lib/data-loader.ts && git commit -m "feat: affiliate URL builders, spec prose helpers, data loader"
```

---

## Task 12: Base layout + Header + Footer

**Files:**
- Create: `src/layouts/Base.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/BreadcrumbList.astro`

- [ ] **Step 1: Write `src/layouts/Base.astro`**

```astro
---
import '../styles/global.css';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';

interface Props {
  title: string;
  description: string;
  canonical?: string;
  noindex?: boolean;
  ogImage?: string;
  jsonLd?: object[];
}

const { title, description, canonical, noindex, ogImage, jsonLd = [] } = Astro.props;
const pathname = Astro.url.pathname;
const canonicalUrl = canonical ?? `https://towrating.net${pathname.endsWith('/') ? pathname : pathname + '/'}`;
const og = ogImage ?? `https://towrating.net/og${pathname.replace(/\/$/, '')}.png`;
---
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalUrl} />
  {noindex && <meta name="robots" content="noindex,follow" />}
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={og} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  {jsonLd.map(j => <script type="application/ld+json" set:html={JSON.stringify(j)} />)}
</head>
<body class="min-h-screen flex flex-col">
  <Header />
  <main class="flex-1">
    <slot />
  </main>
  <Footer />
</body>
</html>
```

- [ ] **Step 2: Write `src/components/Header.astro`**

```astro
---
const navItems = [
  { href: '/tow-by-capacity/', label: 'By Capacity' },
  { href: '/tow-by-vehicle-type/', label: 'By Vehicle Type' },
  { href: '/guide/', label: 'Guides' },
];
---
<header class="bg-brand-900 text-white">
  <nav class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
    <a href="/" class="font-display font-bold text-xl tracking-tight">towrating<span class="text-accent-500">.net</span></a>
    <ul class="flex gap-6 text-sm">
      {navItems.map(n => <li><a href={n.href} class="hover:text-accent-500 transition-colors">{n.label}</a></li>)}
    </ul>
  </nav>
</header>
```

- [ ] **Step 3: Write `src/components/Footer.astro`**

```astro
---
const brackets = [3500, 5000, 7500, 10000, 12000, 15000, 20000, 30000];
const guides = [
  { href: '/guide/gcwr-explained/', label: 'GCWR explained' },
  { href: '/guide/tongue-weight-10-percent-rule/', label: 'Tongue weight 10% rule' },
  { href: '/guide/j2807-towing-standard/', label: 'SAE J2807 standard' },
  { href: '/guide/brake-controllers-explained/', label: 'Brake controllers' },
  { href: '/guide/weight-distribution-hitches/', label: 'Weight-distribution hitches' },
];
---
<footer class="bg-brand-900 text-slate-300 mt-16">
  <div class="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
    <div>
      <h3 class="font-display text-white font-semibold mb-3">By Capacity</h3>
      <ul class="space-y-1 text-sm">
        {brackets.map(b => <li><a href={`/tow-by-capacity/${b}/`} class="hover:text-accent-500">{b.toLocaleString()} lbs</a></li>)}
      </ul>
    </div>
    <div>
      <h3 class="font-display text-white font-semibold mb-3">Guides</h3>
      <ul class="space-y-1 text-sm">
        {guides.map(g => <li><a href={g.href} class="hover:text-accent-500">{g.label}</a></li>)}
      </ul>
    </div>
    <div>
      <h3 class="font-display text-white font-semibold mb-3">About</h3>
      <p class="text-sm">towrating.net publishes verified US vehicle towing capacities sourced from manufacturer brochures and Wikipedia. Data is provided as-is — confirm with your owner's manual before towing.</p>
      <p class="text-xs mt-3"><a href="/affiliate-disclosure/" class="hover:text-accent-500 underline">Affiliate disclosure</a></p>
    </div>
  </div>
  <div class="border-t border-brand-800 py-4 text-center text-xs text-slate-400">
    © {new Date().getFullYear()} towrating.net — Some links earn commission at no cost to you.
  </div>
</footer>
```

- [ ] **Step 4: Write `src/components/BreadcrumbList.astro`**

```astro
---
interface Crumb { name: string; href: string; }
interface Props { items: Crumb[]; }
const { items } = Astro.props;
---
<nav aria-label="Breadcrumb" class="text-sm text-slate-600 mb-4">
  <ol class="flex flex-wrap gap-1">
    {items.map((c, i) => (
      <li class="flex items-center gap-1">
        {i > 0 && <span class="text-slate-400">›</span>}
        {i < items.length - 1 ? <a href={c.href} class="hover:text-brand-700 underline">{c.name}</a> : <span aria-current="page" class="font-medium text-slate-900">{c.name}</span>}
      </li>
    ))}
  </ol>
</nav>
```

- [ ] **Step 5: Commit**

```bash
git add src/layouts/Base.astro src/components/Header.astro src/components/Footer.astro src/components/BreadcrumbList.astro && git commit -m "feat: base layout, header, footer, breadcrumbs"
```

---

## Task 13: Vehicle-page components (QuickAnswerBox, ComparisonTable, FAQ, AffiliateBox, CompareWith)

**Files:**
- Create: `src/components/QuickAnswerBox.astro`, `src/components/TrimComparisonTable.astro`, `src/components/FAQSection.astro`, `src/components/AffiliateBox.astro`, `src/components/CompareWith.astro`

- [ ] **Step 1: Write `src/components/QuickAnswerBox.astro`**

```astro
---
import { formatLbs } from '../lib/capacity-utils.ts';
import type { TowingSpecs } from '../lib/types.ts';
interface Props { specs: TowingSpecs; }
const { specs } = Astro.props;
const items = [
  { label: 'Max Tow', value: formatLbs(specs.maxTowLbs) },
  { label: 'Payload', value: formatLbs(specs.payloadLbs) },
  { label: 'GCWR', value: formatLbs(specs.gcwrLbs) },
  { label: 'Tongue Weight', value: formatLbs(specs.tongueWeightLbs) },
  { label: 'Hitch Class', value: specs.hitchClass ?? 'N/A' },
];
---
<aside class="rounded-lg border border-brand-700 bg-brand-900 text-white p-6 my-6 shadow-md">
  <h2 class="font-display text-xl font-semibold text-accent-500 mb-4">Quick Answer</h2>
  <dl class="grid grid-cols-2 md:grid-cols-5 gap-4">
    {items.map(it => (
      <div>
        <dt class="text-xs uppercase tracking-wide text-slate-300">{it.label}</dt>
        <dd class="font-display text-2xl font-bold">{it.value}</dd>
      </div>
    ))}
  </dl>
</aside>
```

- [ ] **Step 2: Write `src/components/TrimComparisonTable.astro`**

```astro
---
import { formatLbs } from '../lib/capacity-utils.ts';
import type { Trim } from '../lib/types.ts';
interface Props { trims: Trim[]; highlightSlug?: string; makeSlug: string; modelSlug: string; year: number; }
const { trims, highlightSlug, makeSlug, modelSlug, year } = Astro.props;
---
<section class="my-8">
  <h2 class="font-display text-2xl font-semibold mb-4">All {year} trims compared</h2>
  <div class="overflow-x-auto">
    <table class="w-full text-sm border-collapse">
      <thead>
        <tr class="bg-slate-100 text-left">
          <th class="p-3 font-semibold">Trim</th>
          <th class="p-3 font-semibold">Max Tow</th>
          <th class="p-3 font-semibold">Payload</th>
          <th class="p-3 font-semibold">GCWR</th>
          <th class="p-3 font-semibold">Tongue</th>
          <th class="p-3 font-semibold">Hitch</th>
        </tr>
      </thead>
      <tbody>
        {trims.map(t => (
          <tr class={t.trimSlug === highlightSlug ? 'bg-accent-500/10 font-semibold' : 'border-t border-slate-200'}>
            <td class="p-3"><a class="text-brand-700 hover:underline" href={`/${makeSlug}/${modelSlug}/${year}/${t.trimSlug}/`}>{t.trimLabel}</a></td>
            <td class="p-3">{formatLbs(t.specs.maxTowLbs)}</td>
            <td class="p-3">{formatLbs(t.specs.payloadLbs)}</td>
            <td class="p-3">{formatLbs(t.specs.gcwrLbs)}</td>
            <td class="p-3">{formatLbs(t.specs.tongueWeightLbs)}</td>
            <td class="p-3">{t.specs.hitchClass ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</section>
```

- [ ] **Step 3: Write `src/components/FAQSection.astro`**

```astro
---
interface Props { qas: Array<{ q: string; a: string }>; }
const { qas } = Astro.props;
---
<section class="my-10">
  <h2 class="font-display text-2xl font-semibold mb-4">Frequently asked questions</h2>
  <div class="space-y-4">
    {qas.map(({ q, a }) => (
      <details class="rounded-md border border-slate-200 bg-white p-4 group">
        <summary class="cursor-pointer font-semibold text-brand-900 list-none flex justify-between gap-4">
          <span>{q}</span>
          <span class="text-accent-600 group-open:rotate-180 transition-transform">▾</span>
        </summary>
        <p class="mt-3 text-slate-700 leading-relaxed">{a}</p>
      </details>
    ))}
  </div>
</section>
```

- [ ] **Step 4: Write `src/components/AffiliateBox.astro`**

```astro
---
interface Props { title: string; description: string; href: string; ctaLabel: string; }
const { title, description, href, ctaLabel } = Astro.props;
---
<aside class="my-6 rounded-lg border-2 border-accent-500 bg-accent-500/5 p-5">
  <p class="text-xs uppercase tracking-wide text-accent-600 font-semibold mb-1">Sponsored</p>
  <h3 class="font-display text-lg font-semibold mb-2">{title}</h3>
  <p class="text-sm text-slate-700 mb-3">{description}</p>
  <a href={href} rel="sponsored noopener" target="_blank" class="inline-block bg-accent-600 hover:bg-accent-500 text-white font-semibold px-4 py-2 rounded transition-colors">{ctaLabel} →</a>
</aside>
```

- [ ] **Step 5: Write `src/components/CompareWith.astro`**

```astro
---
import { formatLbs } from '../lib/capacity-utils.ts';
interface Props { alternates: Array<{ makeSlug: string; modelSlug: string; year: number; label: string; maxTowLbs: number }>; }
const { alternates } = Astro.props;
---
<section class="my-8">
  <h2 class="font-display text-2xl font-semibold mb-4">Compare with similar vehicles</h2>
  <div class="grid sm:grid-cols-3 gap-4">
    {alternates.map(a => (
      <a href={`/${a.makeSlug}/${a.modelSlug}/${a.year}/`} class="block rounded-lg border border-slate-200 bg-white p-4 hover:border-accent-500 hover:shadow-sm transition">
        <div class="text-xs text-slate-500 uppercase tracking-wide">{a.year}</div>
        <div class="font-display font-semibold text-brand-900">{a.label}</div>
        <div class="mt-2 text-accent-600 font-bold">{formatLbs(a.maxTowLbs)}</div>
      </a>
    ))}
  </div>
</section>
```

- [ ] **Step 6: Commit**

```bash
git add src/components/QuickAnswerBox.astro src/components/TrimComparisonTable.astro src/components/FAQSection.astro src/components/AffiliateBox.astro src/components/CompareWith.astro && git commit -m "feat: vehicle-page components (QuickAnswer, ComparisonTable, FAQ, AffiliateBox, CompareWith)"
```

---

## Task 14: TrimPage + YearPage layouts

**Files:**
- Create: `src/layouts/TrimPage.astro`, `src/layouts/YearPage.astro`

- [ ] **Step 1: Write `src/layouts/TrimPage.astro`**

```astro
---
import Base from './Base.astro';
import BreadcrumbList from '../components/BreadcrumbList.astro';
import QuickAnswerBox from '../components/QuickAnswerBox.astro';
import TrimComparisonTable from '../components/TrimComparisonTable.astro';
import FAQSection from '../components/FAQSection.astro';
import AffiliateBox from '../components/AffiliateBox.astro';
import CompareWith from '../components/CompareWith.astro';
import { answerOpener, whatCanItTow, commonMistakes, faqsForTrim } from '../lib/prose.ts';
import { vehicleSchema, productSchema, breadcrumbList, faqPage, itemListFromTrims } from '../lib/schema.ts';
import { buildSpokeLinks } from '../lib/internal-links.ts';
import { assignBracket, formatLbs } from '../lib/capacity-utils.ts';
import { carGurusUrl, amazonHitchUrl, amazonBrakeControllerUrl, insuranceUrl } from '../lib/affiliate.ts';
import type { Model, Year, Trim } from '../lib/types.ts';

interface Props {
  model: Model; year: Year; trim: Trim;
  siblingMakeClass: string[]; alternates: Array<{ makeSlug: string; modelSlug: string; year: number; label: string; maxTowLbs: number }>;
  prevYear: number | null; nextYear: number | null;
}
const { model, year, trim, siblingMakeClass, alternates, prevYear, nextYear } = Astro.props;
const fullName = `${year.year} ${model.makeLabel} ${model.modelLabel} ${trim.trimLabel}`;
const title = `${fullName} Towing Capacity: ${formatLbs(trim.specs.maxTowLbs)} (Verified Specs)`;
const description = `${fullName} max towing capacity ${formatLbs(trim.specs.maxTowLbs)}, payload ${formatLbs(trim.specs.payloadLbs)}, GCWR ${formatLbs(trim.specs.gcwrLbs)}, tongue weight ${formatLbs(trim.specs.tongueWeightLbs)}, hitch class ${trim.specs.hitchClass ?? 'N/A'}.`;
const bracket = assignBracket(trim.specs.maxTowLbs ?? 0);
const opener = answerOpener(model, year, trim);
const towables = whatCanItTow(trim.specs.maxTowLbs);
const mistakes = commonMistakes(model.vehicleClass);
const faqCount = trim.source === 'hero-curated' ? 10 : 6;
const faqs = faqsForTrim(model, year, trim, faqCount);
const crumbs = [
  { name: 'Home', href: '/' },
  { name: model.makeLabel, href: `/${model.makeSlug}/` },
  { name: model.modelLabel, href: `/${model.makeSlug}/${model.modelSlug}/` },
  { name: String(year.year), href: `/${model.makeSlug}/${model.modelSlug}/${year.year}/` },
  { name: trim.trimLabel, href: `/${model.makeSlug}/${model.modelSlug}/${year.year}/${trim.trimSlug}/` },
];
const dealerUrl = carGurusUrl(year.year, model.makeLabel, model.modelLabel);
const jsonLd = [
  vehicleSchema(model, year, trim),
  productSchema(model, year, trim, dealerUrl),
  breadcrumbList(crumbs),
  faqPage(faqs),
  itemListFromTrims(year.trims, year.year, model.makeSlug, model.modelSlug),
];
const links = buildSpokeLinks({
  makeSlug: model.makeSlug, modelSlug: model.modelSlug, year: year.year, trimSlug: trim.trimSlug,
  maxTowLbs: trim.specs.maxTowLbs ?? 0, vehicleClass: model.vehicleClass,
  siblings: {
    sameYearTrims: year.trims.filter(t => t.trimSlug !== trim.trimSlug).map(t => t.trimSlug),
    prevYear, nextYear, sameMakeClass: siblingMakeClass,
  },
  bracketLbs: bracket?.lbs ?? 10000,
  contextualGuide: trim.specs.maxTowLbs && trim.specs.maxTowLbs > 7500 ? 'gcwr-explained' : 'tongue-weight-10-percent-rule',
});
---
<Base title={title} description={description} noindex={!trim.indexable} jsonLd={jsonLd}>
  <article class="max-w-4xl mx-auto px-4 py-8">
    <BreadcrumbList items={crumbs} />
    <h1 class="font-display text-4xl font-bold text-brand-900 mb-4">{title}</h1>
    <p class="text-lg text-slate-700 leading-relaxed mb-6">{opener}</p>
    <QuickAnswerBox specs={trim.specs} />

    <AffiliateBox title={`Find this ${fullName} nearby`} description="Compare local listings, dealer prices, and inventory." href={dealerUrl} ctaLabel="Search local inventory" />

    <TrimComparisonTable trims={year.trims} highlightSlug={trim.trimSlug} makeSlug={model.makeSlug} modelSlug={model.modelSlug} year={year.year} />

    {towables.length > 0 && (
      <section class="my-8">
        <h2 class="font-display text-2xl font-semibold mb-3">What can the {fullName} tow?</h2>
        <p class="text-slate-700 mb-3">With its {formatLbs(trim.specs.maxTowLbs)} max tow rating, the {fullName} can pull these typical trailer types when properly equipped:</p>
        <ul class="list-disc pl-6 space-y-1 text-slate-700">{towables.map(t => <li>{t}</li>)}</ul>
      </section>
    )}

    <section class="my-8">
      <h2 class="font-display text-2xl font-semibold mb-3">Required equipment</h2>
      <p class="text-slate-700 mb-3">For maximum capacity towing on the {fullName} you need: a Class {trim.specs.hitchClass ?? 'III/IV'} receiver hitch, a proportional brake controller (legally required on trailers over 3,000 lbs in most US states), trailer wiring harness, and — for trailers above 5,000 lbs — a weight-distribution hitch.</p>
      <AffiliateBox title={`Class ${trim.specs.hitchClass ?? 'IV'} hitches for the ${model.makeLabel} ${model.modelLabel}`} description="Receiver hitches rated for this trim's max tow capacity." href={amazonHitchUrl(trim.specs.hitchClass)} ctaLabel="Browse hitches on Amazon" />
      <AffiliateBox title="Trailer brake controllers" description="Proportional integrated brake controllers compatible with most US pickups and SUVs." href={amazonBrakeControllerUrl()} ctaLabel="Browse brake controllers" />
    </section>

    <section class="my-8">
      <h2 class="font-display text-2xl font-semibold mb-3">5 common towing mistakes with the {model.makeLabel} {model.modelLabel}</h2>
      <ol class="list-decimal pl-6 space-y-2 text-slate-700">{mistakes.map(m => <li>{m}</li>)}</ol>
    </section>

    <CompareWith alternates={alternates} />

    <FAQSection qas={faqs} />

    <section class="my-8 rounded-lg bg-slate-50 p-5">
      <h2 class="font-display text-lg font-semibold mb-2">Related</h2>
      <ul class="grid sm:grid-cols-2 gap-2 text-sm">
        {links.map(l => <li><a href={l.href} class="text-brand-700 hover:text-accent-600 hover:underline">{l.label}</a></li>)}
      </ul>
    </section>

    {trim.sourceUrl && (
      <p class="text-xs text-slate-500 mt-8">Specs sourced from <a href={trim.sourceUrl} rel="noopener" target="_blank" class="underline">{trim.sourceUrl}</a> and verified against manufacturer documentation.</p>
    )}
  </article>
</Base>
```

- [ ] **Step 2: Write `src/layouts/YearPage.astro`**

```astro
---
import Base from './Base.astro';
import BreadcrumbList from '../components/BreadcrumbList.astro';
import QuickAnswerBox from '../components/QuickAnswerBox.astro';
import TrimComparisonTable from '../components/TrimComparisonTable.astro';
import FAQSection from '../components/FAQSection.astro';
import AffiliateBox from '../components/AffiliateBox.astro';
import { breadcrumbList, itemListFromTrims, faqPage } from '../lib/schema.ts';
import { buildSpokeLinks } from '../lib/internal-links.ts';
import { formatLbs, assignBracket } from '../lib/capacity-utils.ts';
import { carGurusUrl } from '../lib/affiliate.ts';
import type { Model, Year } from '../lib/types.ts';

interface Props { model: Model; year: Year; siblingMakeClass: string[]; prevYear: number | null; nextYear: number | null; }
const { model, year, siblingMakeClass, prevYear, nextYear } = Astro.props;
const bestTrim = year.trims.reduce((a, b) => (b.specs.maxTowLbs ?? 0) > (a.specs.maxTowLbs ?? 0) ? b : a, year.trims[0]);
const title = `${year.year} ${model.makeLabel} ${model.modelLabel} Towing Capacity: ${formatLbs(year.bestTowLbs)} (All Trims)`;
const description = `${year.year} ${model.makeLabel} ${model.modelLabel} max towing capacity ${formatLbs(year.bestTowLbs)}. Compare all ${year.trims.length} trims, payloads, GCWR, and hitch ratings.`;
const crumbs = [
  { name: 'Home', href: '/' },
  { name: model.makeLabel, href: `/${model.makeSlug}/` },
  { name: model.modelLabel, href: `/${model.makeSlug}/${model.modelSlug}/` },
  { name: String(year.year), href: `/${model.makeSlug}/${model.modelSlug}/${year.year}/` },
];
const faqs = [
  { q: `What is the towing capacity of a ${year.year} ${model.makeLabel} ${model.modelLabel}?`, a: `The ${year.year} ${model.makeLabel} ${model.modelLabel} has a maximum towing capacity of ${formatLbs(year.bestTowLbs)} on its top trim (${bestTrim.trimLabel}). Lower trims tow less — see the comparison table above.` },
  { q: `How does ${year.year} ${model.modelLabel} compare to ${prevYear ?? year.year - 1}?`, a: `Capacity differences year-over-year are typically 100–500 lbs. View the ${prevYear ?? year.year - 1} model page below for direct comparison.` },
  { q: `Which trim of the ${year.year} ${model.modelLabel} tows the most?`, a: `The ${bestTrim.trimLabel} trim has the highest tow rating at ${formatLbs(bestTrim.specs.maxTowLbs)}.` },
];
const jsonLd = [
  breadcrumbList(crumbs),
  itemListFromTrims(year.trims, year.year, model.makeSlug, model.modelSlug),
  faqPage(faqs),
];
const bracket = assignBracket(year.bestTowLbs ?? 0);
const links = buildSpokeLinks({
  makeSlug: model.makeSlug, modelSlug: model.modelSlug, year: year.year,
  maxTowLbs: year.bestTowLbs ?? 0, vehicleClass: model.vehicleClass,
  siblings: { sameYearTrims: year.trims.map(t => t.trimSlug).slice(0, 2), prevYear, nextYear, sameMakeClass: siblingMakeClass },
  bracketLbs: bracket?.lbs ?? 10000,
  contextualGuide: 'gcwr-explained',
});
---
<Base title={title} description={description} noindex={!year.indexable} jsonLd={jsonLd}>
  <article class="max-w-4xl mx-auto px-4 py-8">
    <BreadcrumbList items={crumbs} />
    <h1 class="font-display text-4xl font-bold text-brand-900 mb-4">{title}</h1>
    <p class="text-lg text-slate-700 leading-relaxed mb-6">The {year.year} {model.makeLabel} {model.modelLabel} is rated to tow up to {formatLbs(year.bestTowLbs)} when properly equipped on its top {bestTrim.trimLabel} trim. Across all {year.trims.length} trims, towing capacity ranges from {formatLbs(Math.min(...year.trims.map(t => t.specs.maxTowLbs ?? 0).filter(n => n > 0)))} to {formatLbs(year.bestTowLbs)}.</p>
    <QuickAnswerBox specs={bestTrim.specs} />
    <TrimComparisonTable trims={year.trims} makeSlug={model.makeSlug} modelSlug={model.modelSlug} year={year.year} />
    <AffiliateBox title={`Find a ${year.year} ${model.makeLabel} ${model.modelLabel} nearby`} description="Compare local listings, dealer prices, and inventory." href={carGurusUrl(year.year, model.makeLabel, model.modelLabel)} ctaLabel="Search local inventory" />
    <FAQSection qas={faqs} />
    <section class="my-8 rounded-lg bg-slate-50 p-5">
      <h2 class="font-display text-lg font-semibold mb-2">Related</h2>
      <ul class="grid sm:grid-cols-2 gap-2 text-sm">{links.map(l => <li><a href={l.href} class="text-brand-700 hover:text-accent-600 hover:underline">{l.label}</a></li>)}</ul>
    </section>
  </article>
</Base>
```

- [ ] **Step 3: Commit**

```bash
git add src/layouts/TrimPage.astro src/layouts/YearPage.astro && git commit -m "feat: TrimPage and YearPage layouts with full anatomy"
```

---

## Task 15: ModelHub, MakeHub, CapacityBracket, VehicleTypeHub layouts

**Files:** Create the 4 hub layouts.

- [ ] **Step 1: Write `src/layouts/ModelHub.astro`**

```astro
---
import Base from './Base.astro';
import BreadcrumbList from '../components/BreadcrumbList.astro';
import QuickAnswerBox from '../components/QuickAnswerBox.astro';
import { breadcrumbList, collectionPage } from '../lib/schema.ts';
import { formatLbs } from '../lib/capacity-utils.ts';
import type { Model } from '../lib/types.ts';

interface Props { model: Model; }
const { model } = Astro.props;
const indexableYears = model.years.filter(y => y.indexable).sort((a, b) => b.year - a.year);
const title = `${model.makeLabel} ${model.modelLabel} Towing Capacity by Year — All Generations`;
const description = `Complete towing-capacity history for the ${model.makeLabel} ${model.modelLabel}: max tow, payload, GCWR, and hitch class for every model year ${indexableYears.length ? indexableYears[indexableYears.length - 1].year : ''}–${indexableYears[0]?.year ?? ''}.`;
const crumbs = [
  { name: 'Home', href: '/' },
  { name: model.makeLabel, href: `/${model.makeSlug}/` },
  { name: model.modelLabel, href: `/${model.makeSlug}/${model.modelSlug}/` },
];
const jsonLd = [breadcrumbList(crumbs), collectionPage({ name: title, description, url: `/${model.makeSlug}/${model.modelSlug}/` })];
const bestTrim = indexableYears[0]?.trims.find(t => t.specs.maxTowLbs === indexableYears[0].bestTowLbs);
---
<Base title={title} description={description} noindex={!model.indexable} jsonLd={jsonLd}>
  <article class="max-w-5xl mx-auto px-4 py-8">
    <BreadcrumbList items={crumbs} />
    <h1 class="font-display text-4xl font-bold text-brand-900 mb-4">{title}</h1>
    <p class="text-lg text-slate-700 leading-relaxed mb-6">The {model.makeLabel} {model.modelLabel} is a {model.vehicleClass} produced from {indexableYears[indexableYears.length - 1]?.year} to {indexableYears[0]?.year}. Its all-time best towing capacity is {formatLbs(model.bestTowLbsAllTime)}, achieved on top trims of the most recent generation.</p>
    {bestTrim && <QuickAnswerBox specs={bestTrim.specs} />}
    <section class="my-8">
      <h2 class="font-display text-2xl font-semibold mb-4">Towing capacity by model year</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="bg-slate-100 text-left"><th class="p-3">Year</th><th class="p-3">Max Tow</th><th class="p-3">Trims</th><th class="p-3"></th></tr></thead>
          <tbody>
            {indexableYears.map(y => (
              <tr class="border-t border-slate-200">
                <td class="p-3 font-semibold">{y.year}</td>
                <td class="p-3">{formatLbs(y.bestTowLbs)}</td>
                <td class="p-3">{y.trims.length}</td>
                <td class="p-3"><a href={`/${model.makeSlug}/${model.modelSlug}/${y.year}/`} class="text-brand-700 hover:underline">View {y.year} →</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  </article>
</Base>
```

- [ ] **Step 2: Write `src/layouts/MakeHub.astro`**

```astro
---
import Base from './Base.astro';
import BreadcrumbList from '../components/BreadcrumbList.astro';
import { breadcrumbList, collectionPage } from '../lib/schema.ts';
import { formatLbs } from '../lib/capacity-utils.ts';
import type { Make } from '../lib/types.ts';

interface Props { make: Make; }
const { make } = Astro.props;
const indexableModels = make.models.filter(m => m.indexable);
const groupedByClass: Record<string, typeof indexableModels> = {};
for (const m of indexableModels) (groupedByClass[m.vehicleClass] ??= []).push(m);
const title = `${make.makeLabel} Towing Capacities — All Models, Trucks, SUVs`;
const description = `${make.makeLabel} towing capacities for trucks, SUVs, and crossovers across all model years. Compare max tow, payload, and GCWR for every ${make.makeLabel} model.`;
const crumbs = [{ name: 'Home', href: '/' }, { name: make.makeLabel, href: `/${make.makeSlug}/` }];
const jsonLd = [breadcrumbList(crumbs), collectionPage({ name: title, description, url: `/${make.makeSlug}/` })];
---
<Base title={title} description={description} jsonLd={jsonLd}>
  <article class="max-w-5xl mx-auto px-4 py-8">
    <BreadcrumbList items={crumbs} />
    <h1 class="font-display text-4xl font-bold text-brand-900 mb-4">{title}</h1>
    <p class="text-lg text-slate-700 leading-relaxed mb-6">{make.makeLabel} sells {indexableModels.length} models with documented towing capacity, ranging from {formatLbs(Math.min(...indexableModels.map(m => m.bestTowLbsAllTime ?? 9e9)))} to {formatLbs(Math.max(...indexableModels.map(m => m.bestTowLbsAllTime ?? 0)))}. Browse by vehicle class:</p>
    {Object.entries(groupedByClass).map(([cls, models]) => (
      <section class="my-8">
        <h2 class="font-display text-2xl font-semibold mb-3 capitalize">{cls}s</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {models.map(m => (
            <a href={`/${make.makeSlug}/${m.modelSlug}/`} class="block rounded-lg border border-slate-200 bg-white p-4 hover:border-accent-500 hover:shadow-sm transition">
              <div class="font-display font-semibold text-brand-900">{m.modelLabel}</div>
              <div class="text-sm text-slate-600">Max tow {formatLbs(m.bestTowLbsAllTime)}</div>
            </a>
          ))}
        </div>
      </section>
    ))}
  </article>
</Base>
```

- [ ] **Step 3: Write `src/layouts/CapacityBracket.astro`**

```astro
---
import Base from './Base.astro';
import BreadcrumbList from '../components/BreadcrumbList.astro';
import { breadcrumbList, collectionPage } from '../lib/schema.ts';
import { formatLbs } from '../lib/capacity-utils.ts';
import type { CapacityBracket } from '../lib/types.ts';

interface Props { bracket: CapacityBracket; }
const { bracket } = Astro.props;
const groupedByClass: Record<string, typeof bracket.vehicles> = {};
for (const v of bracket.vehicles) (groupedByClass[v.vehicleClass] ??= []).push(v);
const title = `Vehicles That Tow Up to ${formatLbs(bracket.lbs)} — Trucks, SUVs, & More`;
const description = `Every truck, SUV, and crossover with a maximum towing capacity in the ${bracket.label} bracket. Compare max tow ratings and find the right vehicle for your trailer.`;
const crumbs = [{ name: 'Home', href: '/' }, { name: 'By Capacity', href: '/tow-by-capacity/' }, { name: bracket.label, href: `/tow-by-capacity/${bracket.lbs}/` }];
const jsonLd = [breadcrumbList(crumbs), collectionPage({ name: title, description, url: `/tow-by-capacity/${bracket.lbs}/` })];
---
<Base title={title} description={description} jsonLd={jsonLd}>
  <article class="max-w-5xl mx-auto px-4 py-8">
    <BreadcrumbList items={crumbs} />
    <h1 class="font-display text-4xl font-bold text-brand-900 mb-4">{title}</h1>
    <p class="text-lg text-slate-700 leading-relaxed mb-6">Vehicles in the {bracket.label} towing bracket are rated to pull trailers up to {formatLbs(bracket.lbs)}. This range typically covers {bracket.lbs >= 10000 ? 'large travel trailers, lightweight fifth-wheels, horse trailers, and bigger boats' : bracket.lbs >= 5000 ? 'mid-size travel trailers, pop-up campers, and small boats' : 'small utility trailers, jet skis, and pop-up campers'}.</p>
    {Object.entries(groupedByClass).map(([cls, vehicles]) => (
      <section class="my-8">
        <h2 class="font-display text-2xl font-semibold mb-3 capitalize">{cls}s</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {vehicles.slice(0, 30).map(v => (
            <a href={`/${v.makeSlug}/${v.modelSlug}/${v.year}/${v.trimSlug ? v.trimSlug + '/' : ''}`} class="block rounded-lg border border-slate-200 bg-white p-4 hover:border-accent-500">
              <div class="text-xs text-slate-500">{v.year}</div>
              <div class="font-display font-semibold text-brand-900 capitalize">{v.makeSlug.replace(/-/g, ' ')} {v.modelSlug.replace(/-/g, ' ')}</div>
              <div class="text-sm text-accent-600 font-bold">{formatLbs(v.maxTowLbs)}</div>
            </a>
          ))}
        </div>
      </section>
    ))}
  </article>
</Base>
```

- [ ] **Step 4: Write `src/layouts/VehicleTypeHub.astro`**

```astro
---
import Base from './Base.astro';
import BreadcrumbList from '../components/BreadcrumbList.astro';
import { breadcrumbList, collectionPage } from '../lib/schema.ts';
import { formatLbs } from '../lib/capacity-utils.ts';

interface Props {
  type: string;
  vehicles: Array<{ makeSlug: string; modelSlug: string; year: number; bestTowLbs: number; modelLabel: string; makeLabel: string }>;
}
const { type, vehicles } = Astro.props;
const title = `Best ${type.charAt(0).toUpperCase() + type.slice(1)}s for Towing — Capacity Comparison`;
const description = `Compare ${type} towing capacities across every major US make. Sortable by max tow capacity, year, and trim.`;
const crumbs = [{ name: 'Home', href: '/' }, { name: 'By Vehicle Type', href: '/tow-by-vehicle-type/' }, { name: `${type}s`, href: `/tow-by-vehicle-type/${type}/` }];
const jsonLd = [breadcrumbList(crumbs), collectionPage({ name: title, description, url: `/tow-by-vehicle-type/${type}/` })];
---
<Base title={title} description={description} jsonLd={jsonLd}>
  <article class="max-w-5xl mx-auto px-4 py-8">
    <BreadcrumbList items={crumbs} />
    <h1 class="font-display text-4xl font-bold text-brand-900 mb-4">{title}</h1>
    <p class="text-lg text-slate-700 leading-relaxed mb-6">There are {vehicles.length} {type}s in our database with documented towing capacities. Top tow rating in this class: {formatLbs(Math.max(...vehicles.map(v => v.bestTowLbs)))}.</p>
    <table class="w-full text-sm">
      <thead><tr class="bg-slate-100 text-left"><th class="p-3">Vehicle</th><th class="p-3">Year</th><th class="p-3">Max Tow</th></tr></thead>
      <tbody>
        {vehicles.slice(0, 100).map(v => (
          <tr class="border-t border-slate-200">
            <td class="p-3"><a href={`/${v.makeSlug}/${v.modelSlug}/${v.year}/`} class="text-brand-700 hover:underline">{v.makeLabel} {v.modelLabel}</a></td>
            <td class="p-3">{v.year}</td>
            <td class="p-3 font-semibold">{formatLbs(v.bestTowLbs)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </article>
</Base>
```

- [ ] **Step 5: Commit**

```bash
git add src/layouts/ModelHub.astro src/layouts/MakeHub.astro src/layouts/CapacityBracket.astro src/layouts/VehicleTypeHub.astro && git commit -m "feat: 4 hub layouts (Model, Make, CapacityBracket, VehicleType)"
```

---

## Task 16: Use-case crossroad + Guide layouts

**Files:** `src/layouts/UseCaseCrossroad.astro`, `src/layouts/GuideArticle.astro`, `src/content.config.ts`

- [ ] **Step 1: Write `src/content.config.ts`**

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const guides = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.string(),
    updatedDate: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { guides };
```

- [ ] **Step 2: Write `src/layouts/GuideArticle.astro`**

```astro
---
import Base from './Base.astro';
import BreadcrumbList from '../components/BreadcrumbList.astro';
import { breadcrumbList, articleSchema } from '../lib/schema.ts';

interface Props { title: string; description: string; slug: string; publishDate: string; }
const { title, description, slug, publishDate } = Astro.props;
const crumbs = [{ name: 'Home', href: '/' }, { name: 'Guides', href: '/guide/' }, { name: title, href: `/guide/${slug}/` }];
const jsonLd = [breadcrumbList(crumbs), articleSchema({ title, description, slug, datePublished: publishDate })];
---
<Base title={title} description={description} jsonLd={jsonLd}>
  <article class="max-w-3xl mx-auto px-4 py-8">
    <BreadcrumbList items={crumbs} />
    <h1 class="font-display text-4xl font-bold text-brand-900 mb-4">{title}</h1>
    <p class="text-lg text-slate-600 italic mb-6">{description}</p>
    <div class="prose prose-slate max-w-none prose-headings:font-display prose-headings:text-brand-900 prose-a:text-brand-700 prose-a:no-underline hover:prose-a:underline">
      <slot />
    </div>
  </article>
</Base>
```

- [ ] **Step 3: Add `@tailwindcss/typography` plugin**

```bash
npm install @tailwindcss/typography
```

Edit `src/styles/global.css` to add `@plugin "@tailwindcss/typography";` at top.

- [ ] **Step 4: Write `src/layouts/UseCaseCrossroad.astro`**

```astro
---
import Base from './Base.astro';
import BreadcrumbList from '../components/BreadcrumbList.astro';
import { breadcrumbList, collectionPage } from '../lib/schema.ts';
import { formatLbs } from '../lib/capacity-utils.ts';
import type { UseCaseCrossroad } from '../lib/types.ts';

interface Props { crossroad: UseCaseCrossroad; }
const { crossroad } = Astro.props;
const title = `Best ${crossroad.classLabel} for ${crossroad.trailerLabel} Towing`;
const description = `Top vehicles for towing a ${crossroad.trailerLabel} with a ${crossroad.classLabel}. Real towing-capacity data, capacity-matched alternatives, and required equipment.`;
const crumbs = [{ name: 'Home', href: '/' }, { name: title, href: `/tow/${crossroad.slug}/` }];
const jsonLd = [breadcrumbList(crumbs), collectionPage({ name: title, description, url: `/tow/${crossroad.slug}/` })];
---
<Base title={title} description={description} jsonLd={jsonLd}>
  <article class="max-w-4xl mx-auto px-4 py-8">
    <BreadcrumbList items={crumbs} />
    <h1 class="font-display text-4xl font-bold text-brand-900 mb-4">{title}</h1>
    <p class="text-lg text-slate-700 leading-relaxed mb-6">A typical {crossroad.trailerLabel} weighs between {crossroad.trailer === 'travel-trailer' ? '5,000 and 9,000 lbs' : crossroad.trailer === 'fifth-wheel' ? '8,000 and 16,000 lbs' : crossroad.trailer === 'boat' ? '3,000 and 7,500 lbs' : '4,500 and 8,000 lbs'} loaded. Below are the top {crossroad.classLabel} options that can pull this safely with margin to spare.</p>
    <h2 class="font-display text-2xl font-semibold mt-8 mb-4">Top vehicles for this combination</h2>
    <table class="w-full text-sm">
      <thead><tr class="bg-slate-100 text-left"><th class="p-3">Vehicle</th><th class="p-3">Year</th><th class="p-3">Max Tow</th></tr></thead>
      <tbody>
        {crossroad.vehicles.slice(0, 20).map(v => (
          <tr class="border-t border-slate-200">
            <td class="p-3 capitalize"><a href={`/${v.makeSlug}/${v.modelSlug}/${v.year}/`} class="text-brand-700 hover:underline">{v.makeSlug.replace(/-/g, ' ')} {v.modelSlug.replace(/-/g, ' ')}</a></td>
            <td class="p-3">{v.year}</td>
            <td class="p-3 font-semibold">{formatLbs(v.maxTowLbs)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </article>
</Base>
```

- [ ] **Step 5: Commit**

```bash
git add src/content.config.ts src/layouts/GuideArticle.astro src/layouts/UseCaseCrossroad.astro src/styles/global.css package.json package-lock.json && git commit -m "feat: GuideArticle + UseCaseCrossroad layouts, content collection"
```

---

## Task 17: 5 cornerstone guides (MDX)

**Files:** `src/content/guides/{gcwr-explained,tongue-weight-10-percent-rule,j2807-towing-standard,brake-controllers-explained,weight-distribution-hitches}.mdx`

- [ ] **Step 1: Write each guide**

For each of the 5 guides, write a complete MDX file ≥1,500 words covering:
- Frontmatter: `title`, `description`, `publishDate: '2026-04-26'`, `tags`
- H1 in frontmatter (the layout renders it)
- Intro paragraph (80-word answer-first)
- Sections with H2/H3
- Concrete numbers and examples
- 1 contextual cross-link to another guide
- 1 affiliate link via Markdown (e.g. `[Best Class IV hitches on Amazon](https://amazon.com/s?k=class+iv+hitch)` — the env-driven version isn't easy to inject from MDX, so use bare links here; you can convert to a `<AffiliateBox>` import later)
- 5-Q FAQ at the bottom

The 5 guide topics:

1. **`gcwr-explained.mdx`** — what GCWR is, how to calculate trailer-tow margin, why exceeding it kills transmissions, how to read the door-jamb sticker, GCWR vs GVWR vs payload distinction.
2. **`tongue-weight-10-percent-rule.mdx`** — why 10–15% is the safe range, what trailer sway is, how to weigh tongue weight at home (bathroom-scale method), redistributing cargo, weight-distribution hitch as the fix when tongue is too high.
3. **`j2807-towing-standard.mdx`** — what SAE J2807 is, when manufacturers adopted it (Toyota 2011, Ram 2013, Ford 2015, GM 2015), what tests it requires (Davis Dam, brake-fade, frontal-collision), why pre-J2807 ratings were inflated.
4. **`brake-controllers-explained.mdx`** — proportional vs time-delay controllers, integrated factory controllers, when state law requires trailer brakes (most states: 3,000 lbs+), wiring 7-pin connector, calibrating gain.
5. **`weight-distribution-hitches.mdx`** — when you need one (5,000 lbs+ trailer or 500 lbs+ tongue), how spring bars transfer weight to front axle, sway-control add-ons, head-and-shank vs round-bar designs, common installation mistakes.

Write each file with real, accurate content. Verify with manufacturer documentation or SAE spec where possible.

- [ ] **Step 2: Verify all 5 build**

```bash
npm run build 2>&1 | tail -30
```

Expected: build succeeds with the 5 guide pages generated (route handling comes in Task 18).

- [ ] **Step 3: Commit**

```bash
git add src/content/guides/ && git commit -m "feat: 5 cornerstone guides (GCWR, tongue weight, J2807, brake controllers, weight-distribution hitches)"
```

---

## Task 18: All page routes

**Files:** All under `src/pages/`. Replace any default index.

- [ ] **Step 1: Write `src/pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import { loadVehicles, loadBracketIndex } from '../lib/data-loader.ts';
import { formatLbs } from '../lib/capacity-utils.ts';
const makes = loadVehicles();
const brackets = loadBracketIndex();
const popularModels = makes.flatMap(m => m.models)
  .filter(m => m.indexable && m.bestTowLbsAllTime)
  .sort((a, b) => (b.bestTowLbsAllTime ?? 0) - (a.bestTowLbsAllTime ?? 0))
  .slice(0, 12);
---
<Base title="towrating.net — Verified US Vehicle Towing Capacities" description="Find the verified towing capacity of any US vehicle. Search by year, make, model, trim, or capacity bracket. Free to use, manufacturer-sourced data.">
  <section class="bg-brand-900 text-white">
    <div class="max-w-5xl mx-auto px-4 py-16 text-center">
      <h1 class="font-display text-5xl font-bold mb-4">Verified US towing capacities</h1>
      <p class="text-xl text-slate-300 mb-8">Look up max tow, payload, GCWR, and tongue weight for every truck, SUV, and crossover in the US — manufacturer-sourced and verified.</p>
    </div>
  </section>
  <section class="max-w-5xl mx-auto px-4 py-12">
    <h2 class="font-display text-3xl font-semibold mb-6">Browse by capacity</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      {brackets.map(b => (
        <a href={`/tow-by-capacity/${b.lbs}/`} class="rounded-lg border border-slate-200 bg-white p-5 text-center hover:border-accent-500 transition">
          <div class="font-display text-2xl font-bold text-brand-900">{b.lbs.toLocaleString()}</div>
          <div class="text-xs text-slate-500 uppercase tracking-wide mt-1">lbs</div>
        </a>
      ))}
    </div>
  </section>
  <section class="max-w-5xl mx-auto px-4 py-12">
    <h2 class="font-display text-3xl font-semibold mb-6">Top tow vehicles</h2>
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {popularModels.map(m => (
        <a href={`/${m.makeSlug}/${m.modelSlug}/`} class="block rounded-lg border border-slate-200 bg-white p-5 hover:border-accent-500 hover:shadow-sm transition">
          <div class="font-display font-semibold text-brand-900 text-lg">{m.makeLabel} {m.modelLabel}</div>
          <div class="text-sm text-slate-600 capitalize">{m.vehicleClass}</div>
          <div class="text-accent-600 font-bold mt-2">Up to {formatLbs(m.bestTowLbsAllTime)}</div>
        </a>
      ))}
    </div>
  </section>
</Base>
```

- [ ] **Step 2: Write make/model/year/trim dynamic routes**

`src/pages/[make]/index.astro`:

```astro
---
import MakeHub from '../../layouts/MakeHub.astro';
import { loadVehicles } from '../../lib/data-loader.ts';
export async function getStaticPaths() {
  const makes = loadVehicles();
  return makes.map(make => ({ params: { make: make.makeSlug }, props: { make } }));
}
const { make } = Astro.props;
---
<MakeHub make={make} />
```

`src/pages/[make]/[model]/index.astro`:

```astro
---
import ModelHub from '../../../layouts/ModelHub.astro';
import { loadVehicles } from '../../../lib/data-loader.ts';
export async function getStaticPaths() {
  const makes = loadVehicles();
  return makes.flatMap(make => make.models.map(model => ({
    params: { make: make.makeSlug, model: model.modelSlug },
    props: { model },
  })));
}
const { model } = Astro.props;
---
<ModelHub model={model} />
```

`src/pages/[make]/[model]/[year]/index.astro`:

```astro
---
import YearPage from '../../../../layouts/YearPage.astro';
import { loadVehicles } from '../../../../lib/data-loader.ts';
export async function getStaticPaths() {
  const makes = loadVehicles();
  const out = [];
  for (const make of makes) for (const model of make.models) {
    const years = model.years.sort((a, b) => a.year - b.year);
    for (let i = 0; i < years.length; i++) {
      const y = years[i];
      const sameClass = make.models.filter(m => m.vehicleClass === model.vehicleClass && m.modelSlug !== model.modelSlug).slice(0, 3).map(m => m.modelSlug);
      out.push({
        params: { make: make.makeSlug, model: model.modelSlug, year: String(y.year) },
        props: { model, year: y, siblingMakeClass: sameClass, prevYear: years[i - 1]?.year ?? null, nextYear: years[i + 1]?.year ?? null },
      });
    }
  }
  return out;
}
const { model, year, siblingMakeClass, prevYear, nextYear } = Astro.props;
---
<YearPage model={model} year={year} siblingMakeClass={siblingMakeClass} prevYear={prevYear} nextYear={nextYear} />
```

`src/pages/[make]/[model]/[year]/[trim].astro`:

```astro
---
import TrimPage from '../../../../layouts/TrimPage.astro';
import { loadVehicles, loadBracketIndex } from '../../../../lib/data-loader.ts';
import { assignBracket } from '../../../../lib/capacity-utils.ts';
export async function getStaticPaths() {
  const makes = loadVehicles();
  const brackets = loadBracketIndex();
  const out = [];
  for (const make of makes) for (const model of make.models) {
    const years = model.years.sort((a, b) => a.year - b.year);
    for (let i = 0; i < years.length; i++) {
      const y = years[i];
      // skip pseudo-base wiki-derived single-trim — only ship multi-trim hero years
      if (y.trims.length < 2) continue;
      const sameClass = make.models.filter(m => m.vehicleClass === model.vehicleClass && m.modelSlug !== model.modelSlug).slice(0, 3).map(m => m.modelSlug);
      for (const trim of y.trims) {
        const bracket = assignBracket(trim.specs.maxTowLbs ?? 0);
        const altBracket = bracket && brackets.find(b => b.lbs === bracket.lbs);
        const alternates = altBracket?.vehicles
          .filter(v => v.makeSlug !== make.makeSlug)
          .slice(0, 3)
          .map(v => ({ makeSlug: v.makeSlug, modelSlug: v.modelSlug, year: v.year, label: `${v.makeSlug.replace(/-/g, ' ')} ${v.modelSlug.replace(/-/g, ' ')}`, maxTowLbs: v.maxTowLbs })) ?? [];
        out.push({
          params: { make: make.makeSlug, model: model.modelSlug, year: String(y.year), trim: trim.trimSlug },
          props: { model, year: y, trim, siblingMakeClass: sameClass, alternates, prevYear: years[i - 1]?.year ?? null, nextYear: years[i + 1]?.year ?? null },
        });
      }
    }
  }
  return out;
}
const { model, year, trim, siblingMakeClass, alternates, prevYear, nextYear } = Astro.props;
---
<TrimPage model={model} year={year} trim={trim} siblingMakeClass={siblingMakeClass} alternates={alternates} prevYear={prevYear} nextYear={nextYear} />
```

- [ ] **Step 3: Write capacity / type / use-case / guide routes**

`src/pages/tow-by-capacity/index.astro`:

```astro
---
import Base from '../../layouts/Base.astro';
import { loadBracketIndex } from '../../lib/data-loader.ts';
const brackets = loadBracketIndex();
---
<Base title="Tow by Capacity — Vehicles Sorted by Max Tow Rating" description="Find vehicles that can tow your specific trailer weight. Browse trucks, SUVs, and crossovers grouped into 8 capacity brackets from 3,500 lbs to 30,000+ lbs.">
  <section class="max-w-5xl mx-auto px-4 py-12">
    <h1 class="font-display text-4xl font-bold text-brand-900 mb-6">Tow capacity brackets</h1>
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {brackets.map(b => (
        <a href={`/tow-by-capacity/${b.lbs}/`} class="rounded-lg border border-slate-200 bg-white p-5 hover:border-accent-500">
          <div class="font-display text-2xl font-bold">{b.lbs.toLocaleString()} lbs</div>
          <div class="text-sm text-slate-600 mt-1">{b.label}</div>
          <div class="text-xs text-slate-500 mt-2">{b.vehicles.length} vehicles</div>
        </a>
      ))}
    </div>
  </section>
</Base>
```

`src/pages/tow-by-capacity/[lbs].astro`:

```astro
---
import CapacityBracket from '../../layouts/CapacityBracket.astro';
import { loadBracketIndex } from '../../lib/data-loader.ts';
export async function getStaticPaths() {
  const brackets = loadBracketIndex();
  return brackets.map(b => ({ params: { lbs: String(b.lbs) }, props: { bracket: b } }));
}
const { bracket } = Astro.props;
---
<CapacityBracket bracket={bracket} />
```

`src/pages/tow-by-vehicle-type/index.astro`:

```astro
---
import Base from '../../layouts/Base.astro';
const types = ['truck', 'suv', 'minivan', 'sedan', 'crossover'];
---
<Base title="Tow by Vehicle Type" description="Browse towing capacity by vehicle class — trucks, SUVs, crossovers, minivans, sedans.">
  <section class="max-w-5xl mx-auto px-4 py-12">
    <h1 class="font-display text-4xl font-bold mb-6">Browse by vehicle type</h1>
    <ul class="grid sm:grid-cols-3 gap-4">
      {types.map(t => <li><a class="block rounded-lg border border-slate-200 p-5 capitalize hover:border-accent-500" href={`/tow-by-vehicle-type/${t}/`}>{t}s</a></li>)}
    </ul>
  </section>
</Base>
```

`src/pages/tow-by-vehicle-type/[type].astro`:

```astro
---
import VehicleTypeHub from '../../layouts/VehicleTypeHub.astro';
import { loadVehicles } from '../../lib/data-loader.ts';
export async function getStaticPaths() {
  const makes = loadVehicles();
  const TYPES = ['truck', 'suv', 'minivan', 'sedan', 'crossover'];
  return TYPES.map(type => {
    const vehicles = makes.flatMap(m => m.models).filter(md => md.vehicleClass === type && md.indexable).flatMap(md => {
      const bestYear = md.years.sort((a, b) => (b.bestTowLbs ?? 0) - (a.bestTowLbs ?? 0))[0];
      return bestYear ? [{ makeSlug: md.makeSlug, modelSlug: md.modelSlug, year: bestYear.year, bestTowLbs: bestYear.bestTowLbs ?? 0, modelLabel: md.modelLabel, makeLabel: md.makeLabel }] : [];
    }).sort((a, b) => b.bestTowLbs - a.bestTowLbs);
    return { params: { type }, props: { type, vehicles } };
  });
}
const { type, vehicles } = Astro.props;
---
<VehicleTypeHub type={type} vehicles={vehicles} />
```

`src/pages/tow/[crossroad].astro`:

```astro
---
import UseCaseCrossroad from '../../layouts/UseCaseCrossroad.astro';
import { loadVehicles } from '../../lib/data-loader.ts';

const TRAILER_LABELS = {
  'travel-trailer': 'travel trailer',
  'fifth-wheel': 'fifth-wheel',
  'boat': 'boat',
  'horse-trailer': 'horse trailer',
};
const CLASS_LABELS = {
  'half-ton': { label: 'half-ton truck', class: 'truck', minTow: 8000, maxTow: 13500 },
  'heavy-duty': { label: 'heavy-duty truck', class: 'truck', minTow: 13500, maxTow: 35000 },
  'suv': { label: 'SUV', class: 'suv', minTow: 5000, maxTow: 12000 },
  'crossover': { label: 'crossover', class: 'crossover', minTow: 1500, maxTow: 5500 },
};
const CROSSROADS = [
  { trailer: 'travel-trailer', cls: 'half-ton' },
  { trailer: 'travel-trailer', cls: 'heavy-duty' },
  { trailer: 'travel-trailer', cls: 'suv' },
  { trailer: 'fifth-wheel', cls: 'heavy-duty' },
  { trailer: 'fifth-wheel', cls: 'half-ton' },
  { trailer: 'boat', cls: 'half-ton' },
  { trailer: 'boat', cls: 'suv' },
  { trailer: 'boat', cls: 'crossover' },
  { trailer: 'horse-trailer', cls: 'half-ton' },
  { trailer: 'horse-trailer', cls: 'heavy-duty' },
];

export async function getStaticPaths() {
  const makes = loadVehicles();
  return CROSSROADS.map(({ trailer, cls }) => {
    const cInfo = CLASS_LABELS[cls];
    const vehicles = makes.flatMap(m => m.models).filter(md => md.vehicleClass === cInfo.class && md.indexable).flatMap(md => {
      const bestYear = md.years.find(y => (y.bestTowLbs ?? 0) >= cInfo.minTow && (y.bestTowLbs ?? 0) <= cInfo.maxTow);
      return bestYear ? [{ makeSlug: md.makeSlug, modelSlug: md.modelSlug, year: bestYear.year, maxTowLbs: bestYear.bestTowLbs ?? 0 }] : [];
    }).sort((a, b) => b.maxTowLbs - a.maxTowLbs).slice(0, 20);
    return {
      params: { crossroad: `${trailer}-with-${cls}` },
      props: {
        crossroad: {
          slug: `${trailer}-with-${cls}`,
          trailer, vehicleClass: cInfo.class,
          trailerLabel: TRAILER_LABELS[trailer], classLabel: cInfo.label,
          vehicles,
        },
      },
    };
  });
}
const { crossroad } = Astro.props;
---
<UseCaseCrossroad crossroad={crossroad} />
```

`src/pages/guide/index.astro`:

```astro
---
import Base from '../../layouts/Base.astro';
import { getCollection } from 'astro:content';
const guides = await getCollection('guides');
---
<Base title="Towing Guides" description="Evergreen guides covering GCWR, tongue weight, brake controllers, weight-distribution hitches, and the SAE J2807 standard.">
  <section class="max-w-3xl mx-auto px-4 py-12">
    <h1 class="font-display text-4xl font-bold mb-6">Towing guides</h1>
    <ul class="space-y-3">
      {guides.map(g => (
        <li class="rounded-lg border border-slate-200 bg-white p-5 hover:border-accent-500">
          <a href={`/guide/${g.id}/`}>
            <div class="font-display font-semibold text-brand-900 text-lg">{g.data.title}</div>
            <div class="text-sm text-slate-600 mt-1">{g.data.description}</div>
          </a>
        </li>
      ))}
    </ul>
  </section>
</Base>
```

`src/pages/guide/[...slug].astro`:

```astro
---
import GuideArticle from '../../layouts/GuideArticle.astro';
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  const guides = await getCollection('guides');
  return guides.map(g => ({ params: { slug: g.id }, props: { guide: g } }));
}
const { guide } = Astro.props;
const { Content } = await render(guide);
---
<GuideArticle title={guide.data.title} description={guide.data.description} slug={guide.id} publishDate={guide.data.publishDate}>
  <Content />
</GuideArticle>
```

- [ ] **Step 4: Write `src/pages/affiliate-disclosure.astro`**

```astro
---
import Base from '../layouts/Base.astro';
---
<Base title="Affiliate Disclosure — towrating.net" description="Disclosure of affiliate relationships on towrating.net.">
  <article class="max-w-3xl mx-auto px-4 py-12 prose prose-slate">
    <h1>Affiliate disclosure</h1>
    <p>towrating.net is reader-supported. When you click certain product links, we may earn a commission at no additional cost to you. These links are clearly marked as <strong>Sponsored</strong> in our content.</p>
    <p>Our partner programs include Amazon Associates, CarGurus, TrueCar, eTrailer, MoneyGeek, and CarShield. We receive a small fee when you complete a purchase or qualified action through these partners.</p>
    <p>Affiliate compensation does <em>not</em> influence which products or vehicles we recommend. Towing-capacity ratings are sourced from manufacturer brochures and Wikipedia and are independent of any commercial relationship.</p>
    <h2>FTC compliance</h2>
    <p>Per Federal Trade Commission guidelines, we disclose all material connections with merchants. All sponsored links use <code>rel="sponsored"</code> per Google webmaster guidelines.</p>
  </article>
</Base>
```

- [ ] **Step 5: Build and confirm pages render**

```bash
npm run build 2>&1 | tail -30
```

Expected: build succeeds. Page count should be 1,200+ (depends on Wikipedia scrape result).

- [ ] **Step 6: Commit**

```bash
git add src/pages/ && git commit -m "feat: all dynamic routes (make/model/year/trim, capacity, type, use-case, guide, disclosure)"
```

---

## Task 19: OG image route

**Files:** `src/pages/og/[...slug].png.ts`

- [ ] **Step 1: Write the route**

```typescript
import type { APIRoute } from 'astro';
import { ImageResponse } from '@vercel/og';

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug ?? '';
  // best-effort: derive title from slug
  const title = decodeURIComponent(String(slug)).replace(/\//g, ' › ').replace(/-/g, ' ');
  const html = {
    type: 'div',
    props: {
      style: {
        width: '1200px', height: '630px',
        background: 'linear-gradient(135deg, #0a1628 0%, #1f3457 100%)',
        color: '#fff',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '60px',
        fontFamily: 'sans-serif',
      },
      children: [
        { type: 'div', props: { style: { fontSize: 32, color: '#f59e0b', fontWeight: 700 }, children: 'towrating.net' } },
        { type: 'div', props: { style: { fontSize: 64, fontWeight: 700, lineHeight: 1.1, textTransform: 'capitalize' }, children: title } },
        { type: 'div', props: { style: { fontSize: 28, color: '#cbd5e1' }, children: 'Verified US towing capacities' } },
      ],
    },
  };
  return new ImageResponse(html as any, { width: 1200, height: 630 });
};

export async function getStaticPaths() {
  // Pre-render OG images for hub pages only at build time; spokes can use a fallback
  return [
    { params: { slug: undefined } },
    { params: { slug: 'tow-by-capacity' } },
    { params: { slug: 'tow-by-vehicle-type' } },
    { params: { slug: 'guide' } },
  ];
}
```

Note: `@vercel/og` works at the edge but not in Astro static builds for arbitrary slug paths. For Phase 1 use a pre-generated default OG image instead (simpler + works in static build). Override per-page only for hubs.

Pragmatic approach: write `public/og-default.png` as a 1200×630 image (use a placeholder generation script), and update `Base.astro` to fall back to it.

- [ ] **Step 2: Generate the default OG image**

Create `scripts/build-default-og.mjs`:

```javascript
import { ImageResponse } from '@vercel/og';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const html = {
  type: 'div',
  props: {
    style: {
      width: '1200px', height: '630px',
      background: 'linear-gradient(135deg, #0a1628 0%, #1f3457 100%)',
      color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: '60px', fontFamily: 'sans-serif',
    },
    children: [
      { type: 'div', props: { style: { fontSize: 36, color: '#f59e0b', fontWeight: 700 }, children: 'towrating.net' } },
      { type: 'div', props: { style: { fontSize: 80, fontWeight: 700, lineHeight: 1.1 }, children: 'Verified US towing capacities' } },
      { type: 'div', props: { style: { fontSize: 28, color: '#cbd5e1' }, children: 'Max tow · Payload · GCWR · Tongue weight · Hitch class' } },
    ],
  },
};
const img = new ImageResponse(html, { width: 1200, height: 630 });
const buf = Buffer.from(await img.arrayBuffer());
writeFileSync(resolve('public/og-default.png'), buf);
console.log('Wrote public/og-default.png');
```

Run: `node scripts/build-default-og.mjs`

- [ ] **Step 3: Update Base.astro fallback**

In `src/layouts/Base.astro` change the `og` line:

```javascript
const og = ogImage ?? 'https://towrating.net/og-default.png';
```

- [ ] **Step 4: Delete the dynamic OG route file (defer to Phase 2)**

```bash
rm -f src/pages/og/[...slug].png.ts
rmdir src/pages/og 2>/dev/null || true
```

- [ ] **Step 5: Commit**

```bash
git add public/og-default.png scripts/build-default-og.mjs src/layouts/Base.astro && git commit -m "feat: default OG image (per-page deferred to Phase 2)"
```

---

## Task 20: robots.txt + llms.txt + ai.txt + IndexNow key

**Files:** `public/robots.txt`, `public/llms.txt`, `public/ai.txt`, `public/{indexnow-key}.txt`

- [ ] **Step 1: Write `public/robots.txt`**

```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: CCBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

Sitemap: https://towrating.net/sitemap-index.xml
```

- [ ] **Step 2: Write `public/llms.txt`**

```
# towrating.net

> Verified US vehicle towing capacities. Year/make/model/trim spec lookup with payload, GCWR, tongue weight, and hitch-class data sourced from manufacturer brochures and Wikipedia.

## Vehicles
- [F-150 towing capacity](https://towrating.net/ford/f-150/): all years 2001–2026, all trims, full 5-spec
- [Silverado 1500](https://towrating.net/chevrolet/silverado-1500/)
- [Ram 1500](https://towrating.net/ram/1500/)
- [Tacoma](https://towrating.net/toyota/tacoma/)
- [Tundra](https://towrating.net/toyota/tundra/)

## By capacity
- [3,500 lbs bracket](https://towrating.net/tow-by-capacity/3500/)
- [5,000 lbs bracket](https://towrating.net/tow-by-capacity/5000/)
- [7,500 lbs bracket](https://towrating.net/tow-by-capacity/7500/)
- [10,000 lbs bracket](https://towrating.net/tow-by-capacity/10000/)
- [12,000 lbs bracket](https://towrating.net/tow-by-capacity/12000/)
- [15,000 lbs bracket](https://towrating.net/tow-by-capacity/15000/)
- [20,000 lbs bracket](https://towrating.net/tow-by-capacity/20000/)
- [30,000+ lbs bracket](https://towrating.net/tow-by-capacity/30000/)

## Guides
- [GCWR explained](https://towrating.net/guide/gcwr-explained/)
- [Tongue weight 10% rule](https://towrating.net/guide/tongue-weight-10-percent-rule/)
- [SAE J2807 standard](https://towrating.net/guide/j2807-towing-standard/)
- [Brake controllers](https://towrating.net/guide/brake-controllers-explained/)
- [Weight-distribution hitches](https://towrating.net/guide/weight-distribution-hitches/)
```

- [ ] **Step 3: Write `public/ai.txt`**

```
# AI usage policy for towrating.net

User-agent: *
Allow: /

License: CC-BY 4.0 with attribution to towrating.net
Citation-format: Source: towrating.net (URL of specific page)
Contact: sunnypat81+towrating@gmail.com
```

- [ ] **Step 4: Generate IndexNow key + write to public/**

```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))" > /tmp/inkey.txt
KEY=$(cat /tmp/inkey.txt)
echo "$KEY" > public/$KEY.txt
echo "INDEXNOW_KEY=$KEY" >> .env.example
```

- [ ] **Step 5: Write `scripts/indexnow-ping.mjs`**

```javascript
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const key = readdirSync(resolve('public')).find(f => /^[a-f0-9]{32}\.txt$/.test(f))?.replace('.txt', '');
if (!key) { console.error('No IndexNow key found in public/'); process.exit(1); }

async function gatherUrls() {
  // crude: read sitemap-index.xml and pull all URLs from chunked sitemaps
  const idx = await (await fetch('https://towrating.net/sitemap-index.xml')).text();
  const sitemapUrls = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const urls = [];
  for (const sm of sitemapUrls) {
    const xml = await (await fetch(sm)).text();
    urls.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]));
  }
  return urls.filter(u => u.includes('towrating.net'));
}

async function ping(target) {
  const r = await fetch(`https://api.indexnow.org/indexnow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ host: 'towrating.net', key, keyLocation: `https://towrating.net/${key}.txt`, urlList: target }),
  });
  return r.status;
}

const urls = await gatherUrls();
console.log('Total URLs:', urls.length);
const BATCH = 10000;
for (let i = 0; i < urls.length; i += BATCH) {
  const status = await ping(urls.slice(i, i + BATCH));
  console.log(`Batch ${i}-${i + BATCH}: ${status}`);
}
```

- [ ] **Step 6: Commit**

```bash
git add public/robots.txt public/llms.txt public/ai.txt public/*.txt scripts/indexnow-ping.mjs .env.example && git commit -m "feat: robots, llms.txt, ai.txt, IndexNow key + ping script"
```

---

## Task 21: Crawl-graph check script

**Files:** `scripts/crawl-graph-check.mjs`

- [ ] **Step 1: Write the script**

```javascript
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';

const DIST = resolve('dist');
const MAX_DEPTH = 4;

function findHtml(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) findHtml(p, out);
    else if (p.endsWith('.html')) out.push(p);
  }
  return out;
}

function pathToUrl(p) {
  return '/' + p.replace(DIST + '/', '').replace(/\\/g, '/').replace(/index\.html$/, '').replace(/\.html$/, '/');
}

function extractLinks(html) {
  const matches = [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
  return matches.filter(h => h.startsWith('/') && !h.startsWith('//') && !h.includes('og-default') && !h.includes('.png') && !h.includes('.xml') && !h.includes('.txt'));
}

function isIndexable(html) {
  return !html.includes('content="noindex');
}

const files = findHtml(DIST);
const graph = new Map();
for (const f of files) {
  const html = readFileSync(f, 'utf8');
  if (!isIndexable(html)) continue;
  const url = pathToUrl(f);
  graph.set(url, extractLinks(html));
}

console.log(`Indexable pages: ${graph.size}`);

// BFS from /
const visited = new Map([['/', 0]]);
const queue = ['/'];
while (queue.length) {
  const cur = queue.shift();
  const depth = visited.get(cur);
  if (depth >= MAX_DEPTH) continue;
  for (const link of graph.get(cur) ?? []) {
    const norm = link.endsWith('/') ? link : link + '/';
    if (!visited.has(norm) && graph.has(norm)) {
      visited.set(norm, depth + 1);
      queue.push(norm);
    }
  }
}

const unreachable = [...graph.keys()].filter(u => !visited.has(u));
console.log(`Reachable within ${MAX_DEPTH} clicks: ${visited.size}`);
console.log(`UNREACHABLE: ${unreachable.length}`);
if (unreachable.length > 0) {
  console.log('First 20 unreachable:');
  for (const u of unreachable.slice(0, 20)) console.log('  ', u);
  process.exit(1);
}
```

- [ ] **Step 2: Run after build**

```bash
npm run build && npm run crawl-check
```

Expected: prints reachable count, exits 0. If pages unreachable: failure case to fix.

- [ ] **Step 3: Commit**

```bash
git add scripts/crawl-graph-check.mjs && git commit -m "feat: crawl-graph check (max depth 4 from home)"
```

---

## Task 22: Pre-completion validation gate

This is the gate from `pre-completion-validation`. Run all checks; fix any failures.

- [ ] **Step 1: Build production**

```bash
cd /c/Users/sunny/Desktop/towrating
npm run data:all
npm run build
```

Expected: build succeeds, dist/ contains 1,200+ HTML pages.

- [ ] **Step 2: Run crawl-graph check**

```bash
npm run crawl-check
```

Expected: zero unreachable pages.

- [ ] **Step 3: Run all unit tests**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 4: Local Lighthouse on 5 templates**

```bash
npm install -g lighthouse 2>&1 | tail -3
npm run preview &
sleep 4
lighthouse http://localhost:4321/ --quiet --output=json --output-path=/tmp/lh-home.json --chrome-flags="--headless --no-sandbox"
lighthouse http://localhost:4321/ford/f-150/ --quiet --output=json --output-path=/tmp/lh-model.json --chrome-flags="--headless --no-sandbox"
lighthouse http://localhost:4321/ford/f-150/2024/ --quiet --output=json --output-path=/tmp/lh-year.json --chrome-flags="--headless --no-sandbox"
lighthouse http://localhost:4321/tow-by-capacity/10000/ --quiet --output=json --output-path=/tmp/lh-bracket.json --chrome-flags="--headless --no-sandbox"
lighthouse http://localhost:4321/guide/gcwr-explained/ --quiet --output=json --output-path=/tmp/lh-guide.json --chrome-flags="--headless --no-sandbox"
node -e "
for (const f of ['home', 'model', 'year', 'bracket', 'guide']) {
  const r = JSON.parse(require('fs').readFileSync('/tmp/lh-' + f + '.json'));
  const s = r.categories;
  console.log(f, 'P:', Math.round(s.performance.score * 100), 'A:', Math.round(s.accessibility.score * 100), 'BP:', Math.round(s['best-practices'].score * 100), 'SEO:', Math.round(s.seo.score * 100));
}
"
kill %1
```

Expected: all 4 categories ≥95 on all 5 templates. If any score below 95, identify failing audits and fix before proceeding.

- [ ] **Step 5: Run `/semantic-audit` skill on 5 sampled pages**

In a separate Claude session OR via slash command, run `/semantic-audit` on:
- 1 hero trim page (e.g. `/ford/f-150/2024/xlt-3-5l-ecoboost-v6-4x4-max-tow/`)
- 1 Wikipedia-derived year page (any non-hero make)
- 1 capacity bracket hub
- 1 cornerstone guide
- The home page

Each must score ≥85. Iterate fixes until passing (this is the autoresearch quality loop).

- [ ] **Step 6: Validate schema with Rich Results Test**

Open https://search.google.com/test/rich-results and paste the rendered HTML (or URL once deployed) of:
- Home (`Organization` if present)
- Trim page (`Vehicle`, `Product`, `BreadcrumbList`, `FAQPage`, `ItemList`)
- Guide page (`Article`, `BreadcrumbList`)
- Bracket page (`CollectionPage`, `BreadcrumbList`)
- Make hub (`CollectionPage`, `BreadcrumbList`)

All must validate without errors.

- [ ] **Step 7: Commit any fixes from validation**

```bash
git add -A && git commit -m "fix: pre-completion validation fixes (lighthouse/semantic-audit/rich-results)"
```

---

## Task 23: GitHub repo + push

- [ ] **Step 1: Create the GitHub repo**

```bash
gh repo create sunnyp81/towrating --public --description "towrating.net — verified US vehicle towing capacities" --source=/c/Users/sunny/Desktop/towrating --remote=origin
```

Expected: repo created, origin remote added.

- [ ] **Step 2: Push**

```bash
cd /c/Users/sunny/Desktop/towrating && git push -u origin master
```

Expected: push succeeds.

---

## Task 24: Deploy to Cloudflare Pages

- [ ] **Step 1: Confirm Wrangler is authenticated**

```bash
npx wrangler whoami
```

Expected: prints `sunnypat81@gmail.com` account email. If not, run `npx wrangler login` (note: this is interactive; surface to Sunny if so).

- [ ] **Step 2: Create CF Pages project + deploy**

```bash
cd /c/Users/sunny/Desktop/towrating
npx wrangler pages project create towrating --production-branch=master --compatibility-date=2025-01-01
npx wrangler pages deploy dist --project-name towrating --branch=master --commit-dirty=true
```

Expected: deploy succeeds, prints preview URL like `https://[hash].towrating.pages.dev`.

- [ ] **Step 3: Smoke-test the preview URL with Playwright MCP**

Use `mcp__playwright__browser_navigate` to:
- Load the preview home — capture screenshot, check console errors
- Load `/ford/f-150/2024/` — verify renders, check schema in `<head>`
- Load `/tow-by-capacity/10000/` — verify renders
- Load `/guide/gcwr-explained/` — verify renders

Expected: no console errors, all pages render.

- [ ] **Step 4: Note preview URL for the report**

Record the preview URL — DNS cutover is deferred per spec.

---

## Task 25: GSC + Bing setup, sitemap submit, IndexNow ping

- [ ] **Step 1: Add property on `gsc-sunnypat81`**

Use the GSC MCP tool:

```
mcp__gsc-sunnypat81__add_site
  siteUrl: https://towrating.net/
```

Expected: site added (verification will require DNS or HTML tag — Sunny does this at DNS cutover).

- [ ] **Step 2: Add property on Bing Webmaster**

```
mcp__bing-webmaster__add_site
  siteUrl: https://towrating.net/
```

- [ ] **Step 3: Submit sitemap (will succeed once DNS is live; may queue otherwise)**

```
mcp__gsc-sunnypat81__submit_sitemap
  siteUrl: https://towrating.net/
  feedpath: https://towrating.net/sitemap-index.xml
```

```
mcp__bing-webmaster__submit_sitemap
  siteUrl: https://towrating.net/
  feedUrl: https://towrating.net/sitemap-index.xml
```

- [ ] **Step 4: Run IndexNow ping (after DNS — defer if not live)**

```bash
npm run indexnow
```

If DNS is live: confirms 200 status. If preview URL only: skip and note for handoff.

- [ ] **Step 5: Final commit + push**

```bash
git add -A && git commit -m "chore: sitemap submitted, search-engine properties registered" --allow-empty
git push
```

---

## Phase 1 Done — Reporting

After Task 25 completes, report back to the user with:

1. Domain: towrating.net
2. GitHub repo URL: `https://github.com/sunnyp81/towrating`
3. CF Pages preview URL
4. Final page count (from `data/quality-flags.json`)
5. Hero models curated: 20 (list)
6. Models stubbed (`noindex,follow`): N (from quality-flags totals — `trims - indexable`)
7. Deviations from brief (none expected — all spec items mapped)
8. Owner TODO list:
   - DNS cutover from registrar to Cloudflare Pages
   - Verify GSC + Bing properties (DNS or HTML tag)
   - Set affiliate-ID env vars in CF Pages dashboard once partner accounts active
   - Re-run `npm run indexnow` after DNS cutover
   - 14-day post-launch LLM citation test: ChatGPT search "2022 Ford F-150 EcoBoost 3.5 max tow capacity"
