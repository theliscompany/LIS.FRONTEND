import { DraftQuoteForm } from './schema';
import type { CreateDraftQuoteRequest, DraftQuoteCustomerDto, DraftQuoteShipmentDto, DraftQuoteWizardDto } from '../../offer/api/types.gen';
import { toValidISODate, toOptionalISODate } from './utils/dateUtils';

/**
 * Creates the initial draft quote request (first step)
 * This creates the draft quote with basic information, then options are added separately
 */
export const toCreateDraftQuoteRequest = (formData: DraftQuoteForm, requestQuoteId: string): CreateDraftQuoteRequest => {
  // Build customer information
  const customer: DraftQuoteCustomerDto = {
    type: 'COMPANY',
    name: formData.basics.client?.companyName || 'Unknown Company',
    vat: undefined,
    emails: formData.basics.client?.email ? [formData.basics.client.email] : undefined,
    phones: formData.basics.client?.phone ? [formData.basics.client.phone] : undefined
  };

  // Build shipment information
  const shipment: DraftQuoteShipmentDto = {
    mode: mapCargoType(formData.basics.cargoType),
    containerCount: 1, // Default, will be updated based on options
    containerTypes: formData.currentOption?.seafreights?.flatMap(sf => 
      sf.rates?.map(rate => rate.containerType) || []
    ) || [],
    commodity: formData.basics.goodsDescription,
    hsCodes: undefined,
    origin: {
      city: formData.basics.origin.city,
      country: formData.basics.origin.country
    },
    destination: {
      city: formData.basics.destination.city,
      country: formData.basics.destination.country
    },
    requestedDeparture: toValidISODate(formData.basics.requestedDeparture),
    incoterm: formData.basics.incoterm
  };

  // Build wizard information (basic structure for first option)
  const wizard: DraftQuoteWizardDto = {
    notes: `Created from request ${requestQuoteId}`,
    selectedServiceLevel: 'STANDARD',
    seafreights: formData.currentOption?.seafreights?.map(sf => ({
      carrier: sf.carrier,
      service: sf.service,
      etd: toOptionalISODate(sf.etd) || undefined,
      eta: toOptionalISODate(sf.eta) || undefined,
      basePrice: sf.rates[0]?.basePrice || 0,
      currency: 'EUR'
    })) || [],
    haulages: formData.currentOption?.haulages?.map(haulage => ({
      mode: mapHaulageMode(haulage.mode),
      leg: mapHaulageLeg(haulage.leg),
      from: formData.basics.origin.city,
      to: formData.basics.destination.city,
      basePrice: haulage.price,
      currency: 'EUR',
      note: haulage.note
    })) || [],
    services: formData.currentOption?.services?.map(service => ({
      code: service.code,
      label: service.label,
      basePrice: service.price || 0,
      currency: 'EUR'
    })) || []
  };

  return {
    request: {
      id: requestQuoteId,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    requestQuoteId,
    customer,
    shipment,
    wizard
  };
};

/**
 * Converts form data to the existing DraftQuote payload structure
 * Maintains backward compatibility with current backend API
 * @deprecated Use toCreateDraftQuoteRequest + toDraftQuoteOptionPayload instead
 */
export const toDraftQuotePayload = (formData: DraftQuoteForm, resumeToken: string) => {
  // Map cargo type to backend format
  const mapCargoType = (cargoType: string) => {
    switch (cargoType) {
      case 'FCL':
        return 'FCL';
      case 'LCL':
        return 'LCL';
      case 'AIR':
        return 'AIR';
      default:
        return 'FCL';
    }
  };

  // Map haulage mode to backend format
  const mapHaulageMode = (mode: string) => {
    switch (mode) {
      case 'truck':
        return 'TRUCK';
      case 'rail':
        return 'RAIL';
      case 'barge':
        return 'BARGE';
      default:
        return 'TRUCK';
    }
  };

  // Map haulage leg to backend format
  const mapHaulageLeg = (leg: string) => {
    switch (leg) {
      case 'pre':
        return 'PRE_CARRIAGE';
      case 'on':
        return 'ON_CARRIAGE';
      case 'post':
        return 'POST_CARRIAGE';
      default:
        return 'ON_CARRIAGE';
    }
  };

  // Build the payload according to current backend structure
  const payload = {
    // Basic information
    requestQuoteId: resumeToken, // Use resume token as request ID
    status: 'in_progress',
    version: 1,
    
    // Cargo information
    cargoType: mapCargoType(formData.basics.cargoType),
    incoterm: formData.basics.incoterm,
    
    // Route information
    origin: {
      city: formData.basics.origin.city,
      country: formData.basics.origin.country,
      location: `${formData.basics.origin.city}, ${formData.basics.origin.country}`
    },
    destination: {
      city: formData.basics.destination.city,
      country: formData.basics.destination.country,
      location: `${formData.basics.destination.city}, ${formData.basics.destination.country}`
    },
    
    // Dates
    requestedDeparture: formData.basics.requestedDeparture 
      ? new Date(formData.basics.requestedDeparture).toISOString()
      : undefined,
    
    // Goods description
    goodsDescription: formData.basics.goodsDescription,
    
    // Options - Seafreights
    seafreights: formData.currentOption?.seafreights?.map(sf => ({
      carrier: sf.carrier,
      service: sf.service,
      etd: toOptionalISODate(sf.etd) || undefined,
      eta: toOptionalISODate(sf.eta) || undefined,
      rates: sf.rates?.map(rate => ({
        containerType: rate.containerType,
        basePrice: rate.basePrice,
        currency: 'EUR' // Default currency
      })) || []
    })) || [],
    
    // Options - Haulages
    haulages: formData.currentOption?.haulages?.map(haulage => ({
      mode: mapHaulageMode(haulage.mode),
      leg: mapHaulageLeg(haulage.leg),
      price: haulage.price,
      currency: 'EUR', // Default currency
      note: haulage.note || undefined
    })) || [],
    
    // Options - Services
    services: formData.currentOption?.services?.map(service => ({
      code: service.code,
      label: service.label,
      price: service.price || 0,
      currency: 'EUR' // Default currency
    })) || [],
    
    // Attachments
    attachments: formData.attachments.map(attachment => ({
      name: attachment.name,
      url: attachment.url,
      type: 'document' // Default type
    })),
    
    // Metadata
    metadata: {
      resumeToken,
      formVersion: '2.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    
    // Wizard state
    wizard: {
      currentStep: 'review', // Always review when submitting
      completedSteps: ['basics', 'options', 'review'],
      status: 'ready_to_submit',
      lastModified: new Date().toISOString()
    }
  };

  return payload;
};

/**
 * Validates the form data before conversion
 */
export const validateFormForSubmission = (formData: DraftQuoteForm): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate basics
  if (!formData.basics.cargoType) {
    errors.push('Cargo type is required');
  }
  if (!formData.basics.incoterm) {
    errors.push('Incoterm is required');
  }
  if (!formData.basics.origin.city || !formData.basics.origin.country) {
    errors.push('Origin city and country are required');
  }
  if (!formData.basics.destination.city || !formData.basics.destination.country) {
    errors.push('Destination city and country are required');
  }
  if (!formData.basics.goodsDescription) {
    errors.push('Goods description is required');
  }

  // Validate options - at least one option should be selected
  const hasSeafreights = formData.currentOption?.seafreights?.length > 0;
  const hasHaulages = formData.currentOption?.haulages?.length > 0;
  const hasServices = formData.currentOption?.services?.length > 0;

  if (!hasSeafreights && !hasHaulages && !hasServices) {
    errors.push('At least one option (seafreight, haulage, or service) must be selected');
  }

  // Validate seafreights
  formData.currentOption?.seafreights?.forEach((sf, index) => {
    if (!sf.carrier) {
      errors.push(`Seafreight ${index + 1}: Carrier is required`);
    }
    if (!sf.service) {
      errors.push(`Seafreight ${index + 1}: Service is required`);
    }
    if (sf.rates.length === 0) {
      errors.push(`Seafreight ${index + 1}: At least one rate is required`);
    }
    sf.rates.forEach((rate, rateIndex) => {
      if (!rate.containerType) {
        errors.push(`Seafreight ${index + 1}, Rate ${rateIndex + 1}: Container type is required`);
      }
      if (rate.basePrice < 0) {
        errors.push(`Seafreight ${index + 1}, Rate ${rateIndex + 1}: Base price must be non-negative`);
      }
    });
  });

  // Validate haulages
  formData.currentOption?.haulages?.forEach((haulage, index) => {
    if (!haulage.mode) {
      errors.push(`Haulage ${index + 1}: Mode is required`);
    }
    if (!haulage.leg) {
      errors.push(`Haulage ${index + 1}: Leg is required`);
    }
    if (haulage.price < 0) {
      errors.push(`Haulage ${index + 1}: Price must be non-negative`);
    }
  });

  // Validate services
  formData.currentOption?.services?.forEach((service, index) => {
    if (!service.code) {
      errors.push(`Service ${index + 1}: Code is required`);
    }
    if (!service.label) {
      errors.push(`Service ${index + 1}: Label is required`);
    }
    if (service.price !== undefined && service.price < 0) {
      errors.push(`Service ${index + 1}: Price must be non-negative`);
    }
  });

  // Validate attachments
  formData.attachments.forEach((attachment, index) => {
    if (!attachment.name) {
      errors.push(`Attachment ${index + 1}: Name is required`);
    }
    if (!attachment.url) {
      errors.push(`Attachment ${index + 1}: URL is required`);
    } else {
      try {
        new URL(attachment.url);
      } catch {
        errors.push(`Attachment ${index + 1}: Invalid URL format`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Creates a resume token for client-side persistence
 */
export const createResumeToken = (): string => {
  return `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Extracts resume token from URL or creates a new one
 */
export const getOrCreateResumeToken = (): string => {
  // Try to get from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const resumeToken = urlParams.get('resumeToken');
  
  if (resumeToken) {
    return resumeToken;
  }
  
  // Create new token
  return createResumeToken();
};
