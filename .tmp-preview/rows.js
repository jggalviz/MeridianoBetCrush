'use strict';
/* Muestreo de filas concretas para localizar bordes de placas y discos. */
const sharp = require('sharp');
const FILE = 'public/src/assets/Panel de juego azul con corona dorada.png';

(async () => {
  const { data, info } = await sharp(FILE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const at = (x, y) => {
    const i = (Math.round(y) * w + Math.round(x)) * c;
    return [data[i], data[i + 1], data[i + 2], data[i + 3]];
  };
  const hex = ([r, g, b, a]) => `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}${a < 200 ? '(a' + a + ')' : ''}`;
  const isGold = ([r, g, b, a]) => a > 200 && r > 165 && g > 105 && g < 225 && b < 130;
  const isDarkBlue = ([r, g, b, a]) => a > 200 && b > 110 && b - r > 70 && r < 90;

  for (const frac of [0.335, 0.36, 0.56, 0.60, 0.88, 0.905, 0.93]) {
    const y = h * frac;
    const runs = [];
    let kind = null;
    let start = 0;
    for (let x = 0; x < w; x += 1) {
      const px = at(x, y);
      const k = isGold(px) ? 'gold' : isDarkBlue(px) ? 'blue' : px[3] < 200 ? 'clear' : 'other';
      if (k !== kind) {
        if (kind && x - start > 6) runs.push(`${kind} ${((start / w) * 100).toFixed(2)}-${((x / w) * 100).toFixed(2)}%`);
        kind = k;
        start = x;
      }
    }
    if (kind) runs.push(`${kind} ${((start / w) * 100).toFixed(2)}-100%`);
    console.log(`\ny=${(frac * 100).toFixed(1)}% (px ${Math.round(y)})`);
    console.log('  ' + runs.join(' | '));
  }

  // muestras de la banda del pie para ver el color interior de las placas
  console.log('\nmuestras y=90%:');
  for (let p = 2; p < 100; p += 4) {
    console.log(`  x=${p}% ${hex(at((p / 100) * w, h * 0.9))}`);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
