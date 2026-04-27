import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const key = readdirSync(resolve('public')).find(f => /^[a-f0-9]{32}\.txt$/.test(f))?.replace('.txt', '');
if (!key) { console.error('No IndexNow key found in public/'); process.exit(1); }

async function gatherUrls() {
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
