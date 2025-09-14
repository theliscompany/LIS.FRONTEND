import { useState, useMemo, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import type { DraftQuote } from '../types/DraftQuote';

export interface DraftOption {
  id: string;
  name: string;
  description: string;
  haulage?: any;
  seafreight?: any;
  miscellaneous?: any[];
  deliveryAddress?: any;
  totals: {
    haulageTotal: number;
    seafreightTotal: number;
    miscellaneousTotal: number;
    grandTotal: number;
  };
  validUntil: string;
  isSelected?: boolean;
  createdAt: Date;
}

export interface UseDraftOptionsManagerProps {
  draftQuote: DraftQuote;
  onDraftUpdate?: (updatedDraft: DraftQuote) => void;
}

export interface UseDraftOptionsManagerReturn {
  // Data
  options: DraftOption[];
  selectedOptionId: string | null;
  
  // Actions
  createOption: (optionData: Partial<DraftOption>) => DraftOption;
  updateOption: (optionId: string, optionData: Partial<DraftOption>) => void;
  deleteOption: (optionId: string) => void;
  duplicateOption: (optionId: string) => DraftOption;
  selectOption: (optionId: string) => void;
  clearOptions: () => void;
  
  // Helpers
  getOptionById: (optionId: string) => DraftOption | undefined;
  canAddMoreOptions: boolean;
  isOptionValid: (option: DraftOption) => boolean;
  
  // Export for API
  exportForQuoteCreation: () => {
    draftId: string;
    options: any[];
    preferredOptionId?: number;
    expirationDate?: string;
    quoteComments?: string;
  };
}

export const useDraftOptionsManager = ({
  draftQuote,
  onDraftUpdate
}: UseDraftOptionsManagerProps): UseDraftOptionsManagerReturn => {
  const { enqueueSnackbar } = useSnackbar();

  // État des options dans le brouillon
  const [options, setOptions] = useState<DraftOption[]>(() => {
    // Initialiser depuis le brouillon s'il y a des options sauvegardées
    return draftQuote?.step7?.options || [];
  });

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(() => {
    return draftQuote?.step7?.selectedOptionId || null;
  });

  // Calculer les totaux d'une option basée sur le draftQuote
  const calculateOptionTotals = useCallback((option: Partial<DraftOption>): DraftOption['totals'] => {
    let haulageTotal = 0;
    let seafreightTotal = 0;
    let miscellaneousTotal = 0;

    // Calculer le transport terrestre
    if (option.haulage && draftQuote?.step4?.selection) {
      haulageTotal = option.haulage.unitTariff || 0;
    }

    // Calculer le transport maritime
    if (option.seafreight && draftQuote?.step5?.selections) {
      // Utiliser les données du draftQuote pour calculer
      draftQuote.step5.selections.forEach((seafreight: any) => {
        if (draftQuote?.step3?.containers) {
          draftQuote.step3.containers.forEach((container: any) => {
            const quantity = container.quantity || 1;
            const basePrice = seafreight.charges?.basePrice || 0;
            seafreightTotal += basePrice * quantity;
          });
        } else {
          seafreightTotal += seafreight.charges?.basePrice || 0;
        }
      });
    }

    // Calculer les services divers
    if (option.miscellaneous) {
      miscellaneousTotal = option.miscellaneous.reduce((total, service) => {
        return total + (service.price || service.unitPrice || 0);
      }, 0);
    }

    const grandTotal = haulageTotal + seafreightTotal + miscellaneousTotal;

    return {
      haulageTotal,
      seafreightTotal,
      miscellaneousTotal,
      grandTotal
    };
  }, [draftQuote]);

  // Créer une nouvelle option
  const createOption = useCallback((optionData: Partial<DraftOption>): DraftOption => {
    const newOption: DraftOption = {
      id: `option_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: optionData.name || `Option ${options.length + 1}`,
      description: optionData.description || '',
      haulage: optionData.haulage,
      seafreight: optionData.seafreight,
      miscellaneous: optionData.miscellaneous || [],
      deliveryAddress: optionData.deliveryAddress,
      totals: calculateOptionTotals(optionData),
      validUntil: optionData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isSelected: false,
      createdAt: new Date()
    };

    setOptions(prev => {
      const newOptions = [...prev, newOption];
      updateDraftQuote({ options: newOptions });
      return newOptions;
    });

    enqueueSnackbar(`Option "${newOption.name}" créée`, { variant: 'success' });
    return newOption;
  }, [options.length, calculateOptionTotals, enqueueSnackbar]);

  // Mettre à jour une option
  const updateOption = useCallback((optionId: string, optionData: Partial<DraftOption>) => {
    setOptions(prev => {
      const newOptions = prev.map(option => 
        option.id === optionId 
          ? { 
              ...option, 
              ...optionData, 
              totals: calculateOptionTotals({ ...option, ...optionData }),
              id: optionId // Garder l'ID original
            }
          : option
      );
      updateDraftQuote({ options: newOptions });
      return newOptions;
    });

    enqueueSnackbar('Option mise à jour', { variant: 'success' });
  }, [calculateOptionTotals, enqueueSnackbar]);

  // Supprimer une option
  const deleteOption = useCallback((optionId: string) => {
    setOptions(prev => {
      const newOptions = prev.filter(option => option.id !== optionId);
      updateDraftQuote({ options: newOptions });
      
      // Désélectionner si c'était l'option sélectionnée
      if (selectedOptionId === optionId) {
        setSelectedOptionId(null);
        updateDraftQuote({ selectedOptionId: null });
      }
      
      return newOptions;
    });

    enqueueSnackbar('Option supprimée', { variant: 'info' });
  }, [selectedOptionId, enqueueSnackbar]);

  // Dupliquer une option
  const duplicateOption = useCallback((optionId: string): DraftOption => {
    const originalOption = options.find(opt => opt.id === optionId);
    if (!originalOption) {
      throw new Error('Option non trouvée');
    }

    const duplicatedOption: DraftOption = {
      ...originalOption,
      id: `option_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${originalOption.name} (Copie)`,
      isSelected: false,
      createdAt: new Date()
    };

    setOptions(prev => {
      const newOptions = [...prev, duplicatedOption];
      updateDraftQuote({ options: newOptions });
      return newOptions;
    });

    enqueueSnackbar(`Option "${duplicatedOption.name}" dupliquée`, { variant: 'success' });
    return duplicatedOption;
  }, [options, enqueueSnackbar]);

  // Sélectionner une option
  const selectOption = useCallback((optionId: string) => {
    setSelectedOptionId(optionId);
    updateDraftQuote({ selectedOptionId: optionId });
    enqueueSnackbar('Option sélectionnée', { variant: 'info' });
  }, [enqueueSnackbar]);

  // Effacer toutes les options
  const clearOptions = useCallback(() => {
    setOptions([]);
    setSelectedOptionId(null);
    updateDraftQuote({ options: [], selectedOptionId: null });
    enqueueSnackbar('Toutes les options ont été effacées', { variant: 'warning' });
  }, [enqueueSnackbar]);

  // Obtenir une option par ID
  const getOptionById = useCallback((optionId: string) => {
    return options.find(option => option.id === optionId);
  }, [options]);

  // Vérifier si on peut ajouter plus d'options (max 3)
  const canAddMoreOptions = useMemo(() => {
    return options.length < 3;
  }, [options.length]);

  // Valider une option
  const isOptionValid = useCallback((option: DraftOption) => {
    return !!(
      option.name &&
      option.description &&
      option.totals.grandTotal > 0 &&
      option.validUntil
    );
  }, []);

  // Mettre à jour le brouillon
  const updateDraftQuote = useCallback((step7Data: any) => {
    if (onDraftUpdate) {
      const updatedDraft = {
        ...draftQuote,
        step7: {
          ...draftQuote.step7,
          ...step7Data
        }
      };
      onDraftUpdate(updatedDraft);
    }
  }, [draftQuote, onDraftUpdate]);

  // Exporter pour la création de devis
  const exportForQuoteCreation = useCallback(() => {
    if (!draftQuote?.id) {
      throw new Error('Draft ID requis');
    }

    if (options.length === 0) {
      throw new Error('Au moins une option est requise');
    }

    // Convertir les options au format API
    const apiOptions = options.map((option, index) => ({
      optionId: index + 1,
      description: option.description,
      haulage: option.haulage ? {
        haulierId: option.haulage.haulierId,
        haulierName: option.haulage.haulierName,
        currency: option.haulage.currency,
        unitTariff: option.haulage.unitTariff,
        freeTime: option.haulage.freeTime,
        pickupAddress: option.haulage.pickupAddress,
        deliveryPort: option.haulage.deliveryPort,
        comment: option.haulage.comment,
        validUntil: option.validUntil
      } : undefined,
      seaFreight: option.seafreight ? {
        seaFreightId: option.seafreight.seaFreightId,
        carrierName: option.seafreight.carrierName,
        carrierAgentName: option.seafreight.carrierAgentName,
        departurePort: option.seafreight.departurePort,
        destinationPort: option.seafreight.destinationPort,
        currency: option.seafreight.currency,
        transitTimeDays: option.seafreight.transitTimeDays,
        frequency: option.seafreight.frequency,
        defaultContainer: option.seafreight.defaultContainer,
        containers: option.seafreight.containers?.map(container => ({
          containerType: container.containerType,
          quantity: container.quantity,
          unitPrice: container.unitPrice
        })) || [],
        comment: option.seafreight.comment,
        validUntil: option.validUntil
      } : undefined,
      miscellaneous: option.miscellaneous?.map(misc => ({
        supplierName: misc.supplierName,
        currency: misc.currency,
        serviceId: misc.serviceId,
        serviceName: misc.serviceName,
        price: misc.price,
        validUntil: option.validUntil
      })) || [],
      deliveryAddress: option.deliveryAddress,
      pricing: {
        amount: option.totals.grandTotal,
        currency: 'EUR'
      },
      validUntil: option.validUntil
    }));

    return {
      draftId: draftQuote.id,
      options: apiOptions,
      preferredOptionId: selectedOptionId ? 
        options.findIndex(opt => opt.id === selectedOptionId) + 1 : 
        undefined,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      quoteComments: `Devis créé avec ${options.length} option(s)`
    };
  }, [draftQuote, options, selectedOptionId]);

  return {
    // Data
    options,
    selectedOptionId,
    
    // Actions
    createOption,
    updateOption,
    deleteOption,
    duplicateOption,
    selectOption,
    clearOptions,
    
    // Helpers
    getOptionById,
    canAddMoreOptions,
    isOptionValid,
    
    // Export
    exportForQuoteCreation
  };
};
