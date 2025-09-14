# Module de Gestion des Templates Email

Ce module fournit une interface moderne et complète pour la gestion des templates d'email dans l'application LIS Quotes.

## 🚀 Fonctionnalités

### 📧 Gestion des Templates
- **Création et édition** de templates avec interface intuitive
- **Aperçu en temps réel** avec données d'exemple
- **Validation automatique** des placeholders
- **Support multi-langues** (FR, EN, NL)
- **Gestion des versions** avec historique complet

### 🎨 Interface Utilisateur
- **Design moderne** avec Material-UI
- **Navigation par onglets** pour une meilleure organisation
- **Cartes interactives** pour chaque template
- **Recherche et filtrage** avancés
- **Responsive design** pour tous les appareils

### 📊 Statistiques et Analytics
- **Métriques d'utilisation** en temps réel
- **Taux de succès/erreur** par template
- **Temps de rendu moyen**
- **Placeholders les plus utilisés**
- **Historique des erreurs**

### 🔧 Fonctionnalités Avancées
- **Extraction automatique** des placeholders
- **Prévisualisation** avec données JSON personnalisées
- **Duplication** de templates existants
- **Restauration** de versions précédentes
- **Configuration** de moteurs de template (Liquid, Handlebars, Mustache)

## 📁 Structure du Module

```
src/features/template/
├── api/                          # API générée automatiquement
│   ├── @tanstack/
│   │   └── react-query.gen.ts    # Hooks React Query
│   ├── index.ts                  # Export API
│   ├── sdk.gen.ts               # Client SDK
│   └── types.gen.ts             # Types TypeScript
├── components/                   # Composants réutilisables
│   ├── EmailTemplateForm.tsx    # Formulaire de création/édition
│   ├── EmailTemplatePreview.tsx # Aperçu des templates
│   ├── EmailTemplateStats.tsx   # Statistiques détaillées
│   └── EmailTemplateHistory.tsx # Historique des versions
├── pages/                       # Pages principales
│   └── EmailTemplatesPage.tsx   # Page principale de gestion
├── index.ts                     # Exports du module
└── README.md                    # Documentation
```

## 🛠️ Utilisation

### Accès à la Page
La page des templates email est accessible via le menu "Masterdata" > "Templates Email" ou directement à l'URL `/email-templates`.

### Création d'un Template
1. Cliquer sur le bouton "+" (FAB) en bas à droite
2. Remplir les informations de base (nom, sujet, auteur)
3. Ajouter le contenu HTML et/ou texte
4. Configurer les types d'objets supportés
5. Ajouter des tags pour l'organisation
6. Prévisualiser avec des données d'exemple
7. Sauvegarder le template

### Édition d'un Template
1. Cliquer sur le menu "..." d'un template
2. Sélectionner "Modifier"
3. Apporter les modifications nécessaires
4. Prévisualiser les changements
5. Sauvegarder avec une description des changements

### Aperçu et Test
1. Cliquer sur "Aperçu" depuis la liste des templates
2. Entrer des données JSON d'exemple
3. Générer l'aperçu pour voir le rendu
4. Tester différents scénarios

## 🔌 API Backend

Le module utilise l'API backend suivante :

### Endpoints Principaux
- `GET /api/EmailTemplate` - Liste des templates avec filtres
- `POST /api/EmailTemplate` - Créer un nouveau template
- `GET /api/EmailTemplate/{id}` - Récupérer un template
- `PUT /api/EmailTemplate/{id}` - Mettre à jour un template
- `DELETE /api/EmailTemplate/{id}` - Supprimer un template

### Endpoints Spécialisés
- `POST /api/EmailTemplate/{id}/render` - Rendre un template
- `POST /api/EmailTemplate/render-direct` - Aperçu direct
- `POST /api/EmailTemplate/{id}/preview` - Prévisualisation
- `GET /api/EmailTemplate/{id}/stats` - Statistiques
- `GET /api/EmailTemplate/{id}/versions` - Historique des versions
- `POST /api/EmailTemplate/{id}/revert/{version}` - Restaurer une version

## 🎯 Fonctionnalités Techniques

### Gestion d'État
- **React Query** pour la gestion du cache et des requêtes
- **État local** pour les formulaires et interactions
- **Optimistic updates** pour une UX fluide

### Validation
- **Validation côté client** avec messages d'erreur contextuels
- **Extraction automatique** des placeholders
- **Vérification** de la syntaxe JSON pour les données d'exemple

### Performance
- **Lazy loading** des composants
- **Debouncing** pour l'extraction des placeholders
- **Pagination** pour les listes volumineuses
- **Cache intelligent** avec React Query

## 🎨 Design System

### Couleurs
- **Primaire** : #1976d2 (Bleu Material Design)
- **Succès** : #4caf50 (Vert)
- **Erreur** : #f44336 (Rouge)
- **Avertissement** : #ff9800 (Orange)

### Composants
- **Cards** avec effets de survol
- **Chips** pour les tags et statuts
- **Badges** pour les compteurs
- **Progress bars** pour les métriques
- **Dialogs** modaux pour les actions importantes

## 🔧 Configuration

### Moteurs de Template Supportés
- **Liquid** (par défaut)
- **Handlebars**
- **Mustache**

### Langues Supportées
- **Français** (fr)
- **English** (en)
- **Nederlands** (nl)

### Fuseaux Horaires
- **Europe/Paris** (par défaut)
- **UTC**
- **America/New_York**

## 🚀 Développement

### Ajout de Nouvelles Fonctionnalités
1. Créer le composant dans `components/`
2. Ajouter les types nécessaires
3. Implémenter les hooks React Query
4. Ajouter les tests unitaires
5. Mettre à jour la documentation

### Tests
```bash
# Tests unitaires
npm test -- --testPathPattern=template

# Tests d'intégration
npm run test:integration -- --testPathPattern=template
```

### Build
```bash
# Build de développement
npm run dev

# Build de production
npm run build
```

## 📝 Notes de Développement

### Génération de l'API
L'API est générée automatiquement à partir du fichier OpenAPI du backend :
```bash
npx @hey-api/openapi-ts --input ./openapi.json --output ./src/features/template/api
```

### Mise à Jour des Types
Après modification de l'API backend, régénérer les types :
```bash
npm run generate:api
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce module fait partie du projet LIS Quotes et suit la même licence que le projet principal. 