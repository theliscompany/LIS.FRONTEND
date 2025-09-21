/**
 * Step3RequestForm adapté pour le RequestWizard
 * Utilise les adaptateurs de données pour normaliser l'accès aux données
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
  Fade,
  Slide,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContainerIcon from '@mui/icons-material/Storage';
import { getStep1Data, getStep3Data, Step1Data, Step3Data } from '../adapters/StepDataAdapters';

interface Step3RequestFormAdaptedProps {
  requestData: any;
  onStepUpdate: (data: any) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function Step3RequestFormAdapted({
  requestData,
  onStepUpdate,
  onBack,
  onNext,
}: Step3RequestFormAdaptedProps) {
  const { t } = useTranslation();
  const [containers, setContainers] = useState<Array<{
    id: string;
    type: string;
    quantity: number;
    teu: number;
  }>>([]);
  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // ✅ NOUVEAU: Utilisation des adaptateurs de données
  const step1Data = getStep1Data(requestData);
  const step3Data = getStep3Data(requestData);

  // Initialisation des données
  useEffect(() => {
    if (step3Data.containers.length > 0) {
      setContainers(step3Data.containers);
    }
  }, [step3Data.containers]);

  // Validation en temps réel
  useEffect(() => {
    const errors: string[] = [];
    
    if (containers.length === 0) {
      errors.push('Au moins un conteneur est requis');
    }
    
    containers.forEach((container, index) => {
      if (!container.type) {
        errors.push(`Type de conteneur requis pour le conteneur ${index + 1}`);
      }
      if (container.quantity <= 0) {
        errors.push(`Quantité valide requise pour le conteneur ${index + 1}`);
      }
    });

    setValidationErrors(errors);
    setIsValid(errors.length === 0);
  }, [containers]);

  const handleContainerChange = (index: number, field: string, value: any) => {
    const newContainers = [...containers];
    newContainers[index] = { ...newContainers[index], [field]: value };
    setContainers(newContainers);
  };

  const addContainer = () => {
    const newContainer = {
      id: `container_${Date.now()}`,
      type: '',
      quantity: 1,
      teu: 1
    };
    setContainers([...containers, newContainer]);
  };

  const removeContainer = (index: number) => {
    const newContainers = containers.filter((_, i) => i !== index);
    setContainers(newContainers);
  };

  const handleNext = () => {
    if (isValid) {
      // Calculer le résumé
      const summary = {
        totalContainers: containers.reduce((sum, c) => sum + c.quantity, 0),
        totalTEU: containers.reduce((sum, c) => sum + (c.quantity * c.teu), 0),
        containerTypes: [...new Set(containers.map(c => c.type))]
      };

      // Mettre à jour le step3
      onStepUpdate({
        containers: containers,
        summary: summary,
        selectedContainers: { list: containers }
      });
      
      onNext();
    }
  };

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      p: 3
    }}>
      <Fade in timeout={800}>
        <Box>
          {/* Header avec titre moderne */}
          <Box sx={{ 
            textAlign: 'center', 
            mb: 4,
            background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
            borderRadius: 4,
            p: 4,
            color: 'white',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h3" sx={{ 
              fontWeight: 700, 
              mb: 1,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              {t('requestWizard.step3.title')}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {t('requestWizard.step3.subtitle')}
            </Typography>
          </Box>

          {/* Résumé de la demande */}
          <Slide direction="up" in timeout={1000}>
            <Accordion defaultExpanded sx={{ mb: 4, borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{
                    bgcolor: 'success.main',
                    mr: 2,
                    background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)'
                  }}>
                    <ContainerIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                    {t('requestWizard.step3.demandDetailsTitle')}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2} sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  width: '100%'
                }}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PersonIcon sx={{ color: '#3498db' }} />
                      <Typography variant="subtitle2" color="text.secondary">{t('requestWizard.step3.client')}:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {step1Data.customer.companyName || step1Data.customer.contactName || '-'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationOnIcon sx={{ color: '#e74c3c' }} />
                      <Typography variant="subtitle2" color="text.secondary">{t('requestWizard.step3.departure')}:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {step1Data.cityFrom.name || '-'} / {step1Data.cityFrom.country || '-'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationOnIcon sx={{ color: '#27ae60' }} />
                      <Typography variant="subtitle2" color="text.secondary">{t('requestWizard.step3.arrival')}:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {step1Data.cityTo.name || '-'} / {step1Data.cityTo.country || '-'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocalShippingIcon sx={{ color: '#9b59b6' }} />
                      <Typography variant="subtitle2" color="text.secondary">{t('requestWizard.step3.product')}:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {step1Data.productName.productName || '-'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AssignmentIcon sx={{ color: '#34495e' }} />
                      <Typography variant="subtitle2" color="text.secondary">{t('requestWizard.step3.incoterm')}:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {step1Data.incotermName || '-'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <DescriptionIcon sx={{ color: '#e67e22' }} />
                      <Typography variant="subtitle2" color="text.secondary">{t('requestWizard.step3.comment')}:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {step1Data.comment || '-'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Slide>

          {/* Formulaire des conteneurs */}
          <Slide direction="up" in timeout={1200}>
            <Card sx={{ 
              mb: 4, 
              borderRadius: 3,
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: 'success.main', 
                    mr: 2,
                    background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)'
                  }}>
                    <ContainerIcon />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                    {t('requestWizard.step3.containersTitle')}
                  </Typography>
                  <Chip 
                    label={`${containers.length} conteneur${containers.length > 1 ? 's' : ''}`}
                    color="success" 
                    sx={{ ml: 2 }}
                  />
                </Box>

                {containers.length === 0 ? (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    color: '#7f8c8d'
                  }}>
                    <ContainerIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6">{t('requestWizard.step3.noContainers')}</Typography>
                    <Typography variant="body2">
                      {t('requestWizard.step3.addFirstContainer')}
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {containers.map((container, index) => (
                      <Grid item xs={12} key={container.id}>
                        <Card sx={{ 
                          p: 3, 
                          border: '2px solid #e0e0e0',
                          borderRadius: 2,
                          '&:hover': {
                            borderColor: '#56ab2f',
                            boxShadow: '0 4px 12px rgba(86, 171, 47, 0.1)'
                          }
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ flex: 1 }}>
                              Conteneur {index + 1}
                            </Typography>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => removeContainer(index)}
                              sx={{ ml: 2 }}
                            >
                              Supprimer
                            </Button>
                          </Box>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Type de conteneur"
                                value={container.type}
                                onChange={(e) => handleContainerChange(index, 'type', e.target.value)}
                                error={!container.type}
                                helperText={!container.type ? 'Requis' : ''}
                              />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <TextField
                                fullWidth
                                label="Quantité"
                                type="number"
                                value={container.quantity}
                                onChange={(e) => handleContainerChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                error={container.quantity <= 0}
                                helperText={container.quantity <= 0 ? 'Quantité valide requise' : ''}
                              />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <TextField
                                fullWidth
                                label="TEU"
                                type="number"
                                value={container.teu}
                                onChange={(e) => handleContainerChange(index, 'teu', parseInt(e.target.value) || 0)}
                                error={container.teu <= 0}
                                helperText={container.teu <= 0 ? 'TEU valide requis' : ''}
                              />
                            </Grid>
                          </Grid>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {/* Bouton d'ajout */}
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={addContainer}
                    startIcon={<ContainerIcon />}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      borderColor: '#56ab2f',
                      color: '#56ab2f',
                      '&:hover': {
                        borderColor: '#4a9a2a',
                        backgroundColor: 'rgba(86, 171, 47, 0.04)'
                      }
                    }}
                  >
                    {t('requestWizard.step3.addContainer')}
                  </Button>
                </Box>

                {/* Résumé */}
                {containers.length > 0 && (
                  <Box sx={{ 
                    mt: 4, 
                    p: 3, 
                    bgcolor: 'rgba(86, 171, 47, 0.05)', 
                    borderRadius: 2,
                    border: '1px solid rgba(86, 171, 47, 0.2)'
                  }}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50' }}>
                      Résumé des conteneurs
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          Total conteneurs: <strong>{containers.reduce((sum, c) => sum + c.quantity, 0)}</strong>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          Total TEU: <strong>{containers.reduce((sum, c) => sum + (c.quantity * c.teu), 0)}</strong>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          Types: <strong>{[...new Set(containers.map(c => c.type))].join(', ')}</strong>
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Validation Status */}
                {validationErrors.length > 0 && (
                  <Alert severity="error" sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Erreurs de validation:
                    </Typography>
                    <ul>
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Slide>

          {/* Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={onBack}
              startIcon={<ArrowBackIcon />}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              {t('requestWizard.step3.backButton')}
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
              disabled={!isValid}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4a9a2a 0%, #96d4b8 100%)',
                },
                '&:disabled': {
                  background: '#e0e0e0',
                  color: '#9e9e9e'
                }
              }}
            >
              {isValid ? t('requestWizard.step3.nextButton') : 'Corriger les erreurs'}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Box>
  );
}
