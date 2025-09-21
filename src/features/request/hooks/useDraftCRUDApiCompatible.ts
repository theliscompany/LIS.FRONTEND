/**
 * Hook CRUD pour DraftQuote avec compatibilité API complète
 * Utilise le nouveau mapper pour assurer la compatibilité avec l'API @tanstack/api/draft-quotes
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  postApiDraftQuotes, 
  putApiDraftQuotesById, 
  getApiDraftQuotesById, 
  deleteApiDraftQuotesById,
  getApiDraftQuotes 
} from '@features/offer/api/sdk.gen';
import { DraftQuoteApiMapper, DraftQuoteApiUtils } from '../services/DraftQuoteApiMapper';
import { DraftQuote } from '../types/DraftQuote';
import type { 
  CreateDraftQuoteRequest,
  UpdateDraftQuoteRequest,
  DraftQuoteResponse 
} from '@features/offer/api/types.gen';

/**
 * Hook principal pour les opérations CRUD sur les DraftQuotes
 * Compatible avec l'API @tanstack/api/draft-quotes
 */
export const useDraftCRUDApiCompatible = () => {
  const queryClient = useQueryClient();

  // === MUTATIONS ===

  /**
   * Création d'un nouveau DraftQuote
   */
  const createDraftMutation = useMutation({
    mutationFn: async (draftQuote: DraftQuote) => {
      console.log('🆕 [API_COMPATIBLE] Création DraftQuote:', draftQuote);
      
      // Validation
      const errors = DraftQuoteApiUtils.validateForApi(draftQuote);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }

      // Transformation vers le format API
      const createRequest = DraftQuoteApiMapper.toCreateRequest(draftQuote);
      console.log('🔄 [API_COMPATIBLE] Payload API:', createRequest);

      // Appel API
      const response = await postApiDraftQuotes({ body: createRequest });
      
      if (!response.data?.data) {
        throw new Error('Failed to create draft quote');
      }

      return response.data.data;
    },
    onSuccess: (data) => {
      console.log('✅ [API_COMPATIBLE] DraftQuote créé:', data);
      queryClient.invalidateQueries({ queryKey: ['draftQuotes'] });
    },
    onError: (error) => {
      console.error('❌ [API_COMPATIBLE] Erreur création:', error);
    },
  });

  /**
   * Mise à jour d'un DraftQuote existant
   */
  const updateDraftMutation = useMutation({
    mutationFn: async ({ draftId, draftQuote }: { draftId: string; draftQuote: DraftQuote }) => {
      console.log('🔄 [API_COMPATIBLE] Mise à jour DraftQuote:', { draftId, draftQuote });
      
      // Validation
      const errors = DraftQuoteApiUtils.validateForApi(draftQuote);
      if (errors.length > 0) {
        console.warn('⚠️ [API_COMPATIBLE] Validation warnings:', errors);
      }

      // Transformation vers le format API
      const updateRequest = DraftQuoteApiMapper.toUpdateRequest(draftQuote);
      console.log('🔄 [API_COMPATIBLE] Payload API:', updateRequest);

      // Appel API
      const response = await putApiDraftQuotesById({ 
        path: { id: draftId },
        body: updateRequest 
      });
      
      if (!response.data?.data) {
        throw new Error('Failed to update draft quote');
      }

      return response.data.data;
    },
    onSuccess: (data) => {
      console.log('✅ [API_COMPATIBLE] DraftQuote mis à jour:', data);
      queryClient.invalidateQueries({ queryKey: ['draftQuotes'] });
      queryClient.invalidateQueries({ queryKey: ['draftQuote', data.draftQuoteId] });
    },
    onError: (error) => {
      console.error('❌ [API_COMPATIBLE] Erreur mise à jour:', error);
    },
  });

  /**
   * Suppression d'un DraftQuote
   */
  const deleteDraftMutation = useMutation({
    mutationFn: async (draftId: string) => {
      console.log('🗑️ [API_COMPATIBLE] Suppression DraftQuote:', draftId);
      
      const response = await deleteApiDraftQuotesById({ path: { id: draftId } });
      return response.data;
    },
    onSuccess: () => {
      console.log('✅ [API_COMPATIBLE] DraftQuote supprimé');
      queryClient.invalidateQueries({ queryKey: ['draftQuotes'] });
    },
    onError: (error) => {
      console.error('❌ [API_COMPATIBLE] Erreur suppression:', error);
    },
  });

  // === QUERIES ===

  /**
   * Récupération d'un DraftQuote par ID
   */
  const useDraft = (draftId: string | null) => {
    return useQuery({
      queryKey: ['draftQuote', draftId],
      queryFn: async () => {
        if (!draftId) return null;
        
        console.log('📥 [API_COMPATIBLE] Récupération DraftQuote:', draftId);
        
        const response = await getApiDraftQuotesById({ path: { id: draftId } });
        
        if (!response.data?.data) {
          throw new Error('Draft quote not found');
        }

        // Transformation de la réponse API vers DraftQuote frontend
        const draftQuote = DraftQuoteApiMapper.fromApiResponse(response.data.data);
        console.log('✅ [API_COMPATIBLE] DraftQuote récupéré:', draftQuote);
        
        return draftQuote;
      },
      enabled: !!draftId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  /**
   * Récupération de la liste des DraftQuotes
   */
  const useDrafts = (filters?: {
    customerName?: string;
    page?: number;
    pageSize?: number;
    status?: string;
  }) => {
    return useQuery({
      queryKey: ['draftQuotes', filters],
      queryFn: async () => {
        console.log('📥 [API_COMPATIBLE] Récupération liste DraftQuotes:', filters);
        
        const response = await getApiDraftQuotes({
          query: {
            customerName: filters?.customerName,
            page: filters?.page,
            pageSize: filters?.pageSize,
            status: filters?.status,
          }
        });
        
        if (!response.data?.data) {
          return [];
        }

        // Transformation de chaque DraftQuote
        const draftQuotes = response.data.data.map(apiDraft => 
          DraftQuoteApiMapper.fromApiResponse(apiDraft)
        );
        
        console.log('✅ [API_COMPATIBLE] Liste DraftQuotes récupérée:', draftQuotes.length);
        
        return draftQuotes;
      },
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  // === FONCTIONS UTILITAIRES ===

  /**
   * Crée un DraftQuote minimal compatible avec l'API
   */
  const createMinimalDraftQuote = (requestQuoteId: string, emailUser: string): DraftQuote => {
    return DraftQuoteApiUtils.createMinimalApiCompatible(requestQuoteId, emailUser);
  };

  /**
   * Vérifie la compatibilité API d'un DraftQuote
   */
  const isApiCompatible = (draftQuote: DraftQuote): boolean => {
    return DraftQuoteApiUtils.isApiCompatible(draftQuote);
  };

  /**
   * Valide un DraftQuote pour l'API
   */
  const validateForApi = (draftQuote: DraftQuote): string[] => {
    return DraftQuoteApiUtils.validateForApi(draftQuote);
  };

  return {
    // Mutations
    createDraft: createDraftMutation.mutateAsync,
    updateDraft: updateDraftMutation.mutateAsync,
    deleteDraft: deleteDraftMutation.mutateAsync,
    
    // États des mutations
    isCreating: createDraftMutation.isPending,
    isUpdating: updateDraftMutation.isPending,
    isDeleting: deleteDraftMutation.isPending,
    
    // Erreurs des mutations
    createError: createDraftMutation.error,
    updateError: updateDraftMutation.error,
    deleteError: deleteDraftMutation.error,
    
    // Queries
    useDraft,
    useDrafts,
    
    // Utilitaires
    createMinimalDraftQuote,
    isApiCompatible,
    validateForApi,
  };
};

/**
 * Hook simplifié pour la récupération d'un DraftQuote
 */
export const useDraftApiCompatible = (draftId: string | null) => {
  const { useDraft } = useDraftCRUDApiCompatible();
  return useDraft(draftId);
};

/**
 * Hook simplifié pour la liste des DraftQuotes
 */
export const useDraftsApiCompatible = (filters?: {
  customerName?: string;
  page?: number;
  pageSize?: number;
  status?: string;
}) => {
  const { useDrafts } = useDraftCRUDApiCompatible();
  return useDrafts(filters);
};

/**
 * Fonctions de transformation compatibles API
 */
export const DraftQuoteTransformers = {
  /**
   * Transforme DraftQuote vers CreateDraftQuoteRequest
   */
  toCreateRequest: (draftQuote: DraftQuote): CreateDraftQuoteRequest => {
    return DraftQuoteApiMapper.toCreateRequest(draftQuote);
  },

  /**
   * Transforme DraftQuote vers UpdateDraftQuoteRequest
   */
  toUpdateRequest: (draftQuote: DraftQuote): UpdateDraftQuoteRequest => {
    return DraftQuoteApiMapper.toUpdateRequest(draftQuote);
  },

  /**
   * Transforme DraftQuoteResponse vers DraftQuote
   */
  fromApiResponse: (apiResponse: DraftQuoteResponse): DraftQuote => {
    return DraftQuoteApiMapper.fromApiResponse(apiResponse);
  },
};
