import { useState, useEffect, useCallback, useRef } from 'react';
import { useSnackbar } from 'notistack';
import { 
  useCreateDraftQuote, 
  useDraftQuote, 
  useUpdateDraftQuote,
  mapDraftQuoteFromApi,
  mapDraftQuoteToApi,
  mapDraftQuoteToUpdateApi,
  validateDraftQuote,
  createEmptyOption
} from '../../offer/services/draftQuoteService';
import type { DraftQuote, DraftQuoteOption } from '../../offer/types/DraftQuote';

export interface WizardState {
  activeStep: number;
  draftQuote: DraftQuote;
  isDirty: boolean;
  lastSavedAt: Date | null;
  isSaving: boolean;
  saveError: string | null;
}

export interface UseWizardStateManagerReturn {
  state: WizardState;
  updateStep: (stepNumber: number, data: any) => void;
  updateDraftQuote: (updates: Partial<DraftQuote>) => void;
  saveDraft: () => Promise<boolean>;
  loadDraft: (draftId: string) => Promise<boolean>;
  resetDraft: () => void;
  goToStep: (stepNumber: number) => void;
  canGoToNext: () => boolean;
  canGoToPrevious: () => boolean;
}

export const useWizardStateManagerV3 = (
  initialDraftQuote: DraftQuote | null,
  currentUserEmail: string,
  clientNumber: string,
  initialDraftId?: string | null
): UseWizardStateManagerReturn => {
  const { enqueueSnackbar } = useSnackbar();
  
  // API Hooks
  const createMutation = useCreateDraftQuote();
  const updateMutation = useUpdateDraftQuote();
  const { data: existingDraft, isLoading: isLoadingDraft, refetch: refetchDraft } = useDraftQuote(
    initialDraftId || ''
  );

  // State
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(initialDraftId || null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedDataRef = useRef<string>('');
  const isInitialLoadRef = useRef<boolean>(true);

  // Create default draft quote
  const defaultDraftQuote: DraftQuote = {
    requestQuoteId: 'temp-request-id',
    status: 'draft',
    currency: 'EUR',
    incoterm: 'FOB',
    customer: {
      type: 'company',
      name: '',
      vat: '',
      emails: [],
      phones: [],
      address: { city: '', country: '' },
      contactPerson: { fullName: '', phone: '', email: '' },
    },
    shipment: {
      mode: 'sea',
      containerCount: 1,
      containerTypes: ['20GP'],
      commodity: '',
      hsCodes: [],
      origin: { location: '', country: '' },
      destination: { location: '', country: '' },
      requestedDeparture: new Date(),
      docs: { requiresVGM: false, requiresBLDraftApproval: false },
      constraints: { minTruckLeadDays: 6, terminalCutoffDays: 11, customsDeadlineHours: 48 },
    },
    wizard: { notes: '', selectedServiceLevel: 'standard', seafreights: [], haulages: [], services: [] },
    options: [],
    attachments: [],
    commercialTerms: { depositPolicy: { type: 'fixed', value: 0 }, generalConditionsId: '' },
  };

  const [state, setState] = useState<WizardState>({
    activeStep: 0,
    draftQuote: initialDraftQuote || defaultDraftQuote,
    isDirty: false,
    lastSavedAt: null,
    isSaving: false,
    saveError: null
  });

  // Sync currentDraftId with draftQuote.draftQuoteId
  useEffect(() => {
    const draftQuoteId = state.draftQuote?.draftQuoteId;
    if (draftQuoteId && draftQuoteId !== currentDraftId) {
      setCurrentDraftId(draftQuoteId);
    }
  }, [state.draftQuote?.draftQuoteId, currentDraftId]);

  // Load existing draft when available
  useEffect(() => {
    if (existingDraft?.data) {
      const mappedDraft = mapDraftQuoteFromApi(existingDraft.data);
      setState(prev => ({
        ...prev,
        draftQuote: mappedDraft,
        isDirty: false,
        lastSavedAt: new Date(),
      }));
    }
  }, [existingDraft]);

  // Utility functions
  const serializeDraftQuote = (draft: DraftQuote): string => {
    return JSON.stringify(draft, (key, value) => {
      if (value instanceof Date) return value.toISOString();
      return value;
    });
  };

  const hasUnsavedChanges = (current: DraftQuote): boolean => {
    const currentSerialized = serializeDraftQuote(current);
    return currentSerialized !== lastSavedDataRef.current;
  };

  // Save draft function
  const saveDraft = useCallback(async (): Promise<boolean> => {
    if (!state.draftQuote || state.isSaving) {
      return false;
    }

    try {
      setState(prev => ({ ...prev, isSaving: true, saveError: null }));

      // Validate data
      const validation = validateDraftQuote(state.draftQuote);
      if (!validation.isValid) {
        setState(prev => ({ 
          ...prev, 
          isSaving: false, 
          saveError: validation.errors.join(', ') 
        }));
        return false;
      }

      let draftId = state.draftQuote.draftQuoteId;
      
      if (draftId) {
        // Update existing draft
        const updateApiDraft = mapDraftQuoteToUpdateApi(state.draftQuote, []);
        const result = await updateMutation.mutateAsync({
          path: { id: draftId },
          body: updateApiDraft,
        });
        
        if (result?.data?.draftQuoteId) {
          draftId = result.data.draftQuoteId;
          setCurrentDraftId(draftId);
          setState(prev => ({
            ...prev,
            draftQuote: prev.draftQuote ? {
              ...prev.draftQuote,
              draftQuoteId: result.data!.draftQuoteId
            } : prev.draftQuote,
          }));
        }
      } else {
        // Create new draft
        const createApiDraft = mapDraftQuoteToApi(state.draftQuote);
        const result = await createMutation.mutateAsync({
          body: createApiDraft,
        });
        
        if (result?.data?.draftQuoteId) {
          draftId = result.data.draftQuoteId;
          setCurrentDraftId(draftId);
          setState(prev => ({
            ...prev,
            draftQuote: prev.draftQuote ? {
              ...prev.draftQuote,
              draftQuoteId: result.data!.draftQuoteId
            } : prev.draftQuote,
          }));
        }
      }

      // Update state after successful save
      const savedData = serializeDraftQuote(state.draftQuote);
      lastSavedDataRef.current = savedData;
      
      setState(prev => ({
        ...prev,
        isDirty: false,
        lastSavedAt: new Date(),
        isSaving: false,
        saveError: null,
      }));

      return true;
    } catch (error) {
      console.error('Error saving draft:', error);
      setState(prev => ({
        ...prev,
        isSaving: false,
        saveError: error instanceof Error ? error.message : 'Unknown error',
      }));
      return false;
    }
  }, [state.draftQuote, state.isSaving, createMutation, updateMutation]);

  // Auto-save with debounce
  const autoSaveDraft = useCallback(async (): Promise<boolean> => {
    if (state.isSaving) {
      return false;
    }

    const validation = validateDraftQuote(state.draftQuote);
    if (!validation.isValid) {
      return false;
    }

    setState(prev => ({ ...prev, isSaving: true, saveError: null }));

    try {
      const effectiveDraftId = state.draftQuote?.draftQuoteId || currentDraftId;
      const hasValidDraftId = effectiveDraftId && effectiveDraftId.trim() !== '' && effectiveDraftId !== 'new';
      
      const draftData = hasValidDraftId 
        ? mapDraftQuoteToUpdateApi(state.draftQuote, [])
        : mapDraftQuoteToApi(state.draftQuote);
      
      let result;
      if (hasValidDraftId) {
        result = await updateMutation.mutateAsync({
          path: { id: effectiveDraftId },
          body: draftData,
        });
      } else {
        result = await createMutation.mutateAsync({
          body: draftData,
        });
      }

      if (!effectiveDraftId && (result as any)?.data?.draftQuoteId) {
        const newDraftId = (result as any).data.draftQuoteId;
        setCurrentDraftId(newDraftId);
        setState(prev => ({
          ...prev,
          draftQuote: prev.draftQuote ? {
            ...prev.draftQuote,
            draftQuoteId: newDraftId
          } : prev.draftQuote,
        }));
      }
      
      const savedData = serializeDraftQuote(state.draftQuote);
      lastSavedDataRef.current = savedData;
      
      setState(prev => ({
        ...prev,
        isDirty: false,
        lastSavedAt: new Date(),
        isSaving: false,
        saveError: null
      }));

      return true;
    } catch (error) {
      console.error('Auto-save error:', error);
      setState(prev => ({
        ...prev,
        isSaving: false,
        saveError: error instanceof Error ? error.message : 'Unknown error'
      }));
      return false;
    }
  }, [state.draftQuote, state.isSaving, currentDraftId, createMutation, updateMutation]);

  // Schedule auto-save
  const scheduleAutoSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (state.isDirty && hasUnsavedChanges(state.draftQuote)) {
        autoSaveDraft();
      }
    }, 2000); // 2 second delay
  }, [state.isDirty, state.draftQuote, autoSaveDraft]);

  // Load draft function
  const loadDraft = useCallback(async (draftIdToLoad: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isSaving: true, saveError: null }));
      
      const response = await refetchDraft();
      if (response.data) {
        const loadedDraft = mapDraftQuoteFromApi(response.data as any);
        setState(prev => ({
          ...prev,
          draftQuote: loadedDraft,
          isDirty: false,
          lastSavedAt: new Date(),
          isSaving: false,
          saveError: null
        }));
        
        const serializedData = serializeDraftQuote(loadedDraft);
        lastSavedDataRef.current = serializedData;
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading draft:', error);
      setState(prev => ({
        ...prev,
        isSaving: false,
        saveError: error instanceof Error ? error.message : 'Unknown error'
      }));
      return false;
    }
  }, [refetchDraft]);

  // Update step function
  const updateStep = useCallback((stepNumber: number, data: any) => {
    setState(prev => {
      const stepKey = `step${stepNumber}` as keyof DraftQuote;
      const currentStepData = prev.draftQuote[stepKey];
      
      const updatedStepData = {
        ...(currentStepData && typeof currentStepData === 'object' ? currentStepData : {}),
        ...data
      };
      
      const updatedDraftQuote: DraftQuote = {
        ...prev.draftQuote,
        [stepKey]: updatedStepData
      };

      return {
        ...prev,
        draftQuote: updatedDraftQuote,
        isDirty: true
      };
    });

    if (data && Object.keys(data).length > 0) {
      scheduleAutoSave();
    }
  }, [scheduleAutoSave]);

  // Update draft quote function
  const updateDraftQuote = useCallback((updates: Partial<DraftQuote>) => {
    setState(prev => ({
      ...prev,
      draftQuote: { ...prev.draftQuote, ...updates },
      isDirty: true
    }));

    scheduleAutoSave();
  }, [scheduleAutoSave]);

  // Navigation functions
  const goToStep = useCallback((stepNumber: number) => {
    if (stepNumber >= 0 && stepNumber <= 6) {
      setState(prev => ({
        ...prev,
        activeStep: stepNumber
      }));
    }
  }, []);

  const canGoToNext = useCallback((): boolean => {
    const currentStep = state.activeStep;
    const draft = state.draftQuote;

    switch (currentStep) {
      case 0: // Step 1: Basic information
        return !!(draft.customer?.name && draft.shipment?.origin?.location && draft.shipment?.destination?.location);
      
      case 1: // Step 2: Services
        return draft.wizard?.services && draft.wizard.services.length > 0;
      
      case 2: // Step 3: Containers
        return draft.shipment?.containerTypes && draft.shipment.containerTypes.length > 0;
      
      case 3: // Step 4: Haulage
        return draft.wizard?.haulages && draft.wizard.haulages.length > 0;
      
      case 4: // Step 5: Seafreight
        return draft.wizard?.seafreights && draft.wizard.seafreights.length > 0;
      
      case 5: // Step 6: Miscellaneous
        return true; // Optional
      
      case 6: // Step 7: Summary
        return true; // Always accessible
      
      default:
        return false;
    }
  }, [state.activeStep, state.draftQuote]);

  const canGoToPrevious = useCallback((): boolean => {
    return state.activeStep > 0;
  }, [state.activeStep]);

  // Reset draft function
  const resetDraft = useCallback(() => {
    const initialDraft = defaultDraftQuote;
    const serializedData = serializeDraftQuote(initialDraft);
    
    lastSavedDataRef.current = serializedData;
    setCurrentDraftId(null);
    
    setState({
      activeStep: 0,
      draftQuote: initialDraft,
      isDirty: false,
      lastSavedAt: null,
      isSaving: false,
      saveError: null
    });
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (state.isDirty && hasUnsavedChanges(state.draftQuote) && !state.isSaving && !isInitialLoadRef.current) {
      scheduleAutoSave();
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state.draftQuote, state.isDirty, state.isSaving, scheduleAutoSave]);

  // Initial load effect
  useEffect(() => {
    if (initialDraftId) {
      loadDraft(initialDraftId);
    } else {
      isInitialLoadRef.current = false;
    }
  }, [initialDraftId, loadDraft]);

  return {
    state,
    updateStep,
    updateDraftQuote,
    saveDraft,
    loadDraft,
    resetDraft,
    goToStep,
    canGoToNext,
    canGoToPrevious
  };
};
