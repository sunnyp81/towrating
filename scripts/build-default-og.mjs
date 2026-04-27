import { ImageResponse } from '@vercel/og';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

mkdirSync(resolve('public'), { recursive: true });

const html = {
  type: 'div',
  props: {
    style: {
      width: '1200px', height: '630px',
      background: 'linear-gradient(135deg, #0a1628 0%, #1f3457 100%)',
      color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: '60px', fontFamily: 'sans-serif',
    },
    children: [
      { type: 'div', props: { style: { fontSize: 36, color: '#f59e0b', fontWeight: 700 }, children: 'towrating.net' } },
      { type: 'div', props: { style: { fontSize: 80, fontWeight: 700, lineHeight: 1.1, display: 'flex' }, children: 'Verified US towing capacities' } },
      { type: 'div', props: { style: { fontSize: 28, color: '#cbd5e1' }, children: 'Max tow · Payload · GCWR · Tongue weight · Hitch class' } },
    ],
  },
};
const img = new ImageResponse(html, { width: 1200, height: 630 });
const buf = Buffer.from(await img.arrayBuffer());
writeFileSync(resolve('public/og-default.png'), buf);
console.log('Wrote public/og-default.png');
