# Guide - Modal de Debug API Payloads

## 🎯 **Vue d'ensemble**

Le bouton "Debug" dans la barre de statut du wizard ouvre maintenant un modal complet qui affiche les payloads API en temps réel.

## 🔧 **Fonctionnalités du modal**

### **1. Informations du brouillon**
- **Draft ID** : Identifiant du brouillon (si existant)
- **Étape active** : Étape actuelle du wizard (1-6)
- **Modifications non sauvegardées** : Indicateur de modifications en attente
- **Options sauvegardées** : Nombre d'options créées
- **Dernière sauvegarde** : Timestamp de la dernière sauvegarde
- **Erreur de sauvegarde** : Message d'erreur s'il y en a une

### **2. Payloads API affichés**

#### **🆕 POST /api/draft-quotes (Création)**
- **Toujours affiché** : Payload pour créer un nouveau brouillon
- **Type** : `CreateDraftQuoteRequest`
- **Utilisé quand** : `draftQuoteId` est `null` ou `undefined`

#### **🔄 PUT /api/draft-quotes/{id} (Mise à jour)**
- **Affiché si** : `draftQuoteId` existe
- **Type** : `UpdateDraftQuoteRequest`
- **Utilisé quand** : Le brouillon existe déjà et doit être mis à jour

#### **📦 Options sauvegardées**
- **Affiché si** : Des options ont été créées
- **Type** : `Array<DraftQuoteOption>`
- **Utilisé pour** : Sauvegarder les options avec le brouillon

## 🚀 **Comment utiliser**

### **Étape 1 : Ouvrir le modal**
1. Cliquer sur le bouton **"Debug"** dans la barre de statut
2. Le modal s'ouvre avec toutes les informations

### **Étape 2 : Analyser les payloads**
1. **Vérifier** les informations du brouillon en haut
2. **Examiner** le payload POST (création)
3. **Examiner** le payload PUT (mise à jour) si disponible
4. **Vérifier** les options sauvegardées

### **Étape 3 : Copier le payload**
1. Cliquer sur **"Copier le payload"**
2. Le payload approprié est copié dans le presse-papiers
3. Notification de confirmation affichée

## 📊 **Structure des payloads**

### **Payload POST (Création)**
```json
{
  "requestQuoteId": "string",
  "customer": { /* DraftQuoteCustomerDto */ },
  "shipment": { /* DraftQuoteShipmentDto */ },
  "wizard": { /* DraftQuoteWizardDto */ }
}
```

### **Payload PUT (Mise à jour)**
```json
{
  "customer": { /* DraftQuoteCustomerDto */ },
  "shipment": { /* DraftQuoteShipmentDto */ },
  "wizard": { /* DraftQuoteWizardDto */ },
  "options": [ /* Array<DraftQuoteOptionDto> */ ],
  "notes": "string"
}
```

## 🔍 **Cas d'usage**

### **1. Développement**
- **Vérifier** la structure des données avant envoi
- **Déboguer** les problèmes de mapping
- **Valider** les transformations de données

### **2. Test API**
- **Copier** le payload pour tester avec Postman/Insomnia
- **Vérifier** la cohérence des données
- **Comparer** les payloads avant/après modifications

### **3. Support client**
- **Exporter** les données du brouillon
- **Analyser** les problèmes de sauvegarde
- **Vérifier** l'état des options

## ⚠️ **Points importants**

### **1. Payload PUT non disponible**
- **Quand** : Aucun `draftQuoteId` n'est défini
- **Message** : "Aucun DraftQuote ID disponible"
- **Solution** : Créer d'abord le brouillon (POST)

### **2. Options vides**
- **Quand** : Aucune option n'a été créée
- **Affichage** : Section "Options sauvegardées" masquée
- **Normal** : Les options sont optionnelles

### **3. Données en temps réel**
- **Mise à jour** : Le modal se met à jour automatiquement
- **État actuel** : Affiche l'état exact du wizard
- **Modifications** : Reflète les changements non sauvegardés

## 🎨 **Interface utilisateur**

### **Design**
- **Modal large** : `maxWidth="lg"` pour plus d'espace
- **Hauteur** : 90% de la hauteur de l'écran
- **Scroll** : Contenu scrollable si nécessaire
- **Couleurs** : Codes couleur pour différencier les sections

### **Navigation**
- **Fermer** : Bouton X ou bouton "Fermer"
- **Copier** : Bouton "Copier le payload"
- **Responsive** : S'adapte à la taille de l'écran

## 🔧 **Intégration technique**

### **État local**
```typescript
const [showDebugModal, setShowDebugModal] = useState(false);
```

### **Ouverture du modal**
```typescript
const handleDebug = useCallback(() => {
  // ... logs console ...
  setShowDebugModal(true);
  enqueueSnackbar('Modal de debug ouvert avec les payloads API', { variant: 'info' });
}, [wizardState, savedOptions, currentOptionIndex, enqueueSnackbar]);
```

### **Fonctions de mapping**
- `mapDraftQuoteToApi()` : Pour le payload POST
- `mapDraftQuoteToUpdateApi()` : Pour le payload PUT

## 📝 **Exemple d'utilisation**

1. **Ouvrir** le wizard
2. **Remplir** quelques informations
3. **Cliquer** sur "Debug"
4. **Vérifier** le payload POST
5. **Sauvegarder** le brouillon
6. **Cliquer** à nouveau sur "Debug"
7. **Vérifier** le payload PUT
8. **Copier** le payload pour test

Le modal de debug est maintenant intégré et prêt à l'emploi ! 🎉
