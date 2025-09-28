# 🔍 Analyse Backend - Champs d'Option

## 📋 **État actuel du backend**

### **✅ Champs supportés**

#### **1. Type d'option (`OptionType`)**
- ✅ **Modèle** : `DraftQuoteOption.OptionType` (enum `DraftQuoteOptionType`)
- ✅ **DTO** : `DraftQuoteOptionDto.OptionType` (string)
- ✅ **API** : Endpoint `/api/draft-quotes/option-types` avec 3 types :
  - `Economique` - "Option économique - la moins chère"
  - `Standard` - "Option standard - le meilleur rapport qualité/prix"  
  - `Express` - "Option express - la plus rapide"
- ✅ **Mapping** : Conversion automatique string ↔ enum
- ✅ **Détermination automatique** : Logique métier pour déterminer le type

#### **2. Label de l'option (`Label`)**
- ✅ **Modèle** : `DraftQuoteOption.Label` (string)
- ✅ **DTO** : `DraftQuoteOptionDto.Label` (string)
- ✅ **Mapping** : Direct mapping entre modèle et DTO
- ✅ **Persistance** : Sauvegardé en base de données

### **❌ Champs manquants**

#### **1. Nom de l'option (`Name`)**
- ❌ **Modèle** : `DraftQuoteOption` n'a pas de champ `Name`
- ❌ **DTO** : `DraftQuoteOptionDto` n'a pas de champ `Name`
- ❌ **Mapping** : Pas de mapping pour `Name`
- ❌ **API** : Pas de support pour `Name`

#### **2. Description de l'option (`Description`)**
- ❌ **Modèle** : `DraftQuoteOption` n'a pas de champ `Description`
- ❌ **DTO** : `DraftQuoteOptionDto` n'a pas de champ `Description`
- ❌ **Mapping** : Pas de mapping pour `Description`
- ❌ **API** : Pas de support pour `Description`

## 🔧 **Corrections nécessaires**

### **1. Modèle `DraftQuoteOption`**
```csharp
public class DraftQuoteOption
{
    [BsonElement("option_id")]
    public string OptionId { get; set; } = string.Empty;
    
    [BsonElement("name")]  // ← AJOUTER
    public string Name { get; set; } = string.Empty;
    
    [BsonElement("label")]
    public string Label { get; set; } = string.Empty;
    
    [BsonElement("description")]  // ← AJOUTER
    public string Description { get; set; } = string.Empty;
    
    // ... autres champs existants
}
```

### **2. DTO `DraftQuoteOptionDto`**
```csharp
public class DraftQuoteOptionDto
{
    public string OptionId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;  // ← AJOUTER
    public string Label { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;  // ← AJOUTER
    // ... autres champs existants
}
```

### **3. Mapping dans `DraftQuotesController`**
```csharp
private DraftQuoteOption MapToOption(DraftQuoteOptionDto optionDto)
{
    return new DraftQuoteOption
    {
        OptionId = optionDto.OptionId,
        Name = optionDto.Name,  // ← AJOUTER
        Label = optionDto.Label,
        Description = optionDto.Description,  // ← AJOUTER
        // ... autres mappings existants
    };
}
```

### **4. Mapping inverse dans `MapToDraftQuoteResponse`**
```csharp
Options = draft.Options.Select(o => new DraftQuoteOptionDto
{
    OptionId = o.OptionId,
    Name = o.Name,  // ← AJOUTER
    Label = o.Label,
    Description = o.Description,  // ← AJOUTER
    // ... autres mappings existants
}).ToList()
```

## 🎯 **Impact sur le frontend**

### **✅ Actuellement fonctionnel**
- **Type d'option** : Complètement supporté
- **Label** : Complètement supporté

### **❌ Problèmes identifiés**
- **Nom de l'option** : Le frontend envoie `name` mais le backend ne le traite pas
- **Description de l'option** : Le frontend envoie `description` mais le backend ne le traite pas

### **🔄 Conséquences**
1. **Perte de données** : `name` et `description` sont perdus lors de la sauvegarde
2. **Incohérence** : Le frontend et le backend ne sont pas synchronisés
3. **Fonctionnalité incomplète** : L'utilisateur ne peut pas sauvegarder le nom et la description

## 🚀 **Recommandations**

### **Priorité 1 : Ajouter les champs manquants**
1. Modifier `DraftQuoteOption` pour inclure `Name` et `Description`
2. Modifier `DraftQuoteOptionDto` pour inclure `Name` et `Description`
3. Mettre à jour les mappings dans le contrôleur

### **Priorité 2 : Migration de données**
1. Créer une migration pour ajouter les nouveaux champs
2. Définir des valeurs par défaut pour les données existantes

### **Priorité 3 : Tests**
1. Tester la sauvegarde avec les nouveaux champs
2. Tester la récupération des données
3. Vérifier la compatibilité avec le frontend

---

*Cette analyse montre que le backend ne supporte actuellement que le `Label` et l'`OptionType`, mais pas le `Name` et la `Description` que le frontend essaie d'envoyer.*
