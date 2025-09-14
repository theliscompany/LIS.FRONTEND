import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  postApiQuoteOfferGenerateOptionByDraftIdMutation,
  postApiQuoteOfferRestartWizardByDraftIdMutation,
  postApiQuoteOfferAddOptionByQuoteIdMutation,
  postApiQuoteOfferSaveQuoteByTempQuoteIdMutation
} from '../api/@tanstack/react-query.gen';
import type { QuoteOptionDto } from '../api/types.gen';

export interface OfferWorkflowState {
  currentQuoteId: string | null;
  options: any[];
  isGenerating: boolean;
  isRestarting: boolean;
  isSaving: boolean;
}

export const useOfferWorkflow = () => {
  // Mutation pour générer une option depuis un draft
  const generateOptionMutation = useMutation({
    ...postApiQuoteOfferGenerateOptionByDraftIdMutation(),
    onSuccess: (data, variables) => {
      console.log('✅ Option générée avec succès:', data);
      // Vous pouvez ajouter ici une logique de cache invalidation si nécessaire
    },
    onError: (error) => {
      console.error('❌ Erreur lors de la génération d\'option:', error);
    }
  });

  // Mutation pour redémarrer le wizard
  const restartWizardMutation = useMutation({
    ...postApiQuoteOfferRestartWizardByDraftIdMutation(),
    onSuccess: (data) => {
      console.log('✅ Wizard redémarré avec succès:', data);
    },
    onError: (error) => {
      console.error('❌ Erreur lors du redémarrage du wizard:', error);
    }
  });

  // Mutation pour ajouter une option à un devis existant
  const addOptionMutation = useMutation({
    ...postApiQuoteOfferAddOptionByQuoteIdMutation(),
    onSuccess: (data) => {
      console.log('✅ Option ajoutée avec succès:', data);
    },
    onError: (error) => {
      console.error('❌ Erreur lors de l\'ajout d\'option:', error);
    }
  });

  // Mutation pour sauvegarder le devis final
  const saveQuoteMutation = useMutation({
    ...postApiQuoteOfferSaveQuoteByTempQuoteIdMutation(),
    onSuccess: (data) => {
      console.log('✅ Devis sauvegardé avec succès:', data);
    },
    onError: (error) => {
      console.error('❌ Erreur lors de la sauvegarde du devis:', error);
    }
  });

  // Fonction helper pour générer une option
  const generateOption = async (draftId: string, optionData: QuoteOptionDto) => {
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

  // Fonction helper pour redémarrer le wizard
  const restartWizard = async (draftId: string) => {
    try {
      const result = await restartWizardMutation.mutateAsync({
        path: { draftId }
      });
      
      return {
        success: true,
        data: result,
        newDraftId: (result as any)?.newDraftId
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error
      };
    }
  };

  // Fonction helper pour ajouter une option
  const addOption = async (quoteId: string, optionData: QuoteOptionDto) => {
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

  // Fonction helper pour sauvegarder le devis
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

  // État global du workflow
  const workflowState: OfferWorkflowState = {
    currentQuoteId: null, // À gérer via un état global si nécessaire
    options: [], // À gérer via un état global si nécessaire
    isGenerating: generateOptionMutation.isPending,
    isRestarting: restartWizardMutation.isPending,
    isSaving: saveQuoteMutation.isPending || addOptionMutation.isPending
  };

  return {
    // Mutations
    generateOptionMutation,
    restartWizardMutation,
    addOptionMutation,
    saveQuoteMutation,
    
    // Helper functions
    generateOption,
    restartWizard,
    addOption,
    saveQuote,
    
    // État
    workflowState,
    
    // États de chargement
    isGenerating: generateOptionMutation.isPending,
    isRestarting: restartWizardMutation.isPending,
    isAddingOption: addOptionMutation.isPending,
    isSaving: saveQuoteMutation.isPending,
    
    // Erreurs
    generateError: generateOptionMutation.error,
    restartError: restartWizardMutation.error,
    addOptionError: addOptionMutation.error,
    saveError: saveQuoteMutation.error
  };
};

export default useOfferWorkflow;
