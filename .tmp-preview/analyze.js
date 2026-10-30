'use strict';
/* Analisis temporal: geometria real del arte nuevo (no forma parte del repo). */
const sharp = require('sharp');

const FILES = {
  marco: 'public/src/assets/Marco-deportivo-dorado-con-balones-y-monedas-final.png',
  panel: 'public/src/assets/Panel de juego azul con corona dorada.png'
};

function label(mask, w, h, minArea) {
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
      const n = [p - 1, p + 1, p - w, p + w];
      for (const q of n) {
        if (q < 0 || q >= w * h || seen[q] || !mask[q]) continue;
        // evita saltos de fila
        const qx = q % w;
        if (Math.abs(qx - x) > 1) continue;
        seen[q] = 1;
        stack.push(q);
      }
    }
    if (area >= minArea) {
      out.push({ x0, y0, w: x1 - x0 + 1, h: y1 - y0 + 1, area });
    }
  }
  return out.sort((a, b) => b.area - a.area);
}

async function run() {
  for (const [key, file] of Object.entries(FILES)) {
    const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width: w, height: h, channels: c } = info;

    // bbox de alfa
    let bx0 = w, by0 = h, bx1 = -1, by1 = -1;
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        if (data[(y * w + x) * c + 3] > 8) {
          if (x < bx0) bx0 = x;
          if (x > bx1) bx1 = x;
          if (y < by0) by0 = y;
          if (y > by1) by1 = y;
        }
      }
    }
    const bw = bx1 - bx0 + 1;
    const bh = by1 - by0 + 1;
    console.log(`\n=== ${key}: lienzo ${w}x${h}  bbox ${bw}x${bh} @ (${bx0},${by0})  ratio ${(bw / bh).toFixed(4)}`);

    const pct = (v, total, origin) => (((v - origin) / total) * 100).toFixed(2);

    // 1) huecos transparentes grandes (ventana del tablero)
    const transparent = new Uint8Array(w * h);
    for (let y = by0; y <= by1; y += 1) {
      for (let x = bx0; x <= bx1; x += 1) {
        if (data[(y * w + x) * c + 3] <= 8) transparent[y * w + x] = 1;
      }
    }
    const holes = label(transparent, w, h, Math.round(bw * bh * 0.01));
    for (const hole of holes.slice(0, 4)) {
      console.log(
        `  hueco alfa ${hole.w}x${hole.h} (${pct(hole.x0, bw, bx0)}% x ${pct(hole.y0, bh, by0)}% w ${pct(hole.x0 + hole.w, bw, bx0)}% h ${pct(hole.y0 + hole.h, bh, by0)}%)`
      );
    }

    // 2) mascara azul (placas / cuerpo de la consola)
    const blue = new Uint8Array(w * h);
    for (let y = by0; y <= by1; y += 1) {
      for (let x = bx0; x <= bx1; x += 1) {
        const i = (y * w + x) * c;
        if (data[i + 3] > 200 && data[i + 2] > 140 && data[i + 2] - data[i] > 60 && data[i + 1] < 190) {
          blue[y * w + x] = 1;
        }
      }
    }
    const blues = label(blue, w, h, Math.round(bw * bh * 0.0015));
    for (const b of blues.slice(0, 8)) {
      console.log(
        `  azul ${b.w}x${b.h} (${pct(b.x0, bw, bx0)}% x ${pct(b.y0, bh, by0)}% -> w ${pct(b.x0 + b.w, bw, bx0)}% h ${pct(b.y0 + b.h, bh, by0)}%) area ${b.area}`
      );
    }

    // 3) mascara dorada (aros de botones)
    const gold = new Uint8Array(w * h);
    for (let y = by0; y <= by1; y += 1) {
      for (let x = bx0; x <= bx1; x += 1) {
        const i = (y * w + x) * c;
        if (data[i + 3] > 200 && data[i] > 170 && data[i + 1] > 110 && data[i + 1] < 215 && data[i + 2] < 110) {
          gold[y * w + x] = 1;
        }
      }
    }
    const golds = label(gold, w, h, Math.round(bw * bh * 0.002));
    for (const g of golds.slice(0, 10)) {
      console.log(
        `  oro ${g.w}x${g.h} ratio ${(g.w / g.h).toFixed(2)} centro (${((g.x0 + g.w / 2 - bx0) / bw * 100).toFixed(2)}%, ${((g.y0 + g.h / 2 - by0) / bh * 100).toFixed(2)}%) area ${g.area}`
      );
    }
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
