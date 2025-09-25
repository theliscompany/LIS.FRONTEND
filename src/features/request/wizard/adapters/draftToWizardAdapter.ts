import { DraftQuoteForm, defaultDraftQuoteForm } from '../schema';
import { DraftQuote } from '@features/offer/types/DraftQuote';
import { v4 as uuidv4 } from 'uuid';


/**
 * Adapte les données d'un brouillon existant vers le format du nouveau wizard
 */
export const adaptDraftToWizardForm = (
  draftData: any, // Plus flexible, accepte n'importe quelle structure
  _currentUserEmail: string = 'user@example.com'
): DraftQuoteForm => {
  console.log('🔄 [DRAFT_ADAPTER] Adaptation des données de brouillon vers le wizard:', draftData);
  console.log('🔍 [DRAFT_ADAPTER] Structure des données reçues:', {
    keys: Object.keys(draftData),
    hasCustomer: !!draftData.data?.customer || !!draftData.customer,
    hasShipment: !!draftData.data?.shipment || !!draftData.shipment,
    hasOptions: !!draftData.data?.options || !!draftData.options,
    hasWizard: !!draftData.data?.wizard || !!draftData.wizard,
    draftQuoteId: draftData.data?.draftQuoteId || draftData.draftQuoteId
  });

  // Extraire les données avec des fallbacks multiples
  const customerName = draftData.data?.customer?.name || draftData.customer?.name || draftData.customerName || draftData.clientName || '';
  const customerEmail = draftData.data?.customer?.emails?.[0] || draftData.customer?.emails?.[0] || draftData.customer?.email || draftData.email || '';
  const customerPhone = draftData.data?.customer?.phones?.[0] || draftData.customer?.phones?.[0] || draftData.customer?.phone || draftData.phone || '';
  
  // Gérer la structure de l'API où les données sont dans shipment.origin/destination
  const originCity = draftData.data?.shipment?.origin?.location || 
                    draftData.data?.shipment?.origin?.city || 
                    draftData.shipment?.origin?.location || 
                    draftData.shipment?.origin?.city || 
                    draftData.origin?.location || 
                    draftData.origin?.city ||
                    draftData.pickupLocation?.city ||
                    draftData.pickupCity || '';
                    
  const originCountry = draftData.data?.shipment?.origin?.country || 
                       draftData.shipment?.origin?.country || 
                       draftData.origin?.country ||
                       draftData.pickupLocation?.country ||
                       draftData.pickupCountry || '';
                       
  const destinationCity = draftData.data?.shipment?.destination?.location || 
                         draftData.data?.shipment?.destination?.city || 
                         draftData.shipment?.destination?.location || 
                         draftData.shipment?.destination?.city || 
                         draftData.destination?.location || 
                         draftData.destination?.city ||
                         draftData.deliveryLocation?.city ||
                         draftData.deliveryCity || '';
                         
  const destinationCountry = draftData.data?.shipment?.destination?.country || 
                            draftData.shipment?.destination?.country || 
                            draftData.destination?.country ||
                            draftData.deliveryLocation?.country ||
                            draftData.deliveryCountry || '';

  console.log('🔍 [DRAFT_ADAPTER] Extraction des données géographiques:', {
    originCity,
    originCountry,
    destinationCity,
    destinationCountry,
    hasOriginLocation: !!draftData.data?.shipment?.origin?.location,
    hasDestinationLocation: !!draftData.data?.shipment?.destination?.location
  });

  // Debug pour les autres champs
  console.log('🔍 [DRAFT_ADAPTER] Extraction des autres données:', {
    cargoType: draftData.data?.shipment?.mode || draftData.shipment?.mode || draftData.mode,
    incoterm: draftData.data?.incoterm || draftData.incoterm,
    goodsDescription: draftData.data?.shipment?.commodity || draftData.shipment?.commodity,
    assigneeDisplayName: draftData.data?.assignee?.displayName || draftData.assignee?.displayName,
    assigneeId: draftData.data?.assignee?.id || draftData.assignee?.id,
    containerCount: draftData.data?.shipment?.containerCount || draftData.shipment?.containerCount,
    containerTypes: draftData.data?.shipment?.containerTypes || draftData.shipment?.containerTypes
  });

  // Extraire les données du wizard (seafreights, haulages, services)
  const wizardData = draftData.data?.wizard || draftData.wizard || {};
  const seafreights = wizardData.seafreights || [];
  const haulages = wizardData.haulages || [];
  const services = wizardData.services || [];

  // Créer un formulaire de base
  const wizardForm: DraftQuoteForm = {
    ...defaultDraftQuoteForm,
    basics: {
      ...defaultDraftQuoteForm.basics,
      // Adapter les données de base depuis le brouillon
      cargoType: mapCargoTypeFromDraft(draftData.data?.shipment?.mode || draftData.shipment?.mode || draftData.mode || 'sea'),
      incoterm: draftData.data?.incoterm || draftData.incoterm || 'FOB',
      origin: {
        city: originCity,
        country: originCountry
      },
      destination: {
        city: destinationCity,
        country: destinationCountry
      },
      requestedDeparture: draftData.data?.shipment?.requestedDeparture || draftData.shipment?.requestedDeparture || draftData.requestedDeparture || new Date().toISOString(),
      goodsDescription: draftData.data?.shipment?.commodity || draftData.shipment?.commodity || draftData.shipment?.goodsDescription || draftData.commodity || draftData.goodsDescription || '',
      // Ports de départ et d'arrivée (mappés depuis l'API)
      portFrom: mapPortFromDraft(draftData.data?.shipment?.portFrom || draftData.shipment?.portFrom),
      portTo: mapPortFromDraft(draftData.data?.shipment?.portTo || draftData.shipment?.portTo),
      // Containers (mappés depuis containerCount et containerTypes)
      containers: mapContainersFromDraft(draftData.data?.shipment || draftData.shipment || {}),
      // Informations client
      client: {
        companyName: customerName,
        contactFullName: draftData.data?.customer?.contactPerson?.firstName && draftData.data?.customer?.contactPerson?.lastName 
          ? `${draftData.data.customer.contactPerson.firstName} ${draftData.data.customer.contactPerson.lastName}`
          : draftData.data?.customer?.contactPerson?.fullName || draftData.customer?.contactPerson?.fullName || '',
        email: customerEmail,
        phone: customerPhone
      },
      // Informations assigné (si disponibles)
      assignee: {
        assigneeDisplayName: draftData.data?.assignee?.displayName || draftData.assignee?.displayName || '',
        assigneeId: draftData.data?.assignee?.id || draftData.assignee?.id || ''
      }
    },
    // Adapter les options existantes
    existingOptions: draftData.data?.options?.map((option: any) => {
      console.log('🔍 [DRAFT_ADAPTER] Mapping option API (nouvelle structure seafreights array):', option);
      
      // Mapper seafreights (array dans l'API) vers seafreights (array dans le wizard)
      const seafreights = option.seafreights?.map((sf: any) => ({
        id: sf.id || uuidv4(),
        carrier: sf.carrier || '',
        service: sf.service || '',
        etd: sf.etd || null,
        eta: sf.eta || null,
        rates: sf.rate?.map((rate: any) => ({
          containerType: rate.containerType || '',
          basePrice: rate.basePrice || 0,
          currency: rate.currency || 'EUR'
        })) || [],
        surcharges: sf.surcharges || []
      })) || [];

      // Mapper haulages
      const haulages = option.haulages?.map((haulage: any) => ({
        id: haulage.id || uuidv4(),
        mode: haulage.mode || 'truck',
        leg: haulage.phase || 'pre',
        from: haulage.from || '',
        to: haulage.to || '',
        price: haulage.basePrice || 0,
        note: haulage.note || '',
        pricingScope: haulage.pricingScope || 'per_container',
        containerFilter: haulage.containerFilter || [],
        windows: haulage.windows || null,
        surcharges: haulage.surcharges || []
      })) || [];

      // Mapper services
      const services = option.services?.map((service: any) => ({
        id: service.id || uuidv4(),
        code: service.code || '',
        label: service.label || '',
        price: service.value || 0,
        currency: service.currency || 'EUR',
        calc: service.calc || 'flat',
        unit: service.unit || 'per_shipment',
        taxable: service.taxable || false
      })) || [];

      // Mapper containers
      const containers = option.containers?.map((container: any) => ({
        containerType: container.containerType || '',
        quantity: container.quantity || 1,
        teu: container.teu || 1
      })) || [];

      const mappedOption = {
        id: option.optionId || uuidv4(),
        name: option.label || `Option ${draftData.data?.options?.indexOf(option) + 1}`,
        description: option.description || undefined,
        seafreights: seafreights,
        haulages: haulages,
        services: services,
        containers: containers,
        ports: [], // Les ports ne sont pas stockés dans les options
        totals: option.totals || {
          seafreights: 0,
          haulages: 0,
          services: 0,
          grandTotal: 0
        },
        currency: option.currency || 'EUR',
        validUntil: option.validUntil || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        isPreferred: option.isPreferred || false,
        totalPrice: option.totals?.grandTotal || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('✅ [DRAFT_ADAPTER] Option mappée (avec seafreights array):', mappedOption);
      return mappedOption;
    }) || [],
    // Option en cours avec les données du wizard
    currentOption: {
      seafreights: seafreights.map((sf: any) => ({
        id: sf.id || uuidv4(),
        carrier: sf.carrier || '',
        service: sf.service || '',
        etd: sf.etd || null,
        eta: sf.eta || null,
        rates: sf.rate?.map((rate: any) => ({
          containerType: rate.containerType || '',
          basePrice: rate.basePrice || 0,
          currency: rate.currency || 'EUR'
        })) || [],
        surcharges: sf.surcharges || []
      })),
      haulages: haulages.map((haulage: any) => ({
        id: haulage.id || uuidv4(),
        mode: haulage.mode || 'truck',
        leg: haulage.phase || 'pre',
        from: haulage.from || '',
        to: haulage.to || '',
        price: haulage.basePrice || 0,
        note: haulage.note || '',
        pricingScope: haulage.pricingScope || 'per_container',
        containerFilter: haulage.containerFilter || [],
        windows: haulage.windows || null,
        surcharges: haulage.surcharges || []
      })),
      services: services.map((service: any) => ({
        id: service.id || uuidv4(),
        code: service.code || '',
        label: service.label || '',
        price: service.value || 0,
        currency: service.currency || 'EUR',
        calc: service.calc || 'flat',
        unit: service.unit || 'per_shipment',
        taxable: service.taxable || false
      }))
    },
    attachments: draftData.data?.attachments || draftData.attachments || []
  };

  console.log('✅ [DRAFT_ADAPTER] Formulaire adapté depuis le brouillon:', wizardForm);
  return wizardForm;
};

/**
 * Mappe le mode de transport du brouillon vers le type de cargo du wizard
 */
const mapCargoTypeFromDraft = (mode: string): 'FCL' | 'LCL' | 'AIR' => {
  const mapping: Record<string, 'FCL' | 'LCL' | 'AIR'> = {
    'sea': 'FCL',
    'air': 'AIR',
    'road': 'FCL',
    'rail': 'FCL'
  };

  return mapping[mode?.toLowerCase()] || 'FCL';
};

/**
 * Mappe les containers depuis les données de shipment
 */
const mapContainersFromDraft = (shipmentData: any): any[] => {
  const containerCount = shipmentData.containerCount || 1;
  const containerTypes = shipmentData.containerTypes || ['20GP'];
  
  // Si on a plusieurs types de containers, créer un container pour chaque type
  if (containerTypes.length > 1) {
    return containerTypes.map((type: string) => ({
      containerType: type,
      quantity: containerCount,
      teu: getTeuForContainerType(type)
    }));
  }
  
  // Sinon, créer un seul container du type spécifié
  return [{
    containerType: containerTypes[0] || '20GP',
    quantity: containerCount,
    teu: getTeuForContainerType(containerTypes[0] || '20GP')
  }];
};

/**
 * Retourne le TEU (Twenty-foot Equivalent Unit) pour un type de container
 */
const getTeuForContainerType = (containerType: string): number => {
  const teuMapping: Record<string, number> = {
    '20GP': 1,
    '20HC': 1,
    '40GP': 2,
    '40HC': 2,
    '45HC': 2.25
  };
  
  return teuMapping[containerType] || 1;
};

/**
 * Mappe un port depuis les données de l'API vers le format du wizard
 */
const mapPortFromDraft = (portData: any): any => {
  if (!portData) {
    return undefined;
  }

  return {
    portId: portData.portId,
    portName: portData.portName,
    unlocode: portData.unlocode,
    country: portData.country,
    city: portData.city
  };
};

/**
 * Valide les données de brouillon avant adaptation
 */
export const validateDraftData = (draftData: any): {
  isValid: boolean;
  draftData?: DraftQuote;
  draftId?: string;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!draftData) {
    errors.push('Aucune donnée de brouillon fournie');
    return { isValid: false, errors };
  }

  console.log('🔍 [VALIDATION] Validation des données de brouillon:', {
    hasDraftQuoteId: !!draftData.data?.draftQuoteId || !!draftData.draftQuoteId,
    hasId: !!draftData.data?.id || !!draftData.id,
    hasCustomer: !!draftData.data?.customer || !!draftData.customer,
    hasShipment: !!draftData.data?.shipment || !!draftData.shipment,
    hasOrigin: !!draftData.data?.shipment?.origin || !!draftData.shipment?.origin,
    hasDestination: !!draftData.data?.shipment?.destination || !!draftData.shipment?.destination,
    allKeys: Object.keys(draftData)
  });

  // Vérifier l'ID du brouillon (peut être draftQuoteId ou id)
  const draftId = draftData.data?.draftQuoteId || draftData.data?.id || draftData.draftQuoteId || draftData.id;
  if (!draftId) {
    errors.push('ID de brouillon manquant');
  }

  // Vérifier les informations de base (plus flexible)
  const hasCustomer = draftData.data?.customer?.name || draftData.customer?.name || draftData.customerName || draftData.clientName;
  if (!hasCustomer) {
    errors.push('Nom du client manquant');
  }

  // Vérifier l'origine (plus flexible)
  const hasOrigin = draftData.data?.shipment?.origin?.location || 
                   draftData.data?.shipment?.origin?.city || 
                   draftData.shipment?.origin?.location || 
                   draftData.shipment?.origin?.city || 
                   draftData.origin?.location || 
                   draftData.origin?.city ||
                   draftData.pickupLocation?.city ||
                   draftData.pickupCity;
  const hasOriginCountry = draftData.data?.shipment?.origin?.country || 
                          draftData.shipment?.origin?.country || 
                          draftData.origin?.country ||
                          draftData.pickupLocation?.country ||
                          draftData.pickupCountry;
  
  if (!hasOrigin && !hasOriginCountry) {
    errors.push('Ville d\'origine manquante');
  }

  // Vérifier la destination (plus flexible)
  const hasDestination = draftData.data?.shipment?.destination?.location;
  const hasDestinationCountry = draftData.data?.shipment?.destination?.country || 
                               draftData.shipment?.destination?.country || 
                               draftData.destination?.country ||
                               draftData.deliveryLocation?.country ||
                               draftData.deliveryCountry;
  
  if (!hasDestination && !hasDestinationCountry) {
    errors.push('Ville de destination manquante');
  }

  console.log('🔍 [VALIDATION] Résultat de la validation:', {
    errors,
    isValid: errors.length === 0,
    draftId
  });

  return {
    isValid: errors.length === 0,
    draftData: errors.length === 0 ? draftData : undefined,
    draftId,
    errors
  };
};

/**
 * Extrait les informations de contact depuis les données de brouillon
 */
export const extractContactInfoFromDraft = (draftData: any) => {
  return {
    contactId: draftData.data?.customer?.id || draftData.customer?.id || 0,
    contactName: draftData.data?.customer?.contactPerson?.firstName && draftData.data?.customer?.contactPerson?.lastName
      ? `${draftData.data.customer.contactPerson.firstName} ${draftData.data.customer.contactPerson.lastName}`
      : draftData.customer?.contactPerson?.firstName && draftData.customer?.contactPerson?.lastName
      ? `${draftData.customer.contactPerson.firstName} ${draftData.customer.contactPerson.lastName}`
      : '',
    companyName: draftData.data?.customer?.name || draftData.customer?.name || '',
    email: draftData.data?.customer?.emails?.[0] || draftData.customer?.emails?.[0] || ''
  };
};

/**
 * Extrait les informations de route depuis les données de brouillon
 */
export const extractRouteInfoFromDraft = (draftData: any) => {
  return {
    origin: {
      city: draftData.data?.shipment?.origin?.location || draftData.data?.shipment?.origin?.city || draftData.shipment?.origin?.location || draftData.shipment?.origin?.city || '',
      country: draftData.data?.shipment?.origin?.country || draftData.shipment?.origin?.country || ''
    },
    destination: {
      city: draftData.data?.shipment?.destination?.location || draftData.data?.shipment?.destination?.city || draftData.shipment?.destination?.location || draftData.shipment?.destination?.city || '',
      country: draftData.data?.shipment?.destination?.country || draftData.shipment?.destination?.country || ''
    }
  };
};

/**
 * Crée un résumé des données adaptées pour le debug
 */
export const createDraftAdaptationSummary = (originalData: any, adaptedForm: DraftQuoteForm) => {
  return {
    original: {
      draftQuoteId: originalData.data?.draftQuoteId || originalData.draftQuoteId,
      customerName: originalData.data?.customer?.name || originalData.customer?.name,
      originCity: originalData.data?.shipment?.origin?.location || originalData.data?.shipment?.origin?.city || originalData.shipment?.origin?.location || originalData.shipment?.origin?.city,
      destinationCity: originalData.data?.shipment?.destination?.location || originalData.data?.shipment?.destination?.city || originalData.shipment?.destination?.location || originalData.shipment?.destination?.city,
      commodity: originalData.data?.shipment?.commodity || originalData.shipment?.commodity,
      incoterm: originalData.data?.incoterm || originalData.incoterm,
      status: originalData.data?.status || originalData.status,
      optionsCount: originalData.data?.options?.length || originalData.options?.length || 0
    },
    adapted: {
      cargoType: adaptedForm.basics.cargoType,
      incoterm: adaptedForm.basics.incoterm,
      origin: adaptedForm.basics.origin,
      destination: adaptedForm.basics.destination,
      goodsDescription: adaptedForm.basics.goodsDescription,
      existingOptionsCount: adaptedForm.existingOptions?.length || 0
    },
    mapping: {
      'original.shipment.origin.location → adapted.origin.city': `${originalData.data?.shipment?.origin?.location || originalData.data?.shipment?.origin?.city || originalData.shipment?.origin?.location || originalData.shipment?.origin?.city} → ${adaptedForm.basics.origin.city}`,
      'original.shipment.destination.location → adapted.destination.city': `${originalData.data?.shipment?.destination?.location || originalData.data?.shipment?.destination?.city || originalData.shipment?.destination?.location || originalData.shipment?.destination?.city} → ${adaptedForm.basics.destination.city}`,
      'original.shipment.commodity → adapted.goodsDescription': `${originalData.data?.shipment?.commodity || originalData.shipment?.commodity} → ${adaptedForm.basics.goodsDescription}`,
      'original.incoterm → adapted.incoterm': `${originalData.data?.incoterm || originalData.incoterm} → ${adaptedForm.basics.incoterm}`,
      'original.options → adapted.existingOptions': `${originalData.data?.options?.length || originalData.options?.length || 0} → ${adaptedForm.existingOptions?.length || 0}`
    }
  };
};

