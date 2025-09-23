import { describe, it, expect } from 'vitest';
import { toDraftQuotePayload, validateFormForSubmission, createResumeToken } from '../toDraftQuote';
import { DraftQuoteForm } from '../schema';

describe('toDraftQuote', () => {
  const validFormData: DraftQuoteForm = {
    basics: {
      cargoType: 'FCL',
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
          mode: 'truck',
          leg: 'pre',
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

  describe('toDraftQuotePayload', () => {
    it('should convert form data to API payload', () => {
      const resumeToken = 'test-resume-token';
      const payload = toDraftQuotePayload(validFormData, resumeToken);

      expect(payload).toHaveProperty('requestQuoteId', resumeToken);
      expect(payload).toHaveProperty('status', 'in_progress');
      expect(payload).toHaveProperty('version', 1);
      expect(payload).toHaveProperty('cargoType', 'FCL');
      expect(payload).toHaveProperty('incoterm', 'FOB');
    });

    it('should map cargo types correctly', () => {
      const testCases = [
        { input: 'FCL', expected: 'FCL' },
        { input: 'LCL', expected: 'LCL' },
        { input: 'AIR', expected: 'AIR' }
      ];

      testCases.forEach(({ input, expected }) => {
        const formData = {
          ...validFormData,
          basics: { ...validFormData.basics, cargoType: input as any }
        };
        const payload = toDraftQuotePayload(formData, 'test');
        expect(payload.cargoType).toBe(expected);
      });
    });

    it('should map haulage modes correctly', () => {
      const testCases = [
        { input: 'truck', expected: 'TRUCK' },
        { input: 'rail', expected: 'RAIL' },
        { input: 'barge', expected: 'BARGE' }
      ];

      testCases.forEach(({ input, expected }) => {
        const formData = {
          ...validFormData,
          options: {
            ...validFormData.options,
            haulages: [{ mode: input as any, leg: 'on', price: 100 }]
          }
        };
        const payload = toDraftQuotePayload(formData, 'test');
        expect(payload.haulages[0].mode).toBe(expected);
      });
    });

    it('should map haulage legs correctly', () => {
      const testCases = [
        { input: 'pre', expected: 'PRE_CARRIAGE' },
        { input: 'on', expected: 'ON_CARRIAGE' },
        { input: 'post', expected: 'POST_CARRIAGE' }
      ];

      testCases.forEach(({ input, expected }) => {
        const formData = {
          ...validFormData,
          options: {
            ...validFormData.options,
            haulages: [{ mode: 'truck', leg: input as any, price: 100 }]
          }
        };
        const payload = toDraftQuotePayload(formData, 'test');
        expect(payload.haulages[0].leg).toBe(expected);
      });
    });

    it('should include metadata with resume token', () => {
      const resumeToken = 'test-resume-token-123';
      const payload = toDraftQuotePayload(validFormData, resumeToken);

      expect(payload.metadata).toHaveProperty('resumeToken', resumeToken);
      expect(payload.metadata).toHaveProperty('formVersion', '2.0');
      expect(payload.metadata).toHaveProperty('createdAt');
      expect(payload.metadata).toHaveProperty('updatedAt');
    });

    it('should include wizard state', () => {
      const payload = toDraftQuotePayload(validFormData, 'test');

      expect(payload.wizard).toHaveProperty('currentStep', 'review');
      expect(payload.wizard).toHaveProperty('completedSteps');
      expect(payload.wizard).toHaveProperty('status', 'ready_to_submit');
      expect(payload.wizard).toHaveProperty('lastModified');
    });

    it('should handle optional fields', () => {
      const formDataWithoutOptional = {
        ...validFormData,
        basics: {
          ...validFormData.basics,
          requestedDeparture: undefined
        }
      };

      const payload = toDraftQuotePayload(formDataWithoutOptional, 'test');
      expect(payload.requestedDeparture).toBeUndefined();
    });

    it('should convert dates to ISO strings', () => {
      const payload = toDraftQuotePayload(validFormData, 'test');
      
      expect(payload.requestedDeparture).toBe('2024-01-15T00:00:00.000Z');
      expect(payload.seafreights[0].etd).toBe('2024-01-20T00:00:00.000Z');
      expect(payload.seafreights[0].eta).toBe('2024-02-05T00:00:00.000Z');
    });
  });

  describe('validateFormForSubmission', () => {
    it('should validate complete form data', () => {
      const result = validateFormForSubmission(validFormData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require cargo type', () => {
      const invalidData = {
        ...validFormData,
        basics: { ...validFormData.basics, cargoType: '' as any }
      };
      
      const result = validateFormForSubmission(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Cargo type is required');
    });

    it('should require incoterm', () => {
      const invalidData = {
        ...validFormData,
        basics: { ...validFormData.basics, incoterm: '' }
      };
      
      const result = validateFormForSubmission(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Incoterm is required');
    });

    it('should require origin city and country', () => {
      const invalidData = {
        ...validFormData,
        basics: {
          ...validFormData.basics,
          origin: { city: '', country: '' }
        }
      };
      
      const result = validateFormForSubmission(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Origin city and country are required');
    });

    it('should require destination city and country', () => {
      const invalidData = {
        ...validFormData,
        basics: {
          ...validFormData.basics,
          destination: { city: '', country: '' }
        }
      };
      
      const result = validateFormForSubmission(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Destination city and country are required');
    });

    it('should require goods description', () => {
      const invalidData = {
        ...validFormData,
        basics: { ...validFormData.basics, goodsDescription: '' }
      };
      
      const result = validateFormForSubmission(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Goods description is required');
    });

    it('should require at least one option', () => {
      const invalidData = {
        ...validFormData,
        options: { seafreights: [], haulages: [], services: [] }
      };
      
      const result = validateFormForSubmission(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one option (seafreight, haulage, or service) must be selected');
    });

    it('should validate seafreight rates', () => {
      const invalidData = {
        ...validFormData,
        options: {
          ...validFormData.options,
          seafreights: [
            {
              carrier: 'MSC',
              service: 'Test Service',
              rates: []
            }
          ]
        }
      };
      
      const result = validateFormForSubmission(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Seafreight 1: At least one rate is required');
    });

    it('should validate attachment URLs', () => {
      const invalidData = {
        ...validFormData,
        attachments: [
          { name: 'Test', url: 'invalid-url' }
        ]
      };
      
      const result = validateFormForSubmission(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Attachment 1: Invalid URL format');
    });
  });

  describe('createResumeToken', () => {
    it('should create unique tokens', () => {
      const token1 = createResumeToken();
      const token2 = createResumeToken();
      
      expect(token1).not.toBe(token2);
      expect(typeof token1).toBe('string');
      expect(token1.length).toBeGreaterThan(0);
    });

    it('should create tokens with expected format', () => {
      const token = createResumeToken();
      expect(token).toMatch(/^resume_\d+_[a-z0-9]+$/);
    });
  });
});
