# Mise à jour des SDK pour le feature /pricingnew

## Ajustements effectués

### 1. Correction des imports et fonctions SDK

#### HaulageList.tsx
- **Avant** : `deleteApiHaulageByOfferId` (n'existe pas dans le SDK)
- **Après** : `deleteApiHaulageById` (fonction correcte du SDK)
- **Changement** : `path: { offerId }` → `path: { id: offerId }`

#### HaulageCRUDPage.tsx
- **Avant** : `getApiHaulageByOfferId`, `putApiHaulageByOfferId`
- **Après** : `getApiHaulageById`, `putApiHaulageById`
- **Changement** : `path: { offerId }` → `path: { id: offerId }`

### 2. Intégration des hooks TanStack Query

#### Configuration du client
```typescript
// api/index.ts
export const client = createClient(createConfig({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7271'
}));
```

#### Utilisation dans les composants
```typescript
// HaulageList.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getApiHaulageOptions, 
  deleteApiHaulageByIdMutation,
  getApiHaulageQueryKey
} from '../api';

const { 
  data: haulage = [], 
  isLoading: loading, 
  error: queryError,
  refetch: fetchList
} = useQuery(getApiHaulageOptions());

const deleteMutation = useMutation(deleteApiHaulageByIdMutation());
```

#### Gestion des mutations
```typescript
// Suppression avec invalidation du cache
const handleDelete = async (offerId: string) => {
  try {
    await deleteMutation.mutateAsync({ path: { id: offerId } });
    queryClient.invalidateQueries({ queryKey: getApiHaulageQueryKey() });
  } catch (err) {
    console.error('Erreur lors de la suppression:', err);
  }
};
```

### 3. Fonctions SDK disponibles

#### Haulage
- `getApiHaulage()` - Récupérer tous les haulages
- `getApiHaulageById({ path: { id } })` - Récupérer un haulage par ID
- `postApiHaulage({ body })` - Créer un nouveau haulage
- `putApiHaulageById({ path: { id }, body })` - Mettre à jour un haulage
- `deleteApiHaulageById({ path: { id } })` - Supprimer un haulage
- `postApiHaulageSearch({ body })` - Rechercher des haulages

#### Miscellaneous
- `getApiMiscellaneous()` - Récupérer tous les services
- `getApiMiscellaneousById({ path: { id } })` - Récupérer un service par ID
- `postApiMiscellaneous({ body })` - Créer un nouveau service
- `putApiMiscellaneousById({ path: { id }, body })` - Mettre à jour un service
- `deleteApiMiscellaneousById({ path: { id } })` - Supprimer un service
- `postApiMiscellaneousSearch({ body })` - Rechercher des services

#### SeaFreight
- `getApiSeaFreight()` - Récupérer tous les sea freights
- `getApiSeaFreightById({ path: { id } })` - Récupérer un sea freight par ID
- `postApiSeaFreight({ body })` - Créer un nouveau sea freight
- `putApiSeaFreightById({ path: { id }, body })` - Mettre à jour un sea freight
- `deleteApiSeaFreightById({ path: { id } })` - Supprimer un sea freight
- `postApiSeaFreightSearch({ body })` - Rechercher des sea freights

### 4. Hooks TanStack Query générés

#### Options de requête
- `getApiHaulageOptions()` - Options pour récupérer tous les haulages
- `getApiHaulageByIdOptions({ path: { id } })` - Options pour récupérer un haulage
- `getApiMiscellaneousOptions()` - Options pour récupérer tous les services
- `getApiSeaFreightOptions()` - Options pour récupérer tous les sea freights

#### Mutations
- `postApiHaulageMutation()` - Mutation pour créer un haulage
- `putApiHaulageByIdMutation()` - Mutation pour mettre à jour un haulage
- `deleteApiHaulageByIdMutation()` - Mutation pour supprimer un haulage
- `postApiMiscellaneousMutation()` - Mutation pour créer un service
- `putApiMiscellaneousByIdMutation()` - Mutation pour mettre à jour un service
- `deleteApiMiscellaneousByIdMutation()` - Mutation pour supprimer un service

#### Clés de requête
- `getApiHaulageQueryKey()` - Clé pour les requêtes haulage
- `getApiMiscellaneousQueryKey()` - Clé pour les requêtes miscellaneous
- `getApiSeaFreightQueryKey()` - Clé pour les requêtes sea freight

### 5. Avantages de cette approche

1. **Type Safety** : Tous les types sont générés automatiquement
2. **Cache Management** : TanStack Query gère automatiquement le cache
3. **Optimistic Updates** : Possibilité d'updates optimistes
4. **Error Handling** : Gestion d'erreurs centralisée
5. **Loading States** : États de chargement automatiques
6. **Background Refetching** : Rechargement automatique en arrière-plan

### 6. Prochaines étapes

1. Migrer tous les composants vers les hooks TanStack Query
2. Implémenter les optimistic updates
3. Ajouter la gestion d'erreurs globale
4. Configurer les retry policies
5. Optimiser les requêtes avec la pagination

## Exemple d'utilisation complète

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getApiHaulageOptions, 
  postApiHaulageMutation,
  getApiHaulageQueryKey
} from '../api';

const MyComponent = () => {
  const queryClient = useQueryClient();
  
  // Récupération des données
  const { data: haulages, isLoading, error } = useQuery(getApiHaulageOptions());
  
  // Mutation pour créer
  const createMutation = useMutation(postApiHaulageMutation());
  
  const handleCreate = async (data) => {
    try {
      await createMutation.mutateAsync({ body: data });
      queryClient.invalidateQueries({ queryKey: getApiHaulageQueryKey() });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };
  
  return (
    // JSX
  );
};
``` 