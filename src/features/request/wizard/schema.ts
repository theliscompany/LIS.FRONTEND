import { z } from "zod";

// Schéma pour une option de devis
export const QuoteOptionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Le nom de l'option est requis"),
  description: z.string().optional(),
  seafreights: z.array(z.object({
    id: z.string().optional(),
    carrier: z.string(),
    service: z.string(),
    etd: z.string().optional(),
    eta: z.string().optional(),
    rates: z.array(z.object({
      containerType: z.string(),
      basePrice: z.number().nonnegative(),
      currency: z.string().optional()
    })).min(1),
    surcharges: z.array(z.any()).optional()
  })),
  haulages: z.array(z.object({
    id: z.string().optional(),
    mode: z.enum(["truck", "rail", "barge"]),
    leg: z.enum(["pre", "on", "post"]),
    from: z.string().optional(),
    to: z.string().optional(),
    price: z.number().nonnegative(),
    note: z.string().optional(),
    pricingScope: z.string().optional(),
    containerFilter: z.array(z.string()).optional(),
    windows: z.any().optional(),
    surcharges: z.array(z.any()).optional()
  })),
  services: z.array(z.object({
    id: z.string().optional(),
    code: z.string(),
    label: z.string(),
    price: z.number().nonnegative().optional(),
    currency: z.string().optional(),
    calc: z.string().optional(),
    unit: z.string().optional(),
    taxable: z.boolean().optional()
  })),
  containers: z.array(z.object({
    containerType: z.string(),
    quantity: z.number().positive(),
    teu: z.number().positive()
  })).optional(),
  ports: z.array(z.any()).optional(),
  totals: z.object({
    seafreights: z.number().nonnegative(),
    haulages: z.number().nonnegative(),
    services: z.number().nonnegative(),
    grandTotal: z.number().nonnegative()
  }).optional(),
  currency: z.string().optional(),
  validUntil: z.string().optional(),
  isPreferred: z.boolean().optional(),
  totalPrice: z.number().nonnegative().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const DraftQuoteFormSchema = z.object({
  // Informations du brouillon
  draftId: z.string().optional(),
  draftName: z.string().optional(),
  draftDescription: z.string().optional(),
  
  // Informations de base (communes à toutes les options)
  basics: z.object({
    cargoType: z.enum(["FCL", "LCL", "AIR"]),
    incoterm: z.string().min(3),
    origin: z.object({ 
      city: z.string().min(2), 
      country: z.string().min(2) 
    }),
    destination: z.object({ 
      city: z.string().min(2), 
      country: z.string().min(2) 
    }),
    requestedDeparture: z.string().default(() => {
      const today = new Date();
      // S'assurer que la date est valide
      if (isNaN(today.getTime()) || today.getFullYear() < 1900) {
        console.warn('Date système invalide, utilisation de date de fallback');
        return new Date('2024-01-01').toISOString();
      }
      return today.toISOString();
    }), // ISO string avec date d'aujourd'hui par défaut
    goodsDescription: z.string().min(2),
    // Informations client et assigné
    client: z.object({
      companyName: z.string().optional(),
      contactFullName: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
    }).optional(),
    assignee: z.object({
      assigneeDisplayName: z.string().optional(),
      assigneeId: z.string().optional(),
    }).optional(),
    // Ports de départ et d'arrivée
    portFrom: z.object({
      portId: z.number().optional(),
      portName: z.string().nullable().optional(),
      unlocode: z.string().nullable().optional(),
      country: z.string().nullable().optional(),
      city: z.string().nullable().optional(),
    }).optional(),
    portTo: z.object({
      portId: z.number().optional(),
      portName: z.string().nullable().optional(),
      unlocode: z.string().nullable().optional(),
      country: z.string().nullable().optional(),
      city: z.string().nullable().optional(),
    }).optional(),
    // Conteneurs
    containers: z.array(z.object({
      containerType: z.string(),
      quantity: z.number().positive(),
      teu: z.number().nonnegative(),
    })).optional(),
  }),
  
  // Options existantes du brouillon (max 3)
  existingOptions: z.array(QuoteOptionSchema).max(3, "Maximum 3 options par brouillon"),
  
  // Option en cours de création/modification
  currentOption: z.object({
    seafreights: z.array(z.object({
      carrier: z.string(),
      service: z.string(),
      etd: z.string().optional(),
      eta: z.string().optional(),
      rates: z.array(z.object({
        containerType: z.string(),
        basePrice: z.number().nonnegative(),
      })).min(1)
    })),
    haulages: z.array(z.object({
      mode: z.enum(["truck", "rail", "barge"]),
      leg: z.enum(["pre", "on", "post"]),
      price: z.number().nonnegative(),
      note: z.string().optional()
    })),
    services: z.array(z.object({
      code: z.string(),
      label: z.string(),
      price: z.number().nonnegative().optional()
    })),
  }),
  
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url()
  })).default([]),
});

export type DraftQuoteForm = z.infer<typeof DraftQuoteFormSchema>;
export type QuoteOption = z.infer<typeof QuoteOptionSchema>;

// Default values for form initialization
export const defaultDraftQuoteForm: DraftQuoteForm = {
  draftId: undefined,
  draftName: undefined,
  draftDescription: undefined,
  basics: {
    cargoType: "FCL",
    incoterm: "FOB",
    origin: { city: "", country: "" },
    destination: { city: "", country: "" },
    requestedDeparture: new Date().toISOString(),
    goodsDescription: "",
    client: undefined,
    assignee: undefined,
    portFrom: undefined,
    portTo: undefined,
    containers: [],
  },
  existingOptions: [],
  currentOption: {
    seafreights: [],
    haulages: [],
    services: [],
  },
  attachments: [],
};

// Validation helpers
export const validateDraftQuoteForm = (data: unknown) => {
  return DraftQuoteFormSchema.safeParse(data);
};

export const validateDraftQuoteFormField = (field: string, value: unknown) => {
  const fieldSchema = DraftQuoteFormSchema.shape[field as keyof typeof DraftQuoteFormSchema.shape];
  if (fieldSchema) {
    return fieldSchema.safeParse(value);
  }
  return { success: false, error: new Error(`Unknown field: ${field}`) };
};
