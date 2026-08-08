const { getDefaultConfig } = require('expo/metro-config');

const { createApiProxy } = require('./scripts/api-proxy');

const config = getDefaultConfig(__dirname);

const API_TARGET = process.env.TARGET || 'https://dms-s32w.onrender.com';

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
