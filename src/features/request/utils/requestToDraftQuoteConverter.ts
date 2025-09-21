import type { RequestQuoteListViewModel, RequestQuoteResponseViewModel } from '../api/types.gen';
import type { DraftQuote, DraftQuoteCustomer, DraftQuoteShipment, DraftQuoteWizard } from '../../offer/types/DraftQuote';

/**
 * Convertit une demande (Request) en brouillon de devis (DraftQuote)
 */
export const convertRequestToDraftQuote = (
  request: RequestQuoteListViewModel | RequestQuoteResponseViewModel,
  currentUserEmail: string
): Partial<DraftQuote> => {
  console.log('🔄 [CONVERTER] Conversion Request -> DraftQuote:', request);

  const draftQuote: Partial<DraftQuote> = {
    requestQuoteId: request.requestQuoteId || '',
    resumeToken: generateResumeToken(),
    status: 'draft',
    currency: 'EUR',
    incoterm: getIncoterm(request) || 'FOB',
    createdAt: new Date(),
    updatedAt: new Date(),
    
    // Informations client
    customer: convertToDraftQuoteCustomer(request),
    
    // Informations d'expédition
    shipment: convertToDraftQuoteShipment(request),
    
    // Données du wizard (vide au début)
    wizard: createEmptyWizard(),
    
    // Pas d'options au début
    options: [],
    
    // Pièces jointes (vide au début)
    attachments: [],
    
    // Conditions commerciales par défaut
    commercialTerms: {
      depositPolicy: {
        type: 'fixed',
        value: 0,
      },
      generalConditionsId: '',
    },
  };

  console.log('✅ [CONVERTER] DraftQuote créé:', draftQuote);
  return draftQuote;
};

/**
 * Fonctions helper pour extraire les données selon le type
 */
const getIncoterm = (request: RequestQuoteListViewModel | RequestQuoteResponseViewModel): string | null => {
  if ('incoterm' in request) {
    return request.incoterm;
  }
  return null;
};

const getCompanyName = (request: RequestQuoteListViewModel | RequestQuoteResponseViewModel): string => {
  return request.companyName || 'N/A';
};

const getCustomerId = (request: RequestQuoteListViewModel | RequestQuoteResponseViewModel): string => {
  if ('customerId' in request) {
    return request.customerId?.toString() || '';
  }
  return '';
};

const getAssigneeDisplayName = (request: RequestQuoteListViewModel | RequestQuoteResponseViewModel): string => {
  return request.assigneeDisplayName || '';
};

const getPickupCity = (request: RequestQuoteListViewModel | RequestQuoteResponseViewModel): string => {
  if ('pickupCity' in request) {
    return request.pickupCity || '';
  } else if ('pickupLocation' in request && request.pickupLocation) {
    return request.pickupLocation.city || '';
  }
  return '';
};

const getPickupCountry = (request: RequestQuoteListViewModel | RequestQuoteResponseViewModel): string => {
  if ('pickupCountry' in request) {
    return request.pickupCountry || '';
  } else if ('pickupLocation' in request && request.pickupLocation) {
    return request.pickupLocation.country || '';
  }
  return '';
};

const getDeliveryCity = (request: RequestQuoteListViewModel | RequestQuoteResponseViewModel): string => {
  if ('deliveryCity' in request) {
    return request.deliveryCity || '';
  } else if ('deliveryLocation' in request && request.deliveryLocation) {
    return request.deliveryLocation.city || '';
  }
  return '';
};

const getDeliveryCountry = (request: RequestQuoteListViewModel | RequestQuoteResponseViewModel): string => {
  if ('deliveryCountry' in request) {
    return request.deliveryCountry || '';
  } else if ('deliveryLocation' in request && request.deliveryLocation) {
    return request.deliveryLocation.country || '';
  }
  return '';
};

const getProductName = (request: RequestQuoteListViewModel | RequestQuoteResponseViewModel): string => {
  if ('productName' in request) {
    return request.productName || '';
  } else if ('goodsDescription' in request) {
    return request.goodsDescription || '';
  }
  return '';
};

/**
 * Convertit les informations client de la demande
 */
const convertToDraftQuoteCustomer = (request: RequestQuoteListViewModel | RequestQuoteResponseViewModel): DraftQuoteCustomer => {
  return {
    type: 'company',
    name: getCompanyName(request),
    vat: getCustomerId(request),
    emails: [],
    phones: [],
    address: {
      city: getPickupCity(request),
      country: getPickupCountry(request),
    },
    contactPerson: {
      fullName: getAssigneeDisplayName(request),
      phone: '',
      email: '',
    },
  };
};

/**
 * Convertit les informations d'expédition de la demande
 */
const convertToDraftQuoteShipment = (request: RequestQuoteListViewModel | RequestQuoteResponseViewModel): DraftQuoteShipment => {
  return {
    mode: 'sea',
    containerCount: 1,
    containerTypes: ['20GP'], // Par défaut
    commodity: getProductName(request),
    hsCodes: [],
    origin: {
      location: getPickupCity(request),
      country: getPickupCountry(request),
    },
    destination: {
      location: getDeliveryCity(request),
      country: getDeliveryCountry(request),
    },
    requestedDeparture: request.createdAt ? new Date(request.createdAt) : new Date(),
    docs: {
      requiresVGM: false,
      requiresBLDraftApproval: false,
    },
    constraints: {
      minTruckLeadDays: 6,
      terminalCutoffDays: 11,
      customsDeadlineHours: 48,
    },
  };
};

/**
 * Crée un wizard vide
 */
const createEmptyWizard = (): DraftQuoteWizard => {
  return {
    notes: '',
    selectedServiceLevel: 'standard',
    seafreights: [],
    haulages: [],
    services: [],
  };
};

/**
 * Génère un token de reprise unique
 */
const generateResumeToken = (): string => {
  return `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Valide les données de navigation pour la conversion
 */
export const validateRequestData = (requestData: any): {
  isValid: boolean;
  requestData?: RequestQuoteListViewModel | RequestQuoteResponseViewModel;
  requestQuoteId?: string;
  errors: string[];
} => {
  const errors: string[] = [];

  console.log('🔍 [VALIDATOR] Validation des données:', requestData);

  if (!requestData) {
    errors.push('Aucune donnée de demande fournie');
    return { isValid: false, errors };
  }

  if (!requestData.requestQuoteId) {
    errors.push('ID de demande manquant');
  }

  if (!requestData.companyName) {
    errors.push('Nom de l\'entreprise manquant');
  }

  // Vérifier la ville de collecte selon le type de données
  const pickupCity = getPickupCity(requestData);
  const pickupCountry = getPickupCountry(requestData);
  console.log('🔍 [VALIDATOR] Ville de collecte extraite:', pickupCity, 'Pays:', pickupCountry);
  if (!pickupCity) {
    errors.push('Ville de collecte manquante');
  }

  // Vérifier la ville de livraison selon le type de données
  const deliveryCity = getDeliveryCity(requestData);
  const deliveryCountry = getDeliveryCountry(requestData);
  console.log('🔍 [VALIDATOR] Ville de livraison extraite:', deliveryCity, 'Pays:', deliveryCountry);
  if (!deliveryCity) {
    errors.push('Ville de livraison manquante');
  }

  console.log('🔍 [VALIDATOR] Erreurs de validation:', errors);

  return {
    isValid: errors.length === 0,
    requestData: errors.length === 0 ? requestData : undefined,
    requestQuoteId: requestData.requestQuoteId,
    errors,
  };
};