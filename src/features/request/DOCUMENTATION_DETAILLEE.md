# 📋 Documentation Détaillée - Feature Request

## 🎯 Vue d'ensemble

La feature **Request** est le cœur de l'application LIS Quotes UI. Elle gère la création, la modification et la gestion des demandes de devis de transport maritime. Cette feature est organisée en modules spécialisés pour une architecture claire et maintenable.

## 📁 Structure Complète

```
src/features/request/
├── 📁 adapters/              # Adaptateurs de données
├── 📁 api/                   # SDK généré et configuration API
├── 📁 components/            # Composants React (57 fichiers)
├── 📁 context/               # Context React (vide)
├── 📁 docs/                  # Documentation technique (15 fichiers)
├── 📁 examples/              # Exemples et données de test
├── 📁 hooks/                 # Hooks personnalisés (10 fichiers)
├── 📁 pages/                 # Pages de l'application (10 fichiers)
├── 📁 scripts/               # Scripts utilitaires (vide)
├── 📁 services/              # Services métier (7 fichiers)
├── 📁 types/                 # Types TypeScript (3 fichiers)
├── 📁 utils/                 # Utilitaires (7 fichiers)
└── 📁 wizard/                # Assistant de création (51 fichiers)
```

---

## 🔧 **API et Configuration**

### 📁 `api/`
| Fichier | Rôle | Description |
|---|---|---|
| `@tanstack/react-query.gen.ts` | Hooks React Query | Hooks générés pour les appels API |
| `config.ts` | Configuration API | Configuration des endpoints et clients |
| `index.ts` | Exports API | Point d'entrée pour les exports API |
| `sdk.gen.ts` | Client API généré | Client HTTP généré automatiquement |
| `types.gen.ts` | Types générés | Types TypeScript générés depuis l'API |

**Utilisation :**
```typescript
import { useCreateDraftQuote, useGetDraftQuotes } from '../api';
```

---

## 🧩 **Composants React**

### 📁 `components/` (57 composants)

#### **🎯 Composants Principaux**
| Fichier | Rôle | Description |
|---|---|---|
| `Request.tsx` | Composant principal | Composant racine pour les demandes |
| `RequestForm.tsx` | Formulaire de demande | Formulaire principal de création |
| `RequestFormHeader.tsx` | En-tête du formulaire | En-tête avec navigation et actions |
| `RequestsList.tsx` | Liste des demandes | Affichage de la liste des demandes |
| `RequestViewItem.tsx` | Élément de demande | Composant pour afficher une demande |

#### **📊 Composants de Gestion des Options**
| Fichier | Rôle | Description |
|---|---|---|
| `OptionsManager.tsx` | Gestionnaire d'options | Gestion des options de transport |
| `QuoteOptionsManager.tsx` | Gestionnaire devis | Gestion des options de devis |
| `DraftOptionsManager.tsx` | Gestionnaire brouillons | Gestion des options de brouillons |
| `RealDraftOptionsManager.tsx` | Gestionnaire réel | Version réelle du gestionnaire |
| `OptionManagementPanel.tsx` | Panneau de gestion | Interface de gestion des options |
| `OptionEditWithRecap.tsx` | Édition avec récap | Édition d'option avec récapitulatif |
| `OptionRecapView.tsx` | Vue récapitulative | Affichage du récapitulatif d'option |
| `CompareOptions.tsx` | Comparaison d'options | Comparaison entre options |

#### **📦 Composants de Conteneurs**
| Fichier | Rôle | Description |
|---|---|---|
| `AddContainer.tsx` | Ajout de conteneur | Interface d'ajout de conteneur |
| `ContainerElement.tsx` | Élément conteneur | Composant d'affichage de conteneur |
| `ContainerPrice.tsx` | Prix de conteneur | Affichage du prix d'un conteneur |
| `ContainersDisplay.tsx` | Affichage conteneurs | Affichage de la liste des conteneurs |

#### **🚢 Composants de Transport**
| Fichier | Rôle | Description |
|---|---|---|
| `GeneratePriceOffer.tsx` | Génération d'offre | Génération d'offre de prix |
| `OfferGenerationStep.tsx` | Étape de génération | Étape de génération d'offre |
| `HaulageApiIntegration.tsx` | Intégration transport | Intégration API transport terrestre |
| `SeafreightCalculationDebugger.tsx` | Debug maritime | Outil de debug pour le fret maritime |

#### **📊 Composants de Données**
| Fichier | Rôle | Description |
|---|---|---|
| `BasketSummary.tsx` | Résumé panier | Résumé du panier d'options |
| `TotalsDebugger.tsx` | Debug totaux | Outil de debug pour les totaux |
| `DraftStateDebugger.tsx` | Debug état | Debug de l'état des brouillons |
| `ApiCompatibilityDashboard.tsx` | Dashboard compatibilité | Dashboard de compatibilité API |

#### **🔄 Composants de Synchronisation**
| Fichier | Rôle | Description |
|---|---|---|
| `DraftSyncStatus.tsx` | Statut sync brouillon | Statut de synchronisation des brouillons |
| `WizardSyncStatus.tsx` | Statut sync wizard | Statut de synchronisation du wizard |
| `AdvancedSyncStatus.tsx` | Statut sync avancé | Statut de synchronisation avancé |
| `SaveStatusIndicator.tsx` | Indicateur sauvegarde | Indicateur de statut de sauvegarde |
| `ManualSaveButton.tsx` | Bouton sauvegarde | Bouton de sauvegarde manuelle |

#### **📁 `components/chart/` (3 fichiers)**
| Fichier | Rôle | Description |
|---|---|---|
| `ChartComponent.tsx` | Composant graphique | Composant de graphique |
| `PriceChart.tsx` | Graphique prix | Graphique des prix |
| `ComparisonChart.tsx` | Graphique comparaison | Graphique de comparaison |

#### **📁 `components/info/` (4 fichiers)**
| Fichier | Rôle | Description |
|---|---|---|
| `InfoPanel.tsx` | Panneau d'information | Panneau d'informations |
| `HelpTooltip.tsx` | Tooltip d'aide | Tooltip d'aide contextuelle |
| `StatusInfo.tsx` | Information statut | Information sur le statut |
| `ProgressInfo.tsx` | Information progression | Information sur la progression |

---

## 🎣 **Hooks Personnalisés**

### 📁 `hooks/` (10 hooks)

| Fichier | Rôle | Description |
|---|---|---|
| `useDebugLogger.ts` | Logger de debug | Hook pour le logging de debug |
| `useOptionManagement.ts` | Gestion d'options | Hook pour la gestion des options |
| `useRealDraftOptionsManagerFixed.ts` | Gestionnaire fixe | Version fixe du gestionnaire |
| `useRealDraftOptionsManagerMigrated.ts` | Gestionnaire migré | Version migrée du gestionnaire |
| `useRealDraftOptionsManagerSimple.ts` | Gestionnaire simple | Version simplifiée du gestionnaire |
| `useTotalsCalculator.ts` | Calculateur totaux | Hook pour le calcul des totaux |
| `useWizardOptionsManagerV3.ts` | Gestionnaire wizard v3 | Gestionnaire d'options du wizard v3 |
| `useWizardStateManagerV3.ts` | Gestionnaire état v3 | Gestionnaire d'état du wizard v3 |

**Utilisation :**
```typescript
import { useOptionManagement, useTotalsCalculator } from '../hooks';
```

---

## 📄 **Pages de l'Application**

### 📁 `pages/` (10 pages)

| Fichier | Rôle | Description |
|---|---|---|
| `HandleRequest.tsx` | Gestion de demande | Page de gestion d'une demande |
| `MyRequests.tsx` | Mes demandes | Page des demandes de l'utilisateur |
| `Requests.tsx` | Liste des demandes | Page de liste des demandes |
| `RequestsSearch.tsx` | Recherche demandes | Page de recherche de demandes |
| `ValidatedRequests.tsx` | Demandes validées | Page des demandes validées |
| `RequestWizard.tsx` | Assistant de demande | Assistant de création de demande |
| `RequestWizardApiCompatible.tsx` | Assistant compatible | Version compatible API |
| `RequestWizardTest.tsx` | Assistant test | Version de test de l'assistant |
| `RequestWizardV3.tsx` | Assistant v3 | Version 3 de l'assistant |
| `ApiCompatibilityTestPage.tsx` | Test compatibilité | Page de test de compatibilité API |

---

## 🛠️ **Services Métier**

### 📁 `services/` (7 services)

| Fichier | Rôle | Description |
|---|---|---|
| `DraftPersistenceService.ts` | Persistance brouillons | Service de persistance des brouillons |
| `DraftQuoteApiMapper.ts` | Mappeur API | Mappeur entre modèles et API |
| `LocalStorageService.ts` | Stockage local | Service de stockage local |
| `QuoteExporter.ts` | Export de devis | Service d'export de devis |
| `QuoteJsonGenerator.ts` | Générateur JSON | Générateur de JSON de devis |
| `QuoteValidator.ts` | Validateur de devis | Service de validation de devis |

**Fonctionnalités principales :**
- **Génération JSON** : Création de devis au format JSON standardisé
- **Validation** : Validation de la structure et cohérence des devis
- **Export** : Export et envoi par email des devis
- **Persistance** : Sauvegarde et chargement des brouillons

---

## 🎯 **Assistant de Création (Wizard)**

### 📁 `wizard/` (51 fichiers)

L'assistant de création est un système complexe et sophistiqué pour créer des demandes de devis avec un workflow guidé.

#### **🏗️ Structure du Wizard**

| Dossier/Fichier | Rôle | Description |
|---|---|---|
| `schema.ts` | Schéma de validation | Schéma Zod pour validation et types |
| `wizard.config.ts` | Configuration | Configuration des étapes du wizard |
| `WizardEngine.tsx` | Moteur principal | Moteur principal du wizard |
| `StepRouter.tsx` | Routeur d'étapes | Navigation entre les étapes |
| `LivePreview.tsx` | Aperçu en direct | Aperçu en temps réel du formulaire |
| `toDraftQuote.ts` | Adaptateur API | Conversion vers format API |
| `NewRequestWizard.tsx` | Assistant principal | Wrapper principal de l'assistant |
| `ExpressWizard.tsx` | Mode express | Mode rapide (5 questions) |

#### **📄 Pages du Wizard**

| Fichier | Rôle | Description |
|---|---|---|
| `BasicsStep.tsx` | Étape 1 - Bases | Informations de base (client, route, marchandise) |
| `OptionsStep.tsx` | Étape 2 - Options | Sélection des options de transport |
| `ReviewStep.tsx` | Étape 3 - Révision | Révision et envoi de la demande |
| `ExpressStep.tsx` | Mode express | Mode rapide avec 5 questions essentielles |

#### **🧩 Composants du Wizard**

| Fichier | Rôle | Description |
|---|---|---|
| `CurrentOptionTotals.tsx` | Totaux actuels | Affichage des totaux de l'option courante |
| `ExistingOptionsDisplay.tsx` | Affichage options | Affichage des options existantes |
| `HaulageSelection.tsx` | Sélection transport | Sélection du transport terrestre |
| `SeafreightSelection.tsx` | Sélection maritime | Sélection du fret maritime |
| `ServicesSelection.tsx` | Sélection services | Sélection des services additionnels |
| `OptionsComparison.tsx` | Comparaison | Comparaison entre options |
| `QuotePreviewDialog.tsx` | Aperçu devis | Dialogue d'aperçu du devis |
| `TotalsDisplay.tsx` | Affichage totaux | Affichage des totaux calculés |

#### **🎣 Hooks du Wizard**

| Fichier | Rôle | Description |
|---|---|---|
| `useCreateQuoteFromDraft.ts` | Création depuis brouillon | Hook pour créer un devis depuis un brouillon |
| `useDebounce.ts` | Debounce | Hook pour le debouncing |
| `useDraftQuoteData.ts` | Données brouillon | Hook pour les données de brouillon |
| `useDraftQuoteSave.ts` | Sauvegarde brouillon | Hook pour la sauvegarde |
| `useFinalizeDraftQuote.ts` | Finalisation | Hook pour finaliser un brouillon |
| `useSelectQuoteOption.ts` | Sélection option | Hook pour sélectionner une option |

#### **🔧 Adaptateurs du Wizard**

| Fichier | Rôle | Description |
|---|---|---|
| `draftToWizardAdapter.ts` | Adaptateur brouillon | Conversion brouillon vers wizard |
| `requestToWizardAdapter.ts` | Adaptateur demande | Conversion demande vers wizard |
| `toCreateDraftQuoteRequest.ts` | Création demande | Conversion vers requête de création |
| `toDraftQuoteOptionPayload.ts` | Payload option | Conversion vers payload d'option |

#### **🧪 Tests du Wizard**

| Fichier | Rôle | Description |
|---|---|---|
| `__tests__/schema.spec.ts` | Tests schéma | Tests du schéma de validation |
| `__tests__/toDraftQuote.spec.ts` | Tests conversion | Tests de conversion vers API |
| `__tests__/setup.ts` | Configuration tests | Configuration des tests |

---

## 📊 **Types et Interfaces**

### 📁 `types/` (3 fichiers)

| Fichier | Rôle | Description |
|---|---|---|
| `EnrichedOption.ts` | Option enrichie | Interface pour les options enrichies |
| `index.ts` | Exports types | Point d'entrée pour les exports |
| `README.md` | Documentation types | Documentation des types |

**Interface principale :**
```typescript
interface DraftQuote {
  id: string;
  requestQuoteId: string;
  emailUser: string;
  clientNumber: string;
  draftData: OptimizedDraftData;
  // Propriétés de compatibilité
  step1: any;
  step2: any;
  // ...
}
```

---

## 🔧 **Utilitaires**

### 📁 `utils/` (7 fichiers)

| Fichier | Rôle | Description |
|---|---|---|
| `calculationUtils.ts` | Utilitaires calcul | Fonctions de calcul |
| `draftIdValidation.ts` | Validation ID | Validation des identifiants |
| `draftTransformers.ts` | Transformateurs | Transformations de données |
| `notificationUtils.ts` | Utilitaires notification | Fonctions de notification |
| `requestToDraftQuoteConverter.ts` | Convertisseur | Conversion demande vers brouillon |
| `testRequestIdFlow.ts` | Test flux | Test du flux d'identifiants |

---

## 📚 **Documentation Technique**

### 📁 `docs/` (15 fichiers)

| Fichier | Rôle | Description |
|---|---|---|
| `DEBUG_MODAL_GUIDE.md` | Guide debug modal | Guide pour le debug des modales |
| `DEBUG_PAYLOAD_DISPLAY_GUIDE.md` | Guide debug payload | Guide pour l'affichage des payloads |
| `DEBUG_STEP6_MISCELLANEOUS.md` | Guide debug étape 6 | Guide pour le debug de l'étape 6 |
| `DRAFT_SAVE_WITH_OPTIONS_GUIDE.md` | Guide sauvegarde | Guide pour la sauvegarde avec options |
| `HOW_TO_ADD_OPTIONS_GUIDE.md` | Guide ajout options | Guide pour ajouter des options |
| `HOW_TO_CREATE_OPTIONS.md` | Guide création options | Guide pour créer des options |
| `JSON_STRINGIFY_ERROR_FIX_GUIDE.md` | Guide erreur JSON | Guide pour corriger les erreurs JSON |
| `OPTIONS_DATA_DISPLAY_GUIDE.md` | Guide affichage données | Guide pour l'affichage des données |
| `OPTIONS_DISPLAY_VISIBLE_GUIDE.md` | Guide visibilité | Guide pour la visibilité des options |
| `OPTIONS_MANAGEMENT_GUIDE.md` | Guide gestion options | Guide pour la gestion des options |
| `RequestQuoteIdInitialization.md` | Initialisation ID | Guide d'initialisation des IDs |
| `SAVE_DRAFT_DEBUG_GUIDE.md` | Guide debug sauvegarde | Guide pour le debug de sauvegarde |
| `STEP6_MISCELLANEOUS_FIX.md` | Fix étape 6 | Correction pour l'étape 6 |
| `UPDATE_DRAFT_QUOTE_WITH_OPTION_GUIDE.md` | Guide mise à jour | Guide pour la mise à jour avec options |
| `WIZARD_REFACTORING_GUIDE.md` | Guide refactoring | Guide pour le refactoring du wizard |

---

## 🎯 **Workflow Principal**

### 1. **Création de Demande**
```
RequestWizard → BasicsStep → OptionsStep → ReviewStep → API
```

### 2. **Gestion des Options**
```
OptionsManager → DraftOptionsManager → RealDraftOptionsManager → API
```

### 3. **Génération de Devis**
```
QuoteJsonGenerator → QuoteValidator → QuoteExporter → Client
```

### 4. **Sauvegarde et Synchronisation**
```
DraftPersistenceService → LocalStorageService → API
```

---

## 🔧 **Utilisation Pratique**

### **Créer une nouvelle demande :**
```typescript
import { NewRequestWizard } from '@features/request/wizard/NewRequestWizard';

<Route path="request-wizard" element={<NewRequestWizard />} />
```

### **Gérer les options :**
```typescript
import { useOptionManagement } from '@features/request/hooks';

const { options, addOption, updateOption, removeOption } = useOptionManagement();
```

### **Générer un devis :**
```typescript
import { QuoteJsonGenerator } from '@features/request/services';

const quoteJson = QuoteJsonGenerator.generateQuoteJson(selectedOption, allOptions);
```

### **Valider un devis :**
```typescript
import { QuoteValidator } from '@features/request/services';

const validation = QuoteValidator.validateQuoteJson(quoteJson);
```

---

## 🚀 **Points d'Entrée Principaux**

### **Pages principales :**
- **`/request-wizard`** → Assistant de création
- **`/requests`** → Liste des demandes
- **`/my-requests`** → Mes demandes
- **`/handle-request/:id`** → Gestion d'une demande

### **Composants clés :**
- **`RequestWizard.tsx`** → Assistant principal
- **`OptionsManager.tsx`** → Gestion des options
- **`QuoteJsonGenerator.ts`** → Génération de devis

### **Hooks essentiels :**
- **`useOptionManagement`** → Gestion des options
- **`useTotalsCalculator`** → Calcul des totaux
- **`useDraftQuoteSave`** → Sauvegarde des brouillons

---

## 📈 **Architecture et Patterns**

### **Patterns utilisés :**
- **Feature-based architecture** : Organisation par fonctionnalité
- **Hook-based state management** : Gestion d'état avec hooks
- **Schema-driven validation** : Validation avec Zod
- **Adapter pattern** : Conversion entre formats
- **Service layer** : Couche de services métier

### **Technologies clés :**
- **React 18** : Framework UI
- **TypeScript** : Langage de programmation
- **Zod** : Validation de schémas
- **React Query** : Gestion d'état serveur
- **Material-UI** : Composants UI

---

*Cette documentation est maintenue à jour avec l'évolution de la feature Request. Pour toute question, consulter les README spécifiques de chaque module.*
