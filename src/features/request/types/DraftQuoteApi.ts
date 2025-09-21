// ===== DRAFT QUOTE API - NOUVELLE STRUCTURE =====
// Ce fichier remplace DraftQuote.ts avec la nouvelle structure API optimisée

// ---- Types de base ----
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  zip: string;
  country: string;
}

export interface ContactPerson {
  fullName: string;
  phone: string;
  email: string;
}

export interface Customer {
  type: "company" | "individual";
  name: string;
  vat?: string;
  emails: string[];
  phones: string[];
  address: Address;
  contactPerson: ContactPerson;
}

export interface Location {
  location: string; // Code port/aéroport
  country: string;  // Code pays
}

export interface ShipmentDocs {
  requiresVGM: boolean;
  requiresBLDraftApproval: boolean;
  requiresInsurance?: boolean;
  requiresCustomsClearance?: boolean;
}

export interface ShipmentConstraints {
  minTruckLeadDays: number;
  terminalCutoffDays: number;
  customsDeadlineHours: number;
  maxTransitDays?: number;
}

export interface Shipment {
  mode: "FCL" | "LCL" | "AIR" | "ROAD";
  containerCount: number;
  containerTypes: string[];
  commodity: string;
  hsCodes: string[];
  origin: Location;
  destination: Location;
  docs: ShipmentDocs;
  constraints: ShipmentConstraints;
}

export interface Attachment {
  id: string;
  name: string;
  mime: string;
  size?: number;
  uploadedAt?: string;
}

export interface Planning {
  emptyPickupDate: string;
  vgmDate: string;
  siDate: string;
  customsDate: string;
  fullGateInDate: string;
  etd: string; // Estimated Time of Departure
  eta: string; // Estimated Time of Arrival
}

export interface SeafreightRate {
  containerType: string;
  basePrice: number;
  currency?: string;
}

export interface Surcharge {
  code: string;
  label: string;
  calc: "flat" | "percent" | "per_hour" | "per_container" | "per_shipment";
  base?: "seafreight" | "haulage" | "services";
  unit: "per_container" | "per_shipment" | "per_hour" | "per_trip";
  value: number;
  currency: string;
  taxable: boolean;
  appliesTo?: string[];
}

export interface Seafreight {
  id: string;
  carrier: string;
  service: string;
  rate: SeafreightRate[];
  surcharges: Surcharge[];
}

export interface HaulageWindows {
  load: string;
  returnDeadline: string;
}

export interface Haulage {
  id: string;
  mode: "road" | "rail" | "barge";
  from: string;
  to: string;
  windows?: HaulageWindows;
  basePrice: number;
  surcharges: Surcharge[];
}

export interface Service {
  code: string;
  label: string;
  calc: "flat" | "percent" | "per_hour" | "per_container" | "per_shipment";
  unit: "per_container" | "per_shipment" | "per_hour" | "per_trip";
  value: number;
  currency: string;
  taxable: boolean;
}

export interface OptionTotals {
  perContainer: Record<string, number>;
  haulage: number;
  services: number;
  surchargesTotal: number;
  grandTotal: number;
  currency?: string;
}

export interface DepositPolicy {
  type: "percentage" | "fixed";
  value: number;
}

export interface Terms {
  depositPolicy: DepositPolicy;
  generalConditionsId: string;
  paymentTerms?: string;
  validityDays?: number;
}

export interface QuoteOption {
  optionId: string;
  label: string;
  validUntil: string;
  currency: string;
  planning: Planning;
  seafreight: Seafreight;
  haulage: Haulage;
  services: Service[];
  totals: OptionTotals;
  terms: Terms;
}

// ---- Interface principale DraftQuote ----
export interface DraftQuoteApi {
  quoteId: string;
  createdAt: string;
  customer: Customer;
  incoterm: string;
  shipment: Shipment;
  attachments: Attachment[];
  options: QuoteOption[];
  // Champs de gestion du wizard
  wizard?: {
    currentStep: number;
    completedSteps: number[];
    status: "draft" | "in_progress" | "completed" | "cancelled";
    lastModified: string;
    version: string;
  };
  // Métadonnées
  metadata?: {
    createdBy: string;
    lastUpdatedBy: string;
    lastUpdatedAt: string;
    requestQuoteId?: string;
    clientNumber?: string;
  };
}

// ---- Types pour la compatibilité avec l'ancien système ----
export interface LegacyStep1 {
  customer: { contactId: number; contactName: string; companyName: string; email: string; };
  route: { origin: { city: { name: string; country: string; }; port: { portId: number; portName: string; country: string; } }; destination: { city: { name: string; country: string; }; port: { portId: number; portName: string; country: string; } } };
  cargo: { product: { productId: number; productName: string; }; incoterm: string; };
  metadata: { comment: string; };
  status: "NEW" | "IN_PROGRESS" | "COMPLETED" | string;
  assignee: string;
  cityFrom: { name: string; country: string; };
  cityTo: { name: string; country: string; };
  productName: { productId: number; productName: string; };
  incotermName: string;
  portFrom: { portId: number; portName: string; country: string; };
  portTo: { portId: number; portName: string; country: string; };
  comment: string;
}

// ---- Fonctions utilitaires ----
function safeNum(val: any, d = 0): number { 
  const n = Number(val); 
  return Number.isFinite(n) ? n : d; 
}

function safeStr(val: any, d = ""): string { 
  return (val ?? d).toString(); 
}

function pick<T>(val: T | undefined, d: T): T { 
  return (val === undefined || val === null) ? d : val; 
}

function arr<T>(v: any): T[] { 
  return Array.isArray(v) ? v as T[] : []; 
}

function nowIso(): string { 
  return new Date().toISOString(); 
}

// ---- FONCTIONS DE MAPPING ----

/**
 * Convertit l'ancienne structure DraftQuote vers la nouvelle structure DraftQuoteApi
 */
export function convertLegacyToApi(legacyDraft: any): DraftQuoteApi {
  console.log('🔄 [CONVERT_LEGACY_TO_API] Conversion de l\'ancienne structure vers la nouvelle');
  
  // Extraire les données de base
  const step1 = legacyDraft.step1 || {};
  const customer = step1.customer || {};
  const route = step1.route || {};
  const cargo = step1.cargo || {};
  
  // Construire la nouvelle structure
  const apiDraft: DraftQuoteApi = {
    quoteId: legacyDraft.id || legacyDraft.draftId || `DQ-${Date.now()}`,
    createdAt: legacyDraft.draftData?.wizard?.lastModified || nowIso(),
    customer: {
      type: "company",
      name: safeStr(customer.companyName || customer.contactName),
      vat: "", // Pas disponible dans l'ancienne structure
      emails: [safeStr(customer.email)],
      phones: [], // Pas disponible dans l'ancienne structure
      address: {
        line1: "", // Pas disponible dans l'ancienne structure
        city: safeStr(route.origin?.city?.name),
        zip: "", // Pas disponible dans l'ancienne structure
        country: safeStr(route.origin?.city?.country)
      },
      contactPerson: {
        fullName: safeStr(customer.contactName),
        phone: "", // Pas disponible dans l'ancienne structure
        email: safeStr(customer.email)
      }
    },
    incoterm: safeStr(cargo.incoterm || step1.incotermName),
    shipment: {
      mode: "FCL", // Par défaut
      containerCount: legacyDraft.step3?.summary?.totalContainers || 0,
      containerTypes: legacyDraft.step3?.summary?.containerTypes || [],
      commodity: safeStr(cargo.product?.productName),
      hsCodes: [], // Pas disponible dans l'ancienne structure
      origin: {
        location: safeStr(route.origin?.port?.portName),
        country: safeStr(route.origin?.city?.country)
      },
      destination: {
        location: safeStr(route.destination?.port?.portName),
        country: safeStr(route.destination?.city?.country)
      },
      docs: {
        requiresVGM: true, // Par défaut
        requiresBLDraftApproval: true, // Par défaut
        requiresInsurance: false,
        requiresCustomsClearance: false
      },
      constraints: {
        minTruckLeadDays: 6,
        terminalCutoffDays: 11,
        customsDeadlineHours: 48
      }
    },
    attachments: [],
    options: convertLegacyOptionsToApi(legacyDraft),
    wizard: {
      currentStep: calculateCurrentStepFromLegacy(legacyDraft),
      completedSteps: legacyDraft.draftData?.wizard?.completedSteps || [],
      status: "draft",
      lastModified: nowIso(),
      version: "2.0"
    },
    metadata: {
      createdBy: safeStr(legacyDraft.emailUser),
      lastUpdatedBy: safeStr(legacyDraft.emailUser),
      lastUpdatedAt: nowIso(),
      requestQuoteId: legacyDraft.requestQuoteId,
      clientNumber: legacyDraft.clientNumber
    }
  };
  
  console.log('✅ [CONVERT_LEGACY_TO_API] Conversion terminée:', apiDraft.quoteId);
  return apiDraft;
}

/**
 * Convertit les options de l'ancienne structure vers la nouvelle
 */
function convertLegacyOptionsToApi(legacyDraft: any): QuoteOption[] {
  const options: QuoteOption[] = [];
  
  // Si des options existent dans l'ancienne structure
  if (legacyDraft.savedOptions && legacyDraft.savedOptions.length > 0) {
    legacyDraft.savedOptions.forEach((option: any, index: number) => {
      options.push({
        optionId: option.optionId || `OPT-${index + 1}`,
        label: option.name || `Option ${index + 1}`,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currency: "EUR",
        planning: {
          emptyPickupDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          vgmDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          siDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          customsDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          fullGateInDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          etd: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          eta: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        seafreight: {
          id: `SF-${index + 1}`,
          carrier: "Compagnie par défaut",
          service: "Service par défaut",
          rate: [{
            containerType: "40HC",
            basePrice: option.totals?.seafreightTotalAmount || 0
          }],
          surcharges: []
        },
        haulage: {
          id: `HL-${index + 1}`,
          mode: "road",
          from: legacyDraft.step1?.cityFrom?.name || "",
          to: "Port de destination",
          basePrice: option.totals?.haulageTotalAmount || 0,
          surcharges: []
        },
        services: [],
        totals: {
          perContainer: { "40HC": option.totals?.seafreightTotalAmount || 0 },
          haulage: option.totals?.haulageTotalAmount || 0,
          services: option.totals?.miscTotalAmount || 0,
          surchargesTotal: 0,
          grandTotal: option.totals?.finalTotal || 0
        },
        terms: {
          depositPolicy: {
            type: "percentage",
            value: 50
          },
          generalConditionsId: "CGV-2025-01"
        }
      });
    });
  }
  
  return options;
}

/**
 * Calcule l'étape courante basée sur l'ancienne structure
 */
function calculateCurrentStepFromLegacy(legacyDraft: any): number {
  // Logique similaire à l'ancienne fonction calculateCurrentStep
  let currentStep = 1;
  
  const hasStep1Data = legacyDraft.step1 && (
    legacyDraft.step1.customer?.contactId ||
    legacyDraft.step1.route?.origin?.city?.name ||
    legacyDraft.step1.route?.destination?.city?.name ||
    legacyDraft.step1.cargo?.product?.productId
  );
  
  const hasStep2Data = legacyDraft.step2 && (
    (legacyDraft.step2.selected && legacyDraft.step2.selected.length > 0) ||
    (legacyDraft.step2.selectedServices && legacyDraft.step2.selectedServices.length > 0)
  );
  
  const hasStep3Data = legacyDraft.step3 && (
    (legacyDraft.step3.containers && legacyDraft.step3.containers.length > 0) ||
    (legacyDraft.step3.summary && legacyDraft.step3.summary.totalContainers > 0)
  );
  
  const hasStep4Data = legacyDraft.step4 && (
    legacyDraft.step4.selection?.haulierId ||
    legacyDraft.step4.selection?.offerId
  );
  
  const hasStep5Data = legacyDraft.step5 && (
    (legacyDraft.step5.selections && legacyDraft.step5.selections.length > 0) ||
    (legacyDraft.step5.summary && legacyDraft.step5.summary.totalSelections > 0)
  );
  
  const hasStep6Data = legacyDraft.step6 && (
    (legacyDraft.step6.selections && legacyDraft.step6.selections.length > 0) ||
    (legacyDraft.step6.summary && legacyDraft.step6.summary.totalSelections > 0)
  );
  
  const hasStep7Data = legacyDraft.step7 && (
    legacyDraft.step7.finalization?.isReadyToGenerate ||
    legacyDraft.step7.finalization?.optionName
  );
  
  if (hasStep1Data) currentStep = Math.max(currentStep, 1);
  if (hasStep2Data) currentStep = Math.max(currentStep, 2);
  if (hasStep3Data) currentStep = Math.max(currentStep, 3);
  if (hasStep4Data) currentStep = Math.max(currentStep, 4);
  if (hasStep5Data) currentStep = Math.max(currentStep, 5);
  if (hasStep6Data) currentStep = Math.max(currentStep, 6);
  if (hasStep7Data) currentStep = Math.max(currentStep, 7);
  
  return currentStep;
}

/**
 * Convertit la nouvelle structure DraftQuoteApi vers l'ancienne structure DraftQuote
 * pour la compatibilité avec RequestWizard.tsx
 */
export function convertApiToLegacy(apiDraft: DraftQuoteApi): any {
  console.log('🔄 [CONVERT_API_TO_LEGACY] Conversion de la nouvelle structure vers l\'ancienne');
  
  const legacyDraft = {
    id: apiDraft.quoteId,
    draftId: apiDraft.quoteId,
    requestQuoteId: apiDraft.metadata?.requestQuoteId,
    clientNumber: apiDraft.metadata?.clientNumber || 'DEFAULT',
    emailUser: apiDraft.metadata?.createdBy || '',
    
    // Step1 - Informations de base
    step1: {
      customer: {
        contactId: 0, // Pas disponible dans la nouvelle structure
        contactName: apiDraft.customer.contactPerson.fullName,
        companyName: apiDraft.customer.name,
        email: apiDraft.customer.contactPerson.email
      },
      route: {
        origin: {
          city: {
            name: apiDraft.shipment.origin.location,
            country: apiDraft.shipment.origin.country
          },
          port: {
            portId: 0, // Pas disponible dans la nouvelle structure
            portName: apiDraft.shipment.origin.location,
            country: apiDraft.shipment.origin.country
          }
        },
        destination: {
          city: {
            name: apiDraft.shipment.destination.location,
            country: apiDraft.shipment.destination.country
          },
          port: {
            portId: 0, // Pas disponible dans la nouvelle structure
            portName: apiDraft.shipment.destination.location,
            country: apiDraft.shipment.destination.country
          }
        }
      },
      cargo: {
        product: {
          productId: 0, // Pas disponible dans la nouvelle structure
          productName: apiDraft.shipment.commodity
        },
        incoterm: apiDraft.incoterm
      },
      metadata: {
        comment: "" // Pas disponible dans la nouvelle structure
      },
      status: "NEW",
      assignee: apiDraft.metadata?.createdBy || '',
      cityFrom: {
        name: apiDraft.shipment.origin.location,
        country: apiDraft.shipment.origin.country
      },
      cityTo: {
        name: apiDraft.shipment.destination.location,
        country: apiDraft.shipment.destination.country
      },
      productName: {
        productId: 0,
        productName: apiDraft.shipment.commodity
      },
      incotermName: apiDraft.incoterm,
      portFrom: {
        portId: 0,
        portName: apiDraft.shipment.origin.location,
        country: apiDraft.shipment.origin.country
      },
      portTo: {
        portId: 0,
        portName: apiDraft.shipment.destination.location,
        country: apiDraft.shipment.destination.country
      },
      comment: ""
    },
    
    // Step2 - Services (vide par défaut)
    step2: {
      selectedServices: [],
      selected: []
    },
    
    // Step3 - Conteneurs
    step3: {
      containers: apiDraft.shipment.containerTypes.map((type, index) => ({
        id: `container-${index}`,
        type: type,
        quantity: 1,
        teu: type.includes('40') ? 2 : 1
      })),
      summary: {
        totalContainers: apiDraft.shipment.containerCount,
        totalTEU: apiDraft.shipment.containerTypes.reduce((total, type) => 
          total + (type.includes('40') ? 2 : 1), 0),
        containerTypes: apiDraft.shipment.containerTypes
      },
      route: {
        origin: {
          city: {
            name: apiDraft.shipment.origin.location,
            country: apiDraft.shipment.origin.country
          },
          port: {
            portId: 0,
            portName: apiDraft.shipment.origin.location,
            country: apiDraft.shipment.origin.country
          }
        },
        destination: {
          city: {
            name: apiDraft.shipment.destination.location,
            country: apiDraft.shipment.destination.country
          },
          port: {
            portId: 0,
            portName: apiDraft.shipment.destination.location,
            country: apiDraft.shipment.destination.country
          }
        }
      },
      selectedContainers: { list: [] }
    },
    
    // Autres steps vides par défaut
    step4: {
      selection: {
        offerId: '',
        haulierId: 0,
        haulierName: '',
        tariff: { unitPrice: 0, currency: 'EUR', freeTime: 0 },
        route: { pickup: { company: '', city: '', country: '' }, delivery: { portId: 0, portName: '', country: '' } },
        validity: { validUntil: nowIso() }
      },
      calculation: { quantity: 0, unitPrice: 0, subtotal: 0, currency: 'EUR' }
    },
    
    step5: {
      selections: [],
      summary: { totalSelections: 0, totalContainers: 0, totalAmount: 0, currency: 'EUR', selectedCarriers: [], containerTypes: [], preferredSelectionId: '' }
    },
    
    step6: {
      selections: [],
      summary: { totalSelections: 0, totalAmount: 0, currency: 'EUR', categories: [] }
    },
    
    step7: {
      finalization: { optionName: '', optionDescription: '', marginPercentage: 0, marginAmount: 0, marginType: 'percentage', isReadyToGenerate: false, generatedAt: '' },
      validation: { allStepsValid: false, errors: [], warnings: [] },
      pricingSummary: {
        baseTotal: 0, marginAmount: 0, finalTotal: 0, currency: 'EUR',
        breakdown: { haulageAmount: 0, seafreightAmount: 0, miscellaneousAmount: 0, totalBeforeMargin: 0, components: [] }
      }
    },
    
    // Totals
    totals: {
      seafreight: 0,
      haulage: 0,
      miscellaneous: 0,
      subtotal: 0,
      grandTotal: 0,
      currency: 'EUR',
      totalTEU: apiDraft.shipment.containerTypes.reduce((total, type) => 
        total + (type.includes('40') ? 2 : 1), 0)
    },
    
    // Options sauvegardées
    savedOptions: convertApiOptionsToLegacy(apiDraft.options),
    
    // Autres propriétés
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
    totalTEU: apiDraft.shipment.containerTypes.reduce((total, type) => 
      total + (type.includes('40') ? 2 : 1), 0),
    seafreightQuantities: {},
    miscQuantities: {},
    surchargeQuantities: {},
    
    // DraftData
    draftData: {
      wizard: {
        currentStep: apiDraft.wizard?.currentStep || 1,
        completedSteps: apiDraft.wizard?.completedSteps || [],
        status: apiDraft.wizard?.status || 'draft',
        lastModified: apiDraft.wizard?.lastModified || nowIso(),
        version: apiDraft.wizard?.version || '2.0'
      },
      steps: {
        step1: {}, // Sera rempli par la logique existante
        step2: { selectedServices: [], selected: [] },
        step3: {},
        step4: {},
        step5: {},
        step6: {},
        step7: {}
      },
      totals: {}
    }
  };
  
  console.log('✅ [CONVERT_API_TO_LEGACY] Conversion terminée:', legacyDraft.id);
  return legacyDraft;
}

/**
 * Convertit les options de la nouvelle structure vers l'ancienne
 */
function convertApiOptionsToLegacy(apiOptions: QuoteOption[]): any[] {
  return apiOptions.map(option => ({
    optionId: option.optionId,
    name: option.label,
    description: option.label,
    haulageSelectionId: option.haulage.id,
    seafreightSelectionIds: [option.seafreight.id],
    miscSelectionIds: [],
    step4Data: null,
    step5Data: null,
    step6Data: null,
    step7Data: null,
    marginType: 'percentage',
    marginValue: 0,
    totals: {
      haulageTotalAmount: option.totals.haulage,
      seafreightBaseAmount: option.totals.perContainer[Object.keys(option.totals.perContainer)[0]] || 0,
      seafreightSurchargesAmount: option.totals.surchargesTotal,
      seafreightTotalAmount: option.totals.perContainer[Object.keys(option.totals.perContainer)[0]] || 0,
      miscTotalAmount: option.totals.services,
      subTotal: option.totals.haulage + (option.totals.perContainer[Object.keys(option.totals.perContainer)[0]] || 0) + option.totals.services,
      marginAmount: 0,
      finalTotal: option.totals.grandTotal,
      currency: option.currency,
      calculatedAt: nowIso()
    },
    createdAt: nowIso(),
    updatedAt: nowIso(),
    createdBy: '',
    calculatedMargin: 0,
    finalTotal: option.totals.grandTotal
  }));
}

// ---- FONCTIONS DE GESTION DES BROUILLONS ----

/**
 * Crée un brouillon initial avec la nouvelle structure
 */
export function createInitialDraftQuoteApi(
  currentUserEmail?: string, 
  existingRequestQuoteId?: string,
  requestData?: any
): DraftQuoteApi {
  console.log('🎯 [CREATE_INITIAL_DRAFT_API] Création du brouillon initial avec la nouvelle structure');
  
  const quoteId = `DQ-${Date.now()}`;
  
  const draft: DraftQuoteApi = {
    quoteId,
    createdAt: nowIso(),
    customer: {
      type: "company",
      name: requestData?.companyName || '',
      vat: '',
      emails: [currentUserEmail || ''],
      phones: [],
      address: {
        line1: '',
        city: requestData?.pickupLocation?.city || '',
        zip: '',
        country: requestData?.pickupLocation?.country || ''
      },
      contactPerson: {
        fullName: requestData?.assigneeDisplayName || currentUserEmail || '',
        phone: '',
        email: currentUserEmail || ''
      }
    },
    incoterm: requestData?.incoterm || 'FOB',
    shipment: {
      mode: "FCL",
      containerCount: 0,
      containerTypes: [],
      commodity: requestData?.productName || '',
      hsCodes: [],
      origin: {
        location: requestData?.pickupLocation?.city || '',
        country: requestData?.pickupLocation?.country || ''
      },
      destination: {
        location: requestData?.deliveryLocation?.city || '',
        country: requestData?.deliveryLocation?.country || ''
      },
      docs: {
        requiresVGM: true,
        requiresBLDraftApproval: true,
        requiresInsurance: false,
        requiresCustomsClearance: false
      },
      constraints: {
        minTruckLeadDays: 6,
        terminalCutoffDays: 11,
        customsDeadlineHours: 48
      }
    },
    attachments: [],
    options: [],
    wizard: {
      currentStep: 1,
      completedSteps: [],
      status: "draft",
      lastModified: nowIso(),
      version: "2.0"
    },
    metadata: {
      createdBy: currentUserEmail || '',
      lastUpdatedBy: currentUserEmail || '',
      lastUpdatedAt: nowIso(),
      requestQuoteId: existingRequestQuoteId,
      clientNumber: 'DEFAULT'
    }
  };
  
  console.log('✅ [CREATE_INITIAL_DRAFT_API] Brouillon initial créé:', draft.quoteId);
  return draft;
}

/**
 * Construit le payload pour l'API avec la nouvelle structure
 */
export function buildApiPayload(draftQuote: DraftQuoteApi): any {
  console.log('🔧 [BUILD_API_PAYLOAD] Construction du payload pour l\'API');
  
  return {
    quoteId: draftQuote.quoteId,
    createdAt: draftQuote.createdAt,
    customer: draftQuote.customer,
    incoterm: draftQuote.incoterm,
    shipment: draftQuote.shipment,
    attachments: draftQuote.attachments,
    options: draftQuote.options,
    wizard: draftQuote.wizard,
    metadata: draftQuote.metadata
  };
}

/**
 * Valide les données de navigation et extrait les informations nécessaires
 */
export function validateNavigationDataApi(locationState: any): {
  isValid: boolean;
  requestData?: any;
  requestQuoteId?: string;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!locationState) {
    errors.push('Aucun état de navigation fourni');
    return { isValid: false, errors };
  }
  
  if (!locationState.requestData) {
    errors.push('Aucune donnée de requête dans l\'état de navigation');
    return { isValid: false, errors };
  }
  
  const requestData = locationState.requestData;
  
  if (!requestData.requestQuoteId) {
    errors.push('requestQuoteId manquant dans les données de requête');
    return { isValid: false, errors };
  }
  
  if (locationState.source !== 'api') {
    errors.push('Source de navigation invalide (attendu: "api")');
    return { isValid: false, errors };
  }
  
  return {
    isValid: true,
    requestData,
    requestQuoteId: requestData.requestQuoteId,
    errors: []
  };
}

// ---- FONCTIONS DE COMPATIBILITÉ ----

/**
 * Fonction de compatibilité pour RequestWizard.tsx
 * Convertit automatiquement entre les deux structures
 */
export function loadDraftFromDatabase(parsedData: any): any {
  console.log('🔄 [LOAD_DRAFT_FROM_DATABASE] Chargement avec conversion automatique');
  
  // Détecter si c'est la nouvelle structure ou l'ancienne
  if (parsedData.quoteId && parsedData.customer && parsedData.shipment) {
    // Nouvelle structure - convertir vers l'ancienne pour la compatibilité
    console.log('📥 [LOAD_DRAFT_FROM_DATABASE] Détection de la nouvelle structure API');
    return convertApiToLegacy(parsedData);
  } else {
    // Ancienne structure - utiliser la logique existante
    console.log('📥 [LOAD_DRAFT_FROM_DATABASE] Détection de l\'ancienne structure');
    // Ici on pourrait appeler l'ancienne fonction loadDraftFromDatabase si elle existe
    return parsedData;
  }
}

/**
 * Fonction de compatibilité pour la création de brouillons
 */
export function createDraftQuoteFromRequest(requestData: any, currentUserEmail?: string): any {
  console.log('🔄 [CREATE_DRAFT_QUOTE_FROM_REQUEST] Création avec la nouvelle structure');
  
  // Créer avec la nouvelle structure
  const apiDraft = createInitialDraftQuoteApi(currentUserEmail, requestData.requestQuoteId, requestData);
  
  // Convertir vers l'ancienne structure pour la compatibilité
  return convertApiToLegacy(apiDraft);
}

/**
 * Fonction de compatibilité pour la création de brouillons initiaux
 */
export function createInitialDraftQuote(currentUserEmail?: string, existingRequestQuoteId?: string): any {
  console.log('🔄 [CREATE_INITIAL_DRAFT_QUOTE] Création avec la nouvelle structure');
  
  // Créer avec la nouvelle structure
  const apiDraft = createInitialDraftQuoteApi(currentUserEmail, existingRequestQuoteId);
  
  // Convertir vers l'ancienne structure pour la compatibilité
  return convertApiToLegacy(apiDraft);
}

// ---- EXPORTS POUR LA COMPATIBILITÉ ----
export { DraftQuoteApi as DraftQuote };
export type { LegacyStep1 as Step1 };
export { convertLegacyToApi, convertApiToLegacy, buildApiPayload, validateNavigationDataApi };
