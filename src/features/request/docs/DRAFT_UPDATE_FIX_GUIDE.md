# Guide de Correction - Mise à jour DraftQuote

## 🚨 **Problème identifié**
La mise à jour d'un DraftQuote existant ne fonctionnait pas car nous utilisions le mauvais type de données pour l'API.

## 🔍 **Cause du problème**

### **Avant (incorrect) :**
```typescript
// ❌ PROBLÈME : Utilisation de CreateDraftQuoteRequest pour la mise à jour
const apiDraft = mapDraftQuoteToApi(wizardState.draftQuote); // Retourne CreateDraftQuoteRequest

if (draftId) {
  // Mise à jour avec CreateDraftQuoteRequest (incorrect)
  const result = await updateMutation.mutateAsync({
    path: { id: draftId },
    body: apiDraft, // ❌ Type incorrect
  });
}
```

### **Types API :**
- **Création** : `CreateDraftQuoteRequest` (avec `requestQuoteId`)
- **Mise à jour** : `UpdateDraftQuoteRequest` (sans `requestQuoteId`, avec `options` et `notes`)

## ✅ **Solution implémentée**

### **1. Nouvelle fonction de mapping**
```typescript
// ✅ NOUVEAU : Mapping spécifique pour la mise à jour
export const mapDraftQuoteToUpdateApi = (draftQuote: Partial<DraftQuote>): UpdateDraftQuoteRequest => {
  return {
    customer: draftQuote.customer,
    shipment: draftQuote.shipment,
    wizard: draftQuote.wizard,
    options: draftQuote.options || null,
    notes: draftQuote.wizard?.notes || null,
  };
};
```

### **2. Utilisation conditionnelle du bon mapping**
```typescript
// ✅ CORRIGÉ : Utilisation du bon mapping selon le cas
if (draftId) {
  // Mise à jour avec UpdateDraftQuoteRequest
  const updateApiDraft = mapDraftQuoteToUpdateApi(wizardState.draftQuote);
  const result = await updateMutation.mutateAsync({
    path: { id: draftId },
    body: updateApiDraft, // ✅ Type correct
  });
} else {
  // Création avec CreateDraftQuoteRequest
  const createApiDraft = mapDraftQuoteToApi(wizardState.draftQuote);
  const result = await createMutation.mutateAsync({
    body: createApiDraft, // ✅ Type correct
  });
}
```

## 🔧 **Fichiers modifiés**

### **1. `draftQuoteService.ts`**
- ✅ Ajout de `mapDraftQuoteToUpdateApi`
- ✅ Import de `UpdateDraftQuoteRequest`

### **2. `RequestWizard.tsx`**
- ✅ Import de `mapDraftQuoteToUpdateApi`
- ✅ Utilisation conditionnelle du bon mapping
- ✅ Logs détaillés pour le debug

### **3. `SaveDraftTest.tsx`**
- ✅ Mise à jour pour utiliser le bon mapping
- ✅ Test séparé pour création et mise à jour

## 🧪 **Comment tester**

### **Test 1 : Création d'un nouveau brouillon**
1. Ouvrir le wizard sans `draftId`
2. Remplir quelques informations
3. Cliquer sur "Tester la sauvegarde"
4. Vérifier les logs : `CreateDraftQuoteRequest`

### **Test 2 : Mise à jour d'un brouillon existant**
1. Ouvrir le wizard avec un `draftId` existant
2. Modifier quelques informations
3. Cliquer sur "Tester la sauvegarde"
4. Vérifier les logs : `UpdateDraftQuoteRequest`

## 📊 **Logs à surveiller**

### **Pour la mise à jour :**
```
🔄 [SAVE_DRAFT] Mise à jour du brouillon existant: [ID]
🔄 [SAVE_DRAFT] Conversion vers UpdateDraftQuoteRequest...
✅ [SAVE_DRAFT] Conversion UpdateDraftQuoteRequest réussie: {...}
✅ [SAVE_DRAFT] Mise à jour réussie: {...}
```

### **Pour la création :**
```
🆕 [SAVE_DRAFT] Création d'un nouveau brouillon
🔄 [SAVE_DRAFT] Conversion vers CreateDraftQuoteRequest...
✅ [SAVE_DRAFT] Conversion CreateDraftQuoteRequest réussie: {...}
✅ [SAVE_DRAFT] Création réussie: {...}
```

## 🎯 **Différences clés entre les types**

| Propriété | CreateDraftQuoteRequest | UpdateDraftQuoteRequest |
|-----------|------------------------|-------------------------|
| `requestQuoteId` | ✅ Requis | ❌ Absent |
| `customer` | ✅ | ✅ |
| `shipment` | ✅ | ✅ |
| `wizard` | ✅ | ✅ |
| `options` | ❌ Absent | ✅ Optionnel |
| `notes` | ❌ Absent | ✅ Optionnel |

## ✅ **Résultat attendu**

- ✅ **Création** : Fonctionne avec `CreateDraftQuoteRequest`
- ✅ **Mise à jour** : Fonctionne avec `UpdateDraftQuoteRequest`
- ✅ **Logs détaillés** : Pour diagnostiquer les problèmes
- ✅ **Test isolé** : Composant `SaveDraftTest` pour valider

La mise à jour des DraftQuote existants devrait maintenant fonctionner correctement ! 🎉
