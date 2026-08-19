const http = require('http');
const https = require('https');
const { URL } = require('url');

const SENSITIVE = /token|password|secret|hash|authorization|otp/i;

/**
 * How many elements of an array to log before summarising the rest. Was 1,
 * which hid the exact thing a list endpoint is usually being inspected for —
 * whether it contains duplicates, and how many rows came back. Diagnosing
 * "one create produced three copies" was impossible from a log showing only
 * the first element.
 */
const ARRAY_SAMPLE = 8;

function shape(value, key) {
  if (value === null) return null;
  if (typeof value === 'boolean') return value;
  // Numbers were rendered as `<number>`, which erased pagination totals and
  // counts — the figures most worth seeing. They carry nothing sensitive.
  if (typeof value === 'number') return value;
  if (Array.isArray(value)) {
    if (!value.length) return [];

    const sample = value.slice(0, ARRAY_SAMPLE).map((item) => shape(item, key));

    return value.length > ARRAY_SAMPLE
      ? [...sample, `<+${value.length - ARRAY_SAMPLE} more, ${value.length} total>`]
      : sample;
  }
  if (typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value)) out[k] = shape(value[k], k);
    return out;
  }
  if (typeof value === 'string') {
    if (key && SENSITIVE.test(key)) return `<REDACTED string len=${value.length}>`;
    return value.length > 300 ? `<string len=${value.length}>` : value;
  }
  return `<${typeof value}>`;
}

function createApiProxy({ target, logBodies = true }) {
  const upstream = new URL(target);
  // TARGET is developer-supplied and commonly points at a plain-HTTP local
  // backend (http://localhost:5000) during local testing — always using
  // https here would try to TLS-handshake a server that isn't speaking TLS.
  const isHttps = upstream.protocol === 'https:';
  const client = isHttps ? https : http;

  return function proxyToBackend(req, res) {
    const headers = Object.assign({}, req.headers);
    headers.host = upstream.host;
    headers.origin = upstream.origin;
    delete headers['accept-encoding'];

    const started = Date.now();

    const proxied = client.request(
      {
        hostname: upstream.hostname,
        port: upstream.port || (isHttps ? 443 : 80),
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
        console.log(`  [api] ${req.method} ${req.url} -> ${up.statusCode} (${ms}ms)`);

        if (cookies) {
          cookies.forEach((c) => {
            const [pair, ...attrs] = c.split(';');
            const name = pair.split('=')[0];
            console.log(`        cookie ${name}; ${attrs.map((a) => a.trim()).join('; ')}`);
          });
        }

        const isJson = String(up.headers['content-type'] || '').includes('json');

        if (!isJson || !logBodies) {
          res.writeHead(up.statusCode, out);
          return up.pipe(res);
        }

        const chunks = [];
        up.on('data', (c) => chunks.push(c));
        up.on('end', () => {
          const raw = Buffer.concat(chunks);
          try {
            const pretty = JSON.stringify(shape(JSON.parse(raw.toString('utf8'))), null, 2);
            console.log('        ' + pretty.split('\n').join('\n        '));
          } catch {
            console.log(`        <unparseable, ${raw.length} bytes>`);
          }
          res.writeHead(up.statusCode, out);
          res.end(raw);
        });
      }
    );

    proxied.on('error', (err) => {
      console.log(`  [api] ${req.method} ${req.url} -> ERROR: ${err.message}`);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          success: false,
          message: `Proxy could not reach ${target}: ${err.message}`,
        })
      );
    });

    req.pipe(proxied);
  };
}

module.exports = { createApiProxy, shape };
