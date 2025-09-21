import { useEffect, useState, useCallback, useMemo } from "react";
import { 
  Stepper, Step, StepLabel, Box, Button, 
  Typography, Alert, CircularProgress, Dialog, 
  DialogTitle, DialogContent, DialogActions,
  IconButton
} from "@mui/material";
import { Save, Warning, BugReport, Close, Code } from "@mui/icons-material";

// ✅ UTILS
import { isBackendGeneratedId } from '../utils/draftIdValidation';
import { incotermValues } from '@utils/constants';

// ✅ NOUVELLE API DRAFTQUOTE
import { 
  useCreateDraftQuote, 
  useDraftQuote, 
  useUpdateDraftQuote,
  useAddDraftQuoteOption,
  mapDraftQuoteFromApi,
  mapDraftQuoteToApi,
  mapDraftQuoteToUpdateApi,
  validateDraftQuote,
  createEmptyOption
} from '../../offer/services/draftQuoteService';
import type { DraftQuote, DraftQuoteOption } from '../../offer/types/DraftQuote';
import { convertRequestToDraftQuote, validateRequestData } from '../utils/requestToDraftQuoteConverter';

// ✅ STEP COMPONENTS
import Step1RequestForm from '../components/Step1RequestForm';
import Step2Step3Merged from '../components/Step2Step3Merged';
import Step4HaulierSelection from '../components/Step4HaulierSelection';
import Step5SeafreightSelection from '../components/Step5SeafreightSelection';
import Step6MiscellaneousSelection from '../components/Step6MiscellaneousSelection';
import Step7Recap from '../components/Step7Recap';
import SaveDraftTest from '../components/SaveDraftTest';

// ✅ TYPES
import { StatusRequest } from '../api/types.gen';

// ✅ EXTERNAL HOOKS
import { useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useAccount, useMsal } from '@azure/msal-react';

// ✅ UTILITAIRE : Sérialisation JSON sécurisée
const safeJsonStringify = (obj: any, maxLength: number = 50000): string => {
  try {
    const jsonString = JSON.stringify(obj, null, 2);
    return jsonString.length > maxLength ? 
      jsonString.substring(0, maxLength) + '\n\n... (tronqué - trop volumineux)' : 
      jsonString;
  } catch (error) {
    return `Erreur de sérialisation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
  }
};

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
  
  // ✅ VALIDATION DES DONNÉES DE NAVIGATION (nouvelle API)
  const navigationValidation = validateRequestData(location.state?.requestData);
  
  // Log des données reçues (ciblé sur assignee et incoterm)
  if (location.state?.requestData) {
    console.log('📥 [WIZARD] Données reçues de Requests.tsx:', {
      requestId: location.state.requestData.requestQuoteId,
      assignee: location.state.requestData.assigneeDisplayName,
      incoterm: location.state.requestData.incoterm,
      source: location.state.source,
      fullData: location.state.requestData
    });
  }
  
  // ✅ CRÉATION DU BROUILLON INITIAL AVEC LES DONNÉES DE NAVIGATION (nouvelle API)
  const initialDraftQuote = useMemo(() => {
    if (navigationValidation.isValid && navigationValidation.requestData) {
      console.log('[RequestWizard] Initialisation depuis requête existante avec nouvelle API:', navigationValidation.requestQuoteId);
      // ✅ Créer un brouillon depuis une requête existante avec la nouvelle API
      return convertRequestToDraftQuote(
        navigationValidation.requestData, 
        currentUserEmail
      );
    }
    
    console.log('[RequestWizard] Accès direct sans requête existante - création d\'un nouveau brouillon avec nouvelle API');
    // ✅ Créer un nouveau brouillon avec la nouvelle API
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
  
  // ✅ HOOKS POUR LA NOUVELLE API DRAFTQUOTE
  const createMutation = useCreateDraftQuote();
  const updateMutation = useUpdateDraftQuote();
  const addOptionMutation = useAddDraftQuoteOption();
  
  // Récupération du brouillon existant si draftId fourni
  const { data: existingDraft, isLoading: isLoadingDraft, refetch: refetchDraft } = useDraftQuote(
    draftId || ''
  );

  // ✅ ÉTAT LOCAL DU WIZARD
  const [wizardState, setWizardState] = useState({
    draftQuote: initialDraftQuote,
    activeStep: 0,
    isDirty: false,
    isSaving: false,
    lastSavedAt: null as Date | null,
    saveError: null as string | null,
  });

  // Initialiser le brouillon depuis l'API si disponible
  useEffect(() => {
    if (existingDraft?.data) {
      const mappedDraft = mapDraftQuoteFromApi(existingDraft.data);
      setWizardState(prev => ({
        ...prev,
        draftQuote: mappedDraft,
        isDirty: false,
        lastSavedAt: new Date(),
      }));
    }
  }, [existingDraft]);

  // Fonctions de gestion du wizard
  const updateDraftQuote = useCallback((updates: Partial<DraftQuote>) => {
    setWizardState(prev => ({
      ...prev,
      draftQuote: prev.draftQuote ? { ...prev.draftQuote, ...updates } : updates,
      isDirty: true,
    }));
  }, []);


  const saveDraft = useCallback(async (): Promise<boolean> => {
    console.log('🚀 [SAVE_DRAFT] Début de la sauvegarde');
    console.log('🚀 [SAVE_DRAFT] État actuel:', {
      hasDraftQuote: !!wizardState.draftQuote,
      isSaving: wizardState.isSaving,
      draftQuoteId: wizardState.draftQuote?.draftQuoteId,
      savedOptionsCount: savedOptions.length
    });

    if (!wizardState.draftQuote || wizardState.isSaving) {
      console.log('❌ [SAVE_DRAFT] Conditions non remplies pour la sauvegarde');
      return false;
    }

    try {
      setWizardState(prev => ({ ...prev, isSaving: true, saveError: null }));

      // Valider les données
      console.log('🔍 [SAVE_DRAFT] Validation des données...');
      const validation = validateDraftQuote(wizardState.draftQuote);
      if (!validation.isValid) {
        console.warn('❌ [SAVE_DRAFT] Validation failed:', validation.errors);
        setWizardState(prev => ({ 
          ...prev, 
          isSaving: false, 
          saveError: validation.errors.join(', ') 
        }));
        return false;
      }
      console.log('✅ [SAVE_DRAFT] Validation réussie');

      let draftId = wizardState.draftQuote.draftQuoteId;
      
      if (draftId) {
        // Mise à jour d'un brouillon existant
        console.log('🔄 [SAVE_DRAFT] Mise à jour du brouillon existant:', draftId);
        console.log('🔄 [SAVE_DRAFT] Conversion vers UpdateDraftQuoteRequest...');
        const updateApiDraft = mapDraftQuoteToUpdateApi(wizardState.draftQuote, savedOptions);
        console.log('✅ [SAVE_DRAFT] Conversion UpdateDraftQuoteRequest réussie:', updateApiDraft);
        
        try {
          const result = await updateMutation.mutateAsync({
            path: { id: draftId },
            body: updateApiDraft,
          });
          console.log('✅ [SAVE_DRAFT] Mise à jour réussie:', result);
          
          // Mettre à jour l'ID du brouillon si nécessaire
          if (result?.data?.draftQuoteId) {
            draftId = result.data.draftQuoteId;
            setWizardState(prev => ({
              ...prev,
              draftQuote: prev.draftQuote ? {
                ...prev.draftQuote,
                draftQuoteId: result.data!.draftQuoteId
              } : prev.draftQuote,
            }));
          }
        } catch (error) {
          console.error('❌ [SAVE_DRAFT] Erreur lors de la mise à jour:', error);
          throw error;
        }
      } else {
        // Création d'un nouveau brouillon
        console.log('🆕 [SAVE_DRAFT] Création d\'un nouveau brouillon');
        console.log('🔄 [SAVE_DRAFT] Conversion vers CreateDraftQuoteRequest...');
        const createApiDraft = mapDraftQuoteToApi(wizardState.draftQuote);
        console.log('✅ [SAVE_DRAFT] Conversion CreateDraftQuoteRequest réussie:', createApiDraft);
        
        try {
          const result = await createMutation.mutateAsync({
            body: createApiDraft,
          });
          console.log('✅ [SAVE_DRAFT] Création réussie:', result);
          
          // Mettre à jour l'ID du brouillon
          if (result?.data?.draftQuoteId) {
            draftId = result.data.draftQuoteId;
            setWizardState(prev => ({
              ...prev,
              draftQuote: prev.draftQuote ? {
                ...prev.draftQuote,
                draftQuoteId: result.data!.draftQuoteId
              } : prev.draftQuote,
            }));
          }
        } catch (error) {
          console.error('❌ [SAVE_DRAFT] Erreur lors de la création:', error);
          throw error;
        }
      }

      // ✅ NOUVEAU : Sauvegarder les options si elles existent
      if (draftId && savedOptions.length > 0) {
        console.log('💾 [SAVE_DRAFT] Sauvegarde des options:', savedOptions.length);
        
        // Sauvegarder chaque option
        for (const option of savedOptions) {
          try {
            console.log('💾 [SAVE_DRAFT] Sauvegarde option:', option.optionId || 'sans ID');
            await addOptionMutation.mutateAsync({
              path: { id: draftId },
              body: { option: option },
            });
            console.log('✅ [SAVE_DRAFT] Option sauvegardée:', option.optionId);
          } catch (error) {
            console.error('❌ [SAVE_DRAFT] Erreur sauvegarde option:', error);
            // Continue avec les autres options même si une échoue
          }
        }
      } else {
        console.log('ℹ️ [SAVE_DRAFT] Pas de sauvegarde d\'options:', {
          hasDraftId: !!draftId,
          optionsCount: savedOptions.length
        });
      }

      setWizardState(prev => ({
        ...prev,
        isSaving: false,
        isDirty: false,
        lastSavedAt: new Date(),
        saveError: null,
      }));

      console.log('✅ [WIZARD] Brouillon sauvegardé avec succès');
      return true;
    } catch (error) {
      console.error('❌ [WIZARD] Erreur lors de la sauvegarde:', error);
      setWizardState(prev => ({
        ...prev,
        isSaving: false,
        saveError: error instanceof Error ? error.message : 'Erreur inconnue',
      }));
      return false;
    }
  }, [wizardState.draftQuote, wizardState.isSaving, createMutation, updateMutation, addOptionMutation]);

  const loadDraft = useCallback(async (id: string): Promise<boolean> => {
    try {
      console.log('🔄 [WIZARD] Chargement du brouillon:', id);
      // Le hook useDraftQuote s'occupe du chargement
      return true;
    } catch (error) {
      console.error('❌ [WIZARD] Erreur lors du chargement:', error);
      return false;
    }
  }, []);

  const resetDraft = useCallback(() => {
    setWizardState({
      draftQuote: initialDraftQuote,
      activeStep: 0,
      isDirty: false,
      isSaving: false,
      lastSavedAt: null,
      saveError: null,
    });
  }, [initialDraftQuote]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step <= 5) { // 6 étapes : 0-5
      setWizardState(prev => ({ ...prev, activeStep: step }));
    }
  }, []);


  // ✅ GESTION DES OPTIONS
  const [savedOptions, setSavedOptions] = useState<DraftQuoteOption[]>([]);
  const [currentOptionIndex, setCurrentOptionIndex] = useState<number | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // ✅ MODAL DEBUG
  const [showDebugModal, setShowDebugModal] = useState(false);

  // ✅ NOUVEAU : Charger les options existantes
  const loadExistingOptions = useCallback(async (draftId: string) => {
    if (!draftId) return;
    
    try {
      setIsLoadingOptions(true);
      console.log('📥 [LOAD_OPTIONS] Chargement des options pour le brouillon:', draftId);
      
      // Récupérer le brouillon complet avec ses options
      const result = await refetchDraft();
      if (result.data) {
        const draftWithOptions = mapDraftQuoteFromApi(result.data as any);
        if (draftWithOptions.options && draftWithOptions.options.length > 0) {
          setSavedOptions(draftWithOptions.options);
          console.log('✅ [LOAD_OPTIONS] Options chargées:', draftWithOptions.options.length);
        } else {
          setSavedOptions([]);
          console.log('ℹ️ [LOAD_OPTIONS] Aucune option trouvée');
        }
      }
    } catch (error) {
      console.error('❌ [LOAD_OPTIONS] Erreur lors du chargement des options:', error);
      setSavedOptions([]);
    } finally {
      setIsLoadingOptions(false);
    }
  }, [refetchDraft]);

  // ✅ NOUVEAU : Charger les options quand un brouillon est chargé
  useEffect(() => {
    if (wizardState.draftQuote?.draftQuoteId) {
      loadExistingOptions(wizardState.draftQuote.draftQuoteId);
    }
  }, [wizardState.draftQuote?.draftQuoteId, loadExistingOptions]);

  const createNewOption = useCallback(async () => {
    if (!wizardState.draftQuote?.draftQuoteId) return null;

    try {
      setIsLoadingOptions(true);
      const newOption = createEmptyOption();
      const result = await addOptionMutation.mutateAsync({
        path: { id: wizardState.draftQuote.draftQuoteId },
        body: { option: newOption },
      });

      if (result?.data) {
        // L'API retourne le brouillon complet avec les options mises à jour
        const updatedDraft = mapDraftQuoteFromApi(result.data);
        if (updatedDraft.options && updatedDraft.options.length > 0) {
          const newOption = updatedDraft.options[updatedDraft.options.length - 1];
          setSavedOptions(prev => [...prev, newOption]);
          setCurrentOptionIndex(savedOptions.length);
          return newOption;
        }
      }
      return null;
    } catch (error) {
      console.error('❌ [WIZARD] Erreur lors de la création de l\'option:', error);
      return null;
    } finally {
      setIsLoadingOptions(false);
    }
  }, [wizardState.draftQuote?.draftQuoteId, addOptionMutation, savedOptions.length]);


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

  // ✅ CHARGEMENT DES OPTIONS EXISTANTES
  useEffect(() => {
    if (wizardState.draftQuote?.options) {
      setSavedOptions(wizardState.draftQuote.options);
    }
  }, [wizardState.draftQuote?.options]);

  // ✅ CHARGEMENT D'UN BROUILLON EXISTANT
  useEffect(() => {
    console.log('🔍 [WIZARD] useEffect déclenché avec:', { draftId, stepParam });
    
    if (draftId && draftId !== 'new') {
      // 🔍 DEBUG : Voir l'ID reçu et sa validation
      console.log('🔍 [WIZARD] ID reçu:', {
        draftId,
        isBackendId: isBackendGeneratedId(draftId),
        idLength: draftId?.length,
        idType: typeof draftId
      });
      
      // ✅ VALIDATION TEMPORAIRE : Accepter tous les IDs pour debug
      if (!draftId || draftId === 'new') {
        console.warn('⚠️ [WIZARD] Pas d\'ID ou ID "new", redirection vers Requests:', draftId);
        enqueueSnackbar('Aucun ID de brouillon fourni', { variant: 'warning' });
        setTimeout(() => navigate('/requests', { replace: true }), 2000);
        return;
      }
      
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
            enqueueSnackbar('Brouillon introuvable - création d\'un nouveau brouillon', { variant: 'warning' });
            // ✅ TEMPORAIRE : Ne pas rediriger, continuer avec un nouveau brouillon
          }
        } catch (error) {
          console.error('❌ [WIZARD] Erreur lors du chargement:', error);
          enqueueSnackbar('Erreur lors du chargement du brouillon - création d\'un nouveau brouillon', { variant: 'warning' });
          // ✅ TEMPORAIRE : Ne pas rediriger, continuer avec un nouveau brouillon
        }
      };
      
      loadExistingDraft();
    } else {
      console.log('ℹ️ [WIZARD] Pas de chargement nécessaire - draftId:', draftId);
    }
  }, [draftId, stepParam, loadDraft, goToStep, enqueueSnackbar, navigate]);

  // ✅ ÉTAT LOCAL - TEMPORAIREMENT DÉSACTIVÉ POUR LES TESTS
  // const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  // const [showResetDialog, setShowResetDialog] = useState(false);

  // ✅ HANDLERS
  const handleSave = useCallback(async () => {
    try {
      console.log('💾 [WIZARD] Sauvegarde avec la nouvelle API');
      
      const success = await saveDraft();
      if (success) {
        enqueueSnackbar('Brouillon sauvegardé avec succès', { variant: 'success' });
      } else {
        enqueueSnackbar('Erreur lors de la sauvegarde', { variant: 'error' });
      }
    } catch (error) {
      console.error('❌ [WIZARD] Erreur lors de la sauvegarde:', error);
      enqueueSnackbar('Erreur lors de la sauvegarde', { variant: 'error' });
    }
  }, [saveDraft, enqueueSnackbar]);

  const handleDebug = useCallback(() => {
    console.log('=== DEBUG DRAFT QUOTE V2 ===');
    console.log('📋 DraftQuote:', wizardState.draftQuote);
    console.log('📍 Active Step:', wizardState.activeStep);
    console.log('💾 Has Unsaved Changes:', wizardState.isDirty);
    console.log('⏰ Last Saved At:', wizardState.lastSavedAt);
    console.log('❌ Save Error:', wizardState.saveError);
    console.log('📦 Options:', savedOptions);
    console.log('🎯 Current Option Index:', currentOptionIndex);
    
    // ✅ NOUVEAU : Afficher le payload pour la création
    console.log('🆕 CREATE API Format (POST):', mapDraftQuoteToApi(wizardState.draftQuote));
    
    // ✅ NOUVEAU : Afficher le payload pour la mise à jour
    if (wizardState.draftQuote?.draftQuoteId) {
      console.log('🔄 UPDATE API Format (PUT):', mapDraftQuoteToUpdateApi(wizardState.draftQuote, savedOptions));
      console.log('🔄 PUT API URL:', `/api/draft-quotes/${wizardState.draftQuote.draftQuoteId}`);
      console.log('🔄 PUT API Payload Structure:', {
        path: { id: wizardState.draftQuote.draftQuoteId },
        body: mapDraftQuoteToUpdateApi(wizardState.draftQuote, savedOptions)
      });
    } else {
      console.log('ℹ️ Pas de draftQuoteId - pas de payload PUT disponible');
    }
    
    console.log('========================');
    
    // ✅ NOUVEAU : Ouvrir le modal de debug
    setShowDebugModal(true);
    enqueueSnackbar('Modal de debug ouvert avec les payloads API', { variant: 'info' });
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



  const updateStep1 = useCallback((data: any) => {
    // Mise à jour des informations client et d'expédition
    updateDraftQuote({
      customer: { ...wizardState.draftQuote?.customer, ...data.customer },
      shipment: { ...wizardState.draftQuote?.shipment, ...data.shipment },
    });
  }, [updateDraftQuote, wizardState.draftQuote]);

  const updateStep2 = useCallback((data: any) => {
    console.log('🔄 [WIZARD] updateStep2 appelé avec:', data);
    updateDraftQuote({
      wizard: { ...wizardState.draftQuote?.wizard, ...data }
    });
  }, [updateDraftQuote, wizardState.draftQuote]);

  const updateStep3 = useCallback((data: any) => {
    // S'assurer que step3 existe dans draftQuote
    const currentStep3 = (wizardState.draftQuote as any)?.step3 || {
      containers: [],
      summary: { totalContainers: 0, totalTEU: 0, containerTypes: [] },
      route: null,
      selectedContainers: { list: [] }
    };
    
    const updatedStep3 = { ...currentStep3, ...data };
    
    updateDraftQuote({
      step3: updatedStep3
    } as any);
  }, [updateDraftQuote, wizardState.draftQuote]);

  const updateStep4 = useCallback((data: any) => {
    // S'assurer que step4 existe dans draftQuote
    const currentStep4 = (wizardState.draftQuote as any)?.step4 || {
      selection: null,
      calculation: null,
      completed: false
    };
    
    const updatedStep4 = { ...currentStep4, ...data };
    
    updateDraftQuote({
      step4: updatedStep4
    } as any);
  }, [updateDraftQuote, wizardState.draftQuote]);

  const updateStep5 = useCallback((data: any) => {
    // S'assurer que step5 existe dans draftQuote
    const currentStep5 = (wizardState.draftQuote as any)?.step5 || {
      selections: [],
      summary: null,
      completed: false
    };
    
    const updatedStep5 = { ...currentStep5, ...data };
    
    updateDraftQuote({
      step5: updatedStep5
    } as any);
  }, [updateDraftQuote, wizardState.draftQuote]);

  const updateStep6 = useCallback((data: any) => {
    console.log('🔧 [WIZARD] updateStep6 appelé avec:', data);
    updateDraftQuote({
      step6: data
    } as any);
  }, [updateDraftQuote]);


  // ✅ RENDERING DES ÉTAPES - NOUVELLE ORGANISATION
  const renderStepContent = (step: number) => {
    if (!wizardState.draftQuote) return null;

    switch (step) {
      case 0:
        // Step 1: Informations de base
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
        // Step 2: Services & Conteneurs (Step2Step3Merged)
        console.log('🔧 [WIZARD] Rendu Step2Step3Merged avec les données:', {
          cityFrom: wizardState.draftQuote.shipment?.origin,
          cityTo: wizardState.draftQuote.shipment?.destination,
          productName: wizardState.draftQuote.shipment?.commodity,
          incotermName: wizardState.draftQuote.incoterm,
        });
        
        return (
          <Step2Step3Merged
            requestData={wizardState.draftQuote}
            onStepUpdate={(data) => {
              console.log('🔄 [WIZARD] onStepUpdate Step2+3 appelé avec:', data);
              // Mettre à jour les deux étapes
              updateStep2(data);
              updateStep3(data);
            }}
            onBack={() => goToStep(wizardState.activeStep - 1)}
            onNext={() => goToStep(wizardState.activeStep + 1)}
          />
        );

      case 2:
        // Step 3: Seafreight (Step5SeafreightSelection)
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
        // Step 4: Haulage (Step4HaulierSelection)
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
        // Step 5: Miscellaneous (Step6MiscellaneousSelection)
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
        // Step 6: Récapitulatif (Step7Recap)
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
                enqueueSnackbar('Option créée avec succès', { variant: 'success' });
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

  // ✅ AFFICHAGE DU CHARGEMENT
  if (wizardState.isSaving || isLoadingOptions || isLoadingDraft) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          {wizardState.isSaving ? 'Sauvegarde en cours...' : 
           isLoadingDraft ? 'Chargement du brouillon...' : 
           'Chargement des options...'}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                Brouillon {wizardState.draftQuote.draftQuoteId ? `#${wizardState.draftQuote.draftQuoteId}` : 'en cours de création'}
              </Typography>
              <Box sx={{ 
                px: 1, 
                py: 0.25, 
                bgcolor: 'success.light', 
                color: 'success.contrastText',
                borderRadius: 0.5,
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                API v2.0
              </Box>
            </Box>
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
          {wizardState.activeStep < 5 && ( // 6 étapes : 0-5, donc < 5 pour afficher le bouton
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

      {/* ✅ STEPPER - NOUVELLE ORGANISATION */}
      <Stepper activeStep={wizardState.activeStep} sx={{ mb: 4 }}>
        <Step><StepLabel>1. Informations</StepLabel></Step>
        <Step><StepLabel>2. Services & Conteneurs</StepLabel></Step>
        <Step><StepLabel>3. Seafreight</StepLabel></Step>
        <Step><StepLabel>4. Haulage</StepLabel></Step>
        <Step><StepLabel>5. Miscellaneous</StepLabel></Step>
        <Step><StepLabel>6. Récapitulatif</StepLabel></Step>
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
          {wizardState.activeStep < 5 && ( // 6 étapes : 0-5, donc < 5 pour afficher le bouton
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
          <Typography variant="h6">Debug Info - API v2.0</Typography>
          <Typography variant="body2">
            📍 Active Step: {wizardState.activeStep} | 🆔 Draft ID: {wizardState.draftQuote?.draftQuoteId || 'N/A'} | 📦 Options: {savedOptions.length}
          </Typography>
          <Typography variant="body2">
            ⏳ Loading: Draft={wizardState.isSaving.toString()}, Options={isLoadingOptions.toString()}, API={isLoadingDraft.toString()}
          </Typography>
          <Typography variant="body2">
            💾 Unsaved Changes: {wizardState.isDirty.toString()}
          </Typography>
          <Typography variant="body2">
            🎯 Current Option: {currentOptionIndex !== null ? savedOptions[currentOptionIndex]?.label : 'Aucune'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
            🔄 Nouvelle API: DraftQuote v2.0 avec structure optimisée
          </Typography>
          
          {/* Composant de test de sauvegarde */}
          <SaveDraftTest draftQuote={wizardState.draftQuote} savedOptions={savedOptions} />
        </Box>
      )}

      {/* ✅ MODAL DEBUG - PAYLOAD API */}
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
              Debug API Payloads - DraftQuote v2.0
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
            {/* Informations générales */}
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'grey.200' }}>
              <Typography variant="h6" gutterBottom>📊 Informations du Brouillon</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Draft ID:</strong> {wizardState.draftQuote?.draftQuoteId || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Étape active:</strong> {wizardState.activeStep + 1}/6
                </Typography>
                <Typography variant="body2">
                  <strong>Modifications non sauvegardées:</strong> {wizardState.isDirty ? 'Oui' : 'Non'}
                </Typography>
                <Typography variant="body2">
                  <strong>Options sauvegardées:</strong> {savedOptions.length}
                </Typography>
                <Typography variant="body2">
                  <strong>Dernière sauvegarde:</strong> {wizardState.lastSavedAt?.toLocaleString() || 'Jamais'}
                </Typography>
                <Typography variant="body2">
                  <strong>Erreur de sauvegarde:</strong> {wizardState.saveError || 'Aucune'}
                </Typography>
              </Box>
            </Box>

            {/* Onglets pour les différents payloads */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex' }}>
                <Button
                  variant="contained"
                  sx={{ 
                    borderRadius: 0,
                    bgcolor: 'primary.main',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  🆕 POST /api/draft-quotes
                </Button>
                {wizardState.draftQuote?.draftQuoteId && (
                  <Button
                    variant="outlined"
                    sx={{ 
                      borderRadius: 0,
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': { 
                        borderColor: 'primary.dark',
                        bgcolor: 'primary.light',
                        color: 'primary.dark'
                      }
                    }}
                  >
                    🔄 PUT /api/draft-quotes/{wizardState.draftQuote.draftQuoteId}
                  </Button>
                )}
              </Box>
            </Box>

            {/* Contenu des payloads */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {/* Payload POST (Création) */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'success.main' }}>
                  🆕 POST /api/draft-quotes (Création)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Payload pour créer un nouveau brouillon
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

              {/* Payload PUT (Mise à jour) */}
              {wizardState.draftQuote?.draftQuoteId ? (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'info.main' }}>
                    🔄 PUT /api/draft-quotes/{wizardState.draftQuote.draftQuoteId} (Mise à jour)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Payload pour mettre à jour le brouillon existant
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
                    ⚠️ PUT /api/draft-quotes/{wizardState.draftQuote?.draftQuoteId || 'N/A'} (Mise à jour)
                  </Typography>
                  <Alert severity="warning">
                    Aucun DraftQuote ID disponible - Le brouillon doit d'abord être créé (POST) pour pouvoir être mis à jour (PUT)
                  </Alert>
                </Box>
              )}

              {/* Options sauvegardées */}
              {savedOptions.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'secondary.main' }}>
                    📦 Options sauvegardées ({savedOptions.length})
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Options qui seront sauvegardées avec le brouillon
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
            Fermer
          </Button>
          <Button 
            onClick={() => {
              // Copier le payload PUT dans le presse-papiers
              try {
                if (wizardState.draftQuote?.draftQuoteId) {
                  const payload = safeJsonStringify(mapDraftQuoteToUpdateApi(wizardState.draftQuote, savedOptions));
                  navigator.clipboard.writeText(payload);
                  enqueueSnackbar('Payload PUT copié dans le presse-papiers', { variant: 'success' });
                } else {
                  const payload = safeJsonStringify(mapDraftQuoteToApi(wizardState.draftQuote));
                  navigator.clipboard.writeText(payload);
                  enqueueSnackbar('Payload POST copié dans le presse-papiers', { variant: 'success' });
                }
              } catch (error) {
                console.error('Erreur lors de la copie:', error);
                enqueueSnackbar('Erreur lors de la copie du payload', { variant: 'error' });
              }
            }}
            variant="contained"
            startIcon={<Code />}
          >
            Copier le payload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
