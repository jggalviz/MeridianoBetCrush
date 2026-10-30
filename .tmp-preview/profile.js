'use strict';
/* Perfiles de color del panel nuevo para localizar discos y placas. */
const sharp = require('sharp');

const FILE = 'public/src/assets/Panel de juego azul con corona dorada.png';

function bar(v, max, width = 100) {
  const n = max > 0 ? Math.round((v / max) * width) : 0;
  return '#'.repeat(n) + '.'.repeat(Math.max(0, width - n));
}

(async () => {
  const { data, info } = await sharp(FILE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;

  const gold = new Uint8Array(w * h);
  const bright = new Uint8Array(w * h);
  const dark = new Uint8Array(w * h);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * c;
      const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      if (a < 200) continue;
      if (r > 170 && g > 110 && g < 215 && b < 110) gold[y * w + x] = 1;
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (b > 120 && b - r > 40 && lum > 150) bright[y * w + x] = 1; // azul claro de los discos
      if (b > 90 && b - r > 30 && lum <= 150) dark[y * w + x] = 1;
    }
  }

  const cols = (mask, y0, y1) => {
    const out = new Array(w).fill(0);
    for (let y = Math.round(y0 * h); y < Math.round(y1 * h); y += 1) {
      for (let x = 0; x < w; x += 1) if (mask[y * w + x]) out[x] += 1;
    }
    return out;
  };
  const rows = (mask, x0, x1) => {
    const out = new Array(h).fill(0);
    for (let y = 0; y < h; y += 1) {
      for (let x = Math.round(x0 * w); x < Math.round(x1 * w); x += 1) if (mask[y * w + x]) out[x + y * 0] += 0, out[y] += mask[y * w + x] ? 1 : 0;
    }
    return out;
  };

  const printProfile = (label, values, total) => {
    const max = Math.max(...values);
    console.log(`\n--- ${label} (max ${max}) ---`);
    const step = Math.max(1, Math.round(values.length / 120));
    for (let i = 0; i < values.length; i += step) {
      const pct = ((i / values.length) * 100).toFixed(1).padStart(5);
      console.log(`${pct}% ${bar(values[i], max, 80)}`);
    }
  };

  // Banda de los discos: 24%-72% de alto
  printProfile('ORO por columnas, banda discos y=24-72%', cols(gold, 0.24, 0.72), h);
  printProfile('AZUL CLARO por columnas, banda discos y=24-72%', cols(bright, 0.24, 0.72), h);
  // Banda de las placas del pie: 78%-98%
  printProfile('ORO por columnas, banda placas y=78-98%', cols(gold, 0.78, 0.98), h);
  printProfile('AZUL por filas, x=0-100%', rows(bright, 0, 1), w);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
