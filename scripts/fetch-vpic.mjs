import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const DATA_DIR = resolve('data');
mkdirSync(DATA_DIR, { recursive: true });

const VPIC = 'https://vpic.nhtsa.dot.gov/api/vehicles';
const YEARS = Array.from({ length: 27 }, (_, i) => 2000 + i); // 2000-2026

async function fetchJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

async function getMakes() {
  const url = `${VPIC}/GetMakesForVehicleType/car?format=json`;
  const truck = await fetchJson(`${VPIC}/GetMakesForVehicleType/truck?format=json`);
  const suv = await fetchJson(`${VPIC}/GetMakesForVehicleType/multipurpose passenger vehicle (mpv)?format=json`);
  const car = await fetchJson(url);
  const all = [...truck.Results, ...suv.Results, ...car.Results];
  const seen = new Set();
  return all.filter(m => { if (seen.has(m.MakeId)) return false; seen.add(m.MakeId); return true; });
}

async function getModels(makeId, year) {
  const url = `${VPIC}/GetModelsForMakeIdYear/makeId/${makeId}/modelyear/${year}?format=json`;
  try { return (await fetchJson(url)).Results; } catch { return []; }
}

async function main() {
  console.log('VPIC fetch starting...');
  const makes = await getMakes();
  console.log('Makes:', makes.length);

  const TARGET_MAKES = new Set([
    'FORD', 'CHEVROLET', 'GMC', 'RAM', 'TOYOTA', 'HONDA', 'NISSAN', 'JEEP',
    'DODGE', 'HYUNDAI', 'KIA', 'SUBARU', 'MAZDA', 'VOLKSWAGEN', 'BMW',
    'MERCEDES-BENZ', 'AUDI', 'LEXUS', 'ACURA', 'INFINITI', 'CADILLAC',
    'BUICK', 'LINCOLN', 'CHRYSLER', 'MITSUBISHI', 'VOLVO', 'LAND ROVER',
    'JAGUAR', 'PORSCHE', 'TESLA', 'RIVIAN', 'LUCID', 'GENESIS',
  ]);

  const filtered = makes.filter(m => TARGET_MAKES.has(m.MakeName.toUpperCase()));
  console.log('Filtered makes:', filtered.length);

  const out = [];
  for (const make of filtered) {
    for (const year of YEARS) {
      const models = await getModels(make.MakeId, year);
      for (const md of models) {
        out.push({ year, makeId: make.MakeId, makeName: make.MakeName, modelId: md.Model_ID, modelName: md.Model_Name });
      }
      await new Promise(r => setTimeout(r, 50)); // polite
    }
    console.log(`  ${make.MakeName} done`);
  }

  writeFileSync(resolve(DATA_DIR, 'vpic-raw.json'), JSON.stringify(out, null, 2));
  console.log('Wrote', out.length, 'rows to data/vpic-raw.json');
}

main().catch(e => { console.error(e); process.exit(1); });
