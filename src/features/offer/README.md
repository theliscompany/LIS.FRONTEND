# Draft Quote Management System

Ce module implémente la gestion des brouillons de devis (Draft Quotes) avec la nouvelle structure API.

## 🚀 Fonctionnalités

- **Gestion complète des brouillons** : Création, lecture, mise à jour, suppression
- **Gestion des options** : Ajout, modification, suppression d'options de devis
- **Validation en temps réel** : Validation des données avant sauvegarde
- **Finalisation des devis** : Conversion des brouillons en devis officiels
- **Interface utilisateur responsive** : Composants adaptatifs pour tous les écrans
- **Intégration React Query** : Gestion optimisée du cache et des requêtes

## 📁 Structure des fichiers

```
src/features/offer/
├── api/                          # API générée automatiquement
│   ├── @tanstack/react-query.gen.ts
│   ├── types.gen.ts
│   └── sdk.gen.ts
├── components/                   # Composants React
│   ├── DraftQuoteManager.tsx     # Gestionnaire principal
│   ├── DraftQuoteEditor.tsx      # Éditeur complet
│   ├── DraftQuoteOptionEditor.tsx # Éditeur d'options
│   └── DraftQuoteExample.tsx     # Exemple d'utilisation
├── hooks/                        # Hooks personnalisés
│   └── useDraftQuoteState.ts     # Gestion d'état
├── services/                     # Services API
│   └── draftQuoteService.ts      # Service principal
├── styles/                       # Styles CSS
│   └── DraftQuote.css           # Styles des composants
├── types/                        # Types TypeScript
│   └── DraftQuote.ts            # Types principaux
├── pages/                        # Pages
│   └── DraftQuotesPage.tsx      # Page principale
├── index.ts                      # Exports
└── README.md                     # Documentation
```

## 🛠️ Installation et utilisation

### 1. Importer les composants

```tsx
import { DraftQuoteManager, DraftQuoteEditor } from '@/features/offer';
import type { DraftQuote } from '@/features/offer/types/DraftQuote';
```

### 2. Utiliser le gestionnaire principal

```tsx
function MyPage() {
  const handleQuoteCreated = (quoteId: string) => {
    console.log('Quote created:', quoteId);
    // Rediriger ou afficher une notification
  };

  return (
    <DraftQuoteManager
      onQuoteCreated={handleQuoteCreated}
    />
  );
}
```

### 3. Utiliser l'éditeur

```tsx
function EditDraftPage() {
  const handleSave = (draftQuote: Partial<DraftQuote>) => {
    // Sauvegarder le brouillon
    console.log('Saving:', draftQuote);
  };

  const handleFinalize = (selectedOptionId: string) => {
    // Finaliser le brouillon
    console.log('Finalizing with option:', selectedOptionId);
  };

  return (
    <DraftQuoteEditor
      onSave={handleSave}
      onCancel={() => navigate('/drafts')}
      onFinalize={handleFinalize}
    />
  );
}
```

### 4. Utiliser le hook d'état

```tsx
function CustomDraftEditor() {
  const {
    draftQuote,
    selectedOptionId,
    validation,
    updateCustomer,
    updateShipment,
    addOption,
    canFinalize,
  } = useDraftQuoteState({
    onValidationChange: (isValid, errors) => {
      console.log('Validation:', { isValid, errors });
    },
  });

  // Votre logique personnalisée...
}
```

## 🔧 API Endpoints

Le système utilise les endpoints suivants :

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/draft-quotes` | Créer un brouillon |
| `GET` | `/api/draft-quotes` | Lister les brouillons |
| `GET` | `/api/draft-quotes/{id}` | Récupérer un brouillon |
| `PUT` | `/api/draft-quotes/{id}` | Mettre à jour un brouillon |
| `DELETE` | `/api/draft-quotes/{id}` | Supprimer un brouillon |
| `POST` | `/api/draft-quotes/{id}/options` | Ajouter une option |
| `DELETE` | `/api/draft-quotes/{id}/options/{optionId}` | Supprimer une option |
| `POST` | `/api/draft-quotes/{id}/finalize` | Finaliser un brouillon |
| `POST` | `/api/quotes` | Créer un devis |

## 📊 Types principaux

### DraftQuote

```typescript
interface DraftQuote {
  draftQuoteId?: string;
  requestQuoteId?: string;
  resumeToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
  status?: DraftQuoteStatus;
  currency?: string;
  incoterm?: string;
  customer?: DraftQuoteCustomer;
  shipment?: DraftQuoteShipment;
  attachments?: DraftQuoteAttachment[];
  commercialTerms?: DraftQuoteCommercialTerms;
  wizard?: DraftQuoteWizard;
  options?: DraftQuoteOption[];
}
```

### DraftQuoteOption

```typescript
interface DraftQuoteOption {
  optionId?: string;
  label?: string;
  validUntil?: string;
  currency?: string;
  containers?: DraftQuoteOptionContainer[];
  planning?: DraftQuotePlanning;
  seafreight?: DraftQuoteOptionSeafreight;
  haulages?: DraftQuoteOptionHaulage[];
  services?: DraftQuoteOptionService[];
  totals?: DraftQuoteOptionTotals;
  terms?: DraftQuoteOptionTerms;
}
```

## 🎨 Personnalisation

### Styles CSS

Les composants utilisent des classes CSS modulaires. Vous pouvez personnaliser l'apparence en modifiant le fichier `styles/DraftQuote.css` :

```css
.draft-quote-manager {
  /* Styles personnalisés */
}

.option-editor.selected {
  border-color: #your-color;
}
```

### Validation

Vous pouvez ajouter des règles de validation personnalisées dans `draftQuoteService.ts` :

```typescript
export const validateDraftQuote = (draftQuote: Partial<DraftQuote>) => {
  const errors: string[] = [];
  
  // Vos règles personnalisées
  if (draftQuote.customer?.name?.length < 3) {
    errors.push('Customer name must be at least 3 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};
```

## 🔄 Workflow de finalisation

1. **Création** : L'utilisateur crée un brouillon de devis
2. **Configuration** : Ajout des informations client, expédition, etc.
3. **Options** : Création et configuration des options de devis
4. **Validation** : Vérification des données avant finalisation
5. **Sélection** : Choix de l'option à finaliser
6. **Finalisation** : Conversion en devis officiel
7. **Envoi** : Envoi du devis au client

## 🐛 Dépannage

### Erreurs de validation

Si vous rencontrez des erreurs de validation, vérifiez :
- Les champs obligatoires sont remplis
- Les formats de données sont corrects
- Les contraintes métier sont respectées

### Problèmes d'API

Si les appels API échouent :
- Vérifiez la configuration de l'API
- Vérifiez les tokens d'authentification
- Consultez les logs de la console

### Performance

Pour optimiser les performances :
- Utilisez la pagination pour les listes
- Implémentez la mise en cache côté client
- Optimisez les requêtes avec React Query

## 📝 Exemples d'utilisation

### Créer un brouillon programmatiquement

```typescript
import { useCreateDraftQuote } from '@/features/offer';

function CreateDraftButton() {
  const createMutation = useCreateDraftQuote();
  
  const handleCreate = async () => {
    const newDraft = {
      requestQuoteId: 'RQ-123',
      customer: {
        name: 'Acme Corp',
        type: 'company',
      },
      shipment: {
        origin: { location: 'Hamburg', country: 'DE' },
        destination: { location: 'New York', country: 'US' },
        containerTypes: ['20GP'],
      },
    };
    
    await createMutation.mutateAsync({ body: newDraft });
  };
  
  return <button onClick={handleCreate}>Create Draft</button>;
}
```

### Écouter les changements d'état

```typescript
import { useDraftQuoteState } from '@/features/offer';

function DraftStatusWatcher() {
  const { draftQuote, validation } = useDraftQuoteState({
    onValidationChange: (isValid, errors) => {
      if (!isValid) {
        console.warn('Validation errors:', errors);
      }
    },
  });
  
  return (
    <div>
      Status: {draftQuote.status}
      {!validation.isValid && (
        <div>Errors: {validation.errors.join(', ')}</div>
      )}
    </div>
  );
}
```

## 🤝 Contribution

Pour contribuer à ce module :

1. Suivez les conventions de code existantes
2. Ajoutez des tests pour les nouvelles fonctionnalités
3. Mettez à jour la documentation
4. Testez sur différents navigateurs et appareils

## 📄 Licence

Ce module fait partie du projet LIS Quotes UI et est soumis aux mêmes conditions de licence.
