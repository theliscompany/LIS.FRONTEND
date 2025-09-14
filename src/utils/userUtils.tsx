/**
 * Utilitaires pour la gestion des utilisateurs
 */
import { getApiAssignee } from '@features/request/api/sdk.gen';

/**
 * Vérifie si une chaîne ressemble à un GUID/UUID valide
 */
export const isValidUserId = (id: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

/**
 * Vérifie si une chaîne ressemble à un nom d'utilisateur (contient des espaces ou des tirets)
 */
export const isDisplayName = (id: string): boolean => {
  return /[\s\-]/.test(id) || !/^[a-f0-9\-]+$/i.test(id);
};

/**
 * Crée un objet utilisateur de fallback pour GraphApiUser
 */
export const createFallbackGraphUser = (id: string) => ({
  id: id,
  displayName: id,
  mail: '',
  userPrincipalName: id,
  graphObjectId: id
});

/**
 * Crée un objet utilisateur de fallback pour Assignee
 */
export const createFallbackAssignee = (id: string) => ({
  id: id,
  name: id,
  email: '',
  userId: id,
  idUser: id
});

/**
 * Recherche un assigné par nom en utilisant l'API Assignee
 * @param name - Le nom à rechercher
 * @returns Promise avec les détails de l'assigné ou null
 */
export const searchAssigneeByName = async (name: string): Promise<any> => {
  try {
    const result = await getApiAssignee({ 
      query: { nameFilter: name } 
    });
    
    // Retourner le premier résultat qui correspond exactement au nom
    if (result?.data && Array.isArray(result.data)) {
      const exactMatch = result.data.find((assignee: any) => 
        assignee.name === name || assignee.displayName === name
      );
      return exactMatch || result.data[0] || null;
    }
    
    return null;
  } catch (error) {
    console.warn(`[WARN] Impossible de rechercher l'assigné ${name}:`, error);
    return null;
  }
};

/**
 * Récupère les détails d'un utilisateur de manière sécurisée
 * Utilise l'API appropriée selon le format de l'ID
 * @param userId - L'ID ou nom de l'utilisateur
 * @param getUserDetails - Fonction pour récupérer les détails via UserGroup
 * @returns Promise avec les détails de l'utilisateur ou un objet de fallback
 */
export const safeGetUserDetails = async (
  userId: string, 
  getUserDetails?: (userId: string) => Promise<any>
): Promise<any> => {
  try {
    if (isValidUserId(userId) && getUserDetails) {
      // Utiliser l'API UserGroup pour les GUIDs
      const result = await getUserDetails(userId);
      return result?.data || createFallbackGraphUser(userId);
    } else if (isDisplayName(userId)) {
      // Utiliser l'API Assignee pour les noms
      const result = await searchAssigneeByName(userId);
      return result || createFallbackAssignee(userId);
    } else {
      // Fallback selon le format de l'ID
      return isValidUserId(userId) ? createFallbackGraphUser(userId) : createFallbackAssignee(userId);
    }
  } catch (error) {
    // En cas d'erreur, retourner un objet fallback approprié
    console.warn(`[WARN] Impossible de récupérer les détails de l'utilisateur ${userId}:`, error);
    return isValidUserId(userId) ? createFallbackGraphUser(userId) : createFallbackAssignee(userId);
  }
};
