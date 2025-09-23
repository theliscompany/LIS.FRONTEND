import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
  Stepper, Step, StepLabel, Box, Button, 
  Typography, Alert, CircularProgress, Dialog, 
  DialogTitle, DialogContent, DialogActions,
  IconButton
} from "@mui/material";
import { Save, Warning, BugReport, Close, Code } from "@mui/icons-material";

// Utils
import { isBackendGeneratedId } from '../utils/draftIdValidation';
import { incotermValues } from '@utils/constants';

// New API DraftQuote
import { 
  mapDraftQuoteFromApi,
  mapDraftQuoteToApi,
  mapDraftQuoteToUpdateApi,
  validateDraftQuote,
  createEmptyOption
} from '../../offer/services/draftQuoteService';
import type { DraftQuote, DraftQuoteOption } from '../../offer/types/DraftQuote';
import { convertRequestToDraftQuote, validateRequestData } from '../utils/requestToDraftQuoteConverter';

// Step Components
import Step1RequestForm from '../components/Step1RequestForm';
import Step2Step3Merged from '../components/Step2Step3Merged';
import Step4HaulierSelection from '../components/Step4HaulierSelection';
import Step5SeafreightSelection from '../components/Step5SeafreightSelection';
import Step6MiscellaneousSelection from '../components/Step6MiscellaneousSelection';
import Step7Recap from '../components/Step7Recap';

// New Hooks
import { useWizardStateManagerV3 } from '../hooks/useWizardStateManagerV3';
import { useWizardOptionsManagerV3 } from '../hooks/useWizardOptionsManagerV3';
import WizardSyncStatusV3 from '../components/WizardSyncStatusV3';

// Types
import { StatusRequest } from '../api/types.gen';

// External Hooks
import { useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useAccount, useMsal } from '@azure/msal-react';

// Utility: Safe JSON stringify
const safeJsonStringify = (obj: any, maxLength: number = 50000): string => {
  try {
    const jsonString = JSON.stringify(obj, null, 2);
    return jsonString.length > maxLength ? 
      jsonString.substring(0, maxLength) + '\n\n... (truncated - too large)' : 
      jsonString;
  } catch (error) {
    return `Serialization error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};

export default function RequestWizardV3() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [urlSearchParams] = useSearchParams();
  
  // Get current user
  const { accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  
  // Get parameters
  const draftId = params.id || urlSearchParams.get('draftId') || urlSearchParams.get('loadDraft');
  const quoteId = urlSearchParams.get('quoteId');
  const stepParam = urlSearchParams.get('step');
  
  console.log('🎯 [WIZARD_V3] Parameters received:', {
    params: params,
    draftId,
    quoteId,
    stepParam,
    urlSearchParams: Object.fromEntries(urlSearchParams.entries()),
    location: location.pathname,
    search: location.search
  });
  
  // Current user
  const currentUserEmail = account?.username || 'user@example.com';
  
  // Validate navigation data
  const navigationValidation = validateRequestData(location.state?.requestData);
  
  // Log received data
  if (location.state?.requestData) {
    console.log('📥 [WIZARD_V3] Data received from Requests.tsx:', {
      requestId: location.state.requestData.requestQuoteId,
      assignee: location.state.requestData.assigneeDisplayName,
      incoterm: location.state.requestData.incoterm,
      source: location.state.source,
      fullData: location.state.requestData
    });
  }
  
  // Create initial draft quote
  const initialDraftQuote = useMemo(() => {
    if (navigationValidation.isValid && navigationValidation.requestData) {
      console.log('[RequestWizardV3] Initializing from existing request with new API:', navigationValidation.requestQuoteId);
      return convertRequestToDraftQuote(
        navigationValidation.requestData, 
        currentUserEmail
      );
    }
    
    console.log('[RequestWizardV3] Direct access without existing request - creating new draft with new API');
    return {
      requestQuoteId: 'temp-request-id',
      status: 'draft',
      currency: 'EUR',
      incoterm: 'FOB',
      customer: {
        type: 'company',
        name: '',
        vat: '',
        emails: [],
        phones: [],
        address: { city: '', country: '' },
        contactPerson: { fullName: '', phone: '', email: '' },
      },
      shipment: {
        mode: 'sea',
        containerCount: 1,
        containerTypes: ['20GP'],
        commodity: '',
        hsCodes: [],
        origin: { location: '', country: '' },
        destination: { location: '', country: '' },
        requestedDeparture: new Date(),
        docs: { requiresVGM: false, requiresBLDraftApproval: false },
        constraints: { minTruckLeadDays: 6, terminalCutoffDays: 11, customsDeadlineHours: 48 },
      },
      wizard: { notes: '', selectedServiceLevel: 'standard', seafreights: [], haulages: [], services: [] },
      options: [],
      attachments: [],
      commercialTerms: { depositPolicy: { type: 'fixed', value: 0 }, generalConditionsId: '' },
    };
  }, [location.state, currentUserEmail, navigationValidation, navigate]);
  
  // Use new wizard state manager
  const {
    state: wizardState,
    updateStep,
    updateDraftQuote,
    saveDraft,
    loadDraft,
    resetDraft,
    goToStep,
    canGoToNext,
    canGoToPrevious
  } = useWizardStateManagerV3(
    initialDraftQuote,
    currentUserEmail,
    'DEFAULT_CLIENT',
    draftId
  );

  // Use new options manager
  const {
    options: savedOptions,
    currentOptionIndex,
    createNewOption,
    loadOption,
    saveOption,
    deleteOption,
    duplicateOption,
    selectOption,
    compareOptions,
    refreshOptions
  } = useWizardOptionsManagerV3(
    wizardState.draftQuote,
    draftId,
    (option) => {
      console.log('Option changed:', option);
    }
  );

  // Debug modal state
  const [showDebugModal, setShowDebugModal] = useState(false);

  // Load existing draft if draftId provided
  useEffect(() => {
    console.log('🔍 [WIZARD_V3] useEffect triggered with:', { draftId, stepParam });
    
    if (draftId && draftId !== 'new') {
      console.log('🔍 [WIZARD_V3] ID received:', {
        draftId,
        isBackendId: isBackendGeneratedId(draftId),
        idLength: draftId?.length,
        idType: typeof draftId
      });
      
      if (!draftId || draftId === 'new') {
        console.warn('⚠️ [WIZARD_V3] No ID or ID "new", redirecting to Requests:', draftId);
        enqueueSnackbar('No draft ID provided', { variant: 'warning' });
        setTimeout(() => navigate('/requests', { replace: true }), 2000);
        return;
      }
      
      console.log('🔄 [WIZARD_V3] Loading existing draft:', draftId);
      
      const loadExistingDraft = async () => {
        try {
          console.log('📞 [WIZARD_V3] Calling loadDraft with:', draftId);
          const success = await loadDraft(draftId);
          console.log('📞 [WIZARD_V3] loadDraft result:', success);
          
          if (success) {
            console.log('✅ [WIZARD_V3] Draft loaded successfully');
            
            // Resume at specific step if provided
            if (stepParam) {
              const targetStep = parseInt(stepParam);
              if (!isNaN(targetStep) && targetStep >= 0 && targetStep <= 6) {
                console.log('🎯 [WIZARD_V3] Resuming at step:', targetStep);
                goToStep(targetStep);
              }
            }
          } else {
            console.error('❌ [WIZARD_V3] Failed to load draft');
            enqueueSnackbar('Draft not found - creating new draft', { variant: 'warning' });
          }
        } catch (error) {
          console.error('❌ [WIZARD_V3] Error during loading:', error);
          enqueueSnackbar('Error loading draft - creating new draft', { variant: 'warning' });
        }
      };
      
      loadExistingDraft();
    } else {
      console.log('ℹ️ [WIZARD_V3] No loading necessary - draftId:', draftId);
    }
  }, [draftId, stepParam, loadDraft, goToStep, enqueueSnackbar, navigate]);

  // Handlers
  const handleSave = useCallback(async () => {
    try {
      console.log('💾 [WIZARD_V3] Saving with new API');
      
      const success = await saveDraft();
      if (success) {
        enqueueSnackbar('Draft saved successfully', { variant: 'success' });
      } else {
        enqueueSnackbar('Error during save', { variant: 'error' });
      }
    } catch (error) {
      console.error('❌ [WIZARD_V3] Error during save:', error);
      enqueueSnackbar('Error during save', { variant: 'error' });
    }
  }, [saveDraft, enqueueSnackbar]);

  const handleDebug = useCallback(() => {
    console.log('=== DEBUG DRAFT QUOTE V3 ===');
    console.log('📋 DraftQuote:', wizardState.draftQuote);
    console.log('📍 Active Step:', wizardState.activeStep);
    console.log('💾 Has Unsaved Changes:', wizardState.isDirty);
    console.log('⏰ Last Saved At:', wizardState.lastSavedAt);
    console.log('❌ Save Error:', wizardState.saveError);
    console.log('📦 Options:', savedOptions);
    console.log('🎯 Current Option Index:', currentOptionIndex);
    
    // Show payload for creation
    console.log('🆕 CREATE API Format (POST):', mapDraftQuoteToApi(wizardState.draftQuote));
    
    // Show payload for update
    if (wizardState.draftQuote?.draftQuoteId) {
      console.log('🔄 UPDATE API Format (PUT):', mapDraftQuoteToUpdateApi(wizardState.draftQuote, savedOptions));
      console.log('🔄 PUT API URL:', `/api/draft-quotes/${wizardState.draftQuote.draftQuoteId}`);
    } else {
      console.log('ℹ️ No draftQuoteId - no PUT payload available');
    }
    
    console.log('========================');
    
    setShowDebugModal(true);
    enqueueSnackbar('Debug modal opened with API payloads', { variant: 'info' });
  }, [wizardState, savedOptions, currentOptionIndex, enqueueSnackbar]);

  const handleNext = useCallback(() => {
    if (canGoToNext()) {
      goToStep(wizardState.activeStep + 1);
    } else {
      enqueueSnackbar('Please complete required fields', { variant: 'warning' });
    }
  }, [canGoToNext, goToStep, wizardState.activeStep, enqueueSnackbar]);

  const handleBack = useCallback(() => {
    if (wizardState.isDirty) {
      // TODO: Show unsaved changes dialog
      console.log('⚠️ Unsaved changes detected');
    }
    goToStep(wizardState.activeStep - 1);
  }, [wizardState.isDirty, goToStep, wizardState.activeStep]);

  const handleReset = useCallback(() => {
    resetDraft();
  }, [resetDraft]);

  // Step update handlers
  const updateStep1 = useCallback((data: any) => {
    updateDraftQuote({
      customer: { ...wizardState.draftQuote?.customer, ...data.customer },
      shipment: { ...wizardState.draftQuote?.shipment, ...data.shipment },
    });
  }, [updateDraftQuote, wizardState.draftQuote]);

  const updateStep2 = useCallback((data: any) => {
    console.log('🔄 [WIZARD_V3] updateStep2 called with:', data);
    updateDraftQuote({
      wizard: { ...wizardState.draftQuote?.wizard, ...data }
    });
  }, [updateDraftQuote, wizardState.draftQuote]);

  const updateStep3 = useCallback((data: any) => {
    updateDraftQuote({
      step3: { ...(wizardState.draftQuote as any)?.step3, ...data }
    } as any);
  }, [updateDraftQuote, wizardState.draftQuote]);

  const updateStep4 = useCallback((data: any) => {
    updateDraftQuote({
      step4: { ...(wizardState.draftQuote as any)?.step4, ...data }
    } as any);
  }, [updateDraftQuote, wizardState.draftQuote]);

  const updateStep5 = useCallback((data: any) => {
    updateDraftQuote({
      step5: { ...(wizardState.draftQuote as any)?.step5, ...data }
    } as any);
  }, [updateDraftQuote, wizardState.draftQuote]);

  const updateStep6 = useCallback((data: any) => {
    console.log('🔧 [WIZARD_V3] updateStep6 called with:', data);
    updateDraftQuote({
      step6: data
    } as any);
  }, [updateDraftQuote]);

  // Render step content
  const renderStepContent = (step: number) => {
    if (!wizardState.draftQuote) return null;

    switch (step) {
      case 0:
        return (
          <Step1RequestForm
            customer={wizardState.draftQuote.customer}
            setCustomer={(customer) => updateStep1({ customer })}
            customers={[]} // TODO: Load from API
            cityFrom={{
              name: wizardState.draftQuote.shipment?.origin?.location || '',
              country: wizardState.draftQuote.shipment?.origin?.country || ''
            }}
            setCityFrom={(cityFrom) => updateStep1({ 
              shipment: { 
                origin: { 
                  location: cityFrom.name || cityFrom.location || '', 
                  country: cityFrom.country || '' 
                } 
              } 
            })}
            cityTo={{
              name: wizardState.draftQuote.shipment?.destination?.location || '',
              country: wizardState.draftQuote.shipment?.destination?.country || ''
            }}
            setCityTo={(cityTo) => updateStep1({ 
              shipment: { 
                destination: { 
                  location: cityTo.name || cityTo.location || '', 
                  country: cityTo.country || '' 
                } 
              } 
            })}
            status={StatusRequest.NEW}
            setStatus={(status: StatusRequest) => updateStep1({ status })}
            assignee={wizardState.draftQuote.customer?.contactPerson?.fullName || ''}
            setAssignee={(assignee: string | number) => updateStep1({ 
              customer: { contactPerson: { fullName: assignee?.toString() } }
            })}
            members={[]} // TODO: Load from API
            comment={wizardState.draftQuote.wizard?.notes || ''}
            setComment={(comment) => updateStep1({ 
              wizard: { notes: comment } 
            })}
            products={[]} // TODO: Load from API
            productName={wizardState.draftQuote.shipment?.commodity}
            setProductName={(productName) => updateStep1({ 
              shipment: { commodity: productName } 
            })}
            incoterms={incotermValues}
            incotermName={wizardState.draftQuote.incoterm || ''}
            setIncotermName={(incotermName) => updateDraftQuote({ incoterm: incotermName })}
            errors={{}}
            isLoading={false}
            isLoadingCustomers={false}
            onSaved={() => {}}
            selectedHaulage={wizardState.draftQuote.wizard?.haulages || []}
            selectedSeafreight={wizardState.draftQuote.wizard?.seafreights || []}
            selectedMiscellaneous={wizardState.draftQuote.wizard?.services || []}
            services={[]} // TODO: Load from API
            contacts={[]} // TODO: Load from API
            setSelectedMiscellaneous={(miscellaneous) => updateDraftQuote({ 
              wizard: { services: miscellaneous } 
            })}
            locked={false}
            selectedContainers={(wizardState.draftQuote as any)?.step3?.containers || []}
            onContainerChange={(_serviceId, container) => updateDraftQuote({ 
              shipment: { containerTypes: container } 
            })}
            draftQuote={wizardState.draftQuote}
            setDraftQuote={updateDraftQuote}
            onSaveDraft={handleSave}
          />
        );

      case 1:
        return (
          <Step2Step3Merged
            requestData={wizardState.draftQuote}
            onStepUpdate={(data) => {
              console.log('🔄 [WIZARD_V3] onStepUpdate Step2+3 called with:', data);
              updateStep2(data);
              updateStep3(data);
            }}
            onBack={() => goToStep(wizardState.activeStep - 1)}
            onNext={() => goToStep(wizardState.activeStep + 1)}
          />
        );

      case 2:
        return (
          <Step5SeafreightSelection
            cityFrom={wizardState.draftQuote.shipment?.origin}
            portFrom={wizardState.draftQuote.shipment?.origin}
            onBack={() => goToStep(wizardState.activeStep - 1)}
            onNext={() => goToStep(wizardState.activeStep + 1)}
            selectedHaulage={wizardState.draftQuote.wizard?.haulages as any}
            selectedMiscellaneous={wizardState.draftQuote.wizard?.services || []}
            services={[]} // TODO: Load from API
            contacts={[]} // TODO: Load from API
            requestData={wizardState.draftQuote as any}
            selectedServices={wizardState.draftQuote.wizard?.services || []}
            selectedContainers={(wizardState.draftQuote as any)?.step3?.containers || []}
            onRequestDataChange={(newData: any) => updateDraftQuote(newData)}
            totalTEU={wizardState.draftQuote.shipment?.containerCount || 0}
            draftQuote={wizardState.draftQuote as any}
            onStep5Update={(step5Data: any) => updateStep5(step5Data)}
          />
        );

      case 3:
        return (
          <Step4HaulierSelection
            onBack={() => goToStep(wizardState.activeStep - 1)}
            onNext={() => goToStep(wizardState.activeStep + 1)}
            selectedSeafreight={(wizardState.draftQuote as any)?.step5?.selections?.[0] || null}
            selectedMiscellaneous={wizardState.draftQuote.wizard?.services || []}
            services={[]} // TODO: Load from API
            contacts={[]} // TODO: Load from API
            onRemoveMisc={(miscId) => {
              updateDraftQuote({
                wizard: { 
                  services: wizardState.draftQuote.wizard?.services?.filter(m => m.code !== miscId) || []
                }
              });
            }}
            requestData={wizardState.draftQuote as any}
            selectedServices={wizardState.draftQuote.wizard?.services || []}
            selectedContainers={(wizardState.draftQuote as any)?.step3?.containers || []}
            draftQuote={wizardState.draftQuote as any}
            onStep4Update={(step4Data: any) => updateStep4(step4Data)}
          />
        );

      case 4:
        return (
          <Step6MiscellaneousSelection
            cityFrom={wizardState.draftQuote.shipment?.origin}
            portFrom={wizardState.draftQuote.shipment?.origin}
            onBack={() => goToStep(wizardState.activeStep - 1)}
            onNext={() => goToStep(wizardState.activeStep + 1)}
            onStep6Update={(step6Data: any) => updateStep6(step6Data)}
            selectedHaulage={wizardState.draftQuote.wizard?.haulages as any}
            selectedSeafreight={wizardState.draftQuote.wizard?.seafreights as any}
            draftQuote={wizardState.draftQuote as any}
            services={[]} // TODO: Load from API
            contacts={[]} // TODO: Load from API
            selectedMiscellaneous={wizardState.draftQuote.wizard?.services || []}
            setSelectedMiscellaneous={(miscellaneous) => updateDraftQuote({ 
              wizard: { services: miscellaneous } 
            })}
            requestData={wizardState.draftQuote as any}
            selectedServices={wizardState.draftQuote.wizard?.services || []}
            selectedContainers={(wizardState.draftQuote as any)?.step3?.containers || []}
          />
        );

      case 5:
        return (
          <Step7Recap
            draftQuote={wizardState.draftQuote}
            onDownloadPdf={() => {
              // TODO: Implement PDF download
            }}
            quoteId={wizardState.draftQuote.draftQuoteId || ''}
            optionIndex={currentOptionIndex || 0}
            existingOptions={savedOptions}
            onOptionCreated={async (_optionData: any) => {
              const newOption = await createNewOption();
              if (newOption) {
                enqueueSnackbar('Option created successfully', { variant: 'success' });
              }
            }}
            draftId={wizardState.draftQuote.draftQuoteId || ''}
            onDraftSaved={(savedDraft: any) => updateDraftQuote(savedDraft)}
          />
        );

      default:
        return null;
    }
  };

  // Loading display
  if (wizardState.isSaving) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          {wizardState.isSaving ? 'Saving...' : 'Loading...'}
        </Typography>
      </Box>
    );
  }

  // No draft display
  if (!wizardState.draftQuote) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">
          Unable to load draft. Please try again.
        </Alert>
        <Button 
          variant="contained" 
          onClick={handleReset}
          sx={{ mt: 2 }}
        >
          Create new draft
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Sync Status */}
      <WizardSyncStatusV3
        isDirty={wizardState.isDirty}
        isSaving={wizardState.isSaving}
        lastSavedAt={wizardState.lastSavedAt}
        saveError={wizardState.saveError}
        draftId={wizardState.draftQuote.draftQuoteId}
        onManualSave={handleSave}
        onRefresh={refreshOptions}
      />

      {/* Navigation Buttons - Top */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        mb: 3,
        p: 2,
        bgcolor: 'grey.50',
        borderRadius: 2,
        border: 1,
        borderColor: 'grey.200'
      }}>
        <Button 
          onClick={handleBack} 
          disabled={wizardState.activeStep === 0 || wizardState.isSaving}
          variant="outlined"
          size="large"
        >
          ← Previous
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<BugReport />}
            onClick={handleDebug}
            size="small"
            sx={{ 
              borderColor: 'warning.main', 
              color: 'warning.main',
              '&:hover': {
                borderColor: 'warning.dark',
                backgroundColor: 'warning.light',
                color: 'warning.dark'
              }
            }}
          >
            Debug
          </Button>
          
          <Button
            variant="outlined"
            onClick={handleReset}
            disabled={wizardState.isSaving}
            size="small"
          >
            Reset
          </Button>
          
          {wizardState.activeStep < 5 && (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={wizardState.isSaving}
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                }
              }}
            >
              Next →
            </Button>
          )}
        </Box>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={wizardState.activeStep} sx={{ mb: 4 }}>
        <Step><StepLabel>1. Information</StepLabel></Step>
        <Step><StepLabel>2. Services & Containers</StepLabel></Step>
        <Step><StepLabel>3. Seafreight</StepLabel></Step>
        <Step><StepLabel>4. Haulage</StepLabel></Step>
        <Step><StepLabel>5. Miscellaneous</StepLabel></Step>
        <Step><StepLabel>6. Summary</StepLabel></Step>
      </Stepper>

      {/* Step Content */}
      {renderStepContent(wizardState.activeStep)}

      {/* Navigation Buttons - Bottom */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        mt: 4,
        p: 2,
        bgcolor: 'grey.50',
        borderRadius: 2,
        border: 1,
        borderColor: 'grey.200'
      }}>
        <Button 
          onClick={handleBack} 
          disabled={wizardState.activeStep === 0 || wizardState.isSaving}
          variant="outlined"
          size="large"
        >
          ← Previous
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {wizardState.activeStep < 5 && (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={wizardState.isSaving}
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                }
              }}
            >
              Next →
            </Button>
          )}
        </Box>
      </Box>

      {/* Debug Modal */}
      <Dialog 
        open={showDebugModal} 
        onClose={() => setShowDebugModal(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Code />
            <Typography variant="h6">
              Debug API Payloads - DraftQuote V3
            </Typography>
          </Box>
          <IconButton 
            onClick={() => setShowDebugModal(false)}
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* General Information */}
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'grey.200' }}>
              <Typography variant="h6" gutterBottom>📊 Draft Information</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Draft ID:</strong> {wizardState.draftQuote?.draftQuoteId || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Active Step:</strong> {wizardState.activeStep + 1}/6
                </Typography>
                <Typography variant="body2">
                  <strong>Unsaved Changes:</strong> {wizardState.isDirty ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2">
                  <strong>Saved Options:</strong> {savedOptions.length}
                </Typography>
                <Typography variant="body2">
                  <strong>Last Saved:</strong> {wizardState.lastSavedAt?.toLocaleString() || 'Never'}
                </Typography>
                <Typography variant="body2">
                  <strong>Save Error:</strong> {wizardState.saveError || 'None'}
                </Typography>
              </Box>
            </Box>

            {/* Payload Content */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {/* POST Payload */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'success.main' }}>
                  🆕 POST /api/draft-quotes (Create)
                </Typography>
                <Box sx={{ 
                  bgcolor: 'grey.100', 
                  p: 2, 
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'grey.300',
                  overflow: 'auto',
                  maxHeight: '300px'
                }}>
                  <pre style={{ 
                    margin: 0, 
                    fontSize: '12px', 
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {safeJsonStringify(mapDraftQuoteToApi(wizardState.draftQuote))}
                  </pre>
                </Box>
              </Box>

              {/* PUT Payload */}
              {wizardState.draftQuote?.draftQuoteId ? (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'info.main' }}>
                    🔄 PUT /api/draft-quotes/{wizardState.draftQuote.draftQuoteId} (Update)
                  </Typography>
                  <Box sx={{ 
                    bgcolor: 'grey.100', 
                    p: 2, 
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'grey.300',
                    overflow: 'auto',
                    maxHeight: '300px'
                  }}>
                  <pre style={{ 
                    margin: 0, 
                    fontSize: '12px', 
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {safeJsonStringify(mapDraftQuoteToUpdateApi(wizardState.draftQuote, savedOptions))}
                  </pre>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'warning.main' }}>
                    ⚠️ PUT /api/draft-quotes/{wizardState.draftQuote?.draftQuoteId || 'N/A'} (Update)
                  </Typography>
                  <Alert severity="warning">
                    No DraftQuote ID available - The draft must first be created (POST) before it can be updated (PUT)
                  </Alert>
                </Box>
              )}

              {/* Saved Options */}
              {savedOptions.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'secondary.main' }}>
                    📦 Saved Options ({savedOptions.length})
                  </Typography>
                  <Box sx={{ 
                    bgcolor: 'grey.100', 
                    p: 2, 
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'grey.300',
                    overflow: 'auto',
                    maxHeight: '200px'
                  }}>
                  <pre style={{ 
                    margin: 0, 
                    fontSize: '12px', 
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {safeJsonStringify(savedOptions)}
                  </pre>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Button 
            onClick={() => setShowDebugModal(false)}
            variant="outlined"
          >
            Close
          </Button>
          <Button 
            onClick={() => {
              try {
                if (wizardState.draftQuote?.draftQuoteId) {
                  const payload = safeJsonStringify(mapDraftQuoteToUpdateApi(wizardState.draftQuote, savedOptions));
                  navigator.clipboard.writeText(payload);
                  enqueueSnackbar('PUT payload copied to clipboard', { variant: 'success' });
                } else {
                  const payload = safeJsonStringify(mapDraftQuoteToApi(wizardState.draftQuote));
                  navigator.clipboard.writeText(payload);
                  enqueueSnackbar('POST payload copied to clipboard', { variant: 'success' });
                }
              } catch (error) {
                console.error('Copy error:', error);
                enqueueSnackbar('Error copying payload', { variant: 'error' });
              }
            }}
            variant="contained"
            startIcon={<Code />}
          >
            Copy Payload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
