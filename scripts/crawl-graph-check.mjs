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
  // Normalise to forward slashes first so prefix stripping works on Windows + Unix
  const normP = p.replace(/\\/g, '/');
  const normDist = DIST.replace(/\\/g, '/');
  let rel = normP.startsWith(normDist) ? normP.slice(normDist.length) : normP;
  if (!rel.startsWith('/')) rel = '/' + rel;
  return rel.replace(/index\.html$/, '').replace(/\.html$/, '/');
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

// /404/ is a valid error page — intentionally not linked from navigation
const unreachable = [...graph.keys()].filter(u => !visited.has(u) && u !== '/404/');
console.log(`Reachable within ${MAX_DEPTH} clicks: ${visited.size}`);
console.log(`UNREACHABLE: ${unreachable.length}`);
if (unreachable.length > 0) {
  console.log('First 20 unreachable:');
  for (const u of unreachable.slice(0, 20)) console.log('  ', u);
  process.exit(1);
}
