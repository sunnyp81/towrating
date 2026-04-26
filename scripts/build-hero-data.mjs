// Builds src/data/hero-models.json with all 20 models × 12 years × 3+ trims.
// Specs sourced from manufacturer RV/Trailer towing guides (Ford, GM, Ram, Toyota,
// Jeep, Honda, Nissan) and cross-checked against Edmunds, MotorTrend, trailerlife.com.
// Run: node scripts/build-hero-data.mjs

import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'src', 'data', 'hero-models.json');

// Helper: build a year block from a flat trim list
const Y = (year, trims) => ({ year, trims });
const T = (trim, drivetrain, engine, curbWeightLbs, maxTowLbs, payloadLbs, gcwrLbs) => ({
  trim,
  drivetrain,
  engine,
  curbWeightLbs,
  specs: {
    maxTowLbs,
    payloadLbs,
    gcwrLbs,
    tongueWeightLbs: Math.round(maxTowLbs * 0.10),
    hitchClass: maxTowLbs >= 10000 ? 'V' : (maxTowLbs >= 5000 ? 'IV' : 'III')
  }
});

// Hitch class override helpers — heavy-duty trucks use Class V receivers
const T5 = (trim, drivetrain, engine, curbWeightLbs, maxTowLbs, payloadLbs, gcwrLbs) => {
  const r = T(trim, drivetrain, engine, curbWeightLbs, maxTowLbs, payloadLbs, gcwrLbs);
  r.specs.hitchClass = 'V';
  return r;
};

// ============================================================
// Read existing F-150 (already authored hand-curated) and merge
// ============================================================
const existing = JSON.parse(readFileSync(OUT, 'utf-8'));
const fordF150 = existing.models[0];

// ============================================================
// 2. Chevrolet Silverado 1500 (GMT K2XX 2014-2018, T1XX 2019+)
// ============================================================
const silverado1500 = {
  make: 'Chevrolet',
  model: 'Silverado 1500',
  vehicleClass: 'truck',
  wikipediaUrl: 'https://en.wikipedia.org/wiki/Chevrolet_Silverado',
  years: [
    Y(2015, [
      T('WT 4.3L EcoTec3 V6 4x2', 'RWD', '4.3L EcoTec3 V6', 4690, 7600, 1750, 12000),
      T('LT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5230, 11200, 1990, 16000),
      T5('LTZ 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5460, 12000, 1900, 17000)
    ]),
    Y(2016, [
      T('WT 4.3L EcoTec3 V6 4x2', 'RWD', '4.3L EcoTec3 V6', 4690, 7600, 1750, 12000),
      T('LT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5230, 11200, 1990, 16000),
      T5('LTZ 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5460, 12000, 1900, 17000)
    ]),
    Y(2017, [
      T('WT 4.3L EcoTec3 V6 4x2', 'RWD', '4.3L EcoTec3 V6', 4690, 7600, 1750, 12000),
      T('LT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5230, 11200, 1990, 16000),
      T5('High Country 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5460, 12500, 1900, 17500)
    ]),
    Y(2018, [
      T('WT 4.3L EcoTec3 V6 4x2', 'RWD', '4.3L EcoTec3 V6', 4690, 7600, 1750, 12000),
      T('LT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5230, 11200, 1990, 16000),
      T5('High Country 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5460, 12500, 1900, 17500)
    ]),
    Y(2019, [
      T('WT 4.3L EcoTec3 V6 4x2', 'RWD', '4.3L EcoTec3 V6', 4520, 7900, 2000, 12500),
      T('LT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5240, 11500, 2250, 16400),
      T5('High Country 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5400, 13400, 2150, 18000)
    ]),
    Y(2020, [
      T('WT 4.3L EcoTec3 V6 4x2', 'RWD', '4.3L EcoTec3 V6', 4520, 7900, 2000, 12500),
      T('LT 2.7L Turbo I-4 4x4', '4WD', '2.7L Turbo I-4', 4660, 9500, 2280, 13900),
      T5('LTZ 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 5240, 9300, 1870, 14000),
      T5('High Country 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5400, 13400, 2150, 18000)
    ]),
    Y(2021, [
      T('WT 4.3L EcoTec3 V6 4x2', 'RWD', '4.3L EcoTec3 V6', 4520, 7900, 2000, 12500),
      T('LT 2.7L Turbo I-4 4x4', '4WD', '2.7L Turbo I-4', 4660, 9500, 2280, 13900),
      T5('LTZ 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 5240, 9500, 1870, 14000),
      T5('High Country 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5400, 13300, 2150, 18000)
    ]),
    Y(2022, [
      T('WT 2.7L Turbo I-4 4x2', 'RWD', '2.7L Turbo I-4', 4520, 9500, 2280, 13900),
      T('LT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5240, 11500, 2250, 16400),
      T5('LTZ 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 5240, 13000, 1870, 17500),
      T5('High Country 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5400, 13300, 2150, 18000)
    ]),
    Y(2023, [
      T('WT 2.7L TurboMax I-4 4x2', 'RWD', '2.7L TurboMax I-4', 4520, 9500, 2280, 13900),
      T('LT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5240, 11500, 2250, 16400),
      T5('LTZ 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 5240, 13000, 1870, 17500),
      T5('High Country 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5400, 13300, 2150, 18000)
    ]),
    Y(2024, [
      T('WT 2.7L TurboMax I-4 4x2', 'RWD', '2.7L TurboMax I-4', 4520, 9500, 2280, 13900),
      T('LT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5240, 11300, 1980, 16400),
      T5('LTZ 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 5240, 13300, 1870, 17500),
      T5('High Country 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5400, 13300, 1980, 18000)
    ]),
    Y(2025, [
      T('WT 2.7L TurboMax I-4 4x2', 'RWD', '2.7L TurboMax I-4', 4520, 9500, 2280, 13900),
      T('LT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5240, 11300, 1980, 16400),
      T5('LTZ 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 5240, 13300, 1870, 17500),
      T5('High Country 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5400, 13300, 1980, 18000)
    ]),
    Y(2026, [
      T('WT 2.7L TurboMax I-4 4x2', 'RWD', '2.7L TurboMax I-4', 4520, 9500, 2280, 13900),
      T('LT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5240, 11300, 1980, 16400),
      T5('LTZ 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 5240, 13300, 1870, 17500),
      T5('High Country 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5400, 13300, 1980, 18000)
    ])
  ]
};

// ============================================================
// 3. Ram 1500 (DS 2009-2018, DT 2019+)
// ============================================================
const ram1500 = {
  make: 'Ram',
  model: '1500',
  vehicleClass: 'truck',
  wikipediaUrl: 'https://en.wikipedia.org/wiki/Ram_pickup',
  years: [
    Y(2015, [
      T('Tradesman 3.6L Pentastar V6 4x2', 'RWD', '3.6L Pentastar V6', 4685, 7610, 1720, 12000),
      T('Big Horn 5.7L HEMI V8 4x4', '4WD', '5.7L HEMI V8', 5390, 10450, 1620, 15000),
      T('Laramie 3.0L EcoDiesel V6 4x4', '4WD', '3.0L EcoDiesel V6', 5440, 9210, 1390, 14000)
    ]),
    Y(2016, [
      T('Tradesman 3.6L Pentastar V6 4x2', 'RWD', '3.6L Pentastar V6', 4685, 7610, 1720, 12000),
      T('Big Horn 5.7L HEMI V8 4x4', '4WD', '5.7L HEMI V8', 5390, 10620, 1620, 15500),
      T('Laramie 3.0L EcoDiesel V6 4x4', '4WD', '3.0L EcoDiesel V6', 5440, 9210, 1390, 14000)
    ]),
    Y(2017, [
      T('Tradesman 3.6L Pentastar V6 4x2', 'RWD', '3.6L Pentastar V6', 4685, 7610, 1720, 12000),
      T('Big Horn 5.7L HEMI V8 4x4', '4WD', '5.7L HEMI V8', 5390, 10620, 1620, 15500),
      T('Laramie 3.0L EcoDiesel V6 4x4', '4WD', '3.0L EcoDiesel V6', 5440, 9210, 1390, 14000)
    ]),
    Y(2018, [
      T('Tradesman 3.6L Pentastar V6 4x2', 'RWD', '3.6L Pentastar V6', 4685, 7610, 1720, 12000),
      T('Big Horn 5.7L HEMI V8 4x4', '4WD', '5.7L HEMI V8', 5390, 10620, 1620, 15500),
      T('Laramie 3.0L EcoDiesel V6 4x4', '4WD', '3.0L EcoDiesel V6', 5440, 9210, 1390, 14000)
    ]),
    Y(2019, [
      T('Tradesman 3.6L Pentastar V6 eTorque 4x2', 'RWD', '3.6L Pentastar V6 eTorque', 4798, 7730, 2300, 12300),
      T('Big Horn 5.7L HEMI V8 4x4', '4WD', '5.7L HEMI V8', 5232, 11540, 2300, 16410),
      T('Laramie 5.7L HEMI V8 eTorque 4x4 Max Tow', '4WD', '5.7L HEMI V8 eTorque', 5400, 12750, 2310, 17000)
    ]),
    Y(2020, [
      T('Tradesman 3.6L Pentastar V6 eTorque 4x2', 'RWD', '3.6L Pentastar V6 eTorque', 4798, 7730, 2300, 12300),
      T('Big Horn 5.7L HEMI V8 4x4', '4WD', '5.7L HEMI V8', 5232, 11540, 2300, 16410),
      T('Laramie 3.0L EcoDiesel V6 4x4', '4WD', '3.0L EcoDiesel V6', 5500, 12560, 1820, 17000),
      T('TRX 6.2L Supercharged HEMI V8 4x4', '4WD', '6.2L Supercharged HEMI V8', 6396, 8100, 1310, 14400)
    ]),
    Y(2021, [
      T('Tradesman 3.6L Pentastar V6 eTorque 4x2', 'RWD', '3.6L Pentastar V6 eTorque', 4798, 7730, 2300, 12300),
      T('Big Horn 5.7L HEMI V8 4x4', '4WD', '5.7L HEMI V8', 5232, 11540, 2300, 16410),
      T('Laramie 3.0L EcoDiesel V6 4x4', '4WD', '3.0L EcoDiesel V6', 5500, 12560, 1820, 17000),
      T('TRX 6.2L Supercharged HEMI V8 4x4', '4WD', '6.2L Supercharged HEMI V8', 6396, 8100, 1310, 14400)
    ]),
    Y(2022, [
      T('Tradesman 3.6L Pentastar V6 eTorque 4x2', 'RWD', '3.6L Pentastar V6 eTorque', 4798, 7730, 2300, 12300),
      T('Big Horn 5.7L HEMI V8 4x4', '4WD', '5.7L HEMI V8', 5232, 11540, 2300, 16410),
      T('Laramie 5.7L HEMI V8 eTorque 4x4 Max Tow', '4WD', '5.7L HEMI V8 eTorque', 5400, 12750, 2310, 17000),
      T('TRX 6.2L Supercharged HEMI V8 4x4', '4WD', '6.2L Supercharged HEMI V8', 6396, 8100, 1310, 14400)
    ]),
    Y(2023, [
      T('Tradesman 3.6L Pentastar V6 eTorque 4x2', 'RWD', '3.6L Pentastar V6 eTorque', 4798, 7730, 2360, 12300),
      T('Big Horn 5.7L HEMI V8 4x4', '4WD', '5.7L HEMI V8', 5232, 11540, 2300, 16410),
      T('Laramie 5.7L HEMI V8 eTorque 4x4 Max Tow', '4WD', '5.7L HEMI V8 eTorque', 5400, 12750, 2310, 17000),
      T('TRX 6.2L Supercharged HEMI V8 4x4', '4WD', '6.2L Supercharged HEMI V8', 6396, 8100, 1310, 14400)
    ]),
    Y(2024, [
      T('Tradesman 3.6L Pentastar V6 eTorque 4x2', 'RWD', '3.6L Pentastar V6 eTorque', 4798, 7730, 2360, 12300),
      T('Big Horn 5.7L HEMI V8 4x4', '4WD', '5.7L HEMI V8', 5232, 11410, 2300, 16410),
      T('Laramie 5.7L HEMI V8 eTorque 4x4 Max Tow', '4WD', '5.7L HEMI V8 eTorque', 5400, 12750, 2310, 17000)
    ]),
    Y(2025, [
      T('Tradesman 3.6L Pentastar V6 eTorque 4x2', 'RWD', '3.6L Pentastar V6 eTorque', 4798, 8380, 1670, 12500),
      T('Big Horn 3.0L Hurricane I-6 SST 4x4', '4WD', '3.0L Hurricane Twin-Turbo I-6 SST', 5290, 11550, 1880, 16800),
      T('Laramie 3.0L Hurricane I-6 HO 4x4 Max Tow', '4WD', '3.0L Hurricane Twin-Turbo I-6 HO', 5400, 11580, 1820, 16800),
      T('RHO 3.0L Hurricane I-6 HO 4x4', '4WD', '3.0L Hurricane Twin-Turbo I-6 HO', 5950, 8380, 1520, 14400)
    ]),
    Y(2026, [
      T('Tradesman 3.6L Pentastar V6 eTorque 4x2', 'RWD', '3.6L Pentastar V6 eTorque', 4798, 8380, 1670, 12500),
      T('Big Horn 3.0L Hurricane I-6 SST 4x4', '4WD', '3.0L Hurricane Twin-Turbo I-6 SST', 5290, 11550, 1880, 16800),
      T('Laramie 3.0L Hurricane I-6 HO 4x4 Max Tow', '4WD', '3.0L Hurricane Twin-Turbo I-6 HO', 5400, 11580, 1820, 16800),
      T('RHO 3.0L Hurricane I-6 HO 4x4', '4WD', '3.0L Hurricane Twin-Turbo I-6 HO', 5950, 8380, 1520, 14400)
    ])
  ]
};

// ============================================================
// 4. Toyota Tacoma (3rd gen 2016-2023, 4th gen 2024+)
// ============================================================
const tacoma = {
  make: 'Toyota',
  model: 'Tacoma',
  vehicleClass: 'truck',
  wikipediaUrl: 'https://en.wikipedia.org/wiki/Toyota_Tacoma',
  years: [
    Y(2015, [
      T('Base 2.7L I-4 4x2', 'RWD', '2.7L I-4', 3460, 3500, 1500, 8500),
      T('PreRunner 4.0L V6 4x2', 'RWD', '4.0L V6', 3855, 6500, 1180, 11500),
      T('TRD Off-Road 4.0L V6 4x4 Tow Package', '4WD', '4.0L V6', 4180, 6500, 1320, 11500)
    ]),
    Y(2016, [
      T('SR 2.7L I-4 4x2', 'RWD', '2.7L I-4', 3980, 3500, 1440, 8500),
      T('SR5 3.5L V6 4x2', 'RWD', '3.5L V6', 4015, 6800, 1620, 11600),
      T('TRD Off-Road 3.5L V6 4x4 Tow Package', '4WD', '3.5L V6', 4480, 6400, 1175, 11400)
    ]),
    Y(2017, [
      T('SR 2.7L I-4 4x2', 'RWD', '2.7L I-4', 3980, 3500, 1440, 8500),
      T('SR5 3.5L V6 4x2', 'RWD', '3.5L V6', 4015, 6800, 1620, 11600),
      T('TRD Off-Road 3.5L V6 4x4 Tow Package', '4WD', '3.5L V6', 4480, 6400, 1175, 11400)
    ]),
    Y(2018, [
      T('SR 2.7L I-4 4x2', 'RWD', '2.7L I-4', 3980, 3500, 1440, 8500),
      T('SR5 3.5L V6 4x2', 'RWD', '3.5L V6', 4015, 6800, 1620, 11600),
      T('TRD Off-Road 3.5L V6 4x4 Tow Package', '4WD', '3.5L V6', 4480, 6400, 1175, 11400)
    ]),
    Y(2019, [
      T('SR 2.7L I-4 4x2', 'RWD', '2.7L I-4', 3980, 3500, 1440, 8500),
      T('SR5 3.5L V6 4x2', 'RWD', '3.5L V6', 4015, 6800, 1620, 11600),
      T('TRD Off-Road 3.5L V6 4x4 Tow Package', '4WD', '3.5L V6', 4480, 6400, 1175, 11400)
    ]),
    Y(2020, [
      T('SR 2.7L I-4 4x2', 'RWD', '2.7L I-4', 3980, 3500, 1440, 8500),
      T('SR5 3.5L V6 4x2', 'RWD', '3.5L V6', 4015, 6800, 1620, 11600),
      T('TRD Off-Road 3.5L V6 4x4 Tow Package', '4WD', '3.5L V6', 4480, 6400, 1175, 11400)
    ]),
    Y(2021, [
      T('SR 2.7L I-4 4x2', 'RWD', '2.7L I-4', 3980, 3500, 1440, 8500),
      T('SR5 3.5L V6 4x2', 'RWD', '3.5L V6', 4015, 6800, 1620, 11600),
      T('TRD Off-Road 3.5L V6 4x4 Tow Package', '4WD', '3.5L V6', 4480, 6400, 1175, 11400)
    ]),
    Y(2022, [
      T('SR 2.7L I-4 4x2', 'RWD', '2.7L I-4', 3980, 3500, 1440, 8500),
      T('SR5 3.5L V6 4x2', 'RWD', '3.5L V6', 4015, 6800, 1620, 11600),
      T('TRD Off-Road 3.5L V6 4x4 Tow Package', '4WD', '3.5L V6', 4480, 6400, 1175, 11400)
    ]),
    Y(2023, [
      T('SR 2.7L I-4 4x2', 'RWD', '2.7L I-4', 3980, 3500, 1440, 8500),
      T('SR5 3.5L V6 4x2', 'RWD', '3.5L V6', 4015, 6800, 1620, 11600),
      T('TRD Off-Road 3.5L V6 4x4 Tow Package', '4WD', '3.5L V6', 4480, 6800, 1620, 11600)
    ]),
    Y(2024, [
      T('SR 2.4L i-FORCE Turbo I-4 4x2', 'RWD', '2.4L i-FORCE Turbo I-4', 4400, 6400, 1495, 11550),
      T('TRD Sport 2.4L i-FORCE Turbo I-4 4x4', '4WD', '2.4L i-FORCE Turbo I-4', 4685, 6500, 1545, 11650),
      T('TRD Off-Road 2.4L i-FORCE MAX Hybrid 4x4', '4WD', '2.4L i-FORCE MAX Hybrid I-4', 5135, 6000, 1525, 11550)
    ]),
    Y(2025, [
      T('SR 2.4L i-FORCE Turbo I-4 4x2', 'RWD', '2.4L i-FORCE Turbo I-4', 4400, 6400, 1495, 11550),
      T('TRD Sport 2.4L i-FORCE Turbo I-4 4x4', '4WD', '2.4L i-FORCE Turbo I-4', 4685, 6500, 1545, 11650),
      T('TRD Off-Road 2.4L i-FORCE MAX Hybrid 4x4', '4WD', '2.4L i-FORCE MAX Hybrid I-4', 5135, 6000, 1525, 11550),
      T('Trailhunter 2.4L i-FORCE MAX Hybrid 4x4', '4WD', '2.4L i-FORCE MAX Hybrid I-4', 5285, 6000, 1410, 11550)
    ]),
    Y(2026, [
      T('SR 2.4L i-FORCE Turbo I-4 4x2', 'RWD', '2.4L i-FORCE Turbo I-4', 4400, 6400, 1495, 11550),
      T('TRD Sport 2.4L i-FORCE Turbo I-4 4x4', '4WD', '2.4L i-FORCE Turbo I-4', 4685, 6500, 1545, 11650),
      T('TRD Off-Road 2.4L i-FORCE MAX Hybrid 4x4', '4WD', '2.4L i-FORCE MAX Hybrid I-4', 5135, 6000, 1525, 11550),
      T('Trailhunter 2.4L i-FORCE MAX Hybrid 4x4', '4WD', '2.4L i-FORCE MAX Hybrid I-4', 5285, 6000, 1410, 11550)
    ])
  ]
};

// ============================================================
// 5. Toyota Tundra (2nd gen 2014-2021, 3rd gen 2022+)
// ============================================================
const tundra = {
  make: 'Toyota',
  model: 'Tundra',
  vehicleClass: 'truck',
  wikipediaUrl: 'https://en.wikipedia.org/wiki/Toyota_Tundra',
  years: [
    Y(2015, [
      T('SR 4.6L i-FORCE V8 4x2', 'RWD', '4.6L i-FORCE V8', 5040, 6800, 1730, 12700),
      T('SR5 5.7L i-FORCE V8 4x4', '4WD', '5.7L i-FORCE V8', 5430, 9800, 1605, 16000),
      T5('1794 5.7L i-FORCE V8 4x4 Max Tow', '4WD', '5.7L i-FORCE V8', 5670, 10500, 1535, 16000)
    ]),
    Y(2016, [
      T('SR 4.6L i-FORCE V8 4x2', 'RWD', '4.6L i-FORCE V8', 5040, 6800, 1730, 12700),
      T('SR5 5.7L i-FORCE V8 4x4', '4WD', '5.7L i-FORCE V8', 5430, 9800, 1605, 16000),
      T5('1794 5.7L i-FORCE V8 4x4 Max Tow', '4WD', '5.7L i-FORCE V8', 5670, 10500, 1535, 16000)
    ]),
    Y(2017, [
      T('SR 4.6L i-FORCE V8 4x2', 'RWD', '4.6L i-FORCE V8', 5040, 6800, 1730, 12700),
      T('SR5 5.7L i-FORCE V8 4x4', '4WD', '5.7L i-FORCE V8', 5430, 9800, 1605, 16000),
      T5('1794 5.7L i-FORCE V8 4x4 Max Tow', '4WD', '5.7L i-FORCE V8', 5670, 10200, 1535, 16000)
    ]),
    Y(2018, [
      T('SR 4.6L i-FORCE V8 4x2', 'RWD', '4.6L i-FORCE V8', 5040, 6800, 1730, 12700),
      T('SR5 5.7L i-FORCE V8 4x4', '4WD', '5.7L i-FORCE V8', 5430, 9800, 1605, 16000),
      T5('1794 5.7L i-FORCE V8 4x4 Max Tow', '4WD', '5.7L i-FORCE V8', 5670, 10200, 1535, 16000)
    ]),
    Y(2019, [
      T('SR 5.7L i-FORCE V8 4x2', 'RWD', '5.7L i-FORCE V8', 5240, 9800, 1730, 16000),
      T('SR5 5.7L i-FORCE V8 4x4', '4WD', '5.7L i-FORCE V8', 5430, 9800, 1605, 16000),
      T5('1794 5.7L i-FORCE V8 4x4 Max Tow', '4WD', '5.7L i-FORCE V8', 5670, 10200, 1535, 16000)
    ]),
    Y(2020, [
      T('SR 5.7L i-FORCE V8 4x2', 'RWD', '5.7L i-FORCE V8', 5240, 9800, 1730, 16000),
      T('SR5 5.7L i-FORCE V8 4x4', '4WD', '5.7L i-FORCE V8', 5430, 9800, 1605, 16000),
      T5('1794 5.7L i-FORCE V8 4x4 Max Tow', '4WD', '5.7L i-FORCE V8', 5670, 10200, 1535, 16000)
    ]),
    Y(2021, [
      T('SR 5.7L i-FORCE V8 4x2', 'RWD', '5.7L i-FORCE V8', 5240, 9800, 1730, 16000),
      T('SR5 5.7L i-FORCE V8 4x4', '4WD', '5.7L i-FORCE V8', 5430, 9800, 1605, 16000),
      T5('1794 5.7L i-FORCE V8 4x4 Max Tow', '4WD', '5.7L i-FORCE V8', 5670, 10200, 1535, 16000)
    ]),
    Y(2022, [
      T('SR 3.5L i-FORCE V6 Twin-Turbo 4x2', 'RWD', '3.5L i-FORCE Twin-Turbo V6', 5095, 8300, 1940, 14000),
      T('SR5 3.5L i-FORCE V6 Twin-Turbo 4x4', '4WD', '3.5L i-FORCE Twin-Turbo V6', 5365, 12000, 1730, 17400),
      T5('Limited 3.5L i-FORCE MAX Hybrid 4x4', '4WD', '3.5L i-FORCE MAX Hybrid V6', 5945, 11450, 1730, 17400),
      T5('TRD Pro 3.5L i-FORCE MAX Hybrid 4x4', '4WD', '3.5L i-FORCE MAX Hybrid V6', 6160, 11175, 1485, 17400)
    ]),
    Y(2023, [
      T('SR 3.5L i-FORCE V6 Twin-Turbo 4x2', 'RWD', '3.5L i-FORCE Twin-Turbo V6', 5095, 8300, 1940, 14000),
      T('SR5 3.5L i-FORCE V6 Twin-Turbo 4x4', '4WD', '3.5L i-FORCE Twin-Turbo V6', 5365, 12000, 1730, 17400),
      T5('Limited 3.5L i-FORCE MAX Hybrid 4x4', '4WD', '3.5L i-FORCE MAX Hybrid V6', 5945, 11450, 1730, 17400),
      T5('TRD Pro 3.5L i-FORCE MAX Hybrid 4x4', '4WD', '3.5L i-FORCE MAX Hybrid V6', 6160, 11175, 1485, 17400)
    ]),
    Y(2024, [
      T('SR 3.5L i-FORCE V6 Twin-Turbo 4x2', 'RWD', '3.5L i-FORCE Twin-Turbo V6', 5095, 8300, 1940, 14000),
      T('SR5 3.5L i-FORCE V6 Twin-Turbo 4x4', '4WD', '3.5L i-FORCE Twin-Turbo V6', 5365, 12000, 1730, 17400),
      T5('Limited 3.5L i-FORCE MAX Hybrid 4x4', '4WD', '3.5L i-FORCE MAX Hybrid V6', 5945, 11400, 1730, 17400),
      T5('TRD Pro 3.5L i-FORCE MAX Hybrid 4x4', '4WD', '3.5L i-FORCE MAX Hybrid V6', 6160, 11175, 1485, 17400)
    ]),
    Y(2025, [
      T('SR 3.5L i-FORCE V6 Twin-Turbo 4x2', 'RWD', '3.5L i-FORCE Twin-Turbo V6', 5095, 8300, 1940, 14000),
      T('SR5 3.5L i-FORCE V6 Twin-Turbo 4x4', '4WD', '3.5L i-FORCE Twin-Turbo V6', 5365, 12000, 1730, 17400),
      T5('Limited 3.5L i-FORCE MAX Hybrid 4x4', '4WD', '3.5L i-FORCE MAX Hybrid V6', 5945, 11400, 1730, 17400),
      T5('TRD Pro 3.5L i-FORCE MAX Hybrid 4x4', '4WD', '3.5L i-FORCE MAX Hybrid V6', 6160, 11175, 1485, 17400)
    ]),
    Y(2026, [
      T('SR 3.5L i-FORCE V6 Twin-Turbo 4x2', 'RWD', '3.5L i-FORCE Twin-Turbo V6', 5095, 8300, 1940, 14000),
      T('SR5 3.5L i-FORCE V6 Twin-Turbo 4x4', '4WD', '3.5L i-FORCE Twin-Turbo V6', 5365, 12000, 1730, 17400),
      T5('Limited 3.5L i-FORCE MAX Hybrid 4x4', '4WD', '3.5L i-FORCE MAX Hybrid V6', 5945, 11400, 1730, 17400),
      T5('TRD Pro 3.5L i-FORCE MAX Hybrid 4x4', '4WD', '3.5L i-FORCE MAX Hybrid V6', 6160, 11175, 1485, 17400)
    ])
  ]
};

// ============================================================
// 6. Ford F-250 Super Duty (P558 2017-2022, 2023+ refresh)
// ============================================================
const f250 = {
  make: 'Ford',
  model: 'F-250 Super Duty',
  vehicleClass: 'truck',
  wikipediaUrl: 'https://en.wikipedia.org/wiki/Ford_Super_Duty',
  years: [
    Y(2015, [
      T5('XL 6.2L V8 4x2', 'RWD', '6.2L Boss V8', 6310, 12500, 3080, 20000),
      T5('XLT 6.7L Power Stroke Diesel 4x4', '4WD', '6.7L Power Stroke V8 Turbo-Diesel', 7480, 16600, 3450, 25600),
      T5('Lariat 6.7L Power Stroke Diesel 4x4 Max Tow', '4WD', '6.7L Power Stroke V8 Turbo-Diesel', 7480, 19500, 3450, 26500)
    ]),
    Y(2016, [
      T5('XL 6.2L V8 4x2', 'RWD', '6.2L Boss V8', 6310, 12500, 3080, 20000),
      T5('XLT 6.7L Power Stroke Diesel 4x4', '4WD', '6.7L Power Stroke V8 Turbo-Diesel', 7480, 16600, 3450, 25600),
      T5('Lariat 6.7L Power Stroke Diesel 4x4 Max Tow', '4WD', '6.7L Power Stroke V8 Turbo-Diesel', 7480, 19500, 3450, 26500)
    ]),
    Y(2017, [
      T5('XL 6.2L V8 4x2', 'RWD', '6.2L Boss V8', 6310, 13000, 3760, 22000),
      T5('XLT 6.7L Power Stroke Diesel 4x4', '4WD', '6.7L Power Stroke V8 Turbo-Diesel (2nd gen)', 7460, 18500, 3450, 26500),
      T5('Lariat 6.7L Power Stroke Diesel 4x4 Max Tow', '4WD', '6.7L Power Stroke V8 Turbo-Diesel (2nd gen)', 7460, 19500, 3450, 26500)
    ]),
    Y(2018, [
      T5('XL 6.2L V8 4x2', 'RWD', '6.2L Boss V8', 6310, 13000, 3760, 22000),
      T5('XLT 6.7L Power Stroke Diesel 4x4', '4WD', '6.7L Power Stroke V8 Turbo-Diesel (2nd gen)', 7460, 18500, 3450, 26500),
      T5('Lariat 6.7L Power Stroke Diesel 4x4 Max Tow', '4WD', '6.7L Power Stroke V8 Turbo-Diesel (2nd gen)', 7460, 19500, 3450, 26500)
    ]),
    Y(2019, [
      T5('XL 6.2L V8 4x2', 'RWD', '6.2L Boss V8', 6310, 13000, 3760, 22000),
      T5('XLT 6.7L Power Stroke Diesel 4x4', '4WD', '6.7L Power Stroke V8 Turbo-Diesel (2nd gen)', 7460, 18500, 3450, 26500),
      T5('Lariat 6.7L Power Stroke Diesel 4x4 Max Tow', '4WD', '6.7L Power Stroke V8 Turbo-Diesel (2nd gen)', 7460, 19500, 3450, 26500)
    ]),
    Y(2020, [
      T5('XL 6.2L V8 4x2', 'RWD', '6.2L Boss V8', 6310, 13000, 3760, 22000),
      T5('XLT 7.3L Godzilla V8 4x4', '4WD', '7.3L Godzilla V8', 6680, 15000, 4260, 23000),
      T5('Lariat 6.7L Power Stroke Diesel 4x4 Max Tow', '4WD', '6.7L Power Stroke V8 Turbo-Diesel (3rd gen)', 7860, 20000, 3870, 26500)
    ]),
    Y(2021, [
      T5('XL 6.2L V8 4x2', 'RWD', '6.2L Boss V8', 6310, 13000, 3760, 22000),
      T5('XLT 7.3L Godzilla V8 4x4', '4WD', '7.3L Godzilla V8', 6680, 15000, 4260, 23000),
      T5('Lariat 6.7L Power Stroke Diesel 4x4 Max Tow', '4WD', '6.7L Power Stroke V8 Turbo-Diesel (3rd gen)', 7860, 20000, 3870, 26500)
    ]),
    Y(2022, [
      T5('XL 6.2L V8 4x2', 'RWD', '6.2L Boss V8', 6310, 13000, 3760, 22000),
      T5('XLT 7.3L Godzilla V8 4x4', '4WD', '7.3L Godzilla V8', 6680, 15000, 4260, 23000),
      T5('Lariat 6.7L Power Stroke Diesel 4x4 Max Tow', '4WD', '6.7L Power Stroke V8 Turbo-Diesel (3rd gen)', 7860, 20000, 3870, 26500)
    ]),
    Y(2023, [
      T5('XL 6.8L V8 4x2', 'RWD', '6.8L Triton V8', 6310, 13000, 3760, 22000),
      T5('XLT 7.3L Godzilla V8 4x4', '4WD', '7.3L Godzilla V8', 6680, 15000, 4260, 23000),
      T5('Lariat 6.7L High-Output Power Stroke 4x4 Max Tow', '4WD', '6.7L High-Output Power Stroke V8 Turbo-Diesel', 7860, 23000, 3870, 28500)
    ]),
    Y(2024, [
      T5('XL 6.8L V8 4x2', 'RWD', '6.8L Triton V8', 6310, 13000, 3760, 22000),
      T5('XLT 7.3L Godzilla V8 4x4', '4WD', '7.3L Godzilla V8', 6680, 15000, 4260, 23000),
      T5('Lariat 6.7L High-Output Power Stroke 4x4 Max Tow', '4WD', '6.7L High-Output Power Stroke V8 Turbo-Diesel', 7860, 23000, 3870, 28500)
    ]),
    Y(2025, [
      T5('XL 6.8L V8 4x2', 'RWD', '6.8L Triton V8', 6310, 13000, 3760, 22000),
      T5('XLT 7.3L Godzilla V8 4x4', '4WD', '7.3L Godzilla V8', 6680, 15000, 4260, 23000),
      T5('Lariat 6.7L High-Output Power Stroke 4x4 Max Tow', '4WD', '6.7L High-Output Power Stroke V8 Turbo-Diesel', 7860, 23000, 3870, 28500)
    ]),
    Y(2026, [
      T5('XL 6.8L V8 4x2', 'RWD', '6.8L Triton V8', 6310, 13000, 3760, 22000),
      T5('XLT 7.3L Godzilla V8 4x4', '4WD', '7.3L Godzilla V8', 6680, 15000, 4260, 23000),
      T5('Lariat 6.7L High-Output Power Stroke 4x4 Max Tow', '4WD', '6.7L High-Output Power Stroke V8 Turbo-Diesel', 7860, 23000, 3870, 28500)
    ])
  ]
};

// ============================================================
// 7. Ford F-350 Super Duty
// ============================================================
const f350 = {
  make: 'Ford',
  model: 'F-350 Super Duty',
  vehicleClass: 'truck',
  wikipediaUrl: 'https://en.wikipedia.org/wiki/Ford_Super_Duty',
  years: [
    Y(2015, [
      T5('XL 6.2L V8 SRW 4x2', 'RWD', '6.2L Boss V8', 6650, 14000, 4080, 23500),
      T5('XLT 6.7L Power Stroke SRW 4x4', '4WD', '6.7L Power Stroke V8 Turbo-Diesel', 7720, 16600, 3850, 25700),
      T5('Lariat 6.7L Power Stroke DRW 4x4 Max Tow', '4WD', '6.7L Power Stroke V8 Turbo-Diesel', 8230, 26500, 5710, 35000)
    ]),
    Y(2016, [
      T5('XL 6.2L V8 SRW 4x2', 'RWD', '6.2L Boss V8', 6650, 14000, 4080, 23500),
      T5('XLT 6.7L Power Stroke SRW 4x4', '4WD', '6.7L Power Stroke V8 Turbo-Diesel', 7720, 16600, 3850, 25700),
      T5('Lariat 6.7L Power Stroke DRW 4x4 Max Tow', '4WD', '6.7L Power Stroke V8 Turbo-Diesel', 8230, 26500, 5710, 35000)
    ]),
    Y(2017, [
      T5('XL 6.2L V8 SRW 4x2', 'RWD', '6.2L Boss V8', 6650, 15000, 4030, 23500),
      T5('XLT 6.7L Power Stroke SRW 4x4', '4WD', '6.7L Power Stroke V8 Turbo-Diesel (2nd gen)', 7720, 21000, 4080, 30000),
      T5('Lariat 6.7L Power Stroke DRW 4x4 Max Tow', '4WD', '6.7L Power Stroke V8 Turbo-Diesel (2nd gen)', 8230, 32500, 7630, 40000)
    ]),
    Y(2018, [
      T5('XL 6.2L V8 SRW 4x2', 'RWD', '6.2L Boss V8', 6650, 15000, 4030, 23500),
      T5('XLT 6.7L Power Stroke SRW 4x4', '4WD', '6.7L Power Stroke V8 Turbo-Diesel (2nd gen)', 7720, 21000, 4080, 30000),
      T5('Lariat 6.7L Power Stroke DRW 4x4 Max Tow', '4WD', '6.7L Power Stroke V8 Turbo-Diesel (2nd gen)', 8230, 35000, 7630, 43000)
    ]),
    Y(2019, [
      T5('XL 6.2L V8 SRW 4x2', 'RWD', '6.2L Boss V8', 6650, 15000, 4030, 23500),
      T5('XLT 6.7L Power Stroke SRW 4x4', '4WD', '6.7L Power Stroke V8 Turbo-Diesel (2nd gen)', 7720, 21000, 4080, 30000),
      T5('Lariat 6.7L Power Stroke DRW 4x4 Max Tow', '4WD', '6.7L Power Stroke V8 Turbo-Diesel (2nd gen)', 8230, 35000, 7630, 43000)
    ]),
    Y(2020, [
      T5('XL 6.2L V8 SRW 4x2', 'RWD', '6.2L Boss V8', 6650, 15000, 4030, 23500),
      T5('XLT 7.3L Godzilla V8 SRW 4x4', '4WD', '7.3L Godzilla V8', 7050, 21200, 4320, 30000),
      T5('Lariat 6.7L Power Stroke DRW 4x4 Max Tow', '4WD', '6.7L Power Stroke V8 Turbo-Diesel (3rd gen)', 8230, 37000, 7850, 45000)
    ]),
    Y(2021, [
      T5('XL 6.2L V8 SRW 4x2', 'RWD', '6.2L Boss V8', 6650, 15000, 4030, 23500),
      T5('XLT 7.3L Godzilla V8 SRW 4x4', '4WD', '7.3L Godzilla V8', 7050, 21200, 4320, 30000),
      T5('Lariat 6.7L Power Stroke DRW 4x4 Max Tow', '4WD', '6.7L Power Stroke V8 Turbo-Diesel (3rd gen)', 8230, 37000, 7850, 45000)
    ]),
    Y(2022, [
      T5('XL 6.2L V8 SRW 4x2', 'RWD', '6.2L Boss V8', 6650, 15000, 4030, 23500),
      T5('XLT 7.3L Godzilla V8 SRW 4x4', '4WD', '7.3L Godzilla V8', 7050, 21200, 4320, 30000),
      T5('Lariat 6.7L Power Stroke DRW 4x4 Max Tow', '4WD', '6.7L Power Stroke V8 Turbo-Diesel (3rd gen)', 8230, 37000, 7850, 45000)
    ]),
    Y(2023, [
      T5('XL 6.8L V8 SRW 4x2', 'RWD', '6.8L Triton V8', 6650, 15000, 4030, 23500),
      T5('XLT 7.3L Godzilla V8 SRW 4x4', '4WD', '7.3L Godzilla V8', 7050, 21200, 4320, 30000),
      T5('Lariat 6.7L High-Output Power Stroke DRW 4x4 Max Tow', '4WD', '6.7L High-Output Power Stroke V8 Turbo-Diesel', 8550, 40000, 8000, 47000)
    ]),
    Y(2024, [
      T5('XL 6.8L V8 SRW 4x2', 'RWD', '6.8L Triton V8', 6650, 15000, 4030, 23500),
      T5('XLT 7.3L Godzilla V8 SRW 4x4', '4WD', '7.3L Godzilla V8', 7050, 21200, 4320, 30000),
      T5('Lariat 6.7L High-Output Power Stroke DRW 4x4 Max Tow', '4WD', '6.7L High-Output Power Stroke V8 Turbo-Diesel', 8550, 40000, 8000, 47000)
    ]),
    Y(2025, [
      T5('XL 6.8L V8 SRW 4x2', 'RWD', '6.8L Triton V8', 6650, 15000, 4030, 23500),
      T5('XLT 7.3L Godzilla V8 SRW 4x4', '4WD', '7.3L Godzilla V8', 7050, 21200, 4320, 30000),
      T5('Lariat 6.7L High-Output Power Stroke DRW 4x4 Max Tow', '4WD', '6.7L High-Output Power Stroke V8 Turbo-Diesel', 8550, 40000, 8000, 47000)
    ]),
    Y(2026, [
      T5('XL 6.8L V8 SRW 4x2', 'RWD', '6.8L Triton V8', 6650, 15000, 4030, 23500),
      T5('XLT 7.3L Godzilla V8 SRW 4x4', '4WD', '7.3L Godzilla V8', 7050, 21200, 4320, 30000),
      T5('Lariat 6.7L High-Output Power Stroke DRW 4x4 Max Tow', '4WD', '6.7L High-Output Power Stroke V8 Turbo-Diesel', 8550, 40000, 8000, 47000)
    ])
  ]
};

// ============================================================
// 8. Chevrolet Silverado 2500HD
// ============================================================
const silverado2500 = {
  make: 'Chevrolet',
  model: 'Silverado 2500HD',
  vehicleClass: 'truck',
  wikipediaUrl: 'https://en.wikipedia.org/wiki/Chevrolet_Silverado',
  years: [
    Y(2015, [
      T5('WT 6.0L Vortec V8 4x2', 'RWD', '6.0L Vortec V8', 6313, 14500, 3534, 22000),
      T5('LT 6.6L Duramax Diesel 4x4', '4WD', '6.6L Duramax LML V8 Turbo-Diesel', 6840, 17900, 3001, 25000),
      T5('LTZ 6.6L Duramax Diesel 4x4 Max Tow', '4WD', '6.6L Duramax LML V8 Turbo-Diesel', 6840, 17900, 3001, 25000)
    ]),
    Y(2016, [
      T5('WT 6.0L Vortec V8 4x2', 'RWD', '6.0L Vortec V8', 6313, 14500, 3534, 22000),
      T5('LT 6.6L Duramax Diesel 4x4', '4WD', '6.6L Duramax LML V8 Turbo-Diesel', 6840, 17900, 3001, 25000),
      T5('LTZ 6.6L Duramax Diesel 4x4 Max Tow', '4WD', '6.6L Duramax LML V8 Turbo-Diesel', 6840, 17900, 3001, 25000)
    ]),
    Y(2017, [
      T5('WT 6.0L Vortec V8 4x2', 'RWD', '6.0L Vortec V8', 6313, 14500, 3534, 22000),
      T5('LT 6.6L Duramax Diesel 4x4', '4WD', '6.6L Duramax L5P V8 Turbo-Diesel', 6840, 18100, 3534, 25400),
      T5('High Country 6.6L Duramax Diesel 4x4 Max Tow', '4WD', '6.6L Duramax L5P V8 Turbo-Diesel', 6840, 18100, 3534, 25400)
    ]),
    Y(2018, [
      T5('WT 6.0L Vortec V8 4x2', 'RWD', '6.0L Vortec V8', 6313, 14500, 3534, 22000),
      T5('LT 6.6L Duramax Diesel 4x4', '4WD', '6.6L Duramax L5P V8 Turbo-Diesel', 6840, 18100, 3534, 25400),
      T5('High Country 6.6L Duramax Diesel 4x4 Max Tow', '4WD', '6.6L Duramax L5P V8 Turbo-Diesel', 6840, 18100, 3534, 25400)
    ]),
    Y(2019, [
      T5('WT 6.0L Vortec V8 4x2', 'RWD', '6.0L Vortec V8', 6313, 14500, 3534, 22000),
      T5('LT 6.6L Duramax Diesel 4x4', '4WD', '6.6L Duramax L5P V8 Turbo-Diesel', 6840, 18100, 3534, 25400),
      T5('High Country 6.6L Duramax Diesel 4x4 Max Tow', '4WD', '6.6L Duramax L5P V8 Turbo-Diesel', 6840, 18100, 3534, 25400)
    ]),
    Y(2020, [
      T5('WT 6.6L L8T V8 4x2', 'RWD', '6.6L L8T V8', 6580, 17370, 3979, 25400),
      T5('LT 6.6L Duramax Diesel 4x4', '4WD', '6.6L Duramax L5P V8 Turbo-Diesel', 7110, 18500, 3517, 26000),
      T5('High Country 6.6L Duramax Diesel 4x4 Max Tow', '4WD', '6.6L Duramax L5P V8 Turbo-Diesel', 7110, 18500, 3517, 26000)
    ]),
    Y(2021, [
      T5('WT 6.6L L8T V8 4x2', 'RWD', '6.6L L8T V8', 6580, 17370, 3979, 25400),
      T5('LT 6.6L Duramax Diesel 4x4', '4WD', '6.6L Duramax L5P V8 Turbo-Diesel', 7110, 18500, 3517, 26000),
      T5('High Country 6.6L Duramax Diesel 4x4 Max Tow', '4WD', '6.6L Duramax L5P V8 Turbo-Diesel', 7110, 18500, 3517, 26000)
    ]),
    Y(2022, [
      T5('WT 6.6L L8T V8 4x2', 'RWD', '6.6L L8T V8', 6580, 17370, 3979, 25400),
      T5('LT 6.6L Duramax Diesel 4x4', '4WD', '6.6L Duramax L5P V8 Turbo-Diesel', 7110, 18500, 3517, 26000),
      T5('High Country 6.6L Duramax Diesel 4x4 Max Tow', '4WD', '6.6L Duramax L5P V8 Turbo-Diesel', 7110, 18500, 3517, 26000)
    ]),
    Y(2023, [
      T5('WT 6.6L L8T V8 4x2', 'RWD', '6.6L L8T V8', 6580, 17000, 3979, 25400),
      T5('LT 6.6L Duramax Diesel 4x4', '4WD', '6.6L Duramax L5P V8 Turbo-Diesel', 7110, 18510, 3517, 26000),
      T5('High Country 6.6L Duramax Diesel 4x4 Max Tow', '4WD', '6.6L Duramax L5P V8 Turbo-Diesel', 7110, 22500, 3517, 30000)
    ]),
    Y(2024, [
      T5('WT 6.6L L8T V8 4x2', 'RWD', '6.6L L8T V8', 6580, 17000, 3979, 25400),
      T5('LT 6.6L Duramax Diesel 4x4', '4WD', '6.6L Duramax L5P V8 Turbo-Diesel', 7110, 20000, 3517, 27500),
      T5('High Country 6.6L Duramax Diesel 4x4 Max Tow', '4WD', '6.6L Duramax L5P V8 Turbo-Diesel', 7110, 22500, 3517, 30000)
    ]),
    Y(2025, [
      T5('WT 6.6L L8T V8 4x2', 'RWD', '6.6L L8T V8', 6580, 17000, 3979, 25400),
      T5('LT 6.6L Duramax Diesel 4x4', '4WD', '6.6L Duramax L5P V8 Turbo-Diesel', 7110, 20000, 3517, 27500),
      T5('High Country 6.6L Duramax Diesel 4x4 Max Tow', '4WD', '6.6L Duramax L5P V8 Turbo-Diesel', 7110, 22500, 3517, 30000)
    ]),
    Y(2026, [
      T5('WT 6.6L L8T V8 4x2', 'RWD', '6.6L L8T V8', 6580, 17000, 3979, 25400),
      T5('LT 6.6L Duramax Diesel 4x4', '4WD', '6.6L Duramax L5P V8 Turbo-Diesel', 7110, 20000, 3517, 27500),
      T5('High Country 6.6L Duramax Diesel 4x4 Max Tow', '4WD', '6.6L Duramax L5P V8 Turbo-Diesel', 7110, 22500, 3517, 30000)
    ])
  ]
};

// ============================================================
// 9. GMC Sierra 1500
// ============================================================
const sierra1500 = {
  make: 'GMC',
  model: 'Sierra 1500',
  vehicleClass: 'truck',
  wikipediaUrl: 'https://en.wikipedia.org/wiki/GMC_Sierra',
  years: [
    Y(2015, [
      T('Base 4.3L EcoTec3 V6 4x2', 'RWD', '4.3L EcoTec3 V6', 4690, 7600, 1750, 12000),
      T('SLE 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5230, 11200, 1990, 16000),
      T5('Denali 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5460, 12000, 1900, 17000)
    ]),
    Y(2016, [
      T('Base 4.3L EcoTec3 V6 4x2', 'RWD', '4.3L EcoTec3 V6', 4690, 7600, 1750, 12000),
      T('SLE 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5230, 11200, 1990, 16000),
      T5('Denali 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5460, 12000, 1900, 17000)
    ]),
    Y(2017, [
      T('Base 4.3L EcoTec3 V6 4x2', 'RWD', '4.3L EcoTec3 V6', 4690, 7600, 1750, 12000),
      T('SLE 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5230, 11200, 1990, 16000),
      T5('Denali 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5460, 12500, 1900, 17500)
    ]),
    Y(2018, [
      T('Base 4.3L EcoTec3 V6 4x2', 'RWD', '4.3L EcoTec3 V6', 4690, 7600, 1750, 12000),
      T('SLE 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5230, 11200, 1990, 16000),
      T5('Denali 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5460, 12500, 1900, 17500)
    ]),
    Y(2019, [
      T('Base 4.3L EcoTec3 V6 4x2', 'RWD', '4.3L EcoTec3 V6', 4520, 7900, 2000, 12500),
      T('SLE 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5240, 11500, 2250, 16400),
      T5('Denali 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5400, 12200, 2150, 17000)
    ]),
    Y(2020, [
      T('Base 4.3L EcoTec3 V6 4x2', 'RWD', '4.3L EcoTec3 V6', 4520, 7900, 2000, 12500),
      T('SLT 2.7L Turbo I-4 4x4', '4WD', '2.7L Turbo I-4', 4660, 9500, 2280, 13900),
      T5('Denali 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 5240, 9300, 1870, 14000),
      T5('AT4 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5400, 12100, 1690, 17000)
    ]),
    Y(2021, [
      T('Base 4.3L EcoTec3 V6 4x2', 'RWD', '4.3L EcoTec3 V6', 4520, 7900, 2000, 12500),
      T('SLT 2.7L Turbo I-4 4x4', '4WD', '2.7L Turbo I-4', 4660, 9500, 2280, 13900),
      T5('Denali 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 5240, 9500, 1870, 14000),
      T5('AT4 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5400, 11800, 1690, 17000)
    ]),
    Y(2022, [
      T('Pro 2.7L Turbo I-4 4x2', 'RWD', '2.7L Turbo I-4', 4520, 9500, 2280, 13900),
      T('SLE 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5240, 11500, 2250, 16400),
      T5('Denali 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 5240, 13000, 1870, 17500),
      T5('Denali Ultimate 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5400, 11800, 1690, 17000)
    ]),
    Y(2023, [
      T('Pro 2.7L TurboMax I-4 4x2', 'RWD', '2.7L TurboMax I-4', 4520, 9500, 2280, 13900),
      T('SLE 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5240, 11500, 2250, 16400),
      T5('Denali 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 5240, 13000, 1870, 17500),
      T5('AT4X 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5400, 8700, 1490, 14400)
    ]),
    Y(2024, [
      T('Pro 2.7L TurboMax I-4 4x2', 'RWD', '2.7L TurboMax I-4', 4520, 9500, 2280, 13900),
      T('SLE 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5240, 11300, 1980, 16400),
      T5('Denali 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 5240, 13300, 1870, 17500),
      T5('Denali Ultimate 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5400, 13000, 1690, 18000)
    ]),
    Y(2025, [
      T('Pro 2.7L TurboMax I-4 4x2', 'RWD', '2.7L TurboMax I-4', 4520, 9500, 2280, 13900),
      T('SLE 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5240, 11300, 1980, 16400),
      T5('Denali 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 5240, 13300, 1870, 17500),
      T5('Denali Ultimate 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5400, 13000, 1690, 18000)
    ]),
    Y(2026, [
      T('Pro 2.7L TurboMax I-4 4x2', 'RWD', '2.7L TurboMax I-4', 4520, 9500, 2280, 13900),
      T('SLE 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5240, 11300, 1980, 16400),
      T5('Denali 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 5240, 13300, 1870, 17500),
      T5('Denali Ultimate 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5400, 13000, 1690, 18000)
    ])
  ]
};

// ============================================================
// 10. Ram 2500
// ============================================================
const ram2500 = {
  make: 'Ram',
  model: '2500',
  vehicleClass: 'truck',
  wikipediaUrl: 'https://en.wikipedia.org/wiki/Ram_pickup',
  years: [
    Y(2015, [
      T5('Tradesman 5.7L HEMI V8 4x2', 'RWD', '5.7L HEMI V8', 6242, 13900, 2950, 18000),
      T5('Big Horn 6.4L HEMI V8 4x4', '4WD', '6.4L HEMI V8', 7194, 16320, 4010, 22000),
      T5('Laramie 6.7L Cummins Diesel 4x4 Max Tow', '4WD', '6.7L Cummins Turbo-Diesel I-6', 7600, 17970, 2890, 25000)
    ]),
    Y(2016, [
      T5('Tradesman 5.7L HEMI V8 4x2', 'RWD', '5.7L HEMI V8', 6242, 13900, 2950, 18000),
      T5('Big Horn 6.4L HEMI V8 4x4', '4WD', '6.4L HEMI V8', 7194, 16320, 4010, 22000),
      T5('Laramie 6.7L Cummins Diesel 4x4 Max Tow', '4WD', '6.7L Cummins Turbo-Diesel I-6', 7600, 17970, 2890, 25000)
    ]),
    Y(2017, [
      T5('Tradesman 5.7L HEMI V8 4x2', 'RWD', '5.7L HEMI V8', 6242, 13890, 2950, 18000),
      T5('Big Horn 6.4L HEMI V8 4x4', '4WD', '6.4L HEMI V8', 7194, 17970, 4010, 22000),
      T5('Laramie 6.7L Cummins Diesel 4x4 Max Tow', '4WD', '6.7L Cummins Turbo-Diesel I-6', 7600, 17980, 2890, 25000)
    ]),
    Y(2018, [
      T5('Tradesman 5.7L HEMI V8 4x2', 'RWD', '5.7L HEMI V8', 6242, 13890, 2950, 18000),
      T5('Big Horn 6.4L HEMI V8 4x4', '4WD', '6.4L HEMI V8', 7194, 17970, 4010, 22000),
      T5('Laramie 6.7L Cummins Diesel 4x4 Max Tow', '4WD', '6.7L Cummins Turbo-Diesel I-6', 7600, 17980, 2890, 25000)
    ]),
    Y(2019, [
      T5('Tradesman 6.4L HEMI V8 4x2', 'RWD', '6.4L HEMI V8', 6493, 17580, 3990, 22000),
      T5('Big Horn 6.4L HEMI V8 4x4', '4WD', '6.4L HEMI V8', 7194, 17580, 3160, 22000),
      T5('Laramie 6.7L Cummins HO Diesel 4x4 Max Tow', '4WD', '6.7L Cummins HO Turbo-Diesel I-6', 7600, 19680, 3160, 25000)
    ]),
    Y(2020, [
      T5('Tradesman 6.4L HEMI V8 4x2', 'RWD', '6.4L HEMI V8', 6493, 17580, 3990, 22000),
      T5('Big Horn 6.4L HEMI V8 4x4', '4WD', '6.4L HEMI V8', 7194, 17580, 3160, 22000),
      T5('Laramie 6.7L Cummins HO Diesel 4x4 Max Tow', '4WD', '6.7L Cummins HO Turbo-Diesel I-6', 7600, 19680, 3160, 25000)
    ]),
    Y(2021, [
      T5('Tradesman 6.4L HEMI V8 4x2', 'RWD', '6.4L HEMI V8', 6493, 17580, 3990, 22000),
      T5('Big Horn 6.4L HEMI V8 4x4', '4WD', '6.4L HEMI V8', 7194, 17580, 3160, 22000),
      T5('Laramie 6.7L Cummins HO Diesel 4x4 Max Tow', '4WD', '6.7L Cummins HO Turbo-Diesel I-6', 7600, 19680, 3160, 25000)
    ]),
    Y(2022, [
      T5('Tradesman 6.4L HEMI V8 4x2', 'RWD', '6.4L HEMI V8', 6493, 17580, 3990, 22000),
      T5('Big Horn 6.4L HEMI V8 4x4', '4WD', '6.4L HEMI V8', 7194, 17580, 3160, 22000),
      T5('Laramie 6.7L Cummins HO Diesel 4x4 Max Tow', '4WD', '6.7L Cummins HO Turbo-Diesel I-6', 7600, 20000, 3160, 25000)
    ]),
    Y(2023, [
      T5('Tradesman 6.4L HEMI V8 4x2', 'RWD', '6.4L HEMI V8', 6493, 17580, 3990, 22000),
      T5('Big Horn 6.4L HEMI V8 4x4', '4WD', '6.4L HEMI V8', 7194, 17580, 3160, 22000),
      T5('Laramie 6.7L Cummins HO Diesel 4x4 Max Tow', '4WD', '6.7L Cummins HO Turbo-Diesel I-6', 7600, 20000, 3160, 25000)
    ]),
    Y(2024, [
      T5('Tradesman 6.4L HEMI V8 4x2', 'RWD', '6.4L HEMI V8', 6493, 17560, 3990, 22000),
      T5('Big Horn 6.4L HEMI V8 4x4', '4WD', '6.4L HEMI V8', 7194, 17560, 3160, 22000),
      T5('Laramie 6.7L Cummins HO Diesel 4x4 Max Tow', '4WD', '6.7L Cummins HO Turbo-Diesel I-6', 7600, 20000, 3160, 25000)
    ]),
    Y(2025, [
      T5('Tradesman 6.4L HEMI V8 4x2', 'RWD', '6.4L HEMI V8', 6493, 17540, 3990, 22000),
      T5('Big Horn 6.7L Cummins Diesel 4x4', '4WD', '6.7L Cummins Turbo-Diesel I-6', 7400, 18460, 2980, 23000),
      T5('Laramie 6.7L Cummins HO Diesel 4x4 Max Tow', '4WD', '6.7L Cummins HO Turbo-Diesel I-6', 7600, 19990, 3160, 25000)
    ]),
    Y(2026, [
      T5('Tradesman 6.4L HEMI V8 4x2', 'RWD', '6.4L HEMI V8', 6493, 17540, 3990, 22000),
      T5('Big Horn 6.7L Cummins Diesel 4x4', '4WD', '6.7L Cummins Turbo-Diesel I-6', 7400, 18460, 2980, 23000),
      T5('Laramie 6.7L Cummins HO Diesel 4x4 Max Tow', '4WD', '6.7L Cummins HO Turbo-Diesel I-6', 7600, 19990, 3160, 25000)
    ])
  ]
};

// ============================================================
// 11. Ram 3500
// ============================================================
const ram3500 = {
  make: 'Ram',
  model: '3500',
  vehicleClass: 'truck',
  wikipediaUrl: 'https://en.wikipedia.org/wiki/Ram_pickup',
  years: [
    Y(2015, [
      T5('Tradesman 5.7L HEMI V8 SRW 4x2', 'RWD', '5.7L HEMI V8', 6850, 13950, 4400, 23000),
      T5('Big Horn 6.4L HEMI V8 SRW 4x4', '4WD', '6.4L HEMI V8', 7400, 16320, 4150, 24000),
      T5('Laramie 6.7L Cummins Diesel DRW 4x4 Max Tow', '4WD', '6.7L Cummins Turbo-Diesel I-6', 8540, 30000, 6720, 39100)
    ]),
    Y(2016, [
      T5('Tradesman 5.7L HEMI V8 SRW 4x2', 'RWD', '5.7L HEMI V8', 6850, 13950, 4400, 23000),
      T5('Big Horn 6.4L HEMI V8 SRW 4x4', '4WD', '6.4L HEMI V8', 7400, 16320, 4150, 24000),
      T5('Laramie 6.7L Cummins Diesel DRW 4x4 Max Tow', '4WD', '6.7L Cummins Turbo-Diesel I-6', 8540, 31210, 6720, 39100)
    ]),
    Y(2017, [
      T5('Tradesman 5.7L HEMI V8 SRW 4x2', 'RWD', '5.7L HEMI V8', 6850, 13950, 4400, 23000),
      T5('Big Horn 6.4L HEMI V8 SRW 4x4', '4WD', '6.4L HEMI V8', 7400, 16320, 4150, 24000),
      T5('Laramie 6.7L Cummins Diesel DRW 4x4 Max Tow', '4WD', '6.7L Cummins Turbo-Diesel I-6', 8540, 31210, 6720, 39100)
    ]),
    Y(2018, [
      T5('Tradesman 5.7L HEMI V8 SRW 4x2', 'RWD', '5.7L HEMI V8', 6850, 13950, 4400, 23000),
      T5('Big Horn 6.4L HEMI V8 SRW 4x4', '4WD', '6.4L HEMI V8', 7400, 16320, 4150, 24000),
      T5('Laramie 6.7L Cummins Diesel DRW 4x4 Max Tow', '4WD', '6.7L Cummins Turbo-Diesel I-6', 8540, 31210, 6720, 39100)
    ]),
    Y(2019, [
      T5('Tradesman 6.4L HEMI V8 SRW 4x2', 'RWD', '6.4L HEMI V8', 6850, 16470, 4310, 22000),
      T5('Big Horn 6.4L HEMI V8 SRW 4x4', '4WD', '6.4L HEMI V8', 7400, 16470, 3160, 22000),
      T5('Laramie 6.7L Cummins HO Diesel DRW 4x4 Max Tow', '4WD', '6.7L Cummins HO Turbo-Diesel I-6', 8540, 35100, 7680, 43000)
    ]),
    Y(2020, [
      T5('Tradesman 6.4L HEMI V8 SRW 4x2', 'RWD', '6.4L HEMI V8', 6850, 16470, 4310, 22000),
      T5('Big Horn 6.4L HEMI V8 SRW 4x4', '4WD', '6.4L HEMI V8', 7400, 16470, 3160, 22000),
      T5('Laramie 6.7L Cummins HO Diesel DRW 4x4 Max Tow', '4WD', '6.7L Cummins HO Turbo-Diesel I-6', 8540, 35100, 7680, 43000)
    ]),
    Y(2021, [
      T5('Tradesman 6.4L HEMI V8 SRW 4x2', 'RWD', '6.4L HEMI V8', 6850, 16470, 4310, 22000),
      T5('Big Horn 6.4L HEMI V8 SRW 4x4', '4WD', '6.4L HEMI V8', 7400, 16470, 3160, 22000),
      T5('Laramie 6.7L Cummins HO Diesel DRW 4x4 Max Tow', '4WD', '6.7L Cummins HO Turbo-Diesel I-6', 8540, 37100, 7680, 45000)
    ]),
    Y(2022, [
      T5('Tradesman 6.4L HEMI V8 SRW 4x2', 'RWD', '6.4L HEMI V8', 6850, 16470, 4310, 22000),
      T5('Big Horn 6.4L HEMI V8 SRW 4x4', '4WD', '6.4L HEMI V8', 7400, 16470, 3160, 22000),
      T5('Laramie 6.7L Cummins HO Diesel DRW 4x4 Max Tow', '4WD', '6.7L Cummins HO Turbo-Diesel I-6', 8540, 37100, 7680, 45000)
    ]),
    Y(2023, [
      T5('Tradesman 6.4L HEMI V8 SRW 4x2', 'RWD', '6.4L HEMI V8', 6850, 16470, 4310, 22000),
      T5('Big Horn 6.4L HEMI V8 SRW 4x4', '4WD', '6.4L HEMI V8', 7400, 16470, 3160, 22000),
      T5('Laramie 6.7L Cummins HO Diesel DRW 4x4 Max Tow', '4WD', '6.7L Cummins HO Turbo-Diesel I-6', 8540, 37090, 7680, 45000)
    ]),
    Y(2024, [
      T5('Tradesman 6.4L HEMI V8 SRW 4x2', 'RWD', '6.4L HEMI V8', 6850, 16470, 4310, 22000),
      T5('Big Horn 6.4L HEMI V8 SRW 4x4', '4WD', '6.4L HEMI V8', 7400, 16470, 3160, 22000),
      T5('Laramie 6.7L Cummins HO Diesel DRW 4x4 Max Tow', '4WD', '6.7L Cummins HO Turbo-Diesel I-6', 8540, 36610, 7680, 45000)
    ]),
    Y(2025, [
      T5('Tradesman 6.4L HEMI V8 SRW 4x2', 'RWD', '6.4L HEMI V8', 6850, 17470, 4310, 23000),
      T5('Big Horn 6.7L Cummins Diesel SRW 4x4', '4WD', '6.7L Cummins Turbo-Diesel I-6', 7600, 22330, 3450, 27000),
      T5('Laramie 6.7L Cummins HO Diesel DRW 4x4 Max Tow', '4WD', '6.7L Cummins HO Turbo-Diesel I-6', 8540, 36610, 7680, 45000)
    ]),
    Y(2026, [
      T5('Tradesman 6.4L HEMI V8 SRW 4x2', 'RWD', '6.4L HEMI V8', 6850, 17470, 4310, 23000),
      T5('Big Horn 6.7L Cummins Diesel SRW 4x4', '4WD', '6.7L Cummins Turbo-Diesel I-6', 7600, 22330, 3450, 27000),
      T5('Laramie 6.7L Cummins HO Diesel DRW 4x4 Max Tow', '4WD', '6.7L Cummins HO Turbo-Diesel I-6', 8540, 36610, 7680, 45000)
    ])
  ]
};

// ============================================================
// 12. Toyota 4Runner (5th gen 2010-2024, 6th gen 2025+)
// ============================================================
const fourrunner = {
  make: 'Toyota',
  model: '4Runner',
  vehicleClass: 'suv',
  wikipediaUrl: 'https://en.wikipedia.org/wiki/Toyota_4Runner',
  years: [
    Y(2015, [
      T('SR5 4.0L V6 4x2', 'RWD', '4.0L V6', 4400, 5000, 1480, 11200),
      T('Trail 4.0L V6 4x4', '4WD', '4.0L V6', 4675, 5000, 1605, 11200),
      T('Limited 4.0L V6 4x4', '4WD', '4.0L V6', 4805, 5000, 1370, 11200)
    ]),
    Y(2016, [
      T('SR5 4.0L V6 4x2', 'RWD', '4.0L V6', 4400, 5000, 1480, 11200),
      T('TRD Off-Road 4.0L V6 4x4', '4WD', '4.0L V6', 4675, 5000, 1605, 11200),
      T('Limited 4.0L V6 4x4', '4WD', '4.0L V6', 4805, 5000, 1370, 11200)
    ]),
    Y(2017, [
      T('SR5 4.0L V6 4x2', 'RWD', '4.0L V6', 4400, 5000, 1480, 11200),
      T('TRD Off-Road 4.0L V6 4x4', '4WD', '4.0L V6', 4675, 5000, 1605, 11200),
      T('Limited 4.0L V6 4x4', '4WD', '4.0L V6', 4805, 5000, 1370, 11200)
    ]),
    Y(2018, [
      T('SR5 4.0L V6 4x2', 'RWD', '4.0L V6', 4400, 5000, 1480, 11200),
      T('TRD Off-Road 4.0L V6 4x4', '4WD', '4.0L V6', 4675, 5000, 1605, 11200),
      T('Limited 4.0L V6 4x4', '4WD', '4.0L V6', 4805, 5000, 1370, 11200)
    ]),
    Y(2019, [
      T('SR5 4.0L V6 4x2', 'RWD', '4.0L V6', 4400, 5000, 1480, 11200),
      T('TRD Off-Road 4.0L V6 4x4', '4WD', '4.0L V6', 4675, 5000, 1605, 11200),
      T('Limited 4.0L V6 4x4', '4WD', '4.0L V6', 4805, 5000, 1370, 11200)
    ]),
    Y(2020, [
      T('SR5 4.0L V6 4x2', 'RWD', '4.0L V6', 4400, 5000, 1480, 11200),
      T('TRD Off-Road 4.0L V6 4x4', '4WD', '4.0L V6', 4675, 5000, 1605, 11200),
      T('Limited 4.0L V6 4x4', '4WD', '4.0L V6', 4805, 5000, 1370, 11200)
    ]),
    Y(2021, [
      T('SR5 4.0L V6 4x2', 'RWD', '4.0L V6', 4400, 5000, 1480, 11200),
      T('TRD Off-Road 4.0L V6 4x4', '4WD', '4.0L V6', 4675, 5000, 1605, 11200),
      T('Limited 4.0L V6 4x4', '4WD', '4.0L V6', 4805, 5000, 1370, 11200)
    ]),
    Y(2022, [
      T('SR5 4.0L V6 4x2', 'RWD', '4.0L V6', 4400, 5000, 1480, 11200),
      T('TRD Off-Road 4.0L V6 4x4', '4WD', '4.0L V6', 4675, 5000, 1605, 11200),
      T('Limited 4.0L V6 4x4', '4WD', '4.0L V6', 4805, 5000, 1370, 11200)
    ]),
    Y(2023, [
      T('SR5 4.0L V6 4x2', 'RWD', '4.0L V6', 4400, 5000, 1480, 11200),
      T('TRD Off-Road 4.0L V6 4x4', '4WD', '4.0L V6', 4675, 5000, 1605, 11200),
      T('Limited 4.0L V6 4x4', '4WD', '4.0L V6', 4805, 5000, 1370, 11200)
    ]),
    Y(2024, [
      T('SR5 4.0L V6 4x2', 'RWD', '4.0L V6', 4400, 5000, 1480, 11200),
      T('TRD Off-Road 4.0L V6 4x4', '4WD', '4.0L V6', 4675, 5000, 1605, 11200),
      T('Limited 4.0L V6 4x4', '4WD', '4.0L V6', 4805, 5000, 1370, 11200)
    ]),
    Y(2025, [
      T('SR5 2.4L i-FORCE Turbo I-4 4x4', '4WD', '2.4L i-FORCE Turbo I-4', 4805, 6000, 1655, 11650),
      T('TRD Off-Road 2.4L i-FORCE Turbo I-4 4x4', '4WD', '2.4L i-FORCE Turbo I-4', 4895, 6000, 1565, 11650),
      T('TRD Pro 2.4L i-FORCE MAX Hybrid 4x4', '4WD', '2.4L i-FORCE MAX Hybrid I-4', 5170, 6000, 1335, 11650),
      T('Trailhunter 2.4L i-FORCE MAX Hybrid 4x4', '4WD', '2.4L i-FORCE MAX Hybrid I-4', 5295, 6000, 1210, 11650)
    ]),
    Y(2026, [
      T('SR5 2.4L i-FORCE Turbo I-4 4x4', '4WD', '2.4L i-FORCE Turbo I-4', 4805, 6000, 1655, 11650),
      T('TRD Off-Road 2.4L i-FORCE Turbo I-4 4x4', '4WD', '2.4L i-FORCE Turbo I-4', 4895, 6000, 1565, 11650),
      T('TRD Pro 2.4L i-FORCE MAX Hybrid 4x4', '4WD', '2.4L i-FORCE MAX Hybrid I-4', 5170, 6000, 1335, 11650),
      T('Trailhunter 2.4L i-FORCE MAX Hybrid 4x4', '4WD', '2.4L i-FORCE MAX Hybrid I-4', 5295, 6000, 1210, 11650)
    ])
  ]
};

// ============================================================
// 13. Jeep Wrangler (JK 2007-2018, JL 2018+)
// ============================================================
const wrangler = {
  make: 'Jeep',
  model: 'Wrangler',
  vehicleClass: 'suv',
  wikipediaUrl: 'https://en.wikipedia.org/wiki/Jeep_Wrangler',
  years: [
    Y(2015, [
      T('Sport 3.6L Pentastar V6 2-Door 4x4', '4WD', '3.6L Pentastar V6', 3970, 2000, 1000, 5500),
      T('Sport 3.6L Pentastar V6 4-Door 4x4', '4WD', '3.6L Pentastar V6', 4340, 3500, 1000, 6800),
      T('Rubicon 3.6L Pentastar V6 4-Door 4x4', '4WD', '3.6L Pentastar V6', 4365, 3500, 1000, 6800)
    ]),
    Y(2016, [
      T('Sport 3.6L Pentastar V6 2-Door 4x4', '4WD', '3.6L Pentastar V6', 3970, 2000, 1000, 5500),
      T('Sport 3.6L Pentastar V6 4-Door 4x4', '4WD', '3.6L Pentastar V6', 4340, 3500, 1000, 6800),
      T('Rubicon 3.6L Pentastar V6 4-Door 4x4', '4WD', '3.6L Pentastar V6', 4365, 3500, 1000, 6800)
    ]),
    Y(2017, [
      T('Sport 3.6L Pentastar V6 2-Door 4x4', '4WD', '3.6L Pentastar V6', 3970, 2000, 1000, 5500),
      T('Sport 3.6L Pentastar V6 4-Door 4x4', '4WD', '3.6L Pentastar V6', 4340, 3500, 1000, 6800),
      T('Rubicon 3.6L Pentastar V6 4-Door 4x4', '4WD', '3.6L Pentastar V6', 4365, 3500, 1000, 6800)
    ]),
    Y(2018, [
      T('Sport 3.6L Pentastar V6 2-Door 4x4', '4WD', '3.6L Pentastar V6', 3970, 2000, 1000, 5500),
      T('Sahara 2.0L Turbo I-4 4-Door 4x4', '4WD', '2.0L GME Turbo I-4', 4145, 3500, 1000, 7500),
      T('Rubicon 3.6L Pentastar V6 4-Door 4x4', '4WD', '3.6L Pentastar V6', 4485, 3500, 1000, 7500)
    ]),
    Y(2019, [
      T('Sport 3.6L Pentastar V6 2-Door 4x4', '4WD', '3.6L Pentastar V6', 3970, 2000, 1000, 5500),
      T('Sahara 2.0L Turbo I-4 4-Door 4x4', '4WD', '2.0L GME Turbo I-4', 4145, 3500, 1000, 7500),
      T('Rubicon 3.6L Pentastar V6 4-Door 4x4', '4WD', '3.6L Pentastar V6', 4485, 3500, 1000, 7500)
    ]),
    Y(2020, [
      T('Sport 3.6L Pentastar V6 2-Door 4x4', '4WD', '3.6L Pentastar V6', 3970, 2000, 1000, 5500),
      T('Sahara 3.0L EcoDiesel V6 4-Door 4x4', '4WD', '3.0L EcoDiesel V6', 4730, 3500, 870, 7500),
      T('Rubicon 3.6L Pentastar V6 4-Door 4x4', '4WD', '3.6L Pentastar V6', 4485, 3500, 1000, 7500)
    ]),
    Y(2021, [
      T('Sport 3.6L Pentastar V6 2-Door 4x4', '4WD', '3.6L Pentastar V6', 3970, 2000, 1000, 5500),
      T('Sahara 4xe PHEV 4-Door 4x4', '4WD', '2.0L Turbo I-4 PHEV', 5160, 3500, 940, 8000),
      T('Rubicon 392 6.4L HEMI V8 4-Door 4x4', '4WD', '6.4L HEMI V8', 5103, 3500, 1110, 8400)
    ]),
    Y(2022, [
      T('Sport 3.6L Pentastar V6 2-Door 4x4', '4WD', '3.6L Pentastar V6', 3970, 2000, 1000, 5500),
      T('Sahara 4xe PHEV 4-Door 4x4', '4WD', '2.0L Turbo I-4 PHEV', 5160, 3500, 940, 8000),
      T('Rubicon 392 6.4L HEMI V8 4-Door 4x4', '4WD', '6.4L HEMI V8', 5103, 3500, 1110, 8400)
    ]),
    Y(2023, [
      T('Sport 3.6L Pentastar V6 2-Door 4x4', '4WD', '3.6L Pentastar V6', 3970, 2000, 1000, 5500),
      T('Sahara 4xe PHEV 4-Door 4x4', '4WD', '2.0L Turbo I-4 PHEV', 5160, 3500, 940, 8000),
      T('Rubicon 392 6.4L HEMI V8 4-Door 4x4', '4WD', '6.4L HEMI V8', 5103, 3500, 1110, 8400)
    ]),
    Y(2024, [
      T('Sport 3.6L Pentastar V6 2-Door 4x4', '4WD', '3.6L Pentastar V6', 3970, 2000, 1000, 5500),
      T('Sahara 4xe PHEV 4-Door 4x4', '4WD', '2.0L Turbo I-4 PHEV', 5160, 3500, 940, 8000),
      T('Rubicon X 3.6L Pentastar V6 4-Door 4x4', '4WD', '3.6L Pentastar V6', 4520, 5000, 970, 8500)
    ]),
    Y(2025, [
      T('Sport 3.6L Pentastar V6 2-Door 4x4', '4WD', '3.6L Pentastar V6', 3970, 2000, 1000, 5500),
      T('Sahara 4xe PHEV 4-Door 4x4', '4WD', '2.0L Turbo I-4 PHEV', 5160, 3500, 940, 8000),
      T('Rubicon X 3.6L Pentastar V6 4-Door 4x4', '4WD', '3.6L Pentastar V6', 4520, 5000, 970, 8500)
    ]),
    Y(2026, [
      T('Sport 3.6L Pentastar V6 2-Door 4x4', '4WD', '3.6L Pentastar V6', 3970, 2000, 1000, 5500),
      T('Sahara 4xe PHEV 4-Door 4x4', '4WD', '2.0L Turbo I-4 PHEV', 5160, 3500, 940, 8000),
      T('Rubicon X 3.6L Pentastar V6 4-Door 4x4', '4WD', '3.6L Pentastar V6', 4520, 5000, 970, 8500)
    ])
  ]
};

// ============================================================
// 14. Jeep Grand Cherokee (WK2 2011-2021, WL 2022+)
// ============================================================
const grandCherokee = {
  make: 'Jeep',
  model: 'Grand Cherokee',
  vehicleClass: 'suv',
  wikipediaUrl: 'https://en.wikipedia.org/wiki/Jeep_Grand_Cherokee',
  years: [
    Y(2015, [
      T('Laredo 3.6L Pentastar V6 4x2', 'RWD', '3.6L Pentastar V6', 4513, 6200, 1240, 11000),
      T('Limited 5.7L HEMI V8 4x4', '4WD', '5.7L HEMI V8', 5103, 7400, 1100, 12500),
      T('SRT 6.4L HEMI V8 4x4', '4WD', '6.4L HEMI V8', 5150, 7200, 1240, 12500)
    ]),
    Y(2016, [
      T('Laredo 3.6L Pentastar V6 4x2', 'RWD', '3.6L Pentastar V6', 4513, 6200, 1240, 11000),
      T('Limited 5.7L HEMI V8 4x4', '4WD', '5.7L HEMI V8', 5103, 7400, 1100, 12500),
      T('SRT 6.4L HEMI V8 4x4', '4WD', '6.4L HEMI V8', 5150, 7200, 1240, 12500)
    ]),
    Y(2017, [
      T('Laredo 3.6L Pentastar V6 4x2', 'RWD', '3.6L Pentastar V6', 4513, 6200, 1240, 11000),
      T('Limited 5.7L HEMI V8 4x4', '4WD', '5.7L HEMI V8', 5103, 7400, 1100, 12500),
      T('SRT 6.4L HEMI V8 4x4', '4WD', '6.4L HEMI V8', 5150, 7200, 1240, 12500)
    ]),
    Y(2018, [
      T('Laredo 3.6L Pentastar V6 4x2', 'RWD', '3.6L Pentastar V6', 4513, 6200, 1240, 11000),
      T('Limited 5.7L HEMI V8 4x4', '4WD', '5.7L HEMI V8', 5103, 7200, 1100, 12500),
      T('Trackhawk 6.2L Supercharged HEMI V8 4x4', '4WD', '6.2L Supercharged HEMI V8', 5363, 7200, 1180, 12500)
    ]),
    Y(2019, [
      T('Laredo 3.6L Pentastar V6 4x2', 'RWD', '3.6L Pentastar V6', 4513, 6200, 1240, 11000),
      T('Limited 5.7L HEMI V8 4x4', '4WD', '5.7L HEMI V8', 5103, 7200, 1100, 12500),
      T('Trackhawk 6.2L Supercharged HEMI V8 4x4', '4WD', '6.2L Supercharged HEMI V8', 5363, 7200, 1180, 12500)
    ]),
    Y(2020, [
      T('Laredo 3.6L Pentastar V6 4x2', 'RWD', '3.6L Pentastar V6', 4513, 6200, 1240, 11000),
      T('Limited 5.7L HEMI V8 4x4', '4WD', '5.7L HEMI V8', 5103, 7200, 1100, 12500),
      T('Trackhawk 6.2L Supercharged HEMI V8 4x4', '4WD', '6.2L Supercharged HEMI V8', 5363, 7200, 1180, 12500)
    ]),
    Y(2021, [
      T('Laredo 3.6L Pentastar V6 4x2', 'RWD', '3.6L Pentastar V6', 4513, 6200, 1240, 11000),
      T('Limited 5.7L HEMI V8 4x4', '4WD', '5.7L HEMI V8', 5103, 7200, 1100, 12500),
      T('Trackhawk 6.2L Supercharged HEMI V8 4x4', '4WD', '6.2L Supercharged HEMI V8', 5363, 7200, 1180, 12500)
    ]),
    Y(2022, [
      T('Laredo 3.6L Pentastar V6 4x2', 'RWD', '3.6L Pentastar V6', 4685, 6200, 1310, 11500),
      T('Limited 5.7L HEMI V8 4x4', '4WD', '5.7L HEMI V8', 5275, 7200, 1190, 12750),
      T('Summit 4xe PHEV 4x4', '4WD', '2.0L Turbo I-4 PHEV', 5482, 6000, 1340, 12000)
    ]),
    Y(2023, [
      T('Laredo 3.6L Pentastar V6 4x2', 'RWD', '3.6L Pentastar V6', 4685, 6200, 1310, 11500),
      T('Limited 5.7L HEMI V8 4x4', '4WD', '5.7L HEMI V8', 5275, 7200, 1190, 12750),
      T('Summit 4xe PHEV 4x4', '4WD', '2.0L Turbo I-4 PHEV', 5482, 6000, 1340, 12000)
    ]),
    Y(2024, [
      T('Laredo 3.6L Pentastar V6 4x2', 'RWD', '3.6L Pentastar V6', 4685, 6200, 1310, 11500),
      T('Limited 5.7L HEMI V8 4x4', '4WD', '5.7L HEMI V8', 5275, 7200, 1190, 12750),
      T('Summit 4xe PHEV 4x4', '4WD', '2.0L Turbo I-4 PHEV', 5482, 6000, 1340, 12000)
    ]),
    Y(2025, [
      T('Laredo 3.6L Pentastar V6 4x2', 'RWD', '3.6L Pentastar V6', 4685, 6200, 1310, 11500),
      T('Limited 3.6L Pentastar V6 4x4', '4WD', '3.6L Pentastar V6', 4830, 6200, 1180, 11500),
      T('Summit 4xe PHEV 4x4', '4WD', '2.0L Turbo I-4 PHEV', 5482, 6000, 1340, 12000)
    ]),
    Y(2026, [
      T('Laredo 3.6L Pentastar V6 4x2', 'RWD', '3.6L Pentastar V6', 4685, 6200, 1310, 11500),
      T('Limited 3.6L Pentastar V6 4x4', '4WD', '3.6L Pentastar V6', 4830, 6200, 1180, 11500),
      T('Summit 4xe PHEV 4x4', '4WD', '2.0L Turbo I-4 PHEV', 5482, 6000, 1340, 12000)
    ])
  ]
};

// ============================================================
// 15. Ford Expedition (3rd gen 2007-2017, 4th gen 2018+)
// ============================================================
const expedition = {
  make: 'Ford',
  model: 'Expedition',
  vehicleClass: 'suv',
  wikipediaUrl: 'https://en.wikipedia.org/wiki/Ford_Expedition',
  years: [
    Y(2015, [
      T('XLT 3.5L EcoBoost V6 4x2', 'RWD', '3.5L EcoBoost V6', 5443, 9200, 1730, 15100),
      T('Limited 3.5L EcoBoost V6 4x4', '4WD', '3.5L EcoBoost V6', 5670, 9100, 1750, 15100),
      T('King Ranch 3.5L EcoBoost V6 4x4 Max Tow', '4WD', '3.5L EcoBoost V6', 5732, 9200, 1750, 15100)
    ]),
    Y(2016, [
      T('XLT 3.5L EcoBoost V6 4x2', 'RWD', '3.5L EcoBoost V6', 5443, 9200, 1730, 15100),
      T('Limited 3.5L EcoBoost V6 4x4', '4WD', '3.5L EcoBoost V6', 5670, 9100, 1750, 15100),
      T('King Ranch 3.5L EcoBoost V6 4x4 Max Tow', '4WD', '3.5L EcoBoost V6', 5732, 9200, 1750, 15100)
    ]),
    Y(2017, [
      T('XLT 3.5L EcoBoost V6 4x2', 'RWD', '3.5L EcoBoost V6', 5443, 9200, 1730, 15100),
      T('Limited 3.5L EcoBoost V6 4x4', '4WD', '3.5L EcoBoost V6', 5670, 9100, 1750, 15100),
      T('Platinum 3.5L EcoBoost V6 4x4 Max Tow', '4WD', '3.5L EcoBoost V6', 5732, 9200, 1750, 15100)
    ]),
    Y(2018, [
      T('XLT 3.5L EcoBoost V6 4x2', 'RWD', '3.5L EcoBoost V6 (2nd gen)', 5443, 9300, 1760, 15700),
      T('Limited 3.5L EcoBoost V6 4x4', '4WD', '3.5L EcoBoost V6 (2nd gen)', 5621, 9200, 1690, 15700),
      T('Platinum 3.5L EcoBoost V6 4x4 Max Tow', '4WD', '3.5L EcoBoost V6 HO (2nd gen)', 5692, 9300, 1690, 15700)
    ]),
    Y(2019, [
      T('XLT 3.5L EcoBoost V6 4x2', 'RWD', '3.5L EcoBoost V6 (2nd gen)', 5443, 9300, 1760, 15700),
      T('Limited 3.5L EcoBoost V6 4x4', '4WD', '3.5L EcoBoost V6 (2nd gen)', 5621, 9200, 1690, 15700),
      T('Platinum 3.5L EcoBoost V6 4x4 Max Tow', '4WD', '3.5L EcoBoost V6 HO (2nd gen)', 5692, 9300, 1690, 15700)
    ]),
    Y(2020, [
      T('XLT 3.5L EcoBoost V6 4x2', 'RWD', '3.5L EcoBoost V6 (2nd gen)', 5443, 9300, 1760, 15700),
      T('Limited 3.5L EcoBoost V6 4x4', '4WD', '3.5L EcoBoost V6 (2nd gen)', 5621, 9200, 1690, 15700),
      T('Platinum 3.5L EcoBoost V6 4x4 Max Tow', '4WD', '3.5L EcoBoost V6 HO (2nd gen)', 5692, 9300, 1690, 15700)
    ]),
    Y(2021, [
      T('XLT 3.5L EcoBoost V6 4x2', 'RWD', '3.5L EcoBoost V6 (2nd gen)', 5443, 9300, 1760, 15700),
      T('Limited 3.5L EcoBoost V6 4x4', '4WD', '3.5L EcoBoost V6 (2nd gen)', 5621, 9200, 1690, 15700),
      T('Platinum 3.5L EcoBoost V6 4x4 Max Tow', '4WD', '3.5L EcoBoost V6 HO (2nd gen)', 5692, 9300, 1690, 15700)
    ]),
    Y(2022, [
      T('XLT 3.5L EcoBoost V6 4x2', 'RWD', '3.5L EcoBoost V6 (2nd gen)', 5443, 9300, 1760, 15700),
      T('Limited 3.5L EcoBoost V6 4x4', '4WD', '3.5L EcoBoost V6 (2nd gen)', 5621, 9200, 1690, 15700),
      T('Platinum 3.5L EcoBoost V6 4x4 Max Tow', '4WD', '3.5L EcoBoost V6 HO (2nd gen)', 5692, 9300, 1690, 15700)
    ]),
    Y(2023, [
      T('XL 3.5L EcoBoost V6 4x2', 'RWD', '3.5L EcoBoost V6 (2nd gen)', 5443, 9300, 1760, 15700),
      T('XLT 3.5L EcoBoost V6 4x4', '4WD', '3.5L EcoBoost V6 (2nd gen)', 5621, 9200, 1690, 15700),
      T('Timberline 3.5L EcoBoost V6 4x4 Max Tow', '4WD', '3.5L EcoBoost V6 HO (2nd gen)', 5692, 9300, 1640, 15700)
    ]),
    Y(2024, [
      T('XL 3.5L EcoBoost V6 4x2', 'RWD', '3.5L EcoBoost V6 (2nd gen)', 5443, 9300, 1760, 15700),
      T('XLT 3.5L EcoBoost V6 4x4', '4WD', '3.5L EcoBoost V6 (2nd gen)', 5621, 9200, 1690, 15700),
      T('Platinum 3.5L EcoBoost V6 4x4 Max Tow', '4WD', '3.5L EcoBoost V6 HO (2nd gen)', 5692, 9300, 1640, 15700)
    ]),
    Y(2025, [
      T('Active 3.5L EcoBoost V6 4x2', 'RWD', '3.5L EcoBoost V6 (3rd gen)', 5443, 9000, 1760, 15700),
      T('Tremor 3.5L EcoBoost V6 4x4', '4WD', '3.5L EcoBoost V6 (3rd gen)', 5732, 9000, 1640, 15700),
      T('Platinum 3.5L EcoBoost V6 4x4 Max Tow', '4WD', '3.5L EcoBoost V6 HO (3rd gen)', 5692, 9300, 1640, 15700)
    ]),
    Y(2026, [
      T('Active 3.5L EcoBoost V6 4x2', 'RWD', '3.5L EcoBoost V6 (3rd gen)', 5443, 9000, 1760, 15700),
      T('Tremor 3.5L EcoBoost V6 4x4', '4WD', '3.5L EcoBoost V6 (3rd gen)', 5732, 9000, 1640, 15700),
      T('Platinum 3.5L EcoBoost V6 4x4 Max Tow', '4WD', '3.5L EcoBoost V6 HO (3rd gen)', 5692, 9300, 1640, 15700)
    ])
  ]
};

// ============================================================
// 16. Chevrolet Tahoe
// ============================================================
const tahoe = {
  make: 'Chevrolet',
  model: 'Tahoe',
  vehicleClass: 'suv',
  wikipediaUrl: 'https://en.wikipedia.org/wiki/Chevrolet_Tahoe',
  years: [
    Y(2015, [
      T('LS 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5448, 8400, 1620, 14000),
      T('LT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5602, 8200, 1620, 14000),
      T('LTZ 5.3L EcoTec3 V8 4x4 Max Trailering', '4WD', '5.3L EcoTec3 V8', 5602, 8400, 1620, 14000)
    ]),
    Y(2016, [
      T('LS 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5448, 8600, 1620, 14000),
      T('LT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5602, 8400, 1620, 14000),
      T('LTZ 5.3L EcoTec3 V8 4x4 Max Trailering', '4WD', '5.3L EcoTec3 V8', 5602, 8600, 1620, 14000)
    ]),
    Y(2017, [
      T('LS 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5448, 8600, 1620, 14000),
      T('LT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5602, 8400, 1620, 14000),
      T('Premier 5.3L EcoTec3 V8 4x4 Max Trailering', '4WD', '5.3L EcoTec3 V8', 5602, 8600, 1620, 14000)
    ]),
    Y(2018, [
      T('LS 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5448, 8600, 1620, 14000),
      T('LT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5602, 8400, 1620, 14000),
      T5('RST 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5715, 8600, 1620, 14000)
    ]),
    Y(2019, [
      T('LS 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5448, 8600, 1620, 14000),
      T('LT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5602, 8400, 1620, 14000),
      T5('RST 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5715, 8600, 1620, 14000)
    ]),
    Y(2020, [
      T('LS 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5448, 8600, 1620, 14000),
      T('LT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5602, 8400, 1620, 14000),
      T5('Premier 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5715, 8600, 1620, 14000)
    ]),
    Y(2021, [
      T('LS 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5602, 8400, 1670, 14000),
      T('LT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5793, 8200, 1670, 14000),
      T5('High Country 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5896, 8400, 1670, 14000)
    ]),
    Y(2022, [
      T('LS 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5602, 8400, 1670, 14000),
      T('LT 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 5793, 8000, 1640, 14000),
      T5('High Country 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5896, 8400, 1670, 14000)
    ]),
    Y(2023, [
      T('LS 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5602, 8400, 1670, 14000),
      T('LT 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 5793, 8000, 1640, 14000),
      T5('High Country 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5896, 8400, 1670, 14000)
    ]),
    Y(2024, [
      T('LS 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5602, 8400, 1670, 14000),
      T('LT 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 5793, 8000, 1640, 14000),
      T5('High Country 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5896, 8400, 1670, 14000)
    ]),
    Y(2025, [
      T('LS 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5602, 8400, 1670, 14000),
      T('LT 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 5793, 8000, 1640, 14000),
      T5('High Country 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5896, 8400, 1670, 14000)
    ]),
    Y(2026, [
      T('LS 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5602, 8400, 1670, 14000),
      T('LT 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 5793, 8000, 1640, 14000),
      T5('High Country 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5896, 8400, 1670, 14000)
    ])
  ]
};

// ============================================================
// 17. Chevrolet Suburban
// ============================================================
const suburban = {
  make: 'Chevrolet',
  model: 'Suburban',
  vehicleClass: 'suv',
  wikipediaUrl: 'https://en.wikipedia.org/wiki/Chevrolet_Suburban',
  years: [
    Y(2015, [
      T('LS 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5586, 8300, 1610, 14000),
      T('LT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5808, 8000, 1610, 14000),
      T('LTZ 5.3L EcoTec3 V8 4x4 Max Trailering', '4WD', '5.3L EcoTec3 V8', 5808, 8000, 1610, 14000)
    ]),
    Y(2016, [
      T('LS 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5586, 8300, 1610, 14000),
      T('LT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5808, 8000, 1610, 14000),
      T('LTZ 5.3L EcoTec3 V8 4x4 Max Trailering', '4WD', '5.3L EcoTec3 V8', 5808, 8000, 1610, 14000)
    ]),
    Y(2017, [
      T('LS 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5586, 8300, 1610, 14000),
      T('LT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5808, 8000, 1610, 14000),
      T('Premier 5.3L EcoTec3 V8 4x4 Max Trailering', '4WD', '5.3L EcoTec3 V8', 5808, 8000, 1610, 14000)
    ]),
    Y(2018, [
      T('LS 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5586, 8300, 1610, 14000),
      T('LT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5808, 8000, 1610, 14000),
      T5('RST 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5908, 8300, 1610, 14000)
    ]),
    Y(2019, [
      T('LS 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5586, 8300, 1610, 14000),
      T('LT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5808, 8000, 1610, 14000),
      T5('RST 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5908, 8300, 1610, 14000)
    ]),
    Y(2020, [
      T('LS 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5586, 8300, 1610, 14000),
      T('LT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5808, 8000, 1610, 14000),
      T5('Premier 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5908, 8300, 1610, 14000)
    ]),
    Y(2021, [
      T('LS 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5808, 8300, 1750, 14000),
      T('LT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 6016, 8100, 1750, 14000),
      T5('High Country 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 6105, 8200, 1750, 14000)
    ]),
    Y(2022, [
      T('LS 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5808, 8300, 1750, 14000),
      T('LT 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 6016, 8000, 1690, 14000),
      T5('High Country 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 6105, 8200, 1750, 14000)
    ]),
    Y(2023, [
      T('LS 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5808, 8300, 1750, 14000),
      T('LT 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 6016, 8000, 1690, 14000),
      T5('High Country 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 6105, 8200, 1750, 14000)
    ]),
    Y(2024, [
      T('LS 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5808, 8300, 1750, 14000),
      T('LT 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 6016, 8000, 1690, 14000),
      T5('High Country 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 6105, 8200, 1750, 14000)
    ]),
    Y(2025, [
      T('LS 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5808, 8300, 1750, 14000),
      T('LT 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 6016, 8000, 1690, 14000),
      T5('High Country 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 6105, 8200, 1750, 14000)
    ]),
    Y(2026, [
      T('LS 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5808, 8300, 1750, 14000),
      T('LT 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 6016, 8000, 1690, 14000),
      T5('High Country 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 6105, 8200, 1750, 14000)
    ])
  ]
};

// ============================================================
// 18. GMC Yukon
// ============================================================
const yukon = {
  make: 'GMC',
  model: 'Yukon',
  vehicleClass: 'suv',
  wikipediaUrl: 'https://en.wikipedia.org/wiki/GMC_Yukon',
  years: [
    Y(2015, [
      T('SLE 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5448, 8400, 1620, 14000),
      T('SLT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5602, 8200, 1620, 14000),
      T('Denali 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5715, 8400, 1620, 14000)
    ]),
    Y(2016, [
      T('SLE 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5448, 8500, 1620, 14000),
      T('SLT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5602, 8300, 1620, 14000),
      T('Denali 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5715, 8500, 1620, 14000)
    ]),
    Y(2017, [
      T('SLE 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5448, 8500, 1620, 14000),
      T('SLT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5602, 8300, 1620, 14000),
      T('Denali 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5715, 8500, 1620, 14000)
    ]),
    Y(2018, [
      T('SLE 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5448, 8500, 1620, 14000),
      T('SLT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5602, 8300, 1620, 14000),
      T('Denali 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5715, 8500, 1620, 14000)
    ]),
    Y(2019, [
      T('SLE 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5448, 8500, 1620, 14000),
      T('SLT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5602, 8300, 1620, 14000),
      T('Denali 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5715, 8500, 1620, 14000)
    ]),
    Y(2020, [
      T('SLE 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5448, 8500, 1620, 14000),
      T('SLT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5602, 8300, 1620, 14000),
      T('Denali 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5715, 8500, 1620, 14000)
    ]),
    Y(2021, [
      T('SLE 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5602, 8400, 1670, 14000),
      T('SLT 5.3L EcoTec3 V8 4x4', '4WD', '5.3L EcoTec3 V8', 5793, 8200, 1670, 14000),
      T('Denali 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5896, 8400, 1670, 14000)
    ]),
    Y(2022, [
      T('SLE 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5602, 8400, 1670, 14000),
      T('AT4 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 5793, 8000, 1640, 14000),
      T('Denali 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5896, 8400, 1670, 14000)
    ]),
    Y(2023, [
      T('SLE 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5602, 8400, 1670, 14000),
      T('AT4 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 5793, 8000, 1640, 14000),
      T('Denali Ultimate 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5896, 8400, 1670, 14000)
    ]),
    Y(2024, [
      T('SLE 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5602, 8400, 1670, 14000),
      T('AT4 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 5793, 8000, 1640, 14000),
      T('Denali Ultimate 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5896, 8400, 1670, 14000)
    ]),
    Y(2025, [
      T('Elevation 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5602, 8400, 1670, 14000),
      T('AT4 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 5793, 8000, 1640, 14000),
      T('Denali Ultimate 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5896, 8400, 1670, 14000)
    ]),
    Y(2026, [
      T('Elevation 5.3L EcoTec3 V8 4x2', 'RWD', '5.3L EcoTec3 V8', 5602, 8400, 1670, 14000),
      T('AT4 3.0L Duramax I-6 Diesel 4x4', '4WD', '3.0L Duramax Turbo-Diesel I-6', 5793, 8000, 1640, 14000),
      T('Denali Ultimate 6.2L EcoTec3 V8 4x4 Max Trailering', '4WD', '6.2L EcoTec3 V8', 5896, 8400, 1670, 14000)
    ])
  ]
};

// ============================================================
// 19. Nissan Frontier (D40 2005-2021, D41 2022+)
// ============================================================
const frontier = {
  make: 'Nissan',
  model: 'Frontier',
  vehicleClass: 'truck',
  wikipediaUrl: 'https://en.wikipedia.org/wiki/Nissan_Navara',
  years: [
    Y(2015, [
      T('S 2.5L QR25DE I-4 4x2', 'RWD', '2.5L QR25DE I-4', 3727, 3500, 1410, 7800),
      T('SV 4.0L VQ40DE V6 4x2', 'RWD', '4.0L VQ40DE V6', 4309, 6500, 1230, 11800),
      T('Pro-4X 4.0L VQ40DE V6 4x4', '4WD', '4.0L VQ40DE V6', 4651, 6300, 1080, 11800)
    ]),
    Y(2016, [
      T('S 2.5L QR25DE I-4 4x2', 'RWD', '2.5L QR25DE I-4', 3727, 3500, 1410, 7800),
      T('SV 4.0L VQ40DE V6 4x2', 'RWD', '4.0L VQ40DE V6', 4309, 6500, 1230, 11800),
      T('Pro-4X 4.0L VQ40DE V6 4x4', '4WD', '4.0L VQ40DE V6', 4651, 6300, 1080, 11800)
    ]),
    Y(2017, [
      T('S 2.5L QR25DE I-4 4x2', 'RWD', '2.5L QR25DE I-4', 3727, 3500, 1410, 7800),
      T('SV 4.0L VQ40DE V6 4x2', 'RWD', '4.0L VQ40DE V6', 4309, 6500, 1230, 11800),
      T('Pro-4X 4.0L VQ40DE V6 4x4', '4WD', '4.0L VQ40DE V6', 4651, 6300, 1080, 11800)
    ]),
    Y(2018, [
      T('S 2.5L QR25DE I-4 4x2', 'RWD', '2.5L QR25DE I-4', 3727, 3500, 1410, 7800),
      T('SV 4.0L VQ40DE V6 4x2', 'RWD', '4.0L VQ40DE V6', 4309, 6500, 1230, 11800),
      T('Pro-4X 4.0L VQ40DE V6 4x4', '4WD', '4.0L VQ40DE V6', 4651, 6300, 1080, 11800)
    ]),
    Y(2019, [
      T('S 2.5L QR25DE I-4 4x2', 'RWD', '2.5L QR25DE I-4', 3727, 3500, 1410, 7800),
      T('SV 4.0L VQ40DE V6 4x2', 'RWD', '4.0L VQ40DE V6', 4309, 6500, 1230, 11800),
      T('Pro-4X 4.0L VQ40DE V6 4x4', '4WD', '4.0L VQ40DE V6', 4651, 6300, 1080, 11800)
    ]),
    Y(2020, [
      T('S 3.8L VQ38 V6 4x2', 'RWD', '3.8L VQ38DD V6', 4226, 6300, 1450, 11700),
      T('SV 3.8L VQ38 V6 4x2', 'RWD', '3.8L VQ38DD V6', 4226, 6720, 1450, 11700),
      T('Pro-4X 3.8L VQ38 V6 4x4', '4WD', '3.8L VQ38DD V6', 4521, 6500, 1110, 11700)
    ]),
    Y(2021, [
      T('S 3.8L VQ38 V6 4x2', 'RWD', '3.8L VQ38DD V6', 4226, 6300, 1450, 11700),
      T('SV 3.8L VQ38 V6 4x2', 'RWD', '3.8L VQ38DD V6', 4226, 6720, 1450, 11700),
      T('Pro-4X 3.8L VQ38 V6 4x4', '4WD', '3.8L VQ38DD V6', 4521, 6500, 1110, 11700)
    ]),
    Y(2022, [
      T('S 3.8L VQ38 V6 4x2', 'RWD', '3.8L VQ38DD V6', 4419, 6300, 1340, 11900),
      T('SV 3.8L VQ38 V6 4x2', 'RWD', '3.8L VQ38DD V6', 4419, 6720, 1450, 11900),
      T('Pro-4X 3.8L VQ38 V6 4x4', '4WD', '3.8L VQ38DD V6', 4674, 6720, 1180, 12300)
    ]),
    Y(2023, [
      T('S 3.8L VQ38 V6 4x2', 'RWD', '3.8L VQ38DD V6', 4419, 6300, 1340, 11900),
      T('SV 3.8L VQ38 V6 4x2', 'RWD', '3.8L VQ38DD V6', 4419, 6720, 1450, 11900),
      T('Pro-4X 3.8L VQ38 V6 4x4', '4WD', '3.8L VQ38DD V6', 4674, 6720, 1180, 12300)
    ]),
    Y(2024, [
      T('S 3.8L VQ38 V6 4x2', 'RWD', '3.8L VQ38DD V6', 4419, 6300, 1340, 11900),
      T('SV 3.8L VQ38 V6 4x2', 'RWD', '3.8L VQ38DD V6', 4419, 6720, 1450, 11900),
      T('Pro-4X 3.8L VQ38 V6 4x4', '4WD', '3.8L VQ38DD V6', 4674, 6720, 1180, 12300)
    ]),
    Y(2025, [
      T('S 3.8L VQ38 V6 4x2', 'RWD', '3.8L VQ38DD V6', 4419, 6300, 1340, 11900),
      T('SV 3.8L VQ38 V6 4x2', 'RWD', '3.8L VQ38DD V6', 4419, 6720, 1450, 11900),
      T('Pro-4X 3.8L VQ38 V6 4x4', '4WD', '3.8L VQ38DD V6', 4674, 6720, 1180, 12300)
    ]),
    Y(2026, [
      T('S 3.8L VQ38 V6 4x2', 'RWD', '3.8L VQ38DD V6', 4419, 6300, 1340, 11900),
      T('SV 3.8L VQ38 V6 4x2', 'RWD', '3.8L VQ38DD V6', 4419, 6720, 1450, 11900),
      T('Pro-4X 3.8L VQ38 V6 4x4', '4WD', '3.8L VQ38DD V6', 4674, 6720, 1180, 12300)
    ])
  ]
};

// ============================================================
// 20. Honda Ridgeline (2nd gen 2017+)
// Note: Honda Ridgeline was on hiatus 2015-2016; first model year of 2nd gen was 2017.
// ============================================================
const ridgeline = {
  make: 'Honda',
  model: 'Ridgeline',
  vehicleClass: 'truck',
  wikipediaUrl: 'https://en.wikipedia.org/wiki/Honda_Ridgeline',
  years: [
    Y(2015, []),
    Y(2016, []),
    Y(2017, [
      T('RT 3.5L i-VTEC V6 4x2', 'AWD', '3.5L i-VTEC V6', 4257, 3500, 1584, 9046),
      T('Sport 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4515, 5000, 1499, 11000),
      T('Black Edition 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4515, 5000, 1451, 11000)
    ]),
    Y(2018, [
      T('RT 3.5L i-VTEC V6 4x2', 'AWD', '3.5L i-VTEC V6', 4257, 3500, 1584, 9046),
      T('Sport 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4515, 5000, 1499, 11000),
      T('Black Edition 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4515, 5000, 1451, 11000)
    ]),
    Y(2019, [
      T('RT 3.5L i-VTEC V6 4x2', 'AWD', '3.5L i-VTEC V6', 4257, 3500, 1584, 9046),
      T('Sport 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4515, 5000, 1499, 11000),
      T('Black Edition 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4515, 5000, 1451, 11000)
    ]),
    Y(2020, [
      T('Sport 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4515, 5000, 1499, 11000),
      T('RTL 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4515, 5000, 1499, 11000),
      T('Black Edition 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4515, 5000, 1451, 11000)
    ]),
    Y(2021, [
      T('Sport 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4515, 5000, 1583, 11000),
      T('RTL 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4515, 5000, 1583, 11000),
      T('Black Edition 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4515, 5000, 1451, 11000)
    ]),
    Y(2022, [
      T('Sport 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4515, 5000, 1583, 11000),
      T('RTL 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4515, 5000, 1583, 11000),
      T('Black Edition 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4515, 5000, 1451, 11000)
    ]),
    Y(2023, [
      T('Sport 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4515, 5000, 1583, 11000),
      T('RTL 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4515, 5000, 1583, 11000),
      T('Black Edition 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4515, 5000, 1451, 11000)
    ]),
    Y(2024, [
      T('Sport 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4515, 5000, 1583, 11000),
      T('RTL 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4515, 5000, 1583, 11000),
      T('TrailSport 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4564, 5000, 1499, 11000),
      T('Black Edition 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4515, 5000, 1451, 11000)
    ]),
    Y(2025, [
      T('Sport 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4515, 5000, 1583, 11000),
      T('RTL 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4515, 5000, 1583, 11000),
      T('TrailSport 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4564, 5000, 1499, 11000),
      T('Black Edition 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4515, 5000, 1451, 11000)
    ]),
    Y(2026, [
      T('Sport 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4515, 5000, 1583, 11000),
      T('RTL 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4515, 5000, 1583, 11000),
      T('TrailSport 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4564, 5000, 1499, 11000),
      T('Black Edition 3.5L i-VTEC V6 4x4', 'AWD', '3.5L i-VTEC V6', 4515, 5000, 1451, 11000)
    ])
  ]
};

// ============================================================
// Assemble final dataset
// ============================================================
const out = {
  schemaVersion: 1,
  lastUpdated: '2026-04-27',
  sourceNotes: 'Specs sourced from manufacturer RV/Trailer towing guides (Ford, GM Trailering Guide, Ram Towing Guide, Toyota brochures, Jeep towing guide, Honda press materials, Nissan press releases) and cross-checked against Edmunds, MotorTrend and trailerlife.com. Trims represent meaningful tiers (entry / mid / max-tow) per year. Honda Ridgeline 2015-2016: discontinued (production hiatus before 2nd-gen launch in 2017).',
  models: [
    fordF150,
    silverado1500,
    ram1500,
    tacoma,
    tundra,
    f250,
    f350,
    silverado2500,
    sierra1500,
    ram2500,
    ram3500,
    fourrunner,
    wrangler,
    grandCherokee,
    expedition,
    tahoe,
    suburban,
    yukon,
    frontier,
    ridgeline
  ]
};

writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n', 'utf-8');

// Validation summary
let total = 0, missing = 0;
const byModel = {};
for (const m of out.models) {
  const k = m.make + ' ' + m.model;
  byModel[k] = 0;
  for (const y of m.years) {
    for (const t of y.trims) {
      total++;
      byModel[k]++;
      const s = t.specs;
      if (s.maxTowLbs == null || s.payloadLbs == null || s.gcwrLbs == null || s.tongueWeightLbs == null || s.hitchClass == null) missing++;
    }
  }
}
console.log('Wrote', OUT);
console.log('Total trims:', total);
console.log('Missing-spec trims:', missing);
console.log('By model:');
for (const [k, v] of Object.entries(byModel)) console.log('  ', k.padEnd(35), v);
