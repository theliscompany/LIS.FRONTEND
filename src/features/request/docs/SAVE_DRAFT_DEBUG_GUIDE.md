# Guide de Diagnostic - Plantage de la Sauvegarde DraftQuote

## 🚨 **Problème identifié**
La sauvegarde du DraftQuote plante l'application.

## 🔧 **Corrections apportées**

### **1. Logs de debug ajoutés**
- **Début de sauvegarde** : État initial du brouillon
- **Validation** : Vérification des données
- **Conversion** : Transformation vers le format API
- **Mutations API** : Création/mise à jour avec gestion d'erreur
- **Sauvegarde options** : Gestion des options

### **2. Gestion d'erreur améliorée**
- **Try/catch** autour de chaque mutation API
- **Logs détaillés** pour chaque étape
- **Propagation d'erreur** contrôlée

### **3. Composant de test**
- **SaveDraftTest** : Test isolé de la sauvegarde
- **Validation** : Test de chaque étape séparément
- **Debug** : Logs détaillés dans la console

## 🧪 **Comment diagnostiquer**

### **Étape 1 : Utiliser le composant de test**
1. **Ouvrir** le wizard en mode développement
2. **Aller** au panel de debug en bas
3. **Cliquer** sur "Tester la sauvegarde"
4. **Vérifier** les logs dans la console

### **Étape 2 : Analyser les logs**
Recherchez ces messages dans la console :

```
🚀 [SAVE_DRAFT] Début de la sauvegarde
🚀 [SAVE_DRAFT] État actuel: {...}
🔍 [SAVE_DRAFT] Validation des données...
✅ [SAVE_DRAFT] Validation réussie
🔄 [SAVE_DRAFT] Conversion vers le format API...
✅ [SAVE_DRAFT] Conversion réussie: {...}
🆕 [SAVE_DRAFT] Création d'un nouveau brouillon
✅ [SAVE_DRAFT] Création réussie: {...}
```

### **Étape 3 : Identifier l'étape qui plante**
- **Validation** : Problème avec `validateDraftQuote`
- **Conversion** : Problème avec `mapDraftQuoteToApi`
- **Création** : Problème avec `createMutation.mutateAsync`
- **Mise à jour** : Problème avec `updateMutation.mutateAsync`
- **Options** : Problème avec `addOptionMutation.mutateAsync`

## 🔍 **Causes possibles**

### **1. Problème de validation**
```typescript
const validation = validateDraftQuote(wizardState.draftQuote);
if (!validation.isValid) {
  // Erreurs de validation
}
```

### **2. Problème de conversion**
```typescript
const apiDraft = mapDraftQuoteToApi(wizardState.draftQuote);
```

### **3. Problème d'API**
- **Endpoint** non disponible
- **Format** de données incorrect
- **Authentification** manquante
- **Réseau** défaillant

### **4. Problème de structure**
- **DraftQuote** mal formé
- **Propriétés** manquantes
- **Types** incorrects

## 🛠️ **Solutions**

### **Solution 1 : Vérifier la validation**
```typescript
// Ajouter des logs de validation
console.log('🔍 [SAVE_DRAFT] DraftQuote à valider:', wizardState.draftQuote);
const validation = validateDraftQuote(wizardState.draftQuote);
console.log('🔍 [SAVE_DRAFT] Résultat validation:', validation);
```

### **Solution 2 : Vérifier la conversion**
```typescript
// Ajouter des logs de conversion
console.log('🔄 [SAVE_DRAFT] DraftQuote avant conversion:', wizardState.draftQuote);
const apiDraft = mapDraftQuoteToApi(wizardState.draftQuote);
console.log('🔄 [SAVE_DRAFT] API Draft après conversion:', apiDraft);
```

### **Solution 3 : Vérifier l'API**
```typescript
// Tester l'API directement
try {
  const result = await createMutation.mutateAsync({
    body: apiDraft,
  });
  console.log('✅ [SAVE_DRAFT] API Response:', result);
} catch (error) {
  console.error('❌ [SAVE_DRAFT] API Error:', error);
  console.error('❌ [SAVE_DRAFT] Error details:', {
    message: error.message,
    stack: error.stack,
    response: error.response
  });
}
```

## 📊 **Logs à surveiller**

### **Logs de succès :**
```
🚀 [SAVE_DRAFT] Début de la sauvegarde
✅ [SAVE_DRAFT] Validation réussie
✅ [SAVE_DRAFT] Conversion réussie
✅ [SAVE_DRAFT] Création réussie
✅ [WIZARD] Brouillon sauvegardé avec succès
```

### **Logs d'erreur :**
```
❌ [SAVE_DRAFT] Conditions non remplies pour la sauvegarde
❌ [SAVE_DRAFT] Validation failed: [...]
❌ [SAVE_DRAFT] Erreur lors de la création: [...]
❌ [WIZARD] Erreur lors de la sauvegarde: [...]
```

## 🎯 **Prochaines étapes**

1. **Tester** avec le composant SaveDraftTest
2. **Analyser** les logs dans la console
3. **Identifier** l'étape qui plante
4. **Corriger** le problème spécifique
5. **Valider** la correction

## 📝 **Notes**

- **Mode développement** : Les logs sont visibles uniquement en mode dev
- **Console** : Ouvrir les outils de développement (F12)
- **Réseau** : Vérifier l'onglet Network pour les requêtes API
- **Erreurs** : Vérifier l'onglet Console pour les erreurs JavaScript

Maintenant, testez la sauvegarde et analysez les logs pour identifier la cause exacte du plantage ! 🔍
