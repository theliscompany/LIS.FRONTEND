# Pipeline de Templating - Implémentation Frontend

## Vue d'ensemble

Cette implémentation fournit un pipeline complet de templating côté frontend avec :
- **Helpers Handlebars partagés** entre frontend et backend
- **Aperçu live** avec rendu frontend et API
- **Diagnostics** en temps réel
- **Éditeur de données JSON** avec validation
- **Gestion des schémas d'objets**

## Architecture

### 1. Helpers Handlebars (`utils/handlebarsHelpers.ts`)

```typescript
// Helpers disponibles
formatDate(value, format, culture)     // Formatage de dates
formatCurrency(value, currency, culture) // Formatage de devises
formatNumber(value, decimals, culture)  // Formatage de nombres
upper(value)                           // Conversion majuscules
lower(value)                           // Conversion minuscules
truncate(value, length)                // Troncature de texte
ifGreater(a, b, options)              // Comparaison numérique
ifLess(a, b, options)                 // Comparaison numérique
ifEqual(a, b, options)                // Égalité
ifExists(value, options)              // Vérification d'existence
concat(...args)                       // Concaténation
add(a, b), subtract(a, b), multiply(a, b), divide(a, b) // Mathématiques
formatIf(value, format, options)      // Formatage conditionnel
sum(items, property)                  // Somme de propriétés
count(items)                          // Comptage d'éléments
default(value, defaultValue)          // Valeur par défaut
```

### 2. API Client (`api/templateApi.ts`)

```typescript
// Fonctions disponibles
renderDirect(body: RenderDirectRequest)     // Rendu direct sans sauvegarde
renderById(id: string, data: any)          // Rendu par ID de template
extractPlaceholders(htmlBody: string)       // Extraction des placeholders
validateById(id: string, data: any)        // Validation des données
validateDirect(htmlBody: string, data: any) // Validation directe
```

### 3. Composants

#### DataEditor
- Éditeur JSON avec validation en temps réel
- Détection automatique des placeholders
- Chargement d'exemples
- Formatage JSON

#### DiagnosticsPanel
- Affichage des placeholders manquants
- Warnings et erreurs
- Résumé des diagnostics
- Export des diagnostics

#### ObjectSchemaEditor
- Création/modification de schémas d'objets
- Validation JSON
- Interface utilisateur intuitive
- Exemples intégrés

#### EmailTemplatePreview (amélioré)
- Rendu frontend et API côte à côte
- Mode debug pour comparaison
- Diagnostics intégrés
- Contrôles de rendu

## Utilisation

### 1. Enregistrement des Helpers

```typescript
import { registerSharedHelpers } from '../utils/handlebarsHelpers';

// Dans votre composant
useEffect(() => {
  registerSharedHelpers();
}, []);
```

### 2. Compilation de Template

```typescript
import { compileTemplate } from '../utils/handlebarsHelpers';

const html = compileTemplate(template.htmlBody, data);
```

### 3. Validation de Données

```typescript
import { validateTemplateData } from '../utils/handlebarsHelpers';

const validation = validateTemplateData(template.htmlBody, data);
console.log(validation.missing); // Placeholders manquants
console.log(validation.warnings); // Avertissements
```

### 4. Utilisation des Composants

```typescript
import { DataEditor, DiagnosticsPanel, ObjectSchemaEditor } from './components';

// Dans votre composant
<DataEditor
  template={template}
  sampleData={sampleData}
  onSampleDataChange={setSampleData}
  onValidationChange={handleValidation}
/>

<DiagnosticsPanel diagnostics={diagnostics} />

<ObjectSchemaEditor
  objectSchemas={objectSchemas}
  onObjectSchemasChange={setObjectSchemas}
/>
```

## Mapping des Placeholders

### Structure de Données

```json
{
  "client": {
    "name": "Jean Dupont",
    "email": "jean.dupont@example.com"
  },
  "order": {
    "number": "CMD-2024-001",
    "total": 1250.50,
    "items": [
      { "name": "Produit A", "price": 500.00 }
    ]
  }
}
```

### Placeholders Correspondants

```handlebars
{{client.name}}           // Jean Dupont
{{client.email}}          // jean.dupont@example.com
{{order.number}}          // CMD-2024-001
{{formatCurrency order.total}} // 1 250,50 €
{{#each order.items}}
  {{name}}: {{formatCurrency price}}
{{/each}}
```

## Critères d'Acceptation

✅ **Preview front et API donnent le même rendu** (à helpers équivalents)
✅ **Diagnostics visibles et compréhensibles** (missing/warnings)
✅ **Édition simple du sampleData** + import/édition d'ObjectSchemas
✅ **Appels HTTP alignés** sur les endpoints backend
✅ **Helpers Handlebars partagés** entre frontend et backend
✅ **Validation en temps réel** des données JSON
✅ **Interface utilisateur intuitive** avec Material-UI

## Fonctionnalités Avancées

### 1. Comparaison Frontend vs API
- Rendu côte à côte
- Mode debug pour inspection
- Différences visuelles

### 2. Diagnostics Intelligents
- Placeholders manquants en temps réel
- Warnings pour valeurs vides
- Suggestions d'amélioration

### 3. Gestion des Schémas
- Validation structurelle
- Documentation intégrée
- Réutilisabilité

### 4. Performance
- Compilation lazy des templates
- Mise en cache des helpers
- Validation optimisée

## Extensions Futures

1. **Templates réutilisables** avec héritage
2. **Validation avancée** avec JSON Schema
3. **Historique des versions** de templates
4. **Tests automatisés** de templates
5. **Export/Import** de configurations
6. **Collaboration** en temps réel

## Dépannage

### Erreurs Courantes

1. **Helpers non enregistrés** : Vérifiez `registerSharedHelpers()`
2. **JSON invalide** : Utilisez l'éditeur avec validation
3. **Placeholders manquants** : Consultez les diagnostics
4. **Différences frontend/API** : Activez le mode debug

### Debug

```typescript
// Activation du mode debug
const [showDebug, setShowDebug] = useState(true);

// Comparaison des résultats
console.log('Frontend:', frontendResult);
console.log('API:', apiResult);
```

## Tests

```typescript
// Test des helpers
import { compileTemplate } from '../utils/handlebarsHelpers';

const template = "Bonjour {{name}}, total: {{formatCurrency amount}}";
const data = { name: "Jean", amount: 1250.50 };
const result = compileTemplate(template, data);
// Résultat: "Bonjour Jean, total: 1 250,50 €"
```

Cette implémentation fournit une base solide pour le pipeline de templating avec une parité complète entre frontend et backend.
