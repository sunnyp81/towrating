import type { CapacityBracket } from './types.ts';

export const BRACKETS: Array<Pick<CapacityBracket, 'lbs' | 'label' | 'rangeMinLbs' | 'rangeMaxLbs'>> = [
  { lbs: 3500, label: 'Up to 3,500 lbs', rangeMinLbs: 1, rangeMaxLbs: 3500 },
  { lbs: 5000, label: '3,501–5,000 lbs', rangeMinLbs: 3501, rangeMaxLbs: 5000 },
  { lbs: 7500, label: '5,001–7,500 lbs', rangeMinLbs: 5001, rangeMaxLbs: 7500 },
  { lbs: 10000, label: '7,501–10,000 lbs', rangeMinLbs: 7501, rangeMaxLbs: 10000 },
  { lbs: 12000, label: '10,001–12,000 lbs', rangeMinLbs: 10001, rangeMaxLbs: 12000 },
  { lbs: 15000, label: '12,001–15,000 lbs', rangeMinLbs: 12001, rangeMaxLbs: 15000 },
  { lbs: 20000, label: '15,001–20,000 lbs', rangeMinLbs: 15001, rangeMaxLbs: 20000 },
  { lbs: 30000, label: '20,001+ lbs', rangeMinLbs: 20001, rangeMaxLbs: 100000 },
];

export function assignBracket(lbs: number): typeof BRACKETS[number] | null {
  if (!lbs || lbs < 1) return null;
  for (const b of BRACKETS) {
    if (lbs <= b.rangeMaxLbs) return b;
  }
  return BRACKETS[BRACKETS.length - 1];
}

export function formatLbs(lbs: number | null | undefined): string {
  if (lbs == null || lbs === 0) return 'N/A';
  return `${lbs.toLocaleString('en-US')} lbs`;
}

export function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
