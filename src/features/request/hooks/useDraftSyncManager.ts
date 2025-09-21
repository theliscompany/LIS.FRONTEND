import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { DraftQuote, syncDraftQuoteData, buildCreateDraftPayload, buildUpdateDraftPayload } from '../types';
import { 
  postApiDraftQuotes, 
  putApiDraftQuotesById,
  getApiDraftQuotesById 
} from '@features/offer/api';
import { isValidDraftId } from '../utils/draftIdValidation';

// === TYPES POUR LA GESTION DE SYNCHRONISATION ===
export interface SyncStatus {
  isSyncing: boolean;
  lastSyncAt: Date | null;
  lastSyncDirection: 'db-to-local' | 'local-to-db' | null;
  hasPendingChanges: boolean;
  pendingChanges: string[];
  syncErrors: string[];
  draftId: string | null;
  isNew: boolean;
}

export interface SyncOptions {
  autoSync?: boolean;
  syncInterval?: number;
  conflictResolution?: 'db-wins' | 'local-wins' | 'manual';
  validateBeforeSync?: boolean;
}

// === HOOK DE GESTION DE SYNCHRONISATION BIDIRECTIONNELLE ===
export const useDraftSyncManager = (
  initialDraftQuote: DraftQuote,
  options: SyncOptions = {}
) => {
  // === ÉTATS DE SYNCHRONISATION ===
  const [draftQuote, setDraftQuote] = useState<DraftQuote>(initialDraftQuote);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncAt: null,
    lastSyncDirection: null,
    hasPendingChanges: false,
    pendingChanges: [],
    syncErrors: [],
    draftId: null,
    isNew: true
  });

  // === RÉFÉRENCES POUR LA GESTION DE SYNCHRONISATION ===
  const pendingChangesRef = useRef<Set<string>>(new Set());
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDbVersionRef = useRef<string>('');
  const conflictResolutionRef = useRef<'db-wins' | 'local-wins' | 'manual'>(
    options.conflictResolution || 'db-wins'
  );

  // === OPTIONS DE SYNCHRONISATION ===
  const {
    autoSync = true,
    syncInterval = 30000, // 30 secondes
    validateBeforeSync = true
  } = options;

  // === FONCTIONS DE VALIDATION ===
  const validateDraftQuote = useCallback((draft: DraftQuote): string[] => {
    const errors: string[] = [];
    
    // Validation des étapes obligatoires
    if (!draft.step1?.customer) {
      errors.push('Client requis pour l\'étape 1');
    }
    if (!draft.step1?.cityFrom || !draft.step1?.cityTo) {
      errors.push('Villes de départ et d\'arrivée requises');
    }
    if (!draft.step2?.selected || draft.step2.selected.length === 0) {
      errors.push('Au moins un service requis pour l\'étape 2');
    }
    
    return errors;
  }, []);

  // === SYNCHRONISATION BASE DE DONNÉES → LOCAL ===
  const syncFromDatabase = useCallback(async (id?: string): Promise<boolean> => {
    const targetId = id || draftId;
    if (!targetId) {
      console.log('⚠️ Pas d\'ID de brouillon pour la synchronisation depuis la BD');
      return false;
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true }));
    
    try {
      console.log('📥 [SYNC] Synchronisation depuis la base de données...');
      
      const response = await getApiDraftQuotesById({ path: { id: targetId } });
      const responseData = response.data as any;
      
      if (!responseData?.data?.OptimizedDraftData) {
        throw new Error('Structure de réponse API invalide');
      }

      // Extraire les données de la base
      const dbDraftData = responseData.data.OptimizedDraftData;
      const dbVersion = responseData.version || responseData.lastModified || Date.now().toString();
      
      // Vérifier s'il y a des conflits
      if (lastDbVersionRef.current && lastDbVersionRef.current !== dbVersion) {
        console.log('⚠️ [SYNC] Conflit de version détecté');
        
        if (conflictResolutionRef.current === 'db-wins') {
          console.log('✅ [SYNC] Résolution automatique : base de données gagne');
        } else if (conflictResolutionRef.current === 'local-wins') {
          console.log('✅ [SYNC] Résolution automatique : local gagne');
          // Ne pas écraser les données locales
          setSyncStatus(prev => ({ 
            ...prev, 
            isSyncing: false,
            syncErrors: [...prev.syncErrors, 'Conflit résolu en faveur des données locales']
          }));
          return false;
        } else {
          // Résolution manuelle requise
          console.log('⚠️ [SYNC] Résolution manuelle requise pour le conflit');
          setSyncStatus(prev => ({ 
            ...prev, 
            isSyncing: false,
            syncErrors: [...prev.syncErrors, 'Conflit de version - résolution manuelle requise']
          }));
          return false;
        }
      }

      // Construire le draftQuote à partir des données de la base
      const dbDraftQuote: DraftQuote = {
        id: targetId,
        requestQuoteId: targetId,
        emailUser: dbDraftData.Wizard?.EmailUser,
        clientNumber: dbDraftData.Wizard?.ClientNumber,
        comment: dbDraftData.Wizard?.Comment,
        draftData: {
          wizard: dbDraftData.Wizard,
          steps: dbDraftData.Steps,
          totals: dbDraftData.Totals
        }
      };

      // Synchroniser les données de compatibilité
      const syncedDraftQuote = syncDraftQuoteData(dbDraftQuote);
      
      // Mettre à jour l'état local
      setDraftQuote(syncedDraftQuote);
      setDraftId(targetId);
      lastDbVersionRef.current = dbVersion;
      
      // Réinitialiser les changements en attente
      pendingChangesRef.current.clear();
      
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncAt: new Date(),
        lastSyncDirection: 'db-to-local',
        hasPendingChanges: false,
        pendingChanges: [],
        syncErrors: [],
        draftId: targetId,
        isNew: false
      }));

      console.log('✅ [SYNC] Synchronisation depuis la BD réussie');
      return true;
      
    } catch (error) {
      console.error('❌ [SYNC] Erreur lors de la synchronisation depuis la BD:', error);
      
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        syncErrors: [...prev.syncErrors, `Erreur BD: ${error instanceof Error ? error.message : 'Erreur inconnue'}`]
      }));
      
      return false;
    }
  }, [draftId]);

  // === SYNCHRONISATION LOCAL → BASE DE DONNÉES ===
  const syncToDatabase = useCallback(async (): Promise<boolean> => {
    if (syncStatus.isSyncing) {
      console.log('⚠️ [SYNC] Synchronisation déjà en cours...');
      return false;
    }

    // Validation avant synchronisation
    if (validateBeforeSync) {
      const validationErrors = validateDraftQuote(draftQuote);
      if (validationErrors.length > 0) {
        console.error('❌ [SYNC] Validation échouée:', validationErrors);
        setSyncStatus(prev => ({
          ...prev,
          syncErrors: [...prev.syncErrors, `Validation échouée: ${validationErrors.join(', ')}`]
        }));
        return false;
      }
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true }));
    
    try {
      console.log('📤 [SYNC] Synchronisation vers la base de données...');
      
      let response;
      let isNewDraft = false;
      
      // ✅ CORRECTION : Vérifier si draftId est valide pour une mise à jour
      if (isValidDraftId(draftId)) {
        // Mise à jour d'un brouillon existant
        console.log('🔄 [SYNC] Mise à jour du brouillon existant...');
        response = await putApiDraftQuotesById({
          body: buildUpdateDraftPayload(draftQuote),
          path: { id: draftId }
        });
      } else {
        // Création d'un nouveau brouillon
        console.log('🚀 [SYNC] Création d\'un nouveau brouillon...');
        response = await postApiDraftQuotes({
          body: buildCreateDraftPayload(draftQuote)
        });
        isNewDraft = true;
      }

      // Traiter la réponse
      const responseData = response.data as any;
      
      if (isNewDraft && responseData?.id) {
        console.log('✅ [SYNC] Nouveau brouillon créé, ID:', responseData.id);
        setDraftId(responseData.id);
        setDraftQuote(prev => ({ 
          ...prev, 
          id: responseData.id, 
          requestQuoteId: responseData.id 
        }));
      }

      // Mettre à jour la version de la base
      lastDbVersionRef.current = responseData.version || responseData.lastModified || Date.now().toString();
      
      // Réinitialiser les changements en attente
      pendingChangesRef.current.clear();
      
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncAt: new Date(),
        lastSyncDirection: 'local-to-db',
        hasPendingChanges: false,
        pendingChanges: [],
        syncErrors: [],
        isNew: false
      }));

      console.log('✅ [SYNC] Synchronisation vers la BD réussie');
      return true;
      
    } catch (error) {
      console.error('❌ [SYNC] Erreur lors de la synchronisation vers la BD:', error);
      
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        syncErrors: [...prev.syncErrors, `Erreur BD: ${error instanceof Error ? error.message : 'Erreur inconnue'}`]
      }));
      
      return false;
    }
  }, [draftQuote, draftId, syncStatus.isSyncing, validateBeforeSync, validateDraftQuote]);

  // === SYNCHRONISATION BIDIRECTIONNELLE AUTOMATIQUE ===
  const performAutoSync = useCallback(async () => {
    if (!autoSync || syncStatus.isSyncing) return;
    
    console.log('🔄 [AUTO_SYNC] Synchronisation automatique...');
    
    try {
      // Si on a un draftId, synchroniser depuis la BD d'abord
      if (draftId) {
        await syncFromDatabase();
      }
      
      // Puis synchroniser les changements locaux vers la BD
      if (pendingChangesRef.current.size > 0) {
        await syncToDatabase();
      }
    } catch (error) {
      console.error('❌ [AUTO_SYNC] Erreur lors de la synchronisation automatique:', error);
    }
  }, [autoSync, draftId, syncStatus.isSyncing, pendingChangesRef.current.size, syncFromDatabase, syncToDatabase]);

  // === GESTION DES CHANGEMENTS LOCAUX ===
  const updateDraftQuote = useCallback((updater: (prev: DraftQuote) => DraftQuote, changeSource?: string) => {
    setDraftQuote(prev => {
      const updated = updater(prev);
      
      // Marquer le changement comme en attente de synchronisation
      if (changeSource) {
        pendingChangesRef.current.add(changeSource);
      }
      
      // Mettre à jour le statut de synchronisation
      setSyncStatus(prevStatus => ({
        ...prevStatus,
        hasPendingChanges: pendingChangesRef.current.size > 0,
        pendingChanges: Array.from(pendingChangesRef.current)
      }));
      
      // Programmer une synchronisation automatique si activée
      if (autoSync) {
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
        syncTimeoutRef.current = setTimeout(performAutoSync, syncInterval);
      }
      
      return updated;
    });
  }, [autoSync, syncInterval, performAutoSync]);

  // === SYNCHRONISATION MANUELLE ===
  const manualSync = useCallback(async (direction?: 'from-db' | 'to-db' | 'both') => {
    console.log('🔄 [MANUAL_SYNC] Synchronisation manuelle...', direction);
    
    try {
      if (direction === 'from-db' || direction === 'both') {
        await syncFromDatabase();
      }
      
      if (direction === 'to-db' || direction === 'both') {
        await syncToDatabase();
      }
      
      console.log('✅ [MANUAL_SYNC] Synchronisation manuelle réussie');
    } catch (error) {
      console.error('❌ [MANUAL_SYNC] Erreur lors de la synchronisation manuelle:', error);
    }
  }, [syncFromDatabase, syncToDatabase]);

  // === GESTION DES CONFLITS ===
  const resolveConflict = useCallback((resolution: 'db-wins' | 'local-wins') => {
    conflictResolutionRef.current = resolution;
    console.log(`✅ [CONFLICT] Résolution définie: ${resolution}`);
    
    // Relancer la synchronisation avec la nouvelle résolution
    if (resolution === 'db-wins') {
      syncFromDatabase();
    } else {
      syncToDatabase();
    }
  }, [syncFromDatabase, syncToDatabase]);

  // === NETTOYAGE ===
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  // === ÉTAT DE SYNCHRONISATION EN TEMPS RÉEL ===
  const realTimeSyncStatus = useMemo(() => ({
    ...syncStatus,
    pendingChanges: Array.from(pendingChangesRef.current),
    hasPendingChanges: pendingChangesRef.current.size > 0
  }), [syncStatus, pendingChangesRef.current.size]);

  return {
    // === ÉTATS ===
    draftQuote,
    syncStatus: realTimeSyncStatus,
    
    // === FONCTIONS DE SYNCHRONISATION ===
    syncFromDatabase,
    syncToDatabase,
    manualSync,
    performAutoSync,
    
    // === GESTION DES CHANGEMENTS ===
    updateDraftQuote,
    
    // === GESTION DES CONFLITS ===
    resolveConflict,
    
    // === SETTERS ===
    setDraftQuote,
    setDraftId
  };
};
