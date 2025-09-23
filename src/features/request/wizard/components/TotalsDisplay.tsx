import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  AttachMoney,
  Euro,
  TrendingUp,
  Assessment
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { DraftQuoteForm, QuoteOption } from '../schema';

interface TotalsDisplayProps {
  formData: DraftQuoteForm;
}

export const TotalsDisplay: React.FC<TotalsDisplayProps> = ({ formData }) => {
  const theme = useTheme();

  // Fonction utilitaire pour calculer le total d'une option
  const calculateOptionTotal = (option: any): number => {
    let total = 0;

    // Ajouter les prix des seafreights
    option.seafreights?.forEach((sf: any) => {
      sf.rates?.forEach((rate: any) => {
        total += rate.basePrice || 0;
      });
    });

    // Ajouter les prix des haulages
    option.haulages?.forEach((haulage: any) => {
      total += haulage.price || 0;
    });

    // Ajouter les prix des services
    option.services?.forEach((service: any) => {
      total += service.price || 0;
    });

    return total;
  };

  // Calculer le total de l'option actuelle
  const calculateCurrentOptionTotal = (): number => {
    const currentOption = formData.currentOption;
    if (!currentOption) return 0;
    return calculateOptionTotal(currentOption);
  };

  // Calculer le total de toutes les options existantes
  const calculateExistingOptionsTotal = (): number => {
    const existingOptions = formData.existingOptions || [];
    return existingOptions.reduce((total, option) => {
      return total + calculateOptionTotal(option);
    }, 0);
  };

  // Calculer le total général
  const calculateGrandTotal = (): number => {
    return calculateCurrentOptionTotal() + calculateExistingOptionsTotal();
  };

  // Compter les éléments sélectionnés
  const getCurrentOptionCounts = () => {
    const currentOption = formData.currentOption;
    return {
      seafreights: currentOption?.seafreights?.length || 0,
      haulages: currentOption?.haulages?.length || 0,
      services: currentOption?.services?.length || 0
    };
  };

  const getExistingOptionsCounts = () => {
    const existingOptions = formData.existingOptions || [];
    return {
      totalOptions: existingOptions.length,
      totalSeafreights: existingOptions.reduce((sum, option) => sum + (option.seafreights?.length || 0), 0),
      totalHaulages: existingOptions.reduce((sum, option) => sum + (option.haulages?.length || 0), 0),
      totalServices: existingOptions.reduce((sum, option) => sum + (option.services?.length || 0), 0)
    };
  };

  const currentOptionTotal = calculateCurrentOptionTotal();
  const existingOptionsTotal = calculateExistingOptionsTotal();
  const grandTotal = calculateGrandTotal();
  const currentCounts = getCurrentOptionCounts();
  const existingCounts = getExistingOptionsCounts();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card sx={{
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Assessment sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
              💰 Totaux Calculés
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Option Actuelle */}
            <Grid item xs={12} md={6}>
              <Box sx={{
                p: 2,
                borderRadius: 2,
                background: alpha(theme.palette.info.main, 0.1),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: theme.palette.info.main }}>
                  📝 Option en cours
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Seafreights:</Typography>
                    <Chip 
                      label={currentCounts.seafreights} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Haulages:</Typography>
                    <Chip 
                      label={currentCounts.haulages} 
                      size="small" 
                      color="secondary" 
                      variant="outlined"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Services:</Typography>
                    <Chip 
                      label={currentCounts.services} 
                      size="small" 
                      color="success" 
                      variant="outlined"
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Total:
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    color: currentOptionTotal > 0 ? theme.palette.success.main : theme.palette.text.secondary
                  }}>
                    {formatPrice(currentOptionTotal)}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Options Existantes */}
            <Grid item xs={12} md={6}>
              <Box sx={{
                p: 2,
                borderRadius: 2,
                background: alpha(theme.palette.success.main, 0.1),
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: theme.palette.success.main }}>
                  ✅ Options sauvegardées
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Options:</Typography>
                    <Chip 
                      label={existingCounts.totalOptions} 
                      size="small" 
                      color="success" 
                      variant="outlined"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Seafreights:</Typography>
                    <Chip 
                      label={existingCounts.totalSeafreights} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Haulages:</Typography>
                    <Chip 
                      label={existingCounts.totalHaulages} 
                      size="small" 
                      color="secondary" 
                      variant="outlined"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Services:</Typography>
                    <Chip 
                      label={existingCounts.totalServices} 
                      size="small" 
                      color="success" 
                      variant="outlined"
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Total:
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    color: existingOptionsTotal > 0 ? theme.palette.success.main : theme.palette.text.secondary
                  }}>
                    {formatPrice(existingOptionsTotal)}
                  </Typography>
                </Box>
              </Box>
            </Grid>


            {/* Total Général */}
            <Grid item xs={12}>
              <Box sx={{
                p: 3,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                textAlign: 'center'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                  <TrendingUp sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                    Total Général
                  </Typography>
                </Box>
                
                <Typography variant="h3" sx={{ 
                  fontWeight: 800, 
                  color: grandTotal > 0 ? theme.palette.primary.main : theme.palette.text.secondary,
                  background: grandTotal > 0 ? `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` : 'none',
                  backgroundClip: grandTotal > 0 ? 'text' : 'initial',
                  WebkitBackgroundClip: grandTotal > 0 ? 'text' : 'initial',
                  WebkitTextFillColor: grandTotal > 0 ? 'transparent' : 'initial'
                }}>
                  {formatPrice(grandTotal)}
                </Typography>

                {grandTotal > 0 && (
                  <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                    {existingCounts.totalOptions} option(s) sauvegardée(s) + option en cours
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
};
