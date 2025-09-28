import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Paper,
  TextField,
} from '@mui/material';
import { useSelectQuoteOption, createSelectOptionRequest } from '../services/draftQuoteService';

/**
 * Exemple d'utilisation du hook useSelectQuoteOption
 * Ce composant montre comment utiliser l'endpoint SelectOption
 */
const SelectOptionExample: React.FC = () => {
  const [quoteId, setQuoteId] = useState<string>('');
  const [optionId, setOptionId] = useState<string>('');
  
  const selectOptionMutation = useSelectQuoteOption();

  const handleSelectOption = async () => {
    if (!quoteId || !optionId) {
      alert('Veuillez saisir un ID de devis et un ID d\'option');
      return;
    }

    try {
      const result = await selectOptionMutation.mutateAsync(
        createSelectOptionRequest(quoteId, optionId)
      );
      
      console.log('Option sélectionnée avec succès:', result);
      alert('Option sélectionnée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sélection:', error);
      alert('Erreur lors de la sélection de l\'option');
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Exemple d'utilisation - Sélection d'option
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Ce composant montre comment utiliser l'endpoint SelectOption pour permettre 
        au client de sélectionner une option parmi celles disponibles dans un devis.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="ID du devis"
          value={quoteId}
          onChange={(e) => setQuoteId(e.target.value)}
          placeholder="Ex: quote-123"
          fullWidth
        />
        
        <TextField
          label="ID de l'option"
          value={optionId}
          onChange={(e) => setOptionId(e.target.value)}
          placeholder="Ex: option-456"
          fullWidth
        />
        
        <Button
          variant="contained"
          onClick={handleSelectOption}
          disabled={selectOptionMutation.isPending || !quoteId || !optionId}
          sx={{ mt: 2 }}
        >
          {selectOptionMutation.isPending ? 'Sélection en cours...' : 'Sélectionner l\'option'}
        </Button>
      </Box>

      {selectOptionMutation.error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Erreur: {selectOptionMutation.error.message}
        </Alert>
      )}

      {selectOptionMutation.isSuccess && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Option sélectionnée avec succès !
        </Alert>
      )}

      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Comment utiliser dans votre code :
        </Typography>
        <Typography variant="body2" component="pre" sx={{ fontSize: '0.8rem' }}>
{`import { useSelectQuoteOption, createSelectOptionRequest } from '../services/draftQuoteService';

const MyComponent = () => {
  const selectOptionMutation = useSelectQuoteOption();
  
  const handleSelect = async (quoteId: string, optionId: string) => {
    await selectOptionMutation.mutateAsync(
      createSelectOptionRequest(quoteId, optionId)
    );
  };
  
  return (
    <Button onClick={() => handleSelect('quote-123', 'option-456')}>
      Sélectionner
    </Button>
  );
};`}
        </Typography>
      </Box>
    </Paper>
  );
};

export default SelectOptionExample;
