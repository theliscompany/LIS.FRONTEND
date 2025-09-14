/**
 * Interface TypeScript pour la structure enrichie des options de devis
 * Basée sur le payload enrichi avec métadonnées complètes
 */

export interface ServiceLevel {
  transitTime: string;
  reliability: string;
  trackingLevel: 'standard' | 'premium' | 'real-time';
  insuranceIncluded: boolean;
  priorityHandling: boolean;
  dedicatedAgent?: boolean;
  emergencyContact?: boolean;
  weekendService?: boolean;
}

export interface ValidityPeriod {
  validFrom: string;
  validUntil: string;
  isExpired: boolean;
  daysRemaining: number;
  shortValidity?: boolean;
}

export interface Surcharge {
  code: string;
  name: string;
  amount: number;
  currency: string;
  mandatory: boolean;
}

export interface HaulageBreakdown {
  baseAmount: number;
  description: string;
  supplier: string;
  details: {
    serviceType?: string;
    distance?: string;
    freeTime?: string;
    overtimeRate?: string;
    trackingIncluded?: boolean;
    weekendService?: boolean;
    emergencyContact?: string;
  };
}

export interface SeafreightBreakdown {
  baseAmount: number;
  surchargesAmount: number;
  totalAmount: number;
  description: string;
  carrier: string;
  details: {
    vesselName?: string;
    voyageNumber?: string;
    etd?: string;
    eta?: string;
    transitDays?: number;
    frequency?: string;
    serviceType?: string;
    guaranteedSpace?: boolean;
  };
  surcharges: Surcharge[];
}

export interface MiscellaneousService {
  serviceId: number;
  name: string;
  amount: number;
  supplier: string;
  mandatory: boolean;
  description: string;
}

export interface OptionBreakdown {
  haulage: HaulageBreakdown;
  seafreight: SeafreightBreakdown;
  miscellaneous: MiscellaneousService[];
}

export interface CompetitiveAnalysis {
  marketPosition: 'competitive' | 'premium' | 'ultra-premium';
  priceVsMarket: number;
  strengthPoints: string[];
  riskFactors: string[];
}

export interface OptionGuarantees {
  deliveryGuarantee: boolean;
  maxDelay?: string;
  penaltyClause?: string;
  moneyBackGuarantee: boolean;
  serviceLevel?: string;
}

export interface OptionAlert {
  type: 'info' | 'warning' | 'error';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface EnrichedOptionTotals {
  haulageTotalAmount: number;
  seafreightTotalAmount: number;
  miscTotalAmount: number;
  subTotal: number;
  marginAmount: number;
  finalTotal: number;
  currency: string;
  vatAmount?: number;
  grandTotalWithVat?: number;
  vatRate?: number;
}

export interface EnrichedDraftOption {
  // Identifiants et métadonnées de base
  optionId: string;
  name: string;
  description: string;
  marginType: 'percentage' | 'amount';
  marginValue: number;
  createdAt: string;
  lastModified?: string;
  createdBy?: string;
  
  // Statut et priorité
  status: 'active' | 'inactive' | 'expired';
  priority: number;
  isPreferred: boolean;
  tags: string[];
  category: 'STANDARD' | 'PREMIUM' | 'EXPRESS';
  
  // Validité
  validityPeriod: ValidityPeriod;
  
  // Niveau de service
  serviceLevel: ServiceLevel;
  
  // Totaux enrichis
  totals: EnrichedOptionTotals;
  
  // Breakdown détaillé des coûts
  breakdown: OptionBreakdown;
  
  // Analyse concurrentielle
  competitiveAnalysis: CompetitiveAnalysis;
  
  // Garanties (optionnel pour les options premium/express)
  guarantees?: OptionGuarantees;
  
  // Notes client et internes
  clientNotes?: string;
  internalNotes?: string;
  
  // Alertes (optionnel)
  alerts?: OptionAlert[];
}

export interface OptionsMetadata {
  totalOptionsCreated: number;
  lastOptionCreated: string;
  averageMargin: number;
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  recommendedOption?: string;
  competitiveAnalysis: {
    marketAverage: number;
    ourPosition: string;
    savings: {
      vsMarket: number;
      percentage: number;
    };
  };
  clientPreferences: {
    budgetSensitive: boolean;
    timeFlexible: boolean;
    qualityFocused: boolean;
    previousChoices: string[];
  };
}

/**
 * Interface pour le payload complet avec options enrichies
 */
export interface EnrichedDraftPayload {
  request: string;
  requestQuoteId: string;
  emailUser: string;
  clientNumber: string;
  comment: string;
  draftData: {
    wizard: {
      currentStep: number;
      completedSteps: number[];
      status: string;
      lastModified: string;
      version: string;
    };
    steps: any; // Les steps existants
    totals: any; // Les totaux existants
    options: EnrichedDraftOption[];
    currentWorkingOptionId?: string | null;
    preferredOptionId?: string;
    maxOptionsAllowed?: number;
    optionsMetadata?: OptionsMetadata;
  };
}

/**
 * Utilitaires pour la conversion entre formats
 */
export interface OptionConversionUtils {
  // Conversion option simple → enrichie
  enrichOption: (basicOption: any, additionalData?: any) => EnrichedDraftOption;
  
  // Conversion option enrichie → simple (pour compatibilité)
  simplifyOption: (enrichedOption: EnrichedDraftOption) => any;
  
  // Validation d'une option enrichie
  validateEnrichedOption: (option: EnrichedDraftOption) => boolean;
  
  // Calcul automatique des métadonnées
  calculateOptionsMetadata: (options: EnrichedDraftOption[]) => OptionsMetadata;
}
