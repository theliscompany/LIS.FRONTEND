// Service de gestion du localStorage pour les brouillons
export class LocalStorageService {
  private static readonly DRAFT_PREFIX = 'draft_';
  private static readonly DRAFT_FALLBACK_PREFIX = 'draft_fallback_';
  private static readonly DRAFT_METADATA_KEY = 'draft_metadata';

  /**
   * Sauvegarde un brouillon dans le localStorage
   */
  static saveDraft(draftQuote: any, draftId: string | null = null): void {
    try {
      const key = draftId ? `${this.DRAFT_PREFIX}${draftId}` : `${this.DRAFT_FALLBACK_PREFIX}${Date.now()}`;
      const data = {
        timestamp: new Date().toISOString(),
        data: draftQuote,
        draftId: draftId,
        isLocalOnly: true
      };
      
      localStorage.setItem(key, JSON.stringify(data));
      
      // Mettre à jour les métadonnées
      this.updateDraftMetadata(key, draftId, draftQuote);
      
      console.log('💾 [LOCAL_STORAGE] Brouillon sauvegardé localement:', { key, draftId });
    } catch (error) {
      console.error('❌ [LOCAL_STORAGE] Erreur lors de la sauvegarde locale:', error);
    }
  }

  /**
   * Charge un brouillon depuis le localStorage
   */
  static loadDraft(draftId: string): any | null {
    try {
      const key = `${this.DRAFT_PREFIX}${draftId}`;
      const data = localStorage.getItem(key);
      
      if (data) {
        const parsed = JSON.parse(data);
        console.log('📥 [LOCAL_STORAGE] Brouillon chargé depuis le localStorage:', { key, draftId });
        return parsed.data;
      }
      
      return null;
    } catch (error) {
      console.error('❌ [LOCAL_STORAGE] Erreur lors du chargement local:', error);
      return null;
    }
  }

  /**
   * Charge le dernier brouillon fallback
   */
  static loadLastFallbackDraft(): any | null {
    try {
      const metadata = this.getDraftMetadata();
      const fallbackDrafts = metadata.filter((meta: any) => meta.key.startsWith(this.DRAFT_FALLBACK_PREFIX));
      
      if (fallbackDrafts.length > 0) {
        // Prendre le plus récent
        const latest = fallbackDrafts.sort((a: any, b: any) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];
        
        const data = localStorage.getItem(latest.key);
        if (data) {
          const parsed = JSON.parse(data);
          console.log('📥 [LOCAL_STORAGE] Dernier brouillon fallback chargé:', latest.key);
          return parsed.data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ [LOCAL_STORAGE] Erreur lors du chargement du fallback:', error);
      return null;
    }
  }

  /**
   * Supprime un brouillon du localStorage
   */
  static deleteDraft(draftId: string): void {
    try {
      const key = `${this.DRAFT_PREFIX}${draftId}`;
      localStorage.removeItem(key);
      
      // Mettre à jour les métadonnées
      this.removeDraftMetadata(key);
      
      console.log('🗑️ [LOCAL_STORAGE] Brouillon supprimé du localStorage:', { key, draftId });
    } catch (error) {
      console.error('❌ [LOCAL_STORAGE] Erreur lors de la suppression:', error);
    }
  }

  /**
   * Liste tous les brouillons locaux
   */
  static listLocalDrafts(): Array<{key: string, draftId: string | null, timestamp: string, title: string}> {
    try {
      const metadata = this.getDraftMetadata();
      return metadata.map((meta: any) => ({
        key: meta.key,
        draftId: meta.draftId,
        timestamp: meta.timestamp,
        title: meta.title || `Brouillon ${meta.draftId || 'Local'}`
      }));
    } catch (error) {
      console.error('❌ [LOCAL_STORAGE] Erreur lors de la liste des brouillons:', error);
      return [];
    }
  }

  /**
   * Nettoie les anciens brouillons (garde seulement les 10 plus récents)
   */
  static cleanupOldDrafts(): void {
    try {
      const metadata = this.getDraftMetadata();
      const fallbackDrafts = metadata.filter((meta: any) => meta.key.startsWith(this.DRAFT_FALLBACK_PREFIX));
      
      if (fallbackDrafts.length > 10) {
        // Trier par timestamp et garder seulement les 10 plus récents
        const sorted = fallbackDrafts.sort((a: any, b: any) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        const toDelete = sorted.slice(10);
        toDelete.forEach((meta: any) => {
          localStorage.removeItem(meta.key);
          this.removeDraftMetadata(meta.key);
        });
        
        console.log('🧹 [LOCAL_STORAGE] Nettoyage des anciens brouillons:', toDelete.length);
      }
    } catch (error) {
      console.error('❌ [LOCAL_STORAGE] Erreur lors du nettoyage:', error);
    }
  }

  /**
   * Met à jour les métadonnées des brouillons
   */
  private static updateDraftMetadata(key: string, draftId: string | null, draftQuote: any): void {
    try {
      const metadata = this.getDraftMetadata();
      const existingIndex = metadata.findIndex((meta: any) => meta.key === key);
      
      const newMeta = {
        key,
        draftId,
        timestamp: new Date().toISOString(),
        title: this.generateDraftTitle(draftQuote)
      };
      
      if (existingIndex >= 0) {
        metadata[existingIndex] = newMeta;
      } else {
        metadata.push(newMeta);
      }
      
      localStorage.setItem(this.DRAFT_METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.error('❌ [LOCAL_STORAGE] Erreur lors de la mise à jour des métadonnées:', error);
    }
  }

  /**
   * Supprime une entrée des métadonnées
   */
  private static removeDraftMetadata(key: string): void {
    try {
      const metadata = this.getDraftMetadata();
      const filtered = metadata.filter((meta: any) => meta.key !== key);
      localStorage.setItem(this.DRAFT_METADATA_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('❌ [LOCAL_STORAGE] Erreur lors de la suppression des métadonnées:', error);
    }
  }

  /**
   * Récupère les métadonnées des brouillons
   */
  private static getDraftMetadata(): any[] {
    try {
      const data = localStorage.getItem(this.DRAFT_METADATA_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ [LOCAL_STORAGE] Erreur lors de la récupération des métadonnées:', error);
      return [];
    }
  }

  /**
   * Génère un titre pour le brouillon
   */
  private static generateDraftTitle(draftQuote: any): string {
    try {
      const step1 = draftQuote?.step1;
      if (step1?.customer?.companyName && step1?.cityFrom?.name && step1?.cityTo?.name) {
        return `${step1.customer.companyName} - ${step1.cityFrom.name} → ${step1.cityTo.name}`;
      }
      return `Brouillon ${new Date().toLocaleDateString()}`;
    } catch (error) {
      return `Brouillon ${new Date().toLocaleDateString()}`;
    }
  }

  /**
   * Vérifie si le localStorage est disponible
   */
  static isAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtient la taille utilisée par le localStorage
   */
  static getStorageSize(): { used: number, available: number } {
    try {
      let used = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }
      
      // Estimation de la taille disponible (5MB par défaut)
      const available = 5 * 1024 * 1024 - used;
      
      return { used, available };
    } catch (error) {
      return { used: 0, available: 0 };
    }
  }
}
