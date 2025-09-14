# 🔧 GUIDE DE CORRECTION ÉTAPE PAR ÉTAPE - RequestWizard.tsx

## 📋 **COMMANDES EXACTES À EXÉCUTER**

### **ÉTAPE 1 : Corriger les imports (lignes 46-54)**

**Rechercher avec Ctrl+F :**
```
from '../types';
```

**Remplacer par :**
```
from '../types/DraftQuote';
```

---

### **ÉTAPE 2 : Corriger step1.customer (3 occurrences)**

**Rechercher avec Ctrl+F :**
```
customer: request.customerId ? { contactId: request.customerId, contactName: request.companyName } : undefined,
```

**Remplacer par :**
```
customer: request.customerId ? { 
  contactId: request.customerId, 
  contactName: request.companyName, 
  companyName: request.companyName || '', 
  email: '' 
} : undefined,
```

**Faire cette correction pour les 3 occurrences (lignes 1365, 1497, 3117)**

---

### **ÉTAPE 3 : Corriger step1.cityFrom (3 occurrences)**

**Rechercher avec Ctrl+F :**
```
cityName: request.pickupLocation.city,
```

**Supprimer cette ligne et garder seulement :**
```
name: request.pickupLocation.city,
```

**Faire cette correction pour les 3 occurrences**

---

### **ÉTAPE 4 : Corriger step1.cityTo (3 occurrences)**

**Rechercher avec Ctrl+F :**
```
cityName: request.deliveryLocation.city,
```

**Supprimer cette ligne et garder seulement :**
```
name: request.deliveryLocation.city,
```

**Faire cette correction pour les 3 occurrences**

---

### **ÉTAPE 5 : Corriger step1.productName (3 occurrences)**

**Rechercher avec Ctrl+F :**
```
productName: { productName: 'DEBUG PRODUCT' },
```

**Remplacer par :**
```
productName: { productId: 0, productName: 'DEBUG PRODUCT' },
```

**Faire cette correction pour les 3 occurrences**

---

### **ÉTAPE 6 : Corriger step3 (2 occurrences)**

**Rechercher avec Ctrl+F :**
```
step3: { selectedContainers: { list: [] } },
```

**Remplacer par :**
```
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

**Faire cette correction pour les 2 occurrences**

---

### **ÉTAPE 7 : Corriger step6 (2 occurrences)**

**Rechercher avec Ctrl+F :**
```
step6: {
  selectedMiscellaneous: mappedForLocal,
  completed: mappedForLocal.length > 0
}
```

**Remplacer par :**
```
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

**Faire cette correction pour les 2 occurrences**

---

### **ÉTAPE 8 : Corriger selectedHaulage (8 occurrences)**

**Rechercher avec Ctrl+F :**
```
unitTariff: draftQuote.selectedHaulage.unitTariff,
```

**Remplacer par :**
```
unitTariff: draftQuote.selectedHaulage.tariff?.unitPrice || 0,
```

**Rechercher avec Ctrl+F :**
```
currency: draftQuote.selectedHaulage.currency,
```

**Remplacer par :**
```
currency: draftQuote.selectedHaulage.tariff?.currency || 'EUR',
```

**Rechercher avec Ctrl+F :**
```
freeTime: draftQuote.selectedHaulage.freeTime,
```

**Remplacer par :**
```
freeTime: draftQuote.selectedHaulage.tariff?.freeTime || 0,
```

**Faire ces corrections pour toutes les occurrences**

---

### **ÉTAPE 9 : Corriger selectedSeafreight (6 occurrences)**

**Rechercher avec Ctrl+F :**
```
seaFreightId: draftQuote.selectedSeafreights[0].seaFreightId,
```

**Remplacer par :**
```
seafreightId: draftQuote.selectedSeafreights[0].seafreightId,
```

**Rechercher avec Ctrl+F :**
```
carrierName: draftQuote.selectedSeafreights[0].carrierName,
```

**Remplacer par :**
```
carrierName: draftQuote.selectedSeafreights[0].carrier?.name || '',
```

**Faire ces corrections pour toutes les occurrences**

---

### **ÉTAPE 10 : Corriger loadDraftFromDatabase (1 occurrence)**

**Ligne 2509 - Vérifier la signature :**
- Si la fonction attend 2 arguments, garder : `loadDraftFromDatabase(parsedData, prev)`
- Si la fonction n'attend qu'1 argument, changer en : `loadDraftFromDatabase(parsedData)`

---

### **ÉTAPE 11 : Corriger les propriétés manquantes (5 occurrences)**

**Rechercher avec Ctrl+F :**
```
totalContainers: draftQuote.totalContainers || 0,
```

**Remplacer par :**
```
totalContainers: draftQuote.step3?.summary?.totalContainers || 0,
```

**Rechercher avec Ctrl+F :**
```
containerTypes: draftQuote.containerTypes || [],
```

**Remplacer par :**
```
containerTypes: draftQuote.step3?.summary?.containerTypes || [],
```

**Rechercher avec Ctrl+F :**
```
currentStep: draftQuote.currentStep,
```

**Remplacer par :**
```
currentStep: activeStep,
```

**Faire ces corrections pour toutes les occurrences**

---

## 🚀 **ORDRE DE CORRECTION RECOMMANDÉ**

1. **Étape 1** : Imports (1 occurrence)
2. **Étape 2** : step1.customer (3 occurrences)
3. **Étape 3** : step1.cityFrom (3 occurrences)
4. **Étape 4** : step1.cityTo (3 occurrences)
5. **Étape 5** : step1.productName (3 occurrences)
6. **Étape 6** : step3 (2 occurrences)
7. **Étape 7** : step6 (2 occurrences)
8. **Étape 8** : selectedHaulage (8 occurrences)
9. **Étape 9** : selectedSeafreight (6 occurrences)
10. **Étape 10** : loadDraftFromDatabase (1 occurrence)
11. **Étape 11** : Propriétés manquantes (5 occurrences)

---

## 📝 **MÉTHODE DE CORRECTION**

1. **Ouvrir `RequestWizard.tsx`**
2. **Utiliser Ctrl+F** pour rechercher chaque pattern
3. **Remplacer une occurrence à la fois**
4. **Tester avec `npm run build`** après chaque correction
5. **Passer à l'étape suivante**

---

## ⚠️ **NOTES IMPORTANTES**

- Toutes les corrections doivent respecter les types définis dans `DraftQuote.ts`
- Les propriétés de compatibilité doivent être maintenues
- Tester chaque correction individuellement pour éviter les régressions
- Vérifier que `loadDraftFromDatabase` fonctionne correctement après les corrections

---

## 🔍 **COMMENT PROCÉDER**

1. **Suivre ce guide étape par étape**
2. **Utiliser Ctrl+F** pour rechercher chaque pattern
3. **Remplacer une occurrence à la fois**
4. **Tester avec `npm run build`**
5. **Passer à l'étape suivante**






