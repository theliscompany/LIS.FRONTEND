import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Euro,
  Schedule,
  LocalShipping,
  Business,
} from '@mui/icons-material';
import { useSelectQuoteOption, createSelectOptionRequest } from '../services/draftQuoteService';
import type { QuoteResponse } from '../api/types.gen';

interface QuoteOptionSelectorProps {
  quote: QuoteResponse;
  onOptionSelected?: (optionId: string) => void;
}

const QuoteOptionSelector: React.FC<QuoteOptionSelectorProps> = ({
  quote,
  onOptionSelected,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(
    quote.selectedOption?.optionId || null
  );
  
  const selectOptionMutation = useSelectQuoteOption();

  const handleSelectOption = async (optionId: string) => {
    try {
      await selectOptionMutation.mutateAsync(
        createSelectOptionRequest(quote.quoteId, optionId)
      );
      setSelectedOptionId(optionId);
      onOptionSelected?.(optionId);
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'option:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  if (!quote.availableOptions || quote.availableOptions.length === 0) {
    return (
      <Alert severity="info">
        Aucune option disponible pour ce devis.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Options disponibles
      </Typography>
      
      {quote.selectedOption && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <CheckCircle sx={{ mr: 1 }} />
          Option sélectionnée : {quote.selectedOption.label}
        </Alert>
      )}

      <Grid container spacing={2}>
        {quote.availableOptions.map((option) => (
          <Grid item xs={12} md={6} key={option.optionId}>
            <Card
              sx={{
                border: selectedOptionId === option.optionId ? 2 : 1,
                borderColor: selectedOptionId === option.optionId 
                  ? 'primary.main' 
                  : 'divider',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 2,
                },
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" component="div">
                    {option.label}
                  </Typography>
                  {option.isPreferred && (
                    <Chip
                      label="Recommandée"
                      color="primary"
                      size="small"
                      icon={<CheckCircle />}
                    />
                  )}
                </Box>

                <Box mb={2}>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {formatCurrency(option.totals?.grandTotal || 0, option.currency)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total TTC
                  </Typography>
                </Box>

                {option.planning && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Planning
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ETD: {option.planning.etd ? formatDate(option.planning.etd) : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ETA: {option.planning.eta ? formatDate(option.planning.eta) : 'N/A'}
                    </Typography>
                  </Box>
                )}

                {option.containers && option.containers.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      <LocalShipping sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Conteneurs
                    </Typography>
                    {option.containers.map((container, index) => (
                      <Typography key={index} variant="body2" color="text.secondary">
                        {container.quantity}x {container.containerType}
                      </Typography>
                    ))}
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    {option.validUntil && (
                      <Typography variant="caption" color="text.secondary">
                        Valide jusqu'au {formatDate(option.validUntil)}
                      </Typography>
                    )}
                  </Box>
                  
                  <Button
                    variant={selectedOptionId === option.optionId ? "contained" : "outlined"}
                    color="primary"
                    onClick={() => handleSelectOption(option.optionId)}
                    disabled={selectOptionMutation.isPending}
                    startIcon={
                      selectOptionMutation.isPending ? (
                        <CircularProgress size={16} />
                      ) : selectedOptionId === option.optionId ? (
                        <CheckCircle />
                      ) : null
                    }
                  >
                    {selectedOptionId === option.optionId ? 'Sélectionnée' : 'Sélectionner'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectOptionMutation.error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Erreur lors de la sélection de l'option : {selectOptionMutation.error.message}
        </Alert>
      )}
    </Box>
  );
};

export default QuoteOptionSelector;
