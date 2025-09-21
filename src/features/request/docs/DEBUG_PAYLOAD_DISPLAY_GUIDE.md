# Guide - Affichage des Payloads API en Debug

## 🎯 **Nouvelle fonctionnalité**

Le bouton "Debug" du wizard affiche maintenant les payloads complets pour les API de création et mise à jour des brouillons.

## 🔧 **Fonctionnalités ajoutées**

### **1. Bouton Debug amélioré**
- **Console logs détaillés** pour les payloads POST et PUT
- **URL de l'API** pour la mise à jour
- **Structure complète** de la requête

### **2. Composant DebugPayloadDisplay**
- **Interface visuelle** pour explorer les payloads
- **Accordéons** pour organiser l'information
- **Syntaxe colorée** pour le JSON
- **Informations contextuelles** (ID, options, statut)

## 📊 **Ce qui est affiché**

### **Dans la console (bouton Debug) :**
```
=== DEBUG DRAFT QUOTE V2 ===
📋 DraftQuote: { ... }
📍 Active Step: 2
💾 Has Unsaved Changes: true
⏰ Last Saved At: 2024-01-15T10:30:00.000Z
❌ Save Error: null
📦 Options: [ ... ]
🎯 Current Option Index: 0

🆕 CREATE API Format (POST): { ... }
🔄 UPDATE API Format (PUT): { ... }
🔄 PUT API URL: /api/draft-quotes/draft-123
🔄 PUT API Payload Structure: {
  path: { id: "draft-123" },
  body: { ... }
}
========================
```

### **Dans l'interface (DebugPayloadDisplay) :**
- **Informations générales** : ID, nombre d'options, statut
- **Payload POST** : Pour créer un nouveau brouillon
- **Payload PUT** : Pour mettre à jour un brouillon existant
- **Options détaillées** : Options sauvegardées

## 🎨 **Interface utilisateur**

### **Accordéons disponibles :**

1. **POST /api/draft-quotes** (Création)
   - Payload pour créer un nouveau brouillon
   - Toujours disponible

2. **PUT /api/draft-quotes/{id}** (Mise à jour)
   - Payload pour mettre à jour un brouillon existant
   - Disponible seulement si le brouillon a un ID

3. **Options sauvegardées** (si présentes)
   - Liste des options qui seront sauvegardées
   - Affiché seulement s'il y a des options

### **Codes couleur :**
- **Vert** : Création (POST)
- **Bleu** : Mise à jour (PUT)
- **Violet** : Options
- **Gris** : Informations générales

## 🔍 **Utilisation pratique**

### **Étape 1 : Ouvrir le wizard en mode développement**
1. Aller au wizard
2. Descendre jusqu'au panel de debug
3. Cliquer sur "Debug" pour les logs console

### **Étape 2 : Explorer les payloads**
1. **POST** : Voir le payload de création
2. **PUT** : Voir le payload de mise à jour (si ID présent)
3. **Options** : Voir les options sauvegardées

### **Étape 3 : Analyser les différences**
- **POST** : Inclut `requestQuoteId`
- **PUT** : Inclut `options` et `notes`
- **Structure** : Même base, champs différents

## 📋 **Exemple de payload PUT**

```json
{
  "path": { "id": "draft-123" },
  "body": {
    "customer": { ... },
    "shipment": { ... },
    "wizard": { ... },
    "options": [ ... ],
    "notes": "Notes du brouillon"
  }
}
```

## 🚀 **Avantages**

### **Pour le développement :**
- **Debug facile** des problèmes d'API
- **Vérification** des données avant envoi
- **Comparaison** entre création et mise à jour

### **Pour le support :**
- **Logs détaillés** pour diagnostiquer les problèmes
- **Interface visuelle** pour explorer les données
- **Structure claire** des requêtes API

## 🎯 **Cas d'usage**

### **1. Debug d'une erreur de sauvegarde**
1. Cliquer sur "Debug"
2. Vérifier les logs console
3. Identifier le problème dans le payload

### **2. Vérification des données**
1. Ouvrir les accordéons
2. Comparer POST vs PUT
3. Vérifier la cohérence des données

### **3. Support client**
1. Capturer les logs console
2. Partager les payloads avec l'équipe
3. Diagnostiquer les problèmes d'API

## 📝 **Notes importantes**

- **Mode développement uniquement** : Les composants de debug ne s'affichent qu'en mode dev
- **Données sensibles** : Attention aux données client dans les logs
- **Performance** : Les payloads peuvent être volumineux
- **Mise à jour temps réel** : Les payloads se mettent à jour automatiquement

## 🔧 **Personnalisation**

### **Modifier l'affichage :**
```typescript
// Dans DebugPayloadDisplay.tsx
const maxHeight = '300px'; // Hauteur max des zones de code
const fontSize = '0.75rem'; // Taille de police
```

### **Ajouter des champs :**
```typescript
// Dans handleDebug de RequestWizard.tsx
console.log('🆕 Nouveau champ:', nouvelleValeur);
```

Le debug est maintenant complet et visuel ! 🎉
