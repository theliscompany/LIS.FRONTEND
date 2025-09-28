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
  postApiQuotesMutation,
  getApiQuotesOptions,
  getApiQuotesByIdOptions,
  postApiQuotesByIdSelectOptionMutation,
} from '../api/@tanstack/react-query.gen';
import type {
  CreateDraftQuoteRequest,
  UpdateDraftQuoteRequest,
  DraftQuoteResponse,
  DraftQuoteOption,
  AddDraftQuoteOptionRequest,
  CreateQuoteRequest,
  QuoteResponse,
  SelectOptionRequest,
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

export const QUOTES_KEYS = {
  all: ['quotes'] as const,
  lists: () => [...QUOTES_KEYS.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...QUOTES_KEYS.lists(), { filters }] as const,
  details: () => [...QUOTES_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...QUOTES_KEYS.details(), id] as const,
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
      queryClient.invalidateQueries({ queryKey: QUOTES_KEYS.lists() });
    },
  });
};

// Hook pour créer un devis à partir d'un brouillon
export const useCreateQuoteFromDraft = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: postApiQuotesMutation().mutationFn,
    onSuccess: (data, variables) => {
      // Invalider la liste des brouillons et des devis
      queryClient.invalidateQueries({ queryKey: DRAFT_QUOTES_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUOTES_KEYS.lists() });
      
      // Invalider le brouillon spécifique s'il est fourni
      if (variables.body?.draftQuoteId) {
        queryClient.invalidateQueries({ 
          queryKey: DRAFT_QUOTES_KEYS.detail(variables.body.draftQuoteId) 
        });
      }
    },
  });
};

// Hook pour récupérer la liste des devis finaux
export const useQuotes = (params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  customerName?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    ...getApiQuotesOptions({
      query: {
        pageNumber: params?.page || 1,
        pageSize: params?.pageSize || 10,
        status: params?.status,
        customerName: params?.customerName,
        dateFrom: params?.dateFrom,
        dateTo: params?.dateTo,
      },
    }),
    queryKey: QUOTES_KEYS.list(params || {}),
  });
};

// Hook pour récupérer un devis final par ID
export const useQuote = (id: string) => {
  return useQuery({
    ...getApiQuotesByIdOptions({
      path: { id },
    }),
    queryKey: QUOTES_KEYS.detail(id),
    enabled: !!id,
  });
};

// Hook pour sélectionner une option dans un devis
export const useSelectQuoteOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: postApiQuotesByIdSelectOptionMutation().mutationFn,
    onSuccess: (data, variables) => {
      // Invalider le devis spécifique pour le recharger avec l'option sélectionnée
      if (variables.path?.id) {
        queryClient.invalidateQueries({ 
          queryKey: QUOTES_KEYS.detail(variables.path.id) 
        });
      }
      
      // Invalider la liste des devis pour mettre à jour les statistiques
      queryClient.invalidateQueries({ 
        queryKey: QUOTES_KEYS.lists() 
      });
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

// Utilitaire pour créer une requête de devis à partir d'un brouillon
export const createQuoteRequestFromDraft = (
  draftQuoteId: string, 
  options?: {
    validityDays?: number;
    paymentTerms?: string;
    notes?: string;
  }
): CreateQuoteRequest => {
  return {
    draftQuoteId,
    validityDays: options?.validityDays || 30, // 30 jours par défaut
    paymentTerms: options?.paymentTerms || null,
    notes: options?.notes || null,
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

// Validation spécifique pour la création de devis à partir d'un brouillon
export const validateDraftQuoteForQuoteCreation = (draftQuote: Partial<DraftQuote>): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Vérifier que le brouillon n'a pas déjà été utilisé
  if (draftQuote.status === 'used') {
    errors.push('Ce brouillon a déjà été utilisé pour créer un devis et ne peut pas être réutilisé');
  }

  // Vérifier que le brouillon est dans un état valide pour la création de devis
  if (draftQuote.status && !['in_progress', 'finalized'].includes(draftQuote.status)) {
    errors.push('Seuls les brouillons en cours ou finalisés peuvent être utilisés pour créer un devis');
  }

  // Vérifier qu'il y a au moins une option
  if (!draftQuote.options || draftQuote.options.length === 0) {
    errors.push('Le brouillon doit contenir au moins une option pour créer un devis');
  }

  // Validation de base
  const baseValidation = validateDraftQuote(draftQuote);
  if (!baseValidation.isValid) {
    errors.push(...baseValidation.errors);
  }

  // Avertissements
  if (draftQuote.status === 'finalized') {
    warnings.push('Ce brouillon est déjà finalisé');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Utilitaires pour la gestion des options
export const createEmptyOption = (optionType?: string): DraftQuoteOption => ({
  optionId: `option_${Date.now()}`,
  label: 'New Option',
  validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 jours
  currency: 'EUR',
  optionType: optionType || null,
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

// Fonction utilitaire pour créer une requête de sélection d'option
export const createSelectOptionRequest = (
  quoteId: string,
  optionId: string
): { path: { id: string }; body: SelectOptionRequest } => {
  return {
    path: { id: quoteId },
    body: { optionId },
  };
};
