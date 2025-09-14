import React from 'react';
import { Box, Typography, Alert, AlertTitle } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

interface SaveStrategyInfoProps {
  showInfo?: boolean;
}

const SaveStrategyInfo: React.FC<SaveStrategyInfoProps> = ({ showInfo = true }) => {
  if (!showInfo) return null;

  return (
    <Alert 
      severity="info" 
      icon={<InfoIcon />}
      sx={{ 
        mb: 2, 
        borderRadius: 2,
        '& .MuiAlert-message': {
          width: '100%'
        }
      }}
    >
      <AlertTitle>🔄 Nouvelle Stratégie de Sauvegarde</AlertTitle>
      
      <Box sx={{ mt: 1 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Problème résolu :</strong> L'<code>offerId</code> était <code>null</code> car la sauvegarde se faisait en local au lieu de l'API.
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Solution :</strong> Désactivation du fallback local pour forcer la sauvegarde via l'API et garantir la persistance de l'<code>offerId</code>.
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Avantages :</strong>
        </Typography>
        
        <Box component="ul" sx={{ ml: 2, mb: 1 }}>
          <li>✅ L'<code>offerId</code> est maintenant correctement sauvegardé</li>
          <li>✅ Les données sont persistantes dans la base de données</li>
          <li>✅ Pas de perte de données lors du rechargement</li>
          <li>✅ Synchronisation entre tous les composants</li>
        </Box>
        
        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
          <strong>Note :</strong> Si l'API n'est pas accessible, la sauvegarde échouera avec un message d'erreur clair au lieu de sauvegarder silencieusement en local.
        </Typography>
      </Box>
    </Alert>
  );
};

export default SaveStrategyInfo;
