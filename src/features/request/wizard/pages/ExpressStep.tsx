import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import { Send, ArrowForward } from '@mui/icons-material';

import { defaultDraftQuoteForm } from '../schema';

interface ExpressStepProps {
  onExpressSubmit?: (formData: any) => void;
}

export const ExpressStep: React.FC<ExpressStepProps> = ({ onExpressSubmit }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    cargoType: 'FCL',
    incoterm: 'FOB',
    originCity: '',
    originCountry: '',
    destinationCity: '',
    destinationCountry: '',
    goodsDescription: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    'Cargo Type',
    'Origin',
    'Destination', 
    'Incoterm',
    'Goods Description'
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0:
        if (!formData.cargoType) {
          newErrors.cargoType = 'Cargo type is required';
        }
        break;
      case 1:
        if (!formData.originCity) {
          newErrors.originCity = 'Origin city is required';
        }
        if (!formData.originCountry) {
          newErrors.originCountry = 'Origin country is required';
        }
        break;
      case 2:
        if (!formData.destinationCity) {
          newErrors.destinationCity = 'Destination city is required';
        }
        if (!formData.destinationCountry) {
          newErrors.destinationCountry = 'Destination country is required';
        }
        break;
      case 3:
        if (!formData.incoterm) {
          newErrors.incoterm = 'Incoterm is required';
        }
        break;
      case 4:
        if (!formData.goodsDescription) {
          newErrors.goodsDescription = 'Goods description is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      // Convert express form data to full form data
      const fullFormData = {
        ...defaultDraftQuoteForm,
        basics: {
          ...defaultDraftQuoteForm.basics,
          cargoType: formData.cargoType as 'FCL' | 'LCL' | 'AIR',
          incoterm: formData.incoterm,
          origin: {
            city: formData.originCity,
            country: formData.originCountry
          },
          destination: {
            city: formData.destinationCity,
            country: formData.destinationCountry
          },
          goodsDescription: formData.goodsDescription
        }
      };

      if (onExpressSubmit) {
        onExpressSubmit(fullFormData);
      } else {
        // Navigate to wizard with pre-filled data
        navigate('/request/wizard', { 
          state: { 
            defaultValues: fullFormData,
            initialStep: 'review'
          } 
        });
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              What type of cargo are you shipping?
            </Typography>
            <FormControl fullWidth error={!!errors.cargoType}>
              <InputLabel>Cargo Type</InputLabel>
              <Select
                value={formData.cargoType}
                onChange={(e) => setFormData(prev => ({ ...prev, cargoType: e.target.value }))}
                label="Cargo Type"
              >
                <MenuItem value="FCL">FCL (Full Container Load)</MenuItem>
                <MenuItem value="LCL">LCL (Less than Container Load)</MenuItem>
                <MenuItem value="AIR">AIR (Air Freight)</MenuItem>
              </Select>
              {errors.cargoType && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {errors.cargoType}
                </Typography>
              )}
            </FormControl>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Where is the cargo departing from?
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="Origin City"
                value={formData.originCity}
                onChange={(e) => setFormData(prev => ({ ...prev, originCity: e.target.value }))}
                error={!!errors.originCity}
                helperText={errors.originCity}
              />
              <TextField
                fullWidth
                label="Origin Country"
                value={formData.originCountry}
                onChange={(e) => setFormData(prev => ({ ...prev, originCountry: e.target.value }))}
                error={!!errors.originCountry}
                helperText={errors.originCountry || '2-letter country code (e.g., US, DE, FR)'}
              />
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Where is the cargo going to?
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="Destination City"
                value={formData.destinationCity}
                onChange={(e) => setFormData(prev => ({ ...prev, destinationCity: e.target.value }))}
                error={!!errors.destinationCity}
                helperText={errors.destinationCity}
              />
              <TextField
                fullWidth
                label="Destination Country"
                value={formData.destinationCountry}
                onChange={(e) => setFormData(prev => ({ ...prev, destinationCountry: e.target.value }))}
                error={!!errors.destinationCountry}
                helperText={errors.destinationCountry || '2-letter country code (e.g., US, DE, FR)'}
              />
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              What incoterm applies to this shipment?
            </Typography>
            <FormControl fullWidth error={!!errors.incoterm}>
              <InputLabel>Incoterm</InputLabel>
              <Select
                value={formData.incoterm}
                onChange={(e) => setFormData(prev => ({ ...prev, incoterm: e.target.value }))}
                label="Incoterm"
              >
                <MenuItem value="EXW">EXW - Ex Works</MenuItem>
                <MenuItem value="FCA">FCA - Free Carrier</MenuItem>
                <MenuItem value="FAS">FAS - Free Alongside Ship</MenuItem>
                <MenuItem value="FOB">FOB - Free On Board</MenuItem>
                <MenuItem value="CFR">CFR - Cost and Freight</MenuItem>
                <MenuItem value="CIF">CIF - Cost, Insurance and Freight</MenuItem>
                <MenuItem value="CPT">CPT - Carriage Paid To</MenuItem>
                <MenuItem value="CIP">CIP - Carriage and Insurance Paid To</MenuItem>
                <MenuItem value="DAP">DAP - Delivered At Place</MenuItem>
                <MenuItem value="DPU">DPU - Delivered at Place Unloaded</MenuItem>
                <MenuItem value="DDP">DDP - Delivered Duty Paid</MenuItem>
              </Select>
              {errors.incoterm && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {errors.incoterm}
                </Typography>
              )}
            </FormControl>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Describe the goods being shipped
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Goods Description"
              value={formData.goodsDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, goodsDescription: e.target.value }))}
              error={!!errors.goodsDescription}
              helperText={errors.goodsDescription || 'Provide a detailed description of the goods'}
              sx={{ mt: 2 }}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Express Quote Request
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Answer 5 quick questions to get started with your quote request
      </Typography>

      <Card>
        <CardContent>
          <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ minHeight: 300, mb: 4 }}>
            {renderStepContent()}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              onClick={handleBack}
              disabled={currentStep === 0}
              variant="outlined"
            >
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              variant="contained"
              endIcon={currentStep === steps.length - 1 ? <Send /> : <ArrowForward />}
            >
              {currentStep === steps.length - 1 ? 'Submit' : 'Next'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          This will create a basic quote request. You can add more details and options in the full wizard.
        </Typography>
      </Alert>
    </Box>
  );
};

export default ExpressStep;
