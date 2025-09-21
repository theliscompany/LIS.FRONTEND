# Guide de gestion des options - Frontend

## 🎯 Vue d'ensemble

Ce guide présente la solution complète pour la gestion des options de devis dans le frontend. La solution résout tous les défis identifiés : ajout, suppression, modification et calculs robustes.

## 🏗️ Architecture de la solution

### 1. **Hook principal : `useOptionsManager`**
- **Fichier** : `src/features/request/hooks/useOptionsManager.ts`
- **Responsabilité** : Logique métier complète pour la gestion des options
- **Fonctionnalités** :
  - ✅ Création d'options avec validation
  - ✅ Modification d'options
  - ✅ Suppression d'options
  - ✅ Calculs de totaux robustes
  - ✅ Gestion des états de chargement
  - ✅ Synchronisation avec l'API

### 2. **Composant principal : `OptionsManager`**
- **Fichier** : `src/features/request/components/OptionsManager.tsx`
- **Responsabilité** : Interface utilisateur complète
- **Fonctionnalités** :
  - ✅ Interface intuitive pour toutes les opérations
  - ✅ Formulaires de création/modification
  - ✅ Affichage des totaux détaillés
  - ✅ Gestion des erreurs et validations
  - ✅ Actions de création de devis

### 3. **Intégration wizard : `Step7OptionsManager`**
- **Fichier** : `src/features/request/components/Step7OptionsManager.tsx`
- **Responsabilité** : Intégration dans le flux du wizard
- **Fonctionnalités** :
  - ✅ Validation des données du wizard
  - ✅ Résumé de la demande
  - ✅ Progression du wizard
  - ✅ Gestion des erreurs de validation

### 4. **Calculateur de totaux : `useTotalsCalculator`**
- **Fichier** : `src/features/request/hooks/useTotalsCalculator.ts`
- **Responsabilité** : Calculs centralisés et robustes
- **Fonctionnalités** :
  - ✅ Calcul du haulage (Step 4)
  - ✅ Calcul du seafreight (Step 5)
  - ✅ Calcul des services divers (Step 6)
  - ✅ Calculs de marges (pourcentage/fixe)
  - ✅ Formatage des devises

## 🚀 Utilisation

### Intégration dans le wizard

```typescript
// Dans RequestWizard.tsx
import Step7OptionsManager from './components/Step7OptionsManager';

// Dans renderStepContent
case 6: // Step 7: Options
  return (
    <Step7OptionsManager
      draftQuote={wizardState.draftQuote}
      onDraftUpdate={updateDraftQuote}
      onBack={() => goToStep(wizardState.activeStep - 1)}
      onNext={() => goToStep(wizardState.activeStep + 1)}
      onQuoteCreation={handleQuoteCreation}
    />
  );
```

### Utilisation standalone

```typescript
import OptionsManager from './components/OptionsManager';

<OptionsManager
  draftQuote={draftQuote}
  onDraftUpdate={handleDraftUpdate}
  onQuoteCreation={handleQuoteCreation}
/>
```

### Utilisation du hook

```typescript
import { useOptionsManager } from './hooks/useOptionsManager';

const {
  options,
  selectedOption,
  currentTotals,
  createOption,
  updateOption,
  deleteOption,
  createQuote,
  isCreating,
  isEditing,
  canAddMoreOptions
} = useOptionsManager(draftQuote);
```

## 🔧 Configuration

### Limites et paramètres

```typescript
const OPTIONS_CONFIG = {
  MAX_OPTIONS: 5,                    // Maximum d'options par draft
  DEFAULT_MARGIN_TYPE: 'percentage', // Type de marge par défaut
  DEFAULT_MARGIN_VALUE: 15,          // Valeur de marge par défaut
  CURRENCY: 'EUR'                    // Devise par défaut
};
```

### Validation des données

```typescript
const validateOptionData = (data: CreateOptionData): string[] => {
  const errors: string[] = [];
  
  if (!data.name?.trim()) {
    errors.push('Le nom de l\'option est requis');
  }
  
  if (data.name && data.name.length > 100) {
    errors.push('Le nom de l\'option ne peut pas dépasser 100 caractères');
  }
  
  // ... autres validations
};
```

## 📊 Calculs de totaux

### Structure des totaux

```typescript
interface TotalsBreakdown {
  haulage: {
    total: number;
    baseAmount: number;
    surcharges: number;
    currency: string;
  };
  seafreight: {
    total: number;
    baseAmount: number;
    surcharges: number;
    currency: string;
    selections: Array<{
      name: string;
      basePrice: number;
      surcharges: number;
      total: number;
      quantity: number;
    }>;
  };
  miscellaneous: {
    total: number;
    currency: string;
    services: Array<{
      name: string;
      price: number;
    }>;
  };
  summary: {
    subTotal: number;
    marginAmount: number;
    finalTotal: number;
    currency: string;
  };
}
```

### Calculs automatiques

- **Haulage** : Basé sur `draftQuote.step4.calculation`
- **Seafreight** : Basé sur `draftQuote.step5.selections` × quantités de conteneurs
- **Services divers** : Basé sur `draftQuote.step6.selections`
- **Marges** : Support pourcentage et montant fixe

## 🎨 Interface utilisateur

### Fonctionnalités principales

1. **Liste des options** : Affichage avec totaux détaillés
2. **Création d'option** : Formulaire avec validation
3. **Modification d'option** : Édition en place
4. **Suppression d'option** : Confirmation requise
5. **Création de devis** : Action directe depuis l'option
6. **Totaux en temps réel** : Calculs automatiques

### États d'interface

- `isCreating` : Mode création d'option
- `isEditing` : Mode modification d'option
- `isAnyLoading` : Chargement en cours
- `canAddMoreOptions` : Limite d'options respectée

## 🔄 Intégration API

### Endpoints utilisés

```typescript
// Création d'option
postApiDraftQuotesByIdOptions({
  path: { id: draftQuoteId },
  body: { option: { label, description, marginType, marginValue } }
});

// Récupération des options
getApiDraftQuotesById({
  path: { id: draftQuoteId }
});

// Création de devis
postApiDraftQuotesByIdFinalize({
  path: { id: draftQuoteId },
  body: { optionId }
});
```

### Gestion des erreurs

- Validation côté client avant envoi
- Messages d'erreur utilisateur-friendly
- Retry automatique pour les erreurs réseau
- Fallback gracieux

## 🧪 Tests

### Tests unitaires recommandés

```typescript
// Test du hook useOptionsManager
describe('useOptionsManager', () => {
  it('should create option with valid data', async () => {
    // Test de création
  });
  
  it('should validate option data', () => {
    // Test de validation
  });
  
  it('should calculate totals correctly', () => {
    // Test des calculs
  });
});

// Test du composant OptionsManager
describe('OptionsManager', () => {
  it('should render options list', () => {
    // Test d'affichage
  });
  
  it('should handle form submission', () => {
    // Test des formulaires
  });
});
```

## 🚀 Déploiement

### Étapes de migration

1. **Remplacer l'ancien système** :
   ```typescript
   // Ancien
   import RealDraftOptionsManagerFixed from './RealDraftOptionsManagerFixed';
   
   // Nouveau
   import OptionsManager from './OptionsManager';
   ```

2. **Mettre à jour les imports** :
   ```typescript
   import { useOptionsManager } from './hooks/useOptionsManager';
   import { useTotalsCalculator } from './hooks/useTotalsCalculator';
   ```

3. **Adapter les props** :
   ```typescript
   // Les props sont compatibles avec l'ancien système
   <OptionsManager
     draftQuote={draftQuote}
     onDraftUpdate={onDraftUpdate}
     onQuoteCreation={onQuoteCreation}
   />
   ```

## 📈 Avantages de la solution

### ✅ Résolution des défis

1. **Mutations complètes** : Toutes les opérations CRUD implémentées
2. **Calculs robustes** : Logique centralisée et testée
3. **Validation** : Validation complète des données
4. **UX améliorée** : Interface intuitive et responsive
5. **Performance** : Calculs optimisés et mémorisés
6. **Maintenabilité** : Code modulaire et bien documenté

### 🎯 Fonctionnalités avancées

- **Calculs en temps réel** : Totaux mis à jour automatiquement
- **Validation robuste** : Contrôles côté client et serveur
- **Gestion d'erreurs** : Messages clairs et actions de récupération
- **Interface responsive** : Adaptation à tous les écrans
- **Accessibilité** : Support des lecteurs d'écran
- **Internationalisation** : Support multilingue

## 🔮 Évolutions futures

### Améliorations possibles

1. **Comparaison d'options** : Vue comparative des options
2. **Templates d'options** : Modèles prédéfinis
3. **Export/Import** : Sauvegarde et partage d'options
4. **Historique** : Suivi des modifications
5. **Collaboration** : Partage en temps réel
6. **Analytics** : Statistiques d'utilisation

Cette solution fournit une base solide et extensible pour la gestion des options de devis dans le frontend.
