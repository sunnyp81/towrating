import type { TowingSpecs } from './types.ts';

export function computeCoverage(specs: TowingSpecs): number {
  return [specs.maxTowLbs, specs.payloadLbs, specs.gcwrLbs, specs.tongueWeightLbs, specs.hitchClass].filter(v => v != null).length;
}

export function isIndexable(specs: TowingSpecs): boolean {
  return computeCoverage(specs) >= 4;
}
