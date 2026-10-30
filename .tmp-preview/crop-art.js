'use strict';
/* Recorta al bbox de alfa con el mismo umbral que build-mobile-art.js y guarda el lienzo final. */
const fs = require('node:fs');
const sharp = require('sharp');

const [, , input, output] = process.argv;

function alphaBox(data, width, height, channels, threshold = 8) {
  let x0 = width;
  let y0 = height;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < height; y += 1) {
    const row = y * width;
    for (let x = 0; x < width; x += 1) {
      if (data[(row + x) * channels + 3] > threshold) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}

(async () => {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const box = alphaBox(data, info.width, info.height, info.channels);
  console.log(`${input}  lienzo ${info.width}x${info.height}  bbox`, box, 'h/w', (box.height / box.width).toFixed(6));
  await sharp(input)
    .ensureAlpha()
    .extract(box)
    .png()
    .toFile(output);
  console.log(`  -> ${output}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
