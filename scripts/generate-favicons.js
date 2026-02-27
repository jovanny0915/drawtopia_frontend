/**
 * Generate favicon PNGs and favicon.ico from static/favicon.svg.
 * Run: node scripts/generate-favicons.js
 * Requires: npm install -D sharp png-to-ico
 */

import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const staticDir = join(__dirname, '..', 'static');
const svgPath = join(staticDir, 'favicon.svg');

const SIZES = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'favicon-96x96.png', size: 96 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'apple-touch-icon-precomposed.png', size: 180 },
  { name: 'favicon-192x192.png', size: 192 },
  { name: 'favicon-512x512.png', size: 512 },
];

async function main() {
  const svg = readFileSync(svgPath);
  // Use high density so SVG renders sharply at large sizes
  const density = 512;

  for (const { name, size } of SIZES) {
    const outPath = join(staticDir, name);
    await sharp(svg, { density })
      .resize(size, size)
      .png()
      .toFile(outPath);
    console.log(`Wrote ${name} (${size}x${size})`);
  }

  // Multi-resolution favicon.ico (16, 32, 48)
  const icoSizes = [16, 32, 48];
  const icoPaths = icoSizes.map((s) => join(staticDir, `favicon-${s}x${s}.png`));
  const icoBuffer = await pngToIco(icoPaths);
  writeFileSync(join(staticDir, 'favicon.ico'), icoBuffer);
  console.log('Wrote favicon.ico (16, 32, 48)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
