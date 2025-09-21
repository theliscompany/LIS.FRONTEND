import { useState, useCallback, useMemo } from 'react';
import type { DraftQuote, DraftQuoteOption, DraftQuoteStatus } from '../types/DraftQuote';
import { validateDraftQuote, createEmptyOption, calculateOptionTotals } from '../services/draftQuoteService';

interface UseDraftQuoteStateOptions {
  initialDraftQuote?: Partial<DraftQuote>;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
}

export const useDraftQuoteState = (options: UseDraftQuoteStateOptions = {}) => {
  const { initialDraftQuote, onValidationChange } = options;
  
  const [draftQuote, setDraftQuote] = useState<Partial<DraftQuote>>(
    initialDraftQuote || {
      requestQuoteId: '',
      currency: 'EUR',
      incoterm: 'FOB',
      status: 'draft' as DraftQuoteStatus,
      customer: {
        type: 'company',
        name: '',
        emails: [],
        phones: [],
        address: {
          city: '',
          country: '',
        },
      },
      shipment: {
        mode: 'sea',
        containerCount: 1,
        containerTypes: ['20GP'],
        commodity: '',
        hsCodes: [],
        origin: {
          location: '',
          country: '',
        },
        destination: {
          location: '',
          country: '',
        },
        docs: {
          requiresVGM: false,
          requiresBLDraftApproval: false,
        },
        constraints: {
          minTruckLeadDays: 6,
          terminalCutoffDays: 11,
          customsDeadlineHours: 48,
        },
      },
      commercialTerms: {
        depositPolicy: {
          type: 'fixed',
          value: 0,
        },
        generalConditionsId: '',
      },
      wizard: {
        notes: '',
        selectedServiceLevel: 'standard',
        seafreights: [],
        haulages: [],
        services: [],
      },
      options: [],
    }
  );

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Validation
  const validation = useMemo(() => {
    const result = validateDraftQuote(draftQuote);
    onValidationChange?.(result.isValid, result.errors);
    return result;
  }, [draftQuote, onValidationChange]);

  // Mise à jour du brouillon
  const updateDraftQuote = useCallback((updates: Partial<DraftQuote>) => {
    setDraftQuote(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Mise à jour du client
  const updateCustomer = useCallback((customerUpdates: Partial<DraftQuote['customer']>) => {
    setDraftQuote(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        ...customerUpdates,
      },
    }));
  }, []);

  // Mise à jour de l'expédition
  const updateShipment = useCallback((shipmentUpdates: Partial<DraftQuote['shipment']>) => {
    setDraftQuote(prev => ({
      ...prev,
      shipment: {
        ...prev.shipment,
        ...shipmentUpdates,
      },
    }));
  }, []);

  // Mise à jour du wizard
  const updateWizard = useCallback((wizardUpdates: Partial<DraftQuote['wizard']>) => {
    setDraftQuote(prev => ({
      ...prev,
      wizard: {
        ...prev.wizard,
        ...wizardUpdates,
      },
    }));
  }, []);

  // Gestion des options
  const addOption = useCallback((option?: Partial<DraftQuoteOption>) => {
    const newOption = {
      ...createEmptyOption(),
      ...option,
    };
    
    setDraftQuote(prev => ({
      ...prev,
      options: [...(prev.options || []), newOption],
    }));
    
    return newOption;
  }, []);

  const updateOption = useCallback((optionId: string, updates: Partial<DraftQuoteOption>) => {
    setDraftQuote(prev => ({
      ...prev,
      options: prev.options?.map(option => 
        option.optionId === optionId 
          ? { ...option, ...updates }
          : option
      ),
    }));
  }, []);

  const deleteOption = useCallback((optionId: string) => {
    setDraftQuote(prev => ({
      ...prev,
      options: prev.options?.filter(option => option.optionId !== optionId),
    }));
    
    if (selectedOptionId === optionId) {
      setSelectedOptionId(null);
    }
  }, [selectedOptionId]);

  const recalculateOptionTotals = useCallback((optionId: string) => {
    setDraftQuote(prev => ({
      ...prev,
      options: prev.options?.map(option => 
        option.optionId === optionId 
          ? calculateOptionTotals(option)
          : option
      ),
    }));
  }, []);

  // Gestion des statuts
  const setStatus = useCallback((status: DraftQuoteStatus) => {
    setDraftQuote(prev => ({
      ...prev,
      status,
    }));
  }, []);

  const startEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  const stopEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  const reset = useCallback(() => {
    setDraftQuote(initialDraftQuote || {
      requestQuoteId: '',
      currency: 'EUR',
      incoterm: 'FOB',
      status: 'draft' as DraftQuoteStatus,
      customer: {
        type: 'company',
        name: '',
        emails: [],
        phones: [],
        address: {
          city: '',
          country: '',
        },
      },
      shipment: {
        mode: 'sea',
        containerCount: 1,
        containerTypes: ['20GP'],
        commodity: '',
        hsCodes: [],
        origin: {
          location: '',
          country: '',
        },
        destination: {
          location: '',
          country: '',
        },
        docs: {
          requiresVGM: false,
          requiresBLDraftApproval: false,
        },
        constraints: {
          minTruckLeadDays: 6,
          terminalCutoffDays: 11,
          customsDeadlineHours: 48,
        },
      },
      commercialTerms: {
        depositPolicy: {
          type: 'fixed',
          value: 0,
        },
        generalConditionsId: '',
      },
      wizard: {
        notes: '',
        selectedServiceLevel: 'standard',
        seafreights: [],
        haulages: [],
        services: [],
      },
      options: [],
    });
    setSelectedOptionId(null);
    setIsEditing(false);
  }, [initialDraftQuote]);

  // Getters utiles
  const selectedOption = useMemo(() => {
    return draftQuote.options?.find(option => option.optionId === selectedOptionId) || null;
  }, [draftQuote.options, selectedOptionId]);

  const hasOptions = useMemo(() => {
    return (draftQuote.options?.length || 0) > 0;
  }, [draftQuote.options]);

  const canFinalize = useMemo(() => {
    return validation.isValid && hasOptions && selectedOptionId && draftQuote.status === 'in_progress';
  }, [validation.isValid, hasOptions, selectedOptionId, draftQuote.status]);

  const totalOptions = useMemo(() => {
    return draftQuote.options?.length || 0;
  }, [draftQuote.options]);

  const totalValue = useMemo(() => {
    return draftQuote.options?.reduce((sum, option) => {
      return sum + (option.totals?.grandTotal || 0);
    }, 0) || 0;
  }, [draftQuote.options]);

  return {
    // État
    draftQuote,
    selectedOptionId,
    isEditing,
    validation,
    
    // Getters
    selectedOption,
    hasOptions,
    canFinalize,
    totalOptions,
    totalValue,
    
    // Actions
    updateDraftQuote,
    updateCustomer,
    updateShipment,
    updateWizard,
    addOption,
    updateOption,
    deleteOption,
    recalculateOptionTotals,
    setSelectedOptionId,
    setStatus,
    startEditing,
    stopEditing,
    reset,
  };
};
