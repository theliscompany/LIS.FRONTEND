import React from 'react';
import { Box, Alert, Button, Typography, Link } from '@mui/material';
import { useMsal } from '@azure/msal-react';
import { useTranslation } from 'react-i18next';
import SecurityIcon from '@mui/icons-material/Security';

interface AzureConsentHandlerProps {
  error?: any;
  onRetry?: () => void;
  children?: React.ReactNode;
}

const AzureConsentHandler: React.FC<AzureConsentHandlerProps> = ({ 
  error, 
  onRetry, 
  children 
}) => {
  const { instance } = useMsal();
  const { t } = useTranslation();

  // Vérifier si c'est une erreur de consentement Azure AD
  const isConsentError = error?.message?.includes('AADSTS65001') ||
                        error?.message?.includes('consent') ||
                        error?.message?.includes('not consented');

  if (!isConsentError) {
    return <>{children}</>;
  }

  const handleConsentRequest = async () => {
    try {
      // Demander explicitement le consentement avec prompt=consent
      await instance.loginPopup({
        scopes: ['User.Read', 'openid', 'profile', 'email'],
        prompt: 'consent', // Force le consentement
        extraQueryParameters: {
          prompt: 'consent'
        }
      });
      
      // Retry après consentement
      if (onRetry) {
        onRetry();
      }
    } catch (consentError) {
      console.error('Erreur lors de la demande de consentement:', consentError);
    }
  };

  const handleAdminConsent = () => {
    // Ouvrir le portail Azure pour l'administrateur
    const tenantId = 'abb93e13-2d77-476f-a287-59892d6b3c24'; // Remplacer par votre tenant ID
    const appId = '788aee08-9270-4549-9a97-c43b43a8bb73'; // Remplacer par votre app ID
    
    const adminConsentUrl = `https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/CallAnAPI/appId/${appId}/isMSAApp/`;
    
    window.open(adminConsentUrl, '_blank');
  };

  return (
    <Box sx={{ p: 2 }}>
      <Alert 
        severity="error" 
        icon={<SecurityIcon />}
        sx={{ mb: 2 }}
        action={
          <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
            <Button 
              size="small" 
              color="inherit" 
              onClick={handleConsentRequest}
              sx={{ fontSize: '0.75rem' }}
            >
              {t('auth.requestConsent')}
            </Button>
            <Button 
              size="small" 
              color="inherit" 
              onClick={handleAdminConsent}
              sx={{ fontSize: '0.75rem' }}
            >
              {t('auth.adminConsent')}
            </Button>
          </Box>
        }
      >
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          {t('auth.consentRequired')}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          {t('auth.consentMessage')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          <strong>App ID:</strong> 788aee08-9270-4549-9a97-c43b43a8bb73
        </Typography>
      </Alert>
      
      {/* Afficher le contenu original en mode dégradé */}
      <Box sx={{ opacity: 0.6, pointerEvents: 'none' }}>
        {children}
      </Box>
    </Box>
  );
};

export default AzureConsentHandler; 