import { useState, useCallback, useRef, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { LocalStorageService } from '../services/LocalStorageService';
import { DraftQuote } from '../types/DraftQuote';
import { buildSDKPayload } from '../types/DraftQuote';
import { postApiQuoteOfferDraft, putApiQuoteOfferDraftById } from '../../offer/api/sdk.gen';

export interface UseDraftPersistenceReturn {
  // État
  isAutoSaving: boolean;
  isManualSaving: boolean;
  lastAutoSavedAt: Date | null;
  lastManualSavedAt: Date | null;
  autoSaveError: string | null;
  manualSaveError: string | null;
  
  // Actions
  autoSave: (draftQuote: DraftQuote, draftId?: string | null) => Promise<boolean>;
  manualSave: (draftQuote: DraftQuote, draftId?: string | null) => Promise<boolean>;
  loadFromLocal: (draftId: string) => DraftQuote | null;
  loadLastFallback: () => DraftQuote | null;
  deleteLocal: (draftId: string) => void;
  listLocalDrafts: () => Array<{key: string, draftId: string | null, timestamp: string, title: string}>;
}

export const useDraftPersistence = (
  currentUserEmail: string,
  clientNumber: string = ''
): UseDraftPersistenceReturn => {
  const { enqueueSnackbar } = useSnackbar();
  
  // État local
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isManualSaving, setIsManualSaving] = useState(false);
  const [lastAutoSavedAt, setLastAutoSavedAt] = useState<Date | null>(null);
  const [lastManualSavedAt, setLastManualSavedAt] = useState<Date | null>(null);
  const [autoSaveError, setAutoSaveError] = useState<string | null>(null);
  const [manualSaveError, setManualSaveError] = useState<string | null>(null);
  
  // Références
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAutoSavedDataRef = useRef<string>('');
  const lastManualSavedDataRef = useRef<string>('');

  /**
   * Sauvegarde automatique (local uniquement)
   */
  const autoSave = useCallback(async (draftQuote: DraftQuote, draftId?: string | null): Promise<boolean> => {
    if (isAutoSaving) {
      console.log('⏰ [AUTO_SAVE] Déjà en cours de sauvegarde automatique');
      return false;
    }

    try {
      setIsAutoSaving(true);
      setAutoSaveError(null);
      
      console.log('⏰ [AUTO_SAVE] Sauvegarde automatique locale en cours...');
      
      // Sauvegarde locale uniquement
      LocalStorageService.saveDraft(draftQuote, draftId);
      
      // Mettre à jour les références
      const serializedData = JSON.stringify(draftQuote);
      lastAutoSavedDataRef.current = serializedData;
      setLastAutoSavedAt(new Date());
      
      console.log('✅ [AUTO_SAVE] Sauvegarde automatique locale terminée');
      return true;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('❌ [AUTO_SAVE] Erreur lors de la sauvegarde automatique:', error);
      setAutoSaveError(errorMessage);
      return false;
    } finally {
      setIsAutoSaving(false);
    }
  }, [isAutoSaving]);

  /**
   * Sauvegarde manuelle (local + BD)
   */
  const manualSave = useCallback(async (draftQuote: DraftQuote, draftId?: string | null): Promise<boolean> => {
    if (isManualSaving) {
      console.log('💾 [MANUAL_SAVE] Déjà en cours de sauvegarde manuelle');
      return false;
    }

    try {
      setIsManualSaving(true);
      setManualSaveError(null);
      
      console.log('💾 [MANUAL_SAVE] Sauvegarde manuelle en cours...');
      
      // 1. Sauvegarde locale d'abord
      LocalStorageService.saveDraft(draftQuote, draftId);
      console.log('💾 [MANUAL_SAVE] Sauvegarde locale terminée');
      
      // 2. Sauvegarde en BD
      const draftData = buildSDKPayload(draftQuote, currentUserEmail);
      
      let result;
      if (draftId) {
        // Mise à jour d'un brouillon existant
        console.log('💾 [MANUAL_SAVE] Mise à jour du brouillon existant:', draftId);
        result = await putApiQuoteOfferDraftById({
          path: { id: draftId },
          body: draftData
        });
      } else {
        // Création d'un nouveau brouillon
        console.log('💾 [MANUAL_SAVE] Création d\'un nouveau brouillon');
        result = await postApiQuoteOfferDraft({
          body: draftData
        });
      }
      
      console.log('✅ [MANUAL_SAVE] Sauvegarde en BD terminée:', result);
      
      // Mettre à jour les références
      const serializedData = JSON.stringify(draftQuote);
      lastManualSavedDataRef.current = serializedData;
      setLastManualSavedAt(new Date());
      
      // Nettoyer les anciens brouillons locaux
      LocalStorageService.cleanupOldDrafts();
      
      enqueueSnackbar('Brouillon sauvegardé avec succès', { variant: 'success' });
      return true;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('❌ [MANUAL_SAVE] Erreur lors de la sauvegarde manuelle:', error);
      setManualSaveError(errorMessage);
      enqueueSnackbar('Erreur lors de la sauvegarde', { variant: 'error' });
      return false;
    } finally {
      setIsManualSaving(false);
    }
  }, [isManualSaving, currentUserEmail, enqueueSnackbar]);

  /**
   * Charge un brouillon depuis le localStorage
   */
  const loadFromLocal = useCallback((draftId: string): DraftQuote | null => {
    try {
      console.log('📥 [LOCAL_LOAD] Chargement depuis le localStorage:', draftId);
      const draft = LocalStorageService.loadDraft(draftId);
      
      if (draft) {
        console.log('✅ [LOCAL_LOAD] Brouillon chargé depuis le localStorage');
        return draft;
      } else {
        console.log('❌ [LOCAL_LOAD] Brouillon non trouvé dans le localStorage');
        return null;
      }
    } catch (error) {
      console.error('❌ [LOCAL_LOAD] Erreur lors du chargement local:', error);
      return null;
    }
  }, []);

  /**
   * Charge le dernier brouillon fallback
   */
  const loadLastFallback = useCallback((): DraftQuote | null => {
    try {
      console.log('📥 [FALLBACK_LOAD] Chargement du dernier brouillon fallback');
      const draft = LocalStorageService.loadLastFallbackDraft();
      
      if (draft) {
        console.log('✅ [FALLBACK_LOAD] Dernier brouillon fallback chargé');
        return draft;
      } else {
        console.log('❌ [FALLBACK_LOAD] Aucun brouillon fallback trouvé');
        return null;
      }
    } catch (error) {
      console.error('❌ [FALLBACK_LOAD] Erreur lors du chargement fallback:', error);
      return null;
    }
  }, []);

  /**
   * Supprime un brouillon du localStorage
   */
  const deleteLocal = useCallback((draftId: string): void => {
    try {
      console.log('🗑️ [LOCAL_DELETE] Suppression du brouillon local:', draftId);
      LocalStorageService.deleteDraft(draftId);
      console.log('✅ [LOCAL_DELETE] Brouillon supprimé du localStorage');
    } catch (error) {
      console.error('❌ [LOCAL_DELETE] Erreur lors de la suppression:', error);
    }
  }, []);

  /**
   * Liste tous les brouillons locaux
   */
  const listLocalDrafts = useCallback(() => {
    try {
      console.log('📋 [LOCAL_LIST] Récupération de la liste des brouillons locaux');
      const drafts = LocalStorageService.listLocalDrafts();
      console.log('✅ [LOCAL_LIST] Liste des brouillons locaux:', drafts.length);
      return drafts;
    } catch (error) {
      console.error('❌ [LOCAL_LIST] Erreur lors de la liste:', error);
      return [];
    }
  }, []);

  /**
   * Planification de la sauvegarde automatique
   */
  const scheduleAutoSave = useCallback((draftQuote: DraftQuote, draftId?: string | null) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      const currentSerialized = JSON.stringify(draftQuote);
      if (currentSerialized !== lastAutoSavedDataRef.current) {
        console.log('⏰ [AUTO_SAVE] Déclenchement de la sauvegarde automatique planifiée');
        autoSave(draftQuote, draftId);
      }
    }, 2000); // 2 secondes de délai
  }, [autoSave]);

  /**
   * Vérifie s'il y a des changements non sauvegardés automatiquement
   */
  const hasUnsavedAutoChanges = useCallback((draftQuote: DraftQuote): boolean => {
    const currentSerialized = JSON.stringify(draftQuote);
    return currentSerialized !== lastAutoSavedDataRef.current;
  }, []);

  /**
   * Vérifie s'il y a des changements non sauvegardés manuellement
   */
  const hasUnsavedManualChanges = useCallback((draftQuote: DraftQuote): boolean => {
    const currentSerialized = JSON.stringify(draftQuote);
    return currentSerialized !== lastManualSavedDataRef.current;
  }, []);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    // État
    isAutoSaving,
    isManualSaving,
    lastAutoSavedAt,
    lastManualSavedAt,
    autoSaveError,
    manualSaveError,
    
    // Actions
    autoSave,
    manualSave,
    loadFromLocal,
    loadLastFallback,
    deleteLocal,
    listLocalDrafts,
    
    // Fonctions utilitaires (non exposées dans l'interface mais disponibles)
    scheduleAutoSave,
    hasUnsavedAutoChanges,
    hasUnsavedManualChanges
  } as UseDraftPersistenceReturn & {
    scheduleAutoSave: (draftQuote: DraftQuote, draftId?: string | null) => void;
    hasUnsavedAutoChanges: (draftQuote: DraftQuote) => boolean;
    hasUnsavedManualChanges: (draftQuote: DraftQuote) => boolean;
  };
};
