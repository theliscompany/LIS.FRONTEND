/**
 * Service de mapping bidirectionnel entre DraftQuote frontend et API
 * Assure la compatibilité entre les deux formats de données
 */

import { DraftQuote, Step1, Step2, Step3, Step4, Step5, Step6, Step7 } from '../types/DraftQuote';
import type { 
  DraftQuoteResponse, 
  DraftQuoteCustomerDto, 
  DraftQuoteShipmentDto, 
  DraftQuoteWizardDto,
  DraftQuoteOptionDto,
  CreateDraftQuoteRequest,
  UpdateDraftQuoteRequest
} from '../../offer/api/types.gen';

/**
 * Transforme un DraftQuote frontend vers le format API
 */
export class DraftQuoteApiMapper {
  
  /**
   * Transforme DraftQuote vers CreateDraftQuoteRequest
   */
  static toCreateRequest(draftQuote: DraftQuote): CreateDraftQuoteRequest {
    return {
      requestQuoteId: draftQuote.requestQuoteId || '',
      customer: this.mapCustomer(draftQuote.step1),
      shipment: this.mapShipment(draftQuote),
      wizard: this.mapWizard(draftQuote),
    };
  }

  /**
   * Transforme DraftQuote vers UpdateDraftQuoteRequest
   */
  static toUpdateRequest(draftQuote: DraftQuote): UpdateDraftQuoteRequest {
    return {
      customer: this.mapCustomer(draftQuote.step1),
      shipment: this.mapShipment(draftQuote),
      wizard: this.mapWizard(draftQuote),
      options: this.mapOptions(draftQuote.savedOptions || []),
      notes: draftQuote.step1?.comment || '',
    };
  }

  /**
   * Transforme DraftQuoteResponse vers DraftQuote frontend
   */
  static fromApiResponse(apiResponse: DraftQuoteResponse): DraftQuote {
    return {
      id: apiResponse.draftQuoteId,
      requestQuoteId: apiResponse.requestQuoteId,
      emailUser: '', // À récupérer depuis le contexte utilisateur
      clientNumber: '', // À récupérer depuis le contexte
      
      // Mapping des steps depuis l'API
      step1: this.mapStep1FromApi(apiResponse),
      step2: this.mapStep2FromApi(apiResponse),
      step3: this.mapStep3FromApi(apiResponse),
      step4: this.mapStep4FromApi(apiResponse),
      step5: this.mapStep5FromApi(apiResponse),
      step6: this.mapStep6FromApi(apiResponse),
      step7: this.mapStep7FromApi(apiResponse),
      
      // Propriétés calculées
      totals: this.calculateTotals(apiResponse),
      savedOptions: this.mapOptionsFromApi(apiResponse.options || []),
      
      // Propriétés par défaut
      selectedHaulage: undefined,
      selectedSeafreights: [],
      selectedMiscellaneous: [],
      selectedContainers: {},
      marginType: 'percent',
      marginValue: 0,
      totalPrice: 0,
      seafreightTotal: 0,
      haulageTotal: 0,
      miscTotal: 0,
      totalTEU: 0,
      seafreightQuantities: {},
      miscQuantities: {},
      surchargeQuantities: {},
    };
  }

  /**
   * Mappe les données client de Step1 vers DraftQuoteCustomerDto
   */
  private static mapCustomer(step1: Step1): DraftQuoteCustomerDto {
    return {
      type: 'company',
      name: step1.customer?.companyName || '',
      vat: '',
      emails: step1.customer?.email ? [step1.customer.email] : [],
      phones: [],
      address: {
        line1: '',
        line2: '',
        city: step1.cityFrom?.name || '',
        zip: '',
        country: step1.cityFrom?.country || '',
      },
      contactPerson: {
        fullName: step1.customer?.contactName || '',
        phone: '',
        email: step1.customer?.email || '',
      },
    };
  }

  /**
   * Mappe les données de shipment depuis DraftQuote
   */
  private static mapShipment(draftQuote: DraftQuote): DraftQuoteShipmentDto {
    const containerTypes = draftQuote.step3?.containers?.map(c => c.type || c.containerType) || [];
    
    return {
      mode: 'FCL', // Par défaut
      containerCount: draftQuote.step3?.containers?.length || 0,
      containerTypes: containerTypes,
      commodity: draftQuote.step1?.productName?.productName || '',
      hsCodes: [],
      origin: {
        location: this.getLocationCode(draftQuote.step1?.cityFrom),
        country: draftQuote.step1?.cityFrom?.country || '',
      },
      destination: {
        location: this.getLocationCode(draftQuote.step1?.cityTo),
        country: draftQuote.step1?.cityTo?.country || '',
      },
      requestedDeparture: undefined,
      docs: {
        requiresVGM: false,
        requiresBLDraftApproval: false,
      },
      constraints: {
        minTruckLeadDays: 1,
        terminalCutoffDays: 1,
        customsDeadlineHours: 24,
      },
    };
  }

  /**
   * Mappe les données du wizard
   */
  private static mapWizard(draftQuote: DraftQuote): DraftQuoteWizardDto {
    return {
      notes: draftQuote.step1?.comment || '',
      selectedServiceLevel: 'standard',
      seafreights: this.mapSeafreights(draftQuote.step5),
      haulages: this.mapHaulages(draftQuote.step4),
      services: this.mapServices(draftQuote.step2),
    };
  }

  /**
   * Mappe les options sauvegardées
   */
  private static mapOptions(savedOptions: any[]): DraftQuoteOptionDto[] {
    return savedOptions.map(option => ({
      optionId: option.id || option.optionId,
      label: option.name || '',
      validUntil: option.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      currency: 'EUR',
      containers: this.mapOptionContainers(option),
      planning: this.mapOptionPlanning(option),
      seafreight: this.mapOptionSeafreight(option),
      haulages: this.mapOptionHaulages(option),
      services: this.mapOptionServices(option),
      totals: this.mapOptionTotals(option),
      terms: this.mapOptionTerms(option),
    }));
  }

  // === MAPPING INVERSE (API → Frontend) ===

  private static mapStep1FromApi(apiResponse: DraftQuoteResponse): Step1 {
    const customer = apiResponse.customer;
    const shipment = apiResponse.shipment;
    
    return {
      customer: {
        contactId: 0,
        contactName: customer?.contactPerson?.fullName || '',
        companyName: customer?.name || '',
        email: customer?.contactPerson?.email || '',
      },
      cityFrom: {
        name: shipment?.origin?.location || '',
        country: shipment?.origin?.country || '',
      },
      cityTo: {
        name: shipment?.destination?.location || '',
        country: shipment?.destination?.country || '',
      },
      status: 'NEW',
      assignee: '',
      comment: apiResponse.wizard?.notes || '',
      productName: {
        productId: 0,
        productName: shipment?.commodity || '',
      },
      incotermName: apiResponse.incoterm || '',
      route: {
        origin: {
          city: { name: shipment?.origin?.location || '', country: shipment?.origin?.country || '' },
          port: { portId: 0, portName: '', country: '' }
        },
        destination: {
          city: { name: shipment?.destination?.location || '', country: shipment?.destination?.country || '' },
          port: { portId: 0, portName: '', country: '' }
        }
      },
      cargo: {
        product: { productId: 0, productName: shipment?.commodity || '' },
        incoterm: apiResponse.incoterm || '',
      },
      metadata: {
        comment: apiResponse.wizard?.notes || '',
      },
      portFrom: { portId: 0, portName: '', country: '' },
      portTo: { portId: 0, portName: '', country: '' },
    };
  }

  private static mapStep2FromApi(apiResponse: DraftQuoteResponse): Step2 {
    return {
      selectedServices: [],
      selected: [],
    };
  }

  private static mapStep3FromApi(apiResponse: DraftQuoteResponse): Step3 {
    const containers = apiResponse.shipment?.containerTypes?.map((type, index) => ({
      id: `container_${index}`,
      type: type,
      quantity: 1,
      teu: this.getTEU(type),
    })) || [];

    return {
      containers: containers,
      summary: {
        totalContainers: containers.length,
        totalTEU: containers.reduce((sum, c) => sum + c.teu, 0),
        containerTypes: containers.map(c => c.type),
      },
      route: {
        origin: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } },
        destination: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } }
      },
      selectedContainers: { list: containers },
    };
  }

  private static mapStep4FromApi(apiResponse: DraftQuoteResponse): Step4 {
    return {
      selection: {
        offerId: '',
        haulierId: 0,
        haulierName: '',
        tariff: { unitPrice: 0, currency: 'EUR', freeTime: 0 },
        route: {
          pickup: { company: '', city: '', country: '' },
          delivery: { portId: 0, portName: '', country: '' }
        },
        validity: { validUntil: '' },
      },
      calculation: { quantity: 1, unitPrice: 0, subtotal: 0, currency: 'EUR' },
    };
  }

  private static mapStep5FromApi(apiResponse: DraftQuoteResponse): Step5 {
    return {
      selections: [],
      summary: { totalSelections: 0, totalContainers: 0, totalAmount: 0, currency: 'EUR', selectedCarriers: [], containerTypes: [], preferredSelectionId: '' },
    };
  }

  private static mapStep6FromApi(apiResponse: DraftQuoteResponse): Step6 {
    return {
      selections: [],
      summary: { totalSelections: 0, totalAmount: 0, currency: 'EUR', categories: [] },
    };
  }

  private static mapStep7FromApi(apiResponse: DraftQuoteResponse): Step7 {
    return {
      finalization: { optionName: '', optionDescription: '', marginPercentage: 0, marginAmount: 0, marginType: 'percentage', isReadyToGenerate: false, generatedAt: '' },
      validation: { allStepsValid: false, errors: [], warnings: [] },
      pricingSummary: { baseTotal: 0, marginAmount: 0, finalTotal: 0, currency: 'EUR', breakdown: { haulageAmount: 0, seafreightAmount: 0, miscellaneousAmount: 0, totalBeforeMargin: 0, components: [] } },
    };
  }

  // === FONCTIONS UTILITAIRES ===

  private static getLocationCode(city: any): string {
    return city?.name || '';
  }

  private static getTEU(containerType: string): number {
    const teuMap: { [key: string]: number } = {
      '20GP': 1,
      '40GP': 2,
      '40HC': 2,
      '45HC': 2.25,
      '20RF': 1,
      '40RF': 2,
    };
    return teuMap[containerType] || 1;
  }

  private static calculateTotals(apiResponse: DraftQuoteResponse): any {
    return {
      haulage: 0,
      seafreight: 0,
      miscellaneous: 0,
      subtotal: 0,
      grandTotal: 0,
      currency: apiResponse.currency || 'EUR',
      totalTEU: 0,
    };
  }

  // === MAPPING DES SOUS-COMPOSANTS ===

  private static mapSeafreights(step5: Step5): any[] {
    return step5?.selections?.map(selection => ({
      id: selection.id,
      carrier: selection.carrier?.carrierName || '',
      service: '',
      rate: [{
        containerType: selection.container?.containerType || '',
        basePrice: selection.container?.unitPrice || 0,
      }],
      surcharges: [],
    })) || [];
  }

  private static mapHaulages(step4: Step4): any[] {
    if (!step4?.selection) return [];
    
    return [{
      id: step4.selection.offerId,
      phase: 'pickup',
      mode: 'road',
      from: step4.selection.route?.pickup?.city || '',
      to: step4.selection.route?.delivery?.portName || '',
      basePrice: step4.selection.tariff?.unitPrice || 0,
      surcharges: [],
    }];
  }

  private static mapServices(step2: Step2): any[] {
    return step2?.selectedServices?.map(service => ({
      code: service.serviceId.toString(),
      label: service.serviceName,
      calc: 'flat',
      unit: 'per_container',
      value: 0,
      currency: 'EUR',
      taxable: false,
    })) || [];
  }

  private static mapOptionsFromApi(options: DraftQuoteOptionDto[]): any[] {
    return options.map(option => ({
      id: option.optionId,
      name: option.label,
      description: '',
      validUntil: option.validUntil,
      marginType: 'percentage',
      marginValue: 0,
      totals: {
        haulageTotalAmount: option.totals?.haulageTotal || 0,
        seafreightTotalAmount: option.totals?.seafreightBaseTotal || 0,
        miscTotalAmount: option.totals?.servicesTotal || 0,
        subTotal: option.totals?.grandTotal || 0,
        marginAmount: 0,
        finalTotal: option.totals?.grandTotal || 0,
        currency: option.currency || 'EUR',
      },
      createdAt: new Date().toISOString(),
    }));
  }

  private static mapOptionContainers(option: any): any[] {
    return option.containers?.map((c: any) => ({
      containerType: c.type || c.containerType,
      quantity: c.quantity || 1,
    })) || [];
  }

  private static mapOptionPlanning(option: any): any {
    return {
      emptyPickupDate: '',
      vgmDate: '',
      siDate: '',
      customsDate: '',
      fullGateInDate: '',
      etd: '',
      eta: '',
    };
  }

  private static mapOptionSeafreight(option: any): any {
    return {
      id: '',
      carrier: '',
      service: '',
      rate: [],
      surcharges: [],
    };
  }

  private static mapOptionHaulages(option: any): any[] {
    return [];
  }

  private static mapOptionServices(option: any): any[] {
    return [];
  }

  private static mapOptionTotals(option: any): any {
    return {
      perContainer: {},
      byContainerType: {},
      seafreightBaseTotal: 0,
      haulageTotal: 0,
      servicesTotal: 0,
      surchargesTotal: 0,
      grandTotal: option.totals?.finalTotal || 0,
    };
  }

  private static mapOptionTerms(option: any): any {
    return {
      depositPolicy: {
        type: 'percentage',
        value: 0,
      },
      generalConditionsId: '',
    };
  }
}

/**
 * Fonctions utilitaires pour la compatibilité
 */
export const DraftQuoteApiUtils = {
  /**
   * Vérifie si un DraftQuote est compatible avec l'API
   */
  isApiCompatible: (draftQuote: DraftQuote): boolean => {
    return !!(draftQuote.requestQuoteId && draftQuote.step1);
  },

  /**
   * Valide les données avant envoi à l'API
   */
  validateForApi: (draftQuote: DraftQuote): string[] => {
    const errors: string[] = [];
    
    if (!draftQuote.requestQuoteId) {
      errors.push('RequestQuoteId is required');
    }
    
    if (!draftQuote.step1?.customer?.companyName) {
      errors.push('Customer company name is required');
    }
    
    if (!draftQuote.step1?.cityFrom?.name) {
      errors.push('Origin city is required');
    }
    
    if (!draftQuote.step1?.cityTo?.name) {
      errors.push('Destination city is required');
    }
    
    return errors;
  },

  /**
   * Crée un DraftQuote minimal compatible avec l'API
   */
  createMinimalApiCompatible: (requestQuoteId: string, emailUser: string): DraftQuote => {
    return {
      id: undefined,
      requestQuoteId,
      emailUser,
      clientNumber: '',
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
        portTo: { portId: 0, portName: '', country: '' },
      },
      step2: { selectedServices: [], selected: [] },
      step3: { containers: [], summary: { totalContainers: 0, totalTEU: 0, containerTypes: [] }, route: { origin: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } }, destination: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } } }, selectedContainers: { list: [] } },
      step4: { selection: { offerId: '', haulierId: 0, haulierName: '', tariff: { unitPrice: 0, currency: 'EUR', freeTime: 0 }, route: { pickup: { company: '', city: '', country: '' }, delivery: { portId: 0, portName: '', country: '' } }, validity: { validUntil: '' } }, calculation: { quantity: 1, unitPrice: 0, subtotal: 0, currency: 'EUR' } },
      step5: { selections: [], summary: { totalSelections: 0, totalContainers: 0, totalAmount: 0, currency: 'EUR', selectedCarriers: [], containerTypes: [], preferredSelectionId: '' } },
      step6: { selections: [], summary: { totalSelections: 0, totalAmount: 0, currency: 'EUR', categories: [] } },
      step7: { finalization: { optionName: '', optionDescription: '', marginPercentage: 0, marginAmount: 0, marginType: 'percentage', isReadyToGenerate: false, generatedAt: '' }, validation: { allStepsValid: false, errors: [], warnings: [] }, pricingSummary: { baseTotal: 0, marginAmount: 0, finalTotal: 0, currency: 'EUR', breakdown: { haulageAmount: 0, seafreightAmount: 0, miscellaneousAmount: 0, totalBeforeMargin: 0, components: [] } } },
      totals: { haulage: 0, seafreight: 0, miscellaneous: 0, subtotal: 0, grandTotal: 0, currency: 'EUR', totalTEU: 0 },
      savedOptions: [],
      selectedHaulage: undefined,
      selectedSeafreights: [],
      selectedMiscellaneous: [],
      selectedContainers: {},
      marginType: 'percent',
      marginValue: 0,
      totalPrice: 0,
      seafreightTotal: 0,
      haulageTotal: 0,
      miscTotal: 0,
      totalTEU: 0,
      seafreightQuantities: {},
      miscQuantities: {},
      surchargeQuantities: {},
    };
  },
};
