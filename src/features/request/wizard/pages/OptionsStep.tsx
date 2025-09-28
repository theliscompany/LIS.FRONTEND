import React, { useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Paper, useTheme, alpha, Grid, Card, CardContent,
  Button, IconButton, TextField, FormControl, InputLabel, Select, MenuItem,
  Chip, Divider, Alert, AlertTitle, List, ListItem, ListItemText, ListItemSecondaryAction,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  RadioGroup, FormControlLabel, Radio, InputAdornment, Stack
} from '@mui/material';
import {
  Add,
  Delete,
  LocalShipping, // Used for Seafreight
  DirectionsCar, // Replaced DirectionsTruck for Haulage
  Build, // Used for Services
  AttachMoney,
  DirectionsBoat, // For ports/route
  Storage // For containers/cargo
} from '@mui/icons-material';
import { Controller, useFormContext, useFieldArray } from 'react-hook-form';
import { motion } from 'framer-motion';

import { DraftQuoteForm } from '../schema';
import SeafreightSelection from '../components/SeafreightSelection';
import HaulageSelection from '../components/HaulageSelection';
import ServicesSelection from '../components/ServicesSelection';
import PortAutocomplete from '../../../../components/shared/PortAutocomplete';
import SelectionDebugger from '../components/SelectionDebugger';
import { useDraftQuoteOptionTypes } from '@features/offer/hooks/useDraftQuoteOptionTypes';

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
      id={`options-tabpanel-${index}`}
      aria-labelledby={`options-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const OptionsStep: React.FC<OptionsStepProps> = ({ onSaveCurrentOption, draftId, readonly = false }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const { control, formState: { errors }, watch } = useFormContext<DraftQuoteForm>();
  
  // Hook pour récupérer les types d'options disponibles
  const { data: optionTypesData, isLoading: isLoadingOptionTypes } = useDraftQuoteOptionTypes();
  
  // Watch current option data
  const currentOption = watch('currentOption');

  const { fields: seafreightFields, append: appendSeafreight, remove: removeSeafreight } = useFieldArray({
    control,
    name: 'currentOption.seafreights'
  });

  const { fields: haulageFields, append: appendHaulage, remove: removeHaulage } = useFieldArray({
    control,
    name: 'currentOption.haulages'
  });

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control,
    name: 'currentOption.services'
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ maxWidth: { xs: '100%', sm: 1200, md: 1400, lg: 1600 }, mx: 'auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                Quote Option Details
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Configure your shipping preferences and additional services
              </Typography>
            </Box>
          </motion.div>


      <Paper
        elevation={3}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.grey[50], 0.95)})`,
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
        }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                py: 2,
                minHeight: 64,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.08)',
                  transform: 'translateY(-2px)'
                },
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: '8px 8px 0 0',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  transform: 'translateY(-2px)'
                }
              },
              '& .MuiTabs-indicator': {
                display: 'none'
              }
            }}
          >
            <Tab
              icon={<DirectionsBoat />}
              iconPosition="start"
              label="Route & Cargo"
              id="options-tab-0"
              aria-controls="options-tabpanel-0"
            />
            <Tab
              icon={<LocalShipping />}
              iconPosition="start"
              label="Seafreight"
              id="options-tab-1"
              aria-controls="options-tabpanel-1"
            />
            <Tab
              icon={<DirectionsCar />}
              iconPosition="start"
              label="Haulage"
              id="options-tab-2"
              aria-controls="options-tabpanel-2"
            />
            <Tab
              icon={<Build />}
              iconPosition="start"
              label="Services"
              id="options-tab-3"
              aria-controls="options-tabpanel-3"
            />
            <Tab
              icon={<AttachMoney />}
              iconPosition="start"
              label="Marge"
              id="options-tab-4"
              aria-controls="options-tabpanel-4"
            />
          </Tabs>
        </Box>

        {/* Route & Cargo Tab */}
        <TabPanel value={tabValue} index={0}>
          <RouteAndCargoConfiguration />
        </TabPanel>

        {/* Seafreight Tab */}
        <TabPanel value={tabValue} index={1}>
          <SeafreightSelection 
            onUpdate={(seafreights) => {
              console.log('Seafreight selection updated:', seafreights);
            }} 
          />
        </TabPanel>

        {/* Haulage Tab */}
        <TabPanel value={tabValue} index={2}>
          <HaulageSelection 
            onUpdate={(haulages) => {
              console.log('Haulage selection updated:', haulages);
            }} 
          />
        </TabPanel>

        {/* Services Tab */}
        <TabPanel value={tabValue} index={3}>
          <ServicesSelection 
            onUpdate={(services) => {
              console.log('Services selection updated:', services);
            }} 
          />
        </TabPanel>

        {/* Marge Tab */}
        <TabPanel value={tabValue} index={4}>
          <OptionMarginConfiguration />
        </TabPanel>
      </Paper>

      {/* Bouton de sauvegarde d'option */}
      {!readonly && onSaveCurrentOption && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={async () => {
              try {
                const optionName = `Option ${new Date().toLocaleDateString()}`;
                await onSaveCurrentOption(optionName);
                console.log('✅ Option sauvegardée:', optionName);
              } catch (error) {
                console.error('❌ Erreur lors de la sauvegarde de l\'option:', error);
              }
            }}
            sx={{
              background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1b5e20 0%, #388e3c 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(46, 125, 50, 0.4)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            💾 Sauvegarder cette option
          </Button>
        </Box>
      )}
    </Box>
  );
};

// Composant fusionné pour la configuration de la route et du cargo
const RouteAndCargoConfiguration: React.FC = () => {
  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ 
          textAlign: 'center', 
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          p: 3,
          color: 'white',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
        }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            mb: 1,
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            🚢 Route & Cargo Configuration
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Configure your shipping route and container requirements
          </Typography>
        </Box>
      </motion.div>
      
      {/* Section Configuration de base de l'option */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <OptionBasicConfiguration />
      </motion.div>
      
      <Grid container spacing={4}>
        {/* Section Route */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <RouteConfiguration />
          </motion.div>
        </Grid>
        
        {/* Section Cargo */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <CargoConfiguration />
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

// Composant pour la configuration de la route (ports)
const RouteConfiguration: React.FC = () => {
  const { control, watch } = useFormContext<DraftQuoteForm>();

  return (
    <Card sx={{
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
      border: '1px solid rgba(0,0,0,0.05)',
      overflow: 'hidden'
    }}>
      <Box sx={{
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        p: 2,
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DirectionsBoat sx={{ fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Port Configuration
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
          Select departure and arrival ports
        </Typography>
      </Box>
      
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mb: 2,
              p: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
              border: '1px solid rgba(25, 118, 210, 0.2)'
            }}>
              <Typography variant="subtitle1" sx={{ 
                fontWeight: 600, 
                color: '#1976d2',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                🚢 Port of Departure
              </Typography>
            </Box>
            <Controller
              name="basics.portFrom"
              control={control}
              render={({ field }) => (
                <PortAutocomplete
                  label="Select departure port"
                  value={field.value || undefined}
                  onChange={field.onChange}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mb: 2,
              p: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
              border: '1px solid rgba(76, 175, 80, 0.2)'
            }}>
              <Typography variant="subtitle1" sx={{ 
                fontWeight: 600, 
                color: '#2e7d32',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                🎯 Port of Arrival
              </Typography>
            </Box>
            <Controller
              name="basics.portTo"
              control={control}
              render={({ field }) => (
                <PortAutocomplete
                  label="Select arrival port"
                  value={field.value || undefined}
                  onChange={field.onChange}
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
};

// Composant pour la configuration du cargo (conteneurs)
const CargoConfiguration: React.FC = () => {
  const { control, watch } = useFormContext<DraftQuoteForm>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'basics.containers'
  });

  const [newContainerType, setNewContainerType] = useState("");
  const [newQuantity, setNewQuantity] = useState(1);

  const containerTypes = [
    '20ft Standard',
    '40ft Standard', 
    '40ft High Cube',
    '45ft High Cube'
  ];

  const getTEU = (containerType: string): number => {
    if (!containerType) return 0;
    const type = containerType.toLowerCase();
    if (type.includes("20")) return 1;
    if (type.includes("40")) return 2;
    if (type.includes("45")) return 2.25;
    return 0;
  };

  const addContainer = () => {
    if (newContainerType && newQuantity > 0) {
      append({
        containerType: newContainerType,
        quantity: newQuantity,
        teu: getTEU(newContainerType)
      });
      setNewContainerType("");
      setNewQuantity(1);
    }
  };

  const totalTEU = fields.reduce((sum, container) => 
    sum + getTEU(container.containerType) * container.quantity, 0
  );

  return (
    <Card sx={{
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
      border: '1px solid rgba(0,0,0,0.05)',
      overflow: 'hidden'
    }}>
      <Box sx={{
        background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
        p: 2,
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Storage sx={{ fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Container Configuration
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
          Add and manage your shipping containers
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        {/* Add Container Form */}
        <Card sx={{ 
          mb: 3, 
          p: 3,
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(240, 147, 251, 0.3)'
        }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            📦 Add New Container
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: 'white' }}>Container Type</InputLabel>
                <Select
                  value={newContainerType}
                  onChange={(e) => setNewContainerType(e.target.value)}
                  label="Container Type"
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderRadius: 2,
                    '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                  }}
                >
                  {containerTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: 'white' }}>Quantity</InputLabel>
                <Select
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(Number(e.target.value))}
                  label="Quantity"
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderRadius: 2,
                    '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <MenuItem key={num} value={num}>{num}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                onClick={addContainer}
                disabled={!newContainerType}
                fullWidth
                sx={{
                  background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
                  color: 'white',
                  borderRadius: 2,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4a9c2a 0%, #9dd4c0 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(86, 171, 47, 0.4)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                ➕ Add Container
              </Button>
            </Grid>
          </Grid>
        </Card>

        {/* Containers List */}
        {fields.length > 0 && (
          <TableContainer component={Paper} sx={{
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            overflow: 'hidden'
          }}>
            <Table>
              <TableHead>
                <TableRow sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '& .MuiTableCell-head': {
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1rem'
                  }
                }}>
                  <TableCell>Container Type</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>TEU/Unit</TableCell>
                  <TableCell>Total TEU</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow 
                    key={field.id}
                    sx={{
                      '&:nth-of-type(odd)': { 
                        backgroundColor: 'rgba(102, 126, 234, 0.02)' 
                      },
                      '&:hover': { 
                        backgroundColor: 'rgba(102, 126, 234, 0.08)',
                        transform: 'scale(1.01)',
                        transition: 'all 0.2s ease'
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ 
                          width: 40, 
                          height: 40,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                        }}>
                          <Storage sx={{ color: 'white' }} />
                        </Avatar>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {field.containerType}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={field.quantity} 
                        color="primary"
                        sx={{
                          fontWeight: 600,
                          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                          color: 'white',
                          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {getTEU(field.containerType)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ 
                        fontWeight: 700,
                        color: '#2e7d32',
                        fontSize: '1.1rem'
                      }}>
                        {(getTEU(field.containerType) * field.quantity).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => remove(index)}
                        sx={{
                          color: '#e74c3c',
                          '&:hover': {
                            backgroundColor: 'rgba(231, 76, 60, 0.1)',
                            transform: 'scale(1.1)',
                            boxShadow: '0 4px 12px rgba(231, 76, 60, 0.3)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  '& .MuiTableCell-root': {
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.1rem'
                  }
                }}>
                  <TableCell colSpan={3} align="right">
                    🎯 Total TEU
                  </TableCell>
                  <TableCell sx={{ fontSize: '1.2rem' }}>
                    {totalTEU.toFixed(2)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {fields.length === 0 && (
          <Alert 
            severity="info" 
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
              border: '1px solid rgba(25, 118, 210, 0.2)',
              '& .MuiAlert-icon': {
                fontSize: '1.5rem'
              }
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              📦 No containers added yet
            </Typography>
            <Typography variant="body2">
              Please add at least one container to continue with your quote.
            </Typography>
          </Alert>
        )}
      </Box>
    </Card>
  );
};

// Composant pour la configuration de base de l'option
const OptionBasicConfiguration: React.FC = () => {
  const { control, watch } = useFormContext<DraftQuoteForm>();
  const { data: optionTypesData, isLoading: isLoadingOptionTypes } = useDraftQuoteOptionTypes();
  const theme = useTheme();

  return (
    <Card sx={{
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
      border: '1px solid rgba(0,0,0,0.05)',
      overflow: 'hidden',
      mb: 4
    }}>
      <Box sx={{
        background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
        p: 2,
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Build sx={{ fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Configuration de l'Option
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
          Définissez le type et les informations de base de cette option
        </Typography>
      </Box>
      
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Controller
              name="currentOption.optionType"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Type d'option</InputLabel>
                  <Select
                    {...field}
                    value={field.value || ''}
                    label="Type d'option"
                    disabled={isLoadingOptionTypes}
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
                  {isLoadingOptionTypes && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      Chargement des types d'options...
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Controller
              name="currentOption.name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ''}
                  fullWidth
                  label="Nom de l'option"
                  placeholder="Ex: Option Express, Option Standard..."
                  variant="outlined"
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Controller
              name="currentOption.description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ''}
                  fullWidth
                  label="Description de l'option"
                  placeholder="Décrivez cette option (priorité délai, priorité coût, etc.)"
                  variant="outlined"
                  multiline
                  rows={2}
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
};

// Composant pour la configuration de la marge bénéficiaire
const OptionMarginConfiguration: React.FC = () => {
  const { control, watch } = useFormContext<DraftQuoteForm>();
  const theme = useTheme();

  return (
    <Card sx={{
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
      border: '1px solid rgba(0,0,0,0.05)',
      overflow: 'hidden'
    }}>
      <Box sx={{
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        p: 2,
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AttachMoney sx={{ fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Configuration de la Marge Bénéficiaire
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
          Définissez la marge bénéficiaire pour cette option
        </Typography>
      </Box>
      
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Controller
              name="currentOption.margin.type"
              control={control}
              render={({ field }) => (
                <FormControl component="fieldset">
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Type de marge
                  </Typography>
                  <RadioGroup
                    {...field}
                    value={field.value || 'percentage'}
                    row
                    sx={{ gap: 2 }}
                  >
                    <FormControlLabel 
                      value="percentage" 
                      control={<Radio size="small" />} 
                      label="Pourcentage (%)" 
                    />
                    <FormControlLabel 
                      value="fixed" 
                      control={<Radio size="small" />} 
                      label="Montant fixe (€)" 
                    />
                  </RadioGroup>
                </FormControl>
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Controller
              name="currentOption.margin.value"
              control={control}
              render={({ field }) => {
                const marginType = watch('currentOption.margin.type') || 'percentage';
                return (
                  <TextField
                    {...field}
                    value={field.value || 0}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Convertir en nombre ou 0 si vide
                      const numericValue = value === '' ? 0 : parseFloat(value) || 0;
                      field.onChange(numericValue);
                    }}
                    fullWidth
                    label={marginType === 'percentage' ? 'Pourcentage de marge' : 'Montant de marge'}
                    type="number"
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {marginType === 'percentage' ? '%' : '€'}
                        </InputAdornment>
                      ),
                    }}
                    helperText={
                      marginType === 'percentage' 
                        ? 'Ex: 15 pour 15% de marge'
                        : 'Ex: 500 pour 500€ de marge fixe'
                    }
                  />
                );
              }}
            />
          </Grid>
        </Grid>
        
        {/* Aperçu du calcul de marge */}
        <Box sx={{ 
          mt: 3, 
          p: 2, 
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.primary.main }}>
            💰 Aperçu du calcul
          </Typography>
          <Typography variant="body2" color="text.secondary">
            La marge sera calculée automatiquement et ajoutée au total de l'option.
            Vous pourrez voir le détail dans l'aperçu en temps réel.
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

interface OptionsStepProps {
  onSaveCurrentOption?: (optionName: string, optionDescription?: string) => Promise<any>;
  draftId?: string | null;
  readonly?: boolean;
}
