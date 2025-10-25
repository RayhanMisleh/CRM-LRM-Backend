let server;
try {
  const compiled = require('./dist/index');
  server = compiled.default ?? compiled;
} catch (error) {
  throw new Error(
    'Unable to find compiled server. Please run "npm run build" before requiring server.js.'
  );
}

module.exports = server;
