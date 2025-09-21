import { useEffect, useState, useCallback, useMemo } from "react";
import { Stepper, Step, StepLabel, Box, Button, ButtonGroup, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";

// ✅ LOGS DE DEBUG ACTIVÉS POUR LE DÉVELOPPEMENT
import Step1RequestForm from "../components/Step1RequestForm";
import Step2SelectServices from "../components/Step2SelectServices";
import { useNewRequestQuote } from "../components/useNewRequestQuote";

// Supprimé: useDebugLogger maintenant importé depuis les hooks

// ✅ NOUVEAUX IMPORTS POUR LA RÉFACTORISATION
import { 
  useDraftManagement, 
  useWizardNavigation, 
  useOptionManagement 
} from '../hooks';
import { 
  computeHaulageTotal, 
  computeSeafreightTotal, 
  computeTotalPrice,
  calculateTotalTEU 
} from '../utils';
import { 
  WizardHeader, 
  OptionManagementPanel 
} from '../components';

import { incotermValues, containerPackages } from "@utils/constants";
import { getTEU } from "../../../utils/functions";
import Step3RequestForm from "../components/Step3RequestForm";
import { useMsal, useAccount } from '@azure/msal-react';
import { postApiRequest, getApiRequestById } from '@features/request/api/sdk.gen';
import Step4HaulierSelection from "../components/Step4HaulierSelection";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import Step5SeafreightSelection from '../components/Step5SeafreightSelection';
import Step6MiscellaneousSelection from '../components/Step6MiscellaneousSelection';
import Step7Recap from '../components/Step7Recap';
// === NOUVEAUX IMPORTS POUR LA CRÉATION DE DEVIS ===
import { postApiDraftQuotesSearch, postApiDraftQuotes, putApiDraftQuotesById, getApiDraftQuotesById, getApiQuotesById } from '@features/offer/api/sdk.gen';
import { enqueueSnackbar } from 'notistack';
import CompareOptions from '../components/CompareOptions';
import FinalValidation from '../components/FinalValidation';
import EditIcon from '@mui/icons-material/Edit';
import DescriptionIcon from '@mui/icons-material/Description';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import { useTranslation } from 'react-i18next';

import { StatusRequest } from "@features/request/api/types.gen";
import useProcessStatePersistence from '@utils/processes/useProcessStatePersistence';
import CircularProgress from '@mui/material/CircularProgress';
import { showSnackbar } from '@components/common/Snackbar';
import { putApiRequestUpdateById } from '@features/request/api/sdk.gen';
import type { HaulageResponse } from "@features/pricingnew/api/types.gen";
import SaveButton from '@components/common/SaveButton';
import DebugPanel from '@components/common/DebugPanel';
import { useDraftPersistence } from '../services/DraftPersistenceService';
import { useDebugLogger } from '../hooks/useDebugLogger';

// ✅ NOUVEAU: IMPORT DES TYPES ET FONCTIONS DEPUIS LE FICHIER SÉPARÉ
import { 
  DraftQuote,
  createInitialDraftQuote, 
  createDraftQuoteFromRequest,
  validateNavigationData,
  syncDraftQuoteData, 
  buildSDKPayload,
  loadDraftFromDatabase
} from '../types';

// ✅ NOUVEAU: IMPORT DU HOOK DE SYNCHRONISATION
// ✅ REMOVED - useDraftQuoteSync replaced by useDraftManagement
import { DraftSyncStatus } from '../components/DraftSyncStatus';



// === FONCTION UTILITAIRE POUR VÉRIFICATION DE DOUBLONS ===
const checkForExistingDraft = async (requestId: string, emailUser: string, debugLog: (msg: string, data?: any) => void) => {
  debugLog('CHECK_DUPLICATE - Vérification de doublon', { requestId, emailUser });
  
  try {
    // Recherche générale par emailUser
    const draftsResponse = await postApiDraftQuotesSearch({
      query: {
        emailUser: emailUser,
        pageNumber: 1,
        pageSize: 100
      }
    });
    
    const drafts = (draftsResponse as any)?.data?.items || [];
    debugLog('CHECK_DUPLICATE - Drafts trouvés', { count: drafts.length });
    
    const existingDraft = drafts.find((draft: any) => {
      // Comparer en convertissant les deux en string pour éviter les problèmes de type
      const draftRequestId = String(draft.requestQuoteId || '');
      const searchRequestId = String(requestId);
      const matchesRequestId = draftRequestId === searchRequestId;
      
      debugLog('CHECK_DUPLICATE - Comparaison draft', {
        draftId: draft.id,
        draftRequestId,
        searchRequestId,
        matchesRequestId
      });
      
      return matchesRequestId;
    });
    
    if (existingDraft) {
      debugLog('CHECK_DUPLICATE - Draft existant trouvé', { draftId: existingDraft.id });
      return existingDraft;
    }
    
    debugLog('CHECK_DUPLICATE - Aucun draft existant trouvé');
    return null;
  } catch (error) {
    debugLog('CHECK_DUPLICATE - Erreur lors de la vérification', { error });
    return null;
  }
};

// Supprimé: initialWizardState remplacé par initialDraftQuote

// === FONCTIONS UTILITAIRES EXPORTABLES ===
export const getDraftDataFromStorage = (draftId: string | null) => {
  if (!draftId) return null;
  const draftStorageKey = `draft_${draftId}`;
  const storedData = localStorage.getItem(draftStorageKey);
  return storedData ? JSON.parse(storedData) : null;
};

export const getCurrentDraftIdFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('draftId');
};

export default function RequestWizard() {
  const { t } = useTranslation();
  
  // ✅ NOUVEAUX HOOKS RÉFACTORISÉS
  const {
    draftQuote,
    currentDraftId,
    isDraftLoaded,
    isLoadedFromDraft,
    isLoadingDraft,
    draftError,
    createDraft,
    updateDraft,
    loadDraft,
    saveCurrentStep,
    resetDraft,
    hasUnsavedChanges,
    setDraftQuote,
    setCurrentDraftId,
    setIsDraftLoaded,
    setIsLoadedFromDraft
  } = useDraftManagement();

  const {
    currentStep,
    activeStep,
    totalSteps,
    steps,
    navigateToStep,
    goToNextStep,
    goToPreviousStep,
    goToFirstStep,
    goToLastStep,
    resetNavigation,
    canNavigateToStep,
    canGoToNext,
    canGoToPrevious,
    getStepInfo,
    getCurrentStepInfo,
    setCurrentStep,
    setActiveStep
  } = useWizardNavigation();

  const { accounts } = useMsal();
  const location = useLocation();
  const { id: urlRequestId } = useParams(); // Récupère l'ID depuis l'URL si présent
  const [urlSearchParams] = useSearchParams();
  
  // Détecter si on est en mode ajout d'option à un devis existant
  const quoteId = urlSearchParams.get('quoteId');
  const optionIndex = parseInt(urlSearchParams.get('optionIndex') || '1');

  const {
    existingOptions,
    editingOptionIndex,
    isLoadingOptions,
    optionsError,
    loadExistingOptions,
    handleNewOption,
    handleLoadOption,
    handleDeleteOption,
    handleValidateOption,
    handleCompareOptions,
    resetOptions,
    getOptionByIndex,
    getCurrentEditingOption,
    setExistingOptions,
    setEditingOptionIndex
  } = useOptionManagement(quoteId);
  
  const debugLog = useDebugLogger();
  const draftPersistence = useDraftPersistence(debugLog);
  
  // État pour collecter les services miscellaneous sélectionnés au moment de la sauvegarde
  const [currentlySelectedMiscellaneous, setCurrentlySelectedMiscellaneous] = useState<any[]>([]);

  // Charger les options existantes du devis si on est en mode ajout d'option
  useEffect(() => {
    const loadExistingOptions = async () => {
              if (quoteId) {
          try {
            const response = await getQuoteOffer({ path: { id: quoteId } });
            const quoteData = response as any;
            setExistingOptions(quoteData?.options || []);
          } catch (error) {
            enqueueSnackbar('Erreur lors du chargement des options du devis', { variant: 'error' });
          }
        }
    };

    loadExistingOptions();
  }, [quoteId]);

  // Callback après création d'une option
  const handleOptionCreated = (optionData: any) => {
    enqueueSnackbar('Option créée avec succès !', { variant: 'success' });
    
    // Recharger les options existantes si on était en mode ajout
    if (quoteId) {
      const loadExistingOptions = async () => {
        try {
          const response = await getQuoteOffer({ path: { id: quoteId } });
          const quoteData = response as any;
          setExistingOptions(quoteData?.options || []);
        } catch (error) {
          console.error('[RequestWizard] Erreur lors du rechargement des options:', error);
        }
      };
      loadExistingOptions();
    }
    
    // TODO: Rediriger vers la page de gestion du devis ou autre action
  };

  // TODO: Remettre ce useEffect après la déclaration de toutes les variables

  // TODO: Remettre ce useEffect après la déclaration de toutes les variables
  
  // TODO: Remettre ce useEffect après la déclaration de toutes les variables
  
  const account = useAccount(accounts[0] || {});
  const [contacts] = useState<any[]>([]);
  const [requestId, setRequestId] = useState<string | null>(null);

  // === SAUVEGARDE PAR ÉTAPE sera définie après draftQuote ===

  // === NAVIGATION sera définie après saveCurrentStepToDraftQuote ===
  const [requestData, setRequestData] = useState<any>(null);

  // === NOUVEAUX ÉTATS POUR LE CHARGEMENT DES DONNÉES ===
  const [isLoadingRequestData, setIsLoadingRequestData] = useState<boolean>(false);
  const [requestDataError, setRequestDataError] = useState<string | null>(null);

  // === NOUVEAUX ÉTATS POUR LA SAUVEGARDE AUTOMATIQUE ===
  // searchParams déjà déclaré plus haut comme urlSearchParams
  const initialDraftId = urlSearchParams.get('loadDraft') || urlSearchParams.get('draftId');
  
  console.log('🔍 [INIT_STATE] État initial des paramètres:', {
    searchParamsString: urlSearchParams.toString(),
    draftIdParam: urlSearchParams.get('draftId'),
    loadDraftParam: urlSearchParams.get('loadDraft'),
    initialDraftId,
    currentDraftId
  });
  
  // Synchroniser currentDraftId avec les urlSearchParams
  useEffect(() => {
    const draftIdFromUrl = urlSearchParams.get('draftId');
    const loadDraftFromUrl = urlSearchParams.get('loadDraft');
    
    console.log('🔍 [SYNC_DRAFT_ID] Synchronisation des paramètres URL:', {
      draftIdFromUrl,
      loadDraftFromUrl,
      currentDraftId,
              searchParamsString: urlSearchParams.toString(),
      windowHref: window.location.href
    });
    
    // Prioriser loadDraft puis draftId
    const finalDraftId = loadDraftFromUrl || draftIdFromUrl;
    
    if (finalDraftId !== currentDraftId) {
      console.log('🔧 [SYNC_DRAFT_ID] Mise à jour currentDraftId:', finalDraftId);
      setCurrentDraftId(finalDraftId);
    }
  }, [urlSearchParams, currentDraftId]);
  
  // Utiliser currentDraftId au lieu de draftId
  const draftId = currentDraftId;
  
  // DEBUG DRAFT_ID_MONITOR supprimé pour éviter les boucles de logs

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [debugPanelOpen, setDebugPanelOpen] = useState(false);
  
  // États pour la gestion des offres
  // const [generatedQuoteId, setGeneratedQuoteId] = useState<string | null>(null);
  // const [offerOptions, setOfferOptions] = useState<any[]>([]);
  // const [isOfferMode, setIsOfferMode] = useState(false);



  // === FONCTIONS DE SAUVEGARDE DIRECTES ===
  // ✅ REMPLACÉES PAR LES HOOKS useDraftManagement
  
  // ✅ REMPLACÉE PAR LE HOOK useDraftManagement

  // États du formulaire maintenus via draftQuote uniquement

  // Données pour les listes
  const {
    customers,
    isLoadingCustomers,
    cities,
    isLoadingCities,
    members,
    products
  } = useNewRequestQuote({});

  // Liste des incoterms (depuis les constantes)
  const incoterms = incotermValues;



  // === CHARGEMENT INITIAL ===
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Attendre que le compte utilisateur soit chargé
        if (!account?.username) {
          console.log('[DEBUG] Compte utilisateur pas encore chargé, attente...');
          return;
        }

        // Récupérer les paramètres de l'URL
        const urlParams = new URLSearchParams(location.search);
        const draftIdFromUrl = urlParams.get('loadDraft') || urlParams.get('draftId');
        const requestIdFromUrl = urlParams.get('requestId');
        const stepFromUrl = urlParams.get('step');
        
        // Vérification draft ID silencieuse
        // Paramètres récupérés silencieusement
        
        // Si on a un draftId dans l'URL, charger le draft existant
        if (draftIdFromUrl) {
          // Chargement du draft existant
          try {
            const response = await getApiDraftQuotesById({ path: { id: draftIdFromUrl } });
            
            // Réponse API reçue
            
            const draftData = (response as any)?.data;
            
            // DraftData extrait silencieusement
            
            if (draftData) {
              
              // 🔥 IMPORTANT: Mettre à jour currentDraftId avec l'ID du brouillon chargé
              setCurrentDraftId(draftIdFromUrl);
              setIsLoadedFromDraft(true);
              setIsDraftLoaded(true); // ✅ Marquer comme chargé pour éviter les boucles
              console.log('🔧 [LOAD_INITIAL] currentDraftId mis à jour:', draftIdFromUrl);
              
              // ✅ PRIORITÉ À OPTIMIZEDDRAFTDATA (Structure MongoDB)
              const draftDataContent = 
                draftData.data?.OptimizedDraftData ||    // Structure MongoDB: OptimizedDraftData (majuscule)
                draftData.OptimizedDraftData ||          // Réponse directe API
                draftData.data?.optimizedDraftData ||    // Structure MongoDB: optimizedDraftData (minuscule)
                draftData.optimizedDraftData ||          // Réponse directe API
                draftData.data?.draftData ||             // Ancienne structure
                draftData.draftData ||                   // Structure alternative
                {};
              
              // Extraction du brouillon silencieuse
              // Structure trouvée et analysée
              
              // ✅ ADAPTER LES NOMS DE CHAMPS POUR LA STRUCTURE MONGODB (MAJUSCULES)
              const wizardData = draftDataContent.Wizard || draftDataContent.wizard || {};
              const stepsData = draftDataContent.Steps || draftDataContent.steps || {};
              const totalsData = draftDataContent.Totals || draftDataContent.totals || {};
              
              console.log('[LOAD_INITIAL] Structure OptimizedDraftData détectée:', {
                hasWizard: !!wizardData,
                hasSteps: !!stepsData,
                hasTotals: !!totalsData,
                wizardKeys: wizardData ? Object.keys(wizardData) : [],
                stepsKeys: stepsData ? Object.keys(stepsData) : [],
                totalsKeys: totalsData ? Object.keys(totalsData) : []
              });
              
              // Draft chargé avec succès
              

              
              // Déterminer la dernière étape à laquelle l'utilisateur s'est arrêté
              const determineLastStep = () => {
                // Si l'étape est spécifiée dans l'URL, l'utiliser en priorité
                if (stepFromUrl) {
                  const stepNumber = parseInt(stepFromUrl, 10);
                  if (!isNaN(stepNumber) && stepNumber >= 1 && stepNumber <= 7) {
                    return stepNumber - 1; // Convert to 0-based index
                  }
                }
                
                // Si activeStep ou currentStep est défini, l'utiliser
                if (wizardData.activeStep || wizardData.ActiveStep) return wizardData.activeStep || wizardData.ActiveStep;
                if (wizardData.currentStep || wizardData.CurrentStep) return (wizardData.currentStep || wizardData.CurrentStep) - 1; // Convert to 0-based
                
                // Sinon, déterminer automatiquement selon les données présentes
                if (draftDataContent.savedOptions && draftDataContent.savedOptions.length > 0) {
                  return 6; // Étape 7 (récapitulatif) -> activeStep 6
                }
                
                // Vérifier Step6/step6 pour les services divers
                const step6 = stepsData.step6 || stepsData.Step6;
                if (step6 && step6.selections && step6.selections.length > 0) {
                  return 5; // Étape 6 (Miscellaneous) -> activeStep 5
                }
                
                // Vérifier Step5/step5 pour le seafreight
                const step5 = stepsData.step5 || stepsData.Step5;
                if (step5 && step5.selections && step5.selections.length > 0) {
                  return 4; // Étape 5 (Seafreight) -> activeStep 4
                }
                
                // Vérifier Step4/step4 pour le haulage
                const step4 = stepsData.step4 || stepsData.Step4;
                if (step4 && step4.selection && step4.selection.haulierId > 0) {
                  return 3; // Étape 4 (Haulage) -> activeStep 3
                }
                
                // Vérifier Step3/step3 pour les conteneurs
                const step3 = stepsData.step3 || stepsData.Step3;
                if (step3 && step3.containers && step3.containers.length > 0) {
                  return 2; // Étape 3 (Containers) -> activeStep 2
                }
                
                // Vérifier Step2/step2 pour les services
                const step2 = stepsData.step2 || stepsData.Step2;
                if (step2 && step2.selectedServices && step2.selectedServices.length > 0) {
                  return 1; // Étape 2 (Services) -> activeStep 1
                }
                
                return 0; // Étape 1 (Request) -> activeStep 0
              };
              
              const targetStep = determineLastStep();
              console.log('[RequestWizard] Détermination de la dernière étape:', {
                activeStep: draftDataContent.activeStep,
                currentStep: draftDataContent.currentStep,
                hasStep3: !!(draftDataContent.step3 && draftDataContent.step3.selectedContainers),
                hasSelectedHaulage: !!draftDataContent.selectedHaulage,
                hasSelectedSeafreights: !!(draftDataContent.selectedSeafreights && draftDataContent.selectedSeafreights.length > 0),
                hasSelectedMiscellaneous: !!(draftDataContent.selectedMiscellaneous && draftDataContent.selectedMiscellaneous.length > 0),
                hasSavedOptions: !!(draftDataContent.savedOptions && draftDataContent.savedOptions.length > 0),
                targetStep: targetStep
              });
              
              console.log('[DEBUG_DRAFT_LOADING] === NAVIGATION VERS ÉTAPE ===');
              console.log('[DEBUG_DRAFT_LOADING] targetStep calculé:', targetStep);
              console.log('[DEBUG_DRAFT_LOADING] currentStep sera:', targetStep + 1);
              console.log('[DEBUG_DRAFT_LOADING] activeStep sera:', targetStep);
              console.log('[DEBUG_DRAFT_LOADING] Condition affichage boutons navigation:', targetStep <= 6);
              
              setCurrentStep(targetStep + 1); // currentStep est base 1, activeStep est base 0
              setActiveStep(targetStep);
              
              // ✅ RÉCUPÉRER LES DONNÉES DEPUIS OPTIMIZEDDRAFTDATA OU OPTIONS PAR DÉFAUT
              const getDefaultOptionData = () => {
                // ✅ PRIORITÉ 1: Données directes depuis OptimizedDraftData
                if (draftDataContent.Steps || draftDataContent.steps) {
                  const steps = draftDataContent.Steps || draftDataContent.steps;
                  console.log('[RequestWizard] Récupération depuis OptimizedDraftData.Steps:', {
                    hasStep4: !!steps.Step4 || !!steps.step4,
                    hasStep5: !!steps.Step5 || !!steps.step5,
                    hasStep6: !!steps.Step6 || !!steps.step6,
                    step4Data: steps.Step4 || steps.step4,
                    step5Data: steps.Step5 || steps.step5,
                    step6Data: steps.Step6 || steps.step6
                  });
                  
                  // ✅ Extraire les données des étapes
                  const step4Data = steps.Step4 || steps.step4;
                  const step5Data = steps.Step5 || steps.step5;
                  const step6Data = steps.Step6 || steps.step6;
                  
                  // 🔍 DEBUG DÉTAILLÉ DE STEP5
                  console.log('[RequestWizard] 🔍 === ANALYSE DÉTAILLÉE STEP5 ===');
                  console.log('[RequestWizard] 🔍 step5Data complet:', JSON.stringify(step5Data, null, 2));
                  
                  if (step5Data?.Selections && step5Data.Selections.length > 0) {
                    console.log('[RequestWizard] 🔍 ✅ Selections Step5 trouvées:', {
                      count: step5Data.Selections.length,
                      selections: step5Data.Selections.map((sel: any) => ({
                        id: sel._id || sel.Id || sel.id,
                        seafreightId: sel.SeafreightId || sel.seafreightId,
                        carrierName: sel.Carrier?.CarrierName || sel.Carrier?.carrierName || sel.carrierName,
                        basePrice: sel.Charges?.BasePrice || sel.Charges?.basePrice || sel.basePrice,
                        totalPrice: sel.Charges?.TotalPrice || sel.Charges?.totalPrice || sel.totalPrice,
                        containerType: sel.Container?.ContainerType || sel.Container?.containerType || sel.containerType,
                        transitDays: sel.Route?.TransitDays || sel.Route?.transitDays || sel.transitDays
                      }))
                    });
                  } else {
                    console.log('[RequestWizard] 🔍 ❌ Aucune sélection Step5 trouvée');
                  }
                  console.log('[RequestWizard] 🔍 === FIN ANALYSE STEP5 ===');
                  
                  return {
                    selectedHaulage: step4Data?.Selection ? {
                      offerId: step4Data.Selection.OfferId || step4Data.Selection.offerId || null,
                      haulierId: step4Data.Selection.HaulierId,
                      haulierName: step4Data.Selection.HaulierName,
                      unitTariff: parseFloat(step4Data.Selection.Tariff?.UnitPrice || '0'),
                      currency: step4Data.Selection.Tariff?.Currency || 'EUR',
                      freeTime: step4Data.Selection.Tariff?.FreeTime || 0
                    } : null,
                    selectedSeafreights: step5Data?.Selections ? step5Data.Selections.map((sel: any) => ({
                      id: sel._id || sel.Id || sel.id || sel.SeafreightId || sel.seafreightId,
                      seaFreightId: sel.SeafreightId || sel.seafreightId || sel._id || sel.Id || sel.id,
                      carrierName: sel.Carrier?.CarrierName || sel.Carrier?.carrierName || sel.carrierName || '',
                      carrierAgentName: sel.Carrier?.AgentName || sel.Carrier?.agentName || sel.agentName || '',
                      departurePort: sel.Route?.DeparturePort || sel.Route?.departurePort || null,
                      destinationPort: sel.Route?.DestinationPort || sel.Route?.destinationPort || null,
                      currency: sel.Charges?.Currency || sel.Charges?.currency || sel.currency || 'EUR',
                      transitTimeDays: sel.Route?.TransitDays || sel.Route?.transitDays || sel.transitDays || 0,
                      frequency: sel.Route?.Frequency || sel.Route?.frequency || sel.frequency || '',
                      defaultContainer: sel.Container?.ContainerType || sel.Container?.containerType || sel.containerType || '',
                      containers: sel.Container ? [sel.Container] : [],
                      comment: sel.Remarks || sel.remarks || sel.comment || '',
                      validUntil: sel.Validity?.EndDate || sel.Validity?.endDate || sel.validUntil || null,
                      pricing: {
                        basePrice: sel.Charges?.BasePrice || sel.Charges?.basePrice || sel.basePrice || 0,
                        total: sel.Charges?.TotalPrice || sel.Charges?.totalPrice || sel.totalPrice || 0,
                        currency: sel.Charges?.Currency || sel.Charges?.currency || sel.currency || 'EUR',
                        surcharges: sel.Charges?.Surcharges || sel.Charges?.surcharges || sel.surcharges || []
                      },
                      baseFreight: sel.Charges?.BasePrice || sel.Charges?.basePrice || sel.basePrice || 0,
                      total: sel.Charges?.TotalPrice || sel.Charges?.totalPrice || sel.totalPrice || 0
                    })) : [],
                    selectedMiscellaneous: step6Data?.Selections ? step6Data.Selections.map((sel: any) => ({
                      id: sel._id || sel.Id || sel.id,
                      serviceName: sel.Service?.ServiceName || sel.Service?.serviceName || sel.serviceName || '',
                      price: parseFloat(sel.Pricing?.UnitPrice || sel.Pricing?.unitPrice || sel.unitPrice || '0')
                    })) : [],
                    haulageTotal: step4Data?.Calculation ? parseFloat(step4Data.Calculation.Subtotal || '0') : 0,
                    seafreightTotal: step5Data?.Summary ? parseFloat(step5Data.Summary.TotalAmount || '0') : 0,
                    miscTotal: step6Data?.Summary ? parseFloat(step6Data.Summary.TotalAmount || '0') : 0,
                    marginType: 'percent',
                    marginValue: 0,
                    totalPrice: 0
                  };
                }
                
                // ✅ PRIORITÉ 2: Fallback vers les options sauvegardées
                const options = draftDataContent.savedOptions || [];
                if (options.length === 0) return { selectedHaulage: null, selectedSeafreights: [], selectedMiscellaneous: [] };
                
                // Chercher l'Option 1 en priorité
                let defaultOption = options.find((option: any) => option.name === 'Option 1' || option.id === 'option_1' || option.name?.includes('Option 1'));
                
                // Si pas d'Option 1, prendre la première option disponible
                if (!defaultOption) {
                  defaultOption = options[0];
                }
                
                console.log('[RequestWizard] Fallback vers l\'option par défaut:', defaultOption.name, {
                  hasHaulage: !!defaultOption.selectedHaulage,
                  hasSeafreights: !!(defaultOption.selectedSeafreights && defaultOption.selectedSeafreights.length > 0),
                  hasMiscellaneous: !!(defaultOption.selectedMiscellaneous && defaultOption.selectedMiscellaneous.length > 0),
                  totalOptions: options.length
                });
                
                return {
                  selectedHaulage: defaultOption.selectedHaulage || null,
                  selectedSeafreights: defaultOption.selectedSeafreights || [],
                  selectedMiscellaneous: defaultOption.selectedMiscellaneous || [],
                  haulageTotal: defaultOption.haulageTotal || null,
                  seafreightTotal: defaultOption.seafreightTotal || null,
                  miscTotal: defaultOption.miscTotal || null,
                  marginType: defaultOption.marginType || 'percent',
                  marginValue: defaultOption.marginValue || 0,
                  totalPrice: defaultOption.totalPrice || 0
                };
              };
              
              const fallbackData = getDefaultOptionData();
              
              // Log détaillé des données seafreight avant la fusion
              console.log('[RequestWizard] === DEBUG SELECTEDSEAFREIGHTS ===');
              console.log('[RequestWizard] draftDataContent.selectedSeafreights:', JSON.stringify(draftDataContent.selectedSeafreights, null, 2));
              console.log('[RequestWizard] draftDataContent.step5?.selectedSeafreights:', JSON.stringify(draftDataContent.step5?.selectedSeafreights, null, 2));
              console.log('[RequestWizard] fallbackData.selectedSeafreights:', JSON.stringify(fallbackData.selectedSeafreights, null, 2));
              
              // ✅ DEBUG DÉTAILLÉ DE LA STRUCTURE MONGODB OPTIMIZEDDRAFTDATA
              console.log('[DEBUG_MAPPING] === ANALYSE STRUCTURE OPTIMIZEDDRAFTDATA ===');
              console.log('[DEBUG_MAPPING] stepsData complet:', JSON.stringify(stepsData, null, 2));
              console.log('[DEBUG_MAPPING] step1:', JSON.stringify(stepsData.Step1 || stepsData.step1, null, 2));
              
              // ✅ PRIORITÉ À LA STRUCTURE MAJUSCULE (MongoDB)
              const step1Raw = stepsData.Step1 || stepsData.step1 || {};
              console.log('[DEBUG_MAPPING] step1Raw (Step1):', step1Raw);
              console.log('[DEBUG_MAPPING] step1Raw.Customer:', step1Raw.Customer);
              console.log('[DEBUG_MAPPING] step1Raw.Route:', step1Raw.Route);
              console.log('[DEBUG_MAPPING] step1Raw.Cargo:', step1Raw.Cargo);
              
              // Récupérer les données de step3 pour les ports (nouvelle structure)
              const step3Raw = stepsData.step3 || stepsData.Step3 || {};
              console.log('[DEBUG_MAPPING] step3Raw pour récupération des ports:', JSON.stringify(step3Raw, null, 2));
              
              // Adapter les données vers la structure attendue par le wizard
              const adaptedStep1 = {
                ...createInitialDraftQuote().step1,
                // Essayer plusieurs variantes de capitalisation
                customer: step1Raw.customer || step1Raw.Customer || null,
                // Récupérer les villes depuis step1 ou step3
                cityFrom: step1Raw.route?.origin?.city || step1Raw.Route?.Origin?.City || 
                          step3Raw.route?.origin?.city || step3Raw.Route?.Origin?.City || null,
                cityTo: step1Raw.route?.destination?.city || step1Raw.Route?.Destination?.City || 
                        step3Raw.route?.destination?.city || step3Raw.Route?.Destination?.City || null,
                // Récupérer les ports depuis step1 ou step3 (priorité au step3 car c'est la nouvelle structure)
                portFrom: step3Raw.route?.origin?.port || step3Raw.Route?.Origin?.Port || 
                          step1Raw.route?.origin?.port || step1Raw.Route?.Origin?.Port || null,
                portTo: step3Raw.route?.destination?.port || step3Raw.Route?.Destination?.Port || 
                        step1Raw.route?.destination?.port || step1Raw.Route?.Destination?.Port || null,
                productName: step1Raw.cargo?.product || step1Raw.Cargo?.Product || null,
                incotermName: step1Raw.cargo?.incoterm || step1Raw.Cargo?.Incoterm || '',
                comment: step1Raw.metadata?.comment || step1Raw.Metadata?.Comment || step1Raw.comment || ''
              };
              
              console.log('[DEBUG_MAPPING] adaptedStep1 résultat:', JSON.stringify(adaptedStep1, null, 2));
              console.log('[DEBUG_MAPPING] Ports récupérés:', {
                portFrom: adaptedStep1.portFrom,
                portTo: adaptedStep1.portTo,
                sourceStep3: !!step3Raw.route,
                sourceStep1: !!step1Raw.route
              });
              
              const step2Raw = stepsData.step2 || stepsData.Step2 || {};
              console.log('[DEBUG_MAPPING] step2Raw:', JSON.stringify(step2Raw, null, 2));
              
              const adaptedStep2 = {
                ...createInitialDraftQuote().step2,
                selected: step2Raw.selectedServices || step2Raw.SelectedServices || []
              };
              
              console.log('[DEBUG_MAPPING] adaptedStep2 résultat:', JSON.stringify(adaptedStep2, null, 2));
              
              // === DEBUG STEP3 (CONTENEURS) ===
              // step3Raw déjà déclaré plus haut pour la récupération des ports
              console.log('[DEBUG_MAPPING] step3Raw conteneurs:', JSON.stringify(step3Raw, null, 2));
              console.log('[DEBUG_MAPPING] step3Raw.containers:', step3Raw.containers);
              console.log('[DEBUG_MAPPING] step3Raw.Containers:', step3Raw.Containers);
              
              const adaptedStep3 = {
                containers: (() => {
                  const containers = step3Raw.containers || step3Raw.Containers || [];
                  if (Array.isArray(containers) && containers.length > 0) {
                    // Convertir les conteneurs MongoDB vers la structure wizard
                    return containers;
                  }
                  return [];
                })(),
                summary: {
                  totalContainers: 0,
                  totalTEU: 0,
                  containerTypes: []
                },
                route: {
                  origin: {
                    city: { name: "", country: "" },
                    port: { portId: 0, portName: "", country: "" }
                  },
                  destination: {
                    city: { name: "", country: "" },
                    port: { portId: 0, portName: "", country: "" }
                  }
                },
                selectedContainers: (() => {
                  const containers = step3Raw.containers || step3Raw.Containers || [];
                  if (Array.isArray(containers) && containers.length > 0) {
                    // Convertir les conteneurs MongoDB vers la structure wizard
                    return { list: containers };
                  }
                  return {};
                })()
              };
              
              // ✅ SIMPLIFICATION : Même pattern que Step4 pour Step5
              console.log('[RequestWizard] 🔄 === CHARGEMENT DIRECT DEPUIS OPTIMIZEDDRAFTDATA ===');
              
              console.log('[DEBUG_MAPPING] adaptedStep3 résultat:', JSON.stringify(adaptedStep3, null, 2));

              // ✅ Mettre à jour les états principaux avec requestQuoteId obligatoire
              setDraftQuote(prev => ({
                ...prev, // ✅ Conserver toutes les propriétés existantes
                id: draftIdFromUrl, // IMPORTANT: Ajouter l'ID du brouillon
                step1: adaptedStep1,
                step2: adaptedStep2,
                step3: adaptedStep3,
                savedOptions: draftDataContent.savedOptions || [],
                
                // ✅ RÉCUPÉRER DEPUIS OPTIMIZEDDRAFTDATA.STEPS.STEP4
                selectedHaulage: (() => {
                  // Priorité 1: OptimizedDraftData.Steps.Step4
                  const step4Data = stepsData.Step4 || stepsData.step4;
                  if (step4Data?.Selection) {
                    console.log('[DRAFT_LOAD] Step4 data trouvé dans OptimizedDraftData:', step4Data.Selection);
                    
                    // Transformer les données OptimizedDraftData vers le format attendu par Step4HaulierSelection
                    const transformedHaulage = {
                      offerId: step4Data.Selection.OfferId || step4Data.Selection.offerId || null,
                      haulierId: step4Data.Selection.HaulierId || step4Data.Selection.haulierId || 0,
                      haulierName: step4Data.Selection.HaulierName || step4Data.Selection.haulierName || '',
                      unitTariff: parseFloat(step4Data.Selection.Tariff?.UnitPrice || step4Data.Selection.Tariff?.unitPrice || '0'),
                      currency: step4Data.Selection.Tariff?.Currency || step4Data.Selection.Tariff?.currency || 'EUR',
                      freeTime: step4Data.Selection.Tariff?.FreeTime || step4Data.Selection.Tariff?.freeTime || 0,
                      pickupLocation: {
                        displayName: step4Data.Selection.Route?.Pickup?.City || step4Data.Selection.Route?.pickup?.city || '',
                        city: step4Data.Selection.Route?.Pickup?.City || step4Data.Selection.Route?.pickup?.city || '',
                        country: step4Data.Selection.Route?.Pickup?.Country || step4Data.Selection.Route?.pickup?.country || ''
                      },
                      deliveryLocation: {
                        displayName: step4Data.Selection.Route?.Delivery?.PortName || step4Data.Selection.Route?.delivery?.portName || '',
                        portName: step4Data.Selection.Route?.Delivery?.PortName || step4Data.Selection.Route?.delivery?.portName || '',
                        portId: step4Data.Selection.Route?.Delivery?.PortId || step4Data.Selection.Route?.delivery?.portId || 0,
                        country: step4Data.Selection.Route?.Delivery?.Country || step4Data.Selection.Route?.delivery?.country || ''
                      },
                      validUntil: step4Data.Selection.Validity?.ValidUntil || step4Data.Selection.Validity?.validUntil || new Date().toISOString(),
                      // Calculer le total haulage si disponible
                      haulageTotal: step4Data.Calculation ? parseFloat(step4Data.Calculation.Subtotal || '0') : 0
                    };
                    
                    console.log('[DRAFT_LOAD] Haulage transformé depuis OptimizedDraftData:', transformedHaulage);
                    return transformedHaulage;
                  }
                  
                  // Priorité 2: Fallback vers les anciennes sources
                  const fallbackHaulage = (stepsData.step4 || stepsData.Step4)?.selection || (stepsData.step4 || stepsData.Step4)?.Selection || fallbackData.selectedHaulage;
                  console.log('[DRAFT_LOAD] Fallback haulage utilisé:', fallbackHaulage);
                  return fallbackHaulage;
                })(),
                selectedSeafreights: (() => {
                  // ✅ RÉCUPÉRER DEPUIS OPTIMIZEDDRAFTDATA.STEPS.STEP5 (MULTIPLES SÉLECTIONS)
                  const step5Data = stepsData.Step5 || stepsData.step5;
                  if (step5Data?.Selections && Array.isArray(step5Data.Selections)) {
                    console.log('[DRAFT_LOAD] Step5 data trouvé dans OptimizedDraftData:', {
                      count: step5Data.Selections.length,
                      selections: step5Data.Selections.map((sel: any) => ({
                        id: sel._id || sel.Id || sel.id,
                        seafreightId: sel.SeafreightId || sel.seafreightId,
                        carrierName: sel.Carrier?.CarrierName || sel.Carrier?.carrierName || sel.carrierName
                      }))
                    });
                    
                    // ✅ TRANSFORMER CHAQUE SÉLECTION (SUPPORT MULTIPLES)
                    const transformedSeafreights = step5Data.Selections.map((sel: any) => ({
                      id: sel._id || sel.Id || sel.id || sel.SeafreightId || sel.seafreightId,
                      seaFreightId: sel.SeafreightId || sel.seafreightId || sel._id || sel.Id || sel.id,
                      carrierName: sel.Carrier?.CarrierName || sel.Carrier?.carrierName || sel.carrierName || '',
                      carrierAgentName: sel.Carrier?.AgentName || sel.Carrier?.agentName || sel.agentName || '',
                      departurePort: sel.Route?.DeparturePort || sel.Route?.departurePort || null,
                      destinationPort: sel.Route?.DestinationPort || sel.Route?.destinationPort || null,
                      currency: sel.Charges?.Currency || sel.Charges?.currency || sel.currency || 'EUR',
                      transitTimeDays: sel.Route?.TransitDays || sel.Route?.transitDays || sel.transitDays || 0,
                      frequency: sel.Route?.Frequency || sel.Route?.frequency || sel.frequency || '',
                      defaultContainer: sel.Container?.ContainerType || sel.Container?.containerType || sel.containerType || '',
                      containers: sel.Container ? [sel.Container] : [],
                      comment: sel.Remarks || sel.remarks || sel.comment || '',
                      validUntil: sel.Validity?.EndDate || sel.Validity?.endDate || sel.validUntil || null,
                      pricing: {
                        basePrice: sel.Charges?.BasePrice || sel.Charges?.basePrice || sel.basePrice || 0,
                        total: sel.Charges?.TotalPrice || sel.Charges?.totalPrice || sel.totalPrice || 0,
                        currency: sel.Charges?.Currency || sel.Charges?.currency || sel.currency || 'EUR',
                        surcharges: sel.Charges?.Surcharges || sel.Charges?.surcharges || sel.surcharges || []
                      },
                      baseFreight: sel.Charges?.BasePrice || sel.Charges?.basePrice || sel.basePrice || 0,
                      total: sel.Charges?.TotalPrice || sel.Charges?.totalPrice || sel.totalPrice || 0
                    }));
                    
                    console.log('[DRAFT_LOAD] ✅ Seafreights transformés depuis OptimizedDraftData:', {
                      count: transformedSeafreights.length,
                      seafreights: transformedSeafreights.map((sf: any) => ({
                        id: sf.id,
                        seaFreightId: sf.seaFreightId,
                        carrierName: sf.carrierName,
                        total: sf.total
                      })),
                      message: `✅ ${transformedSeafreights.length} sélection(s) chargée(s) avec succès`
                    });
                    return transformedSeafreights;
                  }
                  
                  // ✅ GESTION DES CAS SPÉCIAUX
                  if (step5Data?.Selections && !Array.isArray(step5Data.Selections)) {
                    console.log('[DRAFT_LOAD] ⚠️ Step5.Selections n\'est pas un tableau:', typeof step5Data.Selections);
                  }
                  
                  if (!step5Data?.Selections) {
                    console.log('[DRAFT_LOAD] ℹ️ Aucune sélection Step5 trouvée dans OptimizedDraftData');
                  }
                  
                  // Priorité 2: Fallback vers les anciennes sources
                  const fallbackSeafreights = (stepsData.step5 || stepsData.Step5)?.selections || (stepsData.step5 || stepsData.Step5)?.Selections || fallbackData.selectedSeafreights;
                  console.log('[DRAFT_LOAD] Fallback seafreights utilisé:', {
                    count: fallbackSeafreights?.length || 0,
                    source: 'fallback',
                    data: fallbackSeafreights
                  });
                  return fallbackSeafreights || [];
                })(),
                selectedMiscellaneous: (() => {
                  // ✅ RÉCUPÉRER DEPUIS OPTIMIZEDDRAFTDATA.STEPS.STEP6 (MULTIPLES SÉLECTIONS)
                  const step6Data = stepsData.Step6 || stepsData.step6;
                  if (step6Data?.selections && Array.isArray(step6Data.selections)) {
                    console.log('[DRAFT_LOAD] Step6 data trouvé dans OptimizedDraftData:', {
                      count: step6Data.selections.length,
                      selections: step6Data.selections.map((sel: any) => ({
                        id: sel.id,
                        serviceId: sel.service?.serviceId || sel.serviceId,
                        serviceName: sel.service?.serviceName || sel.serviceName,
                        supplierName: sel.supplier?.supplierName || sel.serviceProviderName
                      }))
                    });

                    // ✅ TRANSFORMER CHAQUE SÉLECTION (SUPPORT MULTIPLES)
                    const transformedMiscellaneous = step6Data.selections.map((sel: any) => ({
                      id: sel.id || `misc-${sel.service?.serviceId || sel.serviceId}`,
                      serviceId: sel.service?.serviceId || sel.serviceId || 0,
                      serviceName: sel.service?.serviceName || sel.serviceName || '',
                      serviceProviderName: sel.supplier?.supplierName || sel.serviceProviderName || '',
                      supplierName: sel.supplier?.supplierName || sel.serviceProviderName || '',
                      price: sel.pricing?.unitPrice || sel.pricing?.basePrice || 0,
                      currency: sel.pricing?.currency || 'EUR',
                      quantity: sel.pricing?.quantity || 1,
                      subtotal: sel.pricing?.subtotal || 0,
                      category: sel.service?.category || '',
                      validUntil: sel.validity?.validUntil || null,
                      remarks: sel.remarks || '',
                      isSelected: sel.isSelected || true,
                      selectedAt: sel.selectedAt || new Date(),
                      // Ajouter les informations de pricing formatées
                      pricing: {
                        basePrice: sel.pricing?.unitPrice || sel.pricing?.basePrice || 0,
                        currency: sel.pricing?.currency || 'EUR',
                        quantity: sel.pricing?.quantity || 1,
                        total: sel.pricing?.subtotal || 0
                      }
                    }));

                    console.log('[DRAFT_LOAD] ✅ Miscellaneous transformés depuis OptimizedDraftData:', {
                      count: transformedMiscellaneous.length,
                      miscellaneous: transformedMiscellaneous.map((misc: any) => ({
                        id: misc.id,
                        serviceId: misc.serviceId,
                        serviceName: misc.serviceName,
                        supplierName: misc.supplierName,
                        price: misc.price
                      })),
                      message: `✅ ${transformedMiscellaneous.length} sélection(s) miscellaneous chargée(s) avec succès`
                    });
                    return transformedMiscellaneous;
                  }

                  // ✅ GESTION DES CAS SPÉCIAUX
                  if (step6Data?.selections && !Array.isArray(step6Data.selections)) {
                    console.log('[DRAFT_LOAD] ⚠️ Step6.selections n\'est pas un tableau:', typeof step6Data.selections);
                  }

                  if (!step6Data?.selections) {
                    console.log('[DRAFT_LOAD] ℹ️ Aucune sélection Step6 trouvée dans OptimizedDraftData');
                  }

                  // Priorité 2: Fallback vers les anciennes sources
                  const fallbackMiscellaneous = (stepsData.step6 || stepsData.Step6)?.selections || (stepsData.step6 || stepsData.Step6)?.Selections || fallbackData.selectedMiscellaneous;
                  console.log('[DRAFT_LOAD] Fallback miscellaneous utilisé:', {
                    count: fallbackMiscellaneous?.length || 0,
                    source: 'fallback',
                    data: fallbackMiscellaneous
                  });
                  return fallbackMiscellaneous || [];
                })(),
                
                selectedContainers: draftDataContent.selectedContainers || {},
                marginType: draftDataContent.marginType || fallbackData.marginType,
                marginValue: draftDataContent.marginValue || fallbackData.marginValue,
                totalPrice: draftDataContent.totalPrice || fallbackData.totalPrice,
                seafreightTotal: draftDataContent.seafreightTotal || fallbackData.seafreightTotal,
                haulageTotal: draftDataContent.haulageTotal || fallbackData.haulageTotal,
                miscTotal: draftDataContent.miscTotal || fallbackData.miscTotal,
                
                // ✅ MISE À JOUR DE STEP5 AVEC LES DONNÉES DIRECTES (SUPPORT MULTIPLES SÉLECTIONS)
                step5: (() => {
                  const step5Data = stepsData.Step5 || stepsData.step5;
                  if (step5Data?.Selections && Array.isArray(step5Data.Selections)) {
                    console.log('[DRAFT_LOAD] ✅ Construction de step5 avec', step5Data.Selections.length, 'sélection(s)');
                    
                    return {
                      selections: step5Data.Selections.map((sel: any) => ({
                        id: sel._id || sel.Id || sel.id || sel.SeafreightId || sel.seafreightId,
                        seafreightId: sel.SeafreightId || sel.seafreightId || sel._id || sel.Id || sel.id,
                        carrier: {
                          name: sel.Carrier?.CarrierName || sel.Carrier?.carrierName || sel.carrierName || '',
                          agentName: sel.Carrier?.AgentName || sel.Carrier?.agentName || sel.agentName || ''
                        },
                        route: {
                          departurePort: sel.Route?.DeparturePort || sel.Route?.departurePort || null,
                          destinationPort: sel.Route?.DestinationPort || sel.Route?.destinationPort || null,
                          transitDays: sel.Route?.TransitDays || sel.Route?.transitDays || sel.transitDays || 0,
                          frequency: sel.Route?.Frequency || sel.Route?.frequency || sel.frequency || ''
                        },
                        container: {
                          containerType: sel.Container?.ContainerType || sel.Container?.containerType || sel.containerType || '',
                          isReefer: sel.Container?.IsReefer || sel.Container?.isReefer || false,
                          quantity: sel.Container?.Quantity || sel.Container?.quantity || 1,
                          volumeM3: sel.Container?.VolumeM3 || sel.Container?.volumeM3 || 0,
                          weightKg: sel.Container?.WeightKg || sel.Container?.weightKg || 0,
                          unitPrice: sel.Container?.UnitPrice || sel.Container?.unitPrice || 0,
                          subtotal: sel.Container?.Subtotal || sel.Container?.subtotal || 0
                        },
                        charges: {
                          basePrice: sel.Charges?.BasePrice || sel.Charges?.basePrice || sel.basePrice || 0,
                          currency: sel.Charges?.Currency || sel.Charges?.currency || sel.currency || 'EUR',
                          surcharges: sel.Charges?.Surcharges || sel.Charges?.surcharges || sel.surcharges || [],
                          totalPrice: sel.Charges?.TotalPrice || sel.Charges?.totalPrice || sel.totalPrice || 0
                        },
                        service: {
                          deliveryTerms: sel.Service?.DeliveryTerms || sel.Service?.deliveryTerms || '',
                          createdBy: sel.Service?.CreatedBy || sel.Service?.createdBy || '',
                          createdDate: sel.Service?.CreatedDate || sel.Service?.createdDate || new Date()
                        },
                        validity: {
                          startDate: sel.Validity?.StartDate || sel.Validity?.startDate || new Date(),
                          endDate: sel.Validity?.EndDate || sel.Validity?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        },
                        remarks: sel.Remarks || sel.remarks || sel.comment || '',
                        isSelected: sel.IsSelected || sel.isSelected || true,
                        selectedAt: sel.SelectedAt || sel.selectedAt || new Date()
                      })),
                      summary: {
                        totalSelections: step5Data.Selections.length,
                        totalContainers: step5Data.Selections.length,
                        totalAmount: step5Data.Summary?.TotalAmount || 0,
                        currency: 'EUR',
                        selectedCarriers: step5Data.Selections.map((s: any) => s.Carrier?.CarrierName || s.Carrier?.carrierName || s.carrierName || '').filter(Boolean),
                        containerTypes: step5Data.Selections.map((s: any) => s.Container?.ContainerType || s.Container?.containerType || s.containerType || '').filter(Boolean),
                        preferredSelectionId: step5Data.Selections[0]?.id || ''
                      }
                    };
                  }
                  
                  // ✅ GESTION DES CAS SPÉCIAUX
                  if (step5Data?.Selections && !Array.isArray(step5Data.Selections)) {
                    console.log('[DRAFT_LOAD] ⚠️ Step5.Selections n\'est pas un tableau pour step5:', typeof step5Data.Selections);
                  }
                  
                  if (!step5Data?.Selections) {
                    console.log('[DRAFT_LOAD] ℹ️ Aucune sélection Step5 trouvée pour step5');
                  }
                  
                  // Fallback vers la structure par défaut
                  console.log('[DRAFT_LOAD] 🔄 Utilisation de la structure par défaut pour step5');
                  return {
                    selections: [],
                    summary: {
                      totalSelections: 0,
                      totalContainers: 0,
                      totalAmount: 0,
                      currency: 'EUR',
                      selectedCarriers: [],
                      containerTypes: [],
                      preferredSelectionId: ''
                    }
                  };
                })(),
                
                // ✅ MISE À JOUR DE STEP6 AVEC LES DONNÉES DIRECTES (SUPPORT MULTIPLES SÉLECTIONS)
                step6: (() => {
                  const step6Data = stepsData.Step6 || stepsData.step6;
                  if (step6Data?.selections && Array.isArray(step6Data.selections)) {
                    console.log('[DRAFT_LOAD] ✅ Construction de step6 avec', step6Data.selections.length, 'sélection(s)');

                    return {
                      selections: step6Data.selections.map((sel: any) => ({
                        id: sel.id || `misc-${sel.service?.serviceId || sel.serviceId}`,
                        service: {
                          serviceId: sel.service?.serviceId || sel.serviceId || 0,
                          serviceName: sel.service?.serviceName || sel.serviceName || '',
                          category: sel.service?.category || sel.category || ''
                        },
                        supplier: {
                          supplierName: sel.supplier?.supplierName || sel.serviceProviderName || ''
                        },
                        pricing: {
                          unitPrice: sel.pricing?.unitPrice || sel.pricing?.basePrice || 0,
                          quantity: sel.pricing?.quantity || 1,
                          subtotal: sel.pricing?.subtotal || 0,
                          currency: sel.pricing?.currency || 'EUR'
                        },
                        validity: {
                          validUntil: sel.validity?.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                        },
                        remarks: sel.remarks || '',
                        isSelected: sel.isSelected || true,
                        selectedAt: sel.selectedAt || new Date()
                      })),
                      summary: {
                        totalSelections: step6Data.selections.length,
                        totalAmount: step6Data.Summary?.TotalAmount || 0,
                        currency: 'EUR',
                        categories: step6Data.selections.map((s: any) => s.service?.category || s.category || '').filter(Boolean)
                      }
                    };
                  }

                  // ✅ GESTION DES CAS SPÉCIAUX
                  if (step6Data?.selections && !Array.isArray(step6Data.selections)) {
                    console.log('[DRAFT_LOAD] ⚠️ Step6.selections n\'est pas un tableau pour step6:', typeof step6Data.selections);
                  }

                  if (!step6Data?.selections) {
                    console.log('[DRAFT_LOAD] ℹ️ Aucune sélection Step6 trouvée pour step6');
                  }

                  // Fallback vers la structure par défaut
                  console.log('[DRAFT_LOAD] 🔄 Utilisation de la structure par défaut pour step6');
                  return {
                    selections: [],
                    summary: {
                      totalSelections: 0,
                      totalAmount: 0,
                      currency: 'EUR',
                      categories: []
                    }
                  };
                })(),
                totalTEU: (() => {
                  // ✅ PRIORITÉ 1: Utiliser la valeur depuis OptimizedDraftData.Totals
                  if (totalsData?.TotalTEU) {
                    console.log('[DRAFT_LOAD] TotalTEU depuis OptimizedDraftData.Totals:', totalsData.TotalTEU);
                    return parseFloat(totalsData.TotalTEU);
                  }
                  
                  // ✅ PRIORITÉ 2: Utiliser la valeur sauvegardée si disponible
                  if (draftDataContent.totalTEU) {
                    console.log('[DRAFT_LOAD] TotalTEU depuis draftDataContent.totalTEU:', draftDataContent.totalTEU);
                    return draftDataContent.totalTEU;
                  }
                  
                  // ✅ PRIORITÉ 3: Calculer à partir des conteneurs du step3
                  const step3Data = stepsData.Step3 || stepsData.step3 || {};
                  const containers = step3Data.Containers || step3Data.containers || [];
                  
                  if (Array.isArray(containers) && containers.length > 0) {
                    const calculatedTEU = containers.reduce((total: number, container: any) => {
                      const containerType = container.Type || container.type || container.containerType || '';
                      const quantity = container.Quantity || container.quantity || 1;
                      const teuPerContainer = getTEU(containerType);
                      return total + (teuPerContainer * quantity);
                    }, 0);
                    
                    console.log('[DRAFT_LOAD] Calcul totalTEU depuis conteneurs step3:', {
                      containers: containers,
                      calculatedTEU: calculatedTEU,
                      source: 'Step3.Containers'
                    });
                    
                    return calculatedTEU;
                  }
                  
                  console.log('[DRAFT_LOAD] Aucun totalTEU trouvé, valeur par défaut: 0');
                  return 0;
                })(),
                haulageQuantity: draftDataContent.haulageQuantity,
                seafreightQuantities: draftDataContent.seafreightQuantities || {},
                miscQuantities: draftDataContent.miscQuantities || {},
                surchargeQuantities: draftDataContent.surchargeQuantities || {}
              }));
              
              // Initialiser currentlySelectedMiscellaneous avec les données chargées
              const finalSelectedMisc = draftDataContent.selectedMiscellaneous || draftDataContent.step6?.selectedMiscellaneous || fallbackData.selectedMiscellaneous;
              if (finalSelectedMisc && finalSelectedMisc.length > 0) {
                console.log('[DRAFT_LOAD] Initialisation de currentlySelectedMiscellaneous avec les données du brouillon:', {
                  count: finalSelectedMisc.length,
                  services: finalSelectedMisc.map((m: any) => ({ id: m.id, serviceName: m.serviceName }))
                });
                setCurrentlySelectedMiscellaneous(finalSelectedMisc);
              }
              
              console.log('[RequestWizard] Données des étapes 4-7 chargées:', {
                selectedHaulage: draftDataContent.selectedHaulage || draftDataContent.step4?.selectedHaulage || fallbackData.selectedHaulage,
                selectedSeafreights: (draftDataContent.selectedSeafreights || draftDataContent.step5?.selectedSeafreights || fallbackData.selectedSeafreights || []).length,
                selectedMiscellaneous: (draftDataContent.selectedMiscellaneous || draftDataContent.step6?.selectedMiscellaneous || fallbackData.selectedMiscellaneous || []).length,
                savedOptions: (draftDataContent.savedOptions || []).length,
                defaultOptionUsed: {
                  haulage: !!(fallbackData.selectedHaulage && !draftDataContent.selectedHaulage),
                  seafreights: !!(fallbackData.selectedSeafreights.length > 0 && (!draftDataContent.selectedSeafreights || draftDataContent.selectedSeafreights.length === 0)),
                  miscellaneous: !!(fallbackData.selectedMiscellaneous.length > 0 && (!draftDataContent.selectedMiscellaneous || draftDataContent.selectedMiscellaneous.length === 0))
                }
              });
              
              // === LOGS DÉTAILLÉS POUR STEP2 ===
              console.log('[RequestWizard] === DEBUG STEP2 ===');
              console.log('[RequestWizard] draftDataContent.step2:', JSON.stringify(draftDataContent.step2, null, 2));
              console.log('[RequestWizard] draftDataContent.step2?.selected:', JSON.stringify(draftDataContent.step2?.selected, null, 2));
              console.log('[RequestWizard] draftDataContent.step2?.selected?.length:', draftDataContent.step2?.selected?.length || 0);
              console.log('[RequestWizard] createInitialDraftQuote.step2:', JSON.stringify(createInitialDraftQuote().step2, null, 2));
              console.log('[RequestWizard] === FIN DEBUG STEP2 ===');
              
              // Log du résultat final de la fusion step2
              const finalStep2 = { 
                ...createInitialDraftQuote().step2, 
                ...draftDataContent.step2,
                selected: draftDataContent.step2?.selected || createInitialDraftQuote().step2.selected
              };
              console.log('[RequestWizard] step2 final après fusion:', JSON.stringify(finalStep2, null, 2));
              
              setSavedOptions(draftDataContent.savedOptions || []);
              

              console.log('[RequestWizard] Option par défaut sélectionnée: Option 1 (index 0)');
              
              // IMPORTANT : Mettre à jour requestId et requestData pour les conditions de rendu
              if (draftDataContent.requestId) {
                setRequestId(draftDataContent.requestId);
              }
              if (draftDataContent.requestData) {
                setRequestData(draftDataContent.requestData);
              }
              
              console.log('[RequestWizard] Mise à jour des variables de rendu:', {
                requestId: draftDataContent.requestId,
                hasRequestData: !!draftDataContent.requestData
              });
              
              // IMPORTANT : Mettre à jour aussi les états locaux pour les composants enfants
              console.log('[RequestWizard] Mise à jour des états locaux avec adaptedStep1:', {
                customer: adaptedStep1.customer,
                cityFrom: adaptedStep1.cityFrom,
                cityTo: adaptedStep1.cityTo,
                productName: adaptedStep1.productName,
                incotermName: adaptedStep1.incotermName,
                status: adaptedStep1.status,
                assignee: adaptedStep1.assignee,
                comment: adaptedStep1.comment
              });
              
              // États supprimés - données maintenant dans draftQuote
              
              // Marquer le draft comme chargé
              setIsDraftLoaded(true);
              setIsLoadingRequestData(false); // S'assurer que le loading est désactivé
              
              console.log('[RequestWizard] Navigation vers l\'étape:', targetStep);
              
              // Vérifier les états locaux après mise à jour
              setTimeout(() => {
                console.log('[RequestWizard] Vérification des états après chargement:', {
                  customer: draftQuote.step1?.customer,
                  cityFrom: draftQuote.step1?.cityFrom,
                  cityTo: draftQuote.step1?.cityTo,
                  productName: draftQuote.step1?.productName,
                  incotermName: draftQuote.step1?.incotermName,
                  status: draftQuote.step1?.status,
                  assignee: draftQuote.step1?.assignee,
                  comment: draftQuote.step1?.comment,
                  currentStep,
                  activeStep,
                  savedOptions: savedOptions.length
                });
              }, 100);
              
              // Mettre à jour l'URL avec le draftId
              window.history.replaceState(null, '', `?draftId=${draftIdFromUrl}`);
            } else {
              console.log('[RequestWizard] Aucun draft trouvé pour l\'ID:', draftIdFromUrl);
              
              // Si on a un requestId dans l'URL, essayer de charger les données de la demande
              const urlParams = new URLSearchParams(location.search);
              const requestIdFromUrl = urlParams.get('requestId');
              
              if (requestIdFromUrl) {
                console.log('[RequestWizard] Tentative de chargement des données de la demande:', requestIdFromUrl);
                try {
                  await loadRequestData(requestIdFromUrl);
                  showSnackbar('Données de la demande chargées (aucun brouillon trouvé)', 'success');
                } catch (loadError) {
                  console.error('[RequestWizard] Erreur lors du chargement des données de la demande:', loadError);
                  showSnackbar('Erreur lors du chargement des données de la demande', 'warning');
                }
              } else {
                showSnackbar('Aucun brouillon trouvé', 'warning');
              }
            }
          } catch (error) {
            console.error('[RequestWizard] Erreur lors du chargement du draft:', error);
            setIsLoadingRequestData(false); // S'assurer que le loading est désactivé même en cas d'erreur
            
            // En cas d'erreur, essayer de charger les données de la demande si disponible
            const urlParams = new URLSearchParams(location.search);
            const requestIdFromUrl = urlParams.get('requestId');
            
            if (requestIdFromUrl) {
              console.log('[RequestWizard] Tentative de récupération via données de la demande:', requestIdFromUrl);
              try {
                await loadRequestData(requestIdFromUrl);
                showSnackbar('Données de la demande chargées (erreur brouillon)', 'success');
              } catch (loadError) {
                console.error('[RequestWizard] Erreur lors du chargement des données de la demande:', loadError);
                showSnackbar('Erreur lors du chargement des données', 'warning');
                setIsLoadingRequestData(false); // S'assurer que le loading est désactivé
              }
            } else {
              showSnackbar('Erreur lors du chargement du brouillon', 'warning');
            }
          }
        }
        // Sinon, si on a un requestId dans l'URL, vérifier s'il existe déjà un draft
        else if (requestIdFromUrl && account?.username) {
          // Vérifier s'il existe déjà un draft pour ce requestId
          const existingDraft = await checkForExistingDraft(requestIdFromUrl, account.username, debugLog);
          
          if (existingDraft) {
            window.history.replaceState(null, '', `?draftId=${existingDraft.id}`);
            // Recharger la page pour utiliser le draft existant
            window.location.reload();
            return;
          }
          
          await loadRequestData(requestIdFromUrl);
          
          // Mettre à jour l'URL avec le requestId
          window.history.replaceState(null, '', `?requestId=${requestIdFromUrl}`);
        }
        // Sinon, initialiser avec des données vides
        else {
                  setDraftQuote(createInitialDraftQuote());
          setCurrentStep(1);
          setActiveStep(1);
          setSavedOptions([]);
        }
      } catch (error) {
        console.error('[RequestWizard] Erreur lors du chargement du draft:', error);
        // En cas d'erreur, initialiser avec des données vides
        setDraftQuote(createInitialDraftQuote());
        setCurrentStep(1);
        setActiveStep(1);
        setSavedOptions([]);
      }
    };
    
    loadInitialData();
  }, [location.search, account?.username]);

  // === NOUVEAU : FONCTION POUR CHARGER LES DONNÉES DE LA DEMANDE ===
  const loadRequestData = async (requestIdToLoad: string) => {
    setIsLoadingRequestData(true);
    setRequestDataError(null);
    
    try {
      console.log('[RequestWizard] Chargement des données pour la demande:', requestIdToLoad);
      
      const response = await getApiRequestById({ path: { id: requestIdToLoad } });
      
      if (response && response.data) {
        console.log('[RequestWizard] Données de la demande récupérées:', response.data);
        
        // Stocker les données de la demande
        setRequestData(response.data);
        setRequestId(requestIdToLoad);
        
        // Pré-remplir le wizard avec les données de la demande
        const request = response.data;
        
                 // Mettre à jour le state du wizard avec les données de la demande
         setDraftQuote((prevState) => ({
           ...prevState,
           step1: {
             ...prevState.step1,
             customer: request.customerId ? { contactId: request.customerId, contactName: request.companyName } : undefined,
             cityFrom: request.pickupLocation?.city ? { 
               cityName: request.pickupLocation.city, 
               name: request.pickupLocation.city,
               country: request.pickupLocation.country || ''
             } : undefined,
             cityTo: request.deliveryLocation?.city ? { 
               cityName: request.deliveryLocation.city, 
               name: request.deliveryLocation.city,
               country: request.deliveryLocation.country || ''
             } : undefined,
             productName: request.productId ? { productId: request.productId, productName: request.productName } : undefined,
             status: (request.status as StatusRequest) || 'NEW',
             assignee: request.assigneeId ? String(request.assigneeId) : '',
             comment: request.additionalComments || '',
             incotermName: request.incoterm || '',
             portFrom: request.pickupLocation,
             portTo: request.deliveryLocation,
             pickupLocation: request.pickupLocation,
             deliveryLocation: request.deliveryLocation,
           }
         }));
        
        // Pré-remplir les états individuels
        // setCustomer supprimé - données dans draftQuote
        // setCityFrom supprimé - données dans draftQuote
        // setCityTo supprimé - données dans draftQuote
        if (request.productId) {
          // setProductName supprimé - données dans draftQuote
        }
        // setStatus, setAssignee, setComment, setIncotermName supprimés - données dans draftQuote
        
        // Passer directement à l'étape 0 si on a des données
        setActiveStep(0);
        
        showSnackbar('Données de la demande chargées avec succès', 'success');
      } else {
        throw new Error('Aucune donnée reçue de l\'API');
      }
    } catch (error) {
      console.error('[RequestWizard] Erreur lors du chargement des données:', error);
      
      // Gestion d'erreur améliorée pour le chargement
      let errorMessage = 'Erreur lors du chargement des données de la demande';
      
      if (error instanceof Error) {
        if (error.message.includes('404') || error.message.includes('Not Found')) {
          errorMessage = 'Demande introuvable. Vérifiez l\'identifiant de la demande.';
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorMessage = 'Vous n\'avez pas les permissions pour accéder à cette demande.';
        } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
          errorMessage = 'Erreur serveur lors du chargement. Veuillez réessayer plus tard.';
        } else if (error.message.includes('Network Error') || error.message.includes('fetch')) {
          errorMessage = 'Problème de connexion. Vérifiez votre connexion internet.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Délai d\'attente dépassé lors du chargement.';
        } else {
          errorMessage = error.message || 'Erreur lors du chargement des données de la demande';
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      setRequestDataError(errorMessage);
      showSnackbar(errorMessage, 'warning');
      
      // Log détaillé pour le debug
      console.error('[RequestWizard] Détails de l\'erreur de chargement:', {
        message: errorMessage,
        originalError: error,
        timestamp: new Date().toISOString(),
        requestId: requestIdToLoad
      });
    } finally {
      setIsLoadingRequestData(false);
    }
  };

  // === NOUVELLES FONCTIONS POUR LA SAUVEGARDE AUTOMATIQUE ===
  // Ces fonctions seront définies après les déclarations des états

  // === NOUVEAU : USEFFECT POUR DÉTECTER ET CHARGER LES DONNÉES ===
  useEffect(() => {
    console.log('[RequestWizard] useEffect de chargement initial - isDraftLoaded:', isDraftLoaded);
    
    // Vérifier s'il y a un draftId dans l'URL - si oui, ne pas exécuter ce useEffect
    const urlParams = new URLSearchParams(location.search);
    const hasDraftId = urlParams.get('loadDraft') || urlParams.get('draftId');
    
    if (hasDraftId) {
      console.log('[RequestWizard] DraftId détecté dans l\'URL, skip du useEffect de chargement initial');
      return;
    }
    
    // Ne pas exécuter si on a déjà chargé un draft
    if (isDraftLoaded) {
      console.log('[RequestWizard] Draft déjà chargé, skip du useEffect de chargement initial');
      return;
    }
    
    // === DONNÉES PRÉSERVÉES POUR NOUVELLE OPTION ===
    // localStorage retiré - données récupérées depuis le serveur uniquement
    
    // Déterminer l'ID de la demande à charger
    let requestIdToLoad: string | null = null;
    
    // 1. Priorité à l'ID dans l'URL (si on vient d'une URL directe)
    if (urlRequestId) {
      requestIdToLoad = urlRequestId;
      console.log('[RequestWizard] ID de demande détecté dans l\'URL:', urlRequestId);
    }
    // 2. Sinon, vérifier si on a des données dans location.state (magic wand)
    else if (location.state?.requestData?.requestQuoteId) {
      requestIdToLoad = location.state.requestData.requestQuoteId;
      console.log('[RequestWizard] ID de demande détecté dans location.state:', location.state.requestData.requestQuoteId);
      
      // Si on a déjà les données complètes dans location.state, les utiliser directement
      if (location.state.requestData) {
        console.log('[RequestWizard] Utilisation des données de location.state');
        setRequestData(location.state.requestData);
        setRequestId(location.state.requestData.requestQuoteId);
        
        // Pré-remplir le wizard avec les données existantes
        const request = location.state.requestData;
        setDraftQuote(prev => ({
          ...prev,
          step1: {
            ...prev.step1,
            customer: request.customerId ? { contactId: request.customerId, contactName: request.companyName } : undefined,
            cityFrom: (request.pickupLocation?.city || request.pickupCity) ? { 
              cityName: request.pickupLocation?.city || request.pickupCity, 
              name: request.pickupLocation?.city || request.pickupCity,
              country: request.pickupLocation?.country || request.pickupCountry || ''
            } : undefined,
            cityTo: (request.deliveryLocation?.city || request.deliveryCity) ? { 
              cityName: request.deliveryLocation?.city || request.deliveryCity, 
              name: request.deliveryLocation?.city || request.deliveryCity,
              country: request.deliveryLocation?.country || request.deliveryCountry || ''
            } : undefined,
            productName: request.productId ? { productId: request.productId, productName: request.productName } : undefined,
            status: request.status || 'NEW',
            assignee: request.assigneeId || request.assignee || '',
            comment: request.additionalComments || '',
            incotermName: request.incoterm || '',
            portFrom: request.pickupLocation,
            portTo: request.deliveryLocation,
            pickupLocation: request.pickupLocation,
            deliveryLocation: request.deliveryLocation,
          }
        }));
        
        // Pré-remplir les états individuels
        // setCustomer supprimé - données dans draftQuote
        // États individuels supprimés - données maintenant dans draftQuote
        
        // Passer directement à l'étape 0
        setActiveStep(0);
        return; // Ne pas faire d'appel API si on a déjà les données
      }
    }
    
    // 3. Si on a un ID à charger, faire l'appel API
    if (requestIdToLoad) {
      loadRequestData(requestIdToLoad);
    } else {
      console.log('[RequestWizard] Aucun ID de demande détecté, mode création d\'une nouvelle demande');
    }
  }, [urlRequestId, location.state, isDraftLoaded]);

  // Surveiller les changements de isDraftLoaded
  useEffect(() => {
    console.log('[RequestWizard] isDraftLoaded changé:', isDraftLoaded);
  }, [isDraftLoaded]);

  // Supprime les useState et setState pour selectedHaulage, selectedSeafreights, selectedMiscellaneous, selectedContainers, marginType, marginValue, totalPrice, etc.
  // Remplace tous les setSelectedHaulage(...) par setDraftQuote(dq => ({ ...dq, selectedHaulage: ... }))
  // Remplace tous les setSelectedSeafreights(...) par setDraftQuote(dq => ({ ...dq, selectedSeafreights: ... }))
  // Idem pour les autres sélections.
  // Dans les props des steps, passe draftQuote.selectedHaulage, draftQuote.selectedSeafreights, etc.
  const [servicesStep2, setServicesStep2] = useState<any[]>([]);

  // === NOUVEAUX ÉTATS POUR LA GESTION DES OPTIONS MULTIPLES ===
  const [savedOptions, setSavedOptions] = useProcessStatePersistence(
    account?.username || 'anonymous',
    'wizard_savedOptions',
    [],
    null,
            false // ❌ DÉSACTIVÉ: Plus d'auto-save backend
  );
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [isCreatingQuote, setIsCreatingQuote] = useState<boolean>(false);
  const [selectedOptionForValidation, setSelectedOptionForValidation] = useState<any>(null);
  const [showFinalValidation, setShowFinalValidation] = useState<boolean>(false);
  // === NOUVEAUX ÉTATS POUR LA MARGE ET LE TOTAL ===
  const [marginType, setMarginType] = useState<'percent' | 'fixed'>('percent');
  const [marginValue, setMarginValue] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  // ✅ REMOVED - Now managed by useOptionManagement hook

  // Pour la détection de modifications non sauvegardées
  const [lastLoadedOption, setLastLoadedOption] = useState<any>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingOptionIndex, setPendingOptionIndex] = useState<number | null>(null);
  const [pendingNewOption, setPendingNewOption] = useState(false);

  // Utilitaire pour comparer l'état courant à l'option chargée
  const isDirty = () => {
    if (editingOptionIndex === null || !lastLoadedOption) return false;
    const { id, name, createdAt, ...restLoaded } = lastLoadedOption;
    const current: Partial<typeof lastLoadedOption> = {
      selectedHaulage: draftQuote.selectedHaulage,
      selectedSeafreights: draftQuote.selectedSeafreights,
      selectedMiscellaneous: draftQuote.selectedMiscellaneous,
      services: servicesStep2,
      requestData: draftQuote.step1,
      selectedServices: draftQuote.step2.selected,
      selectedContainers: draftQuote.selectedContainers,
      marginType,
      marginValue,
      totalPrice
    };
    const { id: _, name: __, createdAt: ___, ...restCurrent } = current;
    return JSON.stringify(restLoaded) !== JSON.stringify(restCurrent);
  };

  // Animation de transition
  const [fadeKey, setFadeKey] = useState(0);

  // Surcharge handleLoadOption pour confirmation si dirty
  const handleLoadOptionWithConfirm = (optionIndex: number) => {
    if (isDirty()) {
      setPendingOptionIndex(optionIndex);
      setShowUnsavedDialog(true);
    } else {
      handleLoadOption(optionIndex);
      setFadeKey(fadeKey + 1);
    }
  };
  // Surcharge handleNewOption pour confirmation si dirty
  const handleNewOptionWithConfirm = () => {
    if (isDirty()) {
      setPendingNewOption(true);
      setShowUnsavedDialog(true);
    } else {
      handleNewOption();
      setFadeKey(fadeKey + 1);
    }
  };
  // Confirmation de changement d'option
  const handleConfirmUnsaved = () => {
    setShowUnsavedDialog(false);
    if (pendingOptionIndex !== null) {
      handleLoadOption(pendingOptionIndex);
      setFadeKey(fadeKey + 1);
      setPendingOptionIndex(null);
    } else if (pendingNewOption) {
      handleNewOption();
      setFadeKey(fadeKey + 1);
      setPendingNewOption(false);
    }
  };
  const handleCancelUnsaved = () => {
    setShowUnsavedDialog(false);
    setPendingOptionIndex(null);
    setPendingNewOption(false);
  };
  // ✅ REMOVED - Now managed by useOptionManagement hook
  // ✅ REMOVED - Now managed by useOptionManagement hook





  // === NOUVELLES FONCTIONS POUR LA GESTION DES OPTIONS ===
  


  // === ÉTAT CENTRAL UNIFIÉ DU BROUILLON ===
  // ✅ REMPLACÉ PAR useDraftManagement

  // ✅ LOG DE DEBUG POUR L'INITIALISATION
  useEffect(() => {
    console.log('🔄 [WIZARD_INIT] DraftQuote initialisé:', {
      requestQuoteId: draftQuote.requestQuoteId,
      clientNumber: draftQuote.clientNumber,
      emailUser: draftQuote.emailUser,
      source: location.state?.source || 'new',
      hasRequestData: !!location.state?.requestData
    });
  }, [draftQuote, location.state]);

  // Auto-assignation de l'utilisateur connecté si pas déjà assigné
  useEffect(() => {
    if (account?.username && !draftQuote.step1?.assignee) {
      setDraftQuote(prev => ({
        ...prev,
        step1: {
          ...prev.step1,
          assignee: account.username
        }
      }));
    }
  }, [account?.username, draftQuote.step1?.assignee]);

  // TODO: Remettre ce useEffect après la déclaration de handleManualSave

  // Synchronisation automatique des miscellaneous avec le brouillon
  useEffect(() => {
    debugLog('SYNC - Synchronisation miscellaneous avec brouillon', {
      currentCount: currentlySelectedMiscellaneous.length,
      draftCount: draftQuote.selectedMiscellaneous?.length || 0
    });
    
    // Synchroniser seulement si différent pour éviter les boucles infinies
    if (JSON.stringify(currentlySelectedMiscellaneous) !== JSON.stringify(draftQuote.selectedMiscellaneous)) {
      setDraftQuote(dq => ({
        ...dq,
        selectedMiscellaneous: currentlySelectedMiscellaneous
      }));
    }
  }, [currentlySelectedMiscellaneous, debugLog]);
  
  // === LOG DEMANDE INITIALE AU DEMARRAGE ===
  useEffect(() => {
    debugLog('INIT - Demande initiale reçue', { requestData: location.state?.requestData });
    // Log détaillé du mapping pour le step 1
    if (location.state?.requestData) {
      const request = location.state.requestData;
      debugLog('INIT - Données de la demande', { 
        pickupCity: request.pickupCity,
        deliveryCity: request.deliveryCity,
        pickupLocation: request.pickupLocation,
        deliveryLocation: request.deliveryLocation,
        pickupCountry: request.pickupCountry,
        deliveryCountry: request.deliveryCountry
      });
      
      const mappedCustomer = request.customerId
        ? {
            contactId: request.customerId,
            contactName: request.companyName,
            companyName: request.companyName,
            ...request
          }
        : undefined;
      debugLog('INIT - Mapping client pour step 1', { mappedCustomer });
      
      // Log du mapping des villes
      const mappedCityFrom = (request.pickupLocation?.city || request.pickupCity) ? { 
        cityName: request.pickupLocation?.city || request.pickupCity, 
        name: request.pickupLocation?.city || request.pickupCity,
        country: request.pickupLocation?.country || request.pickupCountry || ''
      } : undefined;
      
      const mappedCityTo = (request.deliveryLocation?.city || request.deliveryCity) ? { 
        cityName: request.deliveryLocation?.city || request.deliveryCity, 
        name: request.deliveryLocation?.city || request.deliveryCity,
        country: request.deliveryLocation?.country || request.deliveryCountry || ''
      } : undefined;
      
      debugLog('INIT - Mapping villes pour step 1', { mappedCityFrom, mappedCityTo });
      
      // Test immédiat de la validation après mapping
      setTimeout(() => {
        debugLog('INIT - Test validation après mapping', {
          draftQuoteAfterMapping: draftQuote,
          validationResult: validationErrors
        });
      }, 100);
    }
  }, [debugLog]);

  // === SAUVEGARDE PAR ÉTAPE (silencieuse) ===
  const saveCurrentStepToDraftQuote = useCallback(async (_stepIndex: number) => {
    try {
      // Les données sont automatiquement sauvegardées dans draftQuote via les setters
      // Pas de log pour éviter les boucles et protéger la mémoire
    } catch (error) {
      console.error('STEP_SAVE - Erreur:', error);
    }
  }, []);


  
  // Déterminer si les champs doivent être en read-only (wizard démarré depuis une demande existante)
  const isFromExistingRequest = useMemo(() => {
    return !!(location.state?.requestData && location.state.source === 'api');
  }, [location.state]);



  // === VALIDATION INCRÉMENTALE OPTIMISÉE ===
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    
    debugLog('VALIDATION - Validation des données', { 
      activeStep, 
      step1: draftQuote.step1,
      customer: draftQuote.step1?.customer,
      cityFrom: draftQuote.step1?.cityFrom,
      cityTo: draftQuote.step1?.cityTo 
    });
    
    // Validation de l'étape 1 - SEULEMENT si le wizard n'est pas démarré depuis une demande existante
    if (activeStep >= 0 && !isFromExistingRequest) {
      const customer = draftQuote.step1?.customer;
      if (!customer || (!customer.name && !customer.contactName && !customer.contactId)) {
        errors.push('Client requis pour l\'étape 1');
      }
      
      // Validation flexible des villes (identique à Step1RequestForm)
      const cityFrom = draftQuote.step1?.cityFrom;
      const cityFromName = cityFrom?.name || cityFrom?.cityName || (typeof cityFrom === 'string' ? cityFrom : '');
      if (!cityFromName || cityFromName.trim() === '') {
        errors.push('Ville de départ requise pour l\'étape 1');
      }
      
      const cityTo = draftQuote.step1?.cityTo;
      const cityToName = cityTo?.name || cityTo?.cityName || (typeof cityTo === 'string' ? cityTo : '');
      if (!cityToName || cityToName.trim() === '') {
        errors.push('Ville d\'arrivée requise pour l\'étape 1');
      }
    }
    
    // Validation de l'étape 2
    if (activeStep >= 1) {
      if (!draftQuote.step2?.selected || draftQuote.step2.selected.length === 0) {
        errors.push('Au moins un service requis pour l\'étape 2');
      }
    }
    
      // Validation de l'étape 3
  if (activeStep >= 2) {
    // Vérifier les conteneurs dans step3
    const step3Containers = draftQuote.step3?.selectedContainers;
    const fallbackContainers = draftQuote.selectedContainers;
    
    let hasContainers = false;
    
    if (step3Containers) {
      if (Array.isArray(step3Containers)) {
        hasContainers = step3Containers.length > 0;
      } else if (step3Containers.list && Array.isArray(step3Containers.list)) {
        hasContainers = step3Containers.list.length > 0;
      } else if (typeof step3Containers === 'object') {
        hasContainers = Object.values(step3Containers).some(arr => Array.isArray(arr) && arr.length > 0);
      }
    }
    
    // Fallback vers selectedContainers si step3 est vide
    if (!hasContainers && fallbackContainers) {
      if (Array.isArray(fallbackContainers)) {
        hasContainers = fallbackContainers.length > 0;
      } else if (typeof fallbackContainers === 'object') {
        hasContainers = Object.values(fallbackContainers).some(arr => Array.isArray(arr) && arr.length > 0);
      }
    }
    
    if (!hasContainers) {
      errors.push('Conteneurs requis pour l\'étape 3');
    }
    
    // Validation supplémentaire des données des conteneurs
    if (hasContainers) {
      const containersToValidate = step3Containers?.list || 
                                 (Array.isArray(step3Containers) ? step3Containers : []) ||
                                 (Array.isArray(fallbackContainers) ? fallbackContainers : []);
      
      containersToValidate.forEach((container: any, index: number) => {
        if (!container.type && !container.Type) {
          errors.push(`Type de conteneur requis pour le conteneur ${index + 1}`);
        }
        if (!container.quantity && container.quantity !== 0) {
          errors.push(`Quantité requise pour le conteneur ${index + 1}`);
        }
      });
    }
  }
    
    return errors;
  }, [draftQuote, activeStep, debugLog]);

  // === FONCTION DE TRANSFORMATION VERS LE FORMAT SDK (OPTIMISÉE) ===
  useMemo(() => {
    debugLog('TRANSFORM - Transformation vers format SDK', { 
      activeStep, 
      savedOptionsCount: savedOptions.length,
      step1Data: draftQuote.step1,
      cityFromData: draftQuote.step1?.cityFrom,
      cityToData: draftQuote.step1?.cityTo
    });
    
    return {
      wizard: {
        currentStep: activeStep + 1, // Convertir activeStep (base 0) en currentStep (base 1)
        completedSteps: Array.from({ length: activeStep }, (_, i) => i + 1),
        status: savedOptions && savedOptions.length > 0 ? 'quote_draft' : 'draft',
        lastModified: new Date(),
        version: '1.0'
      },
      steps: {
        step1: {
          customer: {
            contactId: draftQuote.step1?.customer?.contactId || 0,
            contactName: draftQuote.step1?.customer?.contactName || '',
            companyName: draftQuote.step1?.customer?.companyName || '',
            email: draftQuote.step1?.customer?.email || ''
          },
          route: {
            origin: {
              city: (() => {
                const cityData = {
                name: draftQuote.step1?.cityFrom?.name || '',
                country: draftQuote.step1?.cityFrom?.country || ''
                };
                debugLog('TRANSFORM - Origin city data', { 
                  cityFrom: draftQuote.step1?.cityFrom, 
                  result: cityData 
                });
                return cityData;
              })(),
              port: {
                portId: draftQuote.step1?.portFrom?.portId || 0,
                portName: draftQuote.step1?.portFrom?.portName || '',
                country: draftQuote.step1?.portFrom?.country || ''
              }
            },
            destination: {
              city: (() => {
                const cityData = {
                name: draftQuote.step1?.cityTo?.name || '',
                country: draftQuote.step1?.cityTo?.country || ''
                };
                debugLog('TRANSFORM - Destination city data', { 
                  cityTo: draftQuote.step1?.cityTo, 
                  result: cityData 
                });
                return cityData;
              })(),
              port: {
                portId: draftQuote.step1?.portTo?.portId || 0,
                portName: draftQuote.step1?.portTo?.portName || '',
                country: draftQuote.step1?.portTo?.country || ''
              }
            }
          },
          cargo: {
            product: {
              productId: draftQuote.step1?.productName?.productId || 0,
              productName: draftQuote.step1?.productName?.productName || ''
            },
            incoterm: draftQuote.step1?.incotermName || ''
          },
          metadata: {
            comment: draftQuote.step1?.comment || ''
          }
        },
        step2: {
          selected: draftQuote.step2?.selected?.map((service: any) => ({
            serviceId: service.serviceId || service.id || 0,
            serviceName: service.serviceName || service.name || '',
            category: service.category || '',
            isRequired: service.isRequired || false,
            name: service.name || service.serviceName || '',
            orderCount: service.orderCount || 0,
            usagePercent: service.usagePercent || 0
          })) || []
        },
        step3: {
          selectedContainers: {
            list: (() => {
            // Extraction robuste des conteneurs depuis différentes structures possibles
            const containersData = draftQuote.step3?.selectedContainers;
            let containersList = [];
            
            if (containersData) {
              if (containersData.list && Array.isArray(containersData.list)) {
                // Structure: { list: [...] }
                containersList = containersData.list;
              } else if (Array.isArray(containersData)) {
                // Structure: [...] directement
                containersList = containersData;
              } else if (typeof containersData === 'object') {
                // Structure: { serviceId: [...], ... }
                containersList = Object.values(containersData).flat();
              }
            }
            
            // Fallback vers draftQuote.selectedContainers si step3 est vide
            if (!containersList || containersList.length === 0) {
              const fallbackContainers = draftQuote.selectedContainers;
              if (fallbackContainers) {
                if (Array.isArray(fallbackContainers)) {
                  containersList = fallbackContainers;
                } else if (typeof fallbackContainers === 'object') {
                  containersList = Object.values(fallbackContainers).flat();
                }
              }
            }
            
            console.log('[TRANSFORM] === DEBUG STEP3 CONTAINERS ===');
            console.log('[TRANSFORM] draftQuote.step3?.selectedContainers:', JSON.stringify(containersData, null, 2));
            console.log('[TRANSFORM] draftQuote.selectedContainers (fallback):', JSON.stringify(draftQuote.selectedContainers, null, 2));
            console.log('[TRANSFORM] containersList extraite:', JSON.stringify(containersList, null, 2));
            console.log('[TRANSFORM] Nombre de conteneurs trouvés:', containersList?.length || 0);
            console.log('[TRANSFORM] totalTEU:', draftQuote.totalTEU);
            
            return (containersList || []).map((container: any) => ({
              _id: container._id || container.id || `container_${Date.now()}_${Math.random()}`,
              type: container.type || container.Type || '',
              quantity: container.quantity || container.Quantity || 1,
              teu: container.teu || container.Teu || container.teu || 0,
              // Ajout de champs supplémentaires pour la persistance
              containerType: container.containerType || container.type || '',
              unitPrice: container.unitPrice || 0,
              currency: container.currency || 'EUR',
              // Métadonnées pour le suivi
              createdAt: container.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }));
            })()
          },
          summary: {
            totalContainers: draftQuote.totalContainers || 0,
            totalTEU: draftQuote.totalTEU || 0,
            containerTypes: draftQuote.containerTypes || [],
            // Ajout de métriques supplémentaires
            totalValue: draftQuote.containersTotalValue || 0,
            averageTEU: draftQuote.totalTEU && draftQuote.totalContainers ? 
              (draftQuote.totalTEU / draftQuote.totalContainers) : 0
          }
        },
        step4: draftQuote.selectedHaulage ? {
          selection: {
            haulierId: draftQuote.selectedHaulage.haulierId || 0,
            haulierName: draftQuote.selectedHaulage.haulierName || '',
            tariff: {
              unitPrice: draftQuote.selectedHaulage.unitTariff || '0',  // ✅ CORRIGÉ: utiliser unitTariff au lieu de unitPrice
              currency: draftQuote.selectedHaulage.currency || 'EUR',
              freeTime: draftQuote.selectedHaulage.freeTime || 0
            },
            route: {
              pickup: {
                company: draftQuote.selectedHaulage.pickupLocation?.company || '',
                city: draftQuote.selectedHaulage.pickupLocation?.city || '',
                country: draftQuote.selectedHaulage.pickupLocation?.country || ''
              },
              delivery: {
                portId: draftQuote.selectedHaulage.deliveryPort?.portId || 0,
                portName: draftQuote.selectedHaulage.deliveryPort?.portName || '',
                country: draftQuote.selectedHaulage.deliveryPort?.country || ''
              }
            },
            validity: {
              validUntil: draftQuote.selectedHaulage.validUntil || new Date()
            }
          },
          calculation: {
            quantity: draftQuote.haulageQuantity || 0,
            unitPrice: draftQuote.selectedHaulage.unitTariff || '0',  // ✅ CORRIGÉ: utiliser unitTariff au lieu de unitPrice
            subtotal: draftQuote.haulageTotal || '0',
            currency: draftQuote.selectedHaulage.currency || 'EUR'
          }
        } : undefined,
        step5: {
          selections: draftQuote.selectedSeafreights?.map((sf: any) => ({
            id: sf.id || '',
            seafreightId: sf.seaFreightId || sf.id || '',
            carrier: {
              name: sf.carrierName || sf.carrier?.name || '',
              agentName: sf.carrierAgentName || sf.carrier?.agentName || ''
            },
            route: {
              departurePort: {
                portId: sf.departurePort?.portId || 0,
                portName: sf.departurePort?.portName || '',
                country: sf.departurePort?.country || ''
              },
              destinationPort: {
                portId: sf.destinationPort?.portId || 0,
                portName: sf.destinationPort?.portName || '',
                country: sf.destinationPort?.country || ''
              },
              transitDays: sf.transitTimeDays || sf.transitTime || 0,
              frequency: sf.frequency || ''
            },
            containers: (() => {
              // Construire la structure containers attendue par l'API
              if (sf.defaultContainer && sf.pricing?.basePrice) {
                return [{
                  type: sf.defaultContainer,
                  quantity: 1, // Quantité par défaut
                  unitPrice: sf.pricing.basePrice,
                  subtotal: sf.pricing.basePrice
                }];
              }
              return sf.containers || [];
            })(),
            pricing: {
              currency: sf.currency || sf.pricing?.currency || 'EUR',
              total: sf.pricing?.total || sf.total || 0
              // ❌ Suppression des champs non présents dans l'API :
              // basePrice, baf, caf, thcOrigin, thcDestination, otherCharges
            },
            validity: {
              validUntil: sf.validUntil || sf.validity?.endDate || new Date()
            }
          })) || [],
          summary: {
            totalSelections: draftQuote.selectedSeafreights?.length || 0,
            totalContainers: draftQuote.totalContainers || 0,
            totalAmount: draftQuote.seafreightTotal || 0,
            currency: 'EUR'
          }
        },
        step6: {
          selections: draftQuote.selectedMiscellaneous?.map((misc: any) => ({
            selectionId: misc.id || 0,
            service: {
              serviceId: misc.serviceId || 0,
              serviceName: misc.serviceName || '',
              category: misc.category || ''
            },
            pricing: {
              unitPrice: misc.price || '0',
              quantity: misc.quantity || 1,
              subtotal: misc.subtotal || '0',
              currency: misc.currency || 'EUR'
            }
          })) || [],
          summary: {
            totalSelections: draftQuote.selectedMiscellaneous?.length || 0,
            totalAmount: draftQuote.miscTotal || '0',
            currency: 'EUR'
          }
        }
      },
      totals: {
        haulage: parseFloat(String(draftQuote.haulageTotal || 0)),
        seafreight: parseFloat(String(draftQuote.seafreightTotal || 0)),
        miscellaneous: parseFloat(String(draftQuote.miscTotal || 0)),
        subtotal: parseFloat(String(draftQuote.totalPrice || 0)),
        grandTotal: parseFloat(String(draftQuote.totalPrice || 0)),
        currency: 'EUR',
        totalTEU: draftQuote.totalTEU || 0
      }
    };
  }, [draftQuote, activeStep, savedOptions, debugLog]);

  // === FONCTIONS DE SAUVEGARDE AUTOMATIQUE PAR ÉTAPE ===
  // saveCurrentStepToDraftQuote défini plus haut pour éviter l'erreur de référence

  // === COMPOSANT D'AFFICHAGE DES ERREURS DE SAUVEGARDE ===
  const SaveErrorDisplay = () => {
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    useEffect(() => {
      if (errorMessage) {
        setShowError(true);
        const timer = setTimeout(() => {
          setShowError(false);
          setErrorMessage('');
        }, 5000);
        return () => clearTimeout(timer);
      }
    }, [errorMessage]);
    
    if (!showError) return null;
    
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          backgroundColor: '#f44336',
          color: 'white',
          padding: 2,
          borderRadius: 1,
          boxShadow: 3,
          maxWidth: 400
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          Erreur de sauvegarde
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {errorMessage}
        </Typography>
        <IconButton
          size="small"
          sx={{ color: 'white', position: 'absolute', top: 5, right: 5 }}
          onClick={() => setShowError(false)}
        >
          <CloseIcon />
        </IconButton>
      </Box>
    );
  };

  // === SAUVEGARDE AUTOMATIQUE DÉSACTIVÉE ===
  // ❌ Cette fonction n'est plus appelée automatiquement
  const autoSave = useCallback(async () => {
    if (isSaving) {
      debugLog('AUTO_SAVE - Sauvegarde déjà en cours');
      return;
    }
    
    // Vérifications préalables
    if (!account?.username) {
      debugLog('AUTO_SAVE - Pas d\'utilisateur connecté');
      return;
    }
    
    if (activeStep >= 6) {
      debugLog('AUTO_SAVE - Sauvegarde désactivée après étape 6');
      return;
    }
    
    // Validation avec useMemo
    if (validationErrors.length > 0) {
      debugLog('AUTO_SAVE - Données invalides', { errors: validationErrors });
      showSnackbar(`Données invalides: ${validationErrors.join(', ')}`, 'warning');
      return;
    }
    
    try {
      setIsSaving(true);
      // === SAUVEGARDE SILENCIEUSE ===
      // ✅ LOGIQUE CORRECTE PUT vs POST selon les spécifications
      // POST: Nouveau brouillon depuis une demande (première sauvegarde)
      // PUT: Brouillon existant chargé depuis la BD (mise à jour)
      

      // === SAUVEGARDE VIA SERVICE CENTRALISÉ ===
      const result = await draftPersistence.saveDraft(
        draftQuote,
        draftId,
        requestId,
        account.username,
        {
          validateData: false, // Déjà validé avec useMemo
          fallbackToLocalStorage: false // ❌ Désactiver le fallback local pour laisser Step4HaulierSelection gérer la sauvegarde
        }
      );

      if (result.success) {
        if (result.draftId && !draftId) {
          // Nouveau draft créé, mettre à jour l'URL
          // Mise à jour URL silencieuse
          window.history.replaceState(null, '', `?draftId=${result.draftId}`);
          
          // Mettre à jour l'état local immédiatement
          setCurrentDraftId(result.draftId);
          
          // IMPORTANT : Mettre à jour l'ID dans draftQuote pour Step7Recap
          setDraftQuote(prev => ({
            ...prev,
            id: result.draftId
          }));
          
          // IMPORTANT : Marquer qu'on a maintenant un brouillon chargé pour les prochaines sauvegardes
          setIsLoadedFromDraft(true);
          
          // État mis à jour silencieusement
        }
        
        setLastSaved(new Date());
        // Sauvegarde réussie (log supprimé pour performances)
        
        if (result.usedFallback) {
          showSnackbar('Sauvegardé localement (serveur indisponible)', 'warning');
        } else {
          showSnackbar('Brouillon sauvegardé avec succès via l\'API', 'success');
        }
          } else {
        throw new Error(result.error || 'Erreur de sauvegarde');
      }
      
    } catch (error) {
      debugLog('AUTO_SAVE - Erreur générale', { error });
      showSnackbar('Erreur lors de la sauvegarde automatique', 'warning');
    } finally {
      setIsSaving(false);
    }
  }, [
    draftQuote, 
    activeStep,
    requestId,
    account?.username,
    draftId, 
    isSaving,
    validationErrors,
    draftPersistence,
    debugLog
  ]);



  // === SAUVEGARDE MANUELLE UNIQUEMENT ===
  // L'auto-save a été désactivé, seule la sauvegarde manuelle est disponible
  // Les triggers automatiques ont été supprimés pour éviter les sauvegardes non désirées

  // ✅ REMOVED - Now managed by useDraftManagement hook

      // ✅ REMOVED - Orphaned parsedData block
        
        // === RESTAURER LA DEMANDE INITIALE ===
        if (parsedData.requestData) {
          setRequestData(parsedData.requestData);
        }
        if (parsedData.requestId) {
          setRequestId(parsedData.requestId);
        }
        
        // === RESTAURER LE WIZARD AVEC LA NOUVELLE FONCTION UTILITAIRE ===
        // ✅ LOG COMPLET DU PARSEDDATA AVANT RESTAURATION
        console.log('=== 🔍 PARSEDDATA COMPLET DEPUIS LA BASE ===');
        console.log('📊 parsedData brut:', parsedData); 
        console.log('🔍 Structure des clés:', Object.keys(parsedData));
        console.log('📋 Clés disponibles:', {
          steps: {
            step1: !!parsedData.step1,
            Step1: !!parsedData.Step1,
            step2: !!parsedData.step2,
            Step2: !!parsedData.Step2,
            step3: !!parsedData.step3,
            Step3: !!parsedData.Step3,
            step4: !!parsedData.step4,
            Step4: !!parsedData.Step4,
            step5: !!parsedData.step5,
            Step5: !!parsedData.Step5,
            step6: !!parsedData.step6,
            Step6: !!parsedData.Step6,
            step7: !!parsedData.step7,
            Step7: !!parsedData.Step7
          },
          compatibility: {
            selectedHaulage: !!parsedData.selectedHaulage,
            selectedSeafreights: !!parsedData.selectedSeafreights,
            selectedMiscellaneous: !!parsedData.selectedMiscellaneous,
            selectedContainers: !!parsedData.selectedContainers
          },
          metadata: {
            requestQuoteId: parsedData.requestQuoteId,
            clientNumber: parsedData.clientNumber,
            emailUser: parsedData.emailUser,
            id: parsedData.id
          }
        });
        
        // ✅ ANALYSE DÉTAILLÉE DES STEPS
        if (parsedData.step1 || parsedData.Step1) {
          const step1 = parsedData.step1 || parsedData.Step1;
          console.log('🔍 Step1 détecté:', {
            hasCustomer: !!step1.customer,
            hasRoute: !!step1.route,
            hasCargo: !!step1.cargo,
            customerKeys: step1.customer ? Object.keys(step1.customer) : [],
            routeKeys: step1.route ? Object.keys(step1.route) : []
          });
        }
        
        if (parsedData.step4 || parsedData.Step4) {
          const step4 = parsedData.step4 || parsedData.Step4;
          console.log('🔍 Step4 détecté:', {
            hasSelection: !!step4.selection,
            hasCalculation: !!step4.calculation,
            selectionKeys: step4.selection ? Object.keys(step4.selection) : [],
            calculationKeys: step4.calculation ? Object.keys(step4.calculation) : []
          });
        }
        
        if (parsedData.step5 || parsedData.Step5) {
          const step5 = parsedData.step5 || parsedData.Step5;
          console.log('🔍 Step5 détecté:', {
            hasSelections: !!step5.selections,
            selectionsCount: step5.selections?.length || 0,
            hasSummary: !!step5.summary,
            summaryKeys: step5.summary ? Object.keys(step5.summary) : []
          });
        }
        
        if (parsedData.step6 || parsedData.Step6) {
          const step6 = parsedData.step6 || parsedData.Step6;
          console.log('🔍 Step6 détecté:', {
            hasSelections: !!step6.selections,
            selectionsCount: step6.selections?.length || 0,
            hasSummary: !!step6.summary,
            summaryKeys: step6.summary ? Object.keys(step6.summary) : []
          });
        }
        
        console.log('=== FIN PARSEDDATA ===');
        
        setDraftQuote(prev => loadDraftFromDatabase(parsedData, prev));
        
        // ✅ RESTAURER LES OPTIONS SAUVEGARDÉES
        if (parsedData.savedOptions && Array.isArray(parsedData.savedOptions)) {
          setSavedOptions(parsedData.savedOptions);
          console.log('[LOAD_DRAFT] 🔥 savedOptions restauré:', parsedData.savedOptions.length, 'options');
        }
        
        // ✅ RESTAURER L'ÉTAT ACTUEL
        if (parsedData.currentStep) {
          setCurrentStep(parsedData.currentStep);
        }
        if (parsedData.activeStep !== undefined) {
          setActiveStep(parsedData.activeStep);
          // S'assurer que currentStep est cohérent avec activeStep
          setCurrentStep(parsedData.activeStep + 1);
        }
        
        // ✅ VÉRIFICATION FINALE DE LA RESTAURATION
        console.log('[LOAD_DRAFT] ✅ VÉRIFICATION FINALE DE LA RESTAURATION:');
        console.log('[LOAD_DRAFT] - selectedHaulage:', {
          hasHaulage: !!draftQuote.selectedHaulage,
          offerId: draftQuote.selectedHaulage?.offerId,
          haulierName: draftQuote.selectedHaulage?.haulierName
        });
        console.log('[LOAD_DRAFT] - selectedSeafreights:', {
          hasSeafreights: !!(draftQuote.selectedSeafreights && draftQuote.selectedSeafreights.length > 0),
          count: draftQuote.selectedSeafreights?.length || 0,
          firstSeafreight: draftQuote.selectedSeafreights?.[0] ? {
            id: draftQuote.selectedSeafreights[0].id,
            seaFreightId: draftQuote.selectedSeafreights[0].seaFreightId,
            carrierName: draftQuote.selectedSeafreights[0].carrierName
          } : null
        });
        console.log('[LOAD_DRAFT] - selectedMiscellaneous:', {
          hasMisc: !!(draftQuote.selectedMiscellaneous && draftQuote.selectedMiscellaneous.length > 0),
          count: draftQuote.selectedMiscellaneous?.length || 0
        });
        


  // Charger le brouillon au démarrage si draftId est présent (UNE SEULE FOIS)
  useEffect(() => {
    console.log('🔄 [USE_EFFECT] === VÉRIFICATION DRAFT ID ===');
    console.log('🔄 [USE_EFFECT] draftId dans URL:', draftId);
    console.log('🔄 [USE_EFFECT] urlSearchParams:', urlSearchParams.toString());
    console.log('🔄 [USE_EFFECT] isDraftLoaded:', isDraftLoaded);
    
    // 🛑 GARDE: Ne pas recharger si déjà chargé
    if (isDraftLoaded) {
      console.log('🔄 [USE_EFFECT] ❌ Brouillon déjà chargé, skip');
      return;
    }
    
    if (draftId) {
      console.log('🔄 [USE_EFFECT] ✅ Chargement du brouillon:', draftId);
      console.log('🔄 [USE_EFFECT] ⚠️ APPEL DE loadDraft...');
      loadDraft(draftId);
    } else {
      console.log('🔄 [USE_EFFECT] ❌ Aucun draftId trouvé dans l\'URL');
    }
  }, [draftId, isDraftLoaded]); // ✅ Retirer loadDraft des dépendances

  // === SAUVEGARDE MANUELLE OPTIMISÉE ===
  const handleManualSave = useCallback(async () => {
    // ⚠️ LIMITATION: La sauvegarde manuelle n'est disponible que jusqu'à l'étape 6
    // À partir de l'étape 7 (récapitulatif), seule la validation finale sauvegarde le devis
    if (activeStep >= 7) {
      debugLog('MANUAL_SAVE - Sauvegarde désactivée après étape 7');
      showSnackbar('La sauvegarde n\'est plus disponible à cette étape. Utilisez la validation finale.', 'warning');
      return;
    }

    // ✅ SYNCHRONISATION LOCALE AVANT SAUVEGARDE API
    console.log('[MANUAL_SAVE] 🔄 Synchronisation locale du draftQuote avant sauvegarde...');
    
    // 🔥 FORCER LA SYNCHRONISATION LOCALE AVANT TOUT
    console.log('[MANUAL_SAVE] 🔥 Appel direct de syncDraftQuoteLocally...');
    try {
      // ✅ SUPPRIMÉ: Plus de synchronisation locale nécessaire
      // await syncDraftQuoteLocally();
      console.log('[MANUAL_SAVE] ✅ Synchronisation locale terminée avec succès');
      
      // 🔍 VÉRIFICATION APRÈS SYNCHRONISATION
      console.log('[MANUAL_SAVE] 🔍 Vérification après sync:', {
        selectedSeafreightsCount: draftQuote.selectedSeafreights?.length || 0,
        step5Exists: !!draftQuote.step5,
        step5SelectionsCount: draftQuote.step5?.selections?.length || 0
      });
    } catch (error) {
      console.error('[MANUAL_SAVE] ❌ Erreur lors de la synchronisation locale:', error);
    }
    
    // === SYNCHRONISER STEP5 AVEC LES DONNÉES ACTUELLES ===
    if (activeStep >= 4) { // Si on est au Step 5 ou plus
      console.log('[MANUAL_SAVE] 🔄 Synchronisation Step5 avec les données actuelles...');
      
      // Récupérer les données actuelles du Step 5
      const currentStep5Data = {
        selections: draftQuote.selectedSeafreights?.map((sf: any) => ({
          id: sf.id || sf.seaFreightId || '',
          seafreightId: sf.seaFreightId || sf.id || '',
          quoteNumber: sf.quoteNumber || sf.quoteId || '',
          carrier: {
            name: sf.carrierName || sf.carrier?.name || '',
            agentName: sf.carrierAgentName || sf.carrier?.agentName || ''
          },
          route: {
            departurePort: sf.departurePort || null,
            destinationPort: sf.destinationPort || null,
            transitDays: sf.transitTimeDays || 0,
            frequency: sf.frequency || ''
          },
          container: {
            containerType: sf.defaultContainer || sf.containerType || '',
            isReefer: false,
            quantity: 1,
            volumeM3: 0,
            weightKg: 0,
            unitPrice: sf.pricing?.basePrice || sf.baseFreight || 0,
            subtotal: sf.pricing?.total || sf.total || 0
          },
          charges: {
            basePrice: sf.pricing?.basePrice || sf.baseFreight || 0,
            currency: sf.currency || 'EUR',
            surcharges: sf.pricing?.surcharges || [],
            totalPrice: sf.pricing?.total || sf.total || 0
          },
          service: {
            deliveryTerms: '',
            createdBy: draftQuote.emailUser || 'unknown@omnifreight.eu',
            createdDate: new Date()
          },
          validity: {
            startDate: new Date(),
            endDate: sf.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          },
          remarks: sf.comment || sf.remarks || '',
          isSelected: true,
          selectedAt: new Date()
        })) || [],
        summary: {
          totalSelections: draftQuote.selectedSeafreights?.length || 0,
          totalContainers: draftQuote.selectedSeafreights?.length || 0,
          totalAmount: draftQuote.seafreightTotal || 0,
          currency: 'EUR',
          selectedCarriers: draftQuote.selectedSeafreights?.map((sf: any) => sf.carrierName || sf.carrier?.name || '').filter(Boolean) || [],
          containerTypes: draftQuote.selectedSeafreights?.map((sf: any) => sf.defaultContainer || sf.containerType || '').filter(Boolean) || [],
          preferredSelectionId: draftQuote.selectedSeafreights?.[0]?.id || draftQuote.selectedSeafreights?.[0]?.seaFreightId || ''
        }
      };
      
      console.log('[MANUAL_SAVE] 🔄 Step5 synchronisé:', {
        selectionsCount: currentStep5Data.selections.length,
        totalAmount: currentStep5Data.summary.totalAmount,
        selectedCarriers: currentStep5Data.summary.selectedCarriers
      });
      
      // Mettre à jour draftQuote.step5 avec les données synchronisées
      setDraftQuote(prev => ({
        ...prev,
        step5: currentStep5Data
      }));
      
      // Attendre que la mise à jour soit appliquée
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // === SYNCHRONISER STEP4 AVEC LES DONNÉES ACTUELLES ===
    if (activeStep >= 3) { // Si on est au Step 4 ou plus
      console.log('[MANUAL_SAVE] 🔄 Synchronisation Step4 avec les données actuelles...');
      
      if (draftQuote.selectedHaulage) {
        const currentStep4Data = {
          selection: {
            offerId: draftQuote.selectedHaulage.offerId || '',
            haulierId: draftQuote.selectedHaulage.haulierId || 0,
            haulierName: draftQuote.selectedHaulage.haulierName || '',
            tariff: {
              unitPrice: draftQuote.selectedHaulage.unitTariff || draftQuote.selectedHaulage.unitPrice || 0,
              currency: draftQuote.selectedHaulage.currency || 'EUR',
              freeTime: draftQuote.selectedHaulage.freeTime || 0
            },
            route: {
              pickup: {
                company: draftQuote.selectedHaulage.pickupLocation?.company || '',
                city: draftQuote.selectedHaulage.pickupLocation?.city || '',
                country: draftQuote.selectedHaulage.pickupLocation?.country || ''
              },
              delivery: {
                portId: draftQuote.selectedHaulage.deliveryPort?.portId || 0,
                portName: draftQuote.selectedHaulage.deliveryPort?.portName || '',
                country: draftQuote.selectedHaulage.deliveryPort?.country || ''
              }
            },
            validity: {
              validUntil: draftQuote.selectedHaulage.validUntil || new Date()
            }
          },
          calculation: {
            quantity: draftQuote.haulageQuantity || 1,
            unitPrice: draftQuote.selectedHaulage.unitTariff || draftQuote.selectedHaulage.unitPrice || 0,
            subtotal: draftQuote.haulageTotal || 0,
            currency: draftQuote.selectedHaulage.currency || 'EUR'
          },
          completed: true
        };
        
        console.log('[MANUAL_SAVE] 🔄 Step4 synchronisé:', {
          offerId: currentStep4Data.selection.offerId,
          haulierName: currentStep4Data.selection.haulierName,
          unitPrice: currentStep4Data.selection.tariff.unitPrice
        });
        
        setDraftQuote(prev => ({
          ...prev,
          step4: currentStep4Data
        }));
      }
    }
    
    // === SYNCHRONISER STEP6 AVEC LES DONNÉES ACTUELLES ===
    if (activeStep >= 5) { // Si on est au Step 6 ou plus
      console.log('[MANUAL_SAVE] 🔄 Synchronisation Step6 avec les données actuelles...');
      
      const currentStep6Data = {
        selections: draftQuote.selectedMiscellaneous?.map((misc: any) => ({
          selectionId: misc.id || 0,
          service: {
            serviceId: misc.serviceId || 0,
            serviceName: misc.serviceName || '',
            category: misc.category || ''
          },
          pricing: {
            unitPrice: misc.price || misc.pricing?.basePrice || '0',
            quantity: misc.quantity || 1,
            subtotal: misc.subtotal || misc.price || '0',
            currency: misc.currency || 'EUR'
          }
        })) || [],
        summary: {
          totalSelections: draftQuote.selectedMiscellaneous?.length || 0,
          totalAmount: draftQuote.miscTotal || 0,
          currency: 'EUR',
          categories: draftQuote.selectedMiscellaneous?.map((m: any) => m.category || '').filter(Boolean) || []
        }
      };
      
      console.log('[MANUAL_SAVE] 🔄 Step6 synchronisé:', {
        selectionsCount: currentStep6Data.selections.length,
        totalAmount: currentStep6Data.summary.totalAmount,
        categories: currentStep6Data.summary.categories
      });
      
      setDraftQuote(prev => ({
        ...prev,
        step6: currentStep6Data
      }));
    }
    
    // ✅ VÉRIFICATION DE LA SYNCHRONISATION LOCALE
    console.log('[MANUAL_SAVE] ✅ Vérification de la synchronisation locale:');
    console.log('[MANUAL_SAVE] - Step4:', {
      hasStep4: !!draftQuote.step4,
      offerId: draftQuote.step4?.selection?.offerId,
      haulierName: draftQuote.step4?.selection?.haulierName
    });
    
    // 🔍 LOG DÉTAILLÉ DE STEP5 POUR DÉBOGUAGE
    console.log('[MANUAL_SAVE] 🔍 === LOG DÉTAILLÉ DE STEP5 ===');
    console.log('[MANUAL_SAVE] 🔍 draftQuote.step5 complet:', JSON.stringify(draftQuote.step5, null, 2));
    
    if (draftQuote.step5) {
      console.log('[MANUAL_SAVE] 🔍 Step5.selections:', {
        count: draftQuote.step5.selections?.length || 0,
        selections: draftQuote.step5.selections?.map((sel: any, index: number) => ({
          index,
          id: sel.id,
          seafreightId: sel.seafreightId,
          carrierName: sel.carrier?.name,
          agentName: sel.carrier?.agentName,
          departurePort: sel.route?.departurePort,
          destinationPort: sel.route?.destinationPort,
          containerType: sel.container?.containerType,
          quantity: sel.container?.quantity,
          basePrice: sel.charges?.basePrice,
          totalPrice: sel.charges?.totalPrice,
          currency: sel.charges?.currency,
          isSelected: sel.isSelected,
          selectedAt: sel.selectedAt
        })) || []
      });
      
      console.log('[MANUAL_SAVE] 🔍 Step5.summary:', {
        totalSelections: draftQuote.step5.summary?.totalSelections || 0,
        totalContainers: draftQuote.step5.summary?.totalContainers || 0,
        totalAmount: draftQuote.step5.summary?.totalAmount || 0,
        currency: draftQuote.step5.summary?.currency || 'N/A',
        selectedCarriers: draftQuote.step5.summary?.selectedCarriers || [],
        containerTypes: draftQuote.step5.summary?.containerTypes || [],
        preferredSelectionId: draftQuote.step5.summary?.preferredSelectionId || 'N/A'
      });
    } else {
      console.log('[MANUAL_SAVE] 🔍 ❌ Step5 est undefined ou null');
    }
    console.log('[MANUAL_SAVE] 🔍 === FIN LOG DÉTAILLÉ DE STEP5 ===');
    
    console.log('[MANUAL_SAVE] - Step6:', {
      hasStep6: !!draftQuote.step6,
      selectionsCount: draftQuote.step6?.selections?.length || 0,
      totalAmount: draftQuote.step6?.summary?.totalAmount
    });

    // 🔍 DEBUG COMPLET DE L'OBJET DRAFTQUOTE
    console.log('🚀 [BOUTON_SAUVEG] ==========================================');
    console.log('🚀 [BOUTON_SAUVEG] OBJET DRAFTQUOTE COMPLET:');
    console.log('🚀 [BOUTON_SAUVEG] ==========================================');
    console.log(JSON.stringify(draftQuote, null, 2));
    console.log('🚀 [BOUTON_SAUVEG] ==========================================');
    console.log('🚀 [BOUTON_SAUVEG] STRUCTURE DÉTAILLÉE:');
    console.log('🚀 [BOUTON_SAUVEG] - step1:', draftQuote.step1);
    console.log('🚀 [BOUTON_SAUVEG] - step2:', draftQuote.step2);
    console.log('🚀 [BOUTON_SAUVEG] - step3:', draftQuote.step3);
    console.log('🚀 [BOUTON_SAUVEG] - selectedOptions:', draftQuote.selectedOptions);
    console.log('🚀 [BOUTON_SAUVEG] - savedOptions:', draftQuote.savedOptions);
    console.log('🚀 [BOUTON_SAUVEG] - currentStep:', draftQuote.currentStep);
    console.log('🚀 [BOUTON_SAUVEG] - activeStep actuel:', activeStep);
    console.log('🚀 [BOUTON_SAUVEG] - draftId:', draftId);
    console.log('🚀 [BOUTON_SAUVEG] - currentDraftId:', currentDraftId);
    console.log('🚀 [BOUTON_SAUVEG] - draftId from URL:', urlSearchParams.get('draftId'));
    console.log('🚀 [BOUTON_SAUVEG] - loadDraft from URL:', urlSearchParams.get('loadDraft'));
    console.log('🚀 [BOUTON_SAUVEG] - requestId:', requestId);
    console.log('🚀 [BOUTON_SAUVEG] - isLoadedFromDraft:', isLoadedFromDraft);
    console.log('🚀 [BOUTON_SAUVEG] - URL actuelle:', window.location.href);
    console.log('🚀 [BOUTON_SAUVEG] ==========================================');
    
    console.log('[DEBUG] === SAUVEGARDE MANUELLE DÉCLENCHÉE ===');
    console.log('[MANUAL_SAVE] Début de la sauvegarde manuelle');
    
    // === DEBUG DÉTAILLÉ POUR POST/PUT ===
    console.log('[MANUAL_SAVE] Debug POST/PUT:', {
      draftId: draftId,
      draftIdType: typeof draftId,
              draftIdFromURL: urlSearchParams.get('draftId'),
      requestId: requestId,
      shouldUsePUT: !!draftId,
      urlParams: location.search,
      account: account?.username
    });
    
    console.log('[MANUAL_SAVE] État actuel:', {
      draftId,
      requestId,
      currentStep,
      hasStep1: !!draftQuote.step1,
      hasStep2: !!draftQuote.step2,
      hasStep3: !!draftQuote.step3,
      selectedHaulage: !!draftQuote.selectedHaulage,
      selectedSeafreights: draftQuote.selectedSeafreights?.length || 0,
      selectedMiscellaneous: draftQuote.selectedMiscellaneous?.length || 0,
      savedOptionsCount: savedOptions.length,
      isSaving,
      mutationsReady: {
        createDraft: !!createDraft,
        updateDraft: !!updateDraft
      }
    });
    
    console.log('[MANUAL_SAVE] === CONTENU DU DRAFT QUOTE ===');
    console.log('[MANUAL_SAVE] draftQuote complet:', JSON.stringify(draftQuote, null, 2));
    console.log('[MANUAL_SAVE] === FIN CONTENU DU DRAFT QUOTE ===');
    
    try {
      console.log('[MANUAL_SAVE] === ÉTAT AVANT SAUVEGARDE ===');
      console.log('[MANUAL_SAVE] currentlySelectedMiscellaneous:', {
        count: currentlySelectedMiscellaneous.length,
        services: currentlySelectedMiscellaneous.map(m => ({
          id: m.id,
          serviceName: m.serviceName,
          serviceProviderName: m.serviceProviderName,
          serviceId: m.serviceId
        }))
      });
      console.log('[MANUAL_SAVE] draftQuote.selectedMiscellaneous:', {
        count: draftQuote.selectedMiscellaneous?.length || 0,
        services: draftQuote.selectedMiscellaneous?.map(m => ({
          id: m.id,
          serviceName: m.serviceName,
          serviceId: m.serviceId
        })) || []
      });
      console.log('[MANUAL_SAVE] === FIN ÉTAT AVANT SAUVEGARDE ===');
      
      // 🔥 MISE À JOUR DU DRAFTQUOTE LOCAL AVANT LA SAUVEGARDE API
      console.log('[MANUAL_SAVE] 📝 Mise à jour de draftQuote (autoSave désactivée)');
      
      // Mettre à jour l'état local avec les services actuellement sélectionnés
      if (currentlySelectedMiscellaneous && currentlySelectedMiscellaneous.length > 0) {
        console.log('[MANUAL_SAVE] Mise à jour de l\'état local avec les services sélectionnés');
        
        // Mapper les services pour l'état local (même logique que pour l'API)
        const mappedForLocal = currentlySelectedMiscellaneous.map(m => {
          // Même logique de recherche du serviceId numérique
          let numericServiceId = 0;
          if (m.serviceProviderId && !isNaN(parseInt(m.serviceProviderId, 10))) {
            numericServiceId = parseInt(m.serviceProviderId, 10);
          } else if (m.serviceId && !isNaN(parseInt(m.serviceId, 10))) {
            numericServiceId = parseInt(m.serviceId, 10);
          } else {
            console.warn('[MANUAL_SAVE] Aucun serviceId numérique valide trouvé pour:', m);
            numericServiceId = 0;
          }
          
          return {
            id: m.id,
            supplierName: m.serviceProviderName || '',
            currency: m.currency || 'EUR',
            serviceId: numericServiceId,
            serviceName: m.serviceName || `Service ${numericServiceId}`,
            price: parseFloat(m.pricing?.basePrice || '0') || 0,
            validUntil: m.validity?.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          };
        });
        
        console.log('[MANUAL_SAVE] Services mappés pour état local:', {
          count: mappedForLocal.length,
          services: mappedForLocal.map(m => ({ serviceId: m.serviceId, serviceName: m.serviceName }))
        });
        
        // Mettre à jour draftQuote avec les nouveaux services
        setDraftQuote(dq => ({
          ...dq,
          selectedMiscellaneous: mappedForLocal,
          miscTotal: mappedForLocal.reduce((sum, m) => sum + m.price, 0),
          step6: {
            selectedMiscellaneous: mappedForLocal,
            completed: mappedForLocal.length > 0
          }
        }));
        
        console.log('[MANUAL_SAVE] État local mis à jour avec', mappedForLocal.length, 'services');
      } else {
        console.log('[MANUAL_SAVE] Aucun service sélectionné - vidage de l\'état local');
        
        // Vider l'état local si aucun service sélectionné
        setDraftQuote(dq => ({
          ...dq,
          selectedMiscellaneous: [],
          miscTotal: 0,
          step6: {
            selectedMiscellaneous: [],
            completed: false
          }
        }));
      }
      
      console.log('[MANUAL_SAVE] 🚀 État local mis à jour (autoSave désactivée)');
      console.log('[MANUAL_SAVE] Vérification des fonctions de sauvegarde:', {
        createDraft: !!createDraft,
        updateDraft: !!updateDraft
      });
      
      // ✅ SAUVEGARDE MANUELLE VERS L'API
      console.log('[MANUAL_SAVE] 🚀 Début de la sauvegarde vers l\'API...');
      
      // 🔍 VÉRIFICATION FINALE DE STEP5 AVANT L'ENVOI API
      console.log('[MANUAL_SAVE] 🔍 === VÉRIFICATION FINALE DE STEP5 AVANT ENVOI API ===');
      console.log('[MANUAL_SAVE] 🔍 État final de draftQuote.step5:', {
        hasStep5: !!draftQuote.step5,
        step5Type: typeof draftQuote.step5,
        step5Keys: draftQuote.step5 ? Object.keys(draftQuote.step5) : 'N/A'
      });
      
      if (draftQuote.step5) {
        console.log('[MANUAL_SAVE] 🔍 Step5 final complet:', JSON.stringify(draftQuote.step5, null, 2));
        console.log('[MANUAL_SAVE] 🔍 Step5.selections final:', {
          count: draftQuote.step5.selections?.length || 0,
          firstSelection: draftQuote.step5.selections?.[0] ? {
            id: draftQuote.step5.selections[0].id,
            seafreightId: draftQuote.step5.selections[0].seafreightId,
            carrierName: draftQuote.step5.selections[0].carrier?.name,
            basePrice: draftQuote.step5.selections[0].charges?.basePrice,
            totalPrice: draftQuote.step5.selections[0].charges?.totalPrice
          } : 'Aucune sélection'
        });
      } else {
        console.log('[MANUAL_SAVE] 🔍 ❌ Step5 est toujours undefined avant l\'envoi API');
      }
      console.log('[MANUAL_SAVE] 🔍 === FIN VÉRIFICATION FINALE DE STEP5 ===');
      
      try {
        let saveResult;
        
        if (draftId) {
          // ✅ Mise à jour d'un brouillon existant (PUT)
          console.log('[MANUAL_SAVE] 🔄 Mise à jour du brouillon existant...');
          saveResult = await updateDraft();
        } else {
          // ✅ Création d'un nouveau brouillon (POST)
          console.log('[MANUAL_SAVE] 🚀 Création d\'un nouveau brouillon...');
          saveResult = await createDraft();
        }
        
        if (saveResult) {
          console.log('[MANUAL_SAVE] ✅ Sauvegarde API réussie');
          showSnackbar('Devis sauvegardé avec succès dans la base de données', 'success');
        } else {
          console.error('[MANUAL_SAVE] ❌ Échec de la sauvegarde API');
          showSnackbar('Erreur lors de la sauvegarde vers la base de données', 'warning');
        }
      } catch (error) {
        console.error('[MANUAL_SAVE] ❌ Erreur lors de la sauvegarde API:', error);
        showSnackbar('Erreur lors de la sauvegarde vers la base de données', 'warning');
      }
      
      debugLog('MANUAL_SAVE - Sauvegarde manuelle terminée');
    } catch (error) {
      debugLog('MANUAL_SAVE - Erreur sauvegarde manuelle', { error });
      showSnackbar('Erreur lors de la sauvegarde', 'warning');
    }
  }, [activeStep, autoSave, debugLog]);

  // ❌ DÉSACTIVÉ: Plus de sauvegarde automatique avant l'étape 7
  // useEffect(() => {
  //   const autoSaveBeforeStep7 = async () => {
  //     if (activeStep === 7 && !currentDraftId && !isSaving) {
  //       console.log('[RequestWizard] Auto-sauvegarde avant étape 7 - brouillon non sauvegardé détecté');
  //       try {
  //         await handleManualSave();
  //       } catch (error) {
  //         console.error('[RequestWizard] Erreur lors de la sauvegarde automatique avant étape 7:', error);
  //       }
  //     }
  //   };
  //
  //   autoSaveBeforeStep7();
  // }, [activeStep, currentDraftId, isSaving, handleManualSave]);
  
  console.log('⚠️ Sauvegarde automatique avant étape 7 désactivée - sauvegarde manuelle uniquement');

  // Supprimé: Synchronisation wizardState (redondante avec draftQuote)

  // === STRATÉGIE DE SAUVEGARDE HYBRIDE ===
  // ✅ SAUVEGARDE LOCALE AUTOMATIQUE : Tous les changements sont sauvegardés en local
  // ✅ SAUVEGARDE API MANUELLE : Le bouton SaveButton sauvegarde vers la base de données
  // ✅ Sauvegarde locale toutes les 2 secondes après un changement
  // ✅ Sauvegarde API uniquement sur demande de l'utilisateur
  // ✅ Les triggers automatiques locaux sont actifs pour la persistance locale
  // ✅ Les triggers automatiques API sont désactivés pour éviter les surcharges

  // Persistance locale automatique + Persistance API manuelle

  // Démarrage du wizard à partir d'une demande existante (RequestList/Request)
  useEffect(() => {
    if (location.state?.requestData) {
      const request = location.state.requestData;
      setDraftQuote(dq => ({
        ...dq,
        step1: {
          ...dq.step1,
          customer: request.customerId ? { contactId: request.customerId, contactName: request.companyName } : undefined,
          cityFrom: (request.pickupLocation?.city || request.pickupCity) ? { 
            cityName: request.pickupLocation?.city || request.pickupCity, 
            name: request.pickupLocation?.city || request.pickupCity,
            country: request.pickupLocation?.country || request.pickupCountry || ''
          } : undefined,
          cityTo: (request.deliveryLocation?.city || request.deliveryCity) ? { 
            cityName: request.deliveryLocation?.city || request.deliveryCity, 
            name: request.deliveryLocation?.city || request.deliveryCity,
            country: request.deliveryLocation?.country || request.deliveryCountry || ''
          } : undefined,
          productName: request.productId ? { productId: request.productId, productName: request.productName } : undefined,
          status: request.status || 'NEW',
          assignee: request.assigneeId || request.assignee || '',
          comment: request.additionalComments || '',
          incotermName: request.incoterm || '',
          pickupLocation: request.pickupLocation,
          deliveryLocation: request.deliveryLocation,
        }
        // ... autres mappings si besoin
      }));
      setActiveStep(0); // Toujours démarrer à l'étape 1
    }
  }, [location.state]);

  // À la validation finale, le payload est généré à partir de draftQuote
  const handleFinalValidation = async (_validationData: any) => {
    setIsCreatingQuote(true);
    try {
      const _payload = {
        ...draftQuote,
        // mapping ou adaptation si besoin
      };
      // ... envoi à l'API, etc.
    } finally {
      setIsCreatingQuote(false);
    }
  };

  // Récupérer les données de la requête si elles sont passées via le state
  useEffect(() => {
    // Ajout log debug
    console.log("[RequestWizard] requestData reçu :", location.state?.requestData);
    console.log("[RequestWizard] source :", location.state?.source);
    console.log("[RequestWizard] État des données chargées:", {
      customers: customers?.data?.length || 0,
      cities: cities?.length || 0,
      products: products?.length || 0,
      isLoadingCustomers,
      isLoadingCities
    });
    
    if (!location.state?.requestData) return;
    // Attendre que les données soient chargées, mais permettre le mapping même si certaines données ne sont pas encore disponibles
    if (!customers?.data && !isLoadingCustomers) return;

    const requestDataFromState = location.state.requestData;
    const source = location.state.source || 'unknown';

    // Mapping client
    let customer = requestDataFromState.customer;
    if (!customer) {
      if (requestDataFromState.customerId && customers?.data) {
        customer = customers.data.find(c => c.contactId === requestDataFromState.customerId);
      } else if (requestDataFromState.customerName && customers?.data) {
        customer = customers.data.find(c => c.contactName?.toLowerCase().includes(requestDataFromState.customerName.toLowerCase()));
      }
    }

    // Mapping villes (cityFrom)
    let cityFrom = requestDataFromState.cityFrom;
    if (!cityFrom) {
      // Essayer de trouver par ID si cities est chargé
      if (requestDataFromState.departureId && cities) {
        cityFrom = cities.find(c => c.id === requestDataFromState.departureId);
      }
      // Essayer de trouver par nom si cities est chargé
      if (!cityFrom && requestDataFromState.departure && cities) {
        const dep = requestDataFromState.departure.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
        cityFrom = cities.find(c =>
          c.name?.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') === dep ||
          `${c.name}, ${c.country}`.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') === dep ||
          c.name?.toLowerCase().includes(dep)
        );
      }
      // Si cities n'est pas chargé ou si on n'a pas trouvé, créer un objet temporaire
      if (!cityFrom && requestDataFromState.departure) {
        cityFrom = {
          name: requestDataFromState.departure,
          cityName: requestDataFromState.departure,
          country: requestDataFromState.departureCountry || ''
        };
        console.log('[DEBUG][RequestWizard] cityFrom créé temporairement:', cityFrom);
      }
    }
    console.log('[DEBUG][RequestWizard] cityFrom final:', cityFrom);
    
    // Mapping villes (cityTo)
    let cityTo = requestDataFromState.cityTo;
    if (!cityTo) {
      // Essayer de trouver par ID si cities est chargé
      if (requestDataFromState.arrivalId && cities) {
        cityTo = cities.find(c => c.id === requestDataFromState.arrivalId);
      }
      // Essayer de trouver par nom si cities est chargé
      if (!cityTo && requestDataFromState.arrival && cities) {
        const arr = requestDataFromState.arrival.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
        cityTo = cities.find(c =>
          c.name?.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') === arr ||
          `${c.name}, ${c.country}`.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') === arr ||
          c.name?.toLowerCase().includes(arr)
        );
      }
      // Si cities n'est pas chargé ou si on n'a pas trouvé, créer un objet temporaire
      if (!cityTo && requestDataFromState.arrival) {
        cityTo = {
          name: requestDataFromState.arrival,
          cityName: requestDataFromState.arrival,
          country: requestDataFromState.arrivalCountry || ''
        };
        console.log('[DEBUG][RequestWizard] cityTo créé temporairement:', cityTo);
      }
    }
    console.log('[DEBUG][RequestWizard] cityTo final:', cityTo);
    // Mapping produit
    let productName = requestDataFromState.productName;
    if (!productName && requestDataFromState.productId && products) {
      productName = products.find(p => p.productId === requestDataFromState.productId);
    }
    if (!productName && requestDataFromState.productName && products) {
      const prod = requestDataFromState.productName.toLowerCase();
      productName = products.find(p =>
        p.productName?.toLowerCase() === prod ||
        p.productName?.toLowerCase().includes(prod)
      );
    }
    // Si products n'est pas chargé ou si on n'a pas trouvé, créer un objet temporaire
    if (!productName && requestDataFromState.productName) {
      productName = {
        productId: requestDataFromState.productId || 'temp',
        productName: requestDataFromState.productName
      };
      console.log('[DEBUG][RequestWizard] productName créé temporairement:', productName);
    }
    console.log('[DEBUG][RequestWizard] productName final:', productName);
    if (!cityFrom) console.warn('[WARN][RequestWizard] cityFrom non trouvé');
    if (!cityTo) console.warn('[WARN][RequestWizard] cityTo non trouvé');
    if (!productName) console.warn('[WARN][RequestWizard] productName non trouvé');

    const mappedStep1 = {
      ...draftQuote.step1,
      customer,
      cityFrom,
      cityTo,
      assignee: requestDataFromState.assignee || '',
      comment: requestDataFromState.comment || '',
      status: requestDataFromState.status || 'NEW',
      productName: productName || '',
      incotermName: requestDataFromState.incotermName || requestDataFromState.incoterm || '',
      pickupLocation: requestDataFromState.pickupLocation || undefined,
      deliveryLocation: requestDataFromState.deliveryLocation || undefined,
      // ...autres champs à pré-remplir
    };
    console.log('[DEBUG][RequestWizard] Initialisation - mappedStep1 :', mappedStep1);

    // Si les données viennent de la liste, on peut déjà définir l'ID de la demande
    if (source === 'list' && requestDataFromState.requestQuoteId) {
      setRequestId(String(requestDataFromState.requestQuoteId));
      setRequestData(requestDataFromState);
      console.log('[RequestWizard] ID de demande défini depuis la liste:', requestDataFromState.requestQuoteId);
    } else if (source === 'api' && requestDataFromState.requestQuoteId) {
      // Si les données viennent de l'API, on a déjà les données complètes
      setRequestId(String(requestDataFromState.requestQuoteId));
      setRequestData(requestDataFromState);
      console.log('[RequestWizard] ID de demande défini depuis l\'API:', requestDataFromState.requestQuoteId);
    }

    setDraftQuote(prev => ({
      ...prev,
      step1: mappedStep1
    }));
    // Forcer le démarrage à l'étape 0 (step 0)
    setActiveStep(0);
  }, [location.state, customers, cities, products]);

  // Re-mapper les données une fois que cities et products sont chargés
  useEffect(() => {
    if (!location.state?.requestData || !cities || !products) return;
    
    const requestDataFromState = location.state.requestData;
    console.log('[DEBUG][RequestWizard] Re-mapping avec données chargées:', {
      citiesLength: cities.length,
      productsLength: products.length
    });

    // Re-mapper cityFrom si on a maintenant les données
    let cityFrom = draftQuote.step1.cityFrom;
    if (!cityFrom?.id && requestDataFromState.departure) {
      const dep = requestDataFromState.departure.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
      const foundCityFrom = cities.find(c =>
        c.name?.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') === dep ||
        `${c.name}, ${c.country}`.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') === dep ||
        c.name?.toLowerCase().includes(dep)
      );
      if (foundCityFrom) {
        cityFrom = foundCityFrom;
        console.log('[DEBUG][RequestWizard] cityFrom re-mappé:', cityFrom);
      }
    }

    // Re-mapper cityTo si on a maintenant les données
    let cityTo = draftQuote.step1.cityTo;
    if (!cityTo?.id && requestDataFromState.arrival) {
      const arr = requestDataFromState.arrival.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
      const foundCityTo = cities.find(c =>
        c.name?.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') === arr ||
        `${c.name}, ${c.country}`.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') === arr ||
        c.name?.toLowerCase().includes(arr)
      );
      if (foundCityTo) {
        cityTo = foundCityTo;
        console.log('[DEBUG][RequestWizard] cityTo re-mappé:', cityTo);
      }
    }

    // Re-mapper productName si on a maintenant les données
    let productName = draftQuote.step1.productName;
    if (!productName?.productId && requestDataFromState.productName) {
      const prod = requestDataFromState.productName.toLowerCase();
      const foundProduct = products.find(p =>
        p.productName?.toLowerCase() === prod ||
        p.productName?.toLowerCase().includes(prod)
      );
      if (foundProduct) {
        productName = foundProduct;
        console.log('[DEBUG][RequestWizard] productName re-mappé:', productName);
      }
    }

    // Mettre à jour le state si on a trouvé de nouvelles correspondances
    if (cityFrom !== draftQuote.step1.cityFrom || cityTo !== draftQuote.step1.cityTo || productName !== draftQuote.step1.productName) {
      setDraftQuote(prev => ({
        ...prev,
        step1: {
          ...prev.step1,
          cityFrom,
          cityTo,
          productName
        }
      }));
      console.log('[DEBUG][RequestWizard] State mis à jour avec données re-mappées');
    }
  }, [cities, products, location.state?.requestData]);

  const handleRequestSaved = async () => {
    try {
      // Si on a déjà un requestId, on fait un PUT pour mettre à jour la demande
      if (requestId) {
        // Mapping des champs pour correspondre à RequestQuoteViewModel
        const step1 = draftQuote.step1;
        const body = {
          customerId: step1.customer?.contactId,
          pickupLocation: step1.pickupLocation,
          deliveryLocation: step1.deliveryLocation,
          productId: step1.productName?.productId,
          productName: step1.productName?.productName || step1.productName,
          assigneeId: step1.assignee,
          incoterm: step1.incotermName,
          comment: step1.comment,
          status: step1.status,
          // Ajoute ici d'autres champs nécessaires selon RequestQuoteViewModel
        };
        console.log('[RequestWizard] Mise à jour de la demande existante avec payload:', body);
        await putApiRequestUpdateById({ path: { id: requestId }, body });
        setActiveStep(0); // ou currentStep + 1 selon ta logique
        return;
      }
      // Mapping des champs pour correspondre à RequestQuoteViewModel
      const step1 = draftQuote.step1;
      const body = {
        customerId: step1.customer?.contactId,
        pickupLocation: step1.pickupLocation,
        deliveryLocation: step1.deliveryLocation,
        productId: step1.productName?.productId,
        productName: step1.productName?.productName || step1.productName,
        assigneeId: step1.assignee,
        incoterm: step1.incotermName,
        comment: step1.comment,
        status: step1.status,
        // Ajoute ici d'autres champs nécessaires selon RequestQuoteViewModel
      };
      
      console.log('[RequestWizard] Création de la demande avec payload:', body);
      
      // 1. Créer la demande
      const createResponse = await postApiRequest({ body });
      console.log('[RequestWizard] Réponse création demande:', createResponse);
      
      // 2. Extraire l'ID de la demande créée (plusieurs méthodes possibles)
      let requestIdFromResponse: string | null = null;
      
      if (createResponse && 'data' in createResponse && (createResponse as any).data?.requestQuoteId) {
        requestIdFromResponse = String((createResponse as any).data.requestQuoteId);
      } else if (createResponse && 'data' in createResponse && (createResponse as any).data?.id) {
        requestIdFromResponse = String((createResponse as any).data.id);
      } else if (createResponse && typeof createResponse === 'object') {
        // Fallback: essayer d'extraire l'ID de la réponse
        const values = Object.values(createResponse);
        if (values.length > 0) {
          requestIdFromResponse = String(values[0]);
        }
      }
      
      if (!requestIdFromResponse) {
        throw new Error('Impossible de récupérer l\'ID de la demande créée');
      }
      
      console.log('[RequestWizard] ID de demande extrait:', requestIdFromResponse);
      
      // 3. Récupérer les données complètes de la demande via getApiRequestById
      console.log('[RequestWizard] Récupération des données complètes de la demande...');
      const requestDataResponse = await getApiRequestById({ path: { id: requestIdFromResponse } });
      
      if (requestDataResponse && requestDataResponse.data) {
        console.log('[RequestWizard] Données complètes de la demande récupérées:', requestDataResponse.data);
        
        // 4. Stocker l'ID numérique et les données complètes
        setRequestId(requestIdFromResponse);
        setRequestData(requestDataResponse.data);
        
        // 5. Passer à l'étape 0
        setActiveStep(0);
        
        showSnackbar('Demande créée avec succès', 'success');
      } else {
        throw new Error('Impossible de récupérer les données de la demande');
      }
      
    } catch (error) {
      console.error('[RequestWizard] Erreur lors de la création/récupération de la demande:', error);
      
      // Gestion d'erreur améliorée avec messages spécifiques
      let errorMessage = 'Erreur lors de la création de la demande';
      
      if (error instanceof Error) {
        // Erreurs spécifiques de l'API
        if (error.message.includes('400') || error.message.includes('Bad Request')) {
          errorMessage = 'Données de demande invalides. Veuillez vérifier les informations saisies.';
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorMessage = 'Vous n\'avez pas les permissions pour créer une demande.';
        } else if (error.message.includes('409') || error.message.includes('Conflict')) {
          errorMessage = 'Une demande similaire existe déjà.';
        } else if (error.message.includes('422') || error.message.includes('Unprocessable Entity')) {
          errorMessage = 'Données de demande incomplètes ou incorrectes.';
        } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        } else if (error.message.includes('Network Error') || error.message.includes('fetch')) {
          errorMessage = 'Problème de connexion. Vérifiez votre connexion internet.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Délai d\'attente dépassé. Veuillez réessayer.';
        } else {
          // Utiliser le message d'erreur original si disponible
          errorMessage = error.message || 'Erreur lors de la création de la demande';
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      // Afficher le message d'erreur avec le type 'warning'
      showSnackbar(errorMessage, 'warning');
      
      // Optionnel : Afficher aussi dans la console pour le debug
      console.error('[RequestWizard] Détails de l\'erreur:', {
        message: errorMessage,
        originalError: error,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleContainerChange = (serviceId: string, container: any) => {
    setDraftQuote(dq => ({ ...dq, selectedContainers: { ...dq.selectedContainers, [serviceId]: container } }));
  };

  // Helper pour savoir si le service 'container positionning' est sélectionné
  const hasContainerPositionning = draftQuote.step2?.selected?.some(
    (service: any) =>
      service.name?.toLowerCase() === "container positionning" ||
      service.serviceName?.toLowerCase() === "container positionning"
  ) || false;

  // === NOUVEAU : verrouillage des champs structurels si au moins une option ===
  // const locked = savedOptions.length > 0; // Variable non utilisée

  // 1. Handler pour valider l'option depuis Step7Recap
  const handleValidateActiveOption = () => {
    if (typeof editingOptionIndex === 'number' && savedOptions[editingOptionIndex]) {
      setSelectedOptionForValidation(savedOptions[editingOptionIndex]);
      setShowFinalValidation(true);

      // Synchronise l'option active
    }
  };

  // 2. Handler pour valider une option depuis la comparaison
  const handleValidateOptionFromCompare = (index: number) => {
    if (savedOptions[index]) {
      setSelectedOptionForValidation(savedOptions[index]);
      setShowFinalValidation(true);
      setShowComparison(false);
      setEditingOptionIndex(index); // Synchronise l'option active

    }
  };

  // === VALIDATION D'ÉTAPE OPTIMISÉE ===
  const canProceedToNextStep = useMemo(() => {
    debugLog('VALIDATION - Vérification étape courante', { 
      activeStep, 
      isFromExistingRequest,
      stepData: draftQuote.step1 
    });
    
    switch (activeStep) {
      case 0: // Étape 1 - Si demande existante, autoriser le passage. Sinon, validation classique
        if (isFromExistingRequest) {
          // Wizard démarré depuis demande existante : toujours autoriser le passage
          return true;
        }
        
        // Nouveau wizard : validation classique
        const s1 = draftQuote.step1;
        
        // Validation flexible du client
        const customerValid = s1?.customer && (s1.customer.name || s1.customer.contactName || s1.customer.contactId);
        
        // Validation flexible des villes
        const cityFromValid = s1?.cityFrom && (s1.cityFrom.name || s1.cityFrom.cityName || (typeof s1.cityFrom === 'string' && s1.cityFrom.trim()));
        const cityToValid = s1?.cityTo && (s1.cityTo.name || s1.cityTo.cityName || (typeof s1.cityTo === 'string' && s1.cityTo.trim()));
        
        // Validation produit et incoterm
        const productValid = s1?.productName;
        const incotermValid = s1?.incotermName && s1.incotermName.trim();
        
        return !!(customerValid && cityFromValid && cityToValid && productValid && incotermValid);
      
      case 1: // Étape 2 - Au moins un service sélectionné
      return draftQuote.step2?.selected && draftQuote.step2.selected.length > 0;
      
      case 2: // Étape 3 - Ports renseignés
        return !!(draftQuote.step1?.portFrom && draftQuote.step1?.portTo);
      
      case 3: // Étape 4 - Haulage sélectionné - NOUVELLE STRUCTURE step4
        return !!draftQuote.step4?.selection?.offerId;
      
      case 4: // Étape 5 - Seafreight sélectionné - NOUVELLE STRUCTURE step5
        return draftQuote.step5?.selections && draftQuote.step5.selections.length > 0;
      
      case 5: // Étape 6 - Miscellaneous (pas de validation stricte)
      default:
    return true;
    }
  }, [draftQuote, activeStep, debugLog]);

  // === FONCTIONS DE CALCUL AUTOMATIQUE (IDENTIQUES À STEP7RECAP) ===
  
  // ✅ REMOVED - Now imported from '../utils'

  // ✅ REMOVED - Now imported from '../utils'

  // ✅ REMOVED - Now imported from '../utils'


  // ✅ REMOVED - Now imported from '../utils'

  // === FONCTION DE RECALCUL AUTOMATIQUE DES OPTIONS ===
  const recalculateOptionTotals = (option: any) => {
    const haulageTotal = computeHaulageTotal(option);
    const seafreightTotal = computeSeafreightTotal(option);
    const miscTotal = computeMiscTotal(option);
    const costPrice = computeCostPrice(option);
    const totalPrice = computeTotalPrice(option);

    return {
      ...option,
      haulageTotal,
      seafreightTotal,
      miscTotal,
      costPrice,
      totalPrice
    };
  };

  // === NOUVELLE FONCTION : MISE À JOUR DES QUANTITÉS AVEC RECALCUL AUTOMATIQUE ===
  const updateSavedOptionQuantities = (optionIndex: number, quantityUpdates: any) => {
    if (optionIndex < 0 || optionIndex >= savedOptions.length) {
      console.warn('[Wizard] Index d\'option invalide pour mise à jour des quantités:', optionIndex);
      return;
    }

    const updatedOptions = [...savedOptions];
    const currentOption = updatedOptions[optionIndex];
    
    // Mettre à jour les quantités selon le type
    if (quantityUpdates.haulageQuantity !== undefined) {
      currentOption.haulageQuantity = quantityUpdates.haulageQuantity;
    }
    if (quantityUpdates.seafreightQuantities) {
      currentOption.seafreightQuantities = {
        ...currentOption.seafreightQuantities,
        ...quantityUpdates.seafreightQuantities
      };
    }
    if (quantityUpdates.miscQuantities) {
      currentOption.miscQuantities = {
        ...currentOption.miscQuantities,
        ...quantityUpdates.miscQuantities
      };
    }
    if (quantityUpdates.surchargeQuantities) {
      // Pour les surcharges, on doit fusionner correctement la structure imbriquée
      const currentSurcharges = currentOption.surchargeQuantities || {};
      const newSurcharges = quantityUpdates.surchargeQuantities;
      
      // Fusionner les surcharges par offerId
      Object.keys(newSurcharges).forEach(offerId => {
        currentSurcharges[offerId] = {
          ...currentSurcharges[offerId],
          ...newSurcharges[offerId]
        };
      });
      
      currentOption.surchargeQuantities = currentSurcharges;
    }

    // === RECALCUL AUTOMATIQUE DES TOTAUX ===
    const recalculatedOption = recalculateOptionTotals(currentOption);
    updatedOptions[optionIndex] = recalculatedOption;

    console.log('[Wizard] Option recalculée après modification des quantités:', {
      optionIndex,
      oldTotals: {
        haulageTotal: currentOption.haulageTotal,
        seafreightTotal: currentOption.seafreightTotal,
        miscTotal: currentOption.miscTotal,
        costPrice: currentOption.costPrice,
        totalPrice: currentOption.totalPrice
      },
      newTotals: {
        haulageTotal: recalculatedOption.haulageTotal,
        seafreightTotal: recalculatedOption.seafreightTotal,
        miscTotal: recalculatedOption.miscTotal,
        costPrice: recalculatedOption.costPrice,
        totalPrice: recalculatedOption.totalPrice
      }
    });

    setSavedOptions(updatedOptions);
  };

  // === FONCTION DE RECALCUL AUTOMATIQUE POUR LES MARGES ===
  const recalculateOptionMargins = (optionIndex: number, marginType: 'percent' | 'fixed', marginValue: number) => {
    if (optionIndex < 0 || optionIndex >= savedOptions.length) {
      console.warn('[Wizard] Index d\'option invalide pour mise à jour des marges:', optionIndex);
      return;
    }

    const updatedOptions = [...savedOptions];
    const currentOption = updatedOptions[optionIndex];
    
    // Mettre à jour les marges
    currentOption.marginType = marginType;
    currentOption.marginValue = marginValue;
    
    // Recalculer le totalPrice avec les nouvelles marges
    const recalculatedOption = recalculateOptionTotals(currentOption);
    updatedOptions[optionIndex] = recalculatedOption;

    console.log('[Wizard] Option recalculée après modification des marges:', {
      optionIndex,
      marginType,
      marginValue,
      oldTotalPrice: currentOption.totalPrice,
      newTotalPrice: recalculatedOption.totalPrice
    });

    setSavedOptions(updatedOptions);
  };

  // === FONCTION UTILITAIRE POUR MISE À JOUR SÛRE DU DRAFTQUOTE ===
  const updateDraftQuoteSafely = useCallback((updater: (prev: DraftQuote) => Partial<DraftQuote>) => {
    setDraftQuote(prev => ({
      ...prev, // ✅ Conserver toutes les propriétés existantes
      ...updater(prev) // ✅ Appliquer les mises à jour
    }));
  }, []);

  // === EFFET POUR FORCER LA SYNCHRONISATION STEP5 AUTOMATIQUEMENT ===
  useEffect(() => {
    // Vérifier si selectedSeafreights existe mais step5.selections est vide
    if (draftQuote.selectedSeafreights && 
        draftQuote.selectedSeafreights.length > 0 && 
        (!draftQuote.step5?.selections || draftQuote.step5.selections.length === 0)) {
      
      console.log('[AUTO_SYNC] 🔄 Détection de désynchronisation step5 - Correction automatique...');
      console.log('[AUTO_SYNC] selectedSeafreights:', draftQuote.selectedSeafreights.length);
      console.log('[AUTO_SYNC] step5.selections:', draftQuote.step5?.selections?.length || 0);
      
      // ✅ SUPPRIMÉ: Plus de synchronisation locale nécessaire
      // setTimeout(() => {
      //   console.log('[AUTO_SYNC] Déclenchement de la synchronisation...');
      //   syncDraftQuoteLocally();
      // }, 100);
    }
  }, [draftQuote.selectedSeafreights, draftQuote.step5?.selections]);

  // === EFFET POUR FORCER LA SYNCHRONISATION STEP6 AUTOMATIQUEMENT ===
  useEffect(() => {
    // Vérifier si selectedMiscellaneous existe mais step6.selections est vide
    if (draftQuote.selectedMiscellaneous && 
        draftQuote.selectedMiscellaneous.length > 0 && 
        (!draftQuote.step6?.selections || draftQuote.step6.selections.length === 0)) {
      
      console.log('[AUTO_SYNC_STEP6] 🔄 Détection de désynchronisation step6 - Correction automatique...');
      console.log('[AUTO_SYNC_STEP6] selectedMiscellaneous:', draftQuote.selectedMiscellaneous.length);
      console.log('[AUTO_SYNC_STEP6] step6.selections:', draftQuote.step6?.selections?.length || 0);
      
      // ✅ SUPPRIMÉ: Plus de synchronisation locale nécessaire
      // setTimeout(() => {
      //   console.log('[AUTO_SYNC_STEP6] Déclenchement de la synchronisation...');
      //   syncDraftQuoteLocally();
      // }, 100);
    }
  }, [draftQuote.selectedMiscellaneous, draftQuote.step6?.selections]);

  // === EFFET POUR FORCER LA SYNCHRONISATION STEP4 AUTOMATIQUEMENT ===
  // ✅ SUPPRIMÉ: Plus de synchronisation automatique nécessaire avec step4
  // useEffect(() => {
  //   // Vérifier si selectedHaulage existe mais step4 est vide ou incomplet
  //   if (draftQuote.selectedHaulage && 
  //       (!draftQuote.step4?.selection?.offerId || draftQuote.step4.selection.offerId !== draftQuote.selectedHaulage.offerId)) {
  //     
  //     console.log('[AUTO_SYNC_STEP4] 🔄 Détection de désynchronisation step4 - Correction automatique...');
  //     console.log('[AUTO_SYNC_STEP4] selectedHaulage offerId:', draftQuote.selectedHaulage.offerId);
  //     console.log('[AUTO_SYNC_STEP4] step4.selection offerId:', draftQuote.step4?.selection?.offerId || 'undefined');
  //     
  //     // Attendre un petit délai pour éviter les boucles de render
  //     setTimeout(() => {
  //       console.log('[AUTO_SYNC_STEP4] Déclenchement de la synchronisation...');
  //       syncDraftQuoteLocally();
  //     }, 100);
  //   }
  // }, [draftQuote.selectedHaulage, draftQuote.step4?.selection?.offerId]);
  
  // ✅ SUPPRIMÉ: Plus de synchronisation locale nécessaire avec step4
  // const syncDraftQuoteLocally = useCallback(() => {
  //   console.log('[SYNC_LOCAL] 🔄 🔥 FONCTION APPELÉE - Synchronisation complète du draftQuote local...');
  //   console.log('[SYNC_LOCAL] 🔍 État initial:', {
  //     hasSelectedHaulage: !!draftQuote.selectedHaulage,
  //     selectedSeafreightsCount: draftQuote.selectedSeafreights?.length || 0,
  //     selectedMiscCount: draftQuote.selectedMiscellaneous?.length || 0,
  //     step4Exists: !!draftQuote.step4,
  //     step5Exists: !!draftQuote.step5,
  //     step6Exists: !!draftQuote.step6
  //   });
  //   
  //   const updatedDraftQuote = { ...draftQuote };
  //   
  //   // === SYNCHRONISER STEP4 ===
  //   console.log('[SYNC_LOCAL] 🔍 === SYNCHRONISATION STEP4 ===');
  //   console.log('[SYNC_LOCAL] 🔍 selectedHaulage:', {
  //     exists: !!draftQuote.selectedHaulage,
  //     offerId: draftQuote.selectedHaulage?.offerId,
  //     haulierName: draftQuote.selectedHaulage?.haulierName,
  //     pickupLocation: draftQuote.selectedHaulage?.pickupLocation,
  //     loadingLocation: draftQuote.selectedHaulage?.loadingLocation,
  //     deliveryLocation: draftQuote.selectedHaulage?.deliveryLocation,
  //     deliveryPort: draftQuote.selectedHaulage?.deliveryPort,
  //     fullObject: draftQuote.selectedHaulage
  //   });
  //   
  //   if (draftQuote.selectedHaulage) {
  //     updatedDraftQuote.step4 = {
  //       selection: {
  //         offerId: draftQuote.selectedHaulage.offerId || '',
  //         haulierId: draftQuote.selectedHaulage.haulierId || 0,
  //         haulierName: draftQuote.selectedHaulage.haulierName || '',
  //         tariff: {
  //           unitPrice: draftQuote.selectedHaulage.unitTariff || 0,
  //           currency: draftQuote.selectedHaulage.currency || 'EUR',
  //           freeTime: draftQuote.selectedHaulage.freeTime || 0
  //         },
  //         route: {
  //           pickup: {
  //             company: (() => {
  //               const displayName = draftQuote.selectedHaulage.pickupLocation?.displayName || '';
  //               const parts = displayName.split(',');
  //               return parts[0]?.trim() || '';
  //             })(),
  //             city: (() => {
  //               const displayName = draftQuote.selectedHaulage.pickupLocation?.displayName || '';
  //               const parts = displayName.split(',');
  //               if (parts.length >= 2) {
  //                 const cityPart = parts[1]?.trim() || '';
  //                 return cityPart.replace(/^\d+\s+/, '');
  //               }
  //               return '';
  //             })(),
  //             country: (() => {
  //               const displayName = draftQuote.selectedHaulage.pickupLocation?.displayName || '';
  //               const parts = displayName.split(',');
  //               return parts[parts.length - 1]?.trim() || '';
  //             })()
  //           },
  //           delivery: {
  //             portId: (() => {
  //               return draftQuote.step1?.portTo?.portId || 0;
  //             })(),
  //             portName: (() => {
  //               if (draftQuote.selectedHaulage.deliveryLocation?.displayName) {
  //                 const displayName = draftQuote.selectedHaulage.deliveryLocation.displayName;
  //                 const parts = displayName.split(',');
  //                 return parts[0]?.trim() || displayName;
  //               }
  //               return draftQuote.step1?.portTo?.portName || '';
  //             })(),
  //             country: (() => {
  //               const displayName = draftQuote.selectedHaulage.deliveryLocation?.displayName || '';
  //               const parts = displayName.split(',');
  //               return parts[parts.length - 1]?.trim() || '';
  //             })()
  //           }
  //         },
  //         validity: {
  //           validUntil: draftQuote.selectedHaulage.validUntil 
  //             ? (typeof draftQuote.selectedHaulage.validUntil === 'string' 
  //                 ? draftQuote.selectedHaulage.validUntil 
  //                 : draftQuote.selectedHaulage.validUntil.toISOString())
  //             : new Date().toISOString()
  //         }
  //       },
  //       calculation: {
  //         quantity: draftQuote.haulageQuantity || 1,
  //         unitPrice: draftQuote.selectedHaulage.unitTariff || draftQuote.selectedHaulage.basePrice || 0,
  //         // ✅ PRIORITÉ AU TOTAL DÉJÀ CALCULÉ (haulageTotal)
  //         subtotal: draftQuote.selectedHaulage.haulageTotal || draftQuote.haulageTotal || 
  //                  (draftQuote.selectedHaulage.unitTariff || 0),
  //         currency: draftQuote.selectedHaulage.currency || 'EUR',
  //         // ✅ DÉTAILS ENRICHIS DES CALCULS
  //         basePrice: draftQuote.selectedHaulage.basePrice || draftQuote.selectedHaulage.unitTariff || 0,
  //         surchargesTotal: draftQuote.selectedHaulage.surchargesTotal || 0,
  //         surchargesCount: draftQuote.selectedHaulage.surcharges?.length || 0,
  //         priceSource: draftQuote.selectedHaulage.priceSource || 'UNKNOWN',
  //         calculatedAt: draftQuote.selectedHaulage.calculatedAt || new Date().toISOString()
  //       },
  //       completed: true
  //     };
  //     
  //     console.log('[SYNC_LOCAL] ✅ Step4 synchronisé avec toutes les données API:', {
  //       step4: {
  //         offerId: updatedDraftQuote.step4.selection.offerId,
  //         haulierName: updatedDraftQuote.step4.selection.haulierName,
  //         tariffUnitPrice: updatedDraftQuote.step4.selection.tariff.unitPrice,
  //         pickup: updatedDraftQuote.step4.selection.route.pickup,
  //         delivery: updatedDraftQuote.step4.selection.route.delivery,
  //         calculation: updatedDraftQuote.step4.selection.calculation,
  //         validity: updatedDraftQuote.step4.selection.validity
  //       },
  //       calculationDetails: {
  //         unitPrice: updatedDraftQuote.step4.calculation.unitPrice,
  //         subtotal: updatedDraftQuote.step4.calculation.subtotal,
  //         basePrice: updatedDraftQuote.step4.calculation.basePrice,
  //         surchargesTotal: updatedDraftQuote.step4.calculation.surchargesTotal,
  //         priceSource: updatedDraftQuote.step4.calculation.priceSource,
  //         finalMapping: updatedDraftQuote.step4.calculation.subtotal > 0 ? 'SUCCÈS ✅' : 'PROBLÈME ❌'
  //       },
  //       selectedHaulageComplet: {
  //         pricing: {
  //           unitTariff: draftQuote.selectedHaulage.unitTariff,
  //           basePrice: draftQuote.selectedHaulage.unitTariff,
  //           surchargesTotal: draftQuote.selectedHaulage.surchargesTotal,
  //           haulageTotal: draftQuote.selectedHaulage.haulageTotal
  //         },
  //         transport: {
  //           distanceKm: draftQuote.selectedHaulage.distanceKm,
  //           estimatedTransitTimeHours: draftQuote.selectedHaulage.estimatedTransitTimeHours,
  //           deliveryTerms: draftQuote.selectedHaulage.deliveryTerms
  //         },
  //         locations: {
  //           pickup: !!draftQuote.selectedHaulage.pickupLocation,
  //           loading: !!draftQuote.selectedHaulage.loadingLocation,
  //           delivery: !!draftQuote.selectedHaulage.deliveryLocation,
  //           emptyReturn: !!draftQuote.selectedHaulage.emptyReturnLocation
  //         },
  //         surcharges: {
  //           count: draftQuote.selectedHaulage.surcharges?.length || 0,
  //           details: draftQuote.selectedHaulage.surcharges?.map((s: any) => ({ 
  //             name: s.name, 
  //             amount: s.amount, 
  //             type: s.type 
  //           })) || []
  //         },
  //         insurance: !!draftQuote.selectedHaulage.transportInsurance,
  //         cargoTypes: draftQuote.selectedHaulage.cargoTypes?.length || 0,
  //         metadata: {
  //           comment: draftQuote.selectedHaulage.comment,
  //           createdBy: draftQuote.selectedHaulage.createdBy,
  //           lastUpdatedBy: draftQuote.selectedHaulage.lastUpdatedBy
  //         }
  //       }
  //     });
  //   } else {
  //     console.log('[SYNC_LOCAL] ❌ Aucun selectedHaulage à synchroniser pour step4');
  //   }
  //   
  //   // === SYNCHRONISER STEP5 ===
  //   console.log('[SYNC_LOCAL] 🔍 === SYNCHRONISATION STEP5 ===');
  //   console.log('[SYNC_LOCAL] 🔍 selectedSeafreights:', {
  //     exists: !!draftQuote.selectedSeafreights,
  //     length: draftQuote.selectedSeafreights?.length || 0,
  //     data: draftQuote.selectedSeafreights
  //   });
  //   
  //   // ✅ VÉRIFIER AUSSI LES DONNÉES DANS STEP5.SELECTIONS
  //   console.log('[SYNC_LOCAL] 🔍 step5.selections:', {
  //     exists: !!draftQuote.step5?.selections,
  //     length: draftQuote.step5?.selections?.length || 0,
  //     data: draftQuote.step5?.selections
  //   });
  //   
  //   // ✅ NOUVELLE LOGIQUE : SYNCHRONISER step5.selections AVEC selectedSeafreights
  //   if (draftQuote.selectedSeafreights && draftQuote.selectedSeafreights.length > 0) {
  //     console.log('[SYNC_LOCAL] 🔄 Synchronisation step5.selections avec selectedSeafreights...');
  //     
  //     const mappedSelections = draftQuote.selectedSeafreights.map((sf: any) => ({
  //       id: sf.id || sf.seafreightId || '',
  //       seaFreightId: sf.id || sf.seafreightId || '',
  //       quoteNumber: sf.quoteNumber || '',
  //         carrier: {
  //         carrierId: sf.carrier?.carrierId || 0,
  //         carrierName: sf.carrier?.carrierName || '',
  //         agentName: sf.carrier?.agentName || ''
  //       },
  //       route: {
  //         departurePort: {
  //           unlocode: sf.route?.departurePort?.unlocode || '',
  //           portName: sf.route?.departurePort?.portName || '',
  //           country: sf.route?.departurePort?.country || ''
  //         },
  //         destinationPort: {
  //           unlocode: sf.route?.destinationPort?.unlocode || '',
  //           portName: sf.route?.destinationPort?.portName || '',
  //           country: sf.route?.destinationPort?.country || ''
  //         },
  //         transitDays: sf.route?.transitDays || 0,
  //         frequency: sf.route?.frequency || '',
  //         incoterm: sf.route?.incoterm || ''
  //       },
  //       container: {
  //         containerType: sf.container?.containerType || '',
  //         isReefer: sf.container?.isReefer || false,
  //         quantity: sf.container?.quantity || 1,
  //         volumeM3: sf.container?.volumeM3 || 0,
  //         weightKg: sf.container?.weightKg || 0,
  //         unitPrice: sf.container?.unitPrice || sf.charges?.basePrice || 0,
  //         subtotal: sf.container?.subtotal || sf.charges?.totalPrice || 0
  //       },
  //       charges: {
  //         basePrice: sf.charges?.basePrice || 0,
  //         currency: sf.charges?.currency || 'EUR',
  //         surcharges: (() => {
  //           // 🔍 DEBUG: Analyser les structures de surcharges API
  //           console.log('[SYNC_LOCAL] 🔍 Analyse des surcharges API pour seafreight:', sf.id, {
  //             'sf.charges?.surcharges': sf.charges?.surcharges,
  //             'sf.charges?.surcharges.length': sf.charges?.surcharges?.length || 0,
  //             'sf.pricing?.surcharges': sf.pricing?.surcharges,
  //             'sf.pricing?.surcharges.length': sf.pricing?.surcharges?.length || 0
  //           });
  //           
  //           // ✅ PRIORITÉ 1: Utiliser directement les surcharges API depuis charges
  //           if (sf.charges?.surcharges && Array.isArray(sf.charges.surcharges) && sf.charges.surcharges.length > 0) {
  //             console.log('[SYNC_LOCAL] ✅ Surcharges API trouvées dans sf.charges.surcharges:', sf.charges.surcharges.length);
  //             return sf.charges.surcharges.map((surcharge: any, index: number) => ({
  //               id: `surcharge_${index}`,
  //               name: surcharge.name || '',
  //               description: surcharge.description || '',
  //               value: surcharge.value || 0,
  //               type: surcharge.type || 'BaseFreight',
  //               isMandatory: surcharge.isMandatory || false,
  //               currency: surcharge.currency || sf.currency || 'EUR'
  //             }));
  //           }
  //           
  //           // ✅ PRIORITÉ 2: Utiliser les surcharges depuis pricing (fallback)
  //           if (sf.pricing?.surcharges && Array.isArray(sf.pricing.surcharges) && sf.pricing.surcharges.length > 0) {
  //             console.log('[SYNC_LOCAL] ✅ Surcharges trouvées dans sf.pricing.surcharges:', sf.pricing.surcharges.length);
  //             return sf.pricing.surcharges;
  //           }
  //           
  //           console.log('[SYNC_LOCAL] ❌ Aucune surcharge API trouvée');
  //           return [];
  //         })(),
  //         totalPrice: sf.charges?.totalPrice || sf.grandTotal || 0
  //       },
  //       service: {
  //         deliveryTerms: sf.service?.deliveryTerms || '',
  //         createdBy: sf.service?.createdBy || 'unknown@omnifreight.eu',
  //         createdDate: sf.service?.createdDate || new Date().toISOString()
  //       },
  //       validity: {
  //         startDate: sf.validity?.startDate || new Date().toISOString(),
  //         endDate: sf.validity?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  //         isExpired: sf.validity?.isExpired || false,
  //         daysRemaining: sf.validity?.daysRemaining || 30
  //       },
  //       remarks: sf.remarks || '',
  //       isSelected: sf.isSelected || true,
  //       selectedAt: sf.selectedAt || new Date().toISOString()
  //     }));
  //     
  //     updatedDraftQuote.step5 = {
  //       ...updatedDraftQuote.step5,
  //       selections: mappedSelections,
  //       summary: {
  //         totalSelections: mappedSelections.length,
  //         totalContainers: mappedSelections.length,
  //         totalAmount: draftQuote.seafreightTotal || 0,
  //         currency: 'EUR',
  //         selectedCarriers: mappedSelections.map(s => s.carrier?.carrierName || '').filter(Boolean),
  //         containerTypes: mappedSelections.map(s => s.container?.containerType || '').filter(Boolean),
  //         preferredSelectionId: mappedSelections[0]?.id || ''
  //       }
  //     };
  //     
  //     console.log('[SYNC_LOCAL] ✅ Step5 synchronisé avec selectedSeafreights:', {
  //       selectionsCount: mappedSelections.length,
  //       summary: updatedDraftQuote.step5.summary
  //     });
  //   } else {
  //     console.log('[SYNC_LOCAL] ❌ Aucun selectedSeafreights à synchroniser');
  //   }
  //   
  //   // ✅ FALLBACK: UTILISER step5.selections SI selectedSeafreights EST VIDE
  //   const sourceSeafreights = (draftQuote.selectedSeafreights && draftQuote.selectedSeafreights.length > 0) 
  //     ? draftQuote.selectedSeafreights 
  //     : draftQuote.step5?.selections || [];
  //   
  //   console.log('[SYNC_LOCAL] 🔍 Source finale pour seafreights:', {
  //     source: (draftQuote.selectedSeafreights && draftQuote.selectedSeafreights.length > 0) ? 'selectedSeafreights' : 'step5.selections',
  //     length: sourceSeafreights.length,
  //     data: sourceSeafreights
  //   });
  //   
  //   if (sourceSeafreights && sourceSeafreights.length > 0) {
  //     console.log('[SYNC_LOCAL] 🔍 ✅ Données seafreights synchronisées avec', sourceSeafreights.length, 'sélections');
  //     
  //     // ✅ SYNCHRONISER AUSSI selectedSeafreights AVEC LES DONNÉES SOURCE
  //     updatedDraftQuote.selectedSeafreights = sourceSeafreights;
  //     
  //     console.log('[SYNC_LOCAL] ✅ Synchronisation step5 terminée:', {
  //       selectionsCount: updatedDraftQuote.step5?.selections?.length || 0,
  //       selectedSeafreightsCount: updatedDraftQuote.selectedSeafreights?.length || 0
  //     });
  //   } else {
  //     console.log('[SYNC_LOCAL] ❌ Aucune donnée seafreight à synchroniser');
  //   }
  //   
  //   // === SYNCHRONISER STEP6 ===
  //   console.log('[SYNC_LOCAL] 🔄 Synchronisation Step6 - État actuel:', {
  //     hasSelectedMiscellaneous: !!(draftQuote.selectedMiscellaneous && draftQuote.selectedMiscellaneous.length > 0),
  //     selectedMiscellaneousCount: draftQuote.selectedMiscellaneous?.length || 0,
  //     hasStep6: !!draftQuote.step6,
  //     step6SelectionsCount: draftQuote.step6?.selections?.length || 0
  //   });
  //   
  //   // ✅ Synchroniser depuis selectedMiscellaneous vers step6.selections
  //   if (draftQuote.selectedMiscellaneous && draftQuote.selectedMiscellaneous.length > 0) {
  //     console.log('[SYNC_LOCAL] 🔄 Synchronisation selectedMiscellaneous -> step6.selections');
  //   
  //     const step6Selections = draftQuote.selectedMiscellaneous.map((misc: any) => ({
  //       id: misc.id || `misc-${misc.serviceId || Date.now()}`,
  //       selectionId: misc.id || 0,
  //       service: {
  //         serviceId: misc.serviceId || 0,
  //         serviceName: misc.serviceName || '',
  //         category: misc.category || ''
  //       },
  //       supplier: {
  //         supplierName: misc.serviceProviderName || misc.supplierName || ''
  //       },
  //       pricing: {
  //         unitPrice: parseFloat(misc.price || misc.pricing?.basePrice || misc.pricing?.unitPrice || '0'),
  //         quantity: misc.quantity || 1,
  //         subtotal: parseFloat(misc.subtotal || misc.price || misc.pricing?.basePrice || '0'),
  //         currency: misc.currency || 'EUR'
  //       },
  //       validity: {
  //         validUntil: misc.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  //       },
  //       remarks: misc.remarks || '',
  //       isSelected: misc.isSelected !== undefined ? misc.isSelected : true,
  //       selectedAt: misc.selectedAt || new Date()
  //     }));
  //   
  //     const totalAmount = step6Selections.reduce((sum, s) => sum + (s.pricing?.subtotal || 0), 0);
  //   
  //     updatedDraftQuote.step6 = {
  //       selections: step6Selections,
  //       summary: {
  //         totalSelections: step6Selections.length,
  //         totalAmount: totalAmount,
  //         currency: 'EUR',
  //         categories: step6Selections.map(s => s.service?.category || '').filter(Boolean)
  //       }
  //     };
  //   
  //     // Mettre à jour miscTotal si nécessaire
  //     if (!updatedDraftQuote.miscTotal || updatedDraftQuote.miscTotal === 0) {
  //       updatedDraftQuote.miscTotal = totalAmount;
  //     }
  //   
  //     console.log('[SYNC_LOCAL] ✅ Step6 synchronisé:', {
  //       selectionsCount: step6Selections.length,
  //       totalAmount: totalAmount,
  //       categories: updatedDraftQuote.step6.summary?.categories
  //     });
  //   } else {
  //     console.log('[SYNC_LOCAL] ⚠️ Aucune selectedMiscellaneous à synchroniser');
  //   }
    
  //   console.log('[SYNC_LOCAL] ✅ Synchronisation terminée:', {
  //     step4: !!updatedDraftQuote.step4,
  //     step5: !!updatedDraftQuote.step5,
  //     step6: !!updatedDraftQuote.step6
  //   });
  //   
  //   setDraftQuote(updatedDraftQuote);
  //   return updatedDraftQuote;
  // }, [draftQuote]);

  // === NOUVELLE FONCTION : RÉINITIALISATION COMPLÈTE DU WIZARD ===
  const resetWizard = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser le wizard ? Toutes les données seront perdues sauf les informations de base de la demande.')) {
      console.log('[Wizard] Réinitialisation du wizard (données step1 préservées)');
      
      // Préserver les données de step1 qui proviennent d'une demande existante
      const preservedStep1 = {
        ...draftQuote.step1,
        // Garder les données essentielles de la demande
        customer: draftQuote.step1?.customer,
        cityFrom: draftQuote.step1?.cityFrom,
        cityTo: draftQuote.step1?.cityTo,
        productName: draftQuote.step1?.productName,
        status: draftQuote.step1?.status,
        assignee: draftQuote.step1?.assignee,
        comment: draftQuote.step1?.comment,
        incotermName: draftQuote.step1?.incotermName,
        portFrom: draftQuote.step1?.portFrom,
        portTo: draftQuote.step1?.portTo,
        pickupLocation: draftQuote.step1?.pickupLocation,
        deliveryLocation: draftQuote.step1?.deliveryLocation,
      };
      
      // Réinitialiser tous les états sauf step1
      updateDraftQuoteSafely(_prev => ({
        step1: preservedStep1, // Préserver les données de step1
        step2: createInitialDraftQuote().step2,
        step3: { selectedContainers: { list: [] } },
        savedOptions: [],
        selectedHaulage: undefined,
        selectedSeafreights: [],
        selectedMiscellaneous: [],
        selectedContainers: {},
        marginType: 'percent',
        marginValue: 0,
        totalPrice: 0,
        haulageQuantity: 1,
        seafreightQuantities: {},
        miscQuantities: {},
        surchargeQuantities: {},
      }));
      
      // Réinitialiser draftQuote en préservant step1
      updateDraftQuoteSafely(_prev => ({
        ...createInitialDraftQuote(),
        step1: preservedStep1, // Préserver les données de step1
      }));
      
      setSavedOptions([]);
      setEditingOptionIndex(null);
      setShowComparison(false);
      setSelectedOptionForValidation(null);
      setShowFinalValidation(false);
      setMarginType('percent');
      setMarginValue(0);
      setTotalPrice(0);
      setServicesStep2([]);
      setActiveStep(0); // Retour à l'étape 1 (sélection des services)
      setFadeKey(0);
      setLastLoadedOption(null);
      setShowUnsavedDialog(false);
      setPendingOptionIndex(null);
      setPendingNewOption(false);
      
      // Réinitialiser les états individuels en préservant les données de step1
      // États individuels supprimés - données maintenant dans draftQuote
      
      // NE PAS effacer les données de demande (requestId, requestData)
      // setRequestId(null);
      // setRequestData(null);
      setRequestDataError(null);
      
      // Nettoyage des données d'options - localStorage retiré
      
      enqueueSnackbar('Wizard réinitialisé (données de base préservées)', { variant: 'success' });
    }
  };

  // === SAUVEGARDE MANUELLE UNIQUEMENT (via bouton Sauvegarder) ===
  // L'écouteur forceDraftSave a été supprimé - sauvegarde uniquement sur action manuelle

  // === NOUVELLES FONCTIONS POUR LA SAUVEGARDE AUTOMATIQUE ===

  // ✅ FONCTION UTILITAIRE IMPORTÉE DEPUIS DraftQuote.ts

  // === SYNCHRONISATION AUTOMATIQUE DES DONNÉES ===
  useEffect(() => {
    if (draftQuote) {
      const syncedDraftQuote = syncDraftQuoteData(draftQuote);
      // Mettre à jour seulement si nécessaire pour éviter les boucles infinies
      if (JSON.stringify(syncedDraftQuote) !== JSON.stringify(draftQuote)) {
        setDraftQuote(syncedDraftQuote);
      }
    }
  }, [draftQuote?.draftData]);

  // === NOUVELLES FONCTIONS POUR LA SAUVEGARDE AUTOMATIQUE ===

  // ✅ FONCTION buildSDKPayload IMPORTÉE DEPUIS DraftQuote.ts

  return (
    <>
      <SaveErrorDisplay />
      <Box sx={{ width: "100%", p: 2 }}>
      

      
      {/* === INDICATEUR DE CHARGEMENT === */}
      {isLoadingRequestData && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '400px',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: 3,
          mb: 3
        }}>
          <CircularProgress size={60} sx={{ mb: 2, color: '#667eea' }} />
          <Typography variant="h6" sx={{ color: '#2c3e50', fontWeight: 600 }}>
            Chargement des données de la demande...
          </Typography>
          <Typography variant="body2" sx={{ color: '#7f8c8d', mt: 1 }}>
            Veuillez patienter pendant que nous récupérons les informations
          </Typography>
        </Box>
      )}

      {/* === MESSAGE D'ERREUR === */}
      {requestDataError && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '200px',
          background: '#fff3cd',
          borderRadius: 3,
          mb: 3,
          border: '1px solid #ffeaa7'
        }}>
          <Typography variant="h6" sx={{ color: '#856404', fontWeight: 600, mb: 1 }}>
            Erreur de chargement
          </Typography>
          <Typography variant="body2" sx={{ color: '#856404', textAlign: 'center', mb: 2 }}>
            {requestDataError}
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              if (requestId) {
                loadRequestData(requestId);
              }
            }}
          >
            Réessayer
          </Button>
        </Box>
      )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Stepper activeStep={activeStep} sx={{ flex: 1 }}>
              {steps.map((label: string, idx: number) => (
                <Step key={label}>
                  <StepLabel
                    onClick={() => {
                      if (idx === activeStep) return;
                      if (idx < activeStep) { setActiveStep(idx); return; }
                      // Validation conditionnelle : on ne peut pas aller à une étape future si la précédente n'est pas validée
                      if (idx === activeStep + 1 && canProceedToNextStep) { setActiveStep(idx); return; }
                      if (idx > activeStep) {
                        enqueueSnackbar('Veuillez compléter l\'étape courante avant de continuer.', { variant: 'warning' });
                      }
                    }}
                    sx={{
                      cursor: idx !== activeStep && (idx < activeStep || (idx === activeStep + 1 && canProceedToNextStep)) ? 'pointer' : 'default',
                      '&:hover': idx !== activeStep && (idx < activeStep || (idx === activeStep + 1 && canProceedToNextStep)) ? { color: 'primary.main', textDecoration: 'underline' } : {},
                      transition: 'color 0.2s',
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {/* ✅ BOUTON DEBUG GÉNÉRAL - TOUJOURS VISIBLE */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => {
                  console.log('=== 🔍 DEBUG DRAFTQUOTE COMPLET ===');
                  console.log('📊 ÉTAT ACTUEL DU DRAFTQUOTE:');
                  console.log('draftQuote complet:', draftQuote);
                  
                  // ✅ NOUVEAU: PAYLOAD COMPLET DE DRAFTQUOTE
                  console.log('=== 📦 PAYLOAD COMPLET DE DRAFTQUOTE ===');
                  console.log('📦 PAYLOAD JSON (formaté):', JSON.stringify(draftQuote, null, 2));
                  console.log('📦 PAYLOAD JSON (compact):', JSON.stringify(draftQuote));
                  console.log('📦 PAYLOAD OBJET (console.table):');
                  console.table({
                    'requestQuoteId': draftQuote.requestQuoteId,
                    'clientNumber': draftQuote.clientNumber,
                    'emailUser': draftQuote.emailUser,
                    'id': draftQuote.id,
                    'currentStep': draftQuote.currentStep,
                    'activeStep': activeStep,
                    'totalTEU': draftQuote.totalTEU,
                    'totalPrice': draftQuote.totalPrice
                  });
                  
                  // ✅ NOUVEAU: ANALYSE STRUCTURELLE COMPLÈTE
                  console.log('=== 🏗️ ANALYSE STRUCTURELLE COMPLÈTE ===');
                  console.log('🏗️ Structure draftQuote:', {
                    type: typeof draftQuote,
                    isArray: Array.isArray(draftQuote),
                    keys: Object.keys(draftQuote),
                    keyCount: Object.keys(draftQuote).length,
                    hasOwnProperty: draftQuote.hasOwnProperty,
                    constructor: draftQuote.constructor?.name
                  });
                  
                  // ✅ NOUVEAU: ANALYSE DES STEPS AVEC STRUCTURE COMPLÈTE
                  console.log('=== 🔍 ANALYSE DÉTAILLÉE PAR ÉTAPE ===');
                  
                  // Step 1 - Structure complète
                  if (draftQuote.step1) {
                    console.log('🔍 Step 1 (Customer/Route) - STRUCTURE COMPLÈTE:', {
                      hasStep1: true,
                      step1Keys: Object.keys(draftQuote.step1),
                      step1Type: typeof draftQuote.step1,
                      customer: draftQuote.step1.customer,
                      route: draftQuote.step1.route,
                      cargo: draftQuote.step1.cargo,
                      metadata: draftQuote.step1.metadata,
                      // ✅ NOUVEAU: Toutes les propriétés de step1
                      allStep1Properties: draftQuote.step1
                    });
                  } else {
                    console.log('🔍 Step 1: ❌ NON PRÉSENT');
                  }
                  
                  // Step 2 - Structure complète
                  if (draftQuote.step2) {
                    console.log('🔍 Step 2 (Services) - STRUCTURE COMPLÈTE:', {
                      hasStep2: true,
                      step2Keys: Object.keys(draftQuote.step2),
                      step2Type: typeof draftQuote.step2,
                      selectedServices: draftQuote.step2.selectedServices,
                      selected: draftQuote.step2.selected,
                      // ✅ NOUVEAU: Toutes les propriétés de step2
                      allStep2Properties: draftQuote.step2
                    });
                  } else {
                    console.log('🔍 Step 2: ❌ NON PRÉSENT');
                  }
                  
                  // Step 3 - Structure complète
                  if (draftQuote.step3) {
                    console.log('🔍 Step 3 (Containers) - STRUCTURE COMPLÈTE:', {
                      hasStep3: true,
                      step3Keys: Object.keys(draftQuote.step3),
                      step3Type: typeof draftQuote.step3,
                      containers: draftQuote.step3.containers,
                      summary: draftQuote.step3.summary,
                      selectedContainers: draftQuote.selectedContainers,
                      // ✅ NOUVEAU: Toutes les propriétés de step3
                      allStep3Properties: draftQuote.step3
                    });
                  } else {
                    console.log('🔍 Step 3: ❌ NON PRÉSENT');
                  }
                  
                  // Step 4 - Structure complète
                  if (draftQuote.step4) {
                    console.log('🔍 Step 4 (Haulage) - STRUCTURE COMPLÈTE:', {
                      hasStep4: true,
                      step4Keys: Object.keys(draftQuote.step4),
                      step4Type: typeof draftQuote.step4,
                      step4Selection: draftQuote.step4.selection,
                      step4Calculation: draftQuote.step4.calculation,
                      selectedHaulage: draftQuote.selectedHaulage,
                      haulageTotal: draftQuote.haulageTotal,
                      // ✅ NOUVEAU: Toutes les propriétés de step4
                      allStep4Properties: draftQuote.step4
                    });
                  } else {
                    console.log('🔍 Step 4: ❌ NON PRÉSENT');
                  }
                  
                  // Step 5 - Structure complète
                  if (draftQuote.step5) {
                    console.log('🔍 Step 5 (Seafreight) - STRUCTURE COMPLÈTE:', {
                      hasStep5: true,
                      step5Keys: Object.keys(draftQuote.step5),
                      step5Type: typeof draftQuote.step5,
                      step5Selections: draftQuote.step5.selections,
                      step5Summary: draftQuote.step5.summary,
                      selectedSeafreights: draftQuote.selectedSeafreights,
                      seafreightTotal: draftQuote.seafreightTotal,
                      // ✅ NOUVEAU: Toutes les propriétés de step5
                      allStep5Properties: draftQuote.step5
                    });
                  } else {
                    console.log('🔍 Step 5: ❌ NON PRÉSENT');
                  }
                  
                  // Step 6 - Structure complète
                  if (draftQuote.step6) {
                    console.log('🔍 Step 6 (Miscellaneous) - STRUCTURE COMPLÈTE:', {
                      hasStep6: true,
                      step6Keys: Object.keys(draftQuote.step6),
                      step6Type: typeof draftQuote.step6,
                      step6Selections: draftQuote.step6.selections,
                      step6Summary: draftQuote.step6.summary,
                      selectedMiscellaneous: draftQuote.selectedMiscellaneous,
                      miscTotal: draftQuote.miscTotal,
                      // ✅ NOUVEAU: Toutes les propriétés de step6
                      allStep6Properties: draftQuote.step6
                    });
                  } else {
                    console.log('🔍 Step 6: ❌ NON PRÉSENT');
                  }
                  
                  // Step 7 - Structure complète
                  if (draftQuote.step7) {
                    console.log('🔍 Step 7 (Finalization) - STRUCTURE COMPLÈTE:', {
                      hasStep7: true,
                      step7Keys: Object.keys(draftQuote.step7),
                      step7Type: typeof draftQuote.step7,
                      finalization: draftQuote.step7.finalization,
                      validation: draftQuote.step7.validation,
                      pricingSummary: draftQuote.step7.pricingSummary,
                      // ✅ NOUVEAU: Toutes les propriétés de step7
                      allStep7Properties: draftQuote.step7
                    });
                  } else {
                    console.log('🔍 Step 7: ❌ NON PRÉSENT');
                  }
                  
                  console.log('💰 TOTAUX ET CALCULS:', {
                    totals: draftQuote.totals,
                    haulageTotal: draftQuote.haulageTotal,
                    seafreightTotal: draftQuote.seafreightTotal,
                    miscTotal: draftQuote.miscTotal,
                    totalPrice: draftQuote.totalPrice,
                    totalTEU: draftQuote.totalTEU
                  });
                  
                  console.log('🔄 DONNÉES DE COMPATIBILITÉ:', {
                    savedOptions: draftQuote.savedOptions?.length || 0,
                    marginType: draftQuote.marginType,
                    marginValue: draftQuote.marginValue,
                    currentStep: draftQuote.currentStep,
                    activeStep: activeStep
                  });
                  
                  console.log('📋 MÉTADONNÉES:', {
                    requestQuoteId: draftQuote.requestQuoteId,
                    clientNumber: draftQuote.clientNumber,
                    emailUser: draftQuote.emailUser,
                    id: draftQuote.id
                  });
                  
                  // ✅ NOUVEAU: RÉSUMÉ FINAL AVEC PAYLOAD
                  console.log('=== 📊 RÉSUMÉ FINAL AVEC PAYLOAD ===');
                  console.log('📊 Taille du payload:', JSON.stringify(draftQuote).length, 'caractères');
                  console.log('📊 Nombre de propriétés:', Object.keys(draftQuote).length);
                  console.log('📊 Propriétés présentes:', Object.keys(draftQuote));
                  console.log('📊 Propriétés manquantes:', ['step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7'].filter(step => !(draftQuote as any)[step]));
                  
                  console.log('=== FIN DEBUG DRAFTQUOTE AVEC PAYLOAD ===');
                  
                  // ✅ AFFICHER AUSSI DANS UNE ALERTE VISUELLE
                  const debugInfo = `
🔍 DEBUG DRAFTQUOTE COMPLET

📊 ÉTAPES:
• Step 1: ${draftQuote.step1 ? '✅' : '❌'} ${draftQuote.step1?.customer?.contactName || 'N/A'}
• Step 2: ${draftQuote.step2 ? '✅' : '❌'} ${draftQuote.step2?.selectedServices?.length || 0} services
• Step 3: ${draftQuote.step3 ? '✅' : '❌'} ${draftQuote.step3?.containers?.length || 0} containers
• Step 4: ${draftQuote.step4 ? '✅' : '❌'} ${draftQuote.step4?.selection?.offerId ? 'Haulage sélectionné' : 'Aucun haulage'}
• Step 5: ${draftQuote.step5 ? '✅' : '❌'} ${draftQuote.step5?.selections?.length || 0} seafreights
• Step 6: ${draftQuote.step6 ? '✅' : '❌'} ${draftQuote.step6?.selections?.length || 0} services
• Step 7: ${draftQuote.step7 ? '✅' : '❌'} ${draftQuote.step7?.finalization?.isReadyToGenerate ? 'Prêt' : 'Non prêt'}

💰 TOTAUX:
• Haulage: ${draftQuote.haulageTotal || 0} EUR
• Seafreight: ${draftQuote.seafreightTotal || 0} EUR
• Miscellaneous: ${draftQuote.miscTotal || 0} EUR
• Total: ${draftQuote.totalPrice || 0} EUR
• TEU: ${draftQuote.totalTEU || 0}

📋 MÉTADONNÉES:
• ID: ${draftQuote.requestQuoteId || 'N/A'}
• Client: ${draftQuote.clientNumber || 'N/A'}
• Étape actuelle: ${activeStep}

📦 PAYLOAD:
• Taille: ${JSON.stringify(draftQuote).length} caractères
• Propriétés: ${Object.keys(draftQuote).length}
                  `.trim();
                  
                  alert(debugInfo);
                }}
                startIcon={<span>🔍</span>}
                sx={{ 
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  '&:hover': {
                    borderColor: '#1565c0',
                    backgroundColor: 'rgba(25,118,210,0.04)'
                  },
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  px: 2,
                  py: 0.5,
                  mb: 1
                }}
              >
                Debug DraftQuote
              </Button>
            </Box>
            
            {/* Boutons de navigation génériques */}
            {activeStep <= 6 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, mb: 2, p: 2, border: '2px solid #1976d2', borderRadius: 2, bgcolor: '#f0f8ff' }}>
                <Button
                  variant="outlined"
                  onClick={async () => {
                    console.log('[DEBUG_NAV] Bouton Précédent cliqué. activeStep avant:', activeStep);
                    // Sauvegarder l'étape actuelle avant de reculer
                    await saveCurrentStepToDraftQuote(activeStep);
                    const newStep = Math.max(0, activeStep - 1);
                    console.log('[DEBUG_NAV] Nouvelle étape:', newStep);
                    setActiveStep(newStep);
                  }}
                  disabled={activeStep === 0}
                  sx={{ minWidth: 120 }}
                >
                  ← {t('wizard.previous', 'Précédent')}
                </Button>
                
                <Box sx={{ alignSelf: 'center', fontWeight: 'bold', color: '#1976d2' }}>
                  Étape {activeStep + 1} / 7
                </Box>
                
                <Button
                  variant="contained"
                  onClick={() => {
                    console.log('[DEBUG_NAV] Bouton Suivant cliqué. activeStep avant:', activeStep);
                    if (canProceedToNextStep) {
                      const newStep = Math.min(6, activeStep + 1);
                      console.log('[DEBUG_NAV] Nouvelle étape:', newStep);
                      setActiveStep(newStep);
                    } else {
                      console.log('[DEBUG_NAV] Cannot proceed - validation failed');
                      enqueueSnackbar('Veuillez compléter cette étape avant de continuer.', { variant: 'warning' });
                    }
                  }}
                  disabled={!canProceedToNextStep}
                  sx={{ minWidth: 120 }}
                >
                  {t('wizard.next', 'Suivant')} →
                </Button>
              </Box>
            )}
            
            {/* Boutons d'action */}
            <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
              {/* Bouton de réinitialisation */}
              <Button
                variant="outlined"
                color="error"
                onClick={resetWizard}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  borderColor: '#f44336',
                  color: '#f44336',
                  '&:hover': {
                    borderColor: '#d32f2f',
                    backgroundColor: 'rgba(244, 67, 54, 0.04)',
                  },
                }}
                startIcon={<span>🔄</span>}
              >
                Reset Options
              </Button>
            </Box>
          </Box>

      {/* Debug render désactivé pour éviter le spam */}
      {activeStep === 0 && (
        <>
          {/* Indicateur de chargement du draft */}
          {!isDraftLoaded && draftId && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '200px',
              flexDirection: 'column',
              gap: 2
            }}>
              <CircularProgress size={40} />
              <Typography variant="h6" color="text.secondary">
                Chargement du draft...
              </Typography>
            </Box>
          )}
          
          {/* Formulaire une fois le draft chargé */}
          {(isDraftLoaded || !draftId) && (
        <Step1RequestForm
          customer={draftQuote.step1?.customer || null}
          setCustomer={customer => setDraftQuote(dq => ({ ...dq, step1: { ...dq.step1, customer } }))}
          customers={customers?.data ?? []}
          cityFrom={draftQuote.step1?.cityFrom || null}
          setCityFrom={cityFrom => setDraftQuote(dq => ({ ...dq, step1: { ...dq.step1, cityFrom } }))}
          cityTo={draftQuote.step1?.cityTo || null}
          setCityTo={cityTo => setDraftQuote(dq => ({ ...dq, step1: { ...dq.step1, cityTo } }))}

          status={draftQuote.step1?.status || 'NEW'}
          setStatus={status => setDraftQuote(dq => ({ ...dq, step1: { ...dq.step1, status } }))}
          assignee={draftQuote.step1?.assignee || ''}
          setAssignee={assignee => setDraftQuote(dq => ({ ...dq, step1: { ...dq.step1, assignee: String(assignee) } }))}
          members={members ?? []}
          comment={draftQuote.step1?.comment || ''}
          setComment={comment => setDraftQuote(dq => ({ ...dq, step1: { ...dq.step1, comment } }))}
          products={products ?? []}
          productName={draftQuote.step1?.productName || null}
          setProductName={productName => setDraftQuote(dq => ({ ...dq, step1: { ...dq.step1, productName } }))}
          incoterms={incoterms}
          incotermName={draftQuote.step1?.incotermName || ''}
          setIncotermName={incotermName => setDraftQuote(dq => ({ ...dq, step1: { ...dq.step1, incotermName } }))}
          errors={{}}
          isLoading={false}

          isLoadingCustomers={isLoadingCustomers}
          onSaved={() => {
            if (canProceedToNextStep) {
              setActiveStep(1);
            } else {
              enqueueSnackbar('Veuillez remplir tous les champs obligatoires (client, villes, produit, incoterm)', { variant: 'error' });
            }
          }}
          contacts={contacts}
          selectedHaulage={draftQuote.selectedHaulage ? [draftQuote.selectedHaulage] : []}
          selectedSeafreight={draftQuote.selectedSeafreights?.[0]}
          selectedMiscellaneous={draftQuote.selectedMiscellaneous || []}
          setSelectedMiscellaneous={selectedMiscellaneous => setDraftQuote(dq => ({ ...dq, selectedMiscellaneous }))}
          services={[]}
          locked={isFromExistingRequest}
          pickupLocation={draftQuote.step1?.pickupLocation}
          deliveryLocation={draftQuote.step1?.deliveryLocation}
          selectedContainers={draftQuote.selectedContainers}
          onContainerChange={() => {}}
          draftQuote={draftQuote}
          setDraftQuote={setDraftQuote}
          onSaveDraft={handleManualSave}
        />
          )}
        </>
      )}



      {/* Debug render étape 1 désactivé */}
      {activeStep === 1 && (
        <>
          {console.log('[WIZARD_STEP2_DEBUG] Props envoyées à Step2SelectServices:', {
            step1: draftQuote.step1,
            cityFromProp: draftQuote.step1?.cityFrom || {
              name: (draftQuote.step1 as any)?.cityFromName,
              country: (draftQuote.step1 as any)?.cityFromCountry
            },
            cityToProp: draftQuote.step1?.cityTo || {
              name: (draftQuote.step1 as any)?.cityToName,
              country: (draftQuote.step1 as any)?.cityToCountry
            }
          })}
        <Step2SelectServices
          requestData={draftQuote.step1}
          selected={draftQuote.step2?.selected || []}
          onChange={selected => {
            console.log('🔍 [DEBUG_STEP2] Services sélectionnés:', selected);
            console.log('🔍 [DEBUG_STEP2] État draftQuote avant mise à jour:', draftQuote.step2);
            setDraftQuote(dq => {
              const updatedDraft = { 
                ...dq, 
                step2: { 
                  ...dq.step2, 
                  selected,
                  selectedServices: selected // ✅ Ajouter aussi selectedServices pour compatibilité
                } 
              };
              console.log('🔍 [DEBUG_STEP2] État draftQuote après mise à jour:', updatedDraft.step2);
              return updatedDraft;
            });
          }}
          onBack={() => setActiveStep(0)}
          onNext={() => setActiveStep(2)}
          selectedHaulage={draftQuote.selectedHaulage}
          selectedSeafreight={draftQuote.selectedSeafreights?.[0]}
          selectedMiscellaneous={draftQuote.selectedMiscellaneous || []}
          setSelectedMiscellaneous={selectedMiscellaneous => setDraftQuote(dq => ({ ...dq, selectedMiscellaneous }))}
          contacts={contacts}
          cityFrom={draftQuote.step1?.cityFrom || {
            name: (draftQuote.step1 as any)?.cityFromName,
            country: (draftQuote.step1 as any)?.cityFromCountry
          }}
          cityTo={draftQuote.step1?.cityTo || {
            name: (draftQuote.step1 as any)?.cityToName,
            country: (draftQuote.step1 as any)?.cityToCountry
          }}
          productName={draftQuote.step1?.productName}
          incotermName={draftQuote.step1?.incotermName}
          onServicesLoaded={setServicesStep2}
        />
        </>
      )}

      {/* Debug render étape 2 désactivé */}
      {activeStep === 2 && (
        <Step3RequestForm
          requestData={draftQuote.step1}
          selectedServices={draftQuote.step2?.selected || []}
          selectedContainers={draftQuote.step3?.selectedContainers || { list: [] }}
          onContainerChange={(_serviceId, containers, totalTEU) => {
            console.log('🔍 [DEBUG_STEP3] === CHANGEMENT CONTENEURS ===');
            console.log('🔍 [DEBUG_STEP3] _serviceId:', _serviceId);
            console.log('🔍 [DEBUG_STEP3] containers reçus:', JSON.stringify(containers, null, 2));
            console.log('🔍 [DEBUG_STEP3] totalTEU:', totalTEU);
            
            setDraftQuote((dq) => {
              // ✅ CONSTRUIRE UN STEP3 COMPLET ET SYNCHRONISÉ
              const newStep3 = {
                ...dq.step3,
                // ✅ CONTENEURS AVEC STRUCTURE COMPLÈTE
                containers: containers?.list?.map((container: any) => ({
                  id: container.id || '',
                  type: container.type || container.containerType || '',
                  quantity: container.quantity || 1,
                  teu: container.teu || 1
                })) || [],
                // ✅ RÉSUMÉ CALCULÉ AUTOMATIQUEMENT
                summary: {
                  totalContainers: containers?.list?.length || 0,
                  totalTEU: totalTEU || 0,
                  containerTypes: containers?.list?.map((c: any) => c.type || c.containerType || '').filter(Boolean) || []
                },
                // ✅ ROUTE SYNCHRONISÉE AVEC STEP1
                route: {
                  origin: {
                    city: { name: dq.step1?.cityFrom?.name || '', country: dq.step1?.cityFrom?.country || '' },
                    port: { portId: dq.step1?.portFrom?.portId || 0, portName: dq.step1?.portFrom?.portName || '', country: dq.step1?.portFrom?.country || '' }
                  },
                  destination: {
                    city: { name: dq.step1?.cityTo?.name || '', country: dq.step1?.cityTo?.country || '' },
                    port: { portId: dq.step1?.portTo?.portId || 0, portName: dq.step1?.portTo?.portName || '', country: dq.step1?.portTo?.country || '' }
                  }
                },
                // ✅ CONSERVER LA STRUCTURE EXISTANTE POUR COMPATIBILITÉ
                selectedContainers: {
                  ...dq.step3?.selectedContainers,
                  list: containers
                }
              };
              
              const newDraftQuote = {
                ...dq,
                step3: newStep3,
                // ✅ SYNCHRONISER LES PROPRIÉTÉS DE COMPATIBILITÉ
                totalTEU: typeof totalTEU === 'number' ? totalTEU : dq.totalTEU,
                totalContainers: newStep3.summary?.totalContainers || 0,
                containerTypes: newStep3.summary?.containerTypes || []
              };
              
              console.log('🔍 [DEBUG_STEP3] Ancien draftQuote.step3:', JSON.stringify(dq.step3, null, 2));
              console.log('🔍 [DEBUG_STEP3] Nouveau draftQuote.step3:', JSON.stringify(newStep3, null, 2));
              console.log('🔍 [DEBUG_STEP3] === FIN CHANGEMENT CONTENEURS ===');
              
              return newDraftQuote;
            });
          }}
          containerPackages={containerPackages}
          onBack={() => setActiveStep(1)}
          onNext={() => setActiveStep(3)}
          onServicesChange={services => setDraftQuote((dq) => ({
            ...dq,
            step2: {
              ...dq.step2,
              selected: services,
              selectedServices: services // ✅ Ajouter aussi selectedServices pour compatibilité
            }
          }))}
          onRequestDataChange={data => setDraftQuote((dq) => {
            const updatedStep1 = {
              ...dq.step1,
              ...data
            };
            
            // ✅ SYNCHRONISER LE STEP3 AVEC LES NOUVELLES DONNÉES DU STEP1
            let updatedStep3 = dq.step3;
            if (dq.step3 && (data.cityFrom || data.cityTo || data.portFrom || data.portTo)) {
              updatedStep3 = {
                ...dq.step3,
                route: {
                  origin: {
                    city: { name: updatedStep1.cityFrom?.name || '', country: updatedStep1.cityFrom?.country || '' },
                    port: { portId: updatedStep1.portFrom?.portId || 0, portName: updatedStep1.portFrom?.portName || '', country: updatedStep1.portFrom?.country || '' }
                  },
                  destination: {
                    city: { name: updatedStep1.cityTo?.name || '', country: updatedStep1.cityTo?.country || '' },
                    port: { portId: updatedStep1.portTo?.portId || 0, portName: updatedStep1.portTo?.portName || '', country: updatedStep1.portTo?.country || '' }
                  }
                }
              };
              
              console.log('🔍 [DEBUG_STEP3] Step3 synchronisé avec Step1:', updatedStep3);
            }
            
            return {
              ...dq,
              step1: updatedStep1,
              step3: updatedStep3
            };
          })}
          selectedHaulage={draftQuote.selectedHaulage}
          selectedSeafreight={draftQuote.selectedSeafreights?.[0]}
          selectedMiscellaneous={draftQuote.selectedMiscellaneous}
          services={servicesStep2}
          contacts={contacts}
        />
      )}

      {/* Debug render étape 3 désactivé */}
      {activeStep === 3 && (
        (() => {
          console.log('DEBUG RequestWizard step1 juste avant Step4HaulierSelection:', draftQuote.step1);
          console.log('[STEP4_RENDER] Données haulage à rendre:', {
            selectedHaulage: draftQuote.selectedHaulage,
            hasSelectedHaulage: !!draftQuote.selectedHaulage,
            haulageDetails: draftQuote.selectedHaulage ? {
              haulierName: draftQuote.selectedHaulage.haulierName,
              unitTariff: draftQuote.selectedHaulage.unitTariff,
              offerId: draftQuote.selectedHaulage.offerId,
              id: draftQuote.selectedHaulage.id,
              haulageId: draftQuote.selectedHaulage.haulageId
            } : null
          });
          
          // Log détaillé de la structure du selectedHaulage
          if (draftQuote.selectedHaulage) {
            console.log('[STEP4_RENDER] Structure complète selectedHaulage:', {
              allKeys: Object.keys(draftQuote.selectedHaulage),
              offerId: draftQuote.selectedHaulage.offerId,
              id: draftQuote.selectedHaulage.id,
              haulageId: draftQuote.selectedHaulage.haulageId,
              haulierName: draftQuote.selectedHaulage.haulierName,
              unitTariff: draftQuote.selectedHaulage.unitTariff
            });
          }
          // Si draftQuote.step1 est undefined ou vide, on force une valeur de debug
          let safeStep1 = draftQuote.step1;
          if (!safeStep1 || Object.keys(safeStep1).length === 0) {
            safeStep1 = {
              customer: { contactName: 'DEBUG CLIENT' },
              cityFrom: { name: 'DEBUG CITY FROM', country: 'FR' },
              cityTo: { name: 'DEBUG CITY TO', country: 'BE' },
              productName: { productName: 'DEBUG PRODUCT' },
              incotermName: 'FOB',
              status: StatusRequest.NEW,
              assignee: '',
              comment: '',
              portFrom: undefined,
              portTo: undefined,
              pickupLocation: undefined,
              deliveryLocation: undefined,
            };
            console.warn('draftQuote.step1 était vide/undefined, valeur de debug injectée');
          }
          return (
            <Step4HaulierSelection
              cityFrom={safeStep1.cityFrom}
              portFrom={safeStep1.portFrom}
              onBack={() => setActiveStep(2)}
              onNext={() => setActiveStep(4)}
              draftQuote={draftQuote}
              draftId={draftId || undefined}
              onStep4Update={(step4Data) => {
                console.log('[DEBUG][RequestWizard] onStep4Update called with:', {
                  step4Data: step4Data,
                  selectionOfferId: step4Data?.selection?.offerId,
                  haulierName: step4Data?.selection?.haulierName,
                  unitPrice: step4Data?.selection?.tariff?.unitPrice
                });
                
                // ✅ METTRE À JOUR DRAFTQUOTE.STEP4
                setDraftQuote(dq => {
                  const updatedDq = {
                    ...dq,
                    step4: step4Data
                  };
                  
                  // ✅ SYNCHRONISER AUSSI selectedHaulage pour compatibilité
                  updatedDq.selectedHaulage = {
                    offerId: step4Data.selection.offerId,
                    haulierId: step4Data.selection.haulierId,
                    haulierName: step4Data.selection.haulierName,
                    unitTariff: step4Data.selection.tariff.unitPrice,
                    currency: step4Data.selection.tariff.currency,
                    freeTime: step4Data.selection.tariff.freeTime,
                    pickupLocation: {
                      displayName: `${step4Data.selection.route.pickup.company}, ${step4Data.selection.route.pickup.city}, ${step4Data.selection.route.pickup.country}`
                    },
                    deliveryLocation: {
                      displayName: `${step4Data.selection.route.delivery.portName}, ${step4Data.selection.route.delivery.country}`
                    },
                    validUntil: step4Data.selection.validity.validUntil
                  };
                  
                  console.log('[DEBUG][RequestWizard] ✅ Step4 mis à jour avec succès:', {
                    step4: updatedDq.step4,
                    selectedHaulage: updatedDq.selectedHaulage
                  });
                  
                  return updatedDq;
                });
                
                // ✅ SAUVEGARDE IMMÉDIATE si auto-save activé
                setTimeout(async () => {
                  if (draftId) {
                    console.log('[AUTO_SAVE_STEP4] Sauvegarde automatique du step4 en base...');
                    try {
                      await updateDraft();
                      console.log('[AUTO_SAVE_STEP4] ✅ Step4 sauvegardé avec succès en base');
                    } catch (error) {
                      console.error('[AUTO_SAVE_STEP4] ❌ Erreur sauvegarde step4:', error);
                    }
                  }
                }, 300);
              }}
            />
          );
        })()
      )}

      {/* Debug render étape 4 désactivé */}
      {activeStep === 4 && (() => {
        console.log('[STEP5_RENDER] Données seafreight à rendre:', {
          selectedSeafreights: draftQuote.selectedSeafreights,
          hasSelectedSeafreights: !!(draftQuote.selectedSeafreights && draftQuote.selectedSeafreights.length > 0),
          seafreightCount: draftQuote.selectedSeafreights?.length || 0,
          seafreightDetails: draftQuote.selectedSeafreights?.map(sf => ({
            carrierName: sf.carrierName,
            transitTimeDays: sf.transitTimeDays,
            id: sf.id,
            seaFreightId: sf.seaFreightId
          })) || []
        });
        
        // Log détaillé de la structure du selectedSeafreight
        if (draftQuote.selectedSeafreights && draftQuote.selectedSeafreights.length > 0) {
          console.log('[STEP5_RENDER] Structure complète selectedSeafreights:', draftQuote.selectedSeafreights.map(sf => ({
            allKeys: Object.keys(sf),
            id: sf.id,
            seaFreightId: sf.seaFreightId,
            carrierName: sf.carrierName,
            transitTimeDays: sf.transitTimeDays
          })));
        }
        
        // ✅ PASSER TOUTES LES SÉLECTIONS (PAS SEULEMENT LA PREMIÈRE)
        const allSelectedSeafreights = draftQuote.selectedSeafreights || [];
        const selectedSeafreightProp = allSelectedSeafreights[0]; // Pour compatibilité avec l'ancienne interface
        
        console.log('[STEP5_RENDER] ✅ Props passées à Step5SeafreightSelection:', {
          selectedHaulage: draftQuote.selectedHaulage,
          selectedSeafreight: selectedSeafreightProp, // Première sélection pour compatibilité
          allSelectedSeafreights: allSelectedSeafreights, // ✅ TOUTES les sélections
          selectedSeafreightsCount: allSelectedSeafreights.length,
          selectedSeafreightIds: allSelectedSeafreights.map(sf => sf.id || sf.seaFreightId),
          selectedSeafreightCarriers: allSelectedSeafreights.map(sf => sf.carrierName || sf.carrier?.name),
          // Ajout des logs pour les données manquantes
          totalTEU: draftQuote.totalTEU,
          selectedContainers: draftQuote.selectedContainers,
          step3: draftQuote.step3,
          selectedHaulageDetails: draftQuote.selectedHaulage ? {
            haulierName: draftQuote.selectedHaulage.haulierName,
            unitTariff: draftQuote.selectedHaulage.unitTariff,
            currency: draftQuote.selectedHaulage.currency,
            freeTime: draftQuote.selectedHaulage.freeTime
          } : null
        });

        return (
        <Step5SeafreightSelection
          cityFrom={draftQuote.step1?.cityFrom}
          portFrom={draftQuote.step1?.portFrom}
          selectedHaulage={draftQuote.selectedHaulage || undefined}
          selectedMiscellaneous={draftQuote.selectedMiscellaneous}
          services={servicesStep2}
          contacts={contacts}
          onBack={() => setActiveStep(3)}
          onNext={() => setActiveStep(5)}
          draftQuote={draftQuote}
          selectedServices={draftQuote.step2?.selected || []}
          selectedContainers={draftQuote.step3?.selectedContainers || draftQuote.selectedContainers || { list: [] }}
          totalTEU={draftQuote.totalTEU}
          onRequestDataChange={newData => setDraftQuote(prev => ({ ...prev, step1: { ...prev, ...newData } }))}
          onStep5Update={(step5Data) => {
            console.log('[DEBUG][RequestWizard] onStep5Update called with:', {
              step5Data: step5Data,
              selectionsCount: step5Data?.selections?.length || 0,
              totalAmount: step5Data?.summary?.totalAmount || 0,
              selectionsDetails: step5Data?.selections?.map((sf: any) => ({
                id: sf.id,
                carrierName: sf.carrier?.name,
                containerType: sf.container?.containerType
              }))
            });
            
            // Extraire les données de step5Data
            const selections = step5Data?.selections || [];
            const total = step5Data?.summary?.totalAmount || 0;
            
            // Mapper les sélections step5 vers le format API attendu
            const mappedSeafreights = Array.isArray(selections) ? selections.map((sf: any) => ({
              seaFreightId: sf.id || '',
              carrierName: sf.carrier?.name || '',
              carrierAgentName: '', // Propriété non présente dans SeaFreightResponse
              departurePort: {
                portId: 0, // Port n'a pas d'id, utiliser 0
                portName: sf.departurePort?.name || '',
                country: '' // Port n'a pas de country, utiliser chaîne vide
              },
              destinationPort: sf.arrivalPort ? {
                portId: 0, // Port n'a pas d'id, utiliser 0
                portName: sf.arrivalPort.name || '',
                country: '' // Port n'a pas de country, utiliser chaîne vide
              } : null,
              currency: sf.currency || 'EUR',
              transitTimeDays: sf.transitTimeDays || 0,
              frequency: sf.frequency || '',
              defaultContainer: sf.containerType || '',
              containers: [], // Propriété non présente dans SeaFreightResponse
              comment: sf.remarks || '', // Utiliser remarks au lieu de comment
              validUntil: sf.validity?.endDate || null,
              // ✅ DONNÉES DE PRIX AVEC SURCHARGES API DIRECTES
              pricing: {
                currency: sf.currency || 'EUR',
                basePrice: sf.charges?.basePrice || 0,
                total: (() => {
                  // Calculer le total : basePrice + somme des surcharges
                  const basePrice = sf.charges?.basePrice || 0;
                  const surchargesTotal = sf.charges?.surcharges?.reduce((sum: number, s: any) => sum + (s.value || 0), 0) || 0;
                  return basePrice + surchargesTotal;
                })(),
                              // ✅ NOUVEAU: Utiliser directement les surcharges de step5
              surcharges: sf.charges?.surcharges?.map((surcharge: any, index: number) => ({
                id: `surcharge_${index}`,
                name: surcharge.name || '',
                description: surcharge.description || '',
                value: surcharge.value || 0,
                type: surcharge.type || 'BaseFreight',
                isMandatory: surcharge.isMandatory || false,
                currency: surcharge.currency || sf.charges?.currency || 'EUR'
              })) || []
            },
            // ✅ NOUVEAU: Structure charges directe depuis step5
            charges: {
              basePrice: sf.charges?.basePrice || 0,
              currency: sf.charges?.currency || 'EUR',
              // ✅ Utiliser directement les surcharges de step5
              surcharges: sf.charges?.surcharges?.map((surcharge: any, index: number) => ({
                id: `surcharge_${index}`,
                name: surcharge.name || '',
                description: surcharge.description || '',
                value: surcharge.value || 0,
                type: surcharge.type || 'BaseFreight',
                isMandatory: surcharge.isMandatory || false,
                currency: surcharge.currency || sf.charges?.currency || 'EUR'
              })) || [],
              totalPrice: sf.charges?.totalPrice || 0
            },
            // Données de base pour la compatibilité
            baseFreight: sf.charges?.basePrice || 0,
            total: sf.charges?.totalPrice || 0,
            grandTotal: sf.charges?.totalPrice || 0
          })) : [];
            
            console.log('[DEBUG][RequestWizard] Mapped seafreights for local storage:', {
              original: step5Data,
              mapped: mappedSeafreights,
              mappingDetails: mappedSeafreights.map((sf: any) => ({
                seaFreightId: sf.seaFreightId,
                carrierName: sf.carrierName,
                defaultContainer: sf.defaultContainer,
                hasSurcharges: !!(sf.charges?.surcharges && sf.charges.surcharges.length > 0),
                surchargesCount: sf.charges?.surcharges?.length || 0,
                surcharges: sf.charges?.surcharges
              }))
            });
            
            // ✅ LOG SPÉCIFIQUE POUR LES SURCHARGES AVEC DONNÉES STEP5
            console.log('[DEBUG][RequestWizard] 💰 VÉRIFICATION DES SURCHARGES APRÈS MAPPING (STEP5):', {
              totalSeafreights: mappedSeafreights.length,
              originalSelections: step5Data?.selections?.map((sf: any) => ({
                id: sf.id,
                carrier: sf.carrier?.name,
                chargesStructure: sf.charges,
                surchargesFromStep5: sf.charges?.surcharges,
                surchargesCount: sf.charges?.surcharges?.length || 0
              })),
              mappedSurcharges: mappedSeafreights.map((sf: any, index: number) => ({
                seafreightIndex: index,
                seaFreightId: sf.seaFreightId,
                pricingSurcharges: sf.pricing?.surcharges?.length || 0,
                chargesSurcharges: sf.charges?.surcharges?.length || 0,
                pricingSurchargesDetails: sf.pricing?.surcharges,
                chargesSurchargesDetails: sf.charges?.surcharges,
                calculatedTotal: sf.total,
                basePrice: sf.charges?.basePrice
              }))
            });
            
            setDraftQuote(dq => {
              // ✅ CONSTRUIRE UN STEP5 COMPLET ET SYNCHRONISÉ
              const newStep5 = {
                ...dq.step5,
                selections: mappedSeafreights.map(sf => ({
                  id: sf.seaFreightId || '',
                  seafreightId: sf.seaFreightId || '',
                  quoteNumber: '',
                  carrier: {
                    name: sf.carrierName || '',
                    agentName: sf.carrierAgentName || ''
                  },
                  route: {
                    departurePort: {
                      portId: sf.departurePort?.portId || 0,
                      portName: sf.departurePort?.portName || '',
                      country: sf.departurePort?.country || ''
                    },
                    destinationPort: {
                      portId: sf.destinationPort?.portId || 0,
                      portName: sf.destinationPort?.portName || '',
                      country: sf.destinationPort?.country || ''
                    },
                    transitDays: sf.transitTimeDays || 0,
                    frequency: sf.frequency || ''
                  },
                  container: {
                    containerType: sf.defaultContainer || '',
                    isReefer: false, // Par défaut
                    quantity: 1, // Quantité par défaut
                    volumeM3: 0,
                    weightKg: 0,
                    unitPrice: sf.pricing?.basePrice || sf.baseFreight || 0,
                    subtotal: sf.pricing?.total || sf.total || 0
                  },
                  charges: {
                    basePrice: sf.charges?.basePrice || 0,
                    currency: sf.currency || 'EUR',
                    surcharges: sf.charges?.surcharges?.map((surcharge: any, index: number) => ({
                      id: `surcharge_${index}`,
                      name: surcharge.name || '',
                      description: surcharge.description || '',
                      value: surcharge.value || 0,
                      type: surcharge.type || 'BaseFreight',
                      isMandatory: surcharge.isMandatory || false,
                      currency: surcharge.currency || sf.currency || 'EUR'
                    })) || [],
                    totalPrice: (() => {
                      const basePrice = sf.charges?.basePrice || 0;
                      const surchargesTotal = sf.charges?.surcharges?.reduce((sum: number, s: any) => sum + (s.value || 0), 0) || 0;
                      return basePrice + surchargesTotal;
                    })()
                  },
                  service: {
                    deliveryTerms: '',
                    createdBy: dq.emailUser || 'unknown@omnifreight.eu',
                    createdDate: new Date()
                  },
                  validity: {
                    startDate: new Date(),
                    endDate: sf.validUntil ? new Date(sf.validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                  },
                  remarks: sf.comment || '',
                  isSelected: true,
                  selectedAt: new Date()
                })),
                summary: {
                  totalSelections: mappedSeafreights.length,
                  totalContainers: mappedSeafreights.length,
                  totalAmount: total,
                  currency: 'EUR',
                  selectedCarriers: mappedSeafreights.map(sf => sf.carrierName || '').filter(Boolean),
                  containerTypes: mappedSeafreights.map(sf => sf.defaultContainer || '').filter(Boolean),
                  preferredSelectionId: mappedSeafreights[0]?.seaFreightId || ''
                }
              };

              const newDraftQuote = {
                ...dq,
                selectedSeafreights: mappedSeafreights, // ✅ Compatibilité
                seafreightTotal: total, // ✅ Compatibilité
                step5: newStep5 // ✅ NOUVEAU: Step5 complet et synchronisé
              };
              
              console.log('[DEBUG][RequestWizard] Step5 complet construit:', {
                before: dq.step5,
                after: newStep5,
                selectionsCount: newStep5.selections.length,
                summary: newStep5.summary
              });
              
              return newDraftQuote;
            });
          }}
        />
        );
      })()}

      {/* Debug render étape 5 désactivé */}
      {activeStep === 5 && (() => {
        console.log('[STEP6_RENDER] Données miscellaneous à rendre:', {
          selectedMiscellaneous: draftQuote.selectedMiscellaneous,
          hasSelectedMiscellaneous: !!(draftQuote.selectedMiscellaneous && draftQuote.selectedMiscellaneous.length > 0),
          miscCount: draftQuote.selectedMiscellaneous?.length || 0,
          miscDetails: draftQuote.selectedMiscellaneous?.map(misc => ({
            serviceName: misc.serviceName,
            price: misc.price
          })) || []
        });
        
        return (
        <Step6MiscellaneousSelection
          selectedHaulage={draftQuote.selectedHaulage || undefined}
          selectedSeafreight={draftQuote.selectedSeafreights?.[0]}
          selectedMiscellaneous={draftQuote.selectedMiscellaneous || []}
          services={servicesStep2}
          contacts={contacts}
          onBack={() => setActiveStep(4)}
          onNext={() => setActiveStep(6)}
          onStep6Update={(step6Data) => {
            // ✅ CALLBACK RESTAURÉ - Mettre à jour draftQuote immédiatement
            console.log('[DEBUG][RequestWizard] onStep6Update called:', {
              selectionsCount: step6Data?.selections?.length || 0,
              totalAmount: step6Data?.summary?.totalAmount || 0,
              timestamp: new Date().toISOString()
            });
            
            // ✅ SYNCHRONISER IMMÉDIATEMENT AVEC DRAFTQUOTE + STEP6
            setDraftQuote(dq => {
              const updatedDq = {
                ...dq,
                step6: step6Data || {
                  selections: [],
                  summary: {
                    totalSelections: 0,
                    totalAmount: 0,
                    currency: 'EUR',
                    categories: []
                  }
                }
              };
              
              // ✅ SYNCHRONISER AUSSI selectedMiscellaneous pour compatibilité
              if (step6Data?.selections && step6Data.selections.length > 0) {
                updatedDq.selectedMiscellaneous = step6Data.selections.map((s: any) => ({
                  id: s.id,
                  serviceId: s.service?.serviceId,
                  serviceName: s.service?.serviceName,
                  serviceProviderName: s.supplier?.supplierName,
                  supplierName: s.supplier?.supplierName,
                  price: s.pricing?.unitPrice,
                  quantity: s.pricing?.quantity,
                  subtotal: s.pricing?.subtotal,
                  currency: s.pricing?.currency,
                  category: s.service?.category,
                  validUntil: s.validity?.validUntil,
                  remarks: s.remarks,
                  isSelected: s.isSelected,
                  selectedAt: s.selectedAt
                }));
                
                console.log('[DEBUG][RequestWizard] ✅ selectedMiscellaneous synchronisé via onStep6Update:', step6Data.selections.length);
              } else {
                updatedDq.selectedMiscellaneous = [];
                console.log('[DEBUG][RequestWizard] ✅ selectedMiscellaneous vidé (aucune sélection)');
              }
              
              return updatedDq;
            });
            
            // Mettre à jour l'état local aussi
            setCurrentlySelectedMiscellaneous(step6Data?.selections || []);
            
            console.log('[DEBUG][RequestWizard] draftQuote.step6 mis à jour via onStep6Update, new length:', (step6Data?.selections || []).length);
          }}
          setSelectedMiscellaneous={(miscList, miscTotal) => {
            // Stocker localement les services sélectionnés ET synchroniser avec le brouillon
            console.log('[DEBUG][RequestWizard] setSelectedMiscellaneous called:', {
              selectedCount: miscList?.length || 0,
              miscTotal: miscTotal,
              services: miscList?.map(m => ({ 
                id: m.id, 
                serviceName: m.serviceName, 
                serviceProviderName: m.serviceProviderName,
                serviceId: m.serviceId 
              })) || [],
              timestamp: new Date().toISOString()
            });
            
            // Mettre à jour l'état local pour l'étape courante
            setCurrentlySelectedMiscellaneous(miscList || []);
            
            // NOUVEAU: Synchroniser immédiatement avec le brouillon pour persistence
            setDraftQuote(dq => ({
              ...dq,
              selectedMiscellaneous: miscList || [],
              miscellaneousTotal: miscTotal || 0
            }));
            
            console.log('[DEBUG][RequestWizard] draftQuote.selectedMiscellaneous synchronisé, new length:', (miscList || []).length);
            
            // ✅ VÉRIFICATION IMMÉDIATE DU DRAFTQUOTE
            setTimeout(() => {
              console.log('[DEBUG][RequestWizard] 🔍 VÉRIFICATION DRAFTQUOTE APRÈS MODIFICATION:', {
                selectedMiscellaneousLength: draftQuote.selectedMiscellaneous?.length || 0,
                selectedMiscellaneousData: draftQuote.selectedMiscellaneous?.map((m: any) => ({ 
                  id: m.id, 
                  serviceName: m.serviceName 
                })) || [],
                miscellaneousTotal: (draftQuote as any).miscellaneousTotal || 0,
                step6Exists: !!draftQuote.step6,
                step6SelectionsLength: draftQuote.step6?.selections?.length || 0
              });
            }, 50);
            
            // ✅ DÉCLENCHER LA SYNCHRONISATION LOCALE ET SAUVEGARDE AUTOMATIQUEMENT
            // ATTENTION: Utiliser setDraftQuote avec callback pour déclencher la sync sur le nouvel état
            setTimeout(async () => {
              console.log('[AUTO_SYNC_STEP6] Déclenchement de la synchronisation après modification des services divers...');
              
              // ✅ FORCER LA MISE À JOUR AVEC LE NOUVEL ÉTAT
              setDraftQuote(currentDq => {
                console.log('[AUTO_SYNC_STEP6] 🔄 Synchronisation forcée avec le nouvel état:', {
                  newSelectedMiscLength: currentDq.selectedMiscellaneous?.length || 0,
                  hasStep6: !!currentDq.step6,
                  step6SelectionsLength: currentDq.step6?.selections?.length || 0
                });
                
                // Synchroniser immédiatement step6 avec les nouvelles données
                if (currentDq.selectedMiscellaneous && currentDq.selectedMiscellaneous.length > 0) {
                  const step6Selections = currentDq.selectedMiscellaneous.map((misc: any) => ({
                    id: misc.id || `misc-${misc.serviceId || Date.now()}`,
                    selectionId: misc.id || 0,
                    service: {
                      serviceId: misc.serviceId || 0,
                      serviceName: misc.serviceName || '',
                      category: misc.category || ''
                    },
                    supplier: {
                      supplierName: misc.serviceProviderName || misc.supplierName || ''
                    },
                    pricing: {
                      unitPrice: parseFloat(misc.price || misc.pricing?.basePrice || misc.pricing?.unitPrice || '0'),
                      quantity: misc.quantity || 1,
                      subtotal: parseFloat(misc.subtotal || misc.price || misc.pricing?.basePrice || '0'),
                      currency: misc.currency || 'EUR'
                    },
                    validity: {
                      validUntil: misc.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    remarks: misc.remarks || '',
                    isSelected: misc.isSelected !== undefined ? misc.isSelected : true,
                    selectedAt: misc.selectedAt || new Date()
                  }));
                  
                  const totalAmount = step6Selections.reduce((sum, s) => sum + (s.pricing?.subtotal || 0), 0);
                  
                  console.log('[AUTO_SYNC_STEP6] ✅ Step6 synchronisé inline:', {
                    selectionsCount: step6Selections.length,
                    totalAmount: totalAmount
                  });
                  
                  return {
                    ...currentDq,
                    step6: {
                      selections: step6Selections,
                      summary: {
                        totalSelections: step6Selections.length,
                        totalAmount: totalAmount,
                        currency: 'EUR',
                        categories: [...new Set(step6Selections.map(s => s.service?.category).filter(Boolean))]
                      }
                    }
                  };
                } else {
                  console.log('[AUTO_SYNC_STEP6] ❌ Pas de selectedMiscellaneous à synchroniser');
                  return currentDq;
                }
              });
              
              // ✅ DÉCLENCHER LA SAUVEGARDE EN BASE DE DONNÉES SI ON A UN DRAFT ID
              if (draftId) {
                console.log('[AUTO_SAVE_STEP6] Sauvegarde automatique du step6 en base...');
                try {
                  await updateDraft();
                  console.log('[AUTO_SAVE_STEP6] ✅ Step6 sauvegardé avec succès en base');
                } catch (error) {
                  console.error('[AUTO_SAVE_STEP6] ❌ Erreur sauvegarde step6:', error);
                }
              }
            }, 300);
          }}
          requestData={draftQuote.step1}
          selectedServices={draftQuote.step2?.selected || []}
          selectedContainers={draftQuote.selectedContainers}
          cityFrom={draftQuote.step1?.cityFrom}
          portFrom={draftQuote.step1?.portFrom}
        />
        );
      })()}

      {activeStep === 6 && (
        <>
          {console.log('[DEBUG][Step7] draftQuote.selectedSeafreights', draftQuote.selectedSeafreights)}
          {/* Barre de navigation des options améliorée */}
          {!showFinalValidation && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Box sx={{ background: '#f5f7fa', borderRadius: 3, boxShadow: '0 2px 12px #1976d220', px: 3, py: 2, display: 'flex', gap: 2 }}>
                {savedOptions.length > 0 && (
                  <ButtonGroup variant="outlined" color="primary" sx={{ boxShadow: 'none' }}>
                    {savedOptions.map((opt: any, idx: number) => (
                      <Tooltip key={opt.id} title={`Total : ${opt.totalPrice?.toLocaleString(undefined, { maximumFractionDigits: 2 })} € | Marge : ${opt.marginType === 'percent' ? opt.marginValue + ' %' : opt.marginValue + ' €'}` } placement="top">
                        <span style={{ position: 'relative', display: 'inline-block', margin: '0 6px' }}>
                          <Button
                            variant={editingOptionIndex === idx ? 'contained' : 'outlined'}
                            onClick={() => handleLoadOptionWithConfirm(idx)}
                            sx={{
                              fontWeight: editingOptionIndex === idx ? 700 : 400,
                              borderRadius: 2,
                              minWidth: '120px',
                              boxShadow: editingOptionIndex === idx ? '0 4px 16px #1976d250' : 'none',
                              background: editingOptionIndex === idx ? 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)' : '#fff',
                              color: editingOptionIndex === idx ? '#fff' : 'primary.main',
                              border: editingOptionIndex === idx ? '2px solid #1976d2' : '1px solid #90caf9',
                              px: 3,
                              py: 1.2,
                              fontSize: 16,
                              transition: 'all 0.2s',
                              position: 'relative',
                              '&:hover': {
                                background: editingOptionIndex === idx ? 'linear-gradient(90deg, #1565c0 0%, #42a5f5 100%)' : '#e3f0ff',
                                color: editingOptionIndex === idx ? '#fff' : 'primary.main',
                              }
                            }}
                            startIcon={editingOptionIndex === idx ? <EditIcon /> : <DescriptionIcon />}
                          >
                            {t('wizard.option')} {idx + 1}
                            {/* Badge ACTIVE */}
                            {editingOptionIndex === idx && (
                              <span style={{
                                position: 'absolute',
                                top: -14,
                                right: -14,
                                background: '#1976d2',
                                color: '#fff',
                                borderRadius: 8,
                                padding: '2px 10px',
                                fontSize: 12,
                                fontWeight: 700,
                                boxShadow: '0 2px 8px #1976d250',
                                zIndex: 2,
                                letterSpacing: 1
                              }}>
                                {t('wizard.active')}
                              </span>
                            )}
                          </Button>
                          {editingOptionIndex !== idx && (
                            <IconButton
                              size="small"
                              sx={{ position: 'absolute', top: 2, right: 2, zIndex: 2, color: '#d32f2f', background: '#fff', boxShadow: 1 }}
                              onClick={() => handleDeleteOption(idx)}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          )}
                        </span>
                      </Tooltip>
                    ))}
                    {savedOptions.length < 3 && (
                      <Tooltip title={t('wizard.createOption')} placement="top">
                        <Button
                          variant="outlined"
                          color="success"
                          onClick={handleNewOptionWithConfirm}
                          sx={{ fontWeight: 700, borderRadius: 2, px: 3, py: 1.2, fontSize: 16 }}
                          startIcon={<AddCircleOutlineIcon />}
                        >
                          {t('wizard.newOption')}
                        </Button>
                      </Tooltip>
                    )}
                  </ButtonGroup>
                )}
                
                {/* Bouton de réinitialisation complète */}
                <Button
                  variant="outlined"
                  color="error"
                  onClick={resetWizard}
                  sx={{
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 3,
                    py: 1.2,
                    fontSize: 14,
                    borderColor: '#f44336',
                    color: '#f44336',
                    '&:hover': {
                      borderColor: '#d32f2f',
                      backgroundColor: 'rgba(244, 67, 54, 0.04)',
                    }
                  }}
                  startIcon={<span>🔄</span>}
                >
                  Reset Options
                </Button>
              </Box>
            </Box>
          )}
          {/* Dialog de confirmation de perte de modifications */}
          <Dialog open={showUnsavedDialog} onClose={handleCancelUnsaved}>
            <DialogTitle>{t('wizard.unsavedChangesTitle')}</DialogTitle>
            <DialogContent>
              {t('wizard.unsavedChangesContent')}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelUnsaved} color="secondary">{t('wizard.cancel')}</Button>
              <Button onClick={handleConfirmUnsaved} color="primary" autoFocus>{t('wizard.continue')}</Button>
            </DialogActions>
          </Dialog>
          {/* Animation de transition sur le contenu du wizard */}
          <Fade in={true} key={fadeKey} timeout={400}>
            <div>
              {showFinalValidation && selectedOptionForValidation ? (
                <FinalValidation
                  selectedOption={selectedOptionForValidation}
                  allOptions={savedOptions}
                  onBack={() => {
                    setShowFinalValidation(false);
                    setSelectedOptionForValidation(null);
                  }}
                  onValidate={handleFinalValidation}
                  isCreatingQuote={isCreatingQuote}
                  requestId={requestId ? requestId : undefined}
                />
              ) : (
                <>
                  <Step7Recap
                    draftQuote={draftQuote}
                    onDownloadPdf={() => {
                      // TODO: Implémenter la fonction de téléchargement PDF
                      console.log('Téléchargement PDF non implémenté');
                    }}
                    // Nouvelles props pour la gestion des options multiples
                    quoteId={quoteId || undefined}
                    optionIndex={optionIndex}
                    existingOptions={existingOptions}
                    onOptionCreated={handleOptionCreated}
                  />
                  {savedOptions.length >= 3 && (
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <span style={{ color: '#d32f2f', fontWeight: 500 }}>
                        {t('wizard.limitReached')}
                      </span>
                    </Box>
                  )}
                  {savedOptions.length >= 2 && !showComparison && (
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                      <Button variant="contained" color="primary" onClick={() => setShowComparison(true)}>
                        {t('wizard.compareOptions')}
                      </Button>
                    </Box>
                  )}
                  {showComparison && (
                    <CompareOptions
                      options={savedOptions}
                      onSelectOption={handleValidateOptionFromCompare}
                      closeModal={() => setShowComparison(false)}
                    />
                  )}
                  {editingOptionIndex !== null && (
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <span style={{ color: '#1976d2', fontWeight: 600, fontSize: 18, background: '#e3f0ff', borderRadius: 8, padding: '4px 16px' }}>
                        {t('wizard.editOption')} {editingOptionIndex + 1}
                      </span>
                    </Box>
                  )}
                </>
              )}
            </div>
          </Fade>
        </>
      )}

              {/* === STATUT DE SYNCHRONISATION EN TEMPS RÉEL === */}
              <DraftSyncStatus
                syncStatus={syncStatus}
                onManualSave={saveDraftFromHook}
              />

              {/* Bouton de sauvegarde manuelle avec synchronisation automatique */}
        <SaveButton 
          onSave={handleManualSave}
          disabled={isSaving}
          variant="contained"
        />
        
        {/* Panel de debug */}
        <DebugPanel
          isOpen={debugPanelOpen}
          onToggle={() => setDebugPanelOpen(!debugPanelOpen)}
          debugInfo={{
            autoSaveEnabled: false,
            isSaving,
            draftId,
            lastSaved,
            currentStep,
            savedOptionsCount: savedOptions.length,
            hasRequestData: !!requestData,
            hasStep1: !!draftQuote.step1
          }}
          onRefresh={() => {
            handleManualSave();
          }}
        />

      {/* Nouvelle étape - Génération d'option */}
      {/* TEMPORAIREMENT DÉSACTIVÉ - composants supprimés */}
      {/* 
      {activeStep === 7 && !isOfferMode && (
        <OfferGenerationStep
          draftId={draftId || ''}
          draftData={draftQuote}
          onOptionGenerated={(result) => {
            console.log('Option générée:', result);
            setGeneratedQuoteId(result.quoteId);
            setOfferOptions([{
              optionId: result.optionId,
              description: 'Option Standard',
              haulageTotal: draftQuote.haulageTotal || 0,
              seafreightTotal: draftQuote.seafreightTotal || 0,
              miscellaneousTotal: draftQuote.miscTotal || 0,
              grandTotal: (draftQuote.haulageTotal || 0) + (draftQuote.seafreightTotal || 0) + (draftQuote.miscTotal || 0),
              currency: 'EUR',
              isPreferred: true,
              status: 'draft' as const
            }]);
            setIsOfferMode(true);
            showSnackbar('Option générée avec succès !', 'success');
          }}
          onBack={() => setActiveStep(6)}
        />
      )}

      {isOfferMode && generatedQuoteId && (
        <OfferManagement
          quoteId={generatedQuoteId}
          options={offerOptions}
          canAddOptions={offerOptions.length < 3}
          onAddOption={() => {
            // Rediriger vers un nouveau wizard
            console.log('Redémarrage du wizard pour nouvelle option');
            // Ici on pourrait appeler l'API restart-wizard
            showSnackbar('Redémarrage du wizard pour créer une nouvelle option...', 'success');
          }}
          onEditOption={(optionId) => {
            console.log('Édition de l\'option:', optionId);
            showSnackbar('Édition d\'option pas encore implémentée', 'warning');
          }}
          onPreviewOffer={() => {
            console.log('Prévisualisation du devis');
            showSnackbar('Prévisualisation du devis...', 'success');
          }}
          onSendOffer={() => {
            console.log('Envoi du devis au client');
            showSnackbar('Envoi du devis au client...', 'success');
          }}
        />
      )}
      */}

      {/* Étapes suivantes à ajouter ici */}
    </Box>
  </>
  );
}
