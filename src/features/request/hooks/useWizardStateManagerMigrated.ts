import { useState, useEffect, useCallback, useRef } from 'react';
import { useSnackbar } from 'notistack';
// 🆕 MIGRATION : Nouveaux endpoints
import { 
  postApiDraftQuotes,        // Remplace postApiQuoteOfferDraft
  putApiDraftQuotesById,     // Remplace putApiQuoteOfferDraftById
  getApiDraftQuotesById      // Remplace getDraft
} from '../../offer/api/sdk.gen';
import type { DraftQuote } from '../types/DraftQuote';
import { buildSDKPayload, calculateCurrentStep } from '../types/DraftQuote';

export interface WizardState {
  activeStep: number;
  draftQuote: DraftQuote;
  isDirty: boolean;
  lastSavedAt: Date | null;
  isSaving: boolean;
  saveError: string | null;
}

export interface UseWizardStateManagerMigratedReturn {
  state: WizardState;
  updateStep: (stepNumber: number, data: any) => void;
  updateDraftQuote: (updates: Partial<DraftQuote>) => void;
  saveDraft: () => Promise<boolean>;
  loadDraft: (draftId: string) => Promise<boolean>;
  resetDraft: () => void;
  goToStep: (stepNumber: number) => void;
  canGoToNext: () => boolean;
  canGoToPrevious: () => boolean;
  getTotalSteps: () => number;
  getStepProgress: () => number;
}

interface UseWizardStateManagerMigratedProps {
  requestQuoteId: string;
  emailUser: string;
  initialDraftId?: string;
  onStepChange?: (step: number) => void;
  onDraftSaved?: (draft: DraftQuote) => void;
}

const TOTAL_STEPS = 7;

export const useWizardStateManagerMigrated = ({
  requestQuoteId,
  emailUser,
  initialDraftId,
  onStepChange,
  onDraftSaved
}: UseWizardStateManagerMigratedProps): UseWizardStateManagerMigratedReturn => {
  const { enqueueSnackbar } = useSnackbar();
  
  // État initial du wizard
  const [state, setState] = useState<WizardState>(() => ({
    activeStep: 1,
    draftQuote: {
      id: initialDraftId || '',
      requestQuoteId,
      emailUser,
      step1: { isCompleted: false },
      step2: { isCompleted: false },
      step3: { isCompleted: false },
      step4: { isCompleted: false },
      step5: { isCompleted: false },
      step6: { isCompleted: false },
      step7: { isCompleted: false },
      savedOptions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    isDirty: false,
    lastSavedAt: null,
    isSaving: false,
    saveError: null
  }));

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);

  // 🆕 MIGRATION : Fonction pour convertir DraftQuote vers le nouveau format API
  const convertToNewFormat = useCallback((draftQuote: DraftQuote) => {
    return {
      requestId: draftQuote.requestQuoteId,
      header: {
        client: {
          company: draftQuote.step1?.company || '',
          contact: draftQuote.step1?.contactName || '',
          email: draftQuote.emailUser,
          phone: draftQuote.step1?.phone || ''
        },
        shipment: {
          fromRequest: true,
          readonly: [],
          cargoType: draftQuote.step2?.cargoType || 'FCL',
          goodsDescription: draftQuote.step2?.goodsDescription || '',
          origin: {
            city: draftQuote.step2?.originCity || '',
            country: draftQuote.step2?.originCountry || ''
          },
          destination: {
            city: draftQuote.step2?.destinationCity || '',
            country: draftQuote.step2?.destinationCountry || ''
          },
          requestedDeparture: draftQuote.step2?.requestedDeparture || null
        },
        commercialTerms: {
          currency: 'EUR',
          incoterm: draftQuote.step2?.incoterm || 'FOB',
          validityDays: 30,
          cgvAccepted: true
        }
      },
      wizardData: {
        generalRequestInformation: {
          channel: 'web',
          priority: 'normal',
          notes: draftQuote.step1?.notes || ''
        },
        routingAndCargo: {
          portOfLoading: draftQuote.step2?.portOfLoading || '',
          portOfDestination: draftQuote.step2?.portOfDestination || '',
          cargo: {
            items: draftQuote.step3?.containers?.map(container => ({
              containerType: container.containerType,
              quantity: container.quantity || 1,
              grossWeightKg: container.weight || 0,
              volumeM3: container.volume || 0
            })) || [],
            hazmat: draftQuote.step3?.hazmat || false,
            goodsDescription: draftQuote.step2?.goodsDescription || ''
          }
        },
        seafreights: draftQuote.step5?.selections?.map(seafreight => ({
          id: seafreight.id,
          carrier: seafreight.carrier,
          service: seafreight.service,
          etd: seafreight.etd,
          eta: seafreight.eta,
          currency: 'EUR',
          validUntil: seafreight.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          rates: [{
            containerType: draftQuote.step3?.containers?.[0]?.containerType || '20GP',
            basePrice: parseFloat(seafreight.charges?.basePrice?.toString() || '0')
          }],
          surcharges: seafreight.charges?.surcharges?.map(surcharge => ({
            code: surcharge.code,
            label: surcharge.label,
            calc: 'fixed',
            base: 'container',
            unit: 'EUR',
            value: parseFloat(surcharge.value?.toString() || '0'),
            currency: 'EUR',
            taxable: false,
            appliesTo: ['20GP', '40GP', '40HC']
          })) || []
        })) || [],
        haulages: draftQuote.step4?.selections?.map(haulage => ({
          id: haulage.id,
          provider: haulage.provider,
          scope: haulage.scope || 'door-to-port',
          from: haulage.from,
          to: haulage.to,
          currency: 'EUR',
          pricing: [{
            containerType: draftQuote.step3?.containers?.[0]?.containerType || '20GP',
            unit: 'container',
            price: parseFloat(haulage.pricing?.unitPrice?.toString() || '0'),
            includedWaitingHours: 2,
            extraHourPrice: 50
          }]
        })) || [],
        services: draftQuote.step6?.selections?.map(service => ({
          id: service.id,
          name: service.name,
          provider: service.provider || 'LIS',
          unit: service.pricing?.unit || 'fixed',
          price: parseFloat(service.pricing?.unitPrice?.toString() || service.pricing?.totalPrice?.toString() || '0'),
          currency: 'EUR',
          taxable: service.pricing?.taxable || false,
          taxRate: service.pricing?.taxRate || null
        })) || []
      }
    };
  }, []);

  // 🆕 MIGRATION : Fonction pour convertir la réponse API vers DraftQuote
  const convertFromNewFormat = useCallback((apiResponse: any): DraftQuote => {
    const data = apiResponse.data || apiResponse;
    
    return {
      id: data.draftQuoteId || '',
      requestQuoteId: data.requestId || '',
      emailUser: data.header?.client?.email || '',
      step1: {
        isCompleted: true,
        company: data.header?.client?.company || '',
        contactName: data.header?.client?.contact || '',
        phone: data.header?.client?.phone || '',
        notes: data.wizardData?.generalRequestInformation?.notes || ''
      },
      step2: {
        isCompleted: true,
        cargoType: data.header?.shipment?.cargoType || 'FCL',
        goodsDescription: data.header?.shipment?.goodsDescription || '',
        originCity: data.header?.shipment?.origin?.city || '',
        originCountry: data.header?.shipment?.origin?.country || '',
        destinationCity: data.header?.shipment?.destination?.city || '',
        destinationCountry: data.header?.shipment?.destination?.country || '',
        portOfLoading: data.wizardData?.routingAndCargo?.portOfLoading || '',
        portOfDestination: data.wizardData?.routingAndCargo?.portOfDestination || '',
        incoterm: data.header?.commercialTerms?.incoterm || 'FOB',
        requestedDeparture: data.header?.shipment?.requestedDeparture || null
      },
      step3: {
        isCompleted: true,
        containers: data.wizardData?.routingAndCargo?.cargo?.items?.map((item: any) => ({
          containerType: item.containerType,
          quantity: item.quantity,
          weight: item.grossWeightKg,
          volume: item.volumeM3
        })) || [],
        hazmat: data.wizardData?.routingAndCargo?.cargo?.hazmat || false
      },
      step4: {
        isCompleted: !!data.wizardData?.haulages?.length,
        selections: data.wizardData?.haulages?.map((haulage: any) => ({
          id: haulage.id,
          provider: haulage.provider,
          scope: haulage.scope,
          from: haulage.from,
          to: haulage.to,
          pricing: {
            unitPrice: haulage.pricing?.[0]?.price || 0,
            unit: haulage.pricing?.[0]?.unit || 'container'
          }
        })) || []
      },
      step5: {
        isCompleted: !!data.wizardData?.seafreights?.length,
        selections: data.wizardData?.seafreights?.map((seafreight: any) => ({
          id: seafreight.id,
          carrier: seafreight.carrier,
          service: seafreight.service,
          etd: seafreight.etd,
          eta: seafreight.eta,
          validUntil: seafreight.validUntil,
          charges: {
            basePrice: seafreight.rates?.[0]?.basePrice || 0,
            surcharges: seafreight.surcharges?.map((surcharge: any) => ({
              code: surcharge.code,
              label: surcharge.label,
              value: surcharge.value
            })) || []
          }
        })) || []
      },
      step6: {
        isCompleted: !!data.wizardData?.services?.length,
        selections: data.wizardData?.services?.map((service: any) => ({
          id: service.id,
          name: service.name,
          provider: service.provider,
          pricing: {
            unitPrice: service.price,
            unit: service.unit,
            taxable: service.taxable,
            taxRate: service.taxRate
          }
        })) || []
      },
      step7: {
        isCompleted: !!data.options?.length
      },
      savedOptions: data.options?.map((option: any) => ({
        optionId: option.optionId || option.id,
        name: option.label || option.name || 'Option sans nom',
        description: option.description || '',
        marginType: 'percentage',
        marginValue: 15,
        createdAt: new Date().toISOString(),
        totals: {
          haulageTotalAmount: 0, // À calculer
          seafreightTotalAmount: 0, // À calculer
          miscTotalAmount: 0, // À calculer
          subTotal: option.pricingPreview?.subtotals?.taxableBase || 0,
          marginAmount: 0, // À calculer
          finalTotal: option.pricingPreview?.grandTotal || 0,
          currency: option.pricingPreview?.currency || 'EUR'
        }
      })) || [],
      createdAt: data.audit?.createdAt || new Date().toISOString(),
      updatedAt: data.audit?.lastUpdatedAt || new Date().toISOString()
    };
  }, []);

  // Sauvegarde automatique avec debounce
  const saveDraft = useCallback(async (): Promise<boolean> => {
    if (state.isSaving) return false;

    setState(prev => ({ 
      ...prev, 
      isSaving: true, 
      saveError: null 
    }));

    try {
      let result;
      const payload = convertToNewFormat(state.draftQuote);

      if (state.draftQuote.id && state.draftQuote.id !== '') {
        // 🆕 MIGRATION : Utiliser putApiDraftQuotesById au lieu de putApiQuoteOfferDraftById
        console.log('🔄 [MIGRATION] Appel de putApiDraftQuotesById...');
        result = await putApiDraftQuotesById({
          path: { id: state.draftQuote.id },
          body: payload,
          throwOnError: true
        });
      } else {
        // 🆕 MIGRATION : Utiliser postApiDraftQuotes au lieu de postApiQuoteOfferDraft
        console.log('🆕 [MIGRATION] Appel de postApiDraftQuotes...');
        result = await postApiDraftQuotes({
          body: payload,
          throwOnError: true
        });
      }

      if (result?.data?.data) {
        const updatedDraft = convertFromNewFormat(result.data.data);
        
        setState(prev => ({
          ...prev,
          draftQuote: updatedDraft,
          isDirty: false,
          lastSavedAt: new Date(),
          isSaving: false,
          saveError: null
        }));

        if (onDraftSaved) {
          onDraftSaved(updatedDraft);
        }

        enqueueSnackbar('Brouillon sauvegardé avec succès', { variant: 'success' });
        return true;
      } else {
        throw new Error('Réponse API invalide');
      }
    } catch (error: any) {
      console.error('[MIGRATION] Erreur lors de la sauvegarde:', error);
      
      setState(prev => ({ 
        ...prev, 
        isSaving: false,
        saveError: error?.message || 'Erreur de sauvegarde'
      }));

      enqueueSnackbar(`Erreur de sauvegarde: ${error?.message || 'Erreur inconnue'}`, { 
        variant: 'error' 
      });
      
      return false;
    }
  }, [state.draftQuote, state.isSaving, convertToNewFormat, convertFromNewFormat, onDraftSaved, enqueueSnackbar]);

  // Chargement d'un draft existant
  const loadDraft = useCallback(async (draftId: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isSaving: true }));

      // 🆕 MIGRATION : Utiliser getApiDraftQuotesById au lieu de getDraft
      console.log('[MIGRATION] Chargement draft avec getApiDraftQuotesById:', draftId);
      
      const result = await getApiDraftQuotesById({
        path: { id: draftId },
        throwOnError: true
      });

      if (result?.data?.data) {
        const loadedDraft = convertFromNewFormat(result.data.data);
        const currentStep = calculateCurrentStep(loadedDraft);

        setState(prev => ({
          ...prev,
          draftQuote: loadedDraft,
          activeStep: currentStep,
          isDirty: false,
          lastSavedAt: new Date(),
          isSaving: false,
          saveError: null
        }));

        enqueueSnackbar('Brouillon chargé avec succès', { variant: 'success' });
        return true;
      } else {
        throw new Error('Draft non trouvé');
      }
    } catch (error: any) {
      console.error('[MIGRATION] Erreur lors du chargement:', error);
      
      setState(prev => ({ 
        ...prev, 
        isSaving: false,
        saveError: error?.message || 'Erreur de chargement'
      }));

      enqueueSnackbar(`Erreur de chargement: ${error?.message || 'Draft non trouvé'}`, { 
        variant: 'error' 
      });
      
      return false;
    }
  }, [convertFromNewFormat, enqueueSnackbar]);

  // Mise à jour d'une étape
  const updateStep = useCallback((stepNumber: number, data: any) => {
    setState(prev => {
      const updatedDraft = {
        ...prev.draftQuote,
        [`step${stepNumber}`]: {
          ...prev.draftQuote[`step${stepNumber}` as keyof DraftQuote],
          ...data,
          isCompleted: true
        },
        updatedAt: new Date().toISOString()
      };

      return {
        ...prev,
        draftQuote: updatedDraft,
        isDirty: true
      };
    });
  }, []);

  // Mise à jour globale du draft
  const updateDraftQuote = useCallback((updates: Partial<DraftQuote>) => {
    setState(prev => ({
      ...prev,
      draftQuote: {
        ...prev.draftQuote,
        ...updates,
        updatedAt: new Date().toISOString()
      },
      isDirty: true
    }));
  }, []);

  // Navigation
  const goToStep = useCallback((stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= TOTAL_STEPS) {
      setState(prev => ({ ...prev, activeStep: stepNumber }));
      if (onStepChange) {
        onStepChange(stepNumber);
      }
    }
  }, [onStepChange]);

  const canGoToNext = useCallback((): boolean => {
    return state.activeStep < TOTAL_STEPS;
  }, [state.activeStep]);

  const canGoToPrevious = useCallback((): boolean => {
    return state.activeStep > 1;
  }, [state.activeStep]);

  const getTotalSteps = useCallback((): number => {
    return TOTAL_STEPS;
  }, []);

  const getStepProgress = useCallback((): number => {
    return (state.activeStep / TOTAL_STEPS) * 100;
  }, [state.activeStep]);

  const resetDraft = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeStep: 1,
      draftQuote: {
        id: '',
        requestQuoteId,
        emailUser,
        step1: { isCompleted: false },
        step2: { isCompleted: false },
        step3: { isCompleted: false },
        step4: { isCompleted: false },
        step5: { isCompleted: false },
        step6: { isCompleted: false },
        step7: { isCompleted: false },
        savedOptions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      isDirty: false,
      lastSavedAt: null,
      saveError: null
    }));
  }, [requestQuoteId, emailUser]);

  // Auto-save avec debounce
  useEffect(() => {
    if (state.isDirty && !isInitialLoadRef.current) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveDraft();
      }, 2000); // Auto-save après 2 secondes d'inactivité
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state.isDirty, saveDraft]);

  // Chargement initial
  useEffect(() => {
    if (initialDraftId && isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      loadDraft(initialDraftId);
    } else {
      isInitialLoadRef.current = false;
    }
  }, [initialDraftId, loadDraft]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    state,
    updateStep,
    updateDraftQuote,
    saveDraft,
    loadDraft,
    resetDraft,
    goToStep,
    canGoToNext,
    canGoToPrevious,
    getTotalSteps,
    getStepProgress
  };
};
