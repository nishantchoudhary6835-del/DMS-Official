const { getDefaultConfig } = require('expo/metro-config');

const { createApiProxy } = require('./scripts/api-proxy');

const config = getDefaultConfig(__dirname);

const API_TARGET = process.env.TARGET || 'https://dms-s32w.onrender.com';

// TARGET silently defaulting to the deployed backend has caused real
// confusion before — a developer testing against a local backend with
// TARGET unset had no way to tell requests were actually going to
// production instead. This makes the active target impossible to miss.
console.log(`\n[api-proxy] Proxying /api/* to: ${API_TARGET}`);
if (!process.env.TARGET) {
  console.log(
    '[api-proxy] TARGET is not set — defaulting to the deployed backend above.\n' +
      "             Set TARGET=http://localhost:<port> to point at a local backend instead.\n"
  );
}

const apiProxy = createApiProxy({ target: API_TARGET });

config.server = {
  ...config.server,
  enhanceMiddleware: (metroMiddleware) => (req, res, next) => {
    if (req.url && req.url.startsWith('/api/')) {
      return apiProxy(req, res);
    }
    return metroMiddleware(req, res, next);
  },
};

module.exports = config;
