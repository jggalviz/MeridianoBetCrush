'use strict';
/* Perfil de una columna: runs de pixeles claros (luminancia).
   Uso: node colscan2.js <arte> <x%> [lumMin=120] [desde%] [hasta%] */
const sharp = require('sharp');

const [, , input, pos = '50', lumMin = '120', from = '0', to = '100'] = process.argv;

(async () => {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const x = Math.round((Number(pos) / 100) * w);
  const lim = Number(lumMin);
  const on = new Array(h);
  for (let y = 0; y < h; y += 1) {
    const i = (y * w + x) * c;
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    on[y] = data[i + 3] > 200 && lum >= lim ? lum : 0;
  }
  const lo = Math.round((Number(from) / 100) * h);
  const hi = Math.round((Number(to) / 100) * h);
  const pct = (v) => ((v / h) * 100).toFixed(2);
  console.log(`columna x ${pos}% (px ${x}) de ${w}x${h} · claros con lum >= ${lim} entre ${from}-${to}%`);
  let start = -1;
  for (let y = lo; y <= hi; y += 1) {
    const v = y < hi && on[y];
    if (v && start < 0) start = y;
    if (!v && start >= 0) {
      if (y - start >= 2) console.log(`  y ${pct(start)} - ${pct(y)}  (alto ${pct(y - start)})`);
      start = -1;
    }
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
