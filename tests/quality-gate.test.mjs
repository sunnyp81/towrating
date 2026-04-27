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
