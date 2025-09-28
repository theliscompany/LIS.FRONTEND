import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Alert,
  AlertTitle,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Euro as EuroIcon,
  LocalShipping as LocalShippingIcon,
  DirectionsBoat as DirectionsBoatIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import type { DraftQuoteForm } from '../types';
import { calculateTotalWithMargin, calculateOptionBaseTotal } from '../schema';

interface QuotePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formData: DraftQuoteForm;
  isCreating?: boolean;
  onQuoteCreated?: () => void; // Callback pour rafraîchir la liste des devis
}

const QuotePreviewDialog: React.FC<QuotePreviewDialogProps> = ({
  open,
  onClose,
  onConfirm,
  formData,
  isCreating = false,
  onQuoteCreated
}) => {
  // Calculer les données du devis à partir du formulaire
  const quotePreview = useMemo(() => {
    // Les données du wizard sont dans formData.basics
    const basics = formData.basics;
    const customer = basics?.client;
    const shipment = {
      origin: basics?.origin,
      destination: basics?.destination,
      mode: basics?.cargoType,
      requestedDeparture: basics?.requestedDeparture
    };
    const currentOption = formData.currentOption;
    const existingOptions = formData.existingOptions || [];

    // Calculer le total général avec marges pour toutes les options existantes
    const grandTotal = existingOptions.reduce((total, option) => {
      const baseTotal = calculateOptionBaseTotal(option);
      const totalWithMargin = calculateTotalWithMargin(baseTotal, option.margin);
      return total + totalWithMargin;
    }, 0);

    return {
      customer,
      shipment,
      option: currentOption, // Option actuelle (si elle existe)
      existingOptions,
      summary: {
        totalOptions: existingOptions.length,
        estimatedTotal: grandTotal,
        currency: basics?.currency || 'EUR'
      }
    };
  }, [formData]);

  const handleConfirm = () => {
    onConfirm();
    // Appeler le callback de rafraîchissement si fourni
    if (onQuoteCreated) {
      onQuoteCreated();
    }
    onClose();
  };

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non spécifié';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  };

  const formatDateWithTime = (dateString?: string) => {
    if (!dateString) return 'Non spécifié';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Date invalide';
    }
  };

  // Services inclus standard
  const includedServices = [
    'Transport routier (ramassage conteneur vide, livraison port)',
    'Transport maritime (réservation navire)',
    'Formalités douanières export et documentation import',
    'Services administratifs (coordination, BL, suivi dossier)'
  ];

  // Conditions standard
  const conditions = [
    'Validité de l\'offre : 15 jours',
    'Acompte conditionné par le score fiabilité',
    'Solde : avant remise des documents originaux (BL, CMR, etc.)',
    'CGV jointes (acceptation obligatoire)',
    'Délais soumis à disponibilité navire et formalités douanières'
  ];

  // Notes importantes
  const importantNotes = [
    'Les surcharges exceptionnelles (congestion portuaire, stockage prolongé, surestaries/démurrage) sont à charge du client.',
    'CODI BUSINESS agit en qualité de transitaire et n\'est pas responsable du conteneur une fois remis à la compagnie maritime.',
    'Un contrat de responsabilité personnelle est obligatoire pour les particuliers.'
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '12px 12px 0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pr: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VisibilityIcon />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Aperçu du Devis
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ p: 4 }}>
          {/* Informations Client */}
          <Card sx={{ mb: 4, borderRadius: 2, border: '2px solid #e3f2fd' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon />
                Informations Client
              </Typography>
              
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Client</TableCell>
                      <TableCell>{quotePreview.customer?.companyName || quotePreview.customer?.contactFullName || 'Non spécifié'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Contact</TableCell>
                      <TableCell>{quotePreview.customer?.contactFullName || 'Non spécifié'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Email</TableCell>
                      <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon fontSize="small" color="primary" />
                        {quotePreview.customer?.email || 'Non spécifié'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Téléphone/WhatsApp</TableCell>
                      <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon fontSize="small" color="primary" />
                        {quotePreview.customer?.phone || 'Non spécifié'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Adresse de chargement</TableCell>
                      <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HomeIcon fontSize="small" color="primary" />
                        {quotePreview.shipment?.origin?.city && quotePreview.shipment?.origin?.country 
                          ? `${quotePreview.shipment.origin.city}, ${quotePreview.shipment.origin.country}`
                          : 'Non spécifié'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Destination</TableCell>
                      <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon fontSize="small" color="primary" />
                        {quotePreview.shipment?.destination?.city && quotePreview.shipment?.destination?.country 
                          ? `${quotePreview.shipment.destination.city}, ${quotePreview.shipment.destination.country}`
                          : 'Non spécifié'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Type de marchandise
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {quotePreview.shipment?.mode || 'Non spécifié'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Date souhaitée d'expédition
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon fontSize="small" color="primary" />
                    {formatDate(quotePreview.shipment?.requestedDeparture)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Prestations incluses */}
          <Card sx={{ mb: 4, borderRadius: 2, border: '2px solid #e8f5e8' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#2e7d32', display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon />
                Prestations incluses
              </Typography>
              <Stack spacing={1}>
                {includedServices.map((service, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon fontSize="small" color="success" />
                    <Typography variant="body1">{service}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Proposition tarifaire */}
          <Card sx={{ mb: 4, borderRadius: 2, border: '2px solid #fff3e0' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#f57c00', display: 'flex', alignItems: 'center', gap: 1 }}>
                <EuroIcon />
                Proposition tarifaire - {quotePreview.summary.totalOptions} option{quotePreview.summary.totalOptions > 1 ? 's' : ''}
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Option</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Départ navire</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Transit (ETA)</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Détail coût (€)</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Total HTVA</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Options existantes */}
                    {quotePreview.existingOptions.map((option, index) => {
                      // Calculer le total avec marge bénéficiaire
                      const optionTotal = calculateTotalWithMargin(calculateOptionBaseTotal(option), option.margin);

                      return (
                        <TableRow key={`existing-${index}`}>
                          <TableCell sx={{ fontWeight: 600 }}>
                            Option {index + 1}
                          </TableCell>
                          <TableCell>
                            {option.name || `Option ${index + 1}`}
                            {option.description && (
                              <Typography variant="body2" color="text.secondary">
                                {option.description}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {formatDateWithTime(option.departureDate)}
                          </TableCell>
                          <TableCell>
                            {formatDateWithTime(option.arrivalDate)}
                            {option.transitDays && (
                              <Typography variant="body2" color="text.secondary">
                                ({option.transitDays} j)
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              Maritime
                            </Typography>
                            <Typography variant="body2">
                              Routier
                            </Typography>
                            {option.services && option.services.length > 0 && (
                              <Typography variant="body2">
                                Services
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatCurrency(optionTotal, 'EUR')}
                          </TableCell>
                        </TableRow>
                      );
                    })}

                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Conditions */}
          <Card sx={{ mb: 4, borderRadius: 2, border: '2px solid #fce4ec' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#c2185b', display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon />
                Conditions
              </Typography>
              <Stack spacing={1}>
                {conditions.map((condition, index) => (
                  <Typography key={index} variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography component="span" sx={{ fontWeight: 600, minWidth: '20px' }}>
                      •
                    </Typography>
                    {condition}
                  </Typography>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Notes importantes */}
          <Card sx={{ mb: 3, borderRadius: 2, border: '2px solid #ffebee' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#d32f2f', display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon />
                Notes importantes
              </Typography>
              <Stack spacing={1}>
                {importantNotes.map((note, index) => (
                  <Typography key={index} variant="body1" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Typography component="span" sx={{ fontWeight: 600, minWidth: '20px' }}>
                      •
                    </Typography>
                    {note}
                  </Typography>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Alertes */}
          <Box sx={{ mb: 3 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <AlertTitle>Note</AlertTitle>
              Ceci est un aperçu basé sur les informations saisies. Les prix finaux peuvent varier selon les conditions du marché et les validations finales.
            </Alert>
            
            {quotePreview.existingOptions && quotePreview.existingOptions.length > 0 && (
              <Alert severity="success">
                <AlertTitle>Prêt pour la création</AlertTitle>
                Le devis contient {quotePreview.existingOptions.length} option{quotePreview.existingOptions.length > 1 ? 's' : ''} configurée{quotePreview.existingOptions.length > 1 ? 's' : ''}.
              </Alert>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          onClick={onClose}
          disabled={isCreating}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          Annuler
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={isCreating}
          sx={{
            background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { background: 'linear-gradient(135deg, #1b5e20 0%, #388e3c 100%)' }
          }}
        >
          {isCreating ? <CircularProgress size={24} color="inherit" /> : 'Confirmer & Créer le Devis'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuotePreviewDialog;