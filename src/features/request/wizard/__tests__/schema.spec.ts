import { describe, it, expect } from 'vitest';
import { DraftQuoteFormSchema, validateDraftQuoteForm } from '../schema';

describe('DraftQuoteFormSchema', () => {
  const validFormData = {
    basics: {
      cargoType: 'FCL' as const,
      incoterm: 'FOB',
      origin: { city: 'Hamburg', country: 'Germany' },
      destination: { city: 'New York', country: 'United States' },
      requestedDeparture: '2024-01-15T00:00:00.000Z',
      goodsDescription: 'Test goods for shipping'
    },
    options: {
      seafreights: [
        {
          carrier: 'MSC',
          service: 'Mediterranean Service',
          etd: '2024-01-20T00:00:00.000Z',
          eta: '2024-02-05T00:00:00.000Z',
          rates: [
            { containerType: '20GP', basePrice: 1500 },
            { containerType: '40GP', basePrice: 2500 }
          ]
        }
      ],
      haulages: [
        {
          mode: 'truck' as const,
          leg: 'pre' as const,
          price: 500,
          note: 'Pickup from warehouse'
        }
      ],
      services: [
        {
          code: 'DOC',
          label: 'Documentation',
          price: 100
        }
      ]
    },
    attachments: [
      {
        name: 'Commercial Invoice',
        url: 'https://example.com/invoice.pdf'
      }
    ]
  };

  describe('validation', () => {
    it('should validate correct form data', () => {
      const result = DraftQuoteFormSchema.safeParse(validFormData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid cargo type', () => {
      const invalidData = {
        ...validFormData,
        basics: {
          ...validFormData.basics,
          cargoType: 'INVALID' as any
        }
      };
      
      const result = DraftQuoteFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['basics', 'cargoType']);
      }
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        ...validFormData,
        basics: {
          ...validFormData.basics,
          incoterm: ''
        }
      };
      
      const result = DraftQuoteFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['basics', 'incoterm']);
      }
    });

    it('should reject invalid country codes', () => {
      const invalidData = {
        ...validFormData,
        basics: {
          ...validFormData.basics,
          origin: {
            ...validFormData.basics.origin,
            country: 'INVALID'
          }
        }
      };
      
      const result = DraftQuoteFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['basics', 'origin', 'country']);
      }
    });

    it('should reject invalid URLs in attachments', () => {
      const invalidData = {
        ...validFormData,
        attachments: [
          {
            name: 'Invalid URL',
            url: 'not-a-valid-url'
          }
        ]
      };
      
      const result = DraftQuoteFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['attachments', 0, 'url']);
      }
    });

    it('should reject negative prices', () => {
      const invalidData = {
        ...validFormData,
        options: {
          ...validFormData.options,
          seafreights: [
            {
              ...validFormData.options.seafreights[0],
              rates: [
                { containerType: '20GP', basePrice: -100 }
              ]
            }
          ]
        }
      };
      
      const result = DraftQuoteFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['options', 'seafreights', 0, 'rates', 0, 'basePrice']);
      }
    });
  });

  describe('default values', () => {
    it('should provide sensible defaults', () => {
      const result = DraftQuoteFormSchema.safeParse({});
      expect(result.success).toBe(false); // Missing required fields
      
      // Test with minimal required data
      const minimalData = {
        basics: {
          cargoType: 'FCL' as const,
          incoterm: 'FOB',
          origin: { city: 'Test', country: 'United States' },
          destination: { city: 'Test', country: 'United States' },
          goodsDescription: 'Test'
        }
      };
      
      const result2 = DraftQuoteFormSchema.safeParse(minimalData);
      expect(result2.success).toBe(true);
    });
  });

  describe('validateDraftQuoteForm', () => {
    it('should validate form data correctly', () => {
      const result = validateDraftQuoteForm(validFormData);
      expect(result.success).toBe(true);
    });

    it('should return validation errors for invalid data', () => {
      const invalidData = {
        ...validFormData,
        basics: {
          ...validFormData.basics,
          incoterm: ''
        }
      };
      
      const result = validateDraftQuoteForm(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
