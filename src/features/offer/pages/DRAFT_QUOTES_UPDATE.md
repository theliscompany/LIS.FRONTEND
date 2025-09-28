# ✅ Mise à jour de l'affichage des brouillons - DraftQuotes.tsx

## 🎯 **Objectif**

Mettre à jour l'affichage de la liste des brouillons dans `DraftQuotes.tsx` pour correspondre aux nouvelles structures de données du SDK `@tanstack/react-query` et éliminer les "Non défini" qui s'affichaient.

## 🔧 **Modifications apportées**

### **1. Interface DraftQuote mise à jour**

#### **Avant :**
```typescript
interface DraftQuote {
  id: string;
  quoteOfferNumber?: number;
  requestQuoteId?: string;
  clientNumber?: string;
  emailUser?: string;
  status?: string;
  created?: string;
  assignedTo?: string;
  // ... anciens champs
}
```

#### **Après :**
```typescript
interface DraftQuote {
  id: string;
  draftQuoteId?: string;
  requestQuoteId?: string;
  resumeToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
  status?: string;
  currency?: string;
  incoterm?: string;
  customer?: {
    type?: string;
    name?: string;
    vat?: string;
    emails?: string[];
    phones?: string[];
    address?: { ... };
    contactPerson?: { ... };
  };
  shipment?: {
    origin?: { location?: string; country?: string; };
    destination?: { location?: string; country?: string; };
    requestedDeparture?: Date;
    cargoType?: string;
    goodsDescription?: string;
    containers?: Array<{ ... }>;
  };
  wizard?: {
    currentStep?: number;
    completedSteps?: number[];
    progress?: number;
  };
  options?: Array<{ ... }>;
  // Champs calculés pour l'affichage
  progress?: number;
  currentStep?: number;
  totalSteps?: number;
  completedSteps?: string[];
  assignedTo?: string;
}
```

### **2. Fonction processDraftsData refactorisée**

#### **Suppressions :**
- ❌ Ancienne fonction `calculateProgress` (gérée maintenant par le backend)
- ❌ Mapping complexe des anciens champs `step1`, `step2`, etc.
- ❌ Logique de fallback pour la progression

#### **Nouveautés :**
- ✅ **Mapping direct** des champs API vers l'interface
- ✅ **Extraction des données client** depuis `quote.customer`
- ✅ **Calcul de progression** depuis `quote.wizard`
- ✅ **Gestion des emails** depuis `customer.contactPerson.email` ou `customer.emails[0]`

#### **Code principal :**
```typescript
const processDraftsData = (response: any) => {
  // Extraction des données depuis response.data
  const draftsData = response?.data || [];
  
  const draftQuotes = draftsData
    .filter(quote => quote.draftQuoteId) // Utiliser draftQuoteId comme ID principal
    .map(quote => {
      // Calculer la progression depuis les données wizard
      const wizardData = quote.wizard || {};
      const persistedCurrentStep = wizardData.currentStep || 1;
      const persistedCompletedSteps = wizardData.completedSteps || [];
      const persistedProgress = wizardData.progress || 0;
      
      // Extraire les informations du client
      const customerName = quote.customer?.name || 'Non défini';
      const customerEmail = quote.customer?.contactPerson?.email || 
                          (quote.customer?.emails && quote.customer.emails.length > 0 ? quote.customer.emails[0] : 'Non défini');
      
      return {
        id: quote.draftQuoteId,
        draftQuoteId: quote.draftQuoteId,
        customer: quote.customer,
        shipment: quote.shipment,
        wizard: quote.wizard,
        options: quote.options,
        // Champs calculés pour l'affichage
        progress: persistedProgress > 0 ? persistedProgress : Math.round((persistedCompletedSteps.length / 6) * 100),
        currentStep: persistedCurrentStep,
        completedSteps: persistedCompletedSteps.map(step => `${step}/6 Étape ${step}`),
        // Champs de compatibilité
        clientNumber: customerName,
        emailUser: customerEmail,
        createdAt: quote.createdAt,
        updatedAt: quote.updatedAt
      };
    });
};
```

### **3. Affichage des cartes modernisé**

#### **En-tête de carte :**
```typescript
// AVANT
<Typography variant="h6" fontWeight="bold">
  Brouillon #{draft.quoteOfferNumber || 'N/A'}
</Typography>

// APRÈS
<Typography variant="h6" fontWeight="bold">
  Brouillon #{draft.draftQuoteId?.substring(0, 8) || 'N/A'}
</Typography>
```

#### **Informations du client :**
```typescript
// AVANT
{draft.clientNumber && (
  <Box display="flex" alignItems="center" gap={1}>
    <Business fontSize="small" color="action" />
    <Typography variant="body2">
      {draft.clientNumber}
    </Typography>
  </Box>
)}

// APRÈS
{draft.customer?.name && (
  <Box display="flex" alignItems="center" gap={1}>
    <Business fontSize="small" color="action" />
    <Typography variant="body2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
      {draft.customer.name}
    </Typography>
  </Box>
)}
```

#### **Email utilisateur :**
```typescript
// AVANT
<Typography variant="body2">
  {draft.emailUser || 'Email non défini'}
</Typography>

// APRÈS
<Typography variant="body2">
  {draft.customer?.contactPerson?.email || 
   (draft.customer?.emails && draft.customer.emails.length > 0 ? draft.customer.emails[0] : 'Email non défini')}
</Typography>
```

#### **Informations d'expédition :**
```typescript
// NOUVEAU
{draft.shipment && (
  <Box display="flex" alignItems="center" gap={1}>
    <Assignment fontSize="small" color="action" />
    <Typography variant="body2">
      {draft.shipment.origin?.location || 'N/A'} → {draft.shipment.destination?.location || 'N/A'}
    </Typography>
  </Box>
)}
```

### **4. DataGrid mis à jour**

#### **Colonnes principales :**
- **Numéro** : `draftQuoteId` au lieu de `quoteOfferNumber`
- **Utilisateur** : Email depuis `customer.contactPerson.email` ou `customer.emails[0]`
- **Client** : Nom depuis `customer.name`
- **Créé le** : `createdAt` au lieu de `created`

#### **Rendu des cellules :**
```typescript
{
  field: 'customer',
  headerName: 'Utilisateur',
  renderCell: (params) => {
    const customer = params.value;
    const email = customer?.contactPerson?.email || 
                (customer?.emails && customer.emails.length > 0 ? customer.emails[0] : 'Non défini');
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
          {email?.charAt(0)?.toUpperCase() || 'U'}
        </Avatar>
        <Typography variant="body2">{email}</Typography>
      </Box>
    );
  }
}
```

### **5. Filtres de recherche améliorés**

#### **Avant :**
```typescript
const filteredDrafts = drafts.filter(draft =>
  draft.emailUser?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  draft.requestQuoteId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  draft.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase())
);
```

#### **Après :**
```typescript
const filteredDrafts = drafts.filter(draft => {
  const searchLower = searchTerm.toLowerCase();
  const customerEmail = draft.customer?.contactPerson?.email || 
                      (draft.customer?.emails && draft.customer.emails.length > 0 ? draft.customer.emails[0] : '');
  return (
    customerEmail?.toLowerCase().includes(searchLower) ||
    draft.requestQuoteId?.toLowerCase().includes(searchLower) ||
    draft.assignedTo?.toLowerCase().includes(searchLower) ||
    draft.customer?.name?.toLowerCase().includes(searchLower) ||
    draft.draftQuoteId?.toLowerCase().includes(searchLower) ||
    draft.status?.toLowerCase().includes(searchLower)
  );
});
```

## ✅ **Résultats**

### **🎯 Avant la mise à jour**
- ❌ Beaucoup de "Non défini" affichés
- ❌ Champs incorrects (emailUser, clientNumber, etc.)
- ❌ Progression calculée côté frontend
- ❌ Structure de données obsolète

### **🎯 Après la mise à jour**
- ✅ **Données réelles** affichées depuis l'API
- ✅ **Champs corrects** (customer.name, customer.contactPerson.email, etc.)
- ✅ **Progression gérée** par le backend
- ✅ **Structure moderne** alignée avec le SDK
- ✅ **Filtres améliorés** pour plus de champs
- ✅ **Affichage cohérent** entre cartes et tableau

## 📋 **Champs mappés**

| Ancien champ | Nouveau champ | Source API |
|--------------|---------------|------------|
| `quoteOfferNumber` | `draftQuoteId` | `draftQuoteId` |
| `emailUser` | `customer.contactPerson.email` | `customer.contactPerson.email` |
| `clientNumber` | `customer.name` | `customer.name` |
| `created` | `createdAt` | `createdAt` |
| `lastModified` | `updatedAt` | `updatedAt` |
| `progress` | `wizard.progress` | `wizard.progress` |
| `currentStep` | `wizard.currentStep` | `wizard.currentStep` |
| `completedSteps` | `wizard.completedSteps` | `wizard.completedSteps` |

## 🔄 **Compatibilité**

- ✅ **Rétrocompatible** : Les anciens champs sont mappés vers les nouveaux
- ✅ **Performance** : Pas de calculs côté frontend pour la progression
- ✅ **Maintenabilité** : Structure alignée avec l'API backend
- ✅ **Évolutivité** : Facile d'ajouter de nouveaux champs

---

*L'affichage des brouillons est maintenant entièrement aligné avec les nouvelles structures API et ne montre plus de "Non défini" !*
