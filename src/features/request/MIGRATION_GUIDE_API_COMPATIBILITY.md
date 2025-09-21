# 🔄 Guide de Migration - Compatibilité API DraftQuote

## 📋 Vue d'ensemble

Ce guide explique comment migrer de l'ancienne structure `DraftQuote` vers une structure compatible avec l'API `@tanstack/api/draft-quotes`.

## 🚨 Problème Identifié

### **Incompatibilité Majeure**
La structure `DraftQuote` du frontend n'est **PAS** compatible avec l'API `@tanstack/api/draft-quotes` :

| **Aspect** | **Frontend** | **API** | **Problème** |
|------------|--------------|---------|--------------|
| **Structure** | Steps (step1-step7) | Customer + Shipment + Wizard + Options | Modèles conceptuels différents |
| **Customer** | `{ contactId, contactName, companyName, email }` | `{ type, name, vat, emails[], phones[], address, contactPerson }` | Structures complètement différentes |
| **Shipment** | Pas de concept central | `{ mode, containerCount, containerTypes[], commodity, origin, destination }` | Le frontend n'a pas de concept "shipment" centralisé |
| **Containers** | `step3.containers[]` | `shipment.containerTypes[]` | Stockage à des endroits différents |
| **Options** | `savedOptions[]` | `options[]` | Noms et structures différents |

## ✅ Solution Implémentée

### **1. Service de Mapping Bidirectionnel**

Créé `DraftQuoteApiMapper` qui fournit :

```typescript
// Frontend → API
DraftQuoteApiMapper.toCreateRequest(draftQuote: DraftQuote): CreateDraftQuoteRequest
DraftQuoteApiMapper.toUpdateRequest(draftQuote: DraftQuote): UpdateDraftQuoteRequest

// API → Frontend  
DraftQuoteApiMapper.fromApiResponse(apiResponse: DraftQuoteResponse): DraftQuote
```

### **2. Hook CRUD Compatible**

Créé `useDraftCRUDApiCompatible` qui remplace l'ancien `useDraftCRUD` :

```typescript
const {
  createDraft,           // Création avec mapping automatique
  updateDraft,           // Mise à jour avec mapping automatique
  useDraft,              // Récupération avec mapping automatique
  isApiCompatible,       // Vérification de compatibilité
  validateForApi         // Validation des données
} = useDraftCRUDApiCompatible();
```

### **3. Utilitaires de Validation**

```typescript
// Vérifier la compatibilité
DraftQuoteApiUtils.isApiCompatible(draftQuote)

// Valider avant envoi
DraftQuoteApiUtils.validateForApi(draftQuote)

// Créer un DraftQuote minimal compatible
DraftQuoteApiUtils.createMinimalApiCompatible(requestId, email)
```

## 🔧 Migration par Étapes

### **Étape 1 : Remplacer les Imports**

```typescript
// ❌ Ancien
import { useDraftCRUD } from '../hooks/useDraftCRUD';

// ✅ Nouveau
import { useDraftCRUDApiCompatible } from '../hooks/useDraftCRUDApiCompatible';
```

### **Étape 2 : Mettre à jour les Appels API**

```typescript
// ❌ Ancien
const { createDraft, updateDraft } = useDraftCRUD();
await createDraft(draftQuote);

// ✅ Nouveau
const { createDraft, updateDraft } = useDraftCRUDApiCompatible();
await createDraft(draftQuote); // Mapping automatique
```

### **Étape 3 : Utiliser la Validation**

```typescript
// Vérifier la compatibilité avant utilisation
if (!isApiCompatible(draftQuote)) {
  console.warn('DraftQuote non compatible avec l\'API');
}

// Valider les données
const errors = validateForApi(draftQuote);
if (errors.length > 0) {
  console.error('Erreurs de validation:', errors);
}
```

## 🧪 Test de Compatibilité

Utilisez le composant `DraftQuoteApiCompatibilityTest` pour vérifier la compatibilité :

```typescript
import DraftQuoteApiCompatibilityTest from '../components/DraftQuoteApiCompatibilityTest';

// Dans votre composant
<DraftQuoteApiCompatibilityTest />
```

## 📊 Mapping des Données

### **Customer Mapping**

```typescript
// Frontend Step1 → API Customer
{
  type: 'company',
  name: step1.customer?.companyName || '',
  emails: [step1.customer?.email || ''],
  contactPerson: {
    fullName: step1.customer?.contactName || '',
    email: step1.customer?.email || ''
  }
}
```

### **Shipment Mapping**

```typescript
// Frontend Steps → API Shipment
{
  mode: 'FCL',
  containerCount: step3.containers?.length || 0,
  containerTypes: step3.containers?.map(c => c.type) || [],
  commodity: step1.productName?.productName || '',
  origin: {
    location: step1.cityFrom?.name || '',
    country: step1.cityFrom?.country || ''
  },
  destination: {
    location: step1.cityTo?.name || '',
    country: step1.cityTo?.country || ''
  }
}
```

### **Wizard Mapping**

```typescript
// Frontend Steps → API Wizard
{
  notes: step1.comment || '',
  seafreights: step5.selections?.map(s => ({ ... })) || [],
  haulages: step4.selection ? [{ ... }] : [],
  services: step2.selectedServices?.map(s => ({ ... })) || []
}
```

## ⚠️ Points d'Attention

### **1. Validation Obligatoire**
Toujours valider les données avant envoi à l'API :

```typescript
const errors = validateForApi(draftQuote);
if (errors.length > 0) {
  // Gérer les erreurs
}
```

### **2. Gestion des Erreurs**
L'API peut retourner des erreurs de validation. Gérer les cas d'erreur :

```typescript
try {
  await createDraft(draftQuote);
} catch (error) {
  console.error('Erreur API:', error);
  // Gérer l'erreur
}
```

### **3. Données Manquantes**
Certaines données peuvent être manquantes lors de la transformation. Utiliser des valeurs par défaut :

```typescript
const createRequest = DraftQuoteApiMapper.toCreateRequest(draftQuote);
// Vérifier que les champs obligatoires sont présents
```

## 🚀 Avantages de la Migration

### **1. Compatibilité API**
- ✅ Structure compatible avec l'API
- ✅ Transformation automatique des données
- ✅ Validation des données avant envoi

### **2. Robustesse**
- ✅ Gestion d'erreurs améliorée
- ✅ Validation des données
- ✅ Fallback en cas d'erreur

### **3. Maintenabilité**
- ✅ Code centralisé dans le mapper
- ✅ Types TypeScript stricts
- ✅ Tests de compatibilité

## 📝 Checklist de Migration

- [ ] Remplacer `useDraftCRUD` par `useDraftCRUDApiCompatible`
- [ ] Ajouter la validation `validateForApi` avant chaque appel
- [ ] Tester la compatibilité avec `DraftQuoteApiCompatibilityTest`
- [ ] Mettre à jour les composants qui utilisent les DraftQuotes
- [ ] Vérifier que les données sont correctement mappées
- [ ] Tester les appels API en conditions réelles

## 🔍 Debugging

### **Logs de Debug**
Le mapper inclut des logs détaillés :

```typescript
// Activer les logs
console.log('🔄 [API_MAPPER] Transformation:', data);
console.log('✅ [API_MAPPER] Succès:', result);
console.error('❌ [API_MAPPER] Erreur:', error);
```

### **Validation des Données**
Utiliser les utilitaires de validation :

```typescript
// Vérifier la compatibilité
console.log('Compatible:', isApiCompatible(draftQuote));

// Valider les données
console.log('Erreurs:', validateForApi(draftQuote));
```

## 📚 Ressources

- **Mapper Principal** : `src/features/request/services/DraftQuoteApiMapper.ts`
- **Hook CRUD** : `src/features/request/hooks/useDraftCRUDApiCompatible.ts`
- **Test de Compatibilité** : `src/features/request/components/DraftQuoteApiCompatibilityTest.tsx`
- **Types API** : `src/features/offer/api/types.gen.ts`
