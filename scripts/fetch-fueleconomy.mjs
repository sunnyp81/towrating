import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const URL = 'https://www.fueleconomy.gov/feg/epadata/vehicles.csv';
const DATA_DIR = resolve('data');
mkdirSync(DATA_DIR, { recursive: true });

function parseCsv(text) {
  const lines = text.split(/\r?\n/);
  const header = lines[0].split(',').map(h => h.replace(/^"|"$/g, ''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue;
    const cells = [];
    let cur = '', inQuote = false;
    for (const c of lines[i]) {
      if (c === '"') inQuote = !inQuote;
      else if (c === ',' && !inQuote) { cells.push(cur); cur = ''; }
      else cur += c;
    }
    cells.push(cur);
    const row = {};
    header.forEach((h, j) => row[h] = cells[j]);
    rows.push(row);
  }
  return rows;
}

async function main() {
  console.log('Downloading fueleconomy.gov CSV...');
  const r = await fetch(URL);
  if (!r.ok) {
    // Try alternate URL if primary fails
    console.warn(`Primary URL returned ${r.status}, trying alternate...`);
    // Note: alternate URL is https://www.fueleconomy.gov/feg/epadata/all-alpha-25.csv
    const r2 = await fetch('https://www.fueleconomy.gov/feg/epadata/all-alpha-25.csv');
    if (!r2.ok) throw new Error(`Both URLs failed. Last status: ${r2.status}`);
    const text2 = await r2.text();
    const rows2 = parseCsv(text2);
    console.log('Rows (alternate URL):', rows2.length);
    processAndWrite(rows2);
    return;
  }
  const text = await r.text();
  const rows = parseCsv(text);
  console.log('Rows:', rows.length);
  processAndWrite(rows);
}

function processAndWrite(rows) {
  const out = rows
    .filter(r => r.year && Number(r.year) >= 2000)
    .map(r => ({
      year: Number(r.year),
      make: r.make,
      model: r.model,
      drive: r.drive,
      fuelType: r.fuelType,
      vClass: r.VClass,
      cylinders: r.cylinders ? Number(r.cylinders) : null,
      displ: r.displ ? Number(r.displ) : null,
    }));

  writeFileSync(resolve(DATA_DIR, 'fueleconomy.json'), JSON.stringify(out, null, 2));
  console.log('Wrote', out.length, 'rows to data/fueleconomy.json');
}

main().catch(e => { console.error(e); process.exit(1); });
