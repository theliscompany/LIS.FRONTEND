import React, { useState } from 'react';
import {
  Box,

  Typography,
  Button,
  Grid,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,

  CircularProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  LocalShipping as LocalShippingIcon,
  DirectionsBoat as DirectionsBoatIcon,
  Inventory as InventoryIcon,

} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { fr } from 'date-fns/locale';
import { putApiDraftQuotesById } from '../api';


interface QuoteOptionsEditorProps {
  quote: any;
  onSave: (updatedQuote: any) => void;
  onCancel: () => void;
  disabled?: boolean;
}

interface EditingOption {
  index: number;
  data: any;
  isNew?: boolean;
}

const QuoteOptionsEditor: React.FC<QuoteOptionsEditorProps> = ({
  quote,
  onSave,
  onCancel,
  disabled = false
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [editedQuote, setEditedQuote] = useState(quote);
  const [editingOption, setEditingOption] = useState<EditingOption | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Currencies disponibles
  const currencies = ['EUR', 'USD', 'GBP', 'CAD', 'AUD'];
  
  // Container types
  const containerTypes = ['20\' Dry', '40\' Dry', '40\' HC', '45\' HC', '20\' Reefer', '40\' Reefer'];

  const formatCurrency = (amount: number, currency = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const calculateOptionTotals = (option: any) => {
    const haulageTotal = option.haulage?.unitTariff || 0;
    const seafreightTotal = option.seaFreight?.containers?.reduce((sum: number, container: any) => 
      sum + (container.unitPrice * container.quantity), 0) || 0;
    const miscellaneousTotal = option.miscellaneous?.reduce((sum: number, misc: any) => 
      sum + misc.price, 0) || 0;
    const grandTotal = haulageTotal + seafreightTotal + miscellaneousTotal;

    return {
      haulageTotal,
      seafreightTotal,
      miscellaneousTotal,
      grandTotal
    };
  };

  const handleStartEdit = (index: number) => {
    setEditingOption({
      index,
      data: JSON.parse(JSON.stringify(editedQuote.options[index])),
      isNew: false
    });
  };

  const handleAddOption = () => {
    const newOption = {
      optionId: `option_${Date.now()}`,
      description: `Option ${editedQuote.options.length + 1}`,
      haulage: {
        haulierId: 0,
        haulierName: '',
        currency: 'EUR',
        unitTariff: 0,
        freeTime: 0,
        pickupAddress: {
          company: '',
          addressLine: '',
          city: '',
          postalCode: '',
          country: ''
        },
        deliveryPort: {
          portId: 0,
          portName: '',
          country: ''
        },
        comment: '',
        validUntil: new Date()
      },
      seaFreight: {
        seaFreightId: '',
        carrierName: '',
        carrierAgentName: '',
        departurePort: {
          portId: 0,
          portName: '',
          country: ''
        },
        destinationPort: {
          portId: 0,
          portName: '',
          country: ''
        },
        currency: 'EUR',
        transitTimeDays: 0,
        frequency: '',
        defaultContainer: '20\' Dry',
        containers: [],
        comment: '',
        validUntil: new Date()
      },
      miscellaneous: [],
      deliveryAddress: {
        company: '',
        addressLine: '',
        city: '',
        postalCode: '',
        country: ''
      },
      totals: {
        haulageTotal: 0,
        seafreightTotal: 0,
        miscellaneousTotal: 0,
        grandTotal: 0
      }
    };

    setEditingOption({
      index: editedQuote.options.length,
      data: newOption,
      isNew: true
    });
  };

  const handleSaveOption = () => {
    if (!editingOption) return;

    const updatedOptions = [...editedQuote.options];
    const totals = calculateOptionTotals(editingOption.data);
    editingOption.data.totals = totals;

    if (editingOption.isNew) {
      updatedOptions.push(editingOption.data);
    } else {
      updatedOptions[editingOption.index] = editingOption.data;
    }

    setEditedQuote((prev: any) => ({
      ...prev,
      options: updatedOptions
    }));

    setEditingOption(null);
    enqueueSnackbar('Option sauvegardée avec succès', { variant: 'success' });
  };

  const handleCancelEdit = () => {
    setEditingOption(null);
  };

  const handleDeleteOption = (index: number) => {
    setShowDeleteDialog(index);
  };

  const confirmDeleteOption = () => {
    if (showDeleteDialog === null) return;

    const updatedOptions = editedQuote.options.filter((_: any, i: number) => i !== showDeleteDialog);
    setEditedQuote((prev: any) => ({
      ...prev,
      options: updatedOptions
    }));

    setShowDeleteDialog(null);
    enqueueSnackbar('Option supprimée avec succès', { variant: 'success' });
  };

  const handleAddContainer = () => {
    if (!editingOption) return;

    const newContainer = {
      containerId: `container_${Date.now()}`,
      containerType: '20\' Dry',
      quantity: 1,
      unitPrice: 0
    };

    setEditingOption(prev => ({
      ...prev!,
      data: {
        ...prev!.data,
        seaFreight: {
          ...prev!.data.seaFreight,
          containers: [...(prev!.data.seaFreight.containers || []), newContainer]
        }
      }
    }));
  };

  const handleRemoveContainer = (containerIndex: number) => {
    if (!editingOption) return;

    setEditingOption(prev => ({
      ...prev!,
      data: {
        ...prev!.data,
        seaFreight: {
          ...prev!.data.seaFreight,
          containers: prev!.data.seaFreight.containers.filter((_: any, i: number) => i !== containerIndex)
        }
      }
    }));
  };

  const handleAddMiscellaneous = () => {
    if (!editingOption) return;

    const newMisc = {
      miscellaneousId: `misc_${Date.now()}`,
      supplierName: '',
      currency: 'EUR',
      serviceId: 0,
      serviceName: '',
      price: 0,
      validUntil: new Date()
    };

    setEditingOption(prev => ({
      ...prev!,
      data: {
        ...prev!.data,
        miscellaneous: [...(prev!.data.miscellaneous || []), newMisc]
      }
    }));
  };

  const handleRemoveMiscellaneous = (miscIndex: number) => {
    if (!editingOption) return;

    setEditingOption(prev => ({
      ...prev!,
      data: {
        ...prev!.data,
        miscellaneous: prev!.data.miscellaneous.filter((_: any, i: number) => i !== miscIndex)
      }
    }));
  };

  const handleSaveQuote = async () => {
    try {
      setIsSaving(true);

      const payload = {
        ...editedQuote,
        options: editedQuote.options.map((option: any) => ({
          ...option,
          totals: calculateOptionTotals(option)
        }))
      };

      await putApiDraftQuotesById({
        path: { id: quote.id },
        body: payload
      });

      enqueueSnackbar('Devis sauvegardé avec succès', { variant: 'success' });
      onSave(payload);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      enqueueSnackbar('Erreur lors de la sauvegarde du devis', { variant: 'error' });
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
              ⚙️ Édition des Options
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Devis #{quote.quoteOfferNumber} - {editedQuote.options.length} option{editedQuote.options.length > 1 ? 's' : ''}
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
              <CancelIcon sx={{ mr: 1 }} />
              Annuler
            </Button>
            <Button
              variant="contained"
              startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleSaveQuote}
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

        {/* Informations générales du voyage */}
        {editedQuote.options && editedQuote.options.length > 0 && editedQuote.options[0] && (
          <Box sx={{ 
            mb: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            p: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            animation: 'fadeInUp 0.6s ease-out'
          }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: '600',
                color: '#00bcd4',
                mb: 2,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              🗺️ Informations du voyage
            </Typography>
            <Grid container spacing={3}>
              {/* Transport Maritime */}
              {editedQuote.options[0].seaFreight?.departurePort && editedQuote.options[0].seaFreight?.destinationPort && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 2, 
                    background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(25, 118, 210, 0.05) 100%)',
                    borderRadius: 2,
                    border: '1px solid rgba(33, 150, 243, 0.1)'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: '600', color: '#2196f3', mb: 1 }}>
                      🚢 Trajet Maritime
                    </Typography>
                    <Typography variant="body2">
                      <strong>De:</strong> {editedQuote.options[0].seaFreight.departurePort.portName} ({editedQuote.options[0].seaFreight.departurePort.country})
                    </Typography>
                    <Typography variant="body2">
                      <strong>Vers:</strong> {editedQuote.options[0].seaFreight.destinationPort.portName} ({editedQuote.options[0].seaFreight.destinationPort.country})
                    </Typography>
                    <Typography variant="body2">
                      <strong>Transit:</strong> {editedQuote.options[0].seaFreight.transitTimeDays} jours
                    </Typography>
                  </Box>
                </Grid>
              )}

              {/* Transport Routier */}
              {editedQuote.options[0].haulage && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 2, 
                    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(56, 142, 60, 0.05) 100%)',
                    borderRadius: 2,
                    border: '1px solid rgba(76, 175, 80, 0.1)'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: '600', color: '#4caf50', mb: 1 }}>
                      🚛 Transport Routier
                    </Typography>
                    {editedQuote.options[0].haulage.pickupAddress && (
                      <Typography variant="body2">
                        <strong>Origine:</strong> {editedQuote.options[0].haulage.pickupAddress.city || editedQuote.options[0].haulage.pickupAddress.addressLine}, {editedQuote.options[0].haulage.pickupAddress.country}
                      </Typography>
                    )}
                    {editedQuote.options[0].haulage.deliveryPort && (
                      <Typography variant="body2">
                        <strong>Port de livraison:</strong> {editedQuote.options[0].haulage.deliveryPort.portName}, {editedQuote.options[0].haulage.deliveryPort.country}
                      </Typography>
                    )}
                    <Typography variant="body2">
                      <strong>Temps libre:</strong> {editedQuote.options[0].haulage.freeTime} jours
                    </Typography>
                    {editedQuote.options[0].haulage.distanceKm && (
                      <Typography variant="body2">
                        <strong>Distance:</strong> {editedQuote.options[0].haulage.distanceKm} km
                      </Typography>
                    )}
                  </Box>
                </Grid>
              )}

              {/* Adresse de livraison finale */}
              {editedQuote.options[0].deliveryAddress && (
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 2, 
                    background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.05) 0%, rgba(245, 124, 0, 0.05) 100%)',
                    borderRadius: 2,
                    border: '1px solid rgba(255, 152, 0, 0.1)'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: '600', color: '#ff9800', mb: 1 }}>
                      📍 Adresse de livraison finale
                    </Typography>
                    <Typography variant="body2">
                      {editedQuote.options[0].deliveryAddress.company && `${editedQuote.options[0].deliveryAddress.company}, `}
                      {editedQuote.options[0].deliveryAddress.addressLine}, {editedQuote.options[0].deliveryAddress.city} {editedQuote.options[0].deliveryAddress.postalCode}, {editedQuote.options[0].deliveryAddress.country}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* Options List avec style moderne */}
        <Box sx={{ 
          mb: 4,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          p: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          animation: 'fadeInUp 0.8s ease-out'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: '600',
                  color: '#00bcd4',
                  mb: 0.5
                }}
              >
                📋 Options du devis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {editedQuote.options.length} option{editedQuote.options.length > 1 ? 's' : ''} configurée{editedQuote.options.length > 1 ? 's' : ''}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddOption}
              disabled={disabled || editingOption !== null}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                px: 3,
                py: 1.5,
                fontWeight: '600',
                background: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0, 188, 212, 0.4)',
                  background: 'linear-gradient(135deg, #26c6da 0%, #00bcd4 100%)'
                },
                '&:disabled': {
                  background: 'linear-gradient(135deg, #bdbdbd 0%, #9e9e9e 100%)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Ajouter une option
            </Button>
          </Box>

          {editedQuote.options.map((option: any, index: number) => {
            const totals = calculateOptionTotals(option);
            const isSelected = index === editedQuote.selectedOption;

            return (
              <Accordion 
                key={index}
                defaultExpanded={isSelected}
                sx={{ 
                  mb: 3,
                  borderRadius: 3,
                  background: isSelected 
                    ? 'linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(25, 118, 210, 0.05) 100%)'
                    : 'rgba(255, 255, 255, 0.9)',
                  border: isSelected 
                    ? '2px solid #2196f3' 
                    : '1px solid rgba(0, 188, 212, 0.2)',
                  boxShadow: isSelected 
                    ? '0 8px 32px rgba(33, 150, 243, 0.15)'
                    : '0 4px 16px rgba(0, 0, 0, 0.05)',
                  '&:before': { display: 'none' },
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(0, 188, 212, 0.2)',
                    border: '1px solid rgba(0, 188, 212, 0.4)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon sx={{ color: '#00bcd4' }} />}
                  sx={{
                    background: isSelected 
                      ? 'linear-gradient(135deg, rgba(33, 150, 243, 0.08) 0%, rgba(25, 118, 210, 0.08) 100%)'
                      : 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '12px 12px 0 0',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.05) 0%, rgba(0, 151, 167, 0.05) 100%)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold',
                          mr: 2,
                          background: isSelected 
                            ? 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'
                            : 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}
                      >
                        🎯 Option {index + 1}
                      </Typography>
                      {isSelected && (
                        <Chip 
                          label="✨ Sélectionnée" 
                          sx={{
                            background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                            color: 'white',
                            fontWeight: '600',
                            mr: 2,
                            '& .MuiChip-icon': { color: 'white' }
                          }}
                          size="small" 
                        />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold',
                          background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          mr: 2
                        }}
                      >
                        💰 {formatCurrency(totals.grandTotal)}
                      </Typography>
                      <IconButton 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(index);
                        }}
                        disabled={disabled || editingOption !== null}
                        size="small"
                        sx={{
                          background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                          color: 'white',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #ffb74d 0%, #ff9800 100%)',
                            transform: 'scale(1.1)'
                          },
                          '&:disabled': {
                            background: '#bdbdbd',
                            color: '#757575'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOption(index);
                        }}
                        disabled={disabled || editingOption !== null || editedQuote.options.length <= 1}
                        size="small"
                        sx={{
                          background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                          color: 'white',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #ba68c8 0%, #9c27b0 100%)',
                            transform: 'scale(1.1)'
                          },
                          '&:disabled': {
                            background: '#bdbdbd',
                            color: '#757575'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    {/* Haulage */}
                    {option.haulage && (
                      <Grid item xs={12} md={6}>
                        <Card>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <LocalShippingIcon color="primary" sx={{ mr: 1 }} />
                              <Typography variant="h6">Transport routier</Typography>
                            </Box>
                            <Typography><strong>Transporteur:</strong> {option.haulage.haulierName}</Typography>
                            <Typography><strong>Tarif:</strong> {formatCurrency(option.haulage.unitTariff, option.haulage.currency)}</Typography>
                            <Typography><strong>Temps libre:</strong> {option.haulage.freeTime} jours</Typography>
                            {option.haulage.distanceKm && (
                              <Typography><strong>Distance:</strong> {option.haulage.distanceKm} km</Typography>
                            )}
                            {/* Trajet transport routier */}
                            {option.haulage.pickupAddress && (
                              <Typography><strong>Origine:</strong> {option.haulage.pickupAddress.city || option.haulage.pickupAddress.addressLine}, {option.haulage.pickupAddress.country}</Typography>
                            )}
                            {option.haulage.deliveryPort && (
                              <Typography><strong>Destination:</strong> {option.haulage.deliveryPort.portName}, {option.haulage.deliveryPort.country}</Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    )}

                    {/* SeaFreight */}
                    {option.seaFreight && (
                      <Grid item xs={12} md={6}>
                        <Card>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <DirectionsBoatIcon color="primary" sx={{ mr: 1 }} />
                              <Typography variant="h6">Transport maritime</Typography>
                            </Box>
                            <Typography><strong>Transporteur:</strong> {option.seaFreight.carrierName}</Typography>
                            <Typography><strong>Agent:</strong> {option.seaFreight.carrierAgentName}</Typography>
                            <Typography><strong>Transit:</strong> {option.seaFreight.transitTimeDays} jours</Typography>
                            {/* Trajet transport maritime */}
                            {option.seaFreight.departurePort && option.seaFreight.destinationPort && (
                              <Typography><strong>Trajet:</strong> {option.seaFreight.departurePort.portName} ({option.seaFreight.departurePort.country}) → {option.seaFreight.destinationPort.portName} ({option.seaFreight.destinationPort.country})</Typography>
                            )}
                            <Typography><strong>Fréquence:</strong> {option.seaFreight.frequency}</Typography>
                            <Typography><strong>Total Seafreight:</strong> {formatCurrency(totals.seafreightTotal, option.seaFreight.currency)}</Typography>
                            <Typography><strong>Conteneurs:</strong> {option.seaFreight.containers?.length || 0}</Typography>
                            {option.seaFreight.containers && option.seaFreight.containers.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                {option.seaFreight.containers.map((container: any, idx: number) => (
                                  <Typography key={idx} variant="body2" color="text.secondary">
                                    • {container.containerType}: {container.quantity}x {formatCurrency(container.unitPrice, option.seaFreight.currency)}
                                  </Typography>
                                ))}
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    )}

                    {/* Miscellaneous */}
                    {option.miscellaneous && option.miscellaneous.length > 0 && (
                      <Grid item xs={12}>
                        <Card>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <InventoryIcon color="primary" sx={{ mr: 1 }} />
                              <Typography variant="h6">Services divers ({option.miscellaneous.length})</Typography>
                            </Box>
                            {option.miscellaneous.map((misc: any, miscIndex: number) => (
                              <Typography key={miscIndex}>
                                • {misc.serviceName}: {formatCurrency(misc.price, misc.currency)}
                              </Typography>
                            ))}
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>

        {/* Editing Dialog */}
        <Dialog 
          open={editingOption !== null} 
          onClose={handleCancelEdit}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            {editingOption?.isNew ? 'Ajouter une option' : `Éditer l'option ${(editingOption?.index || 0) + 1}`}
          </DialogTitle>
          <DialogContent dividers>
            {editingOption && (
              <Box sx={{ minHeight: 400 }}>
                <Grid container spacing={3}>
                  {/* Description */}
                  <Grid item xs={12}>
                    <TextField
                      label="Description"
                      value={editingOption.data.description || ''}
                      onChange={(e) => setEditingOption(prev => ({
                        ...prev!,
                        data: { ...prev!.data, description: e.target.value }
                      }))}
                      fullWidth
                      required
                    />
                  </Grid>

                  {/* Haulage Section */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <LocalShippingIcon sx={{ mr: 1 }} />
                      Transport routier
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Nom du transporteur"
                          value={editingOption.data.haulage?.haulierName || ''}
                          onChange={(e) => setEditingOption(prev => ({
                            ...prev!,
                            data: {
                              ...prev!.data,
                              haulage: { ...prev!.data.haulage, haulierName: e.target.value }
                            }
                          }))}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                          <InputLabel>Devise</InputLabel>
                          <Select
                            value={editingOption.data.haulage?.currency || 'EUR'}
                            onChange={(e) => setEditingOption(prev => ({
                              ...prev!,
                              data: {
                                ...prev!.data,
                                haulage: { ...prev!.data.haulage, currency: e.target.value }
                              }
                            }))}
                          >
                            {currencies.map(currency => (
                              <MenuItem key={currency} value={currency}>{currency}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="Tarif unitaire"
                          type="number"
                          value={editingOption.data.haulage?.unitTariff || 0}
                          onChange={(e) => setEditingOption(prev => ({
                            ...prev!,
                            data: {
                              ...prev!.data,
                              haulage: { ...prev!.data.haulage, unitTariff: Number(e.target.value) }
                            }
                          }))}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="Distance (km)"
                          type="number"
                          value={editingOption.data.haulage?.distanceKm || ''}
                          onChange={(e) => setEditingOption(prev => ({
                            ...prev!,
                            data: {
                              ...prev!.data,
                              haulage: { ...prev!.data.haulage, distanceKm: Number(e.target.value) || undefined }
                            }
                          }))}
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* SeaFreight Section */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <DirectionsBoatIcon sx={{ mr: 1 }} />
                      Transport maritime
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Compagnie maritime"
                          value={editingOption.data.seaFreight?.carrierName || ''}
                          onChange={(e) => setEditingOption(prev => ({
                            ...prev!,
                            data: {
                              ...prev!.data,
                              seaFreight: { ...prev!.data.seaFreight, carrierName: e.target.value }
                            }
                          }))}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="Temps de transit (jours)"
                          type="number"
                          value={editingOption.data.seaFreight?.transitTimeDays || 0}
                          onChange={(e) => setEditingOption(prev => ({
                            ...prev!,
                            data: {
                              ...prev!.data,
                              seaFreight: { ...prev!.data.seaFreight, transitTimeDays: Number(e.target.value) }
                            }
                          }))}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="Fréquence"
                          value={editingOption.data.seaFreight?.frequency || ''}
                          onChange={(e) => setEditingOption(prev => ({
                            ...prev!,
                            data: {
                              ...prev!.data,
                              seaFreight: { ...prev!.data.seaFreight, frequency: e.target.value }
                            }
                          }))}
                          fullWidth
                        />
                      </Grid>

                      {/* Containers */}
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle1">Conteneurs</Typography>
                          <Button startIcon={<AddIcon />} onClick={handleAddContainer}>
                            Ajouter un conteneur
                          </Button>
                        </Box>
                        {editingOption.data.seaFreight?.containers?.map((container: any, containerIndex: number) => (
                          <Card key={containerIndex} sx={{ mb: 2 }}>
                            <CardContent>
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={3}>
                                  <FormControl fullWidth>
                                    <InputLabel>Type</InputLabel>
                                    <Select
                                      value={container.containerType || '20\' Dry'}
                                      onChange={(e) => {
                                        const updatedContainers = [...editingOption.data.seaFreight.containers];
                                        updatedContainers[containerIndex].containerType = e.target.value;
                                        setEditingOption(prev => ({
                                          ...prev!,
                                          data: {
                                            ...prev!.data,
                                            seaFreight: { ...prev!.data.seaFreight, containers: updatedContainers }
                                          }
                                        }));
                                      }}
                                    >
                                      {containerTypes.map(type => (
                                        <MenuItem key={type} value={type}>{type}</MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                  <TextField
                                    label="Quantité"
                                    type="number"
                                    value={container.quantity || 1}
                                    onChange={(e) => {
                                      const updatedContainers = [...editingOption.data.seaFreight.containers];
                                      updatedContainers[containerIndex].quantity = Number(e.target.value);
                                      setEditingOption(prev => ({
                                        ...prev!,
                                        data: {
                                          ...prev!.data,
                                          seaFreight: { ...prev!.data.seaFreight, containers: updatedContainers }
                                        }
                                      }));
                                    }}
                                    fullWidth
                                  />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                  <TextField
                                    label="Prix unitaire"
                                    type="number"
                                    value={container.unitPrice || 0}
                                    onChange={(e) => {
                                      const updatedContainers = [...editingOption.data.seaFreight.containers];
                                      updatedContainers[containerIndex].unitPrice = Number(e.target.value);
                                      setEditingOption(prev => ({
                                        ...prev!,
                                        data: {
                                          ...prev!.data,
                                          seaFreight: { ...prev!.data.seaFreight, containers: updatedContainers }
                                        }
                                      }));
                                    }}
                                    fullWidth
                                  />
                                </Grid>
                                <Grid item xs={12} md={2}>
                                  <IconButton 
                                    onClick={() => handleRemoveContainer(containerIndex)}
                                    color="secondary"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        ))}
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Miscellaneous Section */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                        <InventoryIcon sx={{ mr: 1 }} />
                        Services divers
                      </Typography>
                      <Button startIcon={<AddIcon />} onClick={handleAddMiscellaneous}>
                        Ajouter un service
                      </Button>
                    </Box>
                    {editingOption.data.miscellaneous?.map((misc: any, miscIndex: number) => (
                      <Card key={miscIndex} sx={{ mb: 2 }}>
                        <CardContent>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={4}>
                              <TextField
                                label="Nom du service"
                                value={misc.serviceName || ''}
                                onChange={(e) => {
                                  const updatedMisc = [...editingOption.data.miscellaneous];
                                  updatedMisc[miscIndex].serviceName = e.target.value;
                                  setEditingOption(prev => ({
                                    ...prev!,
                                    data: { ...prev!.data, miscellaneous: updatedMisc }
                                  }));
                                }}
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={12} md={3}>
                              <TextField
                                label="Fournisseur"
                                value={misc.supplierName || ''}
                                onChange={(e) => {
                                  const updatedMisc = [...editingOption.data.miscellaneous];
                                  updatedMisc[miscIndex].supplierName = e.target.value;
                                  setEditingOption(prev => ({
                                    ...prev!,
                                    data: { ...prev!.data, miscellaneous: updatedMisc }
                                  }));
                                }}
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={12} md={2}>
                              <TextField
                                label="Prix"
                                type="number"
                                value={misc.price || 0}
                                onChange={(e) => {
                                  const updatedMisc = [...editingOption.data.miscellaneous];
                                  updatedMisc[miscIndex].price = Number(e.target.value);
                                  setEditingOption(prev => ({
                                    ...prev!,
                                    data: { ...prev!.data, miscellaneous: updatedMisc }
                                  }));
                                }}
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={12} md={2}>
                              <FormControl fullWidth>
                                <InputLabel>Devise</InputLabel>
                                <Select
                                  value={misc.currency || 'EUR'}
                                  onChange={(e) => {
                                    const updatedMisc = [...editingOption.data.miscellaneous];
                                    updatedMisc[miscIndex].currency = e.target.value;
                                    setEditingOption(prev => ({
                                      ...prev!,
                                      data: { ...prev!.data, miscellaneous: updatedMisc }
                                    }));
                                  }}
                                >
                                  {currencies.map(currency => (
                                    <MenuItem key={currency} value={currency}>{currency}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} md={1}>
                              <IconButton 
                                onClick={() => handleRemoveMiscellaneous(miscIndex)}
                                color="secondary"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                  </Grid>

                  {/* Totaux calculés */}
                  <Grid item xs={12}>
                    <Alert severity="info">
                      <Typography variant="h6">Totaux calculés</Typography>
                      <Box sx={{ mt: 1 }}>
                        <Typography>Transport routier: {formatCurrency(editingOption.data.haulage?.unitTariff || 0)}</Typography>
                        <Typography>Transport maritime: {formatCurrency(
                          editingOption.data.seaFreight?.containers?.reduce((sum: number, container: any) => 
                            sum + (container.unitPrice * container.quantity), 0) || 0
                        )}</Typography>
                        <Typography>Services divers: {formatCurrency(
                          editingOption.data.miscellaneous?.reduce((sum: number, misc: any) => 
                            sum + misc.price, 0) || 0
                        )}</Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="h6">
                          Total: {formatCurrency(calculateOptionTotals(editingOption.data).grandTotal)}
                        </Typography>
                      </Box>
                    </Alert>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelEdit}>
              Annuler
            </Button>
            <Button 
              onClick={handleSaveOption}
              variant="contained"
              startIcon={<SaveIcon />}
            >
              Sauvegarder l'option
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={showDeleteDialog !== null}
          onClose={() => setShowDeleteDialog(null)}
        >
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir supprimer l'option {(showDeleteDialog || 0) + 1} ?
              Cette action est irréversible.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDeleteDialog(null)}>
              Annuler
            </Button>
            <Button 
              onClick={confirmDeleteOption}
              color="error"
              variant="contained"
            >
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
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

export default QuoteOptionsEditor;