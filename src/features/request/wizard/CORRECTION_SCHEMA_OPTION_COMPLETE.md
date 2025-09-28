# 🔧 Correction Complète du Schéma d'Option - Wizard

## 🚀 **Problème identifié**

Le schéma `currentOption` dans le wizard ne permettait pas d'enregistrer le **nom** et la **description** de l'option, bien que l'interface utilisateur les affiche et les utilise.

## ✅ **Corrections apportées**

### **1. schema.ts - Schéma `currentOption`**

#### **AVANT :**
```typescript
currentOption: z.object({
  optionType: z.string().nullable().optional(),
  seafreights: z.array(z.object({
    // ...
  })),
  // ...
})
```

#### **APRÈS :**
```typescript
currentOption: z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  optionType: z.string().nullable().optional(),
  seafreights: z.array(z.object({
    // ...
  })),
  // ...
})
```

### **2. schema.ts - Valeurs par défaut**

#### **AVANT :**
```typescript
currentOption: {
  optionType: null,
  seafreights: [],
  haulages: [],
  services: [],
},
```

#### **APRÈS :**
```typescript
currentOption: {
  name: '',
  description: '',
  optionType: null,
  seafreights: [],
  haulages: [],
  services: [],
},
```

### **3. WizardEngine.tsx - Fonction `handleCreateOption`**

#### **AVANT :**
```typescript
form.setValue('currentOption', {
  optionType: null,
  seafreights: [],
  haulages: [],
  services: []
});
```

#### **APRÈS :**
```typescript
form.setValue('currentOption', {
  name: '',
  description: '',
  optionType: null,
  seafreights: [],
  haulages: [],
  services: []
});
```

### **4. WizardEngine.tsx - Fonction `handleEditOption`**

#### **AVANT :**
```typescript
form.setValue('currentOption', {
  optionType: option.optionType || null,
  seafreights: option.seafreights,
  haulages: option.haulages,
  services: option.services
});
```

#### **APRÈS :**
```typescript
form.setValue('currentOption', {
  name: option.name || '',
  description: option.description || '',
  optionType: option.optionType || null,
  seafreights: option.seafreights,
  haulages: option.haulages,
  services: option.services
});
```

### **5. WizardEngine.tsx - Fonction `handleSaveCurrentOption`**

#### **AVANT :**
```typescript
form.setValue('currentOption', {
  optionType: null,
  seafreights: [],
  haulages: [],
  services: []
});
```

#### **APRÈS :**
```typescript
form.setValue('currentOption', {
  name: '',
  description: '',
  optionType: null,
  seafreights: [],
  haulages: [],
  services: []
});
```

## 🎯 **Fonctionnalités maintenant supportées**

### **✅ Type d'option (`optionType`)**
- ✅ **Schéma** : `z.string().nullable().optional()`
- ✅ **Interface** : Dropdown de sélection
- ✅ **Persistance** : Sauvegardé et chargé correctement

### **✅ Nom de l'option (`name`)**
- ✅ **Schéma** : `z.string().optional()`
- ✅ **Interface** : Champ texte "Nom de l'option"
- ✅ **Persistance** : Sauvegardé et chargé correctement

### **✅ Description de l'option (`description`)**
- ✅ **Schéma** : `z.string().optional()`
- ✅ **Interface** : Zone de texte "Description de l'option"
- ✅ **Persistance** : Sauvegardé et chargé correctement

## 🔍 **Vérification du schéma complet**

Le schéma `QuoteOptionSchema` (pour les options finales) inclut déjà :
```typescript
export const QuoteOptionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Le nom de l'option est requis"),
  description: z.string().optional(),
  optionType: z.string().nullable().optional(),
  // ... autres champs
});
```

Le schéma `currentOption` (pour l'option en cours) inclut maintenant :
```typescript
currentOption: z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  optionType: z.string().nullable().optional(),
  // ... autres champs
});
```

## 🎨 **Interface utilisateur**

L'interface du wizard affiche maintenant correctement :
- **Type d'option** : Dropdown avec les types disponibles
- **Nom de l'option** : Champ texte obligatoire
- **Description de l'option** : Zone de texte optionnelle

## 🚀 **Résultat**

Le schéma de l'option dans le wizard permet maintenant d'enregistrer **complètement** :
- ✅ **Type d'option** : Persisté et chargé
- ✅ **Nom de l'option** : Persisté et chargé
- ✅ **Description de l'option** : Persisté et chargé

Tous les champs de configuration de l'option sont maintenant correctement gérés par le schéma et persistés dans la base de données.

---

*Cette correction garantit que le schéma du wizard est cohérent avec l'interface utilisateur et permet l'enregistrement complet des informations de base de l'option.*
