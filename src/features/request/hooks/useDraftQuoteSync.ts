import { useState, useCallback, useRef, useEffect } from 'react';
import { DraftQuote, syncDraftQuoteData, buildSDKPayload } from '../types';
import { 
  postApiQuoteOfferDraft, 
  putApiQuoteOfferDraftById,
  getDraft 
} from '@features/offer/api';

// === HOOK DE SYNCHRONISATION PARFAITE DRAFTQUOTE ===
export const useDraftQuoteSync = (initialDraftQuote: DraftQuote) => {
  // === ÉTATS LOCAUX ===
  const [draftQuote, setDraftQuote] = useState<DraftQuote>(initialDraftQuote);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  
  // === RÉFÉRENCES POUR LA SYNCHRONISATION ===
  const pendingChangesRef = useRef<Set<string>>(new Set());
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastApiResponseRef = useRef<any>(null);

  // === FONCTIONS DE SYNCHRONISATION FRONTEND → DTO ===
  
  /**
   * Met à jour le draftQuote et marque le changement comme en attente
   */
  const updateDraftQuote = useCallback((updater: (prev: DraftQuote) => DraftQuote, changeSource?: string) => {
    setDraftQuote(prev => {
      const updated = updater(prev);
      
      // Marquer le changement comme en attente de synchronisation
      if (changeSource) {
        pendingChangesRef.current.add(changeSource);
      }
      
      // ✅ SAUVEGARDE LOCALE AUTOMATIQUE RÉACTIVÉE
      // Les changements sont automatiquement sauvegardés en local
      console.log('✅ Changement détecté - sauvegarde locale automatique');
      
      // Programmer une sauvegarde locale automatique
      scheduleAutoSave();
      
      return updated;
    });
  }, []);

  /**
   * Met à jour une étape spécifique du wizard
   */
  const updateStep = useCallback((stepNumber: number, stepData: any) => {
    updateDraftQuote(prev => ({
      ...prev,
      [`step${stepNumber}`]: stepData,
      currentStep: stepNumber
    }), `step${stepNumber}`);
  }, [updateDraftQuote]);

  /**
   * Met à jour les données de compatibilité
   */
  const updateCompatibilityData = useCallback((data: Partial<DraftQuote>) => {
    updateDraftQuote(prev => ({
      ...prev,
      ...data
    }), 'compatibility');
  }, [updateDraftQuote]);

  // === FONCTIONS DE SYNCHRONISATION DTO → API ===

  /**
   * Sauvegarde manuelle avec gestion POST/PUT automatique
   */
  const saveDraft = useCallback(async (): Promise<boolean> => {
    if (isSaving) {
      console.log('⚠️ Sauvegarde déjà en cours...');
      return false;
    }

    setIsSaving(true);
    
    try {
      let response;
      
      if (draftId) {
        // Mise à jour d'un brouillon existant
        console.log('🔄 Mise à jour du brouillon existant...');
        response = await putApiQuoteOfferDraftById({
          body: buildSDKPayload(draftQuote),
          path: { id: draftId }
        });
        console.log('✅ Brouillon mis à jour avec succès');
      } else {
        // Création d'un nouveau brouillon
        console.log('🚀 Création d\'un nouveau brouillon...');
        response = await postApiQuoteOfferDraft({
          body: buildSDKPayload(draftQuote)
        });
        
        // Extraire l'ID de la réponse
        const responseData = response.data as any;
        if (responseData?.id) {
          console.log('✅ Brouillon créé avec succès, ID:', responseData.id);
          setDraftId(responseData.id);
          setDraftQuote(prev => ({ 
            ...prev, 
            id: responseData.id, 
            requestQuoteId: responseData.id 
          }));
        } else {
          console.error('❌ Réponse API invalide:', response);
          return false;
        }
      }

      // Marquer tous les changements comme synchronisés
      pendingChangesRef.current.clear();
      setLastSavedAt(new Date());
      lastApiResponseRef.current = response;
      
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [draftQuote, draftId, isSaving]);

  /**
   * Chargement d'un brouillon depuis l'API
   */
  const loadDraft = useCallback(async (id: string): Promise<boolean> => {
    try {
      console.log('📥 Chargement du brouillon...');
      const response = await getDraft({ path: { id } });
      const responseData = response.data as any;
      
      if (responseData?.data?.OptimizedDraftData) {
        // Construire le draftQuote à partir de la réponse API
        const apiDraftData = responseData.data.OptimizedDraftData;
        
        const loadedDraftQuote: DraftQuote = {
          id: id,
          requestQuoteId: id,
          emailUser: apiDraftData.Wizard?.EmailUser,
          clientNumber: apiDraftData.Wizard?.ClientNumber,
          comment: apiDraftData.Wizard?.Comment,
          draftData: {
            wizard: apiDraftData.Wizard,
            steps: apiDraftData.Steps,
            totals: apiDraftData.Totals
          }
        };
        
        // Synchroniser les données de compatibilité
        const syncedDraftQuote = syncDraftQuoteData(loadedDraftQuote);
        
        // Mettre à jour l'état local
        setDraftQuote(syncedDraftQuote);
        setDraftId(id);
        setLastSavedAt(new Date());
        
        console.log('✅ Brouillon chargé avec succès');
        return true;
      } else {
        console.error('❌ Structure de réponse API invalide:', responseData);
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error);
      return false;
    }
  }, []);

  // === FONCTIONS DE SYNCHRONISATION API → DTO ===

  /**
   * Met à jour le draftQuote avec la réponse de l'API
   */
  const syncFromApiResponse = useCallback((apiResponse: any) => {
    if (!apiResponse?.data) return;
    
    const responseData = apiResponse.data;
    
    // Mettre à jour le draftQuote avec les données de l'API
    setDraftQuote(prev => {
      const updated = { ...prev };
      
      // Si c'est une création, récupérer l'ID
      if (responseData.id && !prev.id) {
        updated.id = responseData.id;
        updated.requestQuoteId = responseData.id;
      }
      
      // Synchroniser avec les données retournées par l'API
      if (responseData.draftData) {
        updated.draftData = responseData.draftData;
        // Appliquer la synchronisation des données de compatibilité
        return syncDraftQuoteData(updated);
      }
      
      return updated;
    });
    
    lastApiResponseRef.current = apiResponse;
  }, []);

  // === SAUVEGARDE LOCALE AUTOMATIQUE RÉACTIVÉE ===
  // ✅ Les changements sont automatiquement sauvegardés en local
  // ❌ Pas de sauvegarde automatique vers l'API (seulement manuelle)
  
  const scheduleAutoSave = useCallback(() => {
    // Annuler la sauvegarde locale automatique précédente
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Programmer une nouvelle sauvegarde locale automatique
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (pendingChangesRef.current.size > 0) {
        console.log('🔄 Sauvegarde locale automatique...');
        
        // ✅ Sauvegarde locale uniquement (pas d'API)
        // Les données sont déjà dans draftQuote, on peut les sauvegarder en localStorage
        try {
          const draftData = {
            draftQuote,
            lastModified: new Date().toISOString(),
            pendingChanges: Array.from(pendingChangesRef.current)
          };
          
          // Sauvegarde en localStorage
          localStorage.setItem(`draft_local_${draftId || 'new'}`, JSON.stringify(draftData));
          
          // Marquer les changements comme synchronisés localement
          pendingChangesRef.current.clear();
          
          console.log('✅ Sauvegarde locale automatique réussie');
        } catch (error) {
          console.error('❌ Erreur lors de la sauvegarde locale automatique:', error);
        }
      }
    }, 2000); // 2 secondes de délai
  }, [draftQuote, draftId]);

  // === NETTOYAGE ===
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // === ÉTAT DE SYNCHRONISATION ===
  const syncStatus = {
    hasPendingChanges: pendingChangesRef.current.size > 0,
    pendingChanges: Array.from(pendingChangesRef.current),
    isSaving,
    lastSavedAt,
    draftId,
    isNew: !draftId
  };

  return {
    // === ÉTATS ===
    draftQuote,
    syncStatus,
    
    // === FONCTIONS DE MISE À JOUR ===
    updateDraftQuote,
    updateStep,
    updateCompatibilityData,
    
    // === FONCTIONS DE SYNCHRONISATION ===
    saveDraft,
    loadDraft,
    syncFromApiResponse,
    
    // === SETTERS DIRECTS ===
    setDraftQuote,
    setDraftId
  };
};
