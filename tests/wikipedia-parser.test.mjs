import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractTowSpecs, lbsFromText } from '../src/lib/wikipedia-parser.ts';

test('lbsFromText: "13,200 lb" -> 13200', () => {
  assert.equal(lbsFromText('13,200 lb'), 13200);
});

test('lbsFromText: "5500 pounds" -> 5500', () => {
  assert.equal(lbsFromText('5500 pounds'), 5500);
});

test('lbsFromText: "6,000 kg (13,200 lb)" -> 13200', () => {
  assert.equal(lbsFromText('6,000 kg (13,200 lb)'), 13200);
});

test('lbsFromText: "12,000 lbs" -> 12000', () => {
  assert.equal(lbsFromText('12,000 lbs'), 12000);
});

test('lbsFromText: gibberish returns null', () => {
  assert.equal(lbsFromText('truck'), null);
});

test('extractTowSpecs: parses simple infobox HTML', () => {
  const html = `
    <table class="infobox">
      <tr><th>Towing capacity</th><td>13,200 lb (5,987 kg)</td></tr>
      <tr><th>Payload capacity</th><td>3,325 lb</td></tr>
      <tr><th>GVWR</th><td>7,050 lb</td></tr>
    </table>
  `;
  const specs = extractTowSpecs(html);
  assert.equal(specs.maxTowLbs, 13200);
  assert.equal(specs.payloadLbs, 3325);
});

test('extractTowSpecs: returns nulls when no data', () => {
  const specs = extractTowSpecs('<p>No infobox here</p>');
  assert.equal(specs.maxTowLbs, null);
  assert.equal(specs.payloadLbs, null);
});
