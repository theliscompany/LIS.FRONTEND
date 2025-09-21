# Guide de Debug - Step 6 Miscellaneous

## 🐛 Problème identifié

Le Step 6 (Miscellaneous) ne sauvegarde pas correctement les services sélectionnés et ne les transmet pas au Step 7 (Récapitulatif).

## 🔍 Points de vérification

### **1. Vérifier la fonction updateStep6 dans RequestWizard**

```typescript
// ✅ CORRIGÉ : Sauvegarde dans step6 au lieu de wizard
const updateStep6 = useCallback((data: any) => {
  console.log('🔧 [WIZARD] updateStep6 appelé avec:', data);
  updateDraftQuote({
    step6: data  // ← CORRECTION : step6 au lieu de wizard
  } as any);
}, [updateDraftQuote]);
```

### **2. Vérifier la structure des données envoyées**

Le Step6MiscellaneousSelection envoie cette structure :

```typescript
const step6Data = {
  selections: newSelected.map(service => ({
    id: service.id || `misc-${service.serviceProviderId || service.serviceId}`,
    service: {
      serviceId: service.serviceProviderId || service.serviceId,
      serviceName: service.serviceName,
      category: service.category || 'Other'
    },
    supplier: {
      supplierName: service.serviceProviderName
    },
    pricing: {
      unitPrice: service.pricing?.basePrice || 0,
      quantity: service.quantity || 1,
      subtotal: (service.pricing?.basePrice || 0) * (service.quantity || 1),
      currency: service.currency || 'EUR'
    },
    validity: {
      validUntil: service.validity?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    remarks: service.remarks || '',
    isSelected: true,
    selectedAt: new Date()
  })),
  summary: {
    totalSelections: newSelected.length,
    totalAmount: miscTotal,
    currency: 'EUR',
    categories: [...new Set(newSelected.map(s => s.category || 'Other'))]
  }
};
```

### **3. Vérifier la réception dans Step7Recap**

Le Step7Recap utilise :

```typescript
const miscServices = draftQuote?.step6?.selections || draftQuote?.selectedMiscellaneous || [];
```

## 🔧 Logs de debug ajoutés

### **Dans Step6MiscellaneousSelection.tsx :**

1. **Lors de l'envoi des données :**
```typescript
console.log('🔧 [STEP6] Envoi des données step6:', {
  step6Data,
  newSelectedCount: newSelected.length,
  miscTotal
});
```

2. **Lors de la synchronisation :**
```typescript
console.log('🔧 [STEP6] Synchronisation avec draftQuote.step6:', {
  step6Selections: draftQuote?.step6?.selections,
  step6Length: draftQuote?.step6?.selections?.length,
  currentSelected: selected.length
});
```

### **Dans RequestWizard.tsx :**

```typescript
console.log('🔧 [WIZARD] updateStep6 appelé avec:', data);
```

### **Dans Step7Recap.tsx :**

```typescript
console.log('🔧 [STEP7] Services divers calculés:', {
  step6Selections: draftQuote?.step6?.selections,
  selectedMiscellaneous: draftQuote?.selectedMiscellaneous,
  miscServices,
  count: miscServices.length
});
```

## 🧪 Tests à effectuer

### **1. Test de sélection d'un service**

1. Aller au Step 6 (Miscellaneous)
2. Sélectionner un service
3. Vérifier dans la console :
   - `🔧 [STEP6] Envoi des données step6:` doit apparaître
   - `🔧 [WIZARD] updateStep6 appelé avec:` doit apparaître
   - Les données doivent être correctes

### **2. Test de navigation vers Step 7**

1. Après avoir sélectionné des services au Step 6
2. Aller au Step 7 (Récapitulatif)
3. Vérifier dans la console :
   - `🔧 [STEP7] Services divers calculés:` doit apparaître
   - Les services doivent être affichés dans le récapitulatif

### **3. Test de retour au Step 6**

1. Aller au Step 7
2. Revenir au Step 6
3. Vérifier que les services sélectionnés sont toujours affichés

## 🚨 Problèmes possibles

### **1. Données non sauvegardées**

**Symptôme :** Les logs `🔧 [WIZARD] updateStep6 appelé avec:` n'apparaissent pas

**Cause :** `onStep6Update` n'est pas appelé

**Solution :** Vérifier que `onStep6Update` est bien passé en prop

### **2. Données sauvegardées mais non transmises**

**Symptôme :** Les logs du wizard apparaissent mais pas ceux du Step 7

**Cause :** `draftQuote.step6` n'est pas mis à jour

**Solution :** Vérifier `updateDraftQuote` dans RequestWizard

### **3. Données transmises mais non affichées**

**Symptôme :** Les logs du Step 7 montrent des données mais l'affichage est vide

**Cause :** Problème dans le calcul des totaux ou l'affichage

**Solution :** Vérifier la structure des données dans `calculatedMiscellaneousServices`

## 🔄 Flux de données attendu

```
Step6MiscellaneousSelection
    ↓ (onStep6Update)
RequestWizard.updateStep6
    ↓ (updateDraftQuote)
draftQuote.step6
    ↓ (props)
Step7Recap
    ↓ (calculatedMiscellaneousServices)
Affichage des services
```

## 📋 Checklist de debug

- [ ] Les services sont-ils sélectionnés au Step 6 ?
- [ ] Les logs `🔧 [STEP6] Envoi des données step6:` apparaissent-ils ?
- [ ] Les logs `🔧 [WIZARD] updateStep6 appelé avec:` apparaissent-ils ?
- [ ] Les données sont-elles correctes dans les logs ?
- [ ] Les logs `🔧 [STEP7] Services divers calculés:` apparaissent-ils ?
- [ ] Les services sont-ils affichés au Step 7 ?
- [ ] Les totaux sont-ils calculés correctement ?

## 🎯 Solution attendue

Une fois les corrections appliquées, le flux devrait fonctionner ainsi :

1. **Sélection** : L'utilisateur sélectionne des services au Step 6
2. **Sauvegarde** : Les données sont sauvegardées dans `draftQuote.step6`
3. **Transmission** : Les données sont transmises au Step 7
4. **Affichage** : Les services apparaissent dans le récapitulatif
5. **Calculs** : Les totaux sont calculés correctement

Les logs de debug permettront d'identifier exactement où le problème se situe dans ce flux.
