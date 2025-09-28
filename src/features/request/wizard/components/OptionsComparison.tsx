import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Badge,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  Star,
  StarBorder,
  CompareArrows,
  DirectionsBoat,
  DirectionsCar,
  Build,
  Euro,
  ContentCopy,
  Visibility,
  Edit,
  Delete,
  List as ListIcon,
  Assessment,
  Settings as SettingsIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { DraftQuoteForm, QuoteOption, calculateTotalWithMargin, calculateOptionBaseTotal } from '../schema';

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

interface OptionsComparisonProps {
  formData: DraftQuoteForm;
  onSetPreferredOption: (optionId: string) => void;
  preferredOptionId?: string;
  onDuplicateOption: (option: QuoteOption) => void;
  onEditOption: (option: QuoteOption) => void;
  onDeleteOption: (optionId: string) => void;
  onViewOption: (option: QuoteOption) => void;
  onUpdateOption?: (optionId: string, updatedOption: Partial<QuoteOption>) => void;
  optionTypesData?: any;
  isLoadingOptionTypes?: boolean;
}

export const OptionsComparison: React.FC<OptionsComparisonProps> = ({ 
  formData, 
  onSetPreferredOption, 
  preferredOptionId,
  onDuplicateOption,
  onEditOption,
  onDeleteOption,
  onViewOption,
  onUpdateOption,
  optionTypesData
}) => {
  const theme = useTheme();
  const [comparisonMode, setComparisonMode] = useState<'simple' | 'table' | 'detailed'>('simple');
  
  // États pour le modal de modification avec onglets
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<QuoteOption | null>(null);
  const [editTabValue, setEditTabValue] = useState(0);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    optionType: ''
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(price);
  };

  // Calculer le total d'une option
  // Utiliser les fonctions du schema pour assurer la cohérence
  const calculateOptionTotal = (option: QuoteOption): number => {
    return calculateOptionBaseTotal(option);
  };

  // Fonction locale pour debug et compatibilité
  const calculateTotalWithMarginLocal = (option: QuoteOption): number => {
    const baseTotal = calculateOptionTotal(option);
    console.log('🔍 [OptionsComparison] Debug marge:', {
      optionName: option.name,
      baseTotal,
      margin: option.margin,
      marginType: option.margin?.type,
      marginValue: option.margin?.value,
      calculatedWithSchema: calculateTotalWithMargin(baseTotal, option.margin)
    });
    return calculateTotalWithMargin(baseTotal, option.margin);
  };

  // Compter les éléments par catégorie
  const getOptionCounts = (option: QuoteOption) => {
    return {
      seafreights: option.seafreights?.length || 0,
      haulages: option.haulages?.length || 0,
      services: option.services?.length || 0
    };
  };

  const existingOptions = formData.existingOptions || [];

  // Fonctions de gestion du modal de modification avec onglets
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
    setEditFormData({
      name: '',
      description: '',
      optionType: ''
    });
    setEditTabValue(0);
  };

  const handleSaveEdit = () => {
    if (editingOption && onUpdateOption) {
      onUpdateOption(editingOption.id || '', {
        name: editFormData.name,
        description: editFormData.description,
        optionType: editFormData.optionType
        // Marge conservée telle quelle (pas de modification via le modal)
      });
      handleCloseEditModal();
    } else {
      // Fallback vers l'ancienne méthode
      onEditOption(editingOption!);
      handleCloseEditModal();
    }
  };

  const handleEditOptionClick = (option: QuoteOption) => {
    if (onUpdateOption) {
      // Utiliser le modal de modification avec onglets
      handleOpenEditModal(option);
    } else {
      // Utiliser l'ancienne méthode (wizard)
      onEditOption(option);
    }
  };

  const handleTechnicalDetailsEdit = () => {
    if (editingOption && onEditOption) {
      handleCloseEditModal();
      onEditOption(editingOption);
    }
  };

  if (existingOptions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Aucune option créée
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Créez votre première option pour commencer la comparaison
        </Typography>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <CardContent sx={{ p: 3 }}>
          {/* Header avec contrôles */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3,
            p: 2,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                Comparaison des Options
              </Typography>
              <Badge badgeContent={existingOptions.length} color="primary">
                <Chip label="Options" size="small" color="primary" variant="outlined" />
              </Badge>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={comparisonMode === 'simple' ? "contained" : "outlined"}
                startIcon={<ListIcon />}
                onClick={() => setComparisonMode('simple')}
                sx={{ borderRadius: 2 }}
              >
                Simple
              </Button>
              <Button
                variant={comparisonMode === 'table' ? "contained" : "outlined"}
                startIcon={<CompareArrows />}
                onClick={() => setComparisonMode('table')}
                sx={{ borderRadius: 2 }}
              >
                Tableau
              </Button>
              <Button
                variant={comparisonMode === 'detailed' ? "contained" : "outlined"}
                startIcon={<Assessment />}
                onClick={() => setComparisonMode('detailed')}
                sx={{ borderRadius: 2 }}
              >
                Détaillé
              </Button>
            </Box>
          </Box>

          {comparisonMode === 'table' ? (
            /* Mode Tableau */
            <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.1) }}>
                    <TableCell sx={{ fontWeight: 700 }}>Option</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Seafreights</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Haulages</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Services</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Total</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {existingOptions.map((option, index) => {
                    const counts = getOptionCounts(option);
                    const isPreferred = preferredOptionId === option.id;
                    
                    return (
                      <TableRow 
                        key={option.id || index}
                        sx={{ 
                          '&:hover': { 
                            background: alpha(theme.palette.primary.main, 0.05) 
                          },
                          background: isPreferred ? alpha(theme.palette.warning.main, 0.1) : 'transparent'
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {option.name || `Option ${index + 1}`}
                              </Typography>
                              {isPreferred && (
                                <Chip 
                                  label="Préférée" 
                                  size="small" 
                                  color="warning" 
                                  icon={<Star />}
                                />
                              )}
                            </Box>
                            {option.optionType && (
                              <Chip 
                                label={option.optionType} 
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={counts.seafreights} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={counts.haulages} 
                            size="small" 
                            color="secondary" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={counts.services} 
                            size="small" 
                            color="success" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                            {formatPrice(calculateTotalWithMarginLocal(option))}
                          </Typography>
                          {option.margin && (
                            <Typography variant="caption" color="text.secondary">
                              Base: {formatPrice(calculateOptionTotal(option))} + Marge: {formatPrice(calculateTotalWithMarginLocal(option) - calculateOptionTotal(option))}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Tooltip title="Voir l'option">
                              <IconButton onClick={() => onViewOption(option)} color="info" size="small">
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Modifier l'option">
                              <IconButton onClick={() => handleEditOptionClick(option)} color="primary" size="small">
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Dupliquer l'option">
                              <IconButton onClick={() => onDuplicateOption(option)} color="secondary" size="small">
                                <ContentCopy />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer l'option">
                              <IconButton onClick={() => onDeleteOption(option.id || `option_${index}`)} color="error" size="small">
                                <Delete />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={isPreferred ? "Option préférée" : "Définir comme préférée"}>
                              <IconButton
                                onClick={() => onSetPreferredOption(option.id || `option_${index}`)}
                                color={isPreferred ? "warning" : "default"}
                                size="small"
                              >
                                {isPreferred ? <Star /> : <StarBorder />}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : comparisonMode === 'detailed' ? (
            /* Mode Détaillé - Tableau de comparaison */
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: theme.palette.primary.main }}>
                📊 Comparaison Détaillée des Options
              </Typography>
              
              <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)` }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem', color: theme.palette.primary.main, minWidth: 200 }}>
                        Rubriques
                      </TableCell>
                      {existingOptions.map((option, index) => (
                        <TableCell key={option.id || index} sx={{ 
                          fontWeight: 700, 
                          fontSize: '1.1rem', 
                          color: theme.palette.primary.main, 
                          minWidth: 250,
                          textAlign: 'center',
                          position: 'relative'
                        }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {option.name || `Option ${index + 1}`}
                              </Typography>
                              {preferredOptionId === option.id && (
                                <Chip 
                                  label="Préférée" 
                                  size="small" 
                                  color="warning" 
                                  icon={<Star />}
                                />
                              )}
                            </Box>
                            {option.optionType && (
                              <Chip 
                                label={option.optionType} 
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                            )}
                          </Box>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Informations générales */}
                    <TableRow sx={{ '&:hover': { background: alpha(theme.palette.primary.main, 0.05) } }}>
                      <TableCell sx={{ fontWeight: 600, background: alpha(theme.palette.primary.main, 0.05) }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Description
                          </Typography>
                        </Box>
                      </TableCell>
                      {existingOptions.map((option, index) => (
                        <TableCell key={option.id || index} sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            {option.description || 'Aucune description'}
                          </Typography>
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Total général */}
                    <TableRow sx={{ '&:hover': { background: alpha(theme.palette.primary.main, 0.05) } }}>
                      <TableCell sx={{ fontWeight: 600, background: alpha(theme.palette.primary.main, 0.05) }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Euro color="primary" />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Total Général
                          </Typography>
                        </Box>
                      </TableCell>
                      {existingOptions.map((option, index) => {
                        return (
                          <TableCell key={option.id || index} sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 700, 
                              color: theme.palette.primary.main,
                              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent'
                            }}>
                              {formatPrice(calculateTotalWithMarginLocal(option))}
                            </Typography>
                          </TableCell>
                        );
                      })}
                    </TableRow>

                    {/* Seafreights */}
                    <TableRow sx={{ '&:hover': { background: alpha(theme.palette.primary.main, 0.05) } }}>
                      <TableCell sx={{ fontWeight: 600, background: alpha(theme.palette.primary.main, 0.05) }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DirectionsBoat color="primary" />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Seafreights
                          </Typography>
                        </Box>
                      </TableCell>
                      {existingOptions.map((option, index) => (
                        <TableCell key={option.id || index} sx={{ textAlign: 'center' }}>
                          {option.seafreights && option.seafreights.length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Chip 
                                label={`${option.seafreights.length} offre(s)`} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                              {option.seafreights.map((sf: any, sfIndex: number) => (
                                <Box key={sfIndex} sx={{
                                  p: 1,
                                  borderRadius: 1,
                                  background: alpha(theme.palette.primary.main, 0.05),
                                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                                }}>
                                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                                    {sf.carrier} - {sf.service}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                    ETD: {sf.etd ? new Date(sf.etd).toLocaleDateString('fr-FR') : 'N/A'}
                                  </Typography>
                                  {sf.rates && sf.rates.length > 0 && (
                                    <Box sx={{ mt: 0.5 }}>
                                      {sf.rates.map((rate: any, rateIndex: number) => (
                                        <Box key={rateIndex} sx={{ 
                                          display: 'flex', 
                                          justifyContent: 'space-between', 
                                          alignItems: 'center',
                                          fontSize: '0.7rem'
                                        }}>
                                          <Typography variant="caption">
                                            {rate.containerType}
                                          </Typography>
                                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                            {formatPrice(rate.basePrice || 0)}
                                          </Typography>
                                        </Box>
                                      ))}
                                    </Box>
                                  )}
                                </Box>
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              Aucun seafreight
                            </Typography>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Haulages */}
                    <TableRow sx={{ '&:hover': { background: alpha(theme.palette.primary.main, 0.05) } }}>
                      <TableCell sx={{ fontWeight: 600, background: alpha(theme.palette.secondary.main, 0.05) }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DirectionsCar color="secondary" />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Haulages
                          </Typography>
                        </Box>
                      </TableCell>
                      {existingOptions.map((option, index) => (
                        <TableCell key={option.id || index} sx={{ textAlign: 'center' }}>
                          {option.haulages && option.haulages.length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Chip 
                                label={`${option.haulages.length} offre(s)`} 
                                size="small" 
                                color="secondary" 
                                variant="outlined"
                              />
                              {option.haulages.map((haulage: any, hIndex: number) => (
                                <Box key={hIndex} sx={{
                                  p: 1,
                                  borderRadius: 1,
                                  background: alpha(theme.palette.secondary.main, 0.05),
                                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`
                                }}>
                                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                                    {haulage.mode || 'Haulage'} - {haulage.leg || 'Leg'}
                                  </Typography>
                                  {haulage.note && (
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
                                      {haulage.note}
                                    </Typography>
                                  )}
                                  <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                                    {formatPrice(haulage.price || 0)}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              Aucun haulage
                            </Typography>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Services */}
                    <TableRow sx={{ '&:hover': { background: alpha(theme.palette.primary.main, 0.05) } }}>
                      <TableCell sx={{ fontWeight: 600, background: alpha(theme.palette.success.main, 0.05) }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Build color="success" />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Services
                          </Typography>
                        </Box>
                      </TableCell>
                      {existingOptions.map((option, index) => (
                        <TableCell key={option.id || index} sx={{ textAlign: 'center' }}>
                          {option.services && option.services.length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Chip 
                                label={`${option.services.length} service(s)`} 
                                size="small" 
                                color="success" 
                                variant="outlined"
                              />
                              {option.services.map((service: any, sIndex: number) => (
                                <Box key={sIndex} sx={{
                                  p: 1,
                                  borderRadius: 1,
                                  background: alpha(theme.palette.success.main, 0.05),
                                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                                }}>
                                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                                    {service.code} - {service.label}
                                  </Typography>
                                  <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                                    {formatPrice(service.price || 0)}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              Aucun service
                            </Typography>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Actions */}
                    <TableRow sx={{ '&:hover': { background: alpha(theme.palette.primary.main, 0.05) } }}>
                      <TableCell sx={{ fontWeight: 600, background: alpha(theme.palette.info.main, 0.05) }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Build color="info" />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Actions
                          </Typography>
                        </Box>
                      </TableCell>
                      {existingOptions.map((option, index) => (
                        <TableCell key={option.id || index} sx={{ textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Tooltip title="Voir l'option">
                              <IconButton onClick={() => onViewOption(option)} color="info" size="small">
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Modifier l'option">
                              <IconButton onClick={() => handleEditOptionClick(option)} color="primary" size="small">
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Dupliquer l'option">
                              <IconButton onClick={() => onDuplicateOption(option)} color="secondary" size="small">
                                <ContentCopy />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer l'option">
                              <IconButton onClick={() => onDeleteOption(option.id || `option_${index}`)} color="error" size="small">
                                <Delete />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={preferredOptionId === option.id ? "Option préférée" : "Définir comme préférée"}>
                              <IconButton
                                onClick={() => onSetPreferredOption(option.id || `option_${index}`)}
                                color={preferredOptionId === option.id ? "warning" : "default"}
                                size="small"
                              >
                                {preferredOptionId === option.id ? <Star /> : <StarBorder />}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            /* Mode Simple - Cards */
            <Grid container spacing={3}>
              {existingOptions.map((option, index) => {
                const counts = getOptionCounts(option);
                const isPreferred = preferredOptionId === option.id;
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={option.id || index}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card sx={{
                        borderRadius: 3,
                        background: isPreferred 
                          ? `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`
                          : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                        border: `2px solid ${isPreferred ? theme.palette.warning.main : alpha(theme.palette.primary.main, 0.2)}`,
                        position: 'relative',
                        overflow: 'hidden',
                        height: '100%',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                          transition: 'all 0.3s ease'
                        }
                      }}>
                        {/* Badge Option Préférée */}
                        {isPreferred && (
                          <Box sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            zIndex: 1
                          }}>
                            <Chip 
                              label="Option Préférée" 
                              color="warning" 
                              icon={<Star />}
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>
                        )}

                        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                          {/* Header */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                                {option.name || `Option ${index + 1}`}
                              </Typography>
                              {option.optionType && (
                                <Chip 
                                  label={option.optionType} 
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem', height: 20, alignSelf: 'flex-start' }}
                                />
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              <Tooltip title="Voir l'option">
                                <IconButton
                                  onClick={() => onViewOption(option)}
                                  color="info"
                                  size="small"
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Modifier l'option">
                                <IconButton
                                  onClick={() => handleEditOptionClick(option)}
                                  color="primary"
                                  size="small"
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Dupliquer l'option">
                                <IconButton
                                  onClick={() => onDuplicateOption(option)}
                                  color="secondary"
                                  size="small"
                                >
                                  <ContentCopy />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Supprimer l'option">
                                <IconButton
                                  onClick={() => onDeleteOption(option.id || `option_${index}`)}
                                  color="error"
                                  size="small"
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={isPreferred ? "Option préférée" : "Définir comme préférée"}>
                                <IconButton
                                  onClick={() => onSetPreferredOption(option.id || `option_${index}`)}
                                  color={isPreferred ? "warning" : "default"}
                                  size="small"
                                >
                                  {isPreferred ? <Star /> : <StarBorder />}
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>

                          {/* Compteurs */}
                          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <Chip 
                              label={`${counts.seafreights} SF`} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                              icon={<DirectionsBoat />}
                            />
                            <Chip 
                              label={`${counts.haulages} H`} 
                              size="small" 
                              color="secondary" 
                              variant="outlined"
                              icon={<DirectionsCar />}
                            />
                            <Chip 
                              label={`${counts.services} S`} 
                              size="small" 
                              color="success" 
                              variant="outlined"
                              icon={<Build />}
                            />
                          </Stack>

                          <Divider sx={{ my: 2 }} />

                          {/* Total */}
                          <Box sx={{ textAlign: 'center', mt: 'auto' }}>
                            <Typography variant="h4" sx={{ 
                              fontWeight: 800, 
                              color: calculateTotalWithMarginLocal(option) > 0 ? theme.palette.primary.main : theme.palette.text.secondary,
                              background: calculateTotalWithMarginLocal(option) > 0 ? `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` : 'none',
                              backgroundClip: calculateTotalWithMarginLocal(option) > 0 ? 'text' : 'initial',
                              WebkitBackgroundClip: calculateTotalWithMarginLocal(option) > 0 ? 'text' : 'initial',
                              WebkitTextFillColor: calculateTotalWithMarginLocal(option) > 0 ? 'transparent' : 'initial'
                            }}>
                              {formatPrice(calculateTotalWithMarginLocal(option))}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Total de l'option
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {/* Résumé des totaux */}
          {existingOptions.length > 1 && (
            <Box sx={{ mt: 3, p: 2, borderRadius: 2, background: alpha(theme.palette.info.main, 0.1) }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: theme.palette.info.main }}>
                📊 Résumé des totaux
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                      {formatPrice(Math.min(...existingOptions.map(opt => calculateTotalWithMarginLocal(opt))))}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Prix minimum</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                      {formatPrice(Math.max(...existingOptions.map(opt => calculateTotalWithMarginLocal(opt))))}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Prix maximum</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                      {formatPrice(existingOptions.reduce((sum, opt) => sum + calculateTotalWithMarginLocal(opt), 0) / existingOptions.length)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Prix moyen</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Modal de modification d'option avec onglets */}
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
          <Edit />
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
              icon={<Edit />} 
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

            {/* Section Marge bénéficiaire - Lecture seule */}
            {editingOption?.margin && editingOption.margin.value > 0 && (
              <Box sx={{ 
                p: 2, 
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`, 
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.05)
              }}>
                <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                  💰 Marge bénéficiaire
                </Typography>
                
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Type de marge:
                    </Typography>
                    <Chip 
                      label={editingOption.margin.type === 'percentage' ? 'Pourcentage' : 'Montant fixe'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Valeur:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {editingOption.margin.type === 'percentage' 
                        ? `${editingOption.margin.value}%`
                        : formatPrice(editingOption.margin.value)
                      }
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Montant calculé:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                      {formatPrice(
                        editingOption.margin.type === 'percentage' 
                          ? (calculateOptionTotal(editingOption) * editingOption.margin.value) / 100
                          : editingOption.margin.value
                      )}
                    </Typography>
                  </Box>
                  
                  <Alert severity="info" sx={{ mt: 1 }}>
                    <Typography variant="caption">
                      Pour modifier la marge, utilisez l'onglet "Marge" dans l'étape 2 du wizard.
                    </Typography>
                  </Alert>
                </Stack>
              </Box>
            )}
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
    </motion.div>
  );
};
