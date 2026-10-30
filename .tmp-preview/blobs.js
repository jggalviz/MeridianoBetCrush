'use strict';
/* Blobs afinados: interiores de disco (azul brillante) y placas (azul/vacio) del panel nuevo. */
const sharp = require('sharp');

const FILE = 'public/src/assets/Panel de juego azul con corona dorada.png';

function blobs(mask, w, h, minArea) {
  const seen = new Uint8Array(w * h);
  const out = [];
  for (let i = 0; i < w * h; i += 1) {
    if (!mask[i] || seen[i]) continue;
    let x0 = w, y0 = h, x1 = -1, y1 = -1, area = 0;
    const stack = [i];
    seen[i] = 1;
    while (stack.length) {
      const p = stack.pop();
      const x = p % w;
      const y = (p - x) / w;
      area += 1;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
      for (const q of [p - 1, p + 1, p - w, p + w]) {
        if (q < 0 || q >= w * h || seen[q] || !mask[q]) continue;
        if (Math.abs((q % w) - x) > 1) continue;
        seen[q] = 1;
        stack.push(q);
      }
    }
    if (area >= minArea) out.push({ x0, y0, x1, y1, area });
  }
  return out.sort((a, b) => b.area - a.area);
}

(async () => {
  const { data, info } = await sharp(FILE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const masks = { gold: new Uint8Array(w * h), bright: new Uint8Array(w * h) };
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * c;
      const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      if (a < 200) continue;
      if (r > 165 && g > 105 && g < 220 && b < 120) masks.gold[y * w + x] = 1;
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (b > 150 && b - r > 60 && lum > 140) masks.bright[y * w + x] = 1;
    }
  }

  for (const [name, mask, minArea] of [['bright', masks.bright, 4000], ['gold', masks.gold, 4000]]) {
    console.log(`\n=== ${name} ===`);
    for (const b of blobs(mask, w, h, minArea).slice(0, 22)) {
      const bw = b.x1 - b.x0 + 1;
      const bh = b.y1 - b.y0 + 1;
      console.log(
        `  ${String(bw).padStart(4)}x${String(bh).padStart(4)} ratio ${(bw / bh).toFixed(2)} ` +
          `x ${((b.x0 / w) * 100).toFixed(2)}-${((b.x1 / w) * 100).toFixed(2)}% ` +
          `y ${((b.y0 / h) * 100).toFixed(2)}-${((b.y1 / h) * 100).toFixed(2)}% ` +
          `centro (${(((b.x0 + b.x1) / 2 / w) * 100).toFixed(2)}%, ${(((b.y0 + b.y1) / 2 / h) * 100).toFixed(2)}%) area ${b.area}`
      );
    }
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
