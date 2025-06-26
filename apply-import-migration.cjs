const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, 'src');
const reportPath = path.resolve(__dirname, 'import-migration-report.txt');
const logPath = path.resolve(__dirname, 'import-migration-apply-log.txt');

if (!fs.existsSync(reportPath)) {
  console.error('❌ Migration report not found:', reportPath);
  process.exit(1);
}

const lines = fs.readFileSync(reportPath, 'utf-8').split('\n');

let currentFile = null;
let oldImport = null;
let changes = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  if (line.startsWith('📄 File:')) {
    currentFile = line.replace('📄 File:', '').trim().replace(/\\/g, '/');
  }

  if (line.startsWith('→ import')) {
    const match = line.match(/from ['"](.+?)['"]/);
    if (match) oldImport = match[1];
  }

  if (line.startsWith('⚠ Suggested:')) {
    const match = line.match(/"(.+?)"/);
    if (match && currentFile && oldImport) {
      const newImport = match[1];
      const absolutePath = path.resolve(baseDir, currentFile);
      changes.push({ file: absolutePath, oldImport, newImport });
      oldImport = null;
    }
  }
}

// Apply changes
let log = [];
for (const { file, oldImport, newImport } of changes) {
  if (!fs.existsSync(file)) {
    log.push(`❌ File not found: ${file}`);
    continue;
  }

  const content = fs.readFileSync(file, 'utf-8');
  const regex = new RegExp(`from ['"]${oldImport}['"]`, 'g');

  if (!regex.test(content)) {
    log.push(`⚠️ No match in ${path.relative(baseDir, file).replace(/\\/g, '/')}`);
    continue;
  }

  const updated = content.replace(regex, `from '${newImport}'`);
  fs.writeFileSync(file, updated, 'utf-8');
  log.push(`✅ ${path.relative(baseDir, file).replace(/\\/g, '/')}: ${oldImport} ➜ ${newImport}`);
}

fs.writeFileSync(logPath, log.join('\n'), 'utf-8');
console.log(`✅ Imports updated. Log saved to: ${logPath}`);
