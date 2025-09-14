import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const useWizardNavigation = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [activeStep, setActiveStep] = useState(0);

  // Define wizard steps
  const steps = [
    t('wizard.steps.request'),
    t('wizard.steps.services'),
    t('wizard.steps.summary'),
    t('wizard.steps.haulier'),
    t('wizard.steps.seafreight'),
    t('wizard.steps.miscellaneous')
  ];

  const totalSteps = steps.length;

  // Navigate to a specific step
  const navigateToStep = useCallback((stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= totalSteps) {
      setCurrentStep(stepNumber);
      setActiveStep(stepNumber - 1);
    }
  }, [totalSteps]);

  // Go to next step
  const goToNextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      navigateToStep(currentStep + 1);
    }
  }, [currentStep, totalSteps, navigateToStep]);

  // Go to previous step
  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      navigateToStep(currentStep - 1);
    }
  }, [currentStep, navigateToStep]);

  // Go to first step
  const goToFirstStep = useCallback(() => {
    navigateToStep(1);
  }, [navigateToStep]);

  // Go to last step
  const goToLastStep = useCallback(() => {
    navigateToStep(totalSteps);
  }, [totalSteps, navigateToStep]);

  // Check if navigation to a step is allowed
  const canNavigateToStep = useCallback((stepNumber: number) => {
    // Basic validation - can be enhanced with business logic
    return stepNumber >= 1 && stepNumber <= totalSteps;
  }, [totalSteps]);

  // Check if can go to next step
  const canGoToNext = useCallback(() => {
    return currentStep < totalSteps;
  }, [currentStep, totalSteps]);

  // Check if can go to previous step
  const canGoToPrevious = useCallback(() => {
    return currentStep > 1;
  }, [currentStep]);

  // Get step information
  const getStepInfo = useCallback((stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= totalSteps) {
      return {
        number: stepNumber,
        title: steps[stepNumber - 1],
        isActive: stepNumber === currentStep,
        isCompleted: stepNumber < currentStep,
        isLast: stepNumber === totalSteps
      };
    }
    return null;
  }, [steps, currentStep, totalSteps]);

  // Get current step info
  const getCurrentStepInfo = useCallback(() => {
    return getStepInfo(currentStep);
  }, [currentStep, getStepInfo]);

  // Reset navigation to first step
  const resetNavigation = useCallback(() => {
    setCurrentStep(1);
    setActiveStep(0);
  }, []);

  return {
    // State
    currentStep,
    activeStep,
    totalSteps,
    steps,
    
    // Actions
    navigateToStep,
    goToNextStep,
    goToPreviousStep,
    goToFirstStep,
    goToLastStep,
    resetNavigation,
    
    // Validation
    canNavigateToStep,
    canGoToNext,
    canGoToPrevious,
    
    // Information
    getStepInfo,
    getCurrentStepInfo,
    
    // Setters
    setCurrentStep,
    setActiveStep
  };
};
