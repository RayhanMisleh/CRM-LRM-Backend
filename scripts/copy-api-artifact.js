const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const sourceFile = path.join(rootDir, 'dist', 'api', 'index.js');
const destinationDir = path.join(rootDir, 'api');
const destinationFile = path.join(destinationDir, 'index.js');

if (!fs.existsSync(sourceFile)) {
  console.error(`Build artifact not found: ${sourceFile}`);
  process.exit(1);
}

fs.mkdirSync(destinationDir, { recursive: true });
fs.copyFileSync(sourceFile, destinationFile);

console.log(`Copied API handler to ${destinationFile}`);
