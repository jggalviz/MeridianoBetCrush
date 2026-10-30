'use strict';
/* Bounding boxes por componente conexo del canal alfa (para medir discos y placas). */
const sharp = require('sharp');

const [, , input, minPct = '0.05'] = process.argv;

(async () => {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const mask = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i += 1) mask[i] = data[i * c + 3] > 24 ? 1 : 0;

  const seen = new Uint8Array(w * h);
  const minArea = (Number(minPct) / 100) * w * h;
  const out = [];
  const stack = new Int32Array(w * h);

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

  out.sort((a, b) => b.area - a.area);
  const n = (v, t) => ((v / t) * 100).toFixed(2);
  console.log(`${input} ${w}x${h} · ${out.length} componentes >= ${minPct}%`);
  out.forEach((b, i) => {
    console.log(
      `#${String(i).padStart(2)} área ${n(b.area, w * h).padStart(6)}% · x ${n(b.minX, w)}-${n(b.maxX + 1, w)} · y ${n(b.minY, h)}-${n(b.maxY + 1, h)}`
    );
  });
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
