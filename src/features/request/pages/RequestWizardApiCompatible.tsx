/**
 * RequestWizard avec compatibilité API complète
 * Version refactorisée utilisant le nouveau mapper
 */

import { useEffect, useState, useCallback, useMemo } from "react";
import { 
  Stepper, Step, StepLabel, Box, Button, 
  Typography, Alert, CircularProgress
} from "@mui/material";
import { Save, Warning, BugReport } from "@mui/icons-material";

// ✅ NOUVELLE API COMPATIBLE
import { useDraftCRUDApiCompatible } from '../hooks/useDraftCRUDApiCompatible';
import { DraftQuoteApiUtils } from '../services/DraftQuoteApiMapper';

// ✅ UTILS
import { isBackendGeneratedId } from '../utils/draftIdValidation';
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
import { StatusRequest } from '../api/types.gen';
import { DraftQuote } from '../types/DraftQuote';

// ✅ EXTERNAL HOOKS
import { useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useAccount, useMsal } from '@azure/msal-react';

export default function RequestWizardApiCompatible() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [urlSearchParams] = useSearchParams();
  
  // ✅ RÉCUPÉRATION DE L'UTILISATEUR CONNECTÉ
  const { accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const currentUserEmail = account?.username || '';

  // ✅ NOUVELLE API COMPATIBLE
  const {
    createDraft,
    updateDraft,
    useDraft,
    createMinimalDraftQuote,
    isApiCompatible,
    validateForApi,
    isCreating,
    isUpdating,
    createError,
    updateError
  } = useDraftCRUDApiCompatible();

  // ✅ ÉTAT DU WIZARD
  const [currentStep, setCurrentStep] = useState(0);
  const [draftQuote, setDraftQuote] = useState<DraftQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // ✅ RÉCUPÉRATION DES PARAMÈTRES
  const requestQuoteId = params.requestQuoteId || urlSearchParams.get('requestId') || '';
  const draftId = params.draftId || urlSearchParams.get('draftId') || null;

  // ✅ QUERY POUR RÉCUPÉRER LE DRAFT EXISTANT
  const { data: existingDraft, isLoading: isLoadingDraft, error: draftError } = useDraft(draftId);

  // ✅ INITIALISATION
  useEffect(() => {
    const initializeWizard = async () => {
      setIsLoading(true);
      
      try {
        if (existingDraft) {
          // Charger un draft existant
          console.log('📥 [WIZARD_API] Chargement draft existant:', existingDraft);
          setDraftQuote(existingDraft);
          
          // Déterminer l'étape actuelle
          const step = calculateCurrentStep(existingDraft);
          setCurrentStep(step);
          
          enqueueSnackbar('Draft chargé avec succès', { variant: 'success' });
        } else if (requestQuoteId) {
          // Créer un nouveau draft à partir d'une requête
          console.log('🆕 [WIZARD_API] Création nouveau draft pour request:', requestQuoteId);
          
          const newDraft = createMinimalDraftQuote(requestQuoteId, currentUserEmail);
          setDraftQuote(newDraft);
          setCurrentStep(0);
          
          enqueueSnackbar('Nouveau draft créé', { variant: 'info' });
        } else {
          throw new Error('Aucun requestQuoteId ou draftId fourni');
        }
      } catch (error) {
        console.error('❌ [WIZARD_API] Erreur initialisation:', error);
        enqueueSnackbar('Erreur lors de l\'initialisation', { variant: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUserEmail) {
      initializeWizard();
    }
  }, [existingDraft, requestQuoteId, currentUserEmail, createMinimalDraftQuote, enqueueSnackbar]);

  // ✅ CALCUL DE L'ÉTAPE ACTUELLE
  const calculateCurrentStep = (draft: DraftQuote): number => {
    if (draft.step7?.finalization?.isReadyToGenerate) return 6;
    if (draft.step6?.selections?.length > 0) return 5;
    if (draft.step5?.selections?.length > 0) return 4;
    if (draft.step4?.selection) return 3;
    if (draft.step3?.containers?.length > 0) return 2;
    if (draft.step2?.selectedServices?.length > 0) return 1;
    return 0;
  };

  // ✅ SAUVEGARDE DU DRAFT
  const saveDraft = useCallback(async (updatedDraft: DraftQuote) => {
    if (!updatedDraft) return;

    setSaveStatus('saving');
    
    try {
      // Validation avant sauvegarde
      const errors = validateForApi(updatedDraft);
      if (errors.length > 0) {
        console.warn('⚠️ [WIZARD_API] Erreurs de validation:', errors);
        enqueueSnackbar(`Avertissements: ${errors.join(', ')}`, { variant: 'warning' });
      }

      // Vérifier la compatibilité
      if (!isApiCompatible(updatedDraft)) {
        throw new Error('DraftQuote non compatible avec l\'API');
      }

      let result;
      if (updatedDraft.id && isBackendGeneratedId(updatedDraft.id)) {
        // Mise à jour d'un draft existant
        console.log('🔄 [WIZARD_API] Mise à jour draft:', updatedDraft.id);
        result = await updateDraft({ draftId: updatedDraft.id, draftQuote: updatedDraft });
      } else {
        // Création d'un nouveau draft
        console.log('🆕 [WIZARD_API] Création draft');
        result = await createDraft(updatedDraft);
        
        // Mettre à jour l'ID du draft
        if (result?.draftQuoteId) {
          updatedDraft.id = result.draftQuoteId;
        }
      }

      setDraftQuote(updatedDraft);
      setSaveStatus('success');
      enqueueSnackbar('Draft sauvegardé avec succès', { variant: 'success' });
      
      return result;
    } catch (error) {
      console.error('❌ [WIZARD_API] Erreur sauvegarde:', error);
      setSaveStatus('error');
      enqueueSnackbar(`Erreur sauvegarde: ${error}`, { variant: 'error' });
      throw error;
    }
  }, [createDraft, updateDraft, validateForApi, isApiCompatible, enqueueSnackbar]);

  // ✅ MISE À JOUR D'UNE ÉTAPE
  const updateStep = useCallback((stepNumber: number, stepData: any) => {
    if (!draftQuote) return;

    const updatedDraft = { ...draftQuote };
    
    switch (stepNumber) {
      case 1:
        updatedDraft.step1 = { ...updatedDraft.step1, ...stepData };
        break;
      case 2:
        updatedDraft.step2 = { ...updatedDraft.step2, ...stepData };
        break;
      case 3:
        updatedDraft.step3 = { ...updatedDraft.step3, ...stepData };
        break;
      case 4:
        updatedDraft.step4 = { ...updatedDraft.step4, ...stepData };
        break;
      case 5:
        updatedDraft.step5 = { ...updatedDraft.step5, ...stepData };
        break;
      case 6:
        updatedDraft.step6 = { ...updatedDraft.step6, ...stepData };
        break;
      case 7:
        updatedDraft.step7 = { ...updatedDraft.step7, ...stepData };
        break;
    }

    setDraftQuote(updatedDraft);
    
    // Sauvegarde automatique
    saveDraft(updatedDraft).catch(console.error);
  }, [draftQuote, saveDraft]);

  // ✅ NAVIGATION
  const handleNext = useCallback(() => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // ✅ RENDU DES ÉTAPES
  const renderStepContent = (step: number) => {
    if (!draftQuote) return null;

    switch (step) {
      case 0:
        return (
          <Step1RequestForm
            requestData={draftQuote}
            onStepUpdate={(data) => updateStep(1, data)}
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <Step2SelectServices
            requestData={draftQuote}
            onStepUpdate={(data) => updateStep(2, data)}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <Step3RequestForm
            requestData={draftQuote}
            onStepUpdate={(data) => updateStep(3, data)}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case 3:
        return (
          <Step4HaulierSelection
            draftQuote={draftQuote}
            onStepUpdate={(data) => updateStep(4, data)}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case 4:
        return (
          <Step5SeafreightSelection
            draftQuote={draftQuote}
            onStepUpdate={(data) => updateStep(5, data)}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case 5:
        return (
          <Step6MiscellaneousSelection
            draftQuote={draftQuote}
            onStepUpdate={(data) => updateStep(6, data)}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case 6:
        return (
          <Step7Recap
            draftQuote={draftQuote}
            onBack={handleBack}
            onComplete={() => navigate('/requests')}
          />
        );
      default:
        return null;
    }
  };

  // ✅ ÉTAT DE CHARGEMENT
  if (isLoading || isLoadingDraft) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Chargement du wizard...
        </Typography>
      </Box>
    );
  }

  // ✅ ERREUR DE CHARGEMENT
  if (draftError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Erreur lors du chargement du draft: {draftError.message}
        </Alert>
        <Button onClick={() => navigate('/requests')} variant="contained">
          Retour aux demandes
        </Button>
      </Box>
    );
  }

  // ✅ DRAFT NON TROUVÉ
  if (!draftQuote) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Aucun draft trouvé. Vérifiez l'URL ou créez une nouvelle demande.
        </Alert>
        <Button onClick={() => navigate('/requests')} variant="contained">
          Retour aux demandes
        </Button>
      </Box>
    );
  }

  // ✅ RENDU PRINCIPAL
  return (
    <Box sx={{ p: 3 }}>
      {/* Header avec statut de sauvegarde */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Request Wizard (API Compatible)
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {saveStatus === 'saving' && <CircularProgress size={20} />}
          {saveStatus === 'success' && <Typography color="success.main">✓ Sauvegardé</Typography>}
          {saveStatus === 'error' && <Typography color="error.main">✗ Erreur</Typography>}
        </Box>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
        {['Informations', 'Services', 'Conteneurs', 'Haulage', 'Seafreight', 'Divers', 'Récapitulatif'].map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Contenu de l'étape */}
      {renderStepContent(currentStep)}

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            🐛 Debug Info (Dev Only)
          </Typography>
          <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
            {JSON.stringify({
              currentStep,
              draftId: draftQuote.id,
              requestQuoteId: draftQuote.requestQuoteId,
              isApiCompatible: isApiCompatible(draftQuote),
              validationErrors: validateForApi(draftQuote)
            }, null, 2)}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
