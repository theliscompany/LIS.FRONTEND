import { useState, useMemo, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useMutation } from '@tanstack/react-query';
// NOUVEAUX ENDPOINTS du SDK migré
import {
  postApiDraftQuotesByIdOptions,      // Ajouter option
  getApiDraftQuotesById,              // Récupérer draft
  postApiDraftQuotes,                 // Créer draft
  putApiDraftQuotesById,              // Mettre à jour draft
  postApiDraftQuotesByIdFinalize      // Finaliser en devis
} from '../../offer/api/sdk.gen';

// Types simplifiés pour la migration
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

// Type simplifié pour la compatibilité
export interface SimpleDraftQuote {
  id: string;
  requestQuoteId: string;
  emailUser: string;
  step1?: {
    company?: string;
    contactName?: string;
    phone?: string;
    notes?: string;
  };
  step2?: {
    cargoType?: string;
    goodsDescription?: string;
    originCity?: string;
    originCountry?: string;
    destinationCity?: string;
    destinationCountry?: string;
    portOfLoading?: string;
    portOfDestination?: string;
    incoterm?: string;
    requestedDeparture?: string;
  };
  step3?: {
    containers?: Array<{
      containerType: string;
      quantity: number;
      weight?: number;
      volume?: number;
    }>;
    hazmat?: boolean;
  };
  step4?: {
    selections?: Array<{
      id: string;
      provider: string;
      pricing?: {
        unitPrice: number;
        unit: string;
      };
    }>;
  };
  step5?: {
    selections?: Array<{
      id: string;
      carrier: string;
      service: string;
      etd?: string;
      eta?: string;
      validUntil?: string;
      charges?: {
        basePrice: number;
        surcharges?: Array<{
          code: string;
          label: string;
          value: number;
        }>;
      };
    }>;
  };
  step6?: {
    selections?: Array<{
      id: string;
      name: string;
      provider?: string;
      pricing?: {
        unitPrice: number;
        totalPrice: number;
        unit: string;
        taxable: boolean;
        taxRate?: number;
      };
    }>;
  };
  savedOptions?: DraftOptionFixed[];
  createdAt: string;
  updatedAt: string;
}

interface UseRealDraftOptionsManagerMigratedFixedProps {
  draftQuote?: SimpleDraftQuote;
  onDraftUpdate?: (updatedDraft: SimpleDraftQuote) => void;
}

export interface UseRealDraftOptionsManagerMigratedFixedReturn {
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

export const useRealDraftOptionsManagerMigratedFixed = ({
  draftQuote,
  onDraftUpdate
}: UseRealDraftOptionsManagerMigratedFixedProps): UseRealDraftOptionsManagerMigratedFixedReturn => {
  const { enqueueSnackbar } = useSnackbar();
  
  const [selectedOptionId] = useState<string | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Fonction pour calculer les totaux basés sur les données réelles du wizard
  const calculateRealTotals = useCallback((marginType: string = 'percentage', marginValue: number = 15) => {
    // Calcul du haulage basé sur step4
    let haulageTotalAmount = 0;
    if (draftQuote?.step4?.selections) {
      for (const haulage of draftQuote.step4.selections) {
        const unitPrice = haulage.pricing?.unitPrice || 0;
        haulageTotalAmount += unitPrice;
      }
    }

    // Calcul du seafreight basé sur step5
    let seafreightTotalAmount = 0;
    if (draftQuote?.step5?.selections) {
      for (const seafreight of draftQuote.step5.selections) {
        const basePrice = seafreight.charges?.basePrice || 0;
        let surchargesTotal = 0;
        if (seafreight.charges?.surcharges) {
          for (const surcharge of seafreight.charges.surcharges) {
            surchargesTotal += surcharge.value || 0;
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
          0;
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

  // 🆕 NOUVEAU : Fonction pour rafraîchir les options depuis l'API
  const refreshOptions = useCallback(async () => {
    if (!draftQuote?.id) return;
    
    try {
      setIsLoadingOptions(true);
      console.log('[MIGRATION] Chargement des options avec getApiDraftQuotesById');
      
      const response = await getApiDraftQuotesById({
        path: { id: draftQuote.id },
        throwOnError: true
      });
      
      if (response.data?.data && onDraftUpdate) {
        // Adapter la réponse au format SimpleDraftQuote existant
        const updatedDraft = {
          ...draftQuote,
          savedOptions: response.data.data.options?.map((opt: any) => ({
            optionId: opt.optionId || opt.id,
            name: opt.label || opt.name || 'Option sans nom',
            description: opt.description || '',
            marginType: 'percentage', // Valeur par défaut
            marginValue: 15, // Valeur par défaut
            createdAt: new Date().toISOString(),
            totals: calculateRealTotals('percentage', 15) // Calculer les totaux
          })) || []
        };
        
        onDraftUpdate(updatedDraft);
      }
    } catch (error) {
      console.error('[MIGRATION] Erreur lors du rafraîchissement des options:', error);
      enqueueSnackbar('Erreur lors du chargement des options', { variant: 'error' });
    } finally {
      setIsLoadingOptions(false);
    }
  }, [draftQuote?.id, onDraftUpdate, calculateRealTotals, enqueueSnackbar]);

  // 🆕 NOUVEAU : Mutation pour créer une option avec le nouvel endpoint
  const createOptionMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!draftQuote?.id) {
        throw new Error('DraftQuote avec ID requis pour créer une option');
      }

      console.log('[MIGRATION] Création option avec postApiDraftQuotesByIdOptions:', data);
      
      // Utiliser le nouvel endpoint pour ajouter une option
      const result = await postApiDraftQuotesByIdOptions({
        path: { id: draftQuote.id },
        body: {
          option: {
            label: data.name || `Option ${options.length + 1}`,
            containers: draftQuote.step3?.containers?.map(container => ({
              containerType: container.containerType,
              quantity: container.quantity || 1
            })) || [],
            // Mapping des données du wizard vers DraftQuoteOptionDto
            seafreightRef: draftQuote.step5?.selections?.[0]?.id || null,
            haulageRefs: draftQuote.step4?.selections?.map(h => h.id) || [],
            serviceRefs: draftQuote.step6?.selections?.map(s => s.id) || [],
            suppliers: {
              carrier: draftQuote.step5?.selections?.[0]?.carrier || null,
              haulage: draftQuote.step4?.selections?.map(h => h.provider) || [],
              services: draftQuote.step6?.selections?.map(s => ({
                serviceId: s.id,
                provider: s.provider || 'Unknown'
              })) || []
            },
            pricingPreview: {
              currency: 'EUR',
              lines: [],
              subtotals: {
                taxableBase: calculateRealTotals(data.marginType, data.marginValue).subTotal,
                nontaxableBase: 0
              },
              taxTotal: 0,
              grandTotal: calculateRealTotals(data.marginType, data.marginValue).finalTotal
            }
          }
        },
        throwOnError: true
      });
      
      return { result };
    },
    onSuccess: async () => {
      console.log('[MIGRATION] Option créée avec succès via postApiDraftQuotesByIdOptions');
      
      // Recharger les options depuis l'API
      await refreshOptions();
      
      enqueueSnackbar('Option créée avec succès', { variant: 'success' });
    },
    onError: (error: any) => {
      console.error('[MIGRATION] Erreur lors de la création de l\'option:', error);
      enqueueSnackbar(`Erreur lors de la création: ${error?.message || 'Erreur inconnue'}`, { variant: 'error' });
    }
  });

  // 🆕 NOUVEAU : Mutations pour mettre à jour et supprimer les options (TODO: implémenter avec les nouveaux endpoints)
  const updateOptionMutation = useMutation({
    mutationFn: async (data: { optionId: string; name: string; description: string; marginType?: string; marginValue?: number }) => {
      // TODO: Implémenter avec putApiDraftQuotesById en mettant à jour l'option spécifique
      console.log('[MIGRATION] Mise à jour option (non implémentée):', data);
      throw new Error('Mise à jour d\'option non encore implémentée avec le nouveau SDK');
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
      // TODO: Implémenter avec putApiDraftQuotesById en supprimant l'option spécifique
      console.log('[MIGRATION] Suppression option (non implémentée):', optionId);
      throw new Error('Suppression d\'option non encore implémentée avec le nouveau SDK');
    },
    onSuccess: async () => {
      await refreshOptions();
      enqueueSnackbar('Option supprimée avec succès', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(`Erreur lors de la suppression: ${error?.message || 'Erreur inconnue'}`, { variant: 'error' });
    }
  });

  // 🆕 NOUVEAU : Mutation pour créer un devis avec le nouvel endpoint
  const createQuoteFromDraftMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!draftQuote?.id) {
        throw new Error('DraftQuote avec ID requis pour créer un devis');
      }

      console.log('[MIGRATION] Création devis avec postApiDraftQuotesByIdFinalize:', data);
      
      return await postApiDraftQuotesByIdFinalize({
        path: { id: draftQuote.id },
        body: {
          options: options.map((option, index) => ({
            optionId: index + 1, // Les IDs d'options sont des entiers dans le nouveau système
            description: option.description || option.name,
            pricing: {
              totalAmount: option.totals.finalTotal,
              currency: option.totals.currency || 'EUR',
              breakdown: [
                {
                  category: 'haulage',
                  description: 'Transport Routier',
                  amount: option.totals.haulageTotalAmount
                },
                {
                  category: 'seafreight',
                  description: 'Transport Maritime',
                  amount: option.totals.seafreightTotalAmount
                },
                {
                  category: 'miscellaneous',
                  description: 'Services Divers',
                  amount: option.totals.miscTotalAmount
                },
                {
                  category: 'margin',
                  description: 'Marge',
                  amount: option.totals.marginAmount
                }
              ]
            }
          })),
          preferredOptionId: 1, // Par défaut, la première option
          quoteComments: data.quoteComments || `Devis créé avec ${options.length} option(s)`,
          expirationDate: data.expirationDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          sendToClient: false
        },
        throwOnError: true
      });
    },
    onSuccess: () => {
      enqueueSnackbar('Devis créé avec succès', { variant: 'success' });
    },
    onError: (error: any) => {
      console.error('[MIGRATION] Erreur lors de la création du devis:', error);
      enqueueSnackbar(`Erreur lors de la création du devis: ${error?.message || 'Erreur inconnue'}`, { variant: 'error' });
    }
  });

  // Helper functions
  const createOption = useCallback(async (optionData: { name: string; description: string; marginType?: string; marginValue?: number }) => {
    return createOptionMutation.mutateAsync(optionData);
  }, [createOptionMutation]);

  const exportForQuoteCreation = useMemo(() => {
    if (!draftQuote) return null;
    
    return {
      draftId: draftQuote.id,
      requestQuoteId: draftQuote.requestQuoteId,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      quoteComments: `Devis créé avec ${options.length} option(s)`
    };
  }, [draftQuote, options]);

  const updateOption = useCallback(async (optionId: string, optionData: {
    name: string;
    description: string;
    marginType?: string;
    marginValue?: number;
  }) => {
    if (!draftQuote?.id) {
      throw new Error('Draft ID requis pour mettre à jour une option');
    }

    console.log('[MIGRATION] Mise à jour option:', {
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

    console.log('[MIGRATION] Suppression option:', {
      optionId,
      currentOptionsCount: options.length
    });

    await deleteOptionMutation.mutateAsync(optionId);
  }, [draftQuote, deleteOptionMutation, options.length]);

  const createQuoteFromDraft = useCallback(async (quoteData: any) => {
    return createQuoteFromDraftMutation.mutateAsync(quoteData);
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
