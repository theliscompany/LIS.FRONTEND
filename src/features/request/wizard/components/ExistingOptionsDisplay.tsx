import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  IconButton,
  Stack,
  Divider,
  Alert,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  DirectionsBoat,
  DirectionsCar,
  Build,
  Edit,
  Delete,
  Visibility,
  Euro,
  AccessTime,
  Business,
  CheckCircle
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { QuoteOption } from '../schema';

interface ExistingOptionsDisplayProps {
  options: QuoteOption[];
  onEditOption: (option: QuoteOption) => void;
  onDeleteOption: (optionId: string) => void;
  onViewOption: (option: QuoteOption) => void;
  maxOptions?: number;
}

export const ExistingOptionsDisplay: React.FC<ExistingOptionsDisplayProps> = ({
  options,
  onEditOption,
  onDeleteOption,
  onViewOption,
  maxOptions = 3
}) => {
  const canAddMore = options.length < maxOptions;

  const calculateTotalPrice = (option: QuoteOption): number => {
    let total = 0;
    
    // Prix des seafreights
    option.seafreights.forEach(sf => {
      sf.rates.forEach(rate => {
        total += rate.basePrice;
      });
    });
    
    // Prix des haulages
    option.haulages.forEach(haulage => {
      total += haulage.price;
    });
    
    // Prix des services
    option.services.forEach(service => {
      total += service.price || 0;
    });
    
    return total;
  };

  const getOptionIcon = (option: QuoteOption) => {
    if (option.seafreights.length > 0) return <DirectionsBoat />;
    if (option.haulages.length > 0) return <DirectionsCar />;
    if (option.services.length > 0) return <Build />;
    return <CheckCircle />;
  };

  const getOptionColor = (option: QuoteOption) => {
    if (option.seafreights.length > 0) return '#1976d2';
    if (option.haulages.length > 0) return '#f57c00';
    if (option.services.length > 0) return '#2e7d32';
    return '#9c27b0';
  };

  if (options.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card sx={{
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid rgba(0,0,0,0.05)',
          textAlign: 'center',
          p: 4
        }}>
          <CheckCircle sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#666', mb: 1 }}>
            📋 Aucune option créée
          </Typography>
          <Typography variant="body1" sx={{ color: '#999' }}>
            Commencez par créer votre première option de devis
          </Typography>
        </Card>
      </motion.div>
    );
  }

  return (
    <Box>
      {/* Header avec compteur */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card sx={{
          mb: 3,
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}>
          <Box sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            p: 3,
            color: 'white'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  width: 56, 
                  height: 56,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                  <CheckCircle sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    📋 Options existantes
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    {options.length} option{options.length > 1 ? 's' : ''} créée{options.length > 1 ? 's' : ''} sur {maxOptions} maximum
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={canAddMore ? `+${maxOptions - options.length} option${maxOptions - options.length > 1 ? 's' : ''} restante${maxOptions - options.length > 1 ? 's' : ''}` : 'Limite atteinte'}
                sx={{
                  background: canAddMore ? 'rgba(255,255,255,0.2)' : 'rgba(244, 67, 54, 0.8)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              />
            </Box>
          </Box>
        </Card>
      </motion.div>

      {/* Liste des options */}
      <Grid container spacing={3}>
        {options.map((option, index) => (
          <Grid item xs={12} md={6} lg={4} key={option.id || index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card sx={{
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                border: '1px solid rgba(0,0,0,0.05)',
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease'
                }
              }}>
                {/* Header de l'option */}
                <Box sx={{
                  background: `linear-gradient(135deg, ${getOptionColor(option)} 0%, ${getOptionColor(option)}CC 100%)`,
                  p: 2,
                  color: 'white'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getOptionIcon(option)}
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {option.name}
                      </Typography>
                    </Box>
                    <Chip
                      label={`€${calculateTotalPrice(option).toLocaleString()}`}
                      sx={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 700
                      }}
                    />
                  </Box>
                  {option.description && (
                    <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                      {option.description}
                    </Typography>
                  )}
                </Box>

                <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Résumé des composants */}
                  <Stack spacing={2} sx={{ flex: 1 }}>
                    {option.seafreights.length > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DirectionsBoat sx={{ color: '#1976d2', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {option.seafreights.length} offre{option.seafreights.length > 1 ? 's' : ''} maritime{option.seafreights.length > 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    )}
                    
                    {option.haulages.length > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DirectionsCar sx={{ color: '#f57c00', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {option.haulages.length} offre{option.haulages.length > 1 ? 's' : ''} terrestre{option.haulages.length > 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    )}
                    
                    {option.services.length > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Build sx={{ color: '#2e7d32', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {option.services.length} service{option.services.length > 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    )}

                    {option.createdAt && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime sx={{ color: '#666', fontSize: 16 }} />
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          Créé le {new Date(option.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  {/* Actions */}
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Tooltip title="Voir les détails" arrow>
                      <IconButton
                        size="small"
                        onClick={() => onViewOption(option)}
                        sx={{
                          color: '#1976d2',
                          background: 'rgba(25, 118, 210, 0.1)',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.2)',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Modifier l'option" arrow>
                      <IconButton
                        size="small"
                        onClick={() => onEditOption(option)}
                        sx={{
                          color: '#f57c00',
                          background: 'rgba(245, 124, 0, 0.1)',
                          '&:hover': {
                            backgroundColor: 'rgba(245, 124, 0, 0.2)',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Supprimer l'option" arrow>
                      <IconButton
                        size="small"
                        onClick={() => option.id && onDeleteOption(option.id)}
                        sx={{
                          color: '#d32f2f',
                          background: 'rgba(211, 47, 47, 0.1)',
                          '&:hover': {
                            backgroundColor: 'rgba(211, 47, 47, 0.2)',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Alerte limite atteinte */}
      {!canAddMore && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Alert 
            severity="warning" 
            sx={{ 
              mt: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%)',
              border: '1px solid rgba(255, 152, 0, 0.3)',
              boxShadow: '0 4px 20px rgba(255, 152, 0, 0.2)'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#e65100' }}>
              ⚠️ Limite d'options atteinte
            </Typography>
            <Typography variant="body2" sx={{ color: '#e65100', opacity: 0.8 }}>
              Vous avez atteint la limite de {maxOptions} options par brouillon. Supprimez une option existante pour en créer une nouvelle.
            </Typography>
          </Alert>
        </motion.div>
      )}
    </Box>
  );
};

export default ExistingOptionsDisplay;
