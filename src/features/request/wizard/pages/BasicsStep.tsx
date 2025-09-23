import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  useTheme,
  alpha,
  Chip,
  Autocomplete,
  Divider
} from '@mui/material';
import {
  Business, Person, Email, Phone, AssignmentInd
} from '@mui/icons-material';
import { Controller, useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import { format } from 'date-fns';
import { formatDisplayDate, toValidDisplayDate } from '../utils/dateUtils';

import { DraftQuoteForm } from '../schema';

const cargoTypes = [
  { value: 'FCL', label: 'FCL - Full Container Load', icon: '📦' },
  { value: 'LCL', label: 'LCL - Less than Container Load', icon: '📋' },
  { value: 'AIR', label: 'AIR - Air Freight', icon: '✈️' }
];

const incoterms = [
  'EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP',
  'FAS', 'FOB', 'CFR', 'CIF'
];

const countries = [
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CM', name: 'Cameroon' }
];

const getCargoTypeIcon = (cargoType: string): string => {
  switch (cargoType) {
    case 'FCL': return '📦';
    case 'LCL': return '📋';
    case 'AIR': return '✈️';
    default: return '📦';
  }
};

interface BasicsStepProps {
  readonly?: boolean;
  requestData?: any;
}

export const BasicsStep: React.FC<BasicsStepProps> = ({ readonly = false, requestData }) => {
  const theme = useTheme();
  const { control, formState: { errors }, watch } = useFormContext<DraftQuoteForm>();
  
  // Debug: Afficher les données reçues
  console.log('[BasicsStep] Props reçues:', { readonly, requestData });
  
  // Récupérer les données du formulaire (qui contiennent déjà client et assignee)
  const formData = watch('basics');
  console.log('[BasicsStep] Données du formulaire:', formData);
  console.log('[BasicsStep] Données de requête:', requestData);
  
  // Utiliser les données du formulaire qui sont déjà adaptées par l'adaptateur
  const displayData = formData;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <Box sx={{ maxWidth: { xs: '100%', sm: 1000, md: 1200, lg: 1400 }, mx: 'auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                        {readonly ? 'Request Information' : 'Create Quote Option'}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {readonly
                          ? 'Review the existing request details'
                          : 'Configure the first option for this quote'
                        }
                      </Typography>
            {readonly && (
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                bgcolor: alpha(theme.palette.info.main, 0.1), 
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
              }}>
                <Typography variant="body2" color="info.main" sx={{ fontWeight: 600 }}>
                  📋 This information is from the existing request and cannot be modified
                </Typography>
              </Box>
            )}
          </Box>
        </motion.div>

        {/* Informations Client et Assigné */}
        {displayData?.client || displayData?.assignee ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Paper
              elevation={2}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 2,
                background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.grey[50], 0.95)})`,
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                👥 Client & Assigné
              </Typography>
              
              <Grid container spacing={3}>
                {/* Informations Client */}
                {displayData?.client && (
                  <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      p: 2, 
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`, 
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.primary.main, 0.05)
                    }}>
                      <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Business fontSize="small" />
                        Informations Client
                      </Typography>
                      
                      {displayData.client.companyName && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Société
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {displayData.client.companyName}
                          </Typography>
                        </Box>
                      )}
                      
                      {displayData.client.contactFullName && (
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person fontSize="small" color="action" />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {displayData.client.contactFullName}
                          </Typography>
                        </Box>
                      )}
                      
                      {displayData.client.email && (
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Email fontSize="small" color="action" />
                          <Typography variant="body2">
                            {displayData.client.email}
                          </Typography>
                        </Box>
                      )}
                      
                      {displayData.client.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Phone fontSize="small" color="action" />
                          <Typography variant="body2">
                            {displayData.client.phone}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                )}

                {/* Informations Assigné */}
                {displayData?.assignee && (
                  <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      p: 2, 
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`, 
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.secondary.main, 0.05)
                    }}>
                      <Typography variant="subtitle2" color="secondary.main" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AssignmentInd fontSize="small" />
                        Assigné à
                      </Typography>
                      
                      {displayData.assignee.assigneeDisplayName && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person fontSize="small" color="action" />
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {displayData.assignee.assigneeDisplayName}
                          </Typography>
                        </Box>
                      )}
                      
                      {displayData.assignee.assigneeId && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          ID: {displayData.assignee.assigneeId}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </motion.div>
        ) : null}

        <Grid container spacing={4}>
          {/* Cargo Type */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {readonly ? (
                <Box sx={{ 
                  p: 2, 
                  border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`, 
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.grey[50], 0.5)
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Cargo Type
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ fontSize: '20px' }}>
                      {getCargoTypeIcon(displayData?.cargoType || 'FCL')}
                    </span>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {cargoTypes.find(t => t.value === displayData?.cargoType)?.label || displayData?.cargoType}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Controller
                  name="basics.cargoType"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.basics?.cargoType}>
                      <InputLabel>Cargo Type *</InputLabel>
                      <Select
                        {...field}
                        label="Cargo Type *"
                        sx={{
                          '& .MuiSelect-select': {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }
                        }}
                      >
                        {cargoTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span style={{ fontSize: '20px' }}>{type.icon}</span>
                              <Box>
                                <Typography variant="body1">{type.label}</Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              )}
            </motion.div>
          </Grid>

          {/* Incoterm */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {readonly ? (
                <Box sx={{ 
                  p: 2, 
                  border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`, 
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.grey[50], 0.5)
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Incoterm
                  </Typography>
                  <Chip 
                    label={displayData?.incoterm || 'N/A'} 
                    size="small" 
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              ) : (
                <Controller
                  name="basics.incoterm"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={incoterms}
                      freeSolo
                      value={field.value || ''}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Incoterm *"
                          error={!!errors.basics?.incoterm}
                          helperText={errors.basics?.incoterm?.message}
                        />
                      )}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <Chip 
                            label={option || ''} 
                            size="small" 
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                          {option || ''}
                        </Box>
                      )}
                      onChange={(_, value) => field.onChange(value || '')}
                    />
                  )}
                />
              )}
            </motion.div>
          </Grid>

          {/* Origin */}
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.02)})`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  🚚 Origin
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    {readonly ? (
                      <Box sx={{ 
                        p: 2, 
                        border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`, 
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.grey[50], 0.5)
                      }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          City
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {displayData?.origin?.city || 'N/A'}
                        </Typography>
                      </Box>
                    ) : (
                      <Controller
                        name="basics.origin.city"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="City *"
                            error={!!errors.basics?.origin?.city}
                            helperText={errors.basics?.origin?.city?.message}
                          />
                        )}
                      />
                    )}
                  </Grid>
                  <Grid item xs={12} md={4}>
                    {readonly ? (
                      <Box sx={{ 
                        p: 2, 
                        border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`, 
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.grey[50], 0.5)
                      }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Country
                        </Typography>
                        <Typography variant="body2">
                          {displayData?.origin?.country || 'N/A'}
                        </Typography>
                      </Box>
                    ) : (
                      <Controller
                        name="basics.origin.country"
                        control={control}
                        render={({ field }) => (
                          <Autocomplete
                            options={countries}
                            getOptionLabel={(option) => option?.name || ''}
                            value={countries.find(country => country.name === field.value) || null}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Country *"
                                error={!!errors.basics?.origin?.country}
                              />
                            )}
                            renderOption={(props, option) => (
                              <Box component="li" {...props}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 40 }}>
                                    {option?.code || ''}
                                  </Typography>
                                  <Typography variant="body2">
                                    {option?.name || ''}
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                            onChange={(_, value) => field.onChange(value?.name || '')}
                          />
                        )}
                      />
                    )}
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          </Grid>

          {/* Destination */}
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.02)})`,
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  🎯 Destination
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    {readonly ? (
                      <Box sx={{ 
                        p: 2, 
                        border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`, 
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.grey[50], 0.5)
                      }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          City
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {displayData?.destination?.city || 'N/A'}
                        </Typography>
                      </Box>
                    ) : (
                      <Controller
                        name="basics.destination.city"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="City *"
                            error={!!errors.basics?.destination?.city}
                            helperText={errors.basics?.destination?.city?.message}
                          />
                        )}
                      />
                    )}
                  </Grid>
                  <Grid item xs={12} md={4}>
                    {readonly ? (
                      <Box sx={{ 
                        p: 2, 
                        border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`, 
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.grey[50], 0.5)
                      }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Country
                        </Typography>
                        <Typography variant="body2">
                          {displayData?.destination?.country || 'N/A'}
                        </Typography>
                      </Box>
                    ) : (
                      <Controller
                        name="basics.destination.country"
                        control={control}
                        render={({ field }) => (
                          <Autocomplete
                            options={countries}
                            getOptionLabel={(option) => option?.name || ''}
                            value={countries.find(country => country.name === field.value) || null}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Country *"
                                error={!!errors.basics?.destination?.country}
                              />
                            )}
                            renderOption={(props, option) => (
                              <Box component="li" {...props}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 40 }}>
                                    {option?.code || ''}
                                  </Typography>
                                  <Typography variant="body2">
                                    {option?.name || ''}
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                            onChange={(_, value) => field.onChange(value?.name || '')}
                          />
                        )}
                      />
                    )}
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          </Grid>

          {/* Requested Departure */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {readonly ? (
                <Box sx={{ 
                  p: 2, 
                  border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`, 
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.grey[50], 0.5)
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Requested Departure
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatDisplayDate(displayData?.requestedDeparture)}
                  </Typography>
                </Box>
              ) : (
                <Controller
                  name="basics.requestedDeparture"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Requested Departure"
                      value={toValidDisplayDate(field.value)}
                      onChange={(date) => {
                        if (date && !isNaN(date.getTime()) && date.getFullYear() > 1900) {
                          field.onChange(date.toISOString());
                        } else {
                          // Si date invalide, utiliser la date d'aujourd'hui
                          field.onChange(new Date().toISOString());
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.basics?.requestedDeparture,
                          helperText: errors.basics?.requestedDeparture?.message
                        }
                      }}
                    />
                  )}
                />
              )}
            </motion.div>
          </Grid>

          {/* Goods Description */}
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {readonly ? (
                <Box sx={{ 
                  p: 2, 
                  border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`, 
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.grey[50], 0.5)
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Goods Description
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, fontStyle: 'italic' }}>
                    "{displayData?.goodsDescription || 'N/A'}"
                  </Typography>
                </Box>
              ) : (
                <Controller
                  name="basics.goodsDescription"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={3}
                      label="Goods Description *"
                      placeholder="Describe the goods you want to ship..."
                      error={!!errors.basics?.goodsDescription}
                      helperText={errors.basics?.goodsDescription?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: theme.palette.primary.main,
                          },
                        }
                      }}
                    />
                  )}
                />
              )}
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};