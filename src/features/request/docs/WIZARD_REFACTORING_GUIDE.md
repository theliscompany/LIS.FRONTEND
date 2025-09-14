# 🔄 Guide de Refactorisation du RequestWizard

## 📋 **Vue d'ensemble**

Le RequestWizard a été entièrement refactorisé pour implémenter une **sauvegarde et restauration complète** de l'état du wizard en utilisant les **bonnes pratiques React** et le **SDK API officiel**.

## ✨ **Nouvelles Fonctionnalités**

### 1. **Sauvegarde Automatique**
- ✅ Sauvegarde automatique après 2 secondes d'inactivité
- ✅ Sauvegarde manuelle via bouton dédié
- ✅ Gestion des erreurs de sauvegarde
- ✅ Indicateur visuel de l'état de synchronisation

### 2. **Restauration Complète**
- ✅ Chargement automatique des brouillons existants
- ✅ Restauration de l'état complet du wizard
- ✅ Gestion des options et configurations
- ✅ Navigation entre étapes préservée

### 3. **Gestion des Options**
- ✅ Création de nouvelles options
- ✅ Duplication d'options existantes
- ✅ Sauvegarde et chargement d'options
- ✅ Comparaison d'options

## 🏗️ **Architecture Refactorisée**

### **Hooks Principaux**

#### `useWizardStateManager`
```typescript
const {
  state: wizardState,
  updateStep,
  updateDraftQuote,
  saveDraft,
  loadDraft,
  resetDraft,
  goToStep,
  canGoToNext,
  canGoToPrevious
} = useWizardStateManager(
  initialDraftQuote,
  currentUserEmail,
  clientNumber,
  draftId
);
```

**Fonctionnalités :**
- Gestion complète de l'état du wizard
- Sauvegarde automatique avec debounce
- Validation des étapes
- Navigation intelligente

#### `useWizardOptionsManager`
```typescript
const {
  options: savedOptions,
  currentOptionIndex,
  createNewOption,
  loadOption,
  saveOption,
  deleteOption,
  duplicateOption,
  selectOption,
  compareOptions
} = useWizardOptionsManager(
  draftQuote,
  draftId,
  onOptionChange
);
```

**Fonctionnalités :**
- CRUD complet des options
- Synchronisation avec l'API
- Gestion des erreurs
- Callbacks de changement

### **Composants de Statut**

#### `WizardSyncStatus`
```typescript
<WizardSyncStatus
  isDirty={wizardState.isDirty}
  isSaving={wizardState.isSaving}
  lastSavedAt={wizardState.lastSavedAt}
  saveError={wizardState.saveError}
  draftId={draftId}
  onManualSave={handleSave}
  onManualRestore={handleRestore}
  onRefresh={handleRefresh}
/>
```

**Fonctionnalités :**
- Affichage en temps réel du statut
- Boutons d'action manuels
- Informations détaillées
- Interface extensible

## 🚀 **Utilisation**

### **1. Initialisation du Wizard**

```typescript
export default function RequestWizard() {
  const { email: currentUserEmail, clientNumber } = useCurrentUser();
  const draftId = params.id || urlSearchParams.get('draftId');
  
  const {
    state: wizardState,
    updateStep,
    updateDraftQuote,
    saveDraft,
    loadDraft,
    resetDraft,
    goToStep,
    canGoToNext,
    canGoToPrevious
  } = useWizardStateManager(
    createInitialDraftQuote(currentUserEmail),
    currentUserEmail,
    clientNumber,
    draftId
  );
}
```

### **2. Mise à Jour des Étapes**

```typescript
// Mise à jour d'une étape spécifique
const updateStep1 = useCallback((data: Partial<DraftQuote['step1']>) => {
  updateStep(1, data);
}, [updateStep]);

// Mise à jour globale
const updateDraftQuote = useCallback((updates: Partial<DraftQuote>) => {
  updateDraftQuote(updates);
}, [updateDraftQuote]);
```

### **3. Navigation**

```typescript
const handleNext = useCallback(() => {
  if (canGoToNext()) {
    goToStep(wizardState.activeStep + 1);
  } else {
    enqueueSnackbar('Veuillez compléter les champs requis', { variant: 'warning' });
  }
}, [canGoToNext, goToStep, wizardState.activeStep, enqueueSnackbar]);

const handleBack = useCallback(() => {
  if (wizardState.isDirty) {
    setShowUnsavedDialog(true);
  } else {
    goToStep(wizardState.activeStep - 1);
  }
}, [wizardState.isDirty, goToStep, wizardState.activeStep]);
```

### **4. Sauvegarde**

```typescript
const handleSave = useCallback(async () => {
  const success = await saveDraft();
  if (success) {
    enqueueSnackbar('Brouillon sauvegardé avec succès', { variant: 'success' });
  }
}, [saveDraft, enqueueSnackbar]);

// Sauvegarde automatique (gérée par le hook)
useEffect(() => {
  if (wizardState.isDirty) {
    // Le hook gère automatiquement la sauvegarde
  }
}, [wizardState.draftQuote]);
```

## 🔧 **Configuration**

### **Variables d'Environnement**

```bash
# Délai de sauvegarde automatique (en millisecondes)
REACT_APP_AUTO_SAVE_DELAY=2000

# URL de l'API
REACT_APP_API_BASE_URL=https://api.example.com

# Mode de développement
NODE_ENV=development
```

### **Options de Sauvegarde**

```typescript
// Dans useWizardStateManager
const saveOptions = {
  retryCount: 3,
  fallbackToLocalStorage: true,
  validateData: true,
  showNotifications: true
};
```

## 📊 **Structure des Données**

### **DraftQuote**
```typescript
interface DraftQuote {
  id?: string;
  draftId?: string;
  requestQuoteId?: string;
  clientNumber?: string;
  step1: Step1;
  step2: Step2;
  step3: Step3;
  step4: Step4;
  step5: Step5;
  step6: Step6;
  step7: Step7;
  totals: Totals;
  savedOptions: any[];
  selectedHaulage?: SelectedHaulage;
  selectedSeafreights: SelectedSeafreight[];
  selectedMiscellaneous: any[];
  selectedContainers: Record<string, any>;
  // ... autres propriétés
}
```

### **WizardState**
```typescript
interface WizardState {
  activeStep: number;
  draftQuote: DraftQuote;
  isDirty: boolean;
  lastSavedAt: Date | null;
  isSaving: boolean;
  saveError: string | null;
}
```

## 🚨 **Gestion des Erreurs**

### **Types d'Erreurs**

1. **Erreurs de Sauvegarde**
   - Connexion réseau
   - Validation des données
   - Conflits de version

2. **Erreurs de Chargement**
   - Brouillon introuvable
   - Données corrompues
   - Permissions insuffisantes

### **Stratégies de Récupération**

```typescript
// Fallback vers le stockage local
if (saveError && fallbackToLocalStorage) {
  saveToLocalStorage(draftQuote);
}

// Retry automatique
if (saveError && retryCount < maxRetries) {
  setTimeout(() => saveDraft(), retryDelay);
}
```

## 🔄 **Migration depuis l'Ancien Système**

### **Étapes de Migration**

1. **Remplacer les imports**
   ```typescript
   // Avant
   import { useWizardDraftState, useWizardNavigation } from '../hooks';
   
   // Après
   import { useWizardStateManager, useWizardOptionsManager } from '../hooks';
   ```

2. **Mettre à jour la structure d'état**
   ```typescript
   // Avant
   const { draftQuote, activeStep, hasUnsavedChanges } = useWizardDraftState();
   
   // Après
   const { state: wizardState } = useWizardStateManager();
   const { draftQuote, activeStep, isDirty } = wizardState;
   ```

3. **Adapter les fonctions de mise à jour**
   ```typescript
   // Avant
   updateStep(stepNumber, data);
   
   // Après
   updateStep(stepNumber, data);
   // (même signature, logique améliorée)
   ```

## 📈 **Performance et Optimisations**

### **Optimisations Implémentées**

1. **Debounce de Sauvegarde**
   - Évite les sauvegardes multiples
   - Réduit la charge serveur
   - Améliore l'expérience utilisateur

2. **Mise à Jour Différentielle**
   - Seules les données modifiées sont sauvegardées
   - Réduction de la taille des payloads
   - Optimisation de la bande passante

3. **Cache Local**
   - Stockage temporaire des modifications
   - Récupération rapide en cas d'erreur
   - Synchronisation intelligente

### **Métriques de Performance**

```typescript
// Temps de sauvegarde moyen
const averageSaveTime = performance.now() - saveStartTime;

// Taille des données sauvegardées
const dataSize = JSON.stringify(draftQuote).length;

// Taux de succès des sauvegardes
const successRate = successfulSaves / totalSaves;
```

## 🧪 **Tests et Validation**

### **Tests Unitaires**

```typescript
describe('useWizardStateManager', () => {
  it('should save draft automatically after delay', async () => {
    // Test de la sauvegarde automatique
  });
  
  it('should restore draft state correctly', async () => {
    // Test de la restauration
  });
  
  it('should handle save errors gracefully', async () => {
    // Test de la gestion d'erreurs
  });
});
```

### **Tests d'Intégration**

```typescript
describe('Wizard Integration', () => {
  it('should maintain state across navigation', async () => {
    // Test de persistance de l'état
  });
  
  it('should sync with API correctly', async () => {
    // Test de synchronisation
  });
});
```

## 🔮 **Évolutions Futures**

### **Fonctionnalités Prévues**

1. **Synchronisation Hors Ligne**
   - Stockage local avancé
   - Synchronisation différée
   - Gestion des conflits

2. **Collaboration en Temps Réel**
   - Édition collaborative
   - Notifications de changements
   - Historique des modifications

3. **Intelligence Artificielle**
   - Suggestions automatiques
   - Validation intelligente
   - Optimisation des prix

### **Améliorations Techniques**

1. **WebSockets**
   - Synchronisation en temps réel
   - Notifications push
   - État partagé

2. **Service Workers**
   - Sauvegarde en arrière-plan
   - Synchronisation offline
   - Cache intelligent

## 📚 **Ressources et Références**

### **Documentation API**
- [SDK API Documentation](./api/README.md)
- [Types et Interfaces](./types/README.md)
- [Hooks et Utilitaires](./hooks/README.md)

### **Exemples d'Utilisation**
- [Exemples de Base](./examples/basic-usage.md)
- [Cas d'Usage Avancés](./examples/advanced-usage.md)
- [Patterns Recommandés](./examples/recommended-patterns.md)

### **Support et Maintenance**
- [FAQ](./support/FAQ.md)
- [Troubleshooting](./support/troubleshooting.md)
- [Contact Support](./support/contact.md)

---

## 🎯 **Conclusion**

Cette refactorisation transforme le RequestWizard en un système **robuste, performant et maintenable** qui respecte les meilleures pratiques React et offre une **expérience utilisateur exceptionnelle**.

Les nouvelles fonctionnalités de sauvegarde et restauration garantissent que **aucune donnée n'est perdue** et que les utilisateurs peuvent **reprendre leur travail exactement où ils l'ont laissé**.

Pour toute question ou assistance, consultez la documentation ou contactez l'équipe de développement.
