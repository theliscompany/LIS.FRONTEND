# Script PowerShell de nettoyage des fichiers non utilisés
# Usage: .\scripts\cleanup-unused-files.ps1 [-DryRun]

param(
    [switch]$DryRun
)

# Configuration
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$DryRunMode = $DryRun

# Fichiers à supprimer (identifiés par unimported)
$FilesToDelete = @(
    # Composants de debug et test
    "src\features\request\components\AdvancedSyncStatus.tsx",
    "src\features\request\components\ApiCompatibilityDashboard.tsx",
    "src\features\request\components\DraftQuoteApiCompatibilityTest.tsx",
    "src\features\request\components\DraftStateDebugger.tsx",
    "src\features\request\components\DraftSyncStatus.tsx",
    "src\features\request\components\DraftWizardDemo.tsx",
    "src\features\request\components\SeafreightCalculationDebugger.tsx",
    "src\features\request\components\TotalsDebugger.tsx",
    "src\features\request\components\WizardSyncStatus.tsx",
    "src\features\request\components\WizardSyncStatusV3.tsx",
    
    # Composants de graphiques
    "src\features\request\components\chart\OffersStatusPieChart.tsx",
    "src\features\request\components\chart\RequestsPerAssigneeChart.tsx",
    "src\features\request\components\chart\RequestsStatusPieChart.tsx",
    
    # Composants de gestion d'options obsolètes
    "src\features\request\components\DraftOptionsManager.tsx",
    "src\features\request\components\OptionEditWithRecap.tsx",
    "src\features\request\components\OptionManagementPanel.tsx",
    "src\features\request\components\OptionRecapDemo.tsx",
    "src\features\request\components\OptionRecapView.tsx",
    "src\features\request\components\QuoteOptionsManager.tsx",
    "src\features\request\components\RealDraftOptionsManager.tsx",
    "src\features\request\components\RealDraftOptionsManagerFixed_clean.tsx",
    "src\features\request\components\RealDraftOptionsManagerFixed.tsx",
    "src\features\request\components\Step7OptionsManager.tsx",
    
    # Composants utilitaires obsolètes
    "src\features\request\components\CompareOptions.tsx",
    "src\features\request\components\ContainerElement.tsx",
    "src\features\request\components\ContainerPrice.tsx",
    "src\features\request\components\HaulageApiIntegration.tsx",
    "src\features\request\components\LocalDraftsManager.tsx",
    "src\features\request\components\ManualSaveButton.tsx",
    "src\features\request\components\OfferGenerationStep.tsx",
    "src\features\request\components\SaveStatusIndicator.tsx",
    "src\features\request\components\SaveStrategyInfo.tsx",
    "src\features\request\components\WizardHeader.tsx",
    
    # Hooks obsolètes
    "src\features\request\hooks\useDebugLogger.ts",
    "src\features\request\hooks\useOptionManagement.ts",
    "src\features\request\hooks\useRealDraftOptionsManagerFixed.ts",
    "src\features\request\hooks\useRealDraftOptionsManagerMigrated.ts",
    "src\features\request\hooks\useRealDraftOptionsManagerMigratedFixed.ts",
    "src\features\request\hooks\useRealDraftOptionsManagerSimple.ts",
    "src\features\request\hooks\useTotalsCalculator.ts",
    "src\features\request\hooks\useWizardOptionsManagerV3.ts",
    "src\features\request\hooks\useWizardStateManagerV3.ts",
    
    # Pages obsolètes
    "src\features\request\pages\ApiCompatibilityTestPage.tsx",
    "src\features\request\pages\RequestWizardApiCompatible.tsx",
    "src\features\request\pages\RequestWizardTest.tsx",
    "src\features\request\pages\RequestWizardV3.tsx",
    
    # Services obsolètes
    "src\features\request\services\DraftPersistenceService.ts",
    "src\features\request\services\DraftQuoteApiMapper.ts",
    "src\features\request\services\LocalStorageService.ts",
    "src\features\request\services\QuoteExporter.ts",
    "src\features\request\services\QuoteJsonGenerator.ts",
    "src\features\request\services\QuoteValidator.ts",
    
    # Types obsolètes
    "src\features\request\types\EnrichedOption.ts",
    
    # Utils obsolètes
    "src\features\request\utils\calculationUtils.ts",
    "src\features\request\utils\draftTransformers.ts",
    "src\features\request\utils\notificationUtils.ts",
    "src\features\request\utils\testRequestIdFlow.ts",
    
    # Wizard obsolètes
    "src\features\request\wizard\components\CurrentOptionTotals.tsx",
    "src\features\request\wizard\components\ExistingOptionsDisplay.tsx",
    "src\features\request\wizard\components\OptionsComparison_new.tsx",
    "src\features\request\wizard\components\TotalsDisplay.tsx",
    "src\features\request\wizard\hooks\useDraftQuoteData.ts",
    "src\features\request\wizard\hooks\useFinalizeDraftQuote.ts",
    "src\features\request\wizard\hooks\useSelectQuoteOption.ts",
    "src\features\request\wizard\pages\OptionsStepNew.tsx",
    "src\features\request\wizard\pages\OptionsStepOld.tsx",
    "src\features\request\wizard\pages\ReviewStepNew.tsx",
    "src\features\request\wizard\pages\ReviewStepOld.tsx",
    "src\features\request\wizard\build-check.js",
    "src\features\request\wizard\count-quotes.js",
    "src\features\request\wizard\test-exact-payload.js",
    "src\features\request\wizard\test-simple.js",
    "src\features\request\wizard\vitest.config.ts"
)

# Dossiers à vérifier (s'ils sont vides après suppression des fichiers)
$DirsToCheck = @(
    "src\features\request\components\chart",
    "src\features\request\components\info"
)

# Fonctions utilitaires
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    
    $colors = @{
        "Info" = "Cyan"
        "Success" = "Green"
        "Warning" = "Yellow"
        "Error" = "Red"
        "Default" = "White"
    }
    
    $actualColor = $colors[$Color]
    if (-not $actualColor) { $actualColor = "White" }
    
    Write-Host $Message -ForegroundColor $actualColor
}

function Remove-FileIfExists {
    param(
        [string]$FilePath
    )
    
    $FullPath = Join-Path $ProjectRoot $FilePath
    
    if (-not (Test-Path $FullPath)) {
        Write-ColorOutput "⚠️ Fichier non trouvé: $FilePath" "Warning"
        return $false
    }
    
    try {
        if ($DryRunMode) {
            Write-ColorOutput "[DRY RUN] Suppression: $FilePath" "Info"
        } else {
            Remove-Item $FullPath -Force
            Write-ColorOutput "✅ Supprimé: $FilePath" "Success"
        }
        return $true
    } catch {
        Write-ColorOutput "❌ Erreur lors de la suppression de $FilePath`: $($_.Exception.Message)" "Error"
        return $false
    }
}

function Remove-EmptyDirectories {
    foreach ($DirPath in $DirsToCheck) {
        $FullPath = Join-Path $ProjectRoot $DirPath
        
        if (Test-Path $FullPath) {
            try {
                $Files = Get-ChildItem $FullPath -File
                if ($Files.Count -eq 0) {
                    if ($DryRunMode) {
                        Write-ColorOutput "[DRY RUN] Suppression du dossier vide: $DirPath" "Info"
                    } else {
                        Remove-Item $FullPath -Force
                        Write-ColorOutput "✅ Dossier vide supprimé: $DirPath" "Success"
                    }
                } else {
                    Write-ColorOutput "ℹ️ Dossier non vide, conservé: $DirPath ($($Files.Count) fichiers)" "Info"
                }
            } catch {
                Write-ColorOutput "❌ Erreur lors de la vérification du dossier $DirPath`: $($_.Exception.Message)" "Error"
            }
        }
    }
}

function New-CleanupReport {
    param(
        [array]$DeletedFiles,
        [int]$TotalFiles
    )
    
    $Report = @{
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        dryRun = $DryRunMode
        totalFiles = $TotalFiles
        deletedFiles = $DeletedFiles.Count
        successRate = [math]::Round(($DeletedFiles.Count / $TotalFiles * 100), 2).ToString() + "%"
        files = $DeletedFiles
    }
    
    $ReportPath = Join-Path $ProjectRoot "cleanup-report.json"
    
    if (-not $DryRunMode) {
        $Report | ConvertTo-Json -Depth 3 | Out-File -FilePath $ReportPath -Encoding UTF8
        Write-ColorOutput "✅ Rapport de nettoyage sauvegardé: $ReportPath" "Success"
    }
    
    return $Report
}

# Fonction principale
function Start-Cleanup {
    Write-ColorOutput "🧹 Nettoyage des fichiers non utilisés dans src/features/request/" "Info"
    Write-ColorOutput "Mode: $(if ($DryRunMode) { 'DRY RUN (simulation)' } else { 'EXÉCUTION RÉELLE' })" "Warning"
    Write-Host ""
    
    $DeletedCount = 0
    $ErrorCount = 0
    $DeletedFiles = @()
    
    # Supprimer les fichiers
    foreach ($FilePath in $FilesToDelete) {
        if (Remove-FileIfExists -FilePath $FilePath) {
            $DeletedCount++
            $DeletedFiles += $FilePath
        } else {
            $ErrorCount++
        }
    }
    
    Write-Host ""
    
    # Supprimer les dossiers vides
    Write-ColorOutput "🗂️ Vérification des dossiers vides..." "Info"
    Remove-EmptyDirectories
    
    Write-Host ""
    
    # Générer le rapport
    $Report = New-CleanupReport -DeletedFiles $DeletedFiles -TotalFiles $FilesToDelete.Count
    
    # Résumé final
    Write-ColorOutput "📊 Résumé du nettoyage:" "Info"
    Write-ColorOutput "   • Fichiers traités: $($FilesToDelete.Count)" "Info"
    Write-ColorOutput "   • Fichiers supprimés: $DeletedCount" "Success"
    Write-ColorOutput "   • Erreurs: $ErrorCount" $(if ($ErrorCount -gt 0) { "Error" } else { "Info" })
    Write-ColorOutput "   • Taux de succès: $($Report.successRate)" "Info"
    
    if ($DryRunMode) {
        Write-Host ""
        Write-ColorOutput "💡 Pour exécuter réellement le nettoyage, relancez sans -DryRun" "Warning"
    } else {
        Write-Host ""
        Write-ColorOutput "🔍 Vérifiez la compilation avec: npm run build" "Info"
        Write-ColorOutput "🧪 Exécutez les tests avec: npm test" "Info"
    }
    
    return $Report
}

# Exécution
try {
    Set-Location $ProjectRoot
    Start-Cleanup
} catch {
    Write-ColorOutput "❌ Erreur fatale: $($_.Exception.Message)" "Error"
    exit 1
}
