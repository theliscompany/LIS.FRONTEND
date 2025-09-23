import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  useTheme,
  alpha,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add,
  Delete,
  LocalShipping,
  DirectionsCar,
  Build,
  AttachMoney
} from '@mui/icons-material';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';

import { DraftQuoteForm } from '../schema';
import SeafreightSelection from '../components/SeafreightSelection';
import HaulageSelection from '../components/HaulageSelection';
import ServicesSelection from '../components/ServicesSelection';

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
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const OptionsStep: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const { control, formState: { errors } } = useFormContext<DraftQuoteForm>();

  const { fields: seafreightFields, append: appendSeafreight, remove: removeSeafreight } = useFieldArray({
    control,
    name: 'options.seafreights'
  });

  const { fields: haulageFields, append: appendHaulage, remove: removeHaulage } = useFieldArray({
    control,
    name: 'options.haulages'
  });

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control,
    name: 'options.services'
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const addSeafreight = () => {
    appendSeafreight({
      carrier: '',
      service: '',
      rates: [{ containerType: '', basePrice: 0 }]
    });
  };

  const addHaulage = () => {
    appendHaulage({
      mode: 'truck',
      leg: 'pre',
      price: 0
    });
  };

  const addService = () => {
    appendService({
      code: '',
      label: '',
      price: 0
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
        {/* Header */}
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
          elevation={0}
          sx={{
            borderRadius: 3,
            background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            overflow: 'hidden'
          }}
        >
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  py: 2
                }
              }}
            >
              <Tab
                icon={<LocalShipping />}
                iconPosition="start"
                label="Seafreight"
                id="options-tab-0"
                aria-controls="options-tabpanel-0"
              />
              <Tab
                icon={<DirectionsCar />}
                iconPosition="start"
                label="Haulage"
                id="options-tab-1"
                aria-controls="options-tabpanel-1"
              />
              <Tab
                icon={<Build />}
                iconPosition="start"
                label="Services"
                id="options-tab-2"
                aria-controls="options-tabpanel-2"
              />
            </Tabs>
          </Box>

          {/* Seafreight Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Seafreight Options ({seafreightFields.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={addSeafreight}
                sx={{ borderRadius: 2 }}
              >
                Add Seafreight
              </Button>
            </Box>

            <AnimatePresence>
              {seafreightFields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    sx={{
                      mb: 2,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      '&:hover': {
                        boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Option {index + 1}
                        </Typography>
                        <IconButton
                          color="error"
                          onClick={() => removeSeafreight(index)}
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Controller
                            name={`options.seafreights.${index}.carrier`}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Carrier"
                                placeholder="e.g., MSC, Maersk, CMA CGM"
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Controller
                            name={`options.seafreights.${index}.service`}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Service"
                                placeholder="e.g., Weekly, Bi-weekly"
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Controller
                            name={`options.seafreights.${index}.etd`}
                            control={control}
                            render={({ field }) => (
                              <DatePicker
                                {...field}
                                label="ETD"
                                value={field.value ? new Date(field.value) : null}
                                onChange={(date) => field.onChange(date?.toISOString())}
                                slotProps={{
                                  textField: {
                                    fullWidth: true
                                  }
                                }}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Controller
                            name={`options.seafreights.${index}.eta`}
                            control={control}
                            render={({ field }) => (
                              <DatePicker
                                {...field}
                                label="ETA"
                                value={field.value ? new Date(field.value) : null}
                                onChange={(date) => field.onChange(date?.toISOString())}
                                slotProps={{
                                  textField: {
                                    fullWidth: true
                                  }
                                }}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                        Rates
                      </Typography>
                      <List dense>
                        {field.rates?.map((rate: any, rateIndex: number) => (
                          <ListItem key={rateIndex} sx={{ px: 0 }}>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                  <TextField
                                    size="small"
                                    label="Container Type"
                                    value={rate.containerType}
                                    onChange={(e) => {
                                      // Handle rate update
                                    }}
                                    sx={{ flex: 1 }}
                                  />
                                  <TextField
                                    size="small"
                                    label="Price (€)"
                                    type="number"
                                    value={rate.basePrice}
                                    onChange={(e) => {
                                      // Handle rate update
                                    }}
                                    sx={{ width: 120 }}
                                  />
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {seafreightFields.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No seafreight options added yet
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={addSeafreight}
                >
                  Add your first seafreight option
                </Button>
              </Box>
            )}
          </TabPanel>

          {/* Haulage Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Haulage Options ({haulageFields.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={addHaulage}
                sx={{ borderRadius: 2 }}
              >
                Add Haulage
              </Button>
            </Box>

            <AnimatePresence>
              {haulageFields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    sx={{
                      mb: 2,
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                      '&:hover': {
                        boxShadow: `0 4px 20px ${alpha(theme.palette.secondary.main, 0.1)}`
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Haulage {index + 1}
                        </Typography>
                        <IconButton
                          color="error"
                          onClick={() => removeHaulage(index)}
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Controller
                            name={`options.haulages.${index}.mode`}
                            control={control}
                            render={({ field }) => (
                              <FormControl fullWidth>
                                <InputLabel>Mode</InputLabel>
                                <Select {...field} label="Mode">
                                  <MenuItem value="truck">Truck</MenuItem>
                                  <MenuItem value="rail">Rail</MenuItem>
                                  <MenuItem value="barge">Barge</MenuItem>
                                </Select>
                              </FormControl>
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Controller
                            name={`options.haulages.${index}.leg`}
                            control={control}
                            render={({ field }) => (
                              <FormControl fullWidth>
                                <InputLabel>Leg</InputLabel>
                                <Select {...field} label="Leg">
                                  <MenuItem value="pre">Pre-carriage</MenuItem>
                                  <MenuItem value="on">On-carriage</MenuItem>
                                  <MenuItem value="post">Post-carriage</MenuItem>
                                </Select>
                              </FormControl>
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Controller
                            name={`options.haulages.${index}.price`}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Price (€)"
                                type="number"
                                InputProps={{
                                  startAdornment: <AttachMoney />
                                }}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Controller
                            name={`options.haulages.${index}.note`}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Note (optional)"
                                multiline
                                rows={2}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {haulageFields.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No haulage options added yet
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={addHaulage}
                >
                  Add your first haulage option
                </Button>
              </Box>
            )}
          </TabPanel>

          {/* Services Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Additional Services ({serviceFields.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={addService}
                sx={{ borderRadius: 2 }}
              >
                Add Service
              </Button>
            </Box>

            <AnimatePresence>
              {serviceFields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    sx={{
                      mb: 2,
                      border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                      '&:hover': {
                        boxShadow: `0 4px 20px ${alpha(theme.palette.info.main, 0.1)}`
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Service {index + 1}
                        </Typography>
                        <IconButton
                          color="error"
                          onClick={() => removeService(index)}
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Controller
                            name={`options.services.${index}.code`}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Service Code"
                                placeholder="e.g., CUS, INS"
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Controller
                            name={`options.services.${index}.label`}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Service Label"
                                placeholder="e.g., Customs Clearance"
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <Controller
                            name={`options.services.${index}.price`}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Price (€)"
                                type="number"
                                InputProps={{
                                  startAdornment: <AttachMoney />
                                }}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {serviceFields.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No additional services added yet
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={addService}
                >
                  Add your first service
                </Button>
              </Box>
            )}
          </TabPanel>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};