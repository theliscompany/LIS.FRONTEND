import { useState, useEffect, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { 
  getApiRequestQuoteNotes,
  postApiRequestQuoteNotes,
  putApiRequestQuoteNotesById,
  deleteApiRequestQuoteNotesById
} from '../api';
import type { DraftQuote } from '../types/DraftQuote';

export interface QuoteOption {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'archived';
  totalPrice: number;
  currency: string;
  createdAt: Date;
  isSelected?: boolean;
  haulage?: any;
  seafreight?: any;
  miscellaneous?: any[];
  containers?: any[];
}

export interface UseWizardOptionsManagerReturn {
  options: QuoteOption[];
  currentOptionIndex: number | null;
  isLoadingOptions: boolean;
  optionsError: string | null;
  createNewOption: () => Promise<string | null>;
  loadOption: (index: number) => Promise<boolean>;
  saveOption: (optionData: Partial<QuoteOption>) => Promise<boolean>;
  deleteOption: (index: number) => Promise<boolean>;
  duplicateOption: (index: number) => Promise<string | null>;
  selectOption: (index: number) => void;
  compareOptions: (indices: number[]) => void;
}

export const useWizardOptionsManager = (
  draftQuote: DraftQuote,
  draftId?: string | null,
  onOptionChange?: (option: QuoteOption) => void
): UseWizardOptionsManagerReturn => {
  const { enqueueSnackbar } = useSnackbar();
  
  const [options, setOptions] = useState<QuoteOption[]>([]);
  const [currentOptionIndex, setCurrentOptionIndex] = useState<number | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  // === CHARGEMENT DES OPTIONS EXISTANTES ===
  const loadExistingOptions = useCallback(async () => {
    if (!draftId) return;

    setIsLoadingOptions(true);
    setOptionsError(null);

    try {
      const result = await getApiRequestQuoteNotes({
        query: {
          requestQuoteId: draftId,
          noteType: 'General'
        }
      });

      if (result.data) {
        const loadedOptions = Array.isArray(result.data) 
          ? result.data.map((note: any, index: number) => ({
              id: note.id || `option-${index}`,
              name: `Option ${index + 1}`,
              description: note.content || '',
              status: 'active' as const,
              totalPrice: 0,
              currency: 'EUR',
              createdAt: new Date(note.createdAt || Date.now()),
              isSelected: false
            }))
          : [];

        setOptions(loadedOptions);
        
        if (loadedOptions.length > 0) {
          setCurrentOptionIndex(0);
        }
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des options:', error);
      setOptionsError(error.message || 'Erreur de chargement des options');
      enqueueSnackbar('Erreur lors du chargement des options', { variant: 'error' });
    } finally {
      setIsLoadingOptions(false);
    }
  }, [draftId, enqueueSnackbar]);

  // === CRÉATION D'UNE NOUVELLE OPTION ===
  const createNewOption = useCallback(async (): Promise<string | null> => {
    if (!draftId) {
      enqueueSnackbar('Impossible de créer une option sans brouillon', { variant: 'warning' });
      return null;
    }

    try {
      const newOption: QuoteOption = {
        id: `option-${Date.now()}`,
        name: `Option ${options.length + 1}`,
        description: 'Nouvelle option créée',
        status: 'draft',
        totalPrice: 0,
        currency: 'EUR',
        createdAt: new Date(),
        isSelected: false,
        haulage: draftQuote.selectedHaulage,
        seafreight: draftQuote.selectedSeafreights,
        miscellaneous: draftQuote.selectedMiscellaneous,
        containers: Object.values(draftQuote.selectedContainers || {})
      };

      // Sauvegarder l'option via l'API
      const result = await postApiRequestQuoteNotes({
        body: {
          requestQuoteId: draftId,
          content: JSON.stringify(newOption),
          type: 'General',
          isInternal: true
        }
      });

      if (result.data) {
        const savedOption = { ...newOption, id: result.data.id || newOption.id };
        
        setOptions(prev => [...prev, savedOption]);
        setCurrentOptionIndex(options.length);
        
        enqueueSnackbar('Nouvelle option créée avec succès', { variant: 'success' });
        
        if (onOptionChange) {
          onOptionChange(savedOption);
        }
        
        return savedOption.id;
      }

      throw new Error('Erreur lors de la création de l\'option');
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'option:', error);
      enqueueSnackbar('Erreur lors de la création de l\'option', { variant: 'error' });
      return null;
    }
  }, [draftId, options.length, draftQuote, onOptionChange, enqueueSnackbar]);

  // === CHARGEMENT D'UNE OPTION ===
  const loadOption = useCallback(async (index: number): Promise<boolean> => {
    if (index < 0 || index >= options.length) {
      enqueueSnackbar('Index d\'option invalide', { variant: 'error' });
      return false;
    }

    try {
      const option = options[index];
      setCurrentOptionIndex(index);
      
      // Appliquer l'option au brouillon actuel
      if (option.haulage) {
        // Mettre à jour le brouillon avec les données de l'option
        // Cette logique doit être implémentée selon vos besoins
      }
      
      enqueueSnackbar(`Option "${option.name}" chargée`, { variant: 'success' });
      return true;
    } catch (error: any) {
      console.error('Erreur lors du chargement de l\'option:', error);
      enqueueSnackbar('Erreur lors du chargement de l\'option', { variant: 'error' });
      return false;
    }
  }, [options, enqueueSnackbar]);

  // === SAUVEGARDE D'UNE OPTION ===
  const saveOption = useCallback(async (optionData: Partial<QuoteOption>): Promise<boolean> => {
    if (currentOptionIndex === null || !draftId) {
      enqueueSnackbar('Aucune option sélectionnée pour la sauvegarde', { variant: 'warning' });
      return false;
    }

    try {
      const currentOption = options[currentOptionIndex];
      const updatedOption = { ...currentOption, ...optionData };
      
      // Mettre à jour l'option via l'API
      const result = await putApiRequestQuoteNotesById({
        path: { id: currentOption.id },
        body: {
          content: JSON.stringify(updatedOption),
          type: 'General',
          isInternal: true
        }
      });

      if (result.data) {
        setOptions(prev => prev.map((opt, idx) => 
          idx === currentOptionIndex ? updatedOption : opt
        ));
        
        enqueueSnackbar('Option sauvegardée avec succès', { variant: 'success' });
        
        if (onOptionChange) {
          onOptionChange(updatedOption);
        }
        
        return true;
      }

      throw new Error('Erreur lors de la sauvegarde de l\'option');
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde de l\'option:', error);
      enqueueSnackbar('Erreur lors de la sauvegarde de l\'option', { variant: 'error' });
      return false;
    }
  }, [currentOptionIndex, options, draftId, onOptionChange, enqueueSnackbar]);

  // === SUPPRESSION D'UNE OPTION ===
  const deleteOption = useCallback(async (index: number): Promise<boolean> => {
    if (index < 0 || index >= options.length) {
      enqueueSnackbar('Index d\'option invalide', { variant: 'error' });
      return false;
    }

    try {
      const optionToDelete = options[index];
      
      // Supprimer l'option via l'API
      await deleteApiRequestQuoteNotesById({
        path: { id: optionToDelete.id }
      });

      // Mettre à jour l'état local
      setOptions(prev => prev.filter((_, idx) => idx !== index));
      
      // Ajuster l'index courant si nécessaire
      if (currentOptionIndex === index) {
        setCurrentOptionIndex(null);
      } else if (currentOptionIndex !== null && currentOptionIndex > index) {
        setCurrentOptionIndex(currentOptionIndex - 1);
      }
      
      enqueueSnackbar('Option supprimée avec succès', { variant: 'success' });
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'option:', error);
      enqueueSnackbar('Erreur lors de la suppression de l\'option', { variant: 'error' });
      return false;
    }
  }, [options, currentOptionIndex, enqueueSnackbar]);

  // === DUPLICATION D'UNE OPTION ===
  const duplicateOption = useCallback(async (index: number): Promise<string | null> => {
    if (index < 0 || index >= options.length) {
      enqueueSnackbar('Index d\'option invalide', { variant: 'error' });
      return null;
    }

    try {
      const originalOption = options[index];
      const duplicatedOption: QuoteOption = {
        ...originalOption,
        id: `option-${Date.now()}`,
        name: `${originalOption.name} (Copie)`,
        description: `${originalOption.description} - Copie`,
        createdAt: new Date(),
        isSelected: false
      };

      // Sauvegarder la nouvelle option via l'API
      const result = await postApiRequestQuoteNotes({
        body: {
          requestQuoteId: draftId || '',
          content: JSON.stringify(duplicatedOption),
          type: 'General',
          isInternal: true
        }
      });

      if (result.data) {
        const savedOption = { ...duplicatedOption, id: result.data.id || duplicatedOption.id };
        
        setOptions(prev => [...prev, savedOption]);
        setCurrentOptionIndex(options.length);
        
        enqueueSnackbar('Option dupliquée avec succès', { variant: 'success' });
        
        if (onOptionChange) {
          onOptionChange(savedOption);
        }
        
        return savedOption.id;
      }

      throw new Error('Erreur lors de la duplication de l\'option');
    } catch (error: any) {
      console.error('Erreur lors de la duplication de l\'option:', error);
      enqueueSnackbar('Erreur lors de la duplication de l\'option', { variant: 'error' });
      return null;
    }
  }, [options, draftId, onOptionChange, enqueueSnackbar]);

  // === SÉLECTION D'UNE OPTION ===
  const selectOption = useCallback((index: number) => {
    if (index >= 0 && index < options.length) {
      setCurrentOptionIndex(index);
      const selectedOption = options[index];
      
      if (onOptionChange) {
        onOptionChange(selectedOption);
      }
      
      enqueueSnackbar(`Option "${selectedOption.name}" sélectionnée`, { variant: 'info' });
    }
  }, [options, onOptionChange, enqueueSnackbar]);

  // === COMPARAISON D'OPTIONS ===
  const compareOptions = useCallback((indices: number[]) => {
    if (indices.length < 2) {
      enqueueSnackbar('Sélectionnez au moins 2 options pour la comparaison', { variant: 'warning' });
      return;
    }

    const selectedOptions = indices.map(idx => options[idx]).filter(Boolean);
    
    if (selectedOptions.length >= 2) {
      // Logique de comparaison - peut être implémentée selon vos besoins
      console.log('Options à comparer:', selectedOptions);
      enqueueSnackbar(`Comparaison de ${selectedOptions.length} options`, { variant: 'info' });
    }
  }, [options, enqueueSnackbar]);

  // === CHARGEMENT INITIAL ===
  useEffect(() => {
    if (draftId) {
      loadExistingOptions();
    }
  }, [draftId, loadExistingOptions]);

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
    compareOptions
  };
};
