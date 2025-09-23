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
  Divider
} from '@mui/material';
import {
  Star,
  StarBorder,
  CompareArrows,
  CheckCircle,
  Cancel,
  TrendingUp,
  DirectionsBoat,
  DirectionsCar,
  Build,
  Euro,
  ContentCopy,
  Visibility,
  Edit,
  Delete,
  List as ListIcon,
  Assessment
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { DraftQuoteForm, QuoteOption } from '../schema';

interface OptionsComparisonProps {
  formData: DraftQuoteForm;
  onSetPreferredOption: (optionId: string) => void;
  preferredOptionId?: string;
  onDuplicateOption: (option: QuoteOption) => void;
  onEditOption: (option: QuoteOption) => void;
  onDeleteOption: (optionId: string) => void;
  onViewOption: (option: QuoteOption) => void;
}

export const OptionsComparison: React.FC<OptionsComparisonProps> = ({ 
  formData, 
  onSetPreferredOption, 
  preferredOptionId,
  onDuplicateOption,
  onEditOption,
  onDeleteOption,
  onViewOption
}) => {
  const theme = useTheme();
  const [comparisonMode, setComparisonMode] = useState<'simple' | 'table' | 'detailed'>('simple');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(price);
  };

  // Calculer le total d'une option
  const calculateOptionTotal = (option: QuoteOption): number => {
    let total = 0;

    // Seafreights
    option.seafreights?.forEach((sf: any) => {
      sf.rates?.forEach((rate: any) => {
        total += rate.basePrice || 0;
      });
    });

    // Haulages
    option.haulages?.forEach((haulage: any) => {
      total += haulage.price || 0;
    });

    // Services
    option.services?.forEach((service: any) => {
      total += service.price || 0;
    });

    return total;
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
                    const total = calculateOptionTotal(option);
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
                            {formatPrice(total)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Tooltip title="Voir l'option">
                              <IconButton onClick={() => onViewOption(option)} color="info" size="small">
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Modifier l'option">
                              <IconButton onClick={() => onEditOption(option)} color="primary" size="small">
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
            /* Mode Détaillé - Grid de comparaison */
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: theme.palette.primary.main }}>
                📊 Comparaison Détaillée des Options
              </Typography>
              
              <Grid container spacing={3}>
                {existingOptions.map((option, index) => {
                  const total = calculateOptionTotal(option);
                  const isPreferred = preferredOptionId === option.id;
                  
                  return (
                    <Grid item xs={12} key={option.id || index}>
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
                          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
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

                          <CardContent sx={{ p: 3 }}>
                            {/* Header */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                              <Box>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: theme.palette.primary.main }}>
                                  {option.name || `Option ${index + 1}`}
                                </Typography>
                                {option.description && (
                                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                    {option.description}
                                  </Typography>
                                )}
                                <Typography variant="h4" sx={{ 
                                  fontWeight: 800, 
                                  color: theme.palette.primary.main,
                                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                  backgroundClip: 'text',
                                  WebkitBackgroundClip: 'text',
                                  WebkitTextFillColor: 'transparent'
                                }}>
                                  {formatPrice(total)}
                                </Typography>
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
                                    onClick={() => onEditOption(option)}
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

                            <Divider sx={{ my: 3 }} />

                            {/* Grid de comparaison détaillée */}
                            <Grid container spacing={3}>
                              {/* Seafreights */}
                              <Grid item xs={12} md={4}>
                                <Box sx={{
                                  p: 3,
                                  borderRadius: 3,
                                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
                                  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                  height: '100%',
                                  minHeight: 300
                                }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                    <DirectionsBoat color="primary" sx={{ fontSize: 28 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                                      Seafreights
                                    </Typography>
                                    <Chip 
                                      label={option.seafreights?.length || 0} 
                                      size="small" 
                                      color="primary" 
                                      variant="outlined"
                                    />
                                  </Box>
                                  
                                  {option.seafreights && option.seafreights.length > 0 ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                      {option.seafreights.map((sf: any, sfIndex: number) => (
                                        <Box key={sfIndex} sx={{
                                          p: 2,
                                          borderRadius: 2,
                                          background: 'white',
                                          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                        }}>
                                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: theme.palette.primary.main }}>
                                            {sf.carrier} - {sf.service}
                                          </Typography>
                                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.85rem' }}>
                                            ETD: {sf.etd ? new Date(sf.etd).toLocaleDateString('fr-FR') : 'N/A'} | 
                                            ETA: {sf.eta ? new Date(sf.eta).toLocaleDateString('fr-FR') : 'N/A'}
                                          </Typography>
                                          {sf.rates && sf.rates.length > 0 && (
                                            <Box>
                                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                                                Tarifs par container:
                                              </Typography>
                                              {sf.rates.map((rate: any, rateIndex: number) => (
                                                <Box key={rateIndex} sx={{ 
                                                  display: 'flex', 
                                                  justifyContent: 'space-between', 
                                                  alignItems: 'center', 
                                                  mb: 1,
                                                  p: 1,
                                                  borderRadius: 1,
                                                  background: alpha(theme.palette.primary.main, 0.05)
                                                }}>
                                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {rate.containerType}
                                                  </Typography>
                                                  <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
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
                                    <Box sx={{ 
                                      textAlign: 'center', 
                                      py: 4,
                                      color: 'text.secondary',
                                      fontStyle: 'italic'
                                    }}>
                                      <DirectionsBoat sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
                                      <Typography variant="body1">
                                        Aucun seafreight sélectionné
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </Grid>

                              {/* Haulages */}
                              <Grid item xs={12} md={4}>
                                <Box sx={{
                                  p: 3,
                                  borderRadius: 3,
                                  background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
                                  border: `2px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                                  height: '100%',
                                  minHeight: 300
                                }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                    <DirectionsCar color="secondary" sx={{ fontSize: 28 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                                      Haulages
                                    </Typography>
                                    <Chip 
                                      label={option.haulages?.length || 0} 
                                      size="small" 
                                      color="secondary" 
                                      variant="outlined"
                                    />
                                  </Box>
                                  
                                  {option.haulages && option.haulages.length > 0 ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                      {option.haulages.map((haulage: any, hIndex: number) => (
                                        <Box key={hIndex} sx={{
                                          p: 2,
                                          borderRadius: 2,
                                          background: 'white',
                                          border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                        }}>
                                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: theme.palette.secondary.main }}>
                                            {haulage.mode || 'Haulage'} - {haulage.leg || 'Leg'}
                                          </Typography>
                                          {haulage.note && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.85rem' }}>
                                              {haulage.note}
                                            </Typography>
                                          )}
                                          <Typography variant="h6" sx={{ 
                                            fontWeight: 700, 
                                            color: theme.palette.secondary.main,
                                            textAlign: 'center',
                                            p: 2,
                                            borderRadius: 1,
                                            background: alpha(theme.palette.secondary.main, 0.1)
                                          }}>
                                            {formatPrice(haulage.price || 0)}
                                          </Typography>
                                        </Box>
                                      ))}
                                    </Box>
                                  ) : (
                                    <Box sx={{ 
                                      textAlign: 'center', 
                                      py: 4,
                                      color: 'text.secondary',
                                      fontStyle: 'italic'
                                    }}>
                                      <DirectionsCar sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
                                      <Typography variant="body1">
                                        Aucun haulage sélectionné
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </Grid>

                              {/* Services */}
                              <Grid item xs={12} md={4}>
                                <Box sx={{
                                  p: 3,
                                  borderRadius: 3,
                                  background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.08)} 0%, ${alpha(theme.palette.success.main, 0.03)} 100%)`,
                                  border: `2px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                  height: '100%',
                                  minHeight: 300
                                }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                    <Build color="success" sx={{ fontSize: 28 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                                      Services
                                    </Typography>
                                    <Chip 
                                      label={option.services?.length || 0} 
                                      size="small" 
                                      color="success" 
                                      variant="outlined"
                                    />
                                  </Box>
                                  
                                  {option.services && option.services.length > 0 ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                      {option.services.map((service: any, sIndex: number) => (
                                        <Box key={sIndex} sx={{
                                          p: 2,
                                          borderRadius: 2,
                                          background: 'white',
                                          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                        }}>
                                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: theme.palette.success.main }}>
                                            {service.code} - {service.label}
                                          </Typography>
                                          <Typography variant="h6" sx={{ 
                                            fontWeight: 700, 
                                            color: theme.palette.success.main,
                                            textAlign: 'center',
                                            p: 2,
                                            borderRadius: 1,
                                            background: alpha(theme.palette.success.main, 0.1)
                                          }}>
                                            {formatPrice(service.price || 0)}
                                          </Typography>
                                        </Box>
                                      ))}
                                    </Box>
                                  ) : (
                                    <Box sx={{ 
                                      textAlign: 'center', 
                                      py: 4,
                                      color: 'text.secondary',
                                      fontStyle: 'italic'
                                    }}>
                                      <Build sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
                                      <Typography variant="body1">
                                        Aucun service sélectionné
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          ) : (
            /* Mode Simple - Cards */
            <Grid container spacing={3}>
              {existingOptions.map((option, index) => {
                const total = calculateOptionTotal(option);
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
                            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                              {option.name || `Option ${index + 1}`}
                            </Typography>
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
                                  onClick={() => onEditOption(option)}
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
                              color: total > 0 ? theme.palette.primary.main : theme.palette.text.secondary,
                              background: total > 0 ? `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` : 'none',
                              backgroundClip: total > 0 ? 'text' : 'initial',
                              WebkitBackgroundClip: total > 0 ? 'text' : 'initial',
                              WebkitTextFillColor: total > 0 ? 'transparent' : 'initial'
                            }}>
                              {formatPrice(total)}
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
                      {formatPrice(Math.min(...existingOptions.map(opt => calculateOptionTotal(opt))))}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Prix minimum</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                      {formatPrice(Math.max(...existingOptions.map(opt => calculateOptionTotal(opt))))}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Prix maximum</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                      {formatPrice(existingOptions.reduce((sum, opt) => sum + calculateOptionTotal(opt), 0) / existingOptions.length)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Prix moyen</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
