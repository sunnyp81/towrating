import type { Trim, Year, Model } from './types.ts';
import { formatLbs } from './capacity-utils.ts';

export function answerOpener(model: Model, year: Year, trim: Trim): string {
  const m = `${year.year} ${model.makeLabel} ${model.modelLabel} ${trim.trimLabel}`;
  const tow = formatLbs(trim.specs.maxTowLbs);
  const pay = formatLbs(trim.specs.payloadLbs);
  const gcwr = formatLbs(trim.specs.gcwrLbs);
  const tongue = formatLbs(trim.specs.tongueWeightLbs);
  const hc = trim.specs.hitchClass ?? 'unspecified';
  return `The ${m} has a maximum towing capacity of ${tow}, a payload rating of ${pay}, a gross combined weight rating (GCWR) of ${gcwr}, and a maximum tongue weight of ${tongue}. It uses a Class ${hc} receiver hitch when properly equipped.`;
}

export function whatCanItTow(maxTowLbs: number | null): string[] {
  if (!maxTowLbs) return [];
  const out: string[] = [];
  if (maxTowLbs >= 3500) out.push(`Pop-up tent campers (typically 1,000-3,000 lbs)`);
  if (maxTowLbs >= 5000) out.push(`Small travel trailers up to 22 feet (typical dry weight 3,500-4,500 lbs)`);
  if (maxTowLbs >= 7500) out.push(`Mid-size travel trailers up to 26 feet (5,000-7,000 lbs)`);
  if (maxTowLbs >= 10000) out.push(`Large travel trailers up to 30 feet (7,500-9,000 lbs)`);
  if (maxTowLbs >= 12000) out.push(`Lightweight fifth-wheels (8,000-11,500 lbs)`);
  if (maxTowLbs >= 15000) out.push(`Mid-size fifth-wheels (12,000-14,500 lbs)`);
  if (maxTowLbs >= 20000) out.push(`Large fifth-wheels and gooseneck trailers (16,000-19,500 lbs)`);
  if (maxTowLbs >= 4000) out.push(`Single-jet-ski / two-PWC trailers (1,500-2,500 lbs)`);
  if (maxTowLbs >= 6000) out.push(`Boats up to 22 ft on a trailer (4,000-5,500 lbs total)`);
  if (maxTowLbs >= 9000) out.push(`Boats up to 28 ft (7,500-8,500 lbs total)`);
  if (maxTowLbs >= 7000) out.push(`Two-horse straight-load horse trailers (5,500-6,800 lbs loaded)`);
  return out;
}

const SHARED_MISTAKES = {
  gcwr: `Loading the trailer past the manufacturer's max tow rating without verifying GCWR margin`,
  tongueWeight: `Ignoring tongue weight: keep it 10-15% of total trailer weight or the trailer will sway`,
  brakeController: `Skipping a brake controller on heavier trailers, many states require trailer brakes above a threshold, commonly 1,500-3,000 lbs, check your state's rules`,
  tires: `Running stock tires beyond their load rating when towing near the max, upgrade if towing weekly`,
};

export function commonMistakes(vehicleClass: string): string[] {
  switch (vehicleClass) {
    case 'truck':
      return [
        SHARED_MISTAKES.gcwr,
        SHARED_MISTAKES.tongueWeight,
        SHARED_MISTAKES.brakeController,
        `Loading the bed near its max payload rating while also carrying tongue weight; the two share the same payload budget and can combine to exceed it well before the trailer's rated tow capacity does`,
        SHARED_MISTAKES.tires.replace('load rating', 'D/E load rating'),
      ];
    case 'suv':
      return [
        SHARED_MISTAKES.gcwr,
        SHARED_MISTAKES.tongueWeight,
        SHARED_MISTAKES.brakeController,
        `Overlooking rear-axle load and the SUV's wagon-style rear overhang; tongue weight sitting behind the rear axle can lever down harder on the suspension than the same weight in a pickup bed`,
        `Forgetting that third-row seating and cargo area load count against payload before any trailer tongue weight is added`,
      ];
    case 'minivan':
      return [
        SHARED_MISTAKES.gcwr,
        SHARED_MISTAKES.tongueWeight,
        SHARED_MISTAKES.brakeController,
        `Assuming a minivan can tow like a light truck; most minivans have no factory hitch and a GCWR well below comparable SUVs, confirm the manufacturer's tow package rating before shopping for a trailer`,
        `Overloading with passengers and cargo, minivans are often near capacity with a full row of seats, before any tongue weight is added`,
      ];
    case 'sedan':
      return [
        SHARED_MISTAKES.gcwr,
        SHARED_MISTAKES.tongueWeight,
        SHARED_MISTAKES.brakeController,
        `Assuming any hitch fits; most sedans are rated for only light-duty Class I or II hitches suited to small utility or single-jet-ski trailers, not travel trailers`,
        `Forgetting that a sedan's lower ground clearance and unibody construction limit both tongue weight and trailer height compared with a truck or SUV`,
      ];
    case 'crossover':
      return [
        SHARED_MISTAKES.gcwr,
        SHARED_MISTAKES.tongueWeight,
        SHARED_MISTAKES.brakeController,
        `Treating a crossover like a body-on-frame SUV; most crossovers are unibody with a lower GCWR and often need an aftermarket hitch and wiring kit rather than a factory tow package`,
        `Forgetting that rear cargo load and roof-rack weight count against payload before any trailer tongue weight is added`,
      ];
    default:
      return [
        SHARED_MISTAKES.gcwr,
        SHARED_MISTAKES.tongueWeight,
        SHARED_MISTAKES.brakeController,
        `Forgetting to account for cargo and occupants when carrying passengers; payload includes occupants`,
        SHARED_MISTAKES.tires,
      ];
  }
}

export function faqsForTrim(model: Model, year: Year, trim: Trim, count: number): Array<{ q: string; a: string }> {
  const m = `${year.year} ${model.makeLabel} ${model.modelLabel}`;
  const tow = trim.specs.maxTowLbs ?? 0;
  const all = [
    { q: `What is the towing capacity of a ${m} ${trim.trimLabel}?`, a: `The ${m} ${trim.trimLabel} has a maximum towing capacity of ${formatLbs(trim.specs.maxTowLbs)} when properly equipped with the manufacturer's tow package.` },
    { q: `Can a ${m} tow a 30-foot travel trailer?`, a: tow >= 9000 ? `Yes, a 30-foot travel trailer typically weighs 7,500-9,000 lbs loaded, which is within this trim's ${formatLbs(trim.specs.maxTowLbs)} rating. Verify your specific trailer's GVWR and stay under 80% of max tow for comfortable towing.` : `Marginal. A 30-foot travel trailer typically weighs 7,500-9,000 lbs loaded, which exceeds this trim's ${formatLbs(trim.specs.maxTowLbs)} rating. Choose a higher-capacity trim or a shorter trailer.` },
    { q: `Can a ${m} tow a fifth-wheel?`, a: tow >= 12000 ? `Yes, a lightweight fifth-wheel (8,000-11,500 lbs) is within this trim's tow rating. Note fifth-wheels also require a special in-bed hitch, confirm your model has a prepped bed.` : `Not recommended. Most fifth-wheels start at 8,000 lbs and exceed this trim's ${formatLbs(trim.specs.maxTowLbs)} capacity. Step up to a heavy-duty model.` },
    { q: `What hitch class does the ${m} use?`, a: `The ${m} ${trim.trimLabel} is rated for a Class ${trim.specs.hitchClass ?? 'III/IV'} receiver hitch.` },
    { q: `What is the payload of the ${m} ${trim.trimLabel}?`, a: `Payload is rated at ${formatLbs(trim.specs.payloadLbs)}. Remember payload includes passengers, cargo, hitch tongue weight, and any aftermarket equipment.` },
    { q: `What is GCWR and why does it matter?`, a: `Gross Combined Weight Rating (GCWR) is the max combined weight of the loaded vehicle and trailer. The ${m} ${trim.trimLabel} is rated at ${formatLbs(trim.specs.gcwrLbs)}. Exceeding GCWR is a leading cause of brake and transmission failure.` },
    { q: `Do I need a weight-distribution hitch?`, a: tow >= 5000 ? `For trailers above 5,000 lbs, Ford/GM/Ram/Toyota all recommend a weight-distribution hitch. It transfers tongue weight back across both axles, restoring proper steering and braking.` : `Not required for typical loads on this trim, but recommended above 5,000 lbs trailer weight or 500 lbs tongue weight.` },
    { q: `Do I need a brake controller for this trim?`, a: `Likely, for heavier trailers. Many states require trailer brakes above a threshold, commonly 1,500-3,000 lbs, check your state's rules. The ${m} typically supports a proportional integrated brake controller, confirm trim availability.` },
    { q: `What is tongue weight on the ${m} ${trim.trimLabel}?`, a: `Maximum tongue weight is ${formatLbs(trim.specs.tongueWeightLbs)} (industry-standard 10% of max tow rating). Aim for 10-15% of actual trailer weight to avoid sway.` },
    { q: `Is the ${m} better than its competitors for towing?`, a: `Within its capacity bracket, the ${m} ${trim.trimLabel} is competitive at ${formatLbs(trim.specs.maxTowLbs)}. See the "Compare with" section below for direct comparisons against same-class alternatives.` },
  ];
  return all.slice(0, count);
}
