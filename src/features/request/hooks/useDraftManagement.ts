import { useState, useCallback } from 'react';
import { useDraftPersistence } from '@features/request/services/DraftPersistenceService';
import { useDebugLogger } from '@features/request/hooks/useDebugLogger';
import { DraftQuote } from '@features/request/types/DraftQuote';
import { getApiRequestById } from '@features/request/api/sdk.gen';
import { showSnackbar } from '@features/request/utils/notificationUtils';

export const useDraftManagement = () => {
  const [draftQuote, setDraftQuote] = useState<DraftQuote | null>(null);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [isDraftLoaded, setIsDraftLoaded] = useState<boolean>(false);
  const [isLoadedFromDraft, setIsLoadedFromDraft] = useState<boolean>(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState<boolean>(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  const debugLog = useDebugLogger();
  const draftPersistence = useDraftPersistence(debugLog);

  // Create a new draft
  const createDraft = useCallback(async (draftData: Partial<DraftQuote>) => {
    try {
      setIsLoadingDraft(true);
      setDraftError(null);

      const response = await draftPersistence.saveDraft(draftData, null, null, '', {});
      const createdId = response?.draftId;

      if (createdId) {
        setCurrentDraftId(createdId);
        setDraftQuote(prev => prev ? { ...prev, id: createdId } : null);
        showSnackbar('Brouillon créé avec succès', 'success');
        return { success: true, id: createdId };
      } else {
        throw new Error('Aucun ID retourné lors de la création du brouillon');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du brouillon';
      setDraftError(errorMessage);
      showSnackbar(errorMessage, 'error');
      return { success: false, error: errorMessage };
    } finally {
      setIsLoadingDraft(false);
    }
  }, [draftPersistence]);

  // Update an existing draft
  const updateDraft = useCallback(async (draftData: Partial<DraftQuote>) => {
    if (!currentDraftId) {
      throw new Error('Aucun ID de brouillon disponible pour la mise à jour');
    }

    try {
      setIsLoadingDraft(true);
      setDraftError(null);

      const response = await draftPersistence.saveDraft(draftData, currentDraftId, null, '', {});
      
      if (response?.success) {
        showSnackbar('Brouillon mis à jour avec succès', 'success');
        return { success: true };
      } else {
        throw new Error('Échec de la mise à jour du brouillon');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour du brouillon';
      setDraftError(errorMessage);
      showSnackbar(errorMessage, 'error');
      return { success: false, error: errorMessage };
    } finally {
      setIsLoadingDraft(false);
    }
  }, [currentDraftId, draftPersistence]);

  // Load draft by ID
  const loadDraft = useCallback(async (draftId: string) => {
    try {
      setIsLoadingDraft(true);
      setDraftError(null);

      const response = await draftPersistence.loadDraft(draftId);
      
      if (response) {
        setDraftQuote(response);
        setCurrentDraftId(draftId);
        setIsDraftLoaded(true);
        setIsLoadedFromDraft(true);
        return { success: true, data: response };
      } else {
        throw new Error('Échec du chargement du brouillon');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement du brouillon';
      setDraftError(errorMessage);
      showSnackbar(errorMessage, 'error');
      return { success: false, error: errorMessage };
    } finally {
      setIsLoadingDraft(false);
    }
  }, [draftPersistence]);

  // Save current step to draft
  const saveCurrentStep = useCallback(async (stepData: any, stepNumber: number) => {
    if (!draftQuote) {
      return await createDraft({ [`step${stepNumber}`]: stepData });
    } else {
      return await updateDraft({ [`step${stepNumber}`]: stepData });
    }
  }, [draftQuote, createDraft, updateDraft]);

  // Reset draft state
  const resetDraft = useCallback(() => {
    setDraftQuote(null);
    setCurrentDraftId(null);
    setIsDraftLoaded(false);
    setIsLoadedFromDraft(false);
    setDraftError(null);
  }, []);

  // Check if draft has unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    // Implementation depends on your change tracking logic
    return false; // Placeholder
  }, []);

  return {
    // State
    draftQuote,
    currentDraftId,
    isDraftLoaded,
    isLoadedFromDraft,
    isLoadingDraft,
    draftError,
    
    // Actions
    createDraft,
    updateDraft,
    loadDraft,
    saveCurrentStep,
    resetDraft,
    hasUnsavedChanges,
    
    // Setters
    setDraftQuote,
    setCurrentDraftId,
    setIsDraftLoaded,
    setIsLoadedFromDraft
  };
};
