const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Determine the target based on whether we're in Docker or not
  const target = process.env.PROXY_TARGET || 'http://backend:8000';
  
  console.log('Setting up proxy to:', target);
  
  // Proxy API requests
  // When specifying a context (e.g., '/api'), the middleware strips it by default
  // We need to add it back using pathRewrite
  app.use(
    '/api',
    createProxyMiddleware({
      target: target,
      changeOrigin: true,
      pathRewrite: (path) => {
        // The path comes without /api, we need to add it back
        return '/api' + path;
      },
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

