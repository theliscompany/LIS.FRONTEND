import React, { useState } from 'react';
import { Button, Box, Typography, Alert } from '@mui/material';
import { useSnackbar } from 'notistack';

// Import des hooks de sauvegarde
import { 
  useCreateDraftQuote, 
  useUpdateDraftQuote,
  mapDraftQuoteToApi,
  mapDraftQuoteToUpdateApi,
  validateDraftQuote
} from '../../offer/services/draftQuoteService';

interface SaveDraftTestProps {
  draftQuote: any;
  savedOptions?: any[];
}

export default function SaveDraftTest({ draftQuote, savedOptions = [] }: SaveDraftTestProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateDraftQuote();
  const updateMutation = useUpdateDraftQuote();

  const handleTestSave = async () => {
    if (!draftQuote) {
      enqueueSnackbar('Aucun brouillon à sauvegarder', { variant: 'error' });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🧪 [TEST_SAVE] Début du test de sauvegarde');
      console.log('🧪 [TEST_SAVE] DraftQuote:', draftQuote);

      // 1. Validation
      console.log('🧪 [TEST_SAVE] Étape 1: Validation');
      const validation = validateDraftQuote(draftQuote);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
      console.log('✅ [TEST_SAVE] Validation réussie');

      // 2. Conversion et Sauvegarde
      console.log('🧪 [TEST_SAVE] Étape 2: Conversion et Sauvegarde');
      let result;
      
      if (draftQuote.draftQuoteId) {
        console.log('🔄 [TEST_SAVE] Mise à jour du brouillon existant');
        console.log('🔄 [TEST_SAVE] Conversion vers UpdateDraftQuoteRequest...');
        const updateApiDraft = mapDraftQuoteToUpdateApi(draftQuote, savedOptions);
        console.log('✅ [TEST_SAVE] Conversion UpdateDraftQuoteRequest réussie:', updateApiDraft);
        
        result = await updateMutation.mutateAsync({
          path: { id: draftQuote.draftQuoteId },
          body: updateApiDraft,
        });
      } else {
        console.log('🆕 [TEST_SAVE] Création d\'un nouveau brouillon');
        console.log('🔄 [TEST_SAVE] Conversion vers CreateDraftQuoteRequest...');
        const createApiDraft = mapDraftQuoteToApi(draftQuote);
        console.log('✅ [TEST_SAVE] Conversion CreateDraftQuoteRequest réussie:', createApiDraft);
        
        result = await createMutation.mutateAsync({
          body: createApiDraft,
        });
      }

      console.log('✅ [TEST_SAVE] Sauvegarde réussie:', result);
      enqueueSnackbar('Test de sauvegarde réussi !', { variant: 'success' });

    } catch (error) {
      console.error('❌ [TEST_SAVE] Erreur:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setError(errorMessage);
      enqueueSnackbar(`Erreur: ${errorMessage}`, { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2, border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        🧪 Test de Sauvegarde DraftQuote
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        onClick={handleTestSave}
        disabled={isLoading || !draftQuote}
        sx={{ mb: 2 }}
      >
        {isLoading ? 'Test en cours...' : 'Tester la sauvegarde'}
      </Button>

      <Typography variant="body2" color="text.secondary">
        Ce bouton teste uniquement la sauvegarde du brouillon principal (sans les options).
        Vérifiez la console pour les logs détaillés.
      </Typography>
    </Box>
  );
}
