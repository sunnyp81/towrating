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
    // Save incremental progress every 100 models
    if (i % 100 === 0) {
      writeFileSync(resolve(DATA_DIR, 'wiki-tow.json'), JSON.stringify(out, null, 2));
    }
    await sleep(SLEEP);
  }
  writeFileSync(resolve(DATA_DIR, 'wiki-tow.json'), JSON.stringify(out, null, 2));
  console.log('Wrote', out.length, 'wiki-tow records');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
main().catch(e => { console.error(e); process.exit(1); });
