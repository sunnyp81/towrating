export type VehicleClass = 'truck' | 'suv' | 'minivan' | 'sedan' | 'crossover';
export type HitchClass = 'I' | 'II' | 'III' | 'IV' | 'V';
export type TrailerType = 'travel-trailer' | 'fifth-wheel' | 'boat' | 'horse-trailer' | 'utility-trailer' | 'car-trailer';
export type DataSource = 'hero-curated' | 'wikipedia' | 'fueleconomy' | 'vpic-only';

export interface TowingSpecs {
  maxTowLbs: number | null;
  payloadLbs: number | null;
  gcwrLbs: number | null;
  tongueWeightLbs: number | null;
  hitchClass: HitchClass | null;
}

export interface Trim {
  trimSlug: string;
  trimLabel: string;
  drivetrain?: string;
  engine?: string;
  curbWeightLbs?: number;
  specs: TowingSpecs;
  source: DataSource;
  sourceUrl?: string;
  indexable: boolean;
  specCoverage: number; // 0..5
}

export interface Year {
  year: number;
  trims: Trim[];
  bestTowLbs: number | null;
  indexable: boolean;
}

export interface Model {
  modelSlug: string;
  modelLabel: string;
  makeSlug: string;
  makeLabel: string;
  vehicleClass: VehicleClass;
  years: Year[];
  bestTowLbsAllTime: number | null;
  indexable: boolean;
  wikipediaUrl?: string;
}

export interface Make {
  makeSlug: string;
  makeLabel: string;
  models: Model[];
}

export interface CapacityBracket {
  lbs: number;
  label: string;
  rangeMinLbs: number;
  rangeMaxLbs: number;
  vehicles: Array<{ makeSlug: string; modelSlug: string; year: number; trimSlug?: string; maxTowLbs: number; vehicleClass: VehicleClass }>;
}

export interface UseCaseCrossroad {
  slug: string;
  trailer: TrailerType;
  vehicleClass: VehicleClass;
  trailerLabel: string;
  classLabel: string;
  vehicles: Array<{ makeSlug: string; modelSlug: string; year: number; maxTowLbs: number }>;
}
