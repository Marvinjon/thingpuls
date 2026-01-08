const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Determine the target based on whether we're in Docker or not
  const target = process.env.PROXY_TARGET || 'http://backend:8000';
  
  console.log('Setting up proxy to:', target);
  
  // Proxy API requests - match all paths starting with /api
  const apiProxy = createProxyMiddleware({
    target: target,
    changeOrigin: true,
    timeout: 30000,
    secure: false,
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[PROXY] ${req.method} ${req.url} -> ${target}${req.url}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[PROXY] Response: ${proxyRes.statusCode} for ${req.url}`);
    },
    onError: (err, req, res) => {
      console.error('[PROXY ERROR]', err.message);
      console.error('[PROXY ERROR] Request was:', req.method, req.url);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Proxy error', message: err.message });
      }
    },
  });
  
  // Use a function matcher to ensure we catch all /api requests
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[PROXY MATCH] Intercepting: ${req.method} ${req.path}`);
      return apiProxy(req, res, next);
    }
    next();
  });
  
  // Proxy admin interface
  app.use(
    '/admin',
    createProxyMiddleware({
      target: target,
      changeOrigin: true,
    })
  );
  
  // Proxy media files (but NOT /static - webpack dev server needs that)
  app.use(
    '/media',
    createProxyMiddleware({
      target: target,
      changeOrigin: true,
    })
  );
};

