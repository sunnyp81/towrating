import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Make, CapacityBracket } from './types.ts';

export function loadVehicles(): Make[] {
  return JSON.parse(readFileSync(resolve('data/vehicles.json'), 'utf8'));
}

export function loadBracketIndex(): CapacityBracket[] {
  return JSON.parse(readFileSync(resolve('data/capacity-bracket-index.json'), 'utf8'));
}

export function loadTree(): any[] {
  return JSON.parse(readFileSync(resolve('data/make-model-year-tree.json'), 'utf8'));
}

export function loadQualityFlags(): any {
  return JSON.parse(readFileSync(resolve('data/quality-flags.json'), 'utf8'));
}
