import { useMutation } from '@tanstack/react-query';
import { 
  postApiDraftQuotesMutation, 
  putApiDraftQuotesByIdMutation
} from '@features/offer/api/@tanstack/react-query.gen';
import { toCreateDraftQuoteRequest, validateDraftQuoteData } from '../adapters/toCreateDraftQuoteRequest';
import { toDraftQuoteOptionPayload } from '../adapters/toDraftQuoteOptionPayload';
import { DraftQuoteForm } from '../schema';
import { useState } from 'react';

interface UseDraftQuoteSaveProps {
  requestQuoteId: string;
  draftId?: string; // ID du brouillon existant pour les mises à jour
  onSuccess?: (draftId: string) => void;
  onError?: (error: Error) => void;
}

export const useDraftQuoteSave = ({ requestQuoteId, draftId, onSuccess, onError }: UseDraftQuoteSaveProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const createDraftMutation = useMutation({
    ...postApiDraftQuotesMutation(),
    onSuccess: (response) => {
      console.log('✅ [MUTATION] POST /api/draft-quotes - Succès');
      console.log('📊 [MUTATION] Réponse complète:', response);
      setLastSaved(new Date());
      if (response.data?.draftQuoteId) {
        onSuccess?.(response.data.draftQuoteId);
      }
    },
    onError: (error) => {
      console.error('❌ [MUTATION] POST /api/draft-quotes - Erreur');
      console.error('📊 [MUTATION] Erreur complète:', error);
      onError?.(error as Error);
    }
  });

  const updateDraftMutation = useMutation({
    ...putApiDraftQuotesByIdMutation(),
    onSuccess: (response) => {
      console.log('✅ [MUTATION] PUT /api/draft-quotes/{id} - Succès');
      console.log('📊 [MUTATION] Réponse complète:', response);
      setLastSaved(new Date());
    },
    onError: (error) => {
      console.error('❌ [MUTATION] PUT /api/draft-quotes/{id} - Erreur');
      console.error('📊 [MUTATION] Erreur complète:', error);
      onError?.(error as Error);
    }
  });


  const saveDraft = async (formData: DraftQuoteForm): Promise<string | null> => {
    // Utiliser saveDraftWithOptions pour sauvegarder le brouillon avec toutes les options
    return await saveDraftWithOptions(formData, draftId);
  };

  const saveDraftWithOptions = async (formData: DraftQuoteForm, existingDraftId?: string): Promise<string | null> => {
    try {
      setIsSaving(true);
      
      console.log('🚀 [SAVE] === DÉBUT DE LA SAUVEGARDE ===');
      console.log('🆔 [SAVE] DraftId reçu:', existingDraftId);
      console.log('🆔 [SAVE] DraftId du hook:', draftId);
      console.log('📋 [SAVE] Données du formulaire:', JSON.stringify(formData, null, 2));
      console.log('🆔 [SAVE] RequestQuoteId:', requestQuoteId);
      console.log('🆔 [SAVE] ExistingDraftId:', existingDraftId || 'Aucun (création)');
      
      // Valider les données
      const validation = validateDraftQuoteData(formData);
      if (!validation.isValid) {
        console.error('❌ [SAVE] Validation échouée:', validation.errors);
        throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
      }
      console.log('✅ [SAVE] Validation réussie');

      // Convertir vers le format API
      const createRequest = toCreateDraftQuoteRequest(formData, requestQuoteId);
      console.log('🔄 [SAVE] Sauvegarde du brouillon avec options:', createRequest);

      let savedDraftId: string;

      if (existingDraftId) {
        // Mettre à jour un brouillon existant avec PUT (incluant les options)
        console.log('🔄 [SAVE] === MISE À JOUR DU BROUILLON EXISTANT (PUT) ===');
        console.log('🆔 [SAVE] DraftId existant:', existingDraftId);
        
        // Convertir les options vers le format API
        console.log('🔍 [SAVE] formData.existingOptions (avec seafreights array):', formData.existingOptions);
        const optionsPayload = formData.existingOptions && formData.existingOptions.length > 0 
          ? formData.existingOptions.map(option => {
              console.log('🔍 [SAVE] Conversion option:', option);
              console.log('🔍 [SAVE] option.seafreights:', option.seafreights);
              console.log('🔍 [SAVE] option.haulages:', option.haulages);
              console.log('🔍 [SAVE] option.services:', option.services);
              return toDraftQuoteOptionPayload(option);
            })
          : [];
        
        // Créer le payload de mise à jour avec les options
        const updatePayload = {
          customer: createRequest.customer,
          shipment: createRequest.shipment,
          wizard: createRequest.wizard,
          options: optionsPayload,
          notes: createRequest.wizard?.notes || null
        };
        
        console.log('📡 [API] Appel PUT /api/draft-quotes/' + existingDraftId);
        console.log('📦 [API] Payload PUT avec options:', JSON.stringify(updatePayload, null, 2));
        
        const response = await updateDraftMutation.mutateAsync({
          path: { id: existingDraftId },
          body: updatePayload
        });
        
        console.log('✅ [API] Réponse PUT:', JSON.stringify(response, null, 2));
        savedDraftId = existingDraftId;
      } else {
        // Créer un nouveau brouillon avec POST (incluant les options)
        console.log('🔄 [SAVE] === CRÉATION D\'UN NOUVEAU BROUILLON (POST) ===');
        console.log('🆔 [SAVE] Aucun DraftId existant, création d\'un nouveau brouillon');
        
        // Convertir les options vers le format API
        console.log('🔍 [SAVE] formData.existingOptions (POST avec seafreights array):', formData.existingOptions);
        const optionsPayload = formData.existingOptions && formData.existingOptions.length > 0 
          ? formData.existingOptions.map(option => {
              console.log('🔍 [SAVE] Conversion option (POST):', option);
              console.log('🔍 [SAVE] option.seafreights (POST):', option.seafreights);
              console.log('🔍 [SAVE] option.haulages (POST):', option.haulages);
              console.log('🔍 [SAVE] option.services (POST):', option.services);
              return toDraftQuoteOptionPayload(option);
            })
          : [];
        
        // Créer le payload de création avec les options
        const createPayloadWithOptions = {
          ...createRequest,
          options: optionsPayload
        };
        
        console.log('📡 [API] Appel POST /api/draft-quotes');
        console.log('📦 [API] Payload POST avec options:', JSON.stringify(createPayloadWithOptions, null, 2));
        
        const response = await createDraftMutation.mutateAsync({
          body: createPayloadWithOptions
        });
        
        console.log('✅ [API] Réponse POST:', JSON.stringify(response, null, 2));
        savedDraftId = (response as any).data?.data?.draftQuoteId || (response as any).data?.draftQuoteId;
        if (!savedDraftId) {
          console.error('❌ [API] Structure de réponse inattendue:', {
            hasData: !!(response as any).data,
            hasDataData: !!(response as any).data?.data,
            hasDraftQuoteIdInData: !!(response as any).data?.data?.draftQuoteId,
            hasDraftQuoteId: !!(response as any).data?.draftQuoteId,
            responseKeys: (response as any).data ? Object.keys((response as any).data) : [],
            dataKeys: (response as any).data?.data ? Object.keys((response as any).data.data) : []
          });
          throw new Error('ID du brouillon non retourné par l\'API');
        }
      }

      // Les options sont maintenant incluses dans les appels PUT ci-dessus
      // Pas besoin de les sauvegarder séparément

      console.log('🎉 [SAVE] === SAUVEGARDE TERMINÉE AVEC SUCCÈS ===');
      console.log('🆔 [SAVE] DraftId final:', savedDraftId);
      return savedDraftId;
    } catch (error) {
      console.error('💥 [SAVE] === ERREUR LORS DE LA SAUVEGARDE ===');
      console.error('❌ [SAVE] Erreur lors de la sauvegarde avec options:', error);
      throw error;
    } finally {
      setIsSaving(false);
      console.log('🏁 [SAVE] === FIN DE LA SAUVEGARDE ===');
    }
  };

  return {
    saveDraft,
    saveDraftWithOptions,
    isSaving: isSaving || createDraftMutation.isPending || updateDraftMutation.isPending,
    lastSaved,
    error: createDraftMutation.error || updateDraftMutation.error,
    isError: createDraftMutation.isError || updateDraftMutation.isError
  };
};
