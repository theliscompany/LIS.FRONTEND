import { useMutation, useQuery } from '@tanstack/react-query';
import { postApiDraftQuotesByIdFinalizeMutation, postApiQuotesMutation, getApiDraftQuotesByIdOptions } from '@features/offer/api/@tanstack/react-query.gen';
import { useSnackbar } from 'notistack';
import type { QuoteResponseCommonApiResponse } from '@features/offer/api/types.gen';

export const useFinalizeDraftQuote = () => {
  const { enqueueSnackbar } = useSnackbar();
  
  // Hook pour créer un devis (utilisé pour les brouillons déjà finalisés)
  const createQuoteMutation = useMutation(postApiQuotesMutation());

  return useMutation<any, any, any, QuoteResponseCommonApiResponse>({
    ...postApiDraftQuotesByIdFinalizeMutation(),
    mutationFn: async (variables) => {
      // Vérifier le statut du brouillon et gérer tous les cas
      const draftId = variables.path?.id;
      if (draftId) {
        try {
          // Utiliser useQuery pour récupérer les données du brouillon
          const draftQuery = getApiDraftQuotesByIdOptions({ path: { id: draftId } });
          const draftData = await draftQuery.queryFn({ queryKey: draftQuery.queryKey, signal: undefined });
          
          if (!draftData.data?.options || draftData.data.options.length === 0) {
            console.error('❌ [useFinalizeDraftQuote] Brouillon sans options:', {
              hasData: !!draftData.data,
              hasOptions: !!draftData.data?.options,
              optionsLength: draftData.data?.options?.length || 0,
              dataKeys: draftData.data ? Object.keys(draftData.data) : []
            });
            throw new Error('Le brouillon doit contenir au moins une option pour créer un devis.');
          }
          
          const status = draftData.data?.status;
          console.log('✅ [useFinalizeDraftQuote] Brouillon vérifié:', {
            status,
            optionsCount: draftData.data?.options?.length || 0,
            options: draftData.data?.options?.map(opt => ({ id: opt.optionId, name: opt.name })) || []
          });
          
          // Gestion selon le statut du brouillon
          switch (status) {
            case 'inprogress':
              console.log('📋 [useFinalizeDraftQuote] Brouillon en cours, finalisation puis création du devis...');
              // Procéder à la finalisation puis création du devis
              return postApiDraftQuotesByIdFinalizeMutation().mutationFn(variables);
              
            case 'finalized':
              console.log('📋 [useFinalizeDraftQuote] Brouillon déjà finalisé, création directe du devis...');
              // Créer directement le devis sans finalisation
              console.log('✅ [useFinalizeDraftQuote] Création du devis (brouillon finalisé) avec toutes les options:', {
                optionsCount: draftData.data.options.length,
                options: draftData.data.options.map(opt => ({ id: opt.optionId, name: opt.label }))
              });
              
              const quoteResponse = await createQuoteMutation.mutateAsync({
                body: {
                  draftQuoteId: draftData.data.draftQuoteId,
                  validityDays: 15,
                  paymentTerms: 'Acompte conditionné par le score fiabilité',
                  notes: 'Devis créé depuis un brouillon déjà finalisé'
                }
              });
              
              console.log('✅ [useFinalizeDraftQuote] Devis créé directement:', quoteResponse);
              return quoteResponse;
              
            case 'cancelled':
              throw new Error('Impossible de créer un devis à partir d\'un brouillon annulé.');
              
            case 'expired':
              throw new Error('Impossible de créer un devis à partir d\'un brouillon expiré.');
              
            default:
              throw new Error(`Statut de brouillon non supporté: ${status}. Seuls les brouillons 'inprogress' ou 'finalized' peuvent être utilisés.`);
          }
          
        } catch (error) {
          console.error('❌ [useFinalizeDraftQuote] Erreur lors de la vérification du brouillon:', error);
          throw error;
        }
      }
      
      // Fallback si pas de draftId
      throw new Error('ID du brouillon manquant');
    },
    onSuccess: async (finalizeData) => {
      // Cette fonction n'est appelée que si la finalisation a eu lieu
      // (pas pour les cas où le devis a été créé directement)
      console.log('✅ [useFinalizeDraftQuote] Brouillon finalisé avec succès:', finalizeData);
      console.log('🔍 [useFinalizeDraftQuote] Structure de la réponse:', {
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
          console.error('❌ [useFinalizeDraftQuote] Aucune option trouvée:', {
            hasOptions: !!draftData.options,
            optionsLength: draftData.options?.length || 0,
            draftDataKeys: Object.keys(draftData)
          });
          throw new Error('Aucune option trouvée dans le brouillon finalisé');
        }

        // Le devis sera créé avec toutes les options disponibles
        console.log('✅ [useFinalizeDraftQuote] Création du devis avec toutes les options:', {
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

        console.log('✅ [useFinalizeDraftQuote] Devis créé avec succès:', quoteResponse);
        enqueueSnackbar('Devis créé avec succès !', { variant: 'success' });
        
        return quoteResponse;
      } catch (error) {
        console.error('❌ [useFinalizeDraftQuote] Erreur lors de la création du devis:', error);
        enqueueSnackbar('Erreur lors de la création du devis', { variant: 'error' });
        throw error;
      }
    },
    onError: (error) => {
      console.error('❌ [useFinalizeDraftQuote] Erreur lors de la finalisation:', error);
      enqueueSnackbar('Erreur lors de la finalisation du brouillon', { variant: 'error' });
    }
  });
};
