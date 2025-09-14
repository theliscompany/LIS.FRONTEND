import { useCallback } from 'react';
import { useWizard } from '../context/WizardContext';
import type { HaulageResponse, SeaFreightResponse, MiscellaneousResponse } from '@features/pricingnew/api/types.gen';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const useWizardValidation = () => {
  const { state, setValidationErrors, clearValidationErrors } = useWizard();

  // Validation de l'étape 1 - Informations client
  const validateStep1 = useCallback((): ValidationResult => {
    const selectedOption = state.payload.selectedOption ?? 0;
    const currentOption = state.payload.options?.[selectedOption] as any;
    const errors: string[] = [];

    if (!currentOption?.requestData?.customer?.contactName) {
      errors.push('Le nom du client est requis');
    }

    if (!currentOption?.requestData?.customer?.email) {
      errors.push('L\'email du client est requis');
    }

    if (!currentOption?.requestData?.pickupLocation?.displayName) {
      errors.push('Le lieu de ramassage est requis');
    }

    if (!currentOption?.requestData?.deliveryLocation?.displayName) {
      errors.push('Le lieu de livraison est requis');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [state.payload]);

  // Validation de l'étape 2 - Produits et containers
  const validateStep2 = useCallback((): ValidationResult => {
    const selectedOption = state.payload.selectedOption ?? 0;
    const currentOption = state.payload.options?.[selectedOption] as any;
    const errors: string[] = [];

    if (!currentOption?.requestData?.products || currentOption.requestData.products.length === 0) {
      errors.push('Au moins un produit doit être sélectionné');
    }

    if (!currentOption?.requestData?.containers || currentOption.requestData.containers.length === 0) {
      errors.push('Au moins un container doit être sélectionné');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [state.payload]);

  // Validation de l'étape 3 - Services (optionnel)
  const validateStep3 = useCallback((): ValidationResult => {
    // Les services sont optionnels, donc toujours valide
    return {
      isValid: true,
      errors: []
    };
  }, []);

  // Validation de l'étape 4 - Haulage
  const validateStep4 = useCallback((): ValidationResult => {
    const selectedOption = state.payload.selectedOption ?? 0;
    const currentOption = state.payload.options?.[selectedOption];
    const errors: string[] = [];

    if (!currentOption?.selectedHaulage) {
      errors.push('Un service de transport routier doit être sélectionné');
      return { isValid: false, errors };
    }

    const haulage = currentOption.selectedHaulage as HaulageResponse;

    if (!haulage.haulierName) {
      errors.push('Le nom du transporteur est requis');
    }

    if (!haulage.unitTariff || haulage.unitTariff <= 0) {
      errors.push('Le tarif unitaire doit être supérieur à 0');
    }

    if (!haulage.currency) {
      errors.push('La devise est requise');
    }

    if (!haulage.pickupLocation?.displayName) {
      errors.push('Le lieu de ramassage est requis');
    }

    if (!haulage.deliveryLocation?.displayName) {
      errors.push('Le lieu de livraison est requis');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [state.payload]);

  // Validation de l'étape 5 - Seafreight
  const validateStep5 = useCallback((): ValidationResult => {
    const selectedOption = state.payload.selectedOption ?? 0;
    const currentOption = state.payload.options?.[selectedOption];
    const errors: string[] = [];

    if (!currentOption?.selectedSeafreight) {
      errors.push('Un service de fret maritime doit être sélectionné');
      return { isValid: false, errors };
    }

    const seafreight = currentOption.selectedSeafreight as SeaFreightResponse;

    if (!seafreight.carrier?.name) {
      errors.push('Le nom du transporteur maritime est requis');
    }

    if (!seafreight.departurePort?.portName) {
      errors.push('Le port de départ est requis');
    }

    if (!seafreight.arrivalPort?.portName) {
      errors.push('Le port d\'arrivée est requis');
    }

    if (!seafreight.charges?.baseFreight || seafreight.charges.baseFreight <= 0) {
      errors.push('Le fret de base doit être supérieur à 0');
    }

    if (!seafreight.currency) {
      errors.push('La devise est requise');
    }

    if (!seafreight.validity?.endDate) {
      errors.push('La date de validité est requise');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [state.payload]);

  // Validation de l'étape 6 - Miscellaneous (optionnel)
  const validateStep6 = useCallback((): ValidationResult => {
    // Les services divers sont optionnels, donc toujours valide
    return {
      isValid: true,
      errors: []
    };
  }, []);

  // Validation de l'étape 7 - Validation finale
  const validateStep7 = useCallback((): ValidationResult => {
    const errors: string[] = [];

    // Vérifier que toutes les étapes précédentes sont valides
    const step1Validation = validateStep1();
    const step2Validation = validateStep2();
    const step4Validation = validateStep4();
    const step5Validation = validateStep5();

    if (!step1Validation.isValid) {
      errors.push('Étape 1: Informations client incomplètes');
    }

    if (!step2Validation.isValid) {
      errors.push('Étape 2: Produits et containers incomplets');
    }

    if (!step4Validation.isValid) {
      errors.push('Étape 4: Transport routier incomplet');
    }

    if (!step5Validation.isValid) {
      errors.push('Étape 5: Fret maritime incomplet');
    }

    // Vérifications supplémentaires pour la validation finale
    const selectedOption = state.payload.selectedOption ?? 0;
    const currentOption = state.payload.options?.[selectedOption] as any;
    
    if (!currentOption?.requestData?.trackingNumber) {
      errors.push('Le numéro de suivi de la demande est requis');
    }

    if (!state.payload.emailUser) {
      errors.push('L\'email de l\'utilisateur est requis');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [state.payload, validateStep1, validateStep2, validateStep4, validateStep5]);

  // Validation générale d'une étape
  const validateStep = useCallback((step: number): ValidationResult => {
    switch (step) {
      case 1:
        return validateStep1();
      case 2:
        return validateStep2();
      case 3:
        return validateStep3();
      case 4:
        return validateStep4();
      case 5:
        return validateStep5();
      case 6:
        return validateStep6();
      case 7:
        return validateStep7();
      default:
        return { isValid: false, errors: ['Étape inconnue'] };
    }
  }, [validateStep1, validateStep2, validateStep3, validateStep4, validateStep5, validateStep6, validateStep7]);

  // Validation de l'étape courante
  const validateCurrentStep = useCallback((): ValidationResult => {
    return validateStep(state.currentStep);
  }, [validateStep, state.currentStep]);

  // Validation et mise à jour des erreurs
  const validateAndUpdateErrors = useCallback((step?: number) => {
    const stepToValidate = step || state.currentStep;
    const validation = validateStep(stepToValidate);
    
    if (validation.errors.length > 0) {
      setValidationErrors({
        [`step_${stepToValidate}`]: validation.errors
      });
    } else {
      clearValidationErrors();
    }

    return validation;
  }, [validateStep, state.currentStep, setValidationErrors, clearValidationErrors]);

  // Validation de toutes les étapes
  const validateAllSteps = useCallback((): ValidationResult => {
    const allErrors: string[] = [];

    for (let step = 1; step <= 7; step++) {
      const validation = validateStep(step);
      if (!validation.isValid) {
        allErrors.push(`Étape ${step}: ${validation.errors.join(', ')}`);
      }
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  }, [validateStep]);

  // Vérification si on peut passer à l'étape suivante
  const canProceedToNextStep = useCallback((): boolean => {
    const currentValidation = validateCurrentStep();
    return currentValidation.isValid;
  }, [validateCurrentStep]);

  return {
    // Validations spécifiques
    validateStep1,
    validateStep2,
    validateStep3,
    validateStep4,
    validateStep5,
    validateStep6,
    validateStep7,
    
    // Validations générales
    validateStep,
    validateCurrentStep,
    validateAndUpdateErrors,
    validateAllSteps,
    canProceedToNextStep
  };
}; 