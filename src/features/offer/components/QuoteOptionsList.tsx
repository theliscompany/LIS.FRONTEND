import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Stack
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  ContentCopy as DuplicateIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Compare as CompareIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useQuoteOptionsManager, type QuoteOption } from '../hooks/useQuoteOptionsManager';

interface QuoteOptionsListProps {
  quoteId?: string;
  draftId?: string;
  onOptionSelect?: (optionId: string) => void;
  onOptionEdit?: (option: QuoteOption) => void;
  onOptionView?: (option: QuoteOption) => void;
  onOptionAdd?: () => void;
  onOptionCompare?: (options: QuoteOption[]) => void;
  showActions?: boolean;
  maxHeight?: string;
  selectedOptionId?: string | null;
}

const QuoteOptionsList: React.FC<QuoteOptionsListProps> = ({
  quoteId,
  draftId,
  onOptionSelect,
  onOptionEdit,
  onOptionView,
  onOptionAdd,
  onOptionCompare,
  showActions = true,
  maxHeight = '600px',
  selectedOptionId
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOption, setSelectedOption] = useState<QuoteOption | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [optionToDelete, setOptionToDelete] = useState<QuoteOption | null>(null);

  const {
    quote,
    options,
    selectedOptionId: currentSelectedOptionId,
    isLoadingQuote,
    isGeneratingOption,
    isAddingOption,
    isDuplicatingOption,
    isSelectingOption,
    quoteError,
    generateOption,
    duplicateOption,
    selectOption,
    refreshQuote
  } = useQuoteOptionsManager({
    quoteId,
    draftId,
    onOptionSelected: onOptionSelect
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, option: QuoteOption) => {
    setAnchorEl(event.currentTarget);
    setSelectedOption(option);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOption(null);
  };

  const handleDuplicate = async () => {
    if (!selectedOption) return;
    
    try {
      const result = await duplicateOption(selectedOption.optionId);
      if (result.success) {
        handleMenuClose();
      }
    } catch (error) {
      console.error('Erreur lors de la duplication:', error);
    }
  };

  const handleSelect = async () => {
    if (!selectedOption) return;
    
    try {
      const result = await selectOption(selectedOption.optionId, 'Sélection manuelle');
      if (result.success) {
        handleMenuClose();
      }
    } catch (error) {
      console.error('Erreur lors de la sélection:', error);
    }
  };

  const handleEdit = () => {
    if (selectedOption && onOptionEdit) {
      onOptionEdit(selectedOption);
    }
    handleMenuClose();
  };

  const handleView = () => {
    if (selectedOption && onOptionView) {
      onOptionView(selectedOption);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setOptionToDelete(selectedOption);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    // TODO: Implémenter la suppression d'option
    console.log('Suppression de l\'option:', optionToDelete);
    setDeleteDialogOpen(false);
    setOptionToDelete(null);
  };

  const handleCompare = () => {
    if (onOptionCompare) {
      onOptionCompare(options);
    }
  };

  const formatCurrency = (amount: number, currency = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount || 0);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (option: QuoteOption) => {
    const isSelected = selectedOptionId === option.optionId || currentSelectedOptionId === option.optionId;
    return isSelected ? 'success' : 'default';
  };

  const getStatusLabel = (option: QuoteOption) => {
    const isSelected = selectedOptionId === option.optionId || currentSelectedOptionId === option.optionId;
    return isSelected ? 'Sélectionnée' : 'Disponible';
  };

  if (isLoadingQuote) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (quoteError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Erreur lors du chargement des options: {quoteError}
      </Alert>
    );
  }

  if (!options || options.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Aucune option disponible
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {draftId ? 'Générez une première option depuis votre brouillon' : 'Aucune option n\'a été créée pour ce devis'}
        </Typography>
        {onOptionAdd && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onOptionAdd}
            disabled={isGeneratingOption}
          >
            {isGeneratingOption ? 'Génération...' : 'Créer une option'}
          </Button>
        )}
      </Paper>
    );
  }

  return (
    <Box>
      {/* Header avec actions */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Options de devis ({options.length})
        </Typography>
        <Stack direction="row" spacing={1}>
          {options.length > 1 && onOptionCompare && (
            <Button
              variant="outlined"
              startIcon={<CompareIcon />}
              onClick={handleCompare}
              size="small"
            >
              Comparer
            </Button>
          )}
          {onOptionAdd && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onOptionAdd}
              disabled={isGeneratingOption}
              size="small"
            >
              {isGeneratingOption ? 'Génération...' : 'Nouvelle option'}
            </Button>
          )}
        </Stack>
      </Box>

      {/* Liste des options */}
      <Box sx={{ maxHeight, overflowY: 'auto' }}>
        <Grid container spacing={2}>
          {options.map((option, index) => (
            <Grid item xs={12} md={6} lg={4} key={option.optionId}>
              <Card 
                sx={{ 
                  height: '100%',
                  border: (selectedOptionId === option.optionId || currentSelectedOptionId === option.optionId) 
                    ? 2 : 1,
                  borderColor: (selectedOptionId === option.optionId || currentSelectedOptionId === option.optionId)
                    ? 'primary.main' : 'divider',
                  position: 'relative'
                }}
              >
                {/* Badge de sélection */}
                {(selectedOptionId === option.optionId || currentSelectedOptionId === option.optionId) && (
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
                  title={`Option ${index + 1}`}
                  subheader={formatDate(option.createdAt)}
                  action={
                    showActions && (
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, option)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    )
                  }
                />

                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {option.description || 'Aucune description'}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  {/* Détails des coûts */}
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Détail des coûts
                    </Typography>
                    <Stack spacing={1}>
                      {option.totals?.haulageTotal && option.totals.haulageTotal > 0 && (
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Transport terrestre:</Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(option.totals.haulageTotal)}
                          </Typography>
                        </Box>
                      )}
                      {option.totals?.seafreightTotal && option.totals.seafreightTotal > 0 && (
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Transport maritime:</Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(option.totals.seafreightTotal)}
                          </Typography>
                        </Box>
                      )}
                      {option.totals?.miscellaneousTotal && option.totals.miscellaneousTotal > 0 && (
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
                          {formatCurrency(option.totals?.grandTotal || 0)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Informations de validité */}
                  {option.validUntil && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Valide jusqu'au: {formatDate(option.validUntil)}
                      </Typography>
                    </Box>
                  )}

                  {/* Status */}
                  <Box mt={2}>
                    <Chip
                      label={getStatusLabel(option)}
                      color={getStatusColor(option)}
                      size="small"
                      variant={getStatusColor(option) === 'success' ? 'filled' : 'outlined'}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Menu contextuel */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Voir les détails</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Modifier</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleDuplicate} disabled={isDuplicatingOption}>
          <ListItemIcon>
            <DuplicateIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {isDuplicatingOption ? 'Duplication...' : 'Dupliquer'}
          </ListItemText>
        </MenuItem>
        
        <MenuItem 
          onClick={handleSelect} 
          disabled={isSelectingOption || (selectedOptionId === selectedOption?.optionId || currentSelectedOptionId === selectedOption?.optionId)}
        >
          <ListItemIcon>
            {selectedOptionId === selectedOption?.optionId || currentSelectedOptionId === selectedOption?.optionId ? (
              <StarIcon fontSize="small" />
            ) : (
              <StarBorderIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {isSelectingOption ? 'Sélection...' : 
             (selectedOptionId === selectedOption?.optionId || currentSelectedOptionId === selectedOption?.optionId) ? 
             'Déjà sélectionnée' : 'Sélectionner'}
          </ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Supprimer</ListItemText>
        </MenuItem>
      </Menu>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
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
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuoteOptionsList;
