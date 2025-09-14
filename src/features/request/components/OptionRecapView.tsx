import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Stack,
  Tooltip
} from '@mui/material';
import {
  ExpandMore,
  LocalShipping,
  DirectionsBoat,
  Build,
  Euro,
  Edit,
  Delete,
  Save as SaveIcon
} from '@mui/icons-material';
import type { DraftOptionReal } from '../hooks/useRealDraftOptionsManagerSimple';

interface OptionRecapViewProps {
  option: DraftOptionReal;
  onEdit?: (option: DraftOptionReal) => void;
  onDelete?: (option: DraftOptionReal) => void;
  onSave?: (option: DraftOptionReal) => void;
  isEditing?: boolean;
  onEditToggle?: (option: DraftOptionReal) => void;
}

const OptionRecapView: React.FC<OptionRecapViewProps> = ({
  option,
  onEdit,
  onDelete,
  onSave,
  isEditing = false,
  onEditToggle
}) => {
  const [localMargin, setLocalMargin] = React.useState(option.marginValue);
  const [localMarginType, setLocalMarginType] = React.useState<'percentage' | 'amount'>(option.marginType as 'percentage' | 'amount');
  const [localDescription, setLocalDescription] = React.useState(option.description);

  // Calcul des totaux basé sur les données de l'option
  const calculateTotals = React.useMemo(() => {
    const haulageTotal = option.totals.haulageTotalAmount || 0;
    const seafreightTotal = option.totals.seafreightTotalAmount || 0;
    const miscTotal = option.totals.miscTotalAmount || 0;
    const subtotal = haulageTotal + seafreightTotal + miscTotal;
    
    let marginAmount: number;
    if (localMarginType === 'percentage') {
      marginAmount = (subtotal * localMargin) / 100;
    } else {
      marginAmount = localMargin;
    }
    
    const totalWithMargin = subtotal + marginAmount;
    
    return {
      haulageTotal,
      seafreightTotal,
      miscTotal,
      subtotal,
      marginAmount,
      totalWithMargin
    };
  }, [option.totals, localMargin, localMarginType]);

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...option,
        marginValue: localMargin,
        marginType: localMarginType,
        description: localDescription,
        totals: {
          ...option.totals,
          marginAmount: calculateTotals.marginAmount,
          totalWithMargin: calculateTotals.totalWithMargin
        }
      });
    }
  };

  return (
    <Paper elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
      {/* En-tête de l'option */}
      <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white', borderRadius: '8px 8px 0 0' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {option.name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {isEditing ? (
                <TextField
                  value={localDescription}
                  onChange={(e) => setLocalDescription(e.target.value)}
                  size="small"
                  variant="standard"
                  sx={{ 
                    input: { color: 'white', fontSize: '0.875rem' },
                    '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255,255,255,0.5)' },
                    '& .MuiInput-underline:after': { borderBottomColor: 'white' }
                  }}
                />
              ) : (
                option.description
              )}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Chip 
              label="Indépendante" 
              size="small" 
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
            <Tooltip title={isEditing ? "Sauvegarder" : "Modifier"}>
              <IconButton 
                size="small" 
                sx={{ color: 'white' }}
                onClick={isEditing ? handleSave : () => onEditToggle?.(option)}
              >
                {isEditing ? <SaveIcon /> : <Edit />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Supprimer">
              <IconButton 
                size="small" 
                sx={{ color: 'white' }}
                onClick={() => onDelete?.(option)}
              >
                <Delete />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ p: 3 }}>
        {/* Résumé des totaux */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Haulage
              </Typography>
              <Typography variant="h6" color="secondary" sx={{ fontWeight: 600 }}>
                {calculateTotals.haulageTotal.toFixed(2)} EUR
              </Typography>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Seafreight
              </Typography>
              <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                {calculateTotals.seafreightTotal.toFixed(2)} EUR
              </Typography>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Services
              </Typography>
              <Typography variant="h6" color="info.main" sx={{ fontWeight: 600 }}>
                {calculateTotals.miscTotal.toFixed(2)} EUR
              </Typography>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Sous-total
              </Typography>
              <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600 }}>
                {calculateTotals.subtotal.toFixed(2)} EUR
              </Typography>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Marge
              </Typography>
              <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600 }}>
                {calculateTotals.marginAmount.toFixed(2)} EUR
              </Typography>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Final
              </Typography>
              <Typography variant="h6" color="error.main" sx={{ fontWeight: 600 }}>
                {calculateTotals.totalWithMargin.toFixed(2)} EUR
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Tableau détaillé (version simplifiée) */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">📊 Détail des Coûts</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Catégorie</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Description</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Quantité</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Prix Unit.</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Sous-total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Haulage */}
                  {calculateTotals.haulageTotal > 0 && (
                    <TableRow sx={{ backgroundColor: '#f3e5f5' }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocalShipping color="primary" fontSize="small" />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Transport Routier
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Service de transport routier
                        </Typography>
                      </TableCell>
                      <TableCell>Haulage</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>{calculateTotals.haulageTotal.toFixed(2)}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {calculateTotals.haulageTotal.toFixed(2)} EUR
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Seafreight */}
                  {calculateTotals.seafreightTotal > 0 && (
                    <TableRow sx={{ backgroundColor: '#e8f5e8' }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DirectionsBoat color="primary" fontSize="small" />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Transport Maritime
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Service de transport maritime
                        </Typography>
                      </TableCell>
                      <TableCell>Container</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>{calculateTotals.seafreightTotal.toFixed(2)}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'success.main' }}>
                        {calculateTotals.seafreightTotal.toFixed(2)} EUR
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Services Divers */}
                  {calculateTotals.miscTotal > 0 && (
                    <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Build color="info" fontSize="small" />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Services Divers
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Services additionnels
                        </Typography>
                      </TableCell>
                      <TableCell>Services</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>{calculateTotals.miscTotal.toFixed(2)}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'info.main' }}>
                        {calculateTotals.miscTotal.toFixed(2)} EUR
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Ligne de résumé */}
                  <TableRow sx={{ backgroundColor: '#f5f5f5', borderTop: '2px solid #1976d2' }}>
                    <TableCell colSpan={5}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        📊 RÉSUMÉ TOTAL
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {calculateTotals.subtotal.toFixed(2)} EUR
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>

        {/* Marge Bénéficiaire */}
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">💎 Marge Bénéficiaire</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl component="fieldset" sx={{ mb: 2 }}>
                  <FormLabel component="legend">Type de marge</FormLabel>
                  <RadioGroup
                    row
                    value={localMarginType}
                    onChange={(e) => {
                      setLocalMarginType(e.target.value as 'percentage' | 'amount');
                      if (e.target.value === 'percentage') {
                        setLocalMargin(15);
                      } else {
                        setLocalMargin(100);
                      }
                    }}
                  >
                    <FormControlLabel 
                      value="percentage" 
                      control={<Radio />} 
                      label="Pourcentage (%)"
                      disabled={!isEditing}
                    />
                    <FormControlLabel 
                      value="amount" 
                      control={<Radio />} 
                      label="Montant fixe (EUR)"
                      disabled={!isEditing}
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={localMarginType === 'percentage' ? 'Marge bénéficiaire (%)' : 'Marge bénéficiaire (EUR)'}
                  type="number"
                  value={localMargin}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    if (localMarginType === 'percentage') {
                      setLocalMargin(Math.max(0, Math.min(100, value)));
                    } else {
                      setLocalMargin(Math.max(0, value));
                    }
                  }}
                  disabled={!isEditing}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {localMarginType === 'percentage' ? '%' : 'EUR'}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Calcul de la marge
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Sous-total: {calculateTotals.subtotal.toFixed(2)} EUR
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Marge: {calculateTotals.marginAmount.toFixed(2)} EUR
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Total avec marge: {calculateTotals.totalWithMargin.toFixed(2)} EUR
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Paper>
  );
};

export default OptionRecapView;
