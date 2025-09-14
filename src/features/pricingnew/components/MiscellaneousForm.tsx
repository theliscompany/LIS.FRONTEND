import React, { useState, useEffect } from 'react';
import { 
  MiscellaneousCreateRequest,
  MiscellaneousResponse
} from '../api/types.gen';
import { ServiceViewModel } from '@features/masterdata/api';
import { 
  Tabs, 
  Tab, 
  Box, 
  Paper, 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  Grid, 
  Button, 
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  FormHelperText
} from '@mui/material';
import { getContactGetContacts } from '@features/crm/api/sdk.gen';
import { client as crmClient } from "@features/crm/api";
import AutoCompleteContact from '../../../components/shared/AutoCompleteContact';
import AutoCompletePort from '../../../components/shared/AutoCompletePort';
import AutoCompleteService from '../../../components/shared/AutoCompleteService';
import BusinessIcon from '@mui/icons-material/Business';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import InfoIcon from '@mui/icons-material/Info';

interface MiscellaneousFormProps {
  miscellaneous?: MiscellaneousResponse;
  onSubmit: (data: MiscellaneousCreateRequest) => void;
  onCancel: () => void;
  loading?: boolean;
}

interface ValidationErrors {
  serviceProviderId?: string;
  serviceName?: string;
  validFrom?: string;
  validUntil?: string;
  pricing?: {
    pricingType?: string;
    basePrice?: string;
  };
}

// Constantes pour les types de service
const SERVICE_TYPES = {
  WAREHOUSING: 'Warehousing',
  CUSTOMS_CLEARANCE: 'CustomsClearance',
  INSURANCE: 'Insurance',
  PORT_HANDLING: 'PortHandling',
  PACKAGING: 'Packaging',
  LOADING: 'Loading',
  UNLOADING: 'Unloading',
  INSPECTION: 'Inspection',
  DOCUMENTATION: 'Documentation',
  OTHER: 'Other'
} as const;

// Constantes pour les types de pricing
const PRICING_TYPES = {
  FIXED_PRICE: 'FixedPrice',
  PER_UNIT: 'PerUnit',
  PER_DAY: 'PerDay',
  PERCENTAGE: 'Percentage',
  ON_REQUEST: 'OnRequest'
} as const;

// Constantes pour les types de containers
const CONTAINER_TYPES = {
  DRY_CONTAINER20: 'DryContainer20',
  DRY_CONTAINER40: 'DryContainer40',
  DRY_CONTAINER40HC: 'DryContainer40HC',
  REEFER_CONTAINER20: 'ReeferContainer20',
  REEFER_CONTAINER40: 'ReeferContainer40',
  OPEN_TOP20: 'OpenTop20',
  OPEN_TOP40: 'OpenTop40',
  FLAT_RACK20: 'FlatRack20',
  FLAT_RACK40: 'FlatRack40',
  TANK20: 'Tank20',
  TANK40: 'Tank40',
  BULK_CONTAINER: 'BulkContainer',
  SPECIAL_EQUIPMENT: 'SpecialEquipment'
} as const;

const MiscellaneousForm: React.FC<MiscellaneousFormProps> = ({
  miscellaneous,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<MiscellaneousCreateRequest>({
    serviceProviderId: undefined,
    serviceProviderName: null,
    serviceType: null,
    serviceName: null,
    serviceDescription: null,
    departurePortId: null,
    departurePortName: null,
    destinationPortId: null,
    destinationPortName: null,
    applicableContainerTypes: null,
    serviceDurationHours: null,
    serviceDurationDescription: null,
    specialConditions: null,
    locationCity: null,
    locationCountry: null,
    currency: null,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    pricing: {
      pricingType: null,
      basePrice: 0,
      minimumCharge: null,
      maximumCharge: null,
      unitOfMeasure: null,
      minimumQuantity: null,
      maximumQuantity: null
    },
    comment: null,
    createdBy: null
  });

  const [selectedService, setSelectedService] = useState<ServiceViewModel | null>(null);

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [specialCondition, setSpecialCondition] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const [providers, setProviders] = useState<any[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);

  // Fonction de validation
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Validation du fournisseur
    if (!formData.serviceProviderId) {
      errors.serviceProviderId = 'Le fournisseur est obligatoire';
    }

    // Validation du nom du service
    if (!formData.serviceName || formData.serviceName.trim() === '') {
      errors.serviceName = 'Le nom du service est obligatoire';
    }

    // Validation des dates
    if (!formData.validFrom) {
      errors.validFrom = 'La date de début est obligatoire';
    }

    if (!formData.validUntil) {
      errors.validUntil = 'La date de fin est obligatoire';
    }

    if (formData.validFrom && formData.validUntil && formData.validFrom >= formData.validUntil) {
      errors.validUntil = 'La date de fin doit être postérieure à la date de début';
    }

    // Validation de la tarification
    if (!formData.pricing) {
      errors.pricing = { pricingType: 'La tarification est obligatoire' };
    } else {
      const pricingErrors: { pricingType?: string; basePrice?: string } = {};

      if (!formData.pricing.pricingType) {
        pricingErrors.pricingType = 'Le type de tarification est obligatoire';
      }

      if (formData.pricing.pricingType !== PRICING_TYPES.ON_REQUEST) {
        if (!formData.pricing.basePrice || formData.pricing.basePrice <= 0) {
          pricingErrors.basePrice = 'Le prix de base est obligatoire et doit être supérieur à 0';
        }
      }

      if (Object.keys(pricingErrors).length > 0) {
        errors.pricing = pricingErrors;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fonction pour effacer les erreurs d'un champ
  const clearFieldError = (fieldName: keyof ValidationErrors) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  // Fonction pour effacer les erreurs de pricing
  const clearPricingError = (fieldName: keyof ValidationErrors['pricing']) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (newErrors.pricing) {
        delete newErrors.pricing[fieldName];
        if (Object.keys(newErrors.pricing).length === 0) {
          delete newErrors.pricing;
        }
      }
      return newErrors;
    });
  };

  useEffect(() => {
    setLoadingProviders(true);
    console.log("Déclenchement appel getContactGetContacts");
    if (crmClient.getConfig) {
      console.log("Config client CRM:", crmClient.getConfig());
    } else {
      console.log("crmClient.getConfig n'est pas disponible");
    }
    getContactGetContacts().then((res: any) => {
      // Always set an array, fallback to []
      const allContacts = Array.isArray(res?.data?.data) ? res.data.data : [];
      setProviders(allContacts);
      setLoadingProviders(false);
    }).catch(() => setLoadingProviders(false));
  }, []);

  useEffect(() => {
    if (miscellaneous) {
      setFormData({
        serviceProviderId: miscellaneous.serviceProviderId,
        serviceProviderName: miscellaneous.serviceProviderName,
        serviceType: miscellaneous.serviceType,
        serviceName: miscellaneous.serviceName,
        serviceDescription: miscellaneous.serviceDescription,
        departurePortId: miscellaneous.departurePortId,
        departurePortName: miscellaneous.departurePortName,
        destinationPortId: miscellaneous.destinationPortId,
        destinationPortName: miscellaneous.destinationPortName,
        applicableContainerTypes: miscellaneous.applicableContainerTypes,
        serviceDurationHours: miscellaneous.serviceDurationHours,
        serviceDurationDescription: miscellaneous.serviceDurationDescription,
        specialConditions: miscellaneous.specialConditions,
        locationCity: miscellaneous.locationCity,
        locationCountry: miscellaneous.locationCountry,
        currency: miscellaneous.currency,
        validFrom: miscellaneous.validFrom ? new Date(miscellaneous.validFrom) : new Date(),
        validUntil: miscellaneous.validUntil ? new Date(miscellaneous.validUntil) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        pricing: miscellaneous.pricing || {
          pricingType: null,
          basePrice: 0,
          minimumCharge: null,
          maximumCharge: null,
          unitOfMeasure: null,
          minimumQuantity: null,
          maximumQuantity: null
        },
        comment: miscellaneous.comment,
        createdBy: miscellaneous.createdBy
      });

      // Initialiser le service sélectionné si on a un nom de service
      if (miscellaneous.serviceName) {
        setSelectedService({
          serviceId: undefined, // On n'a pas l'ID du service dans les données
          serviceName: miscellaneous.serviceName,
          serviceDescription: miscellaneous.serviceDescription || '',
          servicesTypeId: null
        });
      }
    }
  }, [miscellaneous]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    clearFieldError(name as keyof ValidationErrors);
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    clearFieldError(name as keyof ValidationErrors);
  };

  const handlePricingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      }
    }));
    clearPricingError(name as keyof ValidationErrors['pricing']);
  };

  const handlePricingSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [name]: value
      }
    }));
    clearPricingError(name as keyof ValidationErrors['pricing']);
  };

  const handleContainerTypeChange = (containerType: string) => {
    setFormData(prev => ({
      ...prev,
      applicableContainerTypes: prev.applicableContainerTypes?.includes(containerType)
        ? prev.applicableContainerTypes.filter(type => type !== containerType)
        : [...(prev.applicableContainerTypes || []), containerType]
    }));
  };

  const addSpecialCondition = () => {
    if (specialCondition.trim()) {
      setFormData(prev => ({
        ...prev,
        specialConditions: [...(prev.specialConditions || []), {
          conditionType: null,
          description: specialCondition.trim(),
          isRequired: false
        }]
      }));
      setSpecialCondition('');
    }
  };

  const removeSpecialCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialConditions: prev.specialConditions?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[MiscellaneousForm] Soumission du formulaire. Données actuelles:', formData);
    if (validateForm()) {
      const result = onSubmit(formData);
      if (result && typeof result.then === 'function') {
        result.then((r: any) => {
          console.log('[MiscellaneousForm] onSubmit résolu:', r);
        }).catch((err: any) => {
          console.error('[MiscellaneousForm] onSubmit rejeté:', err);
        });
      } else {
        console.log('[MiscellaneousForm] onSubmit appelé (non promesse).');
      }
    } else {
      console.warn('[MiscellaneousForm] Validation échouée:', validationErrors);
    }
  };

  // Handler dédié pour les champs de date
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value ? new Date(value) : null
    }));
    clearFieldError(name as keyof ValidationErrors);
  };

  // Styles uniformes pour tous les champs
  const fieldStyles = {
    '& .MuiOutlinedInput-root': {
      height: 56,
      '& fieldset': {
        borderColor: '#e0e0e0',
      },
      '&:hover fieldset': {
        borderColor: '#bdbdbd',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1976d2',
      },
    },
  };

  const labelStyles = {
    fontWeight: 600,
    color: '#2c3e50',
    mb: 1,
    fontSize: '0.875rem'
  };

  console.log('[MiscellaneousForm] Composant monté. Props:', { miscellaneous, onSubmit, onCancel, loading });

  return (
    <form onSubmit={handleSubmit} className="miscellaneous-form" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', padding: 24 }}>
      <Paper elevation={2} sx={{ mb: 3, borderRadius: 3 }}>
        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} centered>
          <Tab label={<><InfoIcon sx={{ mr: 1 }} />Service & Tarification</>} />
          <Tab label={<><Inventory2Icon sx={{ mr: 1 }} />Configuration & Conditions</>} />
        </Tabs>
      </Paper>

      <Box sx={{ mb: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 2, border: '1px solid #2196f3' }}>
        <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 500 }}>
          <strong>Note :</strong> Les champs marqués d'un astérisque (*) sont obligatoires pour la création d'un service.
        </Typography>
      </Box>

      {tabIndex === 0 && (
        <Box>
          <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}><BusinessIcon /></Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>Fournisseur</Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography sx={labelStyles}>Nom du fournisseur *</Typography>
                  <AutoCompleteContact
                    value={formData.serviceProviderId ? { contactId: formData.serviceProviderId, contactName: formData.serviceProviderName } : null}
                    onChange={value => {
                      setFormData(prev => ({
                        ...prev,
                        serviceProviderId: value ? value.contactId : undefined,
                        serviceProviderName: value ? value.contactName : '',
                      }));
                      clearFieldError('serviceProviderId');
                    }}
                  />
                  {validationErrors.serviceProviderId && (
                    <FormHelperText error sx={{ mt: 1 }}>{validationErrors.serviceProviderId}</FormHelperText>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography sx={labelStyles}>Nom du service *</Typography>
                  <AutoCompleteService
                    value={selectedService}
                    onChange={(service) => {
                      setSelectedService(service);
                      setFormData(prev => ({
                        ...prev,
                        serviceName: service?.serviceName || '',
                        serviceDescription: service?.serviceDescription || ''
                      }));
                      clearFieldError('serviceName');
                    }}
                    onServiceTypeChange={(serviceType) => {
                      // Mapper le type de service du masterdata vers MiscServiceType
                      let miscServiceType = SERVICE_TYPES.WAREHOUSING; // Valeur par défaut
                      
                      if (serviceType === 'MISCELLANEOUS') {
                        miscServiceType = SERVICE_TYPES.OTHER;
                      } else if (serviceType === 'SEAFREIGHT') {
                        miscServiceType = SERVICE_TYPES.PORT_HANDLING;
                      } else if (serviceType === 'HAULAGE') {
                        miscServiceType = SERVICE_TYPES.LOADING;
                      }
                      
                      setFormData(prev => ({
                        ...prev,
                        serviceType: miscServiceType as string
                      }));

                    }}
                    error={!!validationErrors.serviceName}
                    helperText={validationErrors.serviceName}
                  />
                </Grid>
                
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}><MonetizationOnIcon /></Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>Tarification</Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography sx={labelStyles}>Type de tarification *</Typography>
                  <FormControl fullWidth sx={fieldStyles} error={!!validationErrors.pricing?.pricingType}>
                    <Select
                      value={formData.pricing?.pricingType || ''}
                      onChange={handlePricingSelectChange}
                      name="pricingType"
                      required
                    >
                      <MenuItem value={PRICING_TYPES.FIXED_PRICE}>Prix fixe</MenuItem>
                      <MenuItem value={PRICING_TYPES.PER_UNIT}>Par unité</MenuItem>
                      <MenuItem value={PRICING_TYPES.PER_DAY}>Par jour</MenuItem>
                      <MenuItem value={PRICING_TYPES.PERCENTAGE}>Pourcentage</MenuItem>
                      <MenuItem value={PRICING_TYPES.ON_REQUEST}>Sur demande</MenuItem>
                    </Select>
                    {validationErrors.pricing?.pricingType && (
                      <FormHelperText error>{validationErrors.pricing.pricingType}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography sx={labelStyles}>Prix de base *</Typography>
                  <TextField
                    type="number"
                    name="basePrice"
                    value={formData.pricing?.basePrice !== null && formData.pricing?.basePrice !== undefined ? formData.pricing.basePrice : ''}
                    onChange={handlePricingChange}
                    inputProps={{ step: "0.01" }}
                    required
                    fullWidth
                    variant="outlined"
                    sx={fieldStyles}
                    error={!!validationErrors.pricing?.basePrice}
                  />
                  {validationErrors.pricing?.basePrice && (
                    <FormHelperText error>{validationErrors.pricing.basePrice}</FormHelperText>
                  )}
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography sx={labelStyles}>Charge minimum</Typography>
                  <TextField
                    type="number"
                    name="minimumCharge"
                    value={formData.pricing?.minimumCharge !== null && formData.pricing?.minimumCharge !== undefined ? formData.pricing.minimumCharge : ''}
                    onChange={handlePricingChange}
                    inputProps={{ step: "0.01" }}
                    fullWidth
                    variant="outlined"
                    sx={fieldStyles}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography sx={labelStyles}>Charge maximum</Typography>
                  <TextField
                    type="number"
                    name="maximumCharge"
                    value={formData.pricing?.maximumCharge !== null && formData.pricing?.maximumCharge !== undefined ? formData.pricing.maximumCharge : ''}
                    onChange={handlePricingChange}
                    inputProps={{ step: "0.01" }}
                    fullWidth
                    variant="outlined"
                    sx={fieldStyles}
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                                    <Typography sx={labelStyles}>Description de la tarification</Typography>
                  <TextField 
                    type="text" 
                    name="unitOfMeasure" 
                    value={formData.pricing?.unitOfMeasure ?? ''} 
                    onChange={handlePricingChange} 
                    fullWidth 
                    variant="outlined"
                    sx={fieldStyles}
                  />
                </Grid>
                                <Grid item xs={12} md={4}>
                  <Typography sx={labelStyles}>Quantité minimum</Typography>
                  <TextField 
                    type="number" 
                    name="minimumQuantity" 
                    value={formData.pricing?.minimumQuantity !== null && formData.pricing?.minimumQuantity !== undefined ? formData.pricing.minimumQuantity : ''} 
                    onChange={handlePricingChange} 
                    inputProps={{ step: "1" }}
                    fullWidth 
                    variant="outlined"
                    sx={fieldStyles}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}><CalendarMonthIcon /></Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>Validité</Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography sx={labelStyles}>Devise</Typography>
                  <FormControl fullWidth sx={fieldStyles}>
                    <Select
                      value={formData.currency ?? ''}
                      onChange={handleSelectChange}
                      name="currency"
                    >
                      <MenuItem value="EUR">EUR</MenuItem>
                      <MenuItem value="USD">USD</MenuItem>
                      <MenuItem value="GBP">GBP</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography sx={labelStyles}>Date de début *</Typography>
                  <TextField
                    type="datetime-local"
                    name="validFrom"
                    value={formData.validFrom instanceof Date ? formData.validFrom.toISOString().slice(0, 16) : ''}
                    onChange={handleDateChange}
                    required
                    fullWidth
                    variant="outlined"
                    sx={fieldStyles}
                    error={!!validationErrors.validFrom}
                  />
                  {validationErrors.validFrom && (
                    <FormHelperText error>{validationErrors.validFrom}</FormHelperText>
                  )}
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography sx={labelStyles}>Date de fin *</Typography>
                  <TextField
                    type="datetime-local"
                    name="validUntil"
                    value={formData.validUntil instanceof Date ? formData.validUntil.toISOString().slice(0, 16) : ''}
                    onChange={handleDateChange}
                    required
                    fullWidth
                    variant="outlined"
                    sx={fieldStyles}
                    error={!!validationErrors.validUntil}
                  />
                  {validationErrors.validUntil && (
                    <FormHelperText error>{validationErrors.validUntil}</FormHelperText>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}

      {tabIndex === 1 && (
        <Box>
          <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}><Inventory2Icon /></Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>Containers Applicables</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {Object.values(CONTAINER_TYPES).map((containerType) => (
                  <FormControlLabel
                    key={containerType}
                    control={
                      <Checkbox
                        checked={formData.applicableContainerTypes?.includes(containerType)}
                        onChange={() => handleContainerTypeChange(containerType)}
                        sx={{
                          '&.Mui-checked': {
                            color: '#1976d2',
                          },
                        }}
                      />
                    }
                    label={containerType}
                    sx={{
                      background: '#f8f9fa',
                      borderRadius: 2,
                      padding: '8px 16px',
                      border: '1px solid #e0e0e0',
                      margin: 0,
                      '&:hover': {
                        background: '#e3f2fd',
                        borderColor: '#1976d2',
                      },
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}><LocalShippingIcon /></Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>Ports</Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography sx={labelStyles}>Port de départ</Typography>
                  <AutoCompletePort
                    value={formData.departurePortId && formData.departurePortName ? {
                      portId: formData.departurePortId,
                      portName: formData.departurePortName,
                      country: ''
                    } : null}
                    onChange={value => {
                      setFormData(prev => ({
                        ...prev,
                        departurePortId: value ? value.portId : 0,
                        departurePortName: value ? value.portName : '',
                      }));
                    }}
                    placeholder="Sélectionner un port de départ (optionnel)"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography sx={labelStyles}>Port de destination</Typography>
                  <AutoCompletePort
                    value={formData.destinationPortId && formData.destinationPortName ? {
                      portId: formData.destinationPortId,
                      portName: formData.destinationPortName,
                      country: ''
                    } : null}
                    onChange={value => {
                      setFormData(prev => ({
                        ...prev,
                        destinationPortId: value ? value.portId : null,
                        destinationPortName: value ? value.portName : null,
                      }));
                    }}
                    placeholder="Sélectionner un port de destination (optionnel)"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}><InfoIcon /></Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>Conditions & Commentaire</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                  <Typography sx={labelStyles}>Conditions spéciales</Typography>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                      type="text"
                      value={specialCondition}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setSpecialCondition(e.target.value)}
                      placeholder="Ajouter une condition spéciale"
                      fullWidth
                      variant="outlined"
                      sx={fieldStyles}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={addSpecialCondition}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        height: 56,
                        minWidth: 120
                      }}
                    >
                      Ajouter
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.specialConditions?.map((condition, index) => (
                      <Chip
                        key={index}
                        label={condition.description || 'Condition spéciale'}
                        onDelete={() => removeSpecialCondition(index)}
                        sx={{
                          background: '#e3e9f7',
                          color: '#2c3e50',
                          '& .MuiChip-deleteIcon': {
                            color: '#e74c3c',
                            '&:hover': {
                              color: '#c0392b',
                            },
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12} md={12}>
                  <Typography sx={labelStyles}>Commentaire</Typography>
                  <TextField
                    name="comment"
                    value={formData.comment ?? ''}
                    onChange={handleInputChange}
                    rows={5}
                    fullWidth
                    multiline
                    variant="outlined"
                    sx={fieldStyles}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2 }}>
        <Button
          type="button"
          onClick={onCancel}
          disabled={loading}
          sx={{
            px: 5,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            fontSize: '1rem',
            background: '#bdc3c7',
            color: '#2c3e50',
            height: 48,
            '&:hover': {
              background: '#a7b0bb'
            }
          }}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={loading}
          variant="contained"
          sx={{
            px: 5,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            fontSize: '1rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            height: 48,
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 10px 20px rgba(102, 126, 234, 0.3)'
            }
          }}
          onClick={() => { console.log('[MiscellaneousForm] Bouton submit cliqué'); }}
        >
          {loading ? 'Enregistrement...' : (miscellaneous ? 'Mettre à jour' : 'Créer')}
        </Button>
      </Box>
    </form>
  );
};

export default MiscellaneousForm; 