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
  TrendingUp,
  Assessment
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { DraftQuoteForm } from '../schema';

interface CurrentOptionTotalsProps {
  formData: DraftQuoteForm;
}

export const CurrentOptionTotals: React.FC<CurrentOptionTotalsProps> = ({ formData }) => {
  const theme = useTheme();

  // Calculer les totaux par rubrique
  const calculateTotalsByCategory = () => {
    const currentOption = formData.currentOption;
    if (!currentOption) {
      return {
        seafreights: 0,
        haulages: 0,
        services: 0,
        total: 0
      };
    }

    let seafreightsTotal = 0;
    let haulagesTotal = 0;
    let servicesTotal = 0;

    // Calculer le total des seafreights
    currentOption.seafreights?.forEach((sf: any) => {
      sf.rates?.forEach((rate: any) => {
        seafreightsTotal += rate.basePrice || 0;
      });
    });

    // Calculer le total des haulages
    currentOption.haulages?.forEach((haulage: any) => {
      haulagesTotal += haulage.price || 0;
    });

    // Calculer le total des services
    currentOption.services?.forEach((service: any) => {
      servicesTotal += service.price || 0;
    });

    const total = seafreightsTotal + haulagesTotal + servicesTotal;

    return {
      seafreights: seafreightsTotal,
      haulages: haulagesTotal,
      services: servicesTotal,
      total
    };
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

  const totals = calculateTotalsByCategory();
  const currentCounts = getCurrentOptionCounts();

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
              💰 Totaux de l'Option en Cours
            </Typography>
          </Box>

          {/* Un seul bloc avec les rubriques et leurs totaux */}
          <Box sx={{
            p: 3,
            borderRadius: 2,
            background: alpha(theme.palette.info.main, 0.05),
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: theme.palette.info.main }}>
              📊 Détail des totaux par rubrique
            </Typography>
            
            {/* Rubriques avec leurs totaux */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              {/* Seafreights */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 2,
                borderRadius: 1,
                background: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip 
                    label={currentCounts.seafreights} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Seafreights
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  color: totals.seafreights > 0 ? theme.palette.primary.main : theme.palette.text.secondary
                }}>
                  {formatPrice(totals.seafreights)}
                </Typography>
              </Box>

              {/* Haulages */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 2,
                borderRadius: 1,
                background: alpha(theme.palette.secondary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip 
                    label={currentCounts.haulages} 
                    size="small" 
                    color="secondary" 
                    variant="outlined"
                  />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Haulages
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  color: totals.haulages > 0 ? theme.palette.secondary.main : theme.palette.text.secondary
                }}>
                  {formatPrice(totals.haulages)}
                </Typography>
              </Box>

              {/* Services */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 2,
                borderRadius: 1,
                background: alpha(theme.palette.success.main, 0.05),
                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip 
                    label={currentCounts.services} 
                    size="small" 
                    color="success" 
                    variant="outlined"
                  />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Services
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  color: totals.services > 0 ? theme.palette.success.main : theme.palette.text.secondary
                }}>
                  {formatPrice(totals.services)}
                </Typography>
              </Box>
            </Box>

          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};
