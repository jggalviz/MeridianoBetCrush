'use strict';
/* BBox preciso de aros (discos) y placas del panel nuevo. */
const sharp = require('sharp');
const FILE = 'public/src/assets/Panel de juego azul con corona dorada.png';

(async () => {
  const { data, info } = await sharp(FILE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const px = (x, y) => {
    const i = (Math.round(y) * w + Math.round(x)) * c;
    return [data[i], data[i + 1], data[i + 2], data[i + 3]];
  };
  // Aro dorado del arte nuevo: amarillo-naranja saturado.
  const isGold = ([r, g, b, a]) => a > 180 && r > 180 && g > 120 && b < 130 && r - b > 90;

  const scanRow = (yFrac, xFrom, xTo) => {
    const y = h * yFrac;
    let first = null;
    let last = null;
    for (let x = Math.round(w * xFrom); x < Math.round(w * xTo); x += 1) {
      if (isGold(px(x, y))) {
        if (first === null) first = x;
        last = x;
      }
    }
    return first === null ? null : [first / w, last / w];
  };

  const scanCol = (xFrac, yFrom, yTo) => {
    const x = w * xFrac;
    let first = null;
    let last = null;
    for (let y = Math.round(h * yFrom); y < Math.round(h * yTo); y += 1) {
      if (isGold(px(x, y))) {
        if (first === null) first = y;
        last = y;
      }
    }
    return first === null ? null : [first / h, last / h];
  };

  const pct = (v) => (v * 100).toFixed(2);

  console.log('=== discos (fila por el centro) ===');
  for (const [name, cx, yFrac, a, b] of [
    ['FEVER', 0.105, 0.57, 0.0, 0.19],
    ['AUTO', 0.272, 0.57, 0.19, 0.355],
    ['GIRAR', 0.5, 0.575, 0.355, 0.645],
    ['menos', 0.732, 0.57, 0.645, 0.81],
    ['mas', 0.897, 0.57, 0.81, 1.0]
  ]) {
    const row = scanRow(yFrac, a, b);
    const col = scanCol(cx, 0.2, 0.78);
    console.log(`${name.padEnd(6)} x ${row ? pct(row[0]) + '-' + pct(row[1]) : '?'}  y ${col ? pct(col[0]) + '-' + pct(col[1]) : '?'}`);
  }

  console.log('\n=== placas del pie ===');
  for (const [name, cx, a, b] of [
    ['placa1', 0.12, 0.03, 0.19],
    ['placa2', 0.28, 0.19, 0.36],
    ['placa3', 0.5, 0.36, 0.65],
    ['placa4', 0.86, 0.74, 0.98]
  ]) {
    const row = scanRow(0.79, a, b);
    const col = scanCol(cx, 0.68, 0.9);
    console.log(`${name} x ${row ? pct(row[0]) + '-' + pct(row[1]) : '?'}  y ${col ? pct(col[0]) + '-' + pct(col[1]) : '?'}`);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
