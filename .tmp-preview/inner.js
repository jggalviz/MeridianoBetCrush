'use strict';
/* Interior azul de discos y placas (mas estable que el aro, que se funde con la banda). */
const sharp = require('sharp');
const FILE = 'public/src/assets/Panel de juego azul con corona dorada.png';

(async () => {
  const { data, info } = await sharp(FILE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const px = (x, y) => {
    const i = (Math.round(y) * w + Math.round(x)) * c;
    return [data[i], data[i + 1], data[i + 2], data[i + 3]];
  };
  const isInner = ([r, g, b, a]) => a > 200 && b > 130 && b - r > 80 && r < 90;
  const isGold = ([r, g, b, a]) => a > 180 && r > 180 && g > 120 && b < 130 && r - b > 90;

  const bbox = (x0, x1, y0, y1, test) => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let y = Math.round(h * y0); y < Math.round(h * y1); y += 1) {
      for (let x = Math.round(w * x0); x < Math.round(w * x1); x += 1) {
        if (test(px(x, y))) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (minX === Infinity) return null;
    return [(minX / w) * 100, (maxX / w) * 100, (minY / h) * 100, (maxY / h) * 100];
  };
  const show = (label, b) =>
    console.log(`${label.padEnd(8)} ${b ? `x ${b[0].toFixed(2)}-${b[1].toFixed(2)}  y ${b[2].toFixed(2)}-${b[3].toFixed(2)}` : 'sin datos'}`);

  console.log('=== interior azul de los discos ===');
  show('FEVER', bbox(0.02, 0.19, 0.40, 0.76, isInner));
  show('AUTO', bbox(0.195, 0.35, 0.40, 0.76, isInner));
  show('menos', bbox(0.65, 0.81, 0.40, 0.76, isInner));
  show('mas', bbox(0.815, 0.98, 0.40, 0.76, isInner));

  console.log('\n=== aro del GIRAR en columnas laterales (evita la corona) ===');
  for (const cx of [0.40, 0.44, 0.56, 0.60]) {
    let first = null, last = null;
    for (let y = Math.round(h * 0.18); y < Math.round(h * 0.78); y += 1) {
      if (isGold(px(w * cx, y))) {
        if (first === null) first = y;
        last = y;
      }
    }
    console.log(`x=${(cx * 100).toFixed(0)}%  y ${(first / h * 100).toFixed(2)}-${(last / h * 100).toFixed(2)}`);
  }

  console.log('\n=== interior azul de las placas ===');
  show('placa1', bbox(0.04, 0.20, 0.70, 0.92, isInner));
  show('placa2', bbox(0.20, 0.36, 0.70, 0.92, isInner));
  show('placa3', bbox(0.36, 0.65, 0.70, 0.92, isInner));
  show('placa4', bbox(0.74, 0.97, 0.70, 0.92, isInner));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
