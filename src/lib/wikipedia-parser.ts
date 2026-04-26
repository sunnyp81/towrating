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

export function extractTowSpecs(html: string): TowingSpecs {
  const specs: TowingSpecs = {
    maxTowLbs: null,
    payloadLbs: null,
    gcwrLbs: null,
    tongueWeightLbs: null,
    hitchClass: null,
  };
  // Match infobox rows: <tr><th>Field</th><td>Value</td></tr>
  const rowRx = /<tr\b[^>]*>\s*<th\b[^>]*>([\s\S]*?)<\/th>\s*<td\b[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi;
  let m;
  while ((m = rowRx.exec(html)) !== null) {
    const label = m[1].replace(/<[^>]+>/g, '').trim();
    const value = m[2].replace(/<[^>]+>/g, ' ').trim();
    for (const { key, rx } of FIELD_PATTERNS) {
      if (rx.some(r => r.test(label)) && specs[key] == null) {
        const lbs = lbsFromText(value);
        if (lbs) (specs as any)[key] = lbs;
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
