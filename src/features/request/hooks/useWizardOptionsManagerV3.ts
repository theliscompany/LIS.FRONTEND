import { useState, useEffect, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { 
  useAddDraftQuoteOption,
  useDraftQuote,
  mapDraftQuoteFromApi,
  createEmptyOption
} from '../../offer/services/draftQuoteService';
import type { DraftQuote, DraftQuoteOption } from '../../offer/types/DraftQuote';

export interface UseWizardOptionsManagerReturn {
  options: DraftQuoteOption[];
  currentOptionIndex: number | null;
  isLoadingOptions: boolean;
  optionsError: string | null;
  createNewOption: () => Promise<DraftQuoteOption | null>;
  loadOption: (index: number) => Promise<boolean>;
  saveOption: (optionData: Partial<DraftQuoteOption>) => Promise<boolean>;
  deleteOption: (index: number) => Promise<boolean>;
  duplicateOption: (index: number) => Promise<DraftQuoteOption | null>;
  selectOption: (index: number) => void;
  compareOptions: (indices: number[]) => void;
  refreshOptions: () => Promise<void>;
}

export const useWizardOptionsManagerV3 = (
  draftQuote: DraftQuote,
  draftId?: string | null,
  onOptionChange?: (option: DraftQuoteOption) => void
): UseWizardOptionsManagerReturn => {
  const { enqueueSnackbar } = useSnackbar();
  
  // API Hooks
  const addOptionMutation = useAddDraftQuoteOption();
  const { data: existingDraft, refetch: refetchDraft } = useDraftQuote(draftId || '');

  // State
  const [options, setOptions] = useState<DraftQuoteOption[]>([]);
  const [currentOptionIndex, setCurrentOptionIndex] = useState<number | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  // Load existing options
  const loadExistingOptions = useCallback(async () => {
    if (!draftId) return;

    setIsLoadingOptions(true);
    setOptionsError(null);

    try {
      const result = await refetchDraft();
      if (result.data) {
        const draftWithOptions = mapDraftQuoteFromApi(result.data as any);
        if (draftWithOptions.options && draftWithOptions.options.length > 0) {
          setOptions(draftWithOptions.options);
          if (draftWithOptions.options.length > 0) {
            setCurrentOptionIndex(0);
          }
        } else {
          setOptions([]);
        }
      }
    } catch (error: any) {
      console.error('Error loading options:', error);
      setOptionsError(error.message || 'Error loading options');
      enqueueSnackbar('Error loading options', { variant: 'error' });
    } finally {
      setIsLoadingOptions(false);
    }
  }, [draftId, refetchDraft, enqueueSnackbar]);

  // Create new option
  const createNewOption = useCallback(async (): Promise<DraftQuoteOption | null> => {
    if (!draftId) {
      enqueueSnackbar('Cannot create option without draft', { variant: 'warning' });
      return null;
    }

    try {
      setIsLoadingOptions(true);
      const newOption = createEmptyOption();
      
      const result = await addOptionMutation.mutateAsync({
        path: { id: draftId },
        body: { option: newOption },
      });

      if (result?.data) {
        const updatedDraft = mapDraftQuoteFromApi(result.data);
        if (updatedDraft.options && updatedDraft.options.length > 0) {
          const createdOption = updatedDraft.options[updatedDraft.options.length - 1];
          setOptions(prev => [...prev, createdOption]);
          setCurrentOptionIndex(options.length);
          
          if (onOptionChange) {
            onOptionChange(createdOption);
          }
          
          enqueueSnackbar('New option created successfully', { variant: 'success' });
          return createdOption;
        }
      }
      return null;
    } catch (error: any) {
      console.error('Error creating option:', error);
      enqueueSnackbar('Error creating option', { variant: 'error' });
      return null;
    } finally {
      setIsLoadingOptions(false);
    }
  }, [draftId, addOptionMutation, options.length, onOptionChange, enqueueSnackbar]);

  // Load option
  const loadOption = useCallback(async (index: number): Promise<boolean> => {
    if (index < 0 || index >= options.length) {
      enqueueSnackbar('Invalid option index', { variant: 'error' });
      return false;
    }

    try {
      const option = options[index];
      setCurrentOptionIndex(index);
      
      if (onOptionChange) {
        onOptionChange(option);
      }
      
      enqueueSnackbar(`Option "${option.label || `Option ${index + 1}`}" loaded`, { variant: 'success' });
      return true;
    } catch (error: any) {
      console.error('Error loading option:', error);
      enqueueSnackbar('Error loading option', { variant: 'error' });
      return false;
    }
  }, [options, onOptionChange, enqueueSnackbar]);

  // Save option
  const saveOption = useCallback(async (optionData: Partial<DraftQuoteOption>): Promise<boolean> => {
    if (currentOptionIndex === null || !draftId) {
      enqueueSnackbar('No option selected for saving', { variant: 'warning' });
      return false;
    }

    try {
      const currentOption = options[currentOptionIndex];
      const updatedOption = { ...currentOption, ...optionData };
      
      // Update the option via API
      const result = await addOptionMutation.mutateAsync({
        path: { id: draftId },
        body: { option: updatedOption },
      });

      if (result?.data) {
        setOptions(prev => prev.map((opt, idx) => 
          idx === currentOptionIndex ? updatedOption : opt
        ));
        
        if (onOptionChange) {
          onOptionChange(updatedOption);
        }
        
        enqueueSnackbar('Option saved successfully', { variant: 'success' });
        return true;
      }

      throw new Error('Error saving option');
    } catch (error: any) {
      console.error('Error saving option:', error);
      enqueueSnackbar('Error saving option', { variant: 'error' });
      return false;
    }
  }, [currentOptionIndex, options, draftId, onOptionChange, addOptionMutation, enqueueSnackbar]);

  // Delete option
  const deleteOption = useCallback(async (index: number): Promise<boolean> => {
    if (index < 0 || index >= options.length) {
      enqueueSnackbar('Invalid option index', { variant: 'error' });
      return false;
    }

    try {
      // For now, just remove from local state
      // In a real implementation, you would call a delete API
      setOptions(prev => prev.filter((_, idx) => idx !== index));
      
      // Adjust current index if necessary
      if (currentOptionIndex === index) {
        setCurrentOptionIndex(null);
      } else if (currentOptionIndex !== null && currentOptionIndex > index) {
        setCurrentOptionIndex(currentOptionIndex - 1);
      }
      
      enqueueSnackbar('Option deleted successfully', { variant: 'success' });
      return true;
    } catch (error: any) {
      console.error('Error deleting option:', error);
      enqueueSnackbar('Error deleting option', { variant: 'error' });
      return false;
    }
  }, [options, currentOptionIndex, enqueueSnackbar]);

  // Duplicate option
  const duplicateOption = useCallback(async (index: number): Promise<DraftQuoteOption | null> => {
    if (index < 0 || index >= options.length) {
      enqueueSnackbar('Invalid option index', { variant: 'error' });
      return null;
    }

    try {
      const originalOption = options[index];
      const duplicatedOption: DraftQuoteOption = {
        ...originalOption,
        optionId: `option-${Date.now()}`,
        label: `${originalOption.label || 'Option'} (Copy)`,
        description: `${originalOption.description || ''} - Copy`,
        createdAt: new Date().toISOString(),
      };

      if (draftId) {
        const result = await addOptionMutation.mutateAsync({
          path: { id: draftId },
          body: { option: duplicatedOption },
        });

        if (result?.data) {
          const savedOption = { ...duplicatedOption, optionId: result.data.optionId || duplicatedOption.optionId };
          
          setOptions(prev => [...prev, savedOption]);
          setCurrentOptionIndex(options.length);
          
          if (onOptionChange) {
            onOptionChange(savedOption);
          }
          
          enqueueSnackbar('Option duplicated successfully', { variant: 'success' });
          return savedOption;
        }
      }

      throw new Error('Error duplicating option');
    } catch (error: any) {
      console.error('Error duplicating option:', error);
      enqueueSnackbar('Error duplicating option', { variant: 'error' });
      return null;
    }
  }, [options, draftId, addOptionMutation, onOptionChange, enqueueSnackbar]);

  // Select option
  const selectOption = useCallback((index: number) => {
    if (index >= 0 && index < options.length) {
      setCurrentOptionIndex(index);
      const selectedOption = options[index];
      
      if (onOptionChange) {
        onOptionChange(selectedOption);
      }
      
      enqueueSnackbar(`Option "${selectedOption.label || `Option ${index + 1}`}" selected`, { variant: 'info' });
    }
  }, [options, onOptionChange, enqueueSnackbar]);

  // Compare options
  const compareOptions = useCallback((indices: number[]) => {
    if (indices.length < 2) {
      enqueueSnackbar('Select at least 2 options for comparison', { variant: 'warning' });
      return;
    }

    const selectedOptions = indices.map(idx => options[idx]).filter(Boolean);
    
    if (selectedOptions.length >= 2) {
      console.log('Options to compare:', selectedOptions);
      enqueueSnackbar(`Comparing ${selectedOptions.length} options`, { variant: 'info' });
    }
  }, [options, enqueueSnackbar]);

  // Refresh options
  const refreshOptions = useCallback(async () => {
    await loadExistingOptions();
  }, [loadExistingOptions]);

  // Load options when draftId changes
  useEffect(() => {
    if (draftId) {
      loadExistingOptions();
    }
  }, [draftId, loadExistingOptions]);

  // Load options from draftQuote when available
  useEffect(() => {
    if (draftQuote?.options) {
      setOptions(draftQuote.options);
    }
  }, [draftQuote?.options]);

  return {
    options,
    currentOptionIndex,
    isLoadingOptions,
    optionsError,
    createNewOption,
    loadOption,
    saveOption,
    deleteOption,
    duplicateOption,
    selectOption,
    compareOptions,
    refreshOptions
  };
};
