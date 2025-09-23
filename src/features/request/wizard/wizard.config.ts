export const wizardSteps = [
  { 
    id: "basics",  
    label: "Basics",        
    fields: ["basics.*"],
    description: "Cargo type, origin, destination, and basic information"
  },
  { 
    id: "options", 
    label: "Options",       
    fields: ["options.*"],
    description: "Seafreight, haulage, and additional services"
  },
  { 
    id: "review",  
    label: "Review & Send", 
    fields: ["basics.*", "options.*", "attachments"],
    description: "Review all information and submit the quote"
  },
] as const;

export type WizardStepId = typeof wizardSteps[number]["id"];

// Step validation rules
export const stepValidationRules = {
  basics: {
    required: ["cargoType", "incoterm", "origin.city", "origin.country", "destination.city", "destination.country", "goodsDescription"],
    optional: ["requestedDeparture"]
  },
  options: {
    required: [], // At least one option should be selected
    optional: ["seafreights", "haulages", "services"]
  },
  review: {
    required: ["basics.*", "options.*"], // All previous steps must be valid
    optional: ["attachments"]
  }
} as const;

// Navigation configuration
export const navigationConfig = {
  canGoBack: (currentStep: WizardStepId): boolean => {
    return currentStep !== "basics";
  },
  canGoNext: (currentStep: WizardStepId): boolean => {
    return currentStep !== "review";
  },
  getNextStep: (currentStep: WizardStepId): WizardStepId | null => {
    const currentIndex = wizardSteps.findIndex(step => step.id === currentStep);
    return currentIndex < wizardSteps.length - 1 ? wizardSteps[currentIndex + 1].id : null;
  },
  getPreviousStep: (currentStep: WizardStepId): WizardStepId | null => {
    const currentIndex = wizardSteps.findIndex(step => step.id === currentStep);
    return currentIndex > 0 ? wizardSteps[currentIndex - 1].id : null;
  },
  getStepIndex: (stepId: WizardStepId): number => {
    return wizardSteps.findIndex(step => step.id === stepId);
  },
  getStepById: (stepId: WizardStepId) => {
    return wizardSteps.find(step => step.id === stepId);
  }
};

// Progress calculation
export const calculateProgress = (currentStep: WizardStepId): number => {
  const currentIndex = wizardSteps.findIndex(step => step.id === currentStep);
  return ((currentIndex + 1) / wizardSteps.length) * 100;
};

// Step completion validation
export const isStepComplete = (stepId: WizardStepId, formData: any): boolean => {
  const rules = stepValidationRules[stepId];
  
  if (!rules) return false;
  
  // Check required fields
  for (const field of rules.required) {
    if (field.includes('*')) {
      // Handle wildcard fields (e.g., "basics.*")
      const prefix = field.replace('.*', '');
      const section = formData[prefix];
      if (!section || Object.keys(section).length === 0) {
        return false;
      }
    } else {
      // Handle specific fields
      const fieldPath = field.split('.');
      let value = formData;
      for (const part of fieldPath) {
        value = value?.[part];
      }
      if (value === undefined || value === null || value === '') {
        return false;
      }
    }
  }
  
  return true;
};
