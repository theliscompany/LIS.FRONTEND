import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  // ✅ SDK QUOTE OFFER API (pour les brouillons)
  postApiQuoteOfferDraft, 
  putApiQuoteOfferDraftById, 
  getDraft, 
  deleteApiQuoteOfferDraftById, 
  getApiQuoteOfferDrafts 
} from '@features/offer/api/sdk.gen';
import { 
  // ✅ TYPES QUOTE OFFER API
  OptimizedCreateWizardDraftRequest,
  OptimizedUpdateWizardDraftRequest
} from '@features/offer/api/types.gen';
import { DraftQuote, buildSDKPayload } from '../types/DraftQuote';
import { useSnackbar } from 'notistack';

// === HOOK REACT QUERY POUR CRUD DES BROUILLONS VIA SDK QUOTE OFFER ===

export const useDraftCRUD = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  // === CRÉATION D'UN NOUVEAU BROUILLON ===
  const createDraftMutation = useMutation({
    mutationFn: async (draftData: OptimizedCreateWizardDraftRequest) => {
      const response = await postApiQuoteOfferDraft({
        body: draftData
      });
      return response.data;
    },
    onSuccess: () => {
      enqueueSnackbar('Brouillon créé avec succès', { variant: 'success' });
      // Invalider le cache des brouillons
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
    },
    onError: (error: any) => {
      console.error('❌ Erreur création brouillon:', error);
      enqueueSnackbar('Erreur lors de la création du brouillon', { variant: 'error' });
    }
  });

  // === MISE À JOUR D'UN BROUILLON EXISTANT ===
  const updateDraftMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: OptimizedUpdateWizardDraftRequest }) => {
      const response = await putApiQuoteOfferDraftById({
        path: { id },
        body: data
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      enqueueSnackbar('Brouillon mis à jour avec succès', { variant: 'success' });
      // Invalider le cache du brouillon spécifique et de la liste
      queryClient.invalidateQueries({ queryKey: ['draft', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
    },
    onError: (error: any) => {
      console.error('❌ Erreur mise à jour brouillon:', error);
      enqueueSnackbar('Erreur lors de la mise à jour du brouillon', { variant: 'error' });
    }
  });

  // === SUPPRESSION D'UN BROUILLON ===
  const deleteDraftMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteApiQuoteOfferDraftById({
        path: { id }
      });
      return response.data;
    },
    onSuccess: (_, id) => {
      enqueueSnackbar('Brouillon supprimé avec succès', { variant: 'success' });
      // Invalider le cache du brouillon et de la liste
      queryClient.invalidateQueries({ queryKey: ['draft', id] });
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
    },
    onError: (error: any) => {
      console.error('❌ Erreur suppression brouillon:', error);
      enqueueSnackbar('Erreur lors de la suppression du brouillon', { variant: 'error' });
    }
  });

  return {
    // Mutations
    createDraft: createDraftMutation.mutateAsync,
    updateDraft: updateDraftMutation.mutateAsync,
    deleteDraft: deleteDraftMutation.mutateAsync,
    
    // États des mutations
    isCreating: createDraftMutation.isPending,
    isUpdating: updateDraftMutation.isPending,
    isDeleting: deleteDraftMutation.isPending,
    
    // Erreurs
    createError: createDraftMutation.error,
    updateError: updateDraftMutation.error,
    deleteError: deleteDraftMutation.error
  };
};

// === HOOK POUR RÉCUPÉRER UN BROUILLON SPÉCIFIQUE ===
export const useDraft = (draftId: string | null) => {
  return useQuery({
    queryKey: ['draft', draftId],
    queryFn: async () => {
      if (!draftId) return null;
      
      const response = await getDraft({
        path: { id: draftId }
      });
      return response.data;
    },
    enabled: !!draftId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
};

// === HOOK POUR RÉCUPÉRER LA LISTE DES BROUILLONS ===
export const useDrafts = (filters?: {
  clientNumber?: string;
  emailUser?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) => {
  return useQuery({
    queryKey: ['drafts', filters],
    queryFn: async () => {
      const response = await getApiQuoteOfferDrafts({
        query: {
          ...filters,
          page: filters?.page || 1,
          pageSize: filters?.pageSize || 50
        }
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,    // 5 minutes
  });
};

// === UTILITAIRES DE TRANSFORMATION ===

/**
 * Transforme un DraftQuote en OptimizedCreateWizardDraftRequest pour l'API QuoteOffer
 * Utilise la fonction buildSDKPayload centralisée
 */
export const transformDraftQuoteToCreateRequest = (
  draftQuote: DraftQuote, 
  currentUserEmail: string, 
  _clientNumber: string
): OptimizedCreateWizardDraftRequest => {
  return buildSDKPayload(draftQuote, currentUserEmail);
};

/**
 * Transforme un DraftQuote en OptimizedUpdateWizardDraftRequest pour la mise à jour
 * Utilise la fonction buildSDKPayload centralisée
 */
export const transformDraftQuoteToUpdateRequest = (
  draftQuote: DraftQuote, 
  currentUserEmail: string, 
  _clientNumber: string
): OptimizedUpdateWizardDraftRequest => {
  return buildSDKPayload(draftQuote, currentUserEmail);
};

/**
 * Transforme une réponse API en DraftQuote
 * Note: Cette fonction est simplifiée car la structure de réponse de l'API QuoteOffer
 * est différente de l'ancienne API Request. Dans la plupart des cas, on récupère
 * directement le DraftQuote depuis le localStorage ou on utilise les données existantes.
 */
export const transformApiResponseToDraftQuote = (apiResponse: any): DraftQuote => {
  // Pour l'API QuoteOffer, la réponse contient généralement les données dans une structure différente
  // On retourne un DraftQuote vide par défaut et on laisse les autres composants gérer la logique
  const emptyDraftQuote: DraftQuote = {
    id: apiResponse?.id || undefined,
    requestQuoteId: apiResponse?.requestQuoteId || undefined,
    clientNumber: apiResponse?.clientNumber || '',
    emailUser: apiResponse?.emailUser || '',
    
    // Étapes vides par défaut
    step1: {
      customer: { contactId: 0, contactName: '', companyName: '', email: '' },
      cityFrom: { name: '', country: '' },
      cityTo: { name: '', country: '' },
      status: 'NEW',
      assignee: '',
      comment: '',
      productName: { productId: 0, productName: '' },
      incotermName: '',
      route: {
        origin: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } },
        destination: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } }
      },
      cargo: { product: { productId: 0, productName: '' }, incoterm: '' },
      metadata: { comment: '' },
      portFrom: { portId: 0, portName: '', country: '' },
      portTo: { portId: 0, portName: '', country: '' }
    },
    
    step2: { selected: [], selectedServices: [] },
    
    step3: {
      containers: [],
      summary: { totalContainers: 0, totalTEU: 0, containerTypes: [] },
      route: { origin: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } }, destination: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } } },
      selectedContainers: { list: [] }
    },
    
    step4: {
      selection: {
        offerId: '', haulierId: 0, haulierName: '',
        tariff: { unitPrice: 0, currency: 'EUR', freeTime: 0 },
        route: { pickup: { company: '', city: '', country: '' }, delivery: { portId: 0, portName: '', country: '' } },
        validity: { validUntil: '' }, overtimeQuantity: 0, overtimePrice: 0
      },
      calculation: { quantity: 0, unitPrice: 0, subtotal: 0, currency: 'EUR' }
    },
    
    step5: {
      selections: [],
      summary: { totalSelections: 0, totalContainers: 0, totalAmount: 0, currency: 'EUR', selectedCarriers: [], containerTypes: [], preferredSelectionId: '' }
    },
    
    step6: {
      selections: [],
      summary: { totalSelections: 0, totalAmount: 0, currency: 'EUR', categories: [] }
    },
    
    step7: {
      finalization: { optionName: '', optionDescription: '', marginPercentage: 0, marginAmount: 0, marginType: '', isReadyToGenerate: false, generatedAt: '' },
      validation: { allStepsValid: false, errors: [], warnings: [] },
      pricingSummary: {
        baseTotal: 0, marginAmount: 0, finalTotal: 0, currency: 'EUR',
        breakdown: { haulageAmount: 0, seafreightAmount: 0, miscellaneousAmount: 0, totalBeforeMargin: 0, components: [] }
      }
    },
    
    totals: { haulage: 0, seafreight: 0, miscellaneous: 0, subtotal: 0, grandTotal: 0, currency: 'EUR', totalTEU: 0 },
    
    // Autres propriétés
    savedOptions: [], selectedHaulage: undefined, selectedSeafreights: [], selectedMiscellaneous: [], selectedContainers: {},
    marginType: 'percent', marginValue: 0, totalPrice: 0, seafreightTotal: 0, haulageTotal: 0, miscTotal: 0, totalTEU: 0,
    seafreightQuantities: {}, miscQuantities: {}, surchargeQuantities: {}
  };
  
  return emptyDraftQuote;
};
