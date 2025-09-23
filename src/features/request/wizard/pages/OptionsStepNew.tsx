import React, { useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Paper, useTheme, alpha, Grid, Card, CardContent,
  Button, IconButton, TextField, FormControl, InputLabel, Select, MenuItem,
  Chip, Divider, Alert, AlertTitle, List, ListItem, ListItemText, ListItemSecondaryAction
} from '@mui/material';
import {
  Add,
  Delete,
  LocalShipping, // Used for Seafreight
  DirectionsCar, // Replaced DirectionsTruck for Haulage
  Build, // Used for Services
  AttachMoney
} from '@mui/icons-material';
import { Controller, useFormContext, useFieldArray } from 'react-hook-form';
import { motion } from 'framer-motion';

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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
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

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
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
          <SeafreightSelection onUpdate={(seafreights) => {
            console.log('Seafreight selection updated:', seafreights);
          }} />
        </TabPanel>

        {/* Haulage Tab */}
        <TabPanel value={tabValue} index={1}>
          <HaulageSelection onUpdate={(haulages) => {
            console.log('Haulage selection updated:', haulages);
          }} />
        </TabPanel>

        {/* Services Tab */}
        <TabPanel value={tabValue} index={2}>
          <ServicesSelection onUpdate={(services) => {
            console.log('Services selection updated:', services);
          }} />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default OptionsStep;
