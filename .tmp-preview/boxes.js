'use strict';
/* Dibuja cajas tactiles y zonas de texto sobre un arte para validar medidas. */
const sharp = require('sharp');

const fs = require('node:fs');
const [, , input, output, specFile] = process.argv;
const boxes = JSON.parse(fs.readFileSync(specFile, 'utf8'));

(async () => {
  const meta = await sharp(input).metadata();
  const { width: w, height: h } = meta;
  const parts = boxes.map((b) => {
    const x = (b.x / 100) * w;
    const y = (b.y / 100) * h;
    const bw = (b.w / 100) * w;
    const bh = (b.h / 100) * h;
    const color = b.color || '#ff00ff';
    return (
      `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="${color}" fill-opacity="0.22" stroke="${color}" stroke-width="2"/>` +
      `<text x="${x + 4}" y="${y + 18}" font-family="monospace" font-size="17" font-weight="bold" fill="#fff" stroke="#000" stroke-width="3" paint-order="stroke">${b.label}</text>`
    );
  });
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${parts.join('')}</svg>`;
  await sharp(input).composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).png().toFile(output);
  console.log(`${output} ${w}x${h}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
