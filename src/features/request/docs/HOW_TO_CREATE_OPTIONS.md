# Comment créer des options dans Step 7

## 🎯 Vue d'ensemble

Le Step 7 (`Step7Recap.tsx`) a été mis à jour pour intégrer le nouveau système de gestion des options. Vous pouvez maintenant créer, modifier et supprimer des options facilement.

## 🚀 Comment créer une option

### **Méthode 1 : Depuis l'onglet "Récapitulatif"**

1. **Configurez vos paramètres** :
   - Ajustez la marge bénéficiaire (pourcentage ou montant fixe)
   - Modifiez la description de l'option si nécessaire

2. **Cliquez sur "Créer une Option"** :
   - Le bouton bleu "Créer une Option (X/5)" vous permet de créer rapidement une option
   - Il basculera automatiquement vers l'onglet "Options" et ouvrira le formulaire de création

3. **Ou utilisez le bouton principal** :
   - "Créer le Devis avec cette Option" pour créer une option avec les paramètres actuels

### **Méthode 2 : Depuis l'onglet "Options"**

1. **Cliquez sur l'onglet "Options"** :
   - Vous verrez la liste des options existantes
   - Un bouton "Nouvelle option" est disponible en haut à droite

2. **Remplissez le formulaire** :
   - **Nom de l'option** : Obligatoire (ex: "Option Standard")
   - **Description** : Optionnelle
   - **Type de marge** : Pourcentage ou Montant fixe
   - **Valeur de marge** : 15% par défaut ou montant en EUR

3. **Cliquez sur "Créer"** :
   - L'option sera sauvegardée et apparaîtra dans la liste

## 📊 Fonctionnalités disponibles

### **Gestion des options**
- ✅ **Création** : Jusqu'à 5 options par draft
- ✅ **Modification** : Cliquez sur l'icône ✏️ pour modifier
- ✅ **Suppression** : Cliquez sur l'icône 🗑️ pour supprimer
- ✅ **Sélection** : Cliquez sur l'icône ✓ pour sélectionner une option

### **Calculs automatiques**
- ✅ **Totaux en temps réel** : Haulage + Seafreight + Services + Marge
- ✅ **Affichage détaillé** : Base + Surcharges pour le seafreight
- ✅ **Validation** : Vérification des données avant création

### **Actions disponibles**
- ✅ **Créer un devis** : Depuis n'importe quelle option sélectionnée
- ✅ **Télécharger PDF** : Export de l'option
- ✅ **Actualiser** : Recharger les options depuis l'API

## 🔧 Interface utilisateur

### **Onglet "Récapitulatif"**
- Affiche le résumé complet des coûts
- Permet de configurer la marge bénéficiaire
- Bouton rapide pour créer une option
- Tableau détaillé des éléments de coût

### **Onglet "Options"**
- Liste des options créées
- Formulaire de création/modification
- Actions sur chaque option (modifier, supprimer, créer devis)
- Indicateur du nombre d'options (X/5)

## 📝 Exemple d'utilisation

### **Créer une option "Économique"**

1. Dans l'onglet "Récapitulatif" :
   - Définissez la marge à 10%
   - Modifiez la description : "Option économique avec marge réduite"

2. Cliquez sur "Créer une Option (0/5)"

3. Dans l'onglet "Options" :
   - Nom : "Option Économique"
   - Description : "Option avec marge réduite de 10%"
   - Type : Pourcentage
   - Valeur : 10

4. Cliquez sur "Créer"

### **Créer une option "Premium"**

1. Dans l'onglet "Options" :
   - Cliquez sur "Nouvelle option"

2. Remplissez :
   - Nom : "Option Premium"
   - Description : "Option haut de gamme avec services additionnels"
   - Type : Montant fixe
   - Valeur : 500

3. Cliquez sur "Créer"

## ⚠️ Points importants

### **Limitations**
- Maximum 5 options par draft
- Les options sont liées au draft actuel
- Les calculs sont basés sur les données du wizard

### **Validation**
- Le nom de l'option est obligatoire
- La marge doit être positive
- Les données du wizard doivent être complètes

### **Sauvegarde**
- Les options sont automatiquement sauvegardées
- Synchronisation avec l'API en temps réel
- Gestion des erreurs avec messages clairs

## 🎨 Personnalisation

### **Types de marge**
- **Pourcentage** : Marge calculée en % du sous-total
- **Montant fixe** : Marge en EUR ajoutée au sous-total

### **Affichage des totaux**
- **Haulage** : Transport routier (Step 4)
- **Seafreight** : Transport maritime (Step 5)
- **Services** : Services divers (Step 6)
- **Marge** : Calculée selon le type choisi
- **Total final** : Sous-total + Marge

## 🔄 Workflow complet

1. **Complétez le wizard** (Steps 1-6)
2. **Arrivez au Step 7** (Récapitulatif)
3. **Configurez la marge** selon vos besoins
4. **Créez une ou plusieurs options** :
   - Option Standard (15%)
   - Option Économique (10%)
   - Option Premium (montant fixe)
5. **Sélectionnez l'option** à utiliser
6. **Créez le devis** final

Cette nouvelle interface rend la gestion des options beaucoup plus intuitive et puissante ! 🎉
