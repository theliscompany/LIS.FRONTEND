import { useMutation } from '@tanstack/react-query';
import { putApiDraftQuotesByIdMutation } from '../../offer/api/@tanstack/react-query.gen';
import type { UpdateDraftQuoteRequest } from '../../offer/api/types.gen';

/**
 * Exemple d'utilisation de l'API TanStack pour mettre à jour un brouillon avec 1 option
 */

// ✅ Hook personnalisé pour la mise à jour
export const useUpdateDraftQuoteWithOption = () => {
  return useMutation(putApiDraftQuotesByIdMutation());
};

// ✅ Exemple de payload complet
export const exampleUpdatePayload: UpdateDraftQuoteRequest = {
  customer: {
    type: "company",
    name: "ACME Corporation",
    vat: "BE0123456789",
    emails: ["contact@acme.com", "billing@acme.com"],
    phones: ["+32 2 123 45 67", "+32 2 123 45 68"],
    address: {
      location: "Brussels",
      country: "Belgium"
    },
    contactPerson: {
      fullName: "John Doe",
      phone: "+32 2 123 45 67",
      email: "john.doe@acme.com"
    }
  },
  shipment: {
    mode: "sea",
    containerCount: 2,
    containerTypes: ["20GP", "40HC"],
    commodity: "Electronics",
    hsCodes: ["8517.12.00", "8517.62.00"],
    origin: {
      location: "Antwerp",
      country: "Belgium"
    },
    destination: {
      location: "Shanghai",
      country: "China"
    },
    requestedDeparture: new Date("2024-02-15T00:00:00.000Z"),
    docs: {
      requiresVGM: true,
      requiresBLDraftApproval: false
    },
    constraints: {
      minTruckLeadDays: 6,
      terminalCutoffDays: 11,
      customsDeadlineHours: 48
    }
  },
  wizard: {
    notes: "Urgent shipment - please prioritize",
    selectedServiceLevel: "premium",
    seafreights: [
      {
        id: "seafreight-001",
        carrier: "MSC",
        service: "Mediterranean Express",
        rate: [
          {
            containerType: "20GP",
            unitPrice: 850.00,
            subtotal: 1700.00
          },
          {
            containerType: "40HC",
            unitPrice: 1200.00,
            subtotal: 2400.00
          }
        ],
        surcharges: [
          {
            code: "BUC",
            label: "Bunker Adjustment Factor",
            calc: "percentage",
            base: "base",
            unit: "percentage",
            value: 15.5,
            currency: "EUR",
            taxable: true,
            appliesTo: ["20GP", "40HC"]
          }
        ]
      }
    ],
    haulages: [
      {
        id: "haulage-001",
        phase: "pre-carriage",
        mode: "truck",
        from: "Brussels",
        to: "Antwerp",
        pricingScope: "per_container",
        containerFilter: ["20GP", "40HC"],
        windows: {
          load: "2024-02-10T08:00:00.000Z",
          returnDeadline: "2024-02-12T17:00:00.000Z"
        },
        basePrice: 250.00,
        surcharges: [
          {
            code: "FUEL",
            label: "Fuel Surcharge",
            calc: "percentage",
            base: "base",
            unit: "percentage",
            value: 12.0,
            currency: "EUR",
            taxable: true,
            appliesTo: ["20GP", "40HC"]
          }
        ]
      }
    ],
    services: [
      {
        code: "CUSTOMS",
        label: "Customs Clearance",
        calc: "fixed",
        unit: "per_shipment",
        value: 150.00,
        currency: "EUR",
        taxable: true
      },
      {
        code: "DOCS",
        label: "Documentation",
        calc: "fixed",
        unit: "per_shipment",
        value: 75.00,
        currency: "EUR",
        taxable: false
      }
    ]
  },
  options: [
    {
      optionId: "option-001",
      label: "Option Premium - Express Service",
      validUntil: "2024-02-20T23:59:59.000Z",
      currency: "EUR",
      containers: [
        {
          containerType: "20GP",
          quantity: 1
        },
        {
          containerType: "40HC",
          quantity: 1
        }
      ],
      planning: {
        departure: "2024-02-15T00:00:00.000Z",
        arrival: "2024-03-15T00:00:00.000Z",
        transitTime: 28
      },
      seafreight: {
        id: "seafreight-001",
        carrier: "MSC",
        service: "Mediterranean Express",
        rate: [
          {
            containerType: "20GP",
            unitPrice: 850.00,
            subtotal: 850.00
          },
          {
            containerType: "40HC",
            unitPrice: 1200.00,
            subtotal: 1200.00
          }
        ],
        surcharges: [
          {
            code: "BUC",
            label: "Bunker Adjustment Factor",
            calc: "percentage",
            base: "base",
            unit: "percentage",
            value: 15.5,
            currency: "EUR",
            taxable: true,
            appliesTo: ["20GP", "40HC"]
          }
        ]
      },
      haulages: [
        {
          id: "haulage-001",
          phase: "pre-carriage",
          mode: "truck",
          from: "Brussels",
          to: "Antwerp",
          pricingScope: "per_container",
          containerFilter: ["20GP", "40HC"],
          windows: {
            load: "2024-02-10T08:00:00.000Z",
            returnDeadline: "2024-02-12T17:00:00.000Z"
          },
          basePrice: 250.00,
          surcharges: [
            {
              code: "FUEL",
              label: "Fuel Surcharge",
              calc: "percentage",
              base: "base",
              unit: "percentage",
              value: 12.0,
              currency: "EUR",
              taxable: true,
              appliesTo: ["20GP", "40HC"]
            }
          ]
        }
      ],
      services: [
        {
          code: "CUSTOMS",
          label: "Customs Clearance",
          calc: "fixed",
          unit: "per_shipment",
          value: 150.00,
          currency: "EUR",
          taxable: true
        },
        {
          code: "DOCS",
          label: "Documentation",
          calc: "fixed",
          unit: "per_shipment",
          value: 75.00,
          currency: "EUR",
          taxable: false
        }
      ],
      totals: {
        seafreightBase: 2050.00,
        seafreightSurcharges: 317.75,
        seafreightTotal: 2367.75,
        haulageBase: 500.00,
        haulageSurcharges: 60.00,
        haulageTotal: 560.00,
        miscBase: 225.00,
        miscSurcharges: 0.00,
        miscTotal: 225.00,
        subtotal: 3152.75,
        taxRate: 21.0,
        taxAmount: 662.08,
        total: 3814.83,
        currency: "EUR"
      },
      terms: {
        depositPolicy: {
          type: "percentage",
          value: 30.0
        },
        generalConditionsId: "GC-2024-001"
      }
    }
  ],
  notes: "Brouillon mis à jour avec option premium - Express Service. Client souhaite une livraison rapide."
};

// ✅ Exemple d'utilisation dans un composant React
export const UpdateDraftQuoteExample = () => {
  const updateMutation = useUpdateDraftQuoteWithOption();

  const handleUpdateDraft = async (draftId: string) => {
    try {
      console.log('🔄 [UPDATE_EXAMPLE] Mise à jour du brouillon:', draftId);
      console.log('🔄 [UPDATE_EXAMPLE] Payload:', exampleUpdatePayload);
      
      const result = await updateMutation.mutateAsync({
        path: { id: draftId },
        body: exampleUpdatePayload,
      });
      
      console.log('✅ [UPDATE_EXAMPLE] Mise à jour réussie:', result);
      return result;
    } catch (error) {
      console.error('❌ [UPDATE_EXAMPLE] Erreur lors de la mise à jour:', error);
      throw error;
    }
  };

  return {
    updateMutation,
    handleUpdateDraft,
    examplePayload: exampleUpdatePayload
  };
};

// ✅ Exemple d'utilisation avec le service draftQuoteService
export const updateDraftQuoteWithOptionExample = async (draftId: string) => {
  const { mapDraftQuoteToUpdateApi } = await import('../../offer/services/draftQuoteService');
  
  // Simuler un DraftQuote depuis le frontend
  const draftQuote = {
    // ... données du brouillon
  };
  
  // Convertir vers UpdateDraftQuoteRequest
  const updatePayload = mapDraftQuoteToUpdateApi(draftQuote);
  
  // Utiliser l'API TanStack
  const updateMutation = putApiDraftQuotesByIdMutation();
  
  try {
    const result = await updateMutation.mutationFn({
      path: { id: draftId },
      body: updatePayload,
    });
    
    console.log('✅ [SERVICE_EXAMPLE] Mise à jour réussie:', result);
    return result;
  } catch (error) {
    console.error('❌ [SERVICE_EXAMPLE] Erreur lors de la mise à jour:', error);
    throw error;
  }
};
