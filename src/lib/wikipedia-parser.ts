import type { TowingSpecs } from './types.ts';

export function lbsFromText(s: string | null | undefined): number | null {
  if (!s) return null;
  // prefer "(N lb)" inside parens — kg often appears first
  const paren = s.match(/\(([\d,]+)\s*(lb|lbs|pounds?)\b/i);
  if (paren) return parseInt(paren[1].replace(/,/g, ''), 10);
  const m = s.match(/([\d,]+)\s*(lb|lbs|pounds?)\b/i);
  if (m) return parseInt(m[1].replace(/,/g, ''), 10);
  return null;
}

const FIELD_PATTERNS: Array<{ key: keyof TowingSpecs; rx: RegExp[] }> = [
  { key: 'maxTowLbs', rx: [/towing\s*capacity/i, /tow\s*rating/i, /max(imum)?\s*tow/i] },
  { key: 'payloadLbs', rx: [/payload\s*capacity/i, /payload/i] },
  { key: 'gcwrLbs', rx: [/gcwr/i, /gross\s*combined/i] },
  { key: 'tongueWeightLbs', rx: [/tongue\s*weight/i] },
];

/** Strip HTML tags and normalise whitespace */
function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Try to match a field label from FIELD_PATTERNS.
 * Returns the key if matched, else null.
 */
function matchField(label: string): keyof TowingSpecs | null {
  for (const { key, rx } of FIELD_PATTERNS) {
    if (rx.some(r => r.test(label))) return key;
  }
  return null;
}

/**
 * Attempt to record a value against a field key if not already set.
 */
function tryRecord(specs: TowingSpecs, key: keyof TowingSpecs | null, valueText: string): void {
  if (!key || specs[key] != null) return;
  const lbs = lbsFromText(valueText);
  if (lbs) (specs as any)[key] = lbs;
}

export function extractTowSpecs(html: string): TowingSpecs {
  const specs: TowingSpecs = {
    maxTowLbs: null,
    payloadLbs: null,
    gcwrLbs: null,
    tongueWeightLbs: null,
    hitchClass: null,
  };

  // ── Strategy 1: infobox / spec table rows ─────────────────────────────────
  // Handles both the classic <th>Label</th><td>Value</td> pattern and
  // the Parsoid-rendered <th scope="row" class="infobox-label"> variant.
  // We accept <th> OR <td> as the label cell, followed by at least one <td>
  // value cell in the same <tr>.
  const rowRx = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
  let r: RegExpExecArray | null;
  while ((r = rowRx.exec(html)) !== null) {
    const row = r[1];
    // Match label cell (<th> or <td>) then immediately a <td> value cell
    const cellMatch = row.match(
      /<(?:th|td)\b[^>]*>([\s\S]*?)<\/(?:th|td)>\s*<td\b[^>]*>([\s\S]*?)<\/td>/i,
    );
    if (!cellMatch) continue;
    const label = stripTags(cellMatch[1]);
    const value = stripTags(cellMatch[2]);
    tryRecord(specs, matchField(label), value);
  }

  // ── Strategy 2: <li> label:value lines ────────────────────────────────────
  // Wikipedia article body often has items like:
  //   <li>Maximum towing capacity: 12,700 pounds (5,800 kg)</li>
  //   <li>Payload capacity: 2,238 lb (1,015 kg)</li>
  // The label ends at the first colon and the value is everything after.
  const liRx = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
  let li: RegExpExecArray | null;
  while ((li = liRx.exec(html)) !== null) {
    const text = stripTags(li[1]);
    const colonIdx = text.indexOf(':');
    if (colonIdx < 1) continue;
    const label = text.slice(0, colonIdx).trim();
    const value = text.slice(colonIdx + 1).trim();
    if (!value) continue;
    tryRecord(specs, matchField(label), value);
  }

  // ── Strategy 3: paragraph sentences containing towing figures ─────────────
  // Some Wikipedia pages describe specs inline:
  //   "…towing capacity was increased to 12,000 lb (5,400 kg)…"
  // We only extract when a lb figure immediately follows a field keyword.
  // Limit to a 150-char window after the keyword to avoid false positives.
  const pRx = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  let p: RegExpExecArray | null;
  while ((p = pRx.exec(html)) !== null) {
    const text = stripTags(p[1]);
    for (const { key, rx } of FIELD_PATTERNS) {
      if (specs[key] != null) continue;
      for (const fieldRx of rx) {
        const fm = text.match(fieldRx);
        if (!fm) continue;
        const start = fm.index! + fm[0].length;
        const window = text.slice(start, start + 150);
        const lbs = lbsFromText(window);
        if (lbs) {
          (specs as any)[key] = lbs;
          break;
        }
      }
    }
  }

  return specs;
}

export function deriveHitchClass(maxTowLbs: number | null): TowingSpecs['hitchClass'] {
  if (!maxTowLbs) return null;
  if (maxTowLbs <= 2000) return 'I';
  if (maxTowLbs <= 3500) return 'II';
  if (maxTowLbs <= 8000) return 'III';
  if (maxTowLbs <= 12000) return 'IV';
  return 'V';
}
