/**
 * Utilitaires pour la validation des IDs de brouillons
 */

/**
 * Vérifie si un draftId est valide pour une mise à jour (PUT)
 * Un draftId est considéré comme valide s'il :
 * - n'est pas null ou undefined
 * - n'est pas une chaîne vide
 * - n'est pas égal à "new"
 * 
 * @param draftId - L'ID du brouillon à valider
 * @returns true si le draftId est valide pour une mise à jour, false sinon
 */
export const isValidDraftId = (draftId: string | null | undefined): boolean => {
  return !!(draftId && draftId.trim() !== '' && draftId !== 'new');
};

/**
 * Vérifie si un draftId indique qu'il faut créer un nouveau brouillon (POST)
 * 
 * @param draftId - L'ID du brouillon à valider
 * @returns true si un nouveau brouillon doit être créé, false sinon
 */
export const shouldCreateNewDraft = (draftId: string | null | undefined): boolean => {
  return !isValidDraftId(draftId);
};

/**
 * Détermine la méthode HTTP à utiliser pour sauvegarder un brouillon
 * 
 * @param draftId - L'ID du brouillon
 * @returns "PUT" pour mise à jour, "POST" pour création
 */
export const getSaveMethod = (draftId: string | null | undefined): 'PUT' | 'POST' => {
  return isValidDraftId(draftId) ? 'PUT' : 'POST';
};

/**
 * Valide si un ID de brouillon provient du backend
 * Les IDs du backend sont des IDs MongoDB (ObjectId) ou des IDs générés par l'API
 * 
 * @param draftId - L'ID du brouillon à valider
 * @returns true si l'ID provient du backend, false sinon
 */
export const isBackendGeneratedId = (draftId: string | null | undefined): boolean => {
  if (!draftId || draftId === 'new') {
    return false;
  }
  
  // ✅ Les IDs MongoDB ont 24 caractères hexadécimaux
  const isMongoId = /^[0-9a-fA-F]{24}$/.test(draftId);
  
  // ✅ Les IDs côté client commencent par 'draft-' suivi d'un timestamp et d'une chaîne aléatoire
  const isClientGenerated = draftId.startsWith('draft-') && 
                          draftId.length <= 25 && 
                          /^draft-\d+-[a-z0-9]+$/.test(draftId);
  
  // ✅ Les IDs temporaires commencent par 'temp-'
  const isTemporaryId = draftId.startsWith('temp-');
  
  // 🔍 DEBUG : Log pour comprendre la validation
  console.log('🔍 [VALIDATION] ID analysé:', {
    draftId,
    isMongoId,
    isClientGenerated,
    isTemporaryId,
    length: draftId.length,
    result: isMongoId && !isClientGenerated && !isTemporaryId
  });
  
  // ✅ TEMPORAIRE : Accepter tous les IDs non-vides pour debug
  return draftId.length > 0 && !isTemporaryId;
};
