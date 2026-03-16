/**
 * Al-Ajwa Restaurant – Local CMS Server
 * Run with: node server.js
 * Then open: http://localhost:3000/admin.html
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.ttf':  'font/ttf',
};

const server = http.createServer((req, res) => {
  // ── CORS (allows admin.html to talk to server) ──
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── SAVE endpoint ──────────────────────────────
  if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        // Validate JSON before writing
        JSON.parse(body);
        const filePath = path.join(ROOT, 'data.json');
        fs.writeFileSync(filePath, body, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, message: 'تم الحفظ بنجاح ✓' }));
        console.log('[SAVE] data.json updated at', new Date().toLocaleTimeString());
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, message: 'خطأ في البيانات: ' + e.message }));
      }
    });
    return;
  }

  // ── STATIC FILE serving ────────────────────────
  let urlPath = req.url.split('?')[0]; // strip query string
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';

  const filePath = path.join(ROOT, urlPath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found: ' + urlPath);
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
      return;
    }
    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ╔═══════════════════════════════════════════╗');
  console.log('  ║   مطعم الأجواء – لوحة التحكم             ║');
  console.log('  ║   Al-Ajwa CMS Server is running!          ║');
  console.log('  ╠═══════════════════════════════════════════╣');
  console.log(`  ║  Admin Panel : http://localhost:${PORT}/admin.html  ║`);
  console.log(`  ║  Website     : http://localhost:${PORT}/            ║`);
  console.log('  ╠═══════════════════════════════════════════╣');
  console.log('  ║  Press Ctrl+C to stop the server          ║');
  console.log('  ╚═══════════════════════════════════════════╝');
  console.log('');
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`\n  ❌ Port ${PORT} is already in use.`);
    console.error(`  Try stopping other servers, or open http://localhost:${PORT}/admin.html directly.\n`);
  } else {
    console.error('Server error:', e.message);
  }
  process.exit(1);
});
