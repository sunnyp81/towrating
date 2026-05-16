#!/usr/bin/env node
/**
 * Dead-link checker for towrating.org
 * Two modes:
 *   --local   Scans dist/ for internal links pointing to non-existent pages (fast, post-build)
 *   --live    Samples N pages from sitemap and HEAD-checks all internal links (for cron/Hermes)
 *
 * Usage:
 *   node scripts/dead-link-check.mjs --local
 *   node scripts/dead-link-check.mjs --live --sample 200
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const args = process.argv.slice(2);
const mode = args.includes('--live') ? 'live' : 'local';
const sampleSize = parseInt(args[args.indexOf('--sample') + 1] || '200', 10);
const SITE = 'https://towrating.org';
const DIST = resolve('dist');

// ─── LOCAL MODE: scan dist/ for broken internal hrefs ───
function localCheck() {
  const pages = new Set();
  const broken = [];

  function walk(dir) {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (p.endsWith('.html')) {
        const rel = '/' + p.replace(/\\/g, '/').split('/dist/')[1].replace(/index\.html$/, '').replace(/\.html$/, '/');
        pages.add(rel);
      }
    }
  }

  if (!existsSync(DIST)) {
    console.error('No dist/ found — run `npm run build` first.');
    process.exit(1);
  }

  walk(DIST);
  console.log(`Pages in dist/: ${pages.size}`);

  function walkLinks(dir) {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) walkLinks(p);
      else if (p.endsWith('.html')) {
        const html = readFileSync(p, 'utf8');
        const source = '/' + p.replace(/\\/g, '/').split('/dist/')[1].replace(/index\.html$/, '').replace(/\.html$/, '/');
        const links = [...html.matchAll(/href="(\/[^"#?]+)"/g)].map(m => m[1]);
        for (const link of links) {
          const norm = link.endsWith('/') ? link : link + '/';
          if (norm.includes('.xml') || norm.includes('.txt') || norm.includes('.png') || norm.includes('.svg') || norm.includes('.css') || norm.includes('.js') || norm.includes('_astro')) continue;
          if (!pages.has(norm)) {
            broken.push({ source, target: norm });
          }
        }
      }
    }
  }

  walkLinks(DIST);

  const unique = [...new Map(broken.map(b => [b.target, b])).values()];
  console.log(`Broken internal links: ${unique.length}`);
  if (unique.length > 0) {
    console.log('\nTop 50 broken targets:');
    const counts = {};
    for (const b of broken) counts[b.target] = (counts[b.target] || 0) + 1;
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 50);
    for (const [target, count] of sorted) {
      console.log(`  ${target}  (linked from ${count} page${count > 1 ? 's' : ''})`);
    }
    process.exit(1);
  }
  console.log('No broken internal links found.');
}

// ─── LIVE MODE: fetch sitemap, sample pages, HEAD-check linked URLs ───
async function liveCheck() {
  const sitemapUrl = `${SITE}/sitemap-index.xml`;
  console.log(`Fetching sitemap index: ${sitemapUrl}`);

  const indexRes = await fetch(sitemapUrl);
  if (!indexRes.ok) { console.error(`Sitemap fetch failed: ${indexRes.status}`); process.exit(1); }
  const indexXml = await indexRes.text();

  const sitemapUrls = [...indexXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  let allPages = [];
  for (const smUrl of sitemapUrls) {
    const res = await fetch(smUrl);
    if (!res.ok) continue;
    const xml = await res.text();
    allPages.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]));
  }

  console.log(`Total URLs in sitemap: ${allPages.length}`);

  // Shuffle and sample
  for (let i = allPages.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allPages[i], allPages[j]] = [allPages[j], allPages[i]];
  }
  const sample = allPages.slice(0, sampleSize);
  console.log(`Sampling ${sample.length} pages for internal links...`);

  const broken = [];
  const checked = new Set();
  let pagesDone = 0;

  for (const pageUrl of sample) {
    pagesDone++;
    if (pagesDone % 50 === 0) console.log(`  ...checked ${pagesDone}/${sample.length} pages`);

    let html;
    try {
      const res = await fetch(pageUrl);
      if (!res.ok) { broken.push({ source: pageUrl, target: pageUrl, status: res.status }); continue; }
      html = await res.text();
    } catch { continue; }

    const links = [...html.matchAll(/href="(\/[^"#?]+)"/g)].map(m => m[1]);
    for (const link of links) {
      const norm = link.endsWith('/') ? link : link + '/';
      const fullUrl = SITE + norm;
      if (checked.has(fullUrl)) continue;
      checked.add(fullUrl);

      if (norm.includes('.xml') || norm.includes('.txt') || norm.includes('.png')) continue;

      try {
        const headRes = await fetch(fullUrl, { method: 'HEAD', redirect: 'follow' });
        if (headRes.status >= 400) {
          broken.push({ source: pageUrl, target: fullUrl, status: headRes.status });
        }
      } catch (e) {
        broken.push({ source: pageUrl, target: fullUrl, status: 'ERR' });
      }
    }
  }

  console.log(`\nURLs checked: ${checked.size}`);
  console.log(`Broken links found: ${broken.length}`);

  if (broken.length > 0) {
    console.log('\nBroken links:');
    for (const b of broken.slice(0, 100)) {
      console.log(`  [${b.status}] ${b.target}`);
      console.log(`       ← ${b.source}`);
    }
    process.exit(1);
  }
  console.log('All sampled internal links resolve.');
}

if (mode === 'local') localCheck();
else liveCheck();
