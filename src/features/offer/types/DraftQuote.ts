// Types pour la nouvelle structure DraftQuote basée sur l'API générée

export interface DraftQuoteAddress {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  zip?: string | null;
  country?: string | null;
}

export interface DraftQuoteContactPerson {
  fullName?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface DraftQuoteCustomer {
  type?: string | null;
  name?: string | null;
  vat?: string | null;
  emails?: string[] | null;
  phones?: string[] | null;
  address?: DraftQuoteAddress;
  contactPerson?: DraftQuoteContactPerson;
}

export interface DraftQuoteLocation {
  location?: string | null;
  country?: string | null;
}

export interface DraftQuoteDocs {
  requiresVGM?: boolean;
  requiresBLDraftApproval?: boolean;
}

export interface DraftQuoteConstraints {
  minTruckLeadDays?: number;
  terminalCutoffDays?: number;
  customsDeadlineHours?: number;
}

export interface DraftQuoteShipment {
  mode?: string | null;
  containerCount?: number;
  containerTypes?: string[] | null;
  commodity?: string | null;
  hsCodes?: string[] | null;
  origin?: DraftQuoteLocation;
  destination?: DraftQuoteLocation;
  requestedDeparture?: Date | null;
  docs?: DraftQuoteDocs;
  constraints?: DraftQuoteConstraints;
}

export interface DraftQuoteAttachment {
  id?: string | null;
  name?: string | null;
  mime?: string | null;
}

export interface DraftQuoteDepositPolicy {
  type?: string | null;
  value?: number;
}

export interface DraftQuoteCommercialTerms {
  depositPolicy?: DraftQuoteDepositPolicy;
  generalConditionsId?: string | null;
}

export interface DraftQuoteContainerTotals {
  qty?: number;
  unitPrice?: number;
  subtotal?: number;
}

export interface DraftQuoteOptionContainer {
  containerType?: string | null;
  quantity?: number;
}

export interface DraftQuotePlanning {
  emptyPickupDate?: string | null;
  vgmDate?: string | null;
  siDate?: string | null;
  customsDate?: string | null;
  fullGateInDate?: string | null;
  etd?: string | null;
  eta?: string | null;
}

export interface DraftQuoteRate {
  containerType?: string | null;
  basePrice?: number;
}

export interface DraftQuoteSurcharge {
  code?: string | null;
  label?: string | null;
  calc?: string | null;
  base?: string | null;
  unit?: string | null;
  value?: number;
  currency?: string | null;
  taxable?: boolean;
  appliesTo?: string[] | null;
}

export interface DraftQuoteOptionSeafreight {
  id?: string | null;
  carrier?: string | null;
  service?: string | null;
  rate?: DraftQuoteRate[] | null;
  surcharges?: DraftQuoteSurcharge[] | null;
}

export interface DraftQuoteWindows {
  load?: string | null;
  returnDeadline?: string | null;
}

export interface DraftQuoteOptionHaulage {
  id?: string | null;
  phase?: string | null;
  mode?: string | null;
  from?: string | null;
  to?: string | null;
  pricingScope?: string | null;
  containerFilter?: string[] | null;
  windows?: DraftQuoteWindows;
  basePrice?: number;
  surcharges?: DraftQuoteSurcharge[] | null;
}

export interface DraftQuoteOptionService {
  code?: string | null;
  label?: string | null;
  calc?: string | null;
  unit?: string | null;
  value?: number;
  currency?: string | null;
  taxable?: boolean;
}

export interface DraftQuoteOptionTotals {
  perContainer?: { [key: string]: number } | null;
  byContainerType?: { [key: string]: DraftQuoteContainerTotals } | null;
  seafreightBaseTotal?: number;
  haulageTotal?: number;
  servicesTotal?: number;
  surchargesTotal?: number;
  grandTotal?: number;
}

export interface DraftQuoteOptionTerms {
  depositPolicy?: DraftQuoteDepositPolicy;
  generalConditionsId?: string | null;
}

export interface DraftQuoteOption {
  optionId?: string | null;
  label?: string | null;
  validUntil?: string | null;
  currency?: string | null;
  containers?: DraftQuoteOptionContainer[] | null;
  planning?: DraftQuotePlanning;
  seafreight?: DraftQuoteOptionSeafreight;
  haulages?: DraftQuoteOptionHaulage[] | null;
  services?: DraftQuoteOptionService[] | null;
  totals?: DraftQuoteOptionTotals;
  terms?: DraftQuoteOptionTerms;
}

export interface DraftQuoteSeafreight {
  id?: string | null;
  carrier?: string | null;
  service?: string | null;
  rate?: DraftQuoteRate[] | null;
  surcharges?: DraftQuoteSurcharge[] | null;
}

export interface DraftQuoteHaulage {
  id?: string | null;
  phase?: string | null;
  mode?: string | null;
  from?: string | null;
  to?: string | null;
  pricingScope?: string | null;
  containerFilter?: string[] | null;
  windows?: DraftQuoteWindows;
  basePrice?: number;
  surcharges?: DraftQuoteSurcharge[] | null;
}

export interface DraftQuoteService {
  code?: string | null;
  label?: string | null;
  calc?: string | null;
  unit?: string | null;
  value?: number;
  currency?: string | null;
  taxable?: boolean;
}

export interface DraftQuoteWizard {
  notes?: string | null;
  selectedServiceLevel?: string | null;
  seafreights?: DraftQuoteSeafreight[] | null;
  haulages?: DraftQuoteHaulage[] | null;
  services?: DraftQuoteService[] | null;
}

export interface DraftQuote {
  draftQuoteId?: string | null;
  requestQuoteId?: string | null;
  resumeToken?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  status?: string | null;
  currency?: string | null;
  incoterm?: string | null;
  customer?: DraftQuoteCustomer;
  shipment?: DraftQuoteShipment;
  attachments?: DraftQuoteAttachment[] | null;
  commercialTerms?: DraftQuoteCommercialTerms;
  wizard?: DraftQuoteWizard;
  options?: DraftQuoteOption[] | null;
}

// Types pour les requêtes
export interface CreateDraftQuoteRequest {
  requestQuoteId: string;
  customer?: DraftQuoteCustomer;
  shipment?: DraftQuoteShipment;
  wizard?: DraftQuoteWizard;
}

export interface AddDraftQuoteOptionRequest {
  option: DraftQuoteOption;
}

// Types pour les réponses API
export interface DraftQuoteResponse {
  draftQuoteId?: string | null;
  requestQuoteId?: string | null;
  resumeToken?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  status?: string | null;
  currency?: string | null;
  incoterm?: string | null;
  customer?: DraftQuoteCustomer;
  shipment?: DraftQuoteShipment;
  attachments?: DraftQuoteAttachment[] | null;
  commercialTerms?: DraftQuoteCommercialTerms;
  wizard?: DraftQuoteWizard;
  options?: DraftQuoteOption[] | null;
}

export interface CommonApiResponse<T> {
  code?: number;
  message?: string | null;
  data?: T;
  meta?: unknown;
  errors?: string[] | null;
}

export type DraftQuoteApiResponse = CommonApiResponse<DraftQuoteResponse>;
export type DraftQuoteListApiResponse = CommonApiResponse<DraftQuoteResponse[]>;

// Types pour les statuts
export type DraftQuoteStatus = 
  | 'draft'
  | 'in_progress'
  | 'finalized'
  | 'cancelled';

// Types pour les validations
export interface DraftQuoteValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Types pour les métadonnées d'audit
export interface DraftQuoteAudit {
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  version?: number;
}
