const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
// Try both legacy location (dist/api/index.js) and the modern ts->dist mapping (dist/src/api/index.js)
const possibleSources = [
  path.join(rootDir, 'dist', 'api', 'index.js'),
  path.join(rootDir, 'dist', 'src', 'api', 'index.js'),
];

let sourceFile = null;
for (const p of possibleSources) {
  if (fs.existsSync(p)) {
    sourceFile = p;
    break;
  }
}
const destinationDir = path.join(rootDir, 'api');
const destinationFile = path.join(destinationDir, 'index.js');

if (!sourceFile) {
  console.error(`Build artifact not found. Checked locations:\n  ${possibleSources.join('\n  ')}`);
  process.exit(1);
}

fs.mkdirSync(destinationDir, { recursive: true });
fs.copyFileSync(sourceFile, destinationFile);

console.log(`Copied API handler to ${destinationFile}`);
