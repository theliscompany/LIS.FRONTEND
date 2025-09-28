import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Box, Button, Alert, AlertTitle, Typography } from '@mui/material';
import { Save, ArrowBack, ArrowForward, Send } from '@mui/icons-material';

import { DraftQuoteForm } from './schema';
import { wizardSteps, navigationConfig, isStepComplete } from './wizard.config';
import { BasicsStep } from './pages/BasicsStep';
import { OptionsStep } from './pages/OptionsStep';
import { ReviewStep } from './pages/ReviewStep';
import QuotePreviewDialog from './components/QuotePreviewDialog';

interface StepRouterProps {
  currentStep: string;
  onStepChange: (step: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: (data: DraftQuoteForm) => Promise<void>;
  onSave: () => void;
  onSaveDraft: () => Promise<string | null>;
  onReset: () => void;
  isAutoSaving: boolean;
  isDraftSaving: boolean;
  hasUnsavedChanges: boolean;
  lastAutoSave: Date | null;
  lastDraftSaved: Date | null;
  requestData?: any;
  readonly?: boolean;
  draftId?: string | null;
  onCreateOption?: () => void;
  onEditOption?: (option: any) => void;
  onUpdateOption?: (optionId: string, updatedOption: Partial<any>) => void;
  onDeleteOption?: (optionId: string) => void;
  onViewOption?: (option: any) => void;
  onSetPreferredOption?: (optionId: string) => void;
  preferredOptionId?: string;
  onDuplicateOption?: (option: any) => void;
  onSaveCurrentOption?: (optionName: string, optionDescription?: string) => Promise<any>;
  isFinalizing?: boolean;
  optionTypesData?: any;
  isLoadingOptionTypes?: boolean;
  onQuoteCreated?: () => void; // Callback pour rafraîchir la liste des devis
}

export const StepRouter: React.FC<StepRouterProps> = ({
  currentStep,
  onStepChange,
  onNext,
  onPrevious,
  onSubmit,
  onSave,
  onSaveDraft,
  onReset,
  isAutoSaving,
  isDraftSaving,
  hasUnsavedChanges,
  lastAutoSave,
  lastDraftSaved,
  requestData,
  readonly = false,
  draftId,
  onCreateOption,
  onEditOption,
  onUpdateOption,
  onDeleteOption,
  onViewOption,
  onSetPreferredOption,
  preferredOptionId,
  onDuplicateOption,
  onSaveCurrentOption,
  isFinalizing = false,
  optionTypesData,
  isLoadingOptionTypes = false,
  onQuoteCreated
}) => {
  const { formState: { errors }, watch } = useFormContext<DraftQuoteForm>();
  const formData = watch();
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);

  // Get current step index
  const currentStepIndex = wizardSteps.findIndex(step => step.id === currentStep);
  const currentStepConfig = wizardSteps[currentStepIndex];

  // Check if current step is complete
  const isCurrentStepComplete = isStepComplete(currentStep as any, formData);

  // Check if we can navigate to next step
  // In readonly mode, allow navigation even if step is not "complete" by validation
  const canGoNext = currentStepIndex < wizardSteps.length - 1 && (isCurrentStepComplete || readonly);
  
  // Check if we can create quote (enabled when at least one option exists)
  const canCreateQuote = (formData.existingOptions?.length || 0) >= 1;

  // Handle preview quote
  const handlePreviewQuote = () => {
    setShowPreviewDialog(true);
  };

  // Handle confirm create quote - this should create the final quote, not a new option
  const handleConfirmCreateQuote = async () => {
    setIsCreatingQuote(true);
    try {
      console.log('🔄 [StepRouter] handleConfirmCreateQuote appelé');
      console.log('📋 [StepRouter] FormData actuel:', JSON.stringify(formData, null, 2));
      console.log('🔍 [StepRouter] FormData.basics:', formData.basics);
      console.log('🔍 [StepRouter] FormData.existingOptions:', formData.existingOptions);
      
      // This should create the final quote with all existing options
      await onSubmit(formData);
    } finally {
      setIsCreatingQuote(false);
    }
  };
  
  // Debug logging
  console.log('🔍 [STEP_ROUTER] Navigation debug:', {
    currentStep,
    currentStepIndex,
    isCurrentStepComplete,
    readonly,
    canGoNext,
    canCreateQuote,
    existingOptionsCount: formData.existingOptions?.length || 0,
    hasFormData: !!formData,
    formDataKeys: formData ? Object.keys(formData) : []
  });
  const canGoPrevious = currentStepIndex > 0;

  // Get all form errors
  const allErrors = Object.keys(errors).length > 0 ? errors : null;

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'basics':
        return <BasicsStep readonly={readonly} requestData={requestData} />;
      case 'options':
        return (
          <OptionsStep 
            onSaveCurrentOption={onSaveCurrentOption}
            draftId={draftId}
            readonly={readonly}
          />
        );
      case 'review':
        return (
          <ReviewStep 
            onSubmit={onSubmit}
            onSaveDraft={onSaveDraft}
            isDraftSaving={isDraftSaving}
            lastDraftSaved={lastDraftSaved}
            draftId={draftId}
            onCreateOption={onCreateOption || (() => {})}
            onEditOption={onEditOption || (() => {})}
            onUpdateOption={onUpdateOption}
            onDeleteOption={onDeleteOption || (() => {})}
            onViewOption={onViewOption || (() => {})}
            onSetPreferredOption={onSetPreferredOption || (() => {})}
            preferredOptionId={preferredOptionId}
            onDuplicateOption={onDuplicateOption || (() => {})}
            optionTypesData={optionTypesData}
            isLoadingOptionTypes={isLoadingOptionTypes}
            onQuoteCreated={onQuoteCreated}
          />
        );
      default:
        return (
          <Alert severity="error">
            <AlertTitle>Unknown Step</AlertTitle>
            Step "{currentStep}" not found.
          </Alert>
        );
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Error Panel */}
      {allErrors && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Form Errors</AlertTitle>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            {Object.entries(allErrors).map(([field, error]) => (
              <li key={field}>
                <Button
                  size="small"
                  onClick={() => {
                    const element = document.querySelector(`[name="${field}"]`);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      (element as HTMLElement).focus();
                    }
                  }}
                  sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
                >
                  {field}: {error?.message || 'Invalid value'}
                </Button>
              </li>
            ))}
          </Box>
        </Alert>
      )}

      {/* Step Content */}
      <Box sx={{ flex: 1, mb: 3 }}>
        {renderStepContent()}
      </Box>

      {/* Navigation Footer */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}>
        {/* Left side - Previous button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={onPrevious}
          disabled={!canGoPrevious}
          variant="outlined"
        >
          Previous
        </Button>

        {/* Center - Step info and actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Auto-save status */}
          {isAutoSaving && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
              <Save fontSize="small" />
              <span>Saving...</span>
            </Box>
          )}
          
          {hasUnsavedChanges && !isAutoSaving && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
              <Save fontSize="small" />
              <span>Unsaved changes</span>
            </Box>
          )}

          {lastAutoSave && !hasUnsavedChanges && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
              <Save fontSize="small" />
              <span>Saved {lastAutoSave.toLocaleTimeString()}</span>
            </Box>
          )}

          {/* Manual save button */}
          <Button
            startIcon={<Save />}
            onClick={onSaveDraft}
            disabled={isAutoSaving || isDraftSaving}
            size="small"
            variant="outlined"
          >
            Save Draft
          </Button>

          {/* Reset button */}
          <Button
            onClick={onReset}
            disabled={isAutoSaving}
            size="small"
            variant="outlined"
            color="warning"
          >
            Reset
          </Button>

        </Box>

        {/* Right side - Next/Submit button */}
        {currentStep === 'review' ? (
          <Button
            endIcon={<Send />}
            onClick={handlePreviewQuote}
            disabled={!canCreateQuote || isAutoSaving || isFinalizing}
            variant="contained"
            color="primary"
            size="large"
          >
            Preview Quote
          </Button>
        ) : (
          <Button
            endIcon={<ArrowForward />}
            onClick={onNext}
            disabled={!canGoNext || isAutoSaving}
            variant="contained"
            color="primary"
          >
            Next
          </Button>
        )}
      </Box>

      {/* Dialog de prévisualisation du devis */}
      <QuotePreviewDialog
        open={showPreviewDialog}
        onClose={() => setShowPreviewDialog(false)}
        onConfirm={handleConfirmCreateQuote}
        formData={formData}
        isCreating={isCreatingQuote || isFinalizing}
      />
    </Box>
  );
};


export default StepRouter;
