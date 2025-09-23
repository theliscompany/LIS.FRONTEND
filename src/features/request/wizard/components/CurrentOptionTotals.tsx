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

            {/* Divider */}
            <Divider sx={{ my: 2 }} />

            {/* Total cumulé */}
            <Box sx={{ 
              textAlign: 'center',
              p: 4,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.secondary.main, 0.15)} 100%)`,
              border: `3px solid ${alpha(theme.palette.primary.main, 0.4)}`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                zIndex: 0
              }
            }}>
              {/* Contenu centré */}
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                {/* Icône et titre */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                  <TrendingUp sx={{ 
                    color: theme.palette.primary.main, 
                    fontSize: 36,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }} />
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: theme.palette.primary.main,
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    Total cumulé
                  </Typography>
                </Box>
                
                {/* Montant principal */}
                <Typography variant="h2" sx={{ 
                  fontWeight: 900, 
                  color: totals.total > 0 ? theme.palette.primary.main : theme.palette.text.secondary,
                  background: totals.total > 0 ? `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` : 'none',
                  backgroundClip: totals.total > 0 ? 'text' : 'initial',
                  WebkitBackgroundClip: totals.total > 0 ? 'text' : 'initial',
                  WebkitTextFillColor: totals.total > 0 ? 'transparent' : 'initial',
                  textShadow: totals.total > 0 ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                  mb: 1
                }}>
                  {formatPrice(totals.total)}
                </Typography>
                
                {/* Sous-titre informatif */}
                <Typography variant="body2" sx={{ 
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                  opacity: 0.8
                }}>
                  {totals.total > 0 ? 'Montant total de l\'option' : 'Aucun montant sélectionné'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};
