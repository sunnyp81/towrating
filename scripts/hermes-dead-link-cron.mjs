#!/usr/bin/env node
/**
 * Hermes cron: dead-link checker for towrating.org
 * Samples pages from sitemap, HEAD-checks all internal links.
 * Outputs a summary suitable for Telegram delivery.
 *
 * Run: node hermes-dead-link-cron.mjs
 * Schedule: weekly (e.g. Wednesday 14:00)
 */
const SITE = 'https://towrating.org';
const SAMPLE_SIZE = 300;

async function run() {
  const indexRes = await fetch(`${SITE}/sitemap-index.xml`);
  if (!indexRes.ok) {
    console.log(`TOWRATING DEAD-LINK CHECK: FAIL\nSitemap unreachable (${indexRes.status}). Site may be down.`);
    process.exit(1);
  }
  const indexXml = await indexRes.text();
  const sitemapUrls = [...indexXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

  let allPages = [];
  for (const smUrl of sitemapUrls) {
    const res = await fetch(smUrl);
    if (!res.ok) continue;
    const xml = await res.text();
    allPages.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]));
  }

  // Shuffle
  for (let i = allPages.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allPages[i], allPages[j]] = [allPages[j], allPages[i]];
  }
  const sample = allPages.slice(0, SAMPLE_SIZE);

  const broken = [];
  const checked = new Set();

  for (const pageUrl of sample) {
    let html;
    try {
      const res = await fetch(pageUrl);
      if (!res.ok) { broken.push({ target: pageUrl, status: res.status, source: 'sitemap' }); continue; }
      html = await res.text();
    } catch { continue; }

    const links = [...html.matchAll(/href="(\/[^"#?]+)"/g)].map(m => m[1]);
    for (const link of links) {
      const norm = link.endsWith('/') ? link : link + '/';
      const fullUrl = SITE + norm;
      if (checked.has(fullUrl)) continue;
      checked.add(fullUrl);
      if (/\.(xml|txt|png|svg|css|js|ico)/.test(norm) || norm.includes('_astro')) continue;

      try {
        const r = await fetch(fullUrl, { method: 'HEAD', redirect: 'follow' });
        if (r.status >= 400) broken.push({ target: fullUrl, status: r.status, source: pageUrl });
      } catch (e) {
        broken.push({ target: fullUrl, status: 'ERR', source: pageUrl });
      }
    }
  }

  // Output
  if (broken.length === 0) {
    console.log(`TOWRATING DEAD-LINK CHECK: PASS\nSampled ${sample.length} pages, checked ${checked.size} internal links. Zero 404s.`);
  } else {
    const lines = [`TOWRATING DEAD-LINK CHECK: ${broken.length} BROKEN`, `Sampled ${sample.length} pages, checked ${checked.size} links.\n`];
    const byTarget = {};
    for (const b of broken) byTarget[b.target] = (byTarget[b.target] || { status: b.status, sources: [] });
    for (const b of broken) byTarget[b.target].sources.push(b.source);
    const sorted = Object.entries(byTarget).sort((a, b) => b[1].sources.length - a[1].sources.length);
    for (const [target, info] of sorted.slice(0, 20)) {
      lines.push(`[${info.status}] ${target.replace(SITE, '')}`);
      lines.push(`  ← ${info.sources[0].replace(SITE, '')} (+${info.sources.length - 1} more)`);
    }
    if (sorted.length > 20) lines.push(`\n...and ${sorted.length - 20} more`);
    console.log(lines.join('\n'));
    process.exit(1);
  }
}

run();
