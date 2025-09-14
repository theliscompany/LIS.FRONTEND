import { useState, useCallback, useEffect, useRef } from 'react';
import { useDraftCRUD, useDraft, transformDraftQuoteToCreateRequest, transformDraftQuoteToUpdateRequest, transformApiResponseToDraftQuote } from './useDraftCRUD';
import { DraftQuote } from '../types/DraftQuote';
import { createInitialDraftQuote } from '../utils';
import { useSnackbar } from 'notistack';

// === HOOK POUR GÉRER L'ÉTAT DU WIZARD AVEC PERSISTANCE ===

export const useWizardDraftState = (
  draftId: string | null,
  currentUserEmail: string,
  clientNumber: string = ''
) => {
  const { enqueueSnackbar } = useSnackbar();
  const { createDraft, updateDraft, isCreating, isUpdating } = useDraftCRUD();
  
  // === ÉTATS LOCAUX ===
  const [draftQuote, setDraftQuote] = useState<DraftQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  
  // === RÉFÉRENCES ===
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedVersionRef = useRef<string>('');
  
  // === RÉCUPÉRATION DU BROUILLON EXISTANT ===
  const { data: existingDraft, isLoading: isLoadingExisting } = useDraft(draftId);
  
  // === INITIALISATION ===
  useEffect(() => {
    console.log('[useWizardDraftState] Initialisation avec:', { draftId, existingDraft, draftQuote });
    
    if (existingDraft && !draftQuote) {
      // Transformer les données de l'API en DraftQuote
      console.log('[useWizardDraftState] Chargement d\'un brouillon existant:', existingDraft);
      const transformedDraft = transformApiResponseToDraftQuote(existingDraft);
      setDraftQuote(transformedDraft);
      lastSavedVersionRef.current = JSON.stringify(transformedDraft);
      setHasUnsavedChanges(false);
    } else if (!existingDraft && !draftQuote) {
      // Créer un nouveau brouillon (avec ou sans draftId)
      console.log('[useWizardDraftState] Création d\'un nouveau brouillon');
      const newDraft = createInitialDraftQuote();
      setDraftQuote(newDraft);
      lastSavedVersionRef.current = JSON.stringify(newDraft);
      setHasUnsavedChanges(false);
    }
  }, [existingDraft, draftQuote, draftId, createInitialDraftQuote]);
  
  // === PERSISTANCE AUTOMATIQUE ===
  const autoSave = useCallback(async () => {
    if (!draftQuote || !hasUnsavedChanges) return;
    
    try {
      setIsLoading(true);
      
      if (draftId) {
        // Mise à jour d'un brouillon existant
        const updateRequest = transformDraftQuoteToUpdateRequest(
          draftQuote, 
          currentUserEmail, 
          clientNumber
        );
        await updateDraft({ id: draftId, data: updateRequest });
      } else {
        // Création d'un nouveau brouillon
        const createRequest = transformDraftQuoteToCreateRequest(
          draftQuote, 
          currentUserEmail, 
          clientNumber
        );
        const result = await createDraft(createRequest);
        
        // Mettre à jour l'ID du brouillon créé
        if (result?.id) {
          setDraftQuote(prev => prev ? { ...prev, id: result.id } : null);
          // ✅ CORRECTION: Pas de redirection lors de la sauvegarde automatique
          // La redirection sera gérée par la sauvegarde manuelle si nécessaire
        }
      }
      
      lastSavedVersionRef.current = JSON.stringify(draftQuote);
      setHasUnsavedChanges(false);
      setLastSavedAt(new Date());
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde automatique:', error);
      enqueueSnackbar('Erreur lors de la sauvegarde automatique', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [draftQuote, draftId, hasUnsavedChanges, currentUserEmail, clientNumber, createDraft, updateDraft, enqueueSnackbar]);
  
  // === SAUVEGARDE MANUELLE ===
  const saveDraft = useCallback(async () => {
    if (!draftQuote) return false;
    
    try {
      setIsLoading(true);
      
      if (draftId) {
        const updateRequest = transformDraftQuoteToUpdateRequest(
          draftQuote, 
          currentUserEmail, 
          clientNumber
        );
        await updateDraft({ id: draftId, data: updateRequest });
      } else {
        const createRequest = transformDraftQuoteToCreateRequest(
          draftQuote, 
          currentUserEmail, 
          clientNumber
        );
        const result = await createDraft(createRequest);
        
        if (result?.id) {
          setDraftQuote(prev => prev ? { ...prev, id: result.id } : null);
          window.history.replaceState(null, '', `/request-wizard/${result.id}`);
        }
      }
      
      lastSavedVersionRef.current = JSON.stringify(draftQuote);
      setHasUnsavedChanges(false);
      setLastSavedAt(new Date());
      
      enqueueSnackbar('Brouillon sauvegardé avec succès', { variant: 'success' });
      return true;
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      enqueueSnackbar('Erreur lors de la sauvegarde', { variant: 'error' });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [draftQuote, draftId, currentUserEmail, clientNumber, createDraft, updateDraft, enqueueSnackbar]);
  
  // === MISE À JOUR DE L'ÉTAT ===
  const updateDraftQuote = useCallback((updater: (prev: DraftQuote) => DraftQuote) => {
    setDraftQuote(prev => {
      if (!prev) {
        // Si pas de brouillon initialisé, créer un nouveau
        const newDraft = createInitialDraftQuote();
        lastSavedVersionRef.current = JSON.stringify(newDraft);
        return newDraft;
      }
      
      const updated = updater(prev);
      const currentVersion = JSON.stringify(updated);
      
      // Vérifier s'il y a des changements
      if (currentVersion !== lastSavedVersionRef.current) {
        setHasUnsavedChanges(true);
        
        // Programmer la sauvegarde automatique (délai de 2 secondes)
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        
        autoSaveTimeoutRef.current = setTimeout(() => {
          autoSave();
        }, 2000);
      }
      
      return updated;
    });
  }, [autoSave, createInitialDraftQuote]);
  
  // === MISE À JOUR D'UNE ÉTAPE SPÉCIFIQUE ===
  const updateStep = useCallback((stepNumber: number, stepData: any) => {
    if (!draftQuote) {
      // Si pas de brouillon initialisé, créer un nouveau avec les données de l'étape
      const newDraft = createInitialDraftQuote();
      const stepKey = `step${stepNumber}` as keyof DraftQuote;
      if (stepKey in newDraft) {
        (newDraft as any)[stepKey] = { ...(newDraft as any)[stepKey], ...stepData };
      }
      setDraftQuote(newDraft);
      lastSavedVersionRef.current = JSON.stringify(newDraft);
      setHasUnsavedChanges(true);
      return;
    }
    
    updateDraftQuote(prev => {
      const stepKey = `step${stepNumber}` as keyof DraftQuote;
      if (stepKey in prev) {
        return {
          ...prev,
          [stepKey]: { ...(prev as any)[stepKey], ...stepData }
        };
      }
      return prev;
    });
  }, [updateDraftQuote, draftQuote, createInitialDraftQuote]);
  
  // === MISE À JOUR DES TOTAUX ===
  const updateTotals = useCallback((totals: Partial<DraftQuote['totals']>) => {
    if (!draftQuote) {
      // Si pas de brouillon initialisé, créer un nouveau avec les totaux
      const newDraft = createInitialDraftQuote();
      newDraft.totals = { ...newDraft.totals, ...totals };
      setDraftQuote(newDraft);
      lastSavedVersionRef.current = JSON.stringify(newDraft);
      setHasUnsavedChanges(true);
      return;
    }
    
    updateDraftQuote(prev => ({
      ...prev,
      totals: { ...prev.totals, ...totals }
    }));
  }, [updateDraftQuote, draftQuote, createInitialDraftQuote]);
  
  // === MISE À JOUR DES SÉLECTIONS ===
  const updateSelections = useCallback((selections: {
    selectedHaulage?: any;
    selectedSeafreights?: any[];
    selectedMiscellaneous?: any[];
    selectedContainers?: Record<string, any>;
  }) => {
    if (!draftQuote) {
      // Si pas de brouillon initialisé, créer un nouveau avec les sélections
      const newDraft = createInitialDraftQuote();
      Object.assign(newDraft, selections);
      setDraftQuote(newDraft);
      lastSavedVersionRef.current = JSON.stringify(newDraft);
      setHasUnsavedChanges(true);
      return;
    }
    
    updateDraftQuote(prev => ({
      ...prev,
      ...selections
    }));
  }, [updateDraftQuote, draftQuote, createInitialDraftQuote]);
  
  // === RÉINITIALISATION ===
  const resetDraft = useCallback(() => {
    const newDraft = createInitialDraftQuote();
    setDraftQuote(newDraft);
    lastSavedVersionRef.current = JSON.stringify(newDraft);
    setHasUnsavedChanges(false);
    setLastSavedAt(null);
  }, []);
  
  // === NETTOYAGE ===
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);
  
  return {
    // État
    draftQuote,
    isLoading: isLoading || isCreating || isUpdating || isLoadingExisting,
    hasUnsavedChanges,
    lastSavedAt,
    
    // Actions
    updateDraftQuote,
    updateStep,
    updateTotals,
    updateSelections,
    saveDraft,
    resetDraft,
    
    // États des mutations
    isCreating,
    isUpdating
  };
};
