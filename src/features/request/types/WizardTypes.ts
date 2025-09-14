// === TYPES CENTRALISÉS POUR LE WIZARD ===
import type { StatusRequest } from '@features/request/api/types.gen';

// === INTERFACE PRINCIPALE DU DRAFT QUOTE ===
export interface DraftQuote {
  step1: DraftQuoteStep1;
  step2: DraftQuoteStep2;
  step3: DraftQuoteStep3;
  savedOptions: QuoteOption[];
  selectedHaulage?: HaulageSelection;
  selectedSeafreights?: SeafreightSelection[];
  selectedMiscellaneous: MiscellaneousSelection[];
  selectedContainers: { [key: string]: ContainerSelection };
  marginType: 'percent' | 'fixed';
  marginValue: number;
  totalPrice: number;
  seafreightTotal?: number;
  haulageTotal?: number;
  miscTotal?: number;
  totalTEU?: number;
  haulageQuantity?: number;
  seafreightQuantities?: { [id: string]: number };
  miscQuantities?: { [id: string]: number };
  surchargeQuantities?: { [offerId: string]: { [surchargeName: string]: number } };
}

// === STEP 1 - INFORMATIONS CLIENT ===
export interface DraftQuoteStep1 {
  customer?: CustomerSelection;
  cityFrom?: CitySelection;
  cityTo?: CitySelection;
  productName?: ProductSelection;
  status: StatusRequest;
  assignee: string;
  comment: string;
  incotermName: string;
  portFrom?: PortSelection;
  portTo?: PortSelection;
  pickupLocation?: LocationSelection;
  deliveryLocation?: LocationSelection;
}

// === STEP 2 - SERVICES ===
export interface DraftQuoteStep2 {
  selected: ServiceSelection[];
}

// === STEP 3 - CONTENEURS ===
export interface DraftQuoteStep3 {
  selectedContainers: { [key: string]: ContainerSelection[] };
}

// === SÉLECTIONS SPÉCIFIQUES ===
export interface CustomerSelection {
  contactId: number;
  contactName: string;
  companyName?: string;
  email?: string;
}

export interface CitySelection {
  name: string;
  country?: CountrySelection;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface CountrySelection {
  code: string;
  name: string;
  flag?: string;
}

export interface ProductSelection {
  productId: number;
  productName: string;
  hsCode?: string;
  category?: string;
}

export interface PortSelection {
  name: string;
  code: string;
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface LocationSelection {
  address?: string;
  city: string;
  country: string;
  postalCode?: string;
}

export interface ServiceSelection {
  id: string;
  name: string;
  category: string;
  isSelected: boolean;
  price?: number;
  currency?: string;
}

export interface ContainerSelection {
  type: string;
  quantity: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  isSpecial?: boolean;
}

export interface HaulageSelection {
  id: string;
  name: string;
  provider: string;
  price: number;
  currency: string;
  transitTime?: number;
  details?: any;
}

export interface SeafreightSelection {
  id: string;
  name: string;
  carrier: string;
  price: number;
  currency: string;
  transitTime?: number;
  vessel?: string;
  details?: any;
}

export interface MiscellaneousSelection {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  quantity?: number;
  details?: any;
}

// === OPTIONS ET DEVIS ===
export interface QuoteOption {
  id: string;
  name: string;
  haulage?: HaulageSelection;
  seafreights: SeafreightSelection[];
  miscellaneous: MiscellaneousSelection[];
  totalPrice: number;
  currency: string;
  margin: {
    type: 'percent' | 'fixed';
    value: number;
  };
  createdAt: Date;
  isSelected?: boolean;
}

// === VALIDATION ===
export interface ValidationError {
  field: string;
  message: string;
  step: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: string[];
}

// === PERSISTANCE ===
export interface SaveOptions {
  retryCount?: number;
  fallbackToLocalStorage?: boolean;
  validateData?: boolean;
  showNotifications?: boolean;
}

export interface DraftPersistenceResult {
  success: boolean;
  draftId?: string;
  error?: string;
  usedFallback?: boolean;
  timestamp?: Date;
}

// === WIZARD STATE ===
export interface WizardState {
  activeStep: number;
  currentStep: number;
  totalSteps: number;
  isLoading: boolean;
  isSaving: boolean;
  isComplete: boolean;
  isDirty: boolean;
  lastSaved?: Date;
  error?: string;
}

// === NAVIGATION ===
export interface NavigationOptions {
  skipValidation?: boolean;
  forceSave?: boolean;
  showConfirmation?: boolean;
}

// === HOOKS TYPES ===
export interface UseWizardStateReturn {
  // États
  activeStep: number;
  currentStep: number;
  draftQuote: DraftQuote;
  savedOptions: QuoteOption[];
  isSaving: boolean;
  lastSaved: Date | null;
  
  // Setters
  setActiveStep: (step: number) => void;
  setCurrentStep: (step: number) => void;
  setDraftQuote: React.Dispatch<React.SetStateAction<DraftQuote>>;
  setSavedOptions: React.Dispatch<React.SetStateAction<QuoteOption[]>>;
  setIsSaving: (saving: boolean) => void;
  setLastSaved: (date: Date | null) => void;
  
  // Actions
  goToStep: (step: number, saveCurrentStepFn?: (stepIndex: number) => Promise<void>) => Promise<void>;
  updateStep1: (updates: Partial<DraftQuoteStep1>) => void;
  resetWizard: () => void;
  
  // Computed
  validationErrors: string[];
  canProceedToNextStep: boolean;
  optimizedDraftData: any;
  
  // Utils
  createInitialDraftQuote: () => DraftQuote;
}

// === API TYPES ===
export interface ApiDraftData {
  wizard?: {
    currentStep: number;
    status: string;
    lastModified: string;
  };
  steps?: {
    step1?: any;
    step2?: any;
    step3?: any;
  };
  options?: QuoteOption[];
  pricing?: {
    selectedHaulage?: HaulageSelection;
    selectedSeafreights?: SeafreightSelection[];
    selectedMiscellaneous?: MiscellaneousSelection[];
  };
  totals?: {
    grandTotal: number;
    currency: string;
  };
}

// === FORM PROPS ===
export interface Step1FormProps {
  customer?: CustomerSelection;
  cityFrom?: CitySelection;
  cityTo?: CitySelection;
  productName?: ProductSelection;
  status: StatusRequest;
  assignee: string;
  comment: string;
  incotermName: string;
  
  setCustomer: (customer: CustomerSelection) => void;
  setCityFrom: (cityFrom: CitySelection) => void;
  setCityTo: (cityTo: CitySelection) => void;
  setProductName: (productName: ProductSelection) => void;
  setStatus: (status: StatusRequest) => void;
  setAssignee: (assignee: string) => void;
  setComment: (comment: string) => void;
  setIncotermName: (incotermName: string) => void;
  
  // Nouvelles props pour l'optimisation
  draftQuote: DraftQuote;
  setDraftQuote: React.Dispatch<React.SetStateAction<DraftQuote>>;
  onLocalSave: () => Promise<void>;
  onApiSave: () => Promise<void>;
  isSaving: boolean;
  saveStatus: 'idle' | 'success' | 'error';
}

// === TYPES D'EXPORT ===
export type {
  StatusRequest
} from '@features/request/api/types.gen';
