# 📚 Documentation du Projet Frontend - LIS Quotes UI

## 🎯 Vue d'ensemble

**LIS Quotes UI** est une application React TypeScript moderne pour la gestion des devis et offres de transport maritime. L'application utilise une architecture modulaire basée sur les features, avec une intégration complète des services backend via des SDKs générés automatiquement.

## 🏗️ Architecture du Projet

### Structure générale
```
LIS.QUOTES.UI/
├── 📁 src/                    # Code source principal
├── 📁 public/                 # Assets statiques
├── 📁 build/                  # Build de production
├── 📁 node_modules/           # Dépendances
├── 📄 package.json            # Configuration du projet
├── 📄 vite.config.ts          # Configuration Vite
└── 📄 tsconfig.json           # Configuration TypeScript
```

## 📁 Structure Détaillée des Dossiers

### 🔧 Configuration et Build

| Fichier/Dossier | Rôle | Description |
|---|---|---|
| `package.json` | Configuration du projet | Dépendances, scripts, métadonnées |
| `vite.config.ts` | Configuration Vite | Build tool et serveur de développement |
| `tsconfig.json` | Configuration TypeScript | Compilation et vérification de types |
| `eslint.config.js` | Configuration ESLint | Règles de qualité du code |
| `index.html` | Point d'entrée HTML | Template principal de l'application |

### 📦 Scripts de Génération SDK

| Script | Rôle | Description |
|---|---|---|
| `generate-client-*` | Génération SDK | Génère les clients API pour chaque service |
| `generate:all-local` | Génération complète | Génère tous les SDKs en local |
| `generate-sdk-types` | Types personnalisés | Génère des types TypeScript supplémentaires |

### 🎨 Assets et Ressources

| Dossier | Rôle | Contenu |
|---|---|---|
| `public/` | Assets statiques | Images, favicons, fichiers publics |
| `build/` | Build de production | Application compilée et optimisée |
| `artifacts/` | Fichiers de test | Données d'exemple et scénarios |

## 🏛️ Architecture du Code Source (`src/`)

### 🚀 Point d'Entrée

| Fichier | Rôle | Description |
|---|---|---|
| `main.tsx` | Point d'entrée React | Initialisation de l'application |
| `App.tsx` | Composant racine | Routage principal et structure globale |
| `App.css` | Styles globaux | CSS de base pour l'application |
| `index.css` | Styles de base | Reset CSS et variables globales |

### 🎨 Layout et Navigation

| Fichier/Dossier | Rôle | Description |
|---|---|---|
| `layout/Layout.tsx` | Layout principal | Navigation, sidebar, header |
| `config/msalConfig.ts` | Configuration MSAL | Authentification Azure AD |

### 🌐 Internationalisation

| Dossier | Rôle | Contenu |
|---|---|---|
| `locales/` | Traductions | Support multilingue (FR, EN, NL) |
| `locales/i18n.tsx` | Configuration i18n | Configuration des langues |
| `locales/translations/` | Fichiers de traduction | Textes traduits par langue |

### 🧩 Composants Partagés

| Dossier | Rôle | Description |
|---|---|---|
| `components/common/` | Composants communs | Composants réutilisables de base |
| `components/shared/` | Composants partagés | Composants métier partagés |
| `components/landingPage/` | Page d'accueil | Composants pour la landing page |
| `components/shipments/` | Composants transport | Composants liés aux expéditions |
| `components/skeletons/` | Squelettes de chargement | Composants de loading |
| `components/template/` | Composants template | Composants pour les templates |

### 🎣 Hooks Personnalisés

| Dossier | Rôle | Description |
|---|---|---|
| `hooks/` | Hooks React | Hooks personnalisés réutilisables |
| `hooks/useConfirmDialog.tsx` | Dialog de confirmation | Hook pour les confirmations |
| `hooks/useHelpers.ts` | Utilitaires | Fonctions helper communes |
| `hooks/useOnboarding.ts` | Onboarding | Hook pour le guide utilisateur |
| `hooks/usePendingQuotesCount.ts` | Compteur devis | Hook pour le comptage des devis |

### 📄 Pages Principales

| Dossier | Rôle | Description |
|---|---|---|
| `pages/` | Pages de l'application | Pages principales de l'application |
| `pages/Landing.tsx` | Page d'accueil | Page d'accueil publique |
| `pages/Login.tsx` | Connexion | Page de connexion |
| `pages/Overview.tsx` | Tableau de bord | Vue d'ensemble des données |
| `pages/NotFound.tsx` | Page 404 | Page d'erreur 404 |

### 🔧 Utilitaires

| Dossier | Rôle | Description |
|---|---|---|
| `utils/` | Utilitaires | Fonctions helper et utilitaires |
| `utils/functions.tsx` | Fonctions communes | Fonctions utilitaires générales |
| `utils/constants.tsx` | Constantes | Constantes de l'application |
| `utils/userUtils.tsx` | Utilitaires utilisateur | Fonctions liées aux utilisateurs |
| `utils/misc/` | Utilitaires divers | Fonctions utilitaires spécialisées |
| `utils/models/` | Modèles de données | Types et modèles de données |
| `utils/processes/` | Processus métier | Logique métier complexe |

### 🌐 API et Services

| Dossier | Rôle | Description |
|---|---|---|
| `api/` | Configuration API | Configuration des services API |
| `api/api.tsx` | Service API principal | Client API principal avec authentification |

## 🏗️ Architecture par Features

L'application utilise une architecture modulaire basée sur les **features** (fonctionnalités métier). Chaque feature est autonome et contient tous les éléments nécessaires à son fonctionnement.

### 📋 Feature: Request (Demandes)

| Dossier | Rôle | Description |
|---|---|---|
| `features/request/` | Gestion des demandes | Création et gestion des demandes de devis |
| `features/request/pages/` | Pages des demandes | Pages pour créer et gérer les demandes |
| `features/request/components/` | Composants demandes | Composants spécifiques aux demandes |
| `features/request/wizard/` | Assistant de création | Wizard multi-étapes pour créer une demande |
| `features/request/hooks/` | Hooks demandes | Hooks spécifiques aux demandes |
| `features/request/services/` | Services demandes | Logique métier des demandes |
| `features/request/api/` | API demandes | SDK généré pour l'API des demandes |
| `features/request/types/` | Types demandes | Types TypeScript spécifiques |
| `features/request/docs/` | Documentation | Documentation de la feature |

### 💰 Feature: Offer (Offres)

| Dossier | Rôle | Description |
|---|---|---|
| `features/offer/` | Gestion des offres | Création et gestion des offres de devis |
| `features/offer/pages/` | Pages des offres | Pages pour gérer les offres et devis |
| `features/offer/components/` | Composants offres | Composants pour les offres et devis |
| `features/offer/services/` | Services offres | Logique métier des offres |
| `features/offer/hooks/` | Hooks offres | Hooks spécifiques aux offres |
| `features/offer/api/` | API offres | SDK généré pour l'API des offres |
| `features/offer/types/` | Types offres | Types TypeScript spécifiques |
| `features/offer/styles/` | Styles offres | CSS spécifiques aux offres |
| `features/offer/examples/` | Exemples | Exemples d'utilisation |
| `features/offer/templates/` | Templates | Templates de devis |

### 🏢 Feature: MasterData (Données de référence)

| Dossier | Rôle | Description |
|---|---|---|
| `features/masterdata/` | Données de référence | Gestion des données maîtres |
| `features/masterdata/pages/` | Pages données maîtres | CRUD pour ports, produits, services |
| `features/masterdata/api/` | API données maîtres | SDK généré pour l'API des données maîtres |

### 💵 Feature: Pricing (Tarification)

| Dossier | Rôle | Description |
|---|---|---|
| `features/pricingnew/` | Nouvelle tarification | Système de tarification avancé |
| `features/pricingnew/pages/` | Pages tarification | Gestion des tarifs maritimes et terrestres |
| `features/pricingnew/components/` | Composants tarification | Composants pour la gestion des tarifs |

### 📧 Feature: CRM (Gestion client)

| Dossier | Rôle | Description |
|---|---|---|
| `features/crm/` | Gestion client | Gestion des contacts et clients |
| `features/crm/components/` | Composants CRM | Composants pour la gestion client |
| `features/crm/api/` | API CRM | SDK généré pour l'API CRM |

### 📄 Feature: Document (Documents)

| Dossier | Rôle | Description |
|---|---|---|
| `features/document/` | Gestion documents | Gestion des documents et fichiers |
| `features/document/api/` | API documents | SDK généré pour l'API des documents |

### 🚢 Feature: Shipment (Expéditions)

| Dossier | Rôle | Description |
|---|---|---|
| `features/shipment/` | Gestion expéditions | Suivi et gestion des expéditions |
| `features/shipment/api/` | API expéditions | SDK généré pour l'API des expéditions |

### 📝 Feature: Template (Templates)

| Dossier | Rôle | Description |
|---|---|---|
| `features/template/` | Gestion templates | Système de templates et génération |
| `features/template/components/` | Composants templates | Composants pour les templates |
| `features/template/pages/` | Pages templates | Gestion des templates |
| `features/template/services/` | Services templates | Logique de génération de templates |

### 💾 Feature: SessionStorage (Stockage session)

| Dossier | Rôle | Description |
|---|---|---|
| `features/sessionstorage/` | Stockage session | Gestion du stockage de session |
| `features/sessionstorage/api/` | API stockage | SDK généré pour l'API de stockage |

## 🔧 Structure des Features

Chaque feature suit une structure cohérente :

```
features/[feature-name]/
├── 📁 api/                    # SDK généré + configuration
│   ├── @tanstack/            # Hooks React Query
│   ├── sdk.gen.ts            # Client API généré
│   ├── types.gen.ts          # Types TypeScript générés
│   └── index.ts              # Exports de l'API
├── 📁 components/            # Composants React
├── 📁 pages/                 # Pages de l'application
├── 📁 hooks/                 # Hooks personnalisés
├── 📁 services/              # Logique métier
├── 📁 types/                 # Types TypeScript
├── 📁 styles/                # CSS spécifiques
├── 📁 utils/                 # Utilitaires
├── 📁 docs/                  # Documentation
└── 📄 index.ts               # Exports de la feature
```

## 🛠️ Technologies Utilisées

### 🎨 Frontend
- **React 18** - Framework UI
- **TypeScript** - Langage de programmation
- **Vite** - Build tool et serveur de développement
- **Material-UI (MUI)** - Bibliothèque de composants
- **React Router** - Routage côté client
- **React Query (TanStack)** - Gestion d'état serveur
- **React Hook Form** - Gestion des formulaires
- **Framer Motion** - Animations

### 🔐 Authentification
- **Azure MSAL** - Authentification Microsoft
- **JWT** - Tokens d'authentification

### 🌐 Internationalisation
- **i18next** - Framework d'internationalisation
- **react-i18next** - Intégration React

### 📊 Données
- **Axios** - Client HTTP
- **@hey-api/openapi-ts** - Génération de SDK
- **Zod** - Validation de schémas

### 🎨 UI/UX
- **Material-UI Icons** - Icônes
- **Chart.js** - Graphiques
- **Google Maps** - Cartes
- **Handlebars** - Templates

## 🚀 Scripts Disponibles

### 🛠️ Développement
```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run preview      # Aperçu du build
npm run lint         # Vérification du code
```

### 🔧 Génération SDK
```bash
# Génération pour tous les services (local)
npm run generate:all-local

# Génération individuelle
npm run generate-client-offer-local      # Service des offres
npm run generate-client-request-local    # Service des demandes
npm run generate-client-masterdata-local # Service des données maîtres
npm run generate-client-pricing-local    # Service de tarification
npm run generate-client-crm-local        # Service CRM
npm run generate-client-document-local   # Service des documents
npm run generate-client-shipment-local   # Service des expéditions
npm run generate-client-template-local   # Service des templates
npm run generate-client-sessionstorage-local # Service de stockage
```

## 📋 Workflow de Développement

### 1. 🚀 Démarrage
```bash
npm install          # Installation des dépendances
npm run dev          # Démarrage du serveur de développement
```

### 2. 🔧 Génération des SDKs
```bash
npm run generate:all-local  # Génération de tous les SDKs
```

### 3. 🏗️ Développement
- Modifier les composants dans `src/features/[feature]/`
- Utiliser les hooks générés pour les appels API
- Tester avec le serveur de développement

### 4. 🏗️ Build
```bash
npm run build        # Build de production
npm run preview      # Test du build
```

## 🎯 Bonnes Pratiques

### 📁 Organisation du Code
- **Une feature = un dossier** avec tous ses éléments
- **Composants réutilisables** dans `components/shared/`
- **Types partagés** dans `utils/models/`
- **Hooks communs** dans `hooks/`

### 🔧 Développement
- **TypeScript strict** - Utiliser les types générés
- **Composants fonctionnels** - Hooks React
- **Gestion d'état** - React Query pour le serveur
- **Formulaires** - React Hook Form + validation Zod

### 📚 Documentation
- **README.md** dans chaque feature
- **Commentaires** dans le code complexe
- **Types TypeScript** bien documentés

## 🔍 Points d'Entrée Principaux

### 🏠 Application
- **`src/main.tsx`** - Point d'entrée React
- **`src/App.tsx`** - Routage et structure globale
- **`src/layout/Layout.tsx`** - Layout principal

### 🎨 Features Principales
- **`src/features/request/`** - Création de demandes
- **`src/features/offer/`** - Gestion des offres
- **`src/features/pricingnew/`** - Tarification
- **`src/features/masterdata/`** - Données de référence

### 🔧 Configuration
- **`package.json`** - Dépendances et scripts
- **`vite.config.ts`** - Configuration build
- **`tsconfig.json`** - Configuration TypeScript

## 📞 Support et Maintenance

### 🐛 Debugging
- **React Query DevTools** - Inspection des requêtes
- **ESLint** - Vérification du code
- **TypeScript** - Vérification des types

### 🔄 Mise à Jour
- **SDKs** - Régénération avec les nouveaux endpoints
- **Dépendances** - Mise à jour régulière
- **Types** - Synchronisation avec le backend

---

*Cette documentation est maintenue à jour avec l'évolution du projet. Pour toute question, consulter les README spécifiques de chaque feature.*
