# Guide de Correction - Options avec ID vide dans le payload PUT

## 🚨 **Problème identifié**
Les options dans le payload PUT avaient des `optionId` vides car elles étaient prises depuis `draftQuote.options` au lieu de `savedOptions`.

## 🔍 **Cause du problème**

### **Avant (incorrect) :**
```typescript
// ❌ PROBLÈME : Utilisation de draftQuote.options (IDs vides)
export const mapDraftQuoteToUpdateApi = (draftQuote: Partial<DraftQuote>): UpdateDraftQuoteRequest => {
  return {
    customer: draftQuote.customer,
    shipment: draftQuote.shipment,
    wizard: draftQuote.wizard,
    options: draftQuote.options || null, // ❌ IDs vides
    notes: draftQuote.wizard?.notes || null,
  };
};
```

### **Flux de données :**
1. **Options créées** → `savedOptions` (avec vrais IDs)
2. **Options sauvegardées** → `draftQuote.options` (IDs vides)
3. **Payload PUT** → Utilisait `draftQuote.options` ❌

## ✅ **Solution implémentée**

### **1. Fonction de mapping mise à jour**
```typescript
// ✅ CORRIGÉ : Utilisation de savedOptions (vrais IDs)
export const mapDraftQuoteToUpdateApi = (
  draftQuote: Partial<DraftQuote>, 
  savedOptions?: DraftQuoteOption[]
): UpdateDraftQuoteRequest => {
  return {
    customer: draftQuote.customer,
    shipment: draftQuote.shipment,
    wizard: draftQuote.wizard,
    options: savedOptions && savedOptions.length > 0 ? savedOptions : (draftQuote.options || null),
    notes: draftQuote.wizard?.notes || null,
  };
};
```

### **2. Utilisation dans RequestWizard**
```typescript
// ✅ CORRIGÉ : Passage des savedOptions
const updateApiDraft = mapDraftQuoteToUpdateApi(wizardState.draftQuote, savedOptions);
```

### **3. Modal de debug mis à jour**
```typescript
// ✅ CORRIGÉ : Affichage des options avec vrais IDs
{JSON.stringify(mapDraftQuoteToUpdateApi(wizardState.draftQuote, savedOptions), null, 2)}
```

## 🔧 **Fichiers modifiés**

### **1. `draftQuoteService.ts`**
- ✅ Ajout du paramètre `savedOptions` à `mapDraftQuoteToUpdateApi`
- ✅ Priorité aux `savedOptions` si disponibles

### **2. `RequestWizard.tsx`**
- ✅ Passage des `savedOptions` à `mapDraftQuoteToUpdateApi`
- ✅ Mise à jour du modal de debug
- ✅ Mise à jour de la fonction `handleDebug`

### **3. `SaveDraftTest.tsx`**
- ✅ Ajout du paramètre `savedOptions`
- ✅ Utilisation des `savedOptions` dans le test

## 📊 **Différence dans le payload**

### **Avant (incorrect) :**
```json
{
  "options": [
    {
      "optionId": null,  // ❌ ID vide
      "label": "Option 1",
      "currency": "EUR",
      // ...
    }
  ]
}
```

### **Après (correct) :**
```json
{
  "options": [
    {
      "optionId": "option-123-456",  // ✅ Vrai ID
      "label": "Option 1",
      "currency": "EUR",
      // ...
    }
  ]
}
```

## 🎯 **Logique de priorité**

### **Ordre de priorité pour les options :**
1. **`savedOptions`** (si disponibles et non vides) - **Priorité 1**
2. **`draftQuote.options`** (fallback) - **Priorité 2**
3. **`null`** (si aucune option) - **Priorité 3**

### **Code de priorité :**
```typescript
options: savedOptions && savedOptions.length > 0 
  ? savedOptions                    // ✅ Priorité 1
  : (draftQuote.options || null)    // ✅ Priorité 2/3
```

## 🧪 **Comment tester**

### **Test 1 : Options sans ID**
1. Créer une option dans le wizard
2. Ouvrir le modal de debug
3. Vérifier que le payload PUT contient des `optionId` vides
4. **Résultat attendu** : `optionId: null`

### **Test 2 : Options avec ID**
1. Créer une option dans le wizard
2. Sauvegarder le brouillon (cela crée les IDs)
3. Ouvrir le modal de debug
4. Vérifier que le payload PUT contient des `optionId` valides
5. **Résultat attendu** : `optionId: "option-123-456"`

### **Test 3 : Pas d'options**
1. Ne créer aucune option
2. Ouvrir le modal de debug
3. Vérifier que le payload PUT contient `options: null`
4. **Résultat attendu** : `options: null`

## 🔍 **Vérification dans les logs**

### **Logs à surveiller :**
```
🔄 [SAVE_DRAFT] Conversion UpdateDraftQuoteRequest réussie: {
  "options": [
    {
      "optionId": "option-123-456",  // ✅ Vrai ID
      "label": "Option 1",
      // ...
    }
  ]
}
```

### **Logs d'erreur (avant correction) :**
```
🔄 [SAVE_DRAFT] Conversion UpdateDraftQuoteRequest réussie: {
  "options": [
    {
      "optionId": null,  // ❌ ID vide
      "label": "Option 1",
      // ...
    }
  ]
}
```

## ✅ **Résultat attendu**

- ✅ **Options avec vrais IDs** dans le payload PUT
- ✅ **Modal de debug** affiche les bonnes options
- ✅ **Sauvegarde** fonctionne correctement
- ✅ **Tests** passent avec les vrais IDs

Le problème des options avec ID vide dans le payload PUT est maintenant résolu ! 🎉
