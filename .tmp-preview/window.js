'use strict';
/* Bbox de oro dentro de una ventana (para medir discos y placas del case).
   Uso: node window.js <arte> <x0> <x1> <y0> <y1> [paso] */
const sharp = require('sharp');

const [, , input, x0, x1, y0, y1, stepArg = '2'] = process.argv;

(async () => {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const xa = Math.round((Number(x0) / 100) * w);
  const xb = Math.round((Number(x1) / 100) * w);
  const ya = Math.round((Number(y0) / 100) * h);
  const yb = Math.round((Number(y1) / 100) * h);

  const isGold = (i) => data[i + 3] > 200 && data[i] > 170 && data[i + 1] > 110 && data[i + 1] < 215 && data[i + 2] < 110;

  let minX = w;
  let maxX = -1;
  let minY = h;
  let maxY = -1;
  const rows = [];
  for (let y = ya; y < yb; y += 1) {
    let rMin = w;
    let rMax = -1;
    for (let x = xa; x < xb; x += 1) {
      if (!isGold((y * w + x) * c)) continue;
      if (x < rMin) rMin = x;
      if (x > rMax) rMax = x;
    }
    if (rMax >= 0) {
      if (rMin < minX) minX = rMin;
      if (rMax > maxX) maxX = rMax;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      rows.push([y, rMin, rMax]);
    }
  }

  const px = (v) => ((v / w) * 100).toFixed(2);
  const py = (v) => ((v / h) * 100).toFixed(2);
  console.log(`ventana x ${x0}-${x1} y ${y0}-${y1} → oro: x ${px(minX)}-${px(maxX + 1)} · y ${py(minY)}-${py(maxY + 1)}`);
  const step = Math.max(1, Math.round(Number(stepArg)));
  const stride = Math.max(1, Math.round(rows.length / 40));
  for (let i = 0; i < rows.length; i += stride * step) {
    const [y, rMin, rMax] = rows[i];
    console.log(`  y ${py(y).padStart(6)} · x ${px(rMin).padStart(6)}-${px(rMax + 1).padStart(6)} · ancho ${px(rMax + 1 - rMin).padStart(6)}`);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
