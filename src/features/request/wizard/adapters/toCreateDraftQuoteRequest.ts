import { DraftQuoteForm } from '../schema';
import { 
  CreateDraftQuoteRequest, 
  DraftQuoteCustomerDto, 
  DraftQuoteShipmentDto, 
  DraftQuoteWizardDto,
  DraftQuoteAddressDto,
  DraftQuoteContactPersonDto,
  DraftQuoteLocationDto,
  DraftQuoteSeafreightDto,
  DraftQuoteHaulageDto,
  DraftQuoteServiceDto
} from '@features/offer/api/types.gen';
import { toValidISODate, toOptionalISODate } from '../utils/dateUtils';

// Type étendu pour inclure le champ request requis par l'API réelle
type ExtendedCreateDraftQuoteRequest = CreateDraftQuoteRequest & {
  request: {
    id: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
};

/**
 * Convertit les données du wizard vers le format de l'API pour créer un brouillon de devis
 */
export const toCreateDraftQuoteRequest = (
  formData: DraftQuoteForm,
  requestQuoteId: string
): ExtendedCreateDraftQuoteRequest => {
  console.log('🔄 [ADAPTER] Conversion du formulaire wizard vers CreateDraftQuoteRequest:', formData);

  const result = {
    request: {
      id: requestQuoteId,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    requestQuoteId,
    customer: toDraftQuoteCustomerDto(formData),
    shipment: toDraftQuoteShipmentDto(formData),
    wizard: toDraftQuoteWizardDto(formData)
  };

  console.log('📤 [ADAPTER] Payload final envoyé à l\'API:', JSON.stringify(result, null, 2));
  console.log('📤 [ADAPTER] Détails des données mappées:', {
    customer: {
      name: result.customer.name,
      email: result.customer.emails,
      phone: result.customer.phones,
      address: result.customer.address
    },
    shipment: {
      origin: result.shipment.origin,
      destination: result.shipment.destination,
      commodity: result.shipment.commodity
    },
    wizard: {
      seafreights: result.wizard.seafreights.length,
      haulages: result.wizard.haulages.length,
      services: result.wizard.services.length
    }
  });

  return result;
};

/**
 * Convertit les données client du formulaire vers DraftQuoteCustomerDto
 */
const toDraftQuoteCustomerDto = (formData: DraftQuoteForm): DraftQuoteCustomerDto => {
  const client = formData.basics?.client;
  
  return {
    type: 'company',
    name: client?.companyName || '',
    vat: undefined, // Pas disponible dans le formulaire
    emails: client?.email ? [client.email] : [],
    phones: client?.phone ? [client.phone] : [],
    address: {
      city: formData.basics?.origin?.city || '', // Adresse du client = ville d'origine
      country: formData.basics?.origin?.country || '',
      line1: undefined,
      line2: undefined,
      zip: undefined
    } as DraftQuoteAddressDto,
    contactPerson: {
      fullName: client?.contactFullName || '',
      phone: client?.phone || '',
      email: client?.email || ''
    } as DraftQuoteContactPersonDto
  };
};

/**
 * Convertit les données d'expédition du formulaire vers DraftQuoteShipmentDto
 */
const toDraftQuoteShipmentDto = (formData: DraftQuoteForm): DraftQuoteShipmentDto => {
  return {
    mode: mapCargoTypeToMode(formData.basics?.cargoType || 'FCL'),
    containerCount: calculateTotalContainerCount(formData.basics?.containers || []),
    containerTypes: extractContainerTypes(formData.basics?.containers || []),
    commodity: formData.basics?.goodsDescription || '',
    hsCodes: [], // Pas disponible dans le formulaire
    origin: {
      location: formData.basics?.origin?.city || '', // Utiliser 'location' au lieu de 'city'
      country: formData.basics?.origin?.country || '',
      address: undefined
    } as DraftQuoteLocationDto,
    destination: {
      location: formData.basics?.destination?.city || '', // Utiliser 'location' au lieu de 'city'
      country: formData.basics?.destination?.country || '',
      address: undefined
    } as DraftQuoteLocationDto,
    // Ports de départ et d'arrivée
    portFrom: formData.basics?.portFrom ? {
      portId: formData.basics.portFrom.portId,
      portName: formData.basics.portFrom.portName,
      unlocode: formData.basics.portFrom.unlocode,
      country: formData.basics.portFrom.country,
      city: formData.basics.portFrom.city
    } : undefined,
    portTo: formData.basics?.portTo ? {
      portId: formData.basics.portTo.portId,
      portName: formData.basics.portTo.portName,
      unlocode: formData.basics.portTo.unlocode,
      country: formData.basics.portTo.country,
      city: formData.basics.portTo.city
    } : undefined,
    requestedDeparture: toValidISODate(formData.basics?.requestedDeparture),
    docs: {
      requiresVGM: false,
      requiresBLDraftApproval: false
    },
    constraints: {
      minTruckLeadDays: 6,
      terminalCutoffDays: 11,
      customsDeadlineHours: 48
    }
  };
};

/**
 * Convertit les données du wizard vers DraftQuoteWizardDto
 */
const toDraftQuoteWizardDto = (formData: DraftQuoteForm): DraftQuoteWizardDto => {
  return {
    notes: formData.draftDescription || null,
    selectedServiceLevel: 'direct', // Valeur par défaut
    seafreights: formData.currentOption?.seafreights?.map(toDraftQuoteSeafreightDto) || [],
    haulages: formData.currentOption?.haulages?.map(toDraftQuoteHaulageDto) || [],
    services: formData.currentOption?.services?.map(toDraftQuoteServiceDto) || []
  };
};

/**
 * Convertit une sélection de seafreight vers DraftQuoteSeafreightDto
 */
const toDraftQuoteSeafreightDto = (seafreight: any): DraftQuoteSeafreightDto => {
  return {
    id: seafreight.id || '',
    carrier: seafreight.carrier || '',
    service: seafreight.service || '',
    etd: toOptionalISODate(seafreight.etd),
    eta: toOptionalISODate(seafreight.eta),
    rate: seafreight.rates?.map((rate: any) => ({
      containerType: rate.containerType || '',
      basePrice: rate.basePrice || 0,
      currency: rate.currency || 'EUR'
    })) || [],
    surcharges: seafreight.surcharges || []
  };
};

/**
 * Convertit une sélection de haulage vers DraftQuoteHaulageDto
 */
const toDraftQuoteHaulageDto = (haulage: any): DraftQuoteHaulageDto => {
  return {
    id: haulage.id || '',
    phase: haulage.leg || '',
    mode: haulage.mode || 'truck',
    from: haulage.from || '',
    to: haulage.to || '',
    pricingScope: haulage.pricingScope || 'per_container',
    containerFilter: haulage.containerFilter || [],
    windows: haulage.windows || null,
    basePrice: haulage.price || 0,
    surcharges: haulage.surcharges || []
  };
};

/**
 * Convertit une sélection de service vers DraftQuoteServiceDto
 */
const toDraftQuoteServiceDto = (service: any): DraftQuoteServiceDto => {
  return {
    code: service.code || '',
    label: service.label || '',
    calc: service.calc || 'flat',
    unit: service.unit || 'per_shipment',
    value: service.price || 0,
    currency: service.currency || 'EUR',
    taxable: service.taxable || false
  };
};

/**
 * Mappe le type de cargo vers le mode d'expédition
 */
const mapCargoTypeToMode = (cargoType: string): string => {
  const mapping: Record<string, string> = {
    'FCL': 'sea',
    'LCL': 'sea',
    'AIR': 'air'
  };
  
  return mapping[cargoType] || 'sea';
};

/**
 * Calcule le nombre total de containers depuis la liste des containers du formulaire
 */
const calculateTotalContainerCount = (containers: any[]): number => {
  if (!containers || containers.length === 0) {
    return 1; // Valeur par défaut
  }
  
  return containers.reduce((total, container) => {
    return total + (container.quantity || 1);
  }, 0);
};

/**
 * Extrait les types de containers depuis la liste des containers du formulaire
 */
const extractContainerTypes = (containers: any[]): string[] => {
  if (!containers || containers.length === 0) {
    return ['20GP']; // Valeur par défaut
  }
  
  return containers.map(container => container.containerType || '20GP');
};

/**
 * Valide les données avant conversion
 */
export const validateDraftQuoteData = (formData: DraftQuoteForm): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Vérifier les données de base
  if (!formData.basics?.cargoType) {
    errors.push('Type de cargo requis');
  }

  if (!formData.basics?.incoterm) {
    errors.push('Incoterm requis');
  }

  if (!formData.basics?.origin?.city || !formData.basics?.origin?.country) {
    errors.push('Origine complète requise');
  }

  if (!formData.basics?.destination?.city || !formData.basics?.destination?.country) {
    errors.push('Destination complète requise');
  }

  if (!formData.basics?.goodsDescription) {
    errors.push('Description des marchandises requise');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
