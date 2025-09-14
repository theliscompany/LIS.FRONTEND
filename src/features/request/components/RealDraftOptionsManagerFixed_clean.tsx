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
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Tabs,
  Tab
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
  ViewList as ViewListIcon,
  LocalShipping,
  DirectionsBoat,
  Build,
  Euro,
  TrendingUp,
  Assessment,
  Schedule,
  Person,
  LocationOn,
  Category,
  AttachMoney,
  BarChart,
  Timeline,
  Info,
  CheckCircle,
  Warning,
  ExpandMore
} from '@mui/icons-material';
import { useRealDraftOptionsManagerFixed, type DraftOptionFixed } from '../hooks/useRealDraftOptionsManagerFixed';
import type { DraftQuote } from '../types/DraftQuote';
import { buildSDKPayload } from '../types/DraftQuote';

interface RealDraftOptionsManagerFixedProps {
  draftQuote?: DraftQuote;
  onDraftUpdate?: (updatedDraft: DraftQuote) => void;
  onQuoteCreation?: (quoteData: any) => Promise<void>;
  currentTotals?: {
    displayedTotal: number;
    marginAmount: number;
    totalWithMargin: number;
    marginType: string;
    marginValue: number;
  };
}

const RealDraftOptionsManagerFixed: React.FC<RealDraftOptionsManagerFixedProps> = ({
  draftQuote,
  onDraftUpdate,
  onQuoteCreation,
  currentTotals
}) => {
  const {
    options,
    selectedOptionId,
    isLoadingOptions,
    canAddMoreOptions,
    createOption,
    updateOption,
    deleteOption,
    refreshOptions,
    exportForQuoteCreation,
    createQuoteFromDraft
  } = useRealDraftOptionsManagerFixed({
    draftQuote,
    onDraftUpdate
  });

  // États locaux pour l'interface
  const [showOptionEditor, setShowOptionEditor] = useState(false);
  const [editingOption, setEditingOption] = useState<DraftOptionFixed | null>(null);
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);
  const [optionName, setOptionName] = useState('');
  const [optionDescription, setOptionDescription] = useState('');

  // Fonctions utilitaires
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Gestionnaires d'événements
  const handleCreateOption = async () => {
    if (!optionName.trim()) return;
    
    try {
      await createOption({
        name: optionName,
        description: optionDescription,
        marginType: currentTotals?.marginType || 'percentage',
        marginValue: currentTotals?.marginValue || 15
      });
      
      setOptionName('');
      setOptionDescription('');
      setShowOptionEditor(false);
    } catch (error) {
      console.error('Erreur lors de la création de l\'option:', error);
    }
  };

  const handleSaveOption = (option: DraftOptionFixed) => {
    // Dupliquer l'option
    createOption({
      name: `${option.name} (Copie)`,
      description: option.description || '',
      marginType: option.marginType,
      marginValue: option.marginValue
    });
  };

  const handleUpdateOption = (option: DraftOptionFixed) => {
    setEditingOption(option);
    setOptionName(option.name);
    setOptionDescription(option.description || '');
    setShowOptionEditor(true);
  };

  const handleDeleteOption = async (optionId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette option ?')) {
      try {
        await deleteOption(optionId);
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'option:', error);
      }
    }
  };

  const handleCreateQuote = async () => {
    if (!exportForQuoteCreation) return;
    
    try {
      if (onQuoteCreation) {
        await onQuoteCreation(exportForQuoteCreation);
      } else {
        await createQuoteFromDraft(exportForQuoteCreation);
      }
    } catch (error) {
      console.error('Erreur lors de la création du devis:', error);
    }
  };

  // Rendu du composant
  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white', borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          🎯 Gestionnaire d'Options Réelles
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Gérez vos options de devis avec les données réelles du wizard
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" sx={{ opacity: 0.8 }} gutterBottom>
              Options créées
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {options.length}
              <Typography component="span" variant="h6" sx={{ ml: 1, opacity: 0.7 }}>
                / 3
              </Typography>
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" sx={{ opacity: 0.8 }} gutterBottom>
              Prix minimum
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {options.length > 0 ? 
                formatCurrency(
                  Math.min(...options.map(opt => opt.totals.finalTotal))
                ) : 'N/A'
              }
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" sx={{ opacity: 0.8 }} gutterBottom>
              Prix maximum
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {options.length > 0 ? 
                formatCurrency(
                  Math.max(...options.map(opt => opt.totals.finalTotal))
                ) : 'N/A'
              }
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" sx={{ opacity: 0.8 }} gutterBottom>
              Statut
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {isLoadingOptions ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                `✅ ${options.length} option${options.length > 1 ? 's' : ''}`
              )}
            </Typography>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Tooltip title="Actualiser">
            <IconButton onClick={() => refreshOptions()} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => setShowOptionEditor(true)}
            disabled={!canAddMoreOptions}
            sx={{ borderRadius: 2 }}
          >
            {options.length === 0 ? 'Créer la première option' : 'Ajouter une option'}
          </Button>
        </Stack>
      </Paper>

      {/* Liste des options ou message vide */}
      {isLoadingOptions ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={48} />
        </Box>
      ) : options.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>
            🎯 Aucune option créée
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Créez votre première option basée sur les données actuelles du wizard
          </Typography>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => setShowOptionEditor(true)}
            sx={{ mt: 2 }}
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
        </Paper>
      ) : (
        <Box>
          {options.map((option, index) => (
            <Card key={option.optionId} sx={{ 
              mb: 3, 
              border: selectedOptionId === option.optionId ? 3 : 1, 
              borderColor: selectedOptionId === option.optionId ? 'primary.main' : 'grey.300',
              borderRadius: 3,
              overflow: 'visible',
              boxShadow: selectedOptionId === option.optionId ? '0 8px 25px rgba(25, 118, 210, 0.15)' : '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <CardHeader
                avatar={
                  <Avatar sx={{ 
                    bgcolor: selectedOptionId === option.optionId ? 'primary.main' : 'grey.400',
                    width: 56, 
                    height: 56,
                    fontSize: '1.5rem',
                    fontWeight: 700
                  }}>
                    {index + 1}
                  </Avatar>
                }
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {option.name}
                    </Typography>
                    {selectedOptionId === option.optionId && (
                      <Chip 
                        icon={<CheckCircle />}
                        label="Sélectionnée" 
                        color="primary" 
                        size="small" 
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </Box>
                }
                subheader={
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      {option.description || 'Aucune description'}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip 
                        icon={<Schedule />}
                        label={`Créée le ${formatDate(option.createdAt)}`}
                        size="small" 
                        variant="outlined"
                        color="info"
                      />
                      <Chip 
                        icon={<Person />}
                        label={option.createdBy || 'Système'}
                        size="small" 
                        variant="outlined"
                        color="secondary"
                      />
                      {option.updatedAt && (
                        <Chip 
                          icon={<Warning />}
                          label={`Modifiée le ${formatDate(option.updatedAt)}`}
                          size="small" 
                          variant="outlined"
                          color="warning"
                        />
                      )}
                    </Stack>
                  </Box>
                }
                action={
                  <Box textAlign="right" sx={{ minWidth: 200 }}>
                    <Typography variant="h3" color="success.main" sx={{ fontWeight: 800, mb: 0.5 }}>
                      {formatCurrency(option.totals.finalTotal)}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Prix final TTC
                    </Typography>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Chip 
                        icon={<Euro />}
                        label={`${option.marginType === 'percentage' ? `${option.marginValue}%` : formatCurrency(option.marginValue)} marge`}
                        size="small" 
                        color="success"
                        variant="outlined"
                      />
                      <Chip 
                        icon={<TrendingUp />}
                        label={`+${formatCurrency(option.totals.marginAmount)}`}
                        size="small" 
                        color="primary"
                      />
                    </Stack>
                  </Box>
                }
                sx={{ pb: 1 }}
              />
              
              <CardContent sx={{ pt: 0 }}>
                {/* Détails financiers enrichis */}
                <Accordion defaultExpanded={index === 0}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Assessment color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Détail des Coûts
                      </Typography>
                      <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                        <Chip 
                          label={`ST: ${formatCurrency(option.totals.subTotal)}`}
                          size="small" 
                          variant="outlined"
                        />
                        <Chip 
                          label={`${option.totals.currency || 'EUR'}`}
                          size="small" 
                          color="info"
                        />
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      {/* Transport routier */}
                      {option.totals.haulageTotalAmount > 0 && (
                        <Grid item xs={12} md={4}>
                          <Paper sx={{ p: 2, bgcolor: 'rgba(156, 39, 176, 0.05)', border: '1px solid rgba(156, 39, 176, 0.2)' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <LocalShipping sx={{ color: 'purple', mr: 1 }} />
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'purple' }}>
                                Transport Routier
                              </Typography>
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: 'purple', mb: 1 }}>
                              {formatCurrency(option.totals.haulageTotalAmount)}
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={(option.totals.haulageTotalAmount / option.totals.subTotal) * 100}
                              sx={{ 
                                mb: 1, 
                                '& .MuiLinearProgress-bar': { bgcolor: 'purple' }
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {((option.totals.haulageTotalAmount / option.totals.subTotal) * 100).toFixed(1)}% du sous-total
                            </Typography>
                          </Paper>
                        </Grid>
                      )}

                      {/* Transport maritime */}
                      {option.totals.seafreightTotalAmount > 0 && (
                        <Grid item xs={12} md={4}>
                          <Paper sx={{ p: 2, bgcolor: 'rgba(46, 125, 50, 0.05)', border: '1px solid rgba(46, 125, 50, 0.2)' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <DirectionsBoat sx={{ color: 'green', mr: 1 }} />
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'green' }}>
                                Transport Maritime
                              </Typography>
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: 'green', mb: 1 }}>
                              {formatCurrency(option.totals.seafreightTotalAmount)}
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={(option.totals.seafreightTotalAmount / option.totals.subTotal) * 100}
                              sx={{ 
                                mb: 1, 
                                '& .MuiLinearProgress-bar': { bgcolor: 'green' }
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {((option.totals.seafreightTotalAmount / option.totals.subTotal) * 100).toFixed(1)}% du sous-total
                            </Typography>
                          </Paper>
                        </Grid>
                      )}

                      {/* Services divers */}
                      {option.totals.miscTotalAmount > 0 && (
                        <Grid item xs={12} md={4}>
                          <Paper sx={{ p: 2, bgcolor: 'rgba(2, 136, 209, 0.05)', border: '1px solid rgba(2, 136, 209, 0.2)' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Build sx={{ color: 'blue', mr: 1 }} />
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'blue' }}>
                                Services Divers
                              </Typography>
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: 'blue', mb: 1 }}>
                              {formatCurrency(option.totals.miscTotalAmount)}
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={(option.totals.miscTotalAmount / option.totals.subTotal) * 100}
                              sx={{ 
                                mb: 1, 
                                '& .MuiLinearProgress-bar': { bgcolor: 'blue' }
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {((option.totals.miscTotalAmount / option.totals.subTotal) * 100).toFixed(1)}% du sous-total
                            </Typography>
                          </Paper>
                        </Grid>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* Données techniques de l'option */}
                <Accordion sx={{ mt: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Timeline color="secondary" />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Données Techniques
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <List dense>
                          <ListItem>
                            <ListItemIcon><Category /></ListItemIcon>
                            <ListItemText 
                              primary="Type de marge" 
                              secondary={option.marginType === 'percentage' ? 'Pourcentage' : 'Montant fixe'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><AttachMoney /></ListItemIcon>
                            <ListItemText 
                              primary="Valeur de marge" 
                              secondary={option.marginType === 'percentage' ? `${option.marginValue}%` : formatCurrency(option.marginValue)}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><BarChart /></ListItemIcon>
                            <ListItemText 
                              primary="Marge calculée" 
                              secondary={formatCurrency(option.totals.marginAmount)}
                            />
                          </ListItem>
                        </List>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <List dense>
                          <ListItem>
                            <ListItemIcon><Schedule /></ListItemIcon>
                            <ListItemText 
                              primary="Calculé le" 
                              secondary={formatDate(option.createdAt)}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><Euro /></ListItemIcon>
                            <ListItemText 
                              primary="Devise" 
                              secondary={option.totals.currency || 'EUR'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><Assessment /></ListItemIcon>
                            <ListItemText 
                              primary="Sous-total HT" 
                              secondary={formatCurrency(option.totals.subTotal)}
                            />
                          </ListItem>
                        </List>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
              
              {/* Actions pour l'option */}
              <CardContent sx={{ pt: 0 }}>
                <Divider sx={{ mb: 2 }} />
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Tooltip title="Dupliquer cette option">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DuplicateIcon />}
                      onClick={() => handleSaveOption(option)}
                    >
                      Dupliquer
                    </Button>
                  </Tooltip>
                  <Tooltip title="Modifier cette option">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleUpdateOption(option)}
                    >
                      Modifier
                    </Button>
                  </Tooltip>
                  <Tooltip title="Supprimer cette option">
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteOption(option.optionId)}
                    >
                      Supprimer
                    </Button>
                  </Tooltip>
                  <Tooltip title={selectedOptionId === option.optionId ? "Option sélectionnée" : "Sélectionner cette option"}>
                    <IconButton
                      color={selectedOptionId === option.optionId ? "primary" : "default"}
                      onClick={() => {
                        // TODO: Implémenter la sélection d'option
                        console.log('Sélection option:', option.optionId);
                      }}
                    >
                      {selectedOptionId === option.optionId ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Bouton de comparaison des options */}
      {options.length > 1 && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<Assessment />}
            onClick={() => setShowComparisonDialog(true)}
            size="large"
            sx={{ 
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontWeight: 600,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            }}
          >
            Comparer les {options.length} Options
          </Button>
        </Box>
      )}

      {/* Dialog de création/modification d'option */}
      <Dialog
        open={showOptionEditor}
        onClose={() => setShowOptionEditor(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          {editingOption ? 'Modifier l\'Option' : 'Créer une Nouvelle Option'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Nom de l'option"
              value={optionName}
              onChange={(e) => setOptionName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Description (optionnelle)"
              value={optionDescription}
              onChange={(e) => setOptionDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
            {currentTotals && (
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Aperçu des totaux basés sur le wizard :
                </Typography>
                <Typography variant="body2">
                  Sous-total : {formatCurrency(currentTotals.displayedTotal)}
                </Typography>
                <Typography variant="body2">
                  Marge ({currentTotals.marginType === 'percentage' ? `${currentTotals.marginValue}%` : 'fixe'}) : {formatCurrency(currentTotals.marginAmount)}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                  Total final : {formatCurrency(currentTotals.totalWithMargin)}
                </Typography>
              </Paper>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowOptionEditor(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleCreateOption}
            variant="contained"
            disabled={!optionName.trim()}
          >
            {editingOption ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de comparaison des options */}
      <Dialog
        open={showComparisonDialog}
        onClose={() => setShowComparisonDialog(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, maxHeight: '90vh' }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            📊 Comparaison des Options
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9, mt: 1 }}>
            Analyse détaillée de vos {options.length} options de devis
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <OptionsComparisonTable options={options} />
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button 
            onClick={() => setShowComparisonDialog(false)}
            variant="contained"
            size="large"
            sx={{ borderRadius: 2, px: 4 }}
          >
            Fermer la Comparaison
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Composant de tableau de comparaison des options
const OptionsComparisonTable: React.FC<{ options: DraftOptionFixed[] }> = ({ options }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (options.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Aucune option à comparer
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer sx={{ maxHeight: '70vh' }}>
      <Table stickyHeader>
        {/* En-tête du tableau */}
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.main' }}>
            <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 150 }}>
              Critères
            </TableCell>
            {options.map((option, index) => (
              <TableCell key={option.optionId} sx={{ color: 'white', fontWeight: 600, textAlign: 'center' }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {option.name}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Option {index + 1}
                  </Typography>
                </Box>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {/* Prix final */}
          <TableRow>
            <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>💰 Prix Final</TableCell>
            {options.map((option) => (
              <TableCell key={`final-${option.optionId}`} sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {formatCurrency(option.totals.finalTotal)}
                </Typography>
              </TableCell>
            ))}
          </TableRow>

          {/* Sous-total */}
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>📊 Sous-total HT</TableCell>
            {options.map((option) => (
              <TableCell key={`subtotal-${option.optionId}`} sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {formatCurrency(option.totals.subTotal)}
                </Typography>
              </TableCell>
            ))}
          </TableRow>

          {/* Transport routier */}
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>🚛 Transport Routier</TableCell>
            {options.map((option) => (
              <TableCell key={`haulage-${option.optionId}`} sx={{ textAlign: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                  {formatCurrency(option.totals.haulageTotalAmount)}
                </Typography>
              </TableCell>
            ))}
          </TableRow>

          {/* Transport maritime */}
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>🚢 Transport Maritime</TableCell>
            {options.map((option) => (
              <TableCell key={`seafreight-${option.optionId}`} sx={{ textAlign: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'info.main' }}>
                  {formatCurrency(option.totals.seafreightTotalAmount)}
                </Typography>
              </TableCell>
            ))}
          </TableRow>

          {/* Services divers */}
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>🔧 Services Divers</TableCell>
            {options.map((option) => (
              <TableCell key={`misc-${option.optionId}`} sx={{ textAlign: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'warning.main' }}>
                  {formatCurrency(option.totals.miscTotalAmount)}
                </Typography>
              </TableCell>
            ))}
          </TableRow>

          {/* Marge */}
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>💎 Marge Bénéficiaire</TableCell>
            {options.map((option) => (
              <TableCell key={`margin-${option.optionId}`} sx={{ textAlign: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {formatCurrency(option.totals.marginAmount)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.marginType === 'percentage' ? `${option.marginValue}%` : 'Fixe'}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RealDraftOptionsManagerFixed;
