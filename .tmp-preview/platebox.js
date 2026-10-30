'use strict';
/* Cajas de las placas del pie: componentes conexos de "oro" (aro de la placa)
   dentro de una banda vertical. Uso: node platebox.js <arte> <y0%> <y1%> [area%] */
const sharp = require('sharp');

const [, , input, y0 = '60', y1 = '100', minPct = '0.15'] = process.argv;

(async () => {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const ya = Math.round((Number(y0) / 100) * h);
  const yb = Math.round((Number(y1) / 100) * h);

  const mask = new Uint8Array(w * h);
  for (let y = ya; y < yb; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * c;
      const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      const gold = a > 200 && r > 165 && g > 105 && g < 225 && b < 125 && r - b > 70;
      if (gold) mask[y * w + x] = 1;
    }
  }

  const seen = new Uint8Array(w * h);
  const stack = new Int32Array(w * h);
  const minArea = (Number(minPct) / 100) * w * h;
  const out = [];
  for (let start = 0; start < w * h; start += 1) {
    if (!mask[start] || seen[start]) continue;
    let sp = 0;
    stack[sp++] = start;
    seen[start] = 1;
    let minX = w;
    let maxX = -1;
    let minY = h;
    let maxY = -1;
    let area = 0;
    while (sp > 0) {
      const p = stack[--sp];
      const x = p % w;
      const y = (p - x) / w;
      area += 1;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (x > 0 && mask[p - 1] && !seen[p - 1]) { seen[p - 1] = 1; stack[sp++] = p - 1; }
      if (x < w - 1 && mask[p + 1] && !seen[p + 1]) { seen[p + 1] = 1; stack[sp++] = p + 1; }
      if (y > 0 && mask[p - w] && !seen[p - w]) { seen[p - w] = 1; stack[sp++] = p - w; }
      if (y < h - 1 && mask[p + w] && !seen[p + w]) { seen[p + w] = 1; stack[sp++] = p + w; }
    }
    if (area >= minArea) out.push({ area, minX, maxX, minY, maxY });
  }

  out.sort((a, b) => a.minX - b.minX);
  const n = (v, t) => ((v / t) * 100).toFixed(2);
  console.log(`${input} ${w}x${h} · banda y ${y0}-${y1}% · ${out.length} cajas >= ${minPct}%`);
  out.forEach((b, i) => {
    console.log(
      `#${String(i).padStart(2)} area ${n(b.area, w * h).padStart(6)}% · x ${n(b.minX, w)}-${n(b.maxX + 1, w)} · y ${n(b.minY, h)}-${n(b.maxY + 1, h)} · centro x ${n((b.minX + b.maxX + 1) / 2, w)} · centro y ${n((b.minY + b.maxY + 1) / 2, h)}`
    );
  });
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
