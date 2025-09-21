import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
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
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import { putApiDraftQuotesById } from '../api';
// import type { QuoteOfferStatus, ClientApprovalStatus } from '../api/types.gen';

interface QuoteGeneralInfoEditorProps {
  quote: any;
  onSave: (updatedQuote: any) => void;
  onCancel: () => void;
  disabled?: boolean;
}

const QuoteGeneralInfoEditor: React.FC<QuoteGeneralInfoEditorProps> = ({
  quote,
  onSave,
  onCancel,
  disabled = false
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [editedQuote, setEditedQuote] = useState(quote);
  const [isSaving, setIsSaving] = useState(false);

  const statusOptions = [
    { value: 'DRAFT', label: 'Brouillon' },
    { value: 'PENDING_APPROVAL', label: 'En attente d\'approbation' },
    { value: 'APPROVED', label: 'Approuvé' },
    { value: 'SENT_TO_CLIENT', label: 'Envoyé au client' },
    { value: 'Pending', label: 'En attente client' },
    { value: 'Accepted', label: 'Accepté' },
    { value: 'Rejected', label: 'Rejeté' },
    { value: 'NoResponse', label: 'Aucune réponse' }
  ];

  const clientApprovalOptions = [
    { value: 'Pending', label: 'En attente' },
    { value: 'Accepted', label: 'Accepté' },
    { value: 'Rejected', label: 'Rejeté' },
    { value: 'NoResponse', label: 'Aucune réponse' }
  ];

  const handleFieldChange = (field: string, value: any) => {
    setEditedQuote(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const payload = {
        ...editedQuote,
        // Convertir les dates en ISO string si nécessaire
        expirationDate: editedQuote.expirationDate ? new Date(editedQuote.expirationDate).toISOString() : null,
        created: editedQuote.created ? new Date(editedQuote.created).toISOString() : null
      };

      await putApiDraftQuotesById({
        path: { id: quote.id },
        body: payload
      });

      enqueueSnackbar('Informations du devis sauvegardées avec succès', { variant: 'success' });
      onSave(payload);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      enqueueSnackbar('Erreur lors de la sauvegarde des informations', { variant: 'warning' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <Box sx={{ 
        p: 4,
        background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.02) 0%, rgba(0, 151, 167, 0.02) 100%)',
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
                background: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              📝 Informations Générales
            </Typography>
                      <Typography variant="body2" color="text.secondary">
            Configuration et métadonnées du Devis #{quote.quoteOfferNumber}
          </Typography>
          {quote.clientNumber && (
            <Typography variant="body2" sx={{ 
              mt: 0.5,
              color: '#00bcd4',
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
          {/* Informations principales */}
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
                boxShadow: '0 16px 48px rgba(0, 188, 212, 0.15)'
              },
              transition: 'all 0.3s ease'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 3,
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  🏢 Informations principales
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Numéro de demande"
                      value={editedQuote.requestQuoteId || ''}
                      onChange={(e) => handleFieldChange('requestQuoteId', e.target.value)}
                      fullWidth
                      disabled={disabled}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Numéro de devis"
                      value={editedQuote.quoteOfferNumber || ''}
                      onChange={(e) => handleFieldChange('quoteOfferNumber', Number(e.target.value))}
                      type="number"
                      fullWidth
                      disabled={disabled}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Numéro client"
                      value={editedQuote.clientNumber || ''}
                      onChange={(e) => handleFieldChange('clientNumber', e.target.value)}
                      fullWidth
                      disabled={disabled}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Email utilisateur"
                      value={editedQuote.emailUser || ''}
                      onChange={(e) => handleFieldChange('emailUser', e.target.value)}
                      type="email"
                      fullWidth
                      disabled={disabled}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Statuts */}
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
                  🚦 Statuts et Approbations
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth disabled={disabled}>
                      <InputLabel>Statut du devis</InputLabel>
                      <Select
                        value={editedQuote.status || 'DRAFT'}
                        onChange={(e) => handleFieldChange('status', e.target.value)}
                      >
                        {statusOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth disabled={disabled}>
                      <InputLabel>Approbation client</InputLabel>
                      <Select
                        value={editedQuote.clientApproval || 'Pending'}
                        onChange={(e) => handleFieldChange('clientApproval', e.target.value)}
                      >
                        {clientApprovalOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Option sélectionnée"
                      value={editedQuote.selectedOption || 0}
                      onChange={(e) => handleFieldChange('selectedOption', Number(e.target.value))}
                      type="number"
                      inputProps={{ min: 0, max: (editedQuote.options?.length || 1) - 1 }}
                      fullWidth
                      disabled={disabled}
                      helperText={`Option entre 0 et ${(editedQuote.options?.length || 1) - 1}`}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Dates */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Dates importantes
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Date d'expiration"
                      value={editedQuote.expirationDate ? new Date(editedQuote.expirationDate) : null}
                      onChange={(date) => handleFieldChange('expirationDate', date)}
                      disabled={disabled}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          helperText: "Date à laquelle le devis expire"
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Date de création"
                      value={editedQuote.created ? new Date(editedQuote.created) : null}
                      onChange={(date) => handleFieldChange('created', date)}
                      disabled={disabled}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          helperText: "Date de création du devis"
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Commentaires */}
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
                  💬 Commentaires et Notes
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Commentaire client"
                      value={editedQuote.comment || ''}
                      onChange={(e) => handleFieldChange('comment', e.target.value)}
                      multiline
                      rows={4}
                      fullWidth
                      disabled={disabled}
                      helperText="Commentaire visible par le client"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Commentaire interne"
                      value={editedQuote.internalComment || ''}
                      onChange={(e) => handleFieldChange('internalComment', e.target.value)}
                      multiline
                      rows={3}
                      fullWidth
                      disabled={disabled}
                      helperText="Commentaire interne, non visible par le client"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Informations de lecture seule */}
          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="h6" sx={{ mb: 1 }}>
                Informations de lecture seule
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>ID:</strong> {quote.id}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Nombre d'options:</strong> {quote.options?.length || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Dernière modification:</strong> {
                      quote.lastModified ? new Date(quote.lastModified).toLocaleString('fr-FR') : 'N/A'
                    }
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Créé par:</strong> {quote.createdBy || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Alert>
          </Grid>
        </Grid>
      </Box>

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
        
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </LocalizationProvider>
  );
};

export default QuoteGeneralInfoEditor;