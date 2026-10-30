'use strict';
/* Genera `public/.geo.html` (copia de index.html + sonda de geometria) para
   volcar las cajas reales con Chrome headless:
     node .tmp-preview/geo.js            -> crea public/.geo.html
     chrome --headless=new --dump-dom http://localhost:4183/.geo.html
   La sonda escribe un <pre id="geo"> al final del documento. */
const fs = require('node:fs');
const path = require('node:path');

const PUBLIC = path.join(__dirname, '..', 'public');
const SELS = [
  '.machine',
  '.machine__table',
  '.machine__table .board',
  '.machine__side .hud',
  '.machine__side .machine__hero',
  '.machine__side .controls',
  '#btn-feature',
  '#btn-auto',
  '#btn-spin',
  '#btn-bet-down',
  '#btn-bet-up',
  '#btn-bet-max',
  '#spin-label',
  '.balance',
  '.bet-readout'
];

const outline = `
<style>
  .machine__side .controls .gbtn,
  .machine__side .controls__bet .chip.gbtn { outline: 1px solid rgba(255, 0, 0, 0.9); outline-offset: 0; }
  .machine__table .board { outline: 1px solid rgba(0, 128, 255, 0.9); }
  .machine__side .hud { outline: 1px solid rgba(0, 200, 0, 0.9); }
  .machine__side .machine__hero { outline: 1px solid rgba(255, 0, 255, 0.9); }
  .machine__side .controls { outline: 1px solid rgba(255, 255, 0, 0.9); }
</style>
`;

const probe = `
<script>
(function () {
  function run() {
    var host = document.querySelector('.machine') || document.documentElement;
    var cs = getComputedStyle(host);
    var lines = [
      'vw=' + innerWidth + 'x' + innerHeight,
      'm-w=' + cs.getPropertyValue('--m-w').trim(),
      'frame-h=' + cs.getPropertyValue('--frame-h').trim(),
      'doc=' + document.documentElement.scrollWidth + 'x' + document.documentElement.scrollHeight
    ];
    ${JSON.stringify(SELS)}.forEach(function (s) {
      var el = document.querySelector(s);
      if (!el) {
        lines.push(s + ' = MISSING');
        return;
      }
      var r = el.getBoundingClientRect();
      lines.push(
        s + ' = ' + [r.left, r.top, r.width, r.height].map(function (n) { return n.toFixed(1); }).join(' | ')
      );
    });
    var pre = document.createElement('pre');
    pre.id = 'geo';
    pre.textContent = '<<<GEO\\n' + lines.join('\\n') + '\\nGEO>>>';
    document.body.appendChild(pre);
  }
  addEventListener('load', function () { setTimeout(run, 400); });
})();
</script>
`;

const html = fs.readFileSync(path.join(PUBLIC, 'index.html'), 'utf8');
const extra = outline + probe;
const out = html.includes('</body>')
  ? html.replace('</body>', `${extra}</body>`)
  : html + extra;
fs.writeFileSync(path.join(PUBLIC, '.geo.html'), out);
console.log(`public/.geo.html escrito (${out.length} bytes)`);
