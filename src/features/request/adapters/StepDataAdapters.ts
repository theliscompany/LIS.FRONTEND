/**
 * Adaptateurs de données pour chaque Step du DraftQuote
 * Normalise l'accès aux données selon la structure DraftQuote
 */

import { DraftQuote, Step1, Step2, Step3, Step4, Step5, Step6, Step7 } from '../types/DraftQuote';

// ===== STEP 1 ADAPTER =====
export interface Step1Data {
  customer: {
    contactId: number;
    contactName: string;
    companyName: string;
    email: string;
  };
  cityFrom: { name: string; country: string };
  cityTo: { name: string; country: string };
  productName: { productId: number; productName: string };
  incotermName: string;
  comment: string;
  status: string;
  assignee: string;
  // Données de route
  route: {
    origin: { city: { name: string; country: string }; port: { portId: number; portName: string; country: string } };
    destination: { city: { name: string; country: string }; port: { portId: number; portName: string; country: string } };
  };
  // Données de cargo
  cargo: {
    product: { productId: number; productName: string };
    incoterm: string;
  };
  // Métadonnées
  metadata: { comment: string };
}

export function getStep1Data(draftQuote: DraftQuote): Step1Data {
  // ✅ DEBUG: Log de la structure complète pour diagnostic
  console.log('🔍 [ADAPTER] getStep1Data - Structure complète du draftQuote:', {
    draftQuote,
    step1: draftQuote.step1,
    customer: draftQuote.customer,
    shipment: draftQuote.shipment,
    wizard: draftQuote.wizard
  });

  const step1 = draftQuote.step1;
  
  // ✅ CORRECTION: Utiliser les données de la structure réelle du DraftQuote
  // Les données sont dans customer, shipment, etc. plutôt que dans step1
  const customer = draftQuote.customer || step1?.customer || {};
  const shipment = draftQuote.shipment || step1?.shipment || {};
  const wizard = draftQuote.wizard || step1?.wizard || {};
  
  return {
    customer: {
      contactId: customer.contactId || 0,
      contactName: customer.contactName || customer.name || customer.contactPerson?.fullName || 
                  draftQuote.customerName || draftQuote.contactName || '',
      companyName: customer.companyName || customer.company || customer.contactPerson?.company || 
                   draftQuote.companyName || draftQuote.company || '',
      email: customer.email || customer.contactPerson?.email || draftQuote.email || ''
    },
    cityFrom: {
      name: shipment.origin?.name || shipment.origin?.city || shipment.origin?.location || 
            step1?.cityFrom?.name || step1?.route?.origin?.city?.name || 
            draftQuote.cityFrom?.name || draftQuote.fromCity || '',
      country: shipment.origin?.country || step1?.cityFrom?.country || step1?.route?.origin?.city?.country || 
               draftQuote.cityFrom?.country || draftQuote.fromCountry || ''
    },
    cityTo: {
      name: shipment.destination?.name || shipment.destination?.city || shipment.destination?.location || 
            step1?.cityTo?.name || step1?.route?.destination?.city?.name || 
            draftQuote.cityTo?.name || draftQuote.toCity || '',
      country: shipment.destination?.country || step1?.cityTo?.country || step1?.route?.destination?.city?.country || 
               draftQuote.cityTo?.country || draftQuote.toCountry || ''
    },
    productName: {
      productId: shipment.commodity?.productId || step1?.productName?.productId || 0,
      productName: shipment.commodity || shipment.commodityName || shipment.commodityName || 
                  step1?.productName?.productName || draftQuote.productName || draftQuote.product || ''
    },
    incotermName: draftQuote.incoterm || shipment.incoterm || step1?.incotermName || draftQuote.incotermName || '',
    comment: wizard.comment || step1?.comment || draftQuote.comment || draftQuote.description || '',
    status: step1?.status || 'NEW',
    assignee: step1?.assignee || '',
    route: {
      origin: {
        city: {
          name: shipment.origin?.name || shipment.origin?.city || step1?.route?.origin?.city?.name || step1?.cityFrom?.name || '',
          country: shipment.origin?.country || step1?.route?.origin?.city?.country || step1?.cityFrom?.country || ''
        },
        port: {
          portId: shipment.origin?.portId || step1?.route?.origin?.port?.portId || 0,
          portName: shipment.origin?.portName || step1?.route?.origin?.port?.portName || '',
          country: shipment.origin?.country || step1?.route?.origin?.port?.country || step1?.cityFrom?.country || ''
        }
      },
      destination: {
        city: {
          name: shipment.destination?.name || shipment.destination?.city || step1?.route?.destination?.city?.name || step1?.cityTo?.name || '',
          country: shipment.destination?.country || step1?.route?.destination?.city?.country || step1?.cityTo?.country || ''
        },
        port: {
          portId: shipment.destination?.portId || step1?.route?.destination?.port?.portId || 0,
          portName: shipment.destination?.portName || step1?.route?.destination?.port?.portName || '',
          country: shipment.destination?.country || step1?.route?.destination?.port?.country || step1?.cityTo?.country || ''
        }
      }
    },
    cargo: {
      product: {
        productId: shipment.commodity?.productId || step1?.cargo?.product?.productId || step1?.productName?.productId || 0,
        productName: shipment.commodity || shipment.commodityName || step1?.cargo?.product?.productName || step1?.productName?.productName || ''
      },
      incoterm: draftQuote.incoterm || shipment.incoterm || step1?.cargo?.incoterm || step1?.incotermName || ''
    },
    metadata: {
      comment: wizard.comment || step1?.metadata?.comment || step1?.comment || ''
    }
  };
}

// ===== STEP 2 ADAPTER =====
export interface Step2Data {
  selectedServices: Array<{
    serviceId: number;
    serviceName: string;
    category: string;
    usagePercent: number;
  }>;
  selected: Array<{
    serviceId: number;
    serviceName: string;
    category: string;
    usagePercent: number;
  }>;
}

export function getStep2Data(draftQuote: DraftQuote): Step2Data {
  const step2 = draftQuote.step2;
  
  // Normaliser les services sélectionnés
  const selectedServices = step2?.selectedServices || [];
  const selected = step2?.selected || [];
  
  // Utiliser selectedServices en priorité, sinon selected
  const services = selectedServices.length > 0 ? selectedServices : selected;
  
  return {
    selectedServices: services.map(service => ({
      serviceId: service.serviceId || 0,
      serviceName: service.serviceName || '',
      category: service.category || '',
      usagePercent: service.usagePercent || 0
    })),
    selected: services.map(service => ({
      serviceId: service.serviceId || 0,
      serviceName: service.serviceName || '',
      category: service.category || '',
      usagePercent: service.usagePercent || 0
    }))
  };
}

// ===== STEP 3 ADAPTER =====
export interface Step3Data {
  containers: Array<{
    id: string;
    type: string;
    quantity: number;
    teu: number;
  }>;
  summary: {
    totalContainers: number;
    totalTEU: number;
    containerTypes: string[];
  };
  selectedContainers: {
    list: Array<{
      id: string;
      type: string;
      quantity: number;
      teu: number;
    }>;
  };
}

export function getStep3Data(draftQuote: DraftQuote): Step3Data {
  const step3 = draftQuote.step3;
  
  return {
    containers: (step3?.containers || []).map(container => ({
      id: container.id || '',
      type: container.type || '',
      quantity: container.quantity || 0,
      teu: container.teu || 0
    })),
    summary: {
      totalContainers: step3?.summary?.totalContainers || 0,
      totalTEU: step3?.summary?.totalTEU || 0,
      containerTypes: step3?.summary?.containerTypes || []
    },
    selectedContainers: {
      list: (step3?.selectedContainers?.list || []).map(container => ({
        id: container.id || '',
        type: container.type || '',
        quantity: container.quantity || 0,
        teu: container.teu || 0
      }))
    }
  };
}

// ===== STEP 4 ADAPTER =====
export interface Step4Data {
  selection: {
    offerId: string;
    haulierId: number;
    haulierName: string;
    tariff: {
      unitPrice: number;
      currency: string;
      freeTime: number;
    };
    route: {
      pickup: {
        company: string;
        city: string;
        country: string;
      };
      delivery: {
        portId: number;
        portName: string;
        country: string;
      };
    };
    validity: {
      validUntil: string;
    };
    overtimeQuantity?: number;
    overtimePrice?: number;
  } | null;
  calculation: {
    quantity: number;
    unitPrice: number;
    subtotal: number;
    overtimeAmount?: number;
    totalAmount?: number;
    currency: string;
  };
}

export function getStep4Data(draftQuote: DraftQuote): Step4Data {
  const step4 = draftQuote.step4;
  
  return {
    selection: step4?.selection ? {
      offerId: step4.selection.offerId || '',
      haulierId: step4.selection.haulierId || 0,
      haulierName: step4.selection.haulierName || '',
      tariff: {
        unitPrice: step4.selection.tariff?.unitPrice || 0,
        currency: step4.selection.tariff?.currency || '',
        freeTime: step4.selection.tariff?.freeTime || 0
      },
      route: {
        pickup: {
          company: step4.selection.route?.pickup?.company || '',
          city: step4.selection.route?.pickup?.city || '',
          country: step4.selection.route?.pickup?.country || ''
        },
        delivery: {
          portId: step4.selection.route?.delivery?.portId || 0,
          portName: step4.selection.route?.delivery?.portName || '',
          country: step4.selection.route?.delivery?.country || ''
        }
      },
      validity: {
        validUntil: step4.selection.validity?.validUntil || ''
      },
      overtimeQuantity: step4.selection.overtimeQuantity,
      overtimePrice: step4.selection.overtimePrice
    } : null,
    calculation: {
      quantity: step4?.calculation?.quantity || 0,
      unitPrice: step4?.calculation?.unitPrice || 0,
      subtotal: step4?.calculation?.subtotal || 0,
      overtimeAmount: step4?.calculation?.overtimeAmount,
      totalAmount: step4?.calculation?.totalAmount,
      currency: step4?.calculation?.currency || ''
    }
  };
}

// ===== STEP 5 ADAPTER =====
export interface Step5Data {
  selections: Array<{
    id: string;
    seafreightId: string;
    quoteNumber: string;
    carrier: {
      carrierId: number;
      carrierName: string;
      agentName: string;
    };
    route: {
      departurePort: {
        unlocode: string;
        portName: string;
        country: string;
      };
      destinationPort: {
        unlocode: string;
        portName: string;
        country: string;
      };
      transitDays: number;
      frequency: string;
      incoterm: string;
    };
    container: {
      containerType: string;
      isReefer: boolean;
      quantity: number;
      volumeM3: number;
      weightKg: number;
      unitPrice: number;
      subtotal: number;
    };
    charges: {
      basePrice: number;
      currency: string;
      surcharges: Array<{
        name: string;
        value: number;
        type: string;
        description: string;
        isMandatory: boolean;
        currency: string;
      }>;
      totalPrice: number;
    };
    service: {
      deliveryTerms: string;
      createdBy: string;
      createdDate: string;
    };
    validity: {
      startDate: string;
      endDate: string;
      isExpired: boolean;
      daysRemaining: number;
    };
    remarks: string;
    isSelected: boolean;
    selectedAt: string;
  }>;
  summary: {
    totalSelections: number;
    totalContainers: number;
    totalAmount: number;
    currency: string;
    selectedCarriers: string[];
    containerTypes: string[];
    preferredSelectionId: string;
  };
}

export function getStep5Data(draftQuote: DraftQuote): Step5Data {
  const step5 = draftQuote.step5;
  
  return {
    selections: (step5?.selections || []).map(selection => ({
      id: selection.id || '',
      seafreightId: selection.seafreightId || '',
      quoteNumber: selection.quoteNumber || '',
      carrier: {
        carrierId: selection.carrier?.carrierId || 0,
        carrierName: selection.carrier?.carrierName || '',
        agentName: selection.carrier?.agentName || ''
      },
      route: {
        departurePort: {
          unlocode: selection.route?.departurePort?.unlocode || '',
          portName: selection.route?.departurePort?.portName || '',
          country: selection.route?.departurePort?.country || ''
        },
        destinationPort: {
          unlocode: selection.route?.destinationPort?.unlocode || '',
          portName: selection.route?.destinationPort?.portName || '',
          country: selection.route?.destinationPort?.country || ''
        },
        transitDays: selection.route?.transitDays || 0,
        frequency: selection.route?.frequency || '',
        incoterm: selection.route?.incoterm || ''
      },
      container: {
        containerType: selection.container?.containerType || '',
        isReefer: selection.container?.isReefer || false,
        quantity: selection.container?.quantity || 0,
        volumeM3: selection.container?.volumeM3 || 0,
        weightKg: selection.container?.weightKg || 0,
        unitPrice: selection.container?.unitPrice || 0,
        subtotal: selection.container?.subtotal || 0
      },
      charges: {
        basePrice: selection.charges?.basePrice || 0,
        currency: selection.charges?.currency || '',
        surcharges: (selection.charges?.surcharges || []).map(surcharge => ({
          name: surcharge.name || '',
          value: surcharge.value || 0,
          type: surcharge.type || '',
          description: surcharge.description || '',
          isMandatory: surcharge.isMandatory || false,
          currency: surcharge.currency || ''
        })),
        totalPrice: selection.charges?.totalPrice || 0
      },
      service: {
        deliveryTerms: selection.service?.deliveryTerms || '',
        createdBy: selection.service?.createdBy || '',
        createdDate: selection.service?.createdDate || ''
      },
      validity: {
        startDate: selection.validity?.startDate || '',
        endDate: selection.validity?.endDate || '',
        isExpired: selection.validity?.isExpired || false,
        daysRemaining: selection.validity?.daysRemaining || 0
      },
      remarks: selection.remarks || '',
      isSelected: selection.isSelected || false,
      selectedAt: selection.selectedAt || ''
    })),
    summary: {
      totalSelections: step5?.summary?.totalSelections || 0,
      totalContainers: step5?.summary?.totalContainers || 0,
      totalAmount: step5?.summary?.totalAmount || 0,
      currency: step5?.summary?.currency || '',
      selectedCarriers: step5?.summary?.selectedCarriers || [],
      containerTypes: step5?.summary?.containerTypes || [],
      preferredSelectionId: step5?.summary?.preferredSelectionId || ''
    }
  };
}

// ===== STEP 6 ADAPTER =====
export interface Step6Data {
  selections: Array<{
    id: string;
    service: {
      serviceId: number;
      serviceName: string;
      category: string;
    };
    supplier: {
      supplierName: string;
    };
    pricing: {
      unitPrice: number;
      quantity: number;
      subtotal: number;
      currency: string;
    };
    validity: {
      validUntil: string;
    };
  }>;
  summary: {
    totalSelections: number;
    totalAmount: number;
    currency: string;
    categories: string[];
  };
}

export function getStep6Data(draftQuote: DraftQuote): Step6Data {
  const step6 = draftQuote.step6;
  
  return {
    selections: (step6?.selections || []).map(selection => ({
      id: selection.id || '',
      service: {
        serviceId: selection.service?.serviceId || 0,
        serviceName: selection.service?.serviceName || '',
        category: selection.service?.category || ''
      },
      supplier: {
        supplierName: selection.supplier?.supplierName || ''
      },
      pricing: {
        unitPrice: selection.pricing?.unitPrice || 0,
        quantity: selection.pricing?.quantity || 0,
        subtotal: selection.pricing?.subtotal || 0,
        currency: selection.pricing?.currency || ''
      },
      validity: {
        validUntil: selection.validity?.validUntil || ''
      }
    })),
    summary: {
      totalSelections: step6?.summary?.totalSelections || 0,
      totalAmount: step6?.summary?.totalAmount || 0,
      currency: step6?.summary?.currency || '',
      categories: step6?.summary?.categories || []
    }
  };
}

// ===== STEP 7 ADAPTER =====
export interface Step7Data {
  finalization: {
    optionName: string;
    optionDescription: string;
    marginPercentage: number;
    marginAmount: number;
    marginType: string;
    isReadyToGenerate: boolean;
    generatedAt: string;
  };
  validation: {
    allStepsValid: boolean;
    errors: Array<{
      stepNumber: number;
      fieldName: string;
      errorMessage: string;
      errorCode: string;
    }>;
    warnings: Array<{
      stepNumber: number;
      fieldName: string;
      warningMessage: string;
      warningCode: string;
    }>;
  };
  pricingSummary: {
    baseTotal: number;
    marginAmount: number;
    finalTotal: number;
    currency: string;
    breakdown: {
      haulageAmount: number;
      seafreightAmount: number;
      miscellaneousAmount: number;
      totalBeforeMargin: number;
      components: Array<{
        name: string;
        category: string;
        amount: number;
        currency: string;
        description: string;
      }>;
    };
  };
}

export function getStep7Data(draftQuote: DraftQuote): Step7Data {
  const step7 = draftQuote.step7;
  
  return {
    finalization: {
      optionName: step7?.finalization?.optionName || '',
      optionDescription: step7?.finalization?.optionDescription || '',
      marginPercentage: step7?.finalization?.marginPercentage || 0,
      marginAmount: step7?.finalization?.marginAmount || 0,
      marginType: step7?.finalization?.marginType || 'percentage',
      isReadyToGenerate: step7?.finalization?.isReadyToGenerate || false,
      generatedAt: step7?.finalization?.generatedAt || ''
    },
    validation: {
      allStepsValid: step7?.validation?.allStepsValid || false,
      errors: (step7?.validation?.errors || []).map(error => ({
        stepNumber: error.stepNumber || 0,
        fieldName: error.fieldName || '',
        errorMessage: error.errorMessage || '',
        errorCode: error.errorCode || ''
      })),
      warnings: (step7?.validation?.warnings || []).map(warning => ({
        stepNumber: warning.stepNumber || 0,
        fieldName: warning.fieldName || '',
        warningMessage: warning.warningMessage || '',
        warningCode: warning.warningCode || ''
      }))
    },
    pricingSummary: {
      baseTotal: step7?.pricingSummary?.baseTotal || 0,
      marginAmount: step7?.pricingSummary?.marginAmount || 0,
      finalTotal: step7?.pricingSummary?.finalTotal || 0,
      currency: step7?.pricingSummary?.currency || '',
      breakdown: {
        haulageAmount: step7?.pricingSummary?.breakdown?.haulageAmount || 0,
        seafreightAmount: step7?.pricingSummary?.breakdown?.seafreightAmount || 0,
        miscellaneousAmount: step7?.pricingSummary?.breakdown?.miscellaneousAmount || 0,
        totalBeforeMargin: step7?.pricingSummary?.breakdown?.totalBeforeMargin || 0,
        components: (step7?.pricingSummary?.breakdown?.components || []).map(component => ({
          name: component.name || '',
          category: component.category || '',
          amount: component.amount || 0,
          currency: component.currency || '',
          description: component.description || ''
        }))
      }
    }
  };
}

// ===== TOTALS ADAPTER =====
export interface TotalsData {
  haulage: number;
  seafreight: number;
  miscellaneous: number;
  subtotal: number;
  grandTotal: number;
  currency: string;
  totalTEU: number;
}

export function getTotalsData(draftQuote: DraftQuote): TotalsData {
  return {
    haulage: draftQuote.totals?.haulage || 0,
    seafreight: draftQuote.totals?.seafreight || 0,
    miscellaneous: draftQuote.totals?.miscellaneous || 0,
    subtotal: draftQuote.totals?.subtotal || 0,
    grandTotal: draftQuote.totals?.grandTotal || 0,
    currency: draftQuote.totals?.currency || '',
    totalTEU: draftQuote.totals?.totalTEU || 0
  };
}

// ===== UTILITAIRE POUR TOUS LES STEPS =====
export function getAllStepsData(draftQuote: DraftQuote) {
  return {
    step1: getStep1Data(draftQuote),
    step2: getStep2Data(draftQuote),
    step3: getStep3Data(draftQuote),
    step4: getStep4Data(draftQuote),
    step5: getStep5Data(draftQuote),
    step6: getStep6Data(draftQuote),
    step7: getStep7Data(draftQuote),
    totals: getTotalsData(draftQuote)
  };
}
