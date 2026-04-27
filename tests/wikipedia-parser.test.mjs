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

test('extractTowSpecs: parses modern Wikipedia infobox with nested tags', () => {
  const html = `
    <table class="infobox vcard">
      <tbody>
        <tr><th scope="row">Curb weight</th><td>4,500 <abbr title="pounds">lb</abbr> (2,041 kg)</td></tr>
        <tr><th scope="row">Towing capacity</th><td><span class="nowrap">11,300 lb</span> (5,126 kg)</td></tr>
        <tr><th scope="row">Payload capacity</th><td>2,238 <abbr title="pounds">lb</abbr></td></tr>
      </tbody>
    </table>
  `;
  const specs = extractTowSpecs(html);
  assert.equal(specs.maxTowLbs, 11300);
  assert.equal(specs.payloadLbs, 2238);
});

test('extractTowSpecs: parses <li> label:value format (F-150 style)', () => {
  const html = `
    <ul>
      <li>Maximum payload: 2,120 pounds (960 kg)</li>
      <li>Maximum towing capacity: 12,700 pounds (5,800 kg)</li>
      <li>Two 120V, 20A household outlets standard</li>
    </ul>
  `;
  const specs = extractTowSpecs(html);
  assert.equal(specs.maxTowLbs, 12700);
  assert.equal(specs.payloadLbs, 2120);
});

test('extractTowSpecs: parses towing from paragraph prose (Tundra style)', () => {
  const html = `
    <p>The maximum towing capacity and the maximum payload are increased to
    12,000 pounds (5,400 kg) and 1,940 pounds (880 kg) respectively.</p>
  `;
  const specs = extractTowSpecs(html);
  assert.equal(specs.maxTowLbs, 12000);
});
