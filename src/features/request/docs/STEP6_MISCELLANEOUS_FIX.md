# Correction du problème Step 6 Miscellaneous

## 🐛 Problème identifié

Le Step 6 (Miscellaneous) ne sauvegardait pas correctement les services sélectionnés et ne les transmettait pas au Step 7 (Récapitulatif) à cause d'une erreur dans la fonction `updateStep6` du `RequestWizard.tsx`.

## ✅ Corrections apportées

### **1. Correction de la fonction updateStep6 dans RequestWizard.tsx**

**AVANT (incorrect) :**
```typescript
const updateStep6 = useCallback((data: any) => {
  updateDraftQuote({
    wizard: { ...wizardState.draftQuote?.wizard, ...data }  // ❌ ERREUR
  });
}, [updateDraftQuote, wizardState.draftQuote]);
```

**APRÈS (corrigé) :**
```typescript
const updateStep6 = useCallback((data: any) => {
  console.log('🔧 [WIZARD] updateStep6 appelé avec:', data);
  updateDraftQuote({
    step6: data  // ✅ CORRECTION : step6 au lieu de wizard
  } as any);
}, [updateDraftQuote]);
```

### **2. Ajout de logs de debug**

#### **Dans Step6MiscellaneousSelection.tsx :**
- Log lors de l'envoi des données step6
- Log lors de la synchronisation avec draftQuote.step6
- Log lors de la conversion des services

#### **Dans RequestWizard.tsx :**
- Log dans updateStep6 pour tracer les données reçues

#### **Dans Step7Recap.tsx :**
- Log dans calculatedMiscellaneousServices pour tracer les données reçues

### **3. Structure des données maintenue**

La structure des données envoyées par Step6MiscellaneousSelection est correcte et conforme au format `DraftQuote` :

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

## 🔄 Flux de données corrigé

```
Step6MiscellaneousSelection
    ↓ (onStep6Update avec step6Data)
RequestWizard.updateStep6
    ↓ (updateDraftQuote avec { step6: data })
draftQuote.step6
    ↓ (props)
Step7Recap
    ↓ (calculatedMiscellaneousServices)
Affichage des services dans le récapitulatif
```

## 🧪 Tests à effectuer

### **1. Test de sélection de services**

1. Aller au Step 6 (Miscellaneous)
2. Sélectionner un ou plusieurs services
3. Vérifier dans la console les logs :
   - `🔧 [STEP6] Envoi des données step6:`
   - `🔧 [WIZARD] updateStep6 appelé avec:`

### **2. Test de navigation vers Step 7**

1. Après avoir sélectionné des services au Step 6
2. Aller au Step 7 (Récapitulatif)
3. Vérifier que les services apparaissent dans le récapitulatif
4. Vérifier que les totaux sont calculés correctement

### **3. Test de retour au Step 6**

1. Aller au Step 7
2. Revenir au Step 6
3. Vérifier que les services sélectionnés sont toujours affichés

## 📋 Checklist de validation

- [x] Correction de la fonction updateStep6
- [x] Ajout de logs de debug
- [x] Structure des données maintenue
- [x] Flux de données corrigé
- [ ] Test de sélection de services
- [ ] Test de navigation vers Step 7
- [ ] Test de retour au Step 6
- [ ] Vérification des totaux

## 🎯 Résultat attendu

Après ces corrections, le Step 6 Miscellaneous devrait :

1. ✅ **Sauvegarder** correctement les services sélectionnés dans `draftQuote.step6`
2. ✅ **Transmettre** les données au Step 7 (Récapitulatif)
3. ✅ **Afficher** les services dans le récapitulatif
4. ✅ **Calculer** correctement les totaux
5. ✅ **Persister** les données lors de la navigation entre les étapes

## 🔧 Debug en cas de problème

Si le problème persiste, utiliser les logs de debug pour identifier où le flux se casse :

1. **Pas de log `🔧 [STEP6] Envoi des données step6:`** → Problème dans la sélection
2. **Pas de log `🔧 [WIZARD] updateStep6 appelé avec:`** → Problème dans onStep6Update
3. **Pas de log `🔧 [STEP7] Services divers calculés:`** → Problème dans la transmission
4. **Logs présents mais pas d'affichage** → Problème dans le rendu

Les logs permettront de localiser précisément le problème dans le flux de données.
