/**
 * Composant robuste pour la gestion des options de devis
 * Interface utilisateur complète pour ajout, modification, suppression
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Alert,
  Divider,
  CircularProgress,
  Tooltip,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Euro as EuroIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  LocalShipping as LocalShippingIcon,
  DirectionsBoat as DirectionsBoatIcon,
  Build as BuildIcon,
  AttachMoney as AttachMoneyIcon,
  Timeline as TimelineIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useOptionsManager, type CreateOptionData, type UpdateOptionData, type OptionWithTotals } from '../hooks/useOptionsManager';
import type { DraftQuote } from '../types/DraftQuote';

interface OptionsManagerProps {
  draftQuote?: DraftQuote;
  onDraftUpdate?: (updatedDraft: DraftQuote) => void;
  onQuoteCreation?: (quoteData: any) => Promise<void>;
}

const OptionsManager: React.FC<OptionsManagerProps> = ({
  draftQuote,
  onDraftUpdate,
  onQuoteCreation
}) => {
  const {
    options,
    selectedOption,
    currentTotals,
    isLoadingOptions,
    isAnyLoading,
    isCreating,
    isEditing,
    canAddMoreOptions,
    createOption,
    updateOption,
    deleteOption,
    createQuote,
    refreshOptions,
    startCreating,
    startEditing,
    cancelEditing,
    selectOption,
    config
  } = useOptionsManager(draftQuote);

  // États locaux pour les formulaires
  const [formData, setFormData] = useState<CreateOptionData>({
    name: '',
    description: '',
    marginType: 'percentage',
    marginValue: 15
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);

  // ✅ GESTION DES FORMULAIRES
  const handleFormChange = useCallback((field: keyof CreateOptionData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      marginType: 'percentage',
      marginValue: 15
    });
  }, []);

  // ✅ GESTION DES ACTIONS
  const handleCreate = useCallback(async () => {
    try {
      await createOption(formData);
      resetForm();
    } catch (error) {
      // L'erreur est déjà gérée dans le hook
    }
  }, [createOption, formData, resetForm]);

  const handleUpdate = useCallback(async (optionId: string) => {
    try {
      await updateOption({
        optionId,
        ...formData
      });
      resetForm();
    } catch (error) {
      // L'erreur est déjà gérée dans le hook
    }
  }, [updateOption, formData, resetForm]);

  const handleDelete = useCallback(async (optionId: string) => {
    try {
      await deleteOption(optionId);
      setShowDeleteDialog(null);
    } catch (error) {
      // L'erreur est déjà gérée dans le hook
    }
  }, [deleteOption]);

  const handleCreateQuote = useCallback(async (optionId: string) => {
    try {
      const result = await createQuote(optionId);
      if (onQuoteCreation) {
        await onQuoteCreation(result);
      }
    } catch (error) {
      // L'erreur est déjà gérée dans le hook
    }
  }, [createQuote, onQuoteCreation]);

  // ✅ DÉMARRAGE DES MODES
  const handleStartCreating = useCallback(() => {
    resetForm();
    startCreating();
  }, [resetForm, startCreating]);

  const handleStartEditing = useCallback((option: OptionWithTotals) => {
    setFormData({
      name: option.name,
      description: option.description,
      marginType: option.marginType,
      marginValue: option.marginValue
    });
    startEditing(option.optionId);
  }, [startEditing]);

  // ✅ RENDU DES TOTAUX
  const renderTotals = useCallback((totals: any, title: string) => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssessmentIcon color="primary" />
          <Typography variant="h6">{title}</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
              <LocalShippingIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h6" color="primary">
                {totals.haulageTotal.toLocaleString('fr-FR')} €
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Haulage
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.50', borderRadius: 2 }}>
              <DirectionsBoatIcon color="info" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h6" color="info.main">
                {totals.seafreightTotal.toLocaleString('fr-FR')} €
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Seafreight
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
              <BuildIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h6" color="success.main">
                {totals.miscTotal.toLocaleString('fr-FR')} €
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Services
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.50', borderRadius: 2 }}>
              <AttachMoneyIcon color="warning" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h6" color="warning.main">
                {totals.finalTotal.toLocaleString('fr-FR')} €
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total final
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  ), []);

  // ✅ RENDU D'UNE OPTION
  const renderOption = useCallback((option: OptionWithTotals) => (
    <Card 
      key={option.optionId}
      sx={{ 
        mb: 2,
        border: selectedOption?.optionId === option.optionId ? '2px solid' : '1px solid',
        borderColor: selectedOption?.optionId === option.optionId ? 'primary.main' : 'divider',
        '&:hover': {
          boxShadow: 3
        }
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <AssessmentIcon />
          </Avatar>
        }
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">{option.name}</Typography>
            {option.isPreferred && (
              <Chip label="Préférée" color="primary" size="small" />
            )}
          </Box>
        }
        subheader={
          <Box>
            <Typography variant="body2" color="text.secondary">
              {option.description}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              <Chip 
                label={`Marge: ${option.marginValue}${option.marginType === 'percentage' ? '%' : '€'}`}
                color="secondary"
                size="small"
              />
              <Typography variant="caption" color="text.secondary">
                Créée le {new Date(option.createdAt).toLocaleDateString('fr-FR')}
              </Typography>
            </Box>
          </Box>
        }
        action={
          <Box>
            <IconButton 
              onClick={() => selectOption(option.optionId)}
              color={selectedOption?.optionId === option.optionId ? 'primary' : 'default'}
            >
              <CheckCircleIcon />
            </IconButton>
            <IconButton onClick={() => handleStartEditing(option)}>
              <EditIcon />
            </IconButton>
            <IconButton 
              onClick={() => setShowDeleteDialog(option.optionId)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        }
      />
      <CardContent>
        {renderTotals(option.totals, `Totaux - ${option.name}`)}
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          startIcon={<EuroIcon />}
          onClick={() => handleCreateQuote(option.optionId)}
          disabled={isAnyLoading}
        >
          Créer un devis
        </Button>
        <Button
          variant="outlined"
          onClick={() => selectOption(option.optionId)}
        >
          {selectedOption?.optionId === option.optionId ? 'Sélectionnée' : 'Sélectionner'}
        </Button>
      </CardActions>
    </Card>
  ), [selectedOption, isAnyLoading, selectOption, handleStartEditing, handleCreateQuote, renderTotals]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Gestion des options
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Créez et gérez les options de devis pour cette demande
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshOptions}
            disabled={isAnyLoading}
          >
            Actualiser
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleStartCreating}
            disabled={!canAddMoreOptions || isAnyLoading}
          >
            Nouvelle option
          </Button>
        </Box>
      </Box>

      {/* Totaux actuels */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Totaux actuels (sans option)
        </Typography>
        {renderTotals(currentTotals, 'Calculs basés sur les données du wizard')}
      </Paper>

      {/* Liste des options */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Options sauvegardées ({options.length}/{config.MAX_OPTIONS})
        </Typography>
        
        {isLoadingOptions ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : options.length === 0 ? (
          <Alert severity="info">
            Aucune option sauvegardée. Créez votre première option pour commencer.
          </Alert>
        ) : (
          <Box>
            {options.map(renderOption)}
          </Box>
        )}
      </Box>

      {/* Formulaire de création/modification */}
      {(isCreating || isEditing) && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {isCreating ? 'Créer une nouvelle option' : 'Modifier l\'option'}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom de l'option"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                placeholder="Ex: Option standard"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Description de l'option"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Type de marge</FormLabel>
                <RadioGroup
                  value={formData.marginType}
                  onChange={(e) => handleFormChange('marginType', e.target.value)}
                  row
                >
                  <FormControlLabel value="percentage" control={<Radio />} label="Pourcentage" />
                  <FormControlLabel value="fixed" control={<Radio />} label="Montant fixe" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={formData.marginType === 'percentage' ? 'Marge (%)' : 'Marge (€)'}
                type="number"
                value={formData.marginValue}
                onChange={(e) => handleFormChange('marginValue', parseFloat(e.target.value) || 0)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {formData.marginType === 'percentage' ? '%' : '€'}
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={isCreating ? handleCreate : () => isEditing && handleUpdate(isEditing)}
              disabled={isAnyLoading || !formData.name.trim()}
            >
              {isCreating ? 'Créer' : 'Modifier'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={cancelEditing}
              disabled={isAnyLoading}
            >
              Annuler
            </Button>
          </Box>
        </Paper>
      )}

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={!!showDeleteDialog}
        onClose={() => setShowDeleteDialog(null)}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer cette option ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(null)}>
            Annuler
          </Button>
          <Button
            onClick={() => showDeleteDialog && handleDelete(showDeleteDialog)}
            color="error"
            variant="contained"
            disabled={isAnyLoading}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OptionsManager;
