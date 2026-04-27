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
