'use strict';
/* Perfiles de oro por columnas/filas para localizar discos y placas del case movil.
   Uso: node runs.js <arte> <y0> <y1> [gold|alpha]  · porcentajes 0-100 */
const sharp = require('sharp');

const [, , input, y0 = '0', y1 = '100', mode = 'gold'] = process.argv;

(async () => {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const ya = Math.round((Number(y0) / 100) * h);
  const yb = Math.round((Number(y1) / 100) * h);

  const col = new Array(w).fill(0);
  const row = new Array(h).fill(0);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * c;
      const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      let on = false;
      if (mode === 'gold') on = a > 200 && r > 170 && g > 110 && g < 215 && b < 110;
      else on = a > 24;
      if (!on) continue;
      if (y >= ya && y < yb) col[x] += 1;
      row[y] += 1;
    }
  }

  const bandH = yb - ya;
  const runs = (values, total, label) => {
    const max = Math.max(...values);
    const th = Math.max(2, max * 0.18);
    console.log(`\n--- ${label} (max ${max} de ${total}) ---`);
    let start = -1;
    for (let i = 0; i <= values.length; i += 1) {
      const on = i < values.length && values[i] >= th;
      if (on && start < 0) start = i;
      if (!on && start >= 0) {
        console.log(`  ${((start / values.length) * 100).toFixed(2)} - ${((i / values.length) * 100).toFixed(2)}  (ancho ${(((i - start) / values.length) * 100).toFixed(2)}%, pico ${Math.max(...values.slice(start, i))})`);
        start = -1;
      }
    }
  };

  runs(col, bandH, `columnas ${mode} en y ${y0}-${y1}%`);
  if (mode === 'alpha') runs(row, w, 'filas alpha en todo el ancho');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
