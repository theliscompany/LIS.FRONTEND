# 🔄 Guide de Synchronisation Parfaite - DraftQuote

## 🎯 **Principe de Base**

Le `draftQuote` agit comme un **DTO (Data Transfer Object)** qui maintient une synchronisation parfaite entre :
- **Frontend** : Les composants du wizard
- **DTO** : L'objet `draftQuote` en mémoire
- **API** : La base de données via `api/QuoteOffer/draft`

## 🏗️ **Architecture de Synchronisation**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Frontend   │◄──►│  DraftQuote │◄──►│     API     │
│  (Wizard)   │    │   (DTO)     │    │ (Database)  │
└─────────────┘    └─────────────┘    └─────────────┘
```

### **1. Frontend → DTO (Automatique)**
- Toute modification dans le wizard met à jour `draftQuote`
- Les changements sont marqués comme "en attente de synchronisation"
- La sauvegarde automatique est programmée après 2 secondes

### **2. DTO → API (Sur demande)**
- Sauvegarde manuelle via bouton ou sauvegarde automatique
- Gestion automatique POST/PUT selon l'existence du `draftId`
- Construction du payload SDK aligné

### **3. API → DTO (Automatique)**
- Réponse de l'API met à jour le `draftQuote` local
- Synchronisation des données de compatibilité
- Mise à jour de l'ID du brouillon

## 🚀 **Utilisation dans RequestWizard.tsx**

### **1. Initialisation du Hook**
```typescript
const {
  draftQuote,           // État du brouillon
  syncStatus,           // Statut de synchronisation
  updateDraftQuote,     // Mise à jour générale
  updateStep,           // Mise à jour d'une étape
  updateCompatibilityData, // Mise à jour des données de compatibilité
  saveDraft: saveDraftFromHook, // Sauvegarde manuelle
  loadDraft: loadDraftFromHook, // Chargement depuis l'API
  syncFromApiResponse,  // Synchronisation depuis la réponse API
  setDraftQuote,        // Setter direct (pour compatibilité)
  setDraftId            // Setter de l'ID
} = useDraftQuoteSync(createInitialDraftQuote(account?.username));
```

### **2. Affichage du Statut**
```typescript
<DraftSyncStatus
  syncStatus={syncStatus}
  onManualSave={saveDraftFromHook}
/>
```

## 📝 **Utilisation dans les Composants d'Étape**

### **1. Mise à Jour d'une Étape**
```typescript
// Dans un composant d'étape
const handleStepDataChange = (newData: any) => {
  // Mise à jour via le hook de synchronisation
  updateStep(4, newData); // Met à jour step4
  
  // OU mise à jour directe
  updateDraftQuote(prev => ({
    ...prev,
    step4: newData
  }), 'step4');
};
```

### **2. Mise à Jour des Données de Compatibilité**
```typescript
// Pour les données de compatibilité (selectedHaulage, etc.)
const handleHaulageSelection = (haulage: any) => {
  updateCompatibilityData({
    selectedHaulage: haulage,
    haulageTotal: haulage.totalPrice
  });
};
```

## 🔧 **Fonctions de Synchronisation**

### **1. `updateDraftQuote(updater, changeSource?)`**
```typescript
// Mise à jour générale avec marquage du changement
updateDraftQuote(prev => ({
  ...prev,
  step1: { ...prev.step1, customer: newCustomer }
}), 'step1');
```

### **2. `updateStep(stepNumber, stepData)`**
```typescript
// Mise à jour d'une étape spécifique
updateStep(4, {
  selection: selectedHaulage,
  calculation: haulageCalculation
});
```

### **3. `updateCompatibilityData(data)`**
```typescript
// Mise à jour des propriétés de compatibilité
updateCompatibilityData({
  selectedHaulage: haulage,
  selectedSeafreights: seafreights,
  totalTEU: calculatedTEU
});
```

## 📊 **Statut de Synchronisation**

### **1. Propriétés du `syncStatus`**
```typescript
interface SyncStatus {
  hasPendingChanges: boolean;      // Changements en attente
  pendingChanges: string[];        // Liste des changements
  isSaving: boolean;               // Sauvegarde en cours
  lastSavedAt: Date | null;        // Dernière sauvegarde
  draftId: string | null;          // ID du brouillon
  isNew: boolean;                  // Nouveau brouillon
}
```

### **2. Utilisation du Statut**
```typescript
// Afficher un indicateur de synchronisation
if (syncStatus.hasPendingChanges) {
  console.log('⚠️ Changements en attente:', syncStatus.pendingChanges);
}

// Vérifier si sauvegarde en cours
if (syncStatus.isSaving) {
  console.log('🔄 Sauvegarde en cours...');
}

// Afficher la dernière sauvegarde
if (syncStatus.lastSavedAt) {
  console.log('✅ Dernière sauvegarde:', syncStatus.lastSavedAt);
}
```

## 🎯 **Exemples Concrets**

### **1. Sélection d'un Haulier (Step4)**
```typescript
const handleHaulageSelection = (haulage: HaulageResponse) => {
  // Mise à jour de l'étape
  updateStep(4, {
    selection: {
      haulierId: haulage.haulierId,
      haulierName: haulage.haulierName,
      tariff: {
        unitPrice: haulage.unitTariff,
        currency: haulage.currency
      }
    },
    calculation: {
      quantity: draftQuote.totalContainers || 1,
      unitPrice: haulage.unitTariff,
      subtotal: (haulage.unitTariff || 0) * (draftQuote.totalContainers || 1)
    }
  });
  
  // Mise à jour des données de compatibilité
  updateCompatibilityData({
    selectedHaulage: haulage,
    haulageTotal: (haulage.unitTariff || 0) * (draftQuote.totalContainers || 1)
  });
};
```

### **2. Sélection de Seafreight (Step5)**
```typescript
const handleSeafreightSelection = (seafreights: SeafreightResponse[]) => {
  // Mise à jour de l'étape
  updateStep(5, {
    selections: seafreights.map(sf => ({
      id: sf.id,
      seafreightId: sf.seafreightId,
      carrier: {
        name: sf.carrierName,
        agentName: sf.agentName
      },
      pricing: {
        basePrice: sf.basePrice,
        total: sf.totalPrice
      }
    }))
  });
  
  // Mise à jour des données de compatibilité
  updateCompatibilityData({
    selectedSeafreights: seafreights,
    seafreightTotal: seafreights.reduce((sum, sf) => sum + (sf.totalPrice || 0), 0)
  });
};
```

## ⚠️ **Bonnes Pratiques**

### **1. Toujours Utiliser les Fonctions du Hook**
```typescript
// ✅ CORRECT : Utiliser updateStep
updateStep(4, newStepData);

// ❌ INCORRECT : Modifier directement
setDraftQuote(prev => ({ ...prev, step4: newStepData }));
```

### **2. Marquer la Source des Changements**
```typescript
// ✅ CORRECT : Marquer la source
updateDraftQuote(updater, 'step4');

// ❌ INCORRECT : Pas de source
updateDraftQuote(updater);
```

### **3. Utiliser les Données de Compatibilité**
```typescript
// ✅ CORRECT : Accès via les propriétés de compatibilité
const haulageTotal = draftQuote.haulageTotal;

// ❌ INCORRECT : Accès direct aux étapes
const haulageTotal = draftQuote.step4?.calculation?.subtotal;
```

## 🔍 **Débogage et Monitoring**

### **1. Console de Débogage**
```typescript
// Afficher le statut de synchronisation
console.log('Sync Status:', syncStatus);

// Afficher les changements en attente
if (syncStatus.hasPendingChanges) {
  console.log('Pending changes:', syncStatus.pendingChanges);
}
```

### **2. Composant de Statut Visuel**
Le composant `DraftSyncStatus` affiche en temps réel :
- Statut de synchronisation (Synchronisé, Modifications en attente, Sauvegarde...)
- ID du brouillon
- Type de brouillon (Nouveau/Existant)
- Dernière sauvegarde
- Bouton de sauvegarde manuelle
- Alertes pour les modifications non sauvegardées

## 🎉 **Avantages du Système**

1. **Synchronisation Parfaite** : Frontend ↔ DTO ↔ API toujours cohérents
2. **Gestion Automatique** : POST/PUT automatique selon l'état
3. **Sauvegarde Intelligente** : Automatique après 2s + manuelle
4. **Monitoring en Temps Réel** : Statut visible à tout moment
5. **Type Safety** : TypeScript strict pour éviter les erreurs
6. **Performance** : Pas de sauvegarde excessive, délai configurable
7. **Débogage Facile** : Traçabilité complète des changements
