const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.pdf': 'application/pdf', '.json': 'application/json; charset=utf-8', '.ttf': 'font/ttf' };
const server = http.createServer((req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
  let target;
  try { target = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname)); } catch { res.writeHead(400).end(); return; }
  if (target !== root && !target.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  const pathname = new URL(req.url, 'http://localhost').pathname.replace(/\/$/,'');
  if (target === root || pathname === '/hanh-trinh') target = path.join(root, 'index.html');
  if (['/on-tap','/mindmap'].includes(pathname)) target = path.join(root, pathname.slice(1), 'index.html');
  fs.stat(target, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Content-Length': stat.size, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    if (req.method === 'HEAD') { res.end(); return; }
    const stream = fs.createReadStream(target); stream.on('error', () => res.destroy()); stream.pipe(res);
  });
});
server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? `Port ${port} is already in use. Open http://127.0.0.1:${port} or use a different PORT.` : error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${port}/hanh-trinh/`;
  console.log(`Su Dang: ${url}`);
  if (process.env.SU_DANG_OPEN_BROWSER === '1') {
    require('node:child_process').spawn('explorer.exe', [url], { windowsHide: true, detached: true, stdio: 'ignore' }).unref();
  }
});
