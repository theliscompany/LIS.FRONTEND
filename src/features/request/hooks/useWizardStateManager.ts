import { useState, useEffect, useCallback, useRef } from 'react';
import { useSnackbar } from 'notistack';
import { 
  postApiQuoteOfferDraft,
  putApiQuoteOfferDraftById,
  getDraft
} from '../../offer/api/sdk.gen';
import type { DraftQuote } from '../types/DraftQuote';
import { buildSDKPayload, calculateCurrentStep } from '../types/DraftQuote';
// import { useDraftPersistence } from './useDraftPersistence'; // TODO: À implémenter

export interface WizardState {
  activeStep: number;
  draftQuote: DraftQuote;
  isDirty: boolean;
  lastSavedAt: Date | null;
  isSaving: boolean;
  saveError: string | null;
}

export interface UseWizardStateManagerReturn {
  state: WizardState;
  updateStep: (stepNumber: number, data: any) => void;
  updateDraftQuote: (updates: Partial<DraftQuote>) => void;
  saveDraft: () => Promise<boolean>;
  loadDraft: (draftId: string) => Promise<boolean>;
  resetDraft: () => void;
  goToStep: (stepNumber: number) => void;
  canGoToNext: () => boolean;
  canGoToPrevious: () => boolean;
}

export const useWizardStateManager = (
  initialDraftQuote: DraftQuote,
  currentUserEmail: string,
  clientNumber: string,
  initialDraftId?: string | null
): UseWizardStateManagerReturn => {
  console.log('🚀 [HOOK] useWizardStateManager initialisé avec:', {
    hasInitialDraft: !!initialDraftQuote,
    initialDraftQuote,
    currentUserEmail,
    clientNumber,
    initialDraftId
  });

  const { enqueueSnackbar } = useSnackbar();
  
  // ✅ NOUVEAU: Hook de persistance avec séparation local/BD
  // const persistence = useDraftPersistence(currentUserEmail, clientNumber); // TODO: À implémenter
  
  // ✅ État local pour le draftId (peut changer lors du chargement)
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(initialDraftId || null);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedDataRef = useRef<string>('');
  const isInitialLoadRef = useRef<boolean>(true);

  const [state, setState] = useState<WizardState>({
    activeStep: 0,
    draftQuote: initialDraftQuote,
    isDirty: false,
    lastSavedAt: null,
    isSaving: false,
    saveError: null
  });

  // ✅ CORRECTION : Synchroniser currentDraftId avec draftQuote.id
  useEffect(() => {
    const draftQuoteId = state.draftQuote?.id;
    if (draftQuoteId && draftQuoteId !== currentDraftId) {
      console.log('🔄 [HOOK] Synchronisation currentDraftId avec draftQuote.id:', {
        oldCurrentDraftId: currentDraftId,
        newDraftQuoteId: draftQuoteId
      });
      setCurrentDraftId(draftQuoteId);
    }
  }, [state.draftQuote?.id, currentDraftId]);
  
  // ✅ Log pour tracer le draftId
  console.log('🔧 [HOOK] État du draftId:', {
    initialDraftId,
    currentDraftId,
    draftQuoteId: state.draftQuote?.id,
    hasInitialDraftId: !!initialDraftId,
    hasCurrentDraftId: !!currentDraftId,
    hasDraftQuoteId: !!state.draftQuote?.id
  });

  console.log('✅ [HOOK] État initial créé:', state);

  // === FONCTIONS UTILITAIRES ===
  const serializeDraftQuote = (draft: DraftQuote): string => {
    return JSON.stringify(draft, (key, value) => {
      if (value instanceof Date) return value.toISOString();
      return value;
    });
  };

  const deserializeDraftQuote = (data: string): DraftQuote => {
    return JSON.parse(data, (key, value) => {
      if (key === 'lastSavedAt' && typeof value === 'string') {
        return new Date(value);
      }
      return value;
    });
  };

  const hasUnsavedChanges = (current: DraftQuote): boolean => {
    const currentSerialized = serializeDraftQuote(current);
    return currentSerialized !== lastSavedDataRef.current;
  };

  // === VALIDATION DES DONNÉES ===
  const validateDraftQuote = (draft: DraftQuote): { isValid: boolean; errors: string[]; warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validation de l'étape 1 (Informations de base)
    if (!draft.step1?.customer?.contactId) {
      errors.push('Client obligatoire');
    }
    if (!draft.step1?.cityFrom?.name) {
      errors.push('Ville de départ obligatoire');
    }
    if (!draft.step1?.cityTo?.name) {
      errors.push('Ville de destination obligatoire');
    }
    if (!draft.step1?.productName?.productId) {
      errors.push('Produit obligatoire');
    }
    if (!draft.step1?.incotermName) {
      warnings.push('Incoterm recommandé');
    }

    // Validation de l'étape 2 (Services)
    if (!draft.step2?.selected || draft.step2.selected.length === 0) {
      warnings.push('Aucun service sélectionné');
    }

    // Validation de l'étape 3 (Conteneurs)
    if (!draft.selectedContainers || Object.keys(draft.selectedContainers).length === 0) {
      warnings.push('Aucun conteneur sélectionné');
    }

    // Validation de l'étape 4 (Haulage)
    if (!draft.selectedHaulage) {
      warnings.push('Haulage non sélectionné');
    }

    // Validation de l'étape 5 (Seafreight)
    if (!draft.selectedSeafreights || draft.selectedSeafreights.length === 0) {
      warnings.push('Aucun seafreight sélectionné');
    }

    // Validation des totaux
    if (draft.totalPrice < 0) {
      errors.push('Prix total invalide');
    }

    // Validation des données de contact
    if (draft.step1?.customer?.email && !isValidEmail(draft.step1.customer.email)) {
      warnings.push('Format d\'email invalide');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // === SAUVEGARDE MANUELLE AVEC VALIDATION ===
  const saveDraft = useCallback(async (): Promise<boolean> => {
    console.log('🚀 [SAVE_DRAFT] Fonction saveDraft appelée');
    console.log('🚀 [SAVE_DRAFT] État actuel:', {
      isSaving: state.isSaving,
      isDirty: state.isDirty,
      hasDraftId: !!currentDraftId,
      currentDraftId,
      currentUserEmail,
      hasDraftQuote: !!state.draftQuote
    });
    
    if (state.isSaving) {
      console.log('❌ [SAVE_DRAFT] Déjà en cours de sauvegarde, sortie');
      return false;
    }

    // Validation des données avant sauvegarde
    console.log('🔍 [SAVE_DRAFT] Validation des données...');
    const validation = validateDraftQuote(state.draftQuote);
    
    if (!validation.isValid) {
      console.error('❌ [SAVE_DRAFT] Validation échouée:', validation.errors);
      enqueueSnackbar(`Erreurs de validation: ${validation.errors.join(', ')}`, { variant: 'error' });
      return false;
    }

    if (validation.warnings.length > 0) {
      console.warn('⚠️ [SAVE_DRAFT] Avertissements:', validation.warnings);
      enqueueSnackbar(`Avertissements: ${validation.warnings.join(', ')}`, { variant: 'warning' });
    }

    setState(prev => ({ ...prev, isSaving: true, saveError: null }));
    console.log('✅ [SAVE_DRAFT] État isSaving mis à true');

    try {
      console.log('🔧 [SAVE_DRAFT] Construction du payload avec buildSDKPayload...');
      const draftData = buildSDKPayload(state.draftQuote, currentUserEmail);
      
      console.log('💾 [SAVE_DRAFT] Tentative de sauvegarde:', {
        hasDraftId: !!currentDraftId,
        currentDraftId,
        draftData: draftData
      });

      // ✅ CORRECTION : Utiliser l'ID du draftQuote ou currentDraftId
      const effectiveDraftId = state.draftQuote?.id || currentDraftId;
      
      console.log('🔧 [SAVE_DRAFT] Détermination de l\'ID à utiliser:', {
        draftQuoteId: state.draftQuote?.id,
        currentDraftId,
        effectiveDraftId
      });

      let result;
      if (effectiveDraftId) {
        // Mise à jour d'un brouillon existant
        console.log('🔄 [SAVE_DRAFT] Mise à jour du brouillon existant:', effectiveDraftId);
        console.log('🔄 [SAVE_DRAFT] Appel de putApiQuoteOfferDraftById...');
        result = await putApiQuoteOfferDraftById({
          path: { id: effectiveDraftId },
          body: draftData
        });
      } else {
        // Création d'un nouveau brouillon
        console.log('🆕 [SAVE_DRAFT] Création d\'un nouveau brouillon');
        console.log('🆕 [SAVE_DRAFT] Appel de postApiQuoteOfferDraft...');
        result = await postApiQuoteOfferDraft({
          body: draftData
        });
      }

      console.log('✅ [SAVE_DRAFT] Appel API réussi:', result);
      console.log('✅ [SAVE_DRAFT] Données sauvegardées dans l\'API:', {
        hasResult: !!result,
        hasData: !!(result as any)?.data,
        responseData: (result as any)?.data
      });
      
      // ✅ Mettre à jour le draftId si c'est une création
      if (!effectiveDraftId && (result as any)?.data?.id) {
        console.log('🆕 [SAVE_DRAFT] Nouveau brouillon créé avec ID:', (result as any).data.id);
        const newDraftId = (result as any).data.id;
        setCurrentDraftId(newDraftId);
        
        // ✅ CORRECTION : Mettre à jour aussi l'ID dans le draftQuote
        setState(prev => ({
          ...prev,
          draftQuote: {
            ...prev.draftQuote,
            id: newDraftId
          }
        }));
      }
      
      // Mise à jour de l'état en cas de succès
      const savedData = serializeDraftQuote(state.draftQuote);
      lastSavedDataRef.current = savedData;
      
      setState(prev => ({
        ...prev,
        isDirty: false,
        lastSavedAt: new Date(),
        isSaving: false,
        saveError: null
      }));

      // ✅ Pas de notification pour la sauvegarde automatique (silencieuse)
      console.log('✅ [SAVE_DRAFT] Sauvegarde manuelle terminée avec succès');
      return true;
    } catch (error: any) {
      console.error('❌ [SAVE_DRAFT] Erreur lors de la sauvegarde:', error);
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        saveError: error.message || 'Erreur de sauvegarde'
      }));

      enqueueSnackbar('Erreur lors de la sauvegarde', { variant: 'error' });
      return false;
    }
  }, [state.draftQuote, state.isSaving, currentDraftId, currentUserEmail, enqueueSnackbar]);

  // === CHARGEMENT D'UN BROUILLON ===
  const loadDraft = useCallback(async (draftIdToLoad: string): Promise<boolean> => {
    try {
      console.log('📥 [LOAD_DRAFT] Chargement du brouillon:', draftIdToLoad);
      
      setState(prev => ({ ...prev, isSaving: true, saveError: null }));
      
      // Appel API pour charger le brouillon
      console.log('📡 [LOAD_DRAFT] Appel API getDraft avec:', { id: draftIdToLoad });
      const response = await getDraft({ 
        path: { id: draftIdToLoad } 
      });
      
      console.log('✅ [LOAD_DRAFT] Réponse API reçue:', response);
      console.log('✅ [LOAD_DRAFT] Type de réponse:', typeof response);
      console.log('✅ [LOAD_DRAFT] response.data:', response.data);
      console.log('✅ [LOAD_DRAFT] response.status:', response.status);
      
      if (response.data && (response.data as any).data) {
        // Transformer la réponse API en DraftQuote
        // La réponse API a la structure: response.data.data.draftData
        console.log('🔄 [LOAD_DRAFT] Données passées à transformApiResponseToDraftQuote:', (response.data as any).data);
        const loadedDraft = transformApiResponseToDraftQuote((response.data as any).data);
        
        console.log('🔄 [LOAD_DRAFT] Brouillon transformé:', loadedDraft);
        
        // ✅ Mettre à jour le draftId avec l'ID du brouillon chargé
        const loadedDraftId = (response.data as any).data.id;
        if (loadedDraftId) {
          console.log('🔄 [LOAD_DRAFT] Mise à jour du draftId:', loadedDraftId);
          setCurrentDraftId(loadedDraftId);
        }
        
        // Mettre à jour l'état avec le brouillon chargé
        setState(prev => ({
          ...prev,
          draftQuote: loadedDraft,
          isDirty: false,
          lastSavedAt: new Date(),
          isSaving: false,
          saveError: null
        }));
        
        // Mettre à jour la référence des données sauvegardées
        const serializedData = serializeDraftQuote(loadedDraft);
        lastSavedDataRef.current = serializedData;
        
        // ✅ CORRECTION: Marquer la fin du chargement initial
        isInitialLoadRef.current = false;
        
        enqueueSnackbar('Brouillon chargé avec succès', { variant: 'success' });
        return true;
      } else {
        throw new Error('Aucune donnée reçue de l\'API');
      }
    } catch (error: any) {
      console.error('❌ [LOAD_DRAFT] Erreur de chargement:', error);
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        saveError: error.message || 'Erreur de chargement'
      }));

      enqueueSnackbar(`Erreur lors du chargement: ${error.message}`, { variant: 'error' });
      return false;
    }
  }, [enqueueSnackbar]);

  // === SAUVEGARDE AUTOMATIQUE (SANS REDIRECTION) ===
  const autoSaveDraft = useCallback(async (): Promise<boolean> => {
    console.log('⏰ [AUTO_SAVE] Sauvegarde automatique en arrière-plan');
    
    if (state.isSaving) {
      console.log('⏰ [AUTO_SAVE] Déjà en cours de sauvegarde, sortie');
      return false;
    }

    // Validation des données avant sauvegarde
    const validation = validateDraftQuote(state.draftQuote);
    
    if (!validation.isValid) {
      console.error('⏰ [AUTO_SAVE] Validation échouée:', validation.errors);
      return false;
    }

    setState(prev => ({ ...prev, isSaving: true, saveError: null }));

    try {
      console.log('⏰ [AUTO_SAVE] Construction du payload avec buildSDKPayload...');
      const draftData = buildSDKPayload(state.draftQuote, currentUserEmail);
      
      // ✅ CORRECTION : Utiliser l'ID du draftQuote ou currentDraftId
      const effectiveDraftId = state.draftQuote?.id || currentDraftId;
      
      console.log('🔧 [AUTO_SAVE] Détermination de l\'ID à utiliser:', {
        draftQuoteId: state.draftQuote?.id,
        currentDraftId,
        effectiveDraftId
      });
      
      let result;
      if (effectiveDraftId) {
        // Mise à jour d'un brouillon existant
        console.log('⏰ [AUTO_SAVE] Mise à jour du brouillon existant:', effectiveDraftId);
        result = await putApiQuoteOfferDraftById({
          path: { id: effectiveDraftId },
          body: draftData
        });
      } else {
        // Création d'un nouveau brouillon
        console.log('⏰ [AUTO_SAVE] Création d\'un nouveau brouillon');
        result = await postApiQuoteOfferDraft({
          body: draftData
        });
      }

      console.log('⏰ [AUTO_SAVE] Sauvegarde automatique réussie:', result);
      
      // ✅ Mettre à jour le draftId si c'est une création (SANS REDIRECTION)
      if (!effectiveDraftId && (result as any)?.data?.id) {
        console.log('⏰ [AUTO_SAVE] Nouveau brouillon créé avec ID:', (result as any).data.id);
        const newDraftId = (result as any).data.id;
        setCurrentDraftId(newDraftId);
        
        // ✅ CORRECTION : Mettre à jour aussi l'ID dans le draftQuote
        setState(prev => ({
          ...prev,
          draftQuote: {
            ...prev.draftQuote,
            id: newDraftId
          }
        }));
        // ✅ PAS DE REDIRECTION pour la sauvegarde automatique
      }
      
      // Mise à jour de l'état en cas de succès
      const savedData = serializeDraftQuote(state.draftQuote);
      lastSavedDataRef.current = savedData;
      
      setState(prev => ({
        ...prev,
        isDirty: false,
        lastSavedAt: new Date(),
        isSaving: false,
        saveError: null
      }));

      // ✅ Pas de notification pour la sauvegarde automatique (silencieuse)
      console.log('⏰ [AUTO_SAVE] Sauvegarde automatique terminée avec succès');
      return true;

    } catch (error) {
      console.error('⏰ [AUTO_SAVE] Erreur lors de la sauvegarde automatique:', error);
      setState(prev => ({
        ...prev,
        isSaving: false,
        saveError: error instanceof Error ? error.message : 'Erreur inconnue'
      }));
      // ✅ Pas de notification d'erreur pour la sauvegarde automatique (silencieuse)
      return false;
    }
  }, [state.draftQuote, state.isSaving, currentDraftId, currentUserEmail]);

  // === PLANIFICATION DE LA SAUVEGARDE AUTOMATIQUE ===
  const scheduleAutoSave = useCallback(() => {
    console.log('⏰ [AUTO_SAVE] Planification de la sauvegarde automatique');
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      console.log('⏰ [AUTO_SAVE] Vérification des conditions:', {
        isDirty: state.isDirty,
        hasChanges: hasUnsavedChanges(state.draftQuote)
      });
      if (state.isDirty && hasUnsavedChanges(state.draftQuote)) {
        console.log('⏰ [AUTO_SAVE] Déclenchement de la sauvegarde automatique');
        autoSaveDraft(); // ✅ Utiliser la fonction de sauvegarde automatique
      } else {
        console.log('⏰ [AUTO_SAVE] Pas de sauvegarde nécessaire');
      }
    }, 3000); // ✅ Augmenté à 3 secondes pour éviter les sauvegardes trop fréquentes
  }, [state.isDirty, state.draftQuote, autoSaveDraft]);

  // === MISE À JOUR DES ÉTAPES ===
  const updateStep = useCallback((stepNumber: number, data: any) => {
    console.log('🔄 [UPDATE_STEP] Mise à jour de l\'étape:', stepNumber, 'avec les données:', data);
    
    setState(prev => {
      const stepKey = `step${stepNumber}` as keyof DraftQuote;
      const currentStepData = prev.draftQuote[stepKey];
      
      // ✅ CORRECTION : Mettre à jour à la fois le draftQuote et le draftData.steps
      const updatedStepData = {
        ...(currentStepData && typeof currentStepData === 'object' ? currentStepData : {}),
        ...data
      };
      
      // Créer le draftQuote mis à jour
      const updatedDraftQuote: DraftQuote = {
        ...prev.draftQuote,
        [stepKey]: updatedStepData,
        draftData: {
          ...prev.draftQuote.draftData,
          steps: {
            ...prev.draftQuote.draftData?.steps,
            [stepKey]: updatedStepData // ✅ CORRECTION : Mettre à jour draftData.steps
          } as any, // ✅ CORRECTION : Type assertion pour éviter les erreurs de type
          totals: prev.draftQuote.draftData?.totals || {} as any,
          wizard: {
            currentStep: 0, // Temporaire, sera calculé automatiquement
            completedSteps: Array.from({ length: prev.activeStep }, (_, i) => i + 1),
            status: 'draft',
            lastModified: new Date().toISOString(),
            version: '1.0'
          }
        }
      };

      // Calculer automatiquement le currentStep basé sur les données mises à jour
      const calculatedCurrentStep = calculateCurrentStep(updatedDraftQuote);
      
      // Mettre à jour le currentStep calculé
      if (updatedDraftQuote.draftData) {
        updatedDraftQuote.draftData.wizard.currentStep = calculatedCurrentStep;
      }

      console.log('🔄 [UPDATE_STEP] Brouillon mis à jour:', {
        stepKey,
        newData: data,
        updatedStep: updatedDraftQuote[stepKey],
        updatedDraftDataSteps: updatedDraftQuote.draftData ? (updatedDraftQuote.draftData.steps as any)[stepKey] : undefined,
        calculatedCurrentStep
      });

      return {
        ...prev,
        draftQuote: updatedDraftQuote,
        isDirty: true
      };
    });

    // ✅ Planifier la sauvegarde automatique seulement si il y a des changements significatifs
    if (data && Object.keys(data).length > 0) {
      console.log('🔄 [UPDATE_STEP] Déclenchement de la sauvegarde automatique');
      scheduleAutoSave();
    }
  }, [scheduleAutoSave]);

  // === MISE À JOUR GLOBALE ===
  const updateDraftQuote = useCallback((updates: Partial<DraftQuote>) => {
    setState(prev => ({
      ...prev,
      draftQuote: { ...prev.draftQuote, ...updates },
      isDirty: true
    }));

    scheduleAutoSave();
  }, [scheduleAutoSave]);

  // === NAVIGATION ===
  const goToStep = useCallback((stepNumber: number) => {
    if (stepNumber >= 0 && stepNumber <= 6) {
      setState(prev => {
        const newActiveStep = stepNumber;
        
        // Créer un nouveau draftQuote temporaire pour calculer le currentStep
        const tempDraftQuote = {
          ...prev.draftQuote,
          draftData: {
            ...prev.draftQuote.draftData,
            steps: prev.draftQuote.draftData?.steps || {} as any,
            totals: prev.draftQuote.draftData?.totals || {} as any,
            wizard: {
              currentStep: 0, // Temporaire
              completedSteps: [],
              status: 'draft',
              lastModified: new Date().toISOString(),
              version: '1.0'
            }
          }
        };
        
        // Calculer automatiquement le currentStep basé sur les données
        const calculatedCurrentStep = calculateCurrentStep(tempDraftQuote);
        
        // Mettre à jour completedSteps : ajouter toutes les étapes précédentes
        const newCompletedSteps = Array.from({ length: stepNumber }, (_, i) => i + 1);
        
        return {
          ...prev,
          activeStep: newActiveStep,
          draftQuote: {
            ...prev.draftQuote,
            draftData: {
              ...prev.draftQuote.draftData,
              steps: prev.draftQuote.draftData?.steps || {} as any,
              totals: prev.draftQuote.draftData?.totals || {} as any,
              wizard: {
                currentStep: calculatedCurrentStep,
                completedSteps: newCompletedSteps,
                status: 'draft',
                lastModified: new Date().toISOString(),
                version: '1.0'
              }
            }
          }
        };
      });
    }
  }, []);

  const canGoToNext = useCallback((): boolean => {
    // Logique de validation selon l'étape active
    const currentStep = state.activeStep;
    const draft = state.draftQuote;

    switch (currentStep) {
      case 0: // Étape 1: Informations de base
        return !!(draft.step1?.customer && draft.step1?.cityFrom && draft.step1?.cityTo);
      
      case 1: // Étape 2: Services
        return draft.step2?.selected && draft.step2.selected.length > 0;
      
      case 2: // Étape 3: Conteneurs
        return Object.keys(draft.selectedContainers || {}).length > 0;
      
      case 3: // Étape 4: Haulage
        return !!draft.selectedHaulage;
      
      case 4: // Étape 5: Seafreight
        return draft.selectedSeafreights && draft.selectedSeafreights.length > 0;
      
      case 5: // Étape 6: Miscellaneous
        return true; // Optionnel
      
      case 6: // Étape 7: Récapitulatif
        return true; // Toujours accessible
      
      default:
        return false;
    }
  }, [state.activeStep, state.draftQuote]);

  const canGoToPrevious = useCallback((): boolean => {
    return state.activeStep > 0;
  }, [state.activeStep]);

  // === RÉINITIALISATION ===
  const resetDraft = useCallback(() => {
    const initialDraft = createInitialDraftQuote(currentUserEmail);
    const serializedData = serializeDraftQuote(initialDraft);
    
    lastSavedDataRef.current = serializedData;
    
    // ✅ Réinitialiser le draftId
    setCurrentDraftId(null);
    
    setState(prev => ({
      ...prev,
      draftQuote: initialDraft,
      activeStep: 0,
      isDirty: false,
      lastSavedAt: null,
      saveError: null
    }));
  }, [currentUserEmail]);

  // === EFFET DE SAUVEGARDE AUTOMATIQUE ===
  useEffect(() => {
    console.log('🔄 [HOOK] useEffect - Sauvegarde automatique déclenchée');
    console.log('🔄 [HOOK] État actuel:', {
      isDirty: state.isDirty,
      isSaving: state.isSaving,
      hasChanges: hasUnsavedChanges(state.draftQuote)
    });
    
    // ✅ CORRECTION: Éviter la sauvegarde automatique pendant le chargement initial
    if (state.isDirty && hasUnsavedChanges(state.draftQuote) && !state.isSaving && !isInitialLoadRef.current) {
      console.log('🔄 [HOOK] Déclenchement de la sauvegarde automatique');
      scheduleAutoSave();
    } else {
      console.log('🔄 [HOOK] Pas de sauvegarde automatique nécessaire', {
        isDirty: state.isDirty,
        hasChanges: hasUnsavedChanges(state.draftQuote),
        isSaving: state.isSaving,
        isInitialLoad: isInitialLoadRef.current
      });
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state.draftQuote, state.isDirty, state.isSaving, scheduleAutoSave]);

  // === CHARGEMENT INITIAL ===
  useEffect(() => {
    console.log('🔄 [HOOK] useEffect - Chargement initial déclenché');
    if (initialDraftId) {
      console.log('📥 [HOOK] Chargement du draft existant:', initialDraftId);
      loadDraft(initialDraftId);
    } else {
      console.log('🆕 [HOOK] Aucun draftId, utilisation du brouillon initial');
      // ✅ CORRECTION: Marquer la fin du chargement initial même pour un nouveau brouillon
      isInitialLoadRef.current = false;
    }
  }, [initialDraftId, loadDraft]);

  return {
    state,
    updateStep,
    updateDraftQuote,
    saveDraft,
    loadDraft,
    resetDraft,
    goToStep,
    canGoToNext,
    canGoToPrevious
  };
};

// === FONCTIONS DE TRANSFORMATION ===
function transformDraftQuoteToRequest(
  draftQuote: DraftQuote, 
  currentUserEmail: string, 
  clientNumber: string
): any {
  return buildSDKPayload(draftQuote, currentUserEmail);
}

function transformApiResponseToDraftQuote(apiResponse: any): DraftQuote {
  console.log('🔄 [TRANSFORM] Transformation de la réponse API:', apiResponse);
  
  // Créer un brouillon de base
  const baseDraft = createInitialDraftQuote(apiResponse.emailUser || 'user@example.com');
  
  // Extraire les données des steps depuis draftData
  const draftData = apiResponse.draftData || {};
  const steps = draftData.steps || {};
  const step1 = steps.step1 || {};
  const step2 = steps.step2 || {};
  
  console.log('🔄 [TRANSFORM] Données extraites:', { 
    draftData, 
    steps, 
    step1, 
    step2,
    optionsCount: draftData.options?.length || 0,
    options: draftData.options || []
  });
  
  // Enrichir avec les données de l'API
  const transformedDraft: DraftQuote = {
    ...baseDraft,
    id: apiResponse.id || 'unknown',
    draftId: apiResponse.id,
    requestQuoteId: apiResponse.requestQuoteId || 'unknown',
    clientNumber: apiResponse.clientNumber || 'DEFAULT',
    emailUser: apiResponse.emailUser || baseDraft.emailUser,
    // status: apiResponse.status || 'DRAFT', // Commenté car pas dans le type DraftQuote
    // assignee: apiResponse.assignee || '', // Commenté car pas dans le type DraftQuote
    // lastModified: apiResponse.lastModified || new Date().toISOString(), // Commenté car pas dans le type DraftQuote
    // version: draftData.wizard?.version || '1.0', // Commenté car pas dans le type DraftQuote
    step1: {
      ...baseDraft.step1,
      customer: {
        ...baseDraft.step1.customer,
        contactId: step1.customer?.contactId || 0,
        contactName: step1.customer?.contactName || '',
        companyName: step1.customer?.companyName || '',
        email: step1.customer?.email || baseDraft.step1.customer.email
      },
      route: {
        ...baseDraft.step1.route,
        origin: {
          ...baseDraft.step1.route.origin,
          city: { 
            name: step1.route?.origin?.city?.name || '', 
            country: step1.route?.origin?.city?.country || '' 
          },
          port: { 
            portId: step1.route?.origin?.port?.portId || 0, 
            portName: step1.route?.origin?.port?.portName || '', 
            country: step1.route?.origin?.port?.country || '' 
          }
        },
        destination: {
          ...baseDraft.step1.route.destination,
          city: { 
            name: step1.route?.destination?.city?.name || '', 
            country: step1.route?.destination?.city?.country || '' 
          },
          port: { 
            portId: step1.route?.destination?.port?.portId || 0, 
            portName: step1.route?.destination?.port?.portName || '', 
            country: step1.route?.destination?.port?.country || '' 
          }
        }
      },
      cargo: {
        ...baseDraft.step1.cargo,
        product: { 
          productId: step1.cargo?.product?.productId || 1, 
          productName: step1.cargo?.product?.productName || '' 
        },
        incoterm: step1.cargo?.incoterm || ''
      },
      metadata: { 
        comment: step1.metadata?.comment || '' 
      },
      cityFrom: { 
        name: step1.route?.origin?.city?.name || '', 
        country: step1.route?.origin?.city?.country || '' 
      },
      cityTo: { 
        name: step1.route?.destination?.city?.name || '', 
        country: step1.route?.destination?.city?.country || '' 
      },
      productName: { 
        productId: step1.cargo?.product?.productId || 1, 
        productName: step1.cargo?.product?.productName || '' 
      },
      incotermName: step1.cargo?.incoterm || '',
      portFrom: { 
        portId: step1.route?.origin?.port?.portId || 0, 
        portName: step1.route?.origin?.port?.portName || '', 
        country: step1.route?.origin?.port?.country || '' 
      },
      portTo: { 
        portId: step1.route?.destination?.port?.portId || 0, 
        portName: step1.route?.destination?.port?.portName || '', 
        country: step1.route?.destination?.port?.country || '' 
      },
      comment: step1.metadata?.comment || '',
      assignee: apiResponse.emailUser || baseDraft.emailUser,
      status: 'NEW'
    },
    step2: {
      ...baseDraft.step2,
      selectedServices: steps.step2?.selectedServices || baseDraft.step2.selectedServices,
      selected: steps.step2?.selected || baseDraft.step2.selected
    },
    step3: {
      ...baseDraft.step3,
      containers: steps.step3?.containers || baseDraft.step3.containers,
      summary: {
        ...baseDraft.step3.summary,
        totalContainers: steps.step3?.summary?.totalContainers || 0,
        totalTEU: steps.step3?.summary?.totalTEU || 0,
        containerTypes: steps.step3?.summary?.containerTypes || []
      },
      route: {
        ...baseDraft.step3.route,
        origin: {
          ...baseDraft.step3.route.origin,
          city: { 
            name: steps.step3?.route?.origin?.city?.name || '', 
            country: steps.step3?.route?.origin?.city?.country || '' 
          },
          port: { 
            portId: steps.step3?.route?.origin?.port?.portId || 0, 
            portName: steps.step3?.route?.origin?.port?.portName || '', 
            country: steps.step3?.route?.origin?.port?.country || '' 
          }
        },
        destination: {
          ...baseDraft.step3.route.destination,
          city: { 
            name: steps.step3?.route?.destination?.city?.name || '', 
            country: steps.step3?.route?.destination?.city?.country || '' 
          },
          port: { 
            portId: steps.step3?.route?.destination?.port?.portId || 0, 
            portName: steps.step3?.route?.destination?.port?.portName || '', 
            country: steps.step3?.route?.destination?.port?.country || '' 
          }
        }
      },
      selectedContainers: {
        ...baseDraft.selectedContainers,
        list: steps.step3?.selectedContainers?.list || baseDraft.selectedContainers.list
      }
    },
    step4: {
      ...baseDraft.step4,
      selection: {
        ...baseDraft.step4.selection,
        ...steps.step4?.selection
      },
      calculation: {
        ...baseDraft.step4.calculation,
        ...steps.step4?.calculation
      }
    },
    step5: {
      ...baseDraft.step5,
      selections: steps.step5?.selections || baseDraft.step5.selections,
      summary: {
        ...baseDraft.step5.summary,
        ...steps.step5?.summary
      }
    },
    step6: {
      ...baseDraft.step6,
      selections: steps.step6?.selections || baseDraft.step6.selections,
      summary: {
        ...baseDraft.step6.summary,
        ...steps.step6?.summary
      }
    },
    step7: {
      ...baseDraft.step7,
      finalization: {
        ...baseDraft.step7.finalization,
        ...steps.step7?.finalization
      },
      validation: {
        ...baseDraft.step7.validation,
        ...steps.step7?.validation
      },
      pricingSummary: {
        ...baseDraft.step7.pricingSummary,
        ...steps.step7?.pricingSummary
      }
    },
    totals: {
      ...baseDraft.totals,
      ...(draftData.totals || {})
    },
    selectedHaulage: baseDraft.selectedHaulage,
    selectedSeafreights: baseDraft.selectedSeafreights || [],
    selectedMiscellaneous: baseDraft.selectedMiscellaneous || [],
    selectedContainers: {
      ...baseDraft.selectedContainers
    },
    marginType: baseDraft.marginType || 'percent',
    marginValue: baseDraft.marginValue || 0,
    totalPrice: baseDraft.totalPrice || 0,
    seafreightTotal: baseDraft.seafreightTotal || 0,
    haulageTotal: baseDraft.haulageTotal || 0,
    miscTotal: baseDraft.miscTotal || 0,
    totalTEU: draftData.totals?.totalTEU || baseDraft.totalTEU || 0,
    seafreightQuantities: baseDraft.seafreightQuantities || {},
    miscQuantities: baseDraft.miscQuantities || {},
    surchargeQuantities: baseDraft.surchargeQuantities || {},
    
    // ✅ AJOUT : Mapper les options depuis draftData.options vers savedOptions avec nouvelle structure
    savedOptions: (draftData.options || []).map((option: any) => ({
      optionId: option.optionId || '',
      name: option.name || '',
      description: option.description || '',
      haulageSelectionId: option.haulageSelectionId || null,
      seafreightSelectionIds: option.seafreightSelectionIds || [],
      miscSelectionIds: option.miscSelectionIds || [],
      step4Data: option.step4Data || null,
      step5Data: option.step5Data || null,
      step6Data: option.step6Data || null,
      step7Data: option.step7Data || null,
      marginType: option.marginType || 'percentage',
      marginValue: option.marginValue || 0,
      totals: {
        haulageTotalAmount: option.totals?.haulageTotalAmount || 0,
        seafreightBaseAmount: option.totals?.seafreightBaseAmount || 0,
        seafreightSurchargesAmount: option.totals?.seafreightSurchargesAmount || 0,
        seafreightTotalAmount: option.totals?.seafreightTotalAmount || 0,
        miscTotalAmount: option.totals?.miscTotalAmount || 0,
        subTotal: option.totals?.subTotal || 0,
        marginAmount: option.totals?.marginAmount || 0,
        finalTotal: option.totals?.finalTotal || 0,
        currency: option.totals?.currency || 'EUR',
        calculatedAt: option.totals?.calculatedAt || new Date().toISOString()
      },
      createdAt: option.createdAt || new Date().toISOString(),
      updatedAt: option.updatedAt || null,
      createdBy: option.createdBy || null,
      calculatedMargin: option.calculatedMargin || option.totals?.marginAmount || 0,
      finalTotal: option.finalTotal || option.totals?.finalTotal || 0
    })),
    
    // Mapper les autres champs d'options depuis l'API
    currentWorkingOptionId: draftData.currentWorkingOptionId || null,
    preferredOptionId: draftData.preferredOptionId || '',
    maxOptionsAllowed: draftData.maxOptionsAllowed || 3,
    
    draftData: draftData
  };
  
  console.log('✅ [TRANSFORM] Brouillon transformé:', transformedDraft);
  return transformedDraft;
}

function createInitialDraftQuote(currentUserEmail?: string): DraftQuote {
  return {
    step1: {
      customer: { contactId: 0, contactName: '', companyName: '', email: '' },
      route: { origin: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } }, destination: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } } },
      cargo: { product: { productId: 1, productName: '' }, incoterm: '' },
      metadata: { comment: '' },
      status: 'NEW',
      assignee: '',
      cityFrom: { name: '', country: '' },
      cityTo: { name: '', country: '' },
      productName: { productId: 1, productName: '' },
      incotermName: '',
      portFrom: { portId: 0, portName: '', country: '' },
      portTo: { portId: 0, portName: '', country: '' },
      comment: ''
    },
    step2: { selectedServices: [], selected: [] },
    step3: { containers: [], summary: { totalContainers: 0, totalTEU: 0, containerTypes: [] }, route: { origin: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } }, destination: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } } }, selectedContainers: { list: [] } },
    step4: { selection: { offerId: '', haulierId: 0, haulierName: '', tariff: { unitPrice: 0, currency: 'EUR', freeTime: 0 }, route: { pickup: { company: '', city: '', country: '' }, delivery: { portId: 0, portName: '', country: '' } }, validity: { validUntil: '' } }, calculation: { quantity: 0, unitPrice: 0, subtotal: 0, currency: 'EUR' } },
    step5: { selections: [], summary: { totalSelections: 0, totalContainers: 0, totalAmount: 0, currency: 'EUR', selectedCarriers: [], containerTypes: [], preferredSelectionId: '' } },
    step6: { selections: [], summary: { totalSelections: 0, totalAmount: 0, currency: 'EUR', categories: [] } },
    step7: { finalization: { optionName: '', optionDescription: '', marginPercentage: 0, marginAmount: 0, marginType: 'percentage', isReadyToGenerate: false, generatedAt: '' }, validation: { allStepsValid: false, errors: [], warnings: [] }, pricingSummary: { baseTotal: 0, marginAmount: 0, finalTotal: 0, currency: 'EUR', breakdown: { haulageAmount: 0, seafreightAmount: 0, miscellaneousAmount: 0, totalBeforeMargin: 0, components: [] } } },
    totals: { haulage: 0, seafreight: 0, miscellaneous: 0, subtotal: 0, grandTotal: 0, currency: 'EUR', totalTEU: 0 },
    savedOptions: [],
    selectedHaulage: undefined,
    selectedSeafreights: [],
    selectedMiscellaneous: [],
    selectedContainers: {},
    marginType: 'percent',
    marginValue: 0,
    totalPrice: 0,
    seafreightTotal: 0,
    haulageTotal: 0,
    miscTotal: 0,
    totalTEU: 0,
    seafreightQuantities: {},
    miscQuantities: {},
    surchargeQuantities: {},
    emailUser: currentUserEmail || '',
    draftData: {
      wizard: {
        currentStep: 1, // Étape 1 par défaut
        completedSteps: [],
        status: 'draft',
        lastModified: new Date().toISOString(),
        version: '1.0'
      },
      steps: {
        step1: {
          customer: { contactId: 0, contactName: '', companyName: '', email: '' },
          route: { origin: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } }, destination: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } } },
          cargo: { product: { productId: 1, productName: '' }, incoterm: '' },
          metadata: { comment: '' },
          status: 'NEW',
          assignee: '',
          cityFrom: { name: '', country: '' },
          cityTo: { name: '', country: '' },
          productName: { productId: 1, productName: '' },
          incotermName: '',
          portFrom: { portId: 0, portName: '', country: '' },
          portTo: { portId: 0, portName: '', country: '' },
          comment: ''
        },
        step2: { selectedServices: [], selected: [] },
        step3: { containers: [], summary: { totalContainers: 0, totalTEU: 0, containerTypes: [] }, route: { origin: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } }, destination: { city: { name: '', country: '' }, port: { portId: 0, portName: '', country: '' } } }, selectedContainers: { list: [] } },
        step4: { selection: { offerId: '', haulierId: 0, haulierName: '', tariff: { unitPrice: 0, currency: 'EUR', freeTime: 0 }, route: { pickup: { company: '', city: '', country: '' }, delivery: { portId: 0, portName: '', country: '' } }, validity: { validUntil: '' } }, calculation: { quantity: 0, unitPrice: 0, subtotal: 0, currency: 'EUR' } },
        step5: { selections: [], summary: { totalSelections: 0, totalContainers: 0, totalAmount: 0, currency: 'EUR', selectedCarriers: [], containerTypes: [], preferredSelectionId: '' } },
        step6: { selections: [], summary: { totalSelections: 0, totalAmount: 0, currency: 'EUR', categories: [] } },
        step7: { finalization: { optionName: '', optionDescription: '', marginPercentage: 0, marginAmount: 0, marginType: 'percentage', isReadyToGenerate: false, generatedAt: '' }, validation: { allStepsValid: false, errors: [], warnings: [] }, pricingSummary: { baseTotal: 0, marginAmount: 0, finalTotal: 0, currency: 'EUR', breakdown: { haulageAmount: 0, seafreightAmount: 0, miscellaneousAmount: 0, totalBeforeMargin: 0, components: [] } } }
      },
      totals: { haulage: 0, seafreight: 0, miscellaneous: 0, subtotal: 0, grandTotal: 0, currency: 'EUR', totalTEU: 0 }
    }
  };
}
