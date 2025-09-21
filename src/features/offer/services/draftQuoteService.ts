import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  postApiDraftQuotesMutation,
  getApiDraftQuotesOptions,
  getApiDraftQuotesByIdOptions,
  putApiDraftQuotesByIdMutation,
  deleteApiDraftQuotesByIdMutation,
  postApiDraftQuotesByIdOptionsMutation,
  deleteApiDraftQuotesByIdOptionsByOptionIdMutation,
  postApiDraftQuotesByIdFinalizeMutation,
} from '../api/@tanstack/react-query.gen';
import type {
  CreateDraftQuoteRequest,
  UpdateDraftQuoteRequest,
  DraftQuoteResponse,
  DraftQuoteOption,
  AddDraftQuoteOptionRequest,
} from '../api/types.gen';
import type { DraftQuote, DraftQuoteStatus } from '../types/DraftQuote';

// Clés de requête
export const DRAFT_QUOTES_KEYS = {
  all: ['draftQuotes'] as const,
  lists: () => [...DRAFT_QUOTES_KEYS.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...DRAFT_QUOTES_KEYS.lists(), { filters }] as const,
  details: () => [...DRAFT_QUOTES_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...DRAFT_QUOTES_KEYS.details(), id] as const,
} as const;

// Hook pour créer un brouillon de devis
export const useCreateDraftQuote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: postApiDraftQuotesMutation().mutationFn,
    onSuccess: () => {
      // Invalider la liste des brouillons
      queryClient.invalidateQueries({ queryKey: DRAFT_QUOTES_KEYS.lists() });
    },
  });
};

// Hook pour récupérer la liste des brouillons de devis
export const useDraftQuotes = (params?: {
  page?: number;
  pageSize?: number;
  status?: DraftQuoteStatus;
  customerName?: string;
}) => {
  return useQuery({
    ...getApiDraftQuotesOptions({
      query: {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
        status: params?.status,
        customerName: params?.customerName,
      },
    }),
    queryKey: DRAFT_QUOTES_KEYS.list(params || {}),
  });
};

// Hook pour récupérer un brouillon de devis par ID
export const useDraftQuote = (id: string) => {
  return useQuery({
    ...getApiDraftQuotesByIdOptions({
      path: { id },
    }),
    queryKey: DRAFT_QUOTES_KEYS.detail(id),
    enabled: !!id,
  });
};

// Hook pour mettre à jour un brouillon de devis
export const useUpdateDraftQuote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: putApiDraftQuotesByIdMutation().mutationFn,
    onSuccess: (data, variables) => {
      // Invalider la liste et le détail
      queryClient.invalidateQueries({ queryKey: DRAFT_QUOTES_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: DRAFT_QUOTES_KEYS.detail(variables.path.id) });
    },
  });
};

// Hook pour supprimer un brouillon de devis
export const useDeleteDraftQuote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteApiDraftQuotesByIdMutation().mutationFn,
    onSuccess: () => {
      // Invalider la liste
      queryClient.invalidateQueries({ queryKey: DRAFT_QUOTES_KEYS.lists() });
    },
  });
};

// Hook pour ajouter une option à un brouillon
export const useAddDraftQuoteOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: postApiDraftQuotesByIdOptionsMutation().mutationFn,
    onSuccess: (data, variables) => {
      // Invalider le détail du brouillon
      queryClient.invalidateQueries({ queryKey: DRAFT_QUOTES_KEYS.detail(variables.path.id) });
    },
  });
};

// Hook pour supprimer une option d'un brouillon
export const useDeleteDraftQuoteOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteApiDraftQuotesByIdOptionsByOptionIdMutation().mutationFn,
    onSuccess: (data, variables) => {
      // Invalider le détail du brouillon
      queryClient.invalidateQueries({ queryKey: DRAFT_QUOTES_KEYS.detail(variables.path.id) });
    },
  });
};

// Hook pour finaliser un brouillon (créer un devis)
export const useFinalizeDraftQuote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: postApiDraftQuotesByIdFinalizeMutation().mutationFn,
    onSuccess: (data, variables) => {
      // Invalider la liste des brouillons et des devis
      queryClient.invalidateQueries({ queryKey: DRAFT_QUOTES_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
};

// Utilitaires pour la conversion des données
export const mapDraftQuoteFromApi = (apiDraftQuote: DraftQuoteResponse): DraftQuote => {
  return {
    draftQuoteId: apiDraftQuote.draftQuoteId,
    requestQuoteId: apiDraftQuote.requestQuoteId,
    resumeToken: apiDraftQuote.resumeToken,
    createdAt: apiDraftQuote.createdAt,
    updatedAt: apiDraftQuote.updatedAt,
    status: apiDraftQuote.status as DraftQuoteStatus,
    currency: apiDraftQuote.currency,
    incoterm: apiDraftQuote.incoterm,
    customer: apiDraftQuote.customer,
    shipment: apiDraftQuote.shipment,
    attachments: apiDraftQuote.attachments,
    commercialTerms: apiDraftQuote.commercialTerms,
    wizard: apiDraftQuote.wizard,
    options: apiDraftQuote.options,
  };
};

export const mapDraftQuoteToApi = (draftQuote: Partial<DraftQuote>): CreateDraftQuoteRequest => {
  return {
    requestQuoteId: draftQuote.requestQuoteId || '',
    customer: draftQuote.customer,
    shipment: draftQuote.shipment,
    wizard: draftQuote.wizard,
  };
};

// ✅ NOUVEAU : Mapping spécifique pour la mise à jour
export const mapDraftQuoteToUpdateApi = (draftQuote: Partial<DraftQuote>, savedOptions?: DraftQuoteOption[]): UpdateDraftQuoteRequest => {
  return {
    customer: draftQuote.customer,
    shipment: draftQuote.shipment,
    wizard: draftQuote.wizard,
    options: savedOptions && savedOptions.length > 0 ? savedOptions : (draftQuote.options || null),
    notes: draftQuote.wizard?.notes || null,
  };
};

export const mapOptionToApi = (option: DraftQuoteOption): AddDraftQuoteOptionRequest => {
  return {
    option,
  };
};

// Utilitaires pour la validation
export const validateDraftQuote = (draftQuote: Partial<DraftQuote>): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!draftQuote.requestQuoteId) {
    errors.push('Request Quote ID is required');
  }

  if (!draftQuote.customer?.name) {
    errors.push('Customer name is required');
  }

  if (!draftQuote.shipment?.origin?.location) {
    errors.push('Origin location is required');
  }

  if (!draftQuote.shipment?.destination?.location) {
    errors.push('Destination location is required');
  }

  if (!draftQuote.shipment?.containerTypes?.length) {
    errors.push('At least one container type is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Utilitaires pour la gestion des options
export const createEmptyOption = (): DraftQuoteOption => ({
  optionId: `option_${Date.now()}`,
  label: 'New Option',
  validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 jours
  currency: 'EUR',
  containers: [],
  haulages: [],
  services: [],
  totals: {
    perContainer: {},
    byContainerType: {},
    seafreightBaseTotal: 0,
    haulageTotal: 0,
    servicesTotal: 0,
    surchargesTotal: 0,
    grandTotal: 0,
  },
});

export const calculateOptionTotals = (option: DraftQuoteOption): DraftQuoteOption => {
  const totals = {
    perContainer: {} as { [key: string]: number },
    byContainerType: {} as { [key: string]: any },
    seafreightBaseTotal: 0,
    haulageTotal: 0,
    servicesTotal: 0,
    surchargesTotal: 0,
    grandTotal: 0,
  };

  // Calculer les totaux des conteneurs
  option.containers?.forEach(container => {
    if (container.containerType && container.quantity) {
      const key = container.containerType;
      totals.perContainer[key] = (totals.perContainer[key] || 0) + container.quantity;
      
      if (!totals.byContainerType[key]) {
        totals.byContainerType[key] = {
          qty: 0,
          unitPrice: 0,
          subtotal: 0,
        };
      }
      totals.byContainerType[key].qty += container.quantity;
    }
  });

  // Calculer les totaux du transport maritime
  if (option.seafreight?.rate) {
    option.seafreight.rate.forEach(rate => {
      if (rate.containerType && rate.basePrice) {
        const containerCount = totals.perContainer[rate.containerType] || 0;
        totals.seafreightBaseTotal += rate.basePrice * containerCount;
      }
    });
  }

  // Calculer les totaux du transport routier
  option.haulages?.forEach(haulage => {
    if (haulage.basePrice) {
      totals.haulageTotal += haulage.basePrice;
    }
    haulage.surcharges?.forEach(surcharge => {
      if (surcharge.value) {
        totals.surchargesTotal += surcharge.value;
      }
    });
  });

  // Calculer les totaux des services
  option.services?.forEach(service => {
    if (service.value) {
      totals.servicesTotal += service.value;
    }
  });

  // Calculer le total général
  totals.grandTotal = 
    totals.seafreightBaseTotal + 
    totals.haulageTotal + 
    totals.servicesTotal + 
    totals.surchargesTotal;

  return {
    ...option,
    totals,
  };
};
