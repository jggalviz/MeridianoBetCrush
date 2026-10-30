'use strict';
/* Recorridos 1D de oro: columnas (runs en y) o filas (runs en x).
   Uso: node colscan.js <arte> col|row <pos%> [desde%] [hasta%] */
const sharp = require('sharp');

const [, , input, mode = 'col', pos = '50', from = '0', to = '100'] = process.argv;

(async () => {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const isGold = (i) => data[i + 3] > 200 && data[i] > 170 && data[i + 1] > 110 && data[i + 1] < 215 && data[i + 2] < 110;

  const fixed = Math.round((Number(pos) / 100) * (mode === 'col' ? w : h));
  const len = mode === 'col' ? h : w;
  const on = new Array(len);
  for (let i = 0; i < len; i += 1) {
    const x = mode === 'col' ? fixed : i;
    const y = mode === 'col' ? i : fixed;
    on[i] = isGold((y * w + x) * c);
  }

  const lo = Math.round((Number(from) / 100) * len);
  const hi = Math.round((Number(to) / 100) * len);
  const pct = (v) => ((v / len) * 100).toFixed(2);

  console.log(`${mode} ${pos}% · runs de oro entre ${from}-${to}%`);
  let start = -1;
  for (let i = lo; i <= hi; i += 1) {
    const v = i < hi && on[i];
    if (v && start < 0) start = i;
    if (!v && start >= 0) {
      console.log(`  ${pct(start)} - ${pct(i)}  (grosor ${pct(i - start)})`);
      start = -1;
    }
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
