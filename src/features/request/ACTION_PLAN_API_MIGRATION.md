# 🚀 Plan d'Action - Migration API DraftQuote

## 📋 Vue d'ensemble

Ce plan détaille les étapes pour finaliser la migration vers l'API compatible `@tanstack/api/draft-quotes`.

## ✅ **ÉTAPES COMPLÉTÉES**

### 1. ✅ Analyse de Compatibilité
- [x] Identification des incompatibilités structurelles
- [x] Mapping des différences entre frontend et API
- [x] Documentation des problèmes

### 2. ✅ Création du Mapper
- [x] `DraftQuoteApiMapper.ts` - Service de mapping bidirectionnel
- [x] Transformation Frontend → API
- [x] Transformation API → Frontend
- [x] Validation des données

### 3. ✅ Hook CRUD Compatible
- [x] `useDraftCRUDApiCompatible.ts` - Hook avec mapping automatique
- [x] Création, mise à jour, suppression
- [x] Gestion d'erreurs robuste

### 4. ✅ Composants de Test
- [x] `DraftQuoteApiCompatibilityTest.tsx` - Test de compatibilité
- [x] `ApiCompatibilityDashboard.tsx` - Dashboard de monitoring
- [x] `ApiCompatibilityTestPage.tsx` - Page de test

### 5. ✅ Wizard Compatible
- [x] `RequestWizardApiCompatible.tsx` - Version compatible
- [x] `Step1RequestFormApiCompatible.tsx` - Step compatible

## 🔄 **ÉTAPES EN COURS**

### 6. 🧪 Tests et Validation
- [ ] Tester le composant `DraftQuoteApiCompatibilityTest`
- [ ] Valider les transformations de données
- [ ] Vérifier la compatibilité avec l'API réelle

### 7. 🔧 Migration des Composants
- [ ] Migrer `Step2SelectServices` vers API compatible
- [ ] Migrer `Step3RequestForm` vers API compatible
- [ ] Migrer `Step4HaulierSelection` vers API compatible
- [ ] Migrer `Step5SeafreightSelection` vers API compatible
- [ ] Migrer `Step6MiscellaneousSelection` vers API compatible
- [ ] Migrer `Step7Recap` vers API compatible

## 📋 **ÉTAPES SUIVANTES**

### 8. 🔄 Migration des Services
- [ ] Mettre à jour `DraftPersistenceService.ts`
- [ ] Mettre à jour `useDraftCRUD.ts` (version legacy)
- [ ] Mettre à jour `useWizardStateManager.ts`

### 9. 🧪 Tests d'Intégration
- [ ] Tests end-to-end avec l'API réelle
- [ ] Validation des appels API
- [ ] Tests de performance
- [ ] Tests de gestion d'erreurs

### 10. 📚 Documentation
- [ ] Guide d'utilisation des nouveaux composants
- [ ] Documentation des changements breaking
- [ ] Guide de migration pour les développeurs

### 11. 🚀 Déploiement
- [ ] Tests en environnement de staging
- [ ] Migration des données existantes
- [ ] Déploiement en production
- [ ] Monitoring post-déploiement

## 🎯 **Actions Immédiates**

### **1. Tester la Compatibilité (MAINTENANT)**
```bash
# 1. Démarrer le serveur de développement
npm run dev

# 2. Naviguer vers la page de test
http://localhost:3000/test-api-compatibility

# 3. Lancer les tests de compatibilité
# Cliquer sur "Lancer les tests de compatibilité"
```

### **2. Valider les Transformations**
```typescript
// Tester le mapping dans la console
import { DraftQuoteApiMapper } from './services/DraftQuoteApiMapper';

const testDraft = createMinimalDraftQuote('test-123', 'test@example.com');
const createRequest = DraftQuoteApiMapper.toCreateRequest(testDraft);
console.log('CreateRequest:', createRequest);
```

### **3. Tester l'API Réelle**
```typescript
// Tester avec l'API réelle
const { createDraft } = useDraftCRUDApiCompatible();
try {
  const result = await createDraft(testDraft);
  console.log('API Response:', result);
} catch (error) {
  console.error('API Error:', error);
}
```

## 🔧 **Configuration Requise**

### **1. Variables d'Environnement**
```env
# .env.local
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_DEBUG_API_COMPATIBILITY=true
```

### **2. Routes de Test**
```typescript
// Ajouter dans App.tsx
<Route path="/test-api-compatibility" element={<ApiCompatibilityTestPage />} />
<Route path="/wizard-api-compatible/:requestId" element={<RequestWizardApiCompatible />} />
<Route path="/dashboard-api" element={<ApiCompatibilityDashboard />} />
```

## 📊 **Métriques de Succès**

### **1. Tests de Compatibilité**
- [ ] 100% des tests de compatibilité passent
- [ ] 0 erreur de validation critique
- [ ] < 5 avertissements de validation

### **2. Performance API**
- [ ] Temps de réponse < 500ms
- [ ] Taux de succès > 95%
- [ ] 0 erreur de transformation

### **3. Fonctionnalités**
- [ ] Création de draft fonctionnelle
- [ ] Mise à jour de draft fonctionnelle
- [ ] Récupération de draft fonctionnelle
- [ ] Navigation entre steps fonctionnelle

## 🚨 **Points d'Attention**

### **1. Données Manquantes**
- Vérifier que tous les champs obligatoires sont mappés
- Gérer les valeurs par défaut appropriées
- Valider les données avant envoi

### **2. Gestion d'Erreurs**
- Implémenter des retry automatiques
- Afficher des messages d'erreur clairs
- Logger les erreurs pour le debugging

### **3. Performance**
- Optimiser les transformations de données
- Mettre en cache les données fréquemment utilisées
- Minimiser les appels API redondants

## 📞 **Support et Debugging**

### **1. Logs de Debug**
```typescript
// Activer les logs détaillés
console.log('🔄 [API_MAPPER] Transformation:', data);
console.log('✅ [API_MAPPER] Succès:', result);
console.error('❌ [API_MAPPER] Erreur:', error);
```

### **2. Outils de Debug**
- Utiliser `DraftQuoteApiCompatibilityTest` pour tester
- Utiliser `ApiCompatibilityDashboard` pour monitorer
- Utiliser les DevTools pour inspecter les appels API

### **3. Contact**
- Créer une issue GitHub pour les problèmes
- Utiliser le canal Slack pour les questions rapides
- Documenter les solutions trouvées

## 🎉 **Résultat Attendu**

À la fin de cette migration, vous aurez :

1. ✅ **Structure DraftQuote 100% compatible** avec l'API
2. ✅ **Mapping automatique** des données
3. ✅ **Validation robuste** des données
4. ✅ **Gestion d'erreurs** améliorée
5. ✅ **Tests de compatibilité** automatisés
6. ✅ **Monitoring** en temps réel
7. ✅ **Documentation** complète

La migration sera **transparente** pour l'utilisateur final, mais **robuste** techniquement ! 🚀
