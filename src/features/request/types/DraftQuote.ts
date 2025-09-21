

// ---- Types that match the UI state (what the app expects) ----
export interface City { name: string; country: string; }
export interface Port { portId: number; portName: string; country: string; unlocode?: string; }
export interface Product { productId: number; productName: string; }
export interface Tariff { unitPrice: number; currency: string; freeTime: number; }
export interface HaulageRoutePickup { company: string; city: string; country: string; }
export interface HaulageRouteDelivery { portId: number; portName: string; country: string; }
export interface HaulageRoute { pickup: HaulageRoutePickup; delivery: HaulageRouteDelivery; }
export interface HaulageValidity { validUntil: string; }

export interface SelectedHaulage {
  offerId: string;
  haulierId: number;
  haulierName: string;
  tariff: Tariff;
  route: HaulageRoute;
  validity: HaulageValidity;
  overtimeQuantity: number;
  overtimePrice: number;
}

export interface SeafreightCarrier { carrierId: number; carrierName: string; agentName: string; }
export interface SeafreightRoute {
  departurePort: Port;
  destinationPort: Port;
  transitDays: number;
  frequency: string;
  incoterm: string;
}
export interface SeafreightContainer {
  containerType: string;
  isReefer: boolean;
  quantity: number;
  volumeM3: number;
  weightKg: number;
  unitPrice: number;
  subtotal: number;
}
export interface Surcharge {
  name: string;
  value: number;
  type: string;
  description: string;
  isMandatory: boolean;
  currency: string;
}
export interface SeafreightCharges {
  basePrice: number;
  currency: string;
  surcharges: Surcharge[];
  totalPrice: number;
}
export interface SeafreightService {
  deliveryTerms: string;
  createdBy: string;
  createdDate: string;
}
export interface SeafreightValidity {
  startDate: string;
  endDate: string;
  isExpired: boolean;
  daysRemaining: number;
}
export interface SelectedSeafreight {
  id: string;
  seafreightId: string;
  quoteNumber: string;
  carrier: SeafreightCarrier;
  route: SeafreightRoute;
  container: SeafreightContainer;
  charges: SeafreightCharges;
  service: SeafreightService;
  validity: SeafreightValidity;
  remarks: string;
  isSelected: boolean;
  selectedAt: string;
  totalContainerPrice: number;
  totalChargesPrice: number;
  grandTotal: number;
  isValidSelection: boolean;
}

export interface Step1 {
  customer: { contactId: number; contactName: string; companyName: string; email: string; };
  route: { origin: { city: City; port: Port }; destination: { city: City; port: Port } };
  cargo: { product: Product; incoterm: string; };
  metadata: { comment: string; };
  status: "NEW" | "IN_PROGRESS" | "COMPLETED" | string;
  assignee: string;
  cityFrom: City;
  cityTo: City;
  productName: Product;
  incotermName: string;
  portFrom: Port;
  portTo: Port;
  comment: string;
}

export interface Step2Service {
  serviceId: number;
  serviceName: string;
  category: string;
  usagePercent: number;
}
export interface Step2 {
  selectedServices: Step2Service[];
  selected: Step2Service[];
}

export interface Step3Container {
  id: string;
  type: string;
  quantity: number;
  teu: number;
}
export interface Step3 {
  containers: Step3Container[];
  summary: { totalContainers: number; totalTEU: number; containerTypes: string[]; };
  route: Step1["route"];
  selectedContainers: { list: Step3Container[] };
}

export interface Step4 {
  selection: {
    offerId: string;
    haulierId: number;
    haulierName: string;
    tariff: Tariff;
    route: HaulageRoute;
    validity: HaulageValidity;
    overtimeQuantity?: number;
    overtimePrice?: number;
  };
  calculation: { quantity: number; unitPrice: number; subtotal: number; overtimeAmount?: number; totalAmount?: number; currency: string; };
}

export interface Step5 {
  selections: SelectedSeafreight[];
  summary: { totalSelections: number; totalContainers: number; totalAmount: number; currency: string; selectedCarriers: string[]; containerTypes: string[]; preferredSelectionId: string; };
}

export interface Step6 {
  selections: any[];
  summary: { totalSelections: number; totalAmount: number; currency: string; categories: string[]; };
}

export interface Step7 {
  finalization: { optionName: string; optionDescription: string; marginPercentage: number; marginAmount: number; marginType: "percentage" | "fixed" | string; isReadyToGenerate: boolean; generatedAt: string; };
  validation: { allStepsValid: boolean; errors: string[]; warnings: string[]; };
  pricingSummary: { baseTotal: number; marginAmount: number; finalTotal: number; currency: string; breakdown: { haulageAmount: number; seafreightAmount: number; miscellaneousAmount: number; totalBeforeMargin: number; components: any[]; } };
}

export interface Totals { haulage: number; seafreight: number; miscellaneous: number; subtotal: number; grandTotal: number; currency: string; totalTEU: number; }

export interface DraftQuote {
  id?: string;
  draftId?: string; // ✅ Auto-generated MongoDB ObjectId from API
  requestQuoteId?: string; // ✅ ID of the original request (not the draft) - Optional to handle new quotes
  clientNumber?: string;
  step1: Step1;
  step2: Step2;
  step3: Step3;
  step4: Step4;
  step5: Step5;
  step6: Step6;
  step7: Step7;
  totals: Totals;
  savedOptions: DraftOption[];
  currentWorkingOptionId?: string | null;
  preferredOptionId?: string;
  maxOptionsAllowed?: number;
  selectedHaulage?: SelectedHaulage;
  selectedSeafreights: SelectedSeafreight[];
  selectedMiscellaneous: any[];
  selectedContainers: Record<string, any>;
  marginType: "percent" | "percentage" | "fixed" | string;
  marginValue: number;
  totalPrice: number;
  seafreightTotal: number;
  haulageTotal: number;
  miscTotal: number;
  totalTEU: number;
  seafreightQuantities: Record<string, number>;
  miscQuantities: Record<string, number>;
  surchargeQuantities: Record<string, number>;
  emailUser?: string;
  draftData?: {
    wizard: {
      currentStep: number;
      completedSteps: number[];
      status: string;
      lastModified: string;
      version: string;
    };
    steps: {
      step1: Step1;
      step2: Step2;
      step3: Step3;
      step4: Step4;
      step5: Step5;
      step6: Step6;
      step7: Step7;
    };
    totals: Totals;
  };
}

// ---- Option Types ----

export interface DraftOptionTotals {
  haulageTotalAmount: number;
  seafreightBaseAmount: number;
  seafreightSurchargesAmount: number;
  seafreightTotalAmount: number;
  miscTotalAmount: number;
  subTotal: number;
  marginAmount: number;
  finalTotal: number;
  currency: string;
  calculatedAt: string;
}

export interface DraftOption {
  optionId: string;
  name: string;
  description?: string;
  haulageSelectionId?: string | null;
  seafreightSelectionIds?: string[];
  miscSelectionIds?: string[];
  step4Data?: Step4;
  step5Data?: Step5;
  step6Data?: Step6;
  step7Data?: Step7;
  marginType: string;
  marginValue: number;
  totals: DraftOptionTotals;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  calculatedMargin?: number; // readOnly
  finalTotal?: number; // readOnly
}

// ---- Helpers ----
function safeNum(val: any, d = 0): number { const n = Number(val); return Number.isFinite(n) ? n : d; }
function safeStr(val: any, d = ""): string { return (val ?? d).toString(); }
function pick<T>(val: T | undefined, d: T): T { return (val === undefined || val === null) ? d : val; }
function arr<T>(v: any): T[] { return Array.isArray(v) ? v as T[] : []; }
function nowIso(): string { return new Date().toISOString(); }

/**
 * Calcule automatiquement le currentStep basé sur les données existantes
 * Retourne la dernière étape qui contient des données significatives
 */
export function calculateCurrentStep(draftQuote: DraftQuote): number {
  // Étape 1: Vérifier si les données de base sont présentes
  const hasStep1Data = draftQuote.step1 && (
    draftQuote.step1.customer?.contactId ||
    draftQuote.step1.route?.origin?.city?.name ||
    draftQuote.step1.route?.destination?.city?.name ||
    draftQuote.step1.cargo?.product?.productId
  );

  // Étape 2: Vérifier si des services sont sélectionnés
  const hasStep2Data = draftQuote.step2 && (
    (draftQuote.step2.selected && draftQuote.step2.selected.length > 0) ||
    (draftQuote.step2.selectedServices && draftQuote.step2.selectedServices.length > 0)
  );

  // Étape 3: Vérifier si des conteneurs sont définis
  const hasStep3Data = draftQuote.step3 && (
    (draftQuote.step3.containers && draftQuote.step3.containers.length > 0) ||
    (draftQuote.step3.summary && draftQuote.step3.summary.totalContainers > 0)
  );

  // Étape 4: Vérifier si un transporteur terrestre est sélectionné
  const hasStep4Data = draftQuote.step4 && (
    draftQuote.step4.selection?.haulierId ||
    draftQuote.step4.selection?.offerId
  );

  // Étape 5: Vérifier si des sélections maritimes sont faites
  const hasStep5Data = draftQuote.step5 && (
    (draftQuote.step5.selections && draftQuote.step5.selections.length > 0) ||
    (draftQuote.step5.summary && draftQuote.step5.summary.totalSelections > 0)
  );

  // Étape 6: Vérifier si des services divers sont sélectionnés
  const hasStep6Data = draftQuote.step6 && (
    (draftQuote.step6.selections && draftQuote.step6.selections.length > 0) ||
    (draftQuote.step6.summary && draftQuote.step6.summary.totalSelections > 0)
  );

  // Étape 7: Vérifier si le devis est finalisé
  const hasStep7Data = draftQuote.step7 && (
    draftQuote.step7.finalization?.isReadyToGenerate ||
    draftQuote.step7.finalization?.optionName
  );

  // Calculer la dernière étape avec des données
  let currentStep = 1; // Toujours commencer à l'étape 1 minimum

  if (hasStep1Data) currentStep = Math.max(currentStep, 1);
  if (hasStep2Data) currentStep = Math.max(currentStep, 2);
  if (hasStep3Data) currentStep = Math.max(currentStep, 3);
  if (hasStep4Data) currentStep = Math.max(currentStep, 4);
  if (hasStep5Data) currentStep = Math.max(currentStep, 5);
  if (hasStep6Data) currentStep = Math.max(currentStep, 6);
  if (hasStep7Data) currentStep = Math.max(currentStep, 7);

  console.log('🔧 [CALCULATE_CURRENT_STEP] Calcul automatique:', {
    hasStep1Data,
    hasStep2Data,
    hasStep3Data,
    hasStep4Data,
    hasStep5Data,
    hasStep6Data,
    hasStep7Data,
    calculatedCurrentStep: currentStep
  });

  return currentStep;
}

// ---- CORE MAPPER ----
/**
 * Build the UI DraftQuote shape from any API "parsedData" payload like parsedData.json
 */
export function loadDraftFromDatabase(parsedData: any): DraftQuote {
  // 1) Normalize the incoming shape (could be axios response or already unwrapped)
  const apiData = parsedData?.data?.data ?? parsedData?.data ?? parsedData;

  // 2) Unpack common roots
  const id = apiData?.id;
  const requestQuoteId = safeStr(apiData?.requestQuoteId || apiData?.draftData?.requestQuoteId || "draft_unknown");
  const emailUser = apiData?.emailUser;
  const clientNumber = apiData?.clientNumber ?? "DEFAULT";
  const steps = apiData?.draftData?.steps ?? apiData?.steps ?? {};
  const totalsApi = apiData?.draftData?.totals ?? apiData?.totals ?? {};

  // 3) STEP1
  const s1 = steps.step1 ?? {};
  const origin = s1?.route?.origin ?? {};
  const dest = s1?.route?.destination ?? {};
  const originCity = origin?.city ?? {};
  const destCity = dest?.city ?? {};
  const originPort = origin?.port ?? {};
  const destPort = dest?.port ?? {};
  const product = s1?.cargo?.product ?? { productId: 0, productName: "" };
  const incoterm = safeStr(s1?.cargo?.incoterm);

  const step1: Step1 = {
    customer: {
      contactId: safeNum(s1?.customer?.contactId),
      contactName: safeStr(s1?.customer?.contactName),
      companyName: safeStr(s1?.customer?.companyName),
      email: safeStr(s1?.customer?.email)
    },
    route: {
      origin: {
        city: { name: safeStr(originCity?.name), country: safeStr(originCity?.country) },
        port: { portId: safeNum(originPort?.portId), portName: safeStr(originPort?.portName), country: safeStr(originPort?.country) }
      },
      destination: {
        city: { name: safeStr(destCity?.name), country: safeStr(destCity?.country) },
        port: { portId: safeNum(destPort?.portId), portName: safeStr(destPort?.portName), country: safeStr(destPort?.country) }
      }
    },
    cargo: {
      product: { productId: safeNum(product?.productId), productName: safeStr(product?.productName) },
      incoterm
    },
    metadata: { comment: safeStr(s1?.metadata?.comment) },
    status: "NEW",
    assignee: safeStr(emailUser),
    cityFrom: { name: safeStr(originCity?.name), country: safeStr(originCity?.country) },
    cityTo: { name: safeStr(destCity?.name), country: safeStr(destCity?.country) },
    productName: { productId: safeNum(product?.productId), productName: safeStr(product?.productName) },
    incotermName: safeStr(incoterm),
    portFrom: { portId: safeNum(originPort?.portId), portName: safeStr(originPort?.portName), country: safeStr(originPort?.country) },
    portTo: { portId: safeNum(destPort?.portId), portName: safeStr(destPort?.portName), country: safeStr(destPort?.country) },
    comment: safeStr(s1?.metadata?.comment)
  };

  // 4) STEP2 — UI expects both "selected" and "selectedServices". We'll mirror "selected" and keep selectedServices empty for compatibility.
  // ✅ CORRECTION: Lire les services depuis selectedServices (sauvegardés par buildSDKPayload)
  const s2Services = arr<Step2Service>(steps?.step2?.selectedServices);
  const step2: Step2 = {
    selectedServices: [],
    selected: s2Services.map(s => ({
      serviceId: safeNum(s.serviceId),
      serviceName: safeStr(s.serviceName),
      category: safeStr(s.category),
      usagePercent: safeNum(s.usagePercent)
    }))
  };

  // 5) STEP3
  const s3 = steps.step3 ?? {};
  const s3Containers = arr<Step3Container>(s3?.containers);
  const s3Summary = s3?.summary ?? {};
  const step3: Step3 = {
    containers: s3Containers.map(c => ({ id: safeStr(c.id), type: safeStr(c.type), quantity: safeNum(c.quantity, 1), teu: safeNum(c.teu, 1) })),
    summary: {
      totalContainers: safeNum(s3Summary?.totalContainers, s3Containers.reduce((a,c)=>a+safeNum(c.quantity,1),0)),
      totalTEU: safeNum(s3Summary?.totalTEU, s3Containers.reduce((a,c)=>a+safeNum(c.teu,1),0)),
      containerTypes: arr<string>(s3Summary?.containerTypes)
    },
    route: step1.route,
    selectedContainers: { list: s3Containers.map(c => ({ id: safeStr(c.id), type: safeStr(c.type), quantity: safeNum(c.quantity,1), teu: safeNum(c.teu,1) })) }
  };

  // 6) STEP4 (Haulage)
  const s4 = steps.step4 ?? {};
  const sel4 = s4?.selection ?? {};
  const step4: Step4 = {
    selection: {
      offerId: safeStr(sel4?.offerId),
      haulierId: safeNum(sel4?.haulierId),
      haulierName: safeStr(sel4?.haulierName),
      tariff: {
        unitPrice: safeNum(sel4?.tariff?.unitPrice),
        currency: safeStr(sel4?.tariff?.currency, "EUR"),
        freeTime: safeNum(sel4?.tariff?.freeTime)
      },
      route: {
        pickup: {
          company: safeStr(sel4?.route?.pickup?.company),
          city: safeStr(sel4?.route?.pickup?.city),
          country: safeStr(sel4?.route?.pickup?.country)
        },
        delivery: {
          portId: safeNum(sel4?.route?.delivery?.portId),
          portName: safeStr(sel4?.route?.delivery?.portName),
          country: safeStr(sel4?.route?.delivery?.country)
        }
      },
      validity: { validUntil: safeStr(sel4?.validity?.validUntil, nowIso()) },
      overtimeQuantity: safeNum(sel4?.overtimeQuantity),
      overtimePrice: safeNum(sel4?.overtimePrice)
    },
    calculation: {
      quantity: safeNum(s4?.calculation?.quantity, 0),
      unitPrice: safeNum(s4?.calculation?.unitPrice, 0),
      subtotal: safeNum(s4?.calculation?.subtotal, 0),
      overtimeAmount: safeNum(s4?.calculation?.overtimeAmount, 0),
      totalAmount: safeNum(s4?.calculation?.totalAmount, 0),
      currency: safeStr(s4?.calculation?.currency, "EUR")
    }
  };

  // 7) STEP5 (Seafreights)
  const s5 = steps.step5 ?? {};
  const s5Sel = arr<SelectedSeafreight>(s5?.selections);
  const step5: Step5 = {
    selections: s5Sel as any, // keep original shape here
    summary: {
      totalSelections: safeNum(s5?.summary?.totalSelections, s5Sel.length),
      totalContainers: safeNum(s5?.summary?.totalContainers, step3.summary.totalContainers),
      totalAmount: safeNum(s5?.summary?.totalAmount),
      currency: safeStr(s5?.summary?.currency, "EUR"),
      selectedCarriers: arr<string>(s5?.summary?.selectedCarriers),
      containerTypes: arr<string>(s5?.summary?.containerTypes),
      preferredSelectionId: safeStr(s5?.summary?.preferredSelectionId)
    }
  };

  // 8) STEP6
  const s6 = steps.step6 ?? {};
  const step6: Step6 = {
    selections: arr<any>(s6?.selections),
    summary: {
      totalSelections: safeNum(s6?.summary?.totalSelections),
      totalAmount: safeNum(s6?.summary?.totalAmount),
      currency: safeStr(s6?.summary?.currency, "EUR"),
      categories: arr<string>(s6?.summary?.categories)
    }
  };

  // 9) STEP7
  const s7 = steps.step7 ?? {};
  const step7: Step7 = {
    finalization: {
      optionName: safeStr(s7?.finalization?.optionName),
      optionDescription: safeStr(s7?.finalization?.optionDescription),
      marginPercentage: safeNum(s7?.finalization?.marginPercentage),
      marginAmount: safeNum(s7?.finalization?.marginAmount),
      marginType: safeStr(s7?.finalization?.marginType, "percentage") as any,
      isReadyToGenerate: !!s7?.finalization?.isReadyToGenerate,
      generatedAt: safeStr(s7?.finalization?.generatedAt, nowIso())
    },
    validation: {
      allStepsValid: !!s7?.validation?.allStepsValid,
      errors: arr<string>(s7?.validation?.errors),
      warnings: arr<string>(s7?.validation?.warnings)
    },
    pricingSummary: {
      baseTotal: safeNum(s7?.pricingSummary?.baseTotal),
      marginAmount: safeNum(s7?.pricingSummary?.marginAmount),
      finalTotal: safeNum(s7?.pricingSummary?.finalTotal),
      currency: safeStr(s7?.pricingSummary?.currency, "EUR"),
      breakdown: {
        haulageAmount: safeNum(s7?.pricingSummary?.breakdown?.haulageAmount),
        seafreightAmount: safeNum(s7?.pricingSummary?.breakdown?.seafreightAmount),
        miscellaneousAmount: safeNum(s7?.pricingSummary?.breakdown?.miscellaneousAmount),
        totalBeforeMargin: safeNum(s7?.pricingSummary?.breakdown?.totalBeforeMargin),
        components: arr<any>(s7?.pricingSummary?.breakdown?.components)
      }
    }
  };

  // 10) Totals
  const totals: Totals = {
    haulage: safeNum(totalsApi?.haulage),
    seafreight: safeNum(totalsApi?.seafreight),
    miscellaneous: safeNum(totalsApi?.miscellaneous),
    subtotal: safeNum(totalsApi?.subtotal),
    grandTotal: safeNum(totalsApi?.grandTotal),
    currency: safeStr(totalsApi?.currency, "EUR"),
    totalTEU: safeNum(totalsApi?.totalTEU, step3.summary.totalTEU)
  };

  // 11) Flattened root selections mirroring the UI expectations
  const selectedHaulage: SelectedHaulage | undefined = step4.selection?.offerId
    ? {
        offerId: step4.selection.offerId,
        haulierId: step4.selection.haulierId,
        haulierName: step4.selection.haulierName,
        tariff: step4.selection.tariff,
        route: step4.selection.route,
        validity: step4.selection.validity,
        overtimeQuantity: safeNum(step4.selection.overtimeQuantity),
        overtimePrice: safeNum(step4.selection.overtimePrice)
      }
    : undefined;

  const selectedSeafreights: SelectedSeafreight[] = s5Sel as any;

  // 12) Final DraftQuote
  const out: DraftQuote = {
    id,
    requestQuoteId,
    clientNumber,
    step1,
    step2,
    step3,
    step4,
    step5,
    step6,
    step7,
    totals,
    savedOptions: [],
    selectedHaulage,
    selectedSeafreights,
    selectedMiscellaneous: [],
    selectedContainers: {},
    marginType: (step7.finalization.marginType === "percentage" ? "percent" : step7.finalization.marginType) as any,
    marginValue: safeNum(step7.finalization.marginPercentage),
    totalPrice: safeNum(totals.grandTotal),
    seafreightTotal: safeNum(totals.seafreight),
    haulageTotal: safeNum(totals.haulage),
    miscTotal: safeNum(totals.miscellaneous),
    totalTEU: totals.totalTEU,
    seafreightQuantities: {},
    miscQuantities: {},
    surchargeQuantities: {},
    emailUser,
    draftData: {
      wizard: {
        currentStep: 0, // Sera calculé automatiquement après
        completedSteps: [], // Placeholder, needs actual wizard state
        status: "NEW", // Placeholder, needs actual wizard state
        lastModified: nowIso(), // Placeholder, needs actual wizard state
        version: "1.0" // Placeholder, needs actual wizard state
      },
      steps: {
        step1: step1,
        step2: step2,
        step3: step3,
        step4: step4,
        step5: step5,
        step6: step6,
        step7: step7
      },
      totals: totals
    }
  };

  // 13) Calculer automatiquement le currentStep basé sur les données
  if (out.draftData) {
    out.draftData.wizard.currentStep = calculateCurrentStep(out);
  }

  return out;
}

// === FONCTIONS EXPORTÉES POUR L'UTILISATION ===

/**
 * Synchronise automatiquement les propriétés de compatibilité avec draftData
 * Assure la cohérence entre les propriétés directes et la structure draftData
 */
export function syncDraftQuoteData(draftQuote: DraftQuote): DraftQuote {
  // Retourner le draftQuote synchronisé (implémentation simplifiée)
  return draftQuote;
}

/**
 * Génère un ID de requête unique
 */
function generateRequestId(): string {
  return `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Construit le payload pour la création d'un nouveau brouillon (POST)
 * Retourne CreateDraftQuoteRequest
 */
export function buildCreateDraftPayload(draftQuote: DraftQuote, accountUsername?: string): any {
  const emailUser = accountUsername || draftQuote.emailUser || '';
  
  console.log('🔧 [BUILD_CREATE_PAYLOAD] Construction du payload POST:', {
    draftQuoteId: draftQuote.id,
    requestQuoteId: draftQuote.requestQuoteId,
    emailUser
  });
  
  // ✅ PAYLOAD POUR POST /api/draft-quotes
  // Utiliser UNIQUEMENT le requestQuoteId de la requête existante
  if (!draftQuote.requestQuoteId) {
    throw new Error('RequestQuoteId manquant - impossible de créer un brouillon sans requête existante');
  }
  
  const requestId = draftQuote.requestQuoteId;
  
  console.log('🔧 [BUILD_CREATE_PAYLOAD] RequestId utilisé:', {
    requestQuoteId: draftQuote.requestQuoteId,
    finalRequestId: requestId,
    source: 'existing_request'
  });
  
  const payload = {
    requestId: requestId,
    header: {
      createdBy: emailUser,
      createdAt: new Date().toISOString(),
      lastUpdatedBy: emailUser,
      lastUpdatedAt: new Date().toISOString()
    },
    wizardData: {
      currentStep: calculateCurrentStep(draftQuote),
      completedSteps: draftQuote.draftData?.wizard?.completedSteps || [],
      status: 'draft',
      lastModified: new Date().toISOString(),
      version: '1.0'
    }
  };
  
  console.log('🔧 [BUILD_CREATE_PAYLOAD] Payload POST final:', JSON.stringify(payload, null, 2));
  return payload;
}

/**
 * Construit le payload pour la mise à jour d'un brouillon existant (PUT)
 * Retourne UpdateDraftQuoteRequest
 */
export function buildUpdateDraftPayload(draftQuote: DraftQuote, accountUsername?: string): any {
  const emailUser = accountUsername || draftQuote.emailUser || '';
  
  console.log('🔧 [BUILD_UPDATE_PAYLOAD] Construction du payload PUT:', {
    draftQuoteId: draftQuote.id,
    requestQuoteId: draftQuote.requestQuoteId,
    emailUser
  });
  
  // ✅ PAYLOAD POUR PUT /api/draft-quotes/{id}
  const payload = {
    header: {
      lastUpdatedBy: emailUser,
      lastUpdatedAt: new Date().toISOString()
    },
    wizardData: {
      currentStep: calculateCurrentStep(draftQuote),
      completedSteps: draftQuote.draftData?.wizard?.completedSteps || [],
      status: 'draft',
      lastModified: new Date().toISOString(),
      version: '1.0'
    },
    options: draftQuote.savedOptions || [],
    notes: draftQuote.step1?.comment || ''
  };
  
  console.log('🔧 [BUILD_UPDATE_PAYLOAD] Payload PUT final:', JSON.stringify(payload, null, 2));
  return payload;
}

/**
 * Construit le payload exact attendu par l'API pour la sauvegarde
 * Transforme DraftQuote en OptimizedCreateWizardDraftRequest ou OptimizedUpdateWizardDraftRequest
 * @deprecated Utiliser buildCreateDraftPayload ou buildUpdateDraftPayload selon le contexte
 */
export function buildSDKPayload(draftQuote: DraftQuote, accountUsername?: string): any {
  // Utiliser l'email de l'utilisateur fourni ou celui du draft
  const emailUser = accountUsername || draftQuote.emailUser || '';
  
  // Log pour debug
  console.log('🔧 [BUILD_SDK_PAYLOAD] Construction du payload:', {
    draftQuoteId: draftQuote.id,
    requestQuoteId: draftQuote.requestQuoteId,
    emailUser,
    hasStep1: !!draftQuote.step1,
    hasDraftData: !!draftQuote.draftData,
    savedOptionsCount: draftQuote.savedOptions?.length || 0
  });
  
  // ✅ RETOURNER LE PAYLOAD EXACT ATTENDU PAR L'API
  // Selon l'exemple fourni, l'API attend une structure complète avec tous les champs
  const payload = {
    request: draftQuote.requestQuoteId || draftQuote.id || '', // ✅ CORRECTION : Ajouter le champ request requis
    requestQuoteId: draftQuote.requestQuoteId || draftQuote.id || '',
    emailUser,
    clientNumber: draftQuote.clientNumber || '',
    comment: draftQuote.step1?.comment || '',
    draftData: {
      wizard: {
        currentStep: calculateCurrentStep(draftQuote),
        completedSteps: draftQuote.draftData?.wizard?.completedSteps || [],
        status: 'draft',
        lastModified: new Date().toISOString(),
        version: '1.0'
      },
      steps: {
        step1: draftQuote.step1 ? {
          customer: {
            contactId: draftQuote.step1.customer?.contactId || 0,
            contactName: draftQuote.step1.customer?.contactName || '',
            companyName: draftQuote.step1.customer?.companyName || '',
            email: draftQuote.step1.customer?.email || ''
          },
          route: {
            origin: {
              city: {
                name: draftQuote.step1.route?.origin?.city?.name || '',
                country: draftQuote.step1.route?.origin?.city?.country || ''
              },
              port: {
                portId: draftQuote.step1.route?.origin?.port?.portId || 0,
                portName: draftQuote.step1.route?.origin?.port?.portName || '',
                country: draftQuote.step1.route?.origin?.port?.country || ''
              }
            },
            destination: {
              city: {
                name: draftQuote.step1.route?.destination?.city?.name || '',
                country: draftQuote.step1.route?.destination?.city?.country || ''
              },
              port: {
                portId: draftQuote.step1.route?.destination?.port?.portId || 0,
                portName: draftQuote.step1.route?.destination?.port?.portName || '',
                country: draftQuote.step1.route?.destination?.port?.country || ''
              }
            }
          },
          cargo: {
            product: {
              productId: draftQuote.step1.cargo?.product?.productId || 0,
              productName: draftQuote.step1.cargo?.product?.productName || ''
            },
            incoterm: draftQuote.step1.cargo?.incoterm || ''
          },
          metadata: {
            comment: draftQuote.step1.metadata?.comment || ''
          }
        } : undefined,
        step2: draftQuote.step2 ? {
          selectedServices: (() => {
            const selected = draftQuote.step2.selected || [];
            const selectedServices = draftQuote.step2.selectedServices || [];
            const finalServices = selected.length > 0 ? selected : selectedServices;
            
            console.log('🔧 [BUILD_SDK_PAYLOAD] Step2 services:', {
              selected: selected.length,
              selectedServices: selectedServices.length,
              finalServices: finalServices.length,
              selectedDetails: selected.map(s => s.serviceName),
              selectedServicesDetails: selectedServices.map(s => s.serviceName)
            });
            
            return finalServices.map(service => ({
              serviceId: service.serviceId || 0,
              serviceName: service.serviceName || '',
              category: service.category || '',
              usagePercent: service.usagePercent || 0
            }));
          })()
        } : undefined,
        step3: draftQuote.step3 ? {
          containers: (draftQuote.step3.containers || []).map(container => ({
            id: container.id || '',
            type: container.type || '',
            quantity: container.quantity || 0,
            teu: container.teu || 0
          })),
          summary: {
            totalContainers: draftQuote.step3.summary?.totalContainers || 0,
            totalTEU: draftQuote.step3.summary?.totalTEU || 0,
            containerTypes: draftQuote.step3.summary?.containerTypes || []
          },
          route: {
            origin: {
              city: {
                name: draftQuote.step3.route?.origin?.city?.name || '',
                country: draftQuote.step3.route?.origin?.city?.country || ''
              },
              port: {
                portId: draftQuote.step3.route?.origin?.port?.portId || 0,
                portName: draftQuote.step3.route?.origin?.port?.portName || '',
                country: draftQuote.step3.route?.origin?.port?.country || ''
              }
            },
            destination: {
              city: {
                name: draftQuote.step3.route?.destination?.city?.name || '',
                country: draftQuote.step3.route?.destination?.city?.country || ''
              },
              port: {
                portId: draftQuote.step3.route?.destination?.port?.portId || 0,
                portName: draftQuote.step3.route?.destination?.port?.portName || '',
                country: draftQuote.step3.route?.destination?.port?.country || ''
              }
            }
          }
        } : undefined,
        step4: draftQuote.step4 ? {
          selection: {
            offerId: draftQuote.step4.selection?.offerId || '',
            haulierId: draftQuote.step4.selection?.haulierId || 0,
            haulierName: draftQuote.step4.selection?.haulierName || '',
            tariff: {
              unitPrice: draftQuote.step4.selection?.tariff?.unitPrice || 0,
              currency: draftQuote.step4.selection?.tariff?.currency || '',
              freeTime: draftQuote.step4.selection?.tariff?.freeTime || 0
            },
            route: {
              pickup: {
                company: draftQuote.step4.selection?.route?.pickup?.company || '',
                city: draftQuote.step4.selection?.route?.pickup?.city || '',
                country: draftQuote.step4.selection?.route?.pickup?.country || ''
              },
              delivery: {
                portId: draftQuote.step4.selection?.route?.delivery?.portId || 0,
                portName: draftQuote.step4.selection?.route?.delivery?.portName || '',
                country: draftQuote.step4.selection?.route?.delivery?.country || ''
              }
            },
            validity: {
              validUntil: draftQuote.step4.selection?.validity?.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            overtimeQuantity: draftQuote.step4.selection?.overtimeQuantity || 0,
            overtimePrice: draftQuote.step4.selection?.overtimePrice || 0
          },
          calculation: {
            quantity: draftQuote.step4.calculation?.quantity || 0,
            unitPrice: draftQuote.step4.calculation?.unitPrice || 0,
            subtotal: draftQuote.step4.calculation?.subtotal || 0,
            overtimeAmount: draftQuote.step4.calculation?.overtimeAmount || 0,
            totalAmount: draftQuote.step4.calculation?.totalAmount || 0,
            currency: draftQuote.step4.calculation?.currency || ''
          }
        } : undefined,
        step5: (draftQuote.draftData?.steps?.step5 || draftQuote.step5) ? {
          selections: ((draftQuote.draftData?.steps?.step5?.selections || draftQuote.step5?.selections) || []).map(selection => ({
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
                type: String(surcharge.type || ''), // ✅ CORRECTION : Convertir en string
                description: surcharge.description || '',
                isMandatory: surcharge.isMandatory || false,
                currency: surcharge.currency || ''
              })),
              totalPrice: selection.charges?.totalPrice || 0
            },
            service: {
              deliveryTerms: selection.service?.deliveryTerms || '',
              createdBy: selection.service?.createdBy || '',
              createdDate: selection.service?.createdDate || new Date().toISOString()
            },
            validity: {
              startDate: selection.validity?.startDate || new Date().toISOString(),
              endDate: selection.validity?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            remarks: selection.remarks || '',
            isSelected: selection.isSelected || false,
            selectedAt: selection.selectedAt || new Date().toISOString()
          })),
          summary: {
            totalSelections: (draftQuote.draftData?.steps?.step5?.summary?.totalSelections || draftQuote.step5?.summary?.totalSelections) || 0,
            totalContainers: (draftQuote.draftData?.steps?.step5?.summary?.totalContainers || draftQuote.step5?.summary?.totalContainers) || 0,
            totalAmount: (draftQuote.draftData?.steps?.step5?.summary?.totalAmount || draftQuote.step5?.summary?.totalAmount) || 0,
            currency: (draftQuote.draftData?.steps?.step5?.summary?.currency || draftQuote.step5?.summary?.currency) || '',
            selectedCarriers: (draftQuote.draftData?.steps?.step5?.summary?.selectedCarriers || draftQuote.step5?.summary?.selectedCarriers) || [],
            containerTypes: (draftQuote.draftData?.steps?.step5?.summary?.containerTypes || draftQuote.step5?.summary?.containerTypes) || [],
            preferredSelectionId: (draftQuote.draftData?.steps?.step5?.summary?.preferredSelectionId || draftQuote.step5?.summary?.preferredSelectionId) || ''
          }
        } : undefined,
        step6: draftQuote.step6 ? {
          selections: (draftQuote.step6.selections || []).map(selection => ({
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
              validUntil: selection.validity?.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            }
          })),
          summary: {
            totalSelections: draftQuote.step6.summary?.totalSelections || 0,
            totalAmount: draftQuote.step6.summary?.totalAmount || 0,
            currency: draftQuote.step6.summary?.currency || '',
            categories: draftQuote.step6.summary?.categories || []
          }
        } : undefined,
        step7: draftQuote.step7 ? {
          finalization: {
            optionName: draftQuote.step7.finalization?.optionName || '',
            optionDescription: draftQuote.step7.finalization?.optionDescription || '',
            marginPercentage: draftQuote.step7.finalization?.marginPercentage || 0,
            marginAmount: draftQuote.step7.finalization?.marginAmount || 0,
            marginType: draftQuote.step7.finalization?.marginType || '',
            isReadyToGenerate: draftQuote.step7.finalization?.isReadyToGenerate || false,
            generatedAt: draftQuote.step7.finalization?.generatedAt || new Date().toISOString()
          },
          validation: {
            allStepsValid: draftQuote.step7.validation?.allStepsValid || false,
            errors: (draftQuote.step7.validation?.errors || []).map((error: any) => ({
              stepNumber: error?.stepNumber || 0,
              fieldName: error?.fieldName || '',
              errorMessage: error?.errorMessage || '',
              errorCode: error?.errorCode || ''
            })),
            warnings: (draftQuote.step7.validation?.warnings || []).map((warning: any) => ({
              stepNumber: warning?.stepNumber || 0,
              fieldName: warning?.fieldName || '',
              warningMessage: warning?.warningMessage || '',
              warningCode: warning?.warningCode || ''
            }))
          },
          pricingSummary: {
            baseTotal: draftQuote.step7.pricingSummary?.baseTotal || 0,
            marginAmount: draftQuote.step7.pricingSummary?.marginAmount || 0,
            finalTotal: draftQuote.step7.pricingSummary?.finalTotal || 0,
            currency: draftQuote.step7.pricingSummary?.currency || '',
            breakdown: {
              haulageAmount: draftQuote.step7.pricingSummary?.breakdown?.haulageAmount || 0,
              seafreightAmount: draftQuote.step7.pricingSummary?.breakdown?.seafreightAmount || 0,
              miscellaneousAmount: draftQuote.step7.pricingSummary?.breakdown?.miscellaneousAmount || 0,
              totalBeforeMargin: draftQuote.step7.pricingSummary?.breakdown?.totalBeforeMargin || 0,
              components: (draftQuote.step7.pricingSummary?.breakdown?.components || []).map(component => ({
                name: component.name || '',
                category: component.category || '',
                amount: component.amount || 0,
                currency: component.currency || '',
                description: component.description || ''
              }))
            }
          }
        } : undefined
      },
      totals: {
        haulage: draftQuote.totals?.haulage || 0,
        seafreight: draftQuote.totals?.seafreight || 0,
        miscellaneous: draftQuote.totals?.miscellaneous || 0,
        subtotal: draftQuote.totals?.subtotal || 0,
        grandTotal: draftQuote.totals?.grandTotal || 0,
        currency: draftQuote.totals?.currency || '',
        totalTEU: draftQuote.totals?.totalTEU || 0
      },
      // ✅ AJOUT : Inclure les options sauvegardées dans draftData avec nouvelle structure complète
      options: (draftQuote.savedOptions || []).map(option => ({
        optionId: option.optionId,
        name: option.name,
        description: option.description || '',
        haulageSelectionId: option.haulageSelectionId || null,
        seafreightSelectionIds: option.seafreightSelectionIds || [],
        miscSelectionIds: option.miscSelectionIds || [],
        step4Data: option.step4Data || null,
        step5Data: option.step5Data || null,
        step6Data: option.step6Data || null,
        step7Data: option.step7Data || null,
        marginType: option.marginType,
        marginValue: option.marginValue,
        totals: {
          haulageTotalAmount: option.totals.haulageTotalAmount,
          seafreightBaseAmount: option.totals.seafreightBaseAmount,
          seafreightSurchargesAmount: option.totals.seafreightSurchargesAmount,
          seafreightTotalAmount: option.totals.seafreightTotalAmount,
          miscTotalAmount: option.totals.miscTotalAmount,
          subTotal: option.totals.subTotal,
          marginAmount: option.totals.marginAmount,
          finalTotal: option.totals.finalTotal,
          currency: option.totals.currency,
          calculatedAt: option.totals.calculatedAt
        },
        createdAt: option.createdAt,
        updatedAt: option.updatedAt || null,
        createdBy: option.createdBy || null,
        calculatedMargin: option.calculatedMargin || option.totals.marginAmount,
        finalTotal: option.finalTotal || option.totals.finalTotal
      })),
      currentWorkingOptionId: draftQuote.currentWorkingOptionId || null,
      preferredOptionId: draftQuote.preferredOptionId || '',
      maxOptionsAllowed: draftQuote.maxOptionsAllowed || 3
    }
  };
  
  // ✅ VALIDATION ET FORMATAGE DES DATES
  // S'assurer que tous les champs de date sont au bon format
  if (payload.draftData?.steps?.step4?.selection?.validity?.validUntil) {
    try {
      // Vérifier que la date est valide et au bon format
      const date = new Date(payload.draftData.steps.step4.selection.validity.validUntil);
      if (isNaN(date.getTime())) {
        // Si la date n'est pas valide, utiliser une date par défaut
        payload.draftData.steps.step4.selection.validity.validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        console.log('🔧 [BUILD_SDK_PAYLOAD] Date invalide corrigée:', payload.draftData.steps.step4.selection.validity.validUntil);
      }
    } catch (error) {
      console.warn('🔧 [BUILD_SDK_PAYLOAD] Erreur lors de la validation de la date:', error);
      // Fallback vers une date par défaut
      payload.draftData.steps.step4.selection.validity.validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  }
  
  // ✅ GESTION DU CHAMP generatedAt (nullable DateTime)
  // L'API attend System.Nullable<System.DateTime>, donc on doit gérer les chaînes vides
  if (payload.draftData?.steps?.step7?.finalization?.generatedAt === '') {
    // Définir une date par défaut si c'est une chaîne vide
    payload.draftData.steps.step7.finalization.generatedAt = new Date().toISOString();
    console.log('🔧 [BUILD_SDK_PAYLOAD] Champ generatedAt défini avec date par défaut:', payload.draftData.steps.step7.finalization.generatedAt);
  }
  
  // Log du payload final pour debug
  console.log('🔧 [BUILD_SDK_PAYLOAD] Payload final:', JSON.stringify(payload, null, 2));
  
  // Log spécifique pour les options sauvegardées
  if (payload.draftData?.options && payload.draftData.options.length > 0) {
    console.log('🔧 [BUILD_SDK_PAYLOAD] Options incluses dans draftData.options:', {
      count: payload.draftData.options.length,
      options: payload.draftData.options.map((opt: any) => ({
        id: opt.optionId,
        name: opt.name,
        finalTotal: opt.totals.finalTotal
      }))
    });
  } else {
    console.log('🔧 [BUILD_SDK_PAYLOAD] Aucune option dans draftData.options');
  }
  
  return payload;
}

/**
 * Crée un brouillon initial avec des valeurs par défaut
 */
export function createInitialDraftQuote(currentUserEmail?: string, existingRequestQuoteId?: string): DraftQuote {
  // ✅ VALIDATION OBLIGATOIRE du requestQuoteId
  if (!existingRequestQuoteId) {
    throw new Error('RequestQuoteId obligatoire - impossible de créer un brouillon sans requête existante');
  }
  
  // Log pour debug
  console.log('🎯 [CREATE_INITIAL_DRAFT] Création du brouillon initial:', {
    currentUserEmail,
    existingRequestQuoteId,
    requestQuoteId: existingRequestQuoteId
  });
  
  return {
    id: 'new', // ✅ ID temporaire - sera remplacé par l'API
    draftId: undefined, // ✅ Sera auto-généré par l'API lors de la création
    requestQuoteId: existingRequestQuoteId, // ✅ ID de la requête originale (obligatoire)
    clientNumber: 'DEFAULT',
    emailUser: currentUserEmail || '',
    step1: {
      customer: { contactId: 0, contactName: '', companyName: '', email: currentUserEmail || '' },
      cityFrom: { name: '', country: '' },
      cityTo: { name: '', country: '' },
      productName: { productId: 0, productName: '' },
      status: 'NEW',
      assignee: currentUserEmail || "",
      comment: "",
      incotermName: "",
      portFrom: { portId: 0, portName: '', country: '' },
      portTo: { portId: 0, portName: '', country: '' },
      route: {
        origin: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } },
        destination: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } }
      },
      cargo: { product: { productId: 0, productName: '' }, incoterm: "" },
      metadata: { comment: "" }
    },
    step2: { selectedServices: [], selected: [] },
    step3: { 
      containers: [],
      summary: { totalContainers: 0, totalTEU: 0, containerTypes: [] },
      route: {
        origin: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } },
        destination: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } }
      },
      selectedContainers: { list: [] }
    },
    step4: {
      selection: {
        offerId: '', haulierId: 0, haulierName: '',
        tariff: { unitPrice: 0, currency: '', freeTime: 0 },
        route: { pickup: { company: '', city: '', country: '' }, delivery: { portId: 0, portName: '', country: '' } },
        validity: { validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }
      },
      calculation: { quantity: 0, unitPrice: 0, subtotal: 0, currency: '' }
    },
    step5: {
      selections: [],
      summary: { totalSelections: 0, totalContainers: 0, totalAmount: 0, currency: '', selectedCarriers: [], containerTypes: [], preferredSelectionId: '' }
    },
    step6: {
      selections: [],
      summary: { totalSelections: 0, totalAmount: 0, currency: '', categories: [] }
    },
    step7: {
      finalization: { optionName: '', optionDescription: '', marginPercentage: 0, marginAmount: 0, marginType: 'percentage', isReadyToGenerate: false, generatedAt: '' },
      validation: { allStepsValid: false, errors: [], warnings: [] },
      pricingSummary: {
        baseTotal: 0, marginAmount: 0, finalTotal: 0, currency: '',
        breakdown: { haulageAmount: 0, seafreightAmount: 0, miscellaneousAmount: 0, totalBeforeMargin: 0, components: [] }
      }
    },
    totals: { seafreight: 0, haulage: 0, miscellaneous: 0, subtotal: 0, grandTotal: 0, currency: '', totalTEU: 0 },
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
    draftData: {
      wizard: { currentStep: 1, completedSteps: [], status: 'draft', lastModified: new Date().toISOString(), version: '1.0' },
      steps: {
        step1: { customer: { contactId: 0, contactName: '', companyName: '', email: currentUserEmail || '' }, cityFrom: { name: '', country: '' }, cityTo: { name: '', country: '' }, productName: { productId: 0, productName: '' }, status: 'NEW', assignee: currentUserEmail || "", comment: "", incotermName: "", portFrom: { portId: 0, portName: '', country: '' }, portTo: { portId: 0, portName: '', country: '' }, route: { origin: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } }, destination: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } } }, cargo: { product: { productId: 0, productName: '' }, incoterm: "" }, metadata: { comment: "" } },
        step2: { selectedServices: [], selected: [] },
        step3: { containers: [], summary: { totalContainers: 0, totalTEU: 0, containerTypes: [] }, route: { origin: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } }, destination: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } } }, selectedContainers: { list: [] } },
        step4: { selection: { offerId: '', haulierId: 0, haulierName: '', tariff: { unitPrice: 0, currency: '', freeTime: 0 }, route: { pickup: { company: '', city: '', country: '' }, delivery: { portId: 0, portName: '', country: '' } }, validity: { validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() } }, calculation: { quantity: 0, unitPrice: 0, subtotal: 0, currency: '' } },
        step5: { selections: [], summary: { totalSelections: 0, totalContainers: 0, totalAmount: 0, currency: '', selectedCarriers: [], containerTypes: [], preferredSelectionId: '' } },
        step6: { selections: [], summary: { totalSelections: 0, totalAmount: 0, currency: '', categories: [] } },
        step7: { finalization: { optionName: '', optionDescription: '', marginPercentage: 0, marginAmount: 0, marginType: 'percentage', isReadyToGenerate: false, generatedAt: '' }, validation: { allStepsValid: false, errors: [], warnings: [] }, pricingSummary: { baseTotal: 0, marginAmount: 0, finalTotal: 0, currency: '', breakdown: { haulageAmount: 0, seafreightAmount: 0, miscellaneousAmount: 0, totalBeforeMargin: 0, components: [] } } }
      },
      totals: { seafreight: 0, haulage: 0, miscellaneous: 0, subtotal: 0, grandTotal: 0, currency: '', totalTEU: 0 }
    }
  };
}

/**
 * Valide les données de navigation et extrait les informations nécessaires
 */
export function validateNavigationData(locationState: any): {
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

/**
 * Crée un brouillon avec l'ID existant et enrichit step1 avec les données de la requête
 * Transforme les données de requête en structure DraftQuote
 */
export function createDraftQuoteFromRequest(requestData: any, currentUserEmail?: string): DraftQuote {
  // ✅ VALIDATION OBLIGATOIRE du requestQuoteId
  if (!requestData.requestQuoteId) {
    throw new Error('RequestQuoteId manquant dans les données de requête - impossible de créer un brouillon');
  }
  
  console.log('🔄 [DRAFT_CREATION] Création du brouillon depuis la requête:', {
    requestId: requestData.requestQuoteId,
    companyName: requestData.companyName,
    assigneeId: requestData.assigneeId,
    assigneeDisplayName: requestData.assigneeDisplayName,
    incoterm: requestData.incoterm,
    pickupCity: requestData.pickupLocation?.city,
    deliveryCity: requestData.deliveryLocation?.city,
    productName: requestData.productName
  });

  // Créer un brouillon de base
  const draftQuote = createInitialDraftQuote(currentUserEmail, requestData.requestQuoteId);
  
  // Enrichir step1 avec les données de la requête
  const enrichedStep1: Partial<Step1> = {
    ...draftQuote.step1,
    customer: {
      contactId: requestData.customerId || 0,
      contactName: requestData.companyName || '',
      companyName: requestData.companyName || '',
      email: requestData.assigneeDisplayName || currentUserEmail || ''
    },
    route: {
      origin: {
        city: {
          name: requestData.pickupLocation?.city || '',
          country: requestData.pickupLocation?.country || ''
        },
        port: { portId: 0, portName: '', country: requestData.pickupLocation?.country || '' }
      },
      destination: {
        city: {
          name: requestData.deliveryLocation?.city || '',
          country: requestData.deliveryLocation?.country || ''
        },
        port: { portId: 0, portName: '', country: requestData.deliveryLocation?.country || '' }
      }
    },
    cargo: {
      product: { productId: requestData.productId || 0, productName: requestData.productName || '' },
      incoterm: requestData.incoterm || ''
    },
    assignee: requestData.assigneeDisplayName || currentUserEmail || '',
    cityFrom: { 
      name: requestData.pickupLocation?.city || '', 
      country: requestData.pickupLocation?.country || '' 
    },
    cityTo: { 
      name: requestData.deliveryLocation?.city || '', 
      country: requestData.deliveryLocation?.country || '' 
    },
    productName: { 
      productId: requestData.productId || 0, 
      productName: requestData.productName || '' 
    },
    incotermName: requestData.incoterm || '',
    portFrom: { 
      portId: 0, 
      portName: '', 
      country: requestData.pickupLocation?.country || '' 
    },
    portTo: { 
      portId: 0, 
      portName: '', 
      country: requestData.deliveryLocation?.country || '' 
    },
    comment: requestData.additionalComments || ''
  };

  // Log des données assignee et incoterm spécifiquement
  console.log('✅ [DRAFT_CREATION] Données assignee et incoterm:', {
    assignee: enrichedStep1.assignee,
    incoterm: enrichedStep1.incotermName,
    assigneeSource: requestData.assigneeDisplayName ? 'API' : 'Défaut',
    incotermSource: requestData.incoterm ? 'API' : 'Défaut'
  });

  // Retourner le brouillon enrichi
  const finalDraft = {
    ...draftQuote,
    requestQuoteId: requestData.requestQuoteId || draftQuote.requestQuoteId,
    clientNumber: requestData.companyName || draftQuote.clientNumber,
    emailUser: requestData.assigneeDisplayName || currentUserEmail || draftQuote.emailUser,
    step1: enrichedStep1 as Step1
  };

  console.log('🎯 [DRAFT_CREATION] Brouillon final créé avec:', {
    requestQuoteId: finalDraft.requestQuoteId,
    clientNumber: finalDraft.clientNumber,
    emailUser: finalDraft.emailUser,
    step1Assignee: finalDraft.step1.assignee,
    step1Incoterm: finalDraft.step1.incotermName
  });

  return finalDraft;
}

// ---- Small test helper when running in Node context ----
if (typeof require !== "undefined" && require.main === module) {
  const fs = require("fs");
  const path = require("path");
  const parsed = JSON.parse(fs.readFileSync(path.resolve(__dirname, "parsedData.json"), "utf-8"));
  const result = loadDraftFromDatabase(parsed);
  fs.writeFileSync(path.resolve(__dirname, "draftQuote.generated.json"), JSON.stringify(result, null, 2));
  console.log("✅ draftQuote.generated.json written.");
}
