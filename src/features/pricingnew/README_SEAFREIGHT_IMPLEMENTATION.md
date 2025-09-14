# Implémentation de la Gestion SeaFreight

## Vue d'ensemble

L'implémentation de la gestion SeaFreight suit la même logique que les Haulage et Miscellaneous, avec une architecture cohérente utilisant les SDK générés et les hooks TanStack Query.

## Structure des Composants

### 1. Composants Principaux

#### `SeaFreightList.tsx`
- **Fonction** : Affichage de la liste des offres SeaFreight
- **Fonctionnalités** :
  - Affichage en cartes et en liste
  - Filtrage par transporteur, port de départ/arrivée
  - Actions CRUD (Créer, Lire, Modifier, Supprimer)
  - Utilisation des hooks TanStack Query générés
  - Interface responsive avec Material-UI

#### `SeaFreightDetails.tsx`
- **Fonction** : Affichage détaillé d'une offre SeaFreight
- **Fonctionnalités** :
  - Mode modal et page complète
  - Affichage structuré des informations
  - Navigation vers l'édition
  - Design moderne avec avatars et icônes

#### `SeaFreightForm.tsx`
- **Fonction** : Formulaire de création/édition d'offres
- **Fonctionnalités** :
  - Interface à onglets pour une meilleure UX
  - Validation des champs obligatoires
  - Intégration avec AutoCompletePort et AutoCompleteContact
  - Gestion des charges détaillées
  - Support des conteneurs Reefer

### 2. Pages

#### `SeaFreightPage.tsx`
- **Fonction** : Page principale de gestion SeaFreight
- **Fonctionnalités** :
  - Header avec statistiques
  - Toggle entre modes d'affichage
  - Bouton de création
  - Design moderne avec gradient

#### `SeaFreightCRUDPage.tsx`
- **Fonction** : Page de création/édition
- **Fonctionnalités** :
  - Gestion des modes création/édition
  - Breadcrumbs de navigation
  - Messages d'erreur et de succès
  - Intégration avec les mutations TanStack Query

#### `SeaFreightDetailsPage.tsx`
- **Fonction** : Page de détails
- **Fonctionnalités** :
  - Chargement des données avec useQuery
  - Gestion des états de chargement et d'erreur

## Intégration avec l'API

### SDK Généré
```typescript
// Fonctions disponibles
getApiSeaFreight()                    // Liste toutes les offres
getApiSeaFreightById({ id })          // Récupère une offre par ID
postApiSeaFreight({ body })           // Crée une nouvelle offre
putApiSeaFreightById({ id, body })    // Met à jour une offre
deleteApiSeaFreightById({ id })       // Supprime une offre
```

### Hooks TanStack Query
```typescript
// Hooks générés automatiquement
getApiSeaFreightOptions()             // Options pour useQuery
getApiSeaFreightByIdOptions()         // Options pour useQuery avec ID
postApiSeaFreightMutation()           // Mutation pour création
putApiSeaFreightByIdMutation()        // Mutation pour mise à jour
deleteApiSeaFreightByIdMutation()     // Mutation pour suppression
getApiSeaFreightQueryKey()            // Clé de cache pour invalidation
```

## Types TypeScript

### Types Principaux
```typescript
SeaFreightResponse          // Réponse complète d'une offre
SeaFreightCreateRequest     // Données pour création
SeaFreightUpdateRequest     // Données pour mise à jour
SeaFreightSearchRequest     // Critères de recherche
```

### Types Associés
```typescript
Carrier                     // Transporteur
Port                        // Port (départ/arrivée)
Container                   // Type de conteneur
Charges                     // Charges détaillées
Validity                    // Période de validité
```

## Fonctionnalités Spécifiques SeaFreight

### 1. Gestion des Ports
- Intégration avec `AutoCompletePort` pour la sélection des ports
- Support des codes UNLOCODE
- Validation des ports de départ et d'arrivée

### 2. Types de Conteneurs
- Support des types standards : 20GP, 40GP, 40HC, 45HC, 20RF, 40RF, 40HRF
- Gestion des conteneurs Reefer
- Validation du type de conteneur

### 3. Charges Détaillées
- Fret de base
- BAF (Bunker Adjustment Factor)
- CAF (Currency Adjustment Factor)
- THC (Terminal Handling Charges) origine et destination
- Autres charges

### 4. Incoterms
- Support des 11 incoterms standards
- Validation et sélection dans le formulaire

### 5. Validité
- Période de validité avec dates de début et fin
- Validation des dates
- Interface de sélection de dates

## Interface Utilisateur

### Design System
- **Couleurs** : Gradient bleu-violet (#667eea → #764ba2)
- **Composants** : Material-UI avec personnalisation
- **Responsive** : Support mobile, tablette et desktop
- **Animations** : Transitions fluides et hover effects

### Navigation
```
/pricingnew/seafreight              // Liste des offres
/pricingnew/seafreight/new          // Création
/pricingnew/seafreight/:id          // Édition
/pricingnew/seafreight/details/:id  // Détails
```

## Gestion d'État

### TanStack Query
- **Cache** : Mise en cache automatique des requêtes
- **Invalidation** : Rechargement automatique après mutations
- **Optimistic Updates** : Mise à jour immédiate de l'UI
- **Error Handling** : Gestion centralisée des erreurs

### État Local
- **Filtres** : Recherche et filtrage en temps réel
- **Mode d'affichage** : Toggle entre cartes et liste
- **Formulaires** : État local avec validation

## Validation

### Champs Obligatoires
- Transporteur
- Port de départ
- Port d'arrivée
- Type de conteneur
- Prix de base
- Temps de transit
- Dates de validité

### Validation Métier
- Prix > 0
- Temps de transit > 0
- Date de fin > Date de début
- Ports différents

## Tests et Qualité

### Points de Test Recommandés
1. **Création** : Validation des champs obligatoires
2. **Édition** : Chargement et mise à jour des données
3. **Suppression** : Confirmation et mise à jour de la liste
4. **Filtrage** : Recherche par transporteur et ports
5. **Navigation** : Liens entre les pages
6. **Responsive** : Affichage sur différents écrans

### Gestion d'Erreurs
- Erreurs réseau
- Erreurs de validation
- Erreurs de serveur
- États de chargement

## Déploiement

### Prérequis
- SDK généré à jour
- API backend fonctionnelle
- Routes configurées dans le routeur

### Configuration
- Variables d'environnement pour l'URL de l'API
- Configuration TanStack Query
- Configuration Material-UI

## Maintenance

### Mises à Jour
- Synchronisation avec les changements d'API
- Mise à jour des types TypeScript
- Régénération du SDK si nécessaire

### Monitoring
- Logs des erreurs
- Performance des requêtes
- Utilisation des fonctionnalités

## Conclusion

L'implémentation SeaFreight suit les meilleures pratiques de développement React avec TypeScript, utilisant une architecture moderne avec TanStack Query et Material-UI. La structure est cohérente avec les autres modules (Haulage, Miscellaneous) et facilite la maintenance et l'évolution du code. 