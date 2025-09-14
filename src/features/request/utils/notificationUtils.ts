/**
 * Utility functions for showing notifications and snackbars
 */

export type NotificationSeverity = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  variant?: NotificationSeverity;
  autoHideDuration?: number;
  anchorOrigin?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
}

/**
 * Show a success notification
 */
export const showSuccess = (message: string, options?: NotificationOptions) => {
  showSnackbar(message, 'success', options);
};

/**
 * Show an error notification
 */
export const showError = (message: string, options?: NotificationOptions) => {
  showSnackbar(message, 'error', options);
};

/**
 * Show a warning notification
 */
export const showWarning = (message: string, options?: NotificationOptions) => {
  showSnackbar(message, 'warning', options);
};

/**
 * Show an info notification
 */
export const showInfo = (message: string, options?: NotificationOptions) => {
  showSnackbar(message, 'info', options);
};

/**
 * Show a snackbar notification
 * This is a placeholder function that should be replaced with your actual snackbar implementation
 */
export const showSnackbar = (
  message: string, 
  severity: NotificationSeverity = 'info', 
  options?: NotificationOptions
) => {
  // This should be replaced with your actual snackbar implementation
  // For example, using Material-UI's Snackbar or a custom notification system
  
  console.log(`[${severity.toUpperCase()}] ${message}`, options);
  
  // If you're using Material-UI's Snackbar, you would call:
  // enqueueSnackbar(message, { variant: severity, ...options });
  
  // If you're using a custom notification system, you would call:
  // notificationService.show(message, severity, options);
};

/**
 * Show a confirmation dialog
 */
export const showConfirmation = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
): Promise<boolean> => {
  return new Promise((resolve) => {
    // This should be replaced with your actual confirmation dialog implementation
    // For example, using Material-UI's Dialog or a custom confirmation component
    
    const userConfirmed = window.confirm(`${title}\n\n${message}`);
    
    if (userConfirmed) {
      onConfirm();
      resolve(true);
    } else {
      onCancel?.();
      resolve(false);
    }
  });
};

/**
 * Show a loading notification
 */
export const showLoading = (message: string = 'Chargement...') => {
  // This should be replaced with your actual loading notification implementation
  console.log(`[LOADING] ${message}`);
  
  // Return a function to hide the loading notification
  return () => {
    console.log(`[LOADING] ${message} - Terminé`);
  };
};

/**
 * Hide all notifications
 */
export const hideAllNotifications = () => {
  // This should be replaced with your actual notification hiding implementation
  console.log('[NOTIFICATIONS] Toutes les notifications ont été masquées');
};
