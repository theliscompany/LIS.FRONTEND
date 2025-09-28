# 🔧 Correction de la Persistance du Type d'Option - Wizard

## 🚀 **Problème identifié**

Le `optionType` n'était pas persisté dans le wizard lors des opérations suivantes :
- Création d'une nouvelle option
- Édition d'une option existante  
- Réinitialisation de l'option courante
- Valeurs par défaut du formulaire

## ✅ **Corrections apportées**

### **1. WizardEngine.tsx - Fonction `handleCreateOption`**
```typescript
// AVANT
form.setValue('currentOption', {
  seafreights: [],
  haulages: [],
  services: []
});

// APRÈS
form.setValue('currentOption', {
  optionType: null,
  seafreights: [],
  haulages: [],
  services: []
});
```

### **2. WizardEngine.tsx - Fonction `handleEditOption`**
```typescript
// AVANT
form.setValue('currentOption', {
  seafreights: option.seafreights,
  haulages: option.haulages,
  services: option.services
});

// APRÈS
form.setValue('currentOption', {
  optionType: option.optionType || null,
  seafreights: option.seafreights,
  haulages: option.haulages,
  services: option.services
});
```

### **3. WizardEngine.tsx - Fonction `handleSaveCurrentOption`**
```typescript
// AVANT
form.setValue('currentOption', {
  seafreights: [],
  haulages: [],
  services: []
});

// APRÈS
form.setValue('currentOption', {
  optionType: null,
  seafreights: [],
  haulages: [],
  services: []
});
```

### **4. schema.ts - Valeurs par défaut**
```typescript
// AVANT
currentOption: {
  seafreights: [],
  haulages: [],
  services: [],
},

// APRÈS
currentOption: {
  optionType: null,
  seafreights: [],
  haulages: [],
  services: [],
},
```

## 🎯 **Fonctionnalités corrigées**

### **✅ Création d'option**
- Le `optionType` est maintenant initialisé à `null` lors de la création d'une nouvelle option
- L'utilisateur peut sélectionner un type d'option qui sera persisté

### **✅ Édition d'option**
- Le `optionType` existant est maintenant chargé lors de l'édition d'une option
- La valeur est préservée et peut être modifiée

### **✅ Sauvegarde d'option**
- Le `optionType` est correctement sauvegardé avec l'option
- La valeur est persistée dans la base de données

### **✅ Réinitialisation**
- Le `optionType` est réinitialisé à `null` après sauvegarde
- L'état est cohérent pour la prochaine option

## 🔍 **Vérification du schéma**

Le schéma `QuoteOptionSchema` et `currentOption` incluent bien :
```typescript
optionType: z.string().nullable().optional(),
```

## 🎨 **Interface utilisateur**

L'interface du wizard affiche maintenant correctement :
- **Sélection du type d'option** : Dropdown avec les types disponibles
- **Persistance visuelle** : Le type sélectionné reste affiché
- **Édition cohérente** : Le type est chargé lors de l'édition

## 🚀 **Résultat**

Le type d'option est maintenant **entièrement persisté** dans le wizard :
- ✅ **Création** : Type initialisé et sauvegardé
- ✅ **Édition** : Type chargé et modifiable  
- ✅ **Sauvegarde** : Type inclus dans la sauvegarde
- ✅ **Navigation** : Type préservé entre les étapes
- ✅ **Réinitialisation** : État cohérent après sauvegarde

---

*Cette correction garantit que le type d'option sélectionné par l'utilisateur est correctement géré tout au long du processus de création et d'édition des options dans le wizard.*
