# Intégration Frontend - Endpoint SelectOption

## Vue d'ensemble

Cette documentation décrit l'intégration frontend pour l'endpoint `POST /api/quotes/{id}/select-option` qui permet aux clients de sélectionner une option parmi celles disponibles dans un devis.

## Fichiers modifiés/créés

### Backend (LIS.OFFERS.SERVICE)

#### 1. `Controllers/QuoteController.cs`
- ✅ **Endpoint implémenté** : `POST /api/quotes/{id}/select-option`
- ✅ **Validations ajoutées** : Vérification de l'existence du devis et de l'option
- ✅ **Mapping complet** : Conversion de `QuoteAvailableOption` vers `QuoteSelectedOption`
- ✅ **Logging** : Logs d'information, d'avertissement et d'erreur
- ✅ **Gestion d'erreurs** : Réponses HTTP appropriées (200, 400, 404, 500)

#### 2. `README_SelectOption.md`
- ✅ **Documentation complète** de l'API
- ✅ **Exemples d'utilisation** avec curl
- ✅ **Flux d'utilisation** détaillé

#### 3. `QuoteSelectOptionExample.http`
- ✅ **Fichier d'exemple** pour tester l'endpoint

### Frontend (LIS.QUOTES.UI)

#### 1. `src/features/offer/services/draftQuoteService.ts`
- ✅ **Import ajouté** : `postApiQuotesByIdSelectOptionMutation`
- ✅ **Type ajouté** : `SelectOptionRequest`
- ✅ **Hook créé** : `useSelectQuoteOption()` avec invalidation du cache
- ✅ **Fonction utilitaire** : `createSelectOptionRequest()`

#### 2. `src/features/offer/components/QuoteOptionSelector.tsx`
- ✅ **Composant créé** : Interface pour sélectionner une option
- ✅ **Fonctionnalités** :
  - Affichage des options disponibles
  - Sélection d'option avec feedback visuel
  - Gestion des états (loading, error, success)
  - Affichage des détails (prix, planning, conteneurs)
  - Support des options recommandées

#### 3. `src/features/offer/pages/QuoteDetails.tsx`
- ✅ **Page créée** : Vue détaillée d'un devis
- ✅ **Fonctionnalités** :
  - Informations du devis (client, expédition, dates)
  - Intégration du `QuoteOptionSelector`
  - Navigation breadcrumb
  - Gestion des états de chargement et d'erreur

#### 4. `src/features/offer/pages/AllQuotes.tsx`
- ✅ **Liens mis à jour** : Navigation vers les détails du devis
- ✅ **Actions corrigées** : Utilisation de `quoteId` au lieu de `id`

#### 5. `src/App.tsx`
- ✅ **Route ajoutée** : `/quotes/:id` → `QuoteDetails`
- ✅ **Route mise à jour** : `/quotes/:id/manage` → `ManagePriceOffer`

#### 6. `src/features/offer/examples/SelectOptionExample.tsx`
- ✅ **Exemple créé** : Composant de démonstration
- ✅ **Code d'exemple** : Comment utiliser le hook

## Utilisation

### 1. Hook de base

```typescript
import { useSelectQuoteOption, createSelectOptionRequest } from '../services/draftQuoteService';

const MyComponent = () => {
  const selectOptionMutation = useSelectQuoteOption();
  
  const handleSelect = async (quoteId: string, optionId: string) => {
    try {
      await selectOptionMutation.mutateAsync(
        createSelectOptionRequest(quoteId, optionId)
      );
      // Option sélectionnée avec succès
    } catch (error) {
      // Gestion d'erreur
    }
  };
  
  return (
    <Button onClick={() => handleSelect('quote-123', 'option-456')}>
      Sélectionner
    </Button>
  );
};
```

### 2. Composant complet

```typescript
import QuoteOptionSelector from '../components/QuoteOptionSelector';

const QuotePage = () => {
  const { data: quote } = useQuote(quoteId);
  
  return (
    <QuoteOptionSelector
      quote={quote}
      onOptionSelected={(optionId) => {
        console.log('Option sélectionnée:', optionId);
      }}
    />
  );
};
```

### 3. Navigation

```typescript
// Depuis la liste des devis
navigate(`/quotes/${quoteId}`); // → QuoteDetails

// Pour gérer le devis
navigate(`/quotes/${quoteId}/manage`); // → ManagePriceOffer
```

## Flux d'utilisation

1. **Client accède à un devis** : `/quotes/{id}`
2. **Page QuoteDetails se charge** : Affiche les informations du devis
3. **QuoteOptionSelector affiche les options** : Cartes avec détails et prix
4. **Client sélectionne une option** : Clic sur "Sélectionner"
5. **Requête envoyée** : `POST /api/quotes/{id}/select-option`
6. **Cache invalidé** : Les données sont rechargées automatiquement
7. **Interface mise à jour** : L'option sélectionnée est mise en évidence

## Gestion d'état

- **Loading** : Indicateur de chargement pendant la sélection
- **Success** : Message de confirmation et mise à jour de l'interface
- **Error** : Affichage des erreurs avec possibilité de réessayer
- **Cache** : Invalidation automatique pour recharger les données

## Types TypeScript

```typescript
// Requête
type SelectOptionRequest = {
  optionId?: string | null;
};

// Réponse
type PostApiQuotesByIdSelectOptionResponse = QuoteResponseCommonApiResponse;

// Hook
const useSelectQuoteOption = () => {
  // Retourne une mutation avec gestion du cache
};
```

## Tests

### Backend
- ✅ Compilation réussie
- ✅ Endpoint accessible
- ✅ Validations fonctionnelles

### Frontend
- ✅ Aucune erreur de linting
- ✅ Types TypeScript corrects
- ✅ Intégration avec React Query

## Prochaines étapes

1. **Tests d'intégration** : Tester avec de vraies données
2. **Tests unitaires** : Ajouter des tests pour les composants
3. **Améliorations UX** : Animations, confirmations, etc.
4. **Documentation utilisateur** : Guide pour les clients

## Support

Pour toute question ou problème :
- Vérifier les logs du backend
- Consulter la documentation de l'API
- Tester avec l'exemple fourni
