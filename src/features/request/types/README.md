# Types et Interfaces pour les Brouillons de Devis

## Structure des Fichiers

```
src/features/request/types/
├── DraftQuote.ts          # Interface principale et fonctions utilitaires
├── index.ts               # Point d'entrée pour les exports
└── README.md              # Cette documentation
```

## Interface DraftQuote

L'interface `DraftQuote` est parfaitement alignée avec le SDK de l'API et contient :

### Structure Principale
- **Identifiants** : `id`, `requestQuoteId`, `emailUser`, `clientNumber`
- **Données structurées** : `draftData` avec `wizard`, `steps`, et `totals`
- **Propriétés de compatibilité** : Accès direct aux étapes via `step1`, `step2`, etc.

### Alignement SDK
La structure `draftData` correspond exactement au format attendu par l'API :
- `OptimizedCreateWizardDraftRequest` pour la création
- `OptimizedDraftData` pour la persistance

## Fonctions Utilitaires

### `createInitialDraftQuote(currentUserEmail?)`
Crée un brouillon initial avec des valeurs par défaut.

### `syncDraftQuoteData(draftQuote)`
Synchronise automatiquement les propriétés de compatibilité avec `draftData`.

### `buildSDKPayload(draftQuote, accountUsername?)`
Construit le payload exact attendu par l'API pour la sauvegarde.

## Utilisation

```typescript
import { 
  DraftQuote, 
  createInitialDraftQuote, 
  syncDraftQuoteData, 
  buildSDKPayload 
} from '../types';

// Créer un nouveau brouillon
const draft = createInitialDraftQuote('user@example.com');

// Synchroniser les données
const syncedDraft = syncDraftQuoteData(draft);

// Construire le payload pour l'API
const payload = buildSDKPayload(syncedDraft, 'user@example.com');
```

## Avantages de cette Structure

1. **Séparation des responsabilités** : Types et logique métier séparés du composant
2. **Réutilisabilité** : Interface utilisable dans d'autres composants
3. **Maintenabilité** : Modifications centralisées dans un seul fichier
4. **Alignement SDK** : Structure parfaitement compatible avec l'API
5. **Type Safety** : TypeScript strict pour éviter les erreurs à la compilation
