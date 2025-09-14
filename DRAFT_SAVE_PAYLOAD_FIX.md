# Correction du Payload de Sauvegarde des Brouillons

## Problème Identifié

Le payload utilisé pour sauvegarder les brouillons via l'API `/api/QuoteOffer/draft` ne correspondait pas exactement au schéma attendu par l'API selon le swagger.json.

## Modifications Apportées

### 1. Correction de la fonction `buildSDKPayload` et élimination de la duplication

**Fichier:** `src/features/request/types/DraftQuote.ts`

**Changements:**
- ✅ Suppression du champ `request` supplémentaire qui n'était pas dans le schéma API
- ✅ Correction du champ `comment` pour accepter une chaîne vide au lieu de `null`
- ✅ Restructuration complète des étapes pour correspondre exactement à l'exemple fourni
- ✅ Mapping détaillé de tous les champs pour chaque étape (step1 à step7)
- ✅ **Correction de la structure de `step2`** : mapping de `selected` vers `selectedServices` avec la structure `SelectedServiceData` conforme au schéma API
- ✅ Gestion des valeurs par défaut pour tous les champs obligatoires
- ✅ Mise à jour du commentaire de la fonction pour indiquer qu'elle supporte les deux types de requêtes

### 2. Modification de `DraftPersistenceService.ts` pour utiliser `buildSDKPayload`

**Fichier:** `src/features/request/services/DraftPersistenceService.ts`

**Changements:**
- ✅ Import de la fonction `buildSDKPayload` depuis `DraftQuote.ts`
- ✅ Remplacement de la logique de construction du payload par l'appel à `buildSDKPayload`
- ✅ Suppression de la méthode `transformToOptimizedDraftData` qui créait de la duplication
- ✅ Suppression du champ `request` supplémentaire dans les méthodes `createNewDraft` et `updateExistingDraft`

### 3. Correction spécifique de la structure `step2`

**Problème identifié :** La structure de `step2` dans le payload ne correspondait pas au schéma `OptimizedStep2` de l'API.

**Solution appliquée :**
- Mapping de `draftQuote.step2.selected` vers `selectedServices` dans le payload API
- Structure conforme au schéma `SelectedServiceData` avec les champs : `serviceId`, `serviceName`, `category`, `usagePercent`
- Suppression du champ `selected` du payload final

### 4. Structure du Payload Corrigé

Le payload généré correspond maintenant exactement au schéma de l'API, avec tous les champs détaillés pour chaque étape :

```typescript
{
  requestQuoteId: string,
  emailUser: string,
  clientNumber: string,
  comment: string,
  draftData: {
    wizard: {
      currentStep: number,
      completedSteps: number[],
      status: string,
      lastModified: string,
      version: string
    },
    steps: {
      step1?: {
        customer: { contactId, contactName, companyName, email },
        route: { origin: { city, port }, destination: { city, port } },
        cargo: { product: { productId, productName }, incoterm },
        metadata: { comment }
      },
      step2?: {
        selectedServices: [{ serviceId, serviceName, category, usagePercent }]
      },
      step3?: {
        containers: [{ id, type, quantity, teu }],
        summary: { totalContainers, totalTEU, containerTypes },
        route: { origin: { city, port }, destination: { city, port } }
      },
      step4?: {
        selection: { offerId, haulierId, haulierName, tariff, route, validity, overtimeQuantity, overtimePrice },
        calculation: { quantity, unitPrice, subtotal, overtimeAmount, totalAmount, currency }
      },
      step5?: {
        selections: [{ id, seafreightId, quoteNumber, carrier, route, container, charges, service, validity, remarks, isSelected, selectedAt }],
        summary: { totalSelections, totalContainers, totalAmount, currency, selectedCarriers, containerTypes, preferredSelectionId }
      },
      step6?: {
        selections: [{ id, service, supplier, pricing, validity }],
        summary: { totalSelections, totalAmount, currency, categories }
      },
      step7?: {
        finalization: { optionName, optionDescription, marginPercentage, marginAmount, marginType, isReadyToGenerate, generatedAt },
        validation: { allStepsValid, errors, warnings },
        pricingSummary: { baseTotal, marginAmount, finalTotal, currency, breakdown }
      }
    },
    totals: {
      haulage: number,
      seafreight: number,
      miscellaneous: number,
      subtotal: number,
      grandTotal: number,
      currency: string,
      totalTEU: number
    }
  }
}
```

### 3. Endpoints API Utilisés

Le code utilise déjà les bons endpoints SDK :
- **POST** `/api/QuoteOffer/draft` - pour créer un nouveau brouillon
- **PUT** `/api/QuoteOffer/draft/{id}` - pour mettre à jour un brouillon existant

### 5. Validation

Le payload a été testé et validé avec l'exemple exact fourni :
- ✅ Structure parfaitement conforme au schéma de l'API
- ✅ Tous les champs requis sont présents et correctement typés
- ✅ Structure `draftData` complète avec toutes les étapes
- ✅ **Structure `step2` corrigée** : `selectedServices` conforme au schéma `OptimizedStep2`
- ✅ Gestion des valeurs par défaut pour tous les champs
- ✅ Compatible avec les deux types de requêtes (création et mise à jour)
- ✅ Mapping détaillé de tous les sous-objets (customer, route, cargo, etc.)
- ✅ **Absence du champ `request` supplémentaire**

## Impact

Cette correction permet :
1. **Sauvegarde réussie** des brouillons via l'API
2. **Création** de nouveaux brouillons avec `postApiQuoteOfferDraft`
3. **Mise à jour** des brouillons existants avec `putApiQuoteOfferDraftById`
4. **Conformité** avec le schéma OpenAPI défini dans le swagger.json
5. **Élimination de la duplication** - une seule fonction `buildSDKPayload` utilisée partout

## Utilisation

Le système de sauvegarde automatique et manuelle dans `RequestWizard.tsx` utilise maintenant le payload correct via la fonction `buildSDKPayload` dans `useWizardStateManager.ts` et `DraftPersistenceService.ts`.

Les utilisateurs peuvent maintenant :
- Créer de nouveaux brouillons
- Sauvegarder automatiquement les modifications
- Sauvegarder manuellement via le bouton "Sauvegarder"
- Charger des brouillons existants
