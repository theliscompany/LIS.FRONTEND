/**
 * Utility functions for calculating various totals and prices in the request wizard
 */

export interface CalculationResult {
  total: number;
  currency: string;
  breakdown: {
    base: number;
    surcharges: number;
    taxes?: number;
    discounts?: number;
  };
}

/**
 * Calculate haulage total for an option
 */
export const computeHaulageTotal = (option: any): number => {
  if (!option?.haulage) return 0;
  
  const haulage = option.haulage;
  const basePrice = haulage.unitPrice || haulage.unitTariff || 0;
  const quantity = haulage.quantity || 1;
  const surcharges = haulage.surchargesTotal || 0;
  
  return (basePrice * quantity) + surcharges;
};

/**
 * Calculate seafreight total for an option
 */
export const computeSeafreightTotal = (option: any): number => {
  if (!option?.seafreight) return 0;
  
  const seafreight = option.seafreight;
  const basePrice = seafreight.basePrice || seafreight.unitPrice || 0;
  const quantity = seafreight.quantity || 1;
  const surcharges = seafreight.surchargesTotal || 0;
  
  return (basePrice * quantity) + surcharges;
};

/**
 * Calculate miscellaneous services total for an option
 */
export const computeMiscTotal = (option: any): number => {
  if (!option?.miscellaneous || !Array.isArray(option.miscellaneous)) return 0;
  
  return option.miscellaneous.reduce((total: number, misc: any) => {
    const price = misc.price || misc.unitPrice || 0;
    const quantity = misc.quantity || 1;
    return total + (price * quantity);
  }, 0);
};

/**
 * Calculate cost price for an option
 */
export const computeCostPrice = (option: any): number => {
  const haulageTotal = computeHaulageTotal(option);
  const seafreightTotal = computeSeafreightTotal(option);
  const miscTotal = computeMiscTotal(option);
  
  return haulageTotal + seafreightTotal + miscTotal;
};

/**
 * Calculate total price for an option including margin
 */
export const computeTotalPrice = (option: any): number => {
  const costPrice = computeCostPrice(option);
  const marginType = option.marginType || 'percent';
  const marginValue = option.marginValue || 0;
  
  if (marginType === 'percent') {
    return costPrice * (1 + marginValue / 100);
  } else if (marginType === 'fixed') {
    return costPrice + marginValue;
  }
  
  return costPrice;
};

/**
 * Calculate margin amount for an option
 */
export const computeMarginAmount = (option: any): number => {
  const costPrice = computeCostPrice(option);
  const totalPrice = computeTotalPrice(option);
  
  return totalPrice - costPrice;
};

/**
 * Calculate margin percentage for an option
 */
export const computeMarginPercentage = (option: any): number => {
  const costPrice = computeCostPrice(option);
  const marginAmount = computeMarginAmount(option);
  
  if (costPrice === 0) return 0;
  
  return (marginAmount / costPrice) * 100;
};

/**
 * Calculate total TEU (Twenty-foot Equivalent Unit) for containers
 */
export const calculateTotalTEU = (containers: any[]): number => {
  if (!Array.isArray(containers)) return 0;
  
  return containers.reduce((total: number, container: any) => {
    const containerType = container.type || container.containerType || '';
    const quantity = container.quantity || 1;
    const teuPerContainer = getTEU(containerType);
    
    return total + (teuPerContainer * quantity);
  }, 0);
};

/**
 * Get TEU value for a container type
 */
export const getTEU = (containerType: string): number => {
  const type = containerType.toLowerCase();
  
  // Standard container types and their TEU values
  const teuMap: Record<string, number> = {
    '20gp': 1.0,
    '20ft': 1.0,
    '20': 1.0,
    '40gp': 2.0,
    '40ft': 2.0,
    '40': 2.0,
    '40hc': 2.0,
    '40hq': 2.0,
    '45hc': 2.25,
    '45hq': 2.25,
    '45': 2.25
  };
  
  return teuMap[type] || 1.0; // Default to 1.0 TEU
};

/**
 * Calculate total weight for containers
 */
export const calculateTotalWeight = (containers: any[]): number => {
  if (!Array.isArray(containers)) return 0;
  
  return containers.reduce((total: number, container: any) => {
    const weight = container.weight || container.weightKg || 0;
    const quantity = container.quantity || 1;
    
    return total + (weight * quantity);
  }, 0);
};

/**
 * Calculate total volume for containers
 */
export const calculateTotalVolume = (containers: any[]): number => {
  if (!Array.isArray(containers)) return 0;
  
  return containers.reduce((total: number, container: any) => {
    const volume = container.volume || container.volumeM3 || 0;
    const quantity = container.quantity || 1;
    
    return total + (volume * quantity);
  }, 0);
};

/**
 * Format price with currency
 */
export const formatPrice = (price: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

/**
 * Calculate percentage change between two values
 */
export const calculatePercentageChange = (oldValue: number, newValue: number): number => {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  
  return ((newValue - oldValue) / oldValue) * 100;
};

/**
 * Round to specified decimal places
 */
export const roundToDecimals = (value: number, decimals: number = 2): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};
