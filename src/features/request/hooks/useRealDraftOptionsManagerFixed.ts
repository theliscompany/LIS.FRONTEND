import { useState, useMemo, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useMutation } from '@tanstack/react-query';
// Import des fonctions SDK qui existent vraiment
import {
  postApiQuoteFromDraft,
  postApiQuoteOfferDraftByIdSaveAsOption,
  getApiQuoteOfferDraftByIdWithOptions
} from '../../offer/api';
import type { DraftQuote } from '../types/DraftQuote';

export interface DraftOptionFixed {
  optionId: string;
  name: string;
  description?: string;
  marginType: string;
  marginValue: number;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  totals: {
    haulageTotalAmount: number;
    seafreightTotalAmount: number;
    miscTotalAmount: number;
    subTotal: number;
    marginAmount: number;
    finalTotal: number;
    currency: string;
  };
}

interface UseRealDraftOptionsManagerFixedProps {
  draftQuote?: DraftQuote;
  onDraftUpdate?: (updatedDraft: DraftQuote) => void;
}

export interface UseRealDraftOptionsManagerFixedReturn {
  // Data
  options: DraftOptionFixed[];
  selectedOptionId: string | null;
  isLoadingOptions: boolean;
  canAddMoreOptions: boolean;
  isOptionValid: boolean;
  
  // Actions
  createOption: (optionData: { name: string; description: string; marginType?: string; marginValue?: number }) => Promise<any>;
  updateOption: (optionId: string, optionData: { name: string; description: string; marginType?: string; marginValue?: number }) => Promise<any>;
  deleteOption: (optionId: string) => Promise<any>;
  refreshOptions: () => Promise<any>;
  
  // Export pour création de devis
  exportForQuoteCreation: any;
  createQuoteFromDraft: (quoteData: any) => Promise<any>;
}

export const useRealDraftOptionsManagerFixed = ({
  draftQuote,
  onDraftUpdate
}: UseRealDraftOptionsManagerFixedProps): UseRealDraftOptionsManagerFixedReturn => {
  const { enqueueSnackbar } = useSnackbar();
  
  const [selectedOptionId] = useState<string | null>(null);

  // Fonction pour calculer les totaux basés sur les données réelles du wizard
  const calculateRealTotals = useCallback((marginType: string = 'percentage', marginValue: number = 15) => {
    // Calcul du haulage basé sur step4
    let haulageTotalAmount = 0;
    if (draftQuote?.step4?.calculation?.totalAmount) {
      haulageTotalAmount = parseFloat(draftQuote.step4.calculation.totalAmount.toString());
    } else if (draftQuote?.step4?.calculation?.subtotal) {
      haulageTotalAmount = parseFloat(draftQuote.step4.calculation.subtotal.toString());
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
            const quantity = container.quantity || 1;
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
        const servicePrice = 
          service.pricing?.unitPrice ||
          service.pricing?.totalPrice ||
          service.pricing?.price ||
          parseFloat(service.price?.toString() || '0');
        miscTotalAmount += servicePrice;
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

    // Calculer les totaux détaillés pour seafreight
    let seafreightBaseAmount = 0;
    let seafreightSurchargesAmount = 0;
    
    if (draftQuote?.step5?.selections) {
      for (const seafreight of draftQuote.step5.selections) {
        const basePrice = parseFloat(seafreight.charges?.basePrice?.toString() || '0');
        let surchargesTotal = 0;
        if (seafreight.charges?.surcharges) {
          for (const surcharge of seafreight.charges.surcharges) {
            surchargesTotal += parseFloat(surcharge.value?.toString() || '0');
          }
        }
        
        // Si on a des conteneurs, multiplier par la quantité
        if (draftQuote?.step3?.containers && draftQuote.step3.containers.length > 0) {
          for (const container of draftQuote.step3.containers) {
            const quantity = container.quantity || 1;
            seafreightBaseAmount += basePrice * quantity;
            seafreightSurchargesAmount += surchargesTotal * quantity;
          }
        } else {
          seafreightBaseAmount += basePrice;
          seafreightSurchargesAmount += surchargesTotal;
        }
      }
    }

    return {
      haulageTotalAmount,
      seafreightBaseAmount,
      seafreightSurchargesAmount,
      seafreightTotalAmount,
      miscTotalAmount,
      subTotal,
      marginAmount,
      finalTotal,
      currency: 'EUR'
    };
  }, [draftQuote]);

  // Utiliser les options du draftQuote au lieu du stockage local
  const options = useMemo(() => {
    return draftQuote?.savedOptions?.map(opt => ({
      optionId: opt.optionId,
      name: opt.name || 'Option sans nom',
      description: opt.description || '',
      marginType: opt.marginType || 'percentage',
      marginValue: opt.marginValue || 15,
      createdAt: opt.createdAt || new Date().toISOString(),
      updatedAt: opt.updatedAt,
      createdBy: opt.createdBy,
      totals: opt.totals || calculateRealTotals(opt.marginType, opt.marginValue)
    })) || [];
  }, [draftQuote?.savedOptions, calculateRealTotals]);

  const canAddMoreOptions = options.length < 3;
  const isOptionValid = true;
  
  const isLoadingOptions = false;

  // Fonction pour rafraîchir les options depuis l'API
  const refreshOptions = useCallback(async () => {
    if (!draftQuote?.id) return;
    
    try {
      console.log('[DEBUG] Chargement des options depuis WithOptions endpoint');
      const response = await getApiQuoteOfferDraftByIdWithOptions({
        path: { id: draftQuote.id }
      });
      
      if (response.data && onDraftUpdate) {
        // Mettre à jour le draft avec les nouvelles options
        onDraftUpdate(response.data as DraftQuote);
      }
    } catch (error) {
      console.error('[DEBUG] Erreur lors du rafraîchissement des options:', error);
    }
  }, [draftQuote?.id, onDraftUpdate]);

  // Mutation pour créer une option avec le nouvel endpoint dédié
  const createOptionMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!draftQuote?.id) {
        throw new Error('DraftQuote avec ID requis pour créer une option');
      }

      console.log('[DEBUG] Création option avec endpoint SaveAsOption:', data);
      
      // Utiliser le nouvel endpoint dédié
      const result = await postApiQuoteOfferDraftByIdSaveAsOption({
        path: { id: draftQuote.id },
        body: {
          name: data.name || `Option ${options.length + 1}`,
          description: data.description || 'Option créée depuis le wizard',
          marginType: data.marginType || 'percentage',
          marginValue: data.marginValue || 15,
          setAsPreferred: false
        }
      });
      
      return { result };
    },
    onSuccess: async () => {
      console.log('[DEBUG] Option créée avec succès via SaveAsOption');
      
      // Recharger les options depuis l'API
      await refreshOptions();
      
      enqueueSnackbar('Option créée avec succès', { variant: 'success' });
    },
    onError: (error: any) => {
      console.error('[DEBUG] Erreur lors de la création de l\'option:', error);
      enqueueSnackbar(`Erreur lors de la création: ${error?.message || 'Erreur inconnue'}`, { variant: 'error' });
    }
  });

  // Mutations pour mettre à jour et supprimer les options (TODO: implémenter avec les nouveaux endpoints)
  const updateOptionMutation = useMutation({
    mutationFn: async (data: { optionId: string; name: string; description: string; marginType?: string; marginValue?: number }) => {
      // TODO: Implémenter avec putApiQuoteOfferDraftByIdOptionByOptionId
      console.log('[DEBUG] Mise à jour option (non implémentée):', data);
      throw new Error('Mise à jour d\'option non encore implémentée');
    },
    onSuccess: async () => {
      await refreshOptions();
      enqueueSnackbar('Option mise à jour avec succès', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(`Erreur lors de la mise à jour: ${error?.message || 'Erreur inconnue'}`, { variant: 'error' });
    }
  });

  const deleteOptionMutation = useMutation({
    mutationFn: async (optionId: string) => {
      // TODO: Implémenter avec deleteApiQuoteOfferDraftByIdOptionByOptionId
      console.log('[DEBUG] Suppression option (non implémentée):', optionId);
      throw new Error('Suppression d\'option non encore implémentée');
    },
    onSuccess: async () => {
      await refreshOptions();
      enqueueSnackbar('Option supprimée avec succès', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(`Erreur lors de la suppression: ${error?.message || 'Erreur inconnue'}`, { variant: 'error' });
    }
  });

  const createQuoteFromDraftMutation = useMutation({
    mutationFn: (data: any) => postApiQuoteFromDraft(data),
    onSuccess: () => {
      enqueueSnackbar('Devis créé avec succès', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(`Erreur lors de la création du devis: ${error?.message || 'Erreur inconnue'}`, { variant: 'error' });
    }
  });

  // Helper functions
  const createOption = useCallback(async (optionData: { name: string; description: string; marginType?: string; marginValue?: number }) => {
    return createOptionMutation.mutateAsync(optionData);
  }, [createOptionMutation]);

  const exportForQuoteCreation = useMemo(() => {
    if (!draftQuote || !selectedOptionId) return null;
    
    const selectedOption = options.find(opt => opt.optionId === selectedOptionId);
    if (!selectedOption) return null;
    
    return {
      draftId: draftQuote.id,
      optionId: selectedOptionId,
      requestQuoteId: draftQuote.requestQuoteId,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      quoteComments: `Devis créé avec ${options.length} option(s)`
    };
  }, [draftQuote, options, selectedOptionId]);

  const updateOption = useCallback(async (optionId: string, optionData: {
    name: string;
    description: string;
    marginType?: string;
    marginValue?: number;
  }) => {
    if (!draftQuote?.id) {
      throw new Error('Draft ID requis pour mettre à jour une option');
    }

    console.log('[DEBUG] Mise à jour option:', {
      optionId,
      optionData,
      currentOptionsCount: options.length
    });

    await updateOptionMutation.mutateAsync({
      optionId,
      ...optionData
    });
  }, [draftQuote, updateOptionMutation, options.length]);

  const deleteOption = useCallback(async (optionId: string) => {
    if (!draftQuote?.id) {
      throw new Error('Draft ID requis pour supprimer une option');
    }

    console.log('[DEBUG] Suppression option:', {
      optionId,
      currentOptionsCount: options.length
    });

    await deleteOptionMutation.mutateAsync(optionId);
  }, [draftQuote, deleteOptionMutation, options.length]);

  const createQuoteFromDraft = useCallback(async (quoteData: any) => {
    return createQuoteFromDraftMutation.mutateAsync({
      body: quoteData
    });
  }, [createQuoteFromDraftMutation]);

  return {
    // Data
    options,
    selectedOptionId,
    isLoadingOptions,
    canAddMoreOptions,
    isOptionValid,
    
    // Actions
    createOption,
    updateOption,
    deleteOption,
    refreshOptions,
    
    // Export pour création de devis
    exportForQuoteCreation,
    createQuoteFromDraft
  };
};