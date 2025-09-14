import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  getQuoteOffer,
  postApiQuoteOfferGenerateOptionByDraftId,
  postApiQuoteOfferAddOptionByQuoteId,
  postApiQuoteOfferSaveQuoteByTempQuoteId,
  postApiQuoteOfferQuoteByQuoteIdDuplicateOptionByOptionId,
  putApiQuoteByIdSelectPreferredOption,
  getQuoteOfferOptions,
  postApiQuoteOfferGenerateOptionByDraftIdMutation,
  postApiQuoteOfferAddOptionByQuoteIdMutation,
  postApiQuoteOfferSaveQuoteByTempQuoteIdMutation,
  postApiQuoteOfferQuoteByQuoteIdDuplicateOptionByOptionIdMutation,
  putApiQuoteByIdSelectPreferredOptionMutation
} from '../api';
import type { QuoteOptionDto, QuoteOptionRequest } from '../api/types.gen';

export interface QuoteOption {
  optionId: string;
  description: string;
  haulage?: any;
  seaFreight?: any;
  miscellaneous?: any[];
  deliveryAddress?: any;
  totals?: {
    haulageTotal: number;
    seafreightTotal: number;
    miscellaneousTotal: number;
    grandTotal: number;
  };
  portDeparture?: any;
  portDestination?: any;
  validUntil?: string;
  isSelected?: boolean;
  createdAt?: string;
}

export interface UseQuoteOptionsManagerProps {
  quoteId?: string;
  draftId?: string;
  onOptionGenerated?: (optionId: string) => void;
  onOptionSelected?: (optionId: string) => void;
}

export interface UseQuoteOptionsManagerReturn {
  // Data
  quote: any;
  options: QuoteOption[];
  selectedOptionId: string | null;
  
  // Loading states
  isLoadingQuote: boolean;
  isLoadingOptions: boolean;
  isGeneratingOption: boolean;
  isAddingOption: boolean;
  isSavingQuote: boolean;
  isDuplicatingOption: boolean;
  isSelectingOption: boolean;
  
  // Error states
  quoteError: string | null;
  optionsError: string | null;
  
  // Actions
  generateOption: (optionData: QuoteOptionDto) => Promise<{ success: boolean; data?: any; error?: Error }>;
  addOption: (optionData: QuoteOptionDto) => Promise<{ success: boolean; data?: any; error?: Error }>;
  duplicateOption: (optionId: string) => Promise<{ success: boolean; data?: any; error?: Error }>;
  selectOption: (optionId: string, reason?: string) => Promise<{ success: boolean; data?: any; error?: Error }>;
  saveQuote: (tempQuoteId: string) => Promise<{ success: boolean; data?: any; error?: Error }>;
  refreshQuote: () => void;
  refreshOptions: () => void;
}

export const useQuoteOptionsManager = ({
  quoteId,
  draftId,
  onOptionGenerated,
  onOptionSelected
}: UseQuoteOptionsManagerProps): UseQuoteOptionsManagerReturn => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // === QUERIES ===
  
  // Query pour récupérer les détails du devis
  const {
    data: quote,
    isLoading: isLoadingQuote,
    error: quoteError,
    refetch: refreshQuote
  } = useQuery({
    ...getQuoteOfferOptions({ path: { id: quoteId! } }),
    enabled: !!quoteId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // === MUTATIONS ===
  
  // Mutation pour générer une option depuis un draft
  const generateOptionMutation = useMutation({
    ...postApiQuoteOfferGenerateOptionByDraftIdMutation(),
    onSuccess: (data, variables) => {
      console.log('✅ Option générée avec succès:', data);
      enqueueSnackbar('Option générée avec succès', { variant: 'success' });
      
      // Invalider les caches liés
      if (quoteId) {
        queryClient.invalidateQueries({ queryKey: getQuoteOfferOptions({ path: { id: quoteId } }).queryKey });
      }
      
      // Callback
      const optionId = (data as any)?.optionId;
      if (optionId && onOptionGenerated) {
        onOptionGenerated(optionId);
      }
    },
    onError: (error: any) => {
      console.error('❌ Erreur lors de la génération d\'option:', error);
      enqueueSnackbar(`Erreur lors de la génération d'option: ${error.message || 'Erreur inconnue'}`, { variant: 'error' });
    }
  });

  // Mutation pour ajouter une option à un devis existant
  const addOptionMutation = useMutation({
    ...postApiQuoteOfferAddOptionByQuoteIdMutation(),
    onSuccess: (data, variables) => {
      console.log('✅ Option ajoutée avec succès:', data);
      enqueueSnackbar('Option ajoutée avec succès', { variant: 'success' });
      
      // Invalider les caches liés
      if (quoteId) {
        queryClient.invalidateQueries({ queryKey: getQuoteOfferOptions({ path: { id: quoteId } }).queryKey });
      }
    },
    onError: (error: any) => {
      console.error('❌ Erreur lors de l\'ajout d\'option:', error);
      enqueueSnackbar(`Erreur lors de l'ajout d'option: ${error.message || 'Erreur inconnue'}`, { variant: 'error' });
    }
  });

  // Mutation pour dupliquer une option
  const duplicateOptionMutation = useMutation({
    ...postApiQuoteOfferQuoteByQuoteIdDuplicateOptionByOptionIdMutation(),
    onSuccess: (data, variables) => {
      console.log('✅ Option dupliquée avec succès:', data);
      enqueueSnackbar('Option dupliquée avec succès', { variant: 'success' });
      
      // Invalider les caches liés
      if (quoteId) {
        queryClient.invalidateQueries({ queryKey: getQuoteOfferOptions({ path: { id: quoteId } }).queryKey });
      }
    },
    onError: (error: any) => {
      console.error('❌ Erreur lors de la duplication d\'option:', error);
      enqueueSnackbar(`Erreur lors de la duplication d'option: ${error.message || 'Erreur inconnue'}`, { variant: 'error' });
    }
  });

  // Mutation pour sélectionner une option préférée
  const selectOptionMutation = useMutation({
    ...putApiQuoteByIdSelectPreferredOptionMutation(),
    onSuccess: (data, variables) => {
      console.log('✅ Option sélectionnée avec succès:', data);
      enqueueSnackbar('Option sélectionnée comme préférée', { variant: 'success' });
      
      // Invalider les caches liés
      if (quoteId) {
        queryClient.invalidateQueries({ queryKey: getQuoteOfferOptions({ path: { id: quoteId } }).queryKey });
      }
      
      // Callback
      if (onOptionSelected) {
        onOptionSelected(variables.path.id);
      }
    },
    onError: (error: any) => {
      console.error('❌ Erreur lors de la sélection d\'option:', error);
      enqueueSnackbar(`Erreur lors de la sélection d'option: ${error.message || 'Erreur inconnue'}`, { variant: 'error' });
    }
  });

  // Mutation pour sauvegarder le devis final
  const saveQuoteMutation = useMutation({
    ...postApiQuoteOfferSaveQuoteByTempQuoteIdMutation(),
    onSuccess: (data, variables) => {
      console.log('✅ Devis sauvegardé avec succès:', data);
      enqueueSnackbar('Devis sauvegardé avec succès', { variant: 'success' });
    },
    onError: (error: any) => {
      console.error('❌ Erreur lors de la sauvegarde du devis:', error);
      enqueueSnackbar(`Erreur lors de la sauvegarde du devis: ${error.message || 'Erreur inconnue'}`, { variant: 'error' });
    }
  });

  // === HELPER FUNCTIONS ===
  
  const generateOption = async (optionData: QuoteOptionDto) => {
    if (!draftId) {
      return { success: false, error: new Error('Draft ID requis pour générer une option') };
    }

    try {
      const result = await generateOptionMutation.mutateAsync({
        path: { draftId },
        body: optionData
      });
      
      return {
        success: true,
        data: result,
        optionId: (result as any)?.optionId,
        quoteId: (result as any)?.quoteId
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error
      };
    }
  };

  const addOption = async (optionData: QuoteOptionDto) => {
    if (!quoteId) {
      return { success: false, error: new Error('Quote ID requis pour ajouter une option') };
    }

    try {
      const result = await addOptionMutation.mutateAsync({
        path: { quoteId },
        body: optionData
      });
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error
      };
    }
  };

  const duplicateOption = async (optionId: string) => {
    if (!quoteId) {
      return { success: false, error: new Error('Quote ID requis pour dupliquer une option') };
    }

    try {
      const result = await duplicateOptionMutation.mutateAsync({
        path: { quoteId, optionId }
      });
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error
      };
    }
  };

  const selectOption = async (optionId: string, reason?: string) => {
    if (!quoteId) {
      return { success: false, error: new Error('Quote ID requis pour sélectionner une option') };
    }

    try {
      const result = await selectOptionMutation.mutateAsync({
        path: { id: quoteId },
        body: { optionId: parseInt(optionId), reason }
      });
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error
      };
    }
  };

  const saveQuote = async (tempQuoteId: string) => {
    try {
      const result = await saveQuoteMutation.mutateAsync({
        path: { tempQuoteId }
      });
      
      return {
        success: true,
        data: result,
        finalQuoteId: (result as any)?.finalQuoteId
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error
      };
    }
  };

  const refreshOptions = () => {
    if (quoteId) {
      queryClient.invalidateQueries({ queryKey: getQuoteOfferOptions({ path: { id: quoteId } }).queryKey });
    }
  };

  // === EXTRACT OPTIONS FROM QUOTE ===
  const options: QuoteOption[] = quote?.options || [];
  const selectedOptionId = quote?.preferredOptionId || null;

  return {
    // Data
    quote,
    options,
    selectedOptionId,
    
    // Loading states
    isLoadingQuote,
    isLoadingOptions: false, // Les options sont incluses dans la quote
    isGeneratingOption: generateOptionMutation.isPending,
    isAddingOption: addOptionMutation.isPending,
    isSavingQuote: saveQuoteMutation.isPending,
    isDuplicatingOption: duplicateOptionMutation.isPending,
    isSelectingOption: selectOptionMutation.isPending,
    
    // Error states
    quoteError: quoteError?.message || null,
    optionsError: null,
    
    // Actions
    generateOption,
    addOption,
    duplicateOption,
    selectOption,
    saveQuote,
    refreshQuote,
    refreshOptions
  };
};
