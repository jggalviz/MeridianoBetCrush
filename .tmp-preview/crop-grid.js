'use strict';
/* Crop de una region (en % del original) con rejilla etiquetada en % del ORIGINAL. */
const sharp = require('sharp');

const [, , input, output, x0Arg, y0Arg, x1Arg, y1Arg, widthArg] = process.argv;

(async () => {
  const meta = await sharp(input).metadata();
  const { width: W, height: H } = meta;
  const x0 = Math.round((Number(x0Arg) / 100) * W);
  const y0 = Math.round((Number(y0Arg) / 100) * H);
  const cw = Math.round(((Number(x1Arg) - Number(x0Arg)) / 100) * W);
  const ch = Math.round(((Number(y1Arg) - Number(y0Arg)) / 100) * H);
  const outW = Number(widthArg || 1200);
  const scale = outW / cw;
  const outH = Math.round(ch * scale);

  const marks = [];
  for (let p = 0; p <= 100; p += 1) {
    const px = (p / 100) * W;
    if (px < x0 || px > x0 + cw) continue;
    const lx = (px - x0) * scale;
    const strong = p % 5 === 0;
    marks.push(`<line x1="${lx}" y1="0" x2="${lx}" y2="${outH}" stroke="${strong ? 'rgba(255,0,255,0.9)' : 'rgba(0,255,255,0.5)'}" stroke-width="${strong ? 1.4 : 0.8}"/>`);
    if (strong) {
      marks.push(`<text x="${lx + 2}" y="13" font-family="monospace" font-size="12" fill="#000" stroke="#fff" stroke-width="2.5" paint-order="stroke">${p}</text>`);
      marks.push(`<text x="${lx + 2}" y="${outH - 4}" font-family="monospace" font-size="12" fill="#000" stroke="#fff" stroke-width="2.5" paint-order="stroke">${p}</text>`);
    }
  }
  for (let p = 0; p <= 100; p += 1) {
    const py = (p / 100) * H;
    if (py < y0 || py > y0 + ch) continue;
    const ly = (py - y0) * scale;
    const strong = p % 5 === 0;
    marks.push(`<line x1="0" y1="${ly}" x2="${outW}" y2="${ly}" stroke="${strong ? 'rgba(255,0,255,0.9)' : 'rgba(0,255,255,0.5)'}" stroke-width="${strong ? 1.4 : 0.8}"/>`);
    if (strong) {
      marks.push(`<text x="2" y="${ly - 3}" font-family="monospace" font-size="12" fill="#000" stroke="#fff" stroke-width="2.5" paint-order="stroke">${p}</text>`);
      marks.push(`<text x="${outW - 26}" y="${ly - 3}" font-family="monospace" font-size="12" fill="#000" stroke="#fff" stroke-width="2.5" paint-order="stroke">${p}</text>`);
    }
  }

  const svg = `<svg width="${outW}" height="${outH}" xmlns="http://www.w3.org/2000/svg">${marks.join('')}</svg>`;
  const base = await sharp(input).extract({ left: x0, top: y0, width: cw, height: ch }).resize({ width: outW }).png().toBuffer();
  await sharp(base).composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).png().toFile(output);
  console.log(`${output} crop ${x0Arg}-${x1Arg}% x ${y0Arg}-${y1Arg}%  -> ${outW}x${outH}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
