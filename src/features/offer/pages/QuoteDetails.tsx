import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Description,
  Business,
  LocalShipping,
  Euro,
  Schedule,
} from '@mui/icons-material';
import { useQuote } from '../services/draftQuoteService';
import QuoteOptionSelector from '../components/QuoteOptionSelector';

const QuoteDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: quoteData, isLoading, error, refetch } = useQuote(id || '');

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Erreur lors du chargement du devis : {error.message}
      </Alert>
    );
  }

  if (!quoteData?.data) {
    return (
      <Alert severity="warning">
        Devis non trouvé.
      </Alert>
    );
  }

  const quote = quoteData.data;

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'expired':
        return 'default';
      default:
        return 'info';
    }
  };

  const handleOptionSelected = (optionId: string) => {
    // Recharger les données du devis
    refetch();
  };

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/quotes')}
          sx={{ textDecoration: 'none' }}
        >
          Tous les Devis
        </Link>
        <Typography color="text.primary">
          Devis {quote.quoteNumber}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/quotes')}
            variant="outlined"
          >
            Retour
          </Button>
          <Box>
            <Typography variant="h4" component="h1">
              Devis {quote.quoteNumber}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Créé le {formatDate(quote.createdAt)}
            </Typography>
          </Box>
        </Box>
        
        <Chip
          label={quote.status}
          color={getStatusColor(quote.status)}
          icon={<Description />}
        />
      </Box>

      {/* Informations du devis */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Informations du devis
        </Typography>
        
        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={3}>
          {/* Client */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
              Client
            </Typography>
            <Typography variant="body1">
              {quote.customer?.name || 'N/A'}
            </Typography>
            {quote.customer?.emails && quote.customer.emails.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                {quote.customer.emails[0]}
              </Typography>
            )}
          </Box>

          {/* Expédition */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              <LocalShipping sx={{ mr: 1, verticalAlign: 'middle' }} />
              Expédition
            </Typography>
            <Typography variant="body1">
              {quote.shipment?.origin?.location || 'N/A'} → {quote.shipment?.destination?.location || 'N/A'}
            </Typography>
            {quote.shipment?.cargo && (
              <Typography variant="body2" color="text.secondary">
                {quote.shipment.cargo.description}
              </Typography>
            )}
          </Box>

          {/* Dates */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
              Dates
            </Typography>
            <Typography variant="body1">
              Créé : {formatDate(quote.createdAt)}
            </Typography>
            {quote.expiresAt && (
              <Typography variant="body2" color="text.secondary">
                Expire : {formatDate(quote.expiresAt)}
              </Typography>
            )}
          </Box>

          {/* Total */}
          {quote.selectedOption && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <Euro sx={{ mr: 1, verticalAlign: 'middle' }} />
                Total sélectionné
              </Typography>
              <Typography variant="h6" color="primary">
                {formatCurrency(quote.selectedOption.totals?.grandTotal || 0, quote.selectedOption.currency)}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Sélecteur d'options */}
      <Paper sx={{ p: 3 }}>
        <QuoteOptionSelector
          quote={quote}
          onOptionSelected={handleOptionSelected}
        />
      </Paper>
    </Box>
  );
};

export default QuoteDetails;
