import { useEffect, useState, useCallback, useMemo } from "react";
import { 
  Stepper, Step, StepLabel, Box, Button, 
  Dialog, DialogTitle, DialogContent, DialogActions, Typography,
  Alert, CircularProgress
} from "@mui/material";
import { Save, Warning, BugReport } from "@mui/icons-material";

// ✅ HOOKS REFACTORISÉS
import {
  useWizardStateManager,
  useWizardOptionsManager
} from '../hooks';

// ✅ UTILS
import { createInitialDraftQuote, validateNavigationData, createDraftQuoteFromRequest } from '../utils';
import { incotermValues, containerPackages } from '@utils/constants';

// ✅ STEP COMPONENTS
import Step1RequestForm from '../components/Step1RequestForm';
import Step2SelectServices from '../components/Step2SelectServices';
import Step3RequestForm from '../components/Step3RequestForm';
import Step4HaulierSelection from '../components/Step4HaulierSelection';
import Step5SeafreightSelection from '../components/Step5SeafreightSelection';
import Step6MiscellaneousSelection from '../components/Step6MiscellaneousSelection';
import Step7Recap from '../components/Step7Recap';

// ✅ TYPES
import { DraftQuote } from '../types/DraftQuote';
import { StatusRequest } from '../api/types.gen';

// ✅ EXTERNAL HOOKS
import { useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useAccount, useMsal } from '@azure/msal-react';

export default function RequestWizard() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [urlSearchParams] = useSearchParams();
  
  // ✅ RÉCUPÉRATION DE L'UTILISATEUR CONNECTÉ
  const { accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  
  // ✅ RÉCUPÉRATION DES PARAMÈTRES
  const draftId = params.id || urlSearchParams.get('draftId') || urlSearchParams.get('loadDraft');
  const quoteId = urlSearchParams.get('quoteId'); // Pour ajouter une option à un devis existant
  const stepParam = urlSearchParams.get('step'); // Pour reprendre à une étape spécifique
  
  // ✅ LOG DU DRAFTID RÉCUPÉRÉ
  console.log('🎯 [WIZARD] draftId récupéré:', draftId, 'Type:', typeof draftId);
  
  console.log('🔧 [WIZARD] Paramètres reçus:', {
    params: params,
    draftId,
    quoteId,
    stepParam,
    urlSearchParams: Object.fromEntries(urlSearchParams.entries()),
    location: location.pathname,
    search: location.search
  });
  
  // ✅ UTILISATEUR COURANT
  const currentUserEmail = account?.username || 'user@example.com';
  const clientNumber = 'CLIENT001'; // TODO: Récupérer depuis l'API si nécessaire
  
  // ✅ VALIDATION DES DONNÉES DE NAVIGATION
  const navigationValidation = validateNavigationData(location.state);
  
  // Log des données reçues (ciblé sur assignee et incoterm)
  if (location.state?.requestData) {
    console.log('📥 [WIZARD] Données reçues de Requests.tsx:', {
      requestId: location.state.requestData.requestQuoteId,
      assignee: location.state.requestData.assigneeDisplayName,
      incoterm: location.state.requestData.incoterm,
      source: location.state.source
    });
  }
  
  // ✅ CRÉATION DU BROUILLON INITIAL AVEC LES DONNÉES DE NAVIGATION
  const initialDraftQuote = useMemo(() => {
    if (navigationValidation.isValid && navigationValidation.requestData) {
      console.log('[RequestWizard] Initialisation depuis requête existante:', navigationValidation.requestQuoteId);
      // ✅ Créer un brouillon depuis une requête existante
      return createDraftQuoteFromRequest(
        navigationValidation.requestData, 
        currentUserEmail
      );
    }
    
    console.log('[RequestWizard] Création d\'un nouveau brouillon');
    // ✅ Créer un nouveau brouillon
    return createInitialDraftQuote(currentUserEmail);
  }, [location.state, currentUserEmail, navigationValidation]);
  
  // ✅ ÉTAT DU WIZARD AVEC PERSISTANCE AUTOMATIQUE
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
  } = useWizardStateManager(
    initialDraftQuote,
    currentUserEmail,
    clientNumber,
    draftId
  );

  // ✅ LOG DE L'ÉTAT INITIAL
  useEffect(() => {
    console.log('🏁 [WIZARD] État initial du wizard:', {
      draftId,
      initialDraftQuote,
      wizardState,
      hasDraftQuote: !!wizardState.draftQuote
    });
  }, [draftId, initialDraftQuote, wizardState]);

  // ✅ LOG DU DRAFTID PASSÉ AU HOOK
  console.log('🔧 [WIZARD] draftId passé à useWizardStateManager:', draftId, 'Type:', typeof draftId);

  // ✅ GESTION DES OPTIONS
  const {
    options: savedOptions,
    currentOptionIndex,
    isLoadingOptions,
    createNewOption,
    loadOption,
    saveOption,
    deleteOption,
    duplicateOption,
    selectOption,
    compareOptions
  } = useWizardOptionsManager(
    wizardState.draftQuote,
    draftId,
    (option) => {
      // Callback appelé quand une option change
      console.log('Option sélectionnée:', option);
    }
  );

  // ✅ CHARGEMENT D'UN BROUILLON EXISTANT
  useEffect(() => {
    console.log('🔍 [WIZARD] useEffect déclenché avec:', { draftId, stepParam });
    
    if (draftId && draftId !== 'new') {
      console.log('🔄 [WIZARD] Chargement du brouillon existant:', draftId);
      
      const loadExistingDraft = async () => {
        try {
          console.log('📞 [WIZARD] Appel de loadDraft avec:', draftId);
          const success = await loadDraft(draftId);
          console.log('📞 [WIZARD] Résultat de loadDraft:', success);
          
          if (success) {
            console.log('✅ [WIZARD] Brouillon chargé avec succès');
            console.log('🔍 [WIZARD] État du wizard après chargement:', wizardState);
            
            // Reprendre à l'étape spécifique si fournie
            if (stepParam) {
              const targetStep = parseInt(stepParam);
              if (!isNaN(targetStep) && targetStep >= 0 && targetStep <= 6) {
                console.log('🎯 [WIZARD] Reprise à l\'étape:', targetStep);
                goToStep(targetStep);
              }
            }
          } else {
            console.error('❌ [WIZARD] Échec du chargement du brouillon');
            enqueueSnackbar('Erreur lors du chargement du brouillon', { variant: 'error' });
          }
        } catch (error) {
          console.error('❌ [WIZARD] Erreur lors du chargement:', error);
          enqueueSnackbar('Erreur lors du chargement du brouillon', { variant: 'error' });
        }
      };
      
      loadExistingDraft();
    } else {
      console.log('ℹ️ [WIZARD] Pas de chargement nécessaire - draftId:', draftId);
    }
  }, [draftId, stepParam, loadDraft, goToStep, enqueueSnackbar]);

  // ✅ ÉTAT LOCAL - TEMPORAIREMENT DÉSACTIVÉ POUR LES TESTS
  // const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  // const [showResetDialog, setShowResetDialog] = useState(false);

  // ✅ HANDLERS
  // ⚠️ RESTRICTIONS TEMPORAIREMENT DÉSACTIVÉES POUR LES TESTS
  const handleSave = useCallback(async () => {
    const success = await saveDraft();
    if (success) {
      enqueueSnackbar('Brouillon sauvegardé avec succès', { variant: 'success' });
    }
  }, [saveDraft, enqueueSnackbar]);

  const handleDebug = useCallback(() => {
    console.log('=== DEBUG DRAFT QUOTE ===');
    console.log('Draft Quote:', wizardState.draftQuote);
    console.log('Active Step:', wizardState.activeStep);
    console.log('Has Unsaved Changes:', wizardState.isDirty);
    console.log('Last Saved At:', wizardState.lastSavedAt);
    console.log('Save Error:', wizardState.saveError);
    console.log('Options:', savedOptions);
    console.log('Current Option Index:', currentOptionIndex);
    console.log('========================');
    enqueueSnackbar('Contenu du brouillon affiché en console', { variant: 'info' });
  }, [wizardState, savedOptions, currentOptionIndex, enqueueSnackbar]);

  const handleNext = useCallback(() => {
    // ✅ TEMPORAIREMENT DÉSACTIVÉ POUR LES TESTS
    goToStep(wizardState.activeStep + 1);
  }, [goToStep, wizardState.activeStep]);

  const handleBack = useCallback(() => {
    // ✅ TEMPORAIREMENT DÉSACTIVÉ POUR LES TESTS
    goToStep(wizardState.activeStep - 1);
  }, [goToStep, wizardState.activeStep]);

  const handleReset = useCallback(() => {
    // ✅ TEMPORAIREMENT DÉSACTIVÉ POUR LES TESTS
    resetDraft();
  }, [resetDraft]);

  const handleConfirmReset = useCallback(() => {
    resetDraft();
    // setShowResetDialog(false); // TEMPORAIREMENT DÉSACTIVÉ
    goToStep(0);
    enqueueSnackbar('Wizard réinitialisé', { variant: 'info' });
  }, [resetDraft, goToStep, enqueueSnackbar]);

  // ✅ MISE À JOUR DES ÉTAPES
  const updateStepData = useCallback((stepNumber: number, data: any) => {
    updateStep(stepNumber, data);
  }, [updateStep]);

  const updateStep1 = useCallback((data: Partial<DraftQuote['step1']>) => {
    updateStep(1, data);
  }, [updateStep]);

  const updateStep2 = useCallback((data: Partial<DraftQuote['step2']>) => {
    console.log('🔄 [WIZARD] updateStep2 appelé avec:', data);
    console.log('🔄 [WIZARD] Données avant mise à jour:', {
      step2: wizardState.draftQuote.step2,
      selectedServices: wizardState.draftQuote.step2?.selectedServices?.length || 0,
      selected: wizardState.draftQuote.step2?.selected?.length || 0
    });
    updateStep(2, data);
  }, [updateStep, wizardState.draftQuote.step2]);

  const updateStep3 = useCallback((data: Partial<DraftQuote['step3']>) => {
    updateStep(3, data);
  }, [updateStep]);

  const updateStep4 = useCallback((data: Partial<DraftQuote['step4']>) => {
    updateStep(4, data);
  }, [updateStep]);

  const updateStep5 = useCallback((data: Partial<DraftQuote['step5']>) => {
    updateStep(5, data);
  }, [updateStep]);

  const updateStep6 = useCallback((data: Partial<DraftQuote['step6']>) => {
    updateStep(6, data);
  }, [updateStep]);

  const updateStep7 = useCallback((data: Partial<DraftQuote['step7']>) => {
    updateStep(7, data);
  }, [updateStep]);

  // ✅ RENDERING DES ÉTAPES
  const renderStepContent = (step: number) => {
    if (!wizardState.draftQuote) return null;

    switch (step) {
      case 0:
        return (
          <Step1RequestForm
            customer={wizardState.draftQuote.step1?.customer}
            setCustomer={(customer) => updateStep1({ customer })}
            customers={[]} // TODO: Load from API
            cityFrom={wizardState.draftQuote.step1?.cityFrom}
            setCityFrom={(cityFrom) => updateStep1({ cityFrom })}
            cityTo={wizardState.draftQuote.step1?.cityTo}
            setCityTo={(cityTo) => updateStep1({ cityTo })}
            status={(wizardState.draftQuote.step1?.status as StatusRequest) || StatusRequest.NEW}
            setStatus={(status: StatusRequest) => updateStep1({ status })}
            assignee={wizardState.draftQuote.step1?.assignee || ''}
            setAssignee={(assignee: string | number) => updateStep1({ assignee: assignee?.toString() })}
            members={[]} // TODO: Load from API
            comment={wizardState.draftQuote.step1?.comment || ''}
            setComment={(comment) => updateStep1({ comment })}
            products={[]} // TODO: Load from API
            productName={wizardState.draftQuote.step1?.productName}
            setProductName={(productName) => updateStep1({ productName })}
            incoterms={incotermValues}
            incotermName={wizardState.draftQuote.step1?.incotermName || ''}
            setIncotermName={(incotermName) => updateStep1({ incotermName })}
            errors={{}}
            isLoading={false}
            isLoadingCustomers={false}
            onSaved={() => {}}
            selectedHaulage={wizardState.draftQuote.selectedHaulage ? [wizardState.draftQuote.selectedHaulage] : []}
            selectedSeafreight={wizardState.draftQuote.selectedSeafreights || []}
            selectedMiscellaneous={wizardState.draftQuote.selectedMiscellaneous || []}
            services={[]} // TODO: Load from API
            contacts={[]} // TODO: Load from API
            setSelectedMiscellaneous={(miscellaneous) => updateDraftQuote({ selectedMiscellaneous: miscellaneous })}
            locked={false}
            selectedContainers={wizardState.draftQuote.selectedContainers || {}}
            onContainerChange={(serviceId, container) => updateDraftQuote({ 
              selectedContainers: { ...wizardState.draftQuote.selectedContainers, [serviceId]: container } 
            })}
            draftQuote={wizardState.draftQuote}
            setDraftQuote={updateDraftQuote}
            onSaveDraft={handleSave}
          />
        );

      case 1:
        console.log('🔧 [WIZARD] Rendu Step2SelectServices avec les données:', {
          cityFrom: wizardState.draftQuote.step1?.cityFrom,
          cityTo: wizardState.draftQuote.step1?.cityTo,
          productName: wizardState.draftQuote.step1?.productName,
          incotermName: wizardState.draftQuote.step1?.incotermName,
          step1: wizardState.draftQuote.step1
        });
        
        return (
          <Step2SelectServices
            requestData={wizardState.draftQuote}
            selected={wizardState.draftQuote.step2?.selectedServices || wizardState.draftQuote.step2?.selected || []}
            onChange={(selected) => {
              console.log('🔄 [WIZARD] onChange Step2 appelé avec:', selected.length, 'services');
              console.log('🔄 [WIZARD] Détail des services:', selected.map(s => s.serviceName));
              updateStep2({ selectedServices: selected });
            }}
            onBack={() => goToStep(wizardState.activeStep - 1)}
            onNext={() => goToStep(wizardState.activeStep + 1)}
            selectedHaulage={wizardState.draftQuote.selectedHaulage}
            selectedSeafreight={wizardState.draftQuote.selectedSeafreights}
            selectedMiscellaneous={wizardState.draftQuote.selectedMiscellaneous || []}
            setSelectedMiscellaneous={(miscellaneous) => updateDraftQuote({ selectedMiscellaneous: miscellaneous })}
            contacts={[]} // TODO: Load from API
            cityFrom={wizardState.draftQuote.step1?.cityFrom}
            cityTo={wizardState.draftQuote.step1?.cityTo}
            productName={wizardState.draftQuote.step1?.productName}
            incotermName={wizardState.draftQuote.step1?.incotermName || ''}
            onServicesLoaded={(services) => {
              // TODO: Handle services loaded
            }}
          />
        );

      case 2:
        return (
          <Step3RequestForm
            requestData={wizardState.draftQuote}
            selectedServices={wizardState.draftQuote.step2?.selectedServices || wizardState.draftQuote.step2?.selected || []}
            selectedContainers={wizardState.draftQuote.selectedContainers || {}}
            onContainerChange={(serviceId, container, totalTEU) => {
              console.log('🔄 [WIZARD] onContainerChange appelé avec:', { serviceId, container, totalTEU });
              updateStep3({ 
                containers: container,
                summary: {
                  totalContainers: container.length,
                  totalTEU: totalTEU || 0,
                  containerTypes: [...new Set(container.map((c: any) => c.containerType || c.type))] as string[]
                }
              });
            }}
            containerPackages={containerPackages}
            onBack={() => goToStep(wizardState.activeStep - 1)}
            onNext={() => goToStep(wizardState.activeStep + 1)}
            onServicesChange={(services) => {
              // TODO: Handle services change
            }}
            onRequestDataChange={(newData) => updateDraftQuote(newData)}
            selectedHaulage={wizardState.draftQuote.selectedHaulage}
            selectedSeafreight={wizardState.draftQuote.selectedSeafreights}
            selectedMiscellaneous={wizardState.draftQuote.selectedMiscellaneous || []}
            services={[]} // TODO: Load from API
            contacts={[]} // TODO: Load from API
          />
        );

      case 3:
        return (
          <Step5SeafreightSelection
            cityFrom={wizardState.draftQuote.step1?.cityFrom}
            portFrom={wizardState.draftQuote.step1?.portFrom}
            onBack={() => goToStep(wizardState.activeStep - 1)}
            onNext={() => goToStep(wizardState.activeStep + 1)}
            selectedHaulage={wizardState.draftQuote.selectedHaulage}
            selectedMiscellaneous={wizardState.draftQuote.selectedMiscellaneous || []}
            services={[]} // TODO: Load from API
            contacts={[]} // TODO: Load from API
            requestData={wizardState.draftQuote}
            selectedServices={wizardState.draftQuote.step2?.selectedServices || wizardState.draftQuote.step2?.selected || []}
            selectedContainers={wizardState.draftQuote.selectedContainers || {}}
            onRequestDataChange={(newData) => updateDraftQuote(newData)}
            totalTEU={wizardState.draftQuote.totalTEU || 0}
            draftQuote={wizardState.draftQuote}
            onStep5Update={(step5Data) => updateStep5(step5Data)}
          />
        );

      case 4:
        return (
          <Step4HaulierSelection
            cityFrom={wizardState.draftQuote.step1?.cityFrom}
            portFrom={wizardState.draftQuote.step1?.portFrom}
            onBack={() => goToStep(wizardState.activeStep - 1)}
            onNext={() => goToStep(wizardState.activeStep + 1)}
            draftId={wizardState.draftQuote.id}
            onDraftSaved={(savedDraft) => updateDraftQuote(savedDraft)}
            requestQuoteId={wizardState.draftQuote.requestQuoteId}
            emailUser={wizardState.draftQuote.emailUser}
            clientNumber={wizardState.draftQuote.clientNumber}
            selectedSeafreight={wizardState.draftQuote.selectedSeafreights}
            selectedMiscellaneous={wizardState.draftQuote.selectedMiscellaneous || []}
            services={[]} // TODO: Load from API
            contacts={[]} // TODO: Load from API
            onRemoveMisc={(miscId) => {
              updateDraftQuote({
                selectedMiscellaneous: wizardState.draftQuote.selectedMiscellaneous?.filter(m => m.id !== miscId) || []
              });
            }}
            requestData={wizardState.draftQuote}
            selectedServices={wizardState.draftQuote.step2?.selectedServices || wizardState.draftQuote.step2?.selected || []}
            selectedContainers={wizardState.draftQuote.selectedContainers || {}}
            draftQuote={wizardState.draftQuote}
            onStep4Update={(step4Data) => updateStep4(step4Data)}
          />
        );

      case 5:
        return (
          <Step6MiscellaneousSelection
            cityFrom={wizardState.draftQuote.step1?.cityFrom}
            portFrom={wizardState.draftQuote.step1?.portFrom}
            onBack={() => goToStep(wizardState.activeStep - 1)}
            onNext={() => goToStep(wizardState.activeStep + 1)}
            onStep6Update={(step6Data) => updateStep6(step6Data)}
            selectedHaulage={wizardState.draftQuote.selectedHaulage}
            selectedSeafreight={wizardState.draftQuote.selectedSeafreights}
            draftQuote={wizardState.draftQuote}
            services={[]} // TODO: Load from API
            contacts={[]} // TODO: Load from API
            selectedMiscellaneous={wizardState.draftQuote.selectedMiscellaneous || []}
            setSelectedMiscellaneous={(miscellaneous) => updateDraftQuote({ selectedMiscellaneous: miscellaneous })}
            requestData={wizardState.draftQuote}
            selectedServices={wizardState.draftQuote.step2?.selectedServices || wizardState.draftQuote.step2?.selected || []}
            selectedContainers={wizardState.draftQuote.selectedContainers || {}}
          />
        );

      case 6:
        return (
          <Step7Recap
            draftQuote={wizardState.draftQuote}
            onDownloadPdf={() => {
              // TODO: Implement PDF download
            }}
            quoteId={wizardState.draftQuote.id}
            optionIndex={currentOptionIndex || 0}
            existingOptions={savedOptions}
            onOptionCreated={(optionData) => {
              // TODO: Handle option created
            }}
            draftId={wizardState.draftQuote.id}
            onDraftSaved={(savedDraft) => updateDraftQuote(savedDraft)}
          />
        );

      default:
        return null;
    }
  };

  // ✅ AFFICHAGE DU CHARGEMENT
  if (wizardState.isSaving || isLoadingOptions) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          {wizardState.isSaving ? 'Sauvegarde en cours...' : 'Chargement des options...'}
        </Typography>
      </Box>
    );
  }

  // ✅ AFFICHAGE SI PAS DE BROUILLON
  if (!wizardState.draftQuote) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">
          Impossible de charger le brouillon. Veuillez réessayer.
        </Alert>
        <Button 
          variant="contained" 
          onClick={handleReset}
          sx={{ mt: 2 }}
        >
          Créer un nouveau brouillon
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* ✅ BARRE DE STATUT */}
      <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1, border: 1, borderColor: 'grey.200' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Brouillon {wizardState.draftQuote.id ? `#${wizardState.draftQuote.id}` : 'en cours de création'}
            </Typography>
            {wizardState.lastSavedAt && (
              <Typography variant="caption" color="text.secondary">
                Dernière sauvegarde: {wizardState.lastSavedAt.toLocaleString()}
              </Typography>
            )}
            {wizardState.saveError && (
              <Typography variant="caption" color="error">
                Erreur: {wizardState.saveError}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {wizardState.isDirty && !wizardState.isSaving && (
              <Alert severity="warning" icon={<Warning />} sx={{ py: 0 }}>
                Modifications non sauvegardées
              </Alert>
            )}
            
            {wizardState.isSaving && (
              <Alert severity="info" sx={{ py: 0, display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Sauvegarde en cours...
              </Alert>
            )}
            
            <Button
              variant="outlined"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={wizardState.isSaving}
              size="small"
            >
              {wizardState.isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
            
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
              Réinitialiser
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ✅ BOUTONS DE NAVIGATION - AU-DESSUS */}
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
          ← Précédent
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {wizardState.activeStep < 6 && (
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
              Suivant →
            </Button>
          )}
        </Box>
      </Box>

      {/* ✅ STEPPER */}
      <Stepper activeStep={wizardState.activeStep} sx={{ mb: 4 }}>
        <Step><StepLabel>Informations</StepLabel></Step>
        <Step><StepLabel>Services</StepLabel></Step>
        <Step><StepLabel>Conteneurs</StepLabel></Step>
        <Step><StepLabel>Seafreight</StepLabel></Step>
        <Step><StepLabel>Haulage</StepLabel></Step>
        <Step><StepLabel>Miscellaneous</StepLabel></Step>
        <Step><StepLabel>Récapitulatif</StepLabel></Step>
      </Stepper>

      {/* ✅ CONTENU DE L'ÉTAPE */}
      {renderStepContent(wizardState.activeStep)}

      {/* ✅ BOUTONS DE NAVIGATION - AU PIED */}
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
          ← Précédent
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {wizardState.activeStep < 6 && (
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
              Suivant →
            </Button>
          )}
        </Box>
      </Box>

      {/* ✅ DIALOGUES TEMPORAIREMENT DÉSACTIVÉS POUR LES TESTS */}
      {/* 
      <Dialog open={showUnsavedDialog} onClose={() => setShowUnsavedDialog(false)}>
        <DialogTitle>Modifications non sauvegardées</DialogTitle>
        <DialogContent>
          <Typography>
            Vous avez des modifications non sauvegardées. Voulez-vous continuer ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUnsavedDialog(false)}>Annuler</Button>
          <Button 
            onClick={() => {
              setShowUnsavedDialog(false);
              goToStep(wizardState.activeStep - 1);
            }}
            variant="contained"
          >
            Continuer sans sauvegarder
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showResetDialog} onClose={() => setShowResetDialog(false)}>
        <DialogTitle>Réinitialiser le wizard</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir réinitialiser le wizard ? Toutes les modifications seront perdues.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResetDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleConfirmReset}
            variant="contained"
            color="warning"
          >
            Réinitialiser
          </Button>
        </DialogActions>
      </Dialog>
      */}

      {/* ✅ PANEL DEBUG (développement uniquement) */}
      {process.env.NODE_ENV === 'development' && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="h6">Debug Info</Typography>
          <Typography variant="body2">
            Active Step: {wizardState.activeStep} | Draft ID: {wizardState.draftQuote?.id || 'N/A'} | Options: {savedOptions.length}
          </Typography>
          <Typography variant="body2">
            Loading: Draft={wizardState.isSaving.toString()}, Options={isLoadingOptions.toString()}
          </Typography>
          <Typography variant="body2">
            Unsaved Changes: {wizardState.isDirty.toString()}
          </Typography>
          <Typography variant="body2">
            Current Option: {currentOptionIndex !== null ? savedOptions[currentOptionIndex]?.name : 'Aucune'}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
