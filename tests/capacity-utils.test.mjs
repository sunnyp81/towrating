import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assignBracket, formatLbs, BRACKETS } from '../src/lib/capacity-utils.ts';

test('BRACKETS contains all 8 specified brackets', () => {
  assert.deepEqual(BRACKETS.map(b => b.lbs), [3500, 5000, 7500, 10000, 12000, 15000, 20000, 30000]);
});

test('assignBracket: 3000 lbs -> 3500 bracket', () => {
  assert.equal(assignBracket(3000)?.lbs, 3500);
});

test('assignBracket: exactly 5000 -> 5000 bracket', () => {
  assert.equal(assignBracket(5000)?.lbs, 5000);
});

test('assignBracket: 6800 -> 7500 bracket', () => {
  assert.equal(assignBracket(6800)?.lbs, 7500);
});

test('assignBracket: 35000 lbs -> 30000 (highest) bracket', () => {
  assert.equal(assignBracket(35000)?.lbs, 30000);
});

test('assignBracket: 0 returns null', () => {
  assert.equal(assignBracket(0), null);
});

test('formatLbs: 12000 -> "12,000 lbs"', () => {
  assert.equal(formatLbs(12000), '12,000 lbs');
});

test('formatLbs: null -> "N/A"', () => {
  assert.equal(formatLbs(null), 'N/A');
});
