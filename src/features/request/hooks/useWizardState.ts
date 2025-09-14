// === HOOK POUR LA GESTION D'ÉTAT DU WIZARD ===
import { useState, useCallback, useMemo } from 'react';
import type { 
  DraftQuote, 
  UseWizardStateReturn,
  StatusRequest 
} from '../types/WizardTypes';

// DraftQuote maintenant importé depuis les types centralisés

const createInitialDraftQuote = (): DraftQuote => ({
  step1: {
    customer: undefined,
    cityFrom: undefined,
    cityTo: undefined,
    productName: undefined,
    status: 'NEW' as StatusRequest,
    assignee: "",
    comment: "",
    incotermName: "",
    portFrom: undefined,
    portTo: undefined,
    pickupLocation: undefined,
    deliveryLocation: undefined,
  },
  step2: {
    selected: [],
  },
  step3: { selectedContainers: {} },
  savedOptions: [],
  selectedHaulage: undefined,
  selectedSeafreights: [],
  selectedMiscellaneous: [],
  selectedContainers: {},
  marginType: 'percent',
  marginValue: 0,
  totalPrice: 0,
});

export const useWizardState = (debugLog: (msg: string, data?: any) => void): UseWizardStateReturn => {
  // === ÉTATS CENTRAUX ===
  const [activeStep, setActiveStep] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [draftQuote, setDraftQuote] = useState<DraftQuote>(createInitialDraftQuote);
  const [savedOptions, setSavedOptions] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // === NAVIGATION OPTIMISÉE ===
  const goToStep = useCallback(async (step: number, saveCurrentStepFn?: (stepIndex: number) => Promise<void>) => {
    debugLog('NAVIGATION - Passage à l\'étape', { from: activeStep, to: step - 1 });
    
    // Sauvegarder l'étape actuelle avant de naviguer
    if (activeStep !== step - 1 && saveCurrentStepFn) {
      try {
        await saveCurrentStepFn(activeStep);
      } catch (error) {
        debugLog('NAVIGATION - Erreur sauvegarde étape', { error });
      }
    }
    
    setCurrentStep(step);
    setActiveStep(step - 1);
  }, [activeStep, debugLog]);

  // === VALIDATION INCRÉMENTALE OPTIMISÉE ===
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    
    debugLog('VALIDATION - Validation des données', { activeStep });
    
    // Validation de l'étape 1
    if (activeStep >= 0) {
      if (!draftQuote.step1?.customer?.contactId) {
        errors.push('Client requis pour l\'étape 1');
      }
      if (!draftQuote.step1?.cityFrom?.name) {
        errors.push('Ville de départ requise pour l\'étape 1');
      }
      if (!draftQuote.step1?.cityTo?.name) {
        errors.push('Ville d\'arrivée requise pour l\'étape 1');
      }
    }
    
    // Validation de l'étape 2
    if (activeStep >= 1) {
      if (!draftQuote.step2?.selected || draftQuote.step2.selected.length === 0) {
        errors.push('Au moins un service requis pour l\'étape 2');
      }
    }
    
    // Validation de l'étape 3
    if (activeStep >= 2) {
      if (!draftQuote.step1?.portFrom || !draftQuote.step1?.portTo) {
        errors.push('Ports requis pour l\'étape 3');
      }
      
      // Validation des conteneurs
      const containers = draftQuote.step3?.selectedContainers;
      if (containers) {
        Object.entries(containers).forEach(([key, containerList], index) => {
          if (!Array.isArray(containerList)) {
            errors.push(`Liste de conteneurs invalide pour ${key}`);
            return;
          }
          
          containerList.forEach((container, containerIndex) => {
            if (!container.type) {
              errors.push(`Type requis pour le conteneur ${containerIndex + 1}`);
            }
            if (!container.quantity && container.quantity !== 0) {
              errors.push(`Quantité requise pour le conteneur ${containerIndex + 1}`);
            }
          });
        });
      }
    }
    
    return errors;
  }, [draftQuote, activeStep, debugLog]);

  // === VALIDATION D'ÉTAPE OPTIMISÉE ===
  const canProceedToNextStep = useMemo(() => {
    debugLog('VALIDATION - Vérification étape courante', { activeStep });
    
    switch (activeStep) {
      case 0: // Étape 1 - Validation client, villes, produit, incoterm
        const s1 = draftQuote.step1;
        return !!(
          s1?.customer && 
          s1?.cityFrom?.name && 
          s1?.cityTo?.name && 
          s1?.productName && 
          s1?.incotermName
        );
      
      case 1: // Étape 2 - Au moins un service sélectionné
        return draftQuote.step2?.selected && draftQuote.step2.selected.length > 0;
      
      case 2: // Étape 3 - Ports renseignés
        return !!(draftQuote.step1?.portFrom && draftQuote.step1?.portTo);
      
      case 3: // Étape 4 - Haulage sélectionné
        return !!draftQuote.selectedHaulage;
      
      case 4: // Étape 5 - Seafreight sélectionné
        return Array.isArray(draftQuote.selectedSeafreights) && draftQuote.selectedSeafreights.length > 0;
      
      case 5: // Étape 6 - Miscellaneous (pas de validation stricte)
      default:
        return true;
    }
  }, [draftQuote, activeStep, debugLog]);

  // === TRANSFORMATION OPTIMISÉE ===
  const optimizedDraftData = useMemo(() => {
    debugLog('TRANSFORM - Transformation vers format SDK', { activeStep, savedOptionsCount: savedOptions.length });
    
    return {
      wizard: {
        currentStep: activeStep + 1, // Convertir activeStep (base 0) en currentStep (base 1)
        completedSteps: Array.from({ length: activeStep }, (_, i) => i + 1),
        status: savedOptions && savedOptions.length > 0 ? 'quote_draft' : 'draft',
        lastModified: new Date(),
        version: '1.0'
      },
      steps: {
        step1: {
          customer: {
            contactId: draftQuote.step1?.customer?.contactId || 0,
            contactName: draftQuote.step1?.customer?.contactName || '',
            companyName: draftQuote.step1?.customer?.companyName || ''
          },
          route: {
            origin: {
              city: {
                name: draftQuote.step1?.cityFrom?.name || '',
                country: draftQuote.step1?.cityFrom?.country || null
              },
              port: {
                name: draftQuote.step1?.portFrom?.name || '',
                code: draftQuote.step1?.portFrom?.code || ''
              }
            },
            destination: {
              city: {
                name: draftQuote.step1?.cityTo?.name || '',
                country: draftQuote.step1?.cityTo?.country || null
              },
              port: {
                name: draftQuote.step1?.portTo?.name || '',
                code: draftQuote.step1?.portTo?.code || ''
              }
            }
          },
          cargo: {
            product: {
              name: draftQuote.step1?.productName?.productName || '',
              id: draftQuote.step1?.productName?.productId || 0
            },
            incoterm: draftQuote.step1?.incotermName || ''
          },
          metadata: {
            assignee: draftQuote.step1?.assignee || '',
            comment: draftQuote.step1?.comment || '',
            status: draftQuote.step1?.status || 'NEW'
          }
        },
        step2: {
          selected: draftQuote.step2?.selected || []
        },
        step3: {
          selectedContainers: draftQuote.step3?.selectedContainers || {}
        }
      },
      options: savedOptions,
      pricing: {
        selectedHaulage: draftQuote.selectedHaulage,
        selectedSeafreights: draftQuote.selectedSeafreights || [],
        selectedMiscellaneous: draftQuote.selectedMiscellaneous || [],
        marginType: draftQuote.marginType || 'percent',
        marginValue: draftQuote.marginValue || 0
      },
      totals: {
        haulage: parseFloat(String(draftQuote.haulageTotal || 0)),
        seafreight: parseFloat(String(draftQuote.seafreightTotal || 0)),
        miscellaneous: parseFloat(String(draftQuote.miscTotal || 0)),
        subtotal: parseFloat(String(draftQuote.totalPrice || 0)),
        grandTotal: parseFloat(String(draftQuote.totalPrice || 0)),
        currency: 'EUR',
        totalTEU: draftQuote.totalTEU || 0
      }
    };
  }, [draftQuote, activeStep, savedOptions, debugLog]);

  // === MISE À JOUR SIMPLIFIÉE DU STEP1 ===
  const updateStep1 = useCallback((updates: Partial<DraftQuote['step1']>) => {
    setDraftQuote(prev => ({
      ...prev,
      step1: {
        ...prev.step1,
        ...updates
      }
    }));
  }, []);

  // === RÉINITIALISATION ===
  const resetWizard = useCallback(() => {
    debugLog('WIZARD - Réinitialisation complète');
    setDraftQuote(createInitialDraftQuote());
    setSavedOptions([]);
    setActiveStep(0);
    setCurrentStep(1);
    setIsSaving(false);
    setLastSaved(null);
  }, [debugLog]);

  return {
    // États
    activeStep,
    currentStep,
    draftQuote,
    savedOptions,
    isSaving,
    lastSaved,
    
    // Setters
    setActiveStep,
    setCurrentStep,
    setDraftQuote,
    setSavedOptions,
    setIsSaving,
    setLastSaved,
    
    // Actions
    goToStep,
    updateStep1,
    resetWizard,
    
    // Computed
    validationErrors,
    canProceedToNextStep,
    optimizedDraftData,
    
    // Utils
    createInitialDraftQuote
  };
};
