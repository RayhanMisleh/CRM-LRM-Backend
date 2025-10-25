let app;
try {
  const compiled = require('./dist/app');
  app = compiled.default ?? compiled;
} catch (error) {
  throw new Error(
    'Unable to find compiled app. Please run "npm run build" before requiring app.js.'
  );
}

module.exports = app;
