#!/usr/bin/env node

/**
 * Script de nettoyage des fichiers non utilisés dans src/features/request/
 * 
 * Ce script supprime automatiquement les fichiers identifiés comme non utilisés
 * par l'outil unimported.
 * 
 * Usage: node scripts/cleanup-unused-files.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const PROJECT_ROOT = path.join(__dirname, '..');

// Fichiers à supprimer (identifiés par unimported)
const FILES_TO_DELETE = [
  // Composants de debug et test
  'src/features/request/components/AdvancedSyncStatus.tsx',
  'src/features/request/components/ApiCompatibilityDashboard.tsx',
  'src/features/request/components/DraftQuoteApiCompatibilityTest.tsx',
  'src/features/request/components/DraftStateDebugger.tsx',
  'src/features/request/components/DraftSyncStatus.tsx',
  'src/features/request/components/DraftWizardDemo.tsx',
  'src/features/request/components/SeafreightCalculationDebugger.tsx',
  'src/features/request/components/TotalsDebugger.tsx',
  'src/features/request/components/WizardSyncStatus.tsx',
  'src/features/request/components/WizardSyncStatusV3.tsx',
  
  // Composants de graphiques
  'src/features/request/components/chart/OffersStatusPieChart.tsx',
  'src/features/request/components/chart/RequestsPerAssigneeChart.tsx',
  'src/features/request/components/chart/RequestsStatusPieChart.tsx',
  
  // Composants de gestion d'options obsolètes
  'src/features/request/components/DraftOptionsManager.tsx',
  'src/features/request/components/OptionEditWithRecap.tsx',
  'src/features/request/components/OptionManagementPanel.tsx',
  'src/features/request/components/OptionRecapDemo.tsx',
  'src/features/request/components/OptionRecapView.tsx',
  'src/features/request/components/QuoteOptionsManager.tsx',
  'src/features/request/components/RealDraftOptionsManager.tsx',
  'src/features/request/components/RealDraftOptionsManagerFixed_clean.tsx',
  'src/features/request/components/RealDraftOptionsManagerFixed.tsx',
  'src/features/request/components/Step7OptionsManager.tsx',
  
  // Composants utilitaires obsolètes
  'src/features/request/components/CompareOptions.tsx',
  'src/features/request/components/ContainerElement.tsx',
  'src/features/request/components/ContainerPrice.tsx',
  'src/features/request/components/HaulageApiIntegration.tsx',
  'src/features/request/components/LocalDraftsManager.tsx',
  'src/features/request/components/ManualSaveButton.tsx',
  'src/features/request/components/OfferGenerationStep.tsx',
  'src/features/request/components/SaveStatusIndicator.tsx',
  'src/features/request/components/SaveStrategyInfo.tsx',
  'src/features/request/components/WizardHeader.tsx',
  
  // Hooks obsolètes
  'src/features/request/hooks/useDebugLogger.ts',
  'src/features/request/hooks/useOptionManagement.ts',
  'src/features/request/hooks/useRealDraftOptionsManagerFixed.ts',
  'src/features/request/hooks/useRealDraftOptionsManagerMigrated.ts',
  'src/features/request/hooks/useRealDraftOptionsManagerMigratedFixed.ts',
  'src/features/request/hooks/useRealDraftOptionsManagerSimple.ts',
  'src/features/request/hooks/useTotalsCalculator.ts',
  'src/features/request/hooks/useWizardOptionsManagerV3.ts',
  'src/features/request/hooks/useWizardStateManagerV3.ts',
  
  // Pages obsolètes
  'src/features/request/pages/ApiCompatibilityTestPage.tsx',
  'src/features/request/pages/RequestWizardApiCompatible.tsx',
  'src/features/request/pages/RequestWizardTest.tsx',
  'src/features/request/pages/RequestWizardV3.tsx',
  
  // Services obsolètes
  'src/features/request/services/DraftPersistenceService.ts',
  'src/features/request/services/DraftQuoteApiMapper.ts',
  'src/features/request/services/LocalStorageService.ts',
  'src/features/request/services/QuoteExporter.ts',
  'src/features/request/services/QuoteJsonGenerator.ts',
  'src/features/request/services/QuoteValidator.ts',
  
  // Types obsolètes
  'src/features/request/types/EnrichedOption.ts',
  
  // Utils obsolètes
  'src/features/request/utils/calculationUtils.ts',
  'src/features/request/utils/draftTransformers.ts',
  'src/features/request/utils/notificationUtils.ts',
  'src/features/request/utils/testRequestIdFlow.ts',
  
  // Wizard obsolètes
  'src/features/request/wizard/components/CurrentOptionTotals.tsx',
  'src/features/request/wizard/components/ExistingOptionsDisplay.tsx',
  'src/features/request/wizard/components/OptionsComparison_new.tsx',
  'src/features/request/wizard/components/TotalsDisplay.tsx',
  'src/features/request/wizard/hooks/useDraftQuoteData.ts',
  'src/features/request/wizard/hooks/useFinalizeDraftQuote.ts',
  'src/features/request/wizard/hooks/useSelectQuoteOption.ts',
  'src/features/request/wizard/pages/OptionsStepNew.tsx',
  'src/features/request/wizard/pages/OptionsStepOld.tsx',
  'src/features/request/wizard/pages/ReviewStepNew.tsx',
  'src/features/request/wizard/pages/ReviewStepOld.tsx',
  'src/features/request/wizard/build-check.js',
  'src/features/request/wizard/count-quotes.js',
  'src/features/request/wizard/test-exact-payload.js',
  'src/features/request/wizard/test-simple.js',
  'src/features/request/wizard/vitest.config.ts',
];

// Dossiers à supprimer (s'ils sont vides après suppression des fichiers)
const DIRS_TO_CHECK = [
  'src/features/request/components/chart',
  'src/features/request/components/info',
];

// Fonctions utilitaires
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m',   // Red
    reset: '\x1b[0m'     // Reset
  };
  
  const icon = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };
  
  console.log(`${colors[type]}${icon[type]} ${message}${colors.reset}`);
}

function fileExists(filePath) {
  return fs.existsSync(path.join(PROJECT_ROOT, filePath));
}

function deleteFile(filePath) {
  const fullPath = path.join(PROJECT_ROOT, filePath);
  
  if (!fileExists(filePath)) {
    log(`Fichier non trouvé: ${filePath}`, 'warning');
    return false;
  }
  
  try {
    if (DRY_RUN) {
      log(`[DRY RUN] Suppression: ${filePath}`, 'info');
    } else {
      fs.unlinkSync(fullPath);
      log(`Supprimé: ${filePath}`, 'success');
    }
    return true;
  } catch (error) {
    log(`Erreur lors de la suppression de ${filePath}: ${error.message}`, 'error');
    return false;
  }
}

function deleteEmptyDirs() {
  DIRS_TO_CHECK.forEach(dirPath => {
    const fullPath = path.join(PROJECT_ROOT, dirPath);
    
    if (fs.existsSync(fullPath)) {
      try {
        const files = fs.readdirSync(fullPath);
        if (files.length === 0) {
          if (DRY_RUN) {
            log(`[DRY RUN] Suppression du dossier vide: ${dirPath}`, 'info');
          } else {
            fs.rmdirSync(fullPath);
            log(`Dossier vide supprimé: ${dirPath}`, 'success');
          }
        } else {
          log(`Dossier non vide, conservé: ${dirPath} (${files.length} fichiers)`, 'info');
        }
      } catch (error) {
        log(`Erreur lors de la vérification du dossier ${dirPath}: ${error.message}`, 'error');
      }
    }
  });
}

function generateReport(deletedFiles, totalFiles) {
  const report = {
    timestamp: new Date().toISOString(),
    dryRun: DRY_RUN,
    totalFiles: totalFiles,
    deletedFiles: deletedFiles.length,
    successRate: (deletedFiles.length / totalFiles * 100).toFixed(2) + '%',
    files: deletedFiles
  };
  
  const reportPath = path.join(PROJECT_ROOT, 'cleanup-report.json');
  
  if (!DRY_RUN) {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log(`Rapport de nettoyage sauvegardé: ${reportPath}`, 'success');
  }
  
  return report;
}

// Fonction principale
function main() {
  log('🧹 Nettoyage des fichiers non utilisés dans src/features/request/', 'info');
  log(`Mode: ${DRY_RUN ? 'DRY RUN (simulation)' : 'EXÉCUTION RÉELLE'}`, 'warning');
  log('', 'info');
  
  let deletedCount = 0;
  let errorCount = 0;
  const deletedFiles = [];
  
  // Supprimer les fichiers
  FILES_TO_DELETE.forEach(filePath => {
    if (deleteFile(filePath)) {
      deletedCount++;
      deletedFiles.push(filePath);
    } else {
      errorCount++;
    }
  });
  
  log('', 'info');
  
  // Supprimer les dossiers vides
  log('🗂️ Vérification des dossiers vides...', 'info');
  deleteEmptyDirs();
  
  log('', 'info');
  
  // Générer le rapport
  const report = generateReport(deletedFiles, FILES_TO_DELETE.length);
  
  // Résumé final
  log('📊 Résumé du nettoyage:', 'info');
  log(`   • Fichiers traités: ${FILES_TO_DELETE.length}`, 'info');
  log(`   • Fichiers supprimés: ${deletedCount}`, 'success');
  log(`   • Erreurs: ${errorCount}`, errorCount > 0 ? 'error' : 'info');
  log(`   • Taux de succès: ${report.successRate}`, 'info');
  
  if (DRY_RUN) {
    log('', 'info');
    log('💡 Pour exécuter réellement le nettoyage, relancez sans --dry-run', 'warning');
  } else {
    log('', 'info');
    log('🔍 Vérifiez la compilation avec: npm run build', 'info');
    log('🧪 Exécutez les tests avec: npm test', 'info');
  }
  
  return report;
}

// Exécution
if (require.main === module) {
  try {
    main();
  } catch (error) {
    log(`Erreur fatale: ${error.message}`, 'error');
    process.exit(1);
  }
}

module.exports = { main, FILES_TO_DELETE, DIRS_TO_CHECK };
