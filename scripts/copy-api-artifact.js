const path = require('path');
const fs = require('fs');

const rootDir = process.cwd();

// Lista de candidatos de onde o build pode ter colocado o handler da API.
// O PRIMEIRO caminho existente será usado.
// O importante é que isso seja o build do "api/index.ts", NÃO o build do "src/index.ts".
const sourceFile = path.join(rootDir, 'dist', 'api', 'index.js');

const destinationDir = path.join(rootDir, 'api');
const destinationFile = path.join(destinationDir, 'index.js');

if (!fs.existsSync(sourceFile)) {
  console.error('ERROR: Could not find built serverless handler. Expected dist/api/index.js');
  process.exit(1);
}

fs.mkdirSync(destinationDir, { recursive: true });
fs.copyFileSync(sourceFile, destinationFile);

console.log(`Copied API handler to ${destinationFile}`);
