import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  ContentCopy as DuplicateIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  AssignmentTurnedIn as ValidateIcon
} from '@mui/icons-material';
import { getQuoteOffer } from '@features/offer/api/sdk.gen';

interface QuoteOptionsManagerProps {
  quoteId: string;
  onOptionSelected?: (optionId: string) => void;
  onAddNewOption?: () => void;
  onDuplicateOption?: (optionId: string) => void;
  onEditOption?: (optionId: string) => void;
}

interface QuoteOption {
  optionId: string;
  description: string;
  haulage?: any;
  seaFreight?: any;
  miscellaneous?: any[];
  totals?: {
    amount: number;
    currency: string;
  };
  validUntil: Date;
  isPreferred?: boolean;
}

interface QuoteData {
  id: string;
  options: QuoteOption[];
  status: string;
  clientNumber?: string;
  createdAt: Date;
}

const QuoteOptionsManager: React.FC<QuoteOptionsManagerProps> = ({
  quoteId,
  onOptionSelected,
  onAddNewOption,
  onDuplicateOption,
  onEditOption
}) => {
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [viewOptionDialog, setViewOptionDialog] = useState(false);
  const [currentViewOption, setCurrentViewOption] = useState<QuoteOption | null>(null);

  // Charger les données du devis
  useEffect(() => {
    const loadQuoteData = async () => {
      try {
        setLoading(true);
        const response = await getQuoteOffer({ path: { id: quoteId } });
        console.log('[QuoteOptionsManager] Données du devis chargées:', response);
        setQuoteData(response as any);
      } catch (err: any) {
        console.error('[QuoteOptionsManager] Erreur lors du chargement:', err);
        setError(`Erreur lors du chargement: ${err.message || 'Erreur inconnue'}`);
      } finally {
        setLoading(false);
      }
    };

    if (quoteId) {
      loadQuoteData();
    }
  }, [quoteId]);

  // Gérer la sélection d'une option
  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    if (onOptionSelected) {
      onOptionSelected(optionId);
    }
  };

  // Ouvrir le dialogue de visualisation d'option
  const handleViewOption = (option: QuoteOption) => {
    setCurrentViewOption(option);
    setViewOptionDialog(true);
  };

  // Formater le montant
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'EUR'
    }).format(amount || 0);
  };

  // Formater la date
  const formatDate = (date: Date | string) => {
    if (!date) return 'Non défini';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Chargement des options du devis...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!quoteData) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        Aucune donnée trouvée pour ce devis
      </Alert>
    );
  }

  const { options, status, clientNumber, createdAt } = quoteData;
  const canAddMoreOptions = options.length < 3;

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête du devis */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          📋 Devis {quoteId}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Client</Typography>
            <Typography variant="body1" fontWeight="600">
              {clientNumber || 'Non défini'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Statut</Typography>
            <Chip 
              label={status} 
              color={status === 'Active' ? 'success' : 'default'}
              size="small"
              sx={{ color: 'white', bgcolor: status === 'Active' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)' }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Créé le</Typography>
            <Typography variant="body1">
              {formatDate(createdAt)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Actions principales */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Options du Devis ({options.length}/3)
        </Typography>
        
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onAddNewOption}
            disabled={!canAddMoreOptions}
          >
            Ajouter Option
          </Button>
          
          {!canAddMoreOptions && (
            <Chip 
              label="Limite atteinte" 
              color="warning" 
              variant="outlined"
              size="small"
            />
          )}
        </Stack>
      </Box>

      {/* Liste des options */}
      <Grid container spacing={3}>
        {options.map((option, index) => (
          <Grid item xs={12} md={6} lg={4} key={option.optionId}>
            <Card 
              variant={selectedOption === option.optionId ? 'elevation' : 'outlined'}
              sx={{ 
                height: '100%',
                border: selectedOption === option.optionId ? '2px solid #1976d2' : undefined,
                position: 'relative'
              }}
            >
              {/* Badge option préférée */}
              {option.isPreferred && (
                <Box sx={{
                  position: 'absolute',
                  top: -10,
                  right: 10,
                  bgcolor: '#4caf50',
                  color: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  zIndex: 1
                }}>
                  ⭐ Préférée
                </Box>
              )}

              <CardContent sx={{ pb: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Option {index + 1}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '3em' }}>
                  {option.description || 'Aucune description'}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Détails de l'option */}
                <Stack spacing={1} sx={{ mb: 2 }}>
                  {option.haulage && (
                    <Typography variant="body2">
                      🚛 Transport: {option.haulage.haulierName}
                    </Typography>
                  )}
                  
                  {option.seaFreight && (
                    <Typography variant="body2">
                      🚢 Maritime: {option.seaFreight.carrierName}
                    </Typography>
                  )}
                  
                  {option.miscellaneous && option.miscellaneous.length > 0 && (
                    <Typography variant="body2">
                      📦 Services: {option.miscellaneous.length} service(s)
                    </Typography>
                  )}
                </Stack>

                {/* Total */}
                {option.totals && (
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'grey.50', 
                    borderRadius: 1, 
                    textAlign: 'center',
                    mb: 2
                  }}>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {formatAmount(option.totals.amount, option.totals.currency)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total de l'option
                    </Typography>
                  </Box>
                )}

                {/* Actions */}
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  <Button
                    size="small"
                    variant={selectedOption === option.optionId ? 'contained' : 'outlined'}
                    startIcon={<ValidateIcon />}
                    onClick={() => handleOptionSelect(option.optionId)}
                    sx={{ flex: 1, minWidth: '80px' }}
                  >
                    {selectedOption === option.optionId ? 'Sélectionnée' : 'Sélectionner'}
                  </Button>
                  
                  <Tooltip title="Voir les détails">
                    <IconButton
                      size="small"
                      onClick={() => handleViewOption(option)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Modifier">
                    <IconButton
                      size="small"
                      onClick={() => onEditOption?.(option.optionId)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Dupliquer">
                    <IconButton
                      size="small"
                      onClick={() => onDuplicateOption?.(option.optionId)}
                      disabled={!canAddMoreOptions}
                    >
                      <DuplicateIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>

                {/* Validité */}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Valide jusqu'au: {formatDate(option.validUntil)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Message si aucune option */}
      {options.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aucune option créée pour ce devis
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Commencez par créer la première option en utilisant le bouton "Ajouter Option"
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onAddNewOption}
          >
            Créer la Première Option
          </Button>
        </Paper>
      )}

      {/* Dialogue de visualisation d'option */}
      <Dialog
        open={viewOptionDialog}
        onClose={() => setViewOptionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Détails de l'Option {currentViewOption?.optionId}
        </DialogTitle>
        <DialogContent>
          {currentViewOption && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {currentViewOption.description}
              </Typography>
              
              <Grid container spacing={3}>
                {currentViewOption.haulage && (
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Transport Routier
                      </Typography>
                      <Typography>Transporteur: {currentViewOption.haulage.haulierName}</Typography>
                      <Typography>Prix: {formatAmount(currentViewOption.haulage.unitTariff, currentViewOption.haulage.currency)}</Typography>
                    </Paper>
                  </Grid>
                )}
                
                {currentViewOption.seaFreight && (
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Transport Maritime
                      </Typography>
                      <Typography>Transporteur: {currentViewOption.seaFreight.carrierName}</Typography>
                      <Typography>Transit: {currentViewOption.seaFreight.transitTimeDays} jours</Typography>
                      <Typography>Fréquence: {currentViewOption.seaFreight.frequency}</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
              
              {currentViewOption.totals && (
                <Box sx={{ mt: 3, p: 3, bgcolor: 'primary.main', color: 'white', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold">
                    {formatAmount(currentViewOption.totals.amount, currentViewOption.totals.currency)}
                  </Typography>
                  <Typography variant="h6">
                    Total de l'Option
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOptionDialog(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuoteOptionsManager;
