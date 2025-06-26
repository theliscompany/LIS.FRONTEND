// migrate-pricing.js
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, 'src');
const report = [];
const domain = 'pricing';

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

  // Supprimer dossier source s'il est vide
  if (fs.readdirSync(from).length === 0) {
    fs.rmdirSync(from);
  }
}

moves.forEach(({ from, to }) => moveFiles(from, to));

// Écrire le rapport
const reportPath = path.resolve(__dirname, 'migration-pricing-report.txt');
fs.writeFileSync(reportPath, report.join('\n') || 'Aucun fichier déplacé.');
console.log(`✅ Migration "pricing" terminée. Rapport : ${reportPath}`);
