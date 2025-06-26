// analyze-imports.js
const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, 'src');
const aliasMap = [
  { alias: '@components', pathPart: 'components' },
  { alias: '@features', pathPart: 'features' },
  { alias: '@api', pathPart: 'api' },
  { alias: '@pages', pathPart: 'pages' },
  { alias: '@utils', pathPart: 'utils' },
];

let report = '';

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
      analyzeFile(fullPath);
    }
  }
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const relativePath = path.relative(baseDir, filePath);

  let found = false;

  for (const line of lines) {
    const importMatch = line.match(/from ['"](\.\.\/.*)['"]/);
    if (importMatch) {
      const importPath = importMatch[1];
      const fullImportPath = path.resolve(path.dirname(filePath), importPath);
      const relativeToSrc = path.relative(baseDir, fullImportPath);

      for (const { alias, pathPart } of aliasMap) {
        if (relativeToSrc.startsWith(pathPart)) {
          const suggested = importPath.replace(/\.\.\/.*/, `${alias}/${relativeToSrc.slice(pathPart.length + 1)}`);
          if (!found) {
            report += `\n📄 File: ${relativePath}\n`;
            found = true;
          }
          report += `  → ${line.trim()}\n    ⚠ Suggested: import from "${suggested}"\n`;
          break;
        }
      }
    }
  }
}

walk(baseDir);

// Write report
const outputPath = path.resolve(__dirname, 'import-migration-report.txt');
fs.writeFileSync(outputPath, report || '✅ No relative imports found.');
console.log(`✅ Migration report generated: ${outputPath}`);
