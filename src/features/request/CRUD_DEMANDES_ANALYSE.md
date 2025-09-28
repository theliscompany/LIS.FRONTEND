# 📋 CRUD des Demandes - Analyse des Fichiers

## 🎯 **Vue d'ensemble**

La feature `request` gère le CRUD (Create, Read, Update, Delete) des demandes de transport via plusieurs couches d'abstraction et fichiers spécialisés.

---

## 🏗️ **Architecture CRUD**

### **📡 Couche API (Générée automatiquement)**

#### **🔧 Fichiers de base**
| Fichier | Rôle | Description |
|---|---|---|
| `api/sdk.gen.ts` | **SDK généré** | Fonctions API brutes (postApiRequest, getApiRequest, etc.) |
| `api/@tanstack/react-query.gen.ts` | **Hooks React Query** | Hooks générés pour la gestion d'état |
| `api/types.gen.ts` | **Types TypeScript** | Types pour les requêtes et réponses API |
| `api/config.ts` | **Configuration** | Configuration de base de l'API |
| `api/index.ts` | **Point d'entrée** | Exports centralisés de l'API |

#### **🎯 Endpoints CRUD disponibles**
```typescript
// CREATE - Créer une demande
postApiRequest(body: RequestQuoteViewModel)

// READ - Lire les demandes
getApiRequest(query?: RequestFilters)           // Liste avec filtres
getApiRequestById(path: {id: string})          // Une demande par ID

// UPDATE - Mettre à jour une demande
putApiRequestUpdateById(path: {id}, body: RequestQuoteViewModel)
putApiRequestByIdChangeStatus(path: {id}, body: ChangeStatusRequest)

// DELETE - Supprimer une demande
deleteApiRequestById(path: {id: string})
```

---

## 🧩 **Composants CRUD**

### **📄 Pages principales**

#### **1. Gestion des demandes**
| Fichier | Rôle | Opérations CRUD |
|---|---|---|
| `pages/Requests.tsx` | **Liste des demandes** | ✅ READ (liste), ✅ UPDATE (assignation), ✅ DELETE |
| `pages/MyRequests.tsx` | **Mes demandes** | ✅ READ (filtrage par assigné) |
| `pages/RequestsSearch.tsx` | **Recherche** | ✅ READ (recherche avancée) |
| `pages/ValidatedRequests.tsx` | **Demandes validées** | ✅ READ (statut validé) |
| `pages/HandleRequest.tsx` | **Gestion individuelle** | ✅ READ, ✅ UPDATE |

#### **2. Création de demandes**
| Fichier | Rôle | Opérations CRUD |
|---|---|---|
| `components/Request.tsx` | **Formulaire principal** | ✅ CREATE, ✅ READ, ✅ UPDATE |
| `components/RequestForm.tsx` | **Formulaire de base** | ✅ CREATE |
| `components/RequestFormHeader.tsx` | **En-tête formulaire** | ✅ CREATE |

#### **3. Wizard de création**
| Fichier | Rôle | Opérations CRUD |
|---|---|---|
| `pages/RequestWizard.tsx` | **Wizard principal** | ✅ CREATE (via wizard) |
| `pages/RequestWizardV3.tsx` | **Wizard v3** | ✅ CREATE (version améliorée) |
| `wizard/NewRequestWizard.tsx` | **Nouveau wizard** | ✅ CREATE |

---

## 🔧 **Services et Utilitaires**

### **🛠️ Services de persistance**
| Fichier | Rôle | Opérations CRUD |
|---|---|---|
| `services/DraftPersistenceService.ts` | **Sauvegarde brouillons** | ✅ CREATE (POST), ✅ UPDATE (PUT) |
| `services/LocalStorageService.ts` | **Stockage local** | ✅ CREATE, ✅ READ, ✅ UPDATE, ✅ DELETE |
| `services/DraftQuoteApiMapper.ts` | **Mapping API** | ✅ Transformation des données |

### **🎣 Hooks personnalisés**
| Fichier | Rôle | Opérations CRUD |
|---|---|---|
| `components/useNewRequestQuote.ts` | **Hook création** | ✅ CREATE, ✅ UPDATE |
| `wizard/hooks/useDraftQuoteSave.ts` | **Hook sauvegarde** | ✅ CREATE (POST), ✅ UPDATE (PUT) |
| `wizard/hooks/useCreateQuoteFromDraft.ts` | **Hook création devis** | ✅ CREATE |

### **🔧 Utilitaires**
| Fichier | Rôle | Opérations CRUD |
|---|---|---|
| `utils/draftIdValidation.ts` | **Validation ID** | ✅ Détermine POST vs PUT |
| `utils/requestToDraftQuoteConverter.ts` | **Conversion** | ✅ Transforme Request → DraftQuote |
| `utils/draftTransformers.ts` | **Transformations** | ✅ Transforme les données |

---

## 📊 **Types de données**

### **🎯 Types principaux**
```typescript
// Types de base
RequestQuoteViewModel          // Structure complète d'une demande
RequestQuoteListViewModel      // Vue liste (allégée)
RequestQuoteResponseViewModel  // Vue détaillée
ChangeStatusRequest           // Changement de statut

// Types de filtrage
GetApiRequestData            // Paramètres de recherche
PostApiRequestData          // Données de création
PutApiRequestUpdateByIdData // Données de mise à jour
```

---

## 🔄 **Flux CRUD détaillés**

### **1. CREATE (Création)**

#### **📝 Via formulaire classique**
```typescript
// Fichier: components/Request.tsx
const handleSubmitTransport = async (data: TransportRequestForm) => {
  const payload = transformFormToApi(data);
  await postApiRequest({ body: payload });
}
```

#### **🎯 Via wizard**
```typescript
// Fichier: wizard/hooks/useDraftQuoteSave.ts
const saveDraft = async (formData: DraftQuoteForm) => {
  if (existingDraftId) {
    // UPDATE - PUT
    await putApiRequestUpdateById({ path: {id: existingDraftId}, body: updatePayload });
  } else {
    // CREATE - POST
    await postApiRequest({ body: createPayload });
  }
}
```

### **2. READ (Lecture)**

#### **📋 Liste des demandes**
```typescript
// Fichier: pages/Requests.tsx
const loadRequests = async () => {
  const response = await getApiRequest({ query: queryParams });
  setRequests(response.data);
}
```

#### **🔍 Recherche**
```typescript
// Fichier: pages/RequestsSearch.tsx
const searchRequests = async () => {
  const response = await getApiRequest({
    query: {
      Departure: auxDeparture,
      Arrival: auxArrival,
      PackingType: packingType,
      Status: status
    }
  });
}
```

#### **📄 Détail d'une demande**
```typescript
// Fichier: components/Request.tsx
const loadRequest = async () => {
  const response = await getApiRequestById({ path: { id } });
  setRequestData(response.data);
}
```

### **3. UPDATE (Mise à jour)**

#### **✏️ Mise à jour complète**
```typescript
// Fichier: components/Request.tsx
const handleEditSubmit = async (data: TransportRequestForm) => {
  const apiData = transformFormToApi(data);
  await putApiRequestUpdateById({ path: { id }, body: apiData });
}
```

#### **🔄 Changement de statut**
```typescript
// Fichier: components/info/RequestChangeStatus.tsx
const changeStatusRequest = async () => {
  await putApiRequestByIdChangeStatus({
    path: { id: props.id },
    body: { newStatus: selectedStatus }
  });
}
```

### **4. DELETE (Suppression)**

#### **🗑️ Suppression directe**
```typescript
// Fichier: api/sdk.gen.ts
export const deleteApiRequestById = (options: DeleteApiRequestByIdData) => {
  // Suppression via API
}
```

---

## 🎯 **Composants spécialisés**

### **📝 Gestion des notes**
| Fichier | Rôle | Opérations CRUD |
|---|---|---|
| `components/info/RequestAddNote.tsx` | **Ajouter note** | ✅ CREATE |
| `components/info/RequestListNotes.tsx` | **Lister notes** | ✅ READ, ✅ DELETE |
| `components/info/RequestAskInformation.tsx` | **Demander info** | ✅ CREATE |

### **👥 Gestion des assignés**
| Fichier | Rôle | Opérations CRUD |
|---|---|---|
| `components/info/RequestChangeStatus.tsx` | **Changer statut** | ✅ UPDATE |

---

## 🔧 **Configuration et mapping**

### **📊 Mapping des données**
```typescript
// Fichier: utils/requestToDraftQuoteConverter.ts
export const convertRequestToDraftQuote = (
  request: RequestQuoteListViewModel,
  currentUserEmail: string
): Partial<DraftQuote> => {
  // Conversion Request → DraftQuote
}
```

### **✅ Validation**
```typescript
// Fichier: utils/draftIdValidation.ts
export const getSaveMethod = (draftId: string | null | undefined): 'PUT' | 'POST' => {
  return isValidDraftId(draftId) ? 'PUT' : 'POST';
}
```

---

## 📈 **Gestion d'état**

### **🎣 React Query**
```typescript
// Fichier: api/@tanstack/react-query.gen.ts
export const useGetApiRequest = (options?: GetApiRequestData) => {
  return useQuery({
    queryKey: getApiRequestQueryKey(options),
    queryFn: () => getApiRequest(options)
  });
}

export const usePostApiRequest = () => {
  return useMutation({
    mutationFn: postApiRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getApiRequestQueryKey() });
    }
  });
}
```

---

## 🎯 **Résumé des fichiers CRUD**

### **🏆 Fichiers essentiels pour le CRUD**

#### **📡 API Layer**
- `api/sdk.gen.ts` - Fonctions API brutes
- `api/@tanstack/react-query.gen.ts` - Hooks React Query
- `api/types.gen.ts` - Types TypeScript

#### **📄 Pages principales**
- `pages/Requests.tsx` - Liste et gestion des demandes
- `components/Request.tsx` - Formulaire principal
- `pages/RequestWizard.tsx` - Wizard de création

#### **🛠️ Services**
- `services/DraftPersistenceService.ts` - Persistance des brouillons
- `components/useNewRequestQuote.ts` - Hook de création

#### **🔧 Utilitaires**
- `utils/requestToDraftQuoteConverter.ts` - Conversion de données
- `utils/draftIdValidation.ts` - Validation des IDs

### **📊 Statistiques**
- **Total fichiers CRUD** : ~25 fichiers
- **Endpoints API** : 6 endpoints principaux
- **Composants UI** : 15+ composants
- **Hooks personnalisés** : 8 hooks
- **Services** : 5 services

---

## 🚀 **Recommandations**

### **🎯 Pour le développement**
1. **Utiliser les hooks React Query** pour la gestion d'état
2. **Suivre les patterns** établis dans `components/Request.tsx`
3. **Valider les données** avec les utilitaires existants
4. **Tester les transformations** de données

### **🔧 Pour la maintenance**
1. **Générer le SDK** après modification de l'API
2. **Mettre à jour les types** TypeScript
3. **Tester les endpoints** avec les composants existants
4. **Documenter les changements** dans les types

---

*Cette analyse couvre tous les fichiers utilisés pour le CRUD des demandes dans la feature `request`.*
