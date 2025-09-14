// ✅ COMPOSANTS EXPORTÉS
export { default as Step1RequestForm } from './Step1RequestForm';
export { default as Step2SelectServices } from './Step2SelectServices';
export { default as Step3RequestForm } from './Step3RequestForm';
export { default as Step4HaulierSelection } from './Step4HaulierSelection';
export { default as Step5SeafreightSelection } from './Step5SeafreightSelection';
export { default as Step6MiscellaneousSelection } from './Step6MiscellaneousSelection';
export { default as Step7Recap } from './Step7Recap';

// ✅ COMPOSANTS DE STATUT ET SYNCHRONISATION
export { WizardSyncStatus } from './WizardSyncStatus';
export { DraftSyncStatus } from './DraftSyncStatus';
export { AdvancedSyncStatus } from './AdvancedSyncStatus';

// ✅ COMPOSANTS DE GESTION
export { default as BasketSummary } from './BasketSummary';
export { default as OfferBasketDrawerAccordion } from './OfferBasketDrawerAccordion';
export { OptionManagementPanel } from './OptionManagementPanel';
export { default as QuoteOptionsManager } from './QuoteOptionsManager';

// ✅ COMPOSANTS UTILITAIRES
export { default as AddContainer } from './AddContainer';
export { default as ContainerElement } from './ContainerElement';
export { default as ContainerPrice } from './ContainerPrice';
export { default as ContainersDisplay } from './ContainersDisplay';
export { default as CompareOptions } from './CompareOptions';
export { default as FinalValidation } from './FinalValidation';
export { default as GeneratePriceOffer } from './GeneratePriceOffer';
export { default as ManualSaveButton } from './ManualSaveButton';
export { default as RequestForm } from './RequestForm';
export { default as RequestFormHeader } from './RequestFormHeader';
export { default as RequestsList } from './RequestsList';
export { default as RequestViewItem } from './RequestViewItem';
export { default as SearchZone } from './SearchZone';
export { WizardHeader } from './WizardHeader';

// ✅ COMPOSANTS DE DEBUG ET TEST
export { default as DraftStateDebugger } from './DraftStateDebugger';
export { DraftWizardDemo } from './DraftWizardDemo';
export { default as SeafreightCalculationDebugger } from './SeafreightCalculationDebugger';
export { default as TotalsDebugger } from './TotalsDebugger';
export { WizardTest } from './WizardTest';
export { ConsolidatedTestSuite } from './ConsolidatedTestSuite';

// ✅ COMPOSANTS D'INFORMATION
export { default as RequestAddNote } from './info/RequestAddNote';
export { default as RequestAskInformation } from './info/RequestAskInformation';
export { default as RequestChangeStatus } from './info/RequestChangeStatus';
export { default as RequestListNotes } from './info/RequestListNotes';

// ✅ COMPOSANTS DE GRAPHIQUES
export { default as OffersStatusPieChart } from './chart/OffersStatusPieChart';
export { default as RequestsPerAssigneeChart } from './chart/RequestsPerAssigneeChart';
export { default as RequestsStatusPieChart } from './chart/RequestsStatusPieChart';

// ✅ COMPOSANTS SPÉCIALISÉS
export { default as HaulageApiIntegration } from './HaulageApiIntegration';
export { default as OfferGenerationStep } from './OfferGenerationStep';
export { default as Request } from './Request';
export { default as SaveStrategyInfo } from './SaveStrategyInfo';
export { useNewRequestQuote } from './useNewRequestQuote';
