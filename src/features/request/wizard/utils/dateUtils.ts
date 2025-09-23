/**
 * Utilitaires pour la gestion des dates dans le wizard
 */

/**
 * Convertit une date en format ISO string valide
 * Si la date est invalide ou n'existe pas, retourne la date d'aujourd'hui
 */
export const toValidISODate = (dateInput?: string | Date | null): string => {
  if (!dateInput) {
    return new Date().toISOString();
  }

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  // Vérifier que la date est valide, n'est pas l'année 0000, et est après 1900
  if (isNaN(date.getTime()) || date.getFullYear() === 0 || date.getFullYear() < 1900) {
    console.warn('Date invalide détectée, utilisation de la date actuelle:', dateInput);
    return new Date().toISOString();
  }

  return date.toISOString();
};

/**
 * Convertit une date en format ISO string ou null si pas de date
 * Utilisé pour les dates optionnelles (ETD, ETA)
 */
export const toOptionalISODate = (dateInput?: string | Date | null): string | null => {
  if (!dateInput) {
    return null;
  }

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  // Vérifier que la date est valide et n'est pas l'année 0000
  if (isNaN(date.getTime()) || date.getFullYear() === 0) {
    console.warn('Date invalide détectée, retour null:', dateInput);
    return null;
  }

  return date.toISOString();
};

/**
 * Valide qu'une date est correcte pour l'affichage
 * Retourne la date d'aujourd'hui si la date est invalide
 */
export const toValidDisplayDate = (dateInput?: string | Date | null): Date => {
  if (!dateInput) {
    return new Date();
  }

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  // Vérifier que la date est valide et n'est pas l'année 0000
  if (isNaN(date.getTime()) || date.getFullYear() === 0) {
    console.warn('Date invalide pour affichage, utilisation de la date actuelle:', dateInput);
    return new Date();
  }

  return date;
};

/**
 * Formate une date pour l'affichage (MMM dd, yyyy)
 * Utilise la date d'aujourd'hui si la date est invalide
 */
export const formatDisplayDate = (dateInput?: string | Date | null): string => {
  const validDate = toValidDisplayDate(dateInput);
  
  // Formatage simple sans dépendance externe
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const month = months[validDate.getMonth()];
  const day = validDate.getDate().toString().padStart(2, '0');
  const year = validDate.getFullYear();
  
  return `${month} ${day}, ${year}`;
};

/**
 * Vérifie si une date est valide
 */
export const isValidDate = (dateInput?: string | Date | null): boolean => {
  if (!dateInput) {
    return false;
  }

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return !isNaN(date.getTime()) && date.getFullYear() !== 0;
};
