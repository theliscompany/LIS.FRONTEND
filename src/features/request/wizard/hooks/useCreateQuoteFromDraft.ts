import { useMutation } from '@tanstack/react-query';
import { postApiDraftQuotesByIdFinalizeMutation, postApiQuotesMutation } from '@features/offer/api/@tanstack/react-query.gen';
import { useSnackbar } from 'notistack';
import type { QuoteResponseCommonApiResponse } from '@features/offer/api/types.gen';

export const useCreateQuoteFromDraft = () => {
  const { enqueueSnackbar } = useSnackbar();
  
  // Hook pour créer un devis
  const createQuoteMutation = useMutation(postApiQuotesMutation());

  return useMutation<any, any, any, QuoteResponseCommonApiResponse>({
    ...postApiDraftQuotesByIdFinalizeMutation(),
    mutationFn: async (variables) => {
      // Procéder directement à la finalisation
      console.log('📋 [useCreateQuoteFromDraft] Finalisation du brouillon...');
      console.log('🔍 [useCreateQuoteFromDraft] Variables:', variables);
      return postApiDraftQuotesByIdFinalizeMutation().mutationFn(variables);
    },
    onSuccess: async (finalizeData) => {
      // Cette fonction n'est appelée que si la finalisation a eu lieu
      console.log('✅ [useCreateQuoteFromDraft] Brouillon finalisé avec succès:', finalizeData);
      console.log('🔍 [useCreateQuoteFromDraft] Structure de la réponse:', {
        hasData: !!finalizeData.data,
        dataKeys: finalizeData.data ? Object.keys(finalizeData.data) : [],
        optionsCount: finalizeData.data?.options?.length || 0,
        fullData: finalizeData.data
      });
      
      try {
        // Récupérer les données du brouillon finalisé
        const draftData = finalizeData.data;
        if (!draftData) {
          throw new Error('Données du brouillon finalisé non trouvées dans la réponse');
        }
        
        if (!draftData.options || draftData.options.length === 0) {
          console.error('❌ [useCreateQuoteFromDraft] Aucune option trouvée:', {
            hasOptions: !!draftData.options,
            optionsLength: draftData.options?.length || 0,
            draftDataKeys: Object.keys(draftData)
          });
          throw new Error('Aucune option trouvée dans le brouillon finalisé');
        }

        // Le devis sera créé avec toutes les options disponibles
        console.log('✅ [useCreateQuoteFromDraft] Création du devis avec toutes les options:', {
          optionsCount: draftData.options.length,
          options: draftData.options.map(opt => ({ id: opt.optionId, name: opt.label }))
        });

        // Créer le devis sans option sélectionnée
        const quoteResponse = await createQuoteMutation.mutateAsync({
          body: {
            draftQuoteId: draftData.draftQuoteId,
            validityDays: 15, // 15 jours par défaut
            paymentTerms: 'Acompte conditionné par le score fiabilité',
            notes: 'Devis créé automatiquement depuis le brouillon'
          }
        });

        console.log('✅ [useCreateQuoteFromDraft] Devis créé avec succès:', quoteResponse);
        enqueueSnackbar('Devis créé avec succès !', { variant: 'success' });
        
        return quoteResponse;
      } catch (error) {
        console.error('❌ [useCreateQuoteFromDraft] Erreur lors de la création du devis:', error);
        enqueueSnackbar('Erreur lors de la création du devis', { variant: 'error' });
        throw error;
      }
    },
    onError: (error) => {
      console.error('❌ [useCreateQuoteFromDraft] Erreur lors de la finalisation:', error);
      enqueueSnackbar('Erreur lors de la finalisation du brouillon', { variant: 'error' });
    }
  });
};
