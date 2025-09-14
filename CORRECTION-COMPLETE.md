# 🔧 GUIDE DE CORRECTION COMPLÈTE - RequestWizard.tsx

## 📋 **ERREURS IDENTIFIÉES ET SOLUTIONS**

### **1. Imports manquants (lignes 46-54)**
**Problème :** Les fonctions importées n'existent pas dans `../types`
**Solution :** Corriger le chemin d'import

```typescript
// ❌ AVANT
import { 
  DraftQuote,
  createInitialDraftQuote, 
  createDraftQuoteFromRequest,
  validateNavigationData,
  syncDraftQuoteData, 
  buildSDKPayload,
  loadDraftFromDatabase
} from '../types';

// ✅ APRÈS
import { 
  DraftQuote,
  createInitialDraftQuote, 
  createDraftQuoteFromRequest,
  validateNavigationData,
  syncDraftQuoteData, 
  buildSDKPayload,
  loadDraftFromDatabase
} from '../types/DraftQuote';
```

### **2. step1.customer manque companyName et email (3 occurrences)**
**Lignes :** 1365, 1497, 3117

```typescript
// ❌ AVANT
customer: request.customerId ? { contactId: request.customerId, contactName: request.companyName } : undefined,

// ✅ APRÈS
customer: request.customerId ? { 
  contactId: request.customerId, 
  contactName: request.companyName, 
  companyName: request.companyName || '', 
  email: '' 
} : undefined,
```

### **3. step1.cityFrom/cityTo - Supprimer cityName**
**Lignes :** 1366-1375, 1498-1507, 3118-3127

```typescript
// ❌ AVANT
cityFrom: request.pickupLocation?.city ? { 
  cityName: request.pickupLocation.city, 
  name: request.pickupLocation.city,
  country: request.pickupLocation.country || ''
} : undefined,

// ✅ APRÈS
cityFrom: request.pickupLocation?.city ? { 
  name: request.pickupLocation.city,
  country: request.pickupLocation.country || ''
} : undefined,
```

### **4. step1.productName manque productId**
**Lignes :** 1376, 1508, 3128

```typescript
// ❌ AVANT
productName: { productName: 'DEBUG PRODUCT' },

// ✅ APRÈS
productName: { productId: 0, productName: 'DEBUG PRODUCT' },
```

### **5. step3 manque containers, summary, route**
**Lignes :** 4300, 5044-5058

```typescript
// ❌ AVANT
step3: { selectedContainers: { list: [] } },

// ✅ APRÈS
step3: { 
  containers: [],
  summary: { totalContainers: 0, totalTEU: 0, containerTypes: [] },
  route: { 
    origin: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } }, 
    destination: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } } 
  },
  selectedContainers: { list: [] } 
},
```

### **6. step6 manque selections et summary**
**Lignes :** 2991-2994, 3006-3009

```typescript
// ❌ AVANT
step6: {
  selectedMiscellaneous: mappedForLocal,
  completed: mappedForLocal.length > 0
}

// ✅ APRÈS
step6: {
  selections: mappedForLocal.map(m => ({
    id: m.id,
    service: { serviceId: m.serviceId, serviceName: m.serviceName, category: '' },
    supplier: { supplierName: m.supplierName },
    pricing: { unitPrice: m.price, quantity: 1, subtotal: m.price, currency: m.currency },
    validity: { validUntil: m.validUntil },
    remarks: '',
    isSelected: true,
    selectedAt: new Date()
  })),
  summary: {
    totalSelections: mappedForLocal.length,
    totalAmount: mappedForLocal.reduce((sum, m) => sum + m.price, 0),
    currency: 'EUR',
    categories: []
  }
}
```

### **7. selectedHaulage - Utiliser tariff.* au lieu des propriétés directes**
**Lignes :** 2101-2103, 2123-2125, 2736-2738, 2758-2760, 5024, 5039, 5089-5091, 5169-5171

```typescript
// ❌ AVANT
unitTariff: draftQuote.selectedHaulage.unitTariff,
currency: draftQuote.selectedHaulage.currency,
freeTime: draftQuote.selectedHaulage.freeTime,

// ✅ APRÈS
unitTariff: draftQuote.selectedHaulage.tariff?.unitPrice || 0,
currency: draftQuote.selectedHaulage.tariff?.currency || 'EUR',
freeTime: draftQuote.selectedHaulage.tariff?.freeTime || 0,
```

### **8. selectedSeafreight - Utiliser les bonnes propriétés**
**Lignes :** 2539-2540, 2705, 5146-5148, 5161-5162, 5134-5137

```typescript
// ❌ AVANT
seaFreightId: draftQuote.selectedSeafreights[0].seaFreightId,
carrierName: draftQuote.selectedSeafreights[0].carrierName,

// ✅ APRÈS
seafreightId: draftQuote.selectedSeafreights[0].seafreightId,
carrierName: draftQuote.selectedSeafreights[0].carrier?.name || '',
```

### **9. loadDraftFromDatabase - Signature incorrecte**
**Ligne :** 2509

```typescript
// ❌ AVANT
setDraftQuote(prev => loadDraftFromDatabase(parsedData, prev));

// ✅ APRÈS (si la fonction n'attend qu'1 argument)
setDraftQuote(prev => loadDraftFromDatabase(parsedData));
```

### **10. Propriétés manquantes dans DraftQuote**
**Lignes :** 2087-2093, 2880-2882, 4482, 4630, 4367

```typescript
// ❌ AVANT
totalContainers: draftQuote.totalContainers || 0,
containerTypes: draftQuote.containerTypes || [],
currentStep: draftQuote.currentStep,

// ✅ APRÈS
totalContainers: draftQuote.step3?.summary?.totalContainers || 0,
containerTypes: draftQuote.step3?.summary?.containerTypes || [],
currentStep: activeStep, // Utiliser activeStep au lieu de draftQuote.currentStep
```

## 🚀 **ORDRE DE CORRECTION RECOMMANDÉ**

1. **Corriger les imports** (lignes 46-54)
2. **Corriger step1.customer** (3 occurrences)
3. **Corriger step1.cityFrom/cityTo** (3 occurrences)
4. **Corriger step1.productName** (3 occurrences)
5. **Corriger step3** (2 occurrences)
6. **Corriger step6** (2 occurrences)
7. **Corriger selectedHaulage** (8 occurrences)
8. **Corriger selectedSeafreight** (6 occurrences)
9. **Corriger loadDraftFromDatabase** (1 occurrence)
10. **Corriger les propriétés manquantes** (5 occurrences)

## 📝 **MÉTHODE DE CORRECTION**

1. **Utiliser Ctrl+F** pour trouver chaque pattern
2. **Remplacer une occurrence à la fois**
3. **Tester avec `npm run build`** après chaque correction
4. **Passer à l'étape suivante** seulement après avoir corrigé la précédente

## ⚠️ **NOTES IMPORTANTES**

- Toutes les corrections doivent respecter les types définis dans `DraftQuote.ts`
- Les propriétés de compatibilité doivent être maintenues
- Tester chaque correction individuellement pour éviter les régressions
- Vérifier que `loadDraftFromDatabase` fonctionne correctement après les corrections






