'use strict';
/* Dibuja una rejilla etiquetada cada 5% sobre una imagen para leer geometrias. */
const sharp = require('sharp');

const [, , input, output, widthArg] = process.argv;
const width = Number(widthArg || 1000);

(async () => {
  const base = sharp(input).resize({ width });
  const { width: w, height: h } = await base.png().toBuffer({ resolveWithObject: true }).then((r) => r.info);
  const lines = [];
  for (let p = 0; p <= 100; p += 5) {
    const x = Math.round((p / 100) * (w - 1));
    const y = Math.round((p / 100) * (h - 1));
    const strong = p % 10 === 0;
    const color = strong ? 'rgba(255,0,255,0.85)' : 'rgba(0,255,255,0.75)';
    lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="${color}" stroke-width="${strong ? 1.6 : 1}"/>`);
    lines.push(`<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="${color}" stroke-width="${strong ? 1.6 : 1}"/>`);
    lines.push(`<text x="${x + 3}" y="14" font-family="monospace" font-size="13" fill="#000" stroke="#fff" stroke-width="2.5" paint-order="stroke">${p}</text>`);
    lines.push(`<text x="3" y="${y - 3}" font-family="monospace" font-size="13" fill="#000" stroke="#fff" stroke-width="2.5" paint-order="stroke">${p}</text>`);
  }
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${lines.join('')}</svg>`;
  await sharp(input)
    .resize({ width })
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toFile(output);
  console.log(`${output} ${w}x${h}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
