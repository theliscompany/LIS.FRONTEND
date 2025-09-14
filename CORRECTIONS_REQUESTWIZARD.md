# 🔧 Corrections Manuelles pour RequestWizard.tsx

## ❌ Erreurs de Linter à Corriger Manuellement

### **1. Ligne 1377 - Remplacer setDraftQuote par updateDraftQuoteSafely**

**Chercher :**
```typescript
    setDraftQuote({
      ...base,
      step2: {
        ...base.step2,
        selected: base.step2?.selected || []
      },
      // Optionnel : réinitialise certains champs si besoin (ex : commentaire, pièces jointes)
      marginType: 'percent' as const,
      // commentaire: '',
      // attachments: [],
    });
```

**Remplacer par :**
```typescript
    updateDraftQuoteSafely(prev => ({
      ...base,
      step2: {
        ...base.step2,
        selected: base.step2?.selected || []
      },
      // Optionnel : réinitialise certains champs si besoin (ex : commentaire, pièces jointes)
      marginType: 'percent' as const,
      // commentaire: '',
      // attachments: [],
    }));
```

### **2. Ligne 3446 - Remplacer setDraftQuote par updateDraftQuoteSafely**

**Chercher :**
```typescript
      setDraftQuote({
        step1: preservedStep1, // Préserver les données de step1
        step2: createInitialDraftQuote().step2,
        step3: { selectedContainers: { list: [] } },
        savedOptions: [],
        selectedHaulage: undefined,
        selectedSeafreights: [],
        selectedMiscellaneous: [],
        selectedContainers: {},
        marginType: 'percent',
        marginValue: 0,
        totalPrice: 0,
        haulageQuantity: 1,
        seafreightQuantities: {},
        miscQuantities: {},
        surchargeQuantities: {},
      });
```

**Remplacer par :**
```typescript
      updateDraftQuoteSafely(prev => ({
        step1: preservedStep1, // Préserver les données de step1
        step2: createInitialDraftQuote().step2,
        step3: { selectedContainers: { list: [] } },
        savedOptions: [],
        selectedHaulage: undefined,
        selectedSeafreights: [],
        selectedMiscellaneous: [],
        selectedContainers: {},
        marginType: 'percent',
        marginValue: 0,
        totalPrice: 0,
        haulageQuantity: 1,
        seafreightQuantities: {},
        miscQuantities: {},
        surchargeQuantities: {},
      }));
```

### **3. Ligne 3465 - Remplacer setDraftQuote par updateDraftQuoteSafely**

**Chercher :**
```typescript
      setDraftQuote({
        ...createInitialDraftQuote(),
        step1: preservedStep1, // Préserver les données de step1
      });
```

**Remplacer par :**
```typescript
      updateDraftQuoteSafely(prev => ({
        ...createInitialDraftQuote(),
        step1: preservedStep1, // Préserver les données de step1
      }));
```

## 🔧 Fonction Utilitaire Déjà Ajoutée

La fonction `updateDraftQuoteSafely` est déjà présente dans le fichier à la ligne 3414.

## 📝 Imports Déjà Vérifiés

Le type `DraftQuote` est déjà importé depuis `../types`.

## 🎯 Résultat Attendu

Après ces 3 corrections manuelles :
1. ✅ Plus d'erreurs de linter
2. ✅ Le SaveButton fonctionne correctement
3. ✅ La persistance des brouillons fonctionne
4. ✅ Le requestQuoteId est toujours préservé

## 🚀 Test de Validation

1. **Compiler le projet** : Plus d'erreurs TypeScript
2. **Tester le SaveButton** : Sauvegarde en base de données
3. **Vérifier la console** : Logs de sauvegarde réussie
4. **Confirmer la persistance** : Brouillon récupérable après rechargement

## 💡 Pourquoi Ces Corrections ?

Le problème est que `setDraftQuote` attend un objet `DraftQuote` complet, mais nous passons seulement des propriétés partielles. La fonction `updateDraftQuoteSafely` utilise le pattern `prev => ({ ...prev, ...updates })` qui préserve toutes les propriétés existantes (y compris `requestQuoteId`) tout en appliquant les mises à jour.
