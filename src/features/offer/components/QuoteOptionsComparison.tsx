import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Stack,
  Divider,
  Alert,
  Tabs,
  Tab,
  TextField
} from '@mui/material';
import {
  Close as CloseIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import type { QuoteOption } from '../hooks/useQuoteOptionsManager';

// Composant TabPanel pour les onglets
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`option-tabpanel-${index}`}
      aria-labelledby={`option-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface QuoteOptionsComparisonProps {
  open: boolean;
  onClose: () => void;
  options: QuoteOption[];
  selectedOptionId?: string | null;
  onOptionSelect?: (optionId: string) => void;
  onOptionEdit?: (option: QuoteOption) => void;
  onOptionView?: (option: QuoteOption) => void;
  onUpdateOption?: (optionId: string, updatedOption: Partial<QuoteOption>) => void;
  optionTypesData?: any;
}

interface ComparisonCriteria {
  price: boolean;
  haulage: boolean;
  seafreight: boolean;
  miscellaneous: boolean;
  delivery: boolean;
  validity: boolean;
  features: boolean;
}

const QuoteOptionsComparison: React.FC<QuoteOptionsComparisonProps> = ({
  open,
  onClose,
  options,
  selectedOptionId,
  onOptionSelect,
  onOptionEdit,
  onOptionView,
  onUpdateOption,
  optionTypesData
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [criteria, setCriteria] = useState<ComparisonCriteria>({
    price: true,
    haulage: true,
    seafreight: true,
    miscellaneous: true,
    delivery: true,
    validity: true,
    features: true
  });
  const [sortBy, setSortBy] = useState<'price' | 'name' | 'validity'>('price');
  
  // États pour le modal d'édition avec onglets
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<QuoteOption | null>(null);
  const [editTabValue, setEditTabValue] = useState(0);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    optionType: ''
  });

  // Filtrer les options sélectionnées
  const filteredOptions = useMemo(() => {
    if (selectedOptions.length === 0) return options;
    return options.filter(option => selectedOptions.includes(option.optionId));
  }, [options, selectedOptions]);

  // Trier les options
  const sortedOptions = useMemo(() => {
    return [...filteredOptions].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          const priceA = a.totals?.grandTotal || 0;
          const priceB = b.totals?.grandTotal || 0;
          return priceA - priceB;
        case 'name':
          return a.description.localeCompare(b.description);
        case 'validity':
          const validityA = new Date(a.validUntil || 0).getTime();
          const validityB = new Date(b.validUntil || 0).getTime();
          return validityA - validityB;
        default:
          return 0;
      }
    });
  }, [filteredOptions, sortBy]);

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOptions.length === options.length) {
      setSelectedOptions([]);
    } else {
      setSelectedOptions(options.map(option => option.optionId));
    }
  };

  const handleCriteriaChange = (criterion: keyof ComparisonCriteria) => {
    setCriteria(prev => ({
      ...prev,
      [criterion]: !prev[criterion]
    }));
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
      day: 'numeric'
    });
  };

  const getBestOption = () => {
    if (sortedOptions.length === 0) return null;
    
    // Logique simple : option avec le meilleur rapport qualité/prix
    return sortedOptions.reduce((best, current) => {
      const bestScore = (best.totals?.grandTotal || 0) + (best.miscellaneous?.length || 0) * 100;
      const currentScore = (current.totals?.grandTotal || 0) + (current.miscellaneous?.length || 0) * 100;
      return currentScore < bestScore ? current : best;
    });
  };

  const bestOption = getBestOption();

  // Fonctions pour le modal d'édition avec onglets
  const handleOpenEditModal = (option: QuoteOption) => {
    setEditingOption(option);
    setEditFormData({
      name: option.name || '',
      description: option.description || '',
      optionType: option.optionType || ''
    });
    setEditTabValue(0);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingOption(null);
    setEditFormData({ name: '', description: '', optionType: '' });
    setEditTabValue(0);
  };

  const handleSaveEdit = () => {
    if (editingOption && onUpdateOption) {
      onUpdateOption(editingOption.optionId, {
        name: editFormData.name,
        description: editFormData.description,
        optionType: editFormData.optionType
      });
      handleCloseEditModal();
    }
  };

  const handleEditOptionClick = (option: QuoteOption) => {
    if (onUpdateOption) {
      // Utiliser le modal de modification avec onglets
      handleOpenEditModal(option);
    } else if (onOptionEdit) {
      // Utiliser l'ancienne méthode (wizard)
      onOptionEdit(option);
    }
  };

  const handleTechnicalDetailsEdit = () => {
    if (editingOption && onOptionEdit) {
      handleCloseEditModal();
      onOptionEdit(editingOption);
    }
  };

  if (options.length === 0) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Comparaison des options</Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info">
            Aucune option disponible pour la comparaison.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fermer</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Comparaison des options ({filteredOptions.length})</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Contrôles de comparaison */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Options à comparer
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedOptions.length === options.length}
                    indeterminate={selectedOptions.length > 0 && selectedOptions.length < options.length}
                    onChange={handleSelectAll}
                  />
                }
                label="Sélectionner tout"
              />
              <Box sx={{ mt: 1 }}>
                {options.map(option => (
                  <FormControlLabel
                    key={option.optionId}
                    control={
                      <Checkbox
                        checked={selectedOptions.includes(option.optionId)}
                        onChange={() => handleOptionToggle(option.optionId)}
                      />
                    }
                    label={`${option.description} - ${formatCurrency(option.totals?.grandTotal || 0)}`}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Critères de comparaison
              </Typography>
              <Grid container spacing={1}>
                {Object.entries(criteria).map(([key, value]) => (
                  <Grid item xs={6} key={key}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={value}
                          onChange={() => handleCriteriaChange(key as keyof ComparisonCriteria)}
                        />
                      }
                      label={key === 'price' ? 'Prix' :
                             key === 'haulage' ? 'Transport terrestre' :
                             key === 'seafreight' ? 'Transport maritime' :
                             key === 'miscellaneous' ? 'Services divers' :
                             key === 'delivery' ? 'Livraison' :
                             key === 'validity' ? 'Validité' :
                             key === 'features' ? 'Fonctionnalités' : key}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Trier par</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'price' | 'name' | 'validity')}
              >
                <MenuItem value="price">Prix</MenuItem>
                <MenuItem value="name">Nom</MenuItem>
                <MenuItem value="validity">Validité</MenuItem>
              </Select>
            </FormControl>

            {bestOption && (
              <Chip
                icon={<StarIcon />}
                label={`Meilleure option: ${bestOption.description}`}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        </Paper>

        {/* Tableau de comparaison */}
        {filteredOptions.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Option</TableCell>
                  {criteria.price && <TableCell align="right">Prix total</TableCell>}
                  {criteria.haulage && <TableCell align="right">Transport terrestre</TableCell>}
                  {criteria.seafreight && <TableCell align="right">Transport maritime</TableCell>}
                  {criteria.miscellaneous && <TableCell align="right">Services divers</TableCell>}
                  {criteria.delivery && <TableCell>Adresse de livraison</TableCell>}
                  {criteria.validity && <TableCell align="center">Validité</TableCell>}
                  {criteria.features && <TableCell align="center">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedOptions.map((option, index) => (
                  <TableRow 
                    key={option.optionId}
                    sx={{ 
                      bgcolor: selectedOptionId === option.optionId ? 'action.selected' : 'inherit',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {option.name || `Option ${index + 1}`}
                        </Typography>
                        {option.optionType && (
                          <Chip
                            label={option.optionType}
                            size="small"
                            variant="outlined"
                            sx={{ mb: 1, fontSize: '0.7rem', height: 20 }}
                          />
                        )}
                        <Typography variant="body2" color="text.secondary">
                          {option.description}
                        </Typography>
                        {selectedOptionId === option.optionId && (
                          <Chip
                            icon={<StarIcon />}
                            label="Sélectionnée"
                            size="small"
                            color="primary"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    
                    {criteria.price && (
                      <TableCell align="right">
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          {formatCurrency(option.totals?.grandTotal || 0)}
                        </Typography>
                      </TableCell>
                    )}
                    
                    {criteria.haulage && (
                      <TableCell align="right">
                        {option.haulage ? (
                          <Box>
                            <Typography variant="body2">
                              {option.haulage.haulierName || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatCurrency(option.totals?.haulageTotal || 0)}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Non inclus
                          </Typography>
                        )}
                      </TableCell>
                    )}
                    
                    {criteria.seafreight && (
                      <TableCell align="right">
                        {option.seaFreight ? (
                          <Box>
                            <Typography variant="body2">
                              {option.seaFreight.carrierName || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatCurrency(option.totals?.seafreightTotal || 0)}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Non inclus
                          </Typography>
                        )}
                      </TableCell>
                    )}
                    
                    {criteria.miscellaneous && (
                      <TableCell align="right">
                        <Typography variant="body2">
                          {option.miscellaneous?.length || 0} services
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatCurrency(option.totals?.miscellaneousTotal || 0)}
                        </Typography>
                      </TableCell>
                    )}
                    
                    {criteria.delivery && (
                      <TableCell>
                        {option.deliveryAddress ? (
                          <Box>
                            <Typography variant="body2">
                              {option.deliveryAddress.company}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {option.deliveryAddress.city}, {option.deliveryAddress.country}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Non défini
                          </Typography>
                        )}
                      </TableCell>
                    )}
                    
                    {criteria.validity && (
                      <TableCell align="center">
                        <Typography variant="body2">
                          {formatDate(option.validUntil)}
                        </Typography>
                      </TableCell>
                    )}
                    
                    {criteria.features && (
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          {onOptionSelect && (
                            <IconButton
                              size="small"
                              onClick={() => onOptionSelect(option.optionId)}
                              color={selectedOptionId === option.optionId ? "primary" : "default"}
                            >
                              {selectedOptionId === option.optionId ? <StarIcon /> : <StarBorderIcon />}
                            </IconButton>
                          )}
                          
                          {onOptionView && (
                            <IconButton
                              size="small"
                              onClick={() => onOptionView(option)}
                            >
                              <CheckIcon />
                            </IconButton>
                          )}
                          
                          {onOptionEdit && (
                            <IconButton
                              size="small"
                              onClick={() => handleEditOptionClick(option)}
                              title="Modifier l'option"
                            >
                              <EditIcon />
                            </IconButton>
                          )}
                        </Stack>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="warning">
            Veuillez sélectionner au moins une option pour la comparaison.
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Fermer
        </Button>
        {bestOption && onOptionSelect && (
          <Button
            variant="contained"
            startIcon={<StarIcon />}
            onClick={() => onOptionSelect(bestOption.optionId)}
          >
            Sélectionner la meilleure option
          </Button>
        )}
      </DialogActions>

      {/* Modal d'édition avec onglets */}
      <Dialog 
        open={editModalOpen} 
        onClose={handleCloseEditModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          background: `linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)`,
          color: 'white',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <EditIcon />
          Modifier l'option
        </DialogTitle>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={editTabValue} 
            onChange={(_, newValue) => setEditTabValue(newValue)}
            aria-label="onglets de modification"
          >
            <Tab 
              label="Informations" 
              icon={<EditIcon />} 
              iconPosition="start"
              id="option-tab-0"
              aria-controls="option-tabpanel-0"
            />
            <Tab 
              label="Détails techniques" 
              icon={<SettingsIcon />} 
              iconPosition="start"
              id="option-tab-1"
              aria-controls="option-tabpanel-1"
            />
          </Tabs>
        </Box>

        <TabPanel value={editTabValue} index={0}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Modifiez les informations de base de l'option. Les changements sont sauvegardés immédiatement.
          </Alert>
          
          <Stack spacing={3}>
            <TextField
              label="Nom de l'option"
              value={editFormData.name}
              onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              variant="outlined"
              placeholder="Ex: Option Express, Option Économique..."
            />
            
            <TextField
              label="Description"
              value={editFormData.description}
              onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              placeholder="Décrivez cette option..."
            />
            
            <FormControl fullWidth>
              <InputLabel>Type d'option</InputLabel>
              <Select
                value={editFormData.optionType}
                onChange={(e) => setEditFormData(prev => ({ ...prev, optionType: e.target.value }))}
                label="Type d'option"
              >
                <MenuItem value="">
                  <em>Sélectionner un type</em>
                </MenuItem>
                {optionTypesData?.data?.map((optionType: any, index: number) => (
                  <MenuItem key={index} value={typeof optionType === 'string' ? optionType : optionType.value || optionType.name || String(optionType)}>
                    {typeof optionType === 'string' ? optionType : optionType.label || optionType.name || String(optionType)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </TabPanel>

        <TabPanel value={editTabValue} index={1}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Modification des détails techniques
            </Typography>
            <Typography variant="body2">
              Pour modifier les détails techniques (seafreights, haulages, services), 
              vous serez redirigé vers le wizard de configuration.
            </Typography>
          </Alert>
          
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <SettingsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Détails techniques
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configurez les seafreights, haulages et services pour cette option
            </Typography>
            
            <Button
              variant="contained"
              startIcon={<SettingsIcon />}
              onClick={handleTechnicalDetailsEdit}
              size="large"
              sx={{ borderRadius: 2 }}
            >
              Ouvrir le wizard de configuration
            </Button>
          </Box>
        </TabPanel>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleCloseEditModal}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Annuler
          </Button>
          {editTabValue === 0 && (
            <Button 
              onClick={handleSaveEdit}
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{ borderRadius: 2 }}
              disabled={!editFormData.name.trim()}
            >
              Sauvegarder
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default QuoteOptionsComparison;
