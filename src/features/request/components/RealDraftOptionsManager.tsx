import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  Divider,
  CircularProgress,
  Skeleton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  PlayArrow as LoadIcon,
  Save as SaveIcon,
  ViewList as ViewListIcon
} from '@mui/icons-material';
import { useRealDraftOptionsManagerSimple as useRealDraftOptionsManager, type DraftOptionReal } from '../hooks/useRealDraftOptionsManagerSimple';
import type { DraftQuote } from '../types/DraftQuote';
import OptionEditWithRecap from './OptionEditWithRecap';
import OptionRecapView from './OptionRecapView';

interface RealDraftOptionsManagerProps {
  draftQuote: DraftQuote;
  onDraftUpdate?: (updatedDraft: DraftQuote) => void;
  onQuoteCreation?: (quoteData: any) => void;
  currentTotals?: {
    displayedTotal: number;
    marginAmount: number;
    totalWithMargin: number;
    marginType: string;
    marginValue: number;
  };
  
}

const RealDraftOptionsManager: React.FC<RealDraftOptionsManagerProps> = ({
  draftQuote,
  onDraftUpdate,
  onQuoteCreation,
  currentTotals
}) => {
  const [showOptionEditor, setShowOptionEditor] = useState(false);
  const [editingOption, setEditingOption] = useState<DraftOptionReal | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);
  
  // NOUVEAU : État pour l'édition avec récapitulatif complet
  const [showRecapEditor, setShowRecapEditor] = useState(false);
  const [editingOptionWithRecap, setEditingOptionWithRecap] = useState<DraftOptionReal | null>(null);
  
  // État pour l'édition en ligne dans la vue récapitulatif
  const [editingInlineOptionId, setEditingInlineOptionId] = useState<string | null>(null);

  const {
    options,
    selectedOptionId,
    currentWorkingOptionId,
    isLoadingOptions,
    saveAsOption,
    loadOption,
    deleteOption,
    duplicateOption,
    updateOptionTotals,
    updateOptionMargin,
    canAddMoreOptions,
    refreshOptions,
    exportForQuoteCreation
  } = useRealDraftOptionsManager({
    draftQuote,
    onDraftUpdate
  });

  const handleCreateOption = () => {
    setEditingOption(null);
    setShowOptionEditor(true);
  };

  const handleEditOption = (option: DraftOptionReal) => {
    setEditingOption(option);
    setShowOptionEditor(true);
  };

  const handleDuplicateOption = async (option: DraftOptionReal) => {
    try {
      await duplicateOption(option.optionId);
    } catch (error) {
      console.error('Erreur lors de la duplication:', error);
    }
  };

  const handleLoadOption = async (option: DraftOptionReal) => {
    try {
      await loadOption(option.optionId);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    }
  };

  const handleDeleteOption = (option: DraftOptionReal) => {
    setShowDeleteDialog(option.optionId);
  };

  const handleConfirmDelete = async () => {
    if (showDeleteDialog) {
      try {
        await deleteOption(showDeleteDialog);
        setShowDeleteDialog(null);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleSaveOption = async (optionData: { 
    name: string; 
    description: string; 
    marginType?: string; 
    marginValue?: number 
  }) => {
    try {
      console.log('[DEBUG] handleSaveOption - options avant:', options.length);
      
      if (editingOption) {
        // ÉDITION D'UNE OPTION EXISTANTE (indépendamment du wizard)
        console.log('[DEBUG] Édition option existante (indépendante du wizard):', {
          optionId: editingOption.optionId,
          optionData
        });
        
        // Mettre à jour la marge si elle a changé
        if (optionData.marginType && optionData.marginValue !== undefined) {
          await updateOptionMargin(editingOption.optionId, optionData.marginType, optionData.marginValue);
        }
        
        // Note: Le nom et la description pourraient aussi être mis à jour ici
        // Pour l'instant, on se concentre sur la marge qui affecte les totaux
        
      } else {
        // CRÉATION D'UNE NOUVELLE OPTION (basée sur le wizard)
        const finalOptionData = {
          ...optionData,
          marginType: optionData.marginType || currentTotals?.marginType || 'percentage',
          marginValue: optionData.marginValue || currentTotals?.marginValue || 15
        };
        
        console.log('[DEBUG] Création nouvelle option avec données Step 7:', {
          optionData: finalOptionData,
          currentTotals,
          draftId: draftQuote?.id
        });
        
        await saveAsOption(finalOptionData);
        
        console.log('[DEBUG] handleSaveOption - options après création:', options.length);
        
        // Forcer un rafraîchissement supplémentaire après un délai
        setTimeout(async () => {
          console.log('[DEBUG] Rafraîchissement supplémentaire après délai');
          await refreshOptions();
          console.log('[DEBUG] Options après rafraîchissement supplémentaire:', options.length);
        }, 1500);
      }
      
      setShowOptionEditor(false);
      setEditingOption(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleCreateQuote = async () => {
    try {
      setIsCreatingQuote(true);
      const quoteData = exportForQuoteCreation();
      if (onQuoteCreation) {
        await onQuoteCreation(quoteData);
      }
    } catch (error: any) {
      console.error('Erreur lors de la création du devis:', error);
    } finally {
      setIsCreatingQuote(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoadingOptions) {
    return (
      <Box>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Skeleton variant="text" width="60%" height={40} />
          <Box mt={2}>
            <Grid container spacing={2}>
              {[1, 2, 3].map((i) => (
                <Grid item xs={12} sm={4} key={i}>
                  <Skeleton variant="rectangular" height={120} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      {/* En-tête */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight="bold">
            <Badge badgeContent={options.length} color="primary" max={3}>
              Gestion des Options
            </Badge>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
              ({options.length}/3 options)
            </Typography>
          </Typography>
          <Stack direction="row" spacing={2}>
            <Tooltip title="Actualiser">
              <IconButton onClick={() => refreshOptions()} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={handleCreateOption}
              disabled={!canAddMoreOptions}
            >
              Sauvegarder comme option
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleCreateQuote}
              disabled={options.length === 0 || isCreatingQuote}
              startIcon={isCreatingQuote ? <CircularProgress size={20} /> : null}
            >
              {isCreatingQuote ? 'Création...' : 'Créer le devis'}
            </Button>
          </Stack>
        </Box>

        {/* Statistiques */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="primary">
                  {options.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Options créées
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="success.main">
                  {options.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Options valides
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="info.main">
                  {currentWorkingOptionId ? '1' : '0'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Option active
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="warning.main">
                  {options.length > 0 ? 
                    formatCurrency(
                      Math.min(...options.map(opt => opt.totals.finalTotal))
                    ) : 'N/A'
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Prix minimum
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Informations sur l'état actuel du wizard */}
        {currentTotals && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              💡 État actuel du wizard (Step 7) - Base pour nouvelles options :
            </Typography>
            <Typography variant="body2">
              • Sous-total : {formatCurrency(currentTotals.displayedTotal)}
            </Typography>
            <Typography variant="body2">
              • Marge ({currentTotals.marginType === 'percentage' ? `${currentTotals.marginValue}%` : formatCurrency(currentTotals.marginValue)}) : {formatCurrency(currentTotals.marginAmount)}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              • Total final : {formatCurrency(currentTotals.totalWithMargin)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              ⚠️ Une fois créée, chaque option devient indépendante du wizard et peut être modifiée séparément.
            </Typography>
          </Alert>
        )}

        {/* Règles d'indépendance */}
        {options.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              🔒 Règles d'indépendance des options :
            </Typography>
            <Typography variant="body2">
              • Les options sont des snapshots figés au moment de leur création
            </Typography>
            <Typography variant="body2">
              • Modifier une option n'affecte PAS les données du wizard
            </Typography>
            <Typography variant="body2">
              • Modifier le wizard n'affecte PAS les options existantes
            </Typography>
          </Alert>
        )}

        {/* Avertissements */}
        {!canAddMoreOptions && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Limite de 3 options atteinte. Supprimez une option pour en créer une nouvelle.
          </Alert>
        )}
      </Paper>

      {/* Liste des options */}
      {options.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aucune option sauvegardée
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sauvegardez l'état actuel du wizard comme une option pour pouvoir le comparer ou le modifier plus tard
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleCreateOption}
            >
              Sauvegarder la première option
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                console.log('[DEBUG] Rafraîchissement manuel des options');
                refreshOptions();
              }}
            >
              Actualiser
            </Button>
          </Stack>
          
          {/* Debug info */}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            🔍 Debug: {options.length} options chargées, Loading: {isLoadingOptions ? 'Oui' : 'Non'}
          </Typography>
        </Paper>
      ) : (
        <Box>
          {options.map((option) => (
            <OptionRecapView
              key={option.optionId}
              option={option}
              isEditing={editingInlineOptionId === option.optionId}
              onEditToggle={(opt) => {
                if (editingInlineOptionId === opt.optionId) {
                  setEditingInlineOptionId(null);
                } else {
                  setEditingInlineOptionId(opt.optionId);
                }
              }}
              onSave={async (updatedOption) => {
                try {
                  await updateOptionMargin(
                    updatedOption.optionId, 
                    updatedOption.marginType, 
                    updatedOption.marginValue
                  );
                  setEditingInlineOptionId(null);
                  refreshOptions();
                } catch (error) {
                  console.error('Erreur lors de la sauvegarde:', error);
                }
              }}
              onDelete={(opt) => setShowDeleteDialog(opt.optionId)}
            />
          ))}
        </Box>
      )}

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={!!showDeleteDialog}
        onClose={() => setShowDeleteDialog(null)}
        maxWidth="sm"
        fullWidth
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
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog d'édition d'option */}
      <Dialog
        open={showOptionEditor}
        onClose={() => {
          setShowOptionEditor(false);
          setEditingOption(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">
                {editingOption ? 'Modifier l\'option (indépendamment du wizard)' : 'Sauvegarder comme nouvelle option'}
              </Typography>
              {editingOption && (
                <Typography variant="caption" color="warning.main">
                  ⚠️ Les modifications n'affecteront pas le wizard
                </Typography>
              )}
            </Box>
            <IconButton onClick={() => setShowOptionEditor(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <OptionEditor
            option={editingOption}
            onSave={handleSaveOption}
            onCancel={() => setShowOptionEditor(false)}
            defaultValues={currentTotals ? {
              marginType: currentTotals.marginType,
              marginValue: currentTotals.marginValue
            } : undefined}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog d'édition avec récapitulatif complet */}
      <OptionEditWithRecap
        option={editingOptionWithRecap}
        draftQuote={draftQuote}
        open={showRecapEditor}
        onClose={() => {
          setShowRecapEditor(false);
          setEditingOptionWithRecap(null);
        }}
        onOptionUpdated={(updatedOption) => {
          console.log('[DEBUG] Option mise à jour via récapitulatif:', updatedOption);
          // Rafraîchir la liste des options
          refreshOptions();
          setShowRecapEditor(false);
          setEditingOptionWithRecap(null);
        }}
      />
    </Box>
  );
};

// Composant pour l'édition d'option
interface OptionEditorProps {
  option?: DraftOptionReal | null;
  onSave: (data: { name: string; description: string; marginType?: string; marginValue?: number }) => void;
  onCancel: () => void;
  defaultValues?: {
    marginType?: string;
    marginValue?: number;
  };
}

const OptionEditor: React.FC<OptionEditorProps> = ({
  option,
  onSave,
  onCancel,
  defaultValues
}) => {
  const [formData, setFormData] = useState({
    name: option?.name || '',
    description: option?.description || '',
    marginType: option?.marginType || defaultValues?.marginType || 'percentage',
    marginValue: option?.marginValue || defaultValues?.marginValue || 15
  });

  const handleSave = () => {
    if (!formData.name || !formData.description) {
      return;
    }

    onSave({
      name: formData.name,
      description: formData.description,
      marginType: formData.marginType,
      marginValue: formData.marginValue
    });
  };

  return (
    <Box sx={{ pt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Nom de l'option"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            placeholder="Ex: Option Standard, Option Premium, etc."
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            multiline
            rows={3}
            required
            placeholder="Description détaillée de cette option..."
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            label="Type de marge"
            value={formData.marginType}
            onChange={(e) => setFormData(prev => ({ ...prev, marginType: e.target.value }))}
            SelectProps={{ native: true }}
          >
            <option value="percentage">Pourcentage</option>
            <option value="fixed">Montant fixe</option>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={formData.marginType === 'percentage' ? 'Marge (%)' : 'Marge (€)'}
            type="number"
            value={formData.marginValue}
            onChange={(e) => setFormData(prev => ({ ...prev, marginValue: Number(e.target.value) }))}
            inputProps={{ 
              min: 0, 
              max: formData.marginType === 'percentage' ? 100 : undefined,
              step: formData.marginType === 'percentage' ? 0.1 : 1
            }}
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={onCancel}>
          Annuler
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={!formData.name || !formData.description}
        >
          {option ? 'Mettre à jour' : 'Sauvegarder'}
        </Button>
      </Box>
    </Box>
  );
};

export default RealDraftOptionsManager;
