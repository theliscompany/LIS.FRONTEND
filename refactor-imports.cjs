// refactor-imports.js
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

let changes = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
      refactorFile(fullPath);
    }
  }
}

function refactorFile(filePath) {
  const originalContent = fs.readFileSync(filePath, 'utf-8');
  let content = originalContent;
  const lines = content.split('\n');
  const newLines = [];

  const relativeToSrc = path.relative(baseDir, filePath);
  let hasChanged = false;

  for (let line of lines) {
    const match = line.match(/from ['"](\.\.\/.*)['"]/);
    if (match) {
      const importPath = match[1];
      const fullImportPath = path.resolve(path.dirname(filePath), importPath);
      const relPath = path.relative(baseDir, fullImportPath).replace(/\\/g, '/');

      for (const { alias, pathPart } of aliasMap) {
        if (relPath.startsWith(pathPart)) {
          const aliasImport = `${alias}/${relPath.slice(pathPart.length + 1)}`;
          const updatedLine = line.replace(importPath, aliasImport);
          newLines.push(updatedLine);
          hasChanged = true;
          changes.push(`✔️ ${relativeToSrc} : ${importPath} ➜ ${aliasImport}`);
          break;
        }
      }

      if (!hasChanged) {
        newLines.push(line);
      }
    } else {
      newLines.push(line);
    }
  }

  if (hasChanged) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf-8');
  }
}

// 🔍 Lancer l'analyse
walk(baseDir);

// 📄 Écrire le rapport
const reportPath = path.resolve(__dirname, 'refactor-report.txt');
fs.writeFileSync(reportPath, changes.join('\n') || '✅ Aucun import modifié.');
console.log(`✅ Refactoring terminé. Rapport ici : ${reportPath}`);
