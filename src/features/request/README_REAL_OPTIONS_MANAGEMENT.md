# 🚀 Gestion des Options Réelles dans les Brouillons

## 📋 Vue d'ensemble

Cette implémentation utilise l'architecture "1 draft = plusieurs options" basée sur les **vrais endpoints de l'API** définis dans le swagger. Elle remplace progressivement le système local tout en conservant la compatibilité.

## 🏗️ Architecture

### **Endpoints Utilisés**

```
GET    /api/QuoteOffer/Draft/{id}/WithOptions     → Récupérer draft + options
POST   /api/QuoteOffer/Draft/{id}/SaveAsOption    → Sauvegarder comme option
POST   /api/QuoteOffer/Draft/{id}/LoadOption/{optionId} → Charger une option
DELETE /api/QuoteOffer/Draft/{id}/Option/{optionId}     → Supprimer une option
POST   /api/Quote/from-draft                      → Créer devis final
```

### **Structure des Données**

#### Draft avec Options (API Response)
```typescript
{
  id: "draft-123",
  options: DraftOption[],
  currentWorkingOptionId: "option-1",
  preferredOptionId: "option-2",
  maxOptionsAllowed: 3,
  // ... autres données du draft
}
```

#### DraftOption (API Schema)
```typescript
{
  optionId: "option-1",
  name: "Option Premium",
  description: "Option avec services premium",
  haulageSelectionId: "haulage-123",
  seafreightSelectionIds: ["sea-1", "sea-2"],
  miscSelectionIds: ["misc-1"],
  step4Data: { /* État complet étape 4 */ },
  step5Data: { /* État complet étape 5 */ },
  step6Data: { /* État complet étape 6 */ },
  step7Data: { /* État complet étape 7 */ },
  marginType: "percentage",
  marginValue: 15,
  totals: {
    haulageTotalAmount: 1200,
    seafreightTotalAmount: 3500,
    miscTotalAmount: 800,
    subTotal: 5500,
    marginAmount: 825,
    finalTotal: 6325,
    currency: "EUR"
  },
  createdAt: "2024-01-15T10:30:00Z",
  calculatedMargin: 825,
  finalTotal: 6325
}
```

## 🔧 Composants Principaux

### **1. useRealDraftOptionsManager Hook**

Hook principal qui encapsule toute la logique API :

```typescript
const {
  // État
  options,                    // Options du draft
  selectedOptionId,          // Option sélectionnée
  currentWorkingOptionId,    // Option en cours de modification
  isLoadingOptions,          // État de chargement
  
  // Actions
  saveAsOption,              // Sauvegarder état actuel
  loadOption,                // Charger une option
  deleteOption,              // Supprimer une option
  duplicateOption,           // Dupliquer une option
  
  // Helpers
  canAddMoreOptions,         // Vérifier limite (max 3)
  isOptionValid,             // Valider une option
  refreshOptions,            // Actualiser les options
  exportForQuoteCreation    // Export pour création devis
} = useRealDraftOptionsManager({
  draftQuote,
  onDraftUpdate
});
```

### **2. RealDraftOptionsManager Component**

Interface utilisateur complète pour la gestion des options :

```typescript
<RealDraftOptionsManager
  draftQuote={draftQuote}
  onDraftUpdate={onDraftUpdate}
  onQuoteCreation={handleQuoteCreation}
/>
```

**Fonctionnalités :**
- ✅ **Liste des options** avec cartes détaillées
- ✅ **Statistiques** (nombre, validité, prix min)
- ✅ **Actions** : créer, modifier, dupliquer, supprimer, charger
- ✅ **Validation** en temps réel
- ✅ **Gestion des limites** (max 3 options)
- ✅ **Création de devis** intégrée
- ✅ **Interface responsive**

## 🔄 Flux de Travail

### **Phase 1 : Travail sur le Draft**
```
Utilisateur → Wizard Steps 1-7 → État du draft en mémoire
```

### **Phase 2 : Sauvegarde d'Options**
```
État actuel → saveAsOption() → POST /SaveAsOption → Option créée dans le draft
```

### **Phase 3 : Gestion des Options**
```
Liste des options → Actions (load/delete/duplicate) → API calls → Mise à jour
```

### **Phase 4 : Création du Devis**
```
Options finalisées → exportForQuoteCreation() → POST /api/Quote/from-draft → Devis créé
```

## 📊 Avantages de cette Approche

### ✅ **Persistance Réelle**
- Options sauvegardées côté serveur
- Survit aux rafraîchissements de page
- Synchronisation multi-utilisateurs

### ✅ **Performance Optimisée**
- Cache intelligent avec TanStack Query
- Chargement à la demande
- Invalidation automatique

### ✅ **UX Améliorée**
- Feedback visuel en temps réel
- Gestion d'erreurs robuste
- États de chargement

### ✅ **Maintenabilité**
- Code découplé et réutilisable
- Tests unitaires possibles
- Documentation complète

## 🔧 Intégration dans Step7Recap

Le `Step7Recap` utilise maintenant un **système hybride** :

```typescript
// Hook local (compatibilité)
const { options: localOptions, ... } = useDraftOptionsManager({...});

// Hook réel (API)
const { options: realOptions, ... } = useRealDraftOptionsManager({...});

// Fallback intelligent
const options = realOptions.length > 0 ? realOptions : localOptions;
```

**Avantages du fallback :**
- ✅ Transition en douceur
- ✅ Pas de breaking changes
- ✅ Tests A/B possibles
- ✅ Rollback facile

## 🎯 Fonctionnalités Avancées

### **1. Validation Intelligente**
```typescript
const isOptionValid = (option: DraftOptionReal) => {
  return !!(
    option.name &&
    option.description &&
    option.totals.finalTotal > 0
  );
};
```

### **2. Gestion des Limites**
```typescript
const canAddMoreOptions = options.length < (maxOptionsAllowed || 3);
```

### **3. Export Optimisé**
```typescript
const exportForQuoteCreation = () => ({
  draftId: draftQuote.id,
  options: options.map((opt, idx) => ({
    optionId: idx + 1,
    description: opt.description,
    pricing: { amount: opt.totals.finalTotal, currency: 'EUR' },
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  })),
  preferredOptionId: selectedOptionIndex + 1,
  expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  quoteComments: `Devis créé avec ${options.length} option(s)`
});
```

## 🚨 Points d'Attention

### **Gestion d'Erreurs**
- ✅ Try/catch sur toutes les opérations API
- ✅ Messages d'erreur utilisateur-friendly
- ✅ Fallback sur les données locales

### **Performance**
- ✅ Debouncing des appels API
- ✅ Cache avec staleTime approprié
- ✅ Optimistic updates

### **Sécurité**
- ✅ Validation côté client ET serveur
- ✅ Sanitisation des données
- ✅ Gestion des permissions

## 🔮 Évolutions Futures

### **Phase 1 : Stabilisation** ✅
- [x] Implémentation de base
- [x] Tests d'intégration
- [x] Documentation

### **Phase 2 : Optimisation**
- [ ] Optimistic updates
- [ ] Offline support
- [ ] Compression des données

### **Phase 3 : Fonctionnalités Avancées**
- [ ] Comparaison d'options côte à côte
- [ ] Templates d'options
- [ ] Historique des modifications
- [ ] Collaboration temps réel

## 📚 Utilisation

### **Basique**
```typescript
import RealDraftOptionsManager from './RealDraftOptionsManager';

<RealDraftOptionsManager
  draftQuote={draftQuote}
  onDraftUpdate={handleDraftUpdate}
  onQuoteCreation={handleQuoteCreation}
/>
```

### **Avancée**
```typescript
const {
  options,
  saveAsOption,
  loadOption,
  exportForQuoteCreation
} = useRealDraftOptionsManager({
  draftQuote,
  onDraftUpdate: (draft) => {
    // Logique personnalisée
    console.log('Draft mis à jour:', draft);
    onDraftUpdate?.(draft);
  }
});

// Sauvegarder une option
await saveAsOption({
  name: 'Option Express',
  description: 'Livraison express avec assurance',
  marginType: 'percentage',
  marginValue: 20
});

// Créer le devis
const quoteData = exportForQuoteCreation();
await createQuote(quoteData);
```

## 🎉 Résultat

Cette implémentation offre :

1. **Une architecture robuste** basée sur les vrais endpoints API
2. **Une compatibilité totale** avec l'existant
3. **Une expérience utilisateur fluide** avec feedback temps réel
4. **Une base solide** pour les évolutions futures

L'utilisateur peut maintenant :
- ✅ Créer plusieurs options dans un même draft
- ✅ Basculer entre les options facilement
- ✅ Modifier et dupliquer les options
- ✅ Créer un devis avec toutes ses options
- ✅ Bénéficier de la persistance côté serveur

**C'est la solution définitive pour la gestion des options !** 🚀
