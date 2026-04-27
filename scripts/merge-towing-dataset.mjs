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

// Alias map: VPIC key -> hero key (for models whose names differ between datasets)
const HERO_ALIASES = {
  'chevrolet|silverado': 'chevrolet|silverado 1500',
  'chevrolet|silverado hd': 'chevrolet|silverado 2500hd',
  'ford|f-250': 'ford|f-250 super duty',
  'ford|f-350': 'ford|f-350 super duty',
  'gmc|sierra': 'gmc|sierra 1500',
};

const wikiByModel = new Map();
for (const w of wiki) wikiByModel.set(`${w.make.toLowerCase()}|${w.model.toLowerCase()}`, w);

const heroByModel = new Map();
for (const h of hero.models) {
  heroByModel.set(`${h.make.toLowerCase()}|${h.model.toLowerCase()}`, h);
}

function titleCase(s) {
  // Title-case makes/models. Preserve known acronymic brands.
  const PRESERVE_UPPER = new Set(['BMW', 'GMC', 'MG']);
  return s.split(/(\s+|-|\/)/).map(part => {
    if (/^\s+$|^[-/]$/.test(part)) return part;
    if (PRESERVE_UPPER.has(part.toUpperCase())) return part.toUpperCase();
    if (/^\d/.test(part)) return part; // keep "1500", "150" digits
    return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
  }).join('');
}

// Group VPIC by make+model
const grouped = new Map();
for (const r of vpic) {
  if (r.year < 2001) continue;
  const key = `${r.makeName.toLowerCase()}|${r.modelName.toLowerCase()}`;
  if (!grouped.has(key)) grouped.set(key, { makeName: titleCase(r.makeName), modelName: titleCase(r.modelName), years: new Map() });
  const g = grouped.get(key);
  if (!g.years.has(r.year)) g.years.set(r.year, []);
  g.years.get(r.year).push(r);
}

const makesIndex = new Map();
const trimCapacity = [];
const allTrimsForBracket = [];

for (const [key, g] of grouped.entries()) {
  const heroKey = HERO_ALIASES[key] ?? key;
  const heroRecord = heroByModel.get(heroKey);
  const wikiRecord = wikiByModel.get(key);
  const vehicleClass = classifyVehicleType(g.makeName, g.modelName);
  const makeSlug = buildModelSlug(g.makeName);
  const modelSlug = buildModelSlug(g.modelName);

  if (!makesIndex.has(makeSlug)) makesIndex.set(makeSlug, { makeSlug, makeLabel: g.makeName, models: [] });

  const years = [];
  for (const [year] of g.years.entries()) {
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
      const merged = mergeTrim(null, wikiRecord);
      const coverage = computeCoverage(merged.specs);
      trims = [{
        trimSlug: 'base', trimLabel: 'Base',
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

// Inject hero years that had no VPIC year slot (e.g. pre-2019 Silverado HD)
for (const h of hero.models) {
  const heroModelKey = `${h.make.toLowerCase()}|${h.model.toLowerCase()}`;
  // Find which VPIC key this hero model maps to (reverse alias lookup)
  const vpicKey = Object.entries(HERO_ALIASES).find(([, v]) => v === heroModelKey)?.[0] ?? heroModelKey;
  const makeSlug = buildModelSlug(h.make);
  // Resolve model slug: if there's a VPIC alias, use the VPIC model name's slug
  const vpicModelName = vpicKey.split('|')[1];
  const modelSlug = buildModelSlug(vpicModelName);
  const vehicleClass = classifyVehicleType(h.make, h.model);
  const wikiRecord = wikiByModel.get(heroModelKey) ?? wikiByModel.get(vpicKey);

  if (!makesIndex.has(makeSlug)) makesIndex.set(makeSlug, { makeSlug, makeLabel: h.make, models: [] });
  const makeEntry = makesIndex.get(makeSlug);

  let modelEntry = makeEntry.models.find(m => m.modelSlug === modelSlug);
  if (!modelEntry) {
    modelEntry = {
      modelSlug, modelLabel: h.model, makeSlug, makeLabel: h.make,
      vehicleClass, years: [], bestTowLbsAllTime: null,
      indexable: false, wikipediaUrl: wikiRecord?.wikiUrl ?? null,
    };
    makeEntry.models.push(modelEntry);
  }

  for (const hy of h.years) {
    if (modelEntry.years.find(y => y.year === hy.year)) continue; // already present
    const trims = hy.trims.map(t => {
      const trimSlug = buildModelSlug(t.trim);
      const merged = mergeTrim({ specs: t.specs }, null);
      const coverage = computeCoverage(merged.specs);
      const indexable = isIndexable(merged.specs);
      if (t.specs.maxTowLbs) {
        trimCapacity.push({ makeSlug, modelSlug, year: hy.year, trimSlug, maxTowLbs: t.specs.maxTowLbs, indexable, vehicleClass });
        allTrimsForBracket.push({ makeSlug, modelSlug, year: hy.year, trimSlug, maxTowLbs: t.specs.maxTowLbs, vehicleClass });
      }
      return {
        trimSlug, trimLabel: t.trim, drivetrain: t.drivetrain, engine: t.engine, curbWeightLbs: t.curbWeightLbs,
        specs: merged.specs, source: merged.source, sourceUrl: null,
        specCoverage: coverage, indexable,
      };
    });
    const bestTow = Math.max(0, ...trims.map(t => t.specs.maxTowLbs ?? 0));
    modelEntry.years.push({ year: hy.year, trims, bestTowLbs: bestTow || null, indexable: trims.some(t => t.indexable) });
  }

  // Recompute model-level aggregates
  const bestAll = Math.max(0, ...modelEntry.years.map(y => y.bestTowLbs ?? 0));
  modelEntry.bestTowLbsAllTime = bestAll || null;
  modelEntry.indexable = modelEntry.years.some(y => y.indexable);
}

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

const flags = {
  generatedAt: new Date().toISOString(),
  totals: { makes: vehicles.length, models: 0, years: 0, trims: 0, indexable: 0 },
};
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
