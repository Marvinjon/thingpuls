const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Determine the target based on whether we're in Docker or not
  const target = process.env.PROXY_TARGET || 'http://backend:8000';
  
  console.log('Setting up proxy to:', target);
  
  // Proxy API requests
  app.use(
    '/api',
    createProxyMiddleware({
      target: target,
      changeOrigin: true,
      // Don't rewrite the path - it already has /api
    })
  );
  
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

