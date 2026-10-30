'use strict';
/* Extrae el bloque <<<GEO ... GEO>>> del `--dump-dom` de Chrome.
   Uso: node .tmp-preview/geoparse.js <dump.html> */
const fs = require('node:fs');

const html = fs.readFileSync(process.argv[2], 'utf8');
const m = html.match(/<pre id="geo">([\s\S]*?)<\/pre>/);
if (!m) {
  console.log('sin sonda GEO en el volcado');
  process.exit(1);
}
console.log(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/^[\s\S]*?<<<GEO/, '').replace(/GEO>>>[\s\S]*$/, '').trim());
