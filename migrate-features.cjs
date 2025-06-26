// migrate-features.js
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, 'src');
const domains = ['pricing', 'offer', 'request', 'shipment', 'masterdata', 'crm', 'template', 'document', 'transport', 'sessionstorage'];
const report = [];

function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function moveFiles(from, to) {
  if (!fs.existsSync(from)) {
    console.warn(`⚠️ Source not found: ${from}`);
    return;
  }

  ensureDirExists(to);

  const entries = fs.readdirSync(from, { withFileTypes: true });
  for (const entry of entries) {
    const fromPath = path.join(from, entry.name);
    const toPath = path.join(to, entry.name);

    if (entry.isFile()) {
      fs.renameSync(fromPath, toPath);
      report.push(`✔️ ${path.relative(projectRoot, fromPath)} → ${path.relative(projectRoot, toPath)}`);
    } else if (entry.isDirectory()) {
      ensureDirExists(toPath);
      moveFiles(fromPath, toPath);
    }
  }

  // Supprime le dossier source s'il est vide
  if (fs.readdirSync(from).length === 0) {
    fs.rmdirSync(from);
  }
}

for (const domain of domains) {
  const moves = [
    {
      from: path.join(projectRoot, 'components', domain),
      to: path.join(projectRoot, 'features', domain, 'components'),
    },
    {
      from: path.join(projectRoot, 'pages', domain),
      to: path.join(projectRoot, 'features', domain, 'pages'),
    },
    {
      from: path.join(projectRoot, 'api', 'client', domain),
      to: path.join(projectRoot, 'features', domain, 'api'),
    },
  ];

  report.push(`\n📁 Domaine : ${domain}`);
  moves.forEach(({ from, to }) => moveFiles(from, to));
}

// Génère le rapport
const reportPath = path.resolve(__dirname, 'migration-report.txt');
fs.writeFileSync(reportPath, report.join('\n') || '✅ Aucun fichier déplacé.');
console.log(`✅ Migration terminée. Rapport : ${reportPath}`);
