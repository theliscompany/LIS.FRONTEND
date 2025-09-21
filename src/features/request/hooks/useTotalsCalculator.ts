/**
 * Hook utilitaire pour les calculs de totaux
 * Centralise toute la logique de calcul des coûts
 */

import { useCallback, useMemo } from 'react';
import type { DraftQuote } from '../types/DraftQuote';

export interface TotalsBreakdown {
  haulage: {
    total: number;
    baseAmount: number;
    surcharges: number;
    currency: string;
  };
  seafreight: {
    total: number;
    baseAmount: number;
    surcharges: number;
    currency: string;
    selections: Array<{
      name: string;
      basePrice: number;
      surcharges: number;
      total: number;
      quantity: number;
    }>;
  };
  miscellaneous: {
    total: number;
    currency: string;
    services: Array<{
      name: string;
      price: number;
    }>;
  };
  summary: {
    subTotal: number;
    marginAmount: number;
    finalTotal: number;
    currency: string;
  };
}

export const useTotalsCalculator = (draftQuote?: DraftQuote) => {
  // ✅ CALCUL DU HAULAGE (Step 4)
  const calculateHaulage = useCallback((): TotalsBreakdown['haulage'] => {
    if (!draftQuote?.step4?.calculation) {
      return {
        total: 0,
        baseAmount: 0,
        surcharges: 0,
        currency: 'EUR'
      };
    }

    const calculation = draftQuote.step4.calculation;
    const baseAmount = parseFloat(calculation.baseAmount?.toString() || '0');
    const surcharges = parseFloat(calculation.surcharges?.toString() || '0');
    const total = parseFloat(calculation.totalAmount?.toString() || '0');

    return {
      total,
      baseAmount,
      surcharges,
      currency: 'EUR'
    };
  }, [draftQuote?.step4?.calculation]);

  // ✅ CALCUL DU SEAFREIGHT (Step 5)
  const calculateSeafreight = useCallback((): TotalsBreakdown['seafreight'] => {
    if (!draftQuote?.step5?.selections || draftQuote.step5.selections.length === 0) {
      return {
        total: 0,
        baseAmount: 0,
        surcharges: 0,
        currency: 'EUR',
        selections: []
      };
    }

    let total = 0;
    let baseAmount = 0;
    let surcharges = 0;
    const selections: TotalsBreakdown['seafreight']['selections'] = [];

    // Obtenir les quantités de conteneurs
    const containerQuantities = draftQuote.step3?.containers?.reduce((acc, container) => {
      acc[container.containerType] = (acc[container.containerType] || 0) + (container.quantity || 1);
      return acc;
    }, {} as Record<string, number>) || {};

    for (const seafreight of draftQuote.step5.selections) {
      const basePrice = parseFloat(seafreight.charges?.basePrice?.toString() || '0');
      let surchargesTotal = 0;
      
      if (seafreight.charges?.surcharges) {
        for (const surcharge of seafreight.charges.surcharges) {
          surchargesTotal += parseFloat(surcharge.value?.toString() || '0');
        }
      }

      const seafreightTotal = basePrice + surchargesTotal;
      
      // Calculer la quantité totale pour ce type de seafreight
      let totalQuantity = 1;
      if (seafreight.containerType && containerQuantities[seafreight.containerType]) {
        totalQuantity = containerQuantities[seafreight.containerType];
      }

      const selectionTotal = seafreightTotal * totalQuantity;
      
      total += selectionTotal;
      baseAmount += basePrice * totalQuantity;
      surcharges += surchargesTotal * totalQuantity;

      selections.push({
        name: seafreight.name || 'Seafreight',
        basePrice: basePrice * totalQuantity,
        surcharges: surchargesTotal * totalQuantity,
        total: selectionTotal,
        quantity: totalQuantity
      });
    }

    return {
      total,
      baseAmount,
      surcharges,
      currency: 'EUR',
      selections
    };
  }, [draftQuote?.step5?.selections, draftQuote?.step3?.containers]);

  // ✅ CALCUL DES SERVICES DIVERS (Step 6)
  const calculateMiscellaneous = useCallback((): TotalsBreakdown['miscellaneous'] => {
    if (!draftQuote?.step6?.selections || draftQuote.step6.selections.length === 0) {
      return {
        total: 0,
        currency: 'EUR',
        services: []
      };
    }

    let total = 0;
    const services: TotalsBreakdown['miscellaneous']['services'] = [];

    for (const service of draftQuote.step6.selections) {
      const price = 
        service.pricing?.unitPrice ||
        service.pricing?.totalPrice ||
        service.pricing?.price ||
        parseFloat(service.price?.toString() || '0');
      
      total += price;
      services.push({
        name: service.name || 'Service',
        price
      });
    }

    return {
      total,
      currency: 'EUR',
      services
    };
  }, [draftQuote?.step6?.selections]);

  // ✅ CALCUL DES TOTAUX GÉNÉRAUX
  const calculateSummary = useCallback((
    haulageTotal: number,
    seafreightTotal: number,
    miscTotal: number,
    marginType: 'percentage' | 'fixed' = 'percentage',
    marginValue: number = 15
  ): TotalsBreakdown['summary'] => {
    const subTotal = haulageTotal + seafreightTotal + miscTotal;
    
    let marginAmount: number;
    if (marginType === 'percentage') {
      marginAmount = (subTotal * marginValue) / 100;
    } else {
      marginAmount = marginValue;
    }
    
    const finalTotal = subTotal + marginAmount;

    return {
      subTotal,
      marginAmount,
      finalTotal,
      currency: 'EUR'
    };
  }, []);

  // ✅ CALCUL COMPLET DES TOTAUX
  const calculateTotals = useCallback((
    marginType: 'percentage' | 'fixed' = 'percentage',
    marginValue: number = 15
  ): TotalsBreakdown => {
    const haulage = calculateHaulage();
    const seafreight = calculateSeafreight();
    const miscellaneous = calculateMiscellaneous();
    const summary = calculateSummary(
      haulage.total,
      seafreight.total,
      miscellaneous.total,
      marginType,
      marginValue
    );

    return {
      haulage,
      seafreight,
      miscellaneous,
      summary
    };
  }, [calculateHaulage, calculateSeafreight, calculateMiscellaneous, calculateSummary]);

  // ✅ TOTAUX MÉMORISÉS
  const totals = useMemo(() => {
    return calculateTotals();
  }, [calculateTotals]);

  // ✅ FONCTIONS UTILITAIRES
  const formatCurrency = useCallback((amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }, []);

  const getTotalTEU = useCallback(() => {
    if (!draftQuote?.step3?.containers) return 0;
    
    return draftQuote.step3.containers.reduce((total, container) => {
      const teu = getTEU(container.containerType);
      return total + (teu * (container.quantity || 1));
    }, 0);
  }, [draftQuote?.step3?.containers]);

  const getTEU = useCallback((containerType: string): number => {
    if (!containerType) return 0;
    const type = containerType.toLowerCase();
    if (type.includes("20")) return 1;
    if (type.includes("40")) return 2;
    if (type.includes("45")) return 2.25;
    return 0;
  }, []);

  return {
    totals,
    calculateTotals,
    formatCurrency,
    getTotalTEU,
    getTEU
  };
};
