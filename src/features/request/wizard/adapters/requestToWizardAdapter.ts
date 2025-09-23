// import { RequestQuoteListViewModel } from '@features/request/api/types.gen';
import { DraftQuoteForm, defaultDraftQuoteForm } from '../schema';

/**
 * Adapte les données d'une requête existante vers le format du nouveau wizard
 */
export const adaptRequestToWizardForm = (
  requestData: any,
  currentUserEmail: string = 'user@example.com'
): DraftQuoteForm => {
  console.log('🔄 [ADAPTER] Adaptation des données de requête vers le wizard:', requestData);

  // Extraire les informations de localisation
  const pickupLocation = requestData.pickupLocation || {};
  const deliveryLocation = requestData.deliveryLocation || {};
  
  console.log('🔄 [ADAPTER] PickupLocation:', pickupLocation);
  console.log('🔄 [ADAPTER] DeliveryLocation:', deliveryLocation);

  // Créer un formulaire de base
  const wizardForm: DraftQuoteForm = {
    ...defaultDraftQuoteForm,
    basics: {
      ...defaultDraftQuoteForm.basics,
      // Adapter les données de base
      cargoType: mapCargoType(requestData.cargoType || 'FCL'),
      incoterm: requestData.incoterm || 'FOB',
      origin: {
        city: pickupLocation.city || requestData.pickupCity || requestData.origin?.city || '',
        country: pickupLocation.country || requestData.pickupCountry || requestData.origin?.country || ''
      },
      destination: {
        city: deliveryLocation.city || requestData.deliveryCity || requestData.destination?.city || '',
        country: deliveryLocation.country || requestData.deliveryCountry || requestData.destination?.country || ''
      },
      requestedDeparture: requestData.pickupDate || requestData.requestedDeparture || requestData.departureDate,
      goodsDescription: requestData.goodsDescription || requestData.productName || requestData.details || '',
      // Ajouter les informations client et assigné pour l'affichage
      client: {
        companyName: requestData.companyName || '',
        contactFullName: requestData.contactFullName || '',
        email: requestData.email || '',
        phone: requestData.phone || ''
      },
      assignee: {
        assigneeDisplayName: requestData.assigneeDisplayName || '',
        assigneeId: requestData.assigneeId || ''
      }
    },
    options: {
      seafreights: [],
      haulages: [],
      services: []
    },
    attachments: []
  };

  console.log('✅ [ADAPTER] Formulaire adapté:', wizardForm);
  return wizardForm;
};

/**
 * Mappe le type de cargo de l'API vers le format du wizard
 */
const mapCargoType = (apiCargoType: string): 'FCL' | 'LCL' | 'AIR' => {
  const mapping: Record<string, 'FCL' | 'LCL' | 'AIR'> = {
    'FCL': 'FCL',
    'LCL': 'LCL',
    'AIR': 'AIR',
    'FULL_CONTAINER_LOAD': 'FCL',
    'LESS_CONTAINER_LOAD': 'LCL',
    'AIR_FREIGHT': 'AIR',
    'CONTAINER': 'FCL',
    'BULK': 'LCL'
  };

  return mapping[apiCargoType?.toUpperCase()] || 'FCL';
};

/**
 * Valide les données de requête avant adaptation
 */
export const validateRequestData = (requestData: any): {
  isValid: boolean;
  requestData?: any;
  requestQuoteId?: string;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!requestData) {
    errors.push('Aucune donnée de requête fournie');
    return { isValid: false, errors };
  }

  if (!requestData.requestQuoteId) {
    errors.push('ID de requête manquant');
  }

  // Vérifier les informations de route (plusieurs formats possibles)
  const hasPickupInfo = requestData.pickupLocation?.city || 
                       requestData.pickupCity || 
                       requestData.origin?.city;
  const hasDeliveryInfo = requestData.deliveryLocation?.city || 
                         requestData.deliveryCity || 
                         requestData.destination?.city;

  if (!hasPickupInfo || !hasDeliveryInfo) {
    errors.push('Informations de route manquantes');
  }

  // Vérifier la description des marchandises
  const hasGoodsDescription = requestData.goodsDescription || 
                             requestData.productName || 
                             requestData.details;

  if (!hasGoodsDescription) {
    errors.push('Description des marchandises manquante');
  }

  return {
    isValid: errors.length === 0,
    requestData: errors.length === 0 ? requestData : undefined,
    requestQuoteId: requestData.requestQuoteId,
    errors
  };
};

/**
 * Extrait les informations de contact depuis les données de requête
 */
export const extractContactInfo = (requestData: any) => {
  return {
    contactId: requestData.customerId || requestData.contactId || 0,
    contactName: requestData.contactName || requestData.assigneeDisplayName || '',
    companyName: requestData.companyName || '',
    email: requestData.email || requestData.contactEmail || ''
  };
};

/**
 * Extrait les informations de route depuis les données de requête
 */
export const extractRouteInfo = (requestData: any) => {
  return {
    origin: {
      city: requestData.pickupCity || '',
      country: requestData.pickupCountry || ''
    },
    destination: {
      city: requestData.deliveryCity || '',
      country: requestData.deliveryCountry || ''
    }
  };
};

/**
 * Extrait les informations de produit depuis les données de requête
 */
export const extractProductInfo = (requestData: any) => {
  return {
    productId: requestData.productId || 1,
    productName: requestData.productName || '',
    incoterm: requestData.incoterm || 'FOB',
    goodsDescription: requestData.goodsDescription || requestData.productName || ''
  };
};

/**
 * Crée un résumé des données adaptées pour le debug
 */
export const createAdaptationSummary = (originalData: any, adaptedForm: DraftQuoteForm) => {
  return {
    original: {
      requestQuoteId: originalData.requestQuoteId,
      companyName: originalData.companyName,
      pickupCity: originalData.pickupCity,
      deliveryCity: originalData.deliveryCity,
      productName: originalData.productName,
      incoterm: originalData.incoterm,
      status: originalData.status
    },
    adapted: {
      cargoType: adaptedForm.basics.cargoType,
      incoterm: adaptedForm.basics.incoterm,
      origin: adaptedForm.basics.origin,
      destination: adaptedForm.basics.destination,
      goodsDescription: adaptedForm.basics.goodsDescription
    },
    mapping: {
      'original.pickupCity → adapted.origin.city': `${originalData.pickupCity} → ${adaptedForm.basics.origin.city}`,
      'original.deliveryCity → adapted.destination.city': `${originalData.deliveryCity} → ${adaptedForm.basics.destination.city}`,
      'original.productName → adapted.goodsDescription': `${originalData.productName} → ${adaptedForm.basics.goodsDescription}`,
      'original.incoterm → adapted.incoterm': `${originalData.incoterm} → ${adaptedForm.basics.incoterm}`
    }
  };
};
