const fs = require('fs');
const path = require('path');

const reportPath = path.resolve(__dirname, 'import-migration-report.txt');
const outputPath = path.resolve(__dirname, 'files-with-changes.txt');

if (!fs.existsSync(reportPath)) {
  console.error('❌ Report not found:', reportPath);
  process.exit(1);
}

const lines = fs.readFileSync(reportPath, 'utf-8').split('\n');

let currentFile = null;
const output = [];
let lastImport = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  // Detect file line
  if (line.startsWith('📄 File:')) {
    currentFile = line.replace('📄 File:', '').trim().replace(/\\/g, '/');
    continue;
  }

  // Detect import line
  if (line.startsWith('→ import')) {
    const match = line.match(/from ['"](.+?)['"]/);
    if (match) {
      lastImport = match[1];
    }
    continue;
  }

  // Detect suggestion line
  if (line.startsWith('⚠ Suggested:')) {
    const match = line.match(/"(.+?)"/);
    if (match && lastImport && currentFile) {
      const suggested = match[1];
      output.push(`🔁 ${lastImport} ➜ ${suggested}\n📄 ${currentFile}`);
      lastImport = null;
    }
  }
}

// Save results
if (output.length === 0) {
  console.warn('⚠ Aucun changement détecté. Vérifie le contenu du rapport.');
} else {
  fs.writeFileSync(outputPath, output.join('\n\n'), 'utf-8');
  console.log(`✅ Liste enregistrée dans : ${outputPath}`);
}
