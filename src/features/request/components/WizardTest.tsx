import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useWizardDraftState } from '../hooks/useWizardDraftState';

export const WizardTest: React.FC = () => {
  const {
    draftQuote,
    isLoading,
    hasUnsavedChanges,
    updateStep,
    saveDraft
  } = useWizardDraftState(null, 'test@example.com', 'TEST001');

  const handleTestStep1 = () => {
    updateStep(1, {
      customer: { contactId: 1, contactName: 'Test Customer', companyName: 'Test Company', email: 'test@example.com' },
      cityFrom: { name: 'Paris', country: 'France' },
      cityTo: { name: 'Londres', country: 'UK' },
      comment: 'Test comment'
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🧪 Test du Wizard
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          État du Wizard
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Chargement:</strong> {isLoading ? '🔄 En cours...' : '✅ Terminé'}
          </Typography>
          <Typography variant="body2">
            <strong>Brouillon initialisé:</strong> {draftQuote ? '✅ Oui' : '❌ Non'}
          </Typography>
          <Typography variant="body2">
            <strong>Changements non sauvegardés:</strong> {hasUnsavedChanges ? '⚠️ Oui' : '✅ Non'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={handleTestStep1}
            disabled={isLoading}
          >
            Tester Step 1
          </Button>
          
          <Button
            variant="outlined"
            onClick={saveDraft}
            disabled={!hasUnsavedChanges || isLoading}
          >
            Sauvegarder
          </Button>
        </Box>
      </Paper>

      {draftQuote && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Contenu du Brouillon
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>ID:</strong> {draftQuote.id || 'Non défini'}
            </Typography>
            <Typography variant="body2">
              <strong>Client:</strong> {draftQuote.step1?.customer?.contactName || 'Non défini'}
            </Typography>
            <Typography variant="body2">
              <strong>Départ:</strong> {draftQuote.step1?.cityFrom?.name || 'Non défini'}
            </Typography>
            <Typography variant="body2">
              <strong>Arrivée:</strong> {draftQuote.step1?.cityTo?.name || 'Non défini'}
            </Typography>
            <Typography variant="body2">
              <strong>Commentaire:</strong> {draftQuote.step1?.comment || 'Non défini'}
            </Typography>
          </Box>

          <Typography variant="caption" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(draftQuote, null, 2)}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};




