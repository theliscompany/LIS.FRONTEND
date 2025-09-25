import { QuoteOption } from '../schema';
import { 
  DraftQuoteOptionDto,
  DraftQuoteOptionSeafreightDto,
  DraftQuoteOptionHaulageDto,
  DraftQuoteOptionServiceDto,
  DraftQuoteOptionContainerDto,
  DraftQuoteOptionTotalsDto
} from '@features/offer/api/types.gen';

/**
 * Convertit une option de devis vers le format de l'API pour ajouter une option à un brouillon
 */
export const toDraftQuoteOptionPayload = (option: QuoteOption): DraftQuoteOptionDto => {
  console.log('🔄 [ADAPTER] Conversion de l\'option vers le format API:', option);
  console.log('🔍 [ADAPTER] option.seafreights:', option.seafreights);
  console.log('🔍 [ADAPTER] option.haulages:', option.haulages);
  console.log('🔍 [ADAPTER] option.services:', option.services);
  console.log('⭐ [ADAPTER] option.isPreferred:', option.isPreferred);

  // Calculer les totaux
  const totals = calculateOptionTotals(option);

  const payload = {
    optionId: option.id,
    label: option.name || 'Option sans nom',
    validUntil: option.validUntil || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    currency: option.currency || 'EUR',
    containers: option.containers?.map(toDraftQuoteOptionContainerDto) || [],
    seafreights: option.seafreights?.map(toDraftQuoteOptionSeafreightDto) || [],
    haulages: option.haulages?.map(toDraftQuoteOptionHaulageDto) || [],
    services: option.services?.map(toDraftQuoteOptionServiceDto) || [],
    totals: totals,
    isPreferred: option.isPreferred || false
  };

  console.log('✅ [ADAPTER] Payload final avec isPreferred:', payload);
  return payload;
};

/**
 * Convertit une sélection de seafreight vers DraftQuoteOptionSeafreightDto
 */
const toDraftQuoteOptionSeafreightDto = (seafreight: any): DraftQuoteOptionSeafreightDto => {
  return {
    id: seafreight.id || undefined,
    carrier: seafreight.carrier || undefined,
    service: seafreight.service || undefined,
    rate: seafreight.rates?.map((rate: any) => ({
      containerType: rate.containerType || '',
      basePrice: rate.basePrice || 0,
      currency: rate.currency || 'EUR'
    })) || [],
    surcharges: seafreight.surcharges || []
  };
};

/**
 * Convertit une sélection de haulage vers DraftQuoteOptionHaulageDto
 */
const toDraftQuoteOptionHaulageDto = (haulage: any): DraftQuoteOptionHaulageDto => {
  return {
    id: haulage.id || undefined,
    phase: haulage.leg || 'pre',
    mode: haulage.mode || 'truck',
    from: haulage.from || undefined,
    to: haulage.to || undefined,
    pricingScope: haulage.pricingScope || 'per_container',
    containerFilter: haulage.containerFilter || [],
    windows: haulage.windows || undefined,
    basePrice: haulage.price || 0,
    surcharges: haulage.surcharges || []
  };
};

/**
 * Convertit une sélection de service vers DraftQuoteOptionServiceDto
 */
const toDraftQuoteOptionServiceDto = (service: any): DraftQuoteOptionServiceDto => {
  return {
    code: service.code || undefined,
    label: service.label || undefined,
    calc: service.calc || 'flat',
    unit: service.unit || 'per_shipment',
    value: service.price || 0,
    currency: service.currency || 'EUR',
    taxable: service.taxable || false
  };
};

/**
 * Convertit un container vers DraftQuoteOptionContainerDto
 */
const toDraftQuoteOptionContainerDto = (container: any): DraftQuoteOptionContainerDto => {
  return {
    containerType: container.containerType || '',
    quantity: container.quantity || 1,
    teu: container.teu || 1
  };
};

/**
 * Calcule les totaux d'une option
 */
const calculateOptionTotals = (option: QuoteOption): DraftQuoteOptionTotalsDto => {
  const seafreightsTotal = option.seafreights?.reduce((total, sf) => {
    return total + (sf.rates?.reduce((rateTotal, rate) => rateTotal + (rate.basePrice || 0), 0) || 0);
  }, 0) || 0;

  const haulagesTotal = option.haulages?.reduce((total, haulage) => {
    return total + (haulage.price || 0);
  }, 0) || 0;

  const servicesTotal = option.services?.reduce((total, service) => {
    return total + (service.price || 0);
  }, 0) || 0;

  const grandTotal = seafreightsTotal + haulagesTotal + servicesTotal;

  return {
    seafreights: seafreightsTotal,
    haulages: haulagesTotal,
    services: servicesTotal,
    grandTotal: grandTotal
  };
};
