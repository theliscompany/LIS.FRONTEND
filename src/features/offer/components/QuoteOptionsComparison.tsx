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
  Card,
  CardContent,
  CardHeader,
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
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Check as CheckIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import type { QuoteOption } from '../hooks/useQuoteOptionsManager';

interface QuoteOptionsComparisonProps {
  open: boolean;
  onClose: () => void;
  options: QuoteOption[];
  selectedOptionId?: string | null;
  onOptionSelect?: (optionId: string) => void;
  onOptionEdit?: (option: QuoteOption) => void;
  onOptionView?: (option: QuoteOption) => void;
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
  onOptionView
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
                          Option {index + 1}
                        </Typography>
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
                              onClick={() => onOptionEdit(option)}
                            >
                              <CheckIcon />
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
    </Dialog>
  );
};

export default QuoteOptionsComparison;
