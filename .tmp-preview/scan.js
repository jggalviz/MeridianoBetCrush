'use strict';
/* Tramos de oro / alfa / azul a lo largo de una fila o columna, en %. */
const sharp = require('sharp');

const [, , input, mode, fracArg, fromArg, toArg] = process.argv;

(async () => {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const px = (x, y) => {
    const i = (Math.round(y) * w + Math.round(x)) * c;
    return [data[i], data[i + 1], data[i + 2], data[i + 3]];
  };
  const isGold = ([r, g, b, a]) => a > 170 && r > 170 && g > 110 && b < 140 && r - b > 80;
  const isClear = ([, , , a]) => a < 40;
  const isBlue = ([r, g, b, a]) => a > 200 && b > 120 && b - r > 60 && r < 110;

  const kind = (p) => (isClear(p) ? 'clear' : isGold(p) ? 'gold' : isBlue(p) ? 'blue' : 'other');
  const frac = Number(fracArg) / 100;
  const from = Number(fromArg) / 100;
  const to = Number(toArg) / 100;
  const len = mode === 'row' ? w : h;
  const pos = Math.round((mode === 'row' ? h : w) * frac);

  const runs = [];
  let current = null;
  let start = 0;
  for (let i = Math.round(len * from); i < Math.round(len * to); i += 1) {
    const p = mode === 'row' ? px(i, pos) : px(pos, i);
    const k = kind(p);
    if (k !== current) {
      if (current && i - start > 3) runs.push(`${current} ${((start / len) * 100).toFixed(2)}-${((i / len) * 100).toFixed(2)}`);
      current = k;
      start = i;
    }
  }
  if (current) runs.push(`${current} ${((start / len) * 100).toFixed(2)}-${((Math.round(len * to) / len) * 100).toFixed(2)}`);
  const label = mode === 'row' ? `y=${fracArg}%` : `x=${fracArg}%`;
  console.log(`${label}\n  ${runs.join('\n  ')}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
