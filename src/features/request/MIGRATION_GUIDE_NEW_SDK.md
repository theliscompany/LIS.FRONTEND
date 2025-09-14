# 🚀 Guide de Migration vers le Nouveau SDK Quote Offer

## 📋 **Vue d'ensemble**

Ce document décrit la migration du wizard LIS Quotes vers le nouveau SDK des offres de devis, qui utilise des endpoints et structures de données complètement nouveaux.

## 🔄 **Changements Majeurs**

### **Endpoints API**

| Ancien Endpoint | Nouveau Endpoint | Status |
|----------------|------------------|--------|
| `postApiQuoteOfferDraft` | `postApiDraftQuotes` | ✅ Migré |
| `putApiQuoteOfferDraftById` | `putApiDraftQuotesById` | ✅ Migré |
| `getDraft` | `getApiDraftQuotesById` | ✅ Migré |
| `postApiQuoteOfferDraftByIdSaveAsOption` | `postApiDraftQuotesByIdOptions` | ✅ Migré |
| `getApiQuoteOfferDraftByIdWithOptions` | `getApiDraftQuotesById` | ✅ Migré |
| `postApiQuoteFromDraft` | `postApiQuotesFinalizeByDraftId` | ✅ Migré |

### **Structures de Données**

#### **Ancien Format (DraftQuote)**
```typescript
interface DraftQuote {
  id: string;
  requestQuoteId: string;
  emailUser: string;
  step1: { ... };
  step2: { ... };
  // ...
  savedOptions: DraftOptionFixed[];
}
```

#### **Nouveau Format API (DraftQuoteResponse)**
```typescript
interface DraftQuoteResponse {
  draftQuoteId: string;
  requestId: string;
  header: DraftQuoteHeaderDto;
  wizardData: DraftQuoteWizardDataDto;
  options: DraftQuoteOptionDto[];
  // ...
}
```

## 🛠️ **Fichiers Migrés**

### **✅ Hooks Migrés**
1. **`useRealDraftOptionsManagerMigrated.ts`** - Nouveau hook pour la gestion des options
2. **`useWizardStateManagerMigrated.ts`** - Nouveau hook pour la gestion d'état du wizard

### **✅ Composants Mis à Jour**
1. **`RealDraftOptionsManagerFixed.tsx`** - Utilise maintenant le nouveau hook migré

### **🔄 Fonctions de Conversion**

#### **DraftQuote → API Format**
```typescript
const convertToNewFormat = (draftQuote: DraftQuote) => {
  return {
    requestId: draftQuote.requestQuoteId,
    header: {
      client: { /* mapping des données client */ },
      shipment: { /* mapping des données shipment */ },
      commercialTerms: { /* mapping des termes commerciaux */ }
    },
    wizardData: {
      generalRequestInformation: { /* step1 data */ },
      routingAndCargo: { /* step2+step3 data */ },
      seafreights: [ /* step5 data */ ],
      haulages: [ /* step4 data */ ],
      services: [ /* step6 data */ ]
    }
  };
};
```

#### **API Format → DraftQuote**
```typescript
const convertFromNewFormat = (apiResponse: any): DraftQuote => {
  const data = apiResponse.data || apiResponse;
  return {
    id: data.draftQuoteId,
    requestQuoteId: data.requestId,
    step1: { /* mapping depuis header.client */ },
    step2: { /* mapping depuis header.shipment */ },
    // ...
    savedOptions: data.options?.map(/* conversion des options */)
  };
};
```

## 🎯 **Nouvelles Fonctionnalités Disponibles**

### **1. Validation Native**
```typescript
// Nouveau endpoint de validation
const validateResult = await postApiDraftQuotesByIdValidate({
  path: { id: draftId }
});
```

### **2. Gestion d'Options Intégrée**
```typescript
// Ajouter une option directement via l'API
const optionResult = await postApiDraftQuotesByIdOptions({
  path: { id: draftId },
  body: { option: { /* DraftQuoteOptionDto */ } }
});
```

### **3. Finalisation Simplifiée**
```typescript
// Créer un devis final avec toutes les options
const quoteResult = await postApiQuotesFinalizeByDraftId({
  path: { draftId },
  body: {
    options: [ /* QuoteOptionRequest[] */ ],
    preferredOptionId: 1,
    quoteComments: "Devis créé automatiquement",
    sendToClient: false
  }
});
```

## 🔧 **Comment Utiliser la Migration**

### **1. Import des Nouveaux Hooks**
```typescript
// Ancien
import { useRealDraftOptionsManagerFixed } from '../hooks/useRealDraftOptionsManagerFixed';
import { useWizardStateManager } from '../hooks/useWizardStateManager';

// Nouveau (migré)
import { useRealDraftOptionsManagerMigrated } from '../hooks/useRealDraftOptionsManagerMigrated';
import { useWizardStateManagerMigrated } from '../hooks/useWizardStateManagerMigrated';
```

### **2. Utilisation Identique**
```typescript
// L'interface reste identique - pas de changement dans les composants
const {
  options,
  createOption,
  deleteOption,
  // ...
} = useRealDraftOptionsManagerMigrated({ draftQuote, onDraftUpdate });
```

### **3. Compatibilité Ascendante**
Les nouveaux hooks maintiennent la même interface que les anciens, permettant une migration transparente.

## 🚨 **Points d'Attention**

### **1. Mapping des Données**
- Les structures internes ont changé mais l'interface externe reste identique
- La conversion se fait automatiquement dans les hooks migrés

### **2. Gestion d'Erreurs**
- Les nouveaux endpoints peuvent retourner des erreurs différentes
- La gestion d'erreur est améliorée avec plus de détails

### **3. Performance**
- Les nouveaux endpoints sont optimisés
- Moins d'appels API nécessaires grâce à la structure enrichie

## 📊 **Status de Migration**

| Composant | Status | Notes |
|-----------|--------|--------|
| useRealDraftOptionsManagerFixed | ✅ Migré | Nouveau hook disponible |
| useWizardStateManager | ✅ Migré | Nouveau hook disponible |
| RealDraftOptionsManagerFixed | ✅ Mis à jour | Utilise le nouveau hook |
| Step7Recap | 🔄 En cours | À migrer |
| FinalValidation | 🔄 En cours | À migrer |
| DraftPersistenceService | 🔄 En cours | À migrer |

## 🎉 **Avantages de la Migration**

1. **🚀 Performance améliorée** - Endpoints optimisés
2. **🔧 Fonctionnalités enrichies** - Validation, gestion d'options intégrée
3. **📊 Meilleure structure** - Données mieux organisées
4. **🛡️ Robustesse** - Gestion d'erreurs améliorée
5. **🔄 Compatibilité** - Interface identique, migration transparente

## 🔮 **Prochaines Étapes**

1. **Tester les nouveaux hooks** dans l'environnement de développement
2. **Migrer les composants restants** (Step7Recap, FinalValidation, etc.)
3. **Supprimer les anciens hooks** une fois la migration complète
4. **Mettre à jour la documentation** utilisateur

---

**🎯 La migration conserve la fonctionnalité existante tout en préparant l'application pour les nouvelles fonctionnalités du SDK.**
