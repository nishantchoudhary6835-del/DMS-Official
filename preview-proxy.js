const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 4400);
const TARGET = process.env.TARGET || 'https://dms-s32w.onrender.com';
const ROOT = path.join(__dirname, process.env.ROOT || 'webdist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const SENSITIVE = /token|password|secret|hash|authorization|otp/i;

function shape(value, key) {
  if (value === null) return null;
  if (Array.isArray(value)) {
    return value.length ? [shape(value[0], key)] : [];
  }
  if (typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value)) out[k] = shape(value[k], k);
    return out;
  }
  if (typeof value === 'string') {
    if (key && SENSITIVE.test(key)) return `<REDACTED string len=${value.length}>`;
    return value.length > 60 ? `<string len=${value.length}>` : value;
  }
  return `<${typeof value}>`;
}

function proxyToBackend(req, res) {
  const target = new URL(TARGET);
  const headers = Object.assign({}, req.headers);
  headers.host = target.host;
  headers.origin = target.origin;
  delete headers['accept-encoding'];

  const started = Date.now();

  const upstream = https.request(
    {
      hostname: target.hostname,
      port: target.port || 443,
      path: req.url,
      method: req.method,
      headers,
    },
    (up) => {
      const out = Object.assign({}, up.headers);

      delete out['access-control-allow-origin'];
      delete out['access-control-allow-credentials'];

      const cookies = out['set-cookie'];
      if (cookies) {
        out['set-cookie'] = cookies.map((c) =>
          c
            .replace(/;\s*Secure/gi, '')
            .replace(/;\s*Domain=[^;]*/gi, '')
            .replace(/;\s*SameSite=(None|Strict)/gi, '; SameSite=Lax')
        );
      }

      const ms = Date.now() - started;
      console.log(
        `  ${req.method} ${req.url} -> ${up.statusCode} (${ms}ms)` +
          (cookies ? `  [set-cookie x${cookies.length}]` : '')
      );

      const isJson = String(up.headers['content-type'] || '').includes('json');

      if (!isJson) {
        res.writeHead(up.statusCode, out);
        return up.pipe(res);
      }

      const chunks = [];
      up.on('data', (c) => chunks.push(c));
      up.on('end', () => {
        const raw = Buffer.concat(chunks);
        try {
          console.log('    body shape: ' + JSON.stringify(shape(JSON.parse(raw.toString('utf8'))), null, 2)
            .split('\n').join('\n    '));
        } catch {
          console.log('    body: <unparseable, ' + raw.length + ' bytes>');
        }
        if (cookies) {
          cookies.forEach((c) => console.log('    cookie: ' + c.split('=')[0] + '; ' + c.split(';').slice(1).join(';').trim()));
        }
        res.writeHead(up.statusCode, out);
        res.end(raw);
      });
    }
  );

  upstream.on('error', (err) => {
    console.log(`  ${req.method} ${req.url} -> PROXY ERROR: ${err.message}`);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        success: false,
        message: `Preview proxy could not reach ${TARGET}: ${err.message}`,
      })
    );
  });

  req.pipe(upstream);
}

function serveStatic(req, res) {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/') rel = '/index.html';

  let file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    file = path.join(ROOT, 'index.html');
  }

  if (!fs.existsSync(file)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('webdist/ not found. Run the export command first.');
  }

  res.writeHead(200, {
    'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  fs.createReadStream(file).pipe(res);
}

http
  .createServer((req, res) => {
    if (req.url.startsWith('/api/')) return proxyToBackend(req, res);
    return serveStatic(req, res);
  })
  .listen(PORT, () => {
    console.log(`Preview server running`);
    console.log(`  app    : http://localhost:${PORT}`);
    console.log(`  serving: ${path.basename(ROOT)}/`);
    console.log(`  /api/* -> ${TARGET}`);
  });
