import { useState, useCallback, useEffect, useRef } from 'react';
import { useSnackbar } from 'notistack';
import { 
  useCreateDraftQuote, 
  useDraftQuote, 
  useUpdateDraftQuote,
  useAddDraftQuoteOption,
  mapDraftQuoteFromApi,
  mapDraftQuoteToApi,
  validateDraftQuote
} from '../../offer/services/draftQuoteService';
import type { DraftQuote } from '../../offer/types/DraftQuote';
import { convertRequestToDraftQuote, validateRequestData } from '../utils/requestToDraftQuoteConverter';

interface WizardState {
  draftQuote: Partial<DraftQuote> | null;
  activeStep: number;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  saveError: string | null;
  isSaving: boolean;
}

interface UseWizardStateManagerOptions {
  initialDraftQuote: Partial<DraftQuote>;
  currentUserEmail: string;
  clientNumber: string;
  draftId?: string | null;
}

export const useWizardStateManagerV2 = ({
  initialDraftQuote,
  currentUserEmail,
  clientNumber,
  draftId
}: UseWizardStateManagerOptions) => {
  const { enqueueSnackbar } = useSnackbar();
  const [state, setState] = useState<WizardState>({
    draftQuote: initialDraftQuote,
    activeStep: 0,
    isDirty: false,
    isSaving: false,
    lastSavedAt: null,
    saveError: null,
  });

  // Hooks pour l'API
  const createMutation = useCreateDraftQuote();
  const updateMutation = useUpdateDraftQuote();
  const addOptionMutation = useAddDraftQuoteOption();
  
  // Récupération du brouillon existant si draftId fourni
  const { data: existingDraft, isLoading: isLoadingDraft } = useDraftQuote(
    draftId || '', 
    { enabled: !!draftId && draftId !== 'new' }
  );

  // Référence pour éviter les sauvegardes multiples
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialiser le brouillon depuis l'API si disponible
  useEffect(() => {
    if (existingDraft?.data?.data) {
      const mappedDraft = mapDraftQuoteFromApi(existingDraft.data.data);
      setState(prev => ({
        ...prev,
        draftQuote: mappedDraft,
        isDirty: false,
        lastSavedAt: new Date(),
      }));
    }
  }, [existingDraft]);

  // Mise à jour du brouillon
  const updateDraftQuote = useCallback((updates: Partial<DraftQuote>) => {
    setState(prev => ({
      ...prev,
      draftQuote: prev.draftQuote ? { ...prev.draftQuote, ...updates } : updates,
      isDirty: true,
    }));
  }, []);

  // Mise à jour d'une étape spécifique
  const updateStep = useCallback((stepNumber: number, data: any) => {
    setState(prev => {
      if (!prev.draftQuote) return prev;

      const updatedDraft = { ...prev.draftQuote };
      
      // Mapper les données selon l'étape
      switch (stepNumber) {
        case 1:
          updatedDraft.customer = { ...updatedDraft.customer, ...data.customer };
          updatedDraft.shipment = { ...updatedDraft.shipment, ...data.shipment };
          break;
        case 2:
          updatedDraft.wizard = { ...updatedDraft.wizard, ...data };
          break;
        case 3:
          updatedDraft.shipment = { ...updatedDraft.shipment, ...data };
          break;
        case 4:
        case 5:
        case 6:
          updatedDraft.wizard = { ...updatedDraft.wizard, ...data };
          break;
        case 7:
          // Récapitulatif - pas de données spécifiques
          break;
      }

      return {
        ...prev,
        draftQuote: updatedDraft,
        isDirty: true,
      };
    });
  }, []);

  // Sauvegarde automatique avec debounce
  const saveDraft = useCallback(async (): Promise<boolean> => {
    if (!state.draftQuote || state.isSaving) return false;

    // Annuler la sauvegarde précédente si elle est en cours
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    return new Promise((resolve) => {
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          setState(prev => ({ ...prev, isSaving: true, saveError: null }));

          // Valider les données
          const validation = validateDraftQuote(state.draftQuote);
          if (!validation.isValid) {
            console.warn('Validation failed:', validation.errors);
            setState(prev => ({ 
              ...prev, 
              isSaving: false, 
              saveError: validation.errors.join(', ') 
            }));
            resolve(false);
            return;
          }

          // Convertir vers le format API
          const apiDraft = mapDraftQuoteToApi(state.draftQuote);
          
          let result;
          if (state.draftQuote.draftQuoteId) {
            // Mise à jour d'un brouillon existant
            result = await updateMutation.mutateAsync({
              path: { id: state.draftQuote.draftQuoteId },
              body: apiDraft,
            });
          } else {
            // Création d'un nouveau brouillon
            result = await createMutation.mutateAsync({
              body: apiDraft,
            });
            
            // Mettre à jour l'ID du brouillon
            if (result.data?.data?.draftQuoteId) {
              setState(prev => ({
                ...prev,
                draftQuote: prev.draftQuote ? {
                  ...prev.draftQuote,
                  draftQuoteId: result.data?.data?.draftQuoteId
                } : null,
              }));
            }
          }

          setState(prev => ({
            ...prev,
            isSaving: false,
            isDirty: false,
            lastSavedAt: new Date(),
            saveError: null,
          }));

          console.log('✅ [WIZARD] Brouillon sauvegardé avec succès');
          resolve(true);
        } catch (error) {
          console.error('❌ [WIZARD] Erreur lors de la sauvegarde:', error);
          setState(prev => ({
            ...prev,
            isSaving: false,
            saveError: error instanceof Error ? error.message : 'Erreur inconnue',
          }));
          resolve(false);
        }
      }, 1000); // Debounce de 1 seconde
    });
  }, [state.draftQuote, state.isSaving, createMutation, updateMutation]);

  // Chargement d'un brouillon existant
  const loadDraft = useCallback(async (id: string): Promise<boolean> => {
    try {
      console.log('🔄 [WIZARD] Chargement du brouillon:', id);
      
      // Le hook useDraftQuote s'occupe du chargement
      // On attend que les données soient disponibles
      return true;
    } catch (error) {
      console.error('❌ [WIZARD] Erreur lors du chargement:', error);
      return false;
    }
  }, []);

  // Réinitialisation du brouillon
  const resetDraft = useCallback(() => {
    setState({
      draftQuote: initialDraftQuote,
      activeStep: 0,
      isDirty: false,
      isSaving: false,
      lastSavedAt: null,
      saveError: null,
    });
  }, [initialDraftQuote]);

  // Navigation entre les étapes
  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step <= 6) {
      setState(prev => ({ ...prev, activeStep: step }));
    }
  }, []);

  // Vérification si on peut aller à l'étape suivante
  const canGoToNext = useCallback((step: number): boolean => {
    if (!state.draftQuote) return false;

    switch (step) {
      case 0: // Étape 1 - Informations
        return !!(state.draftQuote.customer?.name && 
                 state.draftQuote.shipment?.origin?.location && 
                 state.draftQuote.shipment?.destination?.location);
      case 1: // Étape 2 - Services
        return !!(state.draftQuote.wizard?.selectedServiceLevel);
      case 2: // Étape 3 - Conteneurs
        return !!(state.draftQuote.shipment?.containerTypes?.length);
      case 3: // Étape 4 - Seafreight
        return true; // Optionnel
      case 4: // Étape 5 - Haulage
        return true; // Optionnel
      case 5: // Étape 6 - Miscellaneous
        return true; // Optionnel
      case 6: // Étape 7 - Récapitulatif
        return true;
      default:
        return false;
    }
  }, [state.draftQuote]);

  // Vérification si on peut aller à l'étape précédente
  const canGoToPrevious = useCallback((step: number): boolean => {
    return step > 0;
  }, []);

  // Ajout d'une option
  const addOption = useCallback(async (optionData: any) => {
    if (!state.draftQuote?.draftQuoteId) {
      console.error('❌ [WIZARD] Impossible d\'ajouter une option sans ID de brouillon');
      return false;
    }

    try {
      const result = await addOptionMutation.mutateAsync({
        path: { id: state.draftQuote.draftQuoteId },
        body: { option: optionData },
      });

      if (result.data?.data) {
        // Mettre à jour le brouillon local avec la nouvelle option
        setState(prev => ({
          ...prev,
          draftQuote: prev.draftQuote ? {
            ...prev.draftQuote,
            options: [...(prev.draftQuote.options || []), result.data?.data]
          } : null,
          isDirty: true,
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ [WIZARD] Erreur lors de l\'ajout de l\'option:', error);
      return false;
    }
  }, [state.draftQuote?.draftQuoteId, addOptionMutation]);

  // Sauvegarde automatique périodique
  useEffect(() => {
    if (state.isDirty && !state.isSaving) {
      const interval = setInterval(() => {
        saveDraft();
      }, 30000); // Sauvegarde automatique toutes les 30 secondes

      return () => clearInterval(interval);
    }
  }, [state.isDirty, state.isSaving, saveDraft]);

  // Nettoyage des timeouts
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    state,
    updateStep,
    updateDraftQuote,
    saveDraft,
    loadDraft,
    resetDraft,
    goToStep,
    canGoToNext,
    canGoToPrevious,
    addOption,
    isLoading: isLoadingDraft,
  };
};
