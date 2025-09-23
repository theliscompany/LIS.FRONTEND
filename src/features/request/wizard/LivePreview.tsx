import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  useTheme,
  alpha,
  Fade,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  LocationOn,
  LocalShipping,
  Inventory,
  AttachMoney,
  Schedule,
  CheckCircle,
  Info,
  Business,
  Person,
  AssignmentInd,
  DirectionsBoat,
  DirectionsCar,
  Build,
  Euro
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { DraftQuoteForm } from './schema';

interface LivePreviewProps {
  values: DraftQuoteForm;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ values }) => {
  const theme = useTheme();

  const getCargoTypeColor = (cargoType: string) => {
    switch (cargoType) {
      case 'FCL': return theme.palette.primary.main;
      case 'LCL': return theme.palette.secondary.main;
      case 'AIR': return theme.palette.info.main;
      default: return theme.palette.grey[500];
    }
  };

  const getCargoTypeIcon = (cargoType: string) => {
    switch (cargoType) {
      case 'FCL': return '📦';
      case 'LCL': return '📋';
      case 'AIR': return '✈️';
      default: return '📦';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.secondary.main, 0.02)})`,
          border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.secondary.main, 0.1)}`,
          position: 'sticky',
          top: 24,
          maxHeight: 'calc(100vh - 48px)',
          overflow: 'auto'
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Live Preview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time quote summary
          </Typography>
        </Box>


        <Divider sx={{ mb: 3 }} />

        {/* Informations générales */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: theme.palette.primary.main }}>
            📋 Informations Générales
          </Typography>
          
          {/* Route */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn color="primary" fontSize="small" />
              Route
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                  FROM
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {values.basics?.origin?.city || 'Select origin'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {values.basics?.origin?.country || ''}
                </Typography>
              </Box>
              
              <Box sx={{ 
                width: 40, 
                height: 2, 
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                borderRadius: 1
              }} />
              
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                  TO
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {values.basics?.destination?.city || 'Select destination'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {values.basics?.destination?.country || ''}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Client & Assignee */}
          {(values.basics?.client || values.basics?.assignee) && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person color="primary" fontSize="small" />
                Client & Assigné
              </Typography>
              
              {values.basics?.client && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                    CLIENT
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Business color="primary" fontSize="small" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {values.basics.client.companyName || 'Company Name'}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {values.basics.client.contactFullName || 'Contact Name'}
                  </Typography>
                </Box>
              )}
              
              {values.basics?.assignee && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                    ASSIGNÉ
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentInd color="secondary" fontSize="small" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {values.basics.assignee.fullName || 'Assignee Name'}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {values.basics.assignee.email || 'assignee@email.com'}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Cargo */}
          {values.basics?.cargo && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Inventory color="primary" fontSize="small" />
                Cargo
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Chip
                  label={values.basics.cargoType}
                  color={getCargoTypeColor(values.basics.cargoType) as any}
                  variant="outlined"
                  icon={<span>{getCargoTypeIcon(values.basics.cargoType)}</span>}
                />
                <Typography variant="body2" color="text.secondary">
                  {values.basics.cargo.containers?.length || 0} containers
                </Typography>
              </Box>
            </Box>
          )}

          {/* Incoterm */}
          {values.basics?.incoterm && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalShipping color="primary" fontSize="small" />
                Incoterm
              </Typography>
              <Chip
                label={values.basics.incoterm}
                color="primary"
                variant="outlined"
              />
            </Box>
          )}

          {/* Departure Date */}
          {values.basics?.requestedDeparture && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule color="primary" fontSize="small" />
                Date de départ
              </Typography>
              <Typography variant="body2">
                {format(new Date(values.basics.requestedDeparture), 'dd/MM/yyyy')}
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Option en cours */}
        {values.currentOption && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: theme.palette.info.main }}>
              📝 Option en cours
            </Typography>
            <OptionDetails option={values.currentOption} isCurrentOption />
          </Box>
        )}

        {/* Message si aucune option en cours */}
        {!values.currentOption && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Commencez à sélectionner des offres pour voir l'option en cours
            </Typography>
          </Box>
        )}

        {/* Empty State */}
        {!values.basics?.origin?.city && !values.basics?.destination?.city && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Start filling the form to see a live preview of your quote
            </Typography>
          </Box>
        )}
      </Paper>
    </motion.div>
  );
};

// Composant pour afficher les détails d'une option
const OptionDetails: React.FC<{ option: any; isCurrentOption?: boolean }> = ({ option, isCurrentOption = false }) => {
  const theme = useTheme();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(price);
  };

  // Calculer le total de l'option en temps réel
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

  const optionTotal = calculateOptionTotal(option);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{
        borderRadius: 2,
        background: isCurrentOption 
          ? `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`
          : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
        border: `1px solid ${isCurrentOption ? alpha(theme.palette.info.main, 0.2) : alpha(theme.palette.primary.main, 0.2)}`
      }}>
        <CardContent sx={{ p: 2 }}>
          {/* Nom et description de l'option */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              {option.name || 'Option sans nom'}
            </Typography>
            {option.description && (
              <Typography variant="body2" color="text.secondary">
                {option.description}
              </Typography>
            )}
          </Box>

          <Grid container spacing={2}>
            {/* Seafreights */}
            {option.seafreights && option.seafreights.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DirectionsBoat color="primary" fontSize="small" />
                    Seafreights ({option.seafreights.length})
                  </Typography>
                  <List dense>
                    {option.seafreights.map((sf: any, index: number) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemText
                          primary={`${sf.carrier} - ${sf.service}`}
                          secondary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: 'rgba(0, 0, 0, 0.6)' }}>
                                ETD: {sf.etd ? format(new Date(sf.etd), 'dd/MM/yyyy') : 'N/A'} | 
                                ETA: {sf.eta ? format(new Date(sf.eta), 'dd/MM/yyyy') : 'N/A'}
                              </span>
                              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                {sf.rates?.reduce((sum: number, rate: any) => sum + (rate.basePrice || 0), 0) > 0 
                                  ? formatPrice(sf.rates.reduce((sum: number, rate: any) => sum + (rate.basePrice || 0), 0))
                                  : 'Prix N/A'
                                }
                              </span>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Grid>
            )}

            {/* Haulages */}
            {option.haulages && option.haulages.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DirectionsCar color="secondary" fontSize="small" />
                    Haulages ({option.haulages.length})
                  </Typography>
                  <List dense>
                    {option.haulages.map((haulage: any, index: number) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemText
                          primary={`${haulage.mode || 'Haulage'} - ${haulage.leg || 'Leg'}`}
                          secondary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: 'rgba(0, 0, 0, 0.6)' }}>
                                {haulage.note || 'Aucune note'}
                              </span>
                              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                {formatPrice(haulage.price || 0)}
                              </span>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Grid>
            )}

            {/* Services */}
            {option.services && option.services.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Build color="success" fontSize="small" />
                    Services ({option.services.length})
                  </Typography>
                  <List dense>
                    {option.services.map((service: any, index: number) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemText
                          primary={`${service.code} - ${service.label}`}
                          secondary={
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, textAlign: 'right', display: 'block' }}>
                              {formatPrice(service.price || 0)}
                            </span>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Grid>
            )}
          </Grid>

           {/* Total de l'option */}
           {optionTotal > 0 && (
             <>
               <Divider sx={{ my: 2 }} />
               <Box sx={{ 
                 display: 'flex', 
                 justifyContent: 'space-between', 
                 alignItems: 'center',
                 p: 1,
                 borderRadius: 1,
                 background: alpha(theme.palette.primary.main, 0.1)
               }}>
                 <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                   Total de l'option:
                 </Typography>
                 <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                   {formatPrice(optionTotal)}
                 </Typography>
               </Box>
             </>
           )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
