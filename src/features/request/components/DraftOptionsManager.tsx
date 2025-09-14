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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useDraftOptionsManager, type DraftOption } from '../hooks/useDraftOptionsManager';
import type { DraftQuote } from '../types/DraftQuote';

interface DraftOptionsManagerProps {
  draftQuote: DraftQuote;
  onDraftUpdate?: (updatedDraft: DraftQuote) => void;
  onQuoteCreation?: (quoteData: any) => void;
}

const DraftOptionsManager: React.FC<DraftOptionsManagerProps> = ({
  draftQuote,
  onDraftUpdate,
  onQuoteCreation
}) => {
  const [showOptionEditor, setShowOptionEditor] = useState(false);
  const [editingOption, setEditingOption] = useState<DraftOption | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);

  const {
    options,
    selectedOptionId,
    createOption,
    updateOption,
    deleteOption,
    duplicateOption,
    selectOption,
    clearOptions,
    canAddMoreOptions,
    isOptionValid,
    exportForQuoteCreation
  } = useDraftOptionsManager({
    draftQuote,
    onDraftUpdate
  });

  const handleCreateOption = () => {
    setEditingOption(null);
    setShowOptionEditor(true);
  };

  const handleEditOption = (option: DraftOption) => {
    setEditingOption(option);
    setShowOptionEditor(true);
  };

  const handleDuplicateOption = (option: DraftOption) => {
    duplicateOption(option.id);
  };

  const handleDeleteOption = (option: DraftOption) => {
    setShowDeleteDialog(option.id);
  };

  const handleConfirmDelete = () => {
    if (showDeleteDialog) {
      deleteOption(showDeleteDialog);
      setShowDeleteDialog(null);
    }
  };

  const handleSaveOption = (optionData: Partial<DraftOption>) => {
    if (editingOption) {
      updateOption(editingOption.id, optionData);
    } else {
      createOption(optionData);
    }
    setShowOptionEditor(false);
    setEditingOption(null);
  };

  const handleCreateQuote = () => {
    try {
      const quoteData = exportForQuoteCreation();
      if (onQuoteCreation) {
        onQuoteCreation(quoteData);
      }
    } catch (error: any) {
      console.error('Erreur lors de la création du devis:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <Box>
      {/* En-tête */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight="bold">
            Gestion des Options ({options.length}/3)
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={clearOptions}
              disabled={options.length === 0}
              color="warning"
            >
              Effacer tout
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateOption}
              disabled={!canAddMoreOptions}
            >
              Nouvelle option
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleCreateQuote}
              disabled={options.length === 0}
            >
              Créer le devis
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
                  {options.filter(opt => isOptionValid(opt)).length}
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
                  {selectedOptionId ? '1' : '0'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Option sélectionnée
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
                      Math.min(...options.map(opt => opt.totals.grandTotal))
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
      </Paper>

      {/* Liste des options */}
      {options.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aucune option créée
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Créez votre première option pour commencer
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateOption}
          >
            Créer une option
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {options.map((option, index) => (
            <Grid item xs={12} md={6} lg={4} key={option.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  border: selectedOptionId === option.id ? 2 : 1,
                  borderColor: selectedOptionId === option.id ? 'primary.main' : 'divider',
                  position: 'relative'
                }}
              >
                {/* Badge de sélection */}
                {selectedOptionId === option.id && (
                  <Chip
                    icon={<StarIcon />}
                    label="Sélectionnée"
                    color="primary"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1
                    }}
                  />
                )}

                <CardHeader
                  title={option.name}
                  subheader={`Créée le ${formatDate(option.createdAt.toISOString())}`}
                  action={
                    <IconButton
                      onClick={() => selectOption(option.id)}
                      size="small"
                      color={selectedOptionId === option.id ? "primary" : "default"}
                    >
                      {selectedOptionId === option.id ? <StarIcon /> : <StarBorderIcon />}
                    </IconButton>
                  }
                />

                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {option.description}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  {/* Détail des coûts */}
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Détail des coûts
                    </Typography>
                    <Stack spacing={1}>
                      {option.totals.haulageTotal > 0 && (
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Transport terrestre:</Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(option.totals.haulageTotal)}
                          </Typography>
                        </Box>
                      )}
                      {option.totals.seafreightTotal > 0 && (
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Transport maritime:</Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(option.totals.seafreightTotal)}
                          </Typography>
                        </Box>
                      )}
                      {option.totals.miscellaneousTotal > 0 && (
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Services divers:</Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(option.totals.miscellaneousTotal)}
                          </Typography>
                        </Box>
                      )}
                      <Divider />
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="subtitle2" fontWeight="bold">
                          Total:
                        </Typography>
                        <Typography variant="subtitle2" fontWeight="bold" color="primary">
                          {formatCurrency(option.totals.grandTotal)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Validité */}
                  <Box mb={2}>
                    <Typography variant="caption" color="text.secondary">
                      Valide jusqu'au: {formatDate(option.validUntil)}
                    </Typography>
                  </Box>

                  {/* Status */}
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip
                      label={isOptionValid(option) ? 'Valide' : 'Invalide'}
                      color={isOptionValid(option) ? 'success' : 'error'}
                      size="small"
                    />
                    
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditOption(option)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDuplicateOption(option)}
                      >
                        <DuplicateIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteOption(option)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
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
            <Typography variant="h6">
              {editingOption ? 'Modifier l\'option' : 'Créer une nouvelle option'}
            </Typography>
            <IconButton onClick={() => setShowOptionEditor(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <SimpleOptionEditor
            option={editingOption}
            onSave={handleSaveOption}
            onCancel={() => setShowOptionEditor(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

// Composant simple pour l'édition d'option
interface SimpleOptionEditorProps {
  option?: DraftOption | null;
  onSave: (data: Partial<DraftOption>) => void;
  onCancel: () => void;
}

const SimpleOptionEditor: React.FC<SimpleOptionEditorProps> = ({
  option,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: option?.name || '',
    description: option?.description || '',
    validUntil: option?.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const handleSave = () => {
    if (!formData.name || !formData.description) {
      return;
    }

    onSave({
      name: formData.name,
      description: formData.description,
      validUntil: new Date(formData.validUntil).toISOString()
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
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Date de validité"
            type="date"
            value={formData.validUntil}
            onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
            InputLabelProps={{ shrink: true }}
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
          {option ? 'Mettre à jour' : 'Créer'}
        </Button>
      </Box>
    </Box>
  );
};

export default DraftOptionsManager;
