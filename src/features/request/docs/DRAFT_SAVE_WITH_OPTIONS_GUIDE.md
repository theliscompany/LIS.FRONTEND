# Guide - Sauvegarde des brouillons avec options

## ✅ **Fonctionnalité implémentée**

Vous pouvez maintenant **sauvegarder un brouillon avec ses options** ! Cette fonctionnalité a été ajoutée pour résoudre le problème de persistance des options.

## 🎯 **Comment ça fonctionne**

### **1. Sauvegarde automatique des options**
Quand vous sauvegardez un brouillon (manuellement ou automatiquement), **toutes les options créées sont automatiquement sauvegardées** avec le brouillon.

### **2. Chargement automatique des options**
Quand vous ouvrez un brouillon existant, **toutes les options sont automatiquement chargées** et affichées dans l'onglet "Options".

### **3. Synchronisation bidirectionnelle**
- **Frontend → API** : Les options sont sauvegardées via l'API
- **API → Frontend** : Les options sont récupérées et affichées

## 🔧 **Modifications techniques apportées**

### **1. Fonction `saveDraft` améliorée**
```typescript
// ✅ NOUVEAU : Sauvegarder les options si elles existent
if (draftId && savedOptions.length > 0) {
  console.log('💾 [SAVE_DRAFT] Sauvegarde des options:', savedOptions.length);
  
  // Sauvegarder chaque option
  for (const option of savedOptions) {
    try {
      await addOptionMutation.mutateAsync({
        path: { id: draftId },
        body: { option: option },
      });
      console.log('✅ [SAVE_DRAFT] Option sauvegardée:', option.optionId);
    } catch (error) {
      console.error('❌ [SAVE_DRAFT] Erreur sauvegarde option:', error);
      // Continue avec les autres options même si une échoue
    }
  }
}
```

### **2. Fonction `loadExistingOptions` ajoutée**
```typescript
const loadExistingOptions = useCallback(async (draftId: string) => {
  if (!draftId) return;
  
  try {
    setIsLoadingOptions(true);
    console.log('📥 [LOAD_OPTIONS] Chargement des options pour le brouillon:', draftId);
    
    // Récupérer le brouillon complet avec ses options
    const result = await refetchDraft();
    if (result.data) {
      const draftWithOptions = mapDraftQuoteFromApi(result.data as any);
      if (draftWithOptions.options && draftWithOptions.options.length > 0) {
        setSavedOptions(draftWithOptions.options);
        console.log('✅ [LOAD_OPTIONS] Options chargées:', draftWithOptions.options.length);
      } else {
        setSavedOptions([]);
        console.log('ℹ️ [LOAD_OPTIONS] Aucune option trouvée');
      }
    }
  } catch (error) {
    console.error('❌ [LOAD_OPTIONS] Erreur lors du chargement des options:', error);
    setSavedOptions([]);
  } finally {
    setIsLoadingOptions(false);
  }
}, [refetchDraft]);
```

### **3. Chargement automatique des options**
```typescript
// ✅ NOUVEAU : Charger les options quand un brouillon est chargé
useEffect(() => {
  if (wizardState.draftQuote?.draftQuoteId) {
    loadExistingOptions(wizardState.draftQuote.draftQuoteId);
  }
}, [wizardState.draftQuote?.draftQuoteId, loadExistingOptions]);
```

### **4. Bouton de sauvegarde manuelle**
Un bouton "💾 Sauvegarder le brouillon avec ses options" a été ajouté dans l'onglet "Récapitulatif" pour permettre une sauvegarde manuelle.

## 🎨 **Interface utilisateur**

### **Instructions mises à jour**
La boîte d'instructions dans l'onglet "Récapitulatif" inclut maintenant :
- **💾 Sauvegarde :** Les options sont automatiquement sauvegardées avec le brouillon

### **Bouton de sauvegarde**
- **Position** : Dans l'onglet "Récapitulatif", au-dessus des boutons de création d'options
- **Fonction** : Déclenche la sauvegarde manuelle du brouillon avec ses options
- **Style** : Bouton outlined avec icône de sauvegarde

## 🔄 **Flux de travail complet**

### **Création d'un nouveau brouillon :**
1. **Configurez** vos paramètres (marge, services, etc.)
2. **Créez des options** avec "🚀 CRÉER OPTION X/5"
3. **Sauvegardez** manuellement ou automatiquement
4. **Les options sont persistées** dans la base de données

### **Ouverture d'un brouillon existant :**
1. **Le brouillon se charge** avec ses données de base
2. **Les options se chargent automatiquement** depuis l'API
3. **Tout est affiché** dans l'onglet "Options"

### **Modification d'un brouillon :**
1. **Modifiez** les paramètres ou ajoutez des options
2. **Sauvegardez** (manuellement ou automatiquement)
3. **Toutes les modifications** sont persistées

## 🧪 **Test de la fonctionnalité**

### **Test 1 : Création et sauvegarde**
1. Créez un brouillon avec des options
2. Cliquez sur "💾 Sauvegarder le brouillon avec ses options"
3. Vérifiez dans la console : "✅ [SAVE_DRAFT] Option sauvegardée"
4. Rechargez la page
5. Vérifiez que les options sont toujours là

### **Test 2 : Chargement automatique**
1. Ouvrez un brouillon existant avec des options
2. Vérifiez dans la console : "✅ [LOAD_OPTIONS] Options chargées"
3. Allez dans l'onglet "Options"
4. Vérifiez que les options s'affichent

### **Test 3 : Synchronisation**
1. Créez des options dans un brouillon
2. Sauvegardez
3. Ouvrez le brouillon dans un autre onglet
4. Vérifiez que les options sont synchronisées

## 📋 **Logs de debug**

### **Sauvegarde des options :**
```
💾 [SAVE_DRAFT] Sauvegarde des options: 2
✅ [SAVE_DRAFT] Option sauvegardée: option-1
✅ [SAVE_DRAFT] Option sauvegardée: option-2
```

### **Chargement des options :**
```
📥 [LOAD_OPTIONS] Chargement des options pour le brouillon: draft-123
✅ [LOAD_OPTIONS] Options chargées: 2
```

## ✅ **Avantages**

- **✅ Persistance** : Les options ne sont plus perdues
- **✅ Synchronisation** : Les options sont partagées entre les sessions
- **✅ Automatique** : Pas besoin de sauvegarder manuellement chaque option
- **✅ Robuste** : Gestion d'erreur pour chaque option
- **✅ Transparent** : L'utilisateur ne voit pas la complexité technique

## 🚨 **Points d'attention**

- **Performance** : La sauvegarde peut prendre du temps si beaucoup d'options
- **Erreurs** : Si une option échoue, les autres continuent d'être sauvegardées
- **Synchronisation** : Les options sont chargées à chaque ouverture de brouillon
- **API** : Dépend de la disponibilité de l'API pour les options

Maintenant, vous pouvez **créer, sauvegarder et récupérer des brouillons avec leurs options** ! 🎉
