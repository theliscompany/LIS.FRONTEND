import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
  Card,
  CardContent,
  FormControlLabel,
  RadioGroup,
  Radio,
  Divider,
  InputAdornment
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Percent as PercentIcon,
  EuroSymbol as EuroIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { putApiQuoteOfferDraftById } from '../api';

interface QuoteFinalConfigEditorProps {
  quote: any;
  onSave: (updatedQuote: any) => void;
  onCancel: () => void;
  disabled?: boolean;
}

const QuoteFinalConfigEditor: React.FC<QuoteFinalConfigEditorProps> = ({
  quote,
  onSave,
  onCancel,
  disabled = false
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [editedQuote, setEditedQuote] = useState(quote);
  const [isSaving, setIsSaving] = useState(false);

  // États pour la configuration finale
  const [assignedTo, setAssignedTo] = useState('');
  const [marginType, setMarginType] = useState<'percentage' | 'fixed'>('percentage');
  const [marginValue, setMarginValue] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [margin, setMargin] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [paymentConditions, setPaymentConditions] = useState('À 30 jours');
  const [deliveryDelay, setDeliveryDelay] = useState('À définir');
  const [clientComment, setClientComment] = useState('');
  const [internalNote, setInternalNote] = useState('');

  // Options pour les dropdowns
  const assigneeOptions = [
    'Sélectionner un assigné...',
    'Jean Dupont',
    'Marie Martin', 
    'Pierre Durand',
    'Sophie Lefebvre'
  ];

  const paymentConditionsOptions = [
    'À 30 jours',
    'À 60 jours', 
    'À réception',
    'Comptant',
    'À 15 jours'
  ];

  const deliveryDelayOptions = [
    'À définir',
    'Immédiat',
    '24-48h',
    '1 semaine',
    '2 semaines',
    '1 mois'
  ];

  useEffect(() => {
    if (quote) {
      // Initialiser avec les données existantes du devis
      setAssignedTo(quote.assignedTo || '');
      setMarginType(quote.marginType || 'percentage');
      setMarginValue(quote.marginValue || 0);
      setCostPrice(quote.costPrice || calculateCostPrice());
      setPaymentConditions(quote.paymentConditions || 'À 30 jours');
      setDeliveryDelay(quote.deliveryDelay || 'À définir');
      setClientComment(quote.comment || '');
      setInternalNote(quote.internalComment || '');
    }
  }, [quote]);

  const calculateCostPrice = () => {
    // Calculer le prix de revient basé sur les options du devis
    if (!quote?.options?.length) return 0;
    
    return quote.options.reduce((total: number, option: any) => {
      const haulageTotal = option.haulage?.unitTariff || 0;
      const seaFreightTotal = option.seaFreight?.containers?.reduce((sum: number, container: any) => 
        sum + (container.unitPrice || 0) * (container.quantity || 0), 0) || 0;
      const miscTotal = option.miscellaneous?.reduce((sum: number, misc: any) => 
        sum + (misc.price || 0), 0) || 0;
      
      return total + haulageTotal + seaFreightTotal + miscTotal;
    }, 0);
  };

  useEffect(() => {
    // Calculer automatiquement la marge et le prix de vente
    const calculatedCostPrice = costPrice || calculateCostPrice();
    let calculatedMargin = 0;
    let calculatedSalePrice = 0;

    if (marginType === 'percentage') {
      calculatedMargin = (calculatedCostPrice * marginValue) / 100;
      calculatedSalePrice = calculatedCostPrice + calculatedMargin;
    } else {
      calculatedMargin = marginValue;
      calculatedSalePrice = calculatedCostPrice + marginValue;
    }

    setMargin(calculatedMargin);
    setSalePrice(calculatedSalePrice);
  }, [costPrice, marginType, marginValue]);

  const handleFieldChange = (field: string, value: any) => {
    setEditedQuote((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const updatedQuote = {
        ...editedQuote,
        assignedTo,
        marginType,
        marginValue,
        costPrice,
        margin,
        salePrice,
        paymentConditions,
        deliveryDelay,
        comment: clientComment,
        internalComment: internalNote
      };

      // Appel API pour sauvegarder
      await putApiQuoteOfferDraftById({
        path: { id: quote.id },
        body: updatedQuote
      });

      enqueueSnackbar('Configuration finale sauvegardée avec succès', { variant: 'success' });
      onSave(updatedQuote);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      enqueueSnackbar('Erreur lors de la sauvegarde', { variant: 'warning' });
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <Box sx={{ 
      p: 4,
      background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.02) 0%, rgba(255, 152, 0, 0.02) 100%)',
      minHeight: '100vh'
    }}>
      {/* Header moderne avec gradient */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        p: 3,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        animation: 'fadeInUp 0.6s ease-out'
      }}>
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            💰 Configuration Finale
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Assignation, marge bénéficiaire et conditions commerciales - Devis #{quote?.quoteOfferNumber}
          </Typography>
          {quote?.clientNumber && (
            <Typography variant="body2" sx={{ 
              mt: 0.5,
              color: '#ff9800',
              fontWeight: '500'
            }}>
              👤 Client: {quote.clientNumber} | 📧 {quote.emailUser}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={onCancel}
            disabled={disabled || isSaving}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              px: 3,
              py: 1.5,
              fontWeight: '600',
              border: '2px solid #ff9800',
              color: '#ff9800',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(255, 152, 0, 0.3)',
                borderColor: '#ff9800',
                backgroundColor: 'rgba(255, 152, 0, 0.05)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={disabled || isSaving}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              px: 3,
              py: 1.5,
              fontWeight: '600',
              background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4)',
                background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)'
              },
              '&:disabled': {
                background: 'linear-gradient(135deg, #bdbdbd 0%, #9e9e9e 100%)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={4}>
        {/* Section Assignation */}
        <Grid item xs={12}>
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            animation: 'fadeInUp 0.8s ease-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 16px 48px rgba(33, 150, 243, 0.15)'
            },
            transition: 'all 0.3s ease'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 3,
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <PersonIcon sx={{ mr: 1, color: '#2196f3' }} />
                👤 Assigné à
              </Typography>
              <FormControl fullWidth disabled={disabled}>
                <InputLabel>Sélectionner un assigné...</InputLabel>
                <Select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  label="Sélectionner un assigné..."
                >
                  {assigneeOptions.map((option, index) => (
                    <MenuItem key={index} value={option} disabled={index === 0}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Section Marge Bénéficiaire */}
        <Grid item xs={12}>
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            animation: 'fadeInUp 1.0s ease-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 16px 48px rgba(255, 152, 0, 0.15)'
            },
            transition: 'all 0.3s ease'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 3,
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <MoneyIcon sx={{ mr: 1, color: '#ff9800' }} />
                💰 Marge bénéficiaire
              </Typography>

              <Grid container spacing={3}>
                {/* Type de marge */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: '600' }}>
                    Type de marge
                  </Typography>
                  <RadioGroup
                    row
                    value={marginType}
                    onChange={(e) => setMarginType(e.target.value as 'percentage' | 'fixed')}
                  >
                    <FormControlLabel 
                      value="percentage" 
                      control={<Radio sx={{ color: '#ff9800' }} />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PercentIcon sx={{ mr: 1, color: '#ff9800' }} />
                          Pourcentage (%)
                        </Box>
                      }
                    />
                    <FormControlLabel 
                      value="fixed" 
                      control={<Radio sx={{ color: '#ff9800' }} />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <EuroIcon sx={{ mr: 1, color: '#ff9800' }} />
                          Montant fixe (€)
                        </Box>
                      }
                    />
                  </RadioGroup>
                </Grid>

                {/* Champ de saisie de la marge */}
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Marge"
                    type="number"
                    value={marginValue}
                    onChange={(e) => setMarginValue(Number(e.target.value))}
                    disabled={disabled}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {marginType === 'percentage' ? '%' : '€'}
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#ff9800'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#ff9800'
                        }
                      }
                    }}
                  />
                </Grid>

                {/* Calculs automatiques */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ 
                        textAlign: 'center',
                        p: 2,
                        background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(25, 118, 210, 0.1) 100%)',
                        borderRadius: 2,
                        border: '1px solid rgba(33, 150, 243, 0.2)'
                      }}>
                        <Typography variant="body2" color="text.secondary">
                          Prix de revient
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                          {formatCurrency(costPrice || calculateCostPrice())}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ 
                        textAlign: 'center',
                        p: 2,
                        background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(245, 124, 0, 0.1) 100%)',
                        borderRadius: 2,
                        border: '1px solid rgba(255, 152, 0, 0.2)'
                      }}>
                        <Typography variant="body2" color="text.secondary">
                          Marge : {formatCurrency(margin)} ({marginType === 'percentage' ? `${marginValue}%` : 'fixe'})
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                          {formatCurrency(margin)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ 
                        textAlign: 'center',
                        p: 2,
                        background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(56, 142, 60, 0.1) 100%)',
                        borderRadius: 2,
                        border: '1px solid rgba(76, 175, 80, 0.2)'
                      }}>
                        <Typography variant="body2" color="text.secondary">
                          Prix de vente
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                          {formatCurrency(salePrice)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Section Conditions commerciales */}
        <Grid item xs={12}>
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            animation: 'fadeInUp 1.2s ease-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 16px 48px rgba(156, 39, 176, 0.15)'
            },
            transition: 'all 0.3s ease'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 3,
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                📋 Conditions commerciales
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth disabled={disabled}>
                    <InputLabel>Conditions de paiement</InputLabel>
                    <Select
                      value={paymentConditions}
                      onChange={(e) => setPaymentConditions(e.target.value)}
                      label="Conditions de paiement"
                    >
                      {paymentConditionsOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth disabled={disabled}>
                    <InputLabel>Délais de livraison</InputLabel>
                    <Select
                      value={deliveryDelay}
                      onChange={(e) => setDeliveryDelay(e.target.value)}
                      label="Délais de livraison"
                    >
                      {deliveryDelayOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Section Commentaires */}
        <Grid item xs={12}>
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            animation: 'fadeInUp 1.4s ease-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 16px 48px rgba(76, 175, 80, 0.15)'
            },
            transition: 'all 0.3s ease'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 3,
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                💬 Commentaires
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Commentaire client (optionnel)"
                    value={clientComment}
                    onChange={(e) => setClientComment(e.target.value)}
                    multiline
                    rows={4}
                    fullWidth
                    disabled={disabled}
                    helperText="Commentaire visible par le client"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#4caf50'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#4caf50'
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Note interne (optionnel)"
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    multiline
                    rows={3}
                    fullWidth
                    disabled={disabled}
                    helperText="Note interne, non visible par le client"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#4caf50'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#4caf50'
                        }
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Ajout des keyframes globales pour les animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Box>
  );
};

export default QuoteFinalConfigEditor;