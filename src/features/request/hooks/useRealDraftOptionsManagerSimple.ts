import { useState, useMemo, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// Import des fonctions SDK directement
import {
  getApiDraftQuotesById,
  postApiDraftQuotesByIdOptions,
  postApiDraftQuotesByIdOptions,
  deleteApiDraftQuotesById,
  postApiDraftQuotesByIdFinalize
} from '../../offer/api/sdk.gen';
import type { DraftQuote } from '../types/DraftQuote';

interface DraftWithOptionsResponse {
  options?: DraftOptionReal[];
  currentWorkingOptionId?: string | null;
  maxOptionsAllowed?: number;
  [key: string]: any;
}

export interface DraftOptionReal {
  optionId: string;
  name: string;
  description: string;
  
  // RÉFÉRENCES HISTORIQUES (snapshot au moment de la création, non modifiables)
  originalSelections: {
    haulageSelectionId?: string;
    seafreightSelectionIds?: string[];
    miscSelectionIds?: string[];
  };
  
  // DONNÉES INDÉPENDANTES (modifiables sans affecter le wizard)
  marginType: string;
  marginValue: number;
  
  // TOTAUX INDÉPENDANTS (modifiables manuellement sans affecter le wizard)
  totals: {
    haulageTotalAmount: number;
    seafreightTotalAmount: number;
    miscTotalAmount: number;
    subTotal: number;
    marginAmount: number;
    finalTotal: number;
    currency: string;
  };
  
  // SNAPSHOT HISTORIQUE du wizard (pour référence/audit uniquement)
  wizardSnapshot: {
    step4Data: any;
    step5Data: any;
    step6Data: any;
    capturedAt: string;
    note: string;
  };
  
  // Métadonnées
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
}

interface UseRealDraftOptionsManagerProps {
  draftQuote?: DraftQuote;
  onDraftUpdate?: (updatedDraft: DraftQuote) => void;
}

export interface UseRealDraftOptionsManagerReturn {
  // Data
  options: DraftOptionReal[];
  selectedOptionId: string | null;
  isLoadingOptions: boolean;
  currentWorkingOptionId: string | null;
  maxOptionsAllowed: number;
  canAddMoreOptions: boolean;
  isOptionValid: boolean;
  
  // Actions
  saveAsOption: (optionData: { name: string; description: string; marginType?: string; marginValue?: number }) => Promise<any>;
  loadOption: (optionId: string) => Promise<void>;
  deleteOption: (optionId: string) => Promise<void>;
  duplicateOption: (optionId: string) => Promise<void>;
  refreshOptions: () => Promise<any>;
  
  // Export pour création de devis
  exportForQuoteCreation: () => any;
  createQuoteFromDraft: (quoteData: any) => Promise<any>;
  
  // Nouvelles fonctions d'édition indépendante
  updateOptionTotals: (optionId: string, newTotals: Partial<DraftOptionReal['totals']>) => Promise<void>;
  updateOptionMargin: (optionId: string, marginType: string, marginValue: number) => Promise<void>;
}

export const useRealDraftOptionsManagerSimple = ({
  draftQuote,
  onDraftUpdate
}: UseRealDraftOptionsManagerProps): UseRealDraftOptionsManagerReturn => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  
  // Utiliser la vraie API pour récupérer les options
  const {
    data: draftWithOptions,
    isLoading: isLoadingOptions,
    refetch: refetchOptions
  } = useQuery({
    queryKey: ['draft-with-options', draftQuote?.id],
    queryFn: () => getApiDraftQuotesById({
      path: { id: draftQuote?.id || '' }
    }),
    enabled: !!draftQuote?.id,
    select: (data: any): DraftWithOptionsResponse => ({
      options: data?.options || [],
      currentWorkingOptionId: data?.currentWorkingOptionId,
      maxOptionsAllowed: data?.maxOptionsAllowed || 3,
      ...data
    })
  });
  
  const refreshOptions = useCallback(async () => {
    console.log('[DEBUG] Refresh options - refetch depuis API');
    
    // Invalider le cache ET refetch immédiatement
    await queryClient.invalidateQueries({
      queryKey: ['draft-with-options', draftQuote?.id]
    });
    
    // Attendre un délai pour laisser le temps au serveur de traiter
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = await refetchOptions();
    console.log('[DEBUG] Refresh options - résultat:', {
      optionsCount: result.data?.options?.length || 0,
      options: result.data?.options || []
    });
    
    return result;
  }, [queryClient, draftQuote?.id, refetchOptions]);

  // Fonction pour calculer les totaux basés sur les données réelles du wizard
  const calculateRealTotals = useCallback((marginType: string = 'percentage', marginValue: number = 15) => {
    // Calcul du haulage basé sur step4
    let haulageTotalAmount = 0;
    if (draftQuote?.step4?.calculation?.totalAmount) {
      haulageTotalAmount = parseFloat(draftQuote.step4.calculation.totalAmount.toString());
    }

    // Calcul du seafreight basé sur step5
    let seafreightTotalAmount = 0;
    if (draftQuote?.step5?.selections) {
      for (const seafreight of draftQuote.step5.selections) {
        const basePrice = parseFloat(seafreight.charges?.basePrice?.toString() || '0');
        let surchargesTotal = 0;
        if (seafreight.charges?.surcharges) {
          for (const surcharge of seafreight.charges.surcharges) {
            surchargesTotal += parseFloat(surcharge.value?.toString() || '0');
          }
        }
        const seafreightTotal = basePrice + surchargesTotal;
        
        // Si on a des conteneurs, multiplier par la quantité
        if (draftQuote?.step3?.containers && draftQuote.step3.containers.length > 0) {
          for (const container of draftQuote.step3.containers) {
            const quantity = parseInt(container.quantity?.toString() || '1');
            seafreightTotalAmount += seafreightTotal * quantity;
          }
        } else {
          seafreightTotalAmount += seafreightTotal;
        }
      }
    }

    // Calcul des services divers basé sur step6
    let miscTotalAmount = 0;
    if (draftQuote?.step6?.selections) {
      for (const service of draftQuote.step6.selections) {
        miscTotalAmount += parseFloat(service.pricing?.subtotal?.toString() || '0');
      }
    }

    // Calcul du sous-total
    const subTotal = haulageTotalAmount + seafreightTotalAmount + miscTotalAmount;

    // Calcul de la marge
    let marginAmount: number;
    if (marginType === 'percentage') {
      marginAmount = (subTotal * marginValue) / 100;
    } else {
      marginAmount = marginValue;
    }

    // Total final
    const finalTotal = subTotal + marginAmount;

    return {
      haulageTotalAmount,
      seafreightTotalAmount,
      miscTotalAmount,
      subTotal,
      marginAmount,
      finalTotal,
      currency: 'EUR'
    };
  }, [draftQuote]);

  // Vraies mutations API
  const saveAsOptionMutation = useMutation({
    mutationFn: (data: any) => postApiQuoteOfferDraftByIdSaveAsOption(data),
    onSuccess: async (result: any) => {
      console.log('[DEBUG] Option sauvegardée avec succès:', result);
      enqueueSnackbar('Option sauvegardée avec succès', { variant: 'success' });
      
      // Rafraîchir les options après la création
      try {
        await refreshOptions();
        console.log('[DEBUG] Options rafraîchies après création');
      } catch (error) {
        console.error('[DEBUG] Erreur lors du rafraîchissement:', error);
      }
    },
    onError: (error: any) => {
      console.error('[DEBUG] Erreur lors de la sauvegarde:', error);
      enqueueSnackbar(`Erreur lors de la sauvegarde: ${error?.message || 'Erreur inconnue'}`, { variant: 'error' });
    }
  });

  const loadOptionMutation = useMutation({
    mutationFn: (data: any) => postApiQuoteOfferDraftByIdLoadOptionByOptionId(data),
    onSuccess: (data: any) => {
      enqueueSnackbar('Option chargée avec succès', { variant: 'success' });
      refreshOptions();
      if (onDraftUpdate) {
        onDraftUpdate(data);
      }
    },
    onError: (error: any) => {
      enqueueSnackbar(`Erreur lors du chargement: ${error?.message || 'Erreur inconnue'}`, { variant: 'error' });
    }
  });

  const deleteOptionMutation = useMutation({
    mutationFn: (data: any) => deleteApiQuoteOfferDraftByIdOptionByOptionId(data),
    onSuccess: () => {
      enqueueSnackbar('Option supprimée avec succès', { variant: 'success' });
      refreshOptions();
    },
    onError: (error: any) => {
      enqueueSnackbar(`Erreur lors de la suppression: ${error?.message || 'Erreur inconnue'}`, { variant: 'error' });
    }
  });

  const createQuoteFromDraftMutation = useMutation({
    mutationFn: (data: any) => postApiDraftQuotesByIdFinalize(data),
    onSuccess: (data: any) => {
      enqueueSnackbar('Devis créé avec succès', { variant: 'success' });
      refreshOptions();
    },
    onError: (error: any) => {
      enqueueSnackbar(`Erreur lors de la création du devis: ${error?.message || 'Erreur inconnue'}`, { variant: 'error' });
    }
  });

  // Extraire les options du draft
  const options: DraftOptionReal[] = useMemo(() => {
    return draftWithOptions?.options || [];
  }, [draftWithOptions]);

  const currentWorkingOptionId = useMemo(() => {
    return draftWithOptions?.currentWorkingOptionId || null;
  }, [draftWithOptions]);

  const maxOptionsAllowed = useMemo(() => {
    return draftWithOptions?.maxOptionsAllowed || 3;
  }, [draftWithOptions]);

  const canAddMoreOptions = useMemo(() => {
    return options.length < maxOptionsAllowed;
  }, [options.length, maxOptionsAllowed]);

  const isOptionValid = useMemo(() => {
    return options.length > 0;
  }, [options.length]);

  const saveAsOption = useCallback(async (optionData: {
    name: string;
    description: string;
    marginType?: string;
    marginValue?: number;
  }) => {
    if (!draftQuote?.id) {
      throw new Error('Draft ID requis pour sauvegarder une option');
    }

    if (!draftQuote?.step4 && !draftQuote?.step5 && !draftQuote?.step6) {
      throw new Error('Aucune donnée du wizard trouvée. Complétez d\'abord les étapes du wizard.');
    }

    console.log('[DEBUG] Sauvegarde option avec données du wizard:', {
      step4: !!draftQuote?.step4,
      step5: !!draftQuote?.step5,
      step6: !!draftQuote?.step6,
      totalTEU: draftQuote?.totalTEU
    });

    await saveAsOptionMutation.mutateAsync({
      path: { id: draftQuote.id },
      body: {
        name: optionData.name,
        description: optionData.description,
        marginType: optionData.marginType || 'percentage',
        marginValue: optionData.marginValue || 15
      }
    });
  }, [draftQuote, saveAsOptionMutation]);

  const loadOption = useCallback(async (optionId: string) => {
    if (!draftQuote?.id) {
      throw new Error('Draft ID requis');
    }

    await loadOptionMutation.mutateAsync({
      path: { 
        id: draftQuote.id,
        optionId 
      }
    });
    
    setSelectedOptionId(optionId);
  }, [draftQuote?.id, loadOptionMutation]);

  const deleteOption = useCallback(async (optionId: string) => {
    if (!draftQuote?.id) {
      throw new Error('Draft ID requis');
    }

    await deleteOptionMutation.mutateAsync({
      path: {
        id: draftQuote.id,
        optionId
      }
    });
    
    if (selectedOptionId === optionId) {
      setSelectedOptionId(null);
    }
  }, [draftQuote?.id, deleteOptionMutation, selectedOptionId]);

  const duplicateOption = useCallback(async (optionId: string) => {
    const originalOption = options.find(opt => opt.optionId === optionId);
    if (!originalOption) {
      throw new Error('Option non trouvée');
    }

    await saveAsOption({
      name: `${originalOption.name} (Copie)`,
      description: originalOption.description,
      marginType: originalOption.marginType,
      marginValue: originalOption.marginValue
    });
  }, [options, saveAsOption]);

  const exportForQuoteCreation = useCallback(() => {
    if (!draftQuote?.id) { 
      throw new Error('Draft ID requis'); 
    }
    
    console.log(`[DEBUG] Export pour création devis: ${options.length} options disponibles`);
    if (options.length === 0) {
      console.warn('⚠️ Aucune option disponible lors de l\'export');
    }

    return {
      draftId: draftQuote.id,
      selectedOptionIds: selectedOptionId ? [selectedOptionId] : options.map(opt => opt.optionId),
      requestQuoteId: draftQuote.requestQuoteId,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      quoteComments: `Devis créé avec ${options.length} option(s)`
    };
  }, [draftQuote, options, selectedOptionId]);

  const createQuoteFromDraft = useCallback(async (quoteData: any) => {
    return createQuoteFromDraftMutation.mutateAsync({
      body: quoteData
    });
  }, [createQuoteFromDraftMutation]);

  // Fonctions d'édition indépendante (utilisant l'API SaveAsOption avec existingOptionId)
  const updateOptionTotals = useCallback(async (optionId: string, newTotals: Partial<DraftOptionReal['totals']>) => {
    if (!draftQuote?.id) {
      throw new Error('Draft ID requis');
    }

    const option = options.find(opt => opt.optionId === optionId);
    if (!option) {
      throw new Error('Option non trouvée');
    }

    await saveAsOptionMutation.mutateAsync({
      path: { id: draftQuote.id },
      body: {
        existingOptionId: optionId,
        name: option.name,
        description: option.description,
        marginType: option.marginType,
        marginValue: option.marginValue
      }
    });
  }, [draftQuote?.id, options, saveAsOptionMutation]);

  const updateOptionMargin = useCallback(async (optionId: string, marginType: string, marginValue: number) => {
    if (!draftQuote?.id) {
      throw new Error('Draft ID requis');
    }

    const option = options.find(opt => opt.optionId === optionId);
    if (!option) {
      throw new Error('Option non trouvée');
    }

    await saveAsOptionMutation.mutateAsync({
      path: { id: draftQuote.id },
      body: {
        existingOptionId: optionId,
        name: option.name,
        description: option.description,
        marginType: marginType,
        marginValue: marginValue
      }
    });
  }, [draftQuote?.id, options, saveAsOptionMutation]);

  return {
    // Data
    options,
    selectedOptionId,
    isLoadingOptions,
    currentWorkingOptionId,
    maxOptionsAllowed,
    canAddMoreOptions,
    isOptionValid,
    
    // Actions
    saveAsOption,
    loadOption,
    deleteOption,
    duplicateOption,
    refreshOptions,
    
    // Export pour création de devis
    exportForQuoteCreation,
    createQuoteFromDraft,
    
    // Nouvelles fonctions d'édition indépendante
    updateOptionTotals,
    updateOptionMargin
  };
};
