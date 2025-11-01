let app;
try {
  const compiled = require('./dist/app');
  app = compiled.default ?? compiled;
  if (typeof app !== 'function') {
    throw new Error('Compiled app does not export an Express application');
  }
} catch (error) {
  throw new Error(
    'Unable to find compiled app. Please run "npm run build" before requiring server.js.'
  );
}

module.exports = app;
