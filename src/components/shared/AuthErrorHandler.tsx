import React from 'react';
import { Box, Alert, Button, Typography } from '@mui/material';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { useTranslation } from 'react-i18next';

interface AuthErrorHandlerProps {
  error?: any;
  onRetry?: () => void;
  children?: React.ReactNode;
}

const AuthErrorHandler: React.FC<AuthErrorHandlerProps> = ({ 
  error, 
  onRetry, 
  children 
}) => {
  const { instance } = useMsal();
  const { t } = useTranslation();

  // Vérifier si c'est une erreur d'authentification
  const isAuthError = error instanceof InteractionRequiredAuthError || 
                     error?.message?.includes('AADSTS50076') ||
                     error?.message?.includes('AADSTS65001') ||
                     error?.message?.includes('interaction_required') ||
                     error?.message?.includes('invalid_grant');

  if (!isAuthError) {
    return <>{children}</>;
  }

  const handleLogin = async () => {
    try {
      // Forcer une nouvelle authentification interactive
      await instance.loginPopup({
        scopes: ['User.Read', 'openid', 'profile', 'email'],
        prompt: 'select_account'
      });
      
      // Retry après authentification
      if (onRetry) {
        onRetry();
      }
    } catch (loginError) {
      console.error('Erreur lors de la reconnexion:', loginError);
    }
  };

  const handleSilentLogin = async () => {
    try {
      // Essayer une authentification silencieuse
      await instance.acquireTokenSilent({
        scopes: ['User.Read', 'openid', 'profile', 'email'],
        account: instance.getActiveAccount() || undefined
      });
      
      // Retry après authentification
      if (onRetry) {
        onRetry();
      }
    } catch (silentError) {
      console.error('Erreur lors de l\'authentification silencieuse:', silentError);
      // Si l'authentification silencieuse échoue, forcer l'interactive
      await handleLogin();
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Alert 
        severity="warning" 
        sx={{ mb: 2 }}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              size="small" 
              color="inherit" 
              onClick={handleSilentLogin}
              sx={{ fontSize: '0.75rem' }}
            >
              {t('auth.silentRetry')}
            </Button>
            <Button 
              size="small" 
              color="inherit" 
              onClick={handleLogin}
              sx={{ fontSize: '0.75rem' }}
            >
              {t('auth.reconnect')}
            </Button>
          </Box>
        }
      >
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          {t('auth.authenticationRequired')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t('auth.mfaRequiredMessage')}
        </Typography>
      </Alert>
      
      {/* Afficher le contenu original en mode dégradé */}
      <Box sx={{ opacity: 0.6, pointerEvents: 'none' }}>
        {children}
      </Box>
    </Box>
  );
};

export default AuthErrorHandler; 