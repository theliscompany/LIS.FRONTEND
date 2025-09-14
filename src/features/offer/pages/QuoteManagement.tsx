import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Breadcrumbs,
  Link,
  Alert
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import QuoteOptionsManager from '@features/request/components/QuoteOptionsManager';

const QuoteManagement: React.FC = () => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  if (!quoteId) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        ID du devis manquant dans l'URL
      </Alert>
    );
  }

  // Gérer la sélection d'une option
  const handleOptionSelected = (optionId: string) => {
    setSelectedOptionId(optionId);
    console.log('[QuoteManagement] Option sélectionnée:', optionId);
  };

  // Ajouter une nouvelle option
  const handleAddNewOption = () => {
    // Rediriger vers le wizard avec les paramètres pour ajouter une option
    navigate(`/request-wizard?quoteId=${quoteId}&optionIndex=${getNextOptionIndex()}`);
  };

  // Dupliquer une option
  const handleDuplicateOption = (optionId: string) => {
    console.log('[QuoteManagement] Dupliquer option:', optionId);
    // TODO: Implémenter la logique de duplication
    // Cela devrait créer un nouveau brouillon basé sur l'option existante
  };

  // Modifier une option
  const handleEditOption = (optionId: string) => {
    console.log('[QuoteManagement] Modifier option:', optionId);
    // TODO: Implémenter la logique de modification
    // Cela devrait charger l'option dans le wizard pour modification
  };

  // Calculer le prochain index d'option
  const getNextOptionIndex = () => {
    // Cette logique sera améliorée quand on aura accès aux données du devis
    return 2; // Par défaut, on assume qu'on ajoute la 2ème option
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      {/* En-tête avec navigation */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 0 }}>
        <Stack spacing={2}>
          {/* Breadcrumbs */}
          <Breadcrumbs>
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/quotes')}
              sx={{ textDecoration: 'none' }}
            >
              Devis
            </Link>
            <Typography variant="body2" color="text.primary">
              Gestion du Devis {quoteId}
            </Typography>
          </Breadcrumbs>

          {/* Titre et actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                startIcon={<BackIcon />}
                onClick={() => navigate('/quotes')}
                variant="outlined"
              >
                Retour
              </Button>
              <Typography variant="h4" fontWeight="bold">
                Gestion du Devis {quoteId}
              </Typography>
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddNewOption}
              >
                Ajouter une Option
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Gestionnaire d'options */}
      <QuoteOptionsManager
        quoteId={quoteId}
        onOptionSelected={handleOptionSelected}
        onAddNewOption={handleAddNewOption}
        onDuplicateOption={handleDuplicateOption}
        onEditOption={handleEditOption}
      />

      {/* Informations sur l'option sélectionnée */}
      {selectedOptionId && (
        <Paper sx={{ p: 3, m: 3, bgcolor: '#e3f2fd' }}>
          <Typography variant="h6" gutterBottom>
            ℹ️ Option Sélectionnée
          </Typography>
          <Typography variant="body1">
            Option ID: {selectedOptionId}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Cette option est maintenant sélectionnée comme préférée pour ce devis.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default QuoteManagement;
