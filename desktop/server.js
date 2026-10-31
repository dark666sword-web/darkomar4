const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 47821; // منفذ ثابت حتى يبقى "عنوان" التطبيق ثابتاً وتبقى بياناته محفوظة
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.ico': 'image/x-icon'
};

function start(root) {
  root = path.resolve(root);
  return new Promise((resolve, reject) => {
    const srv = http.createServer((req, res) => {
      let p;
      try { p = decodeURIComponent(req.url.split('?')[0]); } catch (e) { res.writeHead(400); return res.end(); }
      if (p === '/' || p === '') p = '/index.html';
      const f = path.normalize(path.join(root, p));
      if (f !== root && !f.startsWith(root + path.sep)) { res.writeHead(403); return res.end('forbidden'); }
      fs.readFile(f, (err, data) => {
        if (err) { res.writeHead(404); return res.end('not found'); }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
        res.end(data);
      });
    });
    srv.on('error', reject);
    srv.listen(PORT, '127.0.0.1', () => resolve(srv));
  });
}
module.exports = { start, PORT };
