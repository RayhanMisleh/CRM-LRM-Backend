let routes;
try {
  const compiled = require('./dist/routes');
  routes = compiled.default ?? compiled;
} catch (error) {
  throw new Error(
    'Unable to find compiled routes. Please run "npm run build" before requiring routes.js.'
  );
}

module.exports = routes;
