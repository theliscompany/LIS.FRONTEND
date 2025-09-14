# 🔧 CORRECTIONS DES ERREURS DE LINTER - RequestWizard.tsx

## 📋 **ERREURS IDENTIFIÉES ET SOLUTIONS**

### **1. Propriétés manquantes dans `step1.customer`**
**Problème :** `customer` manque `companyName` et `email`
**Solution :** Ajouter les propriétés manquantes

```typescript
// ❌ AVANT (ligne 1364, 1496, 3116)
customer: request.customerId ? { contactId: request.customerId, contactName: request.companyName } : undefined,

// ✅ APRÈS
customer: request.customerId ? { 
  contactId: request.customerId, 
  contactName: request.companyName, 
  companyName: request.companyName || '', 
  email: '' 
} : undefined,
```

### **2. Propriétés manquantes dans `step1.cityFrom` et `step1.cityTo`**
**Problème :** `cityName` n'existe pas dans le type `City`
**Solution :** Supprimer `cityName` et garder seulement `name`

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

### **3. Propriétés manquantes dans `step1.productName`**
**Problème :** `productName` manque `productId`
**Solution :** Ajouter `productId`

```typescript
// ❌ AVANT
productName: { productName: 'DEBUG PRODUCT' },

// ✅ APRÈS
productName: { productId: 0, productName: 'DEBUG PRODUCT' },
```

### **4. Propriétés manquantes dans `step3`**
**Problème :** `step3` manque `containers`, `summary`, `route`
**Solution :** Ajouter les propriétés manquantes

```typescript
// ❌ AVANT
step3: { selectedContainers: { list: [] } },

// ✅ APRÈS
step3: { 
  containers: [],
  summary: { totalContainers: 0, totalTEU: 0, containerTypes: [] },
  route: { origin: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } }, destination: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } } },
  selectedContainers: { list: [] } 
},
```

### **5. Propriétés manquantes dans `step6`**
**Problème :** `step6` manque `selections`, `summary`
**Solution :** Ajouter les propriétés manquantes

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

### **6. Propriétés manquantes dans `selectedHaulage`**
**Problème :** Plusieurs propriétés n'existent pas dans le type `SelectedHaulage`
**Solution :** Utiliser les bonnes propriétés du type

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

### **7. Propriétés manquantes dans `selectedSeafreight`**
**Problème :** Plusieurs propriétés n'existent pas dans le type `SelectedSeafreight`
**Solution :** Utiliser les bonnes propriétés du type

```typescript
// ❌ AVANT
seaFreightId: draftQuote.selectedSeafreights[0].seaFreightId,
carrierName: draftQuote.selectedSeafreights[0].carrierName,

// ✅ APRÈS
seafreightId: draftQuote.selectedSeafreights[0].seafreightId,
carrierName: draftQuote.selectedSeafreights[0].carrier?.name || '',
```

### **8. Appel à `loadDraftFromDatabase`**
**Problème :** La fonction attend 2 arguments mais reçoit 1
**Solution :** Vérifier la signature de la fonction dans `DraftQuote.ts`

## 🚀 **PLAN DE CORRECTION**

1. **Corriger les types de `step1`** (customer, cityFrom, cityTo, productName)
2. **Corriger les types de `step3`** (ajouter containers, summary, route)
3. **Corriger les types de `step6`** (ajouter selections, summary)
4. **Corriger les propriétés de `selectedHaulage`** (utiliser tariff.*)
5. **Corriger les propriétés de `selectedSeafreight`** (utiliser les bonnes propriétés)
6. **Vérifier la signature de `loadDraftFromDatabase`**

## 📝 **NOTES IMPORTANTES**

- Toutes les corrections doivent respecter les types définis dans `DraftQuote.ts`
- Les propriétés de compatibilité doivent être maintenues
- Tester chaque correction individuellement pour éviter les régressions

