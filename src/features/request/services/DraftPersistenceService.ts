// === SERVICE DE PERSISTANCE CENTRALISÉ ===
import { 
  getApiQuoteOfferDrafts, 
  postApiQuoteOfferDraft, 
  putApiQuoteOfferDraftById, 
  getDraft 
} from '@features/offer/api/sdk.gen';
import { buildSDKPayload } from '../types/DraftQuote';

export interface SaveOptions {
  retryCount?: number;
  fallbackToLocalStorage?: boolean;
  validateData?: boolean;
}

export interface DraftPersistenceResult {
  success: boolean;
  draftId?: string;
  error?: string;
  usedFallback?: boolean;
}

export class DraftPersistenceService {
  private debugLog: (message: string, data?: any) => void;

  constructor(debugLogger: (message: string, data?: any) => void) {
    this.debugLog = debugLogger;
  }

  /**
   * Sauvegarde un brouillon (création ou mise à jour)
   */
  async saveDraft(
    draftQuote: any, 
    draftId: string | null, 
    requestId: string | null,
    userEmail: string,
    options: SaveOptions = {}
  ): Promise<DraftPersistenceResult> {
    const { retryCount = 0, fallbackToLocalStorage = true, validateData = true } = options;
    
    this.debugLog('PERSISTENCE - Début sauvegarde', { 
      draftId, 
      requestId, 
      retryCount,
      hasValidation: validateData 
    });

    try {
      // Validation optionnelle des données
      if (validateData) {
        const validationErrors = this.validateDraftData(draftQuote);
        if (validationErrors.length > 0) {
          this.debugLog('PERSISTENCE - Validation échouée', { errors: validationErrors });
          return {
            success: false,
            error: `Données invalides: ${validationErrors.join(', ')}`
          };
        }
      }

      // Utiliser la fonction buildSDKPayload corrigée
      const optimizedData = buildSDKPayload(draftQuote, userEmail);

      let result: DraftPersistenceResult;

      // Vérifier si draftId est valide (non null, non undefined, non string vide)
      const hasDraftId = draftId && draftId.trim() !== '';
      
      this.debugLog('PERSISTENCE - Choix méthode sauvegarde', { 
        draftId, 
        draftIdType: typeof draftId,
        draftIdLength: draftId?.length,
        hasDraftId,
        requestId, 
        method: hasDraftId ? 'PUT (mise à jour)' : 'POST (création)' 
      });

      if (hasDraftId) {
        // Mise à jour d'un brouillon existant → PUT
        this.debugLog('PERSISTENCE - Utilisation PUT pour mise à jour', { draftId });
        result = await this.updateExistingDraft(draftId, optimizedData, requestId, userEmail);
      } else {
        // Création d'un nouveau brouillon → POST
        this.debugLog('PERSISTENCE - Utilisation POST pour création');
        result = await this.createNewDraft(optimizedData, requestId, userEmail);
      }

      if (result.success) {
        this.debugLog('PERSISTENCE - Sauvegarde réussie', { draftId: result.draftId });
        return result;
      } else {
        throw new Error(result.error || 'Erreur inconnue');
      }

    } catch (error) {
      this.debugLog('PERSISTENCE - Erreur sauvegarde', { error, retryCount });

      // Retry automatique
      if (retryCount < 3) {
        this.debugLog('PERSISTENCE - Tentative de retry', { attempt: retryCount + 1 });
        await this.delay(2000 * (retryCount + 1));
        return this.saveDraft(draftQuote, draftId, requestId, userEmail, {
          ...options,
          retryCount: retryCount + 1
        });
      }

      // Fallback vers localStorage
      if (fallbackToLocalStorage) {
        this.debugLog('PERSISTENCE - Fallback vers localStorage');
        this.saveToLocalStorage(draftQuote, draftId);
        return {
          success: true,
          usedFallback: true,
          error: 'Sauvegardé localement après échec serveur'
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de sauvegarde'
      };
    }
  }

  /**
   * Chargement d'un brouillon
   */
  async loadDraft(draftId: string): Promise<any | null> {
    try {
      this.debugLog('PERSISTENCE - Chargement brouillon', { draftId });
      
      const response = await getDraft({ path: { id: draftId } });
      const draftData = (response as any)?.data;
      
      if (draftData) {
        const draftDataContent = 
          draftData.data?.optimizedDraftData ||
          draftData.optimizedDraftData ||
          draftData.data?.draftData ||
          draftData.draftData ||
          {};
        
        this.debugLog('PERSISTENCE - Brouillon chargé', { draftId, hasData: !!draftDataContent });
        return draftDataContent;
      }
      
      return null;
    } catch (error) {
      this.debugLog('PERSISTENCE - Erreur chargement', { draftId, error });
      
      // Fallback vers localStorage
      return this.loadFromLocalStorage(draftId);
    }
  }

  /**
   * Création d'un nouveau brouillon (POST)
   */
  private async createNewDraft(optimizedData: any, requestId: string | null, userEmail: string): Promise<DraftPersistenceResult> {
    try {
      this.debugLog('PERSISTENCE - Création nouveau brouillon', { requestId, userEmail });
      
      // Le payload est déjà correctement formaté par buildSDKPayload
      const payload = optimizedData;
      
      this.debugLog('PERSISTENCE - Payload POST', payload);
      
      console.log('🚀 [ENDPOINT] POST /api/QuoteOffer/draft - Création nouveau brouillon');
      const response = await postApiQuoteOfferDraft({ body: payload });
      const responseData = (response as any)?.data;
      
      if (responseData?.id) {
        return {
          success: true,
          draftId: responseData.id,
          usedFallback: false
        };
      } else {
        throw new Error('Réponse API invalide pour création');
      }
    } catch (error) {
      this.debugLog('PERSISTENCE - Erreur création POST', { error });
      throw error;
    }
  }

  /**
   * Mise à jour d'un brouillon existant (PUT)
   */
  private async updateExistingDraft(draftId: string, optimizedData: any, requestId: string | null, userEmail: string): Promise<DraftPersistenceResult> {
    try {
      this.debugLog('PERSISTENCE - Mise à jour brouillon existant', { draftId, requestId, userEmail });
      
      // Le payload est déjà correctement formaté par buildSDKPayload
      const payload = optimizedData;
      
      this.debugLog('PERSISTENCE - Payload PUT', payload);
      
      console.log('🚀 [ENDPOINT] PUT /api/QuoteOffer/draft/' + draftId + ' - Mise à jour brouillon existant');
      const response = await putApiQuoteOfferDraftById({ 
        path: { id: draftId },
        body: payload 
      });
      
      return {
        success: true,
        draftId: draftId,
        usedFallback: false
      };
    } catch (error) {
      this.debugLog('PERSISTENCE - Erreur mise à jour PUT', { error });
      throw error;
    }
  }

  /**
   * Vérification de doublons
   */
  async checkForExistingDraft(requestId: string, userEmail: string): Promise<any | null> {
    try {
      this.debugLog('PERSISTENCE - Vérification doublon', { requestId, userEmail });
      
      const response = await getApiQuoteOfferDrafts({
        query: {
          emailUser: userEmail,
          pageNumber: 1,
          pageSize: 100
        }
      });
      
      const drafts = (response as any)?.data?.items || [];
      const existingDraft = drafts.find((draft: any) => 
        String(draft.requestQuoteId || '') === String(requestId)
      );
      
      this.debugLog('PERSISTENCE - Résultat vérification', { 
        found: !!existingDraft, 
        draftId: existingDraft?.id 
      });
      
      return existingDraft || null;
    } catch (error) {
      this.debugLog('PERSISTENCE - Erreur vérification doublon', { error });
      return null;
    }
  }

  // === MÉTHODES PRIVÉES (version en doublon supprimée) ===

  // Méthode createNewDraft en doublon supprimée - utiliser la version ligne 160

  private validateDraftData(draftQuote: any): string[] {
    const errors: string[] = [];
    
    // Validation basique
    if (!draftQuote.step1?.customer?.contactId) {
      errors.push('Client requis');
    }
    if (!draftQuote.step1?.cityFrom?.name) {
      errors.push('Ville de départ requise');
    }
    if (!draftQuote.step1?.cityTo?.name) {
      errors.push('Ville d\'arrivée requise');
    }
    
    return errors;
  }



  private saveToLocalStorage(draftQuote: any, draftId: string | null): void {
    const key = draftId ? `draft_${draftId}` : `draft_fallback_${Date.now()}`;
    const data = {
      timestamp: new Date().toISOString(),
      data: draftQuote,
      fallback: true
    };
    localStorage.setItem(key, JSON.stringify(data));
    this.debugLog('PERSISTENCE - Sauvegarde localStorage', { key });
  }

  private loadFromLocalStorage(draftId: string): any | null {
    try {
      const key = `draft_${draftId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const data = JSON.parse(stored);
        this.debugLog('PERSISTENCE - Chargement localStorage', { key, hasData: !!data });
        return data.data || data;
      }
    } catch (error) {
      this.debugLog('PERSISTENCE - Erreur localStorage', { error });
    }
    return null;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// === HOOK POUR UTILISER LE SERVICE ===
export const useDraftPersistence = (debugLogger: (message: string, data?: any) => void) => {
  const service = new DraftPersistenceService(debugLogger);
  return service;
};
