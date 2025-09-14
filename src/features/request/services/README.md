# Services de Génération JSON de Devis

Ce dossier contient les services pour générer, valider et exporter des devis au format JSON standardisé.

## 📁 Structure des Fichiers

```
services/
├── QuoteJsonGenerator.ts    # Génération du JSON de devis
├── QuoteValidator.ts        # Validation du JSON généré
├── QuoteExporter.ts         # Export et envoi par email
├── __tests__/              # Tests unitaires
│   └── QuoteJsonGenerator.test.ts
└── README.md               # Cette documentation
```

## 🎯 Fonctionnalités

### 1. QuoteJsonGenerator
Génère un JSON de devis formaté selon le standard défini dans le scénario de test.

**Méthodes principales :**
- `generateQuoteJson(selectedOption, allOptions, clientData?)` : Génère le JSON complet
- `generateReference()` : Génère une référence unique
- `calculateTotals(allOptions)` : Calcule les totaux par option

**Format JSON généré :**
```json
{
  "reference": "DEV2025-0127-001",
  "client": "Société Alpha Logistics",
  "date": "27/01/2025",
  "origin": "Anvers (BEANR)",
  "destination": "Douala, Cameroun (CMDLA)",
  "incoterm": "FOB",
  "validity": "14 jours",
  "options": [
    {
      "option_id": "Option 1",
      "transit_time": 20,
      "port_of_loading": "Anvers (BEANR)",
      "containers": [...]
    }
  ],
  "remarks": [...],
  "metadata": {...},
  "totals": {...}
}
```

### 2. QuoteValidator
Valide la structure et la cohérence du JSON généré.

**Méthodes principales :**
- `validateQuoteJson(quoteJson)` : Validation de base
- `validateQuoteWithRealData(quoteJson, originalData)` : Validation croisée avec données originales

**Types de validation :**
- ✅ Champs obligatoires
- ✅ Format de référence
- ✅ Structure des options
- ✅ Calculs des totaux
- ✅ Types de conteneurs
- ✅ Montants cohérents

### 3. QuoteExporter
Gère l'export et l'envoi par email des devis JSON.

**Méthodes principales :**
- `exportQuoteAsJson(selectedOption, allOptions, options)` : Téléchargement automatique
- `sendQuoteEmail(selectedOption, allOptions, emailData, options)` : Envoi par email
- `generateQuotePreview(selectedOption, allOptions, options)` : Prévisualisation

## 🔧 Intégration dans le Workflow

### Étape 1 : Finalisation (Agent)
```typescript
// Dans FinalValidation.tsx
const handleGenerateJsonPreview = () => {
  const preview = QuoteExporter.generateQuotePreview(selectedOption, allOptions);
  setQuoteJsonData(preview.json);
  setJsonValidation(preview.validation);
  setShowJsonPreview(true);
};
```

### Étape 2 : Validation (Superviseur)
```typescript
// Dans QuoteApproval.tsx
const handleApprove = async () => {
  if (selectedQuote.quoteJson) {
    const validation = QuoteValidator.validateQuoteJson(selectedQuote.quoteJson);
    if (!validation.isValid) {
      showSnackbar('Erreur dans le format JSON du devis', 'error');
      return;
    }
  }
  // ... validation continue
};
```

### Étape 3 : Envoi au Client (Agent)
```typescript
// Dans FinalValidation.tsx
const handleSendJsonEmail = async () => {
  const success = await QuoteExporter.sendQuoteEmail(
    selectedOption, 
    allOptions, 
    { to: clientEmail, subject: 'Devis' }
  );
};
```

## 📊 Interface Utilisateur

### Boutons d'Action
- **Prévisualiser JSON** : Affiche le JSON avec validation
- **Exporter JSON** : Télécharge le fichier JSON
- **Envoyer par Email** : Envoie le devis par email

### Dialogue de Prévisualisation
- ✅ Affichage du JSON formaté
- ✅ Résultats de validation (erreurs, avertissements, suggestions)
- ✅ Sélection du format (JSON formaté/minifié)
- ✅ Actions d'export et d'envoi

## 🧪 Tests

### Exécution des Tests
```bash
npm test -- --testPathPattern=QuoteJsonGenerator.test.ts
```

### Tests Inclus
- ✅ Génération de JSON valide
- ✅ Format de référence correct
- ✅ Structure des options
- ✅ Calculs des totaux
- ✅ Validation des champs obligatoires
- ✅ Détection des erreurs de format

## 📋 Scénario de Test

Le système est basé sur le scénario de test fourni :

**Contexte :** Transport maritime Belgique → Cameroun
- **Option 1** : 2x20'DC + 1x40'HC (Anvers) - 20 jours
- **Option 2** : 3x20'DC (Rotterdam) - 22 jours  
- **Option 3** : LCL (Anvers) - 25 jours

**Services inclus :**
- Transport routier (haulage)
- Fret maritime avec surcharges
- Assurance et documentation
- Calculs automatiques des totaux

## 🚀 Utilisation

### Génération Simple
```typescript
import { QuoteJsonGenerator } from './services/QuoteJsonGenerator';

const quoteJson = QuoteJsonGenerator.generateQuoteJson(selectedOption, allOptions);
```

### Validation
```typescript
import { QuoteValidator } from './services/QuoteValidator';

const validation = QuoteValidator.validateQuoteJson(quoteJson);
if (!validation.isValid) {
  console.error('Erreurs:', validation.errors);
}
```

### Export
```typescript
import { QuoteExporter } from './services/QuoteExporter';

await QuoteExporter.exportQuoteAsJson(selectedOption, allOptions, {
  format: 'json',
  filename: 'devis_export.json'
});
```

## 🔄 Workflow Complet

1. **Agent** : Utilise le Wizard pour définir les options
2. **Agent** : Compare et sélectionne l'option préférée
3. **Agent** : Finalise avec génération JSON
4. **Superviseur** : Valide le devis (automatique + manuel)
5. **Agent** : Envoie au client avec template email

## 📈 Bénéfices

### Pour l'Agent
- ✅ Format standardisé des devis
- ✅ Export facile en JSON
- ✅ Prévisualisation avant envoi
- ✅ Validation automatique

### Pour le Superviseur
- ✅ Validation du format JSON
- ✅ Contrôle qualité renforcé
- ✅ Traçabilité complète

### Pour le Client
- ✅ Format professionnel des devis
- ✅ Données structurées pour intégration
- ✅ Transparence totale

## 🔧 Configuration

### Variables d'Environnement
```env
# Format d'export par défaut
VITE_DEFAULT_EXPORT_FORMAT=json

# Template d'email par défaut
VITE_DEFAULT_EMAIL_TEMPLATE=maritime_quote

# Devise par défaut
VITE_DEFAULT_CURRENCY=EUR
```

### Personnalisation
Les services peuvent être étendus pour :
- ✅ Nouveaux types de conteneurs
- ✅ Surcharges personnalisées
- ✅ Templates d'email spécifiques
- ✅ Formats d'export additionnels

## 📝 Notes de Développement

### Prochaines Étapes
1. ✅ Intégration avec le service d'email réel
2. ✅ Templates d'email personnalisables
3. ✅ Export en lot de plusieurs devis
4. ✅ Intégration avec l'API de validation superviseur
5. ✅ Historique des exports et envois

### Dépendances
- Material-UI pour l'interface
- React pour les composants
- TypeScript pour le typage
- Jest pour les tests

---

**Version :** 1.0  
**Date :** 27/01/2025  
**Auteur :** Équipe LIS Quotes 