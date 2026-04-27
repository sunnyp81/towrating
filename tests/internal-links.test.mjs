import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSpokeLinks } from '../src/lib/internal-links.ts';

test('buildSpokeLinks returns at least 8 links', () => {
  const ctx = {
    makeSlug: 'ford', modelSlug: 'f-150', year: 2024, trimSlug: 'xlt',
    maxTowLbs: 13500, vehicleClass: 'truck',
    siblings: {
      sameYearTrims: [{ slug: 'xl-2-7l', label: 'XL 2.7L EcoBoost' }, { slug: 'lariat-5-0l', label: 'Lariat 5.0L V8' }],
      prevYear: 2023, nextYear: 2025,
      sameMakeClass: [{ slug: 'expedition', label: 'Expedition' }, { slug: 'ranger', label: 'Ranger' }, { slug: 'maverick', label: 'Maverick' }],
    },
    bracketLbs: 15000, contextualGuide: 'gcwr-explained',
  };
  const links = buildSpokeLinks(ctx);
  assert.ok(links.length >= 8, `expected >=8, got ${links.length}`);
});

test('buildSpokeLinks uses real trim labels for sibling links', () => {
  const ctx = {
    makeSlug: 'ford', modelSlug: 'f-150', year: 2024, trimSlug: 'xlt',
    maxTowLbs: 13500, vehicleClass: 'truck',
    siblings: {
      sameYearTrims: [{ slug: 'xl-2-7l', label: 'XL 2.7L EcoBoost' }],
      prevYear: null, nextYear: null, sameMakeClass: [],
    },
    bracketLbs: 15000, contextualGuide: 'gcwr-explained',
  };
  const links = buildSpokeLinks(ctx);
  const sibling = links.find(l => l.href.includes('xl-2-7l'));
  assert.ok(sibling, 'sibling link must exist');
  assert.ok(sibling.label.includes('XL 2.7L EcoBoost'), `expected label to contain trim label, got: ${sibling.label}`);
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
