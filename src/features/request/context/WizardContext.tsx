import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { CreateQuoteOfferViewModel } from '@features/offer/api/types.gen';
import type { HaulageResponse, SeaFreightResponse, MiscellaneousResponse } from '@features/pricingnew/api/types.gen';

// Types pour l'état du wizard
interface WizardState {
  currentStep: number;
  totalSteps: number;
  isComplete: boolean;
  payload: CreateQuoteOfferViewModel;
  validationErrors: Record<string, string[]>;
  isDirty: boolean;
  lastSavedAt?: Date;
  saveError?: string;
}

// Actions pour le reducer
type WizardAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'UPDATE_PAYLOAD'; payload: Partial<CreateQuoteOfferViewModel> }
  | { type: 'UPDATE_HAULAGE'; payload: HaulageResponse }
  | { type: 'UPDATE_SEAFREIGHT'; payload: SeaFreightResponse }
  | { type: 'UPDATE_MISCELLANEOUS'; payload: MiscellaneousResponse[] }
  | { type: 'SET_VALIDATION_ERRORS'; payload: Record<string, string[]> }
  | { type: 'CLEAR_VALIDATION_ERRORS' }
  | { type: 'MARK_DIRTY' }
  | { type: 'MARK_SAVED' }
  | { type: 'RESET_WIZARD' }
  | { type: 'SET_COMPLETE' }
  | { type: 'SET_SAVE_ERROR'; payload: string }
  | { type: 'CLEAR_SAVE_ERROR' };

// État initial
const initialState: WizardState = {
  currentStep: 1,
  totalSteps: 7,
  isComplete: false,
  isDirty: false,
  payload: {
    requestQuoteId: undefined,
    comment: '',
    emailUser: '',
    selectedOption: 0,
    options: [
      {
        selectedHaulage: undefined,
        selectedSeafreight: undefined,
        myMiscs: [],
        portDeparture: undefined,
        portDestination: undefined,
        selectedSeafreights: []
      }
    ],
    files: [],
    clientNumber: null,
    quoteOfferNumber: null
  },
  validationErrors: {},
  saveError: undefined
};

// Reducer pour gérer les actions
function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        currentStep: Math.max(1, Math.min(action.payload, state.totalSteps))
      };

    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, state.totalSteps),
        isDirty: true
      };

    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1)
      };

    case 'UPDATE_PAYLOAD':
      return {
        ...state,
        payload: {
          ...state.payload,
          ...action.payload
        },
        isDirty: true
      };

    case 'UPDATE_HAULAGE':
      return {
        ...state,
        payload: {
          ...state.payload,
          options: state.payload.options?.map((option, index) => 
            index === state.payload.selectedOption 
              ? { ...option, selectedHaulage: action.payload }
              : option
          ) || []
        },
        isDirty: true
      };

    case 'UPDATE_SEAFREIGHT':
      return {
        ...state,
        payload: {
          ...state.payload,
          options: state.payload.options?.map((option, index) => 
            index === state.payload.selectedOption 
              ? { ...option, selectedSeafreight: action.payload }
              : option
          ) || []
        },
        isDirty: true
      };

    case 'UPDATE_MISCELLANEOUS':
      return {
        ...state,
        payload: {
          ...state.payload,
          options: state.payload.options?.map((option, index) => 
            index === state.payload.selectedOption 
              ? { ...option, myMiscs: action.payload }
              : option
          ) || []
        },
        isDirty: true
      };

    case 'SET_VALIDATION_ERRORS':
      return {
        ...state,
        validationErrors: action.payload
      };

    case 'CLEAR_VALIDATION_ERRORS':
      return {
        ...state,
        validationErrors: {}
      };

    case 'MARK_DIRTY':
      return {
        ...state,
        isDirty: true
      };

    case 'MARK_SAVED':
      return {
        ...state,
        isDirty: false,
        lastSavedAt: new Date()
      };

    case 'RESET_WIZARD':
      return {
        ...initialState,
        payload: {
          ...initialState.payload,
          requestQuoteId: state.payload.requestQuoteId // Garder l'ID de la demande
        }
      };

    case 'SET_COMPLETE':
      return {
        ...state,
        isComplete: true
      };

    case 'SET_SAVE_ERROR':
      return {
        ...state,
        saveError: action.payload
      };

    case 'CLEAR_SAVE_ERROR':
      return {
        ...state,
        saveError: undefined
      };

    default:
      return state;
  }
}

// Context
interface WizardContextType {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
  // Actions utilitaires
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updatePayload: (payload: Partial<CreateQuoteOfferViewModel>) => void;
  updateHaulage: (haulage: HaulageResponse) => void;
  updateSeafreight: (seafreight: SeaFreightResponse) => void;
  updateMiscellaneous: (miscs: MiscellaneousResponse[]) => void;
  setValidationErrors: (errors: Record<string, string[]>) => void;
  clearValidationErrors: () => void;
  resetWizard: () => void;
  markComplete: () => void;
  setSaveError: (error: string) => void;
  clearSaveError: () => void;
  // Getters utilitaires
  getCurrentOption: () => any;
  getCurrentStepData: () => any;
  isStepValid: (step: number) => boolean;
  canProceedToNextStep: () => boolean;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

// Provider
interface WizardProviderProps {
  children: ReactNode;
  initialRequestId?: string;
}

export const WizardProvider: React.FC<WizardProviderProps> = ({ 
  children, 
  initialRequestId 
}) => {
  const [state, dispatch] = useReducer(wizardReducer, {
    ...initialState,
    payload: {
      ...initialState.payload,
      requestQuoteId: initialRequestId ? parseInt(initialRequestId) : undefined
    }
  });

  // Actions utilitaires
  const goToStep = (step: number) => {
    dispatch({ type: 'SET_STEP', payload: step });
  };

  const nextStep = () => {
    dispatch({ type: 'NEXT_STEP' });
  };

  const prevStep = () => {
    dispatch({ type: 'PREV_STEP' });
  };

  const updatePayload = (payload: Partial<CreateQuoteOfferViewModel>) => {
    dispatch({ type: 'UPDATE_PAYLOAD', payload });
  };

  const updateHaulage = (haulage: HaulageResponse) => {
    dispatch({ type: 'UPDATE_HAULAGE', payload: haulage });
  };

  const updateSeafreight = (seafreight: SeaFreightResponse) => {
    dispatch({ type: 'UPDATE_SEAFREIGHT', payload: seafreight });
  };

  const updateMiscellaneous = (miscs: MiscellaneousResponse[]) => {
    dispatch({ type: 'UPDATE_MISCELLANEOUS', payload: miscs });
  };

  const setValidationErrors = (errors: Record<string, string[]>) => {
    dispatch({ type: 'SET_VALIDATION_ERRORS', payload: errors });
  };

  const clearValidationErrors = () => {
    dispatch({ type: 'CLEAR_VALIDATION_ERRORS' });
  };

  const resetWizard = () => {
    dispatch({ type: 'RESET_WIZARD' });
  };

  const markComplete = () => {
    dispatch({ type: 'SET_COMPLETE' });
  };

  const setSaveError = (error: string) => {
    dispatch({ type: 'SET_SAVE_ERROR', payload: error });
  };

  const clearSaveError = () => {
    dispatch({ type: 'CLEAR_SAVE_ERROR' });
  };

  // Getters utilitaires
  const getCurrentOption = () => {
    return state.payload.options?.[state.payload.selectedOption];
  };

  const getCurrentStepData = () => {
    const currentOption = getCurrentOption();
    switch (state.currentStep) {
      case 1: // Informations client
        return {
          customer: currentOption?.requestData?.customer,
          pickupLocation: currentOption?.requestData?.pickupLocation,
          deliveryLocation: currentOption?.requestData?.deliveryLocation
        };
      case 2: // Produits
        return {
          products: currentOption?.requestData?.products,
          containers: currentOption?.requestData?.containers
        };
      case 3: // Services
        return {
          services: currentOption?.requestData?.services
        };
      case 4: // Haulage
        return {
          selectedHaulage: currentOption?.selectedHaulage
        };
      case 5: // Seafreight
        return {
          selectedSeafreight: currentOption?.selectedSeafreight
        };
      case 6: // Miscellaneous
        return {
          selectedMiscellaneous: currentOption?.myMiscs
        };
      case 7: // Validation finale
        return {
          completePayload: state.payload
        };
      default:
        return {};
    }
  };

  const isStepValid = (step: number) => {
    const currentOption = getCurrentOption();
    switch (step) {
      case 1:
        return !!(currentOption?.requestData?.customer && 
                 currentOption?.requestData?.pickupLocation && 
                 currentOption?.requestData?.deliveryLocation);
      case 2:
        return !!(currentOption?.requestData?.products?.length > 0 && 
                 currentOption?.requestData?.containers?.length > 0);
      case 3:
        return true; // Services optionnels
      case 4:
        return !!currentOption?.selectedHaulage;
      case 5:
        return !!currentOption?.selectedSeafreight;
      case 6:
        return true; // Miscellaneous optionnels
      case 7:
        return state.isComplete;
      default:
        return false;
    }
  };

  const canProceedToNextStep = () => {
    return isStepValid(state.currentStep) && 
           state.validationErrors[`step_${state.currentStep}`]?.length === 0;
  };

  const contextValue: WizardContextType = {
    state,
    dispatch,
    goToStep,
    nextStep,
    prevStep,
    updatePayload,
    updateHaulage,
    updateSeafreight,
    updateMiscellaneous,
    setValidationErrors,
    clearValidationErrors,
    resetWizard,
    markComplete,
    setSaveError,
    clearSaveError,
    getCurrentOption,
    getCurrentStepData,
    isStepValid,
    canProceedToNextStep
  };

  return (
    <WizardContext.Provider value={contextValue}>
      {children}
    </WizardContext.Provider>
  );
};

// Hook personnalisé
export const useWizard = () => {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
};

// Hook pour la persistance
export const useWizardPersistence = () => {
  const { state, dispatch } = useWizard();

  // Sauvegarder l'état
  const saveState = () => {
    try {
      localStorage.setItem('wizard_state', JSON.stringify(state));
      dispatch({ type: 'MARK_SAVED' });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  // Restaurer l'état
  const restoreState = () => {
    try {
      const savedState = localStorage.getItem('wizard_state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // Restaurer l'état en dispatchant les actions appropriées
        Object.entries(parsedState.payload).forEach(([key, value]) => {
          if (value !== undefined) {
            dispatch({ type: 'UPDATE_PAYLOAD', payload: { [key]: value } });
          }
        });
        dispatch({ type: 'SET_STEP', payload: parsedState.currentStep });
      }
    } catch (error) {
      console.error('Erreur lors de la restauration:', error);
    }
  };

  // Nettoyer l'état sauvegardé
  const clearSavedState = () => {
    try {
      localStorage.removeItem('wizard_state');
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
    }
  };

  return {
    saveState,
    restoreState,
    clearSavedState
  };
}; 