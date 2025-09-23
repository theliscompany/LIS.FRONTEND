// Main components
export { WizardEngine } from './WizardEngine';
export { StepRouter } from './StepRouter';
export { LivePreview } from './LivePreview';
export { NewRequestWizard } from './NewRequestWizard';
export { ExpressWizard } from './ExpressWizard';

// Pages
export { BasicsStep } from './pages/BasicsStep';
export { OptionsStep } from './pages/OptionsStep';
export { ReviewStep } from './pages/ReviewStep';
export { ExpressStep } from './pages/ExpressStep';

// Schema and types
export { 
  DraftQuoteFormSchema, 
  DraftQuoteForm, 
  defaultDraftQuoteForm,
  validateDraftQuoteForm,
  validateDraftQuoteFormField
} from './schema';

// Configuration
export { 
  wizardSteps, 
  navigationConfig, 
  calculateProgress,
  isStepComplete,
  type WizardStepId
} from './wizard.config';

// API adapter
export { 
  toDraftQuotePayload, 
  validateFormForSubmission, 
  createResumeToken,
  getOrCreateResumeToken
} from './toDraftQuote';

// Request adapters
export {
  adaptRequestToWizardForm,
  validateRequestData,
  extractContactInfo,
  extractRouteInfo,
  extractProductInfo,
  createAdaptationSummary
} from './adapters/requestToWizardAdapter';
