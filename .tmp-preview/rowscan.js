'use strict';
/* Perfil de una fila: runs de pixeles claros (luminancia) con el color medio.
   Uso: node rowscan.js <arte> <y%> [lumMin=120] */
const sharp = require('sharp');

const [, , input, pos = '78', lumMin = '120'] = process.argv;

(async () => {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const y = Math.round((Number(pos) / 100) * h);
  const lim = Number(lumMin);
  const on = new Array(w);
  for (let x = 0; x < w; x += 1) {
    const i = (y * w + x) * c;
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    on[x] = data[i + 3] > 200 && lum >= lim ? lum : 0;
  }
  console.log(`fila y ${pos}% (px ${y}) de ${w}x${h} · claros con lum >= ${lim}`);
  const pct = (v) => ((v / w) * 100).toFixed(2);
  let start = -1;
  for (let x = 0; x <= w; x += 1) {
    const v = x < w && on[x];
    if (v && start < 0) start = x;
    if (!v && start >= 0) {
      if (x - start >= 4) console.log(`  x ${pct(start)} - ${pct(x)}  (ancho ${pct(x - start)})`);
      start = -1;
    }
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
