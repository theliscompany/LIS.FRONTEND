import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useQuoteOptionsManager, type QuoteOption } from '../hooks/useQuoteOptionsManager';
import type { QuoteOptionDto } from '../api/types.gen';

interface QuoteOptionEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (option: QuoteOptionDto) => void;
  option?: QuoteOption | null;
  quoteId?: string;
  draftId?: string;
  mode: 'create' | 'edit';
}

interface OptionFormData {
  description: string;
  haulage: {
    enabled: boolean;
    haulierId: string;
    haulierName: string;
    unitTariff: number;
    currency: string;
    freeTime: number;
    pickupAddress: any;
    deliveryPort: any;
    comment?: string;
    validUntil: string;
  };
  seaFreight: {
    enabled: boolean;
    seaFreightId: string;
    carrierName: string;
    carrierAgentName: string;
    departurePort: any;
    destinationPort: any;
    currency: string;
    transitTimeDays: number;
    frequency: string;
    defaultContainer: string;
    containers: Array<{
      containerId?: string;
      containerType: string;
      quantity: number;
      unitPrice: number;
    }>;
    comment?: string;
    validUntil: string;
  };
  miscellaneous: Array<{
    miscellaneousId?: string;
    supplierName: string;
    currency: string;
    serviceId: number;
    serviceName: string;
    price: number;
    validUntil: string;
  }>;
  deliveryAddress: {
    company: string;
    addressLine: string;
    city: string;
    postalCode: string;
    country: string;
  };
  validUntil: string;
}

const QuoteOptionEditor: React.FC<QuoteOptionEditorProps> = ({
  open,
  onClose,
  onSave,
  option,
  quoteId,
  draftId,
  mode
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<OptionFormData>({
    description: '',
    haulage: {
      enabled: false,
      haulierId: '',
      haulierName: '',
      unitTariff: 0,
      currency: 'EUR',
      freeTime: 0,
      pickupAddress: {},
      deliveryPort: {},
      validUntil: ''
    },
    seaFreight: {
      enabled: false,
      seaFreightId: '',
      carrierName: '',
      carrierAgentName: '',
      departurePort: {},
      destinationPort: {},
      currency: 'EUR',
      transitTimeDays: 0,
      frequency: '',
      defaultContainer: '',
      containers: [],
      validUntil: ''
    },
    miscellaneous: [],
    deliveryAddress: {
      company: '',
      addressLine: '',
      city: '',
      postalCode: '',
      country: ''
    },
    validUntil: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const {
    generateOption,
    addOption,
    isGeneratingOption,
    isAddingOption
  } = useQuoteOptionsManager({
    quoteId,
    draftId
  });

  // Initialiser le formulaire avec les données de l'option existante
  useEffect(() => {
    if (option && mode === 'edit') {
      setFormData({
        description: option.description || '',
        haulage: {
          enabled: !!option.haulage,
          haulierId: option.haulage?.haulierId || '',
          haulierName: option.haulage?.haulierName || '',
          unitTariff: option.haulage?.unitTariff || 0,
          currency: option.haulage?.currency || 'EUR',
          freeTime: option.haulage?.freeTime || 0,
          pickupAddress: option.haulage?.pickupAddress || {},
          deliveryPort: option.haulage?.deliveryPort || {},
          comment: option.haulage?.comment || '',
          validUntil: option.haulage?.validUntil || ''
        },
        seaFreight: {
          enabled: !!option.seaFreight,
          seaFreightId: option.seaFreight?.seaFreightId || '',
          carrierName: option.seaFreight?.carrierName || '',
          carrierAgentName: option.seaFreight?.carrierAgentName || '',
          departurePort: option.seaFreight?.departurePort || {},
          destinationPort: option.seaFreight?.destinationPort || {},
          currency: option.seaFreight?.currency || 'EUR',
          transitTimeDays: option.seaFreight?.transitTimeDays || 0,
          frequency: option.seaFreight?.frequency || '',
          defaultContainer: option.seaFreight?.defaultContainer || '',
          containers: option.seaFreight?.containers || [],
          comment: option.seaFreight?.comment || '',
          validUntil: option.seaFreight?.validUntil || ''
        },
        miscellaneous: option.miscellaneous || [],
        deliveryAddress: option.deliveryAddress || {
          company: '',
          addressLine: '',
          city: '',
          postalCode: '',
          country: ''
        },
        validUntil: option.validUntil || ''
      });
    } else {
      // Réinitialiser le formulaire pour la création
      setFormData({
        description: '',
        haulage: {
          enabled: false,
          haulierId: '',
          haulierName: '',
          unitTariff: 0,
          currency: 'EUR',
          freeTime: 0,
          pickupAddress: {},
          deliveryPort: {},
          validUntil: ''
        },
        seaFreight: {
          enabled: false,
          seaFreightId: '',
          carrierName: '',
          carrierAgentName: '',
          departurePort: {},
          destinationPort: {},
          currency: 'EUR',
          transitTimeDays: 0,
          frequency: '',
          defaultContainer: '',
          containers: [],
          validUntil: ''
        },
        miscellaneous: [],
        deliveryAddress: {
          company: '',
          addressLine: '',
          city: '',
          postalCode: '',
          country: ''
        },
        validUntil: ''
      });
    }
  }, [option, mode, open]);

  const steps = [
    'Informations générales',
    'Transport terrestre',
    'Transport maritime',
    'Services divers',
    'Adresse de livraison',
    'Validation'
  ];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNestedInputChange = (parentField: string, childField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField as keyof OptionFormData],
        [childField]: value
      }
    }));
  };

  const addContainer = () => {
    setFormData(prev => ({
      ...prev,
      seaFreight: {
        ...prev.seaFreight,
        containers: [
          ...prev.seaFreight.containers,
          {
            containerType: '',
            quantity: 1,
            unitPrice: 0
          }
        ]
      }
    }));
  };

  const removeContainer = (index: number) => {
    setFormData(prev => ({
      ...prev,
      seaFreight: {
        ...prev.seaFreight,
        containers: prev.seaFreight.containers.filter((_, i) => i !== index)
      }
    }));
  };

  const addMiscellaneousService = () => {
    setFormData(prev => ({
      ...prev,
      miscellaneous: [
        ...prev.miscellaneous,
        {
          supplierName: '',
          currency: 'EUR',
          serviceId: 0,
          serviceName: '',
          price: 0,
          validUntil: ''
        }
      ]
    }));
  };

  const removeMiscellaneousService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      miscellaneous: prev.miscellaneous.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (!formData.validUntil) {
      newErrors.validUntil = 'La date de validité est requise';
    }

    if (formData.haulage.enabled) {
      if (!formData.haulage.haulierName.trim()) {
        newErrors.haulageName = 'Le nom du transporteur est requis';
      }
      if (formData.haulage.unitTariff <= 0) {
        newErrors.haulageTariff = 'Le tarif unitaire doit être supérieur à 0';
      }
    }

    if (formData.seaFreight.enabled) {
      if (!formData.seaFreight.carrierName.trim()) {
        newErrors.carrierName = 'Le nom du transporteur maritime est requis';
      }
      if (formData.seaFreight.containers.length === 0) {
        newErrors.containers = 'Au moins un conteneur est requis';
      }
    }

    if (!formData.deliveryAddress.company.trim()) {
      newErrors.deliveryCompany = 'Le nom de l\'entreprise de livraison est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const optionData: QuoteOptionDto = {
        description: formData.description,
        haulage: formData.haulage.enabled ? {
          haulierId: formData.haulage.haulierId,
          haulierName: formData.haulage.haulierName,
          currency: formData.haulage.currency,
          unitTariff: formData.haulage.unitTariff,
          freeTime: formData.haulage.freeTime,
          pickupAddress: formData.haulage.pickupAddress,
          deliveryPort: formData.haulage.deliveryPort,
          comment: formData.haulage.comment,
          validUntil: formData.haulage.validUntil
        } : undefined,
        seaFreight: formData.seaFreight.enabled ? {
          seaFreightId: formData.seaFreight.seaFreightId,
          carrierName: formData.seaFreight.carrierName,
          carrierAgentName: formData.seaFreight.carrierAgentName,
          departurePort: formData.seaFreight.departurePort,
          destinationPort: formData.seaFreight.destinationPort,
          currency: formData.seaFreight.currency,
          transitTimeDays: formData.seaFreight.transitTimeDays,
          frequency: formData.seaFreight.frequency,
          defaultContainer: formData.seaFreight.defaultContainer,
          containers: formData.seaFreight.containers.map(container => ({
            containerType: container.containerType,
            quantity: container.quantity,
            unitPrice: container.unitPrice
          })),
          comment: formData.seaFreight.comment,
          validUntil: formData.seaFreight.validUntil
        } : undefined,
        miscellaneous: formData.miscellaneous.map(misc => ({
          supplierName: misc.supplierName,
          currency: misc.currency,
          serviceId: misc.serviceId,
          serviceName: misc.serviceName,
          price: misc.price,
          validUntil: misc.validUntil
        })),
        deliveryAddress: formData.deliveryAddress,
        totals: {
          haulageTotal: formData.haulage.enabled ? formData.haulage.unitTariff : 0,
          seafreightTotal: formData.seaFreight.enabled ? 
            formData.seaFreight.containers.reduce((sum, container) => sum + (container.unitPrice * container.quantity), 0) : 0,
          miscellaneousTotal: formData.miscellaneous.reduce((sum, misc) => sum + misc.price, 0),
          grandTotal: 0 // Sera calculé côté serveur
        },
        portDeparture: formData.seaFreight.departurePort,
        portDestination: formData.seaFreight.destinationPort
      };

      onSave(optionData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Informations générales
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description de l'option"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date de validité"
                type="datetime-local"
                value={formData.validUntil}
                onChange={(e) => handleInputChange('validUntil', e.target.value)}
                error={!!errors.validUntil}
                helperText={errors.validUntil}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        );

      case 1: // Transport terrestre
        return (
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.haulage.enabled}
                  onChange={(e) => handleNestedInputChange('haulage', 'enabled', e.target.checked)}
                />
              }
              label="Inclure le transport terrestre"
            />
            
            {formData.haulage.enabled && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nom du transporteur"
                    value={formData.haulage.haulierName}
                    onChange={(e) => handleNestedInputChange('haulage', 'haulierName', e.target.value)}
                    error={!!errors.haulageName}
                    helperText={errors.haulageName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Devise</InputLabel>
                    <Select
                      value={formData.haulage.currency}
                      onChange={(e) => handleNestedInputChange('haulage', 'currency', e.target.value)}
                    >
                      <MenuItem value="EUR">EUR</MenuItem>
                      <MenuItem value="USD">USD</MenuItem>
                      <MenuItem value="GBP">GBP</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tarif unitaire"
                    type="number"
                    value={formData.haulage.unitTariff}
                    onChange={(e) => handleNestedInputChange('haulage', 'unitTariff', parseFloat(e.target.value) || 0)}
                    error={!!errors.haulageTariff}
                    helperText={errors.haulageTariff}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Temps libre (jours)"
                    type="number"
                    value={formData.haulage.freeTime}
                    onChange={(e) => handleNestedInputChange('haulage', 'freeTime', parseInt(e.target.value) || 0)}
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        );

      case 2: // Transport maritime
        return (
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.seaFreight.enabled}
                  onChange={(e) => handleNestedInputChange('seaFreight', 'enabled', e.target.checked)}
                />
              }
              label="Inclure le transport maritime"
            />
            
            {formData.seaFreight.enabled && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nom du transporteur"
                    value={formData.seaFreight.carrierName}
                    onChange={(e) => handleNestedInputChange('seaFreight', 'carrierName', e.target.value)}
                    error={!!errors.carrierName}
                    helperText={errors.carrierName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Agent du transporteur"
                    value={formData.seaFreight.carrierAgentName}
                    onChange={(e) => handleNestedInputChange('seaFreight', 'carrierAgentName', e.target.value)}
                  />
                </Grid>
                
                {/* Conteneurs */}
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Conteneurs</Typography>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addContainer}
                      size="small"
                    >
                      Ajouter
                    </Button>
                  </Box>
                  
                  {formData.seaFreight.containers.map((container, index) => (
                    <Card key={index} sx={{ mb: 2 }}>
                      <CardHeader
                        title={`Conteneur ${index + 1}`}
                        action={
                          <IconButton
                            onClick={() => removeContainer(index)}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                      />
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="Type de conteneur"
                              value={container.containerType}
                              onChange={(e) => {
                                const newContainers = [...formData.seaFreight.containers];
                                newContainers[index].containerType = e.target.value;
                                handleNestedInputChange('seaFreight', 'containers', newContainers);
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="Quantité"
                              type="number"
                              value={container.quantity}
                              onChange={(e) => {
                                const newContainers = [...formData.seaFreight.containers];
                                newContainers[index].quantity = parseInt(e.target.value) || 1;
                                handleNestedInputChange('seaFreight', 'containers', newContainers);
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="Prix unitaire"
                              type="number"
                              value={container.unitPrice}
                              onChange={(e) => {
                                const newContainers = [...formData.seaFreight.containers];
                                newContainers[index].unitPrice = parseFloat(e.target.value) || 0;
                                handleNestedInputChange('seaFreight', 'containers', newContainers);
                              }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {errors.containers && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {errors.containers}
                    </Alert>
                  )}
                </Grid>
              </Grid>
            )}
          </Box>
        );

      case 3: // Services divers
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Services divers</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={addMiscellaneousService}
                size="small"
              >
                Ajouter un service
              </Button>
            </Box>
            
            {formData.miscellaneous.map((service, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardHeader
                  title={`Service ${index + 1}`}
                  action={
                    <IconButton
                      onClick={() => removeMiscellaneousService(index)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Nom du fournisseur"
                        value={service.supplierName}
                        onChange={(e) => {
                          const newServices = [...formData.miscellaneous];
                          newServices[index].supplierName = e.target.value;
                          handleInputChange('miscellaneous', newServices);
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Nom du service"
                        value={service.serviceName}
                        onChange={(e) => {
                          const newServices = [...formData.miscellaneous];
                          newServices[index].serviceName = e.target.value;
                          handleInputChange('miscellaneous', newServices);
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Prix"
                        type="number"
                        value={service.price}
                        onChange={(e) => {
                          const newServices = [...formData.miscellaneous];
                          newServices[index].price = parseFloat(e.target.value) || 0;
                          handleInputChange('miscellaneous', newServices);
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Devise</InputLabel>
                        <Select
                          value={service.currency}
                          onChange={(e) => {
                            const newServices = [...formData.miscellaneous];
                            newServices[index].currency = e.target.value;
                            handleInputChange('miscellaneous', newServices);
                          }}
                        >
                          <MenuItem value="EUR">EUR</MenuItem>
                          <MenuItem value="USD">USD</MenuItem>
                          <MenuItem value="GBP">GBP</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>
        );

      case 4: // Adresse de livraison
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom de l'entreprise"
                value={formData.deliveryAddress.company}
                onChange={(e) => handleNestedInputChange('deliveryAddress', 'company', e.target.value)}
                error={!!errors.deliveryCompany}
                helperText={errors.deliveryCompany}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresse"
                value={formData.deliveryAddress.addressLine}
                onChange={(e) => handleNestedInputChange('deliveryAddress', 'addressLine', e.target.value)}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ville"
                value={formData.deliveryAddress.city}
                onChange={(e) => handleNestedInputChange('deliveryAddress', 'city', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Code postal"
                value={formData.deliveryAddress.postalCode}
                onChange={(e) => handleNestedInputChange('deliveryAddress', 'postalCode', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Pays"
                value={formData.deliveryAddress.country}
                onChange={(e) => handleNestedInputChange('deliveryAddress', 'country', e.target.value)}
              />
            </Grid>
          </Grid>
        );

      case 5: // Validation
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Récapitulatif de l'option
            </Typography>
            
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  {formData.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Valide jusqu'au: {formData.validUntil ? new Date(formData.validUntil).toLocaleDateString('fr-FR') : 'Non défini'}
                </Typography>
              </CardContent>
            </Card>

            {formData.haulage.enabled && (
              <Card sx={{ mb: 2 }}>
                <CardHeader title="Transport terrestre" />
                <CardContent>
                  <Typography variant="body2">
                    <strong>Transporteur:</strong> {formData.haulage.haulierName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Tarif unitaire:</strong> {formData.haulage.unitTariff} {formData.haulage.currency}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {formData.seaFreight.enabled && (
              <Card sx={{ mb: 2 }}>
                <CardHeader title="Transport maritime" />
                <CardContent>
                  <Typography variant="body2">
                    <strong>Transporteur:</strong> {formData.seaFreight.carrierName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Conteneurs:</strong> {formData.seaFreight.containers.length}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {formData.miscellaneous.length > 0 && (
              <Card sx={{ mb: 2 }}>
                <CardHeader title="Services divers" />
                <CardContent>
                  <Typography variant="body2">
                    <strong>Nombre de services:</strong> {formData.miscellaneous.length}
                  </Typography>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader title="Adresse de livraison" />
              <CardContent>
                <Typography variant="body2">
                  {formData.deliveryAddress.company}
                </Typography>
                <Typography variant="body2">
                  {formData.deliveryAddress.addressLine}
                </Typography>
                <Typography variant="body2">
                  {formData.deliveryAddress.postalCode} {formData.deliveryAddress.city}
                </Typography>
                <Typography variant="body2">
                  {formData.deliveryAddress.country}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={activeStep > 2}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {mode === 'create' ? 'Créer une nouvelle option' : 'Modifier l\'option'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Annuler
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack}>
            Précédent
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button variant="contained" onClick={handleNext}>
            Suivant
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isSaving || isGeneratingOption || isAddingOption}
            startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default QuoteOptionEditor;
