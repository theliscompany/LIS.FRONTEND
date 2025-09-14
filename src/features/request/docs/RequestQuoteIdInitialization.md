# 🔄 Initialisation du RequestQuoteId depuis Requests.tsx

## 📋 Vue d'ensemble

Ce document explique comment le `requestQuoteId` est maintenant correctement initialisé dans le `RequestWizard.tsx` en utilisant les données provenant de `Requests.tsx`.

## 🎯 Flux de Données

### 1. **Dans Requests.tsx**
```typescript
const handleLaunchWizard = async (request: RequestQuoteListViewModel) => {
  // ✅ Charger la demande complète
  const res = await getApiRequestById({ path: { id: request.requestQuoteId ?? '' } });
  
  // ✅ Navigation vers le wizard avec les données
  navigate('/request-wizard', {
    state: {
      requestData: patchedData,  // ✅ Contient requestQuoteId
      source: 'api'              // ✅ Source identifiée
    }
  });
};
```

### 2. **Dans RequestWizard.tsx**
```typescript
// ✅ Validation des données de navigation
const navigationValidation = validateNavigationData(location.state);

// ✅ Initialisation conditionnelle du draftQuote
const initialDraftQuote = useMemo(() => {
  if (navigationValidation.isValid && navigationValidation.requestData) {
    // ✅ Créer un brouillon depuis une requête existante
    return createDraftQuoteFromRequest(
      navigationValidation.requestData, 
      account?.username
    );
  }
  
  // ✅ Créer un nouveau brouillon
  return createInitialDraftQuote(account?.username);
}, [location.state, account?.username]);
```

## 🧪 Comment Tester

### **Étape 1: Lancer le Wizard depuis Requests.tsx**
1. Aller sur la page `/requests`
2. Cliquer sur le bouton "🔧" (AutoFixHigh) d'une demande existante
3. Vérifier que le wizard se lance avec les données pré-remplies

### **Étape 2: Vérifier l'Initialisation**
Le composant `RequestInitializationTest` affichera :
- ✅ **Données de Navigation** : Le contenu de `location.state`
- ✅ **Validation des Données** : Si les données sont valides
- ✅ **RequestQuoteId** : L'ID de la requête existante
- ✅ **ClientNumber** : Le nom de l'entreprise
- ✅ **EmailUser** : L'email de l'assigné

### **Étape 3: Vérifier la Console**
```javascript
🔄 [WIZARD_INIT] Initialisation depuis requête existante: 12345
🔄 [WIZARD_INIT] DraftQuote initialisé: {
  requestQuoteId: "12345",
  clientNumber: "FOETS DENIS NV",
  emailUser: "clement.dzou@omnifreight.eu",
  source: "api",
  hasRequestData: true
}
```

## 🔧 Fonctions Utilisées

### **`validateNavigationData(locationState)`**
- ✅ Vérifie que `locationState` existe
- ✅ Vérifie que `requestData` est présent
- ✅ Vérifie que `requestQuoteId` existe
- ✅ Vérifie que `source === 'api'`

### **`createDraftQuoteFromRequest(requestData, currentUserEmail)`**
- ✅ Crée un brouillon avec l'ID existant
- ✅ Enrichit `step1` avec les données de la requête
- ✅ Définit `clientNumber` depuis `companyName`
- ✅ Définit `emailUser` depuis `assignee`

### **`createInitialDraftQuote(currentUserEmail, existingRequestQuoteId?)`**
- ✅ Génère un nouvel ID si aucun n'existe
- ✅ Utilise l'ID existant si fourni
- ✅ Initialise `clientNumber` avec 'DEFAULT'

## 📊 Structure des Données

### **Données de Requête (Requests.tsx)**
```typescript
{
  requestQuoteId: "12345",           // ✅ ID de la requête
  companyName: "FOETS DENIS NV",     // ✅ Pour clientNumber
  customerId: 10,                    // ✅ Pour step1.customer.contactId
  pickupCity: "Mons",               // ✅ Pour step1.route.origin
  deliveryCity: "Douala",           // ✅ Pour step1.route.destination
  incoterm: "EXW",                  // ✅ Pour step1.cargo.incoterm
  productName: "USED CLOTHES",      // ✅ Pour step1.cargo.product
  assignee: "clement.dzou@omnifreight.eu" // ✅ Pour emailUser
}
```

### **Brouillon Résultant (RequestWizard.tsx)**
```typescript
{
  requestQuoteId: "12345",           // ✅ ID de la requête existante
  clientNumber: "FOETS DENIS NV",    // ✅ Depuis companyName
  emailUser: "clement.dzou@omnifreight.eu", // ✅ Depuis assignee
  step1: {
    customer: {
      contactId: 10,
      contactName: "FOETS DENIS NV",
      companyName: "FOETS DENIS NV"
    },
    route: {
      origin: { city: { name: "Mons" } },
      destination: { city: { name: "Douala" } }
    },
    cargo: {
      productName: "USED CLOTHES",
      incoterm: "EXW"
    }
  }
}
```

## 🚀 Avantages

1. **✅ Cohérence des IDs** : Le `requestQuoteId` est toujours cohérent entre la requête et le brouillon
2. **✅ Données Pré-remplies** : Le wizard démarre avec toutes les informations de la requête
3. **✅ Validation Automatique** : Les données sont validées avant l'initialisation
4. **✅ Fallback Robuste** : Si pas de données, création d'un nouveau brouillon
5. **✅ Traçabilité** : Logs détaillés pour le debugging

## 🔍 Debugging

### **Problèmes Courants**
1. **❌ "Aucune donnée de navigation trouvée"**
   - Vérifier que `navigate()` est appelé avec `state`
   - Vérifier que `source: 'api'` est défini

2. **❌ "requestQuoteId manquant dans les données de requête"**
   - Vérifier que `request.requestQuoteId` existe dans `Requests.tsx`
   - Vérifier que l'API retourne bien l'ID

3. **❌ "Source de données invalide"**
   - Vérifier que `source === 'api'` dans `navigate()`

### **Logs de Debug**
```javascript
// ✅ Dans la console du navigateur
🔄 [WIZARD_INIT] Initialisation depuis requête existante: 12345
🔄 [WIZARD_INIT] DraftQuote initialisé: { ... }

// ✅ Dans le composant de test
🧪 Test d'Initialisation du RequestQuoteId
```

## 📝 Prochaines Étapes

1. **✅ Tester** l'initialisation depuis `Requests.tsx`
2. **✅ Vérifier** que le `requestQuoteId` est correctement sauvegardé
3. **✅ Confirmer** que les données sont bien pré-remplies dans le wizard
4. **✅ Supprimer** le composant de test une fois validé

---

**🎯 Objectif Atteint** : Le `requestQuoteId` vient maintenant correctement de `Requests.tsx` lors de l'initialisation du wizard !
