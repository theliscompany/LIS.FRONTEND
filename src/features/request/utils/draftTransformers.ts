/**
 * Utility functions for transforming draft data between different formats
 */

import { DraftQuote } from '@features/request/types/DraftQuote';

/**
 * Transform OptimizedDraftData to DraftQuote format
 */
export const transformOptimizedDraftData = (optimizedData: any): Partial<DraftQuote> => {
  if (!optimizedData) return {};

  const { Steps, Totals, ...otherData } = optimizedData;
  
  return {
    // Transform step data
    step1: transformStep1Data(Steps?.Step1 || Steps?.step1),
    step2: transformStep2Data(Steps?.Step2 || Steps?.step2),
    step3: transformStep3Data(Steps?.Step3 || Steps?.step3),
    step4: transformStep4Data(Steps?.Step4 || Steps?.step4),
    step5: transformStep5Data(Steps?.Step5 || Steps?.step5),
    step6: transformStep6Data(Steps?.Step6 || Steps?.step6),
    
    // Transform totals
    totalTEU: Totals?.TotalTEU ? parseFloat(Totals.TotalTEU) : 0,
    
    // Other data
    ...otherData
  };
};

/**
 * Transform Step1 data
 */
export const transformStep1Data = (step1Data: any) => {
  if (!step1Data) return {};

  return {
    customer: step1Data.Customer ? {
      contactId: step1Data.Customer.ContactId || step1Data.Customer.contactId || 0,
      contactName: step1Data.Customer.ContactName || step1Data.Customer.contactName || '',
      companyName: step1Data.Customer.CompanyName || step1Data.Customer.companyName || '',
      email: step1Data.Customer.Email || step1Data.Customer.email || ''
    } : undefined,
    
    cityFrom: step1Data.Route?.Origin?.City ? {
      cityName: step1Data.Route.Origin.City.CityName || step1Data.Route.Origin.City.cityName || '',
      name: step1Data.Route.Origin.City.CityName || step1Data.Route.Origin.City.cityName || '',
      country: step1Data.Route.Origin.City.Country || step1Data.Route.Origin.City.country || ''
    } : undefined,
    
    cityTo: step1Data.Route?.Destination?.City ? {
      cityName: step1Data.Route.Destination.City.CityName || step1Data.Route.Destination.City.cityName || '',
      name: step1Data.Route.Destination.City.CityName || step1Data.Route.Destination.City.cityName || '',
      country: step1Data.Route.Destination.City.Country || step1Data.Route.Destination.City.country || ''
    } : undefined,
    
    portFrom: step1Data.Route?.Origin?.Port ? {
      portId: step1Data.Route.Origin.Port.PortId || step1Data.Route.Origin.Port.portId || 0,
      portName: step1Data.Route.Origin.Port.PortName || step1Data.Route.Origin.Port.portName || '',
      country: step1Data.Route.Origin.Port.Country || step1Data.Route.Origin.Port.country || ''
    } : undefined,
    
    portTo: step1Data.Route?.Destination?.Port ? {
      portId: step1Data.Route.Destination.Port.PortId || step1Data.Route.Destination.Port.portId || 0,
      portName: step1Data.Route.Destination.Port.PortName || step1Data.Route.Destination.Port.portName || '',
      country: step1Data.Route.Destination.Port.Country || step1Data.Route.Destination.Port.country || ''
    } : undefined,
    
    productName: step1Data.Cargo?.Product ? {
      productId: step1Data.Cargo.Product.ProductId || step1Data.Cargo.Product.productId || 0,
      productName: step1Data.Cargo.Product.ProductName || step1Data.Cargo.Product.productName || ''
    } : undefined,
    
    incotermName: step1Data.Incoterm || step1Data.incoterm || '',
    comment: step1Data.Comment || step1Data.comment || '',
    status: step1Data.Status || step1Data.status || 'NEW',
    assignee: step1Data.Assignee || step1Data.assignee || ''
  };
};

/**
 * Transform Step2 data
 */
export const transformStep2Data = (step2Data: any) => {
  if (!step2Data) return {};

  return {
    selected: step2Data.Selected || step2Data.selected || [],
    selectedServices: step2Data.SelectedServices || step2Data.selectedServices || [],
    marginType: step2Data.MarginType || step2Data.marginType || 'percent',
    marginValue: step2Data.MarginValue || step2Data.marginValue || 0
  };
};

/**
 * Transform Step3 data
 */
export const transformStep3Data = (step3Data: any) => {
  if (!step3Data) return {};

  return {
    containers: step3Data.Containers || step3Data.containers || [],
    selectedContainers: {
      list: step3Data.Containers || step3Data.containers || []
    },
    summary: {
      totalContainers: step3Data.Summary?.TotalContainers || step3Data.Summary?.totalContainers || 0,
      totalTEU: step3Data.Summary?.TotalTEU || step3Data.Summary?.totalTEU || 0,
      totalWeight: step3Data.Summary?.TotalWeight || step3Data.Summary?.totalWeight || 0,
      totalVolume: step3Data.Summary?.TotalVolume || step3Data.Summary?.totalVolume || 0
    },
    route: {
      origin: step3Data.Route?.Origin || step3Data.Route?.origin,
      destination: step3Data.Route?.Destination || step3Data.Route?.destination
    }
  };
};

/**
 * Transform Step4 data
 */
export const transformStep4Data = (step4Data: any) => {
  if (!step4Data) return {};

  const selection = step4Data.Selection || step4Data.selection;
  if (!selection) return {};

  return {
    selection: {
      offerId: selection.OfferId || selection.offerId || null,
      haulierId: selection.HaulierId || selection.haulierId || 0,
      haulierName: selection.HaulierName || selection.haulierName || '',
      unitTariff: parseFloat(selection.Tariff?.UnitPrice || selection.Tariff?.unitPrice || '0'),
      currency: selection.Tariff?.Currency || selection.Tariff?.currency || 'EUR',
      freeTime: selection.Tariff?.FreeTime || selection.Tariff?.freeTime || 0,
      route: {
        pickup: {
          company: selection.Route?.Pickup?.Company || selection.Route?.pickup?.company || '',
          city: selection.Route?.Pickup?.City || selection.Route?.pickup?.city || '',
          country: selection.Route?.Pickup?.Country || selection.Route?.pickup?.country || ''
        },
        delivery: {
          portId: selection.Route?.Delivery?.PortId || selection.Route?.delivery?.portId || 0,
          portName: selection.Route?.Delivery?.PortName || selection.Route?.delivery?.portName || '',
          country: selection.Route?.Delivery?.Country || selection.Route?.delivery?.country || ''
        }
      },
      validity: {
        validUntil: selection.Validity?.ValidUntil || selection.Validity?.validUntil || new Date().toISOString()
      }
    },
    calculation: {
      quantity: 1,
      unitPrice: parseFloat(selection.Tariff?.UnitPrice || selection.Tariff?.unitPrice || '0'),
      subtotal: parseFloat(selection.Tariff?.UnitPrice || selection.Tariff?.unitPrice || '0'),
      currency: selection.Tariff?.Currency || selection.Tariff?.currency || 'EUR',
      basePrice: parseFloat(selection.Tariff?.UnitPrice || selection.Tariff?.unitPrice || '0'),
      surchargesTotal: 0,
      surchargesCount: 0,
      priceSource: 'API_DIRECT'
    },
    completed: true
  };
};

/**
 * Transform Step5 data
 */
export const transformStep5Data = (step5Data: any) => {
  if (!step5Data) return {};

  const selections = step5Data.Selections || step5Data.selections;
  if (!Array.isArray(selections)) return { selections: [], summary: createDefaultStep5Summary() };

  return {
    selections: selections.map((sel: any) => ({
      id: sel._id || sel.Id || sel.id || sel.SeafreightId || sel.seafreightId,
      seafreightId: sel.SeafreightId || sel.seafreightId || sel._id || sel.Id || sel.id,
      carrier: {
        name: sel.Carrier?.CarrierName || sel.Carrier?.carrierName || sel.carrierName || '',
        agentName: sel.Carrier?.AgentName || sel.Carrier?.agentName || sel.agentName || ''
      },
      route: {
        departurePort: sel.Route?.DeparturePort || sel.Route?.departurePort || null,
        destinationPort: sel.Route?.DestinationPort || sel.Route?.destinationPort || null,
        transitDays: sel.Route?.TransitDays || sel.Route?.transitDays || sel.transitDays || 0,
        frequency: sel.Route?.Frequency || sel.Route?.frequency || sel.frequency || ''
      },
      container: {
        containerType: sel.Container?.ContainerType || sel.Container?.containerType || sel.containerType || '',
        isReefer: sel.Container?.IsReefer || sel.Container?.isReefer || false,
        quantity: sel.Container?.Quantity || sel.Container?.quantity || 1,
        volumeM3: sel.Container?.VolumeM3 || sel.Container?.volumeM3 || 0,
        weightKg: sel.Container?.WeightKg || sel.Container?.weightKg || 0,
        unitPrice: sel.Container?.UnitPrice || sel.Container?.unitPrice || 0,
        subtotal: sel.Container?.Subtotal || sel.Container?.subtotal || 0
      },
      charges: {
        basePrice: sel.Charges?.BasePrice || sel.Charges?.basePrice || sel.basePrice || 0,
        currency: sel.Charges?.Currency || sel.Charges?.currency || sel.currency || 'EUR',
        surcharges: sel.Charges?.Surcharges || sel.Charges?.surcharges || sel.surcharges || [],
        totalPrice: sel.Charges?.TotalPrice || sel.Charges?.totalPrice || sel.totalPrice || 0
      },
      service: {
        deliveryTerms: sel.Service?.DeliveryTerms || sel.Service?.deliveryTerms || '',
        createdBy: sel.Service?.CreatedBy || sel.Service?.createdBy || '',
        createdDate: sel.Service?.CreatedDate || sel.Service?.createdDate || new Date()
      },
      validity: {
        startDate: sel.Validity?.StartDate || sel.Validity?.startDate || new Date(),
        endDate: sel.Validity?.EndDate || sel.Validity?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      remarks: sel.Remarks || sel.remarks || sel.comment || '',
      isSelected: sel.IsSelected || sel.isSelected || true,
      selectedAt: sel.SelectedAt || sel.selectedAt || new Date()
    })),
    summary: {
      totalSelections: selections.length,
      totalContainers: selections.length,
      totalAmount: step5Data.Summary?.TotalAmount || 0,
      currency: 'EUR',
      selectedCarriers: selections.map((s: any) => s.Carrier?.CarrierName || s.Carrier?.carrierName || s.carrierName || '').filter(Boolean),
      containerTypes: selections.map((s: any) => s.Container?.ContainerType || s.Container?.containerType || s.containerType || '').filter(Boolean),
      preferredSelectionId: selections[0]?.id || ''
    }
  };
};

/**
 * Transform Step6 data
 */
export const transformStep6Data = (step6Data: any) => {
  if (!step6Data) return {};

  const selections = step6Data.selections || step6Data.Selections;
  if (!Array.isArray(selections)) return { selections: [], summary: createDefaultStep6Summary() };

  return {
    selections: selections.map((sel: any) => ({
      id: sel.id || `misc-${sel.service?.serviceId || sel.serviceId}`,
      service: {
        serviceId: sel.service?.serviceId || sel.serviceId || 0,
        serviceName: sel.service?.serviceName || sel.serviceName || '',
        category: sel.service?.category || sel.category || ''
      },
      supplier: {
        supplierName: sel.supplier?.supplierName || sel.serviceProviderName || ''
      },
      pricing: {
        unitPrice: sel.pricing?.unitPrice || sel.pricing?.basePrice || 0,
        quantity: sel.pricing?.quantity || 1,
        subtotal: sel.pricing?.subtotal || 0,
        currency: sel.pricing?.currency || 'EUR'
      },
      validity: {
        validUntil: sel.validity?.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      remarks: sel.remarks || '',
      isSelected: sel.isSelected || true,
      selectedAt: sel.selectedAt || new Date()
    })),
    summary: {
      totalSelections: selections.length,
      totalAmount: step6Data.Summary?.TotalAmount || 0,
      currency: 'EUR',
      categories: selections.map((s: any) => s.service?.category || s.category || '').filter(Boolean)
    }
  };
};

/**
 * Create default Step5 summary
 */
const createDefaultStep5Summary = () => ({
  totalSelections: 0,
  totalContainers: 0,
  totalAmount: 0,
  currency: 'EUR',
  selectedCarriers: [],
  containerTypes: [],
  preferredSelectionId: ''
});

/**
 * Create default Step6 summary
 */
const createDefaultStep6Summary = () => ({
  totalSelections: 0,
  totalAmount: 0,
  currency: 'EUR',
  categories: []
});

/**
 * Create initial draft quote structure
 */
export const createInitialDraftQuote = (currentUserEmail?: string, existingRequestQuoteId?: string): DraftQuote => {
  return {
    id: '',
    step1: {
      customer: { contactId: 0, contactName: '', companyName: '', email: '' },
      cityFrom: { cityName: '', name: '', country: '' },
      cityTo: { cityName: '', name: '', country: '' },
      portFrom: { portId: 0, portName: '', country: '' },
      portTo: { portId: 0, portName: '', country: '' },
      productName: { productId: 0, productName: '' },
      status: 'NEW',
      assignee: '',
      comment: '',
      incotermName: '',
      pickupLocation: null,
      deliveryLocation: null
    },
    step2: {
      selected: [],
      selectedServices: [],
      marginType: 'percent',
      marginValue: 0
    },
    step3: {
      containers: [],
      selectedContainers: { list: [] },
      summary: { totalContainers: 0, totalTEU: 0, totalWeight: 0, totalVolume: 0 },
      route: { origin: null, destination: null }
    },
    step4: {
      selection: null,
      calculation: null,
      completed: false
    },
    step5: {
      selections: [],
      summary: createDefaultStep5Summary()
    },
    step6: {
      selections: [],
      summary: createDefaultStep6Summary()
    },
    selectedHaulage: null,
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
    haulageQuantity: 0,
    seafreightQuantities: {},
    miscQuantities: {},
    surchargeQuantities: {},
    savedOptions: [],
    requestQuoteId: existingRequestQuoteId || undefined,
    createdBy: currentUserEmail || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};
