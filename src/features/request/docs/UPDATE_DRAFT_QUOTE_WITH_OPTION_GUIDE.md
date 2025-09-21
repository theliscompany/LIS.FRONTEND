# Guide - Mise à jour d'un DraftQuote avec 1 option (API TanStack)

## 📋 **Vue d'ensemble**

Ce guide montre comment utiliser l'API TanStack pour mettre à jour un brouillon de devis avec une option complète.

## 🎯 **Structure du payload**

### **Type principal : `UpdateDraftQuoteRequest`**
```typescript
{
  customer?: DraftQuoteCustomerDto;
  shipment?: DraftQuoteShipmentDto;
  wizard?: DraftQuoteWizardDto;
  options?: Array<DraftQuoteOptionDto> | null;
  notes?: string | null;
}
```

## 📁 **Fichiers d'exemple**

### **1. `update-draft-quote-with-option-payload.json`**
- **Payload JSON complet** pour la mise à jour
- **Structure complète** avec tous les champs optionnels
- **1 option détaillée** avec tous ses composants

### **2. `update-draft-quote-example.ts`**
- **Code TypeScript** d'utilisation
- **Hook personnalisé** `useUpdateDraftQuoteWithOption`
- **Exemple d'intégration** dans un composant React

## 🔧 **Utilisation pratique**

### **Étape 1 : Importer les dépendances**
```typescript
import { useMutation } from '@tanstack/react-query';
import { putApiDraftQuotesByIdMutation } from '../../offer/api/@tanstack/react-query.gen';
import type { UpdateDraftQuoteRequest } from '../../offer/api/types.gen';
```

### **Étape 2 : Créer le hook de mutation**
```typescript
const useUpdateDraftQuoteWithOption = () => {
  return useMutation(putApiDraftQuotesByIdMutation());
};
```

### **Étape 3 : Utiliser dans un composant**
```typescript
const MyComponent = () => {
  const updateMutation = useUpdateDraftQuoteWithOption();

  const handleUpdate = async (draftId: string) => {
    try {
      const result = await updateMutation.mutateAsync({
        path: { id: draftId },
        body: updatePayload,
      });
      console.log('Mise à jour réussie:', result);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <button onClick={() => handleUpdate('draft-123')}>
      Mettre à jour le brouillon
    </button>
  );
};
```

## 📊 **Structure de l'option**

### **Option complète avec :**
- **Métadonnées** : `optionId`, `label`, `validUntil`, `currency`
- **Conteneurs** : Types et quantités
- **Planning** : Dates de départ/arrivée, temps de transit
- **Seafreight** : Transport maritime avec tarifs et surcharges
- **Haulages** : Transport terrestre avec fenêtres de chargement
- **Services** : Services additionnels (douane, documentation)
- **Totaux** : Calculs complets avec taxes
- **Conditions** : Politique de dépôt, conditions générales

## 🧮 **Calculs des totaux**

### **Exemple de calcul :**
```typescript
totals: {
  seafreightBase: 2050.00,        // 850 + 1200
  seafreightSurcharges: 317.75,   // 15.5% de 2050
  seafreightTotal: 2367.75,       // 2050 + 317.75
  haulageBase: 500.00,            // 250 * 2 conteneurs
  haulageSurcharges: 60.00,       // 12% de 500
  haulageTotal: 560.00,           // 500 + 60
  miscBase: 225.00,               // 150 + 75
  miscSurcharges: 0.00,           // Pas de surcharges
  miscTotal: 225.00,              // 225 + 0
  subtotal: 3152.75,              // 2367.75 + 560 + 225
  taxRate: 21.0,                  // TVA belge
  taxAmount: 662.08,              // 21% de 3152.75
  total: 3814.83,                 // 3152.75 + 662.08
  currency: "EUR"
}
```

## 🔍 **Points importants**

### **1. Types de conteneurs**
- **20GP** : 20 pieds General Purpose
- **40HC** : 40 pieds High Cube
- **Quantités** : Nombre de conteneurs de chaque type

### **2. Surcharges**
- **BUC** : Bunker Adjustment Factor (carburant)
- **FUEL** : Fuel Surcharge (carburant terrestre)
- **Calcul** : Pourcentage ou montant fixe

### **3. Services**
- **CUSTOMS** : Dédouanement
- **DOCS** : Documentation
- **Taxable** : Soumis à la TVA ou non

### **4. Planning**
- **Fenêtres de chargement** : Heures de début/fin
- **Temps de transit** : Durée totale du transport
- **Dates** : Format ISO 8601

## 🧪 **Test du payload**

### **Utiliser le composant de test :**
```typescript
import { UpdateDraftQuoteExample } from './update-draft-quote-example';

const TestComponent = () => {
  const { handleUpdateDraft, examplePayload } = UpdateDraftQuoteExample();
  
  return (
    <div>
      <button onClick={() => handleUpdateDraft('test-draft-id')}>
        Tester la mise à jour
      </button>
      <pre>{JSON.stringify(examplePayload, null, 2)}</pre>
    </div>
  );
};
```

## 📝 **Notes importantes**

- **Tous les champs sont optionnels** dans `UpdateDraftQuoteRequest`
- **L'option doit être complète** avec tous ses composants
- **Les calculs de totaux** doivent être cohérents
- **Les dates** doivent être au format ISO 8601
- **Les montants** sont en centimes ou avec décimales selon l'API

## 🚀 **Prochaines étapes**

1. **Adapter** le payload à vos besoins spécifiques
2. **Tester** avec l'API en mode développement
3. **Valider** les calculs de totaux
4. **Intégrer** dans votre application

L'exemple fourni est complet et prêt à l'emploi ! 🎉
