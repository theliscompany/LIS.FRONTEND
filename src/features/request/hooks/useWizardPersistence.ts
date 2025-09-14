// === HOOK POUR LA PERSISTANCE DU WIZARD ===
import { useCallback } from 'react';
import { useDraftPersistence } from '../services/DraftPersistenceService';
import { showSnackbar } from '@components/common/Snackbar';
import type { DraftQuote } from './useWizardState';

export const useWizardPersistence = (
  debugLog: (msg: string, data?: any) => void,
  account: any,
  draftId: string | null,
  requestId: string | null
) => {
  const draftPersistence = useDraftPersistence(debugLog);

  // === SAUVEGARDE AUTOMATIQUE OPTIMISÉE ===
  const autoSave = useCallback(async (
    draftQuote: DraftQuote,
    validationErrors: string[],
    activeStep: number,
    isSaving: boolean,
    setIsSaving: (saving: boolean) => void,
    setLastSaved: (date: Date) => void
  ) => {
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
      debugLog('AUTO_SAVE - Début sauvegarde', { activeStep, draftId });
      
      // === SAUVEGARDE VIA SERVICE CENTRALISÉ ===
      const result = await draftPersistence.saveDraft(
        draftQuote,
        draftId,
        requestId,
        account.username,
        {
          validateData: false, // Déjà validé avec useMemo
          fallbackToLocalStorage: true
        }
      );

      if (result.success) {
        if (result.draftId && !draftId) {
          // Nouveau draft créé, mettre à jour l'URL
          window.history.replaceState(null, '', `?draftId=${result.draftId}`);
        }
        
        setLastSaved(new Date());
        debugLog('AUTO_SAVE - Sauvegarde réussie', { 
          draftId: result.draftId, 
          usedFallback: result.usedFallback 
        });
        
        if (result.usedFallback) {
          showSnackbar('Sauvegardé localement (serveur indisponible)', 'warning');
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
  }, [draftPersistence, account?.username, draftId, requestId, debugLog]);

  // === SAUVEGARDE MANUELLE OPTIMISÉE ===
  const handleManualSave = useCallback(async (
    draftQuote: DraftQuote,
    activeStep: number,
    autoSaveCallback: () => Promise<void>
  ) => {
    // ⚠️ LIMITATION: La sauvegarde manuelle n'est disponible que jusqu'à l'étape 6
    if (activeStep >= 6) {
      debugLog('MANUAL_SAVE - Sauvegarde désactivée après étape 6');
      showSnackbar('La sauvegarde n\'est plus disponible à cette étape. Utilisez la validation finale.', 'warning');
      return;
    }

    try {
      debugLog('MANUAL_SAVE - Début sauvegarde manuelle', { activeStep });
      
      // Utiliser la sauvegarde automatique
      await autoSaveCallback();
      
      debugLog('MANUAL_SAVE - Sauvegarde manuelle terminée');
      showSnackbar('Devis sauvegardé avec succès', 'success');
    } catch (error) {
      debugLog('MANUAL_SAVE - Erreur sauvegarde manuelle', { error });
      showSnackbar('Erreur lors de la sauvegarde', 'warning');
    }
  }, [debugLog]);

  // === CHARGEMENT D'UN BROUILLON ===
  const loadDraft = useCallback(async (draftId: string) => {
    try {
      debugLog('LOAD_DRAFT - Chargement', { draftId });
      
      const draftData = await draftPersistence.loadDraft(draftId);
      
      if (draftData) {
        debugLog('LOAD_DRAFT - Données chargées', { hasData: !!draftData });
        return draftData;
      }
      
      return null;
    } catch (error) {
      debugLog('LOAD_DRAFT - Erreur chargement', { draftId, error });
      showSnackbar('Erreur lors du chargement du brouillon', 'warning');
      return null;
    }
  }, [draftPersistence, debugLog]);

  // === VÉRIFICATION DE DOUBLONS ===
  const checkForExistingDraft = useCallback(async (requestId: string, userEmail: string) => {
    try {
      debugLog('CHECK_DUPLICATE - Vérification', { requestId, userEmail });
      
      const existingDraft = await draftPersistence.checkForExistingDraft(requestId, userEmail);
      
      if (existingDraft) {
        debugLog('CHECK_DUPLICATE - Draft trouvé', { draftId: existingDraft.id });
        return existingDraft;
      }
      
      return null;
    } catch (error) {
      debugLog('CHECK_DUPLICATE - Erreur vérification', { error });
      return null;
    }
  }, [draftPersistence, debugLog]);

  return {
    autoSave,
    handleManualSave,
    loadDraft,
    checkForExistingDraft,
    draftPersistence
  };
};
