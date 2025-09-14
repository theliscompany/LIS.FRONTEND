// === HOOK POUR LA GESTION DES ÉTAPES DU WIZARD ===
import { useCallback } from 'react';
import type { DraftQuote } from './useWizardState';

export const useWizardSteps = (
  debugLog: (msg: string, data?: any) => void
) => {

  // === SAUVEGARDE OPTIMISÉE PAR ÉTAPE ===
  const saveCurrentStepToDraftQuote = useCallback(async (stepIndex: number) => {
    try {
      debugLog('STEP_SAVE - Sauvegarde automatique de l\'étape', { step: stepIndex + 1 });
      
      // Dans la nouvelle architecture, les données sont déjà dans draftQuote
      // Pas besoin de sauvegarder explicitement chaque étape
      switch (stepIndex) {
        case 0: // Étape 1 - Informations client
          debugLog('STEP_SAVE - Step 1 déjà dans draftQuote');
          break;
          
        case 1: // Étape 2 - Services sélectionnés
          debugLog('STEP_SAVE - Step 2 déjà dans draftQuote');
          break;
          
        case 2: // Étape 3 - Conteneurs  
          debugLog('STEP_SAVE - Step 3 déjà dans draftQuote');
          break;
          
        case 3: // Étape 4 - Haulage
          debugLog('STEP_SAVE - Step 4 déjà dans draftQuote');
          break;
          
        case 4: // Étape 5 - Seafreight
          debugLog('STEP_SAVE - Step 5 déjà dans draftQuote');
          break;
          
        case 5: // Étape 6 - Miscellaneous
          debugLog('STEP_SAVE - Step 6 déjà dans draftQuote');
          break;
      }
      
      debugLog('STEP_SAVE - Étape sauvegardée', { step: stepIndex + 1 });
      
    } catch (error) {
      debugLog('STEP_SAVE - Erreur sauvegarde', { step: stepIndex + 1, error });
    }
  }, [debugLog]);

  // === HELPER POUR ADAPTATION DES DONNÉES DEPUIS API ===
  const adaptDataFromApi = useCallback((data: any, createInitialDraftQuote: () => DraftQuote): DraftQuote => {
    debugLog('ADAPT_DATA - Adaptation depuis API', { hasData: !!data });

    if (!data) return createInitialDraftQuote();

    try {
      // Adapter les données selon la structure reçue de l'API
      const adaptedDraftQuote: DraftQuote = {
        ...createInitialDraftQuote(),
        
        // Step 1
        step1: {
          ...createInitialDraftQuote().step1,
          customer: data.steps?.step1?.customer || data.step1?.customer,
          cityFrom: data.steps?.step1?.route?.origin?.city || data.step1?.cityFrom,
          cityTo: data.steps?.step1?.route?.destination?.city || data.step1?.cityTo,
          portFrom: data.steps?.step1?.route?.origin?.port || data.step1?.portFrom,
          portTo: data.steps?.step1?.route?.destination?.port || data.step1?.portTo,
          productName: data.steps?.step1?.cargo?.product || data.step1?.productName,
          incotermName: data.steps?.step1?.cargo?.incoterm || data.step1?.incotermName,
          assignee: data.steps?.step1?.metadata?.assignee || data.step1?.assignee,
          comment: data.steps?.step1?.metadata?.comment || data.step1?.comment,
          status: data.steps?.step1?.metadata?.status || data.step1?.status || 'NEW',
        },
        
        // Step 2
        step2: {
          selected: data.steps?.step2?.selected || data.step2?.selected || []
        },
        
        // Step 3
        step3: {
          selectedContainers: data.steps?.step3?.selectedContainers || data.step3?.selectedContainers || {}
        },
        
        // Options et pricing
        savedOptions: data.options || data.savedOptions || [],
        selectedHaulage: data.pricing?.selectedHaulage || data.selectedHaulage,
        selectedSeafreights: data.pricing?.selectedSeafreights || data.selectedSeafreights || [],
        selectedMiscellaneous: data.pricing?.selectedMiscellaneous || data.selectedMiscellaneous || [],
        marginType: data.pricing?.marginType || data.marginType || 'percent',
        marginValue: data.pricing?.marginValue || data.marginValue || 0,
        
        // Totaux
        totalPrice: data.totals?.grandTotal || data.totalPrice || 0,
        seafreightTotal: data.totals?.seafreight || data.seafreightTotal,
        haulageTotal: data.totals?.haulage || data.haulageTotal,
        miscTotal: data.totals?.miscellaneous || data.miscTotal,
        totalTEU: data.totals?.totalTEU || data.totalTEU,
      };

      debugLog('ADAPT_DATA - Données adaptées', { adaptedDraftQuote });
      return adaptedDraftQuote;
      
    } catch (error) {
      debugLog('ADAPT_DATA - Erreur adaptation', { error });
      return createInitialDraftQuote();
    }
  }, [debugLog]);

  // === HELPER POUR RÉINITIALISATION PARTIELLE ===
  const resetFromStep = useCallback((stepIndex: number, draftQuote: DraftQuote, createInitialDraftQuote: () => DraftQuote): DraftQuote => {
    debugLog('RESET_FROM_STEP - Réinitialisation depuis étape', { step: stepIndex });

    const initial = createInitialDraftQuote();
    
    switch (stepIndex) {
      case 0: // Réinitialiser tout
        return initial;
        
      case 1: // Préserver step1, réinitialiser le reste
        return {
          ...initial,
          step1: draftQuote.step1
        };
        
      case 2: // Préserver step1-2, réinitialiser le reste
        return {
          ...initial,
          step1: draftQuote.step1,
          step2: draftQuote.step2
        };
        
      case 3: // Préserver step1-3, réinitialiser le reste
        return {
          ...initial,
          step1: draftQuote.step1,
          step2: draftQuote.step2,
          step3: draftQuote.step3
        };
        
      default:
        return draftQuote;
    }
  }, [debugLog]);

  return {
    saveCurrentStepToDraftQuote,
    adaptDataFromApi,
    resetFromStep
  };
};
