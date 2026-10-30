'use strict';
/* Servidor estatico minimo para revisar la maqueta movil con Chrome headless.
   Uso: node .tmp-preview/serve.js [puerto=4183] */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PUBLIC = path.join(__dirname, '..', 'public');
const port = Number(process.argv[2] || 4183);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.json': 'application/json'
};

http
  .createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    let file = path.join(PUBLIC, url === '/' ? 'index.html' : url);
    if (!file.startsWith(PUBLIC)) {
      res.writeHead(403).end('forbidden');
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) {
      res.writeHead(404).end('not found');
      return;
    }
    res.writeHead(200, {
      'content-type': TYPES[path.extname(file)] || 'application/octet-stream',
      'cache-control': 'no-store'
    });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, () => console.log(`preview en http://localhost:${port}`));
