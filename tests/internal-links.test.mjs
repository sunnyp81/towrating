import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSpokeLinks } from '../src/lib/internal-links.ts';

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
