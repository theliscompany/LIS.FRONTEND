# Step4HaulierSelection - Sauvegarde du Brouillon avec Haulage

## 🎯 **Objectif**

Ce composant a été mis à jour pour utiliser le nouveau SDK `@tanstack` et sauvegarder automatiquement le `offerId` du haulage sélectionné dans le brouillon via l'API.

## 🔧 **Fonctionnalités Ajoutées**

### **1. Sauvegarde Automatique du Brouillon**
- **Trigger** : La sauvegarde se déclenche automatiquement lors de la sélection d'un haulage
- **Logique Intelligente** : Vérifie d'abord l'existence du brouillon, puis choisit entre POST (création) et PUT (mise à jour)
- **Gestion d'ID Dynamique** : Récupère automatiquement l'ID du brouillon après création et l'utilise pour les prochaines opérations
- **API** : Utilise `getDraft`, `postApiQuoteOfferDraft` et `putApiQuoteOfferDraftById` du SDK `@features/offer/api`
- **Données** : Sauvegarde le `offerId` et toutes les informations du haulage sélectionné

### **2. Logique POST vs PUT**

Le composant utilise une logique intelligente pour déterminer s'il faut créer ou mettre à jour un brouillon :

#### **Vérification d'Existence**
```typescript
// 1. Vérifier si le brouillon existe déjà
const draftExists = await checkDraftExists(draftId);

// 2. Choisir l'opération appropriée
if (draftExists) {
  // PUT - Mise à jour du brouillon existant
  await putApiQuoteOfferDraftById({ path: { id: draftId }, body: updateRequest });
} else {
  // POST - Création d'un nouveau brouillon
  await postApiQuoteOfferDraft({ body: createRequest });
}
```

#### **Cas d'Usage**
- **PUT (Mise à jour)** : Quand `draftId` existe et le brouillon est trouvé dans la base
- **POST (Création)** : Quand `draftId` est fourni mais le brouillon n'existe pas encore
- **Erreur** : Quand les informations requises pour la création sont manquantes

### **3. Gestion d'ID Dynamique**

Après une création réussie (POST), le composant récupère automatiquement l'ID du brouillon retourné par l'API :

```typescript
// Après création POST réussie
if (!draftExists && (response as any)?.data?.id) {
  const newDraftId: string = (response as any).data.id;
  
  // Mise à jour de l'état local
  setDraftExists(true);
  setCurrentDraftId(newDraftId);
  
  // Notification au composant parent
  onDraftSaved({
    ...response,
    newDraftId,
    operation: 'created'
  });
}
```

#### **Avantages de cette Approche**
- **Confirmation de Sauvegarde** : L'ID retourné confirme que la création a réussi
- **Optimisation des Opérations** : Les prochaines sauvegardes utilisent directement PUT sans vérification
- **Traçabilité** : L'utilisateur voit clairement le changement d'ID dans l'interface
- **Robustesse** : Évite les erreurs de duplication ou de référence incorrecte

### **4. Structure des Données Sauvegardées**
```typescript
// Structure OptimizedStep4 sauvegardée
{
  steps: {
    step4: {
      selection: {
        offerId: "haulage-123",           // ✅ ID unique de l'API Haulage
        haulierId: 456,                   // ID du transporteur
        haulierName: "Transporteur ABC",
        tariff: {
          unitPrice: 1000,
          currency: "EUR",
          freeTime: 2
        },
        route: {
          pickup: { city: "Bruxelles", country: "Belgium" },
          delivery: { portId: 0, portName: "Anvers", country: "Belgium" }
        },
        validity: {
          validUntil: "2024-12-31"
        }
      },
      calculation: {
        quantity: 1,
        unitPrice: 1000,
        subtotal: 1000,
        currency: "EUR"
      }
    }
  }
}
```

### **3. Interface Utilisateur Améliorée**
- **Section de Statut** : Affiche l'état de la sauvegarde (En attente, Sauvegarde..., Sauvegardé ✓, Erreur ✗)
- **Informations Détaillées** : Montre toutes les propriétés du haulage sélectionné
- **Bouton de Test** : Permet de tester manuellement la sauvegarde
- **Indicateurs Visuels** : Spinners et états désactivés pendant la sauvegarde

## 📋 **Props Requises**

```typescript
interface Step4HaulierSelectionProps {
  // ... props existantes ...
  
  // Props pour la sauvegarde du brouillon
  draftId?: string;                    // ID du brouillon à sauvegarder
  onDraftSaved?: (savedDraft: any) => void; // Callback après sauvegarde
  
  // Props pour la création d'un nouveau brouillon (requises si POST)
  requestQuoteId?: string;             // ID de la demande de devis
  emailUser?: string;                  // Email de l'utilisateur
  clientNumber?: string;               // Numéro du client
}
```

## 🚀 **Utilisation**

### **1. Dans le Composant Parent**
```typescript
<Step4HaulierSelection
  // ... autres props ...
  draftId="draft-123"
  onDraftSaved={(savedDraft) => {
    console.log('Brouillon sauvegardé:', savedDraft);
    // Mettre à jour l'état global si nécessaire
  }}
  // Props requises pour la création (POST)
  requestQuoteId="req-123"
  emailUser="user@example.com"
  clientNumber="CLIENT001"
/>
```

### **2. Flux de Sauvegarde**
1. **Sélection Haulage** → `handleSelectHaulage()` est appelé
2. **Sauvegarde Automatique** → `saveDraftWithHaulage()` est déclenché
3. **Vérification d'Existence** → `checkDraftExists()` vérifie si le brouillon existe
4. **Choix de l'Opération** → POST (création) ou PUT (mise à jour) selon l'existence
5. **Appel API** → `postApiQuoteOfferDraft()` ou `putApiQuoteOfferDraftById()` est exécuté
6. **Mise à Jour UI** → Statut et indicateurs sont mis à jour
7. **Callback** → `onDraftSaved()` est appelé avec la réponse

## 🔍 **Debug et Monitoring**

### **1. Logs Console**
```typescript
// Logs détaillés pour le debugging
console.log('[DEBUG][Step4] Vérification de l\'existence du brouillon:', draftId);
console.log('[DEBUG][Step4] Brouillon existe déjà:', draftExists);

console.log('[DEBUG][Step4] Sauvegarde du brouillon avec haulage:', {
  draftId,
  haulageOfferId: haulage.offerId,
  haulageHaulierId: haulage.haulierId
});

// Logs selon l'opération choisie
if (draftExists) {
  console.log('[DEBUG][Step4] Mise à jour du brouillon existant avec PUT');
  console.log('[DEBUG][Step4] Requête de mise à jour (PUT):', updateRequest);
} else {
  console.log('[DEBUG][Step4] Création d\'un nouveau brouillon avec POST');
  console.log('[DEBUG][Step4] Requête de création (POST):', createRequest);
}

console.log('[DEBUG][Step4] Brouillon sauvegardé avec succès:', response);

// Logs pour la gestion d'ID dynamique
if (!draftExists && (response as any)?.data?.id) {
  console.log('[DEBUG][Step4] Nouveau brouillon créé avec ID:', (response as any).data.id);
  console.log('[DEBUG][Step4] Mise à jour de currentDraftId et draftExists');
}

### **2. Interface de Debug**
- **Section Vérification** : Affiche l'état de vérification de l'existence du brouillon
- **Type d'Opération** : Indique clairement si c'est un POST (création) ou PUT (mise à jour)
- **Gestion d'ID Dynamique** : Affiche le changement d'ID après création et met à jour l'interface
- **Section Statut** : Affiche l'état de la sauvegarde en temps réel
- **Informations Requises** : Affiche les données manquantes pour la création (POST)
- **Informations Haulage** : Montre toutes les propriétés du haulage sélectionné
- **Bouton de Test** : Permet de tester la sauvegarde manuellement (désactivé si données manquantes)

## ⚠️ **Points d'Attention**

### **1. Gestion des Erreurs**
- Les erreurs de sauvegarde sont capturées et affichées dans l'interface
- Le composant reste fonctionnel même en cas d'échec de sauvegarde
- Les états sont correctement réinitialisés après une erreur

### **2. Validation des Données**
- Vérification de la présence du `draftId` avant sauvegarde
- Validation des types TypeScript pour éviter les erreurs runtime
- Fallbacks pour les propriétés manquantes

### **3. Performance**
- La sauvegarde est asynchrone et n'empêche pas l'utilisation de l'interface
- Les états de chargement sont gérés pour éviter les doubles clics
- Les composants sont désactivés pendant la sauvegarde

## 🧪 **Tests**

Un fichier de test a été créé : `Step4HaulierSelection.test.tsx`

```bash
# Exécuter les tests
npm test Step4HaulierSelection.test.tsx
```

## 📚 **Dépendances**

- **SDK** : `@features/offer/api` (nouveau)
  - `getDraft` - Vérification de l'existence du brouillon
  - `postApiQuoteOfferDraft` - Création d'un nouveau brouillon
  - `putApiQuoteOfferDraftById` - Mise à jour d'un brouillon existant
- **Types** : `@features/offer/api/types.gen`
  - `OptimizedCreateWizardDraftRequest` - Pour la création (POST)
  - `OptimizedUpdateWizardDraftRequest` - Pour la mise à jour (PUT)
- **Composants MUI** : `Chip`, `CircularProgress`, `Button`
- **Hooks React** : `useState`, `useEffect`

## 🔄 **Migration**

### **AVANT (Ancien système)**
```typescript
// Pas de sauvegarde automatique
// Pas de persistance du offerId
const handleSelectHaulage = (haulage) => {
  onHaulageSelected(haulage);
};
```

### **APRÈS (Nouveau système)**
```typescript
// Sauvegarde automatique intelligente avec le SDK
const handleSelectHaulage = (haulage) => {
  onHaulageSelected(haulage);
  
  // Sauvegarde automatique du brouillon (POST ou PUT selon l'existence)
  const targetDraftId = currentDraftId || draftId;
  if (targetDraftId) {
    saveDraftWithHaulage(haulage);
  }
};

// Vérification automatique de l'existence au chargement
useEffect(() => {
  if (draftId) {
    checkDraftExists(draftId);
  }
}, [draftId]);

// Gestion d'ID dynamique après création
useEffect(() => {
  if (draftId) {
    setCurrentDraftId(draftId);
  }
}, [draftId]);

// Callback enrichi avec informations sur l'opération
const onDraftSaved = (result) => {
  if (result.operation === 'created') {
    console.log('Nouveau brouillon créé avec ID:', result.newDraftId);
    // Mettre à jour l'état global avec le nouvel ID
  } else {
    console.log('Brouillon mis à jour avec succès');
  }
};
```

## 🎉 **Résultat**

Maintenant, le `offerId` du haulage sélectionné est **automatiquement sauvegardé** dans le brouillon via l'API, garantissant la persistance correcte des données et résolvant le problème d'identification qui causait les erreurs 404.
