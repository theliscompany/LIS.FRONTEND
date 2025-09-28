# 🗑️ Fichiers Non Utilisés - Feature Request

## 📊 Résumé de l'Analyse

L'outil `unimported` a identifié **132 fichiers non utilisés** dans l'ensemble du projet, dont **plus de 50 fichiers** dans la feature `request`. Voici l'analyse détaillée des fichiers qui peuvent être supprimés en toute sécurité.

---

## 🎯 **Fichiers Non Utilisés dans `src/features/request/`**

### 📁 **Components (25 fichiers non utilisés)**

#### **🔧 Composants de Debug et Test**
| Fichier | Statut | Raison |
|---|---|---|
| `AdvancedSyncStatus.tsx` | ❌ Non utilisé | Composant de debug obsolète |
| `ApiCompatibilityDashboard.tsx` | ❌ Non utilisé | Dashboard de test de compatibilité |
| `DraftQuoteApiCompatibilityTest.tsx` | ❌ Non utilisé | Test de compatibilité API |
| `DraftStateDebugger.tsx` | ❌ Non utilisé | Outil de debug obsolète |
| `DraftSyncStatus.tsx` | ❌ Non utilisé | Composant de sync obsolète |
| `DraftWizardDemo.tsx` | ❌ Non utilisé | Démo du wizard obsolète |
| `SeafreightCalculationDebugger.tsx` | ❌ Non utilisé | Debug de calcul maritime |
| `TotalsDebugger.tsx` | ❌ Non utilisé | Debug des totaux |
| `WizardSyncStatus.tsx` | ❌ Non utilisé | Status sync wizard obsolète |
| `WizardSyncStatusV3.tsx` | ❌ Non utilisé | Version 3 obsolète |

#### **📊 Composants de Graphiques**
| Fichier | Statut | Raison |
|---|---|---|
| `chart/OffersStatusPieChart.tsx` | ❌ Non utilisé | Graphique des statuts d'offres |
| `chart/RequestsPerAssigneeChart.tsx` | ❌ Non utilisé | Graphique par assigné |
| `chart/RequestsStatusPieChart.tsx` | ❌ Non utilisé | Graphique des statuts de demandes |

#### **🧩 Composants de Gestion d'Options (Versions Obsolètes)**
| Fichier | Statut | Raison |
|---|---|---|
| `DraftOptionsManager.tsx` | ❌ Non utilisé | Version obsolète du gestionnaire |
| `OptionEditWithRecap.tsx` | ❌ Non utilisé | Composant d'édition obsolète |
| `OptionManagementPanel.tsx` | ❌ Non utilisé | Panneau de gestion obsolète |
| `OptionRecapDemo.tsx` | ❌ Non utilisé | Démo de récap obsolète |
| `OptionRecapView.tsx` | ❌ Non utilisé | Vue récap obsolète |
| `QuoteOptionsManager.tsx` | ❌ Non utilisé | Gestionnaire de devis obsolète |
| `RealDraftOptionsManager.tsx` | ❌ Non utilisé | Version obsolète |
| `RealDraftOptionsManagerFixed_clean.tsx` | ❌ Non utilisé | Version clean obsolète |
| `RealDraftOptionsManagerFixed.tsx` | ❌ Non utilisé | Version fixe obsolète |
| `Step7OptionsManager.tsx` | ❌ Non utilisé | Gestionnaire étape 7 obsolète |

#### **🔧 Composants Utilitaires Obsolètes**
| Fichier | Statut | Raison |
|---|---|---|
| `CompareOptions.tsx` | ❌ Non utilisé | Comparaison d'options obsolète |
| `ContainerElement.tsx` | ❌ Non utilisé | Élément conteneur obsolète |
| `ContainerPrice.tsx` | ❌ Non utilisé | Prix conteneur obsolète |
| `HaulageApiIntegration.tsx` | ❌ Non utilisé | Intégration API obsolète |
| `LocalDraftsManager.tsx` | ❌ Non utilisé | Gestionnaire local obsolète |
| `ManualSaveButton.tsx` | ❌ Non utilisé | Bouton sauvegarde obsolète |
| `OfferGenerationStep.tsx` | ❌ Non utilisé | Étape génération obsolète |
| `SaveStatusIndicator.tsx` | ❌ Non utilisé | Indicateur sauvegarde obsolète |
| `SaveStrategyInfo.tsx` | ❌ Non utilisé | Info stratégie obsolète |
| `WizardHeader.tsx` | ❌ Non utilisé | En-tête wizard obsolète |

### 📁 **Hooks (8 fichiers non utilisés)**

| Fichier | Statut | Raison |
|---|---|---|
| `hooks/index.ts` | ❌ Non utilisé | Index des hooks non importé |
| `useDebugLogger.ts` | ❌ Non utilisé | Logger de debug obsolète |
| `useOptionManagement.ts` | ❌ Non utilisé | Gestion d'options obsolète |
| `useRealDraftOptionsManagerFixed.ts` | ❌ Non utilisé | Version fixe obsolète |
| `useRealDraftOptionsManagerMigrated.ts` | ❌ Non utilisé | Version migrée obsolète |
| `useRealDraftOptionsManagerMigratedFixed.ts` | ❌ Non utilisé | Version migrée fixe obsolète |
| `useRealDraftOptionsManagerSimple.ts` | ❌ Non utilisé | Version simple obsolète |
| `useTotalsCalculator.ts` | ❌ Non utilisé | Calculateur totaux obsolète |
| `useWizardOptionsManagerV3.ts` | ❌ Non utilisé | Gestionnaire wizard v3 obsolète |
| `useWizardStateManagerV3.ts` | ❌ Non utilisé | Gestionnaire état v3 obsolète |

### 📁 **Pages (4 fichiers non utilisés)**

| Fichier | Statut | Raison |
|---|---|---|
| `ApiCompatibilityTestPage.tsx` | ❌ Non utilisé | Page de test de compatibilité |
| `RequestWizardApiCompatible.tsx` | ❌ Non utilisé | Version compatible API obsolète |
| `RequestWizardTest.tsx` | ❌ Non utilisé | Version de test obsolète |
| `RequestWizardV3.tsx` | ❌ Non utilisé | Version 3 obsolète |

### 📁 **Services (6 fichiers non utilisés)**

| Fichier | Statut | Raison |
|---|---|---|
| `DraftPersistenceService.ts` | ❌ Non utilisé | Service de persistance obsolète |
| `DraftQuoteApiMapper.ts` | ❌ Non utilisé | Mappeur API obsolète |
| `LocalStorageService.ts` | ❌ Non utilisé | Service stockage local obsolète |
| `QuoteExporter.ts` | ❌ Non utilisé | Exporteur de devis obsolète |
| `QuoteJsonGenerator.ts` | ❌ Non utilisé | Générateur JSON obsolète |
| `QuoteValidator.ts` | ❌ Non utilisé | Validateur de devis obsolète |

### 📁 **Types (2 fichiers non utilisés)**

| Fichier | Statut | Raison |
|---|---|---|
| `types/EnrichedOption.ts` | ❌ Non utilisé | Type d'option enrichie obsolète |
| `types/index.ts` | ❌ Non utilisé | Index des types non importé |

### 📁 **Utils (5 fichiers non utilisés)**

| Fichier | Statut | Raison |
|---|---|---|
| `utils/calculationUtils.ts` | ❌ Non utilisé | Utilitaires de calcul obsolètes |
| `utils/draftTransformers.ts` | ❌ Non utilisé | Transformateurs obsolètes |
| `utils/index.ts` | ❌ Non utilisé | Index des utils non importé |
| `utils/notificationUtils.ts` | ❌ Non utilisé | Utilitaires notification obsolètes |
| `utils/testRequestIdFlow.ts` | ❌ Non utilisé | Test de flux obsolète |

### 📁 **Wizard (15 fichiers non utilisés)**

#### **🧩 Composants Wizard Obsolètes**
| Fichier | Statut | Raison |
|---|---|---|
| `components/CurrentOptionTotals.tsx` | ❌ Non utilisé | Totaux option courante obsolète |
| `components/ExistingOptionsDisplay.tsx` | ❌ Non utilisé | Affichage options existantes obsolète |
| `components/OptionsComparison_new.tsx` | ❌ Non utilisé | Comparaison nouvelle obsolète |
| `components/TotalsDisplay.tsx` | ❌ Non utilisé | Affichage totaux obsolète |

#### **🎣 Hooks Wizard Obsolètes**
| Fichier | Statut | Raison |
|---|---|---|
| `hooks/useDraftQuoteData.ts` | ❌ Non utilisé | Données brouillon obsolète |
| `hooks/useFinalizeDraftQuote.ts` | ❌ Non utilisé | Finalisation obsolète |
| `hooks/useSelectQuoteOption.ts` | ❌ Non utilisé | Sélection option obsolète |

#### **📄 Pages Wizard Obsolètes**
| Fichier | Statut | Raison |
|---|---|---|
| `pages/OptionsStepNew.tsx` | ❌ Non utilisé | Étape options nouvelle obsolète |
| `pages/OptionsStepOld.tsx` | ❌ Non utilisé | Étape options ancienne obsolète |
| `pages/ReviewStepNew.tsx` | ❌ Non utilisé | Étape révision nouvelle obsolète |
| `pages/ReviewStepOld.tsx` | ❌ Non utilisé | Étape révision ancienne obsolète |

#### **🔧 Fichiers de Configuration et Test**
| Fichier | Statut | Raison |
|---|---|---|
| `build-check.js` | ❌ Non utilisé | Script de build obsolète |
| `count-quotes.js` | ❌ Non utilisé | Script de comptage obsolète |
| `test-exact-payload.js` | ❌ Non utilisé | Test payload obsolète |
| `test-simple.js` | ❌ Non utilisé | Test simple obsolète |
| `vitest.config.ts` | ❌ Non utilisé | Config Vitest obsolète |
| `wizard/index.ts` | ❌ Non utilisé | Index wizard non importé |

---

## 🚨 **Fichiers avec Imports Non Résolus**

### **Imports Manquants**
| Fichier | Import Manquant | Impact |
|---|---|---|
| `StepDataAdapters.ts` | `../types/DraftQuote` | ❌ Erreur de compilation |
| `Step4HaulierSelection.tsx` | `../types/DraftQuote` | ❌ Erreur de compilation |
| `OptionsManager.tsx` | `../types/DraftQuote` | ❌ Erreur de compilation |
| `Step5SeafreightSelection.tsx` | `@features/request/types/DraftQuote` | ❌ Erreur de compilation |
| `OptionsManager.tsx` | `../hooks/useOptionsManager` | ❌ Erreur de compilation |
| `Step7Recap.tsx` | `../hooks/useOptionsManager` | ❌ Erreur de compilation |
| `RequestWizard.tsx` | `../components/SaveDraftTest` | ❌ Erreur de compilation |
| `SeafreightSelection.tsx` | `../../../utils/functions` | ❌ Erreur de compilation |
| `QuotePreviewDialog.tsx` | `../types` | ❌ Erreur de compilation |

---

## 🎯 **Plan de Nettoyage Recommandé**

### **Phase 1 : Suppression des Fichiers Obsolètes (Sécurisé)**

#### **🗑️ Composants de Debug et Test**
```bash
# Supprimer les composants de debug obsolètes
rm src/features/request/components/AdvancedSyncStatus.tsx
rm src/features/request/components/ApiCompatibilityDashboard.tsx
rm src/features/request/components/DraftQuoteApiCompatibilityTest.tsx
rm src/features/request/components/DraftStateDebugger.tsx
rm src/features/request/components/DraftSyncStatus.tsx
rm src/features/request/components/DraftWizardDemo.tsx
rm src/features/request/components/SeafreightCalculationDebugger.tsx
rm src/features/request/components/TotalsDebugger.tsx
rm src/features/request/components/WizardSyncStatus.tsx
rm src/features/request/components/WizardSyncStatusV3.tsx
```

#### **🗑️ Composants de Graphiques**
```bash
# Supprimer les composants de graphiques non utilisés
rm -rf src/features/request/components/chart/
```

#### **🗑️ Hooks Obsolètes**
```bash
# Supprimer les hooks obsolètes
rm src/features/request/hooks/useDebugLogger.ts
rm src/features/request/hooks/useOptionManagement.ts
rm src/features/request/hooks/useRealDraftOptionsManagerFixed.ts
rm src/features/request/hooks/useRealDraftOptionsManagerMigrated.ts
rm src/features/request/hooks/useRealDraftOptionsManagerMigratedFixed.ts
rm src/features/request/hooks/useRealDraftOptionsManagerSimple.ts
rm src/features/request/hooks/useTotalsCalculator.ts
rm src/features/request/hooks/useWizardOptionsManagerV3.ts
rm src/features/request/hooks/useWizardStateManagerV3.ts
```

#### **🗑️ Pages Obsolètes**
```bash
# Supprimer les pages obsolètes
rm src/features/request/pages/ApiCompatibilityTestPage.tsx
rm src/features/request/pages/RequestWizardApiCompatible.tsx
rm src/features/request/pages/RequestWizardTest.tsx
rm src/features/request/pages/RequestWizardV3.tsx
```

#### **🗑️ Services Obsolètes**
```bash
# Supprimer les services obsolètes
rm src/features/request/services/DraftPersistenceService.ts
rm src/features/request/services/DraftQuoteApiMapper.ts
rm src/features/request/services/LocalStorageService.ts
rm src/features/request/services/QuoteExporter.ts
rm src/features/request/services/QuoteJsonGenerator.ts
rm src/features/request/services/QuoteValidator.ts
```

### **Phase 2 : Correction des Imports (Critique)**

#### **🔧 Créer les Types Manquants**
```typescript
// Créer src/features/request/types/DraftQuote.ts
export interface DraftQuote {
  // Définir l'interface DraftQuote
}
```

#### **🔧 Créer les Hooks Manquants**
```typescript
// Créer src/features/request/hooks/useOptionsManager.ts
export const useOptionsManager = () => {
  // Implémenter le hook
}
```

### **Phase 3 : Nettoyage Final**

#### **🗑️ Fichiers de Configuration Obsolètes**
```bash
# Supprimer les fichiers de config obsolètes
rm src/features/request/wizard/build-check.js
rm src/features/request/wizard/count-quotes.js
rm src/features/request/wizard/test-exact-payload.js
rm src/features/request/wizard/test-simple.js
rm src/features/request/wizard/vitest.config.ts
```

---

## 📊 **Impact du Nettoyage**

### **📈 Bénéfices**
- **Réduction de la taille** : ~50 fichiers supprimés
- **Amélioration de la maintenabilité** : Code plus propre
- **Réduction de la confusion** : Moins de fichiers obsolètes
- **Performance** : Moins de fichiers à analyser par TypeScript

### **⚠️ Risques**
- **Fichiers de debug** : Perte d'outils de debug (peuvent être recréés si nécessaire)
- **Tests obsolètes** : Perte de tests (peuvent être recréés si nécessaire)
- **Documentation** : Certains fichiers de docs peuvent référencer des composants supprimés

### **🔍 Vérification Post-Nettoyage**
1. **Compilation** : Vérifier que le projet compile sans erreurs
2. **Tests** : Exécuter les tests pour s'assurer qu'ils passent
3. **Fonctionnalités** : Tester les fonctionnalités principales
4. **Documentation** : Mettre à jour la documentation

---

## 🚀 **Script de Nettoyage Automatique**

```bash
#!/bin/bash
# Script de nettoyage des fichiers non utilisés

echo "🧹 Nettoyage des fichiers non utilisés dans src/features/request/"

# Phase 1: Composants de debug
echo "🗑️ Suppression des composants de debug..."
rm -f src/features/request/components/AdvancedSyncStatus.tsx
rm -f src/features/request/components/ApiCompatibilityDashboard.tsx
rm -f src/features/request/components/DraftQuoteApiCompatibilityTest.tsx
rm -f src/features/request/components/DraftStateDebugger.tsx
rm -f src/features/request/components/DraftSyncStatus.tsx
rm -f src/features/request/components/DraftWizardDemo.tsx
rm -f src/features/request/components/SeafreightCalculationDebugger.tsx
rm -f src/features/request/components/TotalsDebugger.tsx
rm -f src/features/request/components/WizardSyncStatus.tsx
rm -f src/features/request/components/WizardSyncStatusV3.tsx

# Phase 2: Composants de graphiques
echo "🗑️ Suppression des composants de graphiques..."
rm -rf src/features/request/components/chart/

# Phase 3: Hooks obsolètes
echo "🗑️ Suppression des hooks obsolètes..."
rm -f src/features/request/hooks/useDebugLogger.ts
rm -f src/features/request/hooks/useOptionManagement.ts
rm -f src/features/request/hooks/useRealDraftOptionsManagerFixed.ts
rm -f src/features/request/hooks/useRealDraftOptionsManagerMigrated.ts
rm -f src/features/request/hooks/useRealDraftOptionsManagerMigratedFixed.ts
rm -f src/features/request/hooks/useRealDraftOptionsManagerSimple.ts
rm -f src/features/request/hooks/useTotalsCalculator.ts
rm -f src/features/request/hooks/useWizardOptionsManagerV3.ts
rm -f src/features/request/hooks/useWizardStateManagerV3.ts

# Phase 4: Pages obsolètes
echo "🗑️ Suppression des pages obsolètes..."
rm -f src/features/request/pages/ApiCompatibilityTestPage.tsx
rm -f src/features/request/pages/RequestWizardApiCompatible.tsx
rm -f src/features/request/pages/RequestWizardTest.tsx
rm -f src/features/request/pages/RequestWizardV3.tsx

# Phase 5: Services obsolètes
echo "🗑️ Suppression des services obsolètes..."
rm -f src/features/request/services/DraftPersistenceService.ts
rm -f src/features/request/services/DraftQuoteApiMapper.ts
rm -f src/features/request/services/LocalStorageService.ts
rm -f src/features/request/services/QuoteExporter.ts
rm -f src/features/request/services/QuoteJsonGenerator.ts
rm -f src/features/request/services/QuoteValidator.ts

# Phase 6: Fichiers de configuration obsolètes
echo "🗑️ Suppression des fichiers de configuration obsolètes..."
rm -f src/features/request/wizard/build-check.js
rm -f src/features/request/wizard/count-quotes.js
rm -f src/features/request/wizard/test-exact-payload.js
rm -f src/features/request/wizard/test-simple.js
rm -f src/features/request/wizard/vitest.config.ts

echo "✅ Nettoyage terminé !"
echo "🔍 Vérifiez la compilation avec: npm run build"
```

---

## 📝 **Recommandations**

### **🎯 Actions Immédiates**
1. **Sauvegarder** le projet avant le nettoyage
2. **Tester** chaque phase de suppression
3. **Vérifier** la compilation après chaque phase
4. **Documenter** les suppressions dans le changelog

### **🔮 Actions Futures**
1. **Intégrer** `unimported` dans le pipeline CI/CD
2. **Configurer** des règles ESLint pour détecter les imports non utilisés
3. **Mettre en place** un processus de review pour éviter l'accumulation de code mort
4. **Documenter** les patterns de suppression de code obsolète

---

*Cette analyse a été générée automatiquement par l'outil `unimported`. Vérifiez manuellement avant de supprimer des fichiers critiques.*
