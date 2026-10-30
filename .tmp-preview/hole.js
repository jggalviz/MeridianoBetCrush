'use strict';
/* Hueco transparente del marco (ventana del tablero): por fila, primer y ultimo
   pixel con alfa <= 8 dentro de la banda central, y bbox global.
   Uso: node hole.js <arte> [alfaMax=8] */
const sharp = require('sharp');

const [, , input, alphaMax = '8'] = process.argv;

(async () => {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const lim = Number(alphaMax);
  let x0 = w;
  let x1 = -1;
  let y0 = h;
  let y1 = -1;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      if (data[(y * w + x) * c + 3] <= lim) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  const p = (v, t) => ((v / t) * 100).toFixed(2);
  console.log(`${input} ${w}x${h} · bbox de alfa<=${lim}: x ${p(x0, w)}-${p(x1 + 1, w)} · y ${p(y0, h)}-${p(y1 + 1, h)}`);

  // Filas: primer/ultimo transparente en el 8-92 % del ancho, para ver el hueco interior.
  for (let pct = 36; pct <= 96; pct += 4) {
    const y = Math.round((pct / 100) * h);
    let a = -1;
    let b = -1;
    for (let x = Math.round(0.04 * w); x < Math.round(0.96 * w); x += 1) {
      if (data[(y * w + x) * c + 3] <= lim) {
        if (a < 0) a = x;
        b = x;
      }
    }
    if (a >= 0) console.log(`  y ${pct}% · hueco x ${p(a, w)} - ${p(b + 1, w)}`);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
