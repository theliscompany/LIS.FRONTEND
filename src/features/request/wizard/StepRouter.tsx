import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Box, Button, Alert, AlertTitle, Typography } from '@mui/material';
import { Save, ArrowBack, ArrowForward, Send } from '@mui/icons-material';

import { DraftQuoteForm } from './schema';
import { wizardSteps, navigationConfig, isStepComplete } from './wizard.config';
import { BasicsStep } from './pages/BasicsStep';
import { OptionsStep } from './pages/OptionsStep';
import { ReviewStep } from './pages/ReviewStep';

interface StepRouterProps {
  currentStep: string;
  onStepChange: (step: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
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
  onDeleteOption?: (optionId: string) => void;
  onViewOption?: (option: any) => void;
  onSetPreferredOption?: (optionId: string) => void;
  preferredOptionId?: string;
  onDuplicateOption?: (option: any) => void;
  onSaveCurrentOption?: (optionName: string, optionDescription?: string) => Promise<any>;
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
  onDeleteOption,
  onViewOption,
  onSetPreferredOption,
  preferredOptionId,
  onDuplicateOption,
  onSaveCurrentOption
}) => {
  const { formState: { errors }, watch } = useFormContext<DraftQuoteForm>();
  const formData = watch();

  // Get current step index
  const currentStepIndex = wizardSteps.findIndex(step => step.id === currentStep);
  const currentStepConfig = wizardSteps[currentStepIndex];

  // Check if current step is complete
  const isCurrentStepComplete = isStepComplete(currentStep as any, formData);

  // Check if we can navigate to next step
  // In readonly mode, allow navigation even if step is not "complete" by validation
  const canGoNext = currentStepIndex < wizardSteps.length - 1 && (isCurrentStepComplete || readonly);
  
  // Debug logging
  console.log('🔍 [STEP_ROUTER] Navigation debug:', {
    currentStep,
    currentStepIndex,
    isCurrentStepComplete,
    readonly,
    canGoNext,
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
            onCreateOption={onCreateOption}
            onEditOption={onEditOption}
            onDeleteOption={onDeleteOption}
            onViewOption={onViewOption}
            onSetPreferredOption={onSetPreferredOption}
            preferredOptionId={preferredOptionId}
            onDuplicateOption={onDuplicateOption}
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

          {/* Total indicator */}
          <TotalIndicator formData={formData} />
        </Box>

        {/* Right side - Next/Submit button */}
        {currentStep === 'review' ? (
          <Button
            endIcon={<Send />}
            onClick={onSubmit}
            disabled={!isCurrentStepComplete || isAutoSaving}
            variant="contained"
            color="primary"
            size="large"
          >
            Create Option
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
    </Box>
  );
};

// Indicateur de total compact
const TotalIndicator: React.FC<{ formData: DraftQuoteForm }> = ({ formData }) => {

  // Calculer le total général
  const calculateGrandTotal = (): number => {
    let total = 0;

    // Total de l'option actuelle
    const currentOption = formData.currentOption;
    if (currentOption) {
      currentOption.seafreights?.forEach((sf: any) => {
        sf.rates?.forEach((rate: any) => {
          total += rate.basePrice || 0;
        });
      });

      currentOption.haulages?.forEach((haulage: any) => {
        total += haulage.price || 0;
      });

      currentOption.services?.forEach((service: any) => {
        total += service.price || 0;
      });
    }

    // Total des options existantes
    const existingOptions = formData.existingOptions || [];
    existingOptions.forEach((option) => {
      total += option.totalPrice || 0;
    });

    return total;
  };

  const grandTotal = calculateGrandTotal();
  const existingOptionsCount = (formData.existingOptions || []).length;

  const formatPrice = (price: number) => {
    if (price === 0) return '0 €';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (grandTotal === 0) return null;

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      px: 2,
      py: 1,
      borderRadius: 2,
      background: 'linear-gradient(135deg, #1976d2 0%, #7b1fa2 100%)',
      color: 'white',
      minWidth: 'fit-content'
    }}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        💰 {formatPrice(grandTotal)}
      </Typography>
      {existingOptionsCount > 0 && (
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          ({existingOptionsCount} option{existingOptionsCount > 1 ? 's' : ''})
        </Typography>
      )}
    </Box>
  );
};

export default StepRouter;
